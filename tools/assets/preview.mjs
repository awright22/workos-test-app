#!/usr/bin/env node
/*
 * Render review images of a model under game-like lighting (same three.js version as the game).
 *
 *   node tools/assets/preview.mjs <model-name-or-path.glb> [--out DIR] [--clips] [--size 640x480]
 *
 * Writes  <out>/<name>.png          six views: four around, one from above, one close-up
 *         <out>/<name>.<clip>.png   six frames across each animation clip (with --clips)
 * and prints triangle count, draw calls, node names, clip names and the bounding box.
 * Rendering is headless software WebGL, so it is slow but needs no GPU.
 */
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const tools = path.dirname(here);
const repo = path.dirname(tools);
const modelsDir = path.join(repo, 'static', 'martian', 'assets', 'models');

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const has = (name) => { const i = args.indexOf(name); if (i >= 0) { args.splice(i, 1); return true; } return false; };
const outDir = path.resolve(flag('--out', path.join(here, '.cache', 'preview')));
const [W, H] = flag('--size', '640x480').split('x').map(Number);
const wantClips = has('--clips');
if (!args.length) { console.error('usage: preview.mjs <model> [--out DIR] [--clips] [--size WxH]'); process.exit(2); }

const VIEWER = `
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc79a6d);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;
const sun = new THREE.DirectionalLight(0xfff0dc, 3.4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xe6b890, 0x7a4a30, 1.5));
const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 64),
  new THREE.MeshStandardMaterial({ color: 0x9a5230, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 2000);
let model, mixer, clips = [], box = new THREE.Box3(), center = new THREE.Vector3(), radius = 1;

function fit() {
  box.makeEmpty();
  model.updateMatrixWorld(true);
  model.traverse((o) => {
    if (!o.isMesh) return;
    if (o.isSkinnedMesh) { o.computeBoundingBox(); box.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld)); }
    else { o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); }
  });
  box.getCenter(center);
  radius = box.getSize(new THREE.Vector3()).length() / 2;
  const s = radius * 1.4;
  sun.position.copy(center).add(new THREE.Vector3(0.55, 0.75, 0.35).multiplyScalar(radius * 4));
  sun.target.position.copy(center);
  Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: radius * 10 });
  sun.shadow.camera.updateProjectionMatrix();
}
function view(i, cols, rows, w, h, az, el, zoom = 1, target = center) {
  const x = (i % cols) * w, y = (rows - 1 - Math.floor(i / cols)) * h;
  renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.setScissorTest(true);
  camera.aspect = w / h;
  const dist = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.08 * zoom;
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
  camera.position.set(target.x + dist * Math.sin(a) * Math.cos(e), target.y + dist * Math.sin(e), target.z + dist * Math.cos(a) * Math.cos(e));
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.loadModel = async (url) => {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
  scene.add(model);
  clips = gltf.animations;
  mixer = new THREE.AnimationMixer(model);
  fit();
  const names = []; let tris = 0, meshes = 0;
  model.traverse((o) => { if (o.name) names.push(o.name + (o.isBone ? ':bone' : o.isMesh ? ':mesh' : '')); if (o.isMesh) { meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
  const size = box.getSize(new THREE.Vector3());
  return { triangles: Math.round(tris), meshes, nodes: names, clips: clips.map((c) => ({ name: c.name, duration: +c.duration.toFixed(2) })),
    size: [size.x, size.y, size.z].map((v) => +v.toFixed(2)), min: box.min.toArray().map((v) => +v.toFixed(2)), max: box.max.toArray().map((v) => +v.toFixed(2)) };
};
window.renderSheet = (w, h) => {
  renderer.setSize(w * 3, h * 2, false);
  renderer.domElement.style.width = w * 3 + 'px'; renderer.domElement.style.height = h * 2 + 'px';
  const top = new THREE.Vector3(center.x, box.max.y - (box.max.y - box.min.y) * 0.22, center.z);
  view(0, 3, 2, w, h, 35, 16); view(1, 3, 2, w, h, 145, 16); view(2, 3, 2, w, h, 215, 16);
  view(3, 3, 2, w, h, 325, 16); view(4, 3, 2, w, h, 20, 62); view(5, 3, 2, w, h, 25, 8, 0.45, top);
  return renderer.info.render.calls;
};
window.renderClip = (index, w, h) => {
  renderer.setSize(w * 6, h, false);
  renderer.domElement.style.width = w * 6 + 'px'; renderer.domElement.style.height = h + 'px';
  mixer.stopAllAction();
  const action = mixer.clipAction(clips[index]);
  action.play();
  for (let i = 0; i < 6; i++) {
    mixer.setTime(clips[index].duration * (i / 6));
    model.updateMatrixWorld(true);
    view(i, 6, 1, w, h, 60, 10);
  }
  action.stop();
};
`;

const cache = path.join(here, '.cache');
await mkdir(cache, { recursive: true });
await mkdir(outDir, { recursive: true });
await build({
  stdin: { contents: VIEWER, resolveDir: tools, loader: 'js' },
  bundle: true, format: 'esm', outfile: path.join(cache, 'viewer.js'), logLevel: 'error',
});
const types = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html' };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><style>html,body{margin:0;background:#000}canvas{display:block}</style><script type="module" src="/__viewer.js"></script>');
    return;
  }
  const file = url === '/__viewer.js' ? path.join(cache, 'viewer.js') : url.startsWith('/__abs/') ? url.slice(6) : path.join(repo, url);
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const { chromium } = require('playwright');
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let failed = false;
for (const arg of args) {
  const file = existsSync(arg) ? path.resolve(arg) : path.join(modelsDir, arg.endsWith('.glb') ? arg : arg + '.glb');
  const name = path.basename(file, '.glb');
  const page = await browser.newPage({ viewport: { width: W * 3, height: H * 2 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => typeof window.loadModel === 'function');
  try {
    const info = await page.evaluate((u) => window.loadModel(u), '/__abs' + file);
    info.drawCalls = await page.evaluate(([w, h]) => window.renderSheet(w, h), [W, H]);
    await page.locator('canvas').screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(name, JSON.stringify(info));
    if (wantClips) {
      for (let i = 0; i < info.clips.length; i++) {
        await page.setViewportSize({ width: 320 * 6, height: 480 });
        await page.evaluate(([i, w, h]) => window.renderClip(i, w, h), [i, 320, 480]);
        await page.locator('canvas').screenshot({ path: path.join(outDir, `${name}.${info.clips[i].name}.png`) });
      }
    }
    console.log('  wrote', path.join(outDir, `${name}.png`), wantClips ? `and ${info.clips.length} clip strips` : '');
  } catch (e) { failed = true; console.error(name, 'FAILED:', e.message); }
  if (errors.length) console.error('  page errors:', errors.slice(0, 5));
  await page.close();
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
