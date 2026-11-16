// The rover and the astronaut against rocks: what a rover's wheels clear it drives over, a boulder turns it aside
// and never pins it, and neither of them loses pace by the frame.
//
//   node tools/tests/drive.mjs
//
// First with rocks put exactly where each rule needs one (a rock under the wheels, a boulder off the flank, a
// boulder dead ahead, backing off one, the same at 30 and 120 frames a second, a man past a rock). Then across the
// rockiest real ground of several sites at full throttle, which fails if the rover stops making progress.
import { openGame } from './lib.mjs';
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };

const g = await openGame({ quality: 'low' });
await g.eval(async (G) => { await G.start(-1.9, 354.5); G.skipIntro(); await G.settle(); G.paused = true; });

// ---- rocks put where the rule needs them -------------------------------------------------------------------
const lab = await g.eval(async (G) => {
  const V = G.player.pos.constructor, R = 12000;
  // (a level stretch well clear of the Hab)
  G.roverLocal(0, 320, 0); G.tpNear(G.World.rover.group.position, 3.2); await G.settle(); G.tick(0.05, 4); G.hold(0.8);
  const mode = G.S.mode;
  const home = G.roverF.q.clone();
  const frame = () => ({ up: new V(0, 1, 0).applyQuaternion(G.roverF.q), fw: new V(0, 0, -1).applyQuaternion(G.roverF.q), rt: new V(1, 0, 0).applyQuaternion(G.roverF.q) });
  // a rock `ahead` and `right` metres of where the rover stands, `r` across by half and `h` high
  const rock = (f, ahead, right, r, h) => { const v = f.up.clone().multiplyScalar(R).addScaledVector(f.fw, ahead).addScaledVector(f.rt, right).normalize(); return { v, r, h, x: v.x * R, y: v.y * R, z: v.z * R }; };
  // drive from the same place: `rocks(f)` are put down, the throttle held `sec` seconds at `dt`
  const run = (rocks, sec, dt = 1 / 60, key = 'w', before = null) => {
    G.roverF.q.copy(home); G.roverF.speed = 0; G.roverF.steer = 0; G.roverF.jolts = 0; G.roverF.hits = 0; G.S.roverPower = 100; G.S.shake = 0;
    const f = frame(), from = f.up.clone();
    G.rockColliders.length = 0;
    for (const c of rocks(f)) G.rockColliders.push(c);
    if (before) before(f);
    let stuck = 0, worst = 0, last = f.up.clone(), minSpeed = 1e9, passedAt = -1, t = 0, shake = 0;
    G.input.keys[key] = true;
    for (let i = 0; i < Math.round(sec / dt); i++) {
      G.tick(dt, 1); t += dt;
      const up = new V(0, 1, 0).applyQuaternion(G.roverF.q);
      const moved = up.distanceTo(last) * R; last = up;
      stuck = moved < 0.5 * dt ? stuck + dt : 0;                       // (less than half a metre a second: not getting anywhere)
      worst = Math.max(worst, stuck);
      shake = Math.max(shake, G.S.shake);
      const ahead = up.clone().sub(from).dot(f.fw) * R;
      if (ahead > 12 && ahead < 40) minSpeed = Math.min(minSpeed, Math.abs(G.roverF.speed));
      if (passedAt < 0 && ahead > 34) passedAt = t;
    }
    G.input.keys[key] = false;
    const up = new V(0, 1, 0).applyQuaternion(G.roverF.q), d = up.clone().sub(from);
    return { ahead: +(d.dot(f.fw) * R).toFixed(1), side: +(d.dot(f.rt) * R).toFixed(1), speed: +G.roverF.speed.toFixed(1), stuck: +worst.toFixed(2), jolts: G.roverF.jolts, hits: G.roverF.hits,
      minSpeed: +minSpeed.toFixed(1), passedAt: +passedAt.toFixed(2), shake: +shake.toFixed(2) };
  };
  const out = { mode };
  out.open = run(() => [], 6);
  out.small = run((f) => [rock(f, 25, 0.3, 0.55, 0.6)], 6);
  out.kneeAtFlank = run((f) => [rock(f, 25, 2.2, 0.5, 0.45)], 6);          // (the owner's rock: knee-high, a metre off its side. The old 2 m circle caught it.)
  out.flank = run((f) => [rock(f, 25, 1.3, 1.0, 1.5)], 8);
  out.dead = run((f) => [rock(f, 25, 0, 1.0, 1.5)], 10);
  out.flank30 = run((f) => [rock(f, 25, 1.3, 1.0, 1.5)], 8, 1 / 30);
  out.flank120 = run((f) => [rock(f, 25, 1.3, 1.0, 1.5)], 8, 1 / 120);
  // against a boulder, nose to it, then backed away: it comes off at once
  out.back = run((f) => [rock(f, 3.2, 0, 1.0, 1.5)], 2, 1 / 60, 's');
  // ---- on foot: a rock a little to one side of his way; he slides past it, at 30 frames a second as at 120
  G.input.keys.f = false;
  // (parked first: asked to get out of a moving rover, it pulls up before he can; that is tested below)
  G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 4);
  out.afoot = G.S.mode;
  const walk = (dt) => {
    G.tpNear(G.World.rover.group.position, 30); G.tick(0.05, 2);
    const q0 = G.player.q.clone();
    const up0 = new V(0, 1, 0).applyQuaternion(q0), fw = new V(0, 0, -1).applyQuaternion(q0), rt = new V(1, 0, 0).applyQuaternion(q0);
    G.rockColliders.length = 0;
    const v = up0.clone().multiplyScalar(R).addScaledVector(fw, 6).addScaledVector(rt, 0.45).normalize();
    G.rockColliders.push({ v, r: 0.8, h: 0.7, x: v.x * R, y: v.y * R, z: v.z * R });
    G.input.keys.w = true;
    for (let i = 0; i < Math.round(4 / dt); i++) G.tick(dt, 1);
    G.input.keys.w = false;
    const d = G.player.pos.clone().normalize().sub(up0);
    return +(d.dot(fw) * R).toFixed(1);
  };
  out.walk30 = walk(1 / 30); out.walk120 = walk(1 / 120);
  G.rockColliders.length = 0;
  return out;
});
check('the driver is in the rover, and on open ground it gets up to speed', lab.mode === 'rover' && lab.open.ahead > 60 && lab.open.stuck < 0.6, { mode: lab.mode, open: lab.open });
check('a rock its wheels clear: driven over with a jolt, a little speed lost, its line kept', lab.small.jolts >= 1 && lab.small.hits === 0 && lab.small.ahead > lab.open.ahead * 0.93 && Math.abs(lab.small.side) < 0.5 && lab.small.shake > 0.02, lab.small);
check('a knee-high rock a metre off its flank is nothing to it', lab.kneeAtFlank.hits === 0 && lab.kneeAtFlank.ahead > lab.open.ahead * 0.97, lab.kneeAtFlank);
check('a boulder off its flank: it slides past, and keeps most of its way', lab.flank.hits >= 1 && lab.flank.passedAt > 0 && lab.flank.stuck < 0.6 && lab.flank.minSpeed > 3, lab.flank);
check('a boulder dead ahead: it is turned aside and comes round it, never pinned', lab.dead.hits >= 1 && lab.dead.passedAt > 0 && lab.dead.stuck < 2.5, lab.dead);
check('the same at 30 and at 120 frames a second', lab.flank30.passedAt > 0 && lab.flank120.passedAt > 0 && Math.abs(lab.flank30.passedAt - lab.flank120.passedAt) < 0.2 * lab.flank120.passedAt, { at30: lab.flank30.passedAt, at60: lab.flank.passedAt, at120: lab.flank120.passedAt });
check('nose to a boulder, it backs away at once', lab.back.ahead < -3 && lab.back.stuck < 0.6, lab.back);
check('on foot he slides past a rock in his way, as far at 30 frames a second as at 120', lab.afoot === 'walk' && lab.walk30 > 12 && lab.walk120 > 12 && Math.abs(lab.walk30 - lab.walk120) < 0.12 * lab.walk120, { walk30: lab.walk30, walk120: lab.walk120 });

// ---- real ground: the rockiest of several sites, crossed at full throttle -----------------------------------
const sites = [[22.3, 312.0, 'Chryse (Viking 1)'], [47.6, 134.3, 'Utopia (Viking 2)'], [19.1, 326.7, 'Ares Vallis'], [-14.6, 175.5, 'Gusev'], [4.5, 137.4, 'Gale'], [-1.9, 354.5, 'Meridiani']];
const field = await g.eval(async (G, sites) => {
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  const V = G.player.pos.constructor, R = 12000;
  const seen = [];
  for (const [lat, lon, name] of sites) {
    await G.tp(lat, lon); G.paused = false; await frames(2600); G.paused = true;
    const all = G.rockColliders.length, tall = G.rockColliders.filter((c) => c.h >= 0.9).length;
    seen.push({ name, lat, lon, rocks: all, boulders: tall });
  }
  const best = seen.slice().sort((a, b) => b.rocks - a.rocks)[0];
  await G.tp(best.lat, best.lon);
  G.roverTo(G.player.pos, 4); G.tpNear(G.World.rover.group.position, 3.2); await G.settle(); G.tick(0.05, 4); G.hold(0.8);
  const mode = G.S.mode;
  // Thirty bursts of two seconds, a frame drawn between them (the rocks round the rover are found when a frame is
  // drawn). A burst in which it does not get four metres on is a rover that has stopped making progress.
  G.roverF.jolts = 0; G.roverF.hits = 0; G.S.roverPower = 100;
  let worst = 1e9, total = 0, slow = 0, steep = 0;
  for (let b = 0; b < 30; b++) {
    G.paused = false; await frames(1300); G.paused = true;
    const from = new V(0, 1, 0).applyQuaternion(G.roverF.q);
    G.S.roverPower = 100;
    G.input.keys.w = true; G.tick(1 / 30, 60); G.input.keys.w = false;
    const moved = new V(0, 1, 0).applyQuaternion(G.roverF.q).distanceTo(from) * R;
    total += moved;
    if (G.roverF.slope > 0.5) { steep++; continue; }                 // (a slope too steep to climb is not a rock)
    worst = Math.min(worst, moved);
    if (moved < 4) slow++;
  }
  return { seen, site: best.name, mode, worst: +worst.toFixed(1), total: Math.round(total), slow, steep, jolts: G.roverF.jolts, hits: G.roverF.hits };
}, sites);
check(`a real boulder field (${field.site}) at full throttle for a minute: it never stops making progress`, field.mode === 'rover' && field.slow === 0 && field.total > 400 && field.jolts + field.hits >= 3, field);

// ---- asked to get out at speed: it pulls up first, and the throttle takes the asking back -----------------------
const leave = await g.eval(async (G) => {
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  G.paused = false; await frames(800); G.paused = true;
  G.rockColliders.length = 0; G.S.roverPower = 100;
  const upTo = () => { G.input.keys.w = true; G.tick(1 / 30, 150); G.input.keys.w = false; return Math.abs(G.roverF.speed); };
  const ask = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
  const out = { v0: upTo() };
  ask();
  out.still = G.S.mode;                                   // (at speed he is still in the seat)
  let t = 0;
  while (G.S.mode === 'rover' && t < 8) { out.vOut = Math.abs(G.roverF.speed); G.tick(1 / 30, 1); t += 1 / 30; }
  out.t = +t.toFixed(2); out.mode = G.S.mode;
  // back in, up to speed, asked again, and the throttle pressed: he stays in and it drives on
  G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 4); G.hold(0.8);
  out.again = G.S.mode;
  upTo(); ask();
  G.input.keys.w = true; G.tick(1 / 30, 60); G.input.keys.w = false;
  out.kept = G.S.mode; out.vKept = +Math.abs(G.roverF.speed).toFixed(1);
  return out;
});
check('asked to get out at speed, the rover pulls up and he is out as it stops; the throttle takes the asking back',
  leave.v0 > 15 && leave.still === 'rover' && leave.mode === 'walk' && leave.t < 4 && leave.vOut < 3 && leave.again === 'rover' && leave.kept === 'rover' && leave.vKept > 15, leave);

// ---- the driver's seat: V puts the picture in the cab, and back --------------------------------------------------
const cab = await g.eval(async (G) => {
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  const V3 = G.player.pos.constructor, rv = G.World.rover, cam = G.ctx.engine.camera, out = {};
  const key = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
  const part = (name) => { let f = null; rv.seat.traverse((o) => { if (o.name === name) f = o; }); return f; };
  const at = (o) => new V3().setFromMatrixPosition(o.matrixWorld);
  const drawn = (re) => { let n = 0; rv.seat.traverse((o) => { if (o.isMesh && o.visible && re.test(o.name)) n++; }); return n; };
  G.roverF.speed = 0; G.setStorm(0); G.S.storm.i = 0; G.tick(1 / 30, 30);
  out.before = { cockpit: !!G.S.cockpit, off: +cam.position.distanceTo(rv.group.position).toFixed(1) };
  key('v'); G.tick(1 / 30, 45);
  rv.group.updateWorldMatrix(true, true);
  out.seat = { cockpit: !!G.S.cockpit, fromEye: +cam.position.distanceTo(at(part('eye'))).toFixed(3), heads: drawn(/^(helmet|head|visor)/), fov: +cam.fov.toFixed(1) };
  // the wheel goes over with the steering, and his hand goes with it
  const hand = part('hand_L'), horn = () => new V3(0.15, 0, 0).applyQuaternion(rv.yoke.quaternion).add(rv.yoke.position);
  const local = (v) => rv.yoke.parent.worldToLocal(v);
  G.tick(1 / 30, 10); rv.group.updateWorldMatrix(true, true);
  const h0 = local(at(hand)), y0 = horn();
  G.input.keys.w = true; G.input.keys.a = true; G.tick(1 / 30, 40); G.input.keys.a = false; G.input.keys.w = false;
  rv.group.updateWorldMatrix(true, true);
  const h1 = local(at(hand)), y1 = horn();
  out.wheel = { turn: +(rv.wheelTurn * 180 / Math.PI).toFixed(1), hornMoved: +y1.distanceTo(y0).toFixed(3), handMoved: +h1.distanceTo(h0).toFixed(3), apart: +h1.clone().sub(h0).distanceTo(y1.clone().sub(y0)).toFixed(3) };
  // a look to the side stays where it is put while parked; a storm's veil is kept off the cab
  G.roverF.speed = 0; G.tick(1 / 30, 20);
  G.input.yaw = 0.9; G.tick(1 / 30, 120);
  out.look = +G.roverF.seatYaw.toFixed(2);
  G.setStorm(1); G.S.storm.i = 1; G.tick(1 / 30, 20);
  G.paused = false; await frames(900); G.paused = true;
  out.storm = { veil: +G.ctx.engine.final.uniforms.uVeil.value.toFixed(2), mask: G.ctx.engine.final.uniforms.uCab.value };
  G.setStorm(0); G.S.storm.i = 0; G.tick(1 / 30, 10);
  // back out behind it
  key('v'); G.tick(1 / 30, 90);
  G.paused = false; await frames(300); G.paused = true;
  out.back = { cockpit: !!G.S.cockpit, off: +cam.position.distanceTo(rv.group.position).toFixed(1), heads: drawn(/^(helmet|head|visor)/), mask: G.ctx.engine.final.uniforms.uCab.value };
  // and out of the rover from the seat's view: the picture goes back to him on foot
  key('v'); G.tick(1 / 30, 45); G.roverF.speed = 0; key('f'); G.tick(1 / 30, 60);
  out.afoot = { mode: G.S.mode, off: +cam.position.distanceTo(G.player.pos).toFixed(1), things: !!G.ctx.engine.cabThings };
  G.S.cockpit = false;
  return out;
});
check('V in the rover puts the picture at the driver\'s eyes, with neither his helmet nor his head drawn',
  !cab.before.cockpit && cab.before.off > 5 && cab.seat.cockpit && cab.seat.fromEye < 0.06 && cab.seat.heads === 0, { before: cab.before, seat: cab.seat });
check('the wheel goes over with the steering and his hand goes with it (within 3 cm)', Math.abs(cab.wheel.turn) > 8 && cab.wheel.hornMoved > 0.02 && cab.wheel.apart < 0.03, cab.wheel);
check('parked, a look to the side stays where it was put; in a storm the veil is kept off the cab', cab.look > 0.6 && cab.storm.veil > 0.3 && cab.storm.mask === 1, { look: cab.look, storm: cab.storm });
check('V again puts it back behind the rover, his head drawn again; out of the rover it is behind him on foot',
  !cab.back.cockpit && cab.back.off > 5 && cab.back.heads > 0 && cab.back.mask === 0 && cab.afoot.mode === 'walk' && cab.afoot.off < 9 && !cab.afoot.things, { back: cab.back, afoot: cab.afoot });

console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'passed'}; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
process.exit(fails.length || g.errors.length ? 1 : 0);
