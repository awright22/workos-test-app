/*
 * The astronaut on foot: a body frame on the sphere, movement with momentum and Mars gravity,
 * slopes, collision, the animated model, helmet lamps and the third-person camera.
 *
 * player.q is the CONTROL frame: +Y up at the astronaut, -Z the way the camera looks (mouse
 * yaw turns it). The astronaut himself faces `player.face` radians away from that, turning to
 * follow the way he moves, so the camera can orbit him. Everything else in the game that asks
 * "which way is the player facing" (compass, placing things) uses the control frame.
 */
import * as THREE from 'three';
import { ctx } from './ctx.js';
import { angDist, frameQuat, groundDist } from '../planet/geo.js';
import { X_AXIS, Y_AXIS, _du, _q1, _q2, _v1, _v2, _v3 } from '../core/scratch.js';
import { surfaceAt, groundSlope } from '../planet/surface.js';
import { R } from '../planet/constants.js';
import { DOOR_HALF, GREENHOUSE, HAB_R, World, colliders, siteLocalToWorld, siteWorldToLocal } from '../world/build.js';
import { BAL, S } from './state.js';
import { rockColliders } from '../world/rocks.js';
import { model } from '../world/models.js';
import { input, moveInputMag, sprinting, touchJumpFresh } from './input.js';
import { interaction } from './interact.js';
import { clamp, lerp, damp } from '../core/math.js';
import { emit } from '../core/events.js';

const _lm = new THREE.Matrix4();
/** Aim the game camera at a world position, keeping `up` upward. */
export function camLookAt(target, up) {
  const cam = ctx.engine.camera;
  _lm.lookAt(cam.position, target, up);
  cam.quaternion.setFromRotationMatrix(_lm);
}

export const player = {
  q: new THREE.Quaternion(),        // control frame: local +Y = up, -Z = camera heading
  pitch: -0.12, alt: 0, vy: 0, onGround: true, bob: 0,
  pos: new THREE.Vector3(),         // world position (feet), derived each frame
  up: new THREE.Vector3(0, 1, 0),
  eyeH: 1.68,
  /** horizontal velocity in the control frame (m/s): x right, z back */
  vx: 0, vz: 0,
  /** which way the body faces, radians from the control frame's forward (positive = left) */
  face: 0,
  speed: 0,                         // current ground speed, m/s
  slope: 0,                         // slope under the feet (rise over run)
  landT: 9, airT: 0,                // seconds since landing / spent in the air
  radius: 0.42,
};

export function initPlayerAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, player.q);
  player.alt = 0; player.vy = 0; player.vx = 0; player.vz = 0; player.onGround = true;
  syncPlayerPos();
  cam.init = false;
}
export function syncPlayerPos() {
  player.up.set(0, 1, 0).applyQuaternion(player.q);
  const ground = surfaceAt(player.up);
  player.pos.copy(player.up).multiplyScalar(ground + player.alt);
  World.playerPos = player.pos;
}
const _axis = new THREE.Vector3();
/** Move a body frame along its local (vx, 0, vz) direction by dist metres on a sphere of `radius`. */
export function frameMove(q, vx, vz, dist, radius) {
  _axis.set(vz, 0, -vx);
  if (_axis.lengthSq() < 1e-12) return;
  _axis.normalize();
  q.multiply(_q2.setFromAxisAngle(_axis, dist / radius));
}
export function frameYaw(q, dYaw) { q.multiply(_q2.setFromAxisAngle(Y_AXIS, dYaw)); }

// ------------------------------------------------------------------------------------------
// Collision: push the body out of collider discs and the Hab's walls (tangent-plane approx)
// ------------------------------------------------------------------------------------------
/** Airlock side walls, in Hab-local (x, z): the passage is 2.2 m wide out to z = 11.6. */
const AIRLOCK_HALF = 1.1, AIRLOCK_END = 11.75, AIRLOCK_OUTER_HALF = 2.4;

/**
 * Keep a walker out of a round wall except through its doorway (at the building's local +Z)
 * and the passage beyond it. Expects the walker's up vector in _v1 and leaves the new one there.
 * @param wallR radius of the wall line   @param wallHalf how far the walker's centre stays from it
 * @param doorAngle half-angle of the opening   @param passHalf clear half-width of the passage
 * @param passOuter outer half-width of the passage's walls   @param passEnd how far out it reaches
 */
function ringWall(q, group, radius, wallR, wallHalf, doorAngle, passHalf, passOuter, passEnd) {
  siteWorldToLocal(group, _v2.copy(_v1).multiplyScalar(surfaceAt(_v1)), _v3);
  const hd = Math.hypot(_v3.x, _v3.z);
  if (hd > passEnd + 6 || Math.abs(_v3.y) > 6) return false;
  let x = _v3.x, z = _v3.z, hit = false;
  const inDoor = Math.abs(Math.atan2(x, z)) <= doorAngle || (Math.abs(x) < passHalf && z > 0);
  if (Math.abs(hd - wallR) < wallHalf && hd > 0.001 && !inDoor) {
    const target = hd < wallR ? wallR - wallHalf : wallR + wallHalf;
    x = x / hd * target; z = z / hd * target; hit = true;
  }
  // the passage: keep a walker inside it once in it, and outside its walls otherwise
  if (z > wallR - 0.3 && z < passEnd + radius && Math.abs(x) < passOuter + radius) {
    const lim = passHalf - radius * 0.6;
    if (Math.abs(x) <= passHalf + 0.25 && z < passEnd) {
      if (Math.abs(x) > lim) { x = Math.sign(x) * lim; hit = true; }          // inside: slide along the walls
    } else if (z < passEnd) {
      x = Math.sign(x) * (passOuter + radius); hit = true;                    // outside: stay off the box
    }
  }
  if (!hit) return false;
  siteLocalToWorld(group, x, _v3.y, z, _v2);
  _v2.normalize();
  _q1.setFromUnitVectors(_v1, _v2);
  q.premultiply(_q1);
  _v1.set(0, 1, 0).applyQuaternion(q);
  return true;
}
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
  // round buildings: the Hab with its airlock, and any greenhouse dome the player has put up
  if (World.hab && ringWall(q, World.hab, radius, HAB_R, 0.5 + radius * 0.5, DOOR_HALF + 0.02, AIRLOCK_HALF, AIRLOCK_OUTER_HALF, AIRLOCK_END)) moved = true;
  for (const b of World.builtMeshes) {
    if (b.kind !== 'greenhouse') continue;
    if (ringWall(q, b.group, radius, GREENHOUSE.wall, 0.1 + radius * 0.75, Math.asin(GREENHOUSE.doorHalf / GREENHOUSE.wall),
      GREENHOUSE.doorHalf, GREENHOUSE.portalOuter, GREENHOUSE.portalEnd)) moved = true;
  }
  return moved;
}

// ------------------------------------------------------------------------------------------
// The astronaut model and its animation
// ------------------------------------------------------------------------------------------
export let astro = null;
const anim = { mixer: null, actions: {}, current: null, bones: {}, lamp: null, lampMats: [], inner: null, seated: false, stepPhase: 0, lastClipTime: 0 };
const WALK_SPEED = 5.1, RUN_SPEED = 9.2;       // ground speeds the Walk and Run clips were made for

export function buildAstronaut() {
  const m = model('astronaut', { face: true });
  astro = m.root;
  anim.inner = m.inner;
  anim.mixer = new THREE.AnimationMixer(m.inner);
  for (const clip of m.clips) {
    const a = anim.mixer.clipAction(clip);
    if (['JumpStart', 'Land', 'Collapse', 'Wave'].includes(clip.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
    anim.actions[clip.name] = a;
  }
  for (const n of ['hips', 'spine', 'chest', 'neck', 'head']) anim.bones[n] = m.part(n);
  anim.rest = { chest: anim.bones.chest.quaternion.clone(), head: anim.bones.head.quaternion.clone() };
  // helmet lamps: one spotlight at the visor, switched on in the dark
  const lamp = new THREE.SpotLight(0xfff4e0, 0, 34, 0.5, 0.7, 1.2);
  const at = m.part('eye') || anim.bones.head;
  const tgt = new THREE.Object3D();
  tgt.position.set(0, -1.1, 8);
  lamp.position.set(0, 0.12, 0.1);
  at.add(lamp, tgt);
  lamp.target = tgt;
  anim.lamp = lamp;
  m.inner.traverse((o) => { if (o.isMesh) { const mats = Array.isArray(o.material) ? o.material : [o.material]; for (const x of mats) if (x.name === 'light_white') anim.lampMats.push(x); } });
  ctx.world.add(astro);
  play('Idle', 0);
}

function play(name, fade = 0.22, restart = false) {
  const next = anim.actions[name];
  if (!next) return;
  if (anim.current === next && !restart) return;
  next.reset();
  next.enabled = true;
  next.setEffectiveWeight(1);
  next.setEffectiveTimeScale(1);
  if (anim.current && anim.current !== next) next.crossFadeFrom(anim.current, fade, false);
  next.play();
  anim.current = next;
  anim.name = name;
}

/** The pose an interaction uses: standing at a console, or kneeling at something on the ground. */
function workPose() {
  const it = interaction.active;
  return it && it.pose === 'stand' ? 'WorkStand' : 'WorkKneel';
}

export function updateAstronaut(dt) {
  if (!astro) return;
  const driving = S.mode === 'rover';
  // seat the astronaut in the rover while driving; otherwise he stands in the world
  if (driving !== anim.seated) {
    anim.seated = driving;
    const seat = World.rover && World.rover.seat;
    if (driving && seat) { seat.add(astro); astro.position.set(0, -0.52, 0); astro.quaternion.identity(); anim.inner.rotation.y = 0; }
    else { ctx.world.add(astro); anim.inner.rotation.y = Math.PI; }
  }
  astro.visible = driving ? !!(World.rover && World.rover.seat) : (!S.firstPerson && !S.sleeping && !(cam.init && cam.dist < 1.0)) || S.over;
  const working = input.eHeld && interaction.active && S.holdT > 0.02 && !driving;
  let ts = 1;
  if (S.over && S.dead) play('Collapse', 0.25);
  else if (driving) play('Drive', 0.3);
  else if (!player.onGround) {
    if (player.airT < 0.12 && player.vy > 0 && anim.name !== 'Air') play('JumpStart', 0.08);
    else play('Air', 0.18);
  } else if (player.landT < 0.3 && player.speed < 2.5) play('Land', 0.06);
  else if (working) play(workPose(), 0.25);
  else if (player.speed > 0.6) {
    const hurt = S.health < 35 || S.suit < 6;
    if (hurt && player.speed < 4) { play('Stagger', 0.3); ts = clamp(player.speed / 2.4, 0.6, 1.3); }
    else if (player.speed > 7.0) { play('Run', 0.2); ts = clamp(player.speed / RUN_SPEED, 0.7, 1.25); }
    else { play('Walk', 0.22); ts = clamp(player.speed / WALK_SPEED, 0.45, 1.3); }
  } else play('Idle', 0.3);
  if (anim.current) anim.current.setEffectiveTimeScale(ts);
  // the look-at below is added on top of the clip each frame, so start from the rest pose
  anim.bones.chest.quaternion.copy(anim.rest.chest);
  anim.bones.head.quaternion.copy(anim.rest.head);
  anim.mixer.update(dt);
  if (!driving) {
    astro.position.copy(player.pos);
    astro.quaternion.copy(player.q).multiply(_q2.setFromAxisAngle(Y_AXIS, player.face));
    // footsteps: the Walk and Run clips plant a foot at the start and the middle of the cycle
    if ((anim.name === 'Walk' || anim.name === 'Run') && player.onGround) {
      const a = anim.current, d = a.getClip().duration;
      const ph = (a.time % d) / d;
      const half = ph < 0.5 ? 0 : 1;
      if (half !== anim.stepPhase) { anim.stepPhase = half; emit('footstep', { run: anim.name === 'Run', inside: S.inside, foot: half }); }
    }
  }
  // look where the camera looks: a little through the chest, more through the head
  const look = clamp(player.pitch + 0.1, -0.7, 0.6);
  if (!driving && !working && !S.over) {
    const yawTo = clamp(-wrap(player.face), -1.1, 1.1);          // head turns toward the camera's heading
    if (anim.bones.chest) anim.bones.chest.rotateX(-look * 0.18);
    if (anim.bones.head) { anim.bones.head.rotateX(-look * 0.4); anim.bones.head.rotateY(yawTo * 0.55); }
  }
  // helmet lamps come on in the dark
  const dark = 1 - clamp(ctx.engine.sky.day * 3, 0, 1);
  const lampOn = driving || S.inside ? 0 : Math.max(dark, S.storm.i > 0.6 ? 0.5 : 0);
  anim.lamp.intensity = lerp(anim.lamp.intensity, lampOn * 42, damp(0.25, dt));
  for (const mm of anim.lampMats) mm.emissiveIntensity = 0.15 + lampOn * 5;
}
const wrap = (a) => { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; };

// ------------------------------------------------------------------------------------------
// Walking
// ------------------------------------------------------------------------------------------
const cam = { init: false, pivot: new THREE.Vector3(), dist: 5.6, fov: 60, land: 0 };
const _down = new THREE.Vector3(), _p = new THREE.Vector3(), _fw = new THREE.Vector3(), _rt = new THREE.Vector3();
const _cq = new THREE.Quaternion();     // the camera's own scratch: helpers called below reuse the shared ones

export function updateWalk(dt) {
  // --- look -----------------------------------------------------------------------------
  frameYaw(player.q, input.yaw);
  player.face = wrap(player.face - input.yaw);              // the body keeps its heading while the camera turns
  player.pitch = clamp(player.pitch + input.pitch * (input.invertY ? -1 : 1), S.firstPerson ? -1.45 : -1.2, S.firstPerson ? 1.45 : 0.85);
  input.yaw = 0; input.pitch = 0;

  // --- desired velocity in the control frame ------------------------------------------------
  const mv = moveInputMag();
  const working = input.eHeld && interaction.active && S.holdT > 0.02;
  const wantRun = sprinting() && S.suit > 1 && !working;
  const hurt = S.health < 35 || S.suit < 6;
  let top = wantRun ? BAL.runSpeed : BAL.walkSpeed;
  if (hurt) top *= 0.55;
  let tx = 0, tz = 0;
  if (mv.mag > 0.12 && !working) { const l = Math.hypot(mv.mx, mv.mz); tx = (mv.mx / l) * top * mv.mag; tz = (mv.mz / l) * top * mv.mag; }

  // --- slopes: slow uphill, refuse cliffs, slide when it is too steep to stand ------------------
  player.slope = groundSlope(player.pos, 1.3, _down);
  // downhill direction in the control frame
  _fw.set(0, 0, -1).applyQuaternion(player.q); _rt.set(1, 0, 0).applyQuaternion(player.q);
  const dx = _down.dot(_rt), dz = -_down.dot(_fw);
  if (player.onGround && player.slope > 0.05) {
    const along = (tx * dx + tz * dz);                                    // >0 moving downhill
    const tl = Math.hypot(tx, tz);
    if (tl > 0.01) {
      const up = -along / tl;                                             // 1 = straight uphill
      if (up > 0) {
        const k = clamp(1 - player.slope * up * 1.05, 0, 1);
        const block = player.slope > 0.95 ? 0 : k;                        // steeper than ~44 degrees: no climbing
        // remove (part of) the uphill component only
        const cut = (1 - block) * (-along);
        tx += dx * cut; tz += dz * cut;
      } else {
        const boost = 1 + Math.min(0.18, player.slope * 0.25) * -up;
        tx *= boost; tz *= boost;
      }
    }
    if (player.slope > 1.1) { const s = Math.min(7, (player.slope - 1.0) * 9); tx += dx * s; tz += dz * s; }   // too steep: slide
  }
  // --- accelerate toward it (snappy on the ground, a little air control) -------------------
  const acc = player.onGround ? (Math.hypot(tx, tz) > 0.1 ? 26 : 34) : 5;
  const ddx = tx - player.vx, ddz = tz - player.vz, dl = Math.hypot(ddx, ddz);
  if (dl > 1e-5) { const step = Math.min(dl, acc * dt); player.vx += (ddx / dl) * step; player.vz += (ddz / dl) * step; }
  player.speed = Math.hypot(player.vx, player.vz);

  // --- move, remembering how high we were (to detect running off an edge) ------------------
  const before = player.pos.length();
  if (player.speed > 0.01) {
    const dist = player.speed * dt;
    frameMove(player.q, player.vx / player.speed, player.vz / player.speed, dist, R + player.alt);
    player.bob += dt * (player.speed > 7 ? 11 : 7) * Math.min(1, player.speed / 5);
    S.stats.walked += dist;
    // turn the body toward where it is going
    const want = Math.atan2(-player.vx, -player.vz);
    const d = wrap(want - player.face);
    player.face = wrap(player.face + d * damp(0.07, dt) * Math.min(1, player.speed / 1.5));
  }
  if (working && interaction.active) {
    // face the thing being worked on
    const p = interaction.active.pos && interaction.active.pos();
    if (p && groundDist(p, player.pos) > 0.4) {
      _p.copy(p).sub(player.pos);
      const want = Math.atan2(-_p.dot(_rt), _p.dot(_fw));
      player.face = wrap(player.face + wrap(want - player.face) * damp(0.1, dt));
    }
  }
  const hit = collideUnit(player.q, player.radius);
  if (hit) { player.vx *= 0.6; player.vz *= 0.6; }
  player.q.normalize();

  // --- gravity, jumping, landing (Mars: 3.72 m/s^2) -----------------------------------------
  player.up.set(0, 1, 0).applyQuaternion(player.q);
  const ground = surfaceAt(player.up);
  if (player.onGround) {
    const drop = before - ground;
    if (drop > 0.45 + 6 * dt) { player.onGround = false; player.alt = drop; player.vy = 0; player.airT = 0; }
    else player.alt = 0;
    if (player.onGround && (input.keys[' '] || touchJumpFresh()) && !working && player.slope < 1.1) {
      player.vy = BAL.jumpV; player.onGround = false; player.airT = 0; player.alt = 0.001;
      emit('jump', {});
    }
  } else {
    player.alt = Math.max(0, before - ground);
    player.vy -= BAL.gravity * dt;
    player.alt += player.vy * dt;
    player.airT += dt;
    if (player.alt <= 0) {
      const impact = -player.vy;
      player.alt = 0; player.vy = 0; player.onGround = true; player.landT = 0;
      cam.land = Math.min(1, impact / 7);
      emit('land', { speed: impact, inside: S.inside });
      if (impact > 9.5) {                                    // a long fall hurts, even on Mars
        const dmg = (impact - 9.5) * 7;
        S.health = Math.max(0, S.health - dmg);
        S.shake = Math.max(S.shake, 0.8);
        emit('hurt', { amount: dmg, cause: 'fall' });
      }
    }
  }
  player.landT += dt;
  syncPlayerPos();
  updateWalkCamera(dt, mv.mag > 0.12 && wantRun);

  // --- where am I: inside the Hab (or a greenhouse)? ---------------------------------------
  if (World.hab) {
    siteWorldToLocal(World.hab, player.pos, _v3);
    S.inside = Math.hypot(_v3.x, _v3.z) < HAB_R - 0.3 && _v3.y < 6;
    S.inAirlock = !S.inside && Math.abs(_v3.x) < 1.3 && _v3.z > HAB_R - 0.3 && _v3.z < AIRLOCK_END;
  }
  if (!S.inside) {
    for (const b of World.builtMeshes) {
      if (b.kind === 'greenhouse' && groundDist(player.pos, b.group.position) < 4.0) { S.inside = true; break; }
    }
  }
}

/** Highest the camera may sit inside the Hab at a Hab-local spot: under the grow lights over
 *  the farm (they hang at 2.27 m), under the duct ring near the wall, under the trusses elsewhere. */
function habCeiling(x, z) {
  if (x > -6.6 && x < -1.9 && z > -4.5 && z < 2.9) return 2.08;
  return Math.hypot(x, z) > 6.2 ? 2.6 : 3.3;
}

// The room the astronaut is in, as the camera needs to know it: its frame, how far out the
// camera may go, and how high at each spot. null when he is out in the open.
const _habRoom = { group: null, inside: (x, z) => Math.hypot(x, z) < HAB_R - 0.45, ceiling: habCeiling };
const _lockRoom = { group: null, inside: (x) => Math.abs(x) < 0.95, ceiling: () => 2.2 };
const _domeRoom = {
  group: null,
  inside: (x, z) => Math.hypot(x, z) < GREENHOUSE.wall - 0.4 || (Math.abs(x) < GREENHOUSE.doorHalf - 0.2 && z > 0 && z < GREENHOUSE.portalEnd + 3),
  ceiling: (x, z) => 0.3 + Math.sqrt(Math.max(0.2, 16 - x * x - z * z)),       // under the glazing: a 4 m dome on a low wall
};
function cameraRoom() {
  if (World.hab && (S.inside || S.inAirlock)) {
    siteWorldToLocal(World.hab, player.pos, _v3);
    if (Math.hypot(_v3.x, _v3.z) < AIRLOCK_END + 1) { const r = S.inAirlock ? _lockRoom : _habRoom; r.group = World.hab; return r; }
  }
  if (S.inside) for (const b of World.builtMeshes) {
    if (b.kind === 'greenhouse' && groundDist(player.pos, b.group.position) < 4.2) { _domeRoom.group = b.group; return _domeRoom; }
  }
  return null;
}
/** May the camera be at `p`? Inside a room it must stay in the room; outside, out of every building. */
function cameraClear(p, room) {
  if (room) { siteWorldToLocal(room.group, p, _v3); return room.inside(_v3.x, _v3.z); }
  if (World.hab) {
    siteWorldToLocal(World.hab, p, _v3);
    const r = Math.hypot(_v3.x, _v3.z);
    if (_v3.y < 6.2 && (r < HAB_R + 0.7 || (Math.abs(_v3.x) < AIRLOCK_OUTER_HALF + 0.5 && _v3.z > 0 && _v3.z < AIRLOCK_END + 0.5 && _v3.y < 3.6))) return false;
  }
  for (const b of World.builtMeshes) {
    if (b.kind !== 'greenhouse') continue;
    siteWorldToLocal(b.group, p, _v3);
    if (_v3.y < 5 && Math.hypot(_v3.x, _v3.z) < 4.45) return false;
  }
  return true;
}

function updateWalkCamera(dt, running) {
  const c = ctx.engine.camera;
  const landDip = cam.land * 0.22;
  cam.land = Math.max(0, cam.land - dt * 4);
  if (S.firstPerson) {
    const bobY = (player.speed > 0.5 && player.onGround) ? Math.sin(player.bob) * 0.045 : 0;
    c.position.copy(player.pos).addScaledVector(player.up, player.eyeH + bobY - landDip);
    c.quaternion.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, player.pitch));
    cam.init = false;
  } else {
    // the pivot trails the astronaut slightly, so the camera has weight
    const indoors = S.inside || S.inAirlock;
    _p.copy(player.pos).addScaledVector(player.up, (indoors ? 1.5 : 1.62) - landDip);
    if (!cam.init || cam.pivot.distanceTo(_p) > 6) { cam.pivot.copy(_p); cam.init = true; }
    else cam.pivot.lerp(_p, damp(0.045, dt));
    _cq.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, player.pitch));
    const wantDist = indoors ? 3.1 : 5.4 + Math.min(1.2, player.speed * 0.08);
    const rise = indoors ? 0.2 : 0.42;
    // shorten the boom until the camera is above the ground and on the astronaut's side of every wall
    const room = cameraRoom();
    let dist = wantDist;
    for (let i = 0; i < 7; i++) {
      c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, dist / 3), rise, dist).applyQuaternion(_cq));
      if (c.position.length() >= surfaceAt(c.position) + 0.35 && cameraClear(c.position, room)) break;
      dist *= 0.72;
    }
    cam.dist = dist < cam.dist ? dist : lerp(cam.dist, dist, damp(0.25, dt));
    c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, cam.dist / 3), rise, cam.dist).applyQuaternion(_cq));
    // indoors, duck under whatever hangs from the roof rather than zooming in
    if (room) {
      siteWorldToLocal(room.group, c.position, _v3);
      const top = room.ceiling(_v3.x, _v3.z);
      if (_v3.y > top) { cam.duck = lerp(cam.duck || 0, _v3.y - top, damp(0.08, dt)); } else cam.duck = lerp(cam.duck || 0, 0, damp(0.15, dt));
      if (cam.duck > 0.005) c.position.addScaledVector(player.up, -cam.duck);
    } else cam.duck = 0;
    const floor = surfaceAt(c.position) + 0.3;
    if (c.position.length() < floor) c.position.normalize().multiplyScalar(floor);
    c.quaternion.copy(_cq);
  }
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    if (!input.reducedMotion) c.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  const targetFov = ctx.engine.baseFov + (running ? 7 : 0);
  c.fov = lerp(c.fov, targetFov, damp(0.18, dt));
  c.updateProjectionMatrix();
}

export function playerUnit() { return _du.copy(player.pos).normalize(); }
