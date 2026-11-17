// The opening film (game/opening.js): a new game begun from the title plays it, it can be left at any moment, and
// what it leaves behind is exactly the game as it has always begun.
//
//   node tools/tests/opening.mjs
//
// A phone held sideways (844 x 390, touch, the notch and home bar as insets), the film left in (every other test
// leaves it out: lib.mjs, `film`). The film is stepped by the game's own clock, so it takes seconds here and not
// the minutes this machine would need to draw it. Checked: it starts from the title and not from the debug hook's
// own start; while it runs the HUD is away, what is said is on the screen at a size that can be read, and Skip is a
// thumb high and clear of the notch and the home bar; the suit is whole until he is hit; nothing is saved from
// inside it; when it ends the hour, the weather, the suit, the place he stands and the scene's contents are as a
// game without it has them, and the game's first line is said then and not before; Skip and Escape end it at once
// with the same result; and continuing that game later does not play it again. And the join: the film goes out on a
// card on the black, and the game comes up on him lying where the film left him, from where he gets to his feet.
import { openGame, sleep } from './lib.mjs';

const g = await openGame({ width: 844, height: 390, touch: true, quality: 'low', query: 'safe=0,47,21,47', film: true });
const page = g.page, ev = g.eval;
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };
const tap = (sel) => page.locator(sel).first().tap();
// The clock where he stands, in hours of a 24.66-hour sol (game/sim.js, localHour). The film is an evening and the
// game a morning, so this is what tells the two apart: the planet's own clock (S.tod) depends on where he woke.
const hourAt = (pos, tod) => { const lon = Math.atan2(-pos[2], pos[0]) / (Math.PI * 2); return ((((lon + tod + 0.5) % 1) + 1) % 1) * 24.66; };
const FILM_HOUR = [18.3, 19.1], MORNING = [8.0, 8.8];
const within = (v, r) => v >= r[0] && v <= r[1];

// ---- from the title, as a player does
await page.waitForSelector('[data-act="new"]', { timeout: 120000 });
// (The film's words fade in and out on the page's own clock, which here advances a frame a second: what is measured
//  is where each fade ends.)
await page.addStyleTag({ content: '#mg-film .sub, #mg-film .later { transition: none !important; }' });
await tap('[data-act="new"]');
await tap('#mg-panel [data-kind="story"]');
await tap('[data-diff="survival"]');
await page.waitForFunction(() => window.__MG && window.__MG.S.started, null, { timeout: 180000 });
// (stepped from here by hand: left to run, this machine would draw a frame of it a second)
const start = await ev(async (G) => {
  G.paused = true;
  await G.settle();
  const said = () => [...document.querySelectorAll('#mg-log .mg-line .sr')].map((n) => n.textContent);
  return {
    on: G.openingOn(), mode: G.S.mode, t: G.World.opening ? G.World.opening.t : -1, hit: !!(G.World.opening && G.World.opening.hit), length: G.OPENING_LENGTH,
    suit: G.S.suit, tod: G.S.tod, storm: G.S.storm.i, cold: !!G.S.flags.coldOpen, history: G.ctx ? window.__UI.logHistory.length : -1, lines: said(),
    pos: G.player.pos.toArray().map((v) => Math.round(v * 100) / 100), astro: !!G.player.bones,
  };
});
start.hour = hourAt(start.pos, start.tod);
check('a new game begun from the title opens on the film', start.on && start.mode === 'cutscene' && start.length > 15 && start.length < 40, { on: start.on, mode: start.mode, length: start.length });
check('nothing of the game has been said yet, and his suit is whole', start.lines.length === 0 && !start.hit && start.cold, { lines: start.lines, hit: start.hit });
check('it is the evening of the storm', within(start.hour, FILM_HOUR) && start.storm > 0.8, { hour: start.hour, storm: start.storm });

// ---- a second and a half in: what is on the screen
await ev((G) => { G.tick(1 / 30, 45); });
const early = await ev((G) => {
  const r = (n) => { const b = n.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) }; };
  const shown = (n) => !!n && getComputedStyle(n).display !== 'none' && getComputedStyle(n).visibility !== 'hidden' && +getComputedStyle(n).opacity > 0.5 && n.getBoundingClientRect().height > 2;
  const film = document.getElementById('mg-film'), sub = film.querySelector('.sub'), who = sub.querySelector('b'), said = sub.querySelector('span'), skip = film.querySelector('.skip');
  const hud = ['#mg-vitals', '#mg-compass', '#mg-tr', '#mg-trow', '#mg-joy', '#mg-log'].filter((q) => { const n = document.querySelector(q); return n && shown(n) && +getComputedStyle(n.closest('#mg-touch') || n).opacity > 0.5 && getComputedStyle(n.closest('#mg-touch') || n).display !== 'none'; });
  localStorage.removeItem('stranded2-save');
  G.saveGame();
  return {
    t: G.World.opening.t, film: shown(film), sub: shown(sub), who: who.textContent, said: said.textContent, whoPx: parseFloat(getComputedStyle(who).fontSize), saidPx: parseFloat(getComputedStyle(said).fontSize),
    subBox: r(sub), skip: shown(skip), skipBox: r(skip), skipText: skip.textContent, hud, saved: localStorage.getItem('stranded2-save') !== null,
    w: window.innerWidth, h: window.innerHeight, fade: G.ctx.engine.final.uniforms.uFade.value, dust: G.S.storm.i,
  };
});
check('the film is on the screen, in a storm, with the HUD away', early.film && early.hud.length === 0 && early.dust > 0.8 && early.fade < 0.2, { hud: early.hud, dust: early.dust, fade: early.fade });
check('what is said is shown: who, and the line, at sizes that can be read', early.sub && early.who.length > 2 && early.said.length > 10 && early.whoPx >= 13.95 && early.saidPx >= 15.95, { who: early.who, said: early.said, whoPx: early.whoPx, saidPx: early.saidPx });
check('Skip is a thumb high, says so, and is clear of the notch and the home bar', early.skip && /skip/i.test(early.skipText) && early.skipBox.h >= 44 && early.skipBox.w >= 44 && early.skipBox.r <= early.w - 47 && early.skipBox.b <= early.h - 21, early.skipBox);
check('the line stands clear of Skip and inside the picture', early.subBox.r < early.skipBox.l && early.subBox.l >= 47 && early.subBox.b <= early.h - 21, { sub: early.subBox, skip: early.skipBox });
check('nothing is saved from inside the film', !early.saved);

// ---- to the moment he is hit, and past it
const struck = await ev((G) => {
  const out = {};
  let n = 0;
  while (G.World.opening && !G.World.opening.hit && n++ < 600) G.tick(1 / 30, 1);
  out.at = G.World.opening ? G.World.opening.t : -1; out.hit = !!(G.World.opening && G.World.opening.hit);
  return out;
});
check('he is hit about ten seconds in, and his suit is holed from then', struck.hit && struck.at > 8 && struck.at < 13, struck);

// ---- to the end
// ---- to the black after the rocket has gone: the card
await ev((G) => { let n = 0; while (G.World.opening && G.World.opening.t < G.OPENING_LENGTH - 1.1 && n++ < 1200) G.tick(1 / 30, 1); });
const card = await ev((G) => {
  const c = document.querySelector('#mg-film .later'), cs = getComputedStyle(c), sub = document.querySelector('#mg-film .sub'), b = c.getBoundingClientRect();
  return { t: G.World.opening ? G.World.opening.t : -1, text: c.textContent, on: +cs.opacity > 0.9, px: parseFloat(cs.fontSize), fade: G.ctx.engine.final.uniforms.uFade.value, sub: +getComputedStyle(sub).opacity,
    mid: Math.abs((b.left + b.right) / 2 - window.innerWidth / 2) < 3 && Math.abs((b.top + b.bottom) / 2 - window.innerHeight / 2) < 3 };
});
check('it goes out on a card on the black, alone in the middle, at a size that can be read', card.on && card.text.length > 5 && card.px >= 15.95 && card.fade > 0.98 && card.sub < 0.1 && card.mid, card);

// ---- to the end
const end = await ev(async (G) => {
  let n = 0;
  const before = { kids: G.ctx.world.children.length };
  while (G.openingOn() && n++ < 1200) G.tick(1 / 30, 1);
  const at = G.OPENING_LENGTH;
  // (how high his head is over his feet: a hand's breadth lying, a metre and a half standing)
  const head = () => { const v = G.player.pos.clone(); G.player.bones.head.getWorldPosition(v); G.ctx.world.worldToLocal(v); return Math.round((v.length() - G.player.pos.length()) * 100) / 100; };
  G.tick(1 / 30, 9);
  const down = { head: head(), anim: G.player.anim, fade: G.ctx.engine.final.uniforms.uFade.value };
  G.tick(1 / 30, 45);
  const mid = { head: head(), anim: G.player.anim };
  G.tick(1 / 30, 66);                                 // (four seconds of play in all: the picture comes up, he gets to his feet)
  await G.settle();
  return {
    down, mid, up: { head: head(), anim: G.player.anim },
    over: !G.openingOn(), steps: n, at, mode: G.S.mode, opening: G.World.opening, launch: G.World.launch, tod: G.S.tod, storm: G.S.storm.i, suit: G.S.suit, cold: !!G.S.flags.coldOpen,
    pos: G.player.pos.toArray().map((v) => Math.round(v * 100) / 100), kids: G.ctx.world.children.length, kidsBefore: before.kids,
    fade: G.ctx.engine.final.uniforms.uFade.value, film: getComputedStyle(document.getElementById('mg-film')).display,
    lines: [...document.querySelectorAll('#mg-log .mg-line .sr')].map((n2) => n2.textContent), radio: window.__UI.logHistory.filter((l) => l.voice === 'radio').length,
    first: (window.__UI.logHistory.find((l) => l.voice !== 'radio') || {}).text || '', anim: G.player.anim,
  };
});
end.hour = hourAt(end.pos, end.tod);
check('it ends by itself, in play', end.over && end.mode === 'walk' && end.opening === null && end.launch === null && end.film === 'none', { at: end.at, mode: end.mode });
check('the hour and the weather are the morning the game begins in', within(end.hour, MORNING) && end.storm < 0.05, { hour: end.hour, storm: end.storm });
check('he is where he was, in the first minute, his tank losing only what four seconds lose', end.cold && end.pos.every((v, i) => Math.abs(v - start.pos[i]) < 0.05) && end.suit <= start.suit && end.suit > start.suit - 2.5, { suit: [start.suit, end.suit] });
check('the game comes up on him lying where the film left him, and he gets to his feet', end.down.anim === 'Collapse' && end.down.head < 0.6 && end.down.fade > 0.3 && end.mid.head > end.down.head + 0.15 && end.mid.head < 1.45 && end.up.anim === 'Idle' && end.up.head > 1.45, { down: end.down, mid: end.mid, up: end.up });
check('the film left nothing in the scene', end.kids < end.kidsBefore && end.kids > 0, { during: end.kidsBefore, after: end.kids });
check('the picture has come up out of the black', end.fade < 0.05, end.fade);
check('the game\'s first line is said after the film, and what the crew said is kept for the journal', /suit holed/i.test(end.first) && end.radio >= 4, { first: end.first.slice(0, 40), radio: end.radio });

// ---- played again and left by the button; and again, by the keyboard
const kidsAfter = end.kids;
await ev(async (G) => { G.startOpening(); G.tick(1 / 30, 90); });
await page.locator('#mg-film .skip').tap();
const skipped = await ev((G) => ({ over: !G.openingOn(), mode: G.S.mode, tod: G.S.tod, storm: G.S.storm.i, kids: G.ctx.world.children.length }));
skipped.hour = hourAt(end.pos, skipped.tod);
check('Skip leaves it at once, with the same morning', skipped.over && skipped.mode === 'walk' && Math.abs(skipped.tod - end.tod) < 0.002 && within(skipped.hour, MORNING) && skipped.storm < 0.05 && skipped.kids === kidsAfter, skipped);
await ev(async (G) => { G.startOpening(); G.tick(1 / 30, 400); });
await page.keyboard.press('Escape');
const esc = await ev((G) => ({ over: !G.openingOn(), mode: G.S.mode, kids: G.ctx.world.children.length, fov: G.ctx.engine.camera.fov }));
check('so does Escape, from the last shot', esc.over && esc.mode === 'walk' && esc.kids === kidsAfter, esc);

// ---- that game, continued, does not play it
await ev((G) => { G.tick(1 / 30, 30); G.saveGame(); });
const saved = await page.evaluate(() => localStorage.getItem('stranded2-save') !== null);
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
await page.locator('#mg-panel button', { hasText: 'CONTINUE' }).first().tap();
await page.waitForFunction(() => window.__MG && window.__MG.S.started, null, { timeout: 180000 });
await sleep(500);
const cont = await ev((G) => ({ on: G.openingOn(), mode: G.S.mode, film: document.getElementById('mg-film') ? getComputedStyle(document.getElementById('mg-film')).display : 'none' }));
check('once out of the film the game saves, and continuing it does not play the film', saved && !cont.on && cont.mode === 'walk', cont);

check('no console errors', g.errors.length === 0, g.errors.slice(0, 4));
console.log(`\n${fails.length ? fails.length + ' FAILED' : 'opening: all checks passed'}`);
await g.close();
process.exit(fails.length ? 1 : 0);
