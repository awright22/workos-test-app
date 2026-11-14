import { workRate } from './farm.js';
import { S } from './state.js';
import { screenOpen } from '../ui/screens.js';
import { UI, setPrompt } from '../ui/dom.js';
import { World } from '../world/build.js';
import { player } from './player.js';
import { groundDist } from '../planet/geo.js';
import { input } from './input.js';
import { clamp } from '../core/math.js';
// One verb for everything: find the nearest usable thing, show the prompt, run the hold timer.
//
// Two kinds of thing can be done. Most are in reach: a bed, a machine, the rover. A few can be done anywhere he
// stands (digging the open ground): these are "ambient", given priority 9 so that anything in reach comes first.
// The rule for an ambient one is that it is offered only with a reason. Its `visible` says when something wants it
// (game/interactables.js, digOffer), and it is never offered while the first line of the mission is a red one: with
// 27 seconds of air and "Run for air" on the list, the game was offering slow digging. An interaction may also name
// the task it belongs to (`task`, an objective's id or a function giving one): standing at it, that task is the one
// the HUD leads with (ui/hud.js).
export const interactables = [];
export function addI(def) { interactables.push(def); if (def.priority === undefined) def.priority = 0; }

export const interaction = { active: null };
export let lastActiveI = null;
export function updateInteract(dt) {
  interaction.active = null;
  if (S.uiOpen || screenOpen() || S.over || S.mode === 'cutscene') { setPrompt(null); return; }
  let best = null, bestD = 1e9, bestP = 1e9;
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  for (const it of interactables) {
    if (it.mode && it.mode !== S.mode) continue;
    if (it.visible && !it.visible()) continue;
    if (it.priority >= 9 && UI.urgentTask) continue;      // (ambient: never under a red task)
    const p = it.pos();
    if (!p) continue;
    const d = groundDist(pp, p);
    if (d > it.r) continue;
    if (it.priority < bestP || (it.priority === bestP && d < bestD)) { bestP = it.priority; bestD = d; best = it; }
  }
  if (!best) { setPrompt(null); S.holdT = 0; lastActiveI = null; return; }
  interaction.active = best;
  if (best !== lastActiveI) { S.holdT = 0; lastActiveI = best; }
  const en = best.enabled ? best.enabled() : true;
  const sub = best.sub ? best.sub() : '';
  if (en !== true) {
    S.holdT = 0;
    setPrompt({ label: best.label(), sub, disabled: typeof en === 'string' ? en : true, hold: best.hold, progress: 0, minor: best.priority >= 9 });
    return;
  }
  if (input.eHeld) {
    S.holdT += dt * workRate();                          // in good spirits the hands are quicker
    if (S.holdT >= best.hold) {
      S.holdT = 0; input.eHeld = false;
      setPrompt({ label: best.label(), sub, hold: best.hold, progress: 0, minor: best.priority >= 9 });
      best.use();
      return;
    }
  } else {
    S.holdT = 0;
  }
  setPrompt({ label: best.label(), sub, hold: best.hold, progress: clamp(S.holdT / best.hold, 0, 1), minor: best.priority >= 9 });
}
