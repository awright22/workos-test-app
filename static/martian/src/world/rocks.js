/*
 * Rocks: boulder fields and scattered stones as instanced meshes.
 *
 * The terrain workers place the rocks for a chunk when they build it (see terrain/chunk.js);
 * this module keeps those lists while their chunks are alive and, whenever the set changes or
 * the camera has moved, refills a few instanced meshes with the rocks in range. Large rocks
 * also become colliders.
 */
import * as THREE from 'three';
import { mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { gnoise3 } from '../core/math.js';
import { detailTextures } from '../render/noise3d.js';
import { GLSL_GROUND_GRADE } from '../render/terrain-material.js';
import { dirToFace, faceToDir } from '../planet/height.js';
import { R } from '../planet/constants.js';
import { hashU } from '../core/math.js';

/** Colliders for large rocks near the player: { v: unit direction, r: metres }. */
export const rockColliders = [];

/**
 * One rock shape: a lumpy ball cut by a few random planes (basalt breaks along flat faces),
 * squashed, its buried underside flattened. Facets keep hard edges, the lumps between them are
 * smooth. Each vertex carries a tint: pale dust settled on what faces up, and a dark rim where
 * the rock meets the ground.
 */
function rockGeometry(detail, seed, squash, cuts, crease = 0.8) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  let s = (seed * 9301 + 49297) | 0;
  const rnd = () => { s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const planes = [];
  for (let i = 0; i < cuts; i++) {
    const z = rnd() * 1.5 - 0.5, a = rnd() * Math.PI * 2, r = Math.sqrt(Math.max(0, 1 - z * z));       // more cuts on the upper half
    planes.push([r * Math.cos(a), z, r * Math.sin(a), 0.56 + rnd() * 0.34]);      // some deep: broken faces, not a tumbled pebble
  }
  // no rock is as wide as it is long
  const sx = 0.8 + rnd() * 0.5, sz = 0.72 + rnd() * 0.4;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + gnoise3(x * 1.3 + seed, y * 1.3, z * 1.3) * 0.36 + gnoise3(x * 2.9, y * 2.9 + seed, z * 2.9) * 0.12;
    x *= k; y *= k; z *= k;
    for (const [nx, ny, nz, d] of planes) {
      const over = x * nx + y * ny + z * nz - d;
      if (over > 0) { x -= nx * over; y -= ny * over; z -= nz * over; }
    }
    x *= sx; z *= sz;
    y *= squash;
    if (y < -0.2) y = -0.2 + (y + 0.2) * 0.3;               // the buried part is flattened
    p.setXYZ(i, x, y, z);
  }
  g = toCreasedNormals(g, crease);
  // per vertex: how much dust has settled (what faces up), and the shade where rock meets ground
  const pos = g.attributes.position, nor = g.attributes.normal;
  const mix = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const up = nor.getY(i), y = pos.getY(i);
    mix[i * 2] = Math.min(1, Math.max(0, (up - 0.25) / 0.6)) ** 1.5;
    mix[i * 2 + 1] = 0.42 + 0.58 * Math.min(1, Math.max(0, (y + 0.18) / 0.34));
  }
  g.setAttribute('aRock', new THREE.BufferAttribute(mix, 2));
  return g;
}

/**
 * The rocks' material. A rock is the colour of the ground it sits on: darker and greyer where
 * the stone is bare, the ground's own dust where it has settled on top, with grain from the
 * detail texture. `uniforms.uHere` is the direction from the planet's centre to the camera.
 */
function rockMaterial(albedoCube) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
  const uniforms = { uGrain: { value: detailTextures().grain }, uAlbedo: { value: albedoCube }, uHere: { value: new THREE.Vector3(0, 1, 0) } };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec2 aRock;
        varying vec2 vRockMix;
        varying vec3 vRockPos;
        varying vec3 vRockN;
        varying mat3 vRockRot;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          mat3 rockM = mat3(instanceMatrix);
        #else
          mat3 rockM = mat3(1.0);
        #endif
        vec3 rockS = vec3(length(rockM[0]), length(rockM[1]), length(rockM[2]));
        vRockPos = position * rockS;                            // the rock's own frame, in metres: the grain stays put
        vRockN = normal;
        vRockMix = aRock;
        vRockRot = mat3(viewMatrix) * mat3(modelMatrix) * mat3(rockM[0] / rockS.x, rockM[1] / rockS.y, rockM[2] / rockS.z);`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform highp sampler3D uGrain;
        uniform samplerCube uAlbedo;
        uniform vec3 uHere;
        varying vec2 vRockMix;
        varying vec3 vRockPos;
        varying vec3 vRockN;
        varying mat3 vRockRot;
        ${GLSL_GROUND_GRADE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec4 rg1 = texture(uGrain, vRockPos * 0.55 + 0.37);
        vec4 rg2 = texture(uGrain, vRockPos * 4.1);
        vec3 rawGround = textureCube(uAlbedo, uHere).rgb;
        float rawLum = dot(rawGround, vec3(0.3, 0.55, 0.15));
        float icy = smoothstep(0.19, 0.30, rawLum) * smoothstep(0.50, 0.78, min(rawGround.g, rawGround.b) / max(rawGround.r, 0.001)) * smoothstep(0.88, 0.95, abs(uHere.y));
        vec3 ground = mix(groundGrade(rawGround), vec3(0.56, 0.62, 0.70), icy);
        float gl = dot(ground, vec3(0.3, 0.55, 0.15));
        // diffuseColor carries the rock's own tone (instance colour): how dark, how grey
        // basalt: darker and greyer than the dust that settles on it, which lies on what faces up
        vec3 stone = mix(mix(vec3(gl), ground, 0.55) * 0.9, vec3(0.20, 0.19, 0.20), icy * 0.8) * diffuseColor.rgb;
        // (dust lies thick on whatever faces the sky: a rock is the ground's colour on top and its own below)
        float dust = clamp(vRockMix.x * 1.45 + 0.02 + (rg1.a - 0.5) * 0.9, 0.0, 1.0);
        diffuseColor.rgb = mix(stone, ground * 0.92, dust) * vRockMix.y * (1.0 + (rg1.a - 0.5) * 0.7 + (rg2.a - 0.5) * 0.45);`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        {
          vec3 on = normalize(vRockN);
          vec3 g = (rg1.rgb - 0.5) * 1.3 + (rg2.rgb - 0.5) * 0.9;
          g -= on * dot(g, on);
          normal = normalize(normal - vRockRot * g);
        }`);
  };
  mat.customProgramCacheKey = () => 'rock6';
  return mat;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _up = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _c = new THREE.Color(), _ax = new THREE.Vector3();

export class RockField {
  /**
   * @param {THREE.Object3D} parent
   * @param {import('../terrain/terrain.js').Terrain} terrain
   * @param {{density?: number, shadowRange?: number, albedoCube: THREE.CubeTexture}} o
   */
  constructor(parent, terrain, o = {}) {
    this.terrain = terrain;
    this.density = o.density === undefined ? 1 : o.density;
    this.sets = new Map();                         // node -> { kind, data, origin }
    this.dirty = true;
    this.anchor = new THREE.Vector3();
    this.lastCam = new THREE.Vector3(1e9, 0, 0);
    const mat = rockMaterial(o.albedoCube);
    this.material = mat;
    this.shadowRange = o.shadowRange || 0;           // 0: rocks cast no shadows
    const mk = (geo, cap, cast) => {
      const m = new THREE.InstancedMesh(geo, mat, cap);
      m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false; m.count = 0;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      parent.add(m);
      return m;
    };
    // boulders close by get the detailed shapes and a shadow; the rest are cheap
    // (blocky, not slabs: a third review found every rock a flat-topped plate)
    // Two families at every distance: broken basalt, cut along flat faces, and boulders the wind has rounded
    // (a fourth review found every rock the same chip). Shape 0 is the broken one, shape 1 the rounded.
    this.near = [rockGeometry(3, 1.7, 0.94, 7, 0.5), rockGeometry(3, 5.3, 0.84, 2, 1.25)].map((g) => mk(g, Math.round(44 * this.density), this.shadowRange > 0));
    // between the two: whatever is big on the screen but not underfoot gets a shape with enough faces not to show
    // them (a three-metre boulder at sixty metres was eighty triangles). Not on the lowest quality, which is at its
    // budget of draw calls.
    this.mid = this.density >= 0.7 ? [rockGeometry(2, 3.1, 0.9, 6, 0.55), rockGeometry(2, 7.7, 0.82, 2, 1.25)].map((g) => mk(g, Math.round(150 * this.density), false)) : null;
    this.far = [rockGeometry(1, 9.2, 0.78, 5, 0.6), rockGeometry(1, 4.4, 0.88, 1, 1.25)].map((g) => mk(g, Math.round(700 * this.density), false));
    // stones: a rounder shape underfoot, the simplest one beyond
    this.smallNear = mk(rockGeometry(2, 2.6, 0.8, 2, 1.1), Math.round(260 * this.density), this.shadowRange > 0);
    this.small = mk(rockGeometry(0, 6.1, 0.62, 2, 0.5), Math.round(3600 * this.density), false);
    this.gravel = new GravelField(parent, terrain.planet, mat, { reach: this.density < 0.7 ? 9 : 14, cap: Math.round(2600 * Math.min(1, this.density)) });
    this.smallCap = this.small.instanceMatrix.count;
    terrain.onChunk = (node, c) => { if (c.rocks && c.rocks.length) { this.sets.set(node, { kind: node.level === terrain.rockLevels.big ? 'big' : 'small', data: c.rocks, origin: c.origin }); this.dirty = true; } };
    terrain.onDispose = (node) => { if (this.sets.delete(node)) this.dirty = true; };
  }

  /** Call once a frame after terrain.update(). */
  update(camPos) {
    this.material.userData.uniforms.uHere.value.copy(camPos).normalize();
    this.gravel.update(camPos);
    if (!this.dirty && camPos.distanceToSquared(this.lastCam) < 18 * 18) return;
    this.dirty = false;
    this.lastCam.copy(camPos);
    // instance matrices are stored relative to an anchor near the camera, to stay float32-exact
    this.anchor.copy(camPos);
    for (const m of [...this.near, ...(this.mid || []), ...this.far, this.smallNear, this.small]) m.position.copy(this.anchor);
    let nSmall = 0, nSmallNear = 0;
    const nNear = [0, 0], nMid = [0, 0], nFar = [0, 0];
    rockColliders.length = 0;
    const frame = this.terrain.frame;
    for (const [node, set] of this.sets) {
      if (node.used < frame - 2) continue;                    // its chunk is not part of the current view
      const big = set.kind === 'big';
      const range = big ? 520 : 85;
      const d = set.data, o = set.origin;
      // skip the whole chunk if it is out of range
      _p.set(o[0], o[1], o[2]);
      if (_p.distanceTo(camPos) > range + node.size) continue;
      for (let i = 0; i < d.length; i += 8) {
        const x = o[0] + d[i], y = o[1] + d[i + 1], z = o[2] + d[i + 2];
        const dist = Math.hypot(x - camPos.x, y - camPos.y, z - camPos.z);
        const size = d[i + 6], rnd = d[i + 7];
        if (dist > range || (big && size < 0.9 && dist > 260)) continue;
        _up.set(d[i + 3], d[i + 4], d[i + 5]);
        _q.setFromUnitVectors(_y, _up);
        _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
        _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
        _q2.multiply(_q.setFromAxisAngle(_ax, (rnd - 0.5) * 0.7));
        // (never much taller than it is wide: a shard standing on end reads as floating)
        _s.set(size * (0.8 + ((rnd * 7) % 1) * 0.55), size * (0.6 + ((rnd * 13) % 1) * 0.5), size * (0.8 + ((rnd * 29) % 1) * 0.55));
        _m.compose(_p.set(x - this.anchor.x, y - this.anchor.y, z - this.anchor.z), _q2, _s);
        // tone of the bare stone: weathered brown through to dark basalt (dust is added on top by the shape's own tint)
        const dark = (rnd * 3.7) % 1, pale = (rnd * 11.3) % 1 > 0.86 ? 0.25 : 0;     // most are dark basalt; a few are pale and dusty
        // (none near black: under this sky even dark basalt is a dusty brown-grey)
        _c.setRGB(0.66 - dark * 0.26 + pale, 0.64 - dark * 0.25 + pale, 0.64 - dark * 0.23 + pale);
        if (big) {
          const close = dist < 28 && size > 0.5;            // the detailed, shadow-casting shapes: only where the detail can be seen
          const nv = (rnd * 5.3) % 1 < 0.55 ? 0 : 1;        // which family
          if (close && nNear[nv] < this.near[nv].instanceMatrix.count) {
            this.near[nv].setMatrixAt(nNear[nv], _m); this.near[nv].setColorAt(nNear[nv], _c); nNear[nv]++;
          } else if (this.mid && (dist < 70 || size / dist > 0.028) && nMid[nv] < this.mid[nv].instanceMatrix.count) {
            this.mid[nv].setMatrixAt(nMid[nv], _m); this.mid[nv].setColorAt(nMid[nv], _c); nMid[nv]++;
          } else {
            const v = nv, mesh = this.far[v];
            if (nFar[v] >= mesh.instanceMatrix.count) continue;
            mesh.setMatrixAt(nFar[v], _m); mesh.setColorAt(nFar[v], _c); nFar[v]++;
          }
          if (size > 1.05 && dist < 140) rockColliders.push({ v: _up.clone(), r: size * 0.62 });
        } else {
          if (dist < 22 && nSmallNear < this.smallNear.instanceMatrix.count) {
            this.smallNear.setMatrixAt(nSmallNear, _m); this.smallNear.setColorAt(nSmallNear, _c); nSmallNear++;
            continue;
          }
          if (nSmall >= this.smallCap) continue;
          this.small.setMatrixAt(nSmall, _m);
          this.small.setColorAt(nSmall, _c);
          nSmall++;
        }
      }
    }
    const flush = (m, n) => { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; };
    flush(this.near[0], nNear[0]); flush(this.near[1], nNear[1]); flush(this.far[0], nFar[0]); flush(this.far[1], nFar[1]);
    if (this.mid) { flush(this.mid[0], nMid[0]); flush(this.mid[1], nMid[1]); }
    flush(this.smallNear, nSmallNear); flush(this.small, nSmall);
    this.counts = { big: nNear[0] + nNear[1] + nMid[0] + nMid[1] + nFar[0] + nFar[1], near: nNear[0] + nNear[1], small: nSmall + nSmallNear, colliders: rockColliders.length };
  }
}

/*
 * Gravel: loose pebbles on the ground around the camera, as geometry. Texture alone cannot give
 * the near ground stones that stand up and catch the light. The pebbles are placed by a hash
 * of a grid laid across the cube face, so each one is always in the same place; cells come and
 * go as the camera moves. They lie in patches, not evenly.
 */
const CELL = 1.6;                           // metres
const FACE_M = R * Math.PI / 4;
const _fc = [0, 0, 0], _fd = [0, 0, 0];
class GravelField {
  constructor(parent, planet, material, o = {}) {
    this.planet = planet;
    this.reach = o.reach || 14;
    this.cap = o.cap || 2600;
    this.cells = new Map();                  // key -> Float64Array of pebbles: x, y, z, up xyz, size, rnd
    this.at = [NaN, NaN, NaN];
    this.mesh = new THREE.InstancedMesh(rockGeometry(0, 3.3, 0.6, 0, 3.2), material, this.cap);
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.frustumCulled = false; this.mesh.count = 0;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    parent.add(this.mesh);
  }

  _cell(face, ci, cj) {
    const h0 = hashU(ci, cj, face, 71);
    // patches: a slow field decides how stony this cell is
    faceToDir(face, (ci + 0.5) * CELL / FACE_M, (cj + 0.5) * CELL / FACE_M, _fd);
    const patch = gnoise3(_fd[0] * R / 9 + 3.3, _fd[1] * R / 9, _fd[2] * R / 9 - 5.1) + 0.5 * gnoise3(_fd[0] * R / 31, _fd[1] * R / 31 + 9.2, _fd[2] * R / 31);
    const n = Math.max(0, Math.round((0.6 + patch * 3.2) * 4 + ((h0 & 255) / 255 - 0.5) * 3));
    const out = new Float64Array(n * 8);
    let seed = h0, k = 0;
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const pads = this.planet.pads;
    for (let i = 0; i < n; i++) {
      const s = (ci + rnd()) * CELL / FACE_M, t = (cj + rnd()) * CELL / FACE_M, u = rnd(), v = rnd();
      if (s <= -1 || s >= 1 || t <= -1 || t >= 1) continue;
      faceToDir(face, s, t, _fd);
      // keep the middle of a levelled site clear: that is where the buildings stand
      let clear = true;
      for (let p = 0; p < pads.length; p++) {
        const pd = pads[p], keep = pd.r >= 40 ? 13.5 : pd.r >= 12 ? 6 : Math.min(pd.r, 4.5);
        if (_fd[0] * pd.x + _fd[1] * pd.y + _fd[2] * pd.z > Math.cos(keep / R)) { clear = false; break; }
      }
      if (!clear) continue;
      const size = 0.018 + 0.085 * u * u * u;                              // 2 to 10 cm, most of them small
      const r = this.planet.radiusFace(face, s, t, _fd[0], _fd[1], _fd[2], 1.5) - size * 0.25;
      out[k++] = _fd[0] * r; out[k++] = _fd[1] * r; out[k++] = _fd[2] * r;
      out[k++] = _fd[0]; out[k++] = _fd[1]; out[k++] = _fd[2];
      out[k++] = size; out[k++] = v;
    }
    return k === out.length ? out : out.subarray(0, k);
  }

  update(camPos) {
    const len = camPos.length();
    if (len - R > 400) { if (this.mesh.count) { this.mesh.count = 0; this.cells.clear(); this.at[0] = NaN; } return; }
    dirToFace(camPos.x / len, camPos.y / len, camPos.z / len, _fc);
    const face = _fc[0], ci0 = Math.floor(_fc[1] * FACE_M / CELL), cj0 = Math.floor(_fc[2] * FACE_M / CELL);
    if (face === this.at[0] && ci0 === this.at[1] && cj0 === this.at[2]) return;
    this.at[0] = face; this.at[1] = ci0; this.at[2] = cj0;
    const span = Math.ceil(this.reach / CELL), keep = new Set();
    for (let dj = -span; dj <= span; dj++) for (let di = -span; di <= span; di++) {
      if (di * di + dj * dj > span * span) continue;
      const key = face + ':' + (ci0 + di) + ':' + (cj0 + dj);
      keep.add(key);
      if (!this.cells.has(key)) this.cells.set(key, this._cell(face, ci0 + di, cj0 + dj));
    }
    for (const key of this.cells.keys()) if (!keep.has(key)) this.cells.delete(key);
    // instance positions are stored relative to a point near the camera, to stay float32-exact
    this.mesh.position.copy(camPos);
    let n = 0;
    for (const d of this.cells.values()) {
      for (let i = 0; i < d.length && n < this.cap; i += 8) {
        const size = d[i + 6], rnd = d[i + 7];
        _up.set(d[i + 3], d[i + 4], d[i + 5]);
        _q.setFromUnitVectors(_y, _up);
        _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
        _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
        _q2.multiply(_q.setFromAxisAngle(_ax, (rnd - 0.5) * 1.2));
        _s.set(size * (0.8 + ((rnd * 7) % 1) * 0.7), size * (0.5 + ((rnd * 13) % 1) * 0.6), size * (0.8 + ((rnd * 29) % 1) * 0.7));
        _m.compose(_p.set(d[i] - camPos.x, d[i + 1] - camPos.y, d[i + 2] - camPos.z), _q2, _s);
        const dark = (rnd * 3.7) % 1;
        _c.setRGB(0.50 - dark * 0.30, 0.48 - dark * 0.29, 0.49 - dark * 0.27);
        this.mesh.setMatrixAt(n, _m); this.mesh.setColorAt(n, _c); n++;
      }
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
