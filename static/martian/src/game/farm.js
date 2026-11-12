/*
 * The farm beyond potatoes, the galley, and morale.
 *
 * Crops. Potatoes are the staple the story hands him. The mission's botany kit also holds seed
 * packets: radishes and lettuce from the start, soybeans and tomatoes as NASA sends them. Each
 * crop has its own pace, thirst and yield (CROPS), and a bed is planted from a seed packet or
 * from one of the last harvest.
 *
 * Food. Everything edible counts as food. At dawn he eats a staple (a potato, soybeans or a
 * ration) and adds one other thing from the pantry if there is one. Once a sol he can cook a
 * proper dinner at the galley from a staple and two different vegetables.
 *
 * Morale. A man alone on a planet runs on more than calories. Morale (0-100) sinks a little
 * every sol and with every bad day, and rises with variety on the plate, a cooked dinner, word
 * from Earth, a harvest, a discovery, music. In good spirits he works faster and mends faster;
 * in low spirits everything takes longer. It never kills him.
 */
import { S, BAL } from './state.js';
import { clamp } from '../core/math.js';

export const CROPS = {
  potato: { name: 'Potatoes', one: 'potato', growSols: BAL.growSols, waterings: BAL.waterings, yield: BAL.potatoYield, model: null, staple: true, cheer: 0,
    note: 'The staple. Planted from a potato or a ration pack.' },
  radish: { name: 'Radishes', one: 'radish', growSols: 1.1, waterings: 1, yield: 3, model: 'crop_radish', cheer: 2,
    note: 'Quick: ready in about a sol on one watering.' },
  lettuce: { name: 'Lettuce', one: 'lettuce', growSols: 1.6, waterings: 2, yield: 3, model: 'crop_lettuce', cheer: 3,
    note: 'Something green that crunches.' },
  soy: { name: 'Soybeans', one: 'soy', growSols: 3.0, waterings: 2, yield: 4, model: 'crop_soy', staple: true, cheer: 3,
    note: 'Protein. A breakfast on its own.' },
  tomato: { name: 'Tomatoes', one: 'tomato', growSols: 3.4, waterings: 3, yield: 4, model: 'crop_tomato', cheer: 5,
    note: 'Slow and thirsty, and worth it.' },
};
export const CROP_IDS = Object.keys(CROPS);
/** Everything in the pantry apart from potatoes, which keep their own count. */
export const PRODUCE = ['radish', 'lettuce', 'soy', 'tomato'];
export const MORALE_START = 62;

/** The farm's part of the game state. Old saves lack it, so everything goes through here. */
export function farm() {
  if (!S.pantry) S.pantry = { radish: 0, lettuce: 0, soy: 0, tomato: 0 };
  if (!S.seeds) S.seeds = { radish: 2, lettuce: 2, soy: 0, tomato: 0 };
  if (typeof S.morale !== 'number') S.morale = MORALE_START;
  if (!S.diet) S.diet = { same: 0, dinnerSol: 0, breakfast: '', disco: 0, meals: 0 };
  return S;
}
export function initFarm() { S.pantry = null; S.seeds = null; S.morale = undefined; S.diet = null; farm(); }

export function pantryCount() { farm(); return PRODUCE.reduce((n, k) => n + (S.pantry[k] || 0), 0); }
/** Everything he could eat. */
export function foodTotal() { return S.food + S.potatoes + pantryCount(); }

/** How many beds of a crop he could plant now. */
export function seedStock(id) {
  farm();
  return id === 'potato' ? S.potatoes + S.food : (S.seeds[id] || 0) + (S.pantry[id] || 0);
}
export function plantable() { return CROP_IDS.filter((id) => seedStock(id) > 0); }
/** Spend what a bed is planted from: a seed packet before anything he could eat. */
export function takeSeed(id) {
  farm();
  if (id === 'potato') { if (S.potatoes > 0) S.potatoes--; else S.food--; return; }
  if (S.seeds[id] > 0) S.seeds[id]--; else S.pantry[id]--;
}
/** Bring a ripe bed in. Returns how many it gave. */
export function harvest(id) {
  farm();
  const c = CROPS[id] || CROPS.potato;
  if (id === 'potato' || !CROPS[id]) { S.potatoes += c.yield; S.stats.potatoes += c.yield; }
  else { S.pantry[id] += c.yield; S.stats.produce = (S.stats.produce || 0) + c.yield; }
  cheer(2);
  return c.yield;
}

// ------------------------------------------------------------------------------------------
// morale
// ------------------------------------------------------------------------------------------
export function cheer(n) { farm(); S.morale = clamp(S.morale + n, 0, 100); }
export function moraleBand() { farm(); return S.morale >= 70 ? 'high' : S.morale < 30 ? 'low' : 'steady'; }
export const MORALE_WORD = { high: 'In good spirits', steady: 'Holding up', low: 'Worn down' };
/** How fast he works: a held action fills this much faster or slower. */
export function workRate() { const b = moraleBand(); return b === 'high' ? 1.2 : b === 'low' ? 0.78 : 1; }
/** How fast he mends. */
export function healRate() { const b = moraleBand(); return b === 'high' ? 1.3 : b === 'low' ? 0.7 : 1; }
/** Music helps, up to a point each sol. Call with the seconds of disco just heard. */
export function hearMusic(dt) {
  farm();
  if (S.diet.disco >= 4) return;
  const add = dt * 0.05;
  S.diet.disco += add;
  cheer(add);
}

// ------------------------------------------------------------------------------------------
// meals
// ------------------------------------------------------------------------------------------
/** Dawn: eat, and take stock of the day before. Returns what breakfast was, for the log. */
export function breakfast() {
  farm();
  let staple = null;
  if (S.potatoes > 0) { S.potatoes--; staple = 'potato'; }
  else if (S.pantry.soy > 0) { S.pantry.soy--; staple = 'soy'; }
  else if (S.food > 0) { S.food--; staple = 'ration'; }
  let side = null;
  for (const id of ['tomato', 'lettuce', 'radish', 'soy']) {
    if (id === staple || S.pantry[id] <= 0) continue;
    S.pantry[id]--; side = id; break;
  }
  if (!staple && side) { staple = side; side = null; }
  let text;
  if (!staple) { text = 'skipped'; cheer(-12); S.diet.same = 0; }
  else if (side) { text = `${mealName(staple)} with ${CROPS[side].name.toLowerCase()}`; cheer(CROPS[side].cheer + (staple === 'soy' ? 1 : 0)); S.diet.same = 0; }
  else if (staple === 'potato') { S.diet.same++; text = S.diet.same > 1 ? 'potato. Again.' : 'a potato'; cheer(-Math.min(4, S.diet.same)); }
  else if (staple === 'ration') { text = 'one ration'; cheer(-1); S.diet.same = 0; }
  else { text = mealName(staple); cheer(1); S.diet.same = 0; }
  S.diet.breakfast = text;
  S.diet.disco = 0;
  cheer(-5 * (S.drainMult || 1));                        // another sol alone
  return text;
}
function mealName(id) { return id === 'ration' ? 'a ration' : id === 'potato' ? 'potato' : CROPS[id].name.toLowerCase(); }

/** What a dinner would be made of now: a staple and two different vegetables, or the reason there is none. */
export function dinnerPlan() {
  farm();
  if (S.diet.dinnerSol === S.sol) return { ok: false, why: 'Already cooked today' };
  const staple = S.potatoes > 0 ? 'potato' : S.pantry.soy > 0 ? 'soy' : null;
  if (!staple) return { ok: false, why: 'Needs a potato or soybeans' };
  const sides = ['tomato', 'lettuce', 'radish', 'soy'].filter((id) => id !== staple && S.pantry[id] > 0).slice(0, 2);
  if (sides.length < 2) return { ok: false, why: 'Needs two different vegetables' };
  return { ok: true, staple, sides };
}
const DINNERS = {
  'lettuce,tomato': 'Potato salad. With actual salad.',
  'radish,tomato': 'Tomato and radish hash. Nobody asked the potato\'s opinion.',
  'lettuce,radish': 'A garden salad. On Mars. I grew a garden salad on Mars.',
  'soy,tomato': 'Beans in tomato sauce. I have reinvented the tin can.',
  'lettuce,soy': 'Bean salad. Vogel would call it a side dish. Vogel is not here.',
  'radish,soy': 'Beans and radishes. Looks awful. Tastes like victory.',
};
/** Cook it. Returns the line for the log. */
export function cookDinner() {
  const plan = dinnerPlan();
  if (!plan.ok) return null;
  if (plan.staple === 'potato') S.potatoes--; else S.pantry.soy--;
  for (const id of plan.sides) S.pantry[id]--;
  S.diet.dinnerSol = S.sol;
  S.diet.meals++;
  S.diet.same = 0;
  S.health = clamp(S.health + 25, 0, BAL.healthMax);
  cheer(8 + plan.sides.reduce((n, id) => n + CROPS[id].cheer, 0) * 0.6);
  return DINNERS[plan.sides.slice().sort().join(',')] || 'A hot dinner with more than one colour in it.';
}
/** Eat one thing off the shelf, staples first. Returns what it was, or null. */
export function snack() {
  farm();
  if (S.potatoes > 0) { S.potatoes--; return 'potato'; }
  for (const id of ['soy', 'radish', 'lettuce', 'tomato']) if (S.pantry[id] > 0) { S.pantry[id]--; cheer(1); return id; }
  if (S.food > 0) { S.food--; return 'ration'; }
  return null;
}
