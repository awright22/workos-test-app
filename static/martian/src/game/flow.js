import { log, showOverlay, toast } from '../ui/dom.js';
import { DIFFICULTIES, S } from './state.js';
import { Snd } from '../audio/sound.js';
import { mountAudioControls } from '../audio/controls.js';
import { Save, applyState, checkpoint, loadSavedData, restoreCheckpoint, saveGame, unreadableSaveExists, wipeSave } from './save.js';
import { tryLock } from './input.js';
import { initStorms, updateSunDir } from './sim.js';
import { World, addSitePads, buildHabColony, buildStorySites, pickSpawn } from '../world/build.js';
import { frameMove, frameYaw, player, syncPlayerPos } from './player.js';
import { R } from '../planet/constants.js';
import { bearingTo } from '../ui/hud.js';
import { regionName } from '../planet/features.js';
import { llToVec } from '../planet/geo.js';
import { initRoverAt } from './rover.js';
import { _v1 } from '../core/scratch.js';
// Starting, continuing, pausing, dying.
export function tryReload() {
  try { location.reload(); } catch (e) {}
  // if the host blocked reload, the overlay stays up (keep:true) — say why
  setTimeout(() => toast('SYSTEM', 'Reload blocked by host page', 'Refresh the page manually to restart.'), 400);
}
export function die(cause) {
  if (S.over) return;
  S.over = true;
  S.dead = cause;
  Snd.alarm(false); Snd.disco(false); Snd.play('death'); Snd.rumble(0);
  const iron = S.diff === 'iron';
  if (iron) wipeSave();
  const buttons = [];
  if (!iron && Save.checkpoint) buttons.push({ label: `WAKE AT DAWN (SOL ${Save.checkpoint.sol})`, fn: () => restoreCheckpoint() });
  buttons.push({ label: 'RESTART FROM SOL 1', ghost: !iron, keep: true, fn: () => { wipeSave(); tryReload(); } });
  showOverlay({
    title: 'YOU DIED ON MARS',
    subtitle: `Sol ${S.sol} · ${(S.stats.driven / 1000).toFixed(1)} km driven · ${S.stats.potatoes} potatoes grown` + (iron ? ' · SPACE PIRATE: save deleted' : ''),
    body: cause + (iron ? '\n\nYou knew the deal.' : '\n\nNobody plants the flag on the first try.'),
    buttons,
  });
}

export function showPause() {
  if (S.uiOpen || S.over || !S.started || S.mode === 'cutscene') return;
  saveGame();
  showOverlay({
    title: 'PAUSED',
    subtitle: 'progress saved. the potatoes are fine. probably.',
    body: 'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · JUMP <span class="kbd">SPACE</span> · INTERACT <span class="kbd">E</span> (hold)\n' +
      'O2 CANDLE <span class="kbd">X</span> · EXIT ROVER <span class="kbd">F</span> · CAMERA <span class="kbd">V</span> · MAP <span class="kbd">M</span> · COLONY <span class="kbd">C</span> · JOURNAL <span class="kbd">J</span>\n\n' +
      `Survive to Sol ${S.rescueSol}. Watch the six bars. The rover refills your suit;\n` +
      'the Hab refills the rover; the sun refills the Hab. Keep the chain alive.',
    buttons: [
      { label: 'RESUME', fn: () => tryLock() },
      { label: 'RESTART RUN', ghost: true, keep: true, fn: () => { wipeSave(); tryReload(); } },
    ],
  });
  mountAudioControls();                           // volume sliders, above the buttons
}

// ============================================================
// 33. BOOT & START
// ============================================================
export let bootPhase = 'init';
export function newGame(diffKey) {
  S.diff = diffKey;
  S.rescueSol = DIFFICULTIES[diffKey].rescueSol;
  S.drainMult = DIFFICULTIES[diffKey].drain;
  initStorms();                                   // before pickSpawn: it rejects storm cells
  World.spawn = pickSpawn(Math.random);
  // start the global sun so it is ~08:00 LOCAL time at the crash site
  S.tod = ((-(World.spawn.lon + 58.4) / 360) % 1 + 1) % 1;
  updateSunDir();
  buildWorldAtSpawn();
  // cold open: wake ~85m from the hab, suit leaking, facing home
  player.q.copy(World.hab.quaternion);
  frameMove(player.q, 0.3, 0.9, 85, R);
  syncPlayerPos();
  frameYaw(player.q, bearingTo(player.pos, World.hab.position, player.q));
  player.alt = 0; syncPlayerPos();
  S.started = true;
  tryLock();
  Snd.wind(0.2);
  log('Suit O2 at 46% and leaking. The Hab is that way. RUN.', 'sys');
  const ll = `lat ${World.spawn.lat.toFixed(1)}°, lon ${World.spawn.lon.toFixed(1)}°E — ${regionName(World.spawn.v)}`;
  setTimeout(() => log(`Crash site logged: ${ll}. Somewhere on Mars. Emphasis on "somewhere."`), 5500);
  checkpoint();
}
export function continueGame(saved) {
  S.diff = saved.diff || 'survival';
  S.rescueSol = DIFFICULTIES[S.diff].rescueSol;
  S.drainMult = DIFFICULTIES[S.diff].drain;
  World.spawn = { lat: saved.spawn.lat, lon: saved.spawn.lon, v: llToVec(saved.spawn.lat, saved.spawn.lon) };
  buildWorldAtSpawn();
  initStorms();
  applyState(saved);
  S.started = true;
  Save.checkpoint = saved;
  tryLock();
  Snd.wind(0.2);
  log(`Sol ${S.sol}. Still here. Still farming. Still winning, technically.`);
  if (saved.migrated && saved.migrated.includes('terrain')) {
    setTimeout(() => log('Survey update: the planet is now built from real orbital elevation data. Same Mars, truer ground — your colony has been re-seated on it.', 'nasa'), 2500);
  }
}
export let worldBuilt = false;
export function buildWorldAtSpawn() {
  if (worldBuilt) return;
  worldBuilt = true;
  addSitePads(World.spawn);
  buildHabColony(World.spawn);
  initRoverAt(_v1.copy(World.rover.group.position).normalize(), 0.8);
  buildStorySites();
}

export function showStart() {
  const saved = loadSavedData();
  const buttons = [];
  if (saved) buttons.push({ label: `▶ CONTINUE — SOL ${saved.sol}`, fn: () => { Snd.init(); Snd.resume(); continueGame(saved); } });
  buttons.push({
    label: saved ? 'NEW GAME (new random site)' : '▶ CLICK TO SUIT UP', ghost: !!saved,
    keep: true,
    fn: () => { Snd.init(); Snd.resume(); showDifficulty(); },
  });
  showOverlay({
    title: 'STRANDED II',
    subtitle: 'the whole planet. all of it. against you.',
    body:
      'The storm hit. The crew evac\'d. Your bio-monitor said you were dead.\n' +
      'It exaggerated. You are stranded <b>somewhere on Mars</b> — a real Mars:\n' +
      'Olympus Mons, Valles Marineris, both ice caps, and every probe humanity\n' +
      'ever threw at this planet, rusting exactly where history left it.\n\n' +
      'Grow food. Make water. Salvage the dead landers. Find Pathfinder in\n' +
      'Ares Vallis. Call home. Then drive to Schiaparelli crater and fly out.\n\n' +
      'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · INTERACT <span class="kbd">E</span> hold · MAP <span class="kbd">M</span> · COLONY <span class="kbd">C</span> · JOURNAL <span class="kbd">J</span>' +
      (unreadableSaveExists() ? '\n\n<b>A saved game was found, but it is from a version this build cannot read, so it cannot be continued.</b>' : ''),
    buttons,
  });
}
export function showDifficulty() {
  const mk = (k) => ({ label: DIFFICULTIES[k].name, ghost: k !== 'survival', fn: () => newGame(k) });
  showOverlay({
    title: 'CHOOSE YOUR MARS',
    body: Object.keys(DIFFICULTIES).map(k =>
      `<b>${DIFFICULTIES[k].name}</b>\n${DIFFICULTIES[k].desc}`).join('\n\n'),
    buttons: [mk('story'), mk('survival'), mk('iron')],
  });
}
