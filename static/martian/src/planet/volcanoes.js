// The shield volcanoes, kept in one place. The map and the place names use them (planet/features.js),
// the height model lays lava flows on their flanks (planet/height.js, which also runs in the terrain
// workers, so there is no three.js here), and the ground shader colours those flows.
import { R, MARS_KM, D2R } from './constants.js';

/** lat, lonE in degrees; r = footprint radius km; h = relief km; cal = caldera radius as a share of r. */
export const VOLCANOES = [
  { name: 'Olympus Mons', lat: 18.65, lon: 226.2, r: 310, h: 21.9, type: 'volcano', cal: 0.09,
    note: 'Tallest volcano in the solar system. The slopes are so gentle you could not see the summit from the base — the planet curves away first.' },
  { name: 'Ascraeus Mons', lat: 11.92, lon: 255.92, r: 220, h: 14.9, type: 'volcano', cal: 0.1,
    note: 'Northernmost of the Tharsis Montes. Its name means "rustic" — for a mountain twice the height of Everest.' },
  { name: 'Pavonis Mons', lat: 1.48, lon: 247.04, r: 190, h: 8.4, type: 'volcano', cal: 0.12,
    note: 'Sits almost exactly on the equator. A space elevator dream site, if Mars ever files the permits.' },
  { name: 'Arsia Mons', lat: -8.35, lon: 239.91, r: 220, h: 11.7, type: 'volcano', cal: 0.16,
    note: 'Has a caldera you could drop a small country into, and cave skylights along its flanks.' },
  { name: 'Alba Mons', lat: 40.5, lon: 250.4, r: 600, h: 6.8, type: 'volcano', cal: 0.07,
    note: 'The biggest volcano by area anywhere — a pancake 1000+ km across that you could drive over without noticing the summit.' },
  { name: 'Elysium Mons', lat: 25.02, lon: 147.21, r: 210, h: 14.1, type: 'volcano', cal: 0.09,
    note: 'The lonely giant of the eastern hemisphere, far from the Tharsis crowd.' },
  { name: 'Hecates Tholus', lat: 32.12, lon: 150.24, r: 90, h: 4.8, type: 'volcano', cal: 0.12,
    note: 'Small by Mars standards. Merely enormous by Earth standards.' },
];

/**
 * One lava field per volcano, for the height model and the shader: the summit's unit direction
 * (x, y, z), unit east (ex, ez; it has no y part) and north (nx, ny, nz) there, the reach in
 * world metres and its cosine as an angle at the planet's centre.
 */
export const LAVA_FIELDS = VOLCANOES.map((v) => {
  const p = v.lat * D2R, l = v.lon * D2R;
  const x = Math.cos(p) * Math.cos(l), y = Math.sin(p), z = -Math.cos(p) * Math.sin(l);
  const el = Math.hypot(z, x), ex = -z / el, ez = x / el;
  const ang = v.r / MARS_KM;
  return { x, y, z, ex, ez, nx: y * ez, ny: z * ex - x * ez, nz: -y * ex, reach: ang * R, cos: Math.cos(ang) };
});
