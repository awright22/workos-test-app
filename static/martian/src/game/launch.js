// The launch: the last act of the story. Ignition and lift-off seen from the ground, the climb out of the dust into
// a black sky, and the rescue as the book has it: the ascent vehicle falls short, the Hermes blows her forward
// airlock to brake, and Beck crosses on a tether to fetch him. Nobody flies anything: he is cargo.
//
// It is eight shots, cut like film, and three effects that exist only here:
//   the flame   three nested cones of light (a white core, the flame, a wide faint plume that spreads as the air thins)
//   the smoke   lit puffs: a skirt of dust rolling out along the ground, and the column the engine leaves up the sky
//   the glow    the engine's light on the pad and on the smoke round it
import * as THREE from 'three';
import { S } from './state.js';
import { Snd } from '../audio/sound.js';
import { tangentBasis } from '../planet/geo.js';
import { World, groundGlow, drape } from '../world/build.js';
import { log, setPrompt } from '../ui/dom.js';
import { camLookAt, astro } from './player.js';
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
const CUT_CHASE = 4.7;       // ... to the camera that climbs beside the rocket
const CUT_LEAVE = 12.6;      // ... to the one ahead of it, looking back down at it over the curve of the planet
const MECO = 15.2;           // the engine burns out
const CUT_ORBIT = 16.4;      // ... the Hermes
const WIN = 26.0;            // the rescue is called
const CROSS_AT = 3.4;        // seconds into the last scene: cut from the whole ship to the man on the tether
const CLOSE_AT = 6.7;        // ... and to the vehicle's open nose as he reaches it
const ORBIT_R = R * 1.45;    // where the Hermes waits, from the planet's centre
const climb = (lt) => 14 * lt * lt;        // height of the ascent stage above the pad (m), lt seconds after lift-off

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
const _bq = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _dq = new THREE.Quaternion(), _bv = new THREE.Vector3(), _bw = new THREE.Vector3(), _bt = new THREE.Vector3();
const DEG = Math.PI / 180;
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---- the smoke ---------------------------------------------------------------------------------------------------
const SMOKE_N = 2600;

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
    this.grow = new THREE.BufferAttribute(new Float32Array(n * 4), 4);       // metres it swells by, drag, turn, how thick it is
    for (const a of [this.start, this.vel, this.info, this.grow]) a.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < n; i++) { this.info.setXYZW(i, -1000, 1, 0, 0); this.grow.setXYZW(i, 0, 1, 0, 1); }
    g.setAttribute('position', this.start); g.setAttribute('aVel', this.vel); g.setAttribute('aInfo', this.info); g.setAttribute('aGrow', this.grow);
    this.i = 0; this.time = 0;
    this.u = {
      uTime: { value: 0 }, uPx: { value: 600 }, uMaxPx: { value: 256 }, uMap: { value: smokeTexture() },
      uUp: { value: new THREE.Vector3(0, 1, 0) }, uWind: { value: new THREE.Vector3() }, uSunFlat: { value: new THREE.Vector3(1, 0, 0) }, uColumn: { value: 1 },
      uSunV: { value: new THREE.Vector3(0, 1, 0) }, uUpV: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color(1, 0.9, 0.8) }, uAmb: { value: new THREE.Color(0.2, 0.15, 0.1) },
      uGlowPos: { value: new THREE.Vector3() }, uGlowCol: { value: new THREE.Color(2.4, 1.05, 0.3) }, uGlow: { value: 0 },
      fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 }, fogNear: { value: 1 }, fogFar: { value: 2000 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false, fog: true,
      vertexShader: /* glsl */`
        #include <fog_pars_vertex>
        attribute vec3 aVel; attribute vec4 aInfo, aGrow;
        uniform float uTime, uPx, uMaxPx, uGlow, uColumn; uniform vec3 uUp, uWind, uGlowPos, uSunFlat;
        varying float vA, vTone, vTurn, vGlow, vShade;
        void main() {
          float age = uTime - aInfo.x;
          float k = clamp(age / aInfo.y, 0.0, 1.0);
          // thrown out fast, then hanging: there is almost no air to carry it and none to clear it
          float travel = (1.0 - exp(-age * aGrow.y)) / aGrow.y;
          float span = aInfo.z + aGrow.x * (1.0 - exp(-age * 0.5));
          vec3 p = position + aVel * travel;
          // Where it stands in the column, toward the sun or away from it: the far side of a column of smoke lies in
          // the shadow of the near side. (Each puff lit alike, the column was a string of white balls.)
          float high = max(dot(p, uUp), 0.0);
          vec3 off = p - uUp * dot(p, uUp);
          vShade = mix(1.0, clamp(0.5 + dot(off, uSunFlat) / (span * 0.8 + 4.0), 0.0, 1.0), smoothstep(3.0, 16.0, high) * uColumn);
          // what wind there is leans the column, more with height; and the winds aloft are not one wind: it kinks as it ages
          p += uWind * (age * (1.0 + high / 260.0));
          p += (uWind * sin(high * 0.011 + 1.3) + cross(uUp, uWind) * sin(high * 0.017 + 0.4)) * (age * 0.9);
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float px = span * uPx / max(-mvPosition.z, 0.5);
          gl_PointSize = clamp(px, 1.0, uMaxPx);
          // (a puff that would be drawn larger than a point may be is thinned instead, and one the camera stands in is not a wall)
          float room = smoothstep(span * 0.2, span * 1.1, -mvPosition.z) * min(1.0, uMaxPx / px);
          // (seen at once: the rocket is a hundred metres on before a slow puff would have shown)
          vA = (age < 0.0 || k >= 1.0) ? 0.0 : pow(1.0 - k, 1.4) * smoothstep(0.0, 0.12, age) * room * 0.78 * aGrow.w;
          vTone = aInfo.w;
          vTurn = aGrow.z * 6.2832 + age * 0.25 * (fract(aGrow.z * 7.0) - 0.5);
          vec3 gd = p - uGlowPos;
          vGlow = uGlow / (1.0 + dot(gd, gd) / 200.0);
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */`
        #include <fog_pars_fragment>
        uniform sampler2D uMap; uniform vec3 uSunV, uUpV, uSunCol, uAmb, uGlowCol;
        varying float vA, vTone, vTurn, vGlow, vShade;
        void main() {
          vec2 c = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(c, c);
          float cs = cos(vTurn), sn = sin(vTurn);
          vec2 q = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs) * 0.5 + 0.5;
          float a = texture2D(uMap, q).a * vA * smoothstep(1.0, 0.2, r2);
          if (a < 0.004) discard;
          // Each puff is lit as a ball of smoke, bright toward the sun, and light gets some way through it; and the
          // whole column is lit as one thing, its far side in the shade of its near side. Small puffs and many: the
          // balls make the billows of a cloud's edge, and the column's own light and shade make its shape.
          vec3 n = normalize(vec3(c.x, -c.y, sqrt(max(1.0 - r2, 0.0)) + 0.35));
          float lit = smoothstep(-0.35, 0.85, dot(n, uSunV)) * (0.22 + 0.78 * vShade);
          vec3 base = mix(vec3(0.44, 0.22, 0.115), vec3(0.95, 0.91, 0.86), vTone);
          // (the sky lights it from above and the red ground from below, and less)
          vec3 col = base * (uAmb * (0.72 + 0.28 * dot(n, uUpV)) + uSunCol * lit) + uGlowCol * (vGlow * (0.35 + 0.65 * lit));
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
  emit(at, vel, size, grow, life, tone, drag, thick = 1) {
    const k = this.i; this.i = (this.i + 1) % SMOKE_N;
    const o = this.points.position;
    this.start.setXYZ(k, at.x - o.x, at.y - o.y, at.z - o.z);
    this.vel.setXYZ(k, vel.x, vel.y, vel.z);
    this.info.setXYZW(k, this.time, life, size, tone);
    this.grow.setXYZW(k, grow, drag, rnd(), thick);
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

// ---- the column -------------------------------------------------------------------------------------------------
// What the engine leaves up the sky, as one thing: a tube about the rocket's path that swells with age, billows,
// leans and kinks in the wind, thins as the air does and is lit as a cloud is, its far side in its own shade.
// (It was puffs, each a lit ball, and from far off any number of them is a string of beads.) Its shape is worked out
// on the graphics card from how long ago the rocket passed each height.
const GLSL_NOISE = /* glsl */`
  float hash3(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }`;
function buildColumn(scene, smokeU) {
  const NS = 22, NH = 300, at = new Float32Array((NS + 1) * (NH + 1) * 2), idx = [];
  for (let j = 0; j <= NH; j++) for (let i = 0; i <= NS; i++) { at[(j * (NS + 1) + i) * 2] = i / NS; at[(j * (NS + 1) + i) * 2 + 1] = j / NH; }
  for (let j = 0; j < NH; j++) for (let i = 0; i < NS; i++) {
    const a = j * (NS + 1) + i, b = a + 1, c = a + NS + 1, d = c + 1;
    idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NS + 1) * (NH + 1) * 3), 3));
  g.setAttribute('aAt', new THREE.BufferAttribute(at, 2));
  g.setIndex(idx);
  // (it shares the smoke's light, wind and fog: one set of numbers for both)
  const u = { uLt: { value: 0 }, uTop: { value: 0 }, uE: { value: new THREE.Vector3(1, 0, 0) }, uN: { value: new THREE.Vector3(0, 0, 1) },
    uUp: smokeU.uUp, uWind: smokeU.uWind, uSunV: smokeU.uSunV, uUpV: smokeU.uUpV, uSunCol: smokeU.uSunCol, uAmb: smokeU.uAmb,
    uGlowPos: smokeU.uGlowPos, uGlowCol: smokeU.uGlowCol, uGlow: smokeU.uGlow,
    fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 }, fogNear: { value: 1 }, fogFar: { value: 2000 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, fog: true, side: THREE.FrontSide,
    vertexShader: /* glsl */`
      #include <fog_pars_vertex>
      attribute vec2 aAt;
      uniform float uLt, uTop; uniform vec3 uUp, uE, uN, uWind;
      varying vec3 vN, vV, vP; varying float vAlpha, vHgt, vAge;
      ${GLSL_NOISE}
      vec3 place(float th, float hgt, out float age) {
        age = max(uLt - sqrt(max(hgt, 0.0) / 14.0), 0.0);         // (the rocket's height is fourteen times the square of the seconds since lift-off)
        float a = th * 6.2832;
        vec2 d = vec2(cos(a), sin(a));
        // it swells fast and then slowly; wider where the air is thin; and at the ground it splashes
        float rad = (1.2 + 5.0 * (1.0 - exp(-age * 0.9)) + 2.2 * pow(age, 0.75)) * (1.0 + 1.3 * smoothstep(200.0, 900.0, hgt));
        rad += 24.0 * exp(-hgt / 6.5) * min(1.0, age * 0.45);
        vec3 q = vec3(d * 1.9, hgt / 9.0 - age * 0.10);
        float n = (vnoise(q) - 0.5) * 1.2 + (vnoise(q * 2.3 + 7.1) - 0.5) * 0.8;
        float r = rad * (1.0 + 0.55 * n) * smoothstep(0.0, 0.4, age + 0.04);
        vec3 p = uE * (d.x * r) + uN * (d.y * r) + uUp * hgt;
        p += uWind * (age * (1.0 + hgt / 260.0));
        p += (uWind * sin(hgt * 0.011 + 1.3) + cross(uUp, uWind) * sin(hgt * 0.017 + 0.4)) * (age * 0.9);
        return p;
      }
      void main() {
        float hgt = aAt.y * uTop, age, other;
        vec3 p = place(aAt.x, hgt, age);
        vec3 nrm = normalize(cross(place(aAt.x + 0.02, hgt, other) - p, place(aAt.x, hgt + 1.2, other) - p));
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        vN = normalMatrix * nrm; vV = -mvPosition.xyz; vP = p; vHgt = hgt; vAge = age;
        gl_Position = projectionMatrix * mvPosition;
        // it is the air that makes smoke of an engine's breath: above nine hundred metres there is none; and it disperses
        vAlpha = (1.0 - smoothstep(260.0, 950.0, hgt)) * (1.0 - smoothstep(13.0, 24.0, age)) * smoothstep(0.0, 0.25, age);
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <fog_pars_fragment>
      uniform vec3 uSunV, uUpV, uSunCol, uAmb, uGlowCol, uGlowPos; uniform float uGlow;
      varying vec3 vN, vV, vP; varying float vAlpha, vHgt, vAge;
      ${GLSL_NOISE}
      void main() {
        vec3 n = normalize(vN);
        float facing = abs(dot(n, normalize(vV)));
        // the billows on the billows
        float fine = vnoise(vP * 0.5 + vec3(0.0, vAge * 0.15, 0.0)) * 0.6 + vnoise(vP * 1.25 + 3.7) * 0.4;
        // (soft where it turns away from the eye: a cloud has no outline)
        float a = vAlpha * smoothstep(0.02, 0.20 + 0.24 * fine, facing);
        if (a < 0.004) discard;
        float lit = smoothstep(-0.5, 0.85, dot(n, uSunV)) * (0.66 + 0.68 * fine);
        vec3 base = mix(vec3(0.52, 0.31, 0.17), vec3(0.95, 0.91, 0.86), smoothstep(3.0, 40.0, vHgt));
        vec3 col = base * (uAmb * (0.72 + 0.28 * dot(n, uUpV)) + uSunCol * lit);
        vec3 gd = vP - uGlowPos;
        col += uGlowCol * (uGlow * 0.5 / (1.0 + dot(gd, gd) / 260.0));
        gl_FragColor = vec4(col, a * 0.94);
        #include <fog_fragment>
      }`,
  });
  const m = new THREE.Mesh(g, mat);
  m.frustumCulled = false; m.renderOrder = 21; m.visible = false;
  scene.add(m);
  return m;
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
      uniform float uTime;
      void main() {
        vUv = uv;
        // (its edge is never still: straight-sided, it was a white bar under the engine)
        vec3 p = position;
        p.xz *= 1.0 + (1.0 - uv.y) * (0.16 * sin(p.y * 1.9 + uTime * 37.0) + 0.10 * sin(p.y * 4.3 - uTime * 53.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
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
  const flame = plume(0.85, 0.14, 11, [1.0, 0.40, 0.09], [1.0, 0.80, 0.50], 3.4, 1.6);
  const core = plume(0.46, 0.05, 5.5, [1.0, 0.78, 0.46], [1.0, 0.95, 0.86], 6.5, 2.2);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDisc(), color: new THREE.Color(2.8, 1.35, 0.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
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
  fx.column = buildColumn(ctx.engine.scene, fx.smoke.u);
  // the air out of the Hermes' lock, when it blows: a cone of pale vapour, the same kind of thing as the plume
  fx.vent = plume(0.5, 9.5, 38, [0.62, 0.72, 0.92], [1.0, 1.0, 1.0], 0, 1.5);
  fx.vent.visible = false;
  ctx.world.add(fx.vent);
  drape(groundGlow(World.mav, 34, new THREE.Color(1.0, 0.50, 0.18), 1.0, 'pool', () => fx.glow, 0.07), 0.07);
  return fx;
}

export let hermes = null;

/** The sun's place in its daily round (S.tod) that puts it `sinEl` high over the place `up`, later the same sol. */
function todForSunHeight(up, sinEl) {
  const c = Math.cos(SUN_DECLINATION), A = Math.hypot(up.x, up.z), phi = Math.atan2(up.z, up.x);
  const need = clamp((sinEl - up.y * Math.sin(SUN_DECLINATION)) / Math.max(c * A, 1e-6), -1, 1);
  return ((phi - Math.acos(need)) / (Math.PI * 2) % 1 + 1) % 1;
}

/** Turn a bone to point (along its own length, its +Y) at a place given in the world group's frame, `w` of the way from where its clip left it. */
function aimBone(bone, target, w) {
  if (!bone || w <= 0.001) return;
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_pq);
  _bq.copy(_pq).multiply(bone.quaternion);                                   // the bone's attitude in the world, as the clip has it
  _bw.copy(bone.position).applyMatrix4(bone.parent.matrixWorld);             // ... and where it starts
  _bt.copy(target); ctx.world.localToWorld(_bt);
  _bv.set(0, 1, 0).applyQuaternion(_bq);
  _dq.setFromUnitVectors(_bv, _bt.sub(_bw).normalize());
  _bq.premultiply(_dq);
  _dq.copy(_pq).invert().multiply(_bq);                                      // the new attitude, in its parent's frame
  bone.quaternion.slerp(_dq, Math.min(1, w));
}
/** Reach for a place with one arm: the upper arm most of the way, the forearm the rest. */
function reach(fig, sideName, target, w) {
  aimBone(fig.bones['upper_arm_' + sideName], target, w);
  aimBone(fig.bones['forearm_' + sideName], target, w * 0.85);
}

/** The Hermes' crew wear her colours: the orange of his surface suit turned to blue, so that the two can be told apart. */
function crewColours(inner) {
  inner.traverse((o) => {
    if (!o.isMesh) return;
    if (o.geometry.attributes.color) {
      o.geometry = o.geometry.clone();
      const c = o.geometry.attributes.color;
      for (let i = 0; i < c.count; i++) {
        const r = c.getX(i), g = c.getY(i), b = c.getZ(i);
        if (r > 0.18 && r > g * 1.7 && g > b * 1.3) c.setXYZ(i, b * 0.9 + 0.02, g * 0.8 + r * 0.12, r * 0.95);
      }
      c.needsUpdate = true;
    }
    if (o.material && !Array.isArray(o.material) && o.material.name === 'suit_orange') { o.material = o.material.clone(); o.material.color.setRGB(0.07, 0.30, 0.88); }
  });
}

export function startLaunch() {
  S.mode = 'cutscene';
  S.uiOpen = false;
  setPrompt(null);
  closeScreens();
  if (astro) astro.visible = false;        // he is in the rocket (left standing where he had stood, he watched his own launch)
  if (World.mavNose) World.mavNose.visible = false;      // (the nose cone came off when he lightened her: nothing launches with it on)
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
  const around = (deg) => new THREE.Vector3().copy(sunFlat).multiplyScalar(Math.cos(deg * DEG)).addScaledVector(side, Math.sin(deg * DEG));
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
  // (the far camera stands well back, so that the land and its horizon stay under the column for the whole of the shot:
  // at a hundred and fifty metres it had tilted up into bare sky within a second)
  const FAR = 320;
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
    const figure = (crew) => {
      const a = model('astronaut');
      a.root.traverse((o) => { const n = o.material && !Array.isArray(o.material) ? o.material.name : ''; if (o.name === 'head' || /^head_/.test(n)) o.visible = false; });
      if (crew) crewColours(a.inner);
      const mixer = new THREE.AnimationMixer(a.inner), clip = a.clips.find((c) => c.name === 'Air');
      if (clip) mixer.clipAction(clip).play();
      const bones = {};
      for (const n of ['upper_arm_L', 'forearm_L', 'upper_arm_R', 'forearm_R']) bones[n] = a.inner.getObjectByName(n);
      // (he is placed by his middle, not his boots: the model stands on its origin, so it hangs in a holder a little
      // above it. Moving the model itself did nothing: the clip writes its place every frame.)
      const holder = new THREE.Group();
      a.root.position.y = -0.95;
      holder.add(a.root);
      holder.visible = false;
      ctx.world.add(holder);
      return { root: holder, mixer, bones };
    };
    World.launchCrew = { beck: figure(true), mark: figure(false) };
  }
  World.launchCrew.beck.root.visible = World.launchCrew.mark.root.visible = false;
  const F = effects(), smoke = F.smoke, parts = F.flame.userData;
  smoke.points.position.copy(pad);
  F.column.position.copy(pad); F.column.visible = true;
  F.column.material.uniforms.uE.value.copy(east); F.column.material.uniforms.uN.value.copy(north);
  F.column.material.uniforms.uLt.value = 0; F.column.material.uniforms.uTop.value = 0;
  F.vent.visible = false;
  smoke.u.uUp.value.copy(up);
  smoke.u.uSunFlat.value.copy(sunFlat);
  smoke.u.uColumn.value = 1;
  smoke.u.uWind.value.copy(around(115)).multiplyScalar(1.1);
  // (drawn from the first frame, with nothing in them, so that their shaders are built during the countdown and not at ignition)
  F.flame.visible = true; F.flame.scale.setScalar(0.001);
  World.launch = { burning: false, alt: 0, focus: World.mav.position };

  const rocket = World.mavRocket, restY = World.mavRocketY;
  const nozzle = new THREE.Vector3();
  let t = 0, shot = '', skirtDue = 0, orbit = null;
  const setShot = (name, fov) => { shot = name; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } };
  // (the canvas is already at the render scale. The 0.8 is the size the smoke was drawn and judged at: the same on every preset.)
  const pixelHeight = () => e.renderer.domElement.height * 0.8;
  // A camera that stands off a place and above it, and looks down across it at the planet: `az` is the level direction
  // from the place to where the camera stands, `pitch` how high above it, `roll` turns the horizon.
  const stand = (target, az, pitch, dist, roll) => {
    cam.position.copy(target).addScaledVector(az, Math.cos(pitch) * dist).addScaledVector(up, Math.sin(pitch) * dist);
    _b.copy(up).applyAxisAngle(_c.copy(cam.position).sub(target).normalize(), roll);
    camLookAt(target, _b);
  };

  World.launchAnim = (dt) => {
    t += dt;
    const lt = t - LIFT, alt = lt > 0 ? climb(lt) : 0;
    // the engine: lit just before lift-off, burnt out a second before the cut to the Hermes
    const burn = smoothstep(IGNITE, IGNITE + 0.45, t) * (1 - smoothstep(MECO, MECO + 0.4, lt));
    World.launch.burning = burn > 0.02;
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
      F.glow = burn * (1 - smoothstep(6, 90, alt)) * (0.85 + Math.random() * 0.15);
      smoke.u.uGlowPos.value.copy(nozzle).addScaledVector(up, -3).sub(pad);
      smoke.u.uGlow.value = burn * (0.75 + Math.random() * 0.25);

      // the skirt: the pad's dust driven out along the ground in every direction
      const blast = burn * (1 - smoothstep(35, 150, alt));
      skirtDue += dt * 150 * blast;
      while (skirtDue >= 1) {
        skirtDue -= 1;
        const a = rnd() * Math.PI * 2, far = 1.5 + rnd() * 2.5;
        _a.copy(east).multiplyScalar(Math.cos(a)).addScaledVector(north, Math.sin(a));
        _b.copy(pad).addScaledVector(_a, far).addScaledVector(up, 0.5 + rnd() * 0.6);
        _c.copy(_a).multiplyScalar(22 + rnd() * 22).addScaledVector(up, 0.4 + rnd() * 3.6);
        smoke.emit(_b, _c, 1.5 + rnd() * 1.3, 6 + rnd() * 8, 6 + rnd() * 4.5, rnd() * 0.16, 0.48 + rnd() * 0.2);
      }
      // the column the engine leaves up the sky
      F.column.material.uniforms.uLt.value = Math.max(lt, 0);
      F.column.material.uniforms.uTop.value = Math.min(alt, 950);
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
      // 2. From far off: the land and its horizon, the skirt of dust spreading over it, the column standing on it,
      //    the rocket at its head. The horizon is held in the lower part of the frame until the cut.
      setShot('wide', 46);
      S.shake = 0.08;
      cam.position.copy(camFar);
      const tilt = Math.max(0.3 * 46 * DEG, Math.atan2(alt + 9, FAR) - 21 * DEG);
      camLookAt(_a.copy(pad).addScaledVector(up, FAR * Math.tan(tilt)), up);
    } else if (lt < CUT_LEAVE) {
      // 3. Beside it, climbing with it: level with it at first, the column falling away below, then above it as the
      //    ground drops, the horizon bends and the sky goes black.
      setShot('chase', 50);
      const rel = (lt - CUT_CHASE) / (CUT_LEAVE - CUT_CHASE), over = smoothstep(0.0, 0.5, rel);
      const dist = 38 + Math.min(alt, 2400) * 0.014;
      S.shake = clamp(0.5 - (lt - CUT_CHASE) * 0.07, 0, 0.5);
      cam.position.copy(pad).addScaledVector(nearDir, dist).addScaledVector(side, -dist * (0.35 + 0.25 * rel))
        .addScaledVector(up, alt + lerp(5, 31 + Math.min(alt, 2400) * 0.008, over));
      camLookAt(rocketAt.addScaledVector(up, -6 * over), up);
    } else if (lt < CUT_ORBIT) {
      // 4. From ahead of it and above, looking back down: the rocket climbing toward the lens out of the curve of
      //    the planet, the plume spread wide in the vacuum behind it; the engine burns out, and it coasts.
      setShot('above', 46);
      const k = (lt - CUT_LEAVE) / (CUT_ORBIT - CUT_LEAVE);
      const lead = 42 - 24 * k, off = 40 - 20 * k;
      cam.position.copy(pad).addScaledVector(up, alt + 9 + lead).addScaledVector(nearDir, off * 0.94).addScaledVector(side, off * 0.34);
      _b.copy(up).applyAxisAngle(nearDir, 0.16);
      camLookAt(rocketAt.addScaledVector(up, -3), _b);
    } else {
      // 5. The Hermes, over the line between day and night. The ascent vehicle has fallen short of her and hangs
      //    off her bow. Her forward airlock blows, to brake her; a man comes out of it on a tether.
      // 6. The man on the tether, crossing: the ship behind him, the planet under him.
      // 7. Close on the vehicle's open nose as he reaches it and takes hold; and back, the two of them together.
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
      F.column.visible = false;
      World.launch.burning = false;
      const nose = O.nose.copy(mavAt).addScaledVector(noseDir, O.stageLength);
      // (what is said over the radio, once each)
      if (ot > 0.5 && !O.said) { O.said = 1; log('HERMES: He is short of us, and fast. Blowing the forward airlock to brake. Beck, you are on the tether.', 'nasa'); }
      if (ot > 7.7 && O.said < 2) { O.said = 2; log('BECK: I have him.', 'nasa'); }
      // The airlock blows: the ship's own air out of her bow, a fast pale spray that is gone in a second, and
      // whatever was loose in the lock with it, glinting as it tumbles away.
      {
        const k = (ot - 0.7) / 1.5;
        F.vent.visible = k > 0 && k < 1;
        if (F.vent.visible) {
          F.vent.position.copy(O.dock).addScaledVector(O.f, 0.4);
          F.vent.quaternion.copy(O.ventQ);
          const open = 1 - Math.exp(-k * 6);
          F.vent.scale.set(0.35 + 0.65 * open, open, 0.35 + 0.65 * open);
          F.vent.material.uniforms.uGain.value = 1.15 * smoothstep(0, 0.06, k) * Math.pow(1 - k, 1.6);
        }
      }
      {
        const D = O.debris, dp = D.geometry.attributes.position, dc = D.geometry.attributes.color, age = ot - 0.8;
        D.visible = age > 0 && age < 9;
        if (D.visible) {
          for (let i = 0; i < dp.count; i++) {
            const v = O.debrisVel[i];
            dp.setXYZ(i, O.dock.x - O.centre.x + v.x * age, O.dock.y - O.centre.y + v.y * age, O.dock.z - O.centre.z + v.z * age);
            const glint = Math.pow(Math.max(0, Math.sin(age * v.rate + v.phase)), 10) * 2.6 + 0.12;
            const fade = 1 - smoothstep(5, 9, age);
            dc.setXYZ(i, glint * fade, glint * fade * 0.96, glint * fade * 0.88);
          }
          dp.needsUpdate = dc.needsUpdate = true;
        }
      }
      // Beck: out of the airlock at two seconds, across the gap, hand on the nose at seven and a half; then back, with him
      const out = smoothstep(1.9, 7.5, ot), back = smoothstep(8.8, 19.5, ot);
      const from = O.from.copy(O.dock).addScaledVector(O.f, 1.6);
      // (he comes in beside the open nose, not onto the man in it)
      const to = O.to.copy(nose).addScaledVector(noseDir, 1.9).addScaledVector(O.x, 0.8);
      const beckAt = O.beckAt.copy(from).lerp(to, out).lerp(from, back);
      const crew = World.launchCrew;
      crew.beck.root.visible = ot > 1.9;
      crew.beck.root.position.copy(beckAt);
      // He flies head first toward where he is going, belly to the planet; at the nose he swings round, about his
      // own hands, to face the ship again.
      const way = O.way.copy(to).sub(from).normalize(), lat = O.lat.crossVectors(up, way).normalize();
      const turn = smoothstep(7.3, 9.3, ot) * Math.PI;
      const ahead = O.ahead.copy(way).multiplyScalar(Math.cos(turn)).addScaledVector(lat, Math.sin(turn)).normalize();
      crew.beck.root.quaternion.setFromRotationMatrix(_m.makeBasis(_d.crossVectors(up, ahead).normalize(), ahead, _a.crossVectors(_d, ahead)));
      crew.beck.mixer.setTime(0.4 + 0.25 * Math.sin(ot * 0.9));
      // ... and Watney, in the open nose until he is fetched, then held at Beck's side on the way home
      const carried = smoothstep(8.0, 9.4, ot);
      const markAt = O.markAt.copy(nose).addScaledVector(noseDir, 0.30)
        .lerp(_b.copy(beckAt).addScaledVector(_d, 0.9).addScaledVector(ahead, -0.5).addScaledVector(up, -0.15), carried);
      const markUp = O.markUp.copy(noseDir).lerp(_c.copy(ahead).addScaledVector(_d, -0.55).normalize(), carried).normalize();
      crew.mark.root.visible = true;
      crew.mark.root.position.copy(markAt);
      crew.mark.root.quaternion.setFromRotationMatrix(_m.makeBasis(_d.crossVectors(up, markUp).normalize(), markUp, _a.crossVectors(_d, markUp)));
      crew.mark.mixer.setTime(0.2 + 0.2 * Math.sin(ot * 0.7 + 1));
      // Their arms: Beck reaches for him over the last of the crossing, and Watney for Beck; then Beck holds him
      // with one arm and the tether with the other.
      {
        crew.beck.root.updateWorldMatrix(true, true); crew.mark.root.updateWorldMatrix(true, true);
        const reaching = smoothstep(0.55, 0.92, out), hold = carried;
        reach(crew.beck, 'L', markAt, reaching);
        reach(crew.beck, 'R', hold > 0.5 ? from : markAt, reaching * (hold > 0.5 ? 0.8 : 1));
        reach(crew.mark, 'L', beckAt, smoothstep(0.7, 0.98, out));
        reach(crew.mark, 'R', beckAt, smoothstep(0.7, 0.98, out));
      }
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
      if (ot < CROSS_AT) {
        setShot('orbit', 30);
        // the camera drifts round her, slowly
        const swing = O.swing + ot * 0.012;
        _a.copy(O.h).multiplyScalar(Math.cos(swing)).addScaledVector(O.s, Math.sin(swing));
        cam.position.copy(O.centre).addScaledVector(_a, Math.cos(O.pitch) * O.dist).addScaledVector(up, Math.sin(O.pitch) * O.dist);
        _b.copy(up).applyAxisAngle(_c.copy(cam.position).sub(O.centre).normalize(), O.roll);
        camLookAt(_c.copy(O.centre).addScaledVector(O.f, 27), _b);
      } else if (ot < CLOSE_AT) {
        // ahead of him on the sunlit side, and above: he comes on toward the lens, the tether running back to the
        // open lock behind him
        setShot('cross', 36);
        const ct = ot - CROSS_AT;
        _a.copy(O.f).multiplyScalar(Math.cos(O.crossAz)).addScaledVector(O.x, -Math.sin(O.crossAz));
        stand(_d.copy(beckAt).addScaledVector(O.f, -3.5), _a, O.crossPitch, 10.5 - ct * 0.5, O.crossRoll);
      } else {
        // above the vehicle's nose on the same side: the two of them, the dark line of the night behind them
        setShot('reach', 36);
        const ct = ot - CLOSE_AT, az = O.reachAz + ct * 0.012;
        _a.copy(O.f).multiplyScalar(Math.cos(az)).addScaledVector(O.x, -Math.sin(az));
        // (it follows them home: from the nose to the pair of them, and stands a little further off as they go)
        _d.copy(nose).addScaledVector(noseDir, 1.0).lerp(_c.copy(beckAt).lerp(markAt, 0.5), carried);
        stand(_d, _a, O.reachPitch, 6.4 + 4.5 * back + Math.min(ct, 6) * 0.12, O.reachRoll);
      }
    }
    if (S.shake > 0) cam.position.addScaledVector(_a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.35);
    // a short dip to black over the one cut that crosses half a planet
    e.final.uniforms.uFade.value = 1 - smoothstep(0.0, 0.7, Math.abs(lt - CUT_ORBIT));
    Snd.rumble(clamp(burn * 0.85 * (1 - smoothstep(CUT_LEAVE, MECO, lt)), 0, 0.85));

    // the smoke is lit by this frame's sun, as this camera sees it
    cam.updateMatrixWorld();
    smoke.u.uSunV.value.copy(e.sunDir).transformDirection(cam.matrixWorldInverse);
    smoke.u.uUpV.value.copy(up).transformDirection(cam.matrixWorldInverse);
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
  const f = h.clone().multiplyScalar(Math.cos(-25 * DEG)).addScaledVector(s, Math.sin(-25 * DEG)).normalize();
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
  // How long the stage is, from the point it is placed by to the open top of its capsule: measured along its own
  // axis, over what can be seen of it (the fairing came off on the ground). (A box round it in the world's axes,
  // on a planet where "up" is no axis, came out three metres long, and he hung in space beyond the hatch.)
  rocket.updateWorldMatrix(true, true);
  const inv = new THREE.Matrix4().copy(rocket.matrixWorld).invert();
  let top = 0;
  rocket.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    for (let q = o; q && q !== rocket; q = q.parent) if (!q.visible) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox;
    _m.multiplyMatrices(inv, o.matrixWorld);
    for (let i = 0; i < 8; i++) top = Math.max(top, _a.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(_m).y);
  });
  const stageLength = clamp(top - 0.2, 3, 14);
  const ventQ = new THREE.Quaternion().setFromRotationMatrix(_m.makeBasis(x, f.clone().negate(), up));          // (a plume's tail runs down its own -Y)
  // the tether: a line from the airlock to the man on the end of it
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(20 * 3), 3));
  const tether = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xf4f0e8, fog: false }));
  tether.frustumCulled = false; tether.position.copy(centre); tether.visible = false;
  ctx.world.add(tether);
  // what was loose in the lock: a few dozen scraps, each a point of light when it catches the sun
  const DN = 44, dg = new THREE.BufferGeometry(), debrisVel = [];
  dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DN * 3), 3));
  dg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(DN * 3), 3));
  for (let i = 0; i < DN; i++) {
    const a1 = rnd() * Math.PI * 2, wide = Math.sqrt(rnd()) * 0.5, sp = 5 + rnd() * 22;
    const v = f.clone().addScaledVector(x, Math.cos(a1) * wide).addScaledVector(up, Math.sin(a1) * wide).multiplyScalar(sp);
    v.rate = 2 + rnd() * 7; v.phase = rnd() * 6.283;
    debrisVel.push(v);
  }
  const debris = new THREE.Points(dg, new THREE.PointsMaterial({ size: 1.7 * e.renderer.getPixelRatio(), sizeAttenuation: false, vertexColors: true,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  debris.frustumCulled = false; debris.position.copy(centre); debris.visible = false; debris.renderOrder = 24;
  ctx.world.add(debris);
  World.launch.focus = centre;
  e.snapLight = 3;                 // (the light is metered and the sky's light taken afresh at once, under the cut, not a second into the shot)
  // (nothing here is on the ground: no pad's glow, no column to shade, no wind. Left blowing, the wind took the
  // lock's air off sideways at the speed of a car, a "wind" that grows with height reckoned five kilometres up.)
  F.glow = 0; F.smoke.u.uGlow.value = 0; F.smoke.u.uColumn.value = 0; F.smoke.u.uWind.value.set(0, 0, 0);
  const V = () => new THREE.Vector3();
  return { centre, dock, f, x, s, h, rocketWorldQ, parentInvQ, stageLength, tether, debris, debrisVel, ventQ, said: 0,
    mavAt: V(), nose: V(), noseDir: V(), beckAt: V(), markAt: V(), markUp: V(), from: V(), to: V(), ahead: V(), way: V(), lat: V(),
    dist: 106, pitch: 50 * DEG, swing: 25 * DEG, roll: -0.14,
    crossAz: 35 * DEG, crossPitch: 40 * DEG, crossRoll: -0.3,
    reachAz: 60 * DEG, reachPitch: 50 * DEG, reachRoll: -0.2 };
}
