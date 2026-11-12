// Phone legibility audit: walks the interface's states at phone sizes and measures, in the page, what a
// screenshot review otherwise estimates by eye: text set under 11 px, touch targets under 44 px, controls
// outside the safe area or cut by the edge of a row, and text cut off by its box.
//
//   node tools/tests/ui-audit.mjs                     both phones
//   node tools/tests/ui-audit.mjs --size=667          one size (matches by substring)
//   node tools/tests/ui-audit.mjs --verbose           name every state as it is measured, with what the dialog layer holds
//
// Exits non-zero if anything is found. (The map's own labels are drawn on a canvas and are not measured here.)
import { openGame, sleep } from './lib.mjs';
import { auditInPage, auditLines } from './audit-lib.mjs';

const SIZES = [
  { name: 'phone-844x390', w: 844, h: 390, safe: [0, 47, 21, 47] },
  { name: 'phone-667x375', w: 667, h: 375, safe: [0, 47, 21, 47] },
];
const want = (process.argv.find((a) => a.startsWith('--size=')) || '').slice(7);
const verbose = process.argv.includes('--verbose');
let bad = 0, states = 0;

for (const size of SIZES) {
  if (want && !size.name.includes(want)) continue;
  const g = await openGame({ width: size.w, height: size.h, touch: true, quality: 'low', query: 'safe=' + size.safe.join(',') });
  const page = g.page, ev = g.eval;
  const ui = (fn, a) => page.evaluate(`(${fn.toString()})(window.__UI, window.__MG, ${JSON.stringify(a === undefined ? null : a)})`);
  const tap = (sel) => page.locator(sel).first().tap({ timeout: 20000 });
  const check = async (state, wait = 350) => {
    await sleep(wait);
    const a = await page.evaluate(auditInPage, size.safe);
    const lines = auditLines(a);
    states++;
    if (verbose) console.log(`    ${state}: ${lines.length} found; dialog: ${await page.evaluate(() => { const o = document.getElementById('mg-overlay'); return o.style.display === 'flex' ? (document.querySelector('#mg-panel h1') || { textContent: o.className }).textContent : '(none)'; })}`);
    if (lines.length) { bad += lines.length; console.log(`  ${size.name} / ${state}:`); for (const l of [...new Set(lines)]) console.log('      ' + l); }
  };
  console.log(`${size.name} (root font ${await page.evaluate(() => document.documentElement.style.fontSize)})`);
  await page.evaluate(() => window.__UI.setSetting('reducedMotion', true));

  // ---- before the game
  await sleep(1200);
  await check('title');
  await ui((U) => U.showTitle({ saved: { sol: 12, diffName: 'ENGINEER', region: U.regionAt(2.0, 303.7) }, unreadable: true, onContinue() {}, onNewGame() {} }));
  await check('title with a save and a warning');
  await tap('[data-act="new"]');
  await check('new game');
  await page.keyboard.press('Escape');
  await tap('[data-act="settings"]');
  for (const t of ['graphics', 'controls', 'sound', 'interface']) { await tap(`[data-seg="settab"] [data-v="${t}"]`); await check('settings: ' + t, 150); }
  await page.keyboard.press('Escape');
  await tap('[data-act="credits"]');
  await check('credits');
  await page.keyboard.press('Escape');

  // ---- the first minute, then a day on foot with everything on screen
  await ev(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 30); });
  await check('cold open', 900);
  // the premise card, as a new player meets it at the comms desk
  await ev((G) => { G.tpLocal(0, 10.0, 0); G.tick(0.05, 6); G.hold(2.6); G.S.checkedSystems = { oxy: true, rec: true }; G.tpLocal(0, -5.0); G.tick(0.05, 6); G.hold(1.1); });
  await check('the numbers', 500);
  await ev(() => { const b = document.querySelector('#mg-panel .btns button'); if (b) b.click(); });
  await ev((G) => { G.skipIntro(); G.S.inv.candle = 2; G.tpLocal(0, 30, 0); G.tick(0.05, 6); });
  await ui((U) => { U.log('Hab battery low. Life support idles at zero. Wipe the panels.', 'sys'); });
  await check('on foot', 900);
  await ev((G) => { G.setStorm(0.9); G.S.suit = 9; G.S.breach.active = true; G.tick(0.05, 6); });
  await ui((U) => U.toast('WARNING', 'Storm cell overhead', 'Visibility is down to a few metres. Keep the Hab in sight.'));
  await check('two banners and a toast', 900);
  await ev((G) => { G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; G.S.breach.active = false; G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 6); });
  await check('at the rover');
  await ev((G) => { G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 40); G.input.keys['w'] = false; G.tick(0.05, 6); });
  await check('driving');
  await ev((G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 3); });

  // ---- a run with some history, for the three screens
  await ev((G) => {
    const S = G.S;
    Object.assign(S.inv, { scrap: 9, circuit: 2, regolith: 3, ice: 2, candle: 2, kitBeacon: 1 });
    S.upgrades = { tank1: true, drive1: true };
    for (const n of ['Viking 1', 'Opportunity', 'Mars 6', 'Gale Crater', 'Olympus Mons']) S.discovered[n] = true;
    S.salvaged['Mars 6'] = true; S.flags.pfRevealed = true; S.pf.connected = true;
    S.quests = { viking1: 'active', spirit: 'active', oppy: 'done' };
    Object.assign(S.achieved, { notdead: true });
    Object.assign(S.stats, { walked: 3400, driven: 18200, potatoes: 16, panels: 7, crafted: 4, discoveries: 5, produce: 9 });
    G.farm.farm(); S.pantry = { radish: 3, lettuce: 0, soy: 4, tomato: 2 }; S.seeds = { radish: 1, lettuce: 2, soy: 2, tomato: 1 };
    if (!S.science) G.science.scienceSummary();
    Object.assign(S.science, { found: { basalt: 2, dust: 1 }, points: 20, serial: 3 });
    S.sol = 6; G.tpLocal(-3.4, 3.2); G.tick(0.05, 3);
  });
  await tap('#mg-trow [data-t="map"]');
  await check('map', 600);
  await tap('.map-tools [data-a="hab"]');
  await sleep(900);
  const box = await page.locator('#mg-mapcanvas').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + (box.height - 40) / 2);
  await check('map: a marker chosen');
  await tap('.map-tools [data-a="legend"]');
  await check('map: the key');
  await tap('#mg-map .scr-nav [data-screen="colony"]');
  for (const t of ['craft', 'inv', 'build', 'home']) { await tap(`.colony [data-tab="${t}"]`); await check('colony: ' + t, 150); }
  await tap('#mg-colony .scr-nav [data-screen="journal"]');
  for (const t of ['tasks', 'disc', 'samples', 'ach', 'stats', 'log']) { await tap(`.journal [data-tab="${t}"]`); await check('journal: ' + t, 150); }
  await tap('#mg-journal .close');

  // ---- dialogs in play
  await ev((G) => { G.World.plots[0].state = 'soil'; G.syncAllVisuals(); G.tpLocal(-6.7, -3.2); G.tick(0.05, 6); G.hold(1.6); });
  await check('what to plant');
  await ev(() => { const b = document.querySelector('#mg-panel [data-act="cancel"]'); if (b) b.click(); });
  await ev((G) => { G.tick(0.05, 2); });
  await tap('#mg-tPause');
  await check('pause');
  await tap('[data-act="bars"]');
  await check('what the bars mean');
  await page.keyboard.press('Escape');
  await tap('[data-act="controls"]');
  await check('controls');
  await page.keyboard.press('Escape');
  await tap('[data-act="restart"]');
  await check('restart?');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await ui((U) => U.showComms({ title: 'Pathfinder uplink', subtitle: 'Signal delay: 11 minutes', lines: [['n', 'MARK? MARK, IS THAT YOU? This is Houston.'], ['w', 'Alive and well. Ish.']], index: 1, onNext() { U.hideOverlay(); } }));
  await check('the uplink');
  await ui((U) => U.hideOverlay());
  await ev((G) => { G.S.breach.done = true; G.setLocalTime(21); G.tpLocal(-5.0, -6.2); G.tick(0.05, 4); });
  await check('night, at the bunk');
  await ev((G) => { G.hold(1.4); });
  await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 30000 });
  await check('the night\'s account');
  await ev(() => { const b = document.querySelector('#mg-panel .sleep .wake'); if (b) b.click(); });
  await sleep(300);
  await ev((G) => { G.checkpoint(); G.tpLocal(0, 60); G.S.suit = 0; G.S.health = 0.5; G.tick(0.05, 10); });
  await check('death');
  await ev(() => { const b = [...document.querySelectorAll('#mg-panel button')].find((x) => /wake at dawn/i.test(x.textContent)); if (b) b.click(); });
  await ev((G) => { G.S.sol = G.S.rescueSol; G.S.flags.mavRevealed = true; G.tpNear(G.World.mav.position, 5.5); G.hold(3.2); G.hold(1.8); });
  await check('launch?');
  await ev(() => { const b = [...document.querySelectorAll('#mg-panel button')].find((x) => /punch it/i.test(x.textContent)); if (b) b.click(); });
  await ev((G) => { G.tick(0.05, 900); });
  await check('rescued', 700);
  if (g.errors.length) { bad += g.errors.length; console.log('  console errors: ' + JSON.stringify(g.errors.slice(0, 4))); }
  await g.close();
}
console.log(`\n${states} states audited; ${bad} thing${bad === 1 ? '' : 's'} found`);
process.exit(bad ? 1 : 0);
