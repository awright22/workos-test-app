import * as THREE from 'three';
import { _pv, _q1 } from '../core/scratch.js';
import { angDist, frameQuat, llToVec } from '../planet/geo.js';
import { slopeAt, surfaceAt } from '../planet/surface.js';
import { ctx } from '../game/ctx.js';
import { R } from '../planet/constants.js';
import { S } from '../game/state.js';
import { hash3, srand } from '../core/math.js';
import { buildModel } from './models.js';
import { LANDERS } from '../planet/features.js';
import { Snd } from '../audio/sound.js';
import { log } from '../ui/dom.js';
// Builds everything that stands on the planet: the Hab colony, the rover, story sites,
// historic landers, ice, deployables and supply pods; and the collider list.
export const World = { plots: [], panels: [], soilPiles: [], landers: [], iceSites: [], builtMeshes: [],
  markers: [], pods: [] };
export const colliders = [];                 // { v: unitVec, r: meters, group?: hab }
export function placeAt(latOrVec, lon, yaw) {
  const g = new THREE.Group();
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
  const yaw = 0;
  World.hab = placeAt(spawn.lat, spawn.lon, yaw);
  World.hab = World.hab;
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xcfc0a8, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(HAB_R, HAB_R, 3.4, 40, 1, true, DOOR_HALF, Math.PI * 2 - DOOR_HALF * 2), wallMat);
  wall.position.y = 1.7;
  World.hab.add(wall);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(HAB_R, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), wallMat);
  dome.scale.y = 0.55; dome.position.y = 3.4;
  World.hab.add(dome);
  const fx = Math.sin(DOOR_HALF) * HAB_R, fz = Math.cos(DOOR_HALF) * HAB_R;
  mkBox(0.25, 2.6, 0.5, 0x8a8378, fx, 1.3, fz, World.hab);
  mkBox(0.25, 2.6, 0.5, 0x8a8378, -fx, 1.3, fz, World.hab);
  mkBox(2 * fx + 0.25, 0.9, 0.5, 0x8a8378, 0, 2.95, fz, World.hab);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(HAB_R - 0.05, 40),
    new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.06;
  World.hab.add(floor);
  mkCyl(0.05, 0.07, 1.0, 0x8a8378, 0, 8.3, 0, World.hab, 6);   // beacon mast on the dome apex
  World.beacon = mkBox(0.26, 0.26, 0.26, 0x33ff66, 0, 8.9, 0, World.hab, { emissive: 0x33ff66 });
  const l1 = new THREE.PointLight(0xffe6c8, 70, 26, 2); l1.position.set(0, 3.0, 0); World.hab.add(l1);
  const l2 = new THREE.PointLight(0xffd9b0, 30, 18, 2); l2.position.set(3, 2.4, -4); World.hab.add(l2);
  World.habLights = [l1, l2];

  // farm plots (6 base; greenhouses add more)
  for (let i = 0; i < 6; i++) {
    const px = -5.2 + (i % 2) * 2.0, pz = -3.2 + Math.floor(i / 2) * 2.4;
    addFarmPlot(World.hab, px, pz, true);
  }

  // equipment
  const oxy = new THREE.Group(); oxy.position.set(5.6, 0.06, -3.6); World.hab.add(oxy);
  mkBox(1.6, 2.0, 1.1, 0x7a8a92, 0, 1.0, 0, oxy);
  World.oxyLight = mkBox(0.16, 0.16, 0.1, 0x33ff66, 0.4, 1.6, 0.58, oxy, { emissive: 0x33ff66 });
  mkCyl(0.1, 0.1, 1.6, 0x5a6a72, -0.5, 2.4, 0, oxy);
  World.oxygenator = oxy;
  addColliderAt(World.hab, 5.6, -3.6, 1.1);

  const rec = new THREE.Group(); rec.position.set(5.9, 0.06, -0.4); World.hab.add(rec);
  mkBox(1.3, 1.2, 1.0, 0x6a7a88, 0, 0.6, 0, rec);
  mkCyl(0.45, 0.45, 1.5, 0x4a7ab0, 0, 1.95, 0, rec, 12);
  World.reclaimer = rec;
  addColliderAt(World.hab, 5.9, -0.4, 0.95);

  const hyd = new THREE.Group(); hyd.position.set(5.5, 0.06, 2.6); World.hab.add(hyd);
  mkCyl(0.5, 0.5, 1.4, 0xb0a24a, 0, 0.7, 0, hyd, 12);
  mkBox(0.9, 0.5, 0.7, 0x4a4a4a, 0, 0.25, 0.85, hyd);
  World.hydFlame = mkCyl(0.12, 0.26, 0.5, 0xffa030, 0, 0.75, 0.85, hyd, 8, { emissive: 0xff7020 });
  World.hydFlame.visible = false;
  World.hydrazineRig = hyd;
  addColliderAt(World.hab, 5.5, 2.6, 0.95);

  const comms = new THREE.Group(); comms.position.set(0, 0.06, -6.6); World.hab.add(comms);
  mkBox(2.4, 0.1, 1.0, 0x8a8378, 0, 0.85, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, -1.0, 0.42, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, 1.0, 0.42, 0, comms);
  World.commsScreen = mkBox(1.5, 0.9, 0.08, 0x101418, 0, 1.55, -0.15, comms, { emissive: 0x000000 });
  World.comms = comms;
  addColliderAt(World.hab, 0, -6.6, 1.2);

  const bunk = new THREE.Group(); bunk.position.set(-5.0, 0.06, -4.9); World.hab.add(bunk);
  mkBox(1.1, 0.4, 2.3, 0x7a7268, 0, 0.2, 0, bunk);
  mkBox(1.0, 0.18, 2.1, 0xa89a80, 0, 0.5, 0, bunk);
  mkBox(0.8, 0.16, 0.5, 0xcfc0a8, 0, 0.6, -0.75, bunk);
  World.bunk = bunk;
  addColliderAt(World.hab, -5.0, -4.9, 1.1);

  const shelf = new THREE.Group(); shelf.position.set(4.2, 0.06, 4.8); World.hab.add(shelf);
  mkBox(1.8, 1.7, 0.6, 0x7a7268, 0, 0.85, 0, shelf);
  for (let i = 0; i < 6; i++)
    mkBox(0.4, 0.3, 0.4, 0xc0842f, -0.6 + (i % 3) * 0.6, 0.5 + Math.floor(i / 3) * 0.75, 0.12, shelf);
  World.shelf = shelf;
  addColliderAt(World.hab, 4.2, 4.8, 1.0);

  // workbench / fabricator
  const bench = new THREE.Group(); bench.position.set(-4.6, 0.06, 3.9); World.hab.add(bench);
  mkBox(2.0, 0.95, 0.9, 0x6a655c, 0, 0.48, 0, bench);
  mkBox(0.5, 0.35, 0.5, 0xb0762f, -0.5, 1.13, 0, bench);
  mkCyl(0.06, 0.06, 0.8, 0x9a9a9a, 0.5, 1.35, 0, bench, 6);
  World.bench = bench;
  addColliderAt(World.hab, -4.6, 3.9, 1.1);

  // breach hole + patch (hidden until the event)
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.75, 20),
    new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide }));
  hole.position.set(0, 1.7, -HAB_R + 0.02);
  hole.visible = false;
  World.hab.add(hole);
  World.breachHole = hole;
  const patch = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xb0b0b8, side: THREE.DoubleSide }));
  patch.position.set(0, 1.7, -HAB_R + 0.04);
  patch.visible = false;
  World.hab.add(patch);
  World.breachPatch = patch;

  // solar array, in its own group beside the hab
  const solar = placeOffset(World.hab, -30, 4, 0);
  for (let i = 0; i < 8; i++) {
    const px = -Math.floor(i / 4) * 5.5, pz = (i % 4) * 4.6;
    const g = new THREE.Group(); g.position.set(px, 0, pz); solar.add(g);
    mkCyl(0.14, 0.18, 1.1, 0x5a5a5a, 0, 0.55, 0, g, 8);
    const panel = mkBox(3.4, 0.1, 2.2, 0x1c2c50, 0, 1.15, 0, g);
    panel.rotation.x = -0.42;
    panel.material = panel.material.clone();
    addColliderAt(solar, px, pz, 1.0);
    World.panels.push({ mesh: panel, dust: 0.22 + i * 0.05, group: g });
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
  mkCyl(0.1, 0.14, 1.3, 0x6a6a6a, 0, 0.65, 0, up, 8);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new THREE.MeshLambertMaterial({ color: 0xd8d0c0, side: THREE.DoubleSide }));
  dish.position.y = 1.5; dish.rotation.x = -0.9;
  up.add(dish);
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
  g.position.copy(u).multiplyScalar(surfaceAt(u));
  frameQuat(u, yaw || 0, g.quaternion);
  g.userData.up = u.clone();
  ctx.world.add(g);
  return g;
}

export function addFarmPlot(parent, px, pz, collide) {
  const plot = new THREE.Group();
  plot.position.set(px, 0.06, pz);
  parent.add(plot);
  mkBox(1.6, 0.34, 1.9, 0x6b6459, 0, 0.17, 0, plot);
  const soil = mkBox(1.42, 0.3, 1.72, 0x3a2418, 0, 0.24, 0, plot);
  soil.visible = false;
  const plants = new THREE.Group();
  plants.position.y = 0.4;
  plot.add(plants);
  for (let p = 0; p < 4; p++) {
    const stem = mkCyl(0.02, 0.03, 0.3, 0x3f7a2f, (p % 2) * 0.7 - 0.35, 0.15, Math.floor(p / 2) * 0.8 - 0.4, plants, 6);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0x4e9a3a }));
    leaf.position.y = 0.32; leaf.scale.y = 0.75;
    stem.add(leaf);
  }
  plants.visible = false;
  if (collide) addColliderAt(parent, px, pz, 0.85);
  const worldPos = new THREE.Vector3(px, 0, pz).applyQuaternion(parent.quaternion).add(parent.position);
  World.plots.push({ group: plot, soilMesh: soil, plants, worldPos,
    state: 'empty', crop: 'potato', growth: 0, watered: 0 });
  return World.plots[World.plots.length - 1];
}

// ============================================================
// 10. ROVER, PATHFINDER, MAV, LANDERS, ICE
// ============================================================
export function buildRover(group) {
  const model = buildModel('rover');
  group.add(model);
  const wheels = [];
  for (let i = 0; i < 6; i++) wheels.push(model.getObjectByName('wheel' + i));
  const hl = new THREE.SpotLight(0xfff2d8, 0, 90, 0.55, 0.5, 1.6);
  hl.position.set(0, 1.6, -2.1);
  group.add(hl);
  const hlT = new THREE.Object3D(); hlT.position.set(0, 0.6, -14);
  group.add(hlT); hl.target = hlT;
  World.rover = { group, wheels, headlight: hl, speed: 0 };
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
  const pad = new THREE.Mesh(new THREE.CircleGeometry(7, 24),
    new THREE.MeshLambertMaterial({ color: 0x5a5a5a }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.08;
  mav.add(pad);
  const rocket = buildModel('mav');
  rocket.position.y = 0.1;
  mav.add(rocket);
  World.mavNose = rocket.getObjectByName('nose');
  World.mavStrobe = rocket.getObjectByName('strobe');
  const flame = mkCyl(0.9, 0.25, 5, 0xffc060, 0, -1.8, 0, rocket, 10,
    { emissive: 0xff9030, transparent: true, opacity: 0.95 });
  flame.visible = false;
  World.mavFlame = flame;
  World.mav = mav;
  World.mavRocket = rocket;
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
