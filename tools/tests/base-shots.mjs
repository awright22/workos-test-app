// Pictures of Base mode's own things, for review, at iPhone size on the preset a phone starts on: each kind of
// mineral deposit with the astronaut beside it, from a little way off and from close; and the three works beside
// the Hab, each with a job on, by day and after dark; and the buildings, by day.
//   node tests/base-shots.mjs [--out DIR] [--size=667] [--only=hematite,salt,works,buildings,quarters] [--hour=14]
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
// ---- the works: a kiln, a smelter and a glassworks beside the Hab, each with a job on, by day and after dark
if (!only.length || only.includes('works')) {
  await g.eval(async (G) => {
    G.tpLocal(30, 30, 0); await G.settle();
    const spots = { kiln: [26, 20, 2.4], smelter: [36, 27, 2.6], glassworks: [44, 16, 2.9] };
    for (const k of Object.keys(spots)) G.build(k, ...spots[k]);
    Object.assign(G.S.inv, { regolith: 80, brick: 20, iron: 6, glass: 4 });      // (enough soil for a job at each of the three)
    G.S.power = 90;
    for (const b of G.World.builtMeshes) if (b.def) G.works.startJob(b, b.def.jobs[0].id, 4);
    G.syncAllVisuals();
    G.tick(0.05, 60);
    await G.settle();
  });
  for (const [hr, tag] of [[14, 'day'], [20.6, 'night']]) {
    for (const kind of ['kiln', 'smelter', 'glassworks']) {
      await g.eval(async (G, [k, h]) => {
        const b = G.World.builtMeshes.find((x) => x.kind === k);
        const c = b.group.position, up = c.clone().normalize(), V = c.constructor;
        const front = new V(0, 0, 1).applyQuaternion(b.group.quaternion);
        const e = new V(-up.z, 0, up.x).normalize(), n = new V().crossVectors(up, e);
        const bear = Math.atan2(front.dot(e), front.dot(n)) * 180 / Math.PI;
        G.tpAround(c, 3.6, bear + 58);
        G.setLocalTime(h);
        G.S.power = 90;
        G.photo(c, 9.6, bear + 22, 2.4, 1.5);                 // (far enough back to have its smoke in the picture)
        G.tick(0.05, 30);
        await G.settle();
      }, [kind, hr]);
      await sleep(900);
      await g.page.screenshot({ path: path.join(dir, `works-${kind}-${tag}.png`), timeout: 420000 });
      console.log('  shot', `works-${kind}-${tag}`);
    }
  }
}
// ---- the buildings beside the Hab, by day: solar field, battery bank, water tank, farm dome, quarters, tower, pad
const BUILT = ['solarField', 'battery', 'tank', 'greenhouse', 'quarters', 'tower', 'pad'];        // (one of them can be asked for by name)
if (!only.length || only.includes('buildings') || only.some((k) => BUILT.includes(k))) {
  await g.eval(async (G) => {
    G.tpLocal(40, 40, 0); await G.settle();
    const spots = { solarField: [58, 44, 2.6], battery: [44, 56, 2.9], tank: [34, 52, 2.4], dome: [72, 62, 2.6], quarters: [88, 40, 2.5], tower: [62, 74, 2.8], pad: [104, 66, 2.6] };
    for (const k of Object.keys(spots)) G.build(k, ...spots[k]);
    G.syncAllVisuals();
    G.tick(0.05, 40);
    await G.settle();
  });
  for (const [kind, dist, height] of [['solarField', 11, 3.4], ['battery', 7.4, 2.2], ['tank', 8.2, 2.6], ['greenhouse', 13, 3.2], ['quarters', 10.5, 2.8], ['tower', 12, 3.4], ['pad', 13, 4.2]]) {
    if (only.length && !only.includes('buildings') && !only.includes(kind)) continue;
    await g.eval(async (G, [k, d, h]) => {
      const b = G.World.builtMeshes.find((x) => x.kind === k);
      const c = b.group.position, up = c.clone().normalize(), V = c.constructor;
      const front = new V(0, 0, 1).applyQuaternion(b.group.quaternion);
      const e = new V(-up.z, 0, up.x).normalize(), n = new V().crossVectors(up, e);
      const bear = Math.atan2(front.dot(e), front.dot(n)) * 180 / Math.PI;
      G.tpAround(c, (b.def ? b.def.r : 5) + 1.6, bear + 60);
      G.setLocalTime(14);
      G.photo(c, d, bear + 24, h, k === 'tower' ? 3.2 : 1.0);
      G.tick(0.05, 30);
      await G.settle();
    }, [kind, dist, height]);
    await sleep(900);
    await g.page.screenshot({ path: path.join(dir, `building-${kind}.png`), timeout: 420000 });
    console.log('  shot', `building-${kind}`);
  }
}
console.log('console errors:', g.errors.length, g.errors.slice(0, 3));
await g.close();
process.exit(0);
