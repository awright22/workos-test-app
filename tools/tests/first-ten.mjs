// The first ten minutes of a new player, on a phone, as a numbered sequence of screenshots.
//
//   node tools/tests/first-ten.mjs            iPhone landscape (844x390, notch and home bar simulated)
//   node tools/tests/first-ten.mjs --small    the small phone (667x375, the same insets)
//   node tools/tests/first-ten.mjs --desktop  1280x720 with a keyboard
//
// It starts a real new game from the title screen and takes each step of the opening in order
// (the crash, the Hab, the systems, the numbers, the farm, the panels, water, the first night),
// photographing what the game tells the player at each one. Travel between steps is by the debug
// hook (a real player walks), so the pictures show guidance, not pacing. Images land in
// tools/tests/.cache/first-ten/<size>/NN-name.png with a line in steps.txt for each.
import path from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { openGame, sleep, outDir } from './lib.mjs';
import { settledInPage } from './audit-lib.mjs';

const desktop = process.argv.includes('--desktop'), small = process.argv.includes('--small');
const size = desktop ? { name: 'desktop-1280x720', w: 1280, h: 720 } : small ? { name: 'phone-667x375', w: 667, h: 375, touch: true, safe: '0,47,21,47' } : { name: 'phone-844x390', w: 844, h: 390, touch: true, safe: '0,47,21,47' };
const g = await openGame({ width: size.w, height: size.h, touch: size.touch, quality: 'low', query: size.safe ? 'safe=' + size.safe : '', noStart: true });
const dir = path.join(outDir, 'first-ten', size.name);
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });
const page = g.page, ev = (fn, a) => g.eval(fn, a);
const steps = [];
let n = 0;
const shot = async (name, what, wait = 900) => {
  await ev((G) => { G.paused = false; });
  await sleep(wait);
  // (a picture is of a state at rest: this machine draws a frame a second, and a card that takes a quarter of a second
  //  to arrive on a phone was photographed half-way there)
  await page.waitForFunction(settledInPage, null, { timeout: 15000, polling: 100 }).catch(() => {});
  n++;
  const file = `${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(dir, file) });
  steps.push(`${file}  ${what}`);
  console.log('  shot', file);
};
const tapSel = async (sel) => { const l = page.locator(sel).first(); if (size.touch) await l.tap(); else await l.click(); };
const hold = (sec) => ev((G, s) => G.hold(s), sec);

await page.waitForSelector('[data-act="new"]', { timeout: 120000 });
await shot('title', 'The title screen, first launch.', 1500);
await tapSel('[data-act="new"]');
await shot('new-game', 'Choosing a difficulty.');
await tapSel('[data-diff="survival"]');
await page.waitForFunction(() => window.__MG && window.__MG.S.started, null, { timeout: 180000 });
await ev(async (G) => { await G.settle(); });
await shot('crash-first-seconds', 'The game begins: he comes to on the sand, some 75 m from the Hab, suit leaking.', 2500);
// (ten seconds of the game's own time, stepped: left to run, software rendering got through about one of them, and
// the suit's countdown looked stuck)
await ev((G) => { G.paused = true; G.tick(0.05, 180); });
await shot('crash-after-ten-seconds', 'Ten seconds in, nothing touched.', 1200);
await ev((G) => { G.tpLocal(0, 30, 0); G.tick(0.05, 10); });
await shot('approaching-hab', 'Walking toward the Hab.');
await ev((G) => { G.tpLocal(0, 10.0, 0); G.tick(0.05, 6); });
await shot('at-the-airlock', 'At the airlock door.');
await hold(2.6);
await shot('suit-sealed', 'After holding the action at the door.', 2500);
await ev((G) => { G.tpLocal(0, 3, 0); G.tick(0.05, 30); });
await shot('inside-first-look', 'Inside the Hab for the first time.', 3500);
await ev((G) => { G.tpLocal(4.0, -3.0); G.tick(0.05, 6); });
await shot('oxygenator', 'At the oxygenator.');
await hold(1.0);
await ev((G) => { G.tpLocal(4.3, -0.4); G.tick(0.05, 6); G.hold(1.0); });
await shot('systems-inspected', 'Both machines inspected.', 2500);
await ev((G) => { G.tpLocal(0, -5.0); G.tick(0.05, 6); });
await shot('comms-desk', 'At the comms desk.');
await hold(1.1);
await shot('the-numbers', 'Running the numbers.', 2500);
await ev(() => { const b = document.querySelector('#mg-panel .btns button, #mg-panel button.primary'); if (b) b.click(); });
await shot('after-the-numbers', 'Back in the room after the numbers: the farm is the task now.', 2500);
await ev((G) => { G.tpLocal(-6.7, -3.2); G.tick(0.05, 6); });
await shot('empty-bed', 'At a farm bed with no soil.');
await ev((G) => { G.tpNear(G.World.soilPiles[0].group.position, 1.2); G.tick(0.05, 10); });
await shot('soil-heap', 'Outside, at a heap of dug soil.', 2500);
await ev((G) => { G.hold(1.6); G.hold(1.6); G.tpLocal(-6.7, -3.2); G.tick(0.05, 30); G.hold(1.5); });
await shot('bed-filled', 'Back inside: the bed has soil.');
await hold(1.5);
await shot('what-to-plant', 'Planting: the game asks what goes in the bed.', 700);
await ev(() => { const b = document.querySelector('#mg-panel .choice'); if (b) b.click(); });
await shot('planted', 'A bed of potatoes planted.', 2500);
await ev((G) => {
  const T = G.ctx.engine.camera.position.constructor, p = G.World.panels[0];
  G.tpNear(new T().copy(p.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position), 1.6); G.tick(0.05, 10);
});
await shot('solar-panel', 'At a dusty solar panel.', 2500);
await hold(1.9);
await ev((G) => { G.tpLocal(4.2, 2.6); G.tick(0.05, 30); });
await shot('hydrazine-rig', 'At the hydrazine rig.', 2500);
await hold(2.2);
await shot('water-made', 'After the burn.', 3000);
for (const [key, id, what] of [['m', 'map', 'The map, opened for the first time.'], ['c', 'colony', 'The colony screen.'], ['j', 'journal', 'The journal.']]) {
  if (size.touch) await tapSel(`#mg-trow [data-t="${id}"]`); else await page.keyboard.press(key);
  // (the HUD goes at once when a screen opens: wait for that, however slowly this machine draws)
  await page.waitForFunction(() => getComputedStyle(document.getElementById('mg-hud')).visibility === 'hidden', null, { timeout: 30000 }).catch(() => {});
  await shot(id, what, 1500);
  await page.keyboard.press('Escape');
  await sleep(400);
}
await ev((G) => { if (G.S.uiOpen) { const b = document.querySelector('#mg-panel [data-act="resume"]'); if (b) b.click(); } G.setLocalTime(20.5); G.tpLocal(-5.0, -6.2); G.tick(0.05, 30); });
await shot('bunk-at-night', 'Evening, at the bunk.', 2500);
await hold(1.4);
await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 30000 });
await shot('night-summary', 'Sleeping until dawn: the account of the night, which waits to be read.', 2200);       // (past its fade-in, which software rendering stretches)
await tapSel('#mg-panel .sleep .wake');
await shot('woken', 'Awake again.', 4000);
// (twenty seconds of the game's own time, stepped, as with the first ten: left to run, this machine drew a handful of
// frames in twenty seconds of the wall clock, and what goes after a few seconds of play was photographed still there)
await ev((G) => { G.paused = true; G.tick(0.05, 400); });
await shot('sol-2-morning', 'The morning of Sol 2, twenty seconds in.', 1200);

await writeFile(path.join(dir, 'steps.txt'), steps.join('\n') + '\n');
console.log('console errors:', g.errors.length, g.errors.slice(0, 5));
await g.close();
process.exit(g.errors.length ? 1 : 0);
