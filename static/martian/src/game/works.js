/*
 * The works of a base at work: the kiln, the smelter and the glassworks (what they are and what they make is in
 * game/base.js; how one is set down is in game/interactables.js; its sheet is ui/works.js).
 *
 * A works is given a job: so many batches of one of the things it makes. What the batches take is paid when the
 * job is given, each batch takes its hours and its share of the Hab's power, and what it makes goes to the stores
 * as each batch comes out. It goes on by itself, through the night as well, and stands waiting when the Hab has no
 * power to spare. One job at a time.
 */
import { BAL, S, isBase } from './state.js';
import { HOUR, WORK_BY_ID } from './base.js';
import * as THREE from 'three';
import { World, addSupplyPod, placeAt } from '../world/build.js';
import { groundDist, vecToLl } from '../planet/geo.js';
const _pad = new THREE.Vector3();
import { ITEM_NAMES, hasCost, payCost } from './inventory.js';
import { log } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';

/** Below this much of the Hab's power, the works stand idle: the Hab comes first. */
export const WORKS_POWER_FLOOR = 12;

/** The works that stand: the records of World.builtMeshes that are one. */
export const works = () => World.builtMeshes.filter((b) => b.def && b.def.jobs);
/** How many of a kind of thing stand (of a building, no more than are any use). */
export function standing(kind) {
  let n = 0;
  for (const b of World.builtMeshes) if (b.kind === kind) n++;
  const def = WORK_BY_ID[kind];
  return def && def.most ? Math.min(def.most, n) : n;
}
/** What the Hab's water tanks hold between them, litres. */
export const waterCap = () => BAL.waterMax + 240 * standing('tank');
/** What the battery banks hold in reserve, in per cent of the Hab's own store. */
export const reserveCap = () => 100 * standing('battery');
/** What is in the reserve now. */
export const reserve = () => (S.base && S.base.reserve) || 0;
/** How many times over the solar fields gather what the Hab's own array does. */
export const solarFields = () => standing('solarField');
/**
 * The battery banks, each tick after the Hab's own store has been reckoned: what the Hab has above nine tenths goes
 * into the reserve, and when it falls under three tenths the reserve comes back to hold it there.
 */
export function updateReserve() {
  const cap = reserveCap();
  if (!cap || !S.base) return;
  let r = Math.min(S.base.reserve || 0, cap);
  if (S.power > 90 && r < cap) { const m = Math.min(S.power - 90, cap - r); S.power -= m; r += m; }
  else if (S.power < 30 && r > 0) { const m = Math.min(30 - S.power, r); S.power += m; r -= m; }
  S.base.reserve = r;
}
/** The job a works is doing (an entry of its `jobs`), or null. */
export const jobOf = (b) => (b && b.job ? b.def.jobs.find((j) => j.id === b.job.id) || null : null);
/** What `n` batches of a job take in all. */
export function jobCost(job, n = 1) { const c = {}; for (const k in job.in) c[k] = job.in[k] * n; return c; }
/** How many batches of a job the stores would cover (20 at most: a day's work). */
export function batchesInHand(job) {
  let n = 20;
  for (const k in job.in) n = Math.min(n, Math.floor((S.inv[k] || 0) / job.in[k]));
  return n;
}
/** "2 h", "1 h 30 min". */
export function hoursText(h) { const m = Math.round(h * 60); return m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`; }
/** "3 Regolith + 1 Basalt" */
export function things(o) { return Object.keys(o).map((k) => `${o[k]} ${(ITEM_NAMES[k] || k).toLowerCase()}`).join(' + '); }

/** Give a works a job of n batches. Returns true if it took it. */
export function startJob(b, id, n) {
  const job = b.def.jobs.find((j) => j.id === id);
  if (!job || b.job || n < 1 || !hasCost(jobCost(job, n))) return false;
  payCost(jobCost(job, n));
  b.job = { id, left: n, of: n, t: 0 };
  Snd.play('terminal');
  return true;
}
/** Stop a works: what has not yet gone into the fire comes back to the stores; the batch in the fire is lost. */
export function stopJob(b) {
  const job = jobOf(b);
  if (!job) { b.job = null; return; }
  const back = b.job.left - (b.job.t > 0 ? 1 : 0);
  for (const k in job.in) S.inv[k] = (S.inv[k] || 0) + job.in[k] * back;
  b.job = null;
  b.working = false;
}
/** What a works is doing, in a line: for the prompt beside it and the head of its sheet. */
export function jobLine(b) {
  const job = jobOf(b);
  if (!job) return 'Standing idle';
  const batch = b.job.of - b.job.left + 1, pct = Math.round((b.job.t / (job.hours * HOUR)) * 100);
  const where = b.job.of > 1 ? `batch ${batch} of ${b.job.of}, ${pct}%` : `${pct}%`;
  return S.power < WORKS_POWER_FLOOR ? `${job.verb}: waiting for Hab power (${where})` : `${job.verb}: ${where}`;
}

/**
 * The landing pad, each dawn: ten sols after it is built, and every ten after, a supply drop comes down on it
 * (unless the last one still stands there unopened). Circuit boards come this way and no other: nothing on Mars
 * makes them.
 */
export function padDrop() {
  const pad = World.builtMeshes.find((b) => b.kind === 'pad');
  if (!pad || !S.base) return null;
  if (!S.base.padSol) { S.base.padSol = S.sol; return null; }
  if (S.sol - S.base.padSol < 10) return null;
  if (World.pods.some((p) => !p.taken && groundDist(p.group.position, pad.group.position) < 8)) return null;
  S.base.padSol = S.sol;
  S.base.drops = (S.base.drops || 0) + 1;
  // (three boards a drop: a tower takes three, and a second solar field and its battery bank three between them)
  const loot = { circuit: 3, scrap: 4, rations: 4, ...(S.base.drops % 2 ? { seedSoy: 1 } : { seedTomato: 1 }) };
  const ll = vecToLl(_pad.copy(pad.group.position).normalize());
  const pod = addSupplyPod(placeAt(ll.lat, ll.lon, S.sol * 1.7), loot, 'Open the supply drop');
  Snd.jingle();
  log('Supply drop on the pad, dead centre. Somebody at JPL just won a bet.', 'nasa');
  return pod;
}

/**
 * The works go on. `dt`: the seconds of play that have passed (game/sim.js calls this from applyRates, so a night
 * slept through counts).
 */
export function updateWorks(dt) {
  if (!isBase()) return;
  for (const b of World.builtMeshes) {
    if (!b.def || !b.def.jobs) continue;
    const job = jobOf(b);
    if (!job) { b.job = null; b.working = false; continue; }
    const dur = job.hours * HOUR;
    let left = dt;
    b.working = false;
    while (left > 1e-9 && b.job) {
      if (S.power < WORKS_POWER_FLOOR) break;                 // (no power to spare: the job waits where it is)
      b.working = true;
      const step = Math.min(left, dur - b.job.t);
      b.job.t += step;
      left -= step;
      S.power = Math.max(0, S.power - (job.power * step) / dur);
      if (b.job.t >= dur - 1e-6) {
        let made = 0;
        for (const k in job.out) { S.inv[k] = (S.inv[k] || 0) + job.out[k]; made += job.out[k]; }
        S.stats.made = (S.stats.made || 0) + made;
        b.job.left--;
        b.job.t = 0;
        if (b.job.left <= 0) {
          const n = b.job.of;
          b.job = null;
          b.working = false;
          Snd.pickup();
          log(`The ${b.def.name.toLowerCase()} is done: you carry ${things(jobCost({ in: job.out }, n))} more.`, 'sys');
        }
      }
    }
  }
}
