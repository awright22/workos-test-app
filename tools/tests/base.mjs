// Base mode: the game with no rescue. (While it was being built it was offered only for ?base on the address, or a base
// already saved); it keeps a save of its own; nothing in it counts down to a rescue; and the story is as it was.
import { openGame, sleep } from './lib.mjs';
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };
const ready = (g) => g.page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
const menu = async (g) => (await g.page.locator('#mg-panel').innerText()).replace(/\s+/g, ' ');

// ---- the title: New Game asks which game; the story's way through it is as it was, one sheet later
let g = await openGame({ quality: 'low' });
await g.page.locator('#mg-panel button', { hasText: 'NEW GAME' }).click();
let sheet = await menu(g);
check('New Game asks which game', /two ways to be stranded/i.test(sheet) && /get home/i.test(sheet) && /stay/i.test(sheet) && !/being built/i.test(sheet), sheet.slice(0, 120));
await g.page.locator('#mg-panel [data-kind="story"]').click();
sheet = await menu(g);
check('Get home: the story\'s difficulties, with a rescue on each', /choose your mars/i.test(sheet) && /sols to rescue/i.test(sheet) && !/two ways/i.test(sheet), sheet.slice(0, 90));
await g.page.locator('#mg-panel [data-act="back"]').first().click();
sheet = await menu(g);
check('Back from the difficulties is the choice of game again', /two ways to be stranded/i.test(sheet), sheet.slice(0, 60));
await g.page.locator('#mg-panel [data-kind="base"]').click();
sheet = await menu(g);
check('the base\'s difficulty cards promise no rescue', /rescue none/i.test(sheet) && !/sols to rescue/i.test(sheet) && /for good/i.test(sheet) && !/fly out/i.test(sheet), sheet.slice(-420));
await g.page.locator('#mg-panel [data-diff="survival"]').click();
await g.page.waitForFunction(() => window.__MG.S.started, null, { timeout: 120000 });
let s = await g.eval(async (G) => { await G.settle(); G.paused = true; return { kind: G.S.kind, rescue: G.S.rescueSol, diff: G.S.diff }; });
check('a base is begun: no rescue on its calendar', s.kind === 'base' && s.rescue > 1e6 && s.diff === 'survival', s);

// ---- nothing counts down: the numbers at the desk, the clock, the journal, the first dawn
const numbers = await g.eval((G) => {
  G.tpLocal(0, 8.4 + 1.6); G.hold(2.6);                                                       // the airlock door: the suit is sealed
  G.tpLocal(4.0, -3.0); G.hold(1.0); G.tpLocal(4.3, -0.4); G.hold(1.0); G.tpLocal(0, -5.0); G.hold(1.1);      // both machines, then the desk
  const p = document.querySelector('#mg-panel'), t = p ? p.innerText.replace(/\s+/g, ' ') : '';
  const b = document.querySelector('#mg-panel .btns button'); if (b) b.click();
  G.tick(0.05, 10);
  return { sealed: G.S.flags.suitSealed, did: G.S.flags.didMath, text: t };
});
check('the numbers at the desk: rescue none, and build to stay', numbers.sealed && numbers.did && /none rescue/i.test(numbers.text) && /4 years no ship for/i.test(numbers.text) && /somewhere a man can live/i.test(numbers.text) && !/can launch on sol/i.test(numbers.text), numbers.text.slice(0, 220));
const clock = await g.eval(async (G) => { G.tick(0.05, 40); await G.settle(); G.S.flags.uiJournal = true; G.tick(0.05, 4); return document.querySelector('#mg-clock .of').innerText.replace(/\s+/g, ' '); });
// (begun through the menus, the headless browser has no mouse to hold, and the pause card comes up by itself)
const resume = g.page.locator('#mg-panel button', { hasText: 'RESUME' });
if (await resume.count()) { await resume.first().click(); await g.eval((G) => { G.paused = true; G.tick(0.05, 2); }); }
await g.page.keyboard.press('j');
const journal = (await g.page.locator('#mg-journal .jr-body').innerText()).replace(/\s+/g, ' ');
await g.page.keyboard.press('Escape');
const hud = { clock, journal };
check('the clock names no rescue', !/rescue/i.test(hud.clock), hud.clock);
check('the journal has the long stay, not the way home', /the long stay/i.test(hud.journal) && /build a base/i.test(hud.journal) && !/fly home/i.test(hud.journal), hud.journal.slice(0, 200));
await g.eval((G) => { G.paused = false; G.setLocalTime(21.5); G.tpLocal(-5.0, -4.9); G.sleepToDawn(false); });
await g.page.waitForFunction(() => { const n = document.querySelector('#mg-panel .sleep .notes'); return n && n.innerText.length > 30; }, null, { timeout: 120000 });
const dawn = await g.eval((G) => { G.paused = true; const t = document.querySelector('#mg-panel .sleep').innerText.replace(/\s+/g, ' '); const b = document.querySelector('#mg-panel .sleep .wake button, #mg-panel .sleep button'); if (b) b.click(); G.tick(0.05, 6); return { sol: G.S.sol, text: t }; });
check('the first dawn counts no sols to a rescue', dawn.sol === 2 && !/rescue in/i.test(dawn.text) && /for four years/i.test(dawn.text) && /breakfast for/i.test(dawn.text), dawn);

// ---- Houston's first call is the other answer
const call = await g.eval((G) => {
  G.S.flags.pfRevealed = true;
  G.roverTo(G.World.pathfinder.position, 8); G.tpNear(G.World.pathfinder.position, 2.5); G.hold(2.8);
  G.roverTo(G.World.uplinkRing.position, 0.5); G.tpNear(G.World.uplink.position, 2.5); G.hold(2.8);
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const p = document.querySelector('#mg-panel'); if (!p || !p.querySelector('[data-act="next"]')) break;
    lines.push(p.innerText.replace(/\s+/g, ' '));
    p.querySelector('[data-act="next"]').click(); G.tick(0.05, 2);
  }
  return { connected: G.S.pf.connected, mav: !!G.S.flags.mavRevealed, n: lines.length, text: lines.join(' | ') };
});
check('Houston says nobody is coming, and the MAV is not revealed as a way out', call.connected && !call.mav && /four years out/i.test(call.text) && /live on mars/i.test(call.text) && !/intercept/i.test(call.text), { n: call.n, text: call.text.slice(0, 300) });
const tasks = await g.eval(async (G) => { G.tick(0.05, 30); await G.settle(); return (document.querySelector('#mg-objectives') || { innerText: '' }).innerText.replace(/\s+/g, ' '); });
check('the task card never says "Survive to Sol"', !/survive to sol/i.test(tasks) && tasks.length > 5, tasks.slice(0, 200));

// ---- a save of its own, beside the story's
const saved = await g.eval((G) => { G.saveGame(); const b = JSON.parse(localStorage.getItem('stranded2-save-base') || 'null'); return { base: b && b.kind, sol: b && b.sol, story: localStorage.getItem('stranded2-save') }; });
check('the base is saved in its own slot, and the story\'s slot is untouched', saved.base === 'base' && saved.story === null, saved);
await g.close();

// ---- with a base saved, the title offers it without being asked; the story still starts as the story
g = await openGame({ quality: 'low', query: 'base' });
await g.eval(async (G) => { await G.start(2.0, 303.7, 'survival', 'base'); G.skipIntro(); G.S.sol = 9; G.saveGame(); });
await g.page.goto(g.page.url().replace(/[?&]base\b/, (m) => (m[0] === '?' ? '?' : '')).replace(/\?&/, '?'), { waitUntil: 'load' });
await ready(g);
let title = await menu(g);
check('a saved base is offered on the title without the asking', /continue the base sol 9/i.test(title), title.slice(0, 160));
await g.page.locator('#mg-panel button', { hasText: 'CONTINUE THE BASE' }).click();
await g.page.waitForFunction(() => window.__MG.S.started, null, { timeout: 120000 });
s = await g.eval(async (G) => { await G.settle(); return { kind: G.S.kind, sol: G.S.sol, rescue: G.S.rescueSol }; });
check('continued as a base', s.kind === 'base' && s.sol === 9 && s.rescue > 1e6, s);
await g.close();

// ---- what a base is built of: mineral deposits at their real places, and basalt off any boulder
g = await openGame({ quality: 'low', query: 'base' });
await g.eval(async (G) => { await G.start(-1.9, 354.5, 'survival', 'base'); G.skipIntro(); await G.settle(); G.paused = true; });     // Meridiani Planum: hematite country
const field = await g.eval((G) => {
  const D = G.World.deposits, kinds = {};
  let steep = 0, worst = 0;
  for (const d of D) {
    kinds[d.dep.id] = (kinds[d.dep.id] || 0) + 1;
    // level ground under each: the land 3 m out on four sides is within a hand of the land at its middle
    const c = d.group.position, r0 = c.length();
    for (const [x, z] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
      const p = c.clone().add(new c.constructor(x, 0, z).applyQuaternion(d.group.quaternion));
      const dz = Math.abs(G.surfaceAt(p) - r0);
      worst = Math.max(worst, dz); if (dz > 0.12) steep++;
    }
  }
  const near = D.filter((d) => d.dep.id === 'hematite').map((d) => d.group.position.distanceTo(G.World.hab.position)).sort((a, b) => a - b)[0];
  return { n: D.length, kinds, steep, worst: +worst.toFixed(3), nearHematite: Math.round(near), found: Object.keys(G.S.base ? G.S.base.found : {}).length };
});
check('deposits stand on the planet: five kinds, 47 in all, each on level ground', field.n === 47 && Object.keys(field.kinds).length === 5 && field.steep === 0, field);
check('a base at Meridiani has hematite within a drive, and has found none yet', field.nearHematite < 2500 && field.found === 0, field);
const dug = await g.eval(async (G) => {
  const site = G.World.deposits.filter((d) => d.dep.id === 'hematite').sort((a, b) => a.group.position.distanceTo(G.player.pos) - b.group.position.distanceTo(G.player.pos))[0];
  G.tpNear(site.group.position, 3.0); await G.settle(); G.tick(0.05, 40);
  const found = !!G.S.base.found[site.key];
  const prompt = (document.querySelector('#mg-prompt') || { innerText: '' }).innerText.replace(/\s+/g, ' ');
  const shown = () => site.blocks.filter((b) => b.node.visible).length;
  const before = shown();
  for (let i = 0; i < 6; i++) { G.hold(2.3); G.tick(0.05, 2); }
  return { key: site.key, found, prompt, ore: G.S.inv.ore, left: site.left, before, after: shown() };
});
check('standing at a deposit finds it, and the prompt offers its work', dug.found && /rake up hematite/i.test(dug.prompt) && /iron ore/i.test(dug.prompt), dug.prompt);
check('six turns of work: twelve iron ore, six loads gone, and one of its heaps', dug.ore === 12 && dug.left === 24 && dug.before === 6 && dug.after === 5, dug);
const stone = await g.eval(async (G) => {
  // the nearest boulder: the first hold at it is the sample this ground owes, the next is stone
  // (boulders near the camera become colliders when a frame is drawn: look round until one turns up)
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  const from = G.player.pos.clone();
  let c = null;
  for (let tries = 0; tries < 12 && !c; tries++) {
    G.paused = false; await frames(1800); G.paused = true;
    const u = G.player.pos.clone().normalize();
    c = G.rockColliders.slice().sort((a, b) => a.v.distanceTo(u) - b.v.distanceTo(u))[0] || null;
    if (!c) { G.tpNear(from, 30 + tries * 60); await G.settle(); }
  }
  if (!c) return { none: true };
  G.tpAround(c.v.clone().multiplyScalar(12000), c.r + 0.9, 0); G.tick(0.05, 30);
  const prompt = () => (G.interaction.active ? G.interaction.active.label() : '');
  const first = prompt();
  G.hold(2.6); G.tick(0.05, 6);
  const second = prompt();
  G.hold(2.8); G.tick(0.05, 2);
  return { first, second, stone: G.S.inv.stone || 0, bagged: G.S.science.bag.length };
});
check('a boulder gives its sample first, then basalt', !stone.none && /chip a rock sample/i.test(stone.first) && /break off basalt/i.test(stone.second) && stone.stone === 2 && stone.bagged === 1, stone);
const kept = await g.eval((G, key) => {
  G.saveGame();
  const d = JSON.parse(localStorage.getItem('stranded2-save-base'));
  G.S.base = null; G.S.inv = {};
  G.applyState(d);
  const site = G.World.deposits.find((x) => x.key === key);
  return { saved: d.base, left: site && site.left, shown: site && site.blocks.filter((b) => b.node.visible).length, ore: G.S.inv.ore, stone: G.S.inv.stone, found: Object.keys(G.S.base.found).length };
}, dug.key);
check('the save keeps what was found, what was dug and what is left', kept.left === 24 && kept.shown === 5 && kept.ore === 12 && kept.stone === 2 && kept.found >= 1, kept);
await g.eval((G) => { G.paused = false; G.tick(0.05, 4); });
await g.page.keyboard.press('c');
await g.page.locator('#mg-colony [data-tab="inv"]').click();
const larder = (await g.page.locator('#mg-inv').innerText()).replace(/\s+/g, ' ');
check('the inventory lists a base\'s minerals, and says where the ones he lacks lie', /minerals/i.test(larder) && /iron ore 12/i.test(larder) && /basalt 2/i.test(larder) && /gusev crater/i.test(larder), larder.slice(-420));
await g.page.keyboard.press('Escape');

// ---- the works: built from the Colony screen's Base tab, set down outside, given a job at their own sheet
await g.eval((G) => { G.S.inv.stone = 12; G.S.inv.scrap = 5; G.S.inv.regolith = 9; G.S.power = 80; });
await g.page.keyboard.press('c');
await g.page.locator('#mg-colony [data-tab="base"]').click();
const tab = (await g.page.locator('#mg-base').innerText()).replace(/\s+/g, ' ');
check('the Base tab lists the works, the kiln ready to build', /works/i.test(tab) && /kiln/i.test(tab) && /smelter/i.test(tab) && /glassworks/i.test(tab) && /1 ready to build/i.test(tab), tab.slice(0, 260));
await g.page.locator('#mg-base [data-build="kiln"]').click();
const built = await g.eval(async (G) => {
  G.paused = true;
  G.tpLocal(26, 22, 0); await G.settle(); G.tick(0.05, 6);
  const prompt = G.interaction.active ? G.interaction.active.label() : '';
  // (the ring on the ground that shows where it will stand: the size of the kiln, ahead of him)
  const gh = G.ctx.engine.scene.children.find((c) => c.userData && c.userData.mats);
  const ring = gh && gh.visible ? { r: +gh.scale.x.toFixed(1), ahead: +gh.position.distanceTo(G.player.pos).toFixed(1), green: gh.userData.mats[0].color.g > gh.userData.mats[0].color.r } : null;
  G.hold(2.7); G.tick(0.05, 4);
  const b = G.World.builtMeshes.find((x) => x.kind === 'kiln');
  const use = G.interaction.active ? G.interaction.active.label() : '';
  return { prompt, ring, ringAfter: !!(gh && gh.visible), kiln: !!b, stone: G.S.inv.stone, scrap: G.S.inv.scrap, use, away: b ? Math.round(b.group.position.distanceTo(G.player.pos) * 10) / 10 : -1 };
});
check('a ring on the ground shows where it will stand, green where it can, and goes when it is built', built.ring && built.ring.r > 1.5 && built.ring.ahead > 3 && built.ring.ahead < 7 && built.ring.green && !built.ringAfter, { ring: built.ring, after: built.ringAfter });
check('set down outside for twelve basalt and two scrap, and it offers itself for use', /build the kiln here/i.test(built.prompt) && built.kiln && built.stone === 0 && built.scrap === 3 && /use the kiln/i.test(built.use), built);
await g.eval((G) => { G.hold(0.7); });
await g.page.waitForSelector('.sheet.work', { timeout: 60000 });
const sheet2 = (await g.page.locator('.sheet.work').innerText()).replace(/\s+/g, ' ');
check('its sheet lists its jobs, what a batch takes and makes, and what is missing', /fire bricks from soil/i.test(sheet2) && /fire bricks from clay/i.test(sheet2) && /burn gypsum to cement/i.test(sheet2) && /missing 2 clay/i.test(sheet2) && /standing idle/i.test(sheet2), sheet2.slice(0, 400));
await g.page.locator('.sheet.work [data-run="brick"][data-n="3"]').click();
const run = await g.eval((G) => {
  const b = G.World.builtMeshes.find((x) => x.kind === 'kiln');
  const t = document.querySelector('.sheet.work').innerText.replace(/\s+/g, ' ');
  document.querySelector('.sheet.work [data-act="done"]').click();
  const p0 = G.S.power, start = { regolith: G.S.inv.regolith, left: b.job && b.job.left };
  G.tick(0.5, 90);                                                    // 45 s: a batch is two hours, 39 s
  const mid = { brick: G.S.inv.brick || 0, left: b.job && b.job.left, working: b.working, spent: +(p0 - G.S.power).toFixed(1) };
  G.tick(0.5, 180);                                                   // and the other two
  return { text: t.slice(0, 200), start, mid, brick: G.S.inv.brick, job: b.job, working: b.working };
});
check('three batches: the soil is taken at once, and a batch comes out every two hours', run.start.regolith === 0 && run.start.left === 3 && run.mid.brick === 2 && run.mid.left === 2 && run.mid.working && run.brick === 6 && run.job === null && !run.working, run);
const smoke = await g.eval((G) => {
  const b = G.World.builtMeshes.find((x) => x.kind === 'kiln');
  G.S.inv.regolith = 3; G.works.startJob(b, 'brick', 1);
  G.tick(0.05, 80);                                                   // four seconds of a 39-second batch
  const v = G.ctx.vfx, a = v.pInfo.array;
  let n = 0;
  for (let i = 0; i < v.puffN; i++) if (a[i * 4 + 3] > 1.5 && v.time - a[i * 4] < a[i * 4 + 1]) n++;
  G.works.stopJob(b);
  return { heat: +b.heat.toFixed(2), smoke: n, flue: !!b.flue };
});
check('a kiln at work smokes from its flue', smoke.flue && smoke.heat > 0.8 && smoke.smoke >= 15, smoke);
const more = await g.eval((G) => {
  const b = G.World.builtMeshes.find((x) => x.kind === 'kiln');
  G.S.inv.regolith = 9;
  // no power to spare: the job waits
  G.works.startJob(b, 'brick', 3); G.S.power = 6; G.tick(0.5, 20);
  const waiting = { t: b.job.t, working: b.working, line: G.works.jobLine(b) };
  G.S.power = 70; G.tick(0.5, 20);
  const going = { t: +b.job.t.toFixed(1), working: b.working };
  // (what it draws, by itself: ten seconds of a 39-second batch that costs 3% of the Hab's power)
  const p0 = G.S.power; G.works.updateWorks(10);
  going.draw = +(p0 - G.S.power).toFixed(2);
  // the save keeps the job
  G.saveGame();
  const d = JSON.parse(localStorage.getItem('stranded2-save-base'));
  const kept = d.built.find((x) => x.kind === 'kiln').job;
  b.job = null; G.applyState(d);
  const back = G.World.builtMeshes.find((x) => x.kind === 'kiln').job;
  // stopped: what has not gone into the fire comes back
  G.works.stopJob(G.World.builtMeshes.find((x) => x.kind === 'kiln'));
  return { waiting, going, kept, back, regolith: G.S.inv.regolith, kilns: G.World.builtMeshes.filter((x) => x.kind === 'kiln').length };
});
check('with no power to spare the job waits; working, it draws on the Hab; the save keeps it; stopped, the unfired soil comes back', more.waiting.t === 0 && !more.waiting.working && /waiting for hab power/i.test(more.waiting.line) && more.going.t > 5 && more.going.working && more.going.draw > 0.6 && more.going.draw < 0.9 && more.kept && more.kept.left === 3 && more.back && more.back.left === 3 && more.regolith === 6 && more.kilns === 1, more);

// ---- a thing chosen and not yet set down can be un-chosen on its card
await g.eval((G) => { Object.assign(G.S.inv, { brick: 14, stone: 6, scrap: 4, circuit: 1 }); G.paused = false; G.tick(0.05, 4); });
await g.page.keyboard.press('c');
await g.page.locator('#mg-colony [data-tab="base"]').click();
await g.page.locator('#mg-base [data-build="smelter"]').click();
const chosen = await g.eval((G) => { G.tick(0.05, 4); return G.interaction.active ? G.interaction.active.label() : ''; });
await g.page.keyboard.press('c');
await g.page.locator('#mg-colony [data-tab="base"]').click();
const card = (await g.page.locator('#mg-base [data-card="smelter"]').innerText()).replace(/\s+/g, ' ');
await g.page.locator('#mg-base [data-unbuild]').click();
const undone = { cancel: await g.page.locator('#mg-base [data-unbuild]').count(), build: await g.page.locator('#mg-base [data-build="smelter"]').count() };
await g.page.keyboard.press('Escape');
undone.prompt = await g.eval((G) => { G.tick(0.05, 4); const l = G.interaction.active ? G.interaction.active.label() : ''; G.paused = true; return l; });
check('a thing chosen can be un-chosen: its card says it is chosen and offers Cancel, and the prompt for it goes', /build the smelter here/i.test(chosen) && /cancel/i.test(card) && /chosen/i.test(card) && undone.cancel === 0 && undone.build === 1 && !/build the smelter/i.test(undone.prompt), { chosen, card: card.slice(-80), undone });

// ---- the buildings: what is built of what the works make, and what each does for the Hab
const bld = await g.eval(async (G) => {
  const out = {};
  // a water tank: the tanks hold 240 L more, each, and no more than three are any use
  out.cap0 = G.works.waterCap();
  G.build('tank', 36, 30, 0);
  out.cap1 = G.works.waterCap();
  G.S.water = 900; G.tick(0.05, 2); out.water = Math.round(G.S.water);
  for (let i = 0; i < 3; i++) G.build('tank', 36 + 6 * (i + 1), 44, 0);
  out.cap4 = G.works.waterCap();
  // a solar field: at noon the Hab gains twice as fast (measured over ten seconds, the works idle)
  for (const b of G.World.builtMeshes) if (b.def && b.def.jobs) G.works.stopJob(b);
  G.setLocalTime(12.5); G.tick(0.05, 4);
  const gain = () => { G.S.power = 40; G.S.base.reserve = 0; const p = G.S.power; G.tick(0.5, 20); return G.S.power - p; };
  out.gain0 = +gain().toFixed(2);
  G.build('solarField', 60, 26, 0);
  out.gain1 = +gain().toFixed(2);
  // a battery bank: what the Hab has over nine tenths goes into reserve, and comes back when it is under three
  G.build('battery', 30, 44, 0);
  out.rcap = G.works.reserveCap();
  G.S.base.reserve = 0; G.S.power = 99; G.tick(0.05, 2);
  out.kept = { power: Math.round(G.S.power), reserve: Math.round(G.S.base.reserve) };
  G.S.base.reserve = 60; G.S.power = 10; G.tick(0.05, 2);
  out.back = { power: Math.round(G.S.power), reserve: Math.round(G.S.base.reserve) };
  // a farm dome is a greenhouse, by another road
  const plots = G.World.plots.length;
  const dome = G.build('dome', 70, 50, 0);
  out.dome = { kind: dome.kind, plots: G.World.plots.length - plots };
  // the save keeps the reserve and what stands
  G.saveGame();
  const d = JSON.parse(localStorage.getItem('stranded2-save-base'));
  out.saved = { reserve: Math.round(d.base.reserve), kinds: [...new Set(d.built.map((b) => b.kind))].sort().join(',') };
  return out;
});
check('a water tank holds 240 L more, and three are as many as are any use', bld.cap0 === 120 && bld.cap1 === 360 && bld.water === 360 && bld.cap4 === 840, bld);
check('a solar field: the Hab gains power at noon about twice as fast', bld.gain0 > 0.5 && bld.gain1 > bld.gain0 * 1.6, { gain0: bld.gain0, gain1: bld.gain1 });
check('a battery bank keeps what is over nine tenths and gives it back under three', bld.rcap === 100 && bld.kept.power <= 91 && bld.kept.reserve >= 8 && bld.back.power === 30 && bld.back.reserve === 40, { kept: bld.kept, back: bld.back });
check('a farm dome is a greenhouse with four beds; the save keeps the reserve and what stands', bld.dome.kind === 'greenhouse' && bld.dome.plots === 4 && bld.saved.reserve === 40 && /battery/.test(bld.saved.kinds) && /solarField/.test(bld.saved.kinds) && /tank/.test(bld.saved.kinds), { dome: bld.dome, saved: bld.saved });
const last = await g.eval((G) => {
  const out = {};
  // a comms tower: every deposit goes on the map
  out.found0 = Object.keys(G.S.base.found).length;
  G.build('tower', 52, 62, 0); G.tick(0.5, 6);
  out.found1 = Object.keys(G.S.base.found).length;
  // a landing pad: a drop ten sols after it is laid, on the pad, with circuit boards in it; and no second while the first stands
  const pad = G.build('pad', 84, 30, 0);
  out.first = G.works.padDrop();
  const pods = G.World.pods.length;
  G.S.sol += 10;
  const pod = G.works.padDrop();
  out.drop = pod ? { circuit: pod.loot.circuit, away: Math.round(pod.group.position.distanceTo(pad.group.position) * 10) / 10, pods: G.World.pods.length - pods } : null;
  G.S.sol += 10;
  out.second = G.works.padDrop();
  // living quarters stand
  G.build('quarters', 100, 60, 0);
  out.quarters = G.works.standing('quarters');
  return out;
});
check('a comms tower puts every deposit on the map', last.found0 < 47 && last.found1 === 47, { found0: last.found0, found1: last.found1 });
check('a landing pad: a supply drop on it ten sols on, with circuit boards; none while one stands unopened', last.first === null && last.drop && last.drop.circuit === 3 && last.drop.away < 1 && last.drop.pods === 1 && last.second === null && last.quarters === 1, last);
// ---- a base's own achievements: earned by what stands and what has come, without his doing anything at the time
const ach = await g.eval((G) => {
  const before = Object.keys(G.S.achieved).filter((k) => /^(mason|industry|town|signed|pirate)$/.test(k)).sort().join(',');
  G.build('smelter', 20, 70, 0); G.build('glassworks', 34, 74, 0);
  G.paused = false; G.tick(0.5, 8); G.paused = true;
  return { before, after: Object.keys(G.S.achieved).filter((k) => /^(mason|industry|town|signed|pirate)$/.test(k)).sort().join(',') };
});
check('a base earns its own achievements: the kiln, the three works, every building, the first drop', /industry/.test(ach.after) && /mason/.test(ach.after) && /signed/.test(ach.after) && /town/.test(ach.after) && !/industry/.test(ach.before) && !/pirate/.test(ach.after), ach);
await g.eval((G) => { G.paused = false; G.tick(0.05, 4); });
await g.page.keyboard.press('c');
await g.page.locator('#mg-colony [data-tab="base"]').click();
const tab2 = (await g.page.locator('#mg-base').innerText()).replace(/\s+/g, ' ');
check('the Base tab lists the buildings, what each does, and says when one has all the use it can be', /buildings/i.test(tab2) && /solar field/i.test(tab2) && /battery bank/i.test(tab2) && /farm dome/i.test(tab2) && /3 is as many as are any use/i.test(tab2) && /holds 240 l more water/i.test(tab2) && /living quarters/i.test(tab2) && /comms tower/i.test(tab2) && /landing pad/i.test(tab2), tab2.slice(-520));
await g.page.keyboard.press('Escape');
const errsBase = g.errors.slice();
await g.close();

g = await openGame({ quality: 'low' });
s = await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.saveGame(); return { kind: G.S.kind, rescue: G.S.rescueSol, key: !!localStorage.getItem('stranded2-save'), baseKey: !!localStorage.getItem('stranded2-save-base'), deposits: G.World.deposits ? G.World.deposits.length : 0 }; });
await g.page.keyboard.press('c');
s.baseTab = await g.page.locator('#mg-colony [data-tab="base"]').count();
await g.page.keyboard.press('Escape');
check('the story is as it was: a rescue on Sol 25, saved in the story\'s slot, no deposits and no Base tab', s.kind === 'story' && s.rescue === 25 && s.key && s.deposits === 0 && s.baseTab === 0, s);
g.errors.push(...errsBase);

console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'passed'}; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
await sleep(50);
process.exit(fails.length || g.errors.length ? 1 : 0);
