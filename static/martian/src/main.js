// TEMPORARY entry point: a planet viewer used to bring up the new terrain and renderer.
import * as THREE from 'three';
import { Engine } from './render/engine.js';
import { loadPlanet, asset } from './planet/load.js';
import { Terrain } from './terrain/terrain.js';
import { makeTerrainMaterial } from './render/terrain-material.js';
import { llToVec, tangentBasis } from './planet/geo.js';
import { R } from './planet/constants.js';

const root = document.createElement('div');
root.id = 'mg-root';
document.body.appendChild(root);

async function boot() {
  const params = new URLSearchParams(location.search);
  const engine = new Engine(root, params.get('q') || 'high');
  const data = await loadPlanet(() => {});
  const material = makeTerrainMaterial(data.albedoCube, { fine: engine.q.fine });
  const terrain = new Terrain({
    planet: data.planet, heightData: data.heightData, parent: engine.scene, material,
    workerUrl: asset('terrain-worker.js'), grid: engine.q.grid, maxLevel: engine.q.maxLevel, split: engine.q.split, workers: engine.q.workers,
  });
  const state = { lat: 0, lon: 0, alt: 2, heading: 0, pitch: -0.05, tod: 0.3, dust: 0 };
  const up = new THREE.Vector3(), east = new THREE.Vector3(), north = new THREE.Vector3(), fwd = new THREE.Vector3(), tmp = new THREE.Vector3();
  const m = new THREE.Matrix4();
  function place() {
    llToVec(state.lat, state.lon, up);
    const ground = state.agl === false ? R : data.planet.radius(up.x, up.y, up.z);
    engine.camera.position.copy(up).multiplyScalar(ground + state.alt);
    tangentBasis(up, east, north);
    fwd.copy(north).multiplyScalar(Math.cos(state.heading)).addScaledVector(east, Math.sin(state.heading));
    fwd.multiplyScalar(Math.cos(state.pitch)).addScaledVector(up, Math.sin(state.pitch));
    tmp.copy(engine.camera.position).add(fwd);
    m.lookAt(engine.camera.position, tmp, up);
    engine.camera.quaternion.setFromRotationMatrix(m);
    // sun: local solar time `tod` (0 = midnight, 0.5 = noon) at this longitude
    const ha = (state.tod - 0.5) * Math.PI * 2;
    const lonR = state.lon * Math.PI / 180;
    engine.sunDir.set(Math.cos(lonR + ha), 0, -Math.sin(lonR + ha));
  }
  let last = performance.now();
  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    place();
    terrain.update(engine.camera.position);
    engine.update({ dt, dust: state.dust, focus: engine.camera.position });
    engine.render();
  }
  window.__MG = {
    engine, terrain, planet: data.planet, state,
    async view(v) { state.agl = true; state.dust = 0; Object.assign(state, v); place(); const ok = await terrain.settle(engine.camera.position); place(); return { ok, ...terrain.stats(), ...engine.info() }; },
  };
  place();
  await terrain.settle(engine.camera.position);
  frame();
  window.__MG.ready = true;
}
boot().catch((e) => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<pre style="color:#fff;position:fixed;inset:0;padding:20px">${e.stack || e}</pre>`); });
