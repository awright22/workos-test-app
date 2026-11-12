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
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });   // the opening storm has blown out
await hud(false);

// a model scene: the astronaut stands `stand` = [metres, bearing] from the target; a free camera looks at it
const model = (where, dist, bearing, hours, o = {}) => g.page.evaluate(`(async () => {
  const G = window.__MG;
  const pos = (${where.toString()})(G);
  G.tpAround(pos, ${(o.stand || [3, bearing + 75])[0]}, ${(o.stand || [3, bearing + 75])[1]});
  G.setLocalTime(${hours});
  G.tick(0.05, 40);
  G.photo(pos, ${dist}, ${bearing}, ${o.height || 1.7}, ${o.aim || 0.9});
  G.ctx.engine.camera.position.copy(pos);
  await G.settle();
})()`);
// each scene: set the state through the debug hook, let the terrain settle, take the picture
const scenes = {
  'hab-morning': async () => ev(async (G) => { G.S.firstPerson = false; G.tpLocal(7, 24, 0); G.setLocalTime(8.2); G.look(-0.06); G.tick(0.05, 40); await G.settle(); }),
  'hab-noon': async () => ev(async (G) => { G.tpLocal(-14, 20, 0.6); G.setLocalTime(12.3); G.look(-0.1); G.tick(0.05, 40); await G.settle(); }),
  'hab-dusk': async () => ev(async (G) => { G.tpLocal(10, 26, -0.4); G.setLocalTime(17.9); G.look(-0.02); G.tick(0.05, 40); await G.settle(); }),
  'hab-night': async () => ev(async (G) => { G.tpLocal(6, 22, 0); G.setLocalTime(22); G.look(-0.05); G.tick(0.05, 30); await G.settle(); }),
  'inside-game-cam': async () => ev(async (G) => { G.setLocalTime(10); G.tpLocal(0, 4.5, 0); G.look(-0.2); G.tick(0.05, 30); await G.settle(); }),
  'inside-farm': async () => ev(async (G) => { G.tpLocal(-1.5, 0.5, 1.9); G.look(-0.25); G.tick(0.05, 30); await G.settle(); }),
  'inside-machines': async () => ev(async (G) => { G.tpLocal(1.5, -0.5, -1.3); G.look(-0.15); G.tick(0.05, 30); await G.settle(); }),
  'walk-plain': async () => ev(async (G) => { G.setLocalTime(9.5); G.tpLocal(40, 120, 0.4); G.look(-0.08); G.input.keys['w'] = true; G.tick(0.05, 26); G.input.keys['w'] = false; await G.settle(); }),
  'rover-park': async () => ev(async (G) => { G.setLocalTime(15.5); G.tpNear(G.World.rover.group.position, 7); G.look(-0.1); G.tick(0.05, 40); await G.settle(); }),
  'rover-drive': async () => ev(async (G) => { G.setLocalTime(10.5); G.tpNear(G.World.rover.group.position, 3.2); G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 120); G.input.keys['w'] = false; await G.settle(); }),
  'storm': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); G.tpLocal(8, 30, 0); G.setLocalTime(13); G.setStorm(1); G.look(-0.05); G.tick(0.05, 30); G.setStorm(1); await G.settle(); }),
  'storm-over': async () => ev((G) => { G.setStorm(0); }),
  'mav': async () => ev(async (G) => { G.tpNear(G.World.mav.position, 26); G.setLocalTime(9); G.look(0.12); G.tick(0.05, 40); await G.settle(); }),
  'canyon': async () => ev(async (G) => { await G.tp(-10.6, 293, 0); G.setLocalTime(15.5); G.look(-0.12); G.tick(0.05, 40); await G.settle(); }),
  'canyon-floor': async () => ev(async (G) => { await G.tp(-11.75, 293, 1.5); G.setLocalTime(9.5); G.look(0.1); G.tick(0.05, 40); await G.settle(); }),
  'olympus': async () => ev(async (G) => { await G.tp(15.5, 228.5, 0.5); G.setLocalTime(8); G.look(0.02); G.tick(0.05, 40); await G.settle(); }),
  'north-pole': async () => ev(async (G) => { await G.tp(87, 20, 0); G.setLocalTime(12); G.look(-0.04); G.tick(0.05, 40); await G.settle(); }),
  // every built model, seen by a free camera with the astronaut beside it for scale
  'yard': () => model((G) => G.World.uplinkRing.position, 9, 150, 10.5, { stand: [5.5, 60], height: 2.4 }),
  'pile': () => model((G) => G.World.soilPiles[3].group.position, 5.5, 140, 15, { stand: [2.6, 230] }),
  'debris-a': () => model((G) => G.World.pods[0].group.position, 6.5, 120, 9.5, { stand: [3.2, 40] }),
  'debris-b': () => model((G) => G.World.pods[1].group.position, 6, 240, 9.5, { stand: [3.0, 160] }),
  'debris-c': () => model((G) => G.World.pods[2].group.position, 5.5, 30, 9.5, { stand: [2.8, 300] }),
  'rtg': () => model((G) => G.World.rtgSite.group.position, 4.2, 150, 16, { stand: [1.8, 70] }),
  'deployables': () => model((G) => {
    if (!G.World.builtMeshes.length) {
      G.buildDeployable('greenhouse', G.at(70, 60), 0.5); G.buildDeployable('solar', G.at(79, 67), 2.2);
      G.buildDeployable('beacon', G.at(63, 69), 0); G.buildDeployable('cache', G.at(77, 72), 1.0);
      G.syncAllVisuals();
    }
    return G.World.builtMeshes[0].group.position;
  }, 15, 40, 10, { stand: [6.5, 28], height: 2.6, aim: 1.6 }),
  'greenhouse-inside': async () => ev(async (G) => { G.photo(null); G.tpAround(G.World.builtMeshes[0].group.position, 2.6, 30); G.setLocalTime(10); G.look(-0.2); G.tick(0.05, 40); await G.settle(); }),
  'greenhouse-door': async () => ev(async (G) => { G.tpAround(G.World.builtMeshes[0].group.position, 7.5, 28.6); G.setLocalTime(10); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
  'greenhouse-night': () => model((G) => G.World.builtMeshes[0].group.position, 14, 60, 21.5, { stand: [6, 80], height: 2.2, aim: 1.6 }),
  'solar-kit': () => model((G) => G.World.builtMeshes[1].group.position, 4.6, 150, 15.5, { stand: [2.2, 80] }),
  'beacon': () => model((G) => G.World.builtMeshes[2].group.position, 4.4, 200, 15.5, { stand: [1.8, 130], aim: 1.2 }),
  'o2-cache': () => model((G) => G.World.builtMeshes[3].group.position, 3.6, 210, 15.5, { stand: [1.7, 140] }),
  'pod': () => model((G) => { if (!G.World._shotPod) G.World._shotPod = G.dropSupplyPod({ scrap: 1 }, 'Open supply pod'); return G.World._shotPod.group.position; }, 5.5, 60, 9, { stand: [2.8, 140] }),
  'pod-open': () => model((G) => { const p = G.World._shotPod; p.taken = true; G.syncAllVisuals(); return p.group.position; }, 4.8, 150, 9, { stand: [2.6, 70], height: 2.2 }),
  'ice': () => model((G) => G.World.iceSites[0].group.position, 10, 40, 11, { stand: [4.6, 110], height: 2.4 }),
  ...Object.fromEntries([['Pathfinder', 6.5, 30], ['Viking 1', 6.5, 60], ['Mars 3', 5.5, 100], ['Beagle 2', 4.5, 20], ['Spirit', 5.5, 130], ['Phoenix', 6.5, 70], ['Curiosity', 7, 50],
    ['Perseverance', 8.5, 110], ['InSight', 7, 40], ['Zhurong', 6.5, 140], ['Schiaparelli EDM', 6, 80]].map(([name, dist, bearing]) => [
    'lander-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    () => model(new Function('G', `return G.World.landers.find((l) => l.data.name === ${JSON.stringify(name)}).group.position;`), dist, bearing, 10.2, { stand: [dist * 0.48, bearing + 75] }),
  ])),
  'free-camera-off': async () => ev((G) => { G.photo(null); }),
  'dawn': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 0); G.setLocalTime(6.75); G.faceSun(); G.look(0.06); G.tick(0.05, 40); await G.settle(); }),
  'dawn-light': async () => ev(async (G) => { G.tpHab(8, -40, 0); G.setLocalTime(6.9); G.look(-0.03); G.tick(0.05, 40); await G.settle(); }),
  'dusk': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 0); G.setLocalTime(17.95); G.faceSun(); G.look(0.06); G.tick(0.05, 40); await G.settle(); }),
  'twilight': async () => ev(async (G) => { G.setLocalTime(18.75); G.faceSun(); G.look(0.08); G.tick(0.05, 40); await G.settle(); }),
  'night-plain': async () => ev(async (G) => { G.setLocalTime(23); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
};
for (const [name, setup] of Object.entries(scenes)) {
  if (!want(name) || name === 'free-camera-off' || name === 'storm-over') { if (name === 'free-camera-off' || name === 'storm-over') await setup(); continue; }
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
