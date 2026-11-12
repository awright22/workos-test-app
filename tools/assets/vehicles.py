"""
Stranded II vehicles (Family B in SPEC.md): the pressurised rover, the Mars Ascent Vehicle and
the Hermes. Authored headlessly in Blender through tools/assets/lib.py.

Run:   /home/user/blender-venv/bin/python tools/assets/vehicles.py [rover] [mav] [hermes]
Look:  node tools/assets/preview.mjs rover mav hermes
       TRIS=1 before the command prints the triangle count of every helper mesh.

Layout of this file
  1. geometry helpers that lib.py lacks: primitives placed by a matrix, profile sweeps, a lathe
     with predictable winding, faceted hull shells, and bake_ao_kit / finish (an occlusion bake
     that copes with pieces pushed into each other, then the export through lib)
  2. build_rover()   wheels, steering knuckles, suspension, cab, rear compartment, roof gear
  3. build_mav()     descent stage and legs, access tower, ascent stage, capsule, fairing
  4. build_hermes()  forward modules, crew ring, truss spine, arrays, radiators, reactor, engines

Axes follow SPEC.md: metres, Z up, the FRONT of a model faces -Y. Facing forward, the driver's
left hand is therefore +X, so every "_L" part sits at +X and every "_R" part at -X.

Winding is set by construction (no recalc_face_normals), so the models also draw correctly with
back-face culling: walk a lathe profile with the solid on your left, give sweeps and prisms a
counter-clockwise section.
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402  (imports bpy before bmesh/mathutils)
from lib import *  # noqa: E402,F401,F403

cos, sin, pi = math.cos, math.sin, math.pi


# ==============================================================================================
# 1. Helpers
# ==============================================================================================
def T(x=0.0, y=0.0, z=0.0):
    return Matrix.Translation((x, y, z))


def R(axis, deg):
    return Matrix.Rotation(rad(deg), 4, axis)


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


def _mk(bm, pts, M=None):
    if M is None:
        return [bm.verts.new(p) for p in pts]
    return [bm.verts.new(M @ Vector(p)) for p in pts]


def moved(bm, verts, M):
    """Apply a matrix to verts returned by a lib primitive."""
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


def plate(bm, w, h, t, r=0.02, M=None, n=2):
    """Rounded-rectangle plate lying in local XY, sitting on z=0, thickness t."""
    return prism(bm, rrect(w, h, r, n), t, M, z0=0.0, cap_bottom=False)


def lathe(bm, profile, seg=24, M=None, arc=TAU, close=False, phase=0.0, caps=False):
    """Revolve [(radius, height)] about local Z. Walk the profile with the solid on your LEFT
    (outer surfaces go upward, top faces go inward) and the normals come out right.
    close=True joins the last point back to the first (a ring / torus-like section);
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


def dome_profile(r, height, steps=6, z0=0.0, r_in=0.0, up=True):
    """Points of an elliptical dome from the rim (r, z0) to the pole, as (radius, height)."""
    out = []
    for i in range(steps + 1):
        a = (pi / 2) * i / steps
        rr = r_in + (r - r_in) * cos(a)
        out.append((rr if i < steps or r_in > 0 else 0.0, z0 + (height * sin(a) if up else -height * sin(a))))
    return out


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


def tube(bm, pts, r=0.02, seg=8, round_r=0.0, caps=True, closed=False, M=None, up=(0, 0, 1)):
    """Round tube along a polyline, optionally with filleted corners."""
    if round_r > 0:
        pts = fillet(pts, round_r)
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


def bolt_circle(bm, radius, count, r=0.012, h=0.008, M=None, phase=0.0):
    M = M or Matrix.Identity(4)
    for i in range(count):
        a = phase + TAU * i / count
        bolt(bm, r, h, M @ T(radius * cos(a), radius * sin(a), 0))


def bolt_rect(bm, w, h, nx, ny, r=0.01, hh=0.006, M=None):
    """Bolts around the edge of a w x h rectangle in local XY."""
    M = M or Matrix.Identity(4)
    pts = set()
    for i in range(nx):
        x = -w / 2 + w * i / (nx - 1)
        pts.add((round(x, 4), round(-h / 2, 4)))
        pts.add((round(x, 4), round(h / 2, 4)))
    for j in range(ny):
        y = -h / 2 + h * j / (ny - 1)
        pts.add((round(-w / 2, 4), round(y, 4)))
        pts.add((round(w / 2, 4), round(y, 4)))
    for x, y in sorted(pts):
        bolt(bm, r, hh, M @ T(x, y, 0))


def handle(bm, a, b, standoff, r=0.014, seg=6, normal=(1, 0, 0), M=None):
    """A grab handle: a bar between a and b held `standoff` off the surface along `normal`."""
    a, b, n = Vector(a), Vector(b), Vector(normal).normalized()
    pts = [a, a + n * standoff, b + n * standoff, b]
    tube(bm, pts, r, seg, round_r=standoff * 0.7, M=M)
    for p in (a, b):
        lathe(bm, [(r * 2.0, 0.0), (r * 2.0, 0.008), (0.0, 0.008)], seg, (M or Matrix.Identity(4)) @ frame(p, n))


def ring_shell(bm, levels, cap_top=True, cap_bottom=True, tag_layer=None):
    """Build a closed faceted hull from horizontal contours.
    levels[k] is the +X half of contour k as [(x, y, z)], running from the front centre-line
    point (x=0) round the side to the back centre-line point (x=0); every level has the same
    number of points. Returns (grid, n) where grid[k][i] are verts round the full contour.
    Faces are tagged 1 + 100*k + i for the quad between columns i, i+1 and levels k, k+1."""
    grid = []
    for half in levels:
        full = list(half) + [(-x, y, z) for (x, y, z) in reversed(half[1:-1])]
        grid.append([bm.verts.new(p) for p in full])
    n = len(grid[0])
    for k in range(len(grid) - 1):
        a, b = grid[k], grid[k + 1]
        for i in range(n):
            f = bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
            if tag_layer is not None:
                f[tag_layer] = 1 + 100 * k + i
    if cap_bottom:
        bm.faces.new(list(reversed(grid[0])))
    if cap_top:
        bm.faces.new(grid[-1])
    return grid, n


def chamfer_edges(bm, min_angle=25.0, width=0.02, segments=1):
    """Chamfer every edge sharper than min_angle (keeps large faces flat, kills razor edges)."""
    bm.normal_update()
    edges = [e for e in bm.edges if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > rad(min_angle)]
    if edges:
        bmesh.ops.bevel(bm, geom=edges, offset=width, offset_type='OFFSET', segments=segments, profile=0.5,
                        affect='EDGES', clamp_overlap=True)
    bm.normal_update()


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))


def obj(name, bm, material, parent, bevel=0.0, seg=1, smooth=38.0, mirror=None, **kw):
    """mesh_obj with this file's defaults: one-segment chamfers so flat faces stay flat."""
    if os.environ.get('TRIS'):                        # TRIS=1 prints the size of every helper (before modifiers)
        print(f'    {name:20s} {sum(len(f.verts) - 2 for f in bm.faces):6d}')
    return mesh_obj(name, bm, material, parent=parent, bevel=bevel, bevel_segments=seg, smooth_angle=smooth,
                    mirror=mirror, **kw)


def report_parts(root):
    """Triangles per part node (after export_model has collapsed the helpers)."""
    rows = []
    for o in [root] + lib._descendants(root):
        if o.type == 'MESH':
            rows.append((o.parent.name if o.parent else o.name, sum(len(p.vertices) - 2 for p in o.data.polygons)))
    print('  parts:', ', '.join(f'{n}={t}' for n, t in rows))


def zs(z0, z1, pad=0.07, step=1.5):
    """Ring heights for a long lathe wall: a ring just inside each end, then one every `step`.
    Vertex AO is only sampled at rings, so a wall needs some that are clear of what touches its ends."""
    if z1 - z0 <= 2.5 * pad:
        return [z0, z1]
    inner0, inner1 = z0 + pad, z1 - pad
    n = max(1, int(math.ceil((inner1 - inner0) / step)))
    return [z0] + [inner0 + (inner1 - inner0) * i / n for i in range(n + 1)] + [z1]


def wall(r, z0, z1, **kw):
    return [(r, z) for z in zs(z0, z1, **kw)]


def bake_ao_kit(root, samples=24, distance=0.9, strength=0.8, floor=True, seed=7):
    """Per-vertex ambient occlusion like lib.bake_ao, for models kit-bashed from intersecting pieces.
    lib.bake_ao counts every hit, so a vertex buried inside another piece (the end of a strut in
    its joint, a plate let into a hull) comes out black and that black is interpolated along the
    whole visible strut. Here a ray that meets the BACK of a face is inside something: it carries on
    until it meets a front face or runs out of range. Glass panes therefore do not darken a cab
    interior either. The result is stored the same way (COLOR_0, 'Col')."""
    rng = random.Random(seed)
    bpy.context.view_layer.update()
    objs = [o for o in [root] + lib._descendants(root) if o.type == 'MESH']
    verts, polys = [], []
    for o in objs:
        base = len(verts)
        mw = o.matrix_world
        verts.extend(mw @ v.co for v in o.data.vertices)
        polys.extend(tuple(base + i for i in p.vertices) for p in o.data.polygons)
    if floor:
        base = len(verts)
        s = 60.0
        verts.extend([Vector((-s, -s, -0.001)), Vector((s, -s, -0.001)), Vector((s, s, -0.001)), Vector((-s, s, -0.001))])
        polys.append((base, base + 1, base + 2, base + 3))
    tree = BVHTree.FromPolygons(verts, polys, all_triangles=False, epsilon=0.0)
    dirs = []
    for _ in range(samples):
        u, v = rng.random(), rng.random()
        r, phi = math.sqrt(u), TAU * v
        dirs.append(Vector((r * cos(phi), r * sin(phi), math.sqrt(max(0.0, 1 - u)))))
    for o in objs:
        me = o.data
        mw = o.matrix_world
        nmat = mw.to_3x3().inverted_safe().transposed()
        attr = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
        vals = []
        for v in me.vertices:
            n = (nmat @ v.normal).normalized()
            p = mw @ v.co + n * 0.004
            t = n.orthogonal().normalized()
            b = n.cross(t)
            hit = 0.0
            for d in dirs:
                w = t * d.x + b * d.y + n * d.z
                origin, left = p, distance
                for _ in range(5):
                    loc, nrm, _idx, dist = tree.ray_cast(origin, w, left)
                    if loc is None:
                        break
                    if nrm.dot(w) > 0.0:                    # back face: we are inside a piece, keep going
                        left -= dist + 2e-4
                        if left <= 0.0:
                            break
                        origin = loc + w * 2e-4
                        continue
                    hit += (1.0 - (distance - left + dist) / distance) ** 1.5
                    break
            vals.append(max(0.08, min(1.0, 1.0 - strength * (hit / samples))))
        for i, a in enumerate(vals):
            attr.data[i].color = (a, a, a, 1.0)
        me.color_attributes.active_color = attr
        try:
            me.color_attributes.render_color_index = list(me.color_attributes).index(attr)
        except Exception:
            pass


def finish(root, name, ao_distance=0.9, floor=True, samples=24):
    """Collapse helpers into parts, bake occlusion with bake_ao_kit, then export through lib."""
    collapse(root)
    bake_ao_kit(root, samples=samples, distance=ao_distance, floor=floor)
    info = export_model(root, name, ao=False, do_collapse=False)
    report_parts(root)
    return info


# ==============================================================================================
# 2. Rover
# ==============================================================================================
WHEEL_R = 0.62          # to the grouser tips
WHEEL_W = 0.44
WHEEL_X = 1.28          # wheel centre off the centre-line; outer face at 1.50 m
AXLES = {'F': -1.9, 'M': 0.0, 'R': 1.9}


def _wheel_point(x, phi, r):
    """Point on the wheel: axle along X, phi measured from the top toward the front (-Y)."""
    return (x, -r * sin(phi), r * cos(phi))


def build_wheel(parent, side=1):
    """One wheel under `parent` (a part whose origin is the wheel centre). side=+1 is the left
    (+X) wheel with its hub cap facing +X; side=-1 mirrors it."""
    sc = (side, 1, 1)
    AXM = AX['X']                                   # lathe axis Z -> wheel axle X (outboard = +X)
    tread_r = WHEEL_R - 0.024
    hw = WHEEL_W / 2

    # tyre carcass: a hollow band with rounded shoulders, plus the dished wheel disc behind the mesh
    bm = bm_new()
    carcass = [(0.500, -hw + 0.005), (0.556, -hw), (0.582, -hw + 0.022), (tread_r, -hw + 0.07), (tread_r, hw - 0.07),
               (0.582, hw - 0.022), (0.556, hw), (0.500, hw - 0.005), (0.486, hw - 0.03), (0.486, -hw + 0.03)]
    lathe(bm, carcass, 36, AXM, close=True)
    disc = [(0.488, -0.150), (0.300, -0.050), (0.150, 0.020), (0.150, -0.020), (0.300, -0.095), (0.488, -0.195)]
    lathe(bm, disc, 24, AXM, close=True)
    obj('tyre', bm, 'rubber', parent, scale=sc, smooth=50)

    # chevron grousers across the tread, apex leading
    bm = bm_new()
    n_ch, sweep_back = 18, 0.19

    def tread_radius(x):
        ax = abs(x)
        if ax <= hw - 0.07:
            return tread_r
        return tread_r - (tread_r - 0.582) * ((ax - (hw - 0.07)) / 0.048) ** 1.6

    xs = [-hw + 0.012, -hw + 0.06, -0.085, 0.0, 0.085, hw - 0.06, hw - 0.012]
    for c in range(n_ch):
        phi0 = TAU * c / n_ch
        prev = None
        for x in xs:
            phi = phi0 - sweep_back * abs(x) / hw
            rb = tread_radius(x) - 0.004
            rt = rb + (0.028 if abs(x) < hw - 0.02 else 0.016)
            dphi = 0.021 / 0.6
            st = [bm.verts.new(_wheel_point(x, phi - dphi, rb)), bm.verts.new(_wheel_point(x, phi - dphi * 0.8, rt)),
                  bm.verts.new(_wheel_point(x, phi + dphi * 0.8, rt)), bm.verts.new(_wheel_point(x, phi + dphi, rb))]
            if prev is None:
                bm.faces.new((st[0], st[1], st[2], st[3]))
            else:
                for j in range(3):
                    bm.faces.new((prev[j], st[j], st[j + 1], prev[j + 1]))
            prev = st
        bm.faces.new((prev[3], prev[2], prev[1], prev[0]))
    # the open mesh side wall: two layers of spiral flexures crossing each other
    n_sp = 14
    for layer, twist in ((0, rad(34)), (1, -rad(34))):
        for s in range(n_sp):
            a0 = TAU * (s + 0.5 * layer) / n_sp
            a1 = a0 + twist
            x0, x1 = 0.118 + 0.012 * layer, hw - 0.028 + 0.012 * layer
            p0 = _wheel_point(x0, a0, 0.280)
            p1 = _wheel_point(x1, a1, 0.497)
            beam(bm, p0, p1, 0.026, 0.010, up=(1, 0, 0))
    # hub drum, flange and cap
    hub = [(0.150, 0.015), (0.290, 0.085), (0.300, 0.135), (0.276, 0.150), (0.135, 0.158), (0.118, 0.196),
           (0.070, 0.208), (0.0, 0.208)]
    lathe(bm, hub, 20, AXM)
    lathe(bm, [(0.150, -0.020), (0.165, -0.060), (0.165, -0.150), (0.135, -0.165)], 20, AXM)   # inboard bearing sleeve
    bolt_circle(bm, 0.250, 9, 0.016, 0.012, AXM @ T(0, 0, 0.150), phase=TAU / 18)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    obj('wheel_metal', bm, 'aluminium', parent, scale=sc, smooth=40)

    # a three-lobed orange hub plate: an off-axis mark, so the spin of the wheel can be read
    bm = bm_new()
    lobes = [((0.178 + 0.040 * cos(3 * a)) * cos(a), (0.178 + 0.040 * cos(3 * a)) * sin(a))
             for a in (TAU * i / 30 for i in range(30))]
    prism(bm, lobes, 0.014, AXM @ T(0, 0, 0.154), z0=0.0, cap_bottom=False)
    obj('hub_plate', bm, 'painted_orange', parent, scale=sc)


def build_knuckle(parent, side=1):
    """Steering knuckle under a steer_* part (origin at the wheel centre, kingpin = local Z):
    the hub motor, a fork over the tyre and the steering actuator on top of the kingpin."""
    sc = (side, 1, 1)
    bm = bm_new()
    motor = [(0.0, -0.405), (0.112, -0.405), (0.135, -0.385), (0.135, -0.315), (0.152, -0.310), (0.152, -0.275),
             (0.135, -0.270), (0.135, -0.245), (0.152, -0.240), (0.152, -0.205), (0.135, -0.200), (0.135, -0.150)]
    lathe(bm, motor, 18, AX['X'])
    lathe(bm, [(0.118, 0.750), (0.118, 0.775), (0.100, 0.785), (0.100, 0.895), (0.086, 0.925), (0.0, 0.925)], 18)
    obj('motor', bm, 'steel', parent, scale=sc, smooth=50)

    bm = bm_new()
    fork = [(-0.285, -0.16), (-0.285, 0.50), (-0.20, 0.668), (0.125, 0.668), (0.125, 0.750), (-0.27, 0.750),
            (-0.425, 0.56), (-0.425, -0.16)]
    prism(bm, fork, 0.11, R('X', 90))
    obj('fork', bm, 'painted_grey', parent, scale=sc, bevel=0.014)

    bm = bm_new()
    # stiffening web and a bolted cover on the fork, steering stop, cable gland
    prism(bm, [(-0.40, 0.02), (-0.31, 0.02), (-0.31, 0.44), (-0.40, 0.44)], 0.126, R('X', 90))
    for sy in (-1, 1):
        for z in (0.08, 0.38):
            bolt(bm, 0.013, 0.008, frame((-0.355, sy * 0.063, z), (0, sy, 0)))
    obj('fork_trim', bm, 'steel', parent, scale=sc, bevel=0.006)

    bm = bm_new()
    tube(bm, [(-0.085, 0.045, 0.86), (-0.20, 0.075, 0.86), (-0.445, 0.075, 0.62), (-0.455, 0.075, 0.10),
              (-0.40, 0.06, -0.06), (-0.33, 0.04, -0.13)], 0.013, 6, round_r=0.07)
    obj('motor_cable', bm, 'rubber', parent, scale=sc, smooth=70)


def _arm(bm, path, w=0.10, h=0.14, c=0.028):
    sweep(bm, path, chamf(w, h, c))


def _rover_suspension(root):
    X = WHEEL_X
    yf, yr = AXLES['F'], AXLES['R']
    top = WHEEL_R + 0.925                                  # top of the kingpin actuators
    # --- structure (built for the left side, mirrored) ---
    bm = bm_new()
    p1 = (0.915, -0.75, 0.90)                              # bogie pivot (front + middle wheels)
    _arm(bm, [p1, (0.965, -1.14, 1.09), (1.135, -1.50, 1.41), (1.235, -1.70, top + 0.045), (X, yf + 0.06, top + 0.045)])
    _arm(bm, [p1, (0.93, -0.33, 0.705), (0.93, 0.03, 0.62)], 0.10, 0.13)
    p2 = (0.835, 2.45, 1.00)                               # rear swing-arm pivot on the tail
    _arm(bm, [p2, (1.035, 2.36, 1.30), (1.215, 2.14, top + 0.03), (X, yr - 0.04, top + 0.045)])
    for y in (yf, yr):                                     # yokes that carry the kingpins
        lathe(bm, [(0.0, top - 0.004), (0.135, top - 0.004), (0.135, top + 0.085), (0.11, top + 0.105), (0.0, top + 0.105)],
              18, T(X, y, 0))
    obj('arms', bm, 'painted_grey', root, mirror='X', smooth=30)

    bm = bm_new()
    # pivot housings with bolted end caps
    for (x0, x1, y, z, r) in ((0.66, 1.00, -0.75, 0.90, 0.135), (0.42, 0.915, 2.45, 1.00, 0.12)):
        prof = [(r + 0.045, 0.0), (r + 0.045, 0.03), (r, 0.045), (r, x1 - x0 - 0.035), (r + 0.02, x1 - x0 - 0.03),
                (r + 0.02, x1 - x0), (0.0, x1 - x0)]
        M = T(x0 + 0.04, y, z) @ AX['X']
        lathe(bm, prof, 18, M)
        bolt_circle(bm, r * 0.62, 6, 0.014, 0.01, M @ T(0, 0, x1 - x0))
    # middle wheel motor carrier on the end of the bogie
    motor = [(0.0, -0.405), (0.112, -0.405), (0.135, -0.385), (0.135, -0.315), (0.152, -0.310), (0.152, -0.275),
             (0.135, -0.270), (0.135, -0.245), (0.152, -0.240), (0.152, -0.205), (0.135, -0.200), (0.135, -0.150)]
    lathe(bm, motor, 18, T(X, 0, WHEEL_R) @ AX['X'])
    for y in (yf, yr):
        bolt_circle(bm, 0.085, 6, 0.013, 0.008, T(X, y, top + 0.105))
    obj('pivots', bm, 'steel', root, mirror='X', smooth=50)

    # --- dampers: body, rod, rubber boot, end eyes ---
    def damper(bm_body, bm_boot, a, b, r=0.042):
        a, b = Vector(a), Vector(b)
        L = (b - a).length
        M = frame(a, b - a)
        lathe(bm_body, [(0.0, 0.0), (r * 0.7, 0.0), (r * 0.7, 0.04), (r, 0.05), (r, L * 0.46), (r * 0.8, L * 0.48),
                        (r * 0.42, L * 0.49), (r * 0.42, L - 0.04), (r * 0.7, L - 0.04), (r * 0.7, L), (0.0, L)], 12, M)
        boot = []
        for i in range(7):
            z = L * 0.50 + (L * 0.34) * i / 6
            boot.append((r * (1.08 if i % 2 == 0 else 0.72), z))
        lathe(bm_boot, boot, 12, M)

    bm, bm2, bm3 = bm_new(), bm_new(), bm_new()
    damper(bm, bm2, (1.065, -1.36, 1.27), (1.10, -0.99, 1.485))
    damper(bm, bm2, (1.03, 2.375, 1.27), (0.945, 2.03, 1.63))
    for p, n in (((1.10, -0.99, 1.485), (1, 0, 0.05)), ((0.945, 2.03, 1.63), (0.97, 0.25, 0))):
        box(bm3, (0.11, 0.13, 0.05), (0, 0, -0.012), frame(Vector(p) - Vector(n).normalized() * 0.05, n))
    # wiring harnesses clipped along the arms to the steering actuators
    tube(bm2, [(0.72, -0.98, 1.10), (0.90, -1.02, 1.12), (0.975, -1.16, 1.195), (1.135, -1.50, 1.497), (1.225, -1.69, 1.672),
               (1.20, -1.80, 1.69)], 0.012, 6, round_r=0.04)
    tube(bm2, [(0.60, 2.30, 1.10), (0.80, 2.40, 1.10), (0.86, 2.44, 1.12), (1.035, 2.36, 1.39), (1.215, 2.15, 1.665), (1.21, 2.00, 1.69)],
         0.012, 6, round_r=0.04)
    for p in ((1.05, -1.32, 1.335), (0.94, 2.40, 1.25), (1.12, 2.26, 1.52)):
        box(bm3, (0.05, 0.03, 0.045), p)
    obj('dampers', bm, 'aluminium', root, mirror='X', smooth=50)
    obj('damper_boots', bm2, 'rubber', root, mirror='X', smooth=60)
    obj('damper_brackets', bm3, 'painted_grey', root, mirror='X', bevel=0.008)

    # --- wheels and steering parts ---
    for ax, y in AXLES.items():
        for sname, side in (('L', 1), ('R', -1)):
            loc = (side * X, y, WHEEL_R)
            if ax == 'M':
                w = part(f'wheel_{ax}{sname}', root, loc=loc)
            else:
                st = part(f'steer_{ax}{sname}', root, loc=loc)
                build_knuckle(st, side)
                w = part(f'wheel_{ax}{sname}', st)
            build_wheel(w, side)


def _hull_levels(table):
    """Fill in interpolated levels (contour None) and return [[(x, y, z)]]."""
    out = []
    for idx, (z, ring) in enumerate(table):
        if ring is None:
            (z0, r0), (z1, r1) = table[idx - 1], table[idx + 1]
            t = (z - z0) / (z1 - z0)
            ring = [lerp(a, b, t) for a, b in zip(r0, r1)]
        out.append([(x, y, z) for (x, y) in ring])
    return out


CAB = [
    (0.74, [(0, -2.56), (0.46, -2.56), (0.60, -2.42), (0.60, -1.10), (0.60, -0.58), (0, -0.58)]),
    (1.14, [(0, -2.72), (0.50, -2.72), (0.70, -2.50), (0.70, -1.10), (0.70, -0.58), (0, -0.58)]),
    (1.30, [(0, -2.80), (0.58, -2.80), (1.04, -2.30), (1.04, -1.10), (1.04, -0.58), (0, -0.58)]),
    (1.58, [(0, -2.64), (0.60, -2.64), (1.06, -2.14), (1.06, -1.10), (1.06, -0.58), (0, -0.58)]),
    (2.14, None),
    (2.50, [(0, -2.14), (0.54, -2.14), (0.91, -1.738), (0.91, -1.10), (0.91, -0.58), (0, -0.58)]),
    (2.74, [(0, -1.90), (0.48, -1.90), (0.756, -1.60), (0.756, -1.10), (0.756, -0.60), (0, -0.60)]),
]
CAB_ROOF = 2.74
REAR = [
    (0.74, [(0, -0.58), (0.60, -0.58), (0.60, 1.42), (0.50, 2.30), (0.36, 2.50), (0, 2.50)]),
    (1.14, [(0, -0.58), (0.70, -0.58), (0.70, 1.42), (0.56, 2.38), (0.40, 2.58), (0, 2.58)]),
    (1.30, [(0, -0.58), (1.04, -0.58), (1.04, 1.42), (0.80, 2.36), (0.56, 2.62), (0, 2.62)]),
    (1.72, [(0, -0.58), (1.04, -0.58), (1.04, 1.42), (0.80, 2.36), (0.56, 2.62), (0, 2.62)]),
    (1.96, [(0, -0.58), (0.90, -0.58), (0.90, 1.42), (0.70, 2.30), (0.50, 2.52), (0, 2.52)]),
    (2.08, [(0, -0.58), (0.62, -0.58), (0.62, 1.42), (0.50, 2.18), (0.34, 2.34), (0, 2.34)]),
]
CAB_FLOOR = 0.90


def _pane_faces(bm, tag, tags, normals):
    """Faces that survived chamfering from the tagged quads (the big flat ones, not the chamfers)."""
    out = []
    for f in bm.faces:
        t = f[tag]
        if t in tags and f.normal.dot(normals[t]) > 0.995 and f.calc_area() > 0.004:
            out.append(f)
    return out


def _rover_cab(root):
    levels = _hull_levels(CAB)
    n = 2 * len(levels[0]) - 2
    bm = bm_new()
    tag = bm.faces.layers.int.new('tag')
    ring_shell(bm, levels, tag_layer=tag)
    bm.normal_update()
    normals = {f[tag]: f.normal.copy() for f in bm.faces if f[tag]}

    def seg(k, i):
        return 1 + 100 * k + i

    panes = {
        'screen': [seg(3, 0), seg(3, n - 1), seg(4, 0), seg(4, n - 1)],
        'corner_L': [seg(3, 1), seg(4, 1)], 'corner_R': [seg(3, n - 2), seg(4, n - 2)],
        'side_L': [seg(3, 2), seg(4, 2)], 'side_R': [seg(3, n - 3), seg(4, n - 3)],
        'brow': [seg(5, 0), seg(5, n - 1)],
        'rear': [seg(4, 4), seg(4, 5)],
    }
    keel = {seg(0, i) for i in range(n)}
    bonnet = {seg(2, 0), seg(2, 1), seg(2, n - 2), seg(2, n - 1)}
    chamfer_edges(bm, 24.0, 0.022)
    for f in bm.faces:
        if (f[tag] in keel and abs(f.normal.z) < 0.8) or f.normal.z < -0.9:
            f.material_index = 1
        elif f[tag] in bonnet and f.normal.dot(normals[f[tag]]) > 0.995:
            f.material_index = 4
    for name, tags in panes.items():
        faces = _pane_faces(bm, tag, set(tags), normals)
        margin = 0.05 if name != 'rear' else 0.042
        bmesh.ops.inset_region(bm, faces=faces, thickness=margin, depth=0.0, use_even_offset=True, use_boundary=True)
        rim = bmesh.ops.inset_region(bm, faces=faces, thickness=0.028, depth=-0.022, use_even_offset=True,
                                     use_boundary=True)['faces']
        for f in rim:
            f.material_index = 3
        for f in faces:
            f.material_index = 2
    obj('cab', bm, ['painted_white', 'painted_grey', 'glass_clear', 'rubber', 'painted_dark'], root, smooth=20)

    # inner lining seen through the glass: the same contours pulled in, facing inward, windows left open
    bm = bm_new()
    tag = bm.faces.layers.int.new('tag')
    ring_shell(bm, levels, tag_layer=tag, cap_bottom=False)
    bm.normal_update()
    for v in bm.verts:
        v.co -= v.normal * 0.055
    open_tags = {t for tags in panes.values() for t in tags}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f[tag] in open_tags], context='FACES')
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    obj('cab_lining', bm, 'painted_grey', root, smooth=20)
    return panes


def _rover_cab_interior(root):
    F = CAB_FLOOR
    bm = bm_new()
    box(bm, (1.22, 1.90, 0.04), (0, -1.55, F - 0.02))                 # floor
    box(bm, (0.30, 0.74, 0.34), (0, -1.62, F + 0.17))                 # centre console
    prism(bm, [(-2.60, 1.28), (-2.20, 1.28), (-2.18, 1.47), (-2.33, 1.585), (-2.60, 1.585)], 1.16, YZX)   # dashboard
    obj('cab_floor', bm, 'painted_dark', root, bevel=0.012)

    seats, frames_bm = bm_new(), bm_new()
    for sx in (-1, 1):
        x = sx * 0.40
        box(frames_bm, (0.26, 0.30, 0.30), (x, -1.50, F + 0.15))                          # pedestal
        box(frames_bm, (0.50, 0.06, 0.05), (x, -1.50, F + 0.30))                          # slide rail
        box(seats, (0.46, 0.50, 0.11), (x, -1.50, F + 0.385))                             # cushion
        Mb = T(x, -1.235, F + 0.42) @ R('X', -10)
        box(seats, (0.44, 0.10, 0.62), (0, 0, 0.31), Mb)                                  # back
        box(seats, (0.50, 0.07, 0.20), (0, -0.03, 0.14), Mb)                              # lumbar bolster
        box(seats, (0.26, 0.09, 0.17), (0, 0.0, 0.74), Mb)                                # headrest
        for sy in (-1, 1):
            tube(frames_bm, [(sy * 0.07, 0, 0.60), (sy * 0.07, 0, 0.67)], 0.012, 6, M=Mb)
    obj('seats', seats, 'canvas_dark', root, bevel=0.03, seg=2)
    obj('seat_frames', frames_bm, 'painted_dark', root, bevel=0.01)

    # screens: one per seat on the dash slope, a taller centre display, a strip on the console
    bm = bm_new()
    slope = (Vector((0, -2.33, 1.585)) - Vector((0, -2.18, 1.47)))
    nrm = Vector((0, slope.z, -slope.y)).normalized()                 # faces the crew (+Y, up)
    for sx in (-0.40, 0.40):
        box(bm, (0.34, 0.15, 0.008), (0, 0, 0.004), frame((sx, -2.255, 1.5275), nrm, (1, 0, 0)))
    box(bm, (0.30, 0.008, 0.20), (0, -2.19, 1.70))
    box(bm, (0.16, 0.26, 0.008), (0, -1.72, F + 0.345))
    obj('screens', bm, 'screen', root)
    bm = bm_new()
    box(bm, (0.34, 0.03, 0.24), (0, -2.208, 1.70))                    # centre display housing
    box(bm, (0.06, 0.05, 0.14), (0, -2.23, 1.56))
    for sx in (-0.40, 0.40):                                          # glare hoods
        box(bm, (0.40, 0.10, 0.02), (sx, -2.30, 1.60), None)
    # driver's yoke on a column (left seat), side stick for the right seat
    tube(bm, [(0.40, -2.20, 1.50), (0.40, -1.99, 1.63)], 0.022, 8)
    My = frame((0.40, -1.985, 1.633), (0, 0.85, 0.527), (1, 0, 0))
    moved(bm, add_torus(bm, 0.15, 0.016, seg=10, ring_seg=6, arc=pi * 1.15), My @ R('Z', -13.5))
    box(bm, (0.30, 0.03, 0.02), (0, 0, 0.0), My)
    lathe(bm, [(0.0, -0.01), (0.045, -0.01), (0.045, 0.02), (0.0, 0.025)], 10, My)
    tube(bm, [(-0.14, -1.70, F + 0.34), (-0.14, -1.72, F + 0.47)], 0.014, 6)
    add_sphere(bm, 0.028, (-0.14, -1.722, F + 0.48), 8, 6)
    obj('cab_controls', bm, 'painted_dark', root, smooth=50)


def _rover_rear(root):
    levels = _hull_levels(REAR)
    n = 2 * len(levels[0]) - 2
    bm = bm_new()
    tag = bm.faces.layers.int.new('tag')
    ring_shell(bm, levels, tag_layer=tag)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f[tag] and (f[tag] - 1) % 100 in (0, n - 1)], context='FACES')
    keel = {1 + i for i in range(n)}
    chamfer_edges(bm, 24.0, 0.022)
    for f in bm.faces:
        if (f[tag] in keel and abs(f.normal.z) < 0.8) or f.normal.z < -0.9:
            f.material_index = 1
    obj('rear_hull', bm, ['painted_white', 'painted_grey'], root, smooth=20)

    # ring frames: raised bands that follow the section (and hide the joint with the cab)
    bm = bm_new()
    band = [(-0.006, -0.035), (0.016, -0.028), (0.016, 0.028), (-0.006, 0.035)]
    for y in (-0.555, 0.385, 1.42):
        half = [(1.04, 1.305), (1.04, 1.72), (0.90, 1.96), (0.62, 2.08)]
        pts = [(-x, y, z) for x, z in half] + [(x, y, z) for x, z in reversed(half)]
        sweep(bm, pts, band, up=(0, 1, 0), caps=True)
    y = 1.80                                                          # one more on the tapering tail
    half = [(rear_side_x(y, 1.5) + 0.004, 1.305), (rear_side_x(y, 1.5) + 0.004, 1.72), (rear_side_x(y, 1.96) + 0.004, 1.963),
            (rear_side_x(y, 2.08) + 0.002, 2.083)]
    sweep(bm, [(-x, y, z) for x, z in half] + [(x, y, z) for x, z in reversed(half)], band, up=(0, 1, 0), caps=True)
    obj('ring_frames', bm, 'painted_white', root, smooth=20)


def _rover_chassis(root):
    bm = bm_new()
    # belly pan with upturned ends, frame rails, cross-members
    pan = [(-2.52, 0.70), (-2.36, 0.565), (2.30, 0.565), (2.48, 0.70), (2.48, 0.72), (2.29, 0.60), (-2.35, 0.60), (-2.52, 0.72)]
    prism(bm, pan, 1.00, YZX)
    for sx in (-1, 1):
        beam(bm, (sx * 0.40, -2.40, 0.67), (sx * 0.40, 2.34, 0.67), 0.10, 0.14, c=0.02)
    for y in (-2.0, -1.2, -0.4, 0.4, 1.2, 2.0):
        beam(bm, (-0.47, y, 0.556), (0.47, y, 0.556), 0.07, 0.02)
    obj('chassis', bm, 'painted_dark', root, smooth=30)

    # bumpers: bent bars on brackets
    bm = bm_new()
    sec = chamf(0.07, 0.15, 0.02)
    sweep(bm, [(-0.84, -2.62, 0.95), (-0.64, -2.86, 0.95), (0.64, -2.86, 0.95), (0.84, -2.62, 0.95)], sec)
    sweep(bm, [(-0.66, 2.46, 0.93), (-0.50, 2.70, 0.93), (0.50, 2.70, 0.93), (0.66, 2.46, 0.93)], sec)
    for sx in (-1, 1):
        beam(bm, (sx * 0.36, -2.58, 0.90), (sx * 0.36, -2.84, 0.95), 0.06, 0.10)
        beam(bm, (sx * 0.30, 2.48, 0.90), (sx * 0.30, 2.68, 0.93), 0.06, 0.10)
    # winch between the front brackets, hitch receiver at the back
    lathe(bm, [(0.0, -0.13), (0.075, -0.13), (0.075, -0.11), (0.05, -0.10), (0.05, 0.10), (0.075, 0.11), (0.075, 0.13), (0.0, 0.13)],
          12, T(0, -2.735, 0.93) @ AX['X'])
    box(bm, (0.12, 0.22, 0.10), (0, 2.66, 0.80))
    obj('bumpers', bm, 'painted_dark', root, smooth=30)

    bm = bm_new()
    for sx in (-1, 1):                                    # tow hooks, front and back
        for x, y, z in ((0.36, -2.925, 0.95), (0.30, 2.765, 0.93)):
            moved(bm, add_torus(bm, 0.042, 0.014, seg=10, ring_seg=6), T(sx * x, y, z) @ R('Y', 90))
    # hazard blocks on the rear bumper
    for i in range(5):
        if i % 2 == 0:
            box(bm, (0.17, 0.012, 0.11), (-0.40 + 0.20 * i, 2.737, 0.93))
    obj('tow_hooks', bm, 'painted_orange', root, smooth=60)
    bm = bm_new()
    lathe(bm, [(0.022, 0.0), (0.022, 0.05), (0.034, 0.07), (0.034, 0.10), (0.0, 0.118)], 10, T(0, 2.74, 0.85))
    tube(bm, [(0, -2.86, 0.93), (0, -2.95, 0.93)], 0.012, 6)
    box(bm, (0.16, 0.03, 0.09), (0, -2.905, 0.93))
    obj('hitch', bm, 'aluminium', root, smooth=50)


def _solar_panel(frame_bm, cell_bm, M, w, l, nx, ny, t=0.028):
    """A framed solar panel lying in local XY (w along X, l along Y) with its underside on z=0."""
    hw, hl = w / 2 - 0.015, l / 2 - 0.015
    sweep(frame_bm, [(hw, -hl, t / 2), (hw, hl, t / 2), (-hw, hl, t / 2), (-hw, -hl, t / 2)], chamf(0.03, t, 0.007),
          closed=True, M=M)
    box(cell_bm, (w - 0.05, l - 0.05, 0.012), (0, 0, t - 0.012), M)
    for i in range(1, nx):
        box(frame_bm, (0.009, l - 0.05, 0.004), (-w / 2 + w * i / nx, 0, t - 0.004), M)
    for j in range(1, ny):
        box(frame_bm, (w - 0.05, 0.009, 0.004), (0, -l / 2 + l * j / ny, t - 0.004), M)


def _radiator(frame_bm, slat_bm, back_bm, M, w, h):
    """Louvred radiator panel in local XY (w along X, h along Y), standing off the wall along +Z."""
    box(back_bm, (w - 0.02, h - 0.02, 0.010), (0, 0, 0.005), M)
    hw, hh = w / 2 - 0.016, h / 2 - 0.016
    sweep(frame_bm, [(hw, -hh, 0.022), (hw, hh, 0.022), (-hw, hh, 0.022), (-hw, -hh, 0.022)], chamf(0.032, 0.044, 0.008),
          closed=True, M=M)
    n = max(3, int((h - 0.07) / 0.042))
    for i in range(n):
        y = -h / 2 + 0.035 + (h - 0.07) * (i + 0.5) / n
        box(slat_bm, (w - 0.066, 0.040, 0.005), (0, 0, 0), M @ T(0, y, 0.026) @ R('X', 28))
    for sx in (-1, 1):                                               # coolant manifolds along the ends
        tube(frame_bm, [(sx * (w / 2 + 0.03), -h / 2 + 0.04, 0.02), (sx * (w / 2 + 0.03), h / 2 - 0.04, 0.02)], 0.016, 6, M=M)
        for sy in (-1, 1):
            tube(frame_bm, [(sx * (w / 2 + 0.03), sy * (h / 2 - 0.06), 0.02), (sx * (w / 2 + 0.03), sy * (h / 2 - 0.06), -0.01)], 0.012, 6, M=M)


def _rover_door(root):
    yc = 0.91
    bm = bm_new()                                                    # the boxed-out hatch surround
    prism(bm, [(0.66, 0.86), (1.05, 0.86), (1.05, 1.92), (0.985, 2.02), (0.66, 2.02)], 0.92, T(0, yc, 0) @ R('X', 90))
    obj('hatch_surround', bm, 'painted_white', root, bevel=0.022)

    Md = frame((1.05, yc, 1.44), (1, 0, 0), (0, 1, 0))               # local X = aft, Y = up, Z = outward
    bm = bm_new()
    plate(bm, 0.80, 1.07, 0.006, 0.13, Md, n=3)
    box(bm, (0.035, 0.22, 0.02), (0.25, -0.14, 0.052), Md)           # latch lever
    obj('hatch_marking', bm, 'painted_orange', root)
    bm = bm_new()
    plate(bm, 0.76, 1.03, 0.011, 0.115, Md, n=3)
    obj('hatch_seal', bm, 'rubber', root)
    bm = bm_new()
    plate(bm, 0.72, 0.99, 0.026, 0.10, Md, n=3)
    plate(bm, 0.52, 0.36, 0.008, 0.04, Md @ T(0, -0.245, 0.026))
    obj('hatch_leaf', bm, 'painted_white', root, smooth=30)
    bm = bm_new()
    lathe(bm, [(0.156, 0.026), (0.156, 0.044), (0.120, 0.044), (0.120, 0.032)], 20, Md @ T(0, 0.22, 0))
    bolt_circle(bm, 0.138, 8, 0.010, 0.006, Md @ T(0, 0.22, 0.044))
    lathe(bm, [(0.055, 0.026), (0.055, 0.045), (0.0, 0.050)], 12, Md @ T(0.25, -0.05, 0))
    for sy in (-0.30, 0.30):                                         # hinges on the forward edge
        moved(bm, add_cyl(bm, 0.022, 0.13, (0, 0, 0), seg=8, axis='Y'), Md @ T(-0.385, sy, 0.022))
        box(bm, (0.11, 0.06, 0.008), (-0.33, sy, 0.030), Md)
    for y in (yc - 0.435, yc + 0.435):                               # grab rails either side
        handle(bm, (1.05, y, 1.20), (1.05, y, 1.72), 0.06, 0.014, 8)
    obj('hatch_hardware', bm, 'aluminium', root, smooth=50)
    bm = bm_new()
    lathe(bm, [(0.120, 0.034), (0.0, 0.034)], 20, Md @ T(0, 0.22, 0))
    obj('hatch_port', bm, 'glass_dark', root)

    # boarding steps between the middle and rear wheels
    bm = bm_new()
    for y in (yc - 0.27, yc + 0.27):
        beam(bm, (1.045, y, 0.86), (1.47, y, 0.20), 0.03, 0.075, c=0.008)
        tube(bm, [(1.44, y, 0.25), (0.70, y, 0.79)], 0.014, 6)
    obj('step_frame', bm, 'painted_dark', root, smooth=30)
    bm = bm_new()
    for x, z in ((1.228, 0.575), (1.39, 0.30)):
        box(bm, (0.21, 0.50, 0.028), (x, yc, z))
        for dx in (-0.07, 0.0, 0.07):
            box(bm, (0.018, 0.46, 0.008), (x + dx, yc, z + 0.018))
    obj('step_treads', bm, 'aluminium', root, bevel=0.004)

    # hatch keypad and an overhead lamp
    bm = bm_new()
    box(bm, (0.012, 0.08, 0.11), (1.056, yc + 0.40, 1.83))
    obj('hatch_keypad_box', bm, 'painted_dark', root, bevel=0.004)
    bm = bm_new()
    box(bm, (0.004, 0.055, 0.045), (1.063, yc + 0.40, 1.85))
    obj('hatch_keypad', bm, 'screen', root)
    return (1.95, yc, 0.0)


def _rover_roof(root):
    # ---------------- cargo rack on the rear compartment ----------------
    y0, y1, hx, zd, zr = -0.46, 2.00, 0.84, 2.125, 2.42
    bm = bm_new()
    sec = chamf(0.05, 0.06, 0.012)
    sweep(bm, [(hx, y0, zd), (hx, y1, zd), (-hx, y1, zd), (-hx, y0, zd)], sec, closed=True)
    for x in (-0.42, 0.0, 0.42):
        beam(bm, (x, y0, zd - 0.004), (x, y1, zd - 0.004), 0.04, 0.04)
    ys = [y0 + 0.16 + 0.2733 * j for j in range(9)]
    for y in ys:
        box(bm, (2 * hx - 0.05, 0.085, 0.02), (0, y, zd + 0.026))
    # feet down to the hull
    for y in (-0.36, 0.52, 1.32):
        for sx in (-1, 1):
            beam(bm, (sx * hx, y, zd - 0.02), (sx * 0.80, y, 1.995), 0.045, 0.045)
            box(bm, (0.10, 0.10, 0.012), (0, 0, 0.004), frame((sx * 0.795, y, 2.0), (sx * 0.39, 0, 0.92), (0, 1, 0)))
    for sx in (-1, 1):
        beam(bm, (sx * hx, 1.96, zd - 0.02), (sx * 0.72, 1.96, 1.985), 0.045, 0.045)
    obj('rack_deck', bm, 'painted_dark', root, smooth=30)

    bm = bm_new()
    rail = [(-0.86, y0, zd), (-0.86, y0, zr), (-0.86, y1 + 0.02, zr), (0.86, y1 + 0.02, zr), (0.86, y0, zr), (0.86, y0, zd)]
    tube(bm, rail, 0.022, 8, round_r=0.10)
    mid = [(-0.86, y0, 2.27), (-0.86, y1 + 0.02, 2.27), (0.86, y1 + 0.02, 2.27), (0.86, y0, 2.27)]
    tube(bm, mid, 0.014, 6, round_r=0.10)
    for y in (0.16, 0.78, 1.40):
        for sx in (-1, 1):
            tube(bm, [(sx * 0.86, y, zd), (sx * 0.86, y, zr)], 0.017, 6, caps=False)
    for x in (-0.43, 0.0, 0.43):
        tube(bm, [(x, y1 + 0.02, zd), (x, y1 + 0.02, zr)], 0.017, 6, caps=False)
    for sx in (-1, 1):                                               # tie-down rings
        for y in (-0.10, 0.86, 1.80):
            moved(bm, add_torus(bm, 0.04, 0.009, seg=8, ring_seg=4), T(sx * 0.70, y, zd + 0.075) @ R('X', 90))
            box(bm, (0.05, 0.03, 0.03), (sx * 0.70, y, zd + 0.045))
    obj('rack_rails', bm, 'aluminium', root, smooth=60)

    top = zd + 0.036                                                 # deck surface
    bm = bm_new()                                                    # a lashed-down equipment case ...
    box(bm, (0.44, 0.30, 0.20), (-0.50, 1.77, top + 0.10))
    obj('rack_case', bm, 'painted_orange', root, bevel=0.018)
    bm = bm_new()
    box(bm, (0.446, 0.306, 0.012), (-0.50, 1.77, top + 0.145))
    for x in (-0.62, -0.38):
        box(bm, (0.045, 0.012, 0.06), (x, 1.615, top + 0.145))
        box(bm, (0.035, 0.32, 0.008), (x, 1.77, top + 0.204))
    for x in (0.16, 0.56):                                           # ... and straps round the tarpaulin roll
        lathe(bm, [(0.098, -0.02), (0.098, 0.02), (0.09, 0.02), (0.09, -0.02)], 10, T(x, 1.80, top + 0.09) @ AX['X'], close=True)
    obj('rack_straps', bm, 'painted_dark', root, smooth=50)
    bm = bm_new()
    lathe(bm, [(0.0, -0.33), (0.07, -0.33), (0.088, -0.30), (0.092, -0.10), (0.086, 0.05), (0.093, 0.22), (0.085, 0.31),
               (0.06, 0.335), (0.0, 0.335)], 10, T(0.36, 1.80, top + 0.09) @ AX['X'])
    obj('rack_tarp', bm, 'canvas_dark', root, smooth=60)

    # ---------------- solar: two panels on the cab roof, a folding wing down each side ----------------
    fr, cell = bm_new(), bm_new()
    for sx in (-1, 1):
        M = T(sx * 0.355, -1.15, CAB_ROOF + 0.028)
        _solar_panel(fr, cell, M, 0.62, 0.98, 2, 4)
        for dy in (-0.38, 0.38):
            for dx in (-0.23, 0.23):
                box(fr, (0.05, 0.05, 0.03), (dx, dy, -0.013), M)
    tilt = 14.0
    for sx in (-1, 1):
        for yc in (-0.06, 0.74, 1.54):
            hinge = Vector((sx * 0.905, yc, zr + 0.01))
            M = frame(hinge, (sx * sin(rad(tilt)), 0, cos(rad(tilt))), (sx, 0, 0)) @ T(0.265, 0, 0)
            _solar_panel(fr, cell, M, 0.47, 0.77, 2, 3)
            for dy in (-0.25, 0.25):                                  # hinge knuckles on the rack rail, support strut
                box(fr, (0.07, 0.06, 0.035), (-0.265, dy, 0.012), M)
                outer = M @ Vector((0.14, dy, 0.0))
                tube(fr, [outer, (sx * (rear_side_x(outer.y, 1.80) + 0.004), outer.y, 1.80)], 0.011, 6)
    obj('solar_frames', fr, 'aluminium', root, smooth=30)
    obj('solar_cells', cell, 'solar_cell', root)

    # ---------------- light bar over the windscreen ----------------
    bm = bm_new()
    zb, yb = CAB_ROOF + 0.115, -1.83
    beam(bm, (-0.47, yb, zb), (0.47, yb, zb), 0.12, 0.105, c=0.02)
    for sx in (-1, 1):
        box(bm, (0.05, 0.07, 0.07), (sx * 0.34, yb + 0.01, zb - 0.08))
    for x in (-0.36, -0.13, 0.13, 0.36):
        lathe(bm, [(0.052, 0.0), (0.052, 0.022), (0.043, 0.022), (0.043, 0.004)], 12, T(x, yb - 0.06, zb) @ R('X', 90))
    obj('light_bar', bm, 'painted_dark', root, smooth=40)
    bm = bm_new()
    for x in (-0.36, -0.13, 0.13, 0.36):
        lathe(bm, [(0.043, 0.008), (0.036, 0.016), (0.0, 0.019)], 12, T(x, yb - 0.06, zb) @ R('X', 90))
    obj('light_bar_lamps', bm, 'light_white', root, smooth=60)
    bm = bm_new()
    for sx in (-1, 1):
        box(bm, (0.012, 0.07, 0.05), (sx * 0.476, yb, zb))
    obj('light_bar_markers', bm, 'light_amber', root)

    # ---------------- cab roof furniture: rails, hatch, sensor dome ----------------
    bm = bm_new()
    for sx in (-1, 1):
        handle(bm, (sx * 0.712, -1.54, CAB_ROOF), (sx * 0.712, -0.72, CAB_ROOF), 0.07, 0.015, 8, normal=(0, 0, 1))
    lathe(bm, [(0.07, 0.0), (0.07, 0.02), (0.056, 0.045), (0.03, 0.065), (0.0, 0.07)], 12, T(0, -1.70, CAB_ROOF))
    handle(bm, (-0.42, -0.578, 2.585), (0.42, -0.578, 2.585), 0.05, 0.013, 8, normal=(0, 1, 0))     # over the rear window
    obj('roof_rails', bm, 'aluminium', root, smooth=60)


def _rover_lights(root):
    dark, lamp, red, amber = bm_new(), bm_new(), bm_new(), bm_new()
    for sx in (-1, 1):
        # headlight pods let into the bonnet
        box(dark, (0.36, 0.225, 0.19), (sx * 0.34, -2.7325, 1.44))
        Mh = frame((sx * 0.34, -2.846, 1.435), (0, -1, 0), (1, 0, 0))
        plate(lamp, 0.28, 0.105, 0.008, 0.03, Mh)
        box(dark, (0.012, 0.115, 0.012), (0.045 * sx, 0, 0.006), Mh)
        # work lamps on the back of the cab, looking down the rack
        box(dark, (0.12, 0.06, 0.08), (sx * 0.62, -0.55, 2.62))
        box(lamp, (0.09, 0.008, 0.055), (sx * 0.62, -0.518, 2.62))
        # corner markers
        Mc = frame((sx * 0.82, -2.47, 1.44), (sx * 0.698, -0.642, 0.317), (0, 0, 1))
        box(amber, (0.035, 0.10, 0.012), (0, 0, 0.006), Mc)
        Mt = frame((sx * 0.68, 2.49, 1.51), (sx * 0.735, 0.678, 0), (0, 0, 1))
        box(dark, (0.30, 0.09, 0.02), (0, 0, 0.01), Mt)
        box(red, (0.15, 0.06, 0.012), (-0.06, 0, 0.022), Mt)
        box(amber, (0.08, 0.06, 0.012), (0.085, 0, 0.022), Mt)
    # tail light bar
    beam(dark, (-0.51, 2.642, 1.63), (0.51, 2.642, 1.63), 0.045, 0.10, c=0.012)
    for sx in (-1, 1):
        box(red, (0.30, 0.012, 0.06), (sx * 0.32, 2.668, 1.63))
    box(lamp, (0.20, 0.012, 0.06), (0, 2.668, 1.63))
    obj('lamp_housings', dark, 'painted_dark', root, bevel=0.008)
    obj('lamps_white', lamp, 'light_white', root)
    obj('lamps_red', red, 'light_red', root)
    obj('lamps_amber', amber, 'light_amber', root)
    anchor('headlight_L', root, (0.34, -2.86, 1.435))
    anchor('headlight_R', root, (-0.34, -2.86, 1.435))
    anchor('taillight', root, (0, 2.68, 1.63))


def _rover_tanks(root):
    gold, metal, dark = bm_new(), bm_new(), bm_new()
    for (y, z) in ((2.25, 2.245), (2.535, 2.150)):
        M = T(0, y, z) @ AX['X']
        prof = [(0.0, -0.50)] + [(0.14 * sin(rad(a)), -0.40 - 0.10 * cos(rad(a))) for a in (25, 50, 75, 90)]
        prof += [(0.14 * sin(rad(a)), 0.40 + 0.10 * cos(rad(a))) for a in (90, 75, 50, 25)] + [(0.0, 0.50)]
        lathe(gold, prof, 16, M)
        for x in (-0.28, 0.28):
            lathe(metal, [(0.146, -0.022), (0.146, 0.022), (0.139, 0.022), (0.139, -0.022)], 16, M @ T(0, 0, x), close=True)
            drop = 0.07 if y < 2.4 else 0.19
            box(dark, (0.06, 0.20, drop), (x, y, z - 0.09 - drop / 2))
        # valve and feed line off the left end
        lathe(metal, [(0.03, 0.495), (0.03, 0.53), (0.018, 0.535), (0.018, 0.56), (0.0, 0.56)], 8, M)
        tube(metal, [(0.56, y, z), (0.60, y, z), (0.62, y - 0.04, z - 0.10), (0.60, 2.16, 2.03)], 0.011, 6, round_r=0.03)
    obj('tanks', gold, 'gold_foil', root, smooth=50)
    obj('tank_straps', metal, 'aluminium', root, smooth=50)
    obj('tank_cradles', dark, 'painted_dark', root, bevel=0.01)


def _rover_antennas(root):
    # high-gain dish on a mast at the back of the cab roof (right side); the `dish` part yaws
    zr = CAB_ROOF
    px, py, pz = -0.50, -0.86, zr + 0.46
    bm = bm_new()
    lathe(bm, [(0.085, zr), (0.085, zr + 0.015), (0.04, zr + 0.04), (0.034, zr + 0.08), (0.034, pz - 0.13), (0.062, pz - 0.11),
               (0.062, pz - 0.005), (0.0, pz - 0.005)], 12, T(px, py, 0))
    for a in (30, 150, 270):
        prism(bm, [(0.034, zr + 0.01), (0.08, zr + 0.01), (0.034, zr + 0.13)], 0.012, T(px, py, 0) @ R('Z', a) @ R('X', 90))
    # whip antenna base on the left
    lathe(bm, [(0.05, 0.0), (0.05, 0.015), (0.024, 0.03), (0.024, 0.05), (0.03, 0.065), (0.02, 0.08), (0.03, 0.095), (0.02, 0.11),
               (0.03, 0.125), (0.016, 0.145), (0.0, 0.145)], 10, T(0.56, -0.80, zr))
    obj('antenna_mounts', bm, 'aluminium', root, smooth=50)
    bm = bm_new()
    sweep(bm, [(0.56, -0.80, zr + 0.13), (0.562, -0.79, zr + 0.73), (0.575, -0.755, zr + 1.28), (0.60, -0.70, zr + 1.60)], circ(1.0, 5),
          scales=[0.009, 0.007, 0.0055, 0.004])
    tube(bm, [(px + 0.06, py, pz - 0.14), (px + 0.12, py, pz - 0.20), (px + 0.12, py, zr + 0.04), (px + 0.20, py + 0.10, zr + 0.015),
              (px + 0.20, -0.62, zr + 0.015)], 0.012, 6, round_r=0.04)
    obj('whip', bm, 'painted_dark', root, smooth=70)
    bm = bm_new()
    add_sphere(bm, 0.022, (0.60, -0.70, zr + 1.61), 8, 6)
    obj('whip_tip', bm, 'painted_orange', root)

    dish = part('dish', root, loc=(px, py, pz))
    bm = bm_new()
    box(bm, (0.26, 0.10, 0.035), (0, 0, 0.018))
    for sx in (-1, 1):
        prism(bm, [(-0.05, 0.03), (0.05, 0.03), (0.035, 0.235), (-0.035, 0.235)], 0.022, T(sx * 0.119, 0, 0) @ YZX)
    obj('dish_yoke', bm, 'painted_grey', dish, bevel=0.006)
    aim = Vector((0, -cos(rad(38)), sin(rad(38))))
    Md = T(0, 0, 0.20) @ frame((0, 0, 0), aim, (1, 0, 0)) @ T(0, 0, 0.075)
    bm = bm_new()
    k = 0.70
    rs = [0.43, 0.36, 0.27, 0.17, 0.08]
    prof = [(r, k * r * r) for r in rs] + [(0.0, 0.0), (0.0, -0.014)] + [(r, k * r * r - 0.014) for r in reversed(rs)]
    lathe(bm, prof, 24, Md, close=True)
    obj('dish_reflector', bm, 'painted_white', dish, smooth=50)
    bm = bm_new()
    lathe(bm, [(0.44, k * 0.43 ** 2 - 0.02), (0.44, k * 0.43 ** 2 + 0.006), (0.425, k * 0.43 ** 2 + 0.006)], 24, Md)
    lathe(bm, [(0.0, -0.085), (0.075, -0.085), (0.075, -0.012)], 12, Md)
    for i in range(6):
        Mr = Md @ R('Z', 60 * i + 30)
        prism(bm, [(0.07, -0.07), (0.40, k * 0.16 - 0.03), (0.40, k * 0.16 - 0.016), (0.25, k * 0.0625 - 0.016), (0.07, -0.014)],
              0.012, Mr @ R('X', 90))
    for i in range(3):
        a = rad(120 * i + 90)
        tube(bm, [(0.40 * cos(a), 0.40 * sin(a), k * 0.16), (0.03 * cos(a), 0.03 * sin(a), 0.345)], 0.008, 5, M=Md)
    lathe(bm, [(0.0, 0.325), (0.042, 0.325), (0.03, 0.375), (0.0, 0.375)], 10, Md)
    moved(bm, add_cyl(bm, 0.024, 0.28, (0, 0, 0), seg=8, axis='X'), T(0, 0, 0.20))      # elevation trunnion
    box(bm, (0.10, 0.07, 0.09), (0, 0.11, -0.02), Md)                                    # receiver box behind the dish
    obj('dish_fittings', bm, 'aluminium', dish, smooth=40)
    return dish


def rear_side_x(y, z):
    """Half-width of the rear compartment's skin at (y, z), read from the REAR table."""
    lv = _hull_levels(REAR)

    def xat(ring):
        pts = ring[1:5]
        for a, b in zip(pts, pts[1:]):
            if a[1] <= y <= b[1]:
                t = (y - a[1]) / (b[1] - a[1])
                return a[0] + (b[0] - a[0]) * t
        return pts[-1][0] if y > pts[-1][1] else pts[0][0]

    for a, b in zip(lv, lv[1:]):
        if a[0][2] <= z <= b[0][2]:
            t = (z - a[0][2]) / (b[0][2] - a[0][2])
            return xat(a) + (xat(b) - xat(a)) * t
    return xat(lv[-1])


def _rover_details(root):
    white, alu, dark, orange, yellow = bm_new(), bm_new(), bm_new(), bm_new(), bm_new()

    # high-visibility belt line down both sides
    for sx in (-1, 1):
        z = 1.35
        beam(orange, (sx * 1.047, -2.16, z), (sx * 1.047, -0.60, z), 0.008, 0.05)
        beam(orange, (sx * 1.043, -0.515, z), (sx * 1.043, 0.345, z), 0.008, 0.05)
        if sx < 0:
            beam(orange, (sx * 1.043, 0.425, z), (sx * 1.043, 1.38, z), 0.008, 0.05)
        beam(orange, (sx * 1.041, 1.46, z), (sx * 0.806, 2.34, z), 0.008, 0.05)

    # radiators on the compartment walls
    slat, back = bm_new(), bm_new()
    _radiator(alu, slat, back, frame((1.04, -0.085, 1.545), (1, 0, 0), (0, 1, 0)), 0.70, 0.28)
    _radiator(alu, slat, back, frame((-1.04, -0.085, 1.545), (-1, 0, 0), (0, -1, 0)), 0.70, 0.28)
    _radiator(alu, slat, back, frame((-1.04, 0.90, 1.545), (-1, 0, 0), (0, -1, 0)), 0.80, 0.28)
    obj('radiator_slats', slat, 'painted_white', root)
    obj('radiator_backs', back, 'painted_dark', root)

    # stowage locker under the right-hand sponson, between the middle and rear wheels
    box(white, (0.345, 0.56, 0.37), (-0.872, 0.95, 0.985))
    box(dark, (0.352, 0.567, 0.014), (-0.872, 0.95, 1.075))
    for y in (0.80, 1.10):
        box(alu, (0.012, 0.05, 0.085), (-1.049, y, 1.07))
    handle(alu, (-1.045, 0.84, 0.93), (-1.045, 1.06, 0.93), 0.035, 0.010, 6, normal=(-1, 0, 0))

    # conduit runs along the shoulder of the compartment, with clamps
    for sx in (-1, 1):
        xe = rear_side_x(2.2, 1.852)
        pts = [(sx * 0.985, -0.50, 1.852), (sx * 0.985, 1.40, 1.852), (sx * (xe + 0.018), 2.2, 1.852), (sx * (xe - 0.03), 2.25, 1.852)]
        tube(dark, pts, 0.017, 6, round_r=0.04)
        tube(dark, [(sx * 0.955, -0.50, 1.905), (sx * 0.955, 1.40, 1.905)], 0.011, 6)
        for y in (-0.30, 0.10, 0.62, 1.10):
            box(alu, (0.028, 0.03, 0.10), (0, 0, 0.012), frame((sx * 0.972, y, 1.876), (sx * 0.864, 0, 0.504), (0, 1, 0)) @ R('Z', 90))

    # windscreen wipers
    Mg = frame((0, -2.64, 1.58), (0, -0.8786, 0.4775), (1, 0, 0))
    for px in (0.43, -0.10):
        tube(dark, [(px, 0.035, 0.012), (px - 0.02, 0.10, 0.004), (px - 0.11, 0.45, -0.004)], 0.008, 5, M=Mg)
        beam(dark, (px - 0.085, 0.20, -0.013), (px - 0.125, 0.62, -0.013), 0.018, 0.014, M=Mg)
        lathe(dark, [(0.022, 0.0), (0.022, 0.02), (0.0, 0.024)], 8, Mg @ T(px, 0.035, 0))

    # mirror-camera pods on the A pillars, grab handles and access panels on the cab sides
    for sx in (-1, 1):
        tube(dark, [(sx * 1.045, -2.11, 1.70), (sx * 1.14, -2.17, 1.75), (sx * 1.21, -2.20, 1.75)], 0.014, 6, round_r=0.03)
        box(dark, (0.07, 0.11, 0.15), (sx * 1.235, -2.205, 1.76))
        nrm = Vector((sx * 0.987, 0, 0.161))

        def wall(y, z, off=0.0):
            return Vector((sx * (1.06 - (z - 1.58) * 0.15 / 0.92), y, z)) + nrm * off

        handle(alu, wall(-0.665, 1.72), wall(-0.665, 2.22), 0.055, 0.014, 8, normal=nrm)
        # avionics bay door: vents, latch, label
        Mp = frame(wall(-0.90, 2.02), nrm, (0, sx, 0))
        plate(white, 0.30, 0.72, 0.010, 0.035, Mp)
        bolt_rect(alu, 0.25, 0.67, 2, 4, 0.009, 0.005, Mp @ T(0, 0, 0.010))
        for j in range(4):
            box(dark, (0.19, 0.022, 0.006), (0, 0.24 - 0.045 * j, 0.012), Mp)
        box(alu, (0.05, 0.09, 0.012), (-sx * 0.085, -0.10, 0.014), Mp)
        plate(yellow, 0.14, 0.05, 0.004, 0.008, Mp @ T(0, -0.26, 0.010))
        # jacking points on the keel
        for y in (-1.35, 1.30):
            box(yellow, (0.012, 0.16, 0.08), (sx * 0.706, y, 0.96))

    # service hatch, label and handle on the tail
    Mr = frame((0, 2.62, 1.445), (0, 1, 0), (-1, 0, 0))
    plate(white, 0.74, 0.21, 0.012, 0.03, Mr)
    bolt_rect(alu, 0.68, 0.15, 5, 2, 0.010, 0.006, Mr @ T(0, 0, 0.012))
    plate(yellow, 0.20, 0.07, 0.004, 0.01, Mr @ T(-0.18, 0, 0.012))
    handle(alu, (0.12, 2.632, 1.445), (0.30, 2.632, 1.445), 0.035, 0.010, 6, normal=(0, 1, 0))
    # number plate on the bonnet between the lamps
    plate(yellow, 0.24, 0.10, 0.006, 0.012, frame((0, -2.72, 1.44), (0, -0.868, 0.496), (1, 0, 0)))
    # ribbed bash plate under the nose
    Ms = frame((0, -2.642, 0.94), (0, -0.928, -0.371), (1, 0, 0))
    plate(alu, 0.84, 0.36, 0.012, 0.03, Ms)
    for i in range(6):
        box(alu, (0.03, 0.30, 0.012), (-0.30 + 0.12 * i, 0, 0.017), Ms)
    bolt_rect(alu, 0.78, 0.30, 2, 2, 0.012, 0.008, Ms @ T(0, 0, 0.012))

    # finned thermal unit on the tail under the hatch, with coolant lines up into the hull
    box(dark, (0.56, 0.10, 0.30), (0, 2.585, 0.965))
    for i in range(11):
        box(dark, (0.012, 0.075, 0.27), (-0.25 + 0.05 * i, 2.665, 0.965))
    for sx in (-1, 1):
        box(alu, (0.03, 0.12, 0.33), (sx * 0.295, 2.60, 0.965))
        tube(alu, [(sx * 0.33, 2.62, 1.06), (sx * 0.40, 2.64, 1.10), (sx * 0.40, 2.655, 1.30), (sx * 0.40, 2.64, 1.36), (sx * 0.40, 2.61, 1.36)],
             0.014, 6, round_r=0.03)
    Mv = frame((0, 2.572, 1.84), (0, 0.923, 0.385), (-1, 0, 0))        # louvred vent on the tail's upper chamfer
    plate(dark, 0.62, 0.17, 0.008, 0.02, Mv)
    for j in range(4):
        box(alu, (0.56, 0.022, 0.006), (0, -0.054 + 0.036 * j, 0.012), Mv @ R('X', 20))
    for sx in (-1, 1):
        handle(alu, (sx * 0.47, 2.572, 1.78), (sx * 0.47, 2.537, 1.90), 0.04, 0.011, 6, normal=(0, 0.923, 0.385))

    # fastener rows on the ring frames, service lines along the keel
    for y in (-0.555, 0.385, 1.42, 1.80):
        for sx in (-1, 1):
            for z in (1.40, 1.54, 1.66):
                bolt(alu, 0.011, 0.006, frame((sx * (rear_side_x(y, 1.5) + (0.016 if y < 1.5 else 0.02)), y, z), (sx, 0, 0)))
            if y > 1.5:
                continue
            bolt(alu, 0.011, 0.006, frame((sx * (0.97 + 0.0138), y, 1.84 + 0.008), (sx * 0.864, 0, 0.504)))
            for x in (0.2, 0.5):
                bolt(alu, 0.011, 0.006, T(sx * x, y, 2.096))
    for sx in (-1, 1):
        y_end = 0.40 if sx > 0 else 0.60
        tube(alu, [(sx * 0.722, -2.36, 1.105), (sx * 0.722, y_end, 1.105), (sx * 0.69, y_end + 0.04, 1.105)], 0.018, 6, round_r=0.02)
        for y in (-2.2, -1.5, -0.3, 0.3):
            box(dark, (0.02, 0.04, 0.06), (sx * 0.716, y, 1.105))

    obj('trim_white', white, 'painted_white', root, bevel=0.006, smooth=30)
    obj('trim_alu', alu, 'aluminium', root, smooth=50)
    obj('trim_dark', dark, 'painted_dark', root, smooth=50)
    obj('trim_orange', orange, 'painted_orange', root)
    obj('trim_yellow', yellow, 'painted_yellow', root)


def build_rover():
    root = part('rover')
    _rover_cab(root)
    _rover_cab_interior(root)
    _rover_rear(root)
    _rover_chassis(root)
    _rover_suspension(root)
    door = _rover_door(root)
    _rover_roof(root)
    _rover_lights(root)
    _rover_tanks(root)
    _rover_antennas(root)
    _rover_details(root)
    anchor('seat', root, (0.40, -1.42, CAB_FLOOR + 0.54))
    anchor('door', root, door)
    anchor('cargo', root, (0, 0.85, 2.165))
    anchor('col_body', root, (0, 0, 0), radius=2.6)
    return finish(root, 'rover')


# ==============================================================================================
# 3. Mars Ascent Vehicle
# ==============================================================================================
MAV_R = 2.10            # first-stage radius
MAV_R2 = 1.80           # second stage, crew module and fairing
MAV_CLEAR = 2.22        # nothing fixed to the tower comes nearer the axis than this; nothing on the ascent stage reaches it
MAV_DECK = 4.30         # top of the descent stage deck
MAV_ASC = 4.40          # base of the ascent stage (top of the launch ring) = origin of `ascent`
MAV_FLAT = 2.72 * cos(rad(22.5))      # distance from the axis to the flats of the octagonal descent stage


def polar(r, deg, z=0.0):
    return (r * cos(rad(deg)), r * sin(rad(deg)), z)


def radial_frame(r, deg, z, up=(0, 0, 1)):
    """Frame on a cylinder: local Z points outward, local Y up, local X along the surface."""
    n = Vector((cos(rad(deg)), sin(rad(deg)), 0))
    x = Vector(up).cross(n)
    return frame(n * r + Vector((0, 0, z)), n, x)


def bolt_ring(bm, r, z, count, size=0.02, h=0.012, phase=0.0, seg=6):
    for i in range(count):
        bolt(bm, size, h, radial_frame(r, phase + 360.0 * i / count, z), seg)


def foil_panel(bm, M, w, h, nx=4, ny=4, jitter=0.02, seed=1):
    """A crinkled insulation blanket in local XY (flat-shaded facets), bulging along +Z."""
    rng = random.Random(seed)
    grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            edge = i in (0, nx) or j in (0, ny)
            z = 0.0 if edge else 0.02 + rng.uniform(-jitter, jitter)
            x = -w / 2 + w * i / nx + (0 if edge else rng.uniform(-0.03, 0.03))
            y = -h / 2 + h * j / ny + (0 if edge else rng.uniform(-0.03, 0.03))
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


def bell(bm, M, r_exit, length, r_throat, seg=20, chamber=True):
    """Rocket engine: thin-walled bell hanging below local z=0 (the gimbal), chamber above the throat."""
    pts = [(0.0, 0.0), (0.35, 0.10), (0.62, 0.30), (0.82, 0.55), (0.94, 0.78), (1.0, 1.0)]     # (radius, depth) fractions
    zt = -length * 0.28                                                                       # throat height
    inner = [(r_throat * 0.85 + (r_exit - 0.02 - r_throat * 0.85) * f, zt - (length + zt) * g) for f, g in pts]
    outer = [(r_throat + (r_exit - r_throat) * f, zt - (length + zt) * g) for f, g in pts]
    prof = [(0.0, zt)] + inner + list(reversed(outer))
    if chamber:
        prof += [(r_throat * 1.7, zt * 0.62), (r_throat * 1.85, zt * 0.15), (r_throat * 1.4, 0.0), (0.0, 0.0)]
    else:
        prof += [(r_throat, 0.0), (0.0, 0.0)]
    lathe(bm, prof, seg, M)


def _mav_leg(bm_alu, bm_foil, bm_white, deg):
    """One landing leg; built in a frame whose +X is the outward radial direction."""
    M = R('Z', deg)
    pad_r = 4.5
    # footpad: a shallow dish with a rim and radial ribs
    lathe(bm_alu, [(0.0, 0.0), (0.50, 0.0), (0.68, 0.095), (0.68, 0.14), (0.61, 0.14), (0.46, 0.07), (0.17, 0.07), (0.13, 0.21),
                   (0.0, 0.21)], 16, M @ T(pad_r, 0, 0))
    for i in range(6):
        prism(bm_alu, [(0.14, 0.065), (0.60, 0.065), (0.60, 0.135), (0.14, 0.18)], 0.022, M @ T(pad_r, 0, 0) @ R('Z', 60 * i) @ R('X', 90))
    foot = Vector((pad_r, 0, 0.24))
    top = Vector((2.92, 0, 4.02))
    axis = (top - foot)
    L = axis.length
    Ms = M @ frame(foot, axis, (0, 1, 0))

    def add(bm, prof, seg=12):
        return lathe(bm, prof, seg, Ms)

    # ball joint, piston, cylinder with collars
    moved(bm_alu, add_sphere(bm_alu, 0.14, (0, 0, 0), 10, 6), M @ T(*foot))
    add(bm_alu, wall(0.105, 0.0, L * 0.38, pad=0.2, step=3))
    add(bm_alu, [(0.0, L * 0.36), (0.205, L * 0.36), (0.205, L * 0.40), (0.17, L * 0.41)])
    add(bm_white, wall(0.17, L * 0.41, L * 0.60, pad=0.08, step=3))
    add(bm_alu, [(0.195, L * 0.60), (0.195, L * 0.63), (0.17, L * 0.63)])
    add(bm_alu, [(0.17, L * 0.94), (0.205, L * 0.94), (0.205, L * 0.985), (0.12, L), (0.0, L)])
    # the upper cylinder is wrapped in foil
    n = 10
    rings = []
    rng = random.Random(int(deg))
    for j in range(5):
        z = L * (0.63 + 0.31 * j / 4)
        rings.append([bm_foil.verts.new(Ms @ Vector(((0.185 + (0 if j in (0, 4) else rng.uniform(-0.012, 0.016))) * cos(TAU * i / n),
                                                     (0.185 + (0 if j in (0, 4) else rng.uniform(-0.012, 0.016))) * sin(TAU * i / n), z)))
                      for i in range(n)])
    for a, b in zip(rings, rings[1:]):
        for i in range(n):
            bm_foil.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    # outrigger: a braced bracket from the top corner of the stage out to the strut head
    for sy in (-1, 1):
        tube(bm_alu, [M @ Vector((MAV_FLAT - 0.02, sy * 0.62, 4.12)), M @ top], 0.055, 8)
        tube(bm_alu, [M @ Vector((MAV_FLAT - 0.02, sy * 0.62, 3.20)), M @ (top - Vector((0.02, 0, 0.06)))], 0.045, 8)
        # lower V struts from the bottom corners of the stage to the knee collar
        knee = foot + axis * 0.385
        tube(bm_alu, [M @ Vector((2.42, sy * 0.80, 2.02)), M @ (knee + Vector((0, sy * 0.10, 0)))], 0.075, 8)
        moved(bm_alu, add_sphere(bm_alu, 0.085, (0, 0, 0), 8, 6), M @ T(2.42, sy * 0.80, 2.02))
        moved(bm_alu, add_sphere(bm_alu, 0.085, (0, 0, 0), 8, 6), M @ T(*(knee + Vector((0, sy * 0.10, 0)))))
    moved(bm_alu, add_sphere(bm_alu, 0.19, (0, 0, 0), 10, 6), M @ T(*top))
    box(bm_alu, (0.10, 1.50, 0.16), (MAV_FLAT + 0.03, 0, 4.12), M)
    box(bm_alu, (0.10, 1.50, 0.12), (MAV_FLAT + 0.03, 0, 3.20), M)


def _mav_descent(root):
    oct_phase = rad(22.5)
    # structural core (dark, mostly hidden behind the blankets)
    bm = bm_new()
    lathe(bm, [(0.0, 1.50), (1.95, 1.50), (2.72, 1.95), (2.72, 4.20), (1.62, 4.20)], 8, phase=oct_phase)
    obj('descent_core', bm, 'painted_dark', root)

    # gold insulation blankets: two per side plus the lower chamfer
    foil = bm_new()
    w = 2 * 2.72 * sin(rad(22.5)) - 0.20
    for k in range(8):
        deg = 45 * k
        foil_panel(foil, radial_frame(MAV_FLAT + 0.012, deg, 3.645), w, 0.98, 5, 3, seed=k)
        foil_panel(foil, radial_frame(MAV_FLAT + 0.012, deg, 2.535), w, 1.00, 5, 3, seed=20 + k)
        n = Vector((cos(rad(deg)) * 0.534, sin(rad(deg)) * 0.534, -0.846))
        c = Vector(polar((MAV_FLAT + 1.95 * cos(rad(22.5))) / 2, deg, 1.725)) + n * 0.012
        foil_panel(foil, frame(c, n, Vector((0, 0, 1)).cross(Vector((cos(rad(deg)), sin(rad(deg)), 0)))), w * 0.76, 0.74, 4, 2, seed=40 + k)

    alu = bm_new()
    sec = chamf(0.09, 0.09, 0.02)                                    # frame members round the blankets
    for k in range(8):
        x, y, _ = polar(2.735, 22.5 + 45 * k)
        beam(alu, (x, y, 1.96), (x, y, 4.20), 0.10, 0.10, c=0.02)
    for z in (1.99, 3.09, 4.15):
        sweep(alu, [polar(2.735, 22.5 + 45 * k, z) for k in range(8)], sec, closed=True)
    sweep(alu, [polar(1.96, 22.5 + 45 * k, 1.515) for k in range(8)], sec, closed=True)

    # deck: octagonal plate, steel launch ring and flame well in the middle
    bm = bm_new()
    lathe(bm, [(2.20, 4.20), (2.95, 4.20), (2.95, 4.30), (2.20, 4.30)], 8, phase=oct_phase)
    for k in range(8):                                                # deck beams under the walkway
        a, b = Vector(polar(2.2, 45 * k, 4.17)), Vector(polar(2.80, 45 * k, 4.17))
        beam(bm, a, b, 0.10, 0.08)
    obj('deck', bm, 'painted_grey', root, bevel=0.012)
    bm = bm_new()
    lathe(bm, [(2.46, 4.30), (2.46, 4.325), (2.26, 4.325), (2.23, MAV_ASC), (1.97, MAV_ASC), (1.94, 4.325), (1.48, 4.325),
               (1.48, 4.22)], 40)
    for k in range(16):                                               # deck plate seams
        beam(bm, polar(2.47, 22.5 * k, 4.303), polar(2.93 * (cos(rad(22.5)) if k % 2 == 0 else 1.0), 22.5 * k, 4.303), 0.03, 0.012)
    obj('launch_ring', bm, 'steel', root, smooth=30)
    bm = bm_new()
    lathe(bm, [(1.48, 4.22), (1.48, 3.40), (1.48, 2.55), (0.85, 2.62), (0.0, 2.92)], 32)
    obj('flame_well', bm, 'painted_dark', root, smooth=30)
    bm = bm_new()
    for k in range(8):                                                # hold-down clamps
        prism(bm, [(-0.02, 0.0), (0.24, 0.0), (0.24, 0.06), (0.06, 0.20), (-0.02, 0.20)], 0.16,
              R('Z', 22.5 + 45 * k) @ T(2.22, 0, 4.325) @ R('X', 90))
    obj('hold_downs', bm, 'painted_yellow', root, bevel=0.01)

    # handrail round the deck, open on the tower side (-Y)
    rail = [polar(2.88, 292.5 + 45 * k, 0) for k in range(8)]
    for z, r in ((MAV_DECK + 1.05, 0.024), (MAV_DECK + 0.55, 0.017)):
        tube(alu, [(x, y, z) for x, y, _ in rail], r, 6)
    for k in range(8):
        x, y, _ = rail[k]
        tube(alu, [(x, y, MAV_DECK), (x, y, MAV_DECK + 1.05)], 0.022, 6)
        if k < 7:
            mx, my = (x + rail[k + 1][0]) / 2, (y + rail[k + 1][1]) / 2
            tube(alu, [(mx, my, MAV_DECK), (mx, my, MAV_DECK + 1.05)], 0.018, 6)

    # propellant tanks on the +X and -X sides
    white, dark = bm_new(), bm_new()
    for sx in (-1, 1):
        cx = sx * (MAV_FLAT + 0.14)
        prof = [(0.0, -1.07)] + [(0.76 * sin(rad(a)), -0.55 - 0.52 * cos(rad(a))) for a in (20, 40, 60, 78, 90)]
        prof += [(0.76 * sin(rad(a)), 0.55 + 0.52 * cos(rad(a))) for a in (90, 78, 60, 40, 20)] + [(0.0, 1.07)]
        lathe(white, prof, 24, T(cx, 0, 3.02))
        for z in (2.57, 3.47):
            lathe(alu, [(0.775, z - 0.04), (0.775, z + 0.04), (0.755, z + 0.04), (0.755, z - 0.04)], 24, T(cx, 0, 0), close=True)
            for sy in (-1, 1):
                beam(alu, (sx * (MAV_FLAT - 0.02), sy * 0.62, z), (cx + sx * 0.25, sy * 0.72, z), 0.06, 0.07)
        # fill and vent plumbing
        tube(alu, [(cx + sx * 0.30, 0.33, 3.97), (cx + sx * 0.74, 0.42, 3.88), (cx + sx * 0.74, 0.42, 2.30), (cx + sx * 0.50, 0.52, 2.00),
                   (sx * (MAV_FLAT - 0.1), 0.52, 2.00)], 0.035, 8, round_r=0.10)

    # in-situ propellant plant on the +Y side: housing, intake fan, two sorption columns, radiator
    My = radial_frame(MAV_FLAT, 90, 0)            # local X = -worldX, Y = up, Z = outward (+Y)
    box(white, (1.30, 1.25, 0.50), (0.25, 2.80, 0.25), My)
    lathe(alu, [(0.34, 0.50), (0.34, 0.56), (0.28, 0.56), (0.28, 0.51)], 20, My @ T(0.50, 2.97, 0))
    lathe(dark, [(0.28, 0.515), (0.08, 0.515), (0.08, 0.56), (0.0, 0.575)], 20, My @ T(0.50, 2.97, 0))
    for i in range(6):
        box(dark, (0.56, 0.03, 0.02), (0, 0, 0.53), My @ T(0.50, 2.97, 0) @ R('Z', 30 * i))
    slat, back = bm_new(), bm_new()
    _radiator(alu, slat, back, My @ T(-0.14, 2.80, 0.50), 0.40, 0.90)
    obj('plant_slats', slat, 'painted_white', root)
    for x in (-0.58, -0.88):
        lathe(alu, [(0.0, 2.05), (0.13, 2.05), (0.16, 2.10), (0.16, 2.20), (0.14, 2.21), (0.14, 3.72), (0.16, 3.73), (0.16, 3.83),
                    (0.13, 3.88), (0.0, 3.88)], 14, My @ T(x, 0, 0.26) @ R('X', -90))
        tube(alu, [My @ Vector((x, 3.88, 0.26)), My @ Vector((x, 4.00, 0.26)), My @ Vector((x + 0.12, 4.04, 0.10)), My @ Vector((x + 0.30, 4.04, 0.0)),
                   My @ Vector((x + 0.30, 4.04, -0.06))], 0.03, 8, round_r=0.05)
        box(alu, (0.36, 0.06, 0.30), (x, 2.45, 0.13), My)
        box(alu, (0.36, 0.06, 0.30), (x, 3.45, 0.13), My)
    box(dark, (0.30, 0.20, 0.02), (0.60, 2.38, 0.50), My)
    obj('plant_dark', back, 'painted_dark', root)

    # equipment on the -Y side beside the tower: avionics boxes, cable tray
    Mf = radial_frame(MAV_FLAT, 270, 0)           # local X = +worldX, Y = up, Z = outward (-Y)
    box(white, (0.50, 0.70, 0.30), (0.66, 3.55, 0.15), Mf)
    box(white, (0.46, 0.50, 0.24), (-0.68, 2.55, 0.12), Mf)
    box(white, (0.46, 0.34, 0.20), (-0.68, 3.62, 0.10), Mf)
    for (x, y) in ((0.66, 3.55), (-0.68, 2.55)):
        box(dark, (0.30, 0.10, 0.012), (x, y + 0.12, 0.306 if x > 0 else 0.246), Mf)
    tube(dark, [Mf @ Vector((-0.68, 2.80, 0.12)), Mf @ Vector((-0.68, 3.45, 0.12))], 0.03, 6)
    tube(dark, [Mf @ Vector((0.66, 3.20, 0.10)), Mf @ Vector((0.66, 2.30, 0.10)), Mf @ Vector((0.40, 2.10, 0.06)), Mf @ Vector((0.40, 2.02, 0.0))],
         0.03, 6, round_r=0.08)

    lathe(alu, [(0.0, 1.30), (0.30, 1.34), (0.34, 1.44), (0.30, 1.50)], 14)                                      # landing radar
    x, y, _ = polar(2.88, 112.5)
    tube(alu, [(x, y, MAV_DECK + 1.05), (x, y, MAV_DECK + 2.3)], 0.022, 6)
    lathe(alu, [(0.0, 0.0), (0.11, 0.0), (0.11, 0.03), (0.03, 0.06), (0.03, 0.22), (0.0, 0.24)], 10, T(x, y, MAV_DECK + 2.3))
    box(dark, (0.40, 0.012, 0.24), (-0.68, -MAV_FLAT - 0.035, 3.12))                # data plate
    # descent engines under the stage
    eng = bm_new()
    for k in range(4):
        x, y, _ = polar(1.25, 90 * k)
        bell(eng, T(x, y, 1.52), 0.42, 0.80, 0.11, 14, chamber=True)
        lathe(alu, [(0.26, 1.42), (0.26, 1.50)], 12, T(x, y, 0), )
    obj('descent_engines', eng, 'titanium', root, smooth=50)

    # legs on the diagonals
    for k in range(4):
        _mav_leg(alu, foil, white, 45 + 90 * k)

    obj('descent_foil', foil, 'gold_foil', root, smooth=0.5)
    obj('descent_alu', alu, 'aluminium', root, smooth=50)
    obj('descent_white', white, 'painted_white', root, bevel=0.012, smooth=45)
    obj('descent_dark', dark, 'painted_dark', root, smooth=40)


def _mav_tower(root):
    """Access tower on the -Y side: a square truss with a ladder on its outer face, a porch at
    hatch height and two umbilical arms. It stays on the descent stage at lift-off."""
    x0, yi, yo = 0.30, -2.86, -3.38
    z0, z1 = 0.30, MAV_ASC + 7.32
    y_clear = -MAV_CLEAR          # the porch and the arms stop here, clear of the first stage as it rises
    alu, dark, yellow = bm_new(), bm_new(), bm_new()
    for sx in (-1, 1):
        for y in (yi, yo):
            tube(alu, [(sx * x0, y, z0 if y == yo else 1.45), (sx * x0, y, z1 + (1.05 if y == yo else 0.0))], 0.034, 8)
    n_bays = 9
    hb = (z1 - 1.45) / n_bays
    for j in range(n_bays + 1):
        z = 1.45 + hb * j
        for sx in (-1, 1):
            tube(alu, [(sx * x0, yi, z), (sx * x0, yo, z)], 0.022, 5, caps=False)
            if j < n_bays:
                a, b = (yi, yo) if j % 2 == 0 else (yo, yi)
                tube(alu, [(sx * x0, a, z), (sx * x0, b, z + hb)], 0.018, 5, caps=False)
        tube(alu, [(-x0, yi, z), (x0, yi, z)], 0.022, 5, caps=False)
        if j < n_bays:
            a, b = (-x0, x0) if j % 2 == 0 else (x0, -x0)
            tube(alu, [(a, yi, z), (b, yi, z + hb)], 0.018, 5, caps=False)
    z = z0 + 0.30
    while z < z1 - 0.1:                                               # rungs on the outer face
        tube(alu, [(-x0, yo, z), (x0, yo, z)], 0.017, 5, caps=False)
        z += 0.31
    for sx in (-1, 1):                                                # feet on the ground, braces to the stage
        lathe(alu, [(0.0, 0.0), (0.16, 0.0), (0.18, 0.03), (0.06, 0.07), (0.04, 0.32), (0.0, 0.32)], 10, T(sx * x0, yo, 0))
        tube(alu, [(sx * x0, yi, 1.45), (sx * x0, -MAV_FLAT + 0.05, 2.02)], 0.03, 6)
        tube(alu, [(sx * x0, yo, 1.45), (sx * x0, yi, 1.45)], 0.03, 6)
        for zz in (3.09, 4.25):
            tube(alu, [(sx * x0, yi, zz), (sx * x0, -MAV_FLAT + 0.02 if zz < 4 else -2.70, zz)], 0.028, 6)
    # porch: grating between the tower and the hull, kick plates, handrails
    zp = z1
    box(dark, (1.30, y_clear - yi, 0.05), (0, (yi + y_clear) / 2, zp - 0.025))
    box(dark, (2 * x0 + 0.07, yi - yo + 0.07, 0.04), (0, (yi + yo) / 2, zp - 0.02))
    for i in range(7):
        box(alu, (1.30, 0.025, 0.012), (0, yi + 0.05 + 0.095 * i, zp + 0.004))
    for sx in (-1, 1):
        pts = [(sx * x0, yo, zp + 1.05), (sx * x0, yi + 0.02, zp + 1.05), (sx * 0.64, yi + 0.02, zp + 1.05), (sx * 0.64, y_clear - 0.03, zp + 1.05),
               (sx * 0.64, y_clear - 0.03, zp)]
        tube(alu, pts, 0.024, 6, round_r=0.07)
        tube(alu, [(sx * 0.64, yi + 0.02, zp + 0.55), (sx * 0.64, y_clear - 0.03, zp + 0.55)], 0.016, 6)
        tube(alu, [(sx * 0.64, yi + 0.02, zp), (sx * 0.64, yi + 0.02, zp + 1.05)], 0.02, 6)
        tube(alu, [(sx * x0, yi, zp), (sx * x0, yi, zp + 1.05)], 0.02, 6)
        tube(alu, [(sx * 0.64, yi + 0.02, zp - 0.03), (sx * x0, yi, zp - 0.70)], 0.022, 6)       # knee braces under the porch
    # umbilical arms: a boom from the tower to a plate on the hull, hoses slung beneath
    for zz, hose_r in ((MAV_ASC + 1.90, 0.045), (MAV_ASC + 6.25, 0.035)):
        beam(yellow, (0.18, yi, zz), (0.18, y_clear - 0.10, zz), 0.07, 0.10, c=0.015)
        box(yellow, (0.20, 0.10, 0.30), (0.18, y_clear - 0.05, zz - 0.02))
        for dx in (-0.05, 0.07):
            pts = [(0.18 + dx, yi - 0.02, zz - 0.45), (0.18 + dx, yi + 0.18, zz - 0.52), (0.18 + dx, y_clear - 0.30, zz - 0.30),
                   (0.18 + dx, y_clear - 0.14, zz - 0.06), (0.18 + dx, y_clear, zz - 0.06)]
            tube(dark, pts, hose_r, 6, round_r=0.12)
        tube(dark, [(0.20, yi, 4.4), (0.20, yi, zz - 0.45)], hose_r * 1.2, 6)
    for sx in (-1, 1):
        for zz, r in ((MAV_DECK + 1.05, 0.024), (MAV_DECK + 0.55, 0.017)):
            tube(alu, [(sx * 1.102, -2.661, zz), (sx * (x0 + 0.02), yi + 0.06, zz)], r, 6)
    obj('tower', alu, 'aluminium', root, smooth=60)
    obj('tower_dark', dark, 'painted_dark', root, smooth=60)
    obj('tower_yellow', yellow, 'painted_yellow', root, bevel=0.008)
    return (0.0, yo - 0.75, 0.0)


def cone_frame(r, deg, z, nr, nz):
    """Frame on a cone: local Z = outward normal (nr radial, nz up), local Y up the slope."""
    c, s_ = cos(rad(deg)), sin(rad(deg))
    n = Vector((c * nr, s_ * nr, nz)).normalized()
    return frame((r * c, r * s_, z), n, Vector((0, 0, 1)).cross(Vector((c, s_, 0))))


def _mav_ascent(root):
    asc = part('ascent', root, loc=(0, 0, MAV_ASC))
    R1, R2, SEG = MAV_R, MAV_R2, 48
    white, alu, dark, orange, grey, foil, glass = (bm_new() for _ in range(7))

    # ---- base ring, open thrust-structure truss, aft tank dome ----
    lathe(alu, [(2.02, 0.0), (2.16, 0.0), (2.16, 0.10), (2.10, 0.13), (2.02, 0.13)], SEG, close=True)
    for k in range(12):
        lo = polar(2.08, 30 * k, 0.12)
        for d in (-15, 15):
            tube(alu, [lo, polar(2.08, 30 * k + d, 0.84)], 0.045, 6, caps=False)
    lathe(alu, [(2.04, 0.80), (2.135, 0.80), (2.135, 0.95), (2.10, 0.97)], SEG)
    lathe(foil, [(0.0, 0.30)] + [(2.04 * sin(rad(a)), 0.86 - 0.56 * cos(rad(a))) for a in (15, 30, 45, 60, 75, 90)], 32)
    lathe(alu, [(0.20, 0.17), (0.34, 0.17), (0.98, 0.335), (0.98, 0.40)], 16)                  # thrust cone
    for k in range(4):
        x, y, _ = polar(1.38, 45 + 90 * k)
        moved(alu, add_sphere(alu, 0.23, (0, 0, 0), 12, 8), T(x, y, 0.30))                     # pressurant spheres
        tube(alu, [(x * 0.80, y * 0.80, 0.52), (x, y, 0.47)], 0.03, 6)
    for a in (20, 200):
        c, s_ = cos(rad(a)), sin(rad(a))
        tube(alu, [(1.30 * c, 1.30 * s_, 0.52), (1.02 * c, 1.02 * s_, 0.16), (0.50 * c, 0.50 * s_, 0.04), (0.33 * c, 0.33 * s_, 0.10)],
             0.055, 8, round_r=0.12)

    # ---- first stage ----
    lathe(white, wall(R1, 1.42, 2.62) + wall(R1, 3.00, 4.90), SEG)
    lathe(dark, [(R1, 0.97), (R1 + 0.012, 0.99)] + wall(R1 + 0.012, 1.02, 1.39, pad=0.05) + [(R1 + 0.012, 1.42), (R1, 1.44)], SEG)
    lathe(alu, [(R1 + 0.010, 1.42), (R1 + 0.026, 1.43), (R1 + 0.026, 1.47), (R1, 1.48)], SEG)
    lathe(grey, [(R1, 2.60), (R1 + 0.014, 2.63), (R1 + 0.014, 2.81), (R1 + 0.014, 2.99), (R1, 3.02)], SEG)   # intertank
    for k in range(32):
        box(grey, (0.035, 0.30, 0.016), (0, 0, 0.008), radial_frame(R1 + 0.014, 360 * k / 32, 2.81))
    for a0 in (30, 210):                                                                      # roll-pattern blocks
        lathe(dark, [(R1, 3.28), (R1 + 0.01, 3.30), (R1 + 0.01, 3.90), (R1 + 0.01, 4.52), (R1, 4.54)], 6, arc=rad(44), phase=rad(a0))
    # propellant feed line and pressurisation line down the -X side
    for dy, r, z_top in ((0.0, 0.085, 3.55), (0.24, 0.04, 4.30)):
        pts = [(-R1 + 0.05, dy, z_top), (-R1 - r - 0.07, dy, z_top), (-R1 - r - 0.07, dy, 1.20), (-R1 + 0.05, dy, 1.20)]
        tube(alu, pts, r, 10, round_r=0.16)
        for z in (1.75, 2.35, 3.20) + ((3.95,) if z_top > 4 else ()):
            box(alu, (0.06, 2 * r + 0.07, 0.05), (-R1 - r * 0.5 - 0.04, dy, z))
    # ---- interstage: an orange cone between the two diameters ----
    nr, nz = 0.915, 0.404
    lathe(orange, [(R1, 4.88), (R1 + 0.018, 4.91)] + [(R1 + 0.018 - (R1 - R2) * f, 4.91 + 0.68 * f) for f in (0.12, 0.5, 0.88, 1.0)]
          + [(R2, 5.62)], SEG)
    for k in range(24):
        box(orange, (0.04, 0.60, 0.016), (0, 0, 0.008), cone_frame((R1 + R2) / 2 + 0.018, 360 * k / 24 + 7.5, 5.25, nr, nz))
    for z, r in ((4.90, R1), (5.60, R2)):
        lathe(alu, [(r + 0.016, z - 0.035), (r + 0.036, z - 0.025), (r + 0.036, z + 0.025), (r + 0.016, z + 0.035)], SEG)
        bolt_ring(alu, r + 0.036, z, 30, 0.018, 0.012, phase=5, seg=4)
    for k in range(4):                                                                        # ullage motors
        Mb = cone_frame((R1 + R2) / 2 + 0.018, 45 + 90 * k, 5.25, nr, nz)
        M = Mb @ T(0, 0, 0.10) @ R('X', -90)
        lathe(white, [(0.0, -0.20), (0.07, -0.20), (0.085, -0.16), (0.085, 0.0), (0.085, 0.18), (0.05, 0.30), (0.0, 0.34)], 10, M)
        lathe(dark, [(0.0, -0.21), (0.045, -0.21), (0.065, -0.30), (0.075, -0.30), (0.06, -0.20)], 10, M)
        box(alu, (0.12, 0.30, 0.10), (0, 0, 0.03), Mb)
    # ---- second stage and crew module ----
    lathe(white, wall(R2, 5.94, 7.27) + wall(R2, 7.34, 8.31), SEG)
    lathe(alu, [(R2, 7.27), (R2 + 0.014, 7.28), (R2 + 0.014, 7.33), (R2, 7.34)], SEG)
    lathe(alu, [(R2, 8.30), (R2 + 0.02, 8.31), (R2 + 0.02, 8.40), (R2 - 0.04, 8.40)], SEG)
    lathe(dark, [(R2, 5.64), (R2 + 0.01, 5.68), (R2 + 0.01, 5.80), (R2 + 0.01, 5.92), (R2, 5.95)], SEG)
    # raceway up the +X side with clamps; service doors
    sweep(white, [(R1 + 0.045, 0, 1.50), (R1 + 0.045, 0, 3.2), (R1 + 0.045, 0, 4.84), (R2 + 0.045, 0, 5.66), (R2 + 0.045, 0, 6.5),
                  (R2 + 0.045, 0, 7.22)], chamf(0.22, 0.11, 0.025), up=(1, 0, 0))
    for z, r in ((1.8, R1), (2.3, R1), (3.4, R1), (4.3, R1), (6.2, R2), (7.0, R2)):
        box(alu, (0.30, 0.05, 0.02), (0, 0, 0.0), radial_frame(r + 0.10, 0, z))
    for a, z, w, h, r in ((120, 1.95, 0.55, 0.42, R1), (320, 3.85, 0.42, 0.55, R1), (150, 3.95, 0.40, 0.40, R1), (100, 6.55, 0.5, 0.4, R2),
                          (200, 6.35, 0.4, 0.5, R2)):
        M = radial_frame(r - 0.008, a, z)
        plate(white, w, h, 0.02, 0.06, M)
        bolt_rect(alu, w - 0.07, h - 0.07, 3, 3, 0.012, 0.008, M @ T(0, 0, 0.02))
    # umbilical plates facing the tower arms
    for z, r in ((1.88, R1), (6.23, R2)):
        M = radial_frame(r - 0.005, 270 + math.degrees(math.asin(0.18 / R1)), z)
        if r < R1:                                                                            # stand-off housing out to the arm
            taper_box(white, (0.52, 0.58), (0.40, 0.46), 0.0, R1 - R2, M=M)
            M = M @ T(0, 0, R1 - R2)
        plate(alu, 0.34, 0.40, 0.03, 0.04, M)
        for (x, y) in ((-0.07, 0.08), (0.07, 0.08), (-0.07, -0.08), (0.07, -0.08)):
            lathe(dark, [(0.045, 0.03), (0.045, 0.05), (0.03, 0.05), (0.03, 0.035)], 8, M @ T(x, y, 0))
    # RCS quads on the diagonals
    eng = bm_new()
    for k in range(4):
        M = radial_frame(R2 - 0.01, 45 + 90 * k, 6.85)
        taper_box(white, (0.36, 0.50), (0.22, 0.30), 0.0, 0.16, M=M)
        for Mn in (T(0, 0.20, 0.10) @ R('X', -90), T(0, -0.20, 0.10) @ R('X', 90), T(0.15, 0, 0.10) @ R('Y', 90), T(-0.15, 0, 0.10) @ R('Y', -90)):
            lathe(eng, [(0.03, 0.0), (0.062, 0.13), (0.052, 0.13), (0.022, 0.02), (0.0, 0.02)], 8, M @ Mn)
    # crew hatch on the tower side: orange surround, curved door, port, handles
    ha = math.degrees(0.41 / R2)                                                              # half the hatch arc
    lathe(orange, [(R2, 7.36), (R2 + 0.012, 7.37), (R2 + 0.012, 7.80), (R2 + 0.012, 8.25), (R2, 8.26)], 5,
          arc=rad(2 * ha + 5), phase=rad(270 - ha - 2.5))
    lathe(white, [(R2 + 0.01, 7.40), (R2 + 0.032, 7.42), (R2 + 0.032, 7.80), (R2 + 0.032, 8.20), (R2 + 0.01, 8.22)], 5,
          arc=rad(2 * ha), phase=rad(270 - ha))
    Mh = radial_frame(R2 + 0.032, 270, 7.95)
    lathe(alu, [(0.17, 0.0), (0.17, 0.018), (0.13, 0.018), (0.13, 0.006)], 16, Mh)
    lathe(glass, [(0.13, 0.008), (0.0, 0.008)], 16, Mh)
    box(orange, (0.04, 0.22, 0.025), (0.24, -0.32, 0.03), Mh)
    lathe(alu, [(0.05, 0.0), (0.05, 0.03), (0.0, 0.035)], 10, Mh @ T(0.24, -0.23, 0))
    for sy in (-0.28, 0.20):
        moved(alu, add_cyl(alu, 0.022, 0.14, (0, 0, 0), seg=8, axis='Y'), Mh @ T(-0.39, sy, 0.0))
    for a in (270 - ha - 6, 270 + ha + 6):
        p0, p1 = Vector(polar(R2, a, 7.45)), Vector(polar(R2, a, 8.15))
        handle(alu, p0, p1, 0.07, 0.016, 8, normal=(cos(rad(a)), sin(rad(a)), 0))
    # doorstep under the hatch: bridges the gap to the tower's porch and leaves with the capsule
    step_d = MAV_CLEAR - 0.04 - R2
    box(dark, (0.92, step_d, 0.045), (0, -R2 - step_d / 2, 7.2975))
    for i in range(3):
        box(alu, (0.92, 0.025, 0.012), (0, -R2 - 0.07 - 0.11 * i, 7.324))
    for sx in (-1, 1):
        prism(alu, [(-R2, 6.98), (-R2, 7.275), (-R2 - step_d, 7.275)], 0.03, T(sx * 0.40, 0, 0) @ YZX)
    for a in (232, 308):                                                                      # cabin windows
        M = radial_frame(R2 - 0.004, a, 7.95)
        plate(alu, 0.40, 0.32, 0.016, 0.09, M, n=3)
        plate(glass, 0.32, 0.24, 0.006, 0.07, M @ T(0, 0, 0.016), n=3)
    # strobe lamp sockets
    for k in range(4):
        lathe(alu, [(0.07, 0.0), (0.07, 0.025), (0.05, 0.035)], 8, radial_frame(R2 + 0.018, 45 + 90 * k, 8.18))
    # ---- capsule nose under the fairing: cone, tunnel, docking ring ----
    lathe(white, [(R2 - 0.04, 8.40), (1.62, 8.41), (1.15, 9.055), (0.68, 9.70), (0.55, 9.74)], 32)
    lathe(alu, [(0.55, 9.74), (0.55, 10.04), (0.48, 10.08), (0.40, 10.08), (0.40, 9.99), (0.0, 9.99)], 24)
    lathe(alu, [(0.60, 9.72), (0.60, 9.78), (0.55, 9.78)], 24)
    for k in range(4):
        a = 45 + 90 * k
        M = cone_frame(1.15 - 0.004, a, 9.055, 0.808, 0.589)
        plate(alu, 0.34, 0.30, 0.014, 0.08, M, n=3)
        plate(glass, 0.26, 0.22, 0.006, 0.06, M @ T(0, 0, 0.014), n=3)
        lathe(alu, [(0.15, 0.0), (0.15, 0.02), (0.0, 0.03)], 12, cone_frame(0.90 - 0.004, a + 45, 9.398, 0.808, 0.589))   # parachute bay covers

    obj('asc_white', white, 'painted_white', asc, smooth=40)
    obj('asc_alu', alu, 'aluminium', asc, smooth=50)
    obj('asc_dark', dark, 'painted_dark', asc, smooth=40)
    obj('asc_orange', orange, 'painted_orange', asc, smooth=40)
    obj('asc_grey', grey, 'painted_grey', asc, smooth=40)
    obj('asc_foil', foil, 'gold_foil', asc, smooth=40)
    obj('asc_glass', glass, 'glass_dark', asc, smooth=40)
    obj('asc_rcs', eng, 'titanium', asc, smooth=50)

    # ---- strobe (blinks) ----
    strobe = part('strobe', asc, loc=(0, 0, 8.18))
    bm = bm_new()
    for k in range(4):
        lathe(bm, [(0.05, 0.035), (0.05, 0.07), (0.03, 0.10), (0.0, 0.11)], 8, radial_frame(R2 + 0.018, 45 + 90 * k, 0.0))
    obj('strobe_lamps', bm, 'light_red', strobe, smooth=60)

    # ---- main engine (gimbals about its origin) ----
    noz = part('nozzle', asc, loc=(0, 0, 0.20))
    bm = bm_new()
    bell(bm, None, 0.74, 1.30, 0.17, 28)
    for f, g in ((0.45, 0.16), (0.72, 0.40), (0.90, 0.68)):                                    # stiffening bands
        r = 0.17 + (0.74 - 0.17) * f
        z = -0.364 - (1.30 - 0.364) * g
        lathe(bm, [(r - 0.005, z - 0.03), (r + 0.022, z - 0.012), (r + 0.016, z + 0.02), (r - 0.012, z + 0.03)], 28)
    obj('nozzle_bell', bm, 'titanium', noz, smooth=50)
    bm = bm_new()
    for a in (0, 90):                                                                         # gimbal actuators, turbopump
        c, s_ = cos(rad(a)), sin(rad(a))
        tube(bm, [(0.42 * c, 0.42 * s_, -0.60), (0.66 * c, 0.66 * s_, 0.06)], 0.035, 8)
        tube(bm, [(0.50 * c, 0.50 * s_, -0.38), (0.62 * c, 0.62 * s_, -0.05)], 0.05, 8)
    lathe(bm, [(0.0, -0.20), (0.11, -0.20), (0.13, -0.17), (0.13, 0.10), (0.09, 0.14), (0.0, 0.14)], 12, T(-0.33, -0.33, -0.12))
    tube(bm, [(-0.33, -0.33, -0.30), (-0.30, -0.30, -0.42), (-0.16, -0.16, -0.40)], 0.04, 6, round_r=0.05)
    obj('nozzle_fittings', bm, 'aluminium', noz, smooth=50)
    anchor('flame', asc, (0, 0, 0.20 - 1.32))

    # ---- nose fairing (removable) ----
    nose = part('nose', asc, loc=(0, 0, 8.40))
    L = 2.70
    rho = (R2 * R2 + L * L) / (2 * R2)
    th_max = math.asin(L / rho)
    og = [(rho * cos(th_max * i / 11) - (rho - R2), rho * sin(th_max * i / 11)) for i in range(12)]
    og[-1] = (0.0, L)
    bm = bm_new()
    lathe(bm, [og[0], (og[0][0], 0.10)] + og[1:9], SEG)
    for a in (0, 180):                                                                        # clamshell seam
        sweep(bm, [(polar(r + 0.004, a, z)) for r, z in og[:9]], [(0.012, -0.03), (0.012, 0.03), (-0.01, 0.03), (-0.01, -0.03)],
              up=(-sin(rad(a)), cos(rad(a)), 0))
    for a in (60, 120, 240, 300):
        plate(bm, 0.30, 0.20, 0.014, 0.05, radial_frame(og[1][0] - 0.016, a, 0.42), n=2)
    r4, z4 = og[4]                                                                            # field joint half-way up
    lathe(bm, [(r4 + 0.012, z4 - 0.06), (r4 + 0.014, z4 - 0.03), (r4 - 0.004, z4 + 0.03), (r4 - 0.03, z4 + 0.05)], SEG)
    obj('nose_shell', bm, 'painted_white', nose, smooth=40)
    bm = bm_new()
    lathe(bm, og[8:], SEG)
    obj('nose_tip', bm, 'painted_dark', nose, smooth=40)
    bm = bm_new()
    lathe(bm, [(R2 + 0.004, 0.0), (R2 + 0.022, 0.01), (R2 + 0.018, 0.09), (og[1][0] + 0.004, 0.12)], SEG)
    obj('nose_ring', bm, 'aluminium', nose, smooth=40)
    return asc


def build_mav():
    root = part('mav')
    _mav_descent(root)
    hatch = _mav_tower(root)
    _mav_ascent(root)
    anchor('hatch', root, hatch)
    anchor('col_body', root, (0, 0, 0), radius=3.4)
    return finish(root, 'mav', ao_distance=1.4)


# ==============================================================================================
# 4. Hermes
# ==============================================================================================
HERMES_Z = 12.0         # height of the spine axis above z=0 (rim and radiators just clear the "ground")
RING_Y = -11.0          # station of the crew ring along the spine
RING_R = 9.4            # radius of the rim's centre-line


def _hermes_wing(alu, cell, side, yc, tilt):
    """One solar wing: mast, rotary joint, boom and two blankets of seven panels each."""
    tube(alu, [(side * 1.2, yc, 0), (side * 3.3, yc, 0)], 0.22, 8)
    lathe(alu, [(0.0, 0.0), (0.42, 0.0), (0.50, 0.08), (0.50, 0.62), (0.42, 0.70), (0.0, 0.70)], 12, T(side * 3.3, yc, 0) @ R('Y', 90 * side))
    M = T(side * 4.0, yc, 0) @ R('X', tilt * side) @ R('Z', 0 if side > 0 else 180)      # local X runs outboard along the boom
    tube(alu, [(0, 0, 0), (7.4, 0, 0), (14.9, 0, 0)], 0.10, 6, M=M)
    n, plen, gap = 7, 1.98, 0.09
    for i in range(n):
        x0 = 0.55 + i * (plen + gap)
        for sy in (-1, 1):
            box(cell, (plen, 2.45, 0.04), (x0 + plen / 2, sy * 1.50, 0), M)
        box(alu, (0.05, 5.6, 0.07), (x0 - gap / 2, 0, 0), M)
    box(alu, (0.05, 5.6, 0.07), (0.55 + n * (plen + gap) - gap / 2, 0, 0), M)
    for sy in (-1, 1):                                                 # edge tapes
        box(alu, (n * (plen + gap), 0.04, 0.05), (0.55 + n * (plen + gap) / 2 - gap / 2, sy * 2.75, 0), M)
        tube(alu, [(0.0, 0, 0), (0.55, sy * 2.72, 0)], 0.035, 4, M=M)


def build_hermes():
    root = part('hermes')
    H = (0, 0, HERMES_Z)
    AY = AX['Y']                                                       # lathe heights run along +Y (aft)
    white, grey, alu, dark, foil, cell, glass, glow = (bm_new() for _ in range(8))

    # ---------------- forward section: docking port, node, command module ----------------
    hull = [(0.0, -29.72), (0.55, -29.72), (0.55, -30.0), (0.82, -30.0), (0.82, -29.4), (1.05, -29.2), (1.05, -28.3), (1.85, -27.75),
            (2.0, -27.5)] + wall(2.0, -27.4, -23.7, pad=0.2, step=2) + [(2.0, -23.6), (1.85, -23.35), (1.45, -23.1), (1.45, -22.75),
            (2.15, -22.35), (2.3, -22.1)] + wall(2.3, -22.0, -17.6, pad=0.2, step=2.5) + [(2.3, -17.5), (2.15, -17.25)]
    lathe(white, hull, 24, AY)
    lathe(foil, [(2.15, -17.25), (1.75, -16.7), (1.40, -16.2), (1.40, -15.35)], 24, AY)
    for y in (-27.45, -23.65, -22.05, -19.8, -17.55):
        r = 2.0 if y < -23 else 2.3
        lathe(grey, [(r - 0.01, y - 0.10), (r + 0.05, y - 0.07), (r + 0.05, y + 0.07), (r - 0.01, y + 0.10)], 24, AY)
    lathe(grey, [(0.82, -29.9), (0.92, -29.86), (0.92, -29.66), (0.82, -29.6)], 16, AY)
    lathe(dark, [(0.0, -29.71), (0.50, -29.71)], 16, AY)
    # radial ports on the node (left, right, nadir) and a cupola on top
    for deg in (0, 180, 270):
        M = T(0, -25.5, 0) @ R('Y', -deg) @ AX['X']
        lathe(white, [(0.85, 1.7), (0.85, 2.55), (0.70, 2.75)], 14, M)
        lathe(grey, [(0.86, 2.30), (0.95, 2.33), (0.95, 2.47), (0.86, 2.50)], 14, M)
        lathe(dark, [(0.70, 2.75), (0.0, 2.75)], 14, M)
    Mc = T(0, -25.5, 0) @ R('Y', -90) @ AX['X']
    lathe(grey, [(0.80, 1.7), (0.80, 2.12), (0.74, 2.16)], 12, Mc)
    lathe(glass, [(0.74, 2.16), (0.55, 2.50), (0.0, 2.62)], 12, Mc)
    # windows round the command module, equipment pallets
    for k in range(10):
        if k in (2, 3):
            continue
        M = T(0, -20.9, 0) @ R('Y', 36 * k + 18) @ T(2.305, 0, 0) @ R('Y', 90)
        plate(glass, 0.55, 0.42, 0.03, 0.12, M @ R('Z', 90), n=2)
    for k in range(4):
        M = T(0, -18.7, 0) @ R('Y', 90 * k + 45)
        box(white, (0.5, 1.5, 1.1), (2.42, 0, 0), M)
        box(grey, (0.12, 1.3, 0.9), (2.70, 0, 0), M)
    for k in range(4):                                                 # thruster pods on the node
        M = T(0, -27.0, 0) @ R('Y', 90 * k + 45)
        box(grey, (0.45, 0.6, 0.45), (2.1, 0, 0), M)
        for dy in (-0.42, 0.42):
            moved(dark, add_cyl(dark, 0.07, 0.18, (0, 0, 0), seg=8, axis='Y', r2=0.14 if dy > 0 else None), M @ T(2.2, dy, 0))
    # high-gain dish on a boom above the command module, low-gain mast below
    tube(alu, [(0, -19.6, 2.2), (0, -19.6, 5.2)], 0.12, 6)
    Md = T(0, -19.6, 5.4) @ frame((0, 0, 0), (0.0, -0.75, 0.66), (1, 0, 0))
    k_ = 0.16
    rs = [1.9, 1.5, 1.0, 0.5]
    lathe(white, [(r, k_ * r * r) for r in rs] + [(0.0, 0.0), (0.0, -0.06)] + [(r, k_ * r * r - 0.06) for r in reversed(rs)], 20, Md, close=True)
    for a in (30, 150, 270):
        tube(alu, [(1.7 * cos(rad(a)), 1.7 * sin(rad(a)), k_ * 2.89), (0.1 * cos(rad(a)), 0.1 * sin(rad(a)), 1.55)], 0.04, 4, M=Md)
    lathe(alu, [(0.0, 1.45), (0.22, 1.45), (0.14, 1.70), (0.0, 1.70)], 8, Md)
    lathe(alu, [(0.0, -0.45), (0.30, -0.45), (0.30, -0.05)], 8, Md)
    tube(alu, [(0, -21.5, -2.2), (0, -21.5, -4.6)], 0.07, 5)
    tube(alu, [(-0.9, -21.5, -4.0), (0.9, -21.5, -4.0)], 0.05, 4)

    # ---------------- bearing collars either side of the ring hub ----------------
    for y0 in (-15.45, -7.0):
        lathe(grey, [(1.45, y0), (2.25, y0), (2.35, y0 + 0.1), (2.35, y0 + 0.35), (2.25, y0 + 0.45), (1.45, y0 + 0.45)], 24, AY)

    # ---------------- truss spine with a wrapped propellant main down the middle ----------------
    y0, y1, hw = -6.6, 21.4, 1.25
    bays = 10
    step = (y1 - y0) / bays
    corners = [(hw, hw), (-hw, hw), (-hw, -hw), (hw, -hw)]
    for (x, z) in corners:
        tube(alu, [(x, y0 + step * j, z) for j in range(bays + 1)], 0.09, 5)
    for j in range(bays + 1):
        y = y0 + step * j
        for i in range(4):
            (xa, za), (xb, zb) = corners[i], corners[(i + 1) % 4]
            tube(alu, [(xa, y, za), (xb, y, zb)], 0.06, 4, caps=False)
            if j < bays:
                if (i + j) % 2:
                    tube(alu, [(xa, y, za), (xb, y + step, zb)], 0.045, 4, caps=False)
                else:
                    tube(alu, [(xb, y, zb), (xa, y + step, za)], 0.045, 4, caps=False)
    lathe(foil, wall(0.55, y0, y1, pad=0.5, step=2.8), 10, AY)
    for j in range(bays + 1):                                          # saddles holding the main in the truss
        box(grey, (2 * hw, 0.25, 0.25), (0, y0 + step * j, 0))
        box(grey, (0.25, 0.25, 2 * hw), (0, y0 + step * j, 0))

    # ---------------- solar arrays: two pairs of wings ----------------
    for yc in (-1.6, 5.0):
        for side in (-1, 1):
            _hermes_wing(alu, cell, side, yc, 18)

    # ---------------- propellant tanks round the spine ----------------
    for k in range(4):
        x, z = 2.15 * cos(rad(45 + 90 * k)), 2.15 * sin(rad(45 + 90 * k))
        prof = [(0.0, -2.6)] + [(1.25 * sin(rad(a)), -1.45 - 1.15 * cos(rad(a))) for a in (25, 50, 72, 90)]
        prof += [(1.25, -0.5), (1.25, 0.5)]
        prof += [(1.25 * sin(rad(a)), 1.45 + 1.15 * cos(rad(a))) for a in (90, 72, 50, 25)] + [(0.0, 2.6)]
        lathe(foil, prof, 16, T(x, 12.0, z) @ AY)
        for dy in (-1.2, 1.2):
            lathe(alu, [(1.27, dy - 0.09), (1.29, dy - 0.09), (1.29, dy + 0.09), (1.27, dy + 0.09)], 16, T(x, 12.0, z) @ AY)
            tube(alu, [(x * 0.58, 12.0 + dy, z * 0.58), (x * 0.70, 12.0 + dy, z * 0.70)], 0.12, 5, caps=False)

    # ---------------- radiators: two wings of three panels, above and below ----------------
    for sz in (-1, 1):
        for i in range(3):
            z0 = 1.9 + i * 2.85
            for y in (16.45, 19.55):
                box(white, (0.09, 3.0, 2.7), (0, y, sz * (z0 + 1.35)))
            box(grey, (0.16, 6.3, 0.10), (0, 18.0, sz * (z0 - 0.07)))
        box(grey, (0.16, 6.3, 0.10), (0, 18.0, sz * (1.9 + 3 * 2.85 - 0.07)))
        for y in (14.9, 18.0, 21.1):
            tube(alu, [(0, y, sz * 1.25), (0, y, sz * 10.5)], 0.085, 5)

    # ---------------- reactor behind its shadow shield, thrust structure, ion engines ----------------
    lathe(dark, [(0.6, 21.4), (2.45, 21.4), (2.7, 21.6), (2.7, 21.95), (1.3, 22.45)], 20, AY)
    lathe(grey, [(1.3, 22.45), (1.3, 22.6), (1.15, 22.7), (1.15, 24.7), (1.4, 24.85)], 16, AY)
    for k in range(10):
        M = T(0, 23.7, 0) @ R('Y', 36 * k)
        box(alu, (0.75, 1.7, 0.05), (1.5, 0, 0), M)
    lathe(grey, [(0.0, 24.85), (3.3, 24.85), (3.3, 25.25), (0.0, 25.25)], 8, AY, phase=rad(22.5))
    for k in range(8):
        a = rad(45 * k + 22.5)
        tube(alu, [(1.2 * cos(a), 22.5, 1.2 * sin(a)), (3.1 * cos(a), 24.9, 3.1 * sin(a))], 0.08, 4, caps=False)
    spots = [(0.0, 0.0)] + [(2.0 * cos(rad(45 + 90 * k)), 2.0 * sin(rad(45 + 90 * k))) for k in range(4)]
    for (x, z) in spots:
        M = T(x, 0, z) @ AY
        lathe(grey, [(0.50, 25.25), (0.80, 25.6), (0.80, 27.3), (0.92, 27.5)], 16, M)
        lathe(dark, [(0.92, 27.5), (1.0, 27.6), (1.0, 29.55), (1.1, 29.7), (1.1, 30.0), (0.95, 30.0), (0.92, 29.45)], 16, M)
        lathe(glow, [(0.92, 29.45), (0.45, 29.40), (0.0, 29.40)], 16, M)
        lathe(alu, [(0.81, 26.0), (0.88, 26.03), (0.88, 26.20), (0.81, 26.23)], 16, M)

    for sx in (-1, 1):                                                 # attitude thruster booms by the engines
        tube(alu, [(sx * 1.2, 22.9, 0), (sx * 5.2, 23.3, 0)], 0.10, 5)
        box(grey, (0.7, 0.8, 0.7), (sx * 5.4, 23.3, 0))
        for d in ((0, 0, 1), (0, 0, -1), (sx, 0, 0)):
            lathe(dark, [(0.10, 0.30), (0.22, 0.62), (0.18, 0.62), (0.07, 0.32)], 8, frame((sx * 5.4, 23.3, 0), d))
    for y, deg in ((-4.2, 35), (8.2, 215), (8.2, 35), (14.0, 125)):    # equipment pallets on the truss
        M = T(0, y, 0) @ R('Y', deg)
        box(white, (1.5, 1.7, 0.7), (0, 0, 1.62), M)
        box(grey, (1.1, 1.3, 0.25), (0, 0, 2.05), M)
    tube(alu, [(0, 9.0, 1.3), (0, 9.4, 6.5)], 0.06, 4)
    tube(alu, [(0, 9.0, -1.3), (0, 9.4, -5.2)], 0.06, 4)
    lathe(alu, [(0.0, 0.0), (0.45, 0.0), (0.45, 0.08), (0.0, 0.3)], 8, T(0, 9.4, 6.5))
    kw = dict(loc=H)
    obj('h_white', white, 'painted_white', root, smooth=40, **kw)
    obj('h_grey', grey, 'painted_grey', root, smooth=40, **kw)
    obj('h_alu', alu, 'aluminium', root, smooth=60, **kw)
    obj('h_dark', dark, 'painted_dark', root, smooth=40, **kw)
    obj('h_foil', foil, 'gold_foil', root, smooth=40, **kw)
    obj('h_cells', cell, 'solar_cell', root, **kw)
    obj('h_glass', glass, 'glass_dark', root, smooth=40, **kw)
    obj('h_glow', glow, 'light_blue', root, smooth=40, **kw)

    # ---------------- the rotating crew ring (spins about its local Y) ----------------
    ring = part('ring', root, loc=(0, RING_Y, HERMES_Z))
    white, grey, alu, glass, foil = (bm_new() for _ in range(5))
    Rr = RING_R
    lathe(white, [(1.9, -3.9), (2.05, -3.75)] + wall(2.05, -3.6, 3.6, pad=0.3, step=2.5) + [(2.05, 3.75), (1.9, 3.9)], 24, AY)
    for y in (-3.3, -1.25, 1.25, 3.3):
        lathe(grey, [(2.04, y - 0.12), (2.12, y - 0.09), (2.12, y + 0.09), (2.04, y + 0.12)], 24, AY)
    sect = [(Rr + 1.2, -1.0), (Rr + 1.2, 1.0), (Rr + 0.75, 1.5), (Rr - 0.75, 1.5), (Rr - 1.2, 1.0), (Rr - 1.2, -1.0), (Rr - 0.75, -1.5), (Rr + 0.75, -1.5)]
    lathe(white, sect, 48, AY, close=True)
    big = [(Rr + (r - Rr) * 1.05, y * 1.05) for r, y in sect]
    fat = [(Rr + (r - Rr) * 1.22, y * 1.20) for r, y in sect]
    for k in range(8):                                                 # module joints, window strips, floor radiators
        a0 = 45 * k + 22.5
        lathe(grey, big, 1, AY, close=True, arc=rad(2.6), phase=rad(a0 - 1.3), caps=True)
        for a1 in (45 * k + 4, 45 * k + 25.5):
            lathe(glass, [(Rr - 0.13, -1.512), (Rr + 0.13, -1.512)], 3, AY, arc=rad(15.5), phase=rad(a1))
            lathe(glass, [(Rr + 0.13, 1.512), (Rr - 0.13, 1.512)], 3, AY, arc=rad(15.5), phase=rad(a1))
        lathe(grey, [(Rr + 1.212, -0.7), (Rr + 1.212, 0.7)], 4, AY, arc=rad(30), phase=rad(45 * k + 30))
    for k in range(4):                                                 # larger habitat modules where the spokes land
        lathe(white, fat, 4, AY, close=True, arc=rad(24), phase=rad(90 * k - 12), caps=True)
        lathe(grey, [(Rr + (r - Rr) * 1.25, y * 1.23) for r, y in sect], 1, AY, close=True, arc=rad(2.4), phase=rad(90 * k - 1.2), caps=True)
    for k in range(4):                                                 # spokes with fairings at both ends, tie rods
        M = R('Y', -90 * k) @ AX['X']
        lathe(white, [(1.25, 1.95), (0.85, 2.7)] + wall(0.65, 2.9, Rr - 2.6, pad=0.3, step=3.0) + [(0.9, Rr - 2.2), (1.35, Rr - 1.4)], 12, M)
        for r in (4.2, 6.6):
            lathe(grey, [(0.66, r - 0.15), (0.74, r - 0.11), (0.74, r + 0.11), (0.66, r + 0.15)], 12, M)
        tube(foil, [(0.80, 0, 2.8), (0.80, 0, Rr - 2.4)], 0.13, 5, M=M)
        for sy in (-1, 1):
            a = rad(90 * k + 45)
            tube(alu, [(2.0 * cos(a), sy * 3.5, 2.0 * sin(a)), ((Rr - 1.15) * cos(a), sy * 0.9, (Rr - 1.15) * sin(a))], 0.06, 4, caps=False)
    obj('ring_white', white, 'painted_white', ring, smooth=40)
    obj('ring_grey', grey, 'painted_grey', ring, smooth=40)
    obj('ring_alu', alu, 'aluminium', ring, smooth=60)
    obj('ring_glass', glass, 'glass_dark', ring, smooth=40)
    obj('ring_foil', foil, 'gold_foil', ring, smooth=40)

    anchor('axis', root, (0, 0, HERMES_Z))                              # centre of the ship on the spine
    anchor('dock', root, (0, -30.0, HERMES_Z))                          # face of the forward docking port
    return finish(root, 'hermes', ao_distance=3.0, floor=False)


if __name__ == '__main__':
    for nm in (sys.argv[1:] or ['rover', 'mav', 'hermes']):
        reset_scene()
        globals()['build_' + nm]()
