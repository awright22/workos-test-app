/*
 * The ground's material: a physically based surface whose colour comes from the real Viking
 * colour map of Mars (a cube map looked up by direction from the planet's centre) with
 * procedural detail on top: sand grain, pebbles and ripples at three scales, projected along
 * the world axes so it never swims or stretches, fading out with distance.
 */
import * as THREE from 'three';
import { gnoise3 } from '../core/math.js';

/** Tiling detail texture: RG = height gradient, B = height, A = sparse pebble mask. */
export function makeDetailTexture(size = 256, seed = 0) {
  const period = 8;                                  // lattice cells per tile (base octave)
  const hgt = new Float32Array(size * size);
  const peb = new Float32Array(size * size);
  const wrapNoise = (x, y, per, z) => {
    // periodic gradient noise via 4-corner blend of offset lookups
    const fx = x / per, fy = y / per;
    const a = gnoise3(x, y, z), b = gnoise3(x - per, y, z), c = gnoise3(x, y - per, z), d = gnoise3(x - per, y - per, z);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = (i / size) * period, y = (j / size) * period;
      let h = 0, amp = 0.5, f = 1;
      for (let o = 0; o < 5; o++) {
        h += wrapNoise(x * f, y * f, period * f, seed + o * 3.1) * amp;
        amp *= 0.55; f *= 2;
      }
      hgt[j * size + i] = h;
      const p = wrapNoise(x * 6, y * 6, period * 6, seed + 40.5);
      peb[j * size + i] = Math.max(0, p - 0.42) * 3.2;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const at = (i, j) => hgt[((j + size) % size) * size + ((i + size) % size)] + peb[((j + size) % size) * size + ((i + size) % size)] * 0.5;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const k = (j * size + i) * 4;
      const gx = (at(i + 1, j) - at(i - 1, j)) * size / 32, gy = (at(i, j + 1) - at(i, j - 1)) * size / 32;
      data[k] = Math.max(0, Math.min(255, 128 + gx * 127));
      data[k + 1] = Math.max(0, Math.min(255, 128 + gy * 127));
      data[k + 2] = Math.max(0, Math.min(255, 128 + hgt[j * size + i] * 200));
      data[k + 3] = Math.max(0, Math.min(255, peb[j * size + i] * 255));
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * @param {THREE.CubeTexture} albedoCube  real Mars colour, sRGB
 * @param {object} [o]
 * @param {boolean} [o.fine]  include the finest detail layer (off on low quality)
 */
export function makeTerrainMaterial(albedoCube, o = {}) {
  const detail = makeDetailTexture(o.detailSize || 256);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0 });
  mat.userData.uniforms = {
    uAlbedo: { value: albedoCube },
    uDetail: { value: detail },
    uDust: { value: 0 },                       // storm dusting 0..1 (brightens and flattens)
  };
  mat.defines = mat.defines || {};
  if (o.fine !== false) mat.defines.TERRAIN_FINE = '';
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aTex;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vTex = aTex;
        vPlanetPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vGeoNormal = normalize(normal);`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform samplerCube uAlbedo;
        uniform sampler2D uDetail;
        uniform float uDust;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;
        // one detail layer, projected along the three world axes and blended by the normal
        // returns: xyz = world-space height gradient, w = height (0..1); pebbles in 'peb'
        vec4 triLayer(vec3 p, vec3 w, float scale, out float peb) {
          vec4 tx = texture2D(uDetail, p.zy * scale);
          vec4 ty = texture2D(uDetail, p.xz * scale);
          vec4 tz = texture2D(uDetail, p.xy * scale);
          vec2 gx = tx.rg * 2.0 - 1.0, gy = ty.rg * 2.0 - 1.0, gz = tz.rg * 2.0 - 1.0;
          vec3 grad = w.x * vec3(0.0, gx.y, gx.x) + w.y * vec3(gy.x, 0.0, gy.y) + w.z * vec3(gz.x, gz.y, 0.0);
          peb = dot(w, vec3(tx.a, ty.a, tz.a));
          return vec4(grad, dot(w, vec3(tx.b, ty.b, tz.b)));
        }`)
      .replace('#include <map_fragment>', `
        vec3 pDir = normalize(vPlanetPos);
        vec3 geoN = normalize(vGeoNormal);
        float viewDist = length(vViewPosition);
        // real colour of this spot on Mars, graded from orbital imagery toward surface colour
        vec3 alb = textureCube(uAlbedo, pDir).rgb;
        float albLum = dot(alb, vec3(0.3, 0.55, 0.15));
        alb = mix(vec3(albLum), alb, 1.15) * vec3(1.16, 0.94, 0.77);
        float ice = smoothstep(0.50, 0.72, albLum) * smoothstep(0.80, 0.95, abs(pDir.y));
        float slope = 1.0 - clamp(dot(geoN, pDir), 0.0, 1.0);
        vec3 tw = pow(abs(geoN), vec3(4.0));
        tw /= (tw.x + tw.y + tw.z);
        float peb0, peb1, peb2;
        float fMid = 1.0 - smoothstep(60.0, 260.0, viewDist);
        float fFar = 1.0 - smoothstep(500.0, 2200.0, viewDist);
        vec4 dFar = triLayer(vTex, tw, 1.0 / 32.0, peb2);
        vec4 dMid = triLayer(vTex, tw, 1.0 / 4.0, peb1);
        vec3 grad = dFar.xyz * 0.9 * fFar + dMid.xyz * 0.7 * fMid;
        float hgt = (dFar.w - 0.5) * fFar + (dMid.w - 0.5) * 0.6 * fMid;
        float pebbles = peb1 * fMid;
        #ifdef TERRAIN_FINE
          float fFine = 1.0 - smoothstep(6.0, 28.0, viewDist);
          vec4 dFine = triLayer(vTex, tw, 2.0, peb0);
          grad += dFine.xyz * 0.55 * fFine;
          hgt += (dFine.w - 0.5) * 0.35 * fFine;
          pebbles = max(pebbles, peb0 * fFine);
        #endif
        // rock shows through where it is steep; dust settles where it is flat
        float rock = smoothstep(0.10, 0.42, slope + hgt * 0.12);
        vec3 rockCol = alb * vec3(0.55, 0.50, 0.50);
        vec3 col = mix(alb, rockCol, rock * 0.75);
        col *= 1.0 + hgt * 0.30;
        col = mix(col, col * vec3(0.50, 0.44, 0.42), clamp(pebbles, 0.0, 1.0) * 0.8);
        col = mix(col, vec3(0.80, 0.84, 0.90), ice);
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        diffuseColor.rgb = col;
        float terrainRough = mix(0.97, 0.88, rock) - ice * 0.5;
        vec3 terrainGrad = grad * (1.0 - ice * 0.6);`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = clamp(terrainRough, 0.05, 1.0);`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        {
          vec3 wn = geoN;
          vec3 gT = terrainGrad - wn * dot(terrainGrad, wn);
          wn = normalize(wn - gT * 1.35);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`);
  };
  mat.customProgramCacheKey = () => 'terrain' + (o.fine !== false ? 'F' : '');
  return mat;
}
