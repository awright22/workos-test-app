// The farm beyond potatoes: seed packets, five crops with their own pace, the pantry, breakfast,
// a cooked dinner, and morale.
import { openGame } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push(!!ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 1400) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);

await ev(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); G.paused = true; G.S.flags.didMath = true; G.S.storm.cells.forEach((c) => { c.peak = 0; }); G.setStorm(0); });

let s = await ev((G) => {
  const F = G.farm; F.farm();
  return { seeds: { ...G.S.seeds }, pantry: { ...G.S.pantry }, morale: G.S.morale, plantable: F.plantable(), food: F.foodTotal(), rations: G.S.food };
});
check('a new game has radish and lettuce packets, an empty pantry and steady morale',
  s.seeds.radish === 2 && s.seeds.lettuce === 2 && s.seeds.soy === 0 && s.seeds.tomato === 0 && s.morale === 62 && s.plantable.join() === 'potato,radish,lettuce' && s.food === s.rations, s);

// plant a bed of radishes through the chooser
s = await ev((G) => {
  const out = {};
  G.S.inv.regolith = 3; G.S.water = 60;
  G.tpLocal(-6.7, -3.2); G.tick(0.05, 4);
  G.hold(1.5);                                              // fill
  out.label = G.interaction.active && G.interaction.active.label();
  G.hold(1.5);                                              // ask
  out.rows = [...document.querySelectorAll('#mg-panel .choice')].map((b) => b.querySelector('.ch-l').textContent + ' | ' + b.querySelector('.ch-s').textContent + ' | ' + b.querySelector('.ch-n').textContent);
  [...document.querySelectorAll('#mg-panel .choice')].find((b) => /Radish/.test(b.textContent)).click();
  const pl = G.World.plots[0];
  out.plot = { state: pl.state, crop: pl.crop, watered: pl.watered };
  out.seeds = G.S.seeds.radish; out.water = G.S.water; out.uiOpen = G.S.uiOpen;
  return out;
});
check('a bed of soil asks what to plant and takes a seed packet and 5 L',
  s.label === 'Plant this bed…' && s.rows.length === 3 && /Radishes \| Ready in 1\.1 sols · 1 watering · yields 3 \| Seed for 2 beds/.test(s.rows[1]) && s.plot.state === 'growing' && s.plot.crop === 'radish' && s.seeds === 1 && Math.abs(s.water - 55) < 0.1 && s.uiOpen === false, s);

s = await ev((G) => {
  const out = {}, pl = G.World.plots[0];
  G.syncAllVisuals();
  out.shown = { potato: pl.plants.visible, radish: !!(pl.crops.radish && pl.crops.radish.plants.visible) };
  // radishes need one watering (given at planting) and 1.1 sols; potatoes would stall at half without a second
  const t0 = G.BAL.solLen * 1.1;
  for (let i = 0; i < t0 - 30; i++) G.applyRates(1, false);
  out.before = pl.state; out.growth = +pl.growth.toFixed(2);
  for (let i = 0; i < 40; i++) G.applyRates(1, false);
  out.after = pl.state;
  G.S.morale = 62;
  G.tpLocal(-6.7, -3.2); G.tick(0.05, 4);
  out.label = G.interaction.active && G.interaction.active.label();
  G.hold(1.6);
  out.pantry = G.S.pantry.radish; out.state = pl.state; out.produce = G.S.stats.produce; out.morale = G.S.morale; out.potatoes = G.S.potatoes;
  return out;
});
check('radishes show their own plants, ripen in 1.1 sols on one watering, and go to the pantry',
  s.shown.radish && !s.shown.potato && s.before === 'growing' && s.after === 'ready' && s.label === 'Harvest radishes' && s.pantry === 3 && s.state === 'soil' && s.produce === 3 && s.morale === 64 && s.potatoes === 0, s);

s = await ev((G) => {
  const F = G.farm, S = G.S, out = {};
  const day = (setup) => { setup(); S.morale = 50; S.diet.same = 0; const text = F.breakfast(); return { text, morale: +S.morale.toFixed(1) }; };
  const empty = () => { S.potatoes = 0; S.food = 0; S.pantry = { radish: 0, lettuce: 0, soy: 0, tomato: 0 }; };
  out.none = day(empty);
  out.ration = day(() => { empty(); S.food = 2; });
  out.potato = day(() => { empty(); S.potatoes = 3; });
  S.morale = 50; out.potato2 = { text: F.breakfast(), morale: +S.morale.toFixed(1) };
  out.withTomato = day(() => { empty(); S.potatoes = 2; S.pantry.tomato = 1; S.pantry.radish = 1; });
  out.leftAfter = { ...S.pantry, potatoes: S.potatoes };
  out.soyOnly = day(() => { empty(); S.pantry.soy = 2; });
  out.saladOnly = day(() => { empty(); S.pantry.lettuce = 1; });
  empty(); S.food = 8;
  return out;
});
check('breakfast: a staple and one side; monotony costs, variety pays, nothing costs most',
  s.none.text === 'skipped' && s.none.morale === 33 && s.ration.text === 'one ration' && s.ration.morale === 44 &&
  s.potato.text === 'a potato' && s.potato.morale === 44 && s.potato2.text === 'potato. Again.' && s.potato2.morale === 43 &&
  s.withTomato.text === 'potato with tomatoes' && s.withTomato.morale === 50 && s.leftAfter.tomato === 0 && s.leftAfter.radish === 1 && s.leftAfter.potatoes === 1 &&
  s.soyOnly.text === 'soybeans' && s.soyOnly.morale === 46 && s.saladOnly.text === 'lettuce' && s.saladOnly.morale === 46, s);

s = await ev((G) => {
  const F = G.farm, S = G.S, out = {};
  S.potatoes = 1; S.pantry = { radish: 1, lettuce: 0, soy: 0, tomato: 0 }; S.diet.dinnerSol = 0;
  out.oneVeg = F.dinnerPlan();
  S.pantry.tomato = 2;
  out.plan = F.dinnerPlan();
  S.morale = 50; S.health = 60;
  G.tpLocal(4.2, 4.0); G.tick(0.05, 4);
  out.label = G.interaction.active && G.interaction.active.label();
  G.hold(3.2);
  out.after = { potatoes: S.potatoes, pantry: { ...S.pantry }, morale: +S.morale.toFixed(1), health: S.health, meals: S.diet.meals };
  out.again = F.dinnerPlan();
  G.tick(0.05, 4);
  out.labelAfter = G.interaction.active && G.interaction.active.label();
  return out;
});
check('dinner needs a staple and two vegetables, once a sol, and lifts vitals and morale',
  s.oneVeg.ok === false && /two different/.test(s.oneVeg.why) && s.plan.ok && s.plan.sides.join() === 'tomato,radish' && /Cook dinner: potato, tomatoes and radishes/.test(s.label || '') &&
  s.after.potatoes === 0 && s.after.pantry.tomato === 1 && s.after.pantry.radish === 0 && s.after.morale === 62.2 && Math.abs(s.after.health - 85) < 0.2 && s.after.meals === 1 &&
  s.again.ok === false && /Already/.test(s.again.why) && /^Eat a /.test(s.labelAfter || ''), s);

s = await ev((G) => {
  const F = G.farm, S = G.S, out = {};
  S.morale = 80; out.high = [F.moraleBand(), F.workRate(), F.healRate()];
  S.morale = 50; out.steady = [F.moraleBand(), F.workRate(), F.healRate()];
  S.morale = 20; out.low = [F.moraleBand(), F.workRate(), F.healRate()];
  // the same held action takes longer when worn down
  const time = (m) => { S.morale = m; S.inv.regolith = 1; const pl = G.World.plots[0]; pl.state = 'empty'; G.tpLocal(-6.7, -3.2); G.tick(0.05, 4);
    let t = 0; G.input.eHeld = true; while (pl.state === 'empty' && t < 4) { G.tick(0.05, 1); t += 0.05; } G.input.eHeld = false; return +t.toFixed(2); };
  out.t = [time(80), time(50), time(20)];
  S.morale = 99; F.cheer(50); out.cap = S.morale; S.morale = 1; F.cheer(-50); out.floor = S.morale;
  S.morale = 50; S.diet.disco = 0; for (let i = 0; i < 400; i++) F.hearMusic(1); out.music = +S.morale.toFixed(1);
  return out;
});
check('morale: good spirits work and mend faster, low spirits slower; it stays within 0 to 100; music helps up to a point',
  s.high.join() === 'high,1.2,1.3' && s.steady.join() === 'steady,1,1' && s.low.join() === 'low,0.78,0.7' && s.t[0] < s.t[1] && s.t[1] < s.t[2] && s.cap === 100 && s.floor === 0 && Math.abs(s.music - 54) < 0.11, s);

s = await ev((G) => {
  const S = G.S, out = {};
  S.seeds = { radish: 0, lettuce: 0, soy: 0, tomato: 0 };
  out.got = G.gainLoot ? G.gainLoot({ seedSoy: 2, seedTomato: 1, scrap: 1 }) : null;
  out.seeds = { ...S.seeds };
  S.morale = 41.5; S.pantry = { radish: 1, lettuce: 2, soy: 3, tomato: 4 }; S.diet.meals = 5;
  const pl = G.World.plots[2]; pl.state = 'growing'; pl.crop = 'tomato'; pl.growth = 0.5; pl.watered = 2;
  const saved = JSON.parse(JSON.stringify(G.serializeState()));
  S.morale = 9; S.pantry = { radish: 0, lettuce: 0, soy: 0, tomato: 0 }; S.seeds.soy = 0; pl.crop = 'potato'; pl.state = 'empty';
  G.applyState(saved);
  const p2 = G.World.plots[2];
  out.loaded = { morale: S.morale, pantry: { ...S.pantry }, soy: S.seeds.soy, meals: S.diet.meals, crop: p2.crop, state: p2.state, tomatoShown: !!(p2.crops.tomato && p2.crops.tomato.plants.visible), potatoShown: p2.plants.visible };
  // a save from before the farm had a pantry
  const old = JSON.parse(JSON.stringify(saved)); delete old.pantry; delete old.seeds; delete old.morale; delete old.diet; old.plots.forEach((p) => { delete p.crop; });
  G.applyState(old);
  out.old = { morale: S.morale, seeds: { ...S.seeds }, crop: G.World.plots[2].crop };
  return out;
});
check('seed packets arrive as loot; pantry, morale and each bed\'s crop survive a save; an older save starts the pantry afresh',
  /2 soy seed packets, 1 tomato seed packet, 1 Scrap Metal/.test(s.got || '') && s.seeds.soy === 2 && s.seeds.tomato === 1 &&
  s.loaded.morale === 41.5 && s.loaded.pantry.tomato === 4 && s.loaded.soy === 2 && s.loaded.meals === 5 && s.loaded.crop === 'tomato' && s.loaded.state === 'growing' && s.loaded.tomatoShown && !s.loaded.potatoShown &&
  s.old.morale === 62 && s.old.seeds.radish === 2 && s.old.crop === 'potato', s);

// comforts: things made for the Hab
s = await ev((G) => {
  const C = G.comforts, S = G.S, W = G.World, out = {};
  S.comforts = {}; S.inv.scrap = 0; S.inv.circuit = 0; S.mail = {}; S.salvaged = {}; S.stats.produce = 0;
  out.blocks = Object.fromEntries(C.COMFORTS.map((c) => [c.id, C.comfortBlock(c.id, W)]));
  S.inv.scrap = 4; S.inv.circuit = 1; S.morale = 50;
  out.line = C.makeComfort('lights', W);
  out.after = { made: !!S.comforts.lights, scrap: S.inv.scrap, circuit: S.inv.circuit, morale: S.morale, again: C.comfortBlock('lights', W), count: C.comfortCount(), dawn: C.comfortCheer() };
  S.mail.lewis = 1; out.photos = C.comfortBlock('photos', W);
  C.makeComfort('photos', W); C.makeComfort('chair', W);
  out.dawn3 = C.comfortCheer();
  G.syncAllVisuals();
  out.parts = Object.keys(W.comfortParts || {}).length;
  out.shown = Object.entries(W.comfortParts || {}).filter(([, n]) => n.visible).map(([k]) => k).sort();
  const saved = JSON.parse(JSON.stringify(G.serializeState()));
  S.comforts = {}; G.applyState(saved);
  out.loaded = Object.keys(S.comforts).sort();
  S.morale = 50; S.potatoes = 3; S.pantry = { radish: 0, lettuce: 0, soy: 0, tomato: 0 }; S.diet.same = 0; G.setStorm(0);
  G.newSol();
  out.dawnMorale = +S.morale.toFixed(1);
  return out;
});
check('comforts: gated by what the mission has turned up, paid for once, shown in the Hab, saved, and worth morale every dawn',
  s.blocks.lights === 'Not enough materials' && /letter/.test(s.blocks.photos) && /Salvage/.test(s.blocks.flag) && /potato/.test(s.blocks.herbs) && /String lights up/.test(s.line || '') &&
  s.after.made && s.after.scrap === 3 && s.after.circuit === 0 && s.after.morale === 54 && s.after.again === 'Made' && s.after.count === 1 && s.after.dawn === 1 &&
  s.photos === null && s.dawn3 === 3 && s.parts === 9 && s.shown.join() === 'chair,lights,photos' && s.loaded.join() === 'chair,lights,photos' &&
  Math.abs(s.dawnMorale - (50 - 1 - 5 + 3)) < 0.01, s);

const errors = g.errors.filter((e) => !/favicon/.test(e));
const passed = results.filter(Boolean).length;
console.log(`${passed}/${results.length} farm checks passed; console errors: ${errors.length}`, errors.slice(0, 5));
await g.close();
process.exit(passed === results.length && !errors.length ? 0 : 1);
