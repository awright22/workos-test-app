import * as THREE from 'three';
import { MODELS_DATA } from './legacy-models.js';
// Model construction. (First-version triangle-soup data; being replaced by .glb models.)
export function buildModel(name, scale) {
  const g = new THREE.Group();
  const byName = {};
  for (const p of MODELS_DATA[name]) {
    const geo = new THREE.BufferGeometry();
    const v = new Float32Array(p.v.length);
    for (let i = 0; i < p.v.length; i++) v[i] = p.v[i] / 1000;
    geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(p.c[0], p.c[1], p.c[2]), side: THREE.DoubleSide });
    if (p.o !== undefined) { mat.transparent = true; mat.opacity = p.o; }
    if (p.e) mat.emissive = new THREE.Color(p.e[0], p.e[1], p.e[2]);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p.p[0] / 1000, p.p[1] / 1000, p.p[2] / 1000);
    m.name = p.n;
    byName[p.n] = m;
    // parented parts attach to their parent (pivot-relative); others to the root
    if (p.par && byName[p.par]) byName[p.par].add(m);
    else g.add(m);
  }
  // Blender -Y "forward" exports to three +Z; spin the whole model so it faces -Z
  g.rotation.y = Math.PI;
  if (scale) g.scale.setScalar(scale);
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}
