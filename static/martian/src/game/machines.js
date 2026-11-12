/*
 * Equipment wears. The oxygenator, the water reclaimer, the rover's drivetrain and the suit's
 * CO2 scrubber each have a condition from 100 down; below 60 they work less well, below 20
 * they are failing. A service puts one right: for nothing if it is done in time, for a piece of
 * scrap if it was left, for scrap and a circuit board if it was left until it failed.
 * (How well a machine works at a given condition is machineEff in state.js.)
 */
import { cheer } from './farm.js';
import * as THREE from 'three';
import { addI } from './interact.js';
import { S } from './state.js';
import { World, siteLocalToWorld } from '../world/build.js';
import { log } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';
import { emit } from '../core/events.js';

export const MACHINES = {
  oxygenator: {
    name: 'oxygenator', perSol: 8,
    half: 'The oxygenator has started wheezing. Clogged filters. It keeps me alive, so I should probably return the favour.',
    failing: 'OXYGENATOR FAILING. It is making maybe a third of the air it should. Service it. Now.',
    done: 'Oxygenator serviced: filters clean, seals reseated. It purrs.',
  },
  reclaimer: {
    name: 'water reclaimer', perSol: 7,
    half: 'The water reclaimer is making a noise like a cat in a blender. The membranes want cleaning.',
    failing: 'The water reclaimer is barely reclaiming. I would rather not drink the difference.',
    done: 'Reclaimer serviced. I have now cleaned things no astronaut candidate is told about.',
  },
  rover: {
    name: 'rover drivetrain', perKm: 2.0,
    half: 'The rover is pulling left and the wheel bearings are singing. Dust in everything. It wants a service.',
    failing: 'The rover drivetrain is one bad rock from quitting. Service it before the next trip, not during.',
    done: 'Rover serviced: bearings flushed, wheel motors re-seated, dust evicted. For now.',
  },
  suit: {
    name: 'suit scrubber', perMinuteOut: 2.2,
    half: 'The suit CO2 scrubber is half spent. I am breathing harder for the same air.',
    failing: 'Suit scrubber nearly spent: every breath outside costs me double. Swap the cartridge at the suit rack.',
    done: 'Fresh scrubber cartridge in. The suit smells of nothing again. Luxury.',
  },
};

export function initMachines() { S.machines = { oxygenator: 100, reclaimer: 100, rover: 100, suit: 100 }; S.machineWarn = {}; }
function mach() { if (!S.machines) initMachines(); return S.machines; }

function wear(id, amount) {
  const m = mach(), before = m[id];
  m[id] = Math.max(0, before - amount * S.drainMult);
  const w = S.machineWarn || (S.machineWarn = {});
  if (before > 50 && m[id] <= 50 && w[id] !== 'half') { w[id] = 'half'; log(MACHINES[id].half, 'sys'); Snd.bad(); }
  if (before > 20 && m[id] <= 20 && w[id] !== 'failing') { w[id] = 'failing'; log(MACHINES[id].failing, 'sys'); Snd.bad(); emit('machine-failing', { id }); }
}
/** Wear over a slice of time. `dtSol`: fraction of a sol; `dust`: storm strength at the Hab; `outside`: seconds on foot outdoors. */
export function wearMachines(dtSol, dust, outsideSeconds) {
  const k = 1 + dust * 1.5;
  wear('oxygenator', MACHINES.oxygenator.perSol * dtSol * k);
  wear('reclaimer', MACHINES.reclaimer.perSol * dtSol * k);
  if (outsideSeconds > 0) wear('suit', MACHINES.suit.perMinuteOut * (outsideSeconds / 60) * (1 + S.storm.i));
}
export function wearRover(metres) { if (metres > 0) wear('rover', MACHINES.rover.perKm * metres / 1000 * (1 + S.storm.i * 0.5)); }

/** At dawn, a neglected machine may break something: the worse its state, the likelier. */
export function dawnFaults() {
  const m = mach();
  for (const id of Object.keys(MACHINES)) {
    if (m[id] >= 55 || m[id] <= 8) continue;
    if (Math.random() < (55 - m[id]) / 110) {
      m[id] = Math.max(5, m[id] - 22);
      cheer(-3);
      setTimeout(() => { log(`Something just went BANG in the ${MACHINES[id].name}. Condition: ${Math.round(m[id])}%. This is what I get for putting it off.`, 'sys'); Snd.bad(); }, 9000);
      break;                                        // one disaster per morning is plenty
    }
  }
}

/** What a service costs now: null if none is needed, else { scrap, circuit }. */
export function serviceCost(id) {
  const c = mach()[id];
  if (c >= 85) return null;
  return { scrap: c < 50 ? 1 : 0, circuit: c < 20 ? 1 : 0 };
}
function canService(id) {
  const cost = serviceCost(id);
  if (!cost) return `The ${MACHINES[id].name} is in good order (${Math.round(mach()[id])}%)`;
  if ((S.inv.scrap || 0) < cost.scrap) return `Servicing the ${MACHINES[id].name} now needs scrap metal`;
  if ((S.inv.circuit || 0) < cost.circuit) return `The ${MACHINES[id].name} has failed: needs scrap and a circuit board`;
  return true;
}
export function service(id) {
  const cost = serviceCost(id);
  if (!cost || canService(id) !== true) return false;
  S.inv.scrap -= cost.scrap; S.inv.circuit = (S.inv.circuit || 0) - cost.circuit;
  mach()[id] = 100;
  if (S.machineWarn) S.machineWarn[id] = null;
  S.stats.serviced = (S.stats.serviced || 0) + 1;
  Snd.play('craft');
  log(MACHINES[id].done + (cost.circuit ? ' (Cost: scrap and a circuit board. Lesson noted.)' : cost.scrap ? ' (Cost: one piece of scrap.)' : ''), 'sys');
  emit('machine-serviced', { id });
  return true;
}
const label = (id) => { const c = serviceCost(id); return `Service the ${MACHINES[id].name} (${Math.round(mach()[id])}%${c && c.circuit ? ', scrap + circuit' : c && c.scrap ? ', 1 scrap' : ''})`; };

const _p = new THREE.Vector3();
function addService(id, where, o = {}) {
  addI({
    pos: where, r: o.r || 2.6, hold: 3.0, mode: 'walk', pose: o.pose || 'stand',
    visible: () => !S.flags.coldOpen && S.flags.didMath && mach()[id] < 85 && (!o.visible || o.visible()),
    enabled: () => canService(id),
    label: () => label(id),
    use: () => service(id),
  });
}
addService('oxygenator', () => siteLocalToWorld(World.hab, 5.6, 0, -3.6, _p), { visible: () => S.inside });
addService('reclaimer', () => siteLocalToWorld(World.hab, 5.9, 0, -0.4, _p), { visible: () => S.inside });
addService('suit', () => siteLocalToWorld(World.hab, -2.0, 0, 7.0, _p), { visible: () => S.inside, r: 2.2 });
// the rover is serviced from behind, at the equipment bay (its front is where you climb in)
addService('rover', () => siteLocalToWorld(World.rover.group, 0, 0, 3.3, _p), { r: 2.4, pose: 'kneel' });
