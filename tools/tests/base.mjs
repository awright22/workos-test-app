// Base mode: the game with no rescue. It is offered only where it is asked for (?base on the address, or a base
// already saved); it keeps a save of its own; nothing in it counts down to a rescue; and the story is as it was.
import { openGame, sleep } from './lib.mjs';
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };
const ready = (g) => g.page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
const menu = async (g) => (await g.page.locator('#mg-panel').innerText()).replace(/\s+/g, ' ');

// ---- the title: without the asking, a new game is the story and nothing else
let g = await openGame({ quality: 'low' });
await g.page.locator('#mg-panel button', { hasText: 'NEW GAME' }).click();
let sheet = await menu(g);
check('unasked, New Game goes straight to the story\'s difficulties', /choose your mars/i.test(sheet) && /sols to rescue/i.test(sheet) && !/two ways/i.test(sheet), sheet.slice(0, 90));
await g.close();

// ---- asked for: the choice of game, then a base with no rescue on its difficulty cards
g = await openGame({ quality: 'low', query: 'base' });
await g.page.locator('#mg-panel button', { hasText: 'NEW GAME' }).click();
sheet = await menu(g);
check('asked for, New Game asks which game', /two ways to be stranded/i.test(sheet) && /get home/i.test(sheet) && /stay/i.test(sheet), sheet.slice(0, 120));
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
check('the numbers at the desk: rescue none, and build to stay', numbers.sealed && numbers.did && /none rescue/i.test(numbers.text) && /4 years next ship/i.test(numbers.text) && /somewhere a man can live/i.test(numbers.text) && !/can launch on sol/i.test(numbers.text), numbers.text.slice(0, 220));
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
check('the first dawn counts no sols to a rescue', dawn.sol === 2 && !/rescue in/i.test(dawn.text) && /four years out/i.test(dawn.text) && /breakfast for/i.test(dawn.text), dawn);

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
const errsBase = g.errors.slice();
await g.close();

g = await openGame({ quality: 'low' });
s = await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.saveGame(); return { kind: G.S.kind, rescue: G.S.rescueSol, key: !!localStorage.getItem('stranded2-save'), baseKey: !!localStorage.getItem('stranded2-save-base'), deposits: G.World.deposits ? G.World.deposits.length : 0 }; });
check('the story is as it was: a rescue on Sol 25, saved in the story\'s slot, and no deposits', s.kind === 'story' && s.rescue === 25 && s.key && s.deposits === 0, s);
g.errors.push(...errsBase);

console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'passed'}; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
await sleep(50);
process.exit(fails.length || g.errors.length ? 1 : 0);
