# Credits

Third-party work the game ships or is built from. A shorter list is shown in the game under
Title → Credits.

## Data

- **Mars elevation** — Mars Orbiter Laser Altimeter (MOLA) Mission Experiment Gridded Data
  Record, 32 pixels per degree (`megt90n000fb.img`). NASA / JPL / Goddard Space Flight Center,
  MOLA Science Team; distributed by the NASA Planetary Data System Geosciences Node. Public
  domain. Resampled and compressed by `tools/build_mars_data.py` into `assets/mars/height.bin`.
- **Mars colour** — Viking Mars Digital Image Mosaic 2.1 colourised global mosaic. NASA / JPL /
  USGS Astrogeology Science Center; tiles from NASA Mars Trek. Public domain. Reprojected into
  `assets/mars/color.jpg` and, with MOLA shaded relief, `assets/mars/map.jpg`.

- **Where the minerals lie** (Base mode) — no data files, but each kind of deposit is placed where
  it was really found, after these published detections: grey hematite at Meridiani Planum, Aram
  Chaos and in Valles Marineris (Christensen and others, 2000 and 2001, Thermal Emission
  Spectrometer on Mars Global Surveyor); opaline silica in Gusev crater (Squyres and others, 2008,
  the rover Spirit), at Nili Patera (Skok and others, 2010) and on the plains beside Valles
  Marineris (Milliken and others, 2008, CRISM on Mars Reconnaissance Orbiter); clays at Mawrth
  Vallis and Nili Fossae (Poulet and others, 2005, OMEGA on Mars Express), at Oxia Planum and in
  Eridania; layered sulfates in Valles Marineris and at Meridiani (Gendrin and others, 2005) and
  gypsum in Olympia Undae (Langevin and others, 2005), both OMEGA; chloride salts in the southern
  highlands (Osterloo and others, 2008, THEMIS on Mars Odyssey) and perchlorate on the northern
  plains (Hecht and others, 2009, the Phoenix lander). Positions are good to a degree or so, and
  the deposits themselves are the game's own.

## Typefaces (interface)

Shipped as `.woff2` files in `assets/fonts/`, Latin subset only, copied at build time from the
`@fontsource/*` packages named in `tools/package.json`.

| Typeface | Weights shipped | Author | Licence |
| --- | --- | --- | --- |
| Barlow Condensed | 500, 600 | Jeremy Tribby | SIL Open Font License 1.1 |
| Barlow | 400, 500, 600 | Jeremy Tribby | SIL Open Font License 1.1 |
| JetBrains Mono | 500 | JetBrains s.r.o. | SIL Open Font License 1.1 |

Barlow: <https://github.com/jpt/barlow> · JetBrains Mono: <https://github.com/JetBrains/JetBrainsMono>

The interface's icons were drawn for this game (`src/ui/icons.js`).

## Software

- [three.js](https://threejs.org) r187 — MIT licence. Bundled into `game.js`.
- [fflate](https://github.com/101arrowz/fflate) — MIT licence. Bundled into `game.js` and
  `terrain-worker.js`.
- [meshoptimizer](https://github.com/zeux/meshoptimizer) decoder and gltfpack — MIT licence.
  Used to compress and load the models.
- [Blender](https://www.blender.org) — GPL. Used as a tool to author the models; no Blender
  code is shipped.

## Models, sound and code

Every model in `assets/models/` is original work authored for this game by the scripts in
`tools/assets/` (no third-party meshes or textures). Sound is synthesised in the browser.

The game is a fan work inspired by *The Martian* (Andy Weir's novel and the 2015 film). It is
not affiliated with or endorsed by the author, the publisher or the film's makers.
