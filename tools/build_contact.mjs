// Bakes the ground's side of ambient occlusion for every model that stands on the ground out of doors.
//
//   node tools/build_contact.mjs            writes static/martian/assets/models/contact.png and
//                                           static/martian/src/world/contact.json
//
// The models carry occlusion baked into their vertices by the Blender build (tools/assets/lib.py, bake_ao), with
// the ground counted as a plane under them: their undersides are dark. The ground under them was not: a lander, a
// crate or a tank stood on evenly lit sand with nothing but the sun's shadow to say it touched it, and a prop in
// its own shade, or at dusk, floated ("props rest on the surface", three picture reviews).
//
// For each model this draws, from straight above, the model's shadow on level ground as cast from 128 directions
// spread over the sky (more of them high than low, as light from an overcast sky falls), and adds them up: at each
// place on the ground, the share of the sky the model hides. Only what stands within three metres of the ground
// counts (a mast's top hides nothing worth drawing). The result is a 64 x 64 tile a model, in one picture; the
// game lays a model's tile on the ground under it as a soft dark patch (world/contact.js).
//
// It runs the game's own page for its renderer and its model loader (tools/tests/lib.mjs), in software: a few minutes.
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { openGame } from './tests/lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_PNG = path.join(here, '..', 'static', 'martian', 'assets', 'models', 'contact.png');
const OUT_JSON = path.join(here, '..', 'static', 'martian', 'src', 'world', 'contact.json');

/** What stands on the ground out of doors. (Not the Hab, which has its own skirt; not what is indoors or in orbit.) */
const MODELS = ['rover', 'solar_panel', 'uplink_dish', 'uplink_pad', 'solar_kit', 'beacon', 'o2_cache', 'supply_pod', 'rtg', 'greenhouse', 'mav',
  'pathfinder', 'viking', 'mars3', 'beagle2', 'mer', 'phoenix', 'msl', 'm2020', 'insight', 'ingenuity', 'zhurong', 'schiaparelli_wreck',
  // (not the soil heap: it shrinks as it is dug, and its patch would stay where the heap had been)
  'debris_a', 'debris_b', 'debris_c',
  'bs_kiln', 'bs_smelter', 'bs_glassworks', 'bs_solar', 'bs_battery', 'bs_tank', 'bs_quarters', 'bs_tower', 'bs_pad',
  'dep_hematite', 'dep_silica', 'dep_clay', 'dep_sulfate', 'dep_salt'];
const TILE = 64, DIRS = 128, COLS = 8, TOP = 3;

const g = await openGame({ quality: 'low' });
const res = await g.eval(async (G, o) => {
  const THREE = G.THREE, r = G.ctx.engine.renderer;
  await G.preloadModels(o.models);
  const rt = new THREE.WebGLRenderTarget(o.tile, o.tile, { depthBuffer: false });
  const scene = new THREE.Scene();
  scene.overrideMaterial = new THREE.ShaderMaterial({
    uniforms: { uDir: { value: new THREE.Vector3(0, 1, 0) }, uTop: { value: o.top } },
    vertexShader: `uniform vec3 uDir; varying float vH;
      void main() {
        vec4 w = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          w = instanceMatrix * w;
        #endif
        w = modelMatrix * w;
        vH = w.y;
        // along the light, down to the ground
        w.xyz -= uDir * (max(w.y, 0.0) / uDir.y);
        w.y = 0.0;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    // (and nothing that lies on the ground itself: an apron of spilt soil, a cable, a parachute's cloth. Such a thing does
    //  not shade the ground that is seen there: it is what is seen there, and a patch laid over it painted it dark. The
    //  soil heap's apron came out as a hard-edged dark slab beside the heap.)
    fragmentShader: 'uniform float uTop; varying float vH; void main() { if (vH > uTop || vH < 0.07) discard; gl_FragColor = vec4(1.0); }',
    side: THREE.DoubleSide, depthTest: false, depthWrite: false,
  });
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const dirs = [];
  for (let i = 0; i < o.dirs; i++) {
    // (cosine-weighted, and none lower than about twelve degrees: lower, a shadow is longer than any patch)
    const u = (i + 0.5) / o.dirs * 0.955, phi = i * 2.399963, rr = Math.sqrt(u);
    dirs.push(new THREE.Vector3(rr * Math.cos(phi), Math.sqrt(1 - u), rr * Math.sin(phi)));
  }
  const px = new Uint8Array(o.tile * o.tile * 4), keepTarget = r.getRenderTarget(), out = [];
  for (const name of o.models) {
    const m = G.model(name);
    scene.add(m.inner);
    m.inner.updateMatrixWorld(true);
    // its footprint: of what stands under TOP
    const box = new THREE.Box3(), v = new THREE.Vector3();
    m.inner.traverse((ob) => {
      if (!ob.isMesh || !ob.geometry.attributes.position) return;
      const p = ob.geometry.attributes.position;
      for (let i = 0; i < p.count; i += 1) { v.fromBufferAttribute(p, i).applyMatrix4(ob.matrixWorld); if (v.y <= o.top) box.expandByPoint(v); }
    });
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2, tall = Math.min(o.top, box.max.y);
    const size = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) + 2 * Math.min(1.8, 0.35 + 0.6 * tall), half = size / 2;
    cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half;
    cam.position.set(cx, 50, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, 0, cz); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    const acc = new Float32Array(o.tile * o.tile);
    r.setRenderTarget(rt);
    for (const d of dirs) {
      scene.overrideMaterial.uniforms.uDir.value.copy(d);
      r.setClearColor(0x000000, 1); r.clear();
      r.render(scene, cam);
      r.readRenderTargetPixels(rt, 0, 0, o.tile, o.tile, px);
      for (let i = 0; i < acc.length; i++) acc[i] += px[i * 4] / 255;
    }
    scene.remove(m.inner);
    // rows as they are read run from the foot of the picture, which is +z: turned over, row 0 is the least z
    const tile = new Array(o.tile * o.tile);
    let most = 0, sum = 0;
    for (let y = 0; y < o.tile; y++) for (let x = 0; x < o.tile; x++) {
      const dx = (x + 0.5) / o.tile * 2 - 1, dy = (y + 0.5) / o.tile * 2 - 1, e = Math.max(Math.abs(dx), Math.abs(dy));
      // (nothing at the tile's own edge: a patch must not show its square)
      const edge = 1 - Math.min(1, Math.max(0, (e - 0.8) / 0.2)) ** 2;
      // (lifted where it is slight: a slim thing hides little of the sky from the ground at its foot, and a tenth off
      //  the ground's brightness could not be seen)
      const occ = Math.pow(acc[(o.tile - 1 - y) * o.tile + x] / o.dirs, 0.7) * edge;
      tile[y * o.tile + x] = Math.round(occ * 255);
      most = Math.max(most, occ); sum += occ;
    }
    out.push({ name, size: +size.toFixed(3), cx: +cx.toFixed(3), cz: +cz.toFixed(3), most: +most.toFixed(2), mean: +(sum / acc.length).toFixed(3), tile });
  }
  r.setRenderTarget(keepTarget);
  // one picture of all the tiles
  const rows = Math.ceil(out.length / o.cols), c = document.createElement('canvas');
  c.width = o.cols * o.tile; c.height = rows * o.tile;
  const x2 = c.getContext('2d'), img = x2.createImageData(c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) img.data[i + 3] = 255;
  out.forEach((t, k) => {
    const ox = (k % o.cols) * o.tile, oy = Math.floor(k / o.cols) * o.tile;
    for (let y = 0; y < o.tile; y++) for (let x = 0; x < o.tile; x++) { const q = ((oy + y) * c.width + ox + x) * 4, val = t.tile[y * o.tile + x]; img.data[q] = img.data[q + 1] = img.data[q + 2] = val; }
  });
  x2.putImageData(img, 0, 0);
  return { png: c.toDataURL('image/png').split(',')[1], rows, models: out.map(({ tile, ...rest }, i) => ({ ...rest, i })) };
}, { models: MODELS, tile: TILE, dirs: DIRS, cols: COLS, top: TOP });

await writeFile(OUT_PNG, Buffer.from(res.png, 'base64'));
const table = { tile: TILE, cols: COLS, rows: res.rows, models: Object.fromEntries(res.models.map((m) => [m.name, { i: m.i, size: m.size, cx: m.cx, cz: m.cz }])) };
await writeFile(OUT_JSON, JSON.stringify(table, null, 1) + '\n');
for (const m of res.models) console.log(`  ${m.name.padEnd(20)} ${String(m.size).padStart(6)} m a side, at most ${m.most} of the sky hidden, ${m.mean} over the tile`);
console.log(`${res.models.length} tiles in ${path.relative(process.cwd(), OUT_PNG)} (${Math.round(Buffer.from(res.png, 'base64').length / 1024)} kB); table in ${path.relative(process.cwd(), OUT_JSON)}`);
if (g.errors.length) console.log('console errors: ' + JSON.stringify(g.errors.slice(0, 4)));
await g.close();
process.exit(g.errors.length ? 1 : 0);
