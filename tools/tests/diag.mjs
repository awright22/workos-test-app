import { openGame, sleep } from './lib.mjs';
const g = await openGame({ quality: process.env.Q || 'low' });
await g.eval((G) => { G.fixedResolution = true; });
await g.eval(async (G) => G.start(2.0, 303.7));
for (let i = 0; i < 6; i++) {
  await sleep(1500);
  console.log(JSON.stringify(await g.eval((G) => ({ t: G.ctx.terrain.stats(), workers: G.ctx.terrain.workers.length, idle: G.ctx.terrain.idle.length, sync: G.ctx.terrain.sync, fps: G.fps, scale: G.ctx.engine.dynScale }))));
}
console.log('errors:', JSON.stringify(g.errors.slice(0, 6)).slice(0, 1500));
await g.close();
