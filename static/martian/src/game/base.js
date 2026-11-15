/*
 * Base mode: what the planet holds for a man who is staying, and where.
 *
 * The story's astronaut lives on scrap, circuit boards, soil and ice, because he is leaving. A base is built of what
 * Mars is made of. Each material lies where orbiters and rovers really found it: grey hematite on Meridiani Planum
 * (seen from orbit by Mars Global Surveyor, and then under Opportunity's wheels), opaline silica in Gusev crater
 * (Spirit ploughed it up with a dead wheel) and at Nili Patera, clays at Mawrth Vallis and Nili Fossae, sulfates in
 * the floors of Valles Marineris and gypsum in the dunes of Olympia Undae, perchlorate where Phoenix dug and chloride
 * salts in the dried lake beds of Terra Sirenum. Basalt is everywhere: any boulder will do.
 *
 * A deposit is a place on the ground with a model of its own (world/base-sites.js). The map shows where each kind
 * was seen from orbit from the first sol; a deposit itself is marked when he has stood at it.
 */
import { hash3 } from '../core/math.js';
import { BAL, S } from './state.js';

/** Models only a base needs (loaded when a base is begun or continued, not at boot). */
export const BASE_MODELS = ['dep_hematite', 'dep_silica', 'dep_clay', 'dep_sulfate', 'dep_salt', 'bs_kiln', 'bs_smelter', 'bs_glassworks', 'bs_solar', 'bs_battery', 'bs_tank', 'bs_quarters', 'bs_tower', 'bs_pad'];

/**
 * The bulk materials of a base, in the order the inventory lists them (keys of S.inv).
 * `from`: where it comes from, for the line that says some is missing.
 */
export const BULK = [
  { id: 'stone', name: 'Basalt', icon: 'rock', from: 'break it off any boulder' },
  { id: 'ore', name: 'Iron ore', icon: 'ore', from: 'rake it up at a hematite pavement (Meridiani Planum, Aram Chaos)' },
  { id: 'silica', name: 'Silica', icon: 'ore', from: 'dig it at a silica bed (Gusev crater, Nili Patera)' },
  { id: 'clay', name: 'Clay', icon: 'ore', from: 'cut it from a clay bank (Mawrth Vallis, Nili Fossae, Gale)' },
  { id: 'sulfate', name: 'Gypsum', icon: 'ore', from: 'break it from a sulfate ledge (Valles Marineris, Olympia Undae)' },
  { id: 'salt', name: 'Salt', icon: 'ore', from: 'lift it from a salt pan (the northern plains, Terra Sirenum)' },
];
export const BULK_BY_ID = Object.fromEntries(BULK.map((b) => [b.id, b]));

/** What the works make of them (keys of S.inv): what a base is built of. */
export const MADE = [
  { id: 'brick', name: 'Brick', icon: 'brick', from: 'fire it in the kiln' },
  { id: 'iron', name: 'Iron', icon: 'ingot', from: 'smelt it in the smelter' },
  { id: 'glass', name: 'Glass', icon: 'pane', from: 'cast it in the glassworks' },
  { id: 'cement', name: 'Cement', icon: 'sack', from: 'burn gypsum in the kiln' },
];

/** An hour by the Hab's clock, in seconds of play (a sol is 24 h 40 min). */
export const HOUR = BAL.solLen / (24 + 2 / 3);

/**
 * The works: what he builds outside the Hab to make a base's materials. Each is set down within reach of the Hab's
 * power cable and, given a job, works by itself: so many batches, each taking `hours` and `power` (per cent of the
 * Hab's store), the product going to the stores. `pad`: the radius of ground levelled for it; `r`: its own radius,
 * for keeping two apart. The first job of each needs nothing a base anywhere cannot find; the rest are what the
 * deposits are for. (A works has `jobs`; a building, below, has none.)
 */
export const WORKS = [
  { id: 'kiln', name: 'Kiln', model: 'bs_kiln', pad: 3.0, r: 2.0,
    desc: 'A beehive of basalt blocks with a fire in it. Fires soil and clay to brick, and burns gypsum to cement.',
    cost: { stone: 12, scrap: 2 },
    jobs: [
      { id: 'brick', name: 'Fire bricks from soil', verb: 'Firing bricks', in: { regolith: 3 }, out: { brick: 2 }, hours: 2, power: 3 },
      { id: 'brickClay', name: 'Fire bricks from clay', verb: 'Firing clay bricks', in: { clay: 2 }, out: { brick: 6 }, hours: 1.5, power: 2 },
      { id: 'cement', name: 'Burn gypsum to cement', verb: 'Burning cement', in: { sulfate: 2, stone: 1 }, out: { cement: 3 }, hours: 2, power: 3 },
    ] },
  { id: 'smelter', name: 'Smelter', model: 'bs_smelter', pad: 3.2, r: 2.1,
    desc: 'A brick shaft furnace. Melts the iron out of hematite, out of scrap, and slowly out of the soil itself.',
    cost: { brick: 14, stone: 6, scrap: 4, circuit: 1 },
    jobs: [
      { id: 'ironSoil', name: 'Smelt iron from soil', verb: 'Smelting soil', in: { regolith: 6 }, out: { iron: 1 }, hours: 3, power: 6 },
      { id: 'ironOre', name: 'Smelt iron from ore', verb: 'Smelting iron ore', in: { ore: 2 }, out: { iron: 3 }, hours: 2, power: 4 },
      { id: 'ironScrap', name: 'Melt down scrap', verb: 'Melting scrap', in: { scrap: 3 }, out: { iron: 2 }, hours: 1, power: 3 },
    ] },
  { id: 'glassworks', name: 'Glassworks', model: 'bs_glassworks', pad: 3.2, r: 2.1,
    desc: 'A furnace, a casting table and a rack of panes. Melts silica to clear glass, or soil to dark.',
    cost: { brick: 12, iron: 4, circuit: 1 },
    jobs: [
      { id: 'glassSoil', name: 'Cast dark glass from soil', verb: 'Casting dark glass', in: { regolith: 5 }, out: { glass: 1 }, hours: 3, power: 5 },
      { id: 'glass', name: 'Cast clear glass from silica', verb: 'Casting glass', in: { silica: 2 }, out: { glass: 3 }, hours: 2, power: 4 },
    ] },
];
/**
 * The buildings: what he builds of what the works make. Set down like the works; they do their good by standing
 * there. `gives`: what one does for the Hab, in a few words, for its card; `most`: how many are any use.
 *  - a solar field gathers as much again as the Hab's own array;
 *  - a battery bank keeps a reserve the Hab draws on when its own store runs low, and fills when it runs high;
 *  - a water tank holds water the Hab's own tank has no room for;
 *  - a farm dome is a greenhouse (the story's, `builds`), paid for in glass and iron and not in salvage;
 *  - living quarters lift his spirits each dawn; a comms tower puts every deposit on the map; a landing pad brings
 *    a supply drop every ten sols (and with it the circuit boards nothing on Mars can make).
 */
export const BUILDINGS = [
  { id: 'solarField', name: 'Solar field', model: 'bs_solar', pad: 4.6, r: 3.7, most: 3,
    desc: 'Twelve panels of home-cast glass in iron frames.', gives: 'Gathers as much power again as the Hab’s own array',
    cost: { iron: 8, glass: 6, circuit: 2 } },
  { id: 'battery', name: 'Battery bank', model: 'bs_battery', pad: 2.6, r: 1.7, most: 3,
    desc: 'Twelve salt cells in an iron rack, under a roof.', gives: 'Keeps a reserve as big as the Hab’s own store, for the night and the storm',
    cost: { iron: 6, salt: 6, circuit: 1 } },
  { id: 'tank', name: 'Water tank', model: 'bs_tank', pad: 2.6, r: 1.6, most: 3,
    desc: 'A drum of welded iron plate on a ring of brick.', gives: 'Holds 240 L more water',
    cost: { iron: 8, brick: 6 } },
  { id: 'dome', name: 'Farm dome', builds: 'greenhouse', pad: 5.6, r: 5.0, most: 6,
    desc: 'A glass dome on a brick ring: the greenhouse kit’s, made here.', gives: 'Four more farm beds',
    cost: { glass: 10, iron: 6, brick: 6 } },
  { id: 'quarters', name: 'Living quarters', model: 'bs_quarters', pad: 4.4, r: 3.4, most: 1,
    desc: 'A vault of brick with an iron hatch and a window in its end.', gives: 'Somewhere that is not the Hab: morale +2 every dawn',
    cost: { brick: 24, cement: 8, iron: 6, glass: 4 } },
  // (the pad before the tower: it takes no circuit boards and brings them, and the tower takes three)
  { id: 'pad', name: 'Landing pad', model: 'bs_pad', pad: 6.6, r: 5.8, most: 1,
    desc: 'A disc of cement on a bed of basalt, a target painted on it, lamps at its rim.', gives: 'Something Earth can hit: a supply drop every ten sols',
    cost: { cement: 18, stone: 24, iron: 4 } },
  { id: 'tower', name: 'Comms tower', model: 'bs_tower', pad: 3.6, r: 1.8, most: 1,
    desc: 'An iron mast on a cement footing, a dish at its head.', gives: 'Earth’s orbiters can see for you: every mineral deposit goes on the map',
    cost: { iron: 12, cement: 4, circuit: 3, glass: 2 } },
];
export const WORK_BY_ID = Object.fromEntries(WORKS.concat(BUILDINGS).map((w) => [w.id, w]));

/**
 * The kinds of deposit. `gives`/`per`: what a turn of work yields; `loads`: turns of work in one deposit;
 * `blockR`: the radius of the circle each of its six loose pieces stands in (none: they are walked over);
 * `fields`: where it lies ({ name, lat, lon (east), r: radius in degrees, n: deposits there, low: keep to low ground }).
 */
export const DEPOSITS = [
  { id: 'hematite', gives: 'ore', per: 2, loads: 30, name: 'Hematite pavement', model: 'dep_hematite', verb: 'Rake up hematite',
    seen: 'Grey hematite, mapped from orbit by Mars Global Surveyor.',
    note: 'Pale pavement strewn with grey beads of hematite: blueberries. Hematite is seventy per cent iron by weight, and here it lies loose on the ground.',
    fields: [
      { name: 'Meridiani Planum', lat: -1.9, lon: 354.5, r: 3.6, n: 5 },
      { name: 'Aram Chaos', lat: 2.6, lon: 338.6, r: 1.4, n: 2 },
      { name: 'Candor Chasma', lat: -6.4, lon: 284.6, r: 0.9, n: 1, low: true },
    ] },
  { id: 'silica', gives: 'silica', per: 2, loads: 26, name: 'Silica bed', model: 'dep_silica', verb: 'Dig silica',
    seen: 'Opaline silica, in the spectra from Mars Reconnaissance Orbiter.',
    note: 'White knobbly crust, nearly pure silica: what a hot spring leaves behind. It will melt to clear glass.',
    fields: [
      { name: 'Gusev crater', lat: -14.57, lon: 175.48, r: 1.1, n: 3 },
      { name: 'Nili Patera', lat: 9.2, lon: 67.3, r: 1.2, n: 3 },
      { name: 'the plains above Ius Chasma', lat: -10.6, lon: 276.0, r: 1.3, n: 2 },
    ] },
  { id: 'clay', gives: 'clay', per: 2, loads: 30, name: 'Clay bank', model: 'dep_clay', verb: 'Cut clay', blockR: 0.34,
    seen: 'Phyllosilicate clays, found from orbit by Mars Express.',
    note: 'A low bank of banded mudstone, cracked into plates. Clay fires to brick with half the heat that bare soil wants.',
    fields: [
      { name: 'Mawrth Vallis', lat: 22.6, lon: 343.5, r: 1.6, n: 3 },
      { name: 'Nili Fossae', lat: 22.0, lon: 77.0, r: 1.5, n: 2 },
      { name: 'Gale crater', lat: -4.9, lon: 137.4, r: 0.5, n: 1, low: true },
      { name: 'Oxia Planum', lat: 18.2, lon: 335.5, r: 0.8, n: 1 },
      { name: 'Eridania', lat: -32.0, lon: 178.0, r: 2.5, n: 2 },
    ] },
  { id: 'sulfate', gives: 'sulfate', per: 2, loads: 30, name: 'Sulfate ledge', model: 'dep_sulfate', verb: 'Break out gypsum', blockR: 0.36,
    seen: 'Layered sulfates, mapped from orbit by Mars Express.',
    note: 'Pale thin beds of sulfate salts with veins of gypsum through them. Burnt and ground, gypsum is plaster and cement.',
    fields: [
      { name: 'Candor Chasma', lat: -6.6, lon: 288.8, r: 0.9, n: 2, low: true },
      { name: 'Melas Chasma', lat: -10.4, lon: 286.5, r: 1.2, n: 2, low: true },
      { name: 'Juventae Chasma', lat: -4.0, lon: 298.4, r: 0.8, n: 1, low: true },
      { name: 'Meridiani Planum', lat: 0.6, lon: 357.2, r: 2.4, n: 2 },
      { name: 'Olympia Undae', lat: 80.5, lon: 180.0, r: 1.6, n: 3, wide: 22 },
    ] },
  { id: 'salt', gives: 'salt', per: 2, loads: 26, name: 'Salt pan', model: 'dep_salt', verb: 'Lift salt',
    seen: 'Chloride and perchlorate salts: Mars Odyssey from orbit, Phoenix on the ground.',
    note: 'A dried pan of salt, heaved into polygons. Perchlorate is oxygen waiting to be let out, and chloride is flux for a furnace.',
    fields: [
      { name: 'the Phoenix plains', lat: 68.2, lon: 234.3, r: 1.8, n: 2 },
      { name: 'Vastitas Borealis', lat: 62.0, lon: 95.0, r: 3.0, n: 2, wide: 30 },
      { name: 'Terra Sirenum', lat: -37.0, lon: 206.0, r: 4.0, n: 4 },
      { name: 'Terra Cimmeria', lat: -30.0, lon: 141.0, r: 3.5, n: 2 },
      { name: 'Noachis Terra', lat: -24.0, lon: 2.0, r: 3.5, n: 2 },
    ] },
];
export const DEPOSIT_BY_ID = Object.fromEntries(DEPOSITS.map((d) => [d.id, d]));

/**
 * Where a field's deposits might lie: `k` candidate places for its `i`-th deposit, as [lat, lon] pairs. The world
 * picks the most level of them (world/base-sites.js). Deposits of one field keep apart: each has its own sector.
 */
export function depositCandidates(dep, field, i, k = 6) {
  const out = [], di = DEPOSITS.indexOf(dep), fi = dep.fields.indexOf(field);
  for (let j = 0; j < k; j++) {
    const a = ((i + hash3(di * 7 + fi, i, j) * 0.8) / field.n) * Math.PI * 2;
    const r = field.r * (0.25 + 0.75 * Math.sqrt(hash3(j, di * 5 + fi, i + 11)));
    const lat = Math.max(-88, Math.min(88, field.lat + r * Math.cos(a)));
    const stretch = field.wide ? field.wide / field.r : 1 / Math.max(0.15, Math.cos(lat * Math.PI / 180));
    out.push([lat, (field.lon + r * Math.sin(a) * stretch + 360) % 360]);
  }
  return out;
}

/** The record a base keeps of itself (in the save): which deposits he has stood at, and what is left in each. */
export function baseState() {
  if (!S.base) S.base = { found: {}, left: {} };
  return S.base;
}
