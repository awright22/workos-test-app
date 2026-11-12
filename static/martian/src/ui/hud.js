import * as THREE from 'three';
import { CROPS, foodTotal } from '../game/farm.js';
import { BAL, S, suitCap, roverPowerCap } from '../game/state.js';
import { plantedPlots } from '../game/interactables.js';
import { fmtDist, groundDist, tangentBasis, vecToLl } from '../planet/geo.js';
import { player } from '../game/player.js';
import { HAB_R, World, siteLocalToWorld } from '../world/build.js';
import { clamp, perf } from '../core/math.js';
import { Snd } from '../audio/sound.js';
import { QUEST_DEFS, questTargetPos } from '../game/story.js';
import { UI, el, root, toast } from './dom.js';
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
  { id: 'reach', pos: () => habPoint(0, 1.3, 11.7),  why: 'The suit is losing air. The airlock door will let you reseal it.',  text: () => 'Suit breach — get to the Hab', dist: habDist, shown: () => true, done: () => S.flags.suitSealed, urgent: true },
  // out of doors with a quarter of a tank left: nothing else is the mission until he is breathing something else
  { id: 'air', urgent: true, why: 'A dry tank is minutes from the end.', text: () => 'Suit air low — get to air',
    pos: () => { const door = habPoint(0, 1.3, 11.7); return S.roverO2 > 6 && World.rover.group.position.distanceTo(player.pos) < door.distanceTo(player.pos) ? _way.copy(World.rover.group.position).addScaledVector(_wup.copy(player.pos).normalize(), 1.6) : door; },
    shown: () => !S.flags.coldOpen && S.mode === 'walk' && !S.inside && !S.inAirlock && S.suit < suitCap() * 0.25, done: () => false },
  { id: 'systems', pos: () => (S.checkedSystems.oxy ? habPoint(5.9, 1.4, -0.4) : habPoint(5.6, 1.4, -3.6)),  why: 'They make the air and the water. Know what keeps you alive.',  text: () => `Inspect the oxygenator and reclaimer (${Object.keys(S.checkedSystems).length}/2)`, shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', pos: () => habPoint(0, 1.3, -6.6),  why: 'How long will the food last?',  text: () => 'Run the numbers at the comms desk', shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  // (after the first bed is in: "farm or starve" is the premise, and the list must not say otherwise)
  { id: 'panels', pos: () => { const p = World.panels.reduce((a, b) => (!a || b.dust > a.dust ? b : a), null); return p ? p.group.getWorldPosition(_way).addScaledVector(_wup.copy(World.hab.position).normalize(), 1.2) : null; },  why: 'Dust on the panels starves the Hab of power.',  text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, shown: () => S.flags.suitSealed && (plantedPlots() > 0 || S.sol > 1 || S.power < 55), done: () => S.stats.panels >= 3 },
  { id: 'farm', pos: () => { const p = World.plots.find((x) => x.state === 'empty' || x.state === 'soil'); return p ? _way.copy(p.worldPos).addScaledVector(_wup.copy(p.worldPos).normalize(), 0.9) : null; },  why: 'Ten rations will not last until the rescue.',  text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'water', pos: () => { const p = World.plots.find((x) => x.state === 'growing' && x.growth >= 0.42 && x.watered < (CROPS[x.crop] || CROPS.potato).waterings); return p ? _way.copy(p.worldPos).addScaledVector(_wup.copy(p.worldPos).normalize(), 0.9) : null; },  why: 'A bed stalls at half grown until it is watered again.',  text: () => 'Water the farm beds: they have stopped growing', shown: () => World.plots.some((p) => p.state === 'growing' && p.growth >= 0.42 && p.watered < (CROPS[p.crop] || CROPS.potato).waterings), done: () => false },
  { id: 'hydra', pos: () => habPoint(4.2, 1.3, 2.6),  why: 'The farm drinks more than the reclaimer makes.',  text: () => 'Make water: burn hydrazine (carefully)', shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'pf', why: 'Its radio is the only way to tell Earth you are alive.',  text: () => (S.pf.loaded ? 'Bring Pathfinder to the uplink ring' : 'Recover Pathfinder — Ares Vallis'),
    dist: () => groundDist(player.pos, S.pf.loaded ? World.uplink.position : World.pathfinder.position),
    shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', text: () => `Harvest potatoes (${S.stats.potatoes} banked)`, shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 || S.stats.produce > 0 },
  { id: 'dinner', pos: () => habPoint(4.2, 1.4, 4.8),  why: 'A cooked meal lifts morale, and in good spirits the work goes faster.',  text: () => 'Cook a dinner at the food shelf', shown: () => S.stats.produce > 0, done: () => !!(S.diet && S.diet.meals > 0) },
  { id: 'breach', pos: () => habPoint(0, 1.6, -HAB_R + 0.5),  why: 'The Hab is losing its air through the far wall.',  text: () => 'Hab breach: seal it', dist: () => (World.breachPos ? groundDist(player.pos, World.breachPos) : 0), shown: () => S.breach.active, done: () => !S.breach.active, urgent: true },
  { id: 'survive', why: 'The Hermes is coming back for you.',  text: () => `Survive to Sol ${S.rescueSol}`, shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', why: 'It is the only rocket on the planet.',  text: () => 'Get to the MAV — Schiaparelli', dist: () => groundDist(player.pos, World.mav.position), shown: () => S.flags.mavRevealed, done: () => S.won },
];
const _way = new THREE.Vector3(), _wup = new THREE.Vector3(), _wv = new THREE.Vector3(), _wc = new THREE.Vector3(), _door = new THREE.Vector3();
/** A point in the Hab, given in its own frame (metres; y above the floor). */
function habPoint(x, y, z) { return siteLocalToWorld(World.hab, x, y, z, _way); }
export const objDone = new Set();
let objSeeded = false, objThrottle = 0, objHead = null, objLead = null;
const objNodes = new Map();          // row key -> { el, tx, ds, text, dist, cls }
const objDoneAt = {};                // objective id -> time it was completed (shown ticked for a moment)
function objRow(key) {
  let n = objNodes.get(key);
  if (!n) {
    const e = el('div', null, 'obj new', UI.objectives, '<i class="mk"></i><span class="tx"></span><span class="ds t-num"></span><span class="why"></span>');
    n = { el: e, tx: e.querySelector('.tx'), ds: e.querySelector('.ds'), wy: e.querySelector('.why'), text: null, dist: null, cls: null, why: null };
    objNodes.set(key, n);
    setTimeout(() => e.classList.remove('new'), 600);
  }
  return n;
}
// ============================================================
// WAYPOINT: where the current objective is
// ============================================================
let wayEl = null, wayShown = false, wayKey = '';
/**
 * A marker over the place the first objective points at: on it when it is in view, at the edge of
 * the screen with an arrow when it is not. Called every frame with the game camera.
 */
export function updateWaypoint(camera) {
  if (!wayEl) wayEl = el('div', 'mg-way', null, UI.hud, '<i class="wp"></i><b class="t-num"></b>');
  let target = null, urgent = false;
  if (S.started && !S.over && !S.uiOpen && !S.photo && !S.sleeping && S.mode !== 'cutscene') {
    const order = OBJECTIVES.filter((o) => o.shown() && !o.done());
    order.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
    const o = order[0];
    const p = o && o.pos ? o.pos() : null;
    if (p) { target = _wv.copy(p); urgent = !!o.urgent; }
  }
  const from = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const d = target ? target.distanceTo(from) : 0;
  if (!target || d < 2.4) { if (wayShown) { wayShown = false; wayEl.style.display = 'none'; } return; }
  // to the screen: in front of the camera it is where it projects; behind, it is pushed out to the edge
  _wc.copy(target).applyMatrix4(camera.matrixWorldInverse);
  const behind = _wc.z > -0.05;
  _wv.copy(target).project(camera);
  let x = _wv.x, y = _wv.y;
  if (behind) { x = -x; y = -y; const m = Math.max(Math.abs(x), Math.abs(y), 1e-3); x /= m; y = Math.min(y / m, -0.2); }
  // (on a phone the left third is the bars, the cards and the stick, and the right the mission and the buttons: the
  // marker keeps to the middle, and points out of it)
  const x0 = layout.compact ? -0.24 : -0.86, x1 = layout.compact ? 0.40 : 0.86, y1 = layout.compact ? 0.56 : 0.62;
  const off = behind || x < x0 || x > x1 || y > y1 || y < -0.7;
  const cx = Math.max(x0, Math.min(x1, x)), cy = Math.max(-0.7, Math.min(y1, y));
  const w = window.innerWidth, h = window.innerHeight;
  const key = `${Math.round((cx * 0.5 + 0.5) * w)},${Math.round((-cy * 0.5 + 0.5) * h)},${off ? Math.round(Math.atan2(-(y - cy), x - cx) * 20) : 'on'},${Math.round(d)},${urgent}`;
  if (!wayShown) { wayShown = true; wayEl.style.display = ''; }
  if (key === wayKey) return;
  wayKey = key;
  wayEl.style.transform = `translate(${((cx * 0.5 + 0.5) * w).toFixed(0)}px, ${((-cy * 0.5 + 0.5) * h).toFixed(0)}px)`;
  wayEl.classList.toggle('off', off);
  wayEl.classList.toggle('urgent', urgent);
  wayEl.firstChild.style.transform = off ? `rotate(${(Math.atan2(-(y - cy), x - cx) * 180 / Math.PI + 90).toFixed(0)}deg)` : '';
  wayEl.lastChild.textContent = fmtDist(d);
}

// ============================================================
// THE THREE SCREENS ARRIVE ONE AT A TIME
// ============================================================
/**
 * Colony, Journal and Map each appear when they first have something to show, with a line saying
 * what they are for. (They used to arrive together the moment the airlock closed, unexplained.)
 * A screen's flag, once set, is saved with the game.
 */
export const SCREEN_UNLOCKS = [
  { id: 'colony', flag: 'uiColony', name: 'Colony', key: 'C', line: 'Your stores, the fabricator and upgrades.',
    when: () => !S.flags.coldOpen && (Object.keys(S.checkedSystems).length >= 1 || S.flags.didMath || S.sol > 1) },
  { id: 'journal', flag: 'uiJournal', name: 'Journal', key: 'J', line: 'NASA’s tasks, what you have found, and the log.',
    when: () => !S.flags.coldOpen && (!!S.flags.didMath || S.sol > 1) },
  { id: 'map', flag: 'uiMap', name: 'Map', key: 'M', line: 'The whole planet, and how far everything is.',
    when: () => !S.flags.coldOpen && (!!S.flags.didMath || S.sol > 1) && (!S.inside || S.sol > 1 || !!S.flags.pfRevealed) },
];
export function screenUnlocked(id) { const s = SCREEN_UNLOCKS.find((x) => x.id === id); return !s || !!S.flags[s.flag]; }
let unlocksSeeded = false;
const shownScreens = {};
function updateUnlocks() {
  if (!S.started) return;
  for (const s of SCREEN_UNLOCKS) {
    if (!S.flags[s.flag] && s.when()) {
      S.flags[s.flag] = true;
      // (what a loaded game already had is not news)
      if (unlocksSeeded) { toast('NEW', s.name, layout.touch ? s.line : `${s.line} Press ${s.key}.`); Snd.jingle(); }
    }
    if (shownScreens[s.id] !== !!S.flags[s.flag]) { shownScreens[s.id] = !!S.flags[s.flag]; root.classList.toggle('no-' + s.id, !S.flags[s.flag]); }
  }
  unlocksSeeded = true;
}

export function updateObjectivesHud() {
  updateUnlocks();                    // (every frame: a screen's button must not lag the thing that earned it)
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
      if (objSeeded) {
        objDoneAt[o.id] = now; if (o.id !== 'reach') Snd.jingle();
        const marks = S.stats.marks || (S.stats.marks = {});      // (kept with the statistics, so it is saved with them)
        if (!marks[o.id]) marks[o.id] = S.sol;
      }
    } else if (!d && objDone.has(o.id)) objDone.delete(o.id);      // a checkpoint rewound it
    const justDone = d && objDoneAt[o.id] && now - objDoneAt[o.id] < 3.2;
    if (d && !justDone && o.id !== 'mav') continue;
    if (shown >= 4) break;
    let cls = d ? 'done' : o.urgent ? 'urgent' : '';
    if (!d && !primary) { primary = true; cls = o.urgent ? 'urgent first' : 'primary'; }
    // the one thing to do next carries its reason
    // (the distance is to the very point the marker stands on, where there is one: the mission line, the marker and the
    // compass once gave three different numbers for the Hab)
    let dist = '';
    if (!d) { const p = o.pos ? o.pos() : null; dist = p ? fmtDist(p.distanceTo(S.mode === 'rover' ? World.rover.group.position : player.pos)) : o.dist ? fmtDist(o.dist()) : ''; }
    rows.push({ key: o.id, text: o.text(), dist, cls, why: /primary|first/.test(cls) ? (o.why || '') : '' });
    shown++;
  }
  // on a phone the reason for a new first objective is said once, as it takes over
  const lead = rows.find((r) => r.why);
  if (lead && lead.key !== objLead) {
    if (objSeeded && layout.compact && S.started && !S.flags.coldOpen) toast('NEXT', lead.text.replace(/ \(\d+\/\d+\)$/, ''), lead.why);
    objLead = lead.key;
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
    if (n.why !== (r.why || '')) { n.why = r.why || ''; n.wy.textContent = n.why; n.wy.style.display = n.why ? '' : 'none'; }
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
  if (!S.inside) add('hab', 'hab', 'Hab', siteLocalToWorld(World.hab, 0, 1.3, 11.7, _door), { pin: true, cls: S.flags.coldOpen ? 'main' : '' });
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
  if (filling || safeAir || S.mode === 'rover') hud.left = Infinity;
  if (filling) st = 'Refilling';
  else if (S.mode === 'rover') st = S.roverO2 > 0 ? 'Rover air' : 'Tank empty';
  else if (safeAir) st = 'Hab air';
  else if (suitRate < -0.02) {
    // (at the rate the tank is going down now; but shown, it only ever counts down: a time left that climbed as he
    // stood still read as broken)
    hud.left = Math.min((hud.left === undefined ? Infinity : hud.left) - dt, S.suit / -suitRate);
    st = `${fmtLeft(hud.left)} left`;
  }
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
    setText('rspd', UI.roverSpeed, String(Math.round(Math.abs(roverF.speed) * 3.6)));
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
  const critical = al.some((a) => a[0] === 'crit');
  if (critical !== UI.critical) { UI.critical = critical; root.classList.toggle('is-critical', critical); }
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
    : (S.mode === 'rover' ? 'F:Exit rover|' : '') + (candles > 0 ? `X:Candle × ${candles}|` : '') + (S.sol <= 2 ? SCREEN_UNLOCKS.filter((s) => S.flags[s.flag]).sort((a, b) => 'MCJ'.indexOf(a.key) - 'MCJ'.indexOf(b.key)).map((s) => `${s.key}:${s.name}|`).join('') : '') + 'Esc:Menu';
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
