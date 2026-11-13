// The launch: the last act of the story. Ignition and lift-off seen from the ground, the climb out of the dust into
// a black sky, and the rescue as the book has it: the ascent vehicle falls short, the Hermes blows her forward
// airlock to brake, and Beck crosses on a tether to fetch him. Nobody flies anything: he is cargo.
//
// It is six shots, cut like film, and three effects that exist only here:
//   the flame   three nested cones of light (a white core, the flame, a wide faint plume that spreads as the air thins)
//   the smoke   lit puffs: a skirt of dust rolling out along the ground, and the column the engine leaves up the sky
//   the glow    the engine's light on the pad and on the smoke round it
import * as THREE from 'three';
import { S } from './state.js';
import { Snd } from '../audio/sound.js';
import { tangentBasis } from '../planet/geo.js';
import { World, groundGlow } from '../world/build.js';
import { log, setPrompt } from '../ui/dom.js';
import { camLookAt } from './player.js';
import { R } from '../planet/constants.js';
import { closeScreens } from '../ui/screens.js';
import { surfaceAt } from '../planet/surface.js';
import { model } from '../world/models.js';
import { ctx } from './ctx.js';
import { clamp, lerp, smoothstep } from '../core/math.js';
import { winGame } from './story.js';
import { SUN_DECLINATION, updateSunDir } from './sim.js';

const LIFT = 5.2;            // seconds from "punch it" to lift-off
const IGNITE = 4.3;          // the engine lights just before
const CUT_WIDE = 1.7;        // seconds after lift-off: cut from the pad to the far camera
const CUT_CHASE = 5.6;       // ... to the camera that climbs beside the rocket
const CUT_LEAVE = 13.0;      // ... the rocket pulls away from it
const CUT_ORBIT = 16.4;      // ... the Hermes
const WIN = 25.5;            // the rescue is called
const CLOSE_AT = 5.0;        // seconds into the last scene: cut from the whole ship to the vehicle's nose
const ORBIT_R = R * 1.45;    // where the Hermes waits, from the planet's centre
const climb = (lt) => 14 * lt * lt;        // height of the ascent stage above the pad (m), lt seconds after lift-off

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---- the smoke ---------------------------------------------------------------------------------------------------
const SMOKE_N = 1000;

function softDisc(size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.14, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.11)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

/** A lumpy cloud: a soft core and a ring of smaller lobes, so that puffs that overlap make billows and not discs. */
function smokeTexture() {
  const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d');
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const blob = (x, y, rad, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(0.55, `rgba(255,255,255,${a * 0.5})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  };
  blob(N / 2, N / 2, N * 0.42, 0.85);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + r(), d = N * (0.13 + r() * 0.11);
    blob(N / 2 + Math.cos(a) * d, N / 2 + Math.sin(a) * d, N * (0.12 + r() * 0.10), 0.45 + r() * 0.3);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

class Smoke {
  constructor(scene) {
    const n = SMOKE_N, g = new THREE.BufferGeometry();
    this.start = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.vel = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.info = new THREE.BufferAttribute(new Float32Array(n * 4), 4);       // born, life, size at birth, tone (0 dust .. 1 white smoke)
    this.grow = new THREE.BufferAttribute(new Float32Array(n * 3), 3);       // metres it swells by, drag, turn
    for (const a of [this.start, this.vel, this.info, this.grow]) a.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < n; i++) { this.info.setXYZW(i, -1000, 1, 0, 0); this.grow.setXYZ(i, 0, 1, 0); }
    g.setAttribute('position', this.start); g.setAttribute('aVel', this.vel); g.setAttribute('aInfo', this.info); g.setAttribute('aGrow', this.grow);
    this.i = 0; this.time = 0;
    this.u = {
      uTime: { value: 0 }, uPx: { value: 600 }, uMaxPx: { value: 256 }, uMap: { value: smokeTexture() },
      uUp: { value: new THREE.Vector3(0, 1, 0) }, uWind: { value: new THREE.Vector3() },
      uSunV: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color(1, 0.9, 0.8) }, uAmb: { value: new THREE.Color(0.2, 0.15, 0.1) },
      uGlowPos: { value: new THREE.Vector3() }, uGlowCol: { value: new THREE.Color(1.8, 0.8, 0.25) }, uGlow: { value: 0 },
      fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 }, fogNear: { value: 1 }, fogFar: { value: 2000 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false, fog: true,
      vertexShader: /* glsl */`
        #include <fog_pars_vertex>
        attribute vec3 aVel, aGrow; attribute vec4 aInfo;
        uniform float uTime, uPx, uMaxPx, uGlow; uniform vec3 uUp, uWind, uGlowPos;
        varying float vA, vTone, vTurn, vGlow;
        void main() {
          float age = uTime - aInfo.x;
          float k = clamp(age / aInfo.y, 0.0, 1.0);
          // thrown out fast, then hanging: there is almost no air to carry it and none to clear it
          float travel = (1.0 - exp(-age * aGrow.y)) / aGrow.y;
          float span = aInfo.z + aGrow.x * (1.0 - exp(-age * 0.5));
          vec3 p = position + aVel * travel;
          // what wind there is leans the column, more with height
          p += uWind * (age * (1.0 + max(dot(position, uUp), 0.0) / 260.0));
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float px = span * uPx / max(-mvPosition.z, 0.5);
          gl_PointSize = clamp(px, 1.0, uMaxPx);
          // (a puff that would be drawn larger than a point may be is thinned instead, and one the camera stands in is not a wall)
          float room = smoothstep(span * 0.2, span * 1.1, -mvPosition.z) * min(1.0, uMaxPx / px);
          // (seen at once: the rocket is a hundred metres on before a slow puff would have shown)
          vA = (age < 0.0 || k >= 1.0) ? 0.0 : pow(1.0 - k, 1.4) * smoothstep(0.0, 0.12, age) * room * 0.78;
          vTone = aInfo.w;
          vTurn = aGrow.z * 6.2832 + age * 0.25 * (fract(aGrow.z * 7.0) - 0.5);
          vec3 gd = p - uGlowPos;
          vGlow = uGlow / (1.0 + dot(gd, gd) / 70.0);
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */`
        #include <fog_pars_fragment>
        uniform sampler2D uMap; uniform vec3 uSunV, uSunCol, uAmb, uGlowCol;
        varying float vA, vTone, vTurn, vGlow;
        void main() {
          vec2 c = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(c, c);
          float cs = cos(vTurn), sn = sin(vTurn);
          vec2 q = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs) * 0.5 + 0.5;
          float a = texture2D(uMap, q).a * vA * smoothstep(1.0, 0.2, r2);
          if (a < 0.004) discard;
          // each puff is lit as a ball of smoke: bright toward the sun, and light gets some way through it
          // (only gently a ball: a column of plainly round puffs is a string of cotton wool)
          vec3 n = normalize(vec3(c.x, -c.y, sqrt(max(1.0 - r2, 0.0)) + 0.6));
          float lit = smoothstep(-0.45, 0.9, dot(n, uSunV));
          vec3 base = mix(vec3(0.44, 0.22, 0.115), vec3(0.95, 0.91, 0.86), vTone);
          vec3 col = base * (uAmb + uSunCol * lit) + uGlowCol * (vGlow * (0.35 + 0.65 * lit));
          gl_FragColor = vec4(col, a);
          #include <fog_fragment>
        }`,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 22;
    scene.add(this.points);
  }

  /** One puff. `at` and `vel` are in the world's frame; everything is stored about the pad so that it stays exact. */
  emit(at, vel, size, grow, life, tone, drag) {
    const k = this.i; this.i = (this.i + 1) % SMOKE_N;
    const o = this.points.position;
    this.start.setXYZ(k, at.x - o.x, at.y - o.y, at.z - o.z);
    this.vel.setXYZ(k, vel.x, vel.y, vel.z);
    this.info.setXYZW(k, this.time, life, size, tone);
    this.grow.setXYZ(k, grow, drag, rnd());
    this.dirty = true;
  }

  update(dt, camera, pixelHeight) {
    this.time += dt;
    this.u.uTime.value = this.time;
    this.u.uPx.value = pixelHeight / (2 * Math.tan((camera.fov * Math.PI) / 360));
    this.u.uMaxPx.value = Math.min(420, pixelHeight * 0.6);
    if (this.dirty) { this.dirty = false; this.start.needsUpdate = this.vel.needsUpdate = this.info.needsUpdate = this.grow.needsUpdate = true; }
  }
}

// ---- the flame ---------------------------------------------------------------------------------------------------
const flameTime = { value: 0 };
function plume(rTop, rBottom, length, color, hot, gain, edge) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, length, 20, 10, true);
  g.translate(0, -length / 2, 0);                      // the nozzle at the origin, the tail below
  const u = { uTime: flameTime, uColor: { value: new THREE.Color(...color) }, uHot: { value: new THREE.Color(...hot) }, uGain: { value: gain }, uEdge: { value: edge } };
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN, vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalMatrix * normal; vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uGain, uEdge; uniform vec3 uColor, uHot;
      varying vec2 vUv; varying vec3 vN, vV;
      // (no sine in it: a hash through sin() comes out in bands on some phone GPUs)
        float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      // (noise that closes on itself round the plume: no seam down one side)
      float vn(vec2 p, float wrap) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        float x0 = mod(i.x, wrap), x1 = mod(i.x + 1.0, wrap);
        return mix(mix(hash(vec2(x0, i.y)), hash(vec2(x1, i.y)), f.x), mix(hash(vec2(x0, i.y + 1.0)), hash(vec2(x1, i.y + 1.0)), f.x), f.y);
      }
      void main() {
        // a shell drawn as if it were a volume: brightest where the eye looks through most of it
        float f = abs(dot(normalize(vN), normalize(vV)));
        float along = vUv.y;                             // 1 at the nozzle, 0 at the tail
        float n = vn(vec2(vUv.x * 12.0, along * 4.0 + uTime * 19.0), 12.0) * 0.6 + vn(vec2(vUv.x * 28.0, along * 9.0 + uTime * 33.0), 28.0) * 0.4;
        float body = pow(f, uEdge) * pow(along, 1.4) * smoothstep(0.0, 0.45, along) * (0.62 + 0.76 * n);
        gl_FragColor = vec4(mix(uColor, uHot, pow(f, 3.0) * along) * (body * uGain), 1.0);
      }`,
  }));
  m.frustumCulled = false;
  m.renderOrder = 23;
  return m;
}

function buildFlame() {
  const g = new THREE.Group();
  const wide = plume(0.95, 3.6, 17, [1.0, 0.36, 0.10], [1.0, 0.55, 0.22], 1.5, 2.6);
  const flame = plume(0.85, 0.30, 10, [1.0, 0.42, 0.10], [1.0, 0.86, 0.62], 7.5, 1.6);
  const core = plume(0.46, 0.06, 5.5, [1.0, 0.80, 0.50], [1.0, 0.97, 0.92], 16, 2.2);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDisc(), color: new THREE.Color(5, 2.4, 0.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glow.position.y = -0.8; glow.renderOrder = 23;
  g.add(wide, flame, core, glow);
  g.userData = { wide, flame, core, glow };
  g.visible = false;
  return g;
}

// ---- the sequence ------------------------------------------------------------------------------------------------
let fx = null;
function effects() {
  if (fx) return fx;
  const flame = buildFlame();
  (World.mavFlameAt || World.mavRocket).add(flame);
  fx = { smoke: new Smoke(ctx.engine.scene), flame, level: 0, glow: 0 };
  groundGlow(World.mav, 15, new THREE.Color(1.0, 0.50, 0.18), 1.0, 'pool', () => fx.glow, 0.07);
  return fx;
}

export let hermes = null;

/** The sun's place in its daily round (S.tod) that puts it `sinEl` high over the place `up`, later the same sol. */
function todForSunHeight(up, sinEl) {
  const c = Math.cos(SUN_DECLINATION), A = Math.hypot(up.x, up.z), phi = Math.atan2(up.z, up.x);
  const need = clamp((sinEl - up.y * Math.sin(SUN_DECLINATION)) / Math.max(c * A, 1e-6), -1, 1);
  return ((phi - Math.acos(need)) / (Math.PI * 2) % 1 + 1) % 1;
}

export function startLaunch() {
  S.mode = 'cutscene';
  S.uiOpen = false;
  setPrompt(null);
  closeScreens();
  const e = ctx.engine, cam = e.camera;
  const up = World.mav.position.clone().normalize(), east = new THREE.Vector3(), north = new THREE.Vector3();
  tangentBasis(up, east, north);
  const pad = World.mav.position.clone();
  // The cameras stand on the sun's side of the rocket, so that it and its smoke are lit and not a silhouette.
  // (With no sun to speak of, or one straight overhead, any side will do.)
  const sunFlat = e.sunDir.clone().addScaledVector(up, -e.sunDir.dot(up));
  if (sunFlat.lengthSq() < 0.02) sunFlat.copy(east);
  sunFlat.normalize();
  const side = new THREE.Vector3().crossVectors(up, sunFlat);
  const around = (deg) => new THREE.Vector3().copy(sunFlat).multiplyScalar(Math.cos(deg * Math.PI / 180)).addScaledVector(side, Math.sin(deg * Math.PI / 180));
  const onGround = (dir, dist, h) => { const p = pad.clone().addScaledVector(dir, dist); return p.normalize().multiplyScalar(surfaceAt(p) + h); };
  // (a camera on the ground needs a clear line to the pad: where a dune stands in the way it is raised until it sees over)
  const clear = (c) => {
    for (let n = 0; n < 10; n++) {
      let hidden = false;
      for (let i = 1; i < 14 && !hidden; i++) { _a.copy(pad).addScaledVector(up, 1.5).lerp(c, i / 14); hidden = surfaceAt(_a) + 0.6 > _a.length(); }
      if (!hidden) break;
      c.addScaledVector(up, 2.5);
    }
    return c;
  };
  const FAR = 150;
  const nearDir = around(38), farDir = around(-52);
  const camNear = clear(onGround(nearDir, 46, 2.0)), camFar = clear(onGround(farDir, FAR, 3.2));

  log('Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever.');
  if (S.pf.connected) {
    S.disco = true; Snd.disco(true);
    setTimeout(() => log('The playlist synced to the MAV. I\'m launching to disco. This is my life now.', 'nasa'), 3500);
  }
  [3, 2, 1].forEach((n, i) => setTimeout(() => { Snd.play('countdown'); log(`${n}...`, 'nasa'); }, 2000 + i * 1000));

  if (!hermes) {
    const h = model('hermes');
    hermes = h.root; World.hermesRing = h.part('ring');
    ctx.world.add(hermes);
  }
  hermes.visible = false;
  if (!World.launchCrew) {
    // two more astronauts for the last scene: suited, helmets on, in the pose of a man with nothing under his feet
    const figure = () => {
      const a = model('astronaut');
      a.root.traverse((o) => { const n = o.material && !Array.isArray(o.material) ? o.material.name : ''; if (o.name === 'head' || /^head_/.test(n)) o.visible = false; });
      const mixer = new THREE.AnimationMixer(a.inner), clip = a.clips.find((c) => c.name === 'Air');
      if (clip) mixer.clipAction(clip).play();
      // (he is placed by his middle, not his boots: the model stands on its origin, so it hangs in a holder a little
      // above it. Moving the model itself did nothing: the clip writes its place every frame.)
      const holder = new THREE.Group();
      a.root.position.y = -0.95;
      holder.add(a.root);
      holder.visible = false;
      ctx.world.add(holder);
      return { root: holder, mixer };
    };
    World.launchCrew = { beck: figure(), mark: figure() };
  }
  World.launchCrew.beck.root.visible = World.launchCrew.mark.root.visible = false;
  const F = effects(), smoke = F.smoke, parts = F.flame.userData;
  smoke.points.position.copy(pad);
  smoke.u.uUp.value.copy(up);
  smoke.u.uWind.value.copy(around(115)).multiplyScalar(1.1);
  // (drawn from the first frame, with nothing in them, so that their shaders are built during the countdown and not at ignition)
  F.flame.visible = true; F.flame.scale.setScalar(0.001);
  World.launch = { burning: false, alt: 0, focus: World.mav.position };

  const rocket = World.mavRocket, restY = World.mavRocketY;
  const nozzle = new THREE.Vector3(), lastNozzle = new THREE.Vector3();
  let t = 0, shot = '', skirtDue = 0, trailAt = 0, orbit = null;
  const setShot = (name, fov) => { shot = name; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } };
  // (the canvas is already at the render scale. The 0.8 is the size the smoke was drawn and judged at: the same on every preset.)
  const pixelHeight = () => e.renderer.domElement.height * 0.8;

  World.launchAnim = (dt) => {
    t += dt;
    const lt = t - LIFT, alt = lt > 0 ? climb(lt) : 0;
    const burn = smoothstep(IGNITE, IGNITE + 0.45, t);
    World.launch.burning = burn > 0;
    // (what the sound hears as height: the roar has thinned to nothing by the time the Hermes is on screen)
    World.launch.alt = alt * 3.6;
    flameTime.value = t;

    // ---- the rocket and its flame
    if (!orbit) {
      rocket.position.y = restY + alt;
      const thin = smoothstep(150, 2600, alt);                       // the air gives out: the plume spreads and pales
      const flick = 0.9 + Math.random() * 0.2;
      F.flame.scale.setScalar(Math.max(0.001, burn));
      parts.flame.scale.set(1 + thin * 0.5, flick * (1 + thin * 0.6), 1 + thin * 0.5);
      parts.core.scale.set(1, 0.9 + Math.random() * 0.25, 1);
      parts.wide.scale.set(1 + thin * 3.2, (0.95 + Math.random() * 0.1) * (1 + thin * 1.4), 1 + thin * 3.2);
      parts.wide.material.uniforms.uGain.value = 1.5 * (1 - 0.55 * thin);
      parts.glow.scale.setScalar((3.6 + thin * 2.4) * (0.92 + Math.random() * 0.16));
      F.flame.getWorldPosition(nozzle);
      F.glow = burn * (1 - smoothstep(4, 70, alt)) * (0.85 + Math.random() * 0.15);
      smoke.u.uGlowPos.value.copy(nozzle).addScaledVector(up, -3).sub(pad);
      smoke.u.uGlow.value = burn * (0.75 + Math.random() * 0.25);

      // the skirt: the pad's dust driven out along the ground in every direction
      const blast = burn * (1 - smoothstep(35, 150, alt));
      skirtDue += dt * 105 * blast;
      while (skirtDue >= 1) {
        skirtDue -= 1;
        const a = rnd() * Math.PI * 2, far = 1.5 + rnd() * 2.5;
        _a.copy(east).multiplyScalar(Math.cos(a)).addScaledVector(north, Math.sin(a));
        _b.copy(pad).addScaledVector(_a, far).addScaledVector(up, 0.5 + rnd() * 0.6);
        _c.copy(_a).multiplyScalar(22 + rnd() * 22).addScaledVector(up, 0.4 + rnd() * 3.6);
        smoke.emit(_b, _c, 2.0 + rnd() * 1.5, 8 + rnd() * 9, 6 + rnd() * 4.5, rnd() * 0.16, 0.48 + rnd() * 0.2);
      }
      // the column: one puff for every few metres climbed, however long the frame was, so that it has no gaps
      if (lt > 0 && alt < 1750) {
        const size = 5 + Math.min(22, alt * 0.02), step = Math.max(1.2, size * 0.2), fade = 1 - smoothstep(1100, 1750, alt);
        while (trailAt + step <= alt) {
          trailAt += step;
          const a = rnd() * Math.PI * 2, low = smoothstep(4, 45, trailAt);
          _a.copy(east).multiplyScalar(Math.cos(a)).addScaledVector(north, Math.sin(a));
          _b.copy(nozzle).addScaledVector(up, trailAt - alt - 3).addScaledVector(_a, rnd() * size * 0.28);
          _c.copy(up).multiplyScalar(-(7 + rnd() * 9)).addScaledVector(_a, 0.8 + rnd() * 2.4 + trailAt * 0.004);
          smoke.emit(_b, _c, size * (0.7 + rnd() * 0.6), (16 + Math.min(60, trailAt * 0.06)) * (0.7 + rnd() * 0.6), (17 + rnd() * 8) * (0.35 + 0.65 * fade),
            lerp(0.4, 0.62 + rnd() * 0.38, low), 0.8);
        }
      }
      lastNozzle.copy(nozzle);
    }

    // ---- the camera
    const rocketAt = _d.copy(pad).addScaledVector(up, alt + 9);
    S.shake = 0;
    if (lt < CUT_WIDE) {
      // 1. Close and low, the whole rocket on its pad. It lights, the dust rolls out toward the lens, it rises.
      setShot('pad', 46);
      S.shake = burn * 0.5;
      cam.position.copy(camNear).addScaledVector(nearDir, -t * 0.35);
      camLookAt(_a.copy(pad).addScaledVector(up, 7.5 + alt * 0.2), up);
    } else if (lt < CUT_CHASE) {
      // 2. From far off: the pad, the skirt of dust spreading, the column standing on it, the rocket at its head.
      //    The pad is held in the frame for as long as the rocket can share it.
      setShot('wide', 50);
      S.shake = 0.1;
      cam.position.copy(camFar);
      const tilt = Math.max(16 * Math.PI / 180, Math.atan2(alt + 9, FAR) - 20 * Math.PI / 180);
      camLookAt(_a.copy(pad).addScaledVector(up, FAR * Math.tan(tilt)), up);
    } else if (lt < CUT_ORBIT) {
      // 3. Beside it and a little above, climbing with it: the ground falls away, the horizon bends, the sky goes black.
      // 4. Then it pulls away, up into the stars.
      setShot('chase', 50);
      const lag = Math.max(0, lt - CUT_LEAVE), camAlt = alt - 60 * lag * lag;
      const dist = 38 + Math.min(alt, 2400) * 0.014;
      S.shake = clamp(0.5 - (lt - CUT_CHASE) * 0.07, 0, 0.5);
      cam.position.copy(pad).addScaledVector(nearDir, dist).addScaledVector(side, -dist * 0.35).addScaledVector(up, camAlt + 31 + Math.min(alt, 2400) * 0.008);
      camLookAt(rocketAt.addScaledVector(up, -6 - Math.min(lag * 3, 4)), up);
    } else {
      // 5. The Hermes, over the line between day and night. The ascent vehicle has fallen short of her and hangs
      //    off her bow. Her forward airlock blows, to brake her; a man comes out of it on a tether.
      // 6. Close on the vehicle's open nose as he reaches it.
      if (!orbit) orbit = enterOrbit(up, F);
      const ot = lt - CUT_ORBIT, O = orbit;
      hermes.visible = true;
      if (World.hermesRing) World.hermesRing.rotation.z = ot * 0.22;
      // the ascent stage, spent, turning slowly end over end a little
      const mavAt = O.mavAt.copy(O.dock).addScaledVector(O.f, 46 - Math.min(ot, 14) * 0.5).addScaledVector(O.x, -10).addScaledVector(up, -3);
      _q.setFromAxisAngle(O.x, 0.22 * Math.sin(ot * 0.21) - 0.1).multiply(O.rocketWorldQ);
      const noseDir = O.noseDir.set(0, 1, 0).applyQuaternion(_q);
      rocket.position.copy(rocket.parent.worldToLocal(_a.copy(mavAt)));
      rocket.quaternion.copy(O.parentInvQ).multiply(_q);
      F.flame.scale.setScalar(0.001);
      World.launch.burning = false;
      const nose = O.nose.copy(mavAt).addScaledVector(noseDir, O.stageLength);
      // (what is said over the radio, once each)
      if (ot > 0.5 && !O.said) { O.said = 1; log('HERMES: He is short of us, and fast. Blowing the forward airlock to brake. Beck, you are on the tether.', 'nasa'); }
      if (ot > 7.6 && O.said < 2) { O.said = 2; log('BECK: I have him.', 'nasa'); }
      // the airlock blows: a jet of the ship's own air out of her bow, gone in two seconds
      if (ot > 0.7 && ot < 1.7) {
        // (a dense cone of vapour, thick at the hatch and thinning as it spreads: seventy small puffs were a string of beads)
        O.blastDue += dt * 240 * (1 - smoothstep(1.2, 1.7, ot));
        while (O.blastDue >= 1) {
          O.blastDue -= 1;
          const a1 = rnd() * Math.PI * 2, wide = Math.sqrt(rnd()) * 11;
          _b.copy(O.f).multiplyScalar(10 + rnd() * 30).addScaledVector(O.x, Math.cos(a1) * wide).addScaledVector(up, Math.sin(a1) * wide);
          smoke.emit(_a.copy(O.dock).addScaledVector(O.f, 0.8 + rnd() * 1.5), _b, 1.5 + rnd() * 1.2, 9 + rnd() * 7, 1.5 + rnd() * 1.3, 0.94, 0.5);
        }
      }
      // Beck: out of the airlock at two seconds, across the gap, hand on the nose at seven and a half; then back, with him
      const out = smoothstep(1.9, 7.5, ot), back = smoothstep(8.3, 19, ot);
      const from = O.from.copy(O.dock).addScaledVector(O.f, 1.6), to = O.to.copy(nose).addScaledVector(noseDir, 1.5);
      const beckAt = O.beckAt.copy(from).lerp(to, out).lerp(from, back);
      const crew = World.launchCrew;
      crew.beck.root.visible = ot > 1.9;
      crew.beck.root.position.copy(beckAt);
      // (he flies head first toward where he is going, belly to the planet)
      const ahead = O.ahead.copy(back > 0 ? from : to).sub(back > 0 ? to : from).normalize();
      crew.beck.root.quaternion.setFromRotationMatrix(_m.makeBasis(_d.crossVectors(up, ahead).normalize(), ahead, _a.crossVectors(_d, ahead)));
      crew.beck.mixer.setTime(0.4 + 0.25 * Math.sin(ot * 0.9));
      // ... and Watney, in the open nose until he is fetched, then a little behind Beck on the way home
      const carried = smoothstep(8.0, 9.2, ot), markUp = carried > 0.5 ? ahead : noseDir;
      crew.mark.root.visible = true;
      crew.mark.root.position.copy(nose).addScaledVector(noseDir, 0.15).lerp(_b.copy(beckAt).addScaledVector(ahead, -2.0), carried);
      crew.mark.root.quaternion.setFromRotationMatrix(_m.makeBasis(_d.crossVectors(up, markUp).normalize(), markUp, _a.crossVectors(_d, markUp)));
      crew.mark.mixer.setTime(0.2 + 0.2 * Math.sin(ot * 0.7 + 1));
      // the tether, slack as it pays out and drawn straight as he nears the end of it
      {
        const pts = O.tether.geometry.attributes.position, n = pts.count, slack = 2.6 * (1 - 0.85 * Math.max(out - back, 0));
        for (let i = 0; i < n; i++) {
          const k = i / (n - 1), sag = Math.sin(k * Math.PI) * slack;
          _a.copy(O.dock).lerp(beckAt, k).addScaledVector(up, -sag).addScaledVector(O.x, Math.sin(k * 7 + ot * 0.8) * 0.25 * slack);
          pts.setXYZ(i, _a.x - O.centre.x, _a.y - O.centre.y, _a.z - O.centre.z);
        }
        pts.needsUpdate = true;
        O.tether.visible = ot > 1.9;
      }
      if (ot < CLOSE_AT) {
        setShot('orbit', 30);
        // the camera drifts round her, slowly
        const swing = O.swing + ot * 0.012;
        _a.copy(O.h).multiplyScalar(Math.cos(swing)).addScaledVector(O.s, Math.sin(swing));
        cam.position.copy(O.centre).addScaledVector(_a, Math.cos(O.pitch) * O.dist).addScaledVector(up, Math.sin(O.pitch) * O.dist);
        _b.copy(up).applyAxisAngle(_c.copy(cam.position).sub(O.centre).normalize(), O.roll);
        camLookAt(_c.copy(O.centre).addScaledVector(O.f, 27), _b);
      } else {
        // from above and a little beyond the vehicle, looking back down the tether: the two of them over the planet
        setShot('reach', 40);
        const ct = ot - CLOSE_AT;
        cam.position.copy(nose).addScaledVector(up, 11.5 - ct * 0.1).addScaledVector(O.x, -4 + ct * 0.15).addScaledVector(O.f, 3 - ct * 0.15);
        camLookAt(_c.copy(nose).addScaledVector(O.f, -2.8), _b.copy(O.f).negate());
      }
    }
    if (S.shake > 0) cam.position.addScaledVector(_a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.35);
    // a short dip to black over the one cut that crosses half a planet
    e.final.uniforms.uFade.value = 1 - smoothstep(0.0, 0.7, Math.abs(lt - CUT_ORBIT));
    Snd.rumble(clamp(burn * 0.85 * (1 - smoothstep(CUT_LEAVE, CUT_ORBIT, lt)), 0, 0.85));

    // the smoke is lit by this frame's sun, as this camera sees it
    cam.updateMatrixWorld();
    smoke.u.uSunV.value.copy(e.sunDir).transformDirection(cam.matrixWorldInverse);
    const sunI = e.sky.sunIntensity || 0;
    smoke.u.uSunCol.value.copy(e.sky.sunColor).multiplyScalar(Math.min(1.5, sunI * 0.34));
    smoke.u.uAmb.value.copy(e.sky.ambientSky).multiplyScalar(0.5).addScalar(0.015);
    smoke.update(dt, cam, pixelHeight());
    if (lt > WIN && !S.won) winGame();
  };
}

/** Set the last scene: the hour, the Hermes, and where the camera and the ascent stage are about her. */
function enterOrbit(up, F) {
  const e = ctx.engine;
  // Hours later, where the sun stands low over the place: the line between day and night crosses the ground behind her.
  S.tod = todForSunHeight(up, 0.38);
  updateSunDir();
  const s = e.sunDir.clone().addScaledVector(up, -e.sunDir.dot(up)).normalize();       // toward the sun, level
  const h = new THREE.Vector3().crossVectors(up, s);                                    // level, square to the sun
  // She flies square to the sun and a little away from it, so one flank is lit along its whole length; the camera
  // stands off her bow on that side and above, and sees her three-quarters on.
  const deg = Math.PI / 180, f = h.clone().multiplyScalar(Math.cos(-25 * deg)).addScaledVector(s, Math.sin(-25 * deg)).normalize();
  const x = new THREE.Vector3().crossVectors(up, f);
  const centre = up.clone().multiplyScalar(ORBIT_R);
  hermes.scale.setScalar(1);
  hermes.quaternion.setFromRotationMatrix(_m.makeBasis(x, up, f));
  // (the model's origin is under its keel: the spine runs 12 m above it)
  hermes.position.copy(centre).addScaledVector(up, -12);
  hermes.updateMatrixWorld(true);
  const dock = centre.clone().addScaledVector(f, 30);
  // the ascent stage lies nose toward the ship: its own "up" is the way it points
  const rocketWorldQ = new THREE.Quaternion().setFromRotationMatrix(_m.makeBasis(x, f.clone().negate(), up));
  const rocket = World.mavRocket;
  rocket.parent.updateWorldMatrix(true, false);
  const parentInvQ = rocket.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  // how long the stage is, from the point it is placed by to its open nose (measured as it stands, before it is turned)
  const padUp = World.mav.position.clone().normalize(), box = new THREE.Box3().setFromObject(rocket);
  const basePt = rocket.getWorldPosition(new THREE.Vector3());
  let top = 0;
  for (let i = 0; i < 8; i++) top = Math.max(top, _a.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(basePt).dot(padUp));
  const stageLength = clamp(top * 0.82, 3, 14);
  // the tether: a line from the airlock to the man on the end of it
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(20 * 3), 3));
  const tether = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xf4f0e8, fog: false }));
  tether.frustumCulled = false; tether.position.copy(centre); tether.visible = false;
  ctx.world.add(tether);
  World.launch.focus = centre;
  e.snapLight = 3;                 // (the light is metered and the sky's light taken afresh at once, under the cut, not a second into the shot)
  F.glow = 0; F.smoke.u.uGlow.value = 0;
  const V = () => new THREE.Vector3();
  return { centre, dock, f, x, s, h, rocketWorldQ, parentInvQ, stageLength, tether, blastDue: 0, said: 0,
    mavAt: V(), nose: V(), noseDir: V(), beckAt: V(), from: V(), to: V(), ahead: V(),
    dist: 106, pitch: 50 * deg, swing: 25 * deg, roll: -0.14 };
}
