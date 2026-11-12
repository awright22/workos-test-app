import * as THREE from 'three';
import { frameQuat } from '../planet/geo.js';
import { X_AXIS, _pv, _q1, _q2, _v1, _v2, _v3 } from '../core/scratch.js';
import { World } from '../world/build.js';
import { surfaceAt } from '../planet/surface.js';
import { BAL, S, roverPowerCap, roverTopSpeed } from './state.js';
import { Snd } from '../audio/sound.js';
import { camLookAt, collideUnit, frameMove, frameYaw, player, syncPlayerPos } from './player.js';
import { R } from '../planet/constants.js';
import { input } from './input.js';
import { clamp, lerp } from '../core/math.js';
import { ctx } from './ctx.js';
// The rover: driving, chase camera, its own power and oxygen.
export const roverF = { q: new THREE.Quaternion(), speed: 0, camPos: new THREE.Vector3(), camInit: false };
export function initRoverAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, roverF.q);
  syncRoverVisual(0);
}
export function roverUp(out) { return out.set(0, 1, 0).applyQuaternion(roverF.q); }
export function syncRoverVisual(dt) {
  const G = World.rover.group;
  roverUp(_v1);
  const ground = surfaceAt(_v1);
  G.position.copy(_v1).multiplyScalar(ground);
  // sample terrain fore/aft/side for a visual tilt
  _v2.set(0, 0, -1).applyQuaternion(roverF.q);      // forward
  _v3.crossVectors(_v2, _v1).negate();              // right? (up x fwd)
  const s = 2.0;
  const hF = surfaceAt(_pv.copy(G.position).addScaledVector(_v2, s));
  const hB = surfaceAt(_pv.copy(G.position).addScaledVector(_v2, -s));
  const hR = surfaceAt(_pv.copy(G.position).addScaledVector(_v3, 1.4));
  const hL = surfaceAt(_pv.copy(G.position).addScaledVector(_v3, -1.4));
  const pitch = Math.atan2(hF - hB, 2 * s), roll = Math.atan2(hL - hR, 2.8);
  G.quaternion.copy(roverF.q)
    .multiply(_q2.setFromAxisAngle(X_AXIS, pitch))
    .multiply(_q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll));
  World.roverCollider.v.copy(_v1);
}
export function enterRover() {
  S.mode = 'rover';
  roverF.camInit = false;
  Snd.play('roverEnter');
}
export function exitRover() {
  S.mode = 'walk';
  player.q.copy(roverF.q);
  frameMove(player.q, 1, 0, 3.2, R);                // step out to the side
  collideUnit(player.q, 0.42);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
  Snd.play('roverExit');
}
export function updateRover(dt) {
  const RV = roverF;
  const top = S.roverPower > 0.5 ? roverTopSpeed() : 6;   // dead battery = emergency crawl
  let acc = 0;
  if (input.keys['w'] || input.keys['arrowup']) acc = 14;
  if (input.keys['s'] || input.keys['arrowdown']) acc = -9;
  if (input.touch.joyY < -0.2) acc = 14 * -input.touch.joyY;
  if (input.touch.joyY > 0.25) acc = -9 * input.touch.joyY;
  RV.speed += acc * dt;
  RV.speed *= Math.pow(0.4, dt);
  RV.speed = clamp(RV.speed, -8, top);
  let steer = ((input.keys['a'] || input.keys['arrowleft']) ? 1 : 0) - ((input.keys['d'] || input.keys['arrowright']) ? 1 : 0);
  if (Math.abs(input.touch.joyX) > 0.15) steer = -input.touch.joyX;
  if (Math.abs(RV.speed) > 0.4)
    frameYaw(RV.q, steer * dt * 1.5 * clamp(Math.abs(RV.speed) / 8, 0.3, 1) * Math.sign(RV.speed));
  if (Math.abs(RV.speed) > 0.01) {
    frameMove(RV.q, 0, -Math.sign(RV.speed), Math.abs(RV.speed) * dt, R);
    S.stats.driven += Math.abs(RV.speed) * dt;
  }
  const hadHit = collideUnit(RV.q, 2.0);
  if (hadHit) RV.speed *= 0.5;
  RV.q.normalize();
  syncRoverVisual(dt);
  // keep the player frame glued to the rover so map/objectives/clock stay live
  player.q.copy(RV.q);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
  // rover power: drains while driving (worse at night), trickle solar when parked in daylight
  const sunEl = _v1.set(0, 1, 0).applyQuaternion(RV.q).dot(ctx.engine.sunDir);
  const night = sunEl < 0.05;
  if (Math.abs(RV.speed) > 0.5) {
    let drain = (BAL.roverDrainPerMin / 60) * (0.5 + Math.abs(RV.speed) / roverTopSpeed());
    if (night) drain *= S.upgrades.roverBattery ? 1.5 : 2;
    S.roverPower = clamp(S.roverPower - drain * dt, 0, roverPowerCap());
  } else if (!night) {
    S.roverPower = clamp(S.roverPower + (2 / 60) * sunEl * dt, 0, roverPowerCap());
  }
  World.rover.headlight.intensity = (night || S.storm.i > 0.5) ? 900 : 0;
  for (const w of World.rover.wheels) w.rotation.x -= RV.speed * dt * 1.8;
  // chase camera (smoothed in world space)
  roverUp(_v1);
  _v2.set(0, 0, -1).applyQuaternion(RV.q);
  _pv.copy(World.rover.group.position).addScaledVector(_v2, -9.5).addScaledVector(_v1, 4.6);
  if (!RV.camInit) { RV.camPos.copy(_pv); RV.camInit = true; }
  RV.camPos.lerp(_pv, 1 - Math.pow(0.0005, dt));
  ctx.engine.camera.position.copy(RV.camPos);
  camLookAt(_v3.copy(World.rover.group.position).addScaledVector(_v1, 1.8), _v1);
  ctx.engine.camera.fov = lerp(ctx.engine.camera.fov, 74 + Math.abs(RV.speed) * 0.25, 1 - Math.pow(0.001, dt));
  ctx.engine.camera.updateProjectionMatrix();
  S.inside = false;
}
