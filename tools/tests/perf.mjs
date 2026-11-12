// Scene cost at each quality preset: draw calls and triangles per frame in three standard
// scenes. These are counts, valid on any machine; frame rate is NOT measured here (software
// rendering). Budgets are in static/martian/QUALITY.md.
import { openGame, sleep } from './lib.mjs';
const budgets = { low: { calls: 170, triangles: 340000 }, medium: { calls: 210, triangles: 480000 }, high: { calls: 250, triangles: 600000 } };
let failed = false;
for (const quality of (process.env.Q || 'low,high').split(',')) {
  const g = await openGame({ quality });
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); });
  const rows = [];
  for (const [name, setup] of [
    ['outside the Hab', (G) => { G.tpLocal(7, 24, 0); G.setLocalTime(10); G.look(-0.06); }],
    ['inside the Hab', (G) => { G.tpLocal(0, 4.5, 0); G.look(-0.2); }],
    ['open plain', (G) => { G.tpLocal(60, 400, 0.4); G.look(-0.08); }],
  ]) {
    await g.eval(setup);
    await g.eval(async (G) => { G.tick(0.05, 3); await G.settle(); });
    await sleep(2500);
    const i = await g.eval((G) => G.info());
    rows.push({ scene: name, calls: i.calls, triangles: i.triangles, terrainTiles: i.visible, rocks: i.rocks });
  }
  const b = budgets[quality];
  for (const r of rows) {
    const ok = !b || (r.calls <= b.calls && r.triangles <= b.triangles);
    if (!ok) failed = true;
    console.log(`${quality.padEnd(7)} ${r.scene.padEnd(16)} calls ${String(r.calls).padStart(4)}  triangles ${String(r.triangles).padStart(7)}  tiles ${r.terrainTiles}  rocks ${JSON.stringify(r.rocks)}  ${ok ? 'ok' : 'OVER BUDGET'}`);
  }
  if (g.errors.length) { failed = true; console.log('console errors:', g.errors.slice(0, 3)); }
  await g.close();
}
process.exit(failed ? 1 : 0);
