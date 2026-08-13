# STRANDED II — A Martian Survival Game

A browser-based, full-planet 3D survival game inspired by *The Martian*. You are
stranded **somewhere random on a spherical, geographically real Mars** — Olympus
Mons, Valles Marineris, Hellas, both ice caps, and all fourteen real landers are
out there at their true coordinates. Survive, farm, salvage, phone home, and
drive to Schiaparelli crater to fly out.

## Play it

- **Via Flask**: run the app and open `/martian` — no login required.
- **Standalone**: serve this directory statically (`python3 -m http.server`)
  and open `index.html`. No CDN, no network, everything is procedural.

## The planet

- A real sphere (1:282 scale) you can circumnavigate — 75 km around. Day and
  night depend on where you stand; the poles get twilight, local time is real.
- Terrain is an analytic model of actual Mars topography: the crustal dichotomy,
  the Tharsis rise and its volcanoes, the Valles Marineris chasma chain
  (Noctis, Ius, Melas, Coprates, Eos, Capri), Hellas/Argyre/Isidis/Utopia,
  Gale with Mount Sharp, both polar caps, and more — all at real coordinates.
- Every soft-landed Mars probe is placed where history left it, from Mars 3
  (1971) to Zhurong (2021), each salvageable and each with a journal entry.
- Pathfinder really is in Ares Vallis. The Ares 4 MAV really is at Schiaparelli.
  Your crash site is random — the expedition lengths are whatever fate deals.

## The game

- **Survival**: six bars (suit O2, hab O2, water, food, power, vitals), potato
  farming, hydrazine water-making, solar panels vs. dust, roaming planetary
  dust storms, a Hab breach event, day/night temperature swings.
- **Exploration**: drivable rover with its own power and O2 tank; discovery
  journal for landmarks and landers; achievements; a full orbital-survey map
  (`M`) drawn from the same terrain model.
- **Crafting** (`C`): scrap + circuits from salvage build O2 candles, portable
  solar panels, greenhouse domes (farm anywhere), nav beacons, O2 caches, and
  nine permanent upgrades (rover drivetrains, suit tanks, CO2 recycler, ice
  drill, the RTG...). Some need blueprints from NASA survey quests.
- **Quests** (`J`): after you connect Pathfinder, NASA radios survey tasks that
  pull you across the planet — Viking, Spirit, Opportunity, InSight, Phoenix,
  Mars 3 — each paying out supply pods and blueprints.
- **Structure**: dawn auto-checkpoints, auto-save (continue any time), three
  difficulties — BOTANIST (Sol 20 rescue, gentle), ENGINEER (Sol 45, intended),
  SPACE PIRATE (Sol 60, death deletes the save).

## Controls

| Key | Action |
| --- | ------ |
| `W A S D` | Move / drive |
| Mouse | Look (pointer lock, or hold-drag fallback) |
| `Shift` | Sprint |
| `Space` | Jump (Mars gravity) |
| `E` (hold) | Interact — one verb for everything |
| `X` | Crack an O2 candle |
| `F` | Exit rover |
| `M` / `C` / `J` | Map · Colony & crafting · Journal |
| `Esc` | Pause (auto-saves) |

## Tech

- Single `game.js` (~3,800 lines) + vendored three.js r147. No other deps.
- Spherical engine: quaternion body frames (no pole singularities),
  camera-relative rendering (no float32 jitter at planet scale), a seam-free
  displaced globe mesh plus a double-buffered high-detail terrain patch that
  follows you, deterministic world-stable rock fields, analytic-height physics.
- All assets procedural: geometry, canvas textures, WebAudio synthesis
  (including the disco).
