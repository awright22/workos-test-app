"""
Stranded II: the comforts he makes for the Hab, authored headlessly in Blender through
tools/assets/lib.py with the primitives of props.py and the room of hab.py.

    hab_comforts.glb    one file, nine parts, each standing where it belongs in the Hab

Run:   /home/user/blender-venv/bin/python tools/assets/comforts.py
Look:  node tools/assets/inspect.mjs hab_comforts ; node tools/assets/preview.mjs hab_comforts
       COMFORTS_FAST=1 skips the ambient-occlusion bake while blocking things out.

What the file is
  The model's frame is the Hab's own (hab.py): origin at the centre of the Hab floor on the
  ground plane, Z up, the airlock door toward -Y, the walking surface at FLOOR_Z. The game adds
  the model to the Hab with no offset and shows a part when its comfort has been made
  (static/martian/src/game/comforts.js, world/build.js). Each part's own origin is a sensible
  pivot (on the floor under it, on the table top, or at its fixing on the wall), should the game
  ever want to scale one in.

    comfort_lights   string lights: two swags of 16 lamps crossing over the galley table, hung by
                     cords from the roof truss. The lamps are the material `light_warm` (emissive).
    comfort_herbs    window garden: four improvised pots on a bracketed plank under porthole 10
    comfort_photos   twelve prints and a mission patch taped to the wall behind the foot of the bunk
    comfort_chair    reading chair (a rover seat on a welded tube frame) facing porthole 10, with a
                     blanket, a cushion and a side crate. Anchor `col_chair` is its collider.
    comfort_rocks    specimen shelf: two tiers of four labelled samples beside porthole 10
    comfort_flag     the Jolly Roger on a cord between the two ribs over the airlock's inner door
    comfort_rug      parachute rug on the open floor between the galley table and the chair
    comfort_greg     Greg, at the head of the galley table
    comfort_chess    nuts against bolts, mid-game, at the other end of the galley table

  Inside each part is one more part node, `<name>_body`, which owns the geometry: see comfort().

How it is made
  * The game folds the plain materials of a part into one mesh and draws it FRONT FACES ONLY, with
    the colour of each vertex = material colour x vertex colour. So every surface here is wound by
    construction, cloth and leaves have a back, and one material carries many colours: tint() and
    col() name "this material, multiplied by this colour"; apply_tints() moves the colour into the
    vertices after the occlusion bake and puts the faces back on the real material. A tint can
    only darken, so the palette material is the lightest tone it is asked for. The file ends up
    with nine materials.
  * Occlusion is baked one part at a time against a stand-in for the room (floor, liner, table
    top, door header), so the comforts never shade each other: any of them may be absent.
  * Things fixed to the liner are placed by casting rays at the liner as hab.py builds it, with
    the triangles the exporter writes. If hab.py's liner, truss, ribs, table or wall modules move,
    PLACES and the numbers quoted from hab.py in the builders have to follow.
  * Positions are packed on a 16-bit grid (0.26 mm over this model): layered flat things (prints,
    labels, the chess squares) are kept at least 0.9 mm apart.

Where things stand was read from hab.py (stations, wall modules, set dressing, floor marks) and
checked in renders of the two models together and by intersecting the two exports: see PLACES.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402  (imports bpy before bmesh/mathutils)
from lib import *  # noqa: E402,F401,F403
from props import T, R, S, Kit, box, circ, rect, rrect, clip_convex2, noise3  # noqa: E402  (matrix-placed primitives, wound by construction)
import hab  # noqa: E402  (the room: dimensions and the liner; nothing in it is built here)

cos, sin, pi = math.cos, math.sin, math.pi
FAST = bool(os.environ.get('COMFORTS_FAST'))
FLOOR = hab.FLOOR_Z

# ----------------------------------------------------------------------------------------------
# Where things are (Hab frame, metres). The galley table, the truss and the portholes are hab.py's.
# ----------------------------------------------------------------------------------------------
TABLE_AT, TABLE_YAW, TABLE_TOP = (1.75, 2.35), 38.0, 0.76        # set_dressing(): top surface above the floor
TABLE = T(TABLE_AT[0], TABLE_AT[1], FLOOR) @ R('Z', TABLE_YAW)   # the table's own frame: x along its length
WINDOW_GORE = 10                                                 # the porthole with open floor in front of it
PLACES = {
    'lights': (1.75, 2.35),      # over the table (the game's warm lamp for them is at 2.4 m above this point)
    'chair': (2.80, 6.20),       # free floor between the comms desk, the oxygenator and porthole 10
    'rug': (2.00, 4.40),         # plain tiles north of the table; clear of the COMMS and O2 floor marks
    'photos_deg': 132.3,         # gore 15: the wall behind the foot half of the bunk, the only bare gore
    'flag_z': 3.42,              # cord height on ribs 0 and 1, over the door header (top 2.76) and its sign
}


# ----------------------------------------------------------------------------------------------
# Materials and tints
# ----------------------------------------------------------------------------------------------
ONE_OFF = {
    # salvaged indicator LEDs under diffuser caps: the game switches this one with the Hab's power
    'light_warm': dict(color=(1.0, 0.74, 0.42), metallic=0.0, roughness=0.4, emissive=(1.0, 0.52, 0.18), strength=3.2),
    'herb_leaf': dict(color=(0.26, 0.56, 0.12), metallic=0.0, roughness=0.6),      # the lightest herb green
}
_TINTS = {}


def ensure_mats():
    _TINTS.clear()
    _BODY.clear()
    for name, spec in ONE_OFF.items():
        mat(name, **spec)


def base_colour(name):
    return ONE_OFF[name]['color'] if name in ONE_OFF else PALETTE[name][0]


def tint(target, rgb):
    """The name of a stand-in material that means `target` multiplied by `rgb` (each 0..1)."""
    if isinstance(rgb, (int, float)):
        rgb = (rgb, rgb, rgb)
    rgb = tuple(max(0.0, min(1.0, c)) for c in rgb)
    if min(rgb) > 0.995:
        mat(target)
        return target
    key = '%s~%02x%02x%02x' % (target, round(rgb[0] * 255), round(rgb[1] * 255), round(rgb[2] * 255))
    if key not in _TINTS:
        spec = ONE_OFF.get(target)
        if spec:
            c, me_, ro = spec['color'], spec['metallic'], spec['roughness']
        else:
            c, me_, ro = PALETTE[target][:3]
        mat(key, color=tuple(a * b for a, b in zip(c, rgb)), metallic=me_, roughness=ro)
        _TINTS[key] = (target, rgb)
    return key


def col(target, rgb):
    """`target` tinted to the colour `rgb` (linear, clamped to what a tint can reach)."""
    b = base_colour(target)
    return tint(target, tuple(min(1.0, c / max(k, 1e-4)) for c, k in zip(rgb, b)))


def apply_tints(root, flat=('light_warm',)):
    """Multiply every tint into the baked vertex colours and return its faces to the real
    material; lamps carry no occlusion."""
    for o in [root] + lib._descendants(root):
        if o.type != 'MESH':
            continue
        me = o.data
        attr = me.color_attributes.get('Col')
        if attr is None:
            attr = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for d in attr.data:
                d.color = (1.0, 1.0, 1.0, 1.0)
        names = [m.name for m in me.materials]
        real, remap = [], []
        for n in names:
            t = _TINTS[n][0] if n in _TINTS else n
            if t not in real:
                real.append(t)
            remap.append(real.index(t))
        done = set()
        for p in me.polygons:
            n = names[p.material_index]
            rgb = _TINTS[n][1] if n in _TINTS else None
            for vi in p.vertices:
                if vi in done:
                    continue
                done.add(vi)
                c = attr.data[vi].color
                if n in flat:
                    attr.data[vi].color = (1.0, 1.0, 1.0, 1.0)
                elif rgb:
                    attr.data[vi].color = (c[0] * rgb[0], c[1] * rgb[1], c[2] * rgb[2], 1.0)
        index = [remap[p.material_index] for p in me.polygons]
        me.materials.clear()                       # (clearing the slots resets every face to slot 0)
        for n in real:
            me.materials.append(mat(n))
        me.polygons.foreach_set('material_index', index)
        me.update()
        me.color_attributes.active_color = attr
        try:
            me.color_attributes.render_color_index = list(me.color_attributes).index(attr)
        except Exception:
            pass


# ----------------------------------------------------------------------------------------------
# The room: the liner to fix things to, and the stand-in the occlusion is baked against
# ----------------------------------------------------------------------------------------------
def liner_bm():
    """The quilted liner exactly as hab_interior_shell() builds it."""
    walls, roof = hab.IN_WALL, hab.IN_ROOF
    rows = [(hab.A_IN, z, 1.0, 0.0) for z, _ in walls] + [hab.roof_pt(hab.A_IN, hab.Z0_IN, hab.C_IN, d) for d, _ in roof]
    amps = [hab.in_amp(r, z) * b for (r, z, _, _), b in zip(rows, [b for _, b in walls] + [b for _, b in roof])]
    bm = bm_new()
    hab.lobed_shell(bm, rows, amps, 4, sign=-1.0, skip=lambda g, i: g == 0 and i < 4, flip=True)
    return bm


_LINER = {}


def liner_tree():
    if 'tree' not in _LINER:
        bm = liner_bm()
        me = bpy.data.meshes.new('liner_probe')
        bm.to_mesh(me)
        bm.free()
        me.calc_loop_triangles()                                   # the triangles the exporter writes
        _LINER['tree'] = BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [tuple(t.vertices) for t in me.loop_triangles])
        bpy.data.meshes.remove(me)
    return _LINER['tree']


def wall_at(deg, z):
    """Point on the liner at a bearing and a height, and the normal there pointing into the room."""
    d = Vector((cos(rad(deg)), sin(rad(deg)), 0.0))
    loc, nrm, _, _ = liner_tree().ray_cast(Vector((0, 0, z)), d, 20.0)
    if nrm.dot(d) > 0:
        nrm = -nrm
    return loc, nrm.normalized()


def wall_frame(deg, r=hab.A_IN, z=0.0):
    """A frame standing at the wall like hab.py's wall kits: +x along the wall (clockwise seen
    from above), -y into the room, origin on the nominal wall circle."""
    th = rad(deg)
    return T(r * cos(th), r * sin(th), z) @ R('Z', deg - 90.0)


def wall_y(W_, x, z):
    """Where the liner is in the wall frame W_ at (x, z): its local y (0 on the nominal circle
    at the frame's centre, negative into the room)."""
    o = W_ @ Vector((x, -1.0, z))
    d = (W_.to_3x3() @ Vector((0, 1, 0))).normalized()
    return liner_tree().ray_cast(o, d, 3.0)[3] - 1.0


def wall_bar(K, m, W_, x, z0, z1, width=0.03, thick=0.008):
    """A flat bar screwed up the wall in the wall frame W_ (the Kit's frame): it bends where the
    quilting does (the liner's rows at 0.80, 1.56 and 2.14 m). Returns its room-side face y(z)."""
    zs = sorted({z0, z1} | {b for b in (0.80, 1.56, 2.14) if z0 < b < z1})
    ys = [wall_y(W_, x, z) - 0.001 for z in zs]
    K.sweep(m, [(x, y - thick / 2, z) for y, z in zip(ys, zs)], rect(width, thick), up=(0, -1, 0), smooth=30.0)

    def face(z):
        for (za, ya), (zb, yb_) in zip(zip(zs, ys), zip(zs[1:], ys[1:])):
            if za <= z <= zb:
                return ya + (yb_ - ya) * (z - za) / (zb - za) - thick
        return ys[0] - thick
    return face


def room_stand_in(node):
    """What shades a comfort in the game: the floor, the liner, the galley table top, the portal
    header over the door. Parented to the part being baked, then thrown away."""
    bm = liner_bm()
    n = 48
    bm.faces.new([bm.verts.new((8.5 * cos(TAU * i / n), 8.5 * sin(TAU * i / n), FLOOR)) for i in range(n)])
    box(bm, (1.5, 0.8, 0.04), (0, 0, 0.74), TABLE)
    box(bm, (2.7, 0.3, 0.3), (0, -8.39, hab.DOOR_TOP + 0.15))
    me = bpy.data.meshes.new('room_stand_in')
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new('room_stand_in', me)
    o.location = -node.matrix_world.translation
    return link(o, node)


_BODY = {}


def comfort(root, name, pivot):
    """The part node of one comfort (`comfort_<name>`, at its pivot in the Hab's frame) with an
    inner part `<name>_body` that owns the geometry. The inner node is there for the game's sake:
    it folds a part's meshes into new ones named after their owner ('<owner>:plain', see
    mergeStatic in world/models.js) and finds the comforts by the prefix 'comfort_', so nothing
    but the nine part nodes may carry that prefix."""
    node = part('comfort_' + name, parent=root, loc=tuple(pivot))
    _BODY[node.name] = part(name + '_body', parent=node)
    return node


def kit(node, name, M=None):
    """A Kit whose coordinates are the Hab's (or those of the frame M in the Hab), whatever the
    part's own origin."""
    off = T(*(-Vector(node.location)))
    return Kit(name, _BODY[node.name], off if M is None else off @ M)


# ----------------------------------------------------------------------------------------------
# Small shared pieces
# ----------------------------------------------------------------------------------------------
def sheet(bm, grid, flip=False):
    """Quads over a grid of points grid[i][j]; the normal is di x dj (reversed by flip)."""
    vs = [[bm.verts.new(p) for p in row] for row in grid]
    out = []
    for i in range(len(vs) - 1):
        for j in range(len(vs[0]) - 1):
            q = (vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1])
            out.append(bm.faces.new(tuple(reversed(q)) if flip else q))
    return out


def ngon(bm, c, n, x, y, r, sides=8, ry=None, phase=0.0):
    """A flat polygon at c in the plane (x, y), facing x cross y."""
    ry = r if ry is None else ry
    c, x, y = Vector(c), Vector(x), Vector(y)
    return bm.faces.new([bm.verts.new(c + x * (r * cos(phase + TAU * i / sides)) + y * (ry * sin(phase + TAU * i / sides)))
                         for i in range(sides)])


def hexnut(K, m, r, h, M, hole=None):
    """A hex nut (or bolt head) standing on local z = 0; `hole` names the material of its bore."""
    K.prism(m, circ(r, 6), h, M, z0=0.0, cap_bottom=False)
    if hole:
        K.poly(hole, [(0.52 * r * cos(TAU * i / 6 + 0.5), 0.52 * r * sin(TAU * i / 6 + 0.5), h + 0.0012) for i in range(6)], M, smooth=20.0)


def leaf(K, m_top, m_back, base, d, up, length, width, cup=0.25, gap=0.0012):
    """One leaf, two-sided: a folded kite from `base` along `d`, its upper side toward `up`."""
    base, d, up = Vector(base), Vector(d).normalized(), Vector(up).normalized()
    s = up.cross(d)
    if s.length < 1e-4:
        s = d.orthogonal()
    s.normalize()
    n = d.cross(s).normalized()
    mid = base + d * (length * 0.45)
    tip = base + d * length - n * (length * 0.08)
    lft, rgt = mid + s * (width / 2) + n * (cup * width), mid - s * (width / 2) + n * (cup * width)
    a = K.bm(m_top, 0.0, 50.0)
    v = [a.verts.new(p) for p in (base, tip, lft, rgt)]
    a.faces.new((v[0], v[1], v[2]))
    a.faces.new((v[0], v[3], v[1]))
    b = K.bm(m_back, 0.0, 51.0)
    w = [b.verts.new(p - n * gap) for p in (base, tip, lft, rgt)]
    b.faces.new((w[0], w[2], w[1]))
    b.faces.new((w[0], w[1], w[3]))


def tally(root):
    """Triangles per part (after the helpers were collapsed into their parts)."""
    rows = {}
    for o in [root] + lib._descendants(root):
        if o.type == 'MESH':
            owner = o
            while owner.parent is not None and not owner.name.startswith('comfort_'):
                owner = owner.parent
            rows[owner.name] = rows.get(owner.name, 0) + sum(len(p.vertices) - 2 for p in o.data.polygons)
    print('PARTS ' + ', '.join(f'{k}={v}' for k, v in rows.items()) + f'  total={sum(rows.values())}')
    return rows


# ==============================================================================================
# 1. comfort_lights
# ==============================================================================================
def build_lights(root):
    """Two swags of salvaged LEDs crossing over the galley table. Each hangs between two cords
    that go up and outward to the roof truss (hab_interior_shell: an octagon of chords at 5.0 m);
    the driver box hangs where they cross."""
    cx, cy = PLACES['lights']
    node = comfort(root, 'lights', (cx, cy, FLOOR))
    K = kit(node, 'lights')
    C = Vector((cx, cy, 0.0))
    zc, zh, L = 2.70, 3.18, 1.45                  # height at the crossing, at the cord ends; half span
    rv = hab.TRUSS_R / cos(rad(22.5))
    v7, v2 = (Vector(hab.pol(rv, rad(22.5 + 45 * i), hab.TRUSS_Z)) for i in (7, 2))
    # each swag lies in the vertical plane through the table's centre and two points of the truss
    swags = [(v7, Vector((0.99, 3.8, hab.TRUSS_Z))), (Vector((3.8, 1.456, hab.TRUSS_Z)), v2)]
    wire, dark, cord = 'plastic_black', 'plastic_black', tint('suit_white', (0.92, 0.88, 0.78))
    rng = random.Random(11)
    for si, (ta, tb) in enumerate(swags):
        d = (Vector((ta.x, ta.y, 0)) - C).normalized()
        lift = 0.012 * si                           # the second wire lies over the first at the crossing

        def at(s, d=d, lift=lift):
            return C + d * s + Vector((0, 0, zc + lift + (zh - zc - lift) * (s / L) ** 2))
        n = 30
        pts = [at(-L + 2 * L * i / n) for i in range(n + 1)]
        K.tube(wire, pts, 0.0045, 4)
        # lamps at even spacing along the wire either side of the crossing, hanging straight down
        # with a little swing
        m = 400
        arc = [0.0]
        for i in range(1, m + 1):
            arc.append(arc[-1] + (at(-L + 2 * L * i / m) - at(-L + 2 * L * (i - 1) / m)).length)
        want = sorted(arc[-1] / 2 + sgn * (0.10 + 0.19 * j) for sgn in (-1, 1) for j in range(8))
        k = 0
        for i in range(1, m + 1):
            if k < len(want) and arc[i] >= want[k]:
                p = at(-L + 2 * L * i / m)
                M = T(p.x, p.y, p.z - 0.002) @ R('Z', rng.uniform(0, 360)) @ R('X', 180 + rng.uniform(-9, 9))
                K.lathe(dark, [(0.0, 0.0), (0.0095, 0.0), (0.0095, 0.024)], 5, M, smooth=40.0)
                K.lathe('light_warm', [(0.0095, 0.022), (0.0215, 0.039), (0.0170, 0.061), (0.0, 0.070)], 6, M, smooth=60.0)
                k += 1
        for tie, s_end in ((ta, L), (tb, -L)):
            h = at(s_end)
            # a spring hook joins the wire to the cord; the wire's end is turned back and taped
            K.torus('aluminium', 0.016, 0.0032, 6, 3, T(h.x, h.y, h.z + 0.012) @ R('Z', math.degrees(math.atan2(d.y, d.x))) @ R('X', 90))
            K.box(dark, (0.03, 0.018, 0.02), (0, 0, 0), T(h.x, h.y, h.z - 0.004) @ R('Z', math.degrees(math.atan2(d.y, d.x))))
            top = Vector((tie.x, tie.y, tie.z - 0.03))
            K.tube(cord, [h + Vector((0, 0, 0.024)), top], 0.0035, 3, caps=False)
            # the cord goes twice round the chord of the truss and is knotted under it
            cdx, cdy = chord_dir(tie)
            along = math.degrees(math.atan2(cdy, cdx))
            K.torus(cord, 0.03, 0.0045, 6, 3, T(tie.x, tie.y, tie.z) @ R('Z', along) @ R('Y', 90) @ T(0, 0, -0.006))
            K.torus(cord, 0.03, 0.0045, 6, 3, T(tie.x, tie.y, tie.z) @ R('Z', along) @ R('Y', 90) @ T(0, 0, 0.006))
            K.rock(cord, 0.011, (tie.x, tie.y, tie.z - 0.036), seed=si, subdiv=1, rough=0.1)
    # driver box under the crossing: salvaged supply, a switch, an indicator, two leads up to the wires
    B = T(cx, cy, zc - 0.062) @ R('Z', 20)
    K.box(tint('plastic_white', 0.82), (0.115, 0.07, 0.036), (0, 0, 0), B, bevel=0.004)
    K.box(col('plastic_white', (0.72, 0.25, 0.04)), (0.05, 0.071, 0.02), (-0.02, 0, 0.0), B)
    K.box(dark, (0.014, 0.02, 0.008), (0.036, 0.0, -0.021), B)
    K.lathe('light_warm', [(0.005, 0.0), (0.005, 0.004), (0.0, 0.006)], 5, B @ T(0.034, -0.022, -0.018) @ R('X', 180))
    for sx, lift in ((-0.04, 0.0), (0.04, 0.012)):
        p0 = B @ Vector((sx, 0, 0.018))
        K.tube(wire, [p0, p0 + Vector((0, 0, 0.02)), Vector((cx, cy, zc + lift - 0.004))], 0.003, 3, caps=False)
    K.box(dark, (0.022, 0.022, 0.03), (0, 0, 0), T(cx, cy, zc + 0.004) @ R('Z', 20))       # the clip that holds the crossing
    K.finish()
    return node


def chord_dir(p):
    """Direction (dx, dy) of the truss chord that passes through the point p of its octagon."""
    best, out = 1e9, (1.0, 0.0)
    rv = hab.TRUSS_R / cos(rad(22.5))
    for i in range(8):
        a = Vector(hab.pol(rv, rad(22.5 + 45 * i), 0))
        b = Vector(hab.pol(rv, rad(22.5 + 45 * (i + 1)), 0))
        ab = b - a
        t = max(0.0, min(1.0, (Vector((p.x, p.y, 0)) - a).dot(ab) / ab.length_squared))
        dist = (a + ab * t - Vector((p.x, p.y, 0))).length
        if dist < best:
            best, out = dist, (ab.x / ab.length, ab.y / ab.length)
    return out


# ==============================================================================================
# 7. comfort_rug
# ==============================================================================================
def build_rug(root):
    """Orange and white gores of a supply parachute stitched into an oval, 2.2 x 1.5 m: wedges
    from a vent patch out to a taped hem, the seams and the hem a little proud, the edge wavy."""
    cx, cy = PLACES['rug']
    node = comfort(root, 'rug', (cx, cy, FLOOR))
    K = kit(node, 'rug', T(cx, cy, FLOOR) @ R('Z', 8))
    A, B, NW, SUB = 1.10, 0.75, 14, 3
    # the tones are kept low: the rug lies face up under the ceiling lights, and nylon is not paint
    white = col('suit_white', (0.60, 0.585, 0.545))
    orange = col('suit_white', (0.52, 0.108, 0.016))
    seam = col('suit_white', (0.33, 0.31, 0.28))
    hem = col('suit_white', (0.27, 0.07, 0.015))
    fr = (0.115, 0.42, 0.74, 0.968, 1.0)
    na = NW * SUB

    def edge(a):
        return 1.0 + 0.024 * sin(5 * a + 1.0) + 0.016 * sin(11 * a + 0.4) + 0.010 * sin(17 * a)

    def pt(a, f, lift=0.0):
        k = f * (edge(a) if f > 0.9 else 1.0 + (edge(a) - 1.0) * f * 0.6)
        z = 0.0135 + 0.0026 * f * f * sin(7 * a + 2.0) + 0.0010 * sin(3.1 * a) * f + lift
        if f > 0.9:                                   # the hem rolls down to the floor
            z -= 0.0085 * ((f - 0.9) / 0.1) ** 2
        return (A * k * cos(a), B * k * sin(a), z)

    for w in range(NW):
        m = orange if w % 2 == 0 else white
        bm = K.bm(m, 0.0, 30.0)
        grid = [[pt(TAU * (w * SUB + i) / na, f) for i in range(SUB + 1)] for f in fr[:4]]
        sheet(bm, grid)
        a0 = TAU * w * SUB / na
        # the seam along this gore's leading edge: a flat-felled strip standing proud
        sb = K.bm(seam, 0.0, 31.0)
        da = 0.013
        sheet(sb, [[pt(a0 - da / max(f, 0.2), f, 0.0025), pt(a0 + da / max(f, 0.2), f, 0.0025)] for f in fr[:4]])
    # hem tape all round, and the cut edge down to the floor
    hb = K.bm(hem, 0.0, 32.0)
    sheet(hb, [[pt(TAU * i / na, f, 0.002) for i in range(na + 1)] for f in (0.968, 0.985, 1.0)])
    sheet(hb, [[pt(TAU * i / na, 1.0, 0.002) for i in range(na + 1)],
               [(pt(TAU * i / na, 1.0)[0] * 1.003, pt(TAU * i / na, 1.0)[1] * 1.003, 0.0015) for i in range(na + 1)]])
    # vent patch in the middle with its cross of stitching
    cb = K.bm(white, 0.0, 33.0)
    ring = [cb.verts.new(pt(TAU * i / 14, fr[0] * 1.12, 0.0025)) for i in range(14)]
    cb.faces.new(ring)
    for a in (0.5, 0.5 + pi / 2):
        ca, sa = cos(a), sin(a)
        r_ = 0.10
        K.quad(seam, (-r_ * ca - 0.008 * sa, -r_ * sa * 0.7 + 0.008 * ca, 0.018), (-r_ * ca + 0.008 * sa, -r_ * sa * 0.7 - 0.008 * ca, 0.018),
               (r_ * ca + 0.008 * sa, r_ * sa * 0.7 - 0.008 * ca, 0.018), (r_ * ca - 0.008 * sa, r_ * sa * 0.7 + 0.008 * ca, 0.018), smooth=34.0)
    K.finish()
    return node


# ==============================================================================================
# 6. comfort_flag
# ==============================================================================================
def build_flag(root):
    """A Jolly Roger in marker on a rectangle of Hab canvas, pegged by its top corners to a cord
    tied between ribs 0 and 1, over the header of the airlock's inner door. The cloth is a grid
    of triangles; the emblem is cut to those triangles so it lies in the folds."""
    zc = PLACES['flag_z']
    W, Hh, NX, NV = 1.16, 0.60, 16, 8
    clipx, y0 = 0.49, -8.105                     # the cloth hangs clear of the eave hoop (its face is at y = -8.151)
    rib_r = 8.28 - (zc - 3.10) / 0.542 * 0.118   # inner face of a rib at the cord (hab_interior_shell's rib stations)
    tie_x = abs(rib_r * cos(hab.rib_ang(1)))
    tie_y = rib_r * sin(hab.rib_ang(1)) + 0.016
    node = comfort(root, 'flag', (0.0, y0, zc - 0.05 - Hh / 2))
    K = kit(node, 'flag')
    canvas = col('suit_white', (0.60, 0.53, 0.40))
    canvas_back = col('suit_white', (0.42, 0.37, 0.28))
    stitch = col('suit_white', (0.40, 0.35, 0.26))
    ink = col('suit_white', (0.030, 0.030, 0.036))
    cordm = 'plastic_black'

    def cord(x):
        t = x / tie_x
        return Vector((x, tie_y + (y0 + 0.012 - tie_y) * (1 - t * t), zc - 0.05 * (1 - t * t)))

    zpin = cord(clipx).z - 0.012

    def cloth(u, v):
        """u across (-W/2..W/2), v down from the top edge (0..Hh)."""
        au = abs(u)
        if au <= clipx:
            top = zpin - 0.052 * (1 - (u / clipx) ** 2)
            flop = 0.0
        else:
            top = zpin - 0.55 * (au - clipx) - 2.0 * (au - clipx) ** 2
            flop = 0.45 * (au - clipx) * max(0.0, 1 - v / 0.22)
        k = v / Hh
        fold = (0.005 + 0.024 * k) * sin(TAU * u / 0.335 + 0.5) + 0.006 * (0.3 + k) * sin(TAU * u / 0.19 + 2.1 + 2.2 * k)
        hang = 0.010 * (1 - (u / clipx) ** 2) * sin(pi * min(1.0, k * 1.6)) if au <= clipx else 0.0
        x = u * (1 - 0.025 * k) + 0.004 * sin(9 * v + u * 3)
        z = top - v - 0.014 * k * sin(TAU * u / 0.335 + 0.5 + 1.2)
        return Vector((x, y0 + fold + flop + hang, z))

    us = [-W / 2 + W * i / NX for i in range(NX + 1)]
    vs = [Hh * j / NV for j in range(NV + 1)]
    grid = [[cloth(u, v) for v in vs] for u in us]
    fb, bb = K.bm(canvas, 0.0, 70.0), K.bm(canvas_back, 0.0, 71.0)
    fv = [[fb.verts.new(p) for p in row] for row in grid]
    tris = []                                     # (uv corners, 3D corners) of every cloth triangle
    for i in range(NX):
        for j in range(NV):
            for a, b, c in (((i, j), (i + 1, j), (i + 1, j + 1)), ((i, j), (i + 1, j + 1), (i, j + 1))):
                fb.faces.new((fv[a[0]][a[1]], fv[b[0]][b[1]], fv[c[0]][c[1]]))
                tris.append(([(us[q[0]], vs[q[1]]) for q in (a, b, c)], [grid[q[0]][q[1]] for q in (a, b, c)]))
    # the back of the cloth, a hair behind (toward the wall)
    bv = [[bb.verts.new(p + Vector((0, -0.0015, 0))) for p in row] for row in grid]
    for i in range(NX):
        for j in range(NV):
            bb.faces.new((bv[i][j], bv[i + 1][j + 1], bv[i + 1][j]))
            bb.faces.new((bv[i][j], bv[i][j + 1], bv[i + 1][j + 1]))

    def drape(m, outline, eps, smooth):
        """Lay a convex outline [(u, h)] (h up from the bottom edge) on the cloth, eps proud of it."""
        uv = [(u, Hh - h) for u, h in outline]
        area = sum(uv[k][0] * uv[(k + 1) % len(uv)][1] - uv[(k + 1) % len(uv)][0] * uv[k][1] for k in range(len(uv)))
        if area < 0:
            uv.reverse()
        lo_u, hi_u = min(p[0] for p in uv), max(p[0] for p in uv)
        lo_v, hi_v = min(p[1] for p in uv), max(p[1] for p in uv)
        bm = K.bm(m, 0.0, smooth)
        for t2, t3 in tris:
            if max(p[0] for p in t2) < lo_u or min(p[0] for p in t2) > hi_u or max(p[1] for p in t2) < lo_v or min(p[1] for p in t2) > hi_v:
                continue
            piece = clip_convex2(t2, uv)
            if len(piece) < 3:
                continue
            a2 = 0.5 * abs(sum(piece[k][0] * piece[(k + 1) % len(piece)][1] - piece[(k + 1) % len(piece)][0] * piece[k][1] for k in range(len(piece))))
            if a2 < 2e-6:
                continue
            (x1, y1), (x2, y2), (x3, y3) = t2
            det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
            nrm = (t3[1] - t3[0]).cross(t3[2] - t3[0]).normalized()
            pts = []
            for (px, py) in piece:
                l1 = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / det
                l2 = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / det
                pts.append(t3[0] * l1 + t3[1] * l2 + t3[2] * (1 - l1 - l2) + nrm * eps)
            f = bm.faces.new([bm.verts.new(q) for q in pts])
            f.normal_update()
            if f.normal.dot(nrm) < 0:
                f.normal_flip()

    def ell(cu, ch, ru, rh, n=12, rot=0.0):
        return [(cu + ru * cos(TAU * i / n) * cos(rot) - rh * sin(TAU * i / n) * sin(rot),
                 ch + ru * cos(TAU * i / n) * sin(rot) + rh * sin(TAU * i / n) * cos(rot)) for i in range(n)]

    # a turned and stitched hem all round
    for a_, b_ in (((-W / 2 + 0.012, 0.014), (W / 2 - 0.012, 0.024)), ((-W / 2 + 0.012, Hh - 0.026), (W / 2 - 0.012, Hh - 0.016)),
                   ((-W / 2 + 0.012, 0.024), (-W / 2 + 0.022, Hh - 0.026)), ((W / 2 - 0.022, 0.024), (W / 2 - 0.012, Hh - 0.026))):
        drape(stitch, [a_, (b_[0], a_[1]), b_, (a_[0], b_[1])], 0.002, 74.0)
    # crossbones: two fat strokes with knuckled ends, a little uneven, as a hand draws them
    for sgn, wob in ((1, 0.0), (-1, 0.012)):
        a = Vector((-0.325 * sgn, 0.090 + wob))
        b = Vector((0.315 * sgn, 0.490 - wob))
        d = (b - a).normalized()
        nn = Vector((-d.y, d.x))
        hw = 0.021
        drape(ink, [tuple(a + nn * hw), tuple(b + nn * hw), tuple(b - nn * hw), tuple(a - nn * hw)], 0.0025, 72.0)
        for end, way in ((a, -1), (b, 1)):
            for side in (-1, 1):
                c = end + d * (0.012 * way) + nn * (0.027 * side)
                drape(ink, ell(c.x, c.y, 0.031, 0.031, 9), 0.0025, 72.0)
    # the skull: cranium, cheeks and jaw in solid ink
    drape(ink, ell(0.0, 0.352, 0.122, 0.108, 16), 0.0025, 72.0)
    drape(ink, [(-0.088, 0.30), (0.086, 0.30), (0.064, 0.175), (-0.060, 0.172)], 0.0025, 72.0)
    # eye sockets, nose and teeth left bare (drawn here as canvas over the ink)
    drape(canvas, ell(-0.050, 0.352, 0.036, 0.040, 9, 0.2), 0.0045, 73.0)
    drape(canvas, ell(0.048, 0.356, 0.033, 0.038, 9, -0.15), 0.0045, 73.0)
    drape(canvas, [(0.0, 0.312), (-0.019, 0.270), (0.019, 0.272)], 0.0045, 73.0)
    for tu in (-0.034, -0.011, 0.012, 0.035):
        drape(canvas, [(tu - 0.0045, 0.182), (tu + 0.0045, 0.182), (tu + 0.0045, 0.238), (tu - 0.0045, 0.238)], 0.0045, 73.0)
    drape(canvas, [(-0.052, 0.236), (0.052, 0.238), (0.052, 0.247), (-0.052, 0.245)], 0.0045, 73.0)

    # the cord from rib to rib, wound round each rib and knotted on its face
    n = 12
    K.tube(cordm, [cord(-tie_x + 2 * tie_x * i / n) for i in range(n + 1)], 0.004, 4, caps=False)
    for sx in (-1, 1):
        th = hab.rib_ang(1) if sx > 0 else hab.rib_ang(0)
        F = Vector(hab.pol(rib_r, th, zc))
        tg = Vector((-sin(th), cos(th), 0))
        inw = Vector((-cos(th), -sin(th), 0))
        for dz in (-0.007, 0.007):
            K.tube(cordm, [F + tg * 0.053 - inw * 0.10 + Vector((0, 0, dz)), F + tg * 0.053 + inw * 0.008 + Vector((0, 0, dz)),
                           F - tg * 0.053 + inw * 0.008 + Vector((0, 0, dz)), F - tg * 0.053 - inw * 0.10 + Vector((0, 0, dz))],
                   0.004, 4, round_r=0.012, caps=False)
        K.rock(cordm, 0.013, tuple(F + inw * 0.014), seed=5 + sx, subdiv=1, rough=0.12)
    # two spring pegs: jaws over the cloth's top edge, a wire bail over the cord
    for sx in (-1, 1):
        c = cord(sx * clipx)
        top = cloth(sx * clipx, 0.0)
        M = T(top.x, top.y, top.z + 0.004) @ R('Z', 4 * sx)
        K.box('plastic_black', (0.034, 0.016, 0.034), (0, 0, 0.0), M)
        K.box('aluminium', (0.036, 0.020, 0.006), (0, 0, 0.012), M)
        K.tube('aluminium', [(top.x - 0.012, top.y, top.z + 0.018), (c.x - 0.012, c.y, c.z + 0.008), (c.x + 0.012, c.y, c.z + 0.008),
                             (top.x + 0.012, top.y, top.z + 0.018)], 0.0022, 3, round_r=0.006, caps=False)
    K.finish()
    return node


# ==============================================================================================
# 3. comfort_photos
# ==============================================================================================
SKY, GRASS, SEA, SAND = (0.22, 0.42, 0.72), (0.16, 0.36, 0.10), (0.08, 0.26, 0.50), (0.66, 0.56, 0.36)
MSKY, MGROUND, SPACE = (0.60, 0.44, 0.30), (0.40, 0.19, 0.10), (0.012, 0.012, 0.02)
NAVY, ORANGE, SUIT, HAIR = (0.045, 0.09, 0.26), (0.72, 0.24, 0.045), (0.70, 0.70, 0.68), (0.045, 0.035, 0.03)
SKIN = ((0.56, 0.36, 0.25), (0.26, 0.15, 0.09), (0.62, 0.46, 0.35), (0.40, 0.25, 0.16), (0.50, 0.31, 0.20), (0.33, 0.20, 0.12))


def _person(out, x, y, h, suit, skin, hair=HAIR, visor=None, wide=0.34):
    """Blocks for one figure standing on (x, y), h tall, in picture coordinates (0..1 both ways)."""
    w = h * wide
    out.append(('r', x - w / 2, y, x + w / 2, y + h * 0.70, suit))
    out.append(('r', x - w * 0.36, y + h * 0.72, x + w * 0.36, y + h * 0.96, visor or skin))
    if visor is None:
        out.append(('r', x - w * 0.40, y + h * 0.90, x + w * 0.40, y + h * 1.0, hair))
    else:
        out.append(('r', x - w * 0.50, y + h * 0.94, x + w * 0.50, y + h * 1.02, suit))


def _pictures():
    """Twelve prints: (width, height, blocks). Blocks are ('r', x0, y0, x1, y1, colour) or
    ('c', x, y, rx, ry, colour) in picture coordinates, in the order they are painted."""
    P = []
    # 0  the whole crew in flight suits in front of the vehicle building (the big one)
    b = [('r', 0, 0.34, 1, 1, SKY), ('r', 0, 0, 1, 0.34, GRASS), ('r', 0.60, 0.34, 0.97, 0.90, (0.66, 0.66, 0.64)),
         ('r', 0.74, 0.34, 0.84, 0.72, NAVY)]
    for i in range(6):
        _person(b, 0.105 + i * 0.135, 0.10 + 0.03 * (i % 2), 0.50 + 0.04 * ((i * 7) % 3), (0.07, 0.16, 0.40) if i != 2 else ORANGE, SKIN[i], wide=0.22)
    P.append((0.267, 0.176, b))
    # 1  two of them on the surface: butterscotch sky, suits, gold visors
    b = [('r', 0, 0.42, 1, 1, MSKY), ('r', 0, 0, 1, 0.42, MGROUND)]
    _person(b, 0.36, 0.08, 0.72, SUIT, None, visor=(0.72, 0.46, 0.10))
    _person(b, 0.66, 0.10, 0.66, SUIT, None, visor=(0.72, 0.46, 0.10))
    b.append(('r', 0.28, 0.42, 0.44, 0.50, ORANGE))
    P.append((0.195, 0.13, b))
    # 2  a portrait: head and shoulders
    b = [('r', 0, 0, 1, 1, (0.30, 0.33, 0.38)), ('r', 0.14, 0, 0.86, 0.40, ORANGE), ('r', 0.32, 0.38, 0.68, 0.80, SKIN[2]),
         ('r', 0.28, 0.72, 0.72, 0.90, HAIR), ('r', 0.40, 0.30, 0.60, 0.40, SKIN[2])]
    P.append((0.13, 0.195, b))
    # 3  Earth from the ship
    b = [('r', 0, 0, 1, 1, SPACE), ('c', 0.56, 0.44, 0.30, 0.30, (0.07, 0.22, 0.58)), ('r', 0.40, 0.52, 0.66, 0.60, (0.70, 0.72, 0.74)),
         ('r', 0.52, 0.30, 0.74, 0.37, (0.70, 0.72, 0.74))]
    P.append((0.195, 0.13, b))
    # 4  the launch: a white stack on a column of fire at dusk
    b = [('r', 0, 0.22, 1, 1, (0.08, 0.12, 0.30)), ('r', 0, 0, 1, 0.22, (0.03, 0.04, 0.05)), ('r', 0.44, 0.40, 0.56, 0.88, (0.74, 0.74, 0.72)),
         ('r', 0.40, 0.14, 0.60, 0.40, (0.75, 0.42, 0.06)), ('r', 0.46, 0.88, 0.54, 0.95, ORANGE), ('r', 0.26, 0.10, 0.74, 0.20, (0.60, 0.56, 0.50))]
    P.append((0.13, 0.195, b))
    # 5  a beach, two small figures and the sun
    b = [('r', 0, 0.55, 1, 1, SKY), ('r', 0, 0.34, 1, 0.55, SEA), ('r', 0, 0, 1, 0.34, SAND), ('c', 0.80, 0.82, 0.07, 0.10, (0.75, 0.66, 0.30))]
    _person(b, 0.34, 0.12, 0.46, (0.62, 0.10, 0.08), SKIN[0])
    _person(b, 0.50, 0.12, 0.30, (0.70, 0.62, 0.12), SKIN[0], hair=(0.30, 0.18, 0.06))
    P.append((0.195, 0.13, b))
    # 6  the six round the galley table of the ship
    b = [('r', 0, 0, 1, 1, (0.52, 0.52, 0.50)), ('r', 0.10, 0.18, 0.90, 0.40, (0.70, 0.70, 0.68))]
    for i in range(6):
        b.append(('r', 0.11 + i * 0.14, 0.42, 0.22 + i * 0.14, 0.62, (NAVY, ORANGE, (0.36, 0.38, 0.40))[i % 3]))
        b.append(('r', 0.125 + i * 0.14, 0.63, 0.205 + i * 0.14, 0.80, SKIN[i]))
    P.append((0.195, 0.13, b))
    # 7  a dog on a lawn
    b = [('r', 0, 0.60, 1, 1, SKY), ('r', 0, 0, 1, 0.60, GRASS), ('r', 0.30, 0.22, 0.66, 0.44, (0.42, 0.26, 0.10)),
         ('r', 0.60, 0.38, 0.78, 0.58, (0.42, 0.26, 0.10)), ('r', 0.32, 0.10, 0.38, 0.24, (0.42, 0.26, 0.10)), ('r', 0.56, 0.10, 0.62, 0.24, (0.42, 0.26, 0.10)),
         ('r', 0.24, 0.40, 0.31, 0.52, (0.42, 0.26, 0.10))]
    P.append((0.195, 0.13, b))
    # 8  the Hab from outside: a white dome on red ground
    b = [('r', 0, 0.40, 1, 1, MSKY), ('r', 0, 0, 1, 0.40, MGROUND), ('c', 0.46, 0.40, 0.30, 0.34, (0.72, 0.70, 0.64)),
         ('r', 0, 0.05, 1, 0.40, MGROUND), ('r', 0.70, 0.40, 0.90, 0.56, (0.70, 0.68, 0.62))]
    P.append((0.195, 0.13, b))
    # 9  a child's drawing: a rocket, a sun, a stick of grass
    b = [('r', 0, 0, 1, 1, (0.74, 0.73, 0.68)), ('r', 0.40, 0.26, 0.56, 0.66, (0.62, 0.08, 0.06)), ('r', 0.44, 0.66, 0.52, 0.80, (0.10, 0.20, 0.60)),
         ('c', 0.80, 0.80, 0.09, 0.07, (0.75, 0.62, 0.08)), ('r', 0.06, 0.08, 0.94, 0.14, (0.12, 0.42, 0.10)), ('r', 0.34, 0.20, 0.40, 0.34, (0.75, 0.42, 0.06)),
         ('r', 0.56, 0.20, 0.62, 0.34, (0.75, 0.42, 0.06))]
    P.append((0.13, 0.195, b))
    # 10 sunset from the ridge: the blue glow round a small sun
    b = [('r', 0, 0.36, 1, 1, (0.46, 0.38, 0.32)), ('r', 0, 0, 1, 0.36, (0.13, 0.07, 0.045)), ('c', 0.40, 0.46, 0.20, 0.20, (0.36, 0.46, 0.62)),
         ('c', 0.40, 0.46, 0.06, 0.08, (0.74, 0.74, 0.72)), ('r', 0, 0.05, 1, 0.36, (0.13, 0.07, 0.045))]
    P.append((0.195, 0.13, b))
    # 11 one of the crew in the rover's cab, thumb up
    b = [('r', 0, 0, 1, 1, (0.16, 0.17, 0.19)), ('r', 0.08, 0.50, 0.92, 0.92, MSKY), ('r', 0.30, 0, 0.70, 0.46, SUIT), ('r', 0.38, 0.44, 0.62, 0.78, SKIN[4]),
         ('r', 0.36, 0.72, 0.64, 0.84, (0.28, 0.14, 0.05)), ('r', 0.74, 0.20, 0.84, 0.44, SKIN[4]), ('r', 0.30, 0.30, 0.70, 0.36, ORANGE)]
    P.append((0.13, 0.195, b))
    return P


def build_photos(root):
    """A dozen prints and a mission patch taped to the liner behind the foot of the bunk, in three
    loose rows either side of the liner's seam at 1.56 m. Each print is a flat sheet laid on the
    quilting where it bulges least under it; paper, picture blocks and tape are layers 0.9 mm
    apart (four steps of the file's position grid), and the free half of every piece of tape comes
    down onto the wall. Every colour is a tint of one material."""
    deg0, zmid = PLACES['photos_deg'], 1.72
    c0, _ = wall_at(deg0, zmid)
    node = comfort(root, 'photos', c0)
    K = kit(node, 'photos')
    paper = tint('plastic_white', (1.0, 0.99, 0.95))
    tape = col('plastic_white', (0.46, 0.47, 0.49))
    BASE, LAYER = 0.0035, 0.0009

    def layers(blocks):
        """Painter's layers: a block lies one layer above whatever it overlaps among those before it."""
        seen, out = [], []
        for b in blocks:
            bx = (b[1], b[2], b[3], b[4]) if b[0] == 'r' else (b[1] - b[3], b[2] - b[4], b[1] + b[3], b[2] + b[4])
            lay = 1 + max((l_ for q, l_ in seen if q[0] < bx[2] - 1e-6 and bx[0] < q[2] - 1e-6 and q[1] < bx[3] - 1e-6 and bx[1] < q[3] - 1e-6), default=0)
            seen.append((bx, lay))
            out.append(lay)
        return out

    def on_wall(s, z, w, h, roll):
        """Frame of a flat sheet w x h on the liner: x to the viewer's right, y up, z out of the
        wall. The sheet takes the mean slope of the liner under it and clears its highest point."""
        deg = deg0 - math.degrees(s / hab.A_IN)
        p, nrm = wall_at(deg, z)
        x = Vector((sin(rad(deg)), -cos(rad(deg)), 0.0))
        x = (x - nrm * x.dot(nrm)).normalized()
        M = Matrix((x, nrm.cross(x), nrm)).transposed().to_4x4()
        M.translation = p
        M = M @ R('Z', roll)

        def hit(px, py):
            q = M @ Vector((px, py, 0.0))
            loc, _, _, _ = liner_tree().ray_cast(q + nrm * 0.3, -nrm, 1.0)
            return loc
        c = [hit(sx * w / 2, sy * h / 2) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        n2 = (c[2] - c[0]).cross(c[3] - c[1]).normalized()
        if n2.dot(nrm) < 0:
            n2 = -n2
        x2 = (c[1] - c[0] + c[2] - c[3]).normalized()
        x2 = (x2 - n2 * x2.dot(n2)).normalized()
        M2 = Matrix((x2, n2.cross(x2), n2)).transposed().to_4x4()
        samples = [hit(i * w / 4, j * h / 4) for i in (-2, -1, 0, 1, 2) for j in (-2, -1, 0, 1, 2)]
        M2.translation = p + n2 * (max((q - p).dot(n2) for q in samples) + BASE)
        return M2

    def rect_(m, M, x0, y0, x1, y1, layer, sm=30.0):
        z = LAYER * layer
        K.quad(m, (x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z), M, smooth=sm)

    def stuck(M, cx_, cy_, ang, ln, wd, top):
        """A piece of tape over layer `top`: from (cx, cy) on the sheet it runs ln/2 back onto the
        sheet and ln/2 out along `ang` (degrees), where it comes down onto the liner."""
        d = Vector((cos(rad(ang)), sin(rad(ang)), 0.0))
        w_ = Vector((-d.y, d.x, 0.0)) * (wd / 2)
        c = Vector((cx_, cy_, LAYER * (top + 1)))
        nrm = (M.to_3x3() @ Vector((0, 0, 1))).normalized()
        bm = K.bm(tape, 0.0, 44.0)
        row = []
        for along in (-ln / 2, 0.0, ln / 2):
            pair = []
            for side in (-1, 1):
                q = M @ (c + d * along + w_ * side)
                if along > 0:                       # the free end: down onto the wall
                    loc, _, _, _ = liner_tree().ray_cast(q + nrm * 0.3, -nrm, 1.0)
                    q = loc + nrm * 0.0016
                pair.append(bm.verts.new(q))
            row.append(pair)
        for k in range(2):
            bm.faces.new((row[k][0], row[k + 1][0], row[k + 1][1], row[k][1]))

    pics = _pictures()
    #        s (m, to the right)   z      roll   picture   tape style
    layout = [(-0.470, 2.000, 4.0, 1, 'c'), (-0.235, 2.010, -3.0, 3, 't'), (0.000, 2.000, 2.0, 8, 'c'), (0.235, 2.010, -5.0, 5, 't'), (0.470, 2.000, 3.0, 10, 'c'),
              (-0.505, 1.765, -4.0, 2, 't'), (-0.270, 1.770, 2.5, 0, 'c'), (-0.035, 1.765, -2.0, 4, 't'), (0.140, 1.762, 4.0, 11, 'c'),
              (-0.330, 1.405, 3.0, 6, 't'), (-0.100, 1.400, -4.0, 7, 'c'), (0.110, 1.405, 2.0, 9, 't')]
    rng = random.Random(3)
    for s_, z_, roll, pi_, style in layout:
        w, h, blocks = pics[pi_]
        M = on_wall(s_, z_, w, h, roll)
        rect_(paper, M, -w / 2, -h / 2, w / 2, h / 2, 0)
        bw, bh = w - 0.016, h - 0.016
        lay = layers(blocks)
        for blk, ly in zip(blocks, lay):
            m = col('plastic_white', blk[5])
            if blk[0] == 'r':
                rect_(m, M, -bw / 2 + bw * blk[1], -bh / 2 + bh * blk[2], -bw / 2 + bw * blk[3], -bh / 2 + bh * blk[4], ly, 30.0 + ly)
            else:
                bm = K.bm(m, 0.0, 30.0 + ly)
                cxx, cyy = -bw / 2 + bw * blk[1], -bh / 2 + bh * blk[2]
                bm.faces.new([bm.verts.new(M @ Vector((cxx + bw * blk[3] * cos(TAU * i / 10), cyy + bh * blk[4] * sin(TAU * i / 10), LAYER * ly))) for i in range(10)])
        top = max(lay)
        if style == 'c':                              # a piece across each corner
            for sx, sy in ((-1, 1), (1, 1), (-1, -1), (1, -1)):
                stuck(M, sx * (w / 2 - 0.004), sy * (h / 2 - 0.004), math.degrees(math.atan2(sy, sx)) + rng.uniform(-9, 9), 0.046, 0.019, top)
        else:                                         # one along the top edge, one along the bottom
            stuck(M, rng.uniform(-0.012, 0.012), h / 2 - 0.001, 90 + rng.uniform(-5, 5), 0.024, 0.066, top)
            stuck(M, rng.uniform(-0.02, 0.02), -h / 2 + 0.001, -90 + rng.uniform(-5, 5), 0.022, 0.052, top)
    # the mission patch: embroidered disc, orange border, the planet, a delta and three stars
    M = on_wall(0.335, 1.760, 0.13, 0.13, -8.0) @ S(1.28, 1.28, 1.0)
    K.prism(col('plastic_white', NAVY), circ(0.052, 14), 0.003, M, z0=0.0, cap_bottom=False, smooth=31.0)
    rim = K.bm(col('plastic_white', ORANGE), 0.0, 32.0)
    o_, i_ = circ(0.052, 14), circ(0.044, 14)
    for k in range(14):
        k2 = (k + 1) % 14
        rim.faces.new([rim.verts.new(M @ Vector((*q, 0.0042))) for q in (i_[k], o_[k], o_[k2], i_[k2])])
    disc = K.bm(col('plastic_white', (0.52, 0.13, 0.05)), 0.0, 33.0)
    disc.faces.new([disc.verts.new(M @ Vector((-0.010 + 0.021 * cos(TAU * k / 10), -0.008 + 0.021 * sin(TAU * k / 10), 0.0042))) for k in range(10)])
    K.poly(paper, [(-0.020, -0.022, 0.0054), (0.030, 0.024, 0.0054), (0.004, 0.012, 0.0054)], M, smooth=34.0)
    K.poly(paper, [(-0.020, -0.022, 0.0054), (0.016, -0.004, 0.0054), (0.030, 0.024, 0.0054)], M, smooth=34.0)
    for sx_, sy_ in ((-0.022, 0.022), (-0.006, 0.030), (0.022, -0.024)):
        K.quad(paper, (sx_ - 0.003, sy_ - 0.003, 0.0042), (sx_ + 0.003, sy_ - 0.003, 0.0042), (sx_ + 0.003, sy_ + 0.003, 0.0042), (sx_ - 0.003, sy_ + 0.003, 0.0042), M,
               smooth=35.0)
    Mp = on_wall(0.335, 1.760, 0.13, 0.13, -8.0)
    K.box(tape, (0.060, 0.022, 0.0016), (0.0, 0.066, 0.0042), Mp @ R('Z', 5))
    K.finish()
    return node


# ==============================================================================================
# 2. comfort_herbs  and  5. comfort_rocks   (both on gore WINDOW_GORE, the porthole wall)
# ==============================================================================================
def window_wall():
    """The wall frame of the porthole gore: x along the wall (toward gore 9), -y into the room,
    z the height above the ground plane. The porthole is at x = 0, z = hab.WIN_Z; its frame
    stands 0.175 m proud of this frame's origin plane (hab_interior_shell)."""
    return wall_frame(math.degrees(hab.gore_mid(WINDOW_GORE)))


def build_herbs(root):
    """Four improvised pots on a plank under the porthole. The plank rides on two flat-bar brackets
    whose legs go UP the wall (the hose reel is below), stayed with wire, and it stands off the
    wall so the herbs grow in front of the porthole's frame rather than through it."""
    W_ = window_wall()
    zt, yp = 1.40, -0.285                          # top of the plank; its centre line (0.285 m into the room)
    node = comfort(root, 'herbs', W_ @ Vector((0, yp, zt)))
    K = kit(node, 'herbs', W_)
    K.box(tint('plastic_white', 0.86), (0.88, 0.17, 0.018), (0, yp, zt - 0.009), bevel=0.003)
    K.box(col('plastic_white', (0.72, 0.24, 0.045)), (0.882, 0.004, 0.019), (0, yp - 0.086, zt - 0.009))
    for sx in (-0.39, 0.39):
        face = wall_bar(K, 'aluminium', W_, sx, zt - 0.03, zt + 0.24, 0.032, 0.008)
        y_w = face(zt - 0.0215) + 0.004
        K.box('aluminium', (0.032, y_w + 0.3825, 0.007), (sx, (y_w - 0.3825) / 2, zt - 0.0215))
        for bz in (zt + 0.03, zt + 0.19):
            K.bolt('steel', 0.008, 0.005, T(sx, face(bz), bz) @ R('X', 90))
        K.tube('steel', [(sx, face(zt + 0.232) - 0.002, zt + 0.232), (sx, yp - 0.075, zt - 0.012)], 0.0028, 3, caps=False)
    soil = col('suit_white', (0.075, 0.045, 0.028))
    top, back = 'herb_leaf', tint('herb_leaf', (0.50, 0.55, 0.48))
    rng = random.Random(21)

    # (a) the bottom of a drink bottle, cut off with a knife: chives
    x = -0.30
    M = T(x, yp, zt) @ R('Z', 15)
    bottle = col('plastic_white', (0.50, 0.66, 0.70))
    K.lathe(bottle, [(0.0, 0.006), (0.030, 0.0), (0.044, 0.008), (0.046, 0.030), (0.0435, 0.043), (0.046, 0.056), (0.046, 0.118), (0.0425, 0.118),
                     (0.0425, 0.098)], 9, M, smooth=50.0)
    K.lathe(soil, [(0.0425, 0.098), (0.0, 0.104)], 9, M)
    for i in range(11):
        a, r_ = rng.uniform(0, TAU), rng.uniform(0.004, 0.026)
        hgt = rng.uniform(0.13, 0.235)
        lean = rng.uniform(0.01, 0.045)
        p0 = Vector((x + r_ * cos(a), yp + r_ * sin(a), zt + 0.10))
        out = Vector((cos(a), sin(a) * 0.8 - 0.25, 0)).normalized()
        K.tube(tint('herb_leaf', (0.62, 0.80, 0.60) if i % 3 else (0.80, 0.92, 0.70)),
               [p0, p0 + out * lean * 0.35 + Vector((0, 0, hgt * 0.55)), p0 + out * lean + Vector((0, 0, hgt))], 0.0042, 3, caps=False, radii=[1.0, 0.85, 0.12])

    # (b) a ration tin with half its label: basil
    x = -0.10
    M = T(x, yp, zt) @ R('Z', -8)
    K.prism('steel', rrect(0.112, 0.078, 0.018, 2), 0.056, M, z0=0.0, cap_bottom=False, smooth=40.0)
    K.prism('steel', rrect(0.118, 0.084, 0.02, 2), 0.004, M, z0=0.053, cap_bottom=False, smooth=40.0)
    K.poly(soil, [(px, py, 0.0585) for px, py in rrect(0.10, 0.066, 0.014, 2)], M, smooth=20.0)
    K.quad(col('plastic_white', (0.72, 0.24, 0.045)), (-0.036, -0.0398, 0.008), (0.036, -0.0398, 0.008), (0.036, -0.0398, 0.044), (-0.030, -0.0398, 0.044), M, smooth=21.0)
    K.quad(tint('plastic_white', 0.95), (-0.020, -0.0412, 0.020), (0.026, -0.0412, 0.020), (0.026, -0.0412, 0.033), (-0.020, -0.0412, 0.033), M, smooth=22.0)
    for i, (ox, oy, hgt) in enumerate(((-0.022, 0.006, 0.105), (0.020, -0.008, 0.135), (0.004, 0.014, 0.085))):
        p0 = Vector((x + ox, yp + oy, zt + 0.057))
        p1 = p0 + Vector((ox * 0.5, oy * 0.5 - 0.008, hgt))
        K.tube(tint('herb_leaf', (0.55, 0.75, 0.45)), [p0, p1], 0.0032, 3, caps=False)
        for lvl, (f, ln) in enumerate(((0.45, 0.058), (0.78, 0.050), (1.0, 0.034))):
            c = p0.lerp(p1, f)
            a0 = rng.uniform(0, TAU) if lvl == 0 else a0 + pi / 2
            for a in (a0, a0 + pi):
                d = Vector((cos(a), sin(a), 0.32 if lvl < 2 else 0.8))
                leaf(K, top, back, c, d, (0, 0, 1), ln, ln * 0.70, cup=0.22)

    # (c) a sample canister with its orange band: thyme, trailing over the rim
    x = 0.10
    M = T(x, yp, zt)
    K.lathe('aluminium', [(0.0, 0.0), (0.036, 0.0), (0.040, 0.006), (0.040, 0.088), (0.0435, 0.088), (0.0435, 0.101), (0.0375, 0.101), (0.0375, 0.086)], 9, M, smooth=40.0)
    K.lathe(col('plastic_white', (0.72, 0.24, 0.045)), [(0.0408, 0.026), (0.0408, 0.048)], 9, M, smooth=60.0)
    K.lathe(soil, [(0.0375, 0.086), (0.0, 0.092)], 9, M)
    tl, tb = tint('herb_leaf', (0.62, 0.72, 0.62)), tint('herb_leaf', (0.34, 0.40, 0.34))
    for i in range(6):
        a = -pi / 2 + (i - 2.5) * 0.62 + rng.uniform(-0.15, 0.15)
        reach, drop = rng.uniform(0.06, 0.10), rng.uniform(0.02, 0.085)
        o = Vector((cos(a), sin(a), 0))
        c = Vector((x, yp, zt + 0.09))
        pts = [c + o * 0.012, c + o * 0.045 + Vector((0, 0, 0.028)), c + o * (0.045 + reach * 0.55) + Vector((0, 0, 0.012 - drop * 0.35)),
               c + o * (0.045 + reach) + Vector((0, 0, -drop))]
        K.tube(tint('herb_leaf', (0.42, 0.40, 0.26)), pts, 0.0022, 3, caps=False)
        for k in range(1, 8):
            f = k / 7.5
            seg = min(2, int(f * 3))
            q = pts[seg].lerp(pts[seg + 1], f * 3 - seg)
            side = Vector((-o.y, o.x, 0))
            for sgn in (-1, 1):
                leaf(K, tl, tb, q, side * sgn + Vector((0, 0, 0.5)) + o * 0.3, (0, 0, 1) if k % 2 else o, 0.021, 0.014, cup=0.15)

    # (d) a taller bottle, green: mint
    x = 0.30
    M = T(x, yp, zt) @ R('Z', 40)
    K.lathe(col('plastic_white', (0.30, 0.56, 0.36)), [(0.0, 0.006), (0.028, 0.0), (0.039, 0.008), (0.041, 0.035), (0.039, 0.050), (0.041, 0.066), (0.041, 0.150),
                                                       (0.0375, 0.150), (0.0375, 0.128)], 9, M, smooth=50.0)
    K.lathe(soil, [(0.0375, 0.128), (0.0, 0.134)], 9, M)
    ml, mb_ = tint('herb_leaf', (0.72, 0.90, 0.66)), tint('herb_leaf', (0.40, 0.50, 0.38))
    for i, (ox, oy, hgt) in enumerate(((-0.014, 0.004, 0.19), (0.016, 0.006, 0.15), (0.0, -0.014, 0.23), (0.006, 0.016, 0.11))):
        p0 = Vector((x + ox, yp + oy, zt + 0.132))
        p1 = p0 + Vector((ox * 1.6, oy * 1.2 - 0.012, hgt * 0.55))
        p2 = p0 + Vector((ox * 2.6, oy * 1.6 - 0.03, hgt))
        K.tube(tint('herb_leaf', (0.45, 0.62, 0.40)), [p0, p1, p2], 0.003, 3, caps=False)
        a0 = rng.uniform(0, TAU)
        for k in range(1, 5):
            f = k / 4.0
            c = (p0.lerp(p1, f * 2) if f <= 0.5 else p1.lerp(p2, f * 2 - 1))
            a0 += pi / 2
            ln = 0.045 * (1.0 - 0.45 * f)
            for a in (a0, a0 + pi):
                leaf(K, ml, mb_, c, Vector((cos(a), sin(a), 0.25 + 0.5 * f)), (0, 0, 1), ln, ln * 0.55, cup=0.2)
    K.finish()
    return node


def build_rocks(root):
    """Specimen shelf beside the porthole: two boards on flat-bar standards and gussets, a lip
    along each with a label for every sample, eight samples on stands made of washers and lids.
    It has its own wall frame, centred on itself: the wall curves away from the porthole's."""
    off = 0.745                                      # centre of the bare wall between the porthole's frame and rib 10
    W_ = wall_frame(math.degrees(hab.gore_mid(WINDOW_GORE)) - math.degrees(math.asin(off / hab.A_IN)))
    hw, dep = 0.275, 0.15
    tiers = (1.250, 1.585)
    backs = [min(wall_y(W_, x, zt) for x in (-hw, 0.0, hw)) - 0.001 for zt in tiers]      # each board butts against the wall
    node = comfort(root, 'rocks', W_ @ Vector((0, backs[0], tiers[0])))
    K = kit(node, 'rocks', W_)
    board = col('plastic_white', (0.30, 0.31, 0.33))
    label = tint('plastic_white', (1.0, 0.98, 0.90))
    ink = col('plastic_white', (0.06, 0.06, 0.07))
    YZ = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))        # prism outline (y, z), extruded along +x
    for sx in (-hw + 0.03, hw - 0.03):
        face = wall_bar(K, 'aluminium', W_, sx, 1.10, 1.89)
        for bz in (1.12, 1.42, 1.87):
            K.bolt('steel', 0.007, 0.004, T(sx, face(bz), bz) @ R('X', 90))
        for zt, yb in zip(tiers, backs):
            g = min(yb, face(zt - 0.07)) - 0.001
            K.prism('aluminium', [(g, zt - 0.016), (g, zt - 0.125), (g - 0.122, zt - 0.016)], 0.005, T(sx - 0.0025, 0, 0) @ YZ, z0=0.0, smooth=20.0)
    for zt, yb in zip(tiers, backs):
        K.box(board, (2 * hw, dep, 0.016), (0, yb - dep / 2, zt - 0.008), bevel=0.002)
        K.box('aluminium', (2 * hw + 0.004, 0.004, 0.040), (0, yb - dep - 0.002, zt + 0.002))
    tier = {'yb': backs[0]}                          # the tier being dressed

    def stand(x, zt, kind='washer', r=0.028):
        yc = tier['yb'] - 0.074
        if kind == 'washer':
            K.prism('steel', circ(r, 8), 0.004, T(x, yc, zt), z0=0.0, cap_bottom=False, smooth=40.0)
            return zt + 0.004
        if kind == 'ring':
            K.torus('aluminium', r, 0.0055, 8, 4, T(x, yc, zt + 0.0055))
            return zt + 0.009
        K.lathe('aluminium', [(0.0, 0.0), (r, 0.0), (r + 0.005, 0.014), (r + 0.002, 0.014), (r - 0.001, 0.004), (0.0, 0.004)], 10, T(x, yc, zt), smooth=40.0)
        return zt + 0.004

    def tag(x, zt, wd=0.066):
        yf = tier['yb'] - dep - 0.0045
        K.quad(label, (x - wd / 2, yf, zt - 0.014), (x + wd / 2, yf, zt - 0.014), (x + wd / 2, yf, zt + 0.018), (x - wd / 2, yf, zt + 0.018), smooth=20.0)
        for zz, w2 in ((zt + 0.009, wd * 0.74), (zt - 0.003, wd * 0.5)):
            K.quad(ink, (x + wd * 0.40 - w2, yf - 0.0015, zz - 0.003), (x + wd * 0.40, yf - 0.0015, zz - 0.003),
                   (x + wd * 0.40, yf - 0.0015, zz + 0.003), (x + wd * 0.40 - w2, yf - 0.0015, zz + 0.003), smooth=21.0)

    stone = 'suit_white'

    def chunk(m, x, z, size, seed, n=11, spin=0.0):
        r2 = random.Random(seed)
        pts = []
        for _ in range(n):
            v = Vector((r2.uniform(-1, 1), r2.uniform(-1, 1), r2.uniform(-1, 1))).normalized() * r2.uniform(0.78, 1.0)
            pts.append((v.x * size[0] / 2, v.y * size[1] / 2, v.z * size[2] / 2))
        low = min(q[2] for q in pts)
        K.hull(m, pts, T(x, tier['yb'] - 0.074, z - low) @ R('Z', spin), smooth=20.0)

    xs = [-0.205, -0.068, 0.068, 0.205]
    # --- lower tier: dark basalt, a lid of grey spherules, a drill core, a chip of pale clay ---
    zt = tiers[0]
    yc = tier['yb'] - 0.074
    z = stand(xs[0], zt)
    chunk(col(stone, (0.060, 0.058, 0.062)), xs[0], z, (0.105, 0.080, 0.078), 3, n=14, spin=20)
    z = stand(xs[1], zt, 'dish', 0.043)
    for k in range(11):
        a_, r_ = k * 2.4, 0.008 + 0.0105 * (k % 3) + 0.004 * (k % 2)
        K.rock(col(stone, (0.19, 0.205, 0.27)), 0.0085 + 0.002 * (k % 2), (xs[1] + r_ * cos(a_), yc + r_ * sin(a_), z + 0.0075), seed=k, subdiv=1, rough=0.05,
               smooth=60.0)
    for sy in (-0.03, 0.03):                        # the core lies in two notched blocks
        K.prism('aluminium', [(-0.02, 0.0), (0.02, 0.0), (0.02, 0.018), (0.008, 0.008), (-0.008, 0.008), (-0.02, 0.018)], 0.009,
                T(xs[2], yc, zt) @ R('Z', 18) @ T(sy, 0.0045, 0) @ R('Z', 90) @ R('X', 90), smooth=20.0)
    Mc = T(xs[2], yc, zt + 0.027) @ R('Z', 18) @ R('Y', 90) @ T(0, 0, -0.052)
    bands = ((0.52, 0.34, 0.20), (0.66, 0.60, 0.48), (0.40, 0.21, 0.12), (0.62, 0.52, 0.38), (0.28, 0.16, 0.10))
    for k, c in enumerate(bands):
        prof = [(0.019, 0.0208 * k), (0.019, 0.0208 * (k + 1))]
        if k == 0:
            prof = [(0.0, 0.0)] + prof
        if k == len(bands) - 1:
            prof = prof + [(0.0, 0.0208 * (k + 1) + 0.003)]
        K.lathe(col(stone, c), prof, 8, Mc, smooth=50.0)
    z = stand(xs[3], zt)
    chunk(col(stone, (0.66, 0.59, 0.47)), xs[3], z, (0.112, 0.082, 0.040), 9, n=13, spin=-15)
    for x in xs:
        tag(x, zt)
    # --- upper tier: the iron meteorite, banded sulfate, gypsum blades, a green olivine basalt ---
    zt = tiers[1]
    tier['yb'] = backs[1]
    yc = tier['yb'] - 0.074
    z = stand(xs[0], zt, 'ring', 0.027)
    K.rock('steel', 0.046, (xs[0], yc, z + 0.031), seed=12, scale=(1.2, 0.92, 0.80), subdiv=2, rough=0.11, smooth=70.0)
    z = stand(xs[1], zt)
    tones = ((0.66, 0.56, 0.38), (0.74, 0.72, 0.66), (0.48, 0.31, 0.19), (0.72, 0.66, 0.52), (0.56, 0.40, 0.25), (0.74, 0.70, 0.60))
    Ms = T(xs[1], yc, z) @ R('Z', 25) @ R('Y', 8)
    for k, c in enumerate(tones):
        r2 = random.Random(40 + k)
        outline = [((0.052 - 0.004 * k) * cos(TAU * i / 7 + 0.3) * r2.uniform(0.82, 1.08), (0.037 - 0.002 * k) * sin(TAU * i / 7 + 0.3) * r2.uniform(0.82, 1.08))
                   for i in range(7)]
        K.prism(col(stone, c), outline, 0.0125, Ms, z0=0.012 * k, cap_bottom=False, smooth=20.0)
    z = stand(xs[2], zt)
    gyp = col('plastic_white', (0.74, 0.73, 0.68))
    for ang, tilt, ln in ((0, 8, 0.098), (130, 24, 0.076), (250, 30, 0.062), (60, 38, 0.052)):
        Mg = T(xs[2], yc, z) @ R('Z', ang) @ R('Y', tilt)
        K.lathe(gyp, [(0.0, 0.0), (0.014, 0.0), (0.0155, ln * 0.7), (0.0, ln)], 4, Mg @ S(1.0, 0.55, 1.0), smooth=20.0)
    z = stand(xs[3], zt)
    chunk(col('plastic_white', (0.17, 0.30, 0.09)), xs[3], z, (0.082, 0.068, 0.072), 17, n=11, spin=40)
    for x in xs:
        tag(x, zt)
    K.finish()
    return node


# ==============================================================================================
# 4. comfort_chair
# ==============================================================================================
def cloth_slab(K, grid, row_mats, inner_mat, t, smooth):
    """A sheet of thick cloth over grid[i][j] (outer side = di x dj): the outer face in bands of
    row_mats[i], an inner face t behind it and the cut edge between them in inner_mat."""
    ni, nj = len(grid), len(grid[0])
    nrm = []
    for i in range(ni):
        row = []
        for j in range(nj):
            di = grid[min(i + 1, ni - 1)][j] - grid[max(i - 1, 0)][j]
            dj = grid[i][min(j + 1, nj - 1)] - grid[i][max(j - 1, 0)]
            row.append(di.cross(dj).normalized())
        nrm.append(row)
    for i in range(ni - 1):
        sheet(K.bm(row_mats[i], 0.0, smooth), [grid[i], grid[i + 1]])
    inner = [[grid[i][j] - nrm[i][j] * t for j in range(nj)] for i in range(ni)]
    ib = K.bm(inner_mat, 0.0, smooth + 1.0)
    iv = [[ib.verts.new(q) for q in row] for row in inner]
    ov = [[ib.verts.new(q) for q in row] for row in grid]
    for i in range(ni - 1):
        for j in range(nj - 1):
            ib.faces.new((iv[i][j], iv[i][j + 1], iv[i + 1][j + 1], iv[i + 1][j]))
    border = [((i, 0), (i + 1, 0)) for i in range(ni - 1)] + [((i, nj - 1), (i + 1, nj - 1)) for i in range(ni - 1)] + \
             [((0, j), (0, j + 1)) for j in range(nj - 1)] + [((ni - 1, j), (ni - 1, j + 1)) for j in range(nj - 1)]
    for (a, b) in border:
        f = ib.faces.new((ov[a[0]][a[1]], ov[b[0]][b[1]], iv[b[0]][b[1]], iv[a[0]][a[1]]))
        f.normal_update()
        if a[0] == b[0]:                           # an edge of the first or last row: the sheet lies along i from it
            inward = grid[1][a[1]] - grid[0][a[1]] if a[0] == 0 else grid[ni - 2][a[1]] - grid[ni - 1][a[1]]
        else:                                      # an edge of the first or last column
            inward = grid[a[0]][1] - grid[a[0]][0] if a[1] == 0 else grid[a[0]][nj - 2] - grid[a[0]][nj - 1]
        if f.normal.dot(inward) > 0:               # the cut edge faces away from the sheet
            f.normal_flip()


def pillow(bm_top, bm_bot, M, w, h, t, n=4):
    """A stuffed square cushion in the local XY plane of M: two quilted faces meeting at a seam."""
    def pt(i, j, sgn):
        u, v = -1 + 2 * i / n, -1 + 2 * j / n
        puff = (1 - u ** 4) ** 0.6 * (1 - v ** 4) ** 0.6
        ear = 1.0 + 0.07 * abs(u * v) ** 2
        return M @ Vector((u * w / 2 * ear, v * h / 2 * ear, sgn * t / 2 * puff))
    sheet(bm_top, [[pt(i, j, 1) for j in range(n + 1)] for i in range(n + 1)])
    sheet(bm_bot, [[pt(i, j, -1) for j in range(n + 1)] for i in range(n + 1)], flip=True)


def build_chair(root):
    """A spare rover seat (vehicles.py's proportions) on a frame welded from tube: sled runners,
    a seat rail, back posts and arm loops. A folded blanket over the right arm, a cushion in the
    seat, and a side crate with the tablet he reads from and a mug. It faces the porthole."""
    cx, cy = PLACES['chair']
    wx, wy = hab.pol(8.3, hab.gore_mid(WINDOW_GORE))[:2]
    face = math.degrees(math.atan2(wy - cy, wx - cx))
    node = comfort(root, 'chair', (cx, cy, FLOOR))
    Mc = T(cx, cy, FLOOR) @ R('Z', face + 90.0)             # local: the sitter looks along -y, his right hand is -x
    K = kit(node, 'chair', Mc)
    alu, r = 'aluminium', 0.015
    cloth = col('suit_white', (0.21, 0.20, 0.19))           # the seat's dark canvas
    cloth_b = col('suit_white', (0.33, 0.31, 0.28))
    YZ = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))

    def rail_z(y):
        return 0.375 + (y + 0.30) * (0.322 - 0.375) / 0.55

    # --- frame ------------------------------------------------------------------------------------
    for sx in (-0.29, 0.29):
        K.tube(alu, [(sx, 0.44, 0.018), (sx, -0.36, 0.018), (sx, -0.30, 0.375), (sx, 0.25, 0.322), (sx, 0.475, 0.87)], r, 6, round_r=0.075)
        K.tube(alu, [(sx, 0.262, 0.30), (sx, 0.40, 0.03)], r, 6, caps=False)
        for fy in (-0.335, 0.42):
            K.box('rubber', (0.05, 0.075, 0.024), (sx, fy, 0.004), bevel=0.006)
        # welded gussets at the front corner and behind the seat
        K.prism('steel', [(-0.325, 0.09), (-0.20, 0.035), (-0.31, 0.25)], 0.005, T(sx - 0.0025, 0, 0) @ YZ, z0=0.0, smooth=20.0)
        K.prism('steel', [(0.20, 0.31), (0.33, 0.26), (0.31, 0.44)], 0.005, T(sx - 0.0025, 0, 0) @ YZ, z0=0.0, smooth=20.0)
        # arm loop with a padded, taped rest
        ax = sx * 1.09
        K.tube(alu, [(ax, -0.20, rail_z(-0.20)), (ax, -0.235, 0.60), (ax, 0.20, 0.585), (ax, 0.355, 0.58)], 0.013, 6, round_r=0.06, caps=False)
        K.box(col('suit_white', (0.52, 0.48, 0.40)), (0.062, 0.33, 0.036), (ax, -0.02, 0.612), R('X', -2), bevel=0.012)
        for ty in (-0.14, 0.10):
            K.box(col('suit_white', (0.36, 0.37, 0.39)), (0.066, 0.034, 0.040), (ax, ty, 0.612), R('X', -2))
    for y, z in ((-0.20, rail_z(-0.20)), (0.20, rail_z(0.20)), (0.30, 0.018)):
        K.tube(alu, [(-0.29, y, z), (0.29, y, z)], r, 6, caps=False)
    K.tube(alu, [(-0.29, 0.468, 0.855), (0.29, 0.468, 0.855)], r, 6, caps=False)
    # --- the seat: slide rails from the rover, cushion with bolsters, reclined back, headrest -----------
    Ms = T(0, -0.03, 0.405) @ R('X', -5.5)
    for sx in (-0.16, 0.16):
        K.box('steel', (0.034, 0.47, 0.02), (sx, 0.0, -0.012), Ms)
        K.box('plastic_black', (0.05, 0.05, 0.03), (sx, -0.245, -0.012), Ms)
    K.box('plastic_black', (0.44, 0.48, 0.016), (0, 0, 0.006), Ms)
    K.box(cloth, (0.46, 0.50, 0.105), (0, 0, 0.062), Ms, bevel=0.03, bseg=2)
    K.box(cloth_b, (0.27, 0.34, 0.02), (0, -0.02, 0.108), Ms, bevel=0.008)
    for sx in (-0.205, 0.205):
        K.box(cloth, (0.075, 0.47, 0.07), (sx, 0, 0.115), Ms, bevel=0.025)
    Mb = Ms @ T(0, 0.235, 0.075) @ R('X', -17)
    K.box(cloth, (0.44, 0.10, 0.62), (0, 0, 0.31), Mb, bevel=0.03, bseg=2)
    K.box(cloth, (0.50, 0.075, 0.20), (0, -0.03, 0.14), Mb, bevel=0.025)
    K.box(cloth_b, (0.26, 0.02, 0.30), (0, -0.048, 0.42), Mb, bevel=0.008)
    K.box(cloth, (0.27, 0.09, 0.17), (0, -0.005, 0.735), Mb, bevel=0.03, bseg=2)
    K.box('plastic_black', (0.46, 0.022, 0.60), (0, 0.058, 0.31), Mb, bevel=0.008)
    # the back of the shell is what the room sees first: ribs, a stowage pocket with the seat's
    # checklist in it, the rover's part label, a lifting handle, four fixings
    for sx in (-0.15, 0.15):
        K.box('plastic_black', (0.035, 0.012, 0.50), (sx, 0.072, 0.31), Mb, bevel=0.004)
    K.box(cloth_b, (0.33, 0.028, 0.20), (0, 0.078, 0.17), Mb, bevel=0.01)
    K.box(cloth, (0.34, 0.012, 0.055), (0, 0.094, 0.255), Mb @ R('X', 8), bevel=0.004)
    K.box(tint('plastic_white', (0.95, 0.94, 0.88)), (0.15, 0.008, 0.10), (-0.06, 0.082, 0.305), Mb @ R('Y', 6))
    K.box(col('plastic_white', (0.72, 0.24, 0.045)), (0.13, 0.004, 0.045), (0.11, 0.0705, 0.47), Mb)
    K.box(tint('plastic_white', 0.92), (0.10, 0.005, 0.012), (0.11, 0.0715, 0.468), Mb)
    K.tube(alu, [(-0.07, 0.066, 0.555), (-0.07, 0.105, 0.565), (0.07, 0.105, 0.565), (0.07, 0.066, 0.555)], 0.007, 5, round_r=0.02, caps=False, M=Mb)
    for sx in (-0.2, 0.2):
        for sz in (0.05, 0.57):
            K.bolt('steel', 0.008, 0.004, Mb @ T(sx, 0.069, sz) @ R('X', -90))
    for sx in (-0.13, 0.13):                               # harness guides and the stub of a belt
        K.box(col('plastic_white', (0.72, 0.24, 0.045)), (0.06, 0.016, 0.03), (sx, -0.054, 0.57), Mb)
    K.box(col('plastic_white', (0.72, 0.24, 0.045)), (0.04, 0.008, 0.11), (0.235, -0.24, 0.07), Ms @ R('Y', 8))
    K.box('steel', (0.046, 0.014, 0.035), (0.235, -0.24, 0.005), Ms @ R('Y', 8))
    # --- a cushion in the seat, leaning on the back -----------------------------------------------------
    Mp = Ms @ T(0.035, 0.150, 0.262) @ R('Y', 7) @ R('X', 66)
    orange = col('suit_white', (0.74, 0.235, 0.045))
    pillow(K.bm(orange, 0.0, 60.0), K.bm(tint('suit_white', (0.95, 0.93, 0.88)), 0.0, 61.0), Mp, 0.33, 0.31, 0.12)
    # --- the blanket, folded and hung over the right arm: short inside, long outside ----------------------------
    ax = -0.29 * 1.09
    blue, cream = col('suit_white', (0.10, 0.20, 0.30)), col('suit_white', (0.66, 0.62, 0.52))
    sect = [(0.047, -0.115), (0.045, -0.055), (0.042, -0.005), (0.033, 0.022), (0.016, 0.034), (-0.004, 0.036), (-0.024, 0.032), (-0.040, 0.016),
            (-0.047, -0.030), (-0.050, -0.095), (-0.053, -0.165), (-0.055, -0.215), (-0.057, -0.255), (-0.058, -0.300), (-0.059, -0.335)]
    tones = [cream, blue, blue, blue, blue, blue, blue, blue, blue, blue, cream, blue, cream, blue]
    ny = 10
    grid = []
    for (ox, oz) in sect:                          # (x off the arm's centre, z off its top), inside hem to outside hem
        row = []
        hangs = max(0.0, -oz) / 0.335
        for j in range(ny + 1):
            y = 0.20 - 0.40 * j / ny                # along -y, so that the cloth's outer side is di x dj
            fold = 0.016 * hangs * sin(TAU * y / 0.17 + 0.8) + 0.007 * hangs * sin(TAU * y / 0.075 + 2.0)
            edge_droop = 0.020 * hangs * (abs(y) / 0.20) ** 3
            row.append(Vector((ax + ox + (fold if ox < 0 else -fold * 0.4), y * (1.0 - 0.05 * hangs) + 0.006 * sin(oz * 40),
                               0.632 + oz - edge_droop - 0.010 * hangs * sin(TAU * y / 0.17 + 2.2))))
        grid.append(row)
    cloth_slab(K, grid, tones, col('suit_white', (0.07, 0.14, 0.21)), 0.013, 62.0)
    # --- side crate: tablet and mug ---------------------------------------------------------------------------
    Mk = T(-0.585, -0.02, 0.0) @ R('Z', -6)
    K.box(tint('plastic_white', 0.90), (0.40, 0.32, 0.25), (0, 0, 0.130), Mk, bevel=0.012)
    K.box(orange, (0.415, 0.335, 0.085), (0, 0, 0.305), Mk, bevel=0.012)
    K.box('plastic_black', (0.404, 0.324, 0.016), (0, 0, 0.258), Mk)
    for sx in (-0.11, 0.11):
        K.box('steel', (0.046, 0.014, 0.07), (sx, -0.168, 0.262), Mk)
    for sx in (-1, 1):
        K.box('plastic_black', (0.012, 0.12, 0.035), (sx * 0.2025, 0, 0.17), Mk)
    for sx in (-0.15, 0.15):
        for sy in (-0.11, 0.11):
            K.box('rubber', (0.05, 0.05, 0.012), (sx, sy, 0.002), Mk)
    top = 0.3475
    Mt = Mk @ T(-0.05, -0.035, top) @ R('Z', 14)
    K.box('plastic_black', (0.235, 0.165, 0.011), (0, 0, 0.0055), Mt, bevel=0.003)
    K.quad(tint('plastic_white', (0.98, 0.96, 0.88)), (-0.105, -0.07, 0.0125), (0.105, -0.07, 0.0125), (0.105, 0.07, 0.0125), (-0.105, 0.07, 0.0125), Mt, smooth=20.0)
    ink = col('plastic_white', (0.10, 0.10, 0.11))
    for k in range(7):
        ln = 0.18 if k not in (3, 6) else 0.10
        yy = 0.052 - k * 0.0165
        K.quad(ink, (-0.092, yy - 0.0035, 0.014), (-0.092 + ln, yy - 0.0035, 0.014), (-0.092 + ln, yy + 0.0035, 0.014), (-0.092, yy + 0.0035, 0.014), Mt, smooth=21.0)
    Mm = Mk @ T(0.125, 0.07, top)
    mugc = tint('plastic_white', (0.97, 0.97, 0.95))
    K.lathe(mugc, [(0.0, 0.0), (0.033, 0.0), (0.038, 0.012), (0.040, 0.095), (0.0355, 0.095), (0.034, 0.078)], 9, Mm, smooth=50.0)
    K.lathe(col('plastic_white', (0.10, 0.055, 0.03)), [(0.034, 0.078), (0.0, 0.078)], 9, Mm)
    K.lathe(col('plastic_white', (0.06, 0.15, 0.40)), [(0.0395, 0.040), (0.0405, 0.062)], 9, Mm, smooth=60.0)
    K.torus(mugc, 0.024, 0.0055, 8, 4, Mm @ T(0.044, 0, 0.05) @ R('X', 90), arc=pi, phase=-pi / 2)
    c = R('Z', face + 90.0) @ Vector((-0.21, 0.02, 0.0))
    anchor('col_chair', node, loc=(c.x, c.y, 0.0), radius=0.58)
    K.finish()
    return node


# ==============================================================================================
# 8. comfort_greg  and  9. comfort_chess   (both on the galley table, in the table's frame)
# ==============================================================================================
def build_greg(root):
    """Greg: a rounded rock with two dots and a line for a face and a washer-and-nut hat, on a
    folded cloth at the head of the table (its north-east end), looking down the table toward the
    middle of the room."""
    gx, gy = 0.628, 0.015
    Mg = TABLE @ T(gx, gy, TABLE_TOP) @ R('Z', 180 + 9)           # local: Greg looks along +x (down the table), z up from its top
    node = comfort(root, 'greg', Mg.translation)
    K = kit(node, 'greg', Mg)
    blue, cream = col('suit_white', (0.12, 0.22, 0.34)), col('suit_white', (0.66, 0.62, 0.52))
    K.box(blue, (0.17, 0.185, 0.005), (0, 0, 0.0025), R('Z', 5))
    K.box(blue, (0.085, 0.188, 0.005), (-0.040, 0.0, 0.0075), R('Z', 2))
    for oy in (-0.062, 0.062):
        K.box(cream, (0.172, 0.014, 0.0052), (0, oy, 0.0027), R('Z', 5))
    # the rock
    zc = 0.066
    rockm = col('suit_white', (0.36, 0.30, 0.245))
    bm = K.bm(rockm, 0.0, 65.0)
    vs = bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)['verts']
    for v in vs:
        d = v.co.normalized()
        k = 1.0 + 0.085 * noise3(d, 1.6, 3.0) + 0.035 * noise3(d, 4.3, 1.0)
        v.co = Vector((d.x * 0.066 * k, d.y * 0.078 * k, max(d.z * 0.060 * k, -0.050) + zc - 0.006))
    idx = {v: i for i, v in enumerate(vs)}
    faces = [f for f in bm.faces if all(v in idx for v in f.verts)]
    tree = BVHTree.FromPolygons([v.co.copy() for v in vs], [tuple(idx[v] for v in f.verts) for f in faces])
    ink = col('suit_white', (0.022, 0.022, 0.026))

    def on_rock(y, z):
        loc, nrm, _, _ = tree.ray_cast(Vector((0.3, y, z)), Vector((-1, 0, 0)), 1.0)
        return loc, nrm.normalized()

    for ey, er in ((-0.0245, 0.0105), (0.0235, 0.0096)):
        p, nrm = on_rock(ey, zc + 0.013)
        x = Vector((0, 0, 1)).cross(nrm).normalized()
        ngon(K.bm(ink, 0.0, 30.0), p + nrm * 0.0013, nrm, x, nrm.cross(x), er, 12)
    ib = K.bm(ink, 0.0, 30.0)
    pts = []
    for i in range(9):
        t = -1 + 2 * i / 8
        y = 0.030 * t + 0.001
        pts.append(on_rock(y, zc - 0.012 - 0.0085 * (1 - t * t) + 0.0025 * t))
    for i in range(8):
        (p0, n0), (p1, n1) = pts[i], pts[i + 1]
        tg = (p1 - p0).normalized()
        w0, w1 = n0.cross(tg).normalized() * 0.0031, n1.cross(tg).normalized() * 0.0031
        q = [p0 - w0 + n0 * 0.0013, p1 - w1 + n1 * 0.0013, p1 + w1 + n1 * 0.0013, p0 + w0 + n0 * 0.0013]
        f = ib.faces.new([ib.verts.new(c) for c in q])
        f.normal_update()
        if f.normal.dot(n0) < 0:
            f.normal_flip()
    # the hat: a big washer for a brim, a nut for a crown, tipped back
    loc, nrm, _, _ = tree.ray_cast(Vector((-0.004, 0.008, 0.4)), Vector((0, 0, -1)), 1.0)
    Mh = T(loc.x, loc.y, loc.z - 0.003) @ R('Y', -13) @ R('X', 8) @ R('Z', 20)
    K.prism('aluminium', circ(0.029, 10), 0.0035, Mh, z0=0.0, smooth=40.0)
    hexnut(K, 'steel', 0.0155, 0.014, Mh @ T(0, 0, 0.0035), hole=None)
    K.prism(tint('steel', 0.55), circ(0.0075, 6), 0.004, Mh @ T(0, 0, 0.0175), z0=0.0, cap_bottom=False, smooth=40.0)
    K.finish()
    return node


def build_chess(root):
    """Nuts against bolts on a square of sheet metal with the squares scratched in, mid-game, at
    the table's south-west end. Brass nuts and washers stack into the back rank of one side; the
    other side's pieces are black bolts standing on their heads."""
    bx, by = -0.425, 0.228
    Mb = TABLE @ T(bx, by, TABLE_TOP) @ R('Z', 7)
    node = comfort(root, 'chess', Mb.translation)
    K = kit(node, 'chess', Mb)
    sq, t = 0.0295, 0.0025
    half, edge = 4 * sq, 4 * sq + 0.013
    plate = tint('aluminium', 0.95)
    snip = 0.014
    K.prism(plate, [(-edge + snip, -edge), (edge - snip, -edge), (edge, -edge + snip), (edge, edge - snip), (edge - snip * 1.6, edge), (-edge + snip, edge),
                    (-edge, edge - snip), (-edge, -edge + snip)], t, None, z0=0.0, cap_bottom=False, smooth=20.0)
    dark = tint('aluminium', 0.22)
    db = K.bm(dark, 0.0, 21.0)
    for f in range(8):
        for r_ in range(8):
            if (f + r_) % 2 == 0:
                x0, y0 = -half + f * sq, -half + r_ * sq
                db.faces.new([db.verts.new(q) for q in ((x0 + 0.0012, y0 + 0.0012, t + 0.0015), (x0 + sq - 0.0012, y0 + 0.0012, t + 0.0015),
                                                        (x0 + sq - 0.0012, y0 + sq - 0.0012, t + 0.0015), (x0 + 0.0012, y0 + sq - 0.0012, t + 0.0015))])
    for a in range(4):                                     # the scratched border
        Mr = R('Z', 90 * a)
        K.quad(dark, (-half - 0.004, -half - 0.004, t + 0.0015), (half + 0.004, -half - 0.004, t + 0.0015), (half + 0.004, -half - 0.0015, t + 0.0015),
               (-half - 0.004, -half - 0.0015, t + 0.0015), Mr, smooth=21.0)
    brass = col('gold_foil', (0.72, 0.50, 0.15))
    brass_d = col('gold_foil', (0.30, 0.20, 0.06))
    black = tint('steel', 0.30)
    z0 = t + 0.0016

    def at(f, r_, dx=0.0, dy=0.0, spin=0.0):
        return T(-half + (f + 0.5) * sq + dx, -half + (r_ + 0.5) * sq + dy, z0) @ R('Z', spin)

    def stack(M, parts_, m, hole):
        z = 0.0
        for kind, rr, hh in parts_:
            Mz = M @ T(0, 0, z)
            if kind == 'n':
                hexnut(K, m, rr, hh, Mz @ R('Z', 17 * z * 1000), hole=None)
            elif kind == 'w':
                K.prism(m, circ(rr, 8), hh, Mz, z0=0.0, cap_bottom=False, smooth=40.0)
            elif kind == 's':                              # a shank
                K.prism(m, circ(rr, 6), hh, Mz, z0=0.0, cap_bottom=False, smooth=60.0)
            elif kind == 'e':                              # a nut standing on edge (the knight's head)
                K.prism(m, circ(rr, 6), hh, Mz @ T(0, hh / 2, rr * 0.87) @ R('X', 90), z0=0.0, smooth=38.0)
                if hole:
                    for sgn in (1, -1):                    # its bore, on both faces
                        K.poly(hole, [(sgn * 0.5 * rr * cos(TAU * i / 6), -sgn * (hh / 2 + 0.0008), rr * 0.87 + 0.5 * rr * sin(TAU * i / 6)) for i in range(6)], Mz,
                               smooth=22.0)
                z += rr * 1.74 - hh
            z += hh
        if hole and parts_[-1][0] == 'n':
            rr = parts_[-1][1]
            K.poly(hole, [(0.5 * rr * cos(TAU * i / 6 + 0.5), 0.5 * rr * sin(TAU * i / 6 + 0.5), z + 0.0009) for i in range(6)], M, smooth=22.0)

    NUT = {
        'p': [('n', 0.0082, 0.0065)],
        'r': [('n', 0.0105, 0.008), ('n', 0.0085, 0.007)],
        'n': [('n', 0.0095, 0.007), ('e', 0.0085, 0.0065)],
        'b': [('n', 0.0092, 0.007), ('n', 0.0074, 0.006), ('n', 0.0056, 0.005)],
        'q': [('w', 0.0122, 0.002), ('n', 0.0100, 0.008), ('n', 0.0084, 0.007), ('w', 0.0098, 0.0018), ('n', 0.0058, 0.005)],
        'k': [('w', 0.0126, 0.002), ('n', 0.0105, 0.008), ('n', 0.0090, 0.007), ('n', 0.0075, 0.006), ('w', 0.0090, 0.0018), ('s', 0.0030, 0.008)],
    }
    BOLT = {
        'p': [('n', 0.0080, 0.0050), ('s', 0.0036, 0.0105)],
        'r': [('n', 0.0108, 0.0065), ('s', 0.0064, 0.0125)],
        'n': [('n', 0.0092, 0.0055), ('s', 0.0040, 0.0100), ('e', 0.0078, 0.0060)],
        'b': [('n', 0.0086, 0.0055), ('s', 0.0033, 0.0250)],
        'q': [('n', 0.0104, 0.0065), ('s', 0.0046, 0.0220), ('w', 0.0095, 0.0018), ('s', 0.0046, 0.0050)],
        'k': [('n', 0.0110, 0.0070), ('s', 0.0050, 0.0250), ('n', 0.0082, 0.0060), ('s', 0.0030, 0.0040)],
    }
    bolts = [('k', 6, 0), ('r', 5, 0), ('r', 0, 0), ('q', 3, 1), ('b', 4, 2), ('n', 5, 2), ('p', 0, 1), ('p', 1, 1), ('p', 2, 3), ('p', 4, 3),
             ('p', 5, 1), ('p', 6, 1), ('p', 7, 2)]
    nuts = [('k', 6, 7), ('r', 5, 7), ('r', 0, 7), ('q', 2, 6), ('b', 4, 6), ('n', 5, 5), ('n', 2, 5), ('p', 0, 5), ('p', 1, 6), ('p', 3, 5),
            ('p', 4, 4), ('p', 6, 6), ('p', 7, 6)]
    rng = random.Random(2)
    for kind, f, r_ in bolts:
        stack(at(f, r_, rng.uniform(-0.003, 0.003), rng.uniform(-0.003, 0.003), rng.uniform(0, 60)), BOLT[kind], black, None)
    for kind, f, r_ in nuts:
        stack(at(f, r_, rng.uniform(-0.003, 0.003), rng.uniform(-0.003, 0.003), rng.uniform(0, 60)), NUT[kind], brass, brass_d)
    # taken pieces beside the board: two bolts on their sides, a little pile of nuts
    off = edge + 0.022
    for yy, kind, spin in ((-0.06, 'p', 30), (-0.025, 'b', 110)):
        M = T(off, yy, 0.0) @ R('Z', spin) @ T(0, 0, BOLT[kind][0][1]) @ R('Y', 90)
        stack(M, BOLT[kind], black, None)
    stack(T(-off, 0.05, 0.0), [('n', 0.0082, 0.0065), ('n', 0.0082, 0.0065)], brass, brass_d)
    stack(T(-off - 0.004, 0.075, 0.0) @ R('Z', 25), NUT['b'], brass, brass_d)
    K.finish()
    return node


# ==============================================================================================
# Build
# ==============================================================================================
def finish(root, name):
    collapse(root)
    parts = [o for o in root.children if o.name.startswith('comfort_')]
    if not FAST:
        for node in parts:
            stand_in = room_stand_in(node)
            bpy.context.view_layer.update()
            bake_ao(node, samples=32, distance=0.5, strength=0.8, floor=False)
            bpy.data.objects.remove(stand_in, do_unlink=True)
    apply_tints(root)
    rows = tally(root)
    info = export_model(root, name, ao=False, do_collapse=False, pack_args=('-vp', '16'))
    info['parts'] = rows
    return info


def build_hab_comforts():
    ensure_mats()
    root = part('hab_comforts')
    for fn in (build_lights, build_herbs, build_photos, build_chair, build_rocks, build_flag, build_rug, build_greg, build_chess):
        fn(root)
    return finish(root, 'hab_comforts')


BUILDERS = {'hab_comforts': build_hab_comforts}

if __name__ == '__main__':
    for name in [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS):
        reset_scene()
        BUILDERS[name]()
