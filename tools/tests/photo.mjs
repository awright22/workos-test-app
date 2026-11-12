// Photo mode: the clock stops, the camera comes free, looks are applied in the final pass, and a
// full-resolution PNG comes out.
import { openGame, sleep } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push(!!ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 420) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);
const page = g.page;

await ev(async (G) => { await G.start(2.0, 303.7); });
let s = await ev((G) => ({ cold: G.S.flags.coldOpen, entered: G.photoMode.enterPhoto() }));
check('not offered during the cold open', s.cold && s.entered === false, s);

await ev(async (G) => { G.skipIntro(); G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); G.setLocalTime(10); G.tpLocal(6, 30, 0); G.tick(0.05, 20); await G.settle(); G.paused = false; });
await sleep(400);
s = await ev((G) => ({ tod: G.S.tod, suit: G.S.suit, cam: G.ctx.engine.camera.position.toArray(), fov: G.ctx.engine.camera.fov }));
await page.keyboard.press('p');
await sleep(1200);
const inPhoto = await ev((G) => ({ on: G.photoMode.photo.on, flag: G.S.photo, cls: document.getElementById('mg-root') ? document.getElementById('mg-root').className : document.querySelector('.is-photo') ? 'is-photo' : '',
  tod: G.S.tod, suit: G.S.suit, bar: !!document.getElementById('mg-photo') && getComputedStyle(document.getElementById('mg-photo')).display, hud: getComputedStyle(document.getElementById('mg-hud')).visibility,
  dist: G.photoMode.photo.dist, cam: G.ctx.engine.camera.position.toArray() }));
const moved = Math.hypot(...inPhoto.cam.map((v, i) => v - s.cam[i]));
check('P enters: the bar is shown, the HUD hidden, and the camera starts where it was', inPhoto.on && inPhoto.flag === true && /is-photo/.test(inPhoto.cls) && inPhoto.bar === 'block' && inPhoto.hud === 'hidden' && moved < 1.0, { ...inPhoto, moved });
await sleep(1500);
let t = await ev((G) => ({ tod: G.S.tod, suit: G.S.suit }));
check('the clock is stopped: time and the suit tank do not move', t.tod === inPhoto.tod && t.suit === inPhoto.suit, { before: inPhoto.tod, after: t.tod, suit: [inPhoto.suit, t.suit] });

// orbit by dragging, zoom with the wheel, slide with a key
const before = await ev((G) => ({ ...G.photoMode.photo }));
await page.mouse.move(640, 200); await page.mouse.down(); await page.mouse.move(760, 240, { steps: 6 }); await page.mouse.up();
await page.mouse.wheel(0, 600);
// (held until the camera has slid: at one software-rendered frame a second, half a second may be no frame at all)
await page.keyboard.down('d');
for (let i = 0; i < 16; i++) { await sleep(500); if (await ev((G) => G.photoMode.photo.slide > 0.12)) break; }
await page.keyboard.up('d');
await sleep(200);
const after = await ev((G) => ({ ...G.photoMode.photo, pause: G.S.uiOpen }));
check('drag orbits, the wheel zooms, a key slides, and none of it pauses the game', Math.abs(after.yaw - before.yaw) > 0.1 && Math.abs(after.pitch - before.pitch) > 0.02 && after.dist > before.dist * 1.5 && after.slide > 0.1 && after.pause === false,
  { yaw: [before.yaw, after.yaw], pitch: [before.pitch, after.pitch], dist: [before.dist, after.dist], slide: after.slide });

// a slider and a look
await ev(() => { const r = document.querySelector('#mg-photo [data-ph="fov"]'); r.value = 28; r.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('#mg-photo [data-look="noir"]').click(); document.querySelector('#mg-photo [data-act="astro"]').click(); });
// wait for frames, not for time: software rendering under load can take longer than any fixed pause
await ev(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
t = await ev((G) => { const u = G.ctx.engine.final.uniforms; let astro = null; G.ctx.world.traverse((o) => { if (o.name === 'astronaut' && astro === null) astro = o.visible; }); return { fov: G.ctx.engine.camera.fov, mono: u.uMono.value, contrast: u.uContrast.value, astro, out: document.querySelector('#mg-photo [data-ph="fov"]').nextElementSibling.textContent }; });
check('the lens slider, a look and hiding the astronaut all reach the picture', Math.abs(t.fov - 28) < 0.01 && t.mono === 1 && t.contrast > 1.2 && t.astro === false && t.out === '28°', t);
await page.screenshot({ path: 'tests/.cache/photo-mode.png' });

// the shutter
t = await ev(async (G) => {
  const e = G.ctx.engine, c = e.renderer.domElement, before = [c.width, c.height];
  const shot = await G.photoMode.takePhoto();
  const head = shot ? [...new Uint8Array(await shot.blob.slice(0, 8).arrayBuffer())] : null;
  let dims = null;
  if (shot) { const bmp = await createImageBitmap(shot.blob); dims = [bmp.width, bmp.height]; }
  return { name: shot && shot.name, size: shot && shot.blob.size, head, dims, before, after: [c.width, c.height], full: [Math.round(innerWidth * e.dpr), Math.round(innerHeight * e.dpr)] };
});
check('the shutter gives a PNG at the screen\'s full resolution and then puts the render size back',
  /^stranded-sol1-\d+\.\d[NS]-\d+\.\dE-1\.png$/.test(t.name || '') && t.size > 20000 && t.head && t.head.slice(1, 4).join() === '80,78,71' &&
  t.dims && Math.abs(t.dims[0] - t.full[0]) <= 1 && Math.abs(t.dims[1] - t.full[1]) <= 1 && t.after[0] === t.before[0] && t.dims[0] > t.before[0], t);

await page.keyboard.press('Escape');
await sleep(600);
t = await ev((G) => { const u = G.ctx.engine.final.uniforms; return { on: G.photoMode.photo.on, flag: G.S.photo, mono: u.uMono.value, sat: u.uSaturation.value, paused: G.S.uiOpen, cls: /is-photo/.test(document.getElementById('mg-root').className), hud: getComputedStyle(document.getElementById('mg-hud')).visibility }; });
check('Escape leaves photo mode, restores the picture, and does not open the pause menu', t.on === false && t.flag === false && t.mono === 0 && Math.abs(t.sat - 1.06) < 1e-6 && t.paused === false && t.cls === false && t.hud === 'visible', t);
await sleep(1200);
t = await ev((G) => { let astro = null; G.ctx.world.traverse((o) => { if (o.name === 'astronaut' && astro === null) astro = o.visible; }); return { tod: G.S.tod, astro, fov: G.ctx.engine.camera.fov }; });
check('the game carries on: time moves, the astronaut is back, the lens is the game\'s', t.tod > inPhoto.tod && t.astro === true && t.fov > 40, t);

// from the pause menu
await page.keyboard.press('Escape');
await sleep(500);
const item = await ev(() => { const b = document.querySelector('#mg-panel [data-act="photo"]'); if (b) b.click(); return !!b; });
await sleep(500);
t = await ev((G) => ({ on: G.photoMode.photo.on, ui: G.S.uiOpen }));
check('the pause menu offers photo mode and opens it', item && t.on && t.ui === false, { item, ...t });
await ev((G) => { document.querySelector('#mg-photo [data-act="done"]').click(); });

// ---- a photograph with a lander in the frame goes into NASA's album, once
const album = await ev(async (G) => {
  const rec = G.World.landers.find((r) => r.data.name === 'Viking 1');
  const p = rec.group.position.clone().normalize();
  const lat = Math.asin(p.y) * 180 / Math.PI, lon = ((Math.atan2(-p.z, p.x) * 180 / Math.PI) + 360) % 360;
  await G.tp(lat - (14 / 12000) * 180 / Math.PI, lon, 0);                 // 14 m south of it, facing north
  G.setLocalTime(11); G.tick(0.05, 20); await G.settle();
  const before = { album: { ...(G.S.album || {}) }, pts: G.S.science ? G.S.science.points : 0 };
  G.photoMode.enterPhoto();
  G.tick(0.05, 2);
  const first = await G.photoMode.takePhoto();
  const subjects = G.photoMode.photoSubjects();          // (asked after a frame has been drawn from the photo camera)
  const second = await G.photoMode.takePhoto();
  G.photoMode.exitPhoto();
  const saved = G.serializeState();
  return { before, subjects, first: first && first.subjects, second: second && second.subjects, album: { ...G.S.album }, pts: G.S.science.points, saved: saved.album };
});
check('a photograph with a lander in frame goes into the album once, for science credit, and is saved',
  album.first && album.first.includes('Viking 1') && album.second && album.second.length === 0 &&
  album.album['Viking 1'] >= 1 && album.pts === album.before.pts + 4 && album.saved && album.saved['Viking 1'] >= 1, album);

const errors = g.errors.filter((e) => !/favicon/.test(e));
const passed = results.filter(Boolean).length;
console.log(`${passed}/${results.length} photo mode checks passed; console errors: ${errors.length}`, errors.slice(0, 5));
await g.close();
process.exit(passed === results.length && !errors.length ? 0 : 1);
