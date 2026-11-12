import { S } from './state.js';
import { screenOpen } from '../ui/screens.js';
import { UI } from '../ui/dom.js';
import { World } from '../world/build.js';
import { player } from './player.js';
import { groundDist } from '../planet/geo.js';
import { input } from './input.js';
import { clamp } from '../core/math.js';
// One verb for everything: find the nearest usable thing, show the prompt, run the hold timer.
export const interactables = [];
export function addI(def) { interactables.push(def); if (def.priority === undefined) def.priority = 0; }

export const interaction = { active: null };
export let lastActiveI = null;
export function updateInteract(dt) {
  interaction.active = null;
  if (S.uiOpen || screenOpen() || S.over || S.mode === 'cutscene') { UI.prompt.style.display = 'none'; return; }
  let best = null, bestD = 1e9, bestP = 1e9;
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  for (const it of interactables) {
    if (it.mode && it.mode !== S.mode) continue;
    if (it.visible && !it.visible()) continue;
    const p = it.pos();
    if (!p) continue;
    const d = groundDist(pp, p);
    if (d > it.r) continue;
    if (it.priority < bestP || (it.priority === bestP && d < bestD)) { bestP = it.priority; bestD = d; best = it; }
  }
  if (!best) { UI.prompt.style.display = 'none'; UI.promptSub.textContent = ''; S.holdT = 0; lastActiveI = null; return; }
  interaction.active = best;
  if (best !== lastActiveI) { S.holdT = 0; lastActiveI = best; }
  const en = best.enabled ? best.enabled() : true;
  UI.prompt.style.display = 'block';
  UI.promptSub.textContent = best.sub ? best.sub() : '';
  if (en !== true) {
    UI.promptText.innerHTML = `<span style="opacity:.75">${typeof en === 'string' ? en : best.label()}</span>`;
    UI.hold.style.display = 'none';
    S.holdT = 0;
    return;
  }
  UI.promptText.innerHTML = `<span class="key">E</span>${best.hold > 0.7 ? 'HOLD — ' : ''}${best.label()}`;
  if (input.eHeld) {
    S.holdT += dt;
    UI.hold.style.display = 'block';
    UI.holdFill.style.width = clamp(S.holdT / best.hold * 100, 0, 100) + '%';
    if (S.holdT >= best.hold) {
      S.holdT = 0; input.eHeld = false;
      UI.hold.style.display = 'none';
      best.use();
    }
  } else {
    S.holdT = 0;
    UI.hold.style.display = 'none';
  }
}
