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
node tests/shots.mjs        # screenshot matrix -> tools/tests/.cache/shots/
node serve.mjs              # play at http://127.0.0.1:8765/  (?q=low|medium|high|ultra)
```

The debug hook `window.__MG` (see `src/main.js`) can start a game at any site, teleport,
set the local time and the weather, and step the simulation without drawing.

## The bar

| Area | Bar | State |
| --- | --- | --- |
| Frame rate | 60 fps on a mid-range laptop at "high"; 30 fps on a recent iPhone at "low" | **Not measured on a real GPU.** Software rendering gives 1–12 fps, which says nothing. Dynamic resolution (55 fps target) and four quality presets are in place. Needs a number from the owner's phone and a laptop |
| Scene cost | Per frame, counting the shadow pass. "high": under 250 draw calls and 600k triangles; "low": under 170 calls and 340k triangles (`tests/perf.mjs`) | Measured (counts, valid on any machine). low: 145–157 calls, 265–326k triangles outdoors; 33 calls, 122k sealed inside the Hab. high: 222–227 calls, 491–574k outdoors; 46 calls inside |
| Load | Title screen interactive in under 5 s on a 20 Mbit connection; total download under 12 MB; works offline after first load | 9.6 MB precached with the models built so far. Headless load to title: 1.2–5.5 s from localhost. Not measured on a phone network |
| Console | Zero errors or warnings in a full playthrough | Zero errors in smoke, arc and save tests |
| Story arc | Every step from the crash to the rescue works | 20/20 scripted checks (`tests/arc.mjs`) |
| Saves | Old saves load or the player is told plainly why not | Version-2 saves migrate (tested); unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | First tuning pass done; independent review owed |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | Sky model has it; not yet tuned or reviewed |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | Lamps exist; not yet tuned or reviewed |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | Fog and sky respond; no dust particles yet |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | Not yet checked |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | Globe correct; limb haze too thick; title framing not designed |
| Models | Every object is a purpose-built model; nothing reads as a primitive | Astronaut, rover, MAV, Hermes, Hab, farm tray, solar panel, dish done. Landers and field equipment in progress (placeholders until then) |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Twelve clips blended; not yet reviewed in motion |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | Objectives tracker exists; onboarding not yet designed |
| Interface | Every screen is legible and unclipped at 1280x720 through 2560x1440 and at phone sizes under the notch and status bar; touch has a pause button | Being rebuilt (interface redesign in progress) |
| Sound | Wind, suit, footsteps, rover, Hab, actions, events, and an adaptive score; nothing clips | Being rebuilt (audio in progress) |
| Feel | Walking, jumping and driving have weight; the camera never clips through walls or ground | New controllers in; not yet reviewed in motion |

## Open items

| # | Item | State |
| --- | --- | --- |
| 1 | Merge the interface redesign (branch `ui-redesign`) | in progress |
| 2 | Merge the audio rebuild (branch `audio-rebuild`) | in progress |
| 3 | Lander models (11) and field equipment (12) from `tools/assets/landers.py`, `props.py`; then delete `src/world/legacy-models.js` | in progress |
| 4 | Dust: ambient motes, storm streamers, footstep puffs, wheel plumes, launch exhaust | open |
| 5 | Sky: thinner limb haze from orbit; tune dawn, dusk and night; Phobos and Deimos | open |
| 6 | Terrain: sharper near detail, rock geometry less regular, macro normal map for far terrain | open |
| 7 | Count draw calls and triangles per frame in `__MG.info()`; add a perf test with budgets | done (`tests/perf.mjs`, `tests/breakdown.mjs`) |
| 16 | The astronaut is ten skinned draw calls (one per material); fold into one like the static models | open |
| 8 | Reviewer pass on the screenshot matrix against this bar; act on findings | open |
| 9 | Title screen composition; loading screen | with the interface redesign |
| 10 | Onboarding for the first ten minutes | open |
| 11 | Rover: dust plumes, tyre tracks; astronaut: footprints | open |
| 12 | Interaction targets for the new Hab layout (fabricator bench moved; extra furniture colliders) | to verify in game |
| 13 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | blocked on hardware |
| 14 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 15 | Publish to `gh-pages` once items 1–3 and 8 are done and the tests pass | open |

## Decisions worth knowing

- **Terrain is real.** Elevation is NASA MOLA (MEGDR, 32 px/deg source) resampled to six
  1024-texel cube faces; colour is the Viking MDIM 2.1 mosaic. Relief is exaggerated 4x (it was
  6x on the old analytic terrain) so volcanoes and canyons read at walking scale without turning
  every crater into a pit. Below about 40 m the surface is procedural (craters, fractal relief,
  dunes), scaled by how rough the real surface is there.
- **What you stand on is what is drawn.** Physics and the terrain workers call the same height
  function; building sites are levelled in that function, not by moving meshes.
- **The sol turns at dawn at the colony.** Local clocks elsewhere on the planet differ, as they
  should.
- **Mars gravity is real** (3.72 m/s2). Walk and run are loping gaits made for 5.1 and 9.2 m/s.
- **The rover reaches its listed top speed.** In the first version it could not, so the
  drivetrain upgrades did nothing.
- **Outputs are committed.** `game.js`, `terrain-worker.js`, `game.css` and `sw.js` are build
  products of `tools/build.mjs`, committed so the game runs from any static host.
