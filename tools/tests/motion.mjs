// The game in motion. A scripted player walks and drives real routes, and what no still picture can show is
// flagged: a stick or a throttle held with nothing gained, a man or a rover through the ground or over it, the
// camera inside the ground, a rock, the rover or the Hab, a sudden jump of the man, the rover or the camera, and a
// step of the game that takes far longer than its neighbours. (The rover that stuck on small rocks was in the game
// through eleven rounds of screenshot reviews: nothing in a screenshot is stuck.)
//
//   node tools/tests/motion.mjs                    every route; exits non-zero if anything is flagged
//   node tools/tests/motion.mjs --only=canyon      routes whose name contains this
//   node tools/tests/motion.mjs --strips           also photographs each route as a strip of frames, for reviewers,
//                                                  into tools/tests/.cache/motion/<route>.png (phone size)
//
// The game is stepped at 30 steps a second of its own clock, two seconds at a time, with frames drawn in between
// (the rocks and the ground round the player are found as frames are drawn). Where the way is barred the player
// does what a person does: turns aside and goes on. Three such turns in a row with nothing gained is "stuck".
// The times of the steps are of the game's own work on this machine's processor, not of drawing: drawing here is
// software and says nothing of a phone. A step that takes many times the usual is a hitch a phone would feel too.
// "Left for the collector" is how fast the heap grows in play. In this browser most of it is not garbage a phone
// makes: V8 keeps every fraction the terrain code stores in a shared variable as an object of its own, and Safari
// does not. It is printed to be compared with itself, from one build to the next, and has no bar.
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const only = arg('only'), strips = process.argv.includes('--strips');

/**
 * The routes. `at`: [lat, lon, yaw] (or null for the Hab's doorstep at the usual start), `mode`: walk or rover,
 * `hour`: local time, `storm`: 0..1, `bursts`: how many two-second stretches, `turn`: radians of turning a burst
 * (a route that weaves), `run`: on foot, at a run.
 */
export const ROUTES = [
  { name: 'base-walk', what: 'out from the Hab across the base on foot', at: null, mode: 'walk', hour: 13, storm: 0, bursts: 24, turn: 0.5 },
  { name: 'base-run', what: 'out from the Hab at a run', at: null, mode: 'walk', hour: 16, storm: 0, bursts: 16, turn: 0.4, run: true },
  { name: 'boulders-walk', what: 'across a boulder field on foot (Ares Vallis)', at: [19.1, 326.7, 0.6], mode: 'walk', hour: 11, storm: 0, bursts: 20, turn: 0.25 },
  { name: 'boulders-drive', what: 'the same boulder field at full throttle', at: [19.1, 326.7, 0.6], mode: 'rover', hour: 11, storm: 0, bursts: 30, turn: 0.2 },
  { name: 'slope-walk', what: 'up and across a volcano\'s flank on foot (Olympus Mons)', at: [15.5, 228.5, 0.5], mode: 'walk', hour: 9, storm: 0, bursts: 20, turn: 0.3 },
  { name: 'slope-drive', what: 'the same flank in the rover', at: [15.5, 228.5, 0.5], mode: 'rover', hour: 9, storm: 0, bursts: 24, turn: 0.25 },
  { name: 'canyon-walk', what: 'along the foot of a canyon wall and onto it (Valles Marineris)', at: [-12.205, 292.86, 1.9], mode: 'walk', hour: 10.5, storm: 0, bursts: 24, turn: 0.35 },
  { name: 'canyon-drive', what: 'from the canyon\'s rim down into it in the rover (Valles Marineris)', at: [-10.74, 293, 3.14], mode: 'rover', hour: 15, storm: 0, bursts: 24, turn: 0.3 },
  { name: 'night-drive', what: 'a drive in the dark from the Hab', at: null, mode: 'rover', hour: 1.5, storm: 0, bursts: 24, turn: 0.2 },
  { name: 'storm-walk', what: 'on foot in a dust storm', at: null, mode: 'walk', hour: 14, storm: 0.9, bursts: 16, turn: 0.4 },
  { name: 'storm-drive', what: 'driving in a dust storm', at: null, mode: 'rover', hour: 14, storm: 0.9, bursts: 16, turn: 0.25 },
];

/** Runs in the page: one route. Returns what was flagged and what was measured. */
async function play(G, o) {
  const R = 12000, HAB_R = 8.4, dt = 1 / 30, V = G.player.pos.constructor, S = G.S;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const cam = G.ctx.engine.camera;
  const above = (p) => p.length() - G.surfaceAt(p);
  // (out of the rover the last route left him in)
  if (S.mode === 'rover') { G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 4); }
  for (const k of ['w', 'a', 's', 'd', 'shift']) G.input.keys[k] = false;
  if (o.at) await G.tp(o.at[0], o.at[1], o.at[2] || 0); else { G.tpLocal(6, 40, 3.3); await G.settle(); }
  G.setLocalTime(o.hour); G.setStorm(o.storm); if (!o.storm) S.storm.i = 0;
  S.suit = 100; S.health = 100; S.o2 = 96; S.water = 90; S.power = 90;
  G.prof = { heap: !!(performance.memory && window.gc) };
  if (o.mode === 'rover') {
    // (set down where he stands, facing the way the route faces: placed by the debug hook it faced north whatever the route)
    if (o.at) G.initRoverAt(G.player.pos.clone().normalize(), o.at[2] || 0);
    else {
      // (from the base it sets out away from the Hab: pointed at it, the first thing it met was the Hab's wall)
      G.roverLocal(10, 70, 0);
      const out = G.World.rover.group.position.clone().sub(G.World.hab.position), fw = new V(0, 0, -1).applyQuaternion(G.roverF.q);
      if (fw.dot(out) < 0) G.roverLocal(10, 70, Math.PI);
    }
    G.tpNear(G.World.rover.group.position, 3.2); await G.settle(); G.tick(0.05, 4); G.hold(0.8);
  }
  // (frames are drawn while the game stands still: the ground and the rocks round him come up to date in them, and
  //  nothing moves by the wall's clock, so a route is the same route every time it is played)
  await wait(1500);
  G.tick(dt, 20);
  const rover = S.mode === 'rover';
  const body = () => (rover ? G.World.rover.group.position : G.player.pos);
  const flags = [], count = {};
  const flag = (kind, t, d) => { count[kind] = (count[kind] || 0) + 1; if (flags.length < 40 && count[kind] <= 6) flags.push({ kind, t: +t.toFixed(2), ...d }); };
  const ll = () => { const p = body(), r = p.length(); return [+(Math.asin(p.y / r) * 57.2958).toFixed(4), +(((Math.atan2(-p.z, p.x) * 57.2958) + 360) % 360).toFixed(4)]; };
  const fwd = new V();
  const ticks = [];
  let t = 0, dist = 0, stalls = 0, stuck = 0, steep = 0, turnSign = 1, extraTurn = 0, air = 0, garbage = 0, gsecs = 0;
  let prev = body().clone(), prevCam = cam.position.clone(), prevFwd = new V(0, 0, -1).applyQuaternion(cam.quaternion);
  let hMin = 1e9, hMax = -1e9, camMin = 1e9;
  const key = (k, on) => { G.input.keys[k] = on; };
  for (let b = 0; b < o.bursts; b++) {
    // frames between bursts, the game standing still: the ground and the rocks round him are brought up to date
    await wait(500);
    S.suit = 100; S.health = 100; if (rover) S.roverPower = 100;
    const from = body().clone();
    // (how much the two seconds leave behind them for the collector: taken from a heap just collected)
    if (window.gc) window.gc();
    const heap0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
    // (what he coasted while the frames were drawn is not a jump)
    prev.copy(body()); prevCam.copy(cam.position); prevFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
    // the way he goes: forward, weaving one way and then the other; aside after a stall
    const weave = (Math.floor(b / 3) % 2 ? -1 : 1) * o.turn * (b % 3 === 2 ? 1 : 0.15) + extraTurn;
    extraTurn = 0;
    key('w', true);
    if (o.run) key('shift', true);
    for (let i = 0; i < 60; i++) {
      if (rover) { key('a', weave > 0.05); key('d', weave < -0.05); } else G.input.yaw = weave * dt / 2;
      const t0 = performance.now();
      G.tick(dt, 1);
      ticks.push(performance.now() - t0);
      t += dt;
      const p = body(), step = p.distanceTo(prev);
      dist += step;
      // (his pace: on a wall too steep to hold, the rover's is its speed and the slide down the wall together)
      const speed = rover ? Math.abs(G.roverF.speed) + Math.abs(G.roverF.slip || 0) : G.player.speed || 0;
      // a jump of the man or the rover: further in a step than three times his pace allows
      if (step > speed * dt * 3 + (rover ? 0.7 : 0.6)) flag('jump', t, { step: +step.toFixed(2), speed: +speed.toFixed(1), at: ll() });
      // through the ground or over it
      const h = above(p);
      // (the rover is measured at its wheels' plane under its middle: over a crest the ground there stands above that
      //  plane, and its belly clears half a metre)
      if (rover) { hMin = Math.min(hMin, h); hMax = Math.max(hMax, h); if (h < -0.6 || h > 1.5) flag(h < 0 ? 'rover-in-ground' : 'rover-in-air', t, { h: +h.toFixed(2), at: ll() }); }
      else if (G.player.onGround) { hMin = Math.min(hMin, h); hMax = Math.max(hMax, h); if (h < -0.25) flag('man-in-ground', t, { h: +h.toFixed(2), at: ll() }); else if (h > 0.4) flag('man-hovering', t, { h: +h.toFixed(2), at: ll() }); }
      else { air += dt; if (air > 6) { flag('man-falling', t, { h: +h.toFixed(2), at: ll() }); air = 0; } }
      if (!rover && G.player.onGround) air = 0;
      // the camera: in the ground, in a rock, in the rover, in the Hab
      const ch = above(cam.position);
      camMin = Math.min(camMin, ch);
      if (ch < 0.12) flag('camera-in-ground', t, { h: +ch.toFixed(2), at: ll() });
      const cu = fwd.copy(cam.position).normalize();
      for (const c of G.rockColliders) {
        const hd = Math.hypot(cu.x - c.v.x, cu.y - c.v.y, cu.z - c.v.z) * R;
        if (hd < c.r * 0.7 && ch < c.h * 0.75) { flag('camera-in-rock', t, { rock: [+c.r.toFixed(2), +c.h.toFixed(2)], h: +ch.toFixed(2), at: ll() }); break; }
      }
      if (!rover && !S.firstPerson && cam.position.distanceTo(G.World.rover.group.position) < 1.2) flag('camera-in-rover', t, { at: ll() });
      if (!S.inside && !S.inAirlock) { const hp = G.World.hab.position, hu = hp.length(); const hd = Math.hypot(cu.x - hp.x / hu, cu.y - hp.y / hu, cu.z - hp.z / hu) * R; if (hd < HAB_R - 0.5 && ch < 3) flag('camera-in-hab', t, { d: +hd.toFixed(1), at: ll() }); }
      // a jump or a snap of the camera
      const cstep = cam.position.distanceTo(prevCam);
      if (cstep > speed * dt * 3 + 1.4) flag('camera-jump', t, { step: +cstep.toFixed(2), at: ll() });
      const f = new V(0, 0, -1).applyQuaternion(cam.quaternion), ang = Math.acos(Math.min(1, Math.max(-1, f.dot(prevFwd)))) * 57.2958;
      if (ang > 12) flag('camera-snap', t, { deg: +ang.toFixed(1), at: ll() });
      prev.copy(p); prevCam.copy(cam.position); prevFwd.copy(f);
    }
    { const heap1 = performance.memory ? performance.memory.usedJSHeapSize : 0; if (heap1 > heap0) { garbage += heap1 - heap0; gsecs += 2; } }
    key('w', false); key('a', false); key('d', false); key('shift', false);
    // progress: with the stick or the throttle held for two seconds he is somewhere else
    const gained = body().distanceTo(from), slope = rover ? G.roverF.slope || 0 : 0;
    const need = rover ? (b === 0 ? 1.5 : 4) : 1.5;
    if (gained < need) {
      if (rover && slope > 0.5) steep++;
      stalls++; stuck++;
      // (a person turns aside and goes on, the same way until he is clear and further each time; a rover backs off a little first)
      if (stuck === 1) turnSign = -turnSign;
      extraTurn = turnSign * (0.9 + 0.5 * stuck);
      if (rover) { key('s', true); G.tick(dt, 30); key('s', false); t += 1; }
      // (stuck: three turns aside running, and in the last of them less than a metre gained. Sliding slowly round a
      //  wall is a stall, not this.)
      if (stuck >= 3) { if (gained < 1) flag('stuck', t, { gained: +gained.toFixed(2), slope: +slope.toFixed(2), at: ll() }); stuck = 0; }
    } else stuck = 0;
  }
  const sorted = ticks.slice().sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)] || 0, p99 = sorted[Math.floor(sorted.length * 0.99)] || 0, worst = sorted[sorted.length - 1] || 0;
  // a step of the game's own work that takes many times the usual: a hitch
  // (30 ms: on this machine the software renderer takes the processor from the game for up to 20 ms at a time, so a
  //  step under that says nothing; the 99th centile and the worst are printed for every route)
  // (One slow step cannot be told from this machine being busy with something else: a route is flagged for three of
  //  them, or for one over 120 ms. How many there were is printed either way.)
  const slow = ticks.filter((ms) => ms > 30).length;
  if (slow >= 3 || worst > 120) ticks.forEach((ms, i) => { if (ms > 30) flag('slow-step', i * dt, { ms: +ms.toFixed(1), usual: +med.toFixed(2) }); });
  const parts = Object.entries(G.prof || {}).filter(([k, e]) => k !== 'frame' && e && e.n).map(([k, e]) => [k, +e.worst.toFixed(1), +(e.sum / e.n).toFixed(3)]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  // which parts of the step leave the most behind them, in kB a second of play
  const heavy = Object.entries(G.prof || {}).filter(([k, e]) => k !== 'frame' && e && e.bytes).map(([k, e]) => [k, Math.round(e.bytes / 1024 / Math.max(1, t))]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  // And the game left to run by the wall's clock for eight seconds with the stick held: the main thread's share of
  // each frame (the game's step and the giving of the picture's orders; the drawing itself is another process's).
  // A frame of which that share is over 50 ms is a hitch of the game's own making.
  G.prof = { frame: { worst: 0, sum: 0, n: 0, all: [] } };
  key('w', true); G.paused = false; await wait(8000); G.paused = true; key('w', false);
  const fr = G.prof.frame.all.slice(2).sort((a, b) => a - b);
  G.prof = null;
  const frames = { n: fr.length, usual: +(fr[Math.floor(fr.length / 2)] || 0).toFixed(1), worst: +(fr[fr.length - 1] || 0).toFixed(1) };
  if (frames.worst > 50) flag('slow-frame', t, { ms: frames.worst, usual: frames.usual });
  return { mode: S.mode, flags, count, dist: Math.round(dist), secs: Math.round(t), stalls, steep, ground: [+hMin.toFixed(2), +hMax.toFixed(2)], camMin: +camMin.toFixed(2),
    step: { usual: +med.toFixed(2), p99: +p99.toFixed(2), worst: +worst.toFixed(1), slow }, parts, heavy, frames, garbage: gsecs ? +(garbage / gsecs / 1048576).toFixed(2) : null, end: ll() };
}

/** A strip of frames of a route, as one picture: `n` frames `gap` seconds apart, HUD and all, at phone size. */
async function strip(g, route, file, n = 12, gap = 0.4) {
  const page = g.page, shots = [];
  await g.eval(async (G, o) => {
    const S = G.S;
    if (o.at) await G.tp(o.at[0], o.at[1], o.at[2] || 0); else { G.tpLocal(6, 40, 3.3); await G.settle(); }
    G.setLocalTime(o.hour); G.setStorm(o.storm); if (!o.storm) S.storm.i = 0;
    S.suit = 100; S.health = 100;
    if (o.mode === 'rover') {
      if (o.at) G.initRoverAt(G.player.pos.clone().normalize(), o.at[2] || 0);
      else { G.roverLocal(10, 70, 0); const V = G.player.pos.constructor; if (new V(0, 0, -1).applyQuaternion(G.roverF.q).dot(G.World.rover.group.position.clone().sub(G.World.hab.position)) < 0) G.roverLocal(10, 70, Math.PI); }
      G.tpNear(G.World.rover.group.position, 3.2); await G.settle(); G.tick(0.05, 4); G.hold(0.8);
    }
    await new Promise((r) => setTimeout(r, 1500));
    G.input.keys.w = true; if (o.run) G.input.keys.shift = true;
    G.tick(1 / 30, 45);
  }, route);
  for (let i = 0; i < n; i++) {
    await g.eval((G, a) => { const rover = G.S.mode === 'rover', w = a.turn * (a.i % 6 < 3 ? 1 : -1); for (let k = 0; k < Math.round(a.gap * 30); k++) { if (rover) { G.input.keys.a = w > 0.05 && a.i % 3 === 2; G.input.keys.d = w < -0.05 && a.i % 3 === 2; } else G.input.yaw = w / 60; G.tick(1 / 30, 1); } }, { i, gap, turn: route.turn });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(350);
    shots.push((await page.screenshot({ type: 'jpeg', quality: 80, timeout: 120000 })).toString('base64'));
  }
  await g.eval((G) => { for (const k of ['w', 'a', 'd', 'shift']) G.input.keys[k] = false; G.tick(1 / 30, 20); });
  // (on foot the sheet is of the middle of the picture, where he is, at twice the size)
  await sheetOf(page, shots, gap, `${route.name}: ${route.what}. ${n} frames, ${gap} s apart, left to right and down; the middle of each frame.`, file, route.mode === 'walk' ? FOOT : ROVER);
}
/** Frames as one picture: four across, numbered, read left to right and down. */
async function sheetOf(page, shots, gap, title, file, crop = null) {
  const sheet = await page.context().newPage();
  const data = await sheet.evaluate(async ({ shots, gap, title, crop }) => {
    const imgs = await Promise.all(shots.map((b) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/jpeg;base64,' + b; })));
    // (`crop`: the part of each frame that is kept, as shares of its width and height: [left, top, right, bottom])
    const k = crop || [0, 0, 1, 1], sw = imgs[0].width * (k[2] - k[0]), sh = imgs[0].height * (k[3] - k[1]);
    const cols = 4, w = 633, h = Math.round(w * sh / sw), rows = Math.ceil(imgs.length / cols), pad = 6, top = 30;
    const c = document.createElement('canvas'); c.width = cols * (w + pad) + pad; c.height = top + rows * (h + pad) + pad;
    const x = c.getContext('2d'); x.fillStyle = '#111'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#eee'; x.font = '600 16px sans-serif'; x.fillText(title, pad, 21);
    imgs.forEach((im, i) => { const cx = pad + (i % cols) * (w + pad), cy = top + Math.floor(i / cols) * (h + pad); x.drawImage(im, im.width * k[0], im.height * k[1], sw, sh, cx, cy, w, h); x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(cx, cy, 84, 20); x.fillStyle = '#fff'; x.font = '600 13px sans-serif'; x.fillText(`${i + 1}  +${(i * gap).toFixed(1)} s`, cx + 5, cy + 15); });
    return c.toDataURL('image/jpeg', 0.86).split(',')[1];
  }, { shots, gap, title, crop });
  await sheet.close();
  await writeFile(file, Buffer.from(data, 'base64'));
}

/**
 * Strips that are not routes: the camera turned about him, and each thing he does. `setup` and `each` run in the
 * page; `each` is given the frame's number and plays the stretch before that frame.
 */
const FOOT = [0.24, 0.22, 0.76, 1], ROVER = [0.14, 0.1, 0.86, 1], WIDE = [0.08, 0.1, 0.74, 1];
const EXTRAS = [
  { name: 'turn-on-foot', foot: true, what: 'the camera turned once round him on foot, standing', n: 12, gap: 0.25,
    setup: async (G) => { if (G.S.mode === 'rover') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 4); } G.tpLocal(8, 36, 3.3); await G.settle(); G.setLocalTime(13); G.setStorm(0); G.S.storm.i = 0; G.tick(1 / 30, 30); },
    each: (G) => { for (let k = 0; k < 8; k++) { G.input.yaw = Math.PI * 2 / 12 / 8; G.tick(1 / 30, 1); } } },
  { name: 'jump', crop: WIDE, what: 'a jump from a walk: off, up, down, landed (he is in the air 1.8 s: Mars)', n: 12, gap: 0.2,
    setup: async (G) => { if (G.S.mode === 'rover') { G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 4); } G.tpLocal(8, 44, 3.3); await G.settle(); G.setLocalTime(13); G.input.keys.w = true; G.tick(1 / 30, 30); },
    each: (G, a) => { G.input.keys[' '] = a.i === 1; G.tick(1 / 30, 6); if (a.i === 11) { G.input.keys.w = false; G.input.keys[' '] = false; G.tick(1 / 30, 20); } } },
  { name: 'kneeling-work', foot: true, what: 'digging at the heap: down on a knee, the work, up again', n: 12, gap: 0.33,
    setup: async (G) => { const V = G.player.pos.constructor; G.S.inv.regolith = 0; G.World.soilPiles[0].left = 2; G.tpNear(G.World.soilPiles[0].group.getWorldPosition(new V()), 1.5); await G.settle(); G.setLocalTime(13); G.tick(1 / 30, 20); },
    each: (G, a) => { G.input.eHeld = a.i < 9 && !G.S.inv.regolith; if (!G.input.eHeld) G.S.holdT = 0; G.tick(1 / 30, 10); } },
  { name: 'standing-work', foot: true, what: 'wiping a dusty solar panel: the work done standing', n: 8, gap: 0.3,
    setup: async (G) => {
      const p = G.World.panels[0], V = G.player.pos.constructor; p.dust = 0.9; G.syncAllVisuals();
      G.tpNear(p.group.getWorldPosition(new V()), 1.7); await G.settle(); G.setLocalTime(13); G.tick(1 / 30, 20);
    },
    each: (G, a) => { G.input.eHeld = a.i < 6; if (!G.input.eHeld) G.S.holdT = 0; G.tick(1 / 30, 9); } },
  { name: 'getting-in', what: 'getting into the rover and setting off', n: 12, gap: 0.3,
    setup: async (G) => { G.roverLocal(10, 70, 0); G.tpNear(G.World.rover.group.position, 3.2); await G.settle(); G.tick(1 / 30, 20); },
    each: (G, a) => { G.input.eHeld = a.i < 4 && G.S.mode !== 'rover'; if (!G.input.eHeld) G.S.holdT = 0; G.input.keys.w = a.i >= 5; G.tick(1 / 30, 9); } },
  { name: 'turn-in-rover', what: 'the camera swung once round the parked rover', n: 12, gap: 0.25,
    setup: async (G) => { G.input.keys.w = false; G.roverF.speed = 0; G.tick(1 / 30, 30); },
    each: (G) => { for (let k = 0; k < 8; k++) { G.input.yaw = Math.PI * 2 / 12 / 8; G.tick(1 / 30, 1); } } },
];
async function extra(g, x, file) {
  const page = g.page, shots = [];
  await g.eval(x.setup);
  const said = await page.evaluate(() => (document.querySelector('#mg-tE .vb') || { textContent: '' }).textContent);
  for (let i = 0; i < x.n; i++) {
    await g.eval(x.each, { i });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(350);
    shots.push((await page.screenshot({ type: 'jpeg', quality: 80, timeout: 120000 })).toString('base64'));
  }
  await sheetOf(page, shots, x.gap, `${x.name}: ${x.what}${said ? ' (the button said ' + said + ')' : ''}. ${x.n} frames, ${x.gap} s apart, left to right and down${x.foot || x.crop ? '; the middle of each frame' : ''}.`, file, x.crop || (x.foot ? FOOT : null));
}

const list = ROUTES.filter((r) => !only || only.split(',').some((x) => r.name.includes(x)));
const ARGS = ['--enable-precise-memory-info', '--js-flags=--expose-gc'];
const g = await openGame(strips ? { width: 844, height: 390, touch: true, quality: 'low', dsf: 1.5, query: 'safe=0,47,21,47', args: ARGS } : { quality: 'low', args: ARGS });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); await G.settle(); G.paused = true; });
// (the opening's last line of log is not part of any route)
await g.page.evaluate(() => { const l = document.getElementById('mg-log'); if (l) l.textContent = ''; });
let bad = 0;
if (strips) await mkdir(path.join(outDir, 'motion'), { recursive: true });
for (const route of list) {
  let r;
  try { r = await g.eval(play, route); } catch (e) { bad++; console.log(`  FAIL ${route.name}: ${e.message}`); continue; }
  const kinds = Object.entries(r.count).map(([k, v]) => `${k} x${v}`).join(', ');
  const wrong = r.mode !== route.mode || r.dist < 20;
  if (kinds || wrong) bad++;
  console.log(`  ${kinds || wrong ? 'FLAG' : 'ok  '} ${route.name.padEnd(15)} ${route.what}: ${r.dist} m in ${r.secs} s, ${r.stalls} turn${r.stalls === 1 ? '' : 's'} aside${r.steep ? ` (${r.steep} on a slope too steep to climb)` : ''}; ` +
    `above the ground ${r.ground[0]} to ${r.ground[1]} m, camera never under ${r.camMin} m; a step of the game ${r.step.usual} ms as a rule, ${r.step.p99} ms at the 99th, ${r.step.worst} ms at worst${r.step.slow ? ` (${r.step.slow} over 30 ms)` : ''}` +
    (wrong ? `  [mode ${r.mode}, wanted ${route.mode}]` : '') + `\n         left for the collector: ${r.garbage === null ? 'not measured' : r.garbage + ' MB a second of play'}${r.heavy.length ? ' (by part, kB a second: ' + r.heavy.map((q) => q[0] + ' ' + q[1]).join(', ') + ')' : ''}; the main thread's share of a frame, over ${r.frames.n} frames: ${r.frames.usual} ms as a rule, ${r.frames.worst} ms at worst` +
    `\n         the slowest parts of a step (worst ms, usual ms): ${r.parts.map((q) => `${q[0]} ${q[1]} / ${q[2]}`).join(', ')}` + (kinds ? `\n         ${kinds}` : ''));
  for (const f of r.flags) console.log('         ' + JSON.stringify(f));
  // (a walk's step is under half a second: on foot the frames are an eighth of a second apart, so a sheet is two strides)
  if (strips) { const file = path.join(outDir, 'motion', route.name + '.jpg'); await strip(g, route, file, 12, route.mode === 'walk' ? 0.13 : 0.2); console.log('         strip: ' + file); }
}
if (strips) {
  for (const x of EXTRAS) {
    if (only && !only.split(',').some((q) => x.name.includes(q))) continue;
    const file = path.join(outDir, 'motion', x.name + '.jpg');
    try { await extra(g, x, file); console.log(`  strip ${x.name}: ${file}`); } catch (e) { bad++; console.log(`  FAIL strip ${x.name}: ${e.message}`); }
  }
}
if (g.errors.length) { bad += g.errors.length; console.log('  console errors: ' + JSON.stringify(g.errors.slice(0, 4))); }
await g.close();
console.log(`\n${list.length} routes played; ${bad ? bad + ' flagged' : 'nothing flagged'}`);
process.exit(bad ? 1 : 0);
