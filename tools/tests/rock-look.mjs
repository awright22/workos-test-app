// Close-ups for work on the rocks: runs a plan of steps in one game and takes a picture after each named one.
//   node tools/tests/rock-look.mjs plan.mjs [--phone] [--quality medium] [--out dir] [--only a,b]
// A plan is a module whose default export is a list of steps, { name?, run: (G, lib) => ... }. `run` is sent to
// the page and called there with the debug hook (window.__MG); a step with no name takes no picture. Whatever a
// step returns is printed. Pictures go to tools/tests/.cache/rock-look/ unless --out says otherwise.
// (The standing pictures are tests/shots.mjs; this is for looking closely at one rock from where you choose.)
import { openGame, sleep, outDir } from './lib.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const planFile = process.argv[2];
if (!planFile || planFile.startsWith('--')) { console.error('usage: node tools/tests/rock-look.mjs plan.mjs [--phone] [--quality medium] [--out dir] [--only a,b]'); process.exit(2); }
const plan = (await import(pathToFileURL(path.resolve(planFile)).href)).default;
const phone = process.argv.includes('--phone');
const only = arg('--only', '').split(',').filter(Boolean);
const [W, H] = (phone ? '844x390' : arg('--size', '1280x720')).split('x').map(Number);
const dir = path.resolve(arg('--out', path.join(outDir, 'rock-look')));
await mkdir(dir, { recursive: true });

const g = await openGame({ quality: arg('--quality', 'medium'), width: W, height: H, touch: phone, dsf: phone ? 2 : 1, query: phone ? 'safe=0,47,21,47' : '' });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });
await g.page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });
// helpers a step can use in the page: the rocks near a place, largest first, and a camera on one of them
await g.page.evaluate(() => {
  const G = window.__MG;
  G.rockLib = {
    /** Rocks within `reach` metres of `pos` (default: the astronaut): [{ pos, size, kind, dist, bearing }], largest first. */
    near(reach = 30, pos = G.player.pos) {
      const up = pos.clone().normalize(), e = up.clone().set(-up.z, 0, up.x).normalize(), n = up.clone().cross(e);
      const out = [];
      for (const [node, set] of G.ctx.rocks.sets) {
        if (node.used < G.ctx.terrain.frame - 2) continue;
        const d = set.data, o = set.origin, st = G.ctx.rocks.stride;
        for (let i = 0; i < d.length; i += st) {
          const p = pos.clone().set(o[0] + d[i], o[1] + d[i + 1], o[2] + d[i + 2]), v = p.clone().sub(pos), dist = v.length();
          if (dist > reach) continue;
          out.push({ pos: p, size: +d[i + 6].toFixed(2), kind: set.kind, cls: Math.floor(d[i + 7]), dist: +dist.toFixed(1), bearing: Math.round((Math.atan2(v.dot(e), v.dot(n)) * 180 / Math.PI + 360) % 360) });
        }
      }
      return out.sort((a, b) => b.size - a.size);
    },
    list(reach = 30, n = 12) { return this.near(reach).slice(0, n).map((r) => `${r.kind} ${r.size} m, class ${r.cls}, ${r.dist} m off at ${r.bearing} deg`); },
  };
});
for (const step of plan) {
  if (step.name && only.length && !only.includes(step.name)) continue;
  const r = await g.eval(step.run, step.arg);
  if (r !== undefined && r !== null) console.log(step.name || '-', JSON.stringify(r));
  if (!step.name) continue;
  await g.eval((G) => { G.paused = false; });
  await sleep(700);
  await g.eval((G) => { G.paused = true; });
  await sleep(900);
  await g.page.screenshot({ path: path.join(dir, `${step.name}.png`), timeout: 420000 });
  console.log('  shot', path.join(dir, `${step.name}.png`));
}
console.log('console errors:', g.errors.length, g.errors.slice(0, 3));
await g.close();
process.exit(g.errors.length ? 1 : 0);
