import { canPhoto, enterPhoto } from './photo.js';
import { log, showOverlay, toast, uiHooks } from '../ui/dom.js';
import { DIFFICULTIES, S } from './state.js';
import { Snd } from '../audio/sound.js';
import { Save, applyState, checkpoint, loadSavedData, restoreCheckpoint, saveGame, unreadableSaveExists, wipeSave } from './save.js';
import { tryLock } from './input.js';
import { initStorms, updateSunDir } from './sim.js';
import { World, addSitePads, buildHabColony, buildStorySites, pickSpawn } from '../world/build.js';
import { frameMove, frameYaw, player, syncPlayerPos } from './player.js';
import { R } from '../planet/constants.js';
import { bearingTo, fmtClock } from '../ui/hud.js';
import { regionName } from '../planet/features.js';
import { llToVec } from '../planet/geo.js';
import { initRoverAt } from './rover.js';
import { _v1 } from '../core/scratch.js';
import { applyAudioSettings, menuHooks, showPauseMenu, showTitle } from '../ui/menus.js';
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
  const back = !iron && Save.checkpoint ? Save.checkpoint.sol : 0;
  if (back) buttons.push({ label: `Wake at dawn (Sol ${back})`, fn: () => restoreCheckpoint() });
  buttons.push({ label: 'Restart from Sol 1', ghost: !iron, keep: true, fn: () => { wipeSave(); tryReload(); } });
  showOverlay({
    kind: 'death',
    kicker: `Sol ${S.sol} · ${DIFFICULTIES[S.diff].name}` + (iron ? ' · save deleted' : ''),
    title: 'You died on Mars',
    // (the sol he reached, not "13 sols survived" for a death on Sol 13: he saw twelve of them out)
    stats: [['Sol reached', S.sol], ['Driven', `${(S.stats.driven / 1000).toFixed(1)}<small>km</small>`], ['Meals grown', S.stats.potatoes + (S.stats.produce || 0)]],
    // (what waking at dawn costs is said: it was a button with a sol in it and nothing about what is lost)
    body: cause + (iron ? '\n\nYou knew the deal.' : '\n\nNobody plants the flag on the first try.') +
      (back ? `\n\n<b>Wake at dawn</b> takes you back to the last dawn you saw, on Sol ${back}: what you have done since is undone.` : ''),
    buttons,
  });
}

export function showPause() {
  if (S.uiOpen || S.over || !S.started || S.mode === 'cutscene') return;
  saveGame();
  showPauseMenu({
    sol: S.sol, time: fmtClock(), diffName: DIFFICULTIES[S.diff].name, rescueSol: S.rescueSol,
    region: regionName(_v1.copy(player.pos).normalize()), uplink: !!S.pf.connected,
    onResume: () => tryLock(),
    onPhoto: canPhoto() ? () => { enterPhoto(); } : null,
    onRestart: () => { wipeSave(); tryReload(); },
    onQuit: () => { saveGame(); tryReload(); },
  });
}
// the interface pauses the game itself in two cases: a phone turned upright, and before a reload
uiHooks.pause = showPause;
menuHooks.save = saveGame;

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
  log('Suit holed: 46 on the gauge and falling. The Hab is that way. RUN.', 'suit');
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
  if (saved.migrated && saved.migrated.includes('pacing')) {
    setTimeout(() => log(`Mission clock recalibrated: a sol now runs more than twice as long, and the rescue window moved to Sol ${S.rescueSol}. Your sol count was converted to match.`, 'nasa'), 6500);
  }
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
  const audio = () => { Snd.init(); Snd.resume(); applyAudioSettings(); };
  showTitle({
    saved: saved ? {
      sol: saved.sol, diffName: DIFFICULTIES[saved.diff || 'survival'].name,
      region: regionName(llToVec(saved.spawn.lat, saved.spawn.lon)),
    } : null,
    unreadable: unreadableSaveExists(),
    onContinue: () => { audio(); continueGame(saved); },
    onNewGame: (diffKey) => { audio(); newGame(diffKey); },
  });
}
