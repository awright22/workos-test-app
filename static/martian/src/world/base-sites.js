/**
 * What Base mode adds to the planet: the mineral deposits (see game/base.js for what they are and why they lie
 * where they do).
 *
 * A deposit is a model on levelled ground, with six loose pieces in front of it that go as it is worked, the last
 * when it is worked out. Its place is chosen from a handful of candidates in its field: the most level, and in a
 * canyon or a crater the lowest, so that none is set on a wall.
 */
import { World, addSiteModel, placeAt, siteCollider } from './build.js';
import { DEPOSITS, baseState, depositCandidates } from '../game/base.js';
import { ctx } from '../game/ctx.js';
import { llToVec } from '../planet/geo.js';
import { elevationKm3, slopeAt } from '../planet/surface.js';
import { hash3 } from '../core/math.js';

let spots = null;
/** Where every deposit lies: [{ dep, field, v, lat, lon, key }]. Worked out once, on the land as it lies. */
export function depositSpots() {
  if (spots) return spots;
  spots = [];
  for (const dep of DEPOSITS) {
    for (const field of dep.fields) {
      for (let i = 0; i < field.n; i++) {
        let best = null, bestScore = 1e9;
        for (const [lat, lon] of depositCandidates(dep, field, i)) {
          const v = llToVec(lat, lon);
          const score = slopeAt(v, 30) + slopeAt(v, 9) * 0.5 + (field.low ? elevationKm3(v.x, v.y, v.z) * 0.08 : 0);
          if (score < bestScore) { bestScore = score; best = { v, lat, lon }; }
        }
        spots.push({ dep, field, ...best, key: `${dep.id}:${dep.fields.indexOf(field)}:${i}` });
      }
    }
  }
  return spots;
}

/** Level the ground under each deposit. Call before the terrain's pads are synced (flow.js, buildWorldAtSpawn). */
export function addDepositPads() {
  for (const s of depositSpots()) ctx.planet.addPad(s.v.x, s.v.y, s.v.z, 5.0, 7.5, true);
}

/** Stand the deposits on the planet. */
export function buildBaseSites() {
  World.deposits = [];
  for (const s of depositSpots()) {
    const g = placeAt(s.lat, s.lon, hash3(s.lat, s.lon, 6) * 6.28);
    g.userData.reach = 1400;
    const m = addSiteModel(g, s.dep.model);
    const blocks = [];
    for (let i = 0; i < 6; i++) {
      const b = m.part('block_' + i);
      // (what stands a hand high is walked over; what stands knee high is walked round)
      if (b) blocks.push({ node: b, col: s.dep.blockR ? siteCollider(g, b.position.x, b.position.z, s.dep.blockR) : null });
    }
    World.deposits.push({ key: s.key, dep: s.dep, field: s.field, group: g, blocks,
      get left() { const n = baseState().left[s.key]; return n === undefined ? s.dep.loads : n; },
      set left(n) { baseState().left[s.key] = n; } });
  }
}

/** Show as many of a deposit's loose pieces as it has work left in it (all six until the last sixth). */
export function syncDeposit(site) {
  const shown = Math.ceil((site.left / site.dep.loads) * site.blocks.length);
  site.blocks.forEach((b, i) => { const on = i < shown; b.node.visible = on; if (b.col) b.col.r = on ? b.col.r0 : 0.001; });
}
