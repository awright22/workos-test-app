/*
 * The ground's material.
 *
 * Colour starts from the real Viking colour map of Mars (a cube map looked up by direction from
 * the planet's centre) graded toward what a camera on the surface sees. Everything finer than
 * that map can show is layered on, each layer fading out with distance:
 *
 *   level ground   two 2D textures (detail2d.js), addressed in metres across the cube face and
 *                  filtered anisotropically, so the ground stays sharp at grazing angles:
 *                  "field" (16 m: lumps, ripples, cracked crust, where gravel lies) and
 *                  "sand" (2 m: grains and pebbles, laid twice at different sizes; not on "low")
 *   slopes         3D textures (noise3d.js), which do not stretch on a steep face, plus banded
 *                  bedrock that follows the ledges cut into the height model
 *   far ground     one broad 3D layer: shading for tiles too coarse to carry relief as geometry
 *
 * Near a cube face's edge the level-ground layers hand over to the 3D ones, because the next
 * face's coordinates run another way. Bright colourless ground near the poles is ice.
 */
import * as THREE from 'three';
import { DETAIL_FRAME } from '../planet/constants.js';
import { detailTextures } from './noise3d.js';
import { groundTextures } from './detail2d.js';

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
  }
  // polar ice: in the orbital map it is the only ground that is both bright and nearly colourless
  float groundIce(vec3 alb, vec3 dir) {
    float lum = dot(alb, vec3(0.3, 0.55, 0.15));
    return smoothstep(0.19, 0.30, lum) * smoothstep(0.50, 0.78, min(alb.g, alb.b) / max(alb.r, 0.001)) * smoothstep(0.88, 0.95, abs(dir.y));
  }
  /** The colour of the ground at a place, for things that must match it (dust on hardware, a heap of soil). */
  vec3 groundColour(vec3 alb, vec3 dir) {
    return mix(groundGrade(alb), vec3(0.56, 0.62, 0.70), groundIce(alb, dir));
  }`;
/** GLSL mat3 whose product with a texture-space vector gives the world-space vector. */
export const GLSL_DETAIL_T = `mat3(${DETAIL_FRAME.map(F).join(', ')})`;

/**
 * @param {THREE.CubeTexture} albedoCube  real Mars colour, sRGB
 * @param {object} [o]
 * @param {boolean} [o.fine]  include the finest layers (off on low quality)
 * @param {number} [o.anisotropy]  anisotropic filtering for the level-ground textures
 */
export function makeTerrainMaterial(albedoCube, o = {}) {
  const tex = detailTextures(), flat = groundTextures(o.anisotropy || 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, metalness: 0 });
  mat.userData.uniforms = {
    uAlbedo: { value: albedoCube },
    uGrain: { value: tex.grain },
    uSand: { value: flat.sand },
    uCrust: { value: flat.crust },
    uField: { value: flat.field },
    uDust: { value: 0 },                       // storm dusting 0..1 (brightens and flattens)
  };
  mat.defines = mat.defines || {};
  if (o.fine !== false) mat.defines.TERRAIN_FINE = '';
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aTex;
        attribute vec3 aUv;
        varying vec3 vTex;
        varying vec3 vUv3;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vTex = aTex;
        vUv3 = aUv;
        vPlanetPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vGeoNormal = normalize(normal);`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform samplerCube uAlbedo;
        uniform highp sampler3D uGrain;
        uniform sampler2D uSand;
        uniform sampler2D uCrust;
        uniform sampler2D uField;
        uniform float uDust;
        varying vec3 vTex;
        varying vec3 vUv3;
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
        float ice = groundIce(alb, pDir);
        alb = groundGrade(alb);

        // ---- how much of this fragment is level ground (2D layers) and how much slope (3D) ----
        // (the 2D layers hold on to quite steep ground: laid from above they stretch down a slope,
        // which reads as scree, where a 3D texture this close would only be soft)
        float level = (1.0 - vUv3.z) * (1.0 - smoothstep(0.40, 0.62, slope));
        float steep = 1.0 - level;

        // ---- 3D layers: broad relief everywhere; lumps and grain where the ground is steep ----
        vec4 nFar = texture(uGrain, (vPlanetPos * DETAIL_T) / 256.0);
        vec4 nMid = texture(uGrain, vTex / 32.0);
        vec4 nLump = texture(uGrain, vTex / 4.0);
        float fFar = smoothstep(40.0, 320.0, viewDist) * (1.0 - smoothstep(3000.0, 9000.0, viewDist));
        float fMid = 1.0 - smoothstep(160.0, 900.0, viewDist);
        float fLump = (1.0 - smoothstep(24.0, 110.0, viewDist)) * steep;
        float hFar = nFar.a - 0.5, hMid = nMid.a - 0.5, hLump = nLump.a - 0.5;
        vec3 grad = (nFar.rgb - 0.5) * (0.40 * fFar) + (nMid.rgb - 0.5) * (0.36 * fMid * (0.35 + 0.65 * steep)) + (nLump.rgb - 0.5) * (0.80 * fLump);
        float tone = hFar * 0.22 + hMid * 0.34 * fMid + hLump * 0.75 * fLump;

        // ---- 2D layers on level ground: slope of the surface in the texture's own axes ----
        vec2 flatSlope = vec2(0.0);
        float stone = 0.0, gravelHere = 0.0, crack = 0.0;
        {
          vec2 uv = vUv3.xy;
          float fField = (1.0 - smoothstep(110.0, 420.0, viewDist)) * level;
          vec4 fld = texture2D(uField, uv / 16.0);
          // ripples belong to sand: ice has none
          flatSlope += (fld.rg - 0.5) * (4.0 * fField * (1.0 - ice * 0.85));
          tone += (fld.b - 0.56) * 1.5 * fField * (1.0 - ice * 0.6);
          gravelHere = fld.a * (1.0 - ice);
          // patterned ground: polygons cracked by frost, from the mid-latitudes to the poles, and on all ice
          float frosty = max(smoothstep(0.52, 0.76, abs(pDir.y)), ice);
          // (sampled everywhere, weighted here: a texture read inside a branch has no defined mip level)
          vec4 cr = texture2D(uCrust, uv / 12.8);                 // every span divides the 64 m the coordinates wrap at
          flatSlope += (cr.rg - 0.5) * (4.0 * fField * frosty);
          tone += (cr.b - 0.56) * 1.25 * fField * frosty;
          crack = cr.a * fField * frosty;
          #ifdef TERRAIN_FINE
            // (pebbles do not survive being stretched down a steep face: there the field layer and the rock carry it)
            float fSand = (1.0 - smoothstep(10.0, 34.0, viewDist)) * level * (1.0 - smoothstep(0.16, 0.30, slope));
            vec4 s1 = texture2D(uSand, uv / 2.0);
            vec4 s2 = texture2D(uSand, vec2(uv.y, -uv.x) / 3.2 + vec2(0.37, 0.11));
            // pebbles only where the field says gravel lies; the sand between them everywhere
            float g1 = s1.a * smoothstep(0.34, 0.60, gravelHere + hFar * 0.6), g2 = s2.a * smoothstep(0.55, 0.80, gravelHere - hFar * 0.6);
            flatSlope += ((s1.rg - 0.5) * mix(0.55, 1.0, g1) + vec2(-(s2.g - 0.5), s2.r - 0.5) * mix(0.45, 1.0, g2)) * (4.0 * fSand * (1.0 - ice * 0.6));
            tone += ((s1.b - 0.56) * mix(0.55, 1.0, g1) + (s2.b - 0.56) * mix(0.45, 1.0, g2)) * 1.3 * fSand;
            stone = max(g1, g2) * fSand;
            // the last two metres: the same grit again at a quarter of the size, so the ground at his feet is not a blur
            float fNear = (1.0 - smoothstep(1.5, 6.0, viewDist)) * level * (1.0 - ice * 0.7);
            vec4 s3 = texture2D(uSand, uv / 0.5 + vec2(0.21, 0.67));
            flatSlope += (s3.rg - 0.5) * (2.6 * fNear);
            tone += (s3.b - 0.56) * 0.9 * fNear;
          #endif
        }

        // ---- what the ground is made of here ----
        vec3 col = alb * (1.0 + clamp(tone, -0.55, 0.6) * 0.62);
        // darker, coarser sand in the hollows
        float coarse = smoothstep(0.02, 0.22, -hMid * fMid - hFar * 0.6);
        col = mix(col, col * vec3(0.74, 0.71, 0.73), coarse * 0.4);
        // bedrock where it is too steep for dust to lie, in bands that follow the layering
        float rock = smoothstep(0.15, 0.34, slope + hMid * 0.10 * fMid + hFar * 0.06);
        // beds of uneven thickness with thin partings in them, undulating; far away they merge into one tone
        float alt = length(vPlanetPos);
        vec4 band = texture(uGrain, vec3(alt * 0.13 + hFar * 0.9 + hMid * 0.25, 0.37, 0.71));
        float beds = texture(uGrain, vec3(alt * 0.029 + hFar * 0.45, 0.83, 0.21)).a;
        float bedTone = mix(0.5, smoothstep(0.34, 0.66, beds * 0.68 + band.a * 0.32), 1.0 - smoothstep(500.0, 2200.0, viewDist));
        vec3 rockCol = alb * mix(vec3(0.50, 0.45, 0.46), vec3(0.98, 0.88, 0.80), bedTone);
        col = mix(col, rockCol * (1.0 + hLump * 0.5 * fLump + clamp(tone, -0.4, 0.4) * 0.5), rock * 0.9);
        grad += pDir * ((band.r - 0.5) * 2.4 * rock) * (1.0 - smoothstep(300.0, 1500.0, viewDist));
        // stones are basalt, not dust: darker and greyer than the sand they lie in
        col = mix(col, col * vec3(0.74, 0.78, 0.84), stone * 0.75);
        // dusty water ice: pale blue-white, banded with dust, brightest where frost lies in the hollows
        float iceBand = texture(uGrain, vec3(length(vPlanetPos) * 0.35 + hFar * 1.5, 0.11, 0.53)).a;
        // (bluer than the sky's light is warm, or it reads as cream; frost whitens the polygon troughs and the hollows)
        vec3 iceCol = mix(vec3(0.50, 0.60, 0.76), vec3(0.47, 0.42, 0.37), smoothstep(0.58, 0.72, iceBand) * 0.45) * (1.0 + tone * 0.30 + coarse * 0.08);
        iceCol = mix(iceCol, vec3(0.80, 0.86, 0.93), clamp(crack * 0.8 + smoothstep(0.10, 0.34, hMid * fMid + hFar * 0.5) * 0.35, 0.0, 1.0));
        col = mix(col, iceCol, ice);
        // a storm lays pale dust over everything
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        diffuseColor.rgb = col;
        float terrainRough = mix(0.98, 0.90, max(rock, stone)) - ice * 0.62;
        vec3 terrainGrad = grad * (1.0 - ice * 0.5);
        vec2 terrainFlat = flatSlope * (1.0 - ice * 0.35);`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = clamp(terrainRough, 0.05, 1.0);`)
      // regolith scatters light back toward the sun; it has no sheen at grazing angles. Ice keeps its glint.
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        { float sheen = mix(0.16, 1.0, ice); material.specularColor *= sheen; material.specularColorBlended *= sheen; material.specularF90 *= sheen; }`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        {
          // the 3D layers tilt the normal in world space
          vec3 wn = geoN;
          vec3 gW = DETAIL_T * terrainGrad;                  // texture frame -> world
          gW -= wn * dot(gW, wn);                            // only the part along the surface tilts it
          wn = normalize(wn - gW);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
          // the 2D layers tilt it along the texture's axes, found from how position and
          // coordinates change across the screen
          vec3 dp1 = dFdx(vViewPosition), dp2 = dFdy(vViewPosition);
          vec2 du1 = dFdx(vUv3.xy), du2 = dFdy(vUv3.xy);
          vec3 p2 = cross(dp2, normal), p1 = cross(normal, dp1);
          vec3 T = p2 * du1.x + p1 * du2.x, B = p2 * du1.y + p1 * du2.y;
          float inv = inversesqrt(max(max(dot(T, T), dot(B, B)), 1e-12));
          normal = normalize(normal + (T * terrainFlat.x + B * terrainFlat.y) * inv);
        }`);
  };
  mat.customProgramCacheKey = () => 'terrain5' + (o.fine !== false ? 'F' : '');
  return mat;
}
