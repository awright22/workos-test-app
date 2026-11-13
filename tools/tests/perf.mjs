// Scene cost at each quality preset: draw calls and triangles per frame in three standard
// scenes. These are counts, valid on any machine; frame rate is NOT measured here (software
// rendering). Budgets are in static/martian/QUALITY.md. Triangles are counted separately for
// the picture itself ("main") and for the two shadow cascades, which are depth-only.
import { openGame, sleep } from './lib.mjs';
const budgets = { low: { calls: 180, main: 340000, shadow: 230000 }, medium: { calls: 240, main: 480000, shadow: 300000 }, high: { calls: 290, main: 600000, shadow: 400000 } };
let failed = false;
for (const quality of (process.env.Q || 'low,medium,high').split(',')) {
  const g = await openGame({ quality });
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); });
  const rows = [];
  for (const [name, setup] of [
    ['outside the Hab', (G) => { G.tpLocal(7, 24, 0); G.setLocalTime(10); G.look(-0.06); }],
    ['inside the Hab', (G) => { G.tpLocal(0, 4.5, 0); G.look(-0.2); }],
    ['open plain', (G) => { G.tpLocal(60, 400, 0.4); G.look(-0.08); }],
    // the foot of a canyon wall, where the fallen blocks are: the most boulders the game draws
    ['under a canyon wall', async (G) => { await G.tp(-12.205, 292.86, 1.9); G.setLocalTime(10.5); G.look(0.1); }],
  ]) {
    await g.eval(setup);
    await g.eval(async (G) => { G.tick(0.05, 3); await G.settle(); });
    // The counts are those of the last frame drawn. Wait for frames drawn after the scene settled, not for a
    // fixed time: with software rendering on a busy machine a frame can take seconds, and a count read too soon
    // is the previous scene's, or this one's before its stones arrived.
    await g.eval(async (G) => {
      const e = G.ctx.engine;
      for (let n = 0, last = e.frameStats; n < 3;) {
        await new Promise((r) => setTimeout(r, 60));
        if (e.frameStats !== last) { last = e.frameStats; n++; }
      }
    });
    await sleep(300);
    const i = await g.eval((G) => G.info());
    rows.push({ scene: name, calls: i.calls, main: i.triangles - i.shadowTriangles, shadow: i.shadowTriangles, shadowCalls: i.shadowCalls, terrainTiles: i.visible, rocks: i.rocks });
  }
  const b = budgets[quality];
  for (const r of rows) {
    const ok = !b || (r.calls <= b.calls && r.main <= b.main && r.shadow <= b.shadow);
    if (!ok) failed = true;
    console.log(`${quality.padEnd(7)} ${r.scene.padEnd(19)} calls ${String(r.calls).padStart(4)} (${r.shadowCalls} shadow)  main ${String(r.main).padStart(7)}  shadow ${String(r.shadow).padStart(7)}  tiles ${r.terrainTiles}  rocks ${r.rocks.big}+${r.rocks.small}  ${ok ? 'ok' : 'OVER BUDGET'}`);
  }
  if (g.errors.length) { failed = true; console.log('console errors:', g.errors.slice(0, 3)); }
  await g.close();
}
process.exit(failed ? 1 : 0);
