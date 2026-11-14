/*
 * 3D models: .glb files built by tools/assets (see tools/assets/SPEC.md), loaded once and
 * instanced. Plain surfaces of a model are folded into one mesh per moving part.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { asset } from '../planet/load.js';
import { detailTextures } from '../render/noise3d.js';
import { GLSL_GROUND_GRADE } from '../render/terrain-material.js';

const loaded = new Map();
const _dustTint = new THREE.Color(0.30, 0.19, 0.115);
/** Models built of sheet with one face. */
const TWO_SIDED = /mars3/;

let _screenTex = null;
/** What the monitors show: four panels in one picture (levels, a trace, the planet with a fix on it, a log). */
function screenTexture() {
  if (_screenTex) return _screenTex;
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S * 2;
  const g = c.getContext('2d'), ink = '#a8ecfa', dim = '#4fa3ba', rule = '#1a4a5e', warm = '#ffb45a';
  const panel = (i, draw) => { g.save(); g.translate((i % 2) * S, (i >> 1) * S); g.beginPath(); g.rect(0, 0, S, S); g.clip(); g.fillStyle = '#0d3247'; g.fillRect(0, 0, S, S); draw(); g.restore(); };
  panel(0, () => {
    g.fillStyle = ink; g.fillRect(18, 16, 96, 12); g.fillStyle = dim; g.fillRect(180, 18, 56, 8);
    [0.82, 0.64, 0.91, 0.38, 0.72, 0.55, 0.87].forEach((w, k) => {
      const y = 48 + k * 28;
      g.fillStyle = dim; g.fillRect(18, y + 2, 52, 8); g.fillStyle = rule; g.fillRect(84, y, 150, 12); g.fillStyle = k === 3 ? warm : ink; g.fillRect(84, y, 150 * w, 12);
    });
  });
  panel(1, () => {
    g.strokeStyle = rule; g.lineWidth = 1;
    for (let k = 1; k < 8; k++) { g.beginPath(); g.moveTo(k * 32, 24); g.lineTo(k * 32, 236); g.moveTo(16, k * 30); g.lineTo(240, k * 30); g.stroke(); }
    const trace = (col, w, f) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let x = 16; x <= 240; x += 4) { const y = f(x); if (x === 16) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); };
    trace(ink, 3, (x) => 140 - 50 * Math.sin(x * 0.045) - 20 * Math.sin(x * 0.13 + 1) - (x > 170 ? (x - 170) * 0.5 : 0));
    trace(warm, 2, (x) => 196 - 18 * Math.cos(x * 0.03));
    g.fillStyle = ink; g.fillRect(18, 8, 70, 8);
  });
  panel(2, () => {
    g.fillStyle = 'rgba(181, 87, 44, 0.4)'; g.beginPath(); g.arc(128, 132, 87, 0, 7); g.fill();
    g.strokeStyle = dim; g.lineWidth = 1.5; g.beginPath(); g.arc(128, 132, 88, 0, 7); g.stroke();
    for (const k of [0.35, 0.7]) { g.beginPath(); g.ellipse(128, 132, 88 * k, 88, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(128, 132, 88, 88 * k, 0, 0, 7); g.stroke(); }
    g.fillStyle = warm; g.beginPath(); g.arc(158, 112, 5, 0, 7); g.fill(); g.strokeStyle = warm; g.beginPath(); g.arc(158, 112, 11, 0, 7); g.stroke();
    g.fillStyle = ink; g.fillRect(18, 14, 84, 10); g.fillStyle = dim; g.fillRect(18, 234, 120, 8);
  });
  panel(3, () => {
    g.fillStyle = ink; g.fillRect(18, 16, 64, 10);
    for (let k = 0; k < 11; k++) { g.fillStyle = k === 4 ? warm : k % 3 === 0 ? ink : dim; g.fillRect(18, 44 + k * 18, 60 + ((k * 73) % 150), 7); }
  });
  _screenTex = new THREE.CanvasTexture(c);
  _screenTex.colorSpace = THREE.SRGBColorSpace;
  _screenTex.anisotropy = 4;
  return _screenTex;
}
const _sp = new THREE.Vector3(), _sn = new THREE.Vector3(), _sm = new THREE.Matrix3();
/**
 * Texture coordinates for a mesh of flat screens (the models carry none). Each separate screen in the mesh is
 * laid on one of the four panels, the right way up and the right way round for whoever stands facing it.
 */
function screenUVs(o) {
  const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, idx = geo.index, n = pos.count;
  if (!nor) return;
  o.updateWorldMatrix(true, false);
  _sm.getNormalMatrix(o.matrixWorld);
  const P = new Float32Array(n * 3), parent = new Int32Array(n), seen = new Map();
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let i = 0; i < n; i++) {
    parent[i] = i;
    _sp.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
    P[i * 3] = _sp.x; P[i * 3 + 1] = _sp.y; P[i * 3 + 2] = _sp.z;
    const key = Math.round(_sp.x * 500) + ',' + Math.round(_sp.y * 500) + ',' + Math.round(_sp.z * 500), j = seen.get(key);
    if (j === undefined) seen.set(key, i); else parent[find(i)] = find(j);
  }
  for (let t = 0, T = idx ? idx.count : n; t < T; t += 3) {
    const a = find(idx ? idx.getX(t) : t);
    parent[find(idx ? idx.getX(t + 1) : t + 1)] = a; parent[find(idx ? idx.getX(t + 2) : t + 2)] = a;
  }
  const groups = new Map();
  for (let i = 0; i < n; i++) { const r = find(i); let list = groups.get(r); if (!list) groups.set(r, list = []); list.push(i); }
  const uv = new Float32Array(n * 2);
  let gi = 0;
  for (const whole of groups.values()) {
    // A screen is drawn as a thin slab, and a slab has six faces: each face is laid out by its own normal. (They were
    // laid out by the normal of the whole slab, which is the sum of six that cancel: whatever rounding error was
    // left chose the axes, and a monitor showed a sliver of its panel stretched across it, or nothing.)
    const faces = new Map();
    for (const i of whole) {
      _sn.fromBufferAttribute(nor, i).applyMatrix3(_sm).normalize();
      const key = Math.round(_sn.x * 3) + ',' + Math.round(_sn.y * 3) + ',' + Math.round(_sn.z * 3);
      let f = faces.get(key);
      if (!f) faces.set(key, f = []);
      f.push(i);
    }
    const tile = gi++ % 4;
    for (const list of faces.values()) {
      let nx = 0, ny = 0, nz = 0;
      for (const i of list) { _sn.fromBufferAttribute(nor, i).applyMatrix3(_sm); nx += _sn.x; ny += _sn.y; nz += _sn.z; }
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      // to the right of someone facing it (up × normal), and up the screen (normal × right)
      let ux = 1, uz = 0;
      if (Math.abs(ny) < 0.9) { const l = Math.hypot(nz, nx) || 1; ux = nz / l; uz = -nx / l; }
      const vx = ny * uz, vy = nz * ux - nx * uz, vz = -ny * ux;
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (const i of list) {
        const a = P[i * 3] * ux + P[i * 3 + 2] * uz, b = P[i * 3] * vx + P[i * 3 + 1] * vy + P[i * 3 + 2] * vz;
        if (a < u0) u0 = a; if (a > u1) u1 = a; if (b < v0) v0 = b; if (b > v1) v1 = b;
      }
      const du = u1 - u0 || 1, dv = v1 - v0 || 1;
      for (const i of list) {
        const a = P[i * 3] * ux + P[i * 3 + 2] * uz, b = P[i * 3] * vx + P[i * 3 + 1] * vy + P[i * 3 + 2] * vz;
        uv[i * 2] = ((tile & 1) + 0.03 + 0.94 * (a - u0) / du) / 2;
        uv[i * 2 + 1] = (1 - (tile >> 1) + 0.03 + 0.94 * (b - v0) / dv) / 2;
      }
    }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}           // name -> { scene, animations, skinned }
const EMISSIVE = /^(light_|screen|flame|window_glow|helmet_light)/;
/** Materials the game drives by name, or that cannot be folded into a shared one. */
const SPECIAL = /^(light_|screen|flame|window_glow|glass_clear|solar_cell|void|visor|helmet_|head_|ice$)/;
/*
 * Dust. Nothing stays clean on Mars: dust settles on what faces up, drifts against what stands
 * on the ground, and takes the shine off everything. It is laid on in the shader, by an amount
 * each model is given when it loads: a lander that has stood for decades carries a great deal,
 * the Hab and the rover some, the astronaut a little, the inside of the Hab none.
 */
const DUST = {
  default: 0.3,
  // (the second review: decades-old landers were a uniform beige wash, and his own gear showroom-clean.
  //  Dust now lies mostly on what faces up and near the ground, so less of it goes further.)
  hab: 0.46, rover: 0.5, astronaut: 0.34, mav: 0.38, hermes: 0, farm_plot: 0, solar_panel: 0.34, uplink_dish: 0.4, uplink_pad: 0.16,
  pathfinder: 0.4, viking: 0.44, mars3: 0.64, beagle2: 0.6, mer: 0.6, phoenix: 0.56, msl: 0.48, m2020: 0.4, insight: 0.54, ingenuity: 0.46, zhurong: 0.5,
  schiaparelli_wreck: 0.2, debris_a: 0.55, debris_b: 0.55, debris_c: 0.55, rtg: 0.5, supply_pod: 0.3,
  greenhouse: 0.26, solar_kit: 0.22, beacon: 0.22, o2_cache: 0.22, regolith_pile: 0, ice_outcrop: 0,
  crop_radish: 0, crop_soy: 0, crop_tomato: 0, crop_lettuce: 0, hab_comforts: 0,
};
/** Materials that are the ground itself: drawn in the local ground colour, tinted by their vertex colours. */
const GROUND = /^ground_dust/;
/** Parts that are indoors, whatever their model's dust. */
const CLEAN_PARTS = /^(interior|soil|plants|plants_dead)/;
/** What the dust shader needs from the world: set once the planet's colour map is loaded, and each frame. */
export const dustUniforms = { uDustGrain: { value: null }, uDustAlbedo: { value: null }, uDustHere: { value: new THREE.Vector3(0, 1, 0) }, uFill: { value: 1 }, uRim: { value: 0 } };
/** What a mirror shows out of doors: the sky at the horizon and overhead, and the lit ground. Set each frame. */
export const mirrorUniforms = { uDustHere: dustUniforms.uDustHere, uSkyHor: { value: new THREE.Color(0.76, 0.47, 0.235) }, uSkyTop: { value: new THREE.Color(0.52, 0.32, 0.16) }, uGroundLit: { value: new THREE.Color(0.3, 0.15, 0.08) } };

/*
 * No lamp lights a surface past what the picture can hold. A helmet lamp a pace from white paint, or its glint on a
 * smooth panel, otherwise goes many times over white, and the bloom turns that into a four-pointed star: the dome at
 * night had one burning in it wherever he stood. The cap is on the lamps alone (point and spot lights, which three
 * adds up first); the sun is added after it and keeps its glints. (Sunlit white is about 0.9 on this scale.)
 */
const LIGHTS_BEGIN = (() => {
  const chunk = THREE.ShaderChunk.lights_fragment_begin;
  const cap = `#if ( NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	reflectedLight.directSpecular = min( reflectedLight.directSpecular, vec3( 0.6 ) );
	reflectedLight.directDiffuse = min( reflectedLight.directDiffuse, vec3( 0.9 ) );
#endif
`;
  for (const mark of ['#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )', '#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )']) {
    const i = chunk.indexOf(mark);
    if (i >= 0) return chunk.slice(0, i) + cap + chunk.slice(i);
  }
  return chunk;      // (a three that orders its lights otherwise: leave it alone)
})();
export const capLocalLights = (fragmentShader) => fragmentShader.replace('#include <lights_fragment_begin>', LIGHTS_BEGIN);

let plain = null, plainGround = null;
/** Plain opaque materials differ only in colour, roughness and metalness, so those can live in
 *  the vertices and every such surface of a part can be one mesh with one shared material.
 *  This turns the Hab's ~100 draw calls into about fifteen. */
function plainMaterial(ground = false) {
  if (ground ? plainGround : plain) return ground ? plainGround : plain;
  const made = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 1 });
  if (ground) { plainGround = made; made.transparent = true; } else plain = made;
  return setUpPlain(made, ground);
}
function setUpPlain(plain, ground) {
  plain.name = ground ? 'plain_ground' : 'plain';
  plain.envMapIntensity = 1.15;
  plain.userData.modelMaterial = true;
  dustUniforms.uDustGrain.value = detailTextures().grain;
  plain.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, dustUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aPbr;\nvarying vec3 vPbr;\nvarying vec3 vObjPos;\nvarying vec3 vObjN;' + (ground ? '\nattribute float aHem;\nvarying float vHem;' : ''))
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = aPbr; vObjPos = position; vObjN = normal;' + (ground ? ' vHem = aHem;' : ''));
    shader.fragmentShader = capLocalLights(shader.fragmentShader)
      .replace('#include <common>', `#include <common>
        varying vec3 vPbr; varying vec3 vObjPos; varying vec3 vObjN;
        uniform highp sampler3D uDustGrain;
        uniform samplerCube uDustAlbedo;
        uniform vec3 uDustHere;
        uniform float uFill;
        uniform float uRim;
        #ifndef USE_NORMALMAP_OBJECTSPACE
        uniform mat3 normalMatrix;
        #endif
        ${GLSL_GROUND_GRADE}
        float dustAmount;
        float surfGrain;
        ${ground ? 'varying float vHem;' : ''}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          // more on what faces up, more near the ground, in patches; none where the model has none
          float patchy = texture(uDustGrain, vObjPos * 0.9 + 0.31).a;
          float fine = texture(uDustGrain, vObjPos * 5.3).a;
          float facing = smoothstep(-0.35, 0.85, normalize(vObjN).y);
          float low = 1.0 - smoothstep(0.05, 0.75, vObjPos.y);
          vec3 dust = groundColour(textureCube(uDustAlbedo, uDustHere).rgb, uDustHere) * 1.05;
          if (vPbr.z > 1.5) {
            // soil that belongs to the ground (a heap, a berm, a scorched patch): the ground's own colour here,
            // darkened by the model's tint, which returns to 1 at the hem so the edge cannot be seen
            dustAmount = 0.0;
            diffuseColor.rgb *= dust * (0.86 + 0.28 * fine);
          } else {
            // (laid unevenly: drifts and clean patches, heavy on what faces up, a skirt of it thrown up near the ground)
            float low2 = 1.0 - smoothstep(0.1, 1.5, vObjPos.y);
            dustAmount = clamp(vPbr.z * (0.05 + 1.25 * facing * facing + 0.55 * low + 0.45 * low2) * (0.15 + 1.9 * patchy * patchy) * 1.25 + vPbr.z * (fine - 0.5) * 0.3, 0.0, 0.94);
            dust *= 0.86;
            // no real surface is one flat colour: a broad mottle and a fine grain, fixed in the model's own space
            diffuseColor.rgb *= 0.925 + 0.11 * patchy + (fine - 0.5) * 0.09;
            diffuseColor.rgb = mix(diffuseColor.rgb, dust, dustAmount);
          }
          surfGrain = fine;
          ${ground ? '// the hem of a soil apron thins out to nothing, so its edge cannot be seen against the ground\n          diffuseColor.a *= smoothstep(0.0, 1.0, vHem);' : ''}
        }`)
      // soil that is part of the ground is not a smooth casting: give it the ground's own grain
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (vPbr.z > 1.5) {
          vec3 gA = texture(uDustGrain, vObjPos * 1.7).rgb * 2.0 - 1.0;
          vec3 gB = texture(uDustGrain, vObjPos * 0.37 + 0.2).rgb * 2.0 - 1.0;
          normal = normalize(normal + normalMatrix * (gA * 0.30 + gB * 0.42));
        }`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(clamp(vPbr.x * (0.86 + 0.28 * surfGrain), 0.05, 1.0), 0.96, dustAmount);')
      // soil has no sheen (the terrain's own material has none): with one, an apron pales at a low angle and shows
      .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n if (vPbr.z > 1.5) { material.specularColor *= 0.16; material.specularColorBlended *= 0.16; material.specularF90 *= 0.16; }')
      // (... and less of it on what faces away from the sun: the Martian sky is brightest round the sun, and a surface
      // turned from it sees the dimmer half. With the sun ahead, a white back lit evenly by the whole sky measured as
      // bright as the sunlit sand.)
      .replace('#include <lights_fragment_maps>', `
        float skyFill = uFill;
        #if NUM_DIR_LIGHTS > 0
        // (most of it gone, not under half: seen from behind with the sun ahead, his white back was still the
        // brightest thing in the picture, lit alike from every side)
        // (... and what is left is the cooler half of the sky, more of it on what faces up: at seven tenths gone and
        // one flat tone his shaded side was the colour of the dirt behind him, with no form in it)
        float turned = min(uRim, 1.0) * clamp(-dot(normal, directionalLights[0].direction), 0.0, 1.0);
        vec3 fillTint = vec3(skyFill * (1.0 - 0.58 * turned)) * mix(vec3(1.0), vec3(0.90, 0.98, 1.10) * (0.84 + 0.30 * dot(normal, normalize((viewMatrix * vec4(uDustHere, 0.0)).xyz))), turned);
        #else
        vec3 fillTint = vec3(skyFill);
        #endif
        irradiance *= fillTint;
        #include <lights_fragment_maps>
        iblIrradiance *= fillTint; radiance *= fillTint;`)
      // Seen against the sun, dusty cloth and metal catch its light along their edge: the rim that separates a figure
      // from the ground behind it. (Out of doors only: uRim is 0 under a roof, where the "sun" is the ceiling's lamps.)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        #if NUM_DIR_LIGHTS > 0
        {
          vec3 rimV = normalize(vViewPosition);
          float rimBack = max(0.0, -dot(directionalLights[0].direction, rimV));
          float rimEdge = pow(1.0 - clamp(dot(normal, rimV), 0.0, 1.0), 3.0) * smoothstep(-0.2, 0.25, dot(normal, directionalLights[0].direction));
          // (stronger and not squared: at a tenth of the sun's light on an edge, under a high sun, no rim could be seen)
          // (bounded: a rim many times brighter than white on an edge one pixel wide was a string of sparks along his outline)
          reflectedLight.directDiffuse += min(directionalLights[0].color * (uRim * rimBack * rimEdge * 1.5), vec3(1.4)) * diffuseColor.rgb;
        }
        #endif`)
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = clamp(vPbr.y, 0.0, 1.0) * (1.0 - dustAmount);');
  };
  plain.customProgramCacheKey = () => 'plain-pbr-dust13' + (ground ? 'G' : '');
  return plain;
}

function floatGeometry(src, color, rough, metal, dust = 0) {
  const g = new THREE.BufferGeometry();
  const p = src.attributes.position, n = src.attributes.normal, c = src.attributes.color;
  const pos = new Float32Array(p.count * 3), nor = new Float32Array(p.count * 3), col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    pos[i * 3] = p.getX(i); pos[i * 3 + 1] = p.getY(i); pos[i * 3 + 2] = p.getZ(i);
    if (n) { nor[i * 3] = n.getX(i); nor[i * 3 + 1] = n.getY(i); nor[i * 3 + 2] = n.getZ(i); }
    const a = c ? c.getX(i) : 1;
    col[i * 3] = (color ? color.r : 1) * a; col[i * 3 + 1] = (color ? color.g : 1) * (c ? c.getY(i) : 1); col[i * 3 + 2] = (color ? color.b : 1) * (c ? c.getZ(i) : 1);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // polished metal sparkles into the bloom at a distance: keep a little roughness on it
  if (metal > 0.5) rough = Math.max(rough, 0.34);
  const pbr = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { pbr[i * 3] = rough; pbr[i * 3 + 1] = metal; pbr[i * 3 + 2] = dust; }
  g.setAttribute('aPbr', new THREE.BufferAttribute(pbr, 3));
  if (src.index) g.setIndex(new THREE.BufferAttribute(Uint32Array.from(src.index.array), 1));
  return g;
}

function mergeStatic(scene, dust) {
  scene.updateMatrixWorld(true);
  const groups = new Map();                        // owner -> Map(material -> [mesh])
  scene.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || Array.isArray(o.material)) return;
    let owner = o.parent;
    while (owner && owner !== scene && !(owner.userData && owner.userData.part)) owner = owner.parent;
    owner = owner || scene;
    const m = o.material;
    const special = SPECIAL.test(m.name || '') || m.transparent || m.map;
    const isGround = GROUND.test(m.name || '');
    const target = special ? m : plainMaterial(isGround);
    if (!groups.has(owner)) groups.set(owner, new Map());
    const g = groups.get(owner);
    if (!g.has(target)) g.set(target, []);
    g.get(target).push({ mesh: o, bake: !special, ground: isGround });
  });
  const inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  for (const [owner, byMat] of groups) {
    inv.copy(owner.matrixWorld).invert();
    for (const [mat, list] of byMat) {
      const geos = list.map(({ mesh, bake, ground }) => {
        const g = ground ? floatGeometry(mesh.geometry, null, 0.96, 0, 2)
          : floatGeometry(mesh.geometry, bake ? mesh.material.color : null, mesh.material.roughness, mesh.material.metalness, CLEAN_PARTS.test(owner.name || '') ? 0 : dust);
        g.applyMatrix4(rel.multiplyMatrices(inv, mesh.matrixWorld));
        return g;
      });
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
      if (!merged) continue;
      merged.computeBoundingSphere();
      if (list[0].ground) merged.setAttribute('aHem', new THREE.BufferAttribute(hemOf(merged), 1));
      if (!list[0].bake) { mat.vertexColors = true; mat.needsUpdate = true; merged.deleteAttribute('aPbr'); }
      const mesh = new THREE.Mesh(merged, mat);
      mesh.name = (owner.name || 'model') + ':' + (mat.name || 'm');
      for (const { mesh: old } of list) { old.parent.remove(old); old.geometry.dispose(); }
      owner.add(mesh);
    }
  }
}

/** Surfaces of a skinned model that are shown and hidden together, each folded into one mesh of its own:
 *  the helmet shell (its lamps and visor stay separate, being driven materials) and the head under it. */
const SKIN_GROUPS = [['helmet', /^helmet_(white|dark|metal)/], ['head', /^head_/]];
/** For a soil apron: per vertex, 0 on the mesh's open edge rising to 1 half a metre in from it. */
function hemOf(geo) {
  const p = geo.attributes.position, idx = geo.index ? geo.index.array : null, n = idx ? idx.length : p.count;
  const at = (k) => (idx ? idx[k] : k);
  const key = (i) => `${Math.round(p.getX(i) * 400)},${Math.round(p.getY(i) * 400)},${Math.round(p.getZ(i) * 400)}`;
  // an edge used by one triangle only is on the border (positions are welded by rounding: packing splits vertices)
  const edges = new Map(), where = new Map();
  for (let k = 0; k + 2 < n; k += 3) {
    const v = [at(k), at(k + 1), at(k + 2)], ks = v.map(key);
    for (let e = 0; e < 3; e++) {
      const a = ks[e], b = ks[(e + 1) % 3];
      if (a === b) continue;
      const id = a < b ? a + '|' + b : b + '|' + a;
      edges.set(id, (edges.get(id) || 0) + 1);
      where.set(a, v[e]); where.set(b, v[(e + 1) % 3]);
    }
  }
  const border = [];
  for (const [id, c] of edges) if (c === 1) for (const kk of id.split('|')) { const i = where.get(kk); border.push(p.getX(i), p.getY(i), p.getZ(i)); }
  // ... and so is wherever the apron meets the ground (its own frame's zero): what lies below is buried anyway
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0.006) border.push(p.getX(i), p.getY(i), p.getZ(i));
  const hem = new Float32Array(p.count).fill(1);
  if (!border.length) return hem;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let d2 = 1e9;
    for (let b = 0; b < border.length; b += 3) { const dx = x - border[b], dy = y - border[b + 1], dz = z - border[b + 2], d = dx * dx + dy * dy + dz * dz; if (d < d2) d2 = d; }
    hem[i] = Math.min(1, Math.sqrt(d2) / 0.6);
  }
  return hem;
}

/** The same folding for a skinned model: its plain surfaces become one skinned mesh ("body"), and each
 *  group above another. */
function mergeSkinned(scene, dust) {
  const all = [];
  scene.traverse((o) => { if (o.isSkinnedMesh && !Array.isArray(o.material)) all.push(o); });
  const groupOf = (o) => {
    const n = o.material.name || '';
    for (const [g, re] of SKIN_GROUPS) if (re.test(n)) return g;
    return SPECIAL.test(n) || o.material.transparent || o.material.map ? null : 'body';
  };
  for (const group of ['body', ...SKIN_GROUPS.map((g) => g[0])]) {
    const ones = all.filter((o) => groupOf(o) === group);
    if (!ones.length) continue;
    const first = ones[0];
    if (!ones.every((o) => o.parent === first.parent && o.skeleton.bones.length === first.skeleton.bones.length)) continue;
    // A packed model's vertices are whole numbers (0 to 65535), and its node carries the scale and offset that turn
    // them into metres. Skinning ignores that node (the bones' own matrices undo the packing), so the shader saw
    // "positions" thousands of units tall: dust that gathers near the ground never reached his boots, and the
    // mottle on his suit was noise. The vertices are put into metres here, and the binding takes the packing out.
    // (the packing sits on the mesh's own node or, for a mesh of several materials, on the group that holds them)
    scene.updateMatrixWorld(true);
    const unpack = first.matrixWorld.clone(), repack = unpack.clone().invert();
    const geos = ones.map((o) => {
      const g = floatGeometry(o.geometry, o.material.color, o.material.roughness, o.material.metalness, group === 'head' ? 0 : dust);
      g.applyMatrix4(unpack);
      const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
      const idx = new Uint16Array(si.count * 4), wgt = new Float32Array(si.count * 4);
      for (let i = 0; i < si.count; i++) {
        idx[i * 4] = si.getX(i); idx[i * 4 + 1] = si.getY(i); idx[i * 4 + 2] = si.getZ(i); idx[i * 4 + 3] = si.getW(i);
        wgt[i * 4] = sw.getX(i); wgt[i * 4 + 1] = sw.getY(i); wgt[i * 4 + 2] = sw.getZ(i); wgt[i * 4 + 3] = sw.getW(i);
      }
      g.setAttribute('skinIndex', new THREE.BufferAttribute(idx, 4));
      g.setAttribute('skinWeight', new THREE.BufferAttribute(wgt, 4));
      return g;
    });
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) continue;
    const mesh = new THREE.SkinnedMesh(merged, plainMaterial());
    mesh.name = group;
    mesh.frustumCulled = false;
    first.parent.add(mesh);
    mesh.bind(first.skeleton, first.bindMatrix.clone().multiply(repack));
    for (const o of ones) { o.parent.remove(o); o.geometry.dispose(); }
  }
}

function prepare(gltf, name) {
  const dust = DUST[name] === undefined ? DUST.default : DUST[name], twoSided = TWO_SIDED.test(name);
  let skinned = false;
  gltf.scene.traverse((o) => { if (o.isSkinnedMesh) skinned = true; });
  if (skinned) mergeSkinned(gltf.scene, dust); else mergeStatic(gltf.scene, dust);
  const seen = new Set();
  gltf.scene.traverse((o) => {
    if (o.isSkinnedMesh) { skinned = true; o.frustumCulled = false; }
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      const name = m.name || '';
      // What belongs to the mesh is set on every mesh. (It was set with the material, once: of a model's panes of glass
      // only the first cast no shadow, so a glass dome shaded its own floor like a tin one, and of its monitors only
      // the first had a picture laid on it.)
      if (name.startsWith('glass_clear') || EMISSIVE.test(name) || name.startsWith('solar_cell')) o.castShadow = false;
      if (name.startsWith('screen')) screenUVs(o);
      if (seen.has(m)) continue;
      seen.add(m);
      if (name.startsWith('glass_clear')) {
        // (not mirror-smooth: a lamp a metre away would otherwise reflect as a white-out)
        // (and dark in itself: a pane takes a glint from a lamp, it does not light up like a sheet of paper held to it)
        m.transparent = true; m.depthWrite = false; m.opacity = 0.2; m.roughness = 0.12; m.metalness = 0.0;
        m.color.setRGB(0.035, 0.045, 0.055);
        m.envMapIntensity = 1.6; m.side = THREE.DoubleSide;
        // (and its glint from a lamp is a glint: the helmet lamp three metres off still burnt a white star into a pane)
        // A pane is seen by what it does to the light: looked through squarely it is almost not there, and looked along
        // it mirrors the sky. And glass on Mars carries a film of dust. (At one faint tint from every angle a dome of
        // it read as an open frame with nothing in it.)
        m.onBeforeCompile = (sh) => {
          sh.fragmentShader = sh.fragmentShader
            .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n  reflectedLight.directSpecular = min(reflectedLight.directSpecular * 0.07, vec3(0.5));')      // (and never bright enough to bloom: the dome's own lamp still starred a pane at night)
            .replace('#include <opaque_fragment>', `{ vec3 paneN = normalize(vNormal);
                float glance = pow(1.0 - abs(dot(paneN, normalize(vViewPosition))), 3.0);
                // the film of dust on it scatters the light that falls on either face: seen from inside a dome, the sun is behind the pane
                vec3 filmLit = reflectedLight.indirectDiffuse * 20.0;
                #if NUM_DIR_LIGHTS > 0
                  filmLit += directionalLights[0].color * (abs(dot(paneN, directionalLights[0].direction)) * 0.32);
                #endif
                outgoingLight += vec3(0.34, 0.24, 0.16) * filmLit * (0.35 + 0.65 * glance);
                diffuseColor.a = mix(diffuseColor.a + 0.10, 0.82, glance * 0.85); }
              #include <opaque_fragment>`);
        };
        m.customProgramCacheKey = () => 'glass4';
        o.castShadow = false;
      } else if (EMISSIVE.test(name)) {
        m.toneMapped = true;
        m.userData.baseEmissive = m.emissiveIntensity || 1;
        o.castShadow = false;
        if (name.startsWith('screen')) {
          // a monitor shows something: the models carry no pictures, so the panels are drawn here and each screen laid on one
          m.emissiveMap = screenTexture(); m.emissive.setRGB(1, 1, 1); m.color.setRGB(0.02, 0.03, 0.04); m.roughness = 0.25;
        }
      } else if (name === 'void') {
        m.color.set(0x000000); m.roughness = 1;
      } else if (name.startsWith('solar_cell')) {
        o.castShadow = false;                     // cells lie on a backing sheet that already casts
        if (dust >= 0.45) { m.color.lerp(_dustTint, dust * 0.75); m.roughness = Math.max(m.roughness, 0.7); m.metalness *= 0.4; }   // decades of dust on the old landers
      } else if (name === 'ice') {
        // water ice: cold, with a soft sheen, and never quite as dark as rock in shadow
        // (blue enough to read as ice under a butterscotch sky, which turns anything white to cream; and not a
        // mirror: old ice on Mars is frosted by its own wasting, and polished it was cut glass)
        m.color.setRGB(0.80, 0.90, 1.0); m.roughness = 0.42; m.metalness = 0; m.envMapIntensity = 1.1;
        m.emissive.setRGB(0.012, 0.03, 0.06); m.emissiveIntensity = 1;
      } else if (name.startsWith('visor')) {
        // the gold visor is a mirror: it shows the sky, the horizon and the sun
        m.color.setRGB(0.80, 0.50, 0.14); m.metalness = 1; m.roughness = 0.07; m.envMapIntensity = 1.9;
        // (The blurred sky map gave it two flat bands of orange, and it read as a painted disc. A curved mirror on
        // Mars shows a bright horizon bowed across it, darker sky above, darker ground below, and goes pale at its
        // rim: drawn here from where each point of the visor is looking, so the curve of the glass can be seen.)
        m.onBeforeCompile = (sh) => {
          Object.assign(sh.uniforms, mirrorUniforms);
          sh.fragmentShader = sh.fragmentShader
            .replace('#include <common>', '#include <common>\nuniform vec3 uDustHere; uniform vec3 uSkyHor; uniform vec3 uSkyTop; uniform vec3 uGroundLit;')
            .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
            {
              vec3 mV = normalize(vViewPosition);
              vec3 mR = reflect(-mV, normal);
              float el = dot(mR, normalize((viewMatrix * vec4(uDustHere, 0.0)).xyz));
              vec3 mSky = mix(uSkyHor * 1.25, uSkyTop * 0.62, smoothstep(0.03, 0.7, el));
              vec3 mGround = uGroundLit * mix(0.5, 1.05, smoothstep(-0.75, -0.04, el));
              vec3 mScene = mix(mGround, mSky, smoothstep(-0.05, 0.05, el));
              // (the horizon is not a ruled line between two tones: the haze along it glows, and the sky is brightest
              // round the sun, which the visor shows as a soft bloom with the sun's own spark in it. Two flat bands
              // with a hard split read as a sticker.)
              mScene += uSkyHor * (0.42 * exp(-(el * el) / 0.012));
              #if NUM_DIR_LIGHTS > 0
              {
                float toSun = max(dot(mR, directionalLights[0].direction), 0.0);
                mScene += directionalLights[0].color * (0.10 * pow(toSun, 14.0) + 0.9 * pow(toSun, 220.0)) * step(-0.05, el);
              }
              #endif
              float mEdge = pow(1.0 - clamp(dot(normal, mV), 0.0, 1.0), 4.0);
              reflectedLight.indirectSpecular = mScene * mix(diffuse * 1.5, vec3(1.0), mEdge * 0.8);
            }`);
        };
        m.customProgramCacheKey = () => 'visor3';
      }
      if (m.metalness > 0.5 && !name.startsWith('visor')) { m.envMapIntensity = 1.25; m.roughness = Math.max(m.roughness, 0.2); }
      // (thin sheet seen from both sides: a petal with its back cut away showed only its ribs)
      if (twoSided) m.side = THREE.DoubleSide;
      m.userData.modelMaterial = true;
    }
  });
  return { scene: gltf.scene, animations: gltf.animations || [], skinned };
}

/** Load a set of models before the world is built. A model that fails to load fails the
 *  whole load: the game is not playable with part of the world missing. */
export async function preloadModels(names, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  let done = 0;
  const ok = [];
  await Promise.all(names.map(async (name) => {
    if (!loaded.has(name)) {
      const gltf = await loader.loadAsync(asset(`assets/models/${name}.glb`));
      loaded.set(name, prepare(gltf, name));
    }
    ok.push(name);
    done++;
    if (onProgress) onProgress(done / names.length);
  }));
  return ok;
}

export function hasModel(name) { return loaded.has(name); }

/**
 * A fresh instance of a loaded model.
 * @param {string} name
 * @param {{face?: boolean}} [o]  face: turn the model so its front points along -Z, the way
 *        bodies and vehicles face in the game (models are authored facing +Z in glTF space)
 * @returns {{root: THREE.Group, part: (n:string)=>THREE.Object3D, clips: THREE.AnimationClip[], inner: THREE.Object3D}}
 */
export function model(name, o = {}) {
  const src = loaded.get(name);
  if (!src) throw new Error(`Model not loaded: ${name}`);
  const inner = src.skinned ? cloneSkinned(src.scene) : src.scene.clone(true);
  if (o.face) inner.rotation.y = Math.PI;
  const root = new THREE.Group();
  root.name = name;
  root.add(inner);
  const part = (n) => inner.getObjectByName(n);
  return { root, part, clips: src.animations, inner };
}

/** Give a part of an instance its own copies of its materials, so the game can drive it
 *  (blink a lamp, switch a screen on) without changing every other instance. `only` limits
 *  this to materials whose name matches (for example /^light_/). */
export function ownMaterials(obj, only) {
  const out = [];
  if (!obj) return out;
  const own = (x) => {
    if (only && !only.test(x.name || '')) return x;
    const c = x.clone(); c.userData = { ...x.userData }; out.push(c); return c;
  };
  obj.traverse((m) => {
    if (!m.isMesh) return;
    m.material = Array.isArray(m.material) ? m.material.map(own) : own(m.material);
  });
  return out;
}

/** Scale the glow of emissive materials (0 = off, 1 = as authored). */
export function setGlow(materials, k) {
  for (const m of materials) if (m.userData.baseEmissive !== undefined) m.emissiveIntensity = m.userData.baseEmissive * k;
}

/** Colliders described by a model: anchors named col_* with a radius, in the model's frame. */
export function colliderAnchors(inst) {
  const out = [];
  inst.inner.traverse((n) => {
    if (n.name && n.name.startsWith('col_') && n.userData && n.userData.radius) {
      out.push({ name: n.name, x: n.position.x, z: n.position.z, r: n.userData.radius, node: n });
    }
  });
  return out;
}
