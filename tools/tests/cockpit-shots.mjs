// The rover from the driver's seat: pictures for looking at.
//
//   node tools/tests/cockpit-shots.mjs [--out=dir] [--only=a,b] [--size=844|667|932] [--hud]
//
// A phone held sideways (844 x 390 unless --size says otherwise, "medium"). The view from the seat (S.cockpit,
// game/rover.js: seatCamera) parked and at speed by day, with the head turned to each side and down at the dashboard,
// toward a low sun, in a dust storm, and at night parked and at speed. --hud leaves the interface on the picture;
// without it the pictures are of the cab alone. Software rendering: what it looks like, not how fast it is drawn.
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const hud = process.argv.includes('--hud');
const SIZES = { 844: [844, 390, '0,47,21,47'], 667: [667, 375, '0,47,21,47'], 932: [932, 430, '0,59,21,59'] };
const [W, H, safe] = SIZES[arg('size') || 844];
const dir = arg('out') || path.join(outDir, 'cockpit');
const only = arg('only');
await mkdir(dir, { recursive: true });
const g = await openGame({ width: W, height: H, touch: true, quality: 'medium', dsf: 1.5, query: 'safe=' + safe });
const page = g.page, ev = g.eval;
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); await G.settle(); G.paused = true; G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; G.S.sol = 5; });
if (!hud) await page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });

/** Into the seat on an open plain, facing along it, the view from the seat, at this hour. */
const seat = async (G, hour, yaw = 0.6) => {
  for (const k of ['w', 'a', 's', 'd']) G.input.keys[k] = false;
  if (G.S.mode === 'rover') { G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 6); }
  await G.tp(19.1, 326.7, 0.6);
  G.initRoverAt(G.player.pos.clone().normalize(), yaw);
  G.tpNear(G.World.rover.group.position, 3.2);
  G.setLocalTime(hour);
  G.S.cockpit = true;
  G.tick(0.05, 4); G.hold(0.8); G.tick(1 / 30, 60);
  await G.settle();
};
const look = (G, yaw, pitch) => { G.roverF.seatYaw = yaw; G.roverF.seatPitch = pitch; G.roverF.camIdle = 0; G.tick(1 / 30, 3); };
const SHOTS = [
  ['day-parked', 'parked on a plain at three in the afternoon, looking ahead', async (G) => { await G.seat(15); }],
  ['day-left', 'the same, the head turned to the left', async (G) => { G.lookSeat(1.15, -0.14); }],
  ['day-right', 'the same, the head turned to the right, across the other seat', async (G) => { G.lookSeat(-1.15, -0.14); }],
  ['day-dash', 'the same, looking down at the dashboard and the wheel', async (G) => { G.lookSeat(0, -0.6); }],
  ['day-up', 'the same, looking up through the brow pane', async (G) => { G.lookSeat(0.3, 0.55); }],
  ['day-drive', 'at speed by day', async (G) => { G.lookSeat(0, -0.14); G.input.keys.w = true; G.tick(1 / 30, 120); await G.settle(); G.tick(1 / 30, 4); }],
  ['day-turn', 'at speed, turning', async (G) => { G.input.keys.a = true; G.tick(1 / 30, 30); await G.settle(); G.tick(1 / 30, 3); G.input.keys.a = false; }],
  ['low-sun', 'driving toward a low sun', async (G) => { await G.seat(17.6, -1.45); }],
  ['storm', 'parked in a dust storm at noon', async (G) => { await G.seat(12); G.setStorm(1); G.S.storm.i = 1; G.tick(1 / 30, 60); await G.settle(); }],
  ['night-parked', 'parked at one in the morning', async (G) => { G.setStorm(0); G.S.storm.i = 0; await G.seat(1); }],
  ['night-dash', 'the same, looking down at the dashboard', async (G) => { G.lookSeat(0, -0.6); }],
  ['night-drive', 'at speed at one in the morning', async (G) => { G.lookSeat(0, -0.14); G.input.keys.w = true; G.tick(1 / 30, 120); await G.settle(); G.tick(1 / 30, 4); }],
  ['chase', 'the view from behind it again, the same moment', async (G) => { G.S.cockpit = false; G.tick(1 / 30, 60); await G.settle(); G.tick(1 / 30, 4); }],
];
await page.evaluate(`window.__MG.seat = (hour, yaw) => (${seat.toString()})(window.__MG, hour, yaw); window.__MG.lookSeat = (yaw, pitch) => (${look.toString()})(window.__MG, yaw, pitch);`);
for (const [name, what, set] of SHOTS) {
  if (only && !only.split(',').some((q) => name.includes(q))) continue;
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
