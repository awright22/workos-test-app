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
import { UI, chem, el, esc, measureVitals, playTime, root, runAfter, syncFlags, toast, toastsIdle } from './dom.js';
import { interaction } from '../game/interact.js';
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
  if (!empty) return { why: 'The rations will not last until the rescue.' };
  // (how many he carries, here on the HUD: the only count had been "(you carry 0)" in the prompt at the heap)
  const n = S.inv.regolith || 0;
  if (n > 0) return { bed: empty, why: `You carry ${n} load${n === 1 ? '' : 's'} of regolith: fill an empty bed.` };
  let heap = null, best = 1e9;
  for (const h of World.soilPiles) { if (h.left <= 0) continue; const d = distTo(h.group.position); if (d < best) { best = d; heap = h; } }
  return heap ? { heap, why: 'Beds need regolith. Dig it at the heap outside the airlock.' } : { why: 'The heaps are spent. Dig regolith anywhere outside, slowly.' };
}
/** The solar panel with the most dust on it, if that is at least `least` (0..1); else null. */
const dustiestPanel = (least) => { const p = World.panels.reduce((a, b) => (!a || b.dust > a.dust ? b : a), null); return p && p.dust >= least ? p : null; };
/**
 * What there is to do, in the order it is offered. Each has the place its marker stands on (`pos`), the reason it
 * matters (`why`, a line or a function), when it is on the list (`shown`) and when it is ticked off (`done`).
 * `urgent` things (his life) lead the list in red; `press` marks one that leads when its moment comes (night, a
 * flat battery).
 *
 * A title is what to do, in few enough words to stand on one line of a phone's list (tests/ui.mjs measures every
 * one): where it is done is the `place`, which the list gives on a line of its own with the distance. (With the place
 * in the title and the distance beside it, every title on a phone ran to two lines.) An emergency's title is the
 * instruction: the banner at the top of the screen has already said what is wrong, and the two used to say it twice.
 */
export const OBJECTIVES = [
  { id: 'reach', urgent: true, place: 'Airlock', icon: 'hab', text: () => 'Suit breach: get to the Hab', why: 'The suit is losing air. Seal it at the airlock door.',
    pos: () => habPoint(0, 1.3, 11.7), shown: () => true, done: () => S.flags.suitSealed },
  // out of doors with a quarter of a tank left: nothing else is the mission until he is breathing something else
  { id: 'air', urgent: true, text: () => (S.suit < suitCap() * 0.12 ? 'Run for air' : 'Get to air'), why: () => (airAtRover() ? 'The rover has air: get in and the suit refills.' : 'The airlock refills the suit. An empty tank is the end.'),
    place: () => (airAtRover() ? 'Rover' : 'Hab'), icon: () => (airAtRover() ? 'rover' : 'hab'),
    pos: () => (airAtRover() ? above(World.rover.group.position, 1.6) : habPoint(0, 1.3, 11.7)),
    shown: () => !S.flags.coldOpen && S.mode === 'walk' && !S.inside && !S.inAirlock && S.suit < suitCap() * 0.25, done: () => false },
  // (its place is named for where it is: with the banner, the title, the place, the compass and the prompt all saying
  //  "breach", the screen said it six times)
  // (one name for where it is: the reason said "behind the comms desk" while the place said "far wall")
  { id: 'breach', urgent: true, place: 'Desk wall', icon: 'warning', text: () => 'Seal the breach', why: 'In the wall behind the comms desk. Hold to patch it.',
    pos: () => habPoint(0, 1.6, -HAB_R + 0.5), shown: () => S.breach.active, done: () => !S.breach.active },
  // (nothing said it was time to sleep: at 20:16 and 89 below, the list still led with the solar panels)
  { id: 'sleep', press: () => true, place: () => (farAfield() ? 'Rover' : 'Bunk'), text: () => (S.mode === 'rover' || farAfield() ? 'Camp until dawn' : 'Sleep until dawn'),
    why: 'The night is deadly cold. Sleep skips to dawn and mends you.',
    pos: () => (S.mode === 'rover' ? null : farAfield() ? above(World.rover.group.position, 1.6) : habPoint(-5.0, 1.1, -4.9)), shown: bedtime, done: () => false },
  { id: 'systems', place: () => (S.checkedSystems.oxy ? 'Reclaimer' : 'Oxygenator'), text: () => `Inspect both machines (${Object.keys(S.checkedSystems).length} of 2)`, why: 'The oxygenator and the reclaimer make your air and your water.',
    pos: () => (S.checkedSystems.oxy ? habPoint(5.9, 1.4, -0.4) : habPoint(5.6, 1.4, -3.6)), shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', place: 'Comms desk', text: () => 'Check the numbers', why: 'How long will the food last?',
    pos: () => habPoint(0, 1.3, -6.6), shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  // (a reserve in the red is a task, not only a red row: the water stood boxed in red at 9 L with nothing on the list)
  { id: 'lowwater', press: () => true, place: () => (S.hydrazine > 0 ? 'Rig' : 'Fabricator'), text: () => 'Make water',
    why: () => (S.hydrazine > 0 ? 'The tank is nearly dry. Burn hydrazine at the rig.' : (S.inv.ice || 0) > 0 ? 'The tank is nearly dry. Melt ice at the fabricator.' : 'The tank is nearly dry. Mine ice, and melt it at the fabricator.'),
    pos: () => (S.hydrazine > 0 ? habPoint(4.2, 1.3, 2.6) : habPoint(-4.75, 1.3, 4.2)), shown: () => !!S.flags.suitSealed && S.water < 12, done: () => false },
  // (and so is the battery, once the first panels task is behind him: the power stood amber at 18% with nothing on
  //  the list. Dusty panels are the usual cause and the cure is in reach; if they are clean, it is the night.)
  { id: 'lowpower', press: () => true, place: () => (dustiestPanel(0.25) ? 'Panels' : 'Hab'), text: () => (dustiestPanel(0.25) ? 'Wipe the solar panels' : 'Spare the Hab’s power'),
    why: () => (dustiestPanel(0.25) ? 'The Hab is low on power: dust on the panels is starving it.' : 'The Hab is low on power. The panels charge it by day; melting ice and fabricating draw it down.'),
    pos: () => { const p = dustiestPanel(0.25); return p ? above(p.group.getWorldPosition(_wv), 1.2) : null; },
    shown: () => !!S.flags.suitSealed && S.power < 20 && S.stats.panels >= 3, done: () => false },
  { id: 'water', place: 'Farm bed', text: () => 'Water the stalled beds', why: 'A bed stops at half grown until it is watered again.',
    pos: () => { const p = World.plots.find(thirsty); return p ? above(p.worldPos, 0.9) : null; }, shown: () => World.plots.some(thirsty), done: () => false },
  // "farm or starve" is the premise: the farm leads until three beds are in, whatever else has joined the list
  { id: 'farm', place: () => (farmStep().heap ? 'Heap' : 'Farm bed'), text: () => `Plant three farm beds (${Math.min(plantedPlots(), 3)} of 3)`, why: () => farmStep().why,
    pos: () => { const f = farmStep(); return f.bed ? above(f.bed.worldPos, 0.9) : f.heap ? above(f.heap.group.position, 1.1) : null; },
    shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'hydra', place: 'Rig', text: () => 'Make water: burn hydrazine', why: 'A burn makes 28 L for the beds. The first may cost a little Hab air.',
    pos: () => habPoint(4.2, 1.3, 2.6), shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'panels', place: 'Panels', press: () => S.power < 45, text: () => `Wipe the solar panels (${Math.min(S.stats.panels, 3)} of 3)`, why: 'Dust on the panels starves the Hab of power.',
    pos: () => { const p = World.panels.reduce((a, b) => (!a || b.dust > a.dust ? b : a), null); return p ? above(p.group.getWorldPosition(_wv), 1.2) : null; },
    shown: () => !!S.flags.suitSealed && (plantedPlots() > 0 || S.sol > 1 || S.power < 55), done: () => S.stats.panels >= 3 },
  { id: 'pf', place: () => (S.pf.loaded ? 'Uplink' : 'Pathfinder'), icon: 'dish', text: () => (S.pf.loaded ? 'Bring Pathfinder home' : 'Drive to Ares Vallis'), why: () => (S.pf.loaded ? 'Park the rover on the ring by the Hab and connect it.' : 'Pathfinder’s radio is the only way to tell Earth you are alive.'),
    pos: () => above(S.pf.loaded ? World.uplink.position : World.pathfinder.position, 2), shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', place: 'Farm bed', text: () => 'Bring in the first harvest',
    why: () => (World.plots.some((p) => p.state === 'ready') ? 'A bed is ripe: bring it in.' : 'Beds take about two and a half sols, and a second watering.'),
    pos: () => { const p = World.plots.find((x) => x.state === 'ready'); return p ? above(p.worldPos, 0.9) : null; },
    shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 || S.stats.produce > 0 },
  { id: 'dinner', place: 'Food shelf', text: () => 'Cook a dinner', why: 'A cooked meal lifts morale; in good spirits work goes faster.',
    pos: () => habPoint(4.2, 1.4, 4.8), shown: () => S.stats.produce > 0, done: () => !!(S.diet && S.diet.meals > 0) },
  // (its reason says what the day brings: with "the Hermes is coming back" alone, nothing on the card said that a
  //  drive stands between him and the rescue)
  { id: 'survive', text: () => `Survive to Sol ${S.rescueSol}`, why: () => `The MAV can launch then: ${fmtDist(groundDist(World.hab.position, World.mav.position))} from the Hab, in Schiaparelli.`,
    shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', place: 'MAV', icon: 'rocket', text: () => 'Drive to Schiaparelli', why: 'The MAV there is the only rocket on Mars.',
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
/**
 * The mission as the HUD gives it: the list, with the task in hand brought up to its second line. Standing at a thing
 * that belongs to a task further down the list (wiping a panel, at the rig) puts that task under the first, marked
 * "here", while he is there. The first line does not change: it is what the card, the marker and the compass lead
 * with until it is done. (First the card went on saying "Plant three farm beds" through every other chore, and
 * nothing on the HUD said why he was at the rig. Then the task in hand took the first line, and two reviews running
 * found the lead following his feet: planting, then panels at the panels, then water at the rig, then planting
 * again, as if each had been dropped for the next.) Under a red task nothing is brought up.
 */
function hudList() {
  const list = missionList();
  inHand = '';
  const i = list.findIndex((e) => !e.done);
  if (i < 0) return list;
  // (in hand: he is standing at a thing he can work now, and it belongs to a task that is on the list)
  const it = interaction.active, t = it && it.task, id = typeof t === 'function' ? t() : t;
  if (!id) return list;
  let can = false;
  try { can = !it.enabled || it.enabled() === true; } catch (e) { /* nothing of its kind in reach */ }
  const j = can ? list.findIndex((e) => !e.done && e.o.id === id) : -1;
  if (j < 0 || (j > i && list[i].o.urgent)) return list;
  if (j > i + 1) list.splice(i + 1, 0, list.splice(j, 1)[0]);
  inHand = id;
  return list;
}
/** The task in hand, if there is one: its place is where he stands (the marker is put away and the list says "here"). */
let inHand = '';
let leadMemo = null, leadAt = -1;
/**
 * The first thing still to do, as the card, the marker and the compass all lead with it: one answer a frame.
 * Whether it is a red one is published for the prompt system (game/interact.js), which offers nothing ambient then.
 */
export function leadTask() {
  const t = playTime();
  if (t !== leadAt) { leadAt = t; leadMemo = hudList().find((e) => !e.done) || null; UI.urgentTask = !!(leadMemo && leadMemo.o.urgent); }
  return leadMemo;
}
const _wh = { pos: new THREE.Vector3(), d: 0, near: 0, via: '', on: 0, show: 0 };
/**
 * Where the marker for an objective stands and how far there is to go: { pos, d, near, via, on, show }, or null when
 * it has no place. The Hab has one way in. From outside, a thing inside it is marked at the airlock door, with the
 * distance to the door (the same point and the same number as the compass's Hab mark). From inside, a thing outside
 * is marked at the inner door: `near` is the walk to the door, `on` the walk on from there, and `d` the two together.
 * `show` is the distance the marker and the first line of the list give: to the door from inside, since the door is
 * what they point at ("AIRLOCK · 12 m, then HEAP 34 m"), and `d` otherwise.
 */
export function objectiveWhere(o) {
  const p = o.pos ? o.pos() : null;
  if (!p) return null;
  _wh.pos.copy(p);
  const from = fromPos(), hab = World.hab.position, onFoot = S.mode === 'walk';
  // (the task in hand is here, whichever of its things the list would have sent him to: wiping one panel, the card
  //  gave the distance to another, the dustiest)
  if (o.id === inHand) { _wh.pos.copy(from); _wh.via = ''; _wh.on = _wh.d = _wh.near = _wh.show = 0; return _wh; }
  const pIn = groundDist(_wh.pos, hab) < HAB_R - 0.3;
  const meIn = onFoot && S.inside && groundDist(from, hab) < HAB_R;
  _wh.via = ''; _wh.on = 0;
  if (pIn && !meIn && !(onFoot && S.inAirlock)) { siteLocalToWorld(World.hab, 0, 1.3, 11.7, _wh.pos); _wh.d = _wh.near = groundDist(from, _wh.pos); _wh.via = 'in'; }
  else if (!pIn && meIn) { _wh.on = groundDist(siteLocalToWorld(World.hab, 0, 1.3, HAB_R - 0.9, _door), _wh.pos); _wh.pos.copy(_door); _wh.near = groundDist(from, _door); _wh.d = _wh.near + _wh.on; _wh.via = 'out'; }
  else _wh.d = _wh.near = groundDist(from, _wh.pos);
  _wh.show = _wh.via === 'out' ? _wh.near : _wh.d;
  return _wh;
}
/** How far an objective is, all the way: what the journal and the lines under the first give. */
export function objectiveDist(o) { const w = objectiveWhere(o); return w ? fmtDist(w.d) : ''; }
/** What an objective's own place is called. */
const placeOf = (o) => (typeof o.place === 'function' ? o.place() : o.place) || '';
/**
 * What the place the first line's distance is measured to is called. From outside, a thing in the Hab is "Hab": the
 * distance is to its door. From inside, a thing outside is reached by the airlock, and the line says so: "AIRLOCK"
 * with the distance to the door, and then the thing itself with the rest of the walk (objectiveThen). (The whole
 * walk under the thing's own name, "HEAP 46 m", was a straight line through the wall with nothing to say where the
 * way out was; before that the whole walk stood under the airlock's name, 46 m to a door 13 m away.)
 */
export function objectivePlace(o, where) {
  const w = where || objectiveWhere(o);
  if (!w) return '';
  return w.via === 'in' ? 'Hab' : w.via === 'out' ? 'Airlock' : placeOf(o);
}
/** What comes after the door, for a thing outside seen from inside: [its name, how far on], or null. */
export function objectiveThen(o, where) {
  const w = where || objectiveWhere(o);
  return w && w.via === 'out' ? [placeOf(o) || 'Outside', fmtDist(w.on)] : null;
}
export const objDone = new Set();
let objSeeded = false, objThrottle = 0, objCalls = 0, objHead = null, sleepTold = false, fitKey = '', fitAt = 0, whyKey = '', whyAt = -1e9, objTap = false, objLead = null;
/** How long the reason under the first line stays open on a phone, in seconds of play, after it changes or is asked for. */
const WHY_OPEN = 9;
const objFrom = new THREE.Vector3();
const objNodes = new Map();          // row key -> { el, tx, at, pl, ds, wy, o, q, text, lead, place, dist, cls, why }
const objDoneAt = {};                // objective id -> time it was completed (shown ticked for a moment)
function objRow(key) {
  let n = objNodes.get(key);
  if (!n) {
    // (the place and the distance are one piece: beside the title on a wide list, on a line of their own under it on a phone's)
    const e = el('div', null, 'obj new', UI.objectives, '<i class="mk"></i><span class="tx"></span><span class="at"><span class="pl"></span><span class="ds t-num"></span><span class="nx"></span></span><span class="why"></span>');
    n = { el: e, tx: e.querySelector('.tx'), at: e.querySelector('.at'), pl: e.querySelector('.pl'), ds: e.querySelector('.ds'), nx: e.querySelector('.nx'), wy: e.querySelector('.why'), o: null, q: null, text: null, place: null, dist: null, then: null, cls: null, why: null };
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
// Where the panel of gauges ends. On a phone the log and the cards stand a fixed gap under it; the style sheet used to
// work the panel's height out from its parts, and was 2 or 3 px short, so that gap was 5 px where 8 was meant. Now
// the panel is measured, whenever its size changes (the bars arriving, a new scale) and before the next paint.
if (typeof ResizeObserver === 'function') new ResizeObserver(measureVitals).observe(UI.vitals);
onLayout(() => requestAnimationFrame(measureVitals));
/** The boxes of everything on the HUD that is showing now (kind 0), the prompt and the rover's panel (1), and the figure in the middle (2). */
function readZones(w, h) {
  zones.length = 0;
  const add = (n, kind) => { if (!n) return; const r = n.getBoundingClientRect(); if (r.width > 2 && r.height > 2) zones.push([r.left, r.top, r.right, r.bottom, kind]); };
  for (const n of [UI.vitals, UI.compass, UI.region, UI.alerts, UI.tr, UI.log, UI.toasts.firstElementChild, UI.keys, UI.joy, UI.tJump, UI.tExit, UI.tSprint, UI.tCam, UI.tCandle, UI.tRow]) add(n, 0);
  if (UI.tE.classList.contains('verb') || UI.tE.classList.contains('no')) add(UI.tE, 0);      // (with nothing in reach the action button is not shown)
  if (UI.prompt.classList.contains('on') && !UI.prompt.classList.contains('rest')) add(UI.prompt, 1);       // (it is hidden, not removed, so it always has a box)
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
    const lead = leadTask();
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
          // (For a place off the screen the arrow keeps to the screen's edge: it used to give way inward as far as
          //  a third of the way from the middle, and three reviews found an arrowhead floating in the picture with
          //  nothing to say what it was. At the edge it is an edge marker; in the middle it was a stray glyph.)
          for (let r = inView && !k ? Math.min(1, Math.hypot(dx, dy) / t) : 1; r >= (inView ? 0.3 : 0.88); r -= 0.07) {
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
    // (off the screen it turns no more than fifty degrees from the true way to find room: further round than that it
    //  points somewhere else, and the compass and the task card already say where)
    if (!(inView ? seek(2, 12) || seek(1, 12) || seek(1, 22) : seek(2, 6) || seek(1, 6))) { if (wayShown) { wayShown = false; wayEl.style.display = 'none'; } return; }
  }
  // (On the place, the marker carries how far it is. At the edge of the screen it is an arrowhead and no more: the
  //  first line of the list has the distance, and an arrow with a number in a box under the compass's own tag was the
  //  same figure a third time.)
  const tag = off ? '' : fmtDist(at.show);
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
 * Nothing is on the HUD before it has been met. Each of the six bars arrives with the thing it measures, and each of
 * the three screens when it first has something to show; each comes with a card that says in a line what it is, and
 * is lit for exactly as long as that card is up (ui/dom.js, toast). A flag, once set, is saved with the game.
 *
 * (All six bars used to arrive together on the Hab's threshold, explained by a guide he had to open; and the three
 * buttons were lit on a timer of their own, out of step with their cards.)
 *
 * A bar is never kept back when it matters: one that is running low is shown at once, and a run past its first dawn
 * has them all.
 */
// (A card's third text is for a phone, where a card holds two short lines: the long one was cut there in the middle
//  of the sentence that said what a full bar means, "enough to...")
export const BAR_UNLOCKS = [
  // (the two machines: the card each inspection puts up names its bar, and is the bar's card; game/interactables.js)
  { id: 'o2', flag: 'barO2', when: () => !!S.checkedSystems.oxy || S.o2 < 40 },
  { id: 'water', flag: 'barWater', when: () => !!S.checkedSystems.rec || S.water < 26 },
  { id: 'food', flag: 'barFood', when: () => !!S.flags.didMath || foodTotal() < 4,
    card: () => ['Food', 'Meals left: breakfast takes one each dawn, two with a side. The bar is full when there is enough to reach the rescue.', 'Meals left. Full means enough to reach the rescue.'] },
  { id: 'power', flag: 'barPower', when: () => plantedPlots() > 0 || S.stats.panels > 0 || S.power < 55,
    card: () => ['Power', 'The Hab’s battery. Sun on clean panels fills it; the machines and the night drain it.', 'The Hab’s battery. Clean panels fill it by day.'] },
  { id: 'health', flag: 'barHealth', when: () => S.health < 96 || bedtime(),
    card: () => ['Vitals', 'Your body. Air, water, food and sleep keep it up. At zero the run is over.', 'Your body. Air, water, food and sleep keep it up.'] },
  { id: 'morale', flag: 'barMorale', when: () => S.sol > 1 || S.morale < 40,
    card: () => ['Morale', 'Your spirits, out of 100. Variety on the plate, music and comforts lift them. High, work goes faster.', 'Your spirits, out of 100. Low, work goes slower.'] },
];
/**
 * The three screens, in the order they arrive: the Journal with the numbers (it holds the tasks and the way home),
 * the Map on first stepping out after that, the Colony with the first thing he carries (it is where his stores are).
 * Their buttons stand in that order from the menu leftward (ui/dom.js), so a new one never moves the others.
 */
export const SCREEN_UNLOCKS = [
  // (a line short enough to stand whole on the smallest phone's card: the longer ones were cut to "Your stores, the
  //  fabricator and…")
  { id: 'journal', flag: 'uiJournal', name: 'Journal', key: 'J', line: 'Tasks, finds and the way home.',
    when: () => !!S.flags.didMath },
  { id: 'map', flag: 'uiMap', name: 'Map', key: 'M', line: 'All of Mars, with distances.',
    when: () => !!S.flags.didMath && (!S.inside || !!S.flags.pfRevealed) },
  { id: 'colony', flag: 'uiColony', name: 'Colony', key: 'C', line: 'What you carry, and the fabricator.',
    when: () => !!S.flags.didMath && Object.keys(S.inv).some((k) => S.inv[k] > 0) },
];
export function screenUnlocked(id) { const s = SCREEN_UNLOCKS.find((x) => x.id === id); return !s || !!S.flags[s.flag]; }
let unlocksSeeded = false, barsShown = -1;
const shownScreens = {}, shownBars = {};
/** A screen whose card is waiting its turn: when it began to wait, in seconds (0: not waiting). */
const screenWaits = {};
function updateUnlocks() {
  if (!S.started) return;
  // (uiBars: a save from when the six came together, or a run whose opening was skipped: it has them all, and none
  //  is news. Past the first dawn the rest come too, and of those only one that is met that moment has a card.)
  const ready = !S.flags.coldOpen, legacy = !!S.flags.uiBars, late = S.sol > 1;
  let bars = 0;
  for (const b of BAR_UNLOCKS) {
    if (!S.flags[b.flag] && ready) {
      const met = b.when();
      if (met || legacy || late) {
        S.flags[b.flag] = true;
        // (what a loaded game already had is not news)
        if (unlocksSeeded && b.card && met && !legacy) { const c = b.card(); toast('NEW', c[0], layout.compact ? c[2] : c[1], { lit: UI.bars[b.id].wrap, life: 7000 }); Snd.jingle(); }
      }
    }
    const on = !!S.flags[b.flag];
    if (on) bars++;
    if (shownBars[b.id] !== on) { shownBars[b.id] = on; UI.bars[b.id].wrap.hidden = !on; }
  }
  if (bars !== barsShown) { barsShown = bars; root.classList.toggle('no-bars', !bars); root.classList.toggle('few-bars', bars > 0 && bars < 4); measureVitals(); }
  for (const s of SCREEN_UNLOCKS) {
    if (!S.flags[s.flag] && ready && (S.sol > 1 || s.when())) {
      S.flags[s.flag] = true;
      if (unlocksSeeded) {
        // (The button arrives with its card. A card waits its turn behind whatever is up, and the button used to be
        //  there already, unlit and unexplained, beside a card about something else. It waits at most a quarter of a
        //  minute: a card that never comes must not keep a screen from him.)
        screenWaits[s.id] = perf();
        if (!toast('NEW', s.name, layout.touch ? s.line : `${s.line} Press ${s.key}.`, { lit: UI.tRow.querySelector(`[data-t="${s.id}"]`), life: 7000, shown: () => { screenWaits[s.id] = 0; shownScreens[s.id] = true; root.classList.remove('no-' + s.id); } })) screenWaits[s.id] = 0;      // (shown in the same instant as the card, not a frame later)
        Snd.jingle();
      }
    }
    if (screenWaits[s.id] && perf() - screenWaits[s.id] > 15) screenWaits[s.id] = 0;
    const there = !!S.flags[s.flag] && !screenWaits[s.id];
    if (shownScreens[s.id] !== there) { shownScreens[s.id] = there; root.classList.toggle('no-' + s.id, !there); }
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
  // (or eighteen frames, whichever comes first: a game stepped by its debug hook runs many frames in no time at all, and a
  //  list rebuilt by the clock alone was left showing "get to air" beside a full tank in the pictures taken that way)
  // (or at once when what leads has changed: the marker and the compass follow the first task every frame, and for a
  //  third of a second the card beside them named the task before: at nightfall the marker stood on the Hab's door
  //  under a card that still said HEAP)
  // (and its own words are part of what leads: "0 of 2" stood under a place that had already moved on to the second machine)
  const lead = leadTask(), lk = lead ? `${lead.o.id}|${lead.o.text()}` : '';
  if (lk !== objLead || now - objThrottle >= 0.3 || ++objCalls >= 18 || objFrom.distanceToSquared(from) > 9) { objLead = lk; objThrottle = now; objCalls = 0; objFrom.copy(from); rebuildObjectives(now); }
  let refit = false;
  for (const n of objNodes.values()) {
    let dist = '', place = n.place || '';
    let then = '';
    if (n.cls !== 'done') {
      // (the first line's place is named in the same frame as its distance is measured: the name belongs to the number.
      //  Named only when the list was next rebuilt, the line read "FARM BED 34 m" for a moment with the heap's distance.)
      if (n.o) {
        const w = objectiveWhere(n.o);
        // (on the place itself the first line says so: "RIG · 0 m" read as a reading gone wrong)
        dist = !w ? '' : (n.lead || n.o.id === inHand) && !w.via && w.near < 2.4 ? 'here' : fmtDist(n.lead ? w.show : w.d);
        if (n.lead) { place = objectivePlace(n.o, w); const t = objectiveThen(n.o, w); if (t) then = `then <b>${esc(t[0])}</b> ${t[1]}`; }
      } else if (n.q) { const p = questTargetPos(n.q); dist = p ? fmtDist(distTo(p)) : ''; }
    }
    if (n.place !== place) { n.place = place; n.pl.textContent = place; }
    if (n.dist !== dist) { n.dist = dist; n.ds.textContent = dist; }
    if (n.then !== then) { n.then = then; n.nx.innerHTML = then; refit = true; }
    const show = dist || place ? '' : 'none';
    if (n.at.style.display !== show) { n.at.style.display = show; refit = true; }
  }
  // (a line that gains or loses its place and distance, or its "then", changes the block's height here, between two
  //  rebuilds: the block is fitted again at once and not at the next second. Left to the clock, the small phone
  //  showed a second line cut through by the buttons under it for up to a second, and the audit caught it twice.)
  if (refit || now - fitAt > 1) fitObjectives(now);
}
function rebuildObjectives(now) {
  if (!objHead) objHead = el('div', null, 'hd', UI.objectives, '<span>Mission</span><b></b>');
  // (on a touch screen the block is pressed to bring the reason under its first line back)
  if (!objTap && layout.touch) {
    objTap = true;
    UI.objectives.addEventListener('click', () => { whyAt = playTime(); fitKey = ''; rebuildObjectives(perf()); });
  }
  const list = hudList();
  for (const e of list) {
    const id = e.o.id;
    if (e.done && !objDone.has(id)) {
      objDone.add(id);
      // objectives already complete when a saved game loads are not news
      if (objSeeded) {
        // (the suit sealed is not shown ticked: that moment has the flash, the dial filling and the next thing to do,
        //  and the struck-through line was one thing too many to read)
        if (id !== 'reach') { objDoneAt[id] = now; Snd.jingle(); }
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
  if (ticked) rows.push({ key: ticked.o.id, o: ticked.o, text: ticked.o.text().replace(/ \(\d+ of \d+\)$/, ''), cls: 'done', why: '' });
  // (a phone shows what to do next and one thing more; the journal has the whole list)
  let primary = false;
  const most = (layout.compact ? 2 : 4) + rows.length;
  for (const e of list) {
    if (rows.length >= most) break;
    if (just(e)) continue;
    if (e.done) { if (e.o.id === 'mav') rows.push({ key: e.o.id, o: e.o, text: e.o.text(), cls: 'done', why: '' }); continue; }
    // the one thing to do next is marked, and carries its reason
    let cls = e.o.urgent ? 'urgent' : '', why = '';
    let lead = false;
    if (!primary) { primary = lead = true; cls = e.o.urgent ? 'urgent first' : 'primary'; why = objectiveWhy(e.o); }
    rows.push({ key: e.o.id, o: e.o, text: e.o.text(), cls, why, lead });
  }
  // night: said once as it falls, as well as listed
  // (not when he is already standing at the bunk: there the task, the prompt and the button say it, and the card was a fourth)
  const night = list.some((e) => e.o.id === 'sleep');
  // (and not on a phone, where the task card sixty pixels away has just turned to "Sleep until dawn": there it was the same thing said twice)
  if (night && !sleepTold && objSeeded && !layout.compact) { const w = objectiveWhere(list.find((e) => e.o.id === 'sleep').o); if (!w || w.near > 6) toast('Night', 'Time to sleep', '', { yields: true }); }
  sleepTold = night;
  objSeeded = true;
  // the two nearest active survey tasks
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: distTo(questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q } of act) {
    if (rows.length >= (layout.compact ? 2 : 6)) break;
    rows.push({ key: 'q:' + q.id, q, text: q.name, cls: 'quest', why: '' });
  }
  // On a phone the reason under the first line is news, not furniture: it stays while it is new (a new task, or a
  // new step of the same one) and then the card closes to its title and its place; a press on the card opens it
  // again. (Open always, the card was a hundred pixels of a small screen, and its grey detail was read once.)
  const head = rows.find((r) => r.lead), hk = head ? `${head.key}|${head.why}` : '';
  if (hk !== whyKey) { whyKey = hk; whyAt = playTime(); }
  const whyOpen = !layout.compact || playTime() - whyAt < WHY_OPEN;
  UI.objectives.classList.toggle('shut', !!(head && head.why) && !whyOpen);
  const live = new Set();
  let prev = objHead, key = '';
  for (const r of rows) {
    live.add(r.key);
    const n = objRow(r.key);
    n.o = r.o || null; n.q = r.q || null;
    if (n.text !== r.text) { n.text = r.text; n.tx.innerHTML = chem(esc(r.text)); }
    // (the line that leads carries the name of its place: set here, so the block is fitted at its real height, and
    //  kept in step with the distance by the frame's own pass, above)
    n.lead = !!r.lead;
    const place = n.lead && n.o ? objectivePlace(n.o) : '';
    if (n.place !== place) { n.place = place; n.pl.textContent = place; n.at.style.display = place || n.dist ? '' : 'none'; }
    if (n.why !== r.why) { n.why = r.why; n.wy.innerHTML = chem(esc(n.why)); }
    { const show = n.why && whyOpen ? '' : 'none'; if (n.wy.style.display !== show) n.wy.style.display = show; }
    if (n.cls !== r.cls) { n.el.classList.remove('done', 'urgent', 'first', 'primary', 'quest'); if (r.cls) n.el.classList.add(...r.cls.split(' ')); n.cls = r.cls; }
    if (prev.nextSibling !== n.el) UI.objectives.insertBefore(n.el, prev.nextSibling);
    prev = n.el;
    key += `${r.key}|${r.text}|${r.why}|${r.lead ? 1 : 0}|${whyOpen ? 1 : 0}|`;
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
  // What gives way, in order: the lines after the next thing to do, from the last; then the line just ticked off
  // (it has had its jingle). The next thing to do is never the one to go: after the numbers the list was a single
  // struck-through line, with the farm, which had just become the mission, cut from under it.
  const lead = Math.max(0, rows.findIndex((n) => n.cls !== 'done'));
  for (let i = rows.length - 1; i > lead && over(); i--) rows[i].el.classList.add('cut');
  for (let i = lead - 1; i >= 0 && over(); i--) rows[i].el.classList.add('cut');
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
const cp = { w: 0, ppd: 0, cards: null, marks: [], nodes: {}, dists: {}, listAt: 0, region: null, regionAt: -1e9, regionOn: null, from: new THREE.Vector3() };
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
  const lead = leadTask();
  const at = lead ? objectiveWhere(lead.o) : null;
  if (!at) return null;
  const o = lead.o, of = (v, d) => (typeof v === 'function' ? v() : v || d);
  // (by the door: from outside the place to make for is the Hab; from inside, the airlock, with the way-out sign)
  return { o, pos: at.pos.clone(), name: objectivePlace(o, at) || 'Task', icon: at.via === 'in' ? 'hab' : at.via === 'out' ? 'exit' : of(o.icon, 'target') };
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
  // (or after a dozen frames, as with the mission list: a game stepped by its debug hook runs them in no time at all)
  // (and at once when the mission's first task changes, or he goes in or out of the Hab: the strip names that task's place)
  const lt = leadTask(), leadKey = (lt ? lt.o.id : '') + (S.inside ? '|in' : '');
  if (leadKey !== cp.leadKey || now - cp.listAt > 0.2 || (cp.calls = (cp.calls || 0) + 1) >= 12 || cp.from.distanceToSquared(pp) > 9) {
    cp.leadKey = leadKey; cp.listAt = now; cp.calls = 0; cp.from.copy(pp);
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
    const indoors = S.inside && S.mode === 'walk';
    const region = indoors ? (groundDist(pp, World.hab.position) < 14 ? 'The Hab' : 'Greenhouse') : regionName(_v1.copy(pp).normalize());
    if (region !== cp.region) {
      const first = cp.region === null;
      cp.region = region; cp.regionAt = first ? -1e9 : playTime();
      UI.region.textContent = region;
      if (!first) { UI.region.classList.remove('enter'); void UI.region.offsetWidth; UI.region.classList.add('enter'); }
    }
    // On a phone the name of the place is news as he comes into it, for a few seconds, and then it goes: the map and
    // the pause screen have it. (It stood under the compass the whole time, one more plate on a small screen; and
    // indoors it said "The Hab" to a man standing in the Hab.)
    const on = !layout.compact || (!indoors && !S.flags.coldOpen && playTime() - cp.regionAt < 7);
    if (on !== cp.regionOn) { cp.regionOn = on; UI.region.style.display = on ? '' : 'none'; }
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
    // (its name too, in this frame: the list is looked at again five times a second, and between two looks the strip
    //  said FARM BED while the line beside it said AIRLOCK)
    if (at) m.name = objectivePlace(m.lead, at) || 'Task';
    m.d = at ? at.d : distTo(m.pos);
    const rel = wrapDeg(m.bearing - heading);
    m.off = Math.abs(rel) > EDGE;
    m.rel = rel;
    m.x = mid + clamp(rel, -EDGE, EDGE) * ppd;
    // (standing on the place the mission leads to, its mark has nowhere to point: its name stays, in the middle)
    m.here = !!m.lead && (at ? at.near : 0) < 2.4;
    m.gone = (m.lead ? m.here : m.d < 6) || (m.off && !m.pin);
    m.labelled = false;
    if (m.lead && m.lead.urgent) urgent = true;          // (also when he is standing on it: with his life in the balance the strip names nothing else)
    if (!m.gone && !m.off && Math.abs(rel) < focusRel) { focusRel = Math.abs(rel); focus = m; }
  }
  // Labels: what it is and how far. The mission's mark first, then the one he faces, then the rest while there is
  // room. A mark that gets no label is not drawn: nothing stands on the strip that has to be guessed at. (It was a
  // dot, and before that a picture with no name.) With his life in the balance, the strip names the one thing.
  // The mission's own mark is named and no more: how far it is, is on the first line of the list, and the same
  // figure under the compass and again under the marker in the world was one distance printed three times. Its
  // name is there whenever there is a mission with a place, and in the middle when he stands on it: the strip
  // read "HAB 29 m" while the task was the heap at his feet.
  const labels = [];
  const tryLabel = (m, cls) => {
    const n = m.node, dist = m.lead ? '' : fmtDist(m.d), text = m.name + '|' + dist;
    if (n.text !== text) { n.text = text; n.lab.firstChild.textContent = m.name; n.lab.lastChild.textContent = dist; n.w = n.lab.offsetWidth; }
    const w = n.w + 6;
    const a = w >= cp.w || m.here ? mid : clamp(m.x, w / 2, cp.w - w / 2);
    for (const [l, r] of labels) if (a - w / 2 < r && a + w / 2 > l) return false;
    labels.push([a - w / 2, a + w / 2]);
    const c = cls + (m.cls ? ' ' + m.cls : '');
    if (n.labCls !== c) { n.labCls = c; n.lab.className = c; }
    n.lab.style.left = a.toFixed(1) + 'px';
    return true;
  };
  const leadMark = cp.marks.find((m) => m.lead);
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
      let state = m.gone || !pass ? 'hide' : m.off ? (m.rel < 0 ? 'off left' : 'off right') : 'on';
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
      const shown = pass && (state !== 'hide' || !!m.here);
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
  runAfter(dt);                       // (what was to be said so many seconds of play from when it was asked)
  const sunEl = localSunEl();
  const t = localTempC(_v1.copy(player.pos).normalize(), sunEl);
  const safeAir = S.inside && S.o2 > 3;
  const narrow = layout.compact && window.innerWidth <= 760;

  // --- suit oxygen: the number that kills you ---
  const cap = suitCap(), sf = S.suit / cap;
  const suitRate = track('suit', S.suit, dt);
  // (a share of the tank it has: a larger tank read "150" over the same words, with no unit, where a new suit read
  //  100. What a larger tank gives is time, and the time is the line under the dial.)
  setText('suit', UI.suitNum, `${Math.round(clamp(sf, 0, 1) * 100)}<small class="pc">%</small>`);
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
  // ("of air", not "left": beside a tank just filled at the airlock door, "5:56 left" read as a countdown to something)
  else st = S.suit > 0 ? `${fmtLeft(suitTimeLeft())} of air` : 'Empty';
  setText('suitSt', UI.suitState, st);

  // --- the colony's reserves ---
  // (The FOOD bar is measured against the wait: it is full when there are meals enough, at one a sol, to reach the
  //  rescue. Against a fixed sixteen it was two thirds full on ten meals with twenty-four sols to go, and stood full
  //  from twenty-two up, which read as "enough" whether it was or not. It turns amber under four meals and red under
  //  two, whatever the wait. Morale is a score out of 100 and carries no unit, here or anywhere.)
  const food = foodTotal(), wait = Math.max(3, S.rescueSol - S.sol);
  const rows = [
    ['o2', S.o2 / 100, `${Math.round(S.o2)}<small class="pc">%</small>`, S.o2],
    ['water', S.water / BAL.waterMax, `${Math.round(S.water)}<small>L</small>`, S.water],
    ['food', food / wait, `${food}<small>${food === 1 ? 'meal' : 'meals'}</small>`, null, food / 18],
    ['power', S.power / BAL.powerMax, `${Math.round(S.power)}<small class="pc">%</small>`, S.power],
    ['health', S.health / BAL.healthMax, `${Math.round(S.health)}<small class="pc">%</small>`, S.health],
    ['morale', S.morale / 100, `${Math.round(S.morale)}`, null],
  ];
  let arrow = null;
  for (const [k, frac, txt, raw, level] of rows) {
    const b = UI.bars[k];
    const f = clamp(frac, 0, 1).toFixed(3);
    if (hud.text[k + 'f'] !== f) { hud.text[k + 'f'] = f; b.fill.style.transform = `scaleX(${f})`; b.wrap.style.setProperty('--f', f); }
    setText(k, b.val, txt);
    setLevel(k, b.wrap, level === undefined ? frac : level, k === 'morale' ? 0.3 : 0.22, k === 'morale' ? 0.12 : 0.1);
    if (raw !== null) {
      const r = track(k, raw, dt), j = hud.jump[k];
      if (j && (j.t -= dt) <= 0) hud.jump[k] = null;
      // (and no arrow up on a full bar, or down on an empty one: "100% rising" is not a reading)
      let tr = hud.jump[k] ? (j.dir > 0 ? 'up' : 'dn') : r > 0.0015 ? 'up' : r < -0.0015 ? 'dn' : '';
      if ((tr === 'up' && frac >= 0.995) || (tr === 'dn' && frac <= 0.001)) tr = '';
      if (hud.cls[k + 't'] !== tr) { hud.cls[k + 't'] = tr; b.trend.className = 'tr' + (tr ? ' ' + tr : ''); }
      if (tr && !arrow && !b.wrap.hidden) arrow = b.wrap;
    }
  }
  // the arrows are said once, the first time one is on a bar he can see and nothing else is being said
  // (they were explained only in the guide: "what do the arrows mean" was a new player's question at the first bars)
  if (arrow && !S.flags.arrowTold && S.started && !S.flags.coldOpen) {
    if (S.sol > 1 || S.flags.uiBars) S.flags.arrowTold = true;
    else if (toastsIdle() && (hud.arrowWait = (hud.arrowWait || 0) + dt) > 12) {
      S.flags.arrowTold = true;
      toast('Gauges', 'Rising or falling', 'An arrow beside a number shows which way it is going now.', { lit: arrow, life: 7000 });
    }
  }

  // --- sol, local time, temperature ---
  setText('sol', UI.clockSol, String(S.sol));
  // (The second figure says what it is, and is not there before he knows of it: "SOL 1 / 25" stood on the screen from
  //  the first second, and nothing ever said that 25 was the rescue.)
  const knows = !!S.flags.didMath || S.sol > 1;
  setText('of', UI.clockOf, knows ? `<i>Rescue</i> ${S.rescueSol}` : '');
  // (on a wide screen the clock's line has no room for it beside the time and the temperature: it heads the mission list)
  if (objHead) setText('ofHd', objHead.lastChild, knows ? `Rescue Sol ${S.rescueSol}` : '');
  setText('time', UI.clockTime, fmtClock());
  // (the temperature is the weather: in the Hab, or in the rover's cabin, it is not his, and it is not shown)
  const outTemp = !(S.inside && S.mode === 'walk');
  setText('temp', UI.clockTemp, outTemp ? `${minus(t)}°C` : '');
  if (hud.cls.tempOn !== outTemp) { hud.cls.tempOn = outTemp; UI.clockTemp.style.display = UI.clockSep.style.display = outTemp ? '' : 'none'; }
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
    setText('rpwr', a.val, `${Math.round(pf * 100)}<small class="pc">%</small>`);
    setText('ro2', b.val, `${Math.round(of * 100)}<small class="pc">%</small>`);
    setLevel('rpwr', a.wrap, pf, 0.2, 0.08);
    setLevel('ro2', b.wrap, of, 0.2, 0.08);
  }

  // --- alerts: at most two, worst first. Each says what is wrong and what to do (in fewer words where the screen is narrow) ---
  const al = [];
  // (the alarm and its stake. What to do about it, where and how far, is the first line of the mission list beside
  //  it: the two used to say the same thing in the same words, "Hab breach / seal it" beside "Hab breach: seal it")
  if (S.breach.active) al.push(['crit', 'warning', 'Hab breach', 'the Hab is losing its air', 'the air is leaking out']);
  if (!filling && !safeAir && S.mode !== 'rover') {
    if (sf < 0.12) al.push(['crit', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> critical', 'the tank is almost empty', 'the tank is almost empty']);
    else if (sf < 0.25) al.push(['warn', 'suit', 'Suit <span class="chem">O<sub>2</sub></span> low', 'under a quarter of a tank left', 'under a quarter left']);
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
    // (and once he has moved, on a phone, the one thing nothing else says: with a minute and a half of air and
    //  seventy metres to go, run. RUN is tapped, not held: "Hold RUN" was said here while the controls sheet said
    //  "toggle". The button is lit until he has run. It all goes when he has.)
    ? (layout.touch ? (S.stats.walked > 1.5 || playTime() > 12 ? (hud.ran || (hud.ran = player.speed > 6.5) ? '' : ':Tap RUN, the air is running out') : ':Left thumb moves|:Drag to look') : 'W A S D:Move|Shift:Run|Mouse:Look|E:Interact (hold)')
    : (S.mode === 'rover' ? 'F:Exit rover|' : '') + (candles > 0 ? `X:Candle × ${candles}|` : '') + (S.sol <= 2 ? SCREEN_UNLOCKS.filter((s) => s.key && S.flags[s.flag]).sort((a, b) => 'JMC'.indexOf(a.key) - 'JMC'.indexOf(b.key)).map((s) => `${s.key}:${s.name}|`).join('') : '') + 'Esc:Menu';
  const nudgeRun = !!S.flags.coldOpen && layout.touch && !hud.ran;
  if (nudgeRun !== hud.nudgeRun) { hud.nudgeRun = nudgeRun; UI.tSprint.classList.toggle('nudge', nudgeRun); }
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
