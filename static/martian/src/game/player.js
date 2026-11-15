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
import { clamp, lerp, damp, smoothstep } from '../core/math.js';
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
/**
 * What the last collideUnit ran into: `n`, the way it was pushed (a unit vector along the ground, from the thing
 * toward the body), and `disc`, whether that was a round thing (a rock, a lander: `n` is set) and not only a wall.
 * A body that slides keeps its pace along the thing and loses only what was carrying it in.
 */
export const contact = { n: new THREE.Vector3(), disc: false };
/**
 * Push a body (a circle of `radius` metres about the place `q` stands over) out of whatever it stands in.
 * `rocks`: the lowest rock, in metres, that is in its way (a man's boots go over nothing a collider is made for; a
 * rover's wheels go over a good deal: see game/rover.js). Returns whether it was moved.
 */
export function collideUnit(q, radius, rocks = 0) {
  _v1.set(0, 1, 0).applyQuaternion(q);              // current up
  let moved = false;
  contact.disc = false;
  const test = (cv, cr) => {
    const sep = angDist(_v1.x, _v1.y, _v1.z, cv.x, cv.y, cv.z) * R;
    const min = cr + radius;
    if (sep < min && sep > 0.01) {
      _v2.copy(_v1).sub(_v3.copy(cv).multiplyScalar(_v1.dot(cv)));   // tangent away-dir at collider
      if (_v2.lengthSq() < 1e-12) return;
      _v2.normalize();
      contact.n.copy(_v2); contact.disc = true;
      _v3.copy(cv).multiplyScalar(R).addScaledVector(_v2, min);      // pushed-out point (chord space)
      _v3.normalize();
      _q1.setFromUnitVectors(_v1, _v3);
      q.premultiply(_q1);
      _v1.set(0, 1, 0).applyQuaternion(q);
      moved = true;
    }
  };
  for (const c of colliders) {
    if ((S.mode === 'rover' || S.boarding) && c === World.roverCollider) continue;
    test(c.v, c.r);
  }
  if (rocks !== Infinity) for (const c of rockColliders) if (c.h === undefined || c.h >= rocks) test(c.v, c.r);
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
/** Which way the thigh's own X turns it forward (the rig's convention; set by looking at a jump). */
const AIR_SIGN = 1;
const anim = { mixer: null, actions: {}, current: null, bones: {}, lamp: null, blob: null, lampMats: [], inner: null, seated: false, stepPhase: 0, lastClipTime: 0,
  helmet: [], head: [], bare: false, airT: 0 };
const RUN_SPEED = 9.2;                         // the game's running pace, which the Run clip's stride is made for (he walks at 5.1)
const STROLL_SPEED = 2.2, LOPE_FROM = 3.1;     // the pace the Walk clip's own stride makes, and the pace from which he lopes
const KNEEL_T = 0.45, KNEEL_PACE = 0.8;        // length of the KneelDown and KneelUp clips, and how fast they are played (a touch slower: it is a man in a suit)

const _padA = new THREE.Vector3(), _padB = new THREE.Vector3();
export function buildAstronaut() {
  const m = model('astronaut', { face: true });
  astro = m.root;
  anim.inner = m.inner;
  // Under a roof nothing casts his shadow (the lamps there throw none), and a man with no shadow at his feet
  // floats on the floor. So indoors a soft dark patch lies under him: drawn, as the lamps' own pools are.
  {
    const N = 64, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const g = cv.getContext('2d'), gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.62)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace;
    const geo = new THREE.PlaneGeometry(1.25, 1.0); geo.rotateX(-Math.PI / 2);
    anim.blob = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: tex, transparent: true, opacity: 0, depthWrite: false, fog: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    anim.blob.position.y = 0.02; anim.blob.renderOrder = 2; anim.blob.visible = false;
    astro.add(anim.blob);
    // (One patch under the whole of him was a disc he stood on. Each boot has a small dark pad of its own, which
    //  follows the boot and thins as it lifts; the broad patch stays, but faint: his body's shade on the floor.)
    const padGeo = new THREE.PlaneGeometry(0.30, 0.48); padGeo.rotateX(-Math.PI / 2);
    anim.pads = ['L', 'R'].map((side) => {
      const pad = new THREE.Mesh(padGeo, anim.blob.material.clone());
      pad.position.y = 0.024; pad.renderOrder = 3; pad.visible = false;
      astro.add(pad);
      return { mesh: pad, foot: m.part('foot_' + side), toe: m.part('toe_' + side), rest: 0 };
    }).filter((pd) => pd.foot && pd.toe);
    for (const pd of anim.pads) { pd.foot.getWorldPosition(_padA); pd.toe.getWorldPosition(_padB); pd.rest = astro.worldToLocal(_padA.lerp(_padB, 0.5)).y; }
  }
  anim.mixer = new THREE.AnimationMixer(m.inner);
  for (const clip of m.clips) {
    const a = anim.mixer.clipAction(clip);
    if (['JumpStart', 'Land', 'Collapse', 'Wave', 'KneelDown', 'KneelUp'].includes(clip.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
    anim.actions[clip.name] = a;
  }
  // (the bone of that name, not the first thing of that name: the bare head is a mesh called "head", and it came
  //  first. Everything that was meant to turn his head, to where the camera looks and now to look about him, turned
  //  that mesh, which skinning ignores: his head had never moved.)
  const boneNamed = (n) => { let found = null; m.inner.traverse((o) => { if (!found && o.isBone && o.name === n) found = o; }); return found || m.part(n); };
  for (const n of ['hips', 'spine', 'chest', 'neck', 'head', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'upper_arm_L', 'forearm_L', 'upper_arm_R', 'forearm_R']) anim.bones[n] = boneNamed(n);
  anim.base = {};
  for (const k of PROC_BONES) if (anim.bones[k]) anim.base[k] = anim.bones[k].quaternion.clone();
  // helmet lamps: one spotlight at the visor, switched on in the dark
  // (a gentler falloff than a real lamp's: at arm's length a physical one whites out whatever he faces)
  // (and a short reach: carried to fifty metres it floodlit the whole Hab from across the yard, and nothing was dark)
  // (and no brighter than this: white things three metres off, a dome's floor or an airlock wall, burn out long before
  // the ground at his feet looks lit)
  // (and a beam, not a glow: a wide lamp that fell off fast lit a pool at his own feet, which from behind him was a
  // pale cloud round his waist. Narrower, aimed further out and falling off more slowly, it lays a long oval on the
  // ground from four paces ahead to a dozen.)
  // (and laid forward: the ground three paces off is lit a dozen times harder than the ground ten paces off by any true
  // lamp at head height, so the pool was a smear at his hip and the way ahead was dark. This one hardly falls off with
  // distance at all, is wide, soft from its middle to its edge, and ends at fourteen metres: it lights the ground from
  // two paces ahead of him to a dozen, and a white wall at arm's length no harder than the ground.)
  // (Even so the pool was two paces to five and dark beyond: ground far ahead is lit edge-on, and takes a share of
  // the light that falls as one over its distance. So this lamp grows stronger with distance (a negative decay), by
  // well under that loss: level ground is lit from two paces to a dozen, falling gently, and fades out by eighteen
  // metres, and whatever stands close in front of him is lit least. (Making up the whole loss burnt out any slope
  // that rose toward him: a white disc on a dune.)
  const lamp = new THREE.SpotLight(0xfff4e0, 0, 18, 0.56, 1.0, -0.3);
  const at = m.part('eye') || anim.bones.head;
  const tgt = new THREE.Object3D();
  tgt.position.set(0, -1.3, 8);
  lamp.position.set(0, 0.12, 0.1);
  at.add(lamp, tgt);
  lamp.target = tgt;
  anim.lamp = lamp;
  anim.eye = at;
  anim.lampsFor = null;               // which of the two has the lamps now: see mountLamps
  // the helmet and the head under it are separate meshes: he takes the helmet off where there is air
  m.inner.traverse((o) => {
    if (!o.isMesh) return;
    const n = (Array.isArray(o.material) ? o.material[0] : o.material).name || '';
    if (n === 'helmet_light') anim.lampMats.push(o.material);
    if (o.name === 'helmet' || /^(helmet_|visor)/.test(n)) anim.helmet.push(o); else if (o.name === 'head' || /^head_/.test(n)) { anim.head.push(o); o.visible = false; }
  });
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
  player.anim = name;                 // for tests and the debug hook
}

/** The pose an interaction uses: standing at a console, or kneeling at something on the ground. */
const _iq = new THREE.Quaternion(), _ipq = new THREE.Quaternion(), _idq = new THREE.Quaternion(), _iv = new THREE.Vector3(), _iw = new THREE.Vector3(), _it = new THREE.Vector3();
/** Turn a bone to point (along its own length, its +Y) at a place in the world group's frame, `w` of the way from where its clip left it. */
function aimBone(bone, target, w) {
  if (!bone || w <= 0.001) return;
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_ipq);
  _iq.copy(_ipq).multiply(bone.quaternion);
  _iw.copy(bone.position).applyMatrix4(bone.parent.matrixWorld);
  _it.copy(target); ctx.world.localToWorld(_it);
  _iv.set(0, 1, 0).applyQuaternion(_iq);
  _idq.setFromUnitVectors(_iv, _it.sub(_iw).normalize());
  _iq.premultiply(_idq);
  _idq.copy(_ipq).invert().multiply(_iq);
  bone.quaternion.slerp(_idq, Math.min(1, w));
}
/** Turn a bone about an axis given in the world group's frame (whatever its own axes are). */
function turnBoneWorld(bone, axis, angle) {
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_ipq);
  // (the world group may itself be turned: the axis is taken into the world the bones' matrices are in)
  _iv.copy(axis).transformDirection(ctx.world.matrixWorld);
  _idq.setFromAxisAngle(_iv, angle);
  _iq.copy(_ipq).multiply(bone.quaternion).premultiply(_idq);
  bone.quaternion.copy(_ipq.invert().multiply(_iq));
}
const ease = (t) => { const k = clamp(t, 0, 1); return k * k * (3 - 2 * k); };
const idle = { t: 0, glanceAt: 1.2, glance: null, wristAt: 3.2, wrist: -1, breath: 0, gust: 0, sway: 0 };
player.idle = idle;                    // (for tests and the debug hook)
const _wf = new THREE.Vector3(), _wr = new THREE.Vector3(), _wt = new THREE.Vector3();
/** What is added to a man standing still (see updateAstronaut). `on`: he is standing with nothing to do. */
function idleLife(dt, on) {
  const b = anim.bones;
  if (!on) {
    // (whatever he was at is let go quickly, not dropped: a head snapped to the front is a puppet's)
    idle.t = 0; idle.glanceAt = 1.2 + Math.random(); idle.wristAt = 3.2 + Math.random() * 2;
    if (idle.glance) idle.glance.out = Math.min(idle.glance.out, idle.glance.t + 0.01);
    if (idle.wrist >= 0 && idle.wrist < 2.6) idle.wrist = 2.6;
  } else idle.t += dt;
  idle.breath += dt;
  // the shift of his weight (see updateAstronaut, where the whole of him is tipped by `sway`): eased in when he has
  // stood a second, gone at once when he moves; a slow swing with long rests at each end
  { const want = on && idle.t > 1 ? 0.058 * Math.tanh(2.6 * Math.sin((idle.t - 1) * 0.62)) / Math.tanh(2.6) : 0; idle.sway += (want - idle.sway) * Math.min(1, dt * (on ? 2.2 : 9)); }
  if (b.spine && Math.abs(idle.sway) > 0.0005) turnBoneWorld(b.spine, _wf.set(0, 0, -1).applyQuaternion(astro.quaternion), -idle.sway * 0.9);
  // his breath: the chest lifts and the shoulders with it, a little
  if (on && b.chest) { const br = Math.sin(idle.breath * 1.5); b.chest.rotateX(-0.02 * br); if (b.upper_arm_L && b.upper_arm_R) { b.upper_arm_L.rotateZ(0.018 * br); b.upper_arm_R.rotateZ(-0.018 * br); } }
  // a look about him
  if (on && !idle.glance && idle.wrist < 0 && idle.t > idle.glanceAt) {
    const side = Math.random() < 0.5 ? -1 : 1;
    idle.glance = { t: 0, yaw: side * (0.45 + Math.random() * 0.4), pitch: (Math.random() - 0.4) * 0.22, out: 1.2 + Math.random() * 1.2 };
  }
  const g = idle.glance;
  if (g) {
    g.t += dt;
    const k = ease(g.t / 0.4) * (1 - ease((g.t - g.out) / 0.55));
    // (less of it when his head is already turned to where the camera looks: a neck goes so far)
    const room = 1 - 0.55 * Math.min(1, Math.abs(wrap(player.face)));
    if (b.head) { b.head.rotateY(g.yaw * 0.62 * k * room); b.head.rotateX(g.pitch * k); }
    if (b.neck) b.neck.rotateY(g.yaw * 0.25 * k * room);
    if (b.chest) b.chest.rotateY(g.yaw * 0.13 * k * room);
    if (g.t > g.out + 0.55) { idle.glance = null; idle.glanceAt = idle.t + 2.6 + Math.random() * 3.5; }
  }
  // the display on his forearm: up in front of his chest, his head down to it, and away again
  if (on && idle.wrist < 0 && !idle.glance && idle.t > idle.wristAt) idle.wrist = 0;
  if (idle.wrist >= 0) {
    idle.wrist += dt;
    const k = ease(idle.wrist / 0.6) * (1 - ease((idle.wrist - 2.6) / 0.6));
    if (b.upper_arm_L && b.forearm_L && k > 0.001) {
      _wf.set(0, 0, -1).applyQuaternion(astro.quaternion); _wr.set(1, 0, 0).applyQuaternion(astro.quaternion);
      // (the elbow forward and a little out; the forearm across his chest, the wrist at the breastbone)
      aimBone(b.upper_arm_L, _wt.copy(player.pos).addScaledVector(player.up, 1.02).addScaledVector(_wf, 0.34).addScaledVector(_wr, -0.34), k * 0.85);
      aimBone(b.forearm_L, _wt.copy(player.pos).addScaledVector(player.up, 1.34).addScaledVector(_wf, 0.36).addScaledVector(_wr, 0.02), k);
      // (a nod, not a bow: at twice this the helmet lay on his shoulder)
      if (b.head) { b.head.rotateX(0.26 * k); b.head.rotateY(0.1 * k); }
      if (b.neck) b.neck.rotateX(0.08 * k);
    }
    if (idle.wrist > 3.2) { idle.wrist = -1; idle.wristAt = idle.t + 13 + Math.random() * 9; idle.glanceAt = idle.t + 1.5 + Math.random() * 2; }
  }
}

/** The bones the game adds to on top of the clips (see updateAstronaut). */
const PROC_BONES = ['spine', 'chest', 'neck', 'head', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'upper_arm_L', 'forearm_L', 'upper_arm_R', 'forearm_R'];
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
    if (driving && seat) { seat.add(astro); astro.position.set(0, -0.52, 0); astro.quaternion.identity(); astro.scale.setScalar(1); anim.inner.rotation.y = 0; }
    else { ctx.world.add(astro); anim.inner.rotation.y = Math.PI; }
  }
  astro.visible = driving ? !!(World.rover && World.rover.seat) : (!S.firstPerson && !S.sleeping && !(cam.init && cam.dist < 1.0)) || S.over;
  // helmet: on the instant the air is in doubt, off a moment after he is somewhere he can breathe
  const air = driving ? S.roverO2 > 6 : S.inside && S.o2 > 6 && !S.breach.active;
  anim.airT = air ? anim.airT + dt : 0;
  const bare = anim.head.length > 0 && anim.airT > 1.1 && !S.dead;
  if (bare !== anim.bare) {
    anim.bare = bare;
    for (const o of anim.helmet) o.visible = !bare;
    for (const o of anim.head) o.visible = bare;
  }
  player.bare = bare;
  const working = input.eHeld && interaction.active && S.holdT > 0.02 && !driving;
  let ts = 1;
  if (driving || !player.onGround || S.over) anim.kneel = 0;
  if (S.over && S.dead) play('Collapse', 0.25);
  else if (driving) play('Drive', 0.3);
  else if (!player.onGround) {
    if (player.airT < 0.12 && player.vy > 0 && anim.name !== 'Air') play('JumpStart', 0.08);
    else play('Air', 0.18);
  } else if (player.landT < 0.3 && player.speed < 2.5) play('Land', 0.06);
  // Kneeling has clips of its own. Half-way between a straight leg and a folded one the leg is nine centimetres too
  // long, so a cross-fade from standing to kneeling puts the feet through the floor: KneelDown takes him to a knee,
  // WorkKneel is the work, KneelUp stands him up again. anim.kneel: 0 standing, 1 going down, 2 down, 3 getting up.
  else if (working && (workPose() === 'WorkStand' || !anim.actions.KneelDown)) { anim.kneel = 0; play(workPose(), 0.25); }
  else if (working) {
    if (!anim.kneel || anim.kneel === 3) {
      // (KneelUp is KneelDown backwards: turning round part-way starts the other where this one had got to)
      const from = anim.kneel === 3 ? clamp(KNEEL_T - anim.actions.KneelUp.time, 0, KNEEL_T) : 0;
      play('KneelDown', 0.1, true); anim.actions.KneelDown.time = from; anim.kneel = 1;
    } else if (anim.kneel === 1 && anim.actions.KneelDown.time >= KNEEL_T - 0.02) { play('WorkKneel', 0.1); anim.kneel = 2; }
    if (anim.kneel === 1) ts = KNEEL_PACE;
  } else if (player.speed > 0.6) {
    anim.kneel = 0;                                      // off at once: he is already moving
    const hurt = S.health < 35 || S.suit < 6;
    if (hurt && player.speed < 4) { play('Stagger', 0.3); ts = clamp(player.speed / 2.4, 0.6, 1.3); }
    // Above a stroll he lopes. On Mars a man leaves the ground between steps from little more than a metre a second,
    // and it is the Run clip that has a flight in it and a stride to match: played slowly at the game's walking pace
    // it is the long floating step of a man in a third of a gravity. (The Walk clip's stride is under a metre. At
    // five metres a second its feet slid more than a metre a step: the reviewers of the frame strips measured it.)
    // The Walk clip is for a stroll, at the pace its own stride makes.
    else if (player.speed > LOPE_FROM) { play('Run', 0.25); ts = clamp(player.speed / RUN_SPEED, 0.5, 1.25); }
    else { play('Walk', 0.22); ts = clamp(player.speed / STROLL_SPEED, 0.45, 1.5); }
  } else if (anim.kneel === 1 || anim.kneel === 2) {
    const from = anim.kneel === 1 ? clamp(KNEEL_T - anim.actions.KneelDown.time, 0, KNEEL_T) : 0;
    play('KneelUp', 0.1, true); anim.actions.KneelUp.time = from; anim.kneel = 3; ts = KNEEL_PACE;
  } else if (anim.kneel === 3) {
    ts = KNEEL_PACE;
    if (anim.actions.KneelUp.time >= KNEEL_T - 0.02) { anim.kneel = 0; play('Idle', 0.15); }
  } else play('Idle', 0.3);
  if (anim.current) anim.current.setEffectiveTimeScale(ts);
  // What is added to a clip's pose below (a look, a lean, a breath, a reach) is added to the pose the clip left, each
  // frame afresh. The mixer writes a bone only when the clip's value for it has changed, so a bone the clip holds
  // still for a while is not written again, and whatever was added to it stayed and was added to: his spine went over
  // by three degrees a frame for a third of a second and sprang back. So each bone that is added to goes back,
  // before the mixer runs, to where the mixer last left it; and after it has run, where it now is is kept.
  for (const k of PROC_BONES) { const bn = anim.bones[k]; if (bn && bn.isBone) bn.quaternion.copy(anim.base[k]); }
  anim.mixer.update(dt);
  for (const k of PROC_BONES) { const bn = anim.bones[k]; if (bn && bn.isBone) anim.base[k].copy(bn.quaternion); }
  player.bones = anim.bones;
  if (!driving) {
    astro.position.copy(player.pos);
    // (going up and in, over the last third of a second of getting into the rover)
    { const b = S.boarding, k = b ? clamp((b.t - (b.dur - 0.32)) / 0.32, 0, 1) : 0; astro.scale.setScalar(1 - 0.4 * k * k); if (k > 0) astro.position.addScaledVector(player.up, 0.7 * k); }
    astro.quaternion.copy(player.q).multiply(_q2.setFromAxisAngle(Y_AXIS, player.face));
    // Standing, his weight goes from one leg to the other every few seconds: the whole of him tips a few degrees
    // about his boots, and his spine takes it back out (idleLife), so his hips go six centimetres over and his
    // shoulders stay where they were. (From the chest down nothing moved in seven seconds of standing.)
    if (Math.abs(idle.sway) > 0.0005) {
      _axis.set(0, 0, -1).applyQuaternion(astro.quaternion);
      astro.quaternion.premultiply(_q2.setFromAxisAngle(_axis, idle.sway));
    }
    // In a storm he leans into it, from his boots, and the gusts rock him. (He stood in a gale as he stands in still
    // air: "the storm changes nothing about how he moves".)
    {
      const blow = S.inside || S.inAirlock || !ctx.vfx ? 0 : smoothstep(0.3, 0.9, S.storm.i);
      if (blow > 0.01 && ctx.vfx.wind.lengthSq() > 1) {
        idle.gust += dt;
        const lean = blow * (0.105 + 0.022 * Math.sin(idle.gust * 3.1) + 0.014 * Math.sin(idle.gust * 7.7 + 1.3));
        _axis.crossVectors(player.up, ctx.vfx.wind).normalize();
        astro.quaternion.premultiply(_q2.setFromAxisAngle(_axis, -lean));
      }
    }
    // footsteps: the Walk and Run clips plant a foot at the start and the middle of the cycle
    if ((anim.name === 'Walk' || anim.name === 'Run') && player.onGround) {
      const a = anim.current, d = a.getClip().duration;
      const ph = (a.time % d) / d;
      const half = ph < 0.5 ? 0 : 1;
      if (half !== anim.stepPhase) { anim.stepPhase = half; emit('footstep', { run: anim.name === 'Run' && player.speed > 7, inside: S.inside, foot: half }); }
    }
  }
  // In the air he is not one held pose. He draws his knees up as he tops out, and as the ground comes back his legs
  // go down for it and he leans into the landing. (The flight was one clip held for the 1.8 s a jump lasts here:
  // "hanging on a wire", said both reviewers of the frame strips.) The clip sets these bones every frame, so what is
  // added here is added to the clip's pose and to nothing left over.
  if (!driving && !player.onGround && anim.bones.thigh_L && anim.bones.shin_L) {
    anim.air = Math.min(1, (anim.air || 0) + dt * 5);
    const top = clamp(1 - Math.abs(player.vy) / 2.4, 0, 1), fall = clamp((-player.vy - 0.6) / 2.4, 0, 1);
    const hip = (0.6 * top + 0.22 * fall) * anim.air * AIR_SIGN, knee = (1.0 * top + 0.1 * fall) * anim.air * AIR_SIGN;
    anim.bones.thigh_L.rotateX(-hip); anim.bones.thigh_R.rotateX(-hip * 0.75);
    anim.bones.shin_L.rotateX(knee); anim.bones.shin_R.rotateX(knee * 0.8);
    anim.bones.chest.rotateX(0.16 * fall * anim.air);
  } else anim.air = 0;
  // Standing, he is alive. The Idle clip breathes and shifts his weight, by a degree and a centimetre: on a phone he
  // is a hand's breadth tall and none of it shows, and two reviewers of six seconds of it saw a statue. So, added to
  // the clip while he stands and nothing is asked of him: every few seconds he looks about him, a real turn of the
  // head; now and then he lifts his left forearm and reads the display on it; and his shoulders ride his breath.
  idleLife(dt, !driving && !working && !S.over && !S.sleeping && player.onGround && player.speed < 0.25 && anim.name === 'Idle');
  // look where the camera looks: a little through the chest, more through the head
  // (It is the head that looks, and the chest hardly at all: with a fifth of the camera's tilt in his chest, and a
  // little added when the camera was level, he stood rocked back on his heels five degrees whenever it looked up.)
  const look = clamp(player.pitch, -0.7, 0.6);
  if (!driving && !working && !S.over) {
    const yawTo = clamp(-wrap(player.face), -1.1, 1.1);          // head turns toward the camera's heading
    if (anim.bones.chest) anim.bones.chest.rotateX(-look * 0.06);
    if (anim.bones.head) { anim.bones.head.rotateX(-look * 0.5); anim.bones.head.rotateY(yawTo * 0.55); }
  }
  // his shadow on a floor (see buildAstronaut): there under a roof, gone in the rover and out of doors
  if (anim.blob) {
    const want = (S.inside || S.inAirlock) && !driving ? 1 : 0;
    anim.shade = lerp(anim.shade || 0, want, damp(0.2, dt));
    anim.blob.material.opacity = 0.17 * anim.shade;
    anim.blob.visible = anim.shade > 0.02;
    for (const pd of anim.pads || []) {
      pd.mesh.visible = anim.blob.visible;
      if (!pd.mesh.visible) continue;
      astro.worldToLocal(pd.foot.getWorldPosition(_padA)); astro.worldToLocal(pd.toe.getWorldPosition(_padB));
      const lift = clamp(((_padA.y + _padB.y) / 2 - pd.rest - 0.015) / 0.15, 0, 1);
      pd.mesh.rotation.y = Math.atan2(_padB.x - _padA.x, _padB.z - _padA.z);
      pd.mesh.position.set((_padA.x + _padB.x) / 2, 0.024, (_padA.z + _padB.z) / 2);
      pd.mesh.scale.setScalar(1 + 0.6 * lift);
      pd.mesh.material.opacity = 0.44 * anim.shade * (1 - 0.8 * lift);
    }
  }
  // helmet lamps come on in the dark
  const dark = 1 - clamp(ctx.engine.sky.day * 3, 0, 1);
  const lampOn = driving || S.inside ? 0 : Math.max(dark, S.storm.i > 0.6 ? 0.5 : 0);
  if (anim.lampsFor !== driving && World.rover && World.rover.headlight) mountLamps(driving);
  const set = (light, to) => { light.intensity = ctx.engine.snapLight > 0 ? to : lerp(light.intensity, to, damp(0.25, dt)); };
  if (!driving) {
    set(anim.lamp, lampOn * LAMPS.pool.power);
    if (anim.lampsFor === false) set(World.rover.headlight, lampOn * LAMPS.throw.power);
  } else if (anim.lampsFor === true) {
    // (the rover's wide lamps are roverLights' to switch; its long beam is the helmet's lamp, borrowed)
    const dim = (World.dark || 0) > 0.4 || S.storm.i > 0.5;
    set(anim.lamp, dim ? LAMPS.high.power : 0);
  }
  for (const mm of anim.lampMats) mm.emissiveIntensity = 0.15 + lampOn * 5;
}
/*
 * Light to get about by after dark. There are two lamps in the game that can be aimed, his helmet's and the rover's,
 * and a phone pays for every lamp on every surface whether it is lit or not; so the two are shared out, and whoever
 * is travelling has both. On foot the helmet's is a wide soft pool at his feet and the rover's, borrowed, is a narrow
 * beam thrown forty metres ahead along the way he looks. Driving, the rover's is its wide lamps and the helmet's,
 * borrowed, is a long beam down the road to a hundred metres. (He had a pool three paces across with a hard edge
 * and nothing beyond it, and the rover's light gave out at thirty metres: at its top speed that is one second ahead.)
 * Each grows a little stronger with distance: ground far off is lit edge-on and takes a small share of what falls.
 */
const LAMPS = {
  // (the pool's lamp stands a little above and behind his head, where no lamp is: from there some of it falls on his
  //  own shoulders and pack, and he is a lit man in the dark and not a hole cut in it. Nothing casts a shadow by it.)
  // (and it looks down more than out: aimed out, its soft edge fell a pace ahead of him, and his own boots, and a slope
  //  under them, were in the dark)
  pool: { angle: 0.86, penumbra: 1.0, distance: 26, decay: -0.25, at: [0, 0.62, -0.75], aim: [0, -4.6, 6.0], power: 0.8 },
  throw: { angle: 0.38, penumbra: 1.0, distance: 64, decay: -0.7, at: [0, 0.12, 0.1], aim: [0, -0.95, 20], power: 0.72 },
  // (the rover's wide lamps likewise stand above and behind it, where a work light on a mast would be: the rover was a
  //  black shape with two red lamps on it, in front of the ground it lit)
  flood: { angle: 0.74, penumbra: 1.0, distance: 80, decay: -0.35, at: [0, 4.4, -5.2], aim: [0, -5.0, 16] },
  // (its far end is ground seen edge-on: stronger than this it was a bright bar drawn along the horizon)
  high: { angle: 0.2, penumbra: 0.95, distance: 135, decay: -0.6, aim: [0, -1.4, 70], power: 1.0 },
};
function mountLamp(light, parent, role, at) {
  parent.add(light, light.target);
  light.angle = role.angle; light.penumbra = role.penumbra; light.distance = role.distance; light.decay = role.decay;
  light.position.set(at[0], at[1], at[2]);
  light.target.position.set(at[0] + role.aim[0], at[1] + role.aim[1], at[2] + role.aim[2]);
  light.intensity = 0;                // (it comes up where it now is, not as a flash across the yard)
}
function mountLamps(driving) {
  const rv = World.rover, hl = rv.headlight, inner = rv.model.inner;
  if (!rv.lampAt) rv.lampAt = [hl.position.x, hl.position.y, hl.position.z];
  if (driving) { mountLamp(hl, inner, LAMPS.flood, LAMPS.flood.at); mountLamp(anim.lamp, inner, LAMPS.high, rv.lampAt); }
  else { mountLamp(anim.lamp, anim.eye, LAMPS.pool, LAMPS.pool.at); mountLamp(hl, anim.eye, LAMPS.throw, LAMPS.throw.at); }
  anim.lampsFor = driving;
}
const wrap = (a) => { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; };

// ------------------------------------------------------------------------------------------
// Walking
// ------------------------------------------------------------------------------------------
const cam = { init: false, pivot: new THREE.Vector3(), dist: 5.6, fov: 60, land: 0, turn: 0 };
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
  // getting into the rover: his feet are not the player's for that moment. He steps to its hull (game/rover.js).
  if (S.boarding && World.rover) {
    _p.copy(World.rover.group.position).sub(player.pos);
    _fw.set(0, 0, -1).applyQuaternion(player.q); _rt.set(1, 0, 0).applyQuaternion(player.q);
    const bx = _p.dot(_rt), bz = -_p.dot(_fw), bl = Math.hypot(bx, bz);
    const pace = bl > 1.5 ? 1.9 : 0;
    tx = bl > 0.01 ? (bx / bl) * pace : 0; tz = bl > 0.01 ? (bz / bl) * pace : 0;
  }

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
  if (hit && contact.disc) {
    // Against a rock he loses what was carrying him into it and keeps the rest: he slides along it at the pace he
    // came. (Every frame of touching one used to take four tenths of his speed: he crawled round a boulder, slower
    // the faster the frames came.)
    _fw.set(0, 0, -1).applyQuaternion(player.q); _rt.set(1, 0, 0).applyQuaternion(player.q);
    const nx = contact.n.dot(_rt), nz = -contact.n.dot(_fw), into = player.vx * nx + player.vz * nz;
    if (into < 0) { player.vx -= nx * into; player.vz -= nz * into; }
  } else if (hit) { const k = Math.pow(0.6, dt * 60); player.vx *= k; player.vz *= k; }      // (a wall: by the clock, not by the frame)
  player.q.normalize();

  // --- gravity, jumping, landing (Mars: 3.72 m/s^2) -----------------------------------------
  player.up.set(0, 1, 0).applyQuaternion(player.q);
  const ground = surfaceAt(player.up);
  if (player.onGround) {
    const drop = before - ground;
    if (drop > 0.45 + 6 * dt) { player.onGround = false; player.alt = drop; player.vy = 0; player.airT = 0; }
    else player.alt = 0;
    if (player.onGround && (input.keys[' '] || touchJumpFresh()) && !working && !S.boarding && player.slope < 1.1) {
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
  // string lights hang over the galley table once he has put them up: the camera stays under them
  if (S.comforts && S.comforts.lights && Math.hypot(x - 1.75, z + 2.35) < 2.3) return 2.45;
  return Math.hypot(x, z) > 6.2 ? 2.6 : 3.3;
}

// The room the astronaut is in, as the camera needs to know it: its frame, how far out the
// camera may go, and how high at each spot. null when he is out in the open.
const _habRoom = { group: null, inside: (x, z) => Math.hypot(x, z) < HAB_R - 0.45, ceiling: habCeiling };
const _lockRoom = { group: null, inside: (x) => Math.abs(x) < 0.95, ceiling: () => 2.2 };
const _domeRoom = {
  group: null,
  inDoorway: false,
  inside(x, z) { return Math.hypot(x, z) < GREENHOUSE.wall - 0.4 || (this.inDoorway && Math.abs(x) < GREENHOUSE.doorHalf - 0.2 && z > 0 && z < GREENHOUSE.portalEnd + 3); },
  // under the glazing (a 4 m dome on a low wall), or under the flat roof of the doorway
  ceiling: (x, z) => (Math.abs(x) < GREENHOUSE.doorHalf && z > GREENHOUSE.wall - 0.6 ? 2.05 : 0.3 + Math.sqrt(Math.max(0.2, 16 - x * x - z * z))),
};
function cameraRoom() {
  if (World.hab && (S.inside || S.inAirlock)) {
    siteWorldToLocal(World.hab, player.pos, _v3);
    if (Math.hypot(_v3.x, _v3.z) < AIRLOCK_END + 1) { const r = S.inAirlock ? _lockRoom : _habRoom; r.group = World.hab; return r; }
  }
  if (S.inside) for (const b of World.builtMeshes) {
    if (b.kind === 'greenhouse' && groundDist(player.pos, b.group.position) < 4.2) {
      _domeRoom.group = b.group;
      siteWorldToLocal(b.group, player.pos, _v3);
      _domeRoom.inDoorway = Math.hypot(_v3.x, _v3.z) > GREENHOUSE.wall - 0.7;      // otherwise the door posts fill the picture
      return _domeRoom;
    }
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
  // ... nor inside anything else that stands on the ground and can be walked into: a solar kit, a lander, the rover.
  // (Backed into a panel's frame, the camera showed its struts across a quarter of the picture.)
  const h = p.length();
  for (const c of colliders) {
    if (c.off || c.r < 0.5) continue;
    const d = Math.sqrt(Math.max(0, 2 - 2 * (p.x * c.v.x + p.y * c.v.y + p.z * c.v.z) / h)) * h;      // along the ground, to the thing's middle
    if (d < c.r + 0.45 && h < surfaceAt(p) + 3.2) return false;
  }
  return true;
}

const _cl = new THREE.Vector3(), _cf = new THREE.Vector3();
/** May the camera stand at `at` out of doors? It must be clear of the ground, with a clear line to his chest;
 *  and when `boots` is asked, to his shins as well (so a rise he stands behind does not cut him off at the knee). */
function cameraSees(at, boots) {
  if (at.length() < surfaceAt(at) + 0.45) return false;
  for (let t = 1 / 3; t < 0.9; t += 1 / 3) {
    _cl.lerpVectors(cam.pivot, at, t);
    if (_cl.length() < surfaceAt(_cl) + 0.15) return false;
  }
  if (!boots) return true;
  _cf.copy(player.pos).addScaledVector(player.up, 0.25);
  for (let t = 0.12; t < 0.8; t += 0.21) {
    _cl.lerpVectors(_cf, at, t);
    if (_cl.length() < surfaceAt(_cl) + 0.04) return false;
  }
  return true;
}

/**
 * Is something that stands on the ground (the rover, a lander, a row of panels) between a camera at `at` and his
 * knees? Each is a circle on the ground and so tall (`tall`: a man's chest if it does not say). The camera could not
 * stand inside one; it could stand behind one, and turned beside the rover the picture was the rover's roof and he
 * was not in it (tests/motion.mjs, the strip of the camera turned about him).
 */
function thingInTheWay(at) {
  _cf.copy(player.pos).addScaledVector(player.up, 0.45);
  const ax = at.x - _cf.x, ay = at.y - _cf.y, az = at.z - _cf.z, len2 = ax * ax + ay * ay + az * az;
  if (len2 < 1.5) return false;
  const feet = player.pos.length();
  for (const c of colliders) {
    if (c.off || c.r < 0.9) continue;
    // the thing's foot, at the height of his feet; the place on the line nearest it
    const cx = c.v.x * feet - _cf.x, cy = c.v.y * feet - _cf.y, cz = c.v.z * feet - _cf.z;
    if (cx * cx + cy * cy + cz * cz > 200) continue;
    const t = (cx * ax + cy * ay + cz * az) / len2;
    if (t < 0.06 || t > 0.98) continue;
    _cl.set(ax * t - cx, ay * t - cy, az * t - cz);
    const high = _cl.dot(player.up);                       // (how far above his feet the line passes it)
    _cl.addScaledVector(player.up, -high);
    if (_cl.lengthSq() < c.r * c.r * 0.6 && high < (c.tall || 1.5)) return true;
  }
  return false;
}

function updateWalkCamera(dt, running) {
  const c = ctx.engine.camera;
  // (the dip of a landing comes on over a tenth of a second and goes over a quarter: put on all at once, it was a
  //  step in the picture)
  cam.dip = (cam.dip || 0) + (cam.land * 0.22 - (cam.dip || 0)) * Math.min(1, dt * 16);
  const landDip = cam.dip;
  cam.land = Math.max(0, cam.land - dt * 4);
  if (S.firstPerson) {
    const bobY = (player.speed > 0.5 && player.onGround) ? Math.sin(player.bob) * 0.045 : 0;
    c.position.copy(player.pos).addScaledVector(player.up, player.eyeH + bobY - landDip);
    c.quaternion.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, player.pitch));
    cam.init = false;
  } else {
    // the pivot trails the astronaut slightly, so the camera has weight
    const indoors = S.inside || S.inAirlock;
    // (The camera goes up with a jump by two fifths of it and no more: he rises in the picture, which is how a jump
    //  is seen, and the camera has that much less to come down at the landing. Following all of it, the ground
    //  jumped a quarter of the picture's height in the fifth of a second he took to land.)
    _p.copy(player.pos).addScaledVector(player.up, (indoors ? 1.5 : 1.62) - landDip - (player.onGround ? 0 : player.alt * 0.6));
    const jumped = !cam.init || cam.pivot.distanceTo(_p) > 6;
    if (jumped) { cam.pivot.copy(_p); cam.init = true; }
    else cam.pivot.lerp(_p, damp(0.045, dt));
    _cq.copy(player.q).multiply(_q2.setFromAxisAngle(X_AXIS, player.pitch));
    const wantDist = indoors ? 3.1 : 5.4 + Math.min(1.2, player.speed * 0.08);
    const rise = indoors ? 0.2 : 0.42;
    // Walls shorten the boom. Open ground does not: the camera swings up over it on the same boom, looking
    // down at him, as far as it takes to clear the slope behind him (and, when a little is enough, to see his
    // boots past the rise he stands behind). Only with its back to a cliff does it come in.
    const room = cameraRoom();
    let dist = wantDist, swing = 0;
    if (room) {
      for (let i = 0; i < 7; i++) {
        c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, dist / 3), rise, dist).applyQuaternion(_cq));
        if (c.position.length() >= surfaceAt(c.position) + 0.35 && cameraClear(c.position, room)) break;
        dist *= 0.72;
      }
    } else if (!jumped && cam.keep !== undefined && (cam.turn = (cam.turn + 1) % 3) !== 0) {
      // (the search samples the ground a dozen times, or some hundreds with his back to a cliff: every third frame is
      // enough, the easing between hides the rest, and a phone has better things to do)
      dist = wantDist * cam.keep; swing = cam.keepSwing;
    } else {
      // In order: the smallest swing, up to twenty degrees, that shows his boots; the smallest that is clear at all;
      // then boom and swing give way together, a shorter boom being allowed a steeper look down.
      // (And the swing never fights his own look: it turns the view down, so the higher he looks the less of it
      // there is, and looking well up at the sky there is none: the boom shortens and the view stays his.)
      const most = Math.max(0, 0.5 - 1.7 * Math.max(0, player.pitch));
      search: for (let i = 0; i < 6; i++, dist *= 0.72) {
        for (let k = i ? 4 : 0, top = 8 + i; k < top; k++) {
          swing = (k < 4 ? k : k - 4) * 0.12;
          if (swing > most * (1 + 0.25 * i)) { if (k < 4) { k = 3; continue; } break; }      // (no more swing allowed: on to "clear at all")
          _q2.setFromAxisAngle(X_AXIS, -swing);
          c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, dist / 3), rise, dist).applyQuaternion(_q1.copy(_cq).multiply(_q2)));
          if (cameraSees(c.position, k < 4) && cameraClear(c.position, null) && !thingInTheWay(c.position)) break search;
        }
        swing = 0;
      }
      cam.keep = dist / wantDist; cam.keepSwing = swing; cam.turn = 0;
    }
    cam.dist = dist < cam.dist ? dist : lerp(cam.dist, dist, damp(0.25, dt));
    cam.swing = room ? 0 : jumped ? swing : lerp(cam.swing || 0, swing, damp(swing > (cam.swing || 0) ? 0.3 : 0.05, dt));
    if (cam.swing > 0.002) _cq.multiply(_q2.setFromAxisAngle(X_AXIS, -cam.swing));
    c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, cam.dist / 3), rise, cam.dist).applyQuaternion(_cq));
    // The boom and the swing ease toward what the search found, each at its own pace, and a place between two good
    // places need not be good: turned beside the rover, the camera went through its cab on the way from one side of
    // it to the other. So the place it is about to take is tried too, and the boom comes in until it will do.
    if (!room) {
      // (by tenths: in big steps the picture pumped while the swing caught up)
      for (let i = 0; i < 16 && cam.dist > 0.8 && !(cameraClear(c.position, null) && !thingInTheWay(c.position)); i++) {
        cam.dist *= 0.9;
        c.position.copy(cam.pivot).add(_v1.set(0.55 * Math.min(1, cam.dist / 3), rise, cam.dist).applyQuaternion(_cq));
      }
    }
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
    // Under a roof the boom is short, and a level camera three metres behind a man cuts him off at the shins (in
    // the dome, at the thighs). So indoors the view is tipped down a little, more as the boom shortens, and less
    // as he looks up: his boots stay in the picture. (The camera itself does not move: only where it looks.)
    const tip = room ? (0.14 + 0.26 * clamp(1 - cam.dist / 3.1, 0, 1)) * (1 - clamp(Math.max(0, player.pitch) * 3, 0, 1)) : 0;
    cam.tip = jumped ? tip : lerp(cam.tip || 0, tip, damp(0.2, dt));
    if (cam.tip > 0.002) c.quaternion.multiply(_q2.setFromAxisAngle(X_AXIS, -cam.tip));
  }
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    if (!input.reducedMotion) c.position.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  // ... and the wind has the camera too: a slow sway and a little roll, more in the gusts
  {
    const blow = S.inside || S.inAirlock ? 0 : smoothstep(0.35, 0.9, S.storm.i);
    if (blow > 0.01 && !input.reducedMotion) {
      cam.blowT = (cam.blowT || 0) + dt;
      const t = cam.blowT;
      c.position.addScaledVector(_v1.set(1, 0, 0).applyQuaternion(c.quaternion), (Math.sin(t * 2.9) * 0.04 + Math.sin(t * 7.3) * 0.014) * blow)
        .addScaledVector(player.up, Math.sin(t * 3.7 + 1.1) * 0.022 * blow);
      c.quaternion.multiply(_q2.setFromAxisAngle(_axis.set(0, 0, 1), Math.sin(t * 2.1 + 0.6) * 0.009 * blow));
    }
  }
  const targetFov = ctx.engine.baseFov + (running ? 7 : 0);
  c.fov = lerp(c.fov, targetFov, damp(0.18, dt));
  c.updateProjectionMatrix();
}

export function playerUnit() { return _du.copy(player.pos).normalize(); }
