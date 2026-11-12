import { BAL, S, suitCap } from './state.js';
import { clamp } from '../core/math.js';
import { Snd } from '../audio/sound.js';
import { World } from '../world/build.js';
import { groundDist } from '../planet/geo.js';
import { player } from './player.js';
import { screenOpen } from '../ui/screens.js';
import { log } from '../ui/dom.js';
// Items, recipes, upgrades and loot.
export const ITEM_NAMES = {
  scrap: 'Scrap Metal', circuit: 'Circuit Board', regolith: 'Regolith', ice: 'Ice Chunk',
  candle: 'O2 Candle', kitSolar: 'Solar Panel Kit', kitGreenhouse: 'Greenhouse Kit',
  kitBeacon: 'Nav Beacon Kit', kitCache: 'O2 Cache Kit',
};
export const RECIPES = [
  { id: 'candle', name: 'O2 Candle', desc: '+40 suit O2 in the field (press X)', cost: { scrap: 2, regolith: 1 }, gives: { candle: 1 } },
  { id: 'meltIce', name: 'Melt Ice', desc: '+10L water (uses 2 PWR)', cost: { ice: 1 }, run: () => {
      if (S.power < 2) return 'Not enough hab power';
      S.power -= 2; S.water = clamp(S.water + BAL.iceWater, 0, BAL.waterMax);
      return true;
    } },
  { id: 'kitSolar', name: 'Portable Solar Panel', desc: 'Deployable: recharges the rover nearby; boosts hab power if placed at home', cost: { scrap: 4, circuit: 1 }, gives: { kitSolar: 1 } },
  { id: 'kitGreenhouse', name: 'Greenhouse Dome', desc: 'Deployable: 4 farm plots, anywhere on Mars', cost: { scrap: 8, circuit: 2 }, gives: { kitGreenhouse: 1 } },
  { id: 'kitBeacon', name: 'Nav Beacon', desc: 'Deployable: permanent map + compass marker', cost: { scrap: 2, circuit: 1 }, gives: { kitBeacon: 1 } },
  { id: 'kitCache', name: 'O2 Cache', desc: 'Deployable: 3 suit-O2 refills in the field', cost: { scrap: 3, candle: 1 }, gives: { kitCache: 1 } },
];
export const UPGRADES = [
  { id: 'drive1', name: 'Rover Drivetrain I', desc: 'Top speed 35 → 45 m/s', cost: { scrap: 6, circuit: 1 } },
  { id: 'drive2', name: 'Rover Drivetrain II', desc: 'Top speed 45 → 55 m/s', cost: { scrap: 10, circuit: 2 }, bp: 'drive2', needs: 'drive1' },
  { id: 'roverBattery', name: 'Rover Battery Bank', desc: 'Rover power 100 → 160, night drain −25%', cost: { scrap: 8, circuit: 1 } },
  { id: 'tank1', name: 'Suit Tank I', desc: 'Suit O2 100 → 150', cost: { scrap: 4 } },
  { id: 'tank2', name: 'Suit Tank II', desc: 'Suit O2 150 → 200', cost: { scrap: 8, circuit: 1 }, bp: 'tank2', needs: 'tank1' },
  { id: 'recycler', name: 'Suit CO2 Recycler', desc: 'EVA O2 drain −25%', cost: { scrap: 6, circuit: 2 }, bp: 'recycler' },
  { id: 'insulation', name: 'Hab Insulation', desc: 'Hab base power draw −30%', cost: { scrap: 6 } },
  { id: 'wiper', name: 'Panel Auto-Wiper', desc: 'Panel dust accrual −70%', cost: { scrap: 5, circuit: 1 } },
  { id: 'drill', name: 'Ice Drill', desc: 'Unlocks mining at ice deposits', cost: { scrap: 4, circuit: 1 }, bp: 'drill' },
  { id: 'rtg', name: 'Socket the RTG', desc: 'Cold stops draining power; +6 PWR/sol at night', cost: {}, needsRtg: true },
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
export function gainLoot(loot) {
  const got = [];
  for (const k in loot) {
    if (k === 'rations') { S.food += loot[k]; got.push(`${loot[k]} rations`); }
    else if (k === 'water') { S.water = clamp(S.water + loot[k], 0, BAL.waterMax); got.push(`${loot[k]}L water`); }
    else if (k === 'hydrazine') { S.hydrazine += loot[k]; got.push(`${loot[k]} hydrazine`); }
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
    log('Cracked an O2 candle. Chemistry: still my favorite roommate.');
  }
}
window.addEventListener('keydown', (ev) => { if (ev.key.toLowerCase() === 'x') useCandle(); });
