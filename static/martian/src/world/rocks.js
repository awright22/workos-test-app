/*
 * Rocks: boulder fields and scattered stones as instanced meshes.
 *
 * The terrain workers place the rocks for a chunk when they build it (see terrain/chunk.js);
 * this module keeps those lists while their chunks are alive and, whenever the set changes or
 * the camera has moved, refills a few instanced meshes with the rocks in range. Large rocks
 * also become colliders.
 */
import * as THREE from 'three';
import { gnoise3 } from '../core/math.js';

/** Colliders for large rocks near the player: { v: unit direction, r: metres }. */
export const rockColliders = [];

function rockGeometry(detail, seed, squash) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = gnoise3(x * 1.3 + seed, y * 1.3, z * 1.3) * 0.38 + gnoise3(x * 3.1, y * 3.1 + seed, z * 3.1) * 0.16;
    const k = 1 + n;
    x *= k; y *= k * squash; z *= k;
    if (y < -0.2) y = -0.2 + (y + 0.2) * 0.3;               // the buried part is flattened
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _up = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _c = new THREE.Color(), _ax = new THREE.Vector3();

export class RockField {
  /**
   * @param {THREE.Object3D} parent
   * @param {import('../terrain/terrain.js').Terrain} terrain
   * @param {{density?: number, shadowRange?: number}} [o]
   */
  constructor(parent, terrain, o = {}) {
    this.terrain = terrain;
    this.density = o.density === undefined ? 1 : o.density;
    this.sets = new Map();                         // node -> { kind, data, origin }
    this.dirty = true;
    this.anchor = new THREE.Vector3();
    this.lastCam = new THREE.Vector3(1e9, 0, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.93, metalness: 0, flatShading: true });
    this.material = mat;
    this.shadowRange = o.shadowRange || 0;           // 0: rocks cast no shadows
    const mk = (geo, cap, cast) => {
      const m = new THREE.InstancedMesh(geo, mat, cap);
      m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false; m.count = 0;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      parent.add(m);
      return m;
    };
    // boulders close by get the detailed shape and a shadow; the rest are cheap
    this.near = mk(rockGeometry(2, 1.7, 0.72), Math.round(220 * this.density), this.shadowRange > 0);
    this.far = [rockGeometry(1, 9.2, 0.6), rockGeometry(1, 4.4, 0.82)].map((g) => mk(g, Math.round(700 * this.density), false));
    this.small = mk(rockGeometry(0, 6.1, 0.62), Math.round(3200 * this.density), false);
    this.smallCap = this.small.instanceMatrix.count;
    terrain.onChunk = (node, c) => { if (c.rocks && c.rocks.length) { this.sets.set(node, { kind: node.level === terrain.rockLevels.big ? 'big' : 'small', data: c.rocks, origin: c.origin }); this.dirty = true; } };
    terrain.onDispose = (node) => { if (this.sets.delete(node)) this.dirty = true; };
  }

  /** Call once a frame after terrain.update(). */
  update(camPos) {
    if (!this.dirty && camPos.distanceToSquared(this.lastCam) < 18 * 18) return;
    this.dirty = false;
    this.lastCam.copy(camPos);
    // instance matrices are stored relative to an anchor near the camera, to stay float32-exact
    this.anchor.copy(camPos);
    for (const m of [this.near, ...this.far, this.small]) m.position.copy(this.anchor);
    let nNear = 0, nSmall = 0;
    const nFar = [0, 0];
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
        _s.set(size * (0.75 + ((rnd * 7) % 1) * 0.6), size * (0.6 + ((rnd * 13) % 1) * 0.7), size * (0.75 + ((rnd * 29) % 1) * 0.6));
        _m.compose(_p.set(x - this.anchor.x, y - this.anchor.y, z - this.anchor.z), _q2, _s);
        // colour: dusty brown through to dark basalt
        const dark = (rnd * 3.7) % 1;
        _c.setRGB(0.30 - dark * 0.16, 0.185 - dark * 0.095, 0.135 - dark * 0.06);
        if (big) {
          const close = dist < Math.max(this.shadowRange, 60) && size > 0.6;
          if (close && nNear < this.near.instanceMatrix.count) {
            this.near.setMatrixAt(nNear, _m); this.near.setColorAt(nNear, _c); nNear++;
          } else {
            const v = rnd < 0.5 ? 0 : 1, mesh = this.far[v];
            if (nFar[v] >= mesh.instanceMatrix.count) continue;
            mesh.setMatrixAt(nFar[v], _m); mesh.setColorAt(nFar[v], _c); nFar[v]++;
          }
          if (size > 1.05 && dist < 140) rockColliders.push({ v: _up.clone(), r: size * 0.62 });
        } else {
          if (nSmall >= this.smallCap) continue;
          this.small.setMatrixAt(nSmall, _m);
          this.small.setColorAt(nSmall, _c);
          nSmall++;
        }
      }
    }
    const flush = (m, n) => { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; };
    flush(this.near, nNear); flush(this.far[0], nFar[0]); flush(this.far[1], nFar[1]); flush(this.small, nSmall);
    this.counts = { big: nNear + nFar[0] + nFar[1], near: nNear, small: nSmall, colliders: rockColliders.length };
  }
}
