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

g = await openGame({ quality: 'low' });
s = await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.saveGame(); return { kind: G.S.kind, rescue: G.S.rescueSol, key: !!localStorage.getItem('stranded2-save'), baseKey: !!localStorage.getItem('stranded2-save-base') }; });
check('the story is as it was: a rescue on Sol 25, saved in the story\'s slot', s.kind === 'story' && s.rescue === 25 && s.key, s);

console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'passed'}; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
await sleep(50);
process.exit(fails.length || g.errors.length ? 1 : 0);
