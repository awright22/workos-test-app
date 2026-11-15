// Getting around after dark, and the horizon at the ends of the day: pictures for looking at.
//
//   node tools/tests/night-shots.mjs [--out=dir] [--only=a,b]
//
// A phone (844 x 390, "medium", the interface hidden). Night: on foot on open ground with the helmet lamps on (from
// behind him, and with the camera turned to look across the pool), on foot among rocks, at the Hab, and in the rover
// at rest and at speed. Dusk and twilight: a plain to its horizon, where distant boulders stand against the sky.
// Software rendering: what the light looks like, not how fast it is drawn.
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const dir = arg('out') || path.join(outDir, 'night');
const only = arg('only');
await mkdir(dir, { recursive: true });
const g = await openGame({ width: 844, height: 390, touch: true, quality: 'medium', dsf: 1.5, query: 'safe=0,47,21,47' });
const page = g.page, ev = g.eval;
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); await G.settle(); G.paused = true; G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; });
await page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });
const leave = (G) => { if (G.S.mode === 'rover') { G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 6); } for (const k of ['w', 'a', 's', 'd']) G.input.keys[k] = false; };

const SHOTS = [
  ['night-walk', 'on foot on open ground, 1 a.m., from behind him', async (G) => { await G.tp(19.1, 326.7, 0.6); G.setLocalTime(1); G.look(-0.12); G.input.keys.w = true; G.tick(1 / 30, 60); G.input.keys.w = false; G.tick(1 / 30, 4); await G.settle(); }],
  ['night-walk-side', 'the same, the camera turned to look across the lamps\' pool', async (G) => { G.input.yaw = 1.2; G.look(-0.3); G.tick(1 / 30, 20); await G.settle(); }],
  ['night-slope', 'on foot on a slope among rocks, 1 a.m.', async (G) => { await G.tp(15.5, 228.5, 0.5); G.setLocalTime(1); G.look(-0.1); G.tick(1 / 30, 30); await G.settle(); }],
  ['night-hab', 'walking up to the Hab, 1 a.m.', async (G) => { G.tpLocal(10, 30, 3.5); G.setLocalTime(1); G.look(-0.08); G.tick(1 / 30, 30); await G.settle(); }],
  // (on the open plain, facing along it: from the base it drove at the Hab)
  ['night-rover-rest', 'in the rover at rest on a plain, 1 a.m.', async (G) => { await G.tp(19.1, 326.7, 0.6); G.initRoverAt(G.player.pos.clone().normalize(), 0.6); G.tpNear(G.World.rover.group.position, 3.2); G.setLocalTime(1); G.tick(0.05, 4); G.hold(0.8); G.tick(1 / 30, 60); await G.settle(); }],
  ['night-rover-drive', 'in the rover at speed, 1 a.m.', async (G) => { G.input.keys.w = true; G.tick(1 / 30, 90); await G.settle(); G.tick(1 / 30, 6); }],
  ['dusk-plain', 'a plain to its horizon at dusk', async (G) => { await G.tp(19.1, 326.7, 0.6); G.setLocalTime(18.6); G.look(-0.05); G.tick(1 / 30, 30); await G.settle(); }],
  ['twilight-plain', 'the same plain in twilight', async (G) => { G.setLocalTime(19.4); G.tick(1 / 30, 30); await G.settle(); }],
  ['day-plain', 'the same plain at three in the afternoon', async (G) => { G.setLocalTime(15); G.tick(1 / 30, 30); await G.settle(); }],
];
for (const [name, what, set] of SHOTS) {
  if (only && !only.split(',').some((q) => name.includes(q))) continue;
  if (!/rover-drive|walk-side/.test(name)) await ev(leave);
  await ev(set);
  await ev((G) => { G.ctx.engine.snapLight = 3; });
  for (let i = 0; i < 4; i++) await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await sleep(1500);
  await page.screenshot({ path: path.join(dir, name + '.png'), timeout: 240000 });
  console.log(`  ${name}: ${what}`);
}
if (g.errors.length) console.log('console errors: ' + JSON.stringify(g.errors.slice(0, 4)));
await g.close();
process.exit(g.errors.length ? 1 : 0);
