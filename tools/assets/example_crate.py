"""
Worked example for the asset pipeline: a small equipment crate with a hinged lid.
Run:  /home/user/blender-venv/bin/python tools/assets/example_crate.py
Then: node tools/assets/preview.mjs example_crate
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *  # noqa: E402,F401,F403


def build():
    root = part('example_crate')

    # body: a bevelled box sitting on the ground
    bm = bm_new()
    add_box(bm, (0.9, 0.6, 0.42), (0, 0, 0.25))
    mesh_obj('body', bm, 'painted_white', parent=root, bevel=0.025, bevel_segments=3)

    # corner guards and feet (helpers: they get joined into the root part on export)
    bm = bm_new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            add_box(bm, (0.08, 0.08, 0.46), (sx * 0.43, sy * 0.28, 0.25))
            add_cyl(bm, 0.035, 0.04, (sx * 0.36, sy * 0.22, 0.02), seg=12)
    mesh_obj('guards', bm, 'painted_dark', parent=root, bevel=0.008)

    # an orange hazard band and two handles made from swept tubes
    bm = bm_new()
    add_box(bm, (0.905, 0.605, 0.07), (0, 0, 0.33))
    mesh_obj('band', bm, 'painted_orange', parent=root)
    bm = bm_new()
    for sx in (-1, 1):
        add_tube(bm, [(sx * 0.455, -0.12, 0.22), (sx * 0.51, -0.12, 0.22), (sx * 0.51, 0.12, 0.22), (sx * 0.455, 0.12, 0.22)], 0.012, seg=8)
    mesh_obj('handles', bm, 'steel', parent=root)

    # the lid is its own part: the game can rotate it about its hinge (local X axis)
    lid = part('lid', parent=root, loc=(0, 0.3, 0.46))
    bm = bm_new()
    add_box(bm, (0.92, 0.62, 0.05), (0, -0.3, 0.025))
    mesh_obj('lid_shell', bm, 'painted_white', parent=lid, bevel=0.015)
    bm = bm_new()
    add_cyl(bm, 0.012, 0.012, (0.3, -0.6, 0.03), seg=10)
    mesh_obj('lid_light', bm, 'light_green', parent=lid)

    anchor('attach_top', root, loc=(0, 0, 0.52))
    return export_model(root, 'example_crate')


if __name__ == '__main__':
    main_guard(build)
