"""
STRANDED II asset build — Blender (bpy 4.5) headless.
Models every hero asset with bmesh (context-free), exports a compact
triangle-soup JSON in three.js coordinates (y-up), one flat color per part.
Run: python3 build_assets.py
"""
import bpy
import bmesh
import json
import math
from mathutils import Matrix, Vector

OUT = '/tmp/claude-0/-home-user-workos-test-app/f44333ad-cc31-5ec8-b69f-a6cd23bbe455/scratchpad/blender/models.json'

# ---------------------------------------------------------------- helpers
class Part:
    def __init__(self, name, color, pivot=(0, 0, 0), opacity=None, emissive=None):
        self.name = name
        self.color = color
        self.pivot = pivot          # blender coords; converted on export
        self.opacity = opacity
        self.emissive = emissive
        self.bm = bmesh.new()

    def _xform(self, mat):
        bmesh.ops.transform(self.bm, matrix=mat, verts=self.bm.verts[:])

    def box(self, sx, sy, sz, at=(0, 0, 0), rot=None):
        ret = bmesh.ops.create_cube(self.bm, size=1)
        verts = ret['verts']
        m = Matrix.Diagonal((sx, sy, sz, 1))
        if rot:
            m = Matrix.Rotation(rot[1], 4, rot[0]) @ m
        m = Matrix.Translation(at) @ m
        bmesh.ops.transform(self.bm, matrix=m, verts=verts)
        return verts

    def cyl(self, r1, r2, depth, at=(0, 0, 0), seg=12, axis='Z', rot=None, cap=True):
        ret = bmesh.ops.create_cone(self.bm, cap_ends=cap, cap_tris=True,
                                    segments=seg, radius1=r1, radius2=r2, depth=depth)
        verts = ret['verts']
        m = Matrix.Identity(4)
        if axis == 'X':
            m = Matrix.Rotation(math.pi / 2, 4, 'Y') @ m
        elif axis == 'Y':
            m = Matrix.Rotation(math.pi / 2, 4, 'X') @ m
        if rot:
            m = Matrix.Rotation(rot[1], 4, rot[0]) @ m
        m = Matrix.Translation(at) @ m
        bmesh.ops.transform(self.bm, matrix=m, verts=verts)
        return verts

    def sphere(self, r, at=(0, 0, 0), seg=10, rings=8, scale_z=1.0):
        ret = bmesh.ops.create_uvsphere(self.bm, u_segments=seg, v_segments=rings, radius=r)
        verts = ret['verts']
        m = Matrix.Translation(at) @ Matrix.Diagonal((1, 1, scale_z, 1))
        bmesh.ops.transform(self.bm, matrix=m, verts=verts)
        return verts

    def torus(self, R, r, at=(0, 0, 0), seg=20, ring_seg=8, rot=None):
        # build torus manually (no bmesh torus op)
        verts_grid = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            ring = []
            for j in range(ring_seg):
                b = 2 * math.pi * j / ring_seg
                x = (R + r * math.cos(b)) * math.cos(a)
                y = (R + r * math.cos(b)) * math.sin(a)
                z = r * math.sin(b)
                ring.append(self.bm.verts.new((x, y, z)))
            verts_grid.append(ring)
        for i in range(seg):
            for j in range(ring_seg):
                a0 = verts_grid[i][j]
                a1 = verts_grid[i][(j + 1) % ring_seg]
                b0 = verts_grid[(i + 1) % seg][j]
                b1 = verts_grid[(i + 1) % seg][(j + 1) % ring_seg]
                self.bm.faces.new((a0, b0, b1, a1))
        flat = [v for ring in verts_grid for v in ring]
        m = Matrix.Identity(4)
        if rot:
            m = Matrix.Rotation(rot[1], 4, rot[0])
        m = Matrix.Translation(at) @ m
        bmesh.ops.transform(self.bm, matrix=m, verts=flat)
        return flat

    def export(self):
        bmesh.ops.triangulate(self.bm, faces=self.bm.faces[:])
        tris = []
        for f in self.bm.faces:
            for v in f.verts:
                # blender (x,y,z) -> three (x, z, -y)
                tris.extend((round(v.co.x * 1000), round(v.co.z * 1000), round(-v.co.y * 1000)))
        px, py, pz = self.pivot
        out = {
            'n': self.name,
            'c': [round(c, 3) for c in self.color],
            'p': [round(px * 1000), round(pz * 1000), round(-py * 1000)],
            'v': tris,
        }
        if self.opacity is not None:
            out['o'] = self.opacity
        if self.emissive is not None:
            out['e'] = self.emissive
        self.bm.free()
        return out


ASSETS = {}
def asset(name):
    def deco(fn):
        ASSETS[name] = fn
        return fn
    return deco

# palette
WHITE = (0.85, 0.82, 0.75)
HULL = (0.78, 0.75, 0.68)
ORANGE = (0.75, 0.42, 0.18)
DARKMETAL = (0.28, 0.29, 0.31)
GREYMETAL = (0.52, 0.54, 0.56)
SOLAR = (0.11, 0.17, 0.32)
SOLAR2 = (0.15, 0.24, 0.42)
TIRE = (0.16, 0.16, 0.17)
GOLD = (0.72, 0.55, 0.22)
GLASS = (0.60, 0.72, 0.78)
REDPAINT = (0.62, 0.16, 0.10)
ICE = (0.82, 0.92, 0.96)

# ---------------------------------------------------------------- rover
# Forward is -Y in blender space (exports to -Z in three, matching the game).
@asset('rover')
def rover():
    parts = []
    ch = Part('chassis', HULL)
    ch.box(2.3, 3.9, 0.9, at=(0, 0, 1.35))                       # main body
    ch.box(2.34, 3.94, 0.16, at=(0, 0, 0.86))                    # belly plate
    ch.box(2.0, 1.4, 0.8, at=(0, 0.9, 2.1))                      # aft equipment hump
    ch.cyl(0.09, 0.09, 2.2, at=(0, 1.4, 1.4), axis='X')          # axle fairings
    ch.cyl(0.09, 0.09, 2.2, at=(0, -1.4, 1.4), axis='X')
    parts.append(ch)
    stripe = Part('stripe', ORANGE)
    stripe.box(2.32, 0.5, 0.92, at=(0, 1.1, 1.35))
    stripe.box(0.4, 3.92, 0.06, at=(-0.7, 0, 1.83))
    parts.append(stripe)
    cab = Part('cab', GLASS, opacity=0.55)
    cab.box(1.9, 1.5, 0.95, at=(0, -1.05, 2.25))                 # windshield cab, forward
    parts.append(cab)
    cabf = Part('cabframe', WHITE)
    cabf.box(2.0, 1.6, 0.12, at=(0, -1.05, 2.78))                # cab roof
    cabf.box(2.0, 0.14, 1.0, at=(0, -1.82, 2.25))                # front frame
    parts.append(cabf)
    # six wheels, pivots at hubs; wheel geometry centered so rotation.x rolls
    for i in range(6):
        wx = -1.35 if i % 2 == 0 else 1.35
        wy = -1.5 + (i // 2) * 1.5
        w = Part('wheel%d' % i, TIRE, pivot=(wx, wy, 0.62))
        w.cyl(0.6, 0.6, 0.5, seg=14, axis='X')
        w.cyl(0.34, 0.34, 0.54, seg=8, axis='X')                 # hub
        parts.append(w)
    ant = Part('antenna', GREYMETAL)
    ant.cyl(0.03, 0.03, 1.6, at=(0.85, 0.5, 3.4))
    ant.sphere(0.09, at=(0.85, 0.5, 4.2))
    ant.cyl(0.34, 0.02, 0.3, at=(-0.7, -1.5, 3.0), seg=10)       # headlight cones
    ant.cyl(0.34, 0.02, 0.3, at=(0.7, -1.5, 3.0), seg=10)
    parts.append(ant)
    dish = Part('dish', WHITE)
    dish.cyl(0.42, 0.06, 0.22, at=(-0.8, 0.9, 3.05), seg=12, rot=('X', 0.7))
    parts.append(dish)
    return parts

# ---------------------------------------------------------------- MAV
@asset('mav')
def mav():
    parts = []
    eng = Part('engines', DARKMETAL)
    eng.cyl(1.35, 1.05, 1.1, at=(0, 0, 0.75))                    # engine skirt
    for i in range(3):
        a = i * 2 * math.pi / 3
        eng.cyl(0.42, 0.18, 0.8, at=(math.cos(a) * 0.55, math.sin(a) * 0.55, 0.45), seg=10)
    parts.append(eng)
    tank = Part('tank', WHITE)
    tank.cyl(1.55, 1.62, 4.6, at=(0, 0, 3.6), seg=18)            # first stage
    tank.cyl(1.42, 1.42, 0.5, at=(0, 0, 6.1), seg=18)            # interstage
    parts.append(tank)
    lines = Part('fuellines', GREYMETAL)
    lines.cyl(0.09, 0.09, 4.4, at=(1.52, 0.3, 3.6))
    lines.cyl(0.09, 0.09, 4.4, at=(-1.45, -0.5, 3.6))
    parts.append(lines)
    band = Part('band', ORANGE)
    band.cyl(1.64, 1.64, 0.5, at=(0, 0, 4.9), seg=18)
    parts.append(band)
    cap = Part('capsule', HULL)
    cap.cyl(1.28, 1.5, 1.9, at=(0, 0, 7.3), seg=16)              # ascent capsule
    parts.append(cap)
    win = Part('window', GLASS, opacity=0.7)
    win.box(0.7, 0.9, 0.5, at=(0, -1.25, 7.5))
    parts.append(win)
    nose = Part('nose', ORANGE)
    nose.cyl(1.32, 0.05, 2.4, at=(0, 0, 9.5), seg=16)            # jettisonable
    parts.append(nose)
    legs = Part('legs', GREYMETAL)
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        x, y = math.cos(a), math.sin(a)
        legs.cyl(0.12, 0.16, 3.4, at=(x * 1.95, y * 1.95, 1.5), rot=('Y' if abs(x) > abs(y) else 'X', 0.55 * (1 if (x if abs(x) > abs(y) else -y) > 0 else -1)))
        legs.cyl(0.5, 0.55, 0.16, at=(x * 2.85, y * 2.85, 0.08), seg=10)
    parts.append(legs)
    st = Part('strobe', REDPAINT, emissive=(0.9, 0.2, 0.1))
    st.cyl(0.05, 0.05, 1.2, at=(0, 0, 11.2))
    st.sphere(0.16, at=(0, 0, 11.9))
    parts.append(st)
    return parts

# ---------------------------------------------------------------- pathfinder
@asset('pathfinder')
def pathfinder():
    parts = []
    base = Part('base', GOLD)
    base.cyl(1.15, 1.3, 0.45, at=(0, 0, 0.28), seg=8)
    parts.append(base)
    core = Part('core', WHITE)
    core.cyl(0.55, 0.75, 0.7, at=(0, 0, 0.8), seg=8)
    parts.append(core)
    for i in range(3):
        a = i * 2 * math.pi / 3
        p = Part('petal%d' % i, SOLAR)
        p.box(1.6, 1.45, 0.06, at=(0, 0, 0))
        m = Matrix.Translation((math.cos(a) * 1.6, math.sin(a) * 1.6, 0.5)) @ \
            Matrix.Rotation(a, 4, 'Z') @ Matrix.Rotation(0.14, 4, 'Y')
        p._xform(m)
        parts.append(p)
    mast = Part('mast', GREYMETAL)
    mast.cyl(0.045, 0.045, 1.5, at=(0, 0, 1.6))
    parts.append(mast)
    cam = Part('camera', DARKMETAL)
    cam.box(0.34, 0.22, 0.24, at=(0, 0, 2.42))
    cam.cyl(0.05, 0.05, 0.12, at=(0.1, -0.13, 2.42), axis='Y', seg=8)
    parts.append(cam)
    soj = Part('sojourner', SOLAR2, pivot=(2.4, 1.0, 0))
    soj.box(0.42, 0.62, 0.18, at=(0, 0, 0.28))
    for j in range(6):
        soj.cyl(0.09, 0.09, 0.07, at=(-0.24 if j % 2 == 0 else 0.24, -0.22 + (j // 2) * 0.22, 0.1), axis='X', seg=8)
    parts.append(soj)
    return parts

# ---------------------------------------------------------------- landers
@asset('landerGeneric')
def lander_generic():
    parts = []
    body = Part('body', GOLD)
    body.cyl(1.05, 1.2, 0.75, at=(0, 0, 0.75), seg=6)
    parts.append(body)
    top = Part('top', WHITE)
    top.box(1.1, 1.3, 0.35, at=(0, 0, 1.3))
    parts.append(top)
    legs = Part('legs', GREYMETAL)
    for i in range(3):
        a = i * 2 * math.pi / 3 + 0.5
        x, y = math.cos(a), math.sin(a)
        legs.cyl(0.06, 0.09, 1.3, at=(x * 1.15, y * 1.15, 0.5), rot=('Y' if abs(x) > abs(y) else 'X', 0.6 * (1 if (x if abs(x) > abs(y) else -y) > 0 else -1)))
        legs.cyl(0.3, 0.34, 0.1, at=(x * 1.55, y * 1.55, 0.05), seg=8)
    parts.append(legs)
    dish = Part('dish', WHITE)
    dish.cyl(0.55, 0.08, 0.3, at=(0.4, 0.35, 1.85), seg=12, rot=('X', 0.5))
    parts.append(dish)
    panel = Part('panel', SOLAR)
    panel.box(2.6, 0.9, 0.05, at=(0, -0.95, 1.15), rot=('X', 0.1))
    parts.append(panel)
    return parts

@asset('roverGeneric')
def rover_generic():
    parts = []
    deck = Part('deck', GOLD)
    deck.box(1.5, 2.1, 0.55, at=(0, 0, 0.85))
    parts.append(deck)
    top = Part('top', SOLAR)
    top.box(1.7, 2.3, 0.06, at=(0, 0, 1.16))
    top.box(0.9, 0.8, 0.06, at=(-1.05, 0.4, 1.14), rot=('Y', 0.15))
    top.box(0.9, 0.8, 0.06, at=(1.05, 0.4, 1.14), rot=('Y', -0.15))
    parts.append(top)
    wheels = Part('wheels', TIRE)
    for i in range(6):
        wx = -0.85 if i % 2 == 0 else 0.85
        wy = -0.8 + (i // 2) * 0.8
        wheels.cyl(0.3, 0.3, 0.22, at=(wx, wy, 0.32), axis='X', seg=10)
    parts.append(wheels)
    mast = Part('mast', GREYMETAL)
    mast.cyl(0.05, 0.05, 1.1, at=(0.35, -0.75, 1.7))
    parts.append(mast)
    head = Part('head', WHITE)
    head.box(0.36, 0.2, 0.22, at=(0.35, -0.75, 2.3))
    parts.append(head)
    arm = Part('arm', GREYMETAL)
    arm.cyl(0.045, 0.045, 0.9, at=(0, -1.15, 0.6), rot=('X', 1.1))
    parts.append(arm)
    return parts

# ---------------------------------------------------------------- hermes
@asset('hermes')
def hermes():
    parts = []
    spine = Part('spine', GREYMETAL)
    spine.cyl(0.9, 0.9, 26, at=(0, 0, 0), axis='Y', seg=8)
    parts.append(spine)
    ringp = Part('ring', WHITE)
    ringp.torus(6.5, 1.15, at=(0, -2, 0), seg=22, ring_seg=8, rot=('X', math.pi / 2))
    parts.append(ringp)
    spokes = Part('spokes', GREYMETAL)
    for i in range(4):
        a = i * math.pi / 2
        spokes.cyl(0.28, 0.28, 6.4, at=(math.cos(a) * 3.2, -2, math.sin(a) * 3.2),
                   rot=('Y', a + math.pi / 2), axis='X', seg=8)
    parts.append(spokes)
    fwd = Part('command', HULL)
    fwd.cyl(1.4, 0.9, 3.2, at=(0, -14.2, 0), axis='Y', seg=10)
    parts.append(fwd)
    eng = Part('engine', DARKMETAL)
    eng.box(3.4, 2.8, 2.6, at=(0, 12.2, 0))
    eng.cyl(0.9, 1.3, 1.6, at=(0, 14.2, 0), axis='Y', seg=10)
    parts.append(eng)
    sail = Part('arrays', SOLAR2)
    sail.box(14, 1.6, 0.08, at=(9.5, 7, 0))
    sail.box(14, 1.6, 0.08, at=(-9.5, 7, 0))
    parts.append(sail)
    glow = Part('engineglow', REDPAINT, emissive=(0.3, 0.5, 1.0))
    glow.cyl(0.7, 0.4, 0.5, at=(0, 15.1, 0), axis='Y', seg=10)
    parts.append(glow)
    return parts

# ---------------------------------------------------------------- deployables & props
@asset('greenhouse')
def greenhouse():
    parts = []
    dome = Part('dome', GLASS, opacity=0.3)
    dome.sphere(4.2, at=(0, 0, 0.1), seg=14, rings=8)
    parts.append(parts_pop_bottom(dome, 0.1))
    ring = Part('ring', GREYMETAL)
    ring.cyl(4.25, 4.35, 0.35, at=(0, 0, 0.2), seg=18)
    parts.append(ring)
    ribs = Part('ribs', WHITE)
    for i in range(4):
        a = i * math.pi / 4
        ribs.torus(4.22, 0.05, at=(0, 0, 0.1), seg=18, ring_seg=5, rot=('X' if i % 2 == 0 else 'Y', a))
    parts.append(ribs)
    door = Part('door', WHITE)
    door.box(1.4, 0.3, 2.2, at=(0, -4.15, 1.1))
    parts.append(door)
    return parts

def parts_pop_bottom(part, zmin):
    # remove faces whose center is below zmin (open dome bottoms)
    kill = [f for f in part.bm.faces if f.calc_center_median().z < zmin]
    bmesh.ops.delete(part.bm, geom=kill, context='FACES')
    return part

@asset('solarDeploy')
def solar_deploy():
    parts = []
    post = Part('post', GREYMETAL)
    post.cyl(0.12, 0.16, 1.2, at=(0, 0, 0.6))
    post.cyl(0.5, 0.55, 0.1, at=(0, 0, 0.05), seg=10)
    parts.append(post)
    pan = Part('panel', SOLAR)
    pan.box(3.2, 2.1, 0.09, at=(0, 0, 1.35), rot=('X', 0.45))
    parts.append(pan)
    frame = Part('frame', WHITE)
    frame.box(3.3, 0.12, 0.12, at=(0, 0.95, 1.78), rot=('X', 0.45))
    frame.box(3.3, 0.12, 0.12, at=(0, -0.95, 0.93), rot=('X', 0.45))
    parts.append(frame)
    return parts

@asset('beacon')
def beacon():
    parts = []
    pole = Part('pole', GREYMETAL)
    pole.cyl(0.05, 0.08, 2.6, at=(0, 0, 1.3), seg=8)
    pole.cyl(0.3, 0.36, 0.12, at=(0, 0, 0.06), seg=8)
    for i in range(3):
        a = i * 2 * math.pi / 3
        pole.cyl(0.03, 0.04, 0.9, at=(math.cos(a) * 0.35, math.sin(a) * 0.35, 0.4),
                 rot=('Y' if abs(math.cos(a)) > 0.5 else 'X', 0.7 * (1 if (math.cos(a) if abs(math.cos(a)) > 0.5 else -math.sin(a)) > 0 else -1)))
    parts.append(pole)
    lamp = Part('lamp', (0.2, 0.7, 0.9), emissive=(0.1, 0.5, 0.8))
    lamp.sphere(0.18, at=(0, 0, 2.75), seg=8, rings=6)
    parts.append(lamp)
    fin = Part('fin', ORANGE)
    fin.box(0.5, 0.04, 0.5, at=(0, 0, 2.2))
    parts.append(fin)
    return parts

@asset('o2cache')
def o2cache():
    parts = []
    tank = Part('tank', (0.45, 0.75, 0.85))
    tank.cyl(0.42, 0.42, 1.2, at=(0, 0, 0.75), seg=12)
    tank.sphere(0.42, at=(0, 0, 1.35), seg=12, rings=6)
    parts.append(tank)
    base = Part('base', GREYMETAL)
    base.box(1.1, 1.1, 0.3, at=(0, 0, 0.15))
    base.cyl(0.06, 0.06, 0.5, at=(0.3, 0.2, 1.75), rot=('X', 0.9))
    parts.append(base)
    valve = Part('valve', ORANGE)
    valve.cyl(0.12, 0.12, 0.18, at=(0, 0, 1.85), seg=8)
    parts.append(valve)
    return parts

@asset('supplyPod')
def supply_pod():
    parts = []
    shell = Part('shell', ORANGE)
    shell.cyl(0.85, 1.15, 1.7, at=(0, 0, 0.95), seg=10)
    parts.append(shell)
    lid = Part('lid', WHITE)
    lid.cyl(0.85, 0.2, 0.6, at=(0, 0, 2.1), seg=10)
    parts.append(lid)
    chute = Part('chute', HULL)
    chute.box(1.7, 1.7, 0.06, at=(0.9, 0.4, 0.35), rot=('Y', 0.5))
    parts.append(chute)
    band = Part('band', DARKMETAL)
    band.cyl(1.17, 1.17, 0.2, at=(0, 0, 0.5), seg=10)
    parts.append(band)
    return parts

@asset('rtgUnit')
def rtg_unit():
    parts = []
    core = Part('core', DARKMETAL)
    core.cyl(0.32, 0.32, 1.0, at=(0, 0, 0.4), axis='Y', seg=8)
    parts.append(core)
    fins = Part('fins', GREYMETAL)
    for i in range(6):
        a = i * math.pi / 3
        fins.box(0.5, 0.9, 0.04, at=(math.cos(a) * 0.35, 0, 0.4 + math.sin(a) * 0.35), rot=('Y', a))
    parts.append(fins)
    warn = Part('warn', REDPAINT, emissive=(0.5, 0.12, 0.06))
    warn.box(0.4, 0.42, 0.1, at=(0, 0.55, 0.4))
    parts.append(warn)
    return parts

# ---------------------------------------------------------------- export
def main():
    out = {}
    total = 0
    for name, fn in ASSETS.items():
        parts = [p.export() for p in fn()]
        out[name] = parts
        tris = sum(len(p['v']) // 9 for p in parts)
        total += tris
        print(f'{name:16s} {len(parts):2d} parts {tris:5d} tris')
    with open(OUT, 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    import os
    print(f'TOTAL {total} tris -> {OUT} ({os.path.getsize(OUT)//1024} KB)')

main()
