import { BAL, S, suitCap } from '../game/state.js';
import { plantedPlots } from '../game/interactables.js';
import { fmtDist, groundDist, tangentBasis, vecToLl } from '../planet/geo.js';
import { player } from '../game/player.js';
import { HAB_R, World, siteLocalToWorld } from '../world/build.js';
import { clamp, perf } from '../core/math.js';
import { Snd } from '../audio/sound.js';
import { QUEST_DEFS, questTargetPos } from '../game/story.js';
import { UI, el } from './dom.js';
import { _pe, _pn, _v1, _v2, _v3 } from '../core/scratch.js';
import { roverF } from '../game/rover.js';
import { regionName } from '../planet/features.js';
import { localSunEl, localTempC } from '../game/sim.js';
import { input } from '../game/input.js';
// Per-frame HUD: objectives, compass, region, bars, clock, warning vignettes.
export const OBJECTIVES = [
  { id: 'reach', text: () => 'Suit breach — get to the Hab', shown: () => true, done: () => S.flags.suitSealed },
  { id: 'systems', text: () => `Inspect the oxygenator & reclaimer (${Object.keys(S.checkedSystems).length}/2)`, shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', text: () => 'Run the numbers at the comms desk', shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  { id: 'panels', text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, shown: () => S.flags.suitSealed, done: () => S.stats.panels >= 3 },
  { id: 'farm', text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'hydra', text: () => 'Make water: burn hydrazine (carefully)', shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'pf', text: () => {
      if (S.pf.loaded) return 'Bring Pathfinder to the uplink ring';
      const d = fmtDist(groundDist(player.pos, World.pathfinder.position));
      return `Recover Pathfinder — Ares Vallis, ${d}`;
    }, shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', text: () => `Harvest potatoes (${S.stats.potatoes} banked)`, shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 },
  { id: 'breach', text: () => 'SEAL THE BREACH', shown: () => S.breach.active, done: () => !S.breach.active, urgent: true },
  { id: 'survive', text: () => `Survive to Sol ${S.rescueSol} (Sol ${S.sol})`, shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', text: () => `Get to the MAV — Schiaparelli, ${fmtDist(groundDist(player.pos, World.mav.position))}`, shown: () => S.flags.mavRevealed, done: () => S.won },
];
export const objDone = new Set();
export let objThrottle = 0;
export function updateObjectivesHud() {
  if (perf() - objThrottle < 0.3) return;
  objThrottle = perf();
  let html = '<div class="ttl">MISSION</div>';
  let shown = 0;
  for (const o of OBJECTIVES) {
    if (!o.shown()) continue;
    const d = o.done();
    if (d && !objDone.has(o.id)) {
      objDone.add(o.id);
      if (o.id !== 'reach') Snd.jingle();
    }
    if (d && o.id !== 'mav') continue;
    if (shown >= 4) break;
    html += `<div class="mg-obj${d ? ' done' : ''}"${o.urgent ? ' style="color:#ff6f5f"' : ''}>▸ ${o.text()}</div>`;
    shown++;
  }
  // nearest two active survey quests
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(player.pos, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q, d } of act) {
    if (shown >= 6) break;
    html += `<div class="mg-obj quest">▸ ${q.name} — ${fmtDist(d)}</div>`;
    shown++;
  }
  UI.objectives.innerHTML = html;
}

// ============================================================
// 27. COMPASS & REGION TICKER
// ============================================================
export const compassMarks = {};
export let compassThrottle = 0;
export function bearingTo(fromPos, targetPos, frameQ) {
  _v1.copy(fromPos).normalize();
  tangentBasis(_v1, _pe, _pn);
  _v2.copy(targetPos).normalize().sub(_v1.clone().multiplyScalar(_v1.dot(_v2.copy(targetPos).normalize())));
  // (recompute cleanly)
  _v2.copy(targetPos).normalize();
  _v3.copy(_v2).sub(_v1.clone().multiplyScalar(_v1.dot(_v2)));
  if (_v3.lengthSq() < 1e-10) return 0;
  const bE = _v3.dot(_pe), bN = _v3.dot(_pn);
  const bearing = Math.atan2(bE, bN);
  _v2.set(0, 0, -1).applyQuaternion(frameQ);
  _v3.copy(_v2).sub(_v1.clone().multiplyScalar(_v1.dot(_v2)));
  const fE = _v3.dot(_pe), fN = _v3.dot(_pn);
  const facing = Math.atan2(fE, fN);
  let rel = bearing - facing;
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  return rel;
}
export function updateCompass() {
  if (perf() - compassThrottle < 0.12) return;
  compassThrottle = perf();
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const fq = S.mode === 'rover' ? roverF.q : player.q;
  const marks = [];
  marks.push(['hab', '⌂ HAB', World.hab.position]);
  if (!S.flags.coldOpen) marks.push(['rover', '▣ ROVER', World.rover.group.position]);
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) marks.push(['pf', '▼ PATHFINDER', World.pathfinder.position]);
  if (S.pf.loaded && !S.pf.connected) marks.push(['up', '▼ UPLINK', World.uplink.position]);
  if (S.flags.mavRevealed && !S.won) marks.push(['mav', '▲ MAV', World.mav.position]);
  if (S.breach.active) marks.push(['br', '⚠ BREACH', siteLocalToWorld(World.hab, 0, 0, -HAB_R + 1, _v2).clone()]);
  let bi = 0;
  for (const b of World.builtMeshes) if (b.kind === 'beacon') marks.push(['bc' + (bi++), '◆ BEACON', b.group.position]);
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(pp, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q } of act) marks.push(['q' + q.id, '★ ' + q.target.toUpperCase(), questTargetPos(q)]);
  for (const p of World.pods) {
    if (!p.taken && groundDist(pp, p.group.position) < 8000)
      marks.push(['pod' + World.pods.indexOf(p), '▽ CACHE', p.group.position]);
  }
  const seen = new Set();
  for (const [id, label, mp] of marks) {
    seen.add(id);
    let m = compassMarks[id];
    if (!m) { m = el('div', null, 'mg-cmark', UI.compass); compassMarks[id] = m; }
    const d = groundDist(pp, mp);
    if (d < 6) { m.style.display = 'none'; continue; }
    const rel = bearingTo(pp, mp, fq);
    const half = 1.15;
    const xFrac = clamp(rel / half, -1, 1) * 0.5 + 0.5;
    m.style.display = 'block';
    m.style.left = (xFrac * 100) + '%';
    m.style.opacity = Math.abs(rel) > half ? 0.35 : 0.95;
    m.innerHTML = `<div class="ic">${label.split(' ')[0]}</div>${label.split(' ').slice(1).join(' ')}<br>${fmtDist(d)}`;
  }
  for (const id in compassMarks) if (!seen.has(id)) { compassMarks[id].remove(); delete compassMarks[id]; }
  // region ticker
  UI.region.textContent = regionName(_v1.copy(pp).normalize()).toUpperCase();
}

// ============================================================
// 28. HUD
// ============================================================
export function fmtClock() {
  const ll = vecToLl(_v1.copy(player.pos).normalize());
  let h = ((ll.lon + S.tod * 360) / 360 * 24.66 + 12) % 24.66;
  if (h < 0) h += 24.66;
  const mn = Math.floor((h % 1) * 60);
  return `LT ${String(Math.floor(h)).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
}
export function updateHud() {
  const bars = [
    ['suit', S.suit, suitCap(), Math.round(S.suit) + '%'],
    ['o2', S.o2, 100, Math.round(S.o2) + '%'],
    ['water', S.water, BAL.waterMax, S.water.toFixed(0) + 'L'],
    ['food', S.food + S.potatoes, 16, `${S.food}R+${S.potatoes}P`],
    ['power', S.power, 100, Math.round(S.power) + '%'],
    ['health', S.health, 100, Math.round(S.health) + '%'],
  ];
  for (const [k, v, max, txt] of bars) {
    const b = UI.bars[k];
    if (!b) continue;
    b.fill.style.width = clamp(v / max * 100, 0, 100) + '%';
    b.val.textContent = txt;
    b.wrap.classList.toggle('warn', v / max < 0.22);
  }
  const t = localTempC(_v1.copy(player.pos).normalize(), localSunEl());
  if (input.isTouch) {
    UI.tExit.style.display = S.mode === 'rover' ? 'flex' : 'none';
    UI.tJump.style.display = S.mode === 'rover' ? 'none' : 'flex';
  }
  let clock = `<span class="sol">SOL ${S.sol}</span><br>${fmtClock()} · ${t}°C`;
  if (S.mode === 'rover') clock += `<br><span style="font-size:11px">ROVER PWR ${Math.round(S.roverPower)} · O2 ${Math.round(S.roverO2)}</span>`;
  if (S.storm.i > 0.15) clock += '<br><span style="color:#ff6f5f;font-size:11px">⚠ DUST STORM</span>';
  UI.clock.innerHTML = clock;
  const danger = Math.max(1 - S.suit / (suitCap() * 0.25), 1 - S.health / 45, S.breach.active && S.inside ? 0.5 : 0);
  UI.vign.style.opacity = clamp(danger, 0, 1) * 0.9;
  UI.cold.style.opacity = clamp((-70 - t) / 40, 0, 1) * (S.inside ? 0 : 0.85);
  if (S.disco) S.stats.discoTime += 1 / 60;
}
