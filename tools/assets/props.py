"""
Stranded II deployables and props (Family E in SPEC.md), authored headlessly in Blender through
tools/assets/lib.py:

    greenhouse  solar_kit  beacon  o2_cache  supply_pod  rtg  debris_a  debris_b  debris_c
    regolith_pile  ice_outcrop  uplink_pad

Run:   /home/user/blender-venv/bin/python tools/assets/props.py [names ...]     (no names = all)
Look:  node tools/assets/preview.mjs greenhouse solar_kit ...
       PROPS_FAST=1 skips the ambient-occlusion bake while blocking a model out.
       TRIS=1 prints the triangle count of every helper mesh before modifiers.

Layout of this file
  1. helpers lib.py lacks: primitives placed by a matrix with their winding set by construction
     (so the models also draw correctly with back-face culling), sweeps, a Kit that collects
     geometry into one mesh per material, and finish() = collapse + occlusion bake + touch-ups
  2. one build_<name>() per model, in the order above, each under its own banner

Axes follow SPEC.md: metres, Z up, the FRONT of a model faces -Y, origin on the ground.
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402  (imports bpy before bmesh/mathutils)
from lib import *  # noqa: E402,F401,F403

cos, sin, pi, sqrt = math.cos, math.sin, math.pi, math.sqrt
FAST = bool(os.environ.get('PROPS_FAST'))


# ==============================================================================================
# Helpers
# ==============================================================================================
def T(x=0.0, y=0.0, z=0.0):
    return Matrix.Translation((x, y, z))


def R(axis, deg):
    return Matrix.Rotation(rad(deg), 4, axis)


def S(x, y=None, z=None):
    y = x if y is None else y
    z = x if z is None else z
    return Matrix.Diagonal((x, y, z, 1.0))


AX = {'X': Matrix.Rotation(pi / 2, 4, 'Y'), 'Y': Matrix.Rotation(-pi / 2, 4, 'X'), 'Z': Matrix.Identity(4)}
YZX = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))    # prism outline (y, z), extruded along +x


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


def _mk(bm, pts, M=None):
    if M is None:
        return [bm.verts.new(p) for p in pts]
    return [bm.verts.new(M @ Vector(p)) for p in pts]


def moved(bm, verts, M):
    bmesh.ops.transform(bm, matrix=M, verts=verts)
    return verts


_BOX_Q = ((3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7))


def box(bm, size, loc=(0, 0, 0), M=None):
    """Axis-aligned box in the local frame of M."""
    sx, sy, sz = size[0] / 2, size[1] / 2, size[2] / 2
    x, y, z = loc
    v = _mk(bm, [(x - sx, y - sy, z - sz), (x + sx, y - sy, z - sz), (x + sx, y + sy, z - sz), (x - sx, y + sy, z - sz),
                 (x - sx, y - sy, z + sz), (x + sx, y - sy, z + sz), (x + sx, y + sy, z + sz), (x - sx, y + sy, z + sz)], M)
    for q in _BOX_Q:
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
    for q in _BOX_Q:
        bm.faces.new([v[i] for i in q])
    return v


def circ(r, n, phase=0.0, ry=None):
    ry = r if ry is None else ry
    return [(r * cos(phase + TAU * i / n), ry * sin(phase + TAU * i / n)) for i in range(n)]


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


def rect(w, h):
    return [(w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2), (-w / 2, -h / 2)]


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


def plate(bm, w, h, t, r=0.02, M=None, n=2):
    """Rounded-rectangle plate lying in local XY, sitting on z=0, thickness t."""
    return prism(bm, rrect(w, h, r, n), t, M, z0=0.0, cap_bottom=False)


def quad(bm, p0, p1, p2, p3, M=None):
    """One quad; the normal follows the right-hand rule over p0..p3."""
    vs = _mk(bm, [p0, p1, p2, p3], M)
    bm.faces.new(vs)
    return vs


def poly(bm, pts, M=None):
    vs = _mk(bm, pts, M)
    if len(vs) >= 3:
        bm.faces.new(vs)
    return vs


def decal(bm, w, h, M=None):
    """A flat rectangle w x h in local XY at z=0 facing +Z."""
    return quad(bm, (-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0), M)


def lathe(bm, profile, seg=24, M=None, arc=TAU, close=False, phase=0.0, caps=False):
    """Revolve [(radius, height)] about local Z. Walk the profile with the solid on your LEFT
    (bottom faces go outward, outer surfaces go upward, top faces go inward) and the normals
    come out right. close=True joins the last point back to the first (a ring section);
    caps=True closes the two ends of a partial arc of such a section."""
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
            q = []
            for v in (a[k], b[k], b[k2], a[k2]):
                if v not in q:
                    q.append(v)
            if len(q) >= 3:
                bm.faces.new(q)
    if caps and close and not full:
        bm.faces.new(cols[0])
        bm.faces.new(list(reversed(cols[-1])))
    return [v for c in cols for v in c]


def dome_profile(r, height, steps=5, z0=0.0, up=True):
    """Points of an elliptical dome from the rim (r, z0) to the pole, as (radius, height)."""
    out = []
    for i in range(steps + 1):
        a = (pi / 2) * i / steps
        out.append((r * cos(a) if i < steps else 0.0, z0 + (height * sin(a) if up else -height * sin(a))))
    return out


def tank_profile(r, h, dome=None, n=4, z0=0.0):
    """Lathe profile of a pressure vessel from z0 to z0 + h with domed ends (solid on the left)."""
    dome = r * 0.6 if dome is None else dome
    pr = [(0.0, z0)]
    for i in range(1, n + 1):
        a = (pi / 2) * i / n
        pr.append((r * sin(a), z0 + dome * (1 - cos(a))))
    for i in range(n, 0, -1):
        a = (pi / 2) * i / n
        pr.append((r * sin(a), z0 + h - dome * (1 - cos(a))))
    pr.append((0.0, z0 + h))
    return pr


def sweep(bm, pts, profile, up=(0, 0, 1), closed=False, caps=True, scales=None, M=None):
    """Sweep a counter-clockwise 2D profile [(u, v)] along a polyline. v points along `up`
    (made perpendicular to the path), u = direction x up. Corners are mitred."""
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


def spline(points, n=4):
    """Catmull-Rom curve through the points (hoses, cables)."""
    pts = [Vector(p) for p in points]
    P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t))
    out.append(pts[-1])
    return out


def sag(p0, p1, drop=0.1, n=6):
    """A hanging cable between two points."""
    p0, p1 = Vector(p0), Vector(p1)
    return [p0.lerp(p1, i / n) - Vector((0, 0, drop * 4 * (i / n) * (1 - i / n))) for i in range(n + 1)]


def tube(bm, pts, r=0.02, seg=8, round_r=0.0, caps=True, closed=False, M=None, up=(0, 0, 1), radii=None):
    """Round tube along a polyline, optionally with filleted corners. `radii` scales r per point."""
    if round_r > 0:
        pts = fillet(pts, round_r)
    return sweep(bm, pts, circ(r, seg), up=up, caps=caps, closed=closed, M=M, scales=radii)


def hose(bm, pts, r=0.015, seg=6, n=4, M=None, caps=True):
    """A flexible hose through the points."""
    return sweep(bm, spline(pts, n), circ(r, seg), caps=caps, M=M)


def beam(bm, a, b, w, h, up=(0, 0, 1), c=0.0, M=None, caps=True):
    """Straight box (or chamfered) beam from a to b: w across, h along `up`."""
    return sweep(bm, [a, b], chamf(w, h, c) if c > 0 else rect(w, h), up=up, M=M, caps=caps)


def bolt(bm, r=0.012, h=0.008, M=None, seg=6):
    """Hex bolt head sitting on local z=0."""
    ring0 = _mk(bm, [(r * cos(TAU * i / seg), r * sin(TAU * i / seg), 0) for i in range(seg)], M)
    ring1 = _mk(bm, [(r * cos(TAU * i / seg), r * sin(TAU * i / seg), h) for i in range(seg)], M)
    for i in range(seg):
        bm.faces.new((ring0[i], ring0[(i + 1) % seg], ring1[(i + 1) % seg], ring1[i]))
    bm.faces.new(ring1)


def bolt_circle(bm, radius, count, r=0.012, h=0.008, M=None, phase=0.0, seg=6):
    M = M or Matrix.Identity(4)
    for i in range(count):
        a = phase + TAU * i / count
        bolt(bm, r, h, M @ T(radius * cos(a), radius * sin(a), 0), seg)


def handle(bm, a, b, standoff, r=0.012, seg=6, normal=(1, 0, 0), M=None):
    """A grab handle: a bar between a and b held `standoff` off the surface along `normal`."""
    a, b, n = Vector(a), Vector(b), Vector(normal).normalized()
    tube(bm, [a, a + n * standoff, b + n * standoff, b], r, seg, round_r=standoff * 0.7, M=M)


def torus(bm, R_, r, seg=16, ring_seg=6, M=None, arc=TAU, phase=0.0):
    """Torus about local Z (a closed ring section revolved)."""
    return lathe(bm, [(R_ + r * cos(TAU * j / ring_seg), r * sin(TAU * j / ring_seg)) for j in range(ring_seg)],
                 seg, M, arc=arc, close=True, phase=phase, caps=True)


def rock(bm, r, loc=(0, 0, 0), seed=0, scale=(1, 1, 1), subdiv=1, rough=0.22, M=None, spin=True):
    """An irregular stone: an icosphere with its vertices pushed in and out."""
    rng = random.Random(seed)
    vs = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)['verts']
    for v in vs:
        d = v.co.normalized()
        k = r * (1.0 + rough * (rng.random() * 2 - 1))
        v.co = Vector((d.x * k * scale[0], d.y * k * scale[1], d.z * k * scale[2]))
    m = T(*loc)
    if spin:
        m = m @ Euler((rng.uniform(-0.4, 0.4), rng.uniform(-0.4, 0.4), rng.uniform(0, TAU))).to_matrix().to_4x4()
    if M is not None:
        m = M @ m
    bmesh.ops.transform(bm, matrix=m, verts=vs)
    return vs


def hull(bm, pts, M=None):
    """Convex hull of a point cloud (angular shards, blocks). Outward normals."""
    vs = _mk(bm, pts, M)
    res = bmesh.ops.convex_hull(bm, input=vs)
    junk = list({e for e in res.get('geom_interior', []) + res.get('geom_unused', []) if isinstance(e, bmesh.types.BMVert)})
    if junk:
        bmesh.ops.delete(bm, geom=junk, context='VERTS')
    faces = [f for f in res['geom'] if isinstance(f, bmesh.types.BMFace)]
    c = sum((Vector(p) for p in pts), Vector()) / len(pts)
    if M is not None:
        c = M @ c
    for f in faces:
        f.normal_update()
        if f.normal.dot(f.calc_center_median() - c) < 0:
            f.normal_flip()
    return faces


def back_faces(bm, faces=None, gap=0.0008):
    """Give open sheet geometry a back: a reversed copy of every face a hair behind it. The game
    draws opaque surfaces front-face only, so a single sheet of foil or torn metal would vanish
    when seen from behind."""
    bm.normal_update()
    faces = list(bm.faces) if faces is None else list(faces)
    twin = {}
    for f in faces:
        vs = []
        for v in reversed(f.verts):
            if v not in twin:
                twin[v] = bm.verts.new(v.co - v.normal * gap)
            vs.append(twin[v])
        bm.faces.new(vs)


def text_mesh(text, size=0.1, res=1):
    """Stencil lettering as flat geometry (the built-in Blender font), centred, facing +Z."""
    cu = bpy.data.curves.new('txt', 'FONT')
    cu.body, cu.size, cu.resolution_u = text, size, res
    cu.align_x, cu.align_y = 'CENTER', 'CENTER'
    ob = bpy.data.objects.new('txt', cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)
    return me


def text(bm, s, size, M, res=1):
    """Lettering lying in the local XY plane of M, readable from +Z."""
    n0 = len(bm.verts)
    f0 = len(bm.faces)
    me = text_mesh(s, size, res)
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    vs = bm.verts[n0:]
    bmesh.ops.transform(bm, matrix=M, verts=vs)
    zdir = (M.to_3x3() @ Vector((0, 0, 1))).normalized()
    for f in bm.faces[f0:]:
        f.normal_update()
        if f.normal.dot(zdir) < 0:
            f.normal_flip()
    return vs


def clip_poly(pts, n, d):
    """Keep the part of a convex 3D polygon where n . p >= d."""
    n = Vector(n)
    out = []
    for i in range(len(pts)):
        p, q = pts[i], pts[(i + 1) % len(pts)]
        sp, sq = n.dot(p) - d, n.dot(q) - d
        if sp >= 0:
            out.append(p)
        if (sp >= 0) != (sq >= 0):
            out.append(p.lerp(q, sp / (sp - sq)))
    return out


def clip_convex2(poly_, clip):
    """Sutherland-Hodgman: clip a 2D polygon by a convex counter-clockwise polygon."""
    out = list(poly_)
    for i in range(len(clip)):
        ax, ay = clip[i]
        bx, by = clip[(i + 1) % len(clip)]
        inp, out = out, []
        if not inp:
            break

        def side(p):
            return (bx - ax) * (p[1] - ay) - (by - ay) * (p[0] - ax)
        for j in range(len(inp)):
            p, q = inp[j], inp[(j + 1) % len(inp)]
            sp, sq = side(p), side(q)
            if sp >= 0:
                out.append(p)
            if (sp >= 0) != (sq >= 0):
                t = sp / (sp - sq)
                out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))


def hash01(*k):
    """Deterministic pseudo-random number in 0..1 from a few numbers."""
    h = 0.0
    for i, v in enumerate(k):
        h += v * (12.9898 + 78.233 * i)
    return (math.sin(h) * 43758.5453) % 1.0


def noise3(p, scale=1.0, seed=0.0):
    """Cheap smooth value noise in -1..1 (three sines), enough for wrinkles and mounds."""
    x, y, z = p[0] * scale, p[1] * scale, p[2] * scale
    return (sin(x * 1.7 + seed) * cos(y * 2.3 - seed * 0.7) + sin(y * 1.3 + z * 1.9 + seed * 1.3) * 0.6
            + cos(x * 3.1 - z * 2.7 + seed * 0.4) * 0.4) / 2.0


class Kit:
    """Collects geometry into buckets, one per material (and bevel width / smoothing angle), so a
    prop made of two hundred pieces still costs a handful of meshes. Every primitive above is
    available as a method that takes the material name first:  K.box('steel', size, loc, M)."""
    SMOOTH = {'tube': 75.0, 'hose': 75.0, 'torus': 75.0, 'rock': 30.0, 'quad': 30.0, 'poly': 30.0, 'decal': 30.0,
              'text': 30.0, 'hull': 20.0}

    def __init__(self, name, parent, M=None):
        self.name, self.parent, self.M = name, parent, M
        self.b = {}

    def bm(self, material, bevel=0.0, smooth=38.0, seg=1):
        key = (material, round(bevel, 4), smooth, seg)
        if key not in self.b:
            self.b[key] = bm_new()
        return self.b[key]

    def finish(self):
        made = []
        for i, ((m, bevel, smooth, seg), bm) in enumerate(self.b.items()):
            if not bm.verts:
                bm.free()
                continue
            if self.M is not None:
                bmesh.ops.transform(bm, matrix=self.M, verts=bm.verts[:])
                if self.M.determinant() < 0:
                    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
            if os.environ.get('TRIS'):
                print(f'    {self.name + "." + m:28s} {sum(len(f.verts) - 2 for f in bm.faces):6d}')
            o = mesh_obj(f'{self.name}.{m}.{i}', bm, m, parent=self.parent, bevel=bevel, bevel_segments=seg,
                         smooth_angle=smooth)
            made.append(o)
        self.b = {}
        return made


def _kit_method(fn):
    def method(self, material, *a, bevel=0.0, smooth=None, bseg=1, **kw):
        sm = Kit.SMOOTH.get(fn.__name__, 38.0) if smooth is None else smooth
        return fn(self.bm(material, bevel, sm, bseg), *a, **kw)
    method.__name__ = fn.__name__
    return method


for _fn in (box, taper_box, prism, plate, quad, poly, decal, lathe, sweep, tube, hose, beam, bolt, bolt_circle,
            handle, torus, rock, hull, text):
    setattr(Kit, _fn.__name__, _kit_method(_fn))


def _descend(o):
    return lib._descendants(o)


def report_parts(root):
    """Triangles per part node (after the helpers were collapsed into their parts)."""
    rows = []
    for o in [root] + _descend(root):
        if o.type == 'MESH':
            rows.append((o.parent.name if o.parent else o.name, sum(len(p.vertices) - 2 for p in o.data.polygons),
                         len(o.data.materials)))
    print('  parts:', ', '.join(f'{n}={t} ({m} mat)' for n, t, m in rows))


def touch_up(root, flat=None, soften=None, tint=None):
    """Adjust the baked occlusion (stored per vertex in 'Col').
    flat   {material: value}   replace it (glass and lamps should not carry soot-like shading)
    soften {material: k}       pull it toward white by the factor k (large soft surfaces)
    tint   fn(co, material, ao) -> new value, an (r, g, b) multiplier, or None: paint scorching,
           damp soil, tile tones, dirt frozen into ice. The game multiplies this colour into the
           material's, so a tinted value stains the surface as well as shading it."""
    for o in [root] + _descend(root):
        if o.type != 'MESH':
            continue
        me = o.data
        attr = me.color_attributes.get('Col')
        if attr is None:
            attr = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for d in attr.data:
                d.color = (1.0, 1.0, 1.0, 1.0)
            me.color_attributes.active_color = attr
        names = [m.name if m else '' for m in me.materials]
        mw = o.matrix_world
        done = set()
        for p in me.polygons:
            name = names[p.material_index] if names else ''
            for vi in p.vertices:
                if vi in done:
                    continue
                done.add(vi)
                a = attr.data[vi].color[0]
                if flat and name in flat:
                    a = flat[name]
                if soften and name in soften:
                    a = 1.0 - (1.0 - a) * soften[name]
                rgb = None
                if tint:
                    b = tint(mw @ me.vertices[vi].co, name, a)
                    if isinstance(b, (tuple, list)):
                        rgb = b
                    elif b is not None:
                        a = b
                if rgb is None:
                    rgb = (a, a, a)
                attr.data[vi].color = (*(max(0.0, min(1.0, c)) for c in rgb), 1.0)


LIGHTS_FLAT = {'light_white': 1.0, 'light_green': 1.0, 'light_red': 1.0, 'light_amber': 1.0, 'light_blue': 1.0,
               'light_grow': 1.0, 'glass_clear': 1.0, 'screen': 1.0}


def finish(root, name, samples=32, distance=0.8, strength=0.8, flat=None, soften=None, tint=None, floor=True):
    """Collapse helpers into parts, bake occlusion, touch it up, export through lib."""
    collapse(root)
    if not FAST:
        bake_ao(root, samples=samples, distance=distance, strength=strength, floor=floor)
    fl = dict(LIGHTS_FLAT)
    fl.update(flat or {})
    touch_up(root, fl, soften, tint)
    info = export_model(root, name, ao=False, do_collapse=False)
    report_parts(root)
    return info


# ==============================================================================================
# greenhouse.glb
# ==============================================================================================
def geodesic(freq=4, turn=0.0):
    """Upper half of a class-I geodesic sphere (icosahedron, one vertex up): unit node vectors,
    edges, triangles, and the set of edges that lie on the icosahedron's own edges (the primary
    ribs). For an even frequency the equator is a regular 5*freq-gon."""
    lat = math.atan(0.5)
    V = [Vector((0, 0, 1))]
    V += [Vector((cos(lat) * cos(turn + TAU * i / 5), cos(lat) * sin(turn + TAU * i / 5), sin(lat))) for i in range(5)]
    V += [Vector((cos(lat) * cos(turn + TAU * (i + 0.5) / 5), cos(lat) * sin(turn + TAU * (i + 0.5) / 5), -sin(lat)))
          for i in range(5)]
    V += [Vector((0, 0, -1))]
    F = []
    for i in range(5):
        j = (i + 1) % 5
        F += [(0, 1 + i, 1 + j), (1 + i, 6 + i, 1 + j), (6 + i, 6 + j, 1 + j), (11, 6 + j, 6 + i)]
    nodes, index, tris, primary = [], {}, [], set()

    def vid(p):
        p = p.normalized()
        key = (round(p.x, 5), round(p.y, 5), round(p.z, 5))
        if key not in index:
            index[key] = len(nodes)
            nodes.append(p)
        return index[key]

    for a, b, c in F:
        A, B, C = V[a], V[b], V[c]
        g = [[vid((A * (freq - i - j) + B * i + C * j) / freq) for j in range(freq + 1 - i)] for i in range(freq + 1)]
        for i in range(freq):
            for j in range(freq - i):
                tris.append((g[i][j], g[i + 1][j], g[i][j + 1]))
                if j < freq - i - 1:
                    tris.append((g[i + 1][j], g[i + 1][j + 1], g[i][j + 1]))
            primary.add(tuple(sorted((g[i][0], g[i + 1][0]))))
            primary.add(tuple(sorted((g[0][i], g[0][i + 1]))))
            primary.add(tuple(sorted((g[i][freq - i], g[i + 1][freq - i - 1]))))
    tris = [t for t in tris if all(nodes[k].z > -1e-4 for k in t)]
    used = sorted({k for t in tris for k in t})
    remap = {k: i for i, k in enumerate(used)}
    nodes = [Vector((nodes[k].x, nodes[k].y, max(0.0, nodes[k].z))) for k in used]
    tris = [tuple(remap[k] for k in t) for t in tris]
    edges = sorted({tuple(sorted((t[i], t[(i + 1) % 3]))) for t in tris for i in range(3)})
    primary = {tuple(sorted((remap[a], remap[b]))) for a, b in primary if a in remap and b in remap}
    return nodes, edges, tris, primary & set(edges)


GH_R = 4.0            # dome radius (the glazing surface)
GH_ZC = 0.55          # top of the knee wall = the dome's equator
GH_FLOOR = 0.06       # walking surface (the same height as the Hab's floor)
GH_XI, GH_XO = 0.75, 0.86          # doorway: clear half-width, outer half-width of the portal walls
GH_ZI, GH_ZO = 2.27, 2.39          # underside and top of the portal roof
GH_YF = -4.62                      # front face of the portal
GH_RW = 3.86                       # inner face of the knee wall
GH_PLOTS = ((-1.1, -1.2), (1.1, -1.2), (-1.1, 1.2), (1.1, 1.2))


def _gh_shell(K, P, edges, tris, primary):
    """The geodesic frame: struts, hubs and glazing, with the doorway cut out of it."""
    R_, ZC, XO, ZO = GH_R, GH_ZC, GH_XO, GH_ZO
    C = Vector((0, 0, ZC))

    def in_door(p, pad=0.0):
        return p.y < 0 and abs(p.x) < XO + pad and p.z < ZO + pad

    # glazing: one triangle per cell, clipped round the doorway
    g = K.bm('glass_clear', smooth=20.0)
    for t in tris:
        tri = [P[k] for k in t]
        if (tri[1] - tri[0]).cross(tri[2] - tri[0]).dot(tri[0] - C) < 0:
            tri.reverse()
        near = all(p.y < 0 for p in tri) and min(abs(p.x) for p in tri) < XO and min(p.z for p in tri) < ZO
        if not near:
            poly(g, tri)
            continue
        for piece in (clip_poly(tri, (1, 0, 0), XO), clip_poly(tri, (-1, 0, 0), XO),
                      clip_poly(clip_poly(clip_poly(tri, (1, 0, 0), -XO), (-1, 0, 0), -XO), (0, 0, 1), ZO)):
            if len(piece) >= 3:
                poly(g, piece)

    def clip_seg(a, b):
        """The parts of a strut that lie outside the doorway."""
        if a.y >= 0 or b.y >= 0:
            return [(a, b)]
        t0, t1 = 0.0, 1.0
        for n, d in ((Vector((1, 0, 0)), -XO), (Vector((-1, 0, 0)), -XO), (Vector((0, 0, -1)), -ZO)):
            fa, fb = n.dot(a) - d, n.dot(b) - d
            if fa <= 0 and fb <= 0:
                return [(a, b)]
            if fa < 0:
                t0 = max(t0, fa / (fa - fb))
            elif fb < 0:
                t1 = min(t1, fa / (fa - fb))
        if t0 >= t1:
            return [(a, b)]
        out = []
        if t0 > 1e-4:
            out.append((a, a.lerp(b, t0)))
        if t1 < 1 - 1e-4:
            out.append((a.lerp(b, t1), b))
        return out

    # struts, set mostly inside the glass. The icosahedron's own edges are deep box ribs (five
    # meridians, a pentagon ring, ten legs to the ground); the rest are light V-section glazing bars.
    sb = K.bm('aluminium', smooth=30.0)
    for e in edges:
        pieces = clip_seg(P[e[0]], P[e[1]])
        cut = pieces != [(P[e[0]], P[e[1]])]            # ends buried in hubs need no caps; cut ends do
        for a, b in pieces:
            if (b - a).length < 0.14:
                continue
            mid = ((a + b) / 2 - C).normalized()
            if e in primary:
                off = mid * -0.034
                sweep(sb, [a + off, b + off], rect(0.07, 0.13), up=mid, caps=cut)
            else:
                sweep(sb, [a, b], [(0.026, 0.022), (-0.026, 0.022), (0.0, -0.075)], up=mid, caps=cut)

    # hubs: a puck at every node (pentagonal where five struts meet), flats toward the struts
    nbr = {}
    for i, j in edges:
        nbr.setdefault(i, []).append(j)
        nbr.setdefault(j, []).append(i)
    hb = K.bm('aluminium', smooth=30.0)
    for i, p in enumerate(P):
        if in_door(p, 0.06):
            continue
        n = (p - C).normalized()
        k = 5 if len(nbr[i]) == 5 else 6
        r_ = 0.13 if k == 5 else 0.105
        M = frame(p, n, P[nbr[i][0]] - p)
        if p.z < ZC + 1e-3:
            lathe(hb, [(0.0, -0.09), (r_, -0.09), (r_, 0.045), (0.0, 0.045)], k, M, phase=pi / k)
        else:
            lathe(hb, [(0.0, -0.125), (0.05, -0.095), (r_, -0.095), (r_, 0.045), (0.0, 0.045)], k, M, phase=pi / k)
    return in_door


def _gh_base(K, P):
    """Knee wall on the 20 equator nodes (open at the doorway), buttresses, ground anchors, the
    light strip and the conduit on its inside."""
    R_, ZC, XO = GH_R, GH_ZC, GH_XO
    ring = sorted((p for p in P if p.z < ZC + 1e-3), key=lambda p: (math.atan2(p.y, p.x) + rad(90) + 1e-4) % TAU)
    # ring[0] is the node on the door axis; walk counter-clockwise from the right jamb to the left one
    assert abs(ring[0].x) < 1e-3 and ring[0].y < 0, ring[0]
    flat = [Vector((p.x, p.y, 0.0)) for p in ring]

    def at_x(a, b, x):
        return a.lerp(b, (x - a.x) / (b.x - a.x))

    path = [at_x(flat[0], flat[1], XO)] + flat[1:] + [at_x(flat[-1], flat[0], -XO)]
    wall = [(-0.09, 0.0), (0.27, 0.0), (0.27, 0.045), (0.17, 0.10), (0.145, 0.10), (0.145, ZC - 0.13), (0.19, ZC - 0.10),
            (0.19, ZC - 0.02), (0.165, ZC + 0.005), (-0.095, ZC + 0.005), (-0.12, ZC - 0.02), (-0.12, ZC - 0.10),
            (-0.09, ZC - 0.13)]
    K.sweep('painted_white', path, wall, smooth=30.0)
    K.sweep('light_white', path, [(-0.119, ZC - 0.128), (-0.105, ZC - 0.152), (-0.091, ZC - 0.128)])
    K.sweep('painted_dark', path, [(-0.135 + 0.022 * cos(a), 0.30 + 0.022 * sin(a)) for a in (TAU * k / 5 for k in range(5))],
            smooth=75.0)
    for i, p in enumerate(flat[1:], 1):
        az = math.degrees(math.atan2(p.y, p.x))
        M = R('Z', az)
        K.taper_box('painted_white', (0.27, 0.19), (0.07, 0.15), 0.03, ZC - 0.06, (R_ + 0.275, 0), (-0.10, 0), M)
        K.box('painted_dark', (0.24, 0.26, 0.025), (R_ + 0.50, 0, 0.0125), M)
        K.box('painted_orange', (0.055, 0.055, 0.05), (R_ + 0.52, 0, 0.05), M @ T(R_ + 0.52, 0, 0) @ R('Z', 45) @ T(-R_ - 0.52, 0, 0))
    # one feature on the outside of every whole wall segment: a louvred vent or a reflector
    for i in range(1, len(flat) - 1):
        a, b = flat[i], flat[i + 1]
        mid = (a + b) / 2
        az = math.degrees(math.atan2(mid.y, mid.x))
        M = R('Z', az) @ T(mid.length + 0.145, 0, 0)
        if i % 2:
            K.quad('painted_dark', (0.012, -0.30, 0.17), (0.012, 0.30, 0.17), (0.012, 0.30, 0.37), (0.012, -0.30, 0.37), M)
            for k in range(3):
                K.box('painted_white', (0.04, 0.64, 0.014), (0.022, 0, 0.205 + 0.065 * k), M)
        else:
            K.box('painted_orange', (0.012, 0.44, 0.07), (0.004, 0, 0.30), M)
    return path, flat


def _gh_portal(K):
    """The doorway: a short rigid vestibule let into the frame between two primary ribs.
    Clear opening 1.5 m wide and 2.21 m above the deck (1.44 m wide at 2.1 m)."""
    R_, ZC, XI, XO, ZI, ZO, YF, FL = GH_R, GH_ZC, GH_XI, GH_XO, GH_ZI, GH_ZO, GH_YF, GH_FLOOR

    def ys(x, z):                         # where the plane of a portal wall or roof meets the dome
        return -sqrt(R_ * R_ - x * x - (max(z, ZC) - ZC) ** 2)

    yb0 = -sqrt(GH_RW ** 2 - XO ** 2) + 0.02
    zk = 1.0                              # top of the solid lower panel
    zs = [ZC + (ZO - ZC) * i / 6 for i in range(7)]
    xm = (XI + XO) / 2
    for s in (-1, 1):
        # lower panel, then a glazed upper panel
        out = [(YF + 0.06, 0.0), (yb0, 0.0), (yb0, ZC - 0.02), (ys(XO, ZC), ZC - 0.02), (ys(XO, zk), zk), (YF + 0.06, zk)]
        K.prism('painted_white', out, XO - XI, YZX @ T(0, 0, XI if s > 0 else -XO), z0=0.0)
        K.box('aluminium', (XO - XI + 0.03, ys(XO, zk) - YF - 0.06, 0.05), (s * xm, (ys(XO, zk) + YF + 0.06) / 2, zk))
        gp = [(s * xm, YF + 0.08, zk)] + [(s * xm, ys(XO, z), z) for z in [zk] + [z for z in zs if zk < z < ZI] + [ZI]] \
            + [(s * xm, YF + 0.08, ZI)]
        K.poly('glass_clear', gp if s > 0 else list(reversed(gp)), smooth=20.0)
        # the trim where the wall meets the frame, seen from inside as the door surround
        side = [(s * XO, ys(XO, ZC), ZC - 0.04)] + [(s * XO, ys(XO, z), z) for z in zs]
        K.sweep('aluminium', side, rect(0.075, 0.13), up=(1, 0, 0), smooth=40.0)
        # inside: an orange kick stripe and a grab rail; outside: a marker panel and a seam
        K.box('painted_orange', (0.012, 0.50, 0.10), (s * (XI - 0.004), -4.18, 0.20))
        K.handle('aluminium', (s * XI, -4.40, 1.08), (s * XI, -3.98, 1.08), 0.07, 0.016, 6, normal=(-s, 0, 0))
        K.box('painted_orange', (0.012, 0.46, 0.20), (s * (XO + 0.004), -4.20, 0.62))
        K.box('painted_dark', (0.014, 0.50, 0.03), (s * (XO + 0.003), -4.20, 0.86))
    # roof slab, stiffening ribs on top, a light let into the ceiling, the trim along its back edge
    xs = [-XO + 2 * XO * i / 6 for i in range(7)]
    roof = [(-XO, YF + 0.06), (XO, YF + 0.06)] + [(x, ys(x, ZO)) for x in reversed(xs)]
    K.prism('painted_white', roof, ZO - ZI, T(0, 0, ZI), z0=0.0)
    for x in (-0.48, 0.0, 0.48):
        K.box('painted_white', (0.06, ys(x, ZO) - YF - 0.16, 0.045), (x, (ys(x, ZO) + YF + 0.16) / 2 - 0.03, ZO + 0.02))
    K.box('painted_orange', (2 * XO - 0.1, 0.08, 0.012), (0, YF + 0.30, ZO + 0.004))
    K.box('light_white', (0.14, 0.56, 0.02), (0, -4.08, ZI - 0.006))
    K.box('painted_dark', (0.20, 0.62, 0.012), (0, -4.08, ZI - 0.002))
    K.sweep('aluminium', [(x, ys(x, ZO), ZO) for x in xs], rect(0.13, 0.075), up=(0, 0, 1), smooth=40.0)
    K.box('painted_orange', (0.70, 0.02, 0.07), (0, ys(0, ZO) + 0.068, ZO - 0.085))            # exit marker, seen from inside
    # front frame: an arch with cut corners, proud of the walls
    xa, za, c, yf = XI + 0.10, ZI + 0.10, 0.20, YF + 0.03
    arch = [(-xa, yf, 0.0), (-xa, yf, za - c), (-xa + c, yf, za), (xa - c, yf, za), (xa, yf, za - c), (xa, yf, 0.0)]
    K.sweep('painted_white', arch, chamf(0.20, 0.20, 0.028), up=(0, -1, 0), smooth=30.0)
    yface = yf - 0.104
    for s in (-1, 1):
        for k in range(4):                                             # hazard chevrons up the posts
            z = 0.14 + 0.19 * k
            K.poly('painted_orange', [(s * (xa - 0.07), yface, z), (s * (xa + 0.07), yface, z + 0.09),
                                      (s * (xa + 0.07), yface, z + 0.18), (s * (xa - 0.07), yface, z + 0.09)][::s])
        K.box('painted_dark', (0.14, 0.012, 0.035), (s * xa, yface, 1.02))
        K.box('painted_dark', (0.13, 0.06, 0.05), (s * xa, yf, 0.03), bevel=0.0)                   # foot pads
    K.text('painted_dark', 'GH-01', 0.115, T(0, yface, za + 0.002) @ R('X', 90))
    for s in (-1, 1):
        K.box('painted_orange', (0.10, 0.012, 0.11), (s * 0.44, yface, za))
    K.box('painted_dark', (0.92, 0.10, 0.02), (0, yf, ZI - 0.004))                             # door lamp
    K.box('light_white', (0.84, 0.06, 0.022), (0, yf, ZI - 0.012))
    # threshold and ramp
    K.box('painted_grey', (2 * XO, -3.66 - YF - 0.06, FL), (0, (-3.66 + YF + 0.06) / 2, FL / 2))
    K.prism('painted_grey', [(YF - 0.56, 0.0), (YF + 0.06, 0.0), (YF + 0.06, FL), (YF - 0.07, FL), (YF - 0.54, 0.014)], 2 * XI,
            YZX, z0=-XI)
    for k in range(4):
        y = YF - 0.48 + 0.105 * k
        K.box('painted_dark', (2 * XI - 0.16, 0.03, 0.012), (0, y, 0.016 + (y - (YF - 0.54)) * (FL - 0.014) / 0.47))
    K.box('painted_orange', (2 * XI, 0.07, 0.008), (0, YF + 0.16, FL + 0.003))
    anchor('door', K.parent, loc=(0, YF - 1.0, 0))
    anchor('light_door', K.parent, loc=(0, yf, ZI - 0.05))


def _gh_floor(K):
    """Hexagonal deck tiles over a dark underlay, clipped to the inside of the knee wall."""
    FL = GH_FLOOR
    rim = [(3.90 * cos(rad(18 * k)), 3.90 * sin(rad(18 * k))) for k in range(20)]
    K.poly('painted_dark', [(x, y, FL - 0.016) for x, y in rim])
    a, gap = 0.56, 0.016
    centres = []
    rr = a - gap / 2 / cos(rad(30))
    for i in range(-6, 7):
        for j in range(-6, 7):
            cx, cy = 1.5 * a * i, sqrt(3) * a * (j + 0.5 * (i % 2))
            if math.hypot(cx, cy) > 3.9 + a:
                continue
            piece = clip_convex2([(cx + rr * cos(rad(60 * k)), cy + rr * sin(rad(60 * k))) for k in range(6)], rim)
            if len(piece) < 3:
                continue
            area = 0.5 * abs(sum(piece[k][0] * piece[(k + 1) % len(piece)][1] - piece[(k + 1) % len(piece)][0] * piece[k][1]
                                 for k in range(len(piece))))
            if area < 0.02:
                continue
            K.poly('painted_grey', [(x, y, FL) for x, y in piece])
            centres.append((cx, cy))
    for px, py in GH_PLOTS:                       # corner marks of the four tray bays
        for sx in (-1, 1):
            for sy in (-1, 1):
                cx, cy = px + sx * 0.86, py + sy * 1.01
                K.decal('painted_orange', 0.22, 0.035, T(cx - sx * 0.0925, cy, FL + 0.005))
                K.decal('painted_orange', 0.035, 0.185, T(cx, cy - sy * 0.11, FL + 0.005))
    return centres


def _gh_lights(K, P, in_door):
    """A grid of four light rails hung high in the frame, a grow-light fixture over each plot on
    short drop rods, and a work lamp at the apex. Nothing hangs below 3.2 m, so the third-person
    camera looks under the lights, not through them."""
    R_, ZC = GH_R, GH_ZC
    C = Vector((0, 0, ZC))
    ZR = 3.62
    hubs = [p for p in P if not in_door(p, 0.06)]

    def hang(end):
        hub = min(hubs, key=lambda p: (p - end).length)
        K.tube('aluminium', [end, hub - (hub - C).normalized() * 0.10], 0.013, 5)
        K.box('painted_dark', (0.08, 0.08, 0.11), tuple(end))

    for s in (-1, 1):
        ye = sqrt(R_ ** 2 - 1.1 ** 2 - (ZR - ZC) ** 2) - 0.16
        K.beam('aluminium', (s * 1.1, -ye, ZR), (s * 1.1, ye, ZR), 0.045, 0.08, smooth=30.0)
        xe = sqrt(R_ ** 2 - 1.2 ** 2 - (ZR + 0.08 - ZC) ** 2) - 0.16
        K.beam('aluminium', (-xe, s * 1.2, ZR + 0.08), (xe, s * 1.2, ZR + 0.08), 0.045, 0.08, smooth=30.0)
        for e in (-1, 1):
            hang(Vector((s * 1.1, e * ye, ZR)))
            hang(Vector((e * xe, s * 1.2, ZR + 0.08)))
    K.tube('painted_dark', [(-1.1, 1.2, ZR + 0.06), (-1.1, 2.0, ZR + 0.06)], 0.014, 5)
    ZF = 3.27                                    # underside of the fixtures: above the game camera
    for k, (px, py) in enumerate(GH_PLOTS):
        M = T(px, py, 0)
        K.box('painted_dark', (0.09, 0.09, 0.17), (0, 0, ZR + 0.04), M)                 # rail crossing clamp
        for dx in (-0.48, -0.16, 0.16, 0.48):
            K.box('aluminium', (0.05, 1.50, 0.035), (dx, 0, ZF + 0.045), M)
            K.box('light_grow', (0.066, 1.42, 0.03), (dx, 0, ZF + 0.015), M)
        for dy in (-0.52, 0.52):
            K.box('aluminium', (1.06, 0.045, 0.03), (0, dy, ZF + 0.075), M)
            K.tube('aluminium', [(0, dy, ZF + 0.08), (0, dy, ZR - 0.03)], 0.007, 4, M=M)
        for dx in (-0.48, 0.48):
            K.tube('aluminium', [(dx, 0, ZF + 0.06), (dx, 0, ZR + 0.05)], 0.007, 4, M=M)
        K.box('painted_white', (0.24, 0.36, 0.08), (0, 0, ZF + 0.115), M, bevel=0.012)
        K.box('painted_orange', (0.245, 0.06, 0.03), (0, -0.10, ZF + 0.125), M)
        K.hose('painted_dark', [(0.05, 0.12, ZF + 0.15), (0.13, 0.2, ZF + 0.24), (0.04, 0.05, ZR)], 0.010, 4, 2, M=M)
        anchor(f'light_{k}', K.parent, loc=(px, py, ZF))
    # apex: a vent cowl outside, a pendant work lamp inside
    top = ZC + R_
    K.lathe('painted_white', [(0.0, -0.10), (0.44, -0.10), (0.44, 0.0), (0.36, 0.075), (0.17, 0.115), (0.15, 0.20), (0.22, 0.215),
                              (0.22, 0.25), (0.10, 0.285), (0.0, 0.285)], 14, T(0, 0, top + 0.02))
    K.lathe('painted_dark', [(0.16, 0.115), (0.16, 0.205)], 14, T(0, 0, top + 0.02))
    K.lathe('painted_orange', [(0.444, -0.05), (0.444, -0.012)], 14, T(0, 0, top + 0.02), smooth=60.0)
    K.tube('aluminium', [(0, 0, top - 0.06), (0, 0, top - 0.52)], 0.016, 6)
    K.lathe('painted_white', [(0.0, -0.035), (0.30, -0.035), (0.32, -0.005), (0.10, 0.10), (0.06, 0.17), (0.0, 0.17)], 14, T(0, 0, top - 0.68))
    K.lathe('light_white', [(0.0, -0.045), (0.26, -0.045), (0.26, -0.03)], 14, T(0, 0, top - 0.68))
    anchor('light_apex', K.parent, loc=(0, 0, top - 0.75))


def _gh_equipment(root):
    """What makes it a working greenhouse: water tank, air handler, potting bench, crates and an
    outdoor utility skid. Everything stays outside the four plots and the aisles between them."""
    FL = GH_FLOOR
    # --- water tank on the +X side ---
    K = Kit('tank', root, T(3.22, 0.0, FL))
    K.lathe('painted_white', tank_profile(0.36, 1.30, 0.16, 4, 0.16), 16, smooth=50.0)
    K.lathe('painted_orange', [(0.365, 1.02), (0.365, 1.14)], 16, smooth=50.0)
    K.lathe('painted_dark', [(0.0, 0.0), (0.31, 0.0), (0.31, 0.05), (0.27, 0.05), (0.27, 0.24), (0.0, 0.24)], 12)
    K.lathe('aluminium', [(0.10, 1.44), (0.10, 1.50), (0.07, 1.52), (0.0, 1.52)], 10)
    K.tube('aluminium', [(-0.37, 0.10, 0.34), (-0.40, 0.10, 0.34), (-0.40, 0.10, 1.18), (-0.37, 0.10, 1.18)], 0.014, 5, round_r=0.03)
    K.tube('painted_dark', [(0.0, -0.36, 0.42), (0.0, -0.50, 0.42), (0.0, -0.50, 0.26), (0.30, -0.60, 0.26)], 0.024, 6, round_r=0.06)
    K.box('painted_dark', (0.16, 0.14, 0.16), (0.0, -0.47, 0.42), bevel=0.02)
    K.box('painted_orange', (0.05, 0.03, 0.10), (0.0, -0.55, 0.47))
    K.finish()
    anchor('col_tank', root, loc=(3.22, 0, 0), radius=0.5)

    # --- air handler on the -X side, facing the middle of the room ---
    K = Kit('ecu', root, T(-3.20, 0.0, FL) @ R('Z', 90))
    K.box('painted_white', (0.84, 0.50, 1.30), (0, 0, 0.73), bevel=0.018)
    for sx in (-1, 1):
        K.box('painted_dark', (0.07, 0.42, 0.08), (sx * 0.33, 0, 0.04))
    G = T(0, -0.25, 0.98) @ R('X', 90)
    K.lathe('painted_dark', [(0.0, 0.0), (0.27, 0.0), (0.27, 0.012), (0.0, 0.012)], 14, G)
    for r_ in (0.14, 0.265):
        K.torus('aluminium', r_, 0.012, 14, 3, G @ T(0, 0, 0.025))
    for a in range(4):
        K.beam('aluminium', (0.27 * cos(rad(45 + 90 * a)), -0.277, 0.98 + 0.27 * sin(rad(45 + 90 * a))), (0, -0.277, 0.98), 0.016, 0.012,
               up=(0, 1, 0))
    K.lathe('painted_orange', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.02), (0.0, 0.02)], 8, G @ T(0, 0, 0.02))
    for k in range(5):
        K.box('painted_dark', (0.62, 0.012, 0.035), (0, -0.253, 0.24 + 0.065 * k))
    K.box('painted_dark', (0.70, 0.02, 0.40), (0, -0.244, 0.37))
    K.box('painted_orange', (0.30, 0.012, 0.05), (-0.18, -0.256, 1.31))
    K.box('light_white', (0.05, 0.012, 0.03), (0.27, -0.256, 1.31))
    # flexible duct from the top up to an outlet aimed along the frame
    duct = spline([(0.0, 0.05, 1.38), (0.0, 0.06, 1.75), (0.0, -0.05, 2.15), (0.0, -0.38, 2.42)], 3)
    K.sweep('aluminium', duct, circ(0.115, 8), smooth=75.0, scales=[1.0 + 0.07 * (i % 2) for i in range(len(duct))])
    K.lathe('painted_white', [(0.125, 0.0), (0.19, 0.10), (0.17, 0.10), (0.11, 0.0)], 10,
            frame((0.0, -0.38, 2.42), (0, -0.78, 0.62)), close=True)
    K.finish()
    anchor('col_ecu', root, loc=(-3.20, 0, 0), radius=0.55)

    # --- potting bench against the back ---
    K = Kit('bench', root, T(0.0, 3.36, FL))
    K.box('painted_white', (1.80, 0.62, 0.04), (0, 0, 0.90), bevel=0.01)
    K.box('aluminium', (1.72, 0.54, 0.05), (0, 0, 0.855))
    for sx in (-1, 1):
        for sy in (-1, 1):
            K.box('aluminium', (0.05, 0.05, 0.84), (sx * 0.83, sy * 0.24, 0.42))
        K.box('aluminium', (0.04, 0.44, 0.04), (sx * 0.83, 0, 0.22))
    K.box('painted_grey', (1.66, 0.50, 0.025), (0, 0, 0.25))
    K.box('painted_white', (1.80, 0.03, 0.30), (0, 0.30, 1.06), bevel=0.008)                 # back board with tools
    for i, x in enumerate((-0.62, -0.46, -0.30)):
        K.box('painted_orange', (0.035, 0.03, 0.14), (x, 0.272, 1.10))
        K.box('aluminium', (0.05 + 0.02 * (i % 2), 0.012, 0.11), (x, 0.275, 0.985))
    # seed trays, pots, a watering can; a crate and two sacks on the shelf below
    for x in (0.18, 0.62):
        K.box('painted_dark', (0.36, 0.50, 0.06), (x, -0.02, 0.95), bevel=0.008)
        for i in range(2):
            for j in range(3):
                K.decal('painted_grey', 0.13, 0.13, T(x - 0.085 + 0.17 * i, -0.02 - 0.16 + 0.16 * j, 0.984))
    pot = [(0.0, 0.0), (0.055, 0.0), (0.092, 0.15), (0.072, 0.15), (0.0, 0.12)]
    for x, y, s in ((-0.70, -0.12, 1.0), (-0.48, -0.16, 0.8), (-0.60, 0.10, 0.9)):
        K.lathe('painted_orange', pot, 8, T(x, y, 0.92) @ S(s))
    K.lathe('aluminium', [(0.0, 0.0), (0.09, 0.0), (0.085, 0.20), (0.06, 0.22), (0.0, 0.22)], 10, T(-0.18, -0.10, 0.92))
    K.tube('aluminium', [(-0.11, -0.10, 0.96), (0.03, -0.10, 1.14)], 0.014, 5)
    K.handle('aluminium', (-0.26, -0.10, 0.96), (-0.24, -0.10, 1.12), 0.07, 0.009, 4, normal=(-1, 0, 0))
    K.box('painted_grey', (0.62, 0.44, 0.30), (-0.42, 0, 0.415), bevel=0.016)
    K.box('painted_orange', (0.64, 0.46, 0.05), (-0.42, 0, 0.585), bevel=0.012)
    K.box('painted_white', (0.50, 0.40, 0.24), (0.42, 0, 0.385), bevel=0.05, bseg=2)
    K.box('painted_white', (0.48, 0.38, 0.20), (0.44, 0.02, 0.60), bevel=0.05, bseg=2)
    K.box('painted_orange', (0.10, 0.385, 0.205), (0.44, 0.02, 0.60))
    K.finish()
    anchor('col_bench_a', root, loc=(-0.45, 3.36, 0), radius=0.5)
    anchor('col_bench_b', root, loc=(0.45, 3.36, 0), radius=0.5)

    # --- hose reel on the wall beside the tank, nutrient cans and spare trays by the air handler ---
    K = Kit('reel', root, R('Z', -27) @ T(3.56, 0, FL) @ R('Z', 90))
    K.box('aluminium', (0.07, 0.05, 0.86), (-0.17, 0.08, 0.43))
    K.box('aluminium', (0.07, 0.05, 0.86), (0.17, 0.08, 0.43))
    Mr = T(0, 0.06, 0.74) @ AX['X']
    K.lathe('painted_orange', [(0.06, -0.125), (0.235, -0.125), (0.235, -0.105), (0.06, -0.105)], 10, Mr)
    K.lathe('painted_orange', [(0.06, 0.105), (0.235, 0.105), (0.235, 0.125), (0.06, 0.125)], 10, Mr)
    K.lathe('painted_dark', [(0.175, -0.105), (0.175, 0.105)], 10, Mr, smooth=60.0)
    K.tube('aluminium', [(-0.20, 0.06, 0.74), (0.24, 0.06, 0.74), (0.24, 0.06, 0.86), (0.30, 0.06, 0.86)], 0.014, 5)
    K.hose('painted_dark', [(0.0, -0.11, 0.70), (0.02, -0.16, 0.40), (0.10, -0.24, 0.05), (0.34, -0.36, 0.02), (0.56, -0.30, 0.02)], 0.016, 5, 2)
    K.finish()
    K = Kit('cans', root, T(0, 0, FL))
    for x, y, yaw in ((-3.32, 0.86, 80), (-3.22, 1.22, 96), (-3.30, -0.84, 100)):
        M = T(x, y, 0) @ R('Z', yaw)
        K.box('painted_white', (0.34, 0.17, 0.42), (0, 0, 0.215), M, bevel=0.03)
        K.box('painted_orange', (0.345, 0.175, 0.07), (0, 0, 0.24), M)
        K.lathe('painted_dark', [(0.03, 0.0), (0.03, 0.04), (0.0, 0.04)], 6, M @ T(0.10, 0, 0.425))
        K.box('painted_white', (0.14, 0.035, 0.03), (-0.04, 0, 0.455), M)
    for k in range(4):                                             # spare grow trays leaning on the wall
        K.box('painted_dark', (0.40, 0.56, 0.05), (0, 0, 0.0), T(-3.26, -1.24, 0.03 + 0.062 * k) @ R('Z', 8 * (k % 2) - 4))
    K.finish()

    # --- two crates by the door ---
    K = Kit('crates', root, T(0, 0, FL))
    for x, y, yaw, w, h in ((-2.12, -2.84, 24, 0.62, 0.40), (2.16, -2.80, -18, 0.56, 0.36)):
        M = T(x, y, 0) @ R('Z', yaw)
        K.box('painted_grey', (w, 0.44, h), (0, 0, h / 2 + 0.01), M, bevel=0.018)
        K.box('painted_orange', (w + 0.02, 0.46, 0.055), (0, 0, h + 0.012), M, bevel=0.012)
        for sx in (-1, 1):
            K.box('painted_dark', (0.012, 0.16, 0.05), (sx * w / 2, 0, h * 0.62), M)
    K.box('painted_white', (0.40, 0.30, 0.24), (-2.10, -2.82, 0.56), bevel=0.016)
    K.finish()
    anchor('col_crate_a', root, loc=(-2.12, -2.84, 0), radius=0.4)
    anchor('col_crate_b', root, loc=(2.16, -2.80, 0), radius=0.38)

    # --- utility skid outside, piped through the knee wall ---
    az = 38.0
    K = Kit('skid', root, R('Z', az) @ T(5.05, 0, 0) @ R('Z', 90))      # local -Y faces away from the dome
    for sx in (-1, 1):
        K.sweep('aluminium', [(sx * 0.62, -0.42, 0.10), (sx * 0.62, -0.34, 0.035), (sx * 0.62, 0.34, 0.035), (sx * 0.62, 0.42, 0.10)],
                rect(0.06, 0.05), up=(0, 0, 1))
    for y in (-0.26, 0.26):
        K.box('aluminium', (1.30, 0.05, 0.05), (0, y, 0.085))
    K.lathe('painted_white', tank_profile(0.25, 0.96, 0.14, 4, -0.48), 14, T(-0.14, 0.10, 0.42) @ AX['X'], smooth=50.0)
    for x in (-0.42, 0.14):
        K.lathe('painted_orange', [(0.255, -0.03), (0.255, 0.03)], 14, T(x, 0.10, 0.42) @ AX['X'], smooth=50.0)
        K.box('painted_dark', (0.06, 0.44, 0.10), (x, 0.10, 0.15))
    K.box('painted_white', (0.44, 0.50, 0.56), (0.40, -0.02, 0.40), bevel=0.02)
    for k in range(5):
        K.box('painted_dark', (0.36, 0.014, 0.05), (0.40, -0.275, 0.24 + 0.08 * k))
    K.box('painted_orange', (0.445, 0.505, 0.05), (0.40, -0.02, 0.62))
    K.box('light_white', (0.04, 0.012, 0.03), (0.54, -0.274, 0.62))
    duct = spline([(0.40, 0.23, 0.46), (0.40, 0.48, 0.40), (0.30, 0.72, 0.34), (0.20, 0.90, 0.33)], 3)
    K.sweep('aluminium', duct, circ(0.085, 8), smooth=75.0, scales=[1.0 + 0.08 * (i % 2) for i in range(len(duct))])
    K.hose('painted_dark', [(-0.60, 0.10, 0.42), (-0.70, 0.30, 0.30), (-0.52, 0.62, 0.20), (-0.30, 0.90, 0.22)], 0.022, 5, 2)
    K.hose('painted_dark', [(0.55, -0.20, 0.14), (0.9, -0.5, 0.03), (1.5, -0.7, 0.02), (2.1, -0.6, 0.02), (2.5, -0.9, -0.06)], 0.018, 5, 2)
    K.finish()
    a = rad(az)
    anchor('col_skid', root, loc=(5.05 * cos(a), 5.05 * sin(a), 0), radius=0.8)


def build_greenhouse():
    mat('light_grow', color=(0.9, 0.25, 0.6), metallic=0.0, roughness=0.4, emissive=(1.0, 0.16, 0.55), strength=1.6)
    root = part('greenhouse')
    C = Vector((0, 0, GH_ZC))
    nodes, edges, tris, primary = geodesic(4, turn=rad(54))          # a pentagon hub straight above the door
    P = [C + n * GH_R for n in nodes]
    K = Kit('gh', root)
    in_door = _gh_shell(K, P, edges, tris, primary)
    _gh_base(K, P)
    _gh_portal(K)
    centres = _gh_floor(K)
    _gh_lights(K, P, in_door)
    K.finish()
    _gh_equipment(root)
    anchor('floor', root, loc=(0, 0, GH_FLOOR), height=GH_FLOOR)

    def tint(co, name, a):
        if name == 'painted_grey' and abs(co.z - GH_FLOOR) < 0.004 and co.y > -3.6 and co.x * co.x + co.y * co.y < 15.3:
            c = min(centres, key=lambda c: (c[0] - co.x) ** 2 + (c[1] - co.y) ** 2)
            return a * (0.80 + 0.20 * hash01(round(c[0], 2), round(c[1], 2)))
        return None

    return finish(root, 'greenhouse', samples=24, distance=1.0, tint=tint, soften={'painted_grey': 0.8})


# ==============================================================================================
# solar_kit.glb
# ==============================================================================================
def build_solar_kit():
    """A folding field array: three hinged leaves (2.0 x 1.2 m open) on a surveyor's tripod, with a
    tilt head, a charge controller strapped to the column and a lead away along the ground.
    Part `panel` tilts about its local X axis (modelled at 32 degrees, facing -Y)."""
    root = part('solar_kit')
    K = Kit('tripod', root)
    PZ, TILT, CROWN = 1.06, 32.0, 0.74
    # centre column, crown casting and the lower collar that carries the spreaders
    K.tube('aluminium', [(0, 0, 0.40), (0, 0, PZ - 0.10)], 0.027, 10)
    K.lathe('painted_dark', [(0.0, -0.055), (0.062, -0.055), (0.074, -0.035), (0.074, 0.03), (0.05, 0.055), (0.0, 0.055)], 12, T(0, 0, CROWN))
    K.lathe('painted_dark', [(0.0, -0.028), (0.046, -0.028), (0.046, 0.028), (0.0, 0.028)], 10, T(0, 0, 0.47))
    K.lathe('painted_dark', [(0.0, -0.02), (0.034, -0.02), (0.034, 0.0), (0.0, 0.0)], 8, T(0, 0, 0.40))
    for i in range(3):
        a = rad(90 + 120 * i)
        d = Vector((cos(a), sin(a), 0))
        top = d * 0.085 + Vector((0, 0, CROWN - 0.01))
        foot = d * 0.68 + Vector((0, 0, 0.035))
        mid = top.lerp(foot, 0.56)
        M = frame(mid, foot - top, d)
        K.tube('aluminium', [top, mid], 0.021, 8)
        K.tube('aluminium', [mid - (foot - top).normalized() * 0.05, foot], 0.015, 8)
        K.lathe('painted_orange', [(0.0, -0.035), (0.029, -0.035), (0.029, 0.03), (0.022, 0.035), (0.0, 0.035)], 8, M)   # leg clamp
        K.box('painted_orange', (0.016, 0.02, 0.06), (0.0, 0.036, -0.012), M)
        K.box('painted_dark', (0.06, 0.045, 0.07), (0.0, 0.0, 0.0), frame(top, foot - top, d))                # crown hinge lug
        K.lathe('painted_dark', [(0.0, 0.0), (0.06, 0.0), (0.06, 0.012), (0.03, 0.034), (0.0, 0.034)], 10, T(foot.x, foot.y, 0.0))
        K.tube('aluminium', [foot, (foot.x + d.x * 0.02, foot.y + d.y * 0.02, -0.10)], 0.007, 4)                 # ground spike
        K.tube('aluminium', [d * 0.04 + Vector((0, 0, 0.47)), top.lerp(foot, 0.50)], 0.008, 5)                 # spreader
    # tilt head: a yoke with a pivot pin, a lock knob and an azimuth ring
    K.lathe('painted_dark', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.035), (0.036, 0.05), (0.0, 0.05)], 12, T(0, 0, PZ - 0.145))
    K.box('painted_dark', (0.13, 0.075, 0.03), (0, 0, PZ - 0.085), bevel=0.006)
    for sx in (-1, 1):
        K.prism('painted_dark', [(-0.038, -0.075), (0.038, -0.075), (0.038, 0.01), (0.02, 0.04), (-0.02, 0.04), (-0.038, 0.01)], 0.012,
                T(sx * 0.058, 0, PZ) @ YZX)
    K.lathe('aluminium', [(0.0, -0.08), (0.012, -0.08), (0.012, 0.08), (0.0, 0.08)], 8, T(0, 0, PZ) @ AX['X'])
    K.lathe('painted_orange', [(0.0, 0.0), (0.03, 0.0), (0.036, 0.008), (0.036, 0.028), (0.024, 0.036), (0.0, 0.036)], 6,
            T(0.066, 0, PZ) @ AX['X'])
    # charge controller on the back of the column: foil body, white end plates, a radiator face
    K.box('gold_foil', (0.20, 0.10, 0.16), (0, 0.085, 0.905), bevel=0.012)
    for z in (0.82, 0.99):
        K.box('painted_white', (0.215, 0.115, 0.018), (0, 0.085, z), bevel=0.004)
    for k in range(5):
        K.box('painted_white', (0.012, 0.022, 0.13), (-0.072 + 0.036 * k, 0.142, 0.905))
    for z in (0.86, 0.95):
        K.box('painted_dark', (0.075, 0.07, 0.022), (0, 0.012, z))
    K.box('painted_orange', (0.006, 0.06, 0.04), (0.102, 0.085, 0.92))
    # leads: panel to controller, controller down the back leg and away
    K.hose('painted_dark', [(0.03, 0.03, PZ - 0.03), (0.06, 0.09, PZ - 0.0), (0.05, 0.10, 1.0)], 0.008, 5, 3)
    K.hose('painted_dark', [(0.0, 0.10, 0.82), (0.0, 0.13, 0.72), (0.03, 0.32, 0.42), (0.03, 0.62, 0.07), (0.10, 0.86, 0.015),
                            (0.42, 1.10, 0.012), (0.80, 1.16, 0.012), (1.15, 1.40, -0.05)], 0.010, 5, 3)
    K.finish()
    anchor('col_post', root, loc=(0, 0, 0), radius=0.6)

    Pn = Kit('panel', part('panel', parent=root, loc=(0, 0, PZ), rot=(rad(TILT), 0, 0)))
    W, H, gap, ZB = 0.655, 1.20, 0.012, 0.04          # leaf size; ZB = back face of the leaves
    hx = W / 2 + gap / 2

    def leaf(M, wing=0):
        Pn.box('aluminium', (W, H, 0.026), (0, 0, ZB + 0.013), M, bevel=0.006)
        cw, ch = (W - 0.045) / 2, (H - 0.045) / 4
        for i in range(2):
            for j in range(4):
                Pn.box('solar_cell', (cw - 0.012, ch - 0.012, 0.007), (-W / 2 + 0.0225 + cw * (i + 0.5), -H / 2 + 0.0225 + ch * (j + 0.5), ZB + 0.0285), M)
        Pn.quad('painted_white', (-W / 2 + 0.03, H / 2 - 0.03, ZB - 0.002), (W / 2 - 0.03, H / 2 - 0.03, ZB - 0.002),
                (W / 2 - 0.03, -H / 2 + 0.03, ZB - 0.002), (-W / 2 + 0.03, -H / 2 + 0.03, ZB - 0.002), M)          # white back sheet
        Pn.box('aluminium', (0.03, H - 0.06, 0.016), (0, 0, ZB - 0.008), M)                    # back ribs
        for y in (-0.36, 0.36):
            Pn.box('aluminium', (W - 0.06, 0.03, 0.014), (0, y, ZB - 0.007), M)
        if wing:
            Pn.box('painted_orange', (0.16, 0.07, 0.004), (wing * 0.14, 0.50, ZB - 0.004), M)      # rating plate
            Pn.box('painted_dark', (0.10, 0.07, 0.022), (-wing * 0.16, -0.50, ZB - 0.011), M)      # bypass diode box
        if wing:
            for sy in (-1, 1):
                Pn.box('painted_orange', (0.055, 0.055, 0.04), (wing * (W / 2 - 0.02), sy * (H / 2 - 0.02), ZB + 0.013), M, bevel=0.008)
            Pn.box('painted_dark', (0.02, 0.07, 0.034), (wing * (W / 2 + 0.004), 0.0, ZB + 0.013), M)        # fold latch

    leaf(Matrix.Identity(4))
    for s in (-1, 1):
        Mw = T(s * hx, 0, ZB + 0.026) @ R('Y', -5 * s) @ T(s * hx, 0, -ZB - 0.026)
        leaf(Mw, s)
        for y in (-0.42, 0.0, 0.42):                                                              # hinge knuckles
            Pn.lathe('painted_dark', [(0.0, -0.06), (0.012, -0.06), (0.012, 0.06), (0.0, 0.06)], 6, T(s * hx, y, ZB + 0.03) @ AX['Y'])
        # folding stay from the spine to the back of the wing
        Pn.tube('aluminium', [(s * 0.05, -0.30, 0.012), (s * (hx + 0.40), -0.30, ZB - 0.012 + 0.035)], 0.007, 5)
        Pn.box('painted_dark', (0.04, 0.03, 0.024), (s * (hx + 0.40), -0.30, ZB + 0.022 - 0.012))
    # carry handle on the top edge, spine and pivot lugs on the back, tilt quadrant, junction box
    Pn.handle('painted_dark', (-0.13, H / 2, ZB + 0.013), (0.13, H / 2, ZB + 0.013), 0.065, 0.011, 6, normal=(0, 1, 0))
    Pn.box('aluminium', (0.11, 1.02, 0.028), (0, 0, ZB - 0.014 - 0.002), bevel=0.005)
    for sx in (-1, 1):
        Pn.prism('aluminium', [(-0.045, -0.035), (0.045, -0.035), (0.045, 0.02), (-0.045, 0.02)], 0.01, T(sx * 0.044, 0, 0.0) @ YZX)
    quad_pts = [(0.0, 0.0)] + [(0.10 * cos(rad(a)), 0.10 * sin(rad(a))) for a in range(200, 341, 20)]
    Pn.prism('painted_dark', quad_pts, 0.008, T(-0.072, 0, 0.0) @ YZX)
    Pn.box('painted_dark', (0.13, 0.09, 0.03), (0.0, 0.40, ZB - 0.016 - 0.014), bevel=0.006)
    Pn.hose('painted_dark', [(0.03, 0.36, ZB - 0.03), (0.07, 0.2, ZB - 0.045), (0.065, 0.06, ZB - 0.04), (0.03, 0.03, -0.02)], 0.008, 5, 2)
    Pn.finish()
    return finish(root, 'solar_kit', samples=32, distance=0.6)


# ==============================================================================================
# beacon.glb
# ==============================================================================================
def build_beacon():
    """A 2.2 m navigation beacon: ballast drum with fold-out feet, a banded telescoping mast, a
    foil electronics pod, a small solar cell, a caged lamp (part `lamp`, light_blue) and a whip."""
    root = part('beacon')
    K = Kit('beacon', root)
    # ballast drum: filled with regolith on site; stacking lip, filler cap, carry handle
    K.lathe('painted_dark', [(0.0, 0.0), (0.255, 0.0), (0.285, 0.025), (0.285, 0.105), (0.262, 0.135), (0.13, 0.16), (0.078, 0.16),
                             (0.078, 0.215), (0.062, 0.225), (0.0, 0.225)], 20, smooth=40.0)
    K.lathe('painted_orange', [(0.288, 0.045), (0.288, 0.085)], 20, smooth=40.0)
    K.lathe('painted_orange', [(0.0, 0.0), (0.045, 0.0), (0.045, 0.022), (0.03, 0.03), (0.0, 0.03)], 8, T(0.175, 0.03, 0.146) @ R('Y', 9))
    K.handle('aluminium', (-0.20, -0.07, 0.14), (-0.20, 0.07, 0.14), 0.05, 0.009, 5, normal=(-0.2, 0, 1))
    for i in range(3):
        a = 90 + 120 * i + 60
        M = R('Z', a)
        K.prism('aluminium', [(0.20, -0.028), (0.50, -0.02), (0.56, 0.0), (0.50, 0.02), (0.20, 0.028)], 0.016, M @ T(0, 0, 0.026))
        K.lathe('painted_dark', [(0.0, 0.0), (0.058, 0.0), (0.058, 0.014), (0.0, 0.02)], 8, M @ T(0.52, 0, 0.0))
        K.bolt('aluminium', 0.016, 0.012, M @ T(0.52, 0, 0.034))
        K.box('painted_dark', (0.05, 0.075, 0.04), (0.265, 0, 0.03), M)
    # mast: white lower tube with orange bands, clamp collar, bare upper tube
    K.lathe('painted_white', [(0.034, 0.215), (0.034, 1.02)], 10, smooth=60.0)
    for z0, z1 in ((0.40, 0.56), (0.76, 0.92)):
        K.lathe('painted_orange', [(0.0355, z0), (0.0355, z1)], 10, smooth=60.0)
    K.lathe('painted_dark', [(0.034, 0.985), (0.048, 0.99), (0.048, 1.04), (0.036, 1.05), (0.025, 1.05)], 10)
    K.box('painted_orange', (0.02, 0.07, 0.022), (0.05, -0.025, 1.015))
    K.lathe('aluminium', [(0.025, 1.04), (0.025, 1.80)], 10, smooth=60.0)
    # electronics pod on the back of the mast, wrapped in foil, with end plates and two clamps
    K.box('gold_foil', (0.19, 0.12, 0.26), (0, 0.105, 1.30), bevel=0.014)
    for z in (1.165, 1.435):
        K.box('painted_white', (0.205, 0.135, 0.018), (0, 0.105, z), bevel=0.004)
    for z in (1.22, 1.38):
        K.box('painted_dark', (0.07, 0.06, 0.024), (0, 0.02, z))
    K.box('painted_orange', (0.10, 0.006, 0.05), (0.02, 0.168, 1.33))
    K.hose('painted_dark', [(0.03, 0.10, 1.155), (0.035, 0.07, 1.06), (0.04, 0.03, 0.90), (0.04, 0.02, 0.30), (0.05, 0.03, 0.22)], 0.006, 4, 2)
    # solar cell on a bracket, tilted up toward the front
    Ms = T(0, -0.16, 1.50) @ R('X', 42)
    K.box('aluminium', (0.38, 0.28, 0.016), (0, 0, 0), Ms, bevel=0.004)
    for i in range(3):
        for j in range(2):
            K.box('solar_cell', (0.108, 0.118, 0.006), (-0.12 + 0.12 * i, -0.064 + 0.128 * j, 0.011), Ms)
    K.tube('aluminium', [(0, -0.02, 1.44), Ms @ Vector((0, -0.03, -0.004))], 0.011, 6)
    K.tube('aluminium', [(0, -0.02, 1.60), Ms @ Vector((0, 0.085, -0.004))], 0.007, 5)
    K.box('painted_dark', (0.07, 0.20, 0.014), (0, 0.02, -0.014), Ms)
    K.lathe('painted_dark', [(0.026, 1.41), (0.038, 1.415), (0.038, 1.46), (0.026, 1.465)], 8)
    K.lathe('painted_dark', [(0.026, 1.585), (0.034, 1.59), (0.034, 1.615), (0.026, 1.62)], 8)
    # whip antenna on the pod: spring base, tapered whip, tip ball
    wb = Vector((0.055, 0.125, 1.444))
    K.lathe('painted_dark', [(0.0, 0.0), (0.02, 0.0), (0.02, 0.012), (0.012, 0.018), (0.015, 0.03), (0.011, 0.04), (0.014, 0.05), (0.008, 0.062),
                             (0.0, 0.062)], 8, T(*wb))
    whip = [wb + Vector((0, 0, 0.06)), wb + Vector((0.006, 0.004, 0.32)), wb + Vector((0.02, 0.012, 0.56)), Vector((0.10, 0.15, 2.192))]
    K.tube('painted_dark', whip, 0.0045, 4, radii=[1.0, 0.85, 0.7, 0.5])
    K.rock('painted_orange', 0.011, (0.10, 0.15, 2.19), subdiv=1, rough=0.0, spin=False)
    # lamp head: collar, four-bar cage with a lifting ring; the lens itself is the part `lamp`
    K.lathe('painted_dark', [(0.025, 1.765), (0.06, 1.77), (0.108, 1.80), (0.108, 1.832), (0.085, 1.842), (0.0, 1.842)], 14)
    K.lathe('painted_orange', [(0.109, 1.806), (0.109, 1.826)], 14, smooth=60.0)
    for i in range(4):
        a = rad(45 + 90 * i)
        c, s_ = cos(a), sin(a)
        K.tube('aluminium', [(0.10 * c, 0.10 * s_, 1.835), (0.10 * c, 0.10 * s_, 2.03), (0.06 * c, 0.06 * s_, 2.085), (0.0, 0.0, 2.09)],
               0.0065, 5, round_r=0.04, caps=False)
    K.lathe('aluminium', [(0.0, 2.075), (0.034, 2.075), (0.034, 2.094), (0.0, 2.10)], 8)
    K.lathe('aluminium', [(0.099, 1.93), (0.106, 1.93), (0.106, 1.945), (0.099, 1.945)], 14, close=True)
    L = Kit('lamp', part('lamp', parent=root, loc=(0, 0, 1.945)))
    lens = [(0.062, -0.103)]
    for k in range(5):
        z = -0.097 + 0.038 * k
        lens += [(0.087, z), (0.076, z + 0.026)]
    lens += [(0.082, 0.093), (0.055, 0.115), (0.0, 0.122)]
    L.lathe('light_blue', lens, 14, smooth=30.0)
    L.finish()
    K.finish()
    anchor('light', root, loc=(0, 0, 1.945))
    anchor('col_post', root, loc=(0, 0, 0), radius=0.35)
    return finish(root, 'beacon', samples=32, distance=0.5)


# ==============================================================================================
# o2_cache.glb
# ==============================================================================================
def build_o2_cache():
    """A field rack of three oxygen bottles on skids, with a manifold, a two-gauge regulator and a
    coiled hose. Parts `tank_0`..`tank_2` (origin at the foot of each bottle) are hidden as they
    are used; each carries its own strap, so the rack stays tidy when a bottle is gone."""
    root = part('o2_cache')
    K = Kit('rack', root)
    XS = (-0.30, 0.0, 0.30)
    TZ = 0.095                      # top of the tray: the bottles stand here
    # skids and tray
    for sx in (-1, 1):
        K.tube('aluminium', [(sx * 0.43, -0.34, 0.115), (sx * 0.43, -0.25, 0.028), (sx * 0.43, 0.25, 0.028), (sx * 0.43, 0.34, 0.115)], 0.022, 6,
               round_r=0.07)
    for y in (-0.17, 0.17):
        K.tube('aluminium', [(-0.43, y, 0.03), (0.43, y, 0.03)], 0.018, 6)
    for sx in (-1, 1):
        for sy in (-1, 1):                                              # rubber plugs in the skid ends
            K.rock('rubber', 0.027, (sx * 0.43, sy * 0.345, 0.12), subdiv=1, rough=0.0, spin=False)
    K.box('aluminium', (0.94, 0.42, 0.03), (0, 0, TZ - 0.015), bevel=0.006)
    K.box('painted_orange', (0.945, 0.012, 0.034), (0, -0.212, TZ - 0.015))
    for x in XS:                                                       # rubber boots the bottles sit in
        K.lathe('rubber', [(0.142, 0.0), (0.142, 0.055), (0.125, 0.055), (0.125, 0.012), (0.0, 0.012)], 12, T(x, 0, TZ), smooth=50.0)
    # back frame: a hoop of tube that doubles as the carry handle, two cross bars with saddles
    K.tube('aluminium', [(-0.45, 0.19, 0.03), (-0.45, 0.19, 1.44), (0.45, 0.19, 1.44), (0.45, 0.19, 0.03)], 0.021, 8, round_r=0.12)
    for z in (0.42, 0.86):
        K.tube('aluminium', [(-0.45, 0.19, z), (0.45, 0.19, z)], 0.016, 6)
        for x in XS:
            K.lathe('aluminium', [(0.124, -0.035), (0.138, -0.035), (0.138, 0.035), (0.124, 0.035)], 5, T(x, 0, z + TZ - 0.09) @ R('Z', 20),
                    arc=rad(140), close=True, caps=True, smooth=50.0)
            K.box('aluminium', (0.05, 0.06, 0.04), (x, 0.16, z + TZ - 0.09))
    for sx in (-1, 1):                                                  # diagonal braces down to the skids
        K.tube('aluminium', [(sx * 0.45, 0.19, 0.62), (sx * 0.43, -0.20, 0.05)], 0.012, 6)
    # manifold along the top bar, pigtails down to the three valves
    MZ = 1.33
    K.tube('steel', [(-0.36, 0.19, MZ), (0.40, 0.19, MZ)], 0.016, 8)
    for sx in (-0.40, 0.33):
        K.box('aluminium', (0.03, 0.05, MZ - 1.20 + 0.02), (sx, 0.19, (MZ + 1.20) / 2 + 0.11), bevel=0.0)
    for x in XS:
        K.lathe('steel', [(0.0, 0.0), (0.02, 0.0), (0.02, 0.03), (0.0, 0.03)], 6, T(x, 0.19, MZ - 0.03) @ R('X', 180) @ T(0, 0, -0.03))
        K.hose('rubber', [(x, 0.19, MZ - 0.035), (x + 0.02, 0.17, MZ - 0.12), (x + 0.015, 0.09, MZ - 0.16), (x, 0.055, TZ + 1.125)], 0.009, 5, 3)
    # regulator on the right-hand end: body, two gauges, knob, outlet
    RX = 0.40
    K.lathe('steel', [(0.0, -0.05), (0.03, -0.05), (0.036, -0.04), (0.036, 0.04), (0.03, 0.05), (0.0, 0.05)], 8, T(RX, 0.19, MZ) @ AX['X'])
    for gx, gz, ga in ((RX - 0.035, MZ + 0.075, 0), (RX + 0.05, MZ + 0.07, 0)):
        G = T(gx, 0.16, gz) @ R('X', 90)
        K.lathe('painted_dark', [(0.0, -0.02), (0.046, -0.02), (0.046, 0.018), (0.04, 0.022), (0.04, 0.012)], 10, G)
        K.lathe('plastic_white', [(0.0, 0.012), (0.04, 0.012)], 10, G @ R('X', 180) @ T(0, 0, -0.024))
        K.box('painted_orange', (0.006, 0.03, 0.003), (0.0, 0.01, 0.0145), G @ R('Z', 35 + 150 * (gx > RX)))
        K.tube('steel', [(gx, 0.19, gz - 0.04), (gx, 0.19, MZ)], 0.008, 5)
    K.lathe('painted_orange', [(0.0, 0.0), (0.032, 0.0), (0.038, 0.01), (0.038, 0.035), (0.026, 0.045), (0.0, 0.045)], 6,
            T(RX, 0.16, MZ) @ R('X', 90))
    # hose: from the regulator outlet round a hook on the upright, two and a half turns, free end hanging
    hook = Vector((0.50, 0.19, 0.98))
    K.tube('aluminium', [(0.46, 0.19, 1.02), (0.56, 0.19, 1.02), (0.56, 0.19, 1.07)], 0.009, 5, round_r=0.02)
    coil = [Vector((RX + 0.05, 0.19, MZ)), Vector((RX + 0.10, 0.19, MZ - 0.01)), Vector((0.525, 0.20, 1.20))]
    for k in range(27):
        a = rad(90 - 360 * k / 12.0)
        r_ = 0.135 + 0.003 * (k % 12)
        coil.append(Vector((0.515 + 0.014 * (k / 12.0), 0.19 + r_ * cos(a), 0.885 + r_ * sin(a))))
    coil += [Vector((0.55, 0.10, 0.78)), Vector((0.56, 0.09, 0.52)), Vector((0.555, 0.11, 0.40))]
    K.tube('rubber', coil, 0.011, 5)
    K.lathe('steel', [(0.0, 0.0), (0.014, 0.0), (0.018, 0.012), (0.018, 0.06), (0.012, 0.07), (0.0, 0.07)], 6, T(0.555, 0.11, 0.33))
    # label plate on the tray
    K.box('painted_yellow', (0.30, 0.008, 0.10), (-0.26, -0.214, TZ + 0.045))
    K.text('painted_dark', 'O2', 0.075, T(-0.26, -0.2195, TZ + 0.045) @ R('X', 90), res=3)
    K.finish()

    for i, x in enumerate(XS):
        B = Kit(f'tank_{i}', part(f'tank_{i}', parent=root, loc=(x, 0, TZ)))
        B.lathe('painted_white', [(0.0, 0.004), (0.07, 0.008), (0.108, 0.03), (0.12, 0.07), (0.12, 0.86)], 14, smooth=50.0)
        B.lathe('painted_blue', [(0.12, 0.86), (0.112, 0.925), (0.088, 0.98), (0.052, 1.015), (0.036, 1.025), (0.036, 1.06), (0.0, 1.06)], 14,
                smooth=50.0)
        B.lathe('painted_blue', [(0.1225, 0.52), (0.1225, 0.58)], 14, smooth=50.0)                       # retaining strap
        B.box('steel', (0.05, 0.016, 0.045), (0, -0.125, 0.55))
        # valve: body, outlet toward the manifold, handwheel, guard bow
        B.box('steel', (0.05, 0.05, 0.07), (0, 0, 1.09), bevel=0.008)
        B.lathe('steel', [(0.0, 0.0), (0.016, 0.0), (0.016, 0.045), (0.0, 0.045)], 6, T(0, 0.02, 1.095) @ AX['Y'])
        B.lathe('steel', [(0.0, 0.0), (0.008, 0.0), (0.008, 0.03), (0.0, 0.03)], 5, T(0, 0, 1.12))
        wheel = [(0.047 * (1.0 if k % 2 else 0.78) * cos(TAU * k / 12), 0.047 * (1.0 if k % 2 else 0.78) * sin(TAU * k / 12)) for k in range(12)]
        B.prism('painted_blue', wheel, 0.014, T(0, 0, 1.155))
        B.tube('steel', [(-0.075, 0, 1.0), (-0.075, 0, 1.20), (0.075, 0, 1.20), (0.075, 0, 1.0)], 0.008, 4, round_r=0.04)
        B.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=0.7)
    return finish(root, 'o2_cache', samples=32, distance=0.5)


# ==============================================================================================
# supply_pod.glb
# ==============================================================================================
def build_supply_pod():
    """An air-dropped resupply capsule, landed: a hexagonal base pan 1.4 m across, six petals
    folded open on their hinges over the deflated airbags, the cargo canister in the middle with a
    hinged `lid` (part; origin on the hinge at the back edge, opens about its local X axis), an
    amber strobe on a side mast and the drogue bundle on the ground where it fell."""
    root = part('supply_pod')
    K = Kit('pod', root)
    rng = random.Random(11)
    RB, ZH = 0.70, 0.185
    AP = RB * cos(rad(30))
    # --- base pan: dark crush cone underneath, white rim and deck on top ---
    K.lathe('painted_dark', [(0.0, 0.03), (0.44, 0.03), (0.66, 0.10), (0.70, 0.14)], 6, smooth=20.0)
    K.lathe('painted_white', [(0.70, 0.14), (0.708, 0.145), (0.708, 0.19), (0.69, 0.20), (0.0, 0.20)], 6, smooth=20.0)
    for k in range(6):
        a = rad(60 * k)
        K.bolt('aluminium', 0.022, 0.014, T(0.62 * cos(a), 0.62 * sin(a), 0.20))
    # --- cargo canister: tapered hexagon, open at the top under the lid, cargo showing inside ---
    ZT = 0.86
    K.lathe('painted_white', [(0.50, 0.20), (0.50, 0.25), (0.47, 0.275), (0.43, ZT - 0.02), (0.445, ZT), (0.40, ZT), (0.40, ZT - 0.07),
                              (0.0, ZT - 0.07)], 6, smooth=20.0)
    K.lathe('painted_orange', [(0.504, 0.205), (0.504, 0.248)], 6, smooth=20.0)
    for k in range(6):
        a = rad(60 * k)
        c, s_ = cos(a), sin(a)
        K.beam('aluminium', (0.475 * c, 0.475 * s_, 0.275), (0.436 * c, 0.436 * s_, ZT - 0.02), 0.05, 0.03, up=(c, s_, 0.1))
    for (x, y, sx, sy, sz, m) in ((-0.12, -0.10, 0.26, 0.22, 0.06, 'gold_foil'), (0.17, 0.06, 0.22, 0.30, 0.05, 'painted_white'),
                                  (-0.10, 0.18, 0.28, 0.18, 0.045, 'painted_orange')):
        K.box(m, (sx, sy, sz), (x, y, ZT - 0.07 + sz / 2), bevel=0.012)

    def face(k, u=0.0, h=0.5, out=0.0):
        """Frame on canister side k (0 = front, -Y): x along the side, y up it, z outward."""
        phi = rad(270 + 60 * k)
        z = 0.275 + (ZT - 0.02 - 0.275) * h
        ap = (0.47 + (0.43 - 0.47) * h) * cos(rad(30))
        n = Vector((cos(phi) * 0.998, sin(phi) * 0.998, 0.061))
        t = Vector((-sin(phi), cos(phi), 0))
        p = Vector((cos(phi) * ap, sin(phi) * ap, z)) + t * u + n * out
        return frame(p, n, t)

    K.text('painted_dark', 'SUPPLY', 0.085, face(0, 0.0, 0.62, 0.004))
    K.box('painted_orange', (0.36, 0.022, 0.004), (0, -0.085, 0.002), face(0, 0, 0.62))
    K.handle('aluminium', (-0.10, 0, 0), (0.10, 0, 0), 0.045, 0.010, 5, normal=(0, 0, 1), M=face(0, 0, 0.22))
    for k in (1, 5):                                                    # front quarters: hazard chevrons and a handle
        for j in range(3):
            K.poly('painted_orange', [(-0.15 + 0.10 * j, -0.07, 0.003), (-0.09 + 0.10 * j, -0.07, 0.003), (-0.03 + 0.10 * j, 0.07, 0.003),
                                      (-0.09 + 0.10 * j, 0.07, 0.003)], face(k, 0, 0.66))
        K.handle('aluminium', (-0.10, 0, 0), (0.10, 0, 0), 0.045, 0.010, 5, normal=(0, 0, 1), M=face(k, 0, 0.24))
    for k in (2, 4):                                                    # rear quarters: a louvred vent and a tie-down ring
        K.box('painted_dark', (0.26, 0.15, 0.006), (0, 0, 0.002), face(k, 0, 0.60))
        for j in range(3):
            K.box('painted_white', (0.28, 0.022, 0.018), (0, -0.05 + 0.05 * j, 0.012), face(k, 0, 0.60))
        K.torus('aluminium', 0.035, 0.008, 8, 4, face(k, 0, 0.20, 0.012) @ R('X', 90))
    K.box('painted_dark', (0.16, 0.10, 0.03), (0, 0, 0.012), face(3, 0.10, 0.40))                      # umbilical plate at the back
    K.lathe('aluminium', [(0.0, 0.0), (0.028, 0.0), (0.028, 0.03), (0.0, 0.03)], 8, face(3, 0.10, 0.40, 0.026))
    K.box('painted_dark', (0.07, 0.05, 0.03), (0, 0, 0.012), face(0, 0, 0.955))                         # lid latch keeper
    for sx in (-1, 1):                                                  # hinge brackets
        K.box('aluminium', (0.07, 0.04, 0.07), (sx * 0.17, 0.385, ZT - 0.03))
    # --- petals: white outside, foil and ribs inside, each lying where it fell ---
    L, WB, WT = 0.96, 0.66, 0.26
    PET = (6, -9, 21, 3, -7, 14)                  # how far each petal's tip is lifted, degrees
    for k, lift in enumerate(PET):
        M = R('Z', 60 * k) @ T(0, AP + 0.012, ZH) @ R('X', lift)
        out = [(-WB / 2, 0.035), (WB / 2, 0.035), (WT / 2 + 0.03, L - 0.05), (WT / 2 - 0.02, L), (-WT / 2 + 0.02, L), (-WT / 2 - 0.03, L - 0.05)]
        K.prism('painted_white', out, 0.05, M @ T(0, 0, -0.025), bevel=0.008)
        ins = [(-WB / 2 + 0.06, 0.09), (WB / 2 - 0.06, 0.09), (WT / 2 - 0.01, L - 0.09), (-WT / 2 + 0.01, L - 0.09)]
        K.prism('gold_foil', ins, 0.008, M, z0=0.0, cap_bottom=False)
        for sx in (-1, 1):
            K.beam('aluminium', (sx * (WB / 2 - 0.035), 0.07, 0.012), (sx * (WT / 2 + 0.005), L - 0.07, 0.012), 0.03, 0.024, M=M)
            K.lathe('painted_dark', [(0.0, -0.055), (0.024, -0.055), (0.024, 0.055), (0.0, 0.055)], 6, M @ T(sx * 0.19, 0.0, -0.01) @ AX['X'])
            K.box('aluminium', (0.07, 0.08, 0.03), (sx * 0.19, -0.035, -0.03), R('Z', 60 * k) @ T(0, AP + 0.012, ZH))
        for y in (0.36, 0.66):
            w = WB + (WT - WB) * (y / L)
            K.box('aluminium', (w - 0.07, 0.03, 0.022), (0, y, 0.011), M)
        K.box('aluminium', (0.07, 0.05, 0.04), (0, L - 0.03, 0.012), M)                                 # latch hook at the tip
        K.box('painted_orange', (WT + 0.16, 0.12, 0.004), (0, L - 0.26, -0.052), M)                    # marker band on the outer skin
        K.box('painted_orange', (0.10, 0.10, 0.004), (0, 0.30, 0.0095), M)
    # --- strobe on a mast at the left corner, clear of the lid's swing ---
    K.box('aluminium', (0.07, 0.06, 0.05), (-0.455, 0, 0.62))
    K.tube('aluminium', [(-0.47, 0, 0.52), (-0.50, 0, 0.60), (-0.50, 0, 1.16)], 0.012, 6, round_r=0.03)
    K.lathe('painted_dark', [(0.0, 0.0), (0.04, 0.0), (0.04, 0.025), (0.03, 0.03), (0.0, 0.03)], 8, T(-0.50, 0, 1.15))
    K.lathe('light_amber', [(0.03, 0.0), (0.034, 0.012), (0.034, 0.05), (0.022, 0.07), (0.0, 0.075)], 10, T(-0.50, 0, 1.18), smooth=50.0)
    anchor('strobe', root, loc=(-0.50, 0, 1.22))
    # --- deflated airbags: slack lobes round the base, under and between the petals ---
    # one slack apron of fabric with six lobes, gathered into folds by the retraction cords; it is
    # pressed down wherever a petal lies on it
    def under_petal(p):
        low = 9.0
        for k, lift in enumerate(PET):
            q = R('Z', -60 * k) @ p
            y = q.y - AP - 0.012
            if 0.0 < y < L * cos(rad(lift)) + 0.05 and abs(q.x) < (WB + (WT - WB) * min(1.0, y / L)) / 2 + 0.05:
                low = min(low, ZH + y * math.tan(rad(lift)) - 0.065)
        return low

    bm = K.bm('canvas', smooth=70.0)
    NA, NR = 72, 6
    grid = []
    for i in range(NA):
        th = TAU * i / NA
        lobe = 0.5 + 0.5 * cos(6 * th + 0.5 * sin(2 * th))                        # 1 on a lobe (between two petals), 0 under a petal
        r_out = 1.02 + 0.50 * lobe + 0.07 * noise3((cos(th), sin(th), 0), 2.6, 1.0)
        crease = abs(sin(th * 13 + 2.6 * sin(th * 3 + 0.7))) ** 0.6                 # sharp radial folds
        col = []
        for j in range(NR + 1):
            t = j / NR
            r_ = 0.56 + (r_out - 0.56) * t
            body = sin(pi * min(1.0, t * 1.08) ** 0.75)
            h = (0.04 + 0.22 * lobe) * body * (0.25 + 0.75 * crease) + 0.03 * noise3((r_ * cos(th), r_ * sin(th), 0), 7.0, 2.0) * body
            if j == 0:
                h = 0.11
            p = Vector((r_ * cos(th), r_ * sin(th), max(0.004, h) if j < NR else 0.0))
            p.z = min(p.z, max(0.006 if j < NR else 0.0, under_petal(p)))
            col.append(bm.verts.new(p))
        grid.append(col)
    for i in range(NA):
        a, b = grid[i], grid[(i + 1) % NA]
        for j in range(NR):
            bm.faces.new((a[j], a[j + 1], b[j + 1], b[j]))
    for k in range(6):                                                  # retraction cords over the lobes
        th = rad(60 * k) + 0.12 * (hash01(k, 4) - 0.5)
        pts = []
        for t in (0.0, 0.3, 0.55, 0.8, 1.0):
            r_ = 0.66 + (1.50 - 0.66) * t
            pts.append((r_ * cos(th), r_ * sin(th), 0.19 * (1 - t) ** 1.5 + 0.21 * sin(pi * t) ** 0.8 * (0.9 if t < 1 else 0) + 0.012))
        K.tube('canvas_dark', pts, 0.007, 3)
    # --- drogue canopy and its bridle, lying where it came down: orange and white gores ---
    cb = Vector((2.02, 1.22, 0))
    NG = 12
    for g in range(NG):
        bmg = K.bm('painted_orange' if g % 2 else 'canvas', smooth=70.0)
        ring = []
        for e in (0, 1):
            th = TAU * (g + e) / NG
            fold = 0.55 + 0.45 * abs(sin(th * 2.5 + 0.6))
            ring.append([cb + Vector((r_ * (0.62 + 0.10 * sin(th * 2 + 1)) * cos(th), r_ * (0.46 + 0.08 * cos(th * 3)) * sin(th),
                                      0.004 + (0.11 * fold * sin(pi * min(1.0, r_ * 0.92)) if r_ < 1 else 0.0) + (0.05 if r_ == 0 else 0.0)))
                         for r_ in (0.0, 0.4, 0.75, 1.0)])
        a, b = ring
        va, vb = [bmg.verts.new(p) for p in a], [bmg.verts.new(p) for p in b]
        bmg.faces.new((va[0], va[1], vb[1]))
        for j in (1, 2):
            bmg.faces.new((va[j], va[j + 1], vb[j + 1], vb[j]))
    for k, (ex, ey) in enumerate(((0.36, 0.20), (0.30, 0.26), (0.40, 0.14))):
        mid = Vector((1.05 + 0.1 * k, 0.60 + 0.16 * k - 0.1, 0.012))
        K.tube('canvas_dark', [(ex, ey, ZT + 0.01), (0.47, 0.30, ZT - 0.10), (0.62, 0.38, 0.22), (0.80, 0.46, 0.16), mid,
                               cb + Vector((-0.30 + 0.08 * k, -0.16 + 0.1 * k, 0.03))], 0.008, 3, round_r=0.05)
    K.finish()

    # --- the lid: a shallow hexagonal dome with a rim band, handle, latch and hinge knuckles ---
    HY = 0.385
    Ld = Kit('lid', part('lid', parent=root, loc=(0, HY, ZT)))
    Mc = T(0, -HY, 0)
    Ld.lathe('painted_white', [(0.40, 0.002), (0.452, 0.002), (0.452, 0.04), (0.37, 0.085), (0.15, 0.105), (0.0, 0.105)], 6, Mc, smooth=20.0)
    Ld.lathe('painted_orange', [(0.455, 0.006), (0.455, 0.036)], 6, Mc, smooth=20.0)
    Ld.lathe('gold_foil', [(0.0, 0.086), (0.15, 0.086), (0.36, 0.066), (0.40, 0.03), (0.40, 0.002)], 6, Mc, smooth=20.0)      # lining, seen when open
    Ld.lathe('aluminium', [(0.0, 0.0), (0.15, 0.0), (0.15, 0.012), (0.0, 0.012)], 6, Mc @ T(0, 0, 0.104))
    Ld.handle('aluminium', (-0.09, 0, 0.11), (0.09, 0, 0.11), 0.05, 0.010, 5, normal=(0, 0, 1), M=Mc)
    for k in range(6):
        a = rad(60 * k + 30)
        Ld.bolt('aluminium', 0.016, 0.01, Mc @ T(0.27 * cos(a), 0.27 * sin(a), 0.092) @ R('Z', 60 * k + 30) @ R('Y', 5))
    Ld.box('painted_dark', (0.08, 0.035, 0.06), (0, -0.392 - HY + 0.0, 0.012))
    for sx in (-1, 1):
        Ld.lathe('painted_dark', [(0.0, -0.045), (0.02, -0.045), (0.02, 0.045), (0.0, 0.045)], 6, T(sx * 0.17, 0.0, 0.0) @ AX['X'])
        Ld.box('aluminium', (0.05, 0.05, 0.02), (sx * 0.17, -0.03, 0.022))
    Ld.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=0.9)

    def tint(co, name, a):
        if name == 'canvas':                    # dust settles in the folds of the fabric
            return a * (0.30 + 0.70 * min(1.0, co.z / 0.15) ** 1.2)
        return None
    return finish(root, 'supply_pod', samples=32, distance=0.5, tint=tint)


# ==============================================================================================
# rtg.glb
# ==============================================================================================
def build_rtg():
    """A radioisotope thermoelectric generator standing on its transport foot: a black finned
    core 1.1 m long, bolted end caps, copper coolant loops, lifting eyes, yellow warning bands and
    a trefoil placard front and back."""
    root = part('rtg')
    K = Kit('rtg', root)
    Z0, Z1 = 0.12, 1.02                          # the finned length
    # foot: a ring with four outriggers
    K.lathe('painted_grey', [(0.0, 0.0), (0.215, 0.0), (0.23, 0.015), (0.23, 0.05), (0.185, 0.075), (0.0, 0.075)], 16, smooth=40.0)
    for k in range(4):
        M = R('Z', 45 + 90 * k)
        K.prism('painted_grey', [(0.17, -0.04), (0.40, -0.03), (0.43, 0.0), (0.40, 0.03), (0.17, 0.04)], 0.028, M @ T(0, 0, 0.014))
        K.bolt('aluminium', 0.018, 0.012, M @ T(0.385, 0, 0.028))
    # core and end caps
    K.lathe('painted_dark', [(0.175, 0.075), (0.175, Z0), (0.17, Z0 + 0.02), (0.17, (Z0 + Z1) / 2), (0.17, Z1 - 0.02), (0.175, Z1), (0.175, Z1 + 0.02)], 16, smooth=50.0)
    cap = [(0.17, 0.0), (0.215, 0.0), (0.215, 0.028), (0.18, 0.034), (0.16, 0.06), (0.095, 0.088), (0.0, 0.096)]
    K.lathe('aluminium', cap, 16, T(0, 0, Z1 + 0.012), smooth=40.0)
    K.lathe('aluminium', [(0.17, 0.0), (0.215, 0.0), (0.215, 0.03), (0.17, 0.03)], 16, T(0, 0, Z0 - 0.045), close=True, smooth=40.0)
    K.bolt_circle('steel', 0.196, 8, 0.012, 0.012, T(0, 0, Z1 + 0.04), seg=5)
    K.bolt_circle('steel', 0.196, 8, 0.012, 0.012, T(0, 0, Z0 - 0.015), seg=5)
    for z0, z1 in ((Z0 - 0.04, Z0 - 0.02), (Z1 + 0.017, Z1 + 0.037)):
        K.lathe('painted_yellow', [(0.217, z0), (0.217, z1)], 16, smooth=60.0)
    # eight fins with chamfered corners; yellow blocks on the tips read as two dashed warning bands
    FR = 0.315
    fin = [(0.15, Z0 + 0.012), (FR - 0.045, Z0 + 0.012), (FR, Z0 + 0.075), (FR, Z1 - 0.075), (FR - 0.045, Z1 - 0.012), (0.15, Z1 - 0.012)]
    for k in range(8):
        M = R('Z', 22.5 + 45 * k)
        K.prism('painted_grey', fin, 0.014, M @ R('X', 90), smooth=30.0)
        for z in (Z0 + 0.20, Z1 - 0.20):
            K.box('painted_yellow', (0.045, 0.02, 0.06), (FR - 0.02, 0, z), M)
        K.box('painted_dark', (0.045, 0.034, Z1 - Z0 - 0.10), (0.18, 0, (Z0 + Z1) / 2), M)             # fin root fillet
        for z in (Z0 + 0.36, (Z0 + Z1) / 2, Z1 - 0.36):                                              # stiffening beads across the fin
            K.box('painted_grey', (FR - 0.215, 0.022, 0.012), ((FR + 0.195) / 2, 0, z), M)
    # coolant loops: a tube up every other bay, joined by a ring top and bottom
    for z in (Z0 + 0.045, Z1 - 0.045):
        K.torus('copper', 0.228, 0.011, 16, 5, T(0, 0, z))
    for k in range(4):
        a = rad(90 * k + 45)
        K.tube('copper', [(0.228 * cos(a), 0.228 * sin(a), Z0 + 0.045), (0.228 * cos(a), 0.228 * sin(a), Z1 - 0.045)], 0.011, 5, caps=False)
        for z in (Z0 + 0.30, Z1 - 0.30):
            K.box('steel', (0.045, 0.045, 0.022), (0.20, 0, z), R('Z', 90 * k + 45))
    # top: pressure relief boss, two lifting eyes, connector with a pigtail lead
    K.lathe('steel', [(0.0, 0.0), (0.04, 0.0), (0.04, 0.03), (0.026, 0.04), (0.026, 0.065), (0.0, 0.065)], 8, T(0, 0, Z1 + 0.10))
    for sx in (-1, 1):
        K.box('steel', (0.035, 0.07, 0.04), (sx * 0.125, 0, Z1 + 0.085), bevel=0.006)
        K.torus('steel', 0.036, 0.009, 10, 5, T(sx * 0.125, 0, Z1 + 0.135) @ R('X', 90))
    K.box('painted_grey', (0.07, 0.06, 0.05), (0.0, 0.135, Z1 + 0.065), bevel=0.008)
    K.lathe('steel', [(0.0, 0.0), (0.02, 0.0), (0.02, 0.035), (0.0, 0.035)], 6, T(0.0, 0.165, Z1 + 0.065) @ AX['Y'])
    K.hose('rubber', [(0.0, 0.20, Z1 + 0.065), (0.02, 0.27, Z1 + 0.03), (0.05, 0.345, Z1 - 0.25), (0.06, 0.36, 0.45), (0.10, 0.42, 0.10),
                      (0.22, 0.56, 0.02), (0.36, 0.62, 0.02)], 0.011, 5, 3)
    K.lathe('steel', [(0.0, 0.0), (0.018, 0.0), (0.018, 0.07), (0.0, 0.07)], 6, frame((0.36, 0.62, 0.02), (1, 0.3, 0)))
    # trefoil placards across two fin tips, front and back
    for s in (-1, 1):
        P = frame((0, s * (FR * cos(rad(22.5)) + 0.004), (Z0 + Z1) / 2), (0, s, 0), (-s, 0, 0))
        K.prism('painted_yellow', rrect(0.26, 0.26, 0.03, 2), 0.01, P, z0=0.0)
        for b in range(3):
            a0 = rad(90 + 120 * b - 30)
            pts = [(0.034 * cos(a0 + rad(60) * i / 3), 0.034 * sin(a0 + rad(60) * i / 3), 0.012) for i in range(4)]
            pts += [(0.10 * cos(a0 + rad(60) * i / 3), 0.10 * sin(a0 + rad(60) * i / 3), 0.012) for i in range(3, -1, -1)]
            K.poly('painted_dark', pts[::-1], P)
        K.poly('painted_dark', [(0.02 * cos(rad(60 * i)), 0.02 * sin(rad(60 * i)), 0.012) for i in range(6)], P)
        for sx in (-1, 1):
            for sy in (-1, 1):
                K.bolt('steel', 0.009, 0.006, P @ T(sx * 0.11, sy * 0.11, 0.01), seg=5)
    K.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=0.5)
    return finish(root, 'rtg', samples=32, distance=0.5)


# ==============================================================================================
# debris_a.glb (and the soot helper the three wrecks share)
# ==============================================================================================
def _soot(co, centres, reach=0.8, r0=0.0):
    """0 within r0 of a burn centre, rising to 1 at r0 + reach, with a ragged edge."""
    d = max(0.0, min((co - Vector(c)).length for c in centres) - r0) / reach
    d += 0.22 * noise3(co, 4.0, 1.7)
    t = max(0.0, min(1.0, d))
    t = t * t * (3 - 2 * t)
    return 0.025 + 0.975 * t * t                  # soot is black: the occlusion value is a linear multiplier on the paint


def build_debris_a():
    """Wreckage: a torn section of the descent vehicle's hull, 2.3 m of curved sandwich skin
    stuck in the ground at an angle. White outside with the orange band, foil and ribs inside,
    ragged edges, a blown hole, one corner folded over and scorched."""
    root = part('debris_a')
    K = Kit('hull', root)
    rng = random.Random(5)
    NU, NV, RC, TH = 14, 9, 2.1, 0.045
    ARC, HT = 1.12, 1.80
    W = T(0.0, 0.25, -0.13) @ R('Z', 14) @ R('X', 52)

    def local(i, j):
        u, v = i / NU, j / NV
        phi = (u - 0.5) * ARC
        n = Vector((sin(phi), 0, cos(phi)))
        p = Vector((RC * sin(phi), v * HT, RC * cos(phi) - RC))
        edge = (i in (0, NU)) or (j in (0, NV))
        p += n * (0.05 * noise3(p, 2.4, 0.3) + 0.02 * noise3(p, 6.0, 2.0))                 # buckled skin
        if u > 0.70:                                                                          # the right edge folded back
            ax = RC * sin((0.70 - 0.5) * ARC)
            q = p - Vector((ax, 0, p.z))
            ang = rad(-46) * min(1.0, (u - 0.70) / 0.18) * (0.5 + 0.5 * v)
            p = Vector((ax + q.x * cos(ang), p.y, p.z + q.x * sin(ang)))
        if v > 0.72 and u < 0.42:                                                            # top left corner curled outward
            k = ((v - 0.72) / 0.28) * ((0.42 - u) / 0.42)
            p += n * 0.42 * k * k
        if edge:                                                                              # ragged tear line: long rips and a few deep bites
            jag = 0.10 * noise3(p, 2.1, 3.0) + rng.uniform(-0.05, 0.03) - (0.24 if (i, j) in ((4, NV), (5, NV), (10, 0), (0, 3), (NU, 5)) else 0.0)
            if i == 0:
                p.x -= jag
            if i == NU:
                p.x += jag
            if j == 0:
                p.y -= jag * 0.4
            if j == NV:
                p.y += jag
        return p

    G = [[W @ local(i, j) for j in range(NV + 1)] for i in range(NU + 1)]
    gone = {(5, 4), (6, 4), (6, 5), (5, 3), (0, NV - 1), (0, NV - 2), (1, NV - 1), (NU - 1, 0), (NU - 2, 0), (8, 0), (3, NV - 1)}
    for i in range(NU - 4, NU):
        for j in range(NV - 4, NV):
            if (i - (NU - 4)) + (j - (NV - 4)) >= 4:
                gone.add((i, j))

    def has(i, j):
        return 0 <= i < NU and 0 <= j < NV and (i, j) not in gone

    def nrm(i, j):
        a = G[min(i + 1, NU)][j] - G[max(i - 1, 0)][j]
        b = G[i][min(j + 1, NV)] - G[i][max(j - 1, 0)]
        return a.cross(b).normalized()

    N = [[nrm(i, j) for j in range(NV + 1)] for i in range(NU + 1)]
    for i in range(1, NU):                           # the rim of every hole is pulled about and peeled outward
        for j in range(1, NV):
            around = [has(i, j), has(i - 1, j), has(i, j - 1), has(i - 1, j - 1)]
            if any(around) and not all(around):
                tu, tv = (G[i + 1][j] - G[i - 1][j]).normalized(), (G[i][j + 1] - G[i][j - 1]).normalized()
                G[i][j] = G[i][j] + tu * rng.uniform(-0.07, 0.07) + tv * rng.uniform(-0.07, 0.07) + N[i][j] * rng.uniform(0.03, 0.13)
    IN = [[G[i][j] - N[i][j] * TH for j in range(NV + 1)] for i in range(NU + 1)]
    for i in range(NU):
        for j in range(NV):
            if not has(i, j):
                continue
            c = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
            K.quad('painted_orange' if j in (5, 6) else 'painted_white', *[G[a][b] for a, b in c], smooth=42.0)
            K.quad('gold_foil', *[IN[a][b] for a, b in reversed(c)], smooth=42.0)
            for e, (di, dj) in enumerate(((0, -1), (1, 0), (0, 1), (-1, 0))):            # exposed core on every torn edge
                if not has(i + di, j + dj):
                    (a0, b0), (a1, b1) = c[e], c[(e + 1) % 4]
                    K.quad('painted_dark', G[a1][b1], G[a0][b0], IN[a0][b0], IN[a1][b1])
    # ribs on the inside: two ring frames and three stringers, broken off where the skin is gone
    def rib(cells, up, w=0.04, h=0.07):
        run = []
        for (i, j, ok) in cells + [(0, 0, False)]:
            if ok:
                run.append(IN[i][j] - N[i][j] * (h / 2 - 0.004))
            else:
                if len(run) >= 2:
                    K.sweep('aluminium', run, rect(w, h), up=up, smooth=40.0)
                run = []

    cn = (W.to_3x3() @ Vector((0, 0, 1))).normalized()
    for j in (2, 6):
        rib([(i, j, has(i, j) or has(i - 1, j) or has(i, j - 1) or has(i - 1, j - 1)) for i in range(NU + 1)], cn)
    for i in (3, 7, 11):
        rib([(i, j, has(i, j) or has(i - 1, j) or has(i, j - 1) or has(i - 1, j - 1)) for j in range(NV + 1)], N[i][4], 0.035, 0.055)
    # a stringer torn free and bent, wiring hanging out of the hole, an access port on the outside
    p0 = IN[7][NV] - N[7][NV] * 0.03
    d = (G[7][NV] - G[7][NV - 1]).normalized()
    K.sweep('aluminium', [p0, p0 + d * 0.22 - N[7][NV] * 0.04, p0 + d * 0.38 - N[7][NV] * 0.16], rect(0.035, 0.055), up=N[7][4], smooth=40.0)
    h0 = (IN[5][5] + IN[6][5]) / 2
    for k, (dx, dz) in enumerate(((0.10, 0.02), (-0.06, 0.05))):
        K.hose('rubber', [h0, h0 + Vector((dx, 0.16, -0.10)), h0 + Vector((dx * 2, 0.30, -0.45)), Vector((h0.x + dx * 3, h0.y + 0.42 + dz, 0.02)),
                          Vector((h0.x + dx * 5, h0.y + 0.62 + 2 * dz, 0.015))], 0.012 - 0.003 * k, 5, 3)
    Mp = frame(G[10][2] + N[10][2] * 0.004, N[10][2], G[11][2] - G[10][2])
    K.lathe('aluminium', [(0.0, 0.0), (0.13, 0.0), (0.13, 0.012), (0.10, 0.016), (0.0, 0.016)], 12, Mp)
    K.lathe('painted_dark', [(0.0, 0.016), (0.085, 0.016), (0.085, 0.02), (0.0, 0.02)], 12, Mp)
    K.bolt_circle('aluminium', 0.112, 6, 0.01, 0.008, Mp @ T(0, 0, 0.012), seg=5)
    # panel seams and a stencilled number on the outside
    for i in (4, 10):
        for j in range(NV):
            if has(i, j) and has(i - 1, j):
                tu = (G[i + 1][j] - G[i - 1][j]).normalized() * 0.009
                a, b = G[i][j] + N[i][j] * 0.004, G[i][j + 1] + N[i][j + 1] * 0.004
                K.quad('painted_dark', a - tu, a + tu, b + tu, b - tu)
    K.text('painted_dark', 'DV-3', 0.17, frame((G[1][2] + G[3][3]) / 2 + N[2][2] * 0.006, N[2][2], G[3][2] - G[1][2]), res=2)
    # shards thrown clear: bent slivers of the same sandwich, half buried
    for k, (x, y, yaw, sz) in enumerate(((1.45, -0.55, 30, 0.30), (-1.30, -0.80, 110, 0.22), (0.35, -1.35, 70, 0.17))):
        out = [(sz * (0.35 + 0.9 * hash01(k, a) ** 2) * cos(TAU * a / 7 + 0.5 * hash01(a, k)), sz * 0.6 * (0.3 + 0.8 * hash01(a, k, 2)) * sin(TAU * a / 7))
               for a in range(7)]
        Ms = T(x, y, 0.03 + 0.02 * k) @ R('Z', yaw) @ R('X', 16 + 9 * k) @ R('Y', -12)
        K.prism('painted_white', out, 0.012, Ms @ T(0, 0, 0.018))
        K.prism('painted_dark', out, 0.024, Ms)
        K.prism('gold_foil', out, 0.012, Ms @ T(0, 0, -0.018))
    K.finish()
    anchor('col_body', root, loc=(0, 0.1, 0), radius=1.1)
    burns = [tuple(G[NU - 3][NV - 3]), tuple(G[6][4]), tuple(G[NU][4])]

    def tint(co, name, a):
        if name in ('painted_white', 'painted_orange', 'gold_foil', 'aluminium'):
            return a * _soot(co, burns, 0.95, 0.10)
        return None
    return finish(root, 'debris_a', samples=32, distance=0.6, tint=tint)


# ==============================================================================================
# debris_b.glb
# ==============================================================================================
def build_debris_b():
    """Wreckage: 2.5 m of triangular truss, kinked upward in the middle and twisted, one end
    still carrying its node plate, the other snapped, with a shred of insulation and a skin
    bracket still hanging on it."""
    root = part('debris_b')
    K = Kit('truss', root)
    cl = [Vector(p) for p in ((-1.24, 0.16, 0.30), (-0.84, 0.10, 0.36), (-0.44, 0.02, 0.56), (-0.04, -0.05, 0.84), (0.34, -0.02, 0.60),
                              (0.72, 0.08, 0.36), (1.08, 0.20, 0.27))]
    NS = len(cl)
    RT = 0.25                                      # circumradius of the triangular section
    Pk = []
    for s, c in enumerate(cl):
        t = (cl[min(s + 1, NS - 1)] - cl[max(s - 1, 0)]).normalized()
        up = Vector((0, 0, 1)) - t * t.z
        up.normalize()
        side = t.cross(up)
        tw = rad(-90 + 9 * s + (14 if s >= 4 else 0))
        squash = 1.0 if s != 3 else 0.82                                  # the section crushed a little at the kink
        Pk.append([c + (side * cos(tw + TAU * k / 3) + up * sin(tw + TAU * k / 3) * squash) * RT for k in range(3)])
    # longerons: one whole, two snapped short at the far end
    ends = (NS - 1, NS - 2, NS - 3)
    for k in range(3):
        pts = [Pk[s][k] for s in range(ends[k] + 1)]
        if k == 1:
            pts.append(pts[-1] + Vector((0.20, 0.10, -0.16)))
        if k == 2:
            pts.append(pts[-1] + Vector((0.17, -0.12, 0.13)))
        K.tube('aluminium', pts, 0.03, 8, radii=[1.0] * (len(pts) - 1) + [0.55 if k else 1.0])
    # battens round every station, one diagonal per bay and face; some are missing or hang loose
    skip_b = {(5, 1), (6, 0), (6, 1), (6, 2), (5, 2)}
    for s in range(NS):
        for k in range(3):
            if (s, k) in skip_b:
                continue
            K.tube('aluminium', [Pk[s][k], Pk[s][(k + 1) % 3]], 0.016, 5, caps=False)
    skip_d = {(4, 0), (5, 1), (5, 2), (4, 2), (5, 0), (2, 1)}
    for s in range(NS - 1):
        for k in range(3):
            if (s, k) in skip_d:
                continue
            a, b = Pk[s][k], Pk[s + 1][(k + 1) % 3]
            K.tube('aluminium', [a, b], 0.012, 4, caps=False)
    K.tube('aluminium', [Pk[4][0], Pk[4][0].lerp(Pk[5][1], 0.55) + Vector((0.05, -0.14, -0.20))], 0.012, 4)        # a diagonal hanging by one end
    K.tube('aluminium', [Pk[2][1], Pk[2][1].lerp(Pk[3][2], 0.5) + Vector((0, 0.10, -0.08))], 0.012, 4)
    for s in range(NS):
        for k in range(3):
            if s <= ends[k]:
                K.rock('painted_dark', 0.047, tuple(Pk[s][k]), subdiv=1, rough=0.0, spin=False)                 # node fittings
    # the sound end: triangular node plate with a docking ring and bolts
    t0 = (cl[1] - cl[0]).normalized()
    Me = frame(cl[0] - t0 * 0.035, -t0, Pk[0][0] - cl[0])
    tri = [(0.34 * cos(TAU * k / 3 + a), 0.34 * sin(TAU * k / 3 + a)) for k in range(3) for a in (-0.22, 0.22)]
    K.prism('aluminium', tri, 0.03, Me, bevel=0.006)
    K.lathe('aluminium', [(0.10, 0.015), (0.15, 0.015), (0.15, 0.05), (0.13, 0.06), (0.10, 0.06)], 12, Me, close=True)
    K.lathe('painted_dark', [(0.0, 0.015), (0.10, 0.015), (0.10, 0.03), (0.0, 0.03)], 12, Me)
    K.bolt_circle('painted_dark', 0.21, 6, 0.016, 0.012, Me @ T(0, 0, 0.015), phase=pi / 6)
    # a skin bracket still bolted to two longerons: white panel with an orange edge
    a, b, c, d = Pk[1][0], Pk[2][0], Pk[2][1], Pk[1][1]
    nrm_ = (b - a).cross(d - a).normalized()
    if nrm_.dot((a + c) / 2 - (cl[1] + cl[2]) / 2) < 0:
        nrm_ = -nrm_
    o = nrm_ * 0.045
    Mb = frame((a + b + c + d) / 4 + o, nrm_, b - a)
    K.prism('painted_white', [(-0.26, -0.17), (0.25, -0.20), (0.30, -0.02), (0.22, 0.19), (-0.05, 0.14), (-0.28, 0.17)], 0.022, Mb, bevel=0.004)
    K.box('painted_orange', (0.50, 0.07, 0.004), (0.0, -0.12, 0.013), Mb)
    for x, y in ((-0.2, -0.12), (0.2, -0.12), (-0.2, 0.1), (0.15, 0.1)):
        K.bolt('aluminium', 0.014, 0.01, Mb @ T(x, y, 0.011))
    # a shred of foil blanket snagged over the kink
    fo = K.bm('gold_foil', smooth=60.0)
    rows = []
    top = max(range(3), key=lambda k: Pk[3][k].z)
    for i in range(8):
        u = i / 7
        base = Pk[3][top].lerp(Pk[4][top], u * 1.25 - 0.45) + Vector((0, 0, 0.04))
        row = []
        for j in range(5):
            v = j / 4 - 0.3
            hang = max(0.0, abs(v) - 0.08)
            drop = Vector((0.04 * sin(i * 2.1 + j), v * 0.62 * (1.0 if i % 2 else 0.86), -0.85 * hang ** 1.25 * (0.55 + 0.45 * hash01(i, 3))))
            row.append(fo.verts.new(base + drop + Vector((0, 0, 0.035 * noise3(base + drop, 9.0, 0.5)))))
        rows.append(row)
    for i in range(7):
        for j in range(4):
            fo.faces.new((rows[i][j], rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]))
    back_faces(fo)
    # a harness dragged out of it
    K.hose('rubber', [Pk[5][1], Pk[5][1] + Vector((0.1, 0.12, -0.12)), Vector((0.95, 0.52, 0.02)), Vector((1.25, 0.66, 0.015)),
                      Vector((1.42, 0.50, 0.015))], 0.012, 5, 3)
    K.hose('rubber', [Pk[2][2], Pk[2][2] + Vector((0.02, -0.10, -0.2)), Vector((-0.30, -0.42, 0.02)), Vector((-0.10, -0.60, 0.015))], 0.009, 4, 3)
    K.finish()
    anchor('col_body', root, loc=(0, 0.05, 0), radius=1.0)
    burns = [tuple(Pk[5][1]), tuple(Pk[6][0]), tuple(cl[5])]

    def tint(co, name, a):
        if name in ('aluminium', 'gold_foil', 'painted_white'):
            return a * (0.10 + 0.90 * _soot(co, burns, 0.9, 0.1))
        return None
    return finish(root, 'debris_b', samples=32, distance=0.5, tint=tint)


# ==============================================================================================
# debris_c.glb
# ==============================================================================================
def build_debris_c():
    """Wreckage: a propellant tank lying on its side, split open. A capsule 1.5 m long with two
    mounting bands, torn-off struts, a bent feed line, the burst peeled outward in jagged petals,
    a crushed end, the paint burnt off round the hole."""
    root = part('debris_c')
    K = Kit('tank', root)
    rng = random.Random(8)
    RT, CYL, DOME, NA = 0.46, 0.45, 0.30, 20
    W = T(0, 0, RT - 0.07) @ R('Z', 18) @ R('X', -38)
    rings = [(-CYL - DOME * cos(rad(a)), RT * sin(rad(a))) for a in (24, 46, 68)]
    rings += [(x, RT) for x in (-0.45, -0.30, -0.15, 0.0, 0.15, 0.30, 0.45)]
    rings += [(CYL + DOME * cos(rad(a)), RT * sin(rad(a))) for a in (68, 46, 24)]
    hc = Vector((0.10, 0.0, RT))                     # centre of the burst, on top of the tank in its own frame
    crush = Vector((-CYL - DOME, 0.12, 0.10))        # where the far end was stove in

    def shape(x, r_, th):
        p = Vector((x, -r_ * sin(th), r_ * cos(th)))
        d = (p - crush).length
        if d < 0.42:
            p += (Vector((0.5, 0, 0)) - (p - crush).normalized() * 0.2) * 0.26 * (1 - d / 0.42) ** 1.5
        return p

    wb = bm_new()
    cols = [[wb.verts.new(shape(x, r_, TAU * i / NA)) for (x, r_) in rings] for i in range(NA)]
    pole0, pole1 = wb.verts.new(shape(-CYL - DOME, 0.0, 0.0)), wb.verts.new(shape(CYL + DOME, 0.0, 0.0))
    for i in range(NA):
        a, b = cols[i], cols[(i + 1) % NA]
        wb.faces.new((pole0, b[0], a[0]))
        for k in range(len(rings) - 1):
            wb.faces.new((a[k], b[k], b[k + 1], a[k + 1]))
        wb.faces.new((a[-1], b[-1], pole1))
    bmesh.ops.recalc_face_normals(wb, faces=wb.faces[:])
    # open the burst: drop the faces inside a ragged ellipse round hc
    def inside(c):
        d = c - hc
        return (d.x / 0.36) ** 2 + (d.y / 0.30) ** 2 < 1.0 + 0.9 * noise3(c, 6.0, 0.4) and c.z > 0.2
    dead = [f for f in wb.faces if inside(f.calc_center_median())]
    bmesh.ops.delete(wb, geom=dead, context='FACES')
    wb.normal_update()
    rim = [e for e in wb.edges if len(e.link_faces) == 1]
    for v in sorted({v for e in rim for v in e.verts}, key=lambda v: v.index):    # the lip lifted, dragged about and curled back
        away = (v.co - hc)
        away.z = 0
        slide = v.normal.cross(away).normalized() * (hash01(v.index, 7) - 0.5) * 0.11
        v.co += v.normal * (0.03 + 0.05 * hash01(v.index, 1)) + away.normalized() * (0.07 * hash01(v.index, 2) - 0.03) + slide
    wb.normal_update()
    out = K.bm('painted_white', smooth=45.0)
    inn = K.bm('painted_dark', smooth=45.0)
    for f in wb.faces:
        poly(out, [W @ v.co for v in f.verts])
        poly(inn, [W @ (v.co - v.normal * 0.012) for v in reversed(f.verts)])
    pet = K.bm('steel', smooth=35.0)
    curl = {}
    for v in {v for e in rim for v in e.verts}:                         # the torn skin peeled outward and rolled back
        d = v.co - hc
        away = (d - v.normal * d.dot(v.normal)).normalized()
        ln = 0.06 + 0.30 * hash01(v.index, 3) ** 2
        p1 = v.co + v.normal * ln * 0.60 + away * ln * 0.30
        p2 = p1 + away * ln * 0.62 + v.normal * ln * 0.02
        curl[v.index] = (p1, p2)
    for e in rim:
        a, b = e.verts
        (a1, a2), (b1, b2) = curl[a.index], curl[b.index]
        m1, m2 = (a1 + b1) / 2, (a2 + b2) / 2
        a1, b1 = m1 + (a1 - m1) * 0.80, m1 + (b1 - m1) * 0.80           # splits between neighbouring petals
        a2, b2 = m2 + (a2 - m2) * 0.45, m2 + (b2 - m2) * 0.45
        flip = (b.co - a.co).cross(a1 - a.co).dot(hc - a.co) < 0
        for q in ((a.co, b.co, b1, a1), (a1, b1, b2, a2)):
            poly(pet, [W @ p for p in (reversed(q) if flip else q)])
    back_faces(pet)
    wb.free()
    # paint band, two mounting bands with lugs and torn struts
    K.lathe('painted_orange', [(RT + 0.003, -0.09), (RT + 0.003, 0.09)], NA, W @ T(-0.225, 0, 0) @ AX['X'], arc=rad(250), phase=rad(145), smooth=60.0)
    for x in (-0.40, 0.40):
        Mx = W @ T(x, 0, 0) @ AX['X']
        K.lathe('aluminium', [(RT + 0.002, -0.035), (RT + 0.016, -0.035), (RT + 0.016, 0.035), (RT + 0.002, 0.035)], NA, Mx, smooth=60.0)
        for k, a in enumerate((35, 215)):
            Ml = Mx @ R('Z', a)
            K.box('aluminium', (0.07, 0.06, 0.05), (RT + 0.03, 0, 0), Ml, bevel=0.006)
            stub = [(RT + 0.05, 0, 0), (RT + 0.20, 0.02, 0.03 * (k * 2 - 1)), (RT + 0.30 + 0.08 * k, 0.10, 0.10 * (k * 2 - 1))]
            K.tube('aluminium', stub, 0.018, 6, M=Ml, radii=[1.0, 1.0, 0.5])
    # end fittings: a boss and a bent feed line at one pole, a relief valve at the other
    Mp = W @ T(CYL + DOME - 0.004, 0, 0) @ AX['X']
    K.lathe('aluminium', [(0.0, 0.0), (0.09, 0.0), (0.09, 0.02), (0.05, 0.03), (0.05, 0.07), (0.0, 0.07)], 10, Mp)
    K.bolt_circle('steel', 0.07, 6, 0.008, 0.008, Mp @ T(0, 0, 0.02), seg=5)
    K.tube('steel', [(0, 0, 0.07), (0, 0, 0.20), (0.10, -0.10, 0.34), (0.14, -0.30, 0.36), (0.10, -0.40, 0.30)], 0.02, 6, round_r=0.06, M=Mp)
    # stencil on the shoulder, shards on the ground
    K.text('painted_dark', 'N2H4', 0.10, W @ R('X', 96) @ T(0.13, 0, RT + 0.004), res=2)
    for k, (x, y, yaw, sz) in enumerate(((0.95, -0.75, 20, 0.24), (-0.55, -0.95, 80, 0.18), (1.25, 0.45, 140, 0.15))):
        o = [(sz * (0.35 + 0.9 * hash01(k, a, 5) ** 2) * cos(TAU * a / 6 + 0.5 * hash01(a, k)), sz * 0.6 * (0.3 + 0.8 * hash01(a, k, 7)) * sin(TAU * a / 6))
             for a in range(6)]
        Ms = T(x, y, 0.025) @ R('Z', yaw) @ R('X', 18 + 8 * k) @ R('Y', -10)
        K.prism('painted_white', o, 0.01, Ms @ T(0, 0, 0.01))
        K.prism('steel', o, 0.01, Ms)
    K.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=0.9)
    hw = W @ hc

    def tint(co, name, a):
        if name in ('painted_white', 'painted_orange', 'aluminium', 'steel'):
            return a * _soot(co, [tuple(hw)], 0.52, 0.30)
        return None
    return finish(root, 'debris_c', samples=32, distance=0.5, tint=tint)


# ==============================================================================================
# regolith_pile.glb
# ==============================================================================================
def build_regolith_pile():
    """A heap of freshly dug soil, 2.6 m across and 0.7 m high, with a field shovel stuck in its
    flank. Part `heap` is scaled down by the game as soil is taken (its origin is on the ground at
    the centre); part `shovel` stands in the ground itself, so it stays put as the heap shrinks."""
    root = part('regolith_pile')
    H = Kit('heap', part('heap', parent=root))
    bm = H.bm('regolith', smooth=150.0)
    NA, NR = 28, 7
    dumps = ((0.55, 0.35, 0.50, 0.36), (-0.50, 0.30, 0.55, 0.40), (-0.15, -0.60, 0.50, 0.34), (0.60, -0.35, 0.42, 0.26), (-0.75, -0.30, 0.40, 0.22))
    bite = rad(-58)                                 # the side the digging is done from

    def height(x, y):
        r_ = math.hypot(x, y)
        th = math.atan2(y, x)
        edge = 1.26 * (1.0 + 0.10 * noise3((cos(th), sin(th), 0), 2.2, 0.8) + 0.05 * sin(5 * th + 1.0))
        dug = max(0.0, cos(th - bite)) ** 6
        edge *= 1.0 - 0.20 * dug
        t = min(1.0, r_ / edge)
        peak = Vector((0.12, 0.10))
        h = 0.70 * (1 - t) ** 0.9 * (1 - t * t) ** 0.35 * (1.0 - 0.06 * (Vector((x, y)) - peak).length)
        for (dx, dy, dr, dh) in dumps:                    # separate shovel-loads slumped against the main cone
            q = math.hypot(x - dx, y - dy) / dr
            if q < 1.0:
                h = max(h, dh * (1 - q) ** 0.8 * (1 - q * q) ** 0.3 + 0.55 * h)
        h *= 1.0 - 0.40 * dug * (0.3 + 0.7 * t)
        fade = min(1.0, (1 - t) * 5.0)
        return max(0.0, (h + 0.05 * noise3((x, y, 0), 3.3, 0.2) + 0.025 * noise3((x, y, 0), 8.0, 1.2)) * fade), edge

    top = bm.verts.new((0.12, 0.10, height(0.12, 0.10)[0]))
    rings = []
    for j in range(1, NR + 1):
        ring = []
        for i in range(NA):
            th = TAU * (i + 0.5 * (j % 2)) / NA
            _, edge = height(cos(th), sin(th))
            r_ = edge * (j / NR) ** 0.85
            x, y = 0.12 * (1 - j / NR) + r_ * cos(th), 0.10 * (1 - j / NR) + r_ * sin(th)
            ring.append(bm.verts.new((x, y, height(x, y)[0] if j < NR else 0.0)))
        rings.append(ring)
    for i in range(NA):
        bm.faces.new((top, rings[0][i], rings[0][(i + 1) % NA]))
    for j in range(NR - 1):
        a, b = rings[j], rings[j + 1]
        for i in range(NA):
            i2 = (i + 1) % NA
            if j % 2 == 0:                      # rings are staggered: split each band into triangles
                bm.faces.new((a[i], b[i], a[i2]))
                bm.faces.new((a[i2], b[i], b[i2]))
            else:
                bm.faces.new((a[i], b[(i - 1) % NA], b[i]))
                bm.faces.new((a[i], b[i], a[i2]))
    # clods and stones on and round the heap
    rng = random.Random(4)
    for k in range(14):
        th = rng.uniform(0, TAU)
        r_ = rng.uniform(0.25, 1.50) if k < 9 else rng.uniform(1.15, 1.55)
        x, y = r_ * cos(th), r_ * sin(th)
        s = rng.uniform(0.05, 0.11) * (1.5 if k < 3 else 1.0)
        H.rock('regolith', s, (x, y, height(x, y)[0] + s * 0.35), seed=k, scale=(1.0, 0.8, 0.65), subdiv=2 if k < 3 else 1, rough=0.25, smooth=50.0)
    H.finish()

    # the shovel: buried to half the blade in the flank, leaning in toward the heap
    sx, sy = 0.98 * cos(bite + 0.5), 0.98 * sin(bite + 0.5)
    lean = Euler((rad(-13), rad(9), rad(math.degrees(bite) + 115)), 'XYZ')
    Sv = Kit('shovel', part('shovel', parent=root, loc=(sx, sy, 0.0), rot=tuple(lean)))
    blade = [(-0.095, 0.30), (-0.105, 0.12), (-0.075, 0.02), (0.0, -0.03), (0.075, 0.02), (0.105, 0.12), (0.095, 0.30)]
    bmb = Sv.bm('steel', smooth=40.0)
    front, backv = [], []
    for (x, y) in blade + [(0.0, 0.30), (0.0, 0.12)]:           # a dished blade: the centre line sits back from the edges
        dish = -0.028 * (1 - (abs(x) / 0.105) ** 2)
        front.append(bmb.verts.new((x, dish - 0.004, y - 0.13)))
        backv.append(bmb.verts.new((x, dish + 0.004, y - 0.13)))
    order = ((0, 1, 8, 7), (1, 2, 3, 8), (8, 3, 4, 5), (7, 8, 5, 6))
    for q in order:
        bmb.faces.new([front[i] for i in q])
        bmb.faces.new([backv[i] for i in reversed(q)])
    for i in range(7):
        j = (i + 1) % 7
        bmb.faces.new((front[j], front[i], backv[i], backv[j]))
    for s in (-1, 1):                                               # foot treads on the shoulders
        Sv.box('steel', (0.07, 0.022, 0.012), (s * 0.058, -0.012, 0.17))
    Sv.lathe('steel', [(0.0, 0.11), (0.03, 0.12), (0.024, 0.20), (0.02, 0.30), (0.0, 0.30)], 8, T(0, -0.026, 0))        # socket
    Sv.lathe('painted_orange', [(0.017, 0.28), (0.017, 0.86)], 8, T(0, -0.026, 0), smooth=60.0)                          # shaft
    Sv.lathe('painted_dark', [(0.0, 0.84), (0.024, 0.845), (0.024, 0.90), (0.0, 0.905)], 8, T(0, -0.026, 0))
    Sv.tube('painted_dark', [(-0.012, -0.026, 0.90), (-0.062, -0.026, 0.955), (-0.062, -0.026, 1.03), (0.062, -0.026, 1.03),
                             (0.062, -0.026, 0.955), (0.012, -0.026, 0.90)], 0.013, 6, round_r=0.03)
    Sv.finish()

    def tint(co, name, a):
        if name == 'regolith':                  # fresh spoil is darker than the weathered surface; lighter dry crust on top
            th = math.atan2(co.y, co.x)
            dug = max(0.0, cos(th - bite)) ** 4
            return a * (0.26 + 0.12 * min(1.0, co.z / 0.6) + 0.07 * noise3(co, 5.0, 0.3)) * (1.0 - 0.25 * dug)
        return None
    return finish(root, 'regolith_pile', samples=32, distance=0.6, tint=tint)


# ==============================================================================================
# ice_outcrop.glb
# ==============================================================================================
def _ice_shard(B, rng, pts, M, bevel=0.03, cuts=0.0, dust=0.80):
    """One angular block: the convex hull of `pts` with its edges chamfered, sliced by horizontal
    planes (so dust strata can be painted across it) and with its flattest top faces under dust."""
    tb = bm_new()
    hull(tb, pts, M)
    tb.normal_update()
    if bevel > 0:
        edges = [e for e in tb.edges if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > rad(18)]
        bmesh.ops.bevel(tb, geom=edges, offset=bevel, offset_type='OFFSET', segments=1, profile=0.5, affect='EDGES', clamp_overlap=True)
    if cuts > 0:
        zmax = max(v.co.z for v in tb.verts)
        z = cuts * (0.6 + 0.4 * rng.random())
        while z < zmax - 0.12:
            tilt = Vector((rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12), 1.0)).normalized()
            bmesh.ops.bisect_plane(tb, geom=tb.verts[:] + tb.edges[:] + tb.faces[:], plane_co=(0, 0, z), plane_no=tilt, dist=1e-4)
            z += cuts * rng.uniform(0.8, 1.25)
    tb.normal_update()
    ice, reg = B.bm('ice', smooth=24.0), B.bm('regolith', smooth=24.0)
    for f in tb.faces:
        if f.calc_center_median().z < -0.02 and f.normal.z < 0:
            continue                                                     # buried underside
        poly(reg if (f.normal.z > dust and f.calc_area() > 0.02) else ice, [v.co.copy() for v in f.verts])
    tb.free()


def build_ice_outcrop():
    """Six angular blocks of dirty water ice breaking through the ground over about six metres.
    Each block is a part (`block_0` .. `block_5`, origin on the ground under it) with its own drift
    of dust, so the game can take them away one by one; a cracked pavement of ice stays behind."""
    root = part('ice_outcrop')
    rng = random.Random(21)
    # (x, y, footprint, height, yaw, lean)
    blocks = ((-1.95, 0.45, 1.30, 1.10, 20, 14), (-0.45, -1.30, 1.60, 0.72, -35, -9), (0.40, 0.90, 1.95, 2.05, 65, 8),
              (1.75, -0.65, 1.25, 1.25, 10, -16), (2.45, 1.20, 0.95, 0.60, -50, 11), (-0.95, 2.10, 1.10, 0.80, 130, -12))

    def cloud(cx, cy, w, d, h, sink, n):
        pts = []
        for i in range(n):
            a = TAU * i / n + rng.uniform(-0.25, 0.25)
            rr = rng.uniform(0.78, 1.0)
            pts.append((cx + w / 2 * rr * cos(a), cy + d / 2 * rr * sin(a), -sink))
            rr2 = rng.uniform(0.50, 0.92)
            pts.append((cx + w / 2 * rr2 * cos(a + 0.3) + rng.uniform(-0.08, 0.08) * w, cy + d / 2 * rr2 * sin(a + 0.3), h * rng.uniform(0.60, 0.97)))
        pts.append((cx + rng.uniform(-0.18, 0.18) * w, cy + rng.uniform(-0.18, 0.18) * d, h))
        return pts

    for k, (x, y, fp, ht, yaw, lean) in enumerate(blocks):
        B = Kit(f'block_{k}', part(f'block_{k}', parent=root, loc=(x, y, 0)))
        M = R('Z', yaw) @ R('X', lean) @ R('Y', lean * 0.5)
        _ice_shard(B, rng, cloud(0, 0, fp, fp * 0.72, ht, 0.30, 5), M, 0.035, cuts=0.34)
        _ice_shard(B, rng, cloud(fp * 0.38, -fp * 0.22, fp * 0.55, fp * 0.5, ht * 0.52, 0.25, 4), M @ R('Z', 40) @ R('Y', 16), 0.025, cuts=0.0)
        _ice_shard(B, rng, cloud(-fp * 0.42, fp * 0.20, fp * 0.45, fp * 0.42, ht * 0.36, 0.20, 3), M @ R('Z', -25) @ R('X', -18), 0.0)
        # a drift of dust banked against the lee side of the block
        dr = B.bm('regolith', smooth=62.0)
        n = 9
        lee = rad(205 + 0.3 * yaw)
        inner, mid, outer = [], [], []
        for i in range(n):
            a = TAU * i / n
            w = (0.5 + 0.5 * cos(a - lee)) ** 1.5
            r0 = fp * (0.30 + 0.07 * hash01(k, i))
            wob = 1.0 + 0.25 * (hash01(i, k, 9) - 0.5)
            inner.append(dr.verts.new((r0 * cos(a), r0 * 0.74 * sin(a), 0.04 + 0.34 * w)))
            mid.append(dr.verts.new(((r0 + (0.04 + 0.30 * w) * wob) * cos(a), (r0 * 0.74 + (0.04 + 0.30 * w) * wob) * sin(a), 0.015 + 0.13 * w)))
            outer.append(dr.verts.new(((r0 + (0.07 + 0.85 * w) * wob) * cos(a), (r0 * 0.74 + (0.07 + 0.85 * w) * wob) * sin(a), 0.0)))
        for i in range(n):
            j = (i + 1) % n
            dr.faces.new((inner[i], mid[i], mid[j], inner[j]))
            dr.faces.new((mid[i], outer[i], outer[j], mid[j]))
        B.finish()
    # what stays: a cracked pavement of ice flush with the ground, rubble and a few shards
    K = Kit('pavement', root)
    slabs = (((-1.4, -0.3), 1.5, 25), ((0.9, -0.1), 1.7, -10), ((0.2, 1.9), 1.3, 60), ((2.0, 0.4), 1.2, 100), ((-0.4, 0.8), 1.3, 0),
             ((-2.0, 1.6), 1.0, 45), ((0.6, -1.7), 1.1, 15))
    for i, ((x, y), s, yaw) in enumerate(slabs):                      # low hummocks where the ice sheet shows through
        _ice_shard(K, rng, cloud(0, 0, s, s * 0.7, 0.10 + 0.14 * hash01(i, 5), 0.10, 5),
                   T(x, y, 0.0) @ R('Z', yaw) @ R('X', 5 * (i % 3 - 1)) @ R('Y', 4 * (i % 2)), 0.02 if i % 2 == 0 else 0.0, dust=0.97)
    for i in range(8):
        a, r_ = rng.uniform(0, TAU), rng.uniform(0.6, 3.0)
        pts = [(rng.uniform(-1, 1) * 0.16, rng.uniform(-1, 1) * 0.12, rng.uniform(-0.04, 0.16)) for _ in range(7)]
        _ice_shard(K, rng, pts, T(r_ * cos(a), r_ * sin(a) * 0.8 + 0.4, 0.02) @ R('Z', rng.uniform(0, 360)), 0.0, dust=2.0)
    for i in range(8):
        a, r_ = rng.uniform(0, TAU), rng.uniform(0.8, 3.1)
        K.rock('regolith', rng.uniform(0.06, 0.13), (r_ * cos(a), r_ * sin(a) * 0.8 + 0.4, 0.02), seed=70 + i, scale=(1.1, 0.9, 0.6), subdiv=1, rough=0.3, smooth=40.0)
    K.finish()

    def tint(co, name, a):
        if name == 'ice':                       # blue in the clean ice, strata of red dust frozen into it, grime near the ground
            band = 0.5 + 0.5 * sin(co.z * 9.0 + 3.0 * noise3(co, 0.9, 0.5))
            dirt = max(1.0 - band ** 0.8, 1.0 - min(1.0, (co.z + 0.05) / 0.35)) ** 1.3
            clean, dusty = (0.62, 0.84, 1.0), (0.50, 0.34, 0.24)
            return tuple(a * (clean[c] + (dusty[c] - clean[c]) * dirt) for c in range(3))
        if name == 'regolith':
            return a * (0.62 + 0.14 * noise3(co, 3.0, 0.2))
        return None
    return finish(root, 'ice_outcrop', samples=32, distance=1.0, tint=tint)


# ==============================================================================================
# uplink_pad.glb
# ==============================================================================================
def build_uplink_pad():
    """A parking marker for the rover, 4.8 m across, laid flat: a ring of sixteen matting panels
    with chevrons pointing in, a centre target, and a staked amber lamp at each of four corners."""
    root = part('uplink_pad')
    K = Kit('pad', root)
    RO, RI, N = 2.40, 1.72, 16
    half = TAU / N / 2 - 0.012
    for k in range(N):
        a = TAU * (k + 0.5) / N
        M = T(0, 0, 0.004 + 0.004 * hash01(k, 1)) @ R('Z', math.degrees(a)) @ R('Y', 0.8 * (hash01(k, 2) - 0.5)) @ R('X', 1.2 * (hash01(k, 3) - 0.5))
        out = [(RI * cos(-half), RI * sin(-half)), (RO * cos(-half), RO * sin(-half)), (RO, 0.0), (RO * cos(half), RO * sin(half)),
               (RI * cos(half), RI * sin(half))]
        K.prism('rubber', out, 0.016, M, z0=0.0, cap_bottom=False)
        col = 'painted_orange' if k % 2 else 'painted_yellow'
        z = 0.019
        for s in (-1, 1):                                               # a chevron pointing at the centre
            K.poly(col, [(RI + 0.10, 0, z), (RI + 0.25, 0, z), (RO - 0.10, s * 0.30, z), (RO - 0.25, s * 0.30, z)][::s], M)
    # centre target
    K.prism('rubber', circ(0.42, 12), 0.016, T(0, 0, 0.004), z0=0.0, cap_bottom=False)
    for a in (0, 90):
        K.decal('painted_yellow', 0.66, 0.11, T(0, 0, 0.023) @ R('Z', a + 45))
    K.lathe('painted_orange', [(0.36, 0.0215), (0.415, 0.0215)], 12, R('X', 180) @ T(0, 0, -0.043))
    # corner stakes with lamps, each tied to the mat
    for k in range(4):
        a = rad(45 + 90 * k)
        c, s_ = cos(a), sin(a)
        px, py = (RO + 0.08) * c, (RO + 0.08) * s_
        K.tube('aluminium', [(px, py, -0.10), (px - 0.01 * c, py - 0.01 * s_, 0.30)], 0.012, 4, caps=False)
        K.lathe('painted_orange', [(0.055, 0.0), (0.055, 0.012), (0.0, 0.02)], 6, T(px, py, 0.0))
        K.lathe('rubber', [(0.03, 0.0), (0.03, 0.035), (0.0, 0.035)], 6, T(px - 0.01 * c, py - 0.01 * s_, 0.29))
        K.lathe('light_amber', [(0.026, 0.0), (0.026, 0.038), (0.014, 0.056), (0.0, 0.06)], 6, T(px - 0.01 * c, py - 0.01 * s_, 0.325), smooth=50.0)
        K.tube('aluminium', [(px, py, 0.05), ((RO - 0.07) * c, (RO - 0.07) * s_, 0.026)], 0.004, 3, caps=False)
        K.lathe('aluminium', [(0.012, 0.022), (0.028, 0.022)], 6, T((RO - 0.09) * c, (RO - 0.09) * s_, 0.0) @ R('X', 180) @ T(0, 0, -0.044))
        anchor(f'lamp_{k}', root, loc=(px, py, 0.35))
    K.finish()
    return finish(root, 'uplink_pad', samples=24, distance=0.3, soften={'rubber': 0.5})


# ==============================================================================================
# Build
# ==============================================================================================
BUILDERS = {
    'greenhouse': build_greenhouse, 'solar_kit': build_solar_kit, 'beacon': build_beacon, 'o2_cache': build_o2_cache,
    'supply_pod': build_supply_pod, 'rtg': build_rtg, 'debris_a': build_debris_a, 'debris_b': build_debris_b,
    'debris_c': build_debris_c, 'regolith_pile': build_regolith_pile, 'ice_outcrop': build_ice_outcrop, 'uplink_pad': build_uplink_pad,
}

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS)
    unknown = [a for a in sys.argv[1:] if a not in BUILDERS]
    if unknown:
        print('unknown model(s):', ', '.join(unknown), '- known:', ', '.join(BUILDERS))
    for name in names:
        reset_scene()
        BUILDERS[name]()
