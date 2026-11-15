// How much of a phone's screen the HUD stands on when nothing is wrong.
//
// The quiet HUD (ui/hud.js, css/hud.css) is held to a bar: standing in the open, walking, standing at the rover with
// its button up, and driving, it covers no more than 15% of the screen, none of the middle of it (the middle two
// fifths across by the middle half down), and no more than 35% of its top third. Measured in the page (audit-lib.mjs,
// coverInPage) at three phones held sideways: the two the interface audit walks, and the owner's (932 x 430 with the
// island's margins). The smallest of them has 16%: it has a third less screen than the owner's for controls that
// are the same size under a thumb. The other states are measured and printed for the record, with no bar: the
// gauges opened by a tap, the task opened by a tap, an emergency, and the full HUD (the setting), which is what all
// of this replaced. The three emergencies are checked for what leads: one banner (the tank before the water, the
// breach before either), the rest as marks that stand clear of the task card, and one task on the card.
//
//   node tools/tests/hud-cover.mjs                  three phones; exits non-zero past the bar
//   node tools/tests/hud-cover.mjs --size=844       one size (matches by substring)
//   node tools/tests/hud-cover.mjs --shoot          photograph each state too, at 2x, into .cache/hud/<size>/
import path from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';
import { coverInPage, settledInPage } from './audit-lib.mjs';

export const PHONES = [
  { name: 'phone-844x390', w: 844, h: 390, safe: '0,47,21,47' },
  { name: 'phone-667x375', w: 667, h: 375, safe: '0,47,21,47', all: 0.16 },
  { name: 'phone-932x430', w: 932, h: 430, safe: '0,59,21,59' },
];
/** The bar, as shares of the screen. */
// (the middle: to within a thousandth. On the smallest phone the rim of JUMP, and of EXIT in its place, touches the
//  corner of the middle by one 2 px cell.)
export const BAR = { all: 0.15, middle: 0.001, top: 0.35 };
const pct = (v) => (v * 100).toFixed(1) + '%';
/** What must lead in each emergency: the tank before the water, the breach before either. */
const LEADS = { 'foot-low': /suit/i, 'foot-many-wrong': /suit/i, 'hab-breach': /breach/i };

/**
 * Take one phone through the states and measure each.
 * @returns {{ rows: { state: string, held: boolean, all: number, middle: number, top: number, parts: [string, number][] }[], errors: string[] }}
 */
export async function measure(size, o = {}) {
  const g = await openGame({ width: size.w, height: size.h, touch: true, quality: 'low', dsf: o.shoot ? 2 : 1, query: 'safe=' + size.safe });
  const page = g.page, ev = g.eval;
  const dir = path.join(outDir, 'hud', size.name);
  if (o.shoot) { await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true }); }
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const rows = [];
  let n = 0;
  const take = async (state, held) => {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForFunction(settledInPage, null, { timeout: 15000, polling: 100 }).catch(() => {});
    const c = await page.evaluate(coverInPage);
    // what leads, and what waits behind it: the banners' words, the marks, and the task card's lines that show
    const lead = await page.evaluate(() => ({
      banners: [...document.querySelectorAll('#mg-alerts .alert')].map((n) => n.textContent),
      marks: document.querySelectorAll('#mg-alerts .mark').length,
      tasks: [...document.querySelectorAll('#mg-objectives .obj')].filter((n) => n.getClientRects().length > 0).length,
      // (a mark must stand clear of the task card: on the small phone the second one stood under it)
      under: [...document.querySelectorAll('#mg-alerts .mark')].filter((m) => { const a = m.getBoundingClientRect(), t = document.querySelector('#mg-tr'), b = t && t.getBoundingClientRect(); return b && a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom; }).length,
    }));
    rows.push({ state, held, lead, ...c });
    if (o.shoot) await page.screenshot({ path: path.join(dir, `${String(++n).padStart(2, '0')}-${state}.png`), timeout: 120000 });
  };
  const quiet = () => page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 40000 }).catch(() => {});
  /** Let the HUD come to rest: cards gone, the log's line faded, the task card shut, the bars that showed a change put away. */
  const rest = async () => { await quiet(); await sleep(1500); await ev((G) => { G.tick(0.05, 320); }); await quiet(); await sleep(11000); await ev((G) => { G.setStorm(0); G.S.storm.i = 0; G.setLocalTime(13); G.tick(0.05, 40); }); };

  // a run a few sols in, by day, with everything met and nothing wrong
  await ev(async (G) => {
    await G.start(2.0, 303.7); G.paused = true; G.skipIntro();
    G.S.sol = 5; G.S.suit = G.suitCap ? G.suitCap() : 100; G.S.o2 = 96; G.S.water = 90; G.S.power = 88; G.S.health = 100; G.S.morale = 72;
    G.setStorm(0); G.S.storm.i = 0; G.setLocalTime(13); G.tpLocal(6, 34, 0.4); G.tick(0.05, 10);
  });
  await rest();
  await take('foot-standing', true);

  // walking: a thumb on the stick, pushed forward (in the open, away from the heap and the Hab: nothing in reach)
  await ev((G) => { G.tpLocal(10, 60, 3.4); G.tick(0.05, 10); });
  await rest();
  const jx = Math.round(+size.safe.split(',')[3] + 70), jy = size.h - 80;
  await touch('touchStart', [{ x: jx, y: jy, id: 1 }]);
  await touch('touchMove', [{ x: jx, y: jy - 40, id: 1 }]);
  await ev((G) => { G.tick(0.05, 30); });
  await take('foot-walking', true);
  await touch('touchEnd', []);
  await ev((G) => { G.tick(0.05, 4); });

  // beside the rover, its button up (where the owner's picture of the crowded HUD was taken)
  await ev((G) => { G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 6); });
  await rest();
  await take('foot-at-rover', true);

  // getting in: for a few seconds the panel shows what the rover has in it
  await ev((G) => { G.hold(0.8); G.tick(0.05, 6); });
  await take('rover-getting-in', false);
  // driving: in the seat, the stick held forward
  await touch('touchStart', [{ x: jx, y: jy, id: 2 }]);
  await touch('touchMove', [{ x: jx, y: jy - 40, id: 2 }]);
  await ev((G) => { G.tick(0.05, 80); });
  await rest();
  await ev((G) => { G.tick(0.05, 20); });
  await take('rover-driving', true);
  await touch('touchEnd', []);
  // asked for, in the seat: the dial tapped
  await page.evaluate(() => window.__UI.openGauges(1e6));
  await ev((G) => { G.roverF.speed = 0; G.tick(0.05, 6); });
  await take('rover-gauges-open', false);
  await page.evaluate(() => window.__UI.openGauges(0));
  await ev((G) => { G.roverF.speed = 0; G.tick(0.05, 10); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 6); G.tpLocal(6, 34, 0.4); G.tick(0.05, 10); });
  await rest();

  // asked for: the dial tapped
  await page.evaluate(() => window.__UI.openGauges(1e6));
  await ev((G) => { G.tick(0.05, 4); });
  await take('foot-gauges-open', false);
  await page.evaluate(() => window.__UI.openGauges(0));
  // the task card pressed open
  await page.locator('#mg-objectives').tap({ timeout: 20000 }).catch(() => {});
  await ev((G) => { G.tick(0.05, 4); });
  await take('foot-task-open', false);
  await rest();

  // something wrong: water and power low, the tank under a quarter
  await ev((G) => { G.S.water = 9; G.S.power = 12; G.S.suit = 20; G.tick(0.05, 12); });
  await quiet();
  // (the log's line is typed out over a second or two, and the marker gives way to it on the game's next frames: the
  //  picture is of the HUD once it has)
  await sleep(2500);
  await ev((G) => { G.tick(0.05, 12); });
  await sleep(400);
  await ev((G) => { G.tick(0.05, 12); });
  await take('foot-low', false);
  // several things wrong at once, out of doors: a storm over the Hab, water and power short, the tank under an eighth.
  // One of them leads (its banner, and its gauge if it has one); the rest are marks.
  await ev((G) => { G.setStorm(0.8); G.S.water = 9; G.S.power = 12; G.S.suit = 10; G.tick(0.05, 12); });
  await quiet();
  await sleep(2500);
  await ev((G) => { G.tick(0.05, 12); });
  await sleep(400);
  await ev((G) => { G.tick(0.05, 12); });
  await take('foot-many-wrong', false);
  // ... and a breach indoors, with the water and the power still short
  await ev((G) => { G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; G.tpLocal(-5.0, -6.2); G.S.breach.active = true; G.S.breach.done = false; G.S.o2 = 61; G.tick(0.05, 12); });
  await quiet();
  await sleep(2500);
  await ev((G) => { G.S.o2 = 58; G.tick(0.05, 12); });
  await sleep(400);
  await ev((G) => { G.tick(0.05, 12); });
  await take('hab-breach', false);
  await ev((G) => { G.S.breach.active = false; G.S.breach.done = true; G.S.o2 = 96; G.S.water = 90; G.S.power = 88; G.S.suit = 100; G.tpLocal(6, 34, 0.4); G.setLocalTime(13); G.tick(0.05, 12); });

  // the full HUD (the setting), beside the rover: what the quiet one replaced
  await page.evaluate(() => window.__UI.setSetting('fullHud', true));
  await ev((G) => { G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 12); });
  await quiet();
  await sleep(1500);
  await ev((G) => { G.tick(0.05, 12); });
  await take('full-hud-at-rover', false);
  await page.evaluate(() => window.__UI.setSetting('fullHud', false));

  await g.close();
  return { rows, errors: g.errors };
}

/** Measure every phone asked for, print the table, and return how many things are past the bar. */
export async function run(o = {}) {
  let bad = 0;
  for (const size of PHONES) {
    if (o.want && !size.name.includes(o.want)) continue;
    console.log(size.name);
    let res;
    try { res = await measure(size, o); } catch (e) { bad++; console.log(`  FAILED: ${e.message}`); continue; }
    for (const r of res.rows) {
      const over = r.held && (r.all > (size.all || BAR.all) + 1e-6 || r.middle > BAR.middle + 1e-6 || r.top > BAR.top + 1e-6);
      if (over) bad++;
      console.log(`  ${over ? 'OVER' : r.held ? 'ok  ' : '    '} ${r.state.padEnd(20)} screen ${pct(r.all).padStart(6)}  middle ${pct(r.middle).padStart(6)}  top third ${pct(r.top).padStart(6)}` +
        `   ${r.parts.slice(0, 5).map(([k, v]) => `${k} ${pct(v)}`).join(', ')}`);
    }
    // with several things wrong, one leads: one banner, of the thing that kills soonest; the rest are marks clear of
    // the task card; and the card gives one task
    for (const r of res.rows) {
      const want = LEADS[r.state];
      if (!want) continue;
      const l = r.lead, ok = l.banners.length === 1 && want.test(l.banners[0]) && l.marks >= 1 && l.under === 0 && l.tasks === 1;
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.state}: one thing leads (${JSON.stringify(l.banners)}, ${l.marks} marks, ${l.under} under the task card, ${l.tasks} task line${l.tasks === 1 ? '' : 's'})`);
    }
    if (res.errors.length) { bad += res.errors.length; console.log('  console errors: ' + JSON.stringify(res.errors.slice(0, 4))); }
  }
  console.log(`\nthe bar (standing, walking, at the rover, driving): screen ${pct(BAR.all)} or less (16.0% on the smallest phone), middle clear, top third ${pct(BAR.top)} or less; ${bad} past it`);
  return bad;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const want = (process.argv.find((a) => a.startsWith('--size=')) || '').slice(7);
  const bad = await run({ want, shoot: process.argv.includes('--shoot') });
  process.exit(bad ? 1 : 0);
}
