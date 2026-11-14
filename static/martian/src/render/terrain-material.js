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
import { DETAIL_FRAME, R } from '../planet/constants.js';
import { LAVA_FIELDS } from '../planet/volcanoes.js';
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
    // (the dark ground of Mars is basalt sand, greyer than the bright dust and not a deeper red: graded as the dust
    // is, the dark regions came out a murky maroon that turned purple in shade)
    float dark = 1.0 - smoothstep(0.10, 0.24, lum);
    vec3 hue = mix(vec3(1.0), alb / lum, mix(0.74, 0.46, dark)) * mix(vec3(1.20, 0.97, 0.76), vec3(1.08, 0.98, 0.88), dark);
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
/** GLSL: how much of the ground in a direction is a volcano's lava field (as Planet.lava in planet/height.js). */
const GLSL_LAVA = /* glsl */`
  const vec4 LAVA_FIELD[${LAVA_FIELDS.length}] = vec4[${LAVA_FIELDS.length}](${LAVA_FIELDS.map((v) => `vec4(${F(v.x)}, ${F(v.y)}, ${F(v.z)}, ${F(1 / (1 - v.cos))})`).join(', ')});
  float groundLava(vec3 dir) {
    float m = 0.0;
    // (one less the share of the reach squared: 0 at the field's edge, 0.36 a fifth of the way in)
    for (int i = 0; i < ${LAVA_FIELDS.length}; i++) m = max(m, 1.0 - (1.0 - dot(dir, LAVA_FIELD[i].xyz)) * LAVA_FIELD[i].w);
    return smoothstep(0.0, 0.36, m);
  }
  /** The summit of the lava field a place lies in (of the nearest, where it lies in none). */
  vec3 lavaSummit(vec3 dir) {
    float m = -1e9; vec3 c = vec3(0.0, 1.0, 0.0);
    for (int i = 0; i < ${LAVA_FIELDS.length}; i++) { float k = 1.0 - (1.0 - dot(dir, LAVA_FIELD[i].xyz)) * LAVA_FIELD[i].w; if (k > m) { m = k; c = LAVA_FIELD[i].xyz; } }
    return c;
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
    uClinker: { value: flat.clinker },
    uSastrugi: { value: flat.sastrugi },
    uField: { value: flat.field },
    uDust: { value: 0 },                       // storm dusting 0..1 (brightens and flattens)
    uDay: { value: 1 },                        // 0 at night .. 1 by day (what glows by daylight must not glow in the dark)
    uSunW: { value: new THREE.Vector3(1, 0, 0) },   // toward the sun (world)
    uSkyLit: { value: new THREE.Color(0, 0, 0) },   // the sky's light on the ground by day
    uCamSpace: { value: 0 },                        // how far out of the air the camera is, 0..1 (the ground then needs that light given back: see below)
    uSpace: { value: 0 },                      // 0 on the ground .. 1 from orbit: the air seen edge-on hazes the planet's rim
    uRelief: { value: 1 },                     // how much of the (exaggerated) relief is drawn: all of it on the ground, a third from orbit
  };
  mat.defines = mat.defines || {};
  if (o.fine !== false) mat.defines.TERRAIN_FINE = '';
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aTex;
        attribute float aChute;
        varying float vChute;
        attribute vec3 aUv;
        attribute vec4 aGeo;
        uniform float uRelief;
        varying vec3 vTex;
        varying vec3 vUv3;
        varying vec4 vGeo;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vTex = aTex;
        vChute = aChute;
        vUv3 = aUv;
        vGeo = aGeo;
        vPlanetPos = (modelMatrix * vec4(position, 1.0)).xyz;
        // From orbit the relief is drawn nearer its true height: at four times life size the volcanoes
        // notch the planet's edge. (A chunk's matrix is a translation and nothing else.)
        if (uRelief < 0.999) {
          float pr = length(vPlanetPos);
          vPlanetPos *= (${F(R)} + (pr - ${F(R)}) * uRelief) / pr;
          transformed = vPlanetPos - modelMatrix[3].xyz;
        }
        vGeoNormal = normalize(normal);`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform samplerCube uAlbedo;
        uniform highp sampler3D uGrain;
        uniform sampler2D uSand;
        uniform sampler2D uCrust;
        uniform sampler2D uClinker;
        uniform sampler2D uSastrugi;
        uniform sampler2D uField;
        uniform float uDust;
        uniform float uDay;
        uniform vec3 uSunW, uSkyLit;
        uniform float uCamSpace;
        uniform float uSpace;
        varying float vChute;
        varying vec3 vTex;
        varying vec3 vUv3;
        varying vec4 vGeo;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;
        const mat3 DETAIL_T = ${GLSL_DETAIL_T};
        ${GLSL_GROUND_GRADE}
        ${GLSL_LAVA}`)
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
        float lava = groundLava(pDir);
        // what the mesh builder knows of the place (the same whatever level of detail drew this fragment):
        // how steep the land itself is, measured as slope is; how much of it is the top of a lava flow;
        // how far inside a levelled building site it lies
        float landRise = vGeo.x * 2.0;
        float landSlope = 1.0 - inversesqrt(1.0 + landRise * landRise);
        float flowTop = vGeo.y, worn = vGeo.w;

        // ---- how much of this fragment is level ground (2D layers) and how much slope (3D) ----
        // (laid from above, a 2D texture stretches down a slope: on scree that passes, on a cliff it is corduroy,
        // so past about forty degrees the 3D layers have the ground to themselves)
        float level = (1.0 - vUv3.z) * (1.0 - smoothstep(0.22, 0.40, slope));
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
        // From the air. Between a few hundred metres up and orbit the ground is too far for its ripples and stones and
        // too near for the survey's colours to have any shape in them: it was one flat tan, and the rocket climbed
        // over a featureless ball. So the broad patches show more strongly with distance, and a broader mottle still
        // (drifts, darker stony ground, the stains of old craters) comes in under them.
        float fAir = smoothstep(250.0, 900.0, viewDist) * (1.0 - smoothstep(5000.0, 14000.0, viewDist));
        vec4 nAir = texture(uGrain, (vPlanetPos * DETAIL_T) / 1100.0 + vec3(0.37, 0.11, 0.73));
        tone += (hFar * 0.38 + (nAir.a - 0.5) * 0.62 + (nAir.r - 0.5) * (nFar.g - 0.5) * 1.2) * fAir;
        // lava that ponded and froze level: a caldera floor (its edge broken up by the noise: drawn from the mesh's own
        // vertices alone it followed their triangles in a saw-tooth)
        float pond = lava * (1.0 - smoothstep(0.004, 0.05, landSlope + (hMid * 0.03 + hLump * 0.015) * fMid));
        // The top of a flow is bare basalt with dust only in its hollows; between flows the dust lies deep.
        // (This is what makes a volcano's flank read as lava from any distance: dark tongues on red ground.)
        // (Far off, a flow's edge is known only at the corners of big triangles, and a hard line drawn through them
        // runs along their diagonals in a saw-tooth: so with distance the edge is drawn softer and is pushed about by
        // the twelve-metre grain as well.)
        vec4 nCrag = texture(uGrain, vTex / 12.0 + vec3(0.37, 0.11, 0.59));
        float farEdge = smoothstep(50.0, 180.0, viewDist);
        float basalt = lava * max(smoothstep(mix(0.16, 0.06, farEdge), mix(0.48, 0.70, farEdge), flowTop + hMid * 0.26 * fMid + hFar * 0.18 + (nCrag.a - 0.5) * 0.5 * farEdge), pond);

        // ---- 2D layers on level ground: slope of the surface in the texture's own axes ----
        vec2 flatSlope = vec2(0.0);
        float stone = 0.0, gravelHere = 0.0, crack = 0.0;
        float clinkTone = 0.0, clinkDust = 0.0;
        float snowLie = 0.35, snowTone = 0.0;
        // (for the clinker layer, read inside a branch: there a texture has no mip level of its own, so it is handed these)
        vec2 uvDx = dFdx(vUv3.xy), uvDy = dFdy(vUv3.xy);
        float iceGlow = 0.0;
        {
          vec2 uv = vUv3.xy;
          float fField = (1.0 - smoothstep(110.0, 420.0, viewDist)) * level;
          vec4 fld = texture2D(uField, uv / 16.0);
          // ripples belong to sand: ice has none
          // (nor has a lava flow beyond a skin of drift, nor trodden ground, nor anything steeper than sand will lie)
          // (and the land's own colour says what it is made of: the dark regions are basalt sand, which the wind works into
          // strong ripples and leaves strewn with gravel; the bright ones are deep dust, which lies smooth)
          float sandy = 1.0 - smoothstep(0.11, 0.26, albLum);
          float ripples = (1.0 - ice * 0.78) * (1.0 - lava * 0.7) * (1.0 - worn * 0.9) * (1.0 - smoothstep(0.07, 0.17, slope)) * mix(0.55, 1.35, sandy);
          flatSlope += (fld.rg - 0.5) * (4.0 * fField * ripples);
          tone += (fld.b - 0.56) * 1.5 * fField * (1.0 - ice * 0.6) * (0.35 + 0.65 * ripples);
          // The same field four times the size, from a stone's throw out to where the fine one has long gone: ripples
          // a pace apart and swells the size of a house. Sand seen from a height (a canyon floor from its rim, a plain
          // from a hill) is worked by the wind into lines; without them it was one smooth tone with soft blots in it.
          float fMega = smoothstep(24.0, 80.0, viewDist) * (1.0 - smoothstep(320.0, 800.0, viewDist)) * level;
          vec4 fld4 = texture2D(uField, uv / 64.0 + vec2(0.31, 0.17));
          flatSlope += (fld4.rg - 0.5) * (3.4 * fMega * ripples);
          tone += (fld4.b - 0.56) * 1.3 * fMega * (1.0 - ice * 0.6) * (0.35 + 0.65 * ripples);
          gravelHere = min(1.0, fld.a * (1.0 - ice) * mix(0.7, 1.25, sandy) + lava * 0.3 + basalt * (1.0 - pond) * 0.55);      // clinker lies all over a flow
          // patterned ground: polygons cracked by frost, from the mid-latitudes to the poles, and on all ice
          // (and lava that froze level cracked into columns as it cooled: the same pattern, larger meaning)
          float frosty = max(max(smoothstep(0.52, 0.76, abs(pDir.y)), ice), pond);
          // (sampled everywhere, weighted here: a texture read inside a branch has no defined mip level)
          vec4 cr = texture2D(uCrust, uv / 12.8);                 // every span divides the 64 m the coordinates wrap at
          // (on ice the polygons are fine blue lines in a hard surface the wind has cut into ridges, not embossed plates:
          // embossed, a cap looked like cracked plaster; and on soil the troughs are a hand deep, not a mud flat's cracks)
          // (and on ice no relief at all: a crack in ice is a thin dark line, and any bevel made the cap a plaster cast)
          flatSlope += (cr.rg - 0.5) * (2.6 * fField * frosty * (1.0 - ice));
          tone += (cr.b - 0.56) * 0.95 * fField * frosty * (1.0 - ice * 0.85);
          crack = cr.a * fField * frosty * (1.0 - 0.35 * pond);
          // Clinker. The top of a flow is not a skin: it broke as it moved, into blocks and rubble tipped at all
          // angles, and dust has since settled in the gaps. One texture of such blocks, laid at three sizes: blocks
          // a pace across from a stone's throw, plates of a couple of metres from a hill, and of five from the air.
          // (Under his feet it is left out: painted blocks a foot high are flat discs from beside them, and the
          // stones there are real.) Without it bare lava had only soft lumps to shade it, and was dough.
          float clinkW = basalt * (1.0 - pond) * level;
          if (clinkW > 0.004) {
            float f1 = smoothstep(7.0, 22.0, viewDist) * (1.0 - smoothstep(45.0, 110.0, viewDist));
            float f2 = smoothstep(28.0, 80.0, viewDist) * (1.0 - smoothstep(220.0, 480.0, viewDist));
            float f3 = smoothstep(110.0, 300.0, viewDist) * (1.0 - smoothstep(800.0, 1500.0, viewDist));
            vec4 c1 = textureGrad(uClinker, uv / 8.0, uvDx / 8.0, uvDy / 8.0);
            vec4 c2 = textureGrad(uClinker, vec2(uv.y, -uv.x) / 32.0 + vec2(0.37, 0.61), vec2(uvDx.y, -uvDx.x) / 32.0, vec2(uvDy.y, -uvDy.x) / 32.0);
            vec4 c3 = textureGrad(uClinker, uv / 64.0 + vec2(0.13, 0.29), uvDx / 64.0, uvDy / 64.0);
            flatSlope += ((c1.rg - 0.5) * f1 + vec2(-(c2.g - 0.5), c2.r - 0.5) * f2 + (c3.rg - 0.5) * f3) * (4.0 * clinkW);
            clinkTone = ((c1.b - 0.5) * f1 + (c2.b - 0.5) * f2 + (c3.b - 0.5) * f3) * clinkW;
            clinkDust = max(max(c1.a * f1, c2.a * f2), c3.a * f3) * clinkW;
          }
          // Sastrugi. A polar cap is not a smooth white field: the wind packs its snow into hard drifts, each with a
          // blunt nose into the wind and a long tail, and scours the ice bare between them. The drifts near, and the
          // same shapes eight times the size as the long drifts seen from far off. (Read only on ice, as the clinker.)
          if (ice > 0.004) {
            float g1 = (0.45 + 0.55 * smoothstep(2.5, 9.0, viewDist)) * (1.0 - smoothstep(45.0, 130.0, viewDist)) * level;
            float g2 = smoothstep(35.0, 120.0, viewDist) * (1.0 - smoothstep(900.0, 2000.0, viewDist)) * level;
            vec4 w1 = textureGrad(uSastrugi, uv / 8.0, uvDx / 8.0, uvDy / 8.0);
            vec4 w2 = textureGrad(uSastrugi, uv / 64.0 + vec2(0.41, 0.23), uvDx / 64.0, uvDy / 64.0);
            flatSlope += ((w1.rg - 0.5) * g1 + (w2.rg - 0.5) * g2) * (4.0 * ice);
            snowTone = ((w1.b - 0.5) * g1 + (w2.b - 0.5) * g2) * ice;
            snowLie = clamp(0.35 + (w1.a - 0.35) * g1 + (w2.a - 0.35) * g2 * (1.0 - 0.5 * g1), 0.0, 1.0);
          }
          #ifdef TERRAIN_FINE
            // (pebbles do not survive being stretched down a steep face: there the field layer and the rock carry it)
            float fSand = (1.0 - smoothstep(10.0, 34.0, viewDist)) * level * (1.0 - smoothstep(0.16, 0.30, slope));
            vec4 s1 = texture2D(uSand, uv / 2.0);
            vec4 s2 = texture2D(uSand, vec2(uv.y, -uv.x) / 3.2 + vec2(0.37, 0.11));
            // pebbles only where the field says gravel lies; the sand between them everywhere
            float g1 = s1.a * smoothstep(0.34, 0.60, gravelHere + hFar * 0.6), g2 = s2.a * smoothstep(0.55, 0.80, gravelHere - hFar * 0.6);
            flatSlope += ((s1.rg - 0.5) * mix(0.55, 1.0, g1) + vec2(-(s2.g - 0.5), s2.r - 0.5) * mix(0.45, 1.0, g2)) * (5.2 * fSand * (1.0 - ice * 0.6));
            tone += ((s1.b - 0.56) * mix(0.55, 1.0, g1) + (s2.b - 0.56) * mix(0.45, 1.0, g2)) * 1.7 * fSand;
            stone = max(g1, g2) * fSand;
            // the last two metres: the same grit again at a quarter of the size, so the ground at his feet is not a blur
            float fNear = (1.0 - smoothstep(1.5, 6.0, viewDist)) * level * (1.0 - ice * 0.35);
            vec4 s3 = texture2D(uSand, uv / 0.5 + vec2(0.21, 0.67));
            flatSlope += (s3.rg - 0.5) * (3.8 * fNear);
            tone += (s3.b - 0.56) * 2.0 * fNear;        // tone, not relief: it shows at noon, when no slope casts a shade
          #endif
        }

        // ---- what the ground is made of here ----
        vec3 col = alb * (1.0 + clamp(tone, -0.55, 0.6) * 0.62);
        // darker, coarser sand in the hollows
        float coarse = smoothstep(0.02, 0.22, -hMid * fMid - hFar * 0.6);
        col = mix(col, col * vec3(0.74, 0.71, 0.73), coarse * 0.4);
        // bedrock where it is too steep for dust to lie, in bands that follow the layering
        // (a flow's edge is bare lava at a slope where a hillside would still hold its dust)
        // Near, the mesh's own slope says where: a ledge's riser is rock and its bench is dust. Far off, the land's
        // slope does, which every level of detail agrees on, so no edge shows where a fine mesh meets a coarse one.
        // beds of uneven thickness with thin partings in them, undulating; far away they merge into one tone
        // (beds are not evenly thick: the height is stretched and squeezed before the layers are looked up, or a
        // wall shows the texture's period as pinstripes)
        float alt = length(vPlanetPos);
        alt += 5.5 * sin(alt * 0.031) + 2.2 * sin(alt * 0.113 + 1.3);
        // (the wobble is finer than a distant mesh's triangles: without it each band's edge follows their
        // diagonals and the hillside shows rows of chevrons)
        float wob = hMid * 0.6 + (nLump.a - 0.5) * 0.3 * fLump;      // (the finest wobble only near: far off it would alias into hatching)
        // (the broad sway is kept small: beds that wander like wood grain are not rock)
        vec4 band = texture(uGrain, vec3(alt * 0.13 + hFar * 0.3 + wob * 0.55, 0.37, 0.71));
        vec4 bedsAt = texture(uGrain, vec3(alt * 0.029 + hFar * 0.15 + wob * 0.2, 0.83, 0.21));
        float beds = bedsAt.a;
        // how fast the beds change going up the wall (the texture carries its own slope): where a hard bed begins
        // and ends. It is what lets a bed stand out of the wall as a ledge, further down.
        float bedRise = (bedsAt.r - 0.5) + (band.r - 0.5) * 0.6;
        float bedTone = mix(0.5, smoothstep(0.30, 0.70, beds * 0.68 + band.a * 0.32), 1.0 - smoothstep(260.0, 1200.0, viewDist));
        float rockSlope = mix(slope, max(landSlope, slope * 0.5), smoothstep(90.0, 320.0, viewDist));
        // Cliff and talus. A canyon wall is not one banded surface. Hard beds stand as dark cliffs; between and below
        // them lies what has fallen off them, at the angle loose rock rests at (a little over thirty degrees): smooth
        // and pale, with the beds buried under it. So bare rock starts where scree will no longer lie, and from
        // where dust slides to there the ground is scree. (On lava a flow's edge is bare from a gentler slope, as before.)
        // Far off, where the mesh no longer says which part of a wall is riser and which bench, the hard beds stand as
        // cliff and the soft ones lie back under scree: bands along the wall, as a layered wall has. (It was the land's
        // slope and a soft noise: cliff and scree in blotches like a watercolour wash.) On gentle ground a finer noise
        // breaks the line between dust and scree, which otherwise rings every hollow like a contour on a map.
        float farW = smoothstep(90.0, 320.0, viewDist), steepish = smoothstep(0.10, 0.22, rockSlope);
        float rs = rockSlope * (1.0 + lava * 0.7) + hMid * 0.10 * fMid * (1.0 - 0.6 * farW) + hFar * 0.06 * (1.0 - 0.7 * farW)
          + (beds - 0.5) * 0.16 * farW * steepish * (1.0 - lava) + (nFar.r - 0.5) * 0.07 * (1.0 - steepish);
        float rock = mix(smoothstep(0.165, 0.30, rs), smoothstep(0.12, 0.30, rs), lava);
        float scree = smoothstep(0.07, 0.125, rs) * (1.0 - rock) * (1.0 - lava) * (1.0 - ice);
        // and along each flow's edge lies the rubble it shed: a dark band, broken up by the noise so it does not follow the mesh
        float rubble = smoothstep(0.30, 0.66, vGeo.z + hMid * 0.5 * fMid + hFar * 0.3 + hLump * 0.4 * fLump);
        rock = max(rock, rubble * 0.9);
        grad += (nLump.rgb - 0.5) * (0.8 * (1.0 - smoothstep(24.0, 110.0, viewDist)) * rubble * level);
        // (the beds a little closer in tone to one another: the wall's shape is its spurs and gullies, not its stripes)
        vec3 rockCol = alb * mix(vec3(0.48, 0.435, 0.44), vec3(0.82, 0.735, 0.675), bedTone);
        // lava is basalt: dark and grey under its dust, and the dust is thin on the backs of the flows
        // (dark whatever dust colours the land round it: a flow's cliff shows grey-brown beds, some paler with dust)
        rockCol = mix(rockCol, mix(alb * vec3(0.44, 0.41, 0.44), vec3(0.075, 0.060, 0.058), 0.75) * mix(1.0, 0.72 + 0.56 * bedTone, smoothstep(0.22, 0.45, slope)), lava * 0.9);
        float nearLump = 1.0 - smoothstep(24.0, 110.0, viewDist);
        // (grey, and broken: a flow's top is clinker, rubble the size of a fist to a chest, and from the air it is a dark
        // grit, not a smooth brown skin. With little of the land's dust colour in it and a coarse speckle it stops
        // reading as chocolate.)
        vec3 basaltCol = mix(alb * vec3(0.46, 0.43, 0.47), vec3(0.058, 0.054, 0.058), 0.92)
          * (0.80 + 0.6 * hMid * fMid + 0.55 * hLump * nearLump + 0.3 * clamp(tone, -0.5, 0.5) + 0.75 * (nCrag.a - 0.5) * (1.0 - smoothstep(260.0, 700.0, viewDist)));
        // (a frozen lava lake is not swept clean: dust lies on it in broad drifts)
        float drift = pond * smoothstep(0.02, 0.26, hFar * 0.8 + hMid * 0.5 * fMid) * 0.7;
        // (the joints of a frozen lava lake are dark, where frost in an ice field's cracks is pale)
        basaltCol *= 1.0 - 0.45 * crack * pond;
        // Ropes. A flow that was still moving under its cooling skin wrinkled it: ridges across the flow, a pace or
        // a few apart, bowed downstream in the middle where the lava ran fastest and swept back along its edges. It
        // is what says "this ran" from a hill or from the air. They are drawn about the summit the lava came from
        // (so they always lie across the fall line), bent back where a tongue's top gives way to its edge, and broken
        // by the same lumps as the rest of the flow. (Without them a flow field from above was smooth dark lobes, like
        // melted chocolate.)
        float fRope = smoothstep(8.0, 30.0, viewDist) * (1.0 - smoothstep(500.0, 1100.0, viewDist));
        float ropy = basalt * (1.0 - pond) * smoothstep(0.25, 0.7, flowTop) * fRope;
        if (ropy > 0.003) {
          vec3 summit = lavaSummit(pDir);
          float down = length(pDir - summit) * ${F(R)};
          vec3 fall = normalize(pDir * dot(pDir, summit) - summit);
          float bend = (1.0 - flowTop) * 2.2 + hMid * 2.0 * fMid + hFar * 3.0;
          float w1 = 6.2832 * (down / 3.6 - bend), w2 = 6.2832 * (down / 11.0 - bend * 0.6 + 0.3);
          float broken = clamp(0.55 + 1.6 * (nCrag.a - 0.5), 0.0, 1.0);
          float fine = 1.0 - smoothstep(120.0, 320.0, viewDist);          // (the close-set ridges only as far as they can be told apart)
          // (deep enough to be seen from the air: at a seventh of the tone they were a rumour, and the flows smooth lobes)
          grad += (fall * DETAIL_T) * ((cos(w1) * 1.3 * fine + cos(w2) * 1.5) * ropy * broken);
          basaltCol *= 1.0 + (sin(w1) * 0.26 * fine + sin(w2) * 0.30) * ropy * broken;
        }
        basaltCol *= 1.0 + 1.5 * clinkTone;
        col = mix(col, basaltCol, basalt * 0.9 * (1.0 - drift) * (1.0 - 0.5 * clinkDust));
        grad += (nLump.rgb - 0.5) * (0.7 * nearLump * basalt * level) + (nMid.rgb - 0.5) * (0.7 * fMid * basalt * (1.0 - pond));
        // trodden, driven-over ground round the things men have put here: darker, packed, its ripples gone
        col = mix(col, col * vec3(0.80, 0.78, 0.78) * (1.0 + clamp(tone, -0.4, 0.4) * 0.35), worn * 0.75);
        // Crags. Past a hundred metres a wall had only the broadest relief to shade it and hung like drapery; a lava
        // field from the air was a smooth hump. The grain volume again at twelve metres a period, strong, on bare rock
        // and on the tops of flows, from sixty metres out to a kilometre and a half (nearer, the lumps take over).
        float fCrag = smoothstep(40.0, 140.0, viewDist) * (1.0 - smoothstep(700.0, 1500.0, viewDist));
        float craggy = max(rock * lava, basalt * (1.0 - pond)) * fCrag;
        grad += (nCrag.rgb - 0.5) * (1.25 * craggy);
        float cragTone = (nCrag.a - 0.5) * craggy;
        // ... but a layered wall is not lumpy the same in every direction: its relief is its beds, some standing
        // proud and some cut back, in lenses many times longer than they are thick. The grain volume squeezed
        // three and a half times up and down. (Round twelve-metre lumps of tone made a far wall a cloudy wash.)
        float bedRock = rock * (1.0 - lava) * fCrag;
        vec3 upT = pDir * DETAIL_T;
        vec4 nBed = texture(uGrain, upT * (${F(R)} / 14.0 + (length(vPlanetPos) - ${F(R)}) / 4.0) + vec3(0.13, 0.71, 0.29));
        vec3 gBed = nBed.rgb - 0.5;
        gBed += upT * (dot(gBed, upT) * 2.5);
        grad += gBed * (1.0 * bedRock);
        cragTone += (nBed.a - 0.5) * bedRock * 1.1;
        // And the beds themselves stand in relief: a hard bed proud of the wall, lit along its top and dark under its
        // lip, a soft one cut back. Their colour alone made a hillside painted in stripes; a wall is a stair of ledges.
        float bedCut = rock * (1.0 - lava) * (1.0 - smoothstep(500.0, 1400.0, viewDist)) * smoothstep(0.10, 0.25, slope);
        grad += upT * (bedRise * 3.0 * bedCut);
        cragTone -= smoothstep(0.10, 0.34, bedRise) * 0.45 * bedCut;
        // Flutes. A wall's spurs and chutes are in the mesh only near to: from a hundred metres its triangles are
        // too coarse to carry anything finer than the great buttresses, and a wall seen face-on in a high sun was a
        // smooth banded sheet. The grain volume once more, stretched eight times up and down (columns of it stand
        // on end, and a steep wall cuts them into streaks that run down the fall line), as relief and tone on steep
        // bare rock from twenty metres out.
        float fFlute = smoothstep(18.0, 60.0, viewDist) * (1.0 - smoothstep(900.0, 2200.0, viewDist)) * rock * smoothstep(0.10, 0.28, landSlope) * (1.0 - lava);
        vec4 nFlute = texture(uGrain, pDir * (${F(R)} / 20.0 + (length(vPlanetPos) - ${F(R)}) / 160.0));
        vec3 gFlute = nFlute.rgb - 0.5;
        gFlute -= pDir * (dot(gFlute, pDir) * 0.875);
        grad += gFlute * (2.2 * fFlute);
        float fluteTone = (nFlute.a - 0.5) * fFlute;
        col = mix(col, rockCol * (1.0 + hLump * 0.5 * fLump + clamp(tone, -0.4, 0.4) * 0.5 + cragTone * 0.7 + fluteTone * 0.6), rock * 0.9);
        // Spur and gully. The beds show on the spurs, which are bare rock. A chute between two spurs is floored with
        // what fell from them: scree with no beds in it, running down the wall in a pale tongue. (Without it a wall
        // was banded from end to end like a layer cake, and its spurs could only be seen by their shading.)
        float talus = smoothstep(0.24, 0.50, vChute + hMid * 0.2 * fMid + hFar * 0.12) * rock * (1.0 - lava);
        // scree: the wall's own rock broken small and mixed with dust, a shade darker and greyer than the plain, with
        // no beds in it. A stone's throw off it is lumpy; further off it is mottled and ridged by the same crags as
        // the rock. (Flat-coloured, a slope of it seen from its foot was a blur. Underfoot the lumps are left out: at
        // their size they are not stones but dark blotches on the ground.)
        float screeAll = max(scree, talus);
        vec3 screeCol = alb * vec3(0.80, 0.755, 0.75) * (1.0 + hLump * 0.5 * nearLump * smoothstep(9.0, 26.0, viewDist) + hMid * 0.34 * fMid + hFar * 0.2 + (nCrag.a - 0.5) * 0.6 * fCrag);
        col = mix(col, screeCol, screeAll * 0.86);
        grad += (nLump.rgb - 0.5) * (0.7 * nearLump * smoothstep(9.0, 26.0, viewDist) * screeAll) + (nCrag.rgb - 0.5) * (0.75 * fCrag * screeAll);
        grad += pDir * ((band.r - 0.5) * 2.4 * rock * (1.0 - talus)) * (1.0 - smoothstep(300.0, 1500.0, viewDist));
        // stones are basalt, not dust: darker and greyer than the sand they lie in
        col = mix(col, col * vec3(0.74, 0.78, 0.84), stone * 0.75);
        // dusty water ice: pale blue-white, banded with dust, brightest where frost lies in the hollows
        float iceBand = texture(uGrain, vec3(length(vPlanetPos) * 0.35 + hFar * 1.5, 0.11, 0.53)).a;
        // (bluer than the sky's light is warm, or it reads as cream; frost whitens the polygon troughs and the hollows)
        // old ice is blue where it is clean and deep, tan where a season's dust was laid into it, white only where frost lies
        float dusty = smoothstep(0.50, 0.70, iceBand + hFar * 0.5) * 0.6;
        // (kept well under white: lit by a low sun at an exposure set for red ground, pale ice burnt out and lost its blue)
        // Two surfaces. Most of a cap is wind-packed snow: white, matt, cut into drifts. In broad windows the wind
        // has scoured it to the old ice: blue, hard, glassy enough to throw the sun back, and cracked. (One pale blue
        // surface with soft dark lines on it was a lilac snowfield drawn on with a marker.)
        float open = smoothstep(-0.03, 0.07, hFar * 0.7 + hMid * 0.35 * fMid + (nAir.a - 0.5) * 0.5);
        float firn = max(snowLie, 1.0 - 0.92 * open);
        vec3 bare = mix(vec3(0.15, 0.31, 0.58), vec3(0.42, 0.36, 0.30), dusty * 0.55) * (1.0 + tone * 0.30 + coarse * 0.08);
        // (a crack shows the ice's depth: darker and bluer than its face, a thin line, and the snow covers it)
        float crk = smoothstep(0.42, 0.80, crack) * (1.0 - dusty) * (1.0 - 0.9 * firn);
        bare = mix(bare, vec3(0.05, 0.15, 0.40), crk);
        vec3 packed = mix(vec3(0.70, 0.77, 0.88), vec3(0.62, 0.57, 0.52), dusty * 0.8) * (1.0 + snowTone * 1.3 + tone * 0.16);
        vec3 iceCol = mix(bare, packed, firn);
        // (by night the ice is grey under the stars, not blue: blue ice under the night's blue light was a cobalt floor)
        iceCol = mix(vec3(dot(iceCol, vec3(0.3, 0.5, 0.2))) * vec3(0.96, 1.0, 1.05), iceCol, 0.35 + 0.65 * uDay);
        col = mix(col, iceCol, ice);
        // a storm lays pale dust over everything
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        // seen from space the air lies thickest along the planet's edge: a soft pale rim that fades inward
        if (uSpace > 0.001) {
          float graze = 1.0 - max(dot(pDir, normalize(cameraPosition - vPlanetPos)), 0.0);
          col = mix(col, vec3(0.62, 0.50, 0.40), uSpace * 0.7 * pow(graze, 3.5));
        }
        diffuseColor.rgb = col;
        float terrainRough = mix(0.98, 0.90, max(max(rock, stone), basalt)) - ice * mix(0.84, 0.40, firn) - pond * (1.0 - drift) * 0.16;
        // light that has passed through ice comes back blue: it fills the shadows the warm sky would leave tan
        iceGlow = ice * (0.5 + 0.5 * crack);
        vec3 terrainGrad = grad * (1.0 - ice * 0.5);
        vec2 terrainFlat = flatSlope * (1.0 - ice * 0.35);`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = clamp(terrainRough, 0.05, 1.0);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(0.012, 0.034, 0.075) * iceGlow * uDay;
        // Half the light on Mars's ground by day is its sky's. The renderer takes sky light from the sky where the
        // camera is, and above the dust that sky is black: seen from a climbing rocket, and from orbit, the day side
        // went dim and flat. So ground that lies deeper in the air than the camera is given back the sky light the
        // camera's height took from it: by day, under its own sun. (On a mountain top the two are at one height, and
        // nothing is added: the thin sky up there is the sky that lights it.)
        { float sunHere = dot(pDir, uSunW);
          float skyGone = max(0.0, uCamSpace - (1.0 - exp(-max(length(vPlanetPos) - ${F(R)}, 0.0) / 420.0)));
          totalEmissiveRadiance += diffuseColor.rgb * uSkyLit * (skyGone * smoothstep(-0.16, 0.10, sunHere) * mix(0.5, 1.0, smoothstep(0.0, 0.45, sunHere))); }`)
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
  mat.customProgramCacheKey = () => 'terrain46' + (o.fine !== false ? 'F' : '');
  return mat;
}
