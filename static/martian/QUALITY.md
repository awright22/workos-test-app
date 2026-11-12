# Stranded II — quality bar and open items

This file is the bar the game is held to, what has been measured against it, and what is still
open. A session that changes the game updates it. "Measured" always says how: a number from
headless Chromium with software rendering (SwiftShader) is not a real frame rate.

## How to check

```
cd tools && npm ci
node build.mjs              # bundle src/ -> game.js, terrain-worker.js, game.css, sw.js
node lint.mjs               # undefined names, bad imports
node tests/run.mjs          # smoke, interface, story arc, saves, science, machines, farm, photo, audio wiring
node tests/first-ten.mjs    # the first ten minutes on a phone, as numbered screenshots (--desktop)
node tests/audio.mjs        # 129 offline audio renders measured for loudness and clicks (5 min)
node tests/perf.mjs         # draw calls and triangles per frame against the budgets below
node tests/shots.mjs        # screenshot matrix -> tools/tests/.cache/shots/   (--only a,b for some)
node tests/ui-shots.mjs     # every interface state at every size -> tools/tests/.cache/ui/
node serve.mjs              # play at http://127.0.0.1:8765/  (?q=low|medium|high|ultra)
node publish.mjs "what changed"            # build, lint, test, then publish to gh-pages
node publish.mjs --to next "what changed"  # ... into gh-pages/next/, beside the live game
```

The debug hook `window.__MG` (see `src/main.js`) can start a game at any site, teleport, set
the local time and the weather, step the simulation without drawing, and place a free camera
(`photo`) for pictures.

## The bar

| Area | Bar | State |
| --- | --- | --- |
| Frame rate | 60 fps on a mid-range laptop at "high"; 30 fps on a recent iPhone at "low" | **Not measured on a real GPU.** Software rendering gives 0.4–12 fps, which says nothing. Dynamic resolution (55 fps target) and four quality presets are in place. Needs a number from the owner's phone and a laptop: the diagnostics panel (four taps top-left, or F3) reports it with a COPY button |
| Scene cost | Per frame (`tests/perf.mjs`). "low": 180 draw calls, 340k triangles in the picture, 230k in the shadow passes. "high": 290 / 600k / 400k. These budgets are estimates, not derived from hardware: they exist to catch regressions until a real frame rate is known | Measured (counts, valid on any machine). low: 62–180 calls, 123–306k picture, 47–221k shadow. high: 75–226, 123–461k, 134–309k. "low" outside the Hab sits exactly on its call budget (180): 75 of those calls are shadow passes for the Hab, rover, array and astronaut |
| Load | Title screen interactive in under 5 s on a 20 Mbit connection; total download under 14 MB; works offline after first load | 13.0 MB precached (52 files); `game.js` is 1.09 MB. Headless load to title: 1.2–5.5 s from localhost. Not measured on a phone network |
| Console | Zero errors or warnings in a full playthrough | Zero errors in every test and screenshot run |
| Story arc | Every step from the crash to the rescue works | 23/23 scripted checks (`tests/arc.mjs`) |
| Systems | Every system does what it says | Science 16/16, equipment wear 8/8, farm, meals, morale and comforts 8/8, photo mode 9/9, audio wiring 26/26 |
| Saves | Old saves load or the player is told plainly why not | Format 4. Version-2 and version-3 saves migrate (terrain re-seated, sol count converted to the longer sols) and the player is told (tested). A format-4 save from before the pantry existed loads with a fresh pantry and morale (tested). Unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | Round 2: NEARLY. Missing natural ground detail (R6) and a noon that is not washed out (R11) |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | Round 2: NEARLY. The low sun and its blue glow are right; the ground goes grey and glossy toward the sun (R12) |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | Round 2: NEARLY. Stars, lamp pool, headlights and portholes are there; corner haze, ambient lift and a blown-out greenhouse are not right (R3, R4) |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | Round 2: NEARLY. Visibility collapses and the sun is a disc; the dust has no body (R14) |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | Round 2: NOT MET. White sand, not ice (R5) |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | Round 2: MET |
| Models | Every object is a purpose-built model; nothing reads as a primitive | 37 models. Lander and prop pass after the review: Perseverance has its own model, solar cells are consistent, the wreck, airbags, parachute, soil heap, ice and uplink dish are rebuilt, the greenhouse has a door. Second review owed |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Twelve clips blended. Idle rebuilt as a relaxed stand (8 s); he takes his helmet off where there is air. Not yet reviewed in motion; feet dip up to 4 cm in cross-fades |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | Independent review of a phone walk-through: NEARLY. A "what" is always on screen; the why, the where and the six bars are not explained |
| Interface | Every screen is legible and unclipped at 1280x720 through 2560x1440 and at phone sizes under the notch and status bar; touch has a pause button | Independent review: desktop NEARLY, phone NOT MET (see the table below). 96/96 automated checks (`tests/ui.mjs`) still pass: they test overlap and safe areas, not legibility or target size |
| Sound | Wind, suit, footsteps, rover, Hab, actions, events, and an adaptive score; nothing clips | Synthesised in the browser, no audio files. Measured offline: peaks under -1.4 dBFS with everything at once, calm day about -34 LUFS, storm -18. **Nobody has listened to it**: timbre and musicality are judged only from spectrograms. Calm beds are mostly below 300 Hz and will be faint on a phone speaker |
| Feel | Walking, jumping and driving have weight; the camera never clips through walls or ground | New controllers in. The camera treats the Hab, its airlock and greenhouse domes as rooms from inside and as obstacles from outside. Not yet reviewed in motion |
| Depth | "On par with Stardew Valley or Animal Crossing": many systems that feed each other, and always something worth doing | Survival, five crops with a pantry and cooked dinners, morale, field science with 17 materials and NASA grants, equipment wear, crafting and ten upgrades, four deployables, seven survey tasks, fourteen landers to salvage, dust storms and dust devils, mail from Earth and the Hermes, nine comforts to make for the Hab, photo mode, nineteen achievements. Still thin: things to do with a second greenhouse, anything to do with other people's hardware beyond salvage |

## Independent picture reviews

Each round, a reviewer is given the screenshot matrix and the bar above, not my opinion.

**Round 1** (49 pictures): no picture row met; 17 findings (F1–F17).
**Round 2** (51 pictures, after the work on F1–F17): orbit MET; day, dawn and dusk, night, storm,
models and figure NEARLY; poles and overall NOT MET. "A clear step up ... the best frames
(`hab-dusk`, `storm-sun`, `title`) would pass in a good indie release. As a set it is not at
the bar." Of the round-1 findings it judged F6 (dawn sun) and F10 (title globe) fixed, the
helmet indoors, the soil heap, the uplink dish and the greenhouse door fixed, and the rest
improved but not done, with interior shadows, rover tracks and untouched ground under objects
unchanged.

Round-2 findings, most damaging first, and their state:

| # | Finding (pictures) | Kind | State |
| --- | --- | --- | --- |
| R1 | Terrain artefacts on slopes: a lattice of pale flecks on a canyon wall, sawtooth bands on a far hillside, teeth along strata (`canyon-floor`, `lander-curiosity`, `canyon`) | bug, blocker | fixed in `canyon-floor` (ledges come in two sizes and are laid only where a mesh of that spacing can draw them); strata made uneven and faded with distance. To re-review |
| R2 | Landmarks do not read: Valles Marineris is a striped bank with rounded lobes, Olympus a dune slope (`canyon`, `canyon-floor`, `olympus`) | terrain art | open |
| R3 | Night is lit by raised ambient; a pale haze fills the corners on foot; porch and rover lamps light nothing; the helmet lamp is a flat hard oval (`hab-night`, `night-plain`, `twilight`) | lighting, part bug | corner haze removed (it was the cold-visor tint lifting dark corners); helmet lamp given a gentler falloff. Ambient level and lamp pools still to do |
| R4 | `greenhouse-night`: a blown-out white bloom over the dome; no light spills onto the ground | bug | fixed: glass is no longer mirror-smooth to a lamp a metre away; the dome's lamps now spill onto the ground |
| R5 | Poles are not ice: the cap is white sand with the sand's ripples; the outcrop is two smooth bars (`north-pole`, `ice`) | material | acted on: bluer, glossier ice with frost polygons and no sand ripples. To re-review |
| R6 | Ground detail is two stamps planet-wide: ripples in closed whorls, an even honeycomb of cracks; fades at noon; nearest 2 m soft | art | acted on: ripples laid across the wind without whorls, in patches; frost polygons only from the mid-latitudes to the poles; a finer grain layer in the nearest metres; more light-independent tone. To re-review |
| R7 | Rocks are smooth, rounded, ground-coloured lumps of one size | art | acted on: broken faces, uneven proportions, darker and greyer stone under the dust, a longer tail of large sizes. To re-review |
| R8 | Interiors are flat: no shadows under furniture or the astronaut, untextured colour (`inside-*`) | lighting, part bug | shadows fixed: sealed in, the ceiling's shadow-casting light is now the room's main light. Untextured surfaces remain |
| R9 | Astronaut's shadow: faint and detached at the Hab in the morning, missing at the pole (`hab-morning`, `north-pole`) | bug | not a shadow fault at the pole: the sun was straight behind the camera and his shadow hid behind him (camera turned). A real fault was found and fixed on the way: the cascades were mis-sized whenever the camera's near plane had changed without its projection being rebuilt |
| R10 | Dust is a uniform beige wash on the landers; the Hab, rover, MAV and greenhouse are showroom-clean | art | acted on: dust lies mostly on upward faces and near the ground; less on the old landers, more on the Hab, rover, MAV and deployables; every old lander's cells are dusty. To re-review |
| R11 | Exposure and colour spread: washed-out peach at noon against deep rust elsewhere | grade | acted on: exposure closes down further toward noon. To re-review |
| R12 | At a low sun the ground goes grey and glossy; pale slivers on dark hills (`dawn`, `dusk`) | shader, part bug | acted on: regolith has almost no sheen at grazing angles (ice keeps its glint). Slivers to re-check |
| R13 | Sky featureless; no sun disc on a clear day; sun-side brightening is a vertical curtain | sky | open |
| R14 | Storm dust is thin white hairlines with no body; a straight horizon line crosses the murk (`storm`) | effect, part bug | acted on: the storm sky is now exactly the fog's colour (no horizon line); soft dust-coloured smears instead of hairlines; denser sheets. To re-review |
| R15 | Props: the pod's parachute is faceted and hovers; Pathfinder's airbags read as dirt; a polyhedron lump at the wreck | models | open |
| R16 | Rover tracks are intermittent stamps; no disturbed soil under the Hab, landers, pod or greenhouse | effect | open |
| R17 | Daylight glare blobs at the frame edge (`walk-plain`, `debris-b`) | bug | acted on: metal's roughness floor raised so a facet no longer mirrors the sun into the bloom. To re-check |

Capture gaps the reviewer named: no clear-day picture with the sun in frame, no front view of
the astronaut, nothing at 90° north or at the south cap, and `canyon` no longer stands on a
steep face.

## Independent interface and onboarding review

A reviewer was given every interface state at 1280x720 and at iPhone landscape (844x390), and a
numbered walk-through of a new player's first ten minutes on the phone (`tests/first-ten.mjs`).
Verdict: **desktop NEARLY, phone NOT MET, first ten minutes NEARLY.** Nothing sits under the
notch or the home indicator, and a "what to do" is on screen at every step; what is missing is
the why and the where, an explanation of the six bars, and type and targets big enough for a
phone.

| # | Finding | State |
| --- | --- | --- |
| U1 | Pause screen overlaps itself: four audio sliders are strewn under the run card (both sizes) | fixed: the music, effects and ambience sliders moved into Settings > Sound. (The Master volume slider there had never worked: it now does) |
| U2 | Phone HUD: six unlabelled bars with about 9 px numbers; no suit countdown | fixed: on phones each bar has its name and a 13 px number, and the suit's time left shows under the dial (the narrowest phones keep icons only) |
| U3 | Desktop colony Inventory: two-line rows collide in a one-line pitch | fixed: taller rows; Morale has its own heading; a machine at 12% is "failing", not "failed" |
| U4 | Emergencies do not lead the mission list ("Seal the breach" sat second, under "Cook a dinner") | fixed: an emergency always leads the list, largest, with its distance ("Hab breach: seal it") |
| U5 | Phone touch targets under 44 px: top-right buttons, tabs, Fabricate/Make/Install, photo-mode controls, map close | fixed in CSS: 44 px minimum for the top-right buttons, tabs, small buttons, option groups, sliders and photo-mode controls on touch. To re-review |
| U6 | Keyboard wording on touch ("press X"), "PWR" against "POWER" | fixed: no keyboard-only wording; "power" spelled out |
| U7 | Numbers that read as bugs: "next NASA grant at 25" when science is 52; a blueprint shown locked after its task is complete; trend arrows that contradict the alert beside them; "13 LEFT" against "N TO PLANT" in the seed chooser | open (some are test-fixture states; each to be checked) |
| U8 | Phone drops what the player needs: third mission line, crop descriptions, storm explanation, photo-mode hint | part fixed: the reason for each new objective is toasted on phones; the seed chooser's sub-line carries what planting costs. The phone still shows two mission lines (three collide with the touch buttons) |
| U9 | Focus ring contradicts the selection (new game, colony tabs); a ring shown on touch | fixed for touch: no focus ring there |
| U10 | Photo-mode bar takes 150 of 390 px on a phone, cannot be hidden; "Slide" and "Astronaut" unclear | fixed: starts minimised on phones (Controls / Take photo / Done); check marks on toggles; "Sideways" |
| U11 | Map: unlabelled icon buttons over content on the phone, labels piling on the player marker, legend covering the corner | open |
| U12 | Suit number goes dark red on dark when critical | open |
| U13 | Hold/tap labels disagree; the action button can read "RUN" beside the sprint button "RUN" | part fixed: the action button no longer reads RUN beside the sprint button |
| U14–17 | Sliced section headers with no scroll cue; nine different status words; chips that read "1 tomato seeds"; thin win and sleep screens; nine identical "unknown lander" cards | open |
| O1 | The six bars are never named or explained; Morale appears and moves without a word | part fixed: named bars on phones; the premise card names the six bars; Morale is explained at the first dawn |
| O2 | The premise and the goal ("10 rations, rescue Sol 25: farm or starve") are toasts that vanish | fixed: "the numbers" is a card he reads and dismisses (rations, earliest rescue, sols with nothing to eat, what to do) |
| O3 | Objectives say what, never why or where; no marker for the current target | part fixed: the current objective carries its reason (in the panel on desktop, as a toast on phones). No world marker for indoor targets yet |
| O4 | Cold open: the Hab can be off-screen, no arrow, no countdown on the phone | part fixed: the suit's time left now shows on phones. No edge arrow when the Hab is off-screen |
| O5 | Everything unlocks at once at the airlock | open |
| O6 | Farming's costs and care are silent (planting takes food; beds need a second watering) | part fixed: the seed chooser says potatoes use one of your food and what each crop yields; a "Water the farm beds" objective appears when beds stall |
| O7 | Sleep: no cue that it is time, the bunk re-offered sleep at dawn (fixed: not offered in the morning), a Sol 2 line repeats | fixed: sleep is not offered in the morning; the Sol 2 line no longer repeats the premise |

## Open items

| # | Item | State |
| --- | --- | --- |
| 3 | Act on the round-2 picture findings (R1–R17 above), bugs first; then a third review | in progress |
| 18 | Act on the interface and onboarding review (U1–U17, O1–O7 above), the pause screen and the phone HUD first | next |
| 12 | Publish to `gh-pages` | **Preview refreshed** at `gh-pages/next/` after the second review round (the first game is still at the root). Replace the root once the preview has been seen running on the owner's phone |
| 10 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | blocked on hardware |
| 11 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 15 | Listen to the audio on real speakers and a phone; retune by ear | blocked on a listener |
| 8 | Play the first ten minutes as a new player at phone size; fix what confuses | open |
| 17 | More depth: uses for a second greenhouse; visiting landers could do more than salvage | open |
| 13 | Shadow cost at the base: the rover (45k triangles) and Hab are drawn into both cascades; "low" is on its call budget there | open (simplified shadow models would halve it) |
| 5 | Sky from orbit: thinner limb haze; Phobos and Deimos | open |
| 6 | More variety between regions (dark basalt plains, bright dust, dune fields) | open |
| 19 | Astronaut: feet dip up to 4 cm when clips cross-fade; JumpStart, Land, Wave and Collapse still start from the old square stance; the face is plain under a metre | open |
| 20 | Wreck blast patch still reads as a smooth mound at its rim; Pathfinder's airbags are faceted up close | open |
| 14 | Asset tooling: fold the helpers the model scripts each copied into `tools/assets/lib.py` | open |

## Decisions worth knowing

- **Terrain is real.** Elevation is NASA MOLA (MEGDR, 32 px/deg source) resampled to six
  1024-texel cube faces; colour is the Viking MDIM 2.1 mosaic. Relief is exaggerated 4x (it was
  6x on the old analytic terrain) so volcanoes and canyons read at walking scale without turning
  every crater into a pit. Below about 40 m the surface is procedural (craters, fractal relief,
  dunes), scaled by how rough the real surface is there.
- **What you stand on is what is drawn.** Physics and the terrain workers call the same height
  function; building sites are levelled in that function, not by moving meshes.
- **Level ground uses 2D textures, slopes use 3D ones.** Flat ground is seen at grazing angles
  and only a 2D texture can be filtered anisotropically, so it is laid with two generated
  textures addressed in metres across the cube face. Slopes, face seams and far relief use two
  tiling 64-texel volumes cut by the surface, which cannot smear on a cliff.
- **Only grit is painted on the ground.** Anything bigger than a thumbnail is real geometry:
  painted stones read as flat discs when the sun is low.
- **Rocks, dust and soil take their colour from the ground.** Bare stone is a darker, greyer
  version of the local orbital colour; the dust on hardware and any heap or apron of soil
  (`ground_dust` in a model) is the local ground colour itself, ice included.
- **Two shadow cascades.** three.js's `SunLight` with a split set by hand (10–18 m): a tight map
  around the camera so the astronaut's shadow is a figure, a wide one for the base. Sealed in
  the Hab, the same maps are used for the ceiling lights.
- **Lamps are pooled.** Every lamp in the world is a source; a small pool of real lights is
  handed each frame to the sources nearest the camera.
- **Exposure is metered.** It opens up as the sun sinks, closes when the camera looks into a low
  sun, and eases over about a second like an eye.
- **A sol is eight minutes.** It was 220 seconds, which flipped day and night every two
  minutes and gave a suit tank under three minutes on foot. Rescue moved from Sol 20/45/60 to
  15/25/35, so a mission is about as long in real time; a tank is about six minutes walking.
- **Samples are identified by place, not by chance.** What a bag holds is fixed by its
  coordinates on the real planet, so the catalogue is a reason to travel and a lead in the
  journal means something.
- **Morale never kills.** It changes how fast he works and mends (about a fifth either way),
  so a bad week is felt but cannot end a run by itself. Variety on the plate holds it level;
  a cooked dinner, mail, music, a harvest or a discovery lift it.
- **A bed asks what to plant.** The first planting already offers potatoes, radishes and
  lettuce, with each crop's pace and thirst on the card, so the system explains itself there.
- **Photo mode's looks are in the renderer's final pass**, not CSS filters, so the saved file is
  exactly what is on screen. The shutter redraws one frame at the screen's full resolution
  whatever the quality preset.
- **Comforts are one model.** `hab_comforts.glb` is built in the Hab's own frame with a part for
  each comfort; the game only shows or hides them.
- **The helmet is on the instant the air is in doubt** and comes off about a second after he
  is somewhere he can breathe: the Hab, a greenhouse dome, the rover's cabin.
- **The sol turns at dawn at the colony.** Local clocks elsewhere on the planet differ, as they
  should.
- **Mars gravity is real** (3.72 m/s2). Walk and run are loping gaits made for 5.1 and 9.2 m/s.
- **The rover reaches its listed top speed.** In the first version it could not, so the
  drivetrain upgrades did nothing.
- **A greenhouse is a place.** It levels its site, has walls, a doorway and a door, and is set
  down facing the astronaut; saves keep its bearing.
- **Outputs are committed.** `game.js`, `terrain-worker.js`, `game.css` and `sw.js` are build
  products of `tools/build.mjs`, committed so the game runs from any static host.
