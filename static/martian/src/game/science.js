/*
 * Field science: the reason to go and look at the rest of the planet.
 *
 * Out in the field the astronaut bags samples: a chip off a boulder, or a scoop of soil
 * whenever he digs somewhere new. A bag is just a labelled place until it is put through the
 * analyser on the Hab's work table; what it turns out to be depends on where on the real Mars it
 * came from. Hematite "blueberries" really are at Meridiani, sulfates in Valles Marineris,
 * clays and carbonates at Jezero, opaline silica where Spirit found it in Gusev, and so on.
 * Each new material adds to the catalogue in the journal and earns science credit; credit earns
 * NASA grants (supply drops, and blueprints while there are any left to send).
 */
import { S } from './state.js';
import { hash3 } from '../core/math.js';
import { D2R } from '../planet/constants.js';
import { elevationKm3 } from '../planet/surface.js';
import { llToVec, vecToLl } from '../planet/geo.js';
import { FEATURES, regionName } from '../planet/features.js';
import { emit } from '../core/events.js';

export const BAG_LIMIT = 8;

/** Angular distance in degrees between two lat/lon points. */
function apart(lat1, lon1, lat2, lon2) {
  const a = lat1 * D2R, b = lat2 * D2R, d = (lon2 - lon1) * D2R;
  return Math.acos(Math.min(1, Math.max(-1, Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(d)))) / D2R;
}
/** 1 at a place, falling to 0 at `deg` degrees away. */
const near = (p, lat, lon, deg) => Math.max(0, 1 - apart(p.lat, p.lon, lat, lon) / deg);
/** 1 on a volcano's flanks (inside its footprint), else 0. */
function onVolcano(p) {
  let best = 0;
  for (const f of FEATURES) if (f.type === 'volcano') best = Math.max(best, near(p, f.lat, f.lon, (f.r / 59) * 1.1));
  return best;
}
/** 1 inside the Valles Marineris canyon system (near a named chasma and below the plateau). */
function inCanyon(p) {
  if (p.elev > 1.5) return 0;
  let best = 0;
  for (const f of FEATURES) {
    if (f.type !== 'canyon') continue;
    best = Math.max(best, near(p, f.lat, f.lon, 4.5), near(p, f.to.lat, f.to.lon, 4.5), near(p, (f.lat + f.to.lat) / 2, (f.lon + f.to.lon) / 2, 4.5));
  }
  return best;
}

/*
 * What can be found. `kind`: rock (from boulders) or soil (from digging). `at(p)` is how likely
 * it is at a place, p = { lat, lon (0-360 east), elev (km above datum) }; the commonest things
 * have a small weight everywhere and the special ones a large weight where they really occur.
 * `lead` is the hint the journal shows before one has been found.
 */
export const MATERIALS = [
  { id: 'basalt', kind: 'rock', name: 'Olivine basalt', value: 6,
    at: () => 3, lead: 'Most of the planet is made of it.',
    note: 'Basalt, with green flecks of olivine. Mars is a volcanic planet that stopped; this is what it was making.' },
  { id: 'dust', kind: 'soil', name: 'Bright dust', value: 5,
    at: () => 3, lead: 'It is on everything. Including me.',
    note: 'Nanophase iron oxide: rust, ground finer than flour and blown around the whole planet. It is why Mars is red, and why my panels are.' },
  { id: 'lava', kind: 'rock', name: 'Vesicular lava', value: 14,
    at: (p) => 12 * onVolcano(p) + (p.elev > 7 ? 8 : 0), lead: 'The flanks of the great volcanoes.',
    note: 'Full of bubbles: gas coming out of lava as it froze. This flow is younger than most of the planet. On Mars, that means only a few hundred million years.' },
  { id: 'young_lava', kind: 'rock', name: 'Platy flood lava', value: 16,
    at: (p) => 11 * near(p, 6, 157, 11), lead: 'Elysium Planitia, around Cerberus Fossae.',
    note: 'Some of the youngest lava on Mars: rafted plates, like pack ice made of rock. InSight felt the ground still twitching near here.' },
  { id: 'hematite', kind: 'soil', name: 'Hematite spherules', value: 26,
    at: (p) => 15 * near(p, -1.9, 354.5, 9) + 7 * near(p, 2.6, 338.6, 4), lead: 'Meridiani Planum, where Opportunity landed.',
    note: 'Blueberries. Little grey beads of hematite that grew in rock soaked with groundwater. Opportunity landed in a bowl of them and NASA lost its mind, correctly.' },
  { id: 'sulfate', kind: 'rock', name: 'Layered sulfates', value: 22,
    at: (p) => 13 * inCanyon(p) + 5 * near(p, -1.9, 354.5, 9) + 6 * near(p, -5.4, 137.8, 2.5), lead: 'The walls and floors of Valles Marineris.',
    note: 'Pale banded salts, kilometres thick, left by water that was acid and then was gone. The canyon walls are a calendar nobody has finished reading.' },
  { id: 'clay', kind: 'soil', name: 'Phyllosilicate clay', value: 24,
    at: (p) => 13 * Math.max(near(p, 22.6, 343.5, 4.5), near(p, 22, 77, 5), near(p, -5.4, 137.8, 2.5), near(p, 18.44, 77.45, 2.5)),
    lead: 'Mawrth Vallis, Nili Fossae, and the old lake beds at Gale and Jezero.',
    note: 'Clay only forms in water that sat still for a long time and was not too sour to drink. If anything ever lived here, it lived in this.' },
  { id: 'carbonate', kind: 'rock', name: 'Magnesium carbonate', value: 28,
    at: (p) => 11 * Math.max(near(p, 18.44, 77.45, 3), near(p, 21.5, 78.5, 3)), lead: 'The rim of Jezero crater and Nili Fossae.',
    note: 'Carbonate: where some of the old thick atmosphere went, locked into rock along a lake shore. On Earth this is what stromatolites are made of. No pressure.' },
  { id: 'olivine_sand', kind: 'soil', name: 'Olivine sand', value: 18,
    at: (p) => 10 * near(p, 8.4, 69.5, 11), lead: 'The dark plains of Syrtis Major.',
    note: 'Dark green-black sand, nearly pure olivine. It rots to clay the moment water touches it, so this ground has been dry for a very long time.' },
  { id: 'silica', kind: 'soil', name: 'Opaline silica', value: 30,
    at: (p) => 15 * near(p, -14.57, 175.48, 3) + 8 * near(p, 9.2, 67.3, 2), lead: 'Gusev crater, where Spirit dragged a wheel.',
    note: 'Almost pure white silica: the deposit of a hot spring. Spirit found it by accident, ploughing a trench with a dead wheel. Best broken wheel in history.' },
  { id: 'conglomerate', kind: 'rock', name: 'Flood conglomerate', value: 18,
    at: (p) => 9 * Math.max(near(p, 19.1, 326.8, 7), near(p, 26, 318, 7), near(p, -4.6, 137.4, 1.5)), lead: 'Ares Vallis and the Chryse outflow plains.',
    note: 'Rounded pebbles cemented together. Pebbles only get round by being tumbled in a river, and this river was a flood the size of the Amazon times a thousand.' },
  { id: 'perchlorate', kind: 'soil', name: 'Perchlorate salts', value: 20,
    at: (p) => (p.lat > 52 ? 8 * Math.min(1, (p.lat - 52) / 10) : 0) * (p.lat < 78 ? 1 : 0.2), lead: 'The northern plains, where Phoenix dug.',
    note: 'Perchlorate. Toxic to me, antifreeze for brine, and rocket oxidiser if you are patient. Phoenix found it and ruined a lot of farming plans. Not mine. I wash my dirt.' },
  { id: 'gypsum', kind: 'soil', name: 'Gypsum sand', value: 24,
    at: (p) => (p.lat > 75 && p.lat < 85 && p.lon > 110 && p.lon < 250 ? 13 : 0), lead: 'The dune sea of Olympia Undae, beside the north cap.',
    note: 'Gypsum dunes: plaster of Paris, by the cubic kilometre, blowing around the pole. It needed water to form. Everything interesting here did.' },
  { id: 'ice', kind: 'soil', name: 'Water ice core', value: 22,
    at: (p) => (Math.abs(p.lat) > 77 ? 14 : 0) + 16 * near(p, 72.77, 164.58, 1.6), lead: 'The polar caps, and Korolev crater.',
    note: 'Water ice, banded with dust, one band per climate cycle. The whole history of the Martian sky is stacked here like tree rings.' },
  { id: 'chloride', kind: 'soil', name: 'Chloride salt', value: 22,
    at: (p) => 10 * near(p, -37, 206, 13), lead: 'Dried lake beds in Terra Sirenum.',
    note: 'Salt flats. The last puddles on Mars dried up here and left their salt behind, the way they do in Death Valley. Table salt, technically. I am tempted.' },
  { id: 'impact_glass', kind: 'rock', name: 'Impact glass', value: 26,
    at: (p) => 10 * Math.max(near(p, -42.4, 70.5, 15), near(p, -49.7, 316, 7)) * (p.elev < -3.5 ? 1 : 0.3), lead: 'The floors of the great basins: Hellas, Argyre.',
    note: 'Black glass, splashed out of an impact that melted the crust. On Earth, glass like this has trapped bits of what was living where it hit.' },
  { id: 'meteorite', kind: 'rock', name: 'Iron meteorite', value: 40,
    at: () => 0.11, lead: 'Anywhere. Rarely. Keep chipping.',
    note: 'A lump of nickel-iron from the core of a protoplanet that did not make it. It fell on a planet with no rain, so it never rusted. It is older than Mars.' },
];
const BY_ID = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

/** NASA grants: at each total of science credit, a supply drop. Blueprints are added while any are left. */
export const GRANTS = [
  { at: 25, loot: { circuit: 2, scrap: 2, seedTomato: 2 }, say: 'JPL geology is "weeping openly". They sent parts. Botany slipped tomato seeds into the pod.' },
  { at: 60, loot: { scrap: 4, candle: 1 }, blueprint: true, say: 'The science team traded Engineering a favour. Schematics attached.' },
  { at: 110, loot: { circuit: 2, kitBeacon: 1 }, say: 'Three papers are already in review with your name on them. Posthumous authorship has been ruled out, so stay alive.' },
  { at: 170, loot: { scrap: 5, circuit: 1 }, blueprint: true, say: 'A crater has been proposed in your name. More schematics, with thanks.' },
  { at: 240, loot: { circuit: 3, kitSolar: 1 }, blueprint: true, say: 'You have now done more field geology on Mars than the entire human race combined. Have a solar array.' },
  { at: 320, loot: { scrap: 6, circuit: 3, candle: 2 }, blueprint: true, say: 'The catalogue is nearly complete. NASA is running out of things to send that fit in a pod.' },
];

export function initScience() {
  S.science = { points: 0, found: {}, sites: {}, bag: [], grants: 0, serial: 0 };
}
function sci() { if (!S.science) initScience(); return S.science; }

/** One sample per place and kind: places are cells about a hundred metres across. */
function siteKey(lat, lon, kind) {
  return `${kind[0]}${Math.round(lat * 2)}_${Math.round(lon * 2 * Math.max(0.15, Math.cos(lat * D2R)))}`;
}
/** Can a sample of this kind be taken here? Returns true, or the reason why not. */
export function canSample(pos, kind) {
  const s = sci();
  if (s.bag.length >= BAG_LIMIT) return 'Sample case is full: analyse them at the Hab';
  const ll = vecToLl(pos.clone().normalize());
  return s.sites[siteKey(ll.lat, ll.lon, kind)] ? 'Already sampled around here' : true;
}
/** Bag a sample at a world position. Returns the bag, or null if none could be taken. */
export function takeSample(pos, kind) {
  if (canSample(pos, kind) !== true) return null;
  const s = sci();
  const u = pos.clone().normalize(), ll = vecToLl(u);
  s.sites[siteKey(ll.lat, ll.lon, kind)] = 1;
  const bag = { kind, lat: +ll.lat.toFixed(3), lon: +ll.lon.toFixed(3), n: ++s.serial, place: regionName(u) || 'open ground' };
  s.bag.push(bag);
  emit('sample', bag);
  return bag;
}
/** What a bag turns out to hold: fixed by where it came from. */
export function identify(bag) {
  const u = llToVec(bag.lat, bag.lon);
  const p = { lat: bag.lat, lon: ((bag.lon % 360) + 360) % 360, elev: elevationKm3(u.x, u.y, u.z) };
  let total = 0;
  const w = MATERIALS.map((m) => { const x = m.kind === bag.kind ? Math.max(0, m.at(p)) : 0; total += x; return x; });
  let r = hash3(Math.round(bag.lat * 40), Math.round(bag.lon * 40), bag.kind === 'rock' ? 11 : 23) * total;
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0 && w[i] > 0) return MATERIALS[i]; }
  return BY_ID[bag.kind === 'rock' ? 'basalt' : 'dust'];
}
/**
 * Run every bagged sample through the analyser. Returns one result per bag:
 * { bag, material, first, credit }, and `grants`: the grants this credit unlocked.
 */
export function analyseAll() {
  const s = sci(), results = [];
  for (const bag of s.bag) {
    const m = identify(bag);
    const first = !s.found[m.id];
    const credit = first ? m.value : Math.max(1, Math.round(m.value * 0.12));
    s.found[m.id] = (s.found[m.id] || 0) + 1;
    s.points += credit;
    results.push({ bag, material: m, first, credit });
  }
  s.bag = [];
  const grants = [];
  while (s.grants < GRANTS.length && s.points >= GRANTS[s.grants].at) grants.push(GRANTS[s.grants++]);
  return { results, grants };
}
/** The catalogue for the journal: every material, found or not. */
export function catalogue() {
  const s = sci();
  return MATERIALS.map((m) => ({ id: m.id, name: m.name, kind: m.kind, value: m.value, count: s.found[m.id] || 0, text: s.found[m.id] ? m.note : m.lead }));
}
export function scienceSummary() {
  const s = sci();
  const next = GRANTS[s.grants];
  return { points: s.points, kinds: Object.keys(s.found).length, of: MATERIALS.length, bagged: s.bag.length, limit: BAG_LIMIT, nextGrant: next ? next.at : null };
}
