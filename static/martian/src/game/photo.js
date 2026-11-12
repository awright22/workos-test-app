/*
 * Photo mode: stop the clock, let go of the astronaut, and take a picture.
 *
 * The game freezes (nothing drains, nothing moves) and the camera comes off its boom: it orbits
 * what he was doing, slides and rises, changes lens, and the picture can be given one of a few
 * looks, done in the renderer's final pass so the saved file is exactly what is on screen.
 * The picture is saved as a PNG at the screen's full resolution, or handed to the share sheet
 * on a phone.
 */
import * as THREE from 'three';
import { S } from './state.js';
import { ctx } from './ctx.js';
import { World } from '../world/build.js';
import { player, camLookAt, astro } from './player.js';
import { input } from './input.js';
import { tangentBasis, vecToLl } from '../planet/geo.js';
import { surfaceAt } from '../planet/surface.js';
import { clamp } from '../core/math.js';
import { addCredit } from './science.js';
import { cheer } from './farm.js';

/** Looks: settings of the final pass. `natural` is the game's own grade. */
export const LOOKS = {
  natural: { name: 'Natural', saturation: 1.06, tint: [1, 1, 1], vignette: 0.32, grain: 0.018, contrast: 1, mono: 0 },
  vivid: { name: 'Vivid', saturation: 1.32, tint: [1.02, 1, 0.98], vignette: 0.26, grain: 0.012, contrast: 1.1, mono: 0 },
  film: { name: 'Film', saturation: 0.9, tint: [1.05, 1.0, 0.93], vignette: 0.46, grain: 0.04, contrast: 1.08, mono: 0 },
  viking: { name: '1976', saturation: 0.66, tint: [1.1, 0.98, 0.84], vignette: 0.42, grain: 0.055, contrast: 0.94, mono: 0 },
  cold: { name: 'Cold', saturation: 0.86, tint: [0.92, 1.0, 1.1], vignette: 0.36, grain: 0.02, contrast: 1.05, mono: 0 },
  noir: { name: 'Noir', saturation: 1, tint: [1, 1, 1], vignette: 0.5, grain: 0.045, contrast: 1.28, mono: 1 },
};

export const photo = {
  on: false,
  yaw: 0, pitch: 0.12, dist: 6,          // where the camera sits round the subject
  slide: 0, rise: 0, push: 0,            // the point it looks at, moved off the subject (metres)
  fov: 50, exposure: 0, look: 'natural', showAstronaut: true,
  taken: 0,
};
const DEFAULTS = { pitch: 0.12, dist: 6, slide: 0, rise: 0, push: 0, fov: 50, exposure: 0, look: 'natural', showAstronaut: true };
const hooks = { opened: null, closed: null };
export function onPhotoMode(opened, closed) { hooks.opened = opened; hooks.closed = closed; }

export function canPhoto() { return S.started && !S.over && !S.uiOpen && !S.sleeping && S.mode !== 'cutscene' && !S.flags.coldOpen; }

export function enterPhoto() {
  if (photo.on || !canPhoto()) return false;
  Object.assign(photo, DEFAULTS);
  // start from where the game camera is, so nothing jumps
  const subject = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const cam = ctx.engine.camera;
  _up.copy(subject).normalize();
  tangentBasis(_up, _east, _north);
  _d.copy(cam.position).sub(_t.copy(subject).addScaledVector(_up, S.mode === 'rover' ? 1.6 : 1.15));
  photo.dist = clamp(_d.length(), 2.2, 14);
  photo.pitch = clamp(Math.asin(clamp(_d.dot(_up) / Math.max(_d.length(), 0.01), -1, 1)), -0.15, 1.3);
  photo.yaw = Math.atan2(_d.dot(_east), _d.dot(_north));
  photo.fov = Math.round(cam.fov);
  photo.on = true; S.photo = true;
  input.yaw = 0; input.pitch = 0; input.eHeld = false; S.holdT = 0;
  try { if (document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* not locked */ }
  if (hooks.opened) hooks.opened();
  return true;
}
export function exitPhoto() {
  if (!photo.on) return;
  photo.on = false; S.photo = false;
  applyLook(LOOKS.natural);
  const cam = ctx.engine.camera;
  cam.fov = ctx.engine.baseFov; cam.updateProjectionMatrix();
  setAstronautShown(true);                               // the game decides again on its next frame
  input.yaw = 0; input.pitch = 0;
  if (hooks.closed) hooks.closed();
}

function applyLook(l) {
  const u = ctx.engine.final.uniforms;
  u.uSaturation.value = l.saturation; u.uTint.value.set(l.tint[0], l.tint[1], l.tint[2]);
  u.uVignette.value = l.vignette; u.uGrain.value = l.grain; u.uContrast.value = l.contrast; u.uMono.value = l.mono;
}
function setAstronautShown(on) { if (astro) astro.visible = on; }

const _up = new THREE.Vector3(), _east = new THREE.Vector3(), _north = new THREE.Vector3();
const _t = new THREE.Vector3(), _d = new THREE.Vector3(), _fwd = new THREE.Vector3(), _side = new THREE.Vector3();

/** Read the controls (drag to orbit, keys or stick to slide). Call each frame while photo mode is on. */
export function updatePhoto(dt) {
  photo.yaw -= input.yaw; photo.pitch = clamp(photo.pitch - input.pitch, -0.25, 1.45);
  input.yaw = 0; input.pitch = 0;
  const k = input.keys;
  const mx = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0) + input.touch.joyX;
  const mz = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0) - input.touch.joyY;
  const my = (k['e'] ? 1 : 0) - (k['q'] ? 1 : 0);
  const sp = (k['shift'] ? 9 : 3.5) * dt;
  photo.slide = clamp(photo.slide + mx * sp, -14, 14);
  photo.push = clamp(photo.push + mz * sp, -14, 14);
  photo.rise = clamp(photo.rise + my * sp, -1, 12);
}

/** Place the game camera for the picture. Returns the exposure bias for the renderer. */
export function photoCamera() {
  const cam = ctx.engine.camera;
  const subject = S.mode === 'rover' ? World.rover.group.position : player.pos;
  _up.copy(subject).normalize();
  tangentBasis(_up, _east, _north);
  // the direction from the target to the camera, and the camera's own right and forward on the ground
  const cy = Math.cos(photo.yaw), sy = Math.sin(photo.yaw), cp = Math.cos(photo.pitch), sp = Math.sin(photo.pitch);
  _d.copy(_north).multiplyScalar(cy * cp).addScaledVector(_east, sy * cp).addScaledVector(_up, sp);
  _fwd.copy(_north).multiplyScalar(-cy).addScaledVector(_east, -sy);
  _side.crossVectors(_fwd, _up);
  _t.copy(subject).addScaledVector(_up, (S.mode === 'rover' ? 1.6 : 1.15) + photo.rise).addScaledVector(_side, photo.slide).addScaledVector(_fwd, photo.push);
  cam.position.copy(_t).addScaledVector(_d, photo.dist);
  // never under the ground
  const floor = surfaceAt(cam.position) + 0.2;
  if (cam.position.length() < floor) cam.position.setLength(floor);
  camLookAt(_t, _up);
  if (Math.abs(cam.fov - photo.fov) > 0.01) { cam.fov = photo.fov; cam.updateProjectionMatrix(); }
  applyLook(LOOKS[photo.look] || LOOKS.natural);
  setAstronautShown(photo.showAstronaut);
  return Math.pow(2, photo.exposure);
}

/** A name for the file: the sol and the place. */
export function photoName() {
  const ll = vecToLl(_up.copy(player.pos).normalize());
  const lat = `${Math.abs(ll.lat).toFixed(1)}${ll.lat >= 0 ? 'N' : 'S'}`, lon = `${(((ll.lon % 360) + 360) % 360).toFixed(1)}E`;
  return `stranded-sol${S.sol}-${lat}-${lon}-${++photo.taken}.png`;
}

/**
 * Take the picture: draw one frame at the screen's full resolution and hand back the PNG.
 * `drawFrame` draws the scene once (the main loop's draw). Resolves to { blob, name }.
 */
/** The landers a picture taken now would show: near enough to be more than a speck, and inside the frame. */
export function photoSubjects() {
  const cam = ctx.engine.camera, out = [];
  cam.updateMatrixWorld();
  for (const rec of World.landers) {
    if (!rec.group.visible || cam.position.distanceTo(rec.group.position) > 60) continue;
    _d.copy(rec.group.position).project(cam);
    if (_d.z < 1 && Math.abs(_d.x) < 0.8 && Math.abs(_d.y) < 0.8) out.push(rec.data.name);
  }
  return out;
}
/** NASA has pictures of every lander from orbit and none from the ground. Each first photograph of one
 *  goes into the album (kept in the save) and earns a little science credit. Returns the names newly added. */
export function recordPhoto() {
  if (!S.album) S.album = {};
  const fresh = photoSubjects().filter((name) => !S.album[name]);
  for (const name of fresh) { S.album[name] = S.sol; addCredit(4); cheer(1); }
  if (fresh.length) S.stats.photographed = Object.keys(S.album).length;
  return fresh;
}

export function takePhoto(drawFrame) {
  const e = ctx.engine;
  const scaleWas = e.dynScale, qScaleWas = e.q.scale;
  e.dynScale = 1; e.q.scale = Math.max(qScaleWas, 1); e.resize();
  drawFrame();
  const canvas = e.renderer.domElement;
  return new Promise((resolve) => {
    const done = (blob) => {
      e.dynScale = scaleWas; e.q.scale = qScaleWas; e.resize();
      resolve(blob ? { blob, name: photoName(), subjects: recordPhoto() } : null);
    };
    try { canvas.toBlob(done, 'image/png'); } catch (err) { done(null); }
  });
}
