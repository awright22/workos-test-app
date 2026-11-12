/*
 * The interactions of field science (see science.js): chipping a sample off a boulder, bagging
 * soil when digging somewhere new, and running the sample case through the analyser on the
 * Hab's work table. Grants arrive as supply capsules.
 */
import * as THREE from 'three';
import { addI } from './interact.js';
import { S } from './state.js';
import { player } from './player.js';
import { rockColliders } from '../world/rocks.js';
import { World, dropSupplyPod, siteLocalToWorld } from '../world/build.js';
import { surfaceAt } from '../planet/surface.js';
import { angDist } from '../planet/geo.js';
import { R } from '../planet/constants.js';
import { log, toast } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';
import { analyseAll, canSample, scienceSummary, takeSample } from './science.js';
import { checkAchievements } from './story.js';

const _rock = new THREE.Vector3(), _u = new THREE.Vector3(), _table = new THREE.Vector3();

/** The nearest boulder within arm's reach (its position in _rock), or null. */
function boulderInReach() {
  _u.copy(player.pos).normalize();
  let best = null, bestGap = 1.5;
  for (const c of rockColliders) {
    const gap = angDist(_u.x, _u.y, _u.z, c.v.x, c.v.y, c.v.z) * R - c.r;
    if (gap < bestGap) { bestGap = gap; best = c; }
  }
  return best ? _rock.copy(best.v).multiplyScalar(surfaceAt(best.v) + 0.4) : null;
}
const bagged = () => { const s = scienceSummary(); return `${s.bagged}/${s.limit} bagged`; };
function hintOnce() {
  if (S.flags.sampleHint) return;
  S.flags.sampleHint = true;
  setTimeout(() => log('First sample in the case. It holds eight. The analyser on the Hab work table will tell me what I actually picked up. Science: the one thing Mars cannot stop me doing.'), 1200);
}

// a chip off a boulder
addI({
  pos: boulderInReach, r: 99, hold: 2.2, mode: 'walk', priority: 5,
  visible: () => !S.flags.coldOpen && !S.inside && S.flags.didMath,
  enabled: () => canSample(_rock, 'rock'),
  label: () => `Chip a rock sample (${bagged()})`,
  use: () => {
    const bag = takeSample(_rock, 'rock');
    if (!bag) return;
    Snd.play('dig');
    log(`Rock sample #${bag.n} bagged — ${bag.place}.`, 'sys');
    hintOnce();
  },
});

/** Called when the astronaut digs regolith in the open: a new place also fills a sample bag. */
export function bagSoilHere() {
  if (canSample(player.pos, 'soil') !== true) return;
  const bag = takeSample(player.pos, 'soil');
  if (!bag) return;
  log(`Soil sample #${bag.n} bagged — ${bag.place}.`, 'sys');
  hintOnce();
}

const BLUEPRINT_ORDER = ['drill', 'recycler', 'tank2', 'drive2'];
// the analyser on the work table in the middle of the Hab
addI({
  pos: () => siteLocalToWorld(World.hab, 0, 0, 0, _table), r: 2.5, hold: 2.4, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside && scienceSummary().bagged > 0,
  enabled: () => (S.power > 1 ? true : 'The analyser needs Hab power'),
  label: () => `Analyse samples (${scienceSummary().bagged})`,
  use: () => {
    const { results, grants } = analyseAll();
    Snd.play('terminal');
    let t = 300;
    for (const r of results) {
      const m = r.material;
      setTimeout(() => {
        if (r.first) {
          const s = scienceSummary();
          Snd.play('discovery');
          toast('NEW MATERIAL', m.name, `${s.kinds} of ${s.of} catalogued · +${r.credit} science`);
          log(`Sample #${r.bag.n}, ${r.bag.place}: ${m.name.toUpperCase()}. ${m.note}`);
        } else log(`Sample #${r.bag.n}, ${r.bag.place}: more ${m.name.toLowerCase()}. +${r.credit} science.`, 'sys');
      }, t);
      t += r.first ? 2600 : 900;
    }
    for (const g of grants) {
      setTimeout(() => {
        const pod = dropSupplyPod(g.loot, 'Open NASA science grant');
        if (g.blueprint) { const bp = BLUEPRINT_ORDER.find((k) => !S.blueprints[k] && !World.pods.some((p) => !p.taken && p.blueprint === k)); if (bp) pod.blueprint = bp; }
        log(`Science grant (${g.at} credit): ${g.say}`, 'nasa');
      }, t);
      t += 2600;
    }
    setTimeout(checkAchievements, t);
  },
});
