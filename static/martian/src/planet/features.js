// Named places on Mars: landforms, regions and every lander, at their real coordinates.
// The shape of the land now comes from elevation data; these give names, notes and footprints.
import { llToVec, vecToLl, angDist } from './geo.js';
import { MARS_KM, D2R } from './constants.js';
import { elevationKm3 } from './surface.js';

/*
 * Real Mars features. lat, lonE in degrees; r = footprint radius km; h = relief km (+up/-down).
 * type: volcano | crater | basin | bulge | cap | plain(label) | albedo
 * Coordinates from published planetary data (MOLA-era), good to ~1°.
 */
export const FEATURES = [
  // The Tharsis bulge — continent-sized volcanic rise
  { name: 'Tharsis Rise', lat: 2, lon: 247, r: 2600, h: 5.5, type: 'bulge' },
  // Volcanoes
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
  // Impact basins
  { name: 'Hellas Planitia', lat: -42.4, lon: 70.5, r: 1050, h: -7.2, type: 'basin',
    note: 'Deepest hole on Mars — the air at the bottom is thick enough that liquid water could briefly survive. Briefly.' },
  { name: 'Argyre Planitia', lat: -49.7, lon: 316, r: 450, h: -5.2, type: 'basin',
    note: 'An ancient impact scar ringed by mountains. Named for a mythical island of silver.' },
  { name: 'Isidis Planitia', lat: 12.9, lon: 87, r: 380, h: -3.7, type: 'basin',
    note: 'Third-largest impact basin. Beagle 2 sleeps here, half-opened, like a stood-up date.' },
  { name: 'Utopia Planitia', lat: 46.7, lon: 117.5, r: 830, h: -4.1, type: 'basin',
    note: 'Largest recognized impact basin in the solar system. Also where Starfleet will someday build ships, allegedly.' },
  // Major craters
  { name: 'Gale Crater', lat: -5.4, lon: 137.8, r: 77, h: -3.8, type: 'crater', peak: 2.8,
    note: 'Home of Mount Sharp and one very hardworking nuclear-powered robot geologist.' },
  { name: 'Jezero Crater', lat: 18.44, lon: 77.45, r: 24, h: -2.5, type: 'crater',
    note: 'An ancient river delta. Perseverance is here, caching rocks and minding a helicopter.' },
  { name: 'Gusev Crater', lat: -14.57, lon: 175.48, r: 83, h: -1.9, type: 'crater',
    note: 'Spirit\'s home. She drove backwards for years, dragging a bad wheel, and found ancient hot springs doing it.' },
  { name: 'Schiaparelli Crater', lat: -2.71, lon: 16.77, r: 230, h: -2.2, type: 'crater',
    note: 'Named for the astronomer whose "canali" got mistranslated into canals and a century of Martian fever dreams.' },
  { name: 'Huygens Crater', lat: -13.88, lon: 55.58, r: 234, h: -2.5, type: 'crater',
    note: 'The largest well-preserved crater on Mars, sitting on some of the oldest crust anywhere.' },
  { name: 'Cassini Crater', lat: 23.82, lon: 32.12, r: 205, h: -1.8, type: 'crater',
    note: 'A vast, soft-shouldered ruin in Arabia Terra. Old enough to have forgotten its own impact.' },
  { name: 'Lyot Crater', lat: 50.47, lon: 29.32, r: 110, h: -3.0, type: 'crater',
    note: 'The deepest point in the northern hemisphere. Bring a flashlight and a coat.' },
  { name: 'Korolev Crater', lat: 72.77, lon: 164.58, r: 41, h: -2.0, type: 'crater', ice: true,
    note: 'Permanently full of water ice, 1800 cubic kilometers of it — a frozen lake the size of a small sea.' },
  // Valles Marineris — the grand canyon system, as named segments
  { name: 'Noctis Labyrinthus', lat: -6.9, lon: 261, r: 120, h: -4.5, type: 'canyon', to: { lat: -8, lon: 267 },
    note: 'The Labyrinth of Night: a shattered maze of canyons where Valles Marineris begins.' },
  { name: 'Ius Chasma', lat: -7.5, lon: 269, r: 55, h: -6.5, type: 'canyon', to: { lat: -9, lon: 279 },
    note: 'Twin parallel troughs carved deeper than four Grand Canyons stacked.' },
  { name: 'Melas Chasma', lat: -10, lon: 283, r: 90, h: -7.0, type: 'canyon', to: { lat: -11, lon: 290 },
    note: 'The widest heart of Valles Marineris. The canyon floor has its own weather.' },
  { name: 'Coprates Chasma', lat: -12.5, lon: 293, r: 60, h: -6.8, type: 'canyon', to: { lat: -14, lon: 304 },
    note: 'Nearly 1000 km of unbroken chasm. The walls rise 8 km — you cannot see the top from the floor.' },
  { name: 'Eos Chasma', lat: -13, lon: 307, r: 70, h: -5.2, type: 'canyon', to: { lat: -10, lon: 315 },
    note: 'Where the great canyon exhales into chaos terrain and ancient flood channels.' },
  { name: 'Capri Chasma', lat: -8.5, lon: 313, r: 60, h: -4.2, type: 'canyon', to: { lat: -4, lon: 318 },
    note: 'The canyon\'s outlet ramp, spilling toward the lowlands that once may have held a sea.' },
  // Polar caps
  { name: 'Planum Boreum', lat: 90, lon: 0, r: 600, h: 2.2, type: 'cap',
    note: 'The northern ice cap: water ice, spiral troughs, and winter air that freezes out of the sky.' },
  { name: 'Planum Australe', lat: -90, lon: 0, r: 500, h: 3.0, type: 'cap',
    note: 'The southern cap, taller and colder. Radar hints at buried brine lakes beneath.' },
  // Albedo / label features
  { name: 'Syrtis Major', lat: 8.4, lon: 69.5, r: 600, h: 1.0, type: 'albedo',
    note: 'The dark patch telescopes have watched since 1659 — the oldest continuously observed feature on any other planet.' },
];

// Label-only regions for the map and the region ticker
export const REGIONS = [
  { name: 'Acidalia Planitia', lat: 49.8, lon: 339.3, r: 27 },
  { name: 'Chryse Planitia', lat: 28.4, lon: 319.7, r: 18 },
  { name: 'Amazonis Planitia', lat: 24.8, lon: 196, r: 20 },
  { name: 'Arcadia Planitia', lat: 47.2, lon: 184.3, r: 19 },
  { name: 'Elysium Planitia', lat: 3, lon: 154.7, r: 18 },
  { name: 'Arabia Terra', lat: 22.8, lon: 5, r: 26 },
  { name: 'Terra Sabaea', lat: -2, lon: 42, r: 22 },
  { name: 'Noachis Terra', lat: -45, lon: 350, r: 25 },
  { name: 'Terra Sirenum', lat: -39.7, lon: 205.8, r: 24 },
  { name: 'Terra Cimmeria', lat: -34.7, lon: 145, r: 24 },
  { name: 'Tempe Terra', lat: 39.3, lon: 289, r: 16 },
  { name: 'Meridiani Planum', lat: -0.2, lon: 356.8, r: 10 },
  { name: 'Vastitas Borealis', lat: 68, lon: 90, r: 35 },
  { name: 'Ares Vallis', lat: 16.5, lon: 327.5, r: 8 },
];

// Every soft landing (and famous almost-landing) on Mars, at real coordinates.
export const LANDERS = [
  { name: 'Mars 3', lat: -45, lon: 202, year: 1971, scrap: 2,
    note: 'The first soft landing on Mars. It transmitted for 110 seconds, sent half a gray picture, and went silent forever. A poet.' },
  { name: 'Mars 6', lat: -23.9, lon: 340.6, year: 1974, scrap: 2,
    note: 'Transmitted all the way down and stopped at the surface. Its data described the air it died in.' },
  { name: 'Viking 1', lat: 22.48, lon: 312.05, year: 1976, scrap: 3,
    note: 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.' },
  { name: 'Viking 2', lat: 47.97, lon: 134.26, year: 1976, scrap: 3,
    note: 'Landed on a rock and spent six years slightly tilted. Photographed frost. Never complained.' },
  { name: 'Pathfinder', lat: 19.13, lon: 326.79, year: 1997, scrap: 0,
    note: 'The little lander that could — and its rover Sojourner, the size of a microwave, the courage of a battleship.' },
  { name: 'Beagle 2', lat: 11.53, lon: 90.43, year: 2003, scrap: 2,
    note: 'Landed successfully, then two solar panels failed to open, hiding its antenna. Found 12 years later, almost fine. ALMOST.' },
  { name: 'Spirit', lat: -14.57, lon: 175.47, year: 2004, scrap: 3,
    note: 'Ninety-day mission; drove six years. Finally stuck in soft sand — which its dragging wheel had just revealed to be ancient hot-spring silica.' },
  { name: 'Opportunity', lat: -1.95, lon: 354.47, year: 2004, scrap: 3,
    note: 'Ninety-day mission; drove a marathon over 14 years. Last words, roughly: "My battery is low and it\'s getting dark."' },
  { name: 'Phoenix', lat: 68.22, lon: 234.25, year: 2008, scrap: 3,
    note: 'Dug up polar ice with a robot arm and watched snow fall on Mars. The Martian winter buried it in dry ice. Worth it.' },
  { name: 'Curiosity', lat: -4.59, lon: 137.44, year: 2012, scrap: 2,
    note: 'Nuclear-powered, laser-armed, sky-crane-delivered. Sang itself "Happy Birthday" alone in Gale Crater once. Once.' },
  { name: 'Schiaparelli EDM', lat: -2.05, lon: 353.79, year: 2016, scrap: 3,
    note: 'A software hiccup convinced it the ground was above it. The crater it made is very geographically informative.' },
  { name: 'InSight', lat: 4.5, lon: 135.62, year: 2018, scrap: 3,
    note: 'Listened to the heartbeat of Mars: over 1300 marsquakes. Its last selfie shows it covered in the dust that retired it.' },
  { name: 'Perseverance', lat: 18.44, lon: 77.45, year: 2021, scrap: 2,
    note: 'Carries 43 sample tubes and brought a helicopter as carry-on. Ingenuity flew 72 times when it was rated for 5.' },
  { name: 'Zhurong', lat: 25.07, lon: 109.93, year: 2021, scrap: 2,
    note: 'China\'s first Mars rover, named for a fire god, parked in Utopia. Hibernated for winter; the dust decided it should keep hibernating.' },
];

for (const f of FEATURES) { f.v = llToVec(f.lat, f.lon); f.angR = f.r / MARS_KM; }
for (const r of REGIONS) { r.v = llToVec(r.lat, r.lon); r.angR = r.r * D2R; }
for (const l of LANDERS) { l.v = llToVec(l.lat, l.lon); }

/** Name of the place at a unit direction: the smallest named footprint that contains it. */
export function regionName(v) {
  let best = null, bestR = 1e9;
  for (const list of [REGIONS, FEATURES]) {
    for (const f of list) {
      if (f.type === 'bulge' || f.type === 'albedo') continue;
      const ang = angDist(v.x, v.y, v.z, f.v.x, f.v.y, f.v.z);
      if (ang < f.angR && f.angR < bestR) { bestR = f.angR; best = f.name; }
    }
  }
  if (best) return best;
  const ll = vecToLl(v);
  if (ll.lat > 55) return 'Vastitas Borealis';
  if (ll.lat < -60) return 'Southern Highlands';
  return elevationKm3(v.x, v.y, v.z) < -1.5 ? 'Northern Lowlands' : 'Cratered Highlands';
}
