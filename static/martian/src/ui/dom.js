// The interface's DOM: the HUD, the touch controls, the three full screens' frames and the
// dialog layer; plus the small widgets the game calls directly (log, toast, prompt, flash,
// showOverlay). This module imports nothing from the game except its state, so any game module
// can import it safely. Layout rules are in ui/css; menus in ui/menus.js; the per-frame HUD in
// ui/hud.js; map, colony and journal in ui/screens.js and ui/map.js.
import { S } from '../game/state.js';
import { icon } from './icons.js';
import { reducedMotion } from './settings.js';
import { layout, applyLayout } from './layout.js';

export const root = document.createElement('div');
root.id = 'mg-root';
document.body.appendChild(root);
{ const boot = document.getElementById('mg-boot'); if (boot) boot.remove(); }

export function el(tag, id, cls, parent, html) {
  const e = document.createElement(tag);
  if (id) e.id = id;
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  (parent || root).appendChild(e);
  return e;
}
/** Escape text for use inside HTML. */
export function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
/**
 * A figure and its unit are written one way everywhere: a space between them ("28 L", "49 m", "3 km"), and one that
 * does not break, so the unit never starts a line. (It was "+10L" on one screen and "+28 L" on the next.)
 */
export function units(s) { return String(s).replace(/(\d)\s?(L|km|m)\b(?!\w)/g, '$1\u00a0$2'); }
/** "O2", "CO2" and "H2O" with proper subscripts, and figures spaced from their units. */
export function chem(s) { return units(s).replace(/\b(C?O)2\b/g, '<span class="chem">$1<sub>2</sub></span>').replace(/\bH2O\b/g, '<span class="chem">H<sub>2</sub>O</span>'); }

/** Hooks the game fills in (see game/flow.js), so this module never has to import game code. */
export const uiHooks = { /** pause the game and show the pause menu */ pause: null };

export const UI = {};

// ------------------------------------------------------------------------------------------
// HUD
// ------------------------------------------------------------------------------------------
UI.hud = el('div', 'mg-hud');
el('div', null, 'hud-scrim top', UI.hud);
el('div', null, 'hud-scrim bottom', UI.hud);

const ring = (r, vb) => `<svg class="ring" viewBox="0 0 ${vb} ${vb}" aria-hidden="true"><circle class="trk" cx="${vb / 2}" cy="${vb / 2}" r="${r}"/>` +
  `<circle class="arc" cx="${vb / 2}" cy="${vb / 2}" r="${r}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0"/></svg>`;

UI.vitals = el('div', 'mg-vitals', null, UI.hud);
// (on a touch screen the panel is a control: pressed, it opens the guide to what it shows)
if (layout.touch) { UI.vitals.setAttribute('role', 'button'); UI.vitals.setAttribute('aria-label', 'What the bars mean'); }
UI.suit = el('div', null, 'suit', UI.vitals,
  `<div class="dial">${ring(28, 64).replace('</svg>', '<circle class="ticks" cx="32" cy="32" r="23.5" pathLength="120" stroke-dasharray="0.7 9.3"/></svg>')}<div class="in"><b class="num t-num">100</b><span class="lb">SUIT <span class="chem">O<sub>2</sub></span></span></div></div>` +
  // (on a phone the dial holds the figure alone and its name stands under it, at a size that can be read:
  //  inside a 54 px ring the name was 9 px capitals)
  '<div class="cap">SUIT <span class="chem">O<sub>2</sub></span></div><div class="st t-num"></div>');
UI.suitArc = UI.suit.querySelector('.arc');
UI.suitNum = UI.suit.querySelector('.num');
UI.suitState = UI.suit.querySelector('.st');
// On a touch screen the whole panel is one control: pressed, it opens the guide to itself. It is framed like the
// other touch buttons and carries a chip that says so. (The chip was a bare "?" in an 18 px ring, which read as a
// button too small to press, and nothing else said the panel could be pressed once its pointer card had gone.)
el('span', null, 'help', UI.suit, '<i>?</i>Guide').setAttribute('aria-hidden', 'true');
/** The resource rows beside the suit dial: [state key, icon, label]. */
export const BARS = [
  ['o2', 'hab', 'HAB <span class="chem">O<sub>2</sub></span>'],
  ['water', 'water', 'WATER'],
  ['food', 'food', 'FOOD'],
  ['power', 'power', 'POWER'],
  ['health', 'vitals', 'VITALS'],
  ['morale', 'mood', 'MORALE'],
];
UI.res = el('div', null, 'res', UI.vitals);
UI.bars = {};
for (const [key, ic, label] of BARS) {
  const w = el('div', null, 'row', UI.res,
    `${icon(ic)}<span class="lb">${label}</span><span class="tk"><i class="fl"></i></span><span class="val t-num"></span><span class="tr"></span>`);
  UI.bars[key] = { wrap: w, fill: w.querySelector('.fl'), val: w.querySelector('.val'), trend: w.querySelector('.tr') };
}

UI.compass = el('div', 'mg-compass', null, UI.hud,
  '<div class="strip"><div class="tape"></div><div class="cards"></div><div class="marks"></div></div><div class="caret"></div><div class="dists"></div>');
UI.compassStrip = UI.compass.querySelector('.strip');
UI.compassTape = UI.compass.querySelector('.tape');
UI.compassCards = UI.compass.querySelector('.cards');
UI.compassMarks = UI.compass.querySelector('.marks');
UI.compassDists = UI.compass.querySelector('.dists');
UI.region = el('div', 'mg-region', null, UI.hud);
UI.alerts = el('div', 'mg-alerts', null, UI.hud);
UI.alerts.setAttribute('role', 'status');

UI.tr = el('div', 'mg-tr', null, UI.hud);
UI.clock = el('div', 'mg-clock', null, UI.tr,
  '<div class="sol"><span class="k">SOL</span><b class="n t-num">1</b><span class="of t-num"></span></div>' +
  `<div class="meta"><span class="dn">${icon('sun')}</span><span class="time t-mono">--:--</span><i></i><span class="temp t-mono"></span></div>`);
UI.clockSol = UI.clock.querySelector('.n');
UI.clockOf = UI.clock.querySelector('.of');
UI.clockDn = UI.clock.querySelector('.dn');
UI.clockTime = UI.clock.querySelector('.time');
UI.clockTemp = UI.clock.querySelector('.temp');
UI.objectives = el('div', 'mg-objectives', null, UI.tr);

UI.log = el('div', 'mg-log', null, UI.hud);
UI.log.setAttribute('role', 'log');
UI.log.setAttribute('aria-live', 'polite');

UI.rover = el('div', 'mg-rover', null, UI.hud,
  '<div class="spd"><b class="t-num">0</b><span>KM/H</span></div>' +
  '<div class="rv">' +
  `<div class="row" data-k="pwr">${icon('battery')}<span class="lb">BATTERY</span><span class="tk"><i class="fl"></i></span><span class="val t-num"></span></div>` +
  `<div class="row" data-k="o2">${icon('suit')}<span class="lb"><span class="chem">O<sub>2</sub></span> TANK</span><span class="tk"><i class="fl"></i></span><span class="val t-num"></span></div>` +
  '</div>');
UI.roverSpeed = UI.rover.querySelector('.spd b');
UI.roverBars = {};
UI.rover.querySelectorAll('.row').forEach((r) => { UI.roverBars[r.dataset.k] = { wrap: r, fill: r.querySelector('.fl'), val: r.querySelector('.val') }; });

UI.prompt = el('div', 'mg-prompt', null, UI.hud,
  `<div class="pk">${ring(17, 40)}<span class="kc"><span class="k">E</span>${icon('hand')}${icon('block')}</span></div>` +
  '<div class="pt"><div class="pl"><span class="ph">HOLD</span><span class="lb"></span></div><div class="sub"></div></div>');
UI.promptArc = UI.prompt.querySelector('.arc');
UI.promptLabel = UI.prompt.querySelector('.lb');
UI.promptSub = UI.prompt.querySelector('.sub');

UI.keys = el('div', 'mg-keys', null, UI.hud);
UI.crosshair = el('div', 'mg-crosshair', null, UI.hud);
UI.toasts = el('div', 'mg-toast', null, root);
UI.toasts.setAttribute('role', 'status');
UI.flash = el('div', 'mg-flash', null, root);

// ------------------------------------------------------------------------------------------
// Touch controls (shown on touch devices; wired up in game/input.js)
// ------------------------------------------------------------------------------------------
const tbtn = (id, cls, label, html, parent) => {
  const b = el('button', id, 'mg-tbtn ' + cls, parent || UI.touch, html);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  return b;
};
UI.touch = el('div', 'mg-touch', null, root);
UI.joyZone = el('div', 'mg-joyzone', null, UI.touch);
UI.joy = el('div', 'mg-joy', null, UI.touch, '<i class="n"></i><i class="e"></i><i class="s"></i><i class="w"></i>');
UI.joyKnob = el('div', 'mg-joyknob', null, UI.joy);
// (With nothing in reach it is not there: an empty ring under the right thumb read as a control that was broken, and
// "USE / HOLD", "— / HOLD" and a bare icon each read as a control with no name. With something to do it carries the
// verb and HOLD; with something in the way, a barred ring over what is wanting, in the reason's own words.)
UI.tE = tbtn('mg-tE', 'act', 'Interact', `${ring(46, 100)}<span class="vi">${icon('block')}</span><span class="vb"></span><span class="vh">HOLD</span>`);
UI.tEArc = UI.tE.querySelector('.arc');
UI.tEVerb = UI.tE.querySelector('.vb');
UI.tJump = tbtn('mg-tJump', 'sec', 'Jump', `${icon('jump')}<span>JUMP</span>`);
UI.tExit = tbtn('mg-tExit', 'sec', 'Exit the rover', `${icon('exit')}<span>EXIT</span>`);
UI.tSprint = tbtn('mg-tSprint', 'sec', 'Run', `${icon('run')}<span>RUN</span>`);
// (an eye, not a camera: the camera is photo mode's, in the menu)
UI.tCam = tbtn('mg-tCam', 'mini', 'Switch view', `${icon('eye')}<span>VIEW</span>`);
// (it said only "O2": what it does is under it now)
UI.tCandle = tbtn('mg-tCandle', 'mini', 'Crack an oxygen candle: 40 more suit oxygen', '<i>+<span class="chem">O<sub>2</sub></span></i><span>CANDLE</span><b>0</b>');
UI.tCandle.style.display = 'none';
UI.tRow = el('div', 'mg-trow', null, UI.touch);
UI.tPause = tbtn('mg-tPause', 'top', 'Pause and menu', `${icon('pause')}<span>MENU</span>`, UI.tRow);
for (const [k, label] of [['map', 'Map'], ['colony', 'Colony and fabrication'], ['journal', 'Journal']]) {
  // (each has its word under it: an icon alone has to be guessed at)
  tbtn(null, 'top', label, `${icon(k)}<span>${k.toUpperCase()}</span>`, UI.tRow).dataset.t = k;
}

// ------------------------------------------------------------------------------------------
// Full screens: map, colony, journal (filled by ui/screens.js)
// ------------------------------------------------------------------------------------------
export const SCREENS = [['map', 'Map', 'Orbital Survey'], ['colony', 'Colony', 'Colony'], ['journal', 'Journal', 'Mission Journal']];
function screenShell(key, title) {
  const s = el('section', 'mg-' + key, 'mg-screen', root,
    `<header class="scr-hd"><div class="scr-title">${icon(key)}<h1>${title}</h1></div>` +
    '<nav class="scr-nav" aria-label="Screens">' +
    SCREENS.map(([k, short]) => `<button type="button" data-screen="${k}"${k === key ? ' aria-current="page"' : ''}>${icon(k)}<span>${short}</span><kbd class="mg-kbd">${k[0].toUpperCase()}</kbd></button>`).join('') +
    `</nav><button type="button" class="mg-iconbtn close" aria-label="Close">${icon('close')}</button></header><div class="scr-body"></div>`);
  s.setAttribute('role', 'dialog');
  s.setAttribute('aria-modal', 'true');
  s.setAttribute('aria-label', title);
  return s;
}
UI.mapScreen = screenShell('map', 'Orbital Survey');
UI.colonyScreen = screenShell('colony', 'Colony');
UI.journalScreen = screenShell('journal', 'Mission Journal');
/** True while the map, colony or journal screen is open. */
export function anyScreenOpen() {
  return UI.mapScreen.style.display === 'block' || UI.colonyScreen.style.display === 'block' || UI.journalScreen.style.display === 'block';
}

// ------------------------------------------------------------------------------------------
// Dialog layer
// ------------------------------------------------------------------------------------------
UI.overlay = el('div', 'mg-overlay');
UI.panel = el('div', 'mg-panel', null, UI.overlay);
UI.rotate = el('div', 'mg-rotate', null, root,
  `${icon('rotate')}<h2>Rotate your phone</h2><p>Stranded II plays in landscape. Turn your phone sideways to continue.</p>`);
UI.rotate.setAttribute('role', 'alert');

let dlg = null;
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex="0"]';
function focusables(scope) {
  return Array.from((scope || UI.panel).querySelectorAll(FOCUSABLE)).filter((n) => n.offsetParent !== null);
}
/** Move keyboard focus by `step` among the focusable controls inside `scope`. */
export function moveFocus(scope, step) {
  const list = focusables(scope);
  if (!list.length) return;
  const i = list.indexOf(document.activeElement);
  const next = i < 0 ? (step > 0 ? 0 : list.length - 1) : (i + step + list.length) % list.length;
  list[next].focus();
  if (list[next].scrollIntoView) list[next].scrollIntoView({ block: 'nearest' });
}

/**
 * Open the dialog layer with ready-made markup.
 * @param {string} kind   names the look (CSS class k-<kind> on the layer)
 * @param {string} html   the dialog's contents
 * @param {object} [o]    { label: accessible name, onEscape: function, focus: selector,
 *                          guard: true if the dialog can interrupt play (see below) }
 * @returns {HTMLElement} the dialog element
 */
export function openOverlay(kind, html, o = {}) {
  // a dialog that interrupts play (death, the uplink, the launch) ignores Enter and Space for a moment,
  // so a jump or a mashed key cannot answer it before it has been read
  const fromPlay = S.started && UI.overlay.style.display !== 'flex';
  UI.overlay.className = 'k-' + kind;
  UI.panel.innerHTML = html;
  UI.panel.setAttribute('role', o.role || 'dialog');
  UI.panel.setAttribute('aria-modal', 'true');
  UI.panel.setAttribute('aria-label', o.label || 'Menu');
  UI.panel.scrollTop = 0;
  UI.overlay.style.display = 'flex';
  S.uiOpen = true;
  try { if (document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* not locked */ }
  dlg = { kind, onEscape: o.onEscape || null, armedAt: o.guard && fromPlay ? performance.now() + 650 : 0 };
  const first = (o.focus && UI.panel.querySelector(o.focus)) || UI.panel.querySelector('[data-autofocus]') || focusables()[0];
  if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  return UI.panel;
}
export function hideOverlay() {
  UI.overlay.style.display = 'none';
  S.uiOpen = false;
  dlg = null;
  if (document.activeElement && UI.panel.contains(document.activeElement)) document.activeElement.blur();
}
export function overlayKind() { return dlg ? dlg.kind : null; }

/** Text with blank lines between paragraphs, as HTML paragraphs (single line breaks become spaces). */
function paragraphs(text) {
  if (/<p[ >]/.test(text)) return text;
  return String(text).split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, ' ')}</p>`).join('');
}

/**
 * A plain dialog: title, text and buttons.
 * opts: { title, subtitle, kicker, body (HTML; line breaks kept), stats: [[label, value]...], extra (HTML, placed under the stats),
 *         quote, kind: 'dialog' | 'death' | 'win' | 'error', buttons: [{ label, fn, ghost, keep, danger }] }
 * A button closes the dialog unless it has keep: true.
 */
export function showOverlay(opts) {
  const kind = opts.kind || 'dialog';
  const buttons = opts.buttons || [];
  const btns = buttons.map((b, i) =>
    `<button type="button" data-i="${i}" class="mg-btn${b.ghost ? '' : ' primary'}${b.danger ? ' danger' : ''}">${b.label}</button>`).join('');
  const stats = (opts.stats || []).map(([k, v]) => `<div class="stat"><b class="t-num">${v}</b><span>${k}</span></div>`).join('');
  // (the text is one part, which scrolls if it has to, and the buttons another, which is always on the screen: as one
  // scrolling box, the rescue screen on a small phone cut its last line and its only button)
  const panel = openOverlay(kind,
    '<div class="dlg"><div class="dlg-bd mg-scroll">' +
    (opts.kicker ? `<div class="t-kicker">${opts.kicker}</div>` : '') +
    (opts.title ? `<h1 id="mg-dlg-title">${opts.title}</h1>` : '') +
    (opts.subtitle ? `<h2>${opts.subtitle}</h2>` : '') +
    (stats ? `<div class="stats">${stats}</div>` : '') +
    (opts.extra || '') +
    (opts.body ? `<div class="bd">${paragraphs(opts.body)}</div>` : '') +
    (opts.quote ? `<blockquote>${opts.quote}</blockquote>` : '') +
    '</div>' + (btns ? `<div class="btns">${btns}</div>` : '') +
    '</div>',
    { label: opts.title || 'Dialog', role: kind === 'death' || kind === 'error' ? 'alertdialog' : 'dialog', onEscape: opts.onEscape, guard: true });
  panel.querySelectorAll('.btns button').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const b = buttons[+btn.dataset.i];
      if (b.keep !== true) hideOverlay();
      if (b.fn) b.fn();
    });
  });
}

// keyboard operation of every dialog: arrows and tab move, enter and space activate, escape goes back
document.addEventListener('keydown', (ev) => {
  if (!dlg || UI.overlay.style.display === 'none') return;
  const k = ev.key;
  if ((k === 'Enter' || k === ' ') && performance.now() < dlg.armedAt) { ev.preventDefault(); ev.stopPropagation(); return; }
  const a = document.activeElement;
  const inPanel = a && UI.panel.contains(a);
  if (k === 'Escape') {
    ev.preventDefault(); ev.stopPropagation();
    if (dlg.onEscape) dlg.onEscape();
    return;
  }
  if (k === 'Tab') {
    const list = focusables();
    if (!list.length) { ev.preventDefault(); return; }
    const i = list.indexOf(a);
    if (ev.shiftKey && i <= 0) { ev.preventDefault(); list[list.length - 1].focus(); }
    else if (!ev.shiftKey && (i < 0 || i === list.length - 1)) { ev.preventDefault(); list[0].focus(); }
    ev.stopPropagation();
    return;
  }
  if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'ArrowRight') {
    ev.stopPropagation();
    const horizontal = k === 'ArrowLeft' || k === 'ArrowRight';
    // sliders and option groups use left/right themselves
    if (horizontal && inPanel && (a.type === 'range' || a.closest('[role="radiogroup"]'))) return;
    ev.preventDefault();
    moveFocus(UI.panel, (k === 'ArrowDown' || k === 'ArrowRight') ? 1 : -1);
    return;
  }
  if ((k === 'Enter' || k === ' ') && !inPanel) {
    const list = focusables();
    if (list.length) { ev.preventDefault(); list[0].focus(); }
  }
  // keep the game from seeing keys typed into a dialog
  if (k.length === 1 || k === 'Enter') ev.stopPropagation();
}, true);

document.addEventListener('keyup', (ev) => {
  if (dlg && (ev.key === 'Enter' || ev.key === ' ') && performance.now() < dlg.armedAt) ev.preventDefault();
}, true);

// ------------------------------------------------------------------------------------------
// Toasts: discoveries, achievements, system notices. One at a time, queued.
// ------------------------------------------------------------------------------------------
const toastQueue = [];
let toastBusy = false, toastNow = null;                 // toastNow: the one on screen, { node, yields, timer }
function closeToast(cur, atOnce) {
  if (toastNow !== cur) return;
  clearTimeout(cur.timer);
  toastNow = null;
  const done = () => { cur.node.remove(); root.classList.remove('has-toast'); nextToast(); };
  if (atOnce) done();
  else { cur.node.classList.add('out'); setTimeout(done, 380); }
}
function nextToast() {
  if (!toastQueue.length) { toastBusy = false; return; }
  toastBusy = true;
  // never over a menu or a screen: wait for the player to be back in the world
  if (S.uiOpen || anyScreenOpen()) {
    if (S.won) { toastQueue.length = 0; toastBusy = false; return; }
    setTimeout(nextToast, 400);
    return;
  }
  const t = toastQueue.shift();
  const kind = /ACHIEVEMENT/i.test(t.kicker) ? 'ach' : /DISCOVER/i.test(t.kicker) ? 'disc' : 'sys';
  const node = el('div', null, 'toast ' + kind + (t.point ? ' point' : ''), UI.toasts,
    `<div class="ti">${icon(kind === 'ach' ? 'trophy' : kind === 'disc' ? 'pin' : 'info')}</div>` +
    `<div class="tt"><div class="t1">${esc(t.kicker)}</div><div class="t2">${chem(esc(t.title))}</div>${t.note ? `<div class="t3">${chem(esc(t.note))}</div>` : ''}</div>`);
  root.classList.add('has-toast');
  // On a phone the card stands between the gauges and the stick. One that would reach the stick keeps one line of its
  // note (whole sentences of it), or none: it never lies over the thing his thumb is on.
  if (layout.compact && layout.touch && t.note) {
    const joy = UI.joy.getBoundingClientRect(), t3 = node.querySelector('.t3');
    const reaches = () => joy.height > 2 && node.getBoundingClientRect().bottom > joy.top - 8;      // (8 px clear of it, as everything on the HUD is of its neighbour)
    if (t3 && reaches()) {
      node.classList.add('tight');
      t3.innerHTML = chem(esc(fitSentences(t3, t.note)));
      if (reaches()) t3.remove();
    }
  }
  const life = Math.max(t.life || 0, toastQueue.length ? 3400 : 6000);
  const cur = toastNow = { node, yields: !!t.yields, timer: 0, point: !!t.point, soft: t.soft || 0, since: performance.now() };
  cur.timer = setTimeout(() => closeToast(cur, false), life);
}
/** Put the pointer at the bars away: he has opened what it points to. */
export function dropPointer() { if (toastNow && toastNow.point) closeToast(toastNow, true); }
/**
 * Queue a notice. `o.yields` marks a reminder (night has fallen, a new sol): it is shown like any other, but gives
 * up the screen at once if news arrives while it is up. `o.life` is the least time it stays, in milliseconds;
 * `o.soft` is how long it stays when something else is waiting behind it (a long-lived pointer must not hold up
 * the news). `o.point` draws it as a pointer at the panel it stands under on a phone (the bars).
 */
export function toast(kicker, title, note, o) {
  // while his life is in the balance (the banner at the top says how), only what bears on it is said
  if (UI.critical && !/^(next|warning)$/i.test(kicker || '')) return;
  // a phone's card holds two short lines of note: give it whole sentences that fit, not a line cut mid-word
  // (how much two lines hold depends on the card's width: fewer letters on the narrowest phones)
  const room = window.innerWidth <= 760 ? 62 : 76;
  if (layout.compact && note && note.length > room) {
    const cut = note.slice(0, room + 1), end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    note = end > 20 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…';
  }
  toastQueue.push({ kicker, title, note, yields: !!(o && o.yields), life: (o && o.life) || 0, point: !!(o && o.point), soft: (o && o.soft) || 0 });
  if (!toastBusy) nextToast();
  else if (toastNow && toastNow.yields) closeToast(toastNow, true);
  else if (toastNow && toastNow.soft) {
    const cur = toastNow, left = Math.max(0, cur.soft - (performance.now() - cur.since));
    clearTimeout(cur.timer);
    cur.soft = 0;
    cur.timer = setTimeout(() => closeToast(cur, false), left);
  }
}

// ------------------------------------------------------------------------------------------
// The log feed: three voices (the astronaut, the Hab's systems, NASA) and survey notes
// ------------------------------------------------------------------------------------------
export const VOICES = { nasa: 'NASA', sys: 'HAB', suit: 'SUIT', disc: 'SURVEY', log: 'LOG' };
/** What has been said, newest last: { text, voice, sol }. The journal shows it, and the last of it is kept with the saved game. */
export const logHistory = [];
/** The last lines of the log, for the saved game (it was this session's only: a run continued the next day had an empty log). */
export function logSnapshot() { return logHistory.slice(-60).map((l) => ({ text: l.text, voice: l.voice, sol: l.sol })); }
/** Put back the log a saved game or a checkpoint carried (nothing, for a save from before logs were kept). */
export function restoreLog(lines) {
  logHistory.length = 0;
  if (Array.isArray(lines)) for (const l of lines) if (l && typeof l.text === 'string') logHistory.push({ text: l.text, voice: VOICES[l.voice] ? l.voice : 'log', sol: +l.sol || 1 });
}
/**
 * As much of a text as its line on the HUD has room for, ending at the end of a sentence where it can and never
 * mid-word. The room is measured, not counted: `tx` is the line's text box, which clamps what it shows. (Counted in
 * letters, an entry that ran a few letters over was cut by the clamp in the middle of a sentence; and "I'm just..."
 * was taken for the end of one.)
 */
function fitSentences(tx, full) {
  tx.textContent = full;
  // (a log that is not on the screen just now, behind a toast or in the first minute, cannot be measured: count letters)
  const measured = tx.clientHeight > 0, room = window.innerWidth <= 760 ? 95 : 105;
  const over = () => (measured ? tx.scrollHeight > tx.clientHeight + 2 : tx.textContent.length > room);
  if (!over()) return full;
  const ends = [];
  const re = /[.!?]["')\]]?(?=\s)/g;
  for (let m = re.exec(full); m; m = re.exec(full)) if (full[m.index - 1] !== '.' && m.index > 24) ends.push(m.index + m[0].length);      // (an ellipsis runs on)
  let text = full;
  for (let k = ends.length - 1; k >= 0 && over(); k--) { text = full.slice(0, ends[k]); tx.textContent = text; }
  if (over()) {
    const words = text.split(' ');
    while (words.length > 3 && over()) { words.pop(); text = words.join(' ').replace(/[,;:.]+$/, '') + '…'; tx.textContent = text; }
  }
  return text;
}
/**
 * Say something in the log. `cls` is the voice ('nasa', 'sys' for the Hab, 'suit', 'disc', or none for his own).
 * `o.quiet` keeps it for the journal without showing it on the HUD (for what a banner is already saying).
 */
export function log(full, cls, o) {
  const voice = VOICES[cls] ? cls : 'log';
  logHistory.push({ text: full, voice, sol: S.sol });
  if (logHistory.length > 120) logHistory.shift();
  if (o && o.quiet) return;
  const line = el('div', null, 'mg-line ' + voice, UI.log, `<span class="who">${VOICES[voice]}</span><span class="tx" aria-hidden="true"></span><span class="sr"></span>`);
  const tx = line.querySelector('.tx');
  line.querySelector('.sr').textContent = full;
  // A phone's log has the room between the bars and the stick: a few short lines. A longer entry shows as many whole
  // sentences as fit there (the journal's log has all of it), so that it can never reach down onto the stick.
  const text = layout.compact ? fitSentences(tx, full) : full;
  tx.textContent = '';
  const done = () => {
    setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 1300); }, 9500);
  };
  // (once it is all there, O2 gets its subscript, as it has everywhere else)
  if (reducedMotion()) { tx.innerHTML = chem(esc(text)); done(); }
  else {
    // typed out a word at a time, never part of one: caught mid-number, "Suit O2 at 4" was a false reading
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      const sp = text.indexOf(' ', i);
      i = sp < 0 ? text.length : sp;
      if (i >= text.length) { clearInterval(t); tx.innerHTML = chem(esc(text)); done(); }
      else tx.textContent = text.slice(0, i);
    }, 24);
  }
  while (UI.log.children.length > 4) UI.log.firstChild.remove();
}

// ------------------------------------------------------------------------------------------
// The interaction prompt (and the touch action button, which shows the same verb)
// ------------------------------------------------------------------------------------------
const pr = { on: false, label: null, sub: null, state: null, pct: -1, minor: false, verb: null };
const STATUS_MARK = '\u200b';                       // (a zero-width space, written as its escape so that it can be seen)
/**
 * Marks a reason an interaction gives for not being available as a plain reading ("Potatoes — 41% grown",
 * "Panel is clean") rather than something in the way ("Needs regolith"). A reading is shown without the padlock.
 */
export function statusText(s) { return STATUS_MARK + s; }
function verbOf(label) {
  const w = label.replace(/\[[^\]]*\]/g, ' ').replace(/[^A-Za-z' ]/g, ' ').trim().split(/\s+/);
  let v = w[0] || 'USE';
  if (/ly$/i.test(v) && w[1]) v = w[1];
  if (/^run$/i.test(v)) v = 'USE';                       // "Run the numbers" beside a button marked RUN (sprint)
  return v.toUpperCase().slice(0, 8);
}
/**
 * What the action button says when something is in the way: what is wanting, which is how a reason begins
 * ("Needs regolith: dig it at the heap…" gives NEEDS REGOLITH). A reason that does not begin that way, or begins at
 * too great a length for the button, gives a plain NOT YET; the prompt line has the whole of it either way.
 */
export function refusalWord(reason) {
  const m = /^([^:—(]{3,22}?)\s*[:—(]/.exec(reason);
  return (m && m[1].trim().split(/\s+/).length <= 4 ? m[1].trim() : 'Not yet').toUpperCase();
}
/**
 * Show, update or hide (null) the interaction prompt.
 * p: { label, sub, disabled: false | reason string, hold: seconds to hold, progress: 0..1,
 *      minor: true for something always available here rather than something in reach }
 *
 * The rule of the prompt: a thing that cannot be done here says why, in the prompt line. `disabled` is therefore a
 * sentence: what is wanting, and after a colon what to do about it ("Needs regolith: dig it at the heap outside the
 * airlock"), or a reading made with statusText(). A refusal that gives no reason is not shown at all: a padlock
 * with nothing beside it was the first thing a new player met at an empty farm bed.
 */
export function setPrompt(p) {
  if (p && p.disabled && (typeof p.disabled !== 'string' || !p.disabled.replace(STATUS_MARK, '').trim())) p = null;
  if (!p) {
    if (pr.on) {
      pr.on = false; pr.label = null; pr.state = null; pr.pct = -1; pr.verb = null;
      UI.prompt.classList.remove('on');
      UI.tE.classList.remove('ready', 'no', 'holding', 'verb');
      UI.tEVerb.textContent = '';
      UI.tEArc.style.strokeDashoffset = 100;
    }
    return;
  }
  // not available: either something is in the way (a padlock), or there is simply nothing to do here now (a reading)
  const reading = typeof p.disabled === 'string' && p.disabled.charAt(0) === STATUS_MARK;
  const label = p.disabled && typeof p.disabled === 'string' ? (reading ? p.disabled.slice(1) : p.disabled) : p.label;
  // (every interaction is held, the quick ones for half a second: the tag is on all of them, where it was on some)
  const state = p.disabled ? (reading ? 'info' : 'no') : 'hold';
  if (!pr.on) { pr.on = true; UI.prompt.classList.add('on'); }
  if (label !== pr.label) {
    pr.label = label;
    UI.promptLabel.innerHTML = chem(esc(label));
  }
  const verb = p.disabled ? (reading ? '' : refusalWord(label)) : verbOf(p.label);
  if (verb !== pr.verb) { pr.verb = verb; UI.tEVerb.textContent = verb; }
  if (!!p.minor !== pr.minor) { pr.minor = !!p.minor; pr.state = null; UI.prompt.classList.toggle('minor', pr.minor); }
  const sub = p.sub || '';
  if (sub !== pr.sub) { pr.sub = sub; UI.promptSub.innerHTML = chem(esc(sub)); UI.promptSub.style.display = sub ? '' : 'none'; }
  if (state !== pr.state) {
    pr.state = state;
    UI.prompt.classList.toggle('no', state === 'no');
    UI.prompt.classList.toggle('info', state === 'info');
    UI.prompt.classList.toggle('hold', state === 'hold');
    UI.tE.classList.toggle('no', state === 'no');
    UI.tE.classList.toggle('verb', state === 'hold');                       // a word on it only when there is something to do
    UI.tE.classList.toggle('ready', state === 'hold' && !pr.minor);          // lit only for something actually in reach
  }
  const pct = p.disabled ? 0 : Math.round(Math.min(1, Math.max(0, p.progress || 0)) * 100);
  if (pct !== pr.pct) {
    pr.pct = pct;
    UI.promptArc.style.strokeDashoffset = 100 - pct;
    UI.tEArc.style.strokeDashoffset = 100 - pct;
    UI.prompt.classList.toggle('holding', pct > 0);
    UI.tE.classList.toggle('holding', pct > 0);
  }
}

export function flashScreen(color, ms) {
  UI.flash.style.transition = '';
  UI.flash.style.background = color;
  UI.flash.style.opacity = reducedMotion() ? 0.3 : 1;
  setTimeout(() => {
    UI.flash.style.transition = 'opacity .6s';
    UI.flash.style.opacity = 0;
    setTimeout(() => { UI.flash.style.transition = ''; }, 700);
  }, ms);
}

// ------------------------------------------------------------------------------------------
// Root state classes: CSS shows and hides whole groups from these (see css/hud.css)
// ------------------------------------------------------------------------------------------
applyLayout(root);
const flags = {};
function flag(name, on) {
  if (flags[name] === on) return;
  flags[name] = on;
  root.classList.toggle(name, on);
}
// A scrolling region with more below carries a "More" mark at its foot (and a short fade at its head when
// there is more above). Without one, a list cut off by the bottom of a phone's screen looks like the end of
// the list. (It used to fade its last rows instead, which read as rows that were switched off.)
function scrollCue(n) {
  // (more than a few pixels of it: the last of a box's own padding is not "more")
  const more = ((n.scrollTop > 4 ? 'up ' : '') + (n.scrollHeight - n.clientHeight - n.scrollTop > 10 ? 'down' : '')).trim();
  // (the mark sticks to the foot of the box's contents, which stops short of the box's own foot by its padding:
  //  the style sheet moves it down by that much, so nothing shows under its shelf)
  if (n.dataset.more !== more) { n.dataset.more = more; if (more) n.style.setProperty('--foot', getComputedStyle(n).paddingBottom); }
  const last = n.lastElementChild;
  if (more && (!last || !last.classList.contains('more-cue'))) {
    const old = n.querySelector(':scope > .more-cue');
    n.appendChild(old || Object.assign(document.createElement('i'), { className: 'more-cue' })).setAttribute('aria-hidden', 'true');
  }
}
root.addEventListener('scroll', (ev) => { const t = ev.target; if (t && t.classList && t.classList.contains('mg-scroll')) scrollCue(t); }, true);
let cueTick = 0;
/**
 * Bring the root's state classes up to date now. They are kept every frame below; the HUD also calls this before
 * it measures itself, so that what it measures is what is showing (a menu just closed, the rover just entered).
 */
export function syncFlags() {
  const modal = S.uiOpen || anyScreenOpen();
  flag('is-playing', S.started);
  flag('is-modal', modal);
  flag('is-rover', S.mode === 'rover');
  flag('is-cutscene', S.mode === 'cutscene');
  flag('is-cold', !!S.flags.coldOpen);
  flag('is-fp', S.firstPerson && S.mode === 'walk');
  return modal;
}
function syncChrome() {
  requestAnimationFrame(syncChrome);
  const modal = syncFlags();
  // (their contents change under them, so the regions on screen are looked at again a few times a second)
  if ((modal || !S.started) && ++cueTick % 2 === 0) for (const n of root.querySelectorAll('.mg-scroll')) if (n.offsetParent) scrollCue(n);
  // a phone turned upright mid-game: pause, so nothing happens behind the "rotate" notice
  if (layout.portrait && S.started && !modal && !S.over && S.mode !== 'cutscene' && uiHooks.pause) uiHooks.pause();
}
requestAnimationFrame(syncChrome);
// canvas text (the map) needs the fonts loaded before it draws
try {
  for (const f of ['600 16px "Barlow Condensed"', '500 16px "Barlow Condensed"', '400 16px "Barlow"', '500 16px "Barlow"', '600 16px "Barlow"', '500 16px "JetBrains Mono"']) document.fonts.load(f);
} catch (e) { /* no font loading API: text draws in the fallback font */ }
