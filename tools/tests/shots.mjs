// Screenshot matrix: the scenes the quality bar is judged on (see static/martian/QUALITY.md).
//   node tools/tests/shots.mjs [--quality medium] [--only name,name] [--size 1280x720] [--touch]
// Images go to tools/tests/.cache/shots/. Rendering is software WebGL: slow, and not a
// measure of frame rate.
import { openGame, sleep, outDir } from './lib.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const quality = arg('--quality', 'medium');
const only = arg('--only', '').split(',').filter(Boolean);
const [W, H] = arg('--size', '1280x720').split('x').map(Number);
const touch = process.argv.includes('--touch');
const dir = path.join(outDir, 'shots');
await mkdir(dir, { recursive: true });

const g = await openGame({ quality, width: W, height: H, touch });
const ev = (fn, a) => g.eval(fn, a);
const snap = async (name) => { await sleep(900); await g.page.screenshot({ path: path.join(dir, `${name}.png`), timeout: 180000 }); console.log('  shot', name); };
const want = (n) => !only.length || only.includes(n);
const hud = (on) => g.page.addStyleTag({ content: `.mg-hud, #mg-touch { visibility: ${on ? 'visible' : 'hidden'} !important; }` });

if (want('title')) await snap('title');
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; });
await hud(false);

// each scene: set the state through the debug hook, let the terrain settle, take the picture
const scenes = {
  'hab-morning': async () => ev(async (G) => { G.S.firstPerson = false; G.tpLocal(7, 24, 0); G.setLocalTime(8.2); G.look(-0.06); G.tick(0.05, 4); await G.settle(); }),
  'hab-noon': async () => ev(async (G) => { G.tpLocal(-14, 20, 0.6); G.setLocalTime(12.3); G.look(-0.1); G.tick(0.05, 4); await G.settle(); }),
  'hab-dusk': async () => ev(async (G) => { G.tpLocal(10, 26, -0.4); G.setLocalTime(17.9); G.look(-0.02); G.tick(0.05, 4); await G.settle(); }),
  'hab-night': async () => ev(async (G) => { G.tpLocal(6, 22, 0); G.setLocalTime(22); G.look(-0.05); G.tick(0.05, 30); await G.settle(); }),
  'inside-game-cam': async () => ev(async (G) => { G.setLocalTime(10); G.tpLocal(0, 4.5, 0); G.look(-0.2); G.tick(0.05, 30); await G.settle(); }),
  'inside-farm': async () => ev(async (G) => { G.tpLocal(-1.5, 0.5, 1.9); G.look(-0.25); G.tick(0.05, 30); await G.settle(); }),
  'inside-machines': async () => ev(async (G) => { G.tpLocal(1.5, -0.5, -1.3); G.look(-0.15); G.tick(0.05, 30); await G.settle(); }),
  'walk-plain': async () => ev(async (G) => { G.setLocalTime(9.5); G.tpLocal(40, 120, 0.4); G.look(-0.08); G.input.keys['w'] = true; G.tick(0.05, 26); G.input.keys['w'] = false; await G.settle(); }),
  'rover-park': async () => ev(async (G) => { G.setLocalTime(15.5); G.tpNear(G.World.rover.group.position, 7); G.look(-0.1); G.tick(0.05, 6); await G.settle(); }),
  'rover-drive': async () => ev(async (G) => { G.setLocalTime(10.5); G.tpNear(G.World.rover.group.position, 3.2); G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 120); G.input.keys['w'] = false; await G.settle(); }),
  'storm': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); G.tpLocal(8, 30, 0); G.setLocalTime(13); G.S.storm.cells[0].lat = G.World.spawn.lat; G.S.storm.cells[0].lon = G.World.spawn.lon; G.S.storm.cells[0].peak = 1; G.tick(0.25, 60); await G.settle(); }),
  'mav': async () => ev(async (G) => { G.S.storm.cells[0].lat = -60; G.S.storm.i = 0; G.setLocalTime(9); G.tpNear(G.World.mav.position, 26); G.setLocalTime(9); G.look(0.12); G.tick(0.05, 6); await G.settle(); }),
  'canyon': async () => ev(async (G) => { await G.tp(-13.8, 300.5, 4.6); G.setLocalTime(15.2); G.look(-0.05); G.tick(0.05, 4); await G.settle(); }),
  'olympus': async () => ev(async (G) => { await G.tp(15.5, 228.5, 0.5); G.setLocalTime(8); G.look(0.02); G.tick(0.05, 4); await G.settle(); }),
  'north-pole': async () => ev(async (G) => { await G.tp(84, 20, 0); G.setLocalTime(12); G.look(-0.04); G.tick(0.05, 4); await G.settle(); }),
  'dawn': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 4.71); G.setLocalTime(6.35); G.look(0.05); G.tick(0.05, 4); await G.settle(); }),
  'dusk': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 1.571); G.setLocalTime(18.25); G.look(0.05); G.tick(0.05, 4); await G.settle(); }),
};
for (const [name, setup] of Object.entries(scenes)) {
  if (!want(name)) continue;
  await setup();
  await ev((G) => { G.paused = false; });
  await sleep(700);
  await ev((G) => { G.paused = true; });
  await snap(name);
}
const info = await ev((G) => G.info());
console.log('last scene:', JSON.stringify(info));
console.log('console errors:', g.errors.length, g.errors.slice(0, 3));
await g.close();
process.exit(g.errors.length ? 1 : 0);
