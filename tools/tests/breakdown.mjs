// Where the draw calls and triangles come from, by top-level object (diagnostic).
import { openGame, sleep } from './lib.mjs';
const g = await openGame({ quality: process.env.Q || 'low' });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.tpLocal(7, 24, 0); G.setLocalTime(10); G.tick(0.05, 3); await G.settle(); });
await sleep(2000);
const rows = await g.eval((G) => {
  const out = {};
  const tris = (m) => { const geo = m.geometry; const n = (geo.index ? geo.index.count : geo.attributes.position.count) / 3; return n * (m.isInstancedMesh ? m.count : 1); };
  const visible = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const scene = G.ctx.engine.scene;
  scene.traverse((o) => {
    if (!o.isMesh || !visible(o)) return;
    let top = o; while (top.parent && top.parent !== scene && top.parent !== G.ctx.world) top = top.parent;
    let name = top.name || (top === o ? (o.isInstancedMesh ? 'rocks' : o.geometry.attributes.aTex ? 'terrain' : 'mesh') : 'group');
    if (top.parent === G.ctx.world && !top.name) { const c = top.children[0]; name = (c && c.name) || 'site'; }
    const r = out[name] || (out[name] = { meshes: 0, tris: 0, casters: 0, casterTris: 0 });
    r.meshes++; r.tris += tris(o);
    if (o.castShadow) { r.casters++; r.casterTris += tris(o); }
  });
  return out;
});
for (const [k, r] of Object.entries(rows).sort((a, b) => b[1].tris - a[1].tris)) console.log(k.padEnd(18), 'meshes', String(r.meshes).padStart(4), ' tris', String(Math.round(r.tris)).padStart(7), ' shadow casters', String(r.casters).padStart(4), ' caster tris', String(Math.round(r.casterTris)).padStart(7));
console.log(JSON.stringify(await g.eval((G) => G.info())).slice(0, 300));
await g.close();
