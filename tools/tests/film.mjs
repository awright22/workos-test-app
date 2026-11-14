// The launch as a strip of stills: the last act played from "punch it" and photographed at set moments.
//   node tools/tests/film.mjs [--phone] [--at 4.9,5.8,...] [--hour 9] [--quality medium]
// Times are seconds from the start of the countdown (lift-off is at 5.2). Images go to tools/tests/.cache/film/
// (film-phone/ with --phone). Rendering is software WebGL: slow, and not a measure of frame rate.
import { openGame, sleep, outDir } from './lib.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const phone = process.argv.includes('--phone');
const [W, H] = (phone ? '844x390' : arg('--size', '1280x720')).split('x').map(Number);
const times = arg('--at', '4.9,5.9,7.4,9.4,10.4,12.5,15.5,18.4,20.2,21.2,22.6,24.4,25.6,27.6,29.0,30.4,33.0').split(',').map(Number);
const hour = Number(arg('--hour', '9'));
const dir = path.join(outDir, phone ? 'film-phone' : 'film');
await mkdir(dir, { recursive: true });

const g = await openGame({ quality: arg('--quality', 'medium'), width: W, height: H, touch: phone, dsf: phone ? 2 : 1, query: phone ? 'safe=0,47,21,47' : '' });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });
await g.page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });
await g.eval(async (G, hour) => { G.tpNear(G.World.mav.position, 26); G.setLocalTime(hour); G.tick(0.05, 20); await G.settle(); G.startLaunch(); }, hour);
let now = 0;
for (const t of times) {
  const steps = Math.round((t - now) * 30);
  // (the win screen, when it comes, is part of the picture from then on)
  const st = await g.eval(async (G, n) => {
    G.tick(1 / 30, n); await G.settle();
    const e = G.ctx.engine, r = (x) => Math.round(x * 1000) / 1000, tu = G.ctx.terrainUniforms || {};
    return { tod: r(G.S.tod), sunUp: r(e.sunDir.dot(G.World.mav.position.clone().normalize())), sunI: r(e.sky.sunIntensity), light: r(e.sun.intensity), exposure: r(e.exposure),
      fog: e.scene.fog.density, day: tu.uDay && r(tu.uDay.value), space: tu.uSpace && r(tu.uSpace.value), relief: tu.uRelief && r(tu.uRelief.value), dust: tu.uDust && r(tu.uDust.value),
      camAlt: Math.round(e.camera.position.length() - 12000), fov: e.camera.fov };
  }, steps);
  console.log('  state', JSON.stringify(st));
  now += steps / 30;
  await sleep(900);
  const name = `launch-${String(t.toFixed(1)).padStart(4, '0')}`;
  await g.page.screenshot({ path: path.join(dir, `${name}.png`), timeout: 420000 });
  console.log('  shot', name);
}
await g.close();
