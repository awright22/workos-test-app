// Rocks: every one rests on the ground that is drawn (none floats, none lies on a cliff or on polar ice),
// a rock garden shows many different shapes, and boulders that stand in the way have colliders.
//   node tools/tests/rocks.mjs
import { openGame, sleep } from './lib.mjs';

// "medium" is where a floating rock was found: its mesh has a vertex every 2.3 m, and a rock placed by the height
// function instead of on the mesh's own triangles stood up to 0.43 m above a dune crest the mesh had cut off.
const g = await openGame({ quality: 'medium' });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });
const fail = [];
const check = (ok, msg) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fail.push(msg); };
const frames = (n = 3) => g.eval(async (G, n) => {
  const e = G.ctx.engine;
  for (let k = 0, last = e.frameStats; k < n;) { await new Promise((r) => setTimeout(r, 60)); if (e.frameStats !== last) { last = e.frameStats; k++; } }
}, n);

/** In the page: for every rock within `reach` metres that stands on the finest mesh, how far its foot is from the
 *  triangle drawn under it, how steep that triangle is, and how much of the ground there is ice. */
const survey = (reach) => g.eval((G, reach) => {
  const T = G.ctx.terrain, rocks = G.ctx.rocks, cam = G.player.pos;
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
  const out = { n: 0, worstGap: 0, steepest: 1, onIce: 0, finest: T.maxLevel, big: 0, small: 0 };
  for (const [node, set] of rocks.sets) {
    if (node.used < T.frame - 2) continue;
    const d = set.data, o = set.origin;
    for (let i = 0; i < d.length; i += 9) {
      const x = o[0] + d[i], y = o[1] + d[i + 1], z = o[2] + d[i + 2];
      if (Math.hypot(x - cam.x, y - cam.y, z - cam.z) > reach) continue;
      const r = Math.hypot(x, y, z), ux = x / r, uy = y / r, uz = z / r;
      if (rocks.ice(ux, uy, uz) > 0.2) out.onIce++;
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
  out.calls = [...rocks.lods.map((l) => l.lod.mesh), rocks.gravel.lod.mesh, rocks.shade.mesh].filter((m) => m.visible && (m.isInstancedMesh ? m.count : m.geometry.instanceCount) > 0).length;
  return out;
}, reach);

console.log('the crash site (where a rock floated above its shadow)');
await g.eval(async (G) => { G.tpAround(G.World.pods[2].group.position, 2.8, 300); G.setLocalTime(9.5); G.tick(0.05, 20); await G.settle(); });
await frames();
let s = await survey(45);
check(s.n > 40, `${s.n} rocks stand on the finest mesh within 45 m (${s.big} boulders, ${s.small} stones)`);
check(s.worstGap < 0.02, `each meets the ground that is drawn: the worst is ${(s.worstGap * 1000).toFixed(1)} mm off it`);
check(s.steepest > 0.8, `no stone lies on a face steeper than 37 degrees (the steepest is ${(Math.acos(Math.min(1, s.steepest)) * 180 / Math.PI).toFixed(0)} degrees)`);
check(s.calls <= 7, `the rocks, the gravel and their shade are ${s.calls} draw calls (7 at most: five densities of ball, the gravel, the shade)`);

console.log('a rock garden (the Viking 1 site)');
await g.eval(async (G) => { await G.tp(22.48, 312.05, 0); G.setLocalTime(15.5); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(60);
check(s.worstGap < 0.02, `${s.n} rocks, the worst ${(s.worstGap * 1000).toFixed(1)} mm off the ground`);
check(s.counts.shapes >= 10, `${s.counts.shapes} different shapes are in the picture (at least 10)`);
check(s.colliders.length > 5 && s.colliders.every((r) => r > 0.3 && r < 4), `${s.colliders.length} boulders stand in the way, ${Math.min(...s.colliders)} to ${Math.max(...s.colliders)} m in radius`);
check(s.counts.big > 200 && s.counts.small > 200, `boulders and stones are both drawn (${s.counts.big} and ${s.counts.small})`);

console.log('a canyon wall (Valles Marineris, the north rim)');
await g.eval(async (G) => { await G.tp(-8.47, 296, 3.14); G.setLocalTime(15); G.tick(0.05, 20); await G.settle(); });
await frames();
s = await survey(80);
check(s.worstGap < 0.02, `${s.n} rocks, the worst ${(s.worstGap * 1000).toFixed(1)} mm off the ground`);
check(s.steepest > 0.8, `none on a riser (the steepest ground under a stone is ${(Math.acos(Math.min(1, s.steepest)) * 180 / Math.PI).toFixed(0)} degrees)`);

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
