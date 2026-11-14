// Equipment wear and servicing: machines run down, work worse when neglected, and a service
// costs more the longer it was left.
import { openGame } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push(!!ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 380) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);

await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.flags.didMath = true; G.S.checkedSystems = { oxy: true, rec: true }; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });

let s = await ev((G) => {
  G.tpLocal(0, 3); G.tick(0.05, 4);                       // indoors: the suit is not in use
  const m0 = { ...G.S.machines };
  for (let i = 0; i < G.BAL.solLen; i++) G.applyRates(1, false);
  return { m0, m1: { ...G.S.machines } };
});
check('a sol of running wears the oxygenator and reclaimer, not the idle suit or rover',
  Math.abs(s.m1.oxygenator - 92) < 1 && Math.abs(s.m1.reclaimer - 93) < 1 && s.m1.suit > 99.9 && s.m1.rover === 100, s.m1);

s = await ev((G) => {
  const run = (cond) => { G.S.machines.oxygenator = cond; G.S.power = 80; G.S.o2 = 50; for (let i = 0; i < 120; i++) { G.S.machines.oxygenator = cond; G.applyRates(1, false); } return +G.S.o2.toFixed(2); };
  const good = run(100), poor = run(40), dead = run(2);
  G.S.machines.oxygenator = 100;
  return { good, poor, dead, eff: [100, 60, 40, 20, 10, 0].map((c) => { G.S.machines.reclaimer = c; return +G.machineEff('reclaimer').toFixed(2); }) };
});
check('a neglected oxygenator makes less air; a failed one loses ground', s.good > s.poor && s.poor > s.dead && s.dead < 50 && s.good > 50, s);
check('efficiency holds to 60%, halves by 20%, and is gone at 0', JSON.stringify(s.eff) === JSON.stringify([1, 1, 0.78, 0.55, 0.28, 0]), s.eff);

s = await ev((G) => {
  const M = G.machines, S = G.S, out = {};
  S.machines.reclaimer = 70; S.inv.scrap = 0; S.inv.circuit = 0;
  out.free = M.service('reclaimer') && S.machines.reclaimer === 100;
  S.machines.reclaimer = 40;
  out.needsScrap = M.service('reclaimer') === false && S.machines.reclaimer === 40;
  S.inv.scrap = 2; out.withScrap = M.service('reclaimer') && S.inv.scrap === 1 && S.machines.reclaimer === 100;
  S.machines.reclaimer = 10;
  out.needsCircuit = M.service('reclaimer') === false;
  S.inv.circuit = 1; out.withCircuit = M.service('reclaimer') && S.inv.scrap === 0 && S.inv.circuit === 0 && S.machines.reclaimer === 100;
  out.noNeed = M.serviceCost('reclaimer') === null;
  return out;
});
check('a service is free in time, costs scrap if left, scrap and a circuit if it failed', s.free && s.needsScrap && s.withScrap && s.needsCircuit && s.withCircuit && s.noNeed, s);

s = await ev((G) => {
  G.S.machines.oxygenator = 62; G.S.machines.suit = 55;
  G.tpLocal(4.3, -3.0); G.tick(0.05, 4);
  const oxy = G.interaction.active && G.interaction.active.label();
  G.hold(3.2);
  const oxyAfter = G.S.machines.oxygenator;
  G.tpLocal(-1.6, 5.9); G.tick(0.05, 4);
  const suit = G.interaction.active && G.interaction.active.label();
  G.hold(3.2);
  return { oxy, oxyAfter, suit, suitAfter: G.S.machines.suit };
});
check('the oxygenator and the suit rack offer a service and take it', /^Service the oxygenator$/.test(s.oxy || '') && s.oxyAfter > 99.9 && /^Service the suit scrubber$/.test(s.suit || '') && s.suitAfter > 99.9, s);

s = await ev((G) => {
  const top0 = G.roverTopSpeed ? 0 : 0;
  G.S.machines.rover = 100;
  G.machines.wearRover(10000);
  const after10km = G.S.machines.rover;
  // on foot outside for five minutes wears the scrubber
  G.S.machines.suit = 100;
  G.machines.wearMachines(0, 0, 300);
  const suit = G.S.machines.suit;
  // behind the rover, on foot: the service prompt
  G.S.machines.rover = 45; G.S.inv.scrap = 1;
  G.tpNear(G.at(15, 15), 0.1); G.tick(0.05, 2);
  const T = G.player.pos.constructor;
  const behind = new T(0, 0, 3.6).applyQuaternion(G.World.rover.group.quaternion).add(G.World.rover.group.position);
  G.tpNear(behind, 0.05); G.tick(0.05, 6);
  const label = G.interaction.active && G.interaction.active.label();
  G.hold(3.2);
  return { after10km, suit, label, rover: G.S.machines.rover, scrap: G.S.inv.scrap };
});
check('driving wears the rover, walking outside wears the scrubber', Math.abs(s.after10km - 80) < 0.5 && Math.abs(s.suit - 89) < 0.5, s);
check('the rover is serviced from behind it', /^Service the rover drivetrain$/.test(s.label || '') && s.rover === 100 && s.scrap === 0, s);

s = await ev((G) => {
  G.S.machines.oxygenator = 33; G.S.machines.rover = 71;
  const snap = JSON.parse(JSON.stringify(G.serializeState()));
  G.S.machines = null;
  G.applyState(snap);
  return { m: G.S.machines };
});
check('conditions survive save and load', s.m && s.m.oxygenator === 33 && s.m.rover === 71, s.m);

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} machine checks passed; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
process.exit(failed || g.errors.length ? 1 : 0);
