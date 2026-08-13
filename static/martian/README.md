# STRANDED — A Martian Survival Game

A browser-based 3D survival game inspired by *The Martian*. You are stranded on
Mars with a leaking suit, a Hab, ten ration packs, and a botany degree everyone
laughed at. Survive to Sol 12, then fly home.

## Play it

- **Via Flask**: run the app and open `/martian` — no login required.
- **Standalone**: serve this directory statically (`python3 -m http.server`)
  and open `index.html`. Everything is local; no CDN, no network needed.

## How to survive

The movie is the walkthrough:

1. **Cold open** — your suit is punctured. Sprint (`Shift`) to the Hab and seal it.
2. **Take stock** — inspect the oxygenator and water reclaimer, run the numbers
   at the comms desk.
3. **Farm** — dig regolith outside, fill the beds in the Hab, plant seed
   potatoes, keep them watered.
4. **Make water** — burn hydrazine. The first attempt goes... the way it went
   in the movie.
5. **Keep the lights on** — solar panels collect dust (storms make it worse).
   Wipe them or the battery dies, and life support idles with it.
6. **Phone home** — from Sol 4 the charts point to Pathfinder, ~320 m NW. Take
   the rover, dig it out, park it on the painted ring by the Hab, connect it.
7. **Survive** — a dust storm is always forecast one sol ahead. Sol 7 has a
   surprise for your Hab canvas. Duct tape is undefeated.
8. **Launch** — on Sol 12 drive to the MAV, strip the excess weight (nose cone,
   seats, dignity), and punch it.

## Controls

| Key | Action |
| --- | ------ |
| `W A S D` | Move |
| Mouse | Look (pointer lock, or hold-and-drag where pointer lock is unavailable) |
| `Shift` | Sprint |
| `Space` | Jump (Mars gravity) |
| `E` (hold) | Interact — everything is one verb |
| `F` | Exit the rover |
| `Esc` | Pause |

## Systems

Six bars, one rule — none of them reaches zero:

- **SUIT O2** drains on EVA (faster when sprinting), refills instantly in the
  Hab or rover. It is your leash.
- **HAB O2** is made by the oxygenator — while there's power.
- **H2O** — drinking, farming, and the water reclaimer's recycling all pull on
  it. Hydrazine is the pressure valve.
- **FOOD** — rations plus potatoes; one meal is consumed at dawn each sol.
- **PWR** — solar in daylight, scaled by panel dust; life support runs on it.
- **VITALS** — what happens when you neglect the other five.

The game auto-checkpoints at every dawn; dying rewinds to the morning.

## Tech

- Single `game.js` (~2100 lines), no dependencies beyond the vendored
  three.js r147 UMD build (`three.min.js`).
- All assets are procedural: geometry, canvas textures, WebAudio synthesis
  (including the disco).
