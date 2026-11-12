"""
Family C — the Hab (see SPEC.md): hab.glb, farm_plot.glb, solar_panel.glb, uplink_dish.glb.

Run:   /home/user/blender-venv/bin/python tools/assets/hab.py [hab] [farm_plot] [solar_panel] [uplink_dish]
Look:  node tools/assets/preview.mjs hab farm_plot solar_panel uplink_dish
Set HAB_FAST=1 to skip the ambient-occlusion bake while blocking things out.

The Hab's frame: origin at the centre of the floor, the door faces -Y, the inner surface of the
pressure wall is the circle r = 8.4 m. The walking surface is FLOOR_Z (0.06 m) above the ground
plane z = 0; the anchor `floor` carries that height. The dome is 24 gores; gore 0 is the door, gore
g is centred on the angle -90 deg + 15 deg * g.

How hab.glb is put together (each function is one assembly; see its docstring):
  hab_exterior      skin, straps, base ring, windows, apex mast, the `beacon` lens, tanks and tray
  hab_airlock       the rigid box, its two walls with the slots the door leaves slide in, the ramp
  door_leaf         door_outer_L/R and door_inner_L/R, closed; extras.open_dx is the slide (+-1.05 m)
  hab_interior_shell, hab_floor   liner, ribs, truss with light_0..3, ring duct, grow lights; tiles
  st_*              the seven stations, each with its col_* anchor (and status_oxy, hydrazine_flame,
                    comms_screen as single-material parts)
  wall_modules, set_dressing, airlock_fittings   everything that makes it lived in
  hab_breach        breach_hole and breach_patch, inside and outside faces
Everything seen only from inside hangs under the part `interior`. Anchors named lamp_* are optional
extra light positions; only light_0..3 are the ones the spec asks for.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa: E402,F401,F403

FAST = bool(os.environ.get('HAB_FAST'))

# ----------------------------------------------------------------------------------------------
# Family-local helpers (candidates for lib.py: see the report)
# ----------------------------------------------------------------------------------------------
def fillet(points, r=0.06, n=3):
    """Round the corners of a polyline so a swept tube bends like a pipe instead of pinching."""
    pts = [Vector(p) for p in points]
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = pts[i - 1], pts[i], pts[i + 1]
        d1, d2 = a - b, c - b
        l1, l2 = d1.length, d2.length
        if l1 < 1e-6 or l2 < 1e-6:
            continue
        d1, d2 = d1 / l1, d2 / l2
        ang = d1.angle(d2)
        if ang > math.pi - 0.08 or ang < 0.05:
            out.append(b)
            continue
        t = min(r / math.tan(ang / 2), 0.45 * l1, 0.45 * l2)
        rr = t * math.tan(ang / 2)
        centre = b + (d1 + d2).normalized() * (rr / math.sin(ang / 2))
        v1, v2 = b + d1 * t - centre, b + d2 * t - centre
        om = v1.angle(v2)
        for k in range(n + 1):
            s = k / n
            out.append(centre + (v1 * math.sin((1 - s) * om) + v2 * math.sin(s * om)) / math.sin(om))
    out.append(pts[-1])
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


def text_mesh(text, size=0.1, res=2):
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


def tank_profile(r, h, dome=None, n=4, neck=0.0):
    """Lathe profile of a pressure vessel standing on z = 0: domed ends, total height h."""
    dome = r * 0.55 if dome is None else dome
    pr = [(0.0, 0.0)]
    for i in range(1, n + 1):
        a = (math.pi / 2) * i / n
        pr.append((r * math.sin(a), dome * (1 - math.cos(a))))
    for i in range(n, 0, -1):
        a = (math.pi / 2) * i / n
        pr.append((r * math.sin(a), h - dome * (1 - math.cos(a))))
    pr.append((neck, h) if neck else (0.0, h))
    return pr


def add_extrude(bm, outline_xz, y0, y1, caps=True):
    """Prism along Y from an outline in the XZ plane [(x, z), ...] (counter-clockwise seen from -Y)."""
    a = [bm.verts.new((x, y0, z)) for x, z in outline_xz]
    b = [bm.verts.new((x, y1, z)) for x, z in outline_xz]
    n = len(a)
    faces = []
    for i in range(n):
        faces.append(bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i])))
    if caps:
        faces.append(bm.faces.new(a))
        faces.append(bm.faces.new(list(reversed(b))))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return a + b


def add_quad(bm, p0, p1, p2, p3):
    """One quad; the normal follows the right-hand rule over p0..p3."""
    vs = [bm.verts.new(p) for p in (p0, p1, p2, p3)]
    bm.faces.new(vs)
    return vs


def add_poly(bm, pts):
    vs = [bm.verts.new(p) for p in pts]
    bm.faces.new(vs)
    return vs


def clip_convex(poly, clip):
    """Sutherland-Hodgman: clip a 2D polygon by a convex counter-clockwise polygon."""
    out = list(poly)
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


def inset_poly(poly, d):
    """Shrink a convex 2D polygon by d (move every edge inwards)."""
    n = len(poly)
    cx = sum(p[0] for p in poly) / n
    cy = sum(p[1] for p in poly) / n
    out = []
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        e1, e2 = (p1 - p0).normalized(), (p2 - p1).normalized()
        n1, n2 = Vector((-e1.y, e1.x)), Vector((-e2.y, e2.x))
        if n1.dot(Vector((cx, cy)) - p1) < 0:
            n1, n2 = -n1, -n2
        b = n1 + n2
        k = d / max(0.3, 1 + n1.dot(n2)) if b.length > 1e-6 else d
        out.append((p1.x + b.x * k, p1.y + b.y * k))
    return out


def pol(r, th, z=0.0):
    return (r * math.cos(th), r * math.sin(th), z)


class Kit:
    """Builds one assembly in its own local frame (front faces local -Y) and drops it into the
    model at `loc`, turned by `yaw`. Geometry is collected in buckets, one per material and bevel,
    so a machine made of two hundred pieces still costs a handful of objects."""
    TUBE, OPEN = 75.0, 37.0

    def __init__(self, name, parent, loc=(0, 0, 0), yaw=0.0):
        self.name, self.parent, self.loc, self.yaw = name, parent, Vector(loc), yaw
        self.rot = Matrix.Rotation(yaw, 4, 'Z')
        self.b = {}

    def bm(self, material, bevel=0.0, seg=1, smooth=38.0):
        key = (material, round(bevel, 4), seg, smooth)
        if key not in self.b:
            self.b[key] = bm_new()
        return self.b[key]

    def open(self, material, smooth=None):
        """Bucket for open surfaces and decals (never touched by a normals recalculation)."""
        return self.bm(material, 0.0, 1, self.OPEN if smooth is None else smooth)

    def W(self, p):
        return self.loc + self.rot @ Vector(p)

    # --- primitives -------------------------------------------------------------------------
    def box(self, m, size, loc, rot=None, bevel=0.01, seg=1):
        return add_box(self.bm(m, bevel, seg), size, loc, rot)

    def cyl(self, m, r, depth, loc, seg=12, axis='Z', r2=None, rot=None, bevel=0.0, caps=True):
        return add_cyl(self.bm(m, bevel), r, depth, loc, seg=seg, axis=axis, r2=r2, caps=caps, rot=rot)

    def lathe(self, m, profile, loc=(0, 0, 0), seg=16, axis='Z', rot=None, bevel=0.0, smooth=38.0, **kw):
        return add_lathe(self.bm(m, bevel, 1, smooth), profile, seg=seg, loc=loc, axis=axis, rot=rot, **kw)

    def sphere(self, m, r, loc, seg=12, rings=6, scale=(1, 1, 1), rot=None):
        return add_sphere(self.bm(m, 0.0, 1, 50.0), r, loc, seg=seg, rings=rings, scale=scale, rot=rot)

    def ico(self, m, r, loc, subdiv=1, scale=(1, 1, 1), rot=None):
        return add_ico(self.bm(m, 0.0, 1, 60.0), r, loc, subdiv=subdiv, scale=scale, rot=rot)

    def torus(self, m, R, r, loc, seg=16, ring_seg=6, axis='Z', rot=None, arc=TAU):
        return add_torus(self.bm(m, 0.0, 1, self.TUBE), R, r, loc, seg=seg, ring_seg=ring_seg, axis=axis,
                         rot=rot, arc=arc)

    def tube(self, m, pts, r=0.02, seg=6, caps=True):
        return add_tube(self.bm(m, 0.0, 1, self.TUBE), pts, r, seg=seg, caps=caps)

    def pipe(self, m, pts, r=0.03, seg=8, bend=None, n=3):
        """A rigid pipe: the polyline's corners become elbows."""
        return self.tube(m, fillet(pts, bend or r * 2.6, n), r, seg)

    def hose(self, m, pts, r=0.015, seg=6, n=4):
        """A flexible hose through the points."""
        return self.tube(m, spline(pts, n), r, seg)

    def prism(self, m, outline, depth, loc=(0, 0, 0), axis='Z', rot=None, bevel=0.0):
        return add_prism(self.bm(m, bevel), outline, depth, loc, axis=axis, rot=rot)

    def quad(self, m, p0, p1, p2, p3):
        return add_quad(self.open(m), p0, p1, p2, p3)

    def plate(self, m, w, h, loc, rot=None):
        """A flat decal-like rectangle w x h facing +Z before `rot`."""
        bm = self.open(m)
        vs = [bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
        bm.faces.new(vs)
        return xform(bm, vs, loc, rot)

    def text(self, m, text, size, loc, rot=(math.pi / 2, 0, 0), res=2):
        """Lettering; the default rotation stands it up facing local -Y (the front)."""
        bm = self.open(m)
        n0 = len(bm.verts)
        me = text_mesh(text, size, res)
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
        bm.verts.ensure_lookup_table()
        return xform(bm, bm.verts[n0:], loc, rot)

    def handle(self, m, p0, p1, out, r=0.011, seg=6):
        """A U-shaped grab handle from p0 to p1 standing `out` (a vector) off the surface."""
        p0, p1, out = Vector(p0), Vector(p1), Vector(out)
        return self.tube(m, fillet([p0, p0 + out, p1 + out, p1], r * 2.5, 2), r, seg)

    def bolts(self, m, pts, r=0.012, h=0.008, axis='Z', seg=6, rot=None):
        for p in pts:
            add_cyl(self.bm(m, 0.0, 1, 50.0), r, h, p, seg=seg, axis=axis, rot=rot)

    # --- nodes ------------------------------------------------------------------------------
    def part(self, name, loc=(0, 0, 0)):
        """A named, movable node at a local position; returns a Kit that builds in its frame."""
        p = part(name, parent=self.parent, loc=self.W(loc), rot=(0, 0, self.yaw))
        return Kit(name, p)

    def anchor(self, name, loc=(0, 0, 0), **extras):
        return anchor(name, self.parent, loc=tuple(self.W(loc)), **extras)

    def finish(self):
        made = []
        for i, ((m, bevel, seg, smooth), bm) in enumerate(self.b.items()):
            if not bm.verts:
                bm.free()
                continue
            o = mesh_obj(f'{self.name}.{m}.{i}', bm, m, parent=self.parent, loc=tuple(self.loc), rot=(0, 0, self.yaw),
                         bevel=bevel, bevel_segments=seg, smooth_angle=smooth)
            o['kit'] = self.name
            made.append(o)
        self.b = {}
        return made


def tally(root, label=''):
    """Triangles per kit after modifiers (printed, so the budget can be steered)."""
    dg = bpy.context.evaluated_depsgraph_get()
    per = {}
    for o in [root] + lib_descendants(root):
        if o.type != 'MESH':
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        n = sum(len(p.vertices) - 2 for p in me.polygons)
        ev.to_mesh_clear()
        k = o.get('kit', o.name).split('.')[0]
        per[k] = per.get(k, 0) + n
    total = sum(per.values())
    print(f'TALLY {label} total {total}')
    for k, n in sorted(per.items(), key=lambda kv: -kv[1]):
        print(f'   {k:<18}{n:>7}')
    return total


def lib_descendants(o):
    out = []
    for c in o.children:
        out.append(c)
        out.extend(lib_descendants(c))
    return out


def ensure_mats():
    """One-off materials this family adds to the shared palette."""
    mat('window_glow', color=(0.10, 0.06, 0.03), metallic=0.0, roughness=0.2, emissive=(1.0, 0.55, 0.22), strength=0.4)
    mat('hab_liner', color=(0.70, 0.69, 0.65), metallic=0.0, roughness=0.9)
    mat('hab_liner_b', color=(0.36, 0.36, 0.355), metallic=0.0, roughness=0.9)
    mat('hab_skin_b', color=(0.60, 0.565, 0.50), metallic=0.0, roughness=0.9)
    mat('tarp', color=(0.62, 0.56, 0.42), metallic=0.0, roughness=0.55)
    mat('hab_strap', color=(0.115, 0.11, 0.105), metallic=0.0, roughness=0.85)
    mat('torn_liner', color=(0.70, 0.69, 0.65), metallic=0.0, roughness=0.9)
    mat('torn_skin', color=(0.72, 0.68, 0.60), metallic=0.0, roughness=0.9)
    mat('light_grow', color=(0.9, 0.25, 0.6), metallic=0.0, roughness=0.4, emissive=(1.0, 0.16, 0.55), strength=1.6)
    mat('hab_floor', color=(0.215, 0.22, 0.225), metallic=0.1, roughness=0.7)
    mat('hab_floor_b', color=(0.15, 0.155, 0.16), metallic=0.1, roughness=0.7)
    mat('painted_green', color=(0.08, 0.34, 0.14), metallic=0.1, roughness=0.5)
    mat('void', color=(0.004, 0.004, 0.005), metallic=0.0, roughness=1.0)
    mat('tape', color=(0.42, 0.43, 0.45), metallic=0.3, roughness=0.45)


# ----------------------------------------------------------------------------------------------
# Hab: shared dimensions
# ----------------------------------------------------------------------------------------------
FLOOR_Z = 0.06                       # walking surface above the ground plane (matches the game)
R_IN = 8.4                           # inner surface of the pressure wall
N_GORE = 24
GORE = TAU / N_GORE
TH0 = -math.pi / 2 - GORE / 2        # rib 0; gore g spans TH0 + g*GORE .. TH0 + (g+1)*GORE; gore 0 is the door
A_IN, Z0_IN, C_IN = 8.40, 3.10, 3.40     # liner: wall radius, eave height, roof rise
A_OUT, Z0_OUT, C_OUT = 8.66, 3.12, 3.74  # outer skin (at the valleys)
DOOR_W, DOOR_H = 1.1, 2.4            # half width and height of the clear passage
DOOR_TOP = FLOOR_Z + DOOR_H
HEAD_Z = 2.72                        # top of the opening cut into the wall
AX, AXI = 2.25, 2.10                 # airlock: outer and inner half widths
AY0, AY1 = -8.50, -11.65             # airlock: Hab end and outer end (outside faces)
ATOP, ACH, ACEIL = 3.0, 0.55, 2.74
Y_DOOR_IN, Y_DOOR_OUT = -8.60, -11.555
Y_ROOM0, Y_ROOM1 = -8.97, AY1 + 0.19  # airlock room: Hab-end and outer-end wall faces
RING_HALF = math.asin((AX + 0.13) / 8.85)   # the base ring stops either side of the airlock
WINDOWS = (3, 7, 10, 14, 16, 20, 22)
WIN_Z = 1.9


def gore_mid(g):
    return TH0 + (g + 0.5) * GORE


def rib_ang(k):
    return TH0 + k * GORE


def roof_pt(a, z0, c, deg):
    """Point on the elliptical roof meridian and its outward normal: (r, z, nr, nz)."""
    p = rad(deg)
    nr, nz = c * math.cos(p), a * math.sin(p)
    ln = math.hypot(nr, nz)
    return (a * math.cos(p), z0 + c * math.sin(p), nr / ln, nz / ln)


def out_wall(z):
    belly = 0.06 * math.sin(math.pi * min(max((z - 0.74) / (Z0_OUT - 0.74), 0.0), 1.0))
    return (A_OUT + belly, z, 1.0, 0.0)


def out_amp(r, z):
    k = min(1.0, max(0.0, (z - 0.74) / 0.42))
    return 0.155 * (0.22 + 0.78 * k) * (r / A_OUT) ** 0.8


def in_amp(r, z):
    return 0.085 * (r / A_IN) ** 0.7


def roof_z_in(rho):
    """Height of the inner roof above the ground at radius rho."""
    return Z0_IN + C_IN * math.sqrt(max(0.0, 1 - (rho / A_IN) ** 2))


def lobed_shell(bm, rows, amps, cols, sign=1.0, offset=0.0, skip=None, mat_fn=None, flip=False):
    """A surface of revolution made of N_GORE gores that bulge between the ribs.
    rows: [(r, z, nr, nz)] along the meridian at a rib; amps: bulge at mid-gore for each row."""
    n = N_GORE * cols
    grid = []
    for (r, z, nr, nz), amp in zip(rows, amps):
        ring = []
        for j in range(n):
            t = (j % cols) / cols
            th = TH0 + TAU * j / n
            d = offset + sign * amp * (1 - (2 * t - 1) ** 2)
            rr, zz = r + d * nr, z + d * nz
            ring.append(bm.verts.new((rr * math.cos(th), rr * math.sin(th), zz)))
        grid.append(ring)
    for i in range(len(rows) - 1):
        for j in range(n):
            g = j // cols
            if skip and skip(g, i):
                continue
            quad = (grid[i][j], grid[i][(j + 1) % n], grid[i + 1][(j + 1) % n], grid[i + 1][j])
            f = bm.faces.new(tuple(reversed(quad)) if flip else quad)
            if mat_fn:
                f.material_index = mat_fn(g, i)
    return grid


# ----------------------------------------------------------------------------------------------
# Hab: exterior
# ----------------------------------------------------------------------------------------------
OUT_WALL_Z = (0.74, 1.15, 1.9, HEAD_Z, Z0_OUT)
OUT_ROOF_DEG = (9, 18, 28, 38, 48, 58, 68, 76, 81)


def _outer_rows():
    return [out_wall(z) for z in OUT_WALL_Z] + [roof_pt(A_OUT, Z0_OUT, C_OUT, d) for d in OUT_ROOF_DEG]


def hab_exterior(root):
    K = Kit('skin', root)
    rng = random.Random(11)

    # --- the inflated skin: 24 gores, bulging between the restraint straps -------------------
    rows = _outer_rows()
    amps = [out_amp(r, z) for r, z, _, _ in rows]
    tone = {(g, i): (1 if rng.random() < 0.22 else 0) for g in range(N_GORE) for i in range(len(rows))}
    bm = bm_new()
    lobed_shell(bm, rows, amps, 6, skip=lambda g, i: g == 0 and i < 3, mat_fn=lambda g, i: tone[(g, i // 2 * 2)])
    o = mesh_obj('skin', bm, ['canvas', 'hab_skin_b'], parent=root, smooth_angle=20.0)
    o['kit'] = 'skin'

    # stitched panel seams that follow the lobes
    bm = bm_new()
    for kind, v in (('w', 1.9), ('r', 23.0), ('r', 48.0)):
        if kind == 'w':
            pair = [out_wall(v - 0.035), out_wall(v + 0.035)]
        else:
            pair = [roof_pt(A_OUT, Z0_OUT, C_OUT, v - 0.45), roof_pt(A_OUT, Z0_OUT, C_OUT, v + 0.45)]
        lobed_shell(bm, pair, [out_amp(r, z) for r, z, _, _ in pair], 6, offset=0.012,
                    skip=(lambda g, i: g == 0) if kind == 'w' and v < HEAD_Z else None)
    o = mesh_obj('seams', bm, 'canvas_dark', parent=root, smooth_angle=20.0)
    o['kit'] = 'skin'

    # restraint straps bridging each valley, from the clamp ring to the apex cap
    bm = K.open('hab_strap', smooth=60.0)
    for k in range(N_GORE):
        th = rib_ang(k)
        prev = None
        for (r, z, nr, nz) in rows:
            if k in (0, 1) and z < HEAD_Z + 0.2:
                continue
            rr, zz = r + 0.045 * nr, z + 0.045 * nz
            hw = min(0.105, 0.3 * rr * GORE / 2 + 0.02) / max(rr, 0.5)
            cur = (bm.verts.new(pol(rr, th - hw, zz)), bm.verts.new(pol(rr, th + hw, zz)))
            if prev:
                bm.faces.new((prev[0], prev[1], cur[1], cur[0]))
            prev = cur
    # a stitched seam down the middle of every gore
    bm = K.open('canvas_dark', smooth=61.0)
    for g in range(N_GORE):
        th = gore_mid(g)
        prev = None
        for (r, z, nr, nz) in rows:
            if g == 0 and z < HEAD_Z + 0.2:
                continue
            d = out_amp(r, z) + 0.012
            rr, zz = r + d * nr, z + d * nz
            hw = min(0.028, 0.12 * rr * GORE / 2 + 0.004) / max(rr, 0.5)
            cur = (bm.verts.new(pol(rr, th - hw, zz)), bm.verts.new(pol(rr, th + hw, zz)))
            if prev:
                bm.faces.new((prev[0], prev[1], cur[1], cur[0]))
            prev = cur
    # strap buckles at the eave
    for k in range(N_GORE):
        if k in (0, 1):
            continue
        th = rib_ang(k)
        add_box(K.bm('steel', 0.0), (0.16, 0.05, 0.11), pol(A_OUT + 0.05, th, 2.05), rot=(0, 0, th + math.pi / 2))

    # --- rigid base ring ------------------------------------------------------------------------
    ring = dict(seg=44, rot=(0, 0, -math.pi / 2 + RING_HALF), arc=TAU - 2 * RING_HALF, cap_start=False, cap_end=False)
    K.lathe('painted_grey', [(8.76, -0.9), (8.90, -0.9), (8.90, 0.50), (8.85, 0.58), (8.72, 0.58)], **ring)
    K.lathe('aluminium', [(8.72, 0.58), (8.83, 0.58), (8.83, 0.76), (8.79, 0.80), (8.68, 0.80)], **ring)
    for k in range(N_GORE):
        th = rib_ang(k)
        near_door = k in (0, 1)
        if not near_door:
            # buttress gusset and foot pad under each rib
            gus = [(8.87, -0.3), (9.42, -0.3), (9.42, 0.06), (9.36, 0.10), (8.96, 0.50), (8.87, 0.50)]
            vs = add_prism(K.bm('painted_grey', 0.0), gus, 0.05, axis='Y')
            xform(K.bm('painted_grey', 0.0), vs, rot=(0, 0, th))
            add_box(K.bm('steel', 0.0), (0.42, 0.34, 0.035), pol(9.30, th, 0.02), rot=(0, 0, th))
    # bolt heads on the clamp bar (small boxes turned to face outwards)
    # access plates on the ring between the ribs, and hi-vis ratchet straps down to ground anchors
    for g in range(1, N_GORE):
        th = gore_mid(g)
        if g % 2 == 0:
            K.box('painted_white', (0.03, 0.95, 0.30), pol(8.895, th, 0.27), rot=(0, 0, th), bevel=0.008)
        elif g not in (1, 23):
            top, foot = Vector(pol(8.84, th, 0.74)), Vector(pol(9.82, th, 0.0))
            d = (foot - top).normalized()
            side = Vector((-math.sin(th), math.cos(th), 0))
            bm = K.open('suit_orange', smooth=60.0)
            a, b = top + d * 0.06, foot - d * 0.16
            add_quad(bm, a - side * 0.04, a + side * 0.04, b + side * 0.04, b - side * 0.04)
            mid = top.lerp(foot, 0.42)
            pitch = math.atan2(top.z - foot.z, 0.94)
            add_box(K.bm('steel', 0.0), (0.12, 0.08, 0.05), mid, rot=(0, pitch, th))
            add_box(K.bm('steel', 0.0), (0.05, 0.09, 0.07), top, rot=(0, 0, th))
            add_box(K.bm('steel', 0.0), (0.26, 0.26, 0.03), pol(9.84, th, 0.012), rot=(0, 0, th))
            K.tube('steel', [pol(9.84, th, -0.3), pol(9.84, th, 0.12)], 0.022, seg=4)

    # --- windows: rigid frames through the wall --------------------------------------------------
    for g in WINDOWS:
        th = gore_mid(g)
        R0 = 8.84                                   # the frame stands 0.11 m proud: 0.55 m from the inner wall
        rot = (0, rad(90), th)
        K.lathe('painted_grey', [(0.42, -0.30), (0.42, 0.08), (0.39, 0.11), (0.32, 0.11), (0.27, 0.055)],
                loc=pol(R0, th, WIN_Z), seg=12, rot=rot, cap_start=False, cap_end=False)
        K.lathe('window_glow', [(0.0, 0.055), (0.272, 0.055)], loc=pol(R0, th, WIN_Z), seg=12, rot=rot,
                cap_start=False, cap_end=False, smooth=30.0)

    # --- a service ladder up one gore to the apex: webbing rails, rigid rungs ----------------------
    th = gore_mid(5) + 0.0
    rails = ([], [])
    for (r, z, nr, nz) in rows:
        d = out_amp(r, z) * (1 - (0.36) ** 2) + 0.05
        rr, zz = r + d * nr, z + d * nz
        for s, lst in ((-1, rails[0]), (1, rails[1])):
            lst.append(Vector(pol(rr, th + s * 0.2 / max(rr, 1.0), zz)))
    for lst in rails:
        K.tube('suit_orange', lst, 0.014, seg=4)
    for i in range(len(rows) - 1):
        n = max(1, round((rails[0][i + 1] - rails[0][i]).length / 0.34))
        for k in range(n):
            a, b = rails[0][i].lerp(rails[0][i + 1], (k + 0.5) / n), rails[1][i].lerp(rails[1][i + 1], (k + 0.5) / n)
            K.tube('aluminium', [a, b], 0.012, seg=3, caps=False)

    # --- apex cap, mast and beacon ---------------------------------------------------------------
    zc = Z0_OUT + C_OUT * math.sin(rad(81))
    K.lathe('painted_white', [(1.56, zc - 0.10), (1.56, zc + 0.02), (1.44, zc + 0.10), (0.95, zc + 0.20),
                              (0.52, zc + 0.25), (0.52, zc + 0.36), (0.44, zc + 0.40), (0.0, zc + 0.40)], seg=24)
    K.torus('aluminium', 1.56, 0.035, (0, 0, zc - 0.02), seg=24, ring_seg=6)
    for i in range(12):
        a = TAU * i / 12
        add_box(K.bm('painted_grey', 0.0), (0.50, 0.06, 0.05), pol(1.18, a, zc + 0.165), rot=(0, rad(-12), a))
    for i in range(4):
        a = TAU * i / 4 + 0.5
        K.cyl('painted_grey', 0.13, 0.10, pol(0.86, a, zc + 0.26), seg=8)
        K.cyl('painted_dark', 0.10, 0.02, pol(0.86, a, zc + 0.32), seg=8)
    zm = zc + 0.40
    K.cyl('aluminium', 0.16, 0.05, (0, 0, zm + 0.025), seg=12, bevel=0.006)
    K.cyl('painted_white', 0.055, 2.3, (0, 0, zm + 1.15), seg=10)
    K.cyl('painted_orange', 0.058, 0.25, (0, 0, zm + 1.75), seg=10)
    K.cyl('aluminium', 0.075, 0.04, (0, 0, zm + 1.2), seg=10)
    for i in range(3):
        a = TAU * i / 3 + 0.3
        K.tube('steel', [pol(0.07, a, zm + 1.2), pol(1.30, a, zc + 0.14)], 0.011, seg=4)
        K.box('steel', (0.10, 0.05, 0.04), pol(1.30, a, zc + 0.14), rot=(0, 0, a), bevel=0.005)
    # cross-arm with a whip antenna, a wind sensor and a flood lamp aimed at the door
    za = zm + 1.95
    K.tube('aluminium', [(-0.55, 0, za), (0.55, 0, za)], 0.02, seg=6)
    K.tube('plastic_black', [(-0.55, 0, za), (-0.55, 0, za + 1.5)], [0.012, 0.004], seg=5)
    K.cyl('painted_dark', 0.03, 0.10, (-0.55, 0, za + 0.03), seg=8)
    K.tube('aluminium', [(0.55, 0, za), (0.55, 0, za + 0.30)], 0.012, seg=5)
    for i in range(3):
        a = TAU * i / 3
        K.tube('aluminium', [(0.55, 0, za + 0.30), (0.55 + 0.16 * math.cos(a), 0.16 * math.sin(a), za + 0.30)], 0.006, seg=4)
        K.sphere('painted_dark', 0.035, (0.55 + 0.16 * math.cos(a), 0.16 * math.sin(a), za + 0.30), seg=6, rings=4)
    K.box('painted_grey', (0.16, 0.14, 0.12), (0, -0.12, zm + 1.45), rot=(rad(35), 0, 0), bevel=0.012)
    K.box('light_white', (0.12, 0.02, 0.08), (0, -0.165, zm + 1.40), rot=(rad(35), 0, 0), bevel=0.0)
    anchor('lamp_mast', root, loc=(0, -0.2, zm + 1.38))

    zb = zm + 2.3
    K.cyl('painted_dark', 0.085, 0.07, (0, 0, zb + 0.035), seg=10, bevel=0.008)
    for i in range(4):
        a = TAU * i / 4 + 0.4
        K.tube('steel', [pol(0.09, a, zb + 0.06), pol(0.095, a, zb + 0.2), pol(0.06, a, zb + 0.265), pol(0.0, a, zb + 0.285)], 0.006, seg=4)
    K.torus('steel', 0.094, 0.006, (0, 0, zb + 0.14), seg=10, ring_seg=4)
    b = K.part('beacon', (0, 0, zb))                # the lens alone, so the game can drive it
    b.lathe('light_green', [(0.07, 0.07), (0.07, 0.17), (0.055, 0.215), (0.03, 0.238), (0.0, 0.245)], seg=10)
    b.finish()

    K.finish()
    hab_utilities(root)


def hab_utilities(root):
    """External tanks, the cable tray leaving toward -X, a power box and a work light."""
    K = Kit('utilities', root)
    # utility penetration panel on the base ring / lower wall at -X
    K.box('painted_white', (0.10, 1.3, 0.62), (-8.93, 0, 0.92), bevel=0.012)
    K.box('painted_orange', (0.105, 1.3, 0.06), (-8.93, 0, 1.19), bevel=0.0)
    K.bolts('steel', [(-8.985, y, z) for y in (-0.58, 0.58) for z in (0.68, 1.12)], r=0.018, h=0.012, axis='X')
    cab_m = ('plastic_black', 'painted_orange', 'plastic_black', 'painted_yellow')
    # ladder tray on stands
    X0, X1, ZT = -9.25, -15.6, 0.46
    for sy in (-0.23, 0.23):
        K.box('aluminium', (abs(X1 - X0), 0.03, 0.09), ((X0 + X1) / 2, sy, ZT + 0.03), bevel=0.004)
    n = 13
    for i in range(n):
        x = X0 - 0.15 - (abs(X1 - X0) - 0.3) * i / (n - 1)
        add_box(K.bm('aluminium', 0.0), (0.035, 0.46, 0.025), (x, 0, ZT))
    for i in range(5):
        x = X0 - 0.5 - 1.42 * i
        for sy in (-0.29, 0.29):
            K.box('painted_grey', (0.05, 0.05, ZT + 0.5), (x, sy, (ZT - 0.5) / 2), bevel=0.006)
            K.box('steel', (0.20, 0.16, 0.025), (x, sy, 0.012), bevel=0.004)
        K.box('painted_grey', (0.05, 0.66, 0.05), (x, 0, ZT - 0.045), bevel=0.006)
    for i, m in enumerate(cab_m):
        y = -0.15 + 0.10 * i
        rr = 0.026 if i % 2 == 0 else 0.02
        zc = ZT + 0.012 + rr
        pts = [(-8.98, y * 2.4, 0.92 - 0.05 * i + 0.1), (-9.2, y * 2.2, 0.92 - 0.05 * i + 0.1), (-9.5, y, zc), (-11.5, y, zc),
               (-13.6, y, zc), (X1 - 0.05, y, zc), (X1 - 0.42, y, zc - 0.25), (X1 - 0.5, y, -0.25)]
        K.tube(m, fillet(pts, 0.14, 3), rr, seg=6)
    for x in (-10.4, -12.3, -14.2):
        K.box('painted_dark', (0.05, 0.44, 0.012), (x, 0, ZT + 0.068), bevel=0.0)
    # junction box where the cables dive into the regolith
    K.box('painted_grey', (0.5, 0.6, 0.42), (X1 - 0.65, 0, 0.06), bevel=0.02)
    K.box('painted_yellow', (0.3, 0.012, 0.16), (X1 - 0.65, -0.305, 0.14), bevel=0.0)

    # tank skid
    T = Kit('tanks', root, loc=(-10.95, 2.45, 0), yaw=0.0)
    T.box('painted_grey', (1.5, 2.9, 0.10), (0, 0, 0.23), bevel=0.012)
    for sx in (-0.66, 0.66):
        for sy in (-1.3, 0, 1.3):
            T.box('painted_grey', (0.10, 0.10, 0.75), (sx, sy, -0.14), bevel=0.01)
            T.box('steel', (0.26, 0.26, 0.03), (sx, sy, 0.015), bevel=0.005)
    specs = ((-0.72, 'painted_blue', 'H2O'), (0.72, 'painted_green', 'O2'))
    for y, band, label in specs:
        T.lathe('painted_white', tank_profile(0.56, 2.25), loc=(0, y, 0.42), seg=14)
        T.lathe('gold_foil', [(0.572, 0.0), (0.572, 0.42)], loc=(0, y, 0.74), seg=14, cap_start=False, cap_end=False)
        T.lathe(band, [(0.568, 0.0), (0.568, 0.16)], loc=(0, y, 1.95), seg=14, cap_start=False, cap_end=False)
        for z in (0.70, 1.36, 2.2):
            T.lathe('steel', [(0.575, -0.025), (0.585, -0.025), (0.585, 0.025), (0.575, 0.025)], loc=(0, y, z), seg=14,
                    cap_start=False, cap_end=False)
        T.lathe('painted_grey', [(0.40, 0), (0.44, 0), (0.44, 0.16), (0.40, 0.16)], loc=(0, y, 0.28), seg=12,
                cap_start=False, cap_end=False)
        T.cyl('aluminium', 0.07, 0.12, (0, y, 2.70), seg=8)
        T.cyl('painted_red', 0.10, 0.02, (0, y, 2.78), seg=8)
        T.text('painted_dark', label, 0.26, (-0.585, y, 1.62), rot=(rad(90), 0, rad(-90)))
        T.text('painted_dark', label, 0.26, (0.585, y, 1.62), rot=(rad(90), 0, rad(90)))
        # feed line from the tank top down and across to the wall
        T.pipe('aluminium', [(0, y, 2.74), (0.42, y * 0.55, 2.74), (0.42 + 0.3, y * 0.55, 2.2), (0.85, y * 0.55, 0.62),
                             (1.93, y * 0.55 - 0.9, 0.62)], 0.035, seg=6, bend=0.14)
    # frame around the tanks
    for sx in (-0.68, 0.68):
        for sy in (-1.38, 1.38):
            T.box('aluminium', (0.06, 0.06, 2.45), (sx, sy, 1.5), bevel=0.006)
        T.box('aluminium', (0.05, 2.76, 0.05), (sx, 0, 2.70), bevel=0.006)
        T.box('aluminium', (0.05, 2.76, 0.05), (sx, 0, 1.15), bevel=0.006)
    for sy in (-1.38, 1.38):
        T.box('aluminium', (1.36, 0.05, 0.05), (0, sy, 2.70), bevel=0.006)
        T.tube('steel', [(-0.68, sy, 0.3), (0.68, sy, 2.68)], 0.014, seg=4)
    # a small horizontal nitrogen bottle on the skid end and a valve manifold
    T.box('painted_grey', (0.26, 0.9, 0.34), (0.86, -0.45, 0.62), bevel=0.02)
    for i in range(3):
        T.cyl('painted_red', 0.06, 0.02, (1.0, -0.75 + 0.3 * i, 0.62), seg=8, axis='X')
    T.anchor('col_tanks', (0, 0, 0), radius=1.7)
    T.finish()

    # power conditioning box, foil wrapped, with a radiator
    P = Kit('powerbox', root, loc=(-10.35, -1.95, 0))
    P.box('gold_foil', (0.95, 0.75, 0.9), (0, 0, 0.85), bevel=0.03)
    P.box('painted_white', (1.0, 0.8, 0.06), (0, 0, 1.33), bevel=0.012)
    P.box('painted_grey', (0.99, 0.79, 0.07), (0, 0, 0.385), bevel=0.01)
    for sx in (-0.4, 0.4):
        for sy in (-0.3, 0.3):
            P.box('painted_grey', (0.07, 0.07, 0.85), (sx, sy, -0.05), bevel=0.008)
            P.box('steel', (0.2, 0.2, 0.025), (sx, sy, 0.012), bevel=0.004)
    for i in range(7):
        add_box(P.bm('painted_white', 0.0), (0.012, 0.66, 0.5), (-0.5 - 0.035 * i, 0, 0.95))
    P.box('painted_grey', (0.3, 0.7, 0.04), (-0.6, 0, 0.69), bevel=0.005)
    P.box('painted_yellow', (0.34, 0.012, 0.22), (0.1, -0.381, 0.95), bevel=0.0)
    P.box('painted_dark', (0.2, 0.03, 0.2), (-0.25, -0.385, 0.95), bevel=0.01)
    P.cyl('light_green', 0.02, 0.012, (-0.25, -0.402, 1.12), seg=6, axis='Y')
    P.pipe('plastic_black', [(0.3, 0.38, 0.7), (0.3, 0.9, 0.7), (0.5, 1.5, 0.56), (0.5, 1.8, 0.52)], 0.03, seg=6, bend=0.15)
    # two radiator panels on a frame beside it
    for i in range(2):
        yy = -1.0 - i * 0.9
        P.box('painted_white', (1.5, 0.05, 1.1), (0.1, yy, 1.25), rot=(rad(12 - 24 * i), 0, 0), bevel=0.012)
        for k in range(7):
            add_box(P.bm('painted_grey', 0.0), (0.03, 0.09, 1.04), (-0.56 + k * 0.22, yy, 1.25), rot=(rad(12 - 24 * i), 0, 0))
        add_box(P.bm('aluminium', 0.0), (1.54, 0.07, 0.05), (0.1, yy + 0.115 * (1 - 2 * i), 0.72), rot=(rad(12 - 24 * i), 0, 0))
        for sx in (-0.55, 0.75):
            P.tube('aluminium', [(sx, yy, -0.3), (sx, yy, 0.72)], 0.025, seg=5)
    P.pipe('copper', [(0.0, -0.4, 0.7), (0.0, -0.75, 0.7), (0.0, -1.0, 0.75)], 0.02, seg=5, bend=0.06, n=2)
    P.pipe('copper', [(0.2, -1.05, 0.72), (0.2, -1.9, 0.72)], 0.02, seg=5, bend=0.06, n=2)
    P.anchor('col_power', (0, -0.6, 0), radius=1.3)
    P.finish()

    # work light on a pole by the tanks
    L = Kit('worklight', root, loc=(-9.9, 4.3, 0))
    L.box('steel', (0.3, 0.3, 0.03), (0, 0, 0.015), bevel=0.005)
    L.tube('aluminium', [(0, 0, -0.3), (0, 0, 3.1)], 0.035, seg=8)
    L.tube('steel', [(0, 0, 1.6), (0.75, 0.55, 0.0)], 0.01, seg=4)
    L.tube('steel', [(0, 0, 1.6), (-0.75, 0.55, 0.0)], 0.01, seg=4)
    L.tube('steel', [(0, 0, 1.6), (0.0, -0.9, 0.0)], 0.01, seg=4)
    L.tube('aluminium', [(-0.3, 0, 3.05), (0.3, 0, 3.05)], 0.02, seg=6)
    for sx in (-0.22, 0.22):
        L.box('painted_grey', (0.24, 0.12, 0.18), (sx, -0.05, 2.92), rot=(rad(-28), 0, 0), bevel=0.012)
        L.box('light_white', (0.2, 0.012, 0.14), (sx, -0.10, 2.89), rot=(rad(-28), 0, 0), bevel=0.0)
    L.finish()
    anchor('lamp_tanks', root, loc=(-9.9, 4.15, 2.9))
    K.finish()


# ----------------------------------------------------------------------------------------------
# Small shared pieces
# ----------------------------------------------------------------------------------------------
def face_to(bm, pts, toward):
    """A polygon whose normal is made to point along `toward` (a direction)."""
    vs = [bm.verts.new(p) for p in pts]
    f = bm.faces.new(vs)
    f.normal_update()
    if f.normal.dot(Vector(toward)) < 0:
        f.normal_flip()
    return vs


def add_solid(bm, face_pts, vec):
    """Extrude a planar polygon (3D points) along a vector into a closed prism."""
    a = [bm.verts.new(p) for p in face_pts]
    b = [bm.verts.new(Vector(p) + Vector(vec)) for p in face_pts]
    n = len(a)
    faces = [bm.faces.new(a), bm.faces.new(list(reversed(b)))]
    for i in range(n):
        faces.append(bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i])))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return a + b


def airlock_outline(grow=0.0, bottom=-0.6):
    g, k = grow, grow * 0.414
    return [(-AX - g, bottom), (AX + g, bottom), (AX + g, ATOP - ACH + k), (AX - ACH + k, ATOP + g),
            (-(AX - ACH + k), ATOP + g), (-AX - g, ATOP - ACH + k)]


def portal_outline(bottom=-0.6):
    """The airlock end wall with the door opening cut out of it (one concave polygon)."""
    o = airlock_outline(0.0, bottom)
    return [o[0], (-DOOR_W, bottom), (-DOOR_W, DOOR_TOP), (DOOR_W, DOOR_TOP), (DOOR_W, bottom)] + o[1:]


def gauge(K, loc, r=0.05, facing=(0, -1, 0), needle=0.6, rim='painted_dark'):
    """A round dial facing along `facing` (a unit axis direction in the kit frame)."""
    f = Vector(facing)
    yaw = math.atan2(f.y, f.x)
    rot = (0, rad(90), yaw)
    K.lathe(rim, [(r, 0.0), (r, 0.022), (r * 0.82, 0.014)], loc=loc, seg=8, rot=rot, cap_start=False, cap_end=False)
    K.lathe('plastic_white', [(0.0, 0.012), (r * 0.83, 0.012)], loc=loc, seg=8, rot=rot, cap_start=False,
            cap_end=False, smooth=30.0)
    a = rad(210 - 240 * needle)
    side = Vector((-f.y, f.x, 0))
    tip = Vector(loc) + f * 0.016 + (side * math.cos(a) + Vector((0, 0, 1)) * math.sin(a)) * r * 0.7
    K.tube('painted_red', [Vector(loc) + f * 0.016, tip], 0.0045, seg=3, caps=False)


def handwheel(K, loc, r=0.07, facing=(0, -1, 0), m='painted_red', stem=0.06):
    f = Vector(facing)
    yaw = math.atan2(f.y, f.x)
    c = Vector(loc) + f * stem
    K.torus(m, r, r * 0.16, c, seg=8, ring_seg=4, axis='Z', rot=(0, rad(90), yaw))
    side = Vector((-f.y, f.x, 0))
    for i in range(3):
        a = TAU * i / 3 + 0.5
        d = side * math.cos(a) + Vector((0, 0, 1)) * math.sin(a)
        K.tube(m, [c, c + d * r], r * 0.11, seg=3, caps=False)
    K.tube('steel', [Vector(loc), c + f * 0.012], r * 0.16, seg=4)


def crate(K, size, loc, body='painted_white', lid='painted_orange', yaw=0.0, bevel=0.016):
    """A latched equipment case sitting on z = loc.z."""
    w, d, h = size
    x, y, z = loc
    rot = (0, 0, yaw)
    K.box(body, (w, d, h * 0.72), (x, y, z + h * 0.36), rot=rot, bevel=bevel)
    K.box(lid, (w + 0.015, d + 0.015, h * 0.26), (x, y, z + h * 0.86), rot=rot, bevel=bevel)
    K.box('painted_dark', (w + 0.004, d + 0.004, 0.018), (x, y, z + h * 0.725), rot=rot, bevel=0.0)
    c, s = math.cos(yaw), math.sin(yaw)
    for sx in (-0.28, 0.28):
        px, py = sx * w, -d / 2 - 0.008
        add_box(K.bm('steel', 0.0), (0.05, 0.016, 0.085), (x + px * c - py * s, y + px * s + py * c, z + h * 0.74), rot=rot)


def ctb(K, size, loc, yaw=0.0, label=None, m='suit_white', tilt=0.0):
    """A soft cargo transfer bag: pillowy body, a zip line, a carry strap and a label patch."""
    w, d, h = size
    x, y, z = loc
    rot = (tilt, 0, yaw)
    K.box(m, (w, d, h), (x, y, z + h / 2), rot=rot, bevel=min(w, d, h) * 0.2, seg=1)
    c, s = math.cos(yaw), math.sin(yaw)

    def P(px, py, pz):
        return (x + px * c - py * s, y + px * s + py * c, z + pz)
    add_box(K.bm('suit_grey', 0.0), (w * 0.86, 0.012, 0.02), P(0, -d / 2 - 0.001, h * 0.78), rot=rot)
    if label:
        add_box(K.bm(label, 0.0), (w * 0.34, 0.012, h * 0.26), P(-w * 0.2, -d / 2 - 0.002, h * 0.42), rot=rot)


# ----------------------------------------------------------------------------------------------
# Hab: airlock
# ----------------------------------------------------------------------------------------------
def door_leaf(root, name, x_c, y_c, side, accent):
    """One sliding leaf, closed. side = -1 covers x in [-1.1, 0] (L), +1 covers [0, 1.1] (R).
    The game opens it by moving the node side * 1.05 m along X (stored as extras.open_dx)."""
    p = part(name, parent=root, loc=(x_c, y_c, FLOOR_Z))
    p['open_dx'] = side * 1.05
    D = Kit(name, p)
    w, h, t = 1.1, DOOR_H, 0.07
    xm = -side * w / 2                      # the meeting edge
    D.box('painted_white', (w - 0.012, t, h - 0.01), (side * 0.006, 0, h / 2), bevel=0.012)
    D.box('painted_dark', (0.028, t + 0.014, h - 0.03), (xm + side * 0.012, 0, h / 2), bevel=0.004)
    D.box('painted_grey', (w - 0.03, t + 0.016, 0.10), (side * 0.012, 0, 0.06), bevel=0.006)
    D.box('painted_grey', (w - 0.03, t + 0.016, 0.07), (side * 0.012, 0, h - 0.05), bevel=0.006)
    for fy in (-1, 1):
        yf = fy * t / 2
        D.box('painted_white', (0.78, 0.014, 0.66), (side * 0.07, yf + fy * 0.004, 0.52), bevel=0.007)
        D.box('painted_white', (0.78, 0.014, 0.36), (side * 0.07, yf + fy * 0.004, 2.08), bevel=0.007)
        add_box(D.bm(accent, 0.0), (w - 0.05, 0.008, 0.11), (side * 0.01, yf + fy * 0.003, 1.02))
        xs = xm + side * 0.085
        add_box(D.bm('painted_yellow', 0.0), (0.085, 0.008, h - 0.26), (xs, yf + fy * 0.003, h / 2))
        bm = D.open('painted_dark')
        for k in range(7):
            z0 = 0.2 + k * 0.3
            xa, xb, yq = xs - 0.042, xs + 0.042, yf + fy * 0.0085
            face_to(bm, [(xa, yq, z0), (xb, yq, z0 + 0.085), (xb, yq, z0 + 0.20), (xa, yq, z0 + 0.115)], (0, fy, 0))
        cx, cz = side * 0.08, 1.56
        rot = (0, 0, 0) if fy > 0 else (0, 0, math.pi)
        D.lathe('painted_grey', [(0.215, 0.0), (0.215, 0.022), (0.195, 0.03), (0.165, 0.03), (0.155, 0.012)],
                loc=(cx, yf, cz), seg=14, axis='Y', rot=rot, cap_start=False, cap_end=False)
        D.lathe('glass_dark', [(0.0, 0.012), (0.158, 0.012)], loc=(cx, yf, cz), seg=14, axis='Y', rot=rot,
                cap_start=False, cap_end=False, smooth=30.0)
        D.handle('painted_grey', (xm + side * 0.23, yf, 0.92), (xm + side * 0.23, yf, 1.30), (0, fy * 0.065, 0), r=0.014)
        add_box(D.bm('painted_dark', 0.0), (0.16, 0.008, 0.07), (side * 0.30, yf + fy * 0.003, 1.33))
    D.finish()
    return p


def hab_airlock(root, interior):
    K = Kit('airlock', root)
    L = AY0 - AY1
    yc = (AY0 + AY1) / 2

    # --- shell --------------------------------------------------------------------------------
    add_extrude(K.bm('painted_white', 0.03, 2), airlock_outline(), AY1, AY0, caps=False)
    for y in (AY1 + 0.07, AY1 + 1.12, AY1 + 2.17):
        add_extrude(K.bm('painted_grey', 0.012), airlock_outline(0.045, -0.2), y - 0.05, y + 0.05, caps=False)
    # longitudinal stringers and a kick band
    for sx in (-1, 1):
        K.box('painted_grey', (0.05, L - 0.2, 0.07), (sx * (AX + 0.02), yc, 1.22), bevel=0.01)
        K.box('painted_dark', (0.03, L - 0.05, 0.34), (sx * (AX + 0.008), yc, 0.18), bevel=0.006)
        K.box('painted_orange', (0.02, L - 0.3, 0.07), (sx * (AX + 0.004), yc, 2.12), bevel=0.0)
    # bellows collar joining the rigid box to the fabric
    add_extrude(K.bm('rubber', 0.0, 1, 30.0), airlock_outline(0.05, -0.5), AY0 - 0.52, AY0 + 0.06, caps=False)
    for y in (AY0 - 0.44, AY0 - 0.28, AY0 - 0.12):
        add_extrude(K.bm('rubber', 0.02), airlock_outline(0.13, -0.5), y - 0.045, y + 0.045, caps=False)
    add_extrude(K.bm('aluminium', 0.01), airlock_outline(0.10, -0.5), AY0 - 0.60, AY0 - 0.53, caps=False)

    # --- end walls ---------------------------------------------------------------------------
    # outer end: two skins with the slot the leaves slide in between them
    po = portal_outline()
    for y0, y1 in ((AY1, AY1 + 0.045), (Y_DOOR_OUT + 0.05, Y_ROOM1)):
        add_extrude(K.bm('painted_white', 0.008), po, y0, y1, caps=True)
    # Hab end: the room's end wall, then a short tunnel through the pressure wall with the inner
    # leaves sliding in a slot across it
    add_extrude(K.bm('painted_white', 0.008), po, Y_ROOM0, Y_ROOM0 + 0.04, caps=True)
    jw, jt = 0.24, DOOR_H + 0.30
    y_hab = -8.24                               # face of the portal inside the Hab
    for y0, y1 in ((Y_ROOM0 + 0.04, Y_DOOR_IN - 0.05), (Y_DOOR_IN + 0.05, y_hab)):
        for sx in (-1, 1):
            K.box('painted_grey', (jw, y1 - y0, jt + 0.2), (sx * (DOOR_W + jw / 2), (y0 + y1) / 2, FLOOR_Z + jt / 2 - 0.1), bevel=0.02)
        K.box('painted_grey', (2 * DOOR_W + 2 * jw, y1 - y0, 0.30), (0, (y0 + y1) / 2, DOOR_TOP + 0.15), bevel=0.02)
    # door surrounds on the room faces
    for y, m, proud in ((AY1 - 0.012, 'painted_orange', 0.05), (Y_ROOM1, 'painted_grey', 0.03), (Y_ROOM0, 'painted_grey', 0.03)):
        for sx in (-1, 1):
            K.box(m, (0.13, proud, DOOR_H + 0.14), (sx * (DOOR_W + 0.065), y, FLOOR_Z + (DOOR_H + 0.14) / 2), bevel=0.012)
        K.box(m, (2 * DOOR_W + 0.26, proud, 0.14), (0, y, DOOR_TOP + 0.07), bevel=0.012)
    # hazard stripes, sign and status lamp on the Hab face of the portal
    for sx in (-1, 1):
        add_box(K.bm('painted_yellow', 0.0), (0.09, 0.012, DOOR_H), (sx * (DOOR_W + jw / 2), y_hab + 0.002, FLOOR_Z + DOOR_H / 2))
        bm = K.open('painted_dark')
        for k in range(8):
            z0 = FLOOR_Z + 0.06 + k * 0.3
            xa, xb, yq = sx * (DOOR_W + jw / 2 - 0.045), sx * (DOOR_W + jw / 2 + 0.045), y_hab + 0.0095
            face_to(bm, [(xa, yq, z0), (xb, yq, z0 + 0.09), (xb, yq, z0 + 0.21), (xa, yq, z0 + 0.12)], (0, 1, 0))
    K.box('painted_dark', (1.5, 0.02, 0.2), (0, y_hab + 0.004, DOOR_TOP + 0.15), bevel=0.006)
    K.text('painted_white', 'AIRLOCK 1', 0.13, (0, y_hab + 0.018, DOOR_TOP + 0.15), rot=(rad(90), 0, math.pi))
    K.box('light_green', (0.12, 0.02, 0.05), (1.0, y_hab + 0.004, DOOR_TOP + 0.15), bevel=0.0)
    # door control on the Hab side
    K.box('painted_grey', (0.2, 0.06, 0.34), (-(DOOR_W + jw / 2), y_hab + 0.02, 1.36), bevel=0.012)
    add_box(K.bm('plastic_black', 0.0), (0.13, 0.01, 0.1), (-(DOOR_W + jw / 2), y_hab + 0.052, 1.43))
    add_box(K.bm('light_green', 0.0), (0.04, 0.012, 0.04), (-(DOOR_W + jw / 2) + 0.04, y_hab + 0.052, 1.28))
    add_box(K.bm('light_red', 0.0), (0.04, 0.012, 0.04), (-(DOOR_W + jw / 2) - 0.04, y_hab + 0.052, 1.28))
    # threshold plates in both openings
    for y0, y1 in ((Y_ROOM0 - 0.06, -8.08), (AY1 - 0.03, AY1 + 0.25)):
        K.box('steel', (2 * DOOR_W, y1 - y0, 0.02), (0, (y0 + y1) / 2, FLOOR_Z - 0.004), bevel=0.004)
        for sy in (y0 + 0.05, y1 - 0.05):
            add_box(K.bm('painted_yellow', 0.0), (2 * DOOR_W - 0.06, 0.035, 0.004), (0, sy, FLOOR_Z + 0.0075))

    # --- room inside ----------------------------------------------------------------------------
    y_a, y_b = Y_ROOM1, Y_ROOM0
    bm = K.open('painted_white')
    for sx in (-1, 1):
        face_to(bm, [(sx * AXI, y_a, FLOOR_Z), (sx * AXI, y_b, FLOOR_Z), (sx * AXI, y_b, ACEIL), (sx * AXI, y_a, ACEIL)], (-sx, 0, 0))
    face_to(bm, [(-AXI, y_a, ACEIL), (AXI, y_a, ACEIL), (AXI, y_b, ACEIL), (-AXI, y_b, ACEIL)], (0, 0, -1))
    K.box('hab_floor', (2 * AX - 0.1, L - 0.1, 0.6), (0, yc, FLOOR_Z - 0.3), bevel=0.0)
    yc = (y_a + y_b) / 2
    # tread strip down the passage
    K.box('hab_floor_b', (2 * DOOR_W - 0.3, y_b - y_a - 0.5, 0.012), (0, yc, FLOOR_Z + 0.004), bevel=0.003)
    for i in range(9):
        add_box(K.bm('steel', 0.0), (1.7, 0.03, 0.008), (0, y_a + 0.4 + i * 0.21, FLOOR_Z + 0.014))
    for sx in (-1, 1):
        add_box(K.bm('painted_yellow', 0.0), (0.05, y_b - y_a - 0.1, 0.004), (sx * DOOR_W, yc, FLOOR_Z + 0.003))
    # wall panel seams, ceiling lights, conduit, vents
    for sx in (-1, 1):
        for y in (yc - 0.7, yc + 0.7):
            add_box(K.bm('painted_grey', 0.0), (0.012, 0.03, ACEIL - FLOOR_Z), (sx * (AXI - 0.004), y, (ACEIL + FLOOR_Z) / 2))
        add_box(K.bm('painted_grey', 0.0), (0.012, y_b - y_a, 0.03), (sx * (AXI - 0.004), yc, 2.2))
        K.tube('painted_grey', [(sx * (AXI - 0.06), y_a, ACEIL - 0.06), (sx * (AXI - 0.06), y_b, ACEIL - 0.06)], 0.025, seg=6)
        K.box('painted_dark', (0.02, 0.5, 0.16), (sx * (AXI - 0.01), yc + sx * 0.9, 2.42), bevel=0.004)
        for i in range(4):
            add_box(K.bm('painted_grey', 0.0), (0.03, 0.46, 0.012), (sx * (AXI - 0.022), yc + sx * 0.9, 2.37 + i * 0.035))
    for y in (yc - 0.75, yc + 0.75):
        K.box('painted_grey', (1.3, 0.24, 0.05), (0, y, ACEIL - 0.025), bevel=0.008)
        add_box(K.bm('light_white', 0.0), (1.2, 0.16, 0.012), (0, y, ACEIL - 0.055))
    anchor('lamp_airlock', root, loc=(0, yc, ACEIL - 0.25))
    # inner-door control panel and a pressure gauge on the Hab-end wall, inside the airlock
    K.box('painted_grey', (0.34, 0.05, 0.5), (1.55, y_b - 0.025, 1.35), bevel=0.012)
    add_box(K.bm('plastic_black', 0.0), (0.2, 0.01, 0.14), (1.55, y_b - 0.053, 1.47))
    add_box(K.bm('light_green', 0.0), (0.05, 0.012, 0.05), (1.47, y_b - 0.053, 1.27))
    add_box(K.bm('light_red', 0.0), (0.05, 0.012, 0.05), (1.63, y_b - 0.053, 1.27))
    gauge(K, (-1.55, y_b - 0.004, 1.5), 0.085, facing=(0, -1, 0), needle=0.35)
    K.box('painted_yellow', (0.3, 0.012, 0.11), (-1.55, y_b - 0.006, 1.28), bevel=0.0)

    # --- outside: door hardware, lights, kit on the flanks -------------------------------------
    yf = AY1 - 0.001
    K.box('painted_dark', (1.5, 0.02, 0.22), (0, yf - 0.012, DOOR_TOP + 0.32), bevel=0.006)
    K.text('painted_white', 'AIRLOCK 1', 0.14, (0, yf - 0.026, DOOR_TOP + 0.32))
    K.box('painted_grey', (0.34, 0.07, 0.52), (1.62, yf - 0.035, 1.34), bevel=0.014)
    add_box(K.bm('plastic_black', 0.0), (0.22, 0.01, 0.15), (1.62, yf - 0.073, 1.46))
    add_box(K.bm('light_green', 0.0), (0.05, 0.014, 0.05), (1.54, yf - 0.073, 1.26))
    add_box(K.bm('light_red', 0.0), (0.05, 0.014, 0.05), (1.70, yf - 0.073, 1.26))
    K.box('painted_red', (0.05, 0.05, 0.16), (1.62, yf - 0.095, 1.16), bevel=0.01)
    for sx in (-1, 1):
        K.handle('steel', (sx * 1.42, yf, 0.75), (sx * 1.42, yf, 1.95), (0, -0.09, 0), r=0.017)
        # flood lamps on brackets at the top corners
        K.tube('aluminium', [(sx * 1.25, yf + 0.05, ATOP - 0.04), (sx * 1.25, yf - 0.20, ATOP + 0.16)], 0.02, seg=6)
        K.box('painted_grey', (0.30, 0.16, 0.20), (sx * 1.25, yf - 0.25, ATOP + 0.16), rot=(rad(-32), 0, sx * rad(-10)), bevel=0.015)
        K.box('light_white', (0.25, 0.012, 0.15), (sx * 1.25 - sx * 0.012, yf - 0.322, ATOP + 0.115), rot=(rad(-32), 0, sx * rad(-10)), bevel=0.0)
        anchor('lamp_door_L' if sx < 0 else 'lamp_door_R', root, loc=(sx * 1.25, yf - 0.36, ATOP + 0.1))
    K.box('painted_grey', (0.22, 0.2, 0.05), (0, yf - 0.08, ATOP), bevel=0.008)
    K.cyl('painted_dark', 0.06, 0.04, (0, yf - 0.1, ATOP + 0.045), seg=8)
    K.lathe('light_amber', [(0.05, 0.0), (0.05, 0.07), (0.03, 0.1), (0.0, 0.105)], loc=(0, yf - 0.1, ATOP + 0.06), seg=8)
    # hazard edge on the sill
    bm = K.open('painted_dark')
    K.box('painted_yellow', (2 * DOOR_W + 0.26, 0.016, 0.10), (0, yf - 0.006, FLOOR_Z - 0.055), bevel=0.0)
    for k in range(13):
        x0 = -DOOR_W - 0.1 + k * 0.19
        face_to(bm, [(x0, yf - 0.0155, FLOOR_Z - 0.105), (x0 + 0.07, yf - 0.0155, FLOOR_Z - 0.105),
                     (x0 + 0.13, yf - 0.0155, FLOOR_Z - 0.005), (x0 + 0.06, yf - 0.0155, FLOOR_Z - 0.005)], (0, -1, 0))
    # ramp
    yr = AY1 - 1.25
    add_solid(K.bm('painted_grey', 0.006), [(-1.25, AY1 - 0.02, FLOOR_Z - 0.012), (-1.25, yr, -0.03), (-1.25, yr, -0.5),
                                            (-1.25, AY1 - 0.02, -0.5)], (2.5, 0, 0))
    slope = math.atan2(FLOOR_Z + 0.018, 1.23)
    for i in range(8):
        f = (i + 0.6) / 8.4
        add_box(K.bm('steel', 0.0), (2.2, 0.035, 0.014), (0, AY1 - 0.02 - 1.23 * f, FLOOR_Z - 0.006 - (FLOOR_Z + 0.018) * f + 0.004),
                rot=(slope, 0, 0))
    for sx in (-1, 1):
        K.box('painted_yellow', (0.07, 1.26, 0.07), (sx * 1.215, AY1 - 0.64, 0.035), rot=(slope, 0, 0), bevel=0.01)

    # east flank: handrail, stowage box, oxygen bottles
    xe = AX
    K.handle('steel', (xe, yc - 1.0, 1.0), (xe, yc + 0.3, 1.0), (0.09, 0, 0), r=0.017)
    K.box('painted_white', (0.34, 0.95, 0.5), (xe + 0.19, yc - 0.35, 0.52), bevel=0.025)
    K.box('painted_orange', (0.35, 0.96, 0.05), (xe + 0.19, yc - 0.35, 0.74), bevel=0.0)
    for sy in (-0.3, 0.3):
        add_box(K.bm('steel', 0.0), (0.02, 0.06, 0.1), (xe + 0.365, yc - 0.35 + sy, 0.68))
        K.box('painted_grey', (0.3, 0.06, 0.3), (xe + 0.17, yc - 0.35 + sy, 0.14), bevel=0.01)
    for i in range(2):
        yb = yc + 0.72 + i * 0.34
        K.lathe('painted_green', tank_profile(0.13, 1.05, dome=0.1, neck=0.03), loc=(xe + 0.17, yb, 0.42), seg=10)
        K.cyl('aluminium', 0.035, 0.08, (xe + 0.17, yb, 1.50), seg=6)
    for z in (0.62, 1.22):
        K.box('steel', (0.06, 0.78, 0.05), (xe + 0.05, yc + 0.89, z), bevel=0.006)
        K.box('painted_dark', (0.30, 0.74, 0.025), (xe + 0.19, yc + 0.89, z), bevel=0.004)
    K.box('painted_grey', (0.34, 0.76, 0.05), (xe + 0.17, yc + 0.89, 0.40), bevel=0.008)
    # west flank: foil-wrapped equipment box, conduit to the dome, rungs to the roof
    xw = -AX
    K.box('gold_foil', (0.36, 0.8, 0.7), (xw - 0.20, yc + 0.75, 1.15), bevel=0.03)
    K.box('painted_grey', (0.40, 0.84, 0.05), (xw - 0.20, yc + 0.75, 0.78), bevel=0.008)
    K.box('painted_white', (0.40, 0.84, 0.04), (xw - 0.20, yc + 0.75, 1.52), bevel=0.008)
    for sy in (-0.34, 0.34):
        K.tube('painted_grey', [(xw - 0.02, yc + 0.75 + sy, 0.3), (xw - 0.3, yc + 0.75 + sy, 0.77)], 0.02, seg=5)
    K.pipe('plastic_black', [(xw - 0.2, yc + 0.75, 1.54), (xw - 0.2, yc + 0.75, 1.9), (xw - 0.06, yc + 1.0, 1.9),
                             (xw - 0.06, AY0 - 0.6, 1.9)], 0.022, seg=6, bend=0.08)
    for i in range(7):
        z = 0.5 + i * 0.36
        K.tube('steel', [(xw, yc - 0.95, z), (xw - 0.10, yc - 0.93, z), (xw - 0.10, yc - 0.52, z), (xw, yc - 0.5, z)], 0.013, seg=4)
    K.box('painted_yellow', (0.012, 0.4, 0.26), (xw - 0.007, yc - 0.1, 1.6), bevel=0.0)
    # NASA-style yellow handrails along the roof edges, recessed panels and a module number
    for sx in (-1, 1):
        xr = sx * (AX - ACH / 2 + 0.03)
        zr = ATOP - ACH / 2 + 0.03
        n = Vector((sx * 0.707, 0, 0.707))
        for y0 in (AY1 + 0.35, AY1 + 1.75):
            p0, p1 = Vector((xr, y0, zr)), Vector((xr, y0 + 0.9, zr))
            K.tube('painted_yellow', fillet([p0, p0 + n * 0.09, p1 + n * 0.09, p1], 0.035, 1), 0.016, seg=4)
        for yy, w in ((AY1 + 0.62, 0.86), (AY1 + 1.66, 0.86), (AY1 + 2.62, 0.62)):
            K.box('painted_white', (0.016, w, 0.72), (sx * (AX + 0.004), yy, 1.68), bevel=0.006)
        K.text('painted_dark', '01', 0.62, (sx * (AX + 0.014), AY1 + 0.62, 1.68), rot=(rad(90), 0, rad(90) * sx), res=3)
    for sx in (-0.9, 0.9):
        p0, p1 = Vector((sx, AY1 + 0.5, ATOP)), Vector((sx, AY1 + 1.5, ATOP))
        K.tube('painted_yellow', fillet([p0, p0 + Vector((0, 0, 0.09)), p1 + Vector((0, 0, 0.09)), p1], 0.035, 1), 0.016, seg=4)
    # roof: hatch, vent and conduit
    K.cyl('painted_grey', 0.42, 0.06, (0, yc - 0.3, ATOP + 0.03), seg=16, bevel=0.012)
    K.cyl('painted_white', 0.34, 0.05, (0, yc - 0.3, ATOP + 0.075), seg=16, bevel=0.012)
    K.torus('steel', 0.12, 0.014, (0, yc - 0.3, ATOP + 0.14), seg=10, ring_seg=4)
    K.tube('steel', [(0, yc - 0.3, ATOP + 0.09), (0, yc - 0.3, ATOP + 0.14)], 0.015, seg=5)
    K.box('painted_grey', (0.5, 0.36, 0.14), (-0.95, yc + 0.6, ATOP + 0.07), bevel=0.015)
    for i in range(4):
        add_box(K.bm('painted_dark', 0.0), (0.42, 0.012, 0.02), (-0.95, yc + 0.415, ATOP + 0.04 + i * 0.027))
    K.finish()

    door_leaf(root, 'door_outer_L', -DOOR_W / 2, Y_DOOR_OUT, -1, 'painted_orange')
    door_leaf(root, 'door_outer_R', DOOR_W / 2, Y_DOOR_OUT, 1, 'painted_orange')
    door_leaf(root, 'door_inner_L', -DOOR_W / 2, Y_DOOR_IN, -1, 'painted_blue')
    door_leaf(root, 'door_inner_R', DOOR_W / 2, Y_DOOR_IN, 1, 'painted_blue')


# ----------------------------------------------------------------------------------------------
# Hab: interior shell (liner, ribs, floor, ducting, lights)
# ----------------------------------------------------------------------------------------------
IN_WALL = ((-0.02, 0), (0.80, 1), (1.56, 0), (2.14, 1), (HEAD_Z, 0), (Z0_IN, 0))
IN_ROOF = ((10, 1), (20, 0), (30, 1), (40, 0), (49, 1), (58, 0), (65, 1), (72, 0), (77, 1), (82, 0))
TRUSS_R, TRUSS_Z = 3.8, 5.0


def hab_interior_shell(interior):
    K = Kit('shell', interior)

    # --- quilted liner --------------------------------------------------------------------------
    rows = [(A_IN, z, 1.0, 0.0) for z, _ in IN_WALL] + [roof_pt(A_IN, Z0_IN, C_IN, d) for d, _ in IN_ROOF]
    amps = [in_amp(r, z) * b for (r, z, _, _), b in zip(rows, [b for _, b in IN_WALL] + [b for _, b in IN_ROOF])]
    bm = bm_new()
    lobed_shell(bm, rows, amps, 4, sign=-1.0, skip=lambda g, i: g == 0 and i < 4, flip=True, mat_fn=lambda g, i: 1 if i < 2 else 0)
    o = mesh_obj('liner', bm, ['hab_liner', 'hab_liner_b'], parent=interior, smooth_angle=30.0)
    o['kit'] = 'liner'
    # seam tapes at the pinched rows
    bm = bm_new()
    for z in (1.56, HEAD_Z):
        pair = [(A_IN - 0.006, z - 0.03, 1.0, 0.0), (A_IN - 0.006, z + 0.03, 1.0, 0.0)]
        lobed_shell(bm, pair, [0, 0], 4, skip=(lambda g, i: g == 0), flip=True)   # four columns: it must hug the wall
    for d in (20, 40, 58):
        pair = [roof_pt(A_IN, Z0_IN, C_IN, d - 0.5), roof_pt(A_IN, Z0_IN, C_IN, d + 0.5)]
        lobed_shell(bm, pair, [0, 0], 1, offset=-0.006, flip=True)
    o = mesh_obj('liner_tape', bm, 'canvas_dark', parent=interior, smooth_angle=30.0)
    o['kit'] = 'liner'

    # --- ribs -----------------------------------------------------------------------------------
    stations = [(A_IN, z, 1.0, 0.0) for z in (FLOOR_Z, 1.56, HEAD_Z, Z0_IN)] + \
               [roof_pt(A_IN, Z0_IN, C_IN, d) for d in (10, 20, 30, 40, 49, 58, 65, 72, 77, 82)]
    bm = K.open('painted_grey', smooth=30.0)
    hw, dep = 0.045, 0.12
    for k in range(N_GORE):
        th = rib_ang(k)
        tg = Vector((-math.sin(th), math.cos(th), 0))
        prev = None
        for (r, z, nr, nz) in stations:
            if k in (0, 1) and z < HEAD_Z - 0.01:
                continue
            p_out = Vector(pol(r, th, z))
            inw = Vector((-nr * math.cos(th), -nr * math.sin(th), -nz))
            p_in = p_out + inw * dep
            cur = (p_out - tg * hw, p_out + tg * hw, p_in + tg * hw, p_in - tg * hw, inw)
            if prev:
                face_to(bm, [prev[3], prev[2], cur[2], cur[3]], prev[4] + cur[4])
                face_to(bm, [prev[0], prev[3], cur[3], cur[0]], -tg)
                face_to(bm, [prev[1], prev[2], cur[2], cur[1]], tg)
            prev = cur
    # hoops tying the ribs together: at the eave and at mid roof
    for (r, z, nr, nz), sec in ((roof_pt(A_IN, Z0_IN, C_IN, 1.6), (0.07, 0.10)), (roof_pt(A_IN, Z0_IN, C_IN, 49), (0.06, 0.08))):
        rr, zz = r - (dep + 0.02) * nr, z - (dep + 0.02) * nz
        for k in range(N_GORE):
            a0, a1 = rib_ang(k), rib_ang(k + 1)
            p0, p1 = Vector(pol(rr, a0, zz)), Vector(pol(rr, a1, zz))
            mid = (p0 + p1) / 2
            add_box(K.bm('painted_grey', 0.0), ((p1 - p0).length, sec[0], sec[1]), mid, rot=(0, 0, (a0 + a1) / 2 + math.pi / 2))
    # rib feet
    for k in range(2, N_GORE):
        th = rib_ang(k)
        add_box(K.bm('painted_dark', 0.0), (0.20, 0.16, 0.10), pol(A_IN - 0.09, th, FLOOR_Z + 0.19), rot=(0, 0, th))

    # --- apex hub: compression ring, fan and ring light ------------------------------------------
    ra, za, _, _ = roof_pt(A_IN, Z0_IN, C_IN, 82)
    K.lathe('painted_grey', [(ra + 0.12, za - 0.22), (ra + 0.12, za + 0.02), (ra - 0.10, za + 0.02), (ra - 0.10, za - 0.22)],
            seg=24)
    K.lathe('void', [(0.0, za), (ra - 0.1, za)], seg=24, cap_start=False, cap_end=False, smooth=30.0)
    K.torus('light_white', ra - 0.26, 0.035, (0, 0, za - 0.2), seg=24, ring_seg=6)
    K.torus('painted_grey', ra - 0.26, 0.05, (0, 0, za - 0.165), seg=24, ring_seg=4)
    K.cyl('painted_grey', 0.16, 0.14, (0, 0, za - 0.14), seg=10)
    for i in range(5):
        a = TAU * i / 5
        K.box('painted_dark', (0.62, 0.17, 0.012), pol(0.46, a, za - 0.14), rot=(rad(18), 0, a), bevel=0.0)
    for i in range(6):
        a = TAU * i / 6 + 0.26
        K.tube('painted_grey', [pol(0.1, a, za - 0.22), pol(ra - 0.1, a, za - 0.22)], 0.012, seg=4)
    K.torus('painted_grey', 0.5, 0.01, (0, 0, za - 0.22), seg=16, ring_seg=4)
    anchor('lamp_apex', interior, loc=(0, 0, za - 0.35))

    # --- suspended utility truss with the four main light fixtures --------------------------------
    rv = TRUSS_R / math.cos(rad(22.5))
    vtx = [Vector(pol(rv, rad(22.5 + 45 * i), 0)) for i in range(8)]
    for i in range(8):
        a, b = vtx[i], vtx[(i + 1) % 8]
        for z in (TRUSS_Z, TRUSS_Z + 0.26):
            K.tube('aluminium', [a + Vector((0, 0, z)), b + Vector((0, 0, z))], 0.022, seg=6, caps=False)
        n = 6
        for j in range(n):
            p0 = a.lerp(b, j / n) + Vector((0, 0, TRUSS_Z + (0.26 if j % 2 else 0)))
            p1 = a.lerp(b, (j + 1) / n) + Vector((0, 0, TRUSS_Z + (0 if j % 2 else 0.26)))
            K.tube('aluminium', [p0, p1], 0.011, seg=4, caps=False)
        # hanger up to the rib
        K.tube('steel', [a + Vector((0, 0, TRUSS_Z + 0.26)), a + Vector((0, 0, roof_z_in(rv) - 0.1))], 0.009, seg=4)
        K.cyl('aluminium', 0.04, 0.34, a + Vector((0, 0, TRUSS_Z + 0.13)), seg=6)
        ang = rad(45 * i + 45)
        mid = (a + b) / 2
        rot = (0, 0, ang + math.pi / 2)
        if i % 2 == 0:
            # main fixture: housing, diffuser, end caps
            K.box('painted_white', (1.7, 0.46, 0.10), mid + Vector((0, 0, TRUSS_Z - 0.10)), rot=rot, bevel=0.02)
            K.box('light_white', (1.56, 0.34, 0.03), mid + Vector((0, 0, TRUSS_Z - 0.16)), rot=rot, bevel=0.008)
            for s in (-0.6, 0.6):
                off = Vector((-math.sin(ang), math.cos(ang), 0)) * s
                K.tube('steel', [mid + off + Vector((0, 0, TRUSS_Z - 0.05)), mid + off + Vector((0, 0, TRUSS_Z))], 0.008, seg=4)
            anchor(f'light_{i // 2}', interior, loc=tuple(mid + Vector((0, 0, TRUSS_Z - 0.3))))
        else:
            # two track spots aimed outwards at the stations, and a junction box
            out = Vector((math.cos(ang), math.sin(ang), 0))
            for s in (-0.7, 0.7):
                off = Vector((-math.sin(ang), math.cos(ang), 0)) * s
                c = mid + off + Vector((0, 0, TRUSS_Z - 0.12)) + out * 0.05
                K.cyl('painted_dark', 0.065, 0.17, c, seg=8, r2=0.085, rot=(0, rad(-128), ang))
                K.cyl('light_white', 0.07, 0.012, c + out * 0.07 - Vector((0, 0, 0.055)), seg=8, rot=(0, rad(-128), ang))
                K.tube('steel', [mid + off + Vector((0, 0, TRUSS_Z)), c], 0.008, seg=4)
            K.box('painted_grey', (0.3, 0.14, 0.18), mid + Vector((0, 0, TRUSS_Z + 0.13)), rot=rot, bevel=0.012)
    # cable loom lying along the top chord
    loom = []
    for i in range(9):
        a, b = vtx[i % 8], vtx[(i + 1) % 8]
        loom += [a * 0.992 + Vector((0, 0, TRUSS_Z + 0.31)), ((a + b) / 2) * 0.992 + Vector((0, 0, TRUSS_Z + 0.285))]
    K.tube('plastic_black', loom[:-1], 0.016, seg=5)
    # feed from the loom up to the apex
    K.tube('plastic_black', spline([vtx[2] * 0.992 + Vector((0, 0, TRUSS_Z + 0.31)), vtx[2] * 0.6 + Vector((0, 0, roof_z_in(rv * 0.6) - 0.22)),
                                    vtx[2] * 0.33 + Vector((0, 0, za - 0.1))], 3), 0.014, seg=5)

    # --- ventilation ring main ----------------------------------------------------------------
    DR, DZ, dr = 7.62, 3.46, 0.135
    ring = [Vector(pol(DR, rib_ang(k), DZ)) for k in range(N_GORE)]
    K.tube('painted_white', ring + [ring[0], ring[1]], dr, seg=8, caps=False)
    for k in range(N_GORE):
        th = rib_ang(k)
        K.cyl('painted_orange' if k % 6 == 0 else 'painted_grey', dr + 0.02, 0.05, ring[k], seg=8, axis='Y', rot=(0, 0, th), caps=False)
        if k % 2 == 0:
            # bracket back to the rib
            r_rib = math.sqrt(max(0.0, 1 - ((DZ + 0.25 - Z0_IN) / C_IN) ** 2)) * A_IN - 0.12
            K.tube('painted_grey', [pol(DR, th, DZ + dr), pol(DR, th, DZ + 0.27), pol(r_rib, th, DZ + 0.27)], 0.016, seg=4)
            K.tube('painted_grey', [pol(DR + 0.1, th, DZ - dr * 0.7), pol(r_rib + 0.02, th, DZ - 0.42)], 0.012, seg=4)
        else:
            # diffuser dropping from the main
            p = Vector(pol(DR - 0.02, gore_mid(k), DZ)) * math.cos(GORE / 2)
            p.z = DZ - dr - 0.02
            K.cyl('painted_white', 0.09, 0.16, p - Vector((0, 0, 0.04)), seg=8, caps=False)
            K.cyl('painted_white', 0.10, 0.07, p - Vector((0, 0, 0.15)), seg=8, r2=0.19)
            K.cyl('painted_dark', 0.15, 0.012, p - Vector((0, 0, 0.19)), seg=8)

    # --- perimeter raceway at the foot of the wall --------------------------------------------
    half = math.asin(1.37 / 8.15)
    K.lathe('painted_grey', [(8.13, FLOOR_Z - 0.02), (8.13, FLOOR_Z + 0.11), (8.16, FLOOR_Z + 0.14), (8.43, FLOOR_Z + 0.14)],
            seg=46, rot=(0, 0, -math.pi / 2 + half), arc=TAU - 2 * half, cap_start=False, cap_end=False)
    for i in range(46):
        th = -math.pi / 2 + half + (TAU - 2 * half) * (i + 0.5) / 46
        if i % 6 == 0:
            add_box(K.bm('painted_dark', 0.0), (0.012, 0.36, 0.05), pol(8.125, th, FLOOR_Z + 0.055), rot=(0, 0, th))
    # two conduit runs round the wall, clipped to the ribs
    for z, rr, m in ((0.52, 0.024, 'painted_grey'), (0.60, 0.018, 'painted_orange'), (2.56, 0.024, 'painted_grey')):
        pts = [Vector(pol(A_IN - 0.155, rib_ang(k), z)) for k in range(2, N_GORE)]
        K.tube(m, pts, rr, seg=4)
    for k in range(2, N_GORE):
        th = rib_ang(k)
        add_box(K.bm('steel', 0.0), (0.05, 0.10, 0.16), pol(A_IN - 0.15, th, 0.56), rot=(0, 0, th))
        add_box(K.bm('steel', 0.0), (0.05, 0.10, 0.07), pol(A_IN - 0.15, th, 2.56), rot=(0, 0, th))

    # --- four ladder trays from the eave up to the truss ------------------------------------------
    for i in range(4):
        a = rad(90 * i)
        p0, p1 = Vector(pol(8.02, a, 3.30)), Vector(pol(TRUSS_R + 0.02, a, TRUSS_Z + 0.30))
        d = p1 - p0
        ln = d.length
        side = Vector((-math.sin(a), math.cos(a), 0))
        rot = (0, -math.asin(d.z / ln), math.atan2(d.y, d.x))
        for s in (-0.16, 0.16):
            add_box(K.bm('painted_grey', 0.0), (ln, 0.025, 0.07), (p0 + p1) / 2 + side * s, rot=rot)
        for j in range(9):
            add_box(K.bm('painted_grey', 0.0), (0.03, 0.32, 0.02), p0.lerp(p1, (j + 0.5) / 9) - Vector((0, 0, 0.02)), rot=rot)
        for s, m, rr in ((-0.08, 'plastic_black', 0.022), (0.0, 'painted_orange', 0.016), (0.07, 'plastic_black', 0.018)):
            K.tube(m, [p0 + side * s + Vector((0, 0, 0.012)), p1 + side * s + Vector((0, 0, 0.012))], rr, seg=4)
        K.tube('steel', [p0.lerp(p1, 0.5), p0.lerp(p1, 0.5) + Vector((0, 0, roof_z_in(p0.lerp(p1, 0.5).to_2d().length) - p0.lerp(p1, 0.5).z - 0.1))], 0.008, seg=3)

    # --- grow-light rig hung over the six farm plots ----------------------------------------------
    GZ = 2.42
    for x in (-5.2, -3.2):
        K.box('aluminium', (0.04, 6.9, 0.05), (x, 0.8, GZ + 0.08), bevel=0.0)
        for y in (-2.5, 0.8, 4.1):
            top = roof_z_in(math.hypot(x, y)) - 0.1
            K.tube('steel', [(x, y, GZ + 0.1), (x, y, top)], 0.006, seg=3)
    for y in (-2.6, 2.0, 4.2):
        add_box(K.bm('aluminium', 0.0), (2.04, 0.03, 0.03), (-4.2, y, GZ + 0.08))
    gi = 0
    for y in (3.2, 0.8, -1.6):
        for x in (-5.2, -3.2):
            for dy in (-0.42, 0.42):
                K.box('painted_grey', (1.46, 0.13, 0.05), (x, y + dy, GZ + 0.03), bevel=0.008)
                add_box(K.bm('light_grow', 0.0), (1.38, 0.085, 0.012), (x, y + dy, GZ))
            anchor(f'lamp_grow_{gi}', interior, loc=(x, y, GZ - 0.15))
            gi += 1
    K.tube('plastic_black', sag((-5.2, 4.25, GZ + 0.11), (-6.95, 4.02, 2.58), 0.2, 5), 0.012, seg=4)

    # --- inside faces of the windows ------------------------------------------------------------
    for g in WINDOWS:
        th = gore_mid(g)
        R0 = 8.30
        rot = (0, rad(-90), th)
        K.lathe('painted_grey', [(0.37, -0.16), (0.37, 0.05), (0.35, 0.075), (0.30, 0.075), (0.275, 0.035)],
                loc=pol(R0, th, WIN_Z), seg=12, rot=rot, cap_start=False, cap_end=False, smooth=50.0)
        K.lathe('glass_dark', [(0.0, 0.035), (0.277, 0.035)], loc=pol(R0, th, WIN_Z), seg=12, rot=rot,
                cap_start=False, cap_end=False, smooth=30.0)
    K.finish()


def hab_floor(interior):
    K = Kit('floor', interior)
    z = FLOOR_Z
    circle = [(8.14 * math.cos(TAU * i / 72), 8.14 * math.sin(TAU * i / 72)) for i in range(72)]
    # sub-floor seen through the seams and the grates
    add_poly(K.open('void'), [(x, y, z - 0.03) for x, y in circle])

    def lines(lo, hi, fixed):
        out = sorted(set(fixed))
        while out[0] > lo:
            out.insert(0, round(out[0] - 1.0, 3))
        while out[-1] < hi:
            out.append(round(out[-1] + 1.0, 3))
        return out
    xs = lines(-8.3, 8.3, [-0.25, 0.25])
    ys = lines(-8.3, 8.3, [-0.65, -0.15, 0.8, 1.75, 2.25])
    rng = random.Random(5)
    tiles = K.open('hab_floor', smooth=30.0)
    tiles_b = K.open('hab_floor_b', smooth=30.0)
    trench = []
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            x0, x1, y0, y1 = xs[i], xs[i + 1], ys[j], ys[j + 1]
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            spine = abs(cx) < 0.2 and -8.0 < cy < 5.6
            ew = (abs(cy + 0.4) < 0.2 and -6.3 < cx < 5.2) or (abs(cy - 2.0) < 0.2 and -6.3 < cx < 0.3)
            poly = clip_convex([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], circle)
            if len(poly) < 3:
                continue
            area = 0.5 * abs(sum(poly[k][0] * poly[(k + 1) % len(poly)][1] - poly[(k + 1) % len(poly)][0] * poly[k][1]
                                 for k in range(len(poly))))
            if area < 0.02:
                continue
            if spine or ew:
                trench.append((x0, x1, y0, y1, spine, poly))
                continue
            top = inset_poly(poly, 0.011)
            bm = tiles_b if rng.random() < 0.14 else tiles
            tv = [bm.verts.new((x, y, z)) for x, y in top]
            bv = [bm.verts.new((x, y, z - 0.02)) for x, y in poly]
            bm.faces.new(tv)
            n = len(tv)
            for k in range(n):
                bm.faces.new((tv[k], bv[k], bv[(k + 1) % n], tv[(k + 1) % n]))
            # lifting sockets in two corners of full tiles
            if area > 0.95 and (i + j) % 3 == 0:
                for sx, sy in ((x0 + 0.09, y0 + 0.09), (x1 - 0.09, y1 - 0.09)):
                    add_quad(K.open('painted_dark', smooth=31.0), (sx - 0.022, sy - 0.022, z + 0.002), (sx + 0.022, sy - 0.022, z + 0.002),
                             (sx + 0.022, sy + 0.022, z + 0.002), (sx - 0.022, sy + 0.022, z + 0.002))
    # grated cable trenches
    slat = K.open('steel', smooth=31.0)
    rail = K.bm('painted_grey', 0.0)
    for (x0, x1, y0, y1, spine, poly) in trench:
        if len(poly) != 4:
            continue
        along_y = spine and not (abs((y0 + y1) / 2 + 0.4) < 0.2 or abs((y0 + y1) / 2 - 2.0) < 0.2)
        if along_y:
            n = max(1, round((y1 - y0) / 0.125))
            for k in range(n):
                yy = y0 + (y1 - y0) * (k + 0.5) / n
                add_quad(slat, (x0 + 0.04, yy - 0.036, z - 0.002), (x1 - 0.04, yy - 0.036, z - 0.002),
                         (x1 - 0.04, yy + 0.036, z - 0.002), (x0 + 0.04, yy + 0.036, z - 0.002))
            for xx in (x0 + 0.02, x1 - 0.02):
                add_box(rail, (0.04, y1 - y0, 0.03), (xx, (y0 + y1) / 2, z - 0.015))
        else:
            n = max(1, round((x1 - x0) / 0.125))
            for k in range(n):
                xx = x0 + (x1 - x0) * (k + 0.5) / n
                add_quad(slat, (xx - 0.036, y0 + 0.04, z - 0.002), (xx + 0.036, y0 + 0.04, z - 0.002),
                         (xx + 0.036, y1 - 0.04, z - 0.002), (xx - 0.036, y1 - 0.04, z - 0.002))
            for yy in (y0 + 0.02, y1 - 0.02):
                add_box(rail, ((x1 - x0), 0.04, 0.03), ((x0 + x1) / 2, yy, z - 0.015))
    # hazard chevrons inside the door and the station names stencilled on the floor
    paint = K.open('painted_yellow', smooth=32.0)
    for k in range(9):
        x0 = -1.08 + k * 0.24
        add_quad(paint, (x0, -7.86, z + 0.003), (x0 + 0.12, -7.86, z + 0.003), (x0 + 0.24, -7.62, z + 0.003), (x0 + 0.12, -7.62, z + 0.003))
    for sy in (-7.9, -7.58):
        add_quad(paint, (-1.1, sy - 0.02, z + 0.003), (1.2, sy - 0.02, z + 0.003), (1.2, sy + 0.02, z + 0.003), (-1.1, sy + 0.02, z + 0.003))
    for label, (sx, sy), dist, size in (('O2', (5.6, 3.6), 1.42, 0.3), ('H2O', (5.9, 0.4), 1.42, 0.3), ('N2H4', (5.5, -2.6), 1.32, 0.26),
                                        ('FOOD', (4.2, -4.8), 1.3, 0.26), ('COMMS', (0.0, 6.6), 1.52, 0.26), ('FAB', (-4.45, -4.1), 0.95, 0.28),
                                        ('BUNK', (-3.3, 5.35), 0.0, 0.24)):
        d = math.hypot(sx, sy)
        px, py = sx - sx / d * dist, sy - sy / d * dist
        yaw = math.atan2(sy, sx) - math.pi / 2 if label != 'BUNK' else rad(111)
        bmt = K.open('painted_yellow', smooth=32.0)
        n0 = len(bmt.verts)
        me = text_mesh(label, size)
        bmt.from_mesh(me)
        bpy.data.meshes.remove(me)
        bmt.verts.ensure_lookup_table()
        xform(bmt, bmt.verts[n0:], (px, py, z + 0.003), rot=(0, 0, yaw))
    # aisle lines from the door to the middle, and a ring with ticks where the trenches cross
    white = K.open('plastic_white', smooth=33.0)
    for sx in (-0.62, 0.62):
        add_quad(white, (sx - 0.025, -7.45, z + 0.003), (sx + 0.025, -7.45, z + 0.003), (sx + 0.025, -2.35, z + 0.003), (sx - 0.025, -2.35, z + 0.003))
    cy, n = -0.4, 72
    for i in range(n):
        a0, a1 = TAU * i / n, TAU * (i + 1) / n
        am = (a0 + a1) / 2
        if abs(1.8 * math.cos(am)) < 0.33 or abs(1.8 * math.sin(am)) < 0.33:
            continue
        add_quad(white, (1.76 * math.cos(a0), cy + 1.76 * math.sin(a0), z + 0.003), (1.84 * math.cos(a0), cy + 1.84 * math.sin(a0), z + 0.003),
                 (1.84 * math.cos(a1), cy + 1.84 * math.sin(a1), z + 0.003), (1.76 * math.cos(a1), cy + 1.76 * math.sin(a1), z + 0.003))
    for i in range(8):
        a = TAU * (i + 0.5) / 8
        c, s_ = math.cos(a), math.sin(a)
        add_quad(white, (1.5 * c + 0.02 * s_, cy + 1.5 * s_ - 0.02 * c, z + 0.003), (1.74 * c + 0.02 * s_, cy + 1.74 * s_ - 0.02 * c, z + 0.003),
                 (1.74 * c - 0.02 * s_, cy + 1.74 * s_ + 0.02 * c, z + 0.003), (1.5 * c - 0.02 * s_, cy + 1.5 * s_ + 0.02 * c, z + 0.003))
    for f in white.faces:
        f.normal_update()
        if f.normal.z < 0:
            f.normal_flip()
    # cables lying in the trenches
    for off, m, rr in ((-0.13, 'painted_orange', 0.018), (-0.02, 'painted_blue', 0.014), (0.1, 'painted_yellow', 0.016)):
        K.tube(m, [(off, -8.0, z - 0.012), (off, 5.6, z - 0.012)], rr, seg=4)
        K.tube(m, [(-6.3, -0.4 + off, z - 0.012), (5.2, -0.4 + off, z - 0.012)], rr, seg=4)
        K.tube(m, [(-6.3, 2.0 + off, z - 0.012), (0.3, 2.0 + off, z - 0.012)], rr, seg=4)
    K.finish()


# ----------------------------------------------------------------------------------------------
# Hab: stations. Each is built in its own frame: origin on the floor at the station's point,
# front toward local -Y (the middle of the room), the wall behind at local +Y.
# ----------------------------------------------------------------------------------------------
def station_kit(name, interior, x, y, yaw=None):
    th = math.atan2(y, x)
    return Kit(name, interior, loc=(x, y, FLOOR_Z), yaw=th - math.pi / 2 if yaw is None else yaw)


def floor_marks(K, w=1.6, y=-0.95, m='painted_yellow'):
    """Painted work-zone marks on the floor in front of a station."""
    for sx in (-1, 1):
        add_box(K.bm(m, 0.0), (0.34, 0.05, 0.004), (sx * (w / 2 - 0.17), y, 0.003))
        add_box(K.bm(m, 0.0), (0.05, 0.30, 0.004), (sx * (w / 2 - 0.025), y + 0.175, 0.003))
    add_box(K.bm(m, 0.0), (0.30, 0.05, 0.004), (0, y, 0.003))


def fan_grille(K, c, r, blades=5):
    """A guarded fan set in a bezel, facing local -Y."""
    x, y, z = c
    K.cyl('void', r, 0.01, (x, y + 0.012, z), seg=14, axis='Y')
    K.lathe('painted_grey', [(r, 0.0), (r + 0.05, 0.0), (r + 0.05, 0.03), (r + 0.025, 0.05), (r, 0.05)], loc=(x, y + 0.012, z),
            seg=14, axis='Y', rot=(0, 0, math.pi), cap_start=False, cap_end=False)
    K.cyl('painted_dark', r * 0.26, 0.05, (x, y - 0.01, z), seg=8, axis='Y')
    for i in range(blades):
        a = TAU * i / blades + 0.3
        add_box(K.bm('painted_dark', 0.0), (r * 0.72, 0.01, r * 0.34), (x + math.cos(a) * r * 0.55, y - 0.008, z + math.sin(a) * r * 0.55),
                rot=(0.4, -a, 0))
    for rr in (r * 0.5, r * 0.86):
        K.torus('steel', rr, 0.007, (x, y - 0.04, z), seg=12, ring_seg=3, axis='Y')
    for i in range(3):
        a = math.pi * i / 3
        d = Vector((math.cos(a), 0, math.sin(a))) * r
        K.tube('steel', [Vector((x, y - 0.04, z)) - d, Vector((x, y - 0.04, z)) + d], 0.006, seg=3)


def louvres(K, c, w, h, n=6, m='painted_grey'):
    """A slatted vent panel facing local -Y, centred on c."""
    x, y, z = c
    K.box('painted_dark', (w, 0.02, h), (x, y + 0.008, z), bevel=0.0)
    for i in range(n):
        zz = z - h / 2 + h * (i + 0.5) / n
        add_box(K.bm(m, 0.0), (w - 0.03, 0.012, h / n * 0.72), (x, y - 0.012, zz), rot=(rad(-32), 0, 0))
    for sx in (-1, 1):
        add_box(K.bm(m, 0.0), (0.025, 0.035, h + 0.03), (x + sx * w / 2, y - 0.008, z))
    for sz in (-1, 1):
        add_box(K.bm(m, 0.0), (w + 0.025, 0.035, 0.025), (x, y - 0.008, z + sz * h / 2))


def switch_row(K, c, n=4, pitch=0.06, m='steel'):
    x, y, z = c
    add_box(K.bm('painted_dark', 0.0), (pitch * n + 0.03, 0.008, 0.07), (x, y, z))
    for i in range(n):
        xx = x + (i - (n - 1) / 2) * pitch
        K.tube(m, [(xx, y, z), (xx, y - 0.03, z + (0.012 if i % 2 else -0.012))], 0.006, seg=4)


def jerrycan(K, loc, m='painted_blue', yaw=0.0, s=1.0):
    x, y, z = loc
    K.box(m, (0.34 * s, 0.17 * s, 0.42 * s), (x, y, z + 0.21 * s), rot=(0, 0, yaw), bevel=0.035 * s, seg=1)
    K.cyl('plastic_black', 0.03 * s, 0.04 * s, (x + 0.1 * s * math.cos(yaw), y + 0.1 * s * math.sin(yaw), z + 0.44 * s), seg=6)
    K.handle(m, (x - 0.09 * s * math.cos(yaw), y - 0.09 * s * math.sin(yaw), z + 0.41 * s),
             (x + 0.03 * s * math.cos(yaw), y + 0.03 * s * math.sin(yaw), z + 0.41 * s), (0, 0, 0.05 * s), r=0.012 * s, seg=5)


def extinguisher(K, loc):
    x, y, z = loc
    K.lathe('painted_red', tank_profile(0.075, 0.46, dome=0.05, neck=0.02), loc=(x, y, z), seg=10)
    K.cyl('painted_dark', 0.025, 0.06, (x, y, z + 0.49), seg=6)
    K.tube('painted_dark', [(x, y, z + 0.5), (x + 0.11, y, z + 0.53)], 0.01, seg=4)
    K.hose('rubber', [(x, y - 0.02, z + 0.5), (x - 0.08, y - 0.05, z + 0.42), (x - 0.09, y - 0.04, z + 0.2)], 0.012, seg=4, n=3)


def st_oxygenator(interior):
    """Tall electrolysis cabinet: fan, louvres, control fascia with the status lamp, O2 bottles."""
    K = station_kit('oxygenator', interior, 5.6, 3.6)
    W, D, H = 1.26, 0.95, 2.1
    cx, yb = -0.24, 0.36
    yf = yb - D / 2
    K.box('painted_dark', (W - 0.08, D - 0.08, 0.14), (cx, yb, 0.07), bevel=0.01)
    K.box('painted_white', (W, D, H - 0.12), (cx, yb, 0.12 + (H - 0.12) / 2), bevel=0.035, seg=2)
    K.box('painted_grey', (W + 0.012, D + 0.012, 0.10), (cx, yb, 0.30), bevel=0.006)
    K.box('painted_grey', (W + 0.012, D + 0.012, 0.05), (cx, yb, H - 0.10), bevel=0.006)
    # seams between the bays
    add_box(K.bm('painted_dark', 0.0), (0.012, 0.01, H - 0.5), (cx + 0.02, yf - 0.002, 1.18))
    add_box(K.bm('painted_dark', 0.0), (0.60, 0.01, 0.012), (cx - 0.3, yf - 0.002, 1.20))
    # left bay: fan above, louvred intake below
    fan_grille(K, (cx - 0.30, yf - 0.012, 1.60), 0.25)
    louvres(K, (cx - 0.30, yf - 0.012, 0.76), 0.5, 0.62, n=7)
    # right bay: the control fascia
    fx = cx + 0.33
    K.box('painted_dark', (0.50, 0.03, 0.98), (fx, yf - 0.012, 1.50), bevel=0.012)
    add_box(K.bm('painted_grey', 0.0), (0.38, 0.012, 0.25), (fx, yf - 0.03, 1.74))
    add_box(K.bm('screen', 0.0), (0.33, 0.012, 0.20), (fx, yf - 0.034, 1.74))
    gauge(K, (fx - 0.11, yf - 0.027, 1.47), 0.062, needle=0.7, rim='steel')
    gauge(K, (fx + 0.11, yf - 0.027, 1.47), 0.062, needle=0.45, rim='steel')
    switch_row(K, (fx, yf - 0.03, 1.31), 5, 0.07)
    add_box(K.bm('painted_orange', 0.0), (0.40, 0.01, 0.035), (fx, yf - 0.03, 1.235))
    handwheel(K, (fx - 0.1, yf - 0.02, 1.12), 0.06, stem=0.05)
    add_box(K.bm('light_amber', 0.0), (0.04, 0.012, 0.04), (fx + 0.07, yf - 0.03, 1.12))
    add_box(K.bm('light_green', 0.0), (0.04, 0.012, 0.04), (fx + 0.15, yf - 0.03, 1.12))
    # status lamp in a hooded bezel on top of the fascia (the lens is the part)
    K.lathe('painted_dark', [(0.075, 0.0), (0.105, 0.0), (0.105, 0.05), (0.09, 0.065), (0.075, 0.065)], loc=(fx, yf, 1.92),
            seg=12, axis='Y', rot=(0, 0, math.pi), cap_start=False, cap_end=False)
    add_box(K.bm('painted_dark', 0.0), (0.26, 0.11, 0.015), (fx, yf - 0.05, 2.03))
    lamp = K.part('status_oxy', (fx, yf - 0.02, 1.92))
    lamp.lathe('light_green', [(0.078, 0.0), (0.072, 0.03), (0.05, 0.052), (0.0, 0.062)], seg=12, axis='Y', rot=(0, 0, math.pi),
               cap_start=False)
    lamp.finish()
    # big label
    K.box('painted_yellow', (0.46, 0.012, 0.30), (fx, yf - 0.004, 0.72), bevel=0.0)
    K.text('painted_dark', 'O2', 0.24, (fx, yf - 0.012, 0.72))
    add_box(K.bm('painted_dark', 0.0), (0.46, 0.013, 0.03), (fx, yf - 0.004, 0.52))
    # the exposed left flank: a vent, a seam and a service plate
    xl = cx - W / 2
    for i in range(6):
        add_box(K.bm('painted_grey', 0.0), (0.012, 0.5, 0.045), (xl - 0.006, yb, 1.50 + i * 0.075), rot=(0, rad(28), 0))
    add_box(K.bm('painted_dark', 0.0), (0.008, 0.56, 0.5), (xl + 0.002, yb, 1.69))
    add_box(K.bm('painted_dark', 0.0), (0.01, D - 0.1, 0.012), (xl - 0.001, yb, 1.20))
    K.box('painted_grey', (0.016, 0.44, 0.4), (xl - 0.004, yb, 0.78), bevel=0.006)
    # grab handles and corner bolts
    for sx in (-1, 1):
        K.handle('steel', (cx + sx * (W / 2 - 0.05), yf, 0.95), (cx + sx * (W / 2 - 0.05), yf, 1.45), (0, -0.06, 0), r=0.013)
    K.bolts('steel', [(cx + sx * (W / 2 - 0.05), yf - 0.004, z) for sx in (-1, 1) for z in (0.42, 1.95)], r=0.014, h=0.012, axis='Y')
    # two oxygen bottles racked on the right, strapped to the cabinet
    tx = cx + W / 2 + 0.245
    K.box('painted_grey', (0.50, 0.92, 0.08), (tx, yb, 0.16), bevel=0.012)
    for ty in (yb - 0.23, yb + 0.23):
        K.lathe('painted_white', tank_profile(0.19, 1.42, dome=0.14, neck=0.035), loc=(tx, ty, 0.20), seg=14)
        K.lathe('painted_green', [(0.193, 0.0), (0.193, 0.22)], loc=(tx, ty, 1.18), seg=14, cap_start=False, cap_end=False)
        K.cyl('aluminium', 0.04, 0.10, (tx, ty, 1.67), seg=8)
        K.cyl('painted_green', 0.055, 0.03, (tx, ty, 1.74), seg=8)
        K.box('steel', (0.07, 0.05, 0.05), (tx - 0.06, ty, 1.66), bevel=0.006)
        K.hose('steel', [(tx - 0.09, ty, 1.66), (tx - 0.17, ty, 1.80), (tx - 0.2, ty * 0.6 + yb * 0.4, 1.96), (cx + W / 2 - 0.02, yb, 1.98)],
               0.014, seg=5, n=3)
    gauge(K, (tx, yb - 0.23 - 0.045, 1.66), 0.04, needle=0.8, rim='steel')
    for z in (0.62, 1.12):
        K.box('steel', (0.46, 0.90, 0.035), (tx - 0.02, yb, z), bevel=0.0)
        add_box(K.bm('painted_white', 0.0), (0.2, 0.84, 0.06), (tx - 0.15, yb, z))
    # on top: the electrolysis stack on saddles, the intake duct rising to the ring main
    sz = H + 0.27
    K.cyl('painted_blue', 0.17, 0.80, (cx + 0.12, yb + 0.05, sz), seg=12, axis='X')
    for i in range(6):
        K.cyl('steel', 0.21, 0.025, (cx + 0.12 - 0.40 + i * 0.16, yb + 0.05, sz), seg=12, axis='X')
    for a in (0.6, 2.2, 3.8, 5.4):
        K.tube('steel', [(cx - 0.31, yb + 0.05 + 0.195 * math.cos(a), sz + 0.195 * math.sin(a)),
                         (cx + 0.55, yb + 0.05 + 0.195 * math.cos(a), sz + 0.195 * math.sin(a))], 0.008, seg=4)
    for sx in (-0.2, 0.44):
        K.box('painted_grey', (0.05, 0.34, 0.10), (cx + sx, yb + 0.05, H + 0.04), bevel=0.008)
    K.pipe('copper', [(cx + 0.55, yb + 0.05, sz), (cx + 0.70, yb + 0.05, sz), (cx + 0.70, yb + 0.05, H - 0.02)], 0.018, seg=6, bend=0.05)
    K.pipe('copper', [(cx - 0.31, yb + 0.05, sz + 0.02), (cx - 0.42, yb + 0.05, sz + 0.02), (cx - 0.42, yb + 0.3, sz + 0.3),
                      (cx - 0.42, 1.62, sz + 0.3)], 0.018, seg=6, bend=0.06)
    ring_y = 7.62 * math.cos(rad(3.3)) - math.hypot(5.6, 3.6)
    K.cyl('painted_grey', 0.17, 0.05, (cx - 0.33, yb - 0.12, H + 0.02), seg=10)
    K.pipe('painted_white', [(cx - 0.33, yb - 0.12, H), (cx - 0.33, yb - 0.12, 2.80), (cx - 0.33, ring_y - 0.03, 3.22), (cx - 0.33, ring_y - 0.03, 3.38)],
           0.12, seg=8, bend=0.3)
    for z in (2.35, 2.7):
        K.cyl('painted_grey', 0.128, 0.04, (cx - 0.33, yb - 0.12, z), seg=8, caps=False)
    floor_marks(K, 1.8, -0.72)
    K.anchor('col_oxygenator', (0.0, 0.33, 0), radius=1.15)
    K.finish()


def st_reclaimer(interior):
    """Water reclaimer: a skid of tanks, filters, a pump and pipework, with a pipe bridge to the wall."""
    K = station_kit('reclaimer', interior, 5.9, 0.4)
    yb = 0.42
    K.box('painted_dark', (1.86, 1.16, 0.07), (0, yb, 0.105), bevel=0.012)
    add_box(K.bm('painted_dark', 0.0), (1.86, 1.16, 0.03), (0, yb, 0.155))
    for sx in (-0.86, 0.86):
        for sy in (-0.5, 0.5):
            K.box('aluminium', (0.055, 0.055, 1.95), (sx, yb + sy, 1.045), bevel=0.006)
            K.cyl('steel', 0.05, 0.07, (sx, yb + sy, 0.035), seg=8)
        K.box('aluminium', (0.05, 1.0, 0.05), (sx, yb, 2.0), bevel=0.006)
        K.box('aluminium', (0.04, 1.0, 0.04), (sx, yb, 1.1), bevel=0.0)
    for sy in (-0.5, 0.5):
        K.box('aluminium', (1.72, 0.05, 0.05), (0, yb + sy, 2.0), bevel=0.006)
    K.tube('steel', [(-0.86, yb + 0.5, 0.2), (0.86, yb + 0.5, 1.98)], 0.012, seg=4)
    # tank A: reclaimed water, white with a blue band and a sight glass
    ax, ay = -0.46, yb + 0.12
    K.lathe('painted_white', tank_profile(0.34, 1.58, dome=0.2), loc=(ax, ay, 0.24), seg=14)
    K.lathe('painted_blue', [(0.345, 0.0), (0.345, 0.2)], loc=(ax, ay, 1.3), seg=14, cap_start=False, cap_end=False)
    for z in (0.5, 1.22):
        K.lathe('steel', [(0.347, -0.02), (0.354, 0.0), (0.347, 0.02)], loc=(ax, ay, z), seg=14, cap_start=False, cap_end=False)
    K.lathe('painted_grey', [(0.24, 0.0), (0.27, 0.0), (0.27, 0.12), (0.24, 0.12)], loc=(ax, ay, 0.14), seg=10, cap_start=False, cap_end=False)
    K.cyl('aluminium', 0.06, 0.08, (ax, ay, 1.84), seg=8)
    K.cyl('painted_blue', 0.085, 0.025, (ax, ay, 1.89), seg=8)
    sgx, sgy = ax + 0.25, ay - 0.27
    K.tube('plastic_white', [(sgx, sgy, 0.55), (sgx, sgy, 1.2)], 0.022, seg=6)
    K.tube('painted_blue', [(sgx, sgy, 0.62), (sgx, sgy, 0.95)], 0.026, seg=6)
    for z in (0.53, 1.22):
        K.box('steel', (0.06, 0.07, 0.04), (sgx - 0.01, sgy + 0.02, z), bevel=0.005)
    K.box('painted_blue', (0.40, 0.012, 0.19), (ax + 0.02, ay - 0.356, 0.80), bevel=0.0)
    K.text('plastic_white', 'H2O', 0.13, (ax + 0.02, ay - 0.364, 0.80))
    # tank B: potable, blue
    bx, by = 0.16, yb + 0.26
    K.lathe('painted_blue', tank_profile(0.25, 1.22, dome=0.16), loc=(bx, by, 0.36), seg=14)
    K.lathe('steel', [(0.255, -0.02), (0.262, 0.0), (0.255, 0.02)], loc=(bx, by, 1.2), seg=14, cap_start=False, cap_end=False)
    for a in (0.8, 2.9, 5.0):
        K.tube('painted_grey', [(bx + 0.2 * math.cos(a), by + 0.2 * math.sin(a), 0.45), (bx + 0.27 * math.cos(a), by + 0.27 * math.sin(a), 0.14)], 0.016, seg=4)
    K.cyl('aluminium', 0.05, 0.07, (bx, by, 1.6), seg=8)
    # filter bank hanging from a manifold
    fx, fy = 0.60, yb - 0.30
    K.box('painted_grey', (0.56, 0.14, 0.12), (fx, fy, 1.66), bevel=0.014)
    for i in range(3):
        xx = fx - 0.18 + i * 0.18
        K.lathe('plastic_white', [(0.0, 0.0), (0.05, 0.0), (0.075, 0.03), (0.075, 0.52), (0.085, 0.52), (0.085, 0.58), (0.0, 0.58)],
                loc=(xx, fy, 1.02), seg=10)
        K.lathe('painted_blue', [(0.078, 0.0), (0.078, 0.1)], loc=(xx, fy, 1.07), seg=10, cap_start=False, cap_end=False)
        K.cyl('steel', 0.02, 0.05, (xx, fy, 1.0), seg=6)
    # pump: finned motor and volute on a plinth
    px, py = 0.52, yb - 0.02
    K.box('painted_grey', (0.56, 0.3, 0.08), (px, py, 0.21), bevel=0.01)
    K.cyl('painted_green', 0.12, 0.30, (px + 0.08, py, 0.40), seg=12, axis='X')
    for i in range(5):
        K.cyl('painted_green', 0.14, 0.015, (px - 0.02 + i * 0.05, py, 0.40), seg=12, axis='X')
    K.cyl('steel', 0.15, 0.09, (px - 0.15, py, 0.40), seg=12, axis='X', bevel=0.008)
    K.cyl('painted_dark', 0.09, 0.05, (px + 0.25, py, 0.40), seg=10, axis='X')
    # distiller drum on the top rails, foil wrapped
    dz = 2.0 + 0.27
    K.cyl('gold_foil', 0.215, 0.96, (-0.1, yb + 0.02, dz), seg=14, axis='X')
    cap = [(0.215, 0.0), (0.225, 0.0), (0.225, 0.05), (0.15, 0.11), (0.0, 0.13)]
    K.lathe('painted_white', cap, loc=(0.38, yb + 0.02, dz), seg=14, axis='X')
    K.lathe('painted_white', cap, loc=(-0.58, yb + 0.02, dz), seg=14, axis='X', rot=(0, 0, math.pi))
    for sx in (-0.4, 0.2):
        K.box('painted_grey', (0.06, 1.02, 0.06), (sx, yb, 2.05), bevel=0.006)
        K.lathe('steel', [(0.218, -0.02), (0.226, -0.02), (0.226, 0.02), (0.218, 0.02)], loc=(sx, yb + 0.02, dz), seg=14, axis='X',
                cap_start=False, cap_end=False)
    # control box on the front left post
    cxb, cyb = -0.56, yb - 0.60
    K.box('painted_white', (0.46, 0.15, 0.62), (cxb, cyb, 1.36), bevel=0.02)
    add_box(K.bm('painted_grey', 0.0), (0.33, 0.012, 0.21), (cxb, cyb - 0.078, 1.50))
    add_box(K.bm('screen', 0.0), (0.29, 0.012, 0.17), (cxb, cyb - 0.082, 1.50))
    gauge(K, (cxb - 0.1, cyb - 0.075, 1.27), 0.055, needle=0.55, rim='steel')
    gauge(K, (cxb + 0.1, cyb - 0.075, 1.27), 0.055, needle=0.3, rim='steel')
    for i, m in enumerate(('light_green', 'light_blue', 'light_amber')):
        add_box(K.bm(m, 0.0), (0.035, 0.012, 0.035), (cxb - 0.08 + i * 0.08, cyb - 0.078, 1.14))
    K.box('aluminium', (0.05, 0.12, 0.05), (cxb - 0.2, cyb + 0.1, 1.3), bevel=0.0)
    # pipework
    K.pipe('copper', [(ax, ay, 1.88), (ax, ay, 2.05), (ax + 0.1, yb + 0.02, dz + 0.3), (-0.25, yb + 0.02, dz + 0.3), (-0.25, yb + 0.02, dz + 0.2)], 0.022, seg=6, bend=0.07)
    K.pipe('copper', [(0.3, yb + 0.02, dz - 0.2), (0.3, yb + 0.02, 1.86), (fx, fy, 1.86), (fx, fy, 1.72)], 0.022, seg=6, bend=0.07)
    K.pipe('painted_grey', [(fx + 0.3, fy, 1.66), (fx + 0.36, fy, 1.66), (fx + 0.36, fy, 0.75), (px - 0.15, py, 0.75), (px - 0.15, py, 0.55)], 0.022, seg=6, bend=0.07)
    K.pipe('painted_blue', [(px - 0.2, py, 0.40), (px - 0.36, py, 0.40), (bx, by - 0.2, 0.40), (bx, by - 0.1, 0.48)], 0.026, seg=6, bend=0.07)
    # front header with two valves
    hy = yb - 0.60
    K.pipe('painted_blue', [(ax + 0.1, ay - 0.3, 0.42), (ax + 0.1, hy, 0.42), (ax + 0.1, hy, 0.78), (0.84, hy, 0.78), (0.84, hy + 0.3, 0.78)], 0.03, seg=8, bend=0.08)
    for xx in (0.05, 0.45):
        K.cyl('steel', 0.045, 0.10, (xx, hy, 0.78), seg=8, axis='X')
        handwheel(K, (xx, hy - 0.03, 0.78), 0.065, stem=0.07)
    for xx in (-0.2, 0.7):
        K.cyl('steel', 0.05, 0.025, (xx, hy, 0.78), seg=8, axis='X')
    # pipe bridge over the walkway to the wall
    wy = R_IN - math.hypot(5.9, 0.4) - 0.16
    for i, (m, r) in enumerate((('painted_blue', 0.03), ('copper', 0.022))):
        xx = bx + 0.1 * i
        K.pipe(m, [(xx, by + 0.05 * i, 1.6), (xx, by + 0.05 * i, 2.42 + 0.09 * i), (xx, wy, 2.42 + 0.09 * i), (xx, wy, 0.75 + 0.2 * i)], r, seg=6, bend=0.09)
    K.box('painted_grey', (0.34, 0.05, 0.05), (bx + 0.05, yb + 1.2, 2.36), bevel=0.0)
    K.tube('steel', [(bx + 0.05, yb + 1.2, 2.38), (bx + 0.05, yb + 1.2, 3.25)], 0.008, seg=4)
    # sign on the top rail, a jerrycan and floor marks
    K.box('painted_blue', (0.74, 0.02, 0.2), (0.35, yb - 0.535, 2.0), bevel=0.004)
    K.text('plastic_white', 'WATER', 0.115, (0.35, yb - 0.548, 2.0))
    jerrycan(K, (1.02, -0.3, 0.0), yaw=rad(70))
    floor_marks(K, 1.9, -0.7)
    K.anchor('col_reclaimer', (0.0, 0.4, 0), radius=1.1)
    K.finish()


def st_hydrazine(interior):
    """The improvised hydrazine still: a fuel tank drip-feeding a catalyst bowl under a hood,
    a taped chimney with a condenser coil, and the flame."""
    K = station_kit('hydrazine', interior, 5.5, -2.6)
    yb = 0.22
    # bench: two equipment cases and a steel tray across them
    crate(K, (0.62, 0.5, 0.56), (-0.36, yb, 0.0), yaw=rad(4))
    crate(K, (0.62, 0.5, 0.56), (0.36, yb + 0.02, 0.0), lid='painted_yellow', yaw=rad(-3))
    tz = 0.58
    K.box('steel', (1.22, 0.74, 0.03), (0, yb, tz + 0.015), bevel=0.006)
    for sx in (-1, 1):
        K.box('steel', (0.025, 0.76, 0.07), (sx * 0.61, yb, tz + 0.05), bevel=0.004)
    for sy in (-1, 1):
        K.box('steel', (1.24, 0.025, 0.07), (0, yb + sy * 0.37, tz + 0.05), bevel=0.004)
    # catalyst bowl on a brick, under a sheet-metal hood
    hx, hy = 0.12, yb
    K.box('painted_dark', (0.2, 0.2, 0.06), (hx, hy, tz + 0.06), bevel=0.006)
    K.lathe('steel', [(0.0, 0.0), (0.06, 0.0), (0.12, 0.05), (0.125, 0.06), (0.11, 0.055), (0.05, 0.015), (0.0, 0.012)], loc=(hx, hy, tz + 0.09), seg=10)
    hz = tz + 0.30
    K.lathe('aluminium', [(0.30, 0.0), (0.30, 0.04), (0.075, 0.36), (0.075, 0.44)], loc=(hx, hy, hz), seg=12, cap_start=False, cap_end=False)
    for a in (0.5, 2.6, 4.7):
        K.tube('steel', [(hx + 0.29 * math.cos(a), hy + 0.29 * math.sin(a), hz + 0.02), (hx + 0.33 * math.cos(a), hy + 0.33 * math.sin(a), tz + 0.03)], 0.008, seg=4)
    # chimney: taped sections, foil wrap, guy wires
    cz0, cz1 = hz + 0.42, 2.02
    K.cyl('aluminium', 0.07, cz1 - cz0, (hx, hy, (cz0 + cz1) / 2), seg=10, caps=False)
    K.cyl('gold_foil', 0.076, 0.34, (hx, hy, cz0 + 0.62), seg=10, caps=False)
    for z in (cz0 + 0.02, cz0 + 0.42, cz0 + 0.82):
        K.cyl('tape', 0.078, 0.05, (hx, hy, z), seg=10, caps=False)
    K.lathe('aluminium', [(0.07, 0.0), (0.095, 0.03), (0.095, 0.05), (0.065, 0.05)], loc=(hx, hy, cz1 - 0.02), seg=10, cap_start=False, cap_end=False)
    for a in (0.2, 2.3, 4.4):
        K.tube('steel', [(hx + 0.08 * math.cos(a), hy + 0.08 * math.sin(a), cz1 - 0.2), (hx + 0.55 * math.cos(a) - 0.12, hy + 0.36 * math.sin(a), tz + 0.07)], 0.005, seg=3)
    # condenser coil round the upper chimney, dripping into a jug
    coil = []
    for i in range(29):
        a = TAU * i / 7
        coil.append((hx + 0.12 * math.cos(a), hy + 0.12 * math.sin(a), cz0 + 0.98 - 0.0157 * i))
    coil += [(hx + 0.2, hy - 0.1, cz0 + 0.48), (0.50, yb - 0.26, tz + 0.55), (0.50, yb - 0.26, tz + 0.36)]
    K.tube('copper', coil, 0.012, seg=5)
    K.lathe('plastic_white', [(0.0, 0.0), (0.085, 0.0), (0.095, 0.02), (0.095, 0.2), (0.06, 0.26), (0.045, 0.26), (0.045, 0.3)],
            loc=(0.50, yb - 0.26, tz + 0.03), seg=10, cap_end=False)
    K.lathe('painted_blue', [(0.097, 0.0), (0.097, 0.07)], loc=(0.50, yb - 0.26, tz + 0.08), seg=10, cap_start=False, cap_end=False)
    # the flame at the chimney mouth (the game hides it)
    fl = K.part('hydrazine_flame', (hx, hy, cz1 + 0.03))
    fl.lathe('flame', [(0.0, 0.0), (0.045, 0.01), (0.07, 0.07), (0.06, 0.15), (0.035, 0.24), (0.012, 0.32), (0.0, 0.37)], seg=8)
    fl.finish()
    K.anchor('lamp_flame', (hx, hy, cz1 + 0.2))
    # an extraction hood hung over the flame, with a flexible duct up to the ring main
    ry = 7.555 / math.cos(rad(4.7)) - math.hypot(5.5, 2.6)
    K.lathe('aluminium', [(0.36, 0.0), (0.36, 0.05), (0.12, 0.30), (0.12, 0.36)], loc=(hx, hy, 2.52), seg=12, cap_start=False, cap_end=False)
    duct_pts = spline([(hx, hy, 2.86), (hx, hy + 0.12, 3.12), (hx, ry - 0.5, 3.40), (hx, ry - 0.04, 3.46)], 4)
    K.tube('aluminium', duct_pts, [0.115 if i % 2 else 0.10 for i in range(len(duct_pts))], seg=8, caps=False)
    for a in (0.9, 3.0, 5.1):
        K.tube('steel', [(hx + 0.35 * math.cos(a), hy + 0.35 * math.sin(a), 2.56), (hx + 0.35 * math.cos(a), hy + 0.35 * math.sin(a), 3.6)], 0.005, seg=3)
    # the hydrazine tank on a strut cradle, higher than the bowl, with a hazard band and a drip line
    tx, ty, tzc = -0.36, yb + 0.06, 1.42
    K.lathe('painted_yellow', tank_profile(0.25, 0.86, dome=0.2), loc=(tx - 0.43, ty, tzc), seg=14, axis='X')
    K.lathe('painted_dark', [(0.253, 0.0), (0.253, 0.11)], loc=(tx - 0.12, ty, tzc), seg=14, axis='X', cap_start=False, cap_end=False)
    K.lathe('painted_dark', [(0.253, 0.0), (0.253, 0.04)], loc=(tx + 0.06, ty, tzc), seg=14, axis='X', cap_start=False, cap_end=False)
    K.box('painted_white', (0.30, 0.012, 0.13), (tx - 0.02, ty - 0.256, tzc + 0.02), bevel=0.0)
    K.text('painted_red', 'N2H4', 0.085, (tx - 0.02, ty - 0.264, tzc + 0.02))
    for sx in (-0.26, 0.18):
        for sy in (-1, 1):
            K.tube('aluminium', [(tx + sx, ty + sy * 0.16, tzc - 0.2), (tx + sx - 0.04, ty + sy * 0.3, tz + 0.04)], 0.016, seg=5)
        K.box('aluminium', (0.04, 0.42, 0.04), (tx + sx, ty, tzc - 0.22), bevel=0.0)
        K.lathe('suit_orange', [(0.256, -0.02), (0.256, 0.02)], loc=(tx + sx, ty, tzc), seg=14, axis='X', cap_start=False, cap_end=False)
    K.cyl('steel', 0.03, 0.08, (tx + 0.46, ty, tzc), seg=6, axis='X')
    handwheel(K, (tx + 0.48, ty - 0.02, tzc), 0.045, stem=0.05)
    K.hose('copper', [(tx + 0.5, ty, tzc), (tx + 0.56, ty, tzc - 0.1), (hx - 0.1, hy - 0.02, hz + 0.5), (hx - 0.03, hy, hz + 0.3), (hx, hy, tz + 0.22)], 0.008, seg=4, n=4)
    add_box(K.bm('tape', 0.0), (0.05, 0.03, 0.03), (hx - 0.09, hy - 0.02, hz + 0.47))
    # an oxygen bottle feeding the burner, a fire extinguisher close to hand, a hazard board
    K.lathe('painted_green', tank_profile(0.09, 0.62, dome=0.07, neck=0.02), loc=(-0.83, yb - 0.25, 0.0), seg=10)
    K.cyl('aluminium', 0.025, 0.06, (-0.83, yb - 0.25, 0.65), seg=6)
    K.hose('rubber', [(-0.83, yb - 0.25, 0.68), (-0.7, yb - 0.3, 0.9), (-0.3, yb - 0.33, tz + 0.12), (hx - 0.05, hy - 0.1, tz + 0.1)], 0.01, seg=4, n=4)
    extinguisher(K, (0.86, yb - 0.32, 0.0))
    K.box('painted_yellow', (0.36, 0.02, 0.36), (0.80, yb + 0.42, 1.0), rot=(rad(-8), 0, 0), bevel=0.004)
    bm = K.open('painted_dark')
    face_to(bm, [(0.80, yb + 0.405, 1.13), (0.92, yb + 0.428, 0.90), (0.68, yb + 0.428, 0.90)], (0, -1, 0))
    K.tube('aluminium', [(0.80, yb + 0.44, 0.0), (0.80, yb + 0.44, 1.12)], 0.014, seg=5)
    K.box('painted_grey', (0.3, 0.3, 0.02), (0.80, yb + 0.44, 0.01), bevel=0.0)
    floor_marks(K, 1.8, -0.62, m='painted_red')
    K.anchor('col_hydrazine', (0.0, 0.22, 0), radius=1.05)
    K.finish()


def chair_swivel(K, loc, yaw=0.0, m='suit_grey'):
    x, y, z = loc
    c, s = math.cos(yaw), math.sin(yaw)

    def P(px, py, pz):
        return (x + px * c - py * s, y + px * s + py * c, z + pz)
    for i in range(5):
        a = TAU * i / 5 + yaw
        K.tube('painted_dark', [(x, y, z + 0.11), (x + 0.3 * math.cos(a), y + 0.3 * math.sin(a), z + 0.07)], 0.02, seg=4)
        K.cyl('plastic_black', 0.035, 0.03, (x + 0.3 * math.cos(a), y + 0.3 * math.sin(a), z + 0.035), seg=6, axis='X', rot=(0, 0, a))
    K.cyl('steel', 0.025, 0.34, P(0, 0, 0.27), seg=6)
    K.box(m, (0.46, 0.44, 0.08), P(0, 0, 0.47), rot=(0, 0, yaw), bevel=0.03, seg=2)
    K.box(m, (0.42, 0.07, 0.46), P(0, 0.22, 0.83), rot=(rad(-8), 0, yaw), bevel=0.03, seg=2)
    K.tube('painted_dark', [P(0, 0.16, 0.44), P(0, 0.27, 0.48), P(0, 0.25, 0.7)], 0.018, seg=4)
    for sx in (-1, 1):
        K.tube('painted_dark', [P(sx * 0.22, 0.12, 0.46), P(sx * 0.26, 0.12, 0.66), P(sx * 0.26, -0.12, 0.66)], 0.014, seg=4)


def st_comms(interior):
    """Comms desk: main display (a part), keyboard, laptop, radio stack, chair."""
    K = station_kit('comms', interior, 0.0, 6.6, yaw=0.0)
    yb, dz = 0.28, 0.76
    # desk: top, modesty panel, pedestal, leg frame
    K.box('painted_white', (2.3, 0.86, 0.045), (0, yb, dz - 0.022), bevel=0.012)
    add_box(K.bm('painted_grey', 0.0), (2.3, 0.86, 0.012), (0, yb, dz - 0.05))
    K.box('painted_grey', (2.2, 0.03, 0.42), (0, yb + 0.36, dz - 0.27), bevel=0.0)
    K.box('painted_white', (0.44, 0.74, 0.62), (-0.86, yb + 0.02, 0.39), bevel=0.014)
    for i in range(3):
        add_box(K.bm('painted_grey', 0.0), (0.40, 0.012, 0.17), (-0.86, yb - 0.352, 0.2 + i * 0.2))
        K.handle('steel', (-0.94, yb - 0.357, 0.2 + i * 0.2), (-0.78, yb - 0.357, 0.2 + i * 0.2), (0, -0.03, 0), r=0.007, seg=4)
    for sx in (-1.1, 1.1):
        for sy in (-0.36, 0.36):
            K.box('aluminium', (0.045, 0.045, dz - 0.05), (sx, yb + sy, (dz - 0.05) / 2), bevel=0.005)
    K.box('aluminium', (0.04, 0.72, 0.04), (1.1, yb, 0.14), bevel=0.0)
    # electronics tower under the right side, cables into the floor
    K.box('painted_dark', (0.24, 0.52, 0.46), (0.84, yb + 0.06, 0.25), bevel=0.012)
    add_box(K.bm('light_green', 0.0), (0.02, 0.008, 0.02), (0.78, yb - 0.204, 0.42))
    add_box(K.bm('painted_grey', 0.0), (0.18, 0.008, 0.2), (0.84, yb - 0.204, 0.2))
    K.hose('plastic_black', [(0.84, yb + 0.3, 0.3), (0.6, yb + 0.42, 0.12), (0.2, yb + 0.45, 0.03), (0.0, yb + 0.1, 0.02), (0.0, -0.3, 0.012)], 0.016, seg=4, n=3)
    # main display on a stand (the screen face is the part)
    sx0, sy0, sz0, tilt = -0.22, yb + 0.20, 1.27, rad(-9)
    K.box('plastic_black', (1.22, 0.05, 0.74), (sx0, sy0, sz0), rot=(tilt, 0, 0), bevel=0.014)
    K.box('painted_dark', (0.12, 0.06, 0.34), (sx0, sy0 + 0.06, 0.95), rot=(tilt, 0, 0), bevel=0.008)
    K.box('painted_dark', (0.44, 0.26, 0.025), (sx0, sy0 + 0.07, dz + 0.012), bevel=0.006)
    scr = K.part('comms_screen', (sx0, sy0 - 0.028, sz0 + 0.004))
    add_box(scr.bm('screen', 0.0), (1.14, 0.006, 0.66), (0, 0, 0), rot=(tilt, 0, 0))
    scr.finish()
    add_box(K.bm('light_green', 0.0), (0.02, 0.006, 0.012), (sx0 + 0.52, sy0 - 0.085, sz0 - 0.345), rot=(tilt, 0, 0))
    # keyboard, trackball, notepad, mug, microphone
    K.box('plastic_black', (0.46, 0.16, 0.022), (sx0, yb - 0.2, dz + 0.014), rot=(rad(4), 0, 0), bevel=0.005)
    for r in range(4):
        add_box(K.bm('painted_grey', 0.0), (0.42, 0.026, 0.008), (sx0, yb - 0.255 + r * 0.036, dz + 0.027 + r * 0.0025), rot=(rad(4), 0, 0))
    K.box('plastic_black', (0.1, 0.13, 0.03), (sx0 + 0.36, yb - 0.2, dz + 0.016), bevel=0.01)
    K.sphere('painted_red', 0.022, (sx0 + 0.36, yb - 0.18, dz + 0.036), seg=6, rings=4)
    K.box('painted_yellow', (0.17, 0.23, 0.012), (sx0 - 0.46, yb - 0.16, dz + 0.007), rot=(0, 0, rad(12)), bevel=0.0)
    K.tube('painted_dark', [(sx0 - 0.4, yb - 0.2, dz + 0.02), (sx0 - 0.52, yb - 0.1, dz + 0.02)], 0.005, seg=3)
    K.lathe('plastic_white', [(0.0, 0.0), (0.036, 0.0), (0.04, 0.09), (0.034, 0.09), (0.03, 0.012)], loc=(sx0 - 0.74, yb - 0.02, dz), seg=8, cap_end=False)
    K.torus('plastic_white', 0.026, 0.006, (sx0 - 0.785, yb - 0.02, dz + 0.048), seg=6, ring_seg=3, axis='Y')
    K.cyl('painted_dark', 0.05, 0.02, (0.32, yb - 0.02, dz + 0.01), seg=8)
    K.tube('painted_dark', spline([(0.32, yb - 0.02, dz + 0.02), (0.32, yb, dz + 0.2), (0.28, yb - 0.12, dz + 0.3)], 3), 0.007, seg=4)
    K.cyl('plastic_black', 0.02, 0.05, (0.275, yb - 0.135, dz + 0.31), seg=6, rot=(rad(60), 0, 0))
    # laptop, open
    lx, ly = 0.72, yb - 0.1
    K.box('painted_grey', (0.36, 0.25, 0.018), (lx, ly, dz + 0.009), rot=(0, 0, rad(-14)), bevel=0.004)
    add_box(K.bm('plastic_black', 0.0), (0.30, 0.13, 0.004), (lx - 0.012, ly - 0.03, dz + 0.02), rot=(0, 0, rad(-14)))
    K.box('painted_grey', (0.36, 0.014, 0.24), (lx + 0.035, ly + 0.14, dz + 0.125), rot=(rad(-14), 0, rad(-14)), bevel=0.004)
    add_box(K.bm('screen', 0.0), (0.32, 0.004, 0.20), (lx + 0.032, ly + 0.131, dz + 0.127), rot=(rad(-14), 0, rad(-14)))
    # radio stack on the right rear of the desk with a speaker, knobs and lamps
    rx, ry = 0.80, yb + 0.22
    K.box('painted_dark', (0.50, 0.34, 0.50), (rx, ry, dz + 0.25), bevel=0.012)
    for i in range(3):
        zz = dz + 0.09 + i * 0.16
        add_box(K.bm('painted_grey', 0.0), (0.46, 0.008, 0.135), (rx, ry - 0.172, zz))
        for k in range(3):
            K.cyl('steel', 0.016, 0.02, (rx - 0.16 + k * 0.07, ry - 0.185, zz - 0.02), seg=6, axis='Y')
        add_box(K.bm('screen' if i == 1 else 'plastic_black', 0.0), (0.16, 0.008, 0.06), (rx + 0.12, ry - 0.178, zz + 0.012))
        add_box(K.bm(('light_green', 'light_amber', 'light_green')[i], 0.0), (0.018, 0.008, 0.018), (rx - 0.19, ry - 0.178, zz + 0.04))
        for sx in (-1, 1):
            K.handle('steel', (rx + sx * 0.215, ry - 0.172, zz - 0.045), (rx + sx * 0.215, ry - 0.172, zz + 0.045), (0, -0.03, 0), r=0.005, seg=3)
    K.tube('plastic_black', [(rx + 0.2, ry + 0.1, dz + 0.5), (rx + 0.2, ry + 0.1, dz + 1.25)], [0.008, 0.003], seg=4)
    K.hose('plastic_black', [(rx - 0.1, ry + 0.17, dz + 0.4), (rx - 0.1, ry + 0.4, dz + 0.5), (rx + 0.2, R_IN - 6.6 - 0.2, 1.6), (rx + 0.45, R_IN - 6.6 - 0.17, 2.5)], 0.012, seg=4, n=4)
    # headset hanging on the monitor corner
    K.torus('plastic_black', 0.085, 0.01, (sx0 + 0.63, sy0, sz0 + 0.3), seg=8, ring_seg=3, axis='Y', arc=math.pi)
    for sx in (-1, 1):
        K.cyl('plastic_black', 0.04, 0.03, (sx0 + 0.63 + sx * 0.085, sy0, sz0 + 0.29), seg=6, axis='X')
    chair_swivel(K, (0.02, -0.52, 0.0), yaw=rad(200))
    floor_marks(K, 2.0, -1.12)
    K.anchor('col_comms', (0.0, 0.1, 0), radius=1.2)
    K.finish()


def blanket(K, m, x0, x1, y0, y1, z, drop=0.26, seed=3, nx=9, ny=6):
    """A rumpled blanket lying on a mattress and hanging over its front (-Y) edge."""
    rng = random.Random(seed)
    bm = K.open(m, smooth=60.0)
    grid = []
    for i in range(nx + 1):
        row = []
        u = i / nx
        for j in range(ny + 3):
            if j < 2:                                   # the part hanging over the edge
                yy, zz = y0 - 0.025 - 0.012 * (1 - j), z - drop * (1 - j / 2) + 0.0
            else:
                v = (j - 2) / ny
                yy = y0 + (y1 - y0) * v
                zz = z + 0.045 + 0.02 * math.sin(u * 9 + v * 4 + seed) + 0.014 * math.sin(u * 4 - v * 7) + rng.uniform(-0.005, 0.005)
            xx = x0 + (x1 - x0) * u + (0.03 * math.sin(j * 1.7 + seed) if 0 < i < nx else 0)
            if i == nx:                                  # folded-back edge is a little thicker
                zz += 0.02
            row.append(bm.verts.new((xx, yy, zz)))
        grid.append(row)
    for i in range(nx):
        for j in range(ny + 2):
            f = bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
            f.normal_update()
            if f.normal.z < 0 and j >= 2 or (j < 2 and f.normal.y > 0):
                f.normal_flip()


def st_bunk(interior):
    """Crew bunk: drawer base, mattress, pillow and a rumpled blanket; a shelf tower as the
    headboard, a privacy shelf over the head, a curtain drawn back along the room side."""
    K = station_kit('bunk', interior, -5.0, 4.9, yaw=rad(21))
    oy = 0.21
    X0, X1, Y0, Y1 = -0.93, 1.13, oy - 0.45, oy + 0.45
    xc = (X0 + X1) / 2
    # base with two drawers on the room side
    K.box('painted_white', (2.06, 0.90, 0.30), (xc, oy, 0.25), bevel=0.014)
    K.box('painted_dark', (1.96, 0.82, 0.10), (xc, oy, 0.05), bevel=0.0)
    for cx in (xc - 0.5, xc + 0.5):
        K.box('painted_white', (0.9, 0.014, 0.22), (cx, Y0 - 0.006, 0.25), bevel=0.008)
        K.handle('steel', (cx - 0.12, Y0 - 0.012, 0.25), (cx + 0.12, Y0 - 0.012, 0.25), (0, -0.035, 0), r=0.008, seg=4)
        add_box(K.bm('painted_orange', 0.0), (0.12, 0.008, 0.04), (cx + 0.32, Y0 - 0.014, 0.32))
    # frame: side rails, foot board, corner posts
    for sy in (Y0, Y1):
        K.box('aluminium', (2.1, 0.04, 0.08), (xc, sy, 0.44), bevel=0.006)
    K.box('aluminium', (0.04, 0.94, 0.08), (X1, oy, 0.44), bevel=0.006)
    for sy in (Y0, Y1):
        K.box('aluminium', (0.05, 0.05, 0.86), (X1, sy, 0.45), bevel=0.006)
    K.box('aluminium', (0.04, 0.94, 0.04), (X1, oy, 0.86), bevel=0.0)
    K.box('canvas', (0.014, 0.84, 0.30), (X1, oy, 0.67), bevel=0.0)
    # mattress, pillow, blanket turned back
    K.box('foam', (2.0, 0.84, 0.17), (xc, oy, 0.50), bevel=0.045, seg=2)
    K.box('suit_white', (0.46, 0.64, 0.13), (X0 + 0.30, oy + 0.02, 0.635), rot=(0, rad(-6), rad(5)), bevel=0.055, seg=2)
    blanket(K, 'suit_orange', X0 + 0.66, X1 - 0.03, Y0 + 0.02, Y1 - 0.02, 0.59)
    K.box('suit_white', (0.20, 0.86, 0.04), (X0 + 0.70, oy, 0.625), rot=(0, rad(-5), 0), bevel=0.014)
    # headboard: a shelf tower at the head end, open toward the bed
    TX0, TH = X0 - 0.30, 1.96
    K.box('painted_white', (0.03, 0.94, TH - 0.1), (TX0 + 0.015, oy, 0.1 + (TH - 0.1) / 2), bevel=0.006)
    for sy in (Y0 - 0.01, Y1 + 0.01):
        K.box('painted_white', (0.30, 0.03, TH - 0.1), (TX0 + 0.15, sy, 0.1 + (TH - 0.1) / 2), bevel=0.006)
    for z in (0.12, 0.92, 1.30, 1.66, TH):
        K.box('painted_white', (0.31, 0.94, 0.03), (TX0 + 0.155, oy, z), bevel=0.006)
    add_box(K.bm('painted_orange', 0.0), (0.305, 0.955, 0.035), (TX0 + 0.155, oy, TH - 0.06))
    sx = TX0 + 0.17
    for i, (m, h) in enumerate((('painted_blue', 0.24), ('painted_red', 0.2), ('painted_yellow', 0.22), ('painted_grey', 0.25), ('painted_green', 0.19), ('painted_orange', 0.23))):
        K.box(m, (0.17, 0.045, h), (sx, Y1 - 0.08 - i * 0.052, 1.315 + h / 2), rot=(rad(-9) if i == 5 else 0, 0, 0), bevel=0.004)
    K.box('plastic_white', (0.2, 0.26, 0.14), (sx, oy - 0.22, 1.39), bevel=0.012)
    add_box(K.bm('painted_blue', 0.0), (0.008, 0.1, 0.05), (sx + 0.104, oy - 0.22, 1.39))
    K.lathe('painted_orange', [(0.0, 0.0), (0.05, 0.0), (0.062, 0.09), (0.054, 0.09)], loc=(sx, oy + 0.22, 1.675), seg=8, cap_end=False)
    K.cyl('painted_dark', 0.054, 0.01, (sx, oy + 0.22, 1.755), seg=8)
    for a in (0.3, 2.1, 4.2, 5.4):
        K.tube('leaf', [(sx, oy + 0.22, 1.76), (sx + 0.04 * math.cos(a), oy + 0.22 + 0.04 * math.sin(a), 1.86)], 0.005, seg=3)
        K.sphere('leaf', 0.04, (sx + 0.06 * math.cos(a), oy + 0.22 + 0.06 * math.sin(a), 1.88), seg=5, rings=3, scale=(1, 0.75, 0.35))
    crate(K, (0.2, 0.3, 0.16), (sx, oy - 0.18, 1.675), lid='painted_blue', yaw=rad(90), bevel=0.008)
    K.box('painted_dark', (0.012, 0.16, 0.12), (sx - 0.02, oy - 0.05, 0.995), rot=(0, rad(12), 0), bevel=0.0)
    add_box(K.bm('canvas', 0.0), (0.006, 0.13, 0.09), (sx - 0.012, oy - 0.05, 0.996), rot=(0, rad(12), 0))
    K.lathe('plastic_white', [(0.0, 0.0), (0.036, 0.0), (0.04, 0.09), (0.034, 0.09), (0.03, 0.012)], loc=(sx, oy + 0.28, 0.935), seg=8, cap_end=False)
    K.box('plastic_black', (0.02, 0.2, 0.14), (sx - 0.05, oy - 0.28, 1.01), rot=(0, rad(15), 0), bevel=0.004)
    add_box(K.bm('screen', 0.0), (0.006, 0.17, 0.11), (sx - 0.038, oy - 0.28, 1.012), rot=(0, rad(15), 0))
    # reading lamp on a gooseneck
    K.tube('painted_dark', spline([(TX0 + 0.28, Y1 - 0.04, 1.2), (X0 + 0.14, Y1 - 0.08, 1.24), (X0 + 0.26, Y1 - 0.2, 1.14)], 3), 0.008, seg=4)
    K.cyl('painted_dark', 0.05, 0.08, (X0 + 0.28, Y1 - 0.22, 1.12), seg=8, r2=0.03, rot=(rad(40), rad(-25), 0))
    K.cyl('light_white', 0.04, 0.008, (X0 + 0.295, Y1 - 0.245, 1.09), seg=8, rot=(rad(40), rad(-25), 0))
    K.anchor('lamp_bunk', (X0 + 0.35, oy, 1.1))
    # privacy shelf over the head on two posts, with a lip and a few things on it
    PX = X0 + 0.74
    for sy in (Y0, Y1):
        K.box('aluminium', (0.045, 0.045, 1.5), (PX, sy, 0.48 + 0.75), bevel=0.005)
    K.box('painted_white', (0.78, 0.94, 0.03), (X0 + 0.37, oy, 1.60), bevel=0.008)
    K.box('painted_white', (0.03, 0.94, 0.10), (PX, oy, 1.66), bevel=0.006)
    ctb(K, (0.5, 0.3, 0.22), (X0 + 0.4, oy + 0.2, 1.615), yaw=rad(4), label='painted_blue')
    K.box('suit_orange', (0.36, 0.3, 0.08), (X0 + 0.38, oy - 0.2, 1.655), rot=(0, 0, rad(-8)), bevel=0.02)
    # padded wall-side panel with pockets and photos
    K.box('canvas', (2.02, 0.03, 0.74), (xc, Y1 + 0.03, 0.85), bevel=0.01)
    for i in range(4):
        K.box('canvas_dark', (0.26, 0.03, 0.2), (X0 + 0.9 + i * 0.3, Y1 + 0.012, 0.74), bevel=0.008)
    for i, m in enumerate(('painted_blue', 'regolith', 'painted_green', 'painted_yellow', 'painted_blue')):
        add_box(K.bm(m, 0.0), (0.11, 0.006, 0.085), (X0 + 0.95 + i * 0.16, Y1 + 0.013, 1.06 + (i % 2) * 0.04), rot=(0, rad(-6 + 5 * i), 0))
    # curtain rail along the room side, the curtain bunched at the head end
    K.tube('steel', fillet([(TX0 + 0.28, Y0 - 0.02, 1.9), (X1, Y0 - 0.02, 1.9), (X1, Y0 - 0.02, 0.86)], 0.06, 2), 0.011, seg=5)
    bm = K.open('painted_blue', smooth=70.0)
    prev = None
    for i in range(11):
        xx = X0 + 0.02 + i * 0.034
        yy = Y0 - 0.03 + (0.04 if i % 2 else -0.04)
        cur = (bm.verts.new((xx, yy, 1.88)), bm.verts.new((X0 + 0.19 + (i - 5) * 0.012, Y0 - 0.03 + (0.02 if i % 2 else -0.02), 1.22)),
               bm.verts.new((xx + 0.01 * (i - 5), yy, 0.55)))
        if prev:
            bm.faces.new((prev[0], cur[0], cur[1], prev[1]))
            bm.faces.new((prev[1], cur[1], cur[2], prev[2]))
        prev = cur
    add_box(K.bm('canvas_dark', 0.0), (0.2, 0.1, 0.04), (X0 + 0.19, Y0 - 0.03, 1.22))
    # bedside: a mat, boots and a kit bag
    K.box('rubber', (0.9, 0.5, 0.012), (xc + 0.25, Y0 - 0.36, 0.006), bevel=0.0)
    for i in range(2):
        bx2, by2 = xc - 0.5 + i * 0.16, Y0 - 0.22
        K.box('suit_white', (0.11, 0.26, 0.09), (bx2, by2, 0.045), bevel=0.03)
        K.cyl('suit_white', 0.055, 0.2, (bx2, by2 + 0.07, 0.17), seg=8)
        add_box(K.bm('rubber', 0.0), (0.115, 0.265, 0.02), (bx2, by2, 0.01))
    ctb(K, (0.5, 0.28, 0.26), (xc + 0.75, Y0 - 0.22, 0.0), yaw=rad(-12), label='painted_orange')
    K.anchor('col_bunk', (0.1, oy, 0), radius=1.1)
    K.finish()


def ration_pack(bm_body, bm_label, x, y, z, w=0.16, d=0.035, h=0.2, lean=0.0):
    add_box(bm_body, (w, d, h), (x, y, z + h / 2), rot=(lean, 0, 0))
    add_box(bm_label, (w + 0.004, d + 0.004, h * 0.3), (x, y - lean * h * 0.08, z + h * 0.62), rot=(lean, 0, 0))


def st_food(interior):
    """Food shelf: racking with ration packs, crates, potato bins and water."""
    K = station_kit('food', interior, 4.2, -4.8)
    yb = 0.34
    W, D, H = 2.0, 0.62, 2.05
    for sx in (-W / 2, 0, W / 2):
        for sy in (-D / 2, D / 2):
            K.box('aluminium', (0.05, 0.05, H), (sx, yb + sy, H / 2), bevel=0.006)
            add_box(K.bm('painted_dark', 0.0), (0.09, 0.09, 0.025), (sx, yb + sy, 0.012))
    decks = (0.16, 0.62, 1.07, 1.50, 1.92)
    for z in decks:
        K.box('painted_white', (W + 0.02, D + 0.02, 0.035), (0, yb, z), bevel=0.006)
        add_box(K.bm('painted_grey', 0.0), (W + 0.03, 0.015, 0.07), (0, yb - D / 2 - 0.012, z + 0.012))
    for sx in (-1, 1):
        K.tube('steel', [(sx * 0.02, yb + D / 2, decks[0]), (sx * W / 2, yb + D / 2, decks[-1])], 0.01, seg=4)
        K.box('aluminium', (0.02, D, 0.05), (sx * W / 2, yb, 1.3), bevel=0.0)
    fy = yb - D / 2
    # bottom deck: two cases and a water can
    crate(K, (0.7, 0.5, 0.38), (-0.58, yb, decks[0] + 0.018))
    crate(K, (0.62, 0.5, 0.34), (0.2, yb, decks[0] + 0.018), lid='painted_blue', yaw=rad(3))
    jerrycan(K, (0.76, yb - 0.05, decks[0] + 0.018), yaw=rad(90))
    # second deck: open totes of potatoes
    rng = random.Random(21)
    for cx in (-0.52, 0.5):
        K.box('painted_grey', (0.8, 0.5, 0.26), (cx, yb, decks[1] + 0.15), bevel=0.02)
        K.box('painted_dark', (0.72, 0.42, 0.02), (cx, yb, decks[1] + 0.27), bevel=0.0)
        add_box(K.bm('painted_yellow', 0.0), (0.26, 0.01, 0.1), (cx, yb - 0.253, decks[1] + 0.15))
        for i in range(13):
            K.ico('potato', 0.062, (cx + rng.uniform(-0.3, 0.3), yb + rng.uniform(-0.15, 0.15), decks[1] + 0.29 + rng.uniform(0, 0.03)),
                  subdiv=1, scale=(rng.uniform(0.8, 1.25), rng.uniform(0.7, 1.0), rng.uniform(0.6, 0.8)), rot=(0, 0, rng.uniform(0, 3)))
    # third deck, eye level: ration packs standing in trays, colour coded
    body, labels = K.bm('plastic_white', 0.0), {m: K.bm(m, 0.0) for m in ('painted_orange', 'painted_blue', 'painted_green', 'painted_yellow')}
    foil = K.bm('gold_foil', 0.0)
    order = ('painted_orange', 'painted_blue', 'painted_green', 'painted_yellow')
    for t, cx in enumerate((-0.74, -0.24, 0.26, 0.76)):
        K.box('foam', (0.44, 0.5, 0.06), (cx, yb, decks[2] + 0.047), bevel=0.006)
        for r in range(5):
            for c in range(2):
                if rng.random() < 0.12:
                    continue
                ration_pack(foil if (t == 2) else body, labels[order[t]], cx - 0.1 + c * 0.2, fy + 0.09 + r * 0.1, decks[2] + 0.06,
                            lean=rng.uniform(-0.12, 0.06))
    # fourth deck: flat meal boxes in stacks, drink pouches
    for cx, n, m in ((-0.72, 4, 'painted_orange'), (-0.3, 6, 'painted_blue'), (0.12, 3, 'painted_green')):
        for i in range(n):
            K.box('plastic_white', (0.36, 0.44, 0.055), (cx + rng.uniform(-0.01, 0.01), yb + rng.uniform(-0.01, 0.01), decks[3] + 0.046 + i * 0.056),
                  rot=(0, 0, rng.uniform(-0.04, 0.04)), bevel=0.006)
            add_box(K.bm(m, 0.0), (0.12, 0.008, 0.035), (cx - 0.08, fy + 0.085, decks[3] + 0.046 + i * 0.056))
    for i in range(5):
        K.lathe('plastic_white', [(0.0, 0.0), (0.04, 0.0), (0.045, 0.02), (0.045, 0.16), (0.02, 0.2), (0.02, 0.23), (0.0, 0.23)],
                loc=(0.5 + (i % 3) * 0.12, yb - 0.1 + (i // 3) * 0.13, decks[3] + 0.018), seg=8)
        K.cyl('painted_blue', 0.022, 0.03, (0.5 + (i % 3) * 0.12, yb - 0.1 + (i // 3) * 0.13, decks[3] + 0.262), seg=6)
    # elastic straps across the fourth deck
    for z in (decks[3] + 0.13, decks[3] + 0.27):
        add_box(K.bm('suit_orange', 0.0), (W, 0.006, 0.03), (0, fy - 0.03, z))
    # top: soft bags and a case
    ctb(K, (0.62, 0.42, 0.3), (-0.6, yb, decks[4] + 0.018), label='painted_blue')
    ctb(K, (0.55, 0.42, 0.26), (0.05, yb, decks[4] + 0.018), yaw=rad(4), label='painted_orange')
    crate(K, (0.5, 0.42, 0.3), (0.68, yb, decks[4] + 0.018), lid='painted_grey')
    # inventory clipboard on the end upright, a label, floor marks
    K.box('painted_dark', (0.012, 0.22, 0.3), (-W / 2 - 0.035, yb - 0.1, 1.38), bevel=0.0)
    add_box(K.bm('plastic_white', 0.0), (0.006, 0.19, 0.25), (-W / 2 - 0.044, yb - 0.1, 1.37))
    K.box('painted_orange', (0.6, 0.012, 0.15), (0, fy - 0.03, H + 0.02), bevel=0.0)
    K.text('plastic_white', 'RATIONS', 0.085, (0, fy - 0.038, H + 0.02))
    floor_marks(K, 2.1, -0.56)
    K.anchor('col_food', (0.0, 0.3, 0), radius=1.1)
    K.finish()


def st_fabricator(interior):
    """Workbench with a 3D printer, a vice, a tool board and parts bins."""
    K = station_kit('fabricator', interior, -4.6, -3.9)
    # the bench sits a little toward the wall and the door side of its point, which keeps a
    # metre-wide way open between it and the south-west farm plot
    K.loc = K.W((-0.30, 0.44, 0.0))
    yb, bz = 0.30, 0.92
    W, D = 2.0, 0.84
    Y0, Y1 = yb - D / 2, yb + D / 2
    # bench: steel top on a frame, drawer unit, lower shelf
    K.box('steel', (W + 0.06, D + 0.04, 0.05), (0, yb, bz - 0.025), bevel=0.01)
    add_box(K.bm('painted_orange', 0.0), (W + 0.065, 0.012, 0.03), (0, Y0 - 0.02, bz - 0.03))
    for sx in (-W / 2 + 0.04, W / 2 - 0.04):
        for sy in (Y0 + 0.05, Y1 - 0.05):
            K.box('painted_grey', (0.07, 0.07, bz - 0.05), (sx, sy, (bz - 0.05) / 2), bevel=0.008)
    K.box('painted_grey', (W - 0.1, D - 0.1, 0.03), (0, yb, 0.2), bevel=0.0)
    K.box('painted_grey', (W - 0.1, 0.03, 0.08), (0, Y1 - 0.05, 0.7), bevel=0.0)
    K.box('painted_blue', (0.62, D - 0.1, 0.56), (0.62, yb, bz - 0.34), bevel=0.012)
    for i in range(3):
        K.box('painted_blue', (0.56, 0.014, 0.15), (0.62, Y0 + 0.045, bz - 0.52 + i * 0.18), bevel=0.006)
        K.handle('steel', (0.5, Y0 + 0.04, bz - 0.52 + i * 0.18), (0.74, Y0 + 0.04, bz - 0.52 + i * 0.18), (0, -0.03, 0), r=0.007, seg=4)
    crate(K, (0.6, 0.45, 0.36), (-0.5, yb, 0.215), lid='painted_grey')
    # tool board behind, with a top shelf and a task light strip
    K.box('painted_white', (W, 0.03, 0.95), (0, Y1 - 0.02, bz + 0.5), bevel=0.006)
    for sx in (-W / 2 + 0.03, W / 2 - 0.03):
        K.box('painted_grey', (0.05, 0.05, 1.05), (sx, Y1 - 0.02, bz + 0.5), bevel=0.0)
    K.box('painted_grey', (W + 0.04, 0.26, 0.03), (0, Y1 - 0.12, bz + 1.0), bevel=0.006)
    K.box('painted_grey', (1.2, 0.07, 0.035), (-0.2, Y1 - 0.2, bz + 0.965), bevel=0.0)
    add_box(K.bm('light_white', 0.0), (1.1, 0.05, 0.01), (-0.2, Y1 - 0.2, bz + 0.944))
    K.anchor('lamp_bench', (-0.2, Y1 - 0.25, bz + 0.85))
    ty = Y1 - 0.04
    # spanners (three sizes), hammer, screwdrivers, pliers, hacksaw, tape rolls
    for i, s in enumerate((1.0, 0.82, 0.66)):
        xx = 0.36 + i * 0.11
        K.box('steel', (0.022 * s + 0.006, 0.008, 0.26 * s), (xx, ty, bz + 0.62 - 0.05 * i), bevel=0.0)
        for sz in (-1, 1):
            K.cyl('steel', 0.03 * s, 0.01, (xx, ty, bz + 0.62 - 0.05 * i + sz * 0.13 * s), seg=6, axis='Y')
    K.box('painted_orange', (0.03, 0.025, 0.26), (0.76, ty - 0.005, bz + 0.52), bevel=0.006)
    K.box('steel', (0.12, 0.04, 0.045), (0.76, ty - 0.01, bz + 0.67), bevel=0.006)
    for i, m in enumerate(('painted_red', 'painted_yellow', 'painted_blue', 'painted_red')):
        xx = 0.02 + i * 0.07
        K.cyl(m, 0.016, 0.1, (xx, ty - 0.01, bz + 0.7), seg=6)
        K.cyl('steel', 0.005, 0.13 - i * 0.012, (xx, ty - 0.01, bz + 0.585 + i * 0.006), seg=4)
    add_box(K.bm('painted_grey', 0.0), (0.32, 0.03, 0.02), (0.12, ty - 0.005, bz + 0.755))
    K.torus('tape', 0.05, 0.022, (0.9, ty - 0.02, bz + 0.3), seg=10, ring_seg=4, axis='Y')
    K.torus('painted_yellow', 0.04, 0.018, (0.9, ty - 0.02, bz + 0.18), seg=10, ring_seg=4, axis='Y')
    K.tube('painted_orange', fillet([(-0.25, ty - 0.01, bz + 0.48), (-0.25, ty - 0.01, bz + 0.62), (0.02 - 0.12, ty - 0.01, bz + 0.62), (0.02 - 0.12, ty - 0.01, bz + 0.5)], 0.03, 2), 0.009, seg=4)
    add_box(K.bm('steel', 0.0), (0.15, 0.004, 0.012), (-0.175, ty - 0.01, bz + 0.49))
    # parts bins: a rail of tilted colour bins on the board
    for r in range(2):
        add_box(K.bm('painted_grey', 0.0), (0.8, 0.02, 0.03), (-0.56, ty - 0.005, bz + 0.34 + r * 0.19))
        for i in range(5):
            m = ('painted_orange', 'painted_blue', 'painted_yellow', 'painted_red', 'painted_blue')[(i + r * 2) % 5]
            K.box(m, (0.14, 0.15, 0.11), (-0.88 + i * 0.16, ty - 0.085, bz + 0.29 + r * 0.19), rot=(rad(18), 0, 0), bevel=0.012)
            add_box(K.bm('void', 0.0), (0.115, 0.09, 0.01), (-0.88 + i * 0.16, ty - 0.105, bz + 0.345 + r * 0.19), rot=(rad(18), 0, 0))
    # the 3D printer: extrusion frame, bed, gantry, head, spool, a half-printed part
    px, py, ps = -0.52, yb + 0.02, 0.56
    K.box('painted_dark', (ps + 0.04, ps + 0.04, 0.09), (px, py, bz + 0.045), bevel=0.012)
    for sx in (-1, 1):
        for sy in (-1, 1):
            K.box('painted_dark', (0.035, 0.035, ps), (px + sx * ps / 2, py + sy * ps / 2, bz + 0.09 + ps / 2), bevel=0.004)
        K.box('painted_dark', (0.035, ps, 0.035), (px + sx * ps / 2, py, bz + 0.09 + ps), bevel=0.004)
    for sy in (-1, 1):
        K.box('painted_dark', (ps, 0.035, 0.035), (px, py + sy * ps / 2, bz + 0.09 + ps), bevel=0.004)
    K.box('painted_grey', (0.42, 0.42, 0.015), (px, py, bz + 0.16), bevel=0.0)
    K.box('steel', (0.44, 0.02, 0.02), (px, py, bz + 0.13), bevel=0.0)
    for sx in (-1, 1):
        K.tube('steel', [(px + sx * (ps / 2 - 0.05), py + ps / 2 - 0.03, bz + 0.1), (px + sx * (ps / 2 - 0.05), py + ps / 2 - 0.03, bz + 0.09 + ps)], 0.008, seg=4)
    gz = bz + 0.42
    K.box('aluminium', (ps, 0.03, 0.04), (px, py + 0.02, gz), bevel=0.004)
    K.box('painted_orange', (0.09, 0.08, 0.10), (px + 0.06, py - 0.02, gz - 0.01), bevel=0.01)
    K.cyl('steel', 0.012, 0.05, (px + 0.06, py - 0.02, gz - 0.085), seg=6, r2=0.004, rot=(math.pi, 0, 0))
    # the part on the bed: a little bracket/gear
    K.cyl('painted_orange', 0.07, 0.05, (px + 0.02, py - 0.02, bz + 0.193), seg=10)
    for i in range(8):
        a = TAU * i / 8
        add_box(K.bm('painted_orange', 0.0), (0.03, 0.022, 0.05), (px + 0.02 + 0.078 * math.cos(a), py - 0.02 + 0.078 * math.sin(a), bz + 0.193), rot=(0, 0, a))
    K.cyl('void', 0.025, 0.052, (px + 0.02, py - 0.02, bz + 0.193), seg=8)
    # screen and knob on the base, spool on the side
    add_box(K.bm('screen', 0.0), (0.14, 0.008, 0.05), (px - 0.12, py - ps / 2 - 0.024, bz + 0.05))
    K.cyl('steel', 0.018, 0.02, (px + 0.02, py - ps / 2 - 0.03, bz + 0.05), seg=6, axis='Y')
    spx = px - ps / 2 - 0.07
    K.cyl('painted_orange', 0.11, 0.06, (spx, py, bz + 0.52), seg=12, axis='X')
    for sx in (-1, 1):
        K.cyl('plastic_black', 0.14, 0.008, (spx + sx * 0.034, py, bz + 0.52), seg=12, axis='X')
    K.tube('steel', [(px - ps / 2, py, bz + 0.52), (spx - 0.05, py, bz + 0.52)], 0.01, seg=4)
    K.hose('painted_orange', [(spx, py - 0.11, bz + 0.52), (spx + 0.1, py - 0.1, bz + 0.72), (px, py - 0.03, bz + 0.74), (px + 0.06, py - 0.02, gz + 0.04)], 0.004, seg=3, n=3)
    # vice on the right front corner, clamping a tube
    vx, vy = 0.80, Y0 + 0.16
    K.box('painted_blue', (0.16, 0.22, 0.05), (vx, vy, bz + 0.025), bevel=0.01)
    K.box('painted_blue', (0.12, 0.11, 0.13), (vx, vy + 0.04, bz + 0.105), bevel=0.014)
    K.box('painted_blue', (0.12, 0.06, 0.12), (vx, vy - 0.115, bz + 0.11), bevel=0.012)
    for yy in (vy - 0.02, vy - 0.08):
        add_box(K.bm('steel', 0.0), (0.13, 0.012, 0.045), (vx, yy, bz + 0.15))
    K.cyl('steel', 0.016, 0.3, (vx, vy - 0.14, bz + 0.07), seg=6, axis='Y')
    K.tube('steel', [(vx - 0.09, vy - 0.29, bz + 0.07), (vx + 0.09, vy - 0.29, bz + 0.07)], 0.007, seg=4)
    K.cyl('aluminium', 0.024, 0.5, (vx + 0.02, vy - 0.05, bz + 0.165), seg=8, axis='X')
    # loose kit on the bench top: drill, multimeter, a circuit board, solder station, offcuts
    dx, dy = 0.18, Y0 + 0.2
    K.box('painted_yellow', (0.07, 0.2, 0.07), (dx, dy, bz + 0.035), rot=(0, 0, rad(25)), bevel=0.014)
    K.box('painted_dark', (0.05, 0.06, 0.13), (dx + 0.03, dy - 0.07, bz + 0.065), rot=(rad(10), 0, rad(25)), bevel=0.012)
    K.cyl('painted_dark', 0.02, 0.06, (dx - 0.05, dy + 0.11, bz + 0.035), seg=6, axis='Y', rot=(0, 0, rad(25)))
    K.box('painted_yellow', (0.09, 0.16, 0.035), (0.42, yb + 0.1, bz + 0.018), rot=(0, 0, rad(-18)), bevel=0.01)
    add_box(K.bm('screen', 0.0), (0.06, 0.04, 0.004), (0.43, yb + 0.14, bz + 0.037), rot=(0, 0, rad(-18)))
    K.cyl('painted_dark', 0.022, 0.012, (0.41, yb + 0.07, bz + 0.04), seg=6)
    K.box('painted_green', (0.2, 0.14, 0.008), (0.18, yb + 0.2, bz + 0.006), rot=(0, 0, rad(8)), bevel=0.0)
    for i in range(4):
        add_box(K.bm('plastic_black', 0.0), (0.03, 0.02, 0.012), (0.12 + i * 0.04, yb + 0.2 + (i % 2) * 0.03, bz + 0.014))
    K.tube('aluminium', [(-0.1, Y0 + 0.1, bz + 0.02), (0.05, Y0 + 0.06, bz + 0.02)], 0.018, seg=6)
    # stool and a scrap bin on the floor
    sx0, sy0 = 0.15, Y0 - 0.38
    K.cyl('suit_grey', 0.17, 0.05, (sx0, sy0, 0.6), seg=12, bevel=0.012)
    for i in range(4):
        a = TAU * i / 4 + 0.6
        K.tube('aluminium', [(sx0 + 0.12 * math.cos(a), sy0 + 0.12 * math.sin(a), 0.58), (sx0 + 0.2 * math.cos(a), sy0 + 0.2 * math.sin(a), 0.0)], 0.014, seg=5)
    K.torus('aluminium', 0.165, 0.01, (sx0, sy0, 0.22), seg=10, ring_seg=3)
    bx, by = -1.26, yb - 0.1
    K.box('painted_grey', (0.42, 0.5, 0.5), (bx, by, 0.25), bevel=0.02)
    K.box('void', (0.36, 0.44, 0.01), (bx, by, 0.495), bevel=0.0)
    for i, (m, a) in enumerate((('aluminium', 0.3), ('steel', -0.25), ('copper', 0.1))):
        K.tube(m, [(bx - 0.1 + i * 0.1, by - 0.1 + i * 0.08, 0.3), (bx - 0.1 + i * 0.1 + a, by + 0.1, 0.85 + i * 0.08)], 0.018 - i * 0.003, seg=5)
    K.box('aluminium', (0.3, 0.012, 0.34), (bx + 0.05, by - 0.12, 0.6), rot=(rad(12), 0, rad(20)), bevel=0.0)
    floor_marks(K, 2.0, -0.78)
    K.anchor('col_fabricator', (0.0, 0.26, 0), radius=1.05)
    K.finish()


# ----------------------------------------------------------------------------------------------
# Hab: wall equipment between the ribs (shallow, so it needs no collider) and loose furniture
# ----------------------------------------------------------------------------------------------
WALL_R = 8.02           # wall kits sit here; the liner is then at local y = +0.30 (ribs at +0.24)


def wall_kit(name, interior, g, r=WALL_R, dth=0.0):
    th = gore_mid(g) + dth
    return Kit(name, interior, loc=(r * math.cos(th), r * math.sin(th), FLOOR_Z), yaw=th - math.pi / 2)


def wm_bags(K, seed=1, rows=3, cols=3, z0=0.42):
    """Stowage rack: soft cargo bags strapped into an aluminium frame."""
    rng = random.Random(seed)
    w = cols * 0.56 + 0.1
    for sx in (-w / 2, w / 2):
        K.box('aluminium', (0.045, 0.06, rows * 0.5 + 0.5), (sx, 0.2, z0 + rows * 0.25 - 0.05), bevel=0.0)
        add_box(K.bm('aluminium', 0.0), (0.045, 0.34, 0.045), (sx, 0.05, z0 - 0.04))
    labels = ('painted_orange', 'painted_blue', 'painted_yellow', 'painted_green', 'painted_red')
    for r in range(rows):
        z = z0 + r * 0.5
        add_box(K.bm('aluminium', 0.0), (w, 0.36, 0.025), (0, 0.06, z - 0.014))
        for c in range(cols):
            if rng.random() < 0.14:
                continue
            x = (c - (cols - 1) / 2) * 0.56
            bw, bh = rng.uniform(0.46, 0.52), rng.uniform(0.34, 0.44)
            ctb(K, (bw, 0.30, bh), (x + rng.uniform(-0.015, 0.015), 0.07, z), yaw=rng.uniform(-0.05, 0.05), label=rng.choice(labels))
        add_box(K.bm('suit_orange', 0.0), (w, 0.008, 0.028), (0, -0.095, z + 0.25))


def wm_rack(K, seed=1, w=1.15, h=2.25):
    """Avionics rack: a cabinet of slide-in units with handles, displays and status lamps."""
    rng = random.Random(seed)
    K.box('painted_white', (w, 0.42, h), (0, 0.06, 0.1 + h / 2), bevel=0.02)
    K.box('painted_dark', (w - 0.06, 0.4, 0.1), (0, 0.06, 0.05), bevel=0.0)
    add_box(K.bm('void', 0.0), (w - 0.14, 0.012, h - 0.16), (0, -0.152, 0.1 + h / 2))
    z = 0.2
    yf = -0.16
    while z < h - 0.12:
        uh = rng.choice((0.18, 0.26, 0.26, 0.36))
        if z + uh > h + 0.02:
            break
        kind = rng.randrange(4)
        m = ('painted_grey', 'painted_white', 'painted_dark', 'painted_grey')[kind]
        add_box(K.bm(m, 0.0), (w - 0.16, 0.03, uh - 0.025), (0, yf, z + uh / 2))
        for sx in (-1, 1):
            add_box(K.bm('steel', 0.0), (0.018, 0.03, uh - 0.08), (sx * (w / 2 - 0.13), yf - 0.03, z + uh / 2))
        if kind == 0:
            add_box(K.bm('screen', 0.0), (0.3, 0.006, uh - 0.09), (-0.12, yf - 0.017, z + uh / 2))
            for i in range(3):
                add_box(K.bm(('light_green', 'light_amber', 'light_green')[i], 0.0), (0.022, 0.006, 0.022), (0.2 + i * 0.05, yf - 0.017, z + uh / 2))
        elif kind == 1:
            for i in range(int((w - 0.5) / 0.05)):
                K.plate('painted_dark', 0.014, uh - 0.1, (-(w - 0.5) / 2 + i * 0.05, yf - 0.0165, z + uh / 2), rot=(rad(90), 0, 0))
        elif kind == 2:
            for i in range(6):
                add_box(K.bm('light_green' if rng.random() < 0.7 else 'light_amber', 0.0), (0.018, 0.006, 0.018), (-0.28 + i * 0.06, yf - 0.017, z + uh - 0.06))
            add_box(K.bm('painted_orange', 0.0), (0.2, 0.006, 0.03), (0.2, yf - 0.017, z + 0.05))
        else:
            for i in range(4):
                K.cyl('steel', 0.022, 0.02, (-0.27 + i * 0.1, yf - 0.02, z + uh / 2), seg=6, axis='Y')
            add_box(K.bm('plastic_black', 0.0), (0.16, 0.006, uh - 0.09), (0.25, yf - 0.017, z + uh / 2))
        z += uh
    # cable bundle from the top up to the conduit run
    K.hose('plastic_black', [(0.3, 0.1, h + 0.1), (0.32, 0.16, h + 0.3), (0.3, 0.2, 2.5)], 0.022, seg=5, n=2)


def wm_bottles(K, cols=('painted_green', 'painted_grey', 'painted_green', 'painted_blue'), h=1.35):
    """Reserve gas bottles chained to the wall under a regulator manifold."""
    n = len(cols)
    K.box('painted_grey', (n * 0.3 + 0.16, 0.34, 0.08), (0, 0.08, 0.20), bevel=0.01)
    for i, m in enumerate(cols):
        x = (i - (n - 1) / 2) * 0.3
        K.lathe('painted_white', tank_profile(0.125, h, dome=0.09, n=3, neck=0.03), loc=(x, 0.08, 0.24), seg=10)
        K.lathe(m, [(0.128, 0.0), (0.128, 0.2)], loc=(x, 0.08, 0.24 + h - 0.36), seg=10, cap_start=False, cap_end=False)
        K.cyl('aluminium', 0.03, 0.09, (x, 0.08, 0.24 + h + 0.04), seg=6)
        K.pipe('copper', [(x, 0.08, 0.24 + h + 0.07), (x, 0.08, 0.24 + h + 0.2), (x, 0.2, 0.24 + h + 0.26)], 0.01, seg=4, bend=0.04, n=2)
    for z in (0.7, 1.25):
        add_box(K.bm('steel', 0.0), (n * 0.3 + 0.12, 0.012, 0.035), (0, -0.05, z))
        for sx in (-1, 1):
            add_box(K.bm('steel', 0.0), (0.03, 0.3, 0.035), (sx * (n * 0.15 + 0.06), 0.1, z))
    mz = 0.24 + h + 0.26
    K.box('painted_grey', (n * 0.3 + 0.1, 0.07, 0.07), (0, 0.2, mz), bevel=0.01)
    gauge(K, (-0.2, 0.165, mz + 0.1), 0.055, needle=0.7, rim='steel')
    gauge(K, (0.2, 0.165, mz + 0.1), 0.055, needle=0.4, rim='steel')
    handwheel(K, (0.0, 0.16, mz), 0.05, stem=0.05)
    K.box('painted_yellow', (0.34, 0.01, 0.12), (0, 0.24, mz + 0.3), bevel=0.0)


def wm_panel(K):
    """Power distribution: breaker cabinet, junction box, conduit, an extinguisher on a bracket."""
    K.box('painted_grey', (0.8, 0.22, 1.1), (-0.25, 0.14, 1.45), bevel=0.016)
    K.box('painted_grey', (0.72, 0.02, 1.0), (-0.25, 0.022, 1.45), bevel=0.01)
    K.box('painted_yellow', (0.3, 0.008, 0.2), (-0.43, 0.008, 1.72), bevel=0.0)
    bm = K.open('painted_dark')
    face_to(bm, [(-0.43, 0.002, 1.79), (-0.36, 0.002, 1.66), (-0.50, 0.002, 1.66)], (0, -1, 0))
    K.box('painted_red', (0.07, 0.07, 0.2), (-0.02, -0.02, 1.48), rot=(rad(-20), 0, 0), bevel=0.012)
    add_box(K.bm('painted_dark', 0.0), (0.14, 0.012, 0.3), (-0.02, 0.006, 1.48))
    for i in range(6):
        add_box(K.bm('plastic_black', 0.0), (0.035, 0.014, 0.07), (-0.5 + i * 0.05, 0.006, 1.22))
    for i in range(3):
        add_box(K.bm(('light_green', 'light_green', 'light_amber')[i], 0.0), (0.025, 0.012, 0.025), (-0.5 + i * 0.06, 0.006, 1.38))
    K.handle('steel', (-0.57, 0.012, 1.3), (-0.57, 0.012, 1.6), (0, -0.04, 0), r=0.008, seg=4)
    for i, x in enumerate((-0.5, -0.36, -0.22, -0.08)):
        K.tube('painted_grey', [(x, 0.14, 2.0), (x, 0.14, 2.46)], 0.02, seg=5)
    K.tube('painted_orange', [(-0.25, 0.14, 0.9), (-0.25, 0.14, 0.2)], 0.028, seg=5)
    K.box('painted_white', (0.3, 0.14, 0.3), (0.5, 0.16, 1.5), bevel=0.012)
    K.tube('painted_grey', [(0.15, 0.18, 1.5), (0.35, 0.18, 1.5)], 0.016, seg=5)
    add_box(K.bm('light_red', 0.0), (0.03, 0.01, 0.03), (0.5, 0.086, 1.56))
    add_box(K.bm('painted_grey', 0.0), (0.2, 0.05, 0.05), (0.5, 0.17, 0.72))
    extinguisher(K, (0.5, 0.08, 0.72))


def wm_board(K):
    """Mission board: a Mars chart, a route line, notes and a sol tally."""
    K.box('painted_white', (1.3, 0.03, 0.9), (0, 0.2, 1.55), bevel=0.008)
    for sz in (-1, 1):
        add_box(K.bm('aluminium', 0.0), (1.34, 0.04, 0.03), (0, 0.2, 1.55 + sz * 0.46))
    K.cyl('regolith', 0.3, 0.008, (-0.28, 0.18, 1.58), seg=20, axis='Y')
    K.cyl('canvas', 0.085, 0.009, (-0.33, 0.178, 1.80), seg=10, axis='Y')
    K.tube('painted_dark', [(-0.45, 0.17, 1.52), (-0.33, 0.17, 1.60), (-0.22, 0.17, 1.55), (-0.1, 0.17, 1.66)], 0.006, seg=3)
    for p in ((-0.45, 1.52), (-0.1, 1.66)):
        K.sphere('painted_red', 0.016, (p[0], 0.165, p[1]), seg=5, rings=3)
    rng = random.Random(4)
    for i in range(7):
        m = ('painted_yellow', 'painted_orange', 'painted_blue', 'painted_yellow')[i % 4]
        add_box(K.bm(m, 0.0), (0.11, 0.006, 0.11), (0.2 + (i % 3) * 0.15, 0.182, 1.8 - (i // 3) * 0.15), rot=(0, rng.uniform(-0.1, 0.1), 0))
    for i in range(14):
        add_box(K.bm('painted_dark', 0.0), (0.008, 0.005, 0.07), (0.14 + i * 0.03 + (i // 5) * 0.03, 0.183, 1.26), rot=(0, 0.1, 0))
    K.box('aluminium', (0.6, 0.07, 0.015), (0.25, 0.16, 1.1), bevel=0.0)
    for i, m in enumerate(('painted_red', 'painted_blue', 'painted_dark')):
        K.cyl(m, 0.011, 0.11, (0.1 + i * 0.08, 0.15, 1.118), seg=5, axis='X')


def wm_medical(K):
    """Medical station: a cabinet with a green band, a folded stretcher, an eyewash bottle."""
    K.box('painted_white', (0.72, 0.26, 0.9), (-0.3, 0.14, 1.5), bevel=0.02)
    add_box(K.bm('painted_green', 0.0), (0.724, 0.264, 0.1), (-0.3, 0.14, 1.82))
    add_box(K.bm('painted_dark', 0.0), (0.01, 0.01, 0.86), (-0.3, 0.008, 1.5))
    for sx in (-1, 1):
        K.handle('steel', (-0.3 + sx * 0.05, 0.01, 1.4), (-0.3 + sx * 0.05, 0.01, 1.6), (0, -0.03, 0), r=0.007, seg=4)
    K.box('painted_green', (0.2, 0.008, 0.06), (-0.3, 0.006, 1.2), bevel=0.0)
    K.box('painted_green', (0.06, 0.008, 0.2), (-0.3, 0.006, 1.2), bevel=0.0)
    for sx in (0.28, 0.58):
        K.tube('painted_orange', [(sx, 0.16, 0.45), (sx, 0.16, 2.1)], 0.02, seg=5)
    K.box('canvas', (0.26, 0.05, 1.5), (0.43, 0.16, 1.28), bevel=0.012)
    for z in (0.75, 1.75):
        add_box(K.bm('suit_grey', 0.0), (0.36, 0.07, 0.04), (0.43, 0.16, z))
    K.lathe('painted_green', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.16), (0.02, 0.2), (0.02, 0.24), (0.0, 0.24)], loc=(-0.5, 0.1, 0.72), seg=8)
    add_box(K.bm('painted_grey', 0.0), (0.5, 0.2, 0.02), (-0.4, 0.14, 0.71))


def wm_hose(K):
    """A hose reel and a low stowage box under a window."""
    K.box('painted_white', (1.1, 0.34, 0.5), (0.0, 0.1, 0.4), bevel=0.02)
    K.box('painted_orange', (1.11, 0.35, 0.05), (0.0, 0.1, 0.62), bevel=0.0)
    for sx in (-0.3, 0.3):
        add_box(K.bm('steel', 0.0), (0.05, 0.016, 0.085), (sx, -0.078, 0.6))
    K.box('painted_dark', (1.0, 0.3, 0.14), (0, 0.1, 0.08), bevel=0.0)
    K.cyl('painted_grey', 0.17, 0.09, (-0.2, 0.17, 1.08), seg=12, axis='Y')
    for i in range(3):
        K.torus('painted_orange', 0.19 + 0.012 * (i % 2), 0.026, (-0.2, 0.05 + i * 0.05, 1.08), seg=10, ring_seg=3, axis='Y')
    K.cyl('painted_dark', 0.25, 0.012, (-0.2, 0.22, 1.08), seg=12, axis='Y')
    K.hose('painted_orange', [(-0.39, 0.1, 1.05), (-0.42, 0.08, 0.86), (-0.3, 0.02, 0.76)], 0.02, seg=4, n=3)
    K.cyl('steel', 0.022, 0.1, (-0.28, 0.0, 0.74), seg=6, rot=(rad(60), 0, 0))
    ctb(K, (0.42, 0.26, 0.24), (0.3, 0.1, 0.65), yaw=0.06, label='painted_blue')


def wm_soil(K):
    """Where the regolith comes in: buckets of Mars, a heap on a tarp, a shovel against the wall."""
    K.plate('tarp', 1.1, 0.62, (0.25, 0.02, 0.006))
    K.ico('regolith', 0.3, (0.3, 0.05, 0.03), subdiv=2, scale=(1.25, 0.8, 0.42))
    for bx in (-0.55, -0.9):
        K.lathe('plastic_white', [(0.0, 0.0), (0.13, 0.0), (0.16, 0.30), (0.17, 0.30), (0.17, 0.32), (0.15, 0.32)], loc=(bx, 0.08, 0.0), seg=10, cap_end=False)
        K.lathe('regolith', [(0.0, 0.31), (0.08, 0.3), (0.152, 0.27)], loc=(bx, 0.08, 0.0), seg=10, cap_start=False, cap_end=False)
        K.tube('steel', [(bx - 0.165, 0.08, 0.3), (bx - 0.1, 0.0, 0.14), (bx + 0.1, 0.0, 0.14), (bx + 0.165, 0.08, 0.3)], 0.006, seg=3)
    K.tube('painted_yellow', [(0.95, 0.24, 1.25), (0.92, 0.02, 0.3)], 0.018, seg=5)
    K.box('steel', (0.2, 0.012, 0.28), (0.915, -0.005, 0.17), rot=(rad(-13), 0, 0), bevel=0.0)
    K.tube('painted_yellow', [(0.84, 0.26, 1.33), (1.06, 0.26, 1.33)], 0.016, seg=4)


def wm_water(K):
    """Irrigation water: a row of cans, a funnel, a coiled hose on a hook."""
    for i, yaw in enumerate((0.1, -0.15, 0.05)):
        jerrycan(K, (-0.5 + i * 0.4, 0.08, 0.0), yaw=yaw)
    jerrycan(K, (0.75, 0.06, 0.0), m='plastic_white', yaw=0.4)
    K.lathe('painted_orange', [(0.11, 0.0), (0.02, 0.1), (0.02, 0.17)], loc=(-0.1, 0.08, 0.5), seg=8, cap_start=False, cap_end=False, rot=(math.pi, 0, 0))
    for i in range(2):
        K.torus('painted_blue', 0.17, 0.02, (0.85, 0.2 - i * 0.045, 1.15), seg=10, ring_seg=3, axis='Y')
    add_box(K.bm('steel', 0.0), (0.05, 0.14, 0.03), (0.85, 0.2, 1.33))


def wm_ladder(K):
    """A ladder leaning by the window and a couple of bags at its foot."""
    lean = rad(-12)
    for sx in (-0.21, 0.21):
        add_box(K.bm('aluminium', 0.0), (0.03, 0.06, 2.5), (0.72 + sx, -0.02, 1.25), rot=(lean, 0, 0))
    for i in range(8):
        zz = 0.3 + i * 0.29
        add_box(K.bm('aluminium', 0.0), (0.42, 0.03, 0.03), (0.72, -0.02 + (zz - 1.25) * math.tan(-lean), zz), rot=(lean, 0, 0))
    ctb(K, (0.6, 0.36, 0.3), (-0.35, 0.06, 0.0), yaw=0.1, label='painted_green')
    ctb(K, (0.5, 0.3, 0.26), (-0.3, 0.05, 0.3), yaw=-0.12, label='painted_orange')
    crate(K, (0.5, 0.36, 0.3), (-0.95, 0.06, 0.0), lid='painted_grey', yaw=0.2)


def wm_tools(K):
    """A rolling tool chest and a coiled extension lead."""
    K.box('painted_red', (0.7, 0.42, 0.78), (-0.2, 0.05, 0.50), bevel=0.016)
    for i in range(4):
        add_box(K.bm('painted_red', 0.0), (0.64, 0.012, 0.15), (-0.2, -0.166, 0.22 + i * 0.18))
        add_box(K.bm('steel', 0.0), (0.5, 0.02, 0.022), (-0.2, -0.176, 0.27 + i * 0.18))
    K.box('steel', (0.72, 0.44, 0.02), (-0.2, 0.05, 0.90), bevel=0.0)
    for sx in (-0.48, 0.08):
        K.cyl('rubber', 0.05, 0.035, (sx, 0.05, 0.05), seg=8, axis='X')
    K.box('painted_yellow', (0.2, 0.09, 0.07), (-0.3, 0.02, 0.945), rot=(0, 0, 0.3), bevel=0.012)
    K.tube('steel', [(-0.05, 0.0, 0.92), (0.1, 0.1, 0.92)], 0.012, seg=4)
    for i in range(2):
        K.torus('painted_orange', 0.16, 0.022, (0.7, 0.2 - i * 0.05, 1.05), seg=10, ring_seg=3, axis='Y')
    add_box(K.bm('steel', 0.0), (0.05, 0.14, 0.03), (0.7, 0.2, 1.22))


def wall_modules(interior):
    plan = {2: ('bags', 3), 4: ('panel', 0), 5: ('bottles', 0), 6: ('rack', 5), 8: ('rack', 9), 9: ('bags', 7), 10: ('hose', 0),
            11: ('board', 0), 13: ('rack', 2), 17: ('medical', 0), 18: ('panel', 1), 19: ('bottles', 1),
            21: ('bags', 5), 22: ('hose', 1), 20: ('soil', 0), 16: ('water', 0), 14: ('ladder', 0), 7: ('tools', 0)}
    for g, (kind, seed) in plan.items():
        K = wall_kit('wall', interior, g)
        if kind == 'bags':
            wm_bags(K, seed, rows=3 if seed % 2 else 4, cols=3)
        elif kind == 'rack':
            wm_rack(K, seed, w=1.2 if seed != 2 else 1.5)
        elif kind == 'bottles':
            wm_bottles(K) if seed == 0 else wm_bottles(K, cols=('painted_blue', 'painted_blue', 'painted_grey'), h=1.5)
        elif kind == 'panel':
            wm_panel(K)
        elif kind == 'board':
            wm_board(K)
        elif kind == 'medical':
            wm_medical(K)
        elif kind == 'hose':
            wm_hose(K)
        else:
            {'soil': wm_soil, 'water': wm_water, 'ladder': wm_ladder, 'tools': wm_tools}[kind](K)
        K.finish()


def eva_suit(K, loc, yaw=0.0, stripe='suit_orange'):
    """An empty surface suit hanging from its neck ring (simplified: it is set dressing)."""
    x, y, z = loc
    c, s = math.cos(yaw), math.sin(yaw)

    def P(px, py, pz):
        return (x + px * c - py * s, y + px * s + py * c, z + pz)
    rot = (0, 0, yaw)
    K.box('suit_white', (0.52, 0.30, 0.50), P(0, 0, 1.27), rot=rot, bevel=0.07, seg=2)
    K.box('suit_white', (0.44, 0.27, 0.26), P(0, 0, 0.94), rot=rot, bevel=0.06, seg=2)
    K.box('suit_grey', (0.46, 0.29, 0.05), P(0, 0, 1.05), rot=rot, bevel=0.0)
    K.torus('aluminium', 0.15, 0.022, P(0, 0, 1.54), seg=10, ring_seg=4)
    K.cyl('void', 0.14, 0.01, P(0, 0, 1.53), seg=10)
    K.box('painted_grey', (0.24, 0.05, 0.18), P(0, -0.165, 1.3), rot=rot, bevel=0.012)
    add_box(K.bm('screen', 0.0), (0.12, 0.008, 0.06), P(0.03, -0.193, 1.33), rot=rot)
    add_box(K.bm(stripe, 0.0), (0.53, 0.31, 0.05), P(0, 0, 1.46), rot=rot)
    for sx in (-1, 1):
        K.tube('suit_white', [P(sx * 0.29, 0, 1.44), P(sx * 0.34, 0.0, 1.14), P(sx * 0.33, -0.05, 0.86)], [0.085, 0.075, 0.062], seg=7)
        K.tube(stripe, [P(sx * 0.325, -0.005, 1.26), P(sx * 0.335, 0.0, 1.18)], 0.081, seg=7, caps=False)
        K.box('suit_grey', (0.11, 0.09, 0.16), P(sx * 0.33, -0.06, 0.78), rot=rot, bevel=0.03)
        K.tube('suit_white', [P(sx * 0.13, 0, 0.86), P(sx * 0.14, -0.02, 0.5), P(sx * 0.14, 0.0, 0.16)], [0.105, 0.09, 0.08], seg=7)
        K.tube('suit_grey', [P(sx * 0.14, -0.018, 0.54), P(sx * 0.14, -0.02, 0.46)], 0.096, seg=7, caps=False)
        K.box('suit_grey', (0.15, 0.30, 0.13), P(sx * 0.14, -0.04, 0.07), rot=rot, bevel=0.035)
    # life-support pack on the back
    K.box('suit_white', (0.46, 0.2, 0.62), P(0, 0.24, 1.22), rot=rot, bevel=0.04)
    add_box(K.bm(stripe, 0.0), (0.465, 0.205, 0.06), P(0, 0.24, 1.42), rot=rot)
    K.box('painted_grey', (0.3, 0.03, 0.2), P(0, 0.345, 1.15), rot=rot, bevel=0.0)


def helmet(K, loc, yaw=0.0):
    x, y, z = loc
    K.sphere('suit_white', 0.17, (x, y, z + 0.17), seg=8, rings=6)
    K.sphere('visor_gold', 0.15, (x + 0.05 * math.sin(yaw), y - 0.05 * math.cos(yaw), z + 0.18), seg=8, rings=5, scale=(0.94, 0.94, 0.88))
    K.cyl('aluminium', 0.14, 0.04, (x, y, z + 0.02), seg=8)


def chair_simple(K, loc, yaw=0.0, m='suit_grey'):
    """A light stacking chair: fabric seat and back on a tube frame. It faces local -Y before yaw."""
    x, y, z = loc
    c, s = math.cos(yaw), math.sin(yaw)

    def P(px, py, pz):
        return (x + px * c - py * s, y + px * s + py * c, z + pz)
    rot = (0, 0, yaw)
    K.box(m, (0.42, 0.42, 0.045), P(0, 0, 0.455), rot=rot, bevel=0.014)
    K.box(m, (0.40, 0.035, 0.30), P(0, 0.205, 0.80), rot=(rad(8), 0, yaw), bevel=0.014)
    for sx in (-0.19, 0.19):
        K.tube('aluminium', [P(sx, -0.19, 0.0), P(sx, -0.18, 0.44)], 0.013, seg=5)
        K.tube('aluminium', fillet([P(sx, 0.23, 0.0), P(sx, 0.19, 0.44), P(sx, 0.225, 0.95)], 0.05, 2), 0.013, seg=5)
    K.tube('aluminium', [P(-0.19, 0.0, 0.2), P(0.19, 0.0, 0.2)], 0.009, seg=4)


def set_dressing(interior):
    # --- galley table with two chairs, a meal and a tablet --------------------------------------
    K = Kit('table', interior, loc=(1.75, 2.35, FLOOR_Z), yaw=rad(38))
    K.box('painted_white', (1.5, 0.8, 0.04), (0, 0, 0.74), bevel=0.012)
    add_box(K.bm('aluminium', 0.0), (1.52, 0.82, 0.02), (0, 0, 0.715))
    for sx in (-0.66, 0.66):
        K.tube('aluminium', fillet([(sx, -0.34, 0.0), (sx, -0.34, 0.70), (sx, 0.34, 0.70), (sx, 0.34, 0.0)], 0.05, 2), 0.02, seg=6)
        add_box(K.bm('aluminium', 0.0), (0.03, 0.6, 0.03), (sx, 0, 0.2))
    K.tube('aluminium', [(-0.66, 0, 0.2), (0.66, 0, 0.2)], 0.014, seg=5)
    chair_simple(K, (-0.3, 0.74, 0.0), yaw=rad(8))
    chair_simple(K, (0.38, -0.80, 0.0), yaw=rad(196))
    chair_simple(K, (1.12, 0.1, 0.0), yaw=rad(-80), m='suit_orange')
    # meal tray, potato halves, mug, bottle, tablet
    K.box('painted_grey', (0.42, 0.3, 0.02), (-0.3, -0.12, 0.77), rot=(0, 0, rad(6)), bevel=0.006)
    K.cyl('plastic_white', 0.1, 0.012, (-0.36, -0.12, 0.787), seg=10)
    for i in range(3):
        K.ico('potato', 0.045, (-0.4 + i * 0.05, -0.14 + (i % 2) * 0.05, 0.80), subdiv=1, scale=(1.2, 0.8, 0.6), rot=(0, 0, i * 1.1))
    K.lathe('plastic_white', [(0.0, 0.0), (0.036, 0.0), (0.04, 0.09), (0.034, 0.09), (0.03, 0.012)], loc=(-0.14, -0.08, 0.78), seg=8, cap_end=False)
    K.lathe('painted_red', [(0.0, 0.0), (0.03, 0.0), (0.032, 0.11), (0.014, 0.15), (0.014, 0.18), (0.0, 0.18)], loc=(-0.02, 0.2, 0.76), seg=8)
    K.box('plastic_black', (0.26, 0.19, 0.012), (0.36, 0.1, 0.766), rot=(0, 0, rad(-20)), bevel=0.004)
    add_box(K.bm('screen', 0.0), (0.23, 0.16, 0.004), (0.36, 0.1, 0.774), rot=(0, 0, rad(-20)))
    K.anchor('col_table', (0, 0, 0), radius=1.15)
    K.finish()

    # --- storage lockers by the door (gore 1) ----------------------------------------------------
    K = wall_kit('lockers', interior, 1, r=7.9)
    for i in range(3):
        x = (i - 1) * 0.62
        K.box('painted_white', (0.6, 0.5, 1.95), (x, 0.12, 0.1 + 0.975), bevel=0.016)
        K.box('painted_white', (0.52, 0.016, 1.8), (x, -0.133, 1.08), bevel=0.008)
        for z in (0.42, 1.78):
            for k in range(3):
                add_box(K.bm('painted_dark', 0.0), (0.3, 0.008, 0.018), (x, -0.142, z + k * 0.04))
        K.handle('steel', (x + 0.2, -0.14, 1.0), (x + 0.2, -0.14, 1.2), (0, -0.035, 0), r=0.008, seg=4)
        add_box(K.bm(('painted_orange', 'painted_blue', 'painted_yellow')[i], 0.0), (0.2, 0.008, 0.07), (x - 0.08, -0.142, 1.5))
    K.box('painted_dark', (1.82, 0.46, 0.1), (0, 0.12, 0.05), bevel=0.0)
    ctb(K, (0.55, 0.36, 0.26), (-0.5, 0.12, 2.05), label='painted_orange')
    crate(K, (0.5, 0.38, 0.28), (0.4, 0.12, 2.05), lid='painted_blue', yaw=0.05)
    K.anchor('col_lockers', (0, 0.1, 0), radius=1.05)
    K.finish()

    # --- suit rack by the door (gore 23): two suits on a frame, helmets above, boots below --------
    K = wall_kit('suit_rack', interior, 23, r=7.85)
    for sx in (-0.95, 0.95):
        K.box('aluminium', (0.05, 0.05, 2.15), (sx, 0.2, 1.075), bevel=0.006)
        add_box(K.bm('aluminium', 0.0), (0.05, 0.6, 0.04), (sx, -0.02, 0.02))
        K.tube('aluminium', [(sx, -0.25, 0.04), (sx, 0.2, 0.8)], 0.014, seg=4)
    K.box('painted_white', (2.0, 0.42, 0.035), (0, 0.1, 1.86), bevel=0.008)
    K.tube('steel', [(-0.95, 0.02, 1.72), (0.95, 0.02, 1.72)], 0.016, seg=6)
    K.box('painted_grey', (1.9, 0.5, 0.03), (0, 0.02, 0.1), bevel=0.0)
    K.box('canvas', (1.86, 0.016, 1.5), (0, 0.24, 1.05), bevel=0.0)
    for i, (sx, stripe) in enumerate(((-0.48, 'suit_orange'), (0.48, 'painted_blue'))):
        eva_suit(K, (sx, -0.02, 0.12), yaw=rad(-4 + 8 * i), stripe=stripe)
        K.tube('steel', [(sx, 0.02, 1.72), (sx, -0.0, 1.66)], 0.008, seg=4)
        helmet(K, (sx - 0.1, 0.1, 1.88), yaw=rad(-10 + 20 * i))
    K.box('painted_dark', (0.3, 0.3, 0.2), (0.75, 0.12, 1.98), bevel=0.02)
    K.anchor('col_suit_rack', (0, 0.0, 0), radius=1.1)
    K.finish()

    # --- a stack of cargo cases near the workbench --------------------------------------------
    K = Kit('crates', interior, loc=(-3.35, -6.25, FLOOR_Z), yaw=rad(152))
    crate(K, (0.9, 0.6, 0.5), (0, 0, 0.0))
    crate(K, (0.9, 0.6, 0.5), (0.02, 0.01, 0.5), lid='painted_blue', yaw=0.04)
    crate(K, (0.7, 0.5, 0.42), (0.86, -0.1, 0.0), lid='painted_yellow', yaw=0.3)
    ctb(K, (0.6, 0.4, 0.3), (0.82, -0.08, 0.42), yaw=0.2, label='painted_orange')
    ctb(K, (0.55, 0.36, 0.3), (-0.05, -0.62, 0.0), yaw=-0.3, label='painted_blue')
    K.anchor('col_crates', (0.3, -0.1, 0), radius=1.0)
    K.finish()

    # --- treadmill with a bungee harness between the bunk and the desk ---------------------------
    K = Kit('treadmill', interior, loc=(-2.35, 6.35, FLOOR_Z), yaw=rad(-160))
    K.box('painted_dark', (0.72, 1.7, 0.14), (0, 0, 0.09), bevel=0.02)
    K.box('rubber', (0.5, 1.5, 0.02), (0, 0, 0.165), bevel=0.0)
    for sy in (-0.75, 0.75):
        K.cyl('steel', 0.05, 0.56, (0, sy, 0.12), seg=8, axis='X')
    for sx in (-1, 1):
        K.box('painted_grey', (0.08, 1.74, 0.06), (sx * 0.33, 0, 0.17), bevel=0.012)
        K.tube('aluminium', fillet([(sx * 0.33, 0.7, 0.18), (sx * 0.33, 0.78, 1.15), (sx * 0.33, 0.2, 1.05)], 0.1, 3), 0.02, seg=6)
        K.hose('suit_orange', [(sx * 0.3, -0.1, 0.2), (sx * 0.24, -0.05, 0.6), (sx * 0.2, 0.0, 0.95)], 0.009, seg=3, n=2)
    K.box('painted_dark', (0.6, 0.06, 0.28), (0, 0.80, 1.22), rot=(rad(-18), 0, 0), bevel=0.012)
    add_box(K.bm('screen', 0.0), (0.4, 0.008, 0.16), (0, 0.762, 1.225), rot=(rad(-18), 0, 0))
    K.tube('aluminium', [(-0.33, 0.78, 1.14), (0.33, 0.78, 1.14)], 0.018, seg=6)
    K.torus('suit_grey', 0.2, 0.025, (0, 0.0, 0.96), seg=10, ring_seg=4, axis='Z')
    K.anchor('col_treadmill', (0, 0, 0), radius=0.95)
    K.finish()


def airlock_fittings(interior):
    """Inside the airlock: suit lockers on the west side, a bench with life-support packs on the east."""
    K = Kit('airlock_in', interior)
    yc = (Y_ROOM0 + Y_ROOM1) / 2
    xw = -AXI
    for i in range(3):
        y = yc + (i - 1) * 0.8
        K.box('painted_white', (0.52, 0.76, 2.05), (xw + 0.27, y, FLOOR_Z + 1.07), bevel=0.016)
        K.box('painted_white', (0.016, 0.68, 1.9), (xw + 0.535, y, FLOOR_Z + 1.12), bevel=0.008)
        for z in (0.45, 1.85):
            for k in range(3):
                add_box(K.bm('painted_dark', 0.0), (0.008, 0.4, 0.018), (xw + 0.545, y, FLOOR_Z + z + k * 0.04))
        K.handle('steel', (xw + 0.54, y + 0.26, FLOOR_Z + 1.0), (xw + 0.54, y + 0.26, FLOOR_Z + 1.2), (0.035, 0, 0), r=0.008, seg=4)
        add_box(K.bm(('painted_orange', 'painted_blue', 'painted_yellow')[i], 0.0), (0.008, 0.24, 0.08), (xw + 0.545, y - 0.1, FLOOR_Z + 1.55))
        K.text('painted_dark', str(i + 1), 0.12, (xw + 0.547, y - 0.1, FLOOR_Z + 1.72), rot=(rad(90), 0, rad(90)))
    K.box('painted_dark', (0.48, 2.36, 0.08), (xw + 0.27, yc, FLOOR_Z + 0.04), bevel=0.0)
    helmet(K, (xw + 0.3, yc - 0.8, FLOOR_Z + 2.1), yaw=rad(90))
    helmet(K, (xw + 0.3, yc + 0.1, FLOOR_Z + 2.1), yaw=rad(70))
    # east: slatted bench, boots, two packs docked on wall cradles, a recharge panel with hoses
    xe = AXI
    for i in range(4):
        K.box('aluminium', (0.085, 2.1, 0.03), (xe - 0.07 - i * 0.105, yc, FLOOR_Z + 0.46), bevel=0.006)
    for sy in (-0.95, 0, 0.95):
        K.tube('aluminium', fillet([(xe - 0.03, yc + sy, FLOOR_Z + 0.44), (xe - 0.42, yc + sy, FLOOR_Z + 0.44), (xe - 0.42, yc + sy, FLOOR_Z)], 0.04, 2), 0.016, seg=5)
    for i in range(2):
        for k in range(2):
            by = yc - 0.7 + i * 0.9 + k * 0.17
            K.box('suit_grey', (0.3, 0.13, 0.12), (xe - 0.22, by, FLOOR_Z + 0.06), bevel=0.03)
            K.cyl('suit_white', 0.065, 0.22, (xe - 0.12, by, FLOOR_Z + 0.2), seg=8)
    for i, stripe in enumerate(('suit_orange', 'painted_blue')):
        y = yc - 0.55 + i * 1.1
        K.box('suit_white', (0.22, 0.48, 0.64), (xe - 0.13, y, FLOOR_Z + 1.25), bevel=0.04)
        add_box(K.bm(stripe, 0.0), (0.225, 0.485, 0.06), (xe - 0.13, y, FLOOR_Z + 1.47))
        K.box('painted_grey', (0.03, 0.3, 0.2), (xe - 0.245, y, FLOOR_Z + 1.15), bevel=0.0)
        add_box(K.bm('light_green', 0.0), (0.008, 0.04, 0.04), (xe - 0.262, y + 0.08, FLOOR_Z + 1.2))
        K.box('painted_grey', (0.1, 0.56, 0.05), (xe - 0.05, y, FLOOR_Z + 0.9), bevel=0.0)
        K.hose('rubber', [(xe - 0.13, y + 0.24, FLOOR_Z + 1.0), (xe - 0.2, y + 0.4, FLOOR_Z + 0.8), (xe - 0.06, y + 0.52, FLOOR_Z + 1.1), (xe - 0.03, y + 0.55, FLOOR_Z + 1.5)], 0.014, seg=4, n=3)
    K.box('painted_grey', (0.08, 0.46, 0.6), (xe - 0.04, yc, FLOOR_Z + 1.72), bevel=0.012)
    gauge(K, (xe - 0.082, yc - 0.1, FLOOR_Z + 1.85), 0.055, facing=(-1, 0, 0), needle=0.6, rim='steel')
    gauge(K, (xe - 0.082, yc + 0.1, FLOOR_Z + 1.85), 0.055, facing=(-1, 0, 0), needle=0.4, rim='steel')
    add_box(K.bm('painted_yellow', 0.0), (0.008, 0.3, 0.1), (xe - 0.083, yc, FLOOR_Z + 1.6))
    K.box('painted_white', (0.26, 2.2, 0.03), (xe - 0.14, yc, FLOOR_Z + 2.1), bevel=0.006)
    extinguisher(K, (1.75, Y_ROOM1 + 0.12, FLOOR_Z))
    K.box('painted_green', (0.34, 0.14, 0.26), (-1.62, Y_ROOM1 + 0.075, FLOOR_Z + 1.5), bevel=0.014)
    K.text('plastic_white', 'O2', 0.12, (-1.62, Y_ROOM1 + 0.148, FLOOR_Z + 1.5), rot=(rad(90), 0, math.pi))
    K.box('painted_yellow', (0.62, 0.012, 0.2), (1.62, Y_ROOM0 - 0.008, FLOOR_Z + 2.05), bevel=0.0)
    K.text('painted_dark', 'CHECK SUIT', 0.075, (1.62, Y_ROOM0 - 0.016, FLOOR_Z + 2.05))
    helmet(K, (xe - 0.16, yc - 0.6, FLOOR_Z + 2.115), yaw=rad(-90))
    ctb(K, (0.4, 0.22, 0.2), (xe - 0.14, yc + 0.5, FLOOR_Z + 2.115), yaw=rad(90), label='painted_orange')
    K.finish()


def shell_radius(rows, amps, cols, th, z, sign):
    """Radius of a lobed shell (as built by lobed_shell) on its wall rows at angle th, height z."""
    t = ((th - TH0) % GORE) / GORE * cols
    j = min(int(t), cols - 1)
    s = t - j
    lobe = [1 - (2 * k / cols - 1) ** 2 for k in (j, j + 1)]
    lb = lobe[0] * (1 - s) + lobe[1] * s
    for i in range(len(rows) - 1):
        z0, z1 = rows[i][1], rows[i + 1][1]
        if z0 <= z <= z1:
            f = (z - z0) / (z1 - z0)
            r0, r1 = rows[i][0] + sign * amps[i] * lb, rows[i + 1][0] + sign * amps[i + 1] * lb
            return r0 + (r1 - r0) * f
    return rows[0][0]


def hab_breach(root):
    """The breach in the back wall at (0, 8.4, 1.7): a torn hole (dark behind, ragged fabric) and
    the tarp patch taped over it. Both are modelled; the game shows one or neither. Each has an
    inside face lying on the liner and an outside face lying on the skin."""
    cz = 1.7
    rng = random.Random(8)
    n = 14
    rim = []
    for i in range(n):
        a = TAU * i / n
        rr = 0.75 * (0.78 + 0.34 * rng.random()) * (1.0 + 0.12 * math.cos(2 * a))
        rim.append((rr * math.cos(a), rr * math.sin(a) * 0.92))
    in_rows = [(A_IN, z, 1.0, 0.0) for z, _ in IN_WALL]
    in_amps = [in_amp(A_IN, z) * b for z, b in IN_WALL]
    out_rows = [out_wall(z) for z in OUT_WALL_Z]
    out_amps = [out_amp(r, z) for r, z, _, _ in out_rows]

    H = Kit('breach_hole', part('breach_hole', parent=root))
    Pk = Kit('breach_patch', part('breach_patch', parent=root))
    hw, hh = 1.0, 0.95

    def bulge(u, v):
        return 0.10 * max(0.0, 1 - (u / hw) ** 2) * max(0.0, 1 - (v / hh) ** 2)

    for sgn, fab in ((-1, 'torn_liner'), (1, 'torn_skin')):
        def on_wall(u, v, off):
            """A point u to the side and v above the breach centre, `off` proud of the wall surface."""
            th = math.pi / 2 - u / R_IN
            z = cz + v
            r = shell_radius(in_rows, in_amps, 4, th, z, -1.0) if sgn < 0 else shell_radius(out_rows, out_amps, 6, th, z, 1.0)
            return Vector(pol(r + sgn * off, th, z))
        # the void, lying just proud of the wall so that it covers it
        bm_void = H.open('void', smooth=30.0 + sgn)
        # (offsets are generous: the hole's coarse facets must clear the creases of the quilting)
        c = bm_void.verts.new(on_wall(0, 0, 0.05))
        ring = [bm_void.verts.new(on_wall(u, v, 0.05)) for u, v in rim]
        mids = [bm_void.verts.new(on_wall(u * 0.5, v * 0.5, 0.05)) for u, v in rim]
        for i in range(n):
            k = (i + 1) % n
            bm_void.faces.new((c, mids[i], mids[k]))
            bm_void.faces.new((mids[i], ring[i], ring[k], mids[k]))
        # ragged flaps of torn fabric curling away from the rim
        bm_flap = H.open(fab, smooth=31.0 + sgn)
        for i in range(n):
            (u0, v0), (u1, v1) = rim[i], rim[(i + 1) % n]
            um, vm = (u0 + u1) / 2, (v0 + v1) / 2
            k = (1.18 + 0.3 * rng.random()) * 0.72
            tip = on_wall(um * k, vm * k, 0.13 + 0.14 * rng.random())
            bm_flap.faces.new((bm_flap.verts.new(on_wall(u0 * 1.12, v0 * 1.12, 0.054)), bm_flap.verts.new(on_wall(u1 * 1.12, v1 * 1.12, 0.054)),
                               bm_flap.verts.new(tip)))
        # stressed, darkened fabric round the tear
        bm_ring = H.open('canvas_dark', smooth=33.0 + sgn)
        for i in range(n):
            (u0, v0), (u1, v1) = rim[i], rim[(i + 1) % n]
            q = [on_wall(u0, v0, 0.052), on_wall(u1, v1, 0.052), on_wall(u1 * 1.25, v1 * 1.25, 0.012), on_wall(u0 * 1.25, v0 * 1.25, 0.012)]
            bm_ring.faces.new([bm_ring.verts.new(p) for p in q])
        # the patch: a tarp bulging under pressure (outwards), taped round the edge and in a cross
        puff, base = (1.0, 0.04) if sgn > 0 else (0.25, 0.06)
        bm_tarp = Pk.open('tarp', smooth=60.0 + sgn)
        nx = 6
        grid = [[bm_tarp.verts.new(on_wall(-hw + 2 * hw * i / nx, -hh + 2 * hh * j / nx,
                                           base + puff * bulge(-hw + 2 * hw * i / nx, -hh + 2 * hh * j / nx)
                                           + 0.01 * math.sin(i * 2.3 + j * 1.7))) for j in range(nx + 1)] for i in range(nx + 1)]
        for i in range(nx):
            for j in range(nx):
                bm_tarp.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
        bm_tape = Pk.open('tape', smooth=62.0 + sgn)

        def strip(p0, p1, w, lift):
            (u0, v0), (u1, v1) = p0, p1
            d = Vector((u1 - u0, v1 - v0))
            m = max(2, int(d.length / 0.3))
            nn = Vector((-d.y, d.x)).normalized() * w / 2
            prev = None
            for k in range(m + 1):
                u, v = u0 + (u1 - u0) * k / m, v0 + (v1 - v0) * k / m
                off = base + puff * bulge(u, v) + 0.012 + lift
                cur = (bm_tape.verts.new(on_wall(u + nn.x, v + nn.y, off)), bm_tape.verts.new(on_wall(u - nn.x, v - nn.y, off)))
                if prev:
                    bm_tape.faces.new((prev[0], prev[1], cur[1], cur[0]))
                prev = cur
        e = 0.03
        strip((-hw - e, -hh), (hw + e, -hh), 0.11, 0.012)
        strip((-hw - e, hh), (hw + e, hh), 0.11, 0.012)
        strip((-hw, -hh - e), (-hw, hh + e), 0.11, 0.014)
        strip((hw, -hh - e), (hw, hh + e), 0.11, 0.014)
        strip((-hw * 0.96, -hh * 0.96), (hw * 0.96, hh * 0.96), 0.10, 0.016)
        strip((-hw * 0.96, hh * 0.96), (hw * 0.96, -hh * 0.96), 0.10, 0.018)
        for bmx in (bm_void, bm_flap, bm_ring, bm_tarp, bm_tape):
            for f in bmx.faces:                     # every face looks away from the wall on its side
                f.normal_update()
                if f.normal.y * sgn < 0:
                    f.normal_flip()
    H.finish()
    Pk.finish()


STATIONS = (st_oxygenator, st_reclaimer, st_hydrazine, st_comms, st_bunk, st_food, st_fabricator)


def soften_ao(root, amounts):
    """Pull the baked occlusion of some materials toward white (large soft surfaces look
    blotchy when a coarse grid carries full-strength occlusion)."""
    for o in [root] + lib_descendants(root):
        if o.type != 'MESH':
            continue
        me = o.data
        attr = me.color_attributes.get('Col')
        if attr is None:
            continue
        names = [m.name if m else '' for m in me.materials]
        done = set()
        for p in me.polygons:
            k = amounts.get(names[p.material_index]) if names else None
            if k is None:
                continue
            for vi in p.vertices:
                if vi in done:
                    continue
                done.add(vi)
                a = attr.data[vi].color[0]
                a = 1.0 - (1.0 - a) * k
                attr.data[vi].color = (a, a, a, 1.0)


def paint_ao(root, fns):
    """Replace the baked occlusion of some materials by a function of position. Thin overlays
    (straps over the skin, ribs over the liner) sit a few centimetres above the vertices of the
    surface under them and would otherwise blacken exactly those vertices."""
    for o in [root] + lib_descendants(root):
        if o.type != 'MESH':
            continue
        me = o.data
        attr = me.color_attributes.get('Col')
        if attr is None:
            continue
        names = [m.name if m else '' for m in me.materials]
        mw = o.matrix_world
        done = set()
        for p in me.polygons:
            fn = fns.get(names[p.material_index]) if names else None
            if fn is None:
                continue
            for vi in p.vertices:
                if vi in done:
                    continue
                done.add(vi)
                a = max(0.0, min(1.0, fn(mw @ me.vertices[vi].co)))
                attr.data[vi].color = (a, a, a, 1.0)


def skin_ao(co):
    """Soft shading for the outer skin: darker in the valleys under the straps and near the ground."""
    t = ((math.atan2(co.y, co.x) - TH0) % GORE) / GORE
    lobe = 1 - (2 * t - 1) ** 2
    a = 0.70 + 0.30 * lobe ** 0.55
    return a * (0.82 + 0.18 * min(1.0, max(0.0, (co.z - 0.7) / 0.9)))


def liner_ao(co):
    """The quilted liner: darker toward the ribs and the floor."""
    t = ((math.atan2(co.y, co.x) - TH0) % GORE) / GORE
    lobe = 1 - (2 * t - 1) ** 2
    a = 0.76 + 0.24 * lobe ** 0.5
    return a * (0.80 + 0.20 * min(1.0, max(0.0, co.z / 0.9)))


def finish(root, name, soften=None, paint=None, samples=40, distance=1.1):
    collapse(root)
    if not FAST:
        bake_ao(root, samples=samples, distance=distance)
        if soften:
            soften_ao(root, soften)
        if paint:
            paint_ao(root, paint)
    return export_model(root, name, ao=False, do_collapse=False)


# ----------------------------------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------------------------------
def build_hab():
    ensure_mats()
    root = part('hab')
    interior = part('interior', parent=root)
    hab_exterior(root)
    hab_airlock(root, interior)
    hab_interior_shell(interior)
    hab_floor(interior)
    for fn in STATIONS:
        fn(interior)
    wall_modules(interior)
    set_dressing(interior)
    airlock_fittings(interior)
    hab_breach(root)
    anchor('floor', root, loc=(0, 0, FLOOR_Z), height=FLOOR_Z)
    tally(root, 'hab')
    return finish(root, 'hab', soften={'tarp': 0.5, 'hab_floor': 0.85, 'hab_floor_b': 0.85},
                  paint={'canvas': skin_ao, 'hab_skin_b': skin_ao, 'hab_liner': liner_ao, 'hab_liner_b': liner_ao})


# ----------------------------------------------------------------------------------------------
# farm_plot.glb
# ----------------------------------------------------------------------------------------------
def _leaflet(bm, base, tip, width, cup=0.18, up=Vector((0, 0, 1)), simple=False):
    """An ovate leaflet folded along its midrib: four triangles (two when `simple`)."""
    base, tip = Vector(base), Vector(tip)
    axis = tip - base
    side = axis.cross(up)
    if side.length < 1e-6:
        side = Vector((1, 0, 0))
    side.normalize()
    nrm = side.cross(axis).normalized()
    if nrm.z < 0:
        nrm = -nrm
    vb, vt = bm.verts.new(base), bm.verts.new(tip)
    if simple:
        mid = base.lerp(tip, 0.45)
        vl, vr = bm.verts.new(mid - side * width / 2 + nrm * width * cup), bm.verts.new(mid + side * width / 2 + nrm * width * cup)
        tris = ((vb, vr, vt), (vb, vt, vl))
    else:
        p1, p2 = base.lerp(tip, 0.28), base.lerp(tip, 0.66)
        l1, r1 = bm.verts.new(p1 - side * width * 0.44 + nrm * width * cup), bm.verts.new(p1 + side * width * 0.44 + nrm * width * cup)
        l2, r2 = bm.verts.new(p2 - side * width * 0.5 + nrm * width * cup * 1.2), bm.verts.new(p2 + side * width * 0.5 + nrm * width * cup * 1.2)
        tris = ((vb, r1, r2), (vb, r2, vt), (vb, vt, l2), (vb, l2, l1))
    for tri in tris:
        f = bm.faces.new(tri)
        f.normal_update()
        if f.normal.z < 0:
            f.normal_flip()


def _compound_leaf(bm, base, direction, length, rng, droop=0.0, pairs=2, dead=False):
    """A potato leaf: pairs of leaflets along a rachis and a larger terminal leaflet."""
    d = Vector(direction).normalized()
    up = Vector((0, 0, 1))
    side = d.cross(up)
    if side.length < 1e-6:
        side = Vector((1, 0, 0))
    side.normalize()
    ts = (0.0, 0.34, 0.64, 0.82)
    pts = [Vector(base) + d * length * t - up * droop * length * t * t for t in ts]
    ll = length * (0.40 if dead else 0.46)
    for k in range(1, pairs + 1):
        p = pts[k]
        for s in (-1, 1):
            dirn = (side * s * 0.95 + d * 0.45 - up * (0.9 if dead else 0.12 + droop * 0.5)).normalized()
            L = ll * (1.0 - 0.1 * k) * rng.uniform(0.85, 1.1)
            _leaflet(bm, p, p + dirn * L, L * (0.42 if dead else 0.62), cup=(-0.4 if dead else 0.16), simple=dead)
    dirn = (d - up * (1.2 if dead else 0.15 + droop)).normalized()
    L = ll * 1.3
    _leaflet(bm, pts[-1], pts[-1] + dirn * L, L * (0.42 if dead else 0.64), cup=(-0.4 if dead else 0.16), simple=dead)
    return pts


def _potato_plant(K, loc, rng, dead=False, size=1.0, bound=None):
    x, y, z = loc
    stem_m = 'stem_dead' if dead else 'stem'
    leaves = [K.open(m, smooth=80.0) for m in (('leaf_dead',) if dead else ('leaf', 'leaf_b'))]
    n_stem = 4
    a0 = rng.uniform(0, TAU)
    for i in range(n_stem):
        a = a0 + TAU * i / n_stem + rng.uniform(-0.3, 0.3)
        out = Vector((math.cos(a), math.sin(a), 0))
        if dead:
            # collapsed: the stem flops outward and lies on the soil
            reach = size * rng.uniform(0.2, 0.34)
            hh = rng.uniform(0.09, 0.2)
            pts = [Vector((x, y, z)), Vector((x, y, z + hh)) + out * reach * 0.25, Vector((x, y, z + hh * 0.75)) + out * reach * 0.7,
                   Vector((x, y, z + 0.02)) + out * reach]
        else:
            lean = rng.uniform(0.3, 0.7) if i else 0.06
            h = size * rng.uniform(0.34, 0.46) * (1.0 if i else 1.15)
            pts = [Vector((x, y, z - 0.01)), Vector((x, y, z + h * 0.45)) + out * h * lean * 0.3, Vector((x, y, z + h * 0.8)) + out * h * lean * 0.65,
                   Vector((x, y, z + h)) + out * h * lean]
        if bound:
            for p in pts:
                p.x = max(-bound[0], min(bound[0], p.x))
                p.y = max(-bound[1], min(bound[1], p.y))
        K.tube(stem_m, pts, [0.012 * size, 0.01 * size, 0.008 * size, 0.005 * size], seg=3, caps=False)
        n_leaf = 2 if dead else 3
        for k in range(n_leaf):
            base = pts[1].lerp(pts[3], (k + 0.6) / n_leaf) if k < n_leaf - 1 else pts[3]
            la = a + (k - 1) * 2.1 + rng.uniform(-0.5, 0.5)
            if dead:
                ld = Vector((math.cos(la), math.sin(la), -0.35))
                ln = size * rng.uniform(0.2, 0.28)
            else:
                ld = Vector((math.cos(la), math.sin(la), rng.uniform(0.15, 0.5) if k == n_leaf - 1 else rng.uniform(-0.05, 0.3)))
                ln = size * rng.uniform(0.24, 0.32)
            _compound_leaf(rng.choice(leaves), base, ld, ln, rng, droop=(0.6 if dead else rng.uniform(0.15, 0.5)), pairs=1 if dead else 2, dead=dead)


def build_farm_plot():
    ensure_mats()
    mat('leaf_dead', color=(0.21, 0.13, 0.05), metallic=0.0, roughness=0.8)
    mat('stem_dead', color=(0.27, 0.19, 0.09), metallic=0.0, roughness=0.8)
    mat('leaf_b', color=(0.05, 0.21, 0.04), metallic=0.0, roughness=0.65)
    root = part('farm_plot')
    K = Kit('tray', root)
    W, D, Z0, Z1 = 1.6, 1.9, 0.115, 0.34
    # the tray: a tub with a rolled rim, stiffening ribs, corner caps, short legs
    wall = 0.035
    for sx in (-1, 1):
        K.box('painted_white', (wall, D - 0.02, Z1 - Z0), (sx * (W / 2 - wall / 2 - 0.01), 0, (Z0 + Z1) / 2), bevel=0.008)
        K.box('aluminium', (0.06, D, 0.03), (sx * (W / 2 - 0.03), 0, Z1 - 0.012), bevel=0.008)
        for y in (-0.6, 0.0, 0.6):
            add_box(K.bm('painted_grey', 0.0), (0.02, 0.07, Z1 - Z0 - 0.05), (sx * (W / 2 - 0.004), y, (Z0 + Z1) / 2 - 0.012))
    for sy in (-1, 1):
        K.box('painted_white', (W - 0.02, wall, Z1 - Z0), (0, sy * (D / 2 - wall / 2 - 0.01), (Z0 + Z1) / 2), bevel=0.008)
        K.box('aluminium', (W, 0.06, 0.03), (0, sy * (D / 2 - 0.03), Z1 - 0.012), bevel=0.008)
        for x in (-0.45, 0.45):
            add_box(K.bm('painted_grey', 0.0), (0.07, 0.02, Z1 - Z0 - 0.05), (x, sy * (D / 2 - 0.004), (Z0 + Z1) / 2 - 0.012))
    K.box('painted_grey', (W - 0.04, D - 0.04, 0.03), (0, 0, Z0 + 0.012), bevel=0.0)
    add_box(K.bm('plastic_black', 0.0), (W - 0.09, D - 0.09, 0.012), (0, 0, Z0 + 0.034))
    for sx in (-1, 1):
        for sy in (-1, 1):
            K.box('painted_orange', (0.11, 0.11, 0.07), (sx * (W / 2 - 0.045), sy * (D / 2 - 0.045), Z1 - 0.022), bevel=0.012)
            add_box(K.bm('aluminium', 0.0), (0.05, 0.05, Z0 + 0.02), (sx * (W / 2 - 0.09), sy * (D / 2 - 0.09), Z0 / 2 + 0.01))
            K.cyl('rubber', 0.045, 0.02, (sx * (W / 2 - 0.09), sy * (D / 2 - 0.09), 0.01), seg=6)
        add_box(K.bm('aluminium', 0.0), (0.05, 0.05, Z0 + 0.02), (sx * (W / 2 - 0.09), 0, Z0 / 2 + 0.01))
        K.cyl('rubber', 0.045, 0.02, (sx * (W / 2 - 0.09), 0, 0.01), seg=6)
    for sx in (-1, 1):
        add_box(K.bm('aluminium', 0.0), (0.03, D - 0.2, 0.03), (sx * (W / 2 - 0.09), 0, 0.06))
    # label plate and a drain cock on the front
    K.box('painted_yellow', (0.34, 0.012, 0.11), (-0.3, -D / 2 - 0.004, 0.21), bevel=0.0)
    add_box(K.bm('painted_dark', 0.0), (0.2, 0.013, 0.02), (-0.3, -D / 2 - 0.005, 0.20))
    K.cyl('steel', 0.022, 0.07, (0.55, -D / 2 - 0.03, 0.16), seg=6, axis='Y')
    K.box('painted_blue', (0.11, 0.02, 0.025), (0.59, -D / 2 - 0.07, 0.185), bevel=0.0)
    # irrigation: a header along the left rim fed from the floor, four drip lines across the bed
    hx, hz = -W / 2 - 0.035, Z1 + 0.035
    K.pipe('painted_blue', [(hx, -D / 2 - 0.12, 0.0), (hx, -D / 2 - 0.12, hz), (hx, -D / 2 + 0.2, hz), (hx, D / 2 - 0.12, hz)], 0.02, seg=6, bend=0.06, n=2)
    K.cyl('steel', 0.028, 0.06, (hx, -D / 2 + 0.03, hz), seg=6, axis='Y')
    handwheel(K, (hx - 0.01, -D / 2 + 0.03, hz), 0.04, facing=(-1, 0, 0), m='painted_red', stem=0.04)
    for sy in (-0.5, 0.5):
        add_box(K.bm('steel', 0.0), (0.05, 0.04, 0.06), (hx + 0.012, sy * 1.2, Z1 + 0.015))
    for y in (-0.66, -0.22, 0.22, 0.66):
        K.tube('plastic_black', [(hx, y, hz), (hx + 0.07, y, hz + 0.01), (W / 2 - 0.1, y, hz - 0.012)], 0.008, seg=4)
        for x in (-0.35, 0.3):
            add_box(K.bm('painted_orange', 0.0), (0.025, 0.025, 0.02), (x, y, hz - 0.016))
    K.finish()

    # soil: a furrowed, slightly mounded bed (shown once the plot is filled)
    rng = random.Random(3)
    Sx = Kit('soil', part('soil', parent=root, loc=(0, 0, 0.30)))
    bm = Sx.open('soil', smooth=50.0)
    nx, ny = 12, 8
    w2, d2 = W / 2 - 0.05, D / 2 - 0.05
    grid = []
    for i in range(nx + 1):
        row = []
        for j in range(ny + 1):
            u, v = i / nx, j / ny
            x, y = -w2 + 2 * w2 * u, -d2 + 2 * d2 * v
            edge = min(u, 1 - u, v, 1 - v)
            h = 0.034 * math.cos(u * math.pi * 6) + 0.010 * math.sin(v * 9 + u * 3) + rng.uniform(-0.007, 0.007)
            row.append(bm.verts.new((x, y, (h + 0.012) * min(1.0, edge * 6) - 0.012 * (1 - min(1.0, edge * 6)))))
        grid.append(row)
    for i in range(nx):
        for j in range(ny):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    for i in range(7):
        Sx.ico('regolith', rng.uniform(0.018, 0.03), (rng.uniform(-w2, w2) * 0.9, rng.uniform(-d2, d2) * 0.9, 0.02), subdiv=1, scale=(1, 0.8, 0.6))
    Sx.finish()

    # the crop, alive: three rows of four bushy plants, a few tubers showing
    for name, dead in (('plants', False), ('plants_dead', True)):
        rng = random.Random(17 if not dead else 23)
        Pl = Kit(name, part(name, parent=root, loc=(0, 0, 0.30)))
        for r in range(3):
            for c in range(4):
                x = (r - 1) * 0.47 + rng.uniform(-0.04, 0.04)
                y = (c - 1.5) * 0.43 + rng.uniform(-0.04, 0.04)
                _potato_plant(Pl, (x, y, 0.02), rng, dead=dead, size=rng.uniform(0.9, 1.1), bound=(0.66, 0.82) if dead else None)
        if dead:
            for bmx in Pl.b.values():                    # nothing hangs outside the tray or sinks into the soil
                for v in bmx.verts:
                    v.co.x = max(-0.70, min(0.70, v.co.x))
                    v.co.y = max(-0.85, min(0.85, v.co.y))
                    v.co.z = max(0.004, v.co.z)
        if not dead:
            for i in range(3):
                Pl.ico('potato', 0.045, (rng.uniform(-0.6, 0.6), rng.uniform(-0.75, 0.75), 0.03), subdiv=1, scale=(1.25, 0.9, 0.7), rot=(0, 0, rng.uniform(0, 3)))
        Pl.finish()
    tally(root, 'farm_plot')
    return finish(root, 'farm_plot', samples=32, distance=0.5)


# ----------------------------------------------------------------------------------------------
# solar_panel.glb
# ----------------------------------------------------------------------------------------------
def build_solar_panel():
    ensure_mats()
    root = part('solar_panel')
    K = Kit('mount', root, loc=(0, -0.05, 0))          # puts the post and the tilt axis on the origin
    PZ, TILT = 1.15, rad(24)
    # post on a base plate with anchor bolts, two braces and ballast blocks
    K.box('steel', (0.5, 0.5, 0.03), (0, 0.05, 0.015), bevel=0.006)
    K.bolts('painted_dark', [(sx * 0.2, 0.05 + sy * 0.2, 0.04) for sx in (-1, 1) for sy in (-1, 1)], r=0.022, h=0.03)
    K.tube('aluminium', [(0, 0.05, -0.3), (0, 0.05, PZ - 0.1)], 0.065, seg=10)
    K.cyl('painted_grey', 0.085, 0.06, (0, 0.05, 0.07), seg=10)
    for sy, ex in ((-1, 0.85), (1, 1.0)):
        K.tube('aluminium', [(0, 0.05 + sy * 0.06, 0.72), (0, 0.05 + sy * ex, 0.04)], 0.026, seg=6)
        K.box('painted_grey', (0.42, 0.3, 0.14), (0, 0.05 + sy * ex, 0.07), bevel=0.02)
        add_box(K.bm('painted_yellow', 0.0), (0.425, 0.06, 0.145), (0, 0.05 + sy * ex, 0.07))
    K.box('steel', (0.10, 0.16, 0.05), (0, 0.05, 0.72), bevel=0.008)
    # yoke at the top carrying the torque tube
    for sx in (-1, 1):
        K.box('painted_grey', (0.03, 0.14, 0.26), (sx * 0.1, 0.05, PZ - 0.06), bevel=0.008)
    K.box('painted_grey', (0.23, 0.14, 0.03), (0, 0.05, PZ - 0.175), bevel=0.006)
    K.cyl('steel', 0.03, 0.26, (0, 0.05, PZ), seg=8, axis='X')
    # junction box on the post, conduit, and a cable away along the ground
    K.box('painted_grey', (0.26, 0.14, 0.32), (0, 0.19, 0.62), bevel=0.014)
    K.box('painted_yellow', (0.14, 0.008, 0.10), (0, 0.264, 0.66), bevel=0.0)
    add_box(K.bm('light_green', 0.0), (0.025, 0.008, 0.025), (0.08, 0.264, 0.54))
    K.pipe('plastic_black', [(0.0, 0.19, 0.46), (0.0, 0.19, 0.2), (0.25, 0.4, 0.03), (0.9, 0.9, 0.025), (1.5, 1.05, 0.02), (1.9, 1.05, -0.1)], 0.02, seg=6, bend=0.12)
    K.anchor('col_post', (0, 0.05, 0), radius=1.0)
    K.finish()

    Pn = Kit('panel', part('panel', parent=root, loc=(0, 0, PZ), rot=(TILT, 0, 0)))
    PW, PH = 3.4, 2.2
    Pn.box('aluminium', (PW, PH, 0.045), (0, 0, 0.05), bevel=0.008)
    # cells: six by four, each a slightly proud tile; bus bars show between them
    cw, ch = (PW - 0.14) / 6, (PH - 0.14) / 4
    cells = Pn.bm('solar_cell', 0.0)
    for i in range(6):
        for j in range(4):
            add_box(cells, (cw - 0.022, ch - 0.022, 0.01), (-PW / 2 + 0.07 + cw * (i + 0.5), -PH / 2 + 0.07 + ch * (j + 0.5), 0.076))
    for i in range(1, 6):
        if i == 3:
            add_box(Pn.bm('aluminium', 0.0), (0.03, PH - 0.02, 0.016), (-PW / 2 + 0.07 + cw * i, 0, 0.0705))
    # back: torque tube, three rails, cross ribs, a diode box and the cable loop
    Pn.cyl('aluminium', 0.05, PW - 0.5, (0, 0, 0.0), seg=10, axis='X')
    for y in (-0.72, 0.0, 0.72):
        Pn.box('aluminium', (PW - 0.1, 0.06, 0.05), (0, y, 0.012), bevel=0.0)
    for x in (-1.2, -0.4, 0.4, 1.2):
        Pn.box('aluminium', (0.05, PH - 0.1, 0.04), (x, 0, 0.012), bevel=0.0)
        Pn.box('painted_grey', (0.09, 0.16, 0.10), (x, 0, -0.02), bevel=0.01)
    add_box(Pn.bm('painted_white', 0.0), (PW - 0.02, PH - 0.02, 0.006), (0, 0, 0.03))
    Pn.box('painted_dark', (0.3, 0.2, 0.07), (0.8, 0.35, -0.012), bevel=0.01)
    Pn.hose('plastic_black', [(0.8, 0.25, -0.03), (0.5, 0.12, -0.12), (0.12, 0.1, -0.16), (0.03, 0.14, -0.3)], 0.014, seg=5, n=3)
    for sx in (-1, 1):
        for sy in (-1, 1):
            Pn.box('painted_orange', (0.09, 0.09, 0.055), (sx * (PW / 2 - 0.035), sy * (PH / 2 - 0.035), 0.05), bevel=0.008)
    Pn.finish()
    tally(root, 'solar_panel')
    return finish(root, 'solar_panel', samples=32, distance=0.7)


# ----------------------------------------------------------------------------------------------
# uplink_dish.glb
# ----------------------------------------------------------------------------------------------
def build_uplink_dish():
    ensure_mats()
    root = part('uplink_dish')
    K = Kit('mast', root)
    MZ = 1.3
    # tripod: a hub, three legs with pads and sandbag ballast, tie rods, the mast
    K.tube('aluminium', [(0, 0, 0.18), (0, 0, MZ - 0.06)], 0.045, seg=10)
    K.cyl('painted_grey', 0.085, 0.14, (0, 0, 0.82), seg=10)
    K.cyl('painted_grey', 0.07, 0.08, (0, 0, 0.26), seg=10)
    for i in range(3):
        a = rad(90 + 120 * i)
        foot = Vector(pol(0.82, a, 0.03))
        K.tube('aluminium', [pol(0.07, a, 0.80), foot + Vector((0, 0, 0.02))], 0.026, seg=6)
        K.tube('aluminium', [pol(0.06, a, 0.26), pol(0.5, a, 0.33)], 0.014, seg=5)
        K.cyl('steel', 0.10, 0.025, foot - Vector((0, 0, 0.018)), seg=10)
        K.tube('steel', [foot, foot - Vector((0, 0, 0.3))], 0.012, seg=4)
        K.box('canvas', (0.36, 0.22, 0.11), Vector(pol(0.6, a, 0.075)), rot=(0, 0, a), bevel=0.04, seg=2)
        add_box(K.bm('canvas_dark', 0.0), (0.03, 0.225, 0.115), Vector(pol(0.6, a, 0.075)), rot=(0, 0, a))
    # electronics box on the mast, foil wrapped, with a radiator face, a lamp and a label
    K.box('gold_foil', (0.34, 0.24, 0.40), (0, 0.19, 0.74), bevel=0.02)
    K.box('painted_white', (0.36, 0.26, 0.03), (0, 0.19, 0.955), bevel=0.008)
    K.box('painted_grey', (0.36, 0.26, 0.03), (0, 0.19, 0.53), bevel=0.008)
    for i in range(5):
        add_box(K.bm('painted_white', 0.0), (0.012, 0.03, 0.34), (-0.12 + i * 0.06, 0.325, 0.74))
    K.box('painted_yellow', (0.012, 0.14, 0.09), (0.176, 0.19, 0.80), bevel=0.0)
    add_box(K.bm('light_green', 0.0), (0.012, 0.03, 0.03), (0.176, 0.13, 0.66))
    for z in (0.62, 0.86):
        add_box(K.bm('steel', 0.0), (0.12, 0.12, 0.03), (0, 0.06, z))
    K.pipe('plastic_black', [(0.1, 0.19, 0.52), (0.1, 0.19, 0.3), (0.3, 0.5, 0.04), (0.9, 0.95, 0.02), (1.25, 1.0, -0.1)], 0.016, seg=5, bend=0.1)
    K.hose('plastic_black', [(-0.08, 0.19, 0.97), (-0.1, 0.12, 1.1), (-0.06, 0.04, MZ - 0.1)], 0.012, seg=4, n=3)
    # azimuth bearing on top of the mast
    K.cyl('painted_grey', 0.10, 0.07, (0, 0, MZ - 0.045), seg=12)
    K.cyl('steel', 0.115, 0.018, (0, 0, MZ - 0.085), seg=12)
    K.anchor('col_post', (0, 0, 0), radius=0.8)
    K.finish()

    # the head: yoke, elevation axis and actuator, reflector, feed. Pivot on the mast axis.
    D = Kit('dish', part('dish', parent=root, loc=(0, 0, MZ)))
    D.cyl('painted_grey', 0.09, 0.05, (0, 0, 0.025), seg=12)
    for sx in (-1, 1):
        D.box('painted_grey', (0.035, 0.12, 0.34), (sx * 0.16, 0, 0.2), bevel=0.01)
        D.cyl('steel', 0.045, 0.03, (sx * 0.185, 0, 0.30), seg=8, axis='X')
    D.box('painted_grey', (0.36, 0.12, 0.035), (0, 0, 0.05), bevel=0.008)
    EL = rad(38)                                  # boresight elevation; the dish looks toward -Y and up
    piv = Vector((0, 0, 0.30))
    rot = Matrix.Rotation(-(math.pi / 2 - EL), 4, 'X')    # dish axis +Z -> (0, -cos EL, sin EL)

    def T(p):
        return piv + rot @ Vector(p)
    erot = (-(math.pi / 2 - EL), 0, 0)
    R, depth = 0.9, 0.26
    prof = [(R * t, depth * t * t) for t in (0.12, 0.3, 0.5, 0.7, 0.86, 1.0)]
    bm = D.bm('painted_white', 0.0, 1, 40.0)
    v0 = len(bm.verts)
    add_lathe(bm, [(0.0, 0.0)] + prof + [(R + 0.012, depth + 0.012), (R + 0.012, depth - 0.016)] + [(r, z - 0.02) for r, z in reversed(prof)] + [(0.0, -0.02)], seg=24)
    bm.verts.ensure_lookup_table()
    xform(bm, bm.verts[v0:], loc=T((0, 0, 0.16)) - rot @ Vector((0, 0, 0)), rot=erot)
    zb = 0.16                                     # dish vertex sits this far along the axis from the pivot
    # back structure: hub drum and eight ribs
    D.cyl('painted_grey', 0.16, 0.16, T((0, 0, zb - 0.09)), seg=12, rot=erot)
    for i in range(8):
        a = TAU * i / 8 + 0.2
        p0 = T((0.15 * math.cos(a), 0.15 * math.sin(a), zb - 0.14))
        p1 = T((0.78 * math.cos(a), 0.78 * math.sin(a), zb + depth * 0.75 - 0.03))
        D.tube('aluminium', [p0, p1], 0.012, seg=4)
    D.torus('aluminium', 0.5, 0.012, T((0, 0, zb + depth * 0.31 - 0.035)), seg=16, ring_seg=3, rot=erot)
    D.cyl('steel', 0.03, 0.3, piv, seg=8, axis='X')
    # feed: three struts to a horn at the focus, with a waveguide down one strut
    fz = zb + R * R / (4 * depth) * 0.82
    for i in range(3):
        a = TAU * i / 3 + math.pi / 2
        D.tube('aluminium', [T((R * 0.96 * math.cos(a), R * 0.96 * math.sin(a), zb + depth * 0.93)), T((0.06 * math.cos(a), 0.06 * math.sin(a), fz + 0.02))], 0.011, seg=4)
    D.lathe('painted_grey', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.10), (0.095, 0.22), (0.085, 0.22), (0.04, 0.10)], loc=T((0, 0, fz + 0.1)), seg=10,
            rot=(erot[0] + math.pi, 0, 0), cap_end=False)
    D.cyl('gold_foil', 0.06, 0.09, T((0, 0, fz + 0.14)), seg=8, rot=erot)
    a = math.pi / 2
    D.tube('copper', [T((0.04, 0.03, fz + 0.14)), T((R * 0.5 * math.cos(a) + 0.03, R * 0.5 * math.sin(a), zb + (fz - zb) * 0.52)),
                      T((R * 0.93 * math.cos(a) + 0.03, R * 0.93 * math.sin(a), zb + depth * 0.9)), T((0.1, 0.5, zb - 0.02)), T((0.1, 0.14, zb - 0.12))], 0.008, seg=4)
    # elevation actuator: a linear screw jack from the yoke foot to the back of the dish
    j0, j1 = Vector((0, 0.12, 0.06)), T((0, 0.42, zb + 0.02))
    mid = j0.lerp(j1, 0.55)
    D.tube('painted_grey', [j0, mid], 0.028, seg=8)
    D.tube('steel', [mid, j1], 0.014, seg=6)
    D.box('painted_dark', (0.07, 0.09, 0.10), j0 + Vector((0, 0.03, -0.02)), bevel=0.01)
    D.box('steel', (0.05, 0.05, 0.05), j1, bevel=0.006)
    D.box('painted_orange', (0.36, 0.02, 0.035), T((0, -0.0, zb - 0.175)), rot=erot, bevel=0.0)
    D.finish()
    tally(root, 'uplink_dish')
    return finish(root, 'uplink_dish', samples=32, distance=0.6)


BUILDERS = {'hab': build_hab, 'farm_plot': build_farm_plot, 'solar_panel': build_solar_panel, 'uplink_dish': build_uplink_dish}

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS)
    for name in names:
        reset_scene()
        BUILDERS[name]()
