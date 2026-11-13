// Rocks. The shapes: enough of them, each with arrises (not a bun or a potato), none coming to a point (not a
// pyramid), none overhanging its own foot (so none stands ON the ground). In the game: every rock rests on the ground
// that is drawn (none floats, none lies on a cliff or on polar ice), a rock garden shows many different shapes,
// boulders that stand in the way have colliders and nothing else stands higher than an ankle, the stones under the
// astronaut's boots are trodden in wherever he is put, and a rock on a lava flow is known to lie on lava.
//   node tools/tests/rocks.mjs [--shapes]
import { openGame, sleep } from './lib.mjs';
import { buildRockAtlas, shapeUv, SHAPE_COUNT } from '../../static/martian/src/world/rock-shapes.js';

const fail = [];
const check = (ok, msg) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fail.push(msg); };

console.log('the shapes');
{
  const N = 128, atlas = buildRockAtlas(N), uv = [0, 0];
  const radius = (k, x, y, z) => { shapeUv(x, y, z, uv); const i = Math.min(N - 1, Math.floor(uv[0] * N)), j = Math.min(N - 1, Math.floor(uv[1] * N)); return atlas.data[(k * 2 * N * N + j * N + i) * 4 + 3] / 255 * atlas.rmax; };
  check(SHAPE_COUNT >= 22 && atlas.classes.every((c) => c.length >= 4), `${SHAPE_COUNT} shapes (at least 22), ${atlas.classes.map((c) => c.length).join(', ')} of the four kinds (at least 4 of each)`);
  check(atlas.shapes.every((s) => s.big <= atlas.rmax), `none is too big to store (the widest is ${Math.max(...atlas.shapes.map((s) => s.big)).toFixed(2)} of ${atlas.rmax})`);
  // Each shape as a stack of level slices above its ground line: how far out it reaches on 48 bearings at 24 heights.
  const pointed = [], hanging = [], smooth = [];
  for (let k = 0; k < atlas.count; k++) {
    const sh = atlas.shapes[k], B = 48, H = 24, reach = new Float32Array(B * H);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = ((i + 0.5) / N - 0.5) * 4, v = ((j + 0.5) / N - 0.5) * 4, q = u * u + v * v;
      if (q > 3.9) continue;
      const s = Math.sqrt(1 - q / 4), x = u * s, y = 1 - q / 2, z = v * s, r = radius(k, x, y, z);
      const h = Math.floor((r * y - sh.ground) / (sh.top - sh.ground) * H), b = Math.min(B - 1, Math.floor((Math.atan2(z, x) / 6.2831853 + 0.5) * B));
      if (h >= 0 && h < H) reach[b * H + h] = Math.max(reach[b * H + h], r * Math.hypot(x, z));
    }
    const area = (h) => { let a = 0; for (let b = 0; b < B; b++) { let m = 0; for (let q = h; q < H; q++) m = Math.max(m, reach[b * H + q]); a += m * m; } return a; };
    // a pyramid, a cone or a tooth: four fifths of the way up there is almost nothing left of it
    const upper = area(Math.floor(H * 0.8)) / area(0);
    if (upper < 0.1) pointed.push(`${k} (${(upper * 100).toFixed(0)}%)`);
    // set down on a table: it reaches further out above its foot than at it
    let over = 0;
    for (let b = 0; b < B; b++) { let m = 0; for (let q = 2; q < H; q++) m = Math.max(m, reach[b * H + q]); over += Math.max(0, m - Math.max(reach[b * H], reach[b * H + 1])); }
    if (over / B > 0.09) hanging.push(`${k} (${(over / B).toFixed(2)})`);
    // a bun or a potato: no arris anywhere on what shows (the map of arrises is what the shader moves vertices by)
    let edges = 0, shown = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = ((i + 0.5) / N - 0.5) * 4, v = ((j + 0.5) / N - 0.5) * 4, q = u * u + v * v;
      if (q > 2.2) continue;                                   // (the upper part of the ball: what stands above the ground)
      shown++;
      const o = (k * N * N + j * N + i) * 2;
      if (Math.abs(atlas.snap[o] - 127.5) < 16 && Math.abs(atlas.snap[o + 1] - 127.5) < 16) edges++;      // within a texel of an arris
    }
    if (edges / shown < 0.2) smooth.push(`${k} (${(edges / shown * 100).toFixed(1)}%)`);
  }
  check(pointed.length === 0, `none comes to a point (four fifths of the way up, each still has a tenth of its footprint)${pointed.length ? ': ' + pointed.join(', ') : ''}`);
  check(hanging.length === 0, `none overhangs its foot by more than a tenth of its radius${hanging.length ? ': ' + hanging.join(', ') : ''}`);
  check(smooth.length === 0, `each has arrises: none is a smooth lump${smooth.length ? ': ' + smooth.join(', ') : ''}`);
}

// (--shapes: the shapes alone, which need no browser)
if (process.argv.includes('--shapes')) { if (fail.length) { console.error(`\nrocks: ${fail.length} failed`); process.exit(1); } console.log('\nrocks: the shapes passed'); process.exit(0); }

// "medium" is where a floating rock was found: its mesh has a vertex every 2.3 m, and a rock placed by the height
// function instead of on the mesh's own triangles stood up to 0.43 m above a dune crest the mesh had cut off.
const g = await openGame({ quality: 'medium' });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });
const frames = (n = 3) => g.eval(async (G, n) => {
  const e = G.ctx.engine;
  for (let k = 0, last = e.frameStats; k < n;) { await new Promise((r) => setTimeout(r, 60)); if (e.frameStats !== last) { last = e.frameStats; k++; } }
}, n);

/** In the page: for every rock within `reach` metres that stands on the finest mesh, how far its foot is from the
 *  triangle drawn under it, how steep that triangle is, and how much of the ground there is ice; and what the rocks
 *  are to a man on foot. */
const survey = (reach) => g.eval((G, reach) => {
  const T = G.ctx.terrain, rocks = G.ctx.rocks, cam = G.player.pos, STRIDE = rocks.stride;
  const gridTris = T.G * T.G * 2;
  const under = (ux, uy, uz, about) => {
    let best = null;
    for (const node of T.visible) {
      const m = node.mesh, o = m.position;
      if (Math.hypot(ux * about - o.x, uy * about - o.y, uz * about - o.z) > m.geometry.boundingSphere.radius + 2) continue;
      const pos = m.geometry.attributes.position.array, idx = m.geometry.index.array;
      for (let t = 0; t < gridTris; t++) {
        const a = idx[t * 3] * 3, b = idx[t * 3 + 1] * 3, c = idx[t * 3 + 2] * 3;
        const ax = pos[a] + o.x, ay = pos[a + 1] + o.y, az = pos[a + 2] + o.z;
        const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2];
        const e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
        const px = uy * e2z - uz * e2y, py = uz * e2x - ux * e2z, pz = ux * e2y - uy * e2x;
        const det = e1x * px + e1y * py + e1z * pz;
        if (Math.abs(det) < 1e-12) continue;
        const inv = 1 / det, u = (-ax * px - ay * py - az * pz) * inv;
        if (u < -1e-6 || u > 1 + 1e-6) continue;
        const qx = -ay * e1z + az * e1y, qy = -az * e1x + ax * e1z, qz = -ax * e1y + ay * e1x;
        const v = (ux * qx + uy * qy + uz * qz) * inv;
        if (v < -1e-6 || u + v > 1 + 1e-6) continue;
        const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
        if (d > 0 && (!best || d > best.r)) {
          let nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
          const l = Math.hypot(nx, ny, nz);
          best = { r: d, level: node.level, up: Math.abs(nx * ux + ny * uy + nz * uz) / l };
        }
      }
    }
    return best;
  };
  const out = { n: 0, worstGap: 0, steepest: 1, onIce: 0, finest: T.maxLevel, big: 0, small: 0, tallestLoose: 0, lowestSolid: 9, solid: 0, onLava: 0, drawn: 0, loose: 0 };
  for (const [node, set] of rocks.sets) {
    if (node.used < T.frame - 2) continue;
    const d = set.data, o = set.origin, per = set.inst ? set.inst.length / (d.length / STRIDE) : 0, aper = set.aux ? set.aux.length / (d.length / STRIDE) : 0;
    for (let i = 0, k = 0; i < d.length; i += STRIDE, k++) {
      const x = o[0] + d[i], y = o[1] + d[i + 1], z = o[2] + d[i + 2];
      if (Math.hypot(x - cam.x, y - cam.y, z - cam.z) > reach) continue;
      const r = Math.hypot(x, y, z), ux = x / r, uy = y / r, uz = z / r;
      if (rocks.ice(ux, uy, uz) > 0.2) out.onIce++;
      if (set.inst) {
        // what it is to a man on foot: in the way (the seed is below zero and it stands high), or to be walked over
        const stands = set.aux[k * aper + 1], fixed = set.inst[k * per + 14] < 0, solid = set.colliders.some((c) => Math.abs(c.x - x) + Math.abs(c.y - y) + Math.abs(c.z - z) < 1e-3);
        out.drawn++;
        if (solid) { out.solid++; out.lowestSolid = Math.min(out.lowestSolid, stands); } else out.tallestLoose = Math.max(out.tallestLoose, stands);
        if (!fixed) out.loose++;
        if (d[i + 9] > 0.5) out.onLava++;
      }
      const m = under(ux, uy, uz, r);
      if (!m || m.level !== T.maxLevel) continue;
      out.n++;
      if (set.kind === 'big') out.big++; else out.small++;
      out.worstGap = Math.max(out.worstGap, Math.abs(r - m.r));
      // (a boulder lies on the average of the ground under it, which a single triangle may be steeper than: stones only)
      if (set.kind === 'small') out.steepest = Math.min(out.steepest, m.up);
    }
  }
  out.counts = rocks.counts;
  out.gravel = rocks.gravel.lod.n;
  out.colliders = G.rockColliders.map((c) => +c.r.toFixed(2));
  out.calls = [...rocks.lods.map((l) => l.lod.mesh), rocks.gravel.lod.mesh, rocks.shade.mesh, rocks.drift.mesh].filter((m) => m.visible && (m.isInstancedMesh ? m.count : m.geometry.instanceCount) > 0).length;
  // his boots: the shader treads in whatever lies within a boot's reach of this point (given from the rocks' anchor)
  const f = rocks.uniforms.uFeet.value, a = rocks.anchor;
  out.feetOff = Math.hypot(f.x + a.x - cam.x, f.y + a.y - cam.y, f.z + a.z - cam.z);
  out.onFoot = f.w;
  out.limits = { solid: 0.4, stone: 0.22 };
  return out;
}, reach);
const onFoot = (s, where) => {
  check(s.feetOff < 0.02 && s.onFoot === 1, `${where}: the stones under his boots are trodden in where he stands (the shader has his feet to ${(s.feetOff * 1000).toFixed(0)} mm)`);
  check(s.tallestLoose <= s.limits.stone + 0.005, `${where}: nothing he can walk through stands higher than his ankle (the tallest of ${s.drawn - s.solid} is ${(s.tallestLoose * 100).toFixed(0)} cm)`);
};

console.log('the crash site (where a rock floated above its shadow)');
await g.eval(async (G) => { G.tpAround(G.World.pods[2].group.position, 2.8, 300); G.setLocalTime(9.5); G.tick(0.05, 20); await G.settle(); });
await frames();
let s = await survey(45);
check(s.n > 40, `${s.n} rocks stand on the finest mesh within 45 m (${s.big} boulders, ${s.small} stones)`);
check(s.worstGap < 0.02, `each meets the ground that is drawn: the worst is ${(s.worstGap * 1000).toFixed(1)} mm off it`);
check(s.steepest > 0.8, `no stone lies on a face steeper than 37 degrees (the steepest is ${(Math.acos(Math.min(1, s.steepest)) * 180 / Math.PI).toFixed(0)} degrees)`);
check(s.calls <= 8, `the rocks, the gravel, their shade and their drifts are ${s.calls} draw calls (8 at most: five densities of ball, the gravel, the shade, the drifts)`);
check(s.onLava === 0, `no rock here thinks it lies on lava (${s.onLava})`);
onFoot(s, 'put down at the crash site');

console.log('a rock garden (the Viking 1 site)');
await g.eval(async (G) => { await G.tp(22.48, 312.05, 0); G.setLocalTime(15.5); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(60);
check(s.worstGap < 0.02, `${s.n} rocks, the worst ${(s.worstGap * 1000).toFixed(1)} mm off the ground`);
check(s.counts.shapes >= 16, `${s.counts.shapes} different shapes are in the picture (at least 16)`);
check(s.colliders.length > 5 && s.colliders.every((r) => r > 0.3 && r < 4), `${s.colliders.length} boulders stand in the way, ${Math.min(...s.colliders)} to ${Math.max(...s.colliders)} m in radius`);
check(s.solid > 0 && s.lowestSolid > s.limits.solid, `what stands in the way stands knee-high or more (the lowest of ${s.solid} is ${(s.lowestSolid * 100).toFixed(0)} cm)`);
check(s.counts.big > 200 && s.counts.small > 200, `boulders and stones are both drawn (${s.counts.big} and ${s.counts.small})`);
check(s.counts.drifts > 5, `the near rocks have dust drifted against them (${s.counts.drifts})`);
onFoot(s, 'put down in the rock garden');
// and after a walk: his feet are followed, not just found once
await g.eval(async (G) => { G.input.keys['w'] = true; G.tick(0.05, 30); G.input.keys['w'] = false; });
await frames(2);
s = await survey(20);
onFoot(s, 'after walking on');

console.log('a canyon wall (Valles Marineris, the north rim)');
await g.eval(async (G) => { await G.tp(-8.47, 296, 3.14); G.setLocalTime(15); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(80);
check(s.worstGap < 0.02, `${s.n} rocks, the worst ${(s.worstGap * 1000).toFixed(1)} mm off the ground`);
check(s.steepest > 0.8, `none on a riser (the steepest ground under a stone is ${(Math.acos(Math.min(1, s.steepest)) * 180 / Math.PI).toFixed(0)} degrees)`);

console.log('a lava flow (the flank of Olympus Mons)');
await g.eval(async (G) => { await G.tp(15.5, 228.5, 0.5); G.setLocalTime(8); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(60);
check(s.drawn > 40 && s.onLava > s.drawn * 0.25, `${s.onLava} of ${s.drawn} rocks know they lie on bare lava, and are drawn as the flow's own dark rock (more than a quarter)`);
onFoot(s, 'put down on the lava');

console.log('the north polar cap');
await g.eval(async (G) => { await G.tp(89.93, 0, 2.2); G.setLocalTime(12); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(400);
check(s.onIce === 0, `no rock lies on the ice (${s.onIce})`);
check(s.gravel === 0, `nor any gravel (${s.gravel} pebbles)`);
await sleep(100);

check(g.errors.length === 0, `no console errors${g.errors.length ? ': ' + g.errors[0] : ''}`);
await g.close();
if (fail.length) { console.error(`\nrocks: ${fail.length} failed`); process.exit(1); }
console.log('\nrocks: all passed');
