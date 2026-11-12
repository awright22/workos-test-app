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
/** "O2", "CO2" and "H2O" with proper subscripts. */
export function chem(s) { return String(s).replace(/\b(C?O)2\b/g, '<span class="chem">$1<sub>2</sub></span>').replace(/\bH2O\b/g, '<span class="chem">H<sub>2</sub>O</span>'); }

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
UI.suit = el('div', null, 'suit', UI.vitals,
  `<div class="dial">${ring(28, 64).replace('</svg>', '<circle class="ticks" cx="32" cy="32" r="23.5" pathLength="120" stroke-dasharray="0.7 9.3"/></svg>')}<div class="in"><b class="num t-num">100</b><span class="lb">SUIT <span class="chem">O<sub>2</sub></span></span></div></div>` +
  '<div class="st t-num"></div>');
UI.suitArc = UI.suit.querySelector('.arc');
UI.suitNum = UI.suit.querySelector('.num');
UI.suitState = UI.suit.querySelector('.st');
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
  `<div class="row" data-k="pwr">${icon('battery')}<span class="lb">POWER</span><span class="tk"><i class="fl"></i></span><span class="val t-num"></span></div>` +
  `<div class="row" data-k="o2">${icon('suit')}<span class="lb"><span class="chem">O<sub>2</sub></span> TANK</span><span class="tk"><i class="fl"></i></span><span class="val t-num"></span></div>` +
  '</div>');
UI.roverSpeed = UI.rover.querySelector('.spd b');
UI.roverBars = {};
UI.rover.querySelectorAll('.row').forEach((r) => { UI.roverBars[r.dataset.k] = { wrap: r, fill: r.querySelector('.fl'), val: r.querySelector('.val') }; });

UI.prompt = el('div', 'mg-prompt', null, UI.hud,
  `<div class="pk">${ring(17, 40)}<span class="kc"><span class="k">E</span>${icon('hand')}${icon('lock')}</span></div>` +
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
UI.tE = tbtn('mg-tE', 'act', 'Interact', `${ring(46, 100)}<span class="vb">USE</span><span class="vh">HOLD</span>`);
UI.tEArc = UI.tE.querySelector('.arc');
UI.tEVerb = UI.tE.querySelector('.vb');
UI.tJump = tbtn('mg-tJump', 'sec', 'Jump', `${icon('jump')}<span>JUMP</span>`);
UI.tExit = tbtn('mg-tExit', 'sec', 'Exit the rover', `${icon('exit')}<span>EXIT</span>`);
UI.tSprint = tbtn('mg-tSprint', 'sec', 'Run', `${icon('run')}<span>RUN</span>`);
UI.tCam = tbtn('mg-tCam', 'mini', 'Switch camera', `${icon('camera')}<span>VIEW</span>`);
UI.tCandle = tbtn('mg-tCandle', 'mini', 'Crack an oxygen candle', '<span class="chem">O<sub>2</sub></span><b>0</b>');
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
  const panel = openOverlay(kind,
    '<div class="dlg">' +
    (opts.kicker ? `<div class="t-kicker">${opts.kicker}</div>` : '') +
    (opts.title ? `<h1 id="mg-dlg-title">${opts.title}</h1>` : '') +
    (opts.subtitle ? `<h2>${opts.subtitle}</h2>` : '') +
    (stats ? `<div class="stats">${stats}</div>` : '') +
    (opts.extra || '') +
    (opts.body ? `<div class="bd">${paragraphs(opts.body)}</div>` : '') +
    (opts.quote ? `<blockquote>${opts.quote}</blockquote>` : '') +
    (btns ? `<div class="btns">${btns}</div>` : '') +
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
let toastBusy = false;
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
  const node = el('div', null, 'toast ' + kind, UI.toasts,
    `<div class="ti">${icon(kind === 'ach' ? 'trophy' : kind === 'disc' ? 'pin' : 'info')}</div>` +
    `<div class="tt"><div class="t1">${esc(t.kicker)}</div><div class="t2">${esc(t.title)}</div>${t.note ? `<div class="t3">${esc(t.note)}</div>` : ''}</div>`);
  root.classList.add('has-toast');
  const life = toastQueue.length ? 3400 : 6000;
  setTimeout(() => {
    node.classList.add('out');
    setTimeout(() => { node.remove(); root.classList.remove('has-toast'); nextToast(); }, 380);
  }, life);
}
export function toast(kicker, title, note) {
  // while his life is in the balance (the banner at the top says how), only what bears on it is said
  if (UI.critical && !/^(next|warning)$/i.test(kicker || '')) return;
  toastQueue.push({ kicker, title, note });
  if (!toastBusy) nextToast();
}

// ------------------------------------------------------------------------------------------
// The log feed: three voices (the astronaut, the Hab's systems, NASA) and survey notes
// ------------------------------------------------------------------------------------------
const VOICES = { nasa: 'NASA', sys: 'HAB', disc: 'SURVEY', log: 'LOG' };
/** Everything said this session, newest last: { text, voice, sol }. The journal shows it. */
export const logHistory = [];
export function log(text, cls) {
  const voice = VOICES[cls] ? cls : 'log';
  logHistory.push({ text, voice, sol: S.sol });
  if (logHistory.length > 120) logHistory.shift();
  const line = el('div', null, 'mg-line ' + voice, UI.log, `<span class="who">${VOICES[voice]}</span><span class="tx" aria-hidden="true"></span><span class="sr"></span>`);
  const tx = line.querySelector('.tx');
  line.querySelector('.sr').textContent = text;
  const done = () => {
    setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 1300); }, 9500);
  };
  if (reducedMotion()) { tx.textContent = text; done(); }
  else {
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      tx.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(t); done(); }
    }, 16);
  }
  while (UI.log.children.length > 4) UI.log.firstChild.remove();
}

// ------------------------------------------------------------------------------------------
// The interaction prompt (and the touch action button, which shows the same verb)
// ------------------------------------------------------------------------------------------
const pr = { on: false, label: null, sub: null, state: null, pct: -1, minor: false, verb: null };
function verbOf(label) {
  const w = label.replace(/\[[^\]]*\]/g, ' ').replace(/[^A-Za-z' ]/g, ' ').trim().split(/\s+/);
  let v = w[0] || 'USE';
  if (/ly$/i.test(v) && w[1]) v = w[1];
  if (/^run$/i.test(v)) v = 'USE';                       // "Run the numbers" beside a button marked RUN (sprint)
  return v.toUpperCase().slice(0, 8);
}
/**
 * Show, update or hide (null) the interaction prompt.
 * p: { label, sub, disabled: false | reason string, hold: seconds to hold, progress: 0..1,
 *      minor: true for something always available here rather than something in reach }
 */
export function setPrompt(p) {
  if (!p) {
    if (pr.on) {
      pr.on = false; pr.label = null; pr.state = null; pr.pct = -1; pr.verb = null;
      UI.prompt.classList.remove('on');
      UI.tE.classList.remove('ready', 'no', 'holding');
      UI.tEVerb.textContent = 'USE';
      UI.tEArc.style.strokeDashoffset = 100;
    }
    return;
  }
  const label = p.disabled && typeof p.disabled === 'string' ? p.disabled : p.label;
  const state = p.disabled ? 'no' : (p.hold > 0.7 ? 'hold' : 'tap');
  if (!pr.on) { pr.on = true; UI.prompt.classList.add('on'); }
  if (label !== pr.label) {
    pr.label = label;
    UI.promptLabel.innerHTML = chem(esc(label));
  }
  const verb = p.disabled ? '—' : verbOf(p.label);
  if (verb !== pr.verb) { pr.verb = verb; UI.tEVerb.textContent = verb; }
  if (!!p.minor !== pr.minor) { pr.minor = !!p.minor; pr.state = null; UI.prompt.classList.toggle('minor', pr.minor); }
  const sub = p.sub || '';
  if (sub !== pr.sub) { pr.sub = sub; UI.promptSub.innerHTML = chem(esc(sub)); UI.promptSub.style.display = sub ? '' : 'none'; }
  if (state !== pr.state) {
    pr.state = state;
    UI.prompt.classList.toggle('no', state === 'no');
    UI.prompt.classList.toggle('hold', state === 'hold');
    UI.tE.classList.toggle('no', state === 'no');
    UI.tE.classList.toggle('ready', state !== 'no' && !pr.minor);          // lit only for something actually in reach
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
// A scrolling region fades toward any edge that hides more of it. Without that, a list cut off by
// the bottom of a phone's screen looks like the end of the list.
function scrollCue(n) {
  const more = ((n.scrollTop > 4 ? 'up ' : '') + (n.scrollHeight - n.clientHeight - n.scrollTop > 4 ? 'down' : '')).trim();
  if (n.dataset.more !== more) n.dataset.more = more;
}
root.addEventListener('scroll', (ev) => { const t = ev.target; if (t && t.classList && t.classList.contains('mg-scroll')) scrollCue(t); }, true);
let cueTick = 0;
function syncChrome() {
  requestAnimationFrame(syncChrome);
  const modal = S.uiOpen || anyScreenOpen();
  // (their contents change under them, so the regions on screen are looked at again a few times a second)
  if ((modal || !S.started) && ++cueTick % 2 === 0) for (const n of root.querySelectorAll('.mg-scroll')) if (n.offsetParent) scrollCue(n);
  flag('is-playing', S.started);
  flag('is-modal', modal);
  flag('is-rover', S.mode === 'rover');
  flag('is-cutscene', S.mode === 'cutscene');
  flag('is-cold', !!S.flags.coldOpen);
  flag('is-fp', S.firstPerson && S.mode === 'walk');
  // a phone turned upright mid-game: pause, so nothing happens behind the "rotate" notice
  if (layout.portrait && S.started && !modal && !S.over && S.mode !== 'cutscene' && uiHooks.pause) uiHooks.pause();
}
requestAnimationFrame(syncChrome);
// canvas text (the map) needs the fonts loaded before it draws
try {
  for (const f of ['600 16px "Barlow Condensed"', '500 16px "Barlow Condensed"', '400 16px "Barlow"', '500 16px "Barlow"', '600 16px "Barlow"', '500 16px "JetBrains Mono"']) document.fonts.load(f);
} catch (e) { /* no font loading API: text draws in the fallback font */ }
