"""
Stranded II crops for the farm tray, authored headlessly in Blender through tools/assets/lib.py:

    crop_radish  crop_soy  crop_tomato  crop_lettuce

Run:   /home/user/blender-venv/bin/python tools/assets/crops.py [names ...]     (no names = all)
Look:  node tools/assets/preview.mjs crop_radish crop_soy crop_tomato crop_lettuce
       CROPS_FAST=1 skips the ambient-occlusion bake while blocking a model out.

What a crop model is
  Each file holds ONLY plants, made to drop into the tray of farm_plot.glb (build_farm_plot() in
  hab.py) with no offset: the model's origin is the tray's origin (the floor under the tray's
  centre), and its two parts sit where the potato's do, at the bed origin (0, 0, BED_Z):
    plants        the healthy crop at harvest size. The game scales this part from 0.25 to 1.
    plants_dead   the same planting killed by vacuum and cold. Never scaled.
  Budgets: plants <= 2,600 triangles, plants_dead <= 900.

How the geometry is made
  The game folds plain materials into one mesh per part and draws it FRONT FACES ONLY with a
  per-vertex colour. So nothing that can be seen from both sides is a single sheet: every leaf
  is a front and a back (Geo.sheet), the back a hair behind the front and often simpler (an end
  lobe without its side lobes), since each is only ever seen from its own side. The exception is
  a dead leaf lying on the soil, which has no underside to see.
  The per-vertex colour is the baked occlusion times a tint chosen while modelling (pale lettuce
  hearts, darker leaf edges, lighter young leaves), so one material carries a whole gradient. A
  tint can only darken, so a leaf material's own colour is its lightest tone.
  The occlusion is baked against a stand-in for the tray and its soil, one part at a time, so the
  living and the dead crop do not shade each other.

The soil
  The tray's soil is furrowed: ridges at x = +-0.25, furrows at x = 0 and +-0.5, about 7 cm from
  crest to trough. soil_z() repeats build_farm_plot()'s formula exactly (if that soil changes,
  change it here too). The dead crop lies on that surface. The living crop cannot simply stand
  on it, because the game grows a crop by scaling the whole part about the bed origin, which
  carries the outer rows through a ridge on their way out: see footing(). Each living plant
  therefore stands at or a little above its soil, and has root or stem below its base, so that
  at every scale it is joined to the ground and never mostly under it.

Layout of this file
  1. the tray's dimensions and soil    2. Geo: geometry lists, sheets, tubes, balls
  3. finishing: meshes, occlusion, export, where plants stand    4. one section per crop
  5. the plantings and the builders
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402  (imports bpy before bmesh/mathutils)
from lib import *  # noqa: E402,F401,F403

cos, sin, pi = math.cos, math.sin, math.pi
FAST = bool(os.environ.get('CROPS_FAST'))
UP = Vector((0.0, 0.0, 1.0))
WHITE = (1.0, 1.0, 1.0)


# ==============================================================================================
# 1. The tray (farm_plot.glb): dimensions and the soil surface, in the frame of the bed origin
# ==============================================================================================
BED_Z = 0.30                    # height of the origin of the tray's soil / plants / plants_dead parts
BED_X, BED_Y = 0.75, 0.90       # half-size of the soil surface
WALL_X, WALL_Y = 0.755, 0.905   # inner faces of the tray walls
RIM_Z = 0.06                    # above the bed origin: clear of the rim and its corner caps
OUT_X, OUT_Y = 0.80, 0.95       # the tray's outer footprint
DRIP_Y = (-0.66, -0.22, 0.22, 0.66)   # drip lines cross the bed at these y, 6 to 9 cm above the origin
_NX, _NY = 12, 8


def _soil_grid():
    """The soil's height field, as build_farm_plot() in hab.py makes it (same formula and seed).
    Keep the two in step: the plants are stood on this surface."""
    rng = random.Random(3)
    grid = []
    for i in range(_NX + 1):
        row = []
        for j in range(_NY + 1):
            u, v = i / _NX, j / _NY
            edge = min(u, 1 - u, v, 1 - v)
            h = 0.034 * cos(u * pi * 6) + 0.010 * sin(v * 9 + u * 3) + rng.uniform(-0.007, 0.007)
            k = min(1.0, edge * 6)
            row.append((h + 0.012) * k - 0.012 * (1 - k))
        grid.append(row)
    return grid


_SOIL = _soil_grid()


def soil_z(x, y):
    """Height of the soil above the bed origin at (x, y): the exported mesh, triangle for triangle
    (each grid cell is split along its (i, j)-(i+1, j+1) diagonal)."""
    fx = min(max((x + BED_X) / (2 * BED_X) * _NX, 0.0), _NX - 1e-9)
    fy = min(max((y + BED_Y) / (2 * BED_Y) * _NY, 0.0), _NY - 1e-9)
    i, j = int(fx), int(fy)
    a, b = fx - i, fy - j
    h00, h10, h01, h11 = _SOIL[i][j], _SOIL[i + 1][j], _SOIL[i][j + 1], _SOIL[i + 1][j + 1]
    if a >= b:
        return h00 + (h10 - h00) * a + (h11 - h10) * b
    return h00 + (h11 - h01) * a + (h01 - h00) * b


# ==============================================================================================
# 2. Geometry
# ==============================================================================================
def mix(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def mul(a, b):
    if isinstance(b, (int, float)):
        return (a[0] * b, a[1] * b, a[2] * b)
    return (a[0] * b[0], a[1] * b[1], a[2] * b[2])


def toward(base, target):
    """The tint that turns a material of colour `base` into `target` (clamped: a tint only darkens)."""
    return tuple(min(1.0, target[i] / base[i]) for i in range(3))


def polar(a, r=1.0, z=0.0):
    return Vector((cos(a) * r, sin(a) * r, z))


def bez(p0, p1, p2, t):
    return p0 * ((1 - t) ** 2) + p1 * (2 * t * (1 - t)) + p2 * (t * t)


def leaf_axes(d):
    """For a leaf growing along d: (d, side, normal). `side` is to the right seen from above,
    `normal` is the leaf's upper face."""
    d = Vector(d).normalized()
    side = d.cross(UP)
    if side.length < 1e-5:
        side = Vector((1.0, 0.0, 0.0))
    side.normalize()
    return d, side, side.cross(d).normalized()


def _stitch(a, b):
    """Triangles between two rows of vertex indices, each ordered left to right, row b farther
    along the leaf. They face the leaf's upper side."""
    tris, i, j = [], 0, 0
    na, nb = len(a), len(b)
    while i < na - 1 or j < nb - 1:
        if i == na - 1:
            step_b = True
        elif j == nb - 1:
            step_b = False
        else:
            step_b = (j + 1) / (nb - 1) <= (i + 1) / (na - 1)
        if step_b:
            tris.append((a[i], b[j + 1], b[j]))
            j += 1
        else:
            tris.append((a[i], a[i + 1], b[j]))
            i += 1
    return tris


class Geo:
    """The geometry of one part as plain lists: vertices (each with a colour tint and the share
    of the baked occlusion it takes) and triangles (each with a material). Vertices are shared
    only where the surface should shade smoothly."""
    GAP = 0.0012        # a leaf's back sits this far behind its front

    def __init__(self):
        self.v, self.tint, self.ao, self.f, self.fm = [], [], [], [], []

    def vert(self, p, tint=WHITE, ao=1.0):
        self.v.append(Vector(p))
        self.tint.append(tuple(tint))
        self.ao.append(ao)
        return len(self.v) - 1

    def tri(self, m, a, b, c):
        self.f.append((a, b, c))
        self.fm.append(m)

    # --- leaves -----------------------------------------------------------------------------
    def sheet(self, m, pts, tris, tints=WHITE, back=None, back_tint=1.0, ao=1.0, ao_back=0.45, single=False):
        """A thin surface. `tris` index `pts` and face the front (the upper side of a leaf).
        The back is the same triangles reversed, or the simpler set `back` (also indices into
        pts, wound like the front), on its own vertices a hair behind. `single` leaves the back
        out, for a leaf lying on the soil."""
        pts = [Vector(p) for p in pts]
        if not isinstance(tints, list):
            tints = [tints] * len(pts)
        idx = [self.vert(p, t, ao) for p, t in zip(pts, tints)]
        for a, b, c in tris:
            self.tri(m, idx[a], idx[b], idx[c])
        if single:
            return idx
        nrm = [Vector((0.0, 0.0, 0.0)) for _ in pts]
        for a, b, c in tris:
            n = (pts[b] - pts[a]).cross(pts[c] - pts[a])
            for k in (a, b, c):
                nrm[k] += n
        btris = tris if back is None else back
        bidx = {}
        for t in btris:
            for k in t:
                if k not in bidx:
                    n = nrm[k].normalized() if nrm[k].length > 1e-12 else UP
                    bidx[k] = self.vert(pts[k] - n * self.GAP, mul(tints[k], back_tint), ao_back)
        for a, b, c in btris:
            self.tri(m, bidx[c], bidx[b], bidx[a])
        return idx

    def ribbon(self, m, rows, tints=WHITE, back_rows=None, **kw):
        """A leaf given as rows of points across it (each left to right), from base to tip.
        `back_rows` picks the rows (and, as (row, [points]), the points) the simpler back keeps."""
        flat, start = [], []
        for r in rows:
            start.append(len(flat))
            flat.extend(r)
        if isinstance(tints, list):
            ft = []
            for r, t in zip(rows, tints):
                ft.extend(t if isinstance(t, list) else [t] * len(r))
            tints = ft
        index = [[start[i] + k for k in range(len(r))] for i, r in enumerate(rows)]
        tris = []
        for a, b in zip(index, index[1:]):
            tris.extend(_stitch(a, b))
        back = None
        if back_rows is not None:
            keep = []
            for br in back_rows:
                i, ks = br if isinstance(br, tuple) else (br, None)
                keep.append(index[i] if ks is None else [index[i][k] for k in ks])
            back = []
            for a, b in zip(keep, keep[1:]):
                back.extend(_stitch(a, b))
        return self.sheet(m, flat, tris, tints, back=back, **kw)

    def leaflet(self, m, base, d, length, width, cup=0.16, tint=WHITE, tip_tint=None, simple=False, **kw):
        """An ovate leaflet creased along its midrib. Front: four triangles (two when `simple`:
        a kite); back: the kite."""
        d, side, n = leaf_axes(d)
        base = Vector(base)
        tip_tint = tint if tip_tint is None else tip_tint
        tip = base + d * length
        if simple:
            p = base + d * length * 0.42
            pts = [base, p + side * width * 0.5 + n * width * cup, tip, p - side * width * 0.5 + n * width * cup]
            half = mix(tint, tip_tint, 0.5)
            return self.sheet(m, pts, [(0, 1, 2), (0, 2, 3)], [tint, half, tip_tint, half], **kw)
        p1, p2 = base + d * length * 0.28, base + d * length * 0.64
        pts = [base, p1 + side * width * 0.42 + n * width * cup, p2 + side * width * 0.5 + n * width * cup * 1.2, tip,
               p2 - side * width * 0.5 + n * width * cup * 1.2, p1 - side * width * 0.42 + n * width * cup]
        t1, t2 = mix(tint, tip_tint, 0.3), mix(tint, tip_tint, 0.7)
        tints = [tint, t1, t2, tip_tint, t2, t1]
        tris = [(0, 1, 2), (0, 2, 3), (0, 3, 4), (0, 4, 5)]
        return self.sheet(m, pts, tris, tints, back=[(0, 2, 3), (0, 3, 4)], **kw)

    # --- solids -----------------------------------------------------------------------------
    def tube(self, m, pts, radii, seg=3, tint=WHITE, ao=1.0, cap=False):
        """A stem: rings of `seg` vertices along a polyline. A radius of 0 closes that end to a
        point. `tint` is one colour or one per point. Faces look outward."""
        pts = [Vector(p) for p in pts]
        if not isinstance(radii, (list, tuple)):
            radii = [radii] * len(pts)
        tints = tint if isinstance(tint, list) else [tint] * len(pts)
        rings, u = [], None
        for i, p in enumerate(pts):
            t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
            if u is None:
                u = t.orthogonal().normalized()
            else:
                u = u - t * u.dot(t)
                u = u.normalized() if u.length > 1e-6 else t.orthogonal().normalized()
            w = t.cross(u)
            if radii[i] <= 1e-6:
                rings.append([self.vert(p, tints[i], ao)])
            else:
                rings.append([self.vert(p + (u * cos(TAU * j / seg) + w * sin(TAU * j / seg)) * radii[i], tints[i], ao)
                              for j in range(seg)])
        for a, b in zip(rings, rings[1:]):
            for j in range(seg):
                j1 = (j + 1) % seg
                if len(a) == 1 and len(b) == 1:
                    continue
                if len(b) == 1:
                    self.tri(m, a[j], a[j1], b[0])
                elif len(a) == 1:
                    self.tri(m, a[0], b[j1], b[j])
                else:
                    self.tri(m, a[j], a[j1], b[j1])
                    self.tri(m, a[j], b[j1], b[j])
        if cap and len(rings[-1]) > 1:
            top = [self.vert(self.v[k], tints[-1], ao) for k in rings[-1]]     # its own vertices: a hard edge
            for j in range(1, seg - 1):
                self.tri(m, top[0], top[j], top[j + 1])
        return rings

    def solid(self, m, pts, tris, tints=WHITE, ao=1.0):
        """A convex lump: triangles are turned to face away from its centre."""
        pts = [Vector(p) for p in pts]
        if not isinstance(tints, list):
            tints = [tints] * len(pts)
        c = sum(pts, Vector()) / len(pts)
        idx = [self.vert(p, t, ao) for p, t in zip(pts, tints)]
        for a, b, cc in tris:
            n = (pts[b] - pts[a]).cross(pts[cc] - pts[a])
            if n.dot((pts[a] + pts[b] + pts[cc]) / 3 - c) < 0:
                b, cc = cc, b
            self.tri(m, idx[a], idx[b], idx[cc])
        return idx

    def ball(self, m, c, r, n=5, squash=1.0, spin=0.0, axis=UP, tint=WHITE, top_tint=None, low_tint=None, ao=1.0):
        """A round fruit: two rings of n and two poles (n = 5 is an icosahedron, 20 triangles;
        n = 4 gives 16). `axis` is its top; the poles and rings can be tinted apart."""
        c = Vector(c)
        ax = Vector(axis).normalized()
        u = ax.orthogonal().normalized()
        w = ax.cross(u)
        lat = math.atan(0.5)
        top_tint = tint if top_tint is None else top_tint
        low_tint = tint if low_tint is None else low_tint
        pts = [c + ax * r * squash]
        tn = [top_tint]
        for ring, (s, off) in enumerate(((1, 0.0), (-1, 0.5))):
            for k in range(n):
                a = spin + TAU * (k + off) / n
                pts.append(c + (u * cos(a) + w * sin(a)) * r * cos(lat) + ax * r * squash * sin(lat) * s)
                tn.append(mix(tint, top_tint, 0.35) if s > 0 else mix(tint, low_tint, 0.5))
        pts.append(c - ax * r * squash)
        tn.append(low_tint)
        tris = []
        for k in range(n):
            k1 = (k + 1) % n
            tris += [(0, 1 + k, 1 + k1), (1 + k, 1 + n + k, 1 + k1), (1 + k1, 1 + n + k, 1 + n + k1),
                     (2 * n + 1, 1 + n + k1, 1 + n + k)]
        return self.solid(m, pts, tris, tn, ao)

    def spindle(self, m, a, b, r, n=3, belly=0.45, flat=1.0, tint=WHITE, tip_tint=None, ao=1.0, spin=0.0, bend=None):
        """A pod or a root: a point at each end and one ring of n between them (2n triangles).
        `flat` squeezes the ring one way; `bend` pushes the ring off the axis."""
        a, b = Vector(a), Vector(b)
        t = (b - a).normalized()
        u = t.orthogonal().normalized()
        if abs(t.z) < 0.9:                              # keep the flat side facing sideways
            u = t.cross(UP).normalized()
        w = t.cross(u)
        mid = a.lerp(b, belly) + (Vector(bend) if bend is not None else Vector())
        tip_tint = tint if tip_tint is None else tip_tint
        ring = [mid + (u * cos(spin + TAU * k / n) * flat + w * sin(spin + TAU * k / n)) * r for k in range(n)]
        pts = [a] + ring + [b]
        tris = []
        for k in range(n):
            k1 = (k + 1) % n
            tris += [(0, 1 + k, 1 + k1), (n + 1, 1 + k1, 1 + k)]
        return self.solid(m, pts, tris, [tint] + [tint] * n + [tip_tint], ao)

    def patch(self, m, pts, tris, away, tints=WHITE, ao=1.0):
        """Loose triangles on a solid's skin (a calyx on a fruit): each is turned to face away
        from the point `away`."""
        pts = [Vector(p) for p in pts]
        away = Vector(away)
        if not isinstance(tints, list):
            tints = [tints] * len(pts)
        idx = [self.vert(p, t, ao) for p, t in zip(pts, tints)]
        for a, b, c in tris:
            n = (pts[b] - pts[a]).cross(pts[c] - pts[a])
            if n.dot((pts[a] + pts[b] + pts[c]) / 3 - away) < 0:
                b, c = c, b
            self.tri(m, idx[a], idx[b], idx[c])
        return idx


# ==============================================================================================
# 3. Finishing: meshes, occlusion against the tray, tints, export
# ==============================================================================================
def ensure_mats():
    """One-off materials. The first three repeat build_farm_plot()'s (same names, same values)."""
    mat('leaf_b', color=(0.05, 0.21, 0.04), metallic=0.0, roughness=0.65)
    mat('leaf_dead', color=(0.21, 0.13, 0.05), metallic=0.0, roughness=0.8)
    mat('stem_dead', color=(0.27, 0.19, 0.09), metallic=0.0, roughness=0.8)
    for name, (color, rough) in NEW_MATERIALS.items():
        mat(name, color=color, metallic=0.0, roughness=rough)


# colour (linear RGB), roughness. A leaf material's colour is its LIGHTEST tone: tints darken it.
NEW_MATERIALS = {
    'radish':        ((0.74, 0.035, 0.115), 0.42),    # the root's red-pink skin
    'radish_leaf':   ((0.13, 0.38, 0.05), 0.75),      # rough, slightly yellow green
    'radish_dead':   ((0.30, 0.085, 0.07), 0.8),
    'soy_pod':       ((0.27, 0.47, 0.09), 0.92),      # fuzzy green, lighter and yellower than the leaves
    'tomato_red':    ((0.72, 0.04, 0.02), 0.32),
    'tomato_orange': ((0.86, 0.30, 0.03), 0.32),
    'tomato_green':  ((0.42, 0.56, 0.12), 0.36),
    'tomato_dead':   ((0.17, 0.045, 0.025), 0.7),
    'lettuce':       ((0.52, 0.70, 0.15), 0.6),       # the heart; the tint takes it to leaf green
    'lettuce_red':   ((0.50, 0.60, 0.16), 0.6),       # the heart; the tint takes it to burgundy
}


def to_object(geo, name, parent):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in geo.v], [], [tuple(f) for f in geo.f])
    names = []
    for m in geo.fm:
        if m not in names:
            names.append(m)
    for m in names:
        me.materials.append(mat(m))
    for p, m in zip(me.polygons, geo.fm):
        p.material_index = names.index(m)
        p.use_smooth = True
    me.update()
    o = bpy.data.objects.new(name, me)
    return link(o, parent)


def tray_stand_in(parent):
    """The soil surface and the tray walls, in the frame of the bed origin: what shades the
    plants in the game. Baked against, then thrown away."""
    bm = bm_new()
    grid = [[bm.verts.new((-BED_X + 2 * BED_X * i / _NX, -BED_Y + 2 * BED_Y * j / _NY, _SOIL[i][j]))
             for j in range(_NY + 1)] for i in range(_NX + 1)]
    for i in range(_NX):
        for j in range(_NY):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1]))
            bm.faces.new((grid[i][j], grid[i + 1][j + 1], grid[i][j + 1]))
    for sx in (-1, 1):
        add_box(bm, (0.05, 2 * OUT_Y, 0.25), (sx * (WALL_X + 0.025), 0, 0.045 - 0.125))
    for sy in (-1, 1):
        add_box(bm, (2 * OUT_X, 0.05, 0.25), (0, sy * (WALL_Y + 0.025), 0.045 - 0.125))
    me = bpy.data.meshes.new('tray_stand_in')
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new('tray_stand_in', me)
    return link(o, parent)


def finish(root, name, parts, samples=40, distance=0.45, strength=0.85):
    """parts: [(part node, Geo)]. Makes one mesh per part, bakes occlusion part by part against
    the tray stand-in, multiplies in the tints and exports through lib."""
    made = []
    for node, geo in parts:
        if geo.f:
            made.append((node, geo, to_object(geo, node.name + '_mesh', node)))
    bpy.context.view_layer.update()
    for node, geo, o in made:
        me = o.data
        if FAST:
            occ = [1.0] * len(me.vertices)
        else:
            stand_in = tray_stand_in(node)
            bpy.context.view_layer.update()
            bake_ao(node, samples=samples, distance=distance, strength=strength, floor=False)
            bpy.data.objects.remove(stand_in, do_unlink=True)
            occ = [d.color[0] for d in me.color_attributes['Col'].data]
        attr = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
        for i, a in enumerate(occ):
            k = 1.0 - geo.ao[i] * (1.0 - a)
            t = geo.tint[i]
            attr.data[i].color = (min(1.0, t[0] * k), min(1.0, t[1] * k), min(1.0, t[2] * k), 1.0)
        me.color_attributes.active_color = attr
        try:
            me.color_attributes.render_color_index = list(me.color_attributes).index(attr)
        except Exception:
            pass
    info = export_model(root, name, ao=False, do_collapse=False)
    info['parts'] = {}
    for node, geo, o in made:
        zs = [v.z for v in geo.v]
        per = {}
        for m in geo.fm:
            per[m] = per.get(m, 0) + 1
        info['parts'][node.name] = {'triangles': len(geo.f), 'materials': per, 'z': (round(min(zs), 3), round(max(zs), 3)),
                                    'origin': tuple(round(c, 3) for c in node.matrix_world.translation)}
        print(f"  {node.name:12s} {len(geo.f):5d} tris  z {min(zs):+.3f} .. {max(zs):+.3f} above the bed origin  ", per)
    return info


def start(name):
    ensure_mats()
    root = part(name)
    return root, part('plants', parent=root, loc=(0, 0, BED_Z)), part('plants_dead', parent=root, loc=(0, 0, BED_Z))


def footing(x, y, tol):
    """How high a living plant's base stands above the bed origin. The game grows a crop by
    scaling the whole `plants` part from 0.25 to 1 about the bed origin, which slides every
    plant across the furrows on its way out to its place. A plant that stands on the soil at
    full size is carried THROUGH the ridge at x = 0.25 on the way (up to 6 cm deep at half size).
    So the base is set on the soil at full size or higher: high enough that at no scale s the
    plant is more than tol * s under the soil (tol is in full-size metres: how much of the
    plant's foot may be lost). Returns (base height, drop): at some scales the base is then
    above the soil instead, by up to drop * s, and the plant needs that much root or stem
    below its base to stay joined to the ground."""
    need = [soil_z(x * k / 100, y * k / 100) / (k / 100) for k in range(25, 101)]
    z = max(soil_z(x, y), max(need) - tol)
    return z, z - min(need)


def planting(xs, ys, seed, tol, jx=0.012, jy=0.015, size=(0.94, 1.06)):
    """Where the plants stand: a row along y at each x of `xs`, a plant at each y of `ys`, each
    nudged a little, with its size and facing. `at` is the living plant's base (see footing),
    `soil` the point on the soil under it, where the dead plant lies. The living and the dead
    crop are built over the same list."""
    rng = random.Random(seed)
    spots = []
    for r, x0 in enumerate(xs):
        for c, y0 in enumerate(ys):
            x, y = x0 + rng.uniform(-jx, jx), y0 + rng.uniform(-jy, jy)
            z, drop = footing(x, y, tol)
            spots.append({'row': r, 'col': c, 'at': Vector((x, y, z)), 'soil': Vector((x, y, soil_z(x, y))),
                          'drop': drop + 0.012, 'size': rng.uniform(*size), 'yaw': rng.uniform(0, TAU)})
    return spots


def ground(p, lift=0.008):
    """The point on the soil under (or over) p, raised by `lift`."""
    return Vector((p.x, p.y, soil_z(p.x, p.y) + lift))


def keep_in_tray(geo, on_soil=False, clearance=0.004):
    """Nothing through the tray walls: a vertex outside the inner faces is pulled back in unless
    it is above the rim, and then it may overhang the rim but not the tray's outer footprint
    (trays stand 40 cm apart). With `on_soil`, nothing below the soil either (the dead crop lies
    on it) and nothing outside the inner faces at all."""
    moved = 0
    for v in geo.v:
        if on_soil:
            x, y = max(-WALL_X + 0.012, min(WALL_X - 0.012, v.x)), max(-WALL_Y + 0.012, min(WALL_Y - 0.012, v.y))
            z = max(v.z, soil_z(x, y) + clearance)
            if (x, y, z) != (v.x, v.y, v.z):
                moved += 1
            v.x, v.y, v.z = x, y, z
        elif v.z < RIM_Z and (abs(v.x) > WALL_X - 0.01 or abs(v.y) > WALL_Y - 0.01):
            v.x = max(-WALL_X + 0.01, min(WALL_X - 0.01, v.x))
            v.y = max(-WALL_Y + 0.01, min(WALL_Y - 0.01, v.y))
            moved += 1
        elif abs(v.x) > OUT_X - 0.005 or abs(v.y) > OUT_Y - 0.005:      # over the rim, but not past the tray
            v.x = max(-OUT_X + 0.005, min(OUT_X - 0.005, v.x))
            v.y = max(-OUT_Y + 0.005, min(OUT_Y - 0.005, v.y))
            moved += 1
    return moved


# ==============================================================================================
# 4a. Leaf lettuce: four rows of four loose heads, each on a drip line; one row is a red variety
# ==============================================================================================
LETTUCE_X = (-0.45, -0.15, 0.15, 0.45)
LETTUCE_Y = DRIP_Y
LETTUCE_RED_ROW = 2
LETTUCE_COL = {      # heart, mid-leaf, edge
    'lettuce':     ((0.52, 0.70, 0.15), (0.20, 0.50, 0.07), (0.07, 0.31, 0.035)),
    'lettuce_red': ((0.46, 0.60, 0.16), (0.30, 0.20, 0.07), (0.19, 0.022, 0.035)),
}


def lettuce_head(G, P, rng):
    m = 'lettuce_red' if P['row'] == LETTUCE_RED_ROW else 'lettuce'
    size = P['size']
    heart, mid, edge = (toward(NEW_MATERIALS[m][0], c) for c in LETTUCE_COL[m])
    crown = P['at'] + UP * 0.010
    a0 = pi / 6 + rng.uniform(-0.12, 0.12)          # the drip line (along x) runs between two leaves
    # outer whorl: six broad leaves, spread low, rims ruffled and turned up
    for k in range(6):
        a = a0 + TAU * k / 6 + rng.uniform(-0.12, 0.12)
        out, side = polar(a), polar(a - pi / 2)
        R = size * rng.uniform(0.160, 0.182)
        lift = size * rng.uniform(0.050, 0.095)
        # the leaf lies out along the soil before its rim turns up, wherever the crown stands
        m1 = ground(crown + out * R * 0.46, 0.014)
        m1.z = min(m1.z, crown.z + lift * 0.30)
        hw = R * 0.36
        row1 = [m1 - side * hw + UP * 0.020, m1, m1 + side * hw + UP * 0.020]
        rim, amp = [], size * rng.uniform(0.016, 0.026)
        for i in range(7):
            phi = (i - 3) * rng.uniform(0.235, 0.275)
            rr = R * (1.0 - 0.045 * abs(i - 3)) * rng.uniform(0.97, 1.03)
            zz = lift + amp * (1 if i % 2 == 0 else -1) * rng.uniform(0.7, 1.2) + R * 0.035 * abs(i - 3)
            rim.append(crown + (out * cos(phi) + side * sin(phi)) * rr + UP * zz)
        shade = rng.uniform(0.84, 1.0)
        across = [mul(mid, shade), mul(mix(heart, mid, 0.7), shade), mul(mid, shade)]
        G.ribbon(m, [[crown + out * 0.012], row1, rim], [mix(heart, mid, 0.25), across, mul(edge, shade)],
                 back_rows=[0, 2], back_tint=0.9, ao=0.9)
    # middle whorl: five leaves standing at about 55 degrees, a loose cup
    for k in range(5):
        a = a0 + TAU * (k + 0.5) / 5 + rng.uniform(-0.2, 0.2)
        out, side = polar(a), polar(a - pi / 2)
        R = size * rng.uniform(0.090, 0.110)
        top = size * rng.uniform(0.120, 0.150)
        m1 = crown + out * R * 0.5 + UP * top * 0.42
        hw = R * 0.44
        rim, amp = [], size * rng.uniform(0.012, 0.018)
        for i in range(4):
            phi = (i - 1.5) * rng.uniform(0.44, 0.52)
            rr = R * rng.uniform(0.92, 1.08)
            rim.append(crown + (out * cos(phi) + side * sin(phi)) * rr + UP * (top + amp * (1 if i % 2 == 0 else -1)))
        G.ribbon(m, [[crown + out * 0.008], [m1 - side * hw, m1 + side * hw], rim],
                 [heart, mix(heart, mid, 0.5), mix(mid, edge, 0.5)], back_rows=[0, 2], back_tint=0.95, ao=0.8)
    # heart: four small pale leaves closing over a bud
    for k in range(4):
        a = a0 + TAU * k / 4 + rng.uniform(-0.25, 0.25)
        out, side = polar(a), polar(a - pi / 2)
        R, top = size * rng.uniform(0.036, 0.046), size * rng.uniform(0.112, 0.136)
        rim = [crown + (out * cos(phi) + side * sin(phi)) * R * rk + UP * (top + dz)
               for phi, dz, rk in ((-1.0, -0.014, 1.15), (0.0, 0.010, 0.55), (1.0, -0.014, 1.15))]
        G.ribbon(m, [[crown + out * 0.004 + UP * 0.02], rim], [heart, mix(heart, mid, 0.4)], ao=0.5)
    G.spindle(m, crown + UP * 0.02, crown + UP * size * 0.088, size * 0.024, n=3, belly=0.6, tint=heart,
              tip_tint=mix(heart, mid, 0.3), ao=0.3, spin=a0)
    # the stem under the crown: seen only when a scaled plant stands off the soil
    G.tube(m, [crown + UP * 0.004, crown - UP * (0.01 + P['drop'])], [0.013 * size, 0.0], tint=mul(heart, 0.6),
           ao=0.6)


def lettuce_dead(G, P, rng):
    """The head has fallen in on itself: outer leaves flat on the soil, shrunk to troughs with
    dry curled edges, the inner ones slumped over them in a low heap, the heart a dark lump."""
    size, crown = P['size'], P['soil']
    dark = (0.60, 0.46, 0.52) if P['row'] == LETTUCE_RED_ROW else (0.84, 0.84, 0.76)
    a0 = pi / 6 + rng.uniform(-0.3, 0.3)
    for k in range(6):
        a = a0 + TAU * k / 6 + rng.uniform(-0.25, 0.25)
        out, side = polar(a), polar(a - pi / 2)
        R = size * rng.uniform(0.105, 0.175)
        hw = R * rng.uniform(0.22, 0.32)
        m1, m2 = crown + out * R * 0.5, crown + out * R
        curl = [rng.uniform(0.018, 0.05) for _ in range(4)]
        m = 'stem_dead' if rng.random() < 0.3 else 'leaf_dead'
        sh = rng.uniform(0.5, 1.0)
        G.ribbon(m, [[ground(crown + out * 0.02, 0.02)],
                     [ground(m1 - side * hw, curl[0]), ground(m1, 0.007), ground(m1 + side * hw, curl[1])],
                     [ground(m2 - side * hw * 0.55, curl[2]), ground(m2 + side * hw * 0.55, curl[3])]],
                 [mul(dark, 0.5 * sh), [mul(dark, sh), mul(dark, 0.62 * sh), mul(dark, sh)], mul(dark, 0.9 * sh)],
                 single=True, ao=0.85)
    top = crown + UP * size * rng.uniform(0.05, 0.075) + polar(rng.uniform(0, TAU)) * 0.015
    for k in range(5):
        a = a0 + TAU * (k + 0.5) / 5 + rng.uniform(-0.3, 0.3)
        out, side = polar(a), polar(a - pi / 2)
        R = size * rng.uniform(0.075, 0.115)
        hw = R * rng.uniform(0.32, 0.48)
        m1 = crown + out * R * 0.45 + UP * size * rng.uniform(0.035, 0.06)
        m2 = crown + out * R
        sh = rng.uniform(0.5, 0.9)
        foot = [ground(m2 - side * hw * 0.7, rng.uniform(0.014, 0.035)),
                ground(m2 + side * hw * 0.7, rng.uniform(0.014, 0.035))]
        G.ribbon('leaf_dead', [[top], [m1 - side * hw, m1 + side * hw], foot],
                 [mul(dark, 0.45 * sh), mul(dark, 0.7 * sh), mul(dark, sh)], single=True, ao=0.85)
    G.spindle('leaf_dead', crown - UP * 0.01, top + UP * 0.012, size * 0.03, n=4, belly=0.6, tint=mul(dark, 0.45),
              tip_tint=mul(dark, 0.36), ao=0.6, spin=a0)


def build_lettuce():
    root, plants, dead = start('crop_lettuce')
    G, D = Geo(), Geo()
    spots = planting(**LAYOUTS['crop_lettuce'])
    rng = random.Random(410)
    for P in spots:
        lettuce_head(G, P, rng)
    rng = random.Random(411)
    for P in spots:
        lettuce_dead(D, P, rng)
    keep_in_tray(G)
    keep_in_tray(D, on_soil=True)
    return finish(root, 'crop_lettuce', [(plants, G), (dead, D)])


# ==============================================================================================
# 4b. Radish: five rows of eight rosettes, the red shoulders of the roots standing out of the soil
# ==============================================================================================
RADISH_X = (-0.52, -0.26, 0.0, 0.26, 0.52)
RADISH_Y = (-0.77, -0.55, -0.33, -0.11, 0.11, 0.33, 0.55, 0.77)      # midway between the drip lines


def radish_leaf(G, p0, a, L, w, el0, el2, rng, big=True, shade=1.0):
    """A lyrate leaf: a bare stalk, a pair of small side lobes, a deep notch, then the big
    rounded end lobe. The edges wander up and down: a rough leaf, not a spoon."""
    out, side = polar(a), polar(a - pi / 2)
    p1 = p0 + (out * cos(el0) + UP * sin(el0)) * L * 0.50
    p2 = p1 + (out * cos(el2) + UP * sin(el2)) * L * 0.54

    def row(t, hw, skew=0.0, wave=0.008):
        jl, jr = rng.uniform(0.85, 1.15), rng.uniform(0.85, 1.15)
        return [bez(p0, p1, p2, t - skew) - side * w * hw * jl + UP * rng.uniform(-wave, wave),
                bez(p0, p1, p2, t + skew) + side * w * hw * jr + UP * rng.uniform(-wave, wave)]
    stalk, blade = (0.60 * shade, 0.74 * shade, 0.60 * shade), (shade, shade, shade)
    tip = [bez(p0, p1, p2, 1.0) - UP * 0.006]
    sk = rng.uniform(-0.035, 0.035)
    if big:
        rows = [[p0], row(0.33, 0.62, sk), row(0.43, 0.15, 0, 0.002), row(0.68, 1.0, -sk), row(0.90, 0.70), tip]
        tints = [stalk, mul(blade, 0.82), mul(blade, 0.72), blade, blade, mul(blade, 0.95)]
        back = [0, 2, 3, 5]
    else:
        rows = [[p0], row(0.45, 0.15, 0, 0.002), row(0.72, 0.9, sk), tip]
        tints = [stalk, mul(blade, 0.72), blade, mul(blade, 0.95)]
        back = [0, 2, 3]
    G.ribbon('radish_leaf', rows, tints, back_rows=back, ao=0.9)


def radish_plant(G, P, rng):
    size = P['size']
    # every root stands a little proud of the soil: the red is what says radish
    crown = Vector((P['at'].x, P['at'].y, max(P['at'].z, P['soil'].z + 0.006)))
    rr = 0.027 * size * rng.uniform(0.92, 1.1)
    top = crown + UP * 0.026 * size
    # the root: a dome over the soil (two rings of four), a long point below it
    sp = rng.uniform(0, TAU)
    pts = [crown - UP * max(0.06, P['drop'] + 0.012)]
    pts += [crown + polar(sp + TAU * k / 4, rr, 0.004) for k in range(4)]
    pts += [crown + polar(sp + TAU * (k + 0.5) / 4, rr * 0.64, 0.019 * size) for k in range(4)]
    pts += [top]
    tris = []
    for k in range(4):
        k1 = (k + 1) % 4
        tris += [(0, 1 + k, 1 + k1), (1 + k, 5 + k, 1 + k1), (1 + k1, 5 + k, 5 + k1), (9, 5 + k1, 5 + k)]
    G.solid('radish', pts, tris, [(0.8, 0.7, 0.7)] + [WHITE] * 4 + [(0.92, 0.9, 0.9)] * 4 + [(0.5, 0.75, 0.55)],
            ao=0.7)
    a0 = P['yaw']
    p0 = top - UP * 0.005
    for i in range(5):
        a = a0 + TAU * i / 5 + rng.uniform(-0.2, 0.2)
        big = i in (0, 2, 3)
        L = size * (rng.uniform(0.205, 0.240) if big else rng.uniform(0.165, 0.195))
        el0 = rad(rng.uniform(66, 76) if big else rng.uniform(72, 80))          # the stalk stands steeply ...
        el2 = rad(rng.uniform(12, 34) if big else rng.uniform(26, 46))          # ... and the blade leans out
        radish_leaf(G, p0, a, L, size * rng.uniform(0.042, 0.050), el0, el2, rng, big, rng.uniform(0.68, 1.0))


def radish_dead(G, P, rng):
    """The leaves have dropped where they stood and dried to strips with a shrivelled blade at
    the end, one still held half up on a bent stalk; the root is shrunken and dull."""
    size, crown = P['size'], P['soil']
    G.spindle('radish_dead', crown - UP * 0.03, crown + UP * 0.019 * size, 0.021 * size, n=3, belly=0.72,
              tint=WHITE, tip_tint=(0.55, 0.65, 0.55), ao=0.7, spin=P['yaw'])
    p0 = crown + UP * 0.012 * size
    a = P['yaw']
    for i in range(4):
        a += rng.uniform(0.9, 2.2)
        out, side = polar(a), polar(a - pi / 2)
        L, w = size * rng.uniform(0.11, 0.20), size * rng.uniform(0.02, 0.032)
        sh = rng.uniform(0.55, 1.0)
        m = 'stem_dead' if rng.random() < 0.25 else 'leaf_dead'
        bend = polar(a + rng.uniform(-0.5, 0.5))                 # the blade lies a little off the line of the stalk
        tip = ground(crown + out * L * 0.7 + bend * L * 0.3, rng.uniform(0.006, 0.035))
        far = crown + out * L * 0.66 + bend * L * 0.06
        blade = [ground(far - side * w, rng.uniform(0.006, 0.03)), ground(far + side * w, rng.uniform(0.006, 0.03))]
        tints = [mul(WHITE, k * sh) for k in (0.55, 0.7, 1.0, 0.9)]
        if i == 3:
            G.ribbon(m, [[p0], blade, [tip]], [tints[0], tints[2], tints[3]], single=True, ao=0.85)
            continue
        waist = crown + out * L * 0.34
        if i == 0:                                               # held up on its stalk, the blade hanging
            waist += UP * size * rng.uniform(0.035, 0.06)
            neck = [waist - side * w * 0.3, waist + side * w * 0.3]
        else:
            neck = [ground(waist - side * w * 0.3, 0.008), ground(waist + side * w * 0.3, 0.008)]
        G.ribbon(m, [[p0], neck, blade, [tip]], tints, single=True, ao=0.85)


def build_radish():
    root, plants, dead = start('crop_radish')
    G, D = Geo(), Geo()
    spots = planting(**LAYOUTS['crop_radish'])
    rng = random.Random(110)
    for P in spots:
        radish_plant(G, P, rng)
    rng = random.Random(111)
    for P in spots:
        radish_dead(D, P, rng)
    keep_in_tray(G)
    keep_in_tray(D, on_soil=True)
    return finish(root, 'crop_radish', [(plants, G), (dead, D)])


# ==============================================================================================
# 4c. Soybean: three rows of four bushy plants, trifoliate leaves, pods in clusters at the nodes
# ==============================================================================================
SOY_X = (-0.47, 0.0, 0.47)
SOY_Y = (-0.615, -0.175, 0.265, 0.705)          # 4.5 cm off the drip lines: a stem beside each emitter line


def soy_leaf(G, node, a, rng, size=1.0, m='leaf', shade=1.0, stalk=1.0):
    """A trifoliate leaf on a long stalk: a broad oval end leaflet and a pointed pair beside it."""
    out = polar(a)
    ep = rad(rng.uniform(22, 48))
    j = node + (out * cos(ep) + UP * sin(ep)) * size * stalk * rng.uniform(0.07, 0.10)
    G.tube('stem', [node, j], [0.0045, 0.0], tint=mul(WHITE, 0.9), ao=0.8)
    L = size * rng.uniform(0.115, 0.135)
    tint, tip = mul(WHITE, shade), mul(WHITE, shade * 0.84)
    e = rad(rng.uniform(-26, 0))
    G.leaflet(m, j, out * cos(e) + UP * sin(e), L * 1.06, L * 0.70, cup=0.14, tint=tint, tip_tint=tip, ao=0.9)
    for s in (-1, 1):
        o2 = polar(a + s * rad(rng.uniform(64, 86)))
        e = rad(rng.uniform(-30, -6))
        G.leaflet(m, j, o2 * cos(e) + UP * sin(e), L * rng.uniform(0.88, 1.0), L * 0.70, cup=0.14, tint=tint,
                  tip_tint=tip, simple=True, ao=0.9)


def soy_pods(G, node, n, rng, size=1.0, a0=0.0, m='soy_pod'):
    for k in range(n):
        a = a0 + TAU * k / n + rng.uniform(-0.5, 0.5)
        out = polar(a)
        e = rad(rng.uniform(-62, -20))
        d = out * cos(e) + UP * sin(e)
        L = size * rng.uniform(0.066, 0.080)
        p = node + out * 0.005
        G.spindle(m, p, p + d * L, 0.0125 * size, n=3, belly=0.5, flat=0.6, ao=0.5, bend=out * 0.007 - UP * 0.004,
                  tint=mul(WHITE, rng.uniform(0.88, 1.0)), tip_tint=(0.9, 0.86, 0.7))


def soy_plant(G, P, rng):
    size, base = P['size'], P['at']
    H = size * rng.uniform(0.37, 0.42)
    lean = polar(rng.uniform(0, TAU)) * rng.uniform(0.0, 0.05)
    kink = polar(rng.uniform(0, TAU)) * 0.012

    def at(f):
        return base + UP * H * f + lean * H * f * f + kink * sin(f * 9.0)
    G.tube('stem', [base - UP * P['drop'], at(0.33), at(0.68), at(1.0)], [0.0095, 0.008, 0.0055, 0.0], ao=0.8)
    a1 = P['yaw']
    # two side branches low on the stem, a leaf at the end of each
    for s in range(2):
        ab = a1 + 1.3 + s * pi + rng.uniform(-0.4, 0.4)
        n0 = at(0.15 + 0.07 * s)
        tip = n0 + (polar(ab) * cos(rad(48)) + UP * sin(rad(48))) * size * rng.uniform(0.15, 0.20)
        G.tube('stem', [n0, tip], [0.0062, 0.0], ao=0.8)
        soy_leaf(G, tip.lerp(n0, 0.1), ab + rng.uniform(-0.4, 0.4), rng, size * 0.95, 'leaf_b', rng.uniform(0.85, 1.0),
                 stalk=0.6)
    # leaves up the main stem, spiralling, and two young ones at the top
    for i, f in enumerate((0.30, 0.47, 0.64, 0.80, 0.92)):
        soy_leaf(G, at(f), a1 + 2.4 * i, rng, size * (1.0 - 0.04 * i), 'leaf_b' if i < 2 else 'leaf',
                 rng.uniform(0.85, 1.0), stalk=1.25 - 0.12 * i)
    for s in range(2):
        soy_leaf(G, at(0.98), a1 + 2.4 * 5 + s * pi + rng.uniform(-0.3, 0.3), rng, size * 0.74, 'leaf', 1.0, stalk=0.7)
    # pods: clusters of three at the lower nodes, where the leaves leave them in view
    for f, n in ((0.24, 3), (0.47, 3), (0.64, 1)):
        soy_pods(G, at(f), n, rng, size, a1 + f * 7)


def soy_dead(G, P, rng):
    """The stem has buckled and gone over, some a hand above the soil and some at the foot;
    curled leaflets still hang from it, more lie where they fell, the pods are dry on the stem."""
    size, base = P['size'], P['soil']
    a = P['yaw']
    out = polar(a)
    h1 = size * rng.choice((rng.uniform(0.04, 0.08), rng.uniform(0.10, 0.19)))
    p1 = base + UP * h1 + out * 0.015
    p2 = base + UP * (h1 + 0.025) + out * 0.075
    p3 = ground(base + out * size * rng.uniform(0.25, 0.33), 0.022)
    G.tube('stem_dead', [base - UP * 0.02, p1, p2, p3], [0.008, 0.007, 0.0055, 0.0], ao=0.8)

    def crisp(node, n):
        """Leaflets dried on the stalk: each a curled scrap hanging from the node."""
        for _ in range(n):
            d = (polar(rng.uniform(0, TAU)) * rng.uniform(0.4, 1.0) - UP * rng.uniform(0.5, 1.2)).normalized()
            L = size * rng.uniform(0.065, 0.095)
            sd = d.cross(polar(rng.uniform(0, TAU))).normalized()
            sh = rng.uniform(0.55, 1.0)
            G.sheet('leaf_dead', [node, node + d * L * 0.5 + sd * L * 0.34, node + d * L - sd * L * 0.1], [(0, 1, 2)],
                    [mul(WHITE, 0.7 * sh), mul(WHITE, sh), mul(WHITE, 0.85 * sh)], ao=0.85)
    for s in (-1, 1):
        n0 = base + UP * h1 * 0.62
        reach = polar(a + s * rng.uniform(1.4, 2.3)) * size * rng.uniform(0.12, 0.18)
        tip = ground(base + reach, rng.uniform(0.03, 0.08))
        G.tube('stem_dead', [n0, tip], [0.005, 0.0], ao=0.8)
        crisp(tip, 2)
    for f, n in ((0.15, 2), (0.42, 3), (0.70, 3), (0.96, 2)):
        crisp(p2.lerp(p3, f), n)
    soy_pods(G, base + UP * h1 * 0.8, 1, rng, size * 0.9, rng.uniform(0, TAU), m='stem_dead')
    soy_pods(G, p2.lerp(p3, 0.3), 1, rng, size * 0.9, rng.uniform(0, TAU), m='stem_dead')
    for _ in range(4):                                   # leaflets that fell: curled kites on the soil
        c = base + polar(rng.uniform(0, TAU)) * rng.uniform(0.07, 0.22)
        az = rng.uniform(0, TAU)
        d, sd = polar(az), polar(az - pi / 2)
        L, w = size * rng.uniform(0.032, 0.045), size * rng.uniform(0.02, 0.03)
        sh = rng.uniform(0.55, 1.0)
        kite = [ground(c - d * L, 0.006), ground(c + sd * w, rng.uniform(0.012, 0.03)), ground(c + d * L, 0.008),
                ground(c - sd * w, rng.uniform(0.012, 0.03))]
        G.sheet('leaf_dead', kite, [(0, 1, 2), (0, 2, 3)], mul(WHITE, sh), single=True, ao=0.85)


def build_soy():
    root, plants, dead = start('crop_soy')
    G, D = Geo(), Geo()
    spots = planting(**LAYOUTS['crop_soy'])
    rng = random.Random(230)
    for P in spots:
        soy_plant(G, P, rng)
    rng = random.Random(231)
    for P in spots:
        soy_dead(D, P, rng)
    keep_in_tray(G)
    keep_in_tray(D, on_soil=True)
    return finish(root, 'crop_soy', [(plants, G), (dead, D)])


# ==============================================================================================
# 4d. Dwarf tomato: three rows of three staked plants, trusses of fruit from green to red
# ==============================================================================================
TOMATO_X = (-0.48, 0.0, 0.48)
TOMATO_Y = (-0.56, 0.0, 0.56)
STAKE_H = 0.43          # the top of a stake above the soil


def tomato_leaf(G, node, a, rng, L, e0, e2, W, m='leaf_b', shade=1.0):
    """A divided leaf, arching over and drooping: it widens from the stem into a first pair of
    pointed leaflets, then a second pair, not quite opposite each other and swept toward the
    tip, then a larger leaflet at the end. One sheet, creased along the midrib, the leaflets
    hanging a little like a roof."""
    out = polar(a)
    p1 = node + (out * cos(e0) + UP * sin(e0)) * L * 0.5
    p2 = p1 + (out * cos(e2) + UP * sin(e2)) * L * 0.5
    r = [bez(node, p1, p2, t) for t in (0.0, 0.42, 0.72, 1.0)]
    pts, tris = list(r), []
    flip = rng.choice((-1, 1))
    for k in range(2):
        d, side, n = leaf_axes(r[k + 1] - r[k])
        for s in (-1, 1):
            w = W * (1.0 if k == 1 else 0.84) * rng.uniform(0.8, 1.15)
            t = (0.62 if s * flip < 0 else 0.92) + rng.uniform(-0.07, 0.07) + (0.12 if k == 0 else 0.0)
            pts.append(r[k].lerp(r[k + 1], t) + side * s * w - n * w * rng.uniform(0.05, 0.38))
            tris.append((k, k + 1, len(pts) - 1) if s < 0 else (k, len(pts) - 1, k + 1))
    d, side, n = leaf_axes(r[3] - r[2])
    for s in (-1, 1):
        pts.append(r[2].lerp(r[3], 0.40) + side * s * W * 0.66 - n * W * 0.12)
        tris.append((2, 3, len(pts) - 1) if s < 0 else (2, len(pts) - 1, 3))
    tint, dark = mul(WHITE, shade), mul(WHITE, shade * 0.78)
    G.sheet(m, pts, tris, [mul(tint, 0.8), tint, tint, dark] + [dark] * 4 + [mix(tint, dark, 0.5)] * 2, ao=0.9)


def tomato_fruit(G, c, r, ripe, rng):
    m = ('tomato_green', 'tomato_orange', 'tomato_red')[ripe]
    low = ((0.8, 0.86, 0.7), (1.0, 0.8, 0.7), (0.86, 0.8, 0.8))[ripe]
    G.ball(m, c, r, n=4, squash=0.9, spin=rng.uniform(0, TAU), tint=WHITE, top_tint=(0.86, 0.9, 0.8), low_tint=low,
           ao=0.55)
    # the calyx: three green sepals lying on the shoulder
    a0 = rng.uniform(0, TAU)
    pts = []
    for k in range(3):
        a = a0 + TAU * k / 3
        pts += [c + polar(a - 0.5, r * 0.50, r * 0.84), c + polar(a + 0.5, r * 0.50, r * 0.84),
                c + polar(a, r * 1.02, r * 0.50)]
    G.patch('stem', pts, [(0, 1, 2), (3, 4, 5), (6, 7, 8)], c, tints=mul(WHITE, 0.72), ao=0.4)


def tomato_plant(G, P, rng):
    size, base = P['size'], P['at']
    H = size * rng.uniform(0.34, 0.38)
    sa = P['yaw']
    sp = base + polar(sa) * 0.03
    G.tube('aluminium', [sp - UP * P['drop'], sp + UP * STAKE_H], 0.0075, seg=3, cap=True, ao=0.9)
    kink = polar(sa + 2.2) * 0.018

    def at(f):
        return base + UP * H * f + kink * sin(f * 3.0) * (1.0 - 0.7 * f)
    G.tube('stem', [base - UP * P['drop'], at(0.33), at(0.68), at(1.0)], [0.012, 0.0105, 0.0075, 0.0], ao=0.8)
    a0 = sa + 1.0

    def leaf(node, a, u, k=1.0):
        """u: 0 at the bottom of the plant, 1 at the top. The longest leaves are in the middle."""
        L = size * k * rng.uniform(0.25, 0.30) * (1.0 - 0.45 * abs(u - 0.4) ** 1.5)
        e0 = rad(rng.uniform(22, 40) + 28 * u * u)
        tomato_leaf(G, node, a, rng, L, e0, e0 - rad(rng.uniform(40, 70)), L * 0.35, 'leaf_b' if u < 0.55 else 'leaf',
                    rng.uniform(0.85, 1.0))
    for i in range(9):
        u = i / 8
        leaf(at(0.26 + 0.74 * u), a0 + 2.4 * i + rng.uniform(-0.25, 0.25), u)
    # two side shoots make it a bush: each a short branch with two leaves
    for s in range(2):
        ab = a0 + 0.6 + s * pi + rng.uniform(-0.3, 0.3)
        n0 = at(0.22 + 0.16 * s)
        tip = n0 + (polar(ab) * cos(rad(42)) + UP * sin(rad(42))) * size * rng.uniform(0.15, 0.19)
        G.tube('stem', [n0, tip], [0.007, 0.0], ao=0.8)
        leaf(n0.lerp(tip, 0.55), ab + rng.choice((-1, 1)) * rng.uniform(0.7, 1.1), 0.35, 0.9)
        leaf(tip, ab + rng.uniform(-0.3, 0.3), 0.6, 0.9)
    # two trusses on the outside of the plant, fruit at mixed ripeness
    for tr, f in enumerate((0.48, 0.74)):
        a = a0 + 1.2 + 2.9 * tr + rng.uniform(-0.3, 0.3)
        out, side = polar(a), polar(a - pi / 2)
        n0 = at(f)
        end = n0 + out * (0.175 - 0.02 * tr) + UP * 0.015
        G.tube('stem', [n0, end + out * 0.03 - UP * 0.03], [0.004, 0.0], ao=0.8)
        ripe = [2, 1, 2] if tr == 0 else [0, 2]
        if rng.random() < 0.4:
            ripe[0] = 1
        spots = [(-0.2, -0.95), (0.75, 0.2), (-0.55, 0.75)] if tr == 0 else [(-0.3, -0.75), (0.5, 0.7)]
        for (u, v), rp in zip(spots, ripe):
            r = size * rng.uniform(0.026, 0.031) * (0.88 if rp == 0 else 1.0)
            c = end + out * u * 0.034 + side * v * 0.037 - UP * (r * 0.9 + rng.uniform(0.0, 0.018))
            tomato_fruit(G, c, r, rp, rng)


def tomato_dead(G, P, rng):
    """The stake still stands. The plant hangs from it: the stem slumped and folded over, leaves
    shrivelled against it, the fruit dark and fallen."""
    size, base = P['size'], P['soil']
    sa = P['yaw']
    sp = base + polar(sa) * 0.03
    G.tube('aluminium', [sp - UP * 0.03, sp + UP * (STAKE_H + P['at'].z - base.z)], 0.0075, seg=3, cap=True, ao=0.9)
    a = sa + rng.uniform(1.6, 4.6)                      # the way the top fell
    out = polar(a)
    tie = sp + UP * size * rng.uniform(0.22, 0.28) - polar(sa) * 0.012
    over = tie + out * 0.07 + UP * 0.012
    tip = tie + out * size * rng.uniform(0.11, 0.15) - UP * size * rng.uniform(0.12, 0.17)
    G.tube('stem_dead', [base - UP * 0.02, tie, over, tip], [0.011, 0.009, 0.0065, 0.0], ao=0.8)

    def limp(node, az):
        """A dead leaf: the midrib hangs down, what is left of the leaflets curled against it."""
        o, sd = polar(az), polar(az - pi / 2)
        tw = rng.uniform(-0.6, 0.6)
        sd = (sd * cos(tw) + o * sin(tw)).normalized()
        r = [node, node + o * 0.04 - UP * 0.03 * size, node + o * 0.06 - UP * 0.09 * size,
             node + o * 0.05 - UP * 0.15 * size]
        pts, tris = list(r), []
        for k in range(2):
            for s in (-1, 1):
                w = size * rng.uniform(0.016, 0.04)
                at = r[k + 1].lerp(r[min(k + 2, 3)], rng.uniform(0.2, 0.7))
                pts.append(at + sd * s * w + o * rng.uniform(-0.015, 0.025))
                tris.append((k, k + 1, len(pts) - 1) if s < 0 else (k, len(pts) - 1, k + 1))
        sh = rng.uniform(0.55, 1.0)
        G.sheet('leaf_dead', pts, tris, [mul(WHITE, 0.7 * sh)] * 4 + [mul(WHITE, sh)] * 4, ao=0.85)
    for f in (0.32, 0.56, 0.8):
        limp(base.lerp(tie, f), a + rng.uniform(-2.5, 2.5))
    limp(over, a + rng.uniform(-0.8, 0.8))
    limp(over.lerp(tip, 0.6), a + rng.uniform(-1.2, 1.2))
    for k in range(2):                                   # fruit on the soil, dark and wrinkled
        r = size * rng.uniform(0.019, 0.024)
        c = ground(base + polar(a + rng.uniform(-1.6, 1.6)) * rng.uniform(0.09, 0.2), r * 0.5)
        G.ball('tomato_dead', c, r, n=3, squash=0.62, spin=rng.uniform(0, TAU), ao=0.6,
               tint=mul(WHITE, rng.uniform(0.7, 1.0)), top_tint=(0.5, 0.5, 0.45))
    n0 = base.lerp(tie, 0.72)                            # one that held on
    end = n0 + polar(a + 2.6) * 0.06 - UP * 0.03
    G.tube('stem_dead', [n0, end], [0.0035, 0.0], ao=0.8)
    r = size * 0.019
    G.spindle('tomato_dead', end + UP * 0.004, end - UP * r * 1.7, r, n=4, belly=0.55, tint=WHITE,
              tip_tint=(0.6, 0.6, 0.55), ao=0.6)


def build_tomato():
    root, plants, dead = start('crop_tomato')
    G, D = Geo(), Geo()
    spots = planting(**LAYOUTS['crop_tomato'])
    rng = random.Random(310)
    for P in spots:
        tomato_plant(G, P, rng)
    rng = random.Random(311)
    for P in spots:
        tomato_dead(D, P, rng)
    keep_in_tray(G)
    keep_in_tray(D, on_soil=True)
    return finish(root, 'crop_tomato', [(plants, G), (dead, D)])


# ==============================================================================================
# 5. Build
# ==============================================================================================
# The plantings. `tol` is how much of a plant's foot (full-size metres) may be under the soil
# while the game scales it through the ridges: bare stem for the tall crops, the skirt of outer
# leaves for lettuce, half the height of the leaves for radish (see footing()).
LAYOUTS = {
    'crop_lettuce': dict(xs=LETTUCE_X, ys=LETTUCE_Y, seed=41, tol=0.065, jx=0.01, jy=0.008),
    'crop_radish': dict(xs=RADISH_X, ys=RADISH_Y, seed=11, tol=0.115, jx=0.012, jy=0.015, size=(0.9, 1.08)),
    'crop_soy': dict(xs=SOY_X, ys=SOY_Y, seed=23, tol=0.07, jx=0.02, jy=0.02),
    'crop_tomato': dict(xs=TOMATO_X, ys=TOMATO_Y, seed=31, tol=0.06, jx=0.02, jy=0.025),
}
BUILDERS = {'crop_radish': build_radish, 'crop_soy': build_soy, 'crop_tomato': build_tomato, 'crop_lettuce': build_lettuce}

if __name__ == '__main__':
    asked = [a if a.startswith('crop_') else 'crop_' + a for a in sys.argv[1:]]
    unknown = [a for a in asked if a not in BUILDERS]
    if unknown:
        print('unknown model(s):', ', '.join(unknown), '- known:', ', '.join(BUILDERS))
    for name in ([a for a in asked if a in BUILDERS] or list(BUILDERS)):
        reset_scene()
        BUILDERS[name]()
