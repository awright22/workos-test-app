import * as THREE from 'three';
import { ctx } from './ctx.js';
import { angDist, frameQuat, groundDist } from '../planet/geo.js';
import { X_AXIS, Y_AXIS, _du, _q1, _q2, _v1, _v2, _v3 } from '../core/scratch.js';
import { surfaceAt } from '../planet/surface.js';
import { R } from '../planet/constants.js';
import { DOOR_HALF, HAB_R, World, colliders, siteLocalToWorld, siteWorldToLocal } from '../world/build.js';
import { BAL, S } from './state.js';
import { rockColliders } from '../world/rocks.js';
import { buildModel } from '../world/models.js';
import { input, moveInputMag, sprinting, touchJumpFresh } from './input.js';
import { interaction } from './interact.js';
import { clamp, lerp, perf } from '../core/math.js';
// The astronaut: a body frame on the sphere, walking, jumping, collision, animation, camera.
const _lm = new THREE.Matrix4();
/** Aim the game camera at a world position, keeping `up` upward. */
export function camLookAt(target, up) {
  const cam = ctx.engine.camera;
  _lm.lookAt(cam.position, target, up);
  cam.quaternion.setFromRotationMatrix(_lm);
}

export const player = {
  q: new THREE.Quaternion(),        // local +Y = up, -Z = facing
  pitch: -0.05, alt: 0, vy: 0, onGround: true, bob: 0,
  pos: new THREE.Vector3(),         // world position (feet), derived each frame
  up: new THREE.Vector3(0, 1, 0),
  eyeH: 1.62,
};
export function initPlayerAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, player.q);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
}
export function syncPlayerPos() {
  player.up.set(0, 1, 0).applyQuaternion(player.q);
  const ground = surfaceAt(player.up);
  player.pos.copy(player.up).multiplyScalar(ground + player.alt);
}
export const _axis = new THREE.Vector3();
export function frameMove(q, vx, vz, dist, radius) {
  // move the body frame along the local (vx, 0, vz) direction by dist meters
  _axis.set(vz, 0, -vx);
  if (_axis.lengthSq() < 1e-12) return;
  _axis.normalize();
  q.multiply(_q2.setFromAxisAngle(_axis, dist / radius));
}
export function frameYaw(q, dYaw) {
  q.multiply(_q2.setFromAxisAngle(Y_AXIS, dYaw));
}

// collision: push the player's unit direction out of collider discs (tangent-plane approx)
export function collideUnit(q, radius) {
  _v1.set(0, 1, 0).applyQuaternion(q);              // current up
  let moved = false;
  const test = (cv, cr) => {
    const sep = angDist(_v1.x, _v1.y, _v1.z, cv.x, cv.y, cv.z) * R;
    const min = cr + radius;
    if (sep < min && sep > 0.01) {
      _v2.copy(_v1).sub(_v3.copy(cv).multiplyScalar(_v1.dot(cv)));   // tangent away-dir at collider
      if (_v2.lengthSq() < 1e-12) return;
      _v2.normalize();
      _v3.copy(cv).multiplyScalar(R).addScaledVector(_v2, min);      // pushed-out point (chord space)
      _v3.normalize();
      _q1.setFromUnitVectors(_v1, _v3);
      q.premultiply(_q1);
      _v1.set(0, 1, 0).applyQuaternion(q);
      moved = true;
    }
  };
  for (const c of colliders) {
    if (S.mode === 'rover' && c === World.roverCollider) continue;
    test(c.v, c.r);
  }
  for (const c of rockColliders) test(c.v, c.r);
  // hab wall ring with a door gap, in hab-local space
  if (World.hab) {
    siteWorldToLocal(World.hab, _v2.copy(_v1).multiplyScalar(surfaceAt(_v1)), _v3);
    const hd = Math.hypot(_v3.x, _v3.z);
    const wallHalf = 0.55 + radius * 0.5;
    if (Math.abs(hd - HAB_R) < wallHalf && hd > 0.001 && Math.abs(_v3.y) < 5) {
      const ang = Math.atan2(_v3.x, _v3.z);
      if (Math.abs(ang) > DOOR_HALF + 0.06) {
        const target = hd < HAB_R ? HAB_R - wallHalf : HAB_R + wallHalf;
        _v3.x = _v3.x / hd * target; _v3.z = _v3.z / hd * target;
        siteLocalToWorld(World.hab, _v3.x, _v3.y, _v3.z, _v2);
        _v2.normalize();
        _q1.setFromUnitVectors(_v1, _v2);
        q.premultiply(_q1);
        moved = true;
      }
    }
  }
  return moved;
}

// ============================================================
// 13b. THE ASTRONAUT — visible body + procedural animation
// ============================================================
export let astro = null;
export const AJ = {};                     // animation joints by name
export function buildAstronaut() {
  astro = buildModel('astronaut');
  for (const n of ['torso', 'helmet', 'armUL', 'armLL', 'armUR', 'armLR', 'legUL', 'legLL', 'legUR', 'legLR'])
    AJ[n] = astro.getObjectByName(n);
  ctx.world.add(astro);
}
// each joint eases toward a target x-rotation; poses just set targets
export const animTarget = { torso: 0, armUL: 0, armLL: 0, armUR: 0, armLR: 0, legUL: 0, legLL: 0, legUR: 0, legLR: 0, armOutL: 0.12, armOutR: -0.12 };
export function updateAstronaut(dt) {
  if (!astro) return;
  const thirdPerson = !S.firstPerson;
  astro.visible = thirdPerson && S.mode === 'walk' && !S.sleeping;
  if (!astro.visible) return;
  astro.position.copy(player.pos).addScaledVector(player.up, player.alt > 0 ? 0 : 0);
  astro.quaternion.copy(player.q);
  const T = animTarget;
  const moving = moveInputMag().mag > 0.12;
  const run = sprinting();
  const interacting = input.eHeld && interaction.active && S.holdT > 0.02;
  if (interacting) {
    // kneel and reach: the task pose
    T.legUL = -1.05; T.legLL = 1.5; T.legUR = -0.5; T.legLR = 1.2;
    T.torso = 0.5; T.armUR = -1.35; T.armLR = -0.25; T.armUL = -0.3; T.armLL = -0.4;
    astro.position.addScaledVector(player.up, -0.42);            // crouch sink
  } else if (!player.onGround) {
    T.legUL = -0.5; T.legLL = 0.9; T.legUR = -0.5; T.legLR = 0.9;
    T.armUR = -2.4; T.armUL = -2.4; T.armLR = -0.3; T.armLL = -0.3; T.torso = 0.12;
  } else if (moving) {
    const ph = player.bob;
    const amp = run ? 0.85 : 0.55;
    T.legUL = Math.sin(ph) * amp;
    T.legUR = -Math.sin(ph) * amp;
    T.legLL = Math.max(0.06, -Math.sin(ph - 0.5)) * amp * 1.1;
    T.legLR = Math.max(0.06, Math.sin(ph - 0.5)) * amp * 1.1;
    T.armUR = Math.sin(ph) * amp * 0.7;
    T.armUL = -Math.sin(ph) * amp * 0.7;
    T.armLR = -0.35; T.armLL = -0.35;
    T.torso = 0.08 + (run ? 0.1 : 0);
  } else {
    const t = perf();
    T.torso = Math.sin(t * 1.3) * 0.02;
    T.legUL = 0; T.legUR = 0; T.legLL = 0.04; T.legLR = 0.04;
    T.armUL = Math.sin(t * 1.3) * 0.04; T.armUR = -Math.sin(t * 1.3) * 0.04;
    T.armLL = -0.15; T.armLR = -0.15;
  }
  const k = 1 - Math.pow(0.0001, dt);
  for (const n in AJ) {
    const j = AJ[n];
    if (!j || T[n] === undefined) continue;
    j.rotation.x = lerp(j.rotation.x, T[n], k);
  }
  // arms rest slightly away from the torso
  if (AJ.armUL) AJ.armUL.rotation.z = lerp(AJ.armUL.rotation.z, 0.14, k);
  if (AJ.armUR) AJ.armUR.rotation.z = lerp(AJ.armUR.rotation.z, -0.14, k);
  if (AJ.helmet) AJ.helmet.rotation.x = lerp(AJ.helmet.rotation.x, clamp(player.pitch * 0.4, -0.4, 0.4), k);
}

export function updateWalk(dt) {
  frameYaw(player.q, input.yaw);
  player.pitch = clamp(player.pitch + input.pitch, -1.45, 1.45);
  input.yaw = 0; input.pitch = 0;
  const run = sprinting() && S.suit > 1;
  const spd = run ? BAL.runSpeed : BAL.walkSpeed;
  const mv = moveInputMag();
  const moving = mv.mag > 0.12;
  if (moving) {
    const l = Math.hypot(mv.mx, mv.mz);
    const dist = spd * mv.mag * dt;
    frameMove(player.q, mv.mx / l, mv.mz / l, dist, R + player.alt);
    player.bob += dt * (run ? 11 : 7) * mv.mag;
    S.stats.walked += dist;
  }
  collideUnit(player.q, 0.42);
  player.q.normalize();
  // gravity & jump
  if (player.onGround && (input.keys[' '] || touchJumpFresh())) { player.vy = BAL.jumpV; player.onGround = false; }
  player.vy -= BAL.gravity * dt;
  player.alt += player.vy * dt;
  if (player.alt <= 0) { player.alt = 0; player.vy = 0; player.onGround = true; }
  syncPlayerPos();
  // camera: third-person chase boom by default, V toggles first-person
  if (S.firstPerson) {
    const bobY = (moving && player.onGround) ? Math.sin(player.bob) * 0.055 : 0;
    ctx.engine.camera.position.copy(player.pos).addScaledVector(player.up, player.eyeH + bobY);
    ctx.engine.camera.quaternion.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, player.pitch));
  } else {
    const boom = S.inside ? 3.4 : 5.6;
    _q1.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, clamp(player.pitch, -1.1, 0.6)));
    // pivot above the shoulders; camera back along the pitched frame
    ctx.engine.camera.position.copy(player.pos).addScaledVector(player.up, 1.55)
      .add(_v1.set(0, 0.55, boom).applyQuaternion(_q1));
    // never sink the camera into the terrain
    const camGround = surfaceAt(ctx.engine.camera.position) + 0.45;
    if (ctx.engine.camera.position.length() < camGround) ctx.engine.camera.position.normalize().multiplyScalar(camGround);
    ctx.engine.camera.quaternion.copy(_q1);
  }
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    ctx.engine.camera.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  const targetFov = (moving && run) ? 80 : 72;
  ctx.engine.camera.fov = lerp(ctx.engine.camera.fov, targetFov, 1 - Math.pow(0.001, dt));
  ctx.engine.camera.updateProjectionMatrix();
  // inside-hab detection (hab-local cylinder)
  if (World.hab) {
    siteWorldToLocal(World.hab, player.pos, _v3);
    S.inside = Math.hypot(_v3.x, _v3.z) < HAB_R - 0.3 && _v3.y < 4;
  }
  // greenhouse interiors count as inside too (for farming)
  if (!S.inside) {
    for (const b of World.builtMeshes) {
      if (b.kind === 'greenhouse' && groundDist(player.pos, b.group.position) < 4.0) { S.inside = true; break; }
    }
  }
}
export function playerUnit() { return _du.copy(player.pos).normalize(); }
