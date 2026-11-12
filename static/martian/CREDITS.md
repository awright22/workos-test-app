# Stranded II — credits

Third-party work the game ships or is built from. The same list is shown in the game under
Title → Credits.

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

## Mars data

Built into `assets/mars/` by `tools/build_mars_data.py`.

- **Elevation** — Mars Orbiter Laser Altimeter (MOLA) Mission Experiment Gridded Data Record,
  Mars Global Surveyor. NASA / JPL / Goddard Space Flight Center, from the PDS Geosciences Node.
  Public domain.
- **Colour** — Viking MDIM 2.1 colourised global mosaic. NASA / JPL / USGS, from NASA Mars Trek.
  Public domain.
- **Landers and place names** — published landing coordinates of the fourteen missions, and
  IAU feature names.

## Code

- **three.js** — MIT licence. <https://threejs.org>

## The story

An unofficial fan project inspired by *The Martian* by Andy Weir. Not affiliated with or
endorsed by the author, the publisher or the film's makers.
