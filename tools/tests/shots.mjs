// Screenshot matrix: the scenes the quality bar is judged on (see static/martian/QUALITY.md).
//   node tools/tests/shots.mjs [--quality medium] [--only name,name] [--from name] [--size 1280x720] [--touch] [--phone]
// Images go to tools/tests/.cache/shots/. Rendering is software WebGL: slow, and not a
// measure of frame rate.
import { openGame, sleep, outDir } from './lib.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const quality = arg('--quality', 'medium');
const only = arg('--only', '').split(',').filter(Boolean);
// --phone: the picture as the owner's iPhone shows it. Landscape, 844x390 at twice the pixels, touch, the
// notch and home indicator as safe-area insets, on the preset a phone starts on. Pictures go to shots-phone/.
const phone = process.argv.includes('--phone');
const [W, H] = (phone ? '844x390' : arg('--size', '1280x720')).split('x').map(Number);
const touch = phone || process.argv.includes('--touch');
const dir = path.join(outDir, phone ? 'shots-phone' : 'shots');
await mkdir(dir, { recursive: true });

const g = await openGame({ quality, width: W, height: H, touch, dsf: phone ? 2 : 1, query: phone ? 'safe=0,47,21,47' : '' });
const ev = (fn, a) => g.eval(fn, a);
const snap = async (name) => { await sleep(900); await g.page.screenshot({ path: path.join(dir, `${name}.png`), timeout: 420000 }); console.log('  shot', name); };
// --from name: take up a run that was cut short, at the named scene (set-up scenes before it still run)
const from = arg('--from', '');
let begun = !from;
const want = (n) => { if (n === from) begun = true; return begun && (!only.length || only.includes(n)); };
// pictures of the world: everything of the interface is hidden (the interface has its own screenshot set, tests/ui-shots.mjs)
const hud = (on) => g.page.addStyleTag({ content: `#mg-root > *:not(canvas) { opacity: ${on ? 1 : 0} !important; }` });

if (want('title')) { await sleep(2600); await snap('title'); await hud(false); await snap('title-globe'); await hud(true); }
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });   // the opening storm has blown out
await hud(false);

// a model scene: the astronaut stands `stand` = [metres, bearing] from the target; a free camera looks at it
const model = (where, dist, bearing, hours, o = {}) => g.page.evaluate(`(async () => {
  const G = window.__MG;
  const pos = (${where.toString()})(G);
  G.tpAround(pos, ${(o.stand || [3, bearing + 75])[0]}, ${(o.stand || [3, bearing + 75])[1]});
  G.look(0);                 // (he stands as he stands, not looking wherever the scene before left the camera)
  G.setLocalTime(${hours});
  G.tick(0.05, 40);
  G.photo(pos, ${dist}, ${bearing}, ${o.height || 1.7}, ${o.aim || 0.9});
  G.ctx.engine.camera.position.copy(pos);
  await G.settle();
})()`);
// an ice outcrop from in front of its face, a little to one side (each site is turned its own way: the face looks down the model's +Z)
const iceFace = (pick, hours) => g.page.evaluate(`(async () => {
  const G = window.__MG;
  const site = (${pick.toString()})(G), pos = site.group.position;
  const up = pos.clone().normalize(), e = up.clone().set(-up.z, 0, up.x).normalize(), n = up.clone().cross(e);
  const d = up.clone().set(0, 0, 1).applyQuaternion(site.group.quaternion);
  const b = Math.atan2(d.dot(e), d.dot(n)) * 180 / Math.PI;
  G.tpAround(pos, 4.6, b + 78);
  G.look(0);
  G.setLocalTime(${hours});
  G.tick(0.05, 40);
  G.photo(pos, 8.2, b + 24, 1.9, 0.6);
  G.ctx.engine.camera.position.copy(pos);
  await G.settle();
})()`);
// each scene: set the state through the debug hook, let the terrain settle, take the picture
const scenes = {
  'hab-morning': async () => ev(async (G) => { G.S.firstPerson = false; G.tpLocal(7, 24, 0); G.setLocalTime(8.2); G.look(-0.06); G.tick(0.05, 40); await G.settle(); }),
  'hab-noon': async () => ev(async (G) => { G.tpLocal(-9, 26, 0.35); G.setLocalTime(12.3); G.look(-0.1); G.tick(0.05, 40); await G.settle(); }),
  'hab-dusk': async () => ev(async (G) => { G.tpLocal(10, 26, -0.4); G.setLocalTime(17.6); G.look(-0.02); G.tick(0.05, 40); await G.settle(); }),
  'hab-night': async () => ev(async (G) => { G.tpLocal(6, 22, 0); G.setLocalTime(22); G.look(-0.05); G.tick(0.05, 30); await G.settle(); }),
  // (a played game has crops in its beds: the interior pictures show the farm as it is for most of a run)
  '-farm-planted': async () => ev((G) => { const crops = ['potato', 'potato', 'radish', 'lettuce', 'soy', 'tomato'], grown = [0.9, 0.6, 0.75, 0.95, 0.45, 0.7];
    G.World.plots.forEach((pl, i) => { pl.state = 'growing'; pl.crop = crops[i % 6]; pl.growth = grown[i % 6]; pl.watered = 2; }); G.syncAllVisuals(); }),
  'inside-game-cam': async () => ev(async (G) => { G.setLocalTime(10); G.tpLocal(0, 4.5, 0); G.look(-0.2); G.tick(0.05, 30); await G.settle(); }),
  'inside-machines': async () => ev(async (G) => { G.tpLocal(-1.5, 0.5, 1.9); G.look(-0.25); G.tick(0.05, 30); await G.settle(); }),
  'inside-farm': async () => ev(async (G) => { G.tpLocal(1.5, -0.5, -1.3); G.look(-0.15); G.tick(0.05, 30); await G.settle(); }),
  'walk-plain': async () => ev(async (G) => { G.setLocalTime(9.5); G.tpLocal(40, 120, 0.4); G.look(-0.08); G.input.keys['w'] = true; G.tick(0.05, 26); G.input.keys['w'] = false; await G.settle(); }),
  'rover-park': async () => ev(async (G) => { G.setLocalTime(15.5); G.tpNear(G.World.rover.group.position, 4.6); G.look(-0.16); G.tick(0.05, 40); await G.settle(); }),
  // (on the open plain, so that it is driving when the picture is taken: among the Hab's boulders it was often stopped against one)
  'rover-drive': async () => ev(async (G) => { G.setLocalTime(10.5); G.roverLocal(44, 122, 0.4); G.tpNear(G.World.rover.group.position, 3.2); G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 120); await G.settle(); G.tick(0.05, 6); G.input.keys['w'] = false; }),
  // (it sets itself up: taken alone, it used to be whatever the scene before it had left, often a man on foot by the Hab)
  'rover-night': async () => ev(async (G) => { G.setLocalTime(22.5); G.roverLocal(44, 122, 0.4); if (G.S.mode !== 'rover') { G.tpNear(G.World.rover.group.position, 3.2); G.hold(0.8); } G.input.keys['w'] = true; G.tick(0.05, 70); await G.settle(); G.tick(0.05, 6); G.input.keys['w'] = false; }),
  'storm': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); G.tpLocal(8, 30, 0); G.setLocalTime(13); G.setStorm(1); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
  'storm-sun': async () => ev(async (G) => { G.setLocalTime(16.6); G.faceSun(); G.look(0.2); G.tick(0.05, 40); await G.settle(); }),
  'storm-over': async () => ev((G) => { G.setStorm(0); }),
  'mav': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); G.tpNear(G.World.mav.position, 14); G.setLocalTime(9);
    { const up = G.player.pos.clone().normalize(), d = G.World.mav.position.clone().sub(G.player.pos); d.addScaledVector(up, -d.dot(up)).normalize(); const side = up.clone().cross(d); G.lookAt({ x: d.x + side.x * 0.3, y: d.y + side.y * 0.3, z: d.z + side.z * 0.3 }); }      // (the rocket beside him, not behind him)
    G.look(0.26); G.tick(0.05, 40); await G.settle(); }),
  'canyon': async () => ev(async (G) => { await G.tp(-11.5, 293, 3.14); G.setLocalTime(15.5); G.look(0.12); G.tick(0.05, 40); await G.settle(); }),
  // the north wall of Valles Marineris at 296 E: about 13 m of drop in every 4 m of ground, a hundred metres in all
  'canyon-rim': async () => ev(async (G) => { await G.tp(-8.47, 296, 3.14); G.setLocalTime(15); G.look(-0.3); G.tick(0.05, 40); await G.settle(); }),
  'canyon-wall': async () => ev(async (G) => { await G.tp(-12.19, 293, 3.14); G.setLocalTime(15); G.look(0.3); G.tick(0.05, 40); await G.settle(); }),
  // on the wall itself, looking along it: scree underfoot, the spurs' rock beside
  'canyon-climb': async () => ev(async (G) => { await G.tp(-12.235, 292.86, 1.3); G.setLocalTime(15); G.look(0.05); G.tick(0.05, 40); await G.settle(); }),
  // at the wall's foot, close under it
  'canyon-foot': async () => ev(async (G) => { await G.tp(-12.205, 292.86, 1.9); G.setLocalTime(10.5); G.look(0.1); G.tick(0.05, 40); await G.settle(); }),
  'canyon-floor': async () => ev(async (G) => { await G.tp(-11.75, 293, 1.5); G.setLocalTime(9.5); G.look(0.1); G.tick(0.05, 40); await G.settle(); }),
  'olympus': async () => ev(async (G) => { await G.tp(15.5, 228.5, 0.5); G.setLocalTime(8); G.look(0.02); G.tick(0.05, 40); await G.settle(); }),
  // from forty-five metres up, looking along the flank: the lava tongues are a pattern no one sees from eye height
  'olympus-flows': async () => { await ev(async (G) => { await G.tp(16.6, 227.9, 2.4); G.tick(0.05, 5); }); return model((G) => G.player.pos.clone(), 110, 315, 8.5, { stand: [4, 100], height: 45, aim: 0.9 }); },
  '-camera-back-1': async () => ev((G) => { G.photo(null); }),          // (the raised camera must not stay on for the scenes that follow)
  'olympus-caldera': async () => ev(async (G) => { await G.tp(17.712, 226.805, 0); G.setLocalTime(16); G.look(-0.1); G.tick(0.05, 40); await G.settle(); }),
  'south-pole': async () => ev(async (G) => { await G.tp(-87.6, 318, 0.6); G.setLocalTime(12); G.look(-0.04); G.tick(0.05, 40); await G.settle(); }),
  'north-pole': async () => ev(async (G) => { await G.tp(87, 20, 1.9); G.setLocalTime(12); G.look(-0.04); G.tick(0.05, 40); await G.settle(); }),
  // every built model, seen by a free camera with the astronaut beside it for scale
  'yard': () => model((G) => G.World.uplinkRing.position, 10, 325, 10.5, { stand: [3.6, 200], height: 2.4 }),
  'pile': () => model((G) => G.World.soilPiles[3].group.position, 5.5, 140, 15, { stand: [2.6, 230] }),
  'debris-a': () => model((G) => G.World.pods[0].group.position, 6.5, 120, 9.5, { stand: [3.2, 40], height: 1.35, aim: 1.15 }),
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
  }, 16, 55, 10, { stand: [7.5, 10], height: 2.6, aim: 1.6 }),
  // (a dome in use has crops in its trays, as the Hab's beds have in their pictures)
  '-dome-planted': async () => ev((G) => { const crops = ['lettuce', 'tomato', 'soy', 'radish'], grown = [0.9, 0.7, 0.55, 0.8]; let k = 0;
    G.World.plots.forEach((pl) => { if (pl.state === 'growing') return; pl.state = 'growing'; pl.crop = crops[k % 4]; pl.growth = grown[k % 4]; pl.watered = 2; k++; }); G.syncAllVisuals(); }),
  'greenhouse-inside': async () => ev(async (G) => { G.photo(null); G.tpAround(G.World.builtMeshes[0].group.position, 1.2, 210); G.setLocalTime(10); G.look(-0.2); G.tick(0.05, 40); await G.settle(); }),
  // the dome's floor from above, through the glazing: the frame's shadows should lie across it
  'greenhouse-above': async () => ev(async (G) => { const p = G.World.builtMeshes[0].group.position.clone(); G.photo(p, 2.2, 30, 7.5, 0.2); G.tick(0.05, 2); await G.settle(); }),
  '-camera-back-3': async () => ev(async (G) => { G.photo(null); G.tick(0.05, 2); await G.settle(); }),
  'greenhouse-door': async () => ev(async (G) => { G.tpAround(G.World.builtMeshes[0].group.position, 7.5, 28.6); G.setLocalTime(10); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
  'greenhouse-night': () => model((G) => G.World.builtMeshes[0].group.position, 14, 60, 21.5, { stand: [6, 80], height: 2.2, aim: 1.6 }),
  'solar-kit': () => model((G) => G.World.builtMeshes[1].group.position, 4.6, 150, 15.5, { stand: [2.2, 80] }),
  'beacon': () => model((G) => G.World.builtMeshes[2].group.position, 4.4, 200, 15.5, { stand: [1.8, 130], aim: 1.2 }),
  'o2-cache': () => model((G) => G.World.builtMeshes[3].group.position, 3.6, 210, 15.5, { stand: [1.7, 140] }),
  'pod': () => model((G) => { if (!G.World._shotPod) G.World._shotPod = G.dropSupplyPod({ scrap: 1 }, 'Open supply pod'); return G.World._shotPod.group.position; }, 5.5, 60, 9, { stand: [2.8, 140] }),
  'pod-open': () => model((G) => { const p = G.World._shotPod; p.taken = true; G.syncAllVisuals(); return p.group.position; }, 4.8, 150, 9, { stand: [2.6, 70], height: 2.2 }),
  'ice': () => model((G) => G.World.iceSites[0].group.position, 10, 40, 11, { stand: [4.6, 110], height: 2.4 }),
  // ... and one out on the northern plain, on red ground, from in front of its face
  'ice-plain': () => iceFace((G) => G.World.iceSites.find((x) => !x.korolev) || G.World.iceSites[0], 13.5),
  'ice-face': () => iceFace((G) => G.World.iceSites[0], 11),
  ...Object.fromEntries([['Pathfinder', 6.5, 30], ['Viking 1', 6.5, 60], ['Mars 3', 5.5, 100], ['Beagle 2', 4.5, 20], ['Spirit', 5.5, 130], ['Phoenix', 6.5, 70], ['Curiosity', 7, 50],
    ['Perseverance', 8.5, 110], ['InSight', 7, 40], ['Zhurong', 6.5, 140], ['Schiaparelli EDM', 6, 80]].map(([name, dist, bearing]) => [
    'lander-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    () => model(new Function('G', `return G.World.landers.find((l) => l.data.name === ${JSON.stringify(name)}).group.position;`), dist, bearing, 10.2, { stand: [dist * 0.48, bearing + 75] }),
  ])),
  'free-camera-off': async () => ev((G) => { G.photo(null); }),
  // gaps the second review named: the sun in a clear sky, the astronaut from the front, the pole itself
  'day-sun': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); await G.tpHab(40, 120, 0); G.setLocalTime(15.6); G.faceSun(); G.look(0.34); G.tick(0.05, 40); await G.settle(); }),
  'astronaut-front': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); await G.tpHab(30, 70, 2.2); G.setLocalTime(9.5); G.look(-0.1); G.tick(0.05, 40); await G.settle();
    const P = G.photoMode; P.enterPhoto(); P.photo.yaw += Math.PI; P.photo.dist = 3.1; P.photo.pitch = 0.04; P.photo.rise = 0.15; P.photo.fov = 40; }),
  'photo-off': async () => ev((G) => { G.photoMode.exitPhoto(); }),
  // the figure himself, close, from the side and from behind (he stands at the spot and the camera goes round him)
  'astronaut-side': async () => ev(async (G) => { const p = G.player.pos.clone(); G.tpAround(p, 0.01, 0); G.setLocalTime(9.5); G.tick(0.05, 40); G.photo(G.player.pos.clone(), 3.4, 90, 1.25, 0.95); await G.settle(); }),
  // (he faces south as he is stood here: his back is seen from the north. From bearing 200 this picture was a second front view.)
  'astronaut-back': async () => ev(async (G) => { G.photo(G.player.pos.clone(), 3.4, 20, 1.4, 0.95); G.tick(0.05, 2); await G.settle(); }),
  '-camera-back-2': async () => ev(async (G) => { G.photo(null); G.tick(0.05, 2); await G.settle(); }),
  'pole-90': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); await G.tp(89.93, 0, 2.2); G.setLocalTime(12); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
  'dawn': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 0); G.setLocalTime(6.75); G.faceSun(); G.look(0.06); G.tick(0.05, 40); await G.settle(); }),
  'dawn-light': async () => ev(async (G) => { G.tpHab(8, -40, 0); G.setLocalTime(6.9); G.look(-0.03); G.tick(0.05, 40); await G.settle(); }),
  'dusk': async () => ev(async (G) => { await G.tp(-14.6, 175.5, 0); G.setLocalTime(17.95); G.faceSun(); G.look(0.06); G.tick(0.05, 40); await G.settle(); }),
  'twilight': async () => ev(async (G) => { G.setLocalTime(18.75); G.faceSun(); G.look(0.08); G.tick(0.05, 40); await G.settle(); }),
  'night-plain': async () => ev(async (G) => { G.setLocalTime(23); G.look(-0.05); G.tick(0.05, 40); await G.settle(); }),
  // the last act, and so the last pictures (the game is won at the end of it): the pad as the engine lights, the column
  // from far off, the climb into a black sky, and the Hermes over the day-night line (tests/film.mjs takes the whole strip)
  'launch': async () => ev(async (G) => { if (G.S.mode === 'rover') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); G.tpNear(G.World.mav.position, 26); G.setLocalTime(9); G.tick(0.05, 20); await G.settle(); G.startLaunch(); G.tick(0.05, 130); await G.settle(); }),
  'launch-wide': async () => ev(async (G) => { G.tick(0.05, 50); await G.settle(); }),
  'launch-climb': async () => ev(async (G) => { G.tick(0.05, 120); await G.settle(); }),
  'launch-orbit': async () => ev(async (G) => { G.tick(0.05, 250); await G.settle(); }),
};
for (const [name, setup] of Object.entries(scenes)) {
  // scenes that only set something up (their name starts with '-', or is one of the old three) run always and take no picture
  const silent = name.startsWith('-') || name === 'free-camera-off' || name === 'storm-over' || name === 'photo-off';
  if (!want(name) || silent) { if (silent) await setup(); continue; }
  await ev((G) => { G.S.suit = 100; G.S.health = 100; G.S.o2 = 100; G.S.water = 80; G.S.food = 10; G.S.power = 90; });   // nobody suffocates mid-shoot
  // (a scene that is not about the rover starts on foot, whatever ran before it: with --only, the scenes after
  // `rover-drive` were taken from the driver's seat)
  if (!name.startsWith('rover')) await ev((G) => { if (G.S.mode === 'rover') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); } });
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
