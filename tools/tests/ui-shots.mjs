// Screenshots of every interface state at every supported size, for looking at.
//
//   node tools/tests/ui-shots.mjs                         every size, every state
//   node tools/tests/ui-shots.mjs --size=1280x720         one size (comma-separated list; matches by substring)
//   node tools/tests/ui-shots.mjs --only=hud,map          only states whose name contains one of these
//   node tools/tests/ui-shots.mjs --only=the-numbers --stop   take that one picture again and end the walk there
//   node tools/tests/ui-shots.mjs --still                 with the game's reduced-motion setting on, as the audit walks
//
// Images land in tools/tests/.cache/ui/<size>/NN-<state>.png. The script drives the real game
// through its debug hooks (window.__MG for the game, window.__UI for menus) in headless
// Chromium with software WebGL, so it is slow: about two minutes a size. It exits non-zero
// if the page logged a console error.
//
// The walk through the states is exported: tests/ui-audit.mjs takes the same walk and measures each state in
// the page instead of photographing it, so every picture a reviewer is shown is a state the audit has measured.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, rm } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';
import { settledInPage } from './audit-lib.mjs';

export const SIZES = [
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
const STOP = 'every state asked for has been taken';
const errors = [];
let total = 0;

/**
 * Walk the interface through its states at one size.
 * @param {object} size  one of SIZES
 * @param {object} [o]
 * @param {boolean} [o.shoot]          photograph each state (default true)
 * @param {string[]|null} [o.only]     only states whose name contains one of these
 * @param {boolean} [o.reducedMotion]  turn the game's reduced-motion setting on first (a measurement wants things at rest)
 * @param {(label: string, page: object) => Promise<void>} [o.onState]  called at each state, once it is on the screen
 */
export async function walk(size, o = {}) {
  const shoot = o.shoot !== false, only = o.only || null;
  const t0 = Date.now();
  const g = await openGame({ width: size.w, height: size.h, touch: size.touch, quality: 'low', query: size.safe ? 'safe=' + size.safe : '' });
  const dir = path.join(outDir, 'ui', size.name);
  if (shoot) {
    if (!only) await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
  }
  const page = g.page;
  if (o.reducedMotion) await page.evaluate(() => window.__UI.setSetting('reducedMotion', true));
  let n = 0, taken = 0;
  /** `sub` (a letter) files the picture beside the previous one, as 05b-..., without taking a number: the numbers stay the same at every size. */
  const shot = async (name, wait = 500, sub = '') => {
    if (!sub) n++;
    await sleep(wait);                                              // waited even when the state is filtered out: later steps rely on the timing
    if (only && !only.some((x) => name.includes(x))) return;
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    // (a picture is of a state at rest: with software rendering a card's quarter-second arrival can still be half-way
    //  a second later, and a reviewer was shown a dialog mid-fade and asked whether the fade was really that slow)
    await page.waitForFunction(settledInPage, null, { timeout: 15000, polling: 100 }).catch(() => {});
    const label = `${String(n).padStart(2, '0')}${sub}-${name}`;
    if (shoot) { await page.screenshot({ path: path.join(dir, label + '.png'), timeout: 120000 }); total++; }
    if (o.onState) await o.onState(label, page);
    // (--stop: the walk ends once each state asked for with --only has been taken, for taking one picture again)
    if (only && o.stop && ++taken >= only.length) { await g.close(); throw new Error(STOP); }
  };
  /** Wait until no toast is showing or queued, so the next one fired is the one photographed. */
  const toastsDone = () => page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 30000 }).catch(() => {});
  const ev = g.eval;
  const ui = (fn, a) => page.evaluate(`(${fn.toString()})(window.__UI, window.__MG, ${JSON.stringify(a === undefined ? null : a)})`);
  const click = (sel, opts) => page.locator(sel).first().click({ timeout: 60000, ...opts });      // (a dialog still rising at one frame a second is not "stable" for a long while)
  const key = (k) => page.keyboard.press(k);
  const visible = (sel) => page.locator(sel).first().isVisible();
  /** Let the game run in real time for a moment (the renderer's exposure only adapts while it runs). */
  const live = async (ms) => { await ev((G) => { G.paused = false; }); await sleep(ms); await ev((G) => { G.paused = true; }); };

  // big windows: software WebGL is very slow there, so draw the 3D picture at low resolution (the interface is unaffected)
  if (size.w >= 1900) await ev((G) => { G.ctx.engine.q = { ...G.ctx.engine.q, scale: 0.3 }; G.ctx.engine.resize(); }).catch(() => {});

  // ---------------------------------------------------------------- portrait: the game asks for landscape
  if (size.portrait) {
    await shot('rotate-title', 1800);
    const errs = g.errors.slice();
    await g.close();
    return { states: n, seconds: ((Date.now() - t0) / 1000).toFixed(0), errors: errs };
  }

  // ---------------------------------------------------------------- menus before the game
  await shot('title', 2200);
  // (the saved run on this made-up title is the run the rest of the pictures play: the same site, so the same region's name)
  const fakeTitle = (U, G, o) => U.showTitle({ saved: o.saved && { ...o.saved, region: U.regionAt(2.0, 303.7) }, unreadable: o.unreadable, onContinue() {}, onNewGame() {} });
  await ui(fakeTitle, { saved: { sol: 12, diffName: 'ENGINEER' }, unreadable: false });
  await shot('title-continue');
  await ui(fakeTitle, { saved: null, unreadable: true });
  await shot('title-unreadable-save');
  await ui(fakeTitle, { saved: { sol: 12, diffName: 'ENGINEER' }, unreadable: false });
  await click('[data-act="new"]');
  await shot('newgame');
  await key('Escape');
  await click('[data-act="settings"]');
  await shot('settings');
  // on a phone the four groups are tabs: one picture of each
  if (await visible('[data-seg="settab"]')) {
    for (const [t, s] of [['controls', 'b'], ['sound', 'c'], ['interface', 'd']]) { await click(`[data-seg="settab"] [data-v="${t}"]`); await shot('settings-' + t, 250, s); }
    await click('[data-seg="settab"] [data-v="graphics"]');
  }
  await key('Escape');
  await click('[data-act="credits"]');
  await shot('credits');
  await key('Escape');
  await ui((U) => U.showLoading(0.62, 'Building terrain'));
  await shot('loading');

  // ---------------------------------------------------------------- the first minute: suit leaking
  await ev(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 30); });
  await shot('hud-coldopen', 2200);
  // (the opening as a new player meets it: the door, the moment the suit is sealed, the bars arriving, the numbers)
  await ev((G) => { G.tpLocal(0, 10.0, 0); G.tick(0.05, 6); });
  await shot('hud-airlock', 400, 'b');
  await ev((G) => { G.hold(2.6); G.tick(0.05, 24); });
  await shot('hud-suit-sealed', 300, 'c');
  // (the first bar arrives with the machine it measures, lit while the card that names it is up)
  // (its card is held up for the picture: this machine can take longer over one picture than a card lives)
  await ui((U) => U.holdCards(true));
  await ev((G) => { G.tpLocal(4.0, -3.0); G.tick(0.05, 6); G.hold(1.0); G.tick(0.05, 4); });
  await shot('hud-bars-arrive', 200, 'd');
  await ui((U) => U.holdCards(false));
  await toastsDone();
  await ev((G) => { G.tpLocal(4.3, -0.4); G.tick(0.05, 6); G.hold(1.0); G.tick(0.05, 4); });
  await toastsDone();
  await ev((G) => { G.tpLocal(0, -5.0); G.tick(0.05, 6); });
  await shot('hud-comms-desk', 300, 'e');
  await ev((G) => { G.hold(1.1); });
  await shot('the-numbers', 600, 'f');
  await ev(() => { const b = document.querySelector('#mg-panel .btns button'); if (b) b.click(); });
  // (a new button, lit while its card is up: the Journal, which comes with the numbers after the FOOD bar's card)
  await ev((G) => { G.tick(0.05, 4); });
  await page.waitForFunction(() => /journal/i.test((document.querySelector('#mg-toast .toast') || { textContent: '' }).textContent), null, { timeout: 40000 }).catch(() => {});
  await ui((U) => U.holdCards(true));
  await shot('hud-new-button', 300, 'g');
  await ui((U) => U.holdCards(false));
  await toastsDone();

  // ---------------------------------------------------------------- on foot by day
  await ev((G) => { G.skipIntro(); G.tpLocal(0, 30, 0); G.tick(0.05, 4); });
  await ui((U) => {
    U.log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.');
    U.log('Hab power low. Life support idles at zero. Wipe the panels.', 'alarm');
    U.log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa');
  });
  await sleep(5200);                                              // (past the moment the skipped intro's last objective stays ticked on the list)
  await ev((G) => { G.tick(0.05, 8); });
  await shot('hud-day', 300);
  // (and a quarter of a minute on, with nothing new to say: the task card closed to its title and its place, the name
  //  of the region gone, the log's line faded; the pictures above and below are all of first moments)
  await sleep(9500);
  await ev((G) => { G.tick(0.05, 300); });
  await shot('hud-day-settled', 1500, 'b');
  await ev((G) => { G.tpLocal(0, 30, 0); G.tick(0.05, 4); });

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
  await shot('hud-prompt-refused', 900);                           // (long enough for the button to finish fading back from lit)

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
  // (only the air is forced low here: forcing the vitals down too showed them "rising" beside a critical tank)
  await ev((G) => { G.S.suit = 8; G.tick(0.05, 40); });
  await shot('hud-oxygen-critical');
  // two gauges low, in the ordinary colours and then in the colour-blind-safe ones
  await ev((G) => { G.S.water = 9; G.S.power = 18; G.tick(0.05, 3); });
  await shot('hud-gauges-low', 300, 'b');
  await ui((U, G) => { U.setSetting('colorBlind', true); G.tick(0.05, 3); });
  await shot('hud-colour-blind-safe', 300);
  // (the two gauges are put back by hand, which the game takes for a refill and marks with an up arrow for five
  //  seconds, as it should: those seconds are let pass, or the next picture showed power "rising" in a dust storm)
  await ui((U, G) => { U.setSetting('colorBlind', false); G.S.water = 42; G.S.power = 72; G.tick(0.05, 120); });
  // the most the HUD ever carries: two banners, a toast, a long line in the log and a critical tank
  await ev((G) => { window.__keep = JSON.stringify(G.S.breach); G.setStorm(0.9); G.S.suit = 9; G.S.breach.active = true; G.tick(0.05, 6); });
  await toastsDone();
  await ui((U) => { U.log('Hab power low. Life support idles at zero. Wipe the panels.', 'alarm'); U.toast('WARNING', 'Storm cell overhead', 'Visibility is down to a few metres. Keep the Hab in sight.'); });
  await sleep(900);
  await ev((G) => { G.tick(0.05, 4); });                          // (the game is stopped here: a step, so the marker has seen the toast)
  await shot('hud-everything-at-once', 300, 'b');
  await ev((G) => { Object.assign(G.S.breach, JSON.parse(window.__keep)); G.setStorm(0); G.S.storm.i = 0; G.tick(0.05, 6); });
  await ev((G) => { G.S.suit = 100; G.S.health = 100; G.tick(0.05, 40); });

  // toasts (each fired once nothing else is showing or queued: fired blind, it was photographed one picture late,
  // and the made-up achievement was one that cannot be earned on Sol 1)
  await toastsDone();
  await ui((U) => U.toast('ACHIEVEMENT', 'Storm Rider', 'Spend 60 seconds outside in a dust storm'));
  await shot('hud-toast-achievement', 700);
  await toastsDone();
  await ui((U) => U.toast('SITE DISCOVERED', 'VIKING 1', 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.'));
  await shot('hud-toast-discovery', 700);
  await toastsDone();

  // ---------------------------------------------------------------- driving
  await ev((G) => {
    G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 2);
  });
  await shot('hud-rover-prompt', 200);
  await ev((G) => { G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 70); });
  await live(600);
  await shot('hud-driving', 200);
  // (parked means stopped: left to coast, it was photographed "parked" at 56 km/h)
  await ev((G) => { G.input.keys['w'] = false; G.tick(0.05, 30); G.roverF.speed = 0; G.tick(0.05, 6); });
  await shot('hud-rover-parked', 200);
  await ev((G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); });

  // ---------------------------------------------------------------- Pathfinder: the NASA conversation
  // (the run is on Sol 12 from here on, as the later pictures say: set afterwards, the conversation spoke of "24 more sols")
  await ev((G) => {
    G.S.sol = 12; G.S.achieved.notdead = true;
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
    // (the larder is set here, with the rest of the run, before the first picture that shows FOOD: set later, the
    //  HUD's figure in one picture was 13 and the inventory in another listed 22)
    G.farm.farm();
    S.pantry = { radish: 3, lettuce: 0, soy: 4, tomato: 2 }; S.seeds = { radish: 1, lettuce: 2, soy: 2, tomato: 1 }; S.stats.produce = 9; S.stats.grown = { potato: 16, radish: 3, soy: 4, tomato: 2 };
    G.tpLocal(0, 45, 0); G.tick(0.05, 3);
  });
  await key('c');
  if (await visible('.colony .tabs')) await click('.colony [data-tab="inv"]');
  await click('.pane.on [data-deploy="beacon"]');
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
  await click('.map-tools [data-a="legend"]');
  await shot('map-key', 300, 'b');
  await click('.map-tools [data-a="legend"]');
  await ev((G) => { G.S.flags.mapRevealed = true; });
  await page.locator('#mg-mapcanvas').focus();
  await key('0');
  await sleep(900);
  await shot('map-survey-revealed');
  await key('Escape');

  // colony
  await ev((G) => {
    // a mid-game larder, catalogue and home, so the newer pages have something to show
    const S = G.S; G.farm.farm();
    S.morale = 71;
    if (!S.science) G.science.scienceSummary();
    Object.assign(S.science, { found: { basalt: 2, dust: 1, hematite: 1, sulfate: 1 }, points: 52, serial: 5 });
    S.machines = { oxygenator: 88, reclaimer: 54, rover: 31, suit: 12 };
    S.mail = { ...(S.mail || {}), lewis: 1 }; S.comforts = { lights: true, greg: true }; S.inv.scrap = Math.max(S.inv.scrap, 3);
    G.tpLocal(-3.4, 3.2); G.tick(0.05, 3);
  });
  await key('c');
  if (await visible('.colony .tabs')) {
    await click('.colony [data-tab="craft"]'); await shot('colony');
    await click('.colony [data-tab="inv"]'); await shot('colony-inventory', 250);
    await click('.colony [data-tab="build"]'); await shot('colony-upgrades', 250);
    await click('.colony [data-tab="home"]'); await shot('colony-home', 250);
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
  // (This run was put together in a minute: it went from Sol 1 to Sol 12 in one step, so every entry since was made
  //  "on Sol 12", and so was every step of the mission the game then saw done. A run really played has them spread
  //  over its sols: they are spread here, as the larder and the catalogue are staged above.)
  await ui((U, G) => {
    const n = U.logHistory.length;
    U.logHistory.forEach((l, i) => { l.sol = Math.max(1, Math.min(12, Math.round(1 + 11 * Math.pow(i / Math.max(1, n - 1), 1.6)))); });
    G.S.stats.marks = { ...(G.S.stats.marks || {}), reach: 1, systems: 1, math: 1, farm: 1, hydra: 2, panels: 3, harvest: 4, dinner: 6, pf: 9 };
    // (a run whose timeline has a dinner in it has cooked one: the win sheet's count is read from here)
    G.S.diet = { ...(G.S.diet || {}), meals: Math.max(3, (G.S.diet && G.S.diet.meals) || 0) };
  });
  for (const [t, name] of [['disc', 'discoveries'], ['samples', 'samples'], ['ach', 'achievements'], ['stats', 'statistics'], ['log', 'log']]) {
    await click(`.journal [data-tab="${t}"]`);
    await shot('journal-' + name, 250);
  }
  await click('.journal [data-tab="tasks"]');
  await key('Escape');

  // ---------------------------------------------------------------- the farm's seed chooser, and photo mode
  await ev((G) => { G.World.plots[0].state = 'soil'; G.syncAllVisuals(); G.tpLocal(-6.7, -3.2); G.tick(0.05, 6); G.hold(1.6); });
  await shot('farm-chooser', 400);
  await ev(() => { const b = document.querySelector('#mg-panel [data-act="cancel"]'); if (b) b.click(); });
  await ev((G) => { G.tpLocal(8, 30, 0); G.tick(0.05, 6); G.photoMode.enterPhoto(); });
  await shot('photo-mode', 600);
  await ev((G) => { G.photoMode.exitPhoto(); });

  // ---------------------------------------------------------------- pause and what hangs off it
  await ev((G) => { G.tick(0.05, 2); });
  if (size.touch) await page.locator('#mg-tPause').tap(); else await key('Escape');
  await shot('pause');
  await click('[data-act="bars"]');
  await shot('pause-bars-guide', 300, 'b');
  await key('Escape');
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
  await ev((G) => { G.S.breach.active = false; G.S.breach.done = true; G.syncAllVisuals(); G.tick(0.05, 4); });
  await shot('hud-bunk-at-night', 300, 'b');
  await ev((G) => { G.hold(1.4); });
  await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 60000 });
  await shot('sleep', 1300);
  await ev(() => { const b = document.querySelector('#mg-panel .sleep .wake'); if (b) b.click(); });
  await sleep(500);

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

  const took = ((Date.now() - t0) / 1000).toFixed(0);
  const found = g.errors.slice();
  await g.close();
  return { states: n, seconds: took, errors: found };
}

// run as a script: photograph
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const wantSizes = arg('size'), only = arg('only');
  for (const size of SIZES) {
    if (wantSizes && !wantSizes.some((s) => size.name.includes(s))) continue;
    try {
      const r = await walk(size, { only, stop: process.argv.includes('--stop'), reducedMotion: process.argv.includes('--still') });
      console.log(`  ${size.name}: ${r.states} states in ${r.seconds} s; console errors: ${r.errors.length}`);
      for (const e of r.errors) errors.push(`${size.name}: ${e}`);
    } catch (e) { if (e.message === STOP) { console.log(`  ${size.name}: taken`); continue; } errors.push(`${size.name}: ${e.message}`); console.error(`  ${size.name} FAILED: ${e.message}`); }
  }
  console.log(`${total} screenshots in ${path.join(outDir, 'ui')}`);
  if (errors.length) { console.log('ERRORS:\n' + errors.slice(0, 20).join('\n')); process.exit(1); }
  process.exit(0);
}
