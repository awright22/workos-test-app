import { BAL, S, airMinutes, airTime, suitCap } from './state.js';
import { clamp } from '../core/math.js';
import { Snd } from '../audio/sound.js';
import { World } from '../world/build.js';
import { groundDist } from '../planet/geo.js';
import { player } from './player.js';
import { screenOpen } from '../ui/screens.js';
import { log } from '../ui/dom.js';
import { CROPS, farm } from './farm.js';
// Items, recipes, upgrades and loot.
export const ITEM_NAMES = {
  scrap: 'Scrap Metal', circuit: 'Circuit Board', regolith: 'Regolith', ice: 'Ice Chunk',
  candle: 'O2 Candle', kitSolar: 'Solar Panel Kit', kitGreenhouse: 'Greenhouse Kit',
  kitBeacon: 'Nav Beacon Kit', kitCache: 'O2 Cache Kit',
};
// (One name and one unit for each thing, here as on the HUD. Suit oxygen is time, "of air", as under the dial; the
// rover's reserve is its battery, in per cent, and "power" is the Hab's; the suit is the suit, not "EVA".)
export const RECIPES = [
  { id: 'candle', name: 'O2 Candle', desc: `+${airTime(40)} of suit air in the field`, how: ['press X to crack one', 'tap the O2 button to crack one'], cost: { scrap: 2, regolith: 1 }, gives: { candle: 1 } },
  { id: 'meltIce', name: 'Melt Ice', desc: '+10 L of water (uses 2% of Hab power)', cost: { ice: 1 }, run: () => {
      if (S.power < 2) return 'Not enough Hab power';
      S.power -= 2; S.water = clamp(S.water + BAL.iceWater, 0, BAL.waterMax);
      return true;
    } },
  { id: 'kitSolar', name: 'Portable Solar Panel', desc: 'Deployable: recharges the rover nearby; boosts Hab power if placed at home', cost: { scrap: 4, circuit: 1 }, gives: { kitSolar: 1 } },
  { id: 'kitGreenhouse', name: 'Greenhouse Dome', desc: 'Deployable: 4 farm plots, anywhere on Mars', cost: { scrap: 8, circuit: 2 }, gives: { kitGreenhouse: 1 } },
  { id: 'kitBeacon', name: 'Nav Beacon', desc: 'Deployable: permanent map + compass marker', cost: { scrap: 2, circuit: 1 }, gives: { kitBeacon: 1 } },
  { id: 'kitCache', name: 'O2 Cache', desc: `Deployable: 3 suit top-ups in the field, +${airTime(40)} of air each`, cost: { scrap: 3, candle: 1 }, gives: { kitCache: 1 } },
];
export const UPGRADES = [
  { id: 'drive1', name: 'Rover Drivetrain I', desc: 'Top speed 125 → 160 km/h', cost: { scrap: 6, circuit: 1 } },
  { id: 'drive2', name: 'Rover Drivetrain II', desc: 'Top speed 160 → 200 km/h', cost: { scrap: 10, circuit: 2 }, bp: 'drive2', needs: 'drive1' },
  { id: 'roverBattery', name: 'Rover Battery Bank', desc: 'Rover battery holds 60% more, and loses a quarter less overnight', cost: { scrap: 8, circuit: 1 } },
  { id: 'tank1', name: 'Suit Tank I', desc: `Suit air: ${airMinutes(100)} → ${airMinutes(150)} minutes on a tank`, cost: { scrap: 4 } },
  { id: 'tank2', name: 'Suit Tank II', desc: `Suit air: ${airMinutes(150)} → ${airMinutes(200)} minutes on a tank`, cost: { scrap: 8, circuit: 1 }, bp: 'tank2', needs: 'tank1' },
  { id: 'recycler', name: 'Suit CO2 Recycler', desc: 'Suit air lasts a third longer', cost: { scrap: 6, circuit: 2 }, bp: 'recycler' },
  { id: 'insulation', name: 'Hab Insulation', desc: 'The Hab draws 30% less power', cost: { scrap: 6 } },
  { id: 'wiper', name: 'Panel Auto-Wiper', desc: 'Dust settles on the panels 70% slower', cost: { scrap: 5, circuit: 1 } },
  { id: 'drill', name: 'Ice Drill', desc: 'Unlocks mining at ice deposits', cost: { scrap: 4, circuit: 1 }, bp: 'drill' },
  { id: 'rtg', name: 'Socket the RTG', desc: 'Cold stops draining Hab power; +6% power a sol', cost: {}, needsRtg: true },
];
export function hasCost(cost) {
  for (const k in cost) if ((S.inv[k] || 0) < cost[k]) return false;
  return true;
}
export function payCost(cost) { for (const k in cost) S.inv[k] -= cost[k]; }
export function costStr(cost) {
  const parts = Object.keys(cost).map(k => `${cost[k]} ${ITEM_NAMES[k] || k}`);
  return parts.length ? parts.join(' + ') : 'free';
}
/** Loot keys that are seed packets for the farm. */
const SEED_LOOT = { seedRadish: 'radish', seedLettuce: 'lettuce', seedSoy: 'soy', seedTomato: 'tomato' };
export function gainLoot(loot) {
  const got = [];
  for (const k in loot) {
    if (k === 'rations') { S.food += loot[k]; got.push(`${loot[k]} rations`); }
    else if (k === 'water') { S.water = clamp(S.water + loot[k], 0, BAL.waterMax); got.push(`${loot[k]} L water`); }
    else if (k === 'hydrazine') { S.hydrazine += loot[k]; got.push(`${loot[k]} hydrazine`); }
    else if (SEED_LOOT[k]) { farm().seeds[SEED_LOOT[k]] += loot[k]; got.push(`${loot[k]} ${CROPS[SEED_LOOT[k]].one} seed packet${loot[k] > 1 ? 's' : ''}`); }
    else { S.inv[k] = (S.inv[k] || 0) + loot[k]; got.push(`${loot[k]} ${ITEM_NAMES[k] || k}`); }
  }
  Snd.pickup();
  return got.join(', ');
}
export function nearHab() { return World.hab && groundDist(player.pos, World.hab.position) < 120; }

/** Crack an O2 candle in the field (the X key, or the touch button). */
export function useCandle() {
  if (!S.started || S.uiOpen || screenOpen() || S.over) return;
  if ((S.inv.candle || 0) > 0 && S.suit < suitCap() - 5) {
    S.inv.candle--;
    S.suit = clamp(S.suit + 40, 0, suitCap());
    Snd.play('candle');
    log('Cracked an O2 candle. Chemistry: still my favourite roommate.');
  }
}
window.addEventListener('keydown', (ev) => { if (ev.key.toLowerCase() === 'x') useCandle(); });
