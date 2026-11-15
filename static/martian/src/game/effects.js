// Wires game events to visual effects: dust from boots, wheels, landings and the rocket,
// boot prints and tyre tracks.
import * as THREE from 'three';
import { ctx } from './ctx.js';
import { S } from './state.js';
import { on } from '../core/events.js';
import { Snd } from '../audio/sound.js';
import { player } from './player.js';
import { roverF } from './rover.js';
import { interaction } from './interact.js';
import { World } from '../world/build.js';
import { surfaceAt } from '../planet/surface.js';
import { Y_AXIS } from '../core/scratch.js';
import { tread, treadPath } from './wear.js';
import { showPanelDust } from './visuals.js';

const _p = new THREE.Vector3(), _f = new THREE.Vector3(), _r = new THREE.Vector3(), _q = new THREE.Quaternion(), _d = new THREE.Vector3();
let trackDist = 0, plumeT = 0, digT = 0.3, wiping = null;

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
    treadPath(_p, 14);
    // (several small wisps that are gone in under a second: two larger ones that hung for longer were soft orange discs
    // at his heels in any still picture)
    ctx.vfx.puff(_p, { count: e.run ? 5 : 3, speed: e.run ? 1.0 : 0.6, up: 0.4, spread: 0.16, size: e.run ? 0.2 : 0.14, life: 0.85, dir: _d.copy(_f).multiplyScalar(-0.5) });
  });
  on('land', (e) => {
    if (S.inside || S.inAirlock) return;
    ctx.vfx.puff(player.pos, { count: Math.min(16, 5 + Math.round(e.speed * 2)), speed: 1.2 + e.speed * 0.25, up: 0.5, spread: 0.25, size: 0.5, life: 1.9 });
  });
  on('dust', (e) => { ctx.vfx.puff(e.pos, e); });
  // the rover over a rock (a thud, a rattle of the rack) and against a boulder (a harder one, and dust off its nose)
  on('rover-jolt', (e) => { Snd.play('roverThud', { g: 0.35 + 0.5 * e.k }); if (e.k > 0.6) Snd.play('roverRattle', { g: 0.3 + 0.3 * e.k }); });
  on('rover-bump', (e) => {
    const k = Math.min(1, e.speed / 20);
    Snd.play('roverThud', { g: 0.7 + 0.8 * k }); Snd.play('roverRattle', { g: 0.5 + 0.5 * k });
    if (World.rover) ctx.vfx.puff(World.rover.group.position, { count: 6 + Math.round(8 * k), speed: 1.4 + 2 * k, up: 0.6, spread: 1.6, size: 0.7, life: 1.8 });
  });
}

/** Per-frame effects that follow continuous motion (the rover's wheels, the rocket's exhaust). */
export function updateEffects(dt) {
  // Work on his knees moves dirt: a little is thrown up at the place he works, twice a second, while he is at it out
  // of doors. (Digging was a held crouch over ground that did not stir.)
  const it = interaction.active;
  if (S.mode === 'walk' && it && it.pose !== 'stand' && S.holdT > 0.45 && !S.inside && !S.inAirlock) {
    digT += dt;
    if (digT > 0.42) {
      digT = 0;
      const at = typeof it.pos === 'function' ? it.pos() : null;
      // (between him and the thing, on the ground: the thing's own place is often its middle)
      _p.copy(player.pos);
      if (at && at.distanceTo(player.pos) > 0.2 && at.distanceTo(player.pos) < 3) _p.lerp(at, 0.55);
      ctx.vfx.puff(onGround(_p), { count: 3, speed: 0.9, up: 1.3, spread: 0.3, size: 0.34, life: 0.9 });
    }
  } else digT = 0.3;
  // A panel comes clean under his hand, over the time the wiping takes. (It stayed as dusty as it was for a second
  // and a half of wiping, and was clean between one frame and the next.)
  const pnl = World._activePanel;
  if (S.mode === 'walk' && it && it.task === 'panels' && pnl && S.holdT > 0.25) {
    showPanelDust(pnl, pnl.dust * (1 - Math.min(1, (S.holdT - 0.25) / Math.max(0.1, it.hold - 0.35))));
    wiping = pnl;
  } else if (wiping) { showPanelDust(wiping, wiping.dust); wiping = null; }
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
          tread(_p, 13);
        }
      }
      if (laid >= 24) trackDist = 0;
      // dust plumes off the rear wheels, heavier with speed
      // (and more as it gets away from rest with the throttle down: wheels that bite throw dirt)
      plumeT += dt * Math.min(40, 6 + v * 1.2) * (roverF.throttle > 0.5 && v < 9 ? 2.6 : 1);
      while (plumeT > 1) {
        plumeT -= 1;
        // (both rear wheels throw it, in a tail that hangs behind: from the driving camera one thin puff a side was
        // nothing, and a rover at speed looked parked)
        for (const side of [-1.22, 1.22]) {
          _p.copy(G.position).addScaledVector(_r, side).addScaledVector(_f, -2.2 * Math.sign(roverF.speed));
          ctx.vfx.puff(onGround(_p), { count: 1, speed: 0.7 + v * 0.05, up: 0.6 + v * 0.05, spread: 0.35, size: 0.9 + v * 0.07, life: 2.8 + v * 0.06, dir: _d.copy(_f).multiplyScalar(-v * 0.22 * Math.sign(roverF.speed)) });
        }
      }
    }
  }
}
