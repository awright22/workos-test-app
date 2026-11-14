// Pictures of Base mode's own things, for review: each kind of mineral deposit with the astronaut beside it, from
// a little way off and from close, at iPhone size on the preset a phone starts on.
//   node tests/base-shots.mjs [--out DIR] [--size=667] [--only=hematite,salt] [--hour=14]
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { openGame, outDir, sleep } from './lib.mjs';

const arg = (name, def) => { const a = process.argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.split('=')[1] : def; };
const outAt = process.argv.indexOf('--out');
const dir = outAt > 0 ? path.resolve(process.argv[outAt + 1]) : path.join(outDir, 'base-shots');
const small = arg('size', '844') === '667';
const only = arg('only', '').split(',').filter(Boolean);
const hour = +arg('hour', '14');
await mkdir(dir, { recursive: true });

const g = await openGame({ quality: 'medium', query: 'base', width: small ? 667 : 844, height: small ? 375 : 390, touch: true, dsf: 2 });
await g.eval(async (G) => { await G.start(-1.9, 354.5, 'survival', 'base'); G.skipIntro(); await G.settle(); });
await g.page.addStyleTag({ content: '#mg-root > *:not(canvas) { opacity: 0 !important; }' });
const kinds = await g.eval((G) => [...new Set(G.World.deposits.map((d) => d.dep.id))]);
for (const kind of kinds) {
  if (only.length && !only.includes(kind)) continue;
  for (const [tag, dist, turn, height, aim] of [['a', 9.5, 24, 2.3, 0.4], ['b', 5.2, -35, 1.5, 0.3]]) {
    await g.eval(async (G, [k, d, t, h, a, hr]) => {
      const site = G.World.deposits.find((x) => x.dep.id === k);
      const c = site.group.position, up = c.clone().normalize();
      const V = c.constructor;
      const front = new V(0, 0, 1).applyQuaternion(site.group.quaternion);
      const e = new V(-up.z, 0, up.x).normalize(), n = new V().crossVectors(up, e);
      const b = Math.atan2(front.dot(e), front.dot(n)) * 180 / Math.PI;
      G.tpAround(c, 3.4, b + 62);                         // he stands at its corner, looking at it
      G.setLocalTime(hr);
      G.photo(c, d, b + t, h, a);
      G.tick(0.05, 30);
      await G.settle();
    }, [kind, dist, turn, height, aim, hour]);
    await sleep(900);
    await g.page.screenshot({ path: path.join(dir, `${kind}-${tag}.png`), timeout: 420000 });
    console.log('  shot', `${kind}-${tag}`);
  }
}
console.log('console errors:', g.errors.length, g.errors.slice(0, 3));
await g.close();
process.exit(0);
