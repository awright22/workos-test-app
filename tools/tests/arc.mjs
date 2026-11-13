// Scripted playthrough of the whole story arc through the debug hook. Every later change to the
// game must keep this green. Steps the simulation directly, so it does not depend on frame rate.
import { openGame, sleep } from './lib.mjs';

const g = await openGame({ quality: 'low' });
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail) : '')); };
const ev = (fn, arg) => g.eval(fn, arg);
const page = g.page;
const click = async (text) => { await g.page.locator('#mg-panel button', { hasText: text }).first().click({ timeout: 90000 }); };      // (a dialog still rising at a frame a second on a loaded machine is not "stable" for a long while)

await ev(async (G) => { await G.start(2.0, 303.7); G.paused = true; });
let s = await ev((G) => ({ cold: G.S.flags.coldOpen, suit: G.S.suit, sol: G.S.sol, habDist: G.groundDist(G.player.pos, G.World.hab.position) }));
check('new game starts in the cold open', s.cold && s.suit < 60 && Math.abs(s.habDist - 85) < 2, s);

s = await ev((G) => { G.tpLocal(0, 8.4 + 1.6); G.hold(2.6); return { sealed: G.S.flags.suitSealed, cold: G.S.flags.coldOpen, suit: G.S.suit }; });
check('sealing the suit at the Hab door ends the cold open', s.sealed && !s.cold && s.suit >= 99, s);

s = await ev((G) => { G.tpLocal(4.0, -3.0); G.hold(1.0); G.tpLocal(4.3, -0.4); G.hold(1.0); G.tpLocal(0, -5.0); G.hold(1.1); const card = document.querySelector('#mg-panel .dlg h1'); const cardTitle = card ? card.textContent : null; const go = document.querySelector('#mg-panel .btns button'); if (go) go.click(); return { cardTitle, ui: G.S.uiOpen, checked: G.S.checkedSystems, math: G.S.flags.didMath, inside: G.S.inside }; });
check('inspecting systems and running the numbers, which shows the premise as a card to dismiss', s.checked.oxy && s.checked.rec && s.math && s.inside && s.cardTitle === 'Farm or starve' && s.ui === false, s);

s = await ev((G) => {
  const parts = () => { let helmet = 0, head = 0; G.player && G.ctx.world.traverse((o) => { if (o.isSkinnedMesh && o.visible) { if (o.name === 'helmet') helmet++; if (o.name === 'head') head++; } }); return { helmet, head }; };
  G.tpLocal(0, 3); G.tick(0.05, 40);                       // two seconds in the Hab's air
  const indoors = { bare: G.player.bare, ...parts() };
  G.tpLocal(0, 30); G.tick(0.05, 2);                       // outside: on at once
  const outdoors = { bare: G.player.bare, ...parts() };
  G.tpLocal(0, 3); G.tick(0.05, 40); G.S.breach.active = true; G.tick(0.05, 2);
  const breach = G.player.bare; G.S.breach.active = false;
  return { indoors, outdoors, breach };
});
check('the helmet comes off in the Hab\'s air and is on the instant he is outside or the Hab is breached',
  s.indoors.bare === true && s.indoors.head === 1 && s.indoors.helmet === 0 && s.outdoors.bare === false && s.outdoors.helmet === 1 && s.outdoors.head === 0 && s.breach === false, s);

s = await ev((G) => {
  const T = G.ctx.engine.camera.position.constructor;
  for (let i = 0; i < 3; i++) {
    const p = G.World.panels[i];
    const w = new T().copy(p.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position);
    G.tpNear(w, 1.6); G.hold(1.8);
  }
  return { panels: G.S.stats.panels, dust: G.World.panels.slice(0, 3).map((p) => +p.dust.toFixed(2)) };
});
check('wiping three solar panels', s.panels === 3 && s.dust.every((d) => d < 0.01), s);

s = await ev((G) => { G.tpNear(G.World.soilPiles[0].group.position, 1.2); G.hold(1.6); G.hold(1.6); return { regolith: G.S.inv.regolith, left: G.World.soilPiles[0].left }; });
check('digging regolith from a pile', s.regolith === 2 && s.left === 0, s);

s = await ev((G) => {
  const out = {};
  G.tpLocal(-6.7, -3.2);            // west of the first tray, between it and the wall
  G.hold(1.5); out.afterFill = G.World.plots[0].state;
  const w0 = G.S.water;
  G.hold(1.5);                      // with seed packets in the kit this asks what to plant: potatoes are first
  out.asked = [...document.querySelectorAll('#mg-panel .choice .ch-l')].map((n) => n.textContent);
  if (out.asked.length) document.querySelector('#mg-panel .choice').click();
  out.afterPlant = G.World.plots[0].state; out.waterUsed = +(w0 - G.S.water).toFixed(1);
  G.World.plots[0].growth = 0.45; G.hold(1.5); out.watered = G.World.plots[0].watered;
  G.World.plots[0].growth = 0.995; G.tick(0.05, 400); out.ripe = G.World.plots[0].state;
  G.hold(1.5); out.potatoes = G.S.potatoes; out.afterHarvest = G.World.plots[0].state;
  return out;
});
check('farming: fill, choose potatoes, plant, water, grow, harvest', s.afterFill === 'soil' && s.asked.join() === 'Potatoes,Radishes,Lettuce' && s.afterPlant === 'growing' && s.watered === 2 && s.ripe === 'ready' && s.potatoes === 4 && s.afterHarvest === 'soil', s);

s = await ev((G) => { const w0 = G.S.water; G.tpLocal(4.2, 2.6); G.hold(2.2); return { hydrazine: G.S.hydrazine, gained: +(G.S.water - w0).toFixed(1) }; });
check('burning hydrazine makes water', s.hydrazine === 2 && s.gained > 27, s);
await sleep(1600);

s = await ev((G) => { G.S.health = 80; G.tpLocal(3.2, 3.9); G.hold(1.0); return { health: Math.round(G.S.health), food: G.S.food, potatoes: G.S.potatoes }; });
check('eating at the shelf restores vitals', s.health === 92 && s.potatoes === 3, s);

const sol0 = (await ev((G) => G.S.sol));
await ev((G) => { G.setLocalTime(21); G.tpLocal(-5.0, -6.2); G.hold(1.4); });
await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 30000 });
const held = await ev((G) => ({ sleeping: G.S.sleeping, cells: document.querySelectorAll('#mg-panel .sleep .delta').length, notes: [...document.querySelectorAll('#mg-panel .sleep .notes dt')].map((n) => n.textContent) }));
await sleep(3200);                                     // it used to vanish after 2.4 s, unread
const still = await ev(() => !!document.querySelector('#mg-panel .sleep .wake'));
await ev(() => document.querySelector('#mg-panel .sleep .wake').click());
await sleep(300);
s = await ev((G) => ({ sol: G.S.sol, sleeping: G.S.sleeping, ui: G.S.uiOpen, over: G.S.over }));
check('sleeping until dawn advances the sol; the night\'s account waits to be read, then Start the day wakes him',
  s.sol === sol0 + 1 && !s.sleeping && !s.ui && !s.over && held.sleeping && held.cells === 5 && held.notes.some((n) => /^Breakfast/.test(n)) && held.notes.some((n) => /^Morale/.test(n)) && still, { ...s, sol0, held, still });

s = await ev((G) => {
  G.tpNear(G.World.rover.group.position, 3.2); G.hold(0.8);
  // (This checks the drive itself: speed, distance, drain. Whether a boulder stands in the rover's way depends on
  // which stones have arrived by now, and that depends on how busy the machine is: on a quiet one a block 56 m
  // out stopped the rover and failed the check, where on a busy one the stones had not come yet. So the boulders
  // are lifted for this drive. That boulders are in the way and have colliders is checked in tests/rocks.mjs.)
  G.rockColliders.length = 0;
  const mode1 = G.S.mode, p0 = G.S.roverPower;
  G.input.keys['w'] = true; G.tick(0.05, 160); G.input.keys['w'] = false;
  const out = { mode1, speed: +G.roverF.speed.toFixed(1), driven: Math.round(G.S.stats.driven), drained: +(p0 - G.S.roverPower).toFixed(2) };
  G.tick(0.05, 80);
  return out;
});
check('driving the rover', s.mode1 === 'rover' && s.speed > 20 && s.driven > 100 && s.drained > 0, s);
s = await ev((G) => { G.input.keys['f'] = false; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 2); return { mode: G.S.mode }; });
check('F steps out of the rover', s.mode === 'walk', s);

s = await ev((G) => {
  G.S.flags.pfRevealed = true;
  G.roverTo(G.World.pathfinder.position, 8); G.tpNear(G.World.pathfinder.position, 2.5); G.hold(2.8);
  const loaded = G.S.pf.loaded;
  G.roverTo(G.World.uplinkRing.position, 0.5); G.tpNear(G.World.uplink.position, 2.5); G.hold(2.8);
  return { loaded, connected: G.S.pf.connected, ui: G.S.uiOpen };
});
check('fetching Pathfinder and connecting the uplink', s.loaded && s.connected && s.ui, s);
for (let i = 0; i < 6; i++) { await click(i < 5 ? 'NEXT' : 'CLOSE CHANNEL'); await sleep(120); }
s = await ev((G) => ({ quests: Object.values(G.S.quests).filter((q) => q === 'active').length, pods: G.World.pods.length, ui: G.S.uiOpen }));
check('NASA conversation offers survey quests and a care package', s.quests === 7 && s.pods >= 4 && !s.ui, s);

s = await ev((G) => { G.S.inv.scrap = 10; G.S.inv.regolith = 2; G.tpLocal(-3.4, 3.2); return { inside: G.S.inside }; });
await g.page.keyboard.press('c');
await g.page.locator('button[data-r="candle"]').click({ timeout: 90000 });
await g.page.keyboard.press('c');
s = await ev((G) => ({ candle: G.S.inv.candle, scrap: G.S.inv.scrap, crafted: G.S.stats.crafted }));
check('fabricating an O2 candle at the bench', s.candle === 1 && s.scrap === 8 && s.crafted === 1, s);

// a breach must be sealable from in front of the comms desk even with Pathfinder connected
// (the desk's own prompts are nearer than the hole in the wall behind it)
s = await ev((G) => {
  G.S.breach.active = true; G.S.breach.done = false; G.S.breach.timer = 0;
  G.tpLocal(0.4, -5.4); G.tick(0.05, 2);
  const label = G.interaction.active && G.interaction.active.label();
  G.hold(3.3);
  return { label, active: G.S.breach.active, done: G.S.breach.done, o2: Math.round(G.S.o2) };
});
check('sealing a Hab breach at the comms desk', /breach/i.test(s.label || '') && !s.active && s.done, s);

// mail: with the uplink up, each dawn brings the next exchange whose moment has come
s = await ev((G) => {
  const first = G.mail.nextMail();
  const sent = G.mail.deliverMail(0);
  const second = G.mail.nextMail();
  // every message's condition must at least run without throwing
  const broken = G.mail.MAIL.filter((m) => { try { m.when(); return false; } catch (e) { return true; } }).map((m) => m.id);
  return { first: first && first.id, sent, second: second && second.id, read: Object.keys(G.S.mail), broken, total: G.mail.MAIL.length };
});
check('mail arrives once Pathfinder is connected, each message once', s.first === 'welcome' && s.sent === 'welcome' && s.second && s.second !== 'welcome' && s.broken.length === 0, s);

s = await ev((G) => {
  G.S.inv.kitBeacon = 1;
  G.tpLocal(0, 30);
  return { inside: G.S.inside };
});
await g.page.keyboard.press('c');
await g.page.locator('.pane.on [data-deploy="beacon"]').click({ timeout: 90000 });
s = await ev((G) => { G.tick(0.05, 2); G.hold(1.8); return { built: G.World.builtMeshes.map((b) => b.kind), kit: G.S.inv.kitBeacon }; });
check('deploying a nav beacon', s.built.length === 1 && s.built[0] === 'beacon' && s.kit === 0, s);

s = await ev((G) => {
  const snap = JSON.parse(JSON.stringify(G.serializeState()));
  const before = { water: G.S.water, sol: G.S.sol, potatoes: G.S.potatoes, built: G.World.builtMeshes.length, pf: G.S.pf.connected };
  G.S.water = 1; G.S.sol = 99; G.S.potatoes = 0;
  G.applyState(snap);
  return { before, after: { water: G.S.water, sol: G.S.sol, potatoes: G.S.potatoes, built: G.World.builtMeshes.length, pf: G.S.pf.connected } };
});
check('save and load round-trips the state', JSON.stringify(s.before) === JSON.stringify(s.after), s);

s = await ev((G) => { G.checkpoint(); G.tpLocal(0, 60); G.S.suit = 0; G.S.health = 0.5; G.tick(0.05, 10); return { over: G.S.over, dead: G.S.dead }; });
check('running out of air outside is fatal', s.over && /sphyx/.test(s.dead || ''), s);
await click('WAKE AT DAWN');
s = await ev((G) => ({ over: G.S.over, health: G.S.health, suit: G.S.suit }));
check('waking at the dawn checkpoint restores the run', !s.over && s.health >= 50 && s.suit >= 100, s);

s = await ev((G) => {
  G.S.sol = G.S.rescueSol; G.S.flags.mavRevealed = true;
  G.tpNear(G.World.mav.position, 5.5); G.hold(3.2);
  const stripped = G.S.flags.mavStripped;
  G.hold(1.8);
  return { stripped, ui: G.S.uiOpen };
});
check('stripping the MAV opens the launch prompt', s.stripped && s.ui, s);
await click('PUNCH IT');
s = await ev((G) => { const m = G.S.mode; G.tick(0.05, 900); return { mode: m, won: G.S.won, ui: G.S.uiOpen }; });
check('launching reaches orbit and wins', s.mode === 'cutscene' && s.won && s.ui, s);
await g.shot('arc-win');

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed; console errors: ${g.errors.length}`);
if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 5)).slice(0, 1200));
await g.close();
process.exit(failed.length || g.errors.length ? 1 : 0);
