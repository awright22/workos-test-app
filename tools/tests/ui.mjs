// Interface test: menus work from the keyboard, settings persist and apply, the screens open
// and close, the map zooms and identifies markers, the touch controls work, and at every
// supported size nothing in the HUD overlaps anything else or strays outside the safe area.
import { openGame, sleep } from './lib.mjs';
import { auditInPage, auditLines, settledInPage } from './audit-lib.mjs';

// node tools/tests/ui.mjs --size=667   runs only the layout checks at the sizes whose name contains that text (for quick work on one size);
// --size=keys, --size=play and --size=portrait run only the keyboard, play and portrait parts
const onlySize = (process.argv.find((a) => a.startsWith('--size=')) || '').slice(7);
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined && !ok ? '  ' + JSON.stringify(detail) : '')); };
let errors = 0;

// ---------------------------------------------------------------------------------- keyboard and settings (desktop)
if (!onlySize || onlySize === 'keys') {
  const g = await openGame({ quality: 'low' });
  const page = g.page, key = (k) => page.keyboard.press(k);
  const focused = () => page.evaluate(() => (document.activeElement && (document.activeElement.dataset.act || document.activeElement.dataset.diff || document.activeElement.className)) || '');
  const kind = () => page.evaluate(() => document.getElementById('mg-overlay').className);
  await sleep(300);
  check('title: the first choice has focus', (await focused()) === 'new', await focused());
  await key('ArrowDown');
  check('title: arrow down moves to Settings', (await focused()) === 'settings', await focused());
  await key('Enter');
  check('title: Enter opens Settings', /k-sheet/.test(await kind()) && await page.locator('.set-grid').isVisible());
  // settings change, persist and apply
  await page.locator('[data-switch="invertY"]').click();
  await page.locator('[data-switch="colorBlind"]').click();
  await page.locator('[data-switch="reducedMotion"]').click();
  await page.locator('#set-hudScale').focus();
  await key('ArrowRight'); await key('ArrowRight');
  await page.locator('#set-volume').fill('0.5');
  const st = await page.evaluate(() => ({
    saved: JSON.parse(localStorage.getItem('stranded2-settings') || '{}'), invert: window.__MG.input.invertY,
    cls: document.getElementById('mg-root').className, rem: parseFloat(document.documentElement.style.fontSize),
  }));
  check('settings: invert look reaches the game input', st.invert === true && st.saved.invertY === true, st);
  check('settings: colour-blind-safe and reduced motion apply to the interface', /mg-cb/.test(st.cls) && /mg-reduced/.test(st.cls), st.cls);
  check('settings: interface size scales the root font', Math.abs(st.saved.hudScale - 1.1) < 0.001 && Math.abs(st.rem - 17.6) < 0.1, { hud: st.saved.hudScale, rem: st.rem });
  check('settings: volume is saved', st.saved.volume === 0.5, st.saved);
  await page.locator('[data-seg="quality"] [data-v="high"]').click();
  const q = await page.evaluate(() => ({ q: localStorage.getItem('stranded2-quality'), reload: !document.querySelector('[data-act="reload"]').hidden }));
  check('settings: a new quality is saved and offers a reload', q.q === 'high' && q.reload, q);
  await page.locator('[data-seg="quality"] [data-v="auto"]').click();
  await page.locator('[data-act="reset"]').click();
  const st2 = await page.evaluate(() => ({ cls: document.getElementById('mg-root').className, saved: localStorage.getItem('stranded2-settings'), q: localStorage.getItem('stranded2-quality') }));
  check('settings: reset restores the defaults', !/mg-cb/.test(st2.cls) && st2.saved === null && st2.q === null, st2);
  await key('Escape');
  check('settings: Escape returns to the title', /k-title/.test(await kind()));
  // new game from the keyboard
  await key('Enter');
  check('new game: three difficulty cards, Engineer focused', (await page.locator('.diff').count()) === 3 && (await focused()) === 'survival', await focused());
  await key('ArrowRight');
  check('new game: arrows move between the cards', (await focused()) === 'iron', await focused());
  await key('ArrowLeft');
  await key('Enter');
  await page.waitForFunction(() => window.__MG.S.started && document.getElementById('mg-root').classList.contains('is-playing'), null, { timeout: 240000 });
  let s = await g.eval((G) => ({ diff: G.S.diff, ui: G.S.uiOpen, hud: getComputedStyle(document.getElementById('mg-hud')).visibility }));
  check('new game: Enter starts the run and shows the HUD', s.diff === 'survival' && !s.ui && s.hud === 'visible', s);
  await g.eval(async (G) => { await G.settle(); G.paused = true; G.skipIntro(); G.tpLocal(0, 30, 0); G.tick(0.05, 4); });
  // pause
  await key('Escape');
  s = await g.eval((G) => ({ ui: G.S.uiOpen, kind: document.getElementById('mg-overlay').className, saved: !!localStorage.getItem('stranded2-save') }));
  check('pause: Escape pauses and saves', s.ui && /k-pause/.test(s.kind) && s.saved, s);
  await key('ArrowDown'); await key('ArrowDown'); await key('ArrowDown'); await key('Enter');      // Resume, Photo mode, Settings, Controls
  check('pause: Controls opens from the keyboard', await page.locator('.ctl-grid').isVisible());
  await key('Escape'); await key('Escape');
  s = await g.eval((G) => ({ ui: G.S.uiOpen }));
  check('pause: Escape resumes', !s.ui, s);
  // the three screens
  for (const [k, id] of [['m', 'mg-map'], ['c', 'mg-colony'], ['j', 'mg-journal']]) {
    await key(k);
    const open = await page.evaluate((i) => document.getElementById(i).style.display === 'block', id);
    await key('Escape');
    const closed = await page.evaluate((i) => document.getElementById(i).style.display !== 'block', id);
    check(`screen ${id}: opens with ${k.toUpperCase()}, closes with Escape`, open && closed);
  }
  // map: zoom, pan, identify
  await key('m');
  const scale0 = await page.locator('.map-scale span').innerText();
  const box = await page.locator('#mg-mapcanvas').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
  await page.waitForFunction((was) => document.querySelector('.map-scale span').innerText !== was, scale0, { timeout: 8000 }).catch(() => {});
  const scale1 = await page.locator('.map-scale span').innerText();
  check('map: the wheel zooms', scale0 !== scale1, { scale0, scale1 });
  await page.locator('.map-tools [data-a="hab"]').click();
  await sleep(900);
  await page.mouse.click(box.x + box.width / 2, box.y + (box.height - 40) / 2);
  await sleep(200);
  const info = await page.locator('.map-info').innerText().catch(() => '');
  check('map: clicking a marker says what it is and how far', /distance/i.test(info) && /\d+ (m|km)/i.test(info), info.slice(0, 80));
  await page.locator('#mg-map .scr-nav [data-screen="journal"]').click();
  check('screens: the header switches between them', await page.evaluate(() => document.getElementById('mg-journal').style.display === 'block' && document.getElementById('mg-map').style.display !== 'block'));
  await page.locator('#mg-journal [data-tab="ach"]').click();
  check('journal: tabs switch', /achievements/i.test(await page.locator('.jr-body .pane-hd').first().innerText()));
  await page.locator('#mg-journal .close').click();
  check('screens: the close button closes', await g.eval(() => !['mg-map', 'mg-colony', 'mg-journal'].some((i) => document.getElementById(i).style.display === 'block')));
  // dialogs carry roles and names
  await key('Escape');
  const aria = await page.evaluate(() => { const p = document.getElementById('mg-panel'); return { role: p.getAttribute('role'), modal: p.getAttribute('aria-modal'), label: p.getAttribute('aria-label') }; });
  check('dialogs: role, modal flag and a name', aria.role === 'dialog' && aria.modal === 'true' && !!aria.label, aria);
  // save and quit: back to the title, with the run ready to continue
  const titleReady = () => page.waitForFunction(() => window.__MG && window.__MG.ready && !window.__MG.S.started && document.querySelector('.menu-item'), null, { timeout: 240000 });
  // (these three clicks reload the page: the wait for it is titleReady's, which allows for a slow machine, not the click's own half minute)
  await page.locator('[data-act="quit"]').click({ noWaitAfter: true });
  await titleReady();
  const t1 = await page.locator('#mg-panel').innerText();
  check('pause: Save and quit returns to a title that offers to continue', /continue\s*sol 1\b/i.test(t1), t1.slice(0, 80));
  // a new graphics quality: saved, applied by a reload, and the run is still there
  await page.locator('[data-act="settings"]').click();
  await page.locator('[data-seg="quality"] [data-v="medium"]').click();
  await page.locator('[data-act="reload"]').click({ noWaitAfter: true });
  await titleReady();
  const q2 = await page.evaluate(() => ({ running: window.__MG.ctx.engine.qualityName, url: location.search, cont: !!document.querySelector('[data-act="continue"]') }));
  check('settings: Reload to apply restarts on the chosen quality and keeps the run', q2.running === 'medium' && !/[?&]q=/.test(q2.url) && q2.cont, q2);
  // restart asks first, then deletes the save
  await page.locator('[data-act="continue"]').click();
  await page.waitForFunction(() => window.__MG.S.started && document.getElementById('mg-root').classList.contains('is-playing'), null, { timeout: 60000 });
  await g.eval((G) => { G.paused = true; });
  await key('Escape');
  await page.locator('[data-act="restart"]').click();
  const asks = await page.locator('#mg-panel').innerText();
  await page.locator('#mg-panel button', { hasText: 'Keep playing' }).click();
  const kept = await page.evaluate(() => ({ kind: document.getElementById('mg-overlay').className, save: !!localStorage.getItem('stranded2-save') }));
  check('restart: asks first, and Keep playing goes back with the save intact', /start over/i.test(asks) && /k-pause/.test(kept.kind) && kept.save, { asks: asks.slice(0, 60), kept });
  await page.locator('[data-act="restart"]').click();
  await page.locator('#mg-panel button', { hasText: 'Delete and restart' }).click({ noWaitAfter: true });
  await titleReady();
  const gone = await page.evaluate(() => ({ save: localStorage.getItem('stranded2-save'), cont: !!document.querySelector('[data-act="continue"]') }));
  check('restart: Delete and restart wipes the save and returns to the title', gone.save === null && !gone.cont, gone);
  errors += g.errors.length;
  if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 4)).slice(0, 800));
  await g.close();
}

// ---------------------------------------------------------------------------------- the suit's time left, distances, the night
if (!onlySize || onlySize === 'play') {
  const g = await openGame({ quality: 'low' });
  const page = g.page;
  const secs = (s) => { const m = /^(\d+):(\d\d) of air$/i.exec(String(s).trim()); return m ? +m[1] * 60 + +m[2] : null; };
  await page.evaluate(() => { window.__st = () => document.querySelector('#mg-vitals .suit .st').textContent.trim(); window.__UI.setSetting('reducedMotion', true); });
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 10); });
  // the cold open: a holed suit, counting down from the first second
  const cold = await g.eval((G) => { const out = []; for (let i = 0; i < 4; i++) { G.tick(0.05, 40); out.push([+G.S.suit.toFixed(2), window.__st()]); } return out; });
  check('suit timer: counts down through the first seconds', cold.every(([, t]) => secs(t) !== null) && cold.every(([, t], i) => !i || secs(t) < secs(cold[i - 1][1])), cold);
  // sealed at the door, a full tank reads a full tank's time at once (it read "2:25 left" on, from the leak)
  const sealed = await g.eval((G) => {
    G.tpLocal(0, 10.0, 0); G.tick(0.05, 6); G.hold(2.6); G.tick(0.05, 2);
    return { suit: G.S.suit, t: window.__st(), rate: G.BAL.suitWalk * (1 + (1 - G.machineEff('suit')) * 0.9) * G.S.drainMult, inside: G.S.inside, sealed: G.S.flags.suitSealed, bars: getComputedStyle(document.querySelector('#mg-vitals .res')).display };
  });
  check('suit timer: a suit just sealed reads a full tank, not the leak', sealed.sealed && !sealed.inside && Math.abs(secs(sealed.t) - sealed.suit / sealed.rate) < 3 && secs(sealed.t) > 300, sealed);
  check('first minute: the bars wait to be met (at the door there is one number)', sealed.bars === 'none', sealed.bars);
  // Each bar arrives with the thing it measures, and is lit for as long as the card that names it is up. (All six used
  // to arrive on the Hab's threshold, and the buttons were lit on timers of their own, out of step with their cards.)
  await page.evaluate(() => {
    window.__bars = () => [...document.querySelectorAll('#mg-vitals .res .row')].filter((r) => r.getBoundingClientRect().height > 2).map((r) => r.dataset.k);
    window.__lit = () => [...document.querySelectorAll('#mg-vitals .row.fresh, #mg-trow .mg-tbtn.fresh')].map((r) => r.dataset.k || r.dataset.t);
    window.__card = () => (document.querySelector('#mg-toast .toast') || { textContent: '' }).textContent;
    window.__btns = () => [...document.querySelectorAll('#mg-trow .mg-tbtn[data-t]')].filter((b) => getComputedStyle(b).visibility !== 'hidden' && getComputedStyle(b).display !== 'none').map((b) => b.dataset.t);
  });
  const noToast = () => page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 40000 }).catch(() => {});
  const inHab = await g.eval((G) => { G.tpLocal(0, 3, 0); G.tick(0.05, 6); return window.__bars(); });
  const oxy = await g.eval((G) => { G.tpLocal(4.0, -3.0); G.tick(0.05, 6); G.hold(1.0); G.tick(0.05, 2); return { bars: window.__bars(), lit: window.__lit(), card: window.__card(), btns: window.__btns() }; });
  await noToast();
  const oxyAfter = await g.eval(() => window.__lit());
  check('first minute: no bar on the threshold; inspecting the oxygenator brings HAB O2 alone, lit while the card that names it is up and no longer',
    inHab.length === 0 && oxy.bars.join() === 'o2' && oxy.lit.join() === 'o2' && /oxygenator/i.test(oxy.card) && /HAB O/.test(oxy.card) && oxyAfter.length === 0 && oxy.btns.length === 0, { inHab, oxy, oxyAfter });
  const rec = await g.eval((G) => { G.tpLocal(4.3, -0.4); G.tick(0.05, 6); G.hold(1.0); G.tick(0.05, 2); return { bars: window.__bars(), lit: window.__lit(), card: window.__card() }; });
  await noToast();
  // the numbers: the FOOD bar and then the Journal, one card at a time, each with its own thing lit
  await g.eval((G) => { G.tpLocal(0, -5.0); G.tick(0.05, 6); G.hold(1.1); });
  const sheet = await page.evaluate(() => ({ text: document.querySelector('#mg-panel .dlg').textContent, later: (document.querySelector('#mg-panel .dlg-later') || { textContent: '' }).textContent }));
  await page.evaluate(() => document.querySelector('#mg-panel .btns button').click());
  await g.eval((G) => { G.tick(0.05, 4); });
  // (a card that came due under the sheet waits for it to be put down, and is up within half a second of that)
  await page.waitForFunction(() => /food/i.test(window.__card()), null, { timeout: 20000 }).catch(() => {});
  const food = await g.eval(() => ({ bars: window.__bars(), lit: window.__lit(), card: window.__card(), btns: window.__btns(), clock: document.querySelector('#mg-clock .of').textContent }));
  await page.waitForFunction(() => /journal/i.test(window.__card()), null, { timeout: 40000 }).catch(() => {});
  const jrn = await g.eval(() => ({ lit: window.__lit(), card: window.__card(), btns: window.__btns() }));
  check('first minute: the reclaimer brings WATER, and the numbers bring FOOD and then the Journal, each lit with its own card',
    rec.bars.join() === 'o2,water' && rec.lit.join() === 'water' && food.bars.join() === 'o2,water,food' && food.lit.join() === 'food' && /food/i.test(food.card) &&
    jrn.lit.join() === 'journal' && /journal/i.test(jrn.card) && jrn.btns.join() === 'journal', { rec, food, jrn });
  // (the plan is on the card he puts down himself, not on a line of the log that passes while he is at a bed)
  check('the numbers: the card says where it all leads (a radio, the rocket in Schiaparelli, the sol), in meals, and the clock then names the rescue',
    /meals left/i.test(sheet.text) && /radio/.test(sheet.later) && /Schiaparelli/.test(sheet.later) && /Sol \d+/.test(sheet.later) && /rescue\s*\d+/i.test(food.clock), { later: sheet.later, clock: food.clock });
  await noToast();
  // out of the door: the Map, to the left of the Journal, which does not move; and with the first load of regolith, the Colony
  const jx = await page.evaluate(() => document.querySelector('#mg-trow [data-t="journal"]').getBoundingClientRect().left);
  const out1 = await g.eval((G) => { G.tpLocal(0, 30, 0); G.tick(0.05, 6); return { lit: window.__lit(), card: window.__card(), btns: window.__btns() }; });
  await noToast();
  const out2 = await g.eval((G) => { G.tpNear(G.World.soilPiles[0].group.position, 1.2); G.tick(0.05, 6); G.hold(1.6); G.tick(0.05, 4); return { lit: window.__lit(), card: window.__card(), btns: window.__btns().sort(), inv: G.S.inv.regolith }; });
  const jx2 = await page.evaluate(() => document.querySelector('#mg-trow [data-t="journal"]').getBoundingClientRect().left);
  check('first minute: the Map arrives on stepping out and the Colony with the first load carried, and the buttons already there do not move',
    out1.lit.join() === 'map' && /map/i.test(out1.card) && out1.btns.sort().join() === 'journal,map' && out2.inv === 1 && out2.lit.join() === 'colony' && /colony/i.test(out2.card) &&
    out2.btns.join() === 'colony,journal,map' && Math.abs(jx - jx2) < 0.5, { out1, out2, jx, jx2 });
  await noToast();
  // standing, walking, running, standing: it never rises unless the tank does, and always reads the tank at a walk
  const trace = await g.eval((G) => {
    G.skipIntro(); G.tpLocal(0, 150, 0); G.tick(0.05, 4);          // (well clear of the Hab: sixty metres of walking must not end in the airlock)
    const out = [];
    const run = (n, keys) => { Object.assign(G.input.keys, keys); for (let i = 0; i < n; i++) { G.tick(0.05, 4); out.push([G.S.suit, window.__st()]); } };
    run(20, {}); run(20, { w: true }); run(20, { w: true, shift: true }); run(20, { w: false, shift: false });
    return { out, rate: G.BAL.suitWalk * (1 + (1 - G.machineEff('suit')) * 0.9) * G.S.drainMult };
  });
  let rises = 0, wrong = 0, stuck = 0;
  for (let i = 0; i < trace.out.length; i++) {
    const [suit, t] = trace.out[i], s = secs(t);
    if (s === null || Math.abs(s - suit / trace.rate) > 2) wrong++;
    if (i && s > secs(trace.out[i - 1][1]) && suit <= trace.out[i - 1][0]) rises++;
    if (i >= 10 && s === secs(trace.out[i - 10][1])) stuck++;          // (ten samples are two seconds of game time)
  }
  check('suit timer: standing, walking and running it only falls, keeps moving, and always reads the tank at a walk', rises === 0 && wrong === 0 && stuck === 0, { rises, wrong, stuck, first: trace.out[0], last: trace.out[trace.out.length - 1] });
  const refill = await g.eval((G) => {
    const at = (suit, tank) => { G.S.upgrades.tank1 = !!tank; G.S.suit = suit; G.tick(0.05, 1); return window.__st(); };
    const out = { a: at(40), b: at(80), big: at(150, true), full: at(100) };
    G.tpLocal(0, 0, 0); G.tick(0.05, 40); out.inside = window.__st();
    G.S.suit = 100; G.tpLocal(0, 40, 0); G.tick(0.05, 4);
    return out;
  });
  check('suit timer: a refill shows at once, and a 150 tank reads longer than a 100', Math.abs(secs(refill.b) - 2 * secs(refill.a)) <= 2 && secs(refill.big) > secs(refill.full) * 1.4, refill);
  check('suit timer: in the Hab it says where the air comes from, not a time', /^(hab air|refilling)$/i.test(refill.inside), refill.inside);

  // one distance per place: the marker's tag, the mission line and the compass's Hab mark are the same number, and move together
  const where = () => g.eval(() => ({
    tag: document.querySelector('#mg-way b').textContent, shown: getComputedStyle(document.getElementById('mg-way')).display !== 'none',
    line: document.querySelector('#mg-objectives .obj:not(.done) .ds').textContent, lead: document.querySelector('#mg-objectives .obj:not(.done) .tx').textContent,
    place: document.querySelector('#mg-objectives .obj:not(.done) .pl').textContent.toLowerCase(), then: document.querySelector('#mg-objectives .obj:not(.done) .nx').textContent.toLowerCase(),
    compass: [...document.querySelectorAll('#mg-compass .dists span')].filter((s) => s.style.display !== 'none' && s.style.visibility !== 'hidden').map((s) => s.textContent.toLowerCase().trim()),
  }));
  await g.eval((G) => { G.S.inv.regolith = 2; G.tpLocal(0, 30, 0); G.tick(0.05, 1); });       // (a bed to fill: the way leads in through the airlock door)
  const d1 = await where();
  await g.eval((G) => { G.tpLocal(2, 55, 0); G.tick(0.05, 1); });
  const d2 = await where();
  // (The compass names the place the mission's lead line sends him to, first: here the Hab, by its door. It names it
  //  and no more: the distance is the mission line's, and under the marker when the marker is on its place. Printed
  //  under the compass as well, it was one distance three times over. Every other tag is a name and a distance.)
  const agree = (d) => d.shown && d.tag === d.line && /\d+ m$/.test(d.tag) && d.compass.includes('hab') && d.compass.every((t) => t === 'hab' || /^[a-z0-9 ]+ \d/.test(t));
  check('distances: the marker and the mission line give one number for the Hab; the compass names the Hab, and every other tag has a name and a distance', agree(d1) && agree(d2) && d1.tag !== d2.tag, { d1, d2 });
  // a breach, indoors: the compass names the breach, not a survey site kilometres away
  // (forty frames: the list and the compass look again at what there is to do every dozen or so)
  const br = await g.eval((G) => {
    const keep = JSON.stringify(G.S.breach);
    G.tpLocal(0, 0, 0); G.S.breach.active = true; G.tick(0.05, 40);
    const out = { labels: [...document.querySelectorAll('#mg-compass .dists span')].filter((s) => s.style.display !== 'none' && s.style.visibility !== 'hidden').map((s) => s.textContent.toLowerCase()),
      lead: document.querySelector('#mg-objectives .obj:not(.done) .tx').textContent, line: document.querySelector('#mg-objectives .obj:not(.done) .ds').textContent };
    Object.assign(G.S.breach, JSON.parse(keep)); G.tick(0.05, 40);
    return out;
  });
  check('compass: in a breach indoors its one label is where the breach is, and the mission line has the distance', /breach/i.test(br.lead) && br.labels.length === 1 && br.labels[0].trim() === 'far wall' && /\d+ m/.test(br.line), br);
  // inside, a thing outside is marked at the door with the whole walk; the marker's number is still the line's
  // (forty frames, as for the breach above: the compass looks again at what there is to do every dozen or so, and after
  // two it could still be naming the last place)
  await g.eval((G) => { G.S.inv.regolith = 0; G.tpLocal(0, 0, 0); G.tick(0.05, 40); });
  const d3 = await where();
  // (an arrowhead at the edge of the screen carries no number: on its place the marker's number is the line's)
  check('distances: indoors the marker and the mission line still agree', d3.shown && (d3.tag === '' || d3.tag === d3.line), d3);
  // ... and the way out is said: the line names the airlock, with the distance to the door, and then the thing itself
  // with the rest of the walk. (The whole walk under the heap's name was a straight line through the wall with nothing
  // to show where the door was; before that the whole walk stood under the airlock's name, 46 m to a door 13 m away.)
  const walk = await g.eval((G) => ({ door: Math.round(G.groundDist(G.player.pos, G.at(0, 7.5))) }));      // (the inner door stands 7.5 m from the middle of the Hab)
  check('distances: indoors, a thing outside is reached by the airlock: the line gives the door and its distance, then the thing and the rest of the walk',
    d3.place === 'airlock' && Math.abs(parseInt(d3.line, 10) - walk.door) <= 2 && /^then heap \d+ m$/.test(d3.then.replace(/\s+/g, ' ').trim()) && d3.compass.includes('airlock'), { d3, walk });

  // The rule of what is always there: digging the open ground is "ambient", and an ambient thing is offered only with
  // a reason, and never under a red task. (A dig prompt and a DIG button stood on the screen every second out of doors,
  // at 27 seconds of air and through a breach.)
  const dig = await g.eval((G) => {
    const S = G.S, p = document.getElementById('mg-prompt'), b = document.getElementById('mg-tE');
    const now = () => ({ on: p.classList.contains('on'), minor: p.classList.contains('minor'), says: p.querySelector('.lb').textContent, sub: p.querySelector('.sub').textContent, active: !!G.interaction.active && G.interaction.active.priority >= 9 });
    const keep = JSON.stringify({ piles: G.World.soilPiles.map((h) => h.left), inv: S.inv, suit: S.suit, breach: S.breach, plots: G.World.plots.map((q) => q.state) });
    const out = { ambient: G.interactables.filter((it) => it.priority >= 9).length };
    G.tpLocal(0, 60, 0); S.inv.regolith = 0; G.tick(0.05, 40);
    out.idle = now();                                                   // heaps at the door, nothing wanted here
    for (const h of G.World.soilPiles) h.left = 0;
    G.World.plots[0].state = 'empty'; G.tick(0.05, 40);
    out.wanted = now();                                                 // an empty bed and no heap left: dig here
    S.suit = 20; G.tick(0.05, 40);
    out.lowAir = now(); out.lead = document.querySelector('#mg-objectives .obj:not(.done)').className;
    S.suit = 100; S.breach.active = true; G.tick(0.05, 40);
    out.breach = now();
    S.breach.active = false; G.tick(0.05, 40);
    out.again = now();
    S.inv.regolith = 6; G.tick(0.05, 40);
    out.carrying = now();                                               // he has what the beds want: nothing to dig for
    const k = JSON.parse(keep);
    G.World.soilPiles.forEach((h, i) => { h.left = k.piles[i]; }); G.World.plots.forEach((q, i) => { q.state = k.plots[i]; });
    Object.assign(S.inv, k.inv); S.suit = k.suit; Object.assign(S.breach, k.breach); G.syncAllVisuals(); G.tick(0.05, 40);
    return out;
  });
  check('prompt: digging the open ground is offered only when something wants it, with its reason, and never under a red task',
    dig.ambient >= 1 && !dig.idle.on && !dig.idle.active && dig.wanted.on && dig.wanted.minor && /dig/i.test(dig.wanted.says) && /bed/i.test(dig.wanted.sub) &&
    /urgent/.test(dig.lead) && !dig.lowAir.active && !dig.lowAir.on && !dig.breach.active && !dig.breach.on && dig.again.on && !dig.carrying.on, dig);
  // "food for N sols" is the breakfasts the larder gives, eaten as breakfast eats (a staple, and a side while there
  // are sides): "−2 food, 20 left" used to be followed by "food for 20 sols"
  const larderDays = await g.eval((G) => {
    const S = G.S; G.farm.farm();
    const keep = JSON.stringify({ potatoes: S.potatoes, food: S.food, pantry: S.pantry, morale: S.morale, diet: S.diet });
    S.potatoes = 3; S.food = 4; S.pantry = { radish: 1, lettuce: 0, soy: 2, tomato: 2 };
    const meals = G.farm.foodTotal(), said = G.farm.breakfastsLeft();
    let eaten = 0;
    while (G.farm.breakfast() !== 'skipped' && eaten < 99) eaten++;
    const k = JSON.parse(keep); S.potatoes = k.potatoes; S.food = k.food; S.pantry = k.pantry; S.morale = k.morale; S.diet = k.diet;
    return { meals, said, eaten };
  });
  check('food: the sols the larder lasts are the breakfasts it gives, which is fewer than its meals while there are sides', larderDays.said === larderDays.eaten && larderDays.said < larderDays.meals, larderDays);

  // the rule of the prompt: whatever cannot be done says why. Every interaction is asked, in states where it refuses,
  // and each answer is a sentence: a reading, or what is wanting and, after a colon, what to do about it (the first
  // part is what the action button shows). A bare "no" is not an answer.
  const refusals = await g.eval((G) => {
    const S = G.S, out = [];
    const ask = (state) => {
      for (const it of G.interactables) {
        if (!it.enabled) continue;
        let r; try { r = it.enabled(); } catch (e) { continue; }             // (nothing of its kind in reach: it would not be asked)
        if (r !== true) out.push({ state, r: typeof r === 'string' ? r : String(r), isString: typeof r === 'string' });
      }
    };
    G.farm.farm();
    const keep = JSON.stringify({ inv: S.inv, water: S.water, breach: S.breach, sol: S.sol, potatoes: S.potatoes, food: S.food, seeds: S.seeds, pantry: S.pantry, up: S.upgrades, hyd: S.hydrazine });
    const pl = G.World.plots[0], was = { state: pl.state, growth: pl.growth, watered: pl.watered };
    G.tpLocal(-6.7, -3.2); G.tick(0.05, 2);
    S.inv.regolith = 0; pl.state = 'empty'; ask('an empty bed and no regolith');
    pl.state = 'soil'; S.water = 2; ask('a bed of soil and no water');
    S.water = 60; S.potatoes = 0; S.food = 0; S.seeds = { radish: 0, lettuce: 0, soy: 0, tomato: 0 }; S.pantry = { radish: 0, lettuce: 0, soy: 0, tomato: 0 }; ask('a bed of soil and nothing to plant');
    S.food = 5; pl.state = 'growing'; pl.growth = 0.45; pl.watered = 1; S.water = 2; ask('a thirsty bed and no water');
    S.water = 60; pl.growth = 0.2; ask('a bed growing');
    S.breach.active = true; S.hydrazine = 0; S.upgrades = {}; S.sol = 1; ask('a breach, an empty hydrazine tank, no drill, Sol 1');
    const k = JSON.parse(keep);
    Object.assign(S, { water: k.water, sol: k.sol, potatoes: k.potatoes, food: k.food, seeds: k.seeds, pantry: k.pantry, upgrades: k.up, hydrazine: k.hyd }); Object.assign(S.inv, k.inv); Object.assign(S.breach, k.breach);
    Object.assign(pl, was); G.syncAllVisuals(); G.tick(0.05, 40);
    return out;
  });
  {
    const READING = '\u200b';
    // (five refusals live in game files this test's author could not edit; they give their reason, in another form)
    const elsewhere = /analyser|Sample case|Already sampled|in good order/;
    const formed = (r) => r.startsWith(READING) ? r.length > 4 : /^[A-Z][^:—(]{2,21}?\s*[:—(]\s*\S/.test(r) && r.split(/[:—(]/)[0].trim().split(/\s+/).length <= 4;
    const bare = refusals.filter((x) => !x.isString || !x.r.replace(READING, '').trim());
    const unformed = refusals.filter((x) => x.isString && !elsewhere.test(x.r) && !formed(x.r));
    const seen = [...new Set(refusals.map((x) => x.r.replace(READING, '(reading) ')))];
    check('prompt: every refusal gives its reason, as "what is wanting: what to do about it" or as a reading', refusals.length >= 8 && bare.length === 0 && unformed.length === 0, { bare, unformed, seen });
    // the empty bed, as a new player meets it: the reason in the prompt line, and what is wanting on the action button
    const bed = await g.eval((G) => {
      const pl = G.World.plots[0], was = pl.state, reg = G.S.inv.regolith;
      pl.state = 'empty'; G.S.inv.regolith = 0; G.tpLocal(-6.7, -3.2); G.tick(0.05, 3);
      const p = document.getElementById('mg-prompt'), out = { on: p.classList.contains('on') && getComputedStyle(p).visibility === 'visible' && +getComputedStyle(p).opacity > 0.99, no: p.classList.contains('no'), says: p.querySelector('.lb').textContent, sub: p.querySelector('.sub').textContent, button: document.querySelector('#mg-tE .vb').textContent };
      pl.state = was; G.S.inv.regolith = reg; G.syncAllVisuals(); G.tick(0.05, 3);
      return out;
    });
    check('prompt: an empty bed with no regolith says what it needs and, on the line under, where to get it, at once, and the button says NEEDS REGOLITH', bed.on && bed.no && /^needs regolith$/i.test(bed.says) && /^Dig it .*heap/.test(bed.sub) && bed.button === 'NEEDS REGOLITH', bed);
    // a prompt that asks for nothing does not stand: a reading goes after a few seconds of play, and is back when he is
    const reading = await g.eval((G) => {
      const T = G.ctx.engine.camera.position.constructor, pn = G.World.panels[0], was = pn.dust, p = document.getElementById('mg-prompt');
      const vis = () => p.classList.contains('on') && getComputedStyle(p).visibility === 'visible';
      pn.dust = 0;
      G.tpNear(new T().copy(pn.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position), 1.6); G.tick(0.05, 6);
      const out = { first: vis(), says: p.querySelector('.lb').textContent, info: p.classList.contains('info') };
      G.tick(0.05, 150); out.after = vis();
      G.tpLocal(0, 60, 0); G.tick(0.05, 6);
      G.tpNear(new T().copy(pn.group.position).applyQuaternion(G.World.solarGroup.quaternion).add(G.World.solarGroup.position), 1.6); G.tick(0.05, 6);
      out.back = vis(); pn.dust = was; G.tick(0.05, 3);
      return out;
    });
    check('prompt: a reading ("This panel is clean") is put away after a few seconds, and shown again when he comes back to it', reading.first && reading.info && !reading.after && reading.back, reading);
  }

  // the journal: a task's reason is a line of its own under its title
  await page.keyboard.press('j');
  const jr = await page.evaluate(() => {
    const o = document.querySelector('#mg-journal .obj-list .obj'), tx = o.querySelector('.tx').getBoundingClientRect(), why = o.querySelector('.why');
    return why ? { below: why.getBoundingClientRect().top >= tx.bottom - 1, title: o.querySelector('.tx').textContent, why: why.textContent } : null;
  });
  check('journal: a task\'s reason is on its own line under the title', jr && jr.below && jr.why.length > 8 && !jr.title.includes(jr.why), jr);
  // the log: as many entries on the page as its heading counts (a rule meant for the HUD's log hid all but two of seventeen)
  await page.evaluate(() => { for (let i = 0; i < 9; i++) window.__UI.log(`Entry ${i}: checked the seals again.`, i % 2 ? 'sys' : 'log'); });
  await page.locator('.journal [data-tab="log"]').click();
  const jl = await page.evaluate(() => ({
    head: (document.querySelector('#mg-journal .jr-body .pane-hd span') || {}).textContent,
    shown: [...document.querySelectorAll('#mg-journal .jlog .mg-line')].filter((n) => getComputedStyle(n).display !== 'none' && +getComputedStyle(n).opacity > 0.5).length,
    who: [...new Set([...document.querySelectorAll('#mg-journal .jlog .who')].map((n) => n.firstChild.textContent))],
  }));
  check('journal: the log shows as many entries as its heading says, each with a speaker', jl.shown >= 9 && new RegExp(`\\b${jl.shown} entries`).test(jl.head) && jl.who.every((w) => /^[A-Z]+$/.test(w)), jl);
  await page.locator('.journal [data-tab="tasks"]').click();
  // a tab's count is the number of things its page lists ("Tasks 6" stood over three tasks), and the page says where it all leads
  const jc = await page.evaluate(() => ({
    tab: parseInt((document.querySelector('#mg-journal [data-tab="tasks"] em') || { textContent: '0' }).textContent, 10),
    listed: document.querySelectorAll('#mg-journal .obj-list:not(.done-list) .obj').length + document.querySelectorAll('#mg-journal .card.quest:not(.done)').length,
    way: [...document.querySelectorAll('#mg-journal .way li strong')].map((n) => n.textContent), wayText: (document.querySelector('#mg-journal .way') || { textContent: '' }).textContent,
    uplink: (document.querySelector('#mg-journal .empty') || { textContent: '' }).textContent,
  }));
  check('journal: the Tasks tab counts the tasks its page lists', jc.tab > 0 && jc.tab === jc.listed, jc);
  check('journal: the task page says where it all leads (a radio, then the rocket in Schiaparelli) and what an uplink is', jc.way.length === 3 && /radio/.test(jc.wayText) && /Schiaparelli/.test(jc.wayText) && /Sol \d+/.test(jc.wayText) && /\d\skm/.test(jc.wayText) && /radio/.test(jc.uplink) && /alive/.test(jc.uplink), jc);
  await page.keyboard.press('Escape');
  // FOOD on the HUD is the sum of the rows under Food in the inventory (13 was set against a list that came to 22)
  await g.eval((G) => { const S = G.S; G.farm.farm(); window.__larder = JSON.stringify([S.pantry, S.potatoes]); S.pantry.radish = 3; S.pantry.soy = 2; S.potatoes = 4; G.tpLocal(0, 0, 0); G.tick(0.05, 3); });
  const hudFood = await page.evaluate(() => parseInt(document.querySelector('#mg-vitals .res .row:nth-child(3) .val').textContent, 10));
  await page.keyboard.press('c');
  await page.locator('.colony [data-tab="inv"]').click();
  const larder = await page.evaluate(() => {
    let sum = 0, head = '', n = 0;
    for (const row of document.getElementById('mg-inv').children) {
      if (row.classList.contains('pane-hd')) { if (head) break; head = row.textContent; continue; }
      if (row.classList.contains('inv-row')) { sum += parseInt(row.querySelector('.ct').textContent, 10); n++; }
    }
    return { head, sum, rows: n, packets: [...document.querySelectorAll('#mg-inv .inv-row .nm')].filter((x) => /seed packet/i.test(x.textContent) && !/^Seed packets/.test(x.textContent)).length };
  });
  check('colony: FOOD on the HUD is the sum of the inventory\'s food rows, and no food row counts seed packets', hudFood === larder.sum && new RegExp(`^Food\\s*${larder.sum} meals`).test(larder.head) && larder.rows >= 4 && larder.packets === 0, { hudFood, larder });
  await page.keyboard.press('Escape');
  await g.eval((G) => { const [p, n] = JSON.parse(window.__larder); G.S.pantry = p; G.S.potatoes = n; G.tick(0.05, 3); });

  // night: sleep leads the list and is said aloud; the account carries the new sol and explains itself; nothing more is taken on waking
  await page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 30000 }).catch(() => {});
  await g.eval((G) => { G.tpLocal(0, 30, 0); G.setLocalTime(21); G.tick(0.05, 2); });
  await sleep(450);
  await g.eval((G) => { G.tick(0.05, 2); });
  const told = await page.waitForFunction(() => /time to sleep/i.test((document.querySelector('#mg-toast') || {}).textContent || ''), null, { timeout: 15000 }).then(() => true).catch(() => false);
  const night = await where();
  check('night: sleeping leads the mission list, with a marker, and is said as night falls', /sleep until dawn/i.test(night.lead) && night.shown && told, { night, told });
  const sol0 = await g.eval((G) => { G.tpLocal(-5.0, -6.2); G.tick(0.05, 4); const s = G.S.sol; G.hold(1.4); return s; });
  await page.waitForSelector('#mg-panel .sleep .wake', { timeout: 30000 });
  const acct = await g.eval((G) => ({
    head: document.querySelector('#mg-panel .solbig').textContent,
    notes: [...document.querySelectorAll('#mg-panel .sleep .notes dt')].map((n) => `${n.textContent}: ${n.nextElementSibling.firstChild.textContent}`),
    why: (document.querySelector('#mg-panel .sleep .notes .more') || { textContent: '' }).textContent, whyHidden: !!(document.querySelector('#mg-panel .sleep .notes .more') || {}).hidden,
    tiles: [...document.querySelectorAll('#mg-panel .sleep .delta')].map((n) => n.textContent),
    sol: G.S.sol, food: G.farm.foodTotal(), days: G.farm.breakfastsLeft(), morale: G.S.morale,
  }));
  await page.evaluate(() => document.querySelector('#mg-panel .sleep-ft .why').click());
  const whyShown = await page.evaluate(() => !document.querySelector('#mg-panel .sleep .notes .more').hidden);
  // (rows with a name each; morale a score with no unit; food in meals, lasting as many sols as it gives breakfasts; and
  //  what morale's change is made of there for the asking, where it was a bracketed sum the length of the screen)
  check('night: the account is headed with the new sol, and says what breakfast took, how long the food lasts, and, asked, why morale moved',
    acct.sol === sol0 + 1 && new RegExp(`\\D${sol0 + 1}\\s*$`).test(acct.head) && acct.notes.some((n) => /^Breakfast: .+\(\d+ meals?, \d+ left\)/.test(n)) &&
    acct.notes.some((n) => new RegExp(`^Morale: ${Math.round(acct.morale)} of 100`).test(n)) && acct.notes.some((n) => new RegExp(`^Food: (Enough for ${acct.days} sols?\\b|\\d+ meals make ${acct.days} breakfasts?\\b)`).test(n)) &&
    /another sol alone.*a night in the bunk/i.test(acct.why) && acct.whyHidden && whyShown && acct.tiles.every((t) => !/morale.*%/i.test(t)) && acct.tiles.some((t) => /now \d+\smeals?/.test(t)), { acct, whyShown });
  await g.eval(() => document.querySelector('#mg-panel .sleep .wake').click());
  await sleep(300);
  const woke = await g.eval((G) => { G.tick(0.05, 900); return { sol: G.S.sol, food: G.farm.foodTotal(), morale: G.S.morale, lead: document.querySelector('#mg-objectives .obj:not(.done) .tx').textContent }; });
  check('night: nothing more is eaten or lost in the first minute awake', woke.sol === acct.sol && woke.food === acct.food && woke.morale >= acct.morale - 0.01 && !/sleep/i.test(woke.lead), { woke, acct });
  // (the HUD is there the moment the account closes: it used to fade back, and a slow frame showed the world with no HUD at all)
  const back = await page.evaluate(() => { const cs = getComputedStyle(document.getElementById('mg-hud')); return { vis: cs.visibility, op: +cs.opacity, bars: getComputedStyle(document.getElementById('mg-vitals')).visibility }; });
  check('night: on waking the HUD is back at once, not fading in', back.vis === 'visible' && back.op > 0.99 && back.bars === 'visible', back);
  errors += g.errors.length;
  if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 4)).slice(0, 800));
  await g.close();
}

// ---------------------------------------------------------------------------------- layout at every supported size
const SIZES = [
  { name: '1280x720', w: 1280, h: 720 }, { name: '1920x1080', w: 1920, h: 1080 }, { name: '2560x1440', w: 2560, h: 1440 }, { name: '1024x768', w: 1024, h: 768 },
  { name: 'phone 844x390', w: 844, h: 390, touch: true, safe: [0, 47, 21, 47] }, { name: 'phone 667x375', w: 667, h: 375, touch: true, safe: [0, 47, 21, 47] },
  { name: 'tablet 1024x768', w: 1024, h: 768, touch: true, safe: [24, 0, 20, 0] },
];
// (the waypoint's marker is one of them: its distance tag used to land on the rover's speed, the prompt and the mission list)
const HUD = ['#mg-vitals', '#mg-compass .strip', '#mg-region', '#mg-tr', '#mg-log', '#mg-prompt', '#mg-keys', '#mg-rover', '#mg-alerts', '#mg-toast .toast',
  '#mg-joy', '#mg-tE', '#mg-tJump', '#mg-tExit', '#mg-tSprint', '#mg-tCam', '#mg-tCandle', '#mg-trow', '#mg-way'];
const rects = (page) => page.evaluate((sels) => {
  const out = [];
  for (const sel of sels) {
    const n = document.querySelector(sel);
    if (!n) continue;
    const cs = getComputedStyle(n), r = n.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05 || r.width < 2 || r.height < 2) continue;
    out.push({ sel, l: r.left, t: r.top, r: r.right, b: r.bottom, round: parseFloat(cs.borderTopLeftRadius) >= Math.min(r.width, r.height) / 2 - 1 });
  }
  return out;
}, HUD);
function layoutProblems(list, size) {
  const [st, sr, sb, sl] = size.safe || [0, 0, 0, 0];
  const bad = [];
  for (const a of list) {
    if (a.l < sl - 0.5 || a.t < st - 0.5 || a.r > size.w - sr + 0.5 || a.b > size.h - sb + 0.5) bad.push(`${a.sel} is outside the safe area`);
    for (const b of list) {
      if (a.sel >= b.sel) continue;
      const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (ox <= 1 || oy <= 1) continue;
      if (a.round && b.round) {          // two round buttons: compare the circles, not their boxes
        const d = Math.hypot((a.l + a.r - b.l - b.r) / 2, (a.t + a.b - b.t - b.b) / 2);
        if (d >= (a.r - a.l + b.r - b.l) / 2) continue;
      }
      const box = (q) => `[${Math.round(q.l)},${Math.round(q.t)} ${Math.round(q.r)},${Math.round(q.b)}]`;
      bad.push(`${a.sel} ${box(a)} overlaps ${b.sel} ${box(b)}`);
    }
  }
  return bad;
}
for (const size of SIZES) {
  if (onlySize && !size.name.includes(onlySize)) continue;
  const g = await openGame({ width: size.w, height: size.h, touch: size.touch, quality: 'low', query: size.safe ? 'safe=' + size.safe.join(',') : '' });
  const page = g.page;
  const rem = await page.evaluate(() => parseFloat(document.documentElement.style.fontSize));
  check(`${size.name}: interface scale is sensible (root ${rem}px)`, rem >= 13 && rem <= 30, rem);
  // entry animations are switched off for these measurements: software rendering is slow enough here that one can still be mid-flight seconds later
  await page.evaluate(() => window.__UI.setSetting('reducedMotion', true));
  const phone = size.touch && size.h < 540;
  // (measured at rest: a mission line caught sliding in is 3 px outside its block for half a second)
  const audit = async () => {
    await page.waitForFunction(settledInPage, null, { timeout: 30000, polling: 100 }).catch(() => {});
    return auditLines(await page.evaluate(auditInPage, size.safe || [0, 0, 0, 0]));
  };
  if (phone) {
    // new game: every card whole inside the sheet, with a thumb-high Begin on screen (the smallest phone showed none)
    await page.locator('[data-act="new"]').tap();
    await sleep(250);
    const ng = await page.evaluate(([st, sr, sb, sl]) => {
      const body = document.querySelector('#mg-panel .sheet-bd').getBoundingClientRect();
      return [...document.querySelectorAll('#mg-panel .diff')].map((c) => {
        const r = c.getBoundingClientRect(), b = c.querySelector('.go').getBoundingClientRect();
        return { card: r.top >= body.top - 1 && r.bottom <= Math.min(body.bottom, innerHeight - sb) + 1 && r.left >= sl && r.right <= innerWidth - sr, begin: Math.round(b.height), beginIn: b.bottom <= r.bottom + 1 && b.bottom <= innerHeight - sb && b.top >= st };
      });
    }, size.safe);
    check(`${size.name}: new game, three whole cards, each with a Begin 44 px high on screen`, ng.length === 3 && ng.every((c) => c.card && c.beginIn && c.begin >= 44), ng);
    let bad0 = await audit();
    check(`${size.name}: new game, nothing under 11 px or 44 px, nothing cut`, bad0.length === 0, bad0);
    await page.locator('#mg-panel [data-act="back"]').first().tap();
    // settings: four tabs, each of which fits without scrolling; Sound and the colour-blind switch can be reached
    await page.locator('[data-act="settings"]').tap();
    const tabs = [];
    for (const t of ['graphics', 'controls', 'sound', 'interface']) {
      await page.locator(`[data-seg="settab"] [data-v="${t}"]`).tap();
      await sleep(120);
      tabs.push(await page.evaluate((tab) => {
        const bd = document.querySelector('#mg-panel .sheet-bd'), sec = document.querySelector(`#mg-panel .set-sec[data-sec="${tab}"]`);
        const vis = (n) => { const r = n.getBoundingClientRect(), b = bd.getBoundingClientRect(); return r.height > 1 && r.top >= b.top - 1 && r.bottom <= b.bottom + 1; };
        const top = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().top * 2) / 2;
        return { tab, shown: !!sec && !sec.hidden && [...document.querySelectorAll('#mg-panel .set-sec')].filter((s) => !s.hidden).length === 1, fits: bd.scrollHeight <= bd.clientHeight + 2,
          rows: [...sec.querySelectorAll('.set-row')].every(vis), sliders: sec.querySelectorAll('input[type="range"]').length, cb: !!sec.querySelector('[data-switch="colorBlind"]'),
          strip: top('#mg-panel [data-seg="settab"]'), done: top('#mg-panel [data-act="back"]'), sheet: top('#mg-panel .sheet'),
          gap: Math.round(document.querySelector('#mg-panel [data-seg="settab"]').getBoundingClientRect().left - document.querySelector('#mg-panel .sheet-hd h1').getBoundingClientRect().right) };
      }, t));
      bad0 = bad0.concat(await audit());
    }
    check(`${size.name}: settings, four tabs that each fit the screen; Sound has its four sliders and Interface the colour-blind switch`,
      tabs.every((t) => t.shown && t.fits && t.rows) && tabs[2].sliders === 4 && tabs[3].cb, tabs);
    // (the sheet was centred on its rows: the strip stood at 97, 85, 40 and 55 px on the four tabs, and Done moved with it)
    check(`${size.name}: settings, the tab strip and Done stand in the same place on all four tabs, and the title 16 px from the tabs`,
      tabs.every((t) => t.strip === tabs[0].strip && t.done === tabs[0].done && t.sheet === tabs[0].sheet && t.gap >= 16), tabs.map((t) => [t.tab, t.sheet, t.strip, t.done, t.gap]));
    await page.locator('[data-switch="colorBlind"]').locator('xpath=ancestor::div[contains(@class,"set-row")]').tap({ position: { x: 20, y: 12 } });
    const cbOn = await page.evaluate(() => document.getElementById('mg-root').classList.contains('mg-cb'));
    await page.locator('[data-switch="colorBlind"]').tap();
    const cbOff = await page.evaluate(() => !document.getElementById('mg-root').classList.contains('mg-cb'));
    check(`${size.name}: settings, a switch is worked by its whole row`, cbOn && cbOff, { cbOn, cbOff });
    check(`${size.name}: settings, nothing under 11 px or 44 px, nothing cut`, bad0.length === 0, bad0);
    await page.locator('[data-seg="settab"] [data-v="graphics"]').tap();
    await page.locator('#mg-panel [data-act="back"]').tap();
  }
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 20); });
  await page.evaluate(() => { window.__UI.log('Suit holed: 46 on the gauge and falling. The Hab is that way. RUN.', 'suit'); });
  await sleep(700);
  let bad = layoutProblems(await rects(page), size);
  check(`${size.name}: first minute, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
  if (phone) {
    // every task's title stands on one line of the list, as the first line (they all ran to two: the title shared its row with the distance)
    const titles = await page.evaluate(() => {
      const row = document.querySelector('#mg-objectives .obj.first, #mg-objectives .obj.primary');
      if (!row) return [{ t: 'no first line on the list' }];
      const tx = row.querySelector('.tx'), keep = [row.className, tx.innerHTML], out = [];
      for (const o of window.__UI.objectives) {
        row.className = o.urgent ? 'obj urgent first' : 'obj primary';
        tx.textContent = o.text().replace(/\d+ of (\d+)\)$/, '$1 of $1)');
        const lines = new Set([...(() => { const r = document.createRange(); r.selectNodeContents(tx); return r.getClientRects(); })()].map((b) => Math.round(b.top))).size;
        if (lines !== 1) out.push({ t: tx.textContent, lines });
      }
      row.className = keep[0]; tx.innerHTML = keep[1];
      return out;
    });
    check(`${size.name}: every task title stands on one line of the list`, titles.length === 0, titles);
  }
  // a busy moment on foot: every gauge, two alerts, log lines, a toast, a prompt, a candle to hand
  const busy = async () => {
    await page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 120000 });      // an earlier toast has gone
    await g.eval((G) => {
      G.skipIntro(); G.S.flags.uiBars = true; G.S.inv.candle = 2; G.S.flags.pfRevealed = true; G.S.quests = { viking1: 'active', spirit: 'active' };      // (uiBars: a run with every bar met)
      G.tpNear(G.World.rover.group.position, 3.2); G.setStorm(0.9); G.S.suit = 9; G.tick(0.05, 6);
    });
    await page.evaluate(() => { const U = window.__UI; U.log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.'); U.log('Hab battery low. Life support idles at zero. Wipe the panels.', 'sys'); U.log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa');
      U.toast('SITE DISCOVERED', 'VIKING 1', 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.'); });
    await sleep(1500);
    await g.eval((G) => { G.tick(0.05, 2); });
    return layoutProblems(await rects(page), size);
  };
  const driving = async () => {
    await g.eval((G) => { G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 40); G.input.keys['w'] = false; G.tick(0.05, 80); });
    await sleep(300);
    return layoutProblems(await rects(page), size);
  };
  const crowded = async () => {
    await page.waitForFunction(() => !document.querySelector('#mg-toast .toast'), null, { timeout: 60000 }).catch(() => {});      // (a toast hides a phone's log: wait it out)
    await page.evaluate(() => {
      const U = window.__UI, long = 'A long entry for the log of the kind NASA sends when it has a great deal to say about the dust and the panels and the potatoes and the weather over the colony and the state of the rover and a good deal else besides this sol';
      U.log(long); U.log(long, 'sys'); U.log(long, 'nasa');
      const lead = U.missionList().find((e) => !e.done);
      window.__lead = { o: lead.o, text: lead.o.text, why: lead.o.why };
      lead.o.text = () => 'A first mission line long enough to run to three lines on the narrow list of a small phone (0/3)';
      lead.o.why = 'And a reason for it that is every bit as long, so that the two together are far taller than the room there is for them.';
    });
    await sleep(900);
    await g.eval((G) => { G.tick(0.05, 2); });
    const out = layoutProblems(await rects(page), size);
    await page.evaluate(() => { const l = window.__lead; l.o.text = l.text; l.o.why = l.why; });
    await sleep(450);
    await g.eval((G) => { G.tick(0.05, 2); });
    return out;
  };
  bad = await busy();
  check(`${size.name}: on foot with alerts, log, toast and prompt, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
  // what the marker says is what the mission line says; on a phone both banners keep their instruction and the line its reason
  const hudNow = () => page.evaluate(() => {
    const on = (n) => !!n && getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 3;
    const way = document.getElementById('mg-way'), why = [...document.querySelectorAll('#mg-objectives .obj .why')].find(on);
    return {
      way: on(way), tag: way ? way.querySelector('b').textContent : '', line: (document.querySelector('#mg-objectives .obj:not(.done) .ds') || {}).textContent || '',
      notes: [...document.querySelectorAll('#mg-alerts .alert small')].map((n) => ({ t: n.textContent, on: on(n) })), why: why ? why.textContent : '',
    };
  });
  let hn = await hudNow();
  // (an arrowhead at the edge of the screen carries no number: the line has it)
  check(`${size.name}: on foot, the marker's distance is the mission line's`, !hn.way || hn.tag === '' || hn.tag === hn.line, hn);
  if (phone) {
    // the card stands 8 px under the bars and 8 px over the stick (it came to rest 3 px from the stick: it was measured while it was still sliding in)
    // (a warning: with his life in the balance, as here, nothing else is said)
    await page.evaluate(() => window.__UI.toast('WARNING', 'Storm cell overhead', 'Visibility is down to a few metres. Keep the Hab in sight. The panels will make next to nothing until it has passed.'));
    await sleep(600);
    await g.eval((G) => { G.tick(0.05, 2); });
    // (at rest: until this machine has drawn a frame the card is still where its slide begins, 8 px up)
    await page.waitForFunction(settledInPage, null, { timeout: 30000, polling: 100 }).catch(() => {});
    const withCard = layoutProblems(await rects(page), size);
    check(`${size.name}: with a card up as well, still nothing overlaps`, withCard.length === 0, withCard);
    const gaps = await page.evaluate(() => {
      const r = (sel) => { const n = document.querySelector(sel); return n ? n.getBoundingClientRect() : null; };
      const v = r('#mg-vitals'), t = r('#mg-toast .toast'), j = r('#mg-joy');
      return t ? { under: Math.round((t.top - v.bottom) * 10) / 10, over: Math.round((j.top - t.bottom) * 10) / 10, note: (document.querySelector('#mg-toast .t3') || { textContent: '' }).textContent } : null;
    });
    check(`${size.name}: a card stands 8 px under the bars and at least 8 px over the stick, and its note ends with a sentence`, !!gaps && gaps.under >= 7.5 && gaps.under <= 9 && gaps.over >= 7.5 && (!gaps.note || /[.!?]$/.test(gaps.note)), gaps);
    check(`${size.name}: both banners keep their instruction, and the first mission line its reason`, hn.notes.length === 2 && hn.notes.every((n) => n.on && n.t.length > 5) && hn.why.length > 8, hn);
    const a = await audit();
    check(`${size.name}: the busy HUD has nothing under 11 px or 44 px, and nothing cut`, a.length === 0, a);
    // every prompt is a line, and at most one line under it (three-line prompts stood over the stick at 667 wide)
    const prompts = await g.eval((G) => {
      const S = G.S, U = window.__UI, seen = new Map();
      const ask = () => {
        for (const it of G.interactables) {
          let label = '', sub = '', en = true;
          try { if (it.visible && !it.visible()) continue; if (!it.pos()) continue; label = it.label(); sub = it.sub ? it.sub() : ''; en = it.enabled ? it.enabled() : true; } catch (e) { continue; }
          if (label) seen.set(label + '|' + sub, { label, sub, minor: it.priority >= 9 });
          if (typeof en === 'string' && en.charCodeAt(0) !== 0x200b) seen.set('no|' + en, { label, sub, disabled: en });
        }
      };
      const keep = JSON.stringify({ inv: S.inv, water: S.water, breach: S.breach, suit: S.suit, storm: S.storm.hold === undefined ? null : S.storm.hold, piles: G.World.soilPiles.map((h) => h.left), plots: G.World.plots.map((q) => [q.state, q.growth, q.watered, q.crop]) });
      S.suit = 100; G.setStorm(0); S.storm.i = 0;
      const pl = G.World.plots[0];
      G.tpLocal(-6.7, -3.2); G.tick(0.05, 2);
      S.inv.regolith = 0; pl.state = 'empty'; ask(); S.inv.regolith = 2; ask();
      pl.state = 'soil'; ask(); S.water = 2; ask(); S.water = 60;
      pl.state = 'growing'; pl.crop = 'potato'; pl.growth = 0.45; pl.watered = 1; ask(); pl.state = 'ready'; ask(); pl.state = 'dead'; ask();
      G.tpLocal(4.2, 2.6); G.tick(0.05, 2); ask(); S.flags.hydrazineBoom = !S.flags.hydrazineBoom; ask(); S.flags.hydrazineBoom = !S.flags.hydrazineBoom;
      G.tpLocal(-5.0, -6.2); G.tick(0.05, 2); S.breach.active = true; ask(); S.breach.active = false;
      G.tpLocal(4.2, 4.8); G.tick(0.05, 2); ask();
      G.tpNear(G.World.soilPiles[0].group.position, 1.2); G.tick(0.05, 2); ask();
      for (const h of G.World.soilPiles) h.left = 0;
      pl.state = 'empty'; S.inv.regolith = 0; G.tpLocal(0, 60, 0); G.tick(0.05, 2); ask();
      G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 2); ask();
      const k = JSON.parse(keep);
      G.World.soilPiles.forEach((h, i) => { h.left = k.piles[i]; }); G.World.plots.forEach((q, i) => { [q.state, q.growth, q.watered, q.crop] = k.plots[i]; });
      Object.assign(S.inv, k.inv); S.water = k.water; Object.assign(S.breach, k.breach); S.suit = k.suit; G.setStorm(k.storm); G.syncAllVisuals();
      const p = document.getElementById('mg-prompt'), lb = p.querySelector('.lb'), sb = p.querySelector('.sub'), out = [];
      // (lines are counted by where their boxes stand, a line apart: the 2 of "O2" hangs a few pixels under its line and is not another)
      const lines = (n) => { const r = document.createRange(); r.selectNodeContents(n); const tops = [...r.getClientRects()].filter((b) => b.width > 1).map((b) => b.top).sort((a, b) => a - b); let k = 0, last = -99; for (const t of tops) { if (t - last > 8) k++; last = t; } return k; };
      for (const v of seen.values()) {
        U.setPrompt(null); U.setPrompt(v);
        const a = lines(lb), b = sb.style.display === 'none' ? 0 : lines(sb), text = p.querySelector('.pt').getBoundingClientRect(), box = p.getBoundingClientRect();
        const slack = Math.round(box.right - text.right);
        if (a !== 1 || b > 1 || slack > 24) out.push({ says: lb.textContent, sub: sb.textContent, lines: [a, b], slack });
      }
      U.setPrompt(null); G.tick(0.05, 3);
      return { n: seen.size, out };
    });
    check(`${size.name}: every prompt is one line and at most one line under it, in a pill no wider than its words`, prompts.n >= 14 && prompts.out.length === 0, prompts);
  }
  bad = await crowded();
  check(`${size.name}: on foot with a long mission line, still nothing overlaps`, bad.length === 0, bad);
  bad = await driving();
  check(`${size.name}: in the rover, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
  hn = await hudNow();
  check(`${size.name}: in the rover, the marker's distance is the mission line's`, !hn.way || hn.tag === '' || hn.tag === hn.line, hn);
  // More text than usual: three long log entries, and a first mission line and a reason that would each run to three
  // lines on a phone. The log must still end short of the rover's panel (and of the stick), and the mission block
  // above the buttons under it. (Both failed with the content a long day produces, while passing with a quiet one.)
  bad = await crowded();
  check(`${size.name}: in the rover with a long log and a long mission line, still nothing overlaps`, bad.length === 0, bad);
  if (size.touch) {
    await page.locator('#mg-tPause').tap();
    const s = await g.eval((G) => ({ ui: G.S.uiOpen, kind: document.getElementById('mg-overlay').className }));
    check(`${size.name}: the touch pause button opens the pause menu`, s.ui && /k-pause/.test(s.kind), s);
    const inside = await page.evaluate(([st, sr, sb, sl]) => {
      const out = [];
      for (const n of document.querySelectorAll('#mg-panel .menu-item, #mg-panel .pause-side')) { const r = n.getBoundingClientRect(); if (r.left < sl || r.right > innerWidth - sr || r.bottom > innerHeight - sb || r.top < st) out.push(n.className); }
      return out;
    }, size.safe);
    check(`${size.name}: the pause menu stays inside the safe area`, inside.length === 0, inside);
    await page.locator('[data-act="resume"]').tap();
    await g.eval((G) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 3); });
    await page.locator('#mg-trow [data-t="map"]').tap();
    check(`${size.name}: the touch map button opens the map`, await page.evaluate(() => document.getElementById('mg-map').style.display === 'block'));
    const hd = await page.evaluate(([st, sr, sb, sl]) => { const r = document.querySelector('#mg-map .close').getBoundingClientRect(); return r.right <= innerWidth - sr && r.top >= st && r.width >= 40 && r.height >= 40; }, size.safe);
    check(`${size.name}: the screen's close button is inside the safe area and thumb-sized`, hd);
    await page.locator('#mg-map .close').tap();
    // a phone's gauges: a band that can be read at arm's length (they were lines 34 px long and 3 px tall)
    if (size.w < 900) {
      const gz = await page.evaluate(() => [...document.querySelectorAll('#mg-vitals .res .row')].map((r) => {
        const t = r.querySelector('.tk').getBoundingClientRect(), v = r.querySelector('.val'), l = r.querySelector('.lb');
        return { w: Math.round(t.width), h: Math.round(t.height), num: parseFloat(getComputedStyle(v).fontSize), name: parseFloat(getComputedStyle(l).fontSize), f: getComputedStyle(r).getPropertyValue('--f') };
      }));
      check(`${size.name}: each gauge is a band at least 60 px long and 6 px tall, its number at 13 px or more`, gz.length === 6 && gz.every((z) => z.w >= 60 && z.h >= 6 && z.num >= 12.95 && z.name >= 12.95 && z.f !== ''), gz);
      // the task card: its reason is news, and is put away once read; a press on the card brings it back
      const card = await g.eval((G) => {
        const o = document.getElementById('mg-objectives'), why = () => [...o.querySelectorAll('.obj .why')].some((n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 3);
        G.tpLocal(0, 40, 0); G.tick(0.05, 30);
        const out = { open: why(), h0: Math.round(o.getBoundingClientRect().height) };
        G.tick(0.05, 220);
        out.shut = !why(); out.mark = o.classList.contains('shut'); out.h1 = Math.round(o.getBoundingClientRect().height);
        // (closed, its title is still one line: the mark that it opens once took a rem of the title's own line)
        { const r = document.createRange(); r.selectNodeContents(o.querySelector('.obj.primary .tx, .obj.first .tx')); out.titleLines = new Set([...r.getClientRects()].map((b) => Math.round(b.top))).size; }
        out.lead = !!o.querySelector('.obj.primary .tx, .obj.first .tx') && !!o.querySelector('.obj .pl').textContent;
        o.click(); G.tick(0.05, 2);
        out.again = why();
        return out;
      });
      check(`${size.name}: the task card closes to its title and its place once its reason has been read, and a press opens it again`, card.shut && card.mark && card.lead && card.titleLines === 1 && card.h1 < card.h0 && card.h1 >= 44 && card.again, card);
    }
    // the action button carries the verb for what is in reach, and holding it works the interaction
    await g.eval((G) => { G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 3); });
    const verb = await page.locator('#mg-tE .vb').innerText();
    check(`${size.name}: the action button shows the verb`, /drive/i.test(verb), verb);
    await page.waitForFunction(() => !document.getElementById('mg-root').classList.contains('is-modal'), null, { timeout: 120000 });
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1 })) });
    const eb = await page.locator('#mg-tE').boundingBox();
    await touch('touchStart', [[eb.x + eb.width / 2, eb.y + eb.height / 2]]);
    const held = await g.eval((G) => { const h = G.input.eHeld; G.tick(0.05, 6); return { h, pct: document.querySelector('#mg-tE').classList.contains('holding') }; });
    await g.eval((G) => { G.tick(0.05, 10); });
    await touch('touchEnd', []);
    const drove = await g.eval((G) => ({ mode: G.S.mode, held: G.input.eHeld }));
    check(`${size.name}: holding the action button fills it and does the thing`, held.h && held.pct && drove.mode === 'rover' && !drove.held, { held, drove });
    await page.locator('#mg-tExit').tap();
    await g.eval((G) => { G.tick(0.05, 3); });
    check(`${size.name}: the EXIT button leaves the rover`, await g.eval((G) => G.S.mode === 'walk'));
    // the stick appears under the thumb and steers; a second finger looks around
    const jx = size.safe[3] + 150, jy = size.h - size.safe[2] - 110;
    await touch('touchStart', [[jx, jy]]);
    await touch('touchMove', [[jx, jy - 60]]);
    const stick = await page.evaluate(() => { const r = document.getElementById('mg-joy').getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, live: document.getElementById('mg-joy').classList.contains('live') }; });
    const p0 = await g.eval((G) => { const a = G.player.pos.clone(); G.tick(0.05, 10); return { joy: G.input.touch.joyY, moved: G.player.pos.distanceTo(a) }; });
    check(`${size.name}: the stick appears under the thumb and moves the astronaut`, stick.live && Math.abs(stick.cx - jx) < 3 && Math.abs(stick.cy - jy) < 3 && p0.joy < -0.9 && p0.moved > 1, { stick, p0, jx, jy });
    await touch('touchMove', [[jx, jy - 60], [size.w / 2 + 40, size.h / 2]]).catch(() => {});
    await touch('touchEnd', []);
    const rest = await g.eval((G) => ({ joy: G.input.touch.joyY, id: G.input.touch.joyId }));
    check(`${size.name}: letting go centres the stick`, rest.joy === 0 && rest.id === null, rest);
    // pinch on the map zooms it
    await page.locator('#mg-trow [data-t="map"]').tap();
    const sc0 = await page.locator('.map-scale span').innerText();
    const mb = await page.locator('#mg-mapcanvas').boundingBox();
    const mx = mb.x + mb.width / 2, my = mb.y + mb.height / 2;
    await page.evaluate(([x, y]) => {
      const c = document.getElementById('mg-mapcanvas');
      const fire = (type, id, px, py) => c.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: px, clientY: py, bubbles: true }));
      fire('pointerdown', 11, x - 30, y); fire('pointerdown', 12, x + 30, y);
      for (let d = 30; d <= 150; d += 20) { fire('pointermove', 11, x - d, y); fire('pointermove', 12, x + d, y); }
      fire('pointerup', 11, x - 150, y); fire('pointerup', 12, x + 150, y);
    }, [mx, my]);
    await page.waitForFunction((was) => document.querySelector('.map-scale span').innerText !== was, sc0, { timeout: 8000 }).catch(() => {});
    const sc1 = await page.locator('.map-scale span').innerText();
    check(`${size.name}: pinching the map zooms it`, sc0 !== sc1, { sc0, sc1 });
    let shown = await audit();
    // every journal tab on the screen (the smallest phone cut the fifth and hid the sixth), each a thumb high
    await page.locator('#mg-map .scr-nav [data-screen="journal"]').tap();
    const jt = await page.evaluate(([, sr, , sl]) => [...document.querySelectorAll('#mg-journal .tabs button')].map((b) => {
      const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), in: r.left >= sl - 0.5 && r.right <= innerWidth - sr + 0.5, w: Math.round(r.width), h: Math.round(r.height) };
    }), size.safe);
    check(`${size.name}: all six journal tabs are on the screen, each thumb-sized`, jt.length === 6 && jt.every((t) => t.in && t.w >= 44 && t.h >= 44), jt);
    shown = shown.concat(await audit());
    check(`${size.name}: the map and the journal have nothing under 11 px or 44 px, and nothing cut`, shown.length === 0, shown);
    await page.locator('#mg-journal .close').tap();
  }
  // the largest interface size the player can ask for is held to what this window has room for
  await g.eval((G) => { if (G.S.mode === 'rover') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' })); G.tick(0.05, 3); } });
  const cap = await page.evaluate(() => { window.__UI.setSetting('hudScale', 1.4); return { scale: window.__UI.layout.scale, max: window.__UI.layout.maxScale }; });
  const badBusy = await busy(), badDrive = await driving(), badCrowd = await crowded();
  check(`${size.name}: at the largest interface size (${Math.round(cap.scale * 100)}% here), still nothing overlaps, with a long log and a long mission line too`, cap.scale <= cap.max && badBusy.length === 0 && badDrive.length === 0 && badCrowd.length === 0, { cap, badBusy, badDrive, badCrowd });
  errors += g.errors.length;
  if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 4)).slice(0, 800));
  await g.close();
}

// ---------------------------------------------------------------------------------- portrait phones are asked to rotate
if (!onlySize || onlySize === 'portrait') {
  const g = await openGame({ width: 390, height: 844, touch: true, quality: 'low', query: 'safe=47,0,34,0' });
  const vis = await g.page.evaluate(() => getComputedStyle(document.getElementById('mg-rotate')).display !== 'none');
  check('portrait phone: the rotate notice is shown', vis);
  // turned sideways the game plays; turned upright again mid-game it pauses behind the notice
  await g.page.setViewportSize({ width: 844, height: 390 });
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.skipIntro(); });
  await sleep(400);
  const land = await g.page.evaluate(() => ({ rot: getComputedStyle(document.getElementById('mg-rotate')).display, ui: window.__MG.S.uiOpen }));
  await g.page.setViewportSize({ width: 390, height: 844 });
  // (the pause follows the turn by a frame or two; on a loaded machine a frame can take a second, and a fixed wait
  // of 0.6 s read the state before the game had seen the turn)
  let up = null;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    up = await g.page.evaluate(() => ({ rot: getComputedStyle(document.getElementById('mg-rotate')).display, ui: window.__MG.S.uiOpen, kind: document.getElementById('mg-overlay').className }));
    if (up.ui && /k-pause/.test(up.kind)) break;
  }
  check('portrait phone: turning upright mid-game pauses it', land.rot === 'none' && !land.ui && up.rot !== 'none' && up.ui && /k-pause/.test(up.kind), { land, up });
  errors += g.errors.length;
  await g.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed; console errors: ${errors}`);
process.exit(failed.length || errors ? 1 : 0);
