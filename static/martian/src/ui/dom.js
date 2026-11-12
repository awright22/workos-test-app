import { S } from '../game/state.js';
// The HUD's DOM: bars, clock, compass, log, prompts, overlays, touch layer and screens.
export const root = document.createElement('div');
root.id = 'mg-root';
document.body.appendChild(root);

export function el(tag, id, cls, parent, html) {
  const e = document.createElement(tag);
  if (id) e.id = id;
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  (parent || root).appendChild(e);
  return e;
}

export const UI = {};
UI.vitals = el('div', 'mg-vitals', 'mg-hud');
export const BARS = [
  ['suit',  'SUIT O2', '#7fd4ff'],
  ['o2',    'HAB O2',  '#9fd49f'],
  ['water', 'H2O',     '#6fb7ff'],
  ['food',  'FOOD',    '#d8c26f'],
  ['power', 'PWR',     '#7fca7f'],
  ['health','VITALS',  '#ff8f7f'],
];
UI.bars = {};
for (const [key, label, color] of BARS) {
  const w = el('div', null, 'mg-bar', UI.vitals);
  w.innerHTML = `<div class="lb"><span>${label}</span><span class="val"></span></div>
    <div class="tk"><div class="fl" style="background:${color}"></div></div>`;
  UI.bars[key] = { wrap: w, fill: w.querySelector('.fl'), val: w.querySelector('.val') };
}
UI.clock = el('div', 'mg-clock', 'mg-hud');
UI.compass = el('div', 'mg-compass', 'mg-hud');
UI.region = el('div', 'mg-region', 'mg-hud');
UI.objectives = el('div', 'mg-objectives', 'mg-hud');
UI.keys = el('div', 'mg-keys', 'mg-hud', null,
  '<span class="mg-kbd">M</span> MAP · <span class="mg-kbd">C</span> COLONY · <span class="mg-kbd">J</span> JOURNAL');
UI.log = el('div', 'mg-log', 'mg-hud');
UI.prompt = el('div', 'mg-prompt', 'mg-hud');
UI.promptText = el('div', null, null, UI.prompt);
UI.promptSub = el('div', null, 'sub', UI.prompt);
UI.hold = el('div', 'mg-hold', null, UI.prompt, '<div class="fl"></div>');
UI.holdFill = UI.hold.querySelector('.fl');
UI.crosshair = el('div', 'mg-crosshair', 'mg-hud', null, '+');
UI.vign = el('div', 'mg-vign', 'mg-hud');
UI.cold = el('div', 'mg-cold', 'mg-hud');
UI.flash = el('div', 'mg-flash', 'mg-hud');
UI.toast = el('div', 'mg-toast', 'mg-hud');
UI.overlay = el('div', 'mg-overlay', null);
UI.panel = el('div', 'mg-panel', null, UI.overlay);
// touch layer
UI.touch = el('div', 'mg-touch', null, root);
UI.joy = el('div', 'mg-joy', null, UI.touch);
UI.joyKnob = el('div', 'mg-joyknob', null, UI.joy);
UI.tE = el('div', 'mg-tE', 'mg-tbtn', UI.touch, 'HOLD');
UI.tJump = el('div', 'mg-tJump', 'mg-tbtn', UI.touch, 'JUMP');
UI.tSprint = el('div', 'mg-tSprint', 'mg-tbtn', UI.touch, 'RUN');
UI.tExit = el('div', 'mg-tExit', 'mg-tbtn', UI.touch, 'EXIT');
UI.tRow = el('div', 'mg-trow', null, UI.touch,
  '<div class="mg-tbtn" data-t="map">MAP</div><div class="mg-tbtn" data-t="colony">CRAFT</div>' +
  '<div class="mg-tbtn" data-t="journal">LOG</div><div class="mg-tbtn" data-t="cam">CAM</div>');
// fullscreen screens
UI.mapScreen = el('div', 'mg-map', 'mg-screen', root,
  '<h1>MARS · ORBITAL SURVEY</h1><div class="close">✕ CLOSE</div><div id="mg-map-wrap"><canvas id="mg-mapcanvas"></canvas><div id="mg-maplegend"></div></div>');
UI.colonyScreen = el('div', 'mg-colony2', 'mg-screen', root,
  '<h1>COLONY · INVENTORY & FABRICATION</h1><div class="close">✕ CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-inv"></div><div class="mg-col" id="mg-craft"></div><div class="mg-col" id="mg-build"></div></div>');
UI.journalScreen = el('div', 'mg-journal', 'mg-screen', root,
  '<h1>MISSION JOURNAL</h1><div class="close">✕ CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-quests"></div><div class="mg-col" id="mg-discoveries"></div><div class="mg-col" id="mg-achievements"></div></div>');
UI.mapCanvas = UI.mapScreen.querySelector('#mg-mapcanvas');

export function showOverlay(opts) {
  const btns = (opts.buttons || []).map((b, i) =>
    `<button data-i="${i}" class="${b.ghost ? 'ghost' : ''}">${b.label}</button>`).join('');
  UI.panel.innerHTML =
    (opts.title ? `<h1>${opts.title}</h1>` : '') +
    (opts.subtitle ? `<h2>${opts.subtitle}</h2>` : '') +
    `<div class="bd">${opts.body || ''}</div>` +
    (btns ? `<div class="btns">${btns}</div>` : '');
  UI.overlay.style.display = 'flex';
  S.uiOpen = true;
  try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
  UI.panel.querySelectorAll('button').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const b = opts.buttons[+btn.dataset.i];
      if (b.keep !== true) hideOverlay();
      b.fn && b.fn();
    };
  });
}
export function hideOverlay() { UI.overlay.style.display = 'none'; S.uiOpen = false; }

export let toastTimer = null;
export function toast(kicker, title, note) {
  UI.toast.innerHTML = `<div class="t1">${kicker}</div><div class="t2">${title}</div>` +
    (note ? `<div class="t3">${note}</div>` : '');
  UI.toast.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { UI.toast.style.display = 'none'; }, 6000);
}

export function log(text, cls) {
  const line = el('div', null, 'mg-line' + (cls ? ' ' + cls : ''), UI.log);
  let i = 0;
  const prefix = cls === 'nasa' ? '[NASA] ' : cls === 'sys' ? '[HAB] ' : cls === 'disc' ? '[SURVEY] ' : '[LOG] ';
  const full = prefix + text;
  const t = setInterval(() => {
    i += 2;
    line.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(t);
      setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 1400); }, 9500);
    }
  }, 16);
  while (UI.log.children.length > 5) UI.log.firstChild.remove();
}

export function flashScreen(color, ms) {
  UI.flash.style.background = color;
  UI.flash.style.opacity = 1;
  setTimeout(() => {
    UI.flash.style.transition = 'opacity .6s';
    UI.flash.style.opacity = 0;
    setTimeout(() => { UI.flash.style.transition = ''; }, 700);
  }, ms);
}
