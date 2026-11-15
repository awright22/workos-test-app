// The same view drawn at the resolutions a phone ends up at, side by side, for looking at.
//
//   node tools/tests/sharp-shots.mjs
//
// A phone of 932 x 430 points with three device pixels to the point (the renderer uses two of them at most), on
// "medium", the preset a phone starts on. For each of three views the middle of the picture is photographed as the
// phone's screen shows it (the canvas stretched over the screen by the browser) at:
//   0.88 pixels to the point, not firmed up   what the owner's phone drew to hold 60 frames a second, as it looked then
//   0.88, firmed up                           the same pixels with the final pass's sharpening
//   1.2 and 1.6                               about what 40 and 30 frames a second leave room for (a guess: the
//                                             phone's own diagnostics will say)
//   2.0                                       the ceiling: two pixels to the point
// and the five are set side by side in one sheet a view, in tools/tests/.cache/sharp/. Software rendering: these
// say what each resolution looks like, and nothing of how fast a phone draws it.
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';

const dir = path.join(outDir, 'sharp');
await mkdir(dir, { recursive: true });
const g = await openGame({ width: 932, height: 430, touch: true, quality: 'medium', dsf: 3, query: 'safe=0,59,21,59' });
const page = g.page, ev = g.eval;
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); await G.settle(); G.paused = true; G.setStorm(0); G.S.storm.i = 0; });
// (the picture, not the interface over it)
await page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });

const VIEWS = [
  ['base', 'the Hab, the rover and him, early afternoon', async (G) => { G.tpLocal(6, 34, 0.4); G.setLocalTime(14); G.tick(0.05, 20); await G.settle(); }],
  ['boulders', 'a boulder field, late morning (Ares Vallis)', async (G) => { await G.tp(19.1, 326.7, 0.6); G.setLocalTime(11); G.tick(0.05, 20); await G.settle(); }],
  ['canyon', 'the canyon from its rim, afternoon (Valles Marineris)', async (G) => { await G.tp(-10.74, 293, 3.14); G.setLocalTime(15); G.look(-0.2); G.tick(0.05, 20); await G.settle(); }],
];
const STEPS = [[0.88, false, '0.88 px to the point, as it was'], [0.88, true, '0.88, firmed up'], [1.2, true, '1.2 (about 40 fps)'], [1.6, true, '1.6 (about 30 fps)'], [2.0, true, '2.0 (the ceiling)']];
// the middle of the picture: 300 x 240 points of it (900 x 720 of the screen's pixels)
const clip = { x: 316, y: 110, width: 300, height: 240 };

for (const [name, what, setup] of VIEWS) {
  await ev(setup);
  const shots = [];
  for (const [ratio, firm, label] of STEPS) {
    const got = await ev((G, a) => {
      const e = G.ctx.engine;
      e.maxDyn = 9; e.dynScale = a.ratio / (e.dpr * e.q.scale); e.resize();
      if (!a.firm) e.final.uniforms.uSharp.value = 0;
      e.snapLight = 3;
      return { ratio: +(e.dpr * e.q.scale * e.dynScale).toFixed(2), sharp: +e.final.uniforms.uSharp.value.toFixed(2), canvas: [e.renderer.domElement.width, e.renderer.domElement.height] };
    }, { ratio, firm });
    for (let i = 0; i < 3; i++) await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await sleep(1200);
    shots.push({ label: `${label}: drawn ${got.canvas[0]} x ${got.canvas[1]}`, b: (await page.screenshot({ clip, timeout: 240000 })).toString('base64') });
    console.log(`  ${name} ${label}: ${JSON.stringify(got)}`);
  }
  const sheet = await page.context().newPage();
  const data = await sheet.evaluate(async ({ shots, title }) => {
    const imgs = await Promise.all(shots.map((s) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s.b; })));
    const w = imgs[0].width, h = imgs[0].height, pad = 8, top = 34, cap = 26;
    const c = document.createElement('canvas'); c.width = imgs.length * (w + pad) + pad; c.height = top + h + cap + pad;
    const x = c.getContext('2d'); x.fillStyle = '#111'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#eee'; x.font = '600 20px sans-serif'; x.fillText(title, pad, 24);
    imgs.forEach((im, i) => { const cx = pad + i * (w + pad); x.drawImage(im, cx, top); x.fillStyle = '#ddd'; x.font = '600 17px sans-serif'; x.fillText(shots[i].label, cx + 2, top + h + 19); });
    return c.toDataURL('image/png').split(',')[1];
  }, { shots, title: `${name}: ${what}. The middle of a 932 x 430 phone's picture as its screen shows it, at five resolutions.` });
  await sheet.close();
  await writeFile(path.join(dir, name + '.png'), Buffer.from(data, 'base64'));
  console.log('  sheet: ' + path.join(dir, name + '.png'));
}
if (g.errors.length) console.log('  console errors: ' + JSON.stringify(g.errors.slice(0, 4)));
await g.close();
process.exit(g.errors.length ? 1 : 0);
