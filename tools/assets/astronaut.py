"""
Family A — the astronaut: one skinned mesh on one armature, with twelve animation clips.

Run:   /home/user/blender-venv/bin/python tools/assets/astronaut.py [astronaut] [--anim-only] [--fast] [--out FILE.glb]
Then:  node tools/assets/preview.mjs astronaut --clips

How it is put together
  * MODEL    Every piece of the suit is a small bmesh built from lofted tubes, lathes, swept hoses
             and bevelled plates. Each piece carries a skin-weight rule (one bone for rigid
             hardware, or a blend computed from the distance along the limb for soft goods).
             Left-side pieces are mirrored to the right. All pieces are joined into ONE mesh.
  * RIG      21 bones (see BONES). Weights are assigned by code, never by bone heat.
  * CLIPS    Each clip is a Python function time -> pose. Poses are written in plain armature
             axes (X = the astronaut's left, -Y = forward, Z = up) with analytic two-bone IK for
             legs and arms, so feet stay on the ground and hands go where they are told. The
             poses are sampled and written straight into the .glb as glTF animations (no Blender
             actions are involved), then the file is compressed with gltfpack.
  * CHECKS   Every clip is linted numerically before export: nothing below the ground, planted
             feet do not slide, hands stay out of the torso / chest unit / backpack / helmet, loops
             close exactly.

The game shows one of two groups above the neck ring, by material name: the helmet (materials
helmet_white, helmet_dark, helmet_metal, helmet_light and visor_gold: shell, visor, rim, ear hubs,
lamps, base ring and the neck bellows) or the bare head (head_skin, head_cap, head_dark). Every
other surface belongs to the suit and is always drawn.

--out writes the finished file somewhere else (for trying things without touching the game's copy).
--anim-only reuses the cached mesh (tools/assets/.cache/raw/astronaut_mesh.glb) and only rebuilds
the clips, which takes a couple of seconds. --fast bakes a rough ambient occlusion. --debug adds
a six-second 'Test' clip of extreme poses (deep squat, arms overhead, elbows at 120 degrees,
twist, kneel) for checking the skin; never ship a file built with it.
"""
import json
import math
import os
import struct
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa: E402,F401,F403  (bpy first, then bmesh / mathutils)
import numpy as np  # noqa: E402

NAME = 'astronaut'
MESH_RAW = os.path.join(RAW_DIR, NAME + '_mesh.glb')      # Blender export: mesh + skeleton, no clips
SKIN_NPZ = os.path.join(RAW_DIR, NAME + '_skin.npz')      # rest verts + weights for the clip linter
FULL_RAW = os.path.join(RAW_DIR, NAME + '.glb')           # with clips, before gltfpack
TRI_BUDGET = 26000


# ==============================================================================================
# Skeleton (rest pose). Left is +X, forward is -Y, up is +Z.
# ==============================================================================================
ARM_DIR = Vector((math.sin(rad(30)), 0.0, -math.cos(rad(30))))     # arms 30 degrees out
ARM_U = Vector((math.cos(rad(30)), 0.0, math.sin(rad(30))))        # outward, perpendicular to the arm
L_UPPER, L_FORE, L_HAND = 0.30, 0.27, 0.19
SHOULDER = Vector((0.235, 0.0, 1.425))
ELBOW = SHOULDER + ARM_DIR * L_UPPER
WRIST = ELBOW + ARM_DIR * L_FORE
HAND_TIP = WRIST + ARM_DIR * L_HAND
HIP = Vector((0.11, 0.0, 0.93))
KNEE = Vector((0.11, 0.0, 0.50))
ANKLE = Vector((0.11, 0.0, 0.105))
BALL = Vector((0.11, -0.145, 0.035))
TOE_TIP = Vector((0.11, -0.245, 0.035))
L_THIGH = (KNEE - HIP).length
L_SHIN = (ANKLE - KNEE).length
HEAD_PIVOT = Vector((0.0, 0.0, 1.56))
HELMET_C = Vector((0.0, -0.012, 1.6825))
R_SHELL, R_VISOR = 0.175, 0.167


def _mx(v):
    return Vector((-v[0], v[1], v[2]))


BONES = [  # name, head, tail, parent
    ('hips', (0, 0, 0.96), (0, 0, 1.04), None),
    ('spine', (0, 0, 1.04), (0, 0, 1.12), 'hips'),
    ('chest', (0, 0, 1.12), (0, 0, 1.48), 'spine'),
    ('neck', (0, 0, 1.48), tuple(HEAD_PIVOT), 'chest'),
    ('head', tuple(HEAD_PIVOT), (0, 0, 1.86), 'neck'),
]
for _s, _f in (('L', lambda v: Vector(v)), ('R', _mx)):
    BONES += [
        ('shoulder_' + _s, tuple(_f((0.07, 0, 1.425))), tuple(_f(SHOULDER)), 'chest'),
        ('upper_arm_' + _s, tuple(_f(SHOULDER)), tuple(_f(ELBOW)), 'shoulder_' + _s),
        ('forearm_' + _s, tuple(_f(ELBOW)), tuple(_f(WRIST)), 'upper_arm_' + _s),
        ('hand_' + _s, tuple(_f(WRIST)), tuple(_f(HAND_TIP)), 'forearm_' + _s),
    ]
for _s, _f in (('L', lambda v: Vector(v)), ('R', _mx)):
    BONES += [
        ('thigh_' + _s, tuple(_f(HIP)), tuple(_f(KNEE)), 'hips'),
        ('shin_' + _s, tuple(_f(KNEE)), tuple(_f(ANKLE)), 'thigh_' + _s),
        ('foot_' + _s, tuple(_f(ANKLE)), tuple(_f(BALL)), 'shin_' + _s),
        ('toe_' + _s, tuple(_f(BALL)), tuple(_f(TOE_TIP)), 'foot_' + _s),
    ]
BONE_NAMES = [b[0] for b in BONES]
BONE_INDEX = {n: i for i, n in enumerate(BONE_NAMES)}
BONE_HEAD = {b[0]: Vector(b[1]) for b in BONES}
BONE_PARENT = {b[0]: b[3] for b in BONES}


# ==============================================================================================
# Small maths helpers
# ==============================================================================================
def smooth01(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3.0 - 2.0 * x)


def lerp(a, b, t):
    return a + (b - a) * t


def spow(c, e):
    return math.copysign(abs(c) ** e, c)


class Curve:
    """Smooth (Catmull-Rom) interpolation through rows (x, v0, v1, ...). Clamped at the ends.
    `ends='flat'` gives zero slope at both ends (ease in / ease out); m0 / m1 set them explicitly."""

    def __init__(self, pts, ends='free', m0=None, m1=None):
        a = np.array(pts, dtype=float)
        self.x, self.y = a[:, 0], a[:, 1:]
        n = len(self.x)
        self.m = np.zeros_like(self.y)
        for i in range(n):
            i0, i1 = max(i - 1, 0), min(i + 1, n - 1)
            self.m[i] = (self.y[i1] - self.y[i0]) / (self.x[i1] - self.x[i0])
        if ends == 'flat':
            self.m[0] = 0.0
            self.m[-1] = 0.0
        if m0 is not None:
            self.m[0] = m0
        if m1 is not None:
            self.m[-1] = m1

    def __call__(self, x):
        x = min(max(x, self.x[0]), self.x[-1])
        i = int(np.searchsorted(self.x, x, side='right') - 1)
        i = min(max(i, 0), len(self.x) - 2)
        h = self.x[i + 1] - self.x[i]
        t = (x - self.x[i]) / h
        t2, t3 = t * t, t * t * t
        return ((2 * t3 - 3 * t2 + 1) * self.y[i] + (t3 - 2 * t2 + t) * h * self.m[i]
                + (-2 * t3 + 3 * t2) * self.y[i + 1] + (t3 - t2) * h * self.m[i + 1])


class Keys:
    """Named channels keyed at shared times: Keys([0, .1, .3], crouch=[0, .2, 0], lean=[0, 20, 0])(t)
    returns a dict of floats. Ends are flat (ease in / out) unless ends='free'."""

    def __init__(self, times, ends='flat', **chan):
        self.c = {k: Curve(list(zip(times, v)), ends=ends) for k, v in chan.items()}

    def __call__(self, t):
        return {k: float(c(t)[0]) for k, c in self.c.items()}


def path_points(ctrl, n):
    """n+1 points along a smooth curve through the control points."""
    c = Curve([(i, *p) for i, p in enumerate(ctrl)])
    return [Vector(c(i * (len(ctrl) - 1) / n)) for i in range(n + 1)]


# ==============================================================================================
# Modelling helpers (family-specific; lib.py has the plain primitives)
# ==============================================================================================
D2R = math.pi / 180.0


def grid(bm, rows, close_u=False, flip=False, cap_first=False, cap_last=False, out_from=None):
    """Quads between consecutive rows of points. Default winding suits a right-handed loft
    (columns going counter-clockwise seen from the far end of the rows). `out_from` fixes the
    winding automatically so the faces look away from that point."""
    vr = [[bm.verts.new(p) for p in row] for row in rows]
    n = len(rows[0])
    faces = []
    for a, b in zip(vr, vr[1:]):
        for j in range(n if close_u else n - 1):
            j2 = (j + 1) % n
            q = (a[j], a[j2], b[j2], b[j])
            try:
                faces.append(bm.faces.new(q[::-1] if flip else q))
            except ValueError:
                pass
    if cap_first:
        faces.append(bm.faces.new(vr[0] if flip else vr[0][::-1]))
    if cap_last:
        faces.append(bm.faces.new(vr[-1][::-1] if flip else vr[-1]))
    if out_from is not None and faces:
        tot = 0.0
        for f in faces:
            f.normal_update()
            tot += f.normal.dot(f.calc_center_median() - Vector(out_from)) * f.calc_area()
        if tot < 0:
            bmesh.ops.reverse_faces(bm, faces=faces)
    return vr


class Tube:
    """A lofted surface around an axis: limbs, torso, pack. Local coordinates (u, v, s) map to
    the world through `frame` = (origin, U, V, D). A cross-section is a superellipse with radii
    (rx along U, ry along V), centre offset (cu, cv) and exponent n (2 = ellipse, 4 = boxy).
    Angle theta runs from +U towards +V."""

    def __init__(self, frame, stations=None, sec=None, mod=None):
        self.frame = tuple(Vector(v) for v in frame)
        if stations is not None:
            c = Curve(stations)
            self.sec = lambda s: tuple(c(s))
        else:
            self.sec = sec
        self.mod = mod
        o, U, V, D = self.frame
        self.flip = U.cross(V).dot(D) < 0

    def P(self, s, th, lift=0.0):
        rx, ry, cu, cv, n = self.sec(s)
        c, si = math.cos(th), math.sin(th)
        e = 2.0 / n
        x, y = spow(c, e), spow(si, e)
        nx, ny = spow(c, 2 - e) / max(rx, 1e-6), spow(si, 2 - e) / max(ry, 1e-6)
        ln = math.hypot(nx, ny) or 1.0
        ext = lift + (self.mod(s, th) if self.mod else 0.0)
        o, U, V, D = self.frame
        return o + U * (cu + rx * x + nx / ln * ext) + V * (cv + ry * y + ny / ln * ext) + D * s

    def N(self, s, th):
        return (self.P(s, th, 0.01) - self.P(s, th, 0.0)).normalized()

    def axis_point(self, s):
        rx, ry, cu, cv, n = self.sec(s)
        o, U, V, D = self.frame
        return o + U * cu + V * cv + D * s

    def loft(self, bm, ss, seg=16, lift=0.0, cap0=False, cap1=False, th0=0.0):
        lifts = lift if isinstance(lift, (list, tuple)) else [lift] * len(ss)
        rows = [[self.P(s, th0 + TAU * j / seg, lf) for j in range(seg)] for s, lf in zip(ss, lifts)]
        return grid(bm, rows, close_u=True, flip=self.flip, cap_first=cap0, cap_last=cap1)

    def band(self, bm, s0, s1, lift, seg=16, edge=0.004, sink=0.003, mid=0, th0=0.0):
        """A raised ring around the tube (bearing, cuff, strap, seam)."""
        ss = [s0, s0 + edge] + [lerp(s0 + edge, s1 - edge, (i + 1) / (mid + 1)) for i in range(mid)] + [s1 - edge, s1]
        lf = [-sink] + [lift] * (mid + 2) + [-sink]
        return self.loft(bm, ss, seg=seg, lift=lf, th0=th0)

    def panel(self, bm, s0, s1, th0, th1, lift, ns=3, nth=4, wall=0.0012, sink=0.003, bevel=0.0, dome=0.0):
        """A raised panel between two stations and two angles (radians, th1 > th0). The rim
        is a steep wall that starts below the surface, so its outline stays a clean line."""
        rx, ry = self.sec((s0 + s1) / 2)[:2]
        rr = max((rx + ry) / 2, 1e-3)

        def lines(a, b, n, w, bv):
            pre = [(a, 0), (a + w, 1)] + ([(a + w + bv, 2)] if bv else [])
            post = ([(b - w - bv, 2)] if bv else []) + [(b - w, 1), (b, 0)]
            lo, hi = pre[-1][0], post[0][0]
            return pre + [(lerp(lo, hi, (i + 1) / n), 2) for i in range(n - 1)] + post
        sl = lines(s0, s1, ns, wall, bevel)
        tl = lines(th0, th1, nth, wall / rr, bevel / rr)
        levels = [-sink, lift * (0.5 if bevel else 1.0), lift]
        rows = []
        for s, ls in sl:
            row = []
            for th, lt in tl:
                lv = min(ls, lt)
                a = 2 * (s - s0) / (s1 - s0) - 1
                b = 2 * (th - th0) / (th1 - th0) - 1
                row.append(self.P(s, th, levels[lv] + (dome * (1 - a * a) * (1 - b * b) if lv == 2 else 0.0)))
            rows.append(row)
        return grid(bm, rows, flip=self.flip)

    def pad(self, bm, sc, thc, hs, hw, lift, corner=0.015, wall=0.0015, bevel=0.006, sink=0.003, dome=0.0,
            n_arc=2, n_s=1, n_th=1, mid=(0.62, 0.28)):
        """A small rounded pad centred at station sc, angle thc: half-length hs along the tube,
        half-width hw around it (metres). Concentric rings: buried rim, wall, bevel, top."""
        rx, ry = self.sec(sc)[:2]
        rr = max((rx + ry) / 2, 1e-3)

        def outline(inset):
            a, b = hs - inset, hw - inset
            rc = max(corner - inset, 0.0012)
            rc = min(rc, a - 1e-4, b - 1e-4)
            cs = [(a - rc, b - rc, 0), (-(a - rc), b - rc, 90), (-(a - rc), -(b - rc), 180), (a - rc, -(b - rc), 270)]
            pts = []
            for ci, (cx, cy, a0) in enumerate(cs):
                arc = [(cx + rc * math.cos((a0 + 90 * k / n_arc) * D2R), cy + rc * math.sin((a0 + 90 * k / n_arc) * D2R)) for k in range(n_arc + 1)]
                pts += arc
                nx_, ny_, na0 = cs[(ci + 1) % 4]
                nxt = (nx_ + rc * math.cos(na0 * D2R), ny_ + rc * math.sin(na0 * D2R))
                m = n_s if ci % 2 == 0 else n_th
                for k in range(1, m):
                    pts.append((lerp(arc[-1][0], nxt[0], k / m), lerp(arc[-1][1], nxt[1], k / m)))
            return pts
        top = wall + bevel
        rings = [(outline(0.0), -sink), (outline(wall), lift * (0.45 if bevel else 1.0))] + ([(outline(top), lift)] if bevel else [])
        crown = outline(top)
        for f in mid:
            rings.append(([(x * f, y * f) for x, y in crown], lift + dome * (1 - f * f)))
        rows = [[self.P(sc + x, thc + y / rr, lf) for x, y in pts] for pts, lf in rings]
        ax = self.axis_point(sc)
        vr = grid(bm, rows, close_u=True, out_from=ax)
        cv = bm.verts.new(self.P(sc, thc, lift + dome))
        last = vr[-1]
        fs = [bm.faces.new((last[j], last[(j + 1) % len(last)], cv)) for j in range(len(last))]
        tot = 0.0
        for f in fs:
            f.normal_update()
            tot += f.normal.dot(f.calc_center_median() - ax)
        if tot < 0:
            bmesh.ops.reverse_faces(bm, faces=fs)
        return vr


def sph(r, phi, psi, c=HELMET_C):
    """Point on the helmet sphere. phi: pitch from forward (-Y) towards up; psi: angle from the
    left ear (+X) pole. Lines of constant phi all meet at the two ear hubs, like a real visor."""
    rho = r * math.sin(psi)
    return Vector(c) + Vector((r * math.cos(psi), -rho * math.cos(phi), rho * math.sin(phi)))


def sphere_patch(bm, r_fn, phis, psis, c=HELMET_C):
    rows = [[sph(r_fn(i, j), ph, ps, c) for j, ps in enumerate(psis)] for i, ph in enumerate(phis)]
    return grid(bm, rows, out_from=c)


def frange(a, b, n):
    return [a + (b - a) * i / n for i in range(n + 1)]


def oriented(bm, verts, origin, z_axis, x_hint=(1, 0, 0)):
    """Move verts built around the origin with +Z up so that +Z points along z_axis at origin."""
    z = Vector(z_axis).normalized()
    x = Vector(x_hint) - z * Vector(x_hint).dot(z)
    x = x.normalized() if x.length > 1e-6 else z.orthogonal().normalized()
    y = z.cross(x)
    m = Matrix((x, y, z)).transposed().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation(origin) @ m, verts=verts)
    return verts


def bolt(bm, p, n, r=0.0042, h=0.0045, seg=5):
    """A small fastener head at p, standing along n."""
    v = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r * 0.75, depth=h)['verts']
    oriented(bm, v, Vector(p) + Vector(n).normalized() * (h * 0.4), n)


def bolt_circle(bm, centre, axis, radius, count, phase=0.0, **kw):
    axis = Vector(axis).normalized()
    t = axis.orthogonal().normalized()
    b = axis.cross(t)
    for i in range(count):
        a = phase + TAU * i / count
        bolt(bm, Vector(centre) + (t * math.cos(a) + b * math.sin(a)) * radius, axis, **kw)


def add_pill(bm, r, length, loc, seg=12, steps=3, axis='Z'):
    """A capsule with few rings (tanks, bottles)."""
    half = length / 2 - r
    prof = [(r * math.sin(math.pi / 2 * i / steps), -half - r * math.cos(math.pi / 2 * i / steps)) for i in range(steps + 1)]
    prof += [(x, -z) for x, z in reversed(prof)]
    return add_lathe(bm, prof, seg=seg, loc=loc, axis=axis)


# ==============================================================================================
# Skin-weight rules (functions of the rest position; written for the LEFT side)
# ==============================================================================================
def w_arm(p):
    s = (p - SHOULDER).dot(ARM_DIR)
    te = smooth01((s - (L_UPPER - 0.07)) / 0.14)
    tw = smooth01((s - (L_UPPER + L_FORE - 0.03)) / 0.06)
    return {'upper_arm_L': 1 - te, 'forearm_L': te * (1 - tw), 'hand_L': tw}


def w_leg(p):
    s = HIP.z - p.z
    tk = smooth01((s - (L_THIGH - 0.085)) / 0.17)
    return {'thigh_L': 1 - tk, 'shin_L': tk}


def w_ankle(p):
    t = smooth01((p.z - 0.165) / 0.07)
    return {'foot_L': 1 - t, 'shin_L': t}


def w_toe(p):
    t = smooth01((-p.y - 0.115) / 0.06)
    return {'foot_L': 1 - t, 'toe_L': t}


def w_waist(p):
    a = smooth01((p.z - 1.015) / 0.05)
    b = smooth01((p.z - 1.075) / 0.05)
    return {'hips': 1 - a, 'spine': a * (1 - b), 'chest': a * b}


def w_neck(p):
    a = smooth01((p.z - 1.505) / 0.022)
    b = smooth01((p.z - 1.53) / 0.022)
    return {'chest': 1 - a, 'neck': a * (1 - b), 'head': a * b}


def _swap_side(name):
    if name.endswith('_L'):
        return name[:-2] + '_R'
    if name.endswith('_R'):
        return name[:-2] + '_L'
    return name


# ==============================================================================================
# The model accumulator
# ==============================================================================================
class Model:
    def __init__(self):
        self.pieces = []

    def add(self, name, bm, material, weight, mirror=False, bevel=0.0, bevel_seg=1, bevel_angle=30.0,
            smooth=40.0, tint=(1.0, 1.0, 1.0), normal=None, soft_ao=0.0):
        """Register a finished piece. `weight` is a bone name (rigid) or a function of the rest
        position returning {bone: weight}. `mirror` adds the X-mirrored twin with _L/_R swapped.
        `tint` is a colour or a function of the rest position (the baked colour is AO times it).
        `normal` is an optional function of the rest position giving the exact surface normal
        (used for the visor, so that a mirror material reflects without faceting). `soft_ao`
        (0..1) lightens and evens out the baked occlusion on the piece: skin shows every blotch."""
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
        if bevel:
            edges = [e for e in bm.edges if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > rad(bevel_angle)]
            if edges:
                bmesh.ops.bevel(bm, geom=edges, offset=bevel, offset_type='OFFSET', segments=bevel_seg,
                                profile=0.5, affect='EDGES', clamp_overlap=True)
        wfn = (lambda p, _b=weight: {_b: 1.0}) if isinstance(weight, str) else weight
        self.pieces.append(dict(name=name, bm=bm, material=material, weight=wfn, smooth=smooth, tint=tint, normal=normal, soft_ao=soft_ao))
        if mirror:
            b2 = bm.copy()
            bmesh.ops.transform(b2, matrix=Matrix.Diagonal((-1, 1, 1, 1)), verts=b2.verts[:])
            bmesh.ops.reverse_faces(b2, faces=b2.faces[:])
            w2 = lambda p, _w=wfn: {_swap_side(k): v for k, v in _w(Vector((-p.x, p.y, p.z))).items()}  # noqa: E731
            t2 = (lambda p, _t=tint: _t(Vector((-p.x, p.y, p.z)))) if callable(tint) else tint
            n2 = (lambda p, _n=normal: _mx(_n(Vector((-p.x, p.y, p.z))))) if normal else None
            nm = name.replace('_L', '_R') if '_L' in name else name + '_R'
            self.pieces.append(dict(name=nm, bm=b2, material=material, weight=w2, smooth=smooth, tint=t2, normal=n2, soft_ao=soft_ao))

    def report(self):
        grp = {}
        for p in self.pieces:
            k = p['name'].replace('_R', '_L')
            grp[k] = grp.get(k, 0) + sum(len(f.verts) - 2 for f in p['bm'].faces)
        rows = sorted(grp.items(), key=lambda kv: -kv[1])
        print('pieces: %d, triangles: %d' % (len(self.pieces), sum(v for _, v in rows)))
        print('  ' + ', '.join('%s %d' % kv for kv in rows[:40]))

    def join(self, obj_name):
        """One mesh object with materials, sharp edges, vertex groups. Returns (object, tints,
        piece ids per vertex, exact normals per vertex or (0, 0, 0) where Blender's own are used)."""
        bm = bmesh.new()
        dl = bm.verts.layers.deform.verify()
        mats, tints, pids, normals = [], [], [], []
        for pi, p in enumerate(self.pieces):
            src = p['bm']
            if p['material'] not in mats:
                mats.append(p['material'])
            mi = mats.index(p['material'])
            src.verts.ensure_lookup_table()
            src.verts.index_update()
            vmap = []
            for v in src.verts:
                nv = bm.verts.new(v.co)
                w = {k: x for k, x in p['weight'](v.co).items() if x > 1e-4}
                tot = sum(w.values())
                for k, x in w.items():
                    nv[dl][BONE_INDEX[k]] = x / tot
                vmap.append(nv)
                tints.append(tuple(p['tint'](v.co)) if callable(p['tint']) else p['tint'])
                normals.append(tuple(p['normal'](v.co)) if p['normal'] else (0.0, 0.0, 0.0))
                pids.append(pi)
            for f in src.faces:
                try:
                    nf = bm.faces.new([vmap[v.index] for v in f.verts])
                except ValueError:
                    continue
                nf.material_index = mi
                nf.smooth = True
            lim = rad(p['smooth'])
            for e in src.edges:
                if len(e.link_faces) != 2 or e.calc_face_angle(0.0) > lim:
                    ne = bm.edges.get((vmap[e.verts[0].index], vmap[e.verts[1].index]))
                    if ne is not None:
                        ne.smooth = False
            src.free()
        me = bpy.data.meshes.new(obj_name)
        bm.to_mesh(me)
        bm.free()
        for m in mats:
            me.materials.append(mat(m))
        obj = bpy.data.objects.new(obj_name, me)
        for n in BONE_NAMES:
            obj.vertex_groups.new(name=n)
        return obj, tints, pids, normals


# ==============================================================================================
# The suit, piece by piece
# ==============================================================================================
TORSO_FRAME = (Vector((0, 0, 0)), Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))
ARM_FRAME = (SHOULDER, ARM_U, Vector((0, 1, 0)), ARM_DIR)
LEG_FRAME = (HIP, Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, -1)))
SCYE_AXIS = Vector((0.756, -0.252, -0.604)).normalized()       # the shoulder bearing looks out, down and a little forward


BELLOWS = (0.8, 0.8, 0.82)          # tints: the baked colour is AO times this, so one material can vary
BOOT_TINT = (0.92, 0.92, 0.9)


def ribs(s0, pitch, amp, power=0.75):
    """Radius modulation for a convoluted (bellows) joint: rounded ridges, creased valleys."""
    return lambda s, th: amp * abs(math.sin(math.pi * (s - s0) / pitch)) ** power


def rib_rows(s0, pitch, count, crown=0.22):
    """Stations for a bellows: valley, two rows across each crown, valley ..."""
    out = []
    for i in range(count):
        out += [s0 + pitch * i, s0 + pitch * (i + 0.5 - crown), s0 + pitch * (i + 0.5 + crown)]
    return out + [s0 + pitch * count]


def build_torso(M):
    # ---- hard upper torso (HUT): fabric-covered shell, rigid on the chest bone
    hut = Tube(TORSO_FRAME, stations=[
        # z,     rx,    ry,    cu, cv,     n
        (1.105, 0.146, 0.112, 0, 0.006, 2.3),
        (1.135, 0.168, 0.130, 0, 0.004, 2.5),
        (1.20, 0.181, 0.146, 0, 0.000, 2.6),
        (1.28, 0.189, 0.156, 0, -0.004, 2.6),
        (1.36, 0.190, 0.156, 0, -0.004, 2.5),
        (1.42, 0.183, 0.150, 0, 0.000, 2.4),
        (1.462, 0.164, 0.139, 0, 0.002, 2.3),
        (1.492, 0.138, 0.128, 0, 0.004, 2.1),
        (1.508, 0.120, 0.120, 0, 0.004, 2.0),
    ])
    bm = bm_new()
    hut.loft(bm, [1.105, 1.135, 1.17, 1.21, 1.26, 1.31, 1.36, 1.405, 1.44, 1.468, 1.492, 1.508], seg=28, cap1=True)
    M.add('hut', bm, 'suit_white', 'chest', smooth=60, tint=(0.97, 0.97, 0.96))
    # waist flange: the aluminium ring the soft waist clamps to, with a row of fasteners
    bm = bm_new()
    hut.band(bm, 1.106, 1.14, 0.008, seg=28, edge=0.006)
    M.add('waist_flange', bm, 'aluminium', 'chest', smooth=50)
    bm = bm_new()
    for i in range(12):
        th = TAU * (i + 0.5) / 12
        bolt(bm, hut.P(1.123, th, 0.008), hut.N(1.123, th))
    M.add('waist_bolts', bm, 'plastic_black', 'chest')
    # seam band, harness webbing with adjuster buckles
    bm = bm_new()
    hut.band(bm, 1.395, 1.411, 0.004, seg=28, edge=0.004)
    M.add('hut_seam', bm, 'suit_grey', 'chest', smooth=60)
    bm = bm_new()
    for sgn in (1, -1):
        th = (270 + sgn * 40) * D2R
        hut.panel(bm, 1.15, 1.475, th - 0.085, th + 0.085, 0.006, ns=6, nth=1)            # front straps
        th = (90 + sgn * 42) * D2R
        hut.panel(bm, 1.38, 1.488, th - 0.09, th + 0.09, 0.006, ns=3, nth=1)              # back straps
    M.add('harness', bm, 'suit_grey', 'chest', smooth=60)
    bm = bm_new()
    for sgn in (1, -1):
        th = (270 + sgn * 40) * D2R
        oriented(bm, add_box(bm, (0.042, 0.03, 0.008)), hut.P(1.43, th, 0.011), hut.N(1.43, th), x_hint=(1, 0, 0))
    M.add('buckles', bm, 'aluminium', 'chest', bevel=0.002)
    # a plain name tape on the upper left chest
    bm = bm_new()
    hut.pad(bm, 1.437, (270 + 18) * D2R, 0.014, 0.036, 0.004, corner=0.004, bevel=0.0, mid=())
    M.add('name_tape', bm, 'suit_orange', 'chest', smooth=50)
    bm = bm_new()
    hut.pad(bm, 1.437, (270 - 18) * D2R, 0.011, 0.026, 0.004, corner=0.003, bevel=0.0, mid=())
    M.add('id_patch', bm, 'plastic_black', 'chest', smooth=50)

    # ---- neck ring (chest) with latches
    bm = bm_new()
    add_lathe(bm, [(0.121, -0.012), (0.139, -0.012), (0.145, -0.004), (0.145, 0.006), (0.139, 0.014), (0.131, 0.018), (0.124, 0.018)],
              seg=24, loc=(0, 0.004, 1.50), cap_start=False, cap_end=False)
    M.add('neck_ring', bm, 'aluminium', 'chest', smooth=50)
    bm = bm_new()
    add_box(bm, (0.05, 0.022, 0.026), (0, -0.142, 1.502))
    for sx in (-1, 1):
        add_box(bm, (0.022, 0.018, 0.02), (sx * 0.143, 0.004, 1.502))
    M.add('neck_latch', bm, 'plastic_black', 'chest', bevel=0.004)
    # padded collar inside the neck ring: it closes the opening round the wearer's neck, so the
    # suit looks finished from above with the helmet off (with the helmet on it is inside the bellows)
    bm = bm_new()
    rows = []
    for cy, r, z in ((0.004, 0.1262, 1.5140), (0.004, 0.1215, 1.5185), (0.0065, 0.1110, 1.5235), (0.012, 0.0930, 1.5210),
                     (0.018, 0.0700, 1.5075), (0.019, 0.0640, 1.4990)):
        rows.append([Vector((r * math.cos(TAU * j / 14), cy + r * math.sin(TAU * j / 14), z)) for j in range(14)])
    grid(bm, rows, close_u=True, out_from=(0, 0.01, 1.40))
    M.add('collar_pad', bm, 'suit_grey', 'chest', smooth=60, tint=BELLOWS)

    # ---- shoulder (scye) housings on the HUT and the bearing rings the arms turn in
    bm = bm_new()
    v = add_lathe(bm, [(0.114, -0.105), (0.107, -0.07), (0.095, -0.052), (0.089, -0.047)], seg=20, cap_start=False, cap_end=False)
    oriented(bm, v, SHOULDER, SCYE_AXIS)
    M.add('scye_housing_L', bm, 'suit_white', 'chest', mirror=True, smooth=60)
    bm = bm_new()
    v = add_lathe(bm, [(0.086, -0.055), (0.097, -0.055), (0.1, -0.049), (0.1, -0.040), (0.096, -0.035), (0.085, -0.035)],
                  seg=20, cap_start=False, cap_end=False)
    oriented(bm, v, SHOULDER, SCYE_AXIS)
    M.add('scye_ring_L', bm, 'aluminium', 'shoulder_L', mirror=True, smooth=50)

    # ---- soft waist: convoluted bellows between the brief and the HUT
    waist = Tube(TORSO_FRAME, stations=[
        (1.00, 0.158, 0.120, 0, 0.005, 2.4),
        (1.06, 0.150, 0.114, 0, 0.005, 2.3),
        (1.13, 0.150, 0.114, 0, 0.005, 2.3),
    ], mod=ribs(1.012, 0.038, 0.009))
    bm = bm_new()
    waist.loft(bm, rib_rows(1.012, 0.038, 3), seg=24)
    M.add('waist_bellows', bm, 'suit_grey', w_waist, smooth=50, tint=BELLOWS)

    # ---- brief (pelvis shell), rigid on the hips
    brief = Tube(TORSO_FRAME, stations=[
        (0.828, 0.050, 0.055, 0, 0.0, 2.0),
        (0.845, 0.098, 0.086, 0, 0.0, 2.2),
        (0.885, 0.152, 0.118, 0, 0.002, 2.4),
        (0.935, 0.179, 0.134, 0, 0.005, 2.5),
        (0.985, 0.180, 0.134, 0, 0.005, 2.5),
        (1.025, 0.168, 0.126, 0, 0.005, 2.4),
        (1.045, 0.150, 0.114, 0, 0.005, 2.4),
    ])
    bm = bm_new()
    brief.loft(bm, [0.828, 0.845, 0.865, 0.89, 0.92, 0.955, 0.99, 1.02, 1.045], seg=24, cap0=True)
    M.add('brief', bm, 'suit_white', 'hips', smooth=60, tint=(0.94, 0.94, 0.93))
    bm = bm_new()
    brief.band(bm, 0.99, 1.026, 0.006, seg=24, edge=0.005)
    brief.panel(bm, 0.838, 0.992, (270 - 9) * D2R, (270 + 9) * D2R, 0.005, ns=5, nth=1)            # front crotch strap
    brief.panel(bm, 0.838, 0.992, (90 - 9) * D2R, (90 + 9) * D2R, 0.005, ns=5, nth=1)              # and behind
    for sgn in (1, -1):                                                                          # leg-loop straps
        brief.panel(bm, 0.872, 0.992, (270 + sgn * 46 - 5) * D2R, (270 + sgn * 46 + 5) * D2R, 0.005, ns=3, nth=1)
    M.add('belt', bm, 'suit_grey', 'hips', smooth=55)
    bm = bm_new()
    add_box(bm, (0.06, 0.014, 0.046), brief.P(1.008, 270 * D2R, 0.011))
    M.add('belt_buckle', bm, 'aluminium', 'hips', bevel=0.003)
    bm = bm_new()
    for sx in (-1, 1):                                     # tether D-rings on the belt
        th = (270 + sx * 64) * D2R
        c = brief.P(1.004, th, 0.011)
        v = add_torus(bm, R=0.017, r=0.0038, seg=8, ring_seg=4)
        oriented(bm, v, c + Vector((0, 0, -0.016)), brief.N(1.004, th), x_hint=(0, 0, 1))
    M.add('belt_rings', bm, 'aluminium', 'hips', smooth=80)
    # leg-opening binding: a piped seam along the line where each hip joint leaves the brief
    def inside(pt):
        if not (0.83 < pt.z < 1.3):
            return False
        rx, ry, cu, cv, n = brief.sec(min(pt.z, 1.045))
        return abs((pt.x - cu) / rx) ** n + abs((pt.y - cv) / ry) ** n < 1.0
    R = 0.1035
    cax = Vector((-0.35, 0, 0.94)).normalized()
    e1 = cax.orthogonal().normalized()
    e2 = cax.cross(e1)
    loop = []
    for i in range(22):
        ph = TAU * i / 22
        lo, hi = 0.0, math.pi
        for _ in range(28):
            mid_a = (lo + hi) / 2
            d = cax * math.cos(mid_a) + (e1 * math.cos(ph) + e2 * math.sin(ph)) * math.sin(mid_a)
            lo, hi = (mid_a, hi) if inside(HIP + d * R) else (lo, mid_a)
        loop.append(HIP + (cax * math.cos(lo) + (e1 * math.cos(ph) + e2 * math.sin(ph)) * math.sin(lo)) * R)
    bm = bm_new()
    add_tube(bm, loop + [loop[0], loop[1]], 0.0075, seg=5, caps=False)
    M.add('leg_binding_L', bm, 'suit_grey', 'hips', mirror=True, smooth=100)
    # a small belt pouch with a flap, front left
    bm = bm_new()
    brief.pad(bm, 0.938, (270 + 29) * D2R, 0.036, 0.03, 0.022, corner=0.01, bevel=0.007, dome=0.002)
    M.add('pouch', bm, 'suit_white', 'hips', smooth=50, tint=(0.9, 0.9, 0.9))
    bm = bm_new()
    brief.pad(bm, 0.963, (270 + 29) * D2R, 0.016, 0.033, 0.029, corner=0.005, bevel=0.004, mid=())
    M.add('pouch_flap', bm, 'suit_grey', 'hips', smooth=50)
    return hut, brief


def build_chest_unit(M, hut):
    """Display and control module on the chest: body, angled screen, gauge, selector, switches."""
    cy, cz = -0.193, 1.272
    bm = bm_new()
    add_box(bm, (0.205, 0.078, 0.128), (0, cy, cz))
    M.add('dcm_body', bm, 'painted_white', 'chest', bevel=0.011, bevel_seg=2)
    bm = bm_new()                                           # mounting frame behind it
    add_box(bm, (0.225, 0.03, 0.148), (0, cy + 0.035, cz))
    M.add('dcm_frame', bm, 'suit_grey', 'chest', bevel=0.008)
    # screen hood on the top edge, tilted up towards the wearer's eyes
    tilt = rad(-38)
    rot = Euler((tilt, 0, 0)).to_matrix()
    hc = Vector((0.018, cy - 0.006, cz + 0.07))
    bm = bm_new()
    add_box(bm, (0.13, 0.056, 0.02), hc, rot=(tilt, 0, 0))
    M.add('dcm_hood', bm, 'plastic_black', 'chest', bevel=0.004)
    bm = bm_new()
    add_box(bm, (0.108, 0.04, 0.004), hc + rot @ Vector((0, 0, 0.0105)), rot=(tilt, 0, 0))
    M.add('dcm_screen', bm, 'screen', 'chest')
    fy = cy - 0.039                                         # the front face
    # left: a pressure gauge (bezel, dark face, orange needle)
    gx, gz = -0.052, cz + 0.014
    bm = bm_new()
    add_lathe(bm, [(0.036, 0.0), (0.036, 0.009), (0.031, 0.012), (0.028, 0.012), (0.028, 0.006)], seg=12, loc=(gx, fy, gz), rot=(rad(90), 0, 0), cap_end=False)
    for sx in (-1, 1):                                       # hose ports on the sides
        add_lathe(bm, [(0.024, 0.0), (0.024, 0.008), (0.02, 0.011), (0.02, 0.02), (0.017, 0.022)], seg=10,
                  loc=(sx * 0.1, cy + 0.004, cz - 0.02), rot=(0, sx * rad(90), 0), cap_end=False)
    for x in (0.03, 0.055, 0.08):                            # toggle switch levers
        add_box(bm, (0.006, 0.02, 0.006), (x, fy - 0.008, cz - 0.03), rot=(rad(28 if x != 0.055 else -28), 0, 0))
    M.add('dcm_metal', bm, 'aluminium', 'chest', smooth=50)
    bm = bm_new()
    add_cyl(bm, 0.0285, 0.004, (gx, fy - 0.005, gz), seg=12, axis='Y')
    add_box(bm, (0.076, 0.01, 0.03), (0.055, fy - 0.003, cz - 0.03))                      # switch plate
    add_box(bm, (0.086, 0.014, 0.008), (0.055, fy - 0.006, cz - 0.05))                    # switch guard rail
    add_lathe(bm, [(0.015, 0.0), (0.015, 0.012), (0.011, 0.015), (0, 0.015)], seg=8, loc=(-0.07, cy - 0.012, cz - 0.064), rot=(rad(180), 0, 0))
    M.add('dcm_black', bm, 'plastic_black', 'chest')
    bm = bm_new()
    add_box(bm, (0.005, 0.004, 0.026), (gx + 0.006, fy - 0.0085, gz + 0.006), rot=(0, rad(-35), 0))     # gauge needle
    add_lathe(bm, [(0.022, 0.0), (0.022, 0.006), (0.018, 0.009), (0.018, 0.02), (0, 0.02)], seg=10, loc=(0.058, fy, cz + 0.022), rot=(rad(90), 0, 0))
    add_box(bm, (0.007, 0.01, 0.03), (0.058, fy - 0.021, cz + 0.022), rot=(0, rad(25), 0))             # selector pointer
    add_box(bm, (0.03, 0.012, 0.018), (-0.06, fy - 0.004, cz - 0.04))                                  # purge tab
    M.add('dcm_orange', bm, 'suit_orange', 'chest')


def build_backpack(M):
    """Portable life-support pack. The game camera looks at this most of the time."""
    yc = 0.238
    pack = Tube((Vector((0, yc, 0)), Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))), stations=[
        (0.985, 0.150, 0.070, 0, 0.0, 3.2),
        (1.000, 0.176, 0.088, 0, 0.0, 3.6),
        (1.03, 0.186, 0.096, 0, 0.0, 4.0),
        (1.30, 0.186, 0.098, 0, 0.0, 4.0),
        (1.49, 0.180, 0.094, 0, 0.004, 4.0),
        (1.535, 0.168, 0.082, 0, 0.012, 3.6),
        (1.552, 0.140, 0.062, 0, 0.018, 3.0),
    ])
    bm = bm_new()
    pack.loft(bm, [0.985, 1.0, 1.03, 1.14, 1.27, 1.40, 1.49, 1.535, 1.552], seg=28, cap0=True, cap1=True)
    M.add('pack_shell', bm, 'painted_white', 'chest', smooth=50, tint=(0.95, 0.95, 0.95))
    bm = bm_new()
    pack.band(bm, 1.168, 1.208, 0.004, seg=28, edge=0.004)
    M.add('pack_stripe', bm, 'suit_orange', 'chest', smooth=50)
    bm = bm_new()
    pack.band(bm, 1.405, 1.418, 0.0035, seg=28, edge=0.004)
    M.add('pack_seams', bm, 'suit_grey', 'chest', smooth=50)
    yb = yc + 0.098                                          # the rear face
    # rear service panel: raised plate with fan grille, louvres and status lights
    bm = bm_new()
    add_box(bm, (0.25, 0.014, 0.17), (0, yb + 0.002, 1.31))
    M.add('pack_panel', bm, 'painted_white', 'chest', bevel=0.006, tint=(0.88, 0.88, 0.88))
    bm = bm_new()
    add_lathe(bm, [(0.062, 0.0), (0.062, 0.009), (0.054, 0.012), (0.05, 0.012), (0.05, 0.004), (0.0, 0.004)], seg=16,
              loc=(-0.05, yb + 0.008, 1.31), rot=(rad(-90), 0, 0))
    for sx in (-1, 1):                                       # latches on the battery box
        add_box(bm, (0.022, 0.012, 0.04), (sx * 0.075, yb + 0.022, 1.105))
    add_box(bm, (0.07, 0.008, 0.028), (0, yb + 0.021, 1.105))
    M.add('pack_metal', bm, 'aluminium', 'chest', smooth=45)
    bm = bm_new()
    for i in range(3):                                       # fan guard spokes + hub
        add_box(bm, (0.098, 0.004, 0.007), (-0.05, yb + 0.016, 1.31), rot=(0, TAU * i / 6, 0))
    add_cyl(bm, 0.016, 0.012, (-0.05, yb + 0.017, 1.31), seg=8, axis='Y')
    for i in range(5):                                       # louvre slats beside the fan
        add_box(bm, (0.085, 0.012, 0.012), (0.07, yb + 0.011, 1.262 + i * 0.024), rot=(rad(35), 0, 0))
    add_box(bm, (0.074, 0.004, 0.015), (-0.058, yb + 0.0105, 1.384))                     # data plate
    add_box(bm, (0.05, 0.004, 0.02), (0.0, yb + 0.02, 1.15))
    M.add('pack_grille', bm, 'plastic_black', 'chest')
    bm = bm_new()
    for i in range(3):
        add_box(bm, (0.014, 0.006, 0.008), (0.045 + i * 0.024, yb + 0.011, 1.385))
    M.add('pack_leds', bm, 'light_white', 'chest')
    # top: carry handle, antenna mounts and whip
    bm = bm_new()
    add_tube(bm, path_points([(-0.07, yc + 0.02, 1.545), (-0.07, yc + 0.022, 1.582), (-0.035, yc + 0.024, 1.596), (0.035, yc + 0.024, 1.596),
                              (0.07, yc + 0.022, 1.582), (0.07, yc + 0.02, 1.545)], 10), 0.008, seg=6)
    add_tube(bm, [(0.135, yc + 0.03, 1.58), (0.137, yc + 0.034, 1.70), (0.14, yc + 0.044, 1.848)], [0.0045, 0.0035, 0.0025], seg=5)
    add_ico(bm, 0.007, (0.14, yc + 0.044, 1.852), subdiv=1)
    M.add('pack_handle', bm, 'aluminium', 'chest', smooth=60)
    bm = bm_new()
    add_lathe(bm, [(0.022, 0.0), (0.022, 0.012), (0.014, 0.02), (0.008, 0.05), (0.006, 0.052)], seg=8, loc=(0.135, yc + 0.03, 1.535))
    add_lathe(bm, [(0.02, 0.0), (0.02, 0.01), (0.016, 0.014), (0.016, 0.075), (0.012, 0.082), (0, 0.082)], seg=8, loc=(-0.135, yc + 0.03, 1.532))
    M.add('pack_antenna_base', bm, 'plastic_black', 'chest', smooth=50)
    # side oxygen bottles, half sunk into the lower corners, with straps
    bm = bm_new()
    for sx in (-1, 1):
        add_pill(bm, 0.047, 0.30, (sx * 0.176, yc + 0.045, 1.175), seg=12)
        add_lathe(bm, [(0.02, 0.0), (0.02, 0.014), (0.012, 0.02), (0.012, 0.035)], seg=8, loc=(sx * 0.176, yc + 0.045, 1.322))
    M.add('pack_bottles', bm, 'aluminium', 'chest', smooth=50)
    bm = bm_new()
    for sx in (-1, 1):
        for z in (1.2,):
            add_lathe(bm, [(0.0485, -0.012), (0.051, -0.009), (0.051, 0.009), (0.0485, 0.012)], seg=12, loc=(sx * 0.176, yc + 0.045, z), cap_start=False, cap_end=False)
    M.add('pack_bottle_straps', bm, 'suit_grey', 'chest', smooth=50)
    # battery / scrubber box at the bottom rear
    bm = bm_new()
    add_box(bm, (0.21, 0.03, 0.10), (0, yb + 0.004, 1.105))
    for sx in (-1, 1):                                       # mounting brackets between pack and torso
        for z in (1.18, 1.42):
            add_box(bm, (0.03, 0.06, 0.05), (sx * 0.12, 0.135, z))
    M.add('pack_battery', bm, 'suit_grey', 'chest', bevel=0.007)
    bm = bm_new()
    for sx in (-1, 1):                                       # corner bumpers
        for z in (1.02, 1.50):
            add_box(bm, (0.05, 0.05, 0.05), (sx * 0.165, yb - 0.018, z))
    M.add('pack_bumpers', bm, 'rubber', 'chest', bevel=0.012)
    # hoses from the pack around the waist to the chest unit
    for sx, nm in ((1, 'L'), (-1, 'R')):
        ctrl = [(sx * 0.178, 0.20, 1.085), (sx * 0.205, 0.15, 1.092), (sx * 0.208, 0.05, 1.11), (sx * 0.198, -0.05, 1.14),
                (sx * 0.172, -0.125, 1.185), (sx * 0.142, -0.168, 1.23), (sx * 0.124, -0.186, 1.252)]
        pts = path_points(ctrl, 14)
        bm = bm_new()
        add_tube(bm, pts, 0.0135, seg=7)
        M.add('hose_' + nm, bm, 'rubber', 'chest', smooth=70)
        bm = bm_new()
        for a, b in ((pts[0], pts[1]), (pts[-1], pts[-2])):
            v = add_lathe(bm, [(0.019, -0.004), (0.019, 0.016), (0.016, 0.02), (0.0145, 0.02)], seg=8, cap_end=False)
            oriented(bm, v, a, (Vector(b) - Vector(a)).normalized())
        for i in (7,):                                      # hose clip along the run
            v = add_lathe(bm, [(0.0155, -0.006), (0.017, -0.004), (0.017, 0.004), (0.0155, 0.006)], seg=8, cap_start=False, cap_end=False)
            oriented(bm, v, pts[i], (pts[i + 1] - pts[i - 1]).normalized())
        M.add('hose_fittings_' + nm, bm, 'aluminium', 'chest', smooth=50)


def group_materials():
    """Materials of the two groups the game shows one at a time above the neck ring. The helmet's
    are copies of the palette materials those pieces always used, under names the game can find
    (helmet_*, visor*); the head's are its own (head_*). Call after reset_scene()."""
    def alias(new, old):
        spec = PALETTE[old]
        kw = dict(color=spec[0], metallic=spec[1], roughness=spec[2])
        if len(spec) > 3 and spec[3]:
            kw.update(emissive=spec[3], strength=spec[4])
        mat(new, **kw)
    alias('helmet_white', 'painted_white')     # shell, ear hubs, vent, visor frame; tinted for the stripe and the neck bellows
    alias('helmet_dark', 'plastic_black')      # lamp pods, camera pod, vent slots, visor gasket
    alias('helmet_metal', 'aluminium')         # base ring, hub bolts, lamp bezels, camera lens
    alias('helmet_light', 'light_white')       # lamp lenses (emissive)
    mat('head_skin', color=SKIN, metallic=0.0, roughness=0.62)
    mat('head_cap', color=(0.80, 0.79, 0.76), metallic=0.0, roughness=0.88)       # cap fabric, undershirt collar, eye whites
    mat('head_dark', color=(0.060, 0.056, 0.052), metallic=0.0, roughness=0.60)   # hair, brows, eyes, ear pieces, strap, microphone


SKIN = (0.62, 0.37, 0.26)
STRIPE_TINT = tuple(o / w for o, w in zip(PALETTE['suit_orange'][0], PALETTE['painted_white'][0]))     # orange paint on the white shell
DAM_TINT = tuple(g / w * b for g, w, b in zip(PALETTE['suit_grey'][0], PALETTE['painted_white'][0], BELLOWS))


def build_helmet(M):
    """Everything that comes off with the helmet (materials helmet_* and visor_gold)."""
    c = HELMET_C
    PHI_TOP, PHI_CHIN = 36 * D2R, -50 * D2R
    psis = [(20 + 140 * j / 14) * D2R for j in range(15)]
    # gold bubble visor: a true spherical cap (radius R_VISOR about the helmet centre) in cells of
    # about 6 degrees, with exact radial normals, set 12 mm back from the face of its frame. Its
    # edges run under the frame above and below and under the ear hubs at the sides, and the
    # poles of its grid lie under the hubs.
    bm = bm_new()
    sphere_patch(bm, lambda i, j: R_VISOR, frange(PHI_CHIN - 2.4 * D2R, PHI_TOP + 2.4 * D2R, VISOR_ROWS),
                 [(22 + 136 * j / VISOR_COLS) * D2R for j in range(VISOR_COLS + 1)])
    M.add('visor', bm, 'visor_gold', 'head', smooth=180, normal=lambda p: (Vector(p) - c).normalized())
    # white protective shell: over the top and back, and the chin band; cut flat at the neck
    bm = bm_new()
    sphere_patch(bm, lambda i, j: R_SHELL, frange(PHI_TOP, (360 + PHI_CHIN / D2R) * D2R, 24), psis)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 1.562), plane_no=(0, 0, -1), clear_outer=True)
    M.add('helmet_shell', bm, 'helmet_white', 'head', smooth=180)
    # visor frame: a raised white band on the shell along the top and bottom of the opening, and
    # inside it a black gasket whose wall drops to the visor (the ear hubs close the sides)
    for nm, phi0, sg in (('top', PHI_TOP, 1.0), ('chin', PHI_CHIN, -1.0)):
        frame = [(5.3, R_SHELL - 0.0018), (4.7, R_SHELL + 0.0044), (1.5, R_SHELL + 0.0046)]
        gasket = [(1.5, R_SHELL + 0.0046), (0.4, R_SHELL + 0.0044), (-0.2, R_SHELL + 0.0012), (-0.9, R_VISOR - 0.0014)]
        for piece, rows, material, tint in (('visor_frame_', frame, 'helmet_white', (0.9, 0.9, 0.9)), ('visor_gasket_', gasket, 'helmet_dark', (1.0, 1.0, 1.0))):
            bm = bm_new()
            sphere_patch(bm, lambda i, j, _r=rows: _r[i][1], [phi0 + sg * d * D2R for d, _ in rows], psis)
            M.add(piece + nm, bm, material, 'head', smooth=50, tint=tint)
    # ear hubs (the visor pivots) and lamp pods
    bm = bm_new()
    add_lathe(bm, [(0.064, -0.012), (0.064, 0.004), (0.056, 0.012), (0.034, 0.014), (0.034, 0.008), (0.0, 0.008)], seg=16,
              loc=(c.x + 0.163, c.y, c.z), axis='X')
    M.add('ear_hub_L', bm, 'helmet_white', 'head', mirror=True, smooth=45, tint=(0.86, 0.86, 0.86))
    bm = bm_new()
    add_lathe(bm, [(0.03, 0.0), (0.03, 0.012), (0.024, 0.016), (0.0, 0.016)], seg=10, loc=(c.x + 0.171, c.y, c.z), axis='X', cap_start=False)
    add_lathe(bm, [(0.0215, 0.0), (0.0215, 0.007), (0.018, 0.007)], seg=12, loc=LAMP_C + Vector((0, -0.039, 0)), rot=(rad(90), 0, 0), cap_end=False, cap_start=False)
    M.add('ear_bolt_L', bm, 'helmet_metal', 'head', mirror=True, smooth=45)
    bm = bm_new()
    add_box(bm, (0.05, 0.078, 0.05), LAMP_C)
    add_box(bm, (0.026, 0.05, 0.05), LAMP_C + Vector((-0.012, 0.03, -0.045)))    # bracket down to the hub
    M.add('lamp_body_L', bm, 'helmet_dark', 'head', mirror=True, bevel=0.007)
    bm = bm_new()
    add_lathe(bm, [(0.018, 0.0), (0.015, 0.0045), (0.0, 0.006)], seg=12, loc=LAMP_C + Vector((0, -0.042, 0)), rot=(rad(90), 0, 0), cap_start=False)
    M.add('lamp_lens_L', bm, 'helmet_light', 'head', mirror=True, smooth=60)
    # orange identification stripe over the crown, front to back (paint on the shell)
    bm = bm_new()
    ps = [80 * D2R, 80.4 * D2R, 90 * D2R, 99.6 * D2R, 100 * D2R]
    rr = [R_SHELL - 0.002, R_SHELL + 0.0035, R_SHELL + 0.0035, R_SHELL + 0.0035, R_SHELL - 0.002]
    sphere_patch(bm, lambda i, j: rr[j] - 0.001 if 0 < i < 15 else R_SHELL - 0.002, [(PHI_TOP + 7 * D2R)] + frange(PHI_TOP + 7.4 * D2R, 195.6 * D2R, 13) + [196 * D2R], ps)
    M.add('helmet_stripe', bm, 'helmet_white', 'head', smooth=60, tint=STRIPE_TINT)
    # forehead camera pod and rear ventilation housing
    bm = bm_new()
    pc = sph(R_SHELL + 0.012, PHI_TOP + 14.5 * D2R, 90 * D2R)
    add_box(bm, (0.06, 0.05, 0.034), pc, rot=(rad(-40), 0, 0))
    M.add('cam_pod', bm, 'helmet_dark', 'head', bevel=0.006)
    bm = bm_new()
    add_lathe(bm, [(0.012, 0.0), (0.012, 0.006), (0.009, 0.008), (0.0, 0.007)], seg=8, loc=pc + Euler((rad(-40), 0, 0)).to_matrix() @ Vector((0.012, -0.025, 0.0)),
              rot=(rad(90 - 40), 0, 0), cap_start=False)
    M.add('cam_lens', bm, 'helmet_metal', 'head', smooth=50)
    bm = bm_new()
    rv = lambda i, j: R_SHELL + (-0.002 if i in (0, 5) or j in (0, 7) else 0.012)  # noqa: E731
    sphere_patch(bm, rv, [204 * D2R, 204.6 * D2R, 211 * D2R, 220 * D2R, 228.4 * D2R, 229 * D2R],
                 [x * D2R for x in (56, 56.6, 70, 83, 97, 110, 123.4, 124)])
    M.add('helmet_vent', bm, 'helmet_white', 'head', smooth=40, tint=(0.84, 0.84, 0.84))
    bm = bm_new()
    for k in range(3):
        add_tube(bm, [sph(R_SHELL + 0.0135, (210.5 + k * 5.5) * D2R, pz * D2R) for pz in (68, 79, 90, 101, 112)], 0.003, seg=4)
    M.add('helmet_vent_slots', bm, 'helmet_dark', 'head', smooth=100)
    # helmet base ring (turns with the head) and the flexible neck bellows under it, which
    # lifts off the suit's neck ring with the helmet
    bm = bm_new()
    add_lathe(bm, [(0.118, -0.016), (0.129, -0.016), (0.134, -0.009), (0.134, 0.004), (0.127, 0.012), (0.12, 0.012)], seg=24,
              loc=(0, -0.008, 1.562), cap_start=False, cap_end=False)
    M.add('helmet_base', bm, 'helmet_metal', 'head', smooth=50)
    neck = Tube(TORSO_FRAME, stations=[(1.49, 0.122, 0.122, 0, 0.002, 2.0), (1.56, 0.120, 0.120, 0, -0.006, 2.0)],
                mod=ribs(1.495, 0.02, 0.005))
    bm = bm_new()
    neck.loft(bm, frange(1.495, 1.555, 6), seg=16)
    M.add('neck_dam', bm, 'helmet_white', w_neck, smooth=80, tint=DAM_TINT)


VISOR_ROWS, VISOR_COLS = 12, 22          # cells across the visor (pitch, ear to ear)

LAMP_C = Vector((HELMET_C.x + 0.172, HELMET_C.y - 0.052, HELMET_C.z + 0.088))


# ==============================================================================================
# The bare head (materials head_*): the game shows it in place of the helmet indoors.
#
# A man in his thirties in a communications cap: a white centre panel from forehead to nape,
# dark side panels carrying the earphone cups, a chin strap and a boom microphone; short dark
# hair shows at the forehead, the temples and the nape. Forms are clean and slightly simplified,
# to sit with the suit and to read from three metres. The skin is a grid whose columns and rows
# are placed on the features (nose, lips, eye sockets, brow), shaped by a midline profile and a
# few bumps, and shaded a little by hand in its vertex colours. Cap and hair are shells over the
# skull whose edges turn in and end under the surface below, so no back face is ever exposed
# (the game draws front faces only). The head stays inside the helmet with room to spare.
# ==============================================================================================
HEAD_CY = 0.004                        # y of the widest part of the skull
Z_DOME, Z_CROWN = 1.715, 1.798         # above Z_DOME the skull is half an ellipsoid
Z_CHIN, Z_FTOP = 1.574, 1.746          # chin point; top row of the face grid (under the hair)
Z_MOUTH = 1.6145
EYE_X, EYE_Z, EYE_Y, EYE_SLOPE = 0.032, 1.679, -0.0815, 0.20      # the flat floor of the eye socket
HEAD_A = Curve([(1.574, 0.0470), (1.590, 0.0515), (1.604, 0.0555), (1.615, 0.0590), (1.630, 0.0640), (1.655, 0.0695), (1.680, 0.0730), (1.700, 0.0762), (1.715, 0.0775)])
HEAD_YB = Curve([(1.590, 0.0720), (1.600, 0.0750), (1.610, 0.0790), (1.630, 0.0880), (1.660, 0.0960), (1.690, 0.0995), (1.715, 0.1000)])
HEAD_YF = Curve([  # the face beside the nose: height, y of the front of the cross-section
    (1.574, -0.0835), (1.580, -0.0880), (1.588, -0.0905), (1.598, -0.0905), (1.607, -0.0930), (1.6145, -0.0940), (1.623, -0.0952), (1.634, -0.0960),
    (1.645, -0.0965), (1.655, -0.0960), (1.665, -0.0945), (1.674, -0.0930), (1.680, -0.0930), (1.688, -0.0965), (1.695, -0.1000), (1.705, -0.1005), (1.715, -0.1000)])
HEAD_YM = Curve([  # the profile on the midline: chin, lips, nose, brow
    (1.574, -0.0835), (1.580, -0.0905), (1.587, -0.0940), (1.594, -0.0925), (1.600, -0.0900), (1.6055, -0.0975), (1.610, -0.0990), (1.6145, -0.0945),
    (1.6185, -0.1000), (1.623, -0.1010), (1.630, -0.0988), (1.634, -0.1010), (1.6375, -0.1175), (1.6415, -0.1228), (1.646, -0.1210), (1.655, -0.1148),
    (1.665, -0.1075), (1.674, -0.1005), (1.680, -0.0975), (1.688, -0.0992), (1.695, -0.1020), (1.705, -0.1010), (1.715, -0.1000)])
FACE_W = Curve([  # half-width of whatever stands out on the midline at each height
    (1.574, 0.018), (1.587, 0.019), (1.600, 0.022), (1.6055, 0.024), (1.6145, 0.027), (1.623, 0.024), (1.630, 0.012), (1.634, 0.0150), (1.637, 0.0170),
    (1.641, 0.0150), (1.646, 0.0135), (1.655, 0.0125), (1.665, 0.0115), (1.674, 0.0110), (1.680, 0.0115), (1.688, 0.014), (1.695, 0.018), (1.715, 0.020)])
FACE_ZS = [1.579, 1.588, 1.597, 1.6045, 1.6100, Z_MOUTH, 1.6190, 1.6245, 1.631, 1.6345, 1.638, 1.643, 1.652, 1.662, 1.6725, 1.679, 1.6855, 1.694, 1.706, 1.724, Z_FTOP]
FACE_XS = [0.0, 0.0065, 0.0135, 0.0205, 0.0285, 0.0365, 0.0445, 0.054, 0.0645]       # columns on the face (x at eye level)
FACE_TH = [math.asin((x / 0.0730) ** 1.4) for x in FACE_XS] + [76 * D2R, 90 * D2R]
BACK_TH = [84 * D2R, 99 * D2R, 112 * D2R, 126 * D2R, 142 * D2R, 160 * D2R, 180 * D2R]
CAP_C = Vector((0.0, 0.006, 1.676))      # between the ears: the cap's panels are laid out round this axis
CAP_PSI = [24, 28, 35, 45, 60, 75, 90, 105, 120, 135, 145, 152, 156]     # columns, degrees from the left ear
CAP_PF = Curve([(0, 38), (15, 37), (30, 34), (45, 27), (55, 10), (62, -20), (66, -45)])        # front edge: pitch against degrees off the midline
CAP_PB = Curve([(0, 211), (15, 213), (30, 218), (45, 228), (55, 238), (62, 247), (66, 256)])   # back edge
CAP_ROWS = 10
CAP_T = 0.0055                           # thickness of the cap over the skull
HAIR_F = Curve([(0, 0.0175), (15, 0.0150), (30, 0.0125), (45, 0.0160), (55, 0.0170), (62, 0.0120), (66, 0.0040)])    # hair showing in front of the cap
HAIR_B = Curve([(0, 0.0230), (15, 0.0230), (30, 0.0215), (45, 0.0170), (55, 0.0100), (62, 0.0030), (66, 0.0010)])    # and below it at the nape
HAIR_TINT = (0.62, 0.42, 0.30)           # dark brown, out of the warm grey of head_dark
FLAP_TINT = (0.52, 0.52, 0.56)           # charcoal side panels, cups, strap and microphone


def head_sec(z):
    """Cross-section of the bare skull at height z: half-width, front y, back y, squareness.
    The face is flatter across the front than the jaw or the cranium."""
    if z >= Z_DOME:
        k = math.sqrt(max(1.0 - ((z - Z_DOME) / (Z_CROWN - Z_DOME)) ** 2, 0.0))
        return 0.0775 * k, HEAD_CY - 0.104 * k, HEAD_CY + 0.096 * k, 2.2
    zz = max(z, Z_CHIN)
    n = 2.2 + 0.6 * smooth01((z - 1.595) / 0.04) * (1.0 - smooth01((z - 1.685) / 0.03))
    return float(HEAD_A(zz)[0]), float(HEAD_YF(zz)[0]), float(HEAD_YB(max(z, 1.59))[0]), n


def head_base(th, z):
    """Point on the skull. th = 0 is the front (-Y), +90 degrees his left (+X)."""
    a, yf, yb, n = head_sec(z)
    c, s, e = math.cos(th), math.sin(th), 2.0 / n
    return Vector((a * spow(s, e), HEAD_CY - spow(c, e) * ((HEAD_CY - yf) if c >= 0 else (yb - HEAD_CY)), z))


def head_normal(th, z):
    d = 1e-3
    pt = head_base(th + d, z) - head_base(th - d, z)
    pz = head_base(th, min(z + d, Z_CROWN - 1e-5)) - head_base(th, z - d)
    n = pt.cross(pz)
    return n.normalized() if n.length > 1e-12 else Vector((0, 0, 1))


def skull_frame(phi, psi):
    """The skull seen from the point between the ears: where the ray at pitch phi (from forward
    towards up) and angle psi from the left ear leaves it, the outward normal there, and the
    direction along the surface in which phi grows."""
    def hit(ph, ps):
        d = Vector((math.cos(ps), -math.sin(ps) * math.cos(ph), math.sin(ps) * math.sin(ph)))
        lo, hi = 0.02, 0.16
        for _ in range(34):
            mid = (lo + hi) / 2
            p = CAP_C + d * mid
            a, yf, yb, n = head_sec(p.z)
            b = (HEAD_CY - yf) if p.y < HEAD_CY else (yb - HEAD_CY)
            inside = p.z < Z_CROWN and a > 1e-6 and abs(p.x / a) ** n + abs((p.y - HEAD_CY) / b) ** n < 1.0
            lo, hi = (mid, hi) if inside else (lo, mid)
        return CAP_C + d * lo
    e = 0.012
    p = hit(phi, psi)
    dphi = hit(phi + e, psi) - hit(phi - e, psi)
    n = dphi.cross(hit(phi, psi + e) - hit(phi, psi - e)).normalized()
    return p, (n if n.dot(p - CAP_C) > 0 else -n), dphi.normalized()


def head_seam_normal(p):
    """Exact skull normal for the skin either side of the seam under each ear (the edge of the
    face lies over the band round the back there), so the two shade as one surface. Elsewhere
    (0, 0, 0): Blender's own normal."""
    a, yf, yb, n = head_sec(p.z)
    b = (HEAD_CY - yf) if p.y < HEAD_CY else (yb - HEAD_CY)
    th = math.atan2(spow(p.x / a, n / 2), spow((HEAD_CY - p.y) / b, n / 2))
    if abs(th) < 83 * D2R or abs(th) > 100 * D2R or p.z < jaw_z(th) + 0.006:
        return Vector((0.0, 0.0, 0.0))
    return head_normal(th, p.z)


def jaw_z(th):
    """Height of the jawline: the chin in front, rising to the angle of the jaw under the ear,
    then dropping a little to the nape."""
    a = abs(th)
    if a <= math.pi / 2:
        return Z_CHIN + 0.030 * math.sin(a) ** 1.5
    return Z_CHIN + 0.030 - 0.008 * smooth01((a - 105 * D2R) / (50 * D2R))


def face_row_z(th, zf):
    """Rows are level on the midline and close up towards the sides, where the jaw is higher."""
    zj = jaw_z(th)
    return zj + (zf - Z_CHIN) / (Z_FTOP - Z_CHIN) * (Z_FTOP - zj)


def eye_floor(ax, z):
    """1 on the flat floor of the eye socket, 0 outside it."""
    wx = smooth01((ax - 0.0140) / 0.0055) * (1.0 - smooth01((ax - 0.0460) / 0.0070))
    wz = smooth01((z - 1.6630) / 0.0085) * (1.0 - smooth01((z - 1.6865) / 0.0065))
    return wx * wz


def face_point(th, z):
    """The skin: the skull plus nose, lips, chin, brow, cheekbones and eye sockets."""
    p = head_base(th, z)
    ax = abs(p.x)
    fwd = 0.0
    u = ax / float(FACE_W(z)[0])
    if u < 1.0 and z < Z_DOME:
        fwd += float(HEAD_YF(max(z, Z_CHIN))[0] - HEAD_YM(max(z, Z_CHIN))[0]) * (1.0 - u * u) ** 1.5
    fwd += 0.0065 * math.exp(-((ax - 0.0135) / 0.0055) ** 2 - ((z - 1.6385) / 0.0045) ** 2)                     # wings of the nose
    fwd += 0.0040 * math.exp(-((z - 1.6955) / 0.0060) ** 2) * smooth01((ax - 0.004) / 0.012) * (1.0 - smooth01((ax - 0.050) / 0.02))   # brow ridge
    fwd += 0.0028 * math.exp(-((ax - 0.046) / 0.014) ** 2 - ((z - 1.650) / 0.011) ** 2)                         # cheekbones
    fwd -= 0.0015 * math.exp(-((ax - 0.028) / 0.006) ** 2 - ((z - Z_MOUTH - 0.001) / 0.007) ** 2)               # corners of the mouth
    y = p.y - fwd
    w = eye_floor(ax, z)
    if w > 0.0:
        y = lerp(y, EYE_Y + (ax - EYE_X) * EYE_SLOPE, w)
    return Vector((p.x, y, p.z))


def head_jaw(th):
    """The jawline, eased in a little so the edge of the jaw is rounded."""
    p = face_point(th, jaw_z(th))
    d = Vector((p.x, p.y - 0.012, 0.0))
    return p - d.normalized() * 0.0025


def head_ledge(th):
    """Under the jaw: inwards from the jawline to a loop that ends inside the neck."""
    j = head_jaw(th)
    return Vector((j.x * 0.55, 0.014 + (j.y - 0.014) * 0.55, j.z + 0.004))


NECK = Curve([(1.492, 0.0200, 0.0610, 0.0630), (1.516, 0.0185, 0.0590, 0.0615), (1.540, 0.0165, 0.0570, 0.0600), (1.565, 0.0150, 0.0560, 0.0590),
              (1.592, 0.0140, 0.0530, 0.0580), (1.620, 0.0130, 0.0470, 0.0540)])


def neck_pt(th, z, d=0.0):
    cy, rx, ry = NECK(z)
    c, s = math.cos(th), math.sin(th)
    return Vector((rx * s, cy - ry * c, z)) + Vector((s / rx, -c / ry, 0.0)).normalized() * d


def w_headneck(p):
    """Neck skin and undershirt collar: chest at the collar, the neck bone, the head at the jaw."""
    a = smooth01((p.z - 1.498) / 0.030)
    b = smooth01((p.z - 1.545) / 0.045)
    return {'chest': 1 - a, 'neck': a * (1 - b), 'head': a * b}


def skin_tint(p):
    """Hand shading in the vertex colours: lips and the line between them, the shadow under the
    brow and the nose, a shaved jaw, a little colour in the cheeks."""
    ax, z = abs(p.x), p.z
    if p.y > -0.055:
        return (1.0, 1.0, 1.0)

    def g(cx, cz, sx, sz):
        return math.exp(-((ax - cx) / sx) ** 2 - ((z - cz) / sz) ** 2)
    col = Vector((1.0, 1.0, 1.0))
    line = 1.628 + 0.034 * smooth01((ax - 0.028) / 0.036)
    nose = (1.0 - smooth01((ax - 0.012) / 0.008)) * smooth01((z - 1.631) / 0.004)
    lip = (1.0 - smooth01((ax - 0.014) / 0.012)) * smooth01((z - 1.6045) / 0.005) * (1.0 - smooth01((z - 1.6190) / 0.0055))
    col = col.lerp(Vector((0.80, 0.84, 0.88)), 0.55 * (1.0 - smooth01((z - line) / 0.012)) * (1.0 - lip) * (1.0 - nose))    # shaved jaw
    col = col.lerp(Vector((1.00, 0.88, 0.86)), 0.6 * g(0.044, 1.640, 0.018, 0.013))                                         # cheeks
    col = col.lerp(Vector((0.80, 0.72, 0.72)), 0.9 * g(0.030, 1.6845, 0.017, 0.0055))                                       # under the brow
    col = col.lerp(Vector((0.82, 0.74, 0.74)), 0.8 * g(0.0135, 1.660, 0.0045, 0.013))                                       # sides of the nose
    col = col.lerp(Vector((0.50, 0.36, 0.35)), g(0.0080, 1.6355, 0.0050, 0.0028))                                           # nostrils
    col = col.lerp(Vector((0.86, 0.62, 0.61)), lip)
    return tuple(col)


def ribbon(bm, pts, nrms, hw, lift, sink=0.0015, flat=0.55, out_from=None):
    """A strap lying on a surface, through stations `pts` with surface normals `nrms`: half-width
    hw and height `lift` (numbers or one per station); both edges end `sink` under the surface."""
    n = len(pts)
    hws = hw if isinstance(hw, (list, tuple)) else [hw] * n
    lifts = lift if isinstance(lift, (list, tuple)) else [lift] * n
    rows = []
    for i in range(n):
        t = (Vector(pts[min(i + 1, n - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        nn = Vector(nrms[i]).normalized()
        ac = t.cross(nn).normalized()
        p = Vector(pts[i])
        rows.append([p - ac * hws[i] - nn * sink, p - ac * hws[i] * flat + nn * lifts[i], p + ac * hws[i] * flat + nn * lifts[i], p + ac * hws[i] - nn * sink])
    return grid(bm, rows, cap_first=True, cap_last=True, out_from=out_from)


def grid_cells(bm, P, cells, out_from=None):
    """Quads for some cells (row, column) of a grid of points P, so one grid can be shared out
    between pieces of different colours with a clean line between them."""
    made, faces = {}, []

    def vert(r, c):
        if (r, c) not in made:
            made[(r, c)] = bm.verts.new(P[r][c])
        return made[(r, c)]
    for r, c in cells:
        try:
            faces.append(bm.faces.new((vert(r, c), vert(r, c + 1), vert(r + 1, c + 1), vert(r + 1, c))))
        except ValueError:
            pass
    if out_from is not None and faces:
        tot = 0.0
        for f in faces:
            f.normal_update()
            tot += f.normal.dot(f.calc_center_median() - Vector(out_from)) * f.calc_area()
        if tot < 0:
            bmesh.ops.reverse_faces(bm, faces=faces)


def build_head(M):
    C0 = Vector((0.0, HEAD_CY, 1.67))                     # a point inside the head, for winding

    # ---- skin: the face down to the jawline and under it; a low band round the back for the
    # cap and the hair to end on (its first column lies just under the edge of the face); the
    # neck is a separate tube that runs up inside the jaw
    ths = [-t for t in reversed(FACE_TH[1:])] + FACE_TH
    rows = [[head_ledge(th) for th in ths], [head_jaw(th) for th in ths]] + [[face_point(th, face_row_z(th, zf)) for th in ths] for zf in FACE_ZS]
    bm = bm_new()
    grid(bm, rows, out_from=C0)
    M.add('head_face', bm, 'head_skin', 'head', smooth=58, tint=skin_tint, soft_ao=0.35, normal=head_seam_normal)
    ths = BACK_TH + [-t for t in reversed(BACK_TH[:-1])]

    def band_pt(th, dz):
        p = head_base(th, jaw_z(th) + dz)
        if abs(abs(th) - BACK_TH[0]) < 1e-6:
            p -= head_normal(th, jaw_z(th) + dz) * 0.0012
        return p
    rows = [[head_ledge(th) for th in ths], [head_jaw(th) for th in ths]] + [[band_pt(th, dz) for th in ths] for dz in (0.010, 0.026, 0.050)]
    bm = bm_new()
    grid(bm, rows, out_from=C0)
    M.add('head_nape', bm, 'head_skin', 'head', smooth=180, soft_ao=0.35, normal=head_seam_normal)
    bm = bm_new()
    ths = [TAU * j / 12 for j in range(12)]
    grid(bm, [[neck_pt(th, z) for th in ths] for z in (1.492, 1.516, 1.540, 1.565, 1.592, 1.620)], close_u=True, out_from=(0, 0.015, 1.55))
    M.add('head_neck', bm, 'head_skin', w_headneck, smooth=180, soft_ao=0.35)
    # collar of the cooling undershirt round the base of the neck
    bm = bm_new()
    grid(bm, [[neck_pt(th, z, d) for th in ths] for z, d in ((1.498, 0.0110), (1.530, 0.0105), (1.5385, 0.0055), (1.531, -0.0020))],
         close_u=True, out_from=(0, 0.018, 1.52))
    M.add('head_collar', bm, 'head_cap', w_headneck, smooth=60, tint=(0.9, 0.9, 0.9))

    # ---- eyes: a shallow lens on the flat floor of each socket; the white ring and the iris
    # share an outline, the rim of the lens ends under the skin, and a dark line marks the upper lid
    n_e = Vector((EYE_SLOPE, -1.0, 0.0)).normalized()
    u_e = Vector((1.0, EYE_SLOPE, 0.0)).normalized()
    o_e = Vector((EYE_X, EYE_Y, EYE_Z))
    A, HT, HB = 0.0155, 0.0061, 0.0052

    def eye_pt(u, v, h):
        return o_e + u_e * u + Vector((0, 0, 1)) * v + n_e * h
    us = [1.0, 0.62, 0.0, -0.62, -1.0]
    rim = [(A * 1.12 * k, HT * 1.25 * (1 - k * k)) for k in us] + [(A * 1.12 * k, -HB * 1.3 * (1 - k * k)) for k in us[-2:0:-1]]      # 8 points, anticlockwise from the outer corner
    ir, icv = 0.0054, 0.0006
    iris = []
    for k in range(8):
        a = TAU * k / 8
        u, v = ir * math.cos(a), icv + ir * math.sin(a)
        v = min(max(v, -HB * (1 - (u / A) ** 2) + 0.0002), HT * (1 - (u / A) ** 2) - 0.0002)       # the lids cut the iris off
        iris.append((u, v))
    bm = bm_new()
    ring0 = [bm.verts.new(eye_pt(u, v, -0.0016)) for u, v in rim]
    ring1 = [bm.verts.new(eye_pt(u, v, 0.0017)) for u, v in iris]
    for k in range(8):
        bm.faces.new((ring0[k], ring0[(k + 1) % 8], ring1[(k + 1) % 8], ring1[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if sum(f.normal.dot(n_e) for f in bm.faces) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    M.add('eye_white_L', bm, 'head_cap', 'head', mirror=True, smooth=180, tint=(0.95, 0.93, 0.91))
    bm = bm_new()
    ring1 = [bm.verts.new(eye_pt(u, v, 0.0017)) for u, v in iris]
    pupil = eye_pt(0.0, icv, 0.0021)
    cv = bm.verts.new(pupil)
    for k in range(8):
        bm.faces.new((ring1[k], ring1[(k + 1) % 8], cv))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if sum(f.normal.dot(n_e) for f in bm.faces) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    M.add('eye_iris_L', bm, 'head_dark', 'head', mirror=True, smooth=180,
          tint=lambda p, _c=pupil: (0.12, 0.12, 0.12) if (Vector(p) - _c).length < 1e-4 else (0.95, 0.62, 0.38))
    bm = bm_new()
    ks = (0.90, 0.5, 0.0, -0.55, -0.97)
    ribbon(bm, [eye_pt(A * 0.99 * k, HT * 1.02 * (1 - k * k) - 0.0002, 0.0) for k in ks], [n_e] * 5, [0.0007, 0.0012, 0.0013, 0.0011, 0.0006], 0.0013,
           sink=0.0012, out_from=o_e - n_e * 0.02)
    M.add('eye_lid_L', bm, 'head_dark', 'head', mirror=True, smooth=60, tint=(0.45, 0.32, 0.26))
    # the line between the lips: a thin dark strip in the crease, through the vertices of that row
    ths = [-t for t in reversed(FACE_TH[1:4])] + FACE_TH[:4]
    bm = bm_new()
    ribbon(bm, [face_point(th, face_row_z(th, Z_MOUTH)) for th in ths], [Vector((0, -1, 0))] * 7, [0.0006, 0.0010, 0.0012, 0.0013, 0.0012, 0.0010, 0.0006], 0.0007,
           sink=0.0012, out_from=C0)
    M.add('mouth_line', bm, 'head_dark', 'head', smooth=60, tint=(0.62, 0.30, 0.26))
    # nostrils: two small dark ovals under the tip of the nose, lying on that row of the grid
    bm = bm_new()
    for sgn in (1, -1):
        th = sgn * FACE_TH[1]
        a, b = face_point(th, face_row_z(th, FACE_ZS[9])), face_point(th, face_row_z(th, FACE_ZS[10]))
        n = (b - a).cross(Vector((sgn, 0, 0))).normalized()
        n = -n if n.z > 0 else n
        side = Vector((sgn * 0.0012, 0, 0))
        ribbon(bm, [a.lerp(b, 0.12) + side, a.lerp(b, 0.48) + side * 1.6, a.lerp(b, 0.80) + side], [n] * 3, [0.0010, 0.0021, 0.0012], 0.0004, sink=0.0010, out_from=C0)
    M.add('nostrils', bm, 'head_dark', 'head', smooth=60, tint=(0.50, 0.26, 0.22))
    # eyebrows: low dark ridges on the brow
    bm = bm_new()
    pts, nrm = [], []
    for k, x in enumerate((0.0105, 0.021, 0.033, 0.044, 0.052)):
        z = 1.6965 + 0.0032 * math.sin(math.pi * k / 4.7) - 0.0010 * (k == 4)
        a, _, _, n = head_sec(z)
        th = math.asin(min(1.0, (x / a) ** (n / 2)))
        pts.append(face_point(th, z))
        nrm.append(head_normal(th, z))
    ribbon(bm, pts, nrm, [0.0030, 0.0033, 0.0030, 0.0023, 0.0014], 0.0015, sink=0.0022, out_from=C0)
    M.add('brow_L', bm, 'head_dark', 'head', mirror=True, smooth=60, tint=HAIR_TINT)

    # ---- the cap: a shell over the skull laid out round the axis through the ears, from its
    # front edge over the top to its back edge, with a rolled hem along both that ends under
    # the hair or the skin. Its ends lie under the earphone cups. The cells of the two side
    # panels are pieces of their own in the dark material, so the seams are clean lines.
    nc = len(CAP_PSI)
    off = [abs(ps - 90.0) for ps in CAP_PSI]
    fr = [[skull_frame(lerp(float(CAP_PF(o)[0]), float(CAP_PB(o)[0]), i / CAP_ROWS) * D2R, ps * D2R) for ps, o in zip(CAP_PSI, off)] for i in range(CAP_ROWS + 1)]

    def edge(row, sgn):
        """Edge points, normals and the direction along the skull away from the cap."""
        E = [f[0] for f in row]
        N = [f[1] for f in row]
        D = []
        for j in range(nc):
            d = (E[min(j + 1, nc - 1)] - E[max(j - 1, 0)]).normalized().cross(N[j]).normalized()
            D.append(d if d.dot(row[j][2]) * sgn > 0 else -d)
        return E, N, D
    Ef, Nf, Df = edge(fr[0], -1.0)
    Eb, Nb, Db = edge(fr[-1], 1.0)
    P = [[Ef[j] + Df[j] * 0.0024 - Nf[j] * 0.0016 for j in range(nc)], [Ef[j] + Df[j] * 0.0030 + Nf[j] * 0.0034 for j in range(nc)]]
    P += [[f[0] + f[1] * CAP_T for f in row] for row in fr]
    P += [[Eb[j] + Db[j] * 0.0030 + Nb[j] * 0.0034 for j in range(nc)], [Eb[j] + Db[j] * 0.0024 - Nb[j] * 0.0016 for j in range(nc)]]
    side = [j for j in range(nc - 1) if max(off[j], off[j + 1]) > 30.5]
    for nm, cols, material, tint in (('cap_crown', [j for j in range(nc - 1) if j not in side], 'head_cap', (1.0, 1.0, 1.0)),
                                     ('cap_side_L', [j for j in side if CAP_PSI[j] < 90], 'head_dark', FLAP_TINT),
                                     ('cap_side_R', [j for j in side if CAP_PSI[j] > 90], 'head_dark', FLAP_TINT)):
        bm = bm_new()
        grid_cells(bm, P, [(r, j) for r in range(len(P) - 1) for j in cols], out_from=C0)
        M.add(nm, bm, material, 'head', smooth=70, tint=tint)
    # short hair showing beyond the cap: bands that start under the hem and end in the skin
    for nm, (E, N, D), width in (('hair_front', (Ef, Nf, Df), HAIR_F), ('hair_nape', (Eb, Nb, Db), HAIR_B)):
        wd = [float(width(o)[0]) for o in off]
        bm = bm_new()
        grid(bm, [[E[j] - D[j] * 0.0060 + N[j] * 0.0020 for j in range(nc)],
                  [E[j] + D[j] * max(wd[j] - 0.0028, 0.0004) + N[j] * 0.0036 for j in range(nc)],
                  [E[j] + D[j] * max(wd[j], 0.0008) - N[j] * 0.0024 for j in range(nc)]], out_from=C0)
        M.add(nm, bm, 'head_dark', 'head', smooth=70, tint=HAIR_TINT)
    # earphone cups over the ears, at the ends of the cap
    p = skull_frame(0.0, 0.0)[0]
    n = sum((skull_frame(TAU * k / 3, 8 * D2R)[1] for k in range(3)), Vector()).normalized()
    bm = bm_new()
    v = add_lathe(bm, [(0.034, -0.0085), (0.034, 0.0065), (0.026, 0.0125), (0.0, 0.0140)], seg=12, cap_start=False)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((1.12, 1.0, 1.0, 1.0)), verts=v)
    oriented(bm, v, p + n * (CAP_T - 0.0005), n, x_hint=(0, 0, 1))
    if sum(f.normal.dot(f.calc_center_median() - p) for f in bm.faces if not f.normal_update()) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    M.add('ear_cup_L', bm, 'head_dark', 'head', mirror=True, smooth=50, tint=FLAP_TINT)
    # chin strap: from under each cup down the jaw and under the chin
    pts, nrm = [], []
    for a in (86, 78, 66, 52, 38, 20, 0, -20, -38, -52, -66, -78, -86):
        th = a * D2R
        k = smooth01((62 - abs(a)) / 28.0)                 # 0 on the side of the jaw, 1 underneath
        up = lerp(0.044, 0.004, smooth01((86 - abs(a)) / 26.0))
        pts.append(face_point(th, jaw_z(th) + up).lerp(head_jaw(th).lerp(head_ledge(th), 0.30), k))
        nrm.append(head_normal(th, jaw_z(th) + up).lerp(Vector((0, 0, -1)), k).normalized())
    bm = bm_new()
    ribbon(bm, pts, nrm, 0.0058, 0.0020, sink=0.0030, out_from=C0)
    M.add('chin_strap', bm, 'head_dark', 'head', smooth=60, tint=FLAP_TINT)
    # boom microphone from the left cup to the corner of the mouth
    bm = bm_new()
    add_tube(bm, path_points([(0.086, -0.010, 1.652), (0.091, -0.034, 1.638), (0.083, -0.066, 1.624), (0.062, -0.094, 1.616), (0.037, -0.110, 1.613)], 6), 0.0026, seg=4)
    add_ico(bm, 0.0072, (0.034, -0.1115, 1.613), subdiv=1, scale=(1.25, 0.9, 0.9))
    M.add('mic_boom', bm, 'head_dark', 'head', smooth=80, tint=FLAP_TINT)


def hinge(M, name, centre, axis, radius, up_dir, bar_len, bar_w, bones, off):
    """Joint bearing on the side of an elbow or knee: a pivot disc on the upper bone and a
    link bar along each bone. `off` = distance of the disc from the limb axis."""
    axis = Vector(axis).normalized()
    c = Vector(centre) + axis * off
    bm = bm_new()
    v = add_lathe(bm, [(radius, -0.004), (radius, 0.006), (radius * 0.82, 0.01), (radius * 0.45, 0.01), (radius * 0.45, 0.014), (0, 0.014)], seg=10, cap_start=False)
    oriented(bm, v, c, axis)
    M.add(name + '_pivot_L', bm, 'aluminium', bones[0], mirror=True, smooth=50)
    for k, (bone, sgn) in enumerate(((bones[0], 1), (bones[1], -1))):
        d = Vector(up_dir).normalized() * sgn
        bm = bm_new()
        v = add_box(bm, (bar_w, bar_len, 0.007))
        oriented(bm, v, c + d * (bar_len / 2 + radius * 0.5) + axis * (0.001 - 0.003 * k), axis, x_hint=d.cross(axis))
        M.add('%s_link%d_L' % (name, k), bm, 'aluminium', bone, mirror=True, bevel=0.002)


def build_arm(M):
    """Left arm; mirrored to the right. Local s runs from the shoulder joint down the arm."""
    RB = 0.089

    def sec(s):
        if s < 0.056:
            r = math.sqrt(max(RB * RB - s * s, 1e-8))
        elif s < 0.225:
            r = lerp(0.0685, 0.063, (s - 0.056) / 0.169)
        elif s < 0.375:
            r = 0.0585
        elif s < 0.54:
            r = lerp(0.0605, 0.0485, ((s - 0.375) / 0.165) ** 1.2)
        else:
            r = 0.047
        return (r, r, 0.0, 0.0, 2.0)
    arm = Tube(ARM_FRAME, sec=sec)
    # shoulder ball + upper sleeve
    bm = bm_new()
    arm.loft(bm, [-0.0885, -0.082, -0.066, -0.042, -0.014, 0.016, 0.04, 0.056, 0.085, 0.13, 0.175, 0.212], seg=16, cap0=True)
    M.add('upper_arm_L', bm, 'suit_white', w_arm, mirror=True, smooth=60)
    # orange shoulder cap
    bm = bm_new()
    arm.panel(bm, -0.05, 0.166, -105 * D2R, 105 * D2R, 0.005, ns=6, nth=7)
    M.add('shoulder_panel_L', bm, 'suit_orange', w_arm, mirror=True, smooth=60)
    # grey restraint webbing down the outside of the upper arm, over the panel
    bm = bm_new()
    arm.panel(bm, 0.05, 0.207, -13 * D2R, 13 * D2R, 0.009, ns=3, nth=1)
    M.add('arm_webbing_L', bm, 'suit_grey', w_arm, mirror=True, smooth=60)
    # upper-arm bearing
    bm = bm_new()
    arm.band(bm, 0.204, 0.232, 0.0075, seg=16, edge=0.005)
    M.add('arm_bearing_L', bm, 'aluminium', 'upper_arm_L', mirror=True, smooth=50)
    # elbow convolute
    conv = Tube(ARM_FRAME, sec=lambda s: (0.055, 0.055, 0, 0, 2.0), mod=ribs(0.228, 0.037, 0.0085))
    bm = bm_new()
    conv.loft(bm, rib_rows(0.228, 0.037, 4), seg=14)
    M.add('elbow_L', bm, 'suit_grey', w_arm, mirror=True, smooth=50, tint=BELLOWS)
    hinge(M, 'elbow', ELBOW, ARM_U, 0.021, -ARM_DIR, 0.06, 0.02, ('upper_arm_L', 'forearm_L'), 0.064)
    hinge(M, 'elbow_in', ELBOW, -ARM_U, 0.021, -ARM_DIR, 0.06, 0.02, ('upper_arm_L', 'forearm_L'), 0.064)
    # elbow pad on the back of the joint (rides on the forearm)
    bm = bm_new()
    conv.pad(bm, 0.33, 90 * D2R, 0.046, 0.043, 0.014, corner=0.02, bevel=0.007, dome=0.006)
    M.add('elbow_pad_L', bm, 'rubber', 'forearm_L', mirror=True, smooth=50)
    # forearm sleeve, cuff and orange forearm panel
    bm = bm_new()
    arm.loft(bm, [0.366, 0.385, 0.42, 0.46, 0.50, 0.538], seg=16)
    M.add('forearm_L', bm, 'suit_white', w_arm, mirror=True, smooth=60)
    bm = bm_new()
    arm.band(bm, 0.368, 0.386, 0.004, seg=16, edge=0.004)
    M.add('forearm_cuff_L', bm, 'suit_grey', w_arm, mirror=True, smooth=55)
    bm = bm_new()
    arm.panel(bm, 0.397, 0.515, -75 * D2R, 115 * D2R, 0.0045, ns=3, nth=6)
    M.add('forearm_panel_L', bm, 'suit_orange', w_arm, mirror=True, smooth=60)
    # wrist disconnect ring with its latch
    bm = bm_new()
    arm.band(bm, 0.528, 0.562, 0.0085, seg=16, edge=0.006, mid=1)
    M.add('wrist_ring_L', bm, 'aluminium', 'forearm_L', mirror=True, smooth=50)
    bm = bm_new()
    oriented(bm, add_box(bm, (0.02, 0.026, 0.01)), arm.P(0.545, 270 * D2R, 0.012), arm.N(0.545, 270 * D2R), x_hint=ARM_DIR)
    M.add('wrist_latch_L', bm, 'plastic_black', 'forearm_L', mirror=True)

    # ---- glove: gauntlet, palm, mitten fingers curling towards the palm (-U), separate thumb
    glove = Tube(ARM_FRAME, stations=[
        # s,     rx (thickness), ry (width), cu,     cv,   n
        (0.552, 0.045, 0.045, 0.000, 0.0, 2.0),
        (0.585, 0.040, 0.045, 0.000, 0.0, 2.2),
        (0.612, 0.031, 0.048, -0.002, 0.0, 2.6),
        (0.650, 0.028, 0.052, -0.003, 0.001, 2.9),
        (0.688, 0.026, 0.051, -0.005, 0.002, 2.9),
        (0.720, 0.023, 0.049, -0.013, 0.003, 2.8),
        (0.750, 0.021, 0.045, -0.026, 0.003, 2.7),
        (0.772, 0.016, 0.038, -0.040, 0.003, 2.5),
        (0.782, 0.008, 0.024, -0.047, 0.003, 2.2),
    ])
    bm = bm_new()
    glove.loft(bm, [0.552, 0.57, 0.59, 0.615, 0.65, 0.688, 0.704], seg=16)
    M.add('glove_L', bm, 'suit_white', 'hand_L', mirror=True, smooth=60)
    bm = bm_new()
    glove.loft(bm, [0.698, 0.72, 0.75, 0.772, 0.782], seg=16, cap1=True, lift=0.0015)
    M.add('fingers_L', bm, 'suit_grey', 'hand_L', mirror=True, smooth=70)
    bm = bm_new()
    glove.band(bm, 0.572, 0.594, 0.004, seg=16, edge=0.004)                                        # gauntlet strap
    glove.panel(bm, 0.612, 0.69, 125 * D2R, 235 * D2R, 0.0035, ns=2, nth=3)                        # palm grip pad
    glove.panel(bm, 0.668, 0.702, -62 * D2R, 62 * D2R, 0.006, ns=1, nth=3, bevel=0.004)            # knuckle guard
    M.add('glove_trim_L', bm, 'suit_grey', 'hand_L', mirror=True, smooth=60)
    bm = bm_new()
    for k in (-1, 0, 1):                                                                           # finger grooves on the back of the mitten
        add_tube(bm, [glove.P(s, (0 + k * 30) * D2R, 0.0022) for s in (0.706, 0.73, 0.755, 0.773)], 0.0026, seg=4)
    M.add('finger_seams_L', bm, 'rubber', 'hand_L', mirror=True, smooth=100)
    # thumb: a short tube from the front edge of the palm
    o, U, V, D = ARM_FRAME
    base = o + U * -0.008 + V * -0.042 + D * 0.622
    tdir = (U * -0.34 + V * -0.60 + D * 0.72).normalized()
    side = tdir.cross(U).normalized()
    thumb = Tube((base, side.cross(tdir).normalized(), side, tdir), stations=[
        (0.0, 0.021, 0.023, 0, 0, 2.0), (0.035, 0.0195, 0.021, 0, 0, 2.0), (0.065, 0.0175, 0.018, -0.004, 0, 2.0),
        (0.088, 0.0135, 0.014, -0.009, 0, 2.0), (0.097, 0.006, 0.006, -0.012, 0, 2.0)])
    bm = bm_new()
    thumb.loft(bm, [0.0, 0.035, 0.065, 0.088, 0.097], seg=8, cap0=True, cap1=True)
    M.add('thumb_L', bm, 'suit_grey', 'hand_L', mirror=True, smooth=70)
    return arm, glove


def build_wrist_computer(M, arm):
    """Left forearm only: a strapped-on display."""
    p0 = arm.P(0.455, 300 * D2R, 0.0)
    n = arm.N(0.455, 300 * D2R)
    bm = bm_new()
    oriented(bm, add_box(bm, (0.085, 0.058, 0.016)), p0 + n * 0.012, n, x_hint=ARM_DIR)
    M.add('wristcomp_body', bm, 'plastic_black', w_arm, bevel=0.004)
    bm = bm_new()
    oriented(bm, add_box(bm, (0.066, 0.042, 0.003)), p0 + n * 0.0205, n, x_hint=ARM_DIR)
    M.add('wristcomp_screen', bm, 'screen', w_arm)


def build_leg(M):
    """Left leg; mirrored to the right. Local s runs from the hip joint down the leg."""
    RB = 0.102

    def sec(s):
        if s < 0.062:
            r = math.sqrt(max(RB * RB - s * s, 1e-8))
            return (r, r, 0, 0, 2.0)
        if s < 0.345:
            t = (s - 0.062) / 0.283
            return (lerp(0.099, 0.085, t), lerp(0.103, 0.089, t), 0, lerp(0.0, 0.004, t), 2.15)
        if s < 0.52:
            return (0.082, 0.085, 0, 0.004, 2.1)
        t = min(max((s - 0.52) / 0.21, 0), 1)
        bulge = math.sin(t * math.pi) * 0.010                                 # calf
        return (lerp(0.082, 0.068, t), lerp(0.085, 0.070, t) + bulge * 0.5, 0, 0.004 + bulge * 0.7, 2.1)
    leg = Tube(LEG_FRAME, sec=sec)
    # hip joint: a ribbed grey ball that the thigh turns on
    bm = bm_new()
    leg.loft(bm, [-0.1015, -0.094, -0.076, -0.05, -0.02, 0.012, 0.04, 0.066], seg=16, cap0=True)
    M.add('hip_joint_L', bm, 'suit_grey', 'thigh_L', mirror=True, smooth=60, tint=BELLOWS)
    bm = bm_new()
    leg.loft(bm, [0.06, 0.10, 0.16, 0.22, 0.28, 0.34], seg=16)
    M.add('thigh_L', bm, 'suit_white', 'thigh_L', mirror=True, smooth=60)
    # hip bearing ring where the thigh leaves the ball
    bm = bm_new()
    leg.band(bm, 0.066, 0.096, 0.007, seg=16, edge=0.005)
    M.add('hip_bearing_L', bm, 'aluminium', 'thigh_L', mirror=True, smooth=50)
    # orange thigh panel on the outside/front, with a cargo pocket on top of it
    bm = bm_new()
    leg.panel(bm, 0.118, 0.315, -100 * D2R, 60 * D2R, 0.005, ns=4, nth=7)
    M.add('thigh_panel_L', bm, 'suit_orange', 'thigh_L', mirror=True, smooth=60)
    bm = bm_new()
    leg.pad(bm, 0.226, -20 * D2R, 0.058, 0.058, 0.023, corner=0.014, bevel=0.008, dome=0.002, n_th=2)
    M.add('thigh_pocket_L', bm, 'suit_white', 'thigh_L', mirror=True, smooth=50, tint=(0.9, 0.9, 0.9))
    bm = bm_new()
    leg.pad(bm, 0.18, -20 * D2R, 0.024, 0.062, 0.031, corner=0.006, bevel=0.004, mid=(), n_th=2)    # pocket flap
    leg.band(bm, 0.322, 0.345, 0.005, seg=16, edge=0.005)
    M.add('thigh_trim_L', bm, 'suit_grey', 'thigh_L', mirror=True, smooth=55)
    # knee convolute with side bearings
    conv = Tube(LEG_FRAME, sec=lambda s: (0.078, 0.081, 0, 0.004, 2.1), mod=ribs(0.34, 0.045, 0.010))
    bm = bm_new()
    conv.loft(bm, rib_rows(0.34, 0.045, 4), seg=16)
    M.add('knee_L', bm, 'suit_grey', w_leg, mirror=True, smooth=50, tint=BELLOWS)
    hinge(M, 'knee', KNEE + Vector((0, 0.004, 0)), (1, 0, 0), 0.027, (0, 0, 1), 0.075, 0.024, ('thigh_L', 'shin_L'), 0.087)
    hinge(M, 'knee_in', KNEE + Vector((0, 0.004, 0)), (-1, 0, 0), 0.027, (0, 0, 1), 0.075, 0.024, ('thigh_L', 'shin_L'), 0.087)
    # knee pad: a hard shell on the front of the joint, strapped to the top of the shin
    bm = bm_new()
    conv.pad(bm, 0.447, 270 * D2R, 0.07, 0.062, 0.016, corner=0.03, bevel=0.009, dome=0.012, n_th=2, n_s=2)
    M.add('knee_pad_L', bm, 'rubber', 'shin_L', mirror=True, smooth=50)
    # shin sleeve, strap band and shin guard strip
    bm = bm_new()
    leg.loft(bm, [0.512, 0.535, 0.575, 0.62, 0.665, 0.705], seg=16)
    M.add('shin_L', bm, 'suit_white', w_leg, mirror=True, smooth=60)
    bm = bm_new()
    leg.band(bm, 0.512, 0.536, 0.005, seg=16, edge=0.005)
    leg.panel(bm, 0.536, 0.69, 256 * D2R, 284 * D2R, 0.006, ns=3, nth=1)
    M.add('shin_trim_L', bm, 'suit_grey', w_leg, mirror=True, smooth=55)
    # ankle bearing at the top of the boot
    bm = bm_new()
    leg.band(bm, 0.69, 0.72, 0.008, seg=16, edge=0.005)
    M.add('ankle_ring_L', bm, 'aluminium', 'shin_L', mirror=True, smooth=50)
    return leg


BOOT_ST = sorted([  # y, half-width, top z, lateral offset of the centre line
    (0.100, 0.018, 0.085, 0.000),
    (0.090, 0.040, 0.112, 0.000),
    (0.060, 0.052, 0.138, 0.000),
    (0.005, 0.056, 0.150, 0.000),
    (-0.045, 0.058, 0.136, 0.001),
    (-0.095, 0.062, 0.115, 0.002),
    (-0.135, 0.065, 0.102, 0.003),
    (-0.175, 0.064, 0.094, 0.003),
    (-0.210, 0.056, 0.086, 0.002),
    (-0.233, 0.040, 0.074, 0.001),
    (-0.245, 0.018, 0.058, 0.000),
])
BOOT_C = Curve(BOOT_ST)
BOOT_SPLIT = BALL.y        # the ball line: in front of it everything belongs to the toe bone
SOLE_TOP = 0.05


def _boot_rows(ys, grow=0.0, base=0.042, k=8, n=2.5, zmax=None):
    grows = grow if isinstance(grow, (list, tuple)) else [grow] * len(ys)
    rows, e = [], 2.0 / n
    for y, g in zip(ys, grows):
        w, h, cx = BOOT_C(y)
        w, h = w + g, h + g
        row = []
        for j in range(k + 1):
            a = math.pi * j / k
            z = base + (h - base) * spow(math.sin(a), e)
            row.append(Vector((ANKLE.x + cx + w * spow(math.cos(a), e), y, z if zmax is None else min(z, zmax))))
        rows.append(row)
    return rows


def _sole_outline(ys, grow):
    lat, med = [], []
    for y in ys:
        w, _, cx = BOOT_C(y)
        lat.append((ANKLE.x + cx + w + grow, y))
        med.append((ANKLE.x + cx - w - grow, y))
    return lat + med[::-1]


def build_boot(M):
    cx0 = ANKLE.x
    # rear upper (foot bone) and toe box (toe bone)
    bm = bm_new()
    grid(bm, _boot_rows([0.100, 0.090, 0.060, 0.03, 0.005, -0.045, -0.095, BOOT_SPLIT - 0.014]), cap_first=True, cap_last=True, out_from=(cx0, -0.03, 0.07))
    M.add('boot_upper_L', bm, 'suit_white', 'foot_L', mirror=True, smooth=60, tint=BOOT_TINT)
    bm = bm_new()
    grid(bm, _boot_rows([BOOT_SPLIT + 0.014, -0.175, -0.210, -0.233, -0.245]), cap_first=True, cap_last=True, out_from=(cx0, -0.19, 0.06))
    M.add('boot_toe_L', bm, 'suit_white', 'toe_L', mirror=True, smooth=60, tint=BOOT_TINT)
    # rubber toe cap and grey heel counter (steep-walled shells over the upper)
    bm = bm_new()
    grid(bm, _boot_rows([-0.190, -0.1915, -0.210, -0.233, -0.245, -0.2495], grow=[-0.002, 0.0045, 0.0045, 0.0045, 0.0045, 0.0045]), cap_last=True, out_from=(cx0, -0.2, 0.06))
    M.add('toe_cap_L', bm, 'rubber', 'toe_L', mirror=True, smooth=55)
    bm = bm_new()
    grid(bm, _boot_rows([0.1045, 0.100, 0.090, 0.06, 0.0365, 0.035], grow=[0.005, 0.005, 0.005, 0.005, 0.005, -0.002], zmax=0.104), cap_first=True, out_from=(cx0, 0.07, 0.07))
    M.add('heel_counter_L', bm, 'suit_grey', 'foot_L', mirror=True, smooth=45)
    # flex bellows over the ball joint (blends foot -> toe)
    bm = bm_new()
    ys = frange(-0.112, -0.178, 8)
    grid(bm, _boot_rows(ys, grow=[-0.002] + [0.0025 + (0.005 if i % 2 else 0.0) for i in range(1, 8)] + [-0.002]), out_from=(cx0, -0.145, 0.05))
    M.add('boot_flex_L', bm, 'rubber', w_toe, mirror=True, smooth=80)
    # instep strap with buckle
    bm = bm_new()
    for y0, y1 in ((-0.052, -0.086),):
        grid(bm, _boot_rows([y0, y0 - 0.0012, y1 + 0.0012, y1], grow=[-0.002, 0.0055, 0.0055, -0.002]), out_from=(cx0, (y0 + y1) / 2, 0.05))
    M.add('boot_straps_L', bm, 'suit_grey', 'foot_L', mirror=True, smooth=50)
    bm = bm_new()
    w, h, cx = BOOT_C(-0.069)
    add_box(bm, (0.014, 0.038, 0.036), (cx0 + cx + w * 0.92 + 0.007, -0.069, 0.042 + (h - 0.042) * 0.5), rot=(0, rad(-16), 0))
    M.add('boot_buckles_L', bm, 'aluminium', 'foot_L', mirror=True, bevel=0.003)
    # high collar of the boot (rigid on the foot) with a rim, and the convoluted gaiter that
    # comes out of it up to the ankle ring (blends foot -> shin)
    up = (Vector((cx0, 0, 0)), Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))
    collar = Tube(up, stations=[(0.09, 0.060, 0.078, 0, 0.012, 2.3), (0.13, 0.064, 0.081, 0, 0.009, 2.2), (0.172, 0.069, 0.083, 0, 0.007, 2.1)])
    bm = bm_new()
    collar.loft(bm, [0.095, 0.13, 0.168, 0.172], seg=14, lift=[0, 0, 0, -0.006])
    M.add('boot_collar_L', bm, 'suit_white', 'foot_L', mirror=True, smooth=60, tint=BOOT_TINT)
    bm = bm_new()
    collar.band(bm, 0.148, 0.174, 0.005, seg=14, edge=0.005)
    M.add('boot_collar_rim_L', bm, 'suit_grey', 'foot_L', mirror=True, smooth=55)
    shaft = Tube(up, stations=[(0.13, 0.058, 0.072, 0, 0.008, 2.1), (0.19, 0.063, 0.071, 0, 0.006, 2.0), (0.25, 0.066, 0.070, 0, 0.005, 2.0)],
                 mod=ribs(0.166, 0.036, 0.0075))
    bm = bm_new()
    shaft.loft(bm, [0.15] + rib_rows(0.166, 0.036, 2), seg=14)
    M.add('boot_shaft_L', bm, 'suit_grey', w_ankle, mirror=True, smooth=50, tint=BELLOWS)
    # sole: a rubber slab in two parts (heel/arch on the foot bone, forefoot on the toe bone) with lugs
    for nm, bone, ys in (('sole_rear_L', 'foot_L', [0.107, 0.098, 0.07, 0.02, -0.04, -0.095, BOOT_SPLIT - 0.008]),
                         ('sole_toe_L', 'toe_L', [BOOT_SPLIT + 0.008, -0.175, -0.21, -0.235, -0.249, -0.254])):
        bm = bm_new()
        add_prism(bm, _sole_outline(ys, 0.007), depth=SOLE_TOP - 0.01, loc=(0, 0, (SOLE_TOP + 0.01) / 2))
        M.add(nm, bm, 'rubber', bone, mirror=True, bevel=0.008, smooth=50)
    for nm, bone, ys in (('lugs_rear_L', 'foot_L', [0.086, 0.058, 0.03, -0.062, -0.092, -0.122]),
                         ('lugs_toe_L', 'toe_L', [-0.158, -0.188, -0.218])):
        bm = bm_new()
        for y in ys:
            w, _, cx = BOOT_C(y)
            add_box(bm, (2 * w + 0.024, 0.019, 0.016), (cx0 + cx, y, 0.008))
        M.add(nm, bm, 'rubber', bone, mirror=True)


def build_model():
    M = Model()
    hut, brief = build_torso(M)
    build_chest_unit(M, hut)
    build_backpack(M)
    build_helmet(M)
    build_head(M)
    arm, glove = build_arm(M)
    build_wrist_computer(M, arm)
    build_leg(M)
    build_boot(M)
    return M


# ==============================================================================================
# Armature, anchors, mesh export (Blender side)
# ==============================================================================================
# Anchors are empties parented to bones. In the rest pose their axes equal the model's axes, so
# in the exported file an anchor's local +Z is the astronaut's forward direction.
ANCHORS = {  # name: (bone, rest position)
    'lamp_L': ('head', LAMP_C + Vector((0, -0.048, 0))),
    'lamp_R': ('head', _mx(LAMP_C + Vector((0, -0.048, 0)))),
    'eye': ('head', HELMET_C + Vector((0.0, -0.085, -0.005))),
    'hand_grip_R': ('hand_R', _mx(SHOULDER + ARM_U * -0.038 + ARM_DIR * 0.655)),
}


def build_rig():
    data = bpy.data.armatures.new(NAME + '_rig')
    arm = bpy.data.objects.new(NAME, data)
    link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    for name, head, tail, parent in BONES:
        eb = data.edit_bones.new(name)
        eb.head, eb.tail, eb.roll = head, tail, 0.0
        if parent:
            eb.parent = data.edit_bones[parent]
            eb.use_connect = False
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm


def build_mesh(fast=False):
    """Build the suit in Blender and export mesh + skeleton + anchors (no clips yet)."""
    t0 = time.time()
    reset_scene()
    group_materials()
    M = build_model()
    M.report()
    arm = build_rig()
    names = [p['name'] for p in M.pieces]
    M_soft = [p['soft_ao'] for p in M.pieces]
    obj, tints, pids, normals = M.join(NAME + '_body')
    if any(n != (0.0, 0.0, 0.0) for n in normals):
        obj.data.normals_split_custom_set_from_vertices(normals)      # zero vectors keep Blender's own normals
    link(obj, arm)
    md = obj.modifiers.new('armature', 'ARMATURE')
    md.object = arm
    for name, (bone, pos) in ANCHORS.items():
        o = anchor(name, arm, loc=pos)
        o.parent_type = 'BONE'
        o.parent_bone = bone
        b = arm.data.bones[bone]
        o.matrix_parent_inverse = (arm.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0))).inverted()
    bpy.context.view_layer.update()
    tris = tri_count(arm)
    print('triangles: %d (budget %d)' % (tris, TRI_BUDGET))
    bake_ao(arm, samples=8 if fast else 32, distance=0.45, strength=0.85)
    me = obj.data
    col = me.color_attributes['Col']
    ao = np.array([col.data[i].color[0] for i in range(len(tints))])
    soft = np.array([M_soft[p] for p in pids])
    if soft.any():                                    # skin: average the occlusion with its neighbours, then lighten it
        ed = np.array([e.vertices[:] for e in me.edges])
        ed = ed[(soft[ed[:, 0]] > 0) & (soft[ed[:, 1]] > 0)]
        for _ in range(2):
            acc, cnt = ao.copy(), np.ones(len(ao))
            np.add.at(acc, ed[:, 0], ao[ed[:, 1]])
            np.add.at(acc, ed[:, 1], ao[ed[:, 0]])
            np.add.at(cnt, ed[:, 0], 1.0)
            np.add.at(cnt, ed[:, 1], 1.0)
            ao = np.where(soft > 0, acc / cnt, ao)
        ao = ao + (1.0 - ao) * soft
    for i, t in enumerate(tints):
        a = 0.22 + 0.78 * ao[i]                       # keep creases readable without going black
        col.data[i].color = (a * t[0], a * t[1], a * t[2], 1.0)
    # rest data for the clip linter
    n = len(me.vertices)
    co = np.zeros(n * 3)
    me.vertices.foreach_get('co', co)
    W = np.zeros((n, len(BONE_NAMES)), dtype=np.float32)
    for v in me.vertices:
        for g in v.groups:
            W[v.index, g.group] = g.weight
    os.makedirs(RAW_DIR, exist_ok=True)
    np.savez_compressed(SKIN_NPZ, co=co.reshape(n, 3), W=W, pid=np.array(pids), names=np.array(names), tris=tris)
    for o in bpy.context.scene.objects:
        o.select_set(False)
    for o in [arm] + list(arm.children_recursive):
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=MESH_RAW, export_format='GLB', use_selection=True, export_apply=False, export_yup=True,
        export_normals=True, export_texcoords=False, export_materials='EXPORT', export_extras=True,
        export_animations=False, export_skins=True, export_def_bones=False, export_all_influences=False,
        export_cameras=False, export_lights=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True)
    print('mesh exported in %.1fs: %s (%.0f kB)' % (time.time() - t0, MESH_RAW, os.path.getsize(MESH_RAW) / 1024))
    return tris


# ==============================================================================================
# .glb reading / writing (for injecting the clips)
# ==============================================================================================
def read_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    assert data[:4] == b'glTF'
    off, gltf, blob = 12, None, b''
    while off < len(data):
        ln, kind = struct.unpack_from('<II', data, off)
        chunk = data[off + 8: off + 8 + ln]
        if kind == 0x4E4F534A:
            gltf = json.loads(chunk.decode('utf-8'))
        elif kind == 0x004E4942:
            blob = bytes(chunk)
        off += 8 + ln
    return gltf, bytearray(blob)


def write_glb(path, gltf, blob):
    while len(blob) % 4:
        blob.append(0)
    gltf['buffers'] = [{'byteLength': len(blob)}]
    js = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A))
        f.write(js)
        f.write(struct.pack('<II', len(blob), 0x004E4942))
        f.write(blob)


def _add_accessor(gltf, blob, arr, type_, minmax=False):
    arr = np.ascontiguousarray(arr, dtype=np.float32)
    while len(blob) % 4:
        blob.append(0)
    gltf['bufferViews'].append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': arr.nbytes})
    blob.extend(arr.tobytes())
    acc = {'bufferView': len(gltf['bufferViews']) - 1, 'componentType': 5126, 'count': int(arr.shape[0]), 'type': type_}
    if minmax:
        acc['min'], acc['max'] = [float(arr.min())], [float(arr.max())]
    gltf['accessors'].append(acc)
    return len(gltf['accessors']) - 1


def pack(src, dst):
    """Compress with gltfpack. -af 0 keeps our own keyframe times, so clip lengths stay exact.
    Normals keep 12 bits (the other models use 10): the visor is a mirror in the game, and at
    10 bits its normals wander by 0.2 degrees, at 12 by 0.06."""
    cmd = ['node', os.path.join(TOOLS, 'node_modules', 'gltfpack', 'cli.js'), '-i', src, '-o', dst,
           '-cc', '-kn', '-km', '-ke', '-vp', '15', '-vn', '12', '-vc', '8', '-af', '0']
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(res.stdout, res.stderr)
        raise RuntimeError('gltfpack failed')
    return round(os.path.getsize(dst) / 1024, 1)



# ==============================================================================================
# Poses and kinematics (pure Python, armature space: X = the astronaut's left, -Y = forward, Z = up)
#
# A pose stores, for every bone, a rotation relative to its parent written in ARMATURE axes
# (as if the parent were still in its rest orientation), plus a translation of the hips.
# That keeps the clip code readable: Q(x=20) on the spine is "lean 20 degrees forward".
# ==============================================================================================
X_AX, Y_AX, Z_AX = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
FWD = Vector((0, -1, 0))
HEEL_Y = 0.10                      # rear edge of the sole, behind the ankle
REST_DIR = {b[0]: (Vector(b[2]) - Vector(b[1])).normalized() for b in BONES}
REST_PALM = {'L': -ARM_U, 'R': _mx(-ARM_U)}


def Q(x=0.0, y=0.0, z=0.0):
    """Degrees. x: pitch forward (lean / nod / heel up), y: roll to the left, z: turn to the left.
    Applied in the order roll, pitch, turn."""
    return Quaternion(Z_AX, rad(z)) @ Quaternion(X_AX, rad(x)) @ Quaternion(Y_AX, rad(y))


def basis(d, p):
    d = d.normalized()
    p = p - d * p.dot(d)
    if p.length < 1e-8:
        p = d.orthogonal()
    p.normalize()
    return Matrix((d, p, d.cross(p))).transposed()


def frame_from(rest_dir, rest_pole, d, p):
    """Rotation taking a bone whose rest direction / bend direction are (rest_dir, rest_pole)
    to direction d with its bend direction towards p."""
    return (basis(d, p) @ basis(rest_dir, rest_pole).transposed()).to_quaternion()


def two_bone(root, target, l1, l2, pole):
    """Analytic two-bone IK. Returns the two bone directions, the hinge axis and how far the
    target is out of reach (0 when it can be reached)."""
    d = target - root
    dist = d.length
    dn = d / dist if dist > 1e-9 else Vector((0, 0, -1))
    k = pole - dn * pole.dot(dn)
    if k.length < 1e-6:
        k = dn.orthogonal()
    k.normalize()
    reach = max(0.0, dist - (l1 + l2))
    dc = min(max(dist, abs(l1 - l2) + 1e-4), (l1 + l2) * 0.9995)
    ca = min(1.0, max(-1.0, (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc)))
    u1 = dn * ca + k * math.sqrt(1 - ca * ca)
    u2 = (root + dn * dc - (root + u1 * l1)).normalized()
    return u1, u2, dn.cross(k).normalized(), reach


def foot_pose(x, y, pitch=0.0, yaw=0.0, lift=0.0):
    """Where the ankle goes for a foot whose flat position would have the ankle over (x, y).
    pitch > 0 lifts the heel and hinges at the toe joint (the toes can then stay flat on the
    ground); pitch < 0 lifts the toes and pivots on the heel. Returns (ankle, foot rotation, pitch)."""
    yq = Quaternion(Z_AX, rad(yaw))
    fq = yq @ Quaternion(X_AX, rad(pitch))
    pivot = Vector((0, BALL.y, BALL.z)) if pitch >= 0 else Vector((0, HEEL_Y, 0))
    ankle = Vector((x, y, lift)) + yq @ pivot + fq @ (Vector((0, 0, ANKLE.z)) - pivot)
    return ankle, fq, pitch


def hand_q(side, direction, palm):
    """World rotation for a hand whose fingers point along `direction` with the palm facing `palm`."""
    return frame_from(REST_DIR['hand_' + side], REST_PALM[side], Vector(direction), Vector(palm))


class Pose:
    def __init__(self):
        self.root = Vector((0, 0, 0))
        self.q = {n: Quaternion() for n in BONE_NAMES}
        self.notes = []

    def frames(self):
        """World rotation and joint position of every bone."""
        F, P = {}, {}
        for n in BONE_NAMES:
            par = BONE_PARENT[n]
            if par is None:
                F[n] = self.q[n].copy()
                P[n] = BONE_HEAD[n] + self.root
            else:
                F[n] = F[par] @ self.q[n]
                P[n] = P[par] + F[par] @ (BONE_HEAD[n] - BONE_HEAD[par])
        return F, P

    def point(self, bone, rest_pt):
        F, P = self.frames()
        return P[bone] + F[bone] @ (Vector(rest_pt) - BONE_HEAD[bone])

    def pin(self, bone, rest_pt, target):
        """Slide the whole body so that a point attached to `bone` lands on `target`."""
        self.root += Vector(target) - self.point(bone, rest_pt)

    # ---- legs
    def leg(self, side, ankle, foot=None, pole=None, toe=0.0):
        th, sh, ft, to = ('%s_%s' % (n, side) for n in ('thigh', 'shin', 'foot', 'toe'))
        F, P = self.frames()
        pole = Vector(pole) if pole is not None else F['hips'] @ FWD
        u1, u2, ax, reach = two_bone(P[th], Vector(ankle), L_THIGH, L_SHIN, pole)
        if reach > 0.003:
            self.notes.append('leg_%s out of reach by %.0f mm' % (side, reach * 1000))
        Ft = frame_from(REST_DIR[th], FWD, u1, ax.cross(u1))
        Fs = frame_from(REST_DIR[sh], FWD, u2, ax.cross(u2))
        self.q[th] = F['hips'].inverted() @ Ft
        self.q[sh] = Ft.inverted() @ Fs
        self.q[ft] = Fs.inverted() @ (foot if foot is not None else Quaternion())
        self.q[to] = Q(x=toe)

    def plant(self, side, x, y, pitch=0.0, yaw=0.0, lift=0.0, pole=None, toe=None):
        ankle, fq, _ = foot_pose(x, y, pitch, yaw, lift)
        self.leg(side, ankle, fq, pole, toe=(-max(pitch, 0.0) if toe is None else toe))

    # ---- arms
    def arm(self, side, wrist, pole=None, hand=None, hand_local=None):
        """IK: put the wrist at `wrist`. pole = the way the elbow points (default down, back, out)."""
        sx = 1 if side == 'L' else -1
        ua, fa, ha, sh = ('%s_%s' % (n, side) for n in ('upper_arm', 'forearm', 'hand', 'shoulder'))
        F, P = self.frames()
        pole = Vector(pole) if pole is not None else F['chest'] @ Vector((sx * 0.4, 0.7, -0.6))
        u1, u2, ax, reach = two_bone(P[ua], Vector(wrist), L_UPPER, L_FORE, pole)
        if reach > 0.003:
            self.notes.append('arm_%s out of reach by %.0f mm' % (side, reach * 1000))
        Fu = frame_from(REST_DIR[ua], Y_AX, u1, ax.cross(u1))
        Ff = frame_from(REST_DIR[fa], Y_AX, u2, ax.cross(u2))
        self.q[ua] = F[sh].inverted() @ Fu
        self.q[fa] = Fu.inverted() @ Ff
        if hand is not None:
            self.q[ha] = Ff.inverted() @ hand
        elif hand_local is not None:
            self.q[ha] = hand_local
        else:
            self.q[ha] = Quaternion()

    def arm_fk(self, side, fwd=0.0, out=12.0, bend=15.0, twist=0.0, hand_local=None, rel='chest'):
        """FK in the chest's frame. fwd: swing forward, out: away from the body, bend: elbow,
        twist: turn the elbow outwards (all degrees)."""
        sx = 1 if side == 'L' else -1
        ua, fa, ha, sh = ('%s_%s' % (n, side) for n in ('upper_arm', 'forearm', 'hand', 'shoulder'))
        F, P = self.frames()
        base = F[rel] if rel else Quaternion()
        swing = Quaternion(X_AX, rad(-fwd))
        u1 = swing @ Vector((sx * math.sin(rad(out)), 0, -math.cos(rad(out))))
        k = Quaternion(u1, rad(sx * twist)) @ (swing @ Y_AX)
        k = (k - u1 * k.dot(u1)).normalized()
        u2 = u1 * math.cos(rad(bend)) - k * math.sin(rad(bend))
        ax = u1.cross(k)
        Fu = base @ frame_from(REST_DIR[ua], Y_AX, u1, k)
        Ff = base @ frame_from(REST_DIR[fa], Y_AX, u2, ax.cross(u2))
        self.q[ua] = F[sh].inverted() @ Fu
        self.q[fa] = Fu.inverted() @ Ff
        self.q[ha] = hand_local if hand_local is not None else Quaternion()

    def wrist(self, side):
        return self.frames()[1]['hand_' + side]

    def shrug(self, side, up=0.0, fwd=0.0):
        sx = 1 if side == 'L' else -1
        self.q['shoulder_' + side] = Quaternion(Y_AX, rad(-sx * up)) @ Quaternion(Z_AX, rad(-sx * fwd))


def mix(a, b, t):
    """Blend two poses (nlerp on every bone)."""
    p = Pose()
    p.root = a.root.lerp(b.root, t)
    for n in BONE_NAMES:
        p.q[n] = a.q[n].slerp(b.q[n], t)
    p.notes = a.notes + b.notes
    return p


# ==============================================================================================
# The clips. Each is a function of time (seconds) returning a Pose.
# ==============================================================================================
SIDES = (('L', 1), ('R', -1))
STANCE_X, TOE_OUT = 0.118, 7.0


def relaxed_arms(p, fwd=3.0, out=11.0, bend=20.0, twist=8.0):
    for side, sx in SIDES:
        p.arm_fk(side, fwd=fwd, out=out, bend=bend, twist=twist)


def stand_pose(crouch=0.0, lean=0.0, shift=0.0, heel=0.0, back=0.0, arms=True):
    p = Pose()
    p.root = Vector((shift, 0.012 + back, -0.012 - crouch))
    p.q['hips'] = Q(x=1.5 + lean * 0.38)
    p.q['spine'] = Q(x=1.5 + lean * 0.34)
    p.q['chest'] = Q(x=1.0 + lean * 0.28)
    p.q['neck'] = Q(x=-1.5 - lean * 0.25)
    p.q['head'] = Q(x=-2.0 - lean * 0.35)
    for side, sx in SIDES:
        p.plant(side, sx * STANCE_X, 0.0, pitch=heel, yaw=sx * TOE_OUT)
    if arms:
        relaxed_arms(p)
    return p


IDLE_T = 8.0


def hang_arm(p, side, fwd, out, bend, twist, flex=8.0, roll=0.0):
    """An arm hanging under its own weight: angles as for Pose.arm_fk but measured from the
    vertical, not from the chest, so the arm stays plumb while the torso tilts and breathes.
    flex curls the wrist towards the palm, roll turns the hand at the wrist bearing."""
    sx = 1 if side == 'L' else -1
    hand = Quaternion(REST_DIR['forearm_' + side], rad(sx * roll)) @ Quaternion(Y_AX, rad(sx * flex))
    p.arm_fk(side, fwd=fwd, out=out, bend=bend, twist=twist, hand_local=hand, rel=None)


def knee_reach(flex):
    """How far the ankle is from the hip joint when the knee is flexed by `flex` degrees."""
    return math.sqrt(L_THIGH ** 2 + L_SHIN ** 2 + 2 * L_THIGH * L_SHIN * math.cos(rad(flex)))


def stand_on(p, ankles, knees, pitch=0.0, turn=0.0):
    """Stand the pelvis on two planted legs with each knee flexed by exactly the angle asked for.
    `ankles` and `knees` are {side: ankle position} and {side: degrees}; p.root.x / .y and the
    pelvis' pitch and turn are given, and its height and sideways tilt are solved for.
    Why: a nearly straight leg has no slack. Lowering the hips 12 mm bends the knees 19 degrees,
    and 2 mm of bob swings a 4 degree knee to 9, so a standing pose written as a hip height
    either squats or pops. Written as knee angles it does neither."""
    z, roll = p.root.z, 0.0

    def miss(z, roll):
        q = Q(x=pitch, y=roll, z=turn)
        hips = BONE_HEAD['hips'] + Vector((p.root.x, p.root.y, z))
        return [(hips + q @ (BONE_HEAD['thigh_' + s] - BONE_HEAD['hips']) - Vector(ankles[s])).length - knee_reach(knees[s]) for s in 'LR']
    for _ in range(12):                                   # Newton on (height, tilt); converges in four or five steps
        f = miss(z, roll)
        a = [(u - v) / 1e-6 for u, v in zip(miss(z + 1e-6, roll), f)]
        b = [(u - v) / 1e-4 for u, v in zip(miss(z, roll + 1e-4), f)]
        det = a[0] * b[1] - a[1] * b[0]
        z -= (f[0] * b[1] - f[1] * b[0]) / det
        roll -= (a[0] * f[1] - a[1] * f[0]) / det
    p.root.z = z
    p.q['hips'] = Q(x=pitch, y=roll, z=turn)
    return roll


def idle_pose(t=0.0):
    """Standing at rest, upright: the weight on the right leg, that knee all but straight and the
    hip over the ankle; the left foot a little forward and turned out with its knee eased; the
    pelvis pushed over the standing foot and the shoulders tilted the other way; the arms hanging
    at his sides, hands beside the thighs; the head off centre and level.
    Over eight seconds: two breaths, a slow drift of the weight, and one look to the right.
    (The left foot leads because WorkKneel plants the left foot forward: the blend into it then
    has less far to go.)
    The stance is set by its knee angles (see stand_on), so the breath lives in the chest and
    shoulders and never in the height of the hips. Seen from the side the trunk leans about a
    degree and a half forward under the pack and the hips sit a centimetre ahead of the ankles:
    it is meant to be played as it is, with no correction added to the spine.
    The arms hang from the vertical with the elbows 10 and 12 degrees bent. They are kept this
    far out (about 12 degrees) by the hoses on the flanks, which the inner elbow links pass at
    15 mm, and the hands are turned thumb-forward because a thumb turned in reaches the thigh
    pocket. Known cost: in the cross-fade to WorkKneel the left hand starts outside the left knee
    and ends inside it, and passes through the knee pad on the way (see the notes above CLIPS)."""
    sup, free, m = 'R', 'L', -1.0                         # supporting side, eased side, mirror sign
    w = TAU / IDLE_T
    ph = 2 * w * t - 0.6
    br = math.sin(ph + 0.4 * math.sin(ph))                # breathing in is quicker than breathing out
    late = math.sin(ph - 0.9 + 0.4 * math.sin(ph - 0.9))  # the arms follow the chest a moment later
    shift = math.sin(w * t + 0.4)
    drift = math.sin(w * t + 2.3)
    settle = math.sin(w * t - 0.2)                        # the shoulders answer the hips a moment later
    look = smooth01((t - 2.5) / 1.3) * (1.0 - smooth01((t - 5.1) / 1.6))
    p = Pose()
    p.root = Vector((m * (0.040 + 0.009 * shift + 0.003 * look), -0.019 + 0.003 * drift, 0.0))
    feet = {sup: dict(x=m * 0.105, y=0.0, yaw=m * 6.0), free: dict(x=m * -0.135, y=-0.035, yaw=m * -14.0)}
    # as the weight goes further onto the standing leg that knee locks a little more and the other eases
    tilt = stand_on(p, {s: foot_pose(f['x'], f['y'], 0.0, f['yaw'])[0] for s, f in feet.items()},
                    {sup: 4.6 - 0.4 * shift, free: 7.3 + 0.7 * shift}, pitch=1.0, turn=m * (4.0 + 0.8 * drift))
    # the spine takes the pelvis' tilt back out and a little more: the shoulder is low over the standing leg.
    # As the hips go further over that foot the trunk comes back a little, so the head sways less than the hips.
    p.q['spine'] = Q(x=0.4 - 0.3 * br, y=-0.5 * tilt + m * (0.5 - 0.15 * settle), z=m * -1.5)
    p.q['chest'] = Q(x=0.4 - 0.9 * br, y=-0.5 * tilt + m * (0.6 - 0.15 * settle), z=m * (-3.0 - 0.6 * drift + 2.0 * look))
    p.q['neck'] = Q(x=-0.8 + 0.5 * br, y=m * -1.0, z=m * (-2.5 + 4.0 * look))
    p.q['head'] = Q(x=-1.0 + 0.4 * br + 0.8 * math.sin(w * t + 0.4) - 1.5 * look, y=m * (-1.6 + 1.2 * look), z=m * (-5.0 + 8.0 * look))
    p.shrug(sup, up=-1.0 + 1.6 * br, fwd=0.0)
    p.shrug(free, up=0.8 + 1.6 * br, fwd=0.0)
    p.plant(sup, **feet[sup])
    p.plant(free, pole=(m * -0.25, -1.0, 0.0), **feet[free])
    hang_arm(p, sup, fwd=-5.0 + 0.6 * late, out=11.5 + 0.4 * late, bend=9.5 + 1.0 * late + 1.0 * look, twist=14.0, flex=8.0, roll=6.0)
    hang_arm(p, free, fwd=-3.5 + 0.6 * late - 1.0 * look, out=13.5 + 0.4 * late, bend=12.0 + 1.0 * late, twist=10.0, flex=10.0, roll=2.0)
    return p


def clip_idle(t):
    return idle_pose(t)


WALK = dict(
    T=0.9, speed=5.1, duty=0.18, y_td=-0.27, hip_mid=0.886, bob=0.044, back=0.03, sway=0.012, lean=9.0,
    pelvis_yaw=9.0, chest_yaw=7.0, yaw_lag=0.02, list=2.0, pitch_osc=1.2, track=0.105, toe_out=4.0,
    strike=-11.0, roll_on=0.22, heel_rise=0.50, toe_off=58.0, drop=0.30, retract=0.7, swing_out=0.01,
    swing=lambda a0, a1: [(0.17, a0.y + 0.05, a0.z + 0.15, 52.0), (0.52, 0.14, 0.36, 24.0), (0.84, a1.y - 0.035, a1.z + 0.12, -16.0)],
    arm_mid=4.0, arm_swing=27.0, elbow=30.0, elbow_swing=14.0, arm_out=12.5, arm_open=2.0, arm_twist=20.0, arm_lag=0.03, shrug=2.5,
    wrist=10.0, asym=0.07,
)
RUN = dict(
    T=0.72, speed=9.2, duty=0.125, y_td=-0.25, hip_mid=0.875, bob=0.030, back=0.055, sway=0.008, lean=19.0,
    pelvis_yaw=13.0, chest_yaw=11.0, yaw_lag=0.02, list=2.5, pitch_osc=1.8, track=0.085, toe_out=2.0,
    strike=-5.0, roll_on=0.18, heel_rise=0.42, toe_off=62.0, drop=0.45, retract=0.5, swing_out=0.015,
    swing=lambda a0, a1: [(0.20, a0.y + 0.03, a0.z + 0.28, 80.0), (0.50, 0.02, 0.50, 40.0), (0.80, a1.y - 0.03, a1.z + 0.27, -10.0)],
    arm_mid=14.0, arm_swing=40.0, elbow=86.0, elbow_swing=12.0, arm_out=17.0, arm_open=6.0, arm_twist=12.0, arm_lag=0.03, shrug=4.0,
    wrist=12.0, asym=0.05,
)


def gait(t, g):
    """A bounding gait in place: one foot strikes at phase 0, the other at 0.5; the ground moves
    back under the planted foot at exactly `speed`, and both feet are off the ground in between."""
    T, v, duty = g['T'], g['speed'], g['duty']
    ph = (t / T) % 1.0
    apex = (duty + 0.5) / 2
    c2 = math.cos(2 * TAU * (ph - apex))                 # +1 at the top of each bound, -1 at mid-stance
    c1 = math.cos(TAU * (ph - duty / 2))                 # +1 in mid left stance, -1 in mid right stance
    yc = math.cos(TAU * (ph - g['yaw_lag']))
    lean = g['lean']
    p = Pose()
    p.root = Vector((g['sway'] * c1, g['back'], g['hip_mid'] - HIP.z + g['bob'] * c2))
    tw = (g['pelvis_yaw'] + g['chest_yaw']) * yc
    p.q['hips'] = Q(x=lean * 0.30 - g['pitch_osc'] * c2, y=-g['list'] * c1, z=-g['pelvis_yaw'] * yc)
    p.q['spine'] = Q(x=lean * 0.36, y=g['list'] * c1 * 0.7, z=tw * 0.5)
    p.q['chest'] = Q(x=lean * 0.34 + g['pitch_osc'] * c2 * 0.6, y=g['list'] * c1 * 0.3, z=tw * 0.5)
    p.q['neck'] = Q(x=-lean * 0.30, z=-g['chest_yaw'] * yc * 0.45)
    p.q['head'] = Q(x=-lean * 0.38 + g['pitch_osc'] * c2 * 0.5, z=-g['chest_yaw'] * yc * 0.45)
    for side, sx, off in (('L', 1, 0.0), ('R', -1, 0.5)):
        fp = (ph - off) % 1.0
        x, yaw = sx * g['track'], sx * g['toe_out']

        def stance(f):
            s = f / duty
            if s < g['roll_on']:
                pitch = g['strike'] * (1 - smooth01(s / g['roll_on']))
            elif s > g['heel_rise']:
                pitch = g['toe_off'] * ((s - g['heel_rise']) / (1 - g['heel_rise'])) ** 1.3
            else:
                pitch = 0.0
            return foot_pose(x, g['y_td'] + v * f * T, pitch, yaw)
        if fp <= duty:
            ankle, fq, pitch = stance(fp)
            p.leg(side, ankle, fq, toe=-max(pitch, 0.0))
        else:
            u = (fp - duty) / (1 - duty)
            a0, _, p0 = stance(duty)
            ab = stance(duty - 1e-3)[0]
            a1, _, p1 = stance(0.0)
            k = (1 - duty) / 1e-3
            m0 = ((a0.y - ab.y) * k, (a0.z - ab.z) * k, 0.0)
            m1 = (v * T * (1 - duty) * g['retract'], -g['drop'], 0.0)
            cur = Curve([(0.0, a0.y, a0.z, p0)] + g['swing'](a0, a1) + [(1.0, a1.y, a1.z, p1)], m0=m0, m1=m1)
            y, z, pitch = cur(u)
            p.leg(side, Vector((x + sx * g['swing_out'] * math.sin(math.pi * u), y, z)), Q(x=pitch, z=yaw),
                  toe=-p0 * (1 - smooth01(u / 0.30)))
    for side, sx in SIDES:
        a = TAU * (ph - g['arm_lag'])
        sw = -sx * math.cos(a)                            # an arm is forward when the opposite foot lands
        coming = sx * math.sin(a)                         # > 0 while the arm is on its way forward
        k = 1.0 - (g['asym'] if side == 'L' else 0.0)     # the two arms are not twins: the left, with the wrist computer, swings a little less
        p.shrug(side, up=g['shrug'] * 0.5 * (1 + c2), fwd=g['shrug'] * sw)
        hand = Quaternion(X_AX, rad(g['wrist'] * coming)) @ Quaternion(Y_AX, rad(sx * 6.0))      # the hand trails the forearm
        p.arm_fk(side, fwd=g['arm_mid'] + g['arm_swing'] * k * sw, out=g['arm_out'] + 0.5 * sx - g['arm_open'] * sw,
                 bend=g['elbow'] + g['elbow_swing'] * sw, twist=g['arm_twist'], hand_local=hand)
    return p


def clip_walk(t):
    return gait(t, WALK)


def clip_run(t):
    return gait(t, RUN)


JUMP_K = Keys([0.0, 0.12, 0.19, 0.25], ends='free', crouch=[0.0, 0.17, 0.09, -0.052], lean=[0, 26, 18, 7], heel=[0, 0, 12, 44],
              fwd=[3, -42, -5, 58], bend=[20, 34, 42, 50], out=[11, 15, 16, 17])


def clip_jump_start(t):
    k = JUMP_K(t)
    p = stand_pose(crouch=k['crouch'], lean=k['lean'], heel=max(k['heel'], 0.0), back=0.07 * max(k['crouch'], 0) / 0.17, arms=False)
    relaxed_arms(p, fwd=k['fwd'], out=k['out'], bend=k['bend'])
    return p


def air_pose(t=0.0):
    w = TAU / 1.0
    p = Pose()
    p.root = Vector((0.0, 0.01, 0.0))
    p.q['hips'] = Q(x=6 + 1.5 * math.sin(w * t), z=2 * math.sin(w * t + 1))
    p.q['spine'] = Q(x=4)
    p.q['chest'] = Q(x=3, z=-2 * math.sin(w * t + 1))
    p.q['neck'] = Q(x=-3)
    p.q['head'] = Q(x=-5)
    p.leg('L', Vector((0.125, -0.13 + 0.03 * math.sin(w * t), 0.105 + 0.19 + 0.025 * math.cos(w * t))), Q(x=22 + 4 * math.sin(w * t), z=5))
    p.leg('R', Vector((-0.125, 0.10 - 0.03 * math.sin(w * t), 0.105 + 0.24 - 0.025 * math.cos(w * t))), Q(x=34 - 4 * math.sin(w * t), z=-5))
    for side, sx in SIDES:
        p.shrug(side, up=5)
        p.arm_fk(side, fwd=14 + 6 * sx * math.sin(w * t + 0.4), out=48 + 5 * math.sin(w * t + 1.2 + sx), bend=34 + 5 * math.sin(w * t + 2.0 * sx), twist=30)
    return p


def clip_air(t):
    return air_pose(t)


LAND_K = Keys([0.0, 0.10, 0.22, 0.35], crouch=[0.035, 0.21, 0.10, 0.0], lean=[9, 30, 14, 0], heel=[14, 0, 0, 0],
              fwd=[20, 38, 18, 3], bend=[34, 48, 30, 20], out=[40, 30, 18, 11], back=[0.02, 0.08, 0.03, 0.0])


def clip_land(t):
    k = LAND_K(t)
    p = stand_pose(crouch=k['crouch'], lean=k['lean'], heel=max(k['heel'], 0.0), back=k['back'], arms=False)
    relaxed_arms(p, fwd=k['fwd'], out=k['out'], bend=k['bend'], twist=8 + (k['out'] - 11) * 0.7)
    return p


def clip_work_stand(t):
    """Standing at a console or a wall, leaning into it: the feet as in Idle (weight on the
    right, left foot ahead), the right hand wiping a circle at chest height with that shoulder
    following it, the left hand steadying itself and tapping, the head watching the work."""
    w = TAU / 2.0
    s1 = math.sin(w * t)
    circ = 2 * w * t                                       # the wiping hand goes round twice a loop
    lean = 9.0
    p = Pose()
    p.root = Vector((-0.028 + 0.010 * s1, 0.030 + 0.004 * math.sin(circ + 0.6), -0.040 - 0.004 * math.sin(circ + 1.2)))
    p.q['hips'] = Q(x=1.5 + lean * 0.38, y=3.2 + 0.8 * s1, z=-4.0)
    p.q['spine'] = Q(x=1.5 + lean * 0.34, y=-2.0 - 0.5 * s1, z=2.0)
    p.q['chest'] = Q(x=1.0 + lean * 0.28 + 1.0 * math.sin(circ), y=-2.6 + 1.6 * math.sin(circ + 0.5), z=5.0 + 3.0 * math.sin(w * t + 0.4))
    p.q['neck'] = Q(x=-1.5 - lean * 0.25, y=1.0, z=-3.0)
    p.q['head'] = Q(x=9 + 1.5 * math.sin(circ), y=1.5, z=-7 + 5 * math.sin(w * t + 0.4))
    p.plant('R', -0.108, 0.010, yaw=-7.0)
    p.plant('L', 0.135, -0.060, yaw=12.0, pole=(0.22, -1.0, 0.0))
    p.shrug('R', fwd=10, up=4.0 + 2.5 * math.sin(circ + 0.3))
    p.shrug('L', fwd=7, up=1.0 + 0.8 * s1)
    # right hand wipes a circle on a panel in front; left hand steadies itself and taps
    r = Vector((-0.15 + 0.07 * math.cos(circ), -0.50, 1.27 + 0.06 * math.sin(circ)))
    p.arm('R', r - Vector((0, -0.02, 0.085)), pole=(-0.85, 0.25, -0.45), hand=hand_q('R', (0.1, -0.25, 1), (0, -1, -0.2)))
    tap = max(0.0, math.sin(circ + 2.2)) ** 2
    l = Vector((0.15 + 0.01 * s1, -0.46 + 0.02 * tap, 1.14 + 0.012 * math.sin(w * t + 1)))
    p.arm('L', l, pole=(0.5, 0.35, -0.8), hand=hand_q('L', (-0.2, -1, 0.15), (0, 0.1 - 0.5 * tap, -1)))
    return p


KNEEL_FOOT = 50.0          # heel-up angle of a foot resting on its toes behind a grounded knee
KNEE_DOWN = 0.113          # height of the knee joint when the knee pad rests on the ground
KNEEL_KNEE_L = (1.0, -1, 0.25)                                   # where the raised left knee points: wide enough for the arm inside it
KNEEL_ELBOW = {'L': (1.0, 0.4, 0.6), 'R': (-0.8, 0.5, 0.3)}      # where the elbows point (the left one clear of that knee)


def clip_work_kneel(t):
    """Down on the right knee, left foot planted out to the side, both hands digging in front."""
    w = TAU / 2.0
    s2 = math.sin(2 * w * t)
    p = Pose()
    p.q['hips'] = Q(x=30 + 1.0 * s2, z=-5)
    p.q['spine'] = Q(x=20)
    p.q['chest'] = Q(x=17 + 2.0 * s2, z=5 + 3 * math.sin(w * t))
    p.q['neck'] = Q(x=-16)
    p.q['head'] = Q(x=-20 + 2 * math.sin(2 * w * t + 0.8), z=5 * math.sin(w * t + 0.5))
    ank, fq, _ = foot_pose(-0.15, 0.42, KNEEL_FOOT, -4)      # right foot back on its toes
    g = math.asin((ank.z - KNEE_DOWN) / L_SHIN)
    knee = ank - Vector((0, math.cos(g), math.sin(g))) * L_SHIN   # right knee on the ground
    a = rad(24)
    p.pin('thigh_R', BONE_HEAD['thigh_R'], knee + Vector((0, math.sin(a), math.cos(a))) * L_THIGH)
    p.leg('R', ank, fq, pole=(0, -1, -0.4), toe=-KNEEL_FOOT)
    p.plant('L', 0.33, -0.25, yaw=24, pole=KNEEL_KNEE_L)
    for side, sx in SIDES:
        p.shrug(side, fwd=12, up=-4)
        ph = 2 * w * t + (0 if side == 'R' else math.pi)
        c = Vector((sx * 0.105 - 0.075, -0.40, 0.262))
        wr = c + Vector((0.015 * math.sin(ph), -0.05 * math.cos(ph), 0.04 * math.sin(ph)))
        p.arm(side, wr, pole=KNEEL_ELBOW[side], hand=hand_q(side, (-sx * 0.12, -0.35 - 0.2 * math.cos(ph), -1), (0, 1, -0.3)))
    return p


def clip_drive(t):
    w = TAU / 3.0
    steer = 13 * math.sin(w * t) + 5 * math.sin(2 * w * t + 1.0)
    p = Pose()
    p.root = Vector((0, 0.0, 0.52 - BONE_HEAD['hips'].z))    # seated: hips bone 0.52 m above the floor
    p.q['hips'] = Q(x=-9)
    p.q['spine'] = Q(x=4, y=0.06 * steer)
    p.q['chest'] = Q(x=5, y=0.06 * steer, z=0.1 * steer)
    p.q['neck'] = Q(x=0, z=0.25 * steer)
    p.q['head'] = Q(x=-1 + 1.0 * math.sin(2 * w * t), z=0.45 * steer)
    for side, sx in SIDES:
        p.plant(side, sx * 0.15, -0.50 + 0.012 * sx * math.sin(w * t + 1), pitch=-8, yaw=sx * 8, pole=(sx * 0.25, -0.3, 1))
        p.shrug(side, fwd=7)
        a = rad(steer)
        grip = Vector((sx * 0.17 * math.cos(a), -0.43, 0.955 + sx * 0.17 * math.sin(a)))
        hd = Quaternion(Y_AX, -a) @ Vector((0, -0.75, 0.66))
        p.arm(side, grip - hd.normalized() * 0.085 + Vector((sx * 0.03, 0, 0)), pole=(sx * 0.75, 0.25, -0.6), hand=hand_q(side, hd, (-sx, 0, 0)))
    return p


def clip_stagger(t):
    T = 1.4
    ph = (t / T) % 1.0
    wp = TAU * (ph + 0.07 * math.sin(TAU * ph))             # uneven timing
    sway = math.sin(wp)
    heave = math.sin(2 * wp + 0.6)
    p = Pose()
    p.root = Vector((0.035 * sway + 0.01 * math.sin(2 * wp), 0.03 + 0.012 * math.sin(wp + 1.3), -0.07 - 0.012 * heave))
    p.q['hips'] = Q(x=9 + 1.5 * heave, y=3.0 * sway, z=3 * math.sin(wp + 0.5))
    p.q['spine'] = Q(x=13 + 2.5 * heave, y=-2.0 * sway)
    p.q['chest'] = Q(x=12 + 3.0 * heave, y=-2.5 * sway + 3, z=-4 * math.sin(wp + 0.5) + 5)
    p.q['neck'] = Q(x=6 + 2 * heave, y=3 * sway)
    p.q['head'] = Q(x=8 + 4 * math.sin(2 * wp - 0.4), y=4 * sway, z=6 * math.sin(wp - 0.8))

    def bump(x):
        return math.sin(math.pi * min(max(x, 0.0), 1.0)) ** 2
    lift_l = 0.045 * bump((ph - 0.56) / 0.26)             # the unloaded foot drags up and replants
    lift_r = 0.022 * bump((ph - 0.08) / 0.2)
    p.plant('L', STANCE_X + 0.02, 0.03 - 0.02 * bump((ph - 0.56) / 0.26), pitch=14 * bump((ph - 0.56) / 0.26), yaw=11, lift=lift_l)
    p.plant('R', -STANCE_X - 0.01, -0.03, pitch=8 * bump((ph - 0.08) / 0.2), yaw=-6, lift=lift_r)
    p.shrug('L', fwd=14, up=6 + 2 * heave)
    p.shrug('R', fwd=3, up=-2 + 2 * heave)
    # left hand clutches the chest unit; right arm hangs and swings loosely
    palm = p.point('chest', (0.035 + 0.006 * heave, -0.302, 1.262 + 0.008 * heave))
    F = p.frames()[0]['chest']
    hd = F @ Vector((-0.85, 0.05, 0.35)).normalized()
    p.arm('L', palm - hd * 0.085, pole=F @ Vector((0.75, 0.2, -0.6)), hand=F @ hand_q('L', (-0.85, 0.05, 0.35), (0.1, 1, 0.15)))
    p.arm_fk('R', fwd=10 + 7 * math.sin(wp + 2.2), out=9 + 3 * sway, bend=22 + 6 * math.sin(wp + 2.8), twist=6)
    return p


def clip_collapse(t):
    """Stands, knees give way, drops onto both knees, tips forward and ends face down, still."""
    kA = smooth01(t / 0.80) ** 1.25                         # 0 standing .. 1 on the knees
    tc = min(max((t - 1.02) / 0.72, 0.0), 1.0)
    fall = tc * tc * (3 - 2 * tc) * tc ** 0.4               # slow tip, then a quick drop
    rebound = 3.0 * math.sin(math.pi * min(max((t - 1.74) / 0.2, 0.0), 1.0)) ** 2
    pitch_foot = KNEEL_FOOT * kA ** 1.2
    x0 = STANCE_X
    ank_k, _, _ = foot_pose(x0, 0.0, KNEEL_FOOT, 0.0)       # where the ankles end up (on the toes)
    gam = math.asin(min(1.0, (ank_k.z - KNEE_DOWN) / L_SHIN))
    knee_k = ank_k - Vector((0, math.cos(gam), math.sin(gam))) * L_SHIN
    a_kneel = rad(-5)                                       # hips just behind the knees when kneeling
    a_end = rad(79.5)
    hip_s = Vector((0.0, 0.012, HIP.z - 0.012))
    hip_k = Vector((0.0, knee_k.y - math.sin(a_kneel) * L_THIGH, knee_k.z + math.cos(a_kneel) * L_THIGH))
    p = Pose()
    if t < 0.80:
        hip = hip_s.lerp(hip_k, kA)
        hip.y = lerp(hip_s.y, hip_k.y, smooth01(t / 0.80) ** 0.9)
        lean = lerp(1.5, 7.0, kA) + 5.0 * math.sin(math.pi * kA)
        slump = 9.0 * kA
    else:
        a = lerp(a_kneel, a_end, fall) - rad(rebound) * 0.6 + rad(2.0) * math.sin(TAU * (t - 0.8) / 0.9) * (1 - tc)
        hip = Vector((0.0, knee_k.y - math.sin(a) * L_THIGH, knee_k.z + math.cos(a) * L_THIGH))
        lean = lerp(7.0, 73.0, smooth01(tc * 1.04)) - rebound
        slump = lerp(9.0, 5.0, fall)
    wob = math.sin(TAU * t / 0.9) * (1 - fall) * min(t / 0.3, 1.0)
    p.q['hips'] = Q(x=lean, y=1.5 * wob)
    p.q['spine'] = Q(x=slump + 1.5, y=-1.0 * wob + 3.0 * fall, z=5.0 * fall)
    p.q['chest'] = Q(x=slump * 0.8 + 1.0)
    p.q['neck'] = Q(x=lerp(-1.5 + 12 * kA, -6, fall), z=22 * fall)
    p.q['head'] = Q(x=lerp(-2 + 14 * kA, -6, fall), z=30 * fall, y=-6 * fall)
    p.pin('hips', (0, 0, HIP.z), hip)
    for side, sx in SIDES:
        ankle, fq, _ = foot_pose(sx * x0, 0.0, pitch_foot, sx * TOE_OUT * (1 - kA))
        p.leg(side, ankle, fq, pole=(sx * 0.12, -1, -0.7), toe=-pitch_foot)
    # arms: hang, come forward as he tips, and end flat on the ground beside the helmet
    for side, sx in SIDES:
        p.shrug(side, fwd=12 * tc, up=8 * tc)
        q = Pose()
        q.root, q.q = p.root.copy(), dict(p.q)
        q.arm_fk(side, fwd=3 + 10 * kA + 55 * smooth01(tc * 1.6), out=11 + 14 * tc, bend=20 + 28 * kA * (1 - tc) + 40 * tc, twist=8 + 30 * tc)
        if tc <= 0.0:
            p.q.update({k: q.q[k] for k in ('upper_arm_' + side, 'forearm_' + side, 'hand_' + side)})
        else:
            Pq = q.frames()[1]
            if side == 'L':
                end, hq = Vector((0.31, hip.y - 0.68, 0.088)), hand_q('L', (-0.3, -1, 0.0), (0, 0, -1))
            else:
                end, hq = Vector((-0.42, hip.y - 0.30, 0.088)), hand_q('R', (0.45, -1, 0.0), (0, 0, -1))
            g = smooth01((tc - 0.5) / 0.5)
            tgt = Pq['hand_' + side].lerp(end, g)
            tgt.z = max(tgt.z, 0.088)
            pole = (Pq['forearm_' + side] - Pq['upper_arm_' + side]).normalized().lerp(Vector((sx * 1.0, 0.45, 0.75 - 0.6 * smooth01((tc - 0.8) / 0.2))), g)
            p.arm(side, tgt, pole=pole)
            gh = smooth01((tc - 0.2) / 0.6)
            p.q['hand_' + side] = Quaternion().slerp(p.frames()[0]['forearm_' + side].inverted() @ hq, gh)
    return p


WAVE_K = Keys([0.0, 0.55, 1.45, 2.0], up=[0, 1, 1, 0])


def clip_wave(t):
    """Raises the right arm and gives a big slow wave (two and a half sweeps), then lowers it."""
    up = min(max(WAVE_K(t)['up'], 0.0), 1.0)
    sw = math.sin(TAU * (t - 0.5) / 0.6) * smooth01((t - 0.42) / 0.25) * smooth01((1.56 - t) / 0.25)
    p = stand_pose(arms=False)
    p.root.x += 0.014 * up
    p.q['hips'] = p.q['hips'] @ Q(y=1.5 * up)
    p.q['spine'] = p.q['spine'] @ Q(y=1.5 * up)
    p.q['chest'] = p.q['chest'] @ Q(y=2.0 * up + 1.5 * sw, z=-5 * up)
    p.q['neck'] = Q(x=-1.5, z=-4 * up)
    p.q['head'] = Q(x=-2 - 5 * up, z=-8 * up, y=-3 * up + 2.0 * sw)
    for side, sx in SIDES:
        p.plant(side, sx * STANCE_X, 0.0, yaw=sx * TOE_OUT)
    p.arm_fk('L', fwd=3 - 3 * up, out=11 + 4 * up, bend=20 + 6 * up, twist=8)
    q = Pose()
    q.root, q.q = p.root.copy(), dict(p.q)
    q.arm_fk('R', fwd=3, out=11, bend=20, twist=8)
    Pq = q.frames()[1]
    p.shrug('R', up=14 * up, fwd=-2 * up)
    F, P = p.frames()
    sh = P['upper_arm_R']
    elbow = sh + (F['chest'] @ Vector((-0.84, -0.26, 0.48)).normalized()) * L_UPPER
    ang = rad(10 + 30 * sw)
    fd = (F['chest'] @ Vector((-math.sin(ang), -0.14, math.cos(ang)))).normalized()
    g = smooth01(up)
    tgt = Pq['hand_R'].lerp(elbow + fd * L_FORE, g) + Vector((-0.05, -0.16, 0.0)) * math.sin(math.pi * g)   # the hand comes up in front
    pole = (Pq['forearm_R'] - Pq['upper_arm_R']).normalized().lerp((elbow - sh).normalized(), g)
    p.arm('R', tgt, pole=pole)
    Ff = p.frames()[0]['forearm_R']
    p.q['hand_R'] = Quaternion().slerp(Ff.inverted() @ hand_q('R', fd + Vector((-0.35 * sw, 0, 0)), (0, -1, 0.0)), g)
    return p


def clip_test(t):
    """Debug only (--debug): extreme poses to check the skin."""
    k = int(t)
    f = smooth01(t - k) if t < 5.99 else 1.0
    poses = [stand_pose()]
    a = stand_pose(crouch=0.36, lean=34, back=0.14, arms=False)
    relaxed_arms(a, fwd=70, out=14, bend=20)
    poses.append(a)
    b = stand_pose(arms=False)
    for side, sx in SIDES:
        b.shrug(side, up=16)
        b.arm_fk(side, fwd=10, out=150, bend=10, twist=20)
    poses.append(b)
    c = stand_pose(arms=False)
    relaxed_arms(c, fwd=35, out=14, bend=120, twist=10)
    c.q['head'] = Q(x=-12, z=40)
    poses.append(c)
    d = stand_pose(lean=30, arms=False)
    d.q['chest'] = d.q['chest'] @ Q(z=25, y=8)
    relaxed_arms(d, fwd=-45, out=20, bend=30)
    poses.append(d)
    e = clip_work_kneel(0.0)
    poses.append(e)
    poses.append(stand_pose())
    return mix(poses[min(k, 5)], poses[min(k + 1, 6)], f)


# Notes for whoever plays these clips in the game:
#   * Idle is eight seconds and stands on the right leg with the left foot 35 mm ahead (see
#     idle_pose). WorkStand keeps nearly the same feet. JumpStart, Land, Wave and Collapse still
#     begin or end in the square stance of stand_pose(): the cross-fade to or from Idle moves the
#     feet about 4 cm, which reads as settling.
#   * Idle stands upright by itself (knees 5 and 7 degrees, hips over the ankles, trunk 1.5
#     degrees forward, arms at the sides): play it without any added spine rotation. stand_pose()
#     is still the older ready stance (knees 19.5 degrees, hips 12 mm low, hands ahead of the
#     thighs), so a clip that starts in it (JumpStart, Wave, Collapse) dips about 9 mm out of Idle
#     and Land rises the same 9 mm into it.
#   * Idle to WorkKneel and back: the left hand crosses the left knee pad in the middle third of
#     the cross-fade (it hangs outside the thigh in Idle and works inside the raised knee in
#     WorkKneel). A plain cross-fade cannot avoid that; it wants a shorter fade or a clip of its own.
#   * Above the neck ring there are two groups, told apart by material name, and the game shows
#     one: the helmet (helmet_white, helmet_dark, helmet_metal, helmet_light, visor_gold) and the
#     bare head (head_skin, head_cap, head_dark). Each fits inside the other's space, so nothing
#     has to move when they are swapped.
#   * Walk and Run are in place. The planted foot moves back at exactly TREADMILL[name] m/s, so
#     the clip matches the ground when the body is moved at that speed and the clip plays at 1x.
#   * Drive is seated with the feet on the model's ground plane: the hips bone sits 0.52 m above
#     the model origin (and straight above it). Put the origin 0.52 m below the seat anchor.
#   * Collapse is not in place: he drops onto his knees about 0.5 m ahead of where he stood and
#     falls forward from there, so the body ends between 0 and 1.85 m in front of the origin.
#   * JumpStart ends on the toes at take-off; Land starts at touch-down and ends in the Idle stance.
#   * Anchors (lamp_L, lamp_R, eye on the head; hand_grip_R on the right hand): in the rest pose
#     their axes equal the model's axes, so an anchor's local +Z is the astronaut's forward.
CLIPS = [  # name, seconds, samples, loop, function
    ('Idle', IDLE_T, 96, True, clip_idle),
    ('Walk', 0.9, 54, True, clip_walk),
    ('Run', 0.72, 54, True, clip_run),
    ('JumpStart', 0.25, 15, False, clip_jump_start),
    ('Air', 1.0, 30, True, clip_air),
    ('Land', 0.35, 21, False, clip_land),
    ('WorkKneel', 2.0, 60, True, clip_work_kneel),
    ('WorkStand', 2.0, 60, True, clip_work_stand),
    ('Drive', 3.0, 72, True, clip_drive),
    ('Stagger', 1.4, 56, True, clip_stagger),
    ('Collapse', 2.2, 110, False, clip_collapse),
    ('Wave', 2.0, 80, False, clip_wave),
]
TREADMILL = {'Walk': WALK['speed'], 'Run': RUN['speed']}


def sample_clip(fn, seconds, n, loop):
    times = [seconds * i / n for i in range(n + 1)]
    poses = [fn(seconds * (i % n if loop else i) / n) for i in range(n + 1)]
    return times, poses


# ==============================================================================================
# Clip linter: skin the real vertices in numpy and measure what the eye would catch
# ==============================================================================================
class Skin:
    def __init__(self, path=SKIN_NPZ):
        d = np.load(path)
        self.co, self.W = d['co'].astype(np.float64), d['W'].astype(np.float64)
        self.names = [str(n) for n in d['names']]
        self.pid = d['pid']
        self.tris = int(d['tris'])
        self.heads = np.array([BONE_HEAD[n] for n in BONE_NAMES])
        self.used = [np.nonzero(self.W[:, b] > 0)[0] for b in range(len(BONE_NAMES))]

    def select(self, *prefixes):
        ids = [i for i, n in enumerate(self.names) if any(n.startswith(p) for p in prefixes)]
        return np.nonzero(np.isin(self.pid, ids))[0]

    def deform(self, pose):
        F, P = pose.frames()
        out = np.zeros_like(self.co)
        for b, n in enumerate(BONE_NAMES):
            idx = self.used[b]
            if not len(idx):
                continue
            R = np.array(F[n].to_matrix())
            out[idx] += self.W[idx, b:b + 1] * ((self.co[idx] - self.heads[b]) @ R.T + np.array(P[n]))
        return out, F, P


def _to_rest(v, F, P, bone):
    """Posed points back into the rest space of one bone (to test against a rest-space proxy)."""
    R = np.array(F[bone].to_matrix())
    return (v - np.array(P[bone])) @ R + np.array(BONE_HEAD[bone])


def _box_depth(v, c, h):
    return np.min(np.array(h) - np.abs(v - np.array(c)), axis=1)


def _capsule_depth(v, a, b, r):
    a, b = np.array(a), np.array(b)
    ab = b - a
    t = np.clip(((v - a) @ ab) / (ab @ ab), 0, 1)
    return r - np.linalg.norm(v - (a + t[:, None] * ab), axis=1)


PROXIES = [  # label, bone, depth function on rest-space points (metres inside; > 0 means penetration)
    ('torso', 'chest', lambda v: np.where((v[:, 2] > 1.11) & (v[:, 2] < 1.5), (1 - np.sqrt((v[:, 0] / 0.186) ** 2 + (v[:, 1] / 0.153) ** 2)) * 0.15, -1)),
    ('chest unit', 'chest', lambda v: _box_depth(v, (0, -0.193, 1.272), (0.104, 0.04, 0.066))),
    ('backpack', 'chest', lambda v: _box_depth(v, (0, 0.24, 1.27), (0.186, 0.098, 0.283))),
    ('helmet', 'head', lambda v: R_SHELL - np.linalg.norm(v - np.array(HELMET_C), axis=1)),
    ('pelvis', 'hips', lambda v: np.where((v[:, 2] > 0.86) & (v[:, 2] < 1.045), (1 - np.sqrt((v[:, 0] / 0.18) ** 2 + (v[:, 1] / 0.134) ** 2)) * 0.13, -1)),
    ('thigh_L', 'thigh_L', lambda v: _capsule_depth(v, HIP, KNEE, 0.09)),
    ('thigh_R', 'thigh_R', lambda v: _capsule_depth(v, _mx(HIP), _mx(KNEE), 0.09)),
    ('shin_L', 'shin_L', lambda v: _capsule_depth(v, KNEE, ANKLE, 0.075)),
    ('shin_R', 'shin_R', lambda v: _capsule_depth(v, _mx(KNEE), _mx(ANKLE), 0.075)),
]
HAND_PIECES = ('glove', 'fingers', 'thumb', 'finger_seams', 'wrist_ring', 'wrist_latch', 'forearm', 'wristcomp')
SOLE_PTS = [('foot', (0, HEEL_Y, 0.0)), ('foot', (0, 0.0, 0.0)), ('toe', (0, BALL.y, 0.0)), ('toe', (0, TOE_TIP.y, 0.0))]


def lint_clip(skin, name, times, poses, loop, verbose=True):
    hands = {s: skin.select(*[h + '_' + s for h in HAND_PIECES]) for s in 'LR'}
    low, low_at, pen, slip, knee, elbow, notes = 9.0, None, {}, 0.0, 0.0, 0.0, set()
    speed = TREADMILL.get(name, 0.0)
    prev = None
    for i, (t, pose) in enumerate(zip(times, poses)):
        v, F, P = skin.deform(pose)
        j = int(np.argmin(v[:, 2]))
        if v[j, 2] < low:
            low, low_at = float(v[j, 2]), (t, skin.names[skin.pid[j]])
        for label, bone, fn in PROXIES:
            for s in 'LR':
                d = fn(_to_rest(v[hands[s]], F, P, bone))
                m = float(d.max())
                if m > 0.004 and m > pen.get((label, s), (0, 0))[0]:
                    pen[(label, s)] = (m, t)
        cur = {}
        for s, sx in SIDES:
            for k, (bone, pt) in enumerate(SOLE_PTS):
                cur[(s, k)] = pose.point(bone + '_' + s, (sx * ANKLE.x, pt[1], pt[2]))
            for a, b in (('thigh', 'shin'), ('upper_arm', 'forearm')):
                ang = math.degrees((F[a + '_' + s] @ REST_DIR[a + '_' + s]).angle(F[b + '_' + s] @ REST_DIR[b + '_' + s]))
                if a == 'thigh':
                    knee = max(knee, ang)
                else:
                    elbow = max(elbow, ang)
        if prev is not None:
            dt = t - prev[0]
            for key, pt in cur.items():
                q = prev[1][key]
                if pt.z < 0.0005 and q.z < 0.0005:
                    slip = max(slip, ((pt - q) / dt - Vector((0, speed, 0))).length)
        prev = (t, cur)
        notes.update(pose.notes)
    closed = True
    if loop:
        closed = all((poses[0].q[n].rotation_difference(poses[-1].q[n]).angle < 1e-6) for n in BONE_NAMES) and (poses[0].root - poses[-1].root).length < 1e-9
    bad = []
    if low < -0.004:
        bad.append('BELOW GROUND %.0f mm (%s at %.2fs)' % (-low * 1000, low_at[1], low_at[0]))
    for (label, s), (m, t) in sorted(pen.items()):
        bad.append('hand_%s in %s %.0f mm at %.2fs' % (s, label, m * 1000, t))
    if slip > 0.25:
        bad.append('foot slip %.2f m/s' % slip)
    if knee > 140 or elbow > 140:
        bad.append('joint folded (knee %.0f, elbow %.0f)' % (knee, elbow))
    if not closed:
        bad.append('LOOP DOES NOT CLOSE')
    bad += sorted(notes)
    if verbose:
        print('  %-10s %5.2fs %3d keys  lowest %+5.0f mm  slip %.2f m/s  knee %3.0f  elbow %3.0f  %s'
              % (name, times[-1], len(times), low * 1000, slip, knee, elbow, ('!! ' + '; '.join(bad)) if bad else 'ok'))
    return bad


# ==============================================================================================
# Writing the clips into the .glb
# ==============================================================================================
def load_rest(gltf):
    """Rest rotations of the bones as the exporter wrote them."""
    nodes = gltf['nodes']
    idx = {n.get('name'): i for i, n in enumerate(nodes)}
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []):
            parent[c] = i

    def local_q(i):
        r = nodes[i].get('rotation', (0, 0, 0, 1))
        return Quaternion((r[3], r[0], r[1], r[2]))

    def world_q(i):
        q = local_q(i)
        while i in parent:
            i = parent[i]
            q = local_q(i) @ q
        return q
    to_blender = Quaternion(X_AX, rad(90))                  # glTF (Y up) -> Blender (Z up)
    rest = {}
    for n in BONE_NAMES:
        i = idx[n]
        Rr = to_blender @ world_q(i)
        assert (Rr @ Y_AX - REST_DIR[n]).length < 1e-3, 'unexpected rest orientation for ' + n
        rest[n] = dict(node=i, local=local_q(i), R=Rr, t=Vector(nodes[i].get('translation', (0, 0, 0))))
    return rest


def inject_clips(gltf, blob, rest, clips):
    gltf['animations'] = []
    for name, times, poses in clips:
        t_acc = _add_accessor(gltf, blob, np.array(times, dtype=np.float32), 'SCALAR', minmax=True)
        samplers, channels = [], []
        for n in BONE_NAMES:
            r = rest[n]
            Ri = r['R'].inverted()
            out, prev = [], None
            for pose in poses:
                q = r['local'] @ (Ri @ pose.q[n] @ r['R'])
                q.normalize()
                if prev is not None and prev.dot(q) < 0:
                    q.negate()
                prev = q
                out.append((q.x, q.y, q.z, q.w))
            samplers.append({'input': t_acc, 'output': _add_accessor(gltf, blob, np.array(out), 'VEC4'), 'interpolation': 'LINEAR'})
            channels.append({'sampler': len(samplers) - 1, 'target': {'node': r['node'], 'path': 'rotation'}})
        r = rest['hips']
        tr = [(r['t'].x + p.root.x, r['t'].y + p.root.z, r['t'].z - p.root.y) for p in poses]
        samplers.append({'input': t_acc, 'output': _add_accessor(gltf, blob, np.array(tr), 'VEC3'), 'interpolation': 'LINEAR'})
        channels.append({'sampler': len(samplers) - 1, 'target': {'node': r['node'], 'path': 'translation'}})
        gltf['animations'].append({'name': name, 'samplers': samplers, 'channels': channels})


def build_astronaut(anim_only=False, fast=False, debug=False, out=None):
    t0 = time.time()
    if not (anim_only and os.path.exists(MESH_RAW) and os.path.exists(SKIN_NPZ)):
        build_mesh(fast=fast)
    skin = Skin()
    gltf, blob = read_glb(MESH_RAW)
    rest = load_rest(gltf)
    clips, problems = [], 0
    todo = CLIPS + ([('Test', 6.0, 60, False, clip_test)] if debug else [])
    print('clips:')
    for name, seconds, n, loop, fn in todo:
        times, poses = sample_clip(fn, seconds, n, loop)
        problems += len(lint_clip(skin, name, times, poses, loop))
        clips.append((name, times, poses))
    inject_clips(gltf, blob, rest, clips)
    write_glb(FULL_RAW, gltf, blob)
    os.makedirs(OUT_DIR, exist_ok=True)
    out = out or os.path.join(OUT_DIR, NAME + '.glb')
    kb = pack(FULL_RAW, out)
    info = {'name': NAME, 'triangles': skin.tris, 'raw_kb': round(os.path.getsize(FULL_RAW) / 1024, 1), 'kb': kb,
            'clips': len(clips), 'lint_problems': problems, 'seconds': round(time.time() - t0, 1)}
    if skin.tris > TRI_BUDGET:
        print('!! over the triangle budget')
    print('EXPORTED', json.dumps(info))
    return info


if __name__ == '__main__':
    args = sys.argv[1:]
    out_file = args.pop(args.index('--out') + 1) if '--out' in args else None
    names = [a for a in args if not a.startswith('--')]
    if not names or NAME in names:
        build_astronaut(anim_only='--anim-only' in args, fast='--fast' in args, debug='--debug' in args, out=out_file)
