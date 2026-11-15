"""
Stranded II works of a base (Base mode), authored headlessly in Blender through tools/assets/lib.py with the
helpers of props.py:

    bs_kiln  bs_smelter  bs_glassworks

Run:   /home/user/blender-venv/bin/python tools/assets/works.py [names ...]     (no names = all)
Look:  node tools/assets/preview.mjs bs_kiln ...
       PROPS_FAST=1 skips the ambient-occlusion bake while blocking a model out.

What they are (static/martian/src/game/base.js says what each makes):
  bs_kiln        a beehive kiln of basalt blocks: a firing mouth in its front, a flue out of its top
  bs_smelter     a brick shaft furnace banded with iron, a blower at its side, a tap and a bed of pig moulds in front
  bs_glassworks  a low brick furnace with a glory hole, a casting table, a rack of panes, and the mirror that heats it

One man built each of them out of what he quarried and what he salvaged, so they are masonry with machinery
bolted on: dark basalt and red brick, steel fittings, a grey control box with a lamp and a cable that runs off
toward the Hab. Each has a fire: every surface that glows when it is working is in the material `light_amber`
(the game turns it up while a job runs and down to nothing when it stands idle), or the dimmer `light_ember`
for what glows dull. Anchor `flue`, where there is one, is where its smoke comes out. Each has a part `stock`, the
product stacked beside it, which the game shows when there is some in the stores. Anchor `col_body` is the circle
he cannot walk into; anchor `fire` is where the game hangs its lamp.

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


def masonry():
    mat('basalt', color=(0.15, 0.135, 0.125), metallic=0.0, roughness=0.92)
    mat('brick', color=(0.44, 0.19, 0.105), metallic=0.0, roughness=0.9)
    mat('mortar', color=(0.34, 0.27, 0.21), metallic=0.0, roughness=1.0)
    mat('pig_iron', color=(0.13, 0.13, 0.14), metallic=0.85, roughness=0.55)
    mat('void', color=(0.0, 0.0, 0.0), metallic=0.0, roughness=1.0)
    # what glows dull: iron cooling in a mould, the mouth of a glass furnace (the game drives it with `light_amber`)
    mat('light_ember', color=(1.0, 0.42, 0.08), metallic=0.0, roughness=0.5, emissive=(1.0, 0.36, 0.05), strength=1.5)
    # (bright in itself: as a true mirror it showed this renderer's dim surroundings, and a "dark matte copper-brown" dish)
    mat('mirror', color=(0.80, 0.85, 0.92), metallic=0.3, roughness=0.2)


def joints(K, face, w, h0, h1, course=0.112, pitch=0.24, skip=None):
    """The upright joints of a brick wall, on one flat face of it: `face` is a matrix whose x runs along the wall,
    y is up and z is out of it. Courses are `course` high from h0 to h1, bricks `pitch` long, each course broken
    half a brick on from the one under it. skip(x, y) -> True leaves a place out (an arch, a door)."""
    k, y = 0, h0
    while y < h1 - 0.01:
        x = -w / 2 + (pitch / 2 if k % 2 else pitch)
        while x < w / 2 - 0.03:
            if not (skip and skip(x, y + course / 2)):
                K.quad('mortar', (x - 0.006, y + 0.008, 0.003), (x + 0.006, y + 0.008, 0.003), (x + 0.006, y + course - 0.012, 0.003), (x - 0.006, y + course - 0.012, 0.003), face)
            x += pitch
        y += course
        k += 1


def control_box(K, at, yaw=0.0, lead=(2.6, 0.9)):
    """The grey box every works has: on a post, a lamp on its face, a cable off along the ground toward the Hab."""
    M = T(*at) @ R('Z', yaw)
    K.box('steel', (0.06, 0.06, 0.95), (0, 0, 0.475), M)
    K.box('painted_grey', (0.34, 0.16, 0.42), (0, 0, 1.08), M, bevel=0.012)
    K.box('painted_dark', (0.24, 0.012, 0.16), (0, -0.086, 1.15), M)
    K.box('light_green', (0.04, 0.014, 0.04), (0.09, -0.088, 0.97), M)
    K.box('painted_yellow', (0.08, 0.014, 0.05), (-0.07, -0.088, 0.97), M)
    p0 = M @ Vector((0.0, 0.07, 0.9))
    lx, ly = lead
    K.hose('rubber', [tuple(p0), tuple(M @ Vector((0.0, 0.2, 0.35))), tuple(M @ Vector((0.05, 0.38, 0.03))),
                      (at[0] + lx * 0.4, at[1] + ly * 0.4 + 0.3, 0.025), (at[0] + lx * 0.75, at[1] + ly * 0.75 - 0.15, 0.025), (at[0] + lx, at[1] + ly, 0.02)], 0.022, 6, 4)


def stack(K, material, at, size, nx, ny, nz, gap=0.012, rng=None, M=None):
    """Things stacked: nx by ny by nz boxes of `size`, each a hair out of true."""
    rng = rng or random.Random(1)
    sx, sy, sz = size
    for k in range(nz):
        for i in range(nx):
            for j in range(ny):
                if k == nz - 1 and rng.random() < 0.3:                        # the top course is not full
                    continue
                x = at[0] + (i - (nx - 1) / 2) * (sx + gap) + rng.uniform(-0.006, 0.006)
                y = at[1] + (j - (ny - 1) / 2) * (sy + gap) + rng.uniform(-0.006, 0.006)
                m = T(x, y, at[2] + sz / 2 + k * (sz + 0.004)) @ R('Z', rng.uniform(-2.5, 2.5))
                K.box(material, size, (0, 0, 0), m if M is None else M @ m, bevel=0.006)


# ==============================================================================================
# bs_kiln.glb
# ==============================================================================================
def build_bs_kiln():
    """A beehive kiln: courses of rough basalt blocks drawing in to a crown, a firing mouth in the front with a
    stone lintel over it and the fire showing inside, an iron door standing open on its hinge, a steel flue out of
    the crown, a rake leaning on it, and a pallet of fired brick beside it (`stock`)."""
    masonry()
    root = part('bs_kiln')
    rng = random.Random(11)
    K = Kit('kiln', root)
    R0, H = 1.55, 2.05                                                        # the dome's foot and its crown
    MOUTH = 21.0                                                              # half the mouth's width, degrees

    def rad_at(z):
        return R0 * (1.0 - (z / (H + 0.25)) ** 2.1) ** 0.62

    # ---- a footing course, standing proud of the dome ----
    n = 20
    for i in range(n):
        a = 360.0 * (i + 0.5) / n
        if abs(((a + 90) % 360) - 180) > 180 - MOUTH - 4:                     # (front is -Y: 270 degrees)
            continue
        M = R('Z', a) @ T(R0 + 0.07, 0, 0.11) @ R('Z', rng.uniform(-4, 4))
        K.box('basalt', (0.36, 2 * pi * (R0 + 0.07) / n * rng.uniform(0.86, 0.96), 0.24), (0, 0, 0), M, bevel=0.025)
    # ---- the dome: nine courses of blocks, fewer to a course as it draws in ----
    z, k = 0.2, 0
    while z < H - 0.12:
        ch = rng.uniform(0.2, 0.25)
        r_ = rad_at(z + ch / 2)
        cnt = max(7, int(2 * pi * r_ / rng.uniform(0.44, 0.52)))
        off = rng.uniform(0, 360)
        lean = math.degrees(math.atan2(rad_at(z) - rad_at(z + ch), ch))       # how far the wall leans in here
        for i in range(cnt):
            a = off + 360.0 * i / cnt
            front = abs(((a + 90) % 360) - 180) > 180 - MOUTH                 # in the mouth's sector
            if front and z + ch < 0.98:
                continue
            w = 2 * pi * r_ / cnt * rng.uniform(0.88, 0.97)
            M = R('Z', a) @ T(r_ - 0.02, 0, z + ch / 2) @ R('Y', -lean) @ R('X', rng.uniform(-2, 2))
            K.box('basalt', (rng.uniform(0.3, 0.36), w, ch * 0.96), (0, 0, 0), M, bevel=0.03)
        z += ch
        k += 1
    # the crown: a ring of small stones round the flue
    for i in range(7):
        a = 360.0 * i / 7
        K.box('basalt', (0.26, 0.24, 0.16), (0, 0, 0), R('Z', a) @ T(0.3, 0, H - 0.02) @ R('Y', -62), bevel=0.03)
    # the lining shows dark inside the mouth, and the mortar between the blocks
    K.lathe('mortar', [(R0 - 0.1, 0.2)] + [(rad_at(0.2 + (H - 0.3) * i / 8) - 0.13, 0.2 + (H - 0.3) * i / 8) for i in range(1, 9)] + [(0.2, H - 0.08)], 28, smooth=60.0)
    # ---- the mouth: jambs, a lintel, the fire ----
    for s in (-1, 1):
        a = 270 + s * (MOUTH + 3.5)
        K.box('basalt', (0.46, 0.2, 0.86), (0, 0, 0), R('Z', a) @ T(R0 - 0.06, 0, 0.55), bevel=0.03)
    K.box('basalt', (0.5, 1.3, 0.2), (0, 0, 0), R('Z', 270) @ T(R0 - 0.1, 0, 1.06) @ R('Y', -12), bevel=0.035)
    # (the fire stands just inside the mouth, in front of the lining: set back behind it, the mouth showed the
    #  lining's pale mortar by day and nothing at all by night)
    K.box('void', (0.04, 1.02, 0.88), (0, 0, 0), R('Z', 270) @ T(R0 - 0.12, 0, 0.56))
    K.box('light_amber', (0.03, 0.9, 0.5), (0, 0, 0), R('Z', 270) @ T(R0 - 0.085, 0, 0.42))
    for i in range(6):                                                         # what is being fired: bricks stood on end in the glow
        K.box('painted_dark', (0.1, 0.07, rng.uniform(0.24, 0.34)), (-0.34 + 0.135 * i, -(R0 - 0.02), 0.36), None)
    K.box('brick', (1.05, 0.5, 0.1), (0, -(R0 + 0.05), 0.19), None, bevel=0.01)                             # the hearth's sill
    anchor('fire', root, loc=(0, -(R0 + 0.35), 0.3))
    anchor('flue', root, loc=(0, 0, H + 0.9))
    # ---- the door, open on its hinge, to the right of the mouth ----
    D = R('Z', 270 + MOUTH + 9) @ T(R0 + 0.06, 0, 0.0) @ R('Z', 58)
    K.box('painted_dark', (0.035, 0.74, 0.84), (0.0, -0.37, 0.58), D, bevel=0.008)
    K.box('titanium', (0.02, 0.6, 0.7), (0.022, -0.37, 0.58), D)
    K.bolt_circle('steel', 0.2, 6, 0.014, 0.01, D @ T(-0.018, -0.37, 0.58) @ AX['X'] @ R('X', 180))
    for zz in (0.3, 0.86):
        K.box('steel', (0.05, 0.1, 0.05), (0.0, 0.02, zz), D)
    K.handle('steel', (0.04, -0.62, 0.45), (0.04, -0.62, 0.7), 0.06, 0.012, 6, (1, 0, 0), D)
    # ---- the flue ----
    K.lathe('steel', [(0.2, H - 0.06), (0.2, H + 0.1), (0.15, H + 0.14), (0.15, H + 0.78), (0.17, H + 0.8), (0.17, H + 0.86), (0.13, H + 0.86), (0.13, H - 0.06)], 14, smooth=50.0)
    K.lathe('titanium', [(0.153, H + 0.5), (0.153, H + 0.78)], 14, smooth=60.0)                                # heat-blued at the top
    # ---- a rake leaning on it, and the control box ----
    K.tube('aluminium', [(1.1, -1.25, 0.02), (0.84, -0.86, 1.72)], 0.016, 6)
    K.box('steel', (0.3, 0.02, 0.09), (0, 0, 0), frame((1.1, -1.25, 0.05), (0.26, -0.39, 1.7), (1, 0.6, 0)))
    control_box(K, (-1.95, -0.75, 0.0), 25.0, lead=(-1.4, 2.2))
    K.finish()
    # ---- the brick it has made, on a pallet ----
    stock = part('stock', parent=root)
    KS = Kit('stock', stock)
    KS.box('aluminium', (0.95, 0.72, 0.05), (1.95, -0.95, 0.07), None, bevel=0.006)
    for sx in (-0.36, 0.0, 0.36):
        KS.box('aluminium', (0.07, 0.72, 0.05), (1.95 + sx, -0.95, 0.025), None)
    stack(KS, 'brick', (1.95, -0.95, 0.1), (0.21, 0.1, 0.07), 4, 6, 5, rng=random.Random(3))
    KS.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=1.8)
    return finish(root, 'bs_kiln', samples=32, distance=0.7)


# ==============================================================================================
# bs_smelter.glb
# ==============================================================================================
def build_bs_smelter():
    """A shaft furnace: a brick stack on a square brick foot, drawing in as it rises, banded with iron hoops, a
    charging collar and a hood at its top; a blower box at its side blowing through two tuyeres; a tap in the front
    with the iron running down a channel into a bed of pig moulds; slag thrown out to one side, and the pigs it has
    made stacked on the other (`stock`)."""
    masonry()
    root = part('bs_smelter')
    rng = random.Random(22)
    K = Kit('smelter', root)
    FOOT, HF = 1.15, 0.5                                                       # the foot's half-width and height
    R1, R2, HS = 0.86, 0.58, 2.5                                              # the shaft: radius at foot and top, its height

    # ---- the foot: four courses of brick, a step in half way up ----
    K.box('brick', (2 * FOOT, 2 * FOOT, HF * 0.5), (0, 0, HF * 0.25), None, bevel=0.012)
    K.box('brick', (2 * FOOT - 0.16, 2 * FOOT - 0.16, HF * 0.5), (0, 0, HF * 0.75), None, bevel=0.012)
    for side in range(4):                                                      # the foot's upright joints
        Fm = R('Z', 90.0 * side) @ T(0, -FOOT - 0.002, 0) @ R('X', 90)
        joints(K, Fm, 2 * FOOT, 0.0, HF * 0.5, course=HF * 0.25, pitch=0.3, skip=(lambda x, y: abs(x) < 0.34 and y < 0.5) if side == 0 else None)
        Fm2 = R('Z', 90.0 * side) @ T(0, -FOOT + 0.078, 0) @ R('X', 90)
        joints(K, Fm2, 2 * FOOT - 0.16, HF * 0.5, HF, course=HF * 0.25, pitch=0.3, skip=(lambda x, y: abs(x) < 0.34) if side == 0 else None)
    for zz in (HF * 0.25, HF * 0.5, HF * 0.75):                                # its mortar joints, as shallow dark bands
        K.box('mortar', (2 * FOOT - 0.07 - (0.16 if zz > HF * 0.5 else 0), 2 * FOOT - 0.07 - (0.16 if zz > HF * 0.5 else 0), 0.012), (0, 0, zz), None)
    # ---- the shaft: courses of brick, each a ring a hair smaller than the one below, dark joints between ----
    z, courses = HF, 0
    while z < HF + HS - 0.01:
        t = (z - HF) / HS
        r_ = R1 + (R2 - R1) * t ** 0.85
        K.lathe('brick', [(r_ - 0.2, z), (r_, z), (r_ + 0.004, z + 0.01), (r_ + 0.004, z + 0.094), (r_, z + 0.104), (r_ - 0.2, z + 0.104)], 18, R('Z', 10.0 * (courses % 2)), smooth=30.0)
        K.lathe('mortar', [(r_ - 0.008, z + 0.104), (r_ - 0.008, z + 0.116)], 18, smooth=60.0)
        for i in range(13):                                                    # its upright joints, broken course to course
            K.quad('mortar', (0, -0.006, 0.012), (0, 0.006, 0.012), (0, 0.006, 0.092), (0, -0.006, 0.092), R('Z', 360.0 * (i + 0.5 * (courses % 2)) / 13) @ T(r_ + 0.0065, 0, z))
        z += 0.116
        courses += 1
    TOPZ = z
    for t in (0.14, 0.42, 0.7, 0.95):                                          # iron hoops, with their clamps
        zz = HF + HS * t
        r_ = R1 + (R2 - R1) * t ** 0.85 + 0.012
        K.lathe('steel', [(r_, zz - 0.035), (r_ + 0.014, zz - 0.035), (r_ + 0.014, zz + 0.035), (r_, zz + 0.035)], 18, smooth=60.0)
        K.box('steel', (0.06, 0.1, 0.09), (0, 0, 0), R('Z', 40 + 70 * t) @ T(r_ + 0.03, 0, zz), bevel=0.006)
    # the top: a charging collar, a hood on three legs
    K.lathe('steel', [(R2 - 0.12, TOPZ), (R2 + 0.05, TOPZ), (R2 + 0.05, TOPZ + 0.12), (R2 - 0.12, TOPZ + 0.12)], 18, smooth=50.0)
    for i in range(3):
        a = rad(120 * i + 30)
        K.tube('steel', [((R2 - 0.02) * cos(a), (R2 - 0.02) * sin(a), TOPZ + 0.1), ((R2 - 0.1) * cos(a), (R2 - 0.1) * sin(a), TOPZ + 0.5)], 0.018, 6)
    K.lathe('titanium', [(0.0, TOPZ + 0.72), (0.2, TOPZ + 0.66), (R2 + 0.12, TOPZ + 0.46), (R2 + 0.12, TOPZ + 0.42), (0.18, TOPZ + 0.6), (0.0, TOPZ + 0.64)], 18, smooth=50.0)
    K.lathe('void', [(0.0, TOPZ + 0.06), (R2 - 0.13, TOPZ + 0.06)], 18)
    # ---- the tap: an arch in the front of the foot, the iron running out of it down a channel to the moulds ----
    K.box('steel', (0.5, 0.06, 0.4), (0, -(FOOT + 0.005), 0.3), None, bevel=0.01)
    K.box('void', (0.3, 0.07, 0.22), (0, -(FOOT + 0.012), 0.26), None)
    K.box('light_amber', (0.16, 0.05, 0.1), (0, -(FOOT + 0.03), 0.22), None)
    for s in (-1, 1):                                                          # the channel's two lips, of fired clay, all the way to the moulds
        K.box('brick', (0.05, 1.12, 0.09), (s * 0.085, -(FOOT + 0.56), 0.15), R('X', -3), bevel=0.008)
    K.box('light_ember', (0.11, 1.1, 0.03), (0, -(FOOT + 0.56), 0.145), R('X', -3))
    K.box('light_ember', (0.09, 0.05, 0.06), (0, -(FOOT + 1.11), 0.145), None)                               # and over the lip into them
    anchor('fire', root, loc=(0, -(FOOT + 0.95), 0.3))
    anchor('flue', root, loc=(0, 0, TOPZ + 0.78))
    # the mould bed: a tray of sand with a comb of pig moulds, three of them full and glowing dull
    K.box('painted_grey', (1.3, 0.9, 0.12), (0, -(FOOT + 1.5), 0.06), None, bevel=0.01)
    K.box('mortar', (1.2, 0.8, 0.02), (0, -(FOOT + 1.5), 0.125), None)
    for i in range(5):
        x = -0.44 + 0.22 * i
        K.box('light_ember' if i in (1, 2) else 'pig_iron' if i == 3 else 'void', (0.15, 0.56, 0.03), (x, -(FOOT + 1.5), 0.132), None)
    K.box('light_ember', (0.56, 0.05, 0.03), (0.0, -(FOOT + 1.14), 0.132), None)
    # ---- the blower: a box with a fan grille, a duct, two tuyeres into the foot ----
    BX = FOOT + 0.75
    K.box('painted_grey', (0.7, 0.8, 0.7), (BX, 0.1, 0.43), None, bevel=0.02)
    for sx in (-0.25, 0.25):
        for sy in (-0.3, 0.3):
            K.box('steel', (0.08, 0.08, 0.08), (BX + sx, 0.1 + sy, 0.04), None)
    K.lathe('painted_dark', [(0.0, 0.0), (0.24, 0.0), (0.26, 0.02), (0.26, 0.05), (0.0, 0.05)], 16, T(BX + 0.35, 0.1, 0.45) @ AX['X'], smooth=40.0)
    for i in range(5):
        K.box('steel', (0.012, 0.5, 0.02), (BX + 0.405, 0.1, 0.27 + 0.09 * i), None)
    for i in range(6):                                                         # louvres on its front, a lifting eye on top
        K.box('painted_dark', (0.5, 0.012, 0.035), (BX, 0.1 - 0.405, 0.24 + 0.075 * i), R('X', 25))
    K.torus('steel', 0.05, 0.012, 10, 5, T(BX, 0.1, 0.8) @ R('X', 90))
    K.tube('steel', [(BX - 0.35, 0.1, 0.5), (BX - 0.55, 0.1, 0.5), (FOOT + 0.12, 0.1, 0.34)], 0.085, 10, round_r=0.1)
    K.tube('steel', [(FOOT + 0.14, -0.5, 0.34), (FOOT + 0.14, 0.7, 0.34)], 0.07, 10)
    for sy in (-0.45, 0.6):
        K.tube('steel', [(FOOT + 0.14, sy, 0.34), (FOOT - 0.12, sy, 0.3)], 0.05, 8)
        K.lathe('steel', [(0.05, 0.0), (0.085, 0.0), (0.085, 0.03), (0.05, 0.03)], 10, T(FOOT - 0.0, sy, 0.31) @ AX['X'])
    control_box(K, (BX + 0.1, -0.85, 0.0), -20.0, lead=(1.6, 2.0))
    # ---- slag, thrown out to the left ----
    SL = K.bm('basalt', smooth=30.0)
    for i in range(16):
        a, d = rng.uniform(0, TAU), 0.6 * sqrt(rng.random())
        s = rng.uniform(0.07, 0.17)
        rock(SL, s, (-(FOOT + 0.9) + d * cos(a), -0.9 + d * sin(a) * 0.8, s * 0.5 + 0.12 * max(0.0, 1 - d / 0.6)), seed=40 + i, scale=(1.1, 0.9, 0.7), subdiv=1, rough=0.3)
    K.finish()
    # ---- the pigs it has made ----
    stock = part('stock', parent=root)
    KS = Kit('stock', stock)
    rs = random.Random(5)
    for k in range(3):
        for i in range(4 - k):
            M = T(-(FOOT + 0.95) + (i - (3 - k) / 2) * 0.17, 0.75, 0.13 + 0.085 * k) @ R('Z', rs.uniform(-4, 4))
            KS.prism('pig_iron', [(-0.26, -0.065), (0.26, -0.065), (0.24, 0.05), (-0.24, 0.05)], 0.075, M @ R('X', 0), bevel=0.008)
    for sy in (-0.18, 0.18):
        KS.box('brick', (0.8, 0.11, 0.08), (-(FOOT + 0.95), 0.75 + sy, 0.04), None, bevel=0.006)
    KS.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=1.5)
    anchor('col_blower', root, loc=(BX, 0.1, 0), radius=0.6)
    return finish(root, 'bs_smelter', samples=32, distance=0.7)


# ==============================================================================================
# bs_glassworks.glb
# ==============================================================================================
def build_bs_glassworks():
    """A glassworks: a low brick furnace with an arched glory hole in its front and the melt showing in it; a
    mirror dish on a post behind, turned to throw the sun down the furnace's throat; a steel casting table with a
    pane cooling on it; a bin of sand; and an A-frame with the panes it has made leaning on it (`stock`)."""
    masonry()
    root = part('bs_glassworks')
    rng = random.Random(33)
    K = Kit('glassworks', root)
    FX, FY, FW, FD, FH = -0.75, 0.35, 1.5, 1.3, 1.25                            # the furnace: where, and how big

    # ---- the furnace: brick courses, an arched hole in the front, a throat in the top ----
    z = 0.0
    k = 0
    while z < FH - 0.01:
        inset = 0.0 if k % 2 == 0 else 0.008
        K.box('brick', (FW - inset, FD - inset, 0.098), (FX, FY, z + 0.049), None, bevel=0.006)
        K.box('mortar', (FW - 0.03, FD - 0.03, 0.014), (FX, FY, z + 0.105), None)
        z += 0.112
        k += 1
    for side, (wd, off) in enumerate(((FW, FD / 2), (FD, FW / 2), (FW, FD / 2), (FD, FW / 2))):              # its upright joints
        Fm = T(FX, FY, 0) @ R('Z', 90.0 * side) @ T(0, -off - 0.002, 0) @ R('X', 90)
        joints(K, Fm, wd, 0.0, z - 0.01, skip=(lambda x, y: (x * x + (y - 0.62) ** 2) < 0.52 ** 2) if side == 0 else None)
    K.box('steel', (FW + 0.06, FD + 0.06, 0.05), (FX, FY, z + 0.02), None, bevel=0.008)                       # an iron curb round its top
    for s in (-1, 1):                                                          # tie rods across its face
        K.tube('steel', [(FX + s * (FW / 2 + 0.03), FY - FD / 2 - 0.02, 0.2), (FX + s * (FW / 2 + 0.03), FY - FD / 2 - 0.02, z)], 0.02, 6)
    # the glory hole: an arch of bricks on end round a glowing mouth
    HX, HZ, HR = FX, 0.62, 0.3
    K.lathe('void', [(0.0, 0.0), (HR + 0.02, 0.0)], 14, T(HX, FY - FD / 2 - 0.004, HZ) @ AX['Y'])
    K.lathe('light_ember', [(0.0, 0.0), (HR - 0.11, 0.0)], 14, T(HX, FY - FD / 2 - 0.012, HZ) @ AX['Y'])
    K.lathe('painted_dark', [(HR - 0.11, 0.0), (HR - 0.02, -0.05), (HR + 0.03, -0.05), (HR + 0.03, 0.0)], 14, T(HX, FY - FD / 2 - 0.004, HZ) @ AX['Y'], smooth=50.0)
    for i in range(11):
        a = rad(-20 + 220 * i / 10)
        K.box('brick', (0.1, 0.1, 0.17), (0, 0, 0), T(HX + (HR + 0.1) * cos(a), FY - FD / 2 - 0.02, HZ + (HR + 0.1) * sin(a)) @ R('Y', -math.degrees(a) + 90), bevel=0.008)
    K.box('steel', (0.9, 0.26, 0.03), (HX, FY - FD / 2 - 0.13, HZ - HR - 0.06), None, bevel=0.006)             # a shelf under it
    anchor('fire', root, loc=(HX, FY - FD / 2 - 0.4, 0.35))
    # the throat: a steel collar in the top, lined dark, where the mirror's light goes in
    K.lathe('steel', [(0.2, z + 0.04), (0.3, z + 0.04), (0.3, z + 0.2), (0.2, z + 0.2)], 14, T(FX, FY + 0.15, 0), smooth=50.0)
    K.lathe('void', [(0.13, z + 0.16), (0.2, z + 0.16)], 14, T(FX, FY + 0.15, 0))
    K.lathe('light_ember', [(0.0, z + 0.16), (0.13, z + 0.16)], 14, T(FX, FY + 0.15, 0))                       # the melt under it, where the mirror's light lands
    # ---- the mirror: a dish on a post behind the furnace, tipped to look down the throat ----
    PX, PY, PH = FX + 0.2, FY + 1.55, 2.5
    K.lathe('steel', [(0.0, 0.0), (0.26, 0.0), (0.26, 0.04), (0.07, 0.07), (0.055, PH), (0.0, PH)], 10, T(PX, PY, 0), smooth=50.0)
    for i in range(3):
        a = rad(120 * i + 90)
        K.tube('steel', [(PX + 0.62 * cos(a), PY + 0.62 * sin(a), 0.02), (PX, PY, 0.75)], 0.02, 6)
    DM = T(PX, PY - 0.12, PH + 0.05) @ R('X', 134)                              # the dish's axis: down and forward, at the throat
    # (a mirror: bright, and looking down at the furnace. Dull, and looking at the horizon, it was a radio dish.)
    K.lathe('mirror', [(0.0, 0.0)] + [(1.05 * i / 6, 0.26 * (i / 6) ** 2) for i in range(1, 7)], 36, DM, smooth=70.0)
    K.lathe('aluminium', [(1.05, 0.26), (1.08, 0.275), (1.08, 0.245), (1.05 * 5 / 6, 0.26 * (5 / 6) ** 2 - 0.03), (0.0, -0.03)], 36, DM, smooth=60.0)
    for i in range(1, 3):                                                      # it is made of rings of mirror: the joins between them
        r_ = 1.05 * i / 3
        K.torus('painted_dark', r_, 0.006, 36, 4, DM @ T(0, 0, 0.26 * (r_ / 1.05) ** 2 + 0.004))
    for i in range(6):                                                         # ribs on its back
        a = rad(60 * i)
        K.tube('steel', [tuple(DM @ Vector((0.08 * cos(a), 0.08 * sin(a), -0.05))), tuple(DM @ Vector((1.0 * cos(a), 1.0 * sin(a), 0.2)))], 0.014, 5)
    K.box('steel', (0.16, 0.16, 0.2), (0, 0, 0), DM @ T(0, 0, -0.1), bevel=0.01)
    # ---- the casting table, a pane cooling on it, a roller ----
    TX, TY = 1.05, -0.35
    K.box('steel', (1.5, 0.9, 0.05), (TX, TY, 0.86), None, bevel=0.008)
    for sx in (-0.66, 0.66):
        for sy in (-0.36, 0.36):
            K.box('steel', (0.06, 0.06, 0.84), (TX + sx, TY + sy, 0.42), None)
    K.box('steel', (1.38, 0.04, 0.04), (TX, TY - 0.36, 0.3), None)
    K.box('steel', (1.38, 0.04, 0.04), (TX, TY + 0.36, 0.3), None)
    K.box('glass_clear', (1.05, 0.62, 0.012), (TX - 0.05, TY, 0.893), None)
    K.box('light_ember', (1.05, 0.02, 0.012), (TX - 0.05, TY + 0.3, 0.893), None)                             # its edge still hot
    K.lathe('steel', [(0.0, -0.4), (0.05, -0.4), (0.05, 0.4), (0.0, 0.4)], 10, T(TX + 0.6, TY, 0.94) @ AX['Y'], smooth=50.0)
    # ---- a bin of sand ----
    BX_, BY_ = FX - 1.25, FY - 0.55
    K.box('painted_grey', (0.7, 0.6, 0.5), (BX_, BY_, 0.27), None, bevel=0.015)
    SAND = K.bm('plastic_white', smooth=50.0)
    rock(SAND, 0.3, (BX_, BY_, 0.5), seed=7, scale=(1.05, 0.9, 0.35), subdiv=2, rough=0.12)
    control_box(K, (TX + 0.95, TY + 0.95, 0.0), -35.0, lead=(1.3, 1.9))
    K.finish()
    # ---- the panes it has made, leaning on an A-frame ----
    stock = part('stock', parent=root)
    KS = Kit('stock', stock)
    AXc, AYc = 1.25, 1.25
    for s in (-1, 1):
        for e in (-0.55, 0.55):
            KS.tube('aluminium', [(AXc + e, AYc + s * 0.36, 0.02), (AXc + e, AYc, 1.25)], 0.02, 6)
    KS.tube('aluminium', [(AXc - 0.6, AYc, 1.25), (AXc + 0.6, AYc, 1.25)], 0.02, 6)
    for s in (-1, 1):
        KS.box('aluminium', (1.2, 0.1, 0.03), (AXc, AYc + s * 0.4, 0.05), None)
        for i in range(3):
            M = T(AXc, AYc + s * (0.38 - 0.035 * i), 0.07) @ R('X', s * 15.5)
            KS.box('glass_clear', (1.0 - 0.06 * i, 0.012, 1.05 - 0.05 * i), (0, 0, 0.53), M)
    KS.finish()
    anchor('col_body', root, loc=(FX, FY + 0.2, 0), radius=1.25)
    anchor('col_table', root, loc=(TX, TY, 0), radius=0.85)
    anchor('col_rack', root, loc=(AXc, AYc, 0), radius=0.75)
    return finish(root, 'bs_glassworks', samples=32, distance=0.7)


BUILDERS = {'bs_kiln': build_bs_kiln, 'bs_smelter': build_bs_smelter, 'bs_glassworks': build_bs_glassworks}

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS)
    unknown = [a for a in sys.argv[1:] if a not in BUILDERS]
    if unknown:
        print('unknown model(s):', ', '.join(unknown), '- known:', ', '.join(BUILDERS))
    for name in names:
        reset_scene()
        BUILDERS[name]()
