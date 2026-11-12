// Screenshots of every interface state at every supported size, for looking at.
//
//   node tools/tests/ui-shots.mjs                         every size, every state
//   node tools/tests/ui-shots.mjs --size=1280x720         one size (comma-separated list; matches by substring)
//   node tools/tests/ui-shots.mjs --only=hud,map          only states whose name contains one of these
//
// Images land in tools/tests/.cache/ui/<size>/NN-<state>.png. The script drives the real game
// through its debug hooks (window.__MG for the game, window.__UI for menus) in headless
// Chromium with software WebGL, so it is slow: about two minutes a size. It exits non-zero
// if the page logged a console error.
import path from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';

const SIZES = [
  { name: '1280x720', w: 1280, h: 720 },
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '2560x1440', w: 2560, h: 1440 },
  { name: '1024x768', w: 1024, h: 768 },
  // iPhone in landscape: the notch and the home indicator are simulated with ?safe=top,right,bottom,left
  { name: 'phone-844x390', w: 844, h: 390, touch: true, safe: '0,47,21,47' },
  { name: 'phone-667x375', w: 667, h: 375, touch: true, safe: '0,47,21,47' },
  { name: 'portrait-390x844', w: 390, h: 844, touch: true, safe: '47,0,34,0', portrait: true },
];
const arg = (k) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1].split(',') : null; };
const wantSizes = arg('size'), only = arg('only');
const errors = [];
let total = 0;

async function run(size) {
  const t0 = Date.now();
  const g = await openGame({ width: size.w, height: size.h, touch: size.touch, quality: 'low', query: size.safe ? 'safe=' + size.safe : '' });
  const dir = path.join(outDir, 'ui', size.name);
  if (!only) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const page = g.page;
  let n = 0;
  const shot = async (name, wait = 500) => {
    n++;
    if (only && !only.some((o) => name.includes(o))) return;
    await sleep(wait);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: path.join(dir, `${String(n).padStart(2, '0')}-${name}.png`), timeout: 120000 });
    total++;
  };
  const ev = g.eval;
  const ui = (fn, a) => page.evaluate(`(${fn.toString()})(window.__UI, window.__MG, ${JSON.stringify(a === undefined ? null : a)})`);
  const click = (sel, opts) => page.locator(sel).first().click({ timeout: 20000, ...opts });
  const key = (k) => page.keyboard.press(k);
  const visible = (sel) => page.locator(sel).first().isVisible();
  /** Let the game run in real time for a moment (the renderer's exposure only adapts while it runs). */
  const live = async (ms) => { await ev((G) => { G.paused = false; }); await sleep(ms); await ev((G) => { G.paused = true; }); };

  // big windows: software WebGL is very slow there, so draw the 3D picture at low resolution (the interface is unaffected)
  if (size.w >= 1900) await ev((G) => { G.ctx.engine.q = { ...G.ctx.engine.q, scale: 0.3 }; G.ctx.engine.resize(); }).catch(() => {});

  // ---------------------------------------------------------------- portrait: the game asks for landscape
  if (size.portrait) {
    await shot('rotate-title', 1800);
    await g.close();
    return;
  }

  // ---------------------------------------------------------------- menus before the game
  await shot('title', 2200);
  const fakeTitle = (U, G, o) => U.showTitle({ saved: o.saved, unreadable: o.unreadable, onContinue() {}, onNewGame() {} });
  await ui(fakeTitle, { saved: { sol: 12, diffName: 'ENGINEER', region: 'Elysium Planitia' }, unreadable: false });
  await shot('title-continue');
  await ui(fakeTitle, { saved: null, unreadable: true });
  await shot('title-unreadable-save');
  await ui(fakeTitle, { saved: { sol: 12, diffName: 'ENGINEER', region: 'Elysium Planitia' }, unreadable: false });
  await click('[data-act="new"]');
  await shot('newgame');
  await key('Escape');
  await click('[data-act="settings"]');
  await shot('settings');
  await key('Escape');
  await click('[data-act="credits"]');
  await shot('credits');
  await key('Escape');
  await ui((U) => U.showLoading(0.62, 'Building terrain'));
  await shot('loading');

  // ---------------------------------------------------------------- the first minute: suit leaking
  await ev(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 30); });
  await shot('hud-coldopen', 2200);

  // ---------------------------------------------------------------- on foot by day
  await ev((G) => { G.skipIntro(); G.tpLocal(0, 30, 0); G.tick(0.05, 4); });
  await ui((U) => {
    U.log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.');
    U.log('Hab battery low. Life support idles at zero. Wipe the panels.', 'sys');
    U.log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa');
  });
  await sleep(3600);
  await ev((G) => { G.tick(0.05, 8); });
  await shot('hud-day', 300);

  // the interaction prompt: ready, being held, and refused
  await ev((G) => {
    const T = G.ctx.engine.camera.position.constructor;
    const p = G.World.panels[0];
    p.dust = 0.42;
    const w = new T().copy(p.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position);
    G.tpNear(w, 1.6); G.tick(0.05, 3);
  });
  await shot('hud-prompt');
  await ev((G) => { G.input.eHeld = true; G.tick(0.05, 18); });
  await shot('hud-prompt-holding', 200);
  await ev((G) => { G.input.eHeld = false; G.World.panels[0].dust = 0; G.tick(0.05, 3); });
  await shot('hud-prompt-refused', 200);

  await ev((G) => { G.tpLocal(0, 0, 0); G.tick(0.05, 4); });
  await live(1500);
  await shot('hud-inside-hab');

  // night, a dust storm, running out of air
  await ev((G) => { G.tpLocal(0, 30, 0); G.setLocalTime(23.5); G.tick(0.05, 4); });
  await live(3000);
  await shot('hud-night');
  await ev((G) => { G.setLocalTime(13); G.setStorm(0.95); G.tick(0.05, 4); });
  await live(2500);
  await shot('hud-storm');
  await ev((G) => { G.setStorm(0); G.S.storm.i = 0; G.S.suit = 21; G.tick(0.05, 30); });
  await live(1200);
  await shot('hud-oxygen-low');
  await ev((G) => { G.S.suit = 8; G.S.health = 34; G.tick(0.05, 40); });
  await shot('hud-oxygen-critical');
  await ev((G) => { G.S.suit = 100; G.S.health = 100; G.tick(0.05, 40); });

  // toasts
  await ui((U) => U.toast('ACHIEVEMENT', 'Not Dead Yet', 'Reach the dawn of Sol 2'));
  await shot('hud-toast-achievement', 700);
  await sleep(6200);
  await ui((U) => U.toast('SITE DISCOVERED', 'VIKING 1', 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.'));
  await shot('hud-toast-discovery', 700);
  await sleep(6200);

  // ---------------------------------------------------------------- driving
  await ev((G) => {
    G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 2);
  });
  await shot('hud-rover-prompt', 200);
  await ev((G) => { G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 70); });
  await live(600);
  await shot('hud-driving', 200);
  await ev((G) => { G.input.keys['w'] = false; G.tick(0.05, 90); });
  await shot('hud-rover-parked', 200);
  await ev((G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); });

  // ---------------------------------------------------------------- Pathfinder: the NASA conversation
  await ev((G) => {
    G.S.flags.pfRevealed = true;
    G.roverTo(G.World.pathfinder.position, 8); G.tpNear(G.World.pathfinder.position, 2.5); G.hold(2.8);
    G.roverTo(G.World.uplinkRing.position, 0.5); G.tpNear(G.World.uplink.position, 2.5); G.hold(2.8);
  });
  await shot('comms-first-message', 1600);
  for (let i = 0; i < 3; i++) { await click('.comms-ft button'); await sleep(150); }
  await shot('comms-conversation', 1600);
  for (let i = 0; i < 3; i++) { await click('.comms-ft button'); await sleep(150); }

  // ---------------------------------------------------------------- a run with some history, for the three screens
  await ev((G) => {
    const S = G.S;
    Object.assign(S.inv, { scrap: 9, circuit: 2, regolith: 3, ice: 2, candle: 2, kitBeacon: 1 });
    S.upgrades = { tank1: true, drive1: true };
    S.blueprints.drill = true;
    for (const name of ['Viking 1', 'Opportunity', 'Mars 6', 'Schiaparelli EDM', 'Schiaparelli Crater', 'Gale Crater', 'Melas Chasma', 'Olympus Mons']) S.discovered[name] = true;
    S.salvaged['Mars 6'] = true; S.salvaged['Opportunity'] = true;
    S.quests.oppy = 'done';
    Object.assign(S.achieved, { notdead: true, phone: true });
    Object.assign(S.stats, { walked: 3400, driven: 18200, potatoes: 16, panels: 7, crafted: 4, closeCalls: 2, booms: 2, mined: 3, stormOut: 22, discoveries: 8 });
    S.sol = 12; S.potatoes = 6; S.food = 7; S.suit = 150;
    G.tpLocal(0, 45, 0); G.tick(0.05, 3);
  });
  await key('c');
  if (await visible('.colony .tabs')) await click('.colony [data-tab="inv"]');
  await click('[data-deploy="beacon"]');
  await ev((G) => { G.tick(0.05, 2); G.hold(1.8); G.tpLocal(0, 30, 0); G.tick(0.05, 3); });
  await sleep(3600);
  await ev((G) => { G.tick(0.05, 6); });
  await shot('hud-midgame', 300);

  // map
  await key('m');
  await shot('map-planet');
  await click('.map-tools [data-a="hab"]');
  await sleep(900);
  const box = await page.locator('#mg-mapcanvas').boundingBox();
  await page.mouse.click(box.x + box.width / 2 - 2, box.y + (box.height - 40) / 2);
  await shot('map-zoomed-marker');
  await ev((G) => { G.S.flags.mapRevealed = true; });
  await page.locator('#mg-mapcanvas').focus();
  await key('0');
  await sleep(900);
  await shot('map-survey-revealed');
  await key('Escape');

  // colony
  await ev((G) => { G.tpLocal(-3.4, 3.2); G.tick(0.05, 3); });
  await key('c');
  if (await visible('.colony .tabs')) {
    await click('.colony [data-tab="craft"]'); await shot('colony');
    await click('.colony [data-tab="inv"]'); await shot('colony-inventory', 250);
    await click('.colony [data-tab="build"]'); await shot('colony-upgrades', 250);
    await click('.colony [data-tab="craft"]');
  } else await shot('colony');
  await key('Escape');
  await ev((G) => { G.tpLocal(0, 260, 0); G.tick(0.05, 3); });
  await key('c');
  await shot('colony-out-of-range');
  await key('Escape');

  // journal
  await ev((G) => { G.tpLocal(0, 30, 0); G.tick(0.05, 3); });
  await key('j');
  await shot('journal-tasks');
  for (const [t, name] of [['disc', 'discoveries'], ['ach', 'achievements'], ['stats', 'statistics'], ['log', 'log']]) {
    await click(`.journal [data-tab="${t}"]`);
    await shot('journal-' + name, 250);
  }
  await click('.journal [data-tab="tasks"]');
  await key('Escape');

  // ---------------------------------------------------------------- pause and what hangs off it
  await ev((G) => { G.tick(0.05, 2); });
  if (size.touch) await page.locator('#mg-tPause').tap(); else await key('Escape');
  await shot('pause');
  await click('[data-act="controls"]');
  await shot('pause-controls');
  await key('Escape');
  await click('[data-act="settings"]');
  await shot('pause-settings');
  await key('Escape');
  await click('[data-act="restart"]');
  await shot('pause-restart-confirm');
  await key('Escape');
  await key('Escape');

  // ---------------------------------------------------------------- sleeping through the night
  await ev((G) => { G.setLocalTime(21); G.tpLocal(-5.0, -6.2); G.tick(0.05, 4); });
  if (await ev((G) => G.S.breach.active)) await shot('hud-breach');
  await ev((G) => { G.S.breach.active = false; G.S.breach.done = true; G.syncAllVisuals(); G.tick(0.05, 2); G.hold(1.4); });
  await shot('sleep', 1300);
  await sleep(2600);

  // ---------------------------------------------------------------- death
  await ev((G) => { G.checkpoint(); G.tpLocal(0, 60); G.S.suit = 0; G.S.health = 0.5; G.tick(0.05, 10); });
  await shot('death');
  await click('#mg-panel button >> text=/wake at dawn/i');

  // ---------------------------------------------------------------- launch and rescue
  await ev((G) => {
    G.S.sol = G.S.rescueSol; G.S.flags.mavRevealed = true;
    G.tpNear(G.World.mav.position, 5.5); G.hold(3.2); G.hold(1.8);
  });
  await shot('launch-confirm');
  await click('#mg-panel button >> text=/punch it/i');
  await ev((G) => { G.tick(0.05, 900); });
  await shot('win', 900);

  console.log(`  ${size.name}: ${n} states in ${((Date.now() - t0) / 1000).toFixed(0)} s; console errors: ${g.errors.length}`);
  for (const e of g.errors) errors.push(`${size.name}: ${e}`);
  await g.close();
}

for (const size of SIZES) {
  if (wantSizes && !wantSizes.some((s) => size.name.includes(s))) continue;
  try { await run(size); } catch (e) { errors.push(`${size.name}: ${e.message}`); console.error(`  ${size.name} FAILED: ${e.message}`); }
}
console.log(`${total} screenshots in ${path.join(outDir, 'ui')}`);
if (errors.length) { console.log('ERRORS:\n' + errors.slice(0, 20).join('\n')); process.exit(1); }
process.exit(0);
