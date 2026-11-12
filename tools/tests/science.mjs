// Field science: every material can be found where it should be, and the loop of
// sampling, analysing, credit, grants and saving works in the running game.
import { openGame, sleep } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push(!!ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 420) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);

await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.flags.didMath = true; });

// --- where things are: sample a grid of bags around each real place ------------------------
const where = await ev((G) => {
  const sc = G.science;
  const tally = (lat, lon, span, kind) => {
    const out = {};
    for (let i = 0; i < 400; i++) {
      const a = (i * 0.618034) % 1, b = (i * 0.754877) % 1;
      const m = sc.identify({ kind, lat: lat + (a - 0.5) * span, lon: lon + (b - 0.5) * span });
      out[m.id] = (out[m.id] || 0) + 1;
    }
    return out;
  };
  const places = {
    meridiani: tally(-1.9, 354.5, 4, 'soil'), gusev: tally(-14.57, 175.48, 2, 'soil'), jezeroSoil: tally(18.44, 77.45, 2, 'soil'),
    jezeroRock: tally(18.44, 77.45, 2, 'rock'), northPole: tally(86, 40, 4, 'soil'), olympus: tally(18.65, 226.2, 3, 'rock'),
    coprates: tally(-12.5, 293, 1.2, 'rock'), aresVallis: tally(19.1, 326.8, 3, 'rock'), syrtis: tally(8.4, 69.5, 6, 'soil'),
    phoenix: tally(68.2, 234.3, 4, 'soil'), olympia: tally(80, 180, 4, 'soil'), sirenum: tally(-37, 206, 6, 'soil'),
    hellas: tally(-42.4, 70.5, 8, 'rock'), elysium: tally(6, 157, 6, 'rock'), nowhereRock: tally(-28, 110, 10, 'rock'), nowhereSoil: tally(-28, 110, 10, 'soil'),
  };
  // everything, everywhere: can each material be found at all?
  const seen = {};
  for (let lat = -88; lat <= 88; lat += 2) for (let lon = 0; lon < 360; lon += 2) for (const kind of ['rock', 'soil']) seen[sc.identify({ kind, lat: lat + 0.37, lon: lon + 0.61 }).id] = 1;
  for (const p of Object.values(places)) for (const k in p) seen[k] = 1;
  return { places, missing: sc.MATERIALS.map((m) => m.id).filter((id) => !seen[id]) };
});
const most = (t) => Object.entries(t).sort((a, b) => b[1] - a[1])[0][0];
const share = (t, id) => (t[id] || 0) / 400;
const P = where.places;
check('hematite spherules dominate the soil at Meridiani', most(P.meridiani) === 'hematite', P.meridiani);
check('opaline silica is found in Gusev crater', share(P.gusev, 'silica') > 0.4, P.gusev);
check('clay in the soil and carbonate in the rock at Jezero', share(P.jezeroSoil, 'clay') > 0.4 && share(P.jezeroRock, 'carbonate') > 0.3, [P.jezeroSoil, P.jezeroRock]);
check('ice at the north pole, gypsum in Olympia Undae', share(P.northPole, 'ice') > 0.6 && share(P.olympia, 'gypsum') > 0.3, [P.northPole, P.olympia]);
check('vesicular lava on Olympus Mons, platy lava in Elysium', share(P.olympus, 'lava') > 0.5 && share(P.elysium, 'young_lava') > 0.3, [P.olympus, P.elysium]);
check('layered sulfates in Coprates Chasma', share(P.coprates, 'sulfate') > 0.3, P.coprates);
check('flood conglomerate in Ares Vallis', share(P.aresVallis, 'conglomerate') > 0.3, P.aresVallis);
check('olivine sand in Syrtis, perchlorate at Phoenix, chloride in Sirenum, glass in Hellas',
  share(P.syrtis, 'olivine_sand') > 0.3 && share(P.phoenix, 'perchlorate') > 0.3 && share(P.sirenum, 'chloride') > 0.25 && share(P.hellas, 'impact_glass') > 0.2, [P.syrtis, P.phoenix, P.sirenum, P.hellas]);
check('ordinary ground is basalt and dust', most(P.nowhereRock) === 'basalt' && most(P.nowhereSoil) === 'dust', [P.nowhereRock, P.nowhereSoil]);
check('every material can be found somewhere', where.missing.length === 0, where.missing);

// --- the loop in the running game ---------------------------------------------------------------
let s = await ev(async (G) => {
  // walk out to open ground and find a boulder
  G.tpLocal(60, 400, 0); G.tick(0.05, 10); await G.settle(); G.tick(0.05, 4);
  const P = G.player;
  // boulders near the camera become colliders when a frame is drawn: look around until one turns up
  const frames = (ms) => new Promise((r) => setTimeout(r, ms));
  let target = null;
  for (let tries = 0; tries < 12 && !target; tries++) {
    G.paused = false; await frames(1800); G.paused = true;
    for (const c of G.rockColliders) { const d = G.groundDist(P.pos, c.v.clone().multiplyScalar(12000)); if (!target || d < target.d) target = { c, d }; }
    if (!target) { G.tpLocal(60 + (tries + 1) * 90, 400 + (tries + 1) * 140, 0); await G.settle(); }
  }
  if (!target) return { boulder: false };
  G.tpAround(target.c.v.clone().multiplyScalar(12000), target.c.r + 0.9, 0);
  G.tick(0.05, 30);
  const label = G.interaction.active && G.interaction.active.label();
  G.hold(2.4);
  const afterRock = G.science.scienceSummary().bagged;
  // the same boulder cannot be sampled twice
  G.tick(0.05, 2);
  const again = G.interaction.active && G.interaction.active.enabled && G.interaction.active.enabled();
  // dig soil somewhere clear of boulders
  G.tpLocal(0, 60, 0); G.tick(0.05, 30);
  const digLabel = G.interaction.active && G.interaction.active.label();
  G.hold(2.8);
  return { boulder: true, label, afterRock, again, digLabel, afterSoil: G.science.scienceSummary().bagged, regolith: G.S.inv.regolith };
});
check('a boulder offers a rock sample and bags one', s.boulder && /rock sample/i.test(s.label || '') && s.afterRock === 1, s);
check('the same place cannot be sampled twice', typeof s.again === 'string', s.again);
check('digging somewhere new also bags a soil sample', /Dig regolith/.test(s.digLabel || '') && s.afterSoil === 2 && s.regolith >= 1, s);

s = await ev((G) => {
  const before = G.science.scienceSummary();
  G.S.science.points = 24;                        // one analysis away from the first grant
  const pods0 = G.World.pods.length;
  G.tpLocal(1.75, -0.7); G.tick(0.05, 4);          // at the work table
  const label = G.interaction.active && G.interaction.active.label();
  G.hold(2.6);
  return { before, label, pods0 };
});
await sleep(9000);
const after = await ev((G) => ({ sum: G.science.scienceSummary(), pods: G.World.pods.length, cat: G.science.catalogue().filter((c) => c.count > 0).map((c) => c.id), found: G.S.science.found }));
check('the Hab analyser identifies the samples and credits them', /Analyse samples \(2\)/.test(s.label || '') && after.sum.bagged === 0 && after.sum.kinds >= 1 && after.sum.points > 24, { label: s.label, after: after.sum, cat: after.cat });
// 25 credit brings the first grant; a lucky find can cross the second (60) in the same analysis
check('crossing a credit threshold brings a NASA grant capsule', after.pods - s.pods0 === (after.sum.points >= 60 ? 2 : 1), { pods0: s.pods0, pods: after.pods, points: after.sum.points });

s = await ev((G) => {
  const snap = G.serializeState();
  const keep = JSON.stringify(G.S.science);
  G.S.science = null;
  G.applyState(JSON.parse(JSON.stringify(snap)));
  return { same: JSON.stringify(G.S.science) === keep, points: G.S.science.points };
});
check('science survives save and load', s.same && s.points > 0, s);

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} science checks passed; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
process.exit(failed || g.errors.length ? 1 : 0);
