// Does the audit still catch what it was taught to catch? The fourth interface review found three screens broken on
// the small phone that the audit of the time had passed: the colony's inventory (rows printed over each other), a
// lander's card (its badge and year over its name) and the rescue screen (the card cut its last line and its button).
// Each is measured here as built, where the audit must find nothing, and again with the old fault put back by a
// style sheet, where it must name it. An audit that goes blind fails here instead of passing everything.
//
//   node tools/tests/ui-audit-selftest.mjs
import { openGame, sleep } from './lib.mjs';
import { auditInPage, auditLines, settledInPage } from './audit-lib.mjs';

const safe = [0, 47, 21, 47];
const g = await openGame({ width: 667, height: 375, touch: true, quality: 'low', query: 'safe=' + safe.join(',') });
const page = g.page, ev = g.eval;
await page.evaluate(() => window.__UI.setSetting('reducedMotion', true));
let failed = 0;
let kinds = /^(over|clipped|outside)/;
const audit = async () => {
  // (two frames first, as the walk waits before it measures: the game marks a list that scrolls on its next frame
  //  or the one after, and on a slow machine that is longer than any fixed wait)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForFunction(settledInPage, null, { timeout: 30000, polling: 100 }).catch(() => {});
  return auditLines(await page.evaluate(auditInPage, safe)).filter((l) => kinds.test(l));
};
/** Measure with a fault put back: a style sheet, or a piece of markup put into the element `into` names. */
const withFault = async (css, html, into) => {
  await page.evaluate(([c, h, sel]) => {
    const s = document.createElement('style'); s.id = 'fault'; s.textContent = c || ''; document.head.appendChild(s);
    if (h) { const t = document.createElement('template'); t.innerHTML = h; const n = t.content.firstElementChild; n.id = 'fault-node'; document.querySelector(sel).appendChild(n); }
  }, [css, html || '', into || '']);
  await sleep(300);
  const r = await audit();
  await page.evaluate(() => { document.getElementById('fault').remove(); const n = document.getElementById('fault-node'); if (n) n.remove(); });
  await sleep(200);
  return r;
};
const check = (name, clean, broken, want) => {
  const caught = broken.filter((l) => want.test(l));
  const ok = clean.length === 0 && caught.length > 0;
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: as built ${clean.length} found; with the fault back ${caught.length} found`);
  for (const l of (ok ? caught.slice(0, 2) : [...clean.map((x) => 'as built: ' + x), ...broken.map((x) => 'fault: ' + x)].slice(0, 10))) console.log('         ' + l.slice(0, 220));
};

await ev(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 30); G.skipIntro(); G.tpLocal(0, 30, 0); G.tick(0.05, 4); });
await ev((G) => {
  const S = G.S;
  Object.assign(S.inv, { scrap: 9, circuit: 2, regolith: 3, ice: 2, candle: 2, kitBeacon: 1 });
  S.upgrades = { tank1: true, drive1: true }; S.blueprints.drill = true;
  for (const name of ['Viking 1', 'Opportunity', 'Mars 6', 'Schiaparelli EDM', 'Schiaparelli Crater', 'Gale Crater', 'Melas Chasma', 'Olympus Mons']) S.discovered[name] = true;
  S.salvaged['Mars 6'] = true; S.salvaged['Opportunity'] = true; S.quests.oppy = 'done';
  Object.assign(S.stats, { walked: 3400, driven: 18200, potatoes: 16, panels: 7, crafted: 4, closeCalls: 2, booms: 2, mined: 3, stormOut: 22, discoveries: 8 });
  S.sol = 12; S.potatoes = 6; S.food = 7;
  G.farm.farm();
  S.pantry = { radish: 3, lettuce: 0, soy: 4, tomato: 2 }; S.seeds = { radish: 1, lettuce: 2, soy: 2, tomato: 1 }; S.stats.produce = 9; S.morale = 71;
  S.machines = { oxygenator: 88, reclaimer: 54, rover: 31, suit: 12 };
  G.tpLocal(-3.4, 3.2); G.tick(0.05, 3);
});

// The fifth review measured four things the audit of the time had passed: slider handles 44 by 32 px and switches 56 by
// 32 in Settings, a help mark 18 px across that was the only sign its panel could be pressed, and labels in capitals
// at 11 px (9 px to the eye).
kinds = /^(target|text)/;
await page.evaluate(() => window.__UI.showSettings(() => window.__UI.hideOverlay(), false));
await page.locator('[data-seg="settab"] [data-v="sound"]').click();
await sleep(300);
check('a slider handle shorter than a thumb', await audit(), await withFault('.mg-touch .mg-range::-webkit-slider-thumb { height: 2rem !important; }'), /^target: 44x[23]\d  the handle/);
await page.locator('[data-seg="settab"] [data-v="interface"]').click();
await sleep(300);
check('a switch shorter than a thumb', await audit(), await withFault('.mg-touch .mg-switch { width: 3.5rem !important; height: 2rem !important; }'), /^target: .*the switch itself/);
await page.locator('[data-seg="settab"] [data-v="graphics"]').click();
await page.evaluate(() => window.__UI.hideOverlay());
await sleep(300);
check('a mark drawn as a button, 18 px across', await audit(),
  await withFault('', '<span style="display:grid;place-items:center;width:17px;height:17px;border:1px solid rgba(245,240,232,.58);border-radius:50%;font:600 11px/1 sans-serif">?</span>', '#mg-vitals .suit'), /^target: 1\dx1\d  drawn as a button/);
check('a label in capitals at 11 px', await audit(), await withFault('.mg-compact .suit .cap { font-size: 11px !important; }'), /^text: capitals at 11/);
kinds = /^(over|clipped|outside)/;

// the colony's inventory: rows that do not grow with their text
await page.keyboard.press('c');
await page.locator('.colony [data-tab="inv"]').click();
await sleep(400);
// (the rows' notes are shorter than they were when this fault was found, so with it back a note now hangs out of its
//  row's foot without reaching the next row's text: the audit names that as text outside its row)
check('inventory rows that do not grow with their text', await audit(), await withFault('.pane.on, .mg-compact .pane.on { grid-auto-rows: auto !important; }'), /^(over: |clipped: outside its .*inv-row)/);
await page.keyboard.press('Escape');

// a lander's card: badges that do not give way to the name
await page.keyboard.press('j');
await page.locator('.journal [data-tab="disc"]').click();
await sleep(400);
check('a badge and a year printed over a name', await audit(),
  await withFault('.card-hd { flex-wrap: nowrap !important; padding-left: 0 !important; } .card-hd > .ic { position: static !important; flex: none; } .card h4 { flex: 1 1 0 !important; min-width: 0 !important; }' +
    ' .card h4 .nm { display: inline !important; } .card-hd .tags { flex-wrap: nowrap !important; flex: none !important; margin-left: -6rem; }'), /^over: /);
await page.keyboard.press('Escape');

// the rescue screen: a card shorter than what it holds
await ev((G) => { G.tpLocal(0, 30, 0); G.S.sol = G.S.rescueSol; G.S.flags.mavRevealed = true; G.tpNear(G.World.mav.position, 5.5); G.hold(3.2); G.hold(1.8); });
await sleep(500);
await page.locator('#mg-panel button >> text=/punch it/i').click();
await ev((G) => { G.tick(0.05, 900); });
await sleep(900);
check('a card that cuts its own last line and button', await audit(), await withFault('.dlg { max-height: 300px !important; } .dlg-bd { overflow: visible !important; flex: none !important; }'), /^(clipped|outside): /);

if (g.errors.length) { failed++; console.log('  console errors: ' + JSON.stringify(g.errors.slice(0, 4))); }
await g.close();
console.log(failed ? `\n${failed} failed` : '\nThe audit catches all seven.');
process.exit(failed ? 1 : 0);
