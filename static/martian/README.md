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
  where they really are. See `CREDITS.md`.
- **A whole sphere**, 75 km around at this scale (1:282), with relief exaggerated four times so
  that volcanoes and canyons read at walking pace. You can walk or drive all the way round.
  Day and night depend on where you stand.
- **Fourteen historic landing sites**, from Mars 3 (1971) to Zhurong (2021), each with a model
  of the machine that landed there, each salvageable, each with a journal entry.
- Pathfinder is in Ares Vallis. The ascent vehicle is in Schiaparelli. Your own crash site is
  random, so the length of both expeditions is whatever you are dealt.

## The game

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
- **Weather**: dust storms that close visibility to tens of metres, and dust devils that wander
  the plains on warm afternoons and sometimes sweep the solar array clean.
- **Exploration**: a six-wheeled rover with its own power and air; a journal of landmarks,
  landers and catalogued samples; achievements; an orbital map drawn from the same data as the
  ground. He wears his helmet outside and takes it off wherever there is air.
- **Making things**: scrap and circuits from salvage become oxygen candles, a folding solar
  array, a greenhouse dome you can farm in anywhere, navigation beacons, oxygen caches and ten
  permanent upgrades. Some need blueprints that NASA sends for survey work.
- **Quests**: once Pathfinder is connected, NASA radios survey tasks that take you across the
  planet and pays in supply drops and blueprints.
- **Structure**: a checkpoint every dawn, automatic saving, three difficulties (rescue on
  Sol 15, 25 or 35).

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
| `V` | Helmet view / suit view |
| `M` / `C` / `J` | Map · Colony and crafting · Journal |
| `P` | Photo mode: free camera, lens, looks, saves a PNG |
| `Esc` | Pause (saves): settings, controls, save and quit, restart |
| `F3` | Diagnostics (frame rate, GPU, errors) |

On a phone (landscape): the left thumb moves, dragging anywhere else looks, and the big button
on the right is the one verb: it shows what it will do and fills as you hold it. Run, jump,
camera and the oxygen candle sit around it; pause, map, colony and journal are top right.
Photo mode is in the pause menu.
Four quick taps in the top-left corner open the diagnostics.

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
    game/      state, player, rover, simulation, story, interactions, saves
    ui/, audio/
  QUALITY.md   the bar the game is held to, what has been measured, what is open
  CREDITS.md   data and software credits
tools/
  build.mjs          bundle src/ (esbuild) and write the service worker
  serve.mjs          static server for development
  lint.mjs           undefined names and bad imports
  tests/             smoke, interface, story arc, saves, science, machines, farm, audio, scene cost, screenshots
  publish.mjs        build, check and publish to gh-pages
  build_mars_data.py NASA data -> assets/mars/
  assets/            the models, authored in Blender from Python (see assets/SPEC.md)
```

Rendering is three.js r187 (WebGL 2): HDR with a single final tone-mapping pass, a Mars sky
model, a reflection environment captured from that sky, two cascaded sun shadow maps, bloom
and dynamic resolution. The terrain is a cube-sphere quadtree whose chunks are built in workers
from the same height function the physics uses, so what you stand on is what is drawn.

To work on it: `cd tools && npm ci`, then `node build.mjs --watch` and `node serve.mjs`.
`node tests/run.mjs` must stay green; `QUALITY.md` says how the rest is judged.
