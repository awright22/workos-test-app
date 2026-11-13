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
import { UI, chem, el, esc, root, syncFlags, toast } from './dom.js';
import { _pe, _pn, _v1, _v2, _v3 } from '../core/scratch.js';
import { roverF } from '../game/rover.js';
import { regionName } from '../planet/features.js';
import { localSunEl, localTempC, sleepTime, stormIntensityAt, suitDrain } from '../game/sim.js';
import { icon } from './icons.js';
import { layout, onLayout } from './layout.js';
// Per-frame HUD: mission tracker, compass, region, gauges, clock, rover readout, alerts,
// and the danger and cold levels the renderer's final pass draws at the screen edges.

// ============================================================
// MISSION TRACKER
// ============================================================
const _way = new THREE.Vector3(), _wup = new THREE.Vector3(), _wv = new THREE.Vector3(), _wc = new THREE.Vector3(), _door = new THREE.Vector3();
/** A point in the Hab, given in its own frame (metres; y above the floor). */
function habPoint(x, y, z) { return siteLocalToWorld(World.hab, x, y, z, _way); }
/** A point `h` metres above a place on the ground. */
function above(p, h) { _wup.copy(p).normalize(); return _way.copy(p).addScaledVector(_wup, h); }
const fromPos = () => (S.mode === 'rover' ? World.rover.group.position : player.pos);
/**
 * How far away a place is, as every readout gives it: over the ground, from where he stands or from the
 * rover he is driving. The marker, the mission line, the compass and the journal all use this one function.
 */
export function distTo(pos) { return groundDist(fromPos(), pos); }
const thirsty = (p) => p.state === 'growing' && p.growth >= 0.42 && p.watered < (CROPS[p.crop] || CROPS.potato).waterings;
const farAfield = () => groundDist(fromPos(), World.hab.position) > 600;
/** Out of air on foot: is the rover, with air in it, nearer than the airlock? */
const airAtRover = () => S.roverO2 > 6 && distTo(World.rover.group.position) < distTo(siteLocalToWorld(World.hab, 0, 1.3, 11.7, _door));
/** Night has fallen and it is a time he can sleep: the bunk, or the rover's seat, will take him to dawn. */
const bedtime = () => !S.flags.coldOpen && !!S.flags.suitSealed && !S.sleeping && S.mode !== 'cutscene' && sleepTime() === true && localSunEl() < -0.02;
/** The next thing the farm wants, so the list can say it and the marker can stand on it: a bed to plant, a bed to fill, or the heap to dig. */
function farmStep() {
  const soil = World.plots.find((p) => p.state === 'soil');
  if (soil) return { bed: soil, why: 'A bed is filled. Plant it: potatoes are the staple.' };
  const empty = World.plots.find((p) => p.state === 'empty');
  if (!empty) return { why: 'Ten rations will not last until the rescue.' };
  if ((S.inv.regolith || 0) > 0) return { bed: empty, why: 'Fill an empty bed with the regolith you are carrying.' };
  let heap = null, best = 1e9;
  for (const h of World.soilPiles) { if (h.left <= 0) continue; const d = distTo(h.group.position); if (d < best) { best = d; heap = h; } }
  return heap ? { heap, why: 'Beds need regolith. Dig it at the heap outside the airlock.' } : { why: 'The heaps are spent. Dig regolith anywhere outside, slowly.' };
}
/**
 * What there is to do, in the order it is offered. Each has the place its marker stands on (`pos`), the reason it
 * matters (`why`, a line or a function), when it is on the list (`shown`) and when it is ticked off (`done`).
 * `urgent` things (his life) lead the list in red; `press` marks one that leads when its moment comes (night, a
 * flat battery).
 */
export const OBJECTIVES = [
  { id: 'reach', urgent: true, place: 'Hab', icon: 'hab', text: () => 'Suit breach — get to the Hab', why: 'The suit is losing air. Seal it at the airlock door.',
    pos: () => habPoint(0, 1.3, 11.7), shown: () => true, done: () => S.flags.suitSealed },
  // out of doors with a quarter of a tank left: nothing else is the mission until he is breathing something else
  { id: 'air', urgent: true, text: () => (S.suit < suitCap() * 0.12 ? 'Suit O2 critical — get to air' : 'Suit O2 low — get to air'), why: 'An empty tank is minutes from the end.',
    place: () => (airAtRover() ? 'Rover' : 'Hab'), icon: () => (airAtRover() ? 'rover' : 'hab'),
    pos: () => (airAtRover() ? above(World.rover.group.position, 1.6) : habPoint(0, 1.3, 11.7)),
    shown: () => !S.flags.coldOpen && S.mode === 'walk' && !S.inside && !S.inAirlock && S.suit < suitCap() * 0.25, done: () => false },
  { id: 'breach', urgent: true, place: 'Breach', icon: 'warning', text: () => 'Hab breach: seal it', why: 'Air is going out through the far wall, behind the comms desk.',
    pos: () => habPoint(0, 1.6, -HAB_R + 0.5), shown: () => S.breach.active, done: () => !S.breach.active },
  // (nothing said it was time to sleep: at 20:16 and 89 below, the list still led with the solar panels)
  { id: 'sleep', press: () => true, place: () => (farAfield() ? 'Rover' : 'Bunk'), text: () => (S.mode === 'rover' || farAfield() ? 'Camp in the rover until dawn' : 'Sleep until dawn in the bunk'),
    why: 'The night is deadly cold. Sleep skips to dawn and mends you.',
    pos: () => (S.mode === 'rover' ? null : farAfield() ? above(World.rover.group.position, 1.6) : habPoint(-5.0, 1.1, -4.9)), shown: bedtime, done: () => false },
  { id: 'systems', place: () => (S.checkedSystems.oxy ? 'Reclaimer' : 'Oxygenator'), text: () => `Inspect the oxygenator and reclaimer (${Object.keys(S.checkedSystems).length}/2)`, why: 'They make your air and your water. Know what keeps you alive.',
    pos: () => (S.checkedSystems.oxy ? habPoint(5.9, 1.4, -0.4) : habPoint(5.6, 1.4, -3.6)), shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', place: 'Comms desk', text: () => 'Check the numbers at the comms desk', why: 'How long will the food last?',
    pos: () => habPoint(0, 1.3, -6.6), shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  { id: 'water', place: 'Farm bed', text: () => 'Water the farm beds: they have stopped growing', why: 'A bed stalls at half grown until it is watered again.',
    pos: () => { const p = World.plots.find(thirsty); return p ? above(p.worldPos, 0.9) : null; }, shown: () => World.plots.some(thirsty), done: () => false },
  // "farm or starve" is the premise: the farm leads until three beds are in, whatever else has joined the list
  { id: 'farm', place: () => (farmStep().heap ? 'Heap' : 'Farm bed'), text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, why: () => farmStep().why,
    pos: () => { const f = farmStep(); return f.bed ? above(f.bed.worldPos, 0.9) : f.heap ? above(f.heap.group.position, 1.1) : null; },
    shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'hydra', place: 'Rig', text: () => 'Make water: burn hydrazine at the rig', why: 'A burn makes 28 L for the beds, and eats a little Hab air.',
    pos: () => habPoint(4.2, 1.3, 2.6), shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'panels', place: 'Panels', press: () => S.power < 45, text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, why: 'Dust on the panels starves the Hab of power.',
    pos: () => { const p = World.panels.reduce((a, b) => (!a || b.dust > a.dust ? b : a), null); return p ? above(p.group.getWorldPosition(_wv), 1.2) : null; },
    shown: () => !!S.flags.suitSealed && (plantedPlots() > 0 || S.sol > 1 || S.power < 55), done: () => S.stats.panels >= 3 },
  { id: 'pf', place: () => (S.pf.loaded ? 'Uplink' : 'Pathfinder'), icon: 'dish', text: () => (S.pf.loaded ? 'Bring Pathfinder to the uplink ring' : 'Recover Pathfinder — Ares Vallis'), why: 'Its radio is the only way to tell Earth you are alive.',
    pos: () => above(S.pf.loaded ? World.uplink.position : World.pathfinder.position, 2), shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', place: 'Farm bed', text: () => 'Bring in the first harvest',
    why: () => (World.plots.some((p) => p.state === 'ready') ? 'A bed is ripe: bring it in.' : 'Beds take about two and a half sols, and a second watering.'),
    pos: () => { const p = World.plots.find((x) => x.state === 'ready'); return p ? above(p.worldPos, 0.9) : null; },
    shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 || S.stats.produce > 0 },
  { id: 'dinner', place: 'Food shelf', text: () => 'Cook a dinner at the food shelf', why: 'A cooked meal lifts morale; in good spirits work goes faster.',
    pos: () => habPoint(4.2, 1.4, 4.8), shown: () => S.stats.produce > 0, done: () => !!(S.diet && S.diet.meals > 0) },
  { id: 'survive', text: () => `Survive to Sol ${S.rescueSol}`, why: 'The Hermes is coming back for you.', shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', place: 'MAV', icon: 'rocket', text: () => 'Get to the MAV — Schiaparelli', why: 'It is the only rocket on the planet.',
    pos: () => above(World.mav.position, 4), shown: () => S.flags.mavRevealed, done: () => S.won },
];
/** The reason an objective gives (some change with what is in hand). */
export const objectiveWhy = (o) => (typeof o.why === 'function' ? o.why() : o.why || '');
/** The mission as the HUD, the journal and the night's account all give it: everything on the list, the most pressing first. */
export function missionList() {
  const out = [];
  for (const o of OBJECTIVES) {
    if (!o.shown()) continue;
    const done = !!o.done();
    out.push({ o, done, rank: done ? 0 : o.urgent ? 2 : o.press && o.press() ? 1 : 0 });
  }
  return out.sort((a, b) => b.rank - a.rank);
}
const _wh = { pos: new THREE.Vector3(), d: 0, near: 0, via: '' };
/**
 * Where the marker for an objective stands and how far there is to go: { pos, d, near }, or null when it has no
 * place. The Hab has one way in. From outside, a thing inside it is marked at the airlock door, with the distance to
 * the door (the same point and the same number as the compass's Hab mark). From inside, a thing outside is marked at
 * the inner door, with the whole walk: to the door and on from there.
 */
export function objectiveWhere(o) {
  const p = o.pos ? o.pos() : null;
  if (!p) return null;
  _wh.pos.copy(p);
  const from = fromPos(), hab = World.hab.position, onFoot = S.mode === 'walk';
  const pIn = groundDist(_wh.pos, hab) < HAB_R - 0.3;
  const meIn = onFoot && S.inside && groundDist(from, hab) < HAB_R;
  _wh.via = '';
  if (pIn && !meIn && !(onFoot && S.inAirlock)) { siteLocalToWorld(World.hab, 0, 1.3, 11.7, _wh.pos); _wh.d = _wh.near = groundDist(from, _wh.pos); _wh.via = 'in'; }
  else if (!pIn && meIn) { const on = groundDist(siteLocalToWorld(World.hab, 0, 1.3, HAB_R - 0.9, _door), _wh.pos); _wh.pos.copy(_door); _wh.near = groundDist(from, _door); _wh.d = _wh.near + on; _wh.via = 'out'; }
  else _wh.d = _wh.near = groundDist(from, _wh.pos);
  return _wh;
}
/** The distance an objective's line shows: the same number its marker carries. */
export function objectiveDist(o) { const w = objectiveWhere(o); return w ? fmtDist(w.d) : ''; }
export const objDone = new Set();
let objSeeded = false, objThrottle = 0, objHead = null, sleepTold = false, fitKey = '', fitAt = 0;
const objFrom = new THREE.Vector3();
const objNodes = new Map();          // row key -> { el, tx, ds, wy, o, q, text, dist, cls, why }
const objDoneAt = {};                // objective id -> time it was completed (shown ticked for a moment)
function objRow(key) {
  let n = objNodes.get(key);
  if (!n) {
    const e = el('div', null, 'obj new', UI.objectives, '<i class="mk"></i><span class="tx"></span><span class="ds t-num"></span><span class="why"></span>');
    n = { el: e, tx: e.querySelector('.tx'), ds: e.querySelector('.ds'), wy: e.querySelector('.why'), o: null, q: null, text: null, dist: null, cls: null, why: null };
    objNodes.set(key, n);
    setTimeout(() => e.classList.remove('new'), 600);
  }
  return n;
}
// ============================================================
// WAYPOINT: where the current objective is
// ============================================================
let wayEl = null, wayShown = false, wayKey = '', waySide = 1, zonesAt = -1, zoneAge = 0;
const zones = [];                    // what the marker keeps clear of: [left, top, right, bottom, kind] in px
onLayout(() => { zonesAt = -1; });
/** The boxes of everything on the HUD that is showing now (kind 0), the prompt and the rover's panel (1), and the figure in the middle (2). */
function readZones(w, h) {
  zones.length = 0;
  const add = (n, kind) => { if (!n) return; const r = n.getBoundingClientRect(); if (r.width > 2 && r.height > 2) zones.push([r.left, r.top, r.right, r.bottom, kind]); };
  for (const n of [UI.vitals, UI.compass, UI.region, UI.alerts, UI.tr, UI.log, UI.toasts.firstElementChild, UI.keys, UI.joy, UI.tE, UI.tJump, UI.tExit, UI.tSprint, UI.tCam, UI.tCandle, UI.tRow]) add(n, 0);
  if (UI.prompt.classList.contains('on')) add(UI.prompt, 1);       // (it fades by opacity, so it always has a box)
  add(UI.rover, 1);
  // the astronaut, or the rover, in a third-person view: an arrow is never parked on him
  // (he stands a little left of centre; indoors the camera is close behind him and he fills more of the picture)
  if (!(S.firstPerson && S.mode === 'walk')) {
    if (S.mode === 'rover') zones.push([w / 2 - h * 0.18, h * 0.4, w / 2 + h * 0.18, h * 0.74, 2]);
    else if (S.inside || S.inAirlock) zones.push([w / 2 - h * 0.44, h * 0.34, w / 2 + h * 0.1, h, 2]);
    else zones.push([w / 2 - h * 0.21, h * 0.46, w / 2 + h * 0.03, h * 0.9, 2]);
  }
}
/**
 * A marker over the place the first objective points at: on it when it is in view, and an arrowhead on a ring at
 * the edge of the screen when it is not. It never sits on another part of the HUD, on the prompt, or on the figure:
 * the ring gives way inward, and then round, until there is room. Called every frame with the game camera.
 */
export function updateWaypoint(camera) {
  if (!wayEl) { wayEl = el('div', 'mg-way', null, UI.hud, '<i class="wp"></i><b class="t-num"></b>'); UI.hud.insertBefore(wayEl, UI.vitals); }
  let at = null, urgent = false;
  if (S.started && !S.over && !S.uiOpen && !S.photo && !S.sleeping && S.mode !== 'cutscene') {
    const lead = missionList().find((e) => !e.done);
    if (lead) { at = objectiveWhere(lead.o); urgent = !!lead.o.urgent; }
  }
  if (!at || at.near < 2.4) { if (wayShown) { wayShown = false; wayEl.style.display = 'none'; } return; }
  const w = window.innerWidth, h = window.innerHeight, rem = layout.rem;
  // to the screen: in front of the camera it is where it projects; behind, it is pushed out toward the bottom edge
  // (with the camera where this frame will draw it, not where the last frame did: the marker stood off its place by a frame's turn)
  camera.updateMatrixWorld();
  _wc.copy(at.pos).applyMatrix4(camera.matrixWorldInverse);
  const behind = _wc.z > -0.05;
  _wv.copy(at.pos).project(camera);
  let nx = _wv.x, ny = _wv.y;
  if (behind) { nx = -nx; ny = -ny; const m = Math.max(Math.abs(nx), Math.abs(ny), 1e-3); nx /= m; ny = Math.min(ny / m, -0.2); }
  const px = (nx * 0.5 + 0.5) * w, py = (-ny * 0.5 + 0.5) * h;
  // the marker's own box about its point (the diamond above, the distance under it), and the ring it keeps to
  const bx = rem * 1.875 + 6, up = rem * 1.4 + 5, dn = rem * 0.95 + 6;
  const L = layout.safe[3] + bx + 4, R = w - layout.safe[1] - bx - 4, T = layout.safe[0] + up + 4, B = h - layout.safe[2] - dn - 4;
  const now = perf();
  // (looked at again five times a second, and every tenth frame whatever the clock says: a log line or a toast must not sit under the marker for long)
  if (zonesAt < 0 || now - zonesAt > 0.2 || ++zoneAge >= 10) { zonesAt = now; zoneAge = 0; readZones(w, h); }
  const hit = (x, y, kinds) => { for (const z of zones) if (z[4] <= kinds && x + bx > z[0] && x - bx < z[2] && y + dn > z[1] && y - up < z[3]) return z; return null; };
  const inView = !behind && px >= L && px <= R && py >= T && py <= B;
  let x = px, y = py, off = !inView;
  if (inView) {
    let z = hit(x, y, 1);
    // under the prompt (he is standing at the thing): the diamond rides just above the prompt
    if (z && z[4] === 1) { const lift = z[1] - dn - 2; if (y - lift < rem * 5 && lift > T && !hit(x, lift, 1)) { y = lift; z = null; } }
    if (z) off = true;
  }
  let ang = 0;
  if (off) {
    const cx = w / 2, cy = h / 2;
    let dx = px - cx, dy = py - cy;
    if (Math.abs(dx) + Math.abs(dy) < 1) dy = 1;
    ang = Math.atan2(dy, dx);
    // along the way to it from the middle of the screen, from the edge inward; then round to either side, a step at a time
    const seek = (kinds, steps) => {
      for (let k = 0; k <= steps; k++) {
        for (const s of (k ? [waySide, -waySide] : [1])) {
          const a = ang + s * k * 0.14, ux = Math.cos(a), uy = Math.sin(a);
          const t = Math.min(ux > 1e-6 ? (R - cx) / ux : ux < -1e-6 ? (L - cx) / ux : 1e9, uy > 1e-6 ? (B - cy) / uy : uy < -1e-6 ? (T - cy) / uy : 1e9);
          // (a place in view but under a panel: the arrow stops short of it, never beyond it)
          for (let r = inView && !k ? Math.min(1, Math.hypot(dx, dy) / t) : 1; r >= 0.3; r -= 0.07) {
            const qx = cx + ux * t * r, qy = cy + uy * t * r;
            if (!hit(qx, qy, kinds)) { x = qx; y = qy; if (k) waySide = s; return true; }
          }
        }
      }
      return false;
    };
    // On its own side of the screen and clear of everything; failing that (a small phone, driving, with the log up)
    // beside the figure rather than on any part of the HUD; failing that anywhere round the screen that is free;
    // and if there is nowhere at all, it is not drawn (the mission line still gives the distance, the compass the way).
    if (!(seek(2, 12) || seek(1, 12) || seek(1, 22))) { if (wayShown) { wayShown = false; wayEl.style.display = 'none'; } return; }
  }
  const tag = fmtDist(at.d);
  const key = `${Math.round(x)},${Math.round(y)},${off ? Math.round(ang * 20) : 'on'},${tag},${urgent}`;
  if (!wayShown) { wayShown = true; wayEl.style.display = ''; }
  if (key === wayKey) return;
  wayKey = key;
  wayEl.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
  wayEl.classList.toggle('off', off);
  wayEl.classList.toggle('urgent', urgent);
  wayEl.firstChild.style.transform = off ? `rotate(${(ang * 180 / Math.PI + 90).toFixed(0)}deg)` : '';
  wayEl.lastChild.textContent = tag;
}

// ============================================================
// THE BARS AND THE THREE SCREENS ARRIVE ONE AT A TIME
// ============================================================
/**
 * The six bars, then Colony, Journal and Map, each appear when they first have something to show, with a line
 * saying what they are for. (They used to arrive together the moment the suit was sealed, unexplained.)
 * A flag, once set, is saved with the game.
 */
export const SCREEN_UNLOCKS = [
  // the bars come up as he first steps into the Hab: at the door there is one number, the suit's
  { id: 'bars', flag: 'uiBars', name: 'The six bars', line: 'What keeps you alive, top left.', keys: 'The pause menu says what each one is.',
    when: () => !S.flags.coldOpen && (S.inside || Object.keys(S.checkedSystems).length >= 1 || !!S.flags.didMath || S.sol > 1), quiet: () => !!S.flags.didMath },
  { id: 'colony', flag: 'uiColony', name: 'Colony', key: 'C', line: 'Your stores, the fabricator and upgrades.',
    when: () => !S.flags.coldOpen && (Object.keys(S.checkedSystems).length >= 1 || S.flags.didMath || S.sol > 1) },
  { id: 'journal', flag: 'uiJournal', name: 'Journal', key: 'J', line: 'Your tasks, what you have found, and the log.',
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
      if (unlocksSeeded && !(s.quiet && s.quiet())) {
        // (the bars, on a touch screen: one line under the panel itself, pointing at it, that stays long enough to be read.
        // They used to be explained in the third paragraph of a card that covered them.)
        if (s.id === 'bars' && layout.touch) toast('What keeps you alive', 'Tap the bars for what each means', '', { point: true, life: 14000 });
        else toast('NEW', s.name, s.key ? (layout.touch ? s.line : `${s.line} Press ${s.key}.`) : `${s.line} ${s.keys}`);
        Snd.jingle();
      }
    }
    if (shownScreens[s.id] !== !!S.flags[s.flag]) { shownScreens[s.id] = !!S.flags[s.flag]; root.classList.toggle('no-' + s.id, !S.flags[s.flag]); }
  }
  unlocksSeeded = true;
}

/**
 * The mission list on the HUD. Called every frame: the distances are refreshed with the marker's and the
 * compass's, so the three always agree; the list itself is rebuilt a few times a second.
 */
export function updateObjectivesHud() {
  updateUnlocks();                    // (every frame: a screen's button must not lag the thing that earned it)
  const now = perf(), from = fromPos();
  // (a jump in position, such as a checkpoint restored, does not wait for the list's next turn)
  if (now - objThrottle >= 0.3 || objFrom.distanceToSquared(from) > 9) { objThrottle = now; objFrom.copy(from); rebuildObjectives(now); }
  for (const n of objNodes.values()) {
    let dist = '';
    if (n.cls !== 'done') {
      if (n.o) dist = objectiveDist(n.o);
      else if (n.q) { const p = questTargetPos(n.q); dist = p ? fmtDist(distTo(p)) : ''; }
    }
    if (n.dist !== dist) { n.dist = dist; n.ds.textContent = dist; }
  }
  if (now - fitAt > 1) fitObjectives(now);
}
function rebuildObjectives(now) {
  if (!objHead) objHead = el('div', null, 'hd', UI.objectives, '<span>Mission</span>');
  const list = missionList();
  for (const e of list) {
    const id = e.o.id;
    if (e.done && !objDone.has(id)) {
      objDone.add(id);
      // objectives already complete when a saved game loads are not news
      if (objSeeded) {
        objDoneAt[id] = now; if (id !== 'reach') Snd.jingle();
        const marks = S.stats.marks || (S.stats.marks = {});      // (kept with the statistics, so it is saved with them)
        if (!marks[id]) marks[id] = S.sol;
      }
    } else if (!e.done && objDone.has(id)) objDone.delete(id);      // a checkpoint rewound it
  }
  // the thing just done shows ticked at the head of the list for a moment (lower down, a phone never showed the tick):
  // one line, the latest, so it never crowds out what to do next
  let ticked = null;
  for (const e of list) if (e.done && objDoneAt[e.o.id] && now - objDoneAt[e.o.id] < 4.5 && (!ticked || objDoneAt[e.o.id] > objDoneAt[ticked.o.id])) ticked = e;
  const just = (e) => e === ticked;
  const rows = [];
  if (ticked) rows.push({ key: ticked.o.id, o: ticked.o, text: ticked.o.text().replace(/ \(\d+\/\d+\)$/, ''), cls: 'done', why: '' });
  let primary = false;
  for (const e of list) {
    if (rows.length >= 4) break;
    if (just(e)) continue;
    if (e.done) { if (e.o.id === 'mav') rows.push({ key: e.o.id, o: e.o, text: e.o.text(), cls: 'done', why: '' }); continue; }
    // the one thing to do next is marked, and carries its reason
    let cls = e.o.urgent ? 'urgent' : '', why = '';
    if (!primary) { primary = true; cls = e.o.urgent ? 'urgent first' : 'primary'; why = objectiveWhy(e.o); }
    rows.push({ key: e.o.id, o: e.o, text: e.o.text(), cls, why });
  }
  // night: said once as it falls, as well as listed
  const night = list.some((e) => e.o.id === 'sleep');
  if (night && !sleepTold && objSeeded) toast('Night', 'Time to sleep', '', { yields: true });
  sleepTold = night;
  objSeeded = true;
  // the two nearest active survey tasks
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: distTo(questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q } of act) {
    if (rows.length >= 6) break;
    rows.push({ key: 'q:' + q.id, q, text: q.name, cls: 'quest', why: '' });
  }
  const live = new Set();
  let prev = objHead, key = '';
  for (const r of rows) {
    live.add(r.key);
    const n = objRow(r.key);
    n.o = r.o || null; n.q = r.q || null;
    if (n.text !== r.text) { n.text = r.text; n.tx.innerHTML = chem(esc(r.text)); }
    if (n.why !== r.why) { n.why = r.why; n.wy.innerHTML = chem(esc(n.why)); n.wy.style.display = n.why ? '' : 'none'; }
    if (n.cls !== r.cls) { n.el.classList.remove('done', 'urgent', 'first', 'primary', 'quest'); if (r.cls) n.el.classList.add(...r.cls.split(' ')); n.cls = r.cls; }
    if (prev.nextSibling !== n.el) UI.objectives.insertBefore(n.el, prev.nextSibling);
    prev = n.el;
    key += `${r.key}|${r.text}|${r.why}|`;
  }
  for (const [k, n] of objNodes) if (!live.has(k)) { n.el.remove(); objNodes.delete(k); }
  objHead.style.display = rows.length ? '' : 'none';
  UI.objectives.style.display = rows.length ? '' : 'none';
  key += `${layout.rem}|${window.innerWidth}|${UI.tCandle.style.display}|${S.mode}`;
  if (key !== fitKey) { fitKey = key; fitObjectives(now); }
}
/**
 * On a phone the list has the room between the clock and the touch buttons under it, and no more: the first
 * line and its reason always show, and each further line only if all of it fits.
 */
function fitObjectives(now) {
  fitAt = now;
  const rows = [...objNodes.values()].filter((n) => n.el.parentNode);
  for (const n of rows) n.el.classList.remove('cut');
  UI.objectives.classList.remove('no-why', 'clamp');
  if (!layout.compact || !rows.length) return;
  let limit = window.innerHeight * 0.56;
  if (layout.touch) for (const b of [UI.tCam, UI.tSprint, UI.tExit, UI.tCandle]) { const r = b.getBoundingClientRect(); if (r.height > 2) limit = Math.min(limit, r.top - 8); }
  rows.sort((a, b) => (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
  const over = () => UI.objectives.getBoundingClientRect().bottom > limit;
  for (let i = rows.length - 1; i >= 1 && over(); i--) rows[i].el.classList.add('cut');
  // (a first line and a reason that both run long can be too tall on their own: the reason gives way, then the line
  // is held to two; the journal has both whole. The block never reaches the buttons under it, whatever it says.)
  if (over()) UI.objectives.classList.add('no-why');
  if (over()) UI.objectives.classList.add('clamp');
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
const cp = { w: 0, ppd: 0, cards: null, marks: [], nodes: {}, dists: {}, listAt: 0, region: null, from: new THREE.Vector3() };
onLayout(() => { cp.w = 0; });
function compassGeometry() {
  cp.w = UI.compassStrip.clientWidth;
  cp.ppd = cp.w / (HALF * 2);
  UI.compassTape.style.backgroundSize = `${(15 * cp.ppd).toFixed(2)}px 100%, ${(5 * cp.ppd).toFixed(2)}px 50%`;
  if (!cp.cards) {
    cp.cards = CARDS.map(([name, deg]) => {
      const s = el('span', null, name.length > 1 ? 'minor' : name === 'N' ? 'north' : '', UI.compassCards);
      s.textContent = name;
      return { el: s, deg, on: true, x: 0, under: false };
    });
  }
}
const wrapDeg = (d) => { d %= 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

/** The first thing on the mission list that is still to do, where its marker stands, and what that place is called. */
function leadPlace() {
  if (!S.started || S.over || S.mode === 'cutscene') return null;
  const lead = missionList().find((e) => !e.done);
  const at = lead ? objectiveWhere(lead.o) : null;
  if (!at) return null;
  const o = lead.o, of = (v, d) => (typeof v === 'function' ? v() : v || d);
  // (by the door: from outside the place to make for is the Hab, from inside the airlock)
  return { o, pos: at.pos.clone(), name: at.via === 'in' ? 'Hab' : at.via === 'out' ? 'Airlock' : of(o.place, 'Task'), icon: at.via === 'in' ? 'hab' : at.via === 'out' ? 'exit' : of(o.icon, 'target') };
}
/**
 * Everything the compass can point at, most important first. The mission's first line leads: its mark stands where
 * the marker in the world does and carries the same distance, indoors as well as out. (In the Hab during a breach
 * the strip used to name a survey site 4.6 km away, in blue, over the red banner.)
 */
function compassTargets(pp) {
  const out = [];
  const lead = leadPlace();
  const add = (id, ic, name, pos, o) => { if (!lead || groundDist(lead.pos, pos) > 3) out.push({ id, icon: ic, name, pos, cls: '', pin: false, ...o }); };
  if (lead) out.push({ id: 'lead:' + lead.icon, icon: lead.icon, name: lead.name, pos: lead.pos, cls: lead.o.urgent ? 'danger' : 'main', pin: true, lead: lead.o });
  if (S.breach.active && !(lead && lead.o.id === 'breach')) add('br', 'warning', 'Breach', S.inside ? siteLocalToWorld(World.hab, 0, 0, -HAB_R + 1, new THREE.Vector3()) : siteLocalToWorld(World.hab, 0, 1.3, 11.7, new THREE.Vector3()), { cls: 'danger', pin: true });
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) add('pf', 'dish', 'Pathfinder', World.pathfinder.position, { cls: 'main', pin: true });
  if (S.pf.loaded && !S.pf.connected) add('up', 'dish', 'Uplink', World.uplink.position, { cls: 'main', pin: true });
  if (S.flags.mavRevealed && !S.won) add('mav', 'rocket', 'MAV', World.mav.position, { cls: 'main', pin: true });
  // (the Hab's mark is its airlock door: the point the mission marker stands on when the way leads inside)
  if (!S.inside) add('hab', 'hab', 'Hab', siteLocalToWorld(World.hab, 0, 1.3, 11.7, new THREE.Vector3()), { pin: true });
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
  const pp = fromPos();
  const fq = S.mode === 'rover' ? roverF.q : player.q;
  if (!cp.w) compassGeometry();
  if (!cp.w) return;                                     // not laid out yet
  // what is out there changes slowly: refresh the list and the bearings a few times a second (or at once after a jump)
  if (now - cp.listAt > 0.2 || cp.from.distanceToSquared(pp) > 9) {
    cp.listAt = now; cp.from.copy(pp);
    cp.marks = compassTargets(pp);
    const seen = new Set();
    for (const m of cp.marks) {
      seen.add(m.id);
      m.bearing = absBearing(pp, m.pos) * R2D;
      let n = cp.nodes[m.id];
      if (!n) n = cp.nodes[m.id] = { el: el('div', null, 'mk', UI.compassMarks, icon(m.icon)), cls: null, lab: el('span', null, null, UI.compassDists, '<i></i> <b class="t-num"></b>'), text: null, shown: null, w: 0 };
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
    c.x = mid + rel * ppd;
    if (on) c.el.style.transform = `translateX(${c.x.toFixed(1)}px)`;
  }
  // where each mark stands on the strip, how far it is, and which one he is facing
  const iconW = layout.rem * (layout.compact ? 1.1 : 1.35);
  let focus = null, focusRel = 7, urgent = false;
  for (const m of cp.marks) {
    // (every frame, with the marker's and the mission line's: the lead's is the mission line's own number)
    const at = m.lead ? objectiveWhere(m.lead) : null;
    m.d = at ? at.d : distTo(m.pos);
    const rel = wrapDeg(m.bearing - heading);
    m.off = Math.abs(rel) > EDGE;
    m.rel = rel;
    m.x = mid + clamp(rel, -EDGE, EDGE) * ppd;
    m.gone = (m.lead ? (at ? at.near : 0) < 2.4 : m.d < 6) || (m.off && !m.pin);
    m.labelled = false;
    if (m.lead && m.lead.urgent && !m.gone) urgent = true;
    if (!m.gone && !m.off && Math.abs(rel) < focusRel) { focusRel = Math.abs(rel); focus = m; }
  }
  // Labels: what it is and how far. The mission's mark first, then the one he faces, then the rest while there is
  // room. A mark that gets no label is drawn as a dot, not as a picture with no name: turn to it and it says what it is.
  // (With his life in the balance, the strip names the one thing.)
  const labels = [];
  const tryLabel = (m, cls) => {
    const n = m.node, text = m.name + '|' + fmtDist(m.d);
    if (n.text !== text) { n.text = text; n.lab.firstChild.textContent = m.name; n.lab.lastChild.textContent = fmtDist(m.d); n.w = n.lab.offsetWidth; }
    const w = n.w + 6;
    const a = w >= cp.w ? mid : clamp(m.x, w / 2, cp.w - w / 2);
    for (const [l, r] of labels) if (a - w / 2 < r && a + w / 2 > l) return false;
    labels.push([a - w / 2, a + w / 2]);
    const c = cls + (m.cls ? ' ' + m.cls : '');
    if (n.labCls !== c) { n.labCls = c; n.lab.className = c; }
    n.lab.style.left = a.toFixed(1) + 'px';
    return true;
  };
  const leadMark = cp.marks.find((m) => m.lead && !m.gone);
  if (leadMark) leadMark.labelled = tryLabel(leadMark, 'focus');
  if (!urgent) {
    if (focus && !focus.labelled) focus.labelled = tryLabel(focus, 'focus');
    for (const m of cp.marks) if (!m.labelled && !m.gone) m.labelled = tryLabel(m, '');
  }
  // the marks themselves: labelled ones as their pictures (earlier ones win where two would touch), the others as dots
  const placed = [];
  for (const pass of [true, false]) {
    for (const m of cp.marks) {
      if (m.labelled !== pass) continue;
      let state = m.gone ? 'hide' : pass ? (m.off ? (m.rel < 0 ? 'off left' : 'off right') : 'on') : 'dot';
      if (state !== 'hide') {
        let near = 1e9;
        for (const px of placed) near = Math.min(near, Math.abs(px - m.x));
        if (near < iconW * (pass ? 0.6 : 0.75)) state = 'hide'; else if (pass) placed.push(m.x);
      }
      const n = m.node;
      if (state !== n.state) {
        n.state = state;
        n.el.style.display = state === 'hide' ? 'none' : '';
        n.el.classList.toggle('dot', state === 'dot');
        n.el.classList.toggle('off', state.startsWith('off'));
        n.el.classList.toggle('left', state === 'off left');
        n.el.classList.toggle('right', state === 'off right');
      }
      if (state !== 'hide') n.el.style.transform = `translateX(${m.x.toFixed(1)}px)`;
      const shown = pass && state !== 'hide';
      if (n.shown !== shown) { n.shown = shown; n.lab.style.visibility = shown ? '' : 'hidden'; }
    }
  }
  // a mark standing where a compass letter is takes its place (the Hab's icon was drawn over the N)
  for (const c of cp.cards) {
    let under = false;
    if (c.on) for (const px of placed) if (Math.abs(px - c.x) < iconW * 0.8) { under = true; break; }
    if (under !== c.under) { c.under = under; c.el.style.visibility = under ? 'hidden' : ''; }
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

const hud = { tod: null, prev: {}, rate: {}, jump: {}, text: {}, cls: {}, alerts: '', keys: null, danger: 0, cold: 0, day: null };
function setText(key, node, html) { if (hud.text[key] !== html) { hud.text[key] = html; node.innerHTML = html; } }
function setLevel(key, node, frac, warnAt, critAt) {
  const c = frac < critAt ? 'crit' : frac < warnAt ? 'warn' : '';
  if (hud.cls[key] !== c) { hud.cls[key] = c; node.classList.toggle('warn', c === 'warn'); node.classList.toggle('crit', c === 'crit'); }
  return c;
}
/** Smoothed rate of change per game second, for the gauges' trend marks. */
function track(key, value, dt) {
  const prev = hud.prev[key];
  hud.prev[key] = value;
  if (prev === undefined || dt <= 0 || dt > 1) return hud.rate[key] || 0;
  const inst = (value - prev) / dt;
  // a refill, a burn, a save loaded: not a trend. But it is news: the arrow shows which way it went for a few seconds
  // (the Hab's air had just dropped seven points and the arrow beside it pointed up, because it was already recovering)
  if (Math.abs(value - prev) > 6) { hud.jump[key] = { dir: value > prev ? 1 : -1, t: 5 }; return hud.rate[key] || 0; }
  const old = hud.rate[key] || 0;
  // a real change (stepping out of the airlock, breaking into a run, the sun going down) shows at once; jitter is smoothed
  const jump = inst * old <= 0 || Math.abs(inst) < Math.abs(old) * 0.5 || Math.abs(inst) > Math.abs(old) * 1.5;
  hud.rate[key] = jump ? inst : old + (inst - old) * (1 - Math.exp(-dt / 1.2));
  return hud.rate[key];
}
/** Minutes and seconds. */
function fmtLeft(sec) {
  sec = Math.max(0, Math.floor(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
/**
 * How long the suit's tank lasts, in seconds: what is in it, divided by what a walk uses in the conditions he is
 * in (the figure the simulation itself drains by). It is a function of the gauge and nothing else, so it cannot go
 * stale and the same gauge never reads two different times: it falls a second a second at a walk, slower standing
 * still, faster at a run, and it rises only when the tank does (or when the cold lets go of the suit's heater).
 * (It was once the tank over a smoothed rate of fall: that climbed as he stood still, and, made to only count
 * down, it read 2:25 beside a full tank.)
 */
export function suitTimeLeft() { return S.suit / suitDrain('walk'); }

export function updateHud() {
  syncFlags();                        // (first, so that everything below measures the HUD as it is now showing)
  // game seconds since the last update, from the planet's clock (so it is right when the game is stepped by tests)
  let dt = 0;
  if (hud.tod !== null) { let d = S.tod - hud.tod; if (d < -0.5) d += 1; dt = d * BAL.solLen; }
  hud.tod = S.tod;
  const sunEl = localSunEl();
  const t = localTempC(_v1.copy(player.pos).normalize(), sunEl);
  const safeAir = S.inside && S.o2 > 3;
  const narrow = layout.compact && window.innerWidth <= 760;

  // --- suit oxygen: the number that kills you ---
  const cap = suitCap(), sf = S.suit / cap;
  const suitRate = track('suit', S.suit, dt);
  setText('suit', UI.suitNum, String(Math.round(S.suit)));
  const off = (100 - clamp(sf, 0, 1) * 100).toFixed(1);
  if (hud.text.suitArc !== off) { hud.text.suitArc = off; UI.suitArc.style.strokeDashoffset = off; }
  const filling = suitRate > 0.5;
  const suitCls = filling ? 'fill' : sf < 0.12 ? 'crit' : (sf < 0.25 || S.flags.coldOpen) ? 'warn' : '';
  if (hud.cls.suit !== suitCls) { hud.cls.suit = suitCls; UI.suit.className = 'suit' + (suitCls ? ' ' + suitCls : ''); }
  // under the dial: where the air is coming from, or, while the tank is all there is, how long it lasts
  let st;
  if (filling) st = 'Refilling';
  else if (S.mode === 'rover') st = S.roverO2 > 0 ? 'Rover air' : 'Tank empty';
  else if (safeAir) st = 'Hab air';
  else st = S.suit > 0 ? `${fmtLeft(suitTimeLeft())} left` : 'Empty';
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
    if (hud.text[k + 'f'] !== f) { hud.text[k + 'f'] = f; b.fill.style.transform = `scaleX(${f})`; b.wrap.style.setProperty('--f', f); }
    setText(k, b.val, txt);
    setLevel(k, b.wrap, frac, k === 'morale' ? 0.3 : 0.22, k === 'morale' ? 0.12 : 0.1);
    if (raw !== null) {
      const r = track(k, raw, dt), j = hud.jump[k];
      if (j && (j.t -= dt) <= 0) hud.jump[k] = null;
      const tr = hud.jump[k] ? (j.dir > 0 ? 'up' : 'dn') : r > 0.0015 ? 'up' : r < -0.0015 ? 'dn' : '';
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

  // --- rover: both reserves as a share of what they hold (a bare "300" beside a bare "100" said nothing) ---
  if (S.mode === 'rover') {
    setText('rspd', UI.roverSpeed, String(Math.round(Math.abs(roverF.speed) * 3.6)));
    const pf = S.roverPower / roverPowerCap(), of = S.roverO2 / BAL.roverO2Cap;
    const a = UI.roverBars.pwr, b = UI.roverBars.o2;
    a.fill.style.transform = `scaleX(${clamp(pf, 0, 1).toFixed(3)})`; a.wrap.style.setProperty('--f', clamp(pf, 0, 1).toFixed(3));
    b.fill.style.transform = `scaleX(${clamp(of, 0, 1).toFixed(3)})`; b.wrap.style.setProperty('--f', clamp(of, 0, 1).toFixed(3));
    setText('rpwr', a.val, `${Math.round(pf * 100)}<small>%</small>`);
    setText('ro2', b.val, `${Math.round(of * 100)}<small>%</small>`);
    setLevel('rpwr', a.wrap, pf, 0.2, 0.08);
    setLevel('ro2', b.wrap, of, 0.2, 0.08);
  }

  // --- alerts: at most two, worst first. Each says what is wrong and what to do (in fewer words where the screen is narrow) ---
  const al = [];
  if (S.breach.active) al.push(['crit', 'warning', 'Hab breach', 'seal it before the air is gone', 'seal the far wall']);
  if (!filling && !safeAir && S.mode !== 'rover') {
    if (sf < 0.12) al.push(['crit', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> critical', 'get to air now', 'get to air now']);
    else if (sf < 0.25) al.push(['warn', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> low', 'head for the Hab or the rover', 'get to the Hab or rover']);
  }
  if (S.mode === 'rover' && S.roverPower / roverPowerCap() < 0.1) al.push(['warn', 'battery', 'Rover battery low', 'park in daylight to recharge', 'park it in the sun']);
  if (S.storm.i > 0.15) {
    // (what the storm is doing depends on where it is: over the Hab it starves the panels, out here it only blinds)
    const atHab = stormIntensityAt(World.hab.position) > 0.15;
    al.push(['warn', 'storm', 'Dust storm', atHab ? 'solar power is down' : 'keep the Hab in sight', atHab ? 'solar power is down' : 'keep your bearings']);
  }
  if (t < -85 && !S.inside && S.mode !== 'rover') al.push(['cold', 'cold', 'Extreme cold', 'the suit heater is drawing <span class="chem">O<sub>2</sub></span>', 'the heater burns more <span class="chem">O<sub>2</sub></span>']);
  const critical = al.some((a) => a[0] === 'crit');
  if (critical !== UI.critical) { UI.critical = critical; root.classList.toggle('is-critical', critical); }
  const alKey = al.slice(0, 2).map((a) => a[2] + a[3]).join('|') + narrow;
  if (alKey !== hud.alerts) {
    hud.alerts = alKey;
    const nAl = Math.min(al.length, 2);                                               // toasts sit below however many alerts there are
    root.style.setProperty('--al', nAl);
    root.style.setProperty('--al2', Math.max(0, nAl - 1));
    root.classList.toggle('has-alert', nAl > 0);                                      // (on a phone a banner takes the region label's place)
    UI.alerts.innerHTML = al.slice(0, 2).map(([cls, ic, title, note, short]) => `<div class="alert ${cls}">${icon(ic)}<span>${title}</span><small>${narrow ? short : note}</small></div>`).join('');
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
  // the first minute teaches moving (on a phone the two hints go once he has walked: they sat on the prompt at the airlock); after that, the screens
  const keys = S.flags.coldOpen
    ? (layout.touch ? (S.stats.walked > 8 ? '' : ':Left thumb moves|:Drag to look') : 'W A S D:Move|Shift:Run|Mouse:Look|E:Interact (hold)')
    : (S.mode === 'rover' ? 'F:Exit rover|' : '') + (candles > 0 ? `X:Candle × ${candles}|` : '') + (S.sol <= 2 ? SCREEN_UNLOCKS.filter((s) => s.key && S.flags[s.flag]).sort((a, b) => 'MCJ'.indexOf(a.key) - 'MCJ'.indexOf(b.key)).map((s) => `${s.key}:${s.name}|`).join('') : '') + 'Esc:Menu';
  const keyState = keys + '#' + candles;
  if (keyState !== hud.keys) {
    hud.keys = keyState;
    UI.keys.innerHTML = keys ? keys.split('|').map((k) => {
      const [a, b] = k.split(':');
      return `<span>${b}${a.split(' ').filter(Boolean).map((x) => `<kbd class="mg-kbd">${x}</kbd>`).join('')}</span>`;
    }).join('') : '';
    UI.tCandle.style.display = candles > 0 ? '' : 'none';
    UI.tCandle.querySelector('b').textContent = candles;
  }
}
