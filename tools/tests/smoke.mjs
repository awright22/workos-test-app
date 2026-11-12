// Smoke test: the game boots, a new game starts at a known site, the loop runs, no console errors.
import { openGame, sleep } from './lib.mjs';
const g = await openGame({ quality: process.env.Q || 'low' });
console.log('loaded in', g.loadMs, 'ms');
await g.shot('smoke-title');
const site = await g.eval(async (G) => G.start(2.0, 303.7));
console.log('started at', JSON.stringify(site));
await sleep(2500);
await g.shot('smoke-coldopen');
await g.eval((G) => G.skipIntro());
await sleep(1500);
const st = await g.eval((G) => ({ sol: G.S.sol, suit: G.S.suit, mode: G.S.mode, inside: G.S.inside, info: G.info(),
  habDist: G.groundDist(G.player.pos, G.World.hab.position), alt: G.player.pos.length() - G.surfaceAt(G.player.pos) }));
console.log(JSON.stringify(st));
await g.shot('smoke-outside');
console.log('errors:', JSON.stringify(g.errors.slice(0, 6)).slice(0, 1500));
await g.close();
process.exit(g.errors.length ? 1 : 0);
