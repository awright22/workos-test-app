# STRANDED II — a Martian survival game

A 3D survival game for the browser, inspired by *The Martian*. You are stranded **somewhere
random on a real, spherical Mars** and survive the way the film's astronaut does: seal the Hab,
grow potatoes, make water, drive out to Pathfinder to talk to Earth, then make the long drive
to the ascent vehicle in Schiaparelli crater and fly out.

It runs on a desktop and on a phone, installs as an app (PWA) and plays offline once loaded.

## Play it

- **Published build**: the `gh-pages` branch (GitHub Pages).
- **From Flask**: run the app and open `/martian`. No login is needed.
- **As static files**: serve this directory (`node tools/serve.mjs`, or any static server) and
  open `index.html`. Add `?q=low`, `medium`, `high` or `ultra` to pick a quality preset.

## The planet

- **Real elevation.** The ground is NASA's MOLA laser altimetry of Mars; its colour is the
  Viking orbiter mosaic. Olympus Mons, Valles Marineris, Hellas, Gale and both ice caps are
  where they really are. See `CREDITS.md`. Below about 40 m the ground is generated to suit the
  place: craters, ripple fields, frost polygons toward the poles; on steep ground, spurs and
  gullies running down the fall line with ledges of layered rock cropping out across them (the
  walls of Valles Marineris), scree in the gullies and on the gentler slopes, and at a wall's
  foot the blocks that have fallen from it, some bigger than a man; on the seven shield volcanoes, tongues of dark lava with rubble at
  their edges and leveed channels, and at five summits the caldera itself: a level floor of
  frozen lava inside a cliff, where the elevation data has it.
- **Dust hangs low.** The haze thickens toward low ground and thins with height: thick looking
  down into a canyon, clear from the top of Olympus.
- **A whole sphere**, 75 km around at this scale (1:282), with relief exaggerated four times so
  that volcanoes and canyons read at walking pace. You can walk or drive all the way round.
  Day and night depend on where you stand. At night Phobos crosses the sky twice a sol, west to
  east, and goes dark when it passes into Mars's shadow; Deimos drifts the other way for days.
- **Fourteen historic landing sites**, from Mars 3 (1971) to Zhurong (2021), each with a model
  of the machine that landed there, each salvageable, each with a journal entry.
- **What you stand on is what is drawn**: feet, wheels and everything placed rest on the very triangles
  of the terrain mesh, so nothing hovers or sinks whatever the graphics setting.
- Pathfinder is in Ares Vallis. The ascent vehicle is in Schiaparelli. Your own crash site is
  random, so the length of both expeditions is whatever you are dealt.

## The game

- **The opening**: a new game begins with a film of twenty-four seconds (`src/game/opening.js`):
  the evacuation in the storm at dusk, the dish that takes him, the crew's lamps searching in the
  wrong place, and the rocket leaving without him; then a card, THE NEXT MORNING, and the game
  comes up on him lying where he fell, from where he gets to his feet with a hole in his suit.
  What the crew say is set at the foot of the picture and kept in the journal's log. Skip (or
  Escape, Enter, Space) leaves it at any moment; a continued game does not play it; `?nofilm`
  in the URL starts a new game without it.
- **Survival**: suit oxygen, Hab oxygen, water, food, power and health; burning hydrazine for
  water; solar panels that gather dust; roaming dust storms; a Hab breach; the cold of the
  night. A sol lasts eight minutes.
- **The farm**: potatoes are the staple, and the botany kit holds seed packets for radishes,
  lettuce, soybeans and tomatoes, each with its own pace, thirst and yield. A bed of soil asks
  what to plant. Harvests go to the pantry: a side at breakfast, or a cooked dinner at the food
  shelf (a staple and two different vegetables).
- **Morale**: a man alone on a planet runs on more than calories. It sinks a little each sol
  and with every bad day, and rises with variety on the plate, a hot dinner, mail, music, a
  harvest, a discovery. In good spirits he works and mends faster; worn down, slower.
- **Home**: nine comforts to make for the Hab from scrap and from what the mission turns up
  (string lights, a reading chair, crew photos, a specimen shelf, a rug cut from a parachute,
  Greg the rock). Each appears in the Hab and lifts morale a little every dawn.
- **Photo mode** (`P`, or the pause menu): the clock stops and the camera comes free. Orbit,
  slide, change the lens and the exposure, pick a look, and save a full-resolution PNG.
- **Upkeep**: the oxygenator, the water reclaimer, the rover and the suit's scrubber wear and
  need servicing. Done in time it costs nothing; left to fail it costs parts.
- **Field science**: chip samples off boulders and bag soil wherever you dig. What a sample
  turns out to be depends on where on the real Mars it came from (hematite spherules at
  Meridiani, sulfates in Valles Marineris, clays at Jezero: seventeen materials). The analyser
  in the Hab catalogues them; science credit earns NASA grants.
- **Sights**: eleven things worth stopping to watch, from Phobos going out in the planet's shadow
  to the blue sunset and the Earth in the evening sky. Look for a couple of seconds and it is
  logged: a line in the journal, a little science, better spirits. The journal hints at the rest.
- **Weather**: dust storms that close visibility to tens of metres, and dust devils that wander
  the plains on warm afternoons and sometimes sweep the solar array clean.
- **Exploration**: a six-wheeled rover with its own power and air; a journal of landmarks,
  landers and catalogued samples; achievements; an orbital map drawn from the same data as the
  ground. He wears his helmet outside and takes it off wherever there is air.
- **The driver's seat**: the rover can be driven from inside its cab. The picture is taken from
  his eyes: the wheel is in his hands and turns with the steering, the display behind it shows
  the real speed, heading, power and air and how far the task in hand is, and Mars goes by in the glass. Drag to look round the
  cab; under way the look comes back to the road. Which view the rover is driven from is remembered.
- **Making things**: scrap and circuits from salvage become oxygen candles, a folding solar
  array, a greenhouse dome you can farm in anywhere, navigation beacons, oxygen caches and ten
  permanent upgrades. Some need blueprints that NASA sends for survey work.
- **Quests**: once Pathfinder is connected, NASA radios survey tasks that take you across the
  planet and pays in supply drops and blueprints.
- **Structure**: a checkpoint every dawn, automatic saving, three difficulties (rescue on
  Sol 15, 25 or 35).

## The second game: a base

A second way to play, with no rescue: the same storm and the same Hab, but the next ship is four
years out, so the long game is a base that can keep one man alive for good. New Game asks which of
the two games ("Get home" or "Stay"). A base keeps a save of its own beside the story's, and the
title offers "Continue the base". `QUALITY.md` ("Base mode") has its plan, its reviews and its bar.

- **Minerals**: basalt off any boulder, and five minerals quarried at deposits that stand where
  each was really found: hematite on Meridiani, silica in Gusev crater, clay at Mawrth Vallis,
  sulfates in Valles Marineris, salt on the northern plains (47 deposits; `src/game/base.js`).
  The map shows where each was seen from orbit.
- **Works**: a kiln, a smelter and a glassworks, built outside the Hab and given jobs at a sheet
  of their own: brick, cement, iron and glass, made by the batch on the Hab's power while he does
  something else. A works at work burns, smokes from its flue and can be heard.
- **Buildings**, of what the works make: a solar field, a battery bank, a water tank, a farm dome,
  living quarters, a landing pad (a supply drop every ten sols: the only source of circuit boards
  that does not run out) and a comms tower (every deposit goes on the map).
- **Building**: a thing is chosen on the Colony screen's Base tab and set down outside; a ring on
  the ground shows where it will stand, green where it can and red where it cannot, and its card
  lets it be un-chosen. The task card leads through a base in the order it is built.
- **Achievements** of its own, in place of the story's "Leave Mars".
- `tools/tests/base.mjs` tests it; `tools/tests/base-walk.mjs` plays it from New Game to its first
  supply drop as numbered phone screenshots, and `tools/tests/base-shots.mjs` photographs each
  deposit, works and building, for review.

## Controls

| Key | Action |
| --- | ------ |
| `W A S D` | Move / drive |
| Mouse | Look |
| `Shift` | Run |
| `Space` | Jump (Mars gravity) |
| `E` (hold) | Interact: one verb for everything |
| `X` | Crack an oxygen candle |
| `F` | Leave the rover |
| `V` | On foot: helmet view / suit view. In the rover: the driver's seat / the camera behind it |
| `M` / `C` / `J` | Map · Colony and crafting · Journal |
| `P` | Photo mode: free camera, lens, looks, saves a PNG |
| `Esc` | Pause (saves): settings, controls, save and quit, restart |
| `F3` | Diagnostics (frame rate, GPU, errors) |

On a phone (landscape): the left thumb moves, dragging anywhere else looks, and the big button
on the right is the one verb: it shows what it will do and fills as you hold it. Colony, map,
journal and pause are four buttons top right. Photo mode is in the pause menu.

A phone's HUD is the quiet one. When nothing is wrong it shows the suit's dial with the sol and
the hour, the compass, the four buttons, one line of task (what to do next and how far), and the
stick. A gauge shows itself when it is low, falling fast or has just changed; a tap on the dial
shows them all, with the rescue sol and the temperature, for a few seconds, and a second tap
opens the guide to them. A tap on the task line opens the task (where, why, what comes after)
and it closes itself. Run and jump are there while the stick is held, the oxygen candle when the
tank is under half, and on foot the view (helmet or behind) is a switch in Settings, Controls.
Driving, **VIEW** stands above EXIT: it puts the picture in the driver's seat, and back behind the
rover. From the seat the speed is read off the rover's own display, and the HUD's speed plate
stands down unless a reserve is low. Getting
into the rover shows its battery and tank for a few seconds. Alarms take the room they always did. **Settings, Interface, Full HUD** brings back everything, always on.
Four quick taps in the top-left corner open the diagnostics.

**Settings, Display, Frame rate**: 60 is smoothest; 30 draws a sharper picture (the frames between
are not drawn and the resolution rises to what the longer frame leaves time for, up to two pixels
to the point). 40 is offered where the screen gives a page 100 frames a second or more. The
diagnostics say what rate the picture is held to, what the screen gives, and the resolution drawn.

The ground round the Hab remembers where he has walked and driven: a path wears in after a dozen
crossings and stays in the save; a dust storm slowly fills it in. His own gear gets dustier as the
sols go by, and after a storm.

## Interface

The interface lives in `src/ui/` and is built into `game.css` and `game.js` by `tools/build.mjs`.

- `dom.js` builds the HUD, touch controls, screen frames and dialog layer, and exports the
  widgets the game calls (`log`, `toast`, `setPrompt`, `showOverlay`, `flashScreen`).
- `hud.js` updates the HUD each frame; `menus.js` holds the title, pause, settings, controls,
  credits, sleep and uplink dialogs; `screens.js` and `map.js` hold the map, colony and journal.
- `layout.js` sets one scale for everything (all sizes are in rem), switches phones to the
  compact arrangement, and reads the safe-area insets. `settings.js` keeps the player's
  settings in `localStorage` (`stranded2-settings`, and `stranded2-quality` for graphics).
- `?safe=top,right,bottom,left` in the URL simulates a phone's notch and home indicator.
- `node tools/tests/ui.mjs` checks the interface (keyboard, settings, touch, and that nothing
  overlaps or leaves the safe area at seven window sizes). `node tools/tests/ui-shots.mjs`
  saves a screenshot of every state at every size to `tools/tests/.cache/ui/`.
- `node tools/tests/hud-cover.mjs` measures how much of a phone's screen the quiet HUD covers
  (standing, walking, at the rover, driving from behind it and from its seat) at three phone sizes and holds it to its bar: 15% of
  the screen, the middle clear, 35% of the top third. `--shoot` photographs each state.
  `tools/tests/ui-audit.mjs` runs it as its last part. With several things wrong at once the
  quiet HUD lets one lead (what kills in minutes first): its banner, the gauge it bears on and
  the one task; the rest wait beside it as marks. A banner leads with what to do (RUN TO THE
  HAB) and says what is wrong under it; beside it the task card is one line, the place and how
  far, and RUN stays on the screen while the tank is what is wrong.
- `node tools/tests/card-open.mjs` plays six stretches on a phone (standing, walking, driving,
  nightfall, the air running low) and measures how long the task card stands open: nine seconds
  for a new task on foot, four and a half at the wheel, never beside a banner that has said what
  to do. It is part of the suite.
- `node tools/tests/opening.mjs` plays the opening film from the title on a phone and checks it:
  the HUD away, the lines and Skip at sizes a thumb and an eye can use and clear of the notch,
  nothing saved from inside it, the card on the black, and that what it leaves is the game as it
  begins without it (the hour, the weather, the suit, the place, nothing left in the scene), with
  him on the ground and then on his feet. Skip and Escape end it at once. Every other test starts
  its games without the film. `node tools/tests/film.mjs --opening [--hud] [--at 2.6,10.0,...]`
  photographs moments of it. It is part of the suite.
- `node tools/tests/motion.mjs` walks and drives eleven real routes with the stick held and
  flags what a still cannot show: no progress, a jump of the man or the camera, the man or the
  rover in the ground or over it, the camera in a rock, the rover hidden from the camera by the
  ground or left far behind, slow steps. It also turns the camera once round him beside the rover.
  `--strips` photographs each route and each thing he does as a sheet of frames for reviewers.
- `node tools/tests/sharp-shots.mjs` photographs three views at five resolutions side by side
  (what a phone shows at 60 and what 30 leaves room for).
- `node tools/tests/night-shots.mjs` photographs getting about after dark (on foot, on a slope,
  in the rover at rest and at speed) and a plain's horizon at dusk, in twilight and by day. The
  game has two lamps that can be aimed, his helmet's and the rover's, and whoever is travelling
  has both: a pool and a throw on foot, wide lamps and a long beam driving (`game/player.js`).
- `node tools/tests/cockpit-shots.mjs` photographs the rover from the driver's seat: parked and
  at speed by day, the head turned each way, down at the dashboard, toward a low sun, in a storm
  and at night. `--hud` leaves the interface on, `--size=667|844|932` picks the phone, `--strips`
  takes the changes of view frame by frame. The cab is the part `cabin` of the rover's model
  (`tools/assets/vehicles.py`): the game keeps it clean of dust, gives it six tenths of the sky's light and
  a low lamp of its own after dark (a term in the shader, `uCabin`, not another light), and in a
  storm masks the veil off it (`render/engine.js`, `cabMask`). The yoke is where the astronaut's
  Drive clip holds it (`tools/assets/astronaut.py`, `YOKE_C`): if either moves, both must.
- Third-party fonts and data are credited in `CREDITS.md`. App icons: `tools/build_icons.py`.

## How it is built

```
static/martian/
  index.html, manifest.webmanifest, icons         the page and the app manifest
  game.js, terrain-worker.js, game.css, sw.js     build products (committed; do not edit)
  assets/mars/     height.bin (MOLA), color.jpg (Viking), map.jpg
  assets/models/   37 .glb models
  src/             the source: ES modules
    core/      maths, events, shared scratch vectors
    planet/    the height model (shared by physics and the terrain workers), geography
    terrain/   quadtree level-of-detail chunks built in web workers
    render/    renderer, sky, ground material, 3D detail textures, shadows, effects
    world/     models, the Hab and everything placed on the planet, rocks
    game/      state, player, rover, simulation, story, interactions, saves, the launch (launch.js)
    ui/, audio/
  QUALITY.md   the bar the game is held to, what has been measured, what is open
  CREDITS.md   data and software credits
tools/
  build.mjs          bundle src/ (esbuild) and write the service worker
  serve.mjs          static server for development
  lint.mjs           undefined names and bad imports
  tests/             smoke, interface, story arc, saves, science, machines, farm, audio, scene cost, screenshots,
                     and film.mjs: the launch photographed shot by shot
  publish.mjs        build, check and publish to gh-pages
  build_mars_data.py NASA data -> assets/mars/
  assets/            the models, authored in Blender from Python (see assets/SPEC.md); occlusion is baked
                     into their vertices, and the Hab's own lamps into its interior (lib.py, bake_light)
  build_contact.mjs  bakes, for each model that stands out of doors, how much of the sky it hides from the
                     ground under it (assets/models/contact.png): the soft dark patch a prop sits in
```

Rendering is three.js r187 (WebGL 2): HDR with a single final tone-mapping pass, a Mars sky
model, a reflection environment captured from that sky, two cascaded sun shadow maps, bloom
and dynamic resolution, and fog that knows how high the camera and the thing seen are. The terrain is a cube-sphere quadtree whose chunks are built in workers
from the same height function the physics uses, so what you stand on is what is drawn.

To work on it: `cd tools && npm ci`, then `node build.mjs --watch` and `node serve.mjs`.
`node tests/run.mjs` must stay green; `QUALITY.md` says how the rest is judged.
