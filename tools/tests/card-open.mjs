// How long the phone's task card stands open in play (the quiet HUD's card: tools note I4 of the premium-bar review).
//
//   node tools/tests/card-open.mjs [--shoot=dir]
//
// A phone held sideways (844 x 390, touch). The game is stepped by its own clock through six stretches of ordinary
// play (standing, walking, driving, nightfall, the air running low), and twice a second the card is asked whether it
// is open. Printed for each stretch: the share of the time it stood open, the longest it stood open for one task,
// and each time it opened with the words on it. The check: once a task has been read (WHY_OPEN, nine seconds; half
// that at the wheel), the card is shut until the task changes or it is pressed; and beside a banner that has said
// what to do it is not opened at all.
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { openGame } from './lib.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const dir = arg('shoot');
if (dir) await mkdir(dir, { recursive: true });
const g = await openGame({ width: 844, height: 390, touch: true, quality: 'low', query: 'safe=0,47,21,47' });
const ev = g.eval;
await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); await G.settle(); G.paused = true; G.setStorm(0); G.S.storm.i = 0; });
const run = (name, sec, set) => ev(async (G, a) => {
  const fn = new Function('G', `return (${a.set})(G)`);
  await fn(G);
  const card = document.getElementById('mg-objectives');
  const out = { name: a.name, sec: a.sec, open: 0, n: 0, longest: 0, opens: [], h: [0, 0] };
  let run = 0, was = false, said = '';
  for (let t = 0; t < a.sec; t += 0.5) {
    G.tick(1 / 30, 15);
    const shown = card && card.style.display !== 'none' && card.getBoundingClientRect().height > 2;
    const open = shown && !card.classList.contains('shut');
    const h = shown ? Math.round(card.getBoundingClientRect().height) : 0;
    // (what it leads with: a card that is open for one task and then, with no gap, for the next has opened twice)
    const lead = card ? card.querySelector('.obj.primary .tx, .obj.urgent.first .tx') : null, now = lead ? lead.textContent : '';
    out.n++;
    if (open) {
      if (was && now !== said) run = 0;
      out.open++; run += 0.5; out.longest = Math.max(out.longest, run); out.h[0] = Math.max(out.h[0], h);
      if (!was || now !== said) out.opens.push(`${t.toFixed(1)}s: ${(card.innerText || '').replace(/\s+/g, ' ').slice(0, 90)}`);
    } else { run = 0; if (shown) out.h[1] = Math.max(out.h[1], h); }
    was = open; said = now;
  }
  return out;
}, { name, sec, set: set.toString() });
const keys = (G, on) => { for (const k of ['w', 'a', 's', 'd']) G.input.keys[k] = false; for (const k of on) G.input.keys[k] = true; };
const STRETCHES = [
  ['standing at the start', 40, (G) => {}],
  ['walking for a minute and a half', 90, (G) => { G.input.keys.w = true; }],
  ['driving for two minutes', 120, async (G) => { for (const k of ['w', 'a', 's', 'd']) G.input.keys[k] = false; await G.tp(19.1, 326.7, 0.6); G.initRoverAt(G.player.pos.clone().normalize(), 0.6); G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 4); G.hold(0.8); G.tick(1 / 30, 60); G.input.keys.w = true; }],
  ['driving on', 60, (G) => {}],
  ['night falls on the drive', 60, (G) => { G.setLocalTime(18.9); }],
  ['on foot, the air running low', 60, (G) => { for (const k of ['w', 'a', 's', 'd']) G.input.keys[k] = false; G.roverF.speed = 0; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 30); G.setLocalTime(14); G.S.suit = 14; G.input.keys.w = true; }],
];
let bad = 0;
for (const [name, sec, set] of STRETCHES) {
  const r = await run(name, sec, set);
  const share = Math.round(100 * r.open / r.n);
  console.log(`${name}: open ${share}% of ${r.sec} s; longest at once ${r.longest} s; ${r.opens.length} opening${r.opens.length === 1 ? '' : 's'}; height open ${r.h[0]} px, shut ${r.h[1]} px`);
  for (const o of r.opens) console.log('    ' + o);
  if (r.longest > 9.6) { bad++; console.log('    FAIL: open for longer than the nine seconds a new task is given'); }
  if (dir) await g.page.screenshot({ path: path.join(dir, name.replace(/[^a-z]+/g, '-') + '.png') });
}
if (g.errors.length) console.log('console errors: ' + JSON.stringify(g.errors.slice(0, 4)));
await g.close();
process.exit(bad || g.errors.length ? 1 : 0);
