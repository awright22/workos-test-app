/*
 * The rover: a body frame on the sphere driven like a real vehicle. Throttle builds speed
 * toward the drivetrain's top speed, steering is a steer angle (so it cannot spin on the spot),
 * hills slow it and cliffs stop it, the body rides the terrain on a sprung suspension, each
 * wheel follows the ground, and the chase camera has weight.
 */
import * as THREE from 'three';
import { ctx } from './ctx.js';
import { frameQuat } from '../planet/geo.js';
import { X_AXIS, _pv, _q1, _q2, _v1, _v2, _v3 } from '../core/scratch.js';
import { surfaceAt, groundSlope } from '../planet/surface.js';
import { R } from '../planet/constants.js';
import { WHEEL_RADIUS, World } from '../world/build.js';
import { BAL, S, machineEff, roverPowerCap, roverTopSpeed } from './state.js';
import { wearRover } from './machines.js';
import { input } from './input.js';
import { player, frameMove, frameYaw, collideUnit, syncPlayerPos, camLookAt } from './player.js';
import { Snd } from '../audio/sound.js';
import { clamp, lerp, damp } from '../core/math.js';
import { emit } from '../core/events.js';

export const roverF = {
  q: new THREE.Quaternion(), speed: 0, steer: 0,
  camPos: new THREE.Vector3(), camInit: false, camYaw: 0, camPitch: 0, camIdle: 9,
  pitch: 0, roll: 0, pitchV: 0, rollV: 0, heave: 0, heaveV: 0,
  slope: 0, slip: 0, throttle: 0,
};
const _down = new THREE.Vector3(), _fw = new THREE.Vector3(), _rt = new THREE.Vector3(), _up = new THREE.Vector3(), _w = new THREE.Vector3();
const Z_AXIS = new THREE.Vector3(0, 0, 1);

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
  const tPitch = Math.atan2(hF - hB, 3.8), tRoll = Math.atan2(hL - hR, 2.5), tHeave = (hF + hB + hR + hL) / 4 - ground;
  if (dt <= 0) { RV.pitch = tPitch; RV.roll = tRoll; RV.heave = tHeave; RV.pitchV = RV.rollV = RV.heaveV = 0; }
  else {
    // a stiff, well-damped spring toward the terrain's attitude: the body lags and settles
    const k = 110, c = 15;
    RV.pitchV += ((tPitch - RV.pitch) * k - RV.pitchV * c) * dt; RV.pitch += RV.pitchV * dt;
    RV.rollV += ((tRoll - RV.roll) * k - RV.rollV * c) * dt; RV.roll += RV.rollV * dt;
    RV.heaveV += ((tHeave - RV.heave) * 160 - RV.heaveV * 18) * dt; RV.heave += RV.heaveV * dt;
    RV.pitch = clamp(RV.pitch, -0.9, 0.9); RV.roll = clamp(RV.roll, -0.8, 0.8); RV.heave = clamp(RV.heave, -0.6, 0.6);
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

export function enterRover() {
  S.mode = 'rover';
  roverF.camInit = false; roverF.camYaw = 0; roverF.camPitch = 0;
  input.yaw = 0; input.pitch = 0;
  Snd.play('roverEnter');
  emit('rover-enter', {});
}
export function exitRover() {
  S.mode = 'walk';
  roverF.speed = 0;
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
  rv.headlight.intensity = lerp(rv.headlight.intensity, driven && dim ? 11 : 0, damp(0.15, dt));
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
}

export function updateRover(dt) {
  const RV = roverF, k = input.keys, t = input.touch;
  // --- driver input ----------------------------------------------------------------------
  let throttle = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
  if (Math.abs(t.joyY) > 0.2) throttle = clamp(-t.joyY * 1.2, -1, 1);
  let steerIn = (k['a'] || k['arrowleft'] ? 1 : 0) - (k['d'] || k['arrowright'] ? 1 : 0);
  if (Math.abs(t.joyX) > 0.15) steerIn = clamp(-t.joyX * 1.2, -1, 1);
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
  RV.speed += acc * dt;
  // too steep for the wheels to hold: it will not climb, and slides back
  const limit = clamp(1.25 - grade * 1.55, 0, 1);
  if (grade > 0.2 && RV.speed > top * limit) RV.speed = lerp(RV.speed, top * limit, damp(0.25, dt));
  RV.speed = clamp(RV.speed, -9, top * 1.15);
  if (Math.abs(RV.speed) < 0.03 && throttle === 0) RV.speed = 0;

  // --- steering: a steer angle that tightens up at speed --------------------------------------
  const maxSteer = lerp(0.55, 0.16, clamp(Math.abs(RV.speed) / 40, 0, 1));
  RV.steer = lerp(RV.steer, steerIn * maxSteer, damp(steerIn ? 0.12 : 0.08, dt));
  if (Math.abs(RV.speed) > 0.05) frameYaw(RV.q, (RV.speed * Math.tan(RV.steer) / 3.8) * dt);
  // sideways slip on a cross slope, noticeable only when it is steep
  _rt.set(1, 0, 0).applyQuaternion(RV.q);
  const cross = _down.dot(_rt) * RV.slope;
  RV.slip = Math.abs(cross) > 0.55 ? Math.sign(cross) * (Math.abs(cross) - 0.55) * 9 : 0;

  // --- move --------------------------------------------------------------------------------
  const dist = RV.speed * dt;
  if (Math.abs(dist) > 1e-5) { frameMove(RV.q, 0, -Math.sign(dist), Math.abs(dist), R); S.stats.driven += Math.abs(dist); }
  if (RV.slip) frameMove(RV.q, Math.sign(RV.slip), 0, Math.abs(RV.slip) * dt, R);
  if (collideUnit(RV.q, 2.0)) { if (Math.abs(RV.speed) > 6) { S.shake = Math.max(S.shake, 0.35); emit('rover-bump', { speed: Math.abs(RV.speed) }); } RV.speed *= 0.35; }
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

  // --- chase camera -----------------------------------------------------------------------
  // the mouse or a look-drag orbits it; it eases back behind the rover when left alone
  if (input.yaw || input.pitch) { RV.camYaw += input.yaw; RV.camPitch = clamp(RV.camPitch + input.pitch * (input.invertY ? -1 : 1), -0.5, 0.9); RV.camIdle = 0; }
  input.yaw = 0; input.pitch = 0;
  RV.camIdle += dt;
  if (RV.camIdle > 2.2) { RV.camYaw = lerp(RV.camYaw, 0, damp(0.5, dt)); RV.camPitch = lerp(RV.camPitch, 0, damp(0.5, dt)); }
  roverUp(_up);
  _q1.copy(RV.q).multiply(_q2.setFromAxisAngle(_v3.set(0, 1, 0), RV.camYaw + RV.steer * 0.35));
  const back = 9.8 + Math.abs(RV.speed) * 0.07, lift = 4.3 + RV.camPitch * 5;
  _v2.set(0, 0, 1).applyQuaternion(_q1);
  _pv.copy(World.rover.group.position).addScaledVector(_v2, back * Math.cos(RV.camPitch * 0.6)).addScaledVector(_up, lift);
  if (!RV.camInit) { RV.camPos.copy(_pv); RV.camInit = true; }
  RV.camPos.lerp(_pv, damp(0.12, dt));
  const floor = surfaceAt(RV.camPos) + 1.0;
  if (RV.camPos.length() < floor) RV.camPos.normalize().multiplyScalar(floor);
  const c = ctx.engine.camera;
  c.position.copy(RV.camPos);
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    if (!input.reducedMotion) c.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  camLookAt(_v3.copy(World.rover.group.position).addScaledVector(roverUp(_v1), 1.9).addScaledVector(_fw.set(0, 0, -1).applyQuaternion(RV.q), 2.5 + Math.abs(RV.speed) * 0.1), roverUp(_v1));
  c.fov = lerp(c.fov, ctx.engine.baseFov + 4 + Math.abs(RV.speed) * 0.22, damp(0.3, dt));
  c.updateProjectionMatrix();
  S.inside = false;
}
