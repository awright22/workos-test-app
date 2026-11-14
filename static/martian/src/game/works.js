/*
 * The works of a base at work: the kiln, the smelter and the glassworks (what they are and what they make is in
 * game/base.js; how one is set down is in game/interactables.js; its sheet is ui/works.js).
 *
 * A works is given a job: so many batches of one of the things it makes. What the batches take is paid when the
 * job is given, each batch takes its hours and its share of the Hab's power, and what it makes goes to the stores
 * as each batch comes out. It goes on by itself, through the night as well, and stands waiting when the Hab has no
 * power to spare. One job at a time.
 */
import { S, isBase } from './state.js';
import { HOUR } from './base.js';
import { World } from '../world/build.js';
import { ITEM_NAMES, hasCost, payCost } from './inventory.js';
import { log } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';

/** Below this much of the Hab's power, the works stand idle: the Hab comes first. */
export const WORKS_POWER_FLOOR = 12;

/** The works that stand: the records of World.builtMeshes that are one. */
export const works = () => World.builtMeshes.filter((b) => b.def);
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
 * The works go on. `dt`: the seconds of play that have passed (game/sim.js calls this from applyRates, so a night
 * slept through counts).
 */
export function updateWorks(dt) {
  if (!isBase()) return;
  for (const b of World.builtMeshes) {
    if (!b.def) continue;
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
          log(`The ${b.def.name.toLowerCase()} is done: ${things(jobCost({ in: job.out }, n))} in the stores.`, 'sys');
        }
      }
    }
  }
}
