// Stranded II — entry point: load the planet, build the engine, run the game loop.
import * as THREE from 'three';
import { Engine } from './render/engine.js';
import { loadPlanet, asset } from './planet/load.js';
import { Terrain } from './terrain/terrain.js';
import { makeTerrainMaterial } from './render/terrain-material.js';
import { llToVec, groundDist } from './planet/geo.js';
import { surfaceAt } from './planet/surface.js';
import { R } from './planet/constants.js';
import { clamp, perf } from './core/math.js';
import { _v1, _v2, _v3 } from './core/scratch.js';
import { ctx } from './game/ctx.js';
import { S, BAL, DIFFICULTIES } from './game/state.js';
import { root, UI, log, showOverlay } from './ui/dom.js';
import { Snd } from './audio/sound.js';
import { World, buildDeployable, dropSupplyPod, siteLocalToWorld, updateDoors, updateSites } from './world/build.js';
import { setGlow, preloadModels } from './world/models.js';
import { RockField } from './world/rocks.js';
import { Vfx } from './render/vfx.js';
import { initEffects, updateEffects } from './game/effects.js';
import { input, initInput } from './game/input.js';
import { player, updateWalk, updateAstronaut, buildAstronaut, initPlayerAt, playerUnit, camLookAt } from './game/player.js';
import { roverF, updateRover, initRoverAt } from './game/rover.js';
import { updateInteract, interactables, interaction } from './game/interact.js';
import './game/interactables.js';
import { advanceTime, applyRates, updateSunDir, newSol, sleepToDawn } from './game/sim.js';
import { updateDiscoveries, checkAchievements } from './game/story.js';
import { updateHud, updateCompass, updateObjectivesHud } from './ui/hud.js';
import { screenOpen, renderMap } from './ui/screens.js';
import { serializeState, applyState, checkpoint, restoreCheckpoint, saveGame } from './game/save.js';
import { showStart, newGame, continueGame } from './game/flow.js';
import { syncAllVisuals } from './game/visuals.js';

function pickQuality() {
  const q = new URLSearchParams(location.search).get('q');
  if (q) return q;
  try { const saved = localStorage.getItem('stranded2-quality'); if (saved) return saved; } catch (e) { /* private mode */ }
  const mobile = input.isTouch && Math.min(screen.width, screen.height) < 900;
  return mobile ? 'low' : 'high';
}

function loading(fraction, label) {
  UI.panel.innerHTML = `<h1>STRANDED II</h1><h2>${label || 'Loading'}</h2>` +
    `<div style="height:6px;border:1px solid rgba(242,216,184,.4)"><div style="height:100%;width:${Math.round(fraction * 100)}%;background:#ffb45e"></div></div>`;
  UI.overlay.style.display = 'flex';
}

async function boot() {
  loading(0, 'Receiving orbital survey');
  const engine = ctx.engine = new Engine(root, pickQuality());
  ctx.world = new THREE.Group();
  ctx.world.name = 'world';
  engine.scene.add(ctx.world);
  const data = await loadPlanet(loading, { maxColorFace: engine.q.scale < 0.7 ? 512 : 1024 });
  ctx.planet = data.planet;
  const material = makeTerrainMaterial(data.albedoCube, { fine: engine.q.fine });
  ctx.terrainMaterial = material;
  ctx.outdoor = new THREE.Group();                 // terrain and rocks: skipped while sealed inside the Hab
  engine.scene.add(ctx.outdoor);
  ctx.terrain = new Terrain({
    planet: data.planet, heightData: data.heightData, parent: ctx.outdoor, material,
    workerUrl: asset('terrain-worker.js'), grid: engine.q.grid, maxLevel: engine.q.maxLevel, split: engine.q.split, workers: engine.q.workers,
    shadowLevel: engine.q.maxLevel - engine.q.terrainShadowLevels + 1,
  });
  ctx.rocks = new RockField(ctx.outdoor, ctx.terrain, { density: engine.q.rocks, shadowRange: engine.q.scale >= 0.7 ? engine.q.shadowRange : 0, albedoCube: data.albedoCube });
  ctx.vfx = new Vfx(engine.scene, { air: engine.q.scale < 0.7 ? 700 : 1600, puffs: engine.q.scale < 0.7 ? 300 : 600, sheets: engine.q.scale < 0.7 ? 18 : 36 });
  initEffects();
  const mapImg = new Image();
  mapImg.onload = () => { ctx.mapImage = mapImg; };
  mapImg.src = asset('assets/mars/map.jpg');

  await preloadModels(['astronaut', 'rover', 'hab', 'mav', 'hermes', 'farm_plot', 'solar_panel', 'uplink_dish',
    'pathfinder', 'viking', 'mars3', 'beagle2', 'mer', 'phoenix', 'insight', 'msl', 'ingenuity', 'zhurong', 'schiaparelli_wreck',
    'greenhouse', 'solar_kit', 'beacon', 'o2_cache', 'supply_pod', 'rtg', 'debris_a', 'debris_b', 'debris_c', 'regolith_pile', 'ice_outcrop', 'uplink_pad'], (f) => loading(0.9 + f * 0.1, 'Unpacking equipment'));
  buildAstronaut();
  initInput();
  updateSunDir();
  installDebug();
  // title: the camera drifts over the day side while the first tiles arrive
  titleCamera(0);
  loading(1, 'Building terrain');
  await ctx.terrain.settle(engine.camera.position, 15000);
  showStart();
  lastT = perf();
  requestAnimationFrame(frame);
  window.__MG.ready = true;
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register(asset('sw.js')).catch(() => {});
  }
}

// ------------------------------------------------------------------------------------------
// Main loop
// ------------------------------------------------------------------------------------------
let lastT = 0, startOrbitA = 0, mapOpenTimer = 0, blinkT = 0, lastPing = 0, slowFrames = 0, fpsAcc = 0, fpsN = 0;

function titleCamera(dt) {
  const cam = ctx.engine.camera, sun = ctx.engine.sunDir;
  startOrbitA += dt * 0.012;
  updateSunDir();
  // well round from the sun, so the terminator crosses the disc and the craters cast shadows
  const phase = 1.02 + 0.16 * Math.sin(startOrbitA);
  _v2.set(-sun.z, 0, sun.x).normalize();
  _v1.copy(sun).multiplyScalar(Math.cos(phase)).addScaledVector(_v2, Math.sin(phase)).multiplyScalar(R * 2.6);
  cam.position.copy(_v1).setY(R * (0.45 + 0.25 * Math.sin(startOrbitA * 0.6)));
  camLookAt(_v3.set(0, 0, 0), _v2.set(0, 1, 0));
}

let photoCam = null;                 // a free camera for pictures, set through the debug hook
function draw(dt, focus) {
  const e = ctx.engine;
  if (photoCam) { e.camera.position.copy(photoCam.pos); camLookAt(photoCam.look, photoCam.up); }
  e.camera.updateMatrixWorld();
  ctx.terrain.update(e.camera.position);
  ctx.rocks.update(e.camera.position);
  updateSites(e.camera.position);
  const sealed = S.started && !!World.sealedInside && !S.over;
  ctx.outdoor.visible = !sealed;
  e.update({ dt, sealed, dust: S.started ? S.storm.i : 0, inside: S.started && (S.inside || S.inAirlock) && S.mode === 'walk', power: !S.started || S.power > 0.5, focus });
  ctx.vfx.update(dt, e.camera, { storm: S.started ? S.storm.i : 0, sunIntensity: e.sky.sunIntensity, sunColor: e.sky.sunColor, ambient: e.sky.ambientSky, inside: sealed || (S.started && S.inside), pixelHeight: e.renderer.domElement.height,
    camHeight: e.camera.position.length() - surfaceAt(e.camera.position) });
  e.final.uniforms.uDanger.value = World.danger || 0;
  e.final.uniforms.uCold.value = World.cold || 0;
  e.render();
}

/** Advance the game by dt seconds (no drawing). Returns what the shadows should follow. */
function tick(dt) {
  if (!S.started) { titleCamera(dt); return null; }
  const focus = S.mode === 'rover' ? World.rover.group.position : player.pos;
  if (S.over && S.mode !== 'cutscene') return focus;
  if ((S.uiOpen || screenOpen()) && !S.sleeping) return focus;
  if (S.mode === 'cutscene') {
    if (World.launchAnim) World.launchAnim(dt);
    updateEffects(dt);
    updateSunDir();
    return World.mav.position;
  }
  if (!S.sleeping) {
    advanceTime(dt);
    applyRates(dt, false);
    if (S.mode === 'walk') updateWalk(dt);
    else if (S.mode === 'rover') updateRover(dt);
    updateAstronaut(dt);
    updateInteract(dt);
    updateDiscoveries(dt);
    updatePing();
    updateEffects(dt);
  }
  Snd.wind((S.inside ? 0.05 : 0.16) + S.storm.i * 0.65 + (S.breach.active && S.inside ? 0.4 : 0));
  blinkT += dt;
  if (World.beaconMats) setGlow(World.beaconMats, Math.sin(blinkT * 5) > 0 ? 1 : 0.05);
  if (World.mavStrobeMats) setGlow(World.mavStrobeMats, Math.sin(blinkT * 7) > 0.6 ? 1.6 : 0.04);
  const strobe = Math.sin(blinkT * 6) > 0.7 ? 1.8 : 0.03;
  for (const p of World.pods) if (p.strobe && !p.taken && p.group.visible) setGlow(p.strobe, strobe);
  for (const b of World.builtMeshes) if (b.lamp && b.group.visible) setGlow(b.lamp, 0.25 + 1.5 * Math.max(0, Math.sin(blinkT * 2.2)) ** 6);
  if (World.padLampMats) setGlow(World.padLampMats, S.pf.loaded && !S.pf.connected ? 0.55 + 0.45 * Math.sin(blinkT * 4) : 0.2);
  updateDoors(dt);
  updateSunDir();
  updateHud();
  updateCompass();
  updateObjectivesHud();
  if (UI.mapScreen.style.display === 'block') {
    mapOpenTimer += dt;
    if (mapOpenTimer > 0.7) { mapOpenTimer = 0; renderMap(); }
  }
  return focus;
}

let lastFocus = null;
function frame() {
  requestAnimationFrame(frame);
  const now = perf();
  const rawDt = now - lastT;
  const dt = Math.min(rawDt, 0.05);
  lastT = now;
  // hold the frame rate by trading resolution (checked about once a second)
  fpsAcc += rawDt; fpsN++;
  if (fpsAcc > 1) { if (!window.__MG.fixedResolution) ctx.engine.adaptResolution((fpsAcc / fpsN) * 1000, 1000 / 55); window.__MG.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (!window.__MG.paused) lastFocus = tick(dt);
  draw(window.__MG.paused ? 0 : dt, lastFocus);
}

// pathfinder proximity ping
function updatePing() {
  if (!S.flags.pfRevealed || S.pf.found || S.pf.loaded || S.pf.connected) return;
  const d = groundDist(player.pos, World.pathfinder.position);
  if (d > 90) return;
  const interval = clamp(d / 60, 0.12, 1.4);
  if (perf() - lastPing > interval) { lastPing = perf(); Snd.beep(1200, 0.04, 'square', 0.05); }
  if (d < 10 && !S.pf.found) { S.pf.found = true; log('Signal source dead ahead. There you are.'); }
}

// ------------------------------------------------------------------------------------------
// Debug and test hook: reach any place, time and state on demand (used by tools/tests)
// ------------------------------------------------------------------------------------------
function installDebug() {
  window.__MG = {
    ctx, S, World, player, roverF, BAL, DIFFICULTIES, interactables, input, interaction,
    llToVec, surfaceAt, groundDist,
    applyRates, advanceTime, newSol, sleepToDawn, checkpoint, restoreCheckpoint, serializeState, applyState, saveGame,
    syncAllVisuals, initPlayerAt, initRoverAt, newGame, continueGame, checkAchievements, buildDeployable, dropSupplyPod,
    ready: false, fps: 0, paused: false,
    /** Step the simulation without drawing: n ticks of dt seconds (tests set paused first). */
    tick(dt, n = 1) { for (let i = 0; i < n; i++) lastFocus = tick(dt); },
    fixedResolution: new URLSearchParams(location.search).has('fixed'),
    /** Start a new game at a chosen crash site without the menus. */
    async start(lat, lon, diff = 'survival') {
      if (lat !== undefined) {
        const real = Math.random; const q = [(lat / 52 + 1) / 2, lon / 360];
        Math.random = () => (q.length ? q.shift() : real());
        try { newGame(diff); } finally { Math.random = real; }
      } else newGame(diff);
      UI.overlay.style.display = 'none'; S.uiOpen = false;
      await this.settle();
      return { lat: World.spawn.lat, lon: World.spawn.lon };
    },
    /** Skip the cold open (suit sealed, systems checked, numbers run). */
    skipIntro() {
      Object.assign(S.flags, { coldOpen: false, suitSealed: true, didMath: true });
      S.checkedSystems = { oxy: true, rec: true };
      S.suit = 100;
    },
    /** Put the astronaut at a latitude/longitude, facing `yaw`. */
    async tp(lat, lon, yaw = 0) {
      initPlayerAt(llToVec(lat, lon), yaw);
      if (S.mode === 'walk') updateWalk(0.001);
      return this.settle();
    },
    /** Put the astronaut `east`,`north` metres from the Hab centre. */
    async tpHab(east, north, yaw = 0) {
      const up = World.hab.position.clone().normalize();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      initPlayerAt(up.addScaledVector(e, east / R).addScaledVector(n, north / R).normalize(), yaw);
      if (S.mode === 'walk') updateWalk(0.001);
      return this.settle();
    },
    /** Set the local solar time (hours, 0-24.66) where the astronaut stands. */
    setLocalTime(hours) {
      const up = _v1.copy(player.pos).normalize();
      const lon = ((Math.atan2(-up.z, up.x) * 180 / Math.PI) + 360) % 360;
      S.tod = (((hours / 24.66 - 0.5) - lon / 360) % 1 + 1) % 1;
      updateSunDir();
    },
    /** Stand at Hab-local coordinates (x, z in metres; the door is at +z). */
    tpLocal(lx, lz, yaw = 0) {
      const w = siteLocalToWorld(World.hab, lx, 0, lz, new THREE.Vector3());
      initPlayerAt(w.normalize(), yaw);
      lastFocus = tick(0.001);
    },
    /** Stand `dist` metres north of a world position. */
    tpNear(pos, dist = 1.5) {
      const up = pos.clone().normalize();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      initPlayerAt(up.addScaledVector(n, dist / R).normalize(), 0);
      lastFocus = tick(0.001);
    },
    /** Stand `dist` metres from a world position on a bearing (degrees east of north), facing it. */
    tpAround(pos, dist = 6, bearing = 0) {
      const b = bearing * Math.PI / 180;
      const up = pos.clone().normalize();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      initPlayerAt(up.addScaledVector(n, Math.cos(b) * dist / R).addScaledVector(e, Math.sin(b) * dist / R).normalize(), b);
      lastFocus = tick(0.001);
    },
    /** A free camera for pictures: look at a world position from `dist` metres away on a bearing
     *  (degrees east of north), `height` metres above the ground there. photo(null) gives the
     *  game its camera back. */
    photo(target, dist = 6, bearing = 0, height = 1.7, aimHeight = 0.9) {
      if (!target) { photoCam = null; return; }
      const b = bearing * Math.PI / 180;
      const up = target.clone().normalize();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      const at = up.clone().addScaledVector(n, Math.cos(b) * dist / R).addScaledVector(e, Math.sin(b) * dist / R).normalize();
      photoCam = { pos: at.clone().multiplyScalar(surfaceAt(at) + height), look: up.clone().multiplyScalar(surfaceAt(up) + aimHeight), up };
      ctx.engine.snapLight = 3;
    },
    /** Turn the astronaut (and the camera behind him) to face the sun's bearing. */
    faceSun() {
      const up = _v1.copy(player.pos).normalize().clone(), sun = ctx.engine.sunDir;
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      initPlayerAt(up, Math.atan2(sun.dot(e), sun.dot(n)) - Math.PI);
      lastFocus = tick(0.001);
    },
    /** World position of a point given in Hab-local metres. */
    at(lx, lz) { return siteLocalToWorld(World.hab, lx, 0, lz, new THREE.Vector3()); },
    /** Park the rover `dist` metres south of a world position. */
    roverTo(pos, dist = 6) {
      const up = pos.clone().normalize();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      initRoverAt(up.addScaledVector(n, -dist / R).normalize(), 0);
    },
    /** Hold the interact button for `sec` seconds of game time. */
    hold(sec) {
      input.eHeld = true;
      for (let i = 0; i < Math.ceil(sec / 0.05); i++) lastFocus = tick(0.05);
      input.eHeld = false;
      lastFocus = tick(0.05);
    },
    setStorm(i) { S.storm.i = i; S.storm.hold = i; },
    look(pitch) { player.pitch = pitch; ctx.engine.snapLight = 3; },
    async settle() { ctx.engine.camera.updateMatrixWorld(); return ctx.terrain.settle(ctx.engine.camera.position, 20000); },
    info() { return { fps: +this.fps.toFixed(1), ...ctx.engine.info(), ...ctx.terrain.stats(), rocks: ctx.rocks.counts }; },
  };
}

boot().catch((e) => {
  console.error(e);
  showOverlay({ title: 'SOMETHING BROKE', body: `The game could not start.\n\n${String(e && e.message || e)}\n\nReload the page to try again.`, buttons: [] });
});
