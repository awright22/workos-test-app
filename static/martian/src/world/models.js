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
const _dustTint = new THREE.Color(0.30, 0.19, 0.115);           // name -> { scene, animations, skinned }
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
  hab: 0.46, rover: 0.5, astronaut: 0.16, mav: 0.38, hermes: 0, farm_plot: 0, solar_panel: 0.34, uplink_dish: 0.4, uplink_pad: 0.16,
  pathfinder: 0.4, viking: 0.6, mars3: 0.64, beagle2: 0.6, mer: 0.6, phoenix: 0.56, msl: 0.48, m2020: 0.4, insight: 0.54, ingenuity: 0.46, zhurong: 0.5,
  schiaparelli_wreck: 0.42, debris_a: 0.55, debris_b: 0.55, debris_c: 0.55, rtg: 0.5, supply_pod: 0.3,
  greenhouse: 0.26, solar_kit: 0.22, beacon: 0.22, o2_cache: 0.22, regolith_pile: 0, ice_outcrop: 0,
  crop_radish: 0, crop_soy: 0, crop_tomato: 0, crop_lettuce: 0, hab_comforts: 0,
};
/** Materials that are the ground itself: drawn in the local ground colour, tinted by their vertex colours. */
const GROUND = /^ground_dust/;
/** Parts that are indoors, whatever their model's dust. */
const CLEAN_PARTS = /^(interior|soil|plants|plants_dead)/;
/** What the dust shader needs from the world: set once the planet's colour map is loaded, and each frame. */
export const dustUniforms = { uDustGrain: { value: null }, uDustAlbedo: { value: null }, uDustHere: { value: new THREE.Vector3(0, 1, 0) } };

let plain = null;
/** Plain opaque materials differ only in colour, roughness and metalness, so those can live in
 *  the vertices and every such surface of a part can be one mesh with one shared material.
 *  This turns the Hab's ~100 draw calls into about fifteen. */
function plainMaterial() {
  if (plain) return plain;
  plain = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 1, roughness: 1 });
  plain.name = 'plain';
  plain.envMapIntensity = 1.15;
  plain.userData.modelMaterial = true;
  dustUniforms.uDustGrain.value = detailTextures().grain;
  plain.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, dustUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aPbr;\nvarying vec3 vPbr;\nvarying vec3 vObjPos;\nvarying vec3 vObjN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = aPbr; vObjPos = position; vObjN = normal;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vPbr; varying vec3 vObjPos; varying vec3 vObjN;
        uniform highp sampler3D uDustGrain;
        uniform samplerCube uDustAlbedo;
        uniform vec3 uDustHere;
        #ifndef USE_NORMALMAP_OBJECTSPACE
        uniform mat3 normalMatrix;
        #endif
        ${GLSL_GROUND_GRADE}
        float dustAmount;
        float surfGrain;`)
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
        }`)
      // soil that is part of the ground is not a smooth casting: give it the ground's own grain
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (vPbr.z > 1.5) {
          vec3 gA = texture(uDustGrain, vObjPos * 1.7).rgb * 2.0 - 1.0;
          vec3 gB = texture(uDustGrain, vObjPos * 0.37 + 0.2).rgb * 2.0 - 1.0;
          normal = normalize(normal + normalMatrix * (gA * 0.30 + gB * 0.42));
        }`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(clamp(vPbr.x * (0.86 + 0.28 * surfGrain), 0.05, 1.0), 0.96, dustAmount);')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = clamp(vPbr.y, 0.0, 1.0) * (1.0 - dustAmount);');
  };
  plain.customProgramCacheKey = () => 'plain-pbr-dust5';
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
    const target = special ? m : plainMaterial();
    if (!groups.has(owner)) groups.set(owner, new Map());
    const g = groups.get(owner);
    if (!g.has(target)) g.set(target, []);
    g.get(target).push({ mesh: o, bake: !special, ground: GROUND.test(m.name || '') });
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
    const geos = ones.map((o) => {
      const g = floatGeometry(o.geometry, o.material.color, o.material.roughness, o.material.metalness, group === 'head' ? 0 : dust);
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
    mesh.bind(first.skeleton, first.bindMatrix);
    for (const o of ones) { o.parent.remove(o); o.geometry.dispose(); }
  }
}

function prepare(gltf, name) {
  const dust = DUST[name] === undefined ? DUST.default : DUST[name];
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
      if (seen.has(m)) continue;
      seen.add(m);
      const name = m.name || '';
      if (name.startsWith('glass_clear')) {
        // (not mirror-smooth: a lamp a metre away would otherwise reflect as a white-out)
        m.transparent = true; m.depthWrite = false; m.opacity = 0.28; m.roughness = 0.17; m.metalness = 0.0;
        m.envMapIntensity = 1.6; m.side = THREE.DoubleSide;
        o.castShadow = false;
      } else if (EMISSIVE.test(name)) {
        m.toneMapped = true;
        m.userData.baseEmissive = m.emissiveIntensity || 1;
        o.castShadow = false;
      } else if (name === 'void') {
        m.color.set(0x000000); m.roughness = 1;
      } else if (name.startsWith('solar_cell')) {
        o.castShadow = false;                     // cells lie on a backing sheet that already casts
        if (dust >= 0.45) { m.color.lerp(_dustTint, dust * 0.75); m.roughness = Math.max(m.roughness, 0.7); m.metalness *= 0.4; }   // decades of dust on the old landers
      } else if (name === 'ice') {
        // water ice: cold, a little glossy, and never quite as dark as rock in shadow
        m.color.setRGB(0.74, 0.88, 1.0); m.roughness = 0.24; m.metalness = 0; m.envMapIntensity = 1.5;
        m.emissive.setRGB(0.035, 0.06, 0.095); m.emissiveIntensity = 1;
      } else if (name.startsWith('visor')) {
        // the gold visor is a mirror: it shows the sky, the horizon and the sun
        m.color.setRGB(0.80, 0.50, 0.14); m.metalness = 1; m.roughness = 0.07; m.envMapIntensity = 1.9;
      }
      if (m.metalness > 0.5 && !name.startsWith('visor')) { m.envMapIntensity = 1.25; m.roughness = Math.max(m.roughness, 0.2); }
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
