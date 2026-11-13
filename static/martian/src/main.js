// Stranded II — entry point: load the planet, build the engine, run the game loop.
import * as farmApi from './game/farm.js';
import { FINEST } from './planet/height.js';
import { chunkSpacing } from './terrain/chunk.js';
import { photo, photoCamera, updatePhoto, enterPhoto, exitPhoto, takePhoto, photoSubjects } from './game/photo.js';
import { initPhotoUi, togglePhoto } from './ui/photo.js';
import { inputHooks } from './game/input.js';
import * as comfortsApi from './game/comforts.js';
import { gainLoot } from './game/inventory.js';
import * as THREE from 'three';
import { Engine } from './render/engine.js';
import { loadPlanet, asset } from './planet/load.js';
import { Terrain } from './terrain/terrain.js';
import { makeTerrainMaterial } from './render/terrain-material.js';
import { llToVec, groundDist } from './planet/geo.js';
import { surfaceAt } from './planet/surface.js';
import { R } from './planet/constants.js';
import { clamp, perf, smoothstep } from './core/math.js';
import { _v1, _v2, _v3 } from './core/scratch.js';
import { ctx } from './game/ctx.js';
import { S, BAL, DIFFICULTIES } from './game/state.js';
import { root, UI, log, toast, showOverlay, hideOverlay } from './ui/dom.js';
import { Snd } from './audio/sound.js';
import { MATERIALS, analyseAll, catalogue, identify, scienceSummary, takeSample } from './game/science.js';
import { updateAudio } from './audio/driver.js';
import { devils, spawnDevil, updateDevils } from './game/devils.js';
import { SIGHTS, sights, updateSights } from './game/sights.js';
import { MACHINES, dawnFaults, service, serviceCost, wearMachines, wearRover } from './game/machines.js';
import { machineEff } from './game/state.js';
import { initDiag } from './ui/diag.js';
import { LampPool } from './world/lamps.js';
import { MAIL, deliverMail, nextMail } from './game/mail.js';
import { setStainLight, setGlowLight, World, buildDeployable, dropSupplyPod, siteLocalToWorld, updateDoors, updateSites } from './world/build.js';
import { dustUniforms, mirrorUniforms, setGlow, preloadModels } from './world/models.js';
import { RockField, rockColliders } from './world/rocks.js';
import { Vfx } from './render/vfx.js';
import { initEffects, updateEffects } from './game/effects.js';
import { input, initInput } from './game/input.js';
import { player, updateWalk, updateAstronaut, buildAstronaut, initPlayerAt, playerUnit, camLookAt } from './game/player.js';
import { roverF, updateRover, initRoverAt } from './game/rover.js';
import { updateInteract, interactables, interaction } from './game/interact.js';
import './game/interactables.js';
import { advanceTime, applyRates, updateSunDir, newSol, sleepToDawn } from './game/sim.js';
import { updateDiscoveries, checkAchievements } from './game/story.js';
import { startLaunch } from './game/launch.js';
import { updateHud, updateCompass, updateObjectivesHud, updateWaypoint } from './ui/hud.js';
import { screenOpen, renderMap } from './ui/screens.js';
import { serializeState, applyState, checkpoint, restoreCheckpoint, saveGame } from './game/save.js';
import { showStart, newGame, continueGame } from './game/flow.js';
import { syncAllVisuals } from './game/visuals.js';
import { showLoading as loading } from './ui/menus.js';

/** Set when the graphics preset was neither asked for in the address nor chosen in Settings: the game may then step
 *  a phone down by itself (see frame()). */
let autoQuality = false;
const AUTO_KEY = 'stranded2-quality-auto';
/**
 * The phone is the machine this game is made for, and a recent one draws "medium" (bloom, fine ground, the
 * full rock field) comfortably; so a phone starts there, not on "low". One that cannot hold the frame rate
 * with the resolution traded down as far as it goes is noted, and starts on "low" from its next launch.
 */
function pickQuality() {
  const q = new URLSearchParams(location.search).get('q');
  if (q) return q;
  try {
    const saved = localStorage.getItem('stranded2-quality'); if (saved) return saved;
    if (localStorage.getItem(AUTO_KEY)) return 'low';
  } catch (e) { /* private mode */ }
  const mobile = input.isTouch && Math.min(screen.width, screen.height) < 900;
  autoQuality = mobile;
  return mobile ? 'medium' : 'high';
}

/** What the game was doing when it could not start: shown on the failure screen, so that a report from a phone says where. */
let bootStage = 'starting';
async function boot() {
  loading(0, 'Receiving orbital survey');
  bootStage = 'starting the renderer';
  const engine = ctx.engine = new Engine(root, pickQuality());
  ctx.world = new THREE.Group();
  ctx.world.name = 'world';
  engine.scene.add(ctx.world);
  bootStage = 'loading the planet';
  const data = await loadPlanet(loading, { maxColorFace: engine.q.scale < 0.7 ? 512 : 1024 });
  bootStage = 'building the terrain';
  ctx.planet = data.planet;
  const material = makeTerrainMaterial(data.albedoCube, { fine: engine.q.fine, anisotropy: Math.min(engine.q.scale < 0.7 ? 4 : 8, engine.renderer.capabilities.getMaxAnisotropy()) });
  ctx.terrainMaterial = material;
  ctx.outdoor = new THREE.Group();                 // terrain and rocks: skipped while sealed inside the Hab
  engine.scene.add(ctx.outdoor);
  ctx.terrainUniforms = material.userData.uniforms;        // (the storm's dusting of the ground was never switched on: nothing set it)
  data.planet.finest = Math.max(FINEST, chunkSpacing(engine.q.maxLevel, engine.q.grid) * 1.25);
  data.planet.meshGrid = { G: engine.q.grid, level: engine.q.maxLevel };      // the finest mesh drawn: what the ground "is" to feet and wheels (planet/surface.js)
  ctx.terrain = new Terrain({
    planet: data.planet, heightData: data.heightData, parent: ctx.outdoor, material,
    workerUrl: asset('terrain-worker.js'), grid: engine.q.grid, maxLevel: engine.q.maxLevel, split: engine.q.split, workers: engine.q.workers,
    shadowLevel: engine.q.maxLevel - engine.q.terrainShadowLevels + 1,
  });
  ctx.rocks = new RockField(ctx.outdoor, ctx.terrain, { density: engine.q.rocks, shadowRange: engine.q.scale >= 0.7 ? engine.q.shadowRange : 0, albedoCube: data.albedoCube });
  dustUniforms.uDustAlbedo.value = data.albedoCube;
  ctx.lamps = new LampPool(engine.scene, engine.q.scale < 0.7 ? 3 : 5);
  ctx.vfx = new Vfx(engine.scene, { air: engine.q.scale < 0.7 ? 700 : 1600, puffs: engine.q.scale < 0.7 ? 300 : 600, sheets: engine.q.scale < 0.7 ? 28 : 60, streaks: engine.q.scale < 0.7 ? 1100 : 2800 });
  initEffects();
  const mapImg = new Image();
  mapImg.onload = () => { ctx.mapImage = mapImg; };
  mapImg.src = asset('assets/mars/map.jpg');

  bootStage = 'loading the models';
  await preloadModels(['astronaut', 'rover', 'hab', 'mav', 'hermes', 'farm_plot', 'solar_panel', 'uplink_dish',
    'pathfinder', 'viking', 'mars3', 'beagle2', 'mer', 'phoenix', 'insight', 'msl', 'm2020', 'ingenuity', 'crop_radish', 'crop_lettuce', 'crop_soy', 'crop_tomato', 'hab_comforts', 'zhurong', 'schiaparelli_wreck',
    'greenhouse', 'solar_kit', 'beacon', 'o2_cache', 'supply_pod', 'rtg', 'debris_a', 'debris_b', 'debris_c', 'regolith_pile', 'ice_outcrop', 'uplink_pad'], (f) => loading(0.9 + f * 0.1, 'Unpacking equipment'));
  bootStage = 'setting up the game';
  buildAstronaut();
  initInput();
  initPhotoUi(() => draw(0, lastFocus));
  inputHooks.photo = togglePhoto;
  updateSunDir();
  installDebug();
  // title: the camera drifts over the day side while the first tiles arrive
  titleCamera(0);
  loading(1, 'Building terrain');
  bootStage = 'drawing the first ground';
  await ctx.terrain.settle(engine.camera.position, 15000);
  bootStage = 'showing the title';
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
  // (the planet stands to the right of the menu, not behind it: look at a point to the left of its middle)
  _v3.copy(cam.position).normalize().cross(_v2.set(0, 1, 0)).normalize().multiplyScalar(R * 0.78);
  camLookAt(_v3, _v2.set(0, 1, 0));
}

const _roof = new THREE.Vector3();
let photoCam = null;                 // a free camera for pictures, set through the debug hook
function draw(dt, focus) {
  const e = ctx.engine;
  if (photoCam) { e.camera.position.copy(photoCam.pos); camLookAt(photoCam.look, photoCam.up); }
  const exposureBias = photo.on ? photoCamera() : 1;
  e.camera.updateMatrixWorld();
  ctx.terrain.update(e.camera.position);
  ctx.rocks.update(e.camera.position, S.started && S.mode === 'walk' ? player.pos : null);
  updateSites(e.camera.position);
  const sealed = S.started && !!World.sealedInside && !S.over;
  ctx.outdoor.visible = !sealed;
  e.update({ dt, sealed, dust: S.started ? S.storm.i : 0, inside: S.started && (S.inside || S.inAirlock) && S.mode === 'walk', power: !S.started || S.power > 0.5, focus, exposureBias, wind: ctx.vfx && ctx.vfx.streakU ? ctx.vfx.streakU.uWind.value : null,
    roof: sealed ? _roof.copy(World.hab.position).addScaledVector(World.hab.userData.up, 2.8) : null });
  ctx.vfx.update(dt, e.camera, { storm: S.started ? S.storm.i : 0, sunIntensity: e.sky.sunIntensity, sunColor: e.sky.sunColor, ambient: e.sky.ambientSky, inside: sealed || (S.started && S.inside), pixelHeight: e.renderer.domElement.height,
    camHeight: e.camera.position.length() - surfaceAt(e.camera.position) });
  dustUniforms.uDustHere.value.copy(e.camera.position).normalize();
  dustUniforms.uFill.value = e.modelAmbient === undefined ? 1 : e.modelAmbient;
  dustUniforms.uRim.value = e.modelRim || 0;
  mirrorUniforms.uSkyHor.value.copy(e.sky.fogColor); mirrorUniforms.uSkyTop.value.copy(e.sky.ambientSky);
  if (e.envGround) mirrorUniforms.uGroundLit.value.copy(e.envGround.material.color);
  if (ctx.terrainUniforms) {
    const tu = ctx.terrainUniforms, high = e.camera.position.length() - R;
    tu.uDust.value = S.started ? S.storm.i : 0; tu.uDay.value = e.sky.day;
    tu.uSpace.value = smoothstep(1500, 9000, high);
    tu.uSunW.value.copy(e.sunDir); tu.uSkyLit.value.setRGB(0.47, 0.29, 0.145).multiplyScalar(1 - tu.uDust.value); tu.uCamSpace.value = e.sky.space || 0;
    tu.uRelief.value = 1 - 0.68 * smoothstep(2500, 12000, high);

  }
  // the horizon line as this camera sees it: how far below level it lies, from the camera's height over the ground
  // under it (the haze that lies along it is in the fog shader: see airHaze in the engine)
  e.scene.fog.far = -Math.sqrt(2 * clamp(e.camera.position.length() - surfaceAt(e.camera.position), 0.5, 400) / e.camera.position.length());
  ctx.lamps.update(e.camera.position, !!(World.habInterior && World.habInterior.visible), dt);
  e.final.uniforms.uDanger.value = World.danger || 0;
  e.final.uniforms.uCold.value = World.cold || 0;
  e.render();
}

/** Advance the game by dt seconds (no drawing). Returns what the shadows should follow. */
function tick(dt) {
  updateAudio(dt);
  ctx.engine.sky.showMoons = S.started;
  if (!S.started) { titleCamera(dt); return null; }
  const focus = S.mode === 'rover' ? World.rover.group.position : player.pos;
  if (S.over && S.mode !== 'cutscene') return focus;
  // (the last shot of the launch goes on turning behind the rescue screen: it is not a still)
  if (S.won && S.mode === 'cutscene' && World.launchAnim) { World.launchAnim(dt); return (World.launch && World.launch.focus) || focus; }
  if ((S.uiOpen || screenOpen()) && !S.sleeping) return focus;
  if (photo.on) { updatePhoto(dt); return focus; }             // photo mode: the clock is stopped, only the camera moves
  if (S.mode === 'cutscene') {
    if (World.launchAnim) World.launchAnim(dt);
    updateEffects(dt);
    updateSunDir();
    return (World.launch && World.launch.focus) || World.mav.position;
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
    updateDevils(dt);
    updateSights(dt);
  }
  blinkT += dt;
  // how dark it is where the camera is: lamps come on with it (a storm counts as dusk)
  World.dark = Math.max(1 - clamp(ctx.engine.sky.day * 2.5, 0, 1), S.started && S.storm.i > 0.55 ? 0.5 : 0);
  if (World.beaconMats) setGlow(World.beaconMats, Math.sin(blinkT * 5) > 0 ? 1 : 0.05);
  if (World.mavStrobeMats) setGlow(World.mavStrobeMats, Math.sin(blinkT * 7) > 0.6 ? 1.6 : 0.04);
  if (World.habLampMats) setGlow(World.habLampMats, S.power > 0.5 ? 0.04 + 0.96 * World.dark : 0.02);
  { const sk = ctx.engine.sky; setStainLight(Math.min(1, 0.05 + sk.sunIntensity / 2.6 + sk.ambientSky.r * 0.9)); }
  setGlowLight();
  if (World.habViewMats) setGlow(World.habViewMats, Math.max(0.02, ctx.engine.sky.day * (1 - 0.75 * (S.started ? S.storm.i : 0))));
  const strobe = Math.sin(blinkT * 6) > 0.7 ? 1 : 0;
  for (const p of World.pods) { p.pulse = strobe; if (p.strobe && !p.taken && p.group.visible) setGlow(p.strobe, strobe ? 1.8 : 0.03); }
  for (const b of World.builtMeshes) {
    if (b.glow && b.group.visible) setGlow(b.glow, 0.16 + 0.44 * (World.dark || 0));      // (not full even at night: at full the apex fitting burnt a star through the glass)
    if (!b.lamp) continue;
    b.pulse = Math.max(0, Math.sin(blinkT * 2.2)) ** 6;
    if (b.group.visible) setGlow(b.lamp, 0.25 + 1.5 * b.pulse);
  }
  if (World.padLampMats) setGlow(World.padLampMats, S.pf.loaded && !S.pf.connected ? 0.55 + 0.45 * Math.sin(blinkT * 4) : 0.2);
  updateDoors(dt);
  updateSunDir();
  updateHud();
  updateCompass();
  updateObjectivesHud();
  updateWaypoint(ctx.engine.camera);
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
  if (fpsAcc > 1) {
    if (!window.__MG.fixedResolution) ctx.engine.adaptResolution((fpsAcc / fpsN) * 1000, 1000 / 55);
    window.__MG.fps = fpsN / fpsAcc;
    // ten seconds in a row under 27 frames a second at the lowest resolution, in play: this phone wants the lighter preset
    if (autoQuality && S.started && !S.over && !window.__MG.paused && !document.hidden) {
      slowFrames = window.__MG.fps < 27 && ctx.engine.dynScale <= 0.56 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames >= 10) {
        autoQuality = false;
        try { localStorage.setItem(AUTO_KEY, 'low'); } catch (e) { /* private mode */ }
        toast('GRAPHICS', 'Lighter graphics from next time', 'This phone is working hard to keep up. The game will open on its lighter setting from now on. Settings has the choice.');
      }
    }
    fpsAcc = 0; fpsN = 0;
  }
  if (!window.__MG.paused) lastFocus = tick(dt);
  draw(window.__MG.paused ? 0 : dt, lastFocus);
}

// pathfinder proximity ping
function updatePing() {
  if (!S.flags.pfRevealed || S.pf.found || S.pf.loaded || S.pf.connected) return;
  const d = groundDist(player.pos, World.pathfinder.position);
  if (d > 90) return;
  const interval = clamp(d / 60, 0.12, 1.4);
  if (perf() - lastPing > interval) { lastPing = perf(); Snd.play('pfPing'); }
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
    syncAllVisuals, initPlayerAt, initRoverAt, newGame, continueGame, checkAchievements, buildDeployable, dropSupplyPod, startLaunch,
    science: { MATERIALS, identify, takeSample, analyseAll, catalogue, scienceSummary },
    mail: { MAIL, nextMail, deliverMail }, farm: farmApi, comforts: comfortsApi, gainLoot, sights: { SIGHTS, sights, updateSights }, photoMode: { photo, enterPhoto, exitPhoto, photoSubjects, takePhoto: () => takePhoto(() => draw(0, lastFocus)) }, rockColliders, devils, spawnDevil, machines: { MACHINES, service, serviceCost, wearMachines, wearRover, dawnFaults }, machineEff,
    ready: false, fps: 0, paused: false,
    /** Step the simulation without drawing: n ticks of dt seconds (tests set paused first). */
    tick(dt, n = 1) { for (let i = 0; i < n; i++) { lastFocus = tick(dt); if (ctx.vfx) ctx.vfx.time += dt; } },     // (dust kicked up in a tick ages by that tick)
    fixedResolution: new URLSearchParams(location.search).has('fixed'),
    /** Start a new game at a chosen crash site without the menus. */
    async start(lat, lon, diff = 'survival') {
      if (lat !== undefined) {
        const real = Math.random; const q = [(lat / 52 + 1) / 2, lon / 360];
        Math.random = () => (q.length ? q.shift() : real());
        try { newGame(diff); } finally { Math.random = real; }
      } else newGame(diff);
      hideOverlay();
      await this.settle();
      return { lat: World.spawn.lat, lon: World.spawn.lon };
    },
    /** Skip the cold open (suit sealed, systems checked, numbers run). */
    skipIntro() {
      Object.assign(S.flags, { coldOpen: false, suitSealed: true, didMath: true, uiColony: true, uiJournal: true, uiMap: true });
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
      // the clock jumped: let the sky, the exposure and the lamps catch up at once, not over the next second
      const e = ctx.engine;
      e.sky.update(e.sunDir, e.camera.position, S.started ? S.storm.i : 0, e.time);
      e.snapLight = 3;
    },
    /** Stand at Hab-local coordinates (x, z in metres; the door is at +z). */
    tpLocal(lx, lz, yaw = 0) {
      const w = siteLocalToWorld(World.hab, lx, 0, lz, new THREE.Vector3());
      initPlayerAt(w.normalize(), yaw);
      lastFocus = tick(0.001);
    },
    /** Park the rover at a spot in the Hab's own frame (metres), facing `yaw`. */
    roverLocal(lx, lz, yaw = 0) { initRoverAt(siteLocalToWorld(World.hab, lx, 0, lz, new THREE.Vector3()).normalize(), yaw); },
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
    /** Pin the storm strength where the astronaut is (0..1); setStorm(null) gives the weather back to the game. */
    setStorm(i) { S.storm.hold = i; if (typeof i === 'number') S.storm.i = i; },
    look(pitch) { player.pitch = pitch; ctx.engine.snapLight = 3; },
    /** Turn to face a direction in the world (a unit vector), and look up or down at it. */
    lookAt(d) {
      const up = _v1.copy(player.pos).normalize().clone();
      const e = new THREE.Vector3(-up.z, 0, up.x).normalize(), n = new THREE.Vector3().crossVectors(up, e);
      const v = new THREE.Vector3(d.x, d.y, d.z).normalize();
      initPlayerAt(up, Math.atan2(v.dot(e), v.dot(n)) - Math.PI);
      player.pitch = Math.asin(clamp(v.dot(up), -1, 1));
      lastFocus = tick(0.001);
    },
    async settle() { ctx.engine.camera.updateMatrixWorld(); return ctx.terrain.settle(ctx.engine.camera.position, 20000); },
    info() { return { fps: +this.fps.toFixed(1), ...ctx.engine.info(), ...ctx.terrain.stats(), rocks: ctx.rocks.counts }; },
  };
}

initDiag(() => (ctx.engine ? { quality: ctx.engine.qualityName, ...ctx.engine.info() } : {}));
/**
 * Start again from the network. A build that cannot start may be sitting in this game's offline cache, and a plain
 * reload would be handed the same files again: so the cache and its service worker go first. (Saves are not there:
 * they are in the browser's local storage, and are not touched.)
 */
async function reloadFresh() {
  try {
    if (window.caches) await Promise.all((await caches.keys()).filter((k) => k.startsWith('stranded2-')).map((k) => caches.delete(k)));
    if ('serviceWorker' in navigator) {
      const here = new URL('.', location.href).href;
      await Promise.all((await navigator.serviceWorker.getRegistrations()).filter((r) => r.scope === here).map((r) => r.unregister()));
    }
  } catch { /* private mode, or no service workers here: reload anyway */ }
  location.reload();
}
boot().catch((e) => {
  console.error(e);
  window.__MG_FAILED = String(e && e.message || e);       // (the tests wait on this, to fail at once with the reason)
  showOverlay({ kind: 'error', title: 'Something broke', body: `The game could not start (it was ${bootStage}).\n\n${String(e && e.message || e)}\n\nReload to try again with a fresh copy of the game. Your saved game is kept.`,
    buttons: [{ label: 'Reload', keep: true, fn: () => { reloadFresh(); } }] });
});
