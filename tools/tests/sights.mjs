// Sights: things to stop and watch (the moons, the Earth, sunset), logged once each, kept in the
// journal and in the save. Also checks the sky they depend on: Phobos rises in the west and goes
// dark in Mars's shadow.
import { openGame } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push(!!ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 1400) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);

await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); G.tpLocal(6, 30, 0); G.tick(0.05, 5); });

// ---- the sky: where Phobos is through one night
const sky = await ev((G) => {
  const u = G.ctx.engine.sky.uniforms, dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const up = G.player.pos.clone().normalize();
  const el = Math.hypot(up.z, up.x), east = { x: up.z / el, y: 0, z: -up.x / el };        // the way longitude grows
  const rows = [];
  for (let h = 18; h < 18 + 24.66; h += 0.25) {
    G.setLocalTime(h % 24.66); G.tick(0.001, 1);
    const p = u.uPhobos.value;
    rows.push({ h: +(h % 24.66).toFixed(2), el: dot(p, up), east: dot(p, east), lit: p.w, sunE: dot(G.ctx.engine.sunDir, up), earthEl: dot(u.uEarth.value, up) });
  }
  return rows;
});
// a pass: consecutive samples above the horizon; it must start in the west (east component negative) and end in the east
const passes = [];
let cur = null;
for (const r of sky) { if (r.el > 0.05) { (cur || (cur = [], passes.push(cur), cur)).push(r); } else cur = null; }
// (the clock is stepped by hand here and wraps at dawn, which cuts one pass short: so count the passes that
// run from the west to the east, and make sure none starts in the east)
const across = passes.filter((p) => p[0].east < -0.5 && p[p.length - 1].east > 0.5);
check('Phobos crosses the sky about twice a sol, rising in the west and setting in the east',
  across.length >= 2 && passes.every((p) => p[0].east < 0),
  { passes: passes.map((p) => [p[0].h, p[p.length - 1].h, +p[0].east.toFixed(2), +p[p.length - 1].east.toFixed(2)]) });
const dark = sky.filter((r) => r.lit < 0.05 && r.el > 0.05), darkByDay = dark.filter((r) => r.sunE > 0.2);       // (while it is above his horizon)
check('Phobos goes dark in the planet\'s shadow, and only on the night side', dark.length > 0 && darkByDay.length === 0, { dark: dark.length, darkByDay: darkByDay.length });
const dusk = sky.find((r) => r.sunE < -0.08 && r.sunE > -0.3 && r.h > 12);
check('Earth is up in the evening after the sun has set', dusk && dusk.earthEl > 0.15, dusk);

// ---- the compass agrees with the planet: north is the way latitude grows, and the sun sets in the west
const centred = () => ev(() => {
  const strip = document.querySelector('#mg-compass .strip') || document.querySelector('#mg-compass');
  const r = strip.getBoundingClientRect(), cx = r.left + r.width / 2;
  let best = null, bd = 1e9;
  for (const sp of strip.querySelectorAll('span')) {
    const b = sp.getBoundingClientRect();
    if (!b.width || !/^(N|NE|E|SE|S|SW|W|NW)$/.test(sp.textContent)) continue;
    const d = Math.abs(b.left + b.width / 2 - cx);
    if (d < bd) { bd = d; best = sp.textContent; }
  }
  return best;
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await ev((G) => { G.paused = false; G.setLocalTime(10); const up = G.player.pos.clone().normalize(); G.lookAt({ x: -up.x * up.y, y: 1 - up.y * up.y, z: -up.z * up.y }); G.tick(0.05, 3); });   // toward the pole, along the ground
await wait(1500);
const facingNorth = await centred();
await ev((G) => { G.setLocalTime(17.6); G.tick(0.001, 1); G.faceSun(); G.tick(0.05, 3); });
await wait(1500);
const facingSunset = await centred();
check('the compass reads N facing the pole and W facing the setting sun', facingNorth === 'N' && facingSunset === 'W', { facingNorth, facingSunset });

// ---- watching Phobos logs it, once
const lit = sky.find((r) => r.el > 0.3 && r.lit > 0.9 && r.sunE < -0.2);
let s = await ev(async (G, hour) => {
  const u = G.ctx.engine.sky.uniforms;
  G.S.inside = false; G.paused = false;
  G.setLocalTime(hour); G.tick(0.001, 1);
  const before = { seen: { ...G.sights.sights() }, morale: G.S.morale, points: G.S.science ? G.S.science.points : 0 };
  G.lookAt(u.uPhobos.value);
  for (let i = 0; i < 20; i++) { G.lookAt(u.uPhobos.value); G.sights.updateSights(0.25); }
  const mid = { seen: { ...G.sights.sights() }, morale: G.S.morale, points: G.S.science ? G.S.science.points : 0 };
  for (let i = 0; i < 20; i++) G.sights.updateSights(0.25);
  return { before, mid, after: { seen: { ...G.sights.sights() }, points: G.S.science ? G.S.science.points : 0 }, toast: document.querySelector('.toast') ? document.querySelector('.toast').textContent : '' };
}, lit ? lit.h : 20);
check('looking at Phobos for a few seconds logs it: science credit, better spirits, a notice',
  lit && !s.before.seen.phobos && s.mid.seen.phobos === 1 && s.mid.points === s.before.points + 6 && s.mid.morale > s.before.morale && /phobos/i.test(s.toast), { hour: lit && lit.h, ...s });
check('a sight is logged once', s.after.points === s.mid.points && Object.keys(s.after.seen).length === Object.keys(s.mid.seen).length, s.after);

// ---- nothing is logged from indoors
s = await ev((G) => {
  const u = G.ctx.engine.sky.uniforms;
  G.S.inside = true;
  for (let i = 0; i < 20; i++) { G.lookAt(u.uDeimos.value); G.sights.updateSights(0.25); }
  const n = Object.keys(G.sights.sights()).length;
  G.S.inside = false;
  return n;
});
check('nothing is logged from indoors', s === 1, s);

// ---- the journal lists every sight, with a hint for the ones not seen
s = await ev(async (G) => {
  G.paused = true;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
  await new Promise((r) => setTimeout(r, 400));
  const tab = [...document.querySelectorAll('#mg-journal button')].find((b) => /discover/i.test(b.textContent));
  if (tab) tab.click();
  await new Promise((r) => setTimeout(r, 300));
  const heads = [...document.querySelectorAll('#mg-journal .pane-hd')].map((h) => h.textContent);
  const cards = [...document.querySelectorAll('#mg-journal .card')].map((c) => c.textContent);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  return { heads, got: cards.filter((c) => /^Phobos\s*Sol 1/.test(c)).length, hint: cards.some((c) => /blue sunset/i.test(c) && /clear evening/i.test(c)), total: G.sights.SIGHTS.length };
});
check('the journal shows the sights: the one seen with its sol, the rest with a hint',
  s.heads.some((h) => new RegExp(`Sights\\s*1 of ${s.total} seen`).test(h)) && s.got === 1 && s.hint, s);

// ---- kept in the save
s = await ev((G) => {
  const d = JSON.parse(JSON.stringify(G.serializeState()));
  G.S.sights = {};
  G.applyState(d);
  return { saved: !!(d.sights && d.sights.phobos), back: !!(G.S.sights && G.S.sights.phobos) };
});
check('sights are written to the save and come back from it', s.saved && s.back, s);

const errors = g.errors.filter((e) => !/favicon/.test(e));
const passed = results.filter(Boolean).length;
console.log(`${passed}/${results.length} sights checks passed; console errors: ${errors.length}`, errors.slice(0, 5));
await g.close();
process.exit(passed === results.length && !errors.length ? 0 : 1);
