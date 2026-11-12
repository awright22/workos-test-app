# Stranded II — quality bar and open items

This file is the bar the game is held to, what has been measured against it, and what is still
open. A session that changes the game updates it. "Measured" always says how: a number from
headless Chromium with software rendering (SwiftShader) is not a real frame rate.

## How to check

```
cd tools && npm ci
node build.mjs              # bundle src/ -> game.js, terrain-worker.js, game.css, sw.js
node lint.mjs               # undefined names, bad imports
node tests/run.mjs          # smoke, interface, story arc, saves, science, machines, farm, audio wiring
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
| Systems | Every system does what it says | Science 16/16, equipment wear 8/8, farm, meals and morale 7/7, audio wiring 26/26 |
| Saves | Old saves load or the player is told plainly why not | Format 4. Version-2 and version-3 saves migrate (terrain re-seated, sol count converted to the longer sols) and the player is told (tested). A format-4 save from before the pantry existed loads with a fresh pantry and morale (tested). Unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | **First independent review: not met.** Acted on (see the findings table); second review owed |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | First review: not met. Acted on; second review owed |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | First review: not met. Acted on (pooled lamps, porch and dome lights, sky fill); second review owed |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | First review: not met ("calm fog"). Reworked: murk that swallows the Hab at 30 m, gusts, streaming streaks and sheets, lamps on. Second review owed |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | First review: not met. Ice is found by colour in the orbital map; rocks carry frost; the ice outcrop is rebuilt and its apron takes the ground's colour. Second review owed |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | First review: title globe was black (terrain not yet loaded). The title now waits for the terrain; to re-check in the second round |
| Models | Every object is a purpose-built model; nothing reads as a primitive | 36 models. Lander and prop pass after the review: Perseverance has its own model, solar cells are consistent, the wreck, airbags, parachute, soil heap, ice and uplink dish are rebuilt, the greenhouse has a door. Second review owed |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Twelve clips blended. Idle rebuilt as a relaxed stand (8 s); he takes his helmet off where there is air. Not yet reviewed in motion; feet dip up to 4 cm in cross-fades |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | The mission tracker leads from the crash to the farm, water, Pathfinder and a first cooked dinner. Not yet played through as a new player at phone size |
| Interface | Every screen is legible and unclipped at 1280x720 through 2560x1440 and at phone sizes under the notch and status bar; touch has a pause button | Rebuilt and merged. 96/96 checks (`tests/ui.mjs`: keyboard, settings, touch, nothing overlapping or outside the safe area at seven sizes). An independent look at the screenshots is owed |
| Sound | Wind, suit, footsteps, rover, Hab, actions, events, and an adaptive score; nothing clips | Synthesised in the browser, no audio files. Measured offline: peaks under -1.4 dBFS with everything at once, calm day about -34 LUFS, storm -18. **Nobody has listened to it**: timbre and musicality are judged only from spectrograms. Calm beds are mostly below 300 Hz and will be faint on a phone speaker |
| Feel | Walking, jumping and driving have weight; the camera never clips through walls or ground | New controllers in. The camera treats the Hab, its airlock and greenhouse domes as rooms from inside and as obstacles from outside. Not yet reviewed in motion |
| Depth | "On par with Stardew Valley or Animal Crossing": many systems that feed each other, and always something worth doing | Survival, five crops with a pantry and cooked dinners, morale, field science with 17 materials and NASA grants, equipment wear, crafting and ten upgrades, four deployables, seven survey tasks, fourteen landers to salvage, dust storms and dust devils, mail from Earth and the Hermes, achievements. Still thin: Hab comforts and decoration, photo mode, things to do with a second greenhouse |

## Findings of the first independent picture review, and their state

A reviewer was given 49 screenshots and the bar above, not my opinion. Verdict: no picture row
met. Each finding below has been acted on in code or models; none has been re-reviewed yet.

| # | Finding | What was done |
| --- | --- | --- |
| F1 | Ground blurred, no detail near the camera (blocker) | Level ground is laid with two anisotropically filtered 2D detail textures in metres (ripples, cracked crust, grit); gravel is instanced geometry. Painted pebbles were removed after they read as bubbles at a low sun |
| F2 | Steep terrain smeared, cliffs rounded | Ledges and risers on steep ground, strata bands, 3D grain on slopes |
| F3 | Exposure and ground colour swing between shots | The orbital mosaic's stretched contrast is compressed; exposure is metered and eased |
| F4 | Sky flat | Dust bands, paler horizon, aureole |
| F5 | Night is black; lamps light nothing | A pool of real lights handed to the nearest lamp sources, sky fill at night, porch, dome, beacon and pod lamps |
| F6 | Dawn sun blooms out; no blue glow | Dim low sun disc, blue forward-scatter glow, smaller aureole at the horizon |
| F7 | Storm is calm fog | See the storm row above |
| F8 | The pole is not ice | See the poles row above |
| F9 | Ice outcrop broken | Rebuilt as a cracked slab of six blocks on a scraped floor; ice has its own cold, glossy material |
| F10 | Title globe black | The title waits for the terrain |
| F11 | Rocks sparse, faceted, floating | Rock gardens at four historic sites, finer near rocks, rocks sunk by slope, colour from the ground |
| F12 | Interiors without shadows; helmet worn indoors | The room casts under its ceiling lights when sealed; the helmet comes off in air |
| F13 | Hardware too clean and one colour; solar cells inconsistent | A dust layer in the shared material (more on what faces up and near the ground), by an amount per model; landers repainted with duller metals and navy cells on a dull grid |
| F14 | Props read as primitives | Parachute, airbags, soil heap, wreck shards and uplink dish rebuilt |
| F15 | Visor painted on; idle stiff | The visor is a true spherical mirror; new Idle, softer arms in Walk and Run |
| F16 | Ground untouched under objects; tracks are stamps; greenhouse has no door | Level pads under everything set down, trodden soil and scorch stains, continuous ruts, aprons that take the local ground colour, a door that swings open |
| F17 | Overall softness | Anisotropic filtering and the new ground; not otherwise addressed |

## Open items

| # | Item | State |
| --- | --- | --- |
| 3 | Second reviewer pass on a fresh screenshot matrix against this bar; act on findings | next |
| 18 | Independent look at the interface screenshots (`tests/ui-shots.mjs`) | next |
| 12 | Publish to `gh-pages` | **Preview published** to `gh-pages/next/` (the first game is still at the root). Refresh the preview after the second review; replace the root once the preview has been seen running on the owner's phone |
| 10 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | blocked on hardware |
| 11 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 15 | Listen to the audio on real speakers and a phone; retune by ear | blocked on a listener |
| 8 | Play the first ten minutes as a new player at phone size; fix what confuses | open |
| 17 | More depth: Hab comforts and decoration that feed morale, photo mode, sounds for dust devils | open |
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
