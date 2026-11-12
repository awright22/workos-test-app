import { CROPS, foodTotal } from '../game/farm.js';
import { BAL, S, suitCap, roverPowerCap } from '../game/state.js';
import { plantedPlots } from '../game/interactables.js';
import { fmtDist, groundDist, tangentBasis, vecToLl } from '../planet/geo.js';
import { player } from '../game/player.js';
import { HAB_R, World, siteLocalToWorld } from '../world/build.js';
import { clamp, perf } from '../core/math.js';
import { Snd } from '../audio/sound.js';
import { QUEST_DEFS, questTargetPos } from '../game/story.js';
import { UI, el, root } from './dom.js';
import { _pe, _pn, _v1, _v2, _v3 } from '../core/scratch.js';
import { roverF } from '../game/rover.js';
import { regionName } from '../planet/features.js';
import { localSunEl, localTempC } from '../game/sim.js';
import { icon } from './icons.js';
import { layout, onLayout } from './layout.js';
// Per-frame HUD: mission tracker, compass, region, gauges, clock, rover readout, alerts,
// and the danger and cold levels the renderer's final pass draws at the screen edges.

// ============================================================
// MISSION TRACKER
// ============================================================
const habDist = () => groundDist(player.pos, World.hab.position);
export const OBJECTIVES = [
  { id: 'reach', text: () => 'Suit breach — get to the Hab', dist: habDist, shown: () => true, done: () => S.flags.suitSealed, urgent: true },
  { id: 'systems', text: () => `Inspect the oxygenator and reclaimer (${Object.keys(S.checkedSystems).length}/2)`, shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', text: () => 'Run the numbers at the comms desk', shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  { id: 'panels', text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, shown: () => S.flags.suitSealed, done: () => S.stats.panels >= 3 },
  { id: 'farm', text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'water', text: () => 'Water the farm beds: they have stopped growing', shown: () => World.plots.some((p) => p.state === 'growing' && p.growth >= 0.42 && p.watered < (CROPS[p.crop] || CROPS.potato).waterings), done: () => false },
  { id: 'hydra', text: () => 'Make water: burn hydrazine (carefully)', shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'pf', text: () => (S.pf.loaded ? 'Bring Pathfinder to the uplink ring' : 'Recover Pathfinder — Ares Vallis'),
    dist: () => groundDist(player.pos, S.pf.loaded ? World.uplink.position : World.pathfinder.position),
    shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', text: () => `Harvest potatoes (${S.stats.potatoes} banked)`, shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 || S.stats.produce > 0 },
  { id: 'dinner', text: () => 'Cook a dinner at the food shelf', shown: () => S.stats.produce > 0, done: () => !!(S.diet && S.diet.meals > 0) },
  { id: 'breach', text: () => 'Hab breach: seal it', dist: () => (World.breachPos ? groundDist(player.pos, World.breachPos) : 0), shown: () => S.breach.active, done: () => !S.breach.active, urgent: true },
  { id: 'survive', text: () => `Survive to Sol ${S.rescueSol}`, shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', text: () => 'Get to the MAV — Schiaparelli', dist: () => groundDist(player.pos, World.mav.position), shown: () => S.flags.mavRevealed, done: () => S.won },
];
export const objDone = new Set();
let objSeeded = false, objThrottle = 0, objHead = null;
const objNodes = new Map();          // row key -> { el, tx, ds, text, dist, cls }
const objDoneAt = {};                // objective id -> time it was completed (shown ticked for a moment)
function objRow(key) {
  let n = objNodes.get(key);
  if (!n) {
    const e = el('div', null, 'obj new', UI.objectives, '<i class="mk"></i><span class="tx"></span><span class="ds t-num"></span>');
    n = { el: e, tx: e.querySelector('.tx'), ds: e.querySelector('.ds'), text: null, dist: null, cls: null };
    objNodes.set(key, n);
    setTimeout(() => e.classList.remove('new'), 600);
  }
  return n;
}
export function updateObjectivesHud() {
  const now = perf();
  if (now - objThrottle < 0.3) return;
  objThrottle = now;
  if (!objHead) objHead = el('div', null, 'hd', UI.objectives, '<span>Mission</span>');
  const rows = [];
  let shown = 0, primary = false;
  // an emergency leads the list, whatever else is going on
  const order = OBJECTIVES.filter((o) => o.shown());
  order.sort((a, b) => (b.urgent && !b.done() ? 1 : 0) - (a.urgent && !a.done() ? 1 : 0));
  for (const o of order) {
    const d = o.done();
    if (d && !objDone.has(o.id)) {
      objDone.add(o.id);
      // objectives already complete when a saved game loads are not news
      if (objSeeded) { objDoneAt[o.id] = now; if (o.id !== 'reach') Snd.jingle(); }
    } else if (!d && objDone.has(o.id)) objDone.delete(o.id);      // a checkpoint rewound it
    const justDone = d && objDoneAt[o.id] && now - objDoneAt[o.id] < 3.2;
    if (d && !justDone && o.id !== 'mav') continue;
    if (shown >= 4) break;
    let cls = d ? 'done' : o.urgent ? 'urgent' : '';
    if (!d && !primary) { primary = true; cls = o.urgent ? 'urgent first' : 'primary'; }
    rows.push({ key: o.id, text: o.text(), dist: !d && o.dist ? fmtDist(o.dist()) : '', cls });
    shown++;
  }
  objSeeded = true;
  // the two nearest active survey tasks
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(player.pos, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q, d } of act) {
    if (shown >= 6) break;
    rows.push({ key: 'q:' + q.id, text: q.name, dist: fmtDist(d), cls: 'quest' });
    shown++;
  }
  const live = new Set();
  let prev = objHead;
  for (const r of rows) {
    live.add(r.key);
    const n = objRow(r.key);
    if (n.text !== r.text) { n.text = r.text; n.tx.textContent = r.text; }
    if (n.dist !== r.dist) { n.dist = r.dist; n.ds.textContent = r.dist; }
    if (n.cls !== r.cls) { n.el.classList.remove('done', 'urgent', 'first', 'primary', 'quest'); if (r.cls) n.el.classList.add(...r.cls.split(' ')); n.cls = r.cls; }
    if (prev.nextSibling !== n.el) UI.objectives.insertBefore(n.el, prev.nextSibling);
    prev = n.el;
  }
  for (const [key, n] of objNodes) if (!live.has(key)) { n.el.remove(); objNodes.delete(key); }
  objHead.style.display = rows.length ? '' : 'none';
  UI.objectives.style.display = rows.length ? '' : 'none';
}

// ============================================================
// COMPASS & REGION
// ============================================================
/** Bearing of `targetPos` from `fromPos`, relative to where the frame `frameQ` faces (radians, + = to the right). */
export function bearingTo(fromPos, targetPos, frameQ) {
  let rel = absBearing(fromPos, targetPos) - headingOf(fromPos, frameQ);
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  return rel;
}
/** Compass bearing from one world position to another (radians; 0 = north, + = east). */
export function absBearing(fromPos, targetPos) {
  _v1.copy(fromPos).normalize();
  tangentBasis(_v1, _pe, _pn);
  _v2.copy(targetPos).normalize();
  _v3.copy(_v2).addScaledVector(_v1, -_v1.dot(_v2));
  if (_v3.lengthSq() < 1e-10) return 0;
  return Math.atan2(_v3.dot(_pe), _v3.dot(_pn));
}
/** Compass heading of a body frame standing at `pos` (radians; 0 = north, + = east). */
export function headingOf(pos, frameQ) {
  _v1.copy(pos).normalize();
  tangentBasis(_v1, _pe, _pn);
  _v2.set(0, 0, -1).applyQuaternion(frameQ);
  _v3.copy(_v2).addScaledVector(_v1, -_v1.dot(_v2));
  return Math.atan2(_v3.dot(_pe), _v3.dot(_pn));
}

const CARDS = [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]];
const HALF = 70;                       // degrees of heading shown either side of centre
const EDGE = 56;                       // where a marker for something behind you is pinned (inside the strip's faded ends)
const R2D = 180 / Math.PI;
const cp = { w: 0, ppd: 0, cards: null, marks: [], nodes: {}, dists: {}, listAt: 0, region: null };
onLayout(() => { cp.w = 0; });
function compassGeometry() {
  cp.w = UI.compassStrip.clientWidth;
  cp.ppd = cp.w / (HALF * 2);
  UI.compassTape.style.backgroundSize = `${(15 * cp.ppd).toFixed(2)}px 100%, ${(5 * cp.ppd).toFixed(2)}px 50%`;
  if (!cp.cards) {
    cp.cards = CARDS.map(([name, deg]) => {
      const s = el('span', null, name.length > 1 ? 'minor' : name === 'N' ? 'north' : '', UI.compassCards);
      s.textContent = name;
      return { el: s, deg, on: true };
    });
  }
}
const wrapDeg = (d) => { d %= 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

/** Everything the compass can point at, most important first. */
function compassTargets(pp) {
  const out = [];
  const add = (id, ic, name, pos, o) => out.push({ id, icon: ic, name, pos, cls: '', pin: false, ...o });
  if (S.breach.active) add('br', 'warning', 'Breach', siteLocalToWorld(World.hab, 0, 0, -HAB_R + 1, _v2).clone(), { cls: 'danger', pin: true });
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) add('pf', 'dish', 'Pathfinder', World.pathfinder.position, { cls: 'main', pin: true });
  if (S.pf.loaded && !S.pf.connected) add('up', 'dish', 'Uplink', World.uplink.position, { cls: 'main', pin: true });
  if (S.flags.mavRevealed && !S.won) add('mav', 'rocket', 'MAV', World.mav.position, { cls: 'main', pin: true });
  add('hab', 'hab', 'Hab', World.hab.position, { pin: true, cls: S.flags.coldOpen ? 'main' : '' });
  if (!S.flags.coldOpen && S.mode !== 'rover') add('rover', 'rover', 'Rover', World.rover.group.position);
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(pp, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q } of act) add('q' + q.id, 'target', q.target, questTargetPos(q), { cls: 'quest' });
  let bi = 0;
  for (const b of World.builtMeshes) if (b.kind === 'beacon') add('bc' + (bi++), 'beacon', 'Beacon', b.group.position);
  if (!S.flags.coldOpen) {
    for (let i = 0; i < World.pods.length; i++) {
      const p = World.pods[i];
      if (!p.taken && groundDist(pp, p.group.position) < 8000) add('pod' + i, 'cache', /debris/i.test(p.label) ? 'Debris' : 'Cache', p.group.position);
    }
  }
  return out;
}

export function updateCompass() {
  const now = perf();
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const fq = S.mode === 'rover' ? roverF.q : player.q;
  if (!cp.w) compassGeometry();
  if (!cp.w) return;                                     // not laid out yet
  // what is out there changes slowly: refresh the list, distances and bearings a few times a second
  if (now - cp.listAt > 0.2) {
    cp.listAt = now;
    cp.marks = compassTargets(pp);
    const seen = new Set();
    for (const m of cp.marks) {
      seen.add(m.id);
      m.d = groundDist(pp, m.pos);
      m.bearing = absBearing(pp, m.pos) * R2D;
      let n = cp.nodes[m.id];
      if (!n) n = cp.nodes[m.id] = { el: el('div', null, 'mk', UI.compassMarks, icon(m.icon)), cls: null, lab: el('span', null, null, UI.compassDists), text: null, shown: null };
      m.node = n;
      const cls = m.cls;
      if (n.cls !== cls) { n.el.className = 'mk' + (cls ? ' ' + cls : ''); n.cls = cls; n.state = null; }
    }
    for (const id in cp.nodes) if (!seen.has(id)) { cp.nodes[id].el.remove(); cp.nodes[id].lab.remove(); delete cp.nodes[id]; }
    // indoors, say where you are standing rather than what the Hab is standing on
    const region = S.inside && S.mode === 'walk' ? (groundDist(pp, World.hab.position) < 14 ? 'The Hab' : 'Greenhouse') : regionName(_v1.copy(pp).normalize());
    if (region !== cp.region) {
      const first = cp.region === null;
      cp.region = region;
      UI.region.textContent = region;
      if (!first) { UI.region.classList.remove('enter'); void UI.region.offsetWidth; UI.region.classList.add('enter'); }
    }
  }
  const heading = headingOf(pp, fq) * R2D;
  const mid = cp.w / 2, ppd = cp.ppd;
  const x0 = (mid - heading * ppd).toFixed(1);
  UI.compassTape.style.backgroundPosition = `${x0}px 100%, ${x0}px 100%`;
  for (const c of cp.cards) {
    const rel = wrapDeg(c.deg - heading);
    const on = Math.abs(rel) < HALF + 6;
    if (on !== c.on) { c.on = on; c.el.style.display = on ? '' : 'none'; }
    if (on) c.el.style.transform = `translateX(${(mid + rel * ppd).toFixed(1)}px)`;
  }
  // markers: the list is in priority order, so earlier ones win space
  const iconW = layout.rem * (layout.compact ? 1.1 : 1.35);
  const placed = [], labels = [];
  let focus = null, focusRel = 7;
  for (const m of cp.marks) {
    const n = m.node;
    const rel = wrapDeg(m.bearing - heading);
    const off = Math.abs(rel) > EDGE;
    let state = 'on';
    if (m.d < 6 || (off && !m.pin)) state = 'hide';
    const x = mid + clamp(rel, -EDGE, EDGE) * ppd;
    if (state !== 'hide') {
      let near = 1e9;
      for (const px of placed) near = Math.min(near, Math.abs(px - x));
      if (near < iconW * 0.45) state = 'hide';
      else if (near < iconW * 0.95) state = 'small';
      else if (off) state = rel < 0 ? 'off left' : 'off right';
      if (state !== 'hide') placed.push(x);
    }
    if (state !== n.state) {
      n.state = state;
      n.el.style.display = state === 'hide' ? 'none' : '';
      n.el.classList.toggle('small', state === 'small');
      n.el.classList.toggle('dim', state === 'small');
      n.el.classList.toggle('off', state.startsWith('off'));
      n.el.classList.toggle('left', state === 'off left');
      n.el.classList.toggle('right', state === 'off right');
    }
    m.x = x; m.state = state;
    if (state !== 'hide') {
      n.el.style.transform = `translateX(${x.toFixed(1)}px)`;
      if (!off && Math.abs(rel) < focusRel) { focusRel = Math.abs(rel); focus = m; }
    }
  }
  // distance labels: the marker you face is named; the others show a distance where there is room
  const chW = layout.rem * 0.42;
  const tryLabel = (m, text, cls) => {
    const w = text.length * chW + layout.rem * 1.3;          // the label's own plate and a little air
    const a = clamp(m.x, w / 2, cp.w - w / 2);
    for (const [l, r] of labels) if (a - w / 2 < r && a + w / 2 > l) return false;
    labels.push([a - w / 2, a + w / 2]);
    const n = m.node;
    if (n.text !== text) { n.text = text; n.lab.textContent = text; }
    const c = cls + (m.cls ? ' ' + m.cls : '');
    if (n.labCls !== c) { n.labCls = c; n.lab.className = c; }
    n.lab.style.left = a.toFixed(1) + 'px';
    return true;
  };
  for (const m of cp.marks) m.labelled = false;
  if (focus) focus.labelled = tryLabel(focus, `${focus.name} · ${fmtDist(focus.d)}`, 'focus');
  for (const m of cp.marks) {
    if (m.labelled || m.state === 'hide' || m.state === 'small') continue;
    m.labelled = tryLabel(m, fmtDist(m.d), '');
  }
  for (const m of cp.marks) {
    const n = m.node;
    if (n.shown !== m.labelled) { n.shown = m.labelled; n.lab.style.display = m.labelled ? '' : 'none'; }
  }
}

// ============================================================
// GAUGES, CLOCK, ROVER, ALERTS
// ============================================================
/** Local solar time where the astronaut stands, as hh:mm (a sol has 24 h 40 m). */
export function fmtClock() {
  const ll = vecToLl(_v1.copy(player.pos).normalize());
  let h = ((ll.lon + S.tod * 360) / 360 * 24.66 + 12) % 24.66;
  if (h < 0) h += 24.66;
  const mn = Math.floor((h % 1) * 60);
  return `${String(Math.floor(h)).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
}
const minus = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));

const hud = { tod: null, prev: {}, rate: {}, text: {}, cls: {}, alerts: '', keys: '', danger: 0, cold: 0, day: null };
function setText(key, node, html) { if (hud.text[key] !== html) { hud.text[key] = html; node.innerHTML = html; } }
function setLevel(key, node, frac, warnAt, critAt) {
  const c = frac < critAt ? 'crit' : frac < warnAt ? 'warn' : '';
  if (hud.cls[key] !== c) { hud.cls[key] = c; node.classList.toggle('warn', c === 'warn'); node.classList.toggle('crit', c === 'crit'); }
  return c;
}
/** Smoothed rate of change per game second for the gauges' trend marks and the suit's time left. */
function track(key, value, dt) {
  const prev = hud.prev[key];
  hud.prev[key] = value;
  if (prev === undefined || dt <= 0 || dt > 1) return hud.rate[key] || 0;
  const inst = (value - prev) / dt;
  if (Math.abs(value - prev) > 6) return hud.rate[key] || 0;          // a refill, a meal, a save loaded: not a trend
  const old = hud.rate[key] || 0;
  // a real change (stepping out of the airlock, breaking into a run, the sun going down) shows at once; jitter is smoothed
  const jump = inst * old <= 0 || Math.abs(inst) < Math.abs(old) * 0.5 || Math.abs(inst) > Math.abs(old) * 1.5;
  hud.rate[key] = jump ? inst : old + (inst - old) * (1 - Math.exp(-dt / 1.2));
  return hud.rate[key];
}
function fmtLeft(sec) {
  sec = Math.max(0, Math.round(sec / 5) * 5);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function updateHud() {
  // game seconds since the last update, from the planet's clock (so it is right when the game is stepped by tests)
  let dt = 0;
  if (hud.tod !== null) { let d = S.tod - hud.tod; if (d < -0.5) d += 1; dt = d * BAL.solLen; }
  hud.tod = S.tod;
  const sunEl = localSunEl();
  const t = localTempC(_v1.copy(player.pos).normalize(), sunEl);
  const safeAir = S.inside && S.o2 > 3;

  // --- suit oxygen: the number that kills you ---
  const cap = suitCap(), sf = S.suit / cap;
  const suitRate = track('suit', S.suit, dt);
  setText('suit', UI.suitNum, String(Math.round(S.suit)));
  const off = (100 - clamp(sf, 0, 1) * 100).toFixed(1);
  if (hud.text.suitArc !== off) { hud.text.suitArc = off; UI.suitArc.style.strokeDashoffset = off; }
  const filling = suitRate > 0.5;
  const suitCls = filling ? 'fill' : sf < 0.12 ? 'crit' : (sf < 0.25 || S.flags.coldOpen) ? 'warn' : '';
  if (hud.cls.suit !== suitCls) { hud.cls.suit = suitCls; UI.suit.className = 'suit' + (suitCls ? ' ' + suitCls : ''); }
  let st;
  if (filling) st = 'Refilling';
  else if (S.mode === 'rover') st = S.roverO2 > 0 ? 'Rover air' : 'Tank empty';
  else if (safeAir) st = 'Hab air';
  else if (suitRate < -0.02) st = `${fmtLeft(S.suit / -suitRate)} left`;
  else st = S.flags.coldOpen ? 'Leaking' : 'EVA';
  setText('suitSt', UI.suitState, st);

  // --- the colony's reserves ---
  const food = foodTotal();
  const rows = [
    ['o2', S.o2 / 100, `${Math.round(S.o2)}<small>%</small>`, S.o2],
    ['water', S.water / BAL.waterMax, `${Math.round(S.water)}<small>L</small>`, S.water],
    ['food', food / 16, String(food), null],
    ['power', S.power / BAL.powerMax, `${Math.round(S.power)}<small>%</small>`, S.power],
    ['health', S.health / BAL.healthMax, `${Math.round(S.health)}<small>%</small>`, S.health],
    ['morale', S.morale / 100, String(Math.round(S.morale)), null],
  ];
  for (const [k, frac, txt, raw] of rows) {
    const b = UI.bars[k];
    const f = clamp(frac, 0, 1).toFixed(3);
    if (hud.text[k + 'f'] !== f) { hud.text[k + 'f'] = f; b.fill.style.transform = `scaleX(${f})`; }
    setText(k, b.val, txt);
    setLevel(k, b.wrap, frac, k === 'morale' ? 0.3 : 0.22, k === 'morale' ? 0.12 : 0.1);
    if (raw !== null) {
      const r = track(k, raw, dt);
      const tr = r > 0.0015 ? 'up' : r < -0.0015 ? 'dn' : '';
      if (hud.cls[k + 't'] !== tr) { hud.cls[k + 't'] = tr; b.trend.className = 'tr' + (tr ? ' ' + tr : ''); }
    }
  }

  // --- sol, local time, temperature ---
  setText('sol', UI.clockSol, String(S.sol));
  setText('of', UI.clockOf, `/ ${S.rescueSol}`);
  setText('time', UI.clockTime, fmtClock());
  setText('temp', UI.clockTemp, `${minus(t)}°C`);
  const coldT = t < -70;
  if (hud.cls.temp !== coldT) { hud.cls.temp = coldT; UI.clockTemp.classList.toggle('cold', coldT); }
  const day = sunEl > 0;
  if (hud.day !== day) { hud.day = day; UI.clockDn.innerHTML = icon(day ? 'sun' : 'moon'); }

  // --- rover ---
  if (S.mode === 'rover') {
    setText('rspd', UI.roverSpeed, String(Math.round(Math.abs(roverF.speed))));
    const pf = S.roverPower / roverPowerCap(), of = S.roverO2 / BAL.roverO2Cap;
    const a = UI.roverBars.pwr, b = UI.roverBars.o2;
    a.fill.style.transform = `scaleX(${clamp(pf, 0, 1).toFixed(3)})`;
    b.fill.style.transform = `scaleX(${clamp(of, 0, 1).toFixed(3)})`;
    setText('rpwr', a.val, String(Math.round(S.roverPower)));
    setText('ro2', b.val, String(Math.round(S.roverO2)));
    setLevel('rpwr', a.wrap, pf, 0.2, 0.08);
    setLevel('ro2', b.wrap, of, 0.2, 0.08);
  }

  // --- alerts: at most two, worst first ---
  const al = [];
  if (S.breach.active) al.push(['crit', 'warning', 'Hab breach', 'seal it before the air is gone']);
  if (!filling && !safeAir && S.mode !== 'rover') {
    if (sf < 0.12) al.push(['crit', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> critical', 'get to air now']);
    else if (sf < 0.25) al.push(['warn', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> low', 'head for the Hab or the rover']);
  }
  if (S.mode === 'rover' && S.roverPower / roverPowerCap() < 0.1) al.push(['warn', 'battery', 'Rover battery low', 'park in daylight to recharge']);
  if (S.storm.i > 0.15) al.push(['warn', 'storm', 'Dust storm', 'solar output is down']);
  if (t < -85 && !S.inside && S.mode !== 'rover') al.push(['cold', 'cold', 'Extreme cold', 'the suit heater is drawing <span class="chem">O<sub>2</sub></span>']);
  const alKey = al.slice(0, 2).map((a) => a[2]).join('|');
  if (alKey !== hud.alerts) {
    hud.alerts = alKey;
    const nAl = Math.min(al.length, 2);                                               // toasts sit below however many alerts there are
    root.style.setProperty('--al', nAl);
    root.style.setProperty('--al2', Math.max(0, nAl - 1));
    UI.alerts.innerHTML = al.slice(0, 2).map(([cls, ic, title, note]) => `<div class="alert ${cls}">${icon(ic)}<span>${title}</span><small>${note}</small></div>`).join('');
  }

  // --- screen-edge effects, drawn by the renderer's final pass ---
  const danger = clamp(Math.max(1 - S.suit / (cap * 0.25), 1 - S.health / 45, S.breach.active && S.inside ? 0.5 : 0), 0, 1) * 0.9;
  const cold = clamp((-70 - t) / 40, 0, 1) * (S.inside || S.mode === 'rover' ? 0 : 0.6);
  const ease = dt > 0 ? 1 - Math.exp(-dt / 0.5) : 1;
  hud.danger += (danger - hud.danger) * ease;
  hud.cold += (cold - hud.cold) * ease;
  World.danger = hud.danger;
  World.cold = hud.cold;

  // --- key hints (desktop) and the touch candle button ---
  const candles = S.inv.candle || 0;
  // the first minute teaches moving; after that, the screens
  const keys = S.flags.coldOpen
    ? (layout.touch ? ':Left thumb moves|:Drag to look' : 'W A S D:Move|Shift:Run|Mouse:Look|E:Interact (hold)')
    : (S.mode === 'rover' ? 'F:Exit rover|' : '') + (candles > 0 ? `X:Candle × ${candles}|` : '') + (S.sol <= 2 ? 'M:Map|C:Colony|J:Journal|' : '') + 'Esc:Menu';
  if (keys !== hud.keys) {
    hud.keys = keys;
    UI.keys.innerHTML = keys.split('|').map((k) => {
      const [a, b] = k.split(':');
      return `<span>${b}${a.split(' ').filter(Boolean).map((x) => `<kbd class="mg-kbd">${x}</kbd>`).join('')}</span>`;
    }).join('');
    UI.tCandle.style.display = candles > 0 ? '' : 'none';
    UI.tCandle.querySelector('b').textContent = candles;
  }
}
