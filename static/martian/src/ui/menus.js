// Menus and dialogs: loading, title, new game, pause, settings, controls, credits, the sleep
// summary and the NASA uplink terminal. Pure presentation: the game passes in what to show and
// what to do (see game/flow.js, game/sim.js, game/story.js). Death, rescue and other plain
// dialogs go through showOverlay in ui/dom.js.
import { UI, openOverlay, hideOverlay, showOverlay, esc, log, toast } from './dom.js';
import { icon } from './icons.js';
import { settings, setSetting, resetSettings, savedQuality, saveQuality, reducedMotion, onSettingsChange } from './settings.js';
import { layout } from './layout.js';
import { DIFFICULTIES } from '../game/state.js';
import { ctx } from '../game/ctx.js';
import { Snd } from '../audio/sound.js';
import { setAudioVolume, getAudioVolumes } from '../audio/settings.js';
const busVolume = (bus) => { try { const v = getAudioVolumes()[bus]; return typeof v === 'number' ? Math.max(0, Math.min(1, v)) : 1; } catch (e) { return 1; } };

/** Hooks the game fills in: save() writes the saved game before a reload. */
export const menuHooks = { save: null };

const WORDMARK = '<h1 class="mg-wordmark" aria-label="Stranded 2">STRANDED<em>II</em></h1>';
const on = (scope, sel, fn) => scope.querySelectorAll(sel).forEach((n) => n.addEventListener('click', (ev) => { ev.stopPropagation(); fn(n, ev); Snd.click(); }));

/** Master volume: the interface's setting is the one master level. (This once passed the level where the
 *  sound module expects a bus name, so the slider did nothing.) */
export function applyAudioSettings() {
  try { Snd.setVolume('master', settings.volume); } catch (e) { /* no audio */ }
}
onSettingsChange(applyAudioSettings);
applyAudioSettings();

// ------------------------------------------------------------------------------------------
// Loading
// ------------------------------------------------------------------------------------------
const TIPS = [
  'The rover refills your suit; the Hab refills the rover; the sun refills the Hab. Keep the chain alive.',
  'One verb for everything: hold to interact.',
  'Dust settles on the solar panels. Wipe them down, or the Hab goes hungry for power.',
  'Every lander humanity ever sent is out there, exactly where history left it.',
];
let ld = null;
export function showLoading(fraction, label) {
  if (!ld || !UI.panel.contains(ld.bar)) {
    const p = openOverlay('loading',
      `<div class="loading">${WORDMARK.replace('h1', 'div').replace('/h1', '/div')}` +
      '<div class="ld-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div>' +
      '<div class="ld-row"><span class="ld-label"></span><span class="ld-pct t-num"></span></div>' +
      `<p class="ld-tip">${esc(TIPS[Math.floor(Math.random() * TIPS.length)])}</p></div>`,
      { label: 'Loading Stranded II' });
    ld = { bar: p.querySelector('.ld-bar i'), track: p.querySelector('.ld-bar'), label: p.querySelector('.ld-label'), pct: p.querySelector('.ld-pct') };
  }
  const f = Math.min(1, Math.max(0, fraction || 0));
  ld.bar.style.transform = `scaleX(${f.toFixed(3)})`;
  ld.track.setAttribute('aria-valuenow', Math.round(f * 100));
  ld.label.textContent = label || 'Loading';
  ld.pct.textContent = Math.round(f * 100) + '%';
}

// ------------------------------------------------------------------------------------------
// Title
// ------------------------------------------------------------------------------------------
function menuItem(act, label, sub, cls) {
  return `<button type="button" class="menu-item${cls ? ' ' + cls : ''}" data-act="${act}"><span class="mi-l">${label}</span>${sub ? `<span class="mi-s">${esc(sub)}</span>` : ''}</button>`;
}
let titleSeen = false;
/**
 * o: { saved: null | { sol, diffName, region }, unreadable: bool, onContinue(), onNewGame(diffKey) }
 */
export function showTitle(o) {
  const again = () => showTitle(o);
  const items =
    (o.saved ? menuItem('continue', 'Continue', `Sol ${o.saved.sol} · ${o.saved.diffName}${o.saved.region ? ' · ' + o.saved.region : ''}`, 'first') : '') +
    menuItem('new', 'New Game', o.saved ? 'A new random crash site' : 'Somewhere on Mars', o.saved ? '' : 'first') +
    menuItem('settings', 'Settings') + menuItem('credits', 'Credits');
  const p = openOverlay('title',
    `<div class="menu-col">${WORDMARK}<p class="tag">The whole planet. All of it. Against you.</p><nav class="menu" aria-label="Main menu">${items}</nav>` +
    (o.unreadable ? '<p class="menu-note" role="alert">A saved game was found, but it is from a version this build cannot read, so it cannot be continued.</p>' : '') +
    '</div>' +
    `<div class="title-foot"><span>${layout.touch ? 'Best in landscape, with sound' : 'Arrow keys to choose · Enter to select'}</span><span>Real Mars terrain · NASA MOLA</span></div>`,
    { label: 'Stranded II, main menu' });
  UI.overlay.classList.toggle('first', !titleSeen);
  titleSeen = true;
  on(p, '[data-act]', (b) => {
    const a = b.dataset.act;
    if (a === 'continue') { hideOverlay(); o.onContinue(); }
    else if (a === 'new') showNewGame(o, again);
    else if (a === 'settings') showSettings(again, true);
    else if (a === 'credits') showCredits(again, true);
  });
}

// ------------------------------------------------------------------------------------------
// New game: three difficulty cards
// ------------------------------------------------------------------------------------------
const DIFF_ORDER = ['story', 'survival', 'iron'];
const DIFF_TAG = { story: 'Gentle', survival: 'Recommended', iron: 'One life' };
export function showNewGame(o, back) {
  const cards = DIFF_ORDER.map((k, i) => {
    const d = DIFFICULTIES[k];
    const pips = [0, 1, 2].map((n) => `<i${n <= i ? ' class="on"' : ''}></i>`).join('');
    return `<button type="button" class="diff${k === 'survival' ? ' rec' : k === 'iron' ? ' hard' : ''}" data-diff="${k}"${k === 'survival' ? ' data-autofocus' : ''}>` +
      `<div class="dx"><span>0${i + 1}</span><em>${DIFF_TAG[k]}</em></div><div class="dn">${d.name}</div><div class="dp" aria-hidden="true">${pips}</div>` +
      `<dl><dt>Rescue</dt><dd>Sol ${d.rescueSol}</dd><dt>Supplies</dt><dd>${d.drain < 0.995 ? `Last ${Math.round((1 / d.drain - 1) * 100)}% longer` : d.drain > 1.005 ? `Go ${Math.round((1 - 1 / d.drain) * 100)}% sooner` : 'As rated'}</dd><dt>If you die</dt><dd>${k === 'iron' ? 'Save deleted' : 'Wake at dawn'}</dd></dl>` +
      `<p>${esc(d.desc.replace(/^Rescue: Sol \d+\.\s*/, '').replace(/\n/g, ' '))}</p><div class="go">Begin ${icon('next')}</div></button>`;
  }).join('');
  const p = openOverlay('sheet',
    '<div class="sheet wide"><header class="sheet-hd"><div><span class="t-kicker">New game</span><h1>Choose your Mars</h1></div></header>' +
    '<div class="sheet-bd mg-scroll"><p class="brief-1">Stranded somewhere on the real Mars. Farm, make water, find Pathfinder, call home, drive to the rocket.</p><div class="brief">' +
    '<p>The storm hit. The crew evac\'d. Your bio-monitor said you were dead. It exaggerated. You are stranded <b>somewhere on Mars</b> — a real Mars: Olympus Mons, Valles Marineris, both ice caps, and every probe humanity ever threw at this planet, rusting exactly where history left it.</p>' +
    '<p>Grow food. Make water. Salvage the dead landers. Find Pathfinder in Ares Vallis. Call home. Then drive to Schiaparelli crater and fly out.</p></div>' +
    `<div class="diffs">${cards}</div></div>` +
    `<footer class="sheet-ft"><button type="button" class="mg-btn" data-act="back">${icon('back')}Back</button>` +
    (o.saved ? `<span class="note warn">Starting a new game replaces your saved run (Sol ${o.saved.sol}).</span>` : '<span class="note">Your crash site is random. So is the length of the road trip.</span>') +
    '</footer></div>',
    { label: 'New game: choose a difficulty', onEscape: back });
  UI.overlay.classList.add('over-title');
  on(p, '[data-act="back"]', back);
  on(p, '[data-diff]', (b) => { hideOverlay(); o.onNewGame(b.dataset.diff); });
}

// ------------------------------------------------------------------------------------------
// What the bars are
// ------------------------------------------------------------------------------------------
/**
 * What each bar on the HUD is and what moves it. Opened from the pause menu, and on a phone by tapping
 * the bars themselves. (The premise card points at "the six bars"; nothing said what any of them was.)
 */
export function showBarsGuide(onDone) {
  const o2 = 'O<sub>2</sub>';
  const rows = [
    ['suit', `Suit ${o2}`, `The air on your back: the ring. It drains whenever you are outside, and refills in the Hab, in the rover, or from an ${o2} candle. The time under it is how long it lasts at the rate it is going. Empty, you start to die.`],
    ['hab', `Hab ${o2}`, 'The air in the Hab. The oxygenator keeps it up while there is power; a breach lets it out.'],
    ['water', 'Water', 'Litres in the tank. You drink some every sol and the farm drinks more. Burning hydrazine makes it.'],
    ['food', 'Food', 'Meals left: rations, potatoes and everything in the pantry. Breakfast takes one each dawn.'],
    ['power', 'Power', 'The Hab’s battery. Sun on clean panels fills it; the machines and the night empty it.'],
    ['vitals', 'Vitals', 'Your body. It falls when you go without air, water, food or sleep, and mends when you have them. At nothing, the run is over.'],
    ['mood', 'Morale', 'Your spirits, out of 100. Variety on the plate, a cooked dinner, music, sights and comforts lift them; every sol alone lowers them. High, work goes a fifth faster; low, a fifth slower.'],
  ];
  showOverlay({
    kicker: 'Field notes', title: 'What keeps you alive',
    extra: `<ul class="guide">${rows.map(([ic, name, text]) => `<li>${icon(ic)}<b>${name}</b><span>${text}</span></li>`).join('')}</ul>` +
      '<p class="guide-n">A small arrow beside a number means it is rising or falling now.</p>',
    onEscape: () => { hideOverlay(); if (onDone) onDone(); },
    buttons: [{ label: 'Got it', fn: onDone }],
  });
  UI.panel.querySelector('.dlg').classList.add('wide', 'mg-scroll');
}

// ------------------------------------------------------------------------------------------
// Pause
// ------------------------------------------------------------------------------------------
/**
 * o: { sol, time, diffName, rescueSol, region, onResume(), onRestart(), onQuit() }
 */
export function showPauseMenu(o) {
  const again = () => showPauseMenu(o);
  const resume = () => { hideOverlay(); o.onResume(); };
  applyAudioSettings();
  const p = openOverlay('pause',
    `<div class="menu-col"><div class="t-kicker">Sol ${o.sol} · ${esc(o.time)} · ${esc(o.diffName)}</div><h1 class="pz">Paused</h1>` +
    '<p class="tag">Progress saved. The potatoes are fine. Probably.</p>' +
    '<nav class="menu" aria-label="Pause menu">' +
    menuItem('resume', 'Resume', '', 'first') + (o.onPhoto ? menuItem('photo', 'Photo mode') : '') + menuItem('settings', 'Settings') + menuItem('controls', 'Controls') +
    menuItem('quit', 'Save and quit') + menuItem('restart', 'Restart run', '', 'danger') +
    '</nav></div>' +
    '<aside class="pause-side"><div class="kv">' +
    `<span>Rescue</span><b>Sol ${o.rescueSol}</b><span>Location</span><b>${esc(o.region || 'Mars')}</b><span>Difficulty</span><b>${esc(o.diffName)}</b></div>` +
    `<h3>Field notes</h3><p>Survive to Sol ${o.rescueSol}. Watch the six bars.</p>` +
    '<p>The rover refills your suit; the Hab refills the rover; the sun refills the Hab. Keep the chain alive.</p>' +
    '<button type="button" class="mg-btn side-btn" data-act="bars">What the bars mean</button></aside>',
    { label: 'Paused', onEscape: resume });
  on(p, '[data-act]', (b) => {
    const a = b.dataset.act;
    if (a === 'resume') resume();
    else if (a === 'photo') { hideOverlay(); o.onPhoto(); }
    else if (a === 'settings') showSettings(again, false);
    else if (a === 'controls') showControls(again);
    else if (a === 'bars') showBarsGuide(again);
    else if (a === 'quit') o.onQuit();
    else if (a === 'restart') {
      showOverlay({
        kind: 'error', kicker: 'Restart run', title: 'Start over?',
        body: `This deletes your saved game — Sol ${o.sol} and everything you have built — and starts again at a new random crash site.`,
        onEscape: again,
        buttons: [
          { label: 'Keep playing', ghost: true, keep: true, fn: again },
          { label: 'Delete and restart', danger: true, ghost: true, keep: true, fn: o.onRestart },
        ],
      });
    }
  });
}

// ------------------------------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------------------------------
const QUALITIES = [['auto', 'Auto'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra']];
function seg(id, label, options, value) {
  return `<div class="mg-seg" role="radiogroup" aria-label="${label}" data-seg="${id}">` +
    options.map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === value}" tabindex="${v === value ? 0 : -1}" data-v="${v}">${l}</button>`).join('') + '</div>';
}
function range(id, label, min, max, step, value, fmt) {
  return `<input class="mg-range" type="range" id="set-${id}" data-range="${id}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}" ` +
    `style="--fill:${((value - min) / (max - min) * 100).toFixed(1)}%"><output for="set-${id}">${fmt(value)}</output>`;
}
function sw(id, label, onNow) {
  return `<button type="button" class="mg-switch" role="switch" aria-checked="${!!onNow}" aria-label="${label}" data-switch="${id}"></button>`;
}
const pct = (v) => Math.round(v * 100) + '%';

export function showSettings(back, overTitle) {
  const running = ctx.engine ? ctx.engine.qualityName : null;
  const quality = savedQuality() || 'auto';
  const p = openOverlay('sheet',
    '<div class="sheet"><header class="sheet-hd"><h1>Settings</h1></header>' +
    '<div class="sheet-bd mg-scroll"><div class="set-grid">' +
    // graphics
    `<section class="set-sec" style="grid-column:1/-1"><h3>${icon('monitor')}Graphics</h3>` +
    `<div class="set-row"><span class="lbl">Quality</span><div class="ctl">${seg('quality', 'Graphics quality', QUALITIES, quality)}</div>` +
    '<p class="hint" id="set-q-hint"></p></div></section>' +
    // controls
    `<section class="set-sec"><h3>${icon(layout.touch ? 'hand' : 'mouse')}Controls</h3>` +
    `<div class="set-row"><label for="set-sensitivity">Look sensitivity</label><div class="ctl">${range('sensitivity', 'Look sensitivity', 0.3, 2.5, 0.05, settings.sensitivity, pct)}</div></div>` +
    `<div class="set-row"><span class="lbl">Invert vertical look</span><div class="ctl">${sw('invertY', 'Invert vertical look', settings.invertY)}</div></div></section>` +
    // audio
    `<section class="set-sec"><h3>${icon('volume')}Sound</h3>` +
    `<div class="set-row"><label for="set-volume">Master volume</label><div class="ctl">${range('volume', 'Master volume', 0, 1, 0.05, settings.volume, pct)}</div></div>` +
    // the three kinds of sound, each against the master (kept by the sound module itself)
    [['music', 'Music'], ['sfx', 'Effects'], ['ambience', 'Ambience']].map(([bus, label]) =>
      `<div class="set-row"><label for="set-bus-${bus}">${label}</label><div class="ctl">${range('bus-' + bus, label + ' volume', 0, 1, 0.05, busVolume(bus), pct)}</div></div>`).join('') + '</section>' +
    // interface
    `<section class="set-sec" style="grid-column:1/-1"><h3>${icon('eye')}Interface</h3>` +
    `<div class="set-row"><label for="set-hudScale">Interface and text size</label><div class="ctl">${range('hudScale', 'Interface and text size', 0.8, 1.4, 0.05, settings.hudScale, pct)}</div>` +
    '<p class="hint" id="set-scale-hint"></p></div>' +
    `<div class="set-row"><span class="lbl">Reduce motion</span><div class="ctl">${sw('reducedMotion', 'Reduce motion', reducedMotion())}</div>` +
    '<p class="hint">Stills the interface\'s animations and softens screen flashes.</p></div>' +
    `<div class="set-row"><span class="lbl">Colour-blind-safe colours</span><div class="ctl">${sw('colorBlind', 'Colour-blind-safe colours', settings.colorBlind)}</div>` +
    '<p class="hint">Blue, yellow and vermilion in place of green, amber and red; low gauges are hatched.</p></div></section>' +
    '</div></div>' +
    `<footer class="sheet-ft"><button type="button" class="mg-btn primary" data-act="back" data-autofocus>${icon('check')}Done</button>` +
    '<button type="button" class="mg-btn" data-act="reload" hidden>Reload to apply</button>' +
    '<span class="note"></span><button type="button" class="mg-btn small" data-act="reset">Reset to defaults</button></footer></div>',
    { label: 'Settings', onEscape: back });
  if (overTitle) UI.overlay.classList.add('over-title');
  const hint = p.querySelector('#set-q-hint');
  const reload = p.querySelector('[data-act="reload"]');
  const qNote = () => {
    const q = savedQuality();
    const pending = running && ((q && q !== running) || (!q && quality !== 'auto'));
    hint.textContent = (running ? `Running now: ${running}. ` : '') +
      (pending ? 'The new quality takes effect after a reload. Your progress is saved first.' : 'Auto picks for this device and lowers the resolution when the frame rate drops.');
    hint.classList.toggle('warn', !!pending);
    reload.hidden = !pending;
  };
  qNote();
  const scaleHint = p.querySelector('#set-scale-hint');
  const scaleNote = () => {
    const capped = settings.hudScale > layout.maxScale + 0.001;
    scaleHint.textContent = capped ? `This screen has room for up to ${pct(layout.maxScale)}; larger sizes apply on a bigger window.` : '';
    scaleHint.hidden = !capped;
    scaleHint.classList.toggle('warn', capped);
  };
  scaleNote();
  // option groups: click, or left/right when focused
  p.querySelectorAll('[data-seg]').forEach((g) => {
    const pick = (btn) => {
      g.querySelectorAll('button').forEach((b) => { b.setAttribute('aria-checked', b === btn); b.tabIndex = b === btn ? 0 : -1; });
      btn.focus();
      Snd.click();
      if (g.dataset.seg === 'quality') { saveQuality(btn.dataset.v === 'auto' ? null : btn.dataset.v); qNote(); }
    };
    g.addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) pick(b); });
    g.addEventListener('keydown', (ev) => {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      const list = Array.from(g.querySelectorAll('button'));
      const i = list.indexOf(document.activeElement);
      const n = list[Math.min(list.length - 1, Math.max(0, i + (ev.key === 'ArrowRight' ? 1 : -1)))];
      if (n && n !== document.activeElement) pick(n);
      ev.preventDefault();
    });
  });
  p.querySelectorAll('[data-range]').forEach((r) => {
    const out = r.nextElementSibling;
    const key = r.dataset.range;
    const show = () => {
      r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min) * 100).toFixed(1) + '%');
      out.textContent = pct(+r.value);
    };
    // the interface size re-lays-out the slider itself, so it is applied when the slider is released
    if (key.startsWith('bus-')) {
      const bus = key.slice(4);
      r.addEventListener('input', () => { show(); setAudioVolume(bus, +r.value); });
      r.addEventListener('change', () => { show(); setAudioVolume(bus, +r.value); if (typeof Snd.audition === 'function') Snd.audition(bus); });
      return;
    }
    r.addEventListener('input', () => { show(); if (key !== 'hudScale') setSetting(key, +r.value); });
    r.addEventListener('change', () => { show(); setSetting(key, +r.value); if (key === 'volume') Snd.click(); if (key === 'hudScale') scaleNote(); });
  });
  p.querySelectorAll('[data-switch]').forEach((b) => {
    b.addEventListener('click', () => {
      const v = b.getAttribute('aria-checked') !== 'true';
      b.setAttribute('aria-checked', v);
      setSetting(b.dataset.switch, v);
      Snd.click();
    });
  });
  on(p, '[data-act="back"]', back);
  on(p, '[data-act="reset"]', () => { resetSettings(); showSettings(back, overTitle); });
  on(p, '[data-act="reload"]', () => {
    if (menuHooks.save) menuHooks.save();
    try {
      const u = new URL(location.href);
      u.searchParams.delete('q');
      location.replace(u.href);
    } catch (e) { p.querySelector('.note').textContent = 'Reload the page to apply the new quality.'; }
  });
}

// ------------------------------------------------------------------------------------------
// Controls reference, for the input in use
// ------------------------------------------------------------------------------------------
const kbd = (...keys) => keys.map((k) => `<kbd class="mg-kbd">${k}</kbd>`).join('');
const KEYBOARD = [
  ['Move, drive', kbd('W', 'A', 'S', 'D')], ['Look', `${icon('mouse')}Mouse`], ['Run', kbd('Shift')], ['Jump', kbd('Space')],
  ['Interact (hold)', kbd('E')], ['Crack an <span class="chem">O<sub>2</sub></span> candle', kbd('X')], ['Leave the rover', kbd('F')], ['Switch camera', kbd('V')],
  ['Map', kbd('M')], ['Colony and fabrication', kbd('C')], ['Journal', kbd('J')], ['Photo mode', kbd('P')], ['Pause, back', kbd('Esc')],
];
const TOUCH = [
  ['Move, drive', 'Left thumb, lower left'], ['Look', 'Drag anywhere else'], ['Interact', 'Hold the action button'], ['Run', `${icon('run')}Run (toggle)`],
  ['Jump', `${icon('jump')}Jump`], ['Leave the rover', `${icon('exit')}Exit`], ['Crack an <span class="chem">O<sub>2</sub></span> candle', '<span class="chem">O<sub>2</sub></span> button, when carrying one'], ['Switch camera', `${icon('camera')}Camera`],
  ['Map', `${icon('map')}Top right`], ['Colony and fabrication', `${icon('colony')}Top right`], ['Journal', `${icon('journal')}Top right`], ['Pause, settings', `${icon('pause')}Top right`], ['Photo mode', 'In the pause menu'],
];
export function showControls(back, which) {
  const mode = which || (layout.touch ? 'touch' : 'keys');
  const rows = (mode === 'touch' ? TOUCH : KEYBOARD).map(([a, k]) => `<div class="ctl-row"><span>${a}</span><span class="keys">${k}</span></div>`).join('');
  const p = openOverlay('sheet',
    '<div class="sheet"><header class="sheet-hd"><h1>Controls</h1>' +
    (layout.touch ? seg('mode', 'Input', [['touch', 'Touch'], ['keys', 'Keyboard']], mode) : '') + '</header>' +
    `<div class="sheet-bd mg-scroll"><div class="ctl-grid">${rows}</div></div>` +
    `<footer class="sheet-ft"><button type="button" class="mg-btn primary" data-act="back" data-autofocus>${icon('check')}Done</button>` +
    '<span class="note">Look sensitivity and inverted look are in Settings.</span></footer></div>',
    { label: 'Controls', onEscape: back });
  on(p, '[data-act="back"]', back);
  on(p, '[data-seg] button', (b) => showControls(back, b.dataset.v));
}

// ------------------------------------------------------------------------------------------
// Credits
// ------------------------------------------------------------------------------------------
export function showCredits(back, overTitle) {
  const p = openOverlay('sheet',
    '<div class="sheet"><header class="sheet-hd"><div><span class="t-kicker">About</span><h1>Stranded II</h1></div></header>' +
    '<div class="sheet-bd mg-scroll"><div class="credits">' +
    '<section class="lead"><p>A survival game on a whole, real Mars: every mountain, canyon and crater where the orbiters measured it, and every lander where history left it. ' +
    'An unofficial fan project inspired by <b>The Martian</b> by Andy Weir.</p></section>' +
    '<section><h3>The planet</h3><p><b>Elevation</b> — Mars Orbiter Laser Altimeter (MOLA), Mars Global Surveyor. NASA / JPL / Goddard, via the PDS Geosciences Node.</p>' +
    '<p><b>Colour</b> — Viking MDIM 2.1 global mosaic. NASA / JPL / USGS, via NASA Mars Trek.</p></section>' +
    '<section><h3>Built with</h3><p><b>three.js</b> — MIT licence.</p>' +
    '<p><b>Barlow</b> and <b>Barlow Condensed</b> by Jeremy Tribby, and <b>JetBrains Mono</b> by JetBrains — SIL Open Font Licence 1.1.</p></section>' +
    '<section><h3>The landers</h3><p>Fourteen real missions, 1971 to 2021, placed at their published landing coordinates.</p></section>' +
    '<section><h3>Your save</h3><p>Progress is kept in this browser only. Nothing is sent anywhere, and the game plays offline once loaded.</p></section>' +
    '</div></div>' +
    `<footer class="sheet-ft"><button type="button" class="mg-btn primary" data-act="back" data-autofocus>${icon('check')}Done</button></footer></div>`,
    { label: 'Credits', onEscape: back });
  if (overTitle) UI.overlay.classList.add('over-title');
  on(p, '[data-act="back"]', back);
}

// ------------------------------------------------------------------------------------------
// Sleeping through the night
// ------------------------------------------------------------------------------------------
export function showSleep() {
  openOverlay('sleep', '<div class="sleep"><div class="zz">Sleeping</div><div class="sum"></div></div>', { label: 'Sleeping until dawn' });
}
/**
 * d: { sol, deltas: [{ icon, label, from, to, unit }], notes: [text] }
 */
export function showSleepSummary(d, onDone) {
  const box = UI.panel.querySelector('.sleep');
  if (!box) return;
  const deltas = d.deltas.map((x) => {
    const v = x.whole ? Math.round(x.to) - Math.round(x.from) : x.to - x.from;
    return `<div class="delta"><b class="t-num ${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${x.whole ? Math.abs(v) : Math.abs(v).toFixed(1)}${x.unit}</b><span>${icon(x.icon)}${x.label}</span></div>`;
  }).join('');
  box.querySelector('.sum').innerHTML =
    `<div class="solbig"><span>SOL</span>${d.sol}</div><div class="deltas">${deltas}</div>` +
    `<div class="notes">${d.notes.map((n) => `<div>${esc(n)}</div>`).join('')}</div>` +
    (onDone ? `<button type="button" class="mg-btn primary wake" data-autofocus>${icon('sun')}Start the day</button>` : '');
  box.classList.add('done');
  const b = box.querySelector('.wake');
  if (b) { b.addEventListener('click', (ev) => { ev.stopPropagation(); onDone(); }); try { b.focus({ preventScroll: true }); } catch (e) { /* not focusable yet */ } }
}

// ------------------------------------------------------------------------------------------
// The NASA uplink: a comms terminal
// ------------------------------------------------------------------------------------------
let commsTimer = null;
/**
 * o: { title, subtitle, lines: [[who ('n' = Houston, anything else = Watney), text]...], index, onNext() }
 * Shows lines 0..index; the newest types itself out. The button calls onNext.
 */
export function showComms(o) {
  clearInterval(commsTimer);
  const last = o.index >= o.lines.length - 1;
  const rows = o.lines.slice(0, o.index + 1).map(([who, t], i) =>
    `<div class="msg ${who === 'n' ? 'n' : 'w'}${i < o.index ? ' old' : ''}"><span class="who">${who === 'n' ? 'HOUSTON' : 'WATNEY'}</span><span class="tx">${i < o.index ? esc(t) : ''}</span></div>`).join('');
  const p = openOverlay('comms',
    `<div class="comms"><header class="comms-hd">${icon('dish')}<div><h1>${esc(o.title)}</h1><p>${esc(o.subtitle || '')}</p></div>` +
    '<span class="live"><i></i>LINK</span></header>' +
    `<div class="comms-log mg-scroll" aria-live="polite">${rows}</div>` +
    `<footer class="comms-ft"><span class="prog">MSG ${String(o.index + 1).padStart(2, '0')} / ${String(o.lines.length).padStart(2, '0')}</span>` +
    `<button type="button" class="mg-btn primary" data-autofocus>${last ? 'Close channel' : `Next${icon('next')}`}</button></footer></div>`,
    { label: o.title, guard: true });
  const logEl = p.querySelector('.comms-log');
  const tx = logEl.lastElementChild.querySelector('.tx');
  const text = o.lines[o.index][1];
  if (reducedMotion()) tx.textContent = text;
  else {
    let i = 0;
    const stepN = Math.max(2, Math.ceil(text.length / 45));
    commsTimer = setInterval(() => {
      i += stepN;
      tx.innerHTML = esc(text.slice(0, i)) + (i < text.length ? '<i class="cur"></i>' : '');
      logEl.scrollTop = logEl.scrollHeight;
      if (i >= text.length) clearInterval(commsTimer);
    }, 22);
  }
  logEl.scrollTop = logEl.scrollHeight;
  p.querySelector('.comms-ft button').addEventListener('click', (ev) => { ev.stopPropagation(); clearInterval(commsTimer); o.onNext(); });
}

// ------------------------------------------------------------------------------------------
// A choice: one of a few things, each with a line of detail
// ------------------------------------------------------------------------------------------
/**
 * o: { kicker, title, note, items: [{ label, sub, note, count, fn }], onCancel() }
 * Picking an item closes the dialog and calls its fn; Escape or Cancel closes it.
 */
export function showChoice(o) {
  const cancel = () => { hideOverlay(); if (o.onCancel) o.onCancel(); };
  const rows = o.items.map((it, i) =>
    `<button type="button" class="choice" data-i="${i}"${i === 0 ? ' data-autofocus' : ''}><span class="ch-l">${esc(it.label)}</span>` +
    `${it.count ? `<span class="ch-n t-num">${esc(it.count)}</span>` : ''}<span class="ch-s">${esc(it.sub || '')}</span>` +
    `${it.note ? `<span class="ch-t">${esc(it.note)}</span>` : ''}</button>`).join('');
  const p = openOverlay('dialog',
    `<div class="dlg pick">${o.kicker ? `<div class="t-kicker">${esc(o.kicker)}</div>` : ''}<h1 id="mg-dlg-title">${esc(o.title)}</h1>` +
    `<div class="choices">${rows}</div>` +
    `<div class="btns">${o.note ? `<span class="pick-note">${esc(o.note)}</span>` : ''}<button type="button" class="mg-btn" data-act="cancel">Cancel</button></div></div>`,
    { label: o.title, onEscape: cancel, guard: true });
  p.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    hideOverlay();
    o.items[+b.dataset.i].fn();
  }));
  p.querySelector('[data-act="cancel"]').addEventListener('click', (ev) => { ev.stopPropagation(); cancel(); });
}

// test and debug handle (tools/tests/ui-shots.mjs drives every view through this)
window.__UI = { showLoading, showTitle, showNewGame, showPauseMenu, showSettings, showControls, showCredits, showSleep, showSleepSummary, showComms, showChoice,
  showOverlay, hideOverlay, toast, log, settings, setSetting, resetSettings, layout };
