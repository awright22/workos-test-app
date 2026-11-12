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
  high:   { scale: 1.0, msaa: 4, shadow: 2048, shadowRange: 110, shadowSplit: 14, bloom: true, grid: 32, maxLevel: 9, split: 1.3, fine: true, workers: 3, rocks: 1.0, terrainShadowLevels: 1 },
  ultra:  { scale: 1.0, msaa: 4, shadow: 4096, shadowRange: 150, shadowSplit: 18, bloom: true, grid: 48, maxLevel: 9, split: 1.6, fine: true, workers: 4, rocks: 1.3, terrainShadowLevels: 2 },
};

const FINAL_FRAGMENT = /* glsl */`
  #include <common>
  #include <tonemapping_pars_fragment>
  uniform sampler2D tDiffuse;
  uniform float uExposure, uTime, uVignette, uGrain, uSaturation, uDanger, uCold, uFade;
  uniform vec3 uTint;
  varying vec2 vUv;
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  void main() {
    vec3 col = texture2D(tDiffuse, vUv).rgb * uExposure;
    // scene-referred grade
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(lum), col, uSaturation) * uTint;
    col = ACESFilmicToneMapping(col / toneMappingExposure);
    // display-referred finishing
    vec2 q = vUv - 0.5;
    float r2 = dot(q, q);
    col *= 1.0 - uVignette * smoothstep(0.10, 0.75, r2);
    col = mix(col, vec3(0.45, 0.02, 0.0) * (0.4 + lum), uDanger * smoothstep(0.08, 0.55, r2));
    col = mix(col, vec3(0.55, 0.75, 1.0), uCold * smoothstep(0.16, 0.62, r2) * 0.55);
    col = sRGBTransferOETF(vec4(col, 1.0)).rgb;
    float n = hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5;
    col += n * (uGrain + 1.0 / 255.0);
    col *= 1.0 - uFade;
    gl_FragColor = vec4(col, 1.0);
  }`;

class FinalPass extends Pass {
  constructor() {
    super();
    this.uniforms = {
      tDiffuse: { value: null }, uExposure: { value: 1 }, uTime: { value: 0 }, uVignette: { value: 0.32 },
      uGrain: { value: 0.018 }, uSaturation: { value: 1.06 }, uTint: { value: new THREE.Vector3(1, 1, 1) },
      uDanger: { value: 0 }, uCold: { value: 0 }, uFade: { value: 0 },
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
    sh.bias = -0.0002;
    sh.normalBias = 0.022;
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
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.17, 0.32, 1.35);
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

  /** Lower or raise the render resolution to hold the frame rate (called with smoothed frame ms). */
  adaptResolution(frameMs, targetMs) {
    let s = this.dynScale;
    if (frameMs > targetMs * 1.18) s = Math.max(0.55, s - 0.05);
    else if (frameMs < targetMs * 0.82) s = Math.min(1, s + 0.03);
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
      this.sun.intensity = p.power === false ? 0.06 : 1.25;
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
    const nr = 0.115 + 0.10 * glow, ng = 0.14 + 0.13 * glow, nb = 0.215 + 0.22 * glow;
    const io = this.indoor;
    this.hemi.color.setRGB(lerp(nr, 0.50 * pw, io), lerp(ng, 0.46 * pw, io), lerp(nb, 0.40 * pw, io));
    this.hemi.groundColor.setRGB(lerp(0.02, 0.26 * pw, io), lerp(0.02, 0.24 * pw, io), lerp(0.03, 0.21 * pw, io));
    this.hemi.intensity = lerp(dusk * 1.6, 1, io);
    // the hemisphere light's "up" must be the local up, not world +Y
    this.hemi.position.copy(_u);
    this._updateEnvironment(p.dt || 0.016, p.dust || 0);
    this.scene.environmentIntensity = lerp(1.05, 0.12, this.indoor);
    // fog: aerial perspective that matches the horizon; thins out with altitude
    const fog = this.scene.fog;
    fog.color.copy(sky.fogColor);
    const alt = Math.max(0, cam.position.length() - 12000);
    const dust = p.dust || 0;
    // a full storm closes visibility to a few tens of metres
    fog.density = (0.00085 + 0.006 * dust + 0.031 * dust * dust) * Math.exp(-alt / 500) + 0.0000015;
    // exposure, eased like an eye adapting: opened up as the sun sinks (the ground gets little
    // light at a low angle), wider still at night, and steady indoors
    // ... and metered like a camera: stopped down when it looks into a low sun, and under a high one
    const lowSun = 1 - smoothstep(0.03, 0.55, sky.sunE);
    const facing = Math.max(0, _v.set(0, 0, -1).applyQuaternion(cam.quaternion).dot(this.sunDir));
    const intoSun = smoothstep(0.35, 0.95, facing) * smoothstep(-0.12, 0.05, sky.sunE);
    const dayExposure = lerp(1.0, 0.88, smoothstep(0.62, 1.0, sky.sunE)) * (1 + 0.5 * lowSun * (1 - 0.9 * intoSun));
    const target = (p.inside ? 0.95 : lerp(2.3 * (1 - 0.45 * intoSun), dayExposure, sky.day)) * (p.exposureBias || 1);
    this.exposure = this.snapLight > 0 ? target : lerp(this.exposure, target, damp(0.9, p.dt));
    if (this.snapLight > 0) this.snapLight--;
    const fu = this.final.uniforms;
    fu.uExposure.value = this.exposure;
    fu.uTime.value = this.time;
    // near/far follow altitude so depth precision is spent where the camera is
    cam.near = alt > 400 ? 2 : 0.12;
    cam.far = 60000;
  }

  _updateEnvironment(dt, dust) {
    const e = this.env, sky = this.sky;
    e.age += dt;
    const up = sky.uniforms.uUp.value;
    const moved = Math.abs(sky.sunE - e.sunE) > 0.012 || Math.abs(dust - e.dust) > 0.04 || up.distanceToSquared(e.up) > 0.0004;
    if (e.target && !(this.snapLight > 0 && moved) && (!moved || e.age < 1.2)) return;
    e.sunE = sky.sunE; e.dust = dust; e.up.copy(up); e.age = 0;
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
