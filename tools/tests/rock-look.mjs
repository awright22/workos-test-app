// Close-ups for work on the rocks: runs a plan of steps in one game and takes a picture after each named one.
//   node tools/tests/rock-look.mjs plan.mjs [--phone] [--quality medium] [--out dir] [--only a,b]
// A plan is a module whose default export is a list of steps, { name?, play?, run: (G) => ... }. `run` is sent to
// the page and called there with the debug hook (window.__MG); a step with no name takes no picture (with `play` the
// game is still let run for a moment after it, as it is before a picture: boulders load and colliders settle).
// Whatever a step returns is printed. Pictures go to tools/tests/.cache/rock-look/ unless --out says otherwise.
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
    /** Put the free camera where a camera was: its position and quaternion (as arrays), from another run's print-out. */
    pose(cam, quat) {
      const T = G.player.pos.clone().set(0, 0, -1).applyQuaternion(G.ctx.engine.camera.quaternion.clone().set(quat[0], quat[1], quat[2], quat[3])).multiplyScalar(20);
      const c = T.clone().set(cam[0], cam[1], cam[2]); T.add(c);
      const up = T.clone().normalize(), e = up.clone().set(-up.z, 0, up.x).normalize(), n = up.clone().cross(e), cu = c.clone().normalize();
      const R = up.length() * G.surfaceAt(up), dn = cu.clone().sub(up).dot(n) * R, de = cu.clone().sub(up).dot(e) * R;
      G.photo(T, Math.hypot(dn, de), Math.atan2(de, dn) * 180 / Math.PI, c.length() - G.surfaceAt(cu), T.length() - G.surfaceAt(up));
    },
    list(reach = 30, n = 12) { return this.near(reach).slice(0, n).map((r) => `${r.kind} ${r.size} m, class ${r.cls}, ${r.dist} m off at ${r.bearing} deg`); },
  };
});
for (const step of plan) {
  if (step.name && only.length && !only.includes(step.name)) continue;
  if (step.name || step.play) await g.eval((G) => { G.S.suit = 100; G.S.health = 100; G.S.o2 = 100; G.S.water = 80; G.S.food = 10; G.S.power = 90; });      // nobody suffocates mid-shoot
  const r = await g.eval(step.run, step.arg);
  if (r !== undefined && r !== null) console.log(step.name || '-', JSON.stringify(r));
  if (!step.name && !step.play) continue;
  await g.eval((G) => { G.paused = false; });
  await sleep(700);
  await g.eval((G) => { G.paused = true; });
  if (!step.name) continue;
  await sleep(900);
  await g.page.screenshot({ path: path.join(dir, `${step.name}.png`), timeout: 420000 });
  console.log('  shot', path.join(dir, `${step.name}.png`));
}
console.log('console errors:', g.errors.length, g.errors.slice(0, 3));
await g.close();
process.exit(g.errors.length ? 1 : 0);
