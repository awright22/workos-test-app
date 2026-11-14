"""
Stranded II mineral deposits (Base mode), authored headlessly in Blender through tools/assets/lib.py
with the helpers of props.py:

    dep_hematite  dep_silica  dep_clay  dep_sulfate  dep_salt

Run:   /home/user/blender-venv/bin/python tools/assets/deposits.py [names ...]     (no names = all)
Look:  node tools/assets/preview.mjs dep_hematite ...
       PROPS_FAST=1 skips the ambient-occlusion bake while blocking a model out.

What they are (static/martian/src/game/base.js says where each lies on Mars, and why):
  dep_hematite  a pavement of pale bedrock plates strewn with grey beads of hematite ("blueberries")
  dep_silica    a mound of white knobbly silica: a dead hot spring's crust
  dep_clay      a low bank of banded mudstone, steep along its front, its top cracked into plates
  dep_sulfate   a small butte of pale beds, taller than a man, with thin white beds of gypsum round it
  dep_salt      a dried pan of salt heaved into polygons with raised white rims

Each is a thing a man walks up to and works, six or seven metres across, on ground the game has levelled (and
leaves untrodden). None has a hem of drifted soil: each is rock that goes into the ground at its own edge, and the
ground it goes into is the terrain itself, ripples and all. (A hem in `ground_dust` is the colour of packed soil,
right round a lander on trodden ground and a dark stain on open sand.)
(They were first built of stacked slabs and loose stones, and read as toys: a pile of plates, a honeycomb. Now
bedded rock is a surface cut into steps along its beds, and what cracks is cracked as rock and crust do crack.) Each
carries six loose pieces in front of it, `block_0` .. `block_5` (origin on the ground under each), which the game
takes away as the deposit is worked. The mineral itself is the material `mineral` (matte) or `mineral_sheen`
(the hematite beads: grey and a little bright), white in itself, with the colour painted on its vertices.

(Colours are darker than the minerals are. The game's exposure is set for red ground under a butterscotch sky, and
anything much paler than the ground washes out to white there: see the ice outcrop in props.py.)

Axes follow SPEC.md: metres, Z up, the FRONT of a model faces -Y, origin on the ground.
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import props  # noqa: E402  (imports lib, and through it bpy, before bmesh/mathutils)
from props import *  # noqa: E402,F401,F403
from props import _smooth01  # noqa: E402

cos, sin, pi, sqrt = math.cos, math.sin, math.pi, math.sqrt


# ==============================================================================================
# Helpers
# ==============================================================================================
def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def minerals():
    ground_dust()
    mat('mineral', color=(1.0, 1.0, 1.0), metallic=0.0, roughness=0.95)
    mat('mineral_sheen', color=(1.0, 1.0, 1.0), metallic=0.25, roughness=0.42)


def patch(name, root, half, n, hfun, cfun, P, centre=(0.0, 0.0), cut=-0.03, smooth=42.0, material='mineral'):
    """Rock as a surface: a square of ground `2 * half` across about `centre`, n by n quads, raised to hfun(x, y).
    Where that is below `cut` there is nothing (the ground covers it). cfun(x, y, h) is the colour of a vertex.
    Stepped strata, worn knobs and mounds are all height functions; nothing made this way overhangs."""
    bm = bm_new()
    cx, cy = centre
    hs = {}
    for i in range(n + 1):
        for j in range(n + 1):
            hs[i, j] = hfun(cx - half + 2.0 * half * i / n, cy - half + 2.0 * half * j / n)
    vs = {}
    for i in range(n):
        for j in range(n):
            q4 = ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))
            if all(hs[q] <= cut for q in q4):
                continue
            for q in q4:
                if q not in vs:
                    x, y = cx - half + 2.0 * half * q[0] / n, cy - half + 2.0 * half * q[1] / n
                    v = bm.verts.new((x, y, max(hs[q], cut)))
                    P.add(v.co, cfun(x, y, hs[q]))
                    vs[q] = v
            bm.faces.new([vs[q] for q in q4])
    if os.environ.get('TRIS'):
        print(f'    {name:28s} {len(bm.faces) * 2:6d}')
    return mesh_obj(name, bm, material, parent=root, smooth_angle=smooth)


def strata(rng, top, thin, thick, colours, seam=None, every=4):
    """Beds from the ground up to `top`: [(z0, z1, colour)], each `thin`..`thick` m, coloured in turn from
    `colours`; with `seam` (a colour), every `every`-th is a thin bed of that."""
    beds, z, k = [], 0.0, 0
    while z < top:
        if seam is not None and k % every == every - 2:
            th, col = rng.uniform(0.09, 0.12), seam
        else:
            th, col = rng.uniform(thin, thick), colours[k % len(colours)]
            col = mix(col, colours[(k + 1) % len(colours)], 0.35 * rng.random())
        beds.append((z, z + th, col))
        z += th
        k += 1
    return beds


def terrace(beds, h, riser=0.5):
    """A slope cut into steps along its beds: (height, bed index, t) for a raw height h. A bed's lower part
    (t below `riser`) is the tread at its foot, the top of the bed under it; the rest is its own face."""
    if h <= 0.0:
        return h, 0, 0.0
    for k, (z0, z1, _) in enumerate(beds):
        if h < z1:
            t = (h - z0) / (z1 - z0)
            return z0 + (z1 - z0) * _smooth01(riser, 1.0, t), k, t
    return beds[-1][1], len(beds) - 1, 1.0


def vcells(cell, seed, inside, jitter=0.4, span=7):
    """The cells of a Voronoi diagram on a jittered grid whose own points are `inside(x, y)`:
    [(polygon as Vectors, counter-clockwise, (px, py), (i, j))]. Cracked rock and dried crusts break like this:
    irregular polygons of four to seven sides, no two alike."""
    def pt(i, j):
        return ((i + 0.5 + (hash01(i, j, seed) - 0.5) * 2 * jitter) * cell, (j + 0.5 + (hash01(i, j, seed + 7.0) - 0.5) * 2 * jitter) * cell)
    out = []
    for i in range(-span, span):
        for j in range(-span, span):
            px, py = pt(i, j)
            if not inside(px, py):
                continue
            h = 1.6 * cell
            poly = [Vector((px - h, py - h, 0)), Vector((px + h, py - h, 0)), Vector((px + h, py + h, 0)), Vector((px - h, py + h, 0))]
            for a in range(i - 2, i + 3):
                for b in range(j - 2, j + 3):
                    if (a, b) == (i, j) or len(poly) < 3:
                        continue
                    qx, qy = pt(a, b)
                    nrm = Vector((px - qx, py - qy, 0.0))
                    poly = clip_poly(poly, nrm, nrm.dot(Vector(((px + qx) / 2, (py + qy) / 2, 0.0))))
            if len(poly) >= 3:
                out.append((poly, (px, py), (i, j)))
    return out


def vor(x, y, cell, seed, jitter=0.4):
    """Where (x, y) lies among the same cells as vcells(): (distance to the nearest joint between cells, the cell's
    (i, j), the cell's own point)."""
    gi, gj = math.floor(x / cell), math.floor(y / cell)
    d1 = d2 = 1e18
    p1 = p2 = best = None
    for i in range(gi - 2, gi + 3):
        for j in range(gj - 2, gj + 3):
            px = (i + 0.5 + (hash01(i, j, seed) - 0.5) * 2 * jitter) * cell
            py = (j + 0.5 + (hash01(i, j, seed + 7.0) - 0.5) * 2 * jitter) * cell
            d = (x - px) ** 2 + (y - py) ** 2
            if d < d1:
                d2, p2 = d1, p1
                d1, p1, best = d, (px, py), (i, j)
            elif d < d2:
                d2, p2 = d, (px, py)
    nx, ny = p2[0] - p1[0], p2[1] - p1[1]
    nl = math.hypot(nx, ny) or 1.0
    return (((p1[0] + p2[0]) / 2 - x) * nx + ((p1[1] + p2[1]) / 2 - y) * ny) / nl, best, p1


def chunk(bm, r, size, flat, at, P, col, rough=0.24):
    """A broken piece lying on the ground at `at` (the mesh's origin is there): a rough stone `size` across and
    `flat` times as high as it is wide, its underside pressed flat. col(zf, co) colours it by height."""
    vs = rock(bm, size, (0.0, 0.0, size * flat * 0.62), seed=r.randint(0, 10 ** 6), scale=(r.uniform(1.0, 1.25), r.uniform(0.75, 0.95), flat), subdiv=2, rough=rough)
    o = Vector(at)
    top = max(v.co.z for v in vs)
    for v in vs:
        v.co.z = max(v.co.z, -0.03)
        P.add(o + v.co, col(max(0.0, v.co.z) / max(1e-4, top), o + v.co))
    return vs


def drawn_in(poly, c, gap):
    """A convex polygon with every corner moved `gap` toward the point c."""
    out = []
    for p in poly:
        d = Vector((c[0] - p.x, c[1] - p.y, 0.0))
        out.append(p + d * min(0.45, gap / max(1e-4, d.length)))
    return out


def plate(bm, poly, c, z0, z1, P, col, top_in=0.94, tilt=(0.0, 0.0), at=(0.0, 0.0, 0.0)):
    """A slab on a polygon: its foot at z0, its top at z1 drawn in a little and tipped by `tilt` (rise per metre).
    col(zf, co) colours a vertex from its height in the slab (0 foot, 1 top) and its place in the model."""
    pts = []
    for p in poly:
        pts.append((p.x, p.y, z0))
        x, y = c[0] + (p.x - c[0]) * top_in, c[1] + (p.y - c[1]) * top_in
        pts.append((x, y, z1 + (x - c[0]) * tilt[0] + (y - c[1]) * tilt[1]))
    o = Vector(at)
    for q in pts:
        P.add(o + Vector(q), col((q[2] - z0) / max(1e-4, z1 - z0), o + Vector(q)))
    return hull(bm, pts)


def lump(bm, r, size, loc, P, col, squash=0.7, rough=0.2, subdiv=2):
    """A rounded lump (a stone), coloured by `col(zf, co)` from its height in itself."""
    vs = rock(bm, size, loc, seed=r.randint(0, 10 ** 6), scale=(r.uniform(0.9, 1.2), r.uniform(0.8, 1.1), squash), subdiv=subdiv, rough=rough)
    zs = [v.co.z for v in vs]
    lo, hi = min(zs), max(zs)
    for v in vs:
        P.add(v.co, col((v.co.z - lo) / max(1e-4, hi - lo), v.co))
    return vs


def make_tint(paints, base, drift=None, floor=0.42):
    """The model's tint function: painted colours multiplied by the baked shade (never darker than `floor` of the
    colour: a mineral lying in the open is lit from the whole sky), and the drift's own for the ground."""
    def tint(co, name, a):
        if name == 'ground_dust':
            return drift(co, a) if drift else None
        P = paints.get(name)
        rgb = (P.at(co, 0.035) if P else None) or base
        k = floor + (1.0 - floor) * a * (1.0 + 0.05 * noise3(co, 5.0, 0.3))
        return tuple(min(1.0, k * c) for c in rgb)
    return tint


def loose(root, k, at, build, material='mineral', smooth=30.0, bevel=0.0):
    """One of the six loose pieces the game takes: `build(bm, at)` fills a mesh whose origin is on the ground at `at`
    (and paints its colours where the piece stands in the model)."""
    node = part(f'block_{k}', parent=root, loc=(at[0], at[1], 0))
    bm = bm_new()
    build(bm, (at[0], at[1], 0.0))
    if os.environ.get('TRIS'):
        print(f'    block_{k} {sum(len(f.verts) - 2 for f in bm.faces):6d}')
    mesh_obj(f'block_{k}.{material}', bm, material, parent=node, smooth_angle=smooth, bevel=bevel, bevel_segments=2)
    return node


FRONT = ((-2.6, -2.85), (-1.45, -3.45), (-0.65, -2.95), (0.55, -3.5), (1.35, -2.9), (2.55, -3.3))    # where the six loose pieces lie: not in a row


# ==============================================================================================
# dep_hematite.glb
# ==============================================================================================
def build_dep_hematite():
    """Hematite as Opportunity found it at Meridiani: a pavement of pale, finely bedded rock, cracked into polygons
    and all but level with the soil, and over it and in its joints the grey beads that weathered out of it, by the
    thousand. The beads are what he wants: nearly pure iron oxide. They lie thickest in the joints, and six heaps
    of them have been raked together along the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_hematite')
    rng = random.Random(41)
    PM, PS = Paint(), Paint()
    BUFF, PALE, SEAM, STAIN, DUSTY = (0.40, 0.31, 0.22), (0.47, 0.385, 0.285), (0.24, 0.175, 0.125), (0.30, 0.20, 0.14), (0.42, 0.27, 0.17)
    BEAD, BEAD_HI = (0.10, 0.11, 0.135), (0.165, 0.175, 0.205)
    CX, CY = 0.0, 0.35

    def reach(x, y):                                                          # 0 at the middle of the pavement, 1 at its edge
        d = sqrt(((x - CX) / 3.5) ** 2 + ((y - CY) / 2.8) ** 2)
        return d * (1.0 + 0.16 * noise3((x, y, 0.0), 0.8, 4.0) + 0.07 * noise3((x, y, 0.0), 2.1, 8.0))

    cells = {}

    def cell(x, y):
        k = (round(x, 4), round(y, 4))
        if k not in cells:
            cells[k] = vor(x, y, 0.84, 3.0, 0.42)
        return cells[k]

    def plate_of(ij, p):
        """A plate of the pavement: (how proud of the soil it stands, its tilt, its tone); gone altogether here and there."""
        gone = hash01(ij[0], ij[1], 11.0) < 0.06 + 0.75 * _smooth01(0.62, 0.98, reach(*p))
        return (0.0 if gone else 0.04 + 0.045 * hash01(ij[0], ij[1], 6.0), (hash01(ij[0], ij[1], 7.0) - 0.5) * 0.045, (hash01(ij[0], ij[1], 8.0) - 0.5) * 0.045, hash01(ij[0], ij[1], 5.0))

    def hf(x, y):
        r_ = reach(x, y)
        if r_ >= 1.0:
            return -0.5 * (r_ - 1.0) - 0.02
        edge, ij, p = cell(x, y)
        proud, tx, ty, _ = plate_of(ij, p)
        top = (proud + (x - p[0]) * tx + (y - p[1]) * ty) + 0.006 * noise3((x, y, 0.0), 4.5, 2.0) if proud > 0.0 else 0.0
        # (the joints lie under the ground, which is the terrain's own sand: only the plates stand out of it. A plate
        #  is flat to its edge and drops there: drawn rounded over, the pavement was a quilt of cushions.)
        return -0.03 + (max(0.0, top) + 0.03) * _smooth01(0.03, 0.075, edge) ** 0.5 if top > 0.0 else -0.03

    def cf(x, y, h):
        edge, ij, p = cell(x, y)
        tone = plate_of(ij, p)[3]
        cc = mix(BUFF, PALE, 0.75 * tone + 0.25 * (0.5 + 0.5 * noise3((x, y, 0.0), 1.7, 6.0)))
        cc = mix(cc, DUSTY, 0.45 * _smooth01(0.1, 0.7, 0.5 + 0.5 * noise3((x, y, 0.0), 2.6, 9.0)))       # dust lies on it in patches
        cc = mix(cc, SEAM, 0.55 * (1.0 - _smooth01(0.06, 0.13, edge)))                                     # its worn edges are darker
        return mix(STAIN, cc, _smooth01(0.0, 0.035, h))
    patch('pavement.rock', root, 3.9, 112, hf, cf, PM, centre=(CX, CY), smooth=50.0)

    # ---- the beads: a scatter on every plate, and thick in the joints ----
    K = Kit('pavement', root)
    BEADS = K.bm('mineral_sheen', smooth=50.0)

    def bead(x, y, z, s):
        vs = bmesh.ops.create_icosphere(BEADS, subdivisions=1, radius=s)['verts']
        bmesh.ops.transform(BEADS, matrix=T(x, y, z), verts=vs)
        cc = mix(BEAD, BEAD_HI, rng.random())
        for v in vs:
            PS.add(v.co, cc)

    made = 0
    while made < 210:
        a, d = rng.uniform(0, TAU), sqrt(rng.random())
        x, y = CX + 3.4 * d * cos(a), CY + 2.7 * d * sin(a)
        if reach(x, y) > 0.97:
            continue
        edge = cell(x, y)[0]
        if edge > 0.07 and rng.random() > 0.3:                                 # most lie in the joints
            continue
        r_ = rng.uniform(0.016, 0.03)
        bead(x, y, max(0.0, hf(x, y)) + r_ * 0.55, r_)
        made += 1
    K.finish()

    # ---- six heaps raked together along the front: the game takes these ----
    for k, (sx, sy) in enumerate(FRONT):
        rk = random.Random(500 + k)

        def heap(bm, at, rk=rk, k=k):
            o = Vector(at)
            n, rr, hh = 16, rk.uniform(0.28, 0.36), rk.uniform(0.09, 0.13)
            top = bm.verts.new((0, 0, hh))
            PS.add(o + top.co, BEAD)
            rings = []
            for j in range(1, 5):
                t = j / 4.0
                ring = []
                for i in range(n):
                    a = TAU * i / n
                    q = rr * t * (1.0 + 0.12 * noise3((cos(a), sin(a), k), 2.0, k))
                    v = bm.verts.new((q * cos(a), q * sin(a), max(0.006, hh * (1.0 - t) ** 1.3)))
                    PS.add(o + v.co, mix(BEAD, BEAD_HI, 0.3 * rk.random()))
                    ring.append(v)
                rings.append(ring)
            for i in range(n):
                bm.faces.new((top, rings[0][i], rings[0][(i + 1) % n]))
            for j in range(3):
                for i in range(n):
                    bm.faces.new((rings[j][i], rings[j + 1][i], rings[j + 1][(i + 1) % n], rings[j][(i + 1) % n]))
            for _ in range(30):                                             # beads standing out of it, and spilt round it
                a, d = rk.uniform(0, TAU), rr * 1.25 * sqrt(rk.random())
                s = rk.uniform(0.018, 0.03)
                z = max(0.0, hh * (1.0 - min(1.0, d / rr)) ** 1.3) + s * 0.35
                vs = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=s)['verts']
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), z), verts=vs)
                cc = mix(BEAD, BEAD_HI, rk.random())
                for v in vs:
                    PS.add(o + v.co, cc)
        loose(root, k, (sx, sy), heap, material='mineral_sheen', smooth=50.0)

    return finish(root, 'dep_hematite', samples=32, distance=0.5, tint=make_tint({'mineral': PM, 'mineral_sheen': PS}, BUFF, None, floor=0.5))


# ==============================================================================================
# dep_silica.glb
# ==============================================================================================
def build_dep_silica():
    """Opaline silica, as Spirit found it beside Home Plate: the crust a hot spring left, nearly pure white, grown
    in knobs upon knobs like cauliflower, a low mound of it standing out of the soil. Six lumps have been broken
    out along the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_silica')
    rng = random.Random(52)
    PM = Paint()
    WHITE, CREAM, CREASE, STAIN = (0.58, 0.565, 0.53), (0.50, 0.44, 0.34), (0.36, 0.29, 0.22), (0.36, 0.26, 0.18)
    CX, CY = 0.0, 0.6

    def reach(x, y):
        d = sqrt(((x - CX) / 2.9) ** 2 + ((y - CY) / 2.3) ** 2)
        return d * (1.0 + 0.18 * noise3((x, y, 0.0), 0.9, 2.0) + 0.08 * noise3((x, y, 0.0), 2.3, 6.0))

    def mound(x, y):
        p = 1.0 - reach(x, y)
        return 0.40 * _smooth01(0.0, 0.8, p) ** 1.3 - 0.03 if p > 0 else 0.5 * p - 0.03

    # the knobs: three crowded heads and a scatter between, each a dome sunk a third into the mound
    knobs = []
    for (hx, hy, spread, n, big) in ((-0.3, 1.0, 1.05, 44, 0.34), (1.45, 0.25, 0.8, 26, 0.27), (-1.6, 0.2, 0.75, 22, 0.25)):
        for i in range(n):
            a, d = rng.uniform(0, TAU), spread * sqrt(rng.random())
            r_ = big * rng.uniform(0.35, 1.0) * (1.0 - 0.45 * d / spread)
            knobs.append((hx + d * cos(a), hy + d * sin(a) * 0.85, r_, rng.uniform(0.8, 1.5)))
    for i in range(60):
        a, d = rng.uniform(0, TAU), 2.4 * sqrt(rng.random())
        x, y = CX + d * cos(a), CY + d * sin(a) * 0.8
        if reach(x, y) < 0.8:
            knobs.append((x, y, rng.uniform(0.09, 0.18), rng.uniform(0.7, 1.2)))

    def knob_h(x, y):
        best = -1.0
        for (kx, ky, r_, sq) in knobs:
            d2 = (x - kx) ** 2 + (y - ky) ** 2
            if d2 < r_ * r_:
                best = max(best, mound(kx, ky) - 0.32 * r_ * sq + sq * sqrt(r_ * r_ - d2))
        return best

    def hf(x, y):
        m = mound(x, y)
        if m <= -0.03:
            return m
        pit = 0.022 * noise3((x, y, 0.0), 7.0, 3.0) + 0.012 * noise3((x, y, 0.0), 13.0, 8.0)          # old sinter is pitted
        return max(m + pit, knob_h(x, y) + pit)

    def cf(x, y, h):
        m = mound(x, y)
        up = h - m                                                            # how far a knob stands out of the mound here
        cc = mix(mix(CREASE, CREAM, _smooth01(-0.01, 0.045, up)), WHITE, _smooth01(0.03, 0.13, up) * (0.75 + 0.25 * noise3((x, y, 0.0), 4.0, 1.0)))
        return mix(cc, STAIN, 0.85 * _smooth01(0.5, 0.95, reach(x, y)) * (1.0 - 0.6 * _smooth01(0.03, 0.12, up)))
    patch('bed.crust', root, 3.4, 116, hf, cf, PM, centre=(CX, CY), smooth=55.0)
    anchor('col_bed_m', root, loc=(-0.3, 1.0, 0), radius=1.0)

    # ---- broken lumps lying about it ----
    K = Kit('bed', root)
    NOD = K.bm('mineral', smooth=36.0)

    def lcol(zf, co):
        return mix(mix(CREAM, WHITE, _smooth01(0.2, 0.8, zf)), STAIN, 0.6 * (1.0 - _smooth01(0.0, 0.2, zf)))
    for _ in range(46):
        a, d = rng.uniform(0, TAU), 1.9 + 1.5 * sqrt(rng.random())
        s = rng.uniform(0.04, 0.10)
        lump(NOD, rng, s, (CX + d * cos(a) * 1.1, CY + d * sin(a) * 0.85, s * 0.4), PM, lcol, squash=0.75, rough=0.3, subdiv=1 if s < 0.07 else 2)
    K.finish()

    # ---- six lumps broken out along the front: the game takes these ----
    for k, (sx, sy) in enumerate(FRONT):
        rk = random.Random(600 + k)

        def lumps(bm, at, rk=rk):
            vs = chunk(bm, rk, rk.uniform(0.2, 0.26), rk.uniform(0.6, 0.8), at, PM, lcol, rough=0.3)
            for i in range(rk.randint(1, 2)):                                  # and what broke off it
                a, d = rk.uniform(0, TAU), rk.uniform(0.3, 0.42)
                o2 = (at[0] + d * cos(a), at[1] + d * sin(a), 0.0)
                more = chunk(bm, rk, rk.uniform(0.08, 0.13), 0.7, o2, PM, lcol, rough=0.3)
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy + 0.25), lumps, smooth=36.0)

    return finish(root, 'dep_silica', samples=32, distance=0.5, tint=make_tint({'mineral': PM}, WHITE, None, floor=0.5))


# ==============================================================================================
# dep_clay.glb
# ==============================================================================================
def build_dep_clay():
    """Clay as it lies at Mawrth Vallis: a low bank of mudstone in bands, pale and bluish over tan and rust, cut
    steep along its front where the beds show as stripes, and running back gently into the ground behind. Its top
    has dried and cracked into plates. Six cut plates lie stacked along the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_clay')
    rng = random.Random(63)
    PM = Paint()
    RUST, TAN, BLUE, PALE, BLUE2, CREAM = (0.43, 0.20, 0.11), (0.47, 0.34, 0.20), (0.26, 0.29, 0.34), (0.51, 0.45, 0.36), (0.36, 0.39, 0.43), (0.53, 0.48, 0.39)
    STAIN, DUSTY, CRACK = (0.30, 0.20, 0.14), (0.41, 0.27, 0.17), (0.20, 0.145, 0.11)
    CX, CY, TOP = 0.0, 0.5, 1.12
    beds = strata(rng, TOP, 0.19, 0.26, (RUST, PALE, BLUE, TAN, BLUE2, CREAM))
    top = beds[-1][1]

    def reach(x, y):
        dy = (y - CY) / (1.75 if y < CY else 2.3)                             # a face to the front, a longer back
        d = sqrt(((x - CX) / 3.5) ** 2 + dy ** 2)
        return d * (1.0 + 0.14 * noise3((x, y, 0.0), 0.8, 5.0) + 0.06 * noise3((x, y, 0.0), 2.2, 1.0))

    def raw(x, y):
        p = 1.0 - reach(x, y)
        if p <= 0.0:
            return 0.5 * p
        return (top + 0.02) * _smooth01(0.0, 0.66, p) + 0.04 * noise3((x, y, 0.0), 3.2, 7.0) * _smooth01(0.0, 0.2, p)

    def hf(x, y):
        return terrace(beds, raw(x, y), 0.42)[0]

    def cf(x, y, h):
        hh, k, t = terrace(beds, h, 0.42)
        if h <= 0.0:
            return STAIN
        below = beds[max(0, k - 1)][2]
        face = mix(beds[k][2], mix(beds[k][2], (0.55, 0.50, 0.45), 0.3), 0.5 + 0.5 * noise3((x, y, hh), 3.0, 2.0))
        tread = mix(below, DUSTY, 0.45)                                        # dust lies on every ledge
        cc = mix(tread, face, _smooth01(0.30, 0.50, t))
        cc = mix(cc, CRACK, 0.3 * _smooth01(0.34, 0.42, t) * (1.0 - _smooth01(0.42, 0.55, t)))      # the joint where a bed sits on the one below
        return mix(cc, STAIN, 0.7 * (1.0 - _smooth01(0.0, 0.12, hh)))
    patch('bank.beds', root, 4.0, 120, hf, cf, PM, centre=(CX, CY + 0.3), smooth=42.0)

    # ---- the top bed, dried and cracked into plates ----
    K = Kit('bank', root)
    TOPS = K.bm('mineral', smooth=30.0)
    for poly, c, ij in vcells(0.36, 9.0, lambda x, y: raw(x, y) > top + 0.004, jitter=0.4, span=12):
        tone = hash01(ij[0], ij[1], 4.0)

        def col(zf, co, tone=tone):
            return mix(mix(mix(CREAM, BLUE2, 0.35 * tone), DUSTY, 0.3 * tone), CRACK, 0.55 * (1.0 - _smooth01(0.2, 0.8, zf)))
        plate(TOPS, drawn_in(poly, c, 0.022), c, top - 0.02, top + 0.03 + 0.02 * tone, PM, col, top_in=0.9,
              tilt=((hash01(ij[0], ij[1], 5.0) - 0.5) * 0.12, (hash01(ij[0], ij[1], 6.0) - 0.5) * 0.12))
    # ---- plates that have slid off its face ----
    SCREE = K.bm('mineral', bevel=0.008, smooth=30.0)
    for i in range(18):
        x, y = rng.uniform(-3.1, 3.1), CY - rng.uniform(1.75, 2.3)
        s = rng.uniform(0.10, 0.22)
        base = rng.choice((RUST, TAN, BLUE, PALE, BLUE2))
        poly = [Vector((x + s * rng.uniform(0.75, 1.1) * cos(TAU * j / 5 + i), y + s * 0.75 * rng.uniform(0.75, 1.1) * sin(TAU * j / 5 + i), 0.0)) for j in range(5)]
        plate(SCREE, poly, (x, y), -0.02, rng.uniform(0.035, 0.07), PM, lambda zf, co, base=base: mix(STAIN, base, _smooth01(0.0, 0.6, zf)), top_in=0.88, tilt=(rng.uniform(-0.2, 0.2), rng.uniform(-0.2, 0.2)))
    K.finish()
    anchor('col_bank_l', root, loc=(-1.7, 0.6, 0), radius=1.0)
    anchor('col_bank_m', root, loc=(0.0, 0.7, 0), radius=1.3)
    anchor('col_bank_r', root, loc=(1.7, 0.6, 0), radius=1.0)

    # ---- six cut plates along the front: the game takes these ----
    for k, (sx, sy) in enumerate(FRONT):
        rk = random.Random(700 + k)

        def stack(bm, at, rk=rk, k=k):
            base = beds[(k * 2) % len(beds)][2]
            col = lambda zf, co, base=base: mix(mix(base, CRACK, 0.45), base, _smooth01(0.0, 0.45, zf))      # noqa: E731
            chunk(bm, rk, rk.uniform(0.3, 0.38), rk.uniform(0.3, 0.4), at, PM, col, rough=0.16)
            if rk.random() < 0.7:                                              # a smaller one fallen by it
                a, d = rk.uniform(0, TAU), rk.uniform(0.42, 0.55)
                o2 = (at[0] + d * cos(a), at[1] + d * sin(a), 0.0)
                base2 = beds[(k * 2 + 3) % len(beds)][2]
                more = chunk(bm, rk, rk.uniform(0.14, 0.2), 0.35, o2, PM, lambda zf, co, base2=base2: mix(mix(base2, CRACK, 0.45), base2, _smooth01(0.0, 0.45, zf)), rough=0.16)
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy + 0.3), stack, smooth=34.0)

    return finish(root, 'dep_clay', samples=32, distance=0.7, tint=make_tint({'mineral': PM}, TAN, None, floor=0.45))


# ==============================================================================================
# dep_sulfate.glb
# ==============================================================================================
def build_dep_sulfate():
    """Sulfate as it stands in the floor of Valles Marineris: a small butte of pale beds, cream and straw, taller
    than a man, weathered into ledges with dust lying on every one, and thin white beds of gypsum running round it
    between the thick ones. Six tabular pieces have been broken out in front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_sulfate')
    rng = random.Random(74)
    PM = Paint()
    CREAM, STRAW, RUSTY, GYPSUM = (0.50, 0.46, 0.36), (0.47, 0.37, 0.21), (0.42, 0.27, 0.15), (0.62, 0.61, 0.58)
    STAIN, DUSTY, JOINT = (0.30, 0.20, 0.14), (0.41, 0.27, 0.17), (0.24, 0.18, 0.13)
    CX, CY, TOP = 0.0, 0.9, 2.15
    beds = strata(rng, TOP, 0.17, 0.28, (CREAM, STRAW, RUSTY, CREAM, STRAW), seam=GYPSUM, every=3)
    top = beds[-1][1]

    def reach(x, y):
        dy = (y - CY) / (0.86 if y < CY else 1.12)                            # a little steeper to the front
        d = sqrt((x - CX) ** 2 + dy ** 2) / 2.55
        return d * (1.0 + 0.17 * noise3((x, y, 0.0), 0.9, 3.0) + 0.08 * noise3((x, y, 0.0), 2.4, 9.0))

    def raw(x, y):
        p = 1.0 - reach(x, y)
        if p <= 0.0:
            return 0.6 * p
        return (top + 0.02) * _smooth01(0.0, 0.80, p) + 0.05 * noise3((x, y, 0.0), 2.6, 5.0) * _smooth01(0.0, 0.15, p)

    def hf(x, y):
        return terrace(beds, raw(x, y), 0.5)[0]

    def cf(x, y, h):
        hh, k, t = terrace(beds, h, 0.5)
        if h <= 0.0:
            return STAIN
        face = mix(beds[k][2], mix(beds[k][2], CREAM, 0.4), 0.5 + 0.5 * noise3((x, y, hh), 2.5, 2.0))
        tread = mix(beds[max(0, k - 1)][2], DUSTY, 0.72)                       # dust lies on every ledge
        cc = mix(tread, face, _smooth01(0.36, 0.56, t))
        cc = mix(cc, JOINT, 0.3 * _smooth01(0.40, 0.50, t) * (1.0 - _smooth01(0.50, 0.62, t)))
        return mix(cc, STAIN, 0.7 * (1.0 - _smooth01(0.0, 0.14, hh)))
    patch('butte.beds', root, 3.3, 104, hf, cf, PM, centre=(CX, CY), smooth=42.0)
    anchor('col_butte', root, loc=(CX, CY, 0), radius=1.95)

    # ---- what has fallen from it ----
    K = Kit('butte', root)
    SCREE = K.bm('mineral', bevel=0.01, smooth=30.0)

    def piece_col(base):
        def col(zf, co):
            return mix(mix(STAIN, base, _smooth01(0.0, 0.4, zf)), GYPSUM, 0.5 * _smooth01(0.86, 1.0, zf))      # it broke along a white bed
        return col
    for i in range(20):
        a, d = rng.uniform(0, TAU), rng.uniform(2.5, 3.5)
        x, y = CX + d * cos(a), CY + d * 0.95 * sin(a)
        s = rng.uniform(0.09, 0.24)
        poly = [Vector((x + s * rng.uniform(0.75, 1.1) * cos(TAU * j / 5 + i), y + s * 0.72 * rng.uniform(0.75, 1.1) * sin(TAU * j / 5 + i), 0.0)) for j in range(5)]
        plate(SCREE, poly, (x, y), -0.03, rng.uniform(0.05, 0.14), PM, piece_col(mix(STRAW, CREAM, rng.random())), top_in=0.86, tilt=(rng.uniform(-0.25, 0.25), rng.uniform(-0.25, 0.25)))
    K.finish()

    # ---- six tabular pieces broken out in front: the game takes these ----
    for k, (sx, sy) in enumerate(FRONT):
        rk = random.Random(800 + k)

        def piece(bm, at, rk=rk):
            chunk(bm, rk, rk.uniform(0.26, 0.34), rk.uniform(0.5, 0.7), at, PM, piece_col(mix(STRAW, CREAM, rk.random())), rough=0.2)
            if rk.random() < 0.6:
                a, d = rk.uniform(0, TAU), rk.uniform(0.4, 0.52)
                o2 = (at[0] + d * cos(a), at[1] + d * sin(a), 0.0)
                more = chunk(bm, rk, rk.uniform(0.11, 0.16), 0.6, o2, PM, piece_col(mix(STRAW, CREAM, rk.random())), rough=0.2)
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy - 0.25), piece, smooth=34.0)

    return finish(root, 'dep_sulfate', samples=32, distance=0.9, tint=make_tint({'mineral': PM}, CREAM, None, floor=0.45))


# ==============================================================================================
# dep_salt.glb
# ==============================================================================================
def build_dep_salt():
    """A salt pan: the floor of a puddle that dried up, its crust heaved by its own growing into polygons a pace
    across, no two alike, each a shallow dish with a raised white rim where it pushes against its neighbours, a
    crack along the top of every ridge, and dust lying in the dishes. Six slabs of crust have been levered up along
    the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_salt')
    rng = random.Random(85)
    PM = Paint()
    WHITE, DISH, DUSTY, EDGE = (0.62, 0.61, 0.60), (0.50, 0.44, 0.40), (0.42, 0.29, 0.20), (0.31, 0.21, 0.145)
    CX, CY = 0.0, 0.3

    def reach(x, y):
        d = sqrt(((x - CX) / 3.5) ** 2 + ((y - CY) / 3.0) ** 2)
        return d * (1.0 + 0.15 * noise3((x, y, 0.0), 0.8, 6.0) + 0.07 * noise3((x, y, 0.0), 2.0, 2.0))

    # ---- the pan: soft ridges where the polygons push against each other, shallow dishes between ----
    cells = {}

    def cell(x, y):
        k = (round(x, 4), round(y, 4))
        if k not in cells:
            cells[k] = vor(x, y, 0.82, 5.0, 0.43)
        return cells[k]

    def hf(x, y):
        r_ = reach(x, y)
        if r_ >= 1.0:
            return -0.5 * (r_ - 1.0) - 0.03
        live = 1.0 - _smooth01(0.6, 1.0, r_)                                  # the pan thins out toward its edge and goes under the drift
        edge = cell(x, y)[0]
        ridge = math.exp(-(edge / 0.085) ** 2)
        lift = 0.075 + 0.05 * noise3((x, y, 0.0), 1.4, 4.0)                   # higher here, lower there
        return (0.035 + lift * ridge - 0.014 * _smooth01(0.08, 0.32, edge) + 0.007 * noise3((x, y, 0.0), 7.0, 1.0)) * live - 0.03 * (1.0 - live)

    def cf(x, y, h):
        r_ = reach(x, y)
        live = 1.0 - _smooth01(0.6, 1.0, r_)
        edge, ij, p = cell(x, y)
        dust = 0.35 + 0.6 * hash01(ij[0], ij[1], 5.0)
        cc = mix(WHITE, mix(DISH, DUSTY, dust * _smooth01(0.12, 0.34, edge)), _smooth01(0.05, 0.17, edge))
        return mix(EDGE, cc, live)
    patch('pan.crust', root, 3.95, 108, hf, cf, PM, centre=(CX, CY), smooth=60.0)

    # ---- crystals along some of the ridges: little cubes, as halite grows ----
    K = Kit('pan', root)
    made = 0
    while made < 70:
        a, d = rng.uniform(0, TAU), sqrt(rng.random())
        x, y = CX + 3.0 * d * cos(a), CY + 2.6 * d * sin(a)
        if reach(x, y) > 0.7 or cell(x, y)[0] > 0.05:
            continue
        s = rng.uniform(0.02, 0.045)
        M = T(x, y, hf(x, y) + s * 0.3) @ R('Z', rng.uniform(0, 90)) @ R('X', rng.uniform(-25, 25)) @ R('Y', rng.uniform(-25, 25))
        pts = [(sx_ * s, sy_ * s, sz_ * s) for sx_ in (-1, 1) for sy_ in (-1, 1) for sz_ in (-1, 1)]
        for q in pts:
            PM.add(M @ Vector(q), WHITE)
        K.hull('mineral', pts, M, smooth=10.0)
        made += 1
    K.finish()

    # ---- six slabs of crust levered up along the front: the game takes these ----
    for k, (sx, sy) in enumerate(FRONT):
        rk = random.Random(900 + k)

        def crust(bm, at, rk=rk):
            col = lambda zf, co: mix(mix(DISH, DUSTY, 0.4), WHITE, 0.25 + 0.75 * zf)      # noqa: E731
            chunk(bm, rk, rk.uniform(0.3, 0.38), rk.uniform(0.24, 0.32), at, PM, col, rough=0.2)
            a, d = rk.uniform(0, TAU), rk.uniform(0.4, 0.55)
            o2 = (at[0] + d * cos(a), at[1] + d * sin(a), 0.0)
            more = chunk(bm, rk, rk.uniform(0.16, 0.24), 0.3, o2, PM, col, rough=0.2)
            bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy - 0.35), crust, smooth=34.0)

    return finish(root, 'dep_salt', samples=32, distance=0.4, tint=make_tint({'mineral': PM}, WHITE, None, floor=0.55))


BUILDERS = {
    'dep_hematite': build_dep_hematite, 'dep_silica': build_dep_silica, 'dep_clay': build_dep_clay,
    'dep_sulfate': build_dep_sulfate, 'dep_salt': build_dep_salt,
}

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS)
    unknown = [a for a in sys.argv[1:] if a not in BUILDERS]
    if unknown:
        print('unknown model(s):', ', '.join(unknown), '- known:', ', '.join(BUILDERS))
    for name in names:
        reset_scene()
        BUILDERS[name]()
