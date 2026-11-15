"""
Stranded II buildings of a base (Base mode), authored headlessly in Blender through tools/assets/lib.py with the
helpers of props.py and works.py:

    bs_solar  bs_battery  bs_tank  bs_quarters  bs_tower  bs_pad

Run:   /home/user/blender-venv/bin/python tools/assets/buildings.py [names ...]     (no names = all)
Look:  node tools/assets/preview.mjs bs_solar ...
       PROPS_FAST=1 skips the ambient-occlusion bake while blocking a model out.

What they are (static/martian/src/game/base.js says what each does for the Hab):
  bs_solar    a field of twelve panels of his own glass in iron frames, in three rows, a combiner box, a cable
  bs_battery  a bank of salt cells in an iron rack on a brick footing, under a tin roof, a breaker box, a cable
  bs_tank     a welded iron water tank on a ring of brick, a ladder, a level gauge, a pipe run toward the Hab
  bs_quarters a barrel vault of brick with a round iron hatch: somewhere to live that is not the Hab
  bs_tower    an iron mast on a cement footing, a dish at its head, guyed
  bs_pad      a disc of cement with a target painted on it and lamps at its rim

Like the works, they are what one man built out of what he made: smelted iron (dark, unpainted, already
rusting at the welds), cast glass, fired brick, with salvage where it matters. Each has the grey control box
on a post and a cable that runs off toward the Hab (works.py, control_box). Anchors `col_*` are the circles he
cannot walk into.

Axes follow SPEC.md: metres, Z up, the FRONT of a model faces -Y, origin on the ground.
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import props  # noqa: E402  (imports lib, and through it bpy, before bmesh/mathutils)
from props import *  # noqa: E402,F401,F403
from works import control_box, joints, masonry  # noqa: E402

cos, sin, pi, sqrt = math.cos, math.sin, math.pi, math.sqrt


def ironwork():
    masonry()
    mat('iron', color=(0.115, 0.105, 0.10), metallic=0.7, roughness=0.62)        # his own: dark, unpainted
    mat('iron_rust', color=(0.25, 0.12, 0.06), metallic=0.2, roughness=0.85)


# ==============================================================================================
# bs_solar.glb
# ==============================================================================================
def build_bs_solar():
    """A solar field: three rows of four panels, each a sheet of cells under his own glass in an iron frame, tilted
    on iron trestles pinned to brick blocks; a combiner box at the end of the front row; the cable off to the Hab.
    The panels face -Y (he sets the field down facing the sun's road across the sky)."""
    ironwork()
    root = part('bs_solar')
    rng = random.Random(7)
    K = Kit('field', root)
    PW, PH, TILT = 1.15, 0.8, 34.0                                              # a panel, and how far back it leans
    for r_ in range(3):
        y0 = -2.0 + 2.0 * r_
        # the row's trestles: a brick block, a front post and a longer back post, a rail along each
        for i in range(5):
            x = -2.5 + 1.25 * i
            K.box('brick', (0.26, 0.42, 0.12), (x, y0 - 0.1, 0.06), None, bevel=0.008)
            K.box('brick', (0.26, 0.42, 0.12), (x, y0 + 0.62, 0.06), None, bevel=0.008)
            K.box('iron', (0.05, 0.05, 0.36), (x, y0 - 0.1, 0.3), None)
            K.box('iron', (0.05, 0.05, 0.86), (x, y0 + 0.62, 0.55), None)
            K.beam('iron', (x, y0 - 0.1, 0.46), (x, y0 + 0.62, 0.96), 0.04, 0.05)
            if i < 4:
                K.tube('iron', [(x, y0 + 0.62, 0.3), (x + 1.25, y0 - 0.1, 0.42)], 0.012, 5)          # a brace across each bay
        for z_, yy in ((0.47, -0.1), (0.97, 0.62)):
            K.box('iron', (5.2, 0.04, 0.05), (0, y0 + yy, z_), None)
        # the panels: a frame, a backing sheet, cells, and the glass over them
        for i in range(4):
            x = -1.875 + 1.25 * i
            M = T(x, y0 + 0.26, 0.74) @ R('X', TILT)
            K.box('iron', (PW, PH, 0.035), (0, 0, 0), M, bevel=0.006)
            K.box('painted_dark', (PW - 0.07, PH - 0.07, 0.012), (0, 0, 0.02), M)
            for a in range(6):
                for b in range(4):
                    K.box('solar_cell', (0.165, 0.165, 0.006), (-0.45 + 0.18 * a, -0.27 + 0.18 * b, 0.029), M)
            K.box('glass_clear', (PW - 0.05, PH - 0.05, 0.008), (0, 0, 0.04), M)
            for s in (-1, 1):                                                  # clips that hold the glass
                K.box('iron', (0.05, 0.03, 0.02), (s * 0.3, -PH / 2 + 0.02, 0.045), M)
                K.box('iron', (0.05, 0.03, 0.02), (s * 0.3, PH / 2 - 0.02, 0.045), M)
        # the row's lead, along the back rail and down the end post
        K.hose('rubber', [(-2.45, y0 + 0.64, 0.93), (-1.2, y0 + 0.66, 0.9), (0.0, y0 + 0.66, 0.92), (1.3, y0 + 0.66, 0.9), (2.5, y0 + 0.66, 0.93), (2.56, y0 + 0.66, 0.4), (2.62, y0 + 0.4, 0.03)], 0.014, 5, 3)
    # the leads gathered along the ground at the right-hand end, to the combiner
    K.hose('rubber', [(2.62, 2.4, 0.03), (2.7, 1.0, 0.03), (2.66, -0.6, 0.03), (2.72, -1.9, 0.03), (2.9, -2.5, 0.05)], 0.02, 5, 3)
    K.box('painted_grey', (0.42, 0.2, 0.5), (3.0, -2.6, 0.72), None, bevel=0.012)
    K.box('steel', (0.06, 0.06, 0.5), (3.0, -2.6, 0.25), None)
    K.box('painted_yellow', (0.16, 0.012, 0.1), (3.0, -2.705, 0.8), None)
    K.box('light_green', (0.04, 0.014, 0.04), (3.12, -2.705, 0.6), None)
    K.hose('rubber', [(3.0, -2.52, 0.5), (3.05, -2.3, 0.05), (3.6, -1.6, 0.025), (4.4, -1.2, 0.025), (5.2, -0.4, 0.02)], 0.022, 6, 4)
    K.finish()
    for i, (x, y) in enumerate(((-1.9, -2.0), (0.0, -2.0), (1.9, -2.0), (-1.9, 0.0), (0.0, 0.0), (1.9, 0.0), (-1.9, 2.0), (0.0, 2.0), (1.9, 2.0))):
        anchor(f'col_row_{i}', root, loc=(x, y + 0.26, 0), radius=1.0)
    return finish(root, 'bs_solar', samples=32, distance=0.6)


# ==============================================================================================
# bs_battery.glb
# ==============================================================================================
def build_bs_battery():
    """A battery bank: twelve salt cells, squat iron pots with a glass insulator and two terminals each, in two
    tiers of an iron rack on a brick footing, bus bars along them, a tin roof on four posts to keep the dust off,
    a breaker box on the end, the cable off to the Hab."""
    ironwork()
    root = part('bs_battery')
    rng = random.Random(8)
    K = Kit('bank', root)
    L, D = 2.5, 0.95
    K.box('brick', (L + 0.3, D + 0.3, 0.1), (0, 0, 0.05), None, bevel=0.01)
    K.box('brick', (L + 0.1, D + 0.1, 0.1), (0, 0, 0.15), None, bevel=0.01)
    K.box('mortar', (L + 0.16, D + 0.16, 0.012), (0, 0, 0.1), None)
    for sx in (-L / 2 + 0.05, 0.0, L / 2 - 0.05):                              # the rack: uprights and two shelves
        for sy in (-D / 2 + 0.05, D / 2 - 0.05):
            K.box('iron', (0.05, 0.05, 1.5), (sx, sy, 0.95), None)
    for z_ in (0.32, 0.98):
        K.box('iron', (L, D, 0.03), (0, 0, z_), None)
        for sy in (-D / 2 + 0.03, D / 2 - 0.03):
            K.box('iron', (L, 0.03, 0.07), (0, sy, z_ + 0.03), None)
        for i in range(6):                                                     # six cells to a shelf
            x = -L / 2 + 0.24 + (L - 0.48) * i / 5
            K.lathe('iron', [(0.0, 0.0), (0.165, 0.0), (0.175, 0.02), (0.175, 0.36), (0.16, 0.39), (0.0, 0.39)], 12, T(x, 0, z_ + 0.015), smooth=50.0)
            K.lathe('iron_rust', [(0.177, 0.1), (0.177, 0.14)], 12, T(x, 0, z_ + 0.015), smooth=60.0)
            K.lathe('plastic_white', [(0.0, 0.39), (0.1, 0.39), (0.1, 0.43), (0.06, 0.45), (0.0, 0.45)], 10, T(x, 0, z_ + 0.015), smooth=50.0)
            for s in (-1, 1):
                K.lathe('copper', [(0.0, 0.0), (0.018, 0.0), (0.018, 0.06), (0.0, 0.06)], 6, T(x, s * 0.05, z_ + 0.465))
        for s in (-1, 1):                                                      # a bus bar along each row of terminals
            K.box('copper', (L - 0.44, 0.016, 0.022), (0, s * 0.05, z_ + 0.535), None)
    # the roof: a sheet on four taller posts, tipped to the back
    for sx in (-L / 2 - 0.08, L / 2 + 0.08):
        for sy, h in ((-D / 2 - 0.12, 1.95), (D / 2 + 0.12, 1.8)):
            K.box('iron', (0.045, 0.045, h), (sx, sy, h / 2), None)
    K.box('aluminium', (L + 0.5, D + 0.6, 0.02), (0, 0, 1.9), R('X', -7.0), bevel=0.004)
    for i in range(7):                                                         # its corrugations, as ribs
        K.box('aluminium', (0.03, D + 0.6, 0.02), (-L / 2 - 0.15 + (L + 0.3) * i / 6, 0, 1.915), R('X', -7.0))
    # breaker box on the right-hand end, and the cable
    K.box('painted_grey', (0.12, 0.42, 0.5), (L / 2 + 0.11, -0.1, 1.0), None, bevel=0.012)
    K.box('painted_dark', (0.012, 0.2, 0.14), (L / 2 + 0.175, -0.1, 1.08), None)
    K.box('light_green', (0.014, 0.04, 0.04), (L / 2 + 0.175, 0.0, 0.86), None)
    K.box('painted_yellow', (0.014, 0.08, 0.05), (L / 2 + 0.175, -0.18, 0.86), None)
    K.hose('rubber', [(L / 2 + 0.12, -0.1, 0.75), (L / 2 + 0.2, -0.05, 0.3), (L / 2 + 0.4, 0.1, 0.03), (L / 2 + 1.1, 0.6, 0.025), (L / 2 + 1.9, 0.5, 0.025), (L / 2 + 2.6, 1.1, 0.02)], 0.024, 6, 4)
    K.finish()
    anchor('col_body_l', root, loc=(-0.7, 0, 0), radius=0.85)
    anchor('col_body_r', root, loc=(0.7, 0, 0), radius=0.85)
    return finish(root, 'bs_battery', samples=32, distance=0.6)


# ==============================================================================================
# bs_tank.glb
# ==============================================================================================
def build_bs_tank():
    """A water tank: a drum of welded iron plate two paces across and taller than a man, domed over, on a ring of
    brick; weld seams and a rusted waist, a manhole on top, a ladder up the side, a glass level gauge beside the
    ladder, a drain cock, and a lagged pipe running off along the ground toward the Hab."""
    ironwork()
    root = part('bs_tank')
    rng = random.Random(9)
    K = Kit('tank', root)
    RT, H0, HT = 1.15, 0.3, 2.2                                                 # the drum's radius, where it starts, its height
    # the footing: two courses of brick on end
    for k in range(2):
        n = 22
        for i in range(n):
            a = 360.0 * (i + 0.5 * k) / n
            K.box('brick', (0.24, 2 * pi * (RT + 0.02) / n * 0.93, 0.14), (0, 0, 0), R('Z', a) @ T(RT + 0.02, 0, 0.07 + 0.15 * k), bevel=0.008)
    K.lathe('mortar', [(0.0, 0.0), (RT + 0.1, 0.0), (RT + 0.1, 0.29), (0.0, 0.29)], 22, smooth=60.0)
    # the drum: three strakes of plate, a dome, a manhole
    prof = [(RT, H0)]
    for k in range(3):
        z0 = H0 + HT * k / 3
        prof += [(RT + 0.004, z0 + 0.02), (RT + 0.004, z0 + HT / 3 - 0.02), (RT, z0 + HT / 3)]
    for i in range(1, 6):
        a = (pi / 2) * i / 5
        prof.append((RT * cos(a) if i < 5 else 0.0, H0 + HT + 0.42 * sin(a)))
    K.lathe('iron', prof, 24, smooth=50.0)
    for k in range(1, 3):                                                      # the girth welds, rusting
        K.lathe('iron_rust', [(RT + 0.006, H0 + HT * k / 3 - 0.02), (RT + 0.012, H0 + HT * k / 3), (RT + 0.006, H0 + HT * k / 3 + 0.02)], 24, smooth=60.0)
    for i in range(6):                                                         # and the upright ones, staggered strake to strake
        for k in range(3):
            a = rad(60 * i + 30 * k)
            K.box('iron_rust', (0.012, 0.03, HT / 3 - 0.06), (0, 0, 0), R('Z', math.degrees(a)) @ T(RT + 0.004, 0, H0 + HT * (k + 0.5) / 3))
    K.lathe('iron', [(0.0, 0.0), (0.3, 0.0), (0.3, 0.05), (0.26, 0.07), (0.0, 0.07)], 14, T(0.25, 0.1, H0 + HT + 0.38), smooth=40.0)
    K.bolt_circle('steel', 0.26, 8, 0.014, 0.012, T(0.25, 0.1, H0 + HT + 0.45), seg=5)
    # the ladder, up the front-right
    LA = rad(-62)
    lx, ly = (RT + 0.14) * cos(LA), (RT + 0.14) * sin(LA)
    tx, ty = -sin(LA), cos(LA)
    for s in (-1, 1):
        K.tube('iron', [(lx + s * 0.2 * tx, ly + s * 0.2 * ty, 0.05), (lx + s * 0.2 * tx, ly + s * 0.2 * ty, H0 + HT + 0.25), ((RT - 0.25) * cos(LA) + s * 0.2 * tx, (RT - 0.25) * sin(LA) + s * 0.2 * ty, H0 + HT + 0.32)], 0.018, 6, round_r=0.1)
    for i in range(9):
        z_ = 0.32 + 0.27 * i
        K.tube('iron', [(lx - 0.2 * tx, ly - 0.2 * ty, z_), (lx + 0.2 * tx, ly + 0.2 * ty, z_)], 0.013, 5)
    for z_ in (0.8, 1.7):
        for s in (-1, 1):
            K.tube('iron', [(lx + s * 0.2 * tx, ly + s * 0.2 * ty, z_), ((RT) * cos(LA) + s * 0.2 * tx, RT * sin(LA) + s * 0.2 * ty, z_)], 0.012, 5)
    # the level gauge: a glass tube between two cocks, a float mark
    GA = rad(-100)
    gx, gy = (RT + 0.07) * cos(GA), (RT + 0.07) * sin(GA)
    K.tube('glass_clear', [(gx, gy, 0.6), (gx, gy, 2.2)], 0.022, 8)
    K.tube('light_blue', [(gx, gy, 0.62), (gx, gy, 1.5)], 0.012, 6)
    for z_ in (0.58, 2.22):
        K.box('steel', (0.07, 0.07, 0.06), (0, 0, 0), R('Z', math.degrees(GA)) @ T(RT + 0.05, 0, z_), bevel=0.006)
    # the drain cock and the pipe to the Hab, lagged in foil, on brick chairs
    PA = rad(-25)
    px, py = RT * cos(PA), RT * sin(PA)
    K.lathe('steel', [(0.0, 0.0), (0.07, 0.0), (0.07, 0.12), (0.0, 0.12)], 10, T(px, py, 0.5) @ R('Z', math.degrees(PA)) @ AX['X'])
    K.box('painted_red', (0.03, 0.16, 0.03), (0, 0, 0), T(px + 0.1 * cos(PA), py + 0.1 * sin(PA), 0.62) @ R('Z', math.degrees(PA)))
    run = [(px + 0.12 * cos(PA), py + 0.12 * sin(PA), 0.5), (px + 0.5 * cos(PA), py + 0.5 * sin(PA), 0.5), (px + 0.7 * cos(PA), py + 0.7 * sin(PA), 0.16), (2.4, -0.4, 0.16), (3.4, 0.1, 0.16), (4.2, 0.1, 0.14)]
    K.tube('gold_foil', run, 0.05, 8, round_r=0.14)
    for (bx_, by_) in ((2.4, -0.4), (3.4, 0.1)):
        K.box('brick', (0.24, 0.12, 0.1), (bx_, by_, 0.05), None, bevel=0.006)
    control_box(K, (-1.2, -1.45, 0.0), 20.0, lead=(-1.2, 1.6))
    K.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=1.4)
    return finish(root, 'bs_tank', samples=32, distance=0.7)


# ==============================================================================================
# bs_quarters.glb
# ==============================================================================================
def build_bs_quarters():
    """Living quarters: a barrel vault of brick five paces long, on a brick footing, its ends walled up; a round
    iron hatch in the front end with a porthole beside it, a round window in the back; basalt blocks laid along
    its feet to hold the thrust; a vent pipe through the crown. The windows glow after dark (`light_white`)."""
    ironwork()
    mat('cement', color=(0.36, 0.34, 0.31), metallic=0.0, roughness=0.95)
    # (a window with a room behind it: dark glass by day, and the game brings its light up after dark. In plain
    #  `light_white` a porthole was "a blank white disc".)
    mat('light_white_room', color=(0.17, 0.15, 0.12), metallic=0.0, roughness=0.3, emissive=(1.0, 0.86, 0.62), strength=1.5)
    root = part('bs_quarters')
    rng = random.Random(10)
    K = Kit('quarters', root)
    RO, L, BASE = 1.75, 5.0, 0.3                                               # the vault's outer radius, its length, its footing
    My = frame((0, 0, BASE), (0, 1, 0), (-1, 0, 0))                            # local z along the vault (+Y), local y up
    # (the footing is cement, not brick: in the vault's own brick, footing, steps and vault were "one lump")
    K.box('cement', (2 * RO + 0.5, L + 0.4, BASE), (0, 0, BASE / 2), None, bevel=0.012)
    # The vault: brick by brick, each course broken half a brick on from the last, mortar showing between them.
    # (It was sixteen strips the length of the vault with a joint drawn here and there: "one flat saturated orange
    #  ... brick is not legible; it reads as painted metal or moulded plastic".)
    NC, NB = 26, 12
    pitch = L / NB
    for i in range(NC):
        a0, a1 = pi * i / NC, pi * (i + 1) / NC
        for j in range(NB + (1 if i % 2 else 0)):
            y0 = max(-L / 2, -L / 2 + pitch * (j - (0.5 if i % 2 else 0.0)))
            y1 = min(L / 2, -L / 2 + pitch * (j + 1 - (0.5 if i % 2 else 0.0)))
            if y1 - y0 < 0.05:
                continue
            K.lathe('brick', [(RO - 0.12, y0 + 0.007), (RO, y0 + 0.007), (RO, y1 - 0.007), (RO - 0.12, y1 - 0.007)], 1, My, arc=a1 - a0 - 0.010, phase=a0 + 0.005, close=True, caps=True, smooth=20.0)
    K.lathe('mortar', [(RO - 0.014, -L / 2 + 0.01), (RO - 0.014, L / 2 - 0.01)], 26, My, arc=pi, smooth=60.0)

    def brick_tint(co, name, a):
        """No two bricks out of one kiln are one colour: each is lighter or darker, and one in seven is burnt dark."""
        if name != 'brick':
            return None
        x, y, z = co
        if z > BASE + 0.02 and abs(y) < L / 2 + 0.01 and math.hypot(x, z - BASE) > RO - 0.3:
            am = math.atan2(z - BASE, -x)
            i = int(max(0, min(NC - 1, am * NC / pi)))
            j = int(math.floor((y + L / 2) / pitch + (0.5 if i % 2 else 0.0)))
            h, h2 = hash01(i, j, 3.0), hash01(j, i, 9.0)
        else:
            h, h2 = 0.55, 0.5
        v = 0.72 + 0.38 * h
        if h2 < 0.14:
            return (a * v * 0.60, a * v * 0.66, a * v * 0.80)
        return (a * v, a * v * (0.94 + 0.14 * h2), a * v * (0.88 + 0.26 * h2))
    # the end walls, a little proud of the vault's ends, their courses and joints drawn on them
    half = [(RO * 0.98 * cos(pi * i / 14), RO * 0.98 * sin(pi * i / 14)) for i in range(15)]
    for sy in (-1, 1):
        K.prism('brick', half, 0.24, frame((0, sy * (L / 2 - 0.02) - 0.12, BASE), (0, 1, 0), (-1, 0, 0)), z0=0.0)

    def bond(Fm, holes):
        k = 1
        while 0.112 * k < 1.64:
            y = 0.112 * k
            c = sqrt(1.70 ** 2 - y * y) - 0.02
            segs = [(-c, c)]
            for hx, hy, hr in holes:
                if abs(y - hy) < hr:
                    d = sqrt(hr * hr - (y - hy) ** 2)
                    nxt = []
                    for s0, s1 in segs:
                        if hx - d > s0:
                            nxt.append((s0, min(s1, hx - d)))
                        if hx + d < s1:
                            nxt.append((max(s0, hx + d), s1))
                    segs = [(s0, s1) for s0, s1 in nxt if s1 - s0 > 0.03]
            for s0, s1 in segs:
                K.quad('mortar', (s0, y - 0.007, 0.003), (s1, y - 0.007, 0.003), (s1, y + 0.007, 0.003), (s0, y + 0.007, 0.003), Fm)
            k += 1
        joints(K, Fm, 3.5, 0.0, 1.64, skip=lambda x, y: x * x + y * y > 1.66 ** 2 or any((x - hx) ** 2 + (y - hy) ** 2 < (hr + 0.02) ** 2 for hx, hy, hr in holes))
    bond(T(0, -L / 2 - 0.142, BASE) @ R('X', 90), ((0.3, 0.95, 0.68), (-0.85, 1.05, 0.29)))
    bond(T(0, L / 2 + 0.142, BASE) @ R('Z', 180) @ R('X', 90), ((0.0, 1.0, 0.43),))
    # the hatch, in the front end: an iron ring, a dished door, a wheel
    F = frame((0.3, -L / 2 - 0.12, BASE + 0.95), (0, -1, 0), (1, 0, 0))
    K.lathe('iron', [(0.52, 0.0), (0.66, 0.0), (0.66, 0.07), (0.52, 0.07)], 20, F, close=True, smooth=40.0)
    K.lathe('painted_dark', [(0.0, 0.06), (0.3, 0.05), (0.52, 0.02), (0.52, 0.0), (0.0, 0.0)], 20, F, smooth=50.0)
    K.torus('steel', 0.17, 0.018, 14, 5, F @ T(0, 0, 0.12))
    for i in range(3):
        a = rad(120 * i + 30)
        K.tube('steel', [tuple(F @ Vector((0, 0, 0.12))), tuple(F @ Vector((0.17 * cos(a), 0.17 * sin(a), 0.12)))], 0.012, 5)
    K.bolt_circle('steel', 0.59, 10, 0.016, 0.012, F @ T(0, 0, 0.07), seg=5)
    K.box('cement', (1.1, 0.5, 0.15), (0.3, -L / 2 - 0.45, 0.075), None, bevel=0.01)                          # two steps up to it
    K.box('cement', (1.1, 0.26, 0.15), (0.3, -L / 2 - 0.3, 0.225), None, bevel=0.01)
    # a porthole beside it, and a bigger window in the back wall
    for (cx, cy, cz, rr, fwd) in ((-0.85, -L / 2 - 0.13, BASE + 1.05, 0.2, -1), (0.0, L / 2 + 0.13, BASE + 1.0, 0.34, 1)):
        W = frame((cx, cy, cz), (0, fwd, 0), (1, 0, 0))
        K.lathe('iron', [(rr, 0.0), (rr + 0.07, 0.0), (rr + 0.07, 0.05), (rr, 0.05)], 16, W, close=True, smooth=40.0)
        K.lathe('light_white_room', [(0.0, 0.004), (rr, 0.004)], 16, W)
        K.box('iron', (2 * rr, 0.022, 0.022), (0, 0, 0.03), W)                                               # a glazing bar across it, and one down
        K.box('iron', (0.022, 2 * rr, 0.022), (0, 0, 0.03), W)
    # basalt blocks along its feet, a vent through the crown, a lamp over the hatch
    for sx in (-1, 1):
        for j in range(9):
            K.box('basalt', (0.34, rng.uniform(0.42, 0.52), rng.uniform(0.24, 0.32)), (sx * (RO + 0.3), -L / 2 + 0.3 + (L - 0.6) * j / 8, BASE + 0.14), R('Z', rng.uniform(-5, 5)), bevel=0.03)
    K.lathe('steel', [(0.07, 0.0), (0.1, 0.0), (0.1, 0.5), (0.13, 0.52), (0.13, 0.58), (0.07, 0.58)], 10, T(0.0, 1.2, BASE + RO - 0.05), smooth=50.0)
    K.box('steel', (0.1, 0.1, 0.06), (0.3, -L / 2 - 0.16, BASE + 1.72), None)
    K.box('light_white', (0.07, 0.02, 0.04), (0.3, -L / 2 - 0.215, BASE + 1.72), None)
    control_box(K, (1.7, -L / 2 - 0.5, 0.0), -15.0, lead=(1.6, 1.6))
    K.finish()
    for j in range(4):
        anchor(f'col_vault_{j}', root, loc=(0, -L / 2 + 0.75 + (L - 1.5) * j / 3, 0), radius=2.0)
    return finish(root, 'bs_quarters', samples=32, distance=0.8, tint=brick_tint)


# ==============================================================================================
# bs_tower.glb
# ==============================================================================================
def build_bs_tower():
    """A comms tower: a mast of iron angle on a cement footing, three legs drawing in as they rise, braced bay
    by bay, six metres to its head; a dish there on a yoke, a whip aerial with a red lamp at its tip; three guys
    down to pegs; the grey box at its foot."""
    ironwork()
    mat('cement', color=(0.36, 0.34, 0.31), metallic=0.0, roughness=0.95)
    root = part('bs_tower')
    K = Kit('tower', root)
    K.box('cement', (1.5, 1.5, 0.3), (0, 0, 0.15), None, bevel=0.02)
    K.box('cement', (1.1, 1.1, 0.16), (0, 0, 0.38), None, bevel=0.02)
    HM, R0_, R1_ = 6.0, 0.5, 0.16
    Z0 = 0.46

    def leg(i, z):
        a = rad(90 + 120 * i)
        r_ = R0_ + (R1_ - R0_) * (z - Z0) / HM
        return (r_ * cos(a), r_ * sin(a), z)
    bays = 8
    for i in range(3):
        K.tube('iron', [leg(i, Z0), leg(i, Z0 + HM)], 0.028, 6)
        K.box('steel', (0.16, 0.16, 0.03), (leg(i, Z0)[0], leg(i, Z0)[1], Z0), None)
        for b in range(bays):
            z0, z1 = Z0 + HM * b / bays, Z0 + HM * (b + 1) / bays
            j = (i + 1) % 3
            K.tube('iron', [leg(i, z1), leg(j, z1)], 0.014, 5)                 # a ring at the top of the bay
            K.tube('iron', [leg(i, z0) if b % 2 == 0 else leg(j, z0), leg(j, z1) if b % 2 == 0 else leg(i, z1)], 0.011, 5)       # and a brace across it
    TOPZ = Z0 + HM
    K.lathe('iron', [(0.0, 0.0), (0.24, 0.0), (0.24, 0.04), (0.0, 0.04)], 10, T(0, 0, TOPZ))
    # the dish on its yoke, looking up and out to the front
    K.tube('steel', [(0, 0, TOPZ + 0.04), (0, 0, TOPZ + 0.5)], 0.035, 8)
    DM = T(0, -0.12, TOPZ + 0.62) @ R('X', 62)
    K.lathe('painted_white', [(0.0, 0.0)] + [(0.62 * i / 5, 0.17 * (i / 5) ** 2) for i in range(1, 6)] + [(0.64, 0.18), (0.62 * 4 / 5, 0.17 * (4 / 5) ** 2 - 0.02), (0.0, -0.02)], 24, DM, smooth=60.0)
    for i in range(3):
        a = rad(120 * i + 90)
        K.tube('steel', [tuple(DM @ Vector((0.58 * cos(a), 0.58 * sin(a), 0.16))), tuple(DM @ Vector((0, 0, 0.5)))], 0.008, 4)
    K.lathe('painted_dark', [(0.0, 0.0), (0.045, 0.0), (0.045, 0.09), (0.0, 0.09)], 8, DM @ T(0, 0, 0.46))
    K.tube('steel', [(0.14, 0.1, TOPZ + 0.04), (0.14, 0.1, TOPZ + 1.9)], 0.008, 4)                              # the whip
    K.box('light_red', (0.05, 0.05, 0.05), (0.14, 0.1, TOPZ + 1.92), None)
    # three guys from two thirds up, down to pegs
    for i in range(3):
        a = rad(30 + 120 * i)
        p0 = leg((i + 2) % 3, Z0 + HM * 0.68)
        peg = (3.3 * cos(a), 3.3 * sin(a), 0.0)
        K.tube('steel', [p0, (peg[0], peg[1], 0.12)], 0.005, 4)
        K.box('iron', (0.06, 0.06, 0.3), (peg[0], peg[1], 0.1), R('Z', math.degrees(a)) @ R('Y', -25))
    control_box(K, (0.95, -0.85, 0.0), -30.0, lead=(1.5, 1.5))
    K.finish()
    anchor('col_body', root, loc=(0, 0, 0), radius=0.95)
    return finish(root, 'bs_tower', samples=32, distance=0.6)


# ==============================================================================================
# bs_pad.glb
# ==============================================================================================
def build_bs_pad():
    """A landing pad: a disc of cement five paces across, all but flush with the ground, on a bed of basalt whose
    kerb stones show round its rim; a target painted on it (two rings and four bars); six lamps at its rim that
    burn after dark (`light_blue`); a pole with a wind vane at one side. He walks on it: nothing here stops him
    but the pole."""
    ironwork()
    mat('cement', color=(0.36, 0.34, 0.31), metallic=0.0, roughness=0.95)
    root = part('bs_pad')
    rng = random.Random(12)
    K = Kit('pad', root)
    RP = 5.0
    K.lathe('cement', [(0.0, 0.035), (RP - 0.03, 0.035), (RP, 0.01), (RP, -0.12)], 48, smooth=30.0)
    for i in range(6):                                                         # it was poured in six bays: the joints between them
        K.box('mortar', (RP - 0.3, 0.02, 0.004), (0, 0, 0), R('Z', 60 * i + 30) @ T((RP - 0.3) / 2 + 0.3, 0, 0.036))
    for r_ in (1.1, 3.3):                                                      # the target
        K.lathe('painted_yellow', [(r_ - 0.09, 0.0), (r_ + 0.09, 0.0)], 48, T(0, 0, 0.0375))
    for i in range(4):
        K.box('painted_yellow', (1.2, 0.18, 0.003), (0, 0, 0), R('Z', 90 * i) @ T(2.2, 0, 0.0378))
    n = 40                                                                     # kerb stones of basalt
    for i in range(n):
        a = 360.0 * i / n
        K.box('basalt', (0.3, 2 * pi * (RP + 0.16) / n * rng.uniform(0.84, 0.95), rng.uniform(0.1, 0.16)), (0, 0, 0), R('Z', a) @ T(RP + 0.16, 0, 0.03) @ R('Z', rng.uniform(-4, 4)), bevel=0.025)
    for i in range(6):                                                         # rim lamps on short posts
        a = rad(60 * i)
        x, y = (RP + 0.16) * cos(a), (RP + 0.16) * sin(a)
        K.lathe('steel', [(0.0, 0.0), (0.05, 0.0), (0.05, 0.22), (0.07, 0.24), (0.07, 0.27), (0.0, 0.27)], 8, T(x, y, 0.1))
        K.lathe('light_blue', [(0.055, 0.27), (0.055, 0.33), (0.0, 0.35)], 8, T(x, y, 0.1), smooth=50.0)
    # the pole and its vane
    px, py = (RP + 0.9) * cos(rad(200)), (RP + 0.9) * sin(rad(200))
    K.tube('steel', [(px, py, 0.0), (px, py, 2.6)], 0.025, 6)
    K.prism('painted_orange', [(0.0, -0.16), (0.9, -0.06), (0.9, 0.06), (0.0, 0.16)], 0.012, T(px, py, 2.4) @ R('Z', 35) @ R('X', 90), z0=-0.006)
    K.box('brick', (0.3, 0.3, 0.1), (px, py, 0.05), None, bevel=0.01)
    K.finish()
    anchor('col_pole', root, loc=(px, py, 0), radius=0.25)
    return finish(root, 'bs_pad', samples=32, distance=0.5)


BUILDERS = {'bs_solar': build_bs_solar, 'bs_battery': build_bs_battery, 'bs_tank': build_bs_tank,
            'bs_quarters': build_bs_quarters, 'bs_tower': build_bs_tower, 'bs_pad': build_bs_pad}

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if a in BUILDERS] or list(BUILDERS)
    unknown = [a for a in sys.argv[1:] if a not in BUILDERS]
    if unknown:
        print('unknown model(s):', ', '.join(unknown), '- known:', ', '.join(BUILDERS))
    for name in names:
        reset_scene()
        BUILDERS[name]()
