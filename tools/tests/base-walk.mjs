// Base mode from its start, on a phone, as a numbered sequence of screenshots: what the game with no rescue tells a
// player at each step from New Game to a supply drop on his own landing pad.
//
//   node tools/tests/base-walk.mjs [--small] [--out DIR] [--quality=medium] [--dsf=2]
//
// It begins a base at Meridiani Planum (hematite country) and takes the steps in order: the choice of game, the
// numbers, the first night, basalt off a boulder, the kiln (chosen on the Base tab, set down, given a job), soil
// dug for it, the smelter, the map's leads, a deposit found and worked, the buildings, and the pad's first drop.
// Travel and waiting are by the debug hook (a real player walks and waits), and where a step would take sols of
// gathering the stores are filled and its caption says so: the pictures show guidance and what stands, not pacing.
// Images land in tools/tests/.cache/base-walk/<size>/NN-name.png with a line in steps.txt for each.
import path from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';
import { settledInPage } from './audit-lib.mjs';

const arg = (name, def) => { const a = process.argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.split('=')[1] : def; };
const small = process.argv.includes('--small');
const size = small ? { name: 'phone-667x375', w: 667, h: 375 } : { name: 'phone-844x390', w: 844, h: 390 };
const outAt = process.argv.indexOf('--out');
const dir = outAt > 0 ? path.resolve(process.argv[outAt + 1]) : path.join(outDir, 'base-walk', size.name);
const g = await openGame({ width: size.w, height: size.h, touch: true, dsf: +arg('dsf', '2'), quality: arg('quality', 'medium'), query: 'base&safe=0,47,21,47' });
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });
const page = g.page, ev = (fn, a) => g.eval(fn, a);
const steps = [];
let n = 0;
const shot = async (name, what, wait = 900) => {
  await ev((G) => { G.paused = false; });
  await sleep(wait);
  await page.waitForFunction(settledInPage, null, { timeout: 15000, polling: 100 }).catch(() => {});
  n++;
  const file = `${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(dir, file), timeout: 420000 });
  await ev((G) => { G.paused = true; });
  steps.push(`${file}  ${what}`);
  console.log('  shot', file);
};
const tap = (sel) => page.locator(sel).first().tap({ timeout: 120000 });
const hold = (sec) => ev((G, s) => G.hold(s), sec);
const prompt = () => ev((G) => (G.interaction.active ? G.interaction.active.label() : ''));
const closeScreens = async () => { await page.keyboard.press('Escape'); await sleep(300); await ev((G) => { if (G.S.uiOpen) { const b = document.querySelector('#mg-panel [data-act="resume"]'); if (b) b.click(); } }); };
// (a tap on the task card opens its reason for a few seconds, as a player's thumb would)
const why = async () => { await page.locator('#mg-objectives').tap({ timeout: 60000 }).catch(() => {}); await ev((G) => { G.tick(0.05, 6); }); };
const notes = [];
const expect = (what, ok, got) => { if (!ok) { notes.push(`${what}: ${JSON.stringify(got)}`); console.log('  NOTE', what, JSON.stringify(got)); } };

// ---- the choice of game
await page.waitForSelector('[data-act="new"]', { timeout: 120000 });
await tap('[data-act="new"]');
await shot('which-game', 'New Game: the game asks which of its two games.');
await tap('#mg-panel [data-kind="base"]');
await shot('difficulty', 'He chose Stay: the base\'s three difficulties.');
await ev(async (G) => { await G.start(-1.9, 354.5, 'survival', 'base'); await G.settle(); G.paused = true; });

// ---- the opening is the story's (see first-ten.mjs): the door, the two machines, and then the numbers, which are a base's
await ev((G) => {
  G.tick(0.05, 180); G.S.stats.walked += 45;
  G.tpLocal(0, 10.0, 0); G.tick(0.05, 6); G.hold(2.6);
  G.tpLocal(0, 3, 0); G.tick(0.05, 30);
  G.tpLocal(4.0, -3.0); G.tick(0.05, 6); G.hold(1.0);
  G.tpLocal(4.3, -0.4); G.tick(0.05, 6); G.hold(1.0);
  G.tpLocal(0, -5.0); G.tick(0.05, 6); G.hold(1.1);
});
await shot('the-numbers', 'Sol 1, at the comms desk: the numbers, as they stand when nobody is coming.', 2500);
await ev(() => { const b = document.querySelector('#mg-panel .btns button, #mg-panel button.primary'); if (b) b.click(); });
// (the first sol's chores are the story's own, reviewed there: beds, water, panels. Taken as done.)
await ev((G) => {
  Object.assign(G.S.flags, { uiColony: true, uiJournal: true, uiMap: true, uiBars: true });
  G.S.stats.booms = 1; G.S.stats.panels = 3; G.S.stats.potatoes = 4; G.S.water = 80;
  G.setLocalTime(20.5); G.tpLocal(-5.0, -6.2); G.tick(0.05, 30); G.hold(1.4);
});
await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 60000 });
await shot('first-night', 'The first night\'s account (the first sol\'s chores, which are the story\'s, taken as done).', 2200);
await tap('#mg-panel .sleep .wake');
await ev((G) => { G.paused = true; G.tick(0.05, 200); G.tpLocal(0, 14, 0); G.tick(0.05, 20); });
await why();
await shot('sol-2-outside', 'The morning of Sol 2, outside the airlock: the task card leads with a base\'s first task (he has tapped the card, which opens its reason).', 2500);

// ---- basalt: a boulder gives the sample this ground owes, and after that building stone
const rock = await ev(async (G) => {
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  const from = G.player.pos.clone();
  let c = null;
  for (let tries = 0; tries < 12 && !c; tries++) {
    G.paused = false; await frames(1800); G.paused = true;
    const u = G.player.pos.clone().normalize();
    c = G.rockColliders.slice().sort((a, b) => a.v.distanceTo(u) - b.v.distanceTo(u))[0] || null;
    if (!c) { G.tpNear(from, 30 + tries * 60); await G.settle(); }
  }
  if (!c) return null;
  G.tpAround(c.v.clone().multiplyScalar(12000), c.r + 0.9, 0); G.tick(0.05, 30);
  const first = G.interaction.active ? G.interaction.active.label() : '';
  G.hold(2.6); G.tick(0.05, 6);
  return { first, second: G.interaction.active ? G.interaction.active.label() : '' };
});
expect('a boulder offers its sample, then basalt', rock && /basalt/i.test(rock.second), rock);
await shot('boulder-basalt', 'At a boulder, its rock sample taken: it now offers building stone.', 1500);
await ev((G) => { for (let i = 0; i < 6; i++) { G.hold(2.8); G.tick(0.05, 2); } });
await shot('basalt-in-hand', 'Six turns at the boulder: twelve basalt.', 1500);
// (two scrap for the kiln: the wreckage by the Hab, as in the story)
await ev((G) => {
  const pods = G.World.pods.filter((p) => !p.taken && p.kind === 'debris').slice(0, 2);
  for (const p of pods) { G.tpNear(p.group.position, 1.6); G.tick(0.05, 10); G.hold(1.8); G.tick(0.05, 4); }
  G.tpLocal(0, 14, 0); G.tick(0.05, 20);
});
await why();
await shot('task-build-a-kiln', 'Back at the Hab with twelve basalt and scrap from the wreckage: the next task (card tapped for its reason).', 1800);

// ---- the kiln: chosen on the Colony screen's Base tab, set down outside, given a job
await tap('#mg-trow [data-t="colony"]');
await page.waitForSelector('#mg-colony [data-tab="base"]', { timeout: 60000 });
await tap('#mg-colony [data-tab="base"]');
await shot('base-tab-kiln-ready', 'Colony, the Base tab: the kiln can be built.', 1200);
await tap('#mg-base [data-build="kiln"]');
await ev(async (G) => { G.paused = true; G.tpLocal(26, 22, 0); await G.settle(); G.tick(0.05, 8); });
expect('the place for the kiln is offered', /build the kiln here/i.test(await prompt()), await prompt());
await shot('kiln-where', 'He pressed Build and walked out: the ring on the ground ahead of him is where the kiln will stand (green: it can go there).', 1800);
await hold(2.7);
await ev((G) => { G.tick(0.05, 6); });
await shot('kiln-built', 'The kiln, built.', 2500);
await ev((G) => { G.tpLocal(34, 30, 0); G.tick(0.05, 20); });
expect('soil for the works is offered on open ground', /dig regolith/i.test(await prompt()), await prompt());
await shot('dig-for-the-kiln', 'A few paces off: with a works standing idle, open ground offers soil for it.', 1500);
await ev((G) => { for (let i = 0; i < 3; i++) { G.hold(2.8); G.tick(0.05, 2); } G.S.power = Math.max(G.S.power, 72); G.setLocalTime(15.5); G.tpLocal(26, 22, 0); G.tick(0.05, 10); G.hold(0.7); });
await page.waitForSelector('.sheet.work', { timeout: 60000 });
await shot('kiln-sheet', 'At the kiln with nine loads of soil: its sheet.', 1200);
await tap('.sheet.work [data-run="brick"][data-n="3"]');
await ev((G) => { G.tick(0.5, 24); });
await shot('kiln-running', 'Run 3: the job is on.', 1200);
await tap('.sheet.work [data-act="done"]');
await ev((G) => { G.tpAround(G.World.builtMeshes.find((b) => b.kind === 'kiln').group.position, 7.5, 40); G.tick(0.05, 40); });
await shot('kiln-firing', 'The kiln at work, from a few paces.', 3500);
await ev((G) => { G.tick(0.5, 250); G.tpLocal(0, 14, 0); G.tick(0.05, 30); });
await why();
await shot('bricks-done', 'Six hours on: the three batches are out, and the log says so (card tapped for its reason).', 1800);

// ---- the smelter (fourteen brick, six basalt, four scrap, a circuit board): the stores are filled to it here
await ev((G) => { Object.assign(G.S.inv, { brick: 14, stone: 6, scrap: 4, circuit: 1 }); G.tick(0.05, 4); });
await tap('#mg-trow [data-t="colony"]');
await page.waitForSelector('#mg-colony [data-tab="base"]', { timeout: 60000 });
await tap('#mg-colony [data-tab="base"]');
await shot('base-tab-smelter-ready', 'Sols later (stores filled for the picture: fourteen brick fired, a circuit board from NASA\'s first science grant): the smelter can be built.', 1200);
await tap('#mg-base [data-build="smelter"]');
await ev(async (G) => { G.paused = true; G.tpLocal(37, 30, 0); await G.settle(); G.tick(0.05, 8); G.hold(2.7); G.tick(0.05, 6); G.S.inv.scrap = 6; G.S.inv.regolith = 6; G.hold(0.7); });
await page.waitForSelector('.sheet.work', { timeout: 60000 });
await shot('smelter-sheet', 'The smelter, built, and its sheet: iron three ways.', 1200);
await tap('.sheet.work [data-act="done"]');

// ---- the map: where orbiters saw each mineral
await tap('#mg-trow [data-t="map"]');
await page.waitForFunction(() => getComputedStyle(document.getElementById('mg-hud')).visibility === 'hidden', null, { timeout: 30000 }).catch(() => {});
await shot('map-leads', 'The map: the fields where each mineral was seen from orbit.', 2500);
await closeScreens();

// ---- a deposit: found by standing at it, worked by hand
// (its "DEPOSIT FOUND" card lives a few seconds by the wall's clock, and this machine takes longer than that over one
//  picture: it is held up until the picture is taken)
await page.evaluate(() => window.__UI.holdCards(true));
const dep = await ev(async (G) => {
  const site = G.World.deposits.filter((d) => d.dep.id === 'hematite').sort((a, b) => a.group.position.distanceTo(G.player.pos) - b.group.position.distanceTo(G.player.pos))[0];
  G.roverTo(site.group.position, 9);
  G.setLocalTime(11);
  G.tpNear(site.group.position, 3.4); await G.settle(); G.tick(0.05, 40);       // (two seconds: the game looks for what he has reached every second and a half)
  return { found: !!G.S.base.found[site.key], away: Math.round(site.group.position.distanceTo(G.World.hab.position)) };
});
expect('standing at a deposit finds it', dep.found, dep);
await shot('deposit-found', `A hematite pavement ${dep.away} m from the Hab, driven to: found, and its work offered.`, 1500);
await page.evaluate(() => window.__UI.holdCards(false));
await ev((G) => { for (let i = 0; i < 6; i++) { G.hold(2.3); G.tick(0.05, 2); } });
await shot('deposit-worked', 'Six turns of raking: twelve iron ore.', 1800);
await tap('#mg-trow [data-t="colony"]');
await page.waitForSelector('#mg-colony [data-tab="inv"]', { timeout: 60000 });
await tap('#mg-colony [data-tab="inv"]');
await page.evaluate(() => { const h = [...document.querySelectorAll('#mg-inv .pane-hd')].find((x) => /minerals/i.test(x.textContent)); if (h) h.scrollIntoView(); });
await shot('inventory-minerals', 'The inventory: what he has of each mineral, and where the ones he lacks lie.', 1200);
await closeScreens();

// ---- home with ore: iron from hematite
await ev(async (G) => {
  G.roverLocal(14, 26, 0.6); G.S.power = 85; G.setLocalTime(14);
  G.tpLocal(37, 30, 0); await G.settle(); G.tick(0.05, 10); G.hold(0.7);
});
await page.waitForSelector('.sheet.work', { timeout: 60000 });
await tap('.sheet.work [data-run="ironOre"]');
await ev((G) => { G.tick(0.5, 30); });
await shot('smelter-ore-running', 'Home with the ore: the smelter making iron from hematite.', 1200);
await tap('.sheet.work [data-act="done"]');

// ---- the rest of a base: set down for the picture (each is built the way the kiln was)
await ev(async (G) => {
  for (const [k, x, z, yaw] of [['glassworks', 46, 15, 2.9], ['solarField', 53, 38, 2.6], ['battery', 40, 39, 2.9], ['tank', 29, 39, 2.4], ['quarters', 63, 23, 2.5], ['pad', 76, 46, 2.6]]) G.build(k, x, z, yaw);
  Object.assign(G.S.inv, { regolith: 40, silica: 6, clay: 6, sulfate: 4, salt: 2, brick: 9, iron: 7, glass: 5, cement: 6, stone: 8, circuit: 1 });
  for (const b of G.World.builtMeshes) if (b.def && b.def.jobs && !b.job) G.works.startJob(b, b.def.jobs[0].id, 3);
  G.syncAllVisuals(); G.tick(0.05, 30);
  G.tpLocal(6, 30, 0); await G.settle(); G.tick(0.05, 10);
});
await tap('#mg-trow [data-t="colony"]');
await page.waitForSelector('#mg-colony [data-tab="base"]', { timeout: 60000 });
await tap('#mg-colony [data-tab="base"]');
await page.evaluate(() => { const h = [...document.querySelectorAll('#mg-base .pane-hd')].find((x) => /buildings/i.test(x.textContent)); if (h) h.scrollIntoView(); });
await shot('base-tab-buildings', 'Many sols on (the rest set down for the picture: glassworks, solar field, battery bank, water tank, quarters, landing pad): the Base tab\'s buildings.', 1200);
await closeScreens();
await tap('#mg-trow [data-t="journal"]');
await page.waitForFunction(() => getComputedStyle(document.getElementById('mg-hud')).visibility === 'hidden', null, { timeout: 30000 }).catch(() => {});
await shot('journal-the-long-stay', 'The journal: where a base stands and what comes next.', 1500);
await closeScreens();
await ev(async (G) => { G.setLocalTime(15); G.tpAround(G.at(44, 30), 30, 215); await G.settle(); G.tick(0.05, 30); });
await shot('base-by-day', 'The base as he sees it, afternoon, walking back toward it.', 3500);
// (from the side away from the kiln: from the other he stood against its flue)
await ev(async (G) => { G.setLocalTime(20.8); G.tpAround(G.World.builtMeshes.find((b) => b.kind === 'smelter').group.position, 10, 310); await G.settle(); G.tick(0.05, 40); });
await shot('works-at-night', 'After dark, at the works.', 3500);
// (two pictures from a camera of the picture-taker's own, the interface hidden: the whole base at once)
await ev(async (G) => {
  document.getElementById('mg-root').classList.add('walk-bare');
  G.setLocalTime(16.2);
  G.tpLocal(34, 32, 0);
  G.photo(G.at(42, 28), 56, 215, 17, 1.5); G.tick(0.05, 30); await G.settle();
});
await page.addStyleTag({ content: '#mg-root.walk-bare > *:not(canvas) { opacity: 0 !important; }' });
await shot('whole-base-day', 'The whole base from above and to the south-west, late afternoon (interface hidden; a camera the player does not have).', 3500);
await ev(async (G) => { G.setLocalTime(21); G.photo(G.at(30, 24), 52, 125, 13, 1.5); G.tick(0.05, 30); await G.settle(); });
await shot('whole-base-night', 'The same base after dark (interface hidden).', 3500);
await ev((G) => { G.photo(null); document.getElementById('mg-root').classList.remove('walk-bare'); });

// ---- the landing pad: ten sols after it is laid, the first drop
const drop = await ev(async (G) => {
  G.S.base.padSol = G.S.sol - 10;
  const pod = G.works.padDrop();
  G.setLocalTime(8.2);
  const pad = G.World.builtMeshes.find((b) => b.kind === 'pad');
  G.tpNear(pad.group.position, 9.5); await G.settle(); G.tick(0.05, 30);
  return { pod: !!pod, drops: G.S.base.drops };
});
expect('a supply drop comes down on the pad', drop.pod, drop);
await shot('supply-drop', 'Ten sols after the pad was laid: the first supply drop stands on it.', 3500);
await ev((G) => { const p = G.World.pods.filter((x) => !x.taken).pop(); G.tpNear(p.group.position, 2.7); G.tick(0.05, 20); });
await shot('supply-drop-open', 'At the drop.', 2000);

await writeFile(path.join(dir, 'steps.txt'), steps.join('\n') + '\n' + (notes.length ? '\nNOT AS EXPECTED:\n' + notes.join('\n') + '\n' : ''));
console.log('not as expected:', notes.length, notes);
console.log('console errors:', g.errors.length, g.errors.slice(0, 5));
await g.close();
process.exit(g.errors.length || notes.length ? 1 : 0);
