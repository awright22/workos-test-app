/*
 * Trodden ground: where he walks and where he drives, again and again, the ground wears into paths.
 *
 * Boot prints and tyre marks (render/vfx.js) are the last few hundred of each and are gone when the game is closed.
 * This is what stays: a map of the ground round the Hab, 160 m square at five eighths of a metre a cell, one byte a
 * cell. Each footfall and each length of rut adds a little where it fell; the ground's shader (render/
 * terrain-material.js) reads it and draws worn ground as it draws the yard round the Hab: darker, packed, its ripples
 * gone. One crossing shows faintly, a dozen make a path. A dust storm fills them in again, slowly. The map is kept
 * in the save (run-length coded: most of it is untouched ground).
 */
import * as THREE from 'three';
import { World } from '../world/build.js';
import { ctx } from './ctx.js';
import { S, BAL } from './state.js';
import { WEAR_N, WEAR_SPAN } from '../planet/constants.js';

const CELL = WEAR_SPAN / WEAR_N;
const data = new Uint8Array(WEAR_N * WEAR_N);
const _d = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Quaternion();
let tex = null, dirty = false, wait = 0, fadeAcc = 0, bound = null, lastStep = null;

/** The map as a texture, and the frame it lies in, given to the ground's shader. Call once the Hab stands. */
export function initWear() {
  if (!tex) {
    tex = new THREE.DataTexture(data, WEAR_N, WEAR_N, THREE.RedFormat, THREE.UnsignedByteType);
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
  }
  data.fill(0); lastStep = null;
  tex.needsUpdate = true; dirty = false;
  bound = World.hab || null;
  const u = ctx.terrainUniforms;
  if (!u || !u.uWear || !bound) return;
  u.uWear.value = tex;
  u.uWearO.value.copy(bound.position);
  u.uWearX.value.set(1, 0, 0).applyQuaternion(bound.quaternion);
  u.uWearZ.value.set(0, 0, 1).applyQuaternion(bound.quaternion);
}

/** The cell (as fractional column and row) under a place in the world, or null off the map. */
function cellOf(pos) {
  if (!bound) return null;
  _d.copy(pos).sub(bound.position);
  if (_d.lengthSq() > WEAR_SPAN * WEAR_SPAN) return null;
  _d.applyQuaternion(_q.copy(bound.quaternion).invert());
  const x = _d.x / CELL + WEAR_N / 2 - 0.5, y = _d.z / CELL + WEAR_N / 2 - 0.5;
  // (the outermost cells stay untouched: past the map's edge the shader reads them)
  return x < 1 || y < 1 || x > WEAR_N - 3 || y > WEAR_N - 3 ? null : [x, y];
}

/** Wear the ground at a place in the world by `amount` (0..255: a metre walked is 14, a metre of rut about 30). */
export function tread(pos, amount) {
  const c = cellOf(pos);
  if (!c) return;
  const x0 = Math.floor(c[0]), y0 = Math.floor(c[1]), fx = c[0] - x0, fy = c[1] - y0;
  // (shared between the four cells it falls among, so a path is as wide as a path and has no steps in it)
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const k = (y0 + j) * WEAR_N + x0 + i, w = (i ? fx : 1 - fx) * (j ? fy : 1 - fy);
    const v = data[k] + amount * w;
    // (a byte: what is under half a step is kept by chance, so that light wear adds up as it should)
    data[k] = Math.min(255, Math.floor(v) + (Math.random() < v - Math.floor(v) ? 1 : 0));
  }
  dirty = true;
}

/**
 * Wear the ground from the last footfall to this one, `perMetre` a metre: feet come down two metres apart at a lope,
 * and a path worn only where they fell is a row of dots.
 */
export function treadPath(pos, perMetre) {
  if (lastStep && lastStep.distanceToSquared(pos) < 16) {
    const d = lastStep.distanceTo(pos), n = Math.max(1, Math.ceil(d / (CELL * 0.6)));
    for (let i = 1; i <= n; i++) tread(_e.copy(lastStep).lerp(pos, i / n), perMetre * d / n);
  } else tread(pos, perMetre * 0.6);
  (lastStep || (lastStep = new THREE.Vector3())).copy(pos);
}

/** How worn the ground is at a place in the world, 0..1 (for tests and for sound). */
export function wearAt(pos) {
  const c = cellOf(pos);
  return c ? data[Math.round(c[1]) * WEAR_N + Math.round(c[0])] / 255 : 0;
}

/**
 * How much more dust lies on his things than on the day he was left, 0..1 (world/models.js lays it on). It settles
 * sol by sol, over the first thirty of them; and a storm lays a coat of its own, which the wind takes off again over
 * the next few sols.
 */
export function dustAge() {
  return Math.min(1, Math.max(0, (S.sol - 1 + S.tod) / 30)) * 0.6 + (S.flags.dusting || 0) * 0.4;
}

/** Each frame: send what has changed to the picture (a few times a second at most), and let a storm fill the paths in. */
export function updateWear(dt, storm) {
  // (a storm's coat: all of it after a third of a sol in the thick of one; gone again four sols after)
  const coat = S.flags.dusting || 0;
  S.flags.dusting = storm > 0.3 ? Math.min(1, coat + dt * storm / (BAL.solLen * 0.33)) : Math.max(0, coat - dt / (BAL.solLen * 4));
  if (storm > 0.35) {
    // (a full storm takes a worn path down by about a tenth in an hour of the game's clock at its height)
    fadeAcc += dt * storm * 0.06;
    if (fadeAcc >= 1) {
      fadeAcc -= 1;
      for (let k = 0; k < data.length; k++) if (data[k]) data[k]--;
      dirty = true;
    }
  }
  wait -= dt;
  if (dirty && wait <= 0 && tex) { tex.needsUpdate = true; dirty = false; wait = 0.3; }
}

/** The map for the save: runs of equal cells at sixteen levels, as text. '' when nothing is worn. */
export function serializeWear() {
  const out = [];
  let run = 0, last = -1, any = false;
  const put = () => { while (run > 0) { const n = Math.min(run, 4095); out.push(String.fromCharCode(0x30 + last), String.fromCharCode(0x30 + (n >> 6)), String.fromCharCode(0x30 + (n & 63))); run -= n; } };
  for (let k = 0; k < data.length; k++) {
    const v = data[k] >> 4;
    if (v) any = true;
    if (v === last) run++; else { put(); last = v; run = 1; }
  }
  put();
  return any ? out.join('') : '';
}
/** The map back from a save (or nothing: an older save, or new ground). */
export function restoreWear(text) {
  data.fill(0);
  if (typeof text === 'string' && text.length % 3 === 0) {
    let k = 0;
    for (let i = 0; i < text.length && k < data.length; i += 3) {
      const v = text.charCodeAt(i) - 0x30, n = ((text.charCodeAt(i + 1) - 0x30) << 6) | (text.charCodeAt(i + 2) - 0x30);
      if (v < 0 || v > 15 || n < 0) break;
      // (the middle of its level: what was saved at 37 comes back at 40, not at 32)
      data.fill(v ? v * 16 + 8 : 0, k, Math.min(data.length, k + n));
      k += n;
    }
  }
  if (tex) tex.needsUpdate = true;
  dirty = false;
}
