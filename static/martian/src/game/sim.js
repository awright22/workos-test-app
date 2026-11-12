import { comfortCheer } from './comforts.js';
import { CROPS, MORALE_WORD, breakfast, cheer, foodTotal, healRate, hearMusic, moraleBand } from './farm.js';
import * as THREE from 'three';
import { BAL, S, machineEff, roverPowerCap, suitCap } from './state.js';
import { dawnFaults, wearMachines } from './machines.js';
import { bindWorld, deliverMail } from './mail.js';
import { ctx } from './ctx.js';
import { _du, _pe, _pn, _v1, _v2, _v3 } from '../core/scratch.js';
import { clamp, hash3, lerp, smoothstep } from '../core/math.js';
import { D2R, R, SOL_HOURS } from '../planet/constants.js';
import { flashScreen, hideOverlay, log } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';
import { World, addSupplyPod, placeAt } from '../world/build.js';
import { angDist, fmtDist, groundDist, llToVec, tangentBasis, vecToLl } from '../planet/geo.js';
import { moveInputMag, sprinting } from './input.js';
import { player, playerUnit } from './player.js';
import { syncPlot } from './interactables.js';
import { die } from './flow.js';
import { syncAllVisuals } from './visuals.js';
import { SOL_LOGS } from './text.js';
import { checkpoint, saveGame } from './save.js';
import { showSleep, showSleepSummary } from '../ui/menus.js';
// The simulation: resources, time, storms, events, sleep.
/** The season: late northern spring. The sun stands 14 degrees north of the equator, so the
 *  north pole has the midnight sun, the far south is in polar night, and days are longer in
 *  the north. (Mars is tilted 25 degrees; the game holds one season.) */
export const SUN_DECLINATION = 14 * D2R;
export function updateSunDir() {
  const a = S.tod * Math.PI * 2, c = Math.cos(SUN_DECLINATION);
  ctx.engine.sunDir.set(Math.cos(a) * c, Math.sin(SUN_DECLINATION), Math.sin(a) * c);
}
/** The colony's clock: fraction of the sol elapsed since dawn (06:00 local) at the Hab.
 *  A new sol begins when this wraps, wherever on the planet the astronaut is. */
export function colonyClock() {
  const lon = World.spawn ? World.spawn.lon : 0;
  const local = (((lon / 360 + S.tod + 0.5) % 1) + 1) % 1;      // 0 = local midnight
  return (((local - 6 / SOL_HOURS) % 1) + 1) % 1;
}
/** Advance the global sun phase; returns true if the colony passed dawn (a new sol). */
function advanceClock(dtSol) {
  const before = colonyClock();
  S.tod = (S.tod + dtSol) % 1;
  return colonyClock() < before - 0.5;
}

/** Sine of the sun's elevation at the camera. */
/** Local clock where the astronaut is, in hours (a sol has 24.66). */
export function localHour() {
  _du.copy(player.pos).normalize();
  const lon = Math.atan2(-_du.z, _du.x) / (Math.PI * 2);
  return ((((lon + S.tod + 0.5) % 1) + 1) % 1) * SOL_HOURS;
}
/** Is it a time to sleep? True, or why not. Sleeping runs to the next dawn, so it is not offered in the
 *  morning: a second press just after waking would throw a whole sol away. */
export function sleepTime() {
  const h = localHour();
  if (localSunEl() <= 0.25 && (h >= 16 || h < 4.5)) return true;
  return h >= 4.5 && h < 10 ? 'The day has only just started' : 'Too much daylight to waste';
}
export function localSunEl() { return _du.copy(ctx.engine.camera.position).normalize().dot(ctx.engine.sunDir); }

// local air temperature (°C) — display + cold penalties
export function localTempC(upVec, sunEl) {
  const lat = Math.abs(Math.asin(clamp(upVec.y, -1, 1)) / D2R);
  return Math.round(-63 + 85 * Math.max(0, sunEl) - 35 * Math.pow(lat / 90, 2) - (sunEl < 0 ? 22 : 0));
}

export const warnedLow = {};
export function warnLow(key, val, thresh, msg) {
  if (val <= thresh && !warnedLow[key]) { warnedLow[key] = true; log(msg, 'sys'); Snd.bad(); }
  else if (val > thresh + 8) warnedLow[key] = false;
}
export function avgPanelOutput() {
  let s = 0;
  for (const p of World.panels) s += 1 - clamp(p.dust, 0, 1);
  let base = s / World.panels.length;
  // deployed solar panels near the hab boost generation
  for (const b of World.builtMeshes)
    if (b.kind === 'solar' && groundDist(b.group.position, World.hab.position) < 150) base += 0.12;
  return base;
}
export function habSunEl() { return _v1.copy(World.hab.position).normalize().dot(ctx.engine.sunDir); }

export function applyRates(dt, sleeping) {
  const D = S.drainMult;
  const m = (sleeping ? 0.5 : 1) * D;
  const SL = BAL.solLen;
  const habDay = clamp(habSunEl() * 3, 0, 1);
  const playerSunEl = localSunEl();
  // --- hab power ---
  const stormAtHab = stormIntensityAt(World.hab.position);
  const gen = (BAL.solarGen / SL) * habDay * avgPanelOutput() * lerp(1, BAL.stormGenMult, stormAtHab);
  let baseDraw = BAL.powerBase * (S.upgrades.insulation ? 0.7 : 1);
  const tempAtHab = localTempC(_v1.copy(World.hab.position).normalize(), habSunEl());
  if (tempAtHab < -70 && !S.upgrades.rtg) baseDraw += 8;             // heaters fight the cold
  let rtgGen = S.upgrades.rtg ? 6 / SL : 0;
  S.power = clamp(S.power + (gen + rtgGen - (baseDraw / SL) * m) * dt, 0, BAL.powerMax);
  const powered = S.power > 0.5;
  // --- panel dust ---
  const dustMult = S.upgrades.wiper ? 0.3 : 1;
  const dr = lerp(BAL.dustRate, BAL.stormDustRate, stormAtHab) / SL * dustMult * dt;
  for (const p of World.panels) p.dust = clamp(p.dust + dr, 0, 1);
  // --- hab O2 ---
  let o2d = -(BAL.o2Drain / SL) * m;
  if (powered) o2d += (BAL.o2Gen / SL) * machineEff('oxygenator');
  if (S.breach.active) o2d -= BAL.o2BreachDrain / SL;
  S.o2 = clamp(S.o2 + o2d * dt, 0, 100);
  // --- suit O2 & rover tank ---
  if (!sleeping) {
    if (S.mode === 'rover') {
      if (S.suit < suitCap() && S.roverO2 > 0) {
        const take = Math.min(25 * dt, suitCap() - S.suit, S.roverO2);
        S.suit += take; S.roverO2 -= take;
      }
      // parked at home: hab tops off the rover
      if (groundDist(World.rover.group.position, World.hab.position) < 60 && S.o2 > 30)
        S.roverO2 = clamp(S.roverO2 + 10 * dt, 0, BAL.roverO2Cap);
    } else if (S.inside && S.o2 > 3) {
      S.suit = clamp(S.suit + 26 * dt, 0, suitCap());
    } else {
      const moving = moveInputMag().mag > 0.12;
      let rate = moving ? (sprinting() ? BAL.suitRun : BAL.suitWalk) : BAL.suitRest;
      if (S.inside) rate = BAL.suitIndoors;
      if (S.upgrades.recycler) rate *= 0.75;
      rate *= 1 + (1 - machineEff('suit')) * 0.9;                   // a spent scrubber wastes air
      if (S.flags.coldOpen) rate *= 1.9;
      const t = localTempC(playerUnit(), playerSunEl);
      if (t < -85) rate *= 1.25;                                     // suit heater sips O2 reserve
      S.suit = clamp(S.suit - rate * D * dt, 0, suitCap());
    }
    // rover recharges near hab or a deployed solar panel
    if (groundDist(World.rover.group.position, World.hab.position) < 60 && S.power > 10)
      S.roverPower = clamp(S.roverPower + (BAL.roverChargeAtHab / 60) * dt, 0, roverPowerCap());
    for (const b of World.builtMeshes)
      if (b.kind === 'solar' && groundDist(b.group.position, World.rover.group.position) < 25)
        S.roverPower = clamp(S.roverPower + (8 / 60) * Math.max(0, playerSunEl) * dt, 0, roverPowerCap());
  } else {
    S.suit = suitCap();
  }
  // --- wear on the machines ---
  wearMachines(dt / SL * (sleeping ? 0.5 : 1), stormAtHab, !sleeping && S.mode === 'walk' && !S.inside ? dt : 0);
  // --- water ---
  let wd = -(BAL.waterDrain / SL) * m;
  if (powered) wd += (BAL.waterRecl / SL) * machineEff('reclaimer');
  S.water = clamp(S.water + wd * dt, 0, BAL.waterMax);
  // --- crops (greenhouse plots pause in a local storm? no — they're sealed domes) ---
  const dtSol = dt / SL;
  for (const pl of World.plots) {
    if (pl.state !== 'growing') continue;
    const crop = CROPS[pl.crop] || CROPS.potato;
    if (pl.growth >= 0.5 && pl.watered < crop.waterings) continue;
    pl.growth += dtSol / crop.growSols;
    if (pl.growth >= 1) {
      pl.growth = 1; pl.state = 'ready';
      if (!sleeping) { Snd.ok(); log(crop === CROPS.potato ? 'A plot is ready. Potato o\'clock.' : `The ${crop.name.toLowerCase()} are ready.`, 'sys'); }
      syncPlot(pl);
    } else if (Math.random() < dt * 0.06) syncPlot(pl);
  }
  // --- vitals ---
  let hd = 0;
  if (S.water <= 0) hd += BAL.starveDrain / SL;
  if (foodTotal() <= 0) hd += BAL.starveDrain / SL;
  const suffocating = S.suit <= 0 && !(S.inside && S.o2 > 3) && S.mode !== 'rover' && !sleeping;
  if (suffocating) hd += BAL.suffocateDrain;
  if (S.inside && S.o2 <= 0 && S.suit <= 0) hd += BAL.suffocateDrain;
  if (S.mode === 'rover' && S.roverO2 <= 0 && S.suit <= 0) hd += BAL.suffocateDrain;
  if (hd > 0) S.health = clamp(S.health - hd * D * dt, 0, BAL.healthMax);
  else if (S.water > 5 && foodTotal() > 0) S.health = clamp(S.health + (BAL.healRegen / SL) * m * healRate() * dt, 0, BAL.healthMax);
  if (!sleeping) {
    warnLow('suit', S.suit, suitCap() * 0.25, 'Suit O2 at 25%. Head for air. Now-ish.');
    warnLow('suit2', S.suit, suitCap() * 0.1, 'SUIT O2 CRITICAL. RUN.');
    warnLow('o2', S.o2, 25, 'Hab O2 low. Oxygenator needs power. Panels need wiping. You see where this is going.');
    warnLow('water', S.water, 10, 'Water reserves critical. Hydrazine, ice, or thirst — pick one.');
    warnLow('power', S.power, 15, 'Hab battery low. Life support idles at zero. Wipe the panels.');
    warnLow('rpow', S.roverPower, 20, 'Rover battery low. It solar-trickles when parked in daylight.');
    warnLow('health', S.health, 40, 'Vitals degrading. Eat. Drink. Sleep. In any order.');
    if (S.suit <= 12 || S.o2 <= 10) { if (!S.flags.closeCall) { S.flags.closeCall = true; S.stats.closeCalls++; cheer(-3); } }
    else S.flags.closeCall = false;
  }
  if (S.health <= 0 && !S.over) {
    let cause = 'Mars. The cause is always Mars.';
    if (suffocating) cause = 'Asphyxiation, a long way from a door. Mars counts that as a win.';
    else if (S.inside && S.o2 <= 0) cause = 'The Hab ran out of air. The potatoes watched.';
    else if (S.water <= 0) cause = 'Dehydration. On a planet that used to have oceans. Rude.';
    else if (foodTotal() <= 0) cause = 'Starvation. The botany project needed more time.';
    die(cause);
  }
}

// ============================================================
// 21. TIME, ROAMING STORMS, EVENTS
// ============================================================
export function initStorms() {
  S.storm.cells = [];
  for (let i = 0; i < 3; i++) {
    S.storm.cells.push({
      lat: (hash3(i, 77, 3) * 2 - 1) * 55, lon: hash3(i, 13, 41) * 360,
      r: 1800 + hash3(i, 5, 9) * 2600,                 // meters of world radius
      drift: 20 + hash3(i, 8, 2) * 30,                 // m per sol of drift
      dir: hash3(i, 1, 6) * Math.PI * 2,
      peak: 0.7 + hash3(i, 3, 3) * 0.3,
    });
  }
}
export const _sv = new THREE.Vector3();
export function stormCellVec(c, out) { return llToVec(c.lat, c.lon, out); }
export function stormIntensityAt(posWorld) {
  let best = 0;
  _v3.copy(posWorld).normalize();
  for (const c of S.storm.cells) {
    stormCellVec(c, _sv);
    const d = angDist(_v3.x, _v3.y, _v3.z, _sv.x, _sv.y, _sv.z) * R;
    if (d < c.r) best = Math.max(best, c.peak * smoothstep(1, 0.35, d / c.r));
  }
  // scripted early storms hit the colony on sols 5 and 9 (teaching beats)
  if ((S.sol === 5 || S.sol === 9) && colonyClock() > 0.12 && colonyClock() < 0.5) {
    const dHab = groundDist(posWorld, World.hab.position);
    if (dHab < 4000) best = Math.max(best, 0.85 * smoothstep(4000, 1200, dHab));
  }
  return best;
}
export function advanceStorms(dtSol) {
  for (const c of S.storm.cells) {
    const dist = c.drift * dtSol;
    const u = stormCellVec(c, _sv);
    tangentBasis(u, _pe, _pn);
    u.addScaledVector(_pe, Math.cos(c.dir) * dist / R).addScaledVector(_pn, Math.sin(c.dir) * dist / R).normalize();
    const ll = vecToLl(u);
    c.lat = ll.lat; c.lon = ll.lon;
    c.dir += (hash3(Math.floor(S.sol * 7), Math.floor(c.lon), 3) - 0.5) * dtSol * 2;
  }
}

export function advanceTime(dt) {
  const dtSol = dt / BAL.solLen;
  const dawn = advanceClock(dtSol);
  advanceStorms(dtSol);
  if (dawn) newSol();
  // local storm intensity where the player is
  // (S.storm.hold, set through the debug hook, pins the weather for tests and pictures)
  const target = typeof S.storm.hold === 'number' ? S.storm.hold : stormIntensityAt(S.mode === 'rover' ? World.rover.group.position : player.pos);
  S.storm.i = clamp(S.storm.i + Math.sign(target - S.storm.i) * dt * 0.12, 0, Math.max(target, S.storm.i - dt * 0.12));
  if (S.storm.i > 0.4 && !S.inside && S.mode === 'walk') S.stats.stormOut += dt;
  if (S.disco) { S.stats.discoTime += dt; hearMusic(dt); }       // counted in game time (it was once per drawn frame)
  // breach event: waits for a sol >= BREACH_SOL when the player is near home
  if (S.sol >= 7 && colonyClock() > 0.08 && !S.breach.done && !S.breach.active &&
      groundDist(S.mode === 'rover' ? World.rover.group.position : player.pos, World.hab.position) < 800 &&
      !S.flags.coldOpen && S.mode !== 'cutscene') {
    S.breach.active = true;
    cheer(-8);
    S.breach.timer = 0;
    S.shake = 1.4;
    flashScreen('rgba(255,255,255,0.5)', 200);
    Snd.play('breach'); Snd.alarm(true);
    syncAllVisuals();
    log('BREACH. The Hab canvas just blew. Air\'s screaming out. MOVE, WATNEY.', 'sys');
  }
  if (S.breach.active) {
    S.breach.timer += dt;
    if (S.breach.timer > 90 && !S.breach.cropsKilled) {
      S.breach.cropsKilled = true;
      cheer(-6);
      let killed = 0;
      for (const pl of World.plots) if (pl.state === 'growing') { pl.state = 'dead'; killed++; syncPlot(pl); }
      if (killed) log('The cold got in. The growing crops are dead. Ready trays survived. Small mercies.', 'sys');
    }
  }
}

bindWorld(World);
export function newSol() {
  S.sol++;
  const band = moraleBand();
  if (breakfast() === 'skipped') log('No breakfast. The stomach files a formal complaint.', 'sys');
  if (S.storm.i > 0.5) cheer(-2);                         // another morning with no sky
  cheer(comfortCheer());                                 // what he has made of the place
  if (!S.flags.moraleTold) {
    S.flags.moraleTold = true;
    setTimeout(() => log('MORALE is how I am holding up. Monotony and bad days wear it down. Different things on the plate, a cooked dinner, music, word from home and making this tent a home bring it back. In good spirits I work faster.', 'sys'), 16000);
  }
  if (moraleBand() !== band) {
    const now = moraleBand();
    setTimeout(() => log(now === 'low' ? 'I am tired in a way sleep does not fix. A hot dinner, some music, a word from home: I need one of them.'
      : now === 'high' ? 'Good morning, Mars. You are still trying to kill me, and today I do not mind.'
        : band === 'high' ? 'The shine has gone off the morning. Back to merely surviving.' : 'Better. Not good. Better.', 'sys'), 9000);
  }
  if (S.sol === S.rescueSol - 1) setTimeout(() => log(`Sol ${S.sol}. One more sol. Packing my potato. Singular. It's symbolic.`), 1200);
  else if (SOL_LOGS[S.sol]) setTimeout(() => log(SOL_LOGS[S.sol]), 1200);
  if (S.sol === 4 && !S.flags.pfRevealed) {
    S.flags.pfRevealed = true;
    const d = groundDist(player.pos, World.pathfinder.position);
    setTimeout(() => log(`Found it in the charts: Pathfinder, dead since '97, ${fmtDist(d)} from here in Ares Vallis. If I fetch it, I can call Earth. Road trip.`), 6000);
    if (!S.flags.routePods) {
      S.flags.routePods = true;
      dropRoutePods();
    }
  }
  if (S.sol >= S.rescueSol && !S.flags.mavRevealed) revealMav();
  dawnFaults();
  deliverMail();
  // storm forecast (uplink gives you weather service; easy mode always has it)
  if (S.pf.connected || S.diff === 'story') {
    for (const c of S.storm.cells) {
      stormCellVec(c, _sv);
      if (angDist(_sv.x, _sv.y, _sv.z, _v3.copy(World.hab.position).normalize().x, _v3.y, _v3.z) * R < c.r + 2500) {
        setTimeout(() => log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa'), 5000);
        break;
      }
    }
  }
  if (S.sol === 5 || S.sol === 9) setTimeout(() => log('Sky\'s going brown at the horizon. Storm day. Wonderful.', 'sys'), 3000);
  checkpoint();
  saveGame();
}

// NASA drops supply pods along long expedition routes — random spawn stays fair
export function dropRoutePods() {
  const d = groundDist(World.hab.position, World.pathfinder.position);
  if (d < 6000) return;
  const n = Math.min(3, Math.floor(d / 6000) + 1);
  _v1.copy(World.hab.position).normalize();
  _v2.copy(World.pathfinder.position).normalize();
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    _v3.copy(_v1).lerp(_v2, t).normalize();
    addSupplyPod(placeAt(_v3, undefined, i * 2.1), { rations: 2, water: 10, candle: 1, scrap: 1 }, 'Open NASA route cache');
  }
  setTimeout(() => log(`NASA pre-dropped ${n} supply caches along the Pathfinder route. They appear on the map. Somebody up there likes me.`, 'nasa'), 9000);
}

export function revealMav() {
  S.flags.mavRevealed = true;
  const d = fmtDist(groundDist(player.pos, World.mav.position));
  if (S.pf.connected)
    log(`Launch window is OPEN. The Ares 4 MAV is fueled and waiting in Schiaparelli crater — ${d} out. Time to fly a convertible.`, 'nasa');
  else
    log(`Sol ${S.rescueSol}. NASA's original plan had the Ares 4 MAV launching from Schiaparelli about now — ${d} away. That rocket is my ride, phone call or no phone call.`);
  Snd.jingle();
}

// ============================================================
// 22. SLEEP (fast-forward to local dawn; review-hardened)
// ============================================================
export function sleepToDawn(inRover) {
  if (S.sleeping) return;
  S.sleeping = true;
  const before = { o2: S.o2, water: S.water, power: S.power, sol: S.sol, morale: S.morale };
  showSleep();
  // advance until the LOCAL sun crosses the horizon rising (max 1.3 sols for polar nights)
  const u = _v1.copy(inRover ? World.rover.group.position : player.pos).normalize().clone();
  let advanced = 0, rolled = false;
  const step = BAL.solLen / 40;
  let prevEl = u.dot(ctx.engine.sunDir);
  for (let i = 0; i < 60; i++) {
    const dawn = advanceClock(step / BAL.solLen);
    advanceStorms(step / BAL.solLen);
    if (dawn) { newSol(); rolled = true; }
    applyRates(step, true);
    if (S.over) { S.sleeping = false; return; }      // died in the night: keep the death overlay
    advanced += step;
    updateSunDir();
    const el = u.dot(ctx.engine.sunDir);
    if (advanced > BAL.solLen * 0.1 && prevEl < 0.03 && el >= 0.03) break;
    prevEl = el;
    if (advanced > BAL.solLen * 1.3) break;
  }
  // a night slept is a sol lived, even when the global sun phase didn't wrap
  void rolled;   // the sol turns at the colony's dawn; camping far from home does not force it
  if (S.over) { S.sleeping = false; return; }
  const growing = World.plots.filter(p => p.state === 'growing').length;
  const ready = World.plots.filter(p => p.state === 'ready').length;
  cheer(inRover ? -1 : 3);                                // a bunk is a bed; a driver's seat is not
  const notes = S.sol > before.sol ? [`Breakfast: ${S.diet.breakfast}`] : [];
  notes.push(`Morale ${Math.round(S.morale)} (${S.morale >= before.morale ? '+' : '−'}${Math.abs(Math.round(S.morale - before.morale))}): ${MORALE_WORD[moraleBand()].toLowerCase()}`);
  if (growing + ready > 0) notes.push(`Farm: ${growing} growing, ${ready} ready`);
  if (inRover) notes.push('Slept curled around the driver seat. The chiropractor is 225 million km away.');
  const summary = {
    sol: S.sol, notes,
    deltas: [
      { icon: 'hab', label: 'Hab <span class="chem">O<sub>2</sub></span>', from: before.o2, to: S.o2, unit: '%' },
      { icon: 'water', label: 'Water', from: before.water, to: S.water, unit: 'L' },
      { icon: 'power', label: 'Power', from: before.power, to: S.power, unit: '%' },
    ],
  };
  setTimeout(() => { if (!S.over) showSleepSummary(summary); }, 500);
  setTimeout(() => {
    if (S.over) { S.sleeping = false; return; }      // review finding: never dismiss a death screen
    hideOverlay();
    S.sleeping = false;
    S.health = clamp(S.health + BAL.sleepHeal, 0, BAL.healthMax);
    syncAllVisuals();
    checkpoint();
    saveGame();
  }, 2900);
}
