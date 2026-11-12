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
import { Sky } from './sky.js';
import { clamp, lerp, damp } from '../core/math.js';

export const QUALITY = {
  low:    { scale: 0.6, msaa: 0, shadow: 1024, shadowRange: 45, bloom: false, grid: 24, maxLevel: 8, split: 1.0, fine: false, workers: 2, rocks: 0.5 },
  medium: { scale: 0.8, msaa: 2, shadow: 2048, shadowRange: 60, bloom: true, grid: 32, maxLevel: 8, split: 1.15, fine: true, workers: 2, rocks: 0.8 },
  high:   { scale: 1.0, msaa: 4, shadow: 2048, shadowRange: 75, bloom: true, grid: 32, maxLevel: 9, split: 1.3, fine: true, workers: 3, rocks: 1.0 },
  ultra:  { scale: 1.0, msaa: 4, shadow: 4096, shadowRange: 95, bloom: true, grid: 48, maxLevel: 9, split: 1.6, fine: true, workers: 4, rocks: 1.3 },
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

const _v = new THREE.Vector3(), _u = new THREE.Vector3(), _r = new THREE.Vector3(), _f = new THREE.Vector3();
const _m = new THREE.Matrix4();

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
    this.scene.fog = new THREE.FogExp2(0xc98a5b, 0.0012);

    this.sunDir = new THREE.Vector3(1, 0, 0);
    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.sun.castShadow = true;
    const sh = this.sun.shadow;
    sh.mapSize.set(this.q.shadow, this.q.shadow);
    sh.bias = -0.00035;
    sh.normalBias = 0.035;
    sh.radius = 2.2;
    this.scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    this.scene.add(this.hemi);

    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: this.q.msaa });
    this.composer = new EffectComposer(r, target);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    if (this.q.bloom) {
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.22, 0.55, 1.15);
      this.composer.addPass(this.bloom);
    }
    this.final = new FinalPass();
    this.composer.addPass(this.final);
    this.exposure = 1;
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
    this.sun.color.copy(sky.sunColor);
    this.sun.intensity = Math.max(sky.sunIntensity, 0.0);
    _u.copy(p.focus || cam.position).normalize();
    this._fitShadow(p.focus || cam.position, _u, night);
    this.hemi.color.copy(sky.ambientSky);
    this.hemi.groundColor.copy(sky.ambientGround);
    this.hemi.intensity = 1.0;
    // the hemisphere light's "up" must be the local up, not world +Y
    this.hemi.position.copy(_u);
    // fog: aerial perspective that matches the horizon; thins out with altitude
    const fog = this.scene.fog;
    fog.color.copy(sky.fogColor);
    const alt = Math.max(0, cam.position.length() - 12000);
    fog.density = (0.00085 + (p.dust || 0) * 0.011) * Math.exp(-alt / 500) + 0.0000015;
    // exposure: brighter at night and indoors, eased like an eye adapting
    const target = (p.inside ? 1.15 : lerp(3.2, 1.0, sky.day)) * (p.exposureBias || 1);
    this.exposure = lerp(this.exposure, target, damp(0.9, p.dt));
    const fu = this.final.uniforms;
    fu.uExposure.value = this.exposure;
    fu.uTime.value = this.time;
    // near/far follow altitude so depth precision is spent where the camera is
    cam.near = alt > 400 ? 2 : 0.12;
    cam.far = 60000;
  }

  _fitShadow(focus, up, night) {
    const range = this.q.shadowRange;
    const light = this.sun, cam = light.shadow.camera;
    // if the sun is below the horizon there is nothing to cast; park the shadow camera
    light.castShadow = !night;
    // light-space basis, texel-snapped so shadows do not shimmer as the focus moves
    _f.copy(this.sunDir).negate();                               // light travel direction
    _r.crossVectors(Math.abs(_f.y) > 0.95 ? _v.set(1, 0, 0) : _v.set(0, 1, 0), _f).normalize();
    _u.crossVectors(_f, _r).normalize();
    const texel = (2 * range) / light.shadow.mapSize.x;
    const cx = Math.round(focus.dot(_r) / texel) * texel, cy = Math.round(focus.dot(_u) / texel) * texel, cz = focus.dot(_f);
    _v.set(0, 0, 0).addScaledVector(_r, cx).addScaledVector(_u, cy).addScaledVector(_f, cz);
    light.target.position.copy(_v);
    light.position.copy(_v).addScaledVector(this.sunDir, 400);
    light.target.updateMatrixWorld();
    if (cam.right !== range) {
      cam.left = -range; cam.right = range; cam.top = range; cam.bottom = -range;
      cam.near = 10; cam.far = 800;
      cam.updateProjectionMatrix();
    }
  }

  render() { this.composer.render(); }

  info() {
    const i = this.renderer.info;
    return { calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, scale: +(this.q.scale * this.dynScale).toFixed(2) };
  }
}
