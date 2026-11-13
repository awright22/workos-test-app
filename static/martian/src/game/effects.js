// Wires game events to visual effects: dust from boots, wheels, landings and the rocket,
// boot prints and tyre tracks.
import * as THREE from 'three';
import { ctx } from './ctx.js';
import { S } from './state.js';
import { on } from '../core/events.js';
import { player } from './player.js';
import { roverF } from './rover.js';
import { World } from '../world/build.js';
import { surfaceAt } from '../planet/surface.js';
import { Y_AXIS } from '../core/scratch.js';

const _p = new THREE.Vector3(), _f = new THREE.Vector3(), _r = new THREE.Vector3(), _q = new THREE.Quaternion(), _d = new THREE.Vector3();
let trackDist = 0, plumeT = 0;

function onGround(pos) { return pos.normalize().multiplyScalar(surfaceAt(pos)); }
const _ta = new THREE.Vector3(), _tb = new THREE.Vector3(), _tn = new THREE.Vector3();

export function initEffects() {
  on('footstep', (e) => {
    if (S.inside || S.inAirlock || S.mode !== 'walk') return;
    _q.copy(player.q).multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, player.face));
    _f.set(0, 0, -1).applyQuaternion(_q);
    _r.set(1, 0, 0).applyQuaternion(_q);
    _p.copy(player.pos).addScaledVector(_r, e.foot ? 0.12 : -0.12);
    onGround(_p);
    // (a print lies on the slope it was pressed into: laid level, half of it is under the ground on a hillside)
    onGround(_ta.copy(_p).addScaledVector(_f, 0.18)); onGround(_tb.copy(_p).addScaledVector(_f, -0.18));
    _tn.subVectors(_ta, _tb).normalize();
    _tn.crossVectors(_r, _tn).normalize();
    ctx.vfx.mark('boot', _p, _f, _tn);
    ctx.vfx.puff(_p, { count: e.run ? 4 : 2, speed: e.run ? 0.9 : 0.5, up: 0.35, spread: 0.12, size: e.run ? 0.34 : 0.24, life: 1.3, dir: _d.copy(_f).multiplyScalar(-0.5) });
  });
  on('land', (e) => {
    if (S.inside || S.inAirlock) return;
    ctx.vfx.puff(player.pos, { count: Math.min(16, 5 + Math.round(e.speed * 2)), speed: 1.2 + e.speed * 0.25, up: 0.5, spread: 0.25, size: 0.5, life: 1.9 });
  });
  on('dust', (e) => { ctx.vfx.puff(e.pos, e); });
}

/** Per-frame effects that follow continuous motion (the rover's wheels, the rocket's exhaust). */
export function updateEffects(dt) {
  if (S.mode === 'rover' && World.rover) {
    const v = Math.abs(roverF.speed);
    if (v > 0.8) {
      const G = World.rover.group;
      _f.set(0, 0, -1).applyQuaternion(roverF.q);
      _r.set(1, 0, 0).applyQuaternion(roverF.q);
      // tyre tracks: a pair of marks laid end to end (each is 0.48 m long), so the ruts are unbroken
      // (at speed the rover covers several marks' length in a frame: lay each of them, back along the way it came)
      trackDist += v * dt;
      const dir = Math.sign(roverF.speed) || 1;
      let laid = 0;
      while (trackDist >= 0.44 && laid < 24) {
        trackDist -= 0.44;
        laid++;
        for (const side of [-1.22, 1.22]) {
          _p.copy(G.position).addScaledVector(_r, side).addScaledVector(_f, (-1.9 - trackDist) * dir);
          // each mark lies along the ground from its back end to its front end (right × along = the ground's normal)
          onGround(_ta.copy(_p).addScaledVector(_f, 0.24)); onGround(_tb.copy(_p).addScaledVector(_f, -0.24));
          _tn.subVectors(_ta, _tb).normalize();
          _tn.crossVectors(_r, _tn).normalize();
          ctx.vfx.mark('tyre', _p.addVectors(_ta, _tb).multiplyScalar(0.5), _f, _tn);
        }
      }
      if (laid >= 24) trackDist = 0;
      // dust plumes off the rear wheels, heavier with speed
      plumeT += dt * Math.min(40, 6 + v * 1.2);
      while (plumeT > 1) {
        plumeT -= 1;
        const side = Math.random() < 0.5 ? -1.22 : 1.22;
        _p.copy(G.position).addScaledVector(_r, side).addScaledVector(_f, -2.2 * Math.sign(roverF.speed));
        ctx.vfx.puff(onGround(_p), { count: 1, speed: 0.6 + v * 0.04, up: 0.5 + v * 0.03, spread: 0.3, size: 0.6 + v * 0.03, life: 2.2 + v * 0.03, dir: _d.copy(_f).multiplyScalar(-v * 0.18 * Math.sign(roverF.speed)) });
      }
    }
  }
}
