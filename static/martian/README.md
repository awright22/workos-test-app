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

- **Survival**: suit oxygen, Hab oxygen, water, food, power and health; potato farming;
  burning hydrazine for water; solar panels that gather dust; roaming dust storms; a Hab
  breach; the cold of the night.
- **Exploration**: a six-wheeled rover with its own power and air; a journal of landmarks and
  landers; achievements; an orbital map drawn from the same data as the ground.
- **Making things**: scrap and circuits from salvage become oxygen candles, a folding solar
  array, a greenhouse dome you can farm in anywhere, navigation beacons, oxygen caches and nine
  permanent upgrades. Some need blueprints that NASA sends for survey work.
- **Quests**: once Pathfinder is connected, NASA radios survey tasks that take you across the
  planet and pays in supply drops and blueprints.
- **Structure**: a checkpoint every dawn, automatic saving, three difficulties.

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
| `Esc` | Pause (saves) |

On a phone: a stick to move, drag to look, and on-screen buttons for everything else.

## How it is built

```
static/martian/
  index.html, manifest.webmanifest, icons         the page and the app manifest
  game.js, terrain-worker.js, game.css, sw.js     build products (committed; do not edit)
  assets/mars/     height.bin (MOLA), color.jpg (Viking), map.jpg
  assets/models/   31 .glb models
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
  tests/             smoke, scripted story arc, save migration, scene cost, screenshots
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
