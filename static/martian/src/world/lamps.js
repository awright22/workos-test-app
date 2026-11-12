/*
 * Lamps. The world has many light fittings (the Hab's ceiling lights and grow lights, porch
 * lamps, greenhouse lights, beacons, capsule strobes) and a phone can afford only a few real
 * lights. So the fittings are just "sources", and a small pool of point lights is handed, every
 * frame, to the sources that matter most to the camera. The rest only glow.
 */
import * as THREE from 'three';

/** @typedef {{object: THREE.Object3D, offset?: THREE.Vector3, color: number, power: number, range: number,
 *   decay?: number, level: () => number, room?: boolean}} LampSource */
/** @type {LampSource[]} */
export const lampSources = [];

/**
 * Register a fitting. `level()` returns how bright it is now, 0..1+ (darkness, power, a blink);
 * `room` marks a light inside the Hab, which counts only while the room is being drawn.
 */
export function addLamp(object, o) {
  const s = { object, offset: o.offset || null, color: o.color, power: o.power, range: o.range, decay: o.decay === undefined ? 1.7 : o.decay, level: o.level || (() => 1), room: !!o.room, pos: new THREE.Vector3(), score: 0, now: 0 };
  lampSources.push(s);
  return s;
}
export function removeLampsOf(object) {
  for (let i = lampSources.length - 1; i >= 0; i--) if (lampSources[i].object === object) lampSources.splice(i, 1);
}

export class LampPool {
  /** @param {THREE.Scene} scene  @param {number} n  how many real lights */
  constructor(scene, n) {
    this.slots = [];
    for (let i = 0; i < n; i++) {
      const light = new THREE.PointLight(0xffffff, 0, 20, 1.7);
      scene.add(light);
      this.slots.push({ light, source: null });
    }
  }

  /** @param {THREE.Vector3} camPos  @param {boolean} roomShown  @param {number} dt */
  update(camPos, roomShown, dt) {
    // how much each source matters: its light where the camera is
    const live = [];
    for (const s of lampSources) {
      s.now = 0;
      if (s.room && !roomShown) continue;
      let visible = true;
      for (let p = s.object; p; p = p.parent) if (!p.visible) { visible = false; break; }
      if (!visible) continue;
      const level = s.level();
      if (level <= 0.01) continue;
      s.object.updateWorldMatrix(true, false);
      if (s.offset) s.pos.copy(s.offset).applyMatrix4(s.object.matrixWorld); else s.pos.setFromMatrixPosition(s.object.matrixWorld);
      const d = s.pos.distanceTo(camPos);
      if (d > s.range * 6 + 40) continue;
      s.now = level;
      s.score = (s.power * level) / (1 + d * d * 0.02);
      live.push(s);
    }
    live.sort((a, b) => b.score - a.score);
    const want = live.slice(0, this.slots.length);
    // keep a slot on its source while that source is still wanted, so lights do not swap about
    for (const slot of this.slots) if (slot.source && !want.includes(slot.source)) slot.source = null;
    for (const s of want) {
      if (this.slots.some((slot) => slot.source === s)) continue;
      const free = this.slots.find((slot) => !slot.source);
      if (free) { free.source = s; free.light.intensity = 0; }
    }
    const k = 1 - Math.exp(-(dt || 0.016) * 9);
    for (const slot of this.slots) {
      const L = slot.light, s = slot.source;
      if (!s) { L.intensity += (0 - L.intensity) * k; continue; }
      L.position.copy(s.pos);
      L.color.setHex(s.color);
      L.distance = s.range; L.decay = s.decay;
      L.intensity += (s.power * s.now - L.intensity) * k;
    }
  }
}
