# Stranded II — 3D asset specification

Every model in the game is authored by a Python script that drives Blender headlessly
(`bpy` 5.x as a Python module) and exports a compressed `.glb`. This file is the contract between
the asset scripts and the game code. If a requirement here is wrong or impossible, say so in your
report rather than quietly changing it.

## Pipeline

| What | Where |
| --- | --- |
| Shared helpers (primitives, palette, part/anchor nodes, AO bake, export) | `tools/assets/lib.py` |
| Worked example | `tools/assets/example_crate.py` |
| One script per asset family | `tools/assets/<family>.py` |
| Review images (six views, optional animation strips) | `node tools/assets/preview.mjs <name> [--clips]` → `tools/assets/.cache/preview/` |
| Output, committed | `static/martian/assets/models/<name>.glb` |

Run a script with `/home/user/blender-venv/bin/python tools/assets/<family>.py`. If that
interpreter is missing, create it: `python3.11 -m venv /home/user/blender-venv &&
/home/user/blender-venv/bin/pip install bpy numpy pillow`. `tools/node_modules` must exist
(`cd tools && npm ci`).

Each family script exposes one `build_<name>()` function per model and a `__main__` block that
builds all of them (accept model names as command-line arguments to build a subset).
Do not edit `lib.py`; put family-specific helpers in your own file and report anything the
library should gain.

## Conventions

- Units are metres. Blender axes: Z up, **front of the model faces −Y**, X to the model's right
  is +X when you look at its front... in short, author it the way Blender's front view shows it.
  The origin is on the ground under the model's centre (z = 0 is the ground).
- A **part** (`part(name, ...)`) is a node the game finds by name and moves; its origin is its
  pivot. Helper meshes parented under a part are joined into it on export, one mesh per material.
  Name parts exactly as listed below. Extra parts are fine if they are worth animating.
- An **anchor** (`anchor(name, parent, loc, **extras)`) is an empty that gives the game a
  position: lights, seats, attach points, colliders. Colliders are anchors named `col_*` with
  `radius=<metres>`; the game keeps the player and rover outside that circle.
- Materials come from `PALETTE` in `lib.py` (flat PBR values, no image textures, no UVs). Add a
  one-off with `mat('name', color=..., metallic=..., roughness=...)` when the palette lacks it.
  The game finds some materials by name to drive them: `solar_cell` (gets dust), `screen`,
  `light_*` (switched and blinked), `glass_clear` (alpha-blended), `ground_dust` (soil that
  belongs to the ground: a heap, a berm, a scorched patch. The game draws it in the colour of the
  ground where the model stands, multiplied by the vertex tint, so tint it down to dug soil or
  soot and bring the tint back to 1 at the hem. The game also fades it to nothing toward every
  open edge of its surface, so leave open only the edge that should vanish into the ground: where
  soil runs under something that stands on it, carry the surface on underneath and close it),
  `ice` (water ice: the game makes it a glossy pale blue with a faint blue glow of its own, times
  the vertex colour. Lit hard and with that glow on top, a body lighter than about a fifth
  washes out to white, so paint the body dark, darker with depth and in cracks, and keep
  near-white for edges and seams; brown painted on it comes out mauve, so dust in ice is a matte
  material of its own), `void` (the dark of a hole or an opening: the game draws it pure black
  and lays no dust on it, so a patch of it on a surface reads as a hole cut through, like the
  slots in Curiosity's wheels). Baked ambient occlusion is
  stored per vertex and multiplied into the colour; dust and weathering are added by the game's
  shader, so model clean hardware.
- Detail comes from geometry: bevelled edges, panel seams, fasteners, handrails, cable runs,
  tanks, hinges, tread. Nothing in a finished model should read as a bare cube, cylinder or
  sphere. A surface wider than about half a metre needs something breaking it up.
- Smooth shading with sharp edges by angle is automatic (`smooth_angle`, default 38°). On large
  flat hull faces use a one-segment chamfer and a lower smooth angle; two-segment bevels plus
  angle smoothing make flat plates look pillowed.
- Draw calls: every material on every part is drawn separately. Keep a model to about ten
  materials or fewer (landers and props: eight), and do not split meshes into parts unless the
  game needs to move them.
- Ambient occlusion is baked by `export_model`; a vertex buried inside another piece is handled
  (rays that start inside a piece carry on), so kit-bashing from intersecting pieces is fine.
  Long plain walls need an edge loop near each end, because occlusion is sampled at vertices.
- Painted wear. The game folds every plain material into one single-sided material: the colour it
  draws is the material's colour times the vertex colour (all three channels), and roughness and
  metalness are the material's own. So a model that is seen close up indoors, where the game's
  dust shader does nothing, may carry more than occlusion in its vertex colours: tone steps
  between panels, grime, soiling, worn paint (`paint_wear` in `hab.py` does this for the inside
  of the Hab, per face corner, after the bake). Three rules follow. Paint can only darken, so a
  material that must also go lighter in places is defined lighter than it reads (`hab_tile`,
  `hab_liner`), and so that the room as a whole stays as light as it was, the palette materials
  that get painted are a tenth lighter in `hab.glb` than in `lib.py` while their unpainted faces
  (the outside of the Hab) carry a vertex colour a tenth darker: `LIFT` in `hab.py`. A change
  of sheen needs a material of its own (`hab_tile_worn`, `worn_edge`: paint rubbed through to
  metal). And a plain face is only drawn from its front, so wind every open face toward the
  viewer (`face_to`). Still no image textures.
- Scale reference: the astronaut is 1.86 m tall in the suit. Hardware is real-world size.

## Art direction

Near-future NASA hardware, the day after tomorrow rather than science fiction: white and
light-grey thermal fabric and painted aluminium, bare aluminium and titanium structure, gold
multi-layer insulation foil, black carbon and rubber, dark blue solar cells, orange and yellow
high-visibility accents and labels. Functional, modular, slightly improvised. Believable
engineering: things that move have hinges and actuators, things that carry load have struts,
things that hold pressure are round. The film *The Martian* is the mood reference; do not copy a
specific copyrighted design, logo or mission patch.

## How a model is judged (look at your own preview sheets)

1. The silhouette reads at a glance, both at 30 m and at 3 m, and from behind and above (the
   game camera sits behind and above the astronaut and the rover most of the time).
2. Proportions are believable beside a 1.86 m person.
3. No bare primitives, no razor edges, no large blank surfaces, no parts floating or
   intersecting untidily, no inside-out faces, no z-fighting between coincident faces.
4. Colour blocking is deliberate: a dominant neutral, one accent, dark functional parts.
5. Parts pivot correctly (rotate each in the preview or in Blender and check).
6. Triangle budget and node names match this file. Report triangles and file size per model.

Iterate until the sheet would not look out of place in a commercial game's art book.

---

## Family A — astronaut (`astronaut.py`)

`astronaut.glb`: one skinned mesh on one armature, ≤ 26,000 triangles.

A Mars surface EVA suit: hard upper torso, soft-goods arms and legs with visible joint bearings
and convolutes, bubble helmet with a gold visor, a life-support backpack with an antenna and
hoses to the torso, chest control unit with a display, helmet lamps (`helmet_light`), knee and
elbow pads, treaded boots, pressure gloves with four separate fingers and a thumb. Mostly
`suit_white` with `suit_orange` shoulder, forearm and thigh panels and `suit_grey` joints.
Height 1.86 m standing. Rest pose: arms about 30° out from the body, feet 0.22 m apart.

The hands have one bone each and no finger bones, so the fingers are modelled in the pose they
keep: a relaxed half-curl, a little spread, that hangs naturally, closes round the rover's yoke
and rests on a bench or a knee. White fabric with grey rubber caps on the fingertips, a pad over
each knuckle, a strap round the palm and a dark palm pad: at the game camera's distance it is
those dark parts that make the glove read as a hand.

The helmet comes off. Everything that leaves with it uses a material named `helmet_*`
(`helmet_white`, `helmet_dark`, `helmet_metal`, `helmet_light`) or `visor_gold`; the head under
it uses `head_*` (`head_skin`, `head_cap`, `head_hair`, `head_dark`; any name that starts
`head_` is treated the same). The game shows one group or the other: the helmet outdoors, the
head wherever there is air. The suit's padded collar closes the neck ring and is always drawn.
The visor is a true spherical cap with radial normals, because the game makes it a mirror and
any kink in it shows.

The bare head is seen mostly from behind, so that is the view it is built for: a snug cloth cap
that stops on the bulge of the skull (white centre panel, pale grey panels beside it, a slate ear
piece in front of each ear with a small black earphone, a chin strap and a boom microphone),
short brown hair below it from ear to ear down to a hairline on the nape, ears in skin colour
standing off the head, and the neck going down into the collar. A cap that covers the whole
back of the head reads as a ball at that distance; the hair, the ears and the neck are what
make it a head.

Bones (exact names; a `_L`/`_R` pair for each sided bone; no dots in names):
`hips` → `spine` → `chest` → `neck` → `head`; `chest` → `shoulder_L` → `upper_arm_L` →
`forearm_L` → `hand_L`; `hips` → `thigh_L` → `shin_L` → `foot_L` → `toe_L`. Rigid pieces
(helmet, backpack, chest unit, boots) are weighted to exactly one bone. Limb weights blend
smoothly across each joint so elbows, knees, shoulders and hips bend without collapsing or
tearing. Assign weights by code from the geometry (distance along the limb), not bone heat.

Anchors parented to bones: `lamp_L`, `lamp_R` (helmet lamps, pointing forward),
`hand_grip_R` (palm of the right hand), `eye` (inside the visor, looking forward).

Animation clips (glTF animations, exact names, in place — no forward translation; hips may
bob vertically; loops must match first and last frame):

| Clip | Length | Notes |
| --- | --- | --- |
| `Idle` | 8.0 s loop | a relaxed stand with nothing mirrored: weight on the right leg and the left knee eased, the shoulders tipped against the hips, the right arm hanging close and the left bent with its hand in front of the hip, the head a little off centre; two breaths, one slow look round |
| `Walk` | 0.9 s loop | Mars lope: long low-gravity strides of about 2.3 m, a short float between steps, arms counter-swing, torso leans a little into it. Covers 5.1 m/s |
| `Run` | 0.72 s loop | bounding sprint, about 3.3 m per stride, clear flight phase, strong arm drive. Covers 9.2 m/s |
| `JumpStart` | 0.25 s | crouch and push off |
| `Air` | 1.0 s loop | airborne, knees slightly tucked, arms out for balance |
| `Land` | 0.35 s | absorb and recover to standing |
| `WorkKneel` | 2.0 s loop | on the right knee, the left foot where Idle has it; the left hand braced on the left knee, the right working at ground level in front (digging, planting, salvage) |
| `KneelDown` | 0.45 s, once | from Idle's pose at time 0 down to WorkKneel's at time 0: the right foot steps back and the knee comes down. The game plays it before `WorkKneel` (a cross-fade from standing to kneeling puts the feet through the floor) |
| `KneelUp` | 0.45 s, once | `KneelDown` backwards, ending in Idle's pose at time 0 |
| `WorkStand` | 2.0 s loop | standing, hands working at chest height in front (consoles, wiping a panel, patching a wall) |
| `Drive` | 3.0 s loop | seated, hands on a yoke, small steering motion |
| `Stagger` | 1.4 s loop | hurt or out of air: hunched, uneven, one hand to the chest unit |
| `Collapse` | 2.2 s once | falls to the knees and then forward; ends lying still |
| `Wave` | 2.0 s once | one arm raised in a big slow wave |

Review each clip with `preview.mjs astronaut --clips` (six frames per clip) and fix feet that
slide through the ground, limbs that pass through the torso or backpack, and joints that fold
flat.

## Family B — vehicles (`vehicles.py`)

`rover.glb`, ≤ 48,000 triangles. A pressurised six-wheel exploration rover. About 5.6 m long,
3.0 m wide over the wheels, 2.9 m to the roof, 0.55 m ground clearance. A faceted cab forward
with a wrap-around windscreen in `glass_clear` so the driver can be seen, two seats and a
dashboard with a `screen` inside, a pressurised rear compartment with a side hatch and
steps, a roof rack with rails and tie-downs, roof solar panels (`solar_cell`), radiator panels,
a light bar, mesh wheels with chevron grousers on rocker suspension arms, a high-gain dish and a
whip antenna, grab handles, external stowage boxes, tanks and conduit.
Parts: `wheel_FL`, `wheel_ML`, `wheel_RL`, `wheel_FR`, `wheel_MR`, `wheel_RR` (origin at the
wheel centre, wheel radius 0.62 m, spin about local X; front axle near y = −1.9, middle 0,
rear +1.9); `steer_FL`, `steer_FR`, `steer_RL`, `steer_RR` (parents of those four wheels, yaw
about Z); `dish` (yaws about Z). Anchors: `headlight_L`, `headlight_R` (at lamps made of
`light_white`), `taillight` (`light_red`), `seat` (driver's hips), `door` (on the ground beside
the hatch, where a person stands to board), `cargo` (centre of the roof rack, about
(0, 1.1, 2.15)), `col_body` with `radius=2.6`.

`mav.glb`, ≤ 40,000 triangles. The Mars Ascent Vehicle: a two-stage rocket standing on a
four-legged descent stage, about 15.5 m tall, 4.2 m body diameter, legs spanning about 9 m.
Tank domes, an interstage band in `painted_orange`, RCS quads, a crew capsule under a
removable nose fairing, an access ladder and hatch platform, engine bells, footpads, umbilical
panels, gold foil on the descent stage. Parts: `ascent` (everything that lifts off; origin on
the vehicle axis at the base of the ascent stage), inside it `nose` (the removable fairing),
`strobe` (`light_red`) and `nozzle`. Anchors: `flame` (under the ascent engine, child of
`ascent`), `hatch` (on the ground at the foot of the ladder), `col_body` with `radius=3.4`.

`hermes.glb`, ≤ 30,000 triangles. The interplanetary ship that collects you, seen only at
distance in the finale: a long truss spine about 60 m, a rotating crew ring (part `ring`, spins
about the spine axis, which runs along Y), large solar arrays, radiators, a docking node at the
front (−Y), a reactor and ion engine cluster at the back (`light_blue` glow).

## Family C — the Hab (`hab.py`)

All in the Hab's own frame: origin at the centre of the floor, the door faces −Y.

`hab.glb`, ≤ 102,000 triangles in total (95,000 before the interior art pass, whose brief
allowed 15 % more). The crew habitat: an inflatable dome on a rigid base
ring with an airlock module. The pressure wall is a circle of radius 8.4 m (the game collides
with that circle; keep the inner surface there and the wall no thicker than 0.5 m). Interior
clear height at least 3 m at the wall, rising to the middle.

- Exterior: fabric panels between ribs or cables, a base ring with anchors and tie-downs, a few
  small round windows (material `window_glow`, defined by you as a dim warm emissive), external
  tanks and a cable tray leaving toward −X, a mast on the apex with a `beacon` part
  (`light_green`), work lights.
- Airlock: a rigid box attached at the door, floor level with the Hab floor, a clear passage
  2.2 m wide and 2.4 m high from y = −8.4 out to about y = −11.6, with a short ramp to the
  ground. Two pairs of sliding door leaves that the game opens by moving each leaf 1.05 m
  sideways: `door_outer_L`, `door_outer_R` (at the outside end) and `door_inner_L`,
  `door_inner_R` (at the Hab wall). Model them closed. Suit lockers and a bench are welcome
  inside the airlock as long as the passage stays clear.
- Interior shell: floor panels with cable trenches, the wall with equipment racks and conduit,
  roof ribs, light fixtures (`light_white`) with anchors `light_0` … `light_3`, a ring of
  ventilation ducting.
- The liner's surface is fixed: `hab_comforts.glb` is fitted to the very triangles the exporter
  writes for the quads of `IN_WALL` × `IN_ROOF`. `liner_for_paint` only cuts those triangles
  (two level loops for paint, a hole hidden inside each window frame); it never moves them.
- Lamps. The game hangs a point light at every `light_*` and `lamp_*` anchor it uses, often a
  hand's breadth from the fitting, so the lit part of a fitting is a small bright core in a
  housing and what faces the anchor at close range is dark: tubes in `light_white` in front of
  a diffuser in `light_white_dif` (the game drives every `light_white*` under `interior` with
  the Hab's power) on a dark baffle; over the farm an emitter strip in `light_grow` in a
  reflector that only glows, `light_grow_soft`.
- Portholes from inside: the frame, a gasket, a pane of `glass_clear`, a reveal through the wall
  and at its end the view, which is the part `window_view` (under `interior`): a sky in
  `window_glow_sky` over a ground in `window_glow_ground`, both emissive so that it reads as
  daylight whatever the room's lamps do. The game can dim it at night
  (`ownMaterials(hab.part('window_view'))`, then `setGlow`).
- Stations at fixed places (x, y) on the floor; the player stands within about 2.4 m to use
  each one, so leave their fronts reachable from the middle of the room:
  oxygenator (5.6, 3.6): a tall machine with tanks, a fan grille and a status light that is a
  part named `status_oxy` (`light_green`);
  water reclaimer (5.9, 0.4): tanks, pumps, piping;
  hydrazine rig (5.5, −2.6): an improvised still made from a fuel tank, tubing, a tray and a
  chimney, with a part `hydrazine_flame` (`flame`, modelled lit; the game hides it);
  comms desk (0, 6.6): a desk against the back wall with a main display that is a part named
  `comms_screen` (`screen`), keyboard, laptop, chair;
  bunk (−5.0, 4.9): a crew bunk with mattress, blanket and a privacy shelf;
  food shelf (4.2, −4.8): racking with ration packs and crates;
  fabricator bench (−4.6, −3.9): a workbench with a 3D printer, vice, tools and a parts bin.
  Each station needs an anchor `col_<name>` with its `radius` (about 0.9–1.2 m).
- Six farm plot positions must stay empty (the plots are a separate model): x = −5.2 and −3.2,
  y = 3.2, 0.8 and −1.6.
- The breach: in the back wall at (0, 8.4, z = 1.7), a part `breach_hole` (a torn opening about
  1.5 m across with ragged fabric, dark behind) and a part `breach_patch` (a tarp taped over it
  in a cross of tape). The game shows one or neither.
- Group everything that is only visible from inside under a part named `interior`, so the game
  can hide it when the player is far away.
- Set dressing in the free floor (a table with chairs, storage lockers, a suit rack) is
  welcome, each with a `col_*` anchor, as long as a person can walk from the door to every
  station and plot.

`farm_plot.glb`, ≤ 7,000 triangles. A raised grow tray, footprint 1.6 × 1.9 m, 0.34 m high, on
short legs, with an irrigation line. Parts: `soil` (the soil surface, shown once filled),
`plants` (a full crop of bushy potato plants with compound leaves, modelled at full size; the
game scales it from 0.25 up as it grows), `plants_dead` (the same crop withered and collapsed,
in dry brown). 

`solar_panel.glb`, ≤ 2,500 triangles. One ground-mounted panel of the Hab's array: a 3.4 × 2.2 m
panel of `solar_cell` in an aluminium frame, tilted about 24° toward −Y, centre about 1.15 m up,
on a braced post with a junction box and a cable. Part `panel` (the tilting assembly).
Anchor `col_post` with `radius=1.0`.

`uplink_dish.glb`, ≤ 4,000 triangles. A 1.8 m communications dish on a 1.3 m tripod mast with a
feed horn, an elevation actuator and an electronics box. Part `dish`. Anchor `col_post`
(`radius=0.8`).

## Family D — historic landers (`landers.py`)

Real spacecraft at real size, as they would look after decades of dust (the game adds the
dust). Each ≤ 14,000 triangles, each with an anchor `col_body` carrying a suitable `radius`.
`pathfinder.glb` (three open petals with solar cells, the camera mast, antennas, deflated
airbags around the base, ramps; the Sojourner rover is a part `sojourner` beside it),
`viking.glb`, `mars3.glb` (the Soviet lander with four open petals; also used for Mars 6),
`beagle2.glb` (lid open beside the base on its hinge; only two of the four solar discs deployed,
standing off the lid on hinge towers, the third sprung a little and jammed, the fourth still
stowed; the instrument arm folded in the base), `mer.glb` (Spirit and
Opportunity; part `mast`), `phoenix.glb`, `insight.glb` (with the domed seismometer and the
heat probe on the ground beside it), `msl.glb` (Curiosity; parts `mast` and `arm`; its power unit
is a finned cylinder between two low heat-exchanger plates that leave it in view), `m2020.glb`
(Perseverance; the same parts and collider, with its own wheels, mast head, turret and sample
housing), `ingenuity.glb`, `zhurong.glb`, `schiaparelli_wreck.glb` (an impact site, ≤ 12,000 triangles: the
crushed 1.65 m lander tilted in a low crater, a third of its drum still standing under torn gold
blanket and the rest blown out across the ground; a slab of the tiled back shell, with a second
collider `col_backshell`; a torn parachute; all on a blast patch of `ground_dust` about 7.6 m
across. Soot is painted per vertex after the bake: metal, foil and blanket keep their own
colours away from the burst. No loose piece of wreckage is a card: each has the thickness of what
it was torn from, is snapped or curled, shows what it is made of along its torn edge (honeycomb
between black skins, ribs on wall plate, the silvered back of foil) and has a second colour).
Lander builders start with `weathered()`, which roughens the palette metals: flat polished facets
mirror the sun into the bloom. Solar cells on landers are matte and sit on a `cell_grid`.
A colour the palette lacks, on a part too small for a material of its own (a caution placard, the
chips of a colour target, a cable sleeve), is a white part tinted per vertex after the bake:
`Tints` in `landers.py`. The game lays an even film of dust over the cells of the old landers,
which leaves them paler than their surround: tint them down by half where they should read dark.

## Family E — deployables and props (`props.py`)

`greenhouse.glb` (≤ 14,000): a geodesic dome of radius 4.0 m with `glass_clear` panels in an
aluminium frame, a base ring, a doorway facing −Y, a floor, grow lights; leave four plot
positions clear at (±1.1, ±1.2). Anchor `col_body` is not wanted (the player walks in).
Part `door_leaf` is the door, modelled closed, its origin on the hinge line (the left jamb seen
from outside); the game swings it outward, `rotation.y` from 0 to −1.83.
`solar_kit.glb` (≤ 3,000): a folding field solar panel, about 2.0 × 1.2 m, on a tripod.
`beacon.glb` (≤ 3,000): a 2.2 m navigation beacon with a lamp part `lamp` (`light_blue`), a
small solar cell and a whip antenna, on a weighted base.
`o2_cache.glb` (≤ 4,000): a field rack holding three oxygen bottles, parts `tank_0`, `tank_1`,
`tank_2` (the game hides the used ones), with a regulator and a hose.
`supply_pod.glb` (≤ 6,000): an air-dropped supply capsule about 1.4 m across, landed, petals
open, deflated airbags, a part `lid`, a strobe (`light_amber`).
`rtg.glb` (≤ 4,000): a radioisotope generator: a finned cylinder about 1.1 m long with end
caps, lifting lugs and warning bands.
`debris_a.glb`, `debris_b.glb`, `debris_c.glb` (≤ 2,500 each): wreckage from the descent
vehicle: a torn hull panel, a bent truss section, a ruptured tank.
`ice_outcrop.glb` (≤ 12,000): water ice standing out of the ground in a low scarp of layered
ice, about 7 m across with its skirt of soil and 1.4 m high, broken into six blocks. Each block
is a part, `block_0` … `block_5`, its origin on the ground under it: the game puts a collider
there and takes the blocks away one at a time, the last first, so no block rests on a later
one. What stays (the root) is the floor of stumps, talus, frost and the skirt (`ground_dust`).
Materials `ice`, `dust_lag` (the dust layers), `frost`, `ground_dust`.

## Family F — comforts for the Hab (`comforts.py`)

`hab_comforts.glb` (≤ 14,000 triangles in all): nine things the astronaut makes to turn the Hab
into a home, built in the Hab's own frame and already standing in their places, so the game adds
the file to the Hab with no offset and only shows or hides each one. Each is a part named
`comfort_<id>` whose geometry sits in an inner part `comfort_<id>_body` (so that only the nine
part nodes carry the bare name): `comfort_lights` (string lights over the galley table; lamps in
`light_warm`, which the game drives with Hab power), `comfort_herbs`, `comfort_photos`,
`comfort_chair` (with the collider anchor `col_chair`), `comfort_rocks`, `comfort_flag`,
`comfort_rug`, `comfort_greg`, `comfort_chess`. Positions are quoted from `hab.py` (table, truss,
ribs, liner, wall modules): if those move, this script must follow.
