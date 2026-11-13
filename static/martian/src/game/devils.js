/*
 * Dust devils. On a warm afternoon the ground heats the thin air and columns of dust go
 * wandering over the plains. They are harmless (the air is a hundredth of Earth's) and now
 * and then one walks over the solar array and sweeps it clean, as they did for Spirit.
 */
import * as THREE from 'three';
import { S } from './state.js';
import { ctx } from './ctx.js';
import { World } from '../world/build.js';
import { player } from './player.js';
import { surfaceAt } from '../planet/surface.js';
import { frameQuat, groundDist, tangentBasis } from '../planet/geo.js';
import { R } from '../planet/constants.js';
import { DustDevil } from '../render/devil.js';
import { localSunEl, stormIntensityAt } from './sim.js';
import { syncAllVisuals } from './visuals.js';
import { log } from '../ui/dom.js';
import { emit } from '../core/events.js';
import { clamp } from '../core/math.js';

const MAX = 2;
export const devils = [];                 // { u, dir, speed, age, life, height, radius, view, swept, met }
const pool = [];
const _e = new THREE.Vector3(), _n = new THREE.Vector3(), _p = new THREE.Vector3(), _t = new THREE.Vector3();
let wait = 20;

/** Start one at a world position (unit direction), walking on a bearing (radians east of north). */
export function spawnDevil(u, bearing, o = {}) {
  if (devils.length >= MAX) return null;
  tangentBasis(u, _e, _n);
  const view = pool.pop() || new DustDevil(ctx.outdoor);
  const d = {
    u: u.clone().normalize(), dir: _n.clone().multiplyScalar(Math.cos(bearing)).addScaledVector(_e, Math.sin(bearing)).normalize(),
    speed: o.speed || 3.5 + Math.random() * 3.5, age: 0, life: o.life || 55 + Math.random() * 60,
    height: o.height || 16 + Math.random() * 24, radius: o.radius || 2.6 + Math.random() * 2.6, view, swept: false, met: false,
  };
  view.uniforms.uSeed.value = Math.random() * 10;
  view.uniforms.uLean.value.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25);
  devils.push(d);
  return d;
}
function retire(i) {
  const d = devils[i];
  d.view.mesh.visible = false;
  pool.push(d.view);
  devils.splice(i, 1);
}
export function clearDevils() { while (devils.length) retire(0); }

function maybeSpawn(dt) {
  wait -= dt;
  if (wait > 0 || devils.length >= MAX) return;
  wait = 35 + Math.random() * 60;
  // they need a warm afternoon, clear air and a camera near the ground
  if (localSunEl() < 0.32 || S.storm.i > 0.12 || S.inside || ctx.engine.camera.position.length() - R > 900) return;
  const here = _p.copy(player.pos).normalize();
  tangentBasis(here, _e, _n);
  const array = World.solarGroup, nearHome = World.hab && groundDist(player.pos, World.hab.position) < 700;
  if (nearHome && array && Math.random() < 0.4 && stormIntensityAt(World.hab.position) < 0.1) {
    // start up-wind of the solar array and walk straight over it
    const b = Math.random() * Math.PI * 2, from = 190 + Math.random() * 160;
    const a = _t.copy(array.position).normalize();
    tangentBasis(a, _e, _n);
    const start = a.clone().addScaledVector(_n, -Math.cos(b) * from / R).addScaledVector(_e, -Math.sin(b) * from / R).normalize();
    spawnDevil(start, b, { life: (from + 150) / 5, speed: 5 });
    return;
  }
  // otherwise: somewhere out on the plain, crossing the view rather than charging the astronaut
  const b = Math.random() * Math.PI * 2, from = 140 + Math.random() * 260;
  const start = here.clone().addScaledVector(_n, Math.cos(b) * from / R).addScaledVector(_e, Math.sin(b) * from / R).normalize();
  spawnDevil(start, b + Math.PI / 2 + (Math.random() - 0.5) * 1.2);
}

export function updateDevils(dt) {
  if (!S.started || S.over || S.mode === 'cutscene') { if (devils.length) clearDevils(); return; }
  maybeSpawn(dt);
  const e = ctx.engine, fog = e.scene.fog, sky = e.sky;
  // (dust is lit by what lights the ground: with a floor of 0.3 a devil caught by nightfall stood as a pale column
  // against black ground. And a devil is the day's heat: with the sun down it dies away.)
  const lit = Math.min(1.5, 0.05 + sky.sunIntensity * 0.3), sunUp = clamp(localSunEl() / 0.14, 0, 1);
  for (let i = devils.length - 1; i >= 0; i--) {
    const d = devils[i];
    d.age += dt;
    // walk, wandering a little; keep the heading on the ground plane
    d.u.addScaledVector(d.dir, d.speed * dt / R).normalize();
    d.dir.addScaledVector(d.u, -d.dir.dot(d.u));
    _t.crossVectors(d.u, d.dir);
    d.dir.addScaledVector(_t, Math.sin(d.age * 0.23 + d.radius) * 0.12 * dt).normalize();
    const fade = clamp(Math.min(d.age / 6, (d.life - d.age) / 8), 0, 1) * clamp(1 - S.storm.i * 4, 0, 1) * sunUp;
    if (d.age >= d.life || fade <= 0 && d.age > 6) { retire(i); continue; }
    const base = _p.copy(d.u).multiplyScalar(surfaceAt(d.u) - 0.3);
    const m = d.view.mesh, U = d.view.uniforms;
    m.position.copy(base);
    frameQuat(d.u, 0, m.quaternion);
    m.visible = true;
    U.uTime.value += dt;
    U.uHeight.value = d.height; U.uRadius.value = d.radius; U.uOpacity.value = 0.85 * fade;
    // dust seen against a bright sky: the colour of the ground, a little in its own shade
    U.uColor.value.setRGB(0.44 * lit + sky.ambientSky.r * 0.3, 0.29 * lit + sky.ambientSky.g * 0.3, 0.19 * lit + sky.ambientSky.b * 0.3);
    U.uFogColor.value.copy(fog.color); U.uFogDensity.value = fog.density;
    // dust kicked up where it touches the ground
    if (ctx.vfx && Math.random() < dt * 14 && base.distanceTo(e.camera.position) < 260) {
      ctx.vfx.puff(_t.copy(d.u).multiplyScalar(surfaceAt(d.u) + 0.2), { count: 2, speed: 2.2, up: 1.6, spread: d.radius * 0.6, size: 1.4, life: 2.2 });
    }
    // a sweep over the solar array cleans it
    if (!d.swept && World.solarGroup && groundDist(base, World.solarGroup.position) < 16 + d.radius) {
      d.swept = true;
      let cleaned = 0;
      for (const p of World.panels) { if (p.dust > 0.12) cleaned++; p.dust = Math.min(p.dust, 0.06 + Math.random() * 0.05); }
      syncAllVisuals();
      emit('devil-sweep', { cleaned });
      if (cleaned > 0) log('A dust devil just walked across the solar array and swept every panel clean. Mars did me a favour. I am suspicious.', 'sys');
    }
    // meeting one: a buffet of grit, no harm done
    if (!d.met && S.mode === 'walk' && !S.inside && groundDist(base, player.pos) < d.radius + 1.2) {
      d.met = true;
      S.shake = Math.max(S.shake, 0.35);
      emit('devil-hit', {});
      if (!S.flags.devilMet) {
        S.flags.devilMet = true;
        log('Walked through a dust devil. A tornado, if tornadoes were made of talcum powder: the air here is one percent of Earth\'s. It mostly just wanted to ruin my visor.');
      }
    } else if (!S.flags.devilSeen && fade > 0.9 && groundDist(base, player.pos) < 320 && S.mode !== 'cutscene' && !S.inside) {
      S.flags.devilSeen = true;
      log('Dust devil on the plain. They wander about on warm afternoons. Harmless, and Spirit\'s solar panels owed their life to them.', 'sys');
    }
  }
}
