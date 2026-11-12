#!/usr/bin/env python3
"""
Build the app icons from the game's own Mars atlas: the real planet, seen from orbit over
Valles Marineris, lit from the upper left.

  python3 tools/build_icons.py        (needs numpy + pillow)

Writes static/martian/icon-512.png and icon-192.png. The planet sits inside the central 80%
of the square, so the same files work as "maskable" icons (Android crops to a circle or
squircle) and as the iOS home-screen icon.
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(os.path.dirname(HERE), 'static', 'martian')
N = 1024                       # render size; the icons are downsampled from it
RADIUS = 0.66                  # planet radius as a fraction of the half-width
LON0, LAT0 = 292.0, -6.0       # sub-observer point: Valles Marineris, Tharsis to the west
BG = np.array([10, 8, 7], dtype=np.float64) / 255


def render():
    atlas = np.asarray(Image.open(os.path.join(GAME, 'assets', 'mars', 'map.jpg')).convert('RGB'), dtype=np.float64) / 255
    ah, aw, _ = atlas.shape
    ys, xs = np.mgrid[0:N, 0:N]
    x = (xs + 0.5) / N * 2 - 1
    y = 1 - (ys + 0.5) / N * 2
    r = np.sqrt(x * x + y * y) / RADIUS
    inside = r < 1
    nx, ny = x / RADIUS, y / RADIUS
    nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0, 1))
    lat0, lon0 = np.radians(LAT0), np.radians(LON0)
    # rotate the view vector into planet coordinates (orthographic projection)
    lat = np.arcsin(np.clip(ny * np.cos(lat0) + nz * np.sin(lat0), -1, 1))
    lon = lon0 + np.arctan2(nx, nz * np.cos(lat0) - ny * np.sin(lat0))
    u = (np.degrees(lon) % 360) / 360 * aw
    v = (90 - np.degrees(lat)) / 180 * ah
    u0 = np.floor(u - 0.5).astype(int)
    v0 = np.clip(np.floor(v - 0.5).astype(int), 0, ah - 2)
    fu = (u - 0.5 - u0)[..., None]
    fv = np.clip(v - 0.5 - v0, 0, 1)[..., None]
    a = atlas[v0, u0 % aw] * (1 - fu) + atlas[v0, (u0 + 1) % aw] * fu
    b = atlas[v0 + 1, u0 % aw] * (1 - fu) + atlas[v0 + 1, (u0 + 1) % aw] * fu
    albedo = a * (1 - fv) + b * fv
    # light: sun to the upper left; a soft terminator and a little limb darkening
    L = np.array([-0.55, 0.42, 0.72])
    L = L / np.linalg.norm(L)
    ndl = nx * L[0] + ny * L[1] + nz * L[2]
    lit = np.clip((ndl + 0.12) / 1.12, 0, 1) ** 0.85
    limb = 0.72 + 0.28 * nz ** 0.6
    col = albedo ** 0.92 * (0.03 + 1.62 * lit)[..., None] * limb[..., None]
    # an icon is seen small: a little more colour and warmth than the atlas
    grey = col.mean(axis=2, keepdims=True)
    col = (grey + (col - grey) * 1.3) * np.array([1.08, 0.97, 0.9])
    out = np.empty((N, N, 3))
    out[:] = BG
    # thin warm atmosphere just outside the limb, on the lit side
    glow = np.clip(1 - (r - 1) / 0.07, 0, 1) ** 2.2 * np.clip((x * L[0] + y * L[1]) / RADIUS * 0.9 + 0.45, 0, 1)
    out += (glow * (r >= 1))[..., None] * np.array([0.95, 0.62, 0.38]) * 0.55
    # anti-aliased edge
    edge = np.clip((1 - r) * RADIUS * N / 2, 0, 1)[..., None]
    out = out * (1 - edge) + np.clip(col, 0, 1) * edge
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')


if __name__ == '__main__':
    big = render()
    for size in (512, 192):
        path = os.path.join(GAME, f'icon-{size}.png')
        big.resize((size, size), Image.LANCZOS).save(path, optimize=True)
        print(path, os.path.getsize(path), 'bytes')
