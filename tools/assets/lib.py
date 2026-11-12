"""
Shared modelling helpers for Stranded II assets — Blender as a Python module (bpy 5.x), headless.

Conventions (see SPEC.md):
  * metres, Blender Z up, model FRONT faces -Y, origin on the ground under the model's centre
  * one "part" = one node in the exported file that the game may move (a wheel, a door, a bone)
  * everything else is modelled as many small helper objects and joined into its part on export
  * colour comes from flat PBR materials (PALETTE) times a baked per-vertex ambient-occlusion value
  * output: meshopt-compressed .glb in static/martian/assets/models/

Typical use:

    from lib import *
    reset_scene()
    root = part('crate')                                   # the model's root node
    bm = bm_new(); add_box(bm, (1, 1, 0.6), (0, 0, 0.3))
    mesh_obj('body', bm, 'painted_white', parent=root, bevel=0.02)
    export_model(root, 'crate')
"""
import json
import math
import os
import subprocess
import sys
import time

import bpy  # must be imported before bmesh/mathutils: the bpy wheel provides them
import bmesh  # noqa: E402
from mathutils import Euler, Matrix, Quaternion, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
REPO = os.path.dirname(TOOLS)
OUT_DIR = os.path.join(REPO, 'static', 'martian', 'assets', 'models')
RAW_DIR = os.path.join(HERE, '.cache', 'raw')          # uncompressed exports (not committed)

TAU = math.tau
rad = math.radians


# ----------------------------------------------------------------------------------------------
# Scene
# ----------------------------------------------------------------------------------------------
def reset_scene():
    """Start from an empty file. Call once at the top of every asset script."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATERIALS.clear()


def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


# ----------------------------------------------------------------------------------------------
# Materials — one shared palette so every asset reads as the same world.
# (base colour is linear RGB, 0..1)   metallic, roughness, emissive colour, emissive strength, alpha
# ----------------------------------------------------------------------------------------------
PALETTE = {
    # fabrics and soft goods
    'suit_white':     ((0.78, 0.76, 0.72), 0.0, 0.85),
    'suit_orange':    ((0.80, 0.26, 0.05), 0.0, 0.80),
    'suit_grey':      ((0.20, 0.21, 0.23), 0.0, 0.75),
    'canvas':         ((0.72, 0.68, 0.60), 0.0, 0.90),   # Hab skin, tarps
    'canvas_dark':    ((0.36, 0.33, 0.29), 0.0, 0.90),
    'rubber':         ((0.035, 0.035, 0.04), 0.0, 0.92),
    'foam':           ((0.55, 0.52, 0.45), 0.0, 0.95),
    # paints and structure
    'painted_white':  ((0.80, 0.80, 0.78), 0.1, 0.55),
    'painted_grey':   ((0.32, 0.34, 0.36), 0.2, 0.55),
    'painted_dark':   ((0.07, 0.075, 0.08), 0.3, 0.50),
    'painted_orange': ((0.85, 0.30, 0.04), 0.1, 0.50),
    'painted_yellow': ((0.85, 0.62, 0.05), 0.1, 0.50),
    'painted_red':    ((0.62, 0.05, 0.03), 0.1, 0.50),
    'painted_blue':   ((0.06, 0.16, 0.42), 0.1, 0.50),
    'aluminium':      ((0.77, 0.78, 0.80), 1.0, 0.38),
    'steel':          ((0.42, 0.43, 0.45), 1.0, 0.45),
    'titanium':       ((0.33, 0.31, 0.29), 1.0, 0.50),
    'gold_foil':      ((0.95, 0.60, 0.16), 1.0, 0.32),   # multi-layer insulation
    'copper':         ((0.80, 0.36, 0.20), 1.0, 0.40),
    'carbon':         ((0.02, 0.02, 0.022), 0.4, 0.42),
    'plastic_black':  ((0.03, 0.03, 0.03), 0.0, 0.50),
    'plastic_white':  ((0.75, 0.75, 0.73), 0.0, 0.45),
    # glass and optics
    'solar_cell':     ((0.015, 0.03, 0.10), 0.85, 0.22),
    'glass_dark':     ((0.02, 0.03, 0.04), 0.9, 0.08),   # opaque dark glazing (cheap, reads as glass)
    'visor_gold':     ((0.95, 0.55, 0.12), 1.0, 0.10),
    'glass_clear':    ((0.70, 0.85, 0.90), 0.0, 0.05, None, 0.0, 0.28),  # alpha-blended
    'lens':           ((0.01, 0.01, 0.015), 0.9, 0.05),
    # nature
    'soil':           ((0.10, 0.055, 0.03), 0.0, 1.0),
    'regolith':       ((0.42, 0.20, 0.10), 0.0, 1.0),
    'leaf':           ((0.08, 0.30, 0.05), 0.0, 0.65),
    'stem':           ((0.14, 0.32, 0.08), 0.0, 0.70),
    'potato':         ((0.45, 0.33, 0.18), 0.0, 0.85),
    'ice':            ((0.75, 0.88, 0.95), 0.0, 0.25),
    # lights (emissive; the game drives intensity by material name)
    'light_white':    ((1.0, 0.95, 0.85), 0.0, 0.4, (1.0, 0.92, 0.78), 4.0),
    'light_green':    ((0.1, 1.0, 0.3), 0.0, 0.4, (0.1, 1.0, 0.3), 4.0),
    'light_red':      ((1.0, 0.12, 0.05), 0.0, 0.4, (1.0, 0.12, 0.05), 4.0),
    'light_amber':    ((1.0, 0.55, 0.1), 0.0, 0.4, (1.0, 0.55, 0.1), 4.0),
    'light_blue':     ((0.2, 0.55, 1.0), 0.0, 0.4, (0.2, 0.55, 1.0), 4.0),
    'screen':         ((0.02, 0.04, 0.07), 0.0, 0.25, (0.12, 0.30, 0.55), 1.5),
    'flame':          ((1.0, 0.6, 0.2), 0.0, 1.0, (1.0, 0.45, 0.1), 12.0),
}
_MATERIALS = {}


def mat(name, **override):
    """Fetch (or create) a palette material. `mat('x', color=(r,g,b), metallic=, roughness=,
    emissive=, strength=, alpha=)` defines a new one-off material named x."""
    if name in _MATERIALS and not override:
        return _MATERIALS[name]
    spec = list(PALETTE.get(name, ((0.5, 0.5, 0.5), 0.0, 0.6)))
    spec += [None, 0.0, 1.0][len(spec) - 3:] if len(spec) < 6 else []
    color, metallic, roughness, emissive, strength, alpha = spec
    color = override.get('color', color)
    metallic = override.get('metallic', metallic)
    roughness = override.get('roughness', roughness)
    emissive = override.get('emissive', emissive)
    strength = override.get('strength', strength)
    alpha = override.get('alpha', alpha)
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    bsdf = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emissive:
        bsdf.inputs['Emission Color'].default_value = (*emissive, 1.0)
        bsdf.inputs['Emission Strength'].default_value = strength
    if alpha < 1.0:
        bsdf.inputs['Alpha'].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except Exception:
            pass
        try:
            m.blend_method = 'BLEND'
        except Exception:
            pass
    m.diffuse_color = (*color, alpha)
    _MATERIALS[name] = m
    return m


# ----------------------------------------------------------------------------------------------
# bmesh primitives. Each returns the list of new verts so you can transform them further.
# ----------------------------------------------------------------------------------------------
def bm_new():
    return bmesh.new()


def _axis_matrix(axis):
    if axis == 'X':
        return Matrix.Rotation(math.pi / 2, 4, 'Y')
    if axis == 'Y':
        return Matrix.Rotation(-math.pi / 2, 4, 'X')
    return Matrix.Identity(4)


def _place(bm, verts, loc=(0, 0, 0), rot=None, scale=None, pre=None):
    m = Matrix.Identity(4)
    if scale is not None:
        m = Matrix.Diagonal((*scale, 1.0)) @ m
    if pre is not None:
        m = pre @ m
    if rot is not None:
        m = Euler(rot, 'XYZ').to_matrix().to_4x4() @ m
    m = Matrix.Translation(loc) @ m
    bmesh.ops.transform(bm, matrix=m, verts=verts)
    return verts


def xform(bm, verts, loc=(0, 0, 0), rot=None, scale=None):
    """Move/rotate/scale a set of verts (rot is XYZ Euler radians)."""
    return _place(bm, verts, loc, rot, scale)


def add_box(bm, size=(1, 1, 1), loc=(0, 0, 0), rot=None):
    v = bmesh.ops.create_cube(bm, size=1.0)['verts']
    return _place(bm, v, loc, rot, size)


def add_cyl(bm, r=0.5, depth=1.0, loc=(0, 0, 0), seg=24, axis='Z', r2=None, caps=True, rot=None):
    """Cylinder or cone frustum (r at the -axis end, r2 at the +axis end), centred on loc."""
    v = bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=seg,
                              radius1=r, radius2=r if r2 is None else r2, depth=depth)['verts']
    return _place(bm, v, loc, rot, None, _axis_matrix(axis))


def add_sphere(bm, r=0.5, loc=(0, 0, 0), seg=24, rings=12, scale=(1, 1, 1), rot=None):
    v = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)['verts']
    return _place(bm, v, loc, rot, scale)


def add_ico(bm, r=0.5, loc=(0, 0, 0), subdiv=2, scale=(1, 1, 1), rot=None):
    v = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=r)['verts']
    return _place(bm, v, loc, rot, scale)


def add_torus(bm, R=1.0, r=0.1, loc=(0, 0, 0), seg=32, ring_seg=10, axis='Z', rot=None, arc=TAU):
    """Torus of major radius R, tube radius r. `arc` < tau gives an open elbow."""
    closed = abs(arc - TAU) < 1e-6
    n = seg if closed else seg + 1
    rings = []
    for i in range(n):
        a = arc * i / seg
        ring = []
        for j in range(ring_seg):
            b = TAU * j / ring_seg
            ring.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a),
                                      (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        rings.append(ring)
    for i in range(seg):
        a, b = rings[i], rings[(i + 1) % n]
        for j in range(ring_seg):
            bm.faces.new((a[j], b[j], b[(j + 1) % ring_seg], a[(j + 1) % ring_seg]))
    if not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    verts = [v for ring in rings for v in ring]
    return _place(bm, verts, loc, rot, None, _axis_matrix(axis))


def add_lathe(bm, profile, seg=32, loc=(0, 0, 0), axis='Z', rot=None, cap_start=True, cap_end=True,
              arc=TAU):
    """Revolve a profile [(radius, height), ...] around the axis. Radius 0 points close the shape."""
    closed = abs(arc - TAU) < 1e-6
    n = seg if closed else seg + 1
    cols = []
    for i in range(n):
        a = arc * i / seg
        cols.append([None if r <= 1e-9 else bm.verts.new((r * math.cos(a), r * math.sin(a), z))
                     for r, z in profile])
    poles = [bm.verts.new((0, 0, z)) if r <= 1e-9 else None for r, z in profile]
    verts = [v for c in cols for v in c if v] + [p for p in poles if p]
    for i in range(seg):
        a, b = cols[i], cols[(i + 1) % n]
        for k in range(len(profile) - 1):
            quad = [a[k] or poles[k], b[k] or poles[k], b[k + 1] or poles[k + 1], a[k + 1] or poles[k + 1]]
            uniq = []
            for v in quad:
                if v not in uniq:
                    uniq.append(v)
            if len(uniq) >= 3:
                bm.faces.new(uniq)
    if closed:
        if cap_start and profile[0][0] > 1e-9:
            bm.faces.new([cols[i][0] for i in reversed(range(n))])
        if cap_end and profile[-1][0] > 1e-9:
            bm.faces.new([cols[i][-1] for i in range(n)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return _place(bm, verts, loc, rot, None, _axis_matrix(axis))


def add_tube(bm, points, radius=0.02, seg=10, caps=True):
    """Sweep a circle along a polyline (cables, hoses, handrails, struts).
    `radius` is a number or one radius per point."""
    pts = [Vector(p) for p in points]
    radii = radius if isinstance(radius, (list, tuple)) else [radius] * len(pts)
    rings, up = [], None
    for i, p in enumerate(pts):
        d = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        if up is None:
            up = d.orthogonal().normalized()
        else:
            up = (up - d * up.dot(d))
            up = up.normalized() if up.length > 1e-6 else d.orthogonal().normalized()
        side = d.cross(up).normalized()
        rings.append([bm.verts.new(p + (up * math.cos(TAU * j / seg) + side * math.sin(TAU * j / seg)) * radii[i])
                      for j in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for j in range(seg):
            bm.faces.new((a[j], a[(j + 1) % seg], b[(j + 1) % seg], b[j]))
    if caps:
        bm.faces.new(rings[0])
        bm.faces.new(list(reversed(rings[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return [v for r in rings for v in r]


def add_prism(bm, outline, depth=0.1, loc=(0, 0, 0), axis='Z', rot=None):
    """Extrude a 2D outline [(x, y), ...] by `depth`, centred on its mid-plane."""
    bot = [bm.verts.new((x, y, -depth / 2)) for x, y in outline]
    top = [bm.verts.new((x, y, depth / 2)) for x, y in outline]
    n = len(outline)
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    for i in range(n):
        bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return _place(bm, bot + top, loc, rot, None, _axis_matrix(axis))


def add_capsule(bm, r=0.1, length=0.5, loc=(0, 0, 0), seg=16, axis='Z', rot=None, r2=None):
    """Rounded limb segment: total length `length` along the axis, end radii r (-end) and r2 (+end)."""
    r2 = r if r2 is None else r2
    half = max(length / 2 - max(r, r2), 0.0)
    profile, steps = [], 6
    for i in range(steps + 1):
        a = -math.pi / 2 + (math.pi / 2) * i / steps
        profile.append((r * math.cos(a), -half + r * math.sin(a)))
    for i in range(steps + 1):
        a = (math.pi / 2) * i / steps
        profile.append((r2 * math.cos(a), half + r2 * math.sin(a)))
    return add_lathe(bm, profile, seg=seg, loc=loc, axis=axis, rot=rot)


def circle_points(r, n, z=0.0, phase=0.0):
    return [(r * math.cos(phase + TAU * i / n), r * math.sin(phase + TAU * i / n), z) for i in range(n)]


# ----------------------------------------------------------------------------------------------
# Objects and parts
# ----------------------------------------------------------------------------------------------
def part(name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """A node the game can find by name and move: the model root, a wheel, a door, a dish.
    Its origin is its pivot. Helper meshes parented under it are joined into it on export."""
    o = bpy.data.objects.new(name, None)
    o.empty_display_size = 0.2
    o.location = loc
    o.rotation_euler = rot
    o['part'] = True
    return link(o, parent)


def anchor(name, parent, loc=(0, 0, 0), rot=(0, 0, 0), **extras):
    """A named empty that carries a position for the game (light, seat, attach point, collider).
    Keyword arguments are exported as glTF extras (e.g. radius=1.2)."""
    o = bpy.data.objects.new(name, None)
    o.empty_display_size = 0.1
    o.location = loc
    o.rotation_euler = rot
    o['part'] = True
    o['anchor'] = True
    for k, v in extras.items():
        o[k] = v
    return link(o, parent)


def mesh_obj(name, bm, material, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1),
             bevel=0.0, bevel_segments=2, subsurf=0, solidify=0.0, mirror=None,
             smooth_angle=38.0, weld=True, free=True):
    """Turn a bmesh into an object. bevel/subsurf/solidify/mirror become modifiers, applied on
    export. `material` is a palette name or a list of names (face.material_index picks one)."""
    if weld:
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    if free:
        bm.free()
    for mname in ([material] if isinstance(material, str) else material):
        me.materials.append(mat(mname))
    o = bpy.data.objects.new(name, me)
    o.location, o.rotation_euler, o.scale = loc, rot, scale
    o['smooth_angle'] = smooth_angle
    link(o, parent)
    if mirror:
        md = o.modifiers.new('mirror', 'MIRROR')
        md.use_axis = ['X' in mirror, 'Y' in mirror, 'Z' in mirror]
    if solidify:
        md = o.modifiers.new('solid', 'SOLIDIFY')
        md.thickness = solidify
        md.offset = 0.0
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL')
        md.width = bevel
        md.segments = bevel_segments
        md.limit_method = 'ANGLE'
        md.angle_limit = rad(32)
        md.harden_normals = False
    if subsurf:
        md = o.modifiers.new('subsurf', 'SUBSURF')
        md.levels = md.render_levels = subsurf
    return o


def instance(obj, name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1)):
    """A copy of a mesh object sharing its mesh data (bolts, rungs, repeated struts)."""
    o = bpy.data.objects.new(name, obj.data)
    o.location, o.rotation_euler, o.scale = loc, rot, scale
    for k in obj.keys():
        o[k] = obj[k]
    for md in obj.modifiers:
        nm = o.modifiers.new(md.name, md.type)
        for prop in md.bl_rna.properties:
            if not prop.is_readonly and prop.identifier not in ('name', 'type'):
                try:
                    setattr(nm, prop.identifier, getattr(md, prop.identifier))
                except Exception:
                    pass
    return link(o, parent if parent is not None else obj.parent)


def radial(obj, count, axis='Z', parent=None, start=0.0):
    """Copies of `obj` spun around the parent's axis (count includes the original)."""
    out = [obj]
    for i in range(1, count):
        a = start + TAU * i / count
        m = Matrix.Rotation(a, 4, axis)
        c = instance(obj, f'{obj.name}.{i}', parent if parent is not None else obj.parent)
        c.matrix_local = m @ obj.matrix_local
        out.append(c)
    return out


# ----------------------------------------------------------------------------------------------
# Finalising: apply modifiers, join helper meshes into their parts, bake ambient occlusion
# ----------------------------------------------------------------------------------------------
def _is_part(o):
    return bool(o.get('part')) or o.type == 'ARMATURE' or bool(o.get('keep'))


def _descendants(o):
    out = []
    for c in o.children:
        out.append(c)
        out.extend(_descendants(c))
    return out


def _apply_modifiers(objs):
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type != 'MESH' or not o.modifiers:
            continue
        if any(m.type == 'ARMATURE' for m in o.modifiers):
            continue
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), depsgraph=dg)
        o.modifiers.clear()
        o.data = me


def _mark_sharp(me, angle_deg):
    for p in me.polygons:
        p.use_smooth = True
    try:
        me.set_sharp_from_angle(angle=rad(angle_deg))
    except Exception:
        pass


def collapse(root):
    """Join every helper mesh into the nearest ancestor part, so the export has one mesh per
    movable node (few draw calls). Skinned meshes and objects marked keep=True are left alone."""
    bpy.context.view_layer.update()
    everything = [root] + _descendants(root)
    _apply_modifiers(everything)
    bpy.context.view_layer.update()
    for o in everything:
        if o.type == 'MESH':
            _mark_sharp(o.data, float(o.get('smooth_angle', 38.0)))
    groups = {}
    for o in everything:
        if o.type != 'MESH' or _is_part(o) or any(m.type == 'ARMATURE' for m in o.modifiers):
            continue
        p = o.parent
        while p is not None and not _is_part(p):
            p = p.parent
        groups.setdefault(p if p is not None else root, []).append(o)
    for owner, members in groups.items():
        bm = bmesh.new()
        slots = []
        inv = owner.matrix_world.inverted()
        for o in members:
            before = len(bm.faces)
            vbefore = len(bm.verts)
            bm.from_mesh(o.data)
            bm.verts.ensure_lookup_table()
            bm.faces.ensure_lookup_table()
            m = inv @ o.matrix_world
            bmesh.ops.transform(bm, matrix=m, verts=bm.verts[vbefore:])
            flip = m.determinant() < 0
            remap = []
            for ms in o.data.materials:
                if ms not in slots:
                    slots.append(ms)
                remap.append(slots.index(ms))
            new_faces = bm.faces[before:]
            for f in new_faces:
                f.material_index = remap[f.material_index] if remap else 0
            if flip:
                bmesh.ops.reverse_faces(bm, faces=new_faces)
        me = bpy.data.meshes.new(owner.name)
        bm.to_mesh(me)
        bm.free()
        for ms in slots:
            me.materials.append(ms)
        for p in me.polygons:
            p.use_smooth = True
        holder = bpy.data.objects.new(owner.name + '_mesh', me)
        link(holder, owner)
        for o in members:
            for c in list(o.children):          # keep any parts that hung off a helper
                mw = c.matrix_world.copy()
                c.parent = owner
                c.matrix_world = mw
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.context.view_layer.update()


def bake_ao(root, samples=24, distance=0.9, strength=0.8, floor=True, seed=7):
    """Bake ambient occlusion into a per-vertex colour (COLOR_0). The game multiplies it into the
    base colour, which grounds parts against each other. `floor` adds an implicit ground plane
    at z=0 so undersides darken."""
    import random
    rng = random.Random(seed)
    bpy.context.view_layer.update()
    objs = [o for o in [root] + _descendants(root) if o.type == 'MESH']
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
    for _ in range(samples):                     # cosine-weighted hemisphere directions (z up)
        u, v = rng.random(), rng.random()
        r, phi = math.sqrt(u), TAU * v
        dirs.append(Vector((r * math.cos(phi), r * math.sin(phi), math.sqrt(max(0.0, 1 - u)))))
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
                loc, _, _, dist = tree.ray_cast(p, w, distance)
                if loc is not None:
                    hit += (1.0 - dist / distance) ** 1.5
            ao = 1.0 - strength * (hit / samples)
            vals.append(max(0.08, min(1.0, ao)))
        for i, a in enumerate(vals):
            attr.data[i].color = (a, a, a, 1.0)
        me.color_attributes.active_color = attr
        try:
            me.color_attributes.render_color_index = list(me.color_attributes).index(attr)
        except Exception:
            pass


# ----------------------------------------------------------------------------------------------
# Export
# ----------------------------------------------------------------------------------------------
def tri_count(root):
    n = 0
    for o in [root] + _descendants(root):
        if o.type == 'MESH':
            n += sum(len(p.vertices) - 2 for p in o.data.polygons)
    return n


def export_model(root, name, ao=True, animations=False, ao_samples=24, ao_distance=0.9, do_collapse=True):
    """Collapse helpers into parts, bake AO, export .glb, compress with gltfpack.
    Returns a dict with triangle count and file size; also prints it."""
    t0 = time.time()
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    if do_collapse:
        collapse(root)
    if ao:
        bake_ao(root, samples=ao_samples, distance=ao_distance)
    tris = tri_count(root)
    for o in bpy.context.scene.objects:
        o.select_set(False)
    for o in [root] + _descendants(root):
        o.select_set(True)
    bpy.context.view_layer.objects.active = root
    raw = os.path.join(RAW_DIR, name + '.glb')
    kwargs = dict(
        filepath=raw, export_format='GLB', use_selection=True, export_apply=False, export_yup=True,
        export_normals=True, export_texcoords=False, export_materials='EXPORT', export_extras=True,
        export_animations=animations, export_skins=True, export_cameras=False, export_lights=False,
        export_vertex_color='ACTIVE', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
    )
    if animations:
        kwargs.update(export_animation_mode='ACTIONS', export_force_sampling=True, export_frame_step=2,
                      export_optimize_animation_size=True, export_def_bones=False)
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError as e:                       # exporter option names drift between Blender versions
        print('glTF exporter rejected an option, retrying with defaults:', e)
        for k in ('export_vertex_color', 'export_all_vertex_colors', 'export_active_vertex_color_when_no_material',
                  'export_animation_mode', 'export_optimize_animation_size', 'export_def_bones'):
            kwargs.pop(k, None)
        bpy.ops.export_scene.gltf(**kwargs)
    out = os.path.join(OUT_DIR, name + '.glb')
    cmd = ['node', os.path.join(TOOLS, 'node_modules', 'gltfpack', 'cli.js'), '-i', raw, '-o', out,
           '-cc', '-kn', '-km', '-ke', '-vp', '15', '-vn', '10', '-vc', '8']
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(res.stdout, res.stderr)
        raise RuntimeError('gltfpack failed for ' + name)
    info = {'name': name, 'triangles': tris, 'raw_kb': round(os.path.getsize(raw) / 1024, 1),
            'kb': round(os.path.getsize(out) / 1024, 1), 'seconds': round(time.time() - t0, 1)}
    print('EXPORTED', json.dumps(info))
    return info


def main_guard(build_fn):
    """Run `build_fn()` when the asset file is executed directly, with a clean scene."""
    reset_scene()
    return build_fn()
