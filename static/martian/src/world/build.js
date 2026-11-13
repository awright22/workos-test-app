import * as THREE from 'three';
import { _pv, _q1 } from '../core/scratch.js';
import { angDist, frameQuat, llToVec } from '../planet/geo.js';
import { slopeAt, surfaceAt } from '../planet/surface.js';
import { ctx } from '../game/ctx.js';
import { R } from '../planet/constants.js';
import { S } from '../game/state.js';
import { hash3, srand } from '../core/math.js';
import { colliderAnchors, model, ownMaterials, hasModel } from './models.js';
import { addLamp } from './lamps.js';
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

/** A soft, ragged stain on level ground: scorch under the rocket, trodden soil round the Hab. */
/** Every stain's material and its colour in full light: they are unlit, so the light is put into their colour. */
const stains = [];
/** How much light there is to see a stain by, 0..1 (call each frame). Left at its daylight colour, a dark patch
 *  was paler than the ground round it at night. */
export function setStainLight(k) { for (const st of stains) st.mat.color.copy(st.base).multiplyScalar(k); }
const stainTextures = {};
/**
 * A patch of disturbed ground under something. kind 'soft': darker, packed soil with a ragged edge.
 * kind 'blast': what a descent engine leaves: the bright dust blown off, darker soil laid bare in a ragged patch
 * with short streaks at its edge, darkest in a ring where the plumes struck (seen from orbit under Phoenix and InSight).
 * kind 'scorch': the same under a big rocket, burnt black in the middle.
 * kind 'trodden': the soft patch, walked and driven over for weeks: boot prints by the hundred, thickest in the
 * middle, and the ruts of a rover's comings and goings.
 */
/** The soft patch `base` (a 128-pixel canvas) drawn large, with boot prints and wheel ruts pressed into it. */
function trodden(base) {
  const N = 512, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  // (the packed patch itself faint: at full strength the yard read as a dark smudge with nothing to cast it)
  g.globalAlpha = 0.5; g.drawImage(base, 0, 0, N, N); g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // ruts: pairs of lines a rover's track apart, curving out from the middle
  g.lineWidth = 3.2; g.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    const a0 = rnd() * 6.283, bend = (rnd() - 0.5) * 1.6, len = N * (0.26 + rnd() * 0.2);
    for (const side of [-10.5, 10.5]) {
      g.strokeStyle = `rgba(255,255,255,${0.16 + rnd() * 0.1})`;
      g.beginPath();
      for (let t = 0; t <= 1.001; t += 0.05) {
        const a = a0 + bend * t, r = 18 + len * t, x = N / 2 + Math.cos(a) * r - Math.sin(a) * side, y = N / 2 + Math.sin(a) * r + Math.cos(a) * side;
        if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
  }
  // prints: in pairs, left and right, each a short oval
  for (let k = 0; k < 1300; k++) {
    const a = rnd() * 6.283, r = N * 0.44 * Math.pow(rnd(), 0.8), h = rnd() * 6.283;
    const x = N / 2 + Math.cos(a) * r, y = N / 2 + Math.sin(a) * r;
    g.fillStyle = `rgba(255,255,255,${0.10 + rnd() * 0.16})`;
    for (const side of [-2.2, 2.2]) {
      g.beginPath();
      g.ellipse(x - Math.sin(h) * side + Math.cos(h) * side * 1.4, y + Math.cos(h) * side + Math.sin(h) * side * 1.4, 2.9, 1.3, h, 0, 6.283);
      g.fill();
    }
  }
  return c;
}

export function groundStain(parent, radius, color, opacity, y = 0.03, kind = 'soft') {
  if (!stainTextures[kind]) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), img = g.createImageData(128, 128);
    for (let j = 0; j < 128; j++) for (let i = 0; i < 128; i++) {
      const dx = (i - 63.5) / 64, dy = (j - 63.5) / 64, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      let v;
      if (kind === 'blast' || kind === 'scorch') {
        // a ragged patch, not a star: its edge wanders, and only the outer third breaks into short streaks
        const edge = 0.74 + 0.09 * Math.sin(a * 3 + 0.9) + 0.07 * Math.sin(a * 7 + 2.1) + 0.04 * Math.sin(a * 17 + 0.3);
        const streak = 0.5 + 0.5 * Math.sin(a * 41 + 3 * Math.sin(a * 9 + 1.7));
        const reach = edge * (1 - 0.22 * streak * Math.max(0, Math.min(1, (d - 0.4) / 0.3)));
        const fall = Math.max(0, Math.min(1, (reach - d) / 0.34));
        const ring = Math.exp(-((d - 0.3) / 0.2) * ((d - 0.3) / 0.2));
        v = fall * (kind === 'scorch' ? 0.62 + 0.38 * Math.max(ring, Math.max(0, 1 - d / 0.3)) : 0.5 + 0.5 * ring) * (0.72 + 0.28 * hash3(i >> 1, j >> 1, 5));
      } else {
        const ragged = 0.80 + 0.10 * Math.sin(a * 5 + 1.3) + 0.06 * Math.sin(a * 11 + 0.4) + 0.04 * Math.sin(a * 23);
        v = Math.max(0, Math.min(1, (ragged - d) / 0.42)) * (0.75 + 0.25 * hash3(i, j, 3));
      }
      img.data[(j * 128 + i) * 4] = img.data[(j * 128 + i) * 4 + 1] = img.data[(j * 128 + i) * 4 + 2] = Math.round(v * v * (3 - 2 * v) * 255);
      img.data[(j * 128 + i) * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    if (kind === 'trodden') stainTextures[kind] = new THREE.CanvasTexture(trodden(c));
    else stainTextures[kind] = new THREE.CanvasTexture(c);
    stainTextures[kind].colorSpace = THREE.NoColorSpace;
  }
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color, alphaMap: stainTextures[kind], transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  stains.push({ mat, base: new THREE.Color(color) });
  const m = new THREE.Mesh(geo, mat);
  m.position.y = y; m.renderOrder = 1;
  parent.add(m);
  return m;
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
  // what shows through the portholes from inside: daylight, so it goes with the day and the weather
  World.habViewMats = hab.part('window_view') ? ownMaterials(hab.part('window_view')) : null;
  World.hydFlame = hab.part('hydrazine_flame');
  World.breachHole = hab.part('breach_hole');
  World.breachPos = siteLocalToWorld(World.hab, 0, 0, -HAB_R + 1.2);       // where a breach is sealed from: the far wall
  World.breachPatch = hab.part('breach_patch');
  for (const n of [World.hydFlame, World.breachHole, World.breachPatch]) if (n) n.visible = false;
  World.habInterior = hab.part('interior');
  // By daylight the dome's own shadow covers the room, so nothing inside casts one. Sealed in, it
  // is the other way about: the room casts under its ceiling light and the shell does not (updateDoors).
  if (World.habInterior) World.habInterior.traverse((o) => { if (o.isMesh) { if (!o.castShadow) o.userData.neverCasts = true; o.castShadow = false; } });
  World.habShell = [];
  hab.inner.traverse((o) => {
    if (!o.isMesh || !o.castShadow) return;
    for (let p = o; p; p = p.parent) if (p === World.habInterior) return;
    World.habShell.push(o);
  });
  World.hab.userData.reach = 6000;                 // home is visible from a long way off
  // the yard is trodden and driven on: darker, packed soil in front of the airlock and round the rover's place
  groundStain(World.hab, 15, 0x24120a, 0.5, HAB_FLOOR + 0.03, 'trodden').position.set(5, HAB_FLOOR + 0.03, 15);       // (one patch for the door and the rover's place: each is a draw call)
  groundStain(World.hab, 13.5, 0x1e0f08, 0.55, HAB_FLOOR + 0.02).position.set(0, HAB_FLOOR + 0.02, 0);          // the skirt of packed soil round the Hab itself
  World.habFurnishings = new THREE.Group();        // farm trays and other things only seen from inside
  World.hab.add(World.habFurnishings);
  World.doors = ['door_outer_L', 'door_outer_R', 'door_inner_L', 'door_inner_R'].map((n) => {
    const d = hab.part(n);
    return d ? { node: d, x0: d.position.x, dx: d.userData.open_dx || (n.endsWith('_L') ? -1.05 : 1.05), k: 0, outer: n.includes('outer') } : null;
  }).filter(Boolean);
  // Lamps: every fitting is a source; a small pool of real lights serves the nearest (see lamps.js).
  const powered = () => (S.power > 0.5 ? 1 : 0.05);
  const dark = () => World.dark || 0;
  for (const n of ['light_0', 'light_1', 'light_2', 'light_3']) {
    const a = hab.part(n);
    // Sealed in, most of the ceiling's light comes from the one light that casts shadows (render/engine.js),
    // so things stand on the floor; these then only add the glow near each fitting. With a door open that
    // light is the sun again, and these carry the room.
    // (each strip lights the floor under it and falls off toward the wall: with a reach of twenty-six metres and a slow
    // decay the four of them lit the room as evenly as a shop)
    if (a) addLamp(a, { color: 0xffe4c4, power: 24, range: 12.5, decay: 2.0, level: () => powered() * (World.sealedInside ? 0.8 : 1), room: true });
  }
  // the grow lights over the farm: two pink pools, one for each pair of trays
  for (const [x, z] of [[-4.2, -2.0], [-4.2, 1.0]]) addLamp(hab.root, { offset: new THREE.Vector3(x, 1.7, z), color: 0xff6cc4, power: 4.2, range: 5, level: powered, room: true });
  for (const [n, power, range] of [['lamp_bench', 3.5, 6], ['lamp_bunk', 2.5, 5]]) {
    const a = hab.part(n);
    if (a) addLamp(a, { color: 0xffd9a8, power, range, level: powered, room: true });
  }
  // outside: the porch lamps and the work light by the tanks come on as it gets dark
  const outside = () => dark() * (S.power > 0.5 ? 1 : 0);
  for (const [n, power, range] of [['lamp_door_L', 5, 20], ['lamp_door_R', 5, 20], ['lamp_tanks', 5, 16]]) {
    const a = hab.part(n);
    if (a) {
      // The light itself hangs a pace out from the wall under its fitting. At the wall's own face it burnt the
      // panel white from top to bottom and left the ground at its foot dark: a lamp that lit nothing.
      a.updateWorldMatrix(true, false);
      const lp = hab.root.worldToLocal(a.getWorldPosition(new THREE.Vector3()));
      const out = Math.hypot(lp.x, lp.z) || 1;
      // (a pace and a half out and at waist height: a white wall a hand's breadth from a lamp is five times as bright as
      // sand under it, so the light has to be nearer the ground than the wall for a pool to show)
      lp.x += (lp.x / out) * 2.4; lp.z += (lp.z / out) * 2.4; lp.y = HAB_FLOOR + 1.0;
      addLamp(hab.root, { offset: lp, color: 0xffe2bd, power: power * 1.5, range, level: outside });
    }
  }
  // the fittings themselves glow: outside only in the dark, inside whenever there is power
  World.habLampMats = []; World.habRoomLampMats = [];
  hab.inner.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material) || !/^light_white/.test(o.material.name || '')) return;
    let inRoom = false;
    for (let p = o; p; p = p.parent) if (p === World.habInterior) inRoom = true;
    (inRoom ? World.habRoomLampMats : World.habLampMats).push(...ownMaterials(o));
  });

  // comforts he can make: one model in the Hab's frame, a part for each, shown when it is made (game/visuals.js)
  World.comfortParts = {}; World.comfortLampMats = []; World.comfortCols = {};
  if (hasModel('hab_comforts')) {
    const cm = model('hab_comforts');
    World.habFurnishings.add(cm.root);
    cm.inner.traverse((n) => { if (n.name && /^comfort_[a-z]+$/.test(n.name)) { World.comfortParts[n.name.slice(8)] = n; n.visible = false; } });
    World.comfortLampMats = ownMaterials(cm.root, /^light_warm/);
    for (const c of colliderAnchors(cm)) {
      c.node.updateWorldMatrix(true, false);
      const local = World.hab.worldToLocal(c.node.getWorldPosition(new THREE.Vector3()));
      World.comfortCols[c.name.slice(4)] = [siteCollider(World.hab, local.x, local.z, c.r)];
    }
    // the string lights are a lamp of their own: a warm pool over the table, when there is power and they are up
    const lights = World.comfortParts.lights;
    if (lights) addLamp(World.hab, { offset: new THREE.Vector3(1.75, HAB_FLOOR + 2.4, -2.35), color: 0xffc48a, power: 5, range: 7, room: true, level: () => (lights.visible && S.power > 0.5 ? 1 : 0) });
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
    const m = model('solar_panel');
    g.add(m.root);
    const cells = ownMaterials(m.part('panel') || m.root).filter((x) => x.name === 'solar_cell');
    const rec = { mesh: m.part('panel') || m.root, cells, dust: 0.22 + i * 0.05, group: g };
    addColliderAt(solar, px, pz, 1.0);
    World.panels.push(rec);
  }
  World.solarGroup = solar;

  // rover
  buildRover(placeOffset(World.hab, 15, 15, 2.6));

  // heaps of dug soil to fill the farm trays from
  [[22, -8], [31, 15], [-14, 24], [8, 27], [-24, -16], [16, -22]].forEach        /* clear of the rover's way out of its parking spot */(([x, z], i) => {
    const g = placeOffset(World.hab, x, z, hash3(i, 3, 5) * 6.28);
    const m = addSiteModel(g, 'regolith_pile');
    World.soilPiles.push({ mesh: m.part('heap'), group: g, left: 2, cols: [siteCollider(g, 0, 0, 0.85)] });
  });

  // uplink dish + pathfinder parking ring
  const up = placeOffset(World.hab, 11.5, 7.5, 0);
  up.add(model('uplink_dish').root);
  World.uplink = up;
  colliders.push({ v: up.position.clone().normalize(), r: 1.3 });        // the dish's tripod is wider than its mast
  const ringG = placeOffset(World.hab, 7.0, 9.5, 0);
  const pad = addSiteModel(ringG, 'uplink_pad');
  World.padLampMats = ownMaterials(pad.root, /^light_/);
  World.uplinkRing = ringG;

  // crash debris trail (starter scrap) and the RTG the crew buried well away from the Hab
  for (let i = 0; i < 3; i++) {
    const ang = 0.7 + i * 0.5, dist = 60 + i * 45;
    const g = placeOffset(World.hab, Math.sin(ang) * dist, Math.cos(ang) * dist, srand() * 6);
    const m = addSiteModel(g, ['debris_a', 'debris_b', 'debris_c'][i]);
    World.pods.push({ group: g, kind: 'debris', taken: false, loot: { scrap: 2 }, label: 'Salvage MDV debris', cols: m.cols });
  }
  const rtg = placeOffset(World.hab, -420, 590, 0.6);
  World.rtgSite = { group: rtg, taken: false, cols: addSiteModel(rtg, 'rtg').cols };
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
  if (World.sealedInside !== World.roomCasts) {
    World.roomCasts = World.sealedInside;
    for (const part of [World.habInterior, World.habFurnishings]) if (part) part.traverse((o) => { if (o.isMesh && !o.material.transparent && !(o.userData.neverCasts)) o.castShadow = World.roomCasts; });
    if (World.habShell) for (const o of World.habShell) o.castShadow = !World.roomCasts;
  }
  for (const d of World.doors) {
    const dz = local.z - (d.outer ? 11.6 : HAB_R);
    const near = Math.abs(local.x) < 2.6 && Math.abs(dz) < 3.4 && S.mode === 'walk';
    const target = near ? 1 : 0;
    d.k += Math.sign(target - d.k) * Math.min(Math.abs(target - d.k), dt * 2.2);
    const e = d.k * d.k * (3 - 2 * d.k);
    d.node.position.x = d.x0 + d.dx * e;
  }
  for (const b of World.builtMeshes) {
    const d = b.door;
    if (!d || !d.node || !b.group.visible) continue;
    const p = siteWorldToLocal(b.group, pos, _pv);
    const near = S.mode === 'walk' && Math.abs(p.x) < 2.4 && p.z > GREENHOUSE.wall - 2.6 && p.z < GREENHOUSE.portalEnd + 3.6;
    const target = near ? 1 : 0;
    if (d.k === target) continue;
    d.k += Math.sign(target - d.k) * Math.min(Math.abs(target - d.k), dt * 2.4);
    const e = d.k * d.k * (3 - 2 * d.k);
    d.node.rotation.y = -1.83 * e;
    setColliders(d.cols, d.k < 0.5);
  }
}

/** Level the ground under everything that is built at a fixed place. Call before placing. */
/** Where water ice breaks the surface: Korolev crater and fields across the northern lowlands. */
export function iceSpots() {
  const out = [[72.77, 164.58]];
  for (let i = 0; i < 11; i++) out.push([42 + hash3(i, 7, 1) * 32, hash3(i, 3, 9) * 360]);
  return out;
}

export function addSitePads(spawn) {
  const P = ctx.planet;
  const pad = (v, r, blend) => P.addPad(v.x, v.y, v.z, r, blend);
  pad(spawn.v, 46, 34);                                   // the colony: Hab, array, rover park
  pad(llToVec(19.13, 326.79), 7, 10);                     // Pathfinder
  pad(llToVec(-1.9, 15.9), 16, 18);                       // the MAV
  for (const L of LANDERS) if (L.name !== 'Pathfinder') pad(L.v, 6, 9);
  for (const [la, lo] of iceSpots()) pad(llToVec(la, lo), 4.5, 7);        // an outcrop needs level ground or its blocks float
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
  const m = model('farm_plot');
  plot.add(m.root);
  const soil = m.part('soil'), plants = m.part('plants'), dead = m.part('plants_dead');
  if (dead) dead.visible = false;
  soil.visible = false;
  plants.visible = false;
  if (collide) addColliderAt(parent, px, pz, 0.85);
  const worldPos = new THREE.Vector3(px, 0, pz).applyQuaternion(parent.quaternion).add(parent.position);
  World.plots.push({ group: plot, soilMesh: soil, plants, plantsDead: dead, worldPos, crops: {},
    state: 'empty', crop: 'potato', growth: 0, watered: 0 });
  return World.plots[World.plots.length - 1];
}
/** The living and the withered plants a bed shows for a crop. Potatoes are part of the bed's own model;
 *  the others are models of their own, added the first time a bed grows them. */
export function plotPlants(pl, crop) {
  if (!crop || crop === 'potato') return { plants: pl.plants, dead: pl.plantsDead };
  if (!pl.crops[crop]) {
    const m = model('crop_' + crop);
    pl.group.add(m.root);
    pl.crops[crop] = { plants: m.part('plants'), dead: m.part('plants_dead') };
  }
  return pl.crops[crop];
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
  const hl = new THREE.SpotLight(0xfff2d8, 0, 110, 0.6, 0.9, 1.5);           // (a wide soft edge: the pool ended on a hard arc)
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

/** Which model stands at each historic landing site. */
export const LANDER_MODEL = {
  'Mars 3': 'mars3', 'Mars 6': 'mars3', 'Viking 1': 'viking', 'Viking 2': 'viking', 'Beagle 2': 'beagle2',
  'Spirit': 'mer', 'Opportunity': 'mer', 'Phoenix': 'phoenix', 'Curiosity': 'msl', 'Perseverance': 'm2020',
  'Schiaparelli EDM': 'schiaparelli_wreck', 'InSight': 'insight', 'Zhurong': 'zhurong',
};
const _aw = new THREE.Vector3();
/** A collision circle at a local offset in a placed group. Switch it with setColliders. */
export function siteCollider(g, lx, lz, r) {
  const w = new THREE.Vector3(lx, 0, lz).applyQuaternion(g.quaternion).add(g.position);
  const col = { v: w.normalize(), r, r0: r };
  colliders.push(col);
  return col;
}
export function setColliders(cols, on) { if (cols) for (const c of cols) c.r = on ? c.r0 : 0.001; }
/** Put a model in a placed group and register the collision circles it carries (`.cols`). */
export function addSiteModel(g, name, o = {}) {
  const m = model(name);
  if (o.at) m.root.position.set(o.at[0], 0, o.at[1]);
  if (o.yaw) m.root.rotation.y = o.yaw;
  g.add(m.root);
  m.cols = [];
  // whatever stands on Mars has disturbed the ground it stands on: a patch of darker, packed soil under it
  if (o.stain) groundStain(g, o.stain, o.blast ? 0x241410 : 0x1e0f08, o.stainOpacity || 0.5, 0.025, o.blast ? 'blast' : 'soft').position.set(o.at ? o.at[0] : 0, 0.025, o.at ? o.at[1] : 0);
  for (const c of colliderAnchors(m)) {
    c.node.updateWorldMatrix(true, false);
    g.worldToLocal(c.node.getWorldPosition(_aw));          // into the group's frame: the world origin floats
    m.cols.push(siteCollider(g, _aw.x, _aw.z, c.r));
  }
  return m;
}

export function buildStorySites() {
  // Pathfinder at its real landing site (Ares Vallis)
  const pf = placeAt(19.13, 326.79, 0.7);
  World.pfModel = model('pathfinder');
  pf.add(World.pfModel.root);
  World.pathfinder = pf;
  World.pfCollider = { v: pf.position.clone().normalize(), r: 2.0 };
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
  groundStain(mav, 13, 0x0c0706, 0.72, 0.03, 'scorch');   // what four descent engines left: burnt ground, years old and still black
  World.mav = mav;
  mav.userData.reach = 9000;                       // a 15 m rocket shows from far off
  colliders.push({ v: mav.position.clone().normalize(), r: 3.4 });

  // every real lander, at its real coordinates, as the machine it really was
  for (const L of LANDERS) {
    if (L.name === 'Pathfinder') { World.landers.push({ data: L, group: pf }); continue; }
    const g = placeAt(L.lat, L.lon, srand() * 6);
    // those that came down on engines left their blast in the dust; those that bounced in on airbags, a scuffed patch
    // (the rovers drove away from where they were set down, and the airbag landers rolled to where they lie)
    const engines = /Viking|Mars 3|Mars 6|Phoenix|InSight/.test(L.name);
    addSiteModel(g, LANDER_MODEL[L.name], { stain: L.name === 'Schiaparelli EDM' ? 0 : engines ? 5.2 : 3.4, blast: engines, stainOpacity: engines ? 0.3 : 0.2 });
    if (L.name === 'Perseverance') addSiteModel(g, 'ingenuity', { at: [3.2, 2.1], yaw: 0.7 });     // it brought a helicopter
    World.landers.push({ data: L, group: g });
  }

  // ice deposits: Korolev + northern-lowland fields
  for (const [la, lo] of iceSpots()) {
    const g = placeAt(la, lo, hash3(la, lo, 4) * 6.28);
    const m = addSiteModel(g, 'ice_outcrop');
    const blocks = [];
    for (let i = 0; i < 6; i++) {
      const b = m.part('block_' + i);
      if (b) blocks.push({ node: b, col: siteCollider(g, b.position.x, b.position.z, 0.95) });
    }
    World.iceSites.push({ group: g, left: 6, korolev: la > 70, blocks });
  }
}

/** A supply capsule (or route cache) standing in a placed group. */
export function addSupplyPod(g, loot, label) {
  {
    const u = _aw.copy(g.position).normalize();
    const pad = ctx.planet.addPad(u.x, u.y, u.z, 2.6, 6.5);          // (a long ease back to the land: a small flat disc on a slope reads as a sticker)
    ctx.terrain.syncPads([pad]);
    g.position.copy(u).multiplyScalar(surfaceAt(u));
  }
  const m = addSiteModel(g, 'supply_pod', { stain: 2.8, stainOpacity: 0.5 });
  const pod = { group: g, kind: 'pod', taken: false, loot, label, cols: m.cols, lid: m.part('lid'),
    strobe: ownMaterials(m.part('strobe'), /^light_/) };
  World.pods.push(pod);
  pod.pulse = 0;
  addLamp(m.part('strobe') || g, { color: 0xffb04a, power: 10, range: 14, level: () => (pod.taken ? 0 : (0.25 + 0.75 * (World.dark || 0)) * pod.pulse) });
  return pod;
}

// Things the player builds in the field. `yaw` turns the front (the greenhouse door, the face of
// a panel) to that bearing, east of north.
export const GREENHOUSE = { wall: 3.93, doorHalf: 0.75, portalOuter: 0.86, portalEnd: 4.62, floor: 0.06 };
export function buildDeployable(kind, atVec, yaw = 0) {
  {
    // a dome needs level ground under it; the small things need a clear, level spot (no rock under a tripod)
    const u = _aw.copy(atVec).normalize();
    const padRec = kind === 'greenhouse' ? ctx.planet.addPad(u.x, u.y, u.z, 5.6, 5) : ctx.planet.addPad(u.x, u.y, u.z, 1.4, 2.2);
    ctx.terrain.syncPads([padRec]);
  }
  const g = placeAt(atVec, undefined, yaw);
  const b = { kind, group: g, v: g.position.clone().normalize(), yaw, charges: kind === 'cache' ? 3 : 0 };
  if (kind === 'solar') {
    addSiteModel(g, 'solar_kit', { stain: 1.8, stainOpacity: 0.4 });
  } else if (kind === 'greenhouse') {
    g.position.addScaledVector(g.userData.up, -GREENHOUSE.floor);       // the deck is the ground you walk on
    const gm = addSiteModel(g, 'greenhouse', { stain: 6.8, stainOpacity: 0.5 });
    // its lights: white from the apex, pink from the grow strips; they carry the dome at night
    // (hardly brighter by night than by day: the eye is wide open then, and what lit the dome at noon floods it)
    const lit = () => 0.3 + 0.4 * (World.dark || 0);      // (the dome's own light reaches the ground round it after dark)
    // (kept modest: the dome's own floor and trays are white and a metre or two from these, and blow out long
    //  before the ground outside is lit)
    addLamp(gm.part('light_apex') || g, { color: 0xfff0dc, power: 9, range: 20, decay: 1.25, level: lit });
    addLamp(g, { offset: new THREE.Vector3(0, 2.4, 0), color: 0xff5cc0, power: 6, range: 12, decay: 1.3, level: lit });
    for (const [px, pz] of [[-1.1, -1.2], [1.1, -1.2], [-1.1, 1.2], [1.1, 1.2]]) addFarmPlot(g, px, pz, true);
    // the door swings outward on its left jamb as someone walks up to it, from either side
    b.door = { node: gm.part('door_leaf'), k: 0, cols: [siteCollider(g, 0, GREENHOUSE.portalEnd, 0.7)] };
  } else if (kind === 'beacon') {
    const m = addSiteModel(g, 'beacon');
    b.lamp = ownMaterials(m.part('lamp'), /^light_/);
    b.pulse = 0;
    addLamp(m.part('light') || m.part('lamp') || g, { color: 0x8fc4ff, power: 9, range: 16, level: () => (World.dark || 0) * b.pulse });
  } else if (kind === 'cache') {
    const m = addSiteModel(g, 'o2_cache');
    b.tanks = [0, 1, 2].map((i) => m.part('tank_' + i));
  }
  World.builtMeshes.push(b);
  return b;
}

// supply pod (quest rewards) — lands near the hab
export function dropSupplyPod(loot, label) {
  const ang = srand() * Math.PI * 2, dist = 40 + srand() * 30;
  const g = placeOffset(World.hab, Math.sin(ang) * dist, Math.cos(ang) * dist, srand() * 6);
  const pod = addSupplyPod(g, loot, label || 'Open supply pod');
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
