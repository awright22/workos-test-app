// Interface test: menus work from the keyboard, settings persist and apply, the screens open
// and close, the map zooms and identifies markers, the touch controls work, and at every
// supported size nothing in the HUD overlaps anything else or strays outside the safe area.
import { openGame, sleep } from './lib.mjs';

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail !== undefined && !ok ? '  ' + JSON.stringify(detail) : '')); };
let errors = 0;

// ---------------------------------------------------------------------------------- keyboard and settings (desktop)
{
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
  await page.waitForFunction(() => window.__MG.S.started, null, { timeout: 30000 });
  let s = await g.eval((G) => ({ diff: G.S.diff, ui: G.S.uiOpen, hud: getComputedStyle(document.getElementById('mg-hud')).visibility }));
  check('new game: Enter starts the run and shows the HUD', s.diff === 'survival' && !s.ui && s.hud === 'visible', s);
  await g.eval(async (G) => { await G.settle(); G.paused = true; G.skipIntro(); G.tpLocal(0, 30, 0); G.tick(0.05, 4); });
  // pause
  await key('Escape');
  s = await g.eval((G) => ({ ui: G.S.uiOpen, kind: document.getElementById('mg-overlay').className, saved: !!localStorage.getItem('stranded2-save') }));
  check('pause: Escape pauses and saves', s.ui && /k-pause/.test(s.kind) && s.saved, s);
  await key('ArrowDown'); await key('ArrowDown'); await key('Enter');
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
  await sleep(300);
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
  await key('Escape');
  errors += g.errors.length;
  if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 4)).slice(0, 800));
  await g.close();
}

// ---------------------------------------------------------------------------------- layout at every supported size
const SIZES = [
  { name: '1280x720', w: 1280, h: 720 }, { name: '1920x1080', w: 1920, h: 1080 }, { name: '2560x1440', w: 2560, h: 1440 }, { name: '1024x768', w: 1024, h: 768 },
  { name: 'phone 844x390', w: 844, h: 390, touch: true, safe: [0, 47, 21, 47] }, { name: 'phone 667x375', w: 667, h: 375, touch: true, safe: [0, 47, 21, 47] },
];
const HUD = ['#mg-vitals', '#mg-compass .strip', '#mg-region', '#mg-tr', '#mg-log', '#mg-prompt', '#mg-keys', '#mg-rover', '#mg-alerts', '#mg-toast .toast',
  '#mg-joy', '#mg-tE', '#mg-tJump', '#mg-tExit', '#mg-tSprint', '#mg-tCam', '#mg-tCandle', '#mg-trow'];
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
      bad.push(`${a.sel} overlaps ${b.sel}`);
    }
  }
  return bad;
}
for (const size of SIZES) {
  const g = await openGame({ width: size.w, height: size.h, touch: size.touch, quality: 'low', query: size.safe ? 'safe=' + size.safe.join(',') : '' });
  const page = g.page;
  const rem = await page.evaluate(() => parseFloat(document.documentElement.style.fontSize));
  check(`${size.name}: interface scale is sensible (root ${rem}px)`, rem >= 13 && rem <= 30, rem);
  await g.eval(async (G) => { await G.start(2.0, 303.7); G.paused = true; G.tick(0.05, 20); });
  await page.evaluate(() => { window.__UI.log('Suit O2 at 46% and leaking. The Hab is that way. RUN.', 'sys'); });
  await sleep(700);
  let bad = layoutProblems(await rects(page), size);
  check(`${size.name}: first minute, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
  // a busy moment on foot: every gauge, two alerts, log lines, a prompt, a candle to hand
  await g.eval((G) => {
    G.skipIntro(); G.S.inv.candle = 2; G.S.flags.pfRevealed = true; G.S.quests = { viking1: 'active', spirit: 'active' };
    G.tpNear(G.World.rover.group.position, 3.2); G.setStorm(0.9); G.S.suit = 9; G.tick(0.05, 6);
  });
  await page.evaluate(() => { const U = window.__UI; U.log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.'); U.log('Hab battery low. Life support idles at zero. Wipe the panels.', 'sys'); U.log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa');
    U.toast('SITE DISCOVERED', 'VIKING 1', 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.'); });
  await sleep(1300);
  await g.eval((G) => { G.tick(0.05, 2); });
  bad = layoutProblems(await rects(page), size);
  check(`${size.name}: on foot with alerts, log and prompt, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
  // driving
  await g.eval((G) => { G.setStorm(0); G.S.storm.i = 0; G.S.suit = 100; G.hold(0.8); G.input.keys['w'] = true; G.tick(0.05, 40); G.input.keys['w'] = false; G.tick(0.05, 80); });
  await sleep(300);
  bad = layoutProblems(await rects(page), size);
  check(`${size.name}: in the rover, nothing overlaps or leaves the safe area`, bad.length === 0, bad);
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
    // the action button carries the verb for what is in reach
    await g.eval((G) => { G.tpNear(G.World.rover.group.position, 3.2); G.tick(0.05, 3); });
    const verb = await page.locator('#mg-tE .vb').innerText();
    check(`${size.name}: the action button shows the verb`, /drive/i.test(verb), verb);
  }
  errors += g.errors.length;
  if (g.errors.length) console.log(JSON.stringify(g.errors.slice(0, 4)).slice(0, 800));
  await g.close();
}

// ---------------------------------------------------------------------------------- portrait phones are asked to rotate
{
  const g = await openGame({ width: 390, height: 844, touch: true, quality: 'low', query: 'safe=47,0,34,0' });
  const vis = await g.page.evaluate(() => getComputedStyle(document.getElementById('mg-rotate')).display !== 'none');
  check('portrait phone: the rotate notice is shown', vis);
  errors += g.errors.length;
  await g.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed; console errors: ${errors}`);
process.exit(failed.length || errors ? 1 : 0);
