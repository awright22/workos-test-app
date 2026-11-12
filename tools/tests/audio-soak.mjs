// Audio soak: play the real game for a few minutes with sound on and check that nothing piles
// up. A script walks, sprints, jumps, weathers a storm, works in the Hab, drives the rover,
// survives a breach and low oxygen, plays the disco and opens screens, stepping the simulation
// in real time so the audio clock and the game clock agree. Every two seconds it samples the
// number of live audio nodes and voices and the time spent inside the audio update.
//
//   node tools/tests/audio-soak.mjs [seconds]      default 150
//
// Checks: live nodes and voices stay bounded and the idle graph (standing still outside, score
// off) is the same size at the end as at the start, the audio
// update stays cheap, the audio clock keeps pace with the wall clock, no errors.
import { openGame, sleep } from './lib.mjs';

const SECONDS = Number(process.argv[2]) || 150;
const g = await openGame({ quality: 'low', width: 320, height: 200 });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.tpLocal(0, 30); });
await g.page.mouse.click(160, 100);                 // the first gesture unlocks audio
await sleep(300);

const began = await g.eval((G) => {
  const Snd = G.Snd;
  if (!Snd || !Snd.sys) return { ok: false, why: 'audio did not start', has: !!Snd };
  const W = window, T = (W.__soak = { samples: [], upd: [], plays: 0, load: [], t0: performance.now(), a0: Snd.ctx.currentTime, sim: 0, script: '' });
  const update = Snd.update.bind(Snd), play = Snd.play.bind(Snd);
  Snd.update = (p) => { const t = performance.now(); update(p); T.upd.push(performance.now() - t); };
  Snd.play = (n, o) => { T.plays++; return play(n, o); };
  if (Snd.ctx.renderCapacity) {
    try {
      Snd.ctx.renderCapacity.addEventListener('update', (e) => T.load.push([+e.averageLoad.toFixed(3), +e.peakLoad.toFixed(3), +e.underrunRatio.toFixed(3)]));
      Snd.ctx.renderCapacity.start({ updateInterval: 2 });
    } catch (e) { /* not supported */ }
  }
  // Drawing with software WebGL would starve the main thread, so stop the frame loop and hide
  // the page (or every HUD change repaints it): the timer below steps the simulation and the audio.
  window.requestAnimationFrame = () => 0;
  document.body.style.display = 'none';
  const key = (k, on) => { G.input.keys[k] = on; };
  const press = (k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
  // the script: [from second, what to do once]
  const steps = [
    [0, 'standing still, score off (the idle graph)', () => { Snd.setVolume('music', 0); }],
    [5, 'walk outside', () => { Snd.setVolume('music', 0.8); key('w', true); }],
    [8, 'sprint', () => { key('shift', true); }],
    [14, 'jump', () => { key(' ', true); }], [14.3, '', () => { key(' ', false); }],
    [17, 'jump', () => { key(' ', true); }], [17.3, '', () => { key(' ', false); }],
    [20, 'storm', () => { G.setStorm(0.85); key('shift', false); }],
    [32, 'into the Hab', () => { G.setStorm(0); G.tpLocal(0, 3); }],
    [36, 'farm and fabricate', () => { key('w', false); Snd.play('fillBed'); }],
    [38, '', () => Snd.play('plant')], [40, '', () => Snd.play('water')], [42, '', () => { Snd.play('harvest'); Snd.jingle(); }],
    [44, '', () => Snd.play('hydrazine')], [46, '', () => Snd.play('hydrazineBoom')], [48, '', () => Snd.craft()], [50, '', () => Snd.play('eat')],
    [52, 'hold an action', () => { G.tpLocal(-4.1, -3.2); G.S.inv.regolith = 3; G.input.eHeld = true; }], [56, '', () => { G.input.eHeld = false; key('w', true); }],
    [58, 'screens', () => press('m')], [60, '', () => press('m')], [61, '', () => press('j')], [63, '', () => press('j')],
    [64, 'rover', () => { key('w', false); G.tpNear(G.World.rover.group.position, 3.2); G.input.eHeld = true; }],
    [66, 'drive', () => { G.input.eHeld = false; key('w', true); }],
    [84, 'steer', () => { key('a', true); }], [88, '', () => { key('a', false); }],
    [94, 'stop and step out', () => { key('w', false); }], [99, '', () => press('f')],
    [100, 'breach', () => { G.tpLocal(0, 3); G.S.breach.active = true; Snd.play('breach'); Snd.alarm(true); key('w', true); }],
    [112, 'sealed', () => { G.S.breach.active = false; Snd.alarm(false); Snd.play('sealBreach'); }],
    [114, 'low oxygen outside', () => { G.tpLocal(0, 40); G.S.suit = 9; }], [116, '', () => { G.S.suit = 9; }], [120, '', () => { G.S.suit = 4; }],
    [124, 'recovered, discoveries', () => { G.S.suit = 100; Snd.discovery(); }], [126, '', () => Snd.play('achievement')],
    [128, 'disco in the Hab', () => { G.tpLocal(0, 3); G.S.disco = true; Snd.disco(true); }],
    [136, 'calm night outside', () => { G.S.disco = false; Snd.disco(false); key('w', false); G.tpLocal(0, 40); G.setLocalTime(1); }],
    [141, 'standing still, score off (the idle graph again)', () => { Snd.setVolume('music', 0); }],
  ];
  let next = 0;
  T.timer = setInterval(() => {
    const now = (performance.now() - T.t0) / 1000;
    while (next < steps.length && steps[next][0] <= now) { if (steps[next][1]) T.script = steps[next][1]; try { steps[next][2](); } catch (e) { console.error('soak step failed: ' + e.message); } next++; }
    // keep the astronaut alive and near home whatever the script does
    if (G.S.health < 60) G.S.health = 100;
    if (G.S.over) return;
    G.tick(0.05); T.sim += 0.05;
  }, 50);
  T.sampler = setInterval(() => {
    const s = Snd.stats();
    T.samples.push({ t: +((performance.now() - T.t0) / 1000).toFixed(1), live: s.live, voices: s.voices, made: s.made, music: s.music, what: T.script });
  }, 2000);
  return { ok: true, sampleRate: Snd.ctx.sampleRate, state: Snd.ctx.state, baseLatency: Snd.ctx.baseLatency };
});
console.log('audio:', JSON.stringify(began));
if (!began.ok) { await g.close(); process.exit(1); }

await sleep(SECONDS * 1000);
const r = await g.eval((G) => {
  const T = window.__soak, Snd = G.Snd;
  clearInterval(T.timer); clearInterval(T.sampler);
  const u = T.upd.slice().sort((a, b) => a - b), at = (q) => u[Math.min(u.length - 1, Math.floor(u.length * q))];
  return { samples: T.samples, updAvg: u.reduce((a, b) => a + b, 0) / u.length, updMed: at(0.5), upd95: at(0.95), updMax: u[u.length - 1], updN: u.length, plays: T.plays, load: T.load, sim: T.sim,
    wall: (performance.now() - T.t0) / 1000, audio: Snd.ctx.currentTime - T.a0, errors: Snd.errors, stats: Snd.stats(), over: G.S.over };
});
console.log('\n   t   nodes voices  made   score     doing');
for (const s of r.samples) console.log(`${String(s.t).padStart(6)} ${String(s.live).padStart(6)} ${String(s.voices).padStart(5)} ${String(s.made).padStart(6)}   ${String(s.music).padEnd(8)}  ${s.what}`);
const live = r.samples.map((s) => s.live), voices = r.samples.map((s) => s.voices);
const first = r.samples.filter((s) => s.t > 2 && s.t < 5.5).map((s) => s.live), last = r.samples.slice(-2).map((s) => s.live);
const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
console.log(`\nwall ${r.wall.toFixed(1)} s, audio clock ${r.audio.toFixed(1)} s, simulated ${r.sim.toFixed(1)} s; ${r.updN} audio updates, ${r.plays} one-shots requested, ${r.stats.made} nodes created in all`);
console.log(`live nodes: min ${Math.min(...live)}, max ${Math.max(...live)}; idle at the start ${avg(first).toFixed(0)}, idle at the end ${avg(last).toFixed(0)}; voices max ${Math.max(...voices)}`);
console.log(`audio update on the main thread: median ${(r.updMed * 1000).toFixed(0)} us, mean ${(r.updAvg * 1000).toFixed(0)} us, 95th percentile ${(r.upd95 * 1000).toFixed(0)} us, worst ${r.updMax.toFixed(1)} ms (headless Chromium; the worst case includes being descheduled on a busy machine)`);
if (r.load.length) {
  const a = avg(r.load.map((l) => l[0])), p = Math.max(...r.load.map((l) => l[1])), u = Math.max(...r.load.map((l) => l[2]));
  console.log(`audio thread load (renderCapacity): average ${(a * 100).toFixed(1)}%, peak ${(p * 100).toFixed(1)}%, worst underrun ratio ${u}`);
} else console.log('audio thread load: renderCapacity is not available in this browser');

const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + d : '')); if (!ok) fails.push(name); };
check('live nodes stay bounded', Math.max(...live) < 420, 'max ' + Math.max(...live));
check('nodes return to the idle level (no leak)', first.length > 0 && Math.abs(avg(last) - avg(first)) <= 10, `${avg(first).toFixed(0)} at the start, ${avg(last).toFixed(0)} at the end`);
check('voices stay limited', Math.max(...voices) <= 36, 'max ' + Math.max(...voices));
check('the audio update is cheap', r.updMed < 0.4 && r.upd95 < 4, `median ${(r.updMed * 1000).toFixed(0)} us, p95 ${(r.upd95 * 1000).toFixed(0)} us`);
check('the audio clock keeps pace', r.audio > r.wall * 0.97, `${r.audio.toFixed(1)} of ${r.wall.toFixed(1)} s`);
check('no audio errors', r.errors === 0 && r.stats.state === 'running', `errors ${r.errors}, context ${r.stats.state}`);
check('no console errors', g.errors.length === 0, JSON.stringify(g.errors.slice(0, 3)).slice(0, 600));
check('the astronaut survived the script', !r.over);
await g.close();
process.exit(fails.length ? 1 : 0);
