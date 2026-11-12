import * as THREE from 'three';
import { _pv, _q1 } from '../core/scratch.js';
import { angDist, frameQuat, llToVec } from '../planet/geo.js';
import { slopeAt, surfaceAt } from '../planet/surface.js';
import { ctx } from '../game/ctx.js';
import { R } from '../planet/constants.js';
import { S } from '../game/state.js';
import { hash3, srand } from '../core/math.js';
import { buildModel, colliderAnchors, hasModel, model, ownMaterials } from './models.js';
import { LANDERS } from '../planet/features.js';
import { Snd } from '../audio/sound.js';
import { log } from '../ui/dom.js';
// Builds everything that stands on the planet: the Hab colony, the rover, story sites,
// historic landers, ice, deployables and supply pods; and the collider list.
export const World = { plots: [], panels: [], soilPiles: [], landers: [], iceSites: [], builtMeshes: [],
  markers: [], pods: [] };
export const colliders = [];                 // { v: unitVec, r: meters, group?: hab }
/** Everything placed on the planet; drawn only when near enough to matter (updateSites). */
export const sites = [];
export function placeAt(latOrVec, lon, yaw) {
  const g = new THREE.Group();
  sites.push(g);
  const u = latOrVec.isVector3 ? _pv.copy(latOrVec).normalize().clone() : llToVec(latOrVec, lon);
  const r = surfaceAt(u);
  g.position.copy(u).multiplyScalar(r);
  frameQuat(u, yaw || 0, g.quaternion);
  g.userData.up = u.clone();
  ctx.world.add(g);
  return g;
}
export function addColliderAt(group, lx, lz, r) {
  // math-space transform: never rely on matrixWorld (ctx.world shifts each frame)
  const w = new THREE.Vector3(lx, 0, lz).applyQuaternion(group.quaternion).add(group.position);
  colliders.push({ v: w.normalize().clone(), r });
}
export function mkBox(w, h, d, color, x, y, z, parent, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {})));
  m.position.set(x, y, z);
  (parent || ctx.world).add(m);
  return m;
}
export function mkCyl(rt, rb, h, color, x, y, z, parent, seg, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14),
    new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {})));
  m.position.set(x, y, z);
  (parent || ctx.world).add(m);
  return m;
}
export const HAB_R = 8.4;
export const HAB_FLOOR = 0.06;
export const DOOR_HALF = 0.16;

export function pickSpawn(rng) {
  for (let tries = 0; tries < 200; tries++) {
    const lat = (rng() * 2 - 1) * 52;
    const lon = rng() * 360;
    const u = llToVec(lat, lon);
    if (slopeAt(u) > 0.28) continue;                                  // too steep for a colony
    const pf = llToVec(19.13, 326.79), mav = llToVec(-2.71, 16.77);
    if (angDist(u.x, u.y, u.z, pf.x, pf.y, pf.z) * R < 2500) continue; // keep the story a road trip
    if (angDist(u.x, u.y, u.z, mav.x, mav.y, mav.z) * R < 2500) continue;
    let stormed = false;
    for (const c of (S.storm.cells || [])) {
      const cv = llToVec(c.lat, c.lon);
      if (angDist(u.x, u.y, u.z, cv.x, cv.y, cv.z) * R < c.r + 2500) { stormed = true; break; }
    }
    if (stormed) continue;                        // don't found a colony inside a dust cell
    return { lat, lon, v: u };
  }
  return { lat: 18, lon: 340, v: llToVec(18, 340) };                  // safe fallback
}

export function buildHabColony(spawn) {
  World.hab = placeAt(spawn.lat, spawn.lon, 0);
  World.hab.position.addScaledVector(World.hab.userData.up, -HAB_FLOOR);     // the model's floor sits HAB_FLOOR above its origin
  const hab = model('hab');
  World.hab.add(hab.root);
  World.habModel = hab;
  // furniture and machines carry their own collision circles
  for (const c of colliderAnchors(hab)) {
    c.node.updateWorldMatrix(true, false);
    const w = c.node.getWorldPosition(new THREE.Vector3());          // hab-local (the Hab group is not yet moved by a parent)
    const local = World.hab.worldToLocal(w);
    addColliderAt(World.hab, local.x, local.z, c.r);
  }
  // parts the game drives
  World.beaconMats = ownMaterials(hab.part('beacon'));
  World.oxyMats = ownMaterials(hab.part('status_oxy'));
  World.commsMats = ownMaterials(hab.part('comms_screen'));
  World.hydFlame = hab.part('hydrazine_flame');
  World.breachHole = hab.part('breach_hole');
  World.breachPatch = hab.part('breach_patch');
  for (const n of [World.hydFlame, World.breachHole, World.breachPatch]) if (n) n.visible = false;
  World.habInterior = hab.part('interior');
  // the dome's own shadow covers the room: nothing inside needs to cast one
  if (World.habInterior) World.habInterior.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  World.hab.userData.reach = 6000;                 // home is visible from a long way off
  World.habFurnishings = new THREE.Group();        // farm trays and other things only seen from inside
  World.hab.add(World.habFurnishings);
  World.doors = ['door_outer_L', 'door_outer_R', 'door_inner_L', 'door_inner_R'].map((n) => {
    const d = hab.part(n);
    return d ? { node: d, x0: d.position.x, dx: d.userData.open_dx || (n.endsWith('_L') ? -1.05 : 1.05), k: 0, outer: n.includes('outer') } : null;
  }).filter(Boolean);
  // room lights: a few real lights at the fixtures (fewer on low quality), the rest just glow
  World.habLights = [];
  const names = ctx.engine.q.scale < 0.7 ? ['light_0', 'light_2'] : ['light_0', 'light_1', 'light_2', 'light_3'];
  for (const n of names) {
    const anchor = hab.part(n);
    if (!anchor) continue;
    const l = new THREE.PointLight(0xffe4c4, 15, 26, 1.6);
    l.userData.on = 15;
    anchor.add(l);
    World.habLights.push(l);
  }

  // farm plots (6 base; greenhouses add more)
  for (let i = 0; i < 6; i++) {
    const px = -5.2 + (i % 2) * 2.0, pz = -3.2 + Math.floor(i / 2) * 2.4;
    addFarmPlot(World.hab, px, pz, true, World.habFurnishings);
  }

  // solar array, in its own group beside the hab
  const solar = placeOffset(World.hab, -30, 4, 0);
  for (let i = 0; i < 8; i++) {
    const px = -Math.floor(i / 4) * 5.5, pz = (i % 4) * 4.6;
    const g = new THREE.Group(); g.position.set(px, 0, pz); solar.add(g);
    let rec;
    if (hasModel('solar_panel')) {
      const m = model('solar_panel');
      g.add(m.root);
      const cells = ownMaterials(m.part('panel') || m.root).filter((x) => x.name === 'solar_cell');
      rec = { mesh: m.part('panel') || m.root, cells, dust: 0.22 + i * 0.05, group: g };
    } else {
      mkCyl(0.14, 0.18, 1.1, 0x5a5a5a, 0, 0.55, 0, g, 8);
      const panel = mkBox(3.4, 0.1, 2.2, 0x1c2c50, 0, 1.15, 0, g);
      panel.rotation.x = -0.42;
      panel.material = panel.material.clone();
      rec = { mesh: panel, cells: [panel.material], dust: 0.22 + i * 0.05, group: g };
    }
    addColliderAt(solar, px, pz, 1.0);
    World.panels.push(rec);
  }
  World.solarGroup = solar;

  // rover
  buildRover(placeOffset(World.hab, 15, 15, 2.6));

  // regolith piles
  for (const [x, z] of [[22, -8], [26, 6], [-14, 24], [8, 27], [-24, -16], [16, -22]]) {
    const g = placeOffset(World.hab, x, z, 0);
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0x6e3418 }));
    m.position.y = -0.5; m.scale.y = 0.55;
    g.add(m);
    World.soilPiles.push({ mesh: m, group: g, left: 2 });
  }

  // uplink dish + pathfinder parking ring
  const up = placeOffset(World.hab, 11.5, 7.5, 0);
  if (hasModel('uplink_dish')) up.add(model('uplink_dish').root);
  else {
    mkCyl(0.1, 0.14, 1.3, 0x6a6a6a, 0, 0.65, 0, up, 8);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.6),
      new THREE.MeshStandardMaterial({ color: 0xd8d0c0, side: THREE.DoubleSide }));
    dish.position.y = 1.5; dish.rotation.x = -0.9;
    up.add(dish);
  }
  World.uplink = up;
  colliders.push({ v: up.position.clone().normalize(), r: 0.8 });
  const ringG = placeOffset(World.hab, 7.0, 9.5, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0xffb45e }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.12;
  ringG.add(ring);
  World.uplinkRing = ringG;

  // crash debris trail (starter scrap) + buried RTG site
  for (let i = 0; i < 3; i++) {
    const ang = 0.7 + i * 0.5, dist = 60 + i * 45;
    const g = placeOffset(World.hab, Math.sin(ang) * dist, Math.cos(ang) * dist, srand() * 6);
    const m = mkBox(1.4 + srand(), 0.5, 1.0 + srand(), 0x8a8a92, 0, 0.25, 0, g);
    m.rotation.z = srand() * 0.5;
    World.pods.push({ group: g, kind: 'debris', taken: false, loot: { scrap: 2 }, label: 'Salvage MDV debris' });
  }
  const rtg = placeOffset(World.hab, -420, 590, 0);
  const rtgModel = buildModel('rtgUnit');
  rtgModel.rotation.z = 0.25;
  rtg.add(rtgModel);
  World.rtgSite = { group: rtg, taken: false };
}

// place a child group at a local tangent offset from a parent site, re-snapped to the terrain
/** Show or hide a placed thing for game reasons (taken, used up); distance culling still applies. */
export function setSiteShown(g, shown) { g.userData.hidden = !shown; g.visible = shown && g.userData.near !== false; }
const _sv = new THREE.Vector3();
/** Show only the sites that are near enough to see: within their reach and above the horizon. */
export function updateSites(camPos) {
  const camR = camPos.length();
  const horizon = Math.sqrt(Math.max(0, camR * camR - (R - 130) * (R - 130)));
  for (const g of sites) {
    if (g.parent !== ctx.world) continue;                 // riding on something else (Pathfinder on the rover)
    const d = _sv.copy(g.position).sub(camPos).length();
    const reach = g.userData.reach || 1800;
    g.userData.near = World.sealedInside ? g === World.hab : d < Math.min(reach, horizon + 700);
    if (g.userData.hidden) g.visible = false; else if (g.userData.near !== g.visible) g.visible = g.userData.near;
  }
}

/** Airlock doors slide open as someone approaches; the interior is skipped when far away. */
export function updateDoors(dt) {
  if (!World.hab || !World.doors) return;
  const pos = S.mode === 'rover' ? World.rover.group.position : (World.playerPos || World.hab.position);
  const local = siteWorldToLocal(World.hab, pos, _pv);
  const dist = Math.hypot(local.x, local.z);
  // the room is only drawn from inside, from the airlock, or looking in through the open door
  const lookingIn = Math.abs(local.x) < 5 && local.z > 0 && local.z < 26;
  const showRoom = dist < HAB_R + 0.5 || lookingIn;
  if (World.habInterior) World.habInterior.visible = showRoom;
  if (World.habFurnishings) World.habFurnishings.visible = showRoom;
  // sealed in: inside the room with every door shut, so nothing outside can be seen
  World.sealedInside = S.mode === 'walk' && dist < HAB_R - 0.3 && World.doors.every((d) => d.k < 0.01);
  for (const d of World.doors) {
    const dz = local.z - (d.outer ? 11.6 : HAB_R);
    const near = Math.abs(local.x) < 2.6 && Math.abs(dz) < 3.4 && S.mode === 'walk';
    const target = near ? 1 : 0;
    d.k += Math.sign(target - d.k) * Math.min(Math.abs(target - d.k), dt * 2.2);
    const e = d.k * d.k * (3 - 2 * d.k);
    d.node.position.x = d.x0 + d.dx * e;
  }
}

/** Level the ground under everything that is built at a fixed place. Call before placing. */
export function addSitePads(spawn) {
  const P = ctx.planet;
  const pad = (v, r, blend) => P.addPad(v.x, v.y, v.z, r, blend);
  pad(spawn.v, 46, 34);                                   // the colony: Hab, array, rover park
  pad(llToVec(19.13, 326.79), 7, 10);                     // Pathfinder
  pad(llToVec(-1.9, 15.9), 16, 18);                       // the MAV
  for (const L of LANDERS) if (L.name !== 'Pathfinder') pad(L.v, 6, 9);
  ctx.terrain.syncPads(P.pads);
}

export function placeOffset(parentGroup, lx, lz, yaw) {
  const w = new THREE.Vector3(lx, 0, lz).applyQuaternion(parentGroup.quaternion).add(parentGroup.position);
  const u = w.normalize().clone();
  const g = new THREE.Group();
  sites.push(g);
  g.position.copy(u).multiplyScalar(surfaceAt(u));
  frameQuat(u, yaw || 0, g.quaternion);
  g.userData.up = u.clone();
  ctx.world.add(g);
  return g;
}

export function addFarmPlot(parent, px, pz, collide, holder) {
  const plot = new THREE.Group();
  plot.position.set(px, 0.06, pz);
  (holder || parent).add(plot);
  let soil, plants, dead = null;
  if (hasModel('farm_plot')) {
    const m = model('farm_plot');
    plot.add(m.root);
    soil = m.part('soil'); plants = m.part('plants'); dead = m.part('plants_dead');
    if (dead) dead.visible = false;
  } else {
    mkBox(1.6, 0.34, 1.9, 0x6b6459, 0, 0.17, 0, plot);
    soil = mkBox(1.42, 0.3, 1.72, 0x3a2418, 0, 0.24, 0, plot);
    plants = new THREE.Group();
    plants.position.y = 0.4;
    plot.add(plants);
    for (let p = 0; p < 4; p++) {
      const stem = mkCyl(0.02, 0.03, 0.3, 0x3f7a2f, (p % 2) * 0.7 - 0.35, 0.15, Math.floor(p / 2) * 0.8 - 0.4, plants, 6);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0x4e9a3a }));
      leaf.position.y = 0.32; leaf.scale.y = 0.75;
      stem.add(leaf);
    }
  }
  soil.visible = false;
  plants.visible = false;
  if (collide) addColliderAt(parent, px, pz, 0.85);
  const worldPos = new THREE.Vector3(px, 0, pz).applyQuaternion(parent.quaternion).add(parent.position);
  World.plots.push({ group: plot, soilMesh: soil, plants, plantsDead: dead, worldPos,
    state: 'empty', crop: 'potato', growth: 0, watered: 0 });
  return World.plots[World.plots.length - 1];
}

// ============================================================
// ROVER, PATHFINDER, MAV, LANDERS, ICE
// ============================================================
export const WHEEL_RADIUS = 0.62;
export function buildRover(group) {
  const m = model('rover', { face: true });
  group.add(m.root);
  const wheels = ['wheel_FL', 'wheel_ML', 'wheel_RL', 'wheel_FR', 'wheel_MR', 'wheel_RR'].map((n) => m.part(n)).filter(Boolean);
  const steer = { FL: m.part('steer_FL'), FR: m.part('steer_FR'), RL: m.part('steer_RL'), RR: m.part('steer_RR') };
  // one spotlight between the two headlamps, aimed down the road (the model's front is its +Z)
  const hl = new THREE.SpotLight(0xfff2d8, 0, 110, 0.6, 0.55, 1.5);
  const a = m.part('headlight_L'), b = m.part('headlight_R');
  const at = new THREE.Vector3(0, 1.4, 2.6);
  if (a && b) { m.inner.updateWorldMatrix(true, true); at.copy(a.getWorldPosition(new THREE.Vector3())).add(b.getWorldPosition(new THREE.Vector3())).multiplyScalar(0.5); m.inner.worldToLocal(at); }
  hl.position.copy(at);
  const hlT = new THREE.Object3D(); hlT.position.set(at.x, at.y - 1.2, at.z + 16);
  m.inner.add(hl, hlT); hl.target = hlT;
  const lamps = [];
  m.inner.traverse((o) => { if (o.isMesh && !Array.isArray(o.material) && /^light_(white|red|amber)/.test(o.material.name)) { o.material = o.material.clone(); o.material.userData.baseEmissive = o.material.emissiveIntensity || 1; lamps.push(o.material); } });
  World.rover = { group, wheels, steer, headlight: hl, lamps, speed: 0, model: m, cargo: m.part('cargo'), seat: m.part('seat'), dish: m.part('dish') };
  World.roverCollider = { v: group.position.clone().normalize(), r: 2.6 };
  colliders.push(World.roverCollider);
}

export function buildStorySites() {
  // Pathfinder at its real landing site (Ares Vallis)
  const pf = placeAt(19.13, 326.79, 0.7);
  pf.add(buildModel('pathfinder'));
  World.pathfinder = pf;
  World.pfCollider = { v: pf.position.clone().normalize(), r: 2.2 };
  colliders.push(World.pfCollider);

  // Ares 4 MAV waits inside Schiaparelli crater
  const mav = placeAt(-1.9, 15.9, 0);
  const mm = model('mav');
  mav.add(mm.root);
  World.mavRocket = mm.part('ascent');
  World.mavRocketY = World.mavRocket.position.y;
  World.mavNose = mm.part('nose');
  World.mavStrobeMats = ownMaterials(mm.part('strobe'));
  const flameAt = mm.part('flame');
  const flame = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.2, 7, 14, 1, true),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 4.2, 1.2), transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  flame.position.y = -3.5;
  (flameAt || World.mavRocket).add(flame);
  flame.visible = false;
  World.mavFlame = flame;
  World.mav = mav;
  mav.userData.reach = 9000;                       // a 15 m rocket shows from far off
  colliders.push({ v: mav.position.clone().normalize(), r: 3.4 });

  // every real lander, at its real coordinates
  for (const L of LANDERS) {
    if (L.name === 'Pathfinder') { World.landers.push({ data: L, group: pf }); continue; }
    const g = placeAt(L.lat, L.lon, srand() * 6);
    const isRover = ['Spirit', 'Opportunity', 'Curiosity', 'Perseverance', 'Zhurong', 'Sojourner'].includes(L.name);
    g.add(buildModel(isRover ? 'roverGeneric' : 'landerGeneric', 0.85 + hash3(L.lat | 0, L.lon | 0, 7) * 0.4));
    if (L.name === 'Perseverance') {   // Ingenuity!
      mkBox(0.42, 0.14, 0.42, 0x9ab0c0, 2.4, 0.28, 1.5, g);
      mkBox(1.0, 0.03, 0.12, 0x2a2a2a, 2.4, 0.44, 1.5, g).rotation.y = 0.7;
    }
    colliders.push({ v: g.position.clone().normalize(), r: 1.6 });
    World.landers.push({ data: L, group: g });
  }

  // ice deposits: Korolev + northern-lowland fields
  const iceSpots = [[72.77, 164.58]];
  for (let i = 0; i < 11; i++) iceSpots.push([42 + hash3(i, 7, 1) * 32, hash3(i, 3, 9) * 360]);
  for (const [la, lo] of iceSpots) {
    const g = placeAt(la, lo, 0);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + hash3(i, la, lo) * 0.8, 0),
        new THREE.MeshLambertMaterial({ color: 0xd8ecf4, emissive: 0x223038 }));
      m.position.set((hash3(i, 2, la) - 0.5) * 6, 0.3, (hash3(i, 5, lo) - 0.5) * 6);
      g.add(m);
    }
    World.iceSites.push({ group: g, left: 6, korolev: la > 70 });
  }
}

// deployable buildables
export function buildDeployable(kind, atVec) {
  const g = placeAt(atVec);
  if (kind === 'solar') {
    g.add(buildModel('solarDeploy'));
  } else if (kind === 'greenhouse') {
    g.add(buildModel('greenhouse'));
    const fl = new THREE.Mesh(new THREE.CircleGeometry(4.1, 18),
      new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = 0.05;
    g.add(fl);
    for (let i = 0; i < 4; i++)
      addFarmPlot(g, -1.1 + (i % 2) * 2.2, -1.2 + Math.floor(i / 2) * 2.4, false);
  } else if (kind === 'beacon') {
    g.add(buildModel('beacon'));
  } else if (kind === 'cache') {
    g.add(buildModel('o2cache'));
  }
  const b = { kind, group: g, v: g.position.clone().normalize(), charges: kind === 'cache' ? 3 : 0 };
  World.builtMeshes.push(b);
  return b;
}

// supply pod (quest rewards) — lands near the hab
export function dropSupplyPod(loot, label) {
  const ang = srand() * Math.PI * 2, dist = 40 + srand() * 30;
  const g = placeOffset(World.hab, Math.sin(ang) * dist, Math.cos(ang) * dist, 0);
  g.add(buildModel('supplyPod'));
  const pod = { group: g, kind: 'pod', taken: false, loot, label: label || 'Open supply pod' };
  World.pods.push(pod);
  Snd.jingle();
  log('Supply pod down, ' + Math.round(dist) + 'm out. NASA delivers. No tip expected.', 'nasa');
  return pod;
}
export function siteLocalToWorld(group, lx, ly, lz, out) {
  return (out || new THREE.Vector3()).set(lx, ly, lz).applyQuaternion(group.quaternion).add(group.position);
}
export function siteWorldToLocal(group, p, out) {
  out = (out || new THREE.Vector3()).copy(p).sub(group.position);
  return out.applyQuaternion(_q1.copy(group.quaternion).invert());
}
