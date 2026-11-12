import * as THREE from 'three';
import { World, setColliders, siteLocalToWorld, setSiteShown } from '../world/build.js';
import { setGlow } from '../world/models.js';
import { syncPlot } from './interactables.js';
import { clamp } from '../core/math.js';
import { S } from './state.js';
import { ctx } from './ctx.js';
import { surfaceAt } from '../planet/surface.js';
import { frameQuat, llToVec } from '../planet/geo.js';
import { _v1 } from '../core/scratch.js';
const _dust = new THREE.Color(0x8a5a34);
const _lidOpen = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -1.9);
/** Salvaged wreckage is gone; an opened supply capsule stays where it landed, lid up, strobe dark. */
export function syncPod(rec) {
  if (rec.kind !== 'pod') { setSiteShown(rec.group, !rec.taken); setColliders(rec.cols, !rec.taken); return; }
  if (rec.lid) {
    if (!rec.lidRest) rec.lidRest = rec.lid.quaternion.clone();
    rec.lid.quaternion.copy(rec.lidRest);
    if (rec.taken) rec.lid.quaternion.multiply(_lidOpen);
  }
  if (rec.taken) setGlow(rec.strobe, 0);
}
/** The blocks of an ice outcrop go one by one as they are mined; the cracked pavement stays. */
export function syncIce(site) {
  site.blocks.forEach((b, i) => { const on = i < site.left; b.node.visible = on; b.col.r = on ? b.col.r0 : 0.001; });
}
// Make the world's objects match the game state (safe to call after any change or load).
export function syncAllVisuals() {
  for (const pl of World.plots) syncPlot(pl);
  // dust on a panel dulls and reddens its cells
  for (const p of World.panels) {
    const d = clamp(p.dust, 0, 1);
    for (const m of p.cells) {
      if (!m.userData.clean) m.userData.clean = { color: m.color.clone(), rough: m.roughness, metal: m.metalness };
      const c = m.userData.clean;
      m.color.copy(c.color).lerp(_dust, d * 0.9);
      m.roughness = c.rough + (0.95 - c.rough) * d;
      m.metalness = c.metal * (1 - d);
    }
  }
  for (const sp of World.soilPiles) {                   // the heap shrinks as it is dug; the last load takes the shovel with it
    setSiteShown(sp.group, sp.left > 0);
    setColliders(sp.cols, sp.left > 0);
    sp.mesh.scale.setScalar(0.55 + 0.225 * sp.left);
  }
  if (World.breachHole) World.breachHole.visible = S.breach.active;
  if (World.breachPatch) World.breachPatch.visible = S.breach.done && !S.breach.active;
  const powered = S.power > 0.5;
  setGlow(World.commsMats, S.pf.connected && powered ? 1 : 0.04);
  setGlow(World.oxyMats, powered ? 1 : 0.05);
  for (const l of World.habLights) l.intensity = powered ? l.userData.on : l.userData.on * 0.05;
  for (const rec of World.pods) syncPod(rec);
  if (World.rtgSite) { setSiteShown(World.rtgSite.group, !World.rtgSite.taken); setColliders(World.rtgSite.cols, !World.rtgSite.taken); }
  for (const site of World.iceSites) syncIce(site);
  for (const b of World.builtMeshes) if (b.tanks) b.tanks.forEach((t, i) => { if (t) t.visible = i < b.charges; });
  // pathfinder: exactly one home per state, collider follows (review finding: all 3 states)
  const pfG = World.pathfinder;
  if (S.pf.connected) {
    if (pfG.parent !== ctx.world) ctx.world.add(pfG);
    siteLocalToWorld(World.hab, 13.5, 0, 5.5, pfG.position);
    pfG.position.normalize().multiplyScalar(surfaceAt(pfG.position));
    frameQuat(_v1.copy(pfG.position).normalize(), 0.3, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 0.001;
    setSiteShown(World.uplinkRing, false);
  } else if (S.pf.loaded) {
    const rack = World.rover.cargo || World.rover.group;
    if (pfG.parent !== rack) {
      rack.add(pfG);
      if (World.rover.cargo) pfG.position.set(0, 0, 0); else pfG.position.set(0, 2.15, -1.1);
      pfG.quaternion.set(0, 0, 0, 1);
      const k = World.pfModel ? 0.5 : 0.8;          // the real lander is wider than the rack: stow it folded small
      pfG.scale.set(k, k, k);
    }
    World.pfCollider.r = 0.001;
    setSiteShown(World.uplinkRing, true);
  } else {
    if (pfG.parent !== ctx.world) ctx.world.add(pfG);
    const u = llToVec(19.13, 326.79);
    pfG.position.copy(u).multiplyScalar(surfaceAt(u));
    frameQuat(u, 0.7, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 2.2;
    setSiteShown(World.uplinkRing, false);
  }
}
