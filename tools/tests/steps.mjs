// His steps: the sound of one falls when a boot comes down, and a boot that is down stays where it was put.
//
//   node tools/tests/steps.mjs
//
// Measured in the running game, sixty times a second, with nothing drawn. Each walking clip's planted boot goes back
// under him at a pace of its own (the Walk clip's at 5.1 m/s, the Run clip's at 9.2), and the game plays each at the
// pace he is moving at, so the boot is still on the ground. This holds it to that at a stroll, a walk and a run, and
// in the opening film, whose six figures use the same clips. And it holds the sound to the feet: the game counts a
// footfall when a boot comes down (game/player.js), and the audio plays one step for each (audio/movement.js).
// Both went wrong once without a test to say so: the sound kept a time of its own, three steps to his feet's two;
// and the Walk clip was played as if its pace were 2.2, so that at a stroll, and all through the film, he skated.
// A third thing is held here too: how high a boot comes through as he walks (the owner: "high stepping").
import { openGame } from './lib.mjs';

const g = await openGame({ width: 844, height: 390, touch: false, quality: 'low' });
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };

const out = await g.eval(async (G) => {
  await G.start(2.0, 303.7); G.skipIntro(); G.paused = true;
  const res = {};
  const V = G.player.pos.constructor;
  const rig = (root) => { const b = (n) => { let r = null; root.traverse((o) => { if (!r && o.isBone && o.name === n) r = o; }); return r; }; return { root, foot: { L: b('foot_L'), R: b('foot_R') }, toe: { L: b('toe_L'), R: b('toe_R') } }; };
  // one sample of a figure's two boots: how high each is in the figure's own frame, and where its toe is on the ground
  const sample = (r, rec) => { for (const s of ['L', 'R']) { const t = new V(), a = new V(); r.toe[s].getWorldPosition(t); r.foot[s].getWorldPosition(a); rec[s].push({ h: (r.root.worldToLocal(t.clone()).y + r.root.worldToLocal(a.clone()).y) / 2, w: G.ctx.world.worldToLocal(t) }); } };
  // of the samples in which a boot is planted (within 1.2 cm of the lowest it gets): how fast it slides over the ground
  const slide = (rec) => { const v = []; for (const s of ['L', 'R']) { const lo = Math.min(...rec[s].map((x) => x.h)); for (let i = 1; i < rec[s].length; i++) if (rec[s][i].h < lo + 0.012 && rec[s][i - 1].h < lo + 0.012) v.push(rec[s][i].w.distanceTo(rec[s][i - 1].w) * 60); } v.sort((a, b) => a - b); return { planted: v.length, median: +(v[Math.floor(v.length / 2)] || 0).toFixed(2) }; };

  let own = null; G.ctx.world.traverse((c) => { if (!own && c.name === 'astronaut') own = c; });
  const me = rig(own);
  const go = (label, set, secs) => {
    for (const k of ['w', 'a', 's', 'd', 'shift']) G.input.keys[k] = false; G.input.touch.joyX = 0; G.input.touch.joyY = 0;
    set();
    G.tick(1 / 60, 100);                                           // up to pace
    const rec = { L: [], R: [] }, names = {}, at = [], low = [];
    let last = G.player.steps, sp = 0;
    for (let i = 0; i < secs * 60; i++) {
      G.tick(1 / 60, 1);
      names[G.player.anim] = (names[G.player.anim] || 0) + 1; sp += G.player.speed;
      sample(me, rec);
      if (G.player.steps !== last) { last = G.player.steps; at.push(i / 60); const lo = { L: Math.min(...rec.L.map((x) => x.h)), R: Math.min(...rec.R.map((x) => x.h)) }; low.push(+Math.min(rec.L[rec.L.length - 1].h - lo.L, rec.R[rec.R.length - 1].h - lo.R).toFixed(3)); }
    }
    const gaps = at.slice(1).map((t, i) => t - at[i]);
    res[label] = { clip: Object.keys(names).sort((a, b) => names[b] - names[a])[0], pace: +(sp / (secs * 60)).toFixed(2), steps: at.length, perSec: +(at.length / secs).toFixed(2),
      gaps: gaps.length ? [+Math.min(...gaps).toFixed(2), +Math.max(...gaps).toFixed(2)] : [], overGround: low.length ? +Math.max(...low).toFixed(3) : -1, slide: slide(rec),
      lift: +(Math.max(...rec.L.map((x) => x.h)) - Math.min(...rec.L.map((x) => x.h))).toFixed(3) };
  };
  go('stroll', () => { G.input.touch.joyY = -0.42; }, 6);
  go('walk', () => { G.input.keys.w = true; }, 6);
  go('run', () => { G.input.keys.w = true; G.input.keys.shift = true; }, 6);
  for (const k of ['w', 'shift']) G.input.keys[k] = false; G.input.touch.joyY = 0;
  G.tick(1 / 60, 90);
  const before = G.player.steps; G.tick(1 / 60, 120);
  res.still = { steps: G.player.steps - before, clip: G.player.anim };

  // ---- the opening film: the first of the six through the first shot, and the last of them (him) through the second
  G.startOpening(); G.tick(1 / 60, 20);
  const figs = G.ctx.world.children.filter((c) => c.children[0] && c.children[0].name === 'astronaut' && c.children[0] !== own);
  const film = (label, r, until) => {
    const rec = { L: [], R: [] }, p0 = r.root.position.clone(); let n = 0;
    G.tick(1 / 60, 12);
    const t0 = G.World.opening.t; p0.copy(r.root.position);
    while (G.World.opening && G.World.opening.t < until) { G.tick(1 / 60, 1); n++; sample(r, rec); }
    res[label] = { pace: +(r.root.position.distanceTo(p0) / Math.max(0.01, G.World.opening.t - t0)).toFixed(2), slide: slide(rec) };
  };
  film('filmFirst', rig(figs[0]), 4.6);
  G.tick(1 / 60, 40);                                              // over the cut
  film('filmLast', rig(figs[figs.length - 1]), 9.0);
  G.skipOpening();
  return { ...res, figures: figs.length };
});

for (const k of ['stroll', 'walk', 'run']) {
  const r = out[k];
  check(`at a ${k} (${r.pace} m/s, the ${r.clip} clip) a planted boot stays where it was put`, r.slide.planted >= 12 && r.slide.median < 1.2, r.slide);
  check(`... and a step is counted each time a boot comes down, at an even beat`, r.steps >= 5 && r.overGround >= 0 && r.overGround < 0.06 && r.gaps[1] / r.gaps[0] < 1.45, { steps: r.steps, perSec: r.perSec, gaps: r.gaps, overGround: r.overGround });
}
check('he walks with the Walk clip and runs with the Run clip, each at its own pace', out.stroll.clip === 'Walk' && out.walk.clip === 'Walk' && out.run.clip === 'Run' && out.stroll.pace < 4.4 && out.walk.pace > 4.5 && out.walk.pace < 5.6 && out.run.pace > 8, { stroll: [out.stroll.clip, out.stroll.pace], walk: [out.walk.clip, out.walk.pace], run: [out.run.clip, out.run.pace] });
check('about two steps a second at a walk and nearer three at a run', out.walk.perSec > 1.7 && out.walk.perSec < 2.5 && out.run.perSec > 2.3 && out.run.perSec < 3.2, { walk: out.walk.perSec, run: out.run.perSec });
check('walking, his boot comes through low: no more than a hand over where it stands (it was a third of a metre, and at a slowed run half a metre)', out.walk.lift > 0.05 && out.walk.lift < 0.2 && out.stroll.lift < 0.2, { walk: out.walk.lift, stroll: out.stroll.lift, run: out.run.lift });
check('standing still, no step is counted', out.still.steps === 0 && out.still.clip === 'Idle', out.still);
check('in the opening film the crew\'s planted boots stay where they were put (the first shot)', out.figures === 6 && out.filmFirst.pace > 2 && out.filmFirst.slide.planted >= 8 && out.filmFirst.slide.median < 1.2, out.filmFirst);
check('... and his, on the walk to the ascent vehicle (the second shot)', out.filmLast.pace > 2 && out.filmLast.slide.planted >= 8 && out.filmLast.slide.median < 1.2, out.filmLast);
check('no console errors', g.errors.length === 0, g.errors.slice(0, 4));
console.log(`\n${fails.length ? fails.length + ' FAILED' : 'steps: all checks passed'}`);
await g.close();
process.exit(fails.length ? 1 : 0);
