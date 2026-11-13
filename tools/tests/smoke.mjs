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
// The picture's resolution drops when frames are late, and comes back when they are not. (It never came back on a
// screen that refreshes sixty times a second: the owner's iPhone drew at two thirds of its setting from the first
// busy second on.)
const res = await g.eval((G) => {
  const e = G.ctx.engine, keepFixed = G.fixedResolution, keep = e.dynScale, keepA = e._adapt;
  G.fixedResolution = true;          // (the game's own once-a-second call stays out of it)
  e._adapt = null; e.dynScale = 1;
  const target = 1000 / 55, late = target * 1.5, onTime = 1000 / 60;
  e.adaptResolution(late, target); e.adaptResolution(late, target);
  const down = e.dynScale;
  for (let i = 0; i < 4; i++) e.adaptResolution(onTime, target);
  const up = e.dynScale;
  e.adaptResolution(late, target);                    // a step up that could not be held
  const undone = e.dynScale, wait = e._adapt.wait;
  for (let i = 0; i < 7; i++) e.adaptResolution(onTime, target);
  const notYet = e.dynScale;
  e.adaptResolution(onTime, target);
  const later = e.dynScale;
  e._adapt = keepA; e.dynScale = keep; e.resize(); G.fixedResolution = keepFixed;
  return { down, up, undone, wait, notYet, later };
});
const near = (x, y) => Math.abs(x - y) < 0.001;
const resOk = near(res.down, 0.9) && near(res.up, 0.95) && near(res.undone, 0.9) && res.wait === 8 && near(res.notYet, 0.9) && near(res.later, 0.95);
console.log((resOk ? '  ok   ' : '  FAIL ') + 'resolution: down when frames are late, back up a step at a time when they are not, a longer wait after a step it could not hold  ' + JSON.stringify(res));
console.log('errors:', JSON.stringify(g.errors.slice(0, 6)).slice(0, 1500));
await g.close();
process.exit(g.errors.length || !resOk ? 1 : 0);
