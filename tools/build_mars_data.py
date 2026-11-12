#!/usr/bin/env python3
"""
Build the game's Mars data files from public NASA data.

Sources (downloaded into --cache, default ~/marsdata/raw, on first run):
  * MOLA MEGDR 32 px/deg gridded topography  (NASA PDS Geosciences Node, megt90n000fb.img)
  * Viking MDIM 2.1 colourised global mosaic (NASA Mars Trek WMTS tiles, zoom 5)

Outputs (static/martian/assets/mars/):
  height.bin   elevation as six cube faces, equi-angular, N x N plus a 2-texel border,
               quantised to Q metres, MED-predicted and deflated (see FORMAT below)
  color.jpg    true-colour albedo as a 3 x 2 atlas of six gnomonic cube faces (GPU cube map)
  map.jpg      equirectangular shaded-relief map for the in-game map screen (0..360 E)

Run:  /home/user/blender-venv/bin/python tools/build_mars_data.py   (needs numpy + pillow)

FORMAT of height.bin (little-endian):
  bytes 0..3   magic "MH01"
  u32          length of the JSON header that follows
  JSON         {"n":1024,"pad":2,"q":8,"faces":[{"lo":bytes,"hi":bytes} x 6],
                "rough":{"m":128,"pad":1,"sizes":[bytes x 6]}}
  then for each face two zlib streams: low bytes and high bytes of the zig-zagged residuals,
  then six zlib streams of roughness bytes, each (m+2*pad)^2, same face layout (see build_roughness).
  A face is (n+2*pad)^2 int16 samples, row-major. Residual = value - MED(left, up, up-left),
  where the first row predicts from the left and the first column from above.
  Height in metres above the MOLA areoid = sample * q.

Cube faces, in order +X, -X, +Y, -Y, +Z, -Z, use the OpenGL cube-map layout: for face
coordinates (sc, tc) in [-1, 1], with tc growing downward in the image,
  +X: ( 1, -tc, -sc)   -X: (-1, -tc,  sc)   +Y: ( sc, 1,  tc)
  -Y: ( sc, -1, -tc)   +Z: ( sc, -tc, 1)    -Z: (-sc, -tc, -1)
The game's axes: +Y is the north pole, longitude 0 is +X, east longitude grows toward -Z.
Height faces are equi-angular: sc = tan(s * pi/4) for a texel coordinate s in [-1, 1].
"""
import argparse
import json
import os
import struct
import subprocess
import sys
import zlib

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'static', 'martian', 'assets', 'mars')
MOLA_URL = 'https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg032/megt90n000fb.img'
TREK = 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm'
FACES = ['+X', '-X', '+Y', '-Y', '+Z', '-Z']


# ------------------------------------------------------------------------------------ sources
def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print('downloading', url)
    subprocess.run(['curl', '-sS', '--fail', '--retry', '5', '-m', '3600', '-o', path, url], check=True)


def load_mola(cache):
    path = os.path.join(cache, 'megt90n000fb.img')
    fetch(MOLA_URL, path)
    # 5760 rows x 11520 cols, big-endian int16, row 0 = 90N, col 0 = 0E, pixel centres at +0.5
    return np.fromfile(path, dtype='>i2').reshape(5760, 11520).astype(np.float32)


def load_viking(cache, zoom=5):
    mosaic = os.path.join(cache, f'viking_z{zoom}.png')
    if not os.path.exists(mosaic):
        rows, cols = 1 << zoom, 2 << zoom
        im = Image.new('RGB', (cols * 256, rows * 256))
        for y in range(rows):
            for x in range(cols):
                p = os.path.join(cache, 'viking', str(zoom), str(y), f'{x}.jpg')
                fetch(f'{TREK}/{zoom}/{y}/{x}.jpg', p)
                im.paste(Image.open(p), (x * 256, y * 256))
        im.save(mosaic)
    # row 0 = 90N, col 0 = 180W (so longitude east = x/W*360 - 180)
    return np.asarray(Image.open(mosaic).convert('RGB'))


# ------------------------------------------------------------------------------------ geometry
def face_dirs(face, sc, tc):
    one = np.ones_like(sc)
    x, y, z = {
        '+X': (one, -tc, -sc), '-X': (-one, -tc, sc),
        '+Y': (sc, one, tc), '-Y': (sc, -one, -tc),
        '+Z': (sc, -tc, one), '-Z': (-sc, -tc, -one),
    }[face]
    inv = 1.0 / np.sqrt(x * x + y * y + z * z)
    return x * inv, y * inv, z * inv


def dirs_to_latlon(x, y, z):
    lat = np.degrees(np.arcsin(np.clip(y, -1, 1)))
    lon = np.degrees(np.arctan2(-z, x)) % 360.0
    return lat, lon


def sample_equirect(grid, lat, lon, lon0=0.0):
    """Bilinear sample of an equirectangular grid (row 0 = 90N, col 0 = lon0 E, centres at +0.5)."""
    h, w = grid.shape[:2]
    fx = ((lon - lon0) % 360.0) / 360.0 * w - 0.5
    fy = (90.0 - lat) / 180.0 * h - 0.5
    x0 = np.floor(fx).astype(np.int64)
    y0 = np.clip(np.floor(fy).astype(np.int64), 0, h - 2)
    tx = (fx - x0).astype(np.float32)
    ty = np.clip(fy - y0, 0, 1).astype(np.float32)
    x1 = (x0 + 1) % w
    x0 %= w
    if grid.ndim == 3:
        tx, ty = tx[..., None], ty[..., None]
    a = grid[y0, x0] * (1 - tx) + grid[y0, x1] * tx
    b = grid[y0 + 1, x0] * (1 - tx) + grid[y0 + 1, x1] * tx
    return a * (1 - ty) + b * ty


# ------------------------------------------------------------------------------------ height
def zigzag(v):
    return ((v << 1) ^ (v >> 31)).astype(np.uint32)


def med_residuals(q):
    q = q.astype(np.int32)
    a = np.zeros_like(q); a[:, 1:] = q[:, :-1]          # left
    b = np.zeros_like(q); b[1:, :] = q[:-1, :]          # up
    c = np.zeros_like(q); c[1:, 1:] = q[:-1, :-1]       # up-left
    pred = np.where(c >= np.maximum(a, b), np.minimum(a, b),
                    np.where(c <= np.minimum(a, b), np.maximum(a, b), a + b - c))
    pred[0, :] = a[0, :]
    pred[:, 0] = b[:, 0]
    pred[0, 0] = 0
    return q - pred


def build_height(mola, n, pad, q, ss=3):
    size = n + 2 * pad
    faces, blobs = [], []
    idx = (np.arange(size * ss, dtype=np.float64) + 0.5) / ss - pad      # texel coordinate, 0..n
    s = 2.0 * idx / n - 1.0                                              # equi-angular coordinate
    w = np.tan(s * np.pi / 4)
    sc, tc = np.meshgrid(w, w)
    lo_all, hi_all = [], []
    for f in FACES:
        lat, lon = dirs_to_latlon(*face_dirs(f, sc, tc))
        h = sample_equirect(mola, lat, lon)
        h = h.reshape(size, ss, size, ss).mean(axis=(1, 3))
        grid = np.round(h / q).astype(np.int16)
        faces.append(grid)
        r = zigzag(med_residuals(grid))
        assert r.max() < 65536
        lo = zlib.compress((r & 0xFF).astype(np.uint8).tobytes(), 9)
        hi = zlib.compress((r >> 8).astype(np.uint8).tobytes(), 9)
        blobs += [lo, hi]
        lo_all.append(len(lo)); hi_all.append(len(hi))
        print(f'  height face {f}: {grid.min() * q:7d} .. {grid.max() * q:6d} m, {(len(lo) + len(hi)) / 1024:7.0f} kB')
    rough_blobs, m = build_roughness(mola, n)
    header = json.dumps({'n': n, 'pad': pad, 'q': q,
                         'faces': [{'lo': a, 'hi': b} for a, b in zip(lo_all, hi_all)],
                         'rough': {'m': m, 'pad': 1, 'sizes': [len(b) for b in rough_blobs]}}).encode()
    out = b'MH01' + struct.pack('<I', len(header)) + header + b''.join(blobs) + b''.join(rough_blobs)
    return out, faces


def build_roughness(mola, n, block=8):
    """Terrain roughness per coarse cell (block x block height texels): the mean absolute
    Laplacian of the real surface at texel spacing, log-compressed into a byte. The game scales
    its procedural small-scale relief and crater density by it, so cratered highlands come out
    rugged and the northern plains smooth, as they really are."""
    m = n // block
    size = (m + 2) * block
    idx = (np.arange(size, dtype=np.float64) + 0.5) - block               # height-texel coordinate
    w = np.tan((2.0 * idx / n - 1.0) * np.pi / 4)
    sc, tc = np.meshgrid(w, w)
    blobs = []
    for f in FACES:
        lat, lon = dirs_to_latlon(*face_dirs(f, sc, tc))
        h = sample_equirect(mola, lat, lon)
        lap = np.zeros_like(h)
        lap[1:-1, 1:-1] = np.abs(h[:-2, 1:-1] + h[2:, 1:-1] + h[1:-1, :-2] + h[1:-1, 2:] - 4 * h[1:-1, 1:-1])
        cell = lap.reshape(m + 2, block, m + 2, block).mean(axis=(1, 3))
        byte = np.clip(255 * np.log1p(cell / 8.0) / np.log1p(2000 / 8.0), 0, 255).astype(np.uint8)
        blobs.append(zlib.compress(byte.tobytes(), 9))
        print(f'  roughness face {f}: median {np.median(cell):6.1f} m, 90% {np.percentile(cell, 90):6.1f} m, max {cell.max():7.1f} m; byte median {int(np.median(byte))}')
    return blobs, m


# ------------------------------------------------------------------------------------ colour
def grade(rgb):
    """Light grade of the Viking mosaic toward ground-truth Mars: lift the blacks baked in by
    the mosaic's own shading, add a little saturation. Input and output are float 0..1 sRGB."""
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    out = lum[..., None] + (rgb - lum[..., None]) * 1.18
    out = 0.035 + out * 0.99
    return np.clip(out, 0, 1)


def build_color(viking, n, ss=2):
    atlas = Image.new('RGB', (3 * n, 2 * n))
    src = viking.astype(np.float32) / 255.0
    g = 2.0 * (np.arange(n * ss, dtype=np.float64) + 0.5) / (n * ss) - 1.0
    sc, tc = np.meshgrid(g, g)
    for i, f in enumerate(FACES):
        lat, lon = dirs_to_latlon(*face_dirs(f, sc, tc))
        c = sample_equirect(src, lat, lon, lon0=-180.0)
        c = c.reshape(n, ss, n, ss, 3).mean(axis=(1, 3))
        img = Image.fromarray((grade(c) * 255 + 0.5).astype(np.uint8))
        atlas.paste(img, ((i % 3) * n, (i // 3) * n))
    return atlas


def build_map(viking, mola, w=2880):
    h = w // 2
    col = np.asarray(Image.fromarray(viking).resize((w, h), Image.BOX), dtype=np.float32) / 255.0
    col = np.roll(col, w // 2, axis=1)                                   # 180W-origin -> 0E-origin
    f = mola.shape[1] // w
    dem = mola.reshape(h, f, w, f).mean(axis=(1, 3))
    # hillshade: light from the north-west, vertical exaggeration tuned for a readable atlas
    lat = np.radians(90 - (np.arange(h) + 0.5) / h * 180)[:, None]
    metres_per_px = 2 * np.pi * 3389500 / w
    dzdx = (np.roll(dem, -1, axis=1) - np.roll(dem, 1, axis=1)) / (2 * metres_per_px * np.maximum(np.cos(lat), 0.08))
    dzdy = np.zeros_like(dem)
    dzdy[1:-1] = (dem[:-2] - dem[2:]) / (2 * metres_per_px)
    z = 14.0
    nx, ny, nz = -dzdx * z, -dzdy * z, np.ones_like(dem)
    inv = 1 / np.sqrt(nx * nx + ny * ny + nz * nz)
    shade = (nx * -0.5 + ny * 0.5 + nz * 0.707) * inv
    shade = np.clip(0.55 + 0.75 * (shade - 0.4), 0.35, 1.3)[..., None]
    out = np.clip(grade(col) * 1.08 * shade, 0, 1)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8))


# ------------------------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.expanduser('~/marsdata/raw'))
    ap.add_argument('--n', type=int, default=1024, help='height face size (texels)')
    ap.add_argument('--q', type=int, default=8, help='height quantisation (metres)')
    ap.add_argument('--color-n', type=int, default=1024)
    ap.add_argument('--only', default='height,color,map')
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    only = args.only.split(',')
    mola = load_mola(args.cache)
    print('MOLA', mola.shape, 'range', mola.min(), mola.max())
    if 'height' in only:
        blob, _ = build_height(mola, args.n, 2, args.q)
        with open(os.path.join(OUT, 'height.bin'), 'wb') as fh:
            fh.write(blob)
        print(f'height.bin {len(blob) / 1e6:.2f} MB')
    if 'color' in only or 'map' in only:
        viking = load_viking(args.cache)
        print('Viking mosaic', viking.shape)
        if 'color' in only:
            atlas = build_color(viking, args.color_n)
            p = os.path.join(OUT, 'color.jpg')
            atlas.save(p, quality=84, optimize=True, progressive=True, subsampling='4:2:0')
            print(f'color.jpg {os.path.getsize(p) / 1e6:.2f} MB')
        if 'map' in only:
            m = build_map(viking, mola)
            p = os.path.join(OUT, 'map.jpg')
            m.save(p, quality=82, optimize=True, progressive=True)
            print(f'map.jpg {os.path.getsize(p) / 1e6:.2f} MB')


if __name__ == '__main__':
    main()
