"""
Stranded II historic landers (Family D in SPEC.md): every spacecraft that soft-landed on Mars (and
one that did not), at real size, authored headlessly in Blender through tools/assets/lib.py.

Run:   /home/user/blender-venv/bin/python tools/assets/landers.py [pathfinder] [viking] [mars3] ...
Look:  node tools/assets/preview.mjs pathfinder viking ...
       TRIS=1 before the command prints the triangle count of every bucket of geometry, and its top.

Models: pathfinder viking mars3 beagle2 mer phoenix insight msl m2020 ingenuity zhurong
schiaparelli_wreck. msl is Curiosity and m2020 is Perseverance: one builder, two variants.
Every builder starts with weathered(): old hardware is dull, so the palette's metals are made
rougher for this family, and the solar cells matte (see weathered() for why).

Layout of this file
  1. helpers: matrix-placed primitives, lathes, sweeps, the Kit (one bmesh per material per part),
     and the shared kit of spacecraft parts: solar panels of any outline, dishes, wheels, legs,
     crumpled fabric
  2. one build_<name>() per model, in the order of SPEC.md

Axes follow SPEC.md: metres, Z up, the FRONT of a model faces -Y, the origin is on the ground
under the model's centre.
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402  (imports bpy before bmesh/mathutils)
from lib import *  # noqa: E402,F401,F403

cos, sin, pi, sqrt = math.cos, math.sin, math.pi, math.sqrt


# ==============================================================================================
# 1. Helpers
# ==============================================================================================
def T(x=0.0, y=0.0, z=0.0):
    return Matrix.Translation((x, y, z))


def R(axis, deg):
    return Matrix.Rotation(rad(deg), 4, axis)


def S(x=1.0, y=1.0, z=1.0):
    return Matrix.Diagonal((x, y, z, 1.0))


I4 = Matrix.Identity(4)
YZX = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))    # prism outline (y, z), extruded along x
AX = {'X': Matrix.Rotation(pi / 2, 4, 'Y'), 'Y': Matrix.Rotation(-pi / 2, 4, 'X'), 'Z': Matrix.Identity(4)}


def frame(origin, z_axis, x_hint=(1, 0, 0)):
    """A matrix whose local +Z points along `z_axis` and whose origin is `origin`."""
    z = Vector(z_axis).normalized()
    x = Vector(x_hint)
    x = x - z * x.dot(z)
    if x.length < 1e-6:
        x = z.orthogonal()
    x.normalize()
    y = z.cross(x)
    m = Matrix((x, y, z)).transposed().to_4x4()
    m.translation = Vector(origin)
    return m


def polar(r, deg, z=0.0):
    return (r * cos(rad(deg)), r * sin(rad(deg)), z)


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))


def _mk(bm, pts, M=None):
    if M is None:
        return [bm.verts.new(p) for p in pts]
    return [bm.verts.new(M @ Vector(p)) for p in pts]


def moved(bm, verts, M):
    bmesh.ops.transform(bm, matrix=M, verts=verts)
    return verts


def box(bm, size, loc=(0, 0, 0), M=None):
    """Axis-aligned box in the local frame of M."""
    sx, sy, sz = size[0] / 2, size[1] / 2, size[2] / 2
    x, y, z = loc
    v = _mk(bm, [(x - sx, y - sy, z - sz), (x + sx, y - sy, z - sz), (x + sx, y + sy, z - sz), (x - sx, y + sy, z - sz),
                 (x - sx, y - sy, z + sz), (x + sx, y - sy, z + sz), (x + sx, y + sy, z + sz), (x - sx, y + sy, z + sz)], M)
    for q in ((3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        bm.faces.new([v[i] for i in q])
    return v


def taper_box(bm, bottom, top, z0, z1, loc=(0, 0), top_off=(0, 0), M=None):
    """A box whose top rectangle differs from its bottom rectangle (a frustum / wedge)."""
    bx, by = bottom[0] / 2, bottom[1] / 2
    tx, ty = top[0] / 2, top[1] / 2
    x, y = loc
    ox, oy = top_off
    v = _mk(bm, [(x - bx, y - by, z0), (x + bx, y - by, z0), (x + bx, y + by, z0), (x - bx, y + by, z0),
                 (x + ox - tx, y + oy - ty, z1), (x + ox + tx, y + oy - ty, z1), (x + ox + tx, y + oy + ty, z1),
                 (x + ox - tx, y + oy + ty, z1)], M)
    for q in ((3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        bm.faces.new([v[i] for i in q])
    return v


def circ(r, n, phase=0.0, ry=None):
    ry = r if ry is None else ry
    return [(r * cos(phase + TAU * i / n), ry * sin(phase + TAU * i / n)) for i in range(n)]


def ngon(r, n, phase_deg=0.0):
    return [(r * cos(rad(phase_deg) + TAU * i / n), r * sin(rad(phase_deg) + TAU * i / n)) for i in range(n)]


def rrect(w, h, r, n=3):
    """Rounded-rectangle outline, counter-clockwise."""
    r = min(r, w / 2 - 1e-4, h / 2 - 1e-4)
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180),
                       (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = rad(a0 + 90 * i / n)
            pts.append((cx + r * cos(a), cy + r * sin(a)))
    return pts


def chamf(w, h, c):
    """Chamfered-rectangle section (8 points, counter-clockwise), w across, h up."""
    a, b = w / 2, h / 2
    return [(a, -b + c), (a, b - c), (a - c, b), (-a + c, b), (-a, b - c), (-a, -b + c), (-a + c, -b), (a - c, -b)]


def prism(bm, outline, depth, M=None, z0=None, cap_bottom=True, cap_top=True):
    """Extrude a counter-clockwise outline [(x, y)] along local +Z (centred unless z0 is given)."""
    z0 = -depth / 2 if z0 is None else z0
    bot = _mk(bm, [(x, y, z0) for x, y in outline], M)
    top = _mk(bm, [(x, y, z0 + depth) for x, y in outline], M)
    n = len(outline)
    if cap_bottom:
        bm.faces.new(list(reversed(bot)))
    if cap_top:
        bm.faces.new(top)
    for i in range(n):
        bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]))
    return bot + top


def cbox(bm, size, loc=(0, 0, 0), M=None, c=0.01):
    """Box with its four vertical edges chamfered (cheap, and never a razor corner in plan)."""
    x, y, z = loc
    w, d, h = size
    return prism(bm, [(px + x, py + y) for px, py in chamf(w, d, min(c, w * 0.45, d * 0.45))], h, M, z0=z - h / 2)


def lathe(bm, profile, seg=24, M=None, arc=TAU, close=False, phase=0.0, caps=False):
    """Revolve [(radius, height)] about local Z. close=True joins the last point back to the
    first (a ring section); caps=True closes the two ends of a partial arc of such a section."""
    full = abs(arc - TAU) < 1e-6
    n = seg if full else seg + 1
    prof = list(profile)
    cols = []
    poles = {}
    for i in range(n):
        a = phase + arc * i / seg
        col = []
        for k, (r, h) in enumerate(prof):
            if r <= 1e-9:
                if k not in poles:
                    poles[k] = _mk(bm, [(0, 0, h)], M)[0]
                col.append(poles[k])
            else:
                col.append(_mk(bm, [(r * cos(a), r * sin(a), h)], M)[0])
        cols.append(col)
    m = len(prof)
    for i in range(seg):
        a, b = cols[i], cols[(i + 1) % n]
        for k in range(m if close else m - 1):
            k2 = (k + 1) % m
            quad = []
            for v in (a[k], b[k], b[k2], a[k2]):
                if v not in quad:
                    quad.append(v)
            if len(quad) >= 3:
                bm.faces.new(quad)
    if caps and close and not full:
        bm.faces.new(cols[0])
        bm.faces.new(list(reversed(cols[-1])))
    return [v for c in cols for v in c]


def disc(bm, r, z0, z1, seg=16, M=None, r2=None):
    """A capped cylinder (or frustum) standing on local Z from z0 to z1."""
    return lathe(bm, [(0.0, z0), (r, z0), (r if r2 is None else r2, z1), (0.0, z1)], seg, M)


def rod(bm, a, b, r=0.01, seg=6, r2=None, caps=True, M=None):
    """A straight round strut from a to b."""
    a, b = Vector(a), Vector(b)
    L = (b - a).length
    F = frame(a, b - a)
    if M is not None:
        F = M @ F
    r2 = r if r2 is None else r2
    prof = ([(0.0, 0.0)] if caps else []) + [(r, 0.0), (r2, L)] + ([(0.0, L)] if caps else [])
    return lathe(bm, prof, seg, F)


def ball(bm, p, r, seg=8, rings=4, M=None, sz=1.0):
    prof = [(r * sin(pi * i / rings) if 0 < i < rings else 0.0, -r * sz * cos(pi * i / rings)) for i in range(rings + 1)]
    return lathe(bm, prof, seg, (M or I4) @ T(*p))


def dome_profile(r, height, steps=6, z0=0.0, r_in=0.0, up=True):
    """Points of an elliptical dome from the rim (r, z0) to the pole, as (radius, height)."""
    out = []
    for i in range(steps + 1):
        a = (pi / 2) * i / steps
        rr = r_in + (r - r_in) * cos(a)
        out.append((rr if i < steps or r_in > 0 else 0.0, z0 + (height * sin(a) if up else -height * sin(a))))
    return out


def sweep(bm, pts, profile, up=(0, 0, 1), closed=False, caps=True, scales=None, M=None):
    """Sweep a 2D profile [(u, v)] along a polyline. v points along `up` (made perpendicular to
    the path), u = direction x up. Corners are mitred."""
    P = [Vector(p) for p in pts]
    n = len(P)
    upv = Vector(up).normalized()
    rings = []
    for i, p in enumerate(P):
        if closed:
            d_in = (p - P[i - 1]).normalized()
            d_out = (P[(i + 1) % n] - p).normalized()
        else:
            d_in = (p - P[i - 1]).normalized() if i > 0 else None
            d_out = (P[i + 1] - p).normalized() if i < n - 1 else None
            d_in = d_in if d_in is not None else d_out
            d_out = d_out if d_out is not None else d_in
        t = d_in + d_out
        t = t.normalized() if t.length > 1e-6 else d_out
        side = t.cross(upv)
        if side.length < 1e-5:
            side = t.orthogonal()
        side.normalize()
        vv = side.cross(t).normalized()
        cosh = max(0.35, t.dot(d_in))
        bend = d_out - d_in
        s = scales[i] if scales else 1.0
        ring = []
        for (u, v) in profile:
            off = side * (u * s) + vv * (v * s)
            if bend.length > 1e-6:
                b = bend.normalized()
                off += b * off.dot(b) * (1.0 / cosh - 1.0)
            ring.append(p + off)
        rings.append(_mk(bm, ring, M))
    m = len(profile)
    for i in range(n if closed else n - 1):
        a, b = rings[i], rings[(i + 1) % n]
        for j in range(m):
            bm.faces.new((a[j], b[j], b[(j + 1) % m], a[(j + 1) % m]))
    if caps and not closed:
        bm.faces.new(rings[0])
        bm.faces.new(list(reversed(rings[-1])))
    return [v for r in rings for v in r]


def fillet(pts, radius, steps=3):
    """Round the corners of a polyline (quadratic arcs of roughly the given radius)."""
    P = [Vector(p) for p in pts]
    out = [P[0]]
    for i in range(1, len(P) - 1):
        a, c, b = P[i - 1], P[i], P[i + 1]
        r = min(radius, (c - a).length * 0.45, (b - c).length * 0.45)
        p0 = c + (a - c).normalized() * r
        p1 = c + (b - c).normalized() * r
        for s in range(steps + 1):
            t = s / steps
            out.append(p0 * (1 - t) ** 2 + c * 2 * t * (1 - t) + p1 * t ** 2)
    out.append(P[-1])
    return out


def tube(bm, pts, r=0.02, seg=6, round_r=0.0, caps=True, closed=False, M=None, up=(0, 0, 1), steps=3):
    """Round tube along a polyline, optionally with filleted corners."""
    if round_r > 0:
        pts = fillet(pts, round_r, steps)
    return sweep(bm, pts, circ(r, seg), up=up, caps=caps, closed=closed, M=M)


def beam(bm, a, b, w, h, up=(0, 0, 1), c=0.0, M=None):
    """Straight box (or chamfered) beam from a to b: w across, h along `up`."""
    prof = chamf(w, h, c) if c > 0 else [(w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2), (-w / 2, -h / 2)]
    return sweep(bm, [a, b], prof, up=up, M=M)


def bolt(bm, r=0.012, h=0.008, M=None, seg=6):
    """Hex bolt head sitting on local z=0."""
    ring0 = _mk(bm, [(r * cos(TAU * i / seg), r * sin(TAU * i / seg), 0) for i in range(seg)], M)
    ring1 = _mk(bm, [(r * cos(TAU * i / seg), r * sin(TAU * i / seg), h) for i in range(seg)], M)
    for i in range(seg):
        bm.faces.new((ring0[i], ring0[(i + 1) % seg], ring1[(i + 1) % seg], ring1[i]))
    bm.faces.new(ring1)


def bolt_circle(bm, radius, count, r=0.012, h=0.008, M=None, phase=0.0, seg=6):
    M = M or I4
    for i in range(count):
        a = phase + TAU * i / count
        bolt(bm, r, h, M @ T(radius * cos(a), radius * sin(a), 0), seg)


def foil_panel(bm, M, w, h, nx=4, ny=4, jitter=0.02, seed=1, bulge=0.02, skirt=0.014):
    """A crinkled insulation blanket in local XY (flat-shaded facets), bulging along +Z. It is a
    closed pillow whose back sits `skirt` behind z=0, so push it against a wall without z-fighting."""
    rng = random.Random(seed)
    grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            edge = i in (0, nx) or j in (0, ny)
            z = 0.0 if edge else bulge + rng.uniform(-jitter, jitter)
            x = -w / 2 + w * i / nx + (0 if edge else rng.uniform(-0.25, 0.25) * w / nx)
            y = -h / 2 + h * j / ny + (0 if edge else rng.uniform(-0.25, 0.25) * h / ny)
            row.append(bm.verts.new(M @ Vector((x, y, z))))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            a, b, c, d = grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]
            if (i + j) % 2:
                bm.faces.new((a, b, c))
                bm.faces.new((a, c, d))
            else:
                bm.faces.new((a, b, d))
                bm.faces.new((b, c, d))
    rim = grid[0][:] + [grid[j][nx] for j in range(1, ny + 1)] + grid[ny][-2::-1] + [grid[j][0] for j in range(ny - 1, 0, -1)]
    back = [bm.verts.new(v.co - (M.to_3x3() @ Vector((0, 0, skirt)))) for v in rim]
    n = len(rim)
    for i in range(n):
        bm.faces.new((rim[i], back[i], back[(i + 1) % n], rim[(i + 1) % n]))
    bm.faces.new(list(reversed(back)))


# ---- noise ------------------------------------------------------------------------------------
def _hash(i, j, k, seed):
    n = ((i * 73856093) ^ (j * 19349663) ^ (k * 83492791) ^ (seed * 2654435761)) & 0xffffffff
    n = ((n ^ (n >> 13)) * 1274126177) & 0xffffffff
    return ((n ^ (n >> 16)) & 0xffff) / 65535.0


def noise3(x, y, z, seed=0):
    """Smooth value noise in 0..1."""
    xi, yi, zi = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - xi, y - yi, z - zi
    fx, fy, fz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    out = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (fx if dx else 1 - fx) * (fy if dy else 1 - fy) * (fz if dz else 1 - fz)
                out += w * _hash(xi + dx, yi + dy, zi + dz, seed)
    return out


# ---- polygons ---------------------------------------------------------------------------------
def poly_area(o):
    return 0.5 * sum(o[i][0] * o[(i + 1) % len(o)][1] - o[(i + 1) % len(o)][0] * o[i][1] for i in range(len(o)))


def ccw(o):
    o = [tuple(p[:2]) for p in o]
    return o if poly_area(o) > 0 else list(reversed(o))


def inset_poly(outline, d):
    """Offset a convex counter-clockwise outline inward by d (a number, or one per edge)."""
    n = len(outline)
    ds = d if isinstance(d, (list, tuple)) else [d] * n
    lines = []
    for i in range(n):
        a, b = Vector(outline[i]), Vector(outline[(i + 1) % n])
        e = (b - a).normalized()
        lines.append((a + Vector((-e.y, e.x)) * ds[i], e))
    out = []
    for i in range(n):
        (p0, e0), (p1, e1) = lines[i - 1], lines[i]
        den = e0.x * e1.y - e0.y * e1.x
        if abs(den) < 1e-9:
            out.append((p1.x, p1.y))
            continue
        t = ((p1.x - p0.x) * e1.y - (p1.y - p0.y) * e1.x) / den
        q = p0 + e0 * t
        out.append((q.x, q.y))
    return out


def clip_line(outline, p, d):
    """The part of the line p + t*d inside a convex counter-clockwise outline, as two points."""
    t0, t1 = -1e9, 1e9
    n = len(outline)
    for i in range(n):
        a, b = outline[i], outline[(i + 1) % n]
        nx, ny = -(b[1] - a[1]), b[0] - a[0]
        den = nx * d[0] + ny * d[1]
        num = nx * (a[0] - p[0]) + ny * (a[1] - p[1])
        if abs(den) < 1e-12:
            if num > 0:
                return None
            continue
        t = num / den
        if den > 0:
            t0 = max(t0, t)
        else:
            t1 = min(t1, t)
    if t1 - t0 < 1e-3:
        return None
    return (p[0] + d[0] * t0, p[1] + d[1] * t0), (p[0] + d[0] * t1, p[1] + d[1] * t1)


def soft_ngon(r, n=5, soft=0.5, per=4, centre=(0.0, 0.0), phase_deg=0.0):
    """A regular n-gon with its corners rounded off toward a circle (soft=0: the polygon, 1: a
    circle), `per` points to a side, counter-clockwise; r is its greatest radius. One corner points
    along phase_deg, so with an odd n a flat faces the opposite way."""
    out = []
    step = TAU / n
    for i in range(n * per):
        th = TAU * i / (n * per)
        poly = cos(step / 2) / cos((th % step) - step / 2)
        rr = r * ((1.0 - soft) * poly + soft * (1.0 + cos(step / 2)) / 2) / ((1.0 - soft) + soft * (1.0 + cos(step / 2)) / 2)
        out.append((centre[0] + rr * cos(th + rad(phase_deg)), centre[1] + rr * sin(th + rad(phase_deg))))
    return out


# ---- materials of hardware that has stood on Mars for years --------------------------------------
def weathered():
    """Call first in every builder. Nothing on an old lander is polished any more: the palette's
    metals are redefined rougher (same names, same colours), so a flat facet that happens to face
    the sun spreads its highlight instead of mirroring it into a blown-out glint, and the solar
    cells lose the glassy reflection that made them the colour of the sky at a low angle. The
    one-off materials below are the real hardware colours the palette lacks."""
    mat('aluminium', color=(0.50, 0.51, 0.54), metallic=0.75, roughness=0.58)
    mat('steel', roughness=0.62)
    mat('titanium', roughness=0.62)
    mat('gold_foil', roughness=0.52)
    mat('copper', roughness=0.60)
    mat('lens', metallic=0.0, roughness=0.20)
    mat('solar_cell', color=(0.010, 0.022, 0.085), metallic=0.10, roughness=0.62)
    mat('cell_grid', color=(0.085, 0.10, 0.15), metallic=0.2, roughness=0.60)       # interconnects between cells
    mat('kapton_black', color=(0.028, 0.026, 0.026), metallic=0.0, roughness=0.60)  # black film, composite edges
    mat('vectran', color=(0.68, 0.65, 0.57), metallic=0.0, roughness=0.92)          # airbag cloth: pale straw, far lighter than the soil
    mat('paint_olive', color=(0.30, 0.31, 0.26), metallic=0.1, roughness=0.60)      # Viking's grey-olive body paint
    mat('cover_grey', color=(0.50, 0.47, 0.42), metallic=0.0, roughness=0.75)       # its RTG wind covers: a warm grey, not the dish's white
    mat('tank_wrap', color=(0.62, 0.55, 0.38), metallic=0.45, roughness=0.50)       # its propellant tanks in their pale gold insulation
    mat('flag_red', color=(0.50, 0.05, 0.06), metallic=0.0, roughness=0.7)
    mat('flag_blue', color=(0.04, 0.07, 0.28), metallic=0.0, roughness=0.7)
    mat('blanket_white', color=(0.84, 0.84, 0.82), metallic=0.0, roughness=0.92)    # white thermal cloth
    mat('scorched', color=(0.040, 0.036, 0.034), metallic=0.0, roughness=0.95)      # burnt metal and soot
    mat('ground_dust', color=(0.38, 0.225, 0.14), metallic=0.0, roughness=1.0)      # the surface itself, for aprons that feather into it


# ---- the Kit: one bucket of geometry per material for a part -----------------------------------
class Kit:
    """k = Kit(part_node); k('aluminium') is a bmesh for that material under that part.
    k('painted_white', smooth=25, bevel=0.01) is a separate bucket with its own shading angle and
    chamfer. k(('foam', 'painted_white')) is a bucket whose faces pick a material by
    face.material_index (for closed shells that are one colour outside and another inside).
    flush() orients every face outward and turns each bucket into a helper mesh."""

    def __init__(self, parent, tag=''):
        self.parent, self.tag, self.b = parent, tag or parent.name, {}

    def __call__(self, material, smooth=38.0, bevel=0.0):
        key = (material, smooth, bevel)
        if key not in self.b:
            self.b[key] = bm_new()
        return self.b[key]

    def flush(self):
        for (material, smooth, bevel), bm in self.b.items():
            if not bm.faces:
                bm.free()
                continue
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
            mname = material if isinstance(material, str) else '+'.join(material)
            name = f'{self.tag}_{mname}_{int(smooth)}_{int(bevel * 1000)}'
            if os.environ.get('TRIS'):
                print(f'    {name:44s} {sum(len(f.verts) - 2 for f in bm.faces):6d}   top {max(v.co.z for v in bm.verts):.2f}')
            mesh_obj(name, bm, material if isinstance(material, str) else list(material), parent=self.parent, bevel=bevel,
                     bevel_segments=1, smooth_angle=smooth)
        self.b = {}


def report_parts(root):
    """Triangles per part node (after export_model has collapsed the helpers)."""
    rows = []
    for o in [root] + lib._descendants(root):
        if o.type == 'MESH':
            rows.append((o.parent.name if o.parent else o.name, sum(len(p.vertices) - 2 for p in o.data.polygons),
                         len(o.data.materials)))
    print('  parts:', ', '.join(f'{n}={t} tris/{m} mats' for n, t, m in rows))


def finish(root, name, kits, ao_distance=0.7, samples=24, tints=None):
    for k in kits:
        k.flush()
    if tints is None:
        info = export_model(root, name, ao_samples=samples, ao_distance=ao_distance)
    else:                                            # paint goes on after the bake, so the steps are taken one at a time
        collapse(root)
        bake_ao(root, samples=samples, distance=ao_distance)
        tints.apply(root)
        info = export_model(root, name, ao=False, do_collapse=False)
    report_parts(root)
    return info


class Tints:
    """Colour laid on per vertex after the occlusion bake. The game draws a plain material's colour
    times the vertex colour, so a white part can be any colour and a part of any colour can be
    darker in places, without another material: `with tints.on(bm, (r, g, b)):` tints every vertex
    made in `bm` inside the block (use it in buckets without a bevel, whose points stay where they
    were put), tints.at(points, rgb) tints the vertices at those places, and finish(..., tints=)
    multiplies them into the baked occlusion."""

    def __init__(self):
        self.marks = []

    def on(self, bm, rgb):
        return _TintBlock(self, bm, rgb)

    def at(self, points, rgb):
        self.marks.extend((Vector(p), rgb) for p in points)

    def apply(self, root, eps=2e-4):
        if not self.marks:
            return
        from mathutils.kdtree import KDTree
        kd = KDTree(len(self.marks))
        for i, (p, _) in enumerate(self.marks):
            kd.insert(p, i)
        kd.balance()
        for o in [root] + lib._descendants(root):
            if o.type != 'MESH':
                continue
            attr = o.data.color_attributes.get('Col')
            mw = o.matrix_world
            for i, v in enumerate(o.data.vertices):
                _, j, dist = kd.find(mw @ v.co)
                if dist < eps:
                    c, t = attr.data[i].color, self.marks[j][1]
                    attr.data[i].color = (c[0] * t[0], c[1] * t[1], c[2] * t[2], 1.0)


class _TintBlock:
    def __init__(self, tints, bm, rgb):
        self.tints, self.bm, self.rgb = tints, bm, rgb

    def __enter__(self):
        self.n = len(self.bm.verts)

    def __exit__(self, *exc):
        self.tints.marks.extend((v.co.copy(), self.rgb) for v in list(self.bm.verts)[self.n:])


def crinkle(verts, amount, seed=1):
    """Jitter the points of a blanket (each once, repeatably), so that its flat-shaded facets catch
    the light unevenly, the way foil does."""
    for v in dict.fromkeys(verts):
        q = (int(round(v.co.x * 2e3)), int(round(v.co.y * 2e3)), int(round(v.co.z * 2e3)))
        v.co += Vector((_hash(q[0], q[1], q[2], seed) - 0.5, _hash(q[1], q[2], q[0], seed + 1) - 0.5,
                        _hash(q[2], q[0], q[1], seed + 2) - 0.5)) * (2.0 * amount)


# ---- spacecraft kit ---------------------------------------------------------------------------
def solar_poly(sub, cell, outline, M, t=0.02, margin=0.02, pitch=(0.10, 0.10), strip=0.007, grid_dir=0.0,
               origin=(0.0, 0.0), grid=None):
    """A solar panel of any convex outline lying in local XY with its underside on z=0: a substrate
    of thickness t, a slab of cells inset by `margin`, and fine interconnect lines every `pitch`.
    grid_dir (degrees) turns the cell grid in the plane; `origin` is a point a line passes through.
    The lines go to `grid` (default: the substrate's bucket). They stand only a millimetre above
    the cells and should be a dull material: a bright or tall grid hides the cells at the low
    angles a person sees a deck from, and the array stops reading as dark."""
    o = ccw(outline)
    prism(sub, o, t, M, z0=0.0)
    inner = inset_poly(o, margin)
    prism(cell, inner, 0.008, M, z0=t - 0.002, cap_bottom=False)
    grid = sub if grid is None else grid
    zc = t + 0.0057
    ext = max(max(abs(p[0]), abs(p[1])) for p in o) * 4 + 4
    ca, sa = cos(rad(grid_dir)), sin(rad(grid_dir))
    for (dx, dy), step in (((ca, sa), pitch[1]), ((-sa, ca), pitch[0])):
        if not step:
            continue
        nx, ny = -dy, dx                                   # lines run along (dx, dy), repeated along (nx, ny)
        nmax = int(ext / step)
        for i in range(-nmax, nmax + 1):
            p = (origin[0] + nx * step * i, origin[1] + ny * step * i)
            seg = clip_line(inner, p, (dx, dy))
            if seg is None:
                continue
            (ax, ay), (bx, by) = seg
            if (bx - ax) ** 2 + (by - ay) ** 2 < 0.03 ** 2:
                continue
            beam(grid, (ax, ay, zc), (bx, by, zc), strip, 0.0036, M=M)


def dish(shell, fit, M, r, depth, seg=24, feed=True, rim=0.006, struts=3, back_ribs=6, thick=0.012):
    """A parabolic reflector opening along local +Z with its vertex at the origin."""
    kq = depth / (r * r)
    rs = [r, r * 0.84, r * 0.64, r * 0.42, r * 0.2]
    prof = [(q, kq * q * q) for q in rs] + [(0.0, 0.0), (0.0, -thick)] + [(q, kq * q * q - thick) for q in reversed(rs)]
    lathe(shell, prof, seg, M, close=True)
    if rim:
        lathe(fit, [(r + rim, depth - thick - 0.004), (r + rim, depth + 0.004), (r - rim, depth + 0.004),
                    (r - rim, depth - thick - 0.004)], seg, M, close=True)
    for i in range(back_ribs):
        Mr = M @ R('Z', 360 * i / back_ribs + 15)
        prism(fit, [(r * 0.16, -thick - r * 0.16), (r * 0.9, kq * r * r * 0.81 - thick - 0.012),
                    (r * 0.9, kq * r * r * 0.81 - thick + 0.002), (r * 0.55, kq * r * r * 0.3025 - thick + 0.002),
                    (r * 0.16, -thick + 0.002)], max(0.006, r * 0.02), Mr @ R('X', 90))
    if feed:
        f = min(1.0 / (4 * kq), r * 1.1)                 # focal length (clamped for shallow dishes)
        for i in range(struts):
            a = TAU * i / struts + pi / 2
            rod(fit, (r * 0.92 * cos(a), r * 0.92 * sin(a), kq * (r * 0.92) ** 2), (r * 0.06 * cos(a), r * 0.06 * sin(a), f),
                max(0.004, r * 0.014), 5, M=M)
        lathe(fit, [(0.0, f - r * 0.05), (r * 0.10, f - r * 0.05), (r * 0.07, f + r * 0.08), (0.0, f + r * 0.08)], 8, M)


def footpad(bm, M, r=0.15, h=0.05, seg=14):
    """A dished lander footpad sitting on local z=0 with its ball socket on top."""
    lathe(bm, [(0.0, 0.0), (r * 0.72, 0.0), (r, h * 0.55), (r, h), (r * 0.9, h), (r * 0.66, h * 0.5), (r * 0.26, h * 0.5),
               (r * 0.2, h * 1.5), (0.0, h * 1.5)], seg, M)


def blob(bm, M, rx, ry, h, seed=1, nu=18, pleats=7, rough=0.3, pleat_depth=0.45, rings=None):
    """Deflated fabric (an airbag lobe, a heap of parachute): a low rumpled mound over an ellipse
    with a rolled edge and radial gathers, open underneath."""
    rings = rings or ((1.0, 0.0), (0.96, 0.5), (0.74, 0.9), (0.46, 1.0), (0.2, 0.93))
    rows = []
    for j, (rf, hf) in enumerate(rings):
        row = []
        for i in range(nu):
            a = TAU * i / nu
            n1 = noise3(1.7 * cos(a) + 5, 1.7 * sin(a) + 5, 0.3, seed)           # outline wobble (same for every ring)
            n2 = noise3(3.1 * rf * cos(a) + 9, 3.1 * rf * sin(a) + 9, 4.0, seed + 11)
            fold = abs(sin(pleats * a / 2 + seed * 1.3 + 2.0 * n1)) if pleats else 1.0
            f = rf * (1 + rough * (n1 - 0.5)) * (1 - 0.10 * (1 - fold) * (1 if j < 2 else 0.4))
            z = h * hf * (1 - pleat_depth * (1 - fold) * (0.9 if j in (1, 2) else 0.5)) * (1 + rough * 1.4 * (n2 - 0.5))
            row.append(bm.verts.new(M @ Vector((rx * f * cos(a), ry * f * sin(a), z if j else -0.01))))
        rows.append(row)
    top = bm.verts.new(M @ Vector((0.03 * rx, -0.02 * ry, h * (0.86 + 0.2 * (noise3(1, 2, 3, seed) - 0.5)))))
    for a, b in zip(rows, rows[1:]):
        for i in range(nu):
            bm.faces.new((a[i], a[(i + 1) % nu], b[(i + 1) % nu], b[i]))
    for i in range(nu):
        bm.faces.new((rows[-1][i], rows[-1][(i + 1) % nu], top))


def point_in_poly(o, x, y):
    """Signed margin of (x, y) inside a convex counter-clockwise outline (positive = inside)."""
    m = 1e9
    n = len(o)
    for i in range(n):
        a, b = o[i], o[(i + 1) % n]
        ex, ey = b[0] - a[0], b[1] - a[1]
        L = sqrt(ex * ex + ey * ey)
        m = min(m, (ex * (y - a[1]) - ey * (x - a[0])) / L)
    return m


def smooth01(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3.0 - 2.0 * t)


# The section of one lobe of a deflated airbag from the ground up to its crown, as (radius, height)
# fractions: one that still holds some shape, and one that has slumped over itself in a roll with a tuck
# above it. Both bulge beyond their footing: steep cloth is what the dust leaves pale.
_LOBE_PLUMP = ((0.90, -0.12), (0.975, 0.10), (1.00, 0.38), (0.965, 0.64), (0.86, 0.84), (0.66, 0.955), (0.38, 0.95))
_LOBE_SLUMP = ((0.94, -0.12), (1.03, 0.08), (1.00, 0.24), (0.90, 0.30), (0.88, 0.56), (0.70, 0.74), (0.40, 0.78))


def bag_lobe(bm, c, yaw, a, b, h, seed=1, seg=18, slump=0.5, cinch=0.35, sag=0.2, lean=0.12, limit=None, rings=7):
    """One lobe of a deflated airbag lying on the ground at c = (x, y): a slack pillow a x b (half
    lengths along and across the local x axis, which is turned `yaw` degrees) and h high, bulging at
    its sides and sagging on top. `slump` (0..1) is how much of its rim has rolled over itself, `sag`
    how far the middle of its top has sunk;
    `cinch` is how deep its tether cord (lying along local x, over the crown) has drawn it in;
    puckers at every 60 degrees are its panel seams. limit(x, y, z) -> z presses it down under
    hardware. Open underneath. seg must be a multiple of 6; rings=6 leaves out the last ring before the
    crown (for a lobe that is mostly hidden). Returns (rings of verts [ring][i], crown vert)."""
    cy, sy = cos(rad(yaw)), sin(rad(yaw))
    rows = []
    crown_f = 0.0
    for j in range(rings):
        row = []
        for i in range(seg):
            ang = TAU * i / seg
            ca, sa = cos(ang), sin(ang)
            s = smooth01(0.25, 0.75, noise3(1.2 * ca + 3, 1.2 * sa + 3, 0.5, seed) + slump - 0.5)
            rf = _LOBE_PLUMP[j][0] + (_LOBE_SLUMP[j][0] - _LOBE_PLUMP[j][0]) * s
            zf = _LOBE_PLUMP[j][1] + (_LOBE_SLUMP[j][1] - _LOBE_PLUMP[j][1]) * s
            sq = (abs(ca) ** 2.25 + abs(sa) ** 2.25) ** (-1 / 2.25)              # a pillow in plan, not a disc
            rf *= sq * (1.0 + 0.26 * (noise3(1.1 * ca + 7, 1.1 * sa + 7, 0.2, seed + 1) - 0.5))
            seam = max(0.0, cos(6 * ang)) ** 4                                # 1 on a panel seam
            rf *= 1.0 - 0.035 * seam * (1.0 if 0 < j < 5 else 0.3)
            end = math.exp(-(sa / 0.30) ** 2)                                 # 1 at the two ends the cord comes over
            rf *= 1.0 - 0.15 * cinch * end * (0.4 + 0.6 * smooth01(0.0, 0.6, zf))
            x, y = a * rf * ca, b * rf * sa
            z = h * zf
            if zf > 0.0:
                z *= 1.0 - lean * ca * rf                                      # heaped toward the lander
                z *= 0.86 + 0.28 * noise3(x * 3.6 + 2, y * 3.6 + 5, 1.3, seed + 2)   # the slack lies unevenly
                z *= 1.0 - sag * smooth01(0.80, 0.30, _LOBE_PLUMP[j][0])       # ... and the top has sunk in
                z *= 1.0 - cinch * math.exp(-(y / (0.22 * b)) ** 2) * smooth01(0.30, 0.85, zf)
            wx, wy = c[0] + x * cy - y * sy, c[1] + x * sy + y * cy
            if limit is not None and z > 0.0:
                z = limit(wx, wy, z)
            row.append(bm.verts.new((wx, wy, z)))
        rows.append(row)
    z = h * (0.90 - 0.14 * slump) * (1.0 - cinch) * (1.0 - sag) * (0.86 + 0.28 * noise3(2, 5, 1.3, seed + 2))
    crown = bm.verts.new((c[0], c[1], limit(c[0], c[1], z) if limit is not None else z))
    for ra, rb in zip(rows, rows[1:]):
        for i in range(seg):
            bm.faces.new((ra[i], ra[(i + 1) % seg], rb[(i + 1) % seg], rb[i]))
    for i in range(seg):
        bm.faces.new((rows[-1][i], rows[-1][(i + 1) % seg], crown))
    return rows, crown


def welt(bm, pts, out, w=0.010, h=0.008):
    """A stitched seam: a low ridge along a line of points on the cloth; `out` is the way the cloth
    faces at each of them. Wound by construction (the ridge has no underside)."""
    P = [Vector(p) for p in pts]
    rows = []
    for i, p in enumerate(P):
        d = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized()
        o = Vector(out[i]).normalized()
        t = o.cross(d).normalized()
        rows.append((bm.verts.new(p + t * w - o * 0.004), bm.verts.new(p + o * h), bm.verts.new(p - t * w - o * 0.004)))
    for ra, rb in zip(rows, rows[1:]):
        bm.faces.new((ra[0], ra[1], rb[1], rb[0]))
        bm.faces.new((ra[1], ra[2], rb[2], rb[1]))


def lobe_seams(bm, rows, crown, girth=2, arc=None):
    """The seams of a lobe made by bag_lobe: the girth seam round its side and the panel seams that
    climb from it to the crown. `arc` = (first, last) column limits them to the side that is seen."""
    seg = len(rows[0])
    cz = crown.co.z
    centre = Vector((crown.co.x, crown.co.y, 0.0))

    def facing(v):
        o = v.co - centre
        o.z = max(0.0, v.co.z - 0.45 * cz) * 1.6
        return o

    first, last = arc if arc is not None else (0, seg)
    cols = [i % seg for i in range(first, last + 1)]
    ring = [rows[girth][i] for i in cols]
    welt(bm, [v.co for v in ring], [facing(v) for v in ring])
    for i in cols:
        if (i * 6) % seg == 0 and (i * 2) % seg != 0:                         # the panel seams (not where the cord lies)
            line = [rows[j][i] for j in range(girth, min(len(rows), girth + 4))]
            welt(bm, [v.co for v in line], [facing(v) for v in line])


def wheel(rim, hub, M, r, w, seg=20, th=0.006, cleats=12, cleat_h=0.006, cleat_t=0.006, chevron=0.0, crown=0.04,
          spokes=6, spoke_twist=0.0, spoke_w=0.02, spoke_t=0.004, hub_r=None, hub_x=0.0, spoke_bm=None, cleat_bm=None,
          hub_len=None, cap=True, curved=False, lean=False, morse=None, morse_at=0.0):
    """A rover wheel with its axle on local Z (z = +w/2 is the outboard side). `rim` takes the tyre
    band and cleats, `hub` the hub drum; spokes go to spoke_bm (default hub). lean=True saves a
    quarter of the band's and the grousers' triangles where they are not missed: the inside of the
    band is a plain cylinder, and the grousers' centimetre-square ends are left open.
    morse: a bmesh (hand-wound, of a black material) for the slots cut through Curiosity's tread,
    three rows of short and long holes that spell J, P, L in Morse and print it in the soil at every
    turn of the wheel; morse_at is where round the wheel they begin, in degrees."""
    spoke_bm = spoke_bm or hub
    cleat_bm = cleat_bm or rim
    hw = w / 2
    r0 = r * (1 - crown)
    prof = [(r0, -hw), (r, -hw * 0.62), (r, hw * 0.62), (r0, hw), (r0 - th, hw)]
    prof += [(r0 - th, -hw)] if lean else [(r - th, hw * 0.62), (r - th, -hw * 0.62), (r0 - th, -hw)]
    lathe(rim, prof, seg, M, close=True)
    for i in range(cleats):
        a = 360.0 * i / cleats
        Mc = M @ R('Z', a) @ T(r + cleat_h / 2 - 0.001, 0, 0)
        if chevron:                                   # a V-shaped grouser that follows the tread, open underneath
            st = []                                   # (curved=True: a gentle arc with a ridge section instead of a V)
            vee = ((-hw * 0.97, chevron), (0.0, 0.0), (hw * 0.97, chevron))
            arc = ((-hw * 0.97, chevron * 0.94), (-hw * 0.36, chevron * 0.13), (hw * 0.36, chevron * 0.13), (hw * 0.97, chevron * 0.94))
            for zz, off in (arc if curved else vee):
                a0 = rad(a) + off / r
                rr = r0 if abs(zz) > hw * 0.9 else r
                da, db = cleat_t / r, cleat_t * 0.55 / r
                if curved:
                    st.append(_mk(cleat_bm, [(rr * 0.995 * cos(a0 - da), rr * 0.995 * sin(a0 - da), zz),
                                             ((rr + cleat_h) * cos(a0), (rr + cleat_h) * sin(a0), zz),
                                             (rr * 0.995 * cos(a0 + da), rr * 0.995 * sin(a0 + da), zz)], M))
                else:
                    st.append(_mk(cleat_bm, [(rr * 0.995 * cos(a0 - da), rr * 0.995 * sin(a0 - da), zz),
                                             ((rr + cleat_h) * cos(a0 - db), (rr + cleat_h) * sin(a0 - db), zz),
                                             ((rr + cleat_h) * cos(a0 + db), (rr + cleat_h) * sin(a0 + db), zz),
                                             (rr * 0.995 * cos(a0 + da), rr * 0.995 * sin(a0 + da), zz)], M))
            for p0, p1 in zip(st, st[1:]):
                for j in range(len(p0) - 1):
                    cleat_bm.faces.new((p0[j], p1[j], p1[j + 1], p0[j + 1]))
            if not lean:
                cleat_bm.faces.new(st[0])
                cleat_bm.faces.new(list(reversed(st[-1])))
        else:
            box(cleat_bm, (cleat_h, cleat_t, w * 0.94), (0, 0, 0), Mc)
    if morse is not None:
        dot, dash, gap, wide, rm = 0.015 / r, 0.038 / r, 0.014 / r, w * 0.05, r + 0.0015
        for row, code in enumerate(('.---', '.--.', '.-..')):
            zc = (row - 1) * w * 0.2
            a = rad(morse_at)
            for sym in code:
                a1 = a + (dot if sym == '.' else dash)
                quad = _mk(morse, [(rm * cos(a), rm * sin(a), zc - wide), (rm * cos(a1), rm * sin(a1), zc - wide), (rm * cos(a1), rm * sin(a1), zc + wide),
                                   (rm * cos(a), rm * sin(a), zc + wide)], M)
                morse.faces.new(quad if M.determinant() > 0 else quad[::-1])
                a = a1 + gap
    hub_r = hub_r or r * 0.3
    hub_len = hub_len or w * 0.5
    z0, z1 = hub_x - hub_len / 2, hub_x + hub_len / 2
    hp = [(0.0, z0), (hub_r * 0.85, z0), (hub_r, z0 + 0.006), (hub_r, z1 - 0.006), (hub_r * 0.85, z1)]
    hp += [(hub_r * 0.5, z1 + hub_r * 0.18), (0.0, z1 + hub_r * 0.18)] if cap else [(0.0, z1)]
    lathe(hub, hp, max(8, seg // 2), M)
    for i in range(spokes):
        a0 = TAU * i / spokes
        a1 = a0 + spoke_twist
        p0 = (hub_r * 0.9 * cos(a0), hub_r * 0.9 * sin(a0), hub_x)
        p1 = ((r - th) * cos(a1), (r - th) * sin(a1), hub_x * 0.3)
        if spoke_twist:
            am = (a0 + a1) / 2
            rm = (hub_r + r - th) / 2 * 1.06
            pm = (rm * cos(am + spoke_twist * 0.12), rm * sin(am + spoke_twist * 0.12), hub_x * 0.65)
            sweep(spoke_bm, [p0, pm, p1], [(spoke_t / 2, -spoke_w / 2), (spoke_t / 2, spoke_w / 2), (-spoke_t / 2, spoke_w / 2),
                                           (-spoke_t / 2, -spoke_w / 2)], up=(0, 0, 1), M=M)
        else:
            beam(spoke_bm, p0, p1, spoke_t, spoke_w, up=(0, 0, 1), M=M)


def lattice_mast(bm, M, r, height, bays=5, rr=0.005, twist=0.0, seg=4):
    """A deployable three-longeron mast standing on local Z: longerons, batten triangles, diagonals."""
    cols = []
    for j in range(bays + 1):
        z = height * j / bays
        cols.append([(r * cos(TAU * i / 3 + twist * j), r * sin(TAU * i / 3 + twist * j), z) for i in range(3)])
    for j in range(bays):
        for i in range(3):
            rod(bm, cols[j][i], cols[j + 1][i], rr, seg, caps=False, M=M)
            rod(bm, cols[j][i], cols[j + 1][(i + 1) % 3], rr * 0.55, 3, caps=False, M=M)
    for j in range(bays + 1):
        for i in range(3):
            rod(bm, cols[j][i], cols[j][(i + 1) % 3], rr * 0.8, seg, caps=False, M=M)


def lander_leg(bm, top, foot, brace_l, brace_r, r=0.03, knee=0.42, seg=8, pad_bm=None, pad_r=0.15, sleeve=None):
    """A tripod landing leg: a telescoping main strut from `top` down to the footpad at `foot`
    (the pad's centre on the ground) and two side braces from the body to the lower strut."""
    top, foot = Vector(top), Vector(foot)
    ankle = foot + Vector((0, 0, pad_r * 0.42))
    axis = top - ankle
    L = axis.length
    F = frame(ankle, axis)
    lathe(bm, [(0.0, 0.0), (r * 0.72, 0.0), (r * 0.72, L * knee), (r * 1.25, L * knee), (r * 1.25, L * knee + r * 0.8),
               (r, L * knee + r * 1.2), (r, L - r * 1.5), (r * 1.3, L - r * 1.2), (r * 1.3, L), (0.0, L)], seg, F)
    if sleeve is not None:
        lathe(sleeve, [(r * 1.12, L * (knee + 0.12)), (r * 1.12, L * 0.9)], seg, F)
    kp = ankle + axis * (knee * 0.55)
    for b in (brace_l, brace_r):
        rod(bm, b, kp, r * 0.6, 6)
        ball(bm, b, r * 0.95, 6, 3)
    ball(bm, kp, r * 1.25, 8, 4)
    ball(bm, ankle, r * 1.2, 8, 4)
    footpad(pad_bm or bm, T(*foot), pad_r, pad_r * 0.36)


# ==============================================================================================
# 2. Models
# ==============================================================================================
def _sojourner(parent, loc, heading):
    """The Sojourner rover (0.65 m long, 0.48 m wide, 0.30 m tall) as the part `sojourner`."""
    sj = part('sojourner', parent, loc=loc, rot=(0, 0, rad(heading)))
    k = Kit(sj)
    alu, gold, cell, dark, steel = k('aluminium'), k('gold_foil', 28), k('solar_cell'), k('painted_dark'), k('steel')
    grid = k('cell_grid')
    WR, WW, X = 0.065, 0.075, 0.205
    ys = (-0.235, 0.015, 0.235)
    # warm electronics box: gold-wrapped tub under the solar deck
    taper_box(gold, (0.30, 0.46), (0.32, 0.50), 0.135, 0.265, loc=(0, 0.005))
    for sx in (-1, 1):
        foil_panel(gold, T(sx * 0.158, 0.005, 0.20) @ R('Y', sx * 90) @ R('Z', 90), 0.42, 0.10, 4, 2, 0.006, seed=3 + sx, bulge=0.006)
    cbox(alu, (0.36, 0.60, 0.012), (0, 0.0, 0.271), c=0.02)
    solar_poly(alu, cell, [(-0.17, -0.29), (0.17, -0.29), (0.17, 0.29), (-0.17, 0.29)], T(0, 0, 0.277), t=0.008, margin=0.012,
               pitch=(0.068, 0.058), strip=0.004, grid=grid)
    # front cameras and laser stripe projectors, rear spectrometer on its deployment arm
    cbox(dark, (0.22, 0.03, 0.045), (0, -0.238, 0.225), c=0.006)
    lens = k('lens')
    for sx in (-1, 1):
        disc(lens, 0.014, 0.0, 0.012, 8, T(sx * 0.075, -0.25, 0.225) @ R('X', 90))
        disc(alu, 0.007, 0.0, 0.014, 6, T(sx * 0.035, -0.25, 0.232) @ R('X', 90))
    disc(alu, 0.007, 0.0, 0.014, 6, T(0, -0.25, 0.214) @ R('X', 90))
    rod(alu, (0.06, 0.235, 0.20), (0.06, 0.305, 0.13), 0.008, 6)
    disc(steel, 0.026, 0.0, 0.05, 10, T(0.06, 0.30, 0.135) @ R('X', -60))
    disc(dark, 0.02, 0.05, 0.058, 10, T(0.06, 0.30, 0.135) @ R('X', -60))
    # whip antenna on the rear corner, material-adherence strip on the deck edge
    rod(steel, (-0.15, 0.27, 0.285), (-0.15, 0.275, 0.62), 0.0035, 5)
    disc(alu, 0.012, 0.277, 0.31, 8, T(-0.15, 0.27, 0))
    # rocker-bogie: a rocker to the rear wheel and bogie pivot, a bogie carrying front and middle wheels
    for sx in (-1, 1):
        x = sx * 0.168
        piv = (x, 0.07, 0.185)
        bog = (x, -0.11, 0.125)
        ball(alu, piv, 0.016, 6, 3)
        beam(alu, piv, (x, ys[2] - 0.01, 0.12), 0.012, 0.022, up=(0, 0, 1))
        beam(alu, piv, bog, 0.012, 0.022, up=(0, 0, 1))
        ball(alu, bog, 0.014, 6, 3)
        beam(alu, bog, (x, ys[0] + 0.015, 0.10), 0.011, 0.02, up=(0, 0, 1))
        beam(alu, bog, (x, ys[1], 0.10), 0.011, 0.02, up=(0, 0, 1))
        for y in ys:
            wx = sx * X
            rod(alu, (x, y + (0.015 if y == ys[0] else -0.01 if y == ys[2] else 0), 0.10 if y != ys[2] else 0.12),
                (x, y, WR + 0.02), 0.009, 6)
            disc(dark, 0.022, -0.02, 0.022, 8, T(x, y, WR) @ AX['X'])
            Mw = T(wx, y, WR) @ AX['X'] @ S(1, 1, sx)
            wheel(alu, alu, Mw, WR, WW, seg=14, th=0.004, cleats=0, crown=0.06, spokes=0, hub_r=0.02, hub_len=0.03,
                  hub_x=-0.01)
            lathe(alu, [(0.02, -0.02), (WR - 0.004, -0.012), (WR - 0.004, -0.006), (0.02, -0.012)], 14, Mw, close=True)
            for i in range(12):                                   # rows of steel cleats
                for zz in (-0.02, 0.02):
                    lathe(steel, [(0.006, 0.0), (0.0, 0.016)], 3, Mw @ R('Z', 30 * i + (15 if zz > 0 else 0)) @ T(WR - 0.002, 0, zz) @ AX['X'])
    return sj, k


def build_pathfinder():
    """Mars Pathfinder (the Carl Sagan Memorial Station): the opened tetrahedron on its deflated
    airbags, the camera mast, antennas, the two rover ramps, and Sojourner beside it."""
    weathered()
    root = part('pathfinder')
    k = Kit(root)
    alu, cell, white, gold = k('aluminium'), k('solar_cell'), k('painted_white', 30), k('gold_foil', 28)
    dark, lens, grid = k('painted_dark'), k('lens'), k('cell_grid')
    a = 1.30                                    # edge of the base petal
    Rc, ri, zb = a / sqrt(3), a / (2 * sqrt(3)), 0.31
    hgt = a * sqrt(3) / 2

    # --- base petal ---
    tri = [polar(Rc - 0.04, 90 + 120 * i)[:2] for i in range(3)]
    base = []
    for i in range(3):                           # clip the three corners
        p, q0, q1 = Vector(tri[i]), Vector(tri[i - 1]), Vector(tri[(i + 1) % 3])
        base += [tuple(p + (q0 - p).normalized() * 0.10), tuple(p + (q1 - p).normalized() * 0.10)]
    prism(alu, base, 0.07, T(0, 0, zb - 0.075), z0=0.0)
    solar_poly(alu, cell, base, T(0, 0, zb - 0.012), t=0.012, margin=0.03, pitch=(0.085, 0.085), strip=0.005, grid=grid)
    lathe(alu, [(0.50, 0.02), (0.56, zb - 0.07)], 12, I4)          # structure down into the airbags

    # --- three side petals, hinged on the base edges, drooping onto the bags ---
    petal = [(-0.61, 0.03), (0.61, 0.03), (0.105, 0.93), (-0.105, 0.93)]
    droop = {-90: -7.0, 30: -5.0, 150: -8.5}
    PM = {}
    for th, dr in droop.items():
        Mp = R('Z', th - 90) @ T(0, ri, zb - 0.01) @ R('X', dr)
        PM[th] = Mp
        prism(white, petal, 0.035, Mp, z0=-0.04)
        if th == -90:                                             # rover petal: cells either side of the rover deck
            solar_poly(alu, cell, [(-0.61, 0.03), (-0.20, 0.03), (-0.20, 0.50), (-0.345, 0.50)], Mp @ T(0, 0, -0.006),
                       t=0.01, margin=0.02, pitch=(0.085, 0.085), strip=0.005, grid=grid)
            solar_poly(alu, cell, [(0.20, 0.03), (0.61, 0.03), (0.345, 0.50), (0.20, 0.50)], Mp @ T(0, 0, -0.006),
                       t=0.01, margin=0.02, pitch=(0.085, 0.085), strip=0.005, grid=grid)
            solar_poly(alu, cell, [(-0.30, 0.58), (0.30, 0.58), (0.105, 0.93), (-0.105, 0.93)], Mp @ T(0, 0, -0.006),
                       t=0.01, margin=0.02, pitch=(0.085, 0.085), strip=0.005, grid=grid)
            prism(alu, [(-0.35, 0.03), (0.35, 0.03), (0.35, 0.58), (-0.35, 0.58)], 0.008, Mp, z0=-0.006)
            for y in (0.20, 0.44):                                # rover tie-down rails and hold-down posts
                beam(alu, (-0.33, y, 0.012), (0.33, y, 0.012), 0.05, 0.016, M=Mp)
                for sx in (-1, 1):
                    disc(dark, 0.016, 0.0, 0.05, 6, Mp @ T(sx * 0.19, y, 0.01))
        else:
            solar_poly(alu, cell, petal, Mp @ T(0, 0, -0.006), t=0.01, margin=0.028, pitch=(0.085, 0.085), strip=0.005, grid=grid)
        for sx in (-1, 1):                                        # hinge actuators and edge stiffeners
            disc(alu, 0.03, -0.07, 0.07, 8, Mp @ T(sx * 0.40, -0.005, -0.02) @ AX['X'])
            disc(dark, 0.022, -0.09, 0.09, 6, Mp @ T(sx * 0.40, -0.005, -0.02) @ AX['X'])
            rod(alu, (sx * 0.605, 0.04, -0.012), (sx * 0.11, 0.925, -0.012), 0.011, 5, M=Mp)
        rod(alu, (-0.10, 0.93, -0.012), (0.10, 0.93, -0.012), 0.011, 5, M=Mp)
        disc(dark, 0.02, -0.03, 0.02, 6, Mp @ T(0, 0.915, -0.01))  # tip latch

    # --- electronics enclosure in the middle of the base ---
    taper_box(white, (0.56, 0.48), (0.50, 0.42), zb, zb + 0.27, loc=(0, 0.04))
    taper_box(white, (0.50, 0.42), (0.40, 0.32), zb + 0.27, zb + 0.31, loc=(0, 0.04))
    for i, (sx, sy, w) in enumerate(((0, -1, 0.5), (1, 0, 0.42), (0, 1, 0.5), (-1, 0, 0.42))):
        Mf = T(sx * 0.268, 0.04 + sy * 0.228, zb + 0.135) @ R('Z', (0, 90, 180, 270)[i]) @ R('X', 90 + 6.3)
        foil_panel(gold, Mf, w - 0.06, 0.20, 4, 3, 0.008, seed=20 + i, bulge=0.012)
    for sx in (-1, 1):
        beam(dark, (sx * 0.17, -0.20, zb + 0.29), (sx * 0.17, 0.28, zb + 0.29), 0.022, 0.012)       # blanket straps
    cbox(alu, (0.12, 0.09, 0.035), (-0.10, -0.08, zb + 0.325), c=0.012)                         # connector panel on the lid
    for i in range(3):
        disc(dark, 0.012, 0.0, 0.02, 6, T(-0.14 + 0.04 * i, -0.08, zb + 0.342))
    tube(dark, [(-0.10, -0.03, zb + 0.32), (-0.14, 0.10, zb + 0.325), (-0.19, 0.17, zb + 0.325)], 0.009, 4, round_r=0.03)
    tube(dark, [(-0.05, -0.05, zb + 0.32), (0.02, 0.02, zb + 0.325), (0.05, 0.07, zb + 0.325)], 0.009, 4, round_r=0.03)
    # shelf boxes and harness on the base
    cbox(gold, (0.22, 0.16, 0.12), (-0.33, -0.06, zb + 0.06), c=0.015)
    cbox(alu, (0.16, 0.12, 0.09), (0.36, 0.0, zb + 0.045), c=0.012)
    tube(dark, [(0.20, -0.21, zb + 0.03), (0.30, -0.27, zb + 0.015), (0.40, -0.33, zb + 0.012)], 0.012, 5)
    tube(dark, [(-0.25, 0.20, zb + 0.03), (-0.34, 0.24, zb + 0.015), (-0.2, 0.42, zb + 0.012), (-0.05, 0.52, zb + 0.012)], 0.012, 5, round_r=0.05)

    # --- camera on its lattice mast ---
    mz = zb + 0.31
    mx, my = 0.07, 0.10
    lathe(alu, [(0.0, mz - 0.01), (0.075, mz - 0.01), (0.075, mz + 0.10), (0.062, mz + 0.115), (0.0, mz + 0.115)], 12, T(mx, my, 0))
    lattice_mast(alu, T(mx, my, mz + 0.11), 0.042, 0.66, bays=6, rr=0.0045, twist=0.25)
    hz = mz + 0.11 + 0.66
    lathe(alu, [(0.0, hz - 0.01), (0.05, hz - 0.01), (0.05, hz + 0.02), (0.03, hz + 0.035), (0.03, hz + 0.07), (0.0, hz + 0.07)], 10, T(mx, my, 0))
    Mh = T(mx, my, hz + 0.10)
    lathe(gold, [(0.0, -0.105), (0.046, -0.105), (0.052, -0.095), (0.052, 0.095), (0.046, 0.105), (0.0, 0.105)], 12, Mh @ AX['X'])
    cbox(alu, (0.06, 0.07, 0.07), (0, 0.045, -0.01), Mh, c=0.01)
    for sx in (-1, 1):                                            # the two eyes, 15 cm apart
        cbox(alu, (0.05, 0.035, 0.05), (sx * 0.075, -0.05, 0.0), Mh, c=0.008)
        disc(lens, 0.017, 0.0, 0.006, 8, Mh @ T(sx * 0.075, -0.068, 0.0) @ R('X', 90))

    # --- high-gain disc, low-gain mast ---
    hx, hy = -0.20, 0.20
    lathe(alu, [(0.0, mz), (0.035, mz), (0.035, mz + 0.03), (0.016, mz + 0.045), (0.016, mz + 0.20), (0.0, mz + 0.20)], 8, T(hx, hy, 0))
    Mg = T(hx, hy, mz + 0.22) @ R('Z', 25) @ R('X', -38)
    cbox(alu, (0.07, 0.05, 0.05), (0, 0, 0.0), T(hx, hy, mz + 0.21), c=0.008)
    lathe(white, [(0.0, 0.03), (0.15, 0.03), (0.155, 0.036), (0.155, 0.05), (0.15, 0.056), (0.0, 0.056)], 20, Mg)
    lathe(alu, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.03), (0.0, 0.03)], 10, Mg)
    lathe(dark, [(0.118, 0.056), (0.118, 0.059), (0.102, 0.059), (0.102, 0.056)], 20, Mg, close=True)
    lx, ly = 0.20, 0.20
    lathe(alu, [(0.0, mz), (0.024, mz), (0.024, mz + 0.04), (0.009, mz + 0.06), (0.009, mz + 0.50), (0.02, mz + 0.51),
                (0.02, mz + 0.60), (0.012, mz + 0.615), (0.0, mz + 0.615)], 8, T(lx, ly, 0))

    # --- weather mast with wind socks on the tip of a side petal ---
    Mp = PM[150]
    foot = Mp @ Vector((0.0, 0.86, 0.0))
    disc(alu, 0.022, 0.0, 0.05, 8, T(*foot))
    rod(alu, foot, foot + Vector((0, 0, 1.02)), 0.007, 5, r2=0.005)
    for hz2, ang in ((0.35, 20), (0.63, 140), (0.92, 260)):
        p = foot + Vector((0, 0, hz2))
        q = p + Vector(polar(0.07, ang))
        rod(alu, p, q, 0.003, 4)
        lathe(white, [(0.0, 0.0), (0.011, -0.012), (0.0, -0.06)], 6, T(*q))
    disc(dark, 0.012, 1.02, 1.045, 6, T(*foot))

    # --- the two rover ramps: pairs of roll-out steel tracks from the rover petal to the ground ---
    Mr = PM[-90]
    steel = k('steel')
    ramp_lines = []
    for sx in (-1, 1):
        mid = Vector((sx * 0.36, 0.33, 0.0))
        out = Vector((sx * 0.871, 0.0, 0.0))
        along = Vector((0.0, 1.0, 0.0))
        for off in (-0.115, 0.115):
            pts = []
            for i in range(7):
                t = i / 6
                d = -0.06 + 1.22 * t
                p_local = mid + out * d + along * off
                w = Mr @ p_local
                sag = -0.035 * sin(pi * t)
                gz = max(0.012, w.z * (1 - t) ** 1.0 + sag + 0.0) if i else w.z + 0.012
                pts.append((w.x, w.y, gz))
            ramp_lines.append(pts)
            sweep(steel, pts, [(0.045, -0.002), (0.045, 0.012), (0.039, 0.012), (0.039, 0.003), (-0.039, 0.003), (-0.039, 0.012),
                               (-0.045, 0.012), (-0.045, -0.002)], up=(0, 0, 1))
            for i in range(1, 12):                                # cleats across each track
                t = i / 12
                j = min(5, int(t * 6))
                u = t * 6 - j
                p = Vector(pts[j]).lerp(Vector(pts[j + 1]), u)
                q = Vector(pts[j + 1]) - Vector(pts[j])
                box(steel, (0.078, 0.012, 0.006), (0, 0, 0.006), frame(p, Vector((0, 0, 1)), q.cross(Vector((0, 0, 1)))))
        for t in (0.25, 0.6, 0.92):                               # ties between the two tracks
            d = -0.06 + 1.22 * t
            pa = Mr @ (mid + out * d + along * -0.115)
            pb = Mr @ (mid + out * d + along * 0.115)
            z = max(0.016, pa.z * (1 - t) - 0.035 * sin(pi * t)) + 0.004
            rod(steel, (pa.x, pa.y, z), (pb.x, pb.y, z), 0.005, 4)

    # --- the airbags: deflated and hauled in by their cords, the lobes lying slack round and under the petals ---
    petal_dirs = (-90.0, 30.0, 150.0)
    inv = {th: PM[th].inverted() for th in PM}

    def outline_r(th):
        c3 = cos(3 * (th - rad(-90)))                                 # +1 toward a side petal, -1 toward a notch
        lobes = 0.075 * cos(9 * th + 1.3) + 0.05 * cos(15 * th + 0.4) + 0.035 * cos(24 * th + 2.0)
        return 1.56 + 0.23 * c3 + lobes + 0.16 * (noise3(2.2 * cos(th) + 3, 2.2 * sin(th) + 3, 0.5, 17) - 0.5)

    def under_hardware(x, y, z):
        if point_in_poly(base, x, y) > -0.05:                         # the base petal sits on it
            z = min(z, zb - 0.095)
        for th in petal_dirs:                                         # the side petals rest on it
            q = inv[th] @ Vector((x, y, 0.0))
            m = point_in_poly(petal, q.x, q.y)
            if m > -0.13:
                top = (PM[th] @ Vector((q.x, q.y, -0.06))).z - 0.012
                z = min(z, top if m > -0.02 else top + (z - top) * ((-m - 0.02) / 0.11))
        for line in ramp_lines:                                       # and the ramps were unrolled over it
            for a, b in zip(line, line[1:]):
                ax, ay, az = a
                bx, by, bz = b
                ex, ey = bx - ax, by - ay
                L2 = ex * ex + ey * ey
                t = max(0.0, min(1.0, ((x - ax) * ex + (y - ay) * ey) / L2))
                d = sqrt((x - ax - ex * t) ** 2 + (y - ay - ey * t) ** 2)
                if d < 0.17:
                    top = az + (bz - az) * t - 0.03
                    z = min(z, top if d < 0.07 else top + (z - top) * ((d - 0.07) / 0.10))
        return z

    bag, seam = bm_new(), bm_new()
    # the lobes: (bearing off the petal, radius of its centre or None to lie just inside the hem, half-length out,
    #             half-width round, height, slump, cinch, sag, columns, seams and cord?)
    LOBES = ((0.0, None, 0.29, 0.42, 0.20, 0.70, 0.40, 0.30, 24, True),          # beyond the tip of the petal
             (-25.0, None, 0.33, 0.35, 0.27, 0.35, 0.34, 0.15, 18, True),        # beside it
             (26.0, None, 0.32, 0.34, 0.25, 0.80, 0.30, 0.35, 18, True),
             (-43.0, None, 0.30, 0.30, 0.21, 0.90, 0.30, 0.40, 12, False),
             (44.0, None, 0.31, 0.31, 0.24, 0.30, 0.36, 0.20, 12, False),
             (61.0, None, 0.33, 0.43, 0.29, 0.50, 0.38, 0.25, 24, True),         # heaped in the notch between two petals
             (57.0, 0.78, 0.26, 0.36, 0.28, 0.25, 0.22, 0.10, 12, False))
    rng = random.Random(29)
    cord = k('painted_dark')
    n = 0
    plans = []                                                        # the lobes in plan, for the apron
    for thp in petal_dirs:
        for (dth, r, la, lb, lh, slump, cinch, sag, seg, dressed) in LOBES:
            n += 1
            th = thp + dth + rng.uniform(-3.0, 3.0)
            la, lb, lh = la * rng.uniform(0.94, 1.06), lb * rng.uniform(0.94, 1.06), lh * rng.uniform(0.92, 1.08)
            if r is None:
                r = outline_r(rad(th)) - 1.0 * la
            yaw = th + rng.uniform(-14.0, 14.0)
            lrows, crown = bag_lobe(bag, polar(r, th)[:2], yaw, la, lb, lh, seed=40 + n, seg=seg, slump=slump, cinch=cinch, sag=sag,
                                    limit=under_hardware, rings=7 if dressed else 6)
            plans += [[(v.co.x, v.co.y) for v in lrows[j]] for j in (1, 2)]
            if not dressed:
                continue
            lobe_seams(seam, lrows, crown, arc=(-seg * 2 // 9, seg * 2 // 9))
            # its tether cord: out from under the lander, over the crown in the fold it has drawn, down the outer end to the ground
            path = [lrows[j][seg // 2] for j in (3, 5)] + [crown] + [lrows[j][0] for j in (6, 4, 2, 1)]
            pts = [v.co + Vector((0, 0, 0.005)) + (v.co - crown.co).normalized() * (0.004 if v is not crown else 0.0) for v in path]
            end = lrows[1][0].co
            out = Vector((end.x - crown.co.x, end.y - crown.co.y, 0.0)).normalized()
            pts.append(Vector((end.x, end.y, 0.004)) + out * 0.035)
            sweep(cord, pts, circ(0.008, 3), caps=False)

    # the slack skirts of the bags: a low apron of cloth under the lobes, a hand's breadth beyond them (never past
    # the old hem) and on down for ground that falls away
    def reach(th):
        dx, dy = cos(th), sin(th)
        far = 0.9
        for plan in plans:
            for (ax, ay), (bx, by) in zip(plan, plan[1:] + plan[:1]):
                ex, ey = bx - ax, by - ay
                den = dx * ey - dy * ex
                if abs(den) > 1e-9 and 0.0 <= (ax * dy - ay * dx) / den <= 1.0:
                    far = max(far, (ax * ey - ay * ex) / den)
        return min(far + 0.04, outline_r(th))

    NA, FR = 72, (0.0, 0.62, 1.0)
    rows = []
    for j, f in enumerate(FR):
        row = []
        for i in range(NA):
            th = TAU * (i + 0.5 * (j % 2)) / NA
            r = 0.47 + (reach(th) - 0.47) * f
            x, y = r * cos(th), r * sin(th)
            z = (0.13 - 0.07 * f) * (0.7 + 0.6 * noise3(x * 2.3 + 4, y * 2.3 + 4, 0.2, 23))
            row.append(bag.verts.new((x, y, under_hardware(x, y, z) if f < 1.0 else 0.006)))
        rows.append(row)
    rows.append([bag.verts.new((v.co.x * 1.01, v.co.y * 1.01, -0.30)) for v in rows[-1]])
    for j in range(len(rows) - 1):
        a, b = rows[j], rows[j + 1]
        for i in range(NA):
            i2 = (i + 1) % NA
            if j == len(rows) - 2:
                bag.faces.new((a[i], b[i], b[i2], a[i2]))
            elif j % 2 == 0:                                          # ring j+1 is shifted half a step on
                bag.faces.new((a[i], b[i], a[i2]))
                bag.faces.new((a[i2], b[i], b[i2]))
            else:
                bag.faces.new((a[i], b[i], b[i2]))
                bag.faces.new((a[i], b[i2], a[i2]))

    def hidden(v):
        """Is this point of the cloth right under the base or a side petal, where nothing can see it?"""
        if point_in_poly(base, v.co.x, v.co.y) > 0.06:
            return True
        for th in petal_dirs:
            q = inv[th] @ Vector((v.co.x, v.co.y, 0.0))
            if point_in_poly(petal, q.x, q.y) > 0.06:
                return True
        return False

    under = {v for v in bag.verts if hidden(v)}
    bmesh.ops.delete(bag, geom=[f for f in bag.faces if all(v in under for v in f.verts)], context='FACES')
    mesh_obj('pathfinder_vectran_bags', bag, 'vectran', parent=root, smooth_angle=78.0)         # (named to sort with the Kit's meshes)
    mesh_obj('pathfinder_vectran_seams', seam, 'vectran', parent=root, smooth_angle=40.0)

    sj, ks = _sojourner(root, (1.92, -1.78, 0.0), -62.0)
    anchor('col_body', root, loc=(0, 0, 0), radius=1.9)
    anchor('col_sojourner', root, loc=(1.92, -1.78, 0), radius=0.45)
    return finish(root, 'pathfinder', [k, ks])


def hull_poly(sides):
    """Convex polygon from its sides, each (normal angle in degrees, distance from the origin),
    listed by increasing angle. Returns the corners counter-clockwise."""
    out = []
    n = len(sides)
    for i in range(n):
        (a1, d1), (a2, d2) = sides[i], sides[(i + 1) % n]
        n1, n2 = (cos(rad(a1)), sin(rad(a1))), (cos(rad(a2)), sin(rad(a2)))
        det = n1[0] * n2[1] - n1[1] * n2[0]
        out.append(((d1 * n2[1] - d2 * n1[1]) / det, (n1[0] * d2 - n2[0] * d1) / det))
    return out


def _viking_camera(k, M):
    """Facsimile camera: a pedestal, a tall turret with a vertical slit window, a domed cap."""
    white, alu, dark, lens = k('painted_white', 30), k('aluminium'), k('painted_dark'), k('lens')
    lathe(alu, [(0.0, 0.0), (0.085, 0.0), (0.085, 0.018), (0.052, 0.035), (0.052, 0.20), (0.074, 0.215), (0.074, 0.245),
                (0.0, 0.245)], 14, M)
    lathe(white, [(0.092, 0.245), (0.092, 0.50), (0.086, 0.525), (0.060, 0.548), (0.0, 0.555)], 16, M)
    lathe(alu, [(0.096, 0.245), (0.096, 0.262), (0.092, 0.262)], 16, M)
    lathe(alu, [(0.096, 0.488), (0.096, 0.502), (0.092, 0.502)], 16, M)
    # slit window in a raised frame, facing local -Y, and the dust post beside it
    cbox(alu, (0.058, 0.02, 0.215), (0, -0.088, 0.375), M, c=0.006)
    box(lens, (0.026, 0.012, 0.18), (0, -0.096, 0.375), M)
    rod(dark, (0.075, -0.075, 0.245), (0.075, -0.075, 0.47), 0.007, 5, M=M)
    disc(dark, 0.02, 0.552, 0.565, 8, M)
    bolt_circle(alu, 0.066, 6, 0.008, 0.006, M @ T(0, 0, 0.018))


def build_viking():
    """Viking 1 / Viking 2 lander: the six-sided body on three legs, twin camera turrets, the
    S-band dish, RTG wind covers and tanks, the sampler boom and the meteorology boom."""
    weathered()
    root = part('viking')
    k = Kit(root)
    white, alu, dark = k('painted_white', 30), k('aluminium'), k('painted_dark')
    body_b = k('paint_olive', 25, 0.012)                 # the body was painted a grey olive; covers, dish and tanks white
    cover = k('cover_grey', 25, 0.012)
    tank, gold, lens, steel = k('tank_wrap', 50), k('gold_foil', 28), k('lens'), k('steel')
    red, blue = k('flag_red'), k('flag_blue')
    L, s = 1.09, 0.56
    dL, ds = (L + 2 * s) / (2 * sqrt(3)), (2 * L + s) / (2 * sqrt(3))
    z0, z1 = 0.25, 0.70
    sides = [(30, dL), (90, ds), (150, dL), (210, ds), (270, dL), (330, ds)]
    outline = hull_poly(sides)

    # --- body: a six-sided box with a deck plate, belly pan, side beams and access panels ---
    prism(body_b, outline, z1 - z0, T(0, 0, z0), z0=0.0)
    prism(alu, hull_poly([(a, d + 0.018) for a, d in sides]), 0.022, T(0, 0, z1 - 0.004), z0=0.0)
    prism(alu, hull_poly([(a, d + 0.012) for a, d in sides]), 0.02, T(0, 0, z0 - 0.006), z0=0.0)
    prism(dark, hull_poly([(a, d - 0.10) for a, d in sides]), 0.05, T(0, 0, z0 - 0.05), z0=0.0)
    for a, d in sides:
        Mside = R('Z', a) @ T(d, 0, (z0 + z1) / 2) @ R('Y', 90) @ R('Z', 90)       # local XY on the wall, +Z outward
        if d == dL:
            for sx in (-1, 1):
                prism(alu, rrect(0.42, 0.30, 0.03, 2), 0.01, Mside @ T(sx * 0.255, 0, 0), z0=0.0)
                for bx in (-0.17, 0.17):
                    for by in (-0.11, 0.11):
                        bolt(dark, 0.009, 0.006, Mside @ T(sx * 0.255 + bx, by, 0.01))
            box(alu, (0.03, 0.40, 0.016), (0, 0, 0.008), Mside)
        else:
            prism(alu, rrect(0.44, 0.34, 0.03, 2), 0.022, Mside, z0=0.0)                # leg fitting plate
            for bx in (-0.17, 0.17):
                for by in (-0.12, 0.12):
                    bolt(dark, 0.012, 0.008, Mside @ T(bx, by, 0.022))

    # conduit, junction boxes and the radar altimeter horn on the front wall
    tube(dark, [(-0.50, -dL - 0.016, z1 - 0.06), (0.20, -dL - 0.016, z1 - 0.06), (0.26, -dL - 0.016, z1 - 0.12), (0.50, -dL - 0.016, z1 - 0.12)], 0.012, 5)
    cbox(alu, (0.12, 0.05, 0.09), (0.33, -dL - 0.025, z0 + 0.10), c=0.012)
    cbox(alu, (0.09, 0.04, 0.07), (-0.42, -dL - 0.02, z0 + 0.09), c=0.01)
    lathe(alu, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.03), (0.07, 0.10), (0.064, 0.10), (0.024, 0.03), (0.0, 0.03)], 10, T(0.0, -dL + 0.08, z0 - 0.01) @ R('X', 180))
    # --- three legs: main strut from the top of each short side, bipod from its lower corners ---
    foot_r = 2.21 / sqrt(3)
    for a in (90, 210, 330):
        Ml = R('Z', a)
        top = Ml @ Vector((ds + 0.03, 0, z1 - 0.07))
        foot = Ml @ Vector((foot_r, 0, 0))
        bl, br = Ml @ Vector((ds + 0.02, 0.19, z0 + 0.06)), Ml @ Vector((ds + 0.02, -0.19, z0 + 0.06))
        lander_leg(alu, top, foot, bl, br, r=0.034, knee=0.45, pad_bm=alu, pad_r=0.155, sleeve=None)
        cbox(alu, (0.09, 0.12, 0.10), (ds + 0.03, 0, z1 - 0.07), Ml, c=0.015)
        # stroke gauge / shock housing on the upper strut
        ankle = foot + Vector((0, 0, 0.065))
        ax = (top - ankle)
        lathe(dark, [(0.046, ax.length * 0.60), (0.046, ax.length * 0.80)], 8, frame(ankle, ax))

    # --- terminal descent engines under the three long sides (eighteen-nozzle shower heads) ---
    for a in (30, 150, 270):
        Me = R('Z', a) @ T(dL - 0.17, 0, z0)
        lathe(gold, [(0.13, 0.0), (0.145, -0.03), (0.145, -0.10), (0.12, -0.125)], 12, Me)
        lathe(dark, [(0.0, -0.11), (0.12, -0.11), (0.12, -0.125), (0.0, -0.125)], 12, Me)
        for i in range(12):
            r_n = 0.095 if i < 8 else 0.04
            aa = TAU * i / 8 if i < 8 else TAU * (i - 8) / 4 + 0.4
            lathe(steel, [(0.008, -0.125), (0.016, -0.15)], 5, Me @ T(r_n * cos(aa), r_n * sin(aa), 0))
        rod(alu, (0.0, 0.0, 0.0), (0.0, 0.0, 0.04), 0.05, 8, M=Me)

    # --- propellant tanks under their blankets and the RTG wind covers above the two rear long sides ---
    for a in (30, 150):
        Mt = R('Z', a)
        c = (dL + 0.13, 0, 0.50)
        ball(tank, c, 0.265, 14, 7, M=Mt)
        lathe(alu, [(0.268, -0.012), (0.272, -0.012), (0.272, 0.012), (0.268, 0.012)], 14, Mt @ T(*c), close=True)
        lathe(alu, [(0.268, -0.012), (0.272, -0.012), (0.272, 0.012), (0.268, 0.012)], 14, Mt @ T(*c) @ R('X', 90), close=True)
        lathe(alu, [(0.0, 0.255), (0.05, 0.255), (0.05, 0.285), (0.02, 0.30), (0.02, 0.33), (0.0, 0.33)], 8, Mt @ T(*c))
        tube(alu, [Mt @ Vector((dL + 0.13, 0, 0.82)), Mt @ Vector((dL + 0.02, 0.0, 0.84)), Mt @ Vector((dL - 0.06, 0.0, z1 + 0.02))],
             0.011, 5, round_r=0.04)
        for sy in (-1, 1):                                                   # tank support struts
            rod(alu, Mt @ Vector((dL, sy * 0.30, z0 + 0.05)), Mt @ Vector((dL + 0.16, sy * 0.19, 0.34)), 0.012, 5)
        # RTG wind cover: a slant-faced hood with a louvred top and stand-off feet
        Mc = Mt @ T(0, 0, z1 + 0.035) @ R('X', 90)
        prof = [(0.25, 0.0), (0.635, 0.0), (0.635, 0.19), (0.55, 0.35), (0.31, 0.35), (0.25, 0.29)]
        prism(cover, prof, 0.50, Mc)
        for i in range(4):
            box(alu, (0.20, 0.08, 0.012), (0.43, -0.156 + 0.104 * i, z1 + 0.035 + 0.356), Mt)
        for sy in (-1, 1):
            box(alu, (0.36, 0.012, 0.035), (0.445, sy * 0.22, z1 + 0.018), Mt)
            Mp = Mt @ T(0.44, sy * 0.25, z1 + 0.20) @ R('X', -sy * 90)
            prism(white, rrect(0.22, 0.15, 0.02, 2), 0.008, Mp, z0=0.0)
            if sy == 1:                                                     # the flag, on the plate each cover carried for it
                for j in range(7):
                    box(red, (0.19, 0.0092, 0.002), (0.0, -0.0555 + 0.0185 * j, 0.009), Mp)
                box(blue, (0.078, 0.065, 0.0024), (-0.056, 0.0278, 0.0094), Mp)
        tube(dark, [Mt @ Vector((0.33, 0.12, z1 + 0.30)), Mt @ Vector((0.19, 0.12, z1 + 0.30)), Mt @ Vector((0.17, 0.12, z1 + 0.03))],
             0.014, 5, round_r=0.04)

    Mg = R('Z', 30) @ T(0.43, 0, z1 + 0.035 + 0.352)                                              # grid target on top of one cover
    box(alu, (0.012, 0.14, 0.012), (0.0, 0.26, -0.03), Mg)
    cbox(white, (0.13, 0.11, 0.008), (0.0, 0.31, 0.01), Mg @ R('X', 30), c=0.01)
    for i in range(3):
        box(dark, (0.11, 0.004, 0.003), (0.0, 0.285 + 0.025 * i, 0.016), Mg @ R('X', 30))
    for sx in (-1, 1):                                                                            # camera harness, magnifying mirror, brush
        tube(dark, [(sx * 0.40, -0.36, z1 + 0.05), (sx * 0.38, -0.30, z1 + 0.03), (sx * 0.30, -0.22, z1 + 0.03)], 0.01, 4, round_r=0.03)
    rod(alu, (0.27, -0.42, z1 + 0.02), (0.27, -0.42, z1 + 0.12), 0.006, 4)
    disc(alu, 0.035, -0.004, 0.004, 10, T(0.27, -0.42, z1 + 0.15) @ R('X', 70))
    cbox(dark, (0.05, 0.02, 0.03), (0.33, -0.50, z1 + 0.035), c=0.004)
    # --- twin facsimile cameras on the front corners of the deck ---
    for sx in (-1, 1):
        _viking_camera(k, T(sx * 0.40, -0.44, z1 + 0.018) @ R('Z', sx * 12))

    # --- S-band high-gain dish on its mast at the back ---
    dx, dy = 0.0, 0.62
    lathe(alu, [(0.0, z1), (0.07, z1), (0.07, z1 + 0.03), (0.034, z1 + 0.06), (0.034, 1.36), (0.05, 1.37), (0.05, 1.47), (0.0, 1.47)],
          10, T(dx, dy, 0))
    for an in (40, 160, 280):
        prism(alu, [(0.034, 0.02), (0.11, 0.02), (0.034, 0.22)], 0.012, T(dx, dy, z1) @ R('Z', an) @ R('X', 90))
    aim = Vector((0.25, -0.50, 0.83))
    Md = frame((dx, dy, 1.55), aim, (1, 0, 0))
    cbox(alu, (0.12, 0.10, 0.12), (dx, dy, 1.50), c=0.015)
    disc(dark, 0.03, -0.09, 0.09, 8, T(dx, dy, 1.52) @ AX['X'])
    dish(white, alu, Md @ T(0, 0, 0.07), 0.38, 0.10, seg=24, struts=3, back_ribs=6)
    lathe(alu, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.07), (0.0, 0.07)], 8, Md)
    # low-gain S-band cone and the UHF antenna (a ribbed drum on a post)
    lathe(alu, [(0.0, z1), (0.02, z1), (0.02, z1 + 0.30), (0.05, z1 + 0.33), (0.035, z1 + 0.42), (0.0, z1 + 0.43)], 8, T(0.17, 0.66, 0))
    ux, uy = 0.0, 0.17
    lathe(alu, [(0.0, z1), (0.03, z1), (0.03, z1 + 0.16), (0.0, z1 + 0.16)], 8, T(ux, uy, 0))
    lathe(white, [(0.0, z1 + 0.16), (0.11, z1 + 0.16), (0.11, z1 + 0.19), (0.095, z1 + 0.27), (0.04, z1 + 0.30), (0.0, z1 + 0.30)], 14, T(ux, uy, 0))
    for i in range(4):
        box(alu, (0.012, 0.21, 0.012), (0, 0, z1 + 0.305), T(ux, uy, 0) @ R('Z', 45 * i))

    # --- surface sampler: housing on an azimuth pedestal, the boom run out to the ground, collector head ---
    S0 = Vector((0.10, -0.40, z1 + 0.17))
    hd = Vector((0.447, -0.894, 0.0))
    d = (hd * cos(rad(31)) + Vector((0, 0, -sin(rad(31))))).normalized()
    lathe(alu, [(0.0, z1), (0.075, z1), (0.075, z1 + 0.03), (0.05, z1 + 0.05), (0.05, z1 + 0.12), (0.0, z1 + 0.12)], 10, T(S0.x, S0.y, 0))
    Fh = frame(S0, d, (0, 0, 1))
    prism(white, chamf(0.11, 0.10, 0.02), 0.46, Fh, z0=-0.20)
    prism(gold, chamf(0.125, 0.115, 0.025), 0.13, Fh, z0=-0.24)
    lathe(alu, [(0.04, 0.26), (0.04, 0.31), (0.022, 0.33)], 8, Fh)
    for sy in (-1, 1):
        disc(dark, 0.03, 0.0, 0.02, 8, Fh @ T(0, sy * 0.05, -0.05) @ R('X', -sy * 90))
    tip = S0 + d * 1.30
    sweep(alu, [S0 + d * 0.31, tip], [(0.014, 0.0), (0.008, 0.008), (-0.008, 0.008), (-0.014, 0.0), (-0.008, -0.008), (0.008, -0.008)],
          up=(0, 0, 1))
    Ft = frame(tip, d, (0, 0, 1))
    cbox(alu, (0.07, 0.09, 0.12), (0, 0, 0.03), Ft, c=0.012)
    prism(steel, [(-0.03, 0.09), (0.035, 0.09), (0.035, 0.20), (0.0, 0.235), (-0.03, 0.20)], 0.085, Ft @ R('Y', 90) @ R('Z', 90))   # jaw
    prism(dark, [(-0.05, 0.03), (-0.035, 0.03), (-0.035, 0.17), (-0.05, 0.15)], 0.07, Ft @ R('Y', 90) @ R('Z', 90))                  # backhoe
    disc(dark, 0.03, 0.0, 0.03, 8, Ft @ T(0, 0, -0.03))

    # --- meteorology boom on the front-right leg: hinged up and out, sensors at the tip ---
    Mm = R('Z', 330)
    b0 = Mm @ Vector((ds + 0.07, 0.06, z1 - 0.02))
    b1 = Mm @ Vector((ds + 0.30, 0.10, z1 + 0.30))
    b2 = Mm @ Vector((ds + 0.52, 0.13, 1.52))
    ball(alu, b0, 0.03, 8, 4)
    tube(alu, [b0, b1, b2], 0.013, 6, round_r=0.08)
    cbox(white, (0.07, 0.06, 0.09), tuple(b2 + Vector((0, 0, 0.03))), c=0.01)
    for i, (ox, oy) in enumerate(((0.06, 0.0), (-0.03, 0.05), (-0.03, -0.05))):
        rod(alu, b2 + Vector((0, 0, 0.06)), b2 + Vector((ox, oy, 0.17)), 0.004, 4)
        ball(dark, tuple(b2 + Vector((ox, oy, 0.17))), 0.009, 5, 3)
    rod(alu, b2 + Vector((0, 0, 0.0)), b2 + Vector((0.10, -0.06, -0.04)), 0.005, 4)
    disc(dark, 0.014, 0.0, 0.04, 6, T(*(b2 + Vector((0.10, -0.06, -0.06)))))

    # --- deck equipment: inlets for the three laboratories, seismometer, test charts, harness ---
    zd = z1 + 0.018
    for (x, y, r, h) in ((-0.13, -0.25, 0.055, 0.14), (-0.02, -0.10, 0.06, 0.11), (-0.28, -0.12, 0.045, 0.16)):
        lathe(white, [(0.0, zd), (r, zd), (r, zd + h), (0.0, zd + h)], 10, T(x, y, 0))
        lathe(alu, [(r * 0.5, zd + h), (r * 1.15, zd + h + 0.05), (r * 1.15, zd + h + 0.058), (r * 0.4, zd + h + 0.008)], 10,
              T(x, y, 0), close=True)
    cbox(white, (0.16, 0.14, 0.13), (0.24, -0.22, zd + 0.065), c=0.015)                       # seismometer
    cbox(dark, (0.10, 0.08, 0.012), (0.24, -0.22, zd + 0.136), c=0.01)
    for (x, y, rz) in ((-0.52, -0.16, 60), (0.52, -0.16, -60), (-0.14, -0.55, 0)):                # reference test charts
        Mc = T(x, y, zd) @ R('Z', rz)
        prism(alu, [(-0.045, 0.0), (0.045, 0.0), (0.045, 0.012), (-0.045, 0.012)], 0.09, Mc @ T(0, 0, 0.05) @ R('X', 55) @ T(0, 0, 0))
        box(dark, (0.07, 0.07, 0.004), (0, 0.016, 0.0), Mc @ T(0, 0, 0.05) @ R('X', 55) @ R('X', -90))
        rod(alu, (0, 0.02, 0), (0, 0.02, 0.05), 0.006, 4, M=Mc)
    tube(dark, [(-0.40, -0.36, zd + 0.012), (-0.22, -0.34, zd + 0.012), (-0.04, -0.36, zd + 0.012), (0.10, -0.33, zd + 0.012)], 0.012, 5, round_r=0.05)
    tube(dark, [(0.40, -0.36, zd + 0.012), (0.36, -0.3, zd + 0.012), (0.1, -0.02, zd + 0.012), (0.05, 0.10, zd + 0.012)], 0.012, 5, round_r=0.05)
    tube(dark, [(dx + 0.03, dy - 0.06, zd + 0.012), (0.03, 0.40, zd + 0.012), (0.02, 0.28, zd + 0.012)], 0.012, 5, round_r=0.04)
    for a in range(0, 360, 60):                                                               # deck edge tie-downs
        p = polar(0.52, a + 30, zd)
        bolt(dark, 0.014, 0.01, T(*p))

    anchor('col_body', root, loc=(0, 0, 0), radius=1.6)
    return finish(root, 'viking', [k])


def _steer_unit(k, x, y, r, w, sx, top_z, tube_r=0.016, mat='titanium', act_r=None):
    """Steering actuator above a corner wheel and the bracket that drops down the inboard side of
    the wheel to its drive hub. (x, y) is the wheel centre, sx the side (+1 or -1)."""
    ti, dark, alu = k(mat), k('painted_dark'), k('aluminium')
    ar = act_r or r * 0.30
    z0 = 2 * r + r * 0.12
    lathe(dark, [(0.0, z0 + ar * 0.5), (ar, z0 + ar * 0.5), (ar, top_z - 0.01), (ar * 0.8, top_z), (0.0, top_z)], 10, T(x, y, 0))
    lathe(alu, [(ar * 1.15, z0 + ar * 0.55), (ar * 1.15, z0 + ar * 0.9), (ar, z0 + ar * 0.9)], 10, T(x, y, 0))
    xi = x - sx * (w / 2 + tube_r * 2.2)
    tube(ti, [(x, y, z0 + ar * 0.3), (xi, y, z0 + ar * 0.3), (xi, y, r)], tube_r, 6, round_r=r * 0.35)
    disc(ti, tube_r * 1.6, -0.01, ar * 0.6, 8, T(x, y, z0 + ar * 0.3 - tube_r) )
    disc(dark, r * 0.36, -w * 0.30, tube_r, 10, T(xi, y, r) @ AX['X'] @ S(1, 1, -sx))


def build_mer():
    """Mars Exploration Rover (Spirit / Opportunity): the swept solar deck over a gold electronics
    box, rocker-bogie on six wheels, the Pancam mast (part `mast`), antennas and the stowed arm."""
    weathered()
    root = part('mer')
    k = Kit(root)
    gold, cell, alu, ti = k('gold_foil', 28), k('solar_cell'), k('aluminium'), k('titanium')
    white, dark, lens = k('painted_white', 30), k('painted_dark'), k('lens')
    grid = k('cell_grid')
    WR, WW, X = 0.13, 0.16, 0.56
    YF, YM, YR = -0.70, 0.05, 0.70
    zd = 0.555                                       # underside of the deck panels
    zt = zd + 0.022                                  # top of the cells

    # --- warm electronics box ---
    taper_box(gold, (0.58, 0.84), (0.66, 0.90), 0.30, zd, loc=(0, -0.03))
    for i, (sx, sy, w) in enumerate(((0, -1, 0.60), (1, 0, 0.84), (0, 1, 0.60), (-1, 0, 0.84))):
        Mf = T(sx * 0.312, -0.03 + sy * 0.438, 0.43) @ R('Z', (0, 90, 180, 270)[i]) @ R('X', 90)
        foil_panel(gold, Mf, w - 0.06, 0.21, 5, 3, 0.008, seed=40 + i, bulge=0.012)
    cbox(dark, (0.50, 0.70, 0.02), (0, -0.03, 0.292), c=0.03)
    for sx in (-1, 1):                               # radiators / heat-rejection plates on the rear corners
        cbox(alu, (0.012, 0.22, 0.14), (sx * 0.336, 0.25, 0.44), c=0.004)
    # --- solar deck: nose panel, two swept wings, tail panel with two flaps ---
    panels = [
        [(-0.20, -0.64), (0.20, -0.64), (0.40, -0.26), (0.40, 0.40), (-0.40, 0.40), (-0.40, -0.26)],
        [(0.42, -0.25), (1.15, 0.14), (1.15, 0.42), (0.42, 0.42)],
        [(-0.42, 0.42), (-1.15, 0.42), (-1.15, 0.14), (-0.42, -0.25)],
        [(-0.39, 0.42), (0.39, 0.42), (0.29, 0.80), (-0.29, 0.80)],
        [(0.41, 0.44), (0.80, 0.44), (0.58, 0.74), (0.32, 0.80)],
        [(-0.32, 0.80), (-0.58, 0.74), (-0.80, 0.44), (-0.41, 0.44)],
    ]
    for i, o in enumerate(panels):
        # black composite panels: cells in strings with a fine dull grid, nothing bright between them
        solar_poly(dark, cell, o, T(0, 0, zd), t=0.016, margin=0.012, pitch=(0.075, 0.058), strip=0.004, origin=(0.0, 0.03), grid=grid)
    for sx in (-1, 1):                               # hinges along the fold lines
        for y in (-0.12, 0.10, 0.30):
            disc(dark, 0.013, -0.035, 0.035, 6, T(sx * 0.41, y, zd + 0.012) @ AX['Y'])
        disc(dark, 0.013, -0.03, 0.03, 6, T(sx * 0.22, 0.41, zd + 0.012) @ AX['X'])
        disc(dark, 0.013, -0.03, 0.03, 6, T(sx * 0.60, 0.43, zd + 0.012) @ AX['X'])
        # wing support struts from the box up to the underside of each wing
        rod(ti, (sx * 0.33, 0.20, 0.36), (sx * 0.86, 0.26, zd - 0.004), 0.009, 5)
        rod(ti, (sx * 0.33, -0.10, 0.36), (sx * 0.74, 0.06, zd - 0.004), 0.009, 5)
    rod(ti, (0.0, 0.40, 0.36), (0.0, 0.70, zd - 0.004), 0.009, 5)

    # --- deck equipment ---
    # high-gain disc on its two-axis gimbal
    hx, hy = -0.20, 0.16
    lathe(alu, [(0.0, zt), (0.045, zt), (0.045, zt + 0.03), (0.022, zt + 0.045), (0.022, zt + 0.22), (0.0, zt + 0.22)], 8, T(hx, hy, 0))
    cbox(alu, (0.07, 0.06, 0.06), (hx, hy, zt + 0.23), c=0.01)
    Mg = T(hx, hy, zt + 0.26) @ R('Z', -30) @ R('X', -35)
    lathe(white, [(0.0, 0.03), (0.135, 0.03), (0.14, 0.036), (0.14, 0.048), (0.135, 0.054), (0.0, 0.054)], 18, Mg)
    lathe(alu, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.03), (0.0, 0.03)], 8, Mg)
    lathe(dark, [(0.105, 0.054), (0.105, 0.057), (0.09, 0.057), (0.09, 0.054)], 18, Mg, close=True)
    # low-gain mast, UHF monopole
    lathe(white, [(0.0, zt), (0.03, zt), (0.03, zt + 0.02), (0.014, zt + 0.035), (0.014, zt + 0.36), (0.024, zt + 0.37), (0.024, zt + 0.47),
                  (0.014, zt + 0.485), (0.0, zt + 0.485)], 8, T(0.22, 0.22, 0))
    lathe(alu, [(0.0, zt), (0.016, zt), (0.016, zt + 0.03), (0.005, zt + 0.04), (0.004, zt + 0.26), (0.0, zt + 0.26)], 6, T(0.30, 0.34, 0))
    # camera calibration target (a sundial): square plate, rings, post with a ball
    cbox(alu, (0.085, 0.085, 0.012), (0.31, 0.02, zt + 0.006), c=0.012)
    lathe(dark, [(0.034, zt + 0.012), (0.034, zt + 0.015), (0.022, zt + 0.015), (0.022, zt + 0.012)], 10, T(0.31, 0.02, 0), close=True)
    rod(dark, (0.31, 0.02, zt + 0.012), (0.31, 0.02, zt + 0.055), 0.004, 5)
    ball(dark, (0.31, 0.02, zt + 0.06), 0.008, 6, 3)
    # electronics boxes, mast stow cradle, cabling
    cbox(alu, (0.16, 0.12, 0.05), (-0.12, -0.20, zt + 0.025), c=0.012)
    cbox(dark, (0.10, 0.07, 0.03), (0.10, -0.06, zt + 0.015), c=0.01)
    cbox(alu, (0.05, 0.05, 0.07), (-0.02, 0.30, zt + 0.035), c=0.01)
    tube(dark, [(0.10, -0.42, zt + 0.008), (0.02, -0.30, zt + 0.008), (-0.06, -0.14, zt + 0.008), (hx + 0.03, hy - 0.04, zt + 0.008)], 0.008, 5, round_r=0.04)
    tube(dark, [(0.10, -0.10, zt + 0.008), (0.18, 0.06, zt + 0.008), (0.22, 0.18, zt + 0.008)], 0.008, 5, round_r=0.04)
    for sx in (-1, 1):                               # magnets / pyro brackets on the nose
        disc(alu, 0.02, 0.0, 0.012, 8, T(sx * 0.17, -0.55, zt))
    for (x, y) in ((0.36, -0.20), (-0.36, -0.20), (0.34, 0.36), (-0.34, 0.36), (0.0, 0.76)):     # cable-cutter housings left from the lander
        cbox(alu, (0.045, 0.045, 0.03), (x, y, zt + 0.015), c=0.008)
        disc(dark, 0.012, zt + 0.03, zt + 0.04, 6, T(x, y, 0))

    # --- rocker-bogie suspension ---
    for sx in (-1, 1):
        P = Vector((sx * 0.36, 0.08, 0.41))
        B = Vector((sx * 0.47, 0.40, 0.25))
        top_z = WR * 2 + 0.11
        disc(dark, 0.045, -0.02, 0.05, 10, T(P.x - sx * 0.03, P.y, P.z) @ AX['X'] @ S(1, 1, sx))
        sec = chamf(0.032, 0.046, 0.009)
        sweep(ti, [P, (sx * 0.47, -0.22, 0.455), (sx * 0.53, -0.52, 0.44), (sx * X, YF, top_z + 0.0)], sec)
        sweep(ti, [P, (sx * 0.43, 0.26, 0.33), B], sec)
        ball(ti, B, 0.03, 8, 4)
        disc(dark, 0.028, -0.03, 0.03, 8, T(*B) @ AX['X'])
        sweep(ti, [B, (sx * 0.52, 0.58, 0.345), (sx * X, YR, top_z)], sec)
        xi = sx * (X - WW / 2 - 0.03)
        sweep(ti, [B, (xi, 0.22, 0.20), (xi, YM, WR + 0.01)], chamf(0.028, 0.04, 0.008))
        disc(dark, WR * 0.36, -WW * 0.3, 0.0, 10, T(xi, YM, WR) @ AX['X'] @ S(1, 1, -sx))
        # motor harness clipped along the rocker and bogie
        tube(dark, [P + Vector((sx * 0.02, -0.02, 0.03)), (sx * 0.47, -0.22, 0.487), (sx * 0.53, -0.52, 0.472), (sx * X, YF + 0.03, top_z + 0.03)], 0.006, 4)
        tube(dark, [P + Vector((sx * 0.02, 0.02, 0.02)), (sx * 0.43, 0.26, 0.36), B + Vector((0, 0, 0.035)), (sx * 0.52, 0.58, 0.378), (sx * X, YR - 0.03, top_z + 0.03)], 0.006, 4)
        for y in (YF, YR):
            _steer_unit(k, sx * X, y, WR, WW, sx, top_z + 0.012, tube_r=0.014)
        for y in (YF, YM, YR):
            Mw = T(sx * X, y, WR) @ AX['X'] @ S(1, 1, sx)
            # the wheels were machined aluminium, anodised black; bare metal shows on the hub
            wheel(dark, alu, Mw, WR, WW, seg=18, th=0.005, cleats=18, cleat_h=0.005, cleat_t=0.007, crown=0.07, spokes=6,
                  spoke_twist=0.9, spoke_w=0.034, spoke_t=0.004, hub_r=0.036, hub_x=0.045, hub_len=0.05, spoke_bm=ti)
    # differential bar across the back of the box
    rod(ti, (-0.36, 0.08, 0.41), (0.36, 0.08, 0.41), 0.014, 6)

    # --- instrument arm stowed across the front, hazard cameras ---
    sh = Vector((0.20, -0.47, 0.40))
    el = Vector((-0.21, -0.52, 0.43))
    wr = Vector((0.06, -0.60, 0.37))
    cbox(alu, (0.08, 0.07, 0.09), tuple(sh), c=0.012)
    rod(ti, sh, el, 0.017, 6)
    ball(dark, el, 0.03, 8, 4)
    rod(ti, el, wr, 0.015, 6)
    ball(dark, wr, 0.026, 8, 4)
    for i in range(4):                               # turret: four instruments in a cross
        Mi = T(*wr) @ R('Y', 90 * i + 20) @ T(0.055, -0.01, 0)
        disc(alu if i % 2 else dark, 0.027, -0.04, 0.045, 8, Mi @ AX['Y'])
    for sx in (-1, 1):
        cbox(dark, (0.05, 0.035, 0.035), (sx * 0.07, -0.468, 0.50), c=0.006)
        disc(lens, 0.012, 0.0, 0.006, 6, T(sx * 0.07, -0.486, 0.50) @ R('X', 90))
        cbox(dark, (0.05, 0.035, 0.035), (sx * 0.07, 0.408, 0.50), c=0.006)
        disc(lens, 0.012, 0.0, 0.006, 6, T(sx * 0.07, 0.426, 0.50) @ R('X', -90))

    # --- Pancam mast: its own part, pivoting about the azimuth drive on the deck ---
    mast = part('mast', root, loc=(0.10, -0.47, zt))
    km = Kit(mast)
    mw, ma, md, ml = km('painted_white', 30), km('aluminium'), km('painted_dark'), km('lens')
    lathe(ma, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.05), (0.036, 0.065), (0.036, 0.10), (0.0, 0.10)], 12, I4)
    lathe(mw, [(0.027, 0.10), (0.027, 0.50), (0.031, 0.51), (0.031, 0.80), (0.0, 0.80)], 10, I4)
    lathe(ma, [(0.033, 0.49), (0.033, 0.52), (0.031, 0.52)], 10, I4)
    cbox(mw, (0.075, 0.08, 0.09), (0, 0.0, 0.84), c=0.012)                     # elevation drive housing
    disc(md, 0.03, -0.06, 0.06, 8, T(0, 0, 0.85) @ AX['X'])
    hb = 0.925
    cbox(mw, (0.44, 0.085, 0.085), (0, -0.01, hb), c=0.014)                    # camera bar
    cbox(mw, (0.10, 0.11, 0.11), (0, -0.005, hb), c=0.014)
    for sx in (-1, 1):
        for xx, rr, ln in ((0.165, 0.03, 0.05), (0.075, 0.019, 0.035)):         # Pancam outboard, Navcam inboard
            lathe(ma, [(rr, 0.0), (rr, ln), (rr - 0.005, ln), (rr - 0.005, 0.0)], 10, T(sx * xx, -0.05, hb) @ R('X', 90), close=True)
            disc(ml, rr - 0.005, 0.0, ln - 0.012, 8, T(sx * xx, -0.05, hb) @ R('X', 90))
        cbox(md, (0.012, 0.09, 0.09), (sx * 0.222, -0.01, hb), c=0.01)
    disc(md, 0.022, 0.0, 0.012, 8, T(0, -0.06, hb + 0.0) @ R('X', 90))          # spectrometer aperture in the head
    tube(md, [(0.03, 0.03, 0.12), (0.04, 0.03, 0.45), (0.04, 0.035, 0.78)], 0.006, 4)

    anchor('col_body', root, loc=(0, 0.05, 0), radius=1.05)
    return finish(root, 'mer', [k, km])


def _mmrtg(k, F, y1, tints):
    """Curiosity's power unit on the tail of the body (whose rear face is y = y1), in the frame F:
    local Z is the generator's axis, from its mounting flange at 0 up to the end dome at 0.69, and
    local -Y is its upper side. A finned cylinder 0.64 m across: the housing with a flange at each
    end and a domed, bolted cap; eight white radiator fins; the coolant loop that snakes along the
    fin roots and round the fin ends (copper). On either side stands a heat-exchanger plate, the
    pair low and leaning apart like a V so that the generator shows between and above them: white
    outside with a frame, a serpentine tube and a yellow caution placard, gold blanket inside, on
    struts from the body, plumbed to the body at one end and to the generator at the other."""
    alu, white, dark, cu, gold = k('aluminium'), k('painted_white', 30), k('painted_dark'), k('copper'), k('gold_foil', 28)
    lathe(alu, [(0.0, -0.004), (0.11, -0.004), (0.162, 0.004), (0.162, 0.026), (0.138, 0.036), (0.138, 0.598), (0.166, 0.608), (0.166, 0.634), (0.0, 0.634)], 14, F)
    lathe(white, [(0.0, 0.634), (0.146, 0.634), (0.146, 0.648), (0.128, 0.668), (0.085, 0.684), (0.0, 0.69)], 14, F)      # the end cap
    fins = [45 * i for i in range(8)]                                   # (one straight up: from the side and from behind it is unmistakably a fin)
    for a in fins:
        prism(white, [(0.125, 0.05), (0.292, 0.066), (0.322, 0.10), (0.322, 0.545), (0.292, 0.578), (0.125, 0.594)], 0.013, F @ R('Z', a) @ R('X', 90))
    loop = []
    for i, a in enumerate(fins):                                        # one run in each gap, close to a fin; round the end of the next fin to the next gap
        run = [polar(0.151, a + 7.5, 0.082), polar(0.151, a + 7.5, 0.565)]
        loop += run if i % 2 == 0 else run[::-1]
        loop.append(polar(0.156, a + 45, 0.603 if i % 2 == 0 else 0.042))
    tube(cu, loop, 0.0085, 4, closed=True, M=F)
    bolt_circle(dark, 0.157, 8, 0.0095, 0.008, F @ T(0, 0, 0.634), seg=4)
    lathe(dark, [(0.0, 0.69), (0.042, 0.69), (0.042, 0.704), (0.026, 0.714), (0.0, 0.714)], 8, F)
    for a in (0, 120, 240):                                              # lifting lugs on the cap
        cbox(alu, (0.016, 0.03, 0.03), (0.107, 0, 0.684), F @ R('Z', a + 30), c=0.004)
    # the mount: an adapter cone onto a plate bolted to the body's rear face
    lathe(alu, [(0.066, -0.118), (0.09, -0.118), (0.122, -0.004), (0.098, -0.004)], 10, F, close=True)
    cbox(alu, (0.32, 0.03, 0.27), (0, y1 + 0.012, 0.925), c=0.04)
    for bx, bz in ((-0.13, 0.82), (0.13, 0.82), (-0.13, 1.03), (0.13, 1.03)):
        bolt(dark, 0.012, 0.008, T(bx, y1 + 0.027, bz) @ R('X', -90), 5)
    for sx in (-1, 1):
        # A plate stands below the level of the generator's axis and leans well out, so that from the side the upper half
        # of the generator (housing, fins, cap) is in plain view over its top edge, and from behind and above all of it is.
        Mo = F @ T(sx * 0.40, 0.12, 0.0) @ R('Z', sx * 28) @ R('Y', sx * 4) @ S(sx, 1, 1)        # the plate's frame: +X is its outer side
        hw, z0, z1 = 0.13, 0.09, 0.55
        zm = (z0 + z1) / 2
        prism(white, [(py, pz + zm) for py, pz in chamf(2 * hw, z1 - z0, 0.035)], 0.018, Mo @ YZX)
        fx = 0.013
        for yy in (-hw + 0.014, hw - 0.014):                              # frame, stiffeners
            beam(alu, (fx, yy, z0 + 0.03), (fx, yy, z1 - 0.03), 0.024, 0.009, up=(1, 0, 0), M=Mo)
        for zz in (z0 + 0.013, z1 - 0.013):
            beam(alu, (fx, -hw + 0.03, zz), (fx, hw - 0.03, zz), 0.024, 0.009, up=(1, 0, 0), M=Mo)
        for zz in (zm - 0.08, zm + 0.08):
            beam(alu, (fx - 0.001, -hw + 0.02, zz), (fx - 0.001, hw - 0.02, zz), 0.013, 0.006, up=(1, 0, 0), M=Mo)
        ys = (-0.078, -0.026, 0.026)                                      # the fluid loop on its outer face
        path = [(-0.03, ys[0], z0 - 0.03), (0.019, ys[0], z0 - 0.02)]
        for j, yy in enumerate(ys):
            run = [(0.019, yy, z0 + 0.055), (0.019, yy, z1 - 0.055)]
            path += run if j % 2 == 0 else run[::-1]
        tube(cu, path + [(0.019, ys[-1], z1 + 0.02), (-0.03, ys[-1], z1 + 0.03)], 0.008, 4, M=Mo, up=(1, 0, 0))
        with tints.on(white, (1.0, 0.70, 0.07)):                          # caution placard
            box(white, (0.004, 0.05, 0.13), (0.0105, 0.083, zm), Mo)
        box(dark, (0.006, 0.05, 0.022), (0.0112, 0.083, zm), Mo)
        foil_panel(gold, Mo @ T(-0.0095, 0, zm) @ R('Y', -90), z1 - z0 - 0.06, 2 * hw - 0.05, 4, 3, 0.006, seed=8 + sx, bulge=0.006)
        for (py, pz), wz in (((-0.08, z0 + 0.04), 1.00), ((0.09, z0 + 0.06), 0.80)):     # struts from the body
            rod(alu, (sx * 0.42, y1, wz), Mo @ Vector((-0.012, py, pz)), 0.012, 5)
        tube(cu, [Mo @ Vector((-0.03, ys[0], z0 - 0.03)), Vector((sx * 0.29, y1 + 0.06, 0.90)), Vector((sx * 0.29, y1, 0.90))], 0.008, 4, round_r=0.03, steps=1)
        tube(cu, [Mo @ Vector((-0.03, ys[-1], z1 + 0.03)), F @ Vector(polar(0.25, 90 - sx * 75, 0.60)), F @ Vector(polar(0.158, 90 - sx * 68, 0.585))], 0.008, 4,
             round_r=0.03, steps=1)


def _mast_rover(name, m20=False):
    """The MSL-class rover: the white box body on a black rocker-bogie with six big wheels, the
    tall mast with its camera head (part `mast`), the stowed robot arm and turret (part `arm`) and
    the finned RTG angled up at the back. m20=False is Curiosity. m20=True is Perseverance, built
    on the same chassis but different wherever a visitor would look: thick bare-aluminium wheels
    with many gently curved treads, a bigger mast head with a large round window over two zoom
    cameras, a much heavier turret with the coring drill, the sample-caching assembly with its
    bit carousel across the front, the bolted-on helicopter pan under the belly, and the radar
    antenna under the generator."""
    weathered()
    root = part(name)
    k = Kit(root)
    tints = None if m20 else Tints()
    slots = Wound(root, 'slots')                     # (Curiosity only: the holes in its wheels)
    if not m20:
        mat('void', color=(0.004, 0.004, 0.005), metallic=0.0, roughness=1.0)      # the game draws this name pure black, without dust
    nb = 6 if m20 else 4                             # sides of a small bolt head (four on Curiosity: its generator is paid for partly here)
    white, body, dark = k('painted_white', 30), k('painted_white', 25, 0.014), k('painted_dark')
    alu, ti, gold, lens, cu = k('aluminium'), k('titanium'), k('gold_foil', 28), k('lens'), k('copper')
    WR, WW, X = (0.2625, 0.34, 1.10) if m20 else (0.26, 0.40, 1.10)
    YF, YM, YR = -1.10, 0.05, 1.05
    zb0, zb1 = 0.66, 1.10
    y0, y1 = -0.80, 0.70
    yc = (y0 + y1) / 2

    # --- body: belly pan, box, deck plate ---
    taper_box(dark, (0.96, 1.32), (1.20, 1.50), zb0, zb0 + 0.13, loc=(0, yc))
    box(body, (1.20, 1.50, zb1 - zb0 - 0.13), (0, yc, (zb0 + 0.13 + zb1) / 2))
    cbox(body, (1.27, 1.57, 0.035), (0, yc, zb1 + 0.012), c=0.05)
    zt = zb1 + 0.03
    for sx in (-1, 1):                               # side panels, connector boxes, harness
        Ms = T(sx * 0.60, yc, 0.955) @ R('Z', 90 * sx) @ R('X', 90)
        for px in (-0.45, 0.05, 0.50):
            prism(white, rrect(0.40, 0.20, 0.02, 2) if m20 else chamf(0.40, 0.20, 0.014), 0.008, Ms @ T(px * sx, 0.01, 0), z0=0.0)
            for bx in (-0.17, 0.17):
                for by in (-0.07, 0.07):
                    bolt(alu, 0.009, 0.006, Ms @ T(px * sx + bx, 0.01 + by, 0.008), nb)
        cbox(alu, (0.05, 0.22, 0.10), (sx * 0.625, 0.40, 0.84), c=0.012)
        tube(dark, [(sx * 0.612, -0.70, 0.83), (sx * 0.612, -0.25, 0.83), (sx * 0.612, -0.15, 0.80), (sx * 0.612, 0.28, 0.80)], 0.012, 5)
    for y, ry in ((y0, 0), (y1, 180)):               # hazard camera pairs front and rear
        for sx in (-1, 1):
            Mh = T(sx * 0.22, y, 0.90) @ R('Z', ry)
            cbox(dark, (0.16, 0.06, 0.07), (0, -0.03, 0), Mh, c=0.01)
            for ex in (-0.04, 0.04):
                disc(lens, 0.018, 0.0, 0.008, 8, Mh @ T(ex, -0.06, 0) @ R('X', 90))
    if not m20:
        foil_panel(gold, T(0, y0 - 0.003, 0.80) @ R('X', 90), 0.80, 0.12, 5, 2, 0.006, seed=5, bulge=0.008)
        rod(alu, (-0.36, y0, 0.78), (-0.36, y0 - 0.13, 0.76), 0.012, 5)                           # observation tray on its bracket
        lathe(white, [(0.0, 0.0), (0.10, 0.0), (0.10, 0.012), (0.09, 0.012), (0.085, 0.006), (0.0, 0.006)], 16, T(-0.36, y0 - 0.20, 0.755))
        for bx in (-0.10, 0.04):                                                                  # spare drill-bit boxes
            cbox(alu, (0.10, 0.07, 0.11), (bx, y0 - 0.035, 0.74), c=0.012)
            disc(dark, 0.028, 0.0, 0.012, 8, T(bx, y0 - 0.07, 0.75) @ R('X', 90))
    else:
        # --- the sample-caching assembly: a deep housing across the front of the chassis, hanging below
        #     the belly line, with the bit carousel (a drum of drill bits) let into its upper face ---
        ya = y0 - 0.11
        cbox(alu, (0.86, 0.24, 0.36), (-0.04, ya, 0.625), c=0.04)                                  # its top stays under the stowed arm
        cbox(dark, (0.80, 0.20, 0.05), (-0.04, ya, 0.43), c=0.03)
        for bx in (-0.40, 0.10, 0.30):                                                            # panel seams and fasteners on its face
            box(dark, (0.008, 0.012, 0.30), (bx, ya - 0.121, 0.625))
        for bx in (-0.44, 0.14, 0.26, 0.36):
            for bz in (0.49, 0.77):
                bolt(dark, 0.011, 0.007, T(bx, ya - 0.12, bz) @ R('X', 90), 4)
        Mcar = T(-0.15, ya - 0.115, 0.615) @ R('X', 72)                                           # carousel: on the face, looking forward and a little up
        lathe(white, [(0.0, -0.03), (0.175, -0.03), (0.185, -0.02), (0.185, 0.06), (0.165, 0.085), (0.0, 0.095)], 16, Mcar)
        lathe(alu, [(0.19, -0.02), (0.202, -0.02), (0.202, 0.035), (0.19, 0.035)], 16, Mcar, close=True)
        bolt_circle(dark, 0.15, 10, 0.011, 0.008, Mcar @ T(0, 0, 0.078), seg=4)
        for an in (70, 215):                                                                      # the two ports the drill reaches into
            lathe(dark, [(0.0, 0.088), (0.042, 0.088), (0.042, 0.10), (0.0, 0.10)], 10, Mcar @ T(*polar(0.085, an)))
            lathe(alu, [(0.042, 0.08), (0.054, 0.08), (0.054, 0.104), (0.042, 0.104)], 10, Mcar @ T(*polar(0.085, an)), close=True)
        foil_panel(gold, T(0.26, ya - 0.122, 0.63) @ R('X', 90), 0.16, 0.24, 3, 3, 0.006, seed=5, bulge=0.008)
        tube(dark, [(0.37, ya - 0.10, 0.80), (0.40, ya - 0.14, 0.72), (0.40, ya - 0.14, 0.50)], 0.012, 5, round_r=0.04)
        # --- the helicopter pan: a shallow tray bolted under the belly, with the stub of the delivery arm ---
        cbox(alu, (0.84, 1.00, 0.075), (0.0, yc + 0.08, zb0 - 0.04), c=0.07)
        cbox(dark, (0.70, 0.86, 0.02), (0.0, yc + 0.08, zb0 - 0.085), c=0.05)
        for bx in (-0.40, 0.40):
            for by in (-0.38, -0.13, 0.13, 0.38):
                bolt(dark, 0.014, 0.012, T(bx * 1.055, yc + 0.08 + by, zb0 - 0.04) @ R('Y', 90 if bx > 0 else -90), 4)
                box(alu, (0.045, 0.07, 0.085), (bx * 1.07, yc + 0.08 + by, zb0 + 0.0))
        beam(alu, (0.0, yc - 0.30, zb0 - 0.105), (0.0, yc + 0.30, zb0 - 0.105), 0.05, 0.03, c=0.008)
        disc(dark, 0.035, -0.045, 0.045, 8, T(0.0, yc + 0.34, zb0 - 0.11) @ AX['X'])
    # --- deck: differential bar, antennas, instrument inlets, descent-stage fittings, fasteners ---
    disc(dark, 0.06, zt, zt + 0.05, 12, T(0, -0.08, 0))
    rod(dark, (-0.63, -0.06, zt + 0.035), (0.63, -0.06, zt + 0.035), 0.022, 8)
    hx, hy = 0.40, 0.34                                # high-gain: a six-sided panel on a two-axis gimbal
    lathe(alu, [(0.0, zt), (0.06, zt), (0.06, zt + 0.03), (0.03, zt + 0.05), (0.03, zt + 0.17), (0.0, zt + 0.17)], 10, T(hx, hy, 0))
    cbox(alu, (0.09, 0.08, 0.08), (hx, hy, zt + 0.20), c=0.012)
    Mg = T(hx, hy, zt + 0.25) @ R('Z', -20) @ R('X', -40)
    prism(cu, ngon(0.17, 6), 0.022, Mg, z0=0.02)
    prism(alu, ngon(0.18, 6), 0.012, Mg, z0=0.01)
    disc(alu, 0.04, -0.02, 0.012, 8, Mg)
    lathe(alu, [(0.0, zt), (0.035, zt), (0.035, zt + 0.02), (0.02, zt + 0.03), (0.02, zt + 0.11), (0.03, zt + 0.12), (0.03, zt + 0.19),
                (0.0, zt + 0.20)], 8, T(0.47, 0.60, 0))                                              # low-gain
    ux, uy = -0.50, 0.58                               # UHF quad-helix can
    lathe(white, [(0.0, zt), (0.055, zt), (0.055, zt + 0.30), (0.045, zt + 0.32), (0.0, zt + 0.32)], 12, T(ux, uy, 0))
    for i in range(4):
        tube(cu, [(0.057 * cos(TAU * (i / 4 + t / 6)), 0.057 * sin(TAU * (i / 4 + t / 6)), zt + 0.03 + 0.26 * t / 6) for t in range(7)],
             0.004, 3, M=T(ux, uy, 0))
    for (x, y, r) in ((0.02, -0.52, 0.045), (0.16, -0.56, 0.035), (0.30, -0.50, 0.035)):             # sample inlets with lids
        lathe(alu, [(0.0, zt), (r, zt), (r, zt + 0.04), (r * 1.25, zt + 0.07), (r * 1.25, zt + 0.08), (0.0, zt + 0.08)], 10, T(x, y, 0))
        disc(white, r * 1.1, zt + 0.08, zt + 0.092, 10, T(x + r * 0.5, y + r * 0.4, 0))
    for (x, y) in ((0.0, 0.52), (-0.42, -0.30), (0.42, -0.30)):                                      # descent-stage bipod cones
        lathe(alu, [(0.0, zt), (0.075, zt), (0.075, zt + 0.015), (0.03, zt + 0.07), (0.0, zt + 0.07)], 10, T(x, y, 0))
    cbox(alu, (0.09, 0.09, 0.012), (-0.30, 0.50, zt + 0.006), c=0.012)                               # calibration target
    rod(dark, (-0.30, 0.50, zt + 0.012), (-0.30, 0.50, zt + 0.05), 0.004, 5)
    ball(dark, (-0.30, 0.50, zt + 0.055), 0.008, 6, 3)
    disc(dark, 0.05, zt, zt + 0.012, 12, T(-0.12, 0.25, 0))                                          # radiation detector window
    if m20:
        cbox(dark, (0.30, 0.24, 0.05), (0.06, 0.20, zt + 0.025), c=0.02)                             # oxygen experiment's inlet cover
        cbox(alu, (0.26, 0.10, 0.035), (-0.28, 0.08, zt + 0.018), c=0.012)
        cbox(white, (0.11, 0.09, 0.13), (0.20, 0.60, zt + 0.065), c=0.012)                           # laser calibration target board
        box(dark, (0.09, 0.004, 0.10), (0.20, 0.554, zt + 0.07))
    else:
        cbox(white, (0.34, 0.26, 0.06), (0.08, 0.22, zt + 0.03), c=0.02)
        cbox(alu, (0.20, 0.14, 0.04), (-0.30, 0.10, zt + 0.02), c=0.015)
    tube(dark, [(-0.42, -0.50, zt + 0.012), (-0.30, -0.36, zt + 0.012), (-0.30, 0.02, zt + 0.012)], 0.012, 5, round_r=0.05)
    tube(dark, [(0.08, 0.36, zt + 0.012), (0.20, 0.44, zt + 0.012), (0.36, 0.40, zt + 0.012)], 0.012, 5, round_r=0.05)
    for ix in range(6):
        for iy in range(7):
            if (ix in (0, 5)) or (iy in (0, 6)):
                bolt(alu, 0.011, 0.006, T(-0.58 + 0.232 * ix, y0 + 0.05 + 0.233 * iy, zt), nb)

    # --- radioisotope generator on the tail, angled up, between its two heat-exchanger plates ---
    axis = Vector((0, cos(rad(27)), sin(rad(27))))
    base = Vector((0, y1 + 0.10, 0.99))
    F = frame(base, axis, (1, 0, 0))
    if not m20:
        _mmrtg(k, F, y1, tints)
    else:                                            # (Perseverance keeps the plain unit it was built with until its own art pass)
        lathe(alu, [(0.0, 0.0), (0.15, 0.0), (0.17, 0.03), (0.17, 0.06), (0.125, 0.07), (0.125, 0.60), (0.17, 0.61), (0.17, 0.645),
                    (0.13, 0.67), (0.0, 0.67)], 14, F)
        for i in range(8):
            Mf = F @ R('Z', 45 * i + 22.5)
            prism(white, [(0.115, 0.075), (0.325, 0.095), (0.325, 0.575), (0.115, 0.595)], 0.012, Mf @ R('X', 90))
        bolt_circle(dark, 0.10, 8, 0.012, 0.01, F @ T(0, 0, 0.67))
        for sx in (-1, 1):
            Mp = F @ T(sx * 0.40, 0.03, -0.02) @ R('Y', sx * 9)
            prism(body, [(-0.19, 0.0), (0.19, 0.0), (0.22, 0.66), (-0.22, 0.66)], 0.024, Mp @ R('Y', 90) @ R('Z', 90))
            foil_panel(gold, Mp @ T(-sx * 0.013, 0, 0.33) @ R('Y', -sx * 90), 0.58, 0.34, 4, 3, 0.006, seed=7 + sx, bulge=0.006)
            for zz in (0.10, 0.56):
                box(alu, (0.03, 0.42, 0.03), (sx * 0.014, 0, zz), Mp)
            rod(alu, (sx * 0.40, y1, 1.02), F @ Vector((sx * 0.42, 0.0, 0.10)), 0.014, 5)
            rod(alu, (sx * 0.40, y1, 0.80), F @ Vector((sx * 0.42, -0.16, 0.16)), 0.014, 5)
            tube(cu, [F @ Vector((sx * 0.17, 0.0, 0.05)), F @ Vector((sx * 0.30, 0.0, 0.05)), F @ Vector((sx * 0.40, 0.0, 0.16))], 0.010, 5, round_r=0.04)
        rod(alu, (0, y1, 0.86), base + axis * 0.02, 0.05, 8)
        cbox(alu, (0.36, 0.08, 0.22), (0, y1 + 0.03, 0.93), c=0.02)
    if m20:                                                                                       # ground radar antenna slung under the generator
        Mrx = T(0, y1 + 0.20, 0.66) @ R('X', -12)
        prism(white, [(-0.30, -0.14), (0.30, -0.14), (0.20, 0.14), (-0.20, 0.14)], 0.07, Mrx)
        prism(dark, [(-0.26, -0.11), (0.26, -0.11), (0.17, 0.11), (-0.17, 0.11)], 0.012, Mrx @ T(0, 0, -0.04))
        for sx in (-1, 1):
            rod(alu, (sx * 0.18, y1, 0.72), Mrx @ Vector((sx * 0.16, 0.0, 0.035)), 0.012, 5)

    # --- rocker-bogie: black tubes from the body pivot to the six wheels ---
    top_z = 2 * WR + 0.21
    tr = 0.034
    for sx in (-1, 1):
        P = Vector((sx * 0.67, -0.06, 0.93))
        B = Vector((sx * 0.93, 0.62, 0.68))
        disc(dark, 0.075, -0.07, 0.06, 12, T(*P) @ AX['X'] @ S(1, 1, sx))
        disc(alu, 0.05, 0.06, 0.075, 10, T(*P) @ AX['X'] @ S(1, 1, sx))
        rod(dark, (sx * 0.63, -0.06, zt + 0.035), (sx * 0.66, -0.06, 0.98), 0.016, 6)
        tube(dark, [P, (sx * 0.80, -0.50, 1.01), (sx * 1.00, -0.95, 0.90), (sx * X, YF, top_z - 0.03)], tr, 6, round_r=0.12)
        tube(dark, [P, (sx * 0.83, 0.34, 0.82), B], tr, 6, round_r=0.10)
        ball(dark, B, 0.055, 8, 4)
        disc(alu, 0.04, -0.06, 0.06, 8, T(*B) @ AX['X'])
        tube(dark, [B, (sx * 1.02, 0.86, 0.745), (sx * X, YR, top_z - 0.03)], tr, 6, round_r=0.08)
        xi = sx * (X - WW / 2 - 0.075)
        tube(dark, [B, (xi, 0.36, 0.52), (xi, YM, WR + 0.02)], tr, 6, round_r=0.10)
        disc(dark, WR * 0.36, -WW * 0.3, 0.03, 10, T(xi, YM, WR) @ AX['X'] @ S(1, 1, -sx))
        for y in (YF, YR):
            _steer_unit(k, sx * X, y, WR, WW, sx, top_z, tube_r=0.03, mat='painted_dark', act_r=0.06)
        for y in (YF, YM, YR):
            Mw = T(sx * X, y, WR) @ AX['X'] @ S(1, 1, sx)
            if m20:      # thick machined aluminium, left bare; many more treads, each a gentle curve; curved titanium spokes
                wheel(alu, dark, Mw, WR, WW, seg=20, th=0.018, cleats=24, cleat_h=0.011, cleat_t=0.011, chevron=0.040, crown=0.05,
                      spokes=6, spoke_twist=0.75, spoke_w=0.06, spoke_t=0.007, hub_r=0.085, hub_x=-0.05, hub_len=0.13, spoke_bm=ti,
                      curved=True)
            else:
                wheel(dark, alu, Mw, WR, WW, seg=20, th=0.008, cleats=18, cleat_h=0.012, cleat_t=0.012, chevron=0.055, crown=0.035,
                      spokes=6, spoke_twist=1.05, spoke_w=0.07, spoke_t=0.005, hub_r=0.075, hub_x=-0.06, hub_len=0.12, spoke_bm=ti,
                      lean=True, morse=slots('void'), morse_at=95 + 47 * sx + 110 * (y - YM))

    # --- mast: its own part, turning on the deck at the front right ---
    mast = part('mast', root, loc=(-0.43, -0.60, zt))
    km = Kit(mast)
    mw, ma, md, ml = km('painted_white', 30), km('aluminium'), km('painted_dark'), km('lens')
    cbox(ma, (0.16, 0.20, 0.07), (0, 0.03, 0.035), c=0.02)                      # deploy hinge
    disc(md, 0.045, -0.10, 0.10, 8, T(0, 0.10, 0.05) @ AX['X'])
    lathe(mw, [(0.058, 0.07), (0.058, 0.36), (0.066, 0.37), (0.066, 0.42), (0.052, 0.43), (0.052, 0.74), (0.0, 0.74)], 12, I4)
    for an, ln in ((205, 0.30), (320, 0.26)):                                    # weather booms part-way up
        p0 = Vector(polar(0.05, an, 0.395))
        p1 = Vector(polar(0.05 + ln, an, 0.40))
        rod(ma, p0, p1, 0.011, 6, r2=0.007)
        ball(md, p1, 0.011, 5, 3)
    lathe(ma, [(0.07, 0.74), (0.07, 0.80), (0.05, 0.81), (0.0, 0.81)], 12, I4)   # azimuth drive
    hz = 0.93
    if not m20:
        cbox(mw, (0.06, 0.09, 0.14), (-0.215, 0.02, hz - 0.02), c=0.012)             # elevation yoke
        cbox(mw, (0.42, 0.06, 0.05), (0.0, 0.05, 0.835), c=0.012)
        # the head is two things: the laser spectrometer's box, and slung under its front edge the camera bar
        disc(ma, 0.05, 0.80, 0.88, 10, I4)
        cbox(mw, (0.36, 0.25, 0.175), (0.0, 0.0, 0.96), c=0.035)
        cbox(mw, (0.30, 0.19, 0.03), (0.0, 0.01, hz + 0.125), c=0.03)
        Mf = T(0, -0.125, 0.96) @ R('X', 90)                                         # the box's face (local XY, +Z out of it)
        lathe(ma, [(0.079, 0.0), (0.079, 0.042), (0.062, 0.042), (0.062, 0.0)], 16, Mf @ T(-0.085, 0.0, 0), close=True)
        disc(ml, 0.062, 0.0, 0.014, 14, Mf @ T(-0.085, 0.0, 0))                      # its big eye, to one side
        prism(ma, rrect(0.12, 0.10, 0.012, 2), 0.006, Mf @ T(0.095, 0.0, 0), z0=0.0)  # an access cover beside it
        for bx, by in ((-0.045, -0.035), (0.045, -0.035), (-0.045, 0.035), (0.045, 0.035)):
            bolt(md, 0.007, 0.005, Mf @ T(0.095 + bx, by, 0.006), 4)
        cbox(mw, (0.40, 0.115, 0.07), (0.0, -0.085, 0.842), c=0.014)                 # the camera bar
        for ex, sq, ln in ((-0.04, 0.064, 0.05), (0.047, 0.05, 0.075)):              # two mast cameras, wide and telephoto, in square hoods
            cbox(md, (sq, ln, sq), (ex, -0.1325 - ln / 2, 0.842), c=0.008)
            disc(ml, sq * 0.32, 0.0, 0.004, 8, T(ex, -0.1325 - ln, 0.842) @ R('X', 90))
        for ex in (-0.172, -0.125, 0.125, 0.172):                                    # navigation cameras in pairs at its ends
            disc(ma, 0.017, 0.0, 0.03, 8, T(ex, -0.1425, 0.842) @ R('X', 90))
            disc(ml, 0.011, 0.03, 0.034, 6, T(ex, -0.1425, 0.842) @ R('X', 90))
    else:
        mg = km('gold_foil', 28)
        hz = 0.98
        cbox(mw, (0.07, 0.10, 0.17), (-0.25, 0.02, hz - 0.04), c=0.012)              # elevation yoke
        cbox(mw, (0.50, 0.07, 0.055), (0.0, 0.05, 0.835), c=0.012)
        cbox(mw, (0.40, 0.30, 0.25), (0.0, 0.02, hz + 0.03), c=0.04)                 # the laser instrument's box: taller and deeper
        cbox(mw, (0.34, 0.24, 0.03), (0.0, 0.03, hz + 0.165), c=0.03)
        foil_panel(mg, T(0.201, 0.02, hz + 0.03) @ R('Y', 90) @ R('Z', 90), 0.24, 0.19, 3, 3, 0.005, seed=61, bulge=0.006)   # radiator blanket on its side
        Mf = T(0, -0.13, hz + 0.03) @ R('X', 90)                                     # the face (local XY, +Z out of it)
        lathe(ma, [(0.118, 0.0), (0.118, 0.045), (0.094, 0.045), (0.094, 0.0)], 20, Mf @ T(-0.055, 0.015, 0), close=True)
        disc(ml, 0.094, 0.0, 0.014, 18, Mf @ T(-0.055, 0.015, 0))                    # its 11 cm window: nearly half the face
        lathe(md, [(0.036, 0.0), (0.036, 0.03), (0.022, 0.03), (0.022, 0.0)], 10, Mf @ T(0.115, 0.05, 0), close=True)   # microphone and context imager
        disc(ml, 0.022, 0.0, 0.01, 8, Mf @ T(0.115, 0.05, 0))
        # the zoom cameras: a wide-set pair in long square hoods on a bar under the box
        cbox(mw, (0.46, 0.10, 0.075), (0.0, -0.02, hz - 0.135), c=0.014)
        for ex in (-0.12, 0.12):
            cbox(md, (0.085, 0.13, 0.085), (ex, -0.085, hz - 0.135), c=0.012)
            disc(ml, 0.027, 0.0, 0.008, 10, T(ex, -0.151, hz - 0.135) @ R('X', 90))
        for ex in (-0.205, 0.205):                                                   # navigation cameras at the ends of the bar
            lathe(ma, [(0.026, 0.0), (0.026, 0.035), (0.018, 0.035), (0.018, 0.0)], 8, T(ex, -0.07, hz - 0.135) @ R('X', 90), close=True)
            disc(ml, 0.018, 0.0, 0.03, 8, T(ex, -0.07, hz - 0.135) @ R('X', 90))
        for an in (25, 150, 265):                                                    # wind sensor ring round the mast
            p0 = Vector(polar(0.05, an, 0.66))
            rod(ma, p0, Vector(polar(0.19, an, 0.665)), 0.009, 5, r2=0.006)
            cbox(md, (0.03, 0.03, 0.022), tuple(Vector(polar(0.20, an, 0.665))), c=0.005)
    tube(md, [(0.05, 0.05, 0.10), (0.064, 0.05, 0.40), (0.06, 0.05, 0.72), (0.05, 0.09, 0.84)], 0.009, 5)

    # --- robot arm, stowed across the front; its own part, pivoting at the shoulder ---
    sh = Vector((0.46, y0 - 0.10, 0.86))
    cbox(alu, (0.18, 0.12, 0.14), (sh.x, y0 - 0.04, sh.z - 0.02), c=0.02)       # shoulder bracket on the body
    arm = part('arm', root, loc=tuple(sh))
    ka = Kit(arm)
    aw, aa, ad, al, at = ka('painted_white', 30), ka('aluminium'), ka('painted_dark'), ka('lens'), ka('titanium')
    disc(ad, 0.065, -0.10, 0.09, 12, I4)                                         # shoulder azimuth actuator
    disc(aa, 0.07, 0.09, 0.105, 12, I4)
    disc(ad, 0.055, -0.08, 0.08, 10, T(0, -0.085, 0.03) @ AX['X'])               # shoulder elevation
    E = Vector((-0.86, -0.13, 0.05))
    W = Vector((-0.10, -0.25, -0.03))
    S0 = Vector((0, -0.085, 0.03))
    for a, b in ((S0, E), (E, W)):
        d = (b - a).normalized()
        sweep(aw, [a + d * 0.05, b - d * 0.05], chamf(0.06, 0.085, 0.018), up=(0, 0, 1))
        for t in (0.25, 0.5, 0.75):
            p = a.lerp(b, t)
            sweep(aa, [p - d * 0.012, p + d * 0.012], chamf(0.068, 0.093, 0.02), up=(0, 0, 1))
        tube(ad, [a + d * 0.08 + Vector((0, 0, 0.05)), a.lerp(b, 0.5) + Vector((0, 0, 0.052)), b - d * 0.08 + Vector((0, 0, 0.05))], 0.008, 4)
    disc(ad, 0.06, -0.08, 0.08, 10, T(*E) @ R('Z', 8))                           # elbow
    disc(aa, 0.066, 0.08, 0.092, 10, T(*E) @ R('Z', 8))
    disc(ad, 0.05, -0.07, 0.07, 10, T(*W))                                       # wrist
    Tc = W + Vector((0.02, -0.13, -0.05))                                        # turret hub
    disc(ad, 0.05, -0.06, 0.06, 10, T(*(W + Vector((0.01, -0.06, -0.03)))) @ AX['Y'])
    if not m20:
        lathe(aa, [(0.0, -0.07), (0.11, -0.07), (0.12, -0.06), (0.12, 0.06), (0.11, 0.07), (0.0, 0.07)], 14, T(*Tc) @ AX['Y'])
        Md = T(*Tc) @ R('Y', 15)                                                 # drill: the long barrel under the hub
        lathe(aa, [(0.0, -0.46), (0.018, -0.46), (0.022, -0.36), (0.05, -0.34), (0.06, -0.30), (0.06, -0.06), (0.0, -0.06)], 12, Md)
        lathe(ad, [(0.066, -0.27), (0.066, -0.12), (0.06, -0.12)], 12, Md)
        for sxx in (-1, 1):
            rod(at, Md @ Vector((sxx * 0.07, 0.0, -0.20)), Md @ Vector((sxx * 0.075, 0.0, -0.43)), 0.009, 5)
        cbox(aw, (0.20, 0.15, 0.22), (0.19, 0.0, 0.02), T(*Tc) @ R('Y', -10), c=0.03)      # sample-handling box
        cbox(ad, (0.10, 0.155, 0.06), (0.19, 0.0, 0.14), T(*Tc) @ R('Y', -10), c=0.02)
        Mx = T(*Tc) @ R('Y', 125)                                                # spectrometer and hand-lens camera
        disc(aa, 0.05, 0.10, 0.23, 10, Mx)
        disc(ad, 0.042, 0.23, 0.245, 10, Mx)
        Mc = T(*Tc) @ R('Y', -120)
        disc(aw, 0.04, 0.10, 0.20, 10, Mc)
        disc(al, 0.026, 0.20, 0.208, 8, Mc)
        Mb = T(*Tc) @ R('Y', -65)                                                # dust brush
        disc(ad, 0.03, 0.10, 0.19, 8, Mb)
    else:
        # a 45 kg turret: a wide drum carrying the coring drill between two stabiliser feet, the
        # ultraviolet spectrometer's box, the X-ray instrument on its six struts, and a gas jet
        lathe(aa, [(0.0, -0.10), (0.15, -0.10), (0.165, -0.085), (0.165, 0.085), (0.15, 0.10), (0.0, 0.10)], 16, T(*Tc) @ AX['Y'])
        bolt_circle(ad, 0.125, 8, 0.012, 0.008, T(*Tc) @ AX['Y'] @ T(0, 0, 0.10), seg=4)
        Md = T(*Tc) @ R('Y', 12)                                                 # coring drill: a fat body, the chuck, the bit
        lathe(aw, [(0.0, -0.10), (0.095, -0.10), (0.105, -0.12), (0.105, -0.40), (0.085, -0.43), (0.0, -0.43)], 14, Md)
        lathe(aa, [(0.0, -0.43), (0.06, -0.43), (0.06, -0.50), (0.035, -0.53), (0.016, -0.56), (0.016, -0.64), (0.0, -0.64)], 12, Md)
        lathe(ad, [(0.111, -0.34), (0.111, -0.18), (0.105, -0.18)], 14, Md)
        for sxx in (-1, 1):                                                      # stabilisers that press on the rock
            rod(at, Md @ Vector((sxx * 0.13, 0.0, -0.16)), Md @ Vector((sxx * 0.135, 0.0, -0.57)), 0.014, 6)
            disc(ad, 0.024, -0.60, -0.57, 8, Md @ T(sxx * 0.135, 0, 0))
            box(aa, (0.05, 0.05, 0.05), (sxx * 0.13, 0.0, -0.17), Md)
        Ms = T(*Tc) @ R('Y', -78)                                                # spectrometer: a long gold-wrapped box with a lens barrel
        ag = ka('gold_foil', 28)
        cbox(ag, (0.17, 0.18, 0.30), (0.0, 0.0, 0.30), Ms, c=0.03)
        cbox(aw, (0.19, 0.20, 0.05), (0.0, 0.0, 0.17), Ms, c=0.03)
        disc(ad, 0.045, 0.45, 0.50, 10, Ms @ T(0.03, 0, 0))
        disc(al, 0.03, 0.50, 0.508, 8, Ms @ T(0.03, 0, 0))
        Mx = T(*Tc) @ R('Y', 118)                                                # X-ray instrument: a drum floating on six struts
        disc(aw, 0.085, 0.27, 0.40, 12, Mx)
        disc(ad, 0.05, 0.40, 0.43, 10, Mx)
        for i in range(6):
            a0, a1 = rad(60 * i), rad(60 * i + (25 if i % 2 else -25))
            rod(at, Mx @ Vector((0.10 * cos(a0), 0.10 * sin(a0), 0.12)), Mx @ Vector((0.075 * cos(a1), 0.075 * sin(a1), 0.28)), 0.007, 4)
        Mb = T(*Tc) @ R('Y', -150)                                               # gas dust-removal jet and the close-up camera
        disc(ad, 0.035, 0.16, 0.27, 8, Mb)
        cbox(aw, (0.08, 0.07, 0.09), (0.0, 0.07, 0.22), Mb, c=0.012)
        disc(al, 0.02, 0.0, 0.008, 8, Mb @ T(0.0, 0.07, 0.265))

    anchor('col_body', root, loc=(0, 0, 0), radius=1.95)
    return finish(root, name, [k, km, ka, slots], tints=tints)


def build_msl():
    """Curiosity (Mars Science Laboratory)."""
    return _mast_rover('msl')


def build_m2020():
    """Perseverance (Mars 2020): the same chassis as Curiosity, distinct in its wheels, mast head,
    turret, front and belly. Same parts (`mast`, `arm`) and the same `col_body`."""
    return _mast_rover('m2020', m20=True)


def fan_array(sub, cell, fit, M, r, n=10, cone=2.5, hub_r=0.07, rings=5, grid=None):
    """A circular fold-out solar fan (ten triangular gores on radial spars) lying in local XY,
    its hub at the origin. `sub` is the membrane seen from below and between the cells (a dark
    film on the real ones), `grid` the dull lines between the rings of cells."""
    half = pi / n
    for i in range(n):
        Mg = M @ R('Z', 360.0 * i / n) @ R('Y', cone)
        ri = hub_r * 1.5
        o = [(ri * cos(half), -ri * sin(half)), (r * cos(half), -r * sin(half)), (r * cos(half), r * sin(half)),
             (ri * cos(half), ri * sin(half))]
        solar_poly(sub, cell, o, Mg, t=0.006, margin=0.011, pitch=((r * cos(half) - ri) / rings, 0), strip=0.006,
                   origin=(r * cos(half) - 0.011, 0.0), grid=grid)
        rod(fit, (hub_r * 0.8, hub_r * 0.8 * math.tan(half), -0.008), (r * cos(half), r * sin(half), -0.008), 0.009, 4, r2=0.005, M=Mg)
    lathe(fit, [(0.0, -0.06), (hub_r, -0.06), (hub_r * 1.25, -0.04), (hub_r * 1.25, 0.012), (hub_r, 0.022), (0.0, 0.022)], n, M)


def _lander_bus(k, zdeck=0.98, deck_r=0.76, array_r=0.92, array_x=1.86, foot_r=1.20, wrap='gold_foil'):
    """The Phoenix / InSight platform: a round deck over a blanket-wrapped enclosure (`wrap` is the
    blanket's material), tanks, twelve descent thrusters, three legs (back, front-left,
    front-right) and the two solar fans on +/-X."""
    white, alu, gold, dark = k('painted_white', 30), k('aluminium'), k(wrap, 28), k('painted_dark')
    cell, ti, grid = k('solar_cell'), k('titanium'), k('cell_grid')
    deck = ngon(deck_r, 12, 15)
    prism(white, deck, 0.05, T(0, 0, zdeck - 0.05), z0=0.0)
    prism(alu, ngon(deck_r + 0.012, 12, 15), 0.03, T(0, 0, zdeck - 0.062), z0=0.0)
    for i in range(12):                                   # deck edge fasteners
        bolt(alu, 0.012, 0.006, T(*polar(deck_r - 0.05, 30 * i, zdeck)))
    dk = [(x * 0.985, y * 0.985) for x, y in deck]
    for p0, dv in (((0.0, -0.30), (1, 0)), ((0.0, 0.30), (1, 0)), ((-0.26, 0.0), (0, 1)), ((0.26, 0.0), (0, 1))):   # panel seams
        seg = clip_line(dk, p0, dv)
        beam(alu, (seg[0][0], seg[0][1], zdeck), (seg[1][0], seg[1][1], zdeck), 0.012, 0.004)
    for i in range(24):
        if i % 2:
            bolt(alu, 0.008, 0.004, T(*polar(0.36, 15 * i, zdeck)), 5)
    # enclosure under the deck
    ze0 = zdeck - 0.44
    prism(gold, ngon(0.54, 8, 22.5), zdeck - 0.06 - ze0, T(0, 0, ze0), z0=0.0)
    for i in range(8):
        Mf = R('Z', 45 * i) @ T(0.54 * cos(rad(22.5)) + 0.002, 0, (ze0 + zdeck - 0.06) / 2) @ R('Y', 90) @ R('Z', 90)
        foil_panel(gold, Mf, 0.38, zdeck - 0.10 - ze0, 4, 3, 0.008, seed=70 + i, bulge=0.012)
    prism(dark, ngon(0.46, 8, 22.5), 0.04, T(0, 0, ze0 - 0.04), z0=0.0)
    # propellant tanks on the +/-X sides, helium bottle at the back
    for sx in (-1, 1):
        ball(ti, (sx * 0.50, 0, ze0 + 0.16), 0.20, 12, 6)
        lathe(alu, [(0.203, -0.012), (0.207, -0.012), (0.207, 0.012), (0.203, 0.012)], 12, T(sx * 0.50, 0, ze0 + 0.16), close=True)
    ball(ti, (0.0, 0.50, ze0 + 0.13), 0.13, 10, 5)
    # descent thrusters: four clusters of three under the rim
    for a in (45, 135, 225, 315):
        Mc = R('Z', a) @ T(0.56, 0, ze0 + 0.02)
        cbox(alu, (0.10, 0.34, 0.06), (0, 0, 0.03), Mc, c=0.02)
        for dy in (-0.11, 0.0, 0.11):
            lathe(dark, [(0.022, 0.0), (0.02, -0.03), (0.045, -0.12), (0.04, -0.12), (0.014, -0.03)], 8, Mc @ T(0, dy, 0), close=True)
    # legs
    for a in (90, 210, 330):
        Ml = R('Z', a)
        top = Ml @ Vector((deck_r - 0.08, 0, zdeck - 0.07))
        foot = Ml @ Vector((foot_r, 0, 0))
        bl, br = Ml @ Vector((0.44, 0.26, ze0 + 0.02)), Ml @ Vector((0.44, -0.26, ze0 + 0.02))
        lander_leg(alu, top, foot, bl, br, r=0.03, knee=0.40, pad_bm=alu, pad_r=0.145, sleeve=dark)
    # solar fans and their yokes
    for sx in (-1, 1):
        Ma = T(sx * array_x, 0, zdeck - 0.02) @ R('Z', 90 + 90 * sx + 18)
        fan_array(dark, cell, alu, Ma, array_r, grid=grid)
        tube(alu, [(sx * (deck_r - 0.05), 0.0, zdeck - 0.09), (sx * (deck_r + 0.12), 0, zdeck - 0.10), (sx * (array_x - 0.05), 0, zdeck - 0.085)],
             0.022, 6, round_r=0.05)
        cbox(alu, (0.12, 0.16, 0.07), (sx * (deck_r + 0.02), 0, zdeck - 0.09), c=0.02)
        for sy in (-1, 1):
            rod(alu, (sx * (deck_r - 0.02), sy * 0.30, zdeck - 0.07), (sx * (array_x - array_r * 0.55), sy * 0.05, zdeck - 0.07), 0.009, 4)
    return ze0


def _ribbon(bm, pts, w=0.06, t=0.004, up=(0, 0, 1)):
    """A flat tether lying along a path."""
    sweep(bm, pts, [(w / 2, -t / 2), (w / 2, t / 2), (-w / 2, t / 2), (-w / 2, -t / 2)], up=up)


def build_phoenix():
    """Phoenix: the three-legged polar lander with two round solar fans, the stereo camera and
    weather masts, the oven and wet-lab boxes, and the robot arm digging in front."""
    weathered()
    root = part('phoenix')
    k = Kit(root)
    zd = 0.98
    _lander_bus(k, zdeck=zd, deck_r=0.76, array_r=0.92, array_x=1.86)
    white, alu, gold, dark, lens, ti = k('painted_white', 30), k('aluminium'), k('gold_foil', 28), k('painted_dark'), k('lens'), k('titanium')

    # --- stereo camera on its mast (2 m above the ground) ---
    cx, cy = -0.30, -0.36
    lathe(alu, [(0.0, zd), (0.06, zd), (0.06, zd + 0.04), (0.03, zd + 0.06), (0.026, zd + 0.86), (0.04, zd + 0.87), (0.04, zd + 0.93), (0.0, zd + 0.93)], 10, T(cx, cy, 0))
    Mh = T(cx, cy, zd + 0.99)
    cbox(alu, (0.07, 0.08, 0.10), (0, 0.02, -0.02), Mh, c=0.012)
    lathe(white, [(0.0, -0.15), (0.045, -0.15), (0.05, -0.14), (0.05, 0.14), (0.045, 0.15), (0.0, 0.15)], 12, Mh @ AX['X'])
    for sx in (-1, 1):
        cbox(white, (0.075, 0.06, 0.085), (sx * 0.10, -0.045, 0), Mh, c=0.012)
        disc(lens, 0.022, 0.0, 0.006, 8, Mh @ T(sx * 0.10, -0.076, 0) @ R('X', 90))
    # --- weather mast: tapered pole, three temperature arms, the wind telltale on top ---
    wx, wy = 0.40, 0.42
    lathe(alu, [(0.0, zd), (0.05, zd), (0.05, zd + 0.03), (0.022, zd + 0.05), (0.012, zd + 1.14), (0.0, zd + 1.14)], 8, T(wx, wy, 0))
    for h, an in ((0.30, 40), (0.62, 40), (1.08, 40)):
        p0 = Vector((wx, wy, zd + h))
        p1 = p0 + Vector(polar(0.11, an))
        rod(alu, p0, p1, 0.004, 4)
        ball(dark, p1, 0.008, 5, 3)
    rod(alu, (wx, wy, zd + 1.14), (wx, wy, zd + 1.20), 0.004, 4)
    lathe(alu, [(0.035, zd + 1.20), (0.035, zd + 1.204), (0.03, zd + 1.204), (0.03, zd + 1.20)], 8, T(wx, wy, 0), close=True)
    rod(dark, (wx + 0.004, wy, zd + 1.20), (wx + 0.02, wy + 0.01, zd + 1.13), 0.0025, 3)
    ball(dark, (wx + 0.02, wy + 0.01, zd + 1.125), 0.009, 5, 3)
    cbox(white, (0.20, 0.16, 0.14), (wx - 0.02, wy - 0.22, zd + 0.07), c=0.02)                 # lidar
    disc(dark, 0.05, zd + 0.14, zd + 0.15, 10, T(wx - 0.05, wy - 0.22, 0))
    disc(lens, 0.03, zd + 0.15, zd + 0.153, 8, T(wx - 0.05, wy - 0.22, 0))

    # --- thermal and evolved-gas analyser: eight ovens under spring doors, some open ---
    Mt = T(-0.36, 0.20, zd) @ R('Z', 20)
    cbox(white, (0.36, 0.30, 0.20), (0, 0, 0.10), Mt, c=0.02)
    prism(gold, [(-0.15, 0.20), (0.15, 0.20), (0.0, 0.27)], 0.34, Mt @ R('Z', 90) @ R('X', 90))
    for i in range(4):
        x = -0.132 + 0.088 * i
        for sy, op in ((-1, (65, 20, 70, 8)[i]), (1, (10, 75, 30, 60)[i])):
            Md = Mt @ T(x, sy * 0.15, 0.20) @ R('X', -sy * (25 + op))                               # door hinged on the eave
            box(alu, (0.075, 0.004, 0.16), (0, 0, 0), Md @ R('X', sy * 90) @ T(0, 0, -0.08))
    cbox(alu, (0.10, 0.34, 0.10), (-0.21, 0, 0.05), Mt, c=0.015)
    # --- microscopy / wet chemistry box with its four beaker drawers, the mini-disc ---
    Mm = T(0.16, -0.22, zd) @ R('Z', -10)
    cbox(gold, (0.34, 0.26, 0.18), (0, 0, 0.09), Mm, c=0.02)
    cbox(alu, (0.30, 0.22, 0.02), (0, 0, 0.19), Mm, c=0.02)
    for i in range(4):
        cbox(white, (0.055, 0.07, 0.07), (-0.11 + 0.073 * i, -0.06, 0.235), Mm, c=0.008)
        box(dark, (0.035, 0.03, 0.004), (-0.11 + 0.073 * i, -0.075, 0.272), Mm)
    cbox(dark, (0.12, 0.09, 0.05), (0.07, 0.06, 0.225), Mm, c=0.012)
    lathe(alu, [(0.0, zd), (0.06, zd), (0.06, zd + 0.006), (0.0, zd + 0.006)], 16, T(-0.08, 0.50, 0))
    lathe(dark, [(0.0, zd + 0.006), (0.02, zd + 0.006), (0.02, zd + 0.008), (0.0, zd + 0.008)], 8, T(-0.08, 0.50, 0))
    cbox(alu, (0.10, 0.10, 0.012), (0.50, 0.12, zd + 0.006), c=0.012)                          # camera calibration target
    for i in range(3):
        disc(dark, 0.012, zd + 0.012, zd + 0.016, 6, T(0.50 + 0.028 * cos(i * 2.1), 0.12 + 0.028 * sin(i * 2.1), 0))
    rod(dark, (0.50, 0.12, zd + 0.012), (0.50, 0.12, zd + 0.05), 0.004, 4)
    cbox(gold, (0.20, 0.14, 0.09), (-0.50, -0.14, zd + 0.045), c=0.015)                   # arm electronics under a blanket
    cbox(alu, (0.12, 0.08, 0.05), (0.02, 0.26, zd + 0.025), c=0.012)
    lathe(alu, [(0.0, zd), (0.035, zd), (0.035, zd + 0.09), (0.02, zd + 0.10), (0.0, zd + 0.10)], 8, T(-0.56, 0.22, 0))
    # --- UHF helix and monopole at the back ---
    ux, uy = 0.10, 0.56
    lathe(alu, [(0.0, zd), (0.07, zd), (0.07, zd + 0.02), (0.012, zd + 0.03), (0.012, zd + 0.34), (0.0, zd + 0.34)], 8, T(ux, uy, 0))
    tube(alu, [(0.05 * cos(TAU * t / 8), 0.05 * sin(TAU * t / 8), zd + 0.04 + 0.28 * t / 28) for t in range(29)], 0.005, 4, M=T(ux, uy, 0))
    rod(alu, (-0.40, 0.52, zd), (-0.40, 0.52, zd + 0.42), 0.006, 4, r2=0.004)
    disc(alu, 0.022, zd, zd + 0.03, 6, T(-0.40, 0.52, 0))
    tube(dark, [(cx + 0.04, cy + 0.04, zd + 0.01), (-0.10, -0.05, zd + 0.01), (0.10, 0.20, zd + 0.01), (wx - 0.06, wy - 0.06, zd + 0.01)], 0.01, 5, round_r=0.06)
    tube(dark, [(-0.2, 0.26, zd + 0.01), (-0.02, 0.36, zd + 0.01), (ux - 0.04, uy - 0.05, zd + 0.01)], 0.01, 5, round_r=0.06)

    # --- robot arm: shoulder on the front of the deck, elbow high, scoop on the ground ---
    sh = Vector((0.42, -0.50, zd + 0.12))
    el = Vector((0.52, -1.28, zd + 0.52))
    wr = Vector((0.58, -2.02, 0.30))
    lathe(alu, [(0.0, zd), (0.075, zd), (0.075, zd + 0.05), (0.055, zd + 0.06), (0.055, zd + 0.10), (0.0, zd + 0.10)], 12, T(sh.x, sh.y, 0))
    disc(dark, 0.05, -0.07, 0.07, 10, T(*sh) @ AX['X'])
    for a, b in ((sh, el), (el, wr)):
        d = (b - a).normalized()
        rod(alu, a + d * 0.04, b - d * 0.04, 0.026, 8)
        tube(dark, [a + d * 0.08 + Vector((0.03, 0, 0.012)), a.lerp(b, 0.5) + Vector((0.032, 0, 0.012)), b - d * 0.08 + Vector((0.03, 0, 0.012))], 0.007, 4)
        for t in (0.3, 0.7):
            lathe(dark, [(0.03, -0.012), (0.03, 0.012)], 8, frame(a.lerp(b, t), d))
    disc(dark, 0.045, -0.06, 0.06, 10, T(*el) @ AX['X'])
    disc(alu, 0.05, 0.06, 0.07, 10, T(*el) @ AX['X'])
    disc(dark, 0.04, -0.05, 0.05, 10, T(*wr) @ AX['X'])
    Ms = T(*wr) @ R('X', 20)                                                                     # scoop with its rasp housing
    prism(ti, [(0.0, 0.03), (-0.20, 0.035), (-0.27, -0.03), (-0.26, -0.075), (-0.05, -0.08), (0.02, -0.03)], 0.12, Ms @ YZX)
    cbox(dark, (0.08, 0.10, 0.06), (0, -0.05, -0.105), Ms, c=0.012)
    cbox(white, (0.06, 0.07, 0.06), (0.0, 0.06, 0.06), T(*wr), c=0.01)                           # arm camera
    disc(lens, 0.015, 0.0, 0.005, 6, T(wr.x, wr.y + 0.025, wr.z + 0.06) @ R('X', 90) @ R('X', 180))
    rod(alu, wr + Vector((-0.04, 0.02, 0.02)), wr + Vector((-0.07, -0.02, -0.22)), 0.007, 4)     # thermal probe needles
    rod(alu, wr + Vector((-0.07, 0.02, 0.02)), wr + Vector((-0.10, -0.02, -0.22)), 0.007, 4)

    anchor('col_body', root, loc=(0, 0, 0), radius=1.45)
    anchor('col_array_l', root, loc=(1.86, 0, 0), radius=1.0)
    anchor('col_array_r', root, loc=(-1.86, 0, 0), radius=1.0)
    return finish(root, 'phoenix', [k])


def build_insight():
    """InSight: the Phoenix-type platform with bigger solar fans and a bare-looking deck (arm,
    helix and two horn antennas, weather booms), and its two instruments set on the ground in
    front: the seismometer under its domed wind shield and the heat probe, each on a ribbon tether."""
    weathered()
    root = part('insight')
    k = Kit(root)
    zd = 0.98
    _lander_bus(k, zdeck=zd, deck_r=0.78, array_r=1.075, array_x=2.02, wrap='painted_dark')
    white, alu, gold, dark, lens, ti = k('painted_white', 30), k('aluminium'), k('gold_foil', 28), k('painted_dark'), k('lens'), k('titanium')
    cu = k('copper')

    # --- deck: helix antenna, two horn antennas, weather booms, pressure inlet, reflector, empty cradles ---
    ux, uy = -0.42, 0.40
    lathe(alu, [(0.0, zd), (0.075, zd), (0.075, zd + 0.02), (0.014, zd + 0.03), (0.014, zd + 0.42), (0.0, zd + 0.42)], 8, T(ux, uy, 0))
    tube(cu, [(0.055 * cos(TAU * t / 8), 0.055 * sin(TAU * t / 8), zd + 0.05 + 0.34 * t / 32) for t in range(33)], 0.005, 4, M=T(ux, uy, 0))
    for sx in (-1, 1):
        Mh = T(sx * 0.50, 0.40 if sx > 0 else -0.05, zd) @ R('Z', 90 - 90 * sx) @ R('Y', 58)       # horn leaning out over the fan
        lathe(alu, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.10), (0.085, 0.27), (0.08, 0.27), (0.024, 0.10), (0.0, 0.10)], 12, Mh @ T(0, 0, 0.06))
        cbox(alu, (0.09, 0.09, 0.07), (0, 0, 0.03), T(sx * 0.50, 0.40 if sx > 0 else -0.05, zd), c=0.015)
        # weather boom on the deck edge, facing outward
        p0 = Vector((sx * 0.60, -0.42, zd + 0.03))
        cbox(white, (0.07, 0.06, 0.06), tuple(p0), c=0.01)
        rod(alu, p0, p0 + Vector((sx * 0.20, -0.04, 0.05)), 0.012, 6, r2=0.007)
        ball(dark, p0 + Vector((sx * 0.20, -0.04, 0.05)), 0.01, 5, 3)
    lathe(alu, [(0.0, zd), (0.02, zd), (0.02, zd + 0.10), (0.05, zd + 0.11), (0.05, zd + 0.14), (0.02, zd + 0.15), (0.0, zd + 0.15)], 10, T(0.05, 0.10, 0))
    lathe(alu, [(0.0, zd), (0.06, zd), (0.06, zd + 0.01), (0.045, zd + 0.045), (0.0, zd + 0.055)], 12, T(0.34, -0.36, 0))    # retroreflector dome
    for i in range(8):
        disc(lens, 0.008, 0.0, 0.004, 5, T(0.34, -0.36, zd + 0.03) @ R('Z', 45 * i) @ R('Y', 40) @ T(0, 0, 0.022))
    # the two empty cradles where the instruments rode, and the wind-shield's three hold-downs
    lathe(alu, [(0.20, zd), (0.20, zd + 0.02), (0.17, zd + 0.02), (0.17, zd)], 16, T(-0.18, -0.02, 0), close=True)
    for i in range(3):
        lathe(alu, [(0.0, zd), (0.025, zd), (0.02, zd + 0.06), (0.0, zd + 0.06)], 6, T(-0.18, -0.02, 0) @ T(*polar(0.185, 120 * i + 30)))
    cbox(alu, (0.22, 0.16, 0.025), (0.22, 0.42, zd + 0.012), c=0.02)
    for sx in (-1, 1):
        cbox(dark, (0.02, 0.16, 0.06), (0.22 + sx * 0.10, 0.42, zd + 0.04), c=0.005)
    cbox(gold, (0.26, 0.20, 0.12), (-0.05, 0.50, zd + 0.06), c=0.02)                               # tether storage box
    cbox(alu, (0.09, 0.09, 0.012), (0.46, -0.16, zd + 0.006), c=0.012)                             # camera calibration target
    for i in range(3):
        disc(dark, 0.011, zd + 0.012, zd + 0.016, 6, T(0.46 + 0.025 * cos(i * 2.1), -0.16 + 0.025 * sin(i * 2.1), 0))
    for (x, y, rz) in ((-0.52, 0.10, 20), (0.10, -0.36, 0)):                                       # the two name chips on their brackets
        cbox(alu, (0.07, 0.05, 0.03), (0, 0, zd + 0.015), T(x, y, 0) @ R('Z', rz), c=0.008)
        box(dark, (0.045, 0.03, 0.003), (0, 0, zd + 0.031), T(x, y, 0) @ R('Z', rz))
    cbox(gold, (0.18, 0.14, 0.08), (0.44, 0.16, zd + 0.04), c=0.015)                               # magnetometer and electronics under blankets
    cbox(alu, (0.10, 0.07, 0.10), (-0.46, -0.24, zd + 0.05), c=0.012)
    cbox(white, (0.16, 0.12, 0.08), (0.30, 0.05, zd + 0.04), c=0.015)
    tube(dark, [(ux + 0.05, uy - 0.03, zd + 0.01), (-0.2, 0.28, zd + 0.01), (0.0, 0.36, zd + 0.01)], 0.01, 5, round_r=0.05)
    tube(dark, [(0.30, 0.0, zd + 0.01), (0.34, -0.2, zd + 0.01), (0.26, -0.52, zd + 0.01)], 0.01, 5, round_r=0.05)

    # --- instrument deployment arm: raised over the workspace, grapple hanging from the wrist ---
    sh = Vector((0.24, -0.56, zd + 0.13))
    el = Vector((0.20, -0.98, zd + 0.86))
    wr = Vector((0.14, -1.52, zd + 0.34))
    lathe(alu, [(0.0, zd), (0.08, zd), (0.08, zd + 0.05), (0.06, zd + 0.065), (0.06, zd + 0.11), (0.0, zd + 0.11)], 12, T(sh.x, sh.y, 0))
    disc(dark, 0.052, -0.075, 0.075, 10, T(*sh) @ AX['X'])
    for a, b in ((sh, el), (el, wr)):
        d = (b - a).normalized()
        rod(white, a + d * 0.04, b - d * 0.04, 0.027, 8)
        tube(dark, [a + d * 0.08 + Vector((0.032, 0, 0.0)), a.lerp(b, 0.5) + Vector((0.034, 0, 0.0)), b - d * 0.08 + Vector((0.032, 0, 0.0))], 0.007, 4)
        lathe(alu, [(0.031, -0.012), (0.031, 0.012)], 8, frame(a.lerp(b, 0.5), d))
    disc(dark, 0.047, -0.065, 0.065, 10, T(*el) @ AX['X'])
    disc(dark, 0.04, -0.055, 0.055, 10, T(*wr) @ AX['X'])
    cbox(white, (0.07, 0.07, 0.08), (0.075, 0.0, -0.02), T(*el.lerp(wr, 0.55)), c=0.012)            # arm camera on the forearm
    disc(lens, 0.016, 0.0, 0.005, 6, T(*el.lerp(wr, 0.55)) @ T(0.075, -0.036, -0.02) @ R('X', 90))
    Msc = T(*wr) @ R('X', -35)                                                                    # scoop
    prism(ti, [(0.0, 0.03), (-0.13, 0.03), (-0.17, -0.02), (-0.16, -0.06), (-0.03, -0.065), (0.02, -0.02)], 0.10, Msc @ YZX)
    g0 = wr + Vector((0.0, -0.03, -0.03))                                                         # grapple on its cable
    rod(dark, g0, g0 + Vector((0, 0, -0.22)), 0.004, 4)
    lathe(alu, [(0.0, -0.22), (0.022, -0.22), (0.03, -0.25), (0.022, -0.30), (0.0, -0.30)], 8, T(*g0))
    for i in range(5):
        an = 72 * i
        tube(alu, [g0 + Vector((0, 0, -0.29)), g0 + Vector(polar(0.055, an, -0.34)), g0 + Vector(polar(0.04, an, -0.41))], 0.005, 4)

    # --- the seismometer under its wind and thermal shield, on the ground in front ---
    sx0, sy0 = -0.40, -1.92
    Ms = T(sx0, sy0, 0)
    lathe(white, [(0.36, 0.10), (0.36, 0.22), (0.33, 0.31), (0.24, 0.375), (0.10, 0.40), (0.0, 0.40)], 20, Ms)
    for i in range(3):                                                                            # shield legs with pad feet
        p = Vector(polar(0.37, 120 * i + 40))
        rod(alu, (sx0 + p.x, sy0 + p.y, 0.22), (sx0 + p.x * 1.18, sy0 + p.y * 1.18, 0.02), 0.012, 5)
        disc(alu, 0.045, 0.0, 0.02, 8, T(sx0 + p.x * 1.18, sy0 + p.y * 1.18, 0))
    rng = random.Random(4)                                                                        # the skirt: scale mail over a thermal blanket
    rows = []
    for j, (rr, zz) in enumerate(((0.362, 0.125), (0.39, 0.06), (0.47, 0.012), (0.55, 0.004))):
        rows.append([Ms @ Vector(polar(rr * (1 + (0.05 * (rng.random() - 0.5) if j else 0)), 360 * i / 24, zz + (0.012 * rng.random() if j > 1 else 0)))
                     for i in range(24)])
    sk = k('steel', 50)                                                                           # chain mail: dull grey links
    vr = [[sk.verts.new(p) for p in row] for row in rows]
    for a, b in zip(vr, vr[1:]):
        for i in range(24):
            sk.faces.new((a[i], a[(i + 1) % 24], b[(i + 1) % 24], b[i]))
    lathe(alu, [(0.365, 0.10), (0.372, 0.10), (0.372, 0.135), (0.365, 0.135)], 20, Ms, close=True)
    lathe(alu, [(0.0, 0.40), (0.035, 0.40), (0.035, 0.42), (0.012, 0.43), (0.012, 0.47), (0.03, 0.48), (0.03, 0.495), (0.0, 0.50)], 8, Ms)   # grapple hook
    # --- the heat probe: a small tower on four feet with its mole tube ---
    hx0, hy0 = 0.78, -1.78
    Mp = T(hx0, hy0, 0) @ R('Z', 25)
    cbox(dark, (0.26, 0.22, 0.30), (0, 0, 0.21), Mp, c=0.03)
    cbox(gold, (0.20, 0.224, 0.16), (0, 0, 0.20), Mp, c=0.02)
    lathe(alu, [(0.0, 0.05), (0.035, 0.05), (0.035, 0.52), (0.028, 0.54), (0.0, 0.54)], 10, Mp @ T(0.0, -0.145, 0))
    cbox(alu, (0.10, 0.05, 0.06), (0, -0.12, 0.36), Mp, c=0.01)
    for fx in (-1, 1):
        for fy in (-1, 1):
            rod(ti, Mp @ Vector((fx * 0.11, fy * 0.09, 0.08)), Mp @ Vector((fx * 0.19, fy * 0.16, 0.012)), 0.01, 5)
            disc(ti, 0.035, 0.0, 0.014, 8, Mp @ T(fx * 0.19, fy * 0.16, 0))
    lathe(alu, [(0.0, 0.36), (0.02, 0.36), (0.02, 0.40), (0.0, 0.42)], 6, Mp)                     # grapple knob
    # --- ribbon tethers back to the lander ---
    tw = k('painted_white', 60)
    _ribbon(tw, [(-0.16, -0.72, zd - 0.10), (-0.17, -0.80, 0.50), (-0.19, -0.92, 0.06), (-0.22, -1.10, 0.008), (-0.28, -1.36, 0.008),
                 (-0.33, -1.50, 0.03), (sx0 + 0.02, sy0 + 0.34, 0.012), (sx0 + 0.04, sy0 + 0.20, 0.10)], 0.07)
    cbox(alu, (0.10, 0.06, 0.03), (-0.245, -1.20, 0.02), T() @ R('Z', 12), c=0.01)                # pinning mass
    _ribbon(tw, [(0.12, -0.74, zd - 0.10), (0.14, -0.82, 0.50), (0.20, -0.95, 0.06), (0.32, -1.15, 0.008), (0.55, -1.42, 0.008),
                 (hx0 - 0.10, hy0 + 0.24, 0.012), (hx0 - 0.04, hy0 + 0.11, 0.09)], 0.05)
    cbox(alu, (0.36, 0.08, 0.05), (-0.02, -0.72, zd - 0.09), c=0.012)                             # tether guides under the deck edge

    anchor('col_body', root, loc=(0, 0, 0), radius=1.45)
    anchor('col_array_l', root, loc=(2.02, 0, 0), radius=1.15)
    anchor('col_array_r', root, loc=(-2.02, 0, 0), radius=1.15)
    anchor('col_seis', root, loc=(sx0, sy0, 0), radius=0.6)
    anchor('col_hp3', root, loc=(hx0, hy0, 0), radius=0.35)
    return finish(root, 'insight', [k])


def _shell_petal(bm, ribs, M, Rs, th, az_half, nu=6, nv=6, phi0=3.0, phi1=85.0):
    """A segment of a spherical shell that hinges at its lower edge. Local origin at the hinge (a
    point on the sphere's equator), local X radially outward, local Z up; closed, the petal covers
    the sphere from the equator to near the pole. Faces: material 0 outside, 1 inside and edges."""
    def pt(r, az, phi):
        return (r * cos(phi) * cos(az) - Rs, r * cos(phi) * sin(az), r * sin(phi))

    out, inn = [], []
    for j in range(nv + 1):
        phi = rad(phi0 + (phi1 - phi0) * j / nv)
        azs = [rad(-az_half + 2 * az_half * i / nu) for i in range(nu + 1)]
        out.append(_mk(bm, [pt(Rs, a, phi) for a in azs], M))
        inn.append(_mk(bm, [pt(Rs - th, a, phi) for a in azs], M))
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((out[j][i], out[j][i + 1], out[j + 1][i + 1], out[j + 1][i])).material_index = 0
            bm.faces.new((inn[j][i], inn[j + 1][i], inn[j + 1][i + 1], inn[j][i + 1])).material_index = 1
    for i in range(nu):
        bm.faces.new((out[0][i], inn[0][i], inn[0][i + 1], out[0][i + 1])).material_index = 1
        bm.faces.new((out[nv][i], out[nv][i + 1], inn[nv][i + 1], inn[nv][i])).material_index = 1
    for j in range(nv):
        bm.faces.new((out[j][0], out[j + 1][0], inn[j + 1][0], inn[j][0])).material_index = 1
        bm.faces.new((out[j][nu], inn[j][nu], inn[j + 1][nu], out[j + 1][nu])).material_index = 1
    if ribs is not None:                                   # stiffening ribs on the inner face
        rr = Rs - th - 0.008
        sec = [(0.011, -0.007), (0.011, 0.007), (-0.011, 0.007), (-0.011, -0.007)]
        for az in (-az_half * 0.5, 0.0, az_half * 0.5):
            a = rad(az)
            pts = [pt(rr, a, rad(phi0 + 2 + (phi1 - phi0 - (30 if az else 4)) * j / 6)) for j in range(7)]
            sweep(ribs, pts, sec, up=(-sin(a), cos(a), 0), M=M)
        for phi in (22.0, 48.0):
            pts = [pt(rr, rad(-az_half * 0.94 + az_half * 1.88 * i / 6), rad(phi)) for i in range(7)]
            sweep(ribs, pts, sec, up=(0, 0, 1), M=M)


def build_mars3():
    """Mars 3 (also Mars 6): the Soviet egg-shaped lander with its four petals folded down onto
    the ground, whip antennas, two panoramic cameras and the little tethered Prop-M rover."""
    weathered()
    root = part('mars3')
    k = Kit(root)
    Rs, zc = 0.60, 0.385
    shell = k(('painted_white', 'steel'), 40)            # a white egg; the petals are bare metal inside
    white, alu, steel, dark = k('painted_white', 35), k('aluminium'), k('steel'), k('painted_dark')
    lens, foam, cu = k('lens'), k('painted_white', 40), k('copper')

    # --- the lower half of the egg, standing on its landing ring ---
    lathe(foam, [(0.0, 0.0), (0.35, 0.0), (0.45, 0.04), (0.535, 0.13), (0.585, 0.25), (0.60, zc - 0.02), (0.0, zc - 0.02)], 28, I4)
    lathe(alu, [(0.35, -0.002), (0.41, 0.0), (0.43, 0.025), (0.42, 0.045), (0.39, 0.03)], 28, I4, close=True)
    for i in range(8):                                                # gores of the insulation cover
        Mi = R('Z', 45 * i + 22.5)
        sweep(alu, [Mi @ Vector((r + 0.004, 0, z)) for r, z in ((0.45, 0.04), (0.535, 0.13), (0.585, 0.25), (0.602, zc - 0.03))],
              [(0.008, -0.003), (0.008, 0.003), (-0.008, 0.003), (-0.008, -0.003)], up=tuple(Mi @ Vector((0, 1, 0))))
    # --- equator ring with the four petal hinges ---
    lathe(alu, [(0.585, zc - 0.035), (0.625, zc - 0.035), (0.632, zc - 0.02), (0.632, zc + 0.012), (0.61, zc + 0.02), (0.585, zc + 0.02)],
          28, I4, close=True)
    bolt_circle(dark, 0.633, 24, 0.012, 0.008, T(0, 0, zc - 0.012), phase=0.13, seg=5)
    # --- the instrument compartment under the petals ---
    lathe(white, [(0.575, zc + 0.02), (0.54, zc + 0.10), (0.44, zc + 0.215), (0.27, zc + 0.30), (0.12, zc + 0.33), (0.0, zc + 0.335)], 24, I4)
    lathe(alu, [(0.44, zc + 0.21), (0.455, zc + 0.215), (0.455, zc + 0.235), (0.42, zc + 0.24)], 24, I4, close=True)
    for i in range(12):                                               # meridian seams and rivets on the dome
        Mi = R('Z', 30 * i + 15)
        sweep(alu, [Mi @ Vector((r + 0.003, 0, z)) for r, z in ((0.572, zc + 0.03), (0.542, zc + 0.10), (0.462, zc + 0.20))],
              [(0.006, -0.003), (0.006, 0.003), (-0.006, 0.003), (-0.006, -0.003)], up=tuple(Mi @ Vector((0, 1, 0))))
        bolt(dark, 0.008, 0.006, R('Z', 30 * i) @ T(0.556, 0, zc + 0.065) @ R('Y', 70), 5)
    lathe(alu, [(0.0, zc + 0.33), (0.12, zc + 0.33), (0.12, zc + 0.37), (0.10, zc + 0.39), (0.0, zc + 0.39)], 14, I4)       # parachute-ring hub
    bolt_circle(dark, 0.095, 8, 0.01, 0.008, T(0, 0, zc + 0.39))

    # --- four petals, opened right over until their tips rest on the ground ---
    opens = {0: 158.0, 90: 161.0, 180: 157.0, 270: 160.0}
    for th, op in opens.items():
        Mp = R('Z', th) @ T(Rs + 0.012, 0, zc) @ R('Y', op)
        _shell_petal(shell, alu, Mp, Rs, 0.028, 43.0, nu=6, nv=6)
        for sy in (-1, 1):                                            # hinge knuckles and spring struts
            Mh = R('Z', th) @ T(Rs + 0.02, sy * 0.24, zc - 0.005)
            disc(dark, 0.022, -0.05, 0.05, 6, Mh @ AX['Y'])
            rod(steel, R('Z', th) @ Vector((0.54, sy * 0.24, zc + 0.10)), Mp @ Vector((-0.10, sy * 0.24, 0.20)), 0.008, 5)

    # --- two panoramic cameras (scanning telephotometers) ---
    for a in (45, 225):
        Mc = R('Z', a) @ T(0.33, 0, zc + 0.265)
        lathe(alu, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.02), (0.035, 0.04), (0.035, 0.10), (0.0, 0.10)], 10, Mc)
        lathe(white, [(0.0, 0.10), (0.048, 0.10), (0.048, 0.30), (0.04, 0.32), (0.0, 0.325)], 12, Mc)
        cbox(alu, (0.024, 0.04, 0.12), (0.045, 0, 0.225), Mc, c=0.004)
        box(lens, (0.008, 0.02, 0.10), (0.056, 0, 0.225), Mc)
        disc(dark, 0.03, 0.325, 0.34, 8, Mc)
    # --- four whip antennas springing up between the petals ---
    for i, a in enumerate((45, 135, 225, 315)):
        Ma = R('Z', a + 20)
        pts = [Ma @ Vector(p) for p in ((0.47, 0, zc + 0.17), (0.56, 0, zc + 0.36), (0.72, 0, zc + 0.56), (0.92, 0, zc + 0.70 + 0.03 * (i % 2)),
                                        (1.12, 0, zc + 0.74))]
        sweep(steel, pts, circ(1.0, 4), scales=[0.008, 0.007, 0.006, 0.005, 0.004])
        lathe(alu, [(0.0, 0.0), (0.028, 0.0), (0.02, 0.05), (0.0, 0.05)], 6, frame(pts[0] - Vector((0, 0, 0.02)), pts[1] - pts[0]))
    # --- weather mast with wind cups, mass-spectrometer inlet, small boxes on the dome ---
    Mw = R('Z', 135) @ T(0.26, 0, zc + 0.30)
    rod(alu, Mw @ Vector((0, 0, 0)), Mw @ Vector((0, 0, 0.52)), 0.009, 6, r2=0.006)
    for i in range(3):
        p = Mw @ Vector(polar(0.06, 120 * i, 0.52))
        rod(alu, Mw @ Vector((0, 0, 0.52)), p, 0.003, 3)
        lathe(dark, [(0.0, -0.012), (0.016, 0.0), (0.0, 0.012)], 6, T(*p) @ R('Z', 120 * i + 135) @ AX['Y'])
    cbox(white, (0.05, 0.05, 0.07), tuple(Mw @ Vector((0, 0, 0.30))), c=0.008)
    for a, r, sz in ((95, 0.40, (0.11, 0.09, 0.07)), (275, 0.42, (0.12, 0.10, 0.06)), (180, 0.20, (0.10, 0.08, 0.06)), (0, 0.22, (0.09, 0.09, 0.05))):
        zz = zc + (0.235 if r > 0.3 else 0.315)
        cbox(alu, sz, (r, 0, zz + sz[2] / 2 - 0.01), R('Z', a), c=0.012)
    lathe(cu, [(0.0, zc + 0.22), (0.03, zc + 0.22), (0.03, zc + 0.36), (0.045, zc + 0.38), (0.0, zc + 0.385)], 8, T(*polar(0.36, 315)))
    tube(dark, [polar(0.40, 95, zc + 0.26), polar(0.33, 70, zc + 0.275), polar(0.33, 50, zc + 0.275)], 0.008, 4)

    # --- Prop-M: the 4.5 kg walking rover on its skis, set down by a two-link arm, on a tether ---
    pa = 315
    Mr = R('Z', pa) @ T(1.30, 0, 0) @ R('Z', 20)
    cbox(alu, (0.215, 0.16, 0.05), (0, 0, 0.065), Mr, c=0.02)
    cbox(dark, (0.14, 0.10, 0.012), (0, 0, 0.096), Mr, c=0.015)
    for sy in (-1, 1):
        prism(steel, [(-0.11, 0.0), (0.09, 0.0), (0.125, 0.025), (0.115, 0.03), (0.085, 0.012), (-0.11, 0.012)], 0.04,
              Mr @ T(0, sy * 0.105, 0) @ R('X', 90))
        for xx in (-0.06, 0.05):
            rod(alu, Mr @ Vector((xx, sy * 0.105, 0.012)), Mr @ Vector((xx, sy * 0.082, 0.06)), 0.006, 4)
    for sy in (-1, 1):
        rod(steel, Mr @ Vector((0.105, sy * 0.05, 0.07)), Mr @ Vector((0.16, sy * 0.06, 0.03)), 0.004, 3)       # feeler bars
    s0 = R('Z', pa) @ Vector((0.52, 0, zc + 0.12))
    s1 = R('Z', pa) @ Vector((0.86, 0, zc + 0.30))
    s2 = R('Z', pa) @ Vector((1.22, 0, 0.16))
    rod(alu, s0, s1, 0.012, 6)
    rod(alu, s1, s2, 0.010, 6)
    for p in (s0, s1, s2):
        ball(dark, p, 0.02, 6, 3)
    tube(dark, [s0 + Vector((0, 0, -0.06)), R('Z', pa - 8) @ Vector((0.75, 0, 0.10)), R('Z', pa - 6) @ Vector((1.0, 0, 0.012)),
                Mr @ Vector((-0.11, 0, 0.05))], 0.004, 3, round_r=0.1)

    anchor('col_body', root, loc=(0, 0, 0), radius=1.45)
    return finish(root, 'mars3', [k])


B2_PR, B2_PD, B2_PT = 0.285, 0.352, 0.016            # a solar disc: its radius, hinge line to centre, thickness


def _beagle_petal(k, w, M, tints, bosses=False):
    """One of Beagle 2's four solar discs in its own frame: the hinge line is local Y through the
    origin, the disc lies along +X with its centre at (B2_PD, 0), its cells face +Z and its upper
    face is z = 0. A black composite sandwich with an amber film face under the cells; five strings
    of cells stepped to fit the round outline (tinted down: the game lays an even film of dust on
    cells, which leaves them paler than the film round them); ribs, a harness and (bosses=True, for
    a disc still stowed with its back to the sky) the cups of its hold-down bolts on the black
    back; two arms to the hinge."""
    dark, gold, alu, cell, grid = k('painted_dark'), k('gold_foil', 30), k('aluminium'), k('solar_cell'), w('cell_grid')
    t = B2_PT
    o = soft_ngon(B2_PR, 5, 0.8, 4, (B2_PD, 0.0))
    prism(dark, o, t, M, z0=-t)
    face = inset_poly(o, 0.008)
    prism(gold, face, 0.0035, M, z0=-0.001)
    # cells: strings laid across the disc, each as many whole cells as fit
    inner = inset_poly(o, 0.026)
    bw, gap, cl, nb = 0.082, 0.009, 0.0405, 5
    zc = 0.0062
    for b in range(nb):
        ya = -(nb * bw + (nb - 1) * gap) / 2 + b * (bw + gap)
        yb = ya + bw
        ea, eb = clip_line(inner, (0.0, ya), (1.0, 0.0)), clip_line(inner, (0.0, yb), (1.0, 0.0))
        if ea is None or eb is None:
            continue
        xa, xb = max(ea[0][0], eb[0][0]), min(ea[1][0], eb[1][0])
        n = int((xb - xa) / cl)
        if n < 2:
            continue
        xa += ((xb - xa) - n * cl) / 2
        xb = xa + n * cl
        with tints.on(cell, (0.5, 0.5, 0.56)):
            box(cell, (xb - xa, bw, 0.005), ((xa + xb) / 2, (ya + yb) / 2, zc - 0.0025), M)
        zl = zc + 0.0013
        for i in range(1, n):                                         # the gaps between cells, and between the two rows of a string
            x = xa + i * cl
            grid.faces.new(_mk(grid, [(x - 0.0016, ya + 0.003, zl), (x + 0.0016, ya + 0.003, zl), (x + 0.0016, yb - 0.003, zl), (x - 0.0016, yb - 0.003, zl)], M))
        ym = (ya + yb) / 2
        grid.faces.new(_mk(grid, [(xa + 0.003, ym - 0.0016, zl), (xb - 0.003, ym - 0.0016, zl), (xb - 0.003, ym + 0.0016, zl), (xa + 0.003, ym + 0.0016, zl)], M))
        box(alu, (0.006, bw - 0.012, 0.003), (xa - 0.007, ym, 0.0035), M)          # the string's end tab
    # the harness: a collector along the string ends on the hinge side, a terminal block, the lead to the hinge
    box(alu, (0.008, 0.30, 0.004), (0.118, 0.0, 0.004), M)
    cbox(dark, (0.03, 0.05, 0.012), (0.112, -0.105, 0.007), M, c=0.005)
    tube(dark, [(0.112, -0.105, 0.010), (0.07, -0.10, 0.012), (0.03, -0.03, 0.014), (0.0, -0.022, 0.014)], 0.0045, 4, M=M)
    # hinge: two arms from the edge of the disc to the hinge line, the pin, the spring cartridge
    for sy in (-1, 1):
        beam(alu, (-0.004, sy * 0.058, -0.007), (0.135, sy * 0.076, -0.007), 0.017, 0.012, M=M)
        cbox(alu, (0.055, 0.034, 0.008), (0.135, sy * 0.076, -t - 0.004), M, c=0.008)
        disc(alu, 0.013, -0.011, 0.011, 8, M @ T(0, sy * 0.058, -0.004) @ AX['Y'])
    disc(alu, 0.0085, -0.072, 0.072, 6, M @ T(0, 0, -0.004) @ AX['Y'])
    disc(dark, 0.0165, -0.034, 0.034, 8, M @ T(0, 0, -0.004) @ AX['Y'])
    # the back: ribs fanning from the hinge arms, a cross rib, the cups of the bolts that held the stack down
    zb = -t
    for sy in (-1, 1):
        beam(alu, (0.105, sy * 0.076, zb - 0.005), (B2_PD + 0.215, sy * 0.115, zb - 0.005), 0.013, 0.010, M=M)
    beam(alu, (B2_PD - 0.035, -0.225, zb - 0.004), (B2_PD - 0.035, 0.225, zb - 0.004), 0.011, 0.008, M=M)
    beam(alu, (B2_PD + 0.11, -0.18, zb - 0.004), (B2_PD + 0.11, 0.18, zb - 0.004), 0.011, 0.008, M=M)
    if bosses:
        for a in (0, 120, 240):
            Mc = M @ T(B2_PD + 0.215 * cos(rad(a)), 0.215 * sin(rad(a)), 0) @ R('X', 180)
            lathe(alu, [(0.0, -zb), (0.026, -zb), (0.026, -zb + 0.006), (0.018, -zb + 0.014), (0.0, -zb + 0.014)], 8, Mc)
            disc(dark, 0.009, -zb + 0.014, -zb + 0.019, 6, Mc)
        lathe(alu, [(0.0, -zb), (0.036, -zb), (0.036, -zb + 0.005), (0.0, -zb + 0.005)], 10, M @ T(B2_PD, 0, 0) @ R('X', 180))
        for yy in (-0.137, -0.046, 0.046, 0.137):                       # amber tape over the wiring between the strings
            half = sqrt(max(0.0, (B2_PR - 0.03) ** 2 - yy * yy)) * 0.92
            box(gold, (2 * half, 0.02, 0.002), (B2_PD, yy, zb - 0.0006), M)


def build_beagle2():
    """Beagle 2 as it was found: the pocket-watch lander lying open, base and lid side by side on
    their hinge, with only two of the four solar discs unfolded from the lid. One of those stands
    out level on its hinge tower, the other has sagged until its edge rests on the soil; the third
    sprang a hand's breadth and jammed, and the fourth never moved, so the two still cover the lid
    (and the radio antenna under them, which is why it was never heard from). The base is full to
    the brim: the instrument arm folded across it with its cluster of instruments (the two camera
    drums, the mole in its tube, spectrometers, a grinder), the gas analyser's housing, a battery,
    a pop-up mirror on a post, a colour target. Both shells are wrapped in gold blanket with ribs
    under an aluminium rim; half of the clamp band that held them shut lies where it fell.
    Colour chips and cable sleeves are white, tinted per vertex after the bake (Tints)."""
    weathered()
    root = part('beagle2')
    k, w, tints = Kit(root), Wound(root), Tints()
    foil, gold, white, alu, dark = k('gold_foil', 14), k('gold_foil', 30), k('painted_white', 40), k('aluminium'), k('painted_dark')
    lens, cu = k('lens'), k('copper')
    B, L = Vector((-0.42, 0, 0)), Vector((0.28, 0, 0))
    R0, HB, HL = 0.33, 0.150, 0.105
    Mb, Ml = T(*B), T(*L)

    def shell(M, h, zf, seed, latches):
        """One half of the clam: the blanketed outside, ribs, the rim with its bolts and latch fittings,
        and a blanket-lined floor at zf with a lip up to the rim."""
        crinkle(lathe(foil, [(0.0, 0.0), (0.14, 0.004), (0.235, 0.026), (0.295, 0.066), (R0 - 0.004, h - 0.05), (R0, h - 0.016), (R0 - 0.012, zf - 0.02),
                             (0.0, zf - 0.02)], 24, M), 0.004, seed)             # (closed under the floor, out of sight)
        crinkle(lathe(foil, [(0.0, zf - 0.03), (R0 - 0.021, zf - 0.03), (R0 - 0.021, h - 0.002), (R0 - 0.027, h - 0.002), (R0 - 0.031, zf + 0.006),
                             (R0 - 0.07, zf), (0.17, zf), (0.08, zf), (0.0, zf)], 18, M @ R('Z', 7)), 0.0025, seed + 5)
        lathe(alu, [(R0 - 0.026, h - 0.006), (R0 + 0.008, h - 0.024), (R0 + 0.012, h - 0.017), (R0 + 0.012, h + 0.001), (R0 + 0.006, h + 0.007),
                    (R0 - 0.026, h + 0.007)], 24, M, close=True)
        for i in range(8):                                             # ribs under the blanket's bands, from the rim down the flank
            Mi = M @ R('Z', 45 * i + 22.5)
            sweep(alu, [Mi @ Vector((r, 0, z)) for r, z in ((0.19, 0.008), (0.242, 0.022), (0.303, 0.062), (R0 + 0.004, h - 0.05), (R0 + 0.009, h - 0.02))],
                  [(0.007, -0.006), (0.007, 0.006), (-0.007, 0.006), (-0.007, -0.006)], up=tuple(Mi.to_3x3() @ Vector((0, 1, 0))))
        for i in range(12):
            bolt(dark, 0.0075, 0.005, M @ T(*polar(R0 - 0.009, 30 * i + 15, h + 0.007)), 5)
        for a in latches:                                              # where the clamp band's shoes bore on the rim
            Ma = M @ R('Z', a) @ T(R0 + 0.012, 0, h - 0.008)
            cbox(alu, (0.022, 0.06, 0.03), (0.008, 0, 0), Ma, c=0.006)
            disc(dark, 0.009, 0.0, 0.006, 6, Ma @ T(0.019, 0, 0) @ AX['X'])

    ZD, ZF = 0.120, 0.060                                              # the base's deck, the lid's floor
    shell(Mb, HB, ZD, 3, (180, 101, -101))
    shell(Ml, HL, ZF, 4, (0, 79, -79))

    # --- the main hinge: its axis lies midway between the two rims in height, so that the lid closed rim to rim ---
    hx, hz = (B.x + L.x) / 2, (HB + HL) / 2
    disc(dark, 0.024, -0.062, 0.062, 10, T(hx, 0, hz) @ AX['Y'])        # the drive
    disc(alu, 0.011, -0.118, 0.118, 6, T(hx, 0, hz) @ AX['Y'])
    for sy in (-1, 1):
        disc(alu, 0.027, -0.008, 0.008, 10, T(hx, sy * 0.068, hz) @ AX['Y'])
        prism(alu, [(-0.052, HB - 0.03), (-0.03, HB + 0.008), (0.006, hz + 0.02), (0.018, hz + 0.004), (0.012, hz - 0.016), (-0.02, HB - 0.045)], 0.012,
              T(hx, sy * 0.086, 0) @ R('X', 90))                         # the base's arm
        prism(alu, [(0.052, HL - 0.035), (0.03, HL + 0.008), (0.004, hz + 0.018), (-0.016, hz + 0.006), (-0.012, hz - 0.014), (0.02, HL - 0.05)], 0.012,
              T(hx, sy * 0.104, 0) @ R('X', 90))                         # the lid's
        disc(dark, 0.015, -0.006, 0.006, 6, T(hx, sy * 0.116, hz) @ AX['Y'])
    sweep(gold, fillet([(B.x + 0.215, 0.0, ZD + 0.003), (B.x + 0.275, 0.0, ZD + 0.012), (B.x + 0.30, 0.0, HB + 0.022), (hx, 0.0, hz + 0.045), (L.x - 0.30, 0.0, HL + 0.02),
                        (L.x - 0.285, 0.0, ZF + 0.012)], 0.03, 2), [(0.021, -0.002), (0.021, 0.002), (-0.021, 0.002), (-0.021, -0.002)], up=(0, 0, 1))   # the flat harness between the halves

    # --- the base: deck plates, the gas analyser, battery, sensors ---
    for a in (62, 172, 236, 331):                                                                                   # tape over the seams of the deck blanket
        box(dark, (0.21, 0.012, 0.003), (0.19, 0, ZD + 0.0035), Mb @ R('Z', a))
    cbox(white, (0.17, 0.115, 0.014), (-0.115, 0.155, ZD + 0.007), Mb, c=0.02)                                     # electronics cover
    for bx, by in ((-0.185, 0.115), (-0.045, 0.115), (-0.185, 0.195), (-0.045, 0.195)):
        bolt(dark, 0.006, 0.004, Mb @ T(bx, by, ZD + 0.014), 5)
    Mg = Mb @ T(0.105, 0.135, 0)                                                                                    # gas analysis package
    lathe(alu, [(0.0, ZD), (0.088, ZD), (0.088, ZD + 0.026), (0.078, ZD + 0.04), (0.0, ZD + 0.04)], 14, Mg)
    lathe(white, [(0.0, ZD + 0.04), (0.05, ZD + 0.04), (0.05, ZD + 0.058), (0.04, ZD + 0.066), (0.0, ZD + 0.066)], 12, Mg)
    lathe(dark, [(0.0, ZD + 0.066), (0.022, ZD + 0.066), (0.022, ZD + 0.09), (0.014, ZD + 0.096), (0.0, ZD + 0.096)], 8, Mg)       # its inlet
    bolt_circle(dark, 0.07, 8, 0.0065, 0.004, Mg @ T(0, 0, ZD + 0.036), seg=5)
    for a in (200, 250, 300):
        tube(cu, [Mg @ Vector(polar(0.045, a, ZD + 0.058)), Mg @ Vector(polar(0.075, a, ZD + 0.062)), Mg @ Vector(polar(0.105, a + 8, ZD + 0.03)),
                  Mg @ Vector(polar(0.11, a + 10, ZD + 0.002))], 0.0045, 4, round_r=0.015, steps=2)
    Mq = Mb @ T(0.175, -0.035, 0) @ R('Z', 80)                                                                      # battery: a finned black box
    cbox(dark, (0.12, 0.075, 0.042), (0, 0, ZD + 0.021), Mq, c=0.01)
    for i in range(5):
        box(alu, (0.004, 0.079, 0.046), (-0.044 + 0.022 * i, 0, ZD + 0.022), Mq)
    tube(dark, [Mq @ Vector((0.0, 0.04, ZD + 0.03)), Mq @ Vector((0.0, 0.075, ZD + 0.02)), Mb @ Vector((0.215, 0.0, ZD + 0.008))], 0.006, 4, round_r=0.02, steps=2)
    # the pop-up mirror on its post, the weather sensors, the colour target
    pm = Mb @ Vector(polar(0.262, 128, 0))
    rod(alu, (pm.x, pm.y, ZD), (pm.x, pm.y, 0.225), 0.007, 6, r2=0.005)
    Mm = T(pm.x, pm.y, 0.232) @ R('Z', 128 + 180) @ R('Y', 38)
    lathe(alu, [(0.0, 0.014), (0.016, 0.012), (0.03, 0.006), (0.037, 0.0), (0.037, -0.006), (0.0, -0.006)], 12, Mm)
    lathe(dark, [(0.037, -0.007), (0.041, -0.007), (0.041, 0.002), (0.037, 0.002)], 12, Mm, close=True)
    ps = Mb @ Vector(polar(0.255, 36, 0))
    cbox(white, (0.05, 0.04, 0.03), (ps.x, ps.y, ZD + 0.015), c=0.008)
    lathe(lens, dome_profile(0.012, 0.01, 2, ZD + 0.03), 6, T(ps.x - 0.008, ps.y, 0))
    rod(alu, (ps.x + 0.012, ps.y, ZD + 0.03), (ps.x + 0.012, ps.y, ZD + 0.105), 0.004, 4)
    cbox(dark, (0.016, 0.016, 0.012), (ps.x + 0.012, ps.y, ZD + 0.108), c=0.004)
    Mt = Mb @ T(*polar(0.243, 262, ZD + 0.012)) @ R('Z', 262 - 90) @ R('X', -14)                                    # colour target at the front, tipped up to the cameras
    cbox(alu, (0.085, 0.062, 0.008), (0, 0, 0.012), Mt, c=0.008)
    chips = ((0.80, 0.10, 0.06), (0.95, 0.60, 0.05), (0.10, 0.45, 0.12), (0.08, 0.18, 0.70), (0.10, 0.10, 0.10), (1.0, 1.0, 1.0))
    wchip = w('painted_white')
    for i, c in enumerate(chips):
        cx, cy = -0.026 + 0.026 * (i % 3), -0.013 + 0.026 * (i // 3)
        with tints.on(wchip, c):
            wchip.faces.new(_mk(wchip, [(cx - 0.0095, cy - 0.0095, 0.0172), (cx + 0.0095, cy - 0.0095, 0.0172), (cx + 0.0095, cy + 0.0095, 0.0172),
                                        (cx - 0.0095, cy + 0.0095, 0.0172)], Mt))

    # --- the arm, folded across the base, and the instrument cluster on its wrist ---
    S0 = Vector((B.x - 0.205, -0.115, 0.0))
    lathe(alu, [(0.0, ZD), (0.044, ZD), (0.044, ZD + 0.016), (0.031, ZD + 0.028), (0.031, ZD + 0.066), (0.0, ZD + 0.066)], 10, T(S0.x, S0.y, 0))
    bolt_circle(dark, 0.036, 6, 0.005, 0.004, T(S0.x, S0.y, ZD + 0.016), seg=5)
    sh = Vector((S0.x, S0.y, 0.202))
    el = Vector((B.x + 0.165, -0.168, 0.200))
    el2 = el + Vector((0, 0, 0.04))
    wr = Vector((B.x + 0.005, -0.03, 0.243))
    ua = (el - sh).normalized()
    disc(dark, 0.031, -0.036, 0.036, 10, T(*sh) @ frame((0, 0, 0), Vector((-ua.y, ua.x, 0)), (0, 0, 1)))
    for a, b, r, c in ((sh, el, 0.016, white), (el2, wr, 0.014, white)):
        d = (b - a).normalized()
        rod(c, a + d * 0.02, b - d * 0.02, r, 8)
        for f in (0.2, 0.8):                                            # collars at the ends of each tube
            p = a.lerp(b, f)
            rod(alu, p - d * 0.012, p + d * 0.012, r + 0.004, 8)
    disc(dark, 0.027, 0.172, 0.268, 10, T(el.x, el.y, 0))               # the elbow: one link above the other
    disc(alu, 0.03, 0.214, 0.226, 10, T(el.x, el.y, 0))
    fa = (wr - el2).normalized()
    disc(dark, 0.023, -0.03, 0.03, 8, T(*wr) @ frame((0, 0, 0), Vector((-fa.y, fa.x, 0)), (0, 0, 1)))
    with tints.on(white, (0.85, 0.30, 0.12)):                           # the arm's harness, in an orange sleeve
        tube(white, [sh + Vector((0.01, 0.03, 0.03)), sh.lerp(el, 0.3) + Vector((0, 0.024, 0.012)), sh.lerp(el, 0.75) + Vector((0, 0.024, 0.012)),
                     el + Vector((-0.02, 0.035, 0.03)), el2.lerp(wr, 0.3) + Vector((0.016, 0.016, 0.01)), el2.lerp(wr, 0.85) + Vector((0.016, 0.016, 0.008))],
             0.0055, 4, round_r=0.02, steps=2)
    # the cluster ("PAW"): a hub, the two camera drums side by side, three instruments between them, the grinder
    # behind, and the mole across its back in its launch tube
    Ph = Vector((B.x - 0.07, 0.05, 0.218))
    Mpw = T(*Ph) @ R('Z', 163)
    rod(alu, wr, Ph + Vector((0.01, -0.01, 0.0)), 0.016, 6)
    prism(alu, ngon(0.05, 6), 0.07, Mpw, z0=-0.038)
    disc(dark, 0.04, 0.032, 0.039, 10, Mpw)
    for sy in (-1, 1):
        Mc = Mpw @ T(0.04, sy * 0.09, 0.004) @ AX['X']
        lathe(white, [(0.0, -0.018), (0.033, -0.018), (0.038, -0.013), (0.038, 0.013), (0.033, 0.018), (0.0, 0.018)], 12, Mc)        # filter wheel
        lathe(dark, [(0.0, 0.018), (0.019, 0.018), (0.019, 0.036), (0.016, 0.040), (0.0, 0.040)], 8, Mc @ T(0, 0.008, 0))             # lens hood
        disc(lens, 0.0125, 0.040, 0.042, 8, Mc @ T(0, 0.008, 0))
        cbox(alu, (0.034, 0.05, 0.044), (-0.002, sy * 0.068, 0.0), Mpw, c=0.008)                                                       # its electronics and bracket
        bolt_circle(dark, 0.029, 5, 0.004, 0.003, Mc @ T(0, 0, 0.018), seg=4)
    for yy, r, ln, body, tip in ((0.0, 0.017, 0.105, white, lens), (0.04, 0.024, 0.085, alu, cu), (-0.04, 0.021, 0.075, dark, alu)):   # microscope, two spectrometers
        Mi = Mpw @ T(0.045, yy, -0.014) @ AX['X']
        disc(body, r, 0.0, ln, 8, Mi)
        disc(tip, r * 0.72, ln, ln + 0.006, 8, Mi)
    Mgr = Mpw @ R('Z', 180) @ T(0.045, 0.0, -0.012) @ AX['X']                                                                          # grinder and corer
    lathe(dark, [(0.0, 0.0), (0.024, 0.0), (0.024, 0.07), (0.016, 0.078), (0.016, 0.092), (0.0, 0.092)], 8, Mgr)
    lathe(alu, [(0.0, 0.092), (0.011, 0.092), (0.007, 0.112), (0.0, 0.112)], 6, Mgr)
    Mmo = Mpw @ T(-0.012, 0.0, 0.054) @ AX['Y']                                                                                        # the mole
    disc(cu, 0.0135, -0.165, 0.13, 8, Mmo)
    lathe(alu, [(0.018, -0.172), (0.018, -0.035), (0.0135, -0.035), (0.0135, -0.172)], 8, Mmo, close=True)
    lathe(dark, [(0.0, 0.13), (0.0135, 0.13), (0.004, 0.165), (0.0, 0.165)], 8, Mmo)
    lathe(dark, [(0.0, -0.20), (0.024, -0.20), (0.024, -0.172), (0.0, -0.172)], 8, Mmo)                                                # its tether reel
    for yy in (-0.11, 0.07):
        cbox(alu, (0.012, 0.012, 0.03), (-0.012, yy, 0.044), Mpw, c=0.003)
    rod(alu, Mpw @ Vector((-0.02, 0.02, 0.039)), Mpw @ Vector((-0.03, 0.03, 0.082)), 0.0035, 4)                                        # wind sensor
    cbox(dark, (0.02, 0.02, 0.008), tuple(Mpw @ Vector((-0.03, 0.03, 0.086))), c=0.005)

    # --- the lid: four hinge towers of rising height round its rim, and the discs ---
    HZ0, HSTEP = 0.124, 0.026

    def tower(beta, level):
        M0 = Ml @ R('Z', beta) @ T(R0 + 0.022, 0, 0)
        zh = HZ0 + HSTEP * level
        for sy in (-1, 1):
            prism(alu, [(-0.05, HL - 0.03), (-0.012, HL - 0.045), (0.011, zh - 0.018), (0.014, zh + 0.002), (0.007, zh + 0.012), (-0.007, zh + 0.012),
                        (-0.014, zh + 0.002), (-0.05, HL + 0.007)], 0.008, M0 @ T(0, sy * 0.08, 0) @ R('X', 90))
            disc(dark, 0.008, -0.004, 0.004, 6, M0 @ T(0, sy * 0.086, zh - 0.004) @ AX['Y'])
        cbox(alu, (0.03, 0.19, 0.012), (-0.036, 0, HL + 0.006), M0, c=0.006)
        if level >= 2:
            rod(alu, M0 @ Vector((0.0, -0.08, (HL + zh) / 2 - 0.01)), M0 @ Vector((0.0, 0.08, (HL + zh) / 2 - 0.01)), 0.005, 5)
        return M0 @ T(0, 0, zh)

    for beta, level, pose, skew in ((40, 3, 3.5, 0), (118, 2, 12.5, 0), (-40, 1, 180 + 18.0, 5.0), (-118, 0, 180.0, 0)):
        Mh = tower(beta, level)
        Mp = Mh @ R('Z', skew) @ R('Y', pose)
        _beagle_petal(k, w, Mp, tints, bosses=pose > 90)
        tube(dark, [Mh @ Vector((-0.034, -0.03, HL + 0.012 - (HZ0 + HSTEP * level))), Mh @ Vector((-0.02, -0.026, -0.03)), Mp @ Vector((0.0, -0.022, 0.014))],
             0.0045, 4, round_r=0.015, steps=2)
    # the cord that held the third disc back: from the bolt cup of the disc below to the lip of the one that sprang
    M3, M4 = Ml @ R('Z', -40) @ T(R0 + 0.022, 0, HZ0 + HSTEP) @ R('Z', 5.0) @ R('Y', 198), Ml @ R('Z', -118) @ T(R0 + 0.022, 0, HZ0) @ R('Y', 180)
    tube(dark, [M4 @ Vector((B2_PD + 0.215, 0.0, -B2_PT - 0.02)), M3 @ Vector((B2_PD + 0.24, 0.05, 0.004))], 0.003, 3)

    # --- on the ground: half of the clamp band that held the clam shut, sprung off and fallen against the base ---
    Mcb = T(B.x + 0.03, -0.085, 0.006) @ R('X', -5) @ R('Z', 205)
    lathe(alu, [(0.345, 0.0), (0.351, 0.0), (0.351, 0.034), (0.345, 0.034)], 12, Mcb, arc=rad(140), close=True, caps=True)
    for a in (0, 140):
        cbox(alu, (0.03, 0.022, 0.04), (0.36, 0.0, 0.017), Mcb @ R('Z', a), c=0.005)
        disc(dark, 0.008, -0.02, 0.02, 6, Mcb @ R('Z', a) @ T(0.366, 0, 0.017) @ AX['Y'])
    for a in (35, 70, 105):
        cbox(dark, (0.014, 0.05, 0.03), (0.339, 0.0, 0.017), Mcb @ R('Z', a), c=0.004)

    anchor('col_body', root, loc=(0.1, 0.15, 0), radius=1.0)
    return finish(root, 'beagle2', [k, w], ao_distance=0.45, tints=tints)


def _blade(bm, M, L, spin=1):
    """One rotor blade along local +X from the hub: wide, twisted inboard, narrow and flat at the tip."""
    st = ((0.06, 0.022, 24, 0.010), (0.14, 0.050, 22, 0.009), (0.26, 0.082, 17, 0.007), (0.42, 0.078, 12, 0.005), (0.62, 0.064, 8, 0.004),
          (0.82, 0.048, 5, 0.003), (0.96, 0.034, 3, 0.0025), (1.0, 0.018, 3, 0.002))
    rings = []
    for t, c, pitch, th in st:
        p = rad(pitch) * spin
        sec = [(-0.32 * c * spin, 0.0), (-0.02 * c * spin, th * 0.6), (0.68 * c * spin, 0.0), (-0.02 * c * spin, -th * 0.4)]
        rings.append(_mk(bm, [(t * L, y * cos(p) + z * sin(p), -y * sin(p) + z * cos(p)) for y, z in sec], M))
    for a, b in zip(rings, rings[1:]):
        for j in range(4):
            bm.faces.new((a[j], a[(j + 1) % 4], b[(j + 1) % 4], b[j]))
    bm.faces.new(rings[0])
    bm.faces.new(list(reversed(rings[-1])))


def build_ingenuity():
    """Ingenuity, the Mars helicopter: a foil-wrapped box on four thin carbon legs, two stacked
    1.2 m rotors (parts `rotor_upper`, `rotor_lower`, spinning about Z) and the little solar
    panel and antenna on top of the mast."""
    weathered()
    root = part('ingenuity')
    k = Kit(root)
    gold, carbon, alu, cell = k('gold_foil', 28), k('carbon', 40), k('aluminium'), k('solar_cell')
    grid = k('cell_grid')
    dark, lens = k('painted_dark'), k('lens')
    zf0, zf1 = 0.132, 0.295
    fx, fy = 0.136, 0.195
    # --- fuselage: a crinkled foil box with a carbon frame, cameras underneath and at the front ---
    cbox(gold, (fx, fy, zf1 - zf0), (0, 0, (zf0 + zf1) / 2), c=0.012)
    for i, (sx, sy, w) in enumerate(((0, -1, fx), (1, 0, fy), (0, 1, fx), (-1, 0, fy))):
        Mf = T(sx * (fx / 2 + 0.001), sy * (fy / 2 + 0.001), (zf0 + zf1) / 2) @ R('Z', (0, 90, 180, 270)[i]) @ R('X', 90)
        foil_panel(gold, Mf, w - 0.03, zf1 - zf0 - 0.03, 3, 3, 0.004, seed=90 + i, bulge=0.005)
    cbox(carbon, (fx + 0.012, fy + 0.012, 0.012), (0, 0, zf1), c=0.014)
    cbox(carbon, (fx + 0.008, fy + 0.008, 0.008), (0, 0, zf0), c=0.014)
    disc(dark, 0.022, zf0 - 0.012, zf0 - 0.004, 10, T(0.0, -0.03, 0))                               # navigation camera
    disc(lens, 0.014, zf0 - 0.016, zf0 - 0.012, 8, T(0.0, -0.03, 0))
    cbox(dark, (0.03, 0.022, 0.012), (0.03, 0.04, zf0 - 0.008), c=0.004)                            # laser altimeter
    cbox(dark, (0.04, 0.02, 0.035), (-0.02, -fy / 2 - 0.006, zf0 + 0.022), c=0.006)   # colour camera on the front lower edge
    disc(lens, 0.011, 0.0, 0.005, 8, T(-0.02, -fy / 2 - 0.016, zf0 + 0.02) @ R('X', 110))
    # --- four legs: thin bowed carbon tubes from brackets on the top frame out to small feet ---
    for sx in (-1, 1):
        for sy in (-1, 1):
            a = Vector((sx * 0.052, sy * 0.082, zf1 + 0.004))
            b = Vector((sx * 0.275, sy * 0.30, 0.016))
            mid = a.lerp(b, 0.5) + Vector((sx * 0.012, sy * 0.012, 0.022))
            cbox(alu, (0.026, 0.026, 0.022), tuple(a), c=0.005)
            sweep(carbon, [a, a.lerp(mid, 0.55) + Vector((0, 0, 0.008)), mid, mid.lerp(b, 0.5) + Vector((0, 0, -0.004)), b], circ(1.0, 6),
                  scales=[0.0065, 0.006, 0.0055, 0.005, 0.0045])
            lathe(dark, [(0.0, 0.0), (0.014, 0.0), (0.019, 0.006), (0.015, 0.016), (0.006, 0.024), (0.0, 0.024)], 8, T(b.x, b.y, 0))
    # --- mast, swashplates and servos ---
    zl, zu, zp = 0.365, 0.452, 0.485
    lathe(alu, [(0.0, zf1), (0.03, zf1), (0.03, zf1 + 0.02), (0.012, zf1 + 0.03), (0.012, zp - 0.01), (0.0, zp - 0.01)], 10, I4)
    for i in range(3):
        cbox(dark, (0.022, 0.016, 0.03), tuple(polar(0.034, 120 * i + 30, zf1 + 0.022)), c=0.004)
        rod(alu, polar(0.034, 120 * i + 30, zf1 + 0.036), polar(0.03, 120 * i + 30, zl - 0.02), 0.0025, 3)
        rod(alu, polar(0.03, 120 * i + 90, zl + 0.022), polar(0.03, 120 * i + 90, zu - 0.02), 0.0025, 3)
    for z in (zl - 0.02, zu - 0.02):
        lathe(alu, [(0.014, z - 0.004), (0.034, z - 0.004), (0.034, z + 0.004), (0.014, z + 0.004)], 12, I4, close=True)
    lathe(dark, [(0.0, zl + 0.016), (0.022, zl + 0.016), (0.022, zl + 0.05), (0.014, zl + 0.058), (0.0, zl + 0.058)], 10, I4)   # upper motor
    tube(dark, [(0.02, 0.03, zf1 + 0.006), (0.016, 0.012, zf1 + 0.05), (0.014, 0.004, zl + 0.07), (0.014, 0.0, zp - 0.012)], 0.003, 4)
    for sx in (-1, 1):
        for sy in (-1, 1):                                                                         # leg pivots: little spring dampers
            rod(alu, (sx * 0.04, sy * 0.065, zf1 + 0.012), (sx * 0.085, sy * 0.112, zf1 - 0.012), 0.0045, 4)
    # --- solar panel and antenna on top ---
    cbox(alu, (0.05, 0.05, 0.012), (0, 0, zp - 0.006), c=0.01)
    solar_poly(carbon, cell, [(-0.2125, -0.0825), (0.2125, -0.0825), (0.2125, 0.0825), (-0.2125, 0.0825)], T(0, 0, zp), t=0.005,
               margin=0.008, pitch=(0.068, 0.055), strip=0.003, grid=grid)
    rod(alu, (0, 0, zp + 0.01), (0, 0, zp + 0.045), 0.0022, 4)
    disc(dark, 0.008, zp + 0.008, zp + 0.016, 6, I4)

    # --- the two rotors: counter-rotating, two blades each, set at right angles ---
    kits = [k]
    for name, z, spin, yaw in (('rotor_lower', zl, 1, 28.0), ('rotor_upper', zu, -1, 118.0)):
        rp = part(name, root, loc=(0, 0, z), rot=(0, 0, rad(yaw)))
        kr = Kit(rp)
        rc, ra = kr('carbon', 40), kr('aluminium')
        lathe(ra, [(0.0, -0.014), (0.022, -0.014), (0.026, -0.008), (0.026, 0.008), (0.022, 0.014), (0.0, 0.014)], 12, I4)
        for s in (0, 180):
            Mb = R('Z', s)
            _blade(rc, Mb, 0.60, spin)
            cbox(ra, (0.05, 0.022, 0.016), (0.035, 0, 0), Mb, c=0.005)                              # blade grip
            rod(ra, Mb @ Vector((0.03, spin * 0.02, -0.004)), Mb @ Vector((0.012, spin * 0.03, -0.02)), 0.0025, 3)   # pitch link
        kits.append(kr)

    anchor('col_body', root, loc=(0, 0, 0), radius=0.4)
    return finish(root, 'ingenuity', kits, ao_distance=0.35)


def build_zhurong():
    """Zhurong: the Chinese rover with four butterfly-wing solar panels over a gold body, six
    wheels, the camera mast at the front (part `mast`) and the dish at the back."""
    weathered()
    root = part('zhurong')
    k = Kit(root)
    gold, cell, alu, white = k('gold_foil', 28), k('solar_cell'), k('aluminium'), k('painted_white', 30)
    grid = k('cell_grid')
    dark, lens, ti = k('painted_dark'), k('lens'), k('titanium')
    WR, WW, X = 0.15, 0.20, 0.63
    YF, YM, YR = -0.80, 0.0, 0.80
    bw, bl, z0, z1 = 1.00, 1.50, 0.45, 0.87
    # --- body: gold box with a white deck, the two round heat-collector windows on top ---
    taper_box(gold, (bw - 0.12, bl - 0.12), (bw, bl), z0, z0 + 0.10)
    cbox(gold, (bw, bl, z1 - z0 - 0.10), (0, 0, (z0 + 0.10 + z1) / 2), c=0.04)
    for i, (sx, sy, w) in enumerate(((0, -1, bw), (1, 0, bl), (0, 1, bw), (-1, 0, bl))):
        Mf = T(sx * (bw / 2 + 0.002), sy * (bl / 2 + 0.002), (z0 + 0.10 + z1) / 2) @ R('Z', (0, 90, 180, 270)[i]) @ R('X', 90)
        foil_panel(gold, Mf, w - 0.14, z1 - z0 - 0.16, 6 if w > 1.2 else 4, 2, 0.008, seed=110 + i, bulge=0.012)
    cbox(white, (bw + 0.03, bl + 0.03, 0.03), (0, 0, z1 + 0.012), c=0.05)
    zt = z1 + 0.027
    for sx in (-1, 1):
        lathe(alu, [(0.0, zt), (0.155, zt), (0.155, zt + 0.016), (0.135, zt + 0.02), (0.0, zt + 0.02)], 20, T(sx * 0.23, 0.22, 0))
        lathe(lens, [(0.0, zt + 0.02), (0.132, zt + 0.02), (0.12, zt + 0.03), (0.0, zt + 0.036)], 20, T(sx * 0.23, 0.22, 0))
    cbox(alu, (0.30, 0.20, 0.05), (0.0, -0.20, zt + 0.025), c=0.02)
    cbox(dark, (0.16, 0.10, 0.012), (0.0, -0.20, zt + 0.056), c=0.012)
    cbox(white, (0.14, 0.12, 0.09), (-0.30, -0.42, zt + 0.045), c=0.015)                            # surface composition detector
    disc(lens, 0.03, 0.0, 0.006, 10, T(-0.30, -0.482, zt + 0.05) @ R('X', 90))
    tube(dark, [(0.0, -0.50, zt + 0.01), (0.12, -0.36, zt + 0.01), (0.16, -0.22, zt + 0.01)], 0.01, 5, round_r=0.05)
    tube(dark, [(0.20, 0.52, zt + 0.01), (0.05, 0.48, zt + 0.01), (0.0, 0.30, zt + 0.01), (0.0, -0.10, zt + 0.01)], 0.01, 5, round_r=0.05)
    for sx in (-1, 1):                               # radiator plates and access panels on the sides, tie-down lugs
        Ms = T(sx * (bw / 2 + 0.012), 0, (z0 + 0.10 + z1) / 2) @ R('Z', 90 * sx) @ R('X', 90)
        for px, w in ((-0.42, 0.44), (0.12, 0.36), (0.52, 0.26)):
            prism(white, rrect(w, 0.20, 0.02, 2), 0.008, Ms @ T(px * sx, 0.0, 0), z0=0.0)
            for bx in (-w / 2 + 0.03, w / 2 - 0.03):
                for by in (-0.07, 0.07):
                    bolt(alu, 0.008, 0.005, Ms @ T(px * sx + bx, by, 0.008))
    Mb = T(0, bl / 2 + 0.012, (z0 + 0.10 + z1) / 2) @ R('Z', 180) @ R('X', 90)
    prism(white, rrect(0.50, 0.18, 0.02, 2), 0.008, Mb, z0=0.0)
    Mfr = T(0, -bl / 2 - 0.012, (z0 + 0.10 + z1) / 2 - 0.05) @ R('X', 90)
    prism(white, rrect(0.36, 0.12, 0.02, 2), 0.008, Mfr, z0=0.0)
    for bx in (-0.15, 0.15):
        bolt(alu, 0.008, 0.005, Mfr @ T(bx, 0, 0.008))
    for ex in (-0.32, 0.32):
        cbox(dark, (0.05, 0.03, 0.045), (ex, bl / 2 + 0.02, 0.76), c=0.006)
        disc(lens, 0.014, 0.0, 0.006, 8, T(ex, bl / 2 + 0.035, 0.76) @ R('X', -90))
    for y in (-0.36, 0.02, 0.46):                    # deck seams and fasteners
        box(alu, (bw - 0.08, 0.008, 0.003), (0, y, zt + 0.001))
    for ix in range(5):
        for iy in range(7):
            if ix in (0, 4) or iy in (0, 6):
                bolt(alu, 0.009, 0.005, T(-bw / 2 + 0.05 + (bw - 0.10) * ix / 4, -bl / 2 + 0.05 + (bl - 0.10) * iy / 6, zt))
    # --- four solar wings: forewings out and forward, hindwings out and back, with a little dihedral ---
    fore = [(0.02, -0.55), (0.45, -0.86), (0.85, -0.78), (1.02, -0.42), (0.92, -0.05), (0.02, -0.02)]
    hind = [(0.02, 0.03), (0.80, 0.08), (0.90, 0.42), (0.70, 0.82), (0.30, 0.95), (0.02, 0.62)]
    for sx in (-1, 1):
        for o, dih, org in ((fore, 7.0, (0.0, -0.30)), (hind, 4.0, (0.0, 0.40))):
            oo = o if sx > 0 else [(-x, y) for x, y in reversed(o)]
            Mw = T(sx * (bw / 2 + 0.02), 0, zt + 0.012) @ R('Y', -sx * dih)
            solar_poly(alu, cell, oo, Mw, t=0.014, margin=0.02, pitch=(0.092, 0.075), strip=0.005, origin=org, grid=grid)
            y0 = sum(p[1] for p in o) / len(o)
            for yy in (o[0][1] + 0.08 * (1 if o is hind else 0) + 0.06, o[-1][1] - 0.06):               # hinges on the body edge
                disc(dark, 0.018, -0.05, 0.05, 6, Mw @ T(sx * 0.0, yy, 0.004) @ AX['Y'])
            rod(ti, (sx * bw / 2, y0, z1 - 0.12), Mw @ Vector((sx * 0.55, y0, -0.002)), 0.012, 5)   # deployment strut under the wing
    # --- high-gain dish on a post at the back, omni antenna, weather pole ---
    hx, hy = 0.26, 0.58
    lathe(alu, [(0.0, zt), (0.05, zt), (0.05, zt + 0.03), (0.024, zt + 0.045), (0.024, zt + 0.27), (0.0, zt + 0.27)], 8, T(hx, hy, 0))
    cbox(alu, (0.08, 0.07, 0.07), (hx, hy, zt + 0.29), c=0.012)
    Md = frame((hx, hy, zt + 0.33), (0.25, 0.35, 0.90), (1, 0, 0))
    dish(white, alu, Md @ T(0, 0, 0.03), 0.19, 0.05, seg=20, struts=3, back_ribs=0, thick=0.008)
    lathe(alu, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.03), (0.0, 0.03)], 8, Md)
    lathe(alu, [(0.0, zt), (0.03, zt), (0.03, zt + 0.02), (0.012, zt + 0.03), (0.012, zt + 0.16), (0.03, zt + 0.17), (0.03, zt + 0.21),
                (0.0, zt + 0.22)], 8, T(-0.34, 0.60, 0))
    rod(alu, (-0.38, -0.62, zt), (-0.38, -0.62, zt + 0.55), 0.009, 5, r2=0.006)                     # climate station
    for i in range(3):
        rod(alu, (-0.38, -0.62, zt + 0.53), (-0.38 + 0.07 * cos(i * 2.1), -0.62 + 0.07 * sin(i * 2.1), zt + 0.55), 0.003, 3)
        ball(dark, (-0.38 + 0.07 * cos(i * 2.1), -0.62 + 0.07 * sin(i * 2.1), zt + 0.55), 0.008, 5, 3)
    # --- two ground-penetrating radar whips angled out ahead of the front wheels ---
    for sx in (-1, 1):
        cbox(alu, (0.06, 0.06, 0.05), (sx * 0.36, -bl / 2 - 0.02, 0.60), c=0.01)
        rod(alu, (sx * 0.36, -bl / 2 - 0.03, 0.60), (sx * 0.86, -1.52, 0.50), 0.006, 4, r2=0.004)
        for ex in (-0.08, 0.08):                                                                    # hazard-avoidance cameras
            cbox(dark, (0.05, 0.03, 0.045), (sx * 0.2 + ex * 0, -bl / 2 - 0.012, 0.76), c=0.006)
        disc(lens, 0.014, 0.0, 0.006, 8, T(sx * 0.2, -bl / 2 - 0.028, 0.76) @ R('X', 90))
    # --- suspension: main rocker on each side, bogie behind, all six wheels steering ---
    top_z = 2 * WR + 0.13
    for sx in (-1, 1):
        P = Vector((sx * 0.53, -0.12, 0.56))
        B = Vector((sx * 0.60, 0.42, 0.42))
        sec = chamf(0.04, 0.055, 0.012)
        disc(dark, 0.055, -0.03, 0.05, 10, T(*P) @ AX['X'] @ S(1, 1, sx))
        sweep(ti, [P, (sx * 0.60, -0.50, 0.56), (sx * X, YF, top_z - 0.01)], sec)
        sweep(ti, [P, (sx * 0.58, 0.20, 0.50), B], sec)
        ball(dark, B, 0.04, 8, 4)
        sweep(ti, [B, (sx * 0.61, 0.22, 0.47), (sx * X, YM, top_z - 0.01)], sec)
        sweep(ti, [B, (sx * 0.61, 0.62, 0.47), (sx * X, YR, top_z - 0.01)], sec)
        rod(alu, P + Vector((0, 0.10, 0.02)), B + Vector((0, -0.08, 0.05)), 0.014, 6)               # suspension angle actuator
        for y in (YF, YM, YR):
            _steer_unit(k, sx * X, y, WR, WW, sx, top_z, tube_r=0.016, mat='titanium', act_r=0.04)
            Mw = T(sx * X, y, WR) @ AX['X'] @ S(1, 1, sx)
            wheel(alu, alu, Mw, WR, WW, seg=18, th=0.005, cleats=16, cleat_h=0.007, cleat_t=0.006, crown=0.05, spokes=8,
                  spoke_twist=0.0, spoke_w=0.03, spoke_t=0.006, hub_r=0.04, hub_x=0.03, hub_len=0.07, spoke_bm=alu)
    # --- camera mast at the front: its own part ---
    mast = part('mast', root, loc=(0.0, -0.56, zt))
    km = Kit(mast)
    mw, ma, md, ml = km('painted_white', 30), km('aluminium'), km('painted_dark'), km('lens')
    lathe(ma, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.04), (0.04, 0.06), (0.04, 0.10), (0.0, 0.10)], 12, I4)
    lathe(mw, [(0.03, 0.10), (0.03, 0.72), (0.0, 0.72)], 10, I4)
    lathe(ma, [(0.035, 0.40), (0.035, 0.43), (0.03, 0.43)], 10, I4)
    cbox(ma, (0.07, 0.07, 0.08), (0, 0, 0.75), c=0.012)
    disc(md, 0.028, -0.05, 0.05, 8, T(0, 0, 0.76) @ AX['X'])
    hb = 0.85
    cbox(mw, (0.40, 0.10, 0.10), (0, -0.01, hb), c=0.02)
    for sx in (-1, 1):                                                                              # stereo navigation cameras
        lathe(ma, [(0.04, 0.0), (0.04, 0.045), (0.032, 0.045), (0.032, 0.0)], 12, T(sx * 0.15, -0.06, hb) @ R('X', 90), close=True)
        disc(ml, 0.032, 0.0, 0.03, 10, T(sx * 0.15, -0.06, hb) @ R('X', 90))
    cbox(md, (0.07, 0.04, 0.06), (0, -0.075, hb), c=0.01)                                           # multispectral camera
    disc(ml, 0.02, 0.0, 0.006, 8, T(0, -0.095, hb) @ R('X', 90))
    for sx in (-1, 1):                                                                              # magnetometer probes on the mast
        rod(ma, (0, 0, 0.42), (sx * 0.16, 0.02, 0.44), 0.006, 4)
        cbox(md, (0.03, 0.03, 0.03), (sx * 0.17, 0.02, 0.44), c=0.005)

    anchor('col_body', root, loc=(0, 0, 0), radius=1.55)
    return finish(root, 'zhurong', [k, km])


def shard(bm, M, r, t=0.012, seed=1, n=7, crumple=0.22, curl=0.0, back=None, simple=False):
    """A torn piece of plate with real thickness. The outline is irregular with deep notches torn
    out of it; the plate is bent about a line (curl), buckled (crumple), and its torn lip is
    kinked up or down. Two rings of verts (unless simple=True, for chips) let it bend. Faces on
    the upper skin go to `bm`, the lower skin and the torn edge to `back` (default: the same)."""
    rng = random.Random(seed)
    back = bm if back is None else back
    rim = []
    for i in range(n):
        a = TAU * (i + rng.uniform(-0.3, 0.3)) / n
        rr = r * rng.uniform(0.55, 1.15)
        if rng.random() < 0.3:
            rr *= rng.uniform(0.35, 0.6)                               # a bite torn out of the edge
        rim.append((rr * cos(a), rr * sin(a), rng.uniform(-1.0, 1.0) * 0.16 * r * min(1.0, crumple * 4)))
    mid = [] if simple else [(0.52 * x + rng.uniform(-0.05, 0.05) * r, 0.52 * y + rng.uniform(-0.05, 0.05) * r, 0.0) for x, y, _ in rim]

    def z_at(x, y):
        return (noise3(x * 2.2 / r, y * 2.2 / r, 0.5, seed) - 0.5) * 2 * crumple * r + curl * (x * x) / max(r, 1e-6)

    def skin(dz):
        c = _mk(bm, [(0.0, 0.0, z_at(0, 0) + dz)], M)
        rings = [_mk(bm, [(x, y, z_at(x, y) + lip + dz) for x, y, lip in ring], M) for ring in ((mid, rim) if mid else (rim,))]
        return c[0], rings

    (ct, rt), (cb, rb) = skin(t), skin(0.0)
    top_faces, back_faces = [], []
    for i in range(n):
        j = (i + 1) % n
        top_faces.append((ct, rt[0][i], rt[0][j]))
        back_faces.append((cb, rb[0][j], rb[0][i]))
        if mid:
            top_faces.append((rt[0][i], rt[1][i], rt[1][j], rt[0][j]))
            back_faces.append((rb[0][i], rb[0][j], rb[1][j], rb[1][i]))
        back_faces.append((rt[-1][i], rb[-1][i], rb[-1][j], rt[-1][j]))
    for f in top_faces:
        bm.faces.new(f)
    if back is bm:
        for f in back_faces:
            bm.faces.new(f)
    else:                                                              # the other bucket needs its own verts
        remap = {}
        for f in back_faces:
            back.faces.new([remap.setdefault(v, back.verts.new(v.co)) for v in f])


def burst_tank(shell, fit, M, r=0.19, seed=1, seg=16, split=(15.0, 150.0), gape=20.0, crack=82.0, dents=(), th=0.007,
               lugs=(200.0, 290.0), bolts=False):
    """A propellant tank that burst: a sphere of two halves welded at the girth, split open along part of that weld
    (`split`: from and to, degrees round the equator) and sprung open by `gape` degrees about what is left of it, like
    a shell, with the lips flared and ragged, a crack torn on from the split toward one pole (at `crack` degrees, which
    must lie inside the split), dents ((direction, half-angle in degrees, depth), ...), a boss on each
    pole with the stub of a feed line, and mounting lugs on the weld. The wall has thickness and an inside, so the
    opening shows a dark hollow. Local Z is the tank's axis. `shell` takes hand-wound faces (do not recalculate them)."""
    rng = random.Random(seed)
    LAT = (-68.0, -46.0, -26.0, -10.0, -3.2, 3.2, 10.0, 26.0, 46.0, 68.0)
    step = 360.0 / seg
    ic = int(crack // step) % seg                                      # the crack takes the cells of this column

    span = split[1] - split[0]
    uh = rad((split[0] + split[1]) / 2 + 180.0)                           # the hinge: the middle of the weld that held
    Hh = T(r * cos(uh), r * sin(uh), 0.0)
    axis = Vector((-sin(uh), cos(uh), 0.0))
    halves = [M @ Hh @ Matrix.Rotation(sg * rad(gape) / 2, 4, axis) @ Hh.inverted() for sg in (-1.0, 1.0)]     # south, north

    def opened(u):
        t = ((u - split[0]) % 360.0) / span
        return sin(pi * t) ** 0.5 if 0.0 < t < 1.0 else 0.0

    def point(j, i, inner):
        lat, u = LAT[j], i * step
        s = opened(u)
        lip = smooth01(46.0, 3.2, abs(lat))                               # 1 at the weld, 0 well up the dome
        sign = 1.0 if lat > 0 else -1.0
        rad_ = 1.0 + (0.022 if abs(lat) < 4 and not inner else 0.0)       # the weld bead
        if s > 0.0:
            jag = (_hash(i, j, 3, seed) - 0.5) * 2.0 if abs(lat) < 4 else 0.0
            lat += sign * (2.0 * s * lip + 5.0 * jag * s)
            rad_ += 0.13 * s * lip * lip + 0.07 * jag * s
        if LAT[j] > 0 and LAT[j] < 40 and i in (ic, (ic + 1) % seg):      # the crack: a narrowing tear, its corners curled back
            close = {3.2: 0.0, 10.0: 4.5, 26.0: 9.5}[LAT[j]] * (step / 22.5)
            u += close if i == ic else -close
            if LAT[j] < 4:
                lat += 7.0
                rad_ += 0.13
        la, uu = rad(lat), rad(u)
        n = Vector((cos(la) * cos(uu), cos(la) * sin(uu), sin(la)))
        for d, half, depth in dents:
            ang = math.degrees(n.angle(Vector(d).normalized()))
            if ang < half:
                rad_ -= (depth / r) * (0.5 + 0.5 * cos(pi * ang / half))
        return halves[LAT[j] > 0] @ (n * (r * rad_ - (th if inner else 0.0)))

    def pole(z, inner):
        n = Vector((0.0, 0.0, z))
        rad_ = 1.0
        for d, half, depth in dents:
            ang = math.degrees(n.angle(Vector(d).normalized()))
            if ang < half:
                rad_ -= (depth / r) * (0.5 + 0.5 * cos(pi * ang / half))
        return halves[z > 0] @ (n * (r * rad_ - (th if inner else 0.0)))

    nr = len(LAT)
    O = [[shell.verts.new(point(j, i, False)) for i in range(seg)] for j in range(nr)]
    I = [[shell.verts.new(point(j, i, True)) for i in range(seg)] for j in range(nr)]
    hole = {(4, i) for i in range(seg) if opened((i + 0.5) * step) > 0.02} | {(5, ic), (6, ic)}
    for j in range(nr - 1):
        for i in range(seg):
            i2 = (i + 1) % seg
            if (j, i) not in hole:
                shell.faces.new((O[j][i], O[j][i2], O[j + 1][i2], O[j + 1][i]))
                shell.faces.new((I[j][i], I[j + 1][i], I[j + 1][i2], I[j][i2]))
                continue
            if (j - 1, i) not in hole:                                    # the torn edge, all round the opening
                shell.faces.new((O[j][i], O[j][i2], I[j][i2], I[j][i]))
            if (j + 1, i) not in hole:
                shell.faces.new((O[j + 1][i2], O[j + 1][i], I[j + 1][i], I[j + 1][i2]))
            if (j, (i - 1) % seg) not in hole:
                shell.faces.new((O[j + 1][i], O[j][i], I[j][i], I[j + 1][i]))
            if (j, i2) not in hole:
                shell.faces.new((O[j][i2], O[j + 1][i2], I[j + 1][i2], I[j][i2]))
    for z, ring_o, ring_i in ((-1.0, O[0], I[0]), (1.0, O[-1], I[-1])):
        po, pi_ = shell.verts.new(pole(z, False)), shell.verts.new(pole(z, True))
        for i in range(seg):
            i2 = (i + 1) % seg
            shell.faces.new((po, ring_o[i2], ring_o[i]) if z < 0 else (ring_o[i], ring_o[i2], po))
            shell.faces.new((pi_, ring_i[i], ring_i[i2]) if z < 0 else (ring_i[i2], ring_i[i], pi_))
    # fittings: the feed boss with its flange and the stub of the line, a blind boss opposite, lugs on the weld
    Mb = halves[1] @ T(0, 0, r - 0.012)
    lathe(fit, [(0.0, 0.0), (0.054, 0.0), (0.054, 0.016), (0.036, 0.021), (0.036, 0.046), (0.024, 0.052), (0.0, 0.052)], 10, Mb)
    if bolts:
        bolt_circle(fit, 0.045, 6, 0.006, 0.005, Mb @ T(0, 0, 0.0165), seg=5)
    tube(fit, [(0.0, 0.0, 0.045), (0.0, 0.0, 0.085), (0.018 + 0.02 * rng.random(), 0.01, 0.125), (0.06, 0.035 * rng.uniform(-1, 1), 0.15)], 0.0095, 5,
         round_r=0.02, steps=2, M=Mb)
    lathe(fit, [(0.0, 0.0), (0.032, 0.0), (0.032, 0.018), (0.02, 0.026), (0.0, 0.026)], 8, halves[0] @ R('X', 180) @ T(0, 0, r - 0.01))
    for u in lugs:
        cbox(fit, (0.045, 0.012, 0.05), (r + 0.012, 0.0, -0.035), halves[0] @ R('Z', u), c=0.004)
        lathe(fit, [(0.0, -0.009), (0.009, -0.009), (0.009, 0.009), (0.0, 0.009)], 6, halves[0] @ R('Z', u) @ T(r + 0.022, 0, -0.035) @ AX['Y'])


def kinked(bm, p0, direction, length, r=0.02, seed=1, seg=5, kinks=2, bend=0.35):
    """A bent strut or pipe: a tube with a couple of random kinks."""
    rng = random.Random(seed)
    p = Vector(p0)
    d = Vector(direction).normalized()
    pts = [p.copy()]
    for i in range(kinks + 1):
        p = p + d * (length / (kinks + 1))
        pts.append(p.copy())
        d = (d + Vector((rng.uniform(-bend, bend), rng.uniform(-bend, bend), rng.uniform(-bend, bend) * 0.6))).normalized()
    for q in pts:
        q.z = max(q.z, r)
    tube(bm, pts, r, seg, round_r=length * 0.06, steps=2)


def _canopy(bm, M, rx, ry, h, seed=1, nu=44, gores=10, tears=((0.07, 0.21, 4), (0.43, 0.51, 2), (0.63, 0.78, 6), (0.90, 0.94, 3))):
    """A collapsed parachute: a low, lopsided heap of pleated cloth with alternating coloured gores
    and ragged sectors torn out of it (from, to as fractions of the way round, rings deep). Faces: material 0
    and 1 by gore. Returns the skirt verts."""
    rings = ((1.0, 0.0), (0.96, 0.25), (0.86, 0.6), (0.72, 0.9), (0.56, 1.0), (0.40, 0.75), (0.24, 0.7), (0.10, 0.9))
    rows = []
    for j, (rf, hf) in enumerate(rings):
        row = []
        ox, oy = 0.30 * rx * (1 - rf), -0.16 * ry * (1 - rf)          # the apex was dragged off to one side
        for i in range(nu):
            a = TAU * i / nu
            n1 = noise3(1.6 * cos(a) + 5, 1.6 * sin(a) + 5, 0.3, seed)
            n2 = noise3(2.9 * rf * cos(a) + 9, 2.9 * rf * sin(a) + 9, 4.0, seed + 11)
            n3 = noise3(5.5 * rf * cos(a) + 2, 5.5 * rf * sin(a) + 2, 7.0, seed + 5)
            fold = abs(sin(gores * a / 2 + 0.4 + 1.5 * n1))
            f = rf * (0.72 + 0.62 * n1) * (1 - 0.10 * (1 - fold))
            z = h * hf * (0.35 + 0.65 * fold) * (0.25 + 1.5 * n2) + 0.05 * h * n3 + (0.012 if j else 0.004)
            row.append(bm.verts.new(M @ Vector((ox + rx * f * cos(a), oy + ry * f * sin(a), z))))
        rows.append(row)

    def torn(i, j):
        return any(a * nu <= i <= b * nu and j < d for a, b, d in tears)

    for j in range(len(rings) - 1):
        for i in range(nu):
            if torn(i, j):
                continue
            f = bm.faces.new((rows[j][i], rows[j][(i + 1) % nu], rows[j + 1][(i + 1) % nu], rows[j + 1][i]))
            f.material_index = (i * gores // nu) % 2
    f = bm.faces.new(rows[-1])
    f.material_index = 1
    return rows[0]


def _blast_ground(x, y):
    """Height of the ground the wreck lies on at (x, y): the floor of a shallow crater (the model
    cannot dig below the ground, so the crater is its raised rim of thrown soil, about 1.4 m out
    from the middle), and beyond the rim a thin blanket of ejecta. A few centimetres proud of the
    ground everywhere so that it never z-fights."""
    d = sqrt(x * x + y * y)
    th = math.atan2(y, x)
    n = noise3(x * 0.9 + 4, y * 0.9 + 4, 0.4, 31)
    rr = 1.38 + 0.24 * (noise3(1.3 * cos(th) + 3, 1.3 * sin(th) + 3, 0.7, 34) - 0.5)
    rim = math.exp(-((d - rr) / (0.20 if d < rr else 0.46)) ** 2)      # steep inside, a long back slope
    bowl = 0.028 + 0.012 * noise3(x * 2.4, y * 2.4, 1.1, 32)
    return bowl + 0.12 * rim * (0.65 + 0.7 * n)


def _blast_radius(th):
    """Ragged outline of the blast patch, with rays."""
    return 3.55 + 0.55 * (noise3(1.8 * cos(th) + 7, 1.8 * sin(th) + 7, 0.2, 33) - 0.5) + 0.30 * abs(sin(5.5 * th + 0.7)) ** 6


def _blast_ray(th):
    """Where soil dug out from under the dust was thrown in rays (0..1): paler than the soot it lies on."""
    return max(0.0, sin(7.0 * th + 2.1)) ** 9


def _scorch_dish(bm, nu=48):
    """The blast patch: a low crater rim, fused and blackened soil inside it, soot and thrown soil
    outside in a ragged disc with rays, tucked into the ground at its edge. Returns nothing; the
    tint is painted after the occlusion bake."""
    fr = (0.0, 0.10, 0.22, 0.30, 0.36, 0.42, 0.50, 0.62, 0.74, 0.86, 0.95, 1.0, 1.012)
    rows = []
    for j, f in enumerate(fr):
        row = []
        for i in range(nu):
            th = TAU * (i + 0.5 * (j % 2)) / nu
            r = _blast_radius(th) * f
            x, y = r * cos(th), r * sin(th)
            z = _blast_ground(x, y) + 0.010 * _blast_ray(th) * smooth01(0.36, 0.50, f)        # a ray is a low ridge of clods
            z = z * min(1.0, (1.0 - f) / 0.14) ** 0.8 if f < 1.0 else -0.02 if f == 1.0 else -0.30   # ... and a buried hem
            row.append(bm.verts.new((x, y, z)))
        rows.append(row)
    c = bm.verts.new((0.0, 0.0, _blast_ground(0, 0)))
    for i in range(nu):
        bm.faces.new((c, rows[1][i], rows[1][(i + 1) % nu]))
    for j in range(1, len(fr) - 1):
        a, b = rows[j], rows[j + 1]
        for i in range(nu):
            i2 = (i + 1) % nu
            if j % 2 == 0:
                bm.faces.new((a[i], a[i2], b[i]))
                bm.faces.new((a[i2], b[i2], b[i]))
            else:
                bm.faces.new((a[i], b[i2], b[i]))
                bm.faces.new((a[i], a[i2], b[i2]))
    for v in rows[0]:
        bm.verts.remove(v)


class Wound:
    """Buckets for geometry whose faces are wound as they are made (open skins, sheets with a
    different material on each side), which the Kit must not re-orient: w('gold_foil', 22) is a
    bmesh for that material and smoothing angle; flush() turns each into a helper mesh as it is."""

    def __init__(self, parent, tag='wound'):
        self.parent, self.tag, self.b = parent, tag, {}

    def __call__(self, material, smooth=38.0):
        if (material, smooth) not in self.b:
            self.b[(material, smooth)] = bm_new()
        return self.b[(material, smooth)]

    def flush(self):
        for (material, smooth), bm in self.b.items():
            if not bm.faces:
                bm.free()
                continue
            if os.environ.get('TRIS'):
                print(f'    {self.tag + "_" + material + "_" + str(int(smooth)):44s} {sum(len(f.verts) - 2 for f in bm.faces):6d}   top {max(v.co.z for v in bm.verts):.2f}')
            mesh_obj(f'{self.tag}_{material}_{int(smooth)}', bm, material, parent=self.parent, smooth_angle=smooth)
        self.b = {}


def skin(bm, P, keep=None, fan=None):
    """One skin over a grid of points P[j][i] (None where there is none), facing the way i x j
    points. keep(j, i) -> False leaves a cell out. `fan`: a point the last row closes up to."""
    V = [[None if p is None else bm.verts.new(p) for p in row] for row in P]
    for j in range(len(P) - 1):
        for i in range(len(P[0]) - 1):
            q = (V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i])
            if None not in q and (keep is None or keep(j, i)):
                bm.faces.new(q)
    if fan is not None:
        c = bm.verts.new(fan)
        for i in range(len(P[0]) - 1):
            if V[-1][i] is not None and V[-1][i + 1] is not None:
                bm.faces.new((V[-1][i], V[-1][i + 1], c))
    return V


def torn_sheet(top, back, edge, P, t=0.006, keep=None, fresh=None):
    """Sheet metal (or a sandwich panel, or a blanket) with real thickness, from a grid of points
    P[j][i] on its mid-surface; None where it is torn away, and keep(j, i) -> False tears a cell
    out. The upper skin (the way i x j points) goes to the bmesh `top`, the lower to `back`, and
    the torn edge all round, which shows what the sheet is made of, to `edge`. Wound by
    construction. `fresh` collects the points of the torn edge."""
    nj, ni = len(P), len(P[0])
    cells = [(j, i) for j in range(nj - 1) for i in range(ni - 1)
             if None not in (P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]) and (keep is None or keep(j, i))]
    have = set(cells)
    nrm = {}
    for (j, i) in cells:
        a, b, c, d = P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]
        n = (b - a).cross(d - a) + (d - c).cross(b - c)
        for q in ((j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i)):
            nrm[q] = nrm.get(q, Vector()) + n
    up = {q: P[q[0]][q[1]] + n.normalized() * (t / 2) for q, n in nrm.items()}
    dn = {q: P[q[0]][q[1]] - n.normalized() * (t / 2) for q, n in nrm.items()}
    made = {}

    def vert(bm, pts, q):
        key = (id(bm), id(pts), q)
        if key not in made:
            made[key] = bm.verts.new(pts[q])
        return made[key]

    for (j, i) in cells:
        ring = ((j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i))
        top.faces.new([vert(top, up, q) for q in ring])
        back.faces.new([vert(back, dn, q) for q in reversed(ring)])
        for e, (dj, di) in enumerate(((-1, 0), (0, 1), (1, 0), (0, -1))):
            if (j + dj, i + di) in have:
                continue
            a, b = ring[e], ring[(e + 1) % 4]
            edge.faces.new((vert(edge, up, a), vert(edge, dn, a), vert(edge, dn, b), vert(edge, up, b)))
            if fresh is not None:
                fresh.extend((up[a], dn[a], up[b], dn[b]))


def scrap(M, w, h, nx=4, ny=3, seed=1, crumple=0.16, curl=0.9, bite=0.35, twist=0.3, fold=None):
    """The grid of a piece of sheet torn out of a structure, for torn_sheet: 2w by 2h in local XY,
    its outline ragged (corners and bites missing), buckled, and curled: its two ends in x lift,
    by `curl` radians at the tips, one more than the other. fold = (u, degrees) snaps it along a
    line across it at x = u * w: what lies beyond the line is turned up by that angle."""
    rng = random.Random(seed)
    side = rng.uniform(0.35, 1.0), rng.uniform(0.35, 1.0)
    P = []
    for j in range(ny + 1):
        v = -1 + 2 * j / ny
        xs, zs = [0.0] * (nx + 1), [0.0] * (nx + 1)
        mid = nx // 2
        for s, order in ((1, range(mid + 1, nx + 1)), (-1, range(mid - 1, -1, -1))):
            x = z = 0.0
            for i in order:
                um = -1 + 2 * (i - 0.5 * s) / nx
                a = curl * side[s > 0] * um * abs(um) * (1.0 + twist * v)
                x += s * (2 * w / nx) * cos(a)
                z += (2 * w / nx) * abs(sin(a))
                xs[i], zs[i] = x, z
        row = []
        for i in range(nx + 1):
            u = -1 + 2 * i / nx
            rim = abs(u) == 1 or abs(v) == 1
            if (abs(u) == 1 and abs(v) == 1 and rng.random() < 0.75) or (rim and rng.random() < bite * 0.35):
                row.append(None)
                continue
            jx, jy = rng.uniform(-0.22, 0.22) * (2 * w / nx), rng.uniform(-0.22, 0.22) * (2 * h / ny)
            y = v * h * (1.0 + (0.25 * rng.uniform(-1, 0.4) if rim else 0.0))
            z = zs[i] + crumple * w * 2 * (noise3((xs[i] + jx) * 2.6 / w + 3, (y + jy) * 2.6 / w + 1, 0.5, seed) - 0.5)
            x = xs[i] + jx
            if fold is not None and x > fold[0] * w:
                dx, ca, sa = x - fold[0] * w, cos(rad(fold[1])), sin(rad(fold[1]))
                x, z = fold[0] * w + dx * ca - z * sa, dx * sa + z * ca
            row.append(M @ Vector((x, y + jy, z)))
        P.append(row)
    return P


def wad(bm, M, r, seed=1, subdiv=1, flat=0.6):
    """A scrap of foil or blanket screwed up into a ball: sharp random facets."""
    rng = random.Random(seed)
    vs = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)['verts']
    for v in vs:
        d = v.co.normalized()
        s = r * rng.uniform(0.5, 1.25)
        v.co = Vector((d.x * s, d.y * s * rng.uniform(0.8, 1.0), max(-0.3 * r, d.z * s * flat)))
    bmesh.ops.transform(bm, matrix=M, verts=vs)


def sheet_frame(P, keep=None):
    """The cells of a grid of points P[j][i] as torn_sheet takes it, and the unit normal at each
    point that has one (the way i x j points)."""
    cells = [(j, i) for j in range(len(P) - 1) for i in range(len(P[0]) - 1)
             if None not in (P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]) and (keep is None or keep(j, i))]
    nrm = {}
    for (j, i) in cells:
        a, b, c, d = P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]
        n = (b - a).cross(d - a) + (d - c).cross(b - c)
        for q in ((j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i)):
            nrm[q] = nrm.get(q, Vector()) + n
    return cells, {q: n.normalized() for q, n in nrm.items()}


def sandwich_chunk(skin, core, P, t=0.04, s=0.006, keep=None, peeled=None, shade=None, marks=None, mark=None, notch=0.009, rolls=2, seed=1):
    """A piece of honeycomb sandwich panel, from a grid of points P[j][i] on its mid-surface (None
    where it is torn away; keep(j, i) -> False tears a cell out): two thin skins (to the bmesh
    `skin`) on a thick core (to `core`). The core shows as a pale band under the upper skin's edge
    all round the piece, broken in and out by `notch` (crushed cells, not a sawn edge), and on top
    wherever that skin has come off it: peeled(j, i) -> True. Along up to `rolls` of the edges where
    the skin gives way to bared core, the skin that came off is still there, rolled back on itself.
    Wound by construction. `shade` collects (point, tone) for the core's open edge, darker in the
    notches, so that painted per vertex it reads as rows of cells and not as a clean band; `marks`
    collects the points of the piece at the grid points for which mark(j, i) is true (to char them)."""
    cells, nrm = sheet_frame(P, keep)
    have = set(cells)
    bare = {c for c in cells if peeled is not None and peeled(*c)}
    up = {q: P[q[0]][q[1]] + n * (t / 2) for q, n in nrm.items()}
    mid = {q: P[q[0]][q[1]] + n * (t / 2 - s) for q, n in nrm.items()}
    dn = {q: P[q[0]][q[1]] - n * (t / 2) for q, n in nrm.items()}
    made = {}

    def vert(bm, pts, q):
        key = (id(bm), id(pts), q)
        if key not in made:
            made[key] = bm.verts.new(pts[q])
        return made[key]

    for (j, i) in cells:
        ring = ((j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i))
        if (j, i) in bare:
            core.faces.new([vert(core, mid, q) for q in ring])
        else:
            skin.faces.new([vert(skin, up, q) for q in ring])
        skin.faces.new([vert(skin, dn, q) for q in reversed(ring)])
        for e, (dj, di) in enumerate(((-1, 0), (0, 1), (1, 0), (0, -1))):
            a, b = ring[e], ring[(e + 1) % 4]
            other = (j + dj, i + di)
            n = (nrm[a] + nrm[b]).normalized()
            inward = n.cross((P[b[0]][b[1]] - P[a[0]][a[1]]).normalized())           # in the sheet, from this edge into the cell
            if (j, i) not in bare and (other not in have or other in bare):          # the edge of the upper skin
                skin.faces.new((vert(skin, up, a), vert(skin, mid, a), vert(skin, mid, b), vert(skin, up, b)))
            if (j, i) not in bare and other in bare and rolls > 0:                   # ... and the skin that came off, rolled back over it
                rolls -= 1
                rad_ = 0.022 + 0.02 * _hash(j, i, e, seed)
                rows = []
                for kk, th in enumerate((0.0, 55.0, 110.0, 165.0, 215.0)):
                    row = []
                    for q, other_q in ((a, b), (b, a)):
                        base = up[q] + (up[other_q] - up[q]) * (0.07 * kk)           # (it narrows as it rolls)
                        row.append(base + (inward * sin(rad(th)) + nrm[q] * (1.0 - cos(rad(th)) + 0.04)) * rad_)
                    rows.append(row)
                for ra, rb in zip(rows, rows[1:]):
                    quad = (ra[0], ra[1], rb[1], rb[0])
                    skin.faces.new([skin.verts.new(c) for c in quad])
                    skin.faces.new([skin.verts.new(c) for c in reversed(quad)])
            if other not in have:                                                    # the core, open to view
                if notch and _hash(j, i, e + 4, seed) < 0.7:
                    pm = {id(lv): (lv[a] + lv[b]) / 2 + inward * notch * (0.5 + _hash(i, j, e, seed)) for lv in (mid, dn)}
                    mm, dm = core.verts.new(pm[id(mid)]), core.verts.new(pm[id(dn)])
                    core.faces.new((vert(core, mid, a), vert(core, dn, a), dm, mm))
                    core.faces.new((mm, dm, vert(core, dn, b), vert(core, mid, b)))
                    core.faces.new((vert(core, mid, a), mm, vert(core, mid, b)))     # (closes the notch under the skin's edge)
                    if shade is not None:
                        shade.extend(((pm[id(mid)], 0.34), (pm[id(dn)], 0.26)))
                else:
                    core.faces.new((vert(core, mid, a), vert(core, dn, a), vert(core, dn, b), vert(core, mid, b)))
                if shade is not None:
                    shade.extend(((mid[a], 0.80), (dn[a], 0.62), (mid[b], 0.80), (dn[b], 0.62)))
    if marks is not None:
        for q in nrm:
            if mark is None or mark(*q):
                marks.extend((up[q], mid[q], dn[q]))


def sheet_ribs(bm, P, lines, keep=None, t=0.01, w=0.009, h=0.022):
    """Stiffening ribs standing on the upper face of a sheet (the grid P that torn_sheet was given,
    of thickness t): one along each line of grid points [(j, i), ...], following the sheet through
    its bends, w wide and h high. A line breaks where the sheet is torn away. Wound by construction;
    open underneath."""
    _, nrm = sheet_frame(P, keep)
    for line in lines:
        runs, run = [], []
        for q in line:
            if q in nrm:
                run.append(q)
            else:
                runs.append(run)
                run = []
        runs.append(run)
        for run in runs:
            if len(run) < 2:
                continue
            st = []
            for k, q in enumerate(run):
                p0, p1 = P[run[max(k - 1, 0)][0]][run[max(k - 1, 0)][1]], P[run[min(k + 1, len(run) - 1)][0]][run[min(k + 1, len(run) - 1)][1]]
                n = nrm[q]
                d = (p1 - p0).normalized()
                side = n.cross(d).normalized() * (w / 2)
                base = P[q[0]][q[1]] + n * (t / 2 - 0.001)
                top = base + n * h * (0.55 if k in (0, len(run) - 1) else 1.0)      # (the ends run out lower)
                st.append([bm.verts.new(c) for c in (base - side, base + side, top - side, top + side)])
            for a, b in zip(st, st[1:]):
                bm.faces.new((a[0], b[0], b[2], a[2]))
                bm.faces.new((a[2], b[2], b[3], a[3]))
                bm.faces.new((a[1], a[3], b[3], b[1]))
            bm.faces.new((st[0][0], st[0][2], st[0][3], st[0][1]))
            bm.faces.new((st[-1][0], st[-1][1], st[-1][3], st[-1][2]))


def build_schiaparelli_wreck():
    """The Schiaparelli impact site. The lander, a 1.65 m disc, came down at 150 m/s with its
    hydrazine tanks nearly full: it dug a shallow crater, crushed its honeycomb base flat, and the
    tanks burst and blew one side of it out. What is left sits tilted in the crater and can
    still be read as the machine it was. A third of the drum still stands (its carbon deck, its
    side wall under torn gold blanket, the white-blanketed equipment bay with the stub of the
    mast, the dome of a tank coming through the deck); next to that the deck has peeled up and
    back in a curl and the wall is splayed flat, over a tank burst open at its weld; the rest
    is gone, open to the crushed honeycomb floor, the bent struts of the frame that held the
    tanks and thrusters, hanging harness, soot. The missing side lies across the ground the way
    the blast went: pieces of sandwich deck, curled wall plate, foil and blanket, struts, a
    thruster cluster, the third tank. A slab of the back shell lies to one side with what is
    left of the parachute. The ground is the blast patch: a low crater rim, black inside, soot
    and thrown soil outside in rays.
    Metal stays metal, foil gold and blanket white where the fire did not reach; the soot is
    painted on after the occlusion bake, heaviest toward the burst and underneath, and never on
    a torn edge (bright, fresh metal). Every sheet has thickness and both its faces."""
    weathered()
    mat('carbon', color=(0.035, 0.035, 0.04), metallic=0.3, roughness=0.5)             # carbon-fibre skins of the deck and walls
    mat('ejecta', color=(0.50, 0.36, 0.265), metallic=0.0, roughness=1.0)              # soil from under the dust, thrown out in rays
    mat('aluminium_bare', color=(0.70, 0.71, 0.74), metallic=0.6, roughness=0.5)       # torn structure: brighter than a lander that has only stood in the dust
    root = part('schiaparelli_wreck')
    k, w = Kit(root), Wound(root)
    alu, char, cfk = k('aluminium_bare', 32), k('scorched', 32), k('carbon', 32)
    gold_k, white_k = k('gold_foil', 14), k('blanket_white', 22)
    wc, wa, wg, ww = w('carbon', 30), w('aluminium_bare', 30), w('gold_foil', 20), w('blanket_white', 34)
    tank = w('aluminium_bare', 40)                                  # the tanks (titanium: tinted after the bake)
    rng = random.Random(16)
    fresh = []                                                      # points of torn edges: bright whatever the soot round them
    charred = []                                                    # points of edges that burnt: black whatever is round them
    titanium = []                                                   # ((x, y, z), radius): what is inside these balls is tank

    # the lander's own frame: its axis is local Z, its base on local z = 0. It lies tilted, the blown side low in the crater.
    ML = T(0.03, -0.02, 0.045) @ R('Z', -10) @ R('Y', -8) @ R('X', 6)
    TURN = R('Z', -95)                                              # (applied to the lander and its thrown wreckage together, further down)
    ZB, ZD, RD = 0.10, 0.30, 0.825                                  # top of the crushed base, the deck, the deck's radius

    def L(th, r, z):
        return ML @ Vector(polar(r, th, z))

    def lump(th, r, s=1.0, seed=40):
        return noise3(1.6 * r * cos(rad(th)) * s + 5, 1.6 * r * sin(rad(th)) * s + 5, 0.3, seed) - 0.5

    # --- the crushed base: what was a quarter-metre of honeycomb is a ragged, fluted band a hand high, and the floor over it ---
    NB = 48
    P = []
    for j, (rr, zz) in enumerate(((0.78, -0.05), (0.875, 0.035), (0.80, ZB), (0.58, ZB + 0.008), (0.30, ZB))):
        row = []
        for i in range(NB + 1):
            th = 360.0 * (i % NB) / NB
            crush = 0.5 + lump(th, 1.0, 0.9, 41)                    # how hard this side was hit
            flute = ((0.020 if i % 2 else -0.020) if j < 3 else 0.0) + (0.07 * (crush - 0.5) if j < 3 else 0.0)
            row.append(L(th, rr + flute, zz * (1.0 - 0.3 * crush * (zz > 0)) + 0.02 * lump(th, rr, 3.0, 42) * (j >= 2)))
        P.append(row)
    skin(wa, P, keep=lambda j, i: not (j < 2 and i in (9, 22, 23, 37)), fan=L(0, 0, ZB - 0.01))      # (split where it burst)

    # --- the drum that still stands: side wall, deck, and next to it the wall splayed flat and the deck peeled back ---
    def wall_grid(th0, th1, rows):
        return [[L(th, *rows(th, j)) for th in range(th0, th1 + 1, 10)] for j in range(3)]

    def wall_a(th, j):                                              # buckled but upright
        b = lump(th, 1.0, 2.2, 43 + j)
        return RD + (0.0, 0.07 * b, 0.03 * b)[j] + 0.012 * sin(rad(th * 9.0)) * (j == 1), (ZB - 0.01, 0.20, ZD + 0.005)[j] + 0.012 * b * j

    def wall_b(th, j):                                              # pushed out and down, most in the middle of the gap
        s = sin(pi * (th - 80) / 90.0) ** 0.7 if 80 < th < 170 else 0.0
        b = lump(th, 1.0, 2.6, 46 + j)
        return RD + (0.01, 0.05 + 0.11 * s, 0.07 + 0.26 * s)[j] + 0.03 * b, (ZB - 0.01, 0.17 - 0.03 * s, 0.235 - 0.13 * s)[j] + 0.02 * b * j

    torn_sheet(wc, wa, wa, wall_grid(300, 440, wall_a), 0.014, keep=lambda j, i: not (j == 1 and i in (0, 13)), fresh=fresh)
    torn_sheet(wc, wa, wa, wall_grid(80, 170, wall_b), 0.014, keep=lambda j, i: not (j == 1 and i in (0, 5, 8)), fresh=fresh)

    def foil_panel_on(rows, th_c, dth, f0, f1, off, seed, nx=7, ny=3):
        """A panel of gold blanket over a wall, from the fraction f0 to f1 of the wall's height (f0 < 0: it hangs below the
        wall, loose). Crinkled, standing off the wall, its outline torn."""
        rf = random.Random(seed)
        P = []
        for j in range(ny + 1):
            row = []
            for i in range(nx + 1):
                rimp = i in (0, nx) or j in (0, ny)
                if (i in (0, nx) and j in (0, ny) and rf.random() < 0.4) or (rimp and rf.random() < 0.07):
                    row.append(None)
                    continue
                th = th_c + dth * (-1 + 2 * i / nx) + rf.uniform(-0.22, 0.22) * 2 * dth / nx
                f = f0 + (f1 - f0) * j / ny + rf.uniform(-0.22, 0.22) * (f1 - f0) / ny * (1.6 if rimp else 1.0)
                (r0, z0), (r1, z1), (r2, z2) = rows(th, 0), rows(th, 1), rows(th, 2)
                t = max(0.0, min(1.0, f)) * 2
                r_, z_ = (r0 + (r1 - r0) * t, z0 + (z1 - z0) * t) if t <= 1 else (r1 + (r2 - r1) * (t - 1), z1 + (z2 - z1) * (t - 1))
                hang = max(0.0, -f)
                row.append(L(th, r_ + off * (1.0 + 1.6 * rf.random() * (rimp or hang > 0)) + rf.uniform(-0.014, 0.014) + 0.25 * hang,
                             z_ - 0.20 * hang + rf.uniform(-0.008, 0.008)))
            P.append(row)
        torn_sheet(wg, wg, wg, P, 0.004)

    for i, (th_c, dth, f0, f1) in enumerate(((320, 18, -0.12, 0.96), (355, 16, 0.04, 1.0), (391, 19, -0.22, 0.9), (425, 13, 0.0, 0.94))):
        foil_panel_on(wall_a, th_c, dth, f0, f1, 0.02, 3 + i)
    for i, (th_c, dth, f0, f1) in enumerate(((106, 15, 0.0, 0.9), (143, 15, -0.1, 0.85))):
        foil_panel_on(wall_b, th_c, dth, f0, f1, 0.03, 13 + i)

    # the deck that held: a carbon sandwich, buckled, torn along two ragged lines
    RS = (0.33, 0.50, 0.67, RD + 0.012)
    P = [[L(th, r, ZD + 0.05 * lump(th, r, 2.4, 50) * (r / RD) + (0.012 if r > 0.8 else 0.0)) for r in RS] for th in range(300, 441, 10)]
    torn_sheet(wc, wc, wa, P, 0.026, keep=lambda j, i: not ((j == 0 and i in (1, 2)) or (j == 13 and i == 2)), fresh=fresh)
    # the deck that did not: peeled up from the bay and curled back over itself
    P = []
    for th in range(80, 171, 10):
        amax = rad(28.0 + 56.0 * sin(pi * (th - 80) / 90.0))
        r_, z_ = 0.33, ZD
        row = [L(th, r_, z_)]
        for s in range(3):
            a = amax * ((s + 0.5) / 3.0) ** 1.2
            r_ += 0.165 * cos(a)
            z_ += 0.165 * sin(a)
            row.append(L(th + 5.0 * lump(th, s, 1.0, 51), r_ + 0.03 * lump(th, r_, 3.0, 52), z_ + 0.03 * lump(th, r_, 3.0, 53)))
        P.append(row)
    torn_sheet(wc, wa, wa, P, 0.026, keep=lambda j, i: not ((j in (0, 8) and i == 2) or (j == 4 and i == 2)), fresh=fresh)
    # on the deck that held: the stub of an antenna, a reflector dome, a connector box
    disc(alu, 0.045, 0.0, 0.11, 8, ML @ T(*polar(0.62, 62, ZD + 0.01)) @ R('X', 9))
    lathe(alu, dome_profile(0.055, 0.045, 3, 0.0), 8, ML @ T(*polar(0.66, 335, ZD + 0.012)))
    cbox(cfk, (0.16, 0.10, 0.06), (0, 0, 0.03), ML @ T(*polar(0.60, 395, ZD + 0.012)) @ R('Z', 30), c=0.015)

    # --- the equipment bay in the middle: a six-sided box under white blanket, stove in on the side the tanks went ---
    P = []
    for j, zz in enumerate((ZB - 0.01, ZD, 0.47)):
        row = []
        for i in range(13):
            th = 30.0 * i
            stove = math.exp(-(((th - 235.0 + 180.0) % 360.0 - 180.0) / 50.0) ** 2)
            r_ = 0.33 * 0.93 / cos(rad((th % 60.0) - 30.0)) - 0.11 * stove * (0.5 + 0.5 * j) + 0.012 * lump(th, zz * 3, 4.0, 54)
            row.append(L(th, r_, zz - 0.05 * stove * (j == 2) + 0.012 * lump(th, zz, 5.0, 55) * (j == 2)))
        P.append(row)
    skin(ww, P, keep=lambda j, i: not (j == 0 and i in (7,)), fan=L(240, 0.05, 0.43))
    prism(char, ngon(0.22, 6, 0), 0.30, ML, z0=ZB)                  # (what shows through the hole in it)
    # the mast: bent over at the root, a sensor head still on it
    mast = [L(40, 0.10, 0.46), L(42, 0.11, 0.53), L(62, 0.17, 0.56), L(82, 0.31, 0.515)]
    tube(alu, mast, 0.015, 6, round_r=0.04, steps=2)
    cbox(white_k, (0.06, 0.06, 0.08), (0, 0, 0), T(*mast[-1]) @ R('Z', 30) @ R('X', 80), c=0.012)
    disc(alu, 0.03, 0.0, 0.02, 8, ML @ T(*polar(0.10, 40, 0.455)))

    # --- the tanks: one whole under the deck that held, its dome through the deck; one burst under the peeled deck; one thrown clear ---
    tc = L(10, 0.50, 0.275)
    ball(tank, tc, 0.19, 12, 6)
    lathe(alu, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.014), (0.03, 0.02), (0.03, 0.04), (0.0, 0.04)], 8, T(*tc) @ ML.to_3x3().to_4x4() @ R('X', 16) @ T(0, 0, 0.182))
    titanium.append((tc, 0.26))
    tb = L(128, 0.52, 0.27)
    burst_tank(tank, alu, T(*tb) @ ML.to_3x3().to_4x4() @ R('Z', 128) @ R('Y', 62) @ R('Z', 20), 0.19, seed=12, seg=14, split=(215.0, 395.0), gape=30.0, crack=300.0,
               dents=(((0.6, 0.1, 0.75), 46.0, 0.05), ((-0.3, -0.8, -0.4), 38.0, 0.035)), lugs=(60.0, 150.0))
    titanium.append((tb, 0.34))

    # --- the frame that carried the tanks and thrusters, where the side is gone: posts, rafters to the bay, braces; sprung and bent ---
    node = k('aluminium_bare', 40)
    for i, th in enumerate((185, 212, 242, 270, 296)):
        foot, head, hub = L(th, 0.72, ZB), L(th + rng.uniform(-6, 6), 0.74 + 0.16 * rng.random(), ZD - 0.03 * rng.random()), L(th + 4, 0.34, ZD - 0.03)
        ball(node, foot, 0.032, 5, 2)
        if i == 2:                                                  # this bay took the burst: the post is thrown back, the rafter stands up bare
            tip = L(th - 6, 0.60, 0.60)
            tube(alu, [hub, hub.lerp(tip, 0.45) + Vector((0, 0, 0.05)), tip], 0.016, 5, round_r=0.08, steps=2)
            ball(node, tip, 0.03, 5, 2)
            kinked(alu, foot, L(th, 1.0, 0.25) - foot, 0.34, 0.016, seed=91, seg=5, kinks=1, bend=0.7)
            continue
        post = [foot, foot.lerp(head, 0.5) + (head - hub).normalized() * 0.05 * rng.uniform(-1, 1.6), head]
        tube(alu, post, 0.016, 5, round_r=0.07, steps=2)
        ball(node, head, 0.032, 5, 2)
        if i != 4:
            tube(alu, [head, head.lerp(hub, 0.5) + Vector((0, 0, 0.05 * rng.uniform(-1, 1))), hub], 0.014, 5, round_r=0.06, steps=2)     # rafter
        if i < 4:
            tube(alu, [foot, L(th + 14, 0.74, ZD - 0.06)], 0.011, 4)                                                                    # brace
    for th, r_ in ((228, 0.50), (262, 0.56)):                       # avionics boxes loose on the floor
        cbox(cfk, (0.20, 0.13, 0.09), (0, 0, 0.045), ML @ T(*polar(r_, th, ZB + 0.005)) @ R('Z', th + 30) @ R('X', 12), c=0.02)
    for i, th in enumerate((205, 236, 251, 283)):                   # harness: out of the bay, across the floor, over the edge to the ground
        a, b = L(th, 0.26, ZD - 0.08), L(th + 8, 0.60, ZB + 0.03)
        g = L(th + 14 * (i % 2 * 2 - 1), 1.02 + 0.12 * i, 0.0)
        g.z = 0.012
        tube(cfk, [a, a.lerp(b, 0.5) - Vector((0, 0, 0.05)), b, L(th + 10, 0.86, ZB - 0.03), g], 0.009, 4, round_r=0.07, steps=2)
    blob(char, ML @ T(-0.25, -0.35, ZB - 0.03), 0.34, 0.28, 0.07, seed=5, nu=10, pleats=4, rough=0.5)        # slag where the hydrazine burnt

    def thrusters(Mn):
        """A cluster of three: bracket, valves, nozzles."""
        cbox(alu, (0.26, 0.10, 0.06), (0, 0, 0), Mn, c=0.02)
        for dx in (-0.085, 0.0, 0.085):
            lathe(char, [(0.022, -0.03), (0.02, -0.06), (0.05, -0.17), (0.044, -0.17), (0.014, -0.06)], 6, Mn @ T(dx, 0, 0), close=True)

    thrusters(ML @ T(*polar(0.80, 200, ZB + 0.04)) @ R('Z', 200 + 90) @ R('X', -118))           # one still hangs from the edge of the floor

    # --- the side that went, across the ground the way the blast threw it (mostly toward -x, -y) ---
    # No loose piece is a card: each has the thickness of what it was torn from, is snapped or curled, shows what it is
    # made of along its torn edge, and has two colours (its two faces, or bared core, or the end of it that burnt).
    burnt = []                                                      # points of loose pieces that burnt (charred, once turned with the rest)
    honey = []                                                      # (point, tone) on the open honeycomb of the sandwich pieces

    def chunk(M, sz, asp, seed, fold, bare, burn):
        """A piece of the sandwich deck or wall: black skins on four centimetres of pale honeycomb, snapped across; part
        of the upper skin has come away from the core and is rolled back from it."""
        P = scrap(M, sz, sz * asp, 4, 3, seed=seed, crumple=0.10, curl=0.3, fold=fold)
        sandwich_chunk(wc, wa, P, 0.042, peeled=bare, shade=honey, marks=burnt, mark=burn, seed=seed)

    for i, (rr, a, sz, tilt, fold, bare, burn) in enumerate((
            (1.62, 232, 0.31, 24, (0.30, 38), lambda j, i: i < 2 and j > 0, lambda j, i: i >= 3),
            (2.35, 205, 0.27, -14, (-0.2, 24), lambda j, i: i > 2, lambda j, i: i < 1),
            (2.05, 262, 0.28, 34, (0.1, 55), lambda j, i: j == 0 and i < 3, lambda j, i: j >= 3),
            (2.9, 240, 0.20, 10, (0.4, 30), lambda j, i: i == 0, lambda j, i: False))):
        chunk(T(*polar(rr, a, 0.05 + 0.06 * (tilt > 20))) @ R('Z', a + 40 * i) @ R('Y', tilt), sz, 0.7, 20 + i, fold, bare, burn)
    # the wall and its frames: the first of every three is sandwich wall, the others aluminium plate with the ribs that
    # stiffened it standing on its inner face and the outer skin (carbon, or gold blanket still stuck to it) underneath,
    # curled and snapped so that both show
    plates = ((1.25, 188, 0.26, 0.9, 1.3), (1.55, 300, 0.22, 0.8, 1.6), (1.95, 232, 0.30, 0.6, 1.1), (2.55, 276, 0.24, 0.9, 1.8), (2.7, 192, 0.20, 0.7, 1.4),
              (1.3, 258, 0.17, 0.9, 2.0), (3.05, 222, 0.16, 0.8, 1.5), (1.5, 120, 0.20, 0.7, 1.4), (1.7, 20, 0.18, 0.9, 1.7), (2.3, 330, 0.17, 0.8, 1.2),
              (2.6, 100, 0.15, 0.7, 1.9), (1.35, 60, 0.14, 0.9, 1.5))
    for i, (rr, a, sz, asp, curl) in enumerate(plates):
        M = T(*polar(rr, a + rng.uniform(-5, 5), 0.02 + sz * 0.18)) @ R('Z', rng.uniform(0, 360)) @ R('X', rng.uniform(-22, 22)) @ R('Y', rng.uniform(-16, 16))
        end = (0, 4)[i % 2]                                             # the end of it that burnt
        if i % 3 == 0:
            chunk(M, sz * 0.9, asp * 0.75, 40 + i, ((-0.25, 0.2, 0.35, -0.1)[i // 3], 28 + 14 * (i // 3)), lambda j, i_, e=end: abs(i_ - e) >= 3 and j < 2,
                  lambda j, i_, e=end: abs(i_ - e) < 1)
            continue
        P = scrap(M, sz, sz * asp * 0.7, 4, 3, seed=40 + i, crumple=0.2, curl=curl * 1.25, fold=((0.2, -0.3)[i % 2], (34, 62, 48, 76)[i % 4]) if i % 4 != 3 else None)
        torn_sheet(wa, wc if i % 2 else wg, wa, P, 0.011, fresh=fresh)
        sheet_ribs(wa, P, [[(1, c) for c in range(5)], [(2, c) for c in range(5)]] + ([[(r, 2) for r in range(4)]] if sz > 0.17 else []), t=0.011,
                   h=0.016 + 0.05 * sz)
        nrm = sheet_frame(P)[1]
        for q, n in nrm.items():
            if abs(q[1] - end) < 1 + (i % 5 == 1):
                burnt.extend((P[q[0]][q[1]] + n * 0.0055, P[q[0]][q[1]] - n * 0.0055))
    # blanket: gold foil screwed up and caught on things, white cloth in rags (its gold lining underneath), sheets of foil (silvered behind)
    for i, (rr, a, sz) in enumerate(((1.15, 215, 0.13), (1.8, 245, 0.11), (2.45, 225, 0.09), (1.45, 285, 0.10), (2.15, 180, 0.08), (1.25, 150, 0.08), (2.8, 255, 0.07),
                                     (1.75, 340, 0.07), (0.95, 250, 0.10))):
        wad(gold_k, T(*polar(rr, a, sz * 0.22)) @ R('Z', 40 * i), sz, seed=60 + i, subdiv=2 if i < 3 else 1, flat=0.55)
    blob(white_k, T(*polar(1.4, 236, 0.0)) @ R('Z', 20), 0.25, 0.17, 0.085, seed=70, nu=12, pleats=5, rough=0.55)      # a heap of it, and a length flung out flat
    torn_sheet(wg, wg, wg, scrap(T(*polar(1.56, 243, 0.04)) @ R('Z', 100), 0.11, 0.08, 3, 2, seed=72, crumple=0.5, curl=1.3), 0.004)
    torn_sheet(ww, wg, ww, scrap(T(*polar(2.2, 252, 0.05)) @ R('Z', 70), 0.17, 0.12, 6, 3, seed=71, crumple=0.6, curl=1.5, fold=(0.2, 60)), 0.014)
    for i, (rr, a, sz) in enumerate(((1.9, 196, 0.10), (1.1, 100, 0.09), (2.6, 218, 0.08), (1.55, 268, 0.07))):
        wad(white_k, T(*polar(rr, a, sz * 0.22)) @ R('Z', 55 * i), sz, seed=170 + i, subdiv=1, flat=0.6)
    torn_sheet(wg, wa, wg, scrap(T(*polar(1.72, 222, 0.06)) @ R('Z', 15), 0.24, 0.17, 6, 4, seed=75, crumple=0.5, curl=0.9, fold=(0.1, 50)), 0.004)
    torn_sheet(wg, wa, wg, scrap(T(*polar(2.5, 292, 0.05)) @ R('Z', 80), 0.18, 0.13, 5, 3, seed=76, crumple=0.5, curl=1.1, fold=(-0.2, 35)), 0.004)
    # struts, a ring segment, the other thruster clusters
    for i, (rr, a) in enumerate(((1.7, 214), (2.2, 268), (1.5, 185), (2.6, 235), (2.1, 300), (1.2, 125), (2.75, 48))):
        kinked(alu, polar(rr, a, 0.02), polar(1.0, a + 80 + 40 * i, 0.15 * (i % 2)), 0.40 + 0.14 * (i % 4), 0.015 + 0.003 * (i % 2),
               seed=130 + i, seg=5, kinks=1 + i % 2, bend=0.6)
        ball(node, polar(rr, a, 0.03), 0.028, 5, 2)
    lathe(alu, [(0.50, 0.0), (0.53, 0.0), (0.53, 0.04), (0.50, 0.04)], 9, T(-1.25, -1.85, 0.01) @ R('X', 5), arc=rad(150), close=True, caps=True)   # part of a separation ring
    thrusters(T(*polar(1.95, 248, 0.07)) @ R('Z', 130) @ R('X', 76))
    thrusters(T(*polar(1.05, 172, 0.07)) @ R('Z', 20) @ R('X', 100))
    for i in range(18):                                             # small stuff: fittings, crumbs of sandwich, bits of wall
        rr, a = 0.95 + 2.2 * rng.random() ** 0.8, rng.uniform(0, 360) if i % 3 == 0 else rng.uniform(170, 310)
        lies = TURN @ Vector(polar(rr, a))
        if 0.6 < lies.x < 2.9 and 1.0 < lies.y < 3.2:
            continue                                                # (not on the canopy)
        Mc = T(*polar(rr, a, 0.012)) @ R('Z', rng.uniform(0, 360)) @ R('X', rng.uniform(-30, 30))
        sz = 0.05 + 0.08 * rng.random()
        if i % 3 == 0:                                              # a bracket: an angle of thick plate with a gusset in it, and its bolt
            la, lb, th, wd = sz * 1.4, sz * 1.15, 0.011, sz * 1.0
            prism(alu, [(0.0, 0.0), (la, 0.0), (la, th), (th, th), (th, lb), (0.0, lb)], wd, Mc @ T(0, 0, 0.004) @ R('X', 90))
            prism(alu, [(th, th), (la * 0.85, th), (th, lb * 0.85)], 0.009, Mc @ T(0, 0, 0.004) @ R('X', 90))
            bolt(cfk, 0.011, 0.007, Mc @ T(la * 0.7, wd * 0.28, th + 0.004), 5)
        elif i % 3 == 1:                                            # a crumb of sandwich: black skin, pale core
            shard(wc, Mc @ T(0, 0, 0.004), sz, t=0.034, seed=200 + i, n=5, crumple=0.12, back=wa, simple=True)
        else:                                                       # a length of channel from the frame, its ends sheared off askew
            cw, ch, ct, cl = 0.03 + sz * 0.25, 0.02 + sz * 0.2, 0.005, sz * 2.4
            Mch = Mc @ T(0, 0, 0.002) @ R('X', 90)                    # (the section is in its XY, the length along its Z)
            for v in prism(alu, [(-cw, 0.0), (cw, 0.0), (cw, ch), (cw - ct, ch), (cw - ct, ct), (-cw + ct, ct), (-cw + ct, ch), (-cw, ch)], cl, Mch):
                q = Mch.inverted() @ v.co
                v.co = Mch @ Vector((q.x + 0.7 * q.z * (1 if i % 2 else -1), q.y, q.z))


    # All of the above was laid out with the blast going toward -x, -y. It is turned as one, lander and thrown wreckage:
    # seen from the side of the site that the back shell and the canopy leave clear, the standing arc of the drum is then
    # on the right and the open side on the left, and the wreckage fans away toward the third tank.
    for bm in list(k.b.values()) + list(w.b.values()):
        bmesh.ops.transform(bm, matrix=TURN, verts=bm.verts[:])
    fresh = [TURN @ p for p in fresh]
    charred += [TURN @ p for p in burnt]
    honey = [(TURN @ p, tone) for p, tone in honey]
    titanium = [(TURN @ c, r_) for c, r_ in titanium]
    thrown = Vector((-2.28, 0.32, 0.176))                           # the third tank, thrown clear
    burst_tank(tank, alu, T(*thrown) @ R('Z', 205) @ R('X', 66), 0.19, seed=7, seg=14, split=(-52.0, 232.0), gape=36.0, crack=84.0,
               dents=(((0.75, -0.55, 0.35), 50.0, 0.055), ((-0.5, 0.3, -0.8), 44.0, 0.04), ((0.0, -1.0, 0.0), 30.0, 0.022)), lugs=(250.0, 290.0), bolts=True)
    titanium.append((thrown, 0.34))

    # --- a slab of the back shell on its side: white tiles outside, bare structure inside, a blanket hanging out of it ---
    Mb = T(2.25, 0.25, -0.57) @ R('Z', 200) @ R('Y', -52) @ R('Z', -52)
    P = []
    for j in range(5):
        f = j / 4.0
        row = []
        for i in range(12):
            a = rad(8.0 * i)
            r_ = 1.18 - 0.72 * f + 0.03 * (noise3(i * 0.7, j * 0.9, 0.3, 80) - 0.5) * 2
            ends = 0.028 if i in (0, 11) or j in (0, 4) else 0.008
            row.append(Mb @ Vector((r_ * cos(a) + rng.uniform(-ends, ends), r_ * sin(a) + rng.uniform(-ends, ends), 0.80 * f + rng.uniform(-ends, ends) * 0.6)))
        P.append(row)
    shell_keep = lambda j, i: not ((j == 3 and i == 0) or (j == 0 and i == 10))
    torn_sheet(wc, wa, wc, P, 0.03, keep=shell_keep, fresh=charred)
    for j in range(4):                                              # its cork tiles, white-painted: each stands a little proud, some have gone
        for i in range(11):
            if not shell_keep(j, i) or _hash(i, j, 5, 83) < 0.14:
                continue
            q = (P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i])
            mid = (q[0] + q[1] + q[2] + q[3]) / 4
            n = ((q[1] - q[0]).cross(q[3] - q[0]) + (q[3] - q[2]).cross(q[1] - q[2])).normalized()
            tile = [mid + (c - mid) * 0.92 + n * (0.015 + 0.007) for c in q]
            ww.faces.new([ww.verts.new(c) for c in tile])
            if j in (0, 3) or i in (0, 10):
                charred.extend(tile[:2] if j == 0 else tile[2:] if j == 3 else (tile[0], tile[3]) if i == 0 else (tile[1], tile[2]))
    lathe(alu, [(0.47, 0.80), (0.47, 0.86), (0.42, 0.86), (0.42, 0.78)], 6, Mb, arc=rad(88), close=True, caps=True)
    torn_sheet(wg, wg, wg, scrap(T(2.02, 0.62, 0.05) @ R('Z', 40), 0.26, 0.2, 4, 3, seed=81, crumple=0.34, curl=0.6), 0.004)
    wad(gold_k, T(1.82, 0.20, 0.03), 0.11, seed=82, subdiv=2)

    # --- the parachute: canopy collapsed in a heap, torn, lines trailing back to the shell ---
    cloth = k(('blanket_white', 'suit_orange'), 50)
    Mcan = T(1.15, 2.05, 0.0) @ R('Z', 25)
    rim = _canopy(cloth, Mcan, 1.25, 0.80, 0.24, seed=6, nu=36)
    conf = Vector((2.05, 0.75, 0.10))
    lines = k('blanket_white', 60)
    for i in range(0, 36, 3):
        if 0.05 < i / 36 < 0.23 or 0.41 < i / 36 < 0.53 or 0.61 < i / 36 < 0.80:
            continue
        p = rim[i].co.copy()
        mid = p.lerp(conf, 0.5) + Vector((rng.uniform(-0.15, 0.15), rng.uniform(-0.15, 0.15), 0))
        mid.z = 0.008
        sweep(lines, [Vector((p.x, p.y, 0.02)), Vector((p.x, p.y, 0.01)).lerp(mid, 0.5), mid, mid.lerp(conf, 0.6), conf], circ(0.006, 3), caps=False)
    tube(lines, [conf, conf + Vector((0.10, -0.12, 0.10)), Vector((2.22, 0.42, 0.40))], 0.016, 5)
    ball(node, (2.05, 0.75, 0.10), 0.03, 5, 2)

    # --- rays of soil thrown out from under the dust: lines of pale clods across the soot ---
    # A clod is a lump with a crown and flanks that run down into the ground, most of as high as it is wide: a flat
    # hull of a few random points lay on the soot like a scrap of card.
    ej = k('ejecta', 62)
    for i in range(7):
        th = (TAU * i + pi / 2 - 2.1) / 7.0                          # where _blast_ray peaks
        rr = 1.45 + 0.25 * rng.random()
        for m in range(4):
            rr += rng.uniform(0.14, 0.72)
            c = Vector(polar(rr, math.degrees(th) + rng.uniform(-3.5, 3.5), 0.012))
            sz = (0.095 - 0.013 * m) * rng.uniform(0.7, 1.25)
            # (a rounded crown, a waist and a foot, each ring uneven: with a single point for a top and four sides it was a
            # little pyramid, and twenty-eight of them were a board game)
            n, a0 = (7 if m < 2 else 6), rng.uniform(0.0, TAU)
            lean = Vector((rng.uniform(-0.25, 0.25) * sz, rng.uniform(-0.25, 0.25) * sz, 0.0))
            hgt = sz * rng.uniform(0.28, 0.6)                                # (low and spread: taller, they were gumdrops)

            def ring(rad, z, half=0.0, shift=1.0):
                return [ej.verts.new(c + lean * shift + Vector((cos(a0 + TAU * (q + half) / n), sin(a0 + TAU * (q + half) / n), 0.0)) * (rad * rng.uniform(0.6, 1.3))
                                     + Vector((0, 0, z * rng.uniform(0.85, 1.1)))) for q in range(n)]
            crown, waist, foot = ring(sz * 0.38, hgt, 0.5), ring(sz * 0.82, hgt * 0.55, 0.0, 0.5), ring(sz * 1.2, -0.02, 0.5, 0.0)
            top = ej.verts.new(c + lean + Vector((0, 0, hgt * 1.08)))
            for q in range(n):
                q2 = (q + 1) % n
                ej.faces.new((top, crown[q], crown[q2]))
                ej.faces.new((crown[q], waist[q2], crown[q2]))
                ej.faces.new((crown[q], waist[q], waist[q2]))
                ej.faces.new((waist[q], foot[q], waist[q2]))
                ej.faces.new((foot[q], foot[q2], waist[q2]))

    # everything lies ON the blast patch: lift each vertex by the height of the dish under it
    for bm in list(k.b.values()) + list(w.b.values()):
        for v in bm.verts:
            v.co.z += _blast_ground(v.co.x, v.co.y)
    fresh = [p + Vector((0.0, 0.0, _blast_ground(p.x, p.y))) for p in fresh]
    charred = [p + Vector((0.0, 0.0, _blast_ground(p.x, p.y))) for p in charred]
    honey = [(p + Vector((0.0, 0.0, _blast_ground(p.x, p.y))), tone) for p, tone in honey]
    titanium = [(c + Vector((0.0, 0.0, _blast_ground(c.x, c.y))), r_) for c, r_ in titanium]
    burst = TURN @ L(238, 0.35, 0.2)                                # where the tanks went
    burst.z += _blast_ground(burst.x, burst.y)
    _scorch_dish(k('ground_dust', 60))
    k.flush()
    w.flush()
    collapse(root)
    bake_ao(root, samples=24, distance=0.7)

    # Soot and tone, per vertex. The dish is the ground's own colour at its hem and fused black inside the rim, with dark
    # rays and paler ones of thrown soil. The wreckage: black where the hydrazine burnt (round the burst, and low down
    # inside), smeared further out, clean metal, gold and white beyond; torn edges stay bright.
    from mathutils.kdtree import KDTree
    marks = [None] * len(fresh) + [0.9] * len(charred) + [(tone,) for _, tone in honey]     # None: bright metal; a number: at least that sooted;
    kd = KDTree(len(marks))                                                                  # (tone,): open honeycomb of that tone
    for i, p in enumerate(fresh + charred + [p for p, _ in honey]):
        kd.insert(p, i)
    kd.balance()
    for o in [root] + lib._descendants(root):
        if o.type != 'MESH':
            continue
        attr = o.data.color_attributes.get('Col')
        mw = o.matrix_world
        names = [ms.name for ms in o.data.materials]
        mat_of = {}
        for pl in o.data.polygons:
            for vi in pl.vertices:
                mat_of[vi] = names[pl.material_index]
        for i, v in enumerate(o.data.vertices):
            p = mw @ v.co
            name = mat_of.get(i, '')
            d = sqrt(p.x * p.x + p.y * p.y)
            th = math.atan2(p.y, p.x)
            n = noise3(p.x * 1.7 + 3, p.y * 1.7 + 3, p.z * 2.5, 21)
            smear = noise3(p.x * 3.1 + 8, p.y * 3.1 + 2, p.z * 4.0, 22)
            c = attr.data[i].color
            if name.startswith('ground_dust'):
                f = d / _blast_radius(th)
                ray = 0.10 * abs(sin(5.5 * th + 0.7)) ** 3                 # dark rays reach further out
                burn = max(0.0, min(1.0, (0.86 + ray - f) / 0.40)) ** 0.8 * (0.82 + 0.36 * n)
                burn = max(burn, smooth01(1.75, 1.2, d))                   # inside the rim: fused black
                burn *= 1.0 - 0.85 * _blast_ray(th) * smooth01(0.34, 0.46, f)      # thrown soil lies over the soot
                burn = max(0.0, min(1.0, burn))
                # (soot over soil is a dark grey-brown, patchy where the wind has been at it: at nine tenths black it was a
                # hole airbrushed into the picture)
                burn *= 0.80 + 0.20 * smear
                attr.data[i].color = (c[0] * (1 - 0.76 * burn), c[1] * (1 - 0.72 * burn), c[2] * (1 - 0.64 * burn), 1.0)
                continue
            if name == 'ejecta':
                attr.data[i].color = (c[0] * (0.82 + 0.18 * smear), c[1] * (0.82 + 0.18 * smear), c[2] * (0.82 + 0.18 * smear), 1.0)
                continue
            # how sooted: by the burst, underneath and low down, in smears; thinning with distance from the crater
            near = smooth01(0.72, 0.18, (p - burst).length) * (0.5 + 0.5 * smooth01(0.44, 0.14, p.z - _blast_ground(p.x, p.y)))
            low = smooth01(0.12, 0.0, p.z - _blast_ground(p.x, p.y)) * smooth01(2.6, 0.9, d)
            soot = max(near * (0.60 + 0.6 * n), 0.5 * low, smooth01(0.55, 0.9, smear) * smooth01(3.0, 1.0, d) * 0.6)
            soot = max(0.0, min(1.0, soot + 0.06 * smooth01(3.2, 0.8, d)))
            hit = kd.find(p)
            cells = 1.0
            if hit[2] < 0.004:
                m = marks[hit[1]]
                if isinstance(m, tuple):
                    cells, soot = m[0], soot * 0.6
                else:
                    soot = soot * 0.15 if m is None else max(soot, m * (0.7 + 0.5 * smear))
            f = ((1.0 - soot) * (0.84 + 0.16 * smear) + soot * 0.08) * cells
            tone = (1.0, 1.0, 1.0)
            if name == 'aluminium_bare' and any((p - tcn).length < tr for tcn, tr in titanium):
                tone = (0.80, 0.77, 0.73)                                  # the tanks are titanium
            elif name == 'gold_foil':
                tone = (1.0, 0.92 - 0.25 * soot, 0.85 - 0.45 * soot)       # scorched foil goes brown before it goes black
                f = max(f, 0.22)
            elif name == 'suit_orange':
                tone = (0.80, 0.74, 0.70)                                  # the canopy's colour has faded
            elif name == 'blanket_white':
                f *= 0.90 * (0.86 + 0.14 * noise3(p.x * 7.0, p.y * 7.0, p.z * 7.0, 23))   # (never a clean, even white: that burns out in the sun)
            attr.data[i].color = (c[0] * f * tone[0], c[1] * f * tone[1], c[2] * f * tone[2], 1.0)
    anchor('col_body', root, loc=(0, 0, 0), radius=1.25)
    anchor('col_backshell', root, loc=(2.2, 0.3, 0), radius=0.75)
    info = export_model(root, 'schiaparelli_wreck', ao=False, do_collapse=False)
    report_parts(root)
    return info


# === END OF MODELS ===
BUILDERS = {}
for _n, _f in list(globals().items()):
    if _n.startswith('build_') and callable(_f):
        BUILDERS[_n[6:]] = _f
ORDER = ['pathfinder', 'viking', 'mars3', 'beagle2', 'mer', 'phoenix', 'insight', 'msl', 'm2020', 'ingenuity', 'zhurong',
         'schiaparelli_wreck']

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if not a.startswith('-')] or [n for n in ORDER if n in BUILDERS]
    results = []
    for name in names:
        if name not in BUILDERS:
            raise SystemExit(f'unknown model {name}; have {sorted(BUILDERS)}')
        reset_scene()
        results.append(BUILDERS[name]())
    for r in results:
        print(json.dumps(r))
