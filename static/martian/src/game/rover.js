/*
 * The rover: a body frame on the sphere driven like a real vehicle. Throttle builds speed
 * toward the drivetrain's top speed, steering is a steer angle (so it cannot spin on the spot),
 * hills slow it and cliffs stop it, the body rides the terrain on a sprung suspension, each
 * wheel follows the ground, and the chase camera has weight.
 */
import * as THREE from 'three';
import { ctx } from './ctx.js';
import { angDist, frameQuat } from '../planet/geo.js';
import { X_AXIS, _pv, _q1, _q2, _v1, _v2, _v3 } from '../core/scratch.js';
import { surfaceAt, groundSlope } from '../planet/surface.js';
import { R } from '../planet/constants.js';
import { WHEEL_RADIUS, World } from '../world/build.js';
import { paneView, dustUniforms } from '../world/models.js';
import { BAL, S, machineEff, roverPowerCap, roverTopSpeed } from './state.js';
import { wearRover } from './machines.js';
import { input } from './input.js';
import { player, frameMove, frameYaw, collideUnit, contact, syncPlayerPos, camLookAt } from './player.js';
import { rockColliders } from '../world/rocks.js';
import { Snd } from '../audio/sound.js';
import { clamp, lerp, damp } from '../core/math.js';
import { emit } from '../core/events.js';

export const roverF = {
  q: new THREE.Quaternion(), speed: 0, steer: 0,
  camPos: new THREE.Vector3(), camInit: false, camYaw: 0, camPitch: 0, camIdle: 9,
  pitch: 0, roll: 0, pitchV: 0, rollV: 0, heave: 0, heaveV: 0,
  slope: 0, slip: 0, throttle: 0, touching: false, camLift: 0, camSee: 0, camRise: 0, leaving: false, accel: 0, lat: 0, camBlend: 1, camFromQ: null, camFromP: null,
  camSeat: false, seatYaw: 0, seatPitch: -0.14,      // the driver's own view: see seatCamera
  jolts: 0, hits: 0,                                 // rocks gone over and boulders run into, counted (tests read them)
};
/** The yoke turns about its column (tools/assets/vehicles.py: along (0, 0.85, 0.527) there, toward the driver), by no
 *  more than the Drive clip's hands go each way (tools/assets/astronaut.py, clip_drive: 11.9 degrees to the right). */
const YOKE_AXIS = new THREE.Vector3(0, 0.527, -0.85).normalize(), WHEEL_TURN = 11.5 * Math.PI / 180;
const _down = new THREE.Vector3(), _fw = new THREE.Vector3(), _rt = new THREE.Vector3(), _up = new THREE.Vector3(), _w = new THREE.Vector3();
const Z_AXIS = new THREE.Vector3(0, 0, 1);

/**
 * What stops a rover, and what it only feels. Its wheels are 1.24 m across on a rocker: a rock that stands under
 * ROVER_CLEAR goes under them with a jolt and a little speed lost, and only a boulder is in its way. (It used the
 * astronaut's rule, 0.4 m, and a circle of 2 m: a knee-high rock a metre off its flank stopped it like a wall, and
 * every frame of touching one took two thirds of its speed, so it could not build the speed to get away.)
 */
export const ROVER_CLEAR = 0.9;
/** Its body, for what it runs into: three circles down its length, [metres ahead of its middle, radius]. */
const BODY = [[1.45, 1.2], [0, 1.25], [-1.45, 1.2]];
let under = new Set(), underNow = new Set();
const _bp = new THREE.Vector3(), _bn = new THREE.Vector3(), _bc = new THREE.Vector3(), _hitN = new THREE.Vector3();
/**
 * The rover against the rocks round it. A boulder pushes its body out, and the push is all it does to where the
 * rover stands: it slides along the boulder. Returns how far in the deepest boulder had it (0: none), with the way
 * out of that one in _hitN. A rock it clears jolts it once, as it comes under.
 */
function roverRocks() {
  const RV = roverF;
  let deep = 0;
  underNow.clear();
  for (const c of rockColliders) {
    const tall = c.h === undefined || c.h >= ROVER_CLEAR;
    for (const [ahead, br] of BODY) {
      roverUp(_up); _fw.set(0, 0, -1).applyQuaternion(RV.q);
      _bp.copy(_up).multiplyScalar(R).addScaledVector(_fw, ahead).normalize();
      const sep = angDist(_bp.x, _bp.y, _bp.z, c.v.x, c.v.y, c.v.z) * R;
      if (!tall) {
        // under the wheels: once, as it comes under, the body is kicked up at the end and the side the rock is on
        if (sep < c.r * 0.6 + br * 0.75 && !underNow.has(c)) {
          underNow.add(c);
          if (!under.has(c) && Math.abs(RV.speed) > 0.5) {
            const k = clamp(c.h / ROVER_CLEAR, 0.35, 1) * clamp(Math.abs(RV.speed) / 9, 0.25, 1);
            _rt.set(1, 0, 0).applyQuaternion(RV.q);
            _bn.copy(c.v).sub(_up);
            RV.heaveV += 1.5 * k;
            RV.pitchV += Math.sign(_bn.dot(_fw) || 1) * 0.9 * k;
            RV.rollV -= Math.sign(_bn.dot(_rt) || 1) * 0.7 * k;
            RV.speed *= 1 - 0.05 * k;
            S.shake = Math.max(S.shake, 0.14 * k);
            RV.jolts++;
            emit('rover-jolt', { k });
          }
        }
        continue;
      }
      const min = c.r + br;
      if (sep >= min || sep < 0.01) continue;
      // the way out: along the ground, from the boulder to this part of the body
      _bn.copy(_bp).sub(_bc.copy(c.v).multiplyScalar(_bp.dot(c.v)));
      if (_bn.lengthSq() < 1e-12) continue;
      _bn.normalize();
      const d = min - sep;
      _rt.set(1, 0, 0).applyQuaternion(RV.q);
      const px = _bn.dot(_rt), pz = -_bn.dot(_fw), pl = Math.hypot(px, pz);
      if (pl > 1e-6) frameMove(RV.q, px / pl, pz / pl, d, R);
      if (d > deep) { deep = d; _hitN.copy(_bn); }
    }
  }
  const t = under; under = underNow; underNow = t;
  return deep;
}

export function initRoverAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, roverF.q);
  roverF.speed = 0; roverF.steer = 0; roverF.pitch = 0; roverF.roll = 0; roverF.pitchV = 0; roverF.rollV = 0; roverF.heave = 0; roverF.heaveV = 0;
  syncRoverVisual(0);
}
export function roverUp(out) { return out.set(0, 1, 0).applyQuaternion(roverF.q); }

/** Seat the rover model on the terrain: height, sprung pitch and roll, and each wheel on the ground. */
export function syncRoverVisual(dt) {
  const RV = roverF, G = World.rover.group;
  roverUp(_up);
  const ground = surfaceAt(_up);
  _fw.set(0, 0, -1).applyQuaternion(RV.q);
  _rt.set(1, 0, 0).applyQuaternion(RV.q);
  G.position.copy(_up).multiplyScalar(ground);
  // terrain under the axles and the two sides
  const hF = surfaceAt(_pv.copy(G.position).addScaledVector(_fw, 1.9));
  const hB = surfaceAt(_pv.copy(G.position).addScaledVector(_fw, -1.9));
  const hR = surfaceAt(_pv.copy(G.position).addScaledVector(_rt, 1.25));
  const hL = surfaceAt(_pv.copy(G.position).addScaledVector(_rt, -1.25));
  // Its weight shows: the nose lifts as it gathers way and dips as it brakes, and it leans out of a turn. (It rode
  // as the ground lay and nothing else: a box on rails, braking and cornering flat.)
  const squat = clamp(RV.accel * 0.009, -0.1, 0.08), lean = clamp(RV.lat * 0.004, -0.09, 0.09);
  // And the ground is never as smooth as its height says: over sand at speed the body works on its springs, a
  // degree or two of rocking and a few centimetres of lift, by the distance covered and not by the clock, and near
  // the pace at which its springs answer it rocks most. (Level as a table at 80 km/h over rippled sand: both
  // reviewers of the frame strips, twice, called it light.)
  if (dt > 0) RV.odo = (RV.odo || 0) + Math.abs(RV.speed) * dt;
  const rough = clamp(Math.abs(RV.speed) / 9, 0, 1), o = RV.odo || 0;
  const bumpP = (Math.sin(o * 0.55) * 0.6 + Math.sin(o * 0.23 + 1.3) * 0.4) * 0.03 * rough;
  const bumpR = (Math.sin(o * 0.47 + 2.1) * 0.6 + Math.sin(o * 0.19) * 0.4) * 0.026 * rough;
  const bumpH = Math.sin(o * 0.71 + 0.6) * 0.035 * rough;
  // Over a crest the ground under its middle stands above its wheels: the body rides up on it, not down into it.
  // (Its belly, half a metre up, touched the crest of the canyon's rim at speed: tests/motion.mjs measured it.)
  const tPitch = Math.atan2(hF - hB, 3.8) + squat + bumpP, tRoll = Math.atan2(hL - hR, 2.5) + lean + bumpR, tHeave = Math.max(-0.28, (hF + hB + hR + hL) / 4 - ground) + bumpH;
  if (dt <= 0) { RV.pitch = tPitch; RV.roll = tRoll; RV.heave = tHeave; RV.pitchV = RV.rollV = RV.heaveV = 0; }
  else {
    // a stiff, well-damped spring toward the terrain's attitude: the body lags and settles
    // (damped a little under half of critical: it rocks once after a bump and settles. At seven tenths it took a
    //  bump without a sign, and rode a boulder field level.)
    const k = 110, c = 10;
    RV.pitchV += ((tPitch - RV.pitch) * k - RV.pitchV * c) * dt; RV.pitch += RV.pitchV * dt;
    RV.rollV += ((tRoll - RV.roll) * k - RV.rollV * c) * dt; RV.roll += RV.rollV * dt;
    RV.heaveV += ((tHeave - RV.heave) * 160 - RV.heaveV * 12) * dt; RV.heave += RV.heaveV * dt;
    RV.pitch = clamp(RV.pitch, -0.9, 0.9); RV.roll = clamp(RV.roll, -0.8, 0.8); RV.heave = clamp(RV.heave, -0.34, 0.6);
  }
  G.position.addScaledVector(_up, RV.heave);
  G.quaternion.copy(RV.q)
    .multiply(_q2.setFromAxisAngle(X_AXIS, RV.pitch))
    .multiply(_q1.setFromAxisAngle(Z_AXIS, RV.roll));
  World.roverCollider.v.copy(_up);
  // wheels: each follows the ground under it within its suspension travel
  const rv = World.rover;
  if (rv.wheels.length === 6) {
    if (!rv.wheelRest) rv.wheelRest = rv.wheels.map((w) => ({ y: w.position.y, pos: w.getWorldPosition(new THREE.Vector3()).sub(G.position).applyQuaternion(_q1.copy(G.quaternion).invert()) }));
    G.updateMatrixWorld(true);
    for (let i = 0; i < 6; i++) {
      const w = rv.wheels[i], rest = rv.wheelRest[i];
      _w.copy(rest.pos).applyQuaternion(G.quaternion).add(G.position);
      const gh = surfaceAt(_w);
      const hubHeight = _w.length() - gh;                    // where the hub is above the ground now
      const want = clamp(WHEEL_RADIUS - hubHeight, -0.22, 0.28);
      w.userData.travel = lerp(w.userData.travel || 0, want, dt > 0 ? damp(0.04, dt) : 1);
      w.position.y = rest.y + w.userData.travel;
    }
  }
}

/**
 * Getting in takes three quarters of a second and has him in it: he steps to the hull, and in the last of it goes up
 * and in. (He stood at the rover's tail, was gone between one frame and the next, and was in the seat: both
 * reviewers of the frame strips, twice.) game/player.js walks him there and draws the climb; S.boarding is its clock.
 */
const BOARD_T = 0.75;
export function boardRover() {
  if (S.mode !== 'walk' || S.boarding) return;
  S.boarding = { t: 0, dur: BOARD_T };
  input.eHeld = false;
}
export function updateBoarding(dt) {
  const b = S.boarding;
  if (!b) return;
  b.t += dt;
  // (anything that took him from the rover meanwhile, a checkpoint restored, calls it off)
  const near = World.rover && player.pos.distanceTo(World.rover.group.position) < 6;
  if (b.t >= b.dur || S.mode !== 'walk' || S.over || !near) { S.boarding = null; if (S.mode === 'walk' && !S.over && near) enterRover(); }
}

export function enterRover() {
  S.mode = 'rover';
  roverF.camInit = false; roverF.camYaw = 0; roverF.camPitch = 0; roverF.camRise = 0; roverF.camSee = 0;
  roverF.seatYaw = 0; roverF.seatPitch = SEAT_REST;
  input.yaw = 0; input.pitch = 0;
  Snd.play('roverEnter');
  emit('rover-enter', {});
}
/**
 * The driver asks to get out. Standing, or at a crawl, he does. At speed the rover pulls up first and he gets out as
 * it stops. (EXIT took one tap at a hundred kilometres an hour and put him on the ground beside a rover stopped dead;
 * three reviewers asked what a stray thumb would do.) Any throttle takes the asking back.
 */
export function leaveRover() {
  if (S.mode !== 'rover') return;
  if (Math.abs(roverF.speed) < 2.5) exitRover(); else roverF.leaving = true;
}

export function exitRover() {
  S.mode = 'walk';
  roverF.speed = 0;
  roverF.leaving = false;
  roverF.accel = 0; roverF.lat = 0;                      // (parked, it sits level on its springs)
  player.q.copy(roverF.q);
  frameMove(player.q, 1, 0, 3.4, R);                // step out to the side
  collideUnit(player.q, 0.42);
  player.alt = 0; player.vy = 0; player.vx = 0; player.vz = 0; player.face = 0; player.onGround = true;
  syncPlayerPos();
  Snd.play('roverExit');
  emit('rover-exit', {});
}

/**
 * The rover's lamps, every frame, driven or parked. The headlamps burn only with a driver in the seat: parked, their
 * bars are dark and only the red and amber markers show, enough to find it by. (They were set while driving and at
 * no other time, so a rover that had never been driven at night stood with its bars alight and no light on the ground.)
 */
export function roverLights(dt) {
  const rv = World.rover;
  if (!rv) return;
  const dim = (World.dark || 0) > 0.4 || S.storm.i > 0.5, driven = S.mode === 'rover';
  // (driven, its wide lamps are its own; on foot that lamp is his, a beam from his helmet: game/player.js, mountLamps)
  // (its strength is set against how it falls off: game/player.js, LAMPS.flood. It grows with distance, so that the
  //  ground thirty metres out is lit as it was and the rover itself, six metres from the lamp and square on to it, is
  //  not floodlit white.)
  if (driven) rv.headlight.intensity = lerp(rv.headlight.intensity, dim ? 1.2 : 0, damp(0.15, dt));
  // (The headlamps are seen from in front of the rover, not through it: from the chase camera their lit lenses showed
  //  through the cab's glass as two haloed dots, with the road ahead dark between them.)
  let ahead = 1;
  const cam = ctx.engine && ctx.engine.camera;
  if (cam && rv.model && rv.model.inner) {
    _fw.set(0, 0, 1).transformDirection(rv.model.inner.matrixWorld);
    _w.copy(cam.position).sub(rv.group.position).normalize();
    ahead = clamp((_fw.dot(_w) + 0.1) / 0.35, 0, 1);
  }
  for (const m of rv.lamps) m.emissiveIntensity = m.userData.baseEmissive * (dim && (driven || m.userData.marker) ? 1.6 * (m.userData.marker ? 1 : 0.04 + 0.96 * ahead) : 0.12);
  rv.markers = lerp(rv.markers, dim ? 1 : 0, damp(0.15, dt));
  // The cab's own lamp: on after dark with a driver in it, low and warm, enough to see the wheel and his hands by and
  // not enough to put the windscreen out. (A light in the shader of what is inside the cab: world/models.js, uCabin.)
  // From the seat its panes are looked out through (world/models.js, paneView), and the storm's veil stays off what
  // of the picture is the cab (render/engine.js, cabMask). Here, where every frame comes, and not with the driving:
  // a driver who dies in the seat, or is taken from it by a checkpoint, leaves neither behind him.
  const seated = driven && !!S.cockpit && !!rv.seat;
  paneView.value = lerp(paneView.value, seated ? 1 : 0, Math.min(1, dt * 6));
  if (seated && !rv.cabThings) rv.cabThings = [rv.model.part('cabin'), rv.seat].filter(Boolean);
  if (ctx.engine) ctx.engine.cabThings = seated && roverF.camBlend >= 1 ? rv.cabThings : null;
  // (and the cab's fittings are not drawn from further off than they can be made out through its glass)
  if (!rv.cabin) rv.cabin = rv.model.part('cabin');
  if (rv.cabin && cam) rv.cabin.visible = seated || cam.position.distanceToSquared(rv.group.position) < 70 * 70;
  const cabin = dustUniforms.uCabin.value, lamp = driven && dim ? 1 : 0;
  RVL.cab = lerp(RVL.cab, lamp, damp(0.25, dt));
  cabin.set(0.075 * RVL.cab, 0.062 * RVL.cab, 0.048 * RVL.cab, 0.5);
}
const RVL = { cab: 0 };

export function updateRover(dt) {
  const RV = roverF, k = input.keys, t = input.touch;
  // --- driver input ----------------------------------------------------------------------
  let throttle = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
  if (Math.abs(t.joyY) > 0.2) throttle = clamp(-t.joyY * 1.2, -1, 1);
  let steerIn = (k['a'] || k['arrowleft'] ? 1 : 0) - (k['d'] || k['arrowright'] ? 1 : 0);
  if (Math.abs(t.joyX) > 0.15) steerIn = clamp(-t.joyX * 1.2, -1, 1);
  // (asked to stop and let him out: it brakes, and he is out as it comes to a crawl; the throttle takes it back)
  if (RV.leaving) {
    if (throttle !== 0) RV.leaving = false;
    else if (Math.abs(RV.speed) < 2.5) { exitRover(); return; }
  }
  RV.throttle = throttle;
  const dead = S.roverPower <= 0.5;
  const top = dead ? 5 : roverTopSpeed();            // a dead battery leaves an emergency crawl

  // --- the hill it is on -----------------------------------------------------------------
  roverUp(_up);
  _fw.set(0, 0, -1).applyQuaternion(RV.q);
  RV.slope = groundSlope(World.rover.group.position, 3.2, _down);
  const grade = -_down.dot(_fw) * RV.slope;          // >0 nose uphill
  const g = BAL.gravity;

  // --- longitudinal: drive force fades toward top speed; gravity pulls along the grade -------
  const dir = Math.sign(RV.speed) || Math.sign(throttle) || 1;
  let acc = 0;
  if (throttle > 0) acc += 11 * throttle * clamp(1 - RV.speed / top, 0, 1) * (RV.speed < 0 ? 1.8 : 1);
  else if (throttle < 0) acc += RV.speed > 0.5 ? -17 : -8 * clamp(1 + RV.speed / 9, 0, 1);   // brake, then reverse to 9 m/s
  acc -= g * grade / Math.sqrt(1 + grade * grade);                                            // weight along the slope
  acc -= dir * (0.35 + Math.abs(RV.speed) * 0.045);                                           // rolling drag
  if (throttle === 0 && Math.abs(RV.speed) < 3) acc -= RV.speed * 2.2;                        // parking brake
  if (RV.leaving) acc -= Math.sign(RV.speed) * 17;                                            // pulling up to let him out
  RV.speed += acc * dt;
  RV.accel = acc * (RV.speed < -0.5 ? -1 : 1);            // (as the body feels it: forward is nose up)
  // too steep for the wheels to hold: it will not climb, and slides back
  // (and a climb costs it pace from one in twelve up: a fifth of its top speed at one in five, half at two in five.
  //  It took a volcano's flank at the pace it took a plain.)
  const limit = clamp(1.12 - grade * 1.5, 0, 1);
  if (grade > 0.08 && RV.speed > top * limit) RV.speed = lerp(RV.speed, top * limit, damp(0.25, dt));
  RV.speed = clamp(RV.speed, -9, top * 1.15);
  // Left alone it stands where it is: its brakes hold it on anything it could climb. (The drag that slows it to rest
  // only slowed it: parked on a slope it crept downhill at a walking pace for as long as it stood there.)
  if (throttle === 0 && Math.abs(RV.speed) < 0.9 && Math.abs(grade) < 0.8) RV.speed = 0;

  // --- steering: a steer angle that tightens up at speed --------------------------------------
  const maxSteer = lerp(0.55, 0.16, clamp(Math.abs(RV.speed) / 40, 0, 1));
  RV.steer = lerp(RV.steer, steerIn * maxSteer, damp(steerIn ? 0.12 : 0.08, dt));
  if (Math.abs(RV.speed) > 0.05) frameYaw(RV.q, (RV.speed * Math.tan(RV.steer) / 3.8) * dt);
  RV.lat = RV.speed * RV.speed * Math.tan(RV.steer) / 3.8;      // (sideways pull in a turn: the body leans out of it)
  // sideways slip on a cross slope, noticeable only when it is steep
  _rt.set(1, 0, 0).applyQuaternion(RV.q);
  const cross = _down.dot(_rt) * RV.slope;
  RV.slip = Math.abs(cross) > 0.55 ? Math.sign(cross) * (Math.abs(cross) - 0.55) * 9 : 0;

  // --- move --------------------------------------------------------------------------------
  const dist = RV.speed * dt;
  if (Math.abs(dist) > 1e-5) { frameMove(RV.q, 0, -Math.sign(dist), Math.abs(dist), R); S.stats.driven += Math.abs(dist); }
  if (RV.slip) frameMove(RV.q, Math.sign(RV.slip), 0, Math.abs(RV.slip) * dt, R);
  // --- what it runs into -----------------------------------------------------------------------
  // Things built and landed (a circle a little wider than its body: they have corners), then the boulders.
  let hit = collideUnit(RV.q, 1.7, Infinity) && contact.disc ? 1 : 0;
  if (hit) _hitN.copy(contact.n);
  const deep = roverRocks();
  if (deep > 0) hit = 1;
  if (hit) {
    // What it loses is what was carrying it into the thing: head on it stops, a glancing touch costs it little, and
    // backing off costs nothing. By the clock, not by the frame. And the nose is turned off the thing while the
    // throttle holds it there, so it comes round a boulder by itself and is never pinned on one.
    _fw.set(0, 0, -1).applyQuaternion(RV.q); _rt.set(1, 0, 0).applyQuaternion(RV.q);
    const way = Math.sign(RV.speed) || Math.sign(throttle) || 1;
    const into = clamp(-way * _fw.dot(_hitN), 0, 1);
    if (into > 0) {
      if (!RV.touching) RV.hits++;
      if (!RV.touching && Math.abs(RV.speed) > 6) { S.shake = Math.max(S.shake, 0.35 * into); emit('rover-bump', { speed: Math.abs(RV.speed) * into }); }
      // ... and the body takes it: the nose goes down, it rolls off the side that struck, and it lifts. (A strike was a
      // number on the dial and a sound: the body rode on level.)
      if (!RV.touching) {
        const hard = into * clamp(Math.abs(RV.speed) / 14, 0.25, 1), sideHit = Math.sign(_hitN.dot(_rt)) || 1;
        RV.pitchV -= 1.5 * hard * way; RV.rollV += 1.1 * hard * sideHit; RV.heaveV += 1.2 * hard;
      }
      RV.speed *= Math.exp(-dt * (1 - Math.sqrt(1 - into * into)) / 0.12);
      if (throttle * way > 0.1) {
        const side = Math.abs(_hitN.dot(_rt)) > 0.04 ? Math.sign(_hitN.dot(_rt)) : (Math.sign(steerIn) ? -Math.sign(steerIn) : 1);
        frameYaw(RV.q, -side * way * into * 0.9 * dt);
      }
    }
    RV.touching = true;
  } else RV.touching = false;
  RV.q.normalize();
  syncRoverVisual(dt);

  // keep the player frame with the rover so the map, objectives and clock stay live
  player.q.copy(RV.q);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();

  // --- power: drains with speed and effort (more at night); trickle-charges parked in the sun ----
  const sunEl = roverUp(_v1).dot(ctx.engine.sunDir);
  const night = sunEl < 0.05;
  if (Math.abs(RV.speed) > 0.5) {
    let drain = (BAL.roverDrainPerMin / 60) * (0.5 + Math.abs(RV.speed) / roverTopSpeed()) * (1 + Math.max(0, grade) * 1.5) * (1 + (1 - machineEff('rover')) * 0.7);
    wearRover(Math.abs(RV.speed) * dt);
    if (night) drain *= S.upgrades.roverBattery ? 1.5 : 2;
    S.roverPower = clamp(S.roverPower - drain * dt, 0, roverPowerCap());
  } else if (!night) {
    S.roverPower = clamp(S.roverPower + (2 / 60) * sunEl * dt, 0, roverPowerCap());
  }

  // --- wheels, steering links, lamps, dish ------------------------------------------------
  const rv = World.rover;
  const spin = (RV.speed * dt) / WHEEL_RADIUS;
  for (const w of rv.wheels) w.rotation.x += spin;
  if (rv.steer.FL) { rv.steer.FL.rotation.y = RV.steer; rv.steer.FR.rotation.y = RV.steer; }
  if (rv.steer.RL) { rv.steer.RL.rotation.y = -RV.steer * 0.45; rv.steer.RR.rotation.y = -RV.steer * 0.45; }
  if (rv.dish) rv.dish.rotation.y += dt * 0.15;
  // The wheel in his hands: as far over as the steering is asked to go, of what the speed allows. His hands are on
  // it by the Drive clip, which game/player.js holds at the moment of its small steering motion that has the wheel
  // this far over: so they go with it. (rv.wheelTurn: radians, to the right positive, the clip's own way round.)
  rv.wheelTurn = -clamp(RV.steer / maxSteer, -1, 1) * WHEEL_TURN;
  if (rv.yoke) rv.yoke.quaternion.setFromAxisAngle(YOKE_AXIS, -rv.wheelTurn);

  // --- camera: from behind the rover, or from the driver's seat ----------------------------
  // (changed on the way, the picture goes from the one to the other: it does not cut)
  if (!!S.cockpit !== RV.camSeat) { RV.camSeat = !!S.cockpit; if (RV.camInit) RV.camInit = false; RV.seatYaw = 0; RV.seatPitch = SEAT_REST; }
  if (S.cockpit && World.rover.seat) seatCamera(dt); else chaseCamera(dt);
  S.inside = false;
}

/**
 * The driver's own view: the camera is his eyes, in the seat, and the cab rides with it. (The owner: "Would be dope to
 * have 1P view in the rover (need to be able to see the cockpit etc)".) It is fixed to the sprung body, not to his
 * head: the dashboard stands still in the picture and Mars moves in the glass. A look-drag turns his head, as far as
 * a man in a seat can turn it; under way, and left alone, he looks where he is going again. Parked, the look stays
 * where it was put: he is looking at something.
 */
const SEAT_EYE = [0.015, 0.716, 0.077], SEAT_REST = -0.14, SEAT_T = 0.55;
const _seatP = new THREE.Vector3(), _seatQ = new THREE.Quaternion(), _halfTurn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
function seatCamera(dt) {
  const RV = roverF, rv = World.rover, c = ctx.engine.camera;
  if (input.yaw || input.pitch) {
    RV.seatYaw = clamp(RV.seatYaw + input.yaw, -2.25, 2.25);
    RV.seatPitch = clamp(RV.seatPitch + input.pitch * (input.invertY ? -1 : 1), -0.85, 0.7);
    RV.camIdle = 0;
  }
  input.yaw = 0; input.pitch = 0;
  RV.camIdle += dt;
  if (RV.camIdle > 2.2 && Math.abs(RV.speed) > 1.5) { RV.seatYaw = lerp(RV.seatYaw, 0, damp(0.4, dt)); RV.seatPitch = lerp(RV.seatPitch, SEAT_REST, damp(0.4, dt)); }
  rv.group.updateWorldMatrix(true, false);
  rv.seat.updateWorldMatrix(true, false);
  _seatP.set(SEAT_EYE[0], SEAT_EYE[1], SEAT_EYE[2]).applyMatrix4(rv.seat.matrixWorld);
  // (the model's nose is +Z, a camera looks along -Z. And his head goes a little with the wheel, into the turn.)
  rv.model.inner.getWorldQuaternion(_seatQ).multiply(_halfTurn)
    .multiply(_q2.setFromAxisAngle(_v3.set(0, 1, 0), RV.seatYaw + RV.steer * 0.1 * clamp(Math.abs(RV.speed) / 8, 0, 1)))
    .multiply(_q2.setFromAxisAngle(_v3.set(1, 0, 0), RV.seatPitch));
  if (!RV.camInit) {
    RV.camFromP = (RV.camFromP || new THREE.Vector3()).copy(c.position);
    RV.camFromQ = (RV.camFromQ || new THREE.Quaternion()).copy(c.quaternion);
    RV.camBlend = c.position.distanceTo(_seatP) < 40 ? 0 : 1;
    RV.camInit = true;
  }
  if (RV.camBlend < 1) {
    RV.camBlend = Math.min(1, RV.camBlend + dt / SEAT_T);
    const e = RV.camBlend * RV.camBlend * (3 - 2 * RV.camBlend);
    c.position.copy(RV.camFromP).lerp(_seatP, e);
    c.quaternion.copy(RV.camFromQ).slerp(_seatQ, e);
  } else { c.position.copy(_seatP); c.quaternion.copy(_seatQ); }
  RV.camPos.copy(c.position);                      // (so that the view from behind, asked for again, starts from here)
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    if (!input.reducedMotion) c.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.05);
  }
  // (a wider lens than from behind: a cab is a small room, and the dashboard and both corner panes belong in the picture)
  c.fov = lerp(c.fov, Math.min(74, ctx.engine.baseFov + 12 + Math.abs(RV.speed) * 0.1), damp(0.3, dt));
  c.updateProjectionMatrix();
}

function chaseCamera(dt) {
  const RV = roverF;
  // the mouse or a look-drag orbits it; it eases back behind the rover when left alone
  if (input.yaw || input.pitch) { RV.camYaw += input.yaw; RV.camPitch = clamp(RV.camPitch + input.pitch * (input.invertY ? -1 : 1), -0.5, 0.9); RV.camIdle = 0; }
  input.yaw = 0; input.pitch = 0;
  RV.camIdle += dt;
  if (RV.camIdle > 2.2) { RV.camYaw = lerp(RV.camYaw, 0, damp(0.5, dt)); RV.camPitch = lerp(RV.camPitch, 0, damp(0.5, dt)); }
  roverUp(_up);
  _q1.copy(RV.q).multiply(_q2.setFromAxisAngle(_v3.set(0, 1, 0), RV.camYaw + RV.steer * 0.35));
  const back = 9.8 + Math.abs(RV.speed) * 0.07, lift = 4.3 + RV.camPitch * 5;
  _v2.set(0, 0, 1).applyQuaternion(_q1);
  // It stands behind the rover along the slope the rover is on, not level with it: going down a canyon's wall the
  // ground ten metres behind is eight metres higher, and a camera kept level with the rover was under it. (Lifted
  // straight up to clear the ground and to see over it, it was twenty metres off and the rover a third of its size.)
  // `rise`: how much higher the ground stands a boom's length behind, eased so that a change of slope is a swing.
  const rise = clamp(-_down.dot(_v2) * Math.min(RV.slope, 1.3) * back, -2.5, 13);
  RV.camRise += (rise - RV.camRise) * Math.min(1, dt * 2.5);
  const along = back * Math.cos(RV.camPitch * 0.6), flat = 1 / Math.sqrt(1 + (RV.camRise / back) * (RV.camRise / back));
  _pv.copy(World.rover.group.position).addScaledVector(_v2, along * flat).addScaledVector(_up, (RV.camRise + lift) * flat);
  // Getting in, the camera goes from where it stood behind him to its place behind the rover, and turns as it goes:
  // it does not cut. (From further off than a getting-in can be, a saved game opened in the seat, it starts in place.)
  if (!RV.camInit) {
    const c0 = ctx.engine.camera;
    if (c0.position.distanceTo(_pv) < 30) { RV.camPos.copy(c0.position); RV.camFromQ = (RV.camFromQ || new THREE.Quaternion()).copy(c0.quaternion); RV.camBlend = 0; }
    else { RV.camPos.copy(_pv); RV.camBlend = 1; }
    RV.camInit = true;
  }
  RV.camPos.lerp(_pv, damp(RV.camBlend < 1 ? 0.045 : 0.12, dt));      // (slower while it comes round from where it stood behind him)
  // ... but it is not left behind. Eased alone, it trailed by a dozen metres at speed: down the canyon's wall at
  // 90 km/h the rover was a third of its size, and round a bend the view came swinging after it.
  { const behind = RV.camPos.distanceTo(_pv), most = 2.4; if (RV.camBlend >= 1 && behind > most) RV.camPos.lerp(_pv, 1 - most / behind); }
  // It keeps a metre over the ground, and rides over a boulder that comes under it: the lift comes on over the last
  // metre and a half to the rock's edge, and eases, so the picture rises and does not jump. (It went straight
  // through a three-metre rock on the canyon's rim: tests/motion.mjs found the camera inside it.)
  let over = 0;
  _v1.copy(RV.camPos).normalize();
  for (const rc of rockColliders) {
    if (rc.h < 0.9) continue;
    const d = Math.hypot(_v1.x - rc.v.x, _v1.y - rc.v.y, _v1.z - rc.v.z) * R - rc.r;
    if (d < 1.6) over = Math.max(over, (rc.h - 0.5) * clamp(1 - d / 1.6, 0, 1));
  }
  RV.camLift += (over - RV.camLift) * Math.min(1, dt * (over > RV.camLift ? 10 : 2.5));
  const floor = surfaceAt(RV.camPos) + 1.0 + RV.camLift;
  if (RV.camPos.length() < floor) RV.camPos.normalize().multiplyScalar(floor);
  const c = ctx.engine.camera;
  c.position.copy(RV.camPos);
  // And it keeps the rover in sight. Going down a slope the ground behind is higher than the rover: a camera a metre
  // over it looks along the slope, and the first crest between hides the wheels, then the whole rover. So the line
  // from the camera to the rover's roof is tried against the ground, and the camera rises by what it takes to clear
  // it: quickly up, slowly down again. (tests/motion.mjs: "rover-hidden".)
  {
    _v3.copy(World.rover.group.position).addScaledVector(_up, 1.7);
    let need = 0;
    // (tried over the three quarters of the line nearest the camera: the last of it is the ground the rover stands
    //  on. And six metres at the most: more than that is a lurch, and the rover small in the picture.)
    for (let i = 1; i <= 6; i++) {
      const t = i / 8;
      _v1.lerpVectors(c.position, _v3, t);
      const under = surfaceAt(_v1) + 0.55 - _v1.length();
      if (under > 0) need = Math.max(need, under / (1 - t));
    }
    need = Math.min(need, 6);
    RV.camSee += (need - RV.camSee) * Math.min(1, dt * (need > RV.camSee ? 5 : 1.2));
    if (RV.camSee > 0.01) c.position.addScaledVector(_up, RV.camSee);
    // (and whatever the ground asks of it, it is never further off than half as far again as its usual place)
    const off = c.position.distanceTo(World.rover.group.position), most = 17.5;
    if (off > most && RV.camBlend >= 1) c.position.sub(World.rover.group.position).multiplyScalar(most / off).add(World.rover.group.position);
  }
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    if (!input.reducedMotion) c.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  // (aimed a little lower than its roof: the rover stands higher in the picture, clear of the panel at the foot of
  //  a phone's screen, which lay over its wheels)
  camLookAt(_v3.copy(World.rover.group.position).addScaledVector(roverUp(_v1), 1.4).addScaledVector(_fw.set(0, 0, -1).applyQuaternion(RV.q), 2.5 + Math.abs(RV.speed) * 0.1), roverUp(_v1));
  if (RV.camBlend < 1) {
    RV.camBlend = Math.min(1, RV.camBlend + dt / 0.8);
    const e = RV.camBlend * RV.camBlend * (3 - 2 * RV.camBlend);
    _q1.copy(c.quaternion); c.quaternion.copy(RV.camFromQ).slerp(_q1, e);
  }
  c.fov = lerp(c.fov, ctx.engine.baseFov + 4 + Math.abs(RV.speed) * 0.22, damp(0.3, dt));
  c.updateProjectionMatrix();
}
