/*
 * The planet's surface as a level-of-detail quadtree on a cube sphere.
 *
 * Six root tiles (cube faces) split into four children wherever the camera is close, down to
 * tiles about 37 m across with a vertex every metre or so. Tiles beyond the horizon are never
 * built. Meshes are built in worker threads from the same height function the physics uses,
 * and a tile is only swapped for its children once all four are ready, so there are no holes.
 */
import * as THREE from 'three';
import { R } from '../planet/constants.js';
import { faceToDir } from '../planet/height.js';
import { buildChunk, chunkIndices, chunkSize } from './chunk.js';

const _d = [0, 0, 0];
const _v = new THREE.Vector3();

class Node {
  constructor(face, level, ix, iy, parent) {
    this.face = face; this.level = level; this.ix = ix; this.iy = iy; this.parent = parent;
    this.children = null;
    this.mesh = null;
    this.state = 0;                         // 0 nothing, 1 requested, 2 ready
    this.used = 0;                          // frame stamp of last use
    const span = 2 / (1 << level);
    faceToDir(face, -1 + (ix + 0.5) * span, -1 + (iy + 0.5) * span, _d);
    this.dir = new THREE.Vector3(_d[0], _d[1], _d[2]);
    this.center = this.dir.clone().multiplyScalar(R);      // refined when the mesh arrives
    this.size = chunkSize(level);
    this.radius = this.size * 0.75;                        // bounding radius, refined likewise
    this.angle = (this.size * 0.71) / R;                   // angular radius (radians)
    this.maxR = parent ? parent.maxR + 6 : R + 320;      // until built: no higher than its parent (plus fine detail)
  }
}

export class Terrain {
  /**
   * @param {object} o
   * @param {import('../planet/height.js').Planet} o.planet   height provider (main-thread copy)
   * @param {object} o.heightData   decoded height file, sent to the workers
   * @param {THREE.Object3D} o.parent  where chunk meshes are added
   * @param {THREE.Material} o.material
   * @param {string|URL} o.workerUrl
   * @param {number} [o.grid]      quads per chunk side (32 desktop, 24 phone)
   * @param {number} [o.maxLevel]  deepest quadtree level (9 gives ~1.15 m vertex spacing at grid 32)
   * @param {number} [o.split]     split a tile when the camera is closer than split x its size
   * @param {number} [o.workers]
   */
  constructor(o) {
    this.planet = o.planet;
    this.parent = o.parent;
    this.material = o.material;
    this.G = o.grid || 32;
    this.maxLevel = o.maxLevel || 9;
    this.split = o.split || 2.4;
    this.shadowLevel = o.shadowLevel === undefined ? 7 : o.shadowLevel;
    /** which quadtree levels carry rocks: boulders on a coarser level (seen from afar), stones on the finest */
    this.rockLevels = { big: Math.min(7, this.maxLevel - 1), small: this.maxLevel };
    this.index = new THREE.BufferAttribute(chunkIndices(this.G), 1);
    this.roots = [];
    for (let f = 0; f < 6; f++) this.roots.push(new Node(f, 0, 0, 0, null));
    this.frame = 0;
    this.pending = new Map();               // id -> node
    this.queue = [];
    this.nextId = 1;
    this.ready = [];                        // worker results waiting to become meshes
    this.live = 0;                          // meshes alive
    this.cacheLimit = o.cacheLimit || 420;
    this.visible = [];
    this.onChunk = null;                    // (node, data) hook for scatter systems
    this.onDispose = null;
    this.workers = [];
    this.idle = [];
    const count = o.workers === undefined ? 2 : o.workers;
    for (let i = 0; i < count; i++) {
      let w;
      try { w = new Worker(o.workerUrl); } catch (e) { break; }
      w.onmessage = (e) => this._onMessage(w, e.data);
      w.onerror = () => { this._workerFailed(w); };
      w.postMessage({ type: 'init', data: o.heightData });
      this.workers.push(w);
    }
    this.sync = this.workers.length === 0;  // no workers: build on the main thread
  }

  _workerFailed(w) {
    const i = this.workers.indexOf(w);
    if (i >= 0) this.workers.splice(i, 1);
    const j = this.idle.indexOf(w);
    if (j >= 0) this.idle.splice(j, 1);
    if (!this.workers.length) this.sync = true;
    for (const [id, node] of this.pending) if (node._worker === w) { this.pending.delete(id); node.state = 0; }
  }

  _onMessage(w, m) {
    if (m.type === 'ready') { this.idle.push(w); return; }
    if (m.type === 'chunk') {
      this.idle.push(w);
      const node = this.pending.get(m.id);
      this.pending.delete(m.id);
      if (node) this.ready.push([node, m]);
      this._dispatch(true);            // keep the worker busy; do not wait for the next frame
    }
  }

  _rockKind(level) { return level === this.rockLevels.big ? 'big' : level === this.rockLevels.small ? 'small' : null; }

  _request(node, priority) {
    if (node.state !== 0) return;
    node.state = 1;
    node.priority = priority;
    this.queue.push(node);
  }

  _dispatch(fromWorker) {
    if (!this.queue.length) return;
    if (this.sync) {
      if (fromWorker) return;
      // main-thread fallback: a few chunks per frame
      this.queue.sort((a, b) => a.priority - b.priority);
      for (let n = 0; n < 2 && this.queue.length; n++) {
        const node = this.queue.shift();
        this.ready.push([node, buildChunk(this.planet, node.face, node.level, node.ix, node.iy, this.G, this._rockKind(node.level))]);
      }
      return;
    }
    if (!this.idle.length) return;
    if (!fromWorker) this.queue.sort((a, b) => a.priority - b.priority);
    while (this.idle.length && this.queue.length) {
      const node = this.queue.shift();
      if (node.used < this.frame - 2) { node.state = 0; continue; }       // no longer wanted
      const w = this.idle.pop();
      const id = this.nextId++;
      node._worker = w;
      this.pending.set(id, node);
      w.postMessage({ type: 'build', id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, G: this.G, rocks: this._rockKind(node.level) });
    }
    // drop stale requests so the queue cannot grow without bound while moving fast
    if (this.queue.length > 64) {
      for (const n of this.queue.splice(64)) n.state = 0;
    }
  }

  _adopt(node, c) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(c.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(c.nor, 3, true));
    g.setAttribute('aTex', new THREE.BufferAttribute(c.tex, 3));
    g.setAttribute('aUv', new THREE.BufferAttribute(c.uv, 3));
    g.setIndex(this.index);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), c.radius);
    const mesh = new THREE.Mesh(g, this.material);
    mesh.position.set(c.origin[0], c.origin[1], c.origin[2]);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.receiveShadow = true;
    mesh.castShadow = node.level >= this.shadowLevel;
    mesh.visible = false;
    this.parent.add(mesh);
    node.mesh = mesh;
    node.state = 2;
    node.center.set(c.origin[0], c.origin[1], c.origin[2]);
    node.radius = c.radius;
    node.maxR = c.maxR;
    this.live++;
    if (this.onChunk) this.onChunk(node, c);
  }

  _drop(node) {
    if (node.mesh) {
      if (this.onDispose) this.onDispose(node);
      this.parent.remove(node.mesh);
      node.mesh.geometry.dispose();
      node.mesh = null;
      this.live--;
    }
    node.state = 0;
  }

  /**
   * Radius of a sphere that the ground is nowhere below within sight of the camera. Anything
   * hidden by that sphere is hidden by the real ground. Near the surface it is the lowest
   * ground within about 1.5 km (which is where a grazing sight-line touches down); from high
   * up it is the lowest point on the planet.
   */
  _localFloor(camPos, camDir, camR) {
    const globalFloor = R - 130;
    if ((this.frame & 7) !== 1 && this._floor !== undefined) return this._floor;
    const ground = this.planet.radius(camDir.x, camDir.y, camDir.z, 12);
    if (camR - ground > 250) return (this._floor = globalFloor);
    let low = ground;
    // local east/north
    let ex = -camDir.z, ez = camDir.x; const el = Math.hypot(ex, ez) || 1; ex /= el; ez /= el;
    const nx = camDir.y * ez, ny = camDir.z * ex - camDir.x * ez, nz = -camDir.y * ex;
    for (const dist of [120, 320, 650, 1050, 1500]) {
      const k = dist / R;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + dist, c = Math.cos(a) * k, s = Math.sin(a) * k;
        let x = camDir.x + ex * c + nx * s, y = camDir.y + ny * s, z = camDir.z + ez * c + nz * s;
        const l = 1 / Math.hypot(x, y, z);
        const r = this.planet.radius(x * l, y * l, z * l, 24);
        if (r < low) low = r;
      }
    }
    return (this._floor = Math.max(globalFloor, low - 18));
  }

  /** Below the horizon as seen from the camera (never visible, so never built). */
  _hidden(node, camDir, camR, horizon) {
    const ang = Math.acos(Math.min(1, Math.max(-1, camDir.dot(node.dir))));
    const reach = horizon + Math.acos(Math.min(1, this.floorR / node.maxR)) + node.angle;
    return ang > reach;
  }

  /**
   * Choose the tiles to draw for this camera position and request any that are missing.
   * @returns {number} how many wanted tiles are still being built (0 = fully settled)
   */
  update(camPos) {
    this.frame++;
    // adopt finished chunks (bounded per frame so uploads never hitch)
    for (let n = 0; n < 12 && this.ready.length; n++) {
      const [node, c] = this.ready.shift();
      if (node.state === 1) this._adopt(node, c);
    }
    const camR = camPos.length();
    const camDir = _v.copy(camPos).multiplyScalar(1 / camR);
    this.floorR = this._localFloor(camPos, camDir, camR);
    const horizon = Math.acos(Math.min(1, this.floorR / Math.max(camR, this.floorR + 1)));
    for (const v of this.visible) v.mesh.visible = false;
    this.visible.length = 0;
    this.missing = 0;
    for (const root of this.roots) this._visit(root, camPos, camDir.clone(), camR, horizon);
    for (const v of this.visible) v.mesh.visible = true;
    this._dispatch();
    if (this.live > this.cacheLimit && (this.frame & 31) === 0) this._prune();
    return this.missing + this.ready.length;
  }

  /** @returns {boolean} true if this subtree drew itself completely */
  _visit(node, camPos, camDir, camR, horizon) {
    node.used = this.frame;
    const dist = Math.max(0, camPos.distanceTo(node.center) - node.radius * 0.5);
    const wantSplit = node.level < this.maxLevel && dist < node.size * this.split;
    if (node.level > 1 && this._hidden(node, camDir, camR, horizon)) return true;   // nothing to draw
    if (node.state === 0) this._request(node, dist / node.size + node.level * 0.01);
    if (wantSplit) {
      if (!node.children) {
        const l = node.level + 1, x = node.ix * 2, y = node.iy * 2;
        node.children = [new Node(node.face, l, x, y, node), new Node(node.face, l, x + 1, y, node),
          new Node(node.face, l, x, y + 1, node), new Node(node.face, l, x + 1, y + 1, node)];
      }
      let allReady = true;
      for (const c of node.children) {
        c.used = this.frame;
        if (c.level > 1 && this._hidden(c, camDir, camR, horizon)) continue;
        if (c.state !== 2) {
          allReady = false;
          if (c.state === 0) this._request(c, camPos.distanceTo(c.center) / c.size + c.level * 0.01);
        }
      }
      if (allReady) {
        for (const c of node.children) this._visit(c, camPos, camDir, camR, horizon);
        return true;
      }
      this.missing++;
    }
    if (node.state === 2) { this.visible.push(node); return true; }
    this.missing++;
    return false;
  }

  _prune() {
    // free the least recently used tiles (never roots, never anything used this frame)
    const stale = [];
    const walk = (n) => {
      if (n.children) for (const c of n.children) walk(c);
      if (n.level > 0 && n.state === 2 && n.used < this.frame - 90) stale.push(n);
    };
    for (const r of this.roots) walk(r);
    stale.sort((a, b) => a.used - b.used);
    for (let i = 0; i < stale.length && this.live > this.cacheLimit * 0.8; i++) this._drop(stale[i]);
    // forget child lists that hold nothing, so the tree itself stays small
    const trim = (n) => {
      if (!n.children) return n.state === 0 && n.used < this.frame - 90;
      let empty = true;
      for (const c of n.children) if (!trim(c)) empty = false;
      if (empty) n.children = null;
      return empty && n.state === 0 && n.used < this.frame - 90;
    };
    for (const r of this.roots) trim(r);
  }

  /** Tell the workers about the levelled building sites and rebuild any tile that overlaps one
   *  of `changed` (pads added since the last call). */
  syncPads(changed = []) {
    for (const w of this.workers) w.postMessage({ type: 'pads', pads: this.planet.pads });
    if (!changed.length) return;
    const hit = (n) => changed.some((p) => {
      const d = Math.acos(Math.min(1, Math.max(-1, n.dir.x * p.x + n.dir.y * p.y + n.dir.z * p.z)));
      return d < n.angle + (p.r + p.blend) / R;
    });
    const walk = (n) => {
      if (n.children) for (const c of n.children) walk(c);
      if (n.state !== 0 && hit(n)) { n._stale = true; }
    };
    for (const r of this.roots) walk(r);
    // stale tiles are rebuilt in place: keep showing the old mesh until the new one arrives
    const redo = (n) => {
      if (n.children) for (const c of n.children) redo(c);
      if (n._stale && n.state === 2) { n._stale = false; this._rebuild(n); }
      else if (n._stale) { n._stale = false; }
    };
    for (const r of this.roots) redo(r);
  }

  _rebuild(node) {
    const c = buildChunk(this.planet, node.face, node.level, node.ix, node.iy, this.G, this._rockKind(node.level));
    const old = node.mesh;
    if (this.onDispose) this.onDispose(node);
    this.parent.remove(old);
    old.geometry.dispose();
    this.live--;
    node.mesh = null;
    this._adopt(node, c);
    node.mesh.visible = old.visible;
  }

  /** Resolve once the tiles needed for `camPos` are all built (for load screens and teleports). */
  async settle(camPos, timeoutMs = 20000) {
    const t0 = performance.now();
    for (;;) {
      const missing = this.update(camPos);
      if (missing === 0 && !this.queue.length && !this.pending.size) return true;
      if (performance.now() - t0 > timeoutMs) return false;
      await new Promise((r) => setTimeout(r, 12));
    }
  }

  stats() {
    const levels = {};
    for (const v of this.visible) levels[v.level] = (levels[v.level] || 0) + 1;
    return { visible: this.visible.length, live: this.live, terrainTris: this.visible.length * this.index.count / 3, levels, queued: this.queue.length, pending: this.pending.size };
  }
}
