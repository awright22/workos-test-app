/*
 * Renderer, scene, camera, sun and sky light, shadows and the post-processing chain.
 *
 * The scene is lit in linear, scene-referred light: the sun is a few units bright and the sun's
 * disc is far brighter, so highlights bloom naturally; one final pass exposes, tone-maps,
 * grades, vignettes and dithers the picture.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { SunLight } from 'three/addons/lights/SunLight.js';
import { Sky } from './sky.js';
import { SunShadow } from './sun-shadow.js';
import { clamp, lerp, damp, smoothstep } from '../core/math.js';

export const QUALITY = {
  low:    { scale: 0.6, msaa: 0, shadow: 1024, shadowRange: 30, shadowSplit: 10, bloom: false, grid: 24, maxLevel: 8, split: 1.0, fine: false, workers: 2, rocks: 0.5, terrainShadowLevels: 0 },
  medium: { scale: 0.8, msaa: 2, shadow: 2048, shadowRange: 80, shadowSplit: 13, bloom: true, grid: 32, maxLevel: 8, split: 1.15, fine: true, workers: 2, rocks: 0.8, terrainShadowLevels: 0 },
  high:   { scale: 1.0, msaa: 4, shadow: 2048, shadowRange: 110, shadowSplit: 14, bloom: true, grid: 32, maxLevel: 9, split: 1.3, fine: true, workers: 3, rocks: 1.0, terrainShadowLevels: 0 },
  ultra:  { scale: 1.0, msaa: 4, shadow: 4096, shadowRange: 150, shadowSplit: 18, bloom: true, grid: 48, maxLevel: 9, split: 1.6, fine: true, workers: 4, rocks: 1.3, terrainShadowLevels: 1 },
};

const FINAL_FRAGMENT = /* glsl */`
  #include <common>
  #include <tonemapping_pars_fragment>
  uniform sampler2D tDiffuse;
  uniform float uExposure, uTime, uVignette, uGrain, uSaturation, uDanger, uCold, uFade, uContrast, uMono, uVeil;
  uniform vec3 uTint, uVeilCol;
  uniform vec2 uVeilDir;
  uniform vec4 uHero;
  uniform float uAspect;
  varying vec2 vUv;
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  void main() {
    vec3 col = texture2D(tDiffuse, vUv).rgb;
    // A dust storm is between the eye and everything, the nearest things too: sheets of it blow across the
    // visor, thicker and thinner, and the whole frame dims and clears with the gusts. (Fog alone leaves a man
    // five metres off as crisp as on a clear day.)
    if (uVeil > 0.002) {
      // Along the wind and across it, on the screen. Dust at three depths streams past: the far murk slowly, sheets
      // nearer by faster, and ragged streamers whipping across the visor, thickest low down where the sand runs
      // along the ground. Each is drawn out along the wind, and the dense ones are paler than the murk behind
      // them, lit from within, so the storm has a grain and a direction even in a still frame.
      vec2 wq = vec2(dot(vUv - 0.5, uVeilDir) * 1.78, dot(vUv - 0.5, vec2(-uVeilDir.y, uVeilDir.x)));
      float gust = 0.6 + 0.4 * sin(uTime * 0.8 + vn(vec2(uTime * 0.17, 3.0)) * 6.0);
      float far = vn(vec2(wq.x * 0.9 - uTime * 0.22, wq.y * 3.2 + 1.7));
      float mid = vn(vec2(wq.x * 1.6 - uTime * 0.7, wq.y * 9.0 + vn(vec2(wq.x * 2.0 - uTime * 0.5, 4.0)) * 1.4));
      float near = vn(vec2(wq.x * 2.4 - uTime * 2.1, wq.y * 26.0 + vn(vec2(wq.x * 3.0 - uTime * 1.6, 9.0)) * 2.5));
      // Grit. The bands are sand, and sand blows in threads: fine across the wind, long along it, faster than the
      // band they are in, and they tear its edge. (Without them each band was a smooth ribbon with a clean edge,
      // like silk under water, and a still frame of a storm had no grain in it.)
      float thread = vn(vec2(wq.x * 9.0 - uTime * 4.3, wq.y * 140.0)) * 0.6 + vn(vec2(wq.x * 21.0 - uTime * 7.9, wq.y * 310.0 + 5.0)) * 0.4;
      mid += (thread - 0.5) * 0.30;
      near += (thread - 0.5) * 0.50;
      // (the streamers nearest the eye are the ones that say "wind": sharp-edged, and whipping past twice as fast)
      near = smoothstep(0.38, 0.78, near) * (0.5 + 0.5 * smoothstep(0.85, 0.1, vUv.y));
      float sheet = far * 0.40 + mid * 0.34 + near * 0.42;
      float thick = smoothstep(0.42, 0.8, mid * 0.55 + near * 0.6);
      // The veil is drawn over the whole picture, but the man is five metres from the eye and the Hab fifty: there is
      // little dust between the eye and him. So it thins over where he stands, and its streamers pass behind him.
      // (Drawn across him at full strength they were stripes on his legs.)
      vec2 hd = (vUv - uHero.xy) * vec2(uAspect, 0.52) / max(uHero.z, 0.001);
      float clearHere = uHero.w * (1.0 - smoothstep(0.55, 1.25, length(hd)));
      col = mix(col, uVeilCol * (0.84 + 0.42 * thick), uVeil * (0.16 + 0.5 * smoothstep(0.28, 0.72, sheet) * gust) * (0.80 + 0.40 * thread) * (1.0 - 0.72 * clearHere));
      // ... and grains caught by the light as they pass the visor: a flicker of specks, thickest where the dust is
      float speck = hash12(floor(gl_FragCoord.xy * 0.5) + floor(uTime * 30.0) * 7.3);
      col += uVeilCol * (smoothstep(0.965, 1.0, speck) * 0.16 * uVeil * (0.4 + 0.6 * thick));
    }
    col *= uExposure;
    // scene-referred grade
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(lum), col, uSaturation) * uTint;
    col = ACESFilmicToneMapping(col / toneMappingExposure);
    // display-referred finishing
    vec2 q = vUv - 0.5;
    float r2 = dot(q, q);
    col *= 1.0 - uVignette * smoothstep(0.10, 0.75, r2);
    col = mix(col, vec3(0.45, 0.02, 0.0) * (0.4 + lum), uDanger * smoothstep(0.08, 0.55, r2));
    // deep cold frosts the edge of the visor: a cold cast on what is there, never a pale veil over it
    col = mix(col, col * vec3(0.72, 0.92, 1.3) + vec3(0.006, 0.012, 0.022), uCold * smoothstep(0.26, 0.78, r2));
    col = sRGBTransferOETF(vec4(col, 1.0)).rgb;
    // a look (photo mode): contrast about middle grey, and black and white
    col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0);
    col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), uMono);
    float n = hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5;
    col += n * (uGrain + 1.0 / 255.0);
    col *= 1.0 - uFade;
    gl_FragColor = vec4(col, 1.0);
  }`;

class CeilingPass extends Pass {
  constructor(cap) {
    super();
    this.material = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uCap: { value: cap } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float uCap; varying vec2 vUv; void main() { vec4 c = texture2D(tDiffuse, vUv); float m = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c.rgb * (m > uCap ? uCap / m : 1.0), c.a); }',
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    if (this.renderToScreen) renderer.setRenderTarget(null); else renderer.setRenderTarget(writeBuffer);
    this.quad.render(renderer);
  }
  dispose() { this.material.dispose(); this.quad.dispose(); }
}

class FinalPass extends Pass {
  constructor() {
    super();
    this.uniforms = {
      tDiffuse: { value: null }, uExposure: { value: 1 }, uTime: { value: 0 }, uVignette: { value: 0.32 },
      uGrain: { value: 0.018 }, uSaturation: { value: 1.06 }, uTint: { value: new THREE.Vector3(1, 1, 1) },
      uDanger: { value: 0 }, uCold: { value: 0 }, uFade: { value: 0 }, uContrast: { value: 1 }, uMono: { value: 0 },
      uVeil: { value: 0 }, uVeilCol: { value: new THREE.Color() }, uVeilDir: { value: new THREE.Vector2(1, 0.12) }, uHero: { value: new THREE.Vector4(0.5, 0.4, 0.1, 0) }, uAspect: { value: 1.8 },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FINAL_FRAGMENT,
      depthTest: false, depthWrite: false, toneMapped: false,
    });
    this.quad = new FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer, readBuffer) {
    this.uniforms.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.quad.render(renderer);
  }
  dispose() { this.material.dispose(); this.quad.dispose(); }
}

const _v = new THREE.Vector3(), _u = new THREE.Vector3();

export class Engine {
  constructor(container, qualityName) {
    this.qualityName = qualityName;
    this.q = QUALITY[qualityName] || QUALITY.medium;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false, alpha: false });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NoToneMapping;          // the final pass tone-maps
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.className = 'mg-three';
    container.insertBefore(r.domElement, container.firstChild);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dynScale = 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.12, 60000);
    this.scene.add(this.camera);
    this.sky = new Sky();
    this.scene.add(this.sky.mesh);
    // the sky is the first thing drawn in the main pass: whatever was drawn before it was shadow maps
    this.sky.mesh.onBeforeRender = () => { const i = this.renderer.info.render; if (!this._shadowMark) this._shadowMark = { calls: i.calls, triangles: i.triangles }; };
    this.scene.fog = new THREE.FogExp2(0xc98a5b, 0.0012);
    // The fog shader wants one number more than a density: where the horizon line is (see airHaze). The renderer
    // hands every fogged material the fog's `near` and `far` if the fog says it is of the linear kind, so this one
    // says it is both kinds: `near` carries the density and `far` the horizon's dip, and nothing is linear.
    this.scene.fog.isFog = true;
    Object.defineProperty(this.scene.fog, 'near', { get() { return this.density; } });
    this.scene.fog.far = 0;
    airHaze();

    this.sunDir = new THREE.Vector3(1, 0, 0);
    // the sun casts two shadow cascades: a tight one around the camera, a wide one for the base
    this.sun = new SunLight(0xffffff, 3);
    this.sun.shadow.dispose();
    const sh = this.sun.shadow = new SunShadow();
    this.sun.castShadow = true;
    sh.mapSize.set(this.q.shadow, this.q.shadow);
    sh.camera.near = 1;
    sh.camera.far = this.q.shadowRange;
    sh.split = this.q.shadowSplit;
    // (a depth bias pushes a shadow away from its caster along the light: under a sun two degrees up, a few
    // centimetres of it left a man's shadow starting metres from his boots. Most of the bias is along the normal.)
    sh.bias = -0.00005;
    sh.normalBias = 0.03;
    sh.radius = 1.6;
    this.scene.add(this.sun);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    this.scene.add(this.hemi);

    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: this.q.msaa });
    this.composer = new EffectComposer(r, target);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    if (this.q.bloom) {
      // a ceiling on what reaches the bloom: one blown surface (a lamp on white a metre away, a glint, an
      // emitter) would otherwise spread into a white blob many times its size
      this.composer.addPass(new CeilingPass(7.0));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.14, 0.3, 1.5);
      this.composer.addPass(this.bloom);
    }
    this.final = new FinalPass();
    this.composer.addPass(this.final);
    // Image-based light: the sky dome and a lit ground, re-captured when the light changes.
    // It gives metal, glass and the gold visor something to reflect, and soft sky light.
    this.pmrem = new THREE.PMREMGenerator(r);
    this.envScene = new THREE.Scene();
    this.envSky = new THREE.Mesh(this.sky.mesh.geometry, this.sky.mesh.material);
    this.envSky.frustumCulled = false;
    this.envGround = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({ color: 0x804020, side: THREE.BackSide, fog: false, toneMapped: false }));
    this.envScene.add(this.envSky, this.envGround);
    this.env = { target: null, sunE: 9, dust: 9, up: new THREE.Vector3(), age: 9 };
    this.exposure = 1;
    this.snapLight = 3;               // frames for which exposure jumps straight to its target (start-up, teleports, tests)
    this.time = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const ratio = this.dpr * this.q.scale * this.dynScale;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.baseFov = clamp(2 * Math.atan(Math.tan((88 * Math.PI) / 360) / this.camera.aspect) * 180 / Math.PI, 46, 66);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Lower or raise the render resolution to hold the frame rate (called about once a second with that second's
   * average frame time).
   *
   * Down is easy to see: frames are late. Up is not: a screen that refreshes sixty times a second never shows a
   * frame time under 16.7 ms however much the GPU has in hand, so "faster than the target" cannot be the test.
   * (It was. The first busy second after loading took the resolution down and nothing could bring it back: the
   * owner's iPhone sat at sixty frames a second, drawing 1192 pixels across on a 2796-pixel screen.) So after a run
   * of seconds with nothing late, a step up is tried. If it holds, the next try comes as soon; if it brings late
   * frames, it is undone and the wait before the next try doubles, up to about a minute.
   */
  adaptResolution(frameMs, targetMs) {
    let s = this.dynScale;
    const a = this._adapt || (this._adapt = { calm: 0, wait: 4, trial: 0 });
    if (frameMs > targetMs * 1.18) {
      s = Math.max(0.55, s - 0.05);
      if (a.trial > 0) a.wait = Math.min(64, a.wait * 2);
      a.calm = 0; a.trial = 0;
    } else if (frameMs < targetMs * 0.82) {
      s = Math.min(1, s + 0.03);                  // (a faster screen, or no vertical sync: there is room, plainly)
      a.calm = 0;
    } else if (frameMs <= targetMs * 1.08) {
      if (a.trial > 0 && --a.trial === 0) a.wait = 4;
      if (++a.calm >= a.wait && s < 1) { s = Math.min(1, s + 0.05); a.calm = 0; a.trial = 3; }
    } else a.calm = 0;
    if (Math.abs(s - this.dynScale) > 0.001) { this.dynScale = s; this.resize(); }
  }

  /**
   * Per-frame lighting. `focus` is what the shadows should cover (the player or the rover).
   * @param {object} p  { dt, dust, inside, focus: Vector3, exposureBias }
   */
  update(p) {
    const cam = this.camera, sky = this.sky;
    this.time += p.dt;
    sky.update(this.sunDir, cam.position, p.dust || 0, this.time);
    // the sun; at night a faint cool key from the same direction mirrored keeps shapes readable
    const night = sky.sunIntensity < 0.02;
    _u.copy(p.focus || cam.position).normalize();
    const sh = this.sun.shadow;
    if (p.sealed) {
      // sealed in the Hab: the shadowed light becomes the room's ceiling light, straight down from
      // under the roof, so people and furniture stand on the floor instead of floating over it
      this.sun.color.setRGB(1.0, 0.93, 0.82);
      // (a little under what would light the room evenly: the fittings then make pools, and the corners fall away)
      // (and now well under: the ceiling's own fittings are point lights with real pools under them, and this even
      // light from above is only what the room bounces back. At 2.5 it was the whole picture and the floor was one tone.)
      // (and a little less again now that each fitting has a pool drawn under it: the floor between them falls back)
      this.sun.intensity = p.power === false ? 0.06 : 0.95;
      this.sun.position.copy(_u);
      sh.roof = p.roof || null; sh.radius = 3.0; sh.autoUpdate = true;
    } else {
      this.sun.color.copy(sky.sunColor);
      this.sun.intensity = Math.max(sky.sunIntensity, 0.0);
      // the light shines from its position toward the origin; with no sun there is nothing to cast
      this.sun.position.copy(this.sunDir);
      sh.roof = null; sh.radius = 1.6; sh.autoUpdate = !night;
    }
    this.sun.updateMatrixWorld();
    // indoors the sky cannot reach: the room is lit by its own lamps
    this.indoor = lerp(this.indoor || 0, p.inside ? 1 : 0, damp(0.35, p.dt || 0.016));
    const pw = p.power === false ? 0.08 : 1;
    // one soft fill light: the room's bounce indoors; outdoors, starlight and the after-glow, so
    // the ground keeps its shape at night instead of going black
    const dusk = 1 - sky.day, glow = smoothstep(-0.34, -0.02, sky.sunE) * dusk;
    const nr = 0.08 + 0.10 * glow, ng = 0.10 + 0.13 * glow, nb = 0.16 + 0.22 * glow;
    const io = this.indoor;
    this.hemi.color.setRGB(lerp(nr, 0.50 * pw, io), lerp(ng, 0.46 * pw, io), lerp(nb, 0.40 * pw, io));
    this.hemi.groundColor.setRGB(lerp(0.02, 0.26 * pw, io), lerp(0.02, 0.24 * pw, io), lerp(0.03, 0.21 * pw, io));
    this.hemi.intensity = lerp(dusk * 1.6, p.sealed ? 0.3 : 1, io);      // (little fill when sealed in: the lamps make the room, and what they do not reach is dim)
    // the hemisphere light's "up" must be the local up, not world +Y
    this.hemi.position.copy(_u);
    this._updateEnvironment(p.dt || 0.016, p.dust || 0);
    // (more of the light is the sky's under a low sun: it fills level ground and shade alike)
    this.scene.environmentIntensity = lerp(1.05 * (1 + 1.3 * (sky.lowSun || 0)), 0.12, this.indoor);
    // fog: aerial perspective that matches the horizon; thins out with altitude
    const fog = this.scene.fog;
    fog.color.copy(sky.fogColor);
    const alt = Math.max(0, cam.position.length() - 12000);
    const dust = p.dust || 0;
    // a full storm closes visibility to a few tens of metres
    // ... and it comes in gusts: the murk thickens and thins every few seconds
    const gust = 1 + dust * (0.22 * Math.sin(this.time * 0.9) + 0.14 * Math.sin(this.time * 2.3 + 1.7) + 0.08 * Math.sin(this.time * 5.1));
    // (how the dust thins with height is in the shader, see airHaze: this is the haze at the datum; from orbit it goes)
    // (On Mars a clear day's dust dims things by a third over thirty kilometres. At this planet's scale that is a hundred
    // metres or so: the haze was a third of what the scale asks, and a flat plain's horizon was a ruler's edge.)
    fog.density = (0.0019 + 0.006 * dust + 0.034 * dust * dust) * gust * Math.exp(-Math.max(0, alt - 600) / 500) + 0.0000015;
    // exposure, eased like an eye adapting: opened up as the sun sinks (the ground gets little
    // light at a low angle), wider still at night, and steady indoors
    // ... and metered like a camera: stopped down when it looks into a low sun, and under a high one
    const lowSun = 1 - smoothstep(0.03, 0.55, sky.sunE);
    const facing = Math.max(0, _v.set(0, 0, -1).applyQuaternion(cam.quaternion).dot(this.sunDir));
    const intoSun = smoothstep(0.35, 0.95, facing) * smoothstep(-0.12, 0.05, sky.sunE);
    // (a high sun flattens everything: close down further toward noon, or the ground washes out to peach)
    // (and a camera with the sun in the frame stops down whatever the hour: the ground under it kept its exposure and bleached)
    // (stopped down less than it was when facing a setting sun: on a phone the whole lower half of `dusk` was near black)
    const dayExposure = lerp(1.0, 0.76, smoothstep(0.45, 0.95, sky.sunE)) * (1 + 0.5 * lowSun * (1 - 0.55 * intoSun)) * (1 - 0.2 * smoothstep(0.62, 0.98, facing) * (1 - 0.5 * lowSun));
    const target = (p.inside ? 0.95 : lerp(1.95 * (1 - 0.45 * intoSun), dayExposure, sky.day)) * (p.exposureBias || 1);
    this.exposure = this.snapLight > 0 ? target : lerp(this.exposure, target, damp(0.9, p.dt));
    if (this.snapLight > 0) this.snapLight--;
    const fu = this.final.uniforms;
    fu.uExposure.value = this.exposure;
    fu.uTime.value = this.time;
    // the storm's veil: the colour everything fades into, blown across the screen the way the wind goes
    fu.uVeil.value = p.inside ? 0 : smoothstep(0.3, 0.9, dust) * Math.exp(-alt / 500);
    fu.uVeilCol.value.copy(sky.fogColor);
    if (p.wind) { _v.copy(p.wind).transformDirection(cam.matrixWorldInverse); const l = Math.hypot(_v.x, _v.y); if (l > 0.2) fu.uVeilDir.value.set(_v.x / l, _v.y / l); }
    /** How much of the sky's fill light things men built take, out of doors: by day all of it, at night under half (white
     *  fabric under starlight was as bright as a lit porch). Indoors it is the room's own bounce and is left alone. */
    // (And by day less than all of it: white fabric in the shade stood out as bright as the lit sand beside it, as if
    // pasted on. Least under a low sun, when a man seen against the light should be a dark figure with a bright edge.)
    // (Under a low sun the lit sand is itself mostly sky-lit, and white cloth in full shade measured as bright as the
    // sand it stood on: so the fill falls to a third there. The rim light is the other half of the same picture.)
    // (At night a sixth: at a fifth the whole dome stood evenly pale with nothing to light it. And at midday under
    // two thirds, not four fifths: with the sun ahead, his shaded back measured as bright as the lit sand.)
    this.modelAmbient = lerp(lerp(0.17, lerp(0.32, 0.62, smoothstep(0.1, 0.65, sky.sunE)), sky.day), 1, io);
    // (the rim is strongest under a low sun, when the sun itself is weakest: at dawn and dusk a man against the light
    // had no edge at all)
    this.modelRim = (1 - io) * sky.day * (1 + 1.0 * (1 - smoothstep(0.08, 0.5, sky.sunE)));
    // near/far follow altitude so depth precision is spent where the camera is
    // (the projection must follow at once: the shadow cascades are fitted to it, and a stale one sizes them wrongly)
    const near = alt > 400 ? 2 : 0.12;
    if (cam.near !== near || cam.far !== 60000) { cam.near = near; cam.far = 60000; cam.updateProjectionMatrix(); }
    cam.far = 60000;
  }

  _updateEnvironment(dt, dust) {
    const e = this.env, sky = this.sky;
    e.age += dt;
    const up = sky.uniforms.uUp.value;
    // (and when the camera has climbed: the sky it stands under thins with height, and from orbit is black)
    const moved = Math.abs(sky.sunE - e.sunE) > 0.012 || Math.abs(dust - e.dust) > 0.04 || up.distanceToSquared(e.up) > 0.0004 || Math.abs((sky.space || 0) - (e.space || 0)) > 0.06;
    if (e.target && !(this.snapLight > 0 && moved) && (!moved || e.age < 1.2)) return;
    e.sunE = sky.sunE; e.dust = dust; e.up.copy(up); e.age = 0; e.space = sky.space || 0;
    // the ground as the sky sees it: sunlit regolith plus the sky's own light bounced back
    const lit = (sky.sunIntensity * Math.max(sky.sunE, 0)) / Math.PI;
    this.envGround.material.color.setRGB(
      0.42 * (lit * sky.sunColor.r + sky.ambientSky.r * 0.6),
      0.21 * (lit * sky.sunColor.g + sky.ambientSky.g * 0.6),
      0.11 * (lit * sky.sunColor.b + sky.ambientSky.b * 0.6));
    this.envGround.quaternion.setFromUnitVectors(_v.set(0, 1, 0), up);
    const disc = sky.uniforms.uSunDisc.value;
    sky.uniforms.uSunDisc.value = 0.25;                 // a softened sun: no fireflies in rough reflections
    const old = e.target;
    e.target = this.pmrem.fromScene(this.envScene, 0, 0.1, 100, { size: this.q.scale < 0.7 ? 64 : 128 });
    sky.uniforms.uSunDisc.value = disc;
    this.scene.environment = e.target.texture;
    if (old) old.dispose();
  }

  render() {
    const info = this.renderer.info;
    info.autoReset = false;
    info.reset();
    this._shadowMark = null;
    this.composer.render();
    const s = this._shadowMark || { calls: 0, triangles: 0 };
    this.frameStats = { calls: info.render.calls, triangles: info.render.triangles, shadowCalls: s.calls, shadowTriangles: s.triangles };
  }

  info() {
    const i = this.renderer.info;
    const f = this.frameStats || { calls: 0, triangles: 0 };
    return { calls: f.calls, triangles: f.triangles, shadowCalls: f.shadowCalls, shadowTriangles: f.shadowTriangles, geometries: i.memory.geometries, textures: i.memory.textures, scale: +(this.q.scale * this.dynScale).toFixed(2) };
  }
}

/**
 * Dust hangs low. The haze along a line of sight is that of the air it passes through: thick looking
 * down into a canyon five kilometres deep, thin from the top of a volcano that stands above most of
 * the atmosphere. three.js's fog knows only distance, so its shader chunks are replaced (for every
 * material at once) with ones that also know how high the camera and the thing seen are, and weight
 * the density by the mean of the two. The scale height is 180 world metres (about 13 km of real relief).
 */
let hazed = false;
function airHaze() {
  if (hazed) return;
  hazed = true;
  const C = THREE.ShaderChunk;
  // The horizon. On a planet twelve kilometres across it is two hundred metres off, too near for any honest haze to
  // have softened it: a plain ended in a ruler's edge with boulders standing on it. So there is a layer of haze at eye
  // level in the distance. Whatever is seen within a degree or so of the horizon line, well out, fades toward the
  // sky: the last of a plain melts away, a far hill stands in haze to its knees, and the rocks and buildings out
  // there fade with the ground they stand on, because the rule knows only where a point is seen, not what it is.
  // (fogNear is the density and fogFar the horizon's dip below level, in radians: see where the fog is made.)
  C.fog_pars_vertex = `#ifdef USE_FOG
    varying float vFogDepth;
    varying float vFogAlt;
    varying float vFogEl;
  #endif`;
  C.fog_vertex = `#ifdef USE_FOG
    vFogDepth = - mvPosition.z;
    vec3 fogTo = mvPosition.xyz * mat3(viewMatrix);
    vFogAlt = length(cameraPosition + fogTo) - 12000.0;
    vFogEl = dot(normalize(fogTo), normalize(cameraPosition));
  #endif`;
  C.fog_pars_fragment = `#ifdef USE_FOG
    uniform vec3 fogColor;
    varying float vFogDepth;
    varying float vFogAlt;
    varying float vFogEl;
    uniform float fogNear;
    uniform float fogFar;
  #endif`;
  C.fog_fragment = `#ifdef USE_FOG
    float fogHigh = length(cameraPosition) - 12000.0;
    // How thick the dust is along the line of sight: it thins with height (by e in a hundred and eighty metres), and
    // the line is summed through it exactly. (It was the mean of the two ends, which from seven hundred metres up
    // counted twice the dust there is: the rocket climbed over a featureless tan ball.)
    float fogHc = clamp(fogHigh, -150.0, 6000.0), fogHf = clamp(vFogAlt, -150.0, 900.0), fogDh = fogHc - fogHf;
    float fogAir = abs(fogDh) > 2.0 ? (exp(-fogHf / 180.0) - exp(-fogHc / 180.0)) * 180.0 / fogDh : exp(-fogHf / 180.0);
    // Looking down into a deep, there is more air in the way than the distance says: the dust hangs lowest in the
    // lowest ground. So what lies well below the eye is hazier than what is level with it, and a canyon seen from its
    // rim has a far floor, not a pit with its bottom as sharp as its lip. (Not from the air: from there all is below.)
    float fogBelow = smoothstep(18.0, 120.0, fogHigh - vFogAlt) * (1.0 - smoothstep(500.0, 2000.0, fogHigh));
    float fogDeep = 1.0 + 0.7 * fogBelow;
    float fogThick = fogNear * fogAir * fogDeep * vFogDepth;
    // (it gathers from the start and not all at once: with the square alone the ground was clear red to the first
    // ridge and cream beyond it, along one line)
    float fogFactor = 1.0 - exp(-(0.3 * fogThick + 0.8 * fogThick * fogThick));
    // (from sixty metres: on a plain that swells a little the skyline is a crest a hundred metres off, nearer than
    // the true horizon, and it stayed a ruler's edge with stones standing on it)
    // (what stands up from the horizon is in that haze too, to a dozen degrees above the line: boulders out there
    // stood dark and sharp on a horizon that had itself melted away)
    float fogLine = vFogEl - fogFar;
    float fogNearLine = fogLine > 0.0 ? 1.0 - smoothstep(0.05, 0.22, fogLine) : 1.0 - smoothstep(0.012, 0.05, -fogLine);
    float fogBand = fogNearLine * smoothstep(60.0, 170.0, vFogDepth) * 0.72 * (1.0 - smoothstep(1500.0, 9000.0, fogHigh));
// Near haze is the ground's own dust hanging over it, lit as the ground is: redder and darker than the sky at
    // the horizon, which is what far haze fades into. (One sky-pale colour at every distance lifted the middle
    // ground to cream a hundred metres off, and the land broke from red to cream along the first ridge.)
    vec3 fogTint = mix(fogColor * vec3(0.74, 0.56, 0.46), fogColor, smoothstep(160.0, 1400.0, vFogDepth));
    // (... but the air that fills a deep is the sky's own haze, pale and a little cool: it is what puts the far wall
    // and the floor of a canyon a long way off, on a planet where they are a few hundred metres away)
    fogTint = mix(fogTint, fogColor * vec3(0.95, 0.99, 1.06), 0.75 * fogBelow);
    gl_FragColor.rgb = mix(mix(gl_FragColor.rgb, fogTint, fogFactor), fogColor, fogBand);
  #endif`;
}
