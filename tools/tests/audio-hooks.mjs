// Audio wiring: play through the game's actions and check that each one asks for its own
// sound, and that the per-frame state the audio system is given matches what is happening.
// This is what breaks when game code is rearranged, so it is cheap and it names the culprit.
//
//   node tools/tests/audio-hooks.mjs
//
// It does not judge how anything sounds (tools/tests/audio.mjs measures that); it records the
// names passed to Snd.play and the parameters passed to Snd.update while a script drives the
// real game in real time.
import { openGame, sleep } from './lib.mjs';

const g = await openGame({ quality: 'low', width: 480, height: 300 });
await g.eval(async (G) => { await G.start(2.0, 303.7); G.paused = true; });
await g.page.mouse.click(240, 150);                  // the first gesture creates the audio context
await sleep(400);
const ready = await g.eval((G) => {
  const Snd = G.Snd;
  if (!Snd || !Snd.sys) return false;
  // No drawing: the script steps the game itself. Hiding the page as well stops every HUD
  // change from repainting it, which costs about a second each with software rendering.
  window.requestAnimationFrame = () => 0;
  document.body.style.display = 'none';
  const heard = (window.__heard = []);
  const play = Snd.sys.play.bind(Snd.sys);
  Snd.sys.play = (n, o) => { heard.push(n); return play(n, o); };
  const update = Snd.update.bind(Snd);
  Snd.update = (p) => { window.__p = p; update(p); };
  /**
   * Run the game for `seconds` of game time with real time passing between ticks (so the audio
   * clock moves too, even on a busy machine), holding the interact button if asked.
   */
  window.__run = (seconds, hold) => new Promise((done) => {
    let left = Math.ceil(seconds / 0.05);
    G.input.eHeld = !!hold;
    const id = setInterval(() => {
      G.tick(0.05);
      if (--left <= 0) { clearInterval(id); G.input.eHeld = false; G.tick(0.05); done(); }
    }, 20);
  });
  return true;
});
const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail) : '')); };
if (!ready) { check('audio starts on the first gesture', false); await g.close(); process.exit(1); }
check('audio starts on the first gesture', true);

/** Do something in the page, then return the sounds asked for since the last call and the latest parameters. */
const act = async (fn, arg) => {
  await g.eval(fn, arg);
  // (the log's typing tick is left out of the list: it accompanies everything)
  return g.eval(() => { const h = window.__heard.filter((n) => n !== 'uiType'), typed = window.__heard.length - h.length; window.__heard.length = 0; const p = window.__p || {}; return { h, typed, p: { ...p, launch: p.launch ? { ...p.launch } : null } }; });
};
const has = (r, ...names) => names.every((n) => r.h.includes(n));

let r = await act(async () => { await window.__run(0.4); });
check('cold open: outside, suit leaking', r.p.scene === 'play' && r.p.place === 'outside' && r.p.leak === true && r.p.o2 < 0.6, { scene: r.p.scene, place: r.p.place, leak: r.p.leak });

r = await act(async (G) => { G.input.keys.w = true; await window.__run(1.6); G.input.keys.w = false; });
check('walking makes footsteps', r.h.filter((n) => n === 'step').length >= 3 && r.p.move === 1, r.h);

r = await act(async (G) => { G.tpLocal(0, 10); await window.__run(2.5, true); });
check('sealing the suit: its own sound, tool work while holding, leak stops', has(r, 'suitSeal', 'work_tool') && r.p.leak === false, r.h);

r = await act(async (G) => { G.tpLocal(4.0, -3.0); await window.__run(1.0, true); });
check('walking into the Hab cycles the airlock; inspecting confirms', has(r, 'airlockIn', 'ok') && r.p.place === 'hab' && r.p.habAmt === 1, r.h);
r = await act(async (G) => { G.tpLocal(4.3, -0.4); await window.__run(1.0, true); G.tpLocal(0, -5.0); await window.__run(1.1, true); });
check('running the numbers at the desk', has(r, 'terminal'), r.h);

r = await act(async (G) => {
  const T = G.ctx.engine.camera.position.constructor, p = G.World.panels[0];
  G.tpNear(new T().copy(p.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position), 1.6);
  await window.__run(1.9, true);
});
check('wiping a panel', has(r, 'airlockOut', 'wipe', 'work_wipe') && r.p.place === 'outside', r.h);

r = await act(async (G) => { G.tpNear(G.World.soilPiles[0].group.position, 1.2); await window.__run(1.6, true); });
check('digging regolith', has(r, 'dig', 'work_dig'), r.h);

r = await act(async (G) => {
  G.S.inv.regolith = 2; G.tpLocal(-6.7, -3.2);          // beside the first farm tray, clear of the gap between trays
  await window.__run(1.5, true); await window.__run(1.5, true);
  const pick = document.querySelector('#mg-panel .choice');         // the kit has seed packets, so the bed asks what to plant
  if (pick) pick.click();
  G.World.plots[0].growth = 0.45; await window.__run(1.5, true);
  G.World.plots[0].growth = 0.999; await window.__run(1.0); await window.__run(1.5, true);
});
check('farming: fill, plant, water, harvest, each with its own work', has(r, 'fillBed', 'plant', 'water', 'harvest', 'jingle', 'work_dig', 'work_soft'), r.h);

r = await act(async (G) => { G.tpLocal(4.2, 2.6); await window.__run(2.2, true); await new Promise((done) => setTimeout(done, 1500)); await window.__run(0.2); });
check('burning hydrazine, and the fireball', has(r, 'hydrazine', 'hydrazineBoom'), r.h);

r = await act(async (G) => { G.S.health = 80; G.tpLocal(3.2, 3.9); await window.__run(1.0, true); });
check('eating', has(r, 'eat'), r.h);

r = await act(async (G) => { G.S.breach.active = true; G.tpLocal(2.0, -7.0); await window.__run(2.0); });   // beside the comms desk, in reach of the tear
const breachOn = r.p.breach === true && has(r, 'klaxon');
r = await act(async () => { await window.__run(3.2, true); });
check('a breach sounds the klaxon; sealing it has its own sound', breachOn && has(r, 'sealBreach') && r.p.breach === false, r.h);

r = await act(async (G) => { G.S.pf.connected = true; G.tpLocal(-0.9, -5.2); await window.__run(1.0, true); await window.__run(1.2); });
check('messaging NASA: send, the reply chirps, the log types', has(r, 'nasaSend', 'nasaMsg') && r.typed > 3, { h: r.h, typed: r.typed });

r = await act(async (G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); await window.__run(0.3); });
const opened = has(r, 'click', 'uiOpen') && r.p.paused === true;
r = await act(async (G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); await window.__run(0.3); });
check('opening and closing a screen', opened && has(r, 'uiClose') && r.p.paused === false, r.h);

r = await act(async (G) => { G.S.health = 100; G.tpLocal(3.2, 3.9); await window.__run(0.3); await window.__run(0.3, true); });
check('trying something that cannot be done gives the error sound', has(r, 'uiError'), r.h);

r = await act(async (G) => { G.S.inv.candle = 1; G.S.suit = 20; G.tpLocal(0, 40); await window.__run(0.3); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); await window.__run(0.2); });
check('cracking an O2 candle', has(r, 'candle'), r.h);

r = await act(async (G) => { G.S.suit = 6; await window.__run(1.4); G.S.suit = 6; });     // the warning has a second or so to sound
check('low oxygen sounds the suit warning', has(r, 'o2Warn') && r.p.o2 < 0.1, r.h);
await g.eval((G) => { G.S.suit = 100; });

r = await act(async (G) => { G.tpNear(G.World.rover.group.position, 3.2); await window.__run(0.8, true); G.input.keys.w = true; await window.__run(3); G.input.keys.w = false; });
check('boarding and driving the rover', has(r, 'roverEnter') && r.p.place === 'rover' && r.p.roverSpeed > 5, { h: r.h, speed: r.p.roverSpeed, throttle: r.p.throttle, rough: +(+r.p.rough).toFixed(3) });
r = await act(async (G) => { await window.__run(2.5); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); await window.__run(0.3); });
check('stepping out', has(r, 'roverExit') && r.p.place !== 'rover', r.h);

r = await act(async (G) => { G.S.sol++; await window.__run(0.3); G.checkAchievements(); await window.__run(0.2); });
check('a new sol and an achievement', has(r, 'solChange', 'achievement'), r.h);

await g.eval((G) => { G.checkpoint(); });
r = await act(async (G) => { G.tpLocal(0, 60); G.S.suit = 0; G.S.health = 0.5; await window.__run(0.6); });
check('death', has(r, 'death') && r.p.scene === 'dead', { h: r.h, scene: r.p.scene });
const click = async (text) => {
  await g.eval(() => { document.body.style.display = ''; });
  await g.page.locator('#mg-panel button', { hasText: text }).first().click({ timeout: 30000 });
  await g.eval(() => { document.body.style.display = 'none'; });
};
await click('WAKE AT DAWN');
r = await act(async () => { await window.__run(0.3); });
check('a button press has an interface sound; waking restores play', has(r, 'uiConfirm') && r.p.scene === 'play', { h: r.h, scene: r.p.scene });

await g.eval(async (G) => { G.S.sol = G.S.rescueSol; G.S.flags.mavRevealed = true; G.tpNear(G.World.mav.position, 5.5); await window.__run(3.2, true); await window.__run(1.8, true); });
await click('PUNCH IT');
r = await act(async () => { await window.__run(7.5); });
check('the launch: countdown, ignition, a burning rocket gaining height', has(r, 'countdown', 'ignition') && r.p.scene === 'cutscene' && r.p.launch && r.p.launch.burning && r.p.launch.alt > 10, { h: r.h, launch: r.p.launch });
r = await act(async (G) => { G.tick(0.05, 620); await window.__run(0.4); });
check('orbit and rescue', has(r, 'rescued') && r.p.scene === 'won', { h: r.h, scene: r.p.scene });

const st = await g.eval((G) => G.Snd.stats());
check('no audio errors', st.errors === 0, st);
check('no console errors', g.errors.length === 0, g.errors.slice(0, 3));
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} audio wiring checks passed`);
await g.close();
process.exit(failed ? 1 : 0);
