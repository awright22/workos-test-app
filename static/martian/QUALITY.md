# Stranded II — quality bar and open items

This file is the bar the game is held to, what has been measured against it, and what is still
open. A session that changes the game updates it. "Measured" always says how: a number from
headless Chromium with software rendering (SwiftShader) is not a real frame rate.

## How to check

```
cd tools && npm ci
node build.mjs              # bundle src/ -> game.js, terrain-worker.js, game.css, sw.js
node lint.mjs               # undefined names, bad imports
node tests/run.mjs          # smoke, full story arc (20 checks), save migration
node tests/perf.mjs         # draw calls and triangles per frame against the budgets below
node tests/shots.mjs        # screenshot matrix -> tools/tests/.cache/shots/
node serve.mjs              # play at http://127.0.0.1:8765/  (?q=low|medium|high|ultra)
node publish.mjs            # build, lint, test, then publish static/martian to gh-pages
```

The debug hook `window.__MG` (see `src/main.js`) can start a game at any site, teleport, set
the local time and the weather, step the simulation without drawing, and place a free camera
(`photo`) for pictures.

## The bar

| Area | Bar | State |
| --- | --- | --- |
| Frame rate | 60 fps on a mid-range laptop at "high"; 30 fps on a recent iPhone at "low" | **Not measured on a real GPU.** Software rendering gives 0.4–12 fps, which says nothing. Dynamic resolution (55 fps target) and four quality presets are in place. Needs a number from the owner's phone and a laptop |
| Scene cost | Per frame (`tests/perf.mjs`). "low": 180 draw calls, 340k triangles in the picture, 230k in the shadow passes. "medium": 240 / 480k / 300k. "high": 290 / 600k / 400k. These budgets are estimates, not derived from hardware: they exist to catch regressions until a real frame rate is known | Measured (counts, valid on any machine). low: 143–154 calls, 146–257k picture, 46–215k shadow. medium: 169–171, 161–329k, 67–222k. high: 228–264, 345–383k, 191–353k. Sealed inside the Hab: 27–40 calls, 122k. The worst case is standing at the base, where the Hab, rover and astronaut are drawn into both shadow cascades |
| Load | Title screen interactive in under 5 s on a 20 Mbit connection; total download under 14 MB; works offline after first load | 11.8 MB precached (41 files). Headless load to title: 1.2–5.5 s from localhost. Not measured on a phone network |
| Console | Zero errors or warnings in a full playthrough | Zero errors in smoke, arc, save, perf and screenshot runs |
| Story arc | Every step from the crash to the rescue works | 20/20 scripted checks (`tests/arc.mjs`) |
| Saves | Old saves load or the player is told plainly why not | Version-2 saves migrate (tested); unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | Second pass done (new ground, rocks, shadows). Independent review owed |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | Tuned: exposure meters against the sun, the glow shrinks at the horizon. Independent review owed |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | Tuned: dark cool ground, lamp pools, porch lights. Independent review owed |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | Full storm closes visibility to tens of metres; dust motes in the air. Streaming dust sheets not yet done |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | Ice is now found by colour in the orbital map; to re-check in the matrix |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | Globe correct; limb haze too thick; title framing with the interface redesign |
| Models | Every object is a purpose-built model; nothing reads as a primitive | Done: 31 models (astronaut, rover, MAV, Hermes, Hab family, 11 historic landers, 12 field props). The first version's triangle data is deleted |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Twelve clips blended; not yet reviewed in motion |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | Objectives tracker exists; onboarding not yet designed |
| Interface | Every screen is legible and unclipped at 1280x720 through 2560x1440 and at phone sizes under the notch and status bar; touch has a pause button | Being rebuilt (branch `ui-redesign`) |
| Sound | Wind, suit, footsteps, rover, Hab, actions, events, and an adaptive score; nothing clips | Being rebuilt (branch `audio-rebuild`) |
| Feel | Walking, jumping and driving have weight; the camera never clips through walls or ground | New controllers in. The camera now treats the Hab, its airlock and greenhouse domes as rooms from inside and as obstacles from outside. Not yet reviewed in motion |

## Open items

| # | Item | State |
| --- | --- | --- |
| 1 | Merge the interface redesign (branch `ui-redesign`) | in progress |
| 2 | Merge the audio rebuild (branch `audio-rebuild`) | in progress |
| 3 | Reviewer pass on the screenshot matrix against this bar; act on findings | open |
| 4 | Storm: sheets of dust streaming past; sound | open |
| 5 | Sky from orbit: thinner limb haze; Phobos and Deimos | open |
| 6 | Ground: wind ripples and drifts; more variety between regions (dark basalt plains, bright dust) | open |
| 7 | Title screen composition; loading screen | with the interface redesign |
| 8 | Onboarding for the first ten minutes | open |
| 9 | Interaction targets for the new Hab layout (fabricator bench moved; extra furniture colliders) | to verify in game |
| 10 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | blocked on hardware |
| 11 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 12 | Publish to `gh-pages` once items 1–3 are done and the tests pass | open |
| 13 | Shadow cost at the base: the rover (45k triangles) and Hab are drawn into both cascades | open (a simplified shadow model would halve it) |
| 14 | Asset tooling: fold the helpers the model scripts each copied into `tools/assets/lib.py`; add front-face-only and part controls to `preview.mjs` | open |

## Decisions worth knowing

- **Terrain is real.** Elevation is NASA MOLA (MEGDR, 32 px/deg source) resampled to six
  1024-texel cube faces; colour is the Viking MDIM 2.1 mosaic. Relief is exaggerated 4x (it was
  6x on the old analytic terrain) so volcanoes and canyons read at walking scale without turning
  every crater into a pit. Below about 40 m the surface is procedural (craters, fractal relief,
  dunes), scaled by how rough the real surface is there.
- **What you stand on is what is drawn.** Physics and the terrain workers call the same height
  function; building sites are levelled in that function, not by moving meshes.
- **Ground detail is a 3D texture.** Two tiling 64-texel volumes (sand relief, grit) are cut by
  the surface, so detail is the same size on a plain, a canyon wall and a boulder. A 2D texture
  projected along the planet's axes smeared wherever the ground did not face an axis. The
  lookup frame is turned away from the planet's axes so level ground never lies along one.
- **Rocks take their colour from the ground.** Bare stone is a darker, greyer version of the
  local orbital colour and the dust on top is that colour itself, so rocks belong wherever
  they are.
- **Two shadow cascades.** three.js's `SunLight` with a split set by hand (10–18 m): a tight map
  around the camera so the astronaut's shadow is a figure, a wide one for the base.
- **Exposure is metered.** It opens up as the sun sinks, closes when the camera looks into a low
  sun, and eases over about a second like an eye.
- **The sol turns at dawn at the colony.** Local clocks elsewhere on the planet differ, as they
  should.
- **Mars gravity is real** (3.72 m/s2). Walk and run are loping gaits made for 5.1 and 9.2 m/s.
- **The rover reaches its listed top speed.** In the first version it could not, so the
  drivetrain upgrades did nothing.
- **A greenhouse is a place.** It levels its site, has walls and a doorway, and is set down
  facing the astronaut; saves keep its bearing.
- **Outputs are committed.** `game.js`, `terrain-worker.js`, `game.css` and `sw.js` are build
  products of `tools/build.mjs`, committed so the game runs from any static host.
