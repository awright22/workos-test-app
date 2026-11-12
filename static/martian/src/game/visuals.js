import * as THREE from 'three';
import { World, siteLocalToWorld } from '../world/build.js';
import { syncPlot } from './interactables.js';
import { clamp } from '../core/math.js';
import { S } from './state.js';
import { ctx } from './ctx.js';
import { surfaceAt } from '../planet/surface.js';
import { frameQuat, llToVec } from '../planet/geo.js';
import { _v1 } from '../core/scratch.js';
// Make the world's objects match the game state (safe to call after any change or load).
export function syncAllVisuals() {
  for (const pl of World.plots) syncPlot(pl);
  for (const p of World.panels)
    p.mesh.material.color.set(new THREE.Color(0x1c2c50).lerp(new THREE.Color(0x8a5a34), clamp(p.dust, 0, 1)));
  for (const sp of World.soilPiles) {
    sp.mesh.visible = sp.left > 0;
    const sc = 0.6 + sp.left * 0.35;
    sp.mesh.scale.set(sc, sc * 0.55, sc);
  }
  World.breachHole.visible = S.breach.active;
  World.breachPatch.visible = S.breach.done && !S.breach.active;
  World.commsScreen.material.emissive.set(S.pf.connected ? 0x2a4a7a : 0x000000);
  World.oxyLight.material.emissive.set(S.power > 0.5 ? 0x33ff66 : 0x331111);
  for (const l of World.habLights) l.intensity = S.power > 0.5 ? (l === World.habLights[0] ? 70 : 30) : 4;
  for (const rec of World.pods) rec.group.visible = !rec.taken;
  if (World.rtgSite) World.rtgSite.group.visible = !World.rtgSite.taken;
  for (const site of World.iceSites) site.group.visible = site.left > 0;
  // pathfinder: exactly one home per state, collider follows (review finding: all 3 states)
  const pfG = World.pathfinder;
  if (S.pf.connected) {
    if (pfG.parent !== ctx.world) ctx.world.add(pfG);
    siteLocalToWorld(World.hab, 13.5, 0, 5.5, pfG.position);
    pfG.position.normalize().multiplyScalar(surfaceAt(pfG.position));
    frameQuat(_v1.copy(pfG.position).normalize(), 0.3, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 0.001;
    World.uplinkRing.visible = false;
  } else if (S.pf.loaded) {
    if (pfG.parent !== World.rover.group) {
      World.rover.group.add(pfG);
      pfG.position.set(0, 2.15, -1.1);
      pfG.quaternion.set(0, 0, 0, 1);
      pfG.scale.set(0.8, 0.8, 0.8);
    }
    World.pfCollider.r = 0.001;
    World.uplinkRing.visible = true;
  } else {
    if (pfG.parent !== ctx.world) ctx.world.add(pfG);
    const u = llToVec(19.13, 326.79);
    pfG.position.copy(u).multiplyScalar(surfaceAt(u));
    frameQuat(u, 0.7, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 2.2;
    World.uplinkRing.visible = false;
  }
}
