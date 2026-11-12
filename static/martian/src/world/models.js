/*
 * 3D models. The real ones are .glb files built by tools/assets (see tools/assets/SPEC.md);
 * a few props that have not been rebuilt yet still come from the first version's baked
 * triangle data (legacyModel), and are replaced as their .glb arrives.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { asset } from '../planet/load.js';
import { MODELS_DATA } from './legacy-models.js';

const loaded = new Map();           // name -> { scene, animations, skinned }
const EMISSIVE = /^(light_|screen|flame|window_glow)/;
/** Materials the game drives by name, or that cannot be folded into a shared one. */
const SPECIAL = /^(light_|screen|flame|window_glow|glass_clear|solar_cell|void)/;
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
  plain.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aPbr;\nvarying vec2 vPbr;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = aPbr;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPbr;')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = clamp(vPbr.x, 0.05, 1.0);')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = clamp(vPbr.y, 0.0, 1.0);');
  };
  plain.customProgramCacheKey = () => 'plain-pbr';
  return plain;
}

function floatGeometry(src, color, rough, metal) {
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
  const pbr = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { pbr[i * 2] = rough; pbr[i * 2 + 1] = metal; }
  g.setAttribute('aPbr', new THREE.BufferAttribute(pbr, 2));
  if (src.index) g.setIndex(new THREE.BufferAttribute(Uint32Array.from(src.index.array), 1));
  return g;
}

function mergeStatic(scene) {
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
    g.get(target).push({ mesh: o, bake: !special });
  });
  const inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  for (const [owner, byMat] of groups) {
    inv.copy(owner.matrixWorld).invert();
    for (const [mat, list] of byMat) {
      const geos = list.map(({ mesh, bake }) => {
        const g = floatGeometry(mesh.geometry, bake ? mesh.material.color : null, mesh.material.roughness, mesh.material.metalness);
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

function prepare(gltf) {
  let skinned = false;
  gltf.scene.traverse((o) => { if (o.isSkinnedMesh) skinned = true; });
  if (!skinned) mergeStatic(gltf.scene);
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
        m.transparent = true; m.depthWrite = false; m.opacity = 0.28; m.roughness = 0.06; m.metalness = 0.0;
        m.envMapIntensity = 1.6; m.side = THREE.DoubleSide;
        o.castShadow = false;
      } else if (EMISSIVE.test(name)) {
        m.toneMapped = true;
        m.userData.baseEmissive = m.emissiveIntensity || 1;
        o.castShadow = false;
      } else if (name === 'void') {
        m.color.set(0x000000); m.roughness = 1;
      }
      if (m.metalness > 0.5) m.envMapIntensity = 1.25;
      m.userData.modelMaterial = true;
    }
  });
  return { scene: gltf.scene, animations: gltf.animations || [], skinned };
}

/** Load a set of models before the world is built. Missing files are skipped (returns the
 *  names that loaded), so a model that is still being made simply falls back. */
export async function preloadModels(names, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  let done = 0;
  const ok = [];
  await Promise.all(names.map(async (name) => {
    if (!loaded.has(name)) {
      try {
        const gltf = await loader.loadAsync(asset(`assets/models/${name}.glb`));
        loaded.set(name, prepare(gltf));
      } catch (e) { /* not built yet */ }
    }
    if (loaded.has(name)) ok.push(name);
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
 *  (blink a lamp, switch a screen on) without changing every other instance. */
export function ownMaterials(obj) {
  const out = [];
  if (!obj) return out;
  obj.traverse((m) => {
    if (!m.isMesh) return;
    if (Array.isArray(m.material)) m.material = m.material.map((x) => { const c = x.clone(); c.userData = { ...x.userData }; out.push(c); return c; });
    else { const c = m.material.clone(); c.userData = { ...m.material.userData }; m.material = c; out.push(c); }
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

// ------------------------------------------------------------------------------------------
// First-version models (triangle soup with flat colours)
// ------------------------------------------------------------------------------------------
export function legacyModel(name, scale) {
  const g = new THREE.Group();
  const byName = {};
  for (const p of MODELS_DATA[name]) {
    const geo = new THREE.BufferGeometry();
    const v = new Float32Array(p.v.length);
    for (let i = 0; i < p.v.length; i++) v[i] = p.v[i] / 1000;
    geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.c[0], p.c[1], p.c[2]), roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
    if (p.o !== undefined) { mat.transparent = true; mat.opacity = p.o; mat.depthWrite = false; }
    if (p.e) { mat.emissive = new THREE.Color(p.e[0], p.e[1], p.e[2]); mat.emissiveIntensity = 2; }
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p.p[0] / 1000, p.p[1] / 1000, p.p[2] / 1000);
    m.name = p.n;
    m.castShadow = p.o === undefined;
    m.receiveShadow = true;
    byName[p.n] = m;
    if (p.par && byName[p.par]) byName[p.par].add(m);
    else g.add(m);
  }
  g.rotation.y = Math.PI;
  if (scale) g.scale.setScalar(scale);
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}
/** @deprecated name kept for the modules not yet moved to .glb models */
export const buildModel = legacyModel;
