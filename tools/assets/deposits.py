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


def patch(name, root, half, n, hfun, cfun, P, centre=(0.0, 0.0), cut=-0.03, smooth=42.0, material='mineral', jitter=0.0):
    """Rock as a surface: a square of ground `2 * half` across about `centre`, n by n quads, raised to hfun(x, y).
    Where that is below `cut` there is nothing (the ground covers it). cfun(x, y, h) is the colour of a vertex.
    Stepped strata, worn knobs and mounds are all height functions; nothing made this way overhangs.
    `jitter` (a share of a cell) nudges the vertices off the grid: broken rock shaded in facets shows its grid
    as ruled rows of triangles otherwise."""
    bm = bm_new()
    cx, cy = centre
    hs, xy = {}, {}
    for i in range(n + 1):
        for j in range(n + 1):
            x = cx - half + 2.0 * half * (i + jitter * (hash01(i, j, 1.0) - 0.5)) / n
            y = cy - half + 2.0 * half * (j + jitter * (hash01(i, j, 2.0) - 0.5)) / n
            xy[i, j] = (x, y)
            hs[i, j] = hfun(x, y)
    vs = {}
    for i in range(n):
        for j in range(n):
            q4 = ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))
            if all(hs[q] <= cut for q in q4):
                continue
            for q in q4:
                if q not in vs:
                    x, y = xy[q]
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


def bead8(bm, x, y, z, r, P, col):
    """A bead: eight faces are plenty for a thing the size of a marble."""
    vs = bmesh.ops.create_uvsphere(bm, u_segments=4, v_segments=2, radius=r)['verts']
    bmesh.ops.transform(bm, matrix=T(x, y, z), verts=vs)
    for v in vs:
        P.add(v.co, col)


def rubble(bm, r, n, place, P, col, size=(0.05, 0.16), flat=(0.45, 0.8)):
    """What has come off an outcrop and lies against its foot: n small stones, half sunk. place() -> (x, y);
    col(zf, co) colours each by height."""
    for i in range(n):
        x, y = place()
        s_ = r.uniform(*size)
        vs = rock(bm, s_, (x, y, s_ * 0.25), seed=r.randint(0, 10 ** 6), scale=(r.uniform(1.0, 1.3), r.uniform(0.75, 1.0), r.uniform(*flat)), subdiv=1, rough=0.28)
        zs = [v.co.z for v in vs]
        lo, hi = min(zs), max(zs)
        for v in vs:
            P.add(v.co, col((v.co.z - lo) / max(1e-4, hi - lo), v.co))


# ==============================================================================================
# dep_hematite.glb
# ==============================================================================================
def build_dep_hematite():
    """Hematite as Opportunity found it at Meridiani: a pavement of pale, finely bedded rock, cracked into polygons
    and all but level with the sand, and over it and in its joints the grey beads that weathered out of it, by the
    thousand. The beads are what he wants: nearly pure iron oxide. They lie thickest in the joints, and six heaps
    of them have been raked together at its edge (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_hematite')
    rng = random.Random(41)
    PM, PS = Paint(), Paint()
    BUFF, PALE, SEAM, STAIN, DUSTY = (0.38, 0.29, 0.20), (0.46, 0.37, 0.27), (0.23, 0.17, 0.12), (0.30, 0.20, 0.14), (0.40, 0.26, 0.17)
    BEAD, BEAD_HI, BEAD_DUSTY = (0.085, 0.095, 0.12), (0.15, 0.16, 0.19), (0.21, 0.16, 0.13)
    CX, CY = 0.0, 0.5

    def reach(x, y):                                                          # 0 at the middle of the pavement, 1 at its edge
        d = sqrt(((x - CX) / 4.0) ** 2 + ((y - CY) / 3.2) ** 2)
        return d * (1.0 + 0.16 * noise3((x, y, 0.0), 0.8, 4.0) + 0.07 * noise3((x, y, 0.0), 2.1, 8.0))

    cells = {}

    def cell(x, y):
        k = (round(x, 4), round(y, 4))
        if k not in cells:
            cells[k] = vor(x, y, 0.84, 3.0, 0.42)
        return cells[k]

    def plate_of(ij, p):
        """A plate of the pavement: (how proud of the sand it stands, its tilt, its tone); gone altogether here and
        there, and more often toward the edge, where the sand has it."""
        gone = hash01(ij[0], ij[1], 11.0) < 0.05 + 0.62 * _smooth01(0.66, 1.0, reach(*p))
        return (0.0 if gone else 0.025 + 0.04 * hash01(ij[0], ij[1], 6.0), (hash01(ij[0], ij[1], 7.0) - 0.5) * 0.04, (hash01(ij[0], ij[1], 8.0) - 0.5) * 0.04, hash01(ij[0], ij[1], 5.0))

    def hf(x, y):
        r_ = reach(x, y)
        if r_ >= 1.0:
            return -0.5 * (r_ - 1.0) - 0.03
        edge, ij, p = cell(x, y)
        proud, tx, ty, _ = plate_of(ij, p)
        if proud <= 0.0:
            return -0.03
        top = max(0.012, proud + (x - p[0]) * tx + (y - p[1]) * ty + 0.006 * noise3((x, y, 0.0), 4.5, 2.0))
        # (the joints lie under the ground, which is the terrain's own sand: only the plates stand out of it. A plate
        #  is flat to its edge and drops there: drawn rounded over, the pavement was a quilt of cushions.)
        return -0.03 + (top + 0.03) * _smooth01(0.03, 0.075, edge) ** 0.5

    def cf(x, y, h):
        edge, ij, p = cell(x, y)
        tone = plate_of(ij, p)[3]
        cc = mix(BUFF, PALE, 0.7 * tone + 0.3 * (0.5 + 0.5 * noise3((x, y, 0.0), 1.7, 6.0)))
        cc = mix(cc, DUSTY, 0.5 * _smooth01(0.1, 0.7, 0.5 + 0.5 * noise3((x, y, 0.0), 2.6, 9.0)))       # dust lies on it in patches
        cc = mix(cc, SEAM, 0.55 * (1.0 - _smooth01(0.06, 0.13, edge)))                                    # its worn edges are darker
        return mix(STAIN, cc, _smooth01(0.0, 0.03, h))
    patch('pavement.rock', root, 4.4, 126, hf, cf, PM, centre=(CX, CY), smooth=50.0)

    # ---- the beads: a scatter on every plate, and thick in the joints ----
    K = Kit('pavement', root)
    BEADS = K.bm('mineral_sheen', smooth=50.0)

    def bead_col():
        k = rng.random()
        return mix(BEAD, BEAD_DUSTY, rng.random()) if k < 0.25 else mix(BEAD, BEAD_HI, rng.random())
    made = 0
    while made < 460:
        a, d = rng.uniform(0, TAU), sqrt(rng.random())
        x, y = CX + 3.9 * d * cos(a), CY + 3.1 * d * sin(a)
        if reach(x, y) > 0.97:
            continue
        edge = cell(x, y)[0]
        if edge > 0.08 and rng.random() > 0.22:                                # most lie in the joints
            continue
        r_ = rng.uniform(0.011, 0.021) * (1.25 if rng.random() < 0.08 else 1.0)
        bead8(BEADS, x + rng.uniform(-0.01, 0.01), y, max(0.0, hf(x, y)) + r_ * 0.5, r_, PS, bead_col())
        made += 1
    K.finish()

    # ---- six heaps raked together at its edge: the game takes these ----
    for k, (sx, sy, big) in enumerate(((-3.0, -2.2, 1.0), (-1.9, -3.05, 0.8), (-0.5, -2.75, 1.15), (0.7, -3.3, 0.75), (1.9, -2.6, 1.0), (3.1, -2.0, 0.85))):
        rk = random.Random(500 + k)

        def heap(bm, at, rk=rk, k=k, big=big):
            o = Vector(at)
            n, rr, hh = 14, 0.27 * big, 0.10 * big
            top = bm.verts.new((0, 0, hh))
            PS.add(o + top.co, BEAD)
            rings = []
            for j in range(1, 4):
                t = j / 3.0
                ring = []
                for i in range(n):
                    a = TAU * i / n
                    q = rr * t * (1.0 + 0.2 * noise3((cos(a), sin(a), k), 2.0, k))
                    v = bm.verts.new((q * cos(a), q * sin(a), max(-0.01, hh * (1.0 - t) ** 1.2 - 0.01 * t)))
                    PS.add(o + v.co, BEAD)
                    ring.append(v)
                rings.append(ring)
            for i in range(n):
                bm.faces.new((top, rings[0][i], rings[0][(i + 1) % n]))
            for j in range(2):
                for i in range(n):
                    bm.faces.new((rings[j][i], rings[j + 1][i], rings[j + 1][(i + 1) % n], rings[j][(i + 1) % n]))
            for _ in range(int(64 * big)):                                    # it is all beads: they stand out of it all over, and are spilt round it
                a, d = rk.uniform(0, TAU), rr * 1.35 * sqrt(rk.random())
                s_ = rk.uniform(0.014, 0.024)
                z = max(0.0, hh * (1.0 - min(1.0, d / rr)) ** 1.2) + s_ * 0.3
                bead8(bm, d * cos(a), d * sin(a), z, s_, Paint(), BEAD)
                cc = mix(BEAD, BEAD_HI, rk.random())
                for q in ((d * cos(a), d * sin(a), z + dz) for dz in (-s_, 0.0, s_)):
                    PS.add(o + Vector(q), cc)
        loose(root, k, (sx, sy), heap, material='mineral_sheen', smooth=50.0)

    return finish(root, 'dep_hematite', samples=32, distance=0.5, tint=make_tint({'mineral': PM, 'mineral_sheen': PS}, BUFF, None, floor=0.5))


# ==============================================================================================
# dep_silica.glb
# ==============================================================================================
def build_dep_silica():
    """Opaline silica, as Spirit found it beside Home Plate: the crust a hot spring left, nearly pure white, grown
    in knobs upon knobs like cauliflower. The knobs stand out of the sand singly at its edge and crowd into a low
    mound at its middle. Six lumps have been broken out along the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_silica')
    rng = random.Random(52)
    PM = Paint()
    WHITE, GREY, CREASE, STAIN = (0.63, 0.635, 0.62), (0.50, 0.50, 0.47), (0.33, 0.29, 0.25), (0.34, 0.24, 0.17)
    CX, CY = 0.0, 0.6

    def reach(x, y):
        d = sqrt(((x - CX) / 3.0) ** 2 + ((y - CY) / 2.4) ** 2)
        return d * (1.0 + 0.2 * noise3((x, y, 0.0), 0.9, 2.0) + 0.09 * noise3((x, y, 0.0), 2.3, 6.0))

    def mound(x, y):
        p = 1.0 - reach(x, y)
        return 0.42 * _smooth01(0.0, 0.85, p) ** 1.2 if p > 0 else 0.0

    # the knobs: three crowded heads, a scatter between, and singles out to the edge; each a dome sunk a third into what it stands on
    knobs = []
    for (hx, hy, spread, n, big) in ((-0.3, 1.0, 1.1, 46, 0.34), (1.45, 0.25, 0.85, 28, 0.27), (-1.6, 0.2, 0.8, 24, 0.25)):
        for i in range(n):
            a, d = rng.uniform(0, TAU), spread * sqrt(rng.random())
            r_ = big * rng.uniform(0.35, 1.0) * (1.0 - 0.45 * d / spread)
            knobs.append((hx + d * cos(a), hy + d * sin(a) * 0.85, r_, rng.uniform(0.8, 1.5)))
    for i in range(110):
        a, d = rng.uniform(0, TAU), 3.0 * sqrt(rng.random())
        x, y = CX + d * cos(a), CY + d * sin(a) * 0.8
        if reach(x, y) < 1.02:
            knobs.append((x, y, rng.uniform(0.09, 0.2), rng.uniform(0.7, 1.2)))

    def knob_h(x, y):
        best = -1.0
        for (kx, ky, r_, sq) in knobs:
            d2 = (x - kx) ** 2 + (y - ky) ** 2
            if d2 < r_ * r_:
                best = max(best, mound(kx, ky) - 0.32 * r_ * sq + sq * sqrt(r_ * r_ - d2))
        return best

    def hf(x, y):
        pit = 0.02 * noise3((x, y, 0.0), 7.0, 3.0) + 0.012 * noise3((x, y, 0.0), 13.0, 8.0)             # old sinter is pitted
        # (between the knobs the crust is under the sand, but for the middle of the mound: it lay round its own foot
        #  as a flat pale apron, "a puddle of custard poured on the sand")
        return max(mound(x, y) - 0.10, knob_h(x, y)) + pit - 0.012

    def cf(x, y, h):
        up = h - (mound(x, y) - 0.10)                                         # how far a knob stands out here
        cc = mix(mix(CREASE, GREY, _smooth01(0.0, 0.05, up)), WHITE, _smooth01(0.03, 0.13, up) * (0.75 + 0.25 * noise3((x, y, 0.0), 4.0, 1.0)))
        return mix(STAIN, cc, _smooth01(0.0, 0.06, h))
    patch('bed.crust', root, 3.6, 124, hf, cf, PM, centre=(CX, CY), smooth=55.0, cut=-0.012)
    anchor('col_bed_m', root, loc=(-0.3, 1.0, 0), radius=1.0)

    def lcol(zf, co):
        return mix(mix(GREY, WHITE, _smooth01(0.15, 0.7, zf)), STAIN, 0.65 * (1.0 - _smooth01(0.0, 0.22, zf)))

    def knobby(bm, r, size, at, n):
        """A broken-off lump of the crust: a few knobs grown together, round as the mound's are. Painted where it
        stands; `at` is where the mesh's origin is in the model."""
        o = Vector(at)
        for i in range(n):
            a, d = r.uniform(0, TAU), (0.0 if i == 0 else size * r.uniform(0.5, 0.85))
            s_ = size * (1.0 if i == 0 else r.uniform(0.45, 0.7))
            vs = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=s_)['verts']
            bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), s_ * 0.45) @ Matrix.Diagonal((1.0, r.uniform(0.85, 1.0), r.uniform(0.7, 0.9), 1.0)), verts=vs)
            for v in vs:
                v.co.z = max(v.co.z, -0.02)
                PM.add(o + v.co, lcol(max(0.0, v.co.z) / (s_ * 1.1), o + v.co))

    # ---- six lumps broken out along the front: the game takes these ----
    for k, (sx, sy, big) in enumerate(((-2.6, -1.5, 0.17), (-1.6, -2.2, 0.13), (-0.6, -1.85, 0.19), (0.5, -2.45, 0.14), (1.5, -1.8, 0.18), (2.6, -1.35, 0.14))):
        rk = random.Random(600 + k)
        loose(root, k, (sx, sy), lambda bm, at, rk=rk, big=big: knobby(bm, rk, big, at, rk.randint(3, 5)), smooth=60.0)

    return finish(root, 'dep_silica', samples=32, distance=0.5, tint=make_tint({'mineral': PM}, WHITE, None, floor=0.5))


# ==============================================================================================
# dep_clay.glb
# ==============================================================================================
def build_dep_clay():
    """Clay as it lies at Mawrth Vallis: the broken edge of a bed of banded mudstone, pale and bluish over tan and
    rust. One side of it is a face a pace high, where the beds show as bands and ledges; from the top of the face
    the uppermost bed runs back and down into the ground, dried and cracked. What has come off the face lies at
    its foot. Six pieces lie out in front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_clay')
    rng = random.Random(63)
    PM = Paint()
    RUST, TAN, BLUE, PALE, BLUE2, CREAM = (0.43, 0.20, 0.11), (0.46, 0.33, 0.19), (0.25, 0.28, 0.33), (0.50, 0.44, 0.35), (0.34, 0.37, 0.41), (0.52, 0.47, 0.38)
    STAIN, DUSTY, CRACK = (0.30, 0.20, 0.14), (0.40, 0.26, 0.17), (0.19, 0.14, 0.105)
    TOP, W, BACK = 1.08, 1.05, 3.0                                            # the face's height, its run, and how far the top runs back
    beds = strata(rng, TOP * (1.0 + W / BACK) + 0.3, 0.17, 0.30, (RUST, PALE, BLUE, TAN, BLUE2, CREAM))

    def face_y(x):                                                            # where the foot of the face lies: a wavering line, drawn back at its ends
        return -1.05 + 0.32 * noise3((x, 0.0, 0.0), 0.9, 2.0) + 0.5 * (x / 3.5) ** 2

    def height(x):                                                            # how high the face stands at x: full in the middle, gone at the ends
        e = 1.0 - (abs(x) / 3.6) ** 2.4
        return TOP * max(0.0, e) ** 0.55 * (1.0 + 0.12 * noise3((x, 1.0, 0.0), 1.1, 5.0)) if e > 0 else 0.0

    def level(x, y):
        """(the stratigraphic level of the surface here: its height, plus what the beds have dipped by this far
        back; how far back; the dip). The beds dip back, and the top of the bank is one of them."""
        H = height(x)
        s_ = y - face_y(x)
        if H <= 0.0 or s_ < 0.0:
            return None, s_, 0.0
        dip = H / BACK
        raw = H * (1.0 - (1.0 - s_ / W) ** 1.5) if s_ < W else H * (1.0 - (s_ - W) / BACK)
        raw += 0.035 * noise3((x, y, 0.0), 3.0, 7.0) * min(1.0, s_ / 0.3)
        return raw + dip * s_, s_, dip

    def hf(x, y):
        lv, s_, dip = level(x, y)
        if lv is None:
            return -0.03 - 1.5 * max(0.0, -s_) if height(x) > 0 else -0.3
        # (toward its ends, where the face runs down to nothing, the ledges run out too: cut to the last, a bed a
        #  hand high stood out of the sand as a fan of thin fins)
        h = lv + (terrace(beds, lv, 0.45)[0] - lv) * _smooth01(0.18, 0.5, height(x)) - dip * s_
        if s_ > W:                                                            # the top: dried, and cracked into plates
            h -= 0.028 * (1.0 - _smooth01(0.0, 0.05, vor(x, y, 0.38, 9.0, 0.42)[0]))
        return h - 0.02

    def cf(x, y, h):
        lv, s_, dip = level(x, y)
        if lv is None:
            return STAIN
        hh, k, t = terrace(beds, lv, 0.45)
        face = mix(beds[k][2], mix(beds[k][2], (0.55, 0.50, 0.45), 0.3), 0.5 + 0.5 * noise3((x, y, hh), 3.0, 2.0))
        tread = mix(beds[max(0, k - 1)][2], DUSTY, 0.5)                        # dust lies on every ledge
        cc = mix(tread, face, _smooth01(0.30, 0.50, t))
        cc = mix(cc, CRACK, 0.3 * _smooth01(0.36, 0.45, t) * (1.0 - _smooth01(0.45, 0.58, t)))          # the joint where a bed sits on the one below
        if s_ > W:
            edge = vor(x, y, 0.38, 9.0, 0.42)[0]
            cc = mix(mix(beds[k][2], DUSTY, 0.45 + 0.25 * noise3((x, y, 0.0), 1.5, 3.0)), CRACK, 0.6 * (1.0 - _smooth01(0.0, 0.05, edge)))
        return mix(STAIN, cc, _smooth01(-0.02, 0.10, h))
    patch('bank.beds', root, 4.1, 124, hf, cf, PM, centre=(0.0, 1.0), smooth=46.0)
    anchor('col_bank_l', root, loc=(-1.9, 0.2, 0), radius=1.0)
    anchor('col_bank_m', root, loc=(0.0, 0.0, 0), radius=1.2)
    anchor('col_bank_r', root, loc=(1.9, 0.2, 0), radius=1.0)

    # ---- what has come off the face, against its foot ----
    K = Kit('bank', root)
    SCREE = K.bm('mineral', smooth=34.0)

    def bed_col(base):
        return lambda zf, co: mix(mix(base, CRACK, 0.45), base, _smooth01(0.0, 0.45, zf))

    def at_foot():
        x = rng.uniform(-3.0, 3.0)
        return x, face_y(x) - rng.uniform(-0.12, 0.85) ** 1.0
    for i in range(34):
        rubble(SCREE, rng, 1, at_foot, PM, bed_col(rng.choice((RUST, TAN, BLUE, PALE, BLUE2))), size=(0.05, 0.17), flat=(0.3, 0.55))
    K.finish()

    # ---- six pieces lying out in front: the game takes these ----
    for k, (sx, sy, big) in enumerate(((-2.7, -2.35, 0.30), (-1.6, -3.1, 0.24), (-0.6, -2.5, 0.33), (0.6, -3.2, 0.25), (1.6, -2.45, 0.31), (2.7, -2.9, 0.26))):
        rk = random.Random(700 + k)

        def piece(bm, at, rk=rk, k=k, big=big):
            chunk(bm, rk, big, rk.uniform(0.34, 0.46), at, PM, bed_col((RUST, PALE, BLUE2, TAN, RUST, CREAM)[k]), rough=0.2)
            if rk.random() < 0.7:                                              # and a smaller one fallen by it
                a, d = rk.uniform(0, TAU), big + rk.uniform(0.12, 0.2)
                more = chunk(bm, rk, big * rk.uniform(0.4, 0.55), 0.4, (at[0] + d * cos(a), at[1] + d * sin(a), 0.0), PM, bed_col((TAN, BLUE2, PALE, RUST, CREAM, TAN)[k]), rough=0.2)
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy), piece, smooth=34.0)

    return finish(root, 'dep_clay', samples=32, distance=0.7, tint=make_tint({'mineral': PM}, TAN, None, floor=0.45))


# ==============================================================================================
# dep_sulfate.glb
# ==============================================================================================
def build_dep_sulfate():
    """Sulfate as it stands in the floor of Valles Marineris: a knob of pale layered rock, straw and cream, taller
    than a man, the last of a bed that has otherwise gone. Its beds dip to one side; the thick ones stand as low
    cliffs and the thin ones between them, some of them white gypsum, have weathered back into ledges; one side has
    come down, and what fell lies in a heap against its foot. Six pieces lie out in front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_sulfate')
    rng = random.Random(74)
    PM = Paint()
    CREAM, STRAW, RUSTY, GYPSUM = (0.52, 0.46, 0.33), (0.50, 0.40, 0.19), (0.44, 0.27, 0.13), (0.63, 0.62, 0.59)
    STAIN, DUSTY, JOINT = (0.30, 0.20, 0.14), (0.40, 0.26, 0.17), (0.24, 0.18, 0.13)
    CX, CY, TOP = 0.2, 0.9, 2.2
    DIPX, DIPY = 0.13, 0.05                                                   # the beds' dip: down toward +x, a little toward the back
    # thick beds that stand as cliffs, thin ones between that weather back; a white one now and then
    beds, z, k = [], -0.6, 0
    while z < TOP + 1.2:
        if k % 2 == 0:
            th, col = rng.uniform(0.34, 0.6), mix(STRAW, CREAM, rng.random())
            if k % 6 == 4:
                col = mix(col, RUSTY, 0.55)
        else:
            th, col = rng.uniform(0.07, 0.14), (GYPSUM if k % 4 == 1 else mix(RUSTY, STRAW, 0.5))
        beds.append((z, z + th, col))
        z += th
        k += 1

    def reach(x, y):
        # not round: longer one way than the other, lobed, and bitten into on one side where it has come down
        ca, sa = cos(rad(28)), sin(rad(28))
        u, v = (x - CX) * ca + (y - CY) * sa, -(x - CX) * sa + (y - CY) * ca
        d = sqrt((u / 2.75) ** 2 + (v / 2.0) ** 2)
        d *= 1.0 + 0.22 * noise3((x, y, 0.0), 0.8, 3.0) + 0.10 * noise3((x, y, 0.0), 2.2, 9.0)
        ang = math.atan2(y - CY, x - CX)
        bite = math.exp(-((((ang - rad(-140) + pi) % TAU) - pi) / 0.5) ** 2)
        return d * (1.0 + 0.55 * bite)

    def level(x, y):
        p = 1.0 - reach(x, y)
        if p <= 0.0:
            return None, p
        q = min(1.0, p / 0.72)
        raw = (TOP + 0.02) * (1.0 - (1.0 - q) ** 1.6) + 0.06 * noise3((x, y, 0.0), 2.4, 5.0) * _smooth01(0.0, 0.15, p)
        return raw + DIPX * (x - CX) + DIPY * (y - CY), p

    beds0 = [(a + 0.6, b + 0.6, c) for (a, b, c) in beds]                     # (terrace() counts from nought)

    def hf(x, y):
        lv, p = level(x, y)
        if lv is None:
            return 2.5 * p - 0.02
        return terrace(beds0, lv + 0.6, 0.34)[0] - 0.6 - DIPX * (x - CX) - DIPY * (y - CY) - 0.02

    def cf(x, y, h):
        lv, p = level(x, y)
        if lv is None:
            return STAIN
        hh, k_, t = terrace(beds0, lv + 0.6, 0.34)
        face = mix(beds0[k_][2], mix(beds0[k_][2], CREAM, 0.35), 0.5 + 0.5 * noise3((x, y, hh), 2.5, 2.0))
        tread = mix(beds0[max(0, k_ - 1)][2], DUSTY, 0.6)                      # dust lies on every ledge
        cc = mix(tread, face, _smooth01(0.22, 0.40, t))
        cc = mix(cc, JOINT, 0.3 * _smooth01(0.26, 0.34, t) * (1.0 - _smooth01(0.34, 0.46, t)))
        return mix(STAIN, cc, _smooth01(-0.02, 0.12, h))
    patch('butte.beds', root, 3.5, 112, hf, cf, PM, centre=(CX, CY), smooth=46.0)
    anchor('col_butte', root, loc=(CX, CY, 0), radius=1.9)

    # ---- what has come down: a heap under the bite, and stones all round its foot ----
    K = Kit('butte', root)
    SCREE = K.bm('mineral', smooth=34.0)

    def piece_col(base):
        return lambda zf, co: mix(mix(STAIN, base, _smooth01(0.0, 0.4, zf)), GYPSUM, 0.35 * _smooth01(0.88, 1.0, zf))

    def foot(a0=None, spread=TAU, far=(0.0, 0.5)):
        """A place on the ground just outside the foot of the knob."""
        for _ in range(40):
            a = (rng.uniform(0, TAU) if a0 is None else a0 + rng.uniform(-spread, spread))
            d = rng.uniform(1.4, 3.4)
            x, y = CX + d * cos(a), CY + d * sin(a)
            r_ = reach(x, y)
            if 1.0 + far[0] * 0.2 < r_ < 1.0 + far[1] * 0.45 + 0.04:
                return x, y
        return CX + 2.6 * cos(a), CY + 2.6 * sin(a)
    for i in range(30):
        rubble(SCREE, rng, 1, foot, PM, piece_col(mix(STRAW, CREAM, rng.random())), size=(0.05, 0.16))
    for i in range(26):
        rubble(SCREE, rng, 1, lambda: foot(rad(-140), 0.5, (0.0, 0.9)), PM, piece_col(mix(STRAW, CREAM, rng.random())), size=(0.07, 0.24))
    K.finish()

    # ---- six pieces lying out in front: the game takes these ----
    for k, (sx, sy, big) in enumerate(((-2.8, -1.7, 0.27), (-1.9, -2.7, 0.22), (-0.7, -2.2, 0.30), (0.5, -3.0, 0.23), (1.6, -2.3, 0.28), (2.8, -2.6, 0.22))):
        rk = random.Random(800 + k)

        def piece(bm, at, rk=rk, big=big):
            chunk(bm, rk, big, rk.uniform(0.5, 0.7), at, PM, piece_col(mix(STRAW, CREAM, rk.random())), rough=0.22)
            if rk.random() < 0.6:
                a, d = rk.uniform(0, TAU), big + rk.uniform(0.1, 0.2)
                more = chunk(bm, rk, big * rk.uniform(0.4, 0.55), 0.6, (at[0] + d * cos(a), at[1] + d * sin(a), 0.0), PM, piece_col(mix(STRAW, CREAM, rk.random())), rough=0.22)
                bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy), piece, smooth=34.0)

    return finish(root, 'dep_sulfate', samples=32, distance=0.9, tint=make_tint({'mineral': PM}, CREAM, None, floor=0.45))


# ==============================================================================================
# dep_salt.glb
# ==============================================================================================
def build_dep_salt():
    """A salt pan: the floor of a puddle that dried up, its crust heaved by its own growing into polygons a pace
    across, no two alike. Where the polygons push against each other the salt stands in white ridges; in some of
    the dishes between there is still a skin of it, and in the rest the sand shows. Toward its edge it breaks up
    and is gone. Six slabs of crust have been levered up along the front (`block_0` .. `block_5`)."""
    minerals()
    root = part('dep_salt')
    rng = random.Random(85)
    PM = Paint()
    WHITE, DISH, DUSTY, EDGE = (0.64, 0.62, 0.62), (0.54, 0.47, 0.45), (0.41, 0.28, 0.19), (0.31, 0.21, 0.145)
    CX, CY = 0.0, 0.3

    def reach(x, y):
        d = sqrt(((x - CX) / 3.6) ** 2 + ((y - CY) / 3.1) ** 2)
        return d * (1.0 + 0.09 * noise3((x, y, 0.0), 0.8, 6.0) + 0.04 * noise3((x, y, 0.0), 2.0, 2.0))

    cells = {}

    def cell(x, y):
        k = (round(x, 4), round(y, 4))
        if k not in cells:
            cells[k] = vor(x, y, 0.82, 5.0, 0.43)
        return cells[k]

    def crusted(ij, p):
        """Whether a polygon of the pan still has its skin of salt (fewer of them toward the edge); the rest are a
        ring of ridges round bare sand."""
        return hash01(ij[0], ij[1], 5.0) < 0.5 - 0.35 * _smooth01(0.45, 0.9, reach(*p))

    def hf(x, y):
        r_ = reach(x, y)
        if r_ >= 1.06:
            return -0.08
        alive = 1.0 - _smooth01(0.72, 1.0, r_)                                # the ridges sink toward the pan's edge, and are gone
        edge, ij, p = cell(x, y)
        ridge = math.exp(-(edge / 0.085) ** 2)
        lift = 0.075 + 0.05 * noise3((x, y, 0.0), 1.4, 4.0)                   # higher here, lower there
        dish = (0.022 if crusted(ij, p) else -0.05) + 0.007 * noise3((x, y, 0.0), 7.0, 1.0)
        # (a ridge is as high from either side: where one polygon's ridge was cut off at its neighbour's edge, the
        #  cut was a wall, and a wall drawn on a grid is a saw)
        return dish + (lift * alive + 0.022 - dish) * ridge - 0.085 * (1.0 - alive)

    def cf(x, y, h):
        edge, ij, p = cell(x, y)
        dust = 0.35 + 0.6 * hash01(ij[0], ij[1], 6.0)
        cc = mix(WHITE, mix(DISH, DUSTY, dust * _smooth01(0.12, 0.34, edge)), _smooth01(0.05, 0.17, edge))
        return mix(EDGE, cc, _smooth01(-0.02, 0.03, h))
    patch('pan.crust', root, 4.0, 116, hf, cf, PM, centre=(CX, CY), smooth=60.0, cut=-0.02)

    # ---- six slabs of crust levered up along the front: the game takes these ----
    for k, (sx, sy, big) in enumerate(((-2.9, -2.1, 0.27), (-1.8, -2.95, 0.22), (-0.6, -2.7, 0.29), (0.6, -3.25, 0.21), (1.8, -2.75, 0.26), (3.0, -2.2, 0.22))):
        rk = random.Random(900 + k)

        def crust(bm, at, rk=rk, big=big):
            col = lambda zf, co: mix(mix(DISH, DUSTY, 0.4), WHITE, 0.2 + 0.7 * zf)      # noqa: E731
            chunk(bm, rk, big, rk.uniform(0.24, 0.32), at, PM, col, rough=0.2)
            a, d = rk.uniform(0, TAU), big + rk.uniform(0.1, 0.18)
            more = chunk(bm, rk, big * rk.uniform(0.5, 0.7), 0.3, (at[0] + d * cos(a), at[1] + d * sin(a), 0.0), PM, col, rough=0.2)
            bmesh.ops.transform(bm, matrix=T(d * cos(a), d * sin(a), 0.0), verts=more)
        loose(root, k, (sx, sy), crust, smooth=40.0)

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
