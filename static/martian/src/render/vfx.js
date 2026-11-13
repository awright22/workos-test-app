/*
 * Dust and marks: the things that make the ground feel loose and the air feel real.
 *
 *   - Air dust: motes that drift past on the wind; in a storm they become a streaming blizzard.
 *     Their motion is computed entirely in the vertex shader from a seed and the clock.
 *   - Puffs: short-lived dust kicked up by boots, wheels, landings, digging and rocket exhaust.
 *     A fixed pool, written only when something is emitted.
 *   - Marks: boot prints and tyre tracks pressed into the regolith, in a ring buffer that
 *     slowly fills and overwrites its oldest entries.
 */
import * as THREE from 'three';
import { R } from '../planet/constants.js';

function softSprite(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function markTexture(kind) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 128);
  if (kind === 'boot') {
    // A boot's sole: broad at the ball, narrow at the arch, a separate heel, with the lugs pressed deeper.
    // (An oval with bars across its whole width read as a rectangular stamp.)
    const sole = () => {
      g.beginPath();
      g.moveTo(32, 5);
      g.bezierCurveTo(49, 5, 53, 26, 51, 44); g.bezierCurveTo(50, 58, 44, 66, 42, 78);        // outer edge, toe to arch
      g.lineTo(23, 78);
      g.bezierCurveTo(21, 66, 14, 58, 13, 44); g.bezierCurveTo(11, 24, 17, 5, 32, 5);          // inner edge back to the toe
      g.closePath();
    };
    const heel = () => { g.beginPath(); g.moveTo(22, 88); g.lineTo(43, 88); g.bezierCurveTo(47, 104, 44, 123, 32, 123); g.bezierCurveTo(20, 123, 18, 104, 22, 88); g.closePath(); };
    g.fillStyle = '#4a4a4a';
    sole(); g.fill(); heel(); g.fill();
    g.fillStyle = '#fff';
    g.save(); sole(); g.clip();
    for (let y = 12; y < 78; y += 11) g.fillRect(8, y, 48, 5);
    g.restore();
    g.save(); heel(); g.clip();
    g.fillRect(8, 94, 48, 6); g.fillRect(8, 107, 48, 6);
    g.restore();
  } else {
    // a tyre: a pressed rut, unbroken from one mark to the next, with the grousers' chevrons faint inside it
    // (strong chevrons on a faint band read as a row of separate stamps)
    const band = g.createLinearGradient(0, 0, 64, 0);
    band.addColorStop(0, '#000'); band.addColorStop(0.2, '#8e8e8e'); band.addColorStop(0.5, '#a4a4a4'); band.addColorStop(0.8, '#8e8e8e'); band.addColorStop(1, '#000');
    g.fillStyle = band; g.fillRect(0, 0, 64, 128);
    g.lineWidth = 4; g.strokeStyle = '#dcdcdc';
    for (let y = -8; y < 140; y += 16) { g.beginPath(); g.moveTo(12, y + 10); g.lineTo(32, y); g.lineTo(52, y + 10); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 4;
  return t;
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();
const _s = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _e = new THREE.Vector3(), _n = new THREE.Vector3();

export class Vfx {
  /** @param {THREE.Scene} scene  @param {{air?: number, puffs?: number, marks?: number}} [o] */
  constructor(scene, o = {}) {
    this.scene = scene;
    this.time = 0;
    this.sprite = softSprite();
    this.drift = new THREE.Vector3();          // how far the wind has carried the dust (wrapped), and how far it has settled
    this.fall = 0;
    this._initAir(o.air === undefined ? 1400 : o.air);
    this._initSheets(o.sheets === undefined ? 60 : o.sheets);
    this._initStreaks(o.streaks === undefined ? 1800 : o.streaks);
    this._initPuffs(o.puffs || 500);
    this._initMarks(o.marks || 900);
  }

  // ---------------------------------------------------------------------------------------
  _initAir(n) {
    const seeds = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) { seeds[i * 3] = Math.random(); seeds[i * 3 + 1] = Math.random(); seeds[i * 3 + 2] = Math.random(); rnd[i] = Math.random(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(seeds, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    this.airU = {
      uDrift: { value: this.drift }, uFall: { value: 0 }, uCam: { value: new THREE.Vector3() }, uUp: { value: new THREE.Vector3(0, 1, 0) },
      uStorm: { value: 0 }, uLight: { value: new THREE.Color(1, 0.8, 0.6) }, uPx: { value: 600 }, uMap: { value: this.sprite }, uAmount: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.airU, transparent: true, depthWrite: false, fog: false, blending: THREE.NormalBlending,
      vertexShader: /* glsl */`
        attribute float aRnd;
        uniform float uFall, uStorm, uPx, uAmount;
        uniform vec3 uCam, uDrift, uUp;
        varying float vA;
        void main() {
          const float BOX = 70.0;
          // a box of motes that wraps around the camera: each stays put in the world as you move.
          // Each mote rides the wind at its own pace, in tenths, so the wrapped totals stay exact.
          float pace = (6.0 + floor(aRnd * 9.0)) * 0.1;
          vec3 world = position * BOX + uDrift * pace - uUp * (uFall * (pace - 0.1));
          vec3 rel = mod(world - uCam, BOX) - BOX * 0.5;
          vec4 mv = viewMatrix * vec4(rel, 0.0);
          mv.w = 1.0;
          gl_Position = projectionMatrix * mv;
          float d = length(rel);
          float size = mix(0.035, 0.06, uStorm) * (0.5 + aRnd);
          gl_PointSize = clamp(size * uPx / max(-mv.z, 0.3), 1.0, 90.0);
          float show = step(aRnd, mix(0.42, 1.0, uStorm) * uAmount);
          vA = show * smoothstep(0.6, 2.5, d) * (1.0 - smoothstep(BOX * 0.32, BOX * 0.5, d)) * mix(0.16, 0.4, uStorm);
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D uMap; uniform vec3 uLight;
        varying float vA;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).a * vA;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uLight, a);
        }`,
    });
    this.air = new THREE.Points(g, mat);
    this.air.frustumCulled = false;
    this.air.renderOrder = 20;
    this.scene.add(this.air);
  }

  // ---------------------------------------------------------------------------------------
  // Storm streaks: grit driven along the wind, each drawn as a thin line stretched the way it
  // is going. This is what makes a storm look like wind and not like snow.
  _initStreaks(n) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    const seeds = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) { seeds[i * 3] = Math.random(); seeds[i * 3 + 1] = Math.random(); seeds[i * 3 + 2] = Math.random(); rnd[i] = Math.random(); }
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 3));
    g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 1));
    g.instanceCount = n;
    this.streakU = {
      uDrift: { value: this.drift }, uFall: { value: 0 }, uCam: { value: new THREE.Vector3() }, uUp: { value: new THREE.Vector3(0, 1, 0) },
      uWind: { value: new THREE.Vector3(1, 0, 0) }, uStorm: { value: 0 }, uLight: { value: new THREE.Color(1, 0.8, 0.6) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.streakU, transparent: true, depthWrite: false, fog: false, blending: THREE.NormalBlending,
      vertexShader: /* glsl */`
        attribute vec3 aSeed; attribute float aRnd;
        uniform float uStorm, uFall;
        uniform vec3 uCam, uDrift, uUp, uWind;
        varying float vA; varying vec2 vQ;
        void main() {
          const float BOX = 36.0;
          float pace = (8.0 + floor(aRnd * 7.0)) * 0.1;
          vec3 rel = mod(aSeed * BOX + uDrift * pace - uUp * (uFall * (pace - 0.3)) - uCam, BOX) - BOX * 0.5;
          vec4 mv = viewMatrix * vec4(rel, 0.0);
          // stretch along the wind as the camera sees it; a streak coming straight at the eye is a dot
          vec2 w = (viewMatrix * vec4(uWind, 0.0)).xy;
          float along = length(w);
          vec2 dir = along > 1e-4 ? w / along : vec2(1.0, 0.0);
          // (soft smears of blown grit, not hairlines: thin bright lines read as rain)
          // (the ones close to the eye are kept short and fine, or a still frame shows them as bars)
          float d = length(rel);
          float far = smoothstep(2.0, 10.0, d);
          float len = (0.10 + 0.52 * uStorm) * (0.5 + aRnd) * max(along, 0.12) * mix(0.3, 1.0, far);
          float wide = (0.007 + 0.02 * aRnd) * mix(0.45, 1.0, far);
          mv.xy += dir * (position.x * len) + vec2(-dir.y, dir.x) * (position.y * wide);
          mv.w = 1.0;
          gl_Position = projectionMatrix * mv;
          vQ = position.xy;
          vA = smoothstep(0.25, 1.0, uStorm) * 0.26 * smoothstep(1.2, 4.5, d) * (1.0 - smoothstep(BOX * 0.30, BOX * 0.5, d));
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uLight;
        varying float vA; varying vec2 vQ;
        void main() {
          float a = vA * (1.0 - vQ.x * vQ.x) * (1.0 - vQ.y * vQ.y);
          if (a < 0.004) discard;
          gl_FragColor = vec4(uLight, a);
        }`,
    });
    this.streaks = new THREE.Mesh(g, mat);
    this.streaks.frustumCulled = false;
    this.streaks.renderOrder = 21;
    this.streaks.visible = false;
    this.scene.add(this.streaks);
  }

  // ---------------------------------------------------------------------------------------
  // Storm sheets: wide soft veils of dust that stream past low over the ground.
  _initSheets(n) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    const seeds = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (let i = 0; i < n; i++) { seeds[i * 3] = Math.random(); seeds[i * 3 + 1] = Math.random(); seeds[i * 3 + 2] = Math.random(); rnd[i] = Math.random(); }
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 3));
    g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 1));
    g.instanceCount = n;
    this.sheetU = {
      uDrift: { value: this.drift }, uCam: { value: new THREE.Vector3() }, uUp: { value: new THREE.Vector3(0, 1, 0) }, uCamH: { value: 2 },
      uStorm: { value: 0 }, uLight: { value: new THREE.Color(1, 0.8, 0.6) }, uMap: { value: this.sprite }, uTime: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.sheetU, transparent: true, depthWrite: false, fog: false, blending: THREE.NormalBlending,
      vertexShader: /* glsl */`
        attribute vec3 aSeed; attribute float aRnd;
        uniform float uStorm, uCamH;
        uniform vec3 uCam, uDrift, uUp;
        varying float vA; varying vec2 vUv; varying float vSeed;
        void main() {
          const float BOX = 70.0;
          vSeed = aRnd;
          float pace = (8.0 + floor(aRnd * 7.0)) * 0.1;
          vec3 rel = mod(aSeed * BOX + uDrift * pace - uCam, BOX) - BOX * 0.5;
          // keep the spread sideways, but press the height into the few metres above the ground
          float v = dot(rel, uUp);
          float h = v / BOX + 0.5;
          vec3 centre = rel - uUp * v + uUp * (0.4 + h * h * 9.0 - uCamH);
          float len = mix(4.5, 10.0, aRnd), tall = mix(1.0, 2.8, h);
          vec4 mv = viewMatrix * vec4(centre, 0.0);
          mv.xy += position.xy * vec2(len, tall);
          mv.w = 1.0;
          gl_Position = projectionMatrix * mv;
          vUv = position.xy * 0.5 + 0.5;
          float d = length(centre);
          vA = smoothstep(0.32, 0.75, uStorm) * 0.42 * smoothstep(2.5, 9.0, d) * (1.0 - smoothstep(BOX * 0.30, BOX * 0.48, length(rel)))
             * smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.8, 1.0, h));
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D uMap; uniform vec3 uLight; uniform float uTime;
        varying float vA; varying vec2 vUv; varying float vSeed;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        void main() {
          float fall = texture2D(uMap, vUv).a;
          // Blown sand is threads, not cloth: long along the wind, fine across it, running fast, and torn at its
          // edges. (A plain soft shape made each veil a smooth ribbon with a clean edge, like silk in water.)
          vec2 q = vec2(vUv.x * 4.0 - uTime * (1.1 + vSeed * 0.9), vUv.y * 17.0 + vSeed * 31.0);
          float thread = vn(q) * 0.55 + vn(q * vec2(2.7, 3.3) + 7.1) * 0.30 + vn(q * vec2(7.0, 9.0) + 3.7) * 0.15;
          float a = fall * vA * smoothstep(0.26, 0.70, thread + fall * 0.30) * 1.55;
          if (a < 0.003) discard;
          gl_FragColor = vec4(uLight, a);
        }`,
    });
    this.sheets = new THREE.Mesh(g, mat);
    this.sheets.frustumCulled = false;
    this.sheets.renderOrder = 19;
    this.sheets.visible = false;
    this.scene.add(this.sheets);
  }

  // ---------------------------------------------------------------------------------------
  _initPuffs(n) {
    this.puffN = n; this.puffI = 0;
    const g = new THREE.BufferGeometry();
    this.pStart = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.pVel = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.pInfo = new THREE.BufferAttribute(new Float32Array(n * 4), 4);       // birth, life, size, tone
    for (const a of [this.pStart, this.pVel, this.pInfo]) a.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < n; i++) this.pInfo.setXYZW(i, -100, 1, 0, 0);
    g.setAttribute('position', this.pStart);
    g.setAttribute('aVel', this.pVel);
    g.setAttribute('aInfo', this.pInfo);
    this.puffAnchor = new THREE.Vector3();
    this.puffU = { uTime: { value: 0 }, uUp: { value: new THREE.Vector3(0, 1, 0) }, uLight: { value: new THREE.Color(1, 0.8, 0.6) }, uPx: { value: 600 }, uMap: { value: this.sprite },
      // the renderer fills these in for materials that take fog
      fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 }, fogNear: { value: 1 }, fogFar: { value: 2000 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.puffU, transparent: true, depthWrite: false, fog: true,
      vertexShader: /* glsl */`
        #include <fog_pars_vertex>
        attribute vec3 aVel; attribute vec4 aInfo;
        uniform float uTime, uPx; uniform vec3 uUp;
        varying float vA; varying float vTone;
        void main() {
          float age = uTime - aInfo.x;
          float k = clamp(age / aInfo.y, 0.0, 1.0);
          // fast at first, then hanging in the thin air
          float travel = (1.0 - exp(-age * 2.2)) / 2.2;
          // (a puff is a disc facing the eye, centred on the dust: kicked up at ground level, its lower half was under
          // the ground and showed as a pale shape cut off in a straight line. It rides up by nearly its own radius.)
          float span = aInfo.z * (0.6 + 1.9 * k);
          vec3 p = position + aVel * travel - uUp * (0.35 * age * age * 0.5) + uUp * (span * 0.42);
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(span * uPx / max(-mvPosition.z, 0.3), 1.0, 220.0);
          vA = (age < 0.0 || k >= 1.0) ? 0.0 : (1.0 - k) * (1.0 - k) * smoothstep(0.0, 0.06, k) * 0.34;
          vTone = aInfo.w;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */`
        #include <fog_pars_fragment>
        uniform sampler2D uMap; uniform vec3 uLight;
        varying float vA; varying float vTone;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).a * vA;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uLight * mix(vec3(0.62, 0.34, 0.20), vec3(1.0, 0.9, 0.8), vTone), a);
          #include <fog_fragment>
        }`,
    });
    this.puffs = new THREE.Points(g, mat);
    this.puffs.frustumCulled = false;
    this.puffs.renderOrder = 21;
    this.scene.add(this.puffs);
  }

  /**
   * Kick up dust at a world position.
   * @param {THREE.Vector3} pos
   * @param {{count?: number, speed?: number, up?: number, spread?: number, size?: number, life?: number, tone?: number, dir?: THREE.Vector3}} [o]
   */
  puff(pos, o = {}) {
    const count = o.count || 6, speed = o.speed === undefined ? 1.2 : o.speed, up = o.up === undefined ? 0.8 : o.up;
    const spread = o.spread === undefined ? 0.25 : o.spread, size = o.size || 0.5, life = o.life || 1.6;
    // re-anchor when the action has moved far, so positions stay exact in single precision
    if (pos.distanceToSquared(this.puffAnchor) > 400 * 400) {
      for (let i = 0; i < this.puffN; i++) this.pInfo.setX(i, -100);
      this.puffAnchor.copy(pos);
      this.puffs.position.copy(pos);
    }
    _n.copy(pos).normalize();
    _e.set(-_n.z, 0, _n.x).normalize();
    _v.crossVectors(_n, _e);
    for (let i = 0; i < count; i++) {
      const k = this.puffI; this.puffI = (this.puffI + 1) % this.puffN;
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      const ox = Math.cos(a) * r * spread, oz = Math.sin(a) * r * spread;
      this.pStart.setXYZ(k, pos.x - this.puffAnchor.x + _e.x * ox + _v.x * oz, pos.y - this.puffAnchor.y + _e.y * ox + _v.y * oz, pos.z - this.puffAnchor.z + _e.z * ox + _v.z * oz);
      const s = speed * (0.4 + Math.random() * 0.9), u = up * (0.5 + Math.random());
      let vx = _e.x * Math.cos(a) * s + _v.x * Math.sin(a) * s + _n.x * u, vy = _e.y * Math.cos(a) * s + _v.y * Math.sin(a) * s + _n.y * u, vz = _e.z * Math.cos(a) * s + _v.z * Math.sin(a) * s + _n.z * u;
      if (o.dir) { vx += o.dir.x; vy += o.dir.y; vz += o.dir.z; }
      this.pVel.setXYZ(k, vx, vy, vz);
      this.pInfo.setXYZW(k, this.time, life * (0.7 + Math.random() * 0.6), size * (0.6 + Math.random() * 0.8), o.tone || 0);
    }
    this.pStart.needsUpdate = true; this.pVel.needsUpdate = true; this.pInfo.needsUpdate = true;
  }

  // ---------------------------------------------------------------------------------------
  _initMarks(n) {
    this.markN = n;
    const mk = (kind, w, l, n) => {
      const geo = new THREE.PlaneGeometry(w, l);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x1c0d06, alphaMap: markTexture(kind), transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
      const m = new THREE.InstancedMesh(geo, mat, n);
      m.count = 0; m.frustumCulled = false; m.renderOrder = 2;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.scene.add(m);
      return { mesh: m, n, i: 0, used: 0, world: new Float64Array(n * 3), quat: new Float32Array(n * 4), anchor: new THREE.Vector3() };
    };
    this.boots = mk('boot', 0.17, 0.36, n);
    // (short marks, twice as many: a mark is flat, and one 0.9 m long bridged the sand's ripples, its middle under
    // each crest, so a track showed as dashes)
    this.tyres = mk('tyre', 0.50, 0.48, n * 2);
  }

  /** Press a mark into the ground. `forward` is the direction of travel (world). */
  /** Press a mark into the ground at `pos`, heading `forward`. `up` is the ground's own normal there, when the
   *  caller knows it: a mark laid level on a slope or across a ripple is half buried, and a track shows as dashes. */
  mark(kind, pos, forward, up) {
    const set = kind === 'boot' ? this.boots : this.tyres;
    const k = set.i; set.i = (set.i + 1) % set.n; set.used = Math.min(set.n, set.used + 1);
    if (up) _n.copy(up); else _n.copy(pos).normalize();
    _q.setFromUnitVectors(_y, _n);
    // heading within the tangent plane
    _e.copy(forward).addScaledVector(_n, -forward.dot(_n)).normalize();
    _v.set(0, 0, -1).applyQuaternion(_q);
    let ang = Math.atan2(_v.clone().cross(_e).dot(_n), _v.dot(_e));
    _q2.setFromAxisAngle(_y, ang);
    _q.multiply(_q2);
    set.world[k * 3] = pos.x; set.world[k * 3 + 1] = pos.y; set.world[k * 3 + 2] = pos.z;
    set.quat[k * 4] = _q.x; set.quat[k * 4 + 1] = _q.y; set.quat[k * 4 + 2] = _q.z; set.quat[k * 4 + 3] = _q.w;
    if (set.used === 1 || _v.set(pos.x, pos.y, pos.z).distanceToSquared(set.anchor) > 300 * 300) this._reanchor(set, pos);
    else this._write(set, k);
    set.mesh.count = set.used;
    set.mesh.instanceMatrix.needsUpdate = true;
  }
  _write(set, k) {
    _v.set(set.world[k * 3] - set.anchor.x, set.world[k * 3 + 1] - set.anchor.y, set.world[k * 3 + 2] - set.anchor.z);
    // lift a hair off the surface along the normal
    _n.set(set.world[k * 3], set.world[k * 3 + 1], set.world[k * 3 + 2]).normalize();
    _v.addScaledVector(_n, 0.025);
    _q.set(set.quat[k * 4], set.quat[k * 4 + 1], set.quat[k * 4 + 2], set.quat[k * 4 + 3]);
    _m.compose(_v, _q, _s.set(1, 1, 1));
    set.mesh.setMatrixAt(k, _m);
  }
  _reanchor(set, pos) {
    set.anchor.copy(pos);
    set.mesh.position.copy(pos);
    for (let k = 0; k < set.used; k++) this._write(set, k);
  }

  // ---------------------------------------------------------------------------------------
  /**
   * @param {number} dt
   * @param {THREE.Camera} camera
   * @param {{storm:number, sunColor:THREE.Color, sunIntensity:number, ambient:THREE.Color, inside:boolean, pixelHeight:number}} p
   */
  update(dt, camera, p) {
    this.time += dt;
    const up = _n.copy(camera.position).normalize();
    // the wind blows roughly east, veering slowly
    _e.set(-up.z, 0, up.x).normalize();
    _v.crossVectors(up, _e);
    const veer = Math.sin(this.time * 0.013) * 0.6;
    const px = (p.pixelHeight || 720) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    // (dust is lit by what lights the ground: with a floor of a quarter it glowed at night, brighter than the sand it rose from)
    const lit = Math.min(1.6, 0.025 + p.sunIntensity * 0.32);
    const a = this.airU;
    // carry the dust along: the wind's speed rises with the storm. The totals wrap at a length
    // every mote's pace divides, so they stay small and exact however long the game runs.
    const WRAP = 700;
    _s.copy(_e).multiplyScalar(Math.cos(veer)).addScaledVector(_v, Math.sin(veer));
    this.drift.addScaledVector(_s, (1.5 + 24.5 * p.storm) * dt);
    this.drift.set(((this.drift.x % WRAP) + WRAP) % WRAP, ((this.drift.y % WRAP) + WRAP) % WRAP, ((this.drift.z % WRAP) + WRAP) % WRAP);
    this.fall = (this.fall + (0.15 + p.storm * 1.2) * dt) % WRAP;
    a.uFall.value = this.fall; a.uCam.value.copy(camera.position); a.uUp.value.copy(up);
    a.uStorm.value = p.storm; a.uPx.value = px;
    a.uAmount.value = p.inside ? 0 : Math.max(0, 1 - (camera.position.length() - R) / 900);
    a.uLight.value.setRGB(0.86 * lit + p.ambient.r * 0.4, 0.62 * lit + p.ambient.g * 0.4, 0.44 * lit + p.ambient.b * 0.4);
    this.air.visible = a.uAmount.value > 0.01;
    const st = this.streakU;
    this.streaks.visible = this.air.visible && p.storm > 0.25;
    st.uFall.value = this.fall; st.uCam.value.copy(camera.position); st.uUp.value.copy(up); st.uWind.value.copy(_s); st.uStorm.value = p.storm;
    // marks in the ground are as dark as the light lets them be: at night an unlit mark was paler than the ground round it
    { const k = Math.min(1, 0.05 + (p.sunIntensity || 0) / 2.6 + (p.ambient ? p.ambient.r : 0) * 0.9); for (const mk of [this.boots, this.tyres]) mk.mesh.material.color.setRGB(0.11 * k, 0.051 * k, 0.024 * k); }
    st.uLight.value.copy(a.uLight.value); st.uLight.value.r *= 0.74; st.uLight.value.g *= 0.60; st.uLight.value.b *= 0.46;      // dust-coloured, never white
    const sh = this.sheetU;
    this.sheets.visible = this.air.visible && p.storm > 0.32;
    sh.uCam.value.copy(camera.position); sh.uUp.value.copy(up); sh.uStorm.value = p.storm; sh.uTime.value = this.time;
    sh.uCamH.value = Math.min(40, Math.max(0.5, p.camHeight === undefined ? 2 : p.camHeight));
    sh.uLight.value.copy(a.uLight.value);
    const u = this.puffU;
    u.uTime.value = this.time; u.uUp.value.copy(up); u.uPx.value = px;
    u.uLight.value.setRGB(lit * 0.75 + p.ambient.r * 0.8, lit * 0.72 + p.ambient.g * 0.8, lit * 0.7 + p.ambient.b * 0.8);
  }
}
