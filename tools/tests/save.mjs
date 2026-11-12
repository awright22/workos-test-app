// Save migration: a version-2 save (made by the first full-planet release) must load, keep its
// progress, and tell the player what changed. An unreadable save must be reported, not ignored.
import { openGame, sleep } from './lib.mjs';
const V2 = {"v":2,"diff":"survival","spawn":{"lat":17.4,"lon":163.5},"sol":12,"tod":0.31,"o2":88,"water":64,"food":6,"potatoes":9,"power":71,"health":93,"suit":150,"roverPower":80,"roverO2":260,"hydrazine":1,
  "inv":{"scrap":7,"circuit":2,"regolith":1,"ice":0,"candle":2,"kitSolar":0,"kitGreenhouse":0,"kitBeacon":0,"kitCache":0},"upgrades":{"tank1":true},"blueprints":{"drill":true,"drive2":false,"tank2":false,"recycler":false},
  "quests":{"viking1":"active","spirit":"active","oppy":"active","insight":"active","phoenix":"active","mars3":"active","breadcrumbs":"active"},"salvaged":{},"discovered":{"Elysium Mons":true},"achieved":{"notdead":true,"phone":true},
  "checkedSystems":{"oxy":true,"rec":true},"flags":{"coldOpen":false,"suitSealed":true,"didMath":true,"hydrazineBoom":true,"pfRevealed":true,"mavRevealed":false,"mavStripped":false,"nasaMsg":2,"routePods":true},
  "stats":{"potatoes":16,"panels":5,"walked":2100,"driven":18000,"closeCalls":1,"booms":2,"mined":0,"crafted":3,"discoveries":1,"discoTime":0,"stormOut":0},"breach":{"active":false,"done":true,"cropsKilled":false,"timer":0},
  "pf":{"found":true,"loaded":true,"connected":true},"stormCells":[{"lat":10,"lon":20,"r":2000,"drift":30,"dir":1,"peak":0.8},{"lat":-30,"lon":200,"r":2500,"drift":25,"dir":2,"peak":0.9},{"lat":40,"lon":300,"r":3000,"drift":40,"dir":3,"peak":0.75}],
  "plots":[{"state":"growing","growth":0.6,"watered":2},{"state":"ready","growth":1,"watered":2},{"state":"soil","growth":0,"watered":0},{"state":"empty","growth":0,"watered":0},{"state":"empty","growth":0,"watered":0},{"state":"empty","growth":0,"watered":0},{"state":"growing","growth":0.3,"watered":1},{"state":"empty","growth":0,"watered":0},{"state":"empty","growth":0,"watered":0},{"state":"empty","growth":0,"watered":0}],
  "panels":[0.1,0.2,0.3,0.1,0.2,0.3,0.1,0.2],"piles":[2,1,0,2,2,2],"pods":[true,false,false,false],"podLoot":[{"loot":{"scrap":2},"label":"Salvage MDV debris","blueprint":null,"ll":{"lat":17.41,"lon":163.52}},{"loot":{"scrap":2},"label":"Salvage MDV debris","blueprint":null,"ll":{"lat":17.42,"lon":163.54}},{"loot":{"scrap":2},"label":"Salvage MDV debris","blueprint":null,"ll":{"lat":17.43,"lon":163.56}},{"loot":{"scrap":3,"rations":3,"candle":1},"label":"Open NASA care package","blueprint":"drill","ll":{"lat":17.39,"lon":163.49}}],
  "ice":[6,6,6,6,6,6,6,6,6,6,6,6],"rtgTaken":false,"built":[{"kind":"greenhouse","charges":0,"ll":{"lat":17.405,"lon":163.47}}],"playerQ":null,"roverQ":null};
const g = await openGame({ quality: 'low' });
// a real v2 save stores quaternions; borrow valid ones from a fresh game at the same site
const quats = await g.eval(async (G) => { await G.start(17.4, 163.5); const s = G.serializeState(); return { p: s.playerQ, r: s.roverQ }; });
V2.playerQ = quats.p; V2.roverQ = quats.r;
await g.page.evaluate((s) => localStorage.setItem('stranded2-save', s), JSON.stringify(V2));
await g.page.reload({ waitUntil: 'load' });
await g.page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
const title = await g.page.locator('#mg-panel').innerText();
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };
check('title offers to continue the old save at its sol', /continue\s*sol 12\b/i.test(title), title.split('\n').filter((l) => /continue|new game|sol/i.test(l)));
await g.page.locator('#mg-panel button', { hasText: 'CONTINUE' }).click();
await sleep(600);
const s = await g.eval(async (G) => { await G.settle(); return { sol: G.S.sol, potatoes: G.S.potatoes, scrap: G.S.inv.scrap, tank1: !!G.S.upgrades.tank1, pf: G.S.pf.connected, plots: G.World.plots.length, plot6: G.World.plots[6] && G.World.plots[6].state,
  built: G.World.builtMeshes.map((b) => b.kind), pods: G.World.pods.length, alt: +(G.player.pos.length() - G.surfaceAt(G.player.pos)).toFixed(3), started: G.S.started }; });
check('progress carried over', s.started && s.sol === 12 && s.potatoes === 9 && s.scrap === 7 && s.tank1 && s.pf, s);
check('greenhouse and its crops rebuilt', s.built[0] === 'greenhouse' && s.plots === 10 && s.plot6 === 'growing', s);
check('astronaut stands on the new ground', Math.abs(s.alt) < 0.01, s.alt);
await sleep(4200);
const logText = await g.page.locator('#mg-log').innerText();
check('player is told what changed', /real orbital elevation/.test(logText), logText.slice(0, 200));
const resaved = await g.eval((G) => { G.saveGame(); return JSON.parse(localStorage.getItem('stranded2-save')).v; });
check('re-saved in the current format', resaved === 3, resaved);
// an unreadable save is reported on the title screen
await g.page.evaluate(() => localStorage.setItem('stranded2-save', JSON.stringify({ v: 99, nonsense: true })));
await g.page.reload({ waitUntil: 'load' });
await g.page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
const title2 = await g.page.locator('#mg-panel').innerText();
check('unreadable save is reported plainly', /cannot be continued/.test(title2) && !/continue\s*sol/i.test(title2));
console.log(`${fails.length ? 'FAILED' : 'passed'}; console errors: ${g.errors.length}`, g.errors.slice(0, 3));
await g.close();
process.exit(fails.length || g.errors.length ? 1 : 0);
