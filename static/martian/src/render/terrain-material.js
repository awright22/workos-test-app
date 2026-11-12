/*
 * The ground's material.
 *
 * Colour starts from the real Viking colour map of Mars (a cube map looked up by direction from
 * the planet's centre) graded toward what a camera on the surface sees. Everything finer than
 * that map can show is layered on from two tiling 3D textures (see noise3d.js), each layer
 * fading out with distance:
 *
 *   far relief   8-64 m    shading for tiles too coarse to carry the relief as geometry
 *   undulation   1-8 m     drifts and hollows; darker, coarser sand collects in the hollows
 *   lumps        0.1-1 m   clods and scuffs
 *   grain        1-12 cm   the sand itself                        (not on "low")
 *   gravel       2-12 cm   scattered stones, in patches           (not on "low")
 *
 * Steep ground shows banded bedrock instead of dust, and bright ground near the poles is ice.
 */
import * as THREE from 'three';
import { DETAIL_FRAME } from '../planet/constants.js';
import { detailTextures } from './noise3d.js';

const F = (x) => x.toFixed(6);
/**
 * GLSL: turn the orbital colour map into the colour of the ground. The mosaic is stretched for
 * contrast (its bright dust is nearly white, its dark sand nearly black), so brightness is
 * compressed into the range real Martian soil reflects, and the hue is calmed and warmed toward
 * what cameras on the surface record. Bright and dark regions stay different, not extreme.
 */
export const GLSL_GROUND_GRADE = /* glsl */`
  vec3 groundGrade(vec3 alb) {
    float lum = max(dot(alb, vec3(0.3, 0.55, 0.15)), 0.004);
    vec3 hue = mix(vec3(1.0), alb / lum, 0.74) * vec3(1.20, 0.97, 0.76);
    return hue * (0.40 * pow(lum, 0.55));
  }`;
/** GLSL mat3 whose product with a texture-space vector gives the world-space vector. */
export const GLSL_DETAIL_T = `mat3(${DETAIL_FRAME.map(F).join(', ')})`;

/**
 * @param {THREE.CubeTexture} albedoCube  real Mars colour, sRGB
 * @param {object} [o]
 * @param {boolean} [o.fine]  include the finest layers (off on low quality)
 */
export function makeTerrainMaterial(albedoCube, o = {}) {
  const tex = detailTextures();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0 });
  mat.userData.uniforms = {
    uAlbedo: { value: albedoCube },
    uGrain: { value: tex.grain },
    uPebbles: { value: tex.pebbles },
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
        uniform highp sampler3D uGrain;
        uniform highp sampler3D uPebbles;
        uniform float uDust;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;
        const mat3 DETAIL_T = ${GLSL_DETAIL_T};
        ${GLSL_GROUND_GRADE}`)
      .replace('#include <map_fragment>', /* glsl */`
        vec3 pDir = normalize(vPlanetPos);
        vec3 geoN = normalize(vGeoNormal);
        float viewDist = length(vViewPosition);
        float slope = 1.0 - clamp(dot(geoN, pDir), 0.0, 1.0);

        // ---- real colour of this spot, graded from orbital imagery toward surface colour ----
        vec3 alb = textureCube(uAlbedo, pDir).rgb;
        float albLum = dot(alb, vec3(0.3, 0.55, 0.15));
        // polar ice: in the orbital map it is the only ground that is both bright and nearly colourless
        float ice = smoothstep(0.19, 0.30, albLum) * smoothstep(0.50, 0.78, min(alb.g, alb.b) / max(alb.r, 0.001)) * smoothstep(0.88, 0.95, abs(pDir.y));
        alb = groundGrade(alb);

        // ---- detail layers (height in .a, world-frame gradient after DETAIL_T in .rgb) ----
        vec4 nFar = texture(uGrain, (vPlanetPos * DETAIL_T) / 256.0);
        vec4 nMid = texture(uGrain, vTex / 32.0);
        vec4 nLump = texture(uGrain, vTex / 4.0);
        float fFar = smoothstep(40.0, 320.0, viewDist) * (1.0 - smoothstep(3000.0, 9000.0, viewDist));
        float fMid = 1.0 - smoothstep(160.0, 900.0, viewDist);
        float fLump = 1.0 - smoothstep(24.0, 110.0, viewDist);
        float hFar = nFar.a - 0.5, hMid = nMid.a - 0.5, hLump = nLump.a - 0.5;
        vec3 grad = (nFar.rgb - 0.5) * (0.40 * fFar) + (nMid.rgb - 0.5) * (0.36 * fMid) + (nLump.rgb - 0.5) * (0.80 * fLump);
        float tone = hFar * 0.22 + hMid * 0.42 * fMid + hLump * 0.75 * fLump;
        float stones = 0.0, stoneTop = 0.0;
        #ifdef TERRAIN_FINE
          float fGrain = 1.0 - smoothstep(4.0, 20.0, viewDist);
          float fPeb = 1.0 - smoothstep(7.0, 26.0, viewDist);
          if (fPeb > 0.0) {
            vec4 nGrain = texture(uGrain, vTex * 2.0);
            vec4 peb = texture(uPebbles, vTex * 2.0);
            // grit lies in patches: where the undulation layers say the fines have blown away
            float patchy = smoothstep(-0.02, 0.16, hMid * 0.9 - hFar * 0.6 + hLump * 0.6 + slope * 0.6);
            stones = smoothstep(0.10, 0.34, peb.a) * fPeb * patchy;
            stoneTop = peb.a;
            grad += (nGrain.rgb - 0.5) * (0.95 * fGrain * (1.0 - stones)) + (peb.rgb - 0.5) * (0.9 * stones);
            // the sand itself: a fine speckle of darker and paler grains
            float speck = nGrain.a - 0.5;
            tone += (speck * 0.75 + smoothstep(0.10, 0.22, speck) * 0.10 - smoothstep(0.10, 0.22, -speck) * 0.12) * fGrain;
          }
        #endif

        // ---- what the ground is made of here ----
        vec3 col = alb * (1.0 + tone * 0.42);
        // darker, coarser sand in the hollows
        float coarse = smoothstep(0.02, 0.22, -hMid * fMid - hFar * 0.6);
        col = mix(col, col * vec3(0.72, 0.69, 0.71), coarse * 0.45);
        // bedrock where it is too steep for dust to lie, in bands that follow the layering
        float rock = smoothstep(0.15, 0.34, slope + hMid * 0.10 * fMid + hFar * 0.06);
        float bandAt = length(vPlanetPos) * 0.11 + hFar * 0.9 + hMid * 0.25;
        vec4 band = texture(uGrain, vec3(bandAt, 0.37, 0.71));
        vec3 rockCol = alb * mix(vec3(0.58, 0.53, 0.54), vec3(0.96, 0.88, 0.82), smoothstep(0.30, 0.70, band.a));
        col = mix(col, rockCol, rock * 0.85);
        grad += pDir * ((band.r - 0.5) * 2.4 * rock) * (1.0 - smoothstep(300.0, 1500.0, viewDist));
        // stones: dark basalt, dusted on top
        vec3 stoneCol = alb * vec3(0.60, 0.56, 0.57) * (1.0 + stoneTop * 0.10);
        col = mix(col, stoneCol, stones);
        // polar ice
        // dusty water ice: far from white, paler in the hollows where frost collects
        col = mix(col, vec3(0.47, 0.52, 0.60) * (1.0 + tone * 0.45 - coarse * 0.10), ice);
        // a storm lays pale dust over everything
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        diffuseColor.rgb = col;
        float terrainRough = mix(0.96, 0.86, max(rock, stones)) - ice * 0.42;
        vec3 terrainGrad = grad * (1.0 - ice * 0.55);`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = clamp(terrainRough, 0.05, 1.0);`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        {
          vec3 wn = geoN;
          vec3 gW = DETAIL_T * terrainGrad;                  // texture frame -> world
          gW -= wn * dot(gW, wn);                            // only the part along the surface tilts it
          wn = normalize(wn - gW);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`);
  };
  mat.customProgramCacheKey = () => 'terrain2' + (o.fine !== false ? 'F' : '');
  return mat;
}
