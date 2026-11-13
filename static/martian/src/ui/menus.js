// Menus and dialogs: loading, title, new game, pause, settings, controls, credits, the sleep
// summary and the NASA uplink terminal. Pure presentation: the game passes in what to show and
// what to do (see game/flow.js, game/sim.js, game/story.js). Death, rescue and other plain
// dialogs go through showOverlay in ui/dom.js.
import { UI, openOverlay, hideOverlay, showOverlay, esc, chem, holdCards, log, logHistory, toast, dropPointer, setPrompt } from './dom.js';
import { icon } from './icons.js';
import { settings, setSetting, resetSettings, savedQuality, saveQuality, reducedMotion, onSettingsChange } from './settings.js';
import { OBJECTIVES, missionList, suitTimeLeft } from './hud.js';
import { layout } from './layout.js';
import { DIFFICULTIES } from '../game/state.js';
import { regionName } from '../planet/features.js';
import { llToVec } from '../planet/geo.js';
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
    (o.unreadable ? '<p class="menu-note" role="alert">Your saved game was made by an older version of Stranded II and cannot be continued. Starting a new game replaces it.</p>' : '') +
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
    // (how fast air, water and power are used, against the rated pace: "go 13% sooner" read as a mistake)
    // ("Consumption: as rated" asked a new player what was consumed, and rated by whom)
    const drain = d.drain < 0.995 ? `Drain ${Math.round((1 - d.drain) * 100)}% slower` : d.drain > 1.005 ? `Drain ${Math.round((d.drain - 1) * 100)}% faster` : 'Normal drain';
    // The whole card is the button, and Begin is its foot: a thumb-high bar that always stands inside the card.
    return `<button type="button" class="diff${k === 'survival' ? ' rec' : k === 'iron' ? ' hard' : ''}" data-diff="${k}"${k === 'survival' ? ' data-autofocus' : ''} aria-label="${d.name}: rescue on Sol ${d.rescueSol}. Begin">` +
      `<div class="dx"><span>0${i + 1}</span><em>${DIFF_TAG[k]}</em></div><div class="dn">${d.name}</div><div class="dp" aria-hidden="true">${pips}</div>` +
      `<dl><dt>Rescue on</dt><dd>Sol ${d.rescueSol}</dd><dt>Supplies</dt><dd>${drain}</dd><dt>If you die</dt><dd>${k === 'iron' ? 'Save deleted' : 'Wake at dawn'}</dd></dl>` +
      `<p>${esc(d.desc.replace(/^Rescue: Sol \d+\.\s*/, '').replace(/\n/g, ' '))}</p><div class="go">Begin ${icon('next')}</div></button>`;
  }).join('');
  const p = openOverlay('sheet',
    // (the way back is at the foot at every size, where Done and Cancel are on every other sheet: on a phone it was a
    //  button in the header, and the ways out of a sheet were in four different corners)
    '<div class="sheet wide newgame"><header class="sheet-hd"><div><span class="t-kicker">New game</span><h1>Choose your Mars</h1></div></header>' +
    '<div class="sheet-bd mg-scroll"><p class="brief-1">Stranded on the real Mars. Farm, make water, call home, drive to the rocket.</p><div class="brief">' +
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
 * The Guide: what each bar on the HUD is and what moves it. Opened from the pause menu, and on a phone by pressing
 * the bars themselves, whose chip carries the same word. It has one name wherever it is offered. (It was GUIDE on
 * the chip, "What the bars mean" in the pause menu and "What keeps you alive" at its own head.)
 *
 * Each entry is a line to take in at a glance and, where there is more worth knowing, a second: in two columns, so
 * that no line runs the width of a phone. (It was 150 words in lines of over a hundred characters.)
 */
export function showBarsGuide(onDone) {
  dropPointer();
  const o2 = 'O<sub>2</sub>';
  const rows = [
    ['suit', `Suit ${o2}`, 'The air on your back.', `The ring is how full the tank is; the time under it, how long that lasts at a walk. It refills in the Hab, in the rover, or from a candle.`],
    ['hab', `Hab ${o2}`, 'The air in the Hab.', 'The oxygenator keeps it up while there is power. A breach lets it out.'],
    ['water', 'Water', 'Litres in the tank.', 'You and the farm drink it. Burning hydrazine makes more.'],
    ['food', 'Food', 'Meals left.', 'Breakfast takes one each dawn, two with a side. The bar is full when there is enough to reach the rescue.'],
    ['power', 'Power', 'The Hab’s battery.', 'Sun on clean panels fills it. The machines and the night drain it.'],
    ['vitals', 'Vitals', 'Your body.', 'It falls without air, water, food or sleep. At zero the run is over.'],
    ['mood', 'Morale', 'Your spirits, out of 100.', 'Good food, music and comforts lift them. High, work goes a fifth faster; low, a fifth slower.'],
    ['chart', 'Arrows', 'Rising or falling.', 'An arrow beside a number shows which way it is going now.'],
  ];
  // A sheet: the entries scroll between a fixed heading and a fixed foot, so "Got it" is on the screen at
  // every size. (As a plain dialog it was taller than a phone, and its one button was below the fold.)
  const done = () => { hideOverlay(); if (onDone) onDone(); };
  const p = openOverlay('sheet',
    '<div class="sheet wide"><header class="sheet-hd"><h1 id="mg-dlg-title">Guide: what the bars mean</h1></header>' +
    `<div class="sheet-bd mg-scroll"><ul class="guide">${rows.map(([ic, name, lead, text]) => `<li>${icon(ic)}<b>${name}</b><span><em>${lead}</em> ${text}</span></li>`).join('')}</ul></div>` +
    `<footer class="sheet-ft"><button type="button" class="mg-btn primary" data-act="back" data-autofocus>${icon('check')}Got it</button></footer></div>`,
    { label: 'Guide: what the bars mean', onEscape: done, guard: true });
  on(p, '[data-act="back"]', done);
}

// ------------------------------------------------------------------------------------------
// Pause
// ------------------------------------------------------------------------------------------
/**
 * o: { sol, time, diffName, rescueSol, region, uplink (Earth has been told), onResume(), onRestart(), onQuit() }
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
    // (what is still to do, not what is done: it went on saying "raise Earth on a radio" after Houston had answered)
    `<h3>The way home</h3><p>${o.uplink ? 'Stay fed, and reach the MAV in Schiaparelli' : 'Stay fed, find a radio and tell Earth, then reach the MAV in Schiaparelli'}: the only rocket on Mars. It can launch on Sol ${o.rescueSol}.</p>` +
    '<p>The rover refills your suit; the Hab refills the rover; the sun refills the Hab.</p>' +
    '<button type="button" class="mg-btn side-btn" data-act="bars">Guide: what the bars mean</button></aside>',
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
/**
 * A slider. `mark` is given for a scale that does not run evenly either side of its usual value (80% to 140%, about
 * 100%): the two ends of such a scale are lettered, and where the usual value lies is notched on the track. (With
 * neither, a handle standing at "100%" a third of the way along looked like a handle out of place.)
 */
function range(id, label, min, max, step, value, fmt, mark) {
  const at = (v) => ((v - min) / (max - min) * 100).toFixed(1), ends = mark !== undefined;
  return (ends ? `<span class="range-end">${fmt(min)}</span>` : '') +
    `<span class="mg-rangewrap"${ends ? ` style="--mark:${((mark - min) / (max - min)).toFixed(4)}" data-mark="${fmt(mark)}"` : ''}><input class="mg-range" type="range" id="set-${id}" data-range="${id}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}" ` +
    `style="--fill:${at(value)}%"></span>` + (ends ? `<span class="range-end">${fmt(max)}</span>` : '') + `<output for="set-${id}">${fmt(value)}</output>`;
}
function sw(id, label, onNow) {
  return `<button type="button" class="mg-switch" role="switch" aria-checked="${!!onNow}" aria-label="${label}" data-switch="${id}"></button>`;
}
const pct = (v) => Math.round(v * 100) + '%';

const SET_TABS = [['graphics', 'Graphics'], ['controls', 'Controls'], ['sound', 'Sound'], ['interface', 'Interface']];
let setTab = 'graphics';
export function showSettings(back, overTitle) {
  const running = ctx.engine ? ctx.engine.qualityName : null;
  const quality = savedQuality() || 'auto';
  // On a phone the four groups are four tabs, each of which fits the screen. (As one scrolling sheet, Sound
  // and the colour-blind switch were below the fold with nothing to say they were there.)
  const tabbed = layout.compact;
  const p = openOverlay('sheet',
    `<div class="sheet settings${tabbed ? ' tabbed' : ''}"><header class="sheet-hd"><h1>Settings</h1>${tabbed ? seg('settab', 'Settings group', SET_TABS, setTab) : ''}</header>` +
    '<div class="sheet-bd mg-scroll"><div class="set-grid">' +
    // graphics
    `<section class="set-sec" data-sec="graphics" style="grid-column:1/-1"><h3>${icon('monitor')}Graphics</h3>` +
    `<div class="set-row"><span class="lbl">Quality</span><div class="ctl">${seg('quality', 'Graphics quality', QUALITIES, quality)}</div>` +
    '<p class="hint" id="set-q-hint"></p></div>' +
    // (the size of the interface is a matter of the display: here, the Graphics page of a phone is two rows on its
    //  sheet where it was one over an empty sheet, and the Interface page the two switches)
    `<div class="set-row"><label for="set-hudScale">Interface and text size</label><div class="ctl">${range('hudScale', 'Interface and text size', 0.8, 1.4, 0.05, settings.hudScale, pct, 1)}</div>` +
    '<p class="hint" id="set-scale-hint"></p></div></section>' +
    // controls
    `<section class="set-sec" data-sec="controls"><h3>${icon(layout.touch ? 'hand' : 'mouse')}Controls</h3>` +
    `<div class="set-row"><label for="set-sensitivity">Look sensitivity</label><div class="ctl">${range('sensitivity', 'Look sensitivity', 0.3, 2.5, 0.05, settings.sensitivity, pct, 1)}</div></div>` +
    `<div class="set-row"><span class="lbl">Invert vertical look</span><div class="ctl">${sw('invertY', 'Invert vertical look', settings.invertY)}</div></div></section>` +
    // audio
    `<section class="set-sec" data-sec="sound"><h3>${icon('volume')}Sound</h3>` +
    `<div class="set-row"><label for="set-volume">Master volume</label><div class="ctl">${range('volume', 'Master volume', 0, 1, 0.05, settings.volume, pct)}</div></div>` +
    // the three kinds of sound, each against the master (kept by the sound module itself)
    [['music', 'Music'], ['sfx', 'Effects'], ['ambience', 'Ambience']].map(([bus, label]) =>
      `<div class="set-row"><label for="set-bus-${bus}">${label}</label><div class="ctl">${range('bus-' + bus, label + ' volume', 0, 1, 0.05, busVolume(bus), pct)}</div></div>`).join('') + '</section>' +
    // interface
    `<section class="set-sec" data-sec="interface" style="grid-column:1/-1"><h3>${icon('eye')}Interface</h3>` +
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
    hint.textContent = (running ? `Running now: ${running.charAt(0).toUpperCase() + running.slice(1)}. ` : '') +
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
  const showTab = () => {
    if (!tabbed) return;
    p.querySelectorAll('.set-sec').forEach((s) => { s.hidden = s.dataset.sec !== setTab; });
    p.querySelector('.sheet-bd').scrollTop = 0;
  };
  showTab();
  // option groups: click, or left/right when focused
  p.querySelectorAll('[data-seg]').forEach((g) => {
    const pick = (btn) => {
      g.querySelectorAll('button').forEach((b) => { b.setAttribute('aria-checked', b === btn); b.tabIndex = b === btn ? 0 : -1; });
      btn.focus();
      Snd.click();
      if (g.dataset.seg === 'quality') { saveQuality(btn.dataset.v === 'auto' ? null : btn.dataset.v); qNote(); }
      if (g.dataset.seg === 'settab') { setTab = btn.dataset.v; showTab(); }
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
    const out = r.closest('.ctl').querySelector('output');
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
    const flip = () => {
      const v = b.getAttribute('aria-checked') !== 'true';
      b.setAttribute('aria-checked', v);
      setSetting(b.dataset.switch, v);
      Snd.click();
    };
    b.addEventListener('click', (ev) => { ev.stopPropagation(); flip(); });
    // the whole row is the target (a switch is small to look at, and smaller than a thumb)
    const row = b.closest('.set-row');
    if (row) { row.classList.add('tap'); row.addEventListener('click', flip); }
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
  ['Interact (hold)', kbd('E')], ['Crack an <span class="chem">O<sub>2</sub></span> candle', kbd('X')], ['Exit the rover', kbd('F')], ['Switch view', kbd('V')],
  ['Map', kbd('M')], ['Colony and fabrication', kbd('C')], ['Journal', kbd('J')], ['Photo mode', kbd('P')], ['Pause, back', kbd('Esc')],
];
const TOUCH = [
  ['Move, drive', 'Left thumb, lower left'], ['Look', 'Drag anywhere else'], ['Interact', 'Hold the action button'], ['Run', `${icon('run')}Run (toggle)`],
  ['Jump', `${icon('jump')}Jump`], ['Exit the rover', `${icon('exit')}Exit`], ['Crack an <span class="chem">O<sub>2</sub></span> candle', 'Candle'], ['Switch view', `${icon('eye')}View`],
  // (the four buttons at the top right carry their own names: one line for the three screens and one for the menu,
  //  and the whole list fits a phone held sideways without scrolling. A line apiece ran to seven rows.)
  ['The three screens', 'Top right'], ['Pause, settings, photo mode', `${icon('pause')}Menu`],
];
export function showControls(back, which) {
  const mode = which || (layout.touch ? 'touch' : 'keys');
  const rows = (mode === 'touch' ? TOUCH : KEYBOARD).map(([a, k]) => `<div class="ctl-row"><span>${a}</span><span class="keys">${k}</span></div>`).join('');
  const p = openOverlay('sheet',
    '<div class="sheet"><header class="sheet-hd"><h1>Controls</h1>' +
    // (a tablet may have a keyboard on it; a phone held sideways does not, and was offered the keyboard's page)
    (layout.touch && !layout.compact ? seg('mode', 'Input', [['touch', 'Touch'], ['keys', 'Keyboard']], mode) : '') + '</header>' +
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
    '<div class="sheet"><header class="sheet-hd"><div><span class="t-kicker">Stranded II</span><h1>Credits</h1></div></header>' +
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
 * d: { sol, turned, deltas: [{ icon, label, from, to, unit }], rows: [[name, text, more]...], later }
 * A row's `more` is detail that is there for the asking (why morale moved, part by part): a button beside Start
 * the day shows it.
 * Returns whether the account is up with its button (if not, the caller must not wait for a tap).
 */
export function showSleepSummary(d, onDone) {
  const box = UI.panel.querySelector('.sleep');
  if (!box) return false;
  const deltas = d.deltas.map((x) => {
    // (The change overnight, and under it what that leaves: both in whole numbers, as the gauges give them, so the
    //  change is the difference between two figures he can see. It was "+6.8%" over "now 100%". A unit that is a
    //  letter stands off from its figure, as everywhere else: "66 L", not "66L". One that is a word, "meals", goes
    //  with what is left and not with the change; and morale, a score, has none.)
    const v = Math.round(x.to) - Math.round(x.from), u = x.unit === '%' ? '%' : x.unit ? '\u00a0' + x.unit : '', du = x.unit && x.unit.length > 1 ? '' : u;
    return `<div class="delta"><b class="t-num ${v > 0 ? 'up' : v < 0 ? 'dn' : ''}">${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v)}${du}</b><span>${icon(x.icon)}${x.label}</span><i class="t-num">now ${Math.round(x.to)}${u}</i></div>`;
  }).join('');
  // the first thing still to do, as the mission list has it
  const todo = missionList().find((e) => !e.done);
  const rows = (d.rows || []).slice();
  if (todo) rows.push(['Today', todo.o.text(), '', 'today']);
  if (d.later) rows.push(['Later', d.later, '', 'later']);
  const more = rows.find((r) => r[2]);
  box.querySelector('.sum').innerHTML =
    `<div class="solbig"><span>${d.turned === false ? 'Still sol' : 'Dawn · Sol'}</span>${d.sol}</div><div class="deltas">${deltas}</div>` +
    // (the rows are the part that gives way when there is much to say on a small phone: they scroll, and the
    //  heading, the five figures and the buttons keep their places)
    `<dl class="notes mg-scroll">${rows.map(([k, v, m, cls]) => `<dt${cls ? ` class="${cls}"` : ''}>${esc(k)}</dt><dd>${chem(esc(v))}${m ? `<span class="more" hidden>${chem(esc(m))}</span>` : ''}</dd>`).join('')}</dl>` +
    (onDone ? `<div class="sleep-ft"><button type="button" class="mg-btn primary wake" data-autofocus>${icon('sun')}Start the day</button>` +
      (more ? `<button type="button" class="mg-btn why" aria-expanded="false">Why ${esc(more[0].toLowerCase())} moved</button>` : '') + '</div>' : '');
  box.classList.add('done');
  const w = box.querySelector('.sleep-ft .why');
  if (w) w.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const m = box.querySelector('.notes .more'), open = m.hidden;
    m.hidden = !open; w.setAttribute('aria-expanded', open); Snd.click();
    if (open && m.scrollIntoView) m.scrollIntoView({ block: 'nearest' });
  });
  const b = box.querySelector('.wake');
  if (b) { b.addEventListener('click', (ev) => { ev.stopPropagation(); onDone(); }); try { b.focus({ preventScroll: true }); } catch (e) { /* not focusable yet */ } }
  return !!b;
}

// ------------------------------------------------------------------------------------------
// The NASA uplink: a comms terminal
// ------------------------------------------------------------------------------------------
let commsTimer = null;
/**
 * o: { title, subtitle, lines: [[who ('n' = Houston, anything else = Watney), text]...], index, onNext(), onSkip() }
 * Shows lines 0..index; the newest types itself out. The button calls onNext; "Skip to the end", where the caller
 * gives one, shows every line at once (the only way out of a six-message exchange was Next six times).
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
    // (the button that goes on is at the left of the foot, where Done, Back and Cancel are on every sheet)
    `<footer class="comms-ft"><button type="button" class="mg-btn primary" data-act="next" data-autofocus>${last ? 'Close channel' : `Next${icon('next')}`}</button>` +
    (!last && o.onSkip ? '<button type="button" class="mg-btn" data-act="skip">Skip to the end</button>' : '') +
    `<span class="prog">Message ${o.index + 1} of ${o.lines.length}</span></footer></div>`,
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
  p.querySelector('.comms-ft [data-act="next"]').addEventListener('click', (ev) => { ev.stopPropagation(); clearInterval(commsTimer); o.onNext(); });
  const skip = p.querySelector('.comms-ft [data-act="skip"]');
  if (skip) skip.addEventListener('click', (ev) => { ev.stopPropagation(); clearInterval(commsTimer); o.onSkip(); });
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
    `${it.note ? `<span class="ch-t">${chem(esc(it.note))}</span>` : ''}<span class="ch-go" aria-hidden="true">${icon('next')}</span></button>`).join('');
  const p = openOverlay('dialog',
    `<div class="dlg pick"><div class="dlg-bd mg-scroll">${o.kicker ? `<div class="t-kicker">${esc(o.kicker)}</div>` : ''}<h1 id="mg-dlg-title">${esc(o.title)}</h1>` +
    `<div class="choices n${o.items.length}">${rows}</div></div>` +
    `<div class="btns"><button type="button" class="mg-btn" data-act="cancel">Cancel</button>${o.note ? `<span class="pick-note">${chem(esc(o.note))}</span>` : ''}</div></div>`,
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
  showOverlay, hideOverlay, toast, holdCards, log, logHistory, setPrompt, showBarsGuide, settings, setSetting, resetSettings, layout,
  /** what the map lettered on its canvas at its last drawing (the audit holds it to the sizes of the page's own text) */
  get mapLettering() { return UI.mapLettering || []; },
  /** the name of the region at a latitude and longitude (so a test's made-up title screen can name the real place) */
  regionAt: (lat, lon) => regionName(llToVec(lat, lon)),
  suitTimeLeft, missionList, objectives: OBJECTIVES };
