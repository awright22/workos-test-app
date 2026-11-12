import { DIFFICULTIES, OLD_RESCUE_SOL, S, suitCap } from './state.js';
import { World, addSupplyPod, buildDeployable, placeAt } from '../world/build.js';
import { llToVec, vecToLl } from '../planet/geo.js';
import { _v1 } from '../core/scratch.js';
import { player, syncPlayerPos } from './player.js';
import { roverF, syncRoverVisual } from './rover.js';
import { Snd } from '../audio/sound.js';
import { UI, hideOverlay, log } from '../ui/dom.js';
import { initScience } from './science.js';
import { syncAllVisuals } from './visuals.js';
// Checkpoints and the saved game.
export function serializeState() {
  return {
    v: SAVE_VERSION, diff: S.diff, spawn: { lat: World.spawn.lat, lon: World.spawn.lon },
    sol: S.sol, tod: S.tod,
    o2: S.o2, water: S.water, food: S.food, potatoes: S.potatoes, power: S.power,
    health: Math.max(S.health, 50), suit: suitCap(), roverPower: S.roverPower, roverO2: S.roverO2,
    hydrazine: S.hydrazine,
    inv: { ...S.inv }, upgrades: { ...S.upgrades }, blueprints: { ...S.blueprints },
    quests: { ...S.quests }, salvaged: { ...S.salvaged }, discovered: { ...S.discovered },
    achieved: { ...S.achieved }, checkedSystems: { ...S.checkedSystems },
    flags: { ...S.flags }, stats: { ...S.stats },
    science: S.science ? JSON.parse(JSON.stringify(S.science)) : null,
    breach: { ...S.breach }, pf: { ...S.pf },
    stormCells: S.storm.cells.map(c => ({ ...c })),
    plots: World.plots.map(p => ({ state: p.state, growth: p.growth, watered: p.watered })),
    panels: World.panels.map(p => p.dust),
    piles: World.soilPiles.map(p => p.left),
    pods: World.pods.map(p => p.taken),
    podLoot: World.pods.map(p => ({ loot: p.loot, label: p.label, blueprint: p.blueprint || null,
      ll: vecToLl(_v1.copy(p.group.position).normalize()) })),
    ice: World.iceSites.map(s => s.left),
    rtgTaken: World.rtgSite ? World.rtgSite.taken : false,
    built: World.builtMeshes.map(b => ({ kind: b.kind, charges: b.charges, yaw: b.yaw || 0,
      ll: vecToLl(_v1.copy(b.group.position).normalize()) })),
    playerQ: player.q.toArray(), roverQ: roverF.q.toArray(),
  };
}
export function applyState(d) {
  Object.assign(S, {
    sol: d.sol, tod: d.tod, o2: d.o2, water: d.water, food: d.food, potatoes: d.potatoes,
    power: d.power, health: d.health, suit: d.suit, roverPower: d.roverPower, roverO2: d.roverO2,
    hydrazine: d.hydrazine,
  });
  S.inv = { ...d.inv }; S.upgrades = { ...d.upgrades }; S.blueprints = { ...d.blueprints };
  S.quests = { ...d.quests }; S.salvaged = { ...d.salvaged }; S.discovered = { ...d.discovered };
  S.achieved = { ...d.achieved }; S.checkedSystems = { ...d.checkedSystems };
  S.flags = { ...d.flags }; S.stats = { ...d.stats };
  S.breach = { ...d.breach }; S.pf = { ...d.pf };
  if (d.science) S.science = JSON.parse(JSON.stringify(d.science)); else initScience();
  S.storm.cells = d.stormCells.map(c => ({ ...c }));
  S.storm.i = 0;
  // rebuild deployed structures FIRST so greenhouse plots exist before plot restore
  for (let i = World.builtMeshes.length; i < (d.built || []).length; i++) {
    const b = d.built[i];
    const bb = buildDeployable(b.kind, llToVec(b.ll.lat, b.ll.lon), b.yaw || 0);
    bb.charges = b.charges;
  }
  d.plots.forEach((cp, i) => { if (World.plots[i]) Object.assign(World.plots[i], cp); });
  d.panels.forEach((v, i) => { if (World.panels[i]) World.panels[i].dust = v; });
  d.piles.forEach((v, i) => { if (World.soilPiles[i]) World.soilPiles[i].left = v; });
  // rebuild dynamically dropped pods missing from the world (load path)
  for (let i = World.pods.length; i < (d.podLoot || []).length; i++) {
    const pd = d.podLoot[i];
    const pod = addSupplyPod(placeAt(pd.ll.lat, pd.ll.lon, i * 2.1), pd.loot, pd.label);
    if (pd.blueprint) pod.blueprint = pd.blueprint;
  }
  d.pods.forEach((v, i) => { if (World.pods[i]) World.pods[i].taken = v; });
  d.ice.forEach((v, i) => { if (World.iceSites[i]) World.iceSites[i].left = v; });
  if (World.rtgSite) World.rtgSite.taken = d.rtgTaken;
  for (let i = 0; i < Math.min(World.builtMeshes.length, d.built.length); i++)
    World.builtMeshes[i].charges = d.built[i].charges;
  player.q.fromArray(d.playerQ);
  player.alt = 0; player.vy = 0;
  roverF.q.fromArray(d.roverQ);
  roverF.speed = 0;
  S.over = false; S.dead = null; S.sleeping = false; S.mode = 'walk'; S.uiOpen = false;
  Snd.alarm(false); Snd.disco(false); S.disco = false;
  UI.vign.style.opacity = 0;
  syncPlayerPos();
  syncRoverVisual(0);
  syncAllVisuals();
  hideOverlay();
}
export const Save = { checkpoint: null };
export function checkpoint() {
  if (S.over) return;                    // review finding: never checkpoint a corpse
  Save.checkpoint = serializeState();
}
export function restoreCheckpoint() {
  if (!Save.checkpoint) { try { location.reload(); } catch (e) {} return; }
  applyState(JSON.parse(JSON.stringify(Save.checkpoint)));
  log(`Woke at dawn, Sol ${S.sol}. Bad dream. Probably prophetic. Let's not test it.`);
}
export const SAVE_KEY = 'stranded2-save';
export function saveGame() {
  if (S.over || !S.started) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState())); } catch (e) {}
}
/** Save format history:
 *    2  the first full-planet version (analytic terrain)
 *    3  real-elevation terrain; same fields. Positions are stored as directions on the sphere,
 *       so everything is simply re-seated on the new ground when an old save is loaded. */
export const SAVE_VERSION = 4;
/** Bring an older save up to the current format, or return null if it cannot be read. */
export function migrateSave(d) {
  if (!d || typeof d !== 'object' || !d.spawn || !d.playerQ) return null;
  if (d.v === 2) d = { ...d, v: 3, migrated: ['terrain'] };
  if (d.v === 3) {
    // sols became longer and rescue came forward: keep the save the same fraction of the way there
    const was = OLD_RESCUE_SOL[d.diff] || 45, now = (DIFFICULTIES[d.diff] || DIFFICULTIES.survival).rescueSol;
    d = { ...d, v: 4, sol: Math.max(1, Math.round(d.sol * now / was)), migrated: [...(d.migrated || []), 'pacing'] };
  }
  return d.v === SAVE_VERSION ? d : null;
}
export function loadSavedData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch (e) { return null; }
}
/** True when a save exists but this version of the game cannot read it (say so on the title). */
export function unreadableSaveExists() {
  try { return !!localStorage.getItem(SAVE_KEY) && !loadSavedData(); } catch (e) { return false; }
}
export function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
