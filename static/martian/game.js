/*
 * STRANDED II — A Martian Survival Game, planetary edition
 * Full-sphere Mars modeled on real geography. Random crash site. Explore everything.
 * Requires three.js r147 (UMD, global THREE). No other dependencies; all assets procedural.
 */
(() => {
'use strict';

if (typeof THREE === 'undefined') {
  document.body.innerHTML = '<div style="color:#fff;font-family:monospace;padding:40px">Failed to load three.js — the game cannot start.</div>';
  return;
}

// ============================================================
// 1. CSS / DOM / HUD SHELL
// ============================================================
const CSS = `
#mg-root, #mg-root * { box-sizing: border-box; margin: 0; padding: 0; }
#mg-root { position: fixed; inset: 0; background: #000; overflow: hidden;
  font-family: "Lucida Console", Monaco, "Courier New", monospace; color: #f2d8b8;
  -webkit-user-select: none; user-select: none; }
#mg-root canvas.mg-three { position: absolute; inset: 0; display: block; }
.mg-hud { position: absolute; pointer-events: none; }
#mg-vitals { left: 16px; top: 16px; width: 210px; }
.mg-bar { margin-bottom: 6px; font-size: 11px; letter-spacing: 1px; }
.mg-bar .lb { display: flex; justify-content: space-between; margin-bottom: 2px; text-shadow: 0 1px 2px #000; }
.mg-bar .tk { height: 7px; background: rgba(0,0,0,.55); border: 1px solid rgba(242,216,184,.35); }
.mg-bar .fl { height: 100%; transition: width .3s; }
.mg-bar.warn .fl { animation: mg-blink 1s infinite; }
@keyframes mg-blink { 50% { opacity: .35; } }
#mg-clock { right: 16px; top: 16px; text-align: right; font-size: 13px; letter-spacing: 1px;
  text-shadow: 0 1px 3px #000; line-height: 1.55; }
#mg-clock .sol { font-size: 22px; color: #ffb45e; }
#mg-compass { left: 50%; top: 12px; transform: translateX(-50%); width: 500px; height: 34px;
  overflow: hidden; border-bottom: 1px solid rgba(242,216,184,.25); }
.mg-cmark { position: absolute; top: 2px; transform: translateX(-50%); text-align: center;
  font-size: 10px; letter-spacing: 1px; text-shadow: 0 1px 2px #000; white-space: nowrap; }
.mg-cmark .ic { font-size: 13px; }
#mg-region { left: 50%; top: 50px; transform: translateX(-50%); font-size: 12px; letter-spacing: 4px;
  color: #ffcf9e; opacity: .8; text-shadow: 0 1px 3px #000; }
#mg-objectives { right: 16px; top: 92px; width: 260px; font-size: 11.5px; text-align: right; }
#mg-objectives .ttl { color: #ffb45e; letter-spacing: 2px; margin-bottom: 6px; text-shadow: 0 1px 2px #000; }
.mg-obj { margin-bottom: 5px; text-shadow: 0 1px 2px #000; line-height: 1.35; }
.mg-obj.done { color: #7fca7f; text-decoration: line-through; opacity: .7; }
.mg-obj.quest { color: #9ec8ff; }
#mg-keys { right: 16px; bottom: 12px; font-size: 10px; letter-spacing: 1px; opacity: .55;
  text-align: right; text-shadow: 0 1px 2px #000; line-height: 1.6; }
#mg-log { left: 16px; bottom: 16px; width: 470px; font-size: 12px; line-height: 1.45; }
.mg-line { margin-top: 6px; background: rgba(10,5,2,.55); padding: 6px 9px;
  border-left: 2px solid #ffb45e; opacity: 1; transition: opacity 1.2s; }
.mg-line.nasa { border-left-color: #6fb7ff; color: #cfe6ff; }
.mg-line.sys { border-left-color: #ff5f4f; color: #ffc9c2; }
.mg-line.disc { border-left-color: #d8b0ff; color: #ecdcff; }
.mg-line.fade { opacity: 0; }
#mg-prompt { left: 50%; bottom: 21%; transform: translateX(-50%); text-align: center;
  font-size: 14px; letter-spacing: 1px; text-shadow: 0 1px 3px #000; }
#mg-prompt .key { display: inline-block; border: 1px solid #f2d8b8; padding: 1px 7px;
  margin-right: 6px; border-radius: 3px; background: rgba(0,0,0,.5); }
#mg-prompt .sub { font-size: 11px; opacity: .75; margin-top: 4px; }
#mg-hold { width: 130px; height: 5px; margin: 7px auto 0; background: rgba(0,0,0,.6);
  border: 1px solid rgba(242,216,184,.4); display: none; }
#mg-hold .fl { height: 100%; width: 0%; background: #ffb45e; }
#mg-crosshair { left: 50%; top: 50%; transform: translate(-50%,-50%); font-size: 15px;
  opacity: .55; text-shadow: 0 1px 2px #000; }
#mg-vign { inset: 0; background: radial-gradient(ellipse at center, transparent 55%, rgba(120,0,0,.65) 100%);
  opacity: 0; transition: opacity .8s; }
#mg-cold { inset: 0; background: radial-gradient(ellipse at center, transparent 48%, rgba(80,140,255,.5) 100%);
  opacity: 0; transition: opacity 1.2s; }
#mg-flash { inset: 0; background: #fff; opacity: 0; }
#mg-toast { left: 50%; top: 88px; transform: translateX(-50%); text-align: center; display: none;
  background: rgba(20,8,30,.85); border: 1px solid #d8b0ff; padding: 10px 26px; }
#mg-toast .t1 { font-size: 10px; letter-spacing: 3px; color: #d8b0ff; }
#mg-toast .t2 { font-size: 16px; letter-spacing: 2px; margin-top: 3px; }
#mg-toast .t3 { font-size: 10.5px; opacity: .8; margin-top: 4px; max-width: 380px; }
#mg-overlay { position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
  background: rgba(8,3,1,.82); pointer-events: auto; z-index: 20; }
#mg-panel { max-width: 640px; width: 92%; max-height: 88vh; overflow-y: auto;
  border: 1px solid rgba(242,216,184,.4); background: rgba(16,8,4,.96); padding: 26px 30px; }
#mg-panel h1 { font-size: 26px; letter-spacing: 4px; color: #ffb45e; margin-bottom: 4px; }
#mg-panel h2 { font-size: 13px; letter-spacing: 2px; color: #c9a27c; margin-bottom: 16px; }
#mg-panel .bd { font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
#mg-panel .bd b { color: #ffb45e; }
#mg-panel .comms { font-size: 13px; line-height: 1.7; min-height: 160px; }
#mg-panel .comms .n { color: #6fb7ff; }
#mg-panel .comms .w { color: #f2d8b8; }
#mg-panel .btns { margin-top: 22px; display: flex; gap: 12px; flex-wrap: wrap; }
#mg-panel button, .mg-btn { font-family: inherit; font-size: 13px; letter-spacing: 2px; cursor: pointer;
  background: #ffb45e; color: #241105; border: 0; padding: 10px 22px; }
#mg-panel button.ghost, .mg-btn.ghost { background: transparent; color: #f2d8b8;
  border: 1px solid rgba(242,216,184,.5); }
#mg-panel button:hover, .mg-btn:hover { filter: brightness(1.15); }
#mg-panel .kbd, .mg-kbd { display: inline-block; border: 1px solid rgba(242,216,184,.5);
  padding: 0 6px; border-radius: 3px; margin: 0 2px; font-size: 12px; }
#mg-panel .diffrow { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
#mg-panel .diff { flex: 1 1 160px; border: 1px solid rgba(242,216,184,.35); padding: 12px;
  cursor: pointer; font-size: 11.5px; line-height: 1.5; }
#mg-panel .diff:hover { border-color: #ffb45e; background: rgba(255,180,94,.08); }
#mg-panel .diff .dn { color: #ffb45e; font-size: 13px; letter-spacing: 2px; margin-bottom: 6px; }
/* fullscreen screens: map / colony / journal */
.mg-screen { position: absolute; inset: 0; display: none; background: rgba(6,3,1,.94);
  z-index: 15; pointer-events: auto; padding: 22px 28px; overflow: hidden; }
.mg-screen h1 { font-size: 18px; letter-spacing: 4px; color: #ffb45e; margin-bottom: 10px; }
.mg-screen .close { position: absolute; right: 22px; top: 16px; font-size: 12px; opacity: .7; }
#mg-map-wrap { position: relative; width: 100%; height: calc(100% - 40px); display: flex;
  align-items: center; justify-content: center; }
#mg-mapcanvas { max-width: 100%; max-height: 100%; border: 1px solid rgba(242,216,184,.3);
  image-rendering: pixelated; }
#mg-maplegend { position: absolute; left: 8px; bottom: 6px; font-size: 10.5px; opacity: .8; line-height: 1.6; }
#mg-colony { display: none; }
.mg-cols { display: flex; gap: 26px; height: calc(100% - 40px); }
.mg-col { flex: 1; overflow-y: auto; font-size: 12px; line-height: 1.55; }
.mg-col h3 { color: #ffb45e; letter-spacing: 2px; font-size: 12px; margin: 14px 0 8px; }
.mg-item { display: flex; justify-content: space-between; padding: 3px 6px; }
.mg-item:nth-child(odd) { background: rgba(255,255,255,.03); }
.mg-recipe { border: 1px solid rgba(242,216,184,.25); padding: 8px 10px; margin-bottom: 8px; }
.mg-recipe .rn { color: #ffcf9e; }
.mg-recipe .rc { font-size: 11px; opacity: .8; margin: 3px 0 6px; }
.mg-recipe button { font-family: inherit; font-size: 11px; letter-spacing: 1px; cursor: pointer;
  background: #ffb45e; color: #241105; border: 0; padding: 4px 12px; }
.mg-recipe button:disabled { background: #5a4a38; color: #241105; cursor: default; }
.mg-jrow { padding: 5px 8px; border-left: 2px solid rgba(216,176,255,.5); margin-bottom: 6px;
  background: rgba(255,255,255,.025); }
.mg-jrow.locked { opacity: .38; border-left-color: rgba(255,255,255,.15); }
.mg-jrow .jn { color: #ecdcff; }
.mg-jrow .jd { font-size: 11px; opacity: .8; }
.mg-jrow.ach { border-left-color: rgba(255,180,94,.6); }
.mg-jrow.ach .jn { color: #ffcf9e; }
`;

const root = document.createElement('div');
root.id = 'mg-root';
document.body.appendChild(root);
const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

function el(tag, id, cls, parent, html) {
  const e = document.createElement(tag);
  if (id) e.id = id;
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  (parent || root).appendChild(e);
  return e;
}

const UI = {};
UI.vitals = el('div', 'mg-vitals', 'mg-hud');
const BARS = [
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
// fullscreen screens
UI.mapScreen = el('div', 'mg-map', 'mg-screen', root,
  '<h1>MARS · ORBITAL SURVEY</h1><div class="close">[M] close</div><div id="mg-map-wrap"><canvas id="mg-mapcanvas"></canvas><div id="mg-maplegend"></div></div>');
UI.colonyScreen = el('div', 'mg-colony2', 'mg-screen', root,
  '<h1>COLONY · INVENTORY & FABRICATION</h1><div class="close">[C] close</div><div class="mg-cols"><div class="mg-col" id="mg-inv"></div><div class="mg-col" id="mg-craft"></div><div class="mg-col" id="mg-build"></div></div>');
UI.journalScreen = el('div', 'mg-journal', 'mg-screen', root,
  '<h1>MISSION JOURNAL</h1><div class="close">[J] close</div><div class="mg-cols"><div class="mg-col" id="mg-quests"></div><div class="mg-col" id="mg-discoveries"></div><div class="mg-col" id="mg-achievements"></div></div>');
UI.mapCanvas = UI.mapScreen.querySelector('#mg-mapcanvas');

function showOverlay(opts) {
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
function hideOverlay() { UI.overlay.style.display = 'none'; S.uiOpen = false; }

let toastTimer = null;
function toast(kicker, title, note) {
  UI.toast.innerHTML = `<div class="t1">${kicker}</div><div class="t2">${title}</div>` +
    (note ? `<div class="t3">${note}</div>` : '');
  UI.toast.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { UI.toast.style.display = 'none'; }, 6000);
}

function log(text, cls) {
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

function flashScreen(color, ms) {
  UI.flash.style.background = color;
  UI.flash.style.opacity = 1;
  setTimeout(() => {
    UI.flash.style.transition = 'opacity .6s';
    UI.flash.style.opacity = 0;
    setTimeout(() => { UI.flash.style.transition = ''; }, 700);
  }, ms);
}

// ============================================================
// 2. UTILS
// ============================================================
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const perf = () => performance.now() / 1000;

let _seed = 1337;
function srand() { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; }

// Watney's log — sol-start lines (silence on unlisted sols)
const SOL_LOGS = {
  1: "Log, Sol 1. Storm hit. Crew evac'd. An antenna went through my bio-monitor, so the suit told everyone I was dead. Surprise: I'm not. I'm just... alone. On a planet.",
  2: "Sol 2. Did the math. Rations won't last to rescue. I'm going to have to science the sh*t out of this.",
  3: "Sol 3. Today's agenda: farming. On a planet where nothing grows. I am the greatest botanist on this planet.",
  4: "Sol 4. Fun fact: humanity has been littering Mars with robots since 1971. One of them can call home.",
  5: "Sol 5. Weather report: dust, followed by dust, with a chance of dust.",
  6: "Sol 6. The potatoes sprouted. I cried a little. Don't tell the potatoes.",
  7: "Sol 7. Something feels off today. On Mars, 'probably nothing' has a body count.",
  8: "Sol 8. Every day this planet tries to kill me, and every day I make it breakfast instead.",
  9: "Sol 9. More weather. My solar panels would like a word with this planet's management.",
  10: "Sol 10. Ten sols. The Hab smells like soil and victory. Mostly soil.",
  12: "Sol 12. Update: still the only person on an entire planet. The commute is unbeatable, though.",
  15: "Sol 15. I named a rock today. His name is Greg. This is fine.",
  20: "Sol 20. Told Greg about the potatoes. He was nonjudgmental, as usual.",
  25: "Sol 25. Halfway-ish. The potatoes and I have an understanding: I water them, they keep me alive, nobody mentions the eating part.",
  30: "Sol 30. I've driven further on Mars than I ever commuted on Earth. Insurance would NOT cover this.",
  35: "Sol 35. Mars sunsets are blue. The universe has a sense of irony and excellent taste.",
  40: "Sol 40. Soon. The word tastes like potatoes. Everything tastes like potatoes.",
  44: "Sol 44. One more sol. Packing my potato. Singular. It's symbolic.",
  59: "Sol 59. Tomorrow. Greg the rock is coming with me. Don't tell NASA about the mass budget.",
};

// 3D value noise (for terrain detail on the sphere) — integer-mix hash, fast & stable
function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967295;
}
function vnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const n000 = hash3(xi, yi, zi),     n100 = hash3(xi + 1, yi, zi);
  const n010 = hash3(xi, yi + 1, zi), n110 = hash3(xi + 1, yi + 1, zi);
  const n001 = hash3(xi, yi, zi + 1), n101 = hash3(xi + 1, yi, zi + 1);
  const n011 = hash3(xi, yi + 1, zi + 1), n111 = hash3(xi + 1, yi + 1, zi + 1);
  return lerp(
    lerp(lerp(n000, n100, u), lerp(n010, n110, u), v),
    lerp(lerp(n001, n101, u), lerp(n011, n111, u), v), w);
}

// ============================================================
// 3. AUDIO (WebAudio synthesis, all optional)
// ============================================================
const Snd = {
  ctx: null, master: null, windGain: null, rumbleGain: null,
  discoTimer: null, alarmTimer: null, _lastWind: -1, _lastRumble: -1,
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      const mk = (freq, type) => {
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const f = this.ctx.createBiquadFilter();
        f.type = type; f.frequency.value = freq; f.Q.value = 0.6;
        const g = this.ctx.createGain(); g.gain.value = 0;
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start();
        return g;
      };
      this.windGain = mk(260, 'bandpass');
      this.rumbleGain = mk(110, 'lowpass');
    } catch (e) { this.ctx = null; }
  },
  resume() { try { this.ctx && this.ctx.state === 'suspended' && this.ctx.resume(); } catch (e) {} },
  _ramp(gain, key, v, t) {
    if (!gain || Math.abs(v - this[key]) < 0.01) return;
    this[key] = v;
    try {
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + t);
    } catch (e) {}
  },
  wind(level) { this._ramp(this.windGain, '_lastWind', clamp(level, 0, 1) * 0.5, 0.6); },
  rumble(level) { this._ramp(this.rumbleGain, '_lastRumble', clamp(level, 0, 1), 0.3); },
  beep(freq, dur, type, vol) {
    if (!this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.18, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (dur || 0.15));
      o.connect(g); g.connect(this.master);
      o.start(); o.stop(this.ctx.currentTime + (dur || 0.15) + 0.02);
    } catch (e) {}
  },
  click() { this.beep(900, 0.05, 'square', 0.06); },
  ok() { this.beep(620, 0.09, 'sine', 0.14); setTimeout(() => this.beep(930, 0.14, 'sine', 0.14), 90); },
  pickup() { this.beep(500, 0.06, 'triangle', 0.14); setTimeout(() => this.beep(750, 0.08, 'triangle', 0.12), 70); },
  craft() { [392, 494, 587].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, 'triangle', 0.13), i * 90)); },
  jingle() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.22, 'triangle', 0.16), i * 130)); },
  discovery() { [659, 880, 1109, 1319].forEach((f, i) => setTimeout(() => this.beep(f, 0.3, 'sine', 0.13), i * 160)); },
  bad() { this.beep(220, 0.3, 'sawtooth', 0.16); },
  boom() {
    if (!this.ctx) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, this.ctx.currentTime);
      lp.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 1.1);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.9, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);
      src.connect(lp); lp.connect(g); g.connect(this.master);
      src.start(); src.stop(this.ctx.currentTime + 1.4);
    } catch (e) {}
  },
  alarm(on) {
    if (on && !this.alarmTimer) {
      const f = () => { this.beep(740, 0.18, 'square', 0.1); setTimeout(() => this.beep(520, 0.18, 'square', 0.1), 250); };
      f(); this.alarmTimer = setInterval(f, 900);
    } else if (!on && this.alarmTimer) {
      clearInterval(this.alarmTimer); this.alarmTimer = null;
    }
  },
  disco(on) {
    if (on && !this.discoTimer) {
      const bass = [110, 110, 147, 110, 165, 147, 110, 98];
      const lead = [440, 0, 523, 440, 0, 587, 523, 0];
      let step = 0;
      this.discoTimer = setInterval(() => {
        this.beep(bass[step % 8], 0.16, 'sawtooth', 0.09);
        if (lead[step % 8]) this.beep(lead[step % 8], 0.1, 'square', 0.045);
        if (step % 2 === 0) this.beep(60, 0.08, 'sine', 0.22);
        step++;
      }, 210);
    } else if (!on && this.discoTimer) {
      clearInterval(this.discoTimer); this.discoTimer = null;
    }
  },
};

// ============================================================
// 3b. BLENDER-BUILT ASSETS (generated by blender/build_assets.py)
// ============================================================
const MODELS_DATA = {"rover":[{"n":"chassis","c":[0.78,0.75,0.68],"p":[0,0,0],"v":[-1150,1800,1950,-1150,900,-1950,-1150,900,1950,-1150,1800,-1950,1150,900,-1950,-1150,900,-1950,1150,1800,-1950,1150,900,1950,1150,900,-1950,1150,1800,1950,-1150,900,1950,1150,900,1950,1150,900,-1950,-1150,900,1950,-1150,900,-1950,-1150,1800,-1950,1150,1800,1950,1150,1800,-1950,-1170,940,1970,-1170,780,-1970,-1170,780,1970,-1170,940,-1970,1170,780,-1970,-1170,780,-1970,1170,940,-1970,1170,780,1970,1170,780,-1970,1170,940,1970,-1170,780,1970,1170,780,1970,1170,780,-1970,-1170,780,1970,-1170,780,-1970,-1170,940,-1970,1170,940,1970,1170,940,-1970,-1000,2500,-200,-1000,1700,-1600,-1000,1700,-200,-1000,2500,-1600,1000,1700,-1600,-1000,1700,-1600,1000,2500,-1600,1000,1700,-200,1000,1700,-1600,1000,2500,-200,-1000,1700,-200,1000,1700,-200,1000,1700,-1600,-1000,1700,-200,-1000,1700,-1600,-1000,2500,-1600,1000,2500,-200,1000,2500,-1600,-1100,1400,-1400,-1100,1400,-1490,-1100,1355,-1478,1100,1400,-1400,1100,1355,-1478,1100,1400,-1490,1100,1400,-1490,-1100,1355,-1478,-1100,1400,-1490,-1100,1400,-1400,-1100,1355,-1478,-1100,1322,-1445,1100,1400,-1400,1100,1322,-1445,1100,1355,-1478,1100,1355,-1478,-1100,1322,-1445,-1100,1355,-1478,-1100,1400,-1400,-1100,1322,-1445,-1100,1310,-1400,1100,1400,-1400,1100,1310,-1400,1100,1322,-1445,1100,1322,-1445,-1100,1310,-1400,-1100,1322,-1445,-1100,1400,-1400,-1100,1310,-1400,-1100,1322,-1355,1100,1400,-1400,1100,1322,-1355,1100,1310,-1400,1100,1310,-1400,-1100,1322,-1355,-1100,1310,-1400,-1100,1400,-1400,-1100,1322,-1355,-1100,1355,-1322,1100,1400,-1400,1100,1355,-1322,1100,1322,-1355,1100,1322,-1355,-1100,1355,-1322,-1100,1322,-1355,-1100,1400,-1400,-1100,1355,-1322,-1100,1400,-1310,1100,1400,-1400,1100,1400,-1310,1100,1355,-1322,1100,1355,-1322,-1100,1400,-1310,-1100,1355,-1322,-1100,1400,-1400,-1100,1400,-1310,-1100,1445,-1322,1100,1400,-1400,1100,1445,-1322,1100,1400,-1310,1100,1400,-1310,-1100,1445,-1322,-1100,1400,-1310,-1100,1400,-1400,-1100,1445,-1322,-1100,1478,-1355,1100,1400,-1400,1100,1478,-1355,1100,1445,-1322,1100,1445,-1322,-1100,1478,-1355,-1100,1445,-1322,-1100,1400,-1400,-1100,1478,-1355,-1100,1490,-1400,1100,1400,-1400,1100,1490,-1400,1100,1478,-1355,1100,1478,-1355,-1100,1490,-1400,-1100,1478,-1355,-1100,1400,-1400,-1100,1490,-1400,-1100,1478,-1445,1100,1400,-1400,1100,1478,-1445,1100,1490,-1400,1100,1490,-1400,-1100,1478,-1445,-1100,1490,-1400,-1100,1400,-1400,-1100,1478,-1445,-1100,1445,-1478,1100,1400,-1400,1100,1445,-1478,1100,1478,-1445,1100,1478,-1445,-1100,1445,-1478,-1100,1478,-1445,-1100,1400,-1400,-1100,1445,-1478,-1100,1400,-1490,1100,1400,-1400,1100,1400,-1490,1100,1445,-1478,1100,1445,-1478,-1100,1400,-1490,-1100,1445,-1478,-1100,1400,1400,-1100,1400,1310,-1100,1355,1322,1100,1400,1400,1100,1355,1322,1100,1400,1310,1100,1400,1310,-1100,1355,1322,-1100,1400,1310,-1100,1400,1400,-1100,1355,1322,-1100,1322,1355,1100,1400,1400,1100,1322,1355,1100,1355,1322,1100,1355,1322,-1100,1322,1355,-1100,1355,1322,-1100,1400,1400,-1100,1322,1355,-1100,1310,1400,1100,1400,1400,1100,1310,1400,1100,1322,1355,1100,1322,1355,-1100,1310,1400,-1100,1322,1355,-1100,1400,1400,-1100,1310,1400,-1100,1322,1445,1100,1400,1400,1100,1322,1445,1100,1310,1400,1100,1310,1400,-1100,1322,1445,-1100,1310,1400,-1100,1400,1400,-1100,1322,1445,-1100,1355,1478,1100,1400,1400,1100,1355,1478,1100,1322,1445,1100,1322,1445,-1100,1355,1478,-1100,1322,1445,-1100,1400,1400,-1100,1355,1478,-1100,1400,1490,1100,1400,1400,1100,1400,1490,1100,1355,1478,1100,1355,1478,-1100,1400,1490,-1100,1355,1478,-1100,1400,1400,-1100,1400,1490,-1100,1445,1478,1100,1400,1400,1100,1445,1478,1100,1400,1490,1100,1400,1490,-1100,1445,1478,-1100,1400,1490,-1100,1400,1400,-1100,1445,1478,-1100,1478,1445,1100,1400,1400,1100,1478,1445,1100,1445,1478,1100,1445,1478,-1100,1478,1445,-1100,1445,1478,-1100,1400,1400,-1100,1478,1445,-1100,1490,1400,1100,1400,1400,1100,1490,1400,1100,1478,1445,1100,1478,1445,-1100,1490,1400,-1100,1478,1445,-1100,1400,1400,-1100,1490,1400,-1100,1478,1355,1100,1400,1400,1100,1478,1355,1100,1490,1400,1100,1490,1400,-1100,1478,1355,-1100,1490,1400,-1100,1400,1400,-1100,1478,1355,-1100,1445,1322,1100,1400,1400,1100,1445,1322,1100,1478,1355,1100,1478,1355,-1100,1445,1322,-1100,1478,1355,-1100,1400,1400,-1100,1445,1322,-1100,1400,1310,1100,1400,1400,1100,1400,1310,1100,1445,1322,1100,1445,1322,-1100,1400,1310,-1100,1445,1322,-1150,1800,1950,-1150,1800,-1950,-1150,900,-1950,-1150,1800,-1950,1150,1800,-1950,1150,900,-1950,1150,1800,-1950,1150,1800,1950,1150,900,1950,1150,1800,1950,-1150,1800,1950,-1150,900,1950,1150,900,-1950,1150,900,1950,-1150,900,1950,-1150,1800,-1950,-1150,1800,1950,1150,1800,1950,-1170,940,1970,-1170,940,-1970,-1170,780,-1970,-1170,940,-1970,1170,940,-1970,1170,780,-1970,1170,940,-1970,1170,940,1970,1170,780,1970,1170,940,1970,-1170,940,1970,-1170,780,1970,1170,780,-1970,1170,780,1970,-1170,780,1970,-1170,940,-1970,-1170,940,1970,1170,940,1970,-1000,2500,-200,-1000,2500,-1600,-1000,1700,-1600,-1000,2500,-1600,1000,2500,-1600,1000,1700,-1600,1000,2500,-1600,1000,2500,-200,1000,1700,-200,1000,2500,-200,-1000,2500,-200,-1000,1700,-200,1000,1700,-1600,1000,1700,-200,-1000,1700,-200,-1000,2500,-1600,-1000,2500,-200,1000,2500,-200,1100,1400,-1490,1100,1355,-1478,-1100,1355,-1478,1100,1355,-1478,1100,1322,-1445,-1100,1322,-1445,1100,1322,-1445,1100,1310,-1400,-1100,1310,-1400,1100,1310,-1400,1100,1322,-1355,-1100,1322,-1355,1100,1322,-1355,1100,1355,-1322,-1100,1355,-1322,1100,1355,-1322,1100,1400,-1310,-1100,1400,-1310,1100,1400,-1310,1100,1445,-1322,-1100,1445,-1322,1100,1445,-1322,1100,1478,-1355,-1100,1478,-1355,1100,1478,-1355,1100,1490,-1400,-1100,1490,-1400,1100,1490,-1400,1100,1478,-1445,-1100,1478,-1445,1100,1478,-1445,1100,1445,-1478,-1100,1445,-1478,1100,1445,-1478,1100,1400,-1490,-1100,1400,-1490,1100,1400,1310,1100,1355,1322,-1100,1355,1322,1100,1355,1322,1100,1322,1355,-1100,1322,1355,1100,1322,1355,1100,1310,1400,-1100,1310,1400,1100,1310,1400,1100,1322,1445,-1100,1322,1445,1100,1322,1445,1100,1355,1478,-1100,1355,1478,1100,1355,1478,1100,1400,1490,-1100,1400,1490,1100,1400,1490,1100,1445,1478,-1100,1445,1478,1100,1445,1478,1100,1478,1445,-1100,1478,1445,1100,1478,1445,1100,1490,1400,-1100,1490,1400,1100,1490,1400,1100,1478,1355,-1100,1478,1355,1100,1478,1355,1100,1445,1322,-1100,1445,1322,1100,1445,1322,1100,1400,1310,-1100,1400,1310]},{"n":"stripe","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[-1160,1810,-850,-1160,890,-1350,-1160,890,-850,-1160,1810,-1350,1160,890,-1350,-1160,890,-1350,1160,1810,-1350,1160,890,-850,1160,890,-1350,1160,1810,-850,-1160,890,-850,1160,890,-850,1160,890,-1350,-1160,890,-850,-1160,890,-1350,-1160,1810,-1350,1160,1810,-850,1160,1810,-1350,-900,1860,1960,-900,1800,-1960,-900,1800,1960,-900,1860,-1960,-500,1800,-1960,-900,1800,-1960,-500,1860,-1960,-500,1800,1960,-500,1800,-1960,-500,1860,1960,-900,1800,1960,-500,1800,1960,-500,1800,-1960,-900,1800,1960,-900,1800,-1960,-900,1860,-1960,-500,1860,1960,-500,1860,-1960,-1160,1810,-850,-1160,1810,-1350,-1160,890,-1350,-1160,1810,-1350,1160,1810,-1350,1160,890,-1350,1160,1810,-1350,1160,1810,-850,1160,890,-850,1160,1810,-850,-1160,1810,-850,-1160,890,-850,1160,890,-1350,1160,890,-850,-1160,890,-850,-1160,1810,-1350,-1160,1810,-850,1160,1810,-850,-900,1860,1960,-900,1860,-1960,-900,1800,-1960,-900,1860,-1960,-500,1860,-1960,-500,1800,-1960,-500,1860,-1960,-500,1860,1960,-500,1800,1960,-500,1860,1960,-900,1860,1960,-900,1800,1960,-500,1800,-1960,-500,1800,1960,-900,1800,1960,-900,1860,-1960,-900,1860,1960,-500,1860,1960]},{"n":"cab","c":[0.6,0.72,0.78],"p":[0,0,0],"v":[-950,2725,1800,-950,1775,300,-950,1775,1800,-950,2725,300,950,1775,300,-950,1775,300,950,2725,300,950,1775,1800,950,1775,300,950,2725,1800,-950,1775,1800,950,1775,1800,950,1775,300,-950,1775,1800,-950,1775,300,-950,2725,300,950,2725,1800,950,2725,300,-950,2725,1800,-950,2725,300,-950,1775,300,-950,2725,300,950,2725,300,950,1775,300,950,2725,300,950,2725,1800,950,1775,1800,950,2725,1800,-950,2725,1800,-950,1775,1800,950,1775,300,950,1775,1800,-950,1775,1800,-950,2725,300,-950,2725,1800,950,2725,1800],"o":0.55},{"n":"cabframe","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[-1000,2840,1850,-1000,2720,250,-1000,2720,1850,-1000,2840,250,1000,2720,250,-1000,2720,250,1000,2840,250,1000,2720,1850,1000,2720,250,1000,2840,1850,-1000,2720,1850,1000,2720,1850,1000,2720,250,-1000,2720,1850,-1000,2720,250,-1000,2840,250,1000,2840,1850,1000,2840,250,-1000,2750,1890,-1000,1750,1750,-1000,1750,1890,-1000,2750,1750,1000,1750,1750,-1000,1750,1750,1000,2750,1750,1000,1750,1890,1000,1750,1750,1000,2750,1890,-1000,1750,1890,1000,1750,1890,1000,1750,1750,-1000,1750,1890,-1000,1750,1750,-1000,2750,1750,1000,2750,1890,1000,2750,1750,-1000,2840,1850,-1000,2840,250,-1000,2720,250,-1000,2840,250,1000,2840,250,1000,2720,250,1000,2840,250,1000,2840,1850,1000,2720,1850,1000,2840,1850,-1000,2840,1850,-1000,2720,1850,1000,2720,250,1000,2720,1850,-1000,2720,1850,-1000,2840,250,-1000,2840,1850,1000,2840,1850,-1000,2750,1890,-1000,2750,1750,-1000,1750,1750,-1000,2750,1750,1000,2750,1750,1000,1750,1750,1000,2750,1750,1000,2750,1890,1000,1750,1890,1000,2750,1890,-1000,2750,1890,-1000,1750,1890,1000,1750,1750,1000,1750,1890,-1000,1750,1890,-1000,2750,1750,-1000,2750,1890,1000,2750,1890]},{"n":"wheel0","c":[0.16,0.16,0.17],"p":[-1350,620,1500],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"wheel1","c":[0.16,0.16,0.17],"p":[1350,620,1500],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"wheel2","c":[0.16,0.16,0.17],"p":[-1350,620,0],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"wheel3","c":[0.16,0.16,0.17],"p":[1350,620,0],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"wheel4","c":[0.16,0.16,0.17],"p":[-1350,620,-1500],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"wheel5","c":[0.16,0.16,0.17],"p":[1350,620,-1500],"v":[-250,0,0,-250,0,-600,-250,-260,-541,250,0,0,250,-260,-541,250,0,-600,-250,0,-600,250,-260,-541,-250,-260,-541,-250,0,0,-250,-260,-541,-250,-469,-374,250,0,0,250,-469,-374,250,-260,-541,-250,-260,-541,250,-469,-374,-250,-469,-374,-250,0,0,-250,-469,-374,-250,-585,-134,250,0,0,250,-585,-134,250,-469,-374,-250,-469,-374,250,-585,-134,-250,-585,-134,-250,0,0,-250,-585,-134,-250,-585,134,250,0,0,250,-585,134,250,-585,-134,250,-585,-134,-250,-585,134,-250,-585,-134,-250,0,0,-250,-585,134,-250,-469,374,250,0,0,250,-469,374,250,-585,134,250,-585,134,-250,-469,374,-250,-585,134,-250,0,0,-250,-469,374,-250,-260,541,250,0,0,250,-260,541,250,-469,374,250,-469,374,-250,-260,541,-250,-469,374,-250,0,0,-250,-260,541,-250,0,600,250,0,0,250,0,600,250,-260,541,250,-260,541,-250,0,600,-250,-260,541,-250,0,0,-250,0,600,-250,260,541,250,0,0,250,260,541,250,0,600,250,0,600,-250,260,541,-250,0,600,-250,0,0,-250,260,541,-250,469,374,250,0,0,250,469,374,250,260,541,250,260,541,-250,469,374,-250,260,541,-250,0,0,-250,469,374,-250,585,134,250,0,0,250,585,134,250,469,374,250,469,374,-250,585,134,-250,469,374,-250,0,0,-250,585,134,-250,585,-134,250,0,0,250,585,-134,250,585,134,250,585,134,-250,585,-134,-250,585,134,-250,0,0,-250,585,-134,-250,469,-374,250,0,0,250,469,-374,250,585,-134,250,585,-134,-250,469,-374,-250,585,-134,-250,0,0,-250,469,-374,-250,260,-541,250,0,0,250,260,-541,250,469,-374,250,469,-374,-250,260,-541,-250,469,-374,-250,0,0,-250,260,-541,-250,0,-600,250,0,0,250,0,-600,250,260,-541,250,260,-541,-250,0,-600,-250,260,-541,-270,0,0,-270,0,-340,-270,-240,-240,270,0,0,270,-240,-240,270,0,-340,270,0,-340,-270,-240,-240,-270,0,-340,-270,0,0,-270,-240,-240,-270,-340,0,270,0,0,270,-340,0,270,-240,-240,270,-240,-240,-270,-340,0,-270,-240,-240,-270,0,0,-270,-340,0,-270,-240,240,270,0,0,270,-240,240,270,-340,0,270,-340,0,-270,-240,240,-270,-340,0,-270,0,0,-270,-240,240,-270,0,340,270,0,0,270,0,340,270,-240,240,-270,-240,240,270,0,340,-270,0,340,-270,0,0,-270,0,340,-270,240,240,270,0,0,270,240,240,270,0,340,-270,0,340,270,240,240,-270,240,240,-270,0,0,-270,240,240,-270,340,0,270,0,0,270,340,0,270,240,240,270,240,240,-270,340,0,-270,240,240,-270,0,0,-270,340,0,-270,240,-240,270,0,0,270,240,-240,270,340,0,270,340,0,-270,240,-240,-270,340,0,-270,0,0,-270,240,-240,-270,0,-340,270,0,0,270,0,-340,270,240,-240,270,240,-240,-270,0,-340,-270,240,-240,-250,0,-600,250,0,-600,250,-260,-541,-250,-260,-541,250,-260,-541,250,-469,-374,-250,-469,-374,250,-469,-374,250,-585,-134,250,-585,-134,250,-585,134,-250,-585,134,250,-585,134,250,-469,374,-250,-469,374,250,-469,374,250,-260,541,-250,-260,541,250,-260,541,250,0,600,-250,0,600,250,0,600,250,260,541,-250,260,541,250,260,541,250,469,374,-250,469,374,250,469,374,250,585,134,-250,585,134,250,585,134,250,585,-134,-250,585,-134,250,585,-134,250,469,-374,-250,469,-374,250,469,-374,250,260,-541,-250,260,-541,250,260,-541,250,0,-600,-250,0,-600,270,0,-340,270,-240,-240,-270,-240,-240,270,-240,-240,270,-340,0,-270,-340,0,270,-340,0,270,-240,240,-270,-240,240,-270,-240,240,270,-240,240,270,0,340,-270,0,340,270,0,340,270,240,240,270,240,240,270,340,0,-270,340,0,270,340,0,270,240,-240,-270,240,-240,270,240,-240,270,0,-340,-270,0,-340]},{"n":"antenna","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[850,2600,-500,850,2600,-530,865,2600,-526,850,4200,-500,865,4200,-526,850,4200,-530,850,4200,-530,865,2600,-526,850,2600,-530,850,2600,-500,865,2600,-526,876,2600,-515,850,4200,-500,876,4200,-515,865,4200,-526,865,4200,-526,876,2600,-515,865,2600,-526,850,2600,-500,876,2600,-515,880,2600,-500,850,4200,-500,880,4200,-500,876,4200,-515,876,4200,-515,880,2600,-500,876,2600,-515,850,2600,-500,880,2600,-500,876,2600,-485,850,4200,-500,876,4200,-485,880,4200,-500,880,4200,-500,876,2600,-485,880,2600,-500,850,2600,-500,876,2600,-485,865,2600,-474,850,4200,-500,865,4200,-474,876,4200,-485,876,4200,-485,865,2600,-474,876,2600,-485,850,2600,-500,865,2600,-474,850,2600,-470,850,4200,-500,850,4200,-470,865,4200,-474,865,4200,-474,850,2600,-470,865,2600,-474,850,2600,-500,850,2600,-470,835,2600,-474,850,4200,-500,835,4200,-474,850,4200,-470,850,4200,-470,835,2600,-474,850,2600,-470,850,2600,-500,835,2600,-474,824,2600,-485,850,4200,-500,824,4200,-485,835,4200,-474,835,4200,-474,824,2600,-485,835,2600,-474,850,2600,-500,824,2600,-485,820,2600,-500,850,4200,-500,820,4200,-500,824,4200,-485,824,4200,-485,820,2600,-500,824,2600,-485,850,2600,-500,820,2600,-500,824,2600,-515,850,4200,-500,824,4200,-515,820,4200,-500,820,4200,-500,824,2600,-515,820,2600,-500,850,2600,-500,824,2600,-515,835,2600,-526,850,4200,-500,835,4200,-526,824,4200,-515,824,4200,-515,835,2600,-526,824,2600,-515,850,2600,-500,835,2600,-526,850,2600,-530,850,4200,-500,850,4200,-530,835,4200,-526,835,4200,-526,850,2600,-530,835,2600,-526,850,4117,-534,887,4136,-551,870,4117,-528,850,4166,-583,903,4200,-573,899,4166,-567,850,4264,-564,899,4234,-567,850,4234,-583,850,4283,-534,850,4290,-500,870,4283,-528,850,4110,-500,850,4117,-534,870,4117,-528,850,4166,-583,887,4136,-551,850,4136,-564,850,4234,-583,903,4200,-573,850,4200,-590,850,4283,-534,887,4264,-551,850,4264,-564,850,4110,-500,870,4117,-528,883,4117,-511,899,4166,-567,911,4136,-520,887,4136,-551,899,4234,-567,936,4200,-528,903,4200,-573,870,4283,-528,911,4264,-520,887,4264,-551,870,4117,-528,911,4136,-520,883,4117,-511,899,4166,-567,936,4200,-528,929,4166,-526,899,4234,-567,911,4264,-520,929,4234,-526,870,4283,-528,850,4290,-500,883,4283,-511,929,4234,-526,936,4200,-472,936,4200,-528,911,4264,-520,883,4283,-489,911,4264,-480,911,4136,-520,883,4117,-489,883,4117,-511,929,4166,-526,936,4200,-472,929,4166,-474,929,4234,-526,911,4264,-480,929,4234,-474,883,4283,-511,850,4290,-500,883,4283,-489,850,4110,-500,883,4117,-511,883,4117,-489,929,4166,-526,911,4136,-480,911,4136,-520,911,4136,-480,870,4117,-472,883,4117,-489,929,4166,-474,903,4200,-427,899,4166,-433,911,4264,-480,899,4234,-433,929,4234,-474,883,4283,-489,850,4290,-500,870,4283,-472,850,4110,-500,883,4117,-489,870,4117,-472,929,4166,-474,887,4136,-449,911,4136,-480,929,4234,-474,903,4200,-427,936,4200,-472,883,4283,-489,887,4264,-449,911,4264,-480,887,4264,-449,850,4234,-417,899,4234,-433,870,4283,-472,850,4290,-500,850,4283,-466,850,4110,-500,870,4117,-472,850,4117,-466,899,4166,-433,850,4136,-436,887,4136,-449,899,4234,-433,850,4200,-410,903,4200,-427,887,4264,-449,850,4283,-466,850,4264,-436,887,4136,-449,850,4117,-466,870,4117,-472,903,4200,-427,850,4166,-417,899,4166,-433,850,4110,-500,850,4117,-466,830,4117,-472,850,4166,-417,813,4136,-449,850,4136,-436,850,4234,-417,797,4200,-427,850,4200,-410,850,4283,-466,813,4264,-449,850,4264,-436,850,4117,-466,813,4136,-449,830,4117,-472,850,4200,-410,801,4166,-433,850,4166,-417,850,4264,-436,801,4234,-433,850,4234,-417,850,4283,-466,850,4290,-500,830,4283,-472,830,4283,-472,789,4264,-480,813,4264,-449,830,4117,-472,789,4136,-480,817,4117,-489,801,4166,-433,764,4200,-472,771,4166,-474,801,4234,-433,789,4264,-480,771,4234,-474,830,4283,-472,850,4290,-500,817,4283,-489,850,4110,-500,830,4117,-472,817,4117,-489,801,4166,-433,789,4136,-480,813,4136,-449,801,4234,-433,764,4200,-472,797,4200,-427,789,4136,-480,817,4117,-511,817,4117,-489,771,4166,-474,764,4200,-528,771,4166,-526,789,4264,-480,771,4234,-526,771,4234,-474,817,4283,-489,850,4290,-500,817,4283,-511,850,4110,-500,817,4117,-489,817,4117,-511,771,4166,-474,789,4136,-520,789,4136,-480,771,4234,-474,764,4200,-528,764,4200,-472,789,4264,-480,817,4283,-511,789,4264,-520,817,4283,-511,850,4290,-500,830,4283,-528,850,4110,-500,817,4117,-511,830,4117,-528,789,4136,-520,801,4166,-567,813,4136,-551,764,4200,-528,801,4234,-567,797,4200,-573,789,4264,-520,830,4283,-528,813,4264,-551,789,4136,-520,830,4117,-528,817,4117,-511,764,4200,-528,801,4166,-567,771,4166,-526,789,4264,-520,801,4234,-567,771,4234,-526,801,4166,-567,850,4136,-564,813,4136,-551,797,4200,-573,850,4234,-583,850,4200,-590,830,4283,-528,850,4264,-564,813,4264,-551,830,4117,-528,850,4136,-564,850,4117,-534,797,4200,-573,850,4166,-583,801,4166,-567,813,4264,-551,850,4234,-583,801,4234,-567,830,4283,-528,850,4290,-500,850,4283,-534,850,4110,-500,830,4117,-528,850,4117,-534,-700,2850,1500,-700,2850,1160,-500,2850,1225,-700,3150,1500,-688,3150,1484,-700,3150,1480,-700,3150,1480,-500,2850,1225,-700,2850,1160,-700,2850,1500,-500,2850,1225,-377,2850,1395,-700,3150,1500,-681,3150,1494,-688,3150,1484,-500,2850,1225,-681,3150,1494,-377,2850,1395,-700,2850,1500,-377,2850,1395,-377,2850,1605,-700,3150,1500,-681,3150,1506,-681,3150,1494,-681,3150,1494,-377,2850,1605,-377,2850,1395,-700,2850,1500,-377,2850,1605,-500,2850,1775,-700,3150,1500,-688,3150,1516,-681,3150,1506,-681,3150,1506,-500,2850,1775,-377,2850,1605,-700,2850,1500,-500,2850,1775,-700,2850,1840,-700,3150,1500,-700,3150,1520,-688,3150,1516,-688,3150,1516,-700,2850,1840,-500,2850,1775,-700,2850,1500,-700,2850,1840,-900,2850,1775,-700,3150,1500,-712,3150,1516,-700,3150,1520,-700,3150,1520,-900,2850,1775,-700,2850,1840,-700,2850,1500,-900,2850,1775,-1023,2850,1605,-700,3150,1500,-719,3150,1506,-712,3150,1516,-712,3150,1516,-1023,2850,1605,-900,2850,1775,-700,2850,1500,-1023,2850,1605,-1023,2850,1395,-700,3150,1500,-719,3150,1494,-719,3150,1506,-719,3150,1506,-1023,2850,1395,-1023,2850,1605,-700,2850,1500,-1023,2850,1395,-900,2850,1225,-700,3150,1500,-712,3150,1484,-719,3150,1494,-719,3150,1494,-900,2850,1225,-1023,2850,1395,-700,2850,1500,-900,2850,1225,-700,2850,1160,-700,3150,1500,-700,3150,1480,-712,3150,1484,-900,2850,1225,-700,3150,1480,-700,2850,1160,700,2850,1500,700,2850,1160,900,2850,1225,700,3150,1500,712,3150,1484,700,3150,1480,700,3150,1480,900,2850,1225,700,2850,1160,700,2850,1500,900,2850,1225,1023,2850,1395,700,3150,1500,719,3150,1494,712,3150,1484,900,2850,1225,719,3150,1494,1023,2850,1395,700,2850,1500,1023,2850,1395,1023,2850,1605,700,3150,1500,719,3150,1506,719,3150,1494,719,3150,1494,1023,2850,1605,1023,2850,1395,700,2850,1500,1023,2850,1605,900,2850,1775,700,3150,1500,712,3150,1516,719,3150,1506,1023,2850,1605,712,3150,1516,900,2850,1775,700,2850,1500,900,2850,1775,700,2850,1840,700,3150,1500,700,3150,1520,712,3150,1516,900,2850,1775,700,3150,1520,700,2850,1840,700,2850,1500,700,2850,1840,500,2850,1775,700,3150,1500,688,3150,1516,700,3150,1520,700,3150,1520,500,2850,1775,700,2850,1840,700,2850,1500,500,2850,1775,377,2850,1605,700,3150,1500,681,3150,1506,688,3150,1516,688,3150,1516,377,2850,1605,500,2850,1775,700,2850,1500,377,2850,1605,377,2850,1395,700,3150,1500,681,3150,1494,681,3150,1506,681,3150,1506,377,2850,1395,377,2850,1605,700,2850,1500,377,2850,1395,500,2850,1225,700,3150,1500,688,3150,1484,681,3150,1494,681,3150,1494,500,2850,1225,377,2850,1395,700,2850,1500,500,2850,1225,700,2850,1160,700,3150,1500,700,3150,1480,688,3150,1484,688,3150,1484,700,2850,1160,500,2850,1225,850,4200,-530,865,4200,-526,865,2600,-526,865,4200,-526,876,4200,-515,876,2600,-515,876,4200,-515,880,4200,-500,880,2600,-500,880,4200,-500,876,4200,-485,876,2600,-485,876,4200,-485,865,4200,-474,865,2600,-474,865,4200,-474,850,4200,-470,850,2600,-470,850,4200,-470,835,4200,-474,835,2600,-474,835,4200,-474,824,4200,-485,824,2600,-485,824,4200,-485,820,4200,-500,820,2600,-500,820,4200,-500,824,4200,-515,824,2600,-515,824,4200,-515,835,4200,-526,835,2600,-526,835,4200,-526,850,4200,-530,850,2600,-530,850,4117,-534,850,4136,-564,887,4136,-551,850,4166,-583,850,4200,-590,903,4200,-573,850,4264,-564,887,4264,-551,899,4234,-567,850,4166,-583,899,4166,-567,887,4136,-551,850,4234,-583,899,4234,-567,903,4200,-573,850,4283,-534,870,4283,-528,887,4264,-551,899,4166,-567,929,4166,-526,911,4136,-520,899,4234,-567,929,4234,-526,936,4200,-528,870,4283,-528,883,4283,-511,911,4264,-520,870,4117,-528,887,4136,-551,911,4136,-520,899,4166,-567,903,4200,-573,936,4200,-528,899,4234,-567,887,4264,-551,911,4264,-520,929,4234,-526,929,4234,-474,936,4200,-472,911,4264,-520,883,4283,-511,883,4283,-489,911,4136,-520,911,4136,-480,883,4117,-489,929,4166,-526,936,4200,-528,936,4200,-472,929,4234,-526,911,4264,-520,911,4264,-480,929,4166,-526,929,4166,-474,911,4136,-480,911,4136,-480,887,4136,-449,870,4117,-472,929,4166,-474,936,4200,-472,903,4200,-427,911,4264,-480,887,4264,-449,899,4234,-433,929,4166,-474,899,4166,-433,887,4136,-449,929,4234,-474,899,4234,-433,903,4200,-427,883,4283,-489,870,4283,-472,887,4264,-449,887,4264,-449,850,4264,-436,850,4234,-417,899,4166,-433,850,4166,-417,850,4136,-436,899,4234,-433,850,4234,-417,850,4200,-410,887,4264,-449,870,4283,-472,850,4283,-466,887,4136,-449,850,4136,-436,850,4117,-466,903,4200,-427,850,4200,-410,850,4166,-417,850,4166,-417,801,4166,-433,813,4136,-449,850,4234,-417,801,4234,-433,797,4200,-427,850,4283,-466,830,4283,-472,813,4264,-449,850,4117,-466,850,4136,-436,813,4136,-449,850,4200,-410,797,4200,-427,801,4166,-433,850,4264,-436,813,4264,-449,801,4234,-433,830,4283,-472,817,4283,-489,789,4264,-480,830,4117,-472,813,4136,-449,789,4136,-480,801,4166,-433,797,4200,-427,764,4200,-472,801,4234,-433,813,4264,-449,789,4264,-480,801,4166,-433,771,4166,-474,789,4136,-480,801,4234,-433,771,4234,-474,764,4200,-472,789,4136,-480,789,4136,-520,817,4117,-511,771,4166,-474,764,4200,-472,764,4200,-528,789,4264,-480,789,4264,-520,771,4234,-526,771,4166,-474,771,4166,-526,789,4136,-520,771,4234,-474,771,4234,-526,764,4200,-528,789,4264,-480,817,4283,-489,817,4283,-511,789,4136,-520,771,4166,-526,801,4166,-567,764,4200,-528,771,4234,-526,801,4234,-567,789,4264,-520,817,4283,-511,830,4283,-528,789,4136,-520,813,4136,-551,830,4117,-528,764,4200,-528,797,4200,-573,801,4166,-567,789,4264,-520,813,4264,-551,801,4234,-567,801,4166,-567,850,4166,-583,850,4136,-564,797,4200,-573,801,4234,-567,850,4234,-583,830,4283,-528,850,4283,-534,850,4264,-564,830,4117,-528,813,4136,-551,850,4136,-564,797,4200,-573,850,4200,-590,850,4166,-583,813,4264,-551,850,4264,-564,850,4234,-583,-700,3150,1480,-688,3150,1484,-500,2850,1225,-500,2850,1225,-688,3150,1484,-681,3150,1494,-681,3150,1494,-681,3150,1506,-377,2850,1605,-681,3150,1506,-688,3150,1516,-500,2850,1775,-688,3150,1516,-700,3150,1520,-700,2850,1840,-700,3150,1520,-712,3150,1516,-900,2850,1775,-712,3150,1516,-719,3150,1506,-1023,2850,1605,-719,3150,1506,-719,3150,1494,-1023,2850,1395,-719,3150,1494,-712,3150,1484,-900,2850,1225,-900,2850,1225,-712,3150,1484,-700,3150,1480,700,3150,1480,712,3150,1484,900,2850,1225,900,2850,1225,712,3150,1484,719,3150,1494,719,3150,1494,719,3150,1506,1023,2850,1605,1023,2850,1605,719,3150,1506,712,3150,1516,900,2850,1775,712,3150,1516,700,3150,1520,700,3150,1520,688,3150,1516,500,2850,1775,688,3150,1516,681,3150,1506,377,2850,1605,681,3150,1506,681,3150,1494,377,2850,1395,681,3150,1494,688,3150,1484,500,2850,1225,688,3150,1484,700,3150,1480,700,2850,1160]},{"n":"dish","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[-800,2966,-971,-800,3236,-1292,-590,3200,-1249,-800,3134,-829,-770,3168,-869,-800,3173,-875,-800,3236,-1292,-770,3168,-869,-590,3200,-1249,-800,2966,-971,-590,3200,-1249,-436,3101,-1131,-800,3134,-829,-748,3153,-852,-770,3168,-869,-770,3168,-869,-436,3101,-1131,-590,3200,-1249,-800,2966,-971,-436,3101,-1131,-380,2966,-971,-800,3134,-829,-740,3134,-829,-748,3153,-852,-748,3153,-852,-380,2966,-971,-436,3101,-1131,-800,2966,-971,-380,2966,-971,-436,2831,-810,-800,3134,-829,-748,3115,-806,-740,3134,-829,-740,3134,-829,-436,2831,-810,-380,2966,-971,-800,2966,-971,-436,2831,-810,-590,2732,-693,-800,3134,-829,-770,3101,-789,-748,3115,-806,-436,2831,-810,-770,3101,-789,-590,2732,-693,-800,2966,-971,-590,2732,-693,-800,2695,-650,-800,3134,-829,-800,3095,-783,-770,3101,-789,-590,2732,-693,-800,3095,-783,-800,2695,-650,-800,2966,-971,-800,2695,-650,-1010,2732,-693,-800,3134,-829,-830,3101,-789,-800,3095,-783,-800,2695,-650,-830,3101,-789,-1010,2732,-693,-800,2966,-971,-1010,2732,-693,-1164,2831,-810,-800,3134,-829,-852,3115,-806,-830,3101,-789,-830,3101,-789,-1164,2831,-810,-1010,2732,-693,-800,2966,-971,-1164,2831,-810,-1220,2966,-971,-800,3134,-829,-860,3134,-829,-852,3115,-806,-1164,2831,-810,-860,3134,-829,-1220,2966,-971,-800,2966,-971,-1220,2966,-971,-1164,3101,-1131,-800,3134,-829,-852,3153,-852,-860,3134,-829,-860,3134,-829,-1164,3101,-1131,-1220,2966,-971,-800,2966,-971,-1164,3101,-1131,-1010,3200,-1249,-800,3134,-829,-830,3168,-869,-852,3153,-852,-852,3153,-852,-1010,3200,-1249,-1164,3101,-1131,-800,2966,-971,-1010,3200,-1249,-800,3236,-1292,-800,3134,-829,-800,3173,-875,-830,3168,-869,-1010,3200,-1249,-800,3173,-875,-800,3236,-1292,-800,3236,-1292,-800,3173,-875,-770,3168,-869,-770,3168,-869,-748,3153,-852,-436,3101,-1131,-748,3153,-852,-740,3134,-829,-380,2966,-971,-740,3134,-829,-748,3115,-806,-436,2831,-810,-436,2831,-810,-748,3115,-806,-770,3101,-789,-590,2732,-693,-770,3101,-789,-800,3095,-783,-800,2695,-650,-800,3095,-783,-830,3101,-789,-830,3101,-789,-852,3115,-806,-1164,2831,-810,-1164,2831,-810,-852,3115,-806,-860,3134,-829,-860,3134,-829,-852,3153,-852,-1164,3101,-1131,-852,3153,-852,-830,3168,-869,-1010,3200,-1249,-1010,3200,-1249,-830,3168,-869,-800,3173,-875]}],"mav":[{"n":"engines","c":[0.28,0.29,0.31],"p":[0,0,0],"v":[0,200,0,0,200,-1350,675,200,-1169,0,1300,0,525,1300,-909,0,1300,-1050,0,1300,-1050,675,200,-1169,0,200,-1350,0,200,0,675,200,-1169,1169,200,-675,0,1300,0,909,1300,-525,525,1300,-909,525,1300,-909,1169,200,-675,675,200,-1169,0,200,0,1169,200,-675,1350,200,0,0,1300,0,1050,1300,0,909,1300,-525,909,1300,-525,1350,200,0,1169,200,-675,0,200,0,1350,200,0,1169,200,675,0,1300,0,909,1300,525,1050,1300,0,1050,1300,0,1169,200,675,1350,200,0,0,200,0,1169,200,675,675,200,1169,0,1300,0,525,1300,909,909,1300,525,909,1300,525,675,200,1169,1169,200,675,0,200,0,675,200,1169,0,200,1350,0,1300,0,0,1300,1050,525,1300,909,525,1300,909,0,200,1350,675,200,1169,0,200,0,0,200,1350,-675,200,1169,0,1300,0,-525,1300,909,0,1300,1050,0,1300,1050,-675,200,1169,0,200,1350,0,200,0,-675,200,1169,-1169,200,675,0,1300,0,-909,1300,525,-525,1300,909,-525,1300,909,-1169,200,675,-675,200,1169,0,200,0,-1169,200,675,-1350,200,0,0,1300,0,-1050,1300,0,-909,1300,525,-909,1300,525,-1350,200,0,-1169,200,675,0,200,0,-1350,200,0,-1169,200,-675,0,1300,0,-909,1300,-525,-1050,1300,0,-1050,1300,0,-1169,200,-675,-1350,200,0,0,200,0,-1169,200,-675,-675,200,-1169,0,1300,0,-525,1300,-909,-909,1300,-525,-909,1300,-525,-675,200,-1169,-1169,200,-675,0,200,0,-675,200,-1169,0,200,-1350,0,1300,0,0,1300,-1050,-525,1300,-909,-525,1300,-909,0,200,-1350,-675,200,-1169,550,50,0,550,50,-420,797,50,-340,550,850,0,656,850,-146,550,850,-180,550,850,-180,797,50,-340,550,50,-420,550,50,0,797,50,-340,949,50,-130,550,850,0,721,850,-56,656,850,-146,656,850,-146,949,50,-130,797,50,-340,550,50,0,949,50,-130,949,50,130,550,850,0,721,850,56,721,850,-56,949,50,-130,721,850,56,949,50,130,550,50,0,949,50,130,797,50,340,550,850,0,656,850,146,721,850,56,721,850,56,797,50,340,949,50,130,550,50,0,797,50,340,550,50,420,550,850,0,550,850,180,656,850,146,656,850,146,550,50,420,797,50,340,550,50,0,550,50,420,303,50,340,550,850,0,444,850,146,550,850,180,550,850,180,303,50,340,550,50,420,550,50,0,303,50,340,151,50,130,550,850,0,379,850,56,444,850,146,303,50,340,379,850,56,151,50,130,550,50,0,151,50,130,151,50,-130,550,850,0,379,850,-56,379,850,56,151,50,130,379,850,-56,151,50,-130,550,50,0,151,50,-130,303,50,-340,550,850,0,444,850,-146,379,850,-56,379,850,-56,303,50,-340,151,50,-130,550,50,0,303,50,-340,550,50,-420,550,850,0,550,850,-180,444,850,-146,444,850,-146,550,50,-420,303,50,-340,-275,50,-476,-275,50,-896,-28,50,-816,-275,850,-476,-169,850,-622,-275,850,-656,-275,850,-656,-28,50,-816,-275,50,-896,-275,50,-476,-28,50,-816,124,50,-606,-275,850,-476,-104,850,-532,-169,850,-622,-169,850,-622,124,50,-606,-28,50,-816,-275,50,-476,124,50,-606,124,50,-347,-275,850,-476,-104,850,-421,-104,850,-532,-104,850,-532,124,50,-347,124,50,-606,-275,50,-476,124,50,-347,-28,50,-137,-275,850,-476,-169,850,-331,-104,850,-421,-104,850,-421,-28,50,-137,124,50,-347,-275,50,-476,-28,50,-137,-275,50,-56,-275,850,-476,-275,850,-296,-169,850,-331,-169,850,-331,-275,50,-56,-28,50,-137,-275,50,-476,-275,50,-56,-522,50,-137,-275,850,-476,-381,850,-331,-275,850,-296,-275,850,-296,-522,50,-137,-275,50,-56,-275,50,-476,-522,50,-137,-674,50,-347,-275,850,-476,-446,850,-421,-381,850,-331,-381,850,-331,-674,50,-347,-522,50,-137,-275,50,-476,-674,50,-347,-674,50,-606,-275,850,-476,-446,850,-532,-446,850,-421,-446,850,-421,-674,50,-606,-674,50,-347,-275,50,-476,-674,50,-606,-522,50,-816,-275,850,-476,-381,850,-622,-446,850,-532,-446,850,-532,-522,50,-816,-674,50,-606,-275,50,-476,-522,50,-816,-275,50,-896,-275,850,-476,-275,850,-656,-381,850,-622,-381,850,-622,-275,50,-896,-522,50,-816,-275,50,476,-275,50,56,-28,50,137,-275,850,476,-169,850,331,-275,850,296,-275,850,296,-28,50,137,-275,50,56,-275,50,476,-28,50,137,124,50,347,-275,850,476,-104,850,421,-169,850,331,-169,850,331,124,50,347,-28,50,137,-275,50,476,124,50,347,124,50,606,-275,850,476,-104,850,532,-104,850,421,-104,850,421,124,50,606,124,50,347,-275,50,476,124,50,606,-28,50,816,-275,850,476,-169,850,622,-104,850,532,-104,850,532,-28,50,816,124,50,606,-275,50,476,-28,50,816,-275,50,896,-275,850,476,-275,850,656,-169,850,622,-169,850,622,-275,50,896,-28,50,816,-275,50,476,-275,50,896,-522,50,816,-275,850,476,-381,850,622,-275,850,656,-275,50,896,-381,850,622,-522,50,816,-275,50,476,-522,50,816,-674,50,606,-275,850,476,-446,850,532,-381,850,622,-381,850,622,-674,50,606,-522,50,816,-275,50,476,-674,50,606,-674,50,347,-275,850,476,-446,850,421,-446,850,532,-446,850,532,-674,50,347,-674,50,606,-275,50,476,-674,50,347,-522,50,137,-275,850,476,-381,850,331,-446,850,421,-446,850,421,-522,50,137,-674,50,347,-275,50,476,-522,50,137,-275,50,56,-275,850,476,-275,850,296,-381,850,331,-381,850,331,-275,50,56,-522,50,137,0,1300,-1050,525,1300,-909,675,200,-1169,525,1300,-909,909,1300,-525,1169,200,-675,909,1300,-525,1050,1300,0,1350,200,0,1050,1300,0,909,1300,525,1169,200,675,909,1300,525,525,1300,909,675,200,1169,525,1300,909,0,1300,1050,0,200,1350,0,1300,1050,-525,1300,909,-675,200,1169,-525,1300,909,-909,1300,525,-1169,200,675,-909,1300,525,-1050,1300,0,-1350,200,0,-1050,1300,0,-909,1300,-525,-1169,200,-675,-909,1300,-525,-525,1300,-909,-675,200,-1169,-525,1300,-909,0,1300,-1050,0,200,-1350,550,850,-180,656,850,-146,797,50,-340,656,850,-146,721,850,-56,949,50,-130,949,50,-130,721,850,-56,721,850,56,721,850,56,656,850,146,797,50,340,656,850,146,550,850,180,550,50,420,550,850,180,444,850,146,303,50,340,303,50,340,444,850,146,379,850,56,151,50,130,379,850,56,379,850,-56,379,850,-56,444,850,-146,303,50,-340,444,850,-146,550,850,-180,550,50,-420,-275,850,-656,-169,850,-622,-28,50,-816,-169,850,-622,-104,850,-532,124,50,-606,-104,850,-532,-104,850,-421,124,50,-347,-104,850,-421,-169,850,-331,-28,50,-137,-169,850,-331,-275,850,-296,-275,50,-56,-275,850,-296,-381,850,-331,-522,50,-137,-381,850,-331,-446,850,-421,-674,50,-347,-446,850,-421,-446,850,-532,-674,50,-606,-446,850,-532,-381,850,-622,-522,50,-816,-381,850,-622,-275,850,-656,-275,50,-896,-275,850,296,-169,850,331,-28,50,137,-169,850,331,-104,850,421,124,50,347,-104,850,421,-104,850,532,124,50,606,-104,850,532,-169,850,622,-28,50,816,-169,850,622,-275,850,656,-275,50,896,-275,50,896,-275,850,656,-381,850,622,-381,850,622,-446,850,532,-674,50,606,-446,850,532,-446,850,421,-674,50,347,-446,850,421,-381,850,331,-522,50,137,-381,850,331,-275,850,296,-275,50,56]},{"n":"tank","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[0,1300,0,0,1300,-1550,530,1300,-1457,0,5900,0,554,5900,-1522,0,5900,-1620,0,5900,-1620,530,1300,-1457,0,1300,-1550,0,1300,0,530,1300,-1457,996,1300,-1187,0,5900,0,1041,5900,-1241,554,5900,-1522,530,1300,-1457,1041,5900,-1241,996,1300,-1187,0,1300,0,996,1300,-1187,1342,1300,-775,0,5900,0,1403,5900,-810,1041,5900,-1241,1041,5900,-1241,1342,1300,-775,996,1300,-1187,0,1300,0,1342,1300,-775,1526,1300,-269,0,5900,0,1595,5900,-281,1403,5900,-810,1403,5900,-810,1526,1300,-269,1342,1300,-775,0,1300,0,1526,1300,-269,1526,1300,269,0,5900,0,1595,5900,281,1595,5900,-281,1595,5900,-281,1526,1300,269,1526,1300,-269,0,1300,0,1526,1300,269,1342,1300,775,0,5900,0,1403,5900,810,1595,5900,281,1526,1300,269,1403,5900,810,1342,1300,775,0,1300,0,1342,1300,775,996,1300,1187,0,5900,0,1041,5900,1241,1403,5900,810,1403,5900,810,996,1300,1187,1342,1300,775,0,1300,0,996,1300,1187,530,1300,1457,0,5900,0,554,5900,1522,1041,5900,1241,1041,5900,1241,530,1300,1457,996,1300,1187,0,1300,0,530,1300,1457,0,1300,1550,0,5900,0,0,5900,1620,554,5900,1522,554,5900,1522,0,1300,1550,530,1300,1457,0,1300,0,0,1300,1550,-530,1300,1457,0,5900,0,-554,5900,1522,0,5900,1620,0,5900,1620,-530,1300,1457,0,1300,1550,0,1300,0,-530,1300,1457,-996,1300,1187,0,5900,0,-1041,5900,1241,-554,5900,1522,-530,1300,1457,-1041,5900,1241,-996,1300,1187,0,1300,0,-996,1300,1187,-1342,1300,775,0,5900,0,-1403,5900,810,-1041,5900,1241,-1041,5900,1241,-1342,1300,775,-996,1300,1187,0,1300,0,-1342,1300,775,-1526,1300,269,0,5900,0,-1595,5900,281,-1403,5900,810,-1403,5900,810,-1526,1300,269,-1342,1300,775,0,1300,0,-1526,1300,269,-1526,1300,-269,0,5900,0,-1595,5900,-281,-1595,5900,281,-1595,5900,281,-1526,1300,-269,-1526,1300,269,0,1300,0,-1526,1300,-269,-1342,1300,-775,0,5900,0,-1403,5900,-810,-1595,5900,-281,-1526,1300,-269,-1403,5900,-810,-1342,1300,-775,0,1300,0,-1342,1300,-775,-996,1300,-1187,0,5900,0,-1041,5900,-1241,-1403,5900,-810,-1403,5900,-810,-996,1300,-1187,-1342,1300,-775,0,1300,0,-996,1300,-1187,-530,1300,-1457,0,5900,0,-554,5900,-1522,-1041,5900,-1241,-1041,5900,-1241,-530,1300,-1457,-996,1300,-1187,0,1300,0,-530,1300,-1457,0,1300,-1550,0,5900,0,0,5900,-1620,-554,5900,-1522,-554,5900,-1522,0,1300,-1550,-530,1300,-1457,0,5850,0,0,5850,-1420,486,5850,-1334,0,6350,0,486,6350,-1334,0,6350,-1420,0,6350,-1420,486,5850,-1334,0,5850,-1420,0,5850,0,486,5850,-1334,913,5850,-1088,0,6350,0,913,6350,-1088,486,6350,-1334,486,6350,-1334,913,5850,-1088,486,5850,-1334,0,5850,0,913,5850,-1088,1230,5850,-710,0,6350,0,1230,6350,-710,913,6350,-1088,913,6350,-1088,1230,5850,-710,913,5850,-1088,0,5850,0,1230,5850,-710,1398,5850,-247,0,6350,0,1398,6350,-247,1230,6350,-710,1230,6350,-710,1398,5850,-247,1230,5850,-710,0,5850,0,1398,5850,-247,1398,5850,247,0,6350,0,1398,6350,247,1398,6350,-247,1398,6350,-247,1398,5850,247,1398,5850,-247,0,5850,0,1398,5850,247,1230,5850,710,0,6350,0,1230,6350,710,1398,6350,247,1398,6350,247,1230,5850,710,1398,5850,247,0,5850,0,1230,5850,710,913,5850,1088,0,6350,0,913,6350,1088,1230,6350,710,1230,6350,710,913,5850,1088,1230,5850,710,0,5850,0,913,5850,1088,486,5850,1334,0,6350,0,486,6350,1334,913,6350,1088,913,6350,1088,486,5850,1334,913,5850,1088,0,5850,0,486,5850,1334,0,5850,1420,0,6350,0,0,6350,1420,486,6350,1334,486,6350,1334,0,5850,1420,486,5850,1334,0,5850,0,0,5850,1420,-486,5850,1334,0,6350,0,-486,6350,1334,0,6350,1420,0,6350,1420,-486,5850,1334,0,5850,1420,0,5850,0,-486,5850,1334,-913,5850,1088,0,6350,0,-913,6350,1088,-486,6350,1334,-486,6350,1334,-913,5850,1088,-486,5850,1334,0,5850,0,-913,5850,1088,-1230,5850,710,0,6350,0,-1230,6350,710,-913,6350,1088,-913,6350,1088,-1230,5850,710,-913,5850,1088,0,5850,0,-1230,5850,710,-1398,5850,247,0,6350,0,-1398,6350,247,-1230,6350,710,-1230,6350,710,-1398,5850,247,-1230,5850,710,0,5850,0,-1398,5850,247,-1398,5850,-247,0,6350,0,-1398,6350,-247,-1398,6350,247,-1398,6350,247,-1398,5850,-247,-1398,5850,247,0,5850,0,-1398,5850,-247,-1230,5850,-710,0,6350,0,-1230,6350,-710,-1398,6350,-247,-1398,6350,-247,-1230,5850,-710,-1398,5850,-247,0,5850,0,-1230,5850,-710,-913,5850,-1088,0,6350,0,-913,6350,-1088,-1230,6350,-710,-1230,6350,-710,-913,5850,-1088,-1230,5850,-710,0,5850,0,-913,5850,-1088,-486,5850,-1334,0,6350,0,-486,6350,-1334,-913,6350,-1088,-913,6350,-1088,-486,5850,-1334,-913,5850,-1088,0,5850,0,-486,5850,-1334,0,5850,-1420,0,6350,0,0,6350,-1420,-486,6350,-1334,-486,6350,-1334,0,5850,-1420,-486,5850,-1334,0,5900,-1620,554,5900,-1522,530,1300,-1457,530,1300,-1457,554,5900,-1522,1041,5900,-1241,1041,5900,-1241,1403,5900,-810,1342,1300,-775,1403,5900,-810,1595,5900,-281,1526,1300,-269,1595,5900,-281,1595,5900,281,1526,1300,269,1526,1300,269,1595,5900,281,1403,5900,810,1403,5900,810,1041,5900,1241,996,1300,1187,1041,5900,1241,554,5900,1522,530,1300,1457,554,5900,1522,0,5900,1620,0,1300,1550,0,5900,1620,-554,5900,1522,-530,1300,1457,-530,1300,1457,-554,5900,1522,-1041,5900,1241,-1041,5900,1241,-1403,5900,810,-1342,1300,775,-1403,5900,810,-1595,5900,281,-1526,1300,269,-1595,5900,281,-1595,5900,-281,-1526,1300,-269,-1526,1300,-269,-1595,5900,-281,-1403,5900,-810,-1403,5900,-810,-1041,5900,-1241,-996,1300,-1187,-1041,5900,-1241,-554,5900,-1522,-530,1300,-1457,-554,5900,-1522,0,5900,-1620,0,1300,-1550,0,6350,-1420,486,6350,-1334,486,5850,-1334,486,6350,-1334,913,6350,-1088,913,5850,-1088,913,6350,-1088,1230,6350,-710,1230,5850,-710,1230,6350,-710,1398,6350,-247,1398,5850,-247,1398,6350,-247,1398,6350,247,1398,5850,247,1398,6350,247,1230,6350,710,1230,5850,710,1230,6350,710,913,6350,1088,913,5850,1088,913,6350,1088,486,6350,1334,486,5850,1334,486,6350,1334,0,6350,1420,0,5850,1420,0,6350,1420,-486,6350,1334,-486,5850,1334,-486,6350,1334,-913,6350,1088,-913,5850,1088,-913,6350,1088,-1230,6350,710,-1230,5850,710,-1230,6350,710,-1398,6350,247,-1398,5850,247,-1398,6350,247,-1398,6350,-247,-1398,5850,-247,-1398,6350,-247,-1230,6350,-710,-1230,5850,-710,-1230,6350,-710,-913,6350,-1088,-913,5850,-1088,-913,6350,-1088,-486,6350,-1334,-486,5850,-1334,-486,6350,-1334,0,6350,-1420,0,5850,-1420]},{"n":"fuellines","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[1520,1400,-300,1520,1400,-390,1565,1400,-378,1520,5800,-300,1565,5800,-378,1520,5800,-390,1520,5800,-390,1565,1400,-378,1520,1400,-390,1520,1400,-300,1565,1400,-378,1598,1400,-345,1520,5800,-300,1598,5800,-345,1565,5800,-378,1565,5800,-378,1598,1400,-345,1565,1400,-378,1520,1400,-300,1598,1400,-345,1610,1400,-300,1520,5800,-300,1610,5800,-300,1598,5800,-345,1598,5800,-345,1610,1400,-300,1598,1400,-345,1520,1400,-300,1610,1400,-300,1598,1400,-255,1520,5800,-300,1598,5800,-255,1610,5800,-300,1610,5800,-300,1598,1400,-255,1610,1400,-300,1520,1400,-300,1598,1400,-255,1565,1400,-222,1520,5800,-300,1565,5800,-222,1598,5800,-255,1598,5800,-255,1565,1400,-222,1598,1400,-255,1520,1400,-300,1565,1400,-222,1520,1400,-210,1520,5800,-300,1520,5800,-210,1565,5800,-222,1565,5800,-222,1520,1400,-210,1565,1400,-222,1520,1400,-300,1520,1400,-210,1475,1400,-222,1520,5800,-300,1475,5800,-222,1520,5800,-210,1520,5800,-210,1475,1400,-222,1520,1400,-210,1520,1400,-300,1475,1400,-222,1442,1400,-255,1520,5800,-300,1442,5800,-255,1475,5800,-222,1475,5800,-222,1442,1400,-255,1475,1400,-222,1520,1400,-300,1442,1400,-255,1430,1400,-300,1520,5800,-300,1430,5800,-300,1442,5800,-255,1442,5800,-255,1430,1400,-300,1442,1400,-255,1520,1400,-300,1430,1400,-300,1442,1400,-345,1520,5800,-300,1442,5800,-345,1430,5800,-300,1430,5800,-300,1442,1400,-345,1430,1400,-300,1520,1400,-300,1442,1400,-345,1475,1400,-378,1520,5800,-300,1475,5800,-378,1442,5800,-345,1442,5800,-345,1475,1400,-378,1442,1400,-345,1520,1400,-300,1475,1400,-378,1520,1400,-390,1520,5800,-300,1520,5800,-390,1475,5800,-378,1475,5800,-378,1520,1400,-390,1475,1400,-378,-1450,1400,500,-1450,1400,410,-1405,1400,422,-1450,5800,500,-1405,5800,422,-1450,5800,410,-1450,5800,410,-1405,1400,422,-1450,1400,410,-1450,1400,500,-1405,1400,422,-1372,1400,455,-1450,5800,500,-1372,5800,455,-1405,5800,422,-1405,5800,422,-1372,1400,455,-1405,1400,422,-1450,1400,500,-1372,1400,455,-1360,1400,500,-1450,5800,500,-1360,5800,500,-1372,5800,455,-1372,5800,455,-1360,1400,500,-1372,1400,455,-1450,1400,500,-1360,1400,500,-1372,1400,545,-1450,5800,500,-1372,5800,545,-1360,5800,500,-1360,5800,500,-1372,1400,545,-1360,1400,500,-1450,1400,500,-1372,1400,545,-1405,1400,578,-1450,5800,500,-1405,5800,578,-1372,5800,545,-1372,5800,545,-1405,1400,578,-1372,1400,545,-1450,1400,500,-1405,1400,578,-1450,1400,590,-1450,5800,500,-1450,5800,590,-1405,5800,578,-1405,5800,578,-1450,1400,590,-1405,1400,578,-1450,1400,500,-1450,1400,590,-1495,1400,578,-1450,5800,500,-1495,5800,578,-1450,5800,590,-1450,5800,590,-1495,1400,578,-1450,1400,590,-1450,1400,500,-1495,1400,578,-1528,1400,545,-1450,5800,500,-1528,5800,545,-1495,5800,578,-1495,5800,578,-1528,1400,545,-1495,1400,578,-1450,1400,500,-1528,1400,545,-1540,1400,500,-1450,5800,500,-1540,5800,500,-1528,5800,545,-1528,5800,545,-1540,1400,500,-1528,1400,545,-1450,1400,500,-1540,1400,500,-1528,1400,455,-1450,5800,500,-1528,5800,455,-1540,5800,500,-1540,5800,500,-1528,1400,455,-1540,1400,500,-1450,1400,500,-1528,1400,455,-1495,1400,422,-1450,5800,500,-1495,5800,422,-1528,5800,455,-1528,5800,455,-1495,1400,422,-1528,1400,455,-1450,1400,500,-1495,1400,422,-1450,1400,410,-1450,5800,500,-1450,5800,410,-1495,5800,422,-1495,5800,422,-1450,1400,410,-1495,1400,422,1520,5800,-390,1565,5800,-378,1565,1400,-378,1565,5800,-378,1598,5800,-345,1598,1400,-345,1598,5800,-345,1610,5800,-300,1610,1400,-300,1610,5800,-300,1598,5800,-255,1598,1400,-255,1598,5800,-255,1565,5800,-222,1565,1400,-222,1565,5800,-222,1520,5800,-210,1520,1400,-210,1520,5800,-210,1475,5800,-222,1475,1400,-222,1475,5800,-222,1442,5800,-255,1442,1400,-255,1442,5800,-255,1430,5800,-300,1430,1400,-300,1430,5800,-300,1442,5800,-345,1442,1400,-345,1442,5800,-345,1475,5800,-378,1475,1400,-378,1475,5800,-378,1520,5800,-390,1520,1400,-390,-1450,5800,410,-1405,5800,422,-1405,1400,422,-1405,5800,422,-1372,5800,455,-1372,1400,455,-1372,5800,455,-1360,5800,500,-1360,1400,500,-1360,5800,500,-1372,5800,545,-1372,1400,545,-1372,5800,545,-1405,5800,578,-1405,1400,578,-1405,5800,578,-1450,5800,590,-1450,1400,590,-1450,5800,590,-1495,5800,578,-1495,1400,578,-1495,5800,578,-1528,5800,545,-1528,1400,545,-1528,5800,545,-1540,5800,500,-1540,1400,500,-1540,5800,500,-1528,5800,455,-1528,1400,455,-1528,5800,455,-1495,5800,422,-1495,1400,422,-1495,5800,422,-1450,5800,410,-1450,1400,410]},{"n":"band","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[0,4650,0,0,4650,-1640,561,4650,-1541,0,5150,0,561,5150,-1541,0,5150,-1640,0,5150,-1640,561,4650,-1541,0,4650,-1640,0,4650,0,561,4650,-1541,1054,4650,-1256,0,5150,0,1054,5150,-1256,561,5150,-1541,561,5150,-1541,1054,4650,-1256,561,4650,-1541,0,4650,0,1054,4650,-1256,1420,4650,-820,0,5150,0,1420,5150,-820,1054,5150,-1256,1054,5150,-1256,1420,4650,-820,1054,4650,-1256,0,4650,0,1420,4650,-820,1615,4650,-285,0,5150,0,1615,5150,-285,1420,5150,-820,1420,5150,-820,1615,4650,-285,1420,4650,-820,0,4650,0,1615,4650,-285,1615,4650,285,0,5150,0,1615,5150,285,1615,5150,-285,1615,5150,-285,1615,4650,285,1615,4650,-285,0,4650,0,1615,4650,285,1420,4650,820,0,5150,0,1420,5150,820,1615,5150,285,1615,5150,285,1420,4650,820,1615,4650,285,0,4650,0,1420,4650,820,1054,4650,1256,0,5150,0,1054,5150,1256,1420,5150,820,1420,5150,820,1054,4650,1256,1420,4650,820,0,4650,0,1054,4650,1256,561,4650,1541,0,5150,0,561,5150,1541,1054,5150,1256,1054,5150,1256,561,4650,1541,1054,4650,1256,0,4650,0,561,4650,1541,0,4650,1640,0,5150,0,0,5150,1640,561,5150,1541,561,5150,1541,0,4650,1640,561,4650,1541,0,4650,0,0,4650,1640,-561,4650,1541,0,5150,0,-561,5150,1541,0,5150,1640,0,5150,1640,-561,4650,1541,0,4650,1640,0,4650,0,-561,4650,1541,-1054,4650,1256,0,5150,0,-1054,5150,1256,-561,5150,1541,-561,5150,1541,-1054,4650,1256,-561,4650,1541,0,4650,0,-1054,4650,1256,-1420,4650,820,0,5150,0,-1420,5150,820,-1054,5150,1256,-1054,5150,1256,-1420,4650,820,-1054,4650,1256,0,4650,0,-1420,4650,820,-1615,4650,285,0,5150,0,-1615,5150,285,-1420,5150,820,-1420,5150,820,-1615,4650,285,-1420,4650,820,0,4650,0,-1615,4650,285,-1615,4650,-285,0,5150,0,-1615,5150,-285,-1615,5150,285,-1615,5150,285,-1615,4650,-285,-1615,4650,285,0,4650,0,-1615,4650,-285,-1420,4650,-820,0,5150,0,-1420,5150,-820,-1615,5150,-285,-1615,5150,-285,-1420,4650,-820,-1615,4650,-285,0,4650,0,-1420,4650,-820,-1054,4650,-1256,0,5150,0,-1054,5150,-1256,-1420,5150,-820,-1420,5150,-820,-1054,4650,-1256,-1420,4650,-820,0,4650,0,-1054,4650,-1256,-561,4650,-1541,0,5150,0,-561,5150,-1541,-1054,5150,-1256,-1054,5150,-1256,-561,4650,-1541,-1054,4650,-1256,0,4650,0,-561,4650,-1541,0,4650,-1640,0,5150,0,0,5150,-1640,-561,5150,-1541,-561,5150,-1541,0,4650,-1640,-561,4650,-1541,0,5150,-1640,561,5150,-1541,561,4650,-1541,561,5150,-1541,1054,5150,-1256,1054,4650,-1256,1054,5150,-1256,1420,5150,-820,1420,4650,-820,1420,5150,-820,1615,5150,-285,1615,4650,-285,1615,5150,-285,1615,5150,285,1615,4650,285,1615,5150,285,1420,5150,820,1420,4650,820,1420,5150,820,1054,5150,1256,1054,4650,1256,1054,5150,1256,561,5150,1541,561,4650,1541,561,5150,1541,0,5150,1640,0,4650,1640,0,5150,1640,-561,5150,1541,-561,4650,1541,-561,5150,1541,-1054,5150,1256,-1054,4650,1256,-1054,5150,1256,-1420,5150,820,-1420,4650,820,-1420,5150,820,-1615,5150,285,-1615,4650,285,-1615,5150,285,-1615,5150,-285,-1615,4650,-285,-1615,5150,-285,-1420,5150,-820,-1420,4650,-820,-1420,5150,-820,-1054,5150,-1256,-1054,4650,-1256,-1054,5150,-1256,-561,5150,-1541,-561,4650,-1541,-561,5150,-1541,0,5150,-1640,0,4650,-1640]},{"n":"capsule","c":[0.78,0.75,0.68],"p":[0,0,0],"v":[0,6350,0,0,6350,-1280,490,6350,-1183,0,8250,0,574,8250,-1386,0,8250,-1500,0,8250,-1500,490,6350,-1183,0,6350,-1280,0,6350,0,490,6350,-1183,905,6350,-905,0,8250,0,1061,8250,-1061,574,8250,-1386,574,8250,-1386,905,6350,-905,490,6350,-1183,0,6350,0,905,6350,-905,1183,6350,-490,0,8250,0,1386,8250,-574,1061,8250,-1061,1061,8250,-1061,1183,6350,-490,905,6350,-905,0,6350,0,1183,6350,-490,1280,6350,0,0,8250,0,1500,8250,0,1386,8250,-574,1386,8250,-574,1280,6350,0,1183,6350,-490,0,6350,0,1280,6350,0,1183,6350,490,0,8250,0,1386,8250,574,1500,8250,0,1500,8250,0,1183,6350,490,1280,6350,0,0,6350,0,1183,6350,490,905,6350,905,0,8250,0,1061,8250,1061,1386,8250,574,1386,8250,574,905,6350,905,1183,6350,490,0,6350,0,905,6350,905,490,6350,1183,0,8250,0,574,8250,1386,1061,8250,1061,1061,8250,1061,490,6350,1183,905,6350,905,0,6350,0,490,6350,1183,0,6350,1280,0,8250,0,0,8250,1500,574,8250,1386,574,8250,1386,0,6350,1280,490,6350,1183,0,6350,0,0,6350,1280,-490,6350,1183,0,8250,0,-574,8250,1386,0,8250,1500,0,8250,1500,-490,6350,1183,0,6350,1280,0,6350,0,-490,6350,1183,-905,6350,905,0,8250,0,-1061,8250,1061,-574,8250,1386,-574,8250,1386,-905,6350,905,-490,6350,1183,0,6350,0,-905,6350,905,-1183,6350,490,0,8250,0,-1386,8250,574,-1061,8250,1061,-1061,8250,1061,-1183,6350,490,-905,6350,905,0,6350,0,-1183,6350,490,-1280,6350,0,0,8250,0,-1500,8250,0,-1386,8250,574,-1386,8250,574,-1280,6350,0,-1183,6350,490,0,6350,0,-1280,6350,0,-1183,6350,-490,0,8250,0,-1386,8250,-574,-1500,8250,0,-1500,8250,0,-1183,6350,-490,-1280,6350,0,0,6350,0,-1183,6350,-490,-905,6350,-905,0,8250,0,-1061,8250,-1061,-1386,8250,-574,-1386,8250,-574,-905,6350,-905,-1183,6350,-490,0,6350,0,-905,6350,-905,-490,6350,-1183,0,8250,0,-574,8250,-1386,-1061,8250,-1061,-1061,8250,-1061,-490,6350,-1183,-905,6350,-905,0,6350,0,-490,6350,-1183,0,6350,-1280,0,8250,0,0,8250,-1500,-574,8250,-1386,-574,8250,-1386,0,6350,-1280,-490,6350,-1183,0,8250,-1500,574,8250,-1386,490,6350,-1183,574,8250,-1386,1061,8250,-1061,905,6350,-905,1061,8250,-1061,1386,8250,-574,1183,6350,-490,1386,8250,-574,1500,8250,0,1280,6350,0,1500,8250,0,1386,8250,574,1183,6350,490,1386,8250,574,1061,8250,1061,905,6350,905,1061,8250,1061,574,8250,1386,490,6350,1183,574,8250,1386,0,8250,1500,0,6350,1280,0,8250,1500,-574,8250,1386,-490,6350,1183,-574,8250,1386,-1061,8250,1061,-905,6350,905,-1061,8250,1061,-1386,8250,574,-1183,6350,490,-1386,8250,574,-1500,8250,0,-1280,6350,0,-1500,8250,0,-1386,8250,-574,-1183,6350,-490,-1386,8250,-574,-1061,8250,-1061,-905,6350,-905,-1061,8250,-1061,-574,8250,-1386,-490,6350,-1183,-574,8250,-1386,0,8250,-1500,0,6350,-1280]},{"n":"window","c":[0.6,0.72,0.78],"p":[0,0,0],"v":[-350,7750,1700,-350,7250,800,-350,7250,1700,-350,7750,800,350,7250,800,-350,7250,800,350,7750,800,350,7250,1700,350,7250,800,350,7750,1700,-350,7250,1700,350,7250,1700,350,7250,800,-350,7250,1700,-350,7250,800,-350,7750,800,350,7750,1700,350,7750,800,-350,7750,1700,-350,7750,800,-350,7250,800,-350,7750,800,350,7750,800,350,7250,800,350,7750,800,350,7750,1700,350,7250,1700,350,7750,1700,-350,7750,1700,-350,7250,1700,350,7250,800,350,7250,1700,-350,7250,1700,-350,7750,800,-350,7750,1700,350,7750,1700],"o":0.7},{"n":"nose","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[0,8300,0,0,8300,-1320,505,8300,-1220,0,10700,0,19,10700,-46,0,10700,-50,0,10700,-50,505,8300,-1220,0,8300,-1320,0,8300,0,505,8300,-1220,933,8300,-933,0,10700,0,35,10700,-35,19,10700,-46,19,10700,-46,933,8300,-933,505,8300,-1220,0,8300,0,933,8300,-933,1220,8300,-505,0,10700,0,46,10700,-19,35,10700,-35,35,10700,-35,1220,8300,-505,933,8300,-933,0,8300,0,1220,8300,-505,1320,8300,0,0,10700,0,50,10700,0,46,10700,-19,46,10700,-19,1320,8300,0,1220,8300,-505,0,8300,0,1320,8300,0,1220,8300,505,0,10700,0,46,10700,19,50,10700,0,50,10700,0,1220,8300,505,1320,8300,0,0,8300,0,1220,8300,505,933,8300,933,0,10700,0,35,10700,35,46,10700,19,46,10700,19,933,8300,933,1220,8300,505,0,8300,0,933,8300,933,505,8300,1220,0,10700,0,19,10700,46,35,10700,35,35,10700,35,505,8300,1220,933,8300,933,0,8300,0,505,8300,1220,0,8300,1320,0,10700,0,0,10700,50,19,10700,46,19,10700,46,0,8300,1320,505,8300,1220,0,8300,0,0,8300,1320,-505,8300,1220,0,10700,0,-19,10700,46,0,10700,50,0,10700,50,-505,8300,1220,0,8300,1320,0,8300,0,-505,8300,1220,-933,8300,933,0,10700,0,-35,10700,35,-19,10700,46,-19,10700,46,-933,8300,933,-505,8300,1220,0,8300,0,-933,8300,933,-1220,8300,505,0,10700,0,-46,10700,19,-35,10700,35,-35,10700,35,-1220,8300,505,-933,8300,933,0,8300,0,-1220,8300,505,-1320,8300,0,0,10700,0,-50,10700,0,-46,10700,19,-46,10700,19,-1320,8300,0,-1220,8300,505,0,8300,0,-1320,8300,0,-1220,8300,-505,0,10700,0,-46,10700,-19,-50,10700,0,-50,10700,0,-1220,8300,-505,-1320,8300,0,0,8300,0,-1220,8300,-505,-933,8300,-933,0,10700,0,-35,10700,-35,-46,10700,-19,-46,10700,-19,-933,8300,-933,-1220,8300,-505,0,8300,0,-933,8300,-933,-505,8300,-1220,0,10700,0,-19,10700,-46,-35,10700,-35,-35,10700,-35,-505,8300,-1220,-933,8300,-933,0,8300,0,-505,8300,-1220,0,8300,-1320,0,10700,0,0,10700,-50,-19,10700,-46,-19,10700,-46,0,8300,-1320,-505,8300,-1220,0,10700,-50,19,10700,-46,505,8300,-1220,19,10700,-46,35,10700,-35,933,8300,-933,35,10700,-35,46,10700,-19,1220,8300,-505,46,10700,-19,50,10700,0,1320,8300,0,50,10700,0,46,10700,19,1220,8300,505,46,10700,19,35,10700,35,933,8300,933,35,10700,35,19,10700,46,505,8300,1220,19,10700,46,0,10700,50,0,8300,1320,0,10700,50,-19,10700,46,-505,8300,1220,-19,10700,46,-35,10700,35,-933,8300,933,-35,10700,35,-46,10700,19,-1220,8300,505,-46,10700,19,-50,10700,0,-1320,8300,0,-50,10700,0,-46,10700,-19,-1220,8300,-505,-46,10700,-19,-35,10700,-35,-933,8300,-933,-35,10700,-35,-19,10700,-46,-505,8300,-1220,-19,10700,-46,0,10700,-50,0,8300,-1320]},{"n":"legs","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[490,51,-1379,490,51,-1499,541,19,-1483,2267,2949,-1379,2336,2907,-1517,2267,2949,-1539,490,51,-1499,2336,2907,-1517,541,19,-1483,490,51,-1379,541,19,-1483,579,-4,-1439,2267,2949,-1379,2386,2877,-1459,2336,2907,-1517,541,19,-1483,2386,2877,-1459,579,-4,-1439,490,51,-1379,579,-4,-1439,593,-12,-1379,2267,2949,-1379,2404,2866,-1379,2386,2877,-1459,2386,2877,-1459,593,-12,-1379,579,-4,-1439,490,51,-1379,593,-12,-1379,579,-4,-1319,2267,2949,-1379,2386,2877,-1299,2404,2866,-1379,2404,2866,-1379,579,-4,-1319,593,-12,-1379,490,51,-1379,579,-4,-1319,541,19,-1275,2267,2949,-1379,2336,2907,-1240,2386,2877,-1299,579,-4,-1319,2336,2907,-1240,541,19,-1275,490,51,-1379,541,19,-1275,490,51,-1259,2267,2949,-1379,2267,2949,-1219,2336,2907,-1240,2336,2907,-1240,490,51,-1259,541,19,-1275,490,51,-1379,490,51,-1259,439,82,-1275,2267,2949,-1379,2199,2991,-1240,2267,2949,-1219,2267,2949,-1219,439,82,-1275,490,51,-1259,490,51,-1379,439,82,-1275,402,105,-1319,2267,2949,-1379,2149,3022,-1299,2199,2991,-1240,2199,2991,-1240,402,105,-1319,439,82,-1275,490,51,-1379,402,105,-1319,388,113,-1379,2267,2949,-1379,2131,3033,-1379,2149,3022,-1299,402,105,-1319,2131,3033,-1379,388,113,-1379,490,51,-1379,388,113,-1379,402,105,-1439,2267,2949,-1379,2149,3022,-1459,2131,3033,-1379,2131,3033,-1379,402,105,-1439,388,113,-1379,490,51,-1379,402,105,-1439,439,82,-1483,2267,2949,-1379,2199,2991,-1517,2149,3022,-1459,2149,3022,-1459,439,82,-1483,402,105,-1439,490,51,-1379,439,82,-1483,490,51,-1499,2267,2949,-1379,2267,2949,-1539,2199,2991,-1517,439,82,-1483,2267,2949,-1539,490,51,-1499,2015,0,-2015,2015,0,-2515,2309,0,-2420,2015,160,-2015,2339,160,-2460,2015,160,-2565,2015,160,-2565,2309,0,-2420,2015,0,-2515,2015,0,-2015,2309,0,-2420,2491,0,-2170,2015,160,-2015,2538,160,-2185,2339,160,-2460,2339,160,-2460,2491,0,-2170,2309,0,-2420,2015,0,-2015,2491,0,-2170,2491,0,-1861,2015,160,-2015,2538,160,-1845,2538,160,-2185,2538,160,-2185,2491,0,-1861,2491,0,-2170,2015,0,-2015,2491,0,-1861,2309,0,-1611,2015,160,-2015,2339,160,-1570,2538,160,-1845,2491,0,-1861,2339,160,-1570,2309,0,-1611,2015,0,-2015,2309,0,-1611,2015,0,-1515,2015,160,-2015,2015,160,-1465,2339,160,-1570,2339,160,-1570,2015,0,-1515,2309,0,-1611,2015,0,-2015,2015,0,-1515,1721,0,-1611,2015,160,-2015,1692,160,-1570,2015,160,-1465,2015,160,-1465,1721,0,-1611,2015,0,-1515,2015,0,-2015,1721,0,-1611,1540,0,-1861,2015,160,-2015,1492,160,-1845,1692,160,-1570,1721,0,-1611,1492,160,-1845,1540,0,-1861,2015,0,-2015,1540,0,-1861,1540,0,-2170,2015,160,-2015,1492,160,-2185,1492,160,-1845,1540,0,-1861,1492,160,-2185,1540,0,-2170,2015,0,-2015,1540,0,-2170,1721,0,-2420,2015,160,-2015,1692,160,-2460,1492,160,-2185,1492,160,-2185,1721,0,-2420,1540,0,-2170,2015,0,-2015,1721,0,-2420,2015,0,-2515,2015,160,-2015,2015,160,-2565,1692,160,-2460,1692,160,-2460,2015,0,-2515,1721,0,-2420,-1379,51,-490,-1379,-12,-593,-1319,-4,-579,-1379,2949,-2267,-1299,2877,-2386,-1379,2866,-2404,-1379,2866,-2404,-1319,-4,-579,-1379,-12,-593,-1379,51,-490,-1319,-4,-579,-1275,19,-541,-1379,2949,-2267,-1240,2907,-2336,-1299,2877,-2386,-1319,-4,-579,-1240,2907,-2336,-1275,19,-541,-1379,51,-490,-1275,19,-541,-1259,51,-490,-1379,2949,-2267,-1219,2949,-2267,-1240,2907,-2336,-1240,2907,-2336,-1259,51,-490,-1275,19,-541,-1379,51,-490,-1259,51,-490,-1275,82,-439,-1379,2949,-2267,-1240,2991,-2199,-1219,2949,-2267,-1219,2949,-2267,-1275,82,-439,-1259,51,-490,-1379,51,-490,-1275,82,-439,-1319,105,-402,-1379,2949,-2267,-1299,3022,-2149,-1240,2991,-2199,-1240,2991,-2199,-1319,105,-402,-1275,82,-439,-1379,51,-490,-1319,105,-402,-1379,113,-388,-1379,2949,-2267,-1379,3033,-2131,-1299,3022,-2149,-1319,105,-402,-1379,3033,-2131,-1379,113,-388,-1379,51,-490,-1379,113,-388,-1439,105,-402,-1379,2949,-2267,-1459,3022,-2149,-1379,3033,-2131,-1379,3033,-2131,-1439,105,-402,-1379,113,-388,-1379,51,-490,-1439,105,-402,-1483,82,-439,-1379,2949,-2267,-1517,2991,-2199,-1459,3022,-2149,-1459,3022,-2149,-1483,82,-439,-1439,105,-402,-1379,51,-490,-1483,82,-439,-1499,51,-490,-1379,2949,-2267,-1539,2949,-2267,-1517,2991,-2199,-1483,82,-439,-1539,2949,-2267,-1499,51,-490,-1379,51,-490,-1499,51,-490,-1483,19,-541,-1379,2949,-2267,-1517,2907,-2336,-1539,2949,-2267,-1499,51,-490,-1517,2907,-2336,-1483,19,-541,-1379,51,-490,-1483,19,-541,-1439,-4,-579,-1379,2949,-2267,-1459,2877,-2386,-1517,2907,-2336,-1483,19,-541,-1459,2877,-2386,-1439,-4,-579,-1379,51,-490,-1439,-4,-579,-1379,-12,-593,-1379,2949,-2267,-1379,2866,-2404,-1459,2877,-2386,-1459,2877,-2386,-1379,-12,-593,-1439,-4,-579,-2015,0,-2015,-2015,0,-2515,-1721,0,-2420,-2015,160,-2015,-1692,160,-2460,-2015,160,-2565,-2015,160,-2565,-1721,0,-2420,-2015,0,-2515,-2015,0,-2015,-1721,0,-2420,-1540,0,-2170,-2015,160,-2015,-1492,160,-2185,-1692,160,-2460,-1692,160,-2460,-1540,0,-2170,-1721,0,-2420,-2015,0,-2015,-1540,0,-2170,-1540,0,-1861,-2015,160,-2015,-1492,160,-1845,-1492,160,-2185,-1492,160,-2185,-1540,0,-1861,-1540,0,-2170,-2015,0,-2015,-1540,0,-1861,-1721,0,-1611,-2015,160,-2015,-1692,160,-1570,-1492,160,-1845,-1492,160,-1845,-1721,0,-1611,-1540,0,-1861,-2015,0,-2015,-1721,0,-1611,-2015,0,-1515,-2015,160,-2015,-2015,160,-1465,-1692,160,-1570,-1692,160,-1570,-2015,0,-1515,-1721,0,-1611,-2015,0,-2015,-2015,0,-1515,-2309,0,-1611,-2015,160,-2015,-2339,160,-1570,-2015,160,-1465,-2015,160,-1465,-2309,0,-1611,-2015,0,-1515,-2015,0,-2015,-2309,0,-1611,-2491,0,-1861,-2015,160,-2015,-2538,160,-1845,-2339,160,-1570,-2339,160,-1570,-2491,0,-1861,-2309,0,-1611,-2015,0,-2015,-2491,0,-1861,-2491,0,-2170,-2015,160,-2015,-2538,160,-2185,-2538,160,-1845,-2491,0,-1861,-2538,160,-2185,-2491,0,-2170,-2015,0,-2015,-2491,0,-2170,-2309,0,-2420,-2015,160,-2015,-2339,160,-2460,-2538,160,-2185,-2491,0,-2170,-2339,160,-2460,-2309,0,-2420,-2015,0,-2015,-2309,0,-2420,-2015,0,-2515,-2015,160,-2015,-2015,160,-2565,-2339,160,-2460,-2309,0,-2420,-2015,160,-2565,-2015,0,-2515,-490,51,1379,-490,51,1259,-439,82,1275,-2267,2949,1379,-2199,2991,1240,-2267,2949,1219,-2267,2949,1219,-439,82,1275,-490,51,1259,-490,51,1379,-439,82,1275,-402,105,1319,-2267,2949,1379,-2149,3022,1299,-2199,2991,1240,-2199,2991,1240,-402,105,1319,-439,82,1275,-490,51,1379,-402,105,1319,-388,113,1379,-2267,2949,1379,-2131,3033,1379,-2149,3022,1299,-402,105,1319,-2131,3033,1379,-388,113,1379,-490,51,1379,-388,113,1379,-402,105,1439,-2267,2949,1379,-2149,3022,1459,-2131,3033,1379,-2131,3033,1379,-402,105,1439,-388,113,1379,-490,51,1379,-402,105,1439,-439,82,1483,-2267,2949,1379,-2199,2991,1517,-2149,3022,1459,-2149,3022,1459,-439,82,1483,-402,105,1439,-490,51,1379,-439,82,1483,-490,51,1499,-2267,2949,1379,-2267,2949,1539,-2199,2991,1517,-439,82,1483,-2267,2949,1539,-490,51,1499,-490,51,1379,-490,51,1499,-541,19,1483,-2267,2949,1379,-2336,2907,1517,-2267,2949,1539,-490,51,1499,-2336,2907,1517,-541,19,1483,-490,51,1379,-541,19,1483,-579,-4,1439,-2267,2949,1379,-2386,2877,1459,-2336,2907,1517,-541,19,1483,-2386,2877,1459,-579,-4,1439,-490,51,1379,-579,-4,1439,-593,-12,1379,-2267,2949,1379,-2404,2866,1379,-2386,2877,1459,-2386,2877,1459,-593,-12,1379,-579,-4,1439,-490,51,1379,-593,-12,1379,-579,-4,1319,-2267,2949,1379,-2386,2877,1299,-2404,2866,1379,-2404,2866,1379,-579,-4,1319,-593,-12,1379,-490,51,1379,-579,-4,1319,-541,19,1275,-2267,2949,1379,-2336,2907,1240,-2386,2877,1299,-579,-4,1319,-2336,2907,1240,-541,19,1275,-490,51,1379,-541,19,1275,-490,51,1259,-2267,2949,1379,-2267,2949,1219,-2336,2907,1240,-2336,2907,1240,-490,51,1259,-541,19,1275,-2015,0,2015,-2015,0,1515,-1721,0,1611,-2015,160,2015,-1692,160,1570,-2015,160,1465,-2015,160,1465,-1721,0,1611,-2015,0,1515,-2015,0,2015,-1721,0,1611,-1540,0,1861,-2015,160,2015,-1492,160,1845,-1692,160,1570,-1721,0,1611,-1492,160,1845,-1540,0,1861,-2015,0,2015,-1540,0,1861,-1540,0,2170,-2015,160,2015,-1492,160,2185,-1492,160,1845,-1540,0,1861,-1492,160,2185,-1540,0,2170,-2015,0,2015,-1540,0,2170,-1721,0,2420,-2015,160,2015,-1692,160,2460,-1492,160,2185,-1492,160,2185,-1721,0,2420,-1540,0,2170,-2015,0,2015,-1721,0,2420,-2015,0,2515,-2015,160,2015,-2015,160,2565,-1692,160,2460,-1692,160,2460,-2015,0,2515,-1721,0,2420,-2015,0,2015,-2015,0,2515,-2309,0,2420,-2015,160,2015,-2339,160,2460,-2015,160,2565,-2015,160,2565,-2309,0,2420,-2015,0,2515,-2015,0,2015,-2309,0,2420,-2491,0,2170,-2015,160,2015,-2538,160,2185,-2339,160,2460,-2339,160,2460,-2491,0,2170,-2309,0,2420,-2015,0,2015,-2491,0,2170,-2491,0,1861,-2015,160,2015,-2538,160,1845,-2538,160,2185,-2538,160,2185,-2491,0,1861,-2491,0,2170,-2015,0,2015,-2491,0,1861,-2309,0,1611,-2015,160,2015,-2339,160,1570,-2538,160,1845,-2491,0,1861,-2339,160,1570,-2309,0,1611,-2015,0,2015,-2309,0,1611,-2015,0,1515,-2015,160,2015,-2015,160,1465,-2339,160,1570,-2339,160,1570,-2015,0,1515,-2309,0,1611,1379,51,490,1379,113,388,1439,105,402,1379,2949,2267,1459,3022,2149,1379,3033,2131,1379,3033,2131,1439,105,402,1379,113,388,1379,51,490,1439,105,402,1483,82,439,1379,2949,2267,1517,2991,2199,1459,3022,2149,1459,3022,2149,1483,82,439,1439,105,402,1379,51,490,1483,82,439,1499,51,490,1379,2949,2267,1539,2949,2267,1517,2991,2199,1483,82,439,1539,2949,2267,1499,51,490,1379,51,490,1499,51,490,1483,19,541,1379,2949,2267,1517,2907,2336,1539,2949,2267,1499,51,490,1517,2907,2336,1483,19,541,1379,51,490,1483,19,541,1439,-4,579,1379,2949,2267,1459,2877,2386,1517,2907,2336,1483,19,541,1459,2877,2386,1439,-4,579,1379,51,490,1439,-4,579,1379,-12,593,1379,2949,2267,1379,2866,2404,1459,2877,2386,1459,2877,2386,1379,-12,593,1439,-4,579,1379,51,490,1379,-12,593,1319,-4,579,1379,2949,2267,1299,2877,2386,1379,2866,2404,1379,2866,2404,1319,-4,579,1379,-12,593,1379,51,490,1319,-4,579,1275,19,541,1379,2949,2267,1240,2907,2336,1299,2877,2386,1319,-4,579,1240,2907,2336,1275,19,541,1379,51,490,1275,19,541,1259,51,490,1379,2949,2267,1219,2949,2267,1240,2907,2336,1240,2907,2336,1259,51,490,1275,19,541,1379,51,490,1259,51,490,1275,82,439,1379,2949,2267,1240,2991,2199,1219,2949,2267,1219,2949,2267,1275,82,439,1259,51,490,1379,51,490,1275,82,439,1319,105,402,1379,2949,2267,1299,3022,2149,1240,2991,2199,1240,2991,2199,1319,105,402,1275,82,439,1379,51,490,1319,105,402,1379,113,388,1379,2949,2267,1379,3033,2131,1299,3022,2149,1319,105,402,1379,3033,2131,1379,113,388,2015,0,2015,2015,0,1515,2309,0,1611,2015,160,2015,2339,160,1570,2015,160,1465,2015,160,1465,2309,0,1611,2015,0,1515,2015,0,2015,2309,0,1611,2491,0,1861,2015,160,2015,2538,160,1845,2339,160,1570,2339,160,1570,2491,0,1861,2309,0,1611,2015,0,2015,2491,0,1861,2491,0,2170,2015,160,2015,2538,160,2185,2538,160,1845,2491,0,1861,2538,160,2185,2491,0,2170,2015,0,2015,2491,0,2170,2309,0,2420,2015,160,2015,2339,160,2460,2538,160,2185,2491,0,2170,2339,160,2460,2309,0,2420,2015,0,2015,2309,0,2420,2015,0,2515,2015,160,2015,2015,160,2565,2339,160,2460,2309,0,2420,2015,160,2565,2015,0,2515,2015,0,2015,2015,0,2515,1721,0,2420,2015,160,2015,1692,160,2460,2015,160,2565,2015,160,2565,1721,0,2420,2015,0,2515,2015,0,2015,1721,0,2420,1540,0,2170,2015,160,2015,1492,160,2185,1692,160,2460,1692,160,2460,1540,0,2170,1721,0,2420,2015,0,2015,1540,0,2170,1540,0,1861,2015,160,2015,1492,160,1845,1492,160,2185,1492,160,2185,1540,0,1861,1540,0,2170,2015,0,2015,1540,0,1861,1721,0,1611,2015,160,2015,1692,160,1570,1492,160,1845,1492,160,1845,1721,0,1611,1540,0,1861,2015,0,2015,1721,0,1611,2015,0,1515,2015,160,2015,2015,160,1465,1692,160,1570,1692,160,1570,2015,0,1515,1721,0,1611,490,51,-1499,2267,2949,-1539,2336,2907,-1517,541,19,-1483,2336,2907,-1517,2386,2877,-1459,2386,2877,-1459,2404,2866,-1379,593,-12,-1379,2404,2866,-1379,2386,2877,-1299,579,-4,-1319,579,-4,-1319,2386,2877,-1299,2336,2907,-1240,2336,2907,-1240,2267,2949,-1219,490,51,-1259,2267,2949,-1219,2199,2991,-1240,439,82,-1275,2199,2991,-1240,2149,3022,-1299,402,105,-1319,402,105,-1319,2149,3022,-1299,2131,3033,-1379,2131,3033,-1379,2149,3022,-1459,402,105,-1439,2149,3022,-1459,2199,2991,-1517,439,82,-1483,439,82,-1483,2199,2991,-1517,2267,2949,-1539,2015,160,-2565,2339,160,-2460,2309,0,-2420,2339,160,-2460,2538,160,-2185,2491,0,-2170,2538,160,-2185,2538,160,-1845,2491,0,-1861,2491,0,-1861,2538,160,-1845,2339,160,-1570,2339,160,-1570,2015,160,-1465,2015,0,-1515,2015,160,-1465,1692,160,-1570,1721,0,-1611,1721,0,-1611,1692,160,-1570,1492,160,-1845,1540,0,-1861,1492,160,-1845,1492,160,-2185,1492,160,-2185,1692,160,-2460,1721,0,-2420,1692,160,-2460,2015,160,-2565,2015,0,-2515,-1379,2866,-2404,-1299,2877,-2386,-1319,-4,-579,-1319,-4,-579,-1299,2877,-2386,-1240,2907,-2336,-1240,2907,-2336,-1219,2949,-2267,-1259,51,-490,-1219,2949,-2267,-1240,2991,-2199,-1275,82,-439,-1240,2991,-2199,-1299,3022,-2149,-1319,105,-402,-1319,105,-402,-1299,3022,-2149,-1379,3033,-2131,-1379,3033,-2131,-1459,3022,-2149,-1439,105,-402,-1459,3022,-2149,-1517,2991,-2199,-1483,82,-439,-1483,82,-439,-1517,2991,-2199,-1539,2949,-2267,-1499,51,-490,-1539,2949,-2267,-1517,2907,-2336,-1483,19,-541,-1517,2907,-2336,-1459,2877,-2386,-1459,2877,-2386,-1379,2866,-2404,-1379,-12,-593,-2015,160,-2565,-1692,160,-2460,-1721,0,-2420,-1692,160,-2460,-1492,160,-2185,-1540,0,-2170,-1492,160,-2185,-1492,160,-1845,-1540,0,-1861,-1492,160,-1845,-1692,160,-1570,-1721,0,-1611,-1692,160,-1570,-2015,160,-1465,-2015,0,-1515,-2015,160,-1465,-2339,160,-1570,-2309,0,-1611,-2339,160,-1570,-2538,160,-1845,-2491,0,-1861,-2491,0,-1861,-2538,160,-1845,-2538,160,-2185,-2491,0,-2170,-2538,160,-2185,-2339,160,-2460,-2309,0,-2420,-2339,160,-2460,-2015,160,-2565,-2267,2949,1219,-2199,2991,1240,-439,82,1275,-2199,2991,1240,-2149,3022,1299,-402,105,1319,-402,105,1319,-2149,3022,1299,-2131,3033,1379,-2131,3033,1379,-2149,3022,1459,-402,105,1439,-2149,3022,1459,-2199,2991,1517,-439,82,1483,-439,82,1483,-2199,2991,1517,-2267,2949,1539,-490,51,1499,-2267,2949,1539,-2336,2907,1517,-541,19,1483,-2336,2907,1517,-2386,2877,1459,-2386,2877,1459,-2404,2866,1379,-593,-12,1379,-2404,2866,1379,-2386,2877,1299,-579,-4,1319,-579,-4,1319,-2386,2877,1299,-2336,2907,1240,-2336,2907,1240,-2267,2949,1219,-490,51,1259,-2015,160,1465,-1692,160,1570,-1721,0,1611,-1721,0,1611,-1692,160,1570,-1492,160,1845,-1540,0,1861,-1492,160,1845,-1492,160,2185,-1492,160,2185,-1692,160,2460,-1721,0,2420,-1692,160,2460,-2015,160,2565,-2015,0,2515,-2015,160,2565,-2339,160,2460,-2309,0,2420,-2339,160,2460,-2538,160,2185,-2491,0,2170,-2538,160,2185,-2538,160,1845,-2491,0,1861,-2491,0,1861,-2538,160,1845,-2339,160,1570,-2339,160,1570,-2015,160,1465,-2015,0,1515,1379,3033,2131,1459,3022,2149,1439,105,402,1459,3022,2149,1517,2991,2199,1483,82,439,1483,82,439,1517,2991,2199,1539,2949,2267,1499,51,490,1539,2949,2267,1517,2907,2336,1483,19,541,1517,2907,2336,1459,2877,2386,1459,2877,2386,1379,2866,2404,1379,-12,593,1379,2866,2404,1299,2877,2386,1319,-4,579,1319,-4,579,1299,2877,2386,1240,2907,2336,1240,2907,2336,1219,2949,2267,1259,51,490,1219,2949,2267,1240,2991,2199,1275,82,439,1240,2991,2199,1299,3022,2149,1319,105,402,1319,105,402,1299,3022,2149,1379,3033,2131,2015,160,1465,2339,160,1570,2309,0,1611,2339,160,1570,2538,160,1845,2491,0,1861,2491,0,1861,2538,160,1845,2538,160,2185,2491,0,2170,2538,160,2185,2339,160,2460,2309,0,2420,2339,160,2460,2015,160,2565,2015,160,2565,1692,160,2460,1721,0,2420,1692,160,2460,1492,160,2185,1540,0,2170,1492,160,2185,1492,160,1845,1540,0,1861,1492,160,1845,1692,160,1570,1721,0,1611,1692,160,1570,2015,160,1465,2015,0,1515]},{"n":"strobe","c":[0.62,0.16,0.1],"p":[0,0,0],"v":[0,10600,0,0,10600,-50,25,10600,-43,0,11800,0,25,11800,-43,0,11800,-50,0,11800,-50,25,10600,-43,0,10600,-50,0,10600,0,25,10600,-43,43,10600,-25,0,11800,0,43,11800,-25,25,11800,-43,25,11800,-43,43,10600,-25,25,10600,-43,0,10600,0,43,10600,-25,50,10600,0,0,11800,0,50,11800,0,43,11800,-25,43,11800,-25,50,10600,0,43,10600,-25,0,10600,0,50,10600,0,43,10600,25,0,11800,0,43,11800,25,50,11800,0,50,11800,0,43,10600,25,50,10600,0,0,10600,0,43,10600,25,25,10600,43,0,11800,0,25,11800,43,43,11800,25,43,11800,25,25,10600,43,43,10600,25,0,10600,0,25,10600,43,0,10600,50,0,11800,0,0,11800,50,25,11800,43,25,11800,43,0,10600,50,25,10600,43,0,10600,0,0,10600,50,-25,10600,43,0,11800,0,-25,11800,43,0,11800,50,0,11800,50,-25,10600,43,0,10600,50,0,10600,0,-25,10600,43,-43,10600,25,0,11800,0,-43,11800,25,-25,11800,43,-25,11800,43,-43,10600,25,-25,10600,43,0,10600,0,-43,10600,25,-50,10600,0,0,11800,0,-50,11800,0,-43,11800,25,-43,11800,25,-50,10600,0,-43,10600,25,0,10600,0,-50,10600,0,-43,10600,-25,0,11800,0,-43,11800,-25,-50,11800,0,-50,11800,0,-43,10600,-25,-50,10600,0,0,10600,0,-43,10600,-25,-25,10600,-43,0,11800,0,-25,11800,-43,-43,11800,-25,-43,11800,-25,-25,10600,-43,-43,10600,-25,0,10600,0,-25,10600,-43,0,10600,-50,0,11800,0,0,11800,-50,-25,11800,-43,-25,11800,-43,0,10600,-50,-25,10600,-43,0,12013,-113,87,11961,-120,0,11961,-148,0,12048,-61,0,12060,0,36,12048,-50,0,11740,0,0,11752,-61,36,11752,-50,0,11839,-148,67,11787,-92,0,11787,-113,0,11961,-148,94,11900,-129,0,11900,-160,0,12048,-61,67,12013,-92,0,12013,-113,0,11787,-113,36,11752,-50,0,11752,-61,0,11900,-160,87,11839,-120,0,11839,-148,87,11839,-120,108,11787,-35,67,11787,-92,94,11900,-129,141,11961,-46,152,11900,-49,36,12048,-50,108,12013,-35,67,12013,-92,36,11752,-50,108,11787,-35,58,11752,-19,94,11900,-129,141,11839,-46,87,11839,-120,67,12013,-92,141,11961,-46,87,11961,-120,36,12048,-50,0,12060,0,58,12048,-19,0,11740,0,36,11752,-50,58,11752,-19,108,11787,-35,58,11752,19,58,11752,-19,152,11900,-49,141,11839,46,141,11839,-46,108,12013,-35,141,11961,46,141,11961,-46,58,12048,-19,0,12060,0,58,12048,19,0,11740,0,58,11752,-19,58,11752,19,141,11839,-46,108,11787,35,108,11787,-35,152,11900,-49,141,11961,46,152,11900,49,58,12048,-19,108,12013,35,108,12013,-35,152,11900,49,87,11839,120,141,11839,46,108,12013,35,87,11961,120,141,11961,46,58,12048,19,0,12060,0,36,12048,50,0,11740,0,58,11752,19,36,11752,50,141,11839,46,67,11787,92,108,11787,35,152,11900,49,87,11961,120,94,11900,129,108,12013,35,36,12048,50,67,12013,92,108,11787,35,36,11752,50,58,11752,19,0,11740,0,36,11752,50,0,11752,61,87,11839,120,0,11787,113,67,11787,92,87,11961,120,0,11900,160,94,11900,129,36,12048,50,0,12013,113,67,12013,92,67,11787,92,0,11752,61,36,11752,50,94,11900,129,0,11839,148,87,11839,120,87,11961,120,0,12013,113,0,11961,148,36,12048,50,0,12060,0,0,12048,61,0,11900,160,-87,11961,120,-94,11900,129,0,12013,113,-36,12048,50,-67,12013,92,0,11787,113,-36,11752,50,0,11752,61,0,11900,160,-87,11839,120,0,11839,148,0,12013,113,-87,11961,120,0,11961,148,0,12048,61,0,12060,0,-36,12048,50,0,11740,0,0,11752,61,-36,11752,50,0,11839,148,-67,11787,92,0,11787,113,-36,11752,50,-108,11787,35,-58,11752,19,-94,11900,129,-141,11839,46,-87,11839,120,-87,11961,120,-108,12013,35,-141,11961,46,-36,12048,50,0,12060,0,-58,12048,19,0,11740,0,-36,11752,50,-58,11752,19,-87,11839,120,-108,11787,35,-67,11787,92,-94,11900,129,-141,11961,46,-152,11900,49,-67,12013,92,-58,12048,19,-108,12013,35,-141,11961,46,-108,12013,-35,-141,11961,-46,-58,12048,19,0,12060,0,-58,12048,-19,0,11740,0,-58,11752,19,-58,11752,-19,-141,11839,46,-108,11787,-35,-108,11787,35,-152,11900,49,-141,11961,-46,-152,11900,-49,-58,12048,19,-108,12013,-35,-108,12013,35,-108,11787,35,-58,11752,-19,-58,11752,19,-152,11900,49,-141,11839,-46,-141,11839,46,0,11740,0,-58,11752,-19,-36,11752,-50,-141,11839,-46,-67,11787,-92,-108,11787,-35,-152,11900,-49,-87,11961,-120,-94,11900,-129,-58,12048,-19,-67,12013,-92,-108,12013,-35,-108,11787,-35,-36,11752,-50,-58,11752,-19,-152,11900,-49,-87,11839,-120,-141,11839,-46,-141,11961,-46,-67,12013,-92,-87,11961,-120,-58,12048,-19,0,12060,0,-36,12048,-50,-36,12048,-50,0,12013,-113,-67,12013,-92,-36,11752,-50,0,11787,-113,0,11752,-61,-94,11900,-129,0,11839,-148,-87,11839,-120,-67,12013,-92,0,11961,-148,-87,11961,-120,-36,12048,-50,0,12060,0,0,12048,-61,0,11740,0,-36,11752,-50,0,11752,-61,-87,11839,-120,0,11787,-113,-67,11787,-92,-87,11961,-120,0,11900,-160,-94,11900,-129,0,11800,-50,25,11800,-43,25,10600,-43,25,11800,-43,43,11800,-25,43,10600,-25,43,11800,-25,50,11800,0,50,10600,0,50,11800,0,43,11800,25,43,10600,25,43,11800,25,25,11800,43,25,10600,43,25,11800,43,0,11800,50,0,10600,50,0,11800,50,-25,11800,43,-25,10600,43,-25,11800,43,-43,11800,25,-43,10600,25,-43,11800,25,-50,11800,0,-50,10600,0,-50,11800,0,-43,11800,-25,-43,10600,-25,-43,11800,-25,-25,11800,-43,-25,10600,-43,-25,11800,-43,0,11800,-50,0,10600,-50,0,12013,-113,67,12013,-92,87,11961,-120,0,11839,-148,87,11839,-120,67,11787,-92,0,11961,-148,87,11961,-120,94,11900,-129,0,12048,-61,36,12048,-50,67,12013,-92,0,11787,-113,67,11787,-92,36,11752,-50,0,11900,-160,94,11900,-129,87,11839,-120,87,11839,-120,141,11839,-46,108,11787,-35,94,11900,-129,87,11961,-120,141,11961,-46,36,12048,-50,58,12048,-19,108,12013,-35,36,11752,-50,67,11787,-92,108,11787,-35,94,11900,-129,152,11900,-49,141,11839,-46,67,12013,-92,108,12013,-35,141,11961,-46,108,11787,-35,108,11787,35,58,11752,19,152,11900,-49,152,11900,49,141,11839,46,108,12013,-35,108,12013,35,141,11961,46,141,11839,-46,141,11839,46,108,11787,35,152,11900,-49,141,11961,-46,141,11961,46,58,12048,-19,58,12048,19,108,12013,35,152,11900,49,94,11900,129,87,11839,120,108,12013,35,67,12013,92,87,11961,120,141,11839,46,87,11839,120,67,11787,92,152,11900,49,141,11961,46,87,11961,120,108,12013,35,58,12048,19,36,12048,50,108,11787,35,67,11787,92,36,11752,50,87,11839,120,0,11839,148,0,11787,113,87,11961,120,0,11961,148,0,11900,160,36,12048,50,0,12048,61,0,12013,113,67,11787,92,0,11787,113,0,11752,61,94,11900,129,0,11900,160,0,11839,148,87,11961,120,67,12013,92,0,12013,113,0,11900,160,0,11961,148,-87,11961,120,0,12013,113,0,12048,61,-36,12048,50,0,11787,113,-67,11787,92,-36,11752,50,0,11900,160,-94,11900,129,-87,11839,120,0,12013,113,-67,12013,92,-87,11961,120,0,11839,148,-87,11839,120,-67,11787,92,-36,11752,50,-67,11787,92,-108,11787,35,-94,11900,129,-152,11900,49,-141,11839,46,-87,11961,120,-67,12013,92,-108,12013,35,-87,11839,120,-141,11839,46,-108,11787,35,-94,11900,129,-87,11961,120,-141,11961,46,-67,12013,92,-36,12048,50,-58,12048,19,-141,11961,46,-108,12013,35,-108,12013,-35,-141,11839,46,-141,11839,-46,-108,11787,-35,-152,11900,49,-141,11961,46,-141,11961,-46,-58,12048,19,-58,12048,-19,-108,12013,-35,-108,11787,35,-108,11787,-35,-58,11752,-19,-152,11900,49,-152,11900,-49,-141,11839,-46,-141,11839,-46,-87,11839,-120,-67,11787,-92,-152,11900,-49,-141,11961,-46,-87,11961,-120,-58,12048,-19,-36,12048,-50,-67,12013,-92,-108,11787,-35,-67,11787,-92,-36,11752,-50,-152,11900,-49,-94,11900,-129,-87,11839,-120,-141,11961,-46,-108,12013,-35,-67,12013,-92,-36,12048,-50,0,12048,-61,0,12013,-113,-36,11752,-50,-67,11787,-92,0,11787,-113,-94,11900,-129,0,11900,-160,0,11839,-148,-67,12013,-92,0,12013,-113,0,11961,-148,-87,11839,-120,0,11839,-148,0,11787,-113,-87,11961,-120,0,11961,-148,0,11900,-160],"e":[0.9,0.2,0.1]}],"pathfinder":[{"n":"base","c":[0.72,0.55,0.22],"p":[0,0,0],"v":[0,55,0,0,55,-1150,813,55,-813,0,505,0,919,505,-919,0,505,-1300,0,505,-1300,813,55,-813,0,55,-1150,0,55,0,813,55,-813,1150,55,0,0,505,0,1300,505,0,919,505,-919,919,505,-919,1150,55,0,813,55,-813,0,55,0,1150,55,0,813,55,813,0,505,0,919,505,919,1300,505,0,1300,505,0,813,55,813,1150,55,0,0,55,0,813,55,813,0,55,1150,0,505,0,0,505,1300,919,505,919,919,505,919,0,55,1150,813,55,813,0,55,0,0,55,1150,-813,55,813,0,505,0,-919,505,919,0,505,1300,0,505,1300,-813,55,813,0,55,1150,0,55,0,-813,55,813,-1150,55,0,0,505,0,-1300,505,0,-919,505,919,-919,505,919,-1150,55,0,-813,55,813,0,55,0,-1150,55,0,-813,55,-813,0,505,0,-919,505,-919,-1300,505,0,-1300,505,0,-813,55,-813,-1150,55,0,0,55,0,-813,55,-813,0,55,-1150,0,505,0,0,505,-1300,-919,505,-919,-919,505,-919,0,55,-1150,-813,55,-813,0,505,-1300,919,505,-919,813,55,-813,919,505,-919,1300,505,0,1150,55,0,1300,505,0,919,505,919,813,55,813,919,505,919,0,505,1300,0,55,1150,0,505,1300,-919,505,919,-813,55,813,-919,505,919,-1300,505,0,-1150,55,0,-1300,505,0,-919,505,-919,-813,55,-813,-919,505,-919,0,505,-1300,0,55,-1150]},{"n":"core","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[0,450,0,0,450,-550,389,450,-389,0,1150,0,530,1150,-530,0,1150,-750,0,1150,-750,389,450,-389,0,450,-550,0,450,0,389,450,-389,550,450,0,0,1150,0,750,1150,0,530,1150,-530,389,450,-389,750,1150,0,550,450,0,0,450,0,550,450,0,389,450,389,0,1150,0,530,1150,530,750,1150,0,750,1150,0,389,450,389,550,450,0,0,450,0,389,450,389,0,450,550,0,1150,0,0,1150,750,530,1150,530,389,450,389,0,1150,750,0,450,550,0,450,0,0,450,550,-389,450,389,0,1150,0,-530,1150,530,0,1150,750,0,1150,750,-389,450,389,0,450,550,0,450,0,-389,450,389,-550,450,0,0,1150,0,-750,1150,0,-530,1150,530,-389,450,389,-750,1150,0,-550,450,0,0,450,0,-550,450,0,-389,450,-389,0,1150,0,-530,1150,-530,-750,1150,0,-750,1150,0,-389,450,-389,-550,450,0,0,450,0,-389,450,-389,0,450,-550,0,1150,0,0,1150,-750,-530,1150,-530,-389,450,-389,0,1150,-750,0,450,-550,0,1150,-750,530,1150,-530,389,450,-389,389,450,-389,530,1150,-530,750,1150,0,750,1150,0,530,1150,530,389,450,389,389,450,389,530,1150,530,0,1150,750,0,1150,750,-530,1150,530,-389,450,389,-389,450,389,-530,1150,530,-750,1150,0,-750,1150,0,-530,1150,-530,-389,450,-389,-389,450,-389,-530,1150,-530,0,1150,-750]},{"n":"petal0","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[812,641,725,804,582,-725,804,582,725,804,582,-725,2396,418,-725,2388,359,-725,2396,418,-725,2388,359,725,2388,359,-725,2396,418,725,804,582,725,2388,359,725,2388,359,-725,804,582,725,804,582,-725,812,641,-725,2396,418,725,2396,418,-725,812,641,725,812,641,-725,804,582,-725,804,582,-725,812,641,-725,2396,418,-725,2396,418,-725,2396,418,725,2388,359,725,2396,418,725,812,641,725,804,582,725,2388,359,-725,2388,359,725,804,582,725,812,641,-725,812,641,725,2396,418,725]},{"n":"petal1","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[226,582,-1058,-1034,641,-341,-1030,582,-333,-1030,582,-333,-1826,418,-1713,-1822,359,-1706,-1822,359,-1706,-570,418,-2438,-566,359,-2431,-570,418,-2438,226,582,-1058,-566,359,-2431,-1030,582,-333,-566,359,-2431,226,582,-1058,-1034,641,-341,-570,418,-2438,-1826,418,-1713,226,582,-1058,222,641,-1066,-1034,641,-341,-1030,582,-333,-1034,641,-341,-1826,418,-1713,-1822,359,-1706,-1826,418,-1713,-570,418,-2438,-570,418,-2438,222,641,-1066,226,582,-1058,-1030,582,-333,-1822,359,-1706,-566,359,-2431,-1034,641,-341,222,641,-1066,-570,418,-2438]},{"n":"petal2","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[-1030,582,333,222,641,1066,226,582,1058,222,641,1066,-566,359,2431,226,582,1058,-570,418,2438,-1822,359,1706,-566,359,2431,-1826,418,1713,-1030,582,333,-1822,359,1706,-566,359,2431,-1030,582,333,226,582,1058,222,641,1066,-1826,418,1713,-570,418,2438,-1030,582,333,-1034,641,341,222,641,1066,222,641,1066,-570,418,2438,-566,359,2431,-570,418,2438,-1826,418,1713,-1822,359,1706,-1826,418,1713,-1034,641,341,-1030,582,333,-566,359,2431,-1822,359,1706,-1030,582,333,222,641,1066,-1034,641,341,-1826,418,1713]},{"n":"mast","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,850,0,0,850,-45,23,850,-39,0,2350,0,23,2350,-39,0,2350,-45,0,2350,-45,23,850,-39,0,850,-45,0,850,0,23,850,-39,39,850,-23,0,2350,0,39,2350,-23,23,2350,-39,23,2350,-39,39,850,-23,23,850,-39,0,850,0,39,850,-23,45,850,0,0,2350,0,45,2350,0,39,2350,-23,39,2350,-23,45,850,0,39,850,-23,0,850,0,45,850,0,39,850,23,0,2350,0,39,2350,23,45,2350,0,45,2350,0,39,850,23,45,850,0,0,850,0,39,850,23,23,850,39,0,2350,0,23,2350,39,39,2350,23,39,2350,23,23,850,39,39,850,23,0,850,0,23,850,39,0,850,45,0,2350,0,0,2350,45,23,2350,39,23,2350,39,0,850,45,23,850,39,0,850,0,0,850,45,-23,850,39,0,2350,0,-23,2350,39,0,2350,45,0,2350,45,-23,850,39,0,850,45,0,850,0,-23,850,39,-39,850,23,0,2350,0,-39,2350,23,-23,2350,39,-23,2350,39,-39,850,23,-23,850,39,0,850,0,-39,850,23,-45,850,0,0,2350,0,-45,2350,0,-39,2350,23,-39,2350,23,-45,850,0,-39,850,23,0,850,0,-45,850,0,-39,850,-23,0,2350,0,-39,2350,-23,-45,2350,0,-45,2350,0,-39,850,-23,-45,850,0,0,850,0,-39,850,-23,-23,850,-39,0,2350,0,-23,2350,-39,-39,2350,-23,-39,2350,-23,-23,850,-39,-39,850,-23,0,850,0,-23,850,-39,0,850,-45,0,2350,0,0,2350,-45,-23,2350,-39,-23,2350,-39,0,850,-45,-23,850,-39,0,2350,-45,23,2350,-39,23,850,-39,23,2350,-39,39,2350,-23,39,850,-23,39,2350,-23,45,2350,0,45,850,0,45,2350,0,39,2350,23,39,850,23,39,2350,23,23,2350,39,23,850,39,23,2350,39,0,2350,45,0,850,45,0,2350,45,-23,2350,39,-23,850,39,-23,2350,39,-39,2350,23,-39,850,23,-39,2350,23,-45,2350,0,-45,850,0,-45,2350,0,-39,2350,-23,-39,850,-23,-39,2350,-23,-23,2350,-39,-23,850,-39,-23,2350,-39,0,2350,-45,0,850,-45]},{"n":"camera","c":[0.28,0.29,0.31],"p":[0,0,0],"v":[-170,2540,110,-170,2300,-110,-170,2300,110,-170,2540,-110,170,2300,-110,-170,2300,-110,170,2540,-110,170,2300,110,170,2300,-110,170,2540,110,-170,2300,110,170,2300,110,170,2300,-110,-170,2300,110,-170,2300,-110,-170,2540,-110,170,2540,110,170,2540,-110,100,2420,70,100,2470,70,135,2455,70,100,2420,190,135,2455,190,100,2470,190,100,2470,190,135,2455,70,100,2470,70,100,2420,70,135,2455,70,150,2420,70,100,2420,190,150,2420,190,135,2455,190,135,2455,190,150,2420,70,135,2455,70,100,2420,70,150,2420,70,135,2385,70,100,2420,190,135,2385,190,150,2420,190,150,2420,190,135,2385,70,150,2420,70,100,2420,70,135,2385,70,100,2370,70,100,2420,190,100,2370,190,135,2385,190,135,2385,190,100,2370,70,135,2385,70,100,2420,70,100,2370,70,65,2385,70,100,2420,190,65,2385,190,100,2370,190,100,2370,190,65,2385,70,100,2370,70,100,2420,70,65,2385,70,50,2420,70,100,2420,190,50,2420,190,65,2385,190,65,2385,70,50,2420,190,50,2420,70,100,2420,70,50,2420,70,65,2455,70,100,2420,190,65,2455,190,50,2420,190,50,2420,190,65,2455,70,50,2420,70,100,2420,70,65,2455,70,100,2470,70,100,2420,190,100,2470,190,65,2455,190,65,2455,190,100,2470,70,65,2455,70,-170,2540,110,-170,2540,-110,-170,2300,-110,-170,2540,-110,170,2540,-110,170,2300,-110,170,2540,-110,170,2540,110,170,2300,110,170,2540,110,-170,2540,110,-170,2300,110,170,2300,-110,170,2300,110,-170,2300,110,-170,2540,-110,-170,2540,110,170,2540,110,100,2470,190,135,2455,190,135,2455,70,135,2455,190,150,2420,190,150,2420,70,150,2420,190,135,2385,190,135,2385,70,135,2385,190,100,2370,190,100,2370,70,100,2370,190,65,2385,190,65,2385,70,65,2385,70,65,2385,190,50,2420,190,50,2420,190,65,2455,190,65,2455,70,65,2455,190,100,2470,190,100,2470,70]},{"n":"sojourner","c":[0.15,0.24,0.42],"p":[2400,0,-1000],"v":[-210,370,310,-210,190,-310,-210,190,310,-210,370,-310,210,190,-310,-210,190,-310,210,370,-310,210,190,310,210,190,-310,210,370,310,-210,190,310,210,190,310,210,190,-310,-210,190,310,-210,190,-310,-210,370,-310,210,370,310,210,370,-310,-275,100,220,-275,100,130,-275,36,156,-205,100,220,-205,36,156,-205,100,130,-205,100,130,-275,36,156,-275,100,130,-275,100,220,-275,36,156,-275,10,220,-205,100,220,-205,10,220,-205,36,156,-205,36,156,-275,10,220,-275,36,156,-275,100,220,-275,10,220,-275,36,284,-205,100,220,-205,36,284,-205,10,220,-205,10,220,-275,36,284,-275,10,220,-275,100,220,-275,36,284,-275,100,310,-205,100,220,-205,100,310,-205,36,284,-275,36,284,-205,100,310,-275,100,310,-275,100,220,-275,100,310,-275,164,284,-205,100,220,-205,164,284,-205,100,310,-205,100,310,-275,164,284,-275,100,310,-275,100,220,-275,164,284,-275,190,220,-205,100,220,-205,190,220,-205,164,284,-205,164,284,-275,190,220,-275,164,284,-275,100,220,-275,190,220,-275,164,156,-205,100,220,-205,164,156,-205,190,220,-205,190,220,-275,164,156,-275,190,220,-275,100,220,-275,164,156,-275,100,130,-205,100,220,-205,100,130,-205,164,156,-205,164,156,-275,100,130,-275,164,156,205,100,220,205,100,130,205,36,156,275,100,220,275,36,156,275,100,130,275,100,130,205,36,156,205,100,130,205,100,220,205,36,156,205,10,220,275,100,220,275,10,220,275,36,156,275,36,156,205,10,220,205,36,156,205,100,220,205,10,220,205,36,284,275,100,220,275,36,284,275,10,220,275,10,220,205,36,284,205,10,220,205,100,220,205,36,284,205,100,310,275,100,220,275,100,310,275,36,284,275,36,284,205,100,310,205,36,284,205,100,220,205,100,310,205,164,284,275,100,220,275,164,284,275,100,310,205,100,310,275,164,284,205,164,284,205,100,220,205,164,284,205,190,220,275,100,220,275,190,220,275,164,284,275,164,284,205,190,220,205,164,284,205,100,220,205,190,220,205,164,156,275,100,220,275,164,156,275,190,220,275,190,220,205,164,156,205,190,220,205,100,220,205,164,156,205,100,130,275,100,220,275,100,130,275,164,156,275,164,156,205,100,130,205,164,156,-275,100,0,-275,100,-90,-275,36,-64,-205,100,0,-205,36,-64,-205,100,-90,-205,100,-90,-275,36,-64,-275,100,-90,-275,100,0,-275,36,-64,-275,10,0,-205,100,0,-205,10,0,-205,36,-64,-205,36,-64,-275,10,0,-275,36,-64,-275,100,0,-275,10,0,-275,36,64,-205,100,0,-205,36,64,-205,10,0,-205,10,0,-275,36,64,-275,10,0,-275,100,0,-275,36,64,-275,100,90,-205,100,0,-205,100,90,-205,36,64,-275,36,64,-205,100,90,-275,100,90,-275,100,0,-275,100,90,-275,164,64,-205,100,0,-205,164,64,-205,100,90,-205,100,90,-275,164,64,-275,100,90,-275,100,0,-275,164,64,-275,190,0,-205,100,0,-205,190,0,-205,164,64,-205,164,64,-275,190,0,-275,164,64,-275,100,0,-275,190,0,-275,164,-64,-205,100,0,-205,164,-64,-205,190,0,-205,190,0,-275,164,-64,-275,190,0,-275,100,0,-275,164,-64,-275,100,-90,-205,100,0,-205,100,-90,-205,164,-64,-205,164,-64,-275,100,-90,-275,164,-64,205,100,0,205,100,-90,205,36,-64,275,100,0,275,36,-64,275,100,-90,275,100,-90,205,36,-64,205,100,-90,205,100,0,205,36,-64,205,10,0,275,100,0,275,10,0,275,36,-64,275,36,-64,205,10,0,205,36,-64,205,100,0,205,10,0,205,36,64,275,100,0,275,36,64,275,10,0,275,10,0,205,36,64,205,10,0,205,100,0,205,36,64,205,100,90,275,100,0,275,100,90,275,36,64,275,36,64,205,100,90,205,36,64,205,100,0,205,100,90,205,164,64,275,100,0,275,164,64,275,100,90,205,100,90,275,164,64,205,164,64,205,100,0,205,164,64,205,190,0,275,100,0,275,190,0,275,164,64,275,164,64,205,190,0,205,164,64,205,100,0,205,190,0,205,164,-64,275,100,0,275,164,-64,275,190,0,275,190,0,205,164,-64,205,190,0,205,100,0,205,164,-64,205,100,-90,275,100,0,275,100,-90,275,164,-64,275,164,-64,205,100,-90,205,164,-64,-275,100,-220,-275,100,-310,-275,36,-284,-205,100,-220,-205,36,-284,-205,100,-310,-205,100,-310,-275,36,-284,-275,100,-310,-275,100,-220,-275,36,-284,-275,10,-220,-205,100,-220,-205,10,-220,-205,36,-284,-205,36,-284,-275,10,-220,-275,36,-284,-275,100,-220,-275,10,-220,-275,36,-156,-205,100,-220,-205,36,-156,-205,10,-220,-205,10,-220,-275,36,-156,-275,10,-220,-275,100,-220,-275,36,-156,-275,100,-130,-205,100,-220,-205,100,-130,-205,36,-156,-275,36,-156,-205,100,-130,-275,100,-130,-275,100,-220,-275,100,-130,-275,164,-156,-205,100,-220,-205,164,-156,-205,100,-130,-205,100,-130,-275,164,-156,-275,100,-130,-275,100,-220,-275,164,-156,-275,190,-220,-205,100,-220,-205,190,-220,-205,164,-156,-205,164,-156,-275,190,-220,-275,164,-156,-275,100,-220,-275,190,-220,-275,164,-284,-205,100,-220,-205,164,-284,-205,190,-220,-205,190,-220,-275,164,-284,-275,190,-220,-275,100,-220,-275,164,-284,-275,100,-310,-205,100,-220,-205,100,-310,-205,164,-284,-205,164,-284,-275,100,-310,-275,164,-284,205,100,-220,205,100,-310,205,36,-284,275,100,-220,275,36,-284,275,100,-310,275,100,-310,205,36,-284,205,100,-310,205,100,-220,205,36,-284,205,10,-220,275,100,-220,275,10,-220,275,36,-284,275,36,-284,205,10,-220,205,36,-284,205,100,-220,205,10,-220,205,36,-156,275,100,-220,275,36,-156,275,10,-220,275,10,-220,205,36,-156,205,10,-220,205,100,-220,205,36,-156,205,100,-130,275,100,-220,275,100,-130,275,36,-156,275,36,-156,205,100,-130,205,36,-156,205,100,-220,205,100,-130,205,164,-156,275,100,-220,275,164,-156,275,100,-130,205,100,-130,275,164,-156,205,164,-156,205,100,-220,205,164,-156,205,190,-220,275,100,-220,275,190,-220,275,164,-156,275,164,-156,205,190,-220,205,164,-156,205,100,-220,205,190,-220,205,164,-284,275,100,-220,275,164,-284,275,190,-220,275,190,-220,205,164,-284,205,190,-220,205,100,-220,205,164,-284,205,100,-310,275,100,-220,275,100,-310,275,164,-284,275,164,-284,205,100,-310,205,164,-284,-210,370,310,-210,370,-310,-210,190,-310,-210,370,-310,210,370,-310,210,190,-310,210,370,-310,210,370,310,210,190,310,210,370,310,-210,370,310,-210,190,310,210,190,-310,210,190,310,-210,190,310,-210,370,-310,-210,370,310,210,370,310,-205,100,130,-205,36,156,-275,36,156,-205,36,156,-205,10,220,-275,10,220,-205,10,220,-205,36,284,-275,36,284,-275,36,284,-205,36,284,-205,100,310,-205,100,310,-205,164,284,-275,164,284,-205,164,284,-205,190,220,-275,190,220,-205,190,220,-205,164,156,-275,164,156,-205,164,156,-205,100,130,-275,100,130,275,100,130,275,36,156,205,36,156,275,36,156,275,10,220,205,10,220,275,10,220,275,36,284,205,36,284,275,36,284,275,100,310,205,100,310,205,100,310,275,100,310,275,164,284,275,164,284,275,190,220,205,190,220,275,190,220,275,164,156,205,164,156,275,164,156,275,100,130,205,100,130,-205,100,-90,-205,36,-64,-275,36,-64,-205,36,-64,-205,10,0,-275,10,0,-205,10,0,-205,36,64,-275,36,64,-275,36,64,-205,36,64,-205,100,90,-205,100,90,-205,164,64,-275,164,64,-205,164,64,-205,190,0,-275,190,0,-205,190,0,-205,164,-64,-275,164,-64,-205,164,-64,-205,100,-90,-275,100,-90,275,100,-90,275,36,-64,205,36,-64,275,36,-64,275,10,0,205,10,0,275,10,0,275,36,64,205,36,64,275,36,64,275,100,90,205,100,90,205,100,90,275,100,90,275,164,64,275,164,64,275,190,0,205,190,0,275,190,0,275,164,-64,205,164,-64,275,164,-64,275,100,-90,205,100,-90,-205,100,-310,-205,36,-284,-275,36,-284,-205,36,-284,-205,10,-220,-275,10,-220,-205,10,-220,-205,36,-156,-275,36,-156,-275,36,-156,-205,36,-156,-205,100,-130,-205,100,-130,-205,164,-156,-275,164,-156,-205,164,-156,-205,190,-220,-275,190,-220,-205,190,-220,-205,164,-284,-275,164,-284,-205,164,-284,-205,100,-310,-275,100,-310,275,100,-310,275,36,-284,205,36,-284,275,36,-284,275,10,-220,205,10,-220,275,10,-220,275,36,-156,205,36,-156,275,36,-156,275,100,-130,205,100,-130,205,100,-130,275,100,-130,275,164,-156,275,164,-156,275,190,-220,205,190,-220,275,190,-220,275,164,-284,205,164,-284,275,164,-284,275,100,-310,205,100,-310]}],"landerGeneric":[{"n":"body","c":[0.72,0.55,0.22],"p":[0,0,0],"v":[0,375,0,0,375,-1050,909,375,-525,0,1125,0,1039,1125,-600,0,1125,-1200,0,1125,-1200,909,375,-525,0,375,-1050,0,375,0,909,375,-525,909,375,525,0,1125,0,1039,1125,600,1039,1125,-600,1039,1125,-600,909,375,525,909,375,-525,0,375,0,909,375,525,0,375,1050,0,1125,0,0,1125,1200,1039,1125,600,1039,1125,600,0,375,1050,909,375,525,0,375,0,0,375,1050,-909,375,525,0,1125,0,-1039,1125,600,0,1125,1200,0,1125,1200,-909,375,525,0,375,1050,0,375,0,-909,375,525,-909,375,-525,0,1125,0,-1039,1125,-600,-1039,1125,600,-1039,1125,600,-909,375,-525,-909,375,525,0,375,0,-909,375,-525,0,375,-1050,0,1125,0,0,1125,-1200,-1039,1125,-600,-1039,1125,-600,0,375,-1050,-909,375,-525,0,1125,-1200,1039,1125,-600,909,375,-525,1039,1125,-600,1039,1125,600,909,375,525,1039,1125,600,0,1125,1200,0,375,1050,0,1125,1200,-1039,1125,600,-909,375,525,-1039,1125,600,-1039,1125,-600,-909,375,-525,-1039,1125,-600,0,1125,-1200,0,375,-1050]},{"n":"top","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[-550,1475,650,-550,1125,-650,-550,1125,650,-550,1475,-650,550,1125,-650,-550,1125,-650,550,1475,-650,550,1125,650,550,1125,-650,550,1475,650,-550,1125,650,550,1125,650,550,1125,-650,-550,1125,650,-550,1125,-650,-550,1475,-650,550,1475,650,550,1475,-650,-550,1475,650,-550,1475,-650,-550,1125,-650,-550,1475,-650,550,1475,-650,550,1125,-650,550,1475,-650,550,1475,650,550,1125,650,550,1475,650,-550,1475,650,-550,1125,650,550,1125,-650,550,1125,650,-550,1125,650,-550,1475,-650,-550,1475,650,550,1475,650]},{"n":"legs","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[642,-36,-551,642,-36,-611,667,-53,-603,1376,1036,-551,1413,1011,-629,1376,1036,-641,1376,1036,-641,667,-53,-603,642,-36,-611,642,-36,-551,667,-53,-603,685,-66,-581,1376,1036,-551,1441,992,-596,1413,1011,-629,1413,1011,-629,685,-66,-581,667,-53,-603,642,-36,-551,685,-66,-581,692,-70,-551,1376,1036,-551,1451,986,-551,1441,992,-596,685,-66,-581,1451,986,-551,692,-70,-551,642,-36,-551,692,-70,-551,685,-66,-521,1376,1036,-551,1441,992,-506,1451,986,-551,1451,986,-551,685,-66,-521,692,-70,-551,642,-36,-551,685,-66,-521,667,-53,-499,1376,1036,-551,1413,1011,-473,1441,992,-506,685,-66,-521,1413,1011,-473,667,-53,-499,642,-36,-551,667,-53,-499,642,-36,-491,1376,1036,-551,1376,1036,-461,1413,1011,-473,667,-53,-499,1376,1036,-461,642,-36,-491,642,-36,-551,642,-36,-491,617,-20,-499,1376,1036,-551,1339,1062,-473,1376,1036,-461,1376,1036,-461,617,-20,-499,642,-36,-491,642,-36,-551,617,-20,-499,599,-7,-521,1376,1036,-551,1312,1080,-506,1339,1062,-473,617,-20,-499,1312,1080,-506,599,-7,-521,642,-36,-551,599,-7,-521,593,-3,-551,1376,1036,-551,1302,1087,-551,1312,1080,-506,599,-7,-521,1302,1087,-551,593,-3,-551,642,-36,-551,593,-3,-551,599,-7,-581,1376,1036,-551,1312,1080,-596,1302,1087,-551,1302,1087,-551,599,-7,-581,593,-3,-551,642,-36,-551,599,-7,-581,617,-20,-603,1376,1036,-551,1339,1062,-629,1312,1080,-596,599,-7,-581,1339,1062,-629,617,-20,-603,642,-36,-551,617,-20,-603,642,-36,-611,1376,1036,-551,1376,1036,-641,1339,1062,-629,617,-20,-603,1376,1036,-641,642,-36,-611,1360,0,-743,1360,0,-1043,1572,0,-955,1360,100,-743,1601,100,-984,1360,100,-1083,1360,100,-1083,1572,0,-955,1360,0,-1043,1360,0,-743,1572,0,-955,1660,0,-743,1360,100,-743,1700,100,-743,1601,100,-984,1601,100,-984,1660,0,-743,1572,0,-955,1360,0,-743,1660,0,-743,1572,0,-531,1360,100,-743,1601,100,-503,1700,100,-743,1660,0,-743,1601,100,-503,1572,0,-531,1360,0,-743,1572,0,-531,1360,0,-443,1360,100,-743,1360,100,-403,1601,100,-503,1601,100,-503,1360,0,-443,1572,0,-531,1360,0,-743,1360,0,-443,1148,0,-531,1360,100,-743,1120,100,-503,1360,100,-403,1360,100,-403,1148,0,-531,1360,0,-443,1360,0,-743,1148,0,-531,1060,0,-743,1360,100,-743,1020,100,-743,1120,100,-503,1148,0,-531,1020,100,-743,1060,0,-743,1360,0,-743,1060,0,-743,1148,0,-955,1360,100,-743,1120,100,-984,1020,100,-743,1020,100,-743,1148,0,-955,1060,0,-743,1360,0,-743,1148,0,-955,1360,0,-1043,1360,100,-743,1360,100,-1083,1120,100,-984,1148,0,-955,1360,100,-1083,1360,0,-1043,-615,-36,-598,-615,-36,-658,-590,-20,-650,-1349,1036,-598,-1312,1062,-676,-1349,1036,-688,-1349,1036,-688,-590,-20,-650,-615,-36,-658,-615,-36,-598,-590,-20,-650,-572,-7,-628,-1349,1036,-598,-1285,1080,-643,-1312,1062,-676,-1312,1062,-676,-572,-7,-628,-590,-20,-650,-615,-36,-598,-572,-7,-628,-566,-3,-598,-1349,1036,-598,-1275,1087,-598,-1285,1080,-643,-1285,1080,-643,-566,-3,-598,-572,-7,-628,-615,-36,-598,-566,-3,-598,-572,-7,-568,-1349,1036,-598,-1285,1080,-553,-1275,1087,-598,-1275,1087,-598,-572,-7,-568,-566,-3,-598,-615,-36,-598,-572,-7,-568,-590,-20,-546,-1349,1036,-598,-1312,1062,-520,-1285,1080,-553,-572,-7,-568,-1312,1062,-520,-590,-20,-546,-615,-36,-598,-590,-20,-546,-615,-36,-538,-1349,1036,-598,-1349,1036,-508,-1312,1062,-520,-590,-20,-546,-1349,1036,-508,-615,-36,-538,-615,-36,-598,-615,-36,-538,-640,-53,-546,-1349,1036,-598,-1386,1011,-520,-1349,1036,-508,-615,-36,-538,-1386,1011,-520,-640,-53,-546,-615,-36,-598,-640,-53,-546,-658,-66,-568,-1349,1036,-598,-1413,992,-553,-1386,1011,-520,-640,-53,-546,-1413,992,-553,-658,-66,-568,-615,-36,-598,-658,-66,-568,-665,-70,-598,-1349,1036,-598,-1423,986,-598,-1413,992,-553,-1413,992,-553,-665,-70,-598,-658,-66,-568,-615,-36,-598,-665,-70,-598,-658,-66,-628,-1349,1036,-598,-1413,992,-643,-1423,986,-598,-1423,986,-598,-658,-66,-628,-665,-70,-598,-615,-36,-598,-658,-66,-628,-640,-53,-650,-1349,1036,-598,-1386,1011,-676,-1413,992,-643,-658,-66,-628,-1386,1011,-676,-640,-53,-650,-615,-36,-598,-640,-53,-650,-615,-36,-658,-1349,1036,-598,-1349,1036,-688,-1386,1011,-676,-640,-53,-650,-1349,1036,-688,-615,-36,-658,-1324,0,-806,-1324,0,-1106,-1112,0,-1019,-1324,100,-806,-1083,100,-1047,-1324,100,-1146,-1324,0,-1106,-1083,100,-1047,-1112,0,-1019,-1324,0,-806,-1112,0,-1019,-1024,0,-806,-1324,100,-806,-984,100,-806,-1083,100,-1047,-1083,100,-1047,-1024,0,-806,-1112,0,-1019,-1324,0,-806,-1024,0,-806,-1112,0,-594,-1324,100,-806,-1083,100,-566,-984,100,-806,-1024,0,-806,-1083,100,-566,-1112,0,-594,-1324,0,-806,-1112,0,-594,-1324,0,-506,-1324,100,-806,-1324,100,-466,-1083,100,-566,-1112,0,-594,-1324,100,-466,-1324,0,-506,-1324,0,-806,-1324,0,-506,-1536,0,-594,-1324,100,-806,-1564,100,-566,-1324,100,-466,-1324,100,-466,-1536,0,-594,-1324,0,-506,-1324,0,-806,-1536,0,-594,-1624,0,-806,-1324,100,-806,-1664,100,-806,-1564,100,-566,-1564,100,-566,-1624,0,-806,-1536,0,-594,-1324,0,-806,-1624,0,-806,-1536,0,-1019,-1324,100,-806,-1564,100,-1047,-1664,100,-806,-1624,0,-806,-1564,100,-1047,-1536,0,-1019,-1324,0,-806,-1536,0,-1019,-1324,0,-1106,-1324,100,-806,-1324,100,-1146,-1564,100,-1047,-1564,100,-1047,-1324,0,-1106,-1536,0,-1019,-27,-36,783,-27,-3,733,3,-7,740,-27,1036,1517,18,1080,1452,-27,1087,1442,-27,1087,1442,3,-7,740,-27,-3,733,-27,-36,783,3,-7,740,25,-20,758,-27,1036,1517,51,1062,1480,18,1080,1452,18,1080,1452,25,-20,758,3,-7,740,-27,-36,783,25,-20,758,33,-36,783,-27,1036,1517,63,1036,1517,51,1062,1480,25,-20,758,63,1036,1517,33,-36,783,-27,-36,783,33,-36,783,25,-53,807,-27,1036,1517,51,1011,1554,63,1036,1517,33,-36,783,51,1011,1554,25,-53,807,-27,-36,783,25,-53,807,3,-66,826,-27,1036,1517,18,992,1581,51,1011,1554,25,-53,807,18,992,1581,3,-66,826,-27,-36,783,3,-66,826,-27,-70,832,-27,1036,1517,-27,986,1591,18,992,1581,18,992,1581,-27,-70,832,3,-66,826,-27,-36,783,-27,-70,832,-57,-66,826,-27,1036,1517,-72,992,1581,-27,986,1591,-27,-70,832,-72,992,1581,-57,-66,826,-27,-36,783,-57,-66,826,-79,-53,807,-27,1036,1517,-105,1011,1554,-72,992,1581,-57,-66,826,-105,1011,1554,-79,-53,807,-27,-36,783,-79,-53,807,-87,-36,783,-27,1036,1517,-117,1036,1517,-105,1011,1554,-79,-53,807,-117,1036,1517,-87,-36,783,-27,-36,783,-87,-36,783,-79,-20,758,-27,1036,1517,-105,1062,1480,-117,1036,1517,-87,-36,783,-105,1062,1480,-79,-20,758,-27,-36,783,-79,-20,758,-57,-7,740,-27,1036,1517,-72,1080,1452,-105,1062,1480,-105,1062,1480,-57,-7,740,-79,-20,758,-27,-36,783,-57,-7,740,-27,-3,733,-27,1036,1517,-27,1087,1442,-72,1080,1452,-72,1080,1452,-27,-3,733,-57,-7,740,-37,0,1550,-37,0,1250,176,0,1337,-37,100,1550,204,100,1309,-37,100,1210,-37,0,1250,204,100,1309,176,0,1337,-37,0,1550,176,0,1337,263,0,1550,-37,100,1550,303,100,1550,204,100,1309,204,100,1309,263,0,1550,176,0,1337,-37,0,1550,263,0,1550,176,0,1762,-37,100,1550,204,100,1790,303,100,1550,303,100,1550,176,0,1762,263,0,1550,-37,0,1550,176,0,1762,-37,0,1850,-37,100,1550,-37,100,1890,204,100,1790,204,100,1790,-37,0,1850,176,0,1762,-37,0,1550,-37,0,1850,-249,0,1762,-37,100,1550,-277,100,1790,-37,100,1890,-37,100,1890,-249,0,1762,-37,0,1850,-37,0,1550,-249,0,1762,-337,0,1550,-37,100,1550,-377,100,1550,-277,100,1790,-277,100,1790,-337,0,1550,-249,0,1762,-37,0,1550,-337,0,1550,-249,0,1337,-37,100,1550,-277,100,1309,-377,100,1550,-377,100,1550,-249,0,1337,-337,0,1550,-37,0,1550,-249,0,1337,-37,0,1250,-37,100,1550,-37,100,1210,-277,100,1309,-277,100,1309,-37,0,1250,-249,0,1337,1376,1036,-641,1413,1011,-629,667,-53,-603,1413,1011,-629,1441,992,-596,685,-66,-581,685,-66,-581,1441,992,-596,1451,986,-551,1451,986,-551,1441,992,-506,685,-66,-521,685,-66,-521,1441,992,-506,1413,1011,-473,667,-53,-499,1413,1011,-473,1376,1036,-461,1376,1036,-461,1339,1062,-473,617,-20,-499,617,-20,-499,1339,1062,-473,1312,1080,-506,599,-7,-521,1312,1080,-506,1302,1087,-551,1302,1087,-551,1312,1080,-596,599,-7,-581,599,-7,-581,1312,1080,-596,1339,1062,-629,617,-20,-603,1339,1062,-629,1376,1036,-641,1360,100,-1083,1601,100,-984,1572,0,-955,1601,100,-984,1700,100,-743,1660,0,-743,1660,0,-743,1700,100,-743,1601,100,-503,1601,100,-503,1360,100,-403,1360,0,-443,1360,100,-403,1120,100,-503,1148,0,-531,1148,0,-531,1120,100,-503,1020,100,-743,1020,100,-743,1120,100,-984,1148,0,-955,1148,0,-955,1120,100,-984,1360,100,-1083,-1349,1036,-688,-1312,1062,-676,-590,-20,-650,-1312,1062,-676,-1285,1080,-643,-572,-7,-628,-1285,1080,-643,-1275,1087,-598,-566,-3,-598,-1275,1087,-598,-1285,1080,-553,-572,-7,-568,-572,-7,-568,-1285,1080,-553,-1312,1062,-520,-590,-20,-546,-1312,1062,-520,-1349,1036,-508,-615,-36,-538,-1349,1036,-508,-1386,1011,-520,-640,-53,-546,-1386,1011,-520,-1413,992,-553,-1413,992,-553,-1423,986,-598,-665,-70,-598,-1423,986,-598,-1413,992,-643,-658,-66,-628,-658,-66,-628,-1413,992,-643,-1386,1011,-676,-640,-53,-650,-1386,1011,-676,-1349,1036,-688,-1324,0,-1106,-1324,100,-1146,-1083,100,-1047,-1083,100,-1047,-984,100,-806,-1024,0,-806,-1024,0,-806,-984,100,-806,-1083,100,-566,-1112,0,-594,-1083,100,-566,-1324,100,-466,-1324,100,-466,-1564,100,-566,-1536,0,-594,-1564,100,-566,-1664,100,-806,-1624,0,-806,-1624,0,-806,-1664,100,-806,-1564,100,-1047,-1564,100,-1047,-1324,100,-1146,-1324,0,-1106,-27,1087,1442,18,1080,1452,3,-7,740,18,1080,1452,51,1062,1480,25,-20,758,25,-20,758,51,1062,1480,63,1036,1517,33,-36,783,63,1036,1517,51,1011,1554,25,-53,807,51,1011,1554,18,992,1581,18,992,1581,-27,986,1591,-27,-70,832,-27,-70,832,-27,986,1591,-72,992,1581,-57,-66,826,-72,992,1581,-105,1011,1554,-79,-53,807,-105,1011,1554,-117,1036,1517,-87,-36,783,-117,1036,1517,-105,1062,1480,-105,1062,1480,-72,1080,1452,-57,-7,740,-72,1080,1452,-27,1087,1442,-27,-3,733,-37,0,1250,-37,100,1210,204,100,1309,204,100,1309,303,100,1550,263,0,1550,303,100,1550,204,100,1790,176,0,1762,204,100,1790,-37,100,1890,-37,0,1850,-37,100,1890,-277,100,1790,-249,0,1762,-277,100,1790,-377,100,1550,-337,0,1550,-377,100,1550,-277,100,1309,-249,0,1337,-277,100,1309,-37,100,1210,-37,0,1250]},{"n":"dish","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[400,1718,-422,400,1982,-905,675,1947,-840,400,1982,-278,440,2015,-339,400,2020,-348,400,2020,-348,675,1947,-840,400,1982,-905,400,1718,-422,675,1947,-840,876,1850,-663,400,1982,-278,469,2001,-313,440,2015,-339,440,2015,-339,876,1850,-663,675,1947,-840,400,1718,-422,876,1850,-663,950,1718,-422,400,1982,-278,480,1982,-278,469,2001,-313,469,2001,-313,950,1718,-422,876,1850,-663,400,1718,-422,950,1718,-422,876,1587,-181,400,1982,-278,469,1962,-243,480,1982,-278,480,1982,-278,876,1587,-181,950,1718,-422,400,1718,-422,876,1587,-181,675,1490,-4,400,1982,-278,440,1948,-217,469,1962,-243,876,1587,-181,440,1948,-217,675,1490,-4,400,1718,-422,675,1490,-4,400,1455,61,400,1982,-278,400,1943,-208,440,1948,-217,675,1490,-4,400,1943,-208,400,1455,61,400,1718,-422,400,1455,61,125,1490,-4,400,1982,-278,360,1948,-217,400,1943,-208,400,1943,-208,125,1490,-4,400,1455,61,400,1718,-422,125,1490,-4,-76,1587,-181,400,1982,-278,331,1962,-243,360,1948,-217,360,1948,-217,-76,1587,-181,125,1490,-4,400,1718,-422,-76,1587,-181,-150,1718,-422,400,1982,-278,320,1982,-278,331,1962,-243,331,1962,-243,-150,1718,-422,-76,1587,-181,400,1718,-422,-150,1718,-422,-76,1850,-663,400,1982,-278,331,2001,-313,320,1982,-278,320,1982,-278,-76,1850,-663,-150,1718,-422,400,1718,-422,-76,1850,-663,125,1947,-840,400,1982,-278,360,2015,-339,331,2001,-313,-76,1850,-663,360,2015,-339,125,1947,-840,400,1718,-422,125,1947,-840,400,1982,-905,400,1982,-278,400,2020,-348,360,2015,-339,125,1947,-840,400,2020,-348,400,1982,-905,400,2020,-348,440,2015,-339,675,1947,-840,440,2015,-339,469,2001,-313,876,1850,-663,469,2001,-313,480,1982,-278,950,1718,-422,480,1982,-278,469,1962,-243,876,1587,-181,876,1587,-181,469,1962,-243,440,1948,-217,675,1490,-4,440,1948,-217,400,1943,-208,400,1943,-208,360,1948,-217,125,1490,-4,360,1948,-217,331,1962,-243,-76,1587,-181,331,1962,-243,320,1982,-278,-150,1718,-422,320,1982,-278,331,2001,-313,-76,1850,-663,-76,1850,-663,331,2001,-313,360,2015,-339,125,1947,-840,360,2015,-339,400,2020,-348]},{"n":"panel","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[-1300,1130,1400,-1300,1170,500,-1300,1080,1395,-1300,1220,505,1300,1170,500,-1300,1170,500,1300,1170,500,1300,1130,1400,1300,1080,1395,1300,1130,1400,-1300,1080,1395,1300,1080,1395,1300,1170,500,-1300,1080,1395,-1300,1170,500,-1300,1220,505,1300,1130,1400,1300,1220,505,-1300,1130,1400,-1300,1220,505,-1300,1170,500,-1300,1220,505,1300,1220,505,1300,1170,500,1300,1170,500,1300,1220,505,1300,1130,1400,1300,1130,1400,-1300,1130,1400,-1300,1080,1395,1300,1170,500,1300,1080,1395,-1300,1080,1395,-1300,1220,505,-1300,1130,1400,1300,1130,1400]}],"roverGeneric":[{"n":"deck","c":[0.72,0.55,0.22],"p":[0,0,0],"v":[-750,1125,1050,-750,575,-1050,-750,575,1050,-750,1125,-1050,750,575,-1050,-750,575,-1050,750,1125,-1050,750,575,1050,750,575,-1050,750,1125,1050,-750,575,1050,750,575,1050,750,575,-1050,-750,575,1050,-750,575,-1050,-750,1125,-1050,750,1125,1050,750,1125,-1050,-750,1125,1050,-750,1125,-1050,-750,575,-1050,-750,1125,-1050,750,1125,-1050,750,575,-1050,750,1125,-1050,750,1125,1050,750,575,1050,750,1125,1050,-750,1125,1050,-750,575,1050,750,575,-1050,750,575,1050,-750,575,1050,-750,1125,-1050,-750,1125,1050,750,1125,1050]},{"n":"top","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[-850,1190,1150,-850,1130,-1150,-850,1130,1150,-850,1190,-1150,850,1130,-1150,-850,1130,-1150,850,1190,-1150,850,1130,1150,850,1130,-1150,850,1190,1150,-850,1130,1150,850,1130,1150,850,1130,-1150,-850,1130,1150,-850,1130,-1150,-850,1190,-1150,850,1190,1150,850,1190,-1150,-1490,1237,0,-1499,1178,-800,-1499,1178,0,-1499,1178,-800,-601,1102,-800,-610,1043,-800,-601,1102,-800,-610,1043,0,-610,1043,-800,-601,1102,0,-1499,1178,0,-610,1043,0,-610,1043,-800,-1499,1178,0,-1499,1178,-800,-1490,1237,-800,-601,1102,0,-601,1102,-800,601,1102,0,610,1043,-800,610,1043,0,601,1102,-800,1499,1178,-800,610,1043,-800,1490,1237,-800,1499,1178,0,1499,1178,-800,1499,1178,0,601,1102,0,610,1043,0,1499,1178,-800,610,1043,0,610,1043,-800,601,1102,-800,1490,1237,0,1490,1237,-800,-850,1190,1150,-850,1190,-1150,-850,1130,-1150,-850,1190,-1150,850,1190,-1150,850,1130,-1150,850,1190,-1150,850,1190,1150,850,1130,1150,850,1190,1150,-850,1190,1150,-850,1130,1150,850,1130,-1150,850,1130,1150,-850,1130,1150,-850,1190,-1150,-850,1190,1150,850,1190,1150,-1490,1237,0,-1490,1237,-800,-1499,1178,-800,-1499,1178,-800,-1490,1237,-800,-601,1102,-800,-601,1102,-800,-601,1102,0,-610,1043,0,-601,1102,0,-1490,1237,0,-1499,1178,0,-610,1043,-800,-610,1043,0,-1499,1178,0,-1490,1237,-800,-1490,1237,0,-601,1102,0,601,1102,0,601,1102,-800,610,1043,-800,601,1102,-800,1490,1237,-800,1499,1178,-800,1490,1237,-800,1490,1237,0,1499,1178,0,1499,1178,0,1490,1237,0,601,1102,0,1499,1178,-800,1499,1178,0,610,1043,0,601,1102,-800,601,1102,0,1490,1237,0]},{"n":"wheels","c":[0.16,0.16,0.17],"p":[0,0,0],"v":[-960,320,800,-960,320,500,-960,144,557,-740,320,800,-740,144,557,-740,320,500,-960,320,500,-740,144,557,-960,144,557,-960,320,800,-960,144,557,-960,35,707,-740,320,800,-740,35,707,-740,144,557,-740,144,557,-960,35,707,-960,144,557,-960,320,800,-960,35,707,-960,35,893,-740,320,800,-740,35,893,-740,35,707,-740,35,707,-960,35,893,-960,35,707,-960,320,800,-960,35,893,-960,144,1043,-740,320,800,-740,144,1043,-740,35,893,-960,35,893,-740,144,1043,-960,144,1043,-960,320,800,-960,144,1043,-960,320,1100,-740,320,800,-740,320,1100,-740,144,1043,-740,144,1043,-960,320,1100,-960,144,1043,-960,320,800,-960,320,1100,-960,496,1043,-740,320,800,-740,496,1043,-740,320,1100,-740,320,1100,-960,496,1043,-960,320,1100,-960,320,800,-960,496,1043,-960,605,893,-740,320,800,-740,605,893,-740,496,1043,-960,496,1043,-740,605,893,-960,605,893,-960,320,800,-960,605,893,-960,605,707,-740,320,800,-740,605,707,-740,605,893,-740,605,893,-960,605,707,-960,605,893,-960,320,800,-960,605,707,-960,496,557,-740,320,800,-740,496,557,-740,605,707,-740,605,707,-960,496,557,-960,605,707,-960,320,800,-960,496,557,-960,320,500,-740,320,800,-740,320,500,-740,496,557,-740,496,557,-960,320,500,-960,496,557,740,320,800,740,320,500,740,144,557,960,320,800,960,144,557,960,320,500,740,320,500,960,144,557,740,144,557,740,320,800,740,144,557,740,35,707,960,320,800,960,35,707,960,144,557,960,144,557,740,35,707,740,144,557,740,320,800,740,35,707,740,35,893,960,320,800,960,35,893,960,35,707,960,35,707,740,35,893,740,35,707,740,320,800,740,35,893,740,144,1043,960,320,800,960,144,1043,960,35,893,740,35,893,960,144,1043,740,144,1043,740,320,800,740,144,1043,740,320,1100,960,320,800,960,320,1100,960,144,1043,960,144,1043,740,320,1100,740,144,1043,740,320,800,740,320,1100,740,496,1043,960,320,800,960,496,1043,960,320,1100,960,320,1100,740,496,1043,740,320,1100,740,320,800,740,496,1043,740,605,893,960,320,800,960,605,893,960,496,1043,740,496,1043,960,605,893,740,605,893,740,320,800,740,605,893,740,605,707,960,320,800,960,605,707,960,605,893,960,605,893,740,605,707,740,605,893,740,320,800,740,605,707,740,496,557,960,320,800,960,496,557,960,605,707,960,605,707,740,496,557,740,605,707,740,320,800,740,496,557,740,320,500,960,320,800,960,320,500,960,496,557,960,496,557,740,320,500,740,496,557,-960,320,0,-960,320,-300,-960,144,-243,-740,320,0,-740,144,-243,-740,320,-300,-960,320,-300,-740,144,-243,-960,144,-243,-960,320,0,-960,144,-243,-960,35,-93,-740,320,0,-740,35,-93,-740,144,-243,-740,144,-243,-960,35,-93,-960,144,-243,-960,320,0,-960,35,-93,-960,35,93,-740,320,0,-740,35,93,-740,35,-93,-740,35,-93,-960,35,93,-960,35,-93,-960,320,0,-960,35,93,-960,144,243,-740,320,0,-740,144,243,-740,35,93,-740,35,93,-960,144,243,-960,35,93,-960,320,0,-960,144,243,-960,320,300,-740,320,0,-740,320,300,-740,144,243,-740,144,243,-960,320,300,-960,144,243,-960,320,0,-960,320,300,-960,496,243,-740,320,0,-740,496,243,-740,320,300,-740,320,300,-960,496,243,-960,320,300,-960,320,0,-960,496,243,-960,605,93,-740,320,0,-740,605,93,-740,496,243,-960,496,243,-740,605,93,-960,605,93,-960,320,0,-960,605,93,-960,605,-93,-740,320,0,-740,605,-93,-740,605,93,-740,605,93,-960,605,-93,-960,605,93,-960,320,0,-960,605,-93,-960,496,-243,-740,320,0,-740,496,-243,-740,605,-93,-740,605,-93,-960,496,-243,-960,605,-93,-960,320,0,-960,496,-243,-960,320,-300,-740,320,0,-740,320,-300,-740,496,-243,-740,496,-243,-960,320,-300,-960,496,-243,740,320,0,740,320,-300,740,144,-243,960,320,0,960,144,-243,960,320,-300,960,320,-300,740,144,-243,740,320,-300,740,320,0,740,144,-243,740,35,-93,960,320,0,960,35,-93,960,144,-243,960,144,-243,740,35,-93,740,144,-243,740,320,0,740,35,-93,740,35,93,960,320,0,960,35,93,960,35,-93,960,35,-93,740,35,93,740,35,-93,740,320,0,740,35,93,740,144,243,960,320,0,960,144,243,960,35,93,740,35,93,960,144,243,740,144,243,740,320,0,740,144,243,740,320,300,960,320,0,960,320,300,960,144,243,960,144,243,740,320,300,740,144,243,740,320,0,740,320,300,740,496,243,960,320,0,960,496,243,960,320,300,960,320,300,740,496,243,740,320,300,740,320,0,740,496,243,740,605,93,960,320,0,960,605,93,960,496,243,740,496,243,960,605,93,740,605,93,740,320,0,740,605,93,740,605,-93,960,320,0,960,605,-93,960,605,93,960,605,93,740,605,-93,740,605,93,740,320,0,740,605,-93,740,496,-243,960,320,0,960,496,-243,960,605,-93,960,605,-93,740,496,-243,740,605,-93,740,320,0,740,496,-243,740,320,-300,960,320,0,960,320,-300,960,496,-243,960,496,-243,740,320,-300,740,496,-243,-960,320,-800,-960,320,-1100,-960,144,-1043,-740,320,-800,-740,144,-1043,-740,320,-1100,-960,320,-1100,-740,144,-1043,-960,144,-1043,-960,320,-800,-960,144,-1043,-960,35,-893,-740,320,-800,-740,35,-893,-740,144,-1043,-740,144,-1043,-960,35,-893,-960,144,-1043,-960,320,-800,-960,35,-893,-960,35,-707,-740,320,-800,-740,35,-707,-740,35,-893,-740,35,-893,-960,35,-707,-960,35,-893,-960,320,-800,-960,35,-707,-960,144,-557,-740,320,-800,-740,144,-557,-740,35,-707,-740,35,-707,-960,144,-557,-960,35,-707,-960,320,-800,-960,144,-557,-960,320,-500,-740,320,-800,-740,320,-500,-740,144,-557,-740,144,-557,-960,320,-500,-960,144,-557,-960,320,-800,-960,320,-500,-960,496,-557,-740,320,-800,-740,496,-557,-740,320,-500,-740,320,-500,-960,496,-557,-960,320,-500,-960,320,-800,-960,496,-557,-960,605,-707,-740,320,-800,-740,605,-707,-740,496,-557,-960,496,-557,-740,605,-707,-960,605,-707,-960,320,-800,-960,605,-707,-960,605,-893,-740,320,-800,-740,605,-893,-740,605,-707,-740,605,-707,-960,605,-893,-960,605,-707,-960,320,-800,-960,605,-893,-960,496,-1043,-740,320,-800,-740,496,-1043,-740,605,-893,-740,605,-893,-960,496,-1043,-960,605,-893,-960,320,-800,-960,496,-1043,-960,320,-1100,-740,320,-800,-740,320,-1100,-740,496,-1043,-740,496,-1043,-960,320,-1100,-960,496,-1043,740,320,-800,740,320,-1100,740,144,-1043,960,320,-800,960,144,-1043,960,320,-1100,740,320,-1100,960,144,-1043,740,144,-1043,740,320,-800,740,144,-1043,740,35,-893,960,320,-800,960,35,-893,960,144,-1043,960,144,-1043,740,35,-893,740,144,-1043,740,320,-800,740,35,-893,740,35,-707,960,320,-800,960,35,-707,960,35,-893,960,35,-893,740,35,-707,740,35,-893,740,320,-800,740,35,-707,740,144,-557,960,320,-800,960,144,-557,960,35,-707,960,35,-707,740,144,-557,740,35,-707,740,320,-800,740,144,-557,740,320,-500,960,320,-800,960,320,-500,960,144,-557,960,144,-557,740,320,-500,740,144,-557,740,320,-800,740,320,-500,740,496,-557,960,320,-800,960,496,-557,960,320,-500,960,320,-500,740,496,-557,740,320,-500,740,320,-800,740,496,-557,740,605,-707,960,320,-800,960,605,-707,960,496,-557,740,496,-557,960,605,-707,740,605,-707,740,320,-800,740,605,-707,740,605,-893,960,320,-800,960,605,-893,960,605,-707,960,605,-707,740,605,-893,740,605,-707,740,320,-800,740,605,-893,740,496,-1043,960,320,-800,960,496,-1043,960,605,-893,960,605,-893,740,496,-1043,740,605,-893,740,320,-800,740,496,-1043,740,320,-1100,960,320,-800,960,320,-1100,960,496,-1043,960,496,-1043,740,320,-1100,740,496,-1043,-960,320,500,-740,320,500,-740,144,557,-740,144,557,-740,35,707,-960,35,707,-740,35,707,-740,35,893,-960,35,893,-960,35,893,-740,35,893,-740,144,1043,-740,144,1043,-740,320,1100,-960,320,1100,-740,320,1100,-740,496,1043,-960,496,1043,-960,496,1043,-740,496,1043,-740,605,893,-740,605,893,-740,605,707,-960,605,707,-740,605,707,-740,496,557,-960,496,557,-740,496,557,-740,320,500,-960,320,500,740,320,500,960,320,500,960,144,557,960,144,557,960,35,707,740,35,707,960,35,707,960,35,893,740,35,893,740,35,893,960,35,893,960,144,1043,960,144,1043,960,320,1100,740,320,1100,960,320,1100,960,496,1043,740,496,1043,740,496,1043,960,496,1043,960,605,893,960,605,893,960,605,707,740,605,707,960,605,707,960,496,557,740,496,557,960,496,557,960,320,500,740,320,500,-960,320,-300,-740,320,-300,-740,144,-243,-740,144,-243,-740,35,-93,-960,35,-93,-740,35,-93,-740,35,93,-960,35,93,-740,35,93,-740,144,243,-960,144,243,-740,144,243,-740,320,300,-960,320,300,-740,320,300,-740,496,243,-960,496,243,-960,496,243,-740,496,243,-740,605,93,-740,605,93,-740,605,-93,-960,605,-93,-740,605,-93,-740,496,-243,-960,496,-243,-740,496,-243,-740,320,-300,-960,320,-300,960,320,-300,960,144,-243,740,144,-243,960,144,-243,960,35,-93,740,35,-93,960,35,-93,960,35,93,740,35,93,740,35,93,960,35,93,960,144,243,960,144,243,960,320,300,740,320,300,960,320,300,960,496,243,740,496,243,740,496,243,960,496,243,960,605,93,960,605,93,960,605,-93,740,605,-93,960,605,-93,960,496,-243,740,496,-243,960,496,-243,960,320,-300,740,320,-300,-960,320,-1100,-740,320,-1100,-740,144,-1043,-740,144,-1043,-740,35,-893,-960,35,-893,-740,35,-893,-740,35,-707,-960,35,-707,-740,35,-707,-740,144,-557,-960,144,-557,-740,144,-557,-740,320,-500,-960,320,-500,-740,320,-500,-740,496,-557,-960,496,-557,-960,496,-557,-740,496,-557,-740,605,-707,-740,605,-707,-740,605,-893,-960,605,-893,-740,605,-893,-740,496,-1043,-960,496,-1043,-740,496,-1043,-740,320,-1100,-960,320,-1100,740,320,-1100,960,320,-1100,960,144,-1043,960,144,-1043,960,35,-893,740,35,-893,960,35,-893,960,35,-707,740,35,-707,960,35,-707,960,144,-557,740,144,-557,960,144,-557,960,320,-500,740,320,-500,960,320,-500,960,496,-557,740,496,-557,740,496,-557,960,496,-557,960,605,-707,960,605,-707,960,605,-893,740,605,-893,960,605,-893,960,496,-1043,740,496,-1043,960,496,-1043,960,320,-1100,740,320,-1100]},{"n":"mast","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[350,1150,750,350,1150,700,375,1150,707,350,2250,750,375,2250,707,350,2250,700,350,2250,700,375,1150,707,350,1150,700,350,1150,750,375,1150,707,393,1150,725,350,2250,750,393,2250,725,375,2250,707,375,2250,707,393,1150,725,375,1150,707,350,1150,750,393,1150,725,400,1150,750,350,2250,750,400,2250,750,393,2250,725,393,2250,725,400,1150,750,393,1150,725,350,1150,750,400,1150,750,393,1150,775,350,2250,750,393,2250,775,400,2250,750,400,2250,750,393,1150,775,400,1150,750,350,1150,750,393,1150,775,375,1150,793,350,2250,750,375,2250,793,393,2250,775,393,2250,775,375,1150,793,393,1150,775,350,1150,750,375,1150,793,350,1150,800,350,2250,750,350,2250,800,375,2250,793,375,2250,793,350,1150,800,375,1150,793,350,1150,750,350,1150,800,325,1150,793,350,2250,750,325,2250,793,350,2250,800,350,2250,800,325,1150,793,350,1150,800,350,1150,750,325,1150,793,307,1150,775,350,2250,750,307,2250,775,325,2250,793,325,2250,793,307,1150,775,325,1150,793,350,1150,750,307,1150,775,300,1150,750,350,2250,750,300,2250,750,307,2250,775,307,2250,775,300,1150,750,307,1150,775,350,1150,750,300,1150,750,307,1150,725,350,2250,750,307,2250,725,300,2250,750,300,2250,750,307,1150,725,300,1150,750,350,1150,750,307,1150,725,325,1150,707,350,2250,750,325,2250,707,307,2250,725,307,2250,725,325,1150,707,307,1150,725,350,1150,750,325,1150,707,350,1150,700,350,2250,750,350,2250,700,325,2250,707,325,2250,707,350,1150,700,325,1150,707,350,2250,700,375,2250,707,375,1150,707,375,2250,707,393,2250,725,393,1150,725,393,2250,725,400,2250,750,400,1150,750,400,2250,750,393,2250,775,393,1150,775,393,2250,775,375,2250,793,375,1150,793,375,2250,793,350,2250,800,350,1150,800,350,2250,800,325,2250,793,325,1150,793,325,2250,793,307,2250,775,307,1150,775,307,2250,775,300,2250,750,300,1150,750,300,2250,750,307,2250,725,307,1150,725,307,2250,725,325,2250,707,325,1150,707,325,2250,707,350,2250,700,350,1150,700]},{"n":"head","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[170,2410,850,170,2190,650,170,2190,850,170,2410,650,530,2190,650,170,2190,650,530,2410,650,530,2190,850,530,2190,650,530,2410,850,170,2190,850,530,2190,850,530,2190,650,170,2190,850,170,2190,650,170,2410,650,530,2410,850,530,2410,650,170,2410,850,170,2410,650,170,2190,650,170,2410,650,530,2410,650,530,2190,650,530,2410,650,530,2410,850,530,2190,850,530,2410,850,170,2410,850,170,2190,850,530,2190,650,530,2190,850,170,2190,850,170,2410,650,170,2410,850,530,2410,850]},{"n":"arm","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,396,749,0,436,729,23,431,731,0,804,1551,23,839,1533,0,844,1531,0,436,729,23,839,1533,23,431,731,0,396,749,23,431,731,39,416,739,0,804,1551,39,824,1541,23,839,1533,23,431,731,39,824,1541,39,416,739,0,396,749,39,416,739,45,396,749,0,804,1551,45,804,1551,39,824,1541,39,824,1541,45,396,749,39,416,739,0,396,749,45,396,749,39,376,759,0,804,1551,39,784,1561,45,804,1551,45,804,1551,39,376,759,45,396,749,0,396,749,39,376,759,23,361,767,0,804,1551,23,769,1569,39,784,1561,39,376,759,23,769,1569,23,361,767,0,396,749,23,361,767,0,356,769,0,804,1551,0,764,1571,23,769,1569,23,769,1569,0,356,769,23,361,767,0,396,749,0,356,769,-23,361,767,0,804,1551,-23,769,1569,0,764,1571,0,356,769,-23,769,1569,-23,361,767,0,396,749,-23,361,767,-39,376,759,0,804,1551,-39,784,1561,-23,769,1569,-23,361,767,-39,784,1561,-39,376,759,0,396,749,-39,376,759,-45,396,749,0,804,1551,-45,804,1551,-39,784,1561,-39,376,759,-45,804,1551,-45,396,749,0,396,749,-45,396,749,-39,416,739,0,804,1551,-39,824,1541,-45,804,1551,-45,804,1551,-39,416,739,-45,396,749,0,396,749,-39,416,739,-23,431,731,0,804,1551,-23,839,1533,-39,824,1541,-39,824,1541,-23,431,731,-39,416,739,0,396,749,-23,431,731,0,436,729,0,804,1551,0,844,1531,-23,839,1533,-23,839,1533,0,436,729,-23,431,731,0,436,729,0,844,1531,23,839,1533,23,431,731,23,839,1533,39,824,1541,39,824,1541,45,804,1551,45,396,749,45,804,1551,39,784,1561,39,376,759,39,376,759,39,784,1561,23,769,1569,23,769,1569,0,764,1571,0,356,769,0,356,769,0,764,1571,-23,769,1569,-23,361,767,-23,769,1569,-39,784,1561,-39,376,759,-39,784,1561,-45,804,1551,-45,804,1551,-39,824,1541,-39,416,739,-39,824,1541,-23,839,1533,-23,431,731,-23,839,1533,0,844,1531,0,436,729]}],"hermes":[{"n":"spine","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,0,-13000,0,900,-13000,636,636,-13000,0,0,13000,636,636,13000,0,900,13000,0,900,13000,636,636,-13000,0,900,-13000,0,0,-13000,636,636,-13000,900,0,-13000,0,0,13000,900,0,13000,636,636,13000,636,636,13000,900,0,-13000,636,636,-13000,0,0,-13000,900,0,-13000,636,-636,-13000,0,0,13000,636,-636,13000,900,0,13000,900,0,13000,636,-636,-13000,900,0,-13000,0,0,-13000,636,-636,-13000,0,-900,-13000,0,0,13000,0,-900,13000,636,-636,13000,636,-636,13000,0,-900,-13000,636,-636,-13000,0,0,-13000,0,-900,-13000,-636,-636,-13000,0,0,13000,-636,-636,13000,0,-900,13000,0,-900,13000,-636,-636,-13000,0,-900,-13000,0,0,-13000,-636,-636,-13000,-900,0,-13000,0,0,13000,-900,0,13000,-636,-636,13000,-636,-636,13000,-900,0,-13000,-636,-636,-13000,0,0,-13000,-900,0,-13000,-636,636,-13000,0,0,13000,-636,636,13000,-900,0,13000,-900,0,-13000,-636,636,13000,-636,636,-13000,0,0,-13000,-636,636,-13000,0,900,-13000,0,0,13000,0,900,13000,-636,636,13000,-636,636,13000,0,900,-13000,-636,636,-13000,0,900,13000,636,636,13000,636,636,-13000,636,636,13000,900,0,13000,900,0,-13000,900,0,13000,636,-636,13000,636,-636,-13000,636,-636,13000,0,-900,13000,0,-900,-13000,0,-900,13000,-636,-636,13000,-636,-636,-13000,-636,-636,13000,-900,0,13000,-900,0,-13000,-900,0,-13000,-900,0,13000,-636,636,13000,-636,636,13000,0,900,13000,0,900,-13000]},{"n":"ring","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[7340,2155,2000,7313,0,2813,7650,0,2000,7313,0,2813,6237,1831,3150,6500,0,3150,6500,0,3150,5456,1602,2813,5687,0,2813,5456,1602,2813,5350,0,2000,5687,0,2813,5133,1507,2000,5687,0,1187,5350,0,2000,5456,1602,1187,6500,0,850,5687,0,1187,6237,1831,850,7313,0,1187,6500,0,850,7313,0,1187,7340,2155,2000,7650,0,2000,7340,2155,2000,6152,3954,2813,7017,2060,2813,7017,2060,2813,5468,3514,3150,6237,1831,3150,5468,3514,3150,5456,1602,2813,6237,1831,3150,4784,3075,2813,5133,1507,2000,5456,1602,2813,4501,2892,2000,5456,1602,1187,5133,1507,2000,5456,1602,1187,5468,3514,850,6237,1831,850,5468,3514,850,7017,2060,1187,6237,1831,850,6152,3954,1187,7340,2155,2000,7017,2060,1187,6436,4136,2000,4789,5527,2813,6152,3954,2813,4789,5527,2813,5468,3514,3150,6152,3954,2813,4257,4912,3150,4784,3075,2813,5468,3514,3150,3724,4298,2813,4501,2892,2000,4784,3075,2813,3504,4043,2000,4784,3075,1187,4501,2892,2000,3724,4298,1187,5468,3514,850,4784,3075,1187,5468,3514,850,4789,5527,1187,6152,3954,1187,4789,5527,1187,6436,4136,2000,6152,3954,1187,3178,6959,2000,4789,5527,2813,5010,5781,2000,3038,6652,2813,4257,4912,3150,4789,5527,2813,2700,5913,3150,3724,4298,2813,4257,4912,3150,2362,5173,2813,3504,4043,2000,3724,4298,2813,2222,4867,2000,3724,4298,1187,3504,4043,2000,2362,5173,1187,4257,4912,850,3724,4298,1187,2700,5913,850,4789,5527,1187,4257,4912,850,3038,6652,1187,5010,5781,2000,4789,5527,1187,1089,7572,2000,3038,6652,2813,3178,6959,2000,1041,7239,2813,2700,5913,3150,3038,6652,2813,925,6434,3150,2362,5173,2813,2700,5913,3150,809,5629,2813,2222,4867,2000,2362,5173,2813,761,5296,2000,2362,5173,1187,2222,4867,2000,809,5629,1187,2700,5913,850,2362,5173,1187,925,6434,850,3038,6652,1187,2700,5913,850,1041,7239,1187,3178,6959,2000,3038,6652,1187,-1089,7572,2000,1041,7239,2813,1089,7572,2000,-1041,7239,2813,925,6434,3150,1041,7239,2813,-925,6434,3150,809,5629,2813,925,6434,3150,-809,5629,2813,761,5296,2000,809,5629,2813,-761,5296,2000,809,5629,1187,761,5296,2000,-809,5629,1187,925,6434,850,809,5629,1187,-925,6434,850,1041,7239,1187,925,6434,850,-1041,7239,1187,1089,7572,2000,1041,7239,1187,-1089,7572,2000,-3038,6652,2813,-1041,7239,2813,-3038,6652,2813,-925,6434,3150,-1041,7239,2813,-2700,5913,3150,-809,5629,2813,-925,6434,3150,-2362,5173,2813,-761,5296,2000,-809,5629,2813,-2222,4867,2000,-809,5629,1187,-761,5296,2000,-2362,5173,1187,-925,6434,850,-809,5629,1187,-925,6434,850,-3038,6652,1187,-1041,7239,1187,-3038,6652,1187,-1089,7572,2000,-1041,7239,1187,-5010,5781,2000,-3038,6652,2813,-3178,6959,2000,-4789,5527,2813,-2700,5913,3150,-3038,6652,2813,-4257,4912,3150,-2362,5173,2813,-2700,5913,3150,-3724,4298,2813,-2222,4867,2000,-2362,5173,2813,-3504,4043,2000,-2362,5173,1187,-2222,4867,2000,-2362,5173,1187,-4257,4912,850,-2700,5913,850,-2700,5913,850,-4789,5527,1187,-3038,6652,1187,-4789,5527,1187,-3178,6959,2000,-3038,6652,1187,-6436,4136,2000,-4789,5527,2813,-5010,5781,2000,-6152,3954,2813,-4257,4912,3150,-4789,5527,2813,-5468,3514,3150,-3724,4298,2813,-4257,4912,3150,-4784,3075,2813,-3504,4043,2000,-3724,4298,2813,-4501,2892,2000,-3724,4298,1187,-3504,4043,2000,-3724,4298,1187,-5468,3514,850,-4257,4912,850,-5468,3514,850,-4789,5527,1187,-4257,4912,850,-6152,3954,1187,-5010,5781,2000,-4789,5527,1187,-7340,2155,2000,-6152,3954,2813,-6436,4136,2000,-7017,2060,2813,-5468,3514,3150,-6152,3954,2813,-5468,3514,3150,-5456,1602,2813,-4784,3075,2813,-5456,1602,2813,-4501,2892,2000,-4784,3075,2813,-5133,1507,2000,-4784,3075,1187,-4501,2892,2000,-5456,1602,1187,-5468,3514,850,-4784,3075,1187,-6237,1831,850,-6152,3954,1187,-5468,3514,850,-6152,3954,1187,-7340,2155,2000,-6436,4136,2000,-7340,2155,2000,-7313,0,2813,-7017,2060,2813,-7313,0,2813,-6237,1831,3150,-7017,2060,2813,-6500,0,3150,-5456,1602,2813,-6237,1831,3150,-5687,0,2813,-5133,1507,2000,-5456,1602,2813,-5350,0,2000,-5456,1602,1187,-5133,1507,2000,-5456,1602,1187,-6500,0,850,-6237,1831,850,-6500,0,850,-7017,2060,1187,-6237,1831,850,-7313,0,1187,-7340,2155,2000,-7017,2060,1187,-7340,-2155,2000,-7313,0,2813,-7650,0,2000,-7017,-2060,2813,-6500,0,3150,-7313,0,2813,-6237,-1831,3150,-5687,0,2813,-6500,0,3150,-5456,-1602,2813,-5350,0,2000,-5687,0,2813,-5133,-1507,2000,-5687,0,1187,-5350,0,2000,-5687,0,1187,-6237,-1831,850,-6500,0,850,-6237,-1831,850,-7313,0,1187,-6500,0,850,-7017,-2060,1187,-7650,0,2000,-7313,0,1187,-6436,-4136,2000,-7017,-2060,2813,-7340,-2155,2000,-6152,-3954,2813,-6237,-1831,3150,-7017,-2060,2813,-5468,-3514,3150,-5456,-1602,2813,-6237,-1831,3150,-4784,-3075,2813,-5133,-1507,2000,-5456,-1602,2813,-5133,-1507,2000,-4784,-3075,1187,-5456,-1602,1187,-5456,-1602,1187,-5468,-3514,850,-6237,-1831,850,-5468,-3514,850,-7017,-2060,1187,-6237,-1831,850,-7017,-2060,1187,-6436,-4136,2000,-7340,-2155,2000,-5010,-5781,2000,-6152,-3954,2813,-6436,-4136,2000,-4789,-5527,2813,-5468,-3514,3150,-6152,-3954,2813,-5468,-3514,3150,-3724,-4298,2813,-4784,-3075,2813,-3724,-4298,2813,-4501,-2892,2000,-4784,-3075,2813,-3504,-4043,2000,-4784,-3075,1187,-4501,-2892,2000,-3724,-4298,1187,-5468,-3514,850,-4784,-3075,1187,-5468,-3514,850,-4789,-5527,1187,-6152,-3954,1187,-4789,-5527,1187,-6436,-4136,2000,-6152,-3954,1187,-3178,-6959,2000,-4789,-5527,2813,-5010,-5781,2000,-4789,-5527,2813,-2700,-5913,3150,-4257,-4912,3150,-4257,-4912,3150,-2362,-5173,2813,-3724,-4298,2813,-2362,-5173,2813,-3504,-4043,2000,-3724,-4298,2813,-2222,-4867,2000,-3724,-4298,1187,-3504,-4043,2000,-3724,-4298,1187,-2700,-5913,850,-4257,-4912,850,-2700,-5913,850,-4789,-5527,1187,-4257,-4912,850,-3038,-6652,1187,-5010,-5781,2000,-4789,-5527,1187,-1089,-7572,2000,-3038,-6652,2813,-3178,-6959,2000,-1041,-7239,2813,-2700,-5913,3150,-3038,-6652,2813,-925,-6434,3150,-2362,-5173,2813,-2700,-5913,3150,-809,-5629,2813,-2222,-4867,2000,-2362,-5173,2813,-761,-5296,2000,-2362,-5173,1187,-2222,-4867,2000,-809,-5629,1187,-2700,-5913,850,-2362,-5173,1187,-925,-6434,850,-3038,-6652,1187,-2700,-5913,850,-1041,-7239,1187,-3178,-6959,2000,-3038,-6652,1187,1089,-7572,2000,-1041,-7239,2813,-1089,-7572,2000,1041,-7239,2813,-925,-6434,3150,-1041,-7239,2813,925,-6434,3150,-809,-5629,2813,-925,-6434,3150,809,-5629,2813,-761,-5296,2000,-809,-5629,2813,761,-5296,2000,-809,-5629,1187,-761,-5296,2000,809,-5629,1187,-925,-6434,850,-809,-5629,1187,925,-6434,850,-1041,-7239,1187,-925,-6434,850,1041,-7239,1187,-1089,-7572,2000,-1041,-7239,1187,3178,-6959,2000,1041,-7239,2813,1089,-7572,2000,3038,-6652,2813,925,-6434,3150,1041,-7239,2813,2700,-5913,3150,809,-5629,2813,925,-6434,3150,2362,-5173,2813,761,-5296,2000,809,-5629,2813,2222,-4867,2000,809,-5629,1187,761,-5296,2000,2362,-5173,1187,925,-6434,850,809,-5629,1187,2700,-5913,850,1041,-7239,1187,925,-6434,850,3038,-6652,1187,1089,-7572,2000,1041,-7239,1187,5010,-5781,2000,3038,-6652,2813,3178,-6959,2000,4789,-5527,2813,2700,-5913,3150,3038,-6652,2813,4257,-4912,3150,2362,-5173,2813,2700,-5913,3150,3724,-4298,2813,2222,-4867,2000,2362,-5173,2813,3504,-4043,2000,2362,-5173,1187,2222,-4867,2000,3724,-4298,1187,2700,-5913,850,2362,-5173,1187,4257,-4912,850,3038,-6652,1187,2700,-5913,850,3038,-6652,1187,5010,-5781,2000,3178,-6959,2000,6436,-4136,2000,4789,-5527,2813,5010,-5781,2000,4789,-5527,2813,5468,-3514,3150,4257,-4912,3150,5468,-3514,3150,3724,-4298,2813,4257,-4912,3150,4784,-3075,2813,3504,-4043,2000,3724,-4298,2813,3504,-4043,2000,4784,-3075,1187,3724,-4298,1187,3724,-4298,1187,5468,-3514,850,4257,-4912,850,5468,-3514,850,4789,-5527,1187,4257,-4912,850,4789,-5527,1187,6436,-4136,2000,5010,-5781,2000,7340,-2155,2000,6152,-3954,2813,6436,-4136,2000,7017,-2060,2813,5468,-3514,3150,6152,-3954,2813,6237,-1831,3150,4784,-3075,2813,5468,-3514,3150,5456,-1602,2813,4501,-2892,2000,4784,-3075,2813,5133,-1507,2000,4784,-3075,1187,4501,-2892,2000,5456,-1602,1187,5468,-3514,850,4784,-3075,1187,6237,-1831,850,6152,-3954,1187,5468,-3514,850,7017,-2060,1187,6436,-4136,2000,6152,-3954,1187,7340,-2155,2000,7313,0,2813,7017,-2060,2813,7313,0,2813,6237,-1831,3150,7017,-2060,2813,6500,0,3150,5456,-1602,2813,6237,-1831,3150,5456,-1602,2813,5350,0,2000,5133,-1507,2000,5350,0,2000,5456,-1602,1187,5133,-1507,2000,5456,-1602,1187,6500,0,850,6237,-1831,850,6237,-1831,850,7313,0,1187,7017,-2060,1187,7017,-2060,1187,7650,0,2000,7340,-2155,2000,7340,2155,2000,7017,2060,2813,7313,0,2813,7313,0,2813,7017,2060,2813,6237,1831,3150,6500,0,3150,6237,1831,3150,5456,1602,2813,5456,1602,2813,5133,1507,2000,5350,0,2000,5133,1507,2000,5456,1602,1187,5687,0,1187,5456,1602,1187,6237,1831,850,6500,0,850,6237,1831,850,7017,2060,1187,7313,0,1187,7313,0,1187,7017,2060,1187,7340,2155,2000,7340,2155,2000,6436,4136,2000,6152,3954,2813,7017,2060,2813,6152,3954,2813,5468,3514,3150,5468,3514,3150,4784,3075,2813,5456,1602,2813,4784,3075,2813,4501,2892,2000,5133,1507,2000,4501,2892,2000,4784,3075,1187,5456,1602,1187,5456,1602,1187,4784,3075,1187,5468,3514,850,5468,3514,850,6152,3954,1187,7017,2060,1187,6152,3954,1187,6436,4136,2000,7340,2155,2000,6436,4136,2000,5010,5781,2000,4789,5527,2813,4789,5527,2813,4257,4912,3150,5468,3514,3150,4257,4912,3150,3724,4298,2813,4784,3075,2813,3724,4298,2813,3504,4043,2000,4501,2892,2000,3504,4043,2000,3724,4298,1187,4784,3075,1187,3724,4298,1187,4257,4912,850,5468,3514,850,5468,3514,850,4257,4912,850,4789,5527,1187,4789,5527,1187,5010,5781,2000,6436,4136,2000,3178,6959,2000,3038,6652,2813,4789,5527,2813,3038,6652,2813,2700,5913,3150,4257,4912,3150,2700,5913,3150,2362,5173,2813,3724,4298,2813,2362,5173,2813,2222,4867,2000,3504,4043,2000,2222,4867,2000,2362,5173,1187,3724,4298,1187,2362,5173,1187,2700,5913,850,4257,4912,850,2700,5913,850,3038,6652,1187,4789,5527,1187,3038,6652,1187,3178,6959,2000,5010,5781,2000,1089,7572,2000,1041,7239,2813,3038,6652,2813,1041,7239,2813,925,6434,3150,2700,5913,3150,925,6434,3150,809,5629,2813,2362,5173,2813,809,5629,2813,761,5296,2000,2222,4867,2000,761,5296,2000,809,5629,1187,2362,5173,1187,809,5629,1187,925,6434,850,2700,5913,850,925,6434,850,1041,7239,1187,3038,6652,1187,1041,7239,1187,1089,7572,2000,3178,6959,2000,-1089,7572,2000,-1041,7239,2813,1041,7239,2813,-1041,7239,2813,-925,6434,3150,925,6434,3150,-925,6434,3150,-809,5629,2813,809,5629,2813,-809,5629,2813,-761,5296,2000,761,5296,2000,-761,5296,2000,-809,5629,1187,809,5629,1187,-809,5629,1187,-925,6434,850,925,6434,850,-925,6434,850,-1041,7239,1187,1041,7239,1187,-1041,7239,1187,-1089,7572,2000,1089,7572,2000,-1089,7572,2000,-3178,6959,2000,-3038,6652,2813,-3038,6652,2813,-2700,5913,3150,-925,6434,3150,-2700,5913,3150,-2362,5173,2813,-809,5629,2813,-2362,5173,2813,-2222,4867,2000,-761,5296,2000,-2222,4867,2000,-2362,5173,1187,-809,5629,1187,-2362,5173,1187,-2700,5913,850,-925,6434,850,-925,6434,850,-2700,5913,850,-3038,6652,1187,-3038,6652,1187,-3178,6959,2000,-1089,7572,2000,-5010,5781,2000,-4789,5527,2813,-3038,6652,2813,-4789,5527,2813,-4257,4912,3150,-2700,5913,3150,-4257,4912,3150,-3724,4298,2813,-2362,5173,2813,-3724,4298,2813,-3504,4043,2000,-2222,4867,2000,-3504,4043,2000,-3724,4298,1187,-2362,5173,1187,-2362,5173,1187,-3724,4298,1187,-4257,4912,850,-2700,5913,850,-4257,4912,850,-4789,5527,1187,-4789,5527,1187,-5010,5781,2000,-3178,6959,2000,-6436,4136,2000,-6152,3954,2813,-4789,5527,2813,-6152,3954,2813,-5468,3514,3150,-4257,4912,3150,-5468,3514,3150,-4784,3075,2813,-3724,4298,2813,-4784,3075,2813,-4501,2892,2000,-3504,4043,2000,-4501,2892,2000,-4784,3075,1187,-3724,4298,1187,-3724,4298,1187,-4784,3075,1187,-5468,3514,850,-5468,3514,850,-6152,3954,1187,-4789,5527,1187,-6152,3954,1187,-6436,4136,2000,-5010,5781,2000,-7340,2155,2000,-7017,2060,2813,-6152,3954,2813,-7017,2060,2813,-6237,1831,3150,-5468,3514,3150,-5468,3514,3150,-6237,1831,3150,-5456,1602,2813,-5456,1602,2813,-5133,1507,2000,-4501,2892,2000,-5133,1507,2000,-5456,1602,1187,-4784,3075,1187,-5456,1602,1187,-6237,1831,850,-5468,3514,850,-6237,1831,850,-7017,2060,1187,-6152,3954,1187,-6152,3954,1187,-7017,2060,1187,-7340,2155,2000,-7340,2155,2000,-7650,0,2000,-7313,0,2813,-7313,0,2813,-6500,0,3150,-6237,1831,3150,-6500,0,3150,-5687,0,2813,-5456,1602,2813,-5687,0,2813,-5350,0,2000,-5133,1507,2000,-5350,0,2000,-5687,0,1187,-5456,1602,1187,-5456,1602,1187,-5687,0,1187,-6500,0,850,-6500,0,850,-7313,0,1187,-7017,2060,1187,-7313,0,1187,-7650,0,2000,-7340,2155,2000,-7340,-2155,2000,-7017,-2060,2813,-7313,0,2813,-7017,-2060,2813,-6237,-1831,3150,-6500,0,3150,-6237,-1831,3150,-5456,-1602,2813,-5687,0,2813,-5456,-1602,2813,-5133,-1507,2000,-5350,0,2000,-5133,-1507,2000,-5456,-1602,1187,-5687,0,1187,-5687,0,1187,-5456,-1602,1187,-6237,-1831,850,-6237,-1831,850,-7017,-2060,1187,-7313,0,1187,-7017,-2060,1187,-7340,-2155,2000,-7650,0,2000,-6436,-4136,2000,-6152,-3954,2813,-7017,-2060,2813,-6152,-3954,2813,-5468,-3514,3150,-6237,-1831,3150,-5468,-3514,3150,-4784,-3075,2813,-5456,-1602,2813,-4784,-3075,2813,-4501,-2892,2000,-5133,-1507,2000,-5133,-1507,2000,-4501,-2892,2000,-4784,-3075,1187,-5456,-1602,1187,-4784,-3075,1187,-5468,-3514,850,-5468,-3514,850,-6152,-3954,1187,-7017,-2060,1187,-7017,-2060,1187,-6152,-3954,1187,-6436,-4136,2000,-5010,-5781,2000,-4789,-5527,2813,-6152,-3954,2813,-4789,-5527,2813,-4257,-4912,3150,-5468,-3514,3150,-5468,-3514,3150,-4257,-4912,3150,-3724,-4298,2813,-3724,-4298,2813,-3504,-4043,2000,-4501,-2892,2000,-3504,-4043,2000,-3724,-4298,1187,-4784,-3075,1187,-3724,-4298,1187,-4257,-4912,850,-5468,-3514,850,-5468,-3514,850,-4257,-4912,850,-4789,-5527,1187,-4789,-5527,1187,-5010,-5781,2000,-6436,-4136,2000,-3178,-6959,2000,-3038,-6652,2813,-4789,-5527,2813,-4789,-5527,2813,-3038,-6652,2813,-2700,-5913,3150,-4257,-4912,3150,-2700,-5913,3150,-2362,-5173,2813,-2362,-5173,2813,-2222,-4867,2000,-3504,-4043,2000,-2222,-4867,2000,-2362,-5173,1187,-3724,-4298,1187,-3724,-4298,1187,-2362,-5173,1187,-2700,-5913,850,-2700,-5913,850,-3038,-6652,1187,-4789,-5527,1187,-3038,-6652,1187,-3178,-6959,2000,-5010,-5781,2000,-1089,-7572,2000,-1041,-7239,2813,-3038,-6652,2813,-1041,-7239,2813,-925,-6434,3150,-2700,-5913,3150,-925,-6434,3150,-809,-5629,2813,-2362,-5173,2813,-809,-5629,2813,-761,-5296,2000,-2222,-4867,2000,-761,-5296,2000,-809,-5629,1187,-2362,-5173,1187,-809,-5629,1187,-925,-6434,850,-2700,-5913,850,-925,-6434,850,-1041,-7239,1187,-3038,-6652,1187,-1041,-7239,1187,-1089,-7572,2000,-3178,-6959,2000,1089,-7572,2000,1041,-7239,2813,-1041,-7239,2813,1041,-7239,2813,925,-6434,3150,-925,-6434,3150,925,-6434,3150,809,-5629,2813,-809,-5629,2813,809,-5629,2813,761,-5296,2000,-761,-5296,2000,761,-5296,2000,809,-5629,1187,-809,-5629,1187,809,-5629,1187,925,-6434,850,-925,-6434,850,925,-6434,850,1041,-7239,1187,-1041,-7239,1187,1041,-7239,1187,1089,-7572,2000,-1089,-7572,2000,3178,-6959,2000,3038,-6652,2813,1041,-7239,2813,3038,-6652,2813,2700,-5913,3150,925,-6434,3150,2700,-5913,3150,2362,-5173,2813,809,-5629,2813,2362,-5173,2813,2222,-4867,2000,761,-5296,2000,2222,-4867,2000,2362,-5173,1187,809,-5629,1187,2362,-5173,1187,2700,-5913,850,925,-6434,850,2700,-5913,850,3038,-6652,1187,1041,-7239,1187,3038,-6652,1187,3178,-6959,2000,1089,-7572,2000,5010,-5781,2000,4789,-5527,2813,3038,-6652,2813,4789,-5527,2813,4257,-4912,3150,2700,-5913,3150,4257,-4912,3150,3724,-4298,2813,2362,-5173,2813,3724,-4298,2813,3504,-4043,2000,2222,-4867,2000,3504,-4043,2000,3724,-4298,1187,2362,-5173,1187,3724,-4298,1187,4257,-4912,850,2700,-5913,850,4257,-4912,850,4789,-5527,1187,3038,-6652,1187,3038,-6652,1187,4789,-5527,1187,5010,-5781,2000,6436,-4136,2000,6152,-3954,2813,4789,-5527,2813,4789,-5527,2813,6152,-3954,2813,5468,-3514,3150,5468,-3514,3150,4784,-3075,2813,3724,-4298,2813,4784,-3075,2813,4501,-2892,2000,3504,-4043,2000,3504,-4043,2000,4501,-2892,2000,4784,-3075,1187,3724,-4298,1187,4784,-3075,1187,5468,-3514,850,5468,-3514,850,6152,-3954,1187,4789,-5527,1187,4789,-5527,1187,6152,-3954,1187,6436,-4136,2000,7340,-2155,2000,7017,-2060,2813,6152,-3954,2813,7017,-2060,2813,6237,-1831,3150,5468,-3514,3150,6237,-1831,3150,5456,-1602,2813,4784,-3075,2813,5456,-1602,2813,5133,-1507,2000,4501,-2892,2000,5133,-1507,2000,5456,-1602,1187,4784,-3075,1187,5456,-1602,1187,6237,-1831,850,5468,-3514,850,6237,-1831,850,7017,-2060,1187,6152,-3954,1187,7017,-2060,1187,7340,-2155,2000,6436,-4136,2000,7340,-2155,2000,7650,0,2000,7313,0,2813,7313,0,2813,6500,0,3150,6237,-1831,3150,6500,0,3150,5687,0,2813,5456,-1602,2813,5456,-1602,2813,5687,0,2813,5350,0,2000,5350,0,2000,5687,0,1187,5456,-1602,1187,5456,-1602,1187,5687,0,1187,6500,0,850,6237,-1831,850,6500,0,850,7313,0,1187,7017,-2060,1187,7313,0,1187,7650,0,2000]},{"n":"spokes","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[3200,3200,2000,3200,3200,1720,3002,3200,1802,3200,-3200,2000,3002,-3200,1802,3200,-3200,1720,3200,-3200,1720,3002,3200,1802,3200,3200,1720,3200,3200,2000,3002,3200,1802,2920,3200,2000,3200,-3200,2000,2920,-3200,2000,3002,-3200,1802,3002,-3200,1802,2920,3200,2000,3002,3200,1802,3200,3200,2000,2920,3200,2000,3002,3200,2198,3200,-3200,2000,3002,-3200,2198,2920,-3200,2000,2920,-3200,2000,3002,3200,2198,2920,3200,2000,3200,3200,2000,3002,3200,2198,3200,3200,2280,3200,-3200,2000,3200,-3200,2280,3002,-3200,2198,3002,-3200,2198,3200,3200,2280,3002,3200,2198,3200,3200,2000,3200,3200,2280,3398,3200,2198,3200,-3200,2000,3398,-3200,2198,3200,-3200,2280,3200,-3200,2280,3398,3200,2198,3200,3200,2280,3200,3200,2000,3398,3200,2198,3480,3200,2000,3200,-3200,2000,3480,-3200,2000,3398,-3200,2198,3398,-3200,2198,3480,3200,2000,3398,3200,2198,3200,3200,2000,3480,3200,2000,3398,3200,1802,3200,-3200,2000,3398,-3200,1802,3480,-3200,2000,3480,-3200,2000,3398,3200,1802,3480,3200,2000,3200,3200,2000,3398,3200,1802,3200,3200,1720,3200,-3200,2000,3200,-3200,1720,3398,-3200,1802,3398,-3200,1802,3200,3200,1720,3398,3200,1802,3200,3200,2000,3200,3200,1720,3200,3398,1802,-3200,3200,2000,-3200,3398,1802,-3200,3200,1720,-3200,3200,1720,3200,3398,1802,3200,3200,1720,3200,3200,2000,3200,3398,1802,3200,3480,2000,-3200,3200,2000,-3200,3480,2000,-3200,3398,1802,-3200,3398,1802,3200,3480,2000,3200,3398,1802,3200,3200,2000,3200,3480,2000,3200,3398,2198,-3200,3200,2000,-3200,3398,2198,-3200,3480,2000,3200,3480,2000,-3200,3398,2198,3200,3398,2198,3200,3200,2000,3200,3398,2198,3200,3200,2280,-3200,3200,2000,-3200,3200,2280,-3200,3398,2198,-3200,3398,2198,3200,3200,2280,3200,3398,2198,3200,3200,2000,3200,3200,2280,3200,3002,2198,-3200,3200,2000,-3200,3002,2198,-3200,3200,2280,-3200,3200,2280,3200,3002,2198,3200,3200,2280,3200,3200,2000,3200,3002,2198,3200,2920,2000,-3200,3200,2000,-3200,2920,2000,-3200,3002,2198,-3200,3002,2198,3200,2920,2000,3200,3002,2198,3200,3200,2000,3200,2920,2000,3200,3002,1802,-3200,3200,2000,-3200,3002,1802,-3200,2920,2000,-3200,2920,2000,3200,3002,1802,3200,2920,2000,3200,3200,2000,3200,3002,1802,3200,3200,1720,-3200,3200,2000,-3200,3200,1720,-3200,3002,1802,-3200,3002,1802,3200,3200,1720,3200,3002,1802,-3200,-3200,2000,-3200,-3200,1720,-3002,-3200,1802,-3200,3200,2000,-3002,3200,1802,-3200,3200,1720,-3200,3200,1720,-3002,-3200,1802,-3200,-3200,1720,-3200,-3200,2000,-3002,-3200,1802,-2920,-3200,2000,-3200,3200,2000,-2920,3200,2000,-3002,3200,1802,-3002,3200,1802,-2920,-3200,2000,-3002,-3200,1802,-3200,-3200,2000,-2920,-3200,2000,-3002,-3200,2198,-3200,3200,2000,-3002,3200,2198,-2920,3200,2000,-2920,3200,2000,-3002,-3200,2198,-2920,-3200,2000,-3200,-3200,2000,-3002,-3200,2198,-3200,-3200,2280,-3200,3200,2000,-3200,3200,2280,-3002,3200,2198,-3002,3200,2198,-3200,-3200,2280,-3002,-3200,2198,-3200,-3200,2000,-3200,-3200,2280,-3398,-3200,2198,-3200,3200,2000,-3398,3200,2198,-3200,3200,2280,-3200,3200,2280,-3398,-3200,2198,-3200,-3200,2280,-3200,-3200,2000,-3398,-3200,2198,-3480,-3200,2000,-3200,3200,2000,-3480,3200,2000,-3398,3200,2198,-3398,3200,2198,-3480,-3200,2000,-3398,-3200,2198,-3200,-3200,2000,-3480,-3200,2000,-3398,-3200,1802,-3200,3200,2000,-3398,3200,1802,-3480,3200,2000,-3480,3200,2000,-3398,-3200,1802,-3480,-3200,2000,-3200,-3200,2000,-3398,-3200,1802,-3200,-3200,1720,-3200,3200,2000,-3200,3200,1720,-3398,3200,1802,-3398,3200,1802,-3200,-3200,1720,-3398,-3200,1802,-3200,-3200,2000,-3200,-3200,1720,-3200,-3398,1802,3200,-3200,2000,3200,-3398,1802,3200,-3200,1720,3200,-3200,1720,-3200,-3398,1802,-3200,-3200,1720,-3200,-3200,2000,-3200,-3398,1802,-3200,-3480,2000,3200,-3200,2000,3200,-3480,2000,3200,-3398,1802,3200,-3398,1802,-3200,-3480,2000,-3200,-3398,1802,-3200,-3200,2000,-3200,-3480,2000,-3200,-3398,2198,3200,-3200,2000,3200,-3398,2198,3200,-3480,2000,-3200,-3480,2000,3200,-3398,2198,-3200,-3398,2198,-3200,-3200,2000,-3200,-3398,2198,-3200,-3200,2280,3200,-3200,2000,3200,-3200,2280,3200,-3398,2198,3200,-3398,2198,-3200,-3200,2280,-3200,-3398,2198,-3200,-3200,2000,-3200,-3200,2280,-3200,-3002,2198,3200,-3200,2000,3200,-3002,2198,3200,-3200,2280,3200,-3200,2280,-3200,-3002,2198,-3200,-3200,2280,-3200,-3200,2000,-3200,-3002,2198,-3200,-2920,2000,3200,-3200,2000,3200,-2920,2000,3200,-3002,2198,3200,-3002,2198,-3200,-2920,2000,-3200,-3002,2198,-3200,-3200,2000,-3200,-2920,2000,-3200,-3002,1802,3200,-3200,2000,3200,-3002,1802,3200,-2920,2000,3200,-2920,2000,-3200,-3002,1802,-3200,-2920,2000,-3200,-3200,2000,-3200,-3002,1802,-3200,-3200,1720,3200,-3200,2000,3200,-3200,1720,3200,-3002,1802,3200,-3002,1802,-3200,-3200,1720,-3200,-3002,1802,3200,-3200,1720,3002,-3200,1802,3002,3200,1802,3002,-3200,1802,2920,-3200,2000,2920,3200,2000,2920,-3200,2000,3002,-3200,2198,3002,3200,2198,3002,-3200,2198,3200,-3200,2280,3200,3200,2280,3200,-3200,2280,3398,-3200,2198,3398,3200,2198,3398,-3200,2198,3480,-3200,2000,3480,3200,2000,3480,-3200,2000,3398,-3200,1802,3398,3200,1802,3398,-3200,1802,3200,-3200,1720,3200,3200,1720,-3200,3200,1720,-3200,3398,1802,3200,3398,1802,-3200,3398,1802,-3200,3480,2000,3200,3480,2000,3200,3480,2000,-3200,3480,2000,-3200,3398,2198,-3200,3398,2198,-3200,3200,2280,3200,3200,2280,-3200,3200,2280,-3200,3002,2198,3200,3002,2198,-3200,3002,2198,-3200,2920,2000,3200,2920,2000,-3200,2920,2000,-3200,3002,1802,3200,3002,1802,-3200,3002,1802,-3200,3200,1720,3200,3200,1720,-3200,3200,1720,-3002,3200,1802,-3002,-3200,1802,-3002,3200,1802,-2920,3200,2000,-2920,-3200,2000,-2920,3200,2000,-3002,3200,2198,-3002,-3200,2198,-3002,3200,2198,-3200,3200,2280,-3200,-3200,2280,-3200,3200,2280,-3398,3200,2198,-3398,-3200,2198,-3398,3200,2198,-3480,3200,2000,-3480,-3200,2000,-3480,3200,2000,-3398,3200,1802,-3398,-3200,1802,-3398,3200,1802,-3200,3200,1720,-3200,-3200,1720,3200,-3200,1720,3200,-3398,1802,-3200,-3398,1802,3200,-3398,1802,3200,-3480,2000,-3200,-3480,2000,-3200,-3480,2000,3200,-3480,2000,3200,-3398,2198,3200,-3398,2198,3200,-3200,2280,-3200,-3200,2280,3200,-3200,2280,3200,-3002,2198,-3200,-3002,2198,3200,-3002,2198,3200,-2920,2000,-3200,-2920,2000,3200,-2920,2000,3200,-3002,1802,-3200,-3002,1802,3200,-3002,1802,3200,-3200,1720,-3200,-3200,1720]},{"n":"command","c":[0.78,0.75,0.68],"p":[0,0,0],"v":[0,0,12600,0,1400,12600,823,1133,12600,0,0,15800,529,728,15800,0,900,15800,0,900,15800,823,1133,12600,0,1400,12600,0,0,12600,823,1133,12600,1331,433,12600,0,0,15800,856,278,15800,529,728,15800,529,728,15800,1331,433,12600,823,1133,12600,0,0,12600,1331,433,12600,1331,-433,12600,0,0,15800,856,-278,15800,856,278,15800,1331,433,12600,856,-278,15800,1331,-433,12600,0,0,12600,1331,-433,12600,823,-1133,12600,0,0,15800,529,-728,15800,856,-278,15800,856,-278,15800,823,-1133,12600,1331,-433,12600,0,0,12600,823,-1133,12600,0,-1400,12600,0,0,15800,0,-900,15800,529,-728,15800,529,-728,15800,0,-1400,12600,823,-1133,12600,0,0,12600,0,-1400,12600,-823,-1133,12600,0,0,15800,-529,-728,15800,0,-900,15800,0,-900,15800,-823,-1133,12600,0,-1400,12600,0,0,12600,-823,-1133,12600,-1331,-433,12600,0,0,15800,-856,-278,15800,-529,-728,15800,-529,-728,15800,-1331,-433,12600,-823,-1133,12600,0,0,12600,-1331,-433,12600,-1331,433,12600,0,0,15800,-856,278,15800,-856,-278,15800,-856,-278,15800,-1331,433,12600,-1331,-433,12600,0,0,12600,-1331,433,12600,-823,1133,12600,0,0,15800,-529,728,15800,-856,278,15800,-856,278,15800,-823,1133,12600,-1331,433,12600,0,0,12600,-823,1133,12600,0,1400,12600,0,0,15800,0,900,15800,-529,728,15800,-823,1133,12600,0,900,15800,0,1400,12600,0,900,15800,529,728,15800,823,1133,12600,529,728,15800,856,278,15800,1331,433,12600,1331,433,12600,856,278,15800,856,-278,15800,856,-278,15800,529,-728,15800,823,-1133,12600,529,-728,15800,0,-900,15800,0,-1400,12600,0,-900,15800,-529,-728,15800,-823,-1133,12600,-529,-728,15800,-856,-278,15800,-1331,-433,12600,-856,-278,15800,-856,278,15800,-1331,433,12600,-856,278,15800,-529,728,15800,-823,1133,12600,-823,1133,12600,-529,728,15800,0,900,15800]},{"n":"engine","c":[0.28,0.29,0.31],"p":[0,0,0],"v":[-1700,1300,-10800,-1700,-1300,-13600,-1700,-1300,-10800,-1700,1300,-13600,1700,-1300,-13600,-1700,-1300,-13600,1700,1300,-13600,1700,-1300,-10800,1700,-1300,-13600,1700,1300,-10800,-1700,-1300,-10800,1700,-1300,-10800,1700,-1300,-13600,-1700,-1300,-10800,-1700,-1300,-13600,-1700,1300,-13600,1700,1300,-10800,1700,1300,-13600,0,0,-15000,0,900,-15000,529,728,-15000,0,0,-13400,764,1052,-13400,0,1300,-13400,0,900,-15000,764,1052,-13400,529,728,-15000,0,0,-15000,529,728,-15000,856,278,-15000,0,0,-13400,1236,402,-13400,764,1052,-13400,764,1052,-13400,856,278,-15000,529,728,-15000,0,0,-15000,856,278,-15000,856,-278,-15000,0,0,-13400,1236,-402,-13400,1236,402,-13400,1236,402,-13400,856,-278,-15000,856,278,-15000,0,0,-15000,856,-278,-15000,529,-728,-15000,0,0,-13400,764,-1052,-13400,1236,-402,-13400,856,-278,-15000,764,-1052,-13400,529,-728,-15000,0,0,-15000,529,-728,-15000,0,-900,-15000,0,0,-13400,0,-1300,-13400,764,-1052,-13400,764,-1052,-13400,0,-900,-15000,529,-728,-15000,0,0,-15000,0,-900,-15000,-529,-728,-15000,0,0,-13400,-764,-1052,-13400,0,-1300,-13400,0,-1300,-13400,-529,-728,-15000,0,-900,-15000,0,0,-15000,-529,-728,-15000,-856,-278,-15000,0,0,-13400,-1236,-402,-13400,-764,-1052,-13400,-764,-1052,-13400,-856,-278,-15000,-529,-728,-15000,0,0,-15000,-856,-278,-15000,-856,278,-15000,0,0,-13400,-1236,402,-13400,-1236,-402,-13400,-1236,-402,-13400,-856,278,-15000,-856,-278,-15000,0,0,-15000,-856,278,-15000,-529,728,-15000,0,0,-13400,-764,1052,-13400,-1236,402,-13400,-856,278,-15000,-764,1052,-13400,-529,728,-15000,0,0,-15000,-529,728,-15000,0,900,-15000,0,0,-13400,0,1300,-13400,-764,1052,-13400,-764,1052,-13400,0,900,-15000,-529,728,-15000,-1700,1300,-10800,-1700,1300,-13600,-1700,-1300,-13600,-1700,1300,-13600,1700,1300,-13600,1700,-1300,-13600,1700,1300,-13600,1700,1300,-10800,1700,-1300,-10800,1700,1300,-10800,-1700,1300,-10800,-1700,-1300,-10800,1700,-1300,-13600,1700,-1300,-10800,-1700,-1300,-10800,-1700,1300,-13600,-1700,1300,-10800,1700,1300,-10800,0,900,-15000,0,1300,-13400,764,1052,-13400,764,1052,-13400,1236,402,-13400,856,278,-15000,1236,402,-13400,1236,-402,-13400,856,-278,-15000,856,-278,-15000,1236,-402,-13400,764,-1052,-13400,764,-1052,-13400,0,-1300,-13400,0,-900,-15000,0,-1300,-13400,-764,-1052,-13400,-529,-728,-15000,-764,-1052,-13400,-1236,-402,-13400,-856,-278,-15000,-1236,-402,-13400,-1236,402,-13400,-856,278,-15000,-856,278,-15000,-1236,402,-13400,-764,1052,-13400,-764,1052,-13400,0,1300,-13400,0,900,-15000]},{"n":"arrays","c":[0.15,0.24,0.42],"p":[0,0,0],"v":[2500,40,-6200,2500,-40,-7800,2500,-40,-6200,2500,40,-7800,16500,-40,-7800,2500,-40,-7800,16500,40,-7800,16500,-40,-6200,16500,-40,-7800,16500,40,-6200,2500,-40,-6200,16500,-40,-6200,16500,-40,-7800,2500,-40,-6200,2500,-40,-7800,2500,40,-7800,16500,40,-6200,16500,40,-7800,-16500,40,-6200,-16500,-40,-7800,-16500,-40,-6200,-16500,40,-7800,-2500,-40,-7800,-16500,-40,-7800,-2500,40,-7800,-2500,-40,-6200,-2500,-40,-7800,-2500,40,-6200,-16500,-40,-6200,-2500,-40,-6200,-2500,-40,-7800,-16500,-40,-6200,-16500,-40,-7800,-16500,40,-7800,-2500,40,-6200,-2500,40,-7800,2500,40,-6200,2500,40,-7800,2500,-40,-7800,2500,40,-7800,16500,40,-7800,16500,-40,-7800,16500,40,-7800,16500,40,-6200,16500,-40,-6200,16500,40,-6200,2500,40,-6200,2500,-40,-6200,16500,-40,-7800,16500,-40,-6200,2500,-40,-6200,2500,40,-7800,2500,40,-6200,16500,40,-6200,-16500,40,-6200,-16500,40,-7800,-16500,-40,-7800,-16500,40,-7800,-2500,40,-7800,-2500,-40,-7800,-2500,40,-7800,-2500,40,-6200,-2500,-40,-6200,-2500,40,-6200,-16500,40,-6200,-16500,-40,-6200,-2500,-40,-7800,-2500,-40,-6200,-16500,-40,-6200,-16500,40,-7800,-16500,40,-6200,-2500,40,-6200]},{"n":"engineglow","c":[0.62,0.16,0.1],"p":[0,0,0],"v":[0,0,-15350,0,700,-15350,411,566,-15350,0,0,-14850,235,324,-14850,0,400,-14850,0,700,-15350,235,324,-14850,411,566,-15350,0,0,-15350,411,566,-15350,666,216,-15350,0,0,-14850,380,124,-14850,235,324,-14850,411,566,-15350,380,124,-14850,666,216,-15350,0,0,-15350,666,216,-15350,666,-216,-15350,0,0,-14850,380,-124,-14850,380,124,-14850,666,216,-15350,380,-124,-14850,666,-216,-15350,0,0,-15350,666,-216,-15350,411,-566,-15350,0,0,-14850,235,-324,-14850,380,-124,-14850,380,-124,-14850,411,-566,-15350,666,-216,-15350,0,0,-15350,411,-566,-15350,0,-700,-15350,0,0,-14850,0,-400,-14850,235,-324,-14850,235,-324,-14850,0,-700,-15350,411,-566,-15350,0,0,-15350,0,-700,-15350,-411,-566,-15350,0,0,-14850,-235,-324,-14850,0,-400,-14850,0,-700,-15350,-235,-324,-14850,-411,-566,-15350,0,0,-15350,-411,-566,-15350,-666,-216,-15350,0,0,-14850,-380,-124,-14850,-235,-324,-14850,-411,-566,-15350,-380,-124,-14850,-666,-216,-15350,0,0,-15350,-666,-216,-15350,-666,216,-15350,0,0,-14850,-380,124,-14850,-380,-124,-14850,-380,-124,-14850,-666,216,-15350,-666,-216,-15350,0,0,-15350,-666,216,-15350,-411,566,-15350,0,0,-14850,-235,324,-14850,-380,124,-14850,-380,124,-14850,-411,566,-15350,-666,216,-15350,0,0,-15350,-411,566,-15350,0,700,-15350,0,0,-14850,0,400,-14850,-235,324,-14850,-235,324,-14850,0,700,-15350,-411,566,-15350,0,700,-15350,0,400,-14850,235,324,-14850,411,566,-15350,235,324,-14850,380,124,-14850,666,216,-15350,380,124,-14850,380,-124,-14850,380,-124,-14850,235,-324,-14850,411,-566,-15350,235,-324,-14850,0,-400,-14850,0,-700,-15350,0,-700,-15350,0,-400,-14850,-235,-324,-14850,-411,-566,-15350,-235,-324,-14850,-380,-124,-14850,-380,-124,-14850,-380,124,-14850,-666,216,-15350,-380,124,-14850,-235,324,-14850,-411,566,-15350,-235,324,-14850,0,400,-14850,0,700,-15350],"e":[0.3,0.5,1.0]}],"greenhouse":[{"n":"dome","c":[0.6,0.72,0.78],"p":[0,0,0],"v":[0,3070,-2970,1684,1707,-3496,0,1707,-3880,0,3980,-1607,0,4300,0,697,3980,-1448,0,100,-4200,1684,1707,-3496,1822,100,-3784,0,3070,-2970,697,3980,-1448,1289,3070,-2676,1684,1707,-3496,3284,100,-2619,1822,100,-3784,697,3980,-1448,2322,3070,-1852,1289,3070,-2676,1684,1707,-3496,2322,3070,-1852,3034,1707,-2419,697,3980,-1448,0,4300,0,1257,3980,-1002,1257,3980,-1002,2895,3070,-661,2322,3070,-1852,2322,3070,-1852,3783,1707,-863,3034,1707,-2419,1257,3980,-1002,0,4300,0,1567,3980,-358,3034,1707,-2419,4095,100,-935,3284,100,-2619,2895,3070,-661,3783,1707,863,3783,1707,-863,1567,3980,-358,0,4300,0,1567,3980,358,-1684,1707,-3496,0,1707,-3880,0,100,-4200,-1289,3070,-2676,0,3070,-2970,0,1707,-3880,3783,1707,-863,4095,100,935,4095,100,-935,1567,3980,-358,2895,3070,661,2895,3070,-661,1567,3980,358,0,4300,0,1257,3980,1002,-1289,3070,-2676,-697,3980,-1448,0,3980,-1607,-2322,3070,-1852,-1289,3070,-2676,-1684,1707,-3496,3783,1707,863,3284,100,2619,4095,100,935,1567,3980,358,2322,3070,1852,2895,3070,661,-2322,3070,-1852,-1257,3980,-1002,-697,3980,-1448,-3034,1707,-2419,-1684,1707,-3496,-1822,100,-3784,3783,1707,863,2322,3070,1852,3034,1707,2419,-1567,3980,-358,-1257,3980,-1002,-2322,3070,-1852,3034,1707,2419,1822,100,3784,3284,100,2619,1257,3980,1002,1289,3070,2676,2322,3070,1852,-3783,1707,-863,-3034,1707,-2419,-3284,100,-2619,-2895,3070,-661,-2322,3070,-1852,-3034,1707,-2419,2322,3070,1852,1684,1707,3496,3034,1707,2419,1257,3980,1002,0,4300,0,697,3980,1448,-1567,3980,358,-1567,3980,-358,-2895,3070,-661,-3783,1707,863,-3783,1707,-863,-4095,100,-935,-2895,3070,661,-2895,3070,-661,-3783,1707,-863,1289,3070,2676,0,1707,3880,1684,1707,3496,697,3980,1448,0,4300,0,0,3980,1607,-2322,3070,1852,-2895,3070,661,-3783,1707,863,-2322,3070,1852,-1257,3980,1002,-1567,3980,358,1684,1707,3496,0,100,4200,1822,100,3784,697,3980,1448,0,3070,2970,1289,3070,2676,-3034,1707,2419,-3783,1707,863,-4095,100,935,0,3070,2970,-1684,1707,3496,0,1707,3880,0,3980,1607,0,4300,0,-697,3980,1448,-1289,3070,2676,-2322,3070,1852,-3034,1707,2419,-697,3980,1448,-1257,3980,1002,-2322,3070,1852,0,1707,3880,-1822,100,3784,0,100,4200,0,3980,1607,-1289,3070,2676,0,3070,2970,-1684,1707,3496,-3034,1707,2419,-3284,100,2619,0,3980,1607,-697,3980,1448,-1289,3070,2676,0,1707,3880,-1684,1707,3496,-1822,100,3784,-1684,1707,3496,-3284,100,2619,-1822,100,3784,-697,3980,1448,-2322,3070,1852,-1289,3070,2676,0,3070,2970,-1289,3070,2676,-1684,1707,3496,697,3980,1448,0,3980,1607,0,3070,2970,-1289,3070,2676,-3034,1707,2419,-1684,1707,3496,-697,3980,1448,0,4300,0,-1257,3980,1002,-3034,1707,2419,-4095,100,935,-3284,100,2619,-2322,3070,1852,-1567,3980,358,-2895,3070,661,1684,1707,3496,0,1707,3880,0,100,4200,1289,3070,2676,0,3070,2970,0,1707,3880,-2322,3070,1852,-3783,1707,863,-3034,1707,2419,-1257,3980,1002,0,4300,0,-1567,3980,358,2322,3070,1852,1289,3070,2676,1684,1707,3496,1257,3980,1002,697,3980,1448,1289,3070,2676,3034,1707,2419,1684,1707,3496,1822,100,3784,3783,1707,863,2895,3070,661,2322,3070,1852,-2895,3070,661,-3783,1707,-863,-3783,1707,863,-1567,3980,358,0,4300,0,-1567,3980,-358,1567,3980,358,1257,3980,1002,2322,3070,1852,3783,1707,863,3034,1707,2419,3284,100,2619,-3783,1707,863,-4095,100,-935,-4095,100,935,-1567,3980,358,-2895,3070,-661,-2895,3070,661,-2895,3070,-661,-3034,1707,-2419,-3783,1707,-863,-1567,3980,-358,0,4300,0,-1257,3980,-1002,1567,3980,-358,1567,3980,358,2895,3070,661,3783,1707,-863,3783,1707,863,4095,100,935,-3783,1707,-863,-3284,100,-2619,-4095,100,-935,-1567,3980,-358,-2322,3070,-1852,-2895,3070,-661,2895,3070,-661,2895,3070,661,3783,1707,863,3034,1707,-2419,3783,1707,-863,4095,100,-935,2322,3070,-1852,2895,3070,-661,3783,1707,-863,1257,3980,-1002,1567,3980,-358,2895,3070,-661,-3034,1707,-2419,-1822,100,-3784,-3284,100,-2619,-2322,3070,-1852,-697,3980,-1448,-1289,3070,-2676,1684,1707,-3496,1289,3070,-2676,2322,3070,-1852,697,3980,-1448,1257,3980,-1002,2322,3070,-1852,-2322,3070,-1852,-1684,1707,-3496,-3034,1707,-2419,-1257,3980,-1002,0,4300,0,-697,3980,-1448,-1289,3070,-2676,0,3980,-1607,0,3070,-2970,1684,1707,-3496,3034,1707,-2419,3284,100,-2619,0,3070,-2970,0,3980,-1607,697,3980,-1448,-1289,3070,-2676,0,1707,-3880,-1684,1707,-3496,-697,3980,-1448,0,4300,0,0,3980,-1607,0,100,-4200,0,1707,-3880,1684,1707,-3496,0,3070,-2970,1289,3070,-2676,1684,1707,-3496,-1684,1707,-3496,0,100,-4200,-1822,100,-3784],"o":0.3},{"n":"ring","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,25,0,0,25,-4250,1454,25,-3994,0,375,0,1488,375,-4088,0,375,-4350,0,375,-4350,1454,25,-3994,0,25,-4250,0,25,0,1454,25,-3994,2732,25,-3256,0,375,0,2796,375,-3332,1488,375,-4088,1488,375,-4088,2732,25,-3256,1454,25,-3994,0,25,0,2732,25,-3256,3681,25,-2125,0,375,0,3767,375,-2175,2796,375,-3332,2796,375,-3332,3681,25,-2125,2732,25,-3256,0,25,0,3681,25,-2125,4185,25,-738,0,375,0,4284,375,-755,3767,375,-2175,3767,375,-2175,4185,25,-738,3681,25,-2125,0,25,0,4185,25,-738,4185,25,738,0,375,0,4284,375,755,4284,375,-755,4284,375,-755,4185,25,738,4185,25,-738,0,25,0,4185,25,738,3681,25,2125,0,375,0,3767,375,2175,4284,375,755,4284,375,755,3681,25,2125,4185,25,738,0,25,0,3681,25,2125,2732,25,3256,0,375,0,2796,375,3332,3767,375,2175,3767,375,2175,2732,25,3256,3681,25,2125,0,25,0,2732,25,3256,1454,25,3994,0,375,0,1488,375,4088,2796,375,3332,2796,375,3332,1454,25,3994,2732,25,3256,0,25,0,1454,25,3994,0,25,4250,0,375,0,0,375,4350,1488,375,4088,1488,375,4088,0,25,4250,1454,25,3994,0,25,0,0,25,4250,-1454,25,3994,0,375,0,-1488,375,4088,0,375,4350,0,375,4350,-1454,25,3994,0,25,4250,0,25,0,-1454,25,3994,-2732,25,3256,0,375,0,-2796,375,3332,-1488,375,4088,-1488,375,4088,-2732,25,3256,-1454,25,3994,0,25,0,-2732,25,3256,-3681,25,2125,0,375,0,-3767,375,2175,-2796,375,3332,-2796,375,3332,-3681,25,2125,-2732,25,3256,0,25,0,-3681,25,2125,-4185,25,738,0,375,0,-4284,375,755,-3767,375,2175,-3767,375,2175,-4185,25,738,-3681,25,2125,0,25,0,-4185,25,738,-4185,25,-738,0,375,0,-4284,375,-755,-4284,375,755,-4284,375,755,-4185,25,-738,-4185,25,738,0,25,0,-4185,25,-738,-3681,25,-2125,0,375,0,-3767,375,-2175,-4284,375,-755,-4284,375,-755,-3681,25,-2125,-4185,25,-738,0,25,0,-3681,25,-2125,-2732,25,-3256,0,375,0,-2796,375,-3332,-3767,375,-2175,-3767,375,-2175,-2732,25,-3256,-3681,25,-2125,0,25,0,-2732,25,-3256,-1454,25,-3994,0,375,0,-1488,375,-4088,-2796,375,-3332,-2796,375,-3332,-1454,25,-3994,-2732,25,-3256,0,25,0,-1454,25,-3994,0,25,-4250,0,375,0,0,375,-4350,-1488,375,-4088,-1488,375,-4088,0,25,-4250,-1454,25,-3994,0,375,-4350,1488,375,-4088,1454,25,-3994,1488,375,-4088,2796,375,-3332,2732,25,-3256,2796,375,-3332,3767,375,-2175,3681,25,-2125,3767,375,-2175,4284,375,-755,4185,25,-738,4284,375,-755,4284,375,755,4185,25,738,4284,375,755,3767,375,2175,3681,25,2125,3767,375,2175,2796,375,3332,2732,25,3256,2796,375,3332,1488,375,4088,1454,25,3994,1488,375,4088,0,375,4350,0,25,4250,0,375,4350,-1488,375,4088,-1454,25,3994,-1488,375,4088,-2796,375,3332,-2732,25,3256,-2796,375,3332,-3767,375,2175,-3681,25,2125,-3767,375,2175,-4284,375,755,-4185,25,738,-4284,375,755,-4284,375,-755,-4185,25,-738,-4284,375,-755,-3767,375,-2175,-3681,25,-2125,-3767,375,-2175,-2796,375,-3332,-2732,25,-3256,-2796,375,-3332,-1488,375,-4088,-1454,25,-3994,-1488,375,-4088,0,375,-4350,0,25,-4250]},{"n":"ribs","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[4012,100,-1460,4235,148,0,4270,100,0,4235,148,0,3927,129,-1429,4180,129,0,3927,129,-1429,4180,71,0,4180,129,0,4180,71,0,3980,52,-1449,4235,52,0,3980,52,-1449,4270,100,0,4235,52,0,3271,100,-2745,3980,148,-1449,4012,100,-1460,3245,148,-2722,3927,129,-1429,3980,148,-1449,3202,129,-2687,3927,71,-1429,3927,129,-1429,3202,71,-2687,3980,52,-1449,3927,71,-1429,3245,52,-2722,4012,100,-1460,3980,52,-1449,3271,100,-2745,2118,148,-3668,3245,148,-2722,3245,148,-2722,2090,129,-3620,3202,129,-2687,2090,129,-3620,3202,71,-2687,3202,129,-2687,2090,71,-3620,3245,52,-2722,3202,71,-2687,2118,52,-3668,3271,100,-2745,3245,52,-2722,741,100,-4205,2118,148,-3668,2135,100,-3698,735,148,-4171,2090,129,-3620,2118,148,-3668,726,129,-4116,2090,71,-3620,2090,129,-3620,726,71,-4116,2118,52,-3668,2090,71,-3620,735,52,-4171,2135,100,-3698,2118,52,-3668,-741,100,-4205,735,148,-4171,741,100,-4205,735,148,-4171,-726,129,-4116,726,129,-4116,-726,129,-4116,726,71,-4116,726,129,-4116,-726,71,-4116,735,52,-4171,726,71,-4116,-735,52,-4171,741,100,-4205,735,52,-4171,-741,100,-4205,-2118,148,-3668,-735,148,-4171,-2118,148,-3668,-726,129,-4116,-735,148,-4171,-2090,129,-3620,-726,71,-4116,-726,129,-4116,-2090,71,-3620,-735,52,-4171,-726,71,-4116,-2118,52,-3668,-741,100,-4205,-735,52,-4171,-3271,100,-2745,-2118,148,-3668,-2135,100,-3698,-3245,148,-2722,-2090,129,-3620,-2118,148,-3668,-3202,129,-2687,-2090,71,-3620,-2090,129,-3620,-2090,71,-3620,-3245,52,-2722,-2118,52,-3668,-2118,52,-3668,-3271,100,-2745,-2135,100,-3698,-3271,100,-2745,-3980,148,-1449,-3245,148,-2722,-3980,148,-1449,-3202,129,-2687,-3245,148,-2722,-3927,129,-1429,-3202,71,-2687,-3202,129,-2687,-3202,71,-2687,-3980,52,-1449,-3245,52,-2722,-3980,52,-1449,-3271,100,-2745,-3245,52,-2722,-4270,100,0,-3980,148,-1449,-4012,100,-1460,-3980,148,-1449,-4180,129,0,-3927,129,-1429,-4180,129,0,-3927,71,-1429,-3927,129,-1429,-4180,71,0,-3980,52,-1449,-3927,71,-1429,-3980,52,-1449,-4270,100,0,-4012,100,-1460,-4012,100,1460,-4235,148,0,-4270,100,0,-4235,148,0,-3927,129,1429,-4180,129,0,-3927,129,1429,-4180,71,0,-4180,129,0,-4180,71,0,-3980,52,1449,-4235,52,0,-3980,52,1449,-4270,100,0,-4235,52,0,-3271,100,2745,-3980,148,1449,-4012,100,1460,-3245,148,2722,-3927,129,1429,-3980,148,1449,-3202,129,2687,-3927,71,1429,-3927,129,1429,-3202,71,2687,-3980,52,1449,-3927,71,1429,-3245,52,2722,-4012,100,1460,-3980,52,1449,-3271,100,2745,-2118,148,3668,-3245,148,2722,-3245,148,2722,-2090,129,3620,-3202,129,2687,-2090,129,3620,-3202,71,2687,-3202,129,2687,-2090,71,3620,-3245,52,2722,-3202,71,2687,-2118,52,3668,-3271,100,2745,-3245,52,2722,-741,100,4205,-2118,148,3668,-2135,100,3698,-735,148,4171,-2090,129,3620,-2118,148,3668,-726,129,4116,-2090,71,3620,-2090,129,3620,-726,71,4116,-2118,52,3668,-2090,71,3620,-735,52,4171,-2135,100,3698,-2118,52,3668,741,100,4205,-735,148,4171,-741,100,4205,-735,148,4171,726,129,4116,-726,129,4116,726,129,4116,-726,71,4116,-726,129,4116,726,71,4116,-735,52,4171,-726,71,4116,735,52,4171,-741,100,4205,-735,52,4171,741,100,4205,2118,148,3668,735,148,4171,2118,148,3668,726,129,4116,735,148,4171,2090,129,3620,726,71,4116,726,129,4116,2090,71,3620,735,52,4171,726,71,4116,2118,52,3668,741,100,4205,735,52,4171,3271,100,2745,2118,148,3668,2135,100,3698,3245,148,2722,2090,129,3620,2118,148,3668,3202,129,2687,2090,71,3620,2090,129,3620,2090,71,3620,3245,52,2722,2118,52,3668,2118,52,3668,3271,100,2745,2135,100,3698,3271,100,2745,3980,148,1449,3245,148,2722,3980,148,1449,3202,129,2687,3245,148,2722,3927,129,1429,3202,71,2687,3202,129,2687,3202,71,2687,3980,52,1449,3245,52,2722,3980,52,1449,3271,100,2745,3245,52,2722,4270,100,0,3980,148,1449,4012,100,1460,3980,148,1449,4180,129,0,3927,129,1429,4180,129,0,3927,71,1429,3927,129,1429,4180,71,0,3980,52,1449,3927,71,1429,3980,52,1449,4270,100,0,4012,100,1460,3019,-2919,0,2848,-2681,-1449,3029,-2861,0,3029,-2861,0,2798,-2656,-1429,2976,-2835,0,2798,-2656,-1429,2935,-2876,0,2976,-2835,0,2756,-2698,-1429,2961,-2929,0,2935,-2876,0,2781,-2748,-1449,3019,-2919,0,2961,-2929,0,2313,-2213,-2745,2848,-2681,-1449,2837,-2737,-1460,2328,-2161,-2722,2798,-2656,-1429,2848,-2681,-1449,2285,-2143,-2687,2756,-2698,-1429,2798,-2656,-1429,2243,-2185,-2687,2781,-2748,-1449,2756,-2698,-1429,2261,-2228,-2722,2837,-2737,-1460,2781,-2748,-1449,1510,-1410,-3698,2328,-2161,-2722,2313,-2213,-2745,2328,-2161,-2722,1498,-1357,-3620,2285,-2143,-2687,2285,-2143,-2687,1457,-1398,-3620,2243,-2185,-2687,2243,-2185,-2687,1464,-1431,-3668,2261,-2228,-2722,1464,-1431,-3668,2313,-2213,-2745,2261,-2228,-2722,1510,-1410,-3698,554,-386,-4171,1531,-1364,-3668,1531,-1364,-3668,534,-392,-4116,1498,-1357,-3620,1498,-1357,-3620,492,-434,-4116,1457,-1398,-3620,1457,-1398,-3620,486,-454,-4171,1464,-1431,-3668,1464,-1431,-3668,524,-424,-4205,1510,-1410,-3698,524,-424,-4205,-486,654,-4171,554,-386,-4171,-486,654,-4171,534,-392,-4116,554,-386,-4171,534,-392,-4116,-534,592,-4116,492,-434,-4116,492,-434,-4116,-554,586,-4171,486,-454,-4171,486,-454,-4171,-524,624,-4205,524,-424,-4205,-1510,1610,-3698,-486,654,-4171,-524,624,-4205,-1464,1631,-3668,-492,634,-4116,-486,654,-4171,-492,634,-4116,-1498,1557,-3620,-534,592,-4116,-534,592,-4116,-1531,1564,-3668,-554,586,-4171,-1531,1564,-3668,-524,624,-4205,-554,586,-4171,-2313,2413,-2745,-1464,1631,-3668,-1510,1610,-3698,-2261,2428,-2722,-1457,1598,-3620,-1464,1631,-3668,-2243,2385,-2687,-1498,1557,-3620,-1457,1598,-3620,-2285,2343,-2687,-1531,1564,-3668,-1498,1557,-3620,-2328,2361,-2722,-1510,1610,-3698,-1531,1564,-3668,-2837,2937,-1460,-2261,2428,-2722,-2313,2413,-2745,-2781,2948,-1449,-2243,2385,-2687,-2261,2428,-2722,-2756,2898,-1429,-2285,2343,-2687,-2243,2385,-2687,-2285,2343,-2687,-2848,2881,-1449,-2328,2361,-2722,-2328,2361,-2722,-2837,2937,-1460,-2313,2413,-2745,-3019,3119,0,-2781,2948,-1449,-2837,2937,-1460,-2961,3129,0,-2756,2898,-1429,-2781,2948,-1449,-2935,3076,0,-2798,2856,-1429,-2756,2898,-1429,-2976,3035,0,-2848,2881,-1449,-2798,2856,-1429,-3029,3061,0,-2837,2937,-1460,-2848,2881,-1449,-2837,2937,1460,-2961,3129,0,-3019,3119,0,-2961,3129,0,-2756,2898,1429,-2935,3076,0,-2756,2898,1429,-2976,3035,0,-2935,3076,0,-2798,2856,1429,-3029,3061,0,-2976,3035,0,-2848,2881,1449,-3019,3119,0,-3029,3061,0,-2313,2413,2745,-2781,2948,1449,-2837,2937,1460,-2261,2428,2722,-2756,2898,1429,-2781,2948,1449,-2243,2385,2687,-2798,2856,1429,-2756,2898,1429,-2798,2856,1429,-2328,2361,2722,-2848,2881,1449,-2328,2361,2722,-2837,2937,1460,-2848,2881,1449,-1510,1610,3698,-2261,2428,2722,-2313,2413,2745,-1464,1631,3668,-2243,2385,2687,-2261,2428,2722,-1457,1598,3620,-2285,2343,2687,-2243,2385,2687,-1498,1557,3620,-2328,2361,2722,-2285,2343,2687,-2328,2361,2722,-1510,1610,3698,-2313,2413,2745,-524,624,4205,-1464,1631,3668,-1510,1610,3698,-1464,1631,3668,-492,634,4116,-1457,1598,3620,-492,634,4116,-1498,1557,3620,-1457,1598,3620,-1498,1557,3620,-554,586,4171,-1531,1564,3668,-1531,1564,3668,-524,624,4205,-1510,1610,3698,-524,624,4205,554,-386,4171,-486,654,4171,554,-386,4171,-492,634,4116,-486,654,4171,534,-392,4116,-534,592,4116,-492,634,4116,492,-434,4116,-554,586,4171,-534,592,4116,-554,586,4171,524,-424,4205,-524,624,4205,1510,-1410,3698,554,-386,4171,524,-424,4205,1531,-1364,3668,534,-392,4116,554,-386,4171,534,-392,4116,1457,-1398,3620,492,-434,4116,492,-434,4116,1464,-1431,3668,486,-454,4171,1464,-1431,3668,524,-424,4205,486,-454,4171,1510,-1410,3698,2328,-2161,2722,1531,-1364,3668,2328,-2161,2722,1498,-1357,3620,1531,-1364,3668,2285,-2143,2687,1457,-1398,3620,1498,-1357,3620,2243,-2185,2687,1464,-1431,3668,1457,-1398,3620,2261,-2228,2722,1510,-1410,3698,1464,-1431,3668,2837,-2737,1460,2328,-2161,2722,2313,-2213,2745,2328,-2161,2722,2798,-2656,1429,2285,-2143,2687,2285,-2143,2687,2756,-2698,1429,2243,-2185,2687,2243,-2185,2687,2781,-2748,1449,2261,-2228,2722,2261,-2228,2722,2837,-2737,1460,2313,-2213,2745,3019,-2919,0,2848,-2681,1449,2837,-2737,1460,3029,-2861,0,2798,-2656,1429,2848,-2681,1449,2798,-2656,1429,2935,-2876,0,2756,-2698,1429,2935,-2876,0,2781,-2748,1449,2756,-2698,1429,2961,-2929,0,2837,-2737,1460,2781,-2748,1449,4270,100,0,3980,1549,48,4235,100,48,3980,1549,48,4180,100,29,4235,100,48,3927,1529,29,4180,100,-29,4180,100,29,3927,1529,-29,4235,100,-48,4180,100,-29,3980,1549,-48,4270,100,0,4235,100,-48,3271,2845,0,3980,1549,48,4012,1560,0,3980,1549,48,3202,2787,29,3927,1529,29,3202,2787,29,3927,1529,-29,3927,1529,29,3202,2787,-29,3980,1549,-48,3927,1529,-29,3245,2822,-48,4012,1560,0,3980,1549,-48,3271,2845,0,2118,3768,48,3245,2822,48,2118,3768,48,3202,2787,29,3245,2822,48,2090,3720,29,3202,2787,-29,3202,2787,29,2090,3720,-29,3245,2822,-48,3202,2787,-29,2118,3768,-48,3271,2845,0,3245,2822,-48,2135,3798,0,735,4271,48,2118,3768,48,2118,3768,48,726,4216,29,2090,3720,29,726,4216,29,2090,3720,-29,2090,3720,29,2090,3720,-29,735,4271,-48,2118,3768,-48,2118,3768,-48,741,4305,0,2135,3798,0,-741,4305,0,735,4271,48,741,4305,0,-735,4271,48,726,4216,29,735,4271,48,-726,4216,29,726,4216,-29,726,4216,29,-726,4216,-29,735,4271,-48,726,4216,-29,-735,4271,-48,741,4305,0,735,4271,-48,-2135,3798,0,-735,4271,48,-741,4305,0,-2118,3768,48,-726,4216,29,-735,4271,48,-2090,3720,29,-726,4216,-29,-726,4216,29,-2090,3720,-29,-735,4271,-48,-726,4216,-29,-735,4271,-48,-2135,3798,0,-741,4305,0,-3271,2845,0,-2118,3768,48,-2135,3798,0,-2118,3768,48,-3202,2787,29,-2090,3720,29,-3202,2787,29,-2090,3720,-29,-2090,3720,29,-3202,2787,-29,-2118,3768,-48,-2090,3720,-29,-2118,3768,-48,-3271,2845,0,-2135,3798,0,-3271,2845,0,-3980,1549,48,-3245,2822,48,-3980,1549,48,-3202,2787,29,-3245,2822,48,-3927,1529,29,-3202,2787,-29,-3202,2787,29,-3202,2787,-29,-3980,1549,-48,-3245,2822,-48,-3980,1549,-48,-3271,2845,0,-3245,2822,-48,-4012,1560,0,-4235,100,48,-3980,1549,48,-4235,100,48,-3927,1529,29,-3980,1549,48,-4180,100,29,-3927,1529,-29,-3927,1529,29,-3927,1529,-29,-4235,100,-48,-3980,1549,-48,-4235,100,-48,-4012,1560,0,-3980,1549,-48,-4270,100,0,-3980,-1349,48,-4235,100,48,-3980,-1349,48,-4180,100,29,-4235,100,48,-3927,-1329,29,-4180,100,-29,-4180,100,29,-3927,-1329,-29,-4235,100,-48,-4180,100,-29,-4235,100,-48,-4012,-1360,0,-4270,100,0,-3271,-2645,0,-3980,-1349,48,-4012,-1360,0,-3980,-1349,48,-3202,-2587,29,-3927,-1329,29,-3202,-2587,29,-3927,-1329,-29,-3927,-1329,29,-3927,-1329,-29,-3245,-2622,-48,-3980,-1349,-48,-3980,-1349,-48,-3271,-2645,0,-4012,-1360,0,-2135,-3598,0,-3245,-2622,48,-3271,-2645,0,-3245,-2622,48,-2090,-3520,29,-3202,-2587,29,-2090,-3520,29,-3202,-2587,-29,-3202,-2587,29,-2090,-3520,-29,-3245,-2622,-48,-3202,-2587,-29,-3245,-2622,-48,-2135,-3598,0,-3271,-2645,0,-2135,-3598,0,-735,-4071,48,-2118,-3568,48,-2118,-3568,48,-726,-4016,29,-2090,-3520,29,-726,-4016,29,-2090,-3520,-29,-2090,-3520,29,-2090,-3520,-29,-735,-4071,-48,-2118,-3568,-48,-2118,-3568,-48,-741,-4105,0,-2135,-3598,0,741,-4105,0,-735,-4071,48,-741,-4105,0,735,-4071,48,-726,-4016,29,-735,-4071,48,726,-4016,29,-726,-4016,-29,-726,-4016,29,726,-4016,-29,-735,-4071,-48,-726,-4016,-29,735,-4071,-48,-741,-4105,0,-735,-4071,-48,2135,-3598,0,735,-4071,48,741,-4105,0,2118,-3568,48,726,-4016,29,735,-4071,48,2090,-3520,29,726,-4016,-29,726,-4016,29,2090,-3520,-29,735,-4071,-48,726,-4016,-29,2118,-3568,-48,741,-4105,0,735,-4071,-48,2135,-3598,0,3245,-2622,48,2118,-3568,48,2118,-3568,48,3202,-2587,29,2090,-3520,29,3202,-2587,29,2090,-3520,-29,2090,-3520,29,3202,-2587,-29,2118,-3568,-48,2090,-3520,-29,3245,-2622,-48,2135,-3598,0,2118,-3568,-48,4012,-1360,0,3245,-2622,48,3271,-2645,0,3980,-1349,48,3202,-2587,29,3245,-2622,48,3927,-1329,29,3202,-2587,-29,3202,-2587,29,3202,-2587,-29,3980,-1349,-48,3245,-2622,-48,3245,-2622,-48,4012,-1360,0,3271,-2645,0,4270,100,0,3980,-1349,48,4012,-1360,0,4235,100,48,3927,-1329,29,3980,-1349,48,4180,100,29,3927,-1329,-29,3927,-1329,29,3927,-1329,-29,4235,100,-48,3980,-1349,-48,4235,100,-48,4012,-1360,0,3980,-1349,-48,-2837,-2737,-1460,-2961,-2929,0,-3019,-2919,0,-2961,-2929,0,-2756,-2698,-1429,-2935,-2876,0,-2935,-2876,0,-2798,-2656,-1429,-2976,-2835,0,-2976,-2835,0,-2848,-2681,-1449,-3029,-2861,0,-3029,-2861,0,-2837,-2737,-1460,-3019,-2919,0,-2313,-2213,-2745,-2781,-2748,-1449,-2837,-2737,-1460,-2261,-2228,-2722,-2756,-2698,-1429,-2781,-2748,-1449,-2756,-2698,-1429,-2285,-2143,-2687,-2798,-2656,-1429,-2285,-2143,-2687,-2848,-2681,-1449,-2798,-2656,-1429,-2328,-2161,-2722,-2837,-2737,-1460,-2848,-2681,-1449,-2313,-2213,-2745,-1464,-1431,-3668,-2261,-2228,-2722,-2261,-2228,-2722,-1457,-1398,-3620,-2243,-2185,-2687,-1457,-1398,-3620,-2285,-2143,-2687,-2243,-2185,-2687,-2285,-2143,-2687,-1531,-1364,-3668,-2328,-2161,-2722,-1531,-1364,-3668,-2313,-2213,-2745,-2328,-2161,-2722,-1510,-1410,-3698,-486,-454,-4171,-1464,-1431,-3668,-1464,-1431,-3668,-492,-434,-4116,-1457,-1398,-3620,-492,-434,-4116,-1498,-1357,-3620,-1457,-1398,-3620,-1498,-1357,-3620,-554,-386,-4171,-1531,-1364,-3668,-1531,-1364,-3668,-524,-424,-4205,-1510,-1410,-3698,524,624,-4205,-486,-454,-4171,-524,-424,-4205,554,586,-4171,-492,-434,-4116,-486,-454,-4171,-492,-434,-4116,492,634,-4116,-534,-392,-4116,-534,-392,-4116,486,654,-4171,-554,-386,-4171,-554,-386,-4171,524,624,-4205,-524,-424,-4205,524,624,-4205,1531,1564,-3668,554,586,-4171,1531,1564,-3668,534,592,-4116,554,586,-4171,1498,1557,-3620,492,634,-4116,534,592,-4116,1457,1598,-3620,486,654,-4171,492,634,-4116,486,654,-4171,1510,1610,-3698,524,624,-4205,2313,2413,-2745,1531,1564,-3668,1510,1610,-3698,2328,2361,-2722,1498,1557,-3620,1531,1564,-3668,1498,1557,-3620,2243,2385,-2687,1457,1598,-3620,1457,1598,-3620,2261,2428,-2722,1464,1631,-3668,2261,2428,-2722,1510,1610,-3698,1464,1631,-3668,2313,2413,-2745,2848,2881,-1449,2328,2361,-2722,2328,2361,-2722,2798,2856,-1429,2285,2343,-2687,2285,2343,-2687,2756,2898,-1429,2243,2385,-2687,2756,2898,-1429,2261,2428,-2722,2243,2385,-2687,2261,2428,-2722,2837,2937,-1460,2313,2413,-2745,3019,3119,0,2848,2881,-1449,2837,2937,-1460,3029,3061,0,2798,2856,-1429,2848,2881,-1449,2976,3035,0,2756,2898,-1429,2798,2856,-1429,2756,2898,-1429,2961,3129,0,2781,2948,-1449,2961,3129,0,2837,2937,-1460,2781,2948,-1449,3019,3119,0,2848,2881,1449,3029,3061,0,2848,2881,1449,2976,3035,0,3029,3061,0,2798,2856,1429,2935,3076,0,2976,3035,0,2935,3076,0,2781,2948,1449,2961,3129,0,2961,3129,0,2837,2937,1460,3019,3119,0,2837,2937,1460,2328,2361,2722,2848,2881,1449,2328,2361,2722,2798,2856,1429,2848,2881,1449,2798,2856,1429,2243,2385,2687,2756,2898,1429,2243,2385,2687,2781,2948,1449,2756,2898,1429,2781,2948,1449,2313,2413,2745,2837,2937,1460,2313,2413,2745,1531,1564,3668,2328,2361,2722,1531,1564,3668,2285,2343,2687,2328,2361,2722,1498,1557,3620,2243,2385,2687,2285,2343,2687,1457,1598,3620,2261,2428,2722,2243,2385,2687,1464,1631,3668,2313,2413,2745,2261,2428,2722,1510,1610,3698,554,586,4171,1531,1564,3668,554,586,4171,1498,1557,3620,1531,1564,3668,1498,1557,3620,492,634,4116,1457,1598,3620,492,634,4116,1464,1631,3668,1457,1598,3620,486,654,4171,1510,1610,3698,1464,1631,3668,-524,-424,4205,554,586,4171,524,624,4205,554,586,4171,-492,-434,4116,534,592,4116,-492,-434,4116,492,634,4116,534,592,4116,492,634,4116,-554,-386,4171,486,654,4171,486,654,4171,-524,-424,4205,524,624,4205,-524,-424,4205,-1464,-1431,3668,-486,-454,4171,-1464,-1431,3668,-492,-434,4116,-486,-454,4171,-1457,-1398,3620,-534,-392,4116,-492,-434,4116,-534,-392,4116,-1531,-1364,3668,-554,-386,4171,-1531,-1364,3668,-524,-424,4205,-554,-386,4171,-2313,-2213,2745,-1464,-1431,3668,-1510,-1410,3698,-2261,-2228,2722,-1457,-1398,3620,-1464,-1431,3668,-2243,-2185,2687,-1498,-1357,3620,-1457,-1398,3620,-1498,-1357,3620,-2328,-2161,2722,-1531,-1364,3668,-2328,-2161,2722,-1510,-1410,3698,-1531,-1364,3668,-2313,-2213,2745,-2781,-2748,1449,-2261,-2228,2722,-2781,-2748,1449,-2243,-2185,2687,-2261,-2228,2722,-2243,-2185,2687,-2798,-2656,1429,-2285,-2143,2687,-2798,-2656,1429,-2328,-2161,2722,-2285,-2143,2687,-2848,-2681,1449,-2313,-2213,2745,-2328,-2161,2722,-2837,-2737,1460,-2961,-2929,0,-2781,-2748,1449,-2961,-2929,0,-2756,-2698,1429,-2781,-2748,1449,-2935,-2876,0,-2798,-2656,1429,-2756,-2698,1429,-2976,-2835,0,-2848,-2681,1449,-2798,-2656,1429,-2848,-2681,1449,-3019,-2919,0,-2837,-2737,1460,4012,100,-1460,3980,148,-1449,4235,148,0,4235,148,0,3980,148,-1449,3927,129,-1429,3927,129,-1429,3927,71,-1429,4180,71,0,4180,71,0,3927,71,-1429,3980,52,-1449,3980,52,-1449,4012,100,-1460,4270,100,0,3271,100,-2745,3245,148,-2722,3980,148,-1449,3245,148,-2722,3202,129,-2687,3927,129,-1429,3202,129,-2687,3202,71,-2687,3927,71,-1429,3202,71,-2687,3245,52,-2722,3980,52,-1449,3245,52,-2722,3271,100,-2745,4012,100,-1460,3271,100,-2745,2135,100,-3698,2118,148,-3668,3245,148,-2722,2118,148,-3668,2090,129,-3620,2090,129,-3620,2090,71,-3620,3202,71,-2687,2090,71,-3620,2118,52,-3668,3245,52,-2722,2118,52,-3668,2135,100,-3698,3271,100,-2745,741,100,-4205,735,148,-4171,2118,148,-3668,735,148,-4171,726,129,-4116,2090,129,-3620,726,129,-4116,726,71,-4116,2090,71,-3620,726,71,-4116,735,52,-4171,2118,52,-3668,735,52,-4171,741,100,-4205,2135,100,-3698,-741,100,-4205,-735,148,-4171,735,148,-4171,735,148,-4171,-735,148,-4171,-726,129,-4116,-726,129,-4116,-726,71,-4116,726,71,-4116,-726,71,-4116,-735,52,-4171,735,52,-4171,-735,52,-4171,-741,100,-4205,741,100,-4205,-741,100,-4205,-2135,100,-3698,-2118,148,-3668,-2118,148,-3668,-2090,129,-3620,-726,129,-4116,-2090,129,-3620,-2090,71,-3620,-726,71,-4116,-2090,71,-3620,-2118,52,-3668,-735,52,-4171,-2118,52,-3668,-2135,100,-3698,-741,100,-4205,-3271,100,-2745,-3245,148,-2722,-2118,148,-3668,-3245,148,-2722,-3202,129,-2687,-2090,129,-3620,-3202,129,-2687,-3202,71,-2687,-2090,71,-3620,-2090,71,-3620,-3202,71,-2687,-3245,52,-2722,-2118,52,-3668,-3245,52,-2722,-3271,100,-2745,-3271,100,-2745,-4012,100,-1460,-3980,148,-1449,-3980,148,-1449,-3927,129,-1429,-3202,129,-2687,-3927,129,-1429,-3927,71,-1429,-3202,71,-2687,-3202,71,-2687,-3927,71,-1429,-3980,52,-1449,-3980,52,-1449,-4012,100,-1460,-3271,100,-2745,-4270,100,0,-4235,148,0,-3980,148,-1449,-3980,148,-1449,-4235,148,0,-4180,129,0,-4180,129,0,-4180,71,0,-3927,71,-1429,-4180,71,0,-4235,52,0,-3980,52,-1449,-3980,52,-1449,-4235,52,0,-4270,100,0,-4012,100,1460,-3980,148,1449,-4235,148,0,-4235,148,0,-3980,148,1449,-3927,129,1429,-3927,129,1429,-3927,71,1429,-4180,71,0,-4180,71,0,-3927,71,1429,-3980,52,1449,-3980,52,1449,-4012,100,1460,-4270,100,0,-3271,100,2745,-3245,148,2722,-3980,148,1449,-3245,148,2722,-3202,129,2687,-3927,129,1429,-3202,129,2687,-3202,71,2687,-3927,71,1429,-3202,71,2687,-3245,52,2722,-3980,52,1449,-3245,52,2722,-3271,100,2745,-4012,100,1460,-3271,100,2745,-2135,100,3698,-2118,148,3668,-3245,148,2722,-2118,148,3668,-2090,129,3620,-2090,129,3620,-2090,71,3620,-3202,71,2687,-2090,71,3620,-2118,52,3668,-3245,52,2722,-2118,52,3668,-2135,100,3698,-3271,100,2745,-741,100,4205,-735,148,4171,-2118,148,3668,-735,148,4171,-726,129,4116,-2090,129,3620,-726,129,4116,-726,71,4116,-2090,71,3620,-726,71,4116,-735,52,4171,-2118,52,3668,-735,52,4171,-741,100,4205,-2135,100,3698,741,100,4205,735,148,4171,-735,148,4171,-735,148,4171,735,148,4171,726,129,4116,726,129,4116,726,71,4116,-726,71,4116,726,71,4116,735,52,4171,-735,52,4171,735,52,4171,741,100,4205,-741,100,4205,741,100,4205,2135,100,3698,2118,148,3668,2118,148,3668,2090,129,3620,726,129,4116,2090,129,3620,2090,71,3620,726,71,4116,2090,71,3620,2118,52,3668,735,52,4171,2118,52,3668,2135,100,3698,741,100,4205,3271,100,2745,3245,148,2722,2118,148,3668,3245,148,2722,3202,129,2687,2090,129,3620,3202,129,2687,3202,71,2687,2090,71,3620,2090,71,3620,3202,71,2687,3245,52,2722,2118,52,3668,3245,52,2722,3271,100,2745,3271,100,2745,4012,100,1460,3980,148,1449,3980,148,1449,3927,129,1429,3202,129,2687,3927,129,1429,3927,71,1429,3202,71,2687,3202,71,2687,3927,71,1429,3980,52,1449,3980,52,1449,4012,100,1460,3271,100,2745,4270,100,0,4235,148,0,3980,148,1449,3980,148,1449,4235,148,0,4180,129,0,4180,129,0,4180,71,0,3927,71,1429,4180,71,0,4235,52,0,3980,52,1449,3980,52,1449,4235,52,0,4270,100,0,3019,-2919,0,2837,-2737,-1460,2848,-2681,-1449,3029,-2861,0,2848,-2681,-1449,2798,-2656,-1429,2798,-2656,-1429,2756,-2698,-1429,2935,-2876,0,2756,-2698,-1429,2781,-2748,-1449,2961,-2929,0,2781,-2748,-1449,2837,-2737,-1460,3019,-2919,0,2313,-2213,-2745,2328,-2161,-2722,2848,-2681,-1449,2328,-2161,-2722,2285,-2143,-2687,2798,-2656,-1429,2285,-2143,-2687,2243,-2185,-2687,2756,-2698,-1429,2243,-2185,-2687,2261,-2228,-2722,2781,-2748,-1449,2261,-2228,-2722,2313,-2213,-2745,2837,-2737,-1460,1510,-1410,-3698,1531,-1364,-3668,2328,-2161,-2722,2328,-2161,-2722,1531,-1364,-3668,1498,-1357,-3620,2285,-2143,-2687,1498,-1357,-3620,1457,-1398,-3620,2243,-2185,-2687,1457,-1398,-3620,1464,-1431,-3668,1464,-1431,-3668,1510,-1410,-3698,2313,-2213,-2745,1510,-1410,-3698,524,-424,-4205,554,-386,-4171,1531,-1364,-3668,554,-386,-4171,534,-392,-4116,1498,-1357,-3620,534,-392,-4116,492,-434,-4116,1457,-1398,-3620,492,-434,-4116,486,-454,-4171,1464,-1431,-3668,486,-454,-4171,524,-424,-4205,524,-424,-4205,-524,624,-4205,-486,654,-4171,-486,654,-4171,-492,634,-4116,534,-392,-4116,534,-392,-4116,-492,634,-4116,-534,592,-4116,492,-434,-4116,-534,592,-4116,-554,586,-4171,486,-454,-4171,-554,586,-4171,-524,624,-4205,-1510,1610,-3698,-1464,1631,-3668,-486,654,-4171,-1464,1631,-3668,-1457,1598,-3620,-492,634,-4116,-492,634,-4116,-1457,1598,-3620,-1498,1557,-3620,-534,592,-4116,-1498,1557,-3620,-1531,1564,-3668,-1531,1564,-3668,-1510,1610,-3698,-524,624,-4205,-2313,2413,-2745,-2261,2428,-2722,-1464,1631,-3668,-2261,2428,-2722,-2243,2385,-2687,-1457,1598,-3620,-2243,2385,-2687,-2285,2343,-2687,-1498,1557,-3620,-2285,2343,-2687,-2328,2361,-2722,-1531,1564,-3668,-2328,2361,-2722,-2313,2413,-2745,-1510,1610,-3698,-2837,2937,-1460,-2781,2948,-1449,-2261,2428,-2722,-2781,2948,-1449,-2756,2898,-1429,-2243,2385,-2687,-2756,2898,-1429,-2798,2856,-1429,-2285,2343,-2687,-2285,2343,-2687,-2798,2856,-1429,-2848,2881,-1449,-2328,2361,-2722,-2848,2881,-1449,-2837,2937,-1460,-3019,3119,0,-2961,3129,0,-2781,2948,-1449,-2961,3129,0,-2935,3076,0,-2756,2898,-1429,-2935,3076,0,-2976,3035,0,-2798,2856,-1429,-2976,3035,0,-3029,3061,0,-2848,2881,-1449,-3029,3061,0,-3019,3119,0,-2837,2937,-1460,-2837,2937,1460,-2781,2948,1449,-2961,3129,0,-2961,3129,0,-2781,2948,1449,-2756,2898,1429,-2756,2898,1429,-2798,2856,1429,-2976,3035,0,-2798,2856,1429,-2848,2881,1449,-3029,3061,0,-2848,2881,1449,-2837,2937,1460,-3019,3119,0,-2313,2413,2745,-2261,2428,2722,-2781,2948,1449,-2261,2428,2722,-2243,2385,2687,-2756,2898,1429,-2243,2385,2687,-2285,2343,2687,-2798,2856,1429,-2798,2856,1429,-2285,2343,2687,-2328,2361,2722,-2328,2361,2722,-2313,2413,2745,-2837,2937,1460,-1510,1610,3698,-1464,1631,3668,-2261,2428,2722,-1464,1631,3668,-1457,1598,3620,-2243,2385,2687,-1457,1598,3620,-1498,1557,3620,-2285,2343,2687,-1498,1557,3620,-1531,1564,3668,-2328,2361,2722,-2328,2361,2722,-1531,1564,3668,-1510,1610,3698,-524,624,4205,-486,654,4171,-1464,1631,3668,-1464,1631,3668,-486,654,4171,-492,634,4116,-492,634,4116,-534,592,4116,-1498,1557,3620,-1498,1557,3620,-534,592,4116,-554,586,4171,-1531,1564,3668,-554,586,4171,-524,624,4205,-524,624,4205,524,-424,4205,554,-386,4171,554,-386,4171,534,-392,4116,-492,634,4116,534,-392,4116,492,-434,4116,-534,592,4116,492,-434,4116,486,-454,4171,-554,586,4171,-554,586,4171,486,-454,4171,524,-424,4205,1510,-1410,3698,1531,-1364,3668,554,-386,4171,1531,-1364,3668,1498,-1357,3620,534,-392,4116,534,-392,4116,1498,-1357,3620,1457,-1398,3620,492,-434,4116,1457,-1398,3620,1464,-1431,3668,1464,-1431,3668,1510,-1410,3698,524,-424,4205,1510,-1410,3698,2313,-2213,2745,2328,-2161,2722,2328,-2161,2722,2285,-2143,2687,1498,-1357,3620,2285,-2143,2687,2243,-2185,2687,1457,-1398,3620,2243,-2185,2687,2261,-2228,2722,1464,-1431,3668,2261,-2228,2722,2313,-2213,2745,1510,-1410,3698,2837,-2737,1460,2848,-2681,1449,2328,-2161,2722,2328,-2161,2722,2848,-2681,1449,2798,-2656,1429,2285,-2143,2687,2798,-2656,1429,2756,-2698,1429,2243,-2185,2687,2756,-2698,1429,2781,-2748,1449,2261,-2228,2722,2781,-2748,1449,2837,-2737,1460,3019,-2919,0,3029,-2861,0,2848,-2681,1449,3029,-2861,0,2976,-2835,0,2798,-2656,1429,2798,-2656,1429,2976,-2835,0,2935,-2876,0,2935,-2876,0,2961,-2929,0,2781,-2748,1449,2961,-2929,0,3019,-2919,0,2837,-2737,1460,4270,100,0,4012,1560,0,3980,1549,48,3980,1549,48,3927,1529,29,4180,100,29,3927,1529,29,3927,1529,-29,4180,100,-29,3927,1529,-29,3980,1549,-48,4235,100,-48,3980,1549,-48,4012,1560,0,4270,100,0,3271,2845,0,3245,2822,48,3980,1549,48,3980,1549,48,3245,2822,48,3202,2787,29,3202,2787,29,3202,2787,-29,3927,1529,-29,3202,2787,-29,3245,2822,-48,3980,1549,-48,3245,2822,-48,3271,2845,0,4012,1560,0,3271,2845,0,2135,3798,0,2118,3768,48,2118,3768,48,2090,3720,29,3202,2787,29,2090,3720,29,2090,3720,-29,3202,2787,-29,2090,3720,-29,2118,3768,-48,3245,2822,-48,2118,3768,-48,2135,3798,0,3271,2845,0,2135,3798,0,741,4305,0,735,4271,48,2118,3768,48,735,4271,48,726,4216,29,726,4216,29,726,4216,-29,2090,3720,-29,2090,3720,-29,726,4216,-29,735,4271,-48,2118,3768,-48,735,4271,-48,741,4305,0,-741,4305,0,-735,4271,48,735,4271,48,-735,4271,48,-726,4216,29,726,4216,29,-726,4216,29,-726,4216,-29,726,4216,-29,-726,4216,-29,-735,4271,-48,735,4271,-48,-735,4271,-48,-741,4305,0,741,4305,0,-2135,3798,0,-2118,3768,48,-735,4271,48,-2118,3768,48,-2090,3720,29,-726,4216,29,-2090,3720,29,-2090,3720,-29,-726,4216,-29,-2090,3720,-29,-2118,3768,-48,-735,4271,-48,-735,4271,-48,-2118,3768,-48,-2135,3798,0,-3271,2845,0,-3245,2822,48,-2118,3768,48,-2118,3768,48,-3245,2822,48,-3202,2787,29,-3202,2787,29,-3202,2787,-29,-2090,3720,-29,-3202,2787,-29,-3245,2822,-48,-2118,3768,-48,-2118,3768,-48,-3245,2822,-48,-3271,2845,0,-3271,2845,0,-4012,1560,0,-3980,1549,48,-3980,1549,48,-3927,1529,29,-3202,2787,29,-3927,1529,29,-3927,1529,-29,-3202,2787,-29,-3202,2787,-29,-3927,1529,-29,-3980,1549,-48,-3980,1549,-48,-4012,1560,0,-3271,2845,0,-4012,1560,0,-4270,100,0,-4235,100,48,-4235,100,48,-4180,100,29,-3927,1529,29,-4180,100,29,-4180,100,-29,-3927,1529,-29,-3927,1529,-29,-4180,100,-29,-4235,100,-48,-4235,100,-48,-4270,100,0,-4012,1560,0,-4270,100,0,-4012,-1360,0,-3980,-1349,48,-3980,-1349,48,-3927,-1329,29,-4180,100,29,-3927,-1329,29,-3927,-1329,-29,-4180,100,-29,-3927,-1329,-29,-3980,-1349,-48,-4235,100,-48,-4235,100,-48,-3980,-1349,-48,-4012,-1360,0,-3271,-2645,0,-3245,-2622,48,-3980,-1349,48,-3980,-1349,48,-3245,-2622,48,-3202,-2587,29,-3202,-2587,29,-3202,-2587,-29,-3927,-1329,-29,-3927,-1329,-29,-3202,-2587,-29,-3245,-2622,-48,-3980,-1349,-48,-3245,-2622,-48,-3271,-2645,0,-2135,-3598,0,-2118,-3568,48,-3245,-2622,48,-3245,-2622,48,-2118,-3568,48,-2090,-3520,29,-2090,-3520,29,-2090,-3520,-29,-3202,-2587,-29,-2090,-3520,-29,-2118,-3568,-48,-3245,-2622,-48,-3245,-2622,-48,-2118,-3568,-48,-2135,-3598,0,-2135,-3598,0,-741,-4105,0,-735,-4071,48,-2118,-3568,48,-735,-4071,48,-726,-4016,29,-726,-4016,29,-726,-4016,-29,-2090,-3520,-29,-2090,-3520,-29,-726,-4016,-29,-735,-4071,-48,-2118,-3568,-48,-735,-4071,-48,-741,-4105,0,741,-4105,0,735,-4071,48,-735,-4071,48,735,-4071,48,726,-4016,29,-726,-4016,29,726,-4016,29,726,-4016,-29,-726,-4016,-29,726,-4016,-29,735,-4071,-48,-735,-4071,-48,735,-4071,-48,741,-4105,0,-741,-4105,0,2135,-3598,0,2118,-3568,48,735,-4071,48,2118,-3568,48,2090,-3520,29,726,-4016,29,2090,-3520,29,2090,-3520,-29,726,-4016,-29,2090,-3520,-29,2118,-3568,-48,735,-4071,-48,2118,-3568,-48,2135,-3598,0,741,-4105,0,2135,-3598,0,3271,-2645,0,3245,-2622,48,2118,-3568,48,3245,-2622,48,3202,-2587,29,3202,-2587,29,3202,-2587,-29,2090,-3520,-29,3202,-2587,-29,3245,-2622,-48,2118,-3568,-48,3245,-2622,-48,3271,-2645,0,2135,-3598,0,4012,-1360,0,3980,-1349,48,3245,-2622,48,3980,-1349,48,3927,-1329,29,3202,-2587,29,3927,-1329,29,3927,-1329,-29,3202,-2587,-29,3202,-2587,-29,3927,-1329,-29,3980,-1349,-48,3245,-2622,-48,3980,-1349,-48,4012,-1360,0,4270,100,0,4235,100,48,3980,-1349,48,4235,100,48,4180,100,29,3927,-1329,29,4180,100,29,4180,100,-29,3927,-1329,-29,3927,-1329,-29,4180,100,-29,4235,100,-48,4235,100,-48,4270,100,0,4012,-1360,0,-2837,-2737,-1460,-2781,-2748,-1449,-2961,-2929,0,-2961,-2929,0,-2781,-2748,-1449,-2756,-2698,-1429,-2935,-2876,0,-2756,-2698,-1429,-2798,-2656,-1429,-2976,-2835,0,-2798,-2656,-1429,-2848,-2681,-1449,-3029,-2861,0,-2848,-2681,-1449,-2837,-2737,-1460,-2313,-2213,-2745,-2261,-2228,-2722,-2781,-2748,-1449,-2261,-2228,-2722,-2243,-2185,-2687,-2756,-2698,-1429,-2756,-2698,-1429,-2243,-2185,-2687,-2285,-2143,-2687,-2285,-2143,-2687,-2328,-2161,-2722,-2848,-2681,-1449,-2328,-2161,-2722,-2313,-2213,-2745,-2837,-2737,-1460,-2313,-2213,-2745,-1510,-1410,-3698,-1464,-1431,-3668,-2261,-2228,-2722,-1464,-1431,-3668,-1457,-1398,-3620,-1457,-1398,-3620,-1498,-1357,-3620,-2285,-2143,-2687,-2285,-2143,-2687,-1498,-1357,-3620,-1531,-1364,-3668,-1531,-1364,-3668,-1510,-1410,-3698,-2313,-2213,-2745,-1510,-1410,-3698,-524,-424,-4205,-486,-454,-4171,-1464,-1431,-3668,-486,-454,-4171,-492,-434,-4116,-492,-434,-4116,-534,-392,-4116,-1498,-1357,-3620,-1498,-1357,-3620,-534,-392,-4116,-554,-386,-4171,-1531,-1364,-3668,-554,-386,-4171,-524,-424,-4205,524,624,-4205,554,586,-4171,-486,-454,-4171,554,586,-4171,534,592,-4116,-492,-434,-4116,-492,-434,-4116,534,592,-4116,492,634,-4116,-534,-392,-4116,492,634,-4116,486,654,-4171,-554,-386,-4171,486,654,-4171,524,624,-4205,524,624,-4205,1510,1610,-3698,1531,1564,-3668,1531,1564,-3668,1498,1557,-3620,534,592,-4116,1498,1557,-3620,1457,1598,-3620,492,634,-4116,1457,1598,-3620,1464,1631,-3668,486,654,-4171,486,654,-4171,1464,1631,-3668,1510,1610,-3698,2313,2413,-2745,2328,2361,-2722,1531,1564,-3668,2328,2361,-2722,2285,2343,-2687,1498,1557,-3620,1498,1557,-3620,2285,2343,-2687,2243,2385,-2687,1457,1598,-3620,2243,2385,-2687,2261,2428,-2722,2261,2428,-2722,2313,2413,-2745,1510,1610,-3698,2313,2413,-2745,2837,2937,-1460,2848,2881,-1449,2328,2361,-2722,2848,2881,-1449,2798,2856,-1429,2285,2343,-2687,2798,2856,-1429,2756,2898,-1429,2756,2898,-1429,2781,2948,-1449,2261,2428,-2722,2261,2428,-2722,2781,2948,-1449,2837,2937,-1460,3019,3119,0,3029,3061,0,2848,2881,-1449,3029,3061,0,2976,3035,0,2798,2856,-1429,2976,3035,0,2935,3076,0,2756,2898,-1429,2756,2898,-1429,2935,3076,0,2961,3129,0,2961,3129,0,3019,3119,0,2837,2937,-1460,3019,3119,0,2837,2937,1460,2848,2881,1449,2848,2881,1449,2798,2856,1429,2976,3035,0,2798,2856,1429,2756,2898,1429,2935,3076,0,2935,3076,0,2756,2898,1429,2781,2948,1449,2961,3129,0,2781,2948,1449,2837,2937,1460,2837,2937,1460,2313,2413,2745,2328,2361,2722,2328,2361,2722,2285,2343,2687,2798,2856,1429,2798,2856,1429,2285,2343,2687,2243,2385,2687,2243,2385,2687,2261,2428,2722,2781,2948,1449,2781,2948,1449,2261,2428,2722,2313,2413,2745,2313,2413,2745,1510,1610,3698,1531,1564,3668,1531,1564,3668,1498,1557,3620,2285,2343,2687,1498,1557,3620,1457,1598,3620,2243,2385,2687,1457,1598,3620,1464,1631,3668,2261,2428,2722,1464,1631,3668,1510,1610,3698,2313,2413,2745,1510,1610,3698,524,624,4205,554,586,4171,554,586,4171,534,592,4116,1498,1557,3620,1498,1557,3620,534,592,4116,492,634,4116,492,634,4116,486,654,4171,1464,1631,3668,486,654,4171,524,624,4205,1510,1610,3698,-524,-424,4205,-486,-454,4171,554,586,4171,554,586,4171,-486,-454,4171,-492,-434,4116,-492,-434,4116,-534,-392,4116,492,634,4116,492,634,4116,-534,-392,4116,-554,-386,4171,486,654,4171,-554,-386,4171,-524,-424,4205,-524,-424,4205,-1510,-1410,3698,-1464,-1431,3668,-1464,-1431,3668,-1457,-1398,3620,-492,-434,4116,-1457,-1398,3620,-1498,-1357,3620,-534,-392,4116,-534,-392,4116,-1498,-1357,3620,-1531,-1364,3668,-1531,-1364,3668,-1510,-1410,3698,-524,-424,4205,-2313,-2213,2745,-2261,-2228,2722,-1464,-1431,3668,-2261,-2228,2722,-2243,-2185,2687,-1457,-1398,3620,-2243,-2185,2687,-2285,-2143,2687,-1498,-1357,3620,-1498,-1357,3620,-2285,-2143,2687,-2328,-2161,2722,-2328,-2161,2722,-2313,-2213,2745,-1510,-1410,3698,-2313,-2213,2745,-2837,-2737,1460,-2781,-2748,1449,-2781,-2748,1449,-2756,-2698,1429,-2243,-2185,2687,-2243,-2185,2687,-2756,-2698,1429,-2798,-2656,1429,-2798,-2656,1429,-2848,-2681,1449,-2328,-2161,2722,-2848,-2681,1449,-2837,-2737,1460,-2313,-2213,2745,-2837,-2737,1460,-3019,-2919,0,-2961,-2929,0,-2961,-2929,0,-2935,-2876,0,-2756,-2698,1429,-2935,-2876,0,-2976,-2835,0,-2798,-2656,1429,-2976,-2835,0,-3029,-2861,0,-2848,-2681,1449,-2848,-2681,1449,-3029,-2861,0,-3019,-2919,0]},{"n":"door","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[-700,2200,4300,-700,0,4000,-700,0,4300,-700,2200,4000,700,0,4000,-700,0,4000,700,2200,4000,700,0,4300,700,0,4000,700,2200,4300,-700,0,4300,700,0,4300,700,0,4000,-700,0,4300,-700,0,4000,-700,2200,4000,700,2200,4300,700,2200,4000,-700,2200,4300,-700,2200,4000,-700,0,4000,-700,2200,4000,700,2200,4000,700,0,4000,700,2200,4000,700,2200,4300,700,0,4300,700,2200,4300,-700,2200,4300,-700,0,4300,700,0,4000,700,0,4300,-700,0,4300,-700,2200,4000,-700,2200,4300,700,2200,4300]}],"solarDeploy":[{"n":"post","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,0,0,0,0,-120,60,0,-104,0,1200,0,80,1200,-139,0,1200,-160,0,1200,-160,60,0,-104,0,0,-120,0,0,0,60,0,-104,104,0,-60,0,1200,0,139,1200,-80,80,1200,-139,60,0,-104,139,1200,-80,104,0,-60,0,0,0,104,0,-60,120,0,0,0,1200,0,160,1200,0,139,1200,-80,139,1200,-80,120,0,0,104,0,-60,0,0,0,120,0,0,104,0,60,0,1200,0,139,1200,80,160,1200,0,160,1200,0,104,0,60,120,0,0,0,0,0,104,0,60,60,0,104,0,1200,0,80,1200,139,139,1200,80,104,0,60,80,1200,139,60,0,104,0,0,0,60,0,104,0,0,120,0,1200,0,0,1200,160,80,1200,139,80,1200,139,0,0,120,60,0,104,0,0,0,0,0,120,-60,0,104,0,1200,0,-80,1200,139,0,1200,160,0,1200,160,-60,0,104,0,0,120,0,0,0,-60,0,104,-104,0,60,0,1200,0,-139,1200,80,-80,1200,139,-60,0,104,-139,1200,80,-104,0,60,0,0,0,-104,0,60,-120,0,0,0,1200,0,-160,1200,0,-139,1200,80,-139,1200,80,-120,0,0,-104,0,60,0,0,0,-120,0,0,-104,0,-60,0,1200,0,-139,1200,-80,-160,1200,0,-160,1200,0,-104,0,-60,-120,0,0,0,0,0,-104,0,-60,-60,0,-104,0,1200,0,-80,1200,-139,-139,1200,-80,-104,0,-60,-80,1200,-139,-60,0,-104,0,0,0,-60,0,-104,0,0,-120,0,1200,0,0,1200,-160,-80,1200,-139,-80,1200,-139,0,0,-120,-60,0,-104,0,0,0,0,0,-500,294,0,-405,0,100,0,323,100,-445,0,100,-550,0,100,-550,294,0,-405,0,0,-500,0,0,0,294,0,-405,476,0,-155,0,100,0,523,100,-170,323,100,-445,323,100,-445,476,0,-155,294,0,-405,0,0,0,476,0,-155,476,0,155,0,100,0,523,100,170,523,100,-170,523,100,-170,476,0,155,476,0,-155,0,0,0,476,0,155,294,0,405,0,100,0,323,100,445,523,100,170,523,100,170,294,0,405,476,0,155,0,0,0,294,0,405,0,0,500,0,100,0,0,100,550,323,100,445,323,100,445,0,0,500,294,0,405,0,0,0,0,0,500,-294,0,405,0,100,0,-323,100,445,0,100,550,0,100,550,-294,0,405,0,0,500,0,0,0,-294,0,405,-476,0,155,0,100,0,-523,100,170,-323,100,445,-323,100,445,-476,0,155,-294,0,405,0,0,0,-476,0,155,-476,0,-155,0,100,0,-523,100,-170,-523,100,170,-523,100,170,-476,0,-155,-476,0,155,0,0,0,-476,0,-155,-294,0,-405,0,100,0,-323,100,-445,-523,100,-170,-523,100,-170,-294,0,-405,-476,0,-155,0,0,0,-294,0,-405,0,0,-500,0,100,0,0,100,-550,-323,100,-445,-323,100,-445,0,0,-500,-294,0,-405,0,1200,-160,80,1200,-139,60,0,-104,60,0,-104,80,1200,-139,139,1200,-80,139,1200,-80,160,1200,0,120,0,0,160,1200,0,139,1200,80,104,0,60,104,0,60,139,1200,80,80,1200,139,80,1200,139,0,1200,160,0,0,120,0,1200,160,-80,1200,139,-60,0,104,-60,0,104,-80,1200,139,-139,1200,80,-139,1200,80,-160,1200,0,-120,0,0,-160,1200,0,-139,1200,-80,-104,0,-60,-104,0,-60,-139,1200,-80,-80,1200,-139,-80,1200,-139,0,1200,-160,0,0,-120,0,100,-550,323,100,-445,294,0,-405,323,100,-445,523,100,-170,476,0,-155,523,100,-170,523,100,170,476,0,155,523,100,170,323,100,445,294,0,405,323,100,445,0,100,550,0,0,500,0,100,550,-323,100,445,-294,0,405,-323,100,445,-523,100,170,-476,0,155,-523,100,170,-523,100,-170,-476,0,-155,-523,100,-170,-323,100,-445,-294,0,-405,-323,100,-445,0,100,-550,0,0,-500]},{"n":"panel","c":[0.11,0.17,0.32],"p":[0,0,0],"v":[-1600,853,926,-1600,1847,-926,-1600,1766,-965,-1600,1847,-926,1600,1766,-965,-1600,1766,-965,1600,1766,-965,1600,934,965,1600,853,926,1600,934,965,-1600,853,926,1600,853,926,1600,1766,-965,-1600,853,926,-1600,1766,-965,-1600,1847,-926,1600,934,965,1600,1847,-926,-1600,853,926,-1600,934,965,-1600,1847,-926,-1600,1847,-926,1600,1847,-926,1600,1766,-965,1600,1766,-965,1600,1847,-926,1600,934,965,1600,934,965,-1600,934,965,-1600,853,926,1600,1766,-965,1600,853,926,-1600,853,926,-1600,1847,-926,-1600,934,965,1600,934,965]},{"n":"frame","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[-1650,1808,-870,-1650,1752,-1030,-1650,1700,-922,-1650,1860,-978,1650,1752,-1030,-1650,1752,-1030,1650,1860,-978,1650,1700,-922,1650,1752,-1030,1650,1808,-870,-1650,1700,-922,1650,1700,-922,1650,1752,-1030,-1650,1700,-922,-1650,1752,-1030,-1650,1860,-978,1650,1808,-870,1650,1860,-978,-1650,958,1030,-1650,902,870,-1650,850,978,-1650,1010,922,1650,902,870,-1650,902,870,1650,902,870,1650,958,1030,1650,850,978,1650,958,1030,-1650,850,978,1650,850,978,1650,902,870,-1650,850,978,-1650,902,870,-1650,1010,922,1650,958,1030,1650,1010,922,-1650,1808,-870,-1650,1860,-978,-1650,1752,-1030,-1650,1860,-978,1650,1860,-978,1650,1752,-1030,1650,1860,-978,1650,1808,-870,1650,1700,-922,1650,1808,-870,-1650,1808,-870,-1650,1700,-922,1650,1752,-1030,1650,1700,-922,-1650,1700,-922,-1650,1860,-978,-1650,1808,-870,1650,1808,-870,-1650,958,1030,-1650,1010,922,-1650,902,870,-1650,1010,922,1650,1010,922,1650,902,870,1650,902,870,1650,1010,922,1650,958,1030,1650,958,1030,-1650,958,1030,-1650,850,978,1650,902,870,1650,850,978,-1650,850,978,-1650,1010,922,-1650,958,1030,1650,958,1030]}],"beacon":[{"n":"pole","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[0,0,0,0,0,-50,35,0,-35,0,2600,0,57,2600,-57,0,2600,-80,0,2600,-80,35,0,-35,0,0,-50,0,0,0,35,0,-35,50,0,0,0,2600,0,80,2600,0,57,2600,-57,57,2600,-57,50,0,0,35,0,-35,0,0,0,50,0,0,35,0,35,0,2600,0,57,2600,57,80,2600,0,80,2600,0,35,0,35,50,0,0,0,0,0,35,0,35,0,0,50,0,2600,0,0,2600,80,57,2600,57,57,2600,57,0,0,50,35,0,35,0,0,0,0,0,50,-35,0,35,0,2600,0,-57,2600,57,0,2600,80,0,2600,80,-35,0,35,0,0,50,0,0,0,-35,0,35,-50,0,0,0,2600,0,-80,2600,0,-57,2600,57,-57,2600,57,-50,0,0,-35,0,35,0,0,0,-50,0,0,-35,0,-35,0,2600,0,-57,2600,-57,-80,2600,0,-80,2600,0,-35,0,-35,-50,0,0,0,0,0,-35,0,-35,0,0,-50,0,2600,0,0,2600,-80,-57,2600,-57,-57,2600,-57,0,0,-50,-35,0,-35,0,0,0,0,0,-300,212,0,-212,0,120,0,255,120,-255,0,120,-360,0,120,-360,212,0,-212,0,0,-300,0,0,0,212,0,-212,300,0,0,0,120,0,360,120,0,255,120,-255,255,120,-255,300,0,0,212,0,-212,0,0,0,300,0,0,212,0,212,0,120,0,255,120,255,360,120,0,360,120,0,212,0,212,300,0,0,0,0,0,212,0,212,0,0,300,0,120,0,0,120,360,255,120,255,255,120,255,0,0,300,212,0,212,0,0,0,0,0,300,-212,0,212,0,120,0,-255,120,255,0,120,360,0,120,360,-212,0,212,0,0,300,0,0,0,-212,0,212,-300,0,0,0,120,0,-360,120,0,-255,120,255,-255,120,255,-300,0,0,-212,0,212,0,0,0,-300,0,0,-212,0,-212,0,120,0,-255,120,-255,-360,120,0,-360,120,0,-212,0,-212,-300,0,0,0,0,0,-212,0,-212,0,0,-300,0,120,0,0,120,-360,-255,120,-255,-255,120,-255,0,0,-300,-212,0,-212,60,56,0,60,56,-30,72,46,-26,640,744,0,655,731,-35,640,744,-40,640,744,-40,72,46,-26,60,56,-30,60,56,0,72,46,-26,80,39,-15,640,744,0,666,722,-20,655,731,-35,655,731,-35,80,39,-15,72,46,-26,60,56,0,80,39,-15,83,36,0,640,744,0,670,718,0,666,722,-20,80,39,-15,670,718,0,83,36,0,60,56,0,83,36,0,80,39,15,640,744,0,666,722,20,670,718,0,670,718,0,80,39,15,83,36,0,60,56,0,80,39,15,72,46,26,640,744,0,655,731,35,666,722,20,666,722,20,72,46,26,80,39,15,60,56,0,72,46,26,60,56,30,640,744,0,640,744,40,655,731,35,655,731,35,60,56,30,72,46,26,60,56,0,60,56,30,49,65,26,640,744,0,625,757,35,640,744,40,640,744,40,49,65,26,60,56,30,60,56,0,49,65,26,40,73,15,640,744,0,613,766,20,625,757,35,625,757,35,40,73,15,49,65,26,60,56,0,40,73,15,37,75,0,640,744,0,609,770,0,613,766,20,613,766,20,37,75,0,40,73,15,60,56,0,37,75,0,40,73,-15,640,744,0,613,766,-20,609,770,0,37,75,0,613,766,-20,40,73,-15,60,56,0,40,73,-15,49,65,-26,640,744,0,625,757,-35,613,766,-20,40,73,-15,625,757,-35,49,65,-26,60,56,0,49,65,-26,60,56,-30,640,744,0,640,744,-40,625,757,-35,625,757,-35,60,56,-30,49,65,-26,-175,56,-13,-175,36,-36,-160,39,-33,-175,744,-593,-155,722,-620,-175,718,-624,-175,718,-624,-160,39,-33,-175,36,-36,-175,56,-13,-160,39,-33,-149,46,-25,-175,744,-593,-140,731,-608,-155,722,-620,-155,722,-620,-149,46,-25,-160,39,-33,-175,56,-13,-149,46,-25,-145,56,-13,-175,744,-593,-135,744,-593,-140,731,-608,-140,731,-608,-145,56,-13,-149,46,-25,-175,56,-13,-145,56,-13,-149,65,-2,-175,744,-593,-140,757,-578,-135,744,-593,-145,56,-13,-140,757,-578,-149,65,-2,-175,56,-13,-149,65,-2,-160,73,7,-175,744,-593,-155,766,-567,-140,757,-578,-149,65,-2,-155,766,-567,-160,73,7,-175,56,-13,-160,73,7,-175,75,10,-175,744,-593,-175,770,-562,-155,766,-567,-160,73,7,-175,770,-562,-175,75,10,-175,56,-13,-175,75,10,-190,73,7,-175,744,-593,-195,766,-567,-175,770,-562,-175,75,10,-195,766,-567,-190,73,7,-175,56,-13,-190,73,7,-201,65,-2,-175,744,-593,-210,757,-578,-195,766,-567,-190,73,7,-210,757,-578,-201,65,-2,-175,56,-13,-201,65,-2,-205,56,-13,-175,744,-593,-215,744,-593,-210,757,-578,-210,757,-578,-205,56,-13,-201,65,-2,-175,56,-13,-205,56,-13,-201,46,-25,-175,744,-593,-210,731,-608,-215,744,-593,-205,56,-13,-210,731,-608,-201,46,-25,-175,56,-13,-201,46,-25,-190,39,-33,-175,744,-593,-195,722,-620,-210,731,-608,-210,731,-608,-190,39,-33,-201,46,-25,-175,56,-13,-190,39,-33,-175,36,-36,-175,744,-593,-175,718,-624,-195,722,-620,-195,722,-620,-175,36,-36,-190,39,-33,115,56,303,115,56,273,126,65,277,-465,744,303,-450,757,268,-465,744,263,115,56,273,-450,757,268,126,65,277,115,56,303,126,65,277,135,73,288,-465,744,303,-438,766,283,-450,757,268,-450,757,268,135,73,288,126,65,277,115,56,303,135,73,288,138,75,303,-465,744,303,-434,770,303,-438,766,283,-438,766,283,138,75,303,135,73,288,115,56,303,138,75,303,135,73,318,-465,744,303,-438,766,323,-434,770,303,-434,770,303,135,73,318,138,75,303,115,56,303,135,73,318,126,65,329,-465,744,303,-450,757,338,-438,766,323,-438,766,323,126,65,329,135,73,318,115,56,303,126,65,329,115,56,333,-465,744,303,-465,744,343,-450,757,338,126,65,329,-465,744,343,115,56,333,115,56,303,115,56,333,103,46,329,-465,744,303,-480,731,338,-465,744,343,-465,744,343,103,46,329,115,56,333,115,56,303,103,46,329,95,39,318,-465,744,303,-491,722,323,-480,731,338,103,46,329,-491,722,323,95,39,318,115,56,303,95,39,318,92,36,303,-465,744,303,-495,718,303,-491,722,323,95,39,318,-495,718,303,92,36,303,115,56,303,92,36,303,95,39,288,-465,744,303,-491,722,283,-495,718,303,92,36,303,-491,722,283,95,39,288,115,56,303,95,39,288,103,46,277,-465,744,303,-480,731,268,-491,722,283,95,39,288,-480,731,268,103,46,277,115,56,303,103,46,277,115,56,273,-465,744,303,-465,744,263,-480,731,268,103,46,277,-465,744,263,115,56,273,0,2600,-80,57,2600,-57,35,0,-35,57,2600,-57,80,2600,0,50,0,0,80,2600,0,57,2600,57,35,0,35,57,2600,57,0,2600,80,0,0,50,0,2600,80,-57,2600,57,-35,0,35,-57,2600,57,-80,2600,0,-50,0,0,-80,2600,0,-57,2600,-57,-35,0,-35,-57,2600,-57,0,2600,-80,0,0,-50,0,120,-360,255,120,-255,212,0,-212,255,120,-255,360,120,0,300,0,0,360,120,0,255,120,255,212,0,212,255,120,255,0,120,360,0,0,300,0,120,360,-255,120,255,-212,0,212,-255,120,255,-360,120,0,-300,0,0,-360,120,0,-255,120,-255,-212,0,-212,-255,120,-255,0,120,-360,0,0,-300,640,744,-40,655,731,-35,72,46,-26,655,731,-35,666,722,-20,80,39,-15,80,39,-15,666,722,-20,670,718,0,670,718,0,666,722,20,80,39,15,666,722,20,655,731,35,72,46,26,655,731,35,640,744,40,60,56,30,640,744,40,625,757,35,49,65,26,625,757,35,613,766,20,40,73,15,613,766,20,609,770,0,37,75,0,37,75,0,609,770,0,613,766,-20,40,73,-15,613,766,-20,625,757,-35,625,757,-35,640,744,-40,60,56,-30,-175,718,-624,-155,722,-620,-160,39,-33,-155,722,-620,-140,731,-608,-149,46,-25,-140,731,-608,-135,744,-593,-145,56,-13,-145,56,-13,-135,744,-593,-140,757,-578,-149,65,-2,-140,757,-578,-155,766,-567,-160,73,7,-155,766,-567,-175,770,-562,-175,75,10,-175,770,-562,-195,766,-567,-190,73,7,-195,766,-567,-210,757,-578,-210,757,-578,-215,744,-593,-205,56,-13,-205,56,-13,-215,744,-593,-210,731,-608,-210,731,-608,-195,722,-620,-190,39,-33,-195,722,-620,-175,718,-624,-175,36,-36,115,56,273,-465,744,263,-450,757,268,-450,757,268,-438,766,283,135,73,288,-438,766,283,-434,770,303,138,75,303,-434,770,303,-438,766,323,135,73,318,-438,766,323,-450,757,338,126,65,329,126,65,329,-450,757,338,-465,744,343,-465,744,343,-480,731,338,103,46,329,103,46,329,-480,731,338,-491,722,323,95,39,318,-491,722,323,-495,718,303,92,36,303,-495,718,303,-491,722,283,95,39,288,-491,722,283,-480,731,268,103,46,277,-480,731,268,-465,744,263]},{"n":"lamp","c":[0.2,0.7,0.9],"p":[0,0,0],"v":[0,2570,0,0,2594,-90,64,2594,-64,0,2750,-180,110,2660,-110,0,2660,-156,0,2840,-156,64,2906,-64,110,2840,-110,0,2660,-156,64,2594,-64,0,2594,-90,0,2840,-156,127,2750,-127,0,2750,-180,0,2906,-90,0,2930,0,64,2906,-64,110,2660,-110,90,2594,0,64,2594,-64,110,2840,-110,180,2750,0,127,2750,-127,64,2906,-64,0,2930,0,90,2906,0,0,2570,0,64,2594,-64,90,2594,0,127,2750,-127,156,2660,0,110,2660,-110,64,2906,-64,156,2840,0,110,2840,-110,156,2660,0,64,2594,64,90,2594,0,156,2840,0,127,2750,127,180,2750,0,90,2906,0,0,2930,0,64,2906,64,0,2570,0,90,2594,0,64,2594,64,180,2750,0,110,2660,110,156,2660,0,90,2906,0,110,2840,110,156,2840,0,110,2660,110,0,2594,90,64,2594,64,110,2840,110,0,2750,180,127,2750,127,64,2906,64,0,2930,0,0,2906,90,0,2570,0,64,2594,64,0,2594,90,127,2750,127,0,2660,156,110,2660,110,64,2906,64,0,2840,156,110,2840,110,0,2660,156,-64,2594,64,0,2594,90,0,2840,156,-127,2750,127,0,2750,180,0,2906,90,0,2930,0,-64,2906,64,0,2570,0,0,2594,90,-64,2594,64,0,2750,180,-110,2660,110,0,2660,156,0,2906,90,-110,2840,110,0,2840,156,-110,2840,110,-180,2750,0,-127,2750,127,-64,2906,64,0,2930,0,-90,2906,0,0,2570,0,-64,2594,64,-90,2594,0,-127,2750,127,-156,2660,0,-110,2660,110,-64,2906,64,-156,2840,0,-110,2840,110,-110,2660,110,-90,2594,0,-64,2594,64,-90,2906,0,0,2930,0,-64,2906,-64,0,2570,0,-90,2594,0,-64,2594,-64,-180,2750,0,-110,2660,-110,-156,2660,0,-90,2906,0,-110,2840,-110,-156,2840,0,-156,2660,0,-64,2594,-64,-90,2594,0,-156,2840,0,-127,2750,-127,-180,2750,0,0,2570,0,-64,2594,-64,0,2594,-90,-127,2750,-127,0,2660,-156,-110,2660,-110,-64,2906,-64,0,2840,-156,-110,2840,-110,-110,2660,-110,0,2594,-90,-64,2594,-64,-110,2840,-110,0,2750,-180,-127,2750,-127,-64,2906,-64,0,2930,0,0,2906,-90,0,2750,-180,127,2750,-127,110,2660,-110,0,2840,-156,0,2906,-90,64,2906,-64,0,2660,-156,110,2660,-110,64,2594,-64,0,2840,-156,110,2840,-110,127,2750,-127,110,2660,-110,156,2660,0,90,2594,0,110,2840,-110,156,2840,0,180,2750,0,127,2750,-127,180,2750,0,156,2660,0,64,2906,-64,90,2906,0,156,2840,0,156,2660,0,110,2660,110,64,2594,64,156,2840,0,110,2840,110,127,2750,127,180,2750,0,127,2750,127,110,2660,110,90,2906,0,64,2906,64,110,2840,110,110,2660,110,0,2660,156,0,2594,90,110,2840,110,0,2840,156,0,2750,180,127,2750,127,0,2750,180,0,2660,156,64,2906,64,0,2906,90,0,2840,156,0,2660,156,-110,2660,110,-64,2594,64,0,2840,156,-110,2840,110,-127,2750,127,0,2750,180,-127,2750,127,-110,2660,110,0,2906,90,-64,2906,64,-110,2840,110,-110,2840,110,-156,2840,0,-180,2750,0,-127,2750,127,-180,2750,0,-156,2660,0,-64,2906,64,-90,2906,0,-156,2840,0,-110,2660,110,-156,2660,0,-90,2594,0,-180,2750,0,-127,2750,-127,-110,2660,-110,-90,2906,0,-64,2906,-64,-110,2840,-110,-156,2660,0,-110,2660,-110,-64,2594,-64,-156,2840,0,-110,2840,-110,-127,2750,-127,-127,2750,-127,0,2750,-180,0,2660,-156,-64,2906,-64,0,2906,-90,0,2840,-156,-110,2660,-110,0,2660,-156,0,2594,-90,-110,2840,-110,0,2840,-156,0,2750,-180],"e":[0.1,0.5,0.8]},{"n":"fin","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[-250,2450,20,-250,1950,-20,-250,1950,20,-250,2450,-20,250,1950,-20,-250,1950,-20,250,2450,-20,250,1950,20,250,1950,-20,250,2450,20,-250,1950,20,250,1950,20,250,1950,-20,-250,1950,20,-250,1950,-20,-250,2450,-20,250,2450,20,250,2450,-20,-250,2450,20,-250,2450,-20,-250,1950,-20,-250,2450,-20,250,2450,-20,250,1950,-20,250,2450,-20,250,2450,20,250,1950,20,250,2450,20,-250,2450,20,-250,1950,20,250,1950,-20,250,1950,20,-250,1950,20,-250,2450,-20,-250,2450,20,250,2450,20]}],"o2cache":[{"n":"tank","c":[0.45,0.75,0.85],"p":[0,0,0],"v":[0,150,0,0,150,-420,210,150,-364,0,1350,0,210,1350,-364,0,1350,-420,0,1350,-420,210,150,-364,0,150,-420,0,150,0,210,150,-364,364,150,-210,0,1350,0,364,1350,-210,210,1350,-364,210,1350,-364,364,150,-210,210,150,-364,0,150,0,364,150,-210,420,150,0,0,1350,0,420,1350,0,364,1350,-210,364,1350,-210,420,150,0,364,150,-210,0,150,0,420,150,0,364,150,210,0,1350,0,364,1350,210,420,1350,0,420,1350,0,364,150,210,420,150,0,0,150,0,364,150,210,210,150,364,0,1350,0,210,1350,364,364,1350,210,364,1350,210,210,150,364,364,150,210,0,150,0,210,150,364,0,150,420,0,1350,0,0,1350,420,210,1350,364,210,1350,364,0,150,420,210,150,364,0,150,0,0,150,420,-210,150,364,0,1350,0,-210,1350,364,0,1350,420,0,1350,420,-210,150,364,0,150,420,0,150,0,-210,150,364,-364,150,210,0,1350,0,-364,1350,210,-210,1350,364,-210,1350,364,-364,150,210,-210,150,364,0,150,0,-364,150,210,-420,150,0,0,1350,0,-420,1350,0,-364,1350,210,-364,1350,210,-420,150,0,-364,150,210,0,150,0,-420,150,0,-364,150,-210,0,1350,0,-364,1350,-210,-420,1350,0,-420,1350,0,-364,150,-210,-420,150,0,0,150,0,-364,150,-210,-210,150,-364,0,1350,0,-210,1350,-364,-364,1350,-210,-364,1350,-210,-210,150,-364,-364,150,-210,0,150,0,-210,150,-364,0,150,-420,0,1350,0,0,1350,-420,-210,1350,-364,-210,1350,-364,0,150,-420,-210,150,-364,0,930,0,0,986,-210,105,986,-182,0,1350,-420,182,1140,-315,0,1140,-364,0,1714,-210,182,1560,-315,0,1560,-364,0,1140,-364,105,986,-182,0,986,-210,0,1560,-364,210,1350,-364,0,1350,-420,0,1714,-210,0,1770,0,105,1714,-182,210,1350,-364,315,1140,-182,182,1140,-315,105,1714,-182,315,1560,-182,182,1560,-315,182,1140,-315,182,986,-105,105,986,-182,210,1350,-364,315,1560,-182,364,1350,-210,105,1714,-182,0,1770,0,182,1714,-105,0,930,0,105,986,-182,182,986,-105,182,1714,-105,364,1560,0,315,1560,-182,182,986,-105,364,1140,0,210,986,0,315,1560,-182,420,1350,0,364,1350,-210,182,1714,-105,0,1770,0,210,1714,0,0,930,0,182,986,-105,210,986,0,364,1350,-210,364,1140,0,315,1140,-182,364,1140,0,182,986,105,210,986,0,364,1560,0,364,1350,210,420,1350,0,210,1714,0,0,1770,0,182,1714,105,0,930,0,210,986,0,182,986,105,420,1350,0,315,1140,182,364,1140,0,210,1714,0,315,1560,182,364,1560,0,182,986,105,182,1140,315,105,986,182,315,1560,182,210,1350,364,364,1350,210,182,1714,105,0,1770,0,105,1714,182,0,930,0,182,986,105,105,986,182,364,1350,210,182,1140,315,315,1140,182,315,1560,182,105,1714,182,182,1560,315,105,986,182,0,1140,364,0,986,210,182,1560,315,0,1350,420,210,1350,364,105,1714,182,0,1770,0,0,1714,210,0,930,0,105,986,182,0,986,210,210,1350,364,0,1140,364,182,1140,315,105,1714,182,0,1560,364,182,1560,315,0,1140,364,-105,986,182,0,986,210,0,1560,364,-210,1350,364,0,1350,420,0,1714,210,0,1770,0,-105,1714,182,0,930,0,0,986,210,-105,986,182,0,1350,420,-182,1140,315,0,1140,364,0,1560,364,-105,1714,182,-182,1560,315,-182,1560,315,-364,1350,210,-210,1350,364,-105,1714,182,0,1770,0,-182,1714,105,0,930,0,-105,986,182,-182,986,105,-210,1350,364,-315,1140,182,-182,1140,315,-182,1560,315,-182,1714,105,-315,1560,182,-182,1140,315,-182,986,105,-105,986,182,-182,1714,105,0,1770,0,-210,1714,0,0,930,0,-182,986,105,-210,986,0,-315,1140,182,-420,1350,0,-364,1140,0,-182,1714,105,-364,1560,0,-315,1560,182,-315,1140,182,-210,986,0,-182,986,105,-315,1560,182,-420,1350,0,-364,1350,210,0,930,0,-210,986,0,-182,986,-105,-364,1140,0,-364,1350,-210,-315,1140,-182,-364,1560,0,-182,1714,-105,-315,1560,-182,-364,1140,0,-182,986,-105,-210,986,0,-364,1560,0,-364,1350,-210,-420,1350,0,-210,1714,0,0,1770,0,-182,1714,-105,0,930,0,-182,986,-105,-105,986,-182,-315,1140,-182,-210,1350,-364,-182,1140,-315,-315,1560,-182,-105,1714,-182,-182,1560,-315,-315,1140,-182,-105,986,-182,-182,986,-105,-315,1560,-182,-210,1350,-364,-364,1350,-210,-182,1714,-105,0,1770,0,-105,1714,-182,0,930,0,-105,986,-182,0,986,-210,-182,1140,-315,0,1350,-420,0,1140,-364,-105,1714,-182,0,1560,-364,-182,1560,-315,-182,1140,-315,0,986,-210,-105,986,-182,-210,1350,-364,0,1560,-364,0,1350,-420,-105,1714,-182,0,1770,0,0,1714,-210,0,1350,-420,210,1350,-364,210,150,-364,210,1350,-364,364,1350,-210,364,150,-210,364,1350,-210,420,1350,0,420,150,0,420,1350,0,364,1350,210,364,150,210,364,1350,210,210,1350,364,210,150,364,210,1350,364,0,1350,420,0,150,420,0,1350,420,-210,1350,364,-210,150,364,-210,1350,364,-364,1350,210,-364,150,210,-364,1350,210,-420,1350,0,-420,150,0,-420,1350,0,-364,1350,-210,-364,150,-210,-364,1350,-210,-210,1350,-364,-210,150,-364,-210,1350,-364,0,1350,-420,0,150,-420,0,1350,-420,210,1350,-364,182,1140,-315,0,1714,-210,105,1714,-182,182,1560,-315,0,1140,-364,182,1140,-315,105,986,-182,0,1560,-364,182,1560,-315,210,1350,-364,210,1350,-364,364,1350,-210,315,1140,-182,105,1714,-182,182,1714,-105,315,1560,-182,182,1140,-315,315,1140,-182,182,986,-105,210,1350,-364,182,1560,-315,315,1560,-182,182,1714,-105,210,1714,0,364,1560,0,182,986,-105,315,1140,-182,364,1140,0,315,1560,-182,364,1560,0,420,1350,0,364,1350,-210,420,1350,0,364,1140,0,364,1140,0,315,1140,182,182,986,105,364,1560,0,315,1560,182,364,1350,210,420,1350,0,364,1350,210,315,1140,182,210,1714,0,182,1714,105,315,1560,182,182,986,105,315,1140,182,182,1140,315,315,1560,182,182,1560,315,210,1350,364,364,1350,210,210,1350,364,182,1140,315,315,1560,182,182,1714,105,105,1714,182,105,986,182,182,1140,315,0,1140,364,182,1560,315,0,1560,364,0,1350,420,210,1350,364,0,1350,420,0,1140,364,105,1714,182,0,1714,210,0,1560,364,0,1140,364,-182,1140,315,-105,986,182,0,1560,364,-182,1560,315,-210,1350,364,0,1350,420,-210,1350,364,-182,1140,315,0,1560,364,0,1714,210,-105,1714,182,-182,1560,315,-315,1560,182,-364,1350,210,-210,1350,364,-364,1350,210,-315,1140,182,-182,1560,315,-105,1714,182,-182,1714,105,-182,1140,315,-315,1140,182,-182,986,105,-315,1140,182,-364,1350,210,-420,1350,0,-182,1714,105,-210,1714,0,-364,1560,0,-315,1140,182,-364,1140,0,-210,986,0,-315,1560,182,-364,1560,0,-420,1350,0,-364,1140,0,-420,1350,0,-364,1350,-210,-364,1560,0,-210,1714,0,-182,1714,-105,-364,1140,0,-315,1140,-182,-182,986,-105,-364,1560,0,-315,1560,-182,-364,1350,-210,-315,1140,-182,-364,1350,-210,-210,1350,-364,-315,1560,-182,-182,1714,-105,-105,1714,-182,-315,1140,-182,-182,1140,-315,-105,986,-182,-315,1560,-182,-182,1560,-315,-210,1350,-364,-182,1140,-315,-210,1350,-364,0,1350,-420,-105,1714,-182,0,1714,-210,0,1560,-364,-182,1140,-315,0,1140,-364,0,986,-210,-210,1350,-364,-182,1560,-315,0,1560,-364]},{"n":"base","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[-550,300,550,-550,0,-550,-550,0,550,-550,300,-550,550,0,-550,-550,0,-550,550,300,-550,550,0,550,550,0,-550,550,300,550,-550,0,550,550,0,550,550,0,-550,-550,0,550,-550,0,-550,-550,300,-550,550,300,550,550,300,-550,300,1595,-396,300,1642,-433,330,1635,-428,300,1905,-4,330,1946,-36,300,1952,-41,300,1952,-41,330,1635,-428,300,1642,-433,300,1595,-396,330,1635,-428,352,1618,-414,300,1905,-4,352,1929,-23,330,1946,-36,330,1946,-36,352,1618,-414,330,1635,-428,300,1595,-396,352,1618,-414,360,1595,-396,300,1905,-4,360,1905,-4,352,1929,-23,352,1929,-23,360,1595,-396,352,1618,-414,300,1595,-396,360,1595,-396,352,1571,-377,300,1905,-4,352,1882,14,360,1905,-4,360,1595,-396,352,1882,14,352,1571,-377,300,1595,-396,352,1571,-377,330,1554,-364,300,1905,-4,330,1865,28,352,1882,14,352,1882,14,330,1554,-364,352,1571,-377,300,1595,-396,330,1554,-364,300,1548,-359,300,1905,-4,300,1858,33,330,1865,28,330,1554,-364,300,1858,33,300,1548,-359,300,1595,-396,300,1548,-359,270,1554,-364,300,1905,-4,270,1865,28,300,1858,33,300,1858,33,270,1554,-364,300,1548,-359,300,1595,-396,270,1554,-364,248,1571,-377,300,1905,-4,248,1882,14,270,1865,28,270,1865,28,248,1571,-377,270,1554,-364,300,1595,-396,248,1571,-377,240,1595,-396,300,1905,-4,240,1905,-4,248,1882,14,248,1882,14,240,1595,-396,248,1571,-377,300,1595,-396,240,1595,-396,248,1618,-414,300,1905,-4,248,1929,-23,240,1905,-4,240,1905,-4,248,1618,-414,240,1595,-396,300,1595,-396,248,1618,-414,270,1635,-428,300,1905,-4,270,1946,-36,248,1929,-23,248,1618,-414,270,1946,-36,270,1635,-428,300,1595,-396,270,1635,-428,300,1642,-433,300,1905,-4,300,1952,-41,270,1946,-36,270,1635,-428,300,1952,-41,300,1642,-433,-550,300,550,-550,300,-550,-550,0,-550,-550,300,-550,550,300,-550,550,0,-550,550,300,-550,550,300,550,550,0,550,550,300,550,-550,300,550,-550,0,550,550,0,-550,550,0,550,-550,0,550,-550,300,-550,-550,300,550,550,300,550,300,1952,-41,330,1946,-36,330,1635,-428,330,1946,-36,352,1929,-23,352,1618,-414,352,1929,-23,360,1905,-4,360,1595,-396,360,1595,-396,360,1905,-4,352,1882,14,352,1882,14,330,1865,28,330,1554,-364,330,1554,-364,330,1865,28,300,1858,33,300,1858,33,270,1865,28,270,1554,-364,270,1865,28,248,1882,14,248,1571,-377,248,1882,14,240,1905,-4,240,1595,-396,240,1905,-4,248,1929,-23,248,1618,-414,248,1618,-414,248,1929,-23,270,1946,-36,270,1635,-428,270,1946,-36,300,1952,-41]},{"n":"valve","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[0,1760,0,0,1760,-120,85,1760,-85,0,1940,0,85,1940,-85,0,1940,-120,0,1940,-120,85,1760,-85,0,1760,-120,0,1760,0,85,1760,-85,120,1760,0,0,1940,0,120,1940,0,85,1940,-85,85,1940,-85,120,1760,0,85,1760,-85,0,1760,0,120,1760,0,85,1760,85,0,1940,0,85,1940,85,120,1940,0,120,1940,0,85,1760,85,120,1760,0,0,1760,0,85,1760,85,0,1760,120,0,1940,0,0,1940,120,85,1940,85,85,1940,85,0,1760,120,85,1760,85,0,1760,0,0,1760,120,-85,1760,85,0,1940,0,-85,1940,85,0,1940,120,0,1940,120,-85,1760,85,0,1760,120,0,1760,0,-85,1760,85,-120,1760,0,0,1940,0,-120,1940,0,-85,1940,85,-85,1940,85,-120,1760,0,-85,1760,85,0,1760,0,-120,1760,0,-85,1760,-85,0,1940,0,-85,1940,-85,-120,1940,0,-120,1940,0,-85,1760,-85,-120,1760,0,0,1760,0,-85,1760,-85,0,1760,-120,0,1940,0,0,1940,-120,-85,1940,-85,-85,1940,-85,0,1760,-120,-85,1760,-85,0,1940,-120,85,1940,-85,85,1760,-85,85,1940,-85,120,1940,0,120,1760,0,120,1940,0,85,1940,85,85,1760,85,85,1940,85,0,1940,120,0,1760,120,0,1940,120,-85,1940,85,-85,1760,85,-85,1940,85,-120,1940,0,-120,1760,0,-120,1940,0,-85,1940,-85,-85,1760,-85,-85,1940,-85,0,1940,-120,0,1760,-120]}],"supplyPod":[{"n":"shell","c":[0.75,0.42,0.18],"p":[0,0,0],"v":[0,100,0,0,100,-850,500,100,-688,0,1800,0,676,1800,-930,0,1800,-1150,0,1800,-1150,500,100,-688,0,100,-850,0,100,0,500,100,-688,808,100,-263,0,1800,0,1094,1800,-355,676,1800,-930,676,1800,-930,808,100,-263,500,100,-688,0,100,0,808,100,-263,808,100,263,0,1800,0,1094,1800,355,1094,1800,-355,1094,1800,-355,808,100,263,808,100,-263,0,100,0,808,100,263,500,100,688,0,1800,0,676,1800,930,1094,1800,355,1094,1800,355,500,100,688,808,100,263,0,100,0,500,100,688,0,100,850,0,1800,0,0,1800,1150,676,1800,930,676,1800,930,0,100,850,500,100,688,0,100,0,0,100,850,-500,100,688,0,1800,0,-676,1800,930,0,1800,1150,0,1800,1150,-500,100,688,0,100,850,0,100,0,-500,100,688,-808,100,263,0,1800,0,-1094,1800,355,-676,1800,930,-676,1800,930,-808,100,263,-500,100,688,0,100,0,-808,100,263,-808,100,-263,0,1800,0,-1094,1800,-355,-1094,1800,355,-1094,1800,355,-808,100,-263,-808,100,263,0,100,0,-808,100,-263,-500,100,-688,0,1800,0,-676,1800,-930,-1094,1800,-355,-1094,1800,-355,-500,100,-688,-808,100,-263,0,100,0,-500,100,-688,0,100,-850,0,1800,0,0,1800,-1150,-676,1800,-930,-676,1800,-930,0,100,-850,-500,100,-688,0,1800,-1150,676,1800,-930,500,100,-688,676,1800,-930,1094,1800,-355,808,100,-263,1094,1800,-355,1094,1800,355,808,100,263,1094,1800,355,676,1800,930,500,100,688,676,1800,930,0,1800,1150,0,100,850,0,1800,1150,-676,1800,930,-500,100,688,-676,1800,930,-1094,1800,355,-808,100,263,-1094,1800,355,-1094,1800,-355,-808,100,-263,-1094,1800,-355,-676,1800,-930,-500,100,-688,-676,1800,-930,0,1800,-1150,0,100,-850]},{"n":"lid","c":[0.85,0.82,0.75],"p":[0,0,0],"v":[0,1800,0,0,1800,-850,500,1800,-688,0,2400,0,118,2400,-162,0,2400,-200,0,2400,-200,500,1800,-688,0,1800,-850,0,1800,0,500,1800,-688,808,1800,-263,0,2400,0,190,2400,-62,118,2400,-162,118,2400,-162,808,1800,-263,500,1800,-688,0,1800,0,808,1800,-263,808,1800,263,0,2400,0,190,2400,62,190,2400,-62,190,2400,-62,808,1800,263,808,1800,-263,0,1800,0,808,1800,263,500,1800,688,0,2400,0,118,2400,162,190,2400,62,190,2400,62,500,1800,688,808,1800,263,0,1800,0,500,1800,688,0,1800,850,0,2400,0,0,2400,200,118,2400,162,118,2400,162,0,1800,850,500,1800,688,0,1800,0,0,1800,850,-500,1800,688,0,2400,0,-118,2400,162,0,2400,200,0,2400,200,-500,1800,688,0,1800,850,0,1800,0,-500,1800,688,-808,1800,263,0,2400,0,-190,2400,62,-118,2400,162,-118,2400,162,-808,1800,263,-500,1800,688,0,1800,0,-808,1800,263,-808,1800,-263,0,2400,0,-190,2400,-62,-190,2400,62,-190,2400,62,-808,1800,-263,-808,1800,263,0,1800,0,-808,1800,-263,-500,1800,-688,0,2400,0,-118,2400,-162,-190,2400,-62,-190,2400,-62,-500,1800,-688,-808,1800,-263,0,1800,0,-500,1800,-688,0,1800,-850,0,2400,0,0,2400,-200,-118,2400,-162,-118,2400,-162,0,1800,-850,-500,1800,-688,0,2400,-200,118,2400,-162,500,1800,-688,118,2400,-162,190,2400,-62,808,1800,-263,190,2400,-62,190,2400,62,808,1800,263,190,2400,62,118,2400,162,500,1800,688,118,2400,162,0,2400,200,0,1800,850,0,2400,200,-118,2400,162,-500,1800,688,-118,2400,162,-190,2400,62,-808,1800,263,-190,2400,62,-190,2400,-62,-808,1800,-263,-190,2400,-62,-118,2400,-162,-500,1800,-688,-118,2400,-162,0,2400,-200,0,1800,-850]},{"n":"chute","c":[0.78,0.75,0.68],"p":[0,0,0],"v":[168,784,450,140,731,-1250,140,731,450,140,731,-1250,1660,-31,-1250,1632,-84,-1250,1660,-31,-1250,1632,-84,450,1632,-84,-1250,1660,-31,450,140,731,450,1632,-84,450,1632,-84,-1250,140,731,450,140,731,-1250,168,784,-1250,1660,-31,450,1660,-31,-1250,168,784,450,168,784,-1250,140,731,-1250,140,731,-1250,168,784,-1250,1660,-31,-1250,1660,-31,-1250,1660,-31,450,1632,-84,450,1660,-31,450,168,784,450,140,731,450,1632,-84,-1250,1632,-84,450,140,731,450,168,784,-1250,168,784,450,1660,-31,450]},{"n":"band","c":[0.28,0.29,0.31],"p":[0,0,0],"v":[0,400,0,0,400,-1170,688,400,-947,0,600,0,688,600,-947,0,600,-1170,0,600,-1170,688,400,-947,0,400,-1170,0,400,0,688,400,-947,1113,400,-362,0,600,0,1113,600,-362,688,600,-947,688,600,-947,1113,400,-362,688,400,-947,0,400,0,1113,400,-362,1113,400,362,0,600,0,1113,600,362,1113,600,-362,1113,600,-362,1113,400,362,1113,400,-362,0,400,0,1113,400,362,688,400,947,0,600,0,688,600,947,1113,600,362,1113,600,362,688,400,947,1113,400,362,0,400,0,688,400,947,0,400,1170,0,600,0,0,600,1170,688,600,947,688,600,947,0,400,1170,688,400,947,0,400,0,0,400,1170,-688,400,947,0,600,0,-688,600,947,0,600,1170,0,600,1170,-688,400,947,0,400,1170,0,400,0,-688,400,947,-1113,400,362,0,600,0,-1113,600,362,-688,600,947,-688,600,947,-1113,400,362,-688,400,947,0,400,0,-1113,400,362,-1113,400,-362,0,600,0,-1113,600,-362,-1113,600,362,-1113,600,362,-1113,400,-362,-1113,400,362,0,400,0,-1113,400,-362,-688,400,-947,0,600,0,-688,600,-947,-1113,600,-362,-1113,600,-362,-688,400,-947,-1113,400,-362,0,400,0,-688,400,-947,0,400,-1170,0,600,0,0,600,-1170,-688,600,-947,-688,600,-947,0,400,-1170,-688,400,-947,0,600,-1170,688,600,-947,688,400,-947,688,600,-947,1113,600,-362,1113,400,-362,1113,600,-362,1113,600,362,1113,400,362,1113,600,362,688,600,947,688,400,947,688,600,947,0,600,1170,0,400,1170,0,600,1170,-688,600,947,-688,400,947,-688,600,947,-1113,600,362,-1113,400,362,-1113,600,362,-1113,600,-362,-1113,400,-362,-1113,600,-362,-688,600,-947,-688,400,-947,-688,600,-947,0,600,-1170,0,400,-1170]}],"rtgUnit":[{"n":"core","c":[0.28,0.29,0.31],"p":[0,0,0],"v":[0,400,-500,0,720,-500,226,626,-500,0,400,500,226,626,500,0,720,500,0,720,500,226,626,-500,0,720,-500,0,400,-500,226,626,-500,320,400,-500,0,400,500,320,400,500,226,626,500,226,626,-500,320,400,500,320,400,-500,0,400,-500,320,400,-500,226,174,-500,0,400,500,226,174,500,320,400,500,320,400,-500,226,174,500,226,174,-500,0,400,-500,226,174,-500,0,80,-500,0,400,500,0,80,500,226,174,500,226,174,-500,0,80,500,0,80,-500,0,400,-500,0,80,-500,-226,174,-500,0,400,500,-226,174,500,0,80,500,0,80,500,-226,174,-500,0,80,-500,0,400,-500,-226,174,-500,-320,400,-500,0,400,500,-320,400,500,-226,174,500,-226,174,500,-320,400,-500,-226,174,-500,0,400,-500,-320,400,-500,-226,626,-500,0,400,500,-226,626,500,-320,400,500,-320,400,500,-226,626,-500,-320,400,-500,0,400,-500,-226,626,-500,0,720,-500,0,400,500,0,720,500,-226,626,500,-226,626,500,0,720,-500,-226,626,-500,0,720,500,226,626,500,226,626,-500,226,626,-500,226,626,500,320,400,500,320,400,-500,320,400,500,226,174,500,226,174,-500,226,174,500,0,80,500,0,80,500,-226,174,500,-226,174,-500,-226,174,500,-320,400,500,-320,400,-500,-320,400,500,-226,626,500,-226,626,-500,-226,626,500,0,720,500,0,720,-500]},{"n":"fins","c":[0.52,0.54,0.56],"p":[0,0,0],"v":[100,420,450,100,380,-450,100,380,450,100,420,-450,600,380,-450,100,380,-450,600,420,-450,600,380,450,600,380,-450,600,420,450,100,380,450,600,380,450,600,380,-450,100,380,450,100,380,-450,100,420,-450,600,420,450,600,420,-450,67,930,450,33,910,-450,33,910,450,67,930,-450,283,477,-450,33,910,-450,317,497,-450,283,477,450,283,477,-450,317,497,450,33,910,450,283,477,450,283,477,-450,33,910,450,33,910,-450,67,930,-450,317,497,450,317,497,-450,-33,910,450,-67,930,-450,-67,930,450,-67,930,-450,-283,477,-450,-317,497,-450,-283,477,-450,-317,497,450,-317,497,-450,-317,497,450,-33,910,450,-67,930,450,-317,497,-450,-67,930,450,-67,930,-450,-33,910,-450,-283,477,450,-283,477,-450,-100,380,450,-100,420,-450,-100,420,450,-100,380,-450,-600,420,-450,-100,420,-450,-600,380,-450,-600,420,450,-600,420,-450,-600,380,450,-100,420,450,-600,420,450,-600,420,-450,-100,420,450,-100,420,-450,-100,380,-450,-600,380,450,-600,380,-450,-67,-130,450,-33,-110,-450,-33,-110,450,-67,-130,-450,-283,323,-450,-33,-110,-450,-317,303,-450,-283,323,450,-283,323,-450,-283,323,450,-67,-130,450,-33,-110,450,-283,323,-450,-33,-110,450,-33,-110,-450,-67,-130,-450,-317,303,450,-317,303,-450,33,-110,450,67,-130,-450,67,-130,450,67,-130,-450,283,323,-450,317,303,-450,283,323,-450,317,303,450,317,303,-450,283,323,450,67,-130,450,317,303,450,317,303,-450,67,-130,450,67,-130,-450,33,-110,-450,283,323,450,283,323,-450,100,420,450,100,420,-450,100,380,-450,100,420,-450,600,420,-450,600,380,-450,600,420,-450,600,420,450,600,380,450,600,420,450,100,420,450,100,380,450,600,380,-450,600,380,450,100,380,450,100,420,-450,100,420,450,600,420,450,67,930,450,67,930,-450,33,910,-450,67,930,-450,317,497,-450,283,477,-450,317,497,-450,317,497,450,283,477,450,317,497,450,67,930,450,33,910,450,283,477,-450,283,477,450,33,910,450,67,930,-450,67,930,450,317,497,450,-33,910,450,-33,910,-450,-67,930,-450,-67,930,-450,-33,910,-450,-283,477,-450,-283,477,-450,-283,477,450,-317,497,450,-317,497,450,-283,477,450,-33,910,450,-317,497,-450,-317,497,450,-67,930,450,-33,910,-450,-33,910,450,-283,477,450,-100,380,450,-100,380,-450,-100,420,-450,-100,380,-450,-600,380,-450,-600,420,-450,-600,380,-450,-600,380,450,-600,420,450,-600,380,450,-100,380,450,-100,420,450,-600,420,-450,-600,420,450,-100,420,450,-100,380,-450,-100,380,450,-600,380,450,-67,-130,450,-67,-130,-450,-33,-110,-450,-67,-130,-450,-317,303,-450,-283,323,-450,-317,303,-450,-317,303,450,-283,323,450,-283,323,450,-317,303,450,-67,-130,450,-283,323,-450,-283,323,450,-33,-110,450,-67,-130,-450,-67,-130,450,-317,303,450,33,-110,450,33,-110,-450,67,-130,-450,67,-130,-450,33,-110,-450,283,323,-450,283,323,-450,283,323,450,317,303,450,283,323,450,33,-110,450,67,-130,450,317,303,-450,317,303,450,67,-130,450,33,-110,-450,33,-110,450,283,323,450]},{"n":"warn","c":[0.62,0.16,0.1],"p":[0,0,0],"v":[-200,450,-340,-200,350,-760,-200,350,-340,-200,450,-760,200,350,-760,-200,350,-760,200,450,-760,200,350,-340,200,350,-760,200,450,-340,-200,350,-340,200,350,-340,200,350,-760,-200,350,-340,-200,350,-760,-200,450,-760,200,450,-340,200,450,-760,-200,450,-340,-200,450,-760,-200,350,-760,-200,450,-760,200,450,-760,200,350,-760,200,450,-760,200,450,-340,200,350,-340,200,450,-340,-200,450,-340,-200,350,-340,200,350,-760,200,350,-340,-200,350,-340,-200,450,-760,-200,450,-340,200,450,-340],"e":[0.5,0.12,0.06]}]};
function buildModel(name, scale) {
  const g = new THREE.Group();
  for (const p of MODELS_DATA[name]) {
    const geo = new THREE.BufferGeometry();
    const v = new Float32Array(p.v.length);
    for (let i = 0; i < p.v.length; i++) v[i] = p.v[i] / 1000;
    geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(p.c[0], p.c[1], p.c[2]), side: THREE.DoubleSide });
    if (p.o !== undefined) { mat.transparent = true; mat.opacity = p.o; }
    if (p.e) mat.emissive = new THREE.Color(p.e[0], p.e[1], p.e[2]);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p.p[0] / 1000, p.p[1] / 1000, p.p[2] / 1000);
    m.name = p.n;
    g.add(m);
  }
  // Blender -Y "forward" exports to three +Z; spin the whole model so it faces -Z
  g.rotation.y = Math.PI;
  if (scale) g.scale.setScalar(scale);
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.getPart = (n) => g.getObjectByName(n);
  return wrap;
}

// ============================================================
// 4. THE PLANET — real Mars, analytically modeled
// ============================================================
// Scale: R world-meters represent Mars' 3389.5 km mean radius (≈1:282).
// Vertical relief is exaggerated so the geography reads at game scale.
const R = 12000;                     // planet radius in world meters
const MARS_KM = 3389.5;
const KM = R / MARS_KM;              // world meters per real km (≈3.54)
const VSCALE = 6;                    // vertical exaggeration
const HKM = KM * VSCALE;             // world meters per real km of relief (≈21.2)

const d2r = Math.PI / 180;
function llToVec(latDeg, lonDegE, out) {
  const p = latDeg * d2r, l = lonDegE * d2r;
  out = out || new THREE.Vector3();
  out.set(Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l));
  return out;
}
function vecToLl(v) {
  return { lat: Math.asin(clamp(v.y, -1, 1)) / d2r, lon: ((Math.atan2(-v.z, v.x) / d2r) + 360) % 360 };
}
// angular distance (radians) between unit vectors via chord length — fast, exact enough
function angDist(ax, ay, az, bx, by, bz) {
  const dx = ax - bx, dy = ay - by, dz = az - bz;
  const chord = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return 2 * Math.asin(clamp(chord / 2, 0, 1));
}

/*
 * Real Mars features. lat, lonE in degrees; r = footprint radius km; h = relief km (+up/-down).
 * type: volcano | crater | basin | bulge | cap | plain(label) | albedo
 * Coordinates from published planetary data (MOLA-era), good to ~1°.
 */
const FEATURES = [
  // The Tharsis bulge — continent-sized volcanic rise
  { name: 'Tharsis Rise', lat: 2, lon: 247, r: 2600, h: 5.5, type: 'bulge' },
  // Volcanoes
  { name: 'Olympus Mons', lat: 18.65, lon: 226.2, r: 310, h: 21.9, type: 'volcano', cal: 0.09,
    note: 'Tallest volcano in the solar system. The slopes are so gentle you could not see the summit from the base — the planet curves away first.' },
  { name: 'Ascraeus Mons', lat: 11.92, lon: 255.92, r: 220, h: 14.9, type: 'volcano', cal: 0.1,
    note: 'Northernmost of the Tharsis Montes. Its name means "rustic" — for a mountain twice the height of Everest.' },
  { name: 'Pavonis Mons', lat: 1.48, lon: 247.04, r: 190, h: 8.4, type: 'volcano', cal: 0.12,
    note: 'Sits almost exactly on the equator. A space elevator dream site, if Mars ever files the permits.' },
  { name: 'Arsia Mons', lat: -8.35, lon: 239.91, r: 220, h: 11.7, type: 'volcano', cal: 0.16,
    note: 'Has a caldera you could drop a small country into, and cave skylights along its flanks.' },
  { name: 'Alba Mons', lat: 40.5, lon: 250.4, r: 600, h: 6.8, type: 'volcano', cal: 0.07,
    note: 'The biggest volcano by area anywhere — a pancake 1000+ km across that you could drive over without noticing the summit.' },
  { name: 'Elysium Mons', lat: 25.02, lon: 147.21, r: 210, h: 14.1, type: 'volcano', cal: 0.09,
    note: 'The lonely giant of the eastern hemisphere, far from the Tharsis crowd.' },
  { name: 'Hecates Tholus', lat: 32.12, lon: 150.24, r: 90, h: 4.8, type: 'volcano', cal: 0.12,
    note: 'Small by Mars standards. Merely enormous by Earth standards.' },
  // Impact basins
  { name: 'Hellas Planitia', lat: -42.4, lon: 70.5, r: 1050, h: -7.2, type: 'basin',
    note: 'Deepest hole on Mars — the air at the bottom is thick enough that liquid water could briefly survive. Briefly.' },
  { name: 'Argyre Planitia', lat: -49.7, lon: 316, r: 450, h: -5.2, type: 'basin',
    note: 'An ancient impact scar ringed by mountains. Named for a mythical island of silver.' },
  { name: 'Isidis Planitia', lat: 12.9, lon: 87, r: 380, h: -3.7, type: 'basin',
    note: 'Third-largest impact basin. Beagle 2 sleeps here, half-opened, like a stood-up date.' },
  { name: 'Utopia Planitia', lat: 46.7, lon: 117.5, r: 830, h: -4.1, type: 'basin',
    note: 'Largest recognized impact basin in the solar system. Also where Starfleet will someday build ships, allegedly.' },
  // Major craters
  { name: 'Gale Crater', lat: -5.4, lon: 137.8, r: 77, h: -3.8, type: 'crater', peak: 2.8,
    note: 'Home of Mount Sharp and one very hardworking nuclear-powered robot geologist.' },
  { name: 'Jezero Crater', lat: 18.44, lon: 77.45, r: 24, h: -2.5, type: 'crater',
    note: 'An ancient river delta. Perseverance is here, caching rocks and minding a helicopter.' },
  { name: 'Gusev Crater', lat: -14.57, lon: 175.48, r: 83, h: -1.9, type: 'crater',
    note: 'Spirit\'s home. She drove backwards for years, dragging a bad wheel, and found ancient hot springs doing it.' },
  { name: 'Schiaparelli Crater', lat: -2.71, lon: 16.77, r: 230, h: -2.2, type: 'crater',
    note: 'Named for the astronomer whose "canali" got mistranslated into canals and a century of Martian fever dreams.' },
  { name: 'Huygens Crater', lat: -13.88, lon: 55.58, r: 234, h: -2.5, type: 'crater',
    note: 'The largest well-preserved crater on Mars, sitting on some of the oldest crust anywhere.' },
  { name: 'Cassini Crater', lat: 23.82, lon: 32.12, r: 205, h: -1.8, type: 'crater',
    note: 'A vast, soft-shouldered ruin in Arabia Terra. Old enough to have forgotten its own impact.' },
  { name: 'Lyot Crater', lat: 50.47, lon: 29.32, r: 110, h: -3.0, type: 'crater',
    note: 'The deepest point in the northern hemisphere. Bring a flashlight and a coat.' },
  { name: 'Korolev Crater', lat: 72.77, lon: 164.58, r: 41, h: -2.0, type: 'crater', ice: true,
    note: 'Permanently full of water ice, 1800 cubic kilometers of it — a frozen lake the size of a small sea.' },
  // Valles Marineris — the grand canyon system, as named segments
  { name: 'Noctis Labyrinthus', lat: -6.9, lon: 261, r: 120, h: -4.5, type: 'canyon', to: { lat: -8, lon: 267 },
    note: 'The Labyrinth of Night: a shattered maze of canyons where Valles Marineris begins.' },
  { name: 'Ius Chasma', lat: -7.5, lon: 269, r: 55, h: -6.5, type: 'canyon', to: { lat: -9, lon: 279 },
    note: 'Twin parallel troughs carved deeper than four Grand Canyons stacked.' },
  { name: 'Melas Chasma', lat: -10, lon: 283, r: 90, h: -7.0, type: 'canyon', to: { lat: -11, lon: 290 },
    note: 'The widest heart of Valles Marineris. The canyon floor has its own weather.' },
  { name: 'Coprates Chasma', lat: -12.5, lon: 293, r: 60, h: -6.8, type: 'canyon', to: { lat: -14, lon: 304 },
    note: 'Nearly 1000 km of unbroken chasm. The walls rise 8 km — you cannot see the top from the floor.' },
  { name: 'Eos Chasma', lat: -13, lon: 307, r: 70, h: -5.2, type: 'canyon', to: { lat: -10, lon: 315 },
    note: 'Where the great canyon exhales into chaos terrain and ancient flood channels.' },
  { name: 'Capri Chasma', lat: -8.5, lon: 313, r: 60, h: -4.2, type: 'canyon', to: { lat: -4, lon: 318 },
    note: 'The canyon\'s outlet ramp, spilling toward the lowlands that once may have held a sea.' },
  // Polar caps
  { name: 'Planum Boreum', lat: 90, lon: 0, r: 600, h: 2.2, type: 'cap',
    note: 'The northern ice cap: water ice, spiral troughs, and winter air that freezes out of the sky.' },
  { name: 'Planum Australe', lat: -90, lon: 0, r: 500, h: 3.0, type: 'cap',
    note: 'The southern cap, taller and colder. Radar hints at buried brine lakes beneath.' },
  // Albedo / label features
  { name: 'Syrtis Major', lat: 8.4, lon: 69.5, r: 600, h: 1.0, type: 'albedo',
    note: 'The dark patch telescopes have watched since 1659 — the oldest continuously observed feature on any other planet.' },
];

// Label-only regions for the map and the region ticker
const REGIONS = [
  { name: 'Acidalia Planitia', lat: 49.8, lon: 339.3, r: 27 },
  { name: 'Chryse Planitia', lat: 28.4, lon: 319.7, r: 18 },
  { name: 'Amazonis Planitia', lat: 24.8, lon: 196, r: 20 },
  { name: 'Arcadia Planitia', lat: 47.2, lon: 184.3, r: 19 },
  { name: 'Elysium Planitia', lat: 3, lon: 154.7, r: 18 },
  { name: 'Arabia Terra', lat: 22.8, lon: 5, r: 26 },
  { name: 'Terra Sabaea', lat: -2, lon: 42, r: 22 },
  { name: 'Noachis Terra', lat: -45, lon: 350, r: 25 },
  { name: 'Terra Sirenum', lat: -39.7, lon: 205.8, r: 24 },
  { name: 'Terra Cimmeria', lat: -34.7, lon: 145, r: 24 },
  { name: 'Tempe Terra', lat: 39.3, lon: 289, r: 16 },
  { name: 'Meridiani Planum', lat: -0.2, lon: 356.8, r: 10 },
  { name: 'Vastitas Borealis', lat: 68, lon: 90, r: 35 },
  { name: 'Ares Vallis', lat: 16.5, lon: 327.5, r: 8 },
];

// Every soft landing (and famous almost-landing) on Mars, at real coordinates.
const LANDERS = [
  { name: 'Mars 3', lat: -45, lon: 202, year: 1971, scrap: 2,
    note: 'The first soft landing on Mars. It transmitted for 110 seconds, sent half a gray picture, and went silent forever. A poet.' },
  { name: 'Mars 6', lat: -23.9, lon: 340.6, year: 1974, scrap: 2,
    note: 'Transmitted all the way down and stopped at the surface. Its data described the air it died in.' },
  { name: 'Viking 1', lat: 22.48, lon: 312.05, year: 1976, scrap: 3,
    note: 'First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences.' },
  { name: 'Viking 2', lat: 47.97, lon: 134.26, year: 1976, scrap: 3,
    note: 'Landed on a rock and spent six years slightly tilted. Photographed frost. Never complained.' },
  { name: 'Pathfinder', lat: 19.13, lon: 326.79, year: 1997, scrap: 0,
    note: 'The little lander that could — and its rover Sojourner, the size of a microwave, the courage of a battleship.' },
  { name: 'Beagle 2', lat: 11.53, lon: 90.43, year: 2003, scrap: 2,
    note: 'Landed successfully, then two solar panels failed to open, hiding its antenna. Found 12 years later, almost fine. ALMOST.' },
  { name: 'Spirit', lat: -14.57, lon: 175.47, year: 2004, scrap: 3,
    note: 'Ninety-day mission; drove six years. Finally stuck in soft sand — which its dragging wheel had just revealed to be ancient hot-spring silica.' },
  { name: 'Opportunity', lat: -1.95, lon: 354.47, year: 2004, scrap: 3,
    note: 'Ninety-day mission; drove a marathon over 14 years. Last words, roughly: "My battery is low and it\'s getting dark."' },
  { name: 'Phoenix', lat: 68.22, lon: 234.25, year: 2008, scrap: 3,
    note: 'Dug up polar ice with a robot arm and watched snow fall on Mars. The Martian winter buried it in dry ice. Worth it.' },
  { name: 'Curiosity', lat: -4.59, lon: 137.44, year: 2012, scrap: 2,
    note: 'Nuclear-powered, laser-armed, sky-crane-delivered. Sang itself "Happy Birthday" alone in Gale Crater once. Once.' },
  { name: 'Schiaparelli EDM', lat: -2.05, lon: 353.79, year: 2016, scrap: 3,
    note: 'A software hiccup convinced it the ground was above it. The crater it made is very geographically informative.' },
  { name: 'InSight', lat: 4.5, lon: 135.62, year: 2018, scrap: 3,
    note: 'Listened to the heartbeat of Mars: over 1300 marsquakes. Its last selfie shows it covered in the dust that retired it.' },
  { name: 'Perseverance', lat: 18.44, lon: 77.45, year: 2021, scrap: 2,
    note: 'Carries 43 sample tubes and brought a helicopter as carry-on. Ingenuity flew 72 times when it was rated for 5.' },
  { name: 'Zhurong', lat: 25.07, lon: 109.93, year: 2021, scrap: 2,
    note: 'China\'s first Mars rover, named for a fire god, parked in Utopia. Hibernated for winter; the dust decided it should keep hibernating.' },
];

// Precompute unit vectors + cheap cutoffs
for (const f of FEATURES) {
  f.v = llToVec(f.lat, f.lon);
  f.angR = (f.r / MARS_KM);                        // footprint radius in radians
  let cutAng = f.angR * (f.type === 'crater' ? 2.2 : 1.9);
  if (f.to) {
    f.v2 = llToVec(f.to.lat, f.to.lon);
    // canyons are tested against the segment start; widen the cutoff to cover the far end
    cutAng = angDist(f.v.x, f.v.y, f.v.z, f.v2.x, f.v2.y, f.v2.z) + f.angR * 3;
  }
  f.cut = Math.cos(Math.min(Math.PI, cutAng));
}
for (const r of REGIONS) { r.v = llToVec(r.lat, r.lon); r.cut = Math.cos(r.r * d2r); }
for (const l of LANDERS) { l.v = llToVec(l.lat, l.lon); }

// point-to-great-circle-segment angular distance (via 3D chord approx)
const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pc = new THREE.Vector3();
function segDist(ux, uy, uz, a, b) {
  _pa.set(ux - a.x, uy - a.y, uz - a.z);
  _pb.subVectors(b, a);
  const t = clamp(_pa.dot(_pb) / _pb.lengthSq(), 0, 1);
  _pc.copy(b).sub(a).multiplyScalar(t).add(a).normalize();
  const dx = ux - _pc.x, dy = uy - _pc.y, dz = uz - _pc.z;
  const chord = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return 2 * Math.asin(clamp(chord / 2, 0, 1));
}

// --- the height field (returns REAL km of relief for a unit direction) ---
function marsHeightKm(ux, uy, uz) {
  const latDeg = Math.asin(clamp(uy, -1, 1)) / d2r;
  // crustal dichotomy: northern lowlands vs southern highlands, wandering boundary
  const bWander = (vnoise3(ux * 2.1 + 9, uy * 2.1, uz * 2.1) - 0.5) * 28;
  let h = lerp(1.6, -3.9, smoothstep(-(12 + bWander) + 24, -(12 + bWander) - 6, -latDeg));
  // continental noise
  h += (vnoise3(ux * 3.1, uy * 3.1, uz * 3.1) - 0.5) * 1.4;
  h += (vnoise3(ux * 9.7 + 31, uy * 9.7, uz * 9.7) - 0.5) * 0.55;
  h += (vnoise3(ux * 27 + 7, uy * 27, uz * 27) - 0.5) * 0.28;
  // features
  for (const f of FEATURES) {
    const dot = ux * f.v.x + uy * f.v.y + uz * f.v.z;
    if (dot < f.cut && f.type !== 'cap') continue;
    let d;
    if (f.type === 'canyon') d = segDist(ux, uy, uz, f.v, f.v2);
    else d = angDist(ux, uy, uz, f.v.x, f.v.y, f.v.z);
    const x = d / f.angR;                          // 0 at center, 1 at footprint edge
    switch (f.type) {
      case 'bulge':
        h += f.h * Math.exp(-x * x * 1.8);
        break;
      case 'volcano': {
        const cone = Math.exp(-x * x * 3.2);
        const caldera = Math.exp(-(x / f.cal) * (x / f.cal)) * f.h * 0.22;
        h += f.h * cone - caldera;
        break;
      }
      case 'basin': {
        h += f.h * Math.exp(-x * x * 2.2);
        h += -f.h * 0.16 * Math.exp(-(x - 1.15) * (x - 1.15) * 14);   // rim
        break;
      }
      case 'crater': {
        const bowl = smoothstep(1.0, 0.55, x);
        h += f.h * bowl;
        h += -f.h * 0.28 * Math.exp(-(x - 1.05) * (x - 1.05) * 26);   // raised rim
        if (f.peak) h += f.peak * Math.exp(-x * x * 30);              // central peak (Mt Sharp)
        break;
      }
      case 'canyon': {
        const w = f.r / MARS_KM;
        const t = d / w;
        h += f.h * Math.exp(-t * t * 2.6);
        break;
      }
      case 'cap': {
        const capLat = f.lat > 0 ? latDeg : -latDeg;
        h += f.h * smoothstep(76, 84, capLat);
        break;
      }
      case 'albedo':
        h += f.h * Math.exp(-x * x * 2.0) * 0.5;
        break;
    }
  }
  return h;
}

// world-space surface radius for a unit direction (adds fine local noise for ground detail)
function surfaceH(ux, uy, uz, fine) {
  let hm = marsHeightKm(ux, uy, uz) * HKM;
  if (fine) {
    hm += (vnoise3(ux * 900, uy * 900, uz * 900) - 0.5) * 5.0;
    hm += (vnoise3(ux * 3200 + 13, uy * 3200, uz * 3200) - 0.5) * 1.6;
  }
  return R + hm;
}
const _hv = new THREE.Vector3();
function surfaceAt(v, fine) { _hv.copy(v).normalize(); return surfaceH(_hv.x, _hv.y, _hv.z, fine !== false); }

// --- surface coloring (shared by globe mesh, local patch, and the map) ---
const _colTmp = { r: 0, g: 0, b: 0 };
function marsColor(ux, uy, uz, hKm) {
  const latDeg = Math.asin(clamp(uy, -1, 1)) / d2r;
  const n = vnoise3(ux * 40 + 3, uy * 40, uz * 40);
  // base by elevation: deep basins gray-brown -> highlands red-orange
  const t = clamp((hKm + 5) / 9, 0, 1);
  let r = lerp(0.42, 0.72, t) + n * 0.07;
  let g = lerp(0.30, 0.38, t) + n * 0.045;
  let b = lerp(0.24, 0.20, t) + n * 0.02;
  // Syrtis-style dark albedo
  for (const f of FEATURES) {
    if (f.type !== 'albedo') continue;
    const dot = ux * f.v.x + uy * f.v.y + uz * f.v.z;
    if (dot < f.cut) continue;
    const d = angDist(ux, uy, uz, f.v.x, f.v.y, f.v.z) / f.angR;
    const k = Math.exp(-d * d * 1.6) * 0.55;
    r -= 0.20 * k; g -= 0.11 * k; b -= 0.05 * k;
  }
  // polar ice
  const capK = smoothstep(74, 82, Math.abs(latDeg)) + (hKm > 1.6 && Math.abs(latDeg) > 70 ? 0.3 : 0);
  if (capK > 0) {
    const k = clamp(capK, 0, 1);
    r = lerp(r, 0.93, k); g = lerp(g, 0.94, k); b = lerp(b, 0.96, k);
  }
  _colTmp.r = clamp(r, 0, 1); _colTmp.g = clamp(g, 0, 1); _colTmp.b = clamp(b, 0, 1);
  return _colTmp;
}

// region name for a position
function regionName(v) {
  let best = null, bestScore = 1e9;
  for (const f of [...REGIONS, ...FEATURES]) {
    if (f.type === 'bulge' || f.type === 'albedo') continue;
    const ang = angDist(v.x, v.y, v.z, f.v.x, f.v.y, f.v.z);
    const rr = f.angR !== undefined ? f.angR : f.r * d2r;
    if (ang < rr && rr < bestScore) { bestScore = rr; best = f.name; }
  }
  if (best) return best;
  const ll = vecToLl(v);
  if (ll.lat > 55) return 'Vastitas Borealis';
  if (ll.lat < -60) return 'Southern Highlands';
  return marsHeightKm(v.x, v.y, v.z) < -1.5 ? 'Northern Lowlands' : 'Cratered Highlands';
}

// local air temperature (°C) — display + cold penalties
function localTempC(upVec, sunEl) {
  const lat = Math.abs(Math.asin(clamp(upVec.y, -1, 1)) / d2r);
  return Math.round(-63 + 85 * Math.max(0, sunEl) - 35 * Math.pow(lat / 90, 2) - (sunEl < 0 ? 22 : 0));
}

// ============================================================
// 5. GAME STATE
// ============================================================
const DIFFICULTIES = {
  story:    { name: 'BOTANIST',    rescueSol: 20, drain: 0.75, desc: 'Rescue: Sol 20. Forgiving drains,\nstorms always forecast. See Mars, grow spuds.' },
  survival: { name: 'ENGINEER',    rescueSol: 45, drain: 1.0,  desc: 'Rescue: Sol 45. The intended experience.\nProvision your expeditions or die packing.' },
  iron:     { name: 'SPACE PIRATE', rescueSol: 60, drain: 1.15, desc: 'Rescue: Sol 60. Death rewinds nothing —\none life, whole planet, no complaints.' },
};

const S = {
  started: false, uiOpen: false, over: false, won: false, sleeping: false,
  mode: 'walk',                    // walk | rover | cutscene
  diff: 'survival', rescueSol: 45, drainMult: 1.0,
  sol: 1, tod: 0.02,
  o2: 100, water: 42, food: 10, potatoes: 0, power: 72, health: 100, suit: 46,
  roverPower: 100, roverO2: 300,
  hydrazine: 3,
  inv: { scrap: 0, circuit: 0, regolith: 0, ice: 0, candle: 0,
         kitSolar: 0, kitGreenhouse: 0, kitBeacon: 0, kitCache: 0 },
  upgrades: {},                    // drive1, drive2, tank1, tank2, recycler, insulation, wiper, drill, roverBattery, rtg
  blueprints: { drill: false, drive2: false, tank2: false, recycler: false },
  inside: false,
  storm: { i: 0, cells: [] },
  breach: { active: false, done: false, cropsKilled: false, timer: 0 },
  pf: { found: false, loaded: false, connected: false },
  disco: false,
  discovered: {}, salvaged: {}, achieved: {},
  quests: {},                      // id -> 'offered' | 'active' | 'done'
  checkedSystems: {},
  flags: { coldOpen: true, suitSealed: false, didMath: false, hydrazineBoom: false,
           pfRevealed: false, mavRevealed: false, mavStripped: false, nasaMsg: 0, routePods: false },
  stats: { potatoes: 0, panels: 0, walked: 0, driven: 0, closeCalls: 0, booms: 0, mined: 0,
           crafted: 0, discoveries: 0, discoTime: 0, stormOut: 0 },
  holdT: 0, shake: 0, dead: null,
};

const BAL = {
  solLen: 220,
  o2Drain: 22, o2Gen: 42, o2BreachDrain: 210,
  waterMax: 120, waterDrain: 6, waterRecl: 4.5, waterPerDose: 5,
  hydrazineWater: 28, iceWater: 10,
  powerMax: 100, powerBase: 34, solarGen: 118,
  dustRate: 0.05, stormDustRate: 0.7, stormGenMult: 0.14,
  potatoYield: 4, growSols: 2.4, waterings: 2,
  healthMax: 100, starveDrain: 16, suffocateDrain: 10, healRegen: 4, sleepHeal: 10,
  walkSpeed: 5.2, runSpeed: 9.2, jumpV: 4.6, gravity: 8.2,
  suitCap: 100,
  roverO2Cap: 300, roverPowerCap: 100, roverDrainPerMin: 5, roverChargeAtHab: 25,
};
function suitCap() { return S.upgrades.tank2 ? 200 : S.upgrades.tank1 ? 150 : BAL.suitCap; }
function roverTopSpeed() { return S.upgrades.drive2 ? 55 : S.upgrades.drive1 ? 45 : 35; }
function roverPowerCap() { return S.upgrades.roverBattery ? 160 : BAL.roverPowerCap; }

// ============================================================
// 6. RENDERER, CAMERA-RELATIVE WORLD, SUN, SKY, STARS
// ============================================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.domElement.className = 'mg-three';
root.insertBefore(renderer.domElement, root.firstChild);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005);
scene.fog = new THREE.FogExp2(0xc98a5b, 0.0016);

// Camera-relative rendering: the camera never leaves the origin; the world shifts.
// Game logic uses CAM.pos (world, float64); render applies worldRoot = -CAM.pos.
const worldRoot = new THREE.Group();
scene.add(worldRoot);
const CAM = { pos: new THREE.Vector3(R + 2, 0, 0), quat: new THREE.Quaternion() };
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.3, 80000);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
const _lookM = new THREE.Matrix4(), _lookT = new THREE.Vector3();
function camLookAt(targetWorld, upVec) {
  _lookT.copy(targetWorld).sub(CAM.pos);
  _lookM.lookAt(new THREE.Vector3(0, 0, 0), _lookT, upVec);
  CAM.quat.setFromRotationMatrix(_lookM);
}
function applyCamera() {
  worldRoot.position.copy(CAM.pos).negate();
  camera.position.set(0, 0, 0);
  camera.quaternion.copy(CAM.quat);
}

const sunDir = new THREE.Vector3(1, 0, 0);
function updateSunDir() {
  const a = S.tod * Math.PI * 2;
  sunDir.set(Math.cos(a), 0, Math.sin(a));
}

// stars
{
  const n = 1400, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = srand() * Math.PI * 2, ph = Math.acos(2 * srand() - 1);
    const r = 60000;
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var stars = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xffffff, size: 2.0, sizeAttenuation: false, transparent: true, opacity: 0.9, fog: false, depthWrite: false }));
  scene.add(stars);   // stars stay camera-centered on purpose (infinitely far)
}

function radialTex(inner, outer, stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, inner, 64, 64, outer);
  for (const [t, col] of stops) grad.addColorStop(t, col);
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const sun = new THREE.Sprite(new THREE.SpriteMaterial({
  map: radialTex(2, 60, [[0, 'rgba(255,246,228,1)'], [0.22, 'rgba(255,232,196,0.9)'], [1, 'rgba(255,222,175,0)']]),
  fog: false, depthWrite: false, transparent: true }));
sun.scale.set(6000, 6000, 1);
scene.add(sun);       // camera-centered like the stars

const sunLight = new THREE.DirectionalLight(0xffe0c0, 1.0);
scene.add(sunLight);
scene.add(sunLight.target);
const hemiLight = new THREE.HemisphereLight(0xd9b090, 0x5c3020, 0.5);
scene.add(hemiLight);

// atmosphere shell: sky gradient from the ground, orange limb from space
const atmoMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide, transparent: true, depthWrite: false, fog: false,
  uniforms: { sunDir: { value: sunDir }, camPos: { value: new THREE.Vector3() }, storm: { value: 0 } },
  vertexShader: `
    varying vec3 vN;
    void main() {
      vN = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 sunDir; uniform vec3 camPos; uniform float storm;
    varying vec3 vN;
    void main() {
      float sunE = dot(vN, sunDir);
      float day = smoothstep(-0.12, 0.25, sunE);
      vec3 dayCol = mix(vec3(0.72, 0.42, 0.22), vec3(0.91, 0.63, 0.42), clamp(0.5 + 0.5 * sunE, 0.0, 1.0));
      vec3 duskCol = vec3(0.38, 0.17, 0.26);
      vec3 col = mix(vec3(0.012, 0.008, 0.015), mix(duskCol, dayCol, smoothstep(-0.03, 0.3, sunE)), day);
      col = mix(col, vec3(0.55, 0.30, 0.14), storm * day * 0.8);
      float camAlt = length(camPos) - ${R.toFixed(1)};
      float spaceK = smoothstep(300.0, 1600.0, camAlt);
      vec3 world = vN * ${(R * 1.04).toFixed(1)};
      vec3 viewDir = normalize(world - camPos);
      float rim = pow(1.0 - abs(dot(viewDir, vN)), 2.2);
      float groundAlpha = (0.9 - 0.55 * clamp(dot(viewDir, normalize(camPos)), 0.0, 1.0)) * (0.22 + 0.78 * day);
      float spaceAlpha = rim * (0.2 + 0.55 * day);
      float alpha = mix(clamp(groundAlpha + storm * 0.25, 0.0, 0.98), spaceAlpha, spaceK);
      gl_FragColor = vec4(col, alpha);
    }`,
});
const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 64, 32), atmoMat);
atmo.renderOrder = 5;
atmo.frustumCulled = false;
worldRoot.add(atmo);

// ============================================================
// 7. GLOBAL PLANET MESH (seam-free custom sphere grid)
// ============================================================
const GLOBE_BIAS = 14;      // sits below the local patch everywhere
let globeMesh;
function buildGlobe() {
  const LON = 320, LAT = 160;                       // LAT rows of quads, LON cols, wrapped
  const vertsPerRow = LON;
  const rows = LAT - 1;                              // interior rows (excluding poles)
  const count = rows * vertsPerRow + 2;              // + 2 pole verts
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  let i3 = 0;
  const setVert = (idx, x, y, z) => {
    v.set(x, y, z).normalize();
    const hKm = marsHeightKm(v.x, v.y, v.z);
    const r = R + hKm * HKM - GLOBE_BIAS;
    pos[idx * 3] = v.x * r; pos[idx * 3 + 1] = v.y * r; pos[idx * 3 + 2] = v.z * r;
    const c = marsColor(v.x, v.y, v.z, hKm);
    col[idx * 3] = c.r; col[idx * 3 + 1] = c.g; col[idx * 3 + 2] = c.b;
  };
  for (let r = 0; r < rows; r++) {
    const phi = Math.PI * (r + 1) / LAT - Math.PI / 2;   // -~90..~90
    for (let l = 0; l < LON; l++) {
      const lam = 2 * Math.PI * l / LON;
      setVert(r * LON + l, Math.cos(phi) * Math.cos(lam), Math.sin(phi), -Math.cos(phi) * Math.sin(lam));
    }
  }
  const southIdx = rows * LON, northIdx = rows * LON + 1;
  setVert(southIdx, 0, -1, 0);
  setVert(northIdx, 0, 1, 0);
  const idx = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let l = 0; l < LON; l++) {
      const a = r * LON + l, b = r * LON + (l + 1) % LON;
      const c2 = (r + 1) * LON + l, d = (r + 1) * LON + (l + 1) % LON;
      idx.push(a, b, c2, b, d, c2);                  // CCW from outside
    }
  }
  for (let l = 0; l < LON; l++) {                     // pole fans
    idx.push(southIdx, (l + 1) % LON, l);
    const base = (rows - 1) * LON;
    idx.push(northIdx, base + l, base + (l + 1) % LON);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  globeMesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
  worldRoot.add(globeMesh);
}

// ============================================================
// 8. LOCAL DETAIL PATCH (double-buffered, camera-relative verts)
// ============================================================
const PATCH_SPAN = 900, PATCH_N = 104, PATCH_ROWS_PER_FRAME = 14;
const patchAnchor = new THREE.Vector3(1, 0, 0);     // unit vector of current patch center
let patchA, patchB, activePatch;                     // two buffers; one visible, one filling
let patchFill = null;                                // { mesh, anchor, row } while building
const _pe = new THREE.Vector3(), _pn = new THREE.Vector3(), _pd = new THREE.Vector3(), _pv = new THREE.Vector3();
function tangentBasis(up, east, north) {
  east.set(-up.z, 0, up.x);
  if (east.lengthSq() < 1e-8) east.set(1, 0, 0);
  east.normalize();
  north.crossVectors(up, east);
}
function mkPatchMesh() {
  const g = new THREE.PlaneGeometry(1, 1, PATCH_N, PATCH_N);
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  // reprojected grid winding varies with the tangent frame — render both sides
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  m.frustumCulled = false;
  m.visible = false;
  worldRoot.add(m);
  return m;
}
function fillPatchRows(job, rowBudget) {
  const up = job.anchor;
  tangentBasis(up, _pe, _pn);
  const pos = job.mesh.geometry.attributes.position;
  const col = job.mesh.geometry.attributes.color;
  const half = PATCH_SPAN / 2, step = PATCH_SPAN / PATCH_N;
  const anchorPos = job.anchorPos;
  const endRow = Math.min(job.row + rowBudget, PATCH_N + 1);
  for (let j = job.row; j < endRow; j++) {
    for (let k = 0; k <= PATCH_N; k++) {
      const x = -half + k * step, y = -half + j * step;
      _pd.copy(up).addScaledVector(_pe, x / R).addScaledVector(_pn, y / R).normalize();
      let r = surfaceH(_pd.x, _pd.y, _pd.z, true);
      if (j === 0 || k === 0 || j === PATCH_N || k === PATCH_N) r -= 25;   // skirt
      const i = j * (PATCH_N + 1) + k;
      // verts are stored relative to the anchor point => small numbers, no f32 jitter
      pos.setXYZ(i, _pd.x * r - anchorPos.x, _pd.y * r - anchorPos.y, _pd.z * r - anchorPos.z);
      const hKm = (r - R) / HKM;
      const c = marsColor(_pd.x, _pd.y, _pd.z, hKm);
      const n = vnoise3(_pd.x * 2400, _pd.y * 2400, _pd.z * 2400) * 0.06 - 0.03;
      col.setXYZ(i, clamp(c.r + n, 0, 1), clamp(c.g + n, 0, 1), clamp(c.b + n, 0, 1));
    }
  }
  job.row = endRow;
  if (job.row > PATCH_N) {
    pos.needsUpdate = true;
    col.needsUpdate = true;
    job.mesh.geometry.computeVertexNormals();
    job.mesh.geometry.computeBoundingSphere();
    job.mesh.position.copy(anchorPos);
    return true;
  }
  return false;
}
function startPatchFill(centerUnit) {
  const anchor = centerUnit.clone().normalize();
  const anchorPos = anchor.clone().multiplyScalar(surfaceH(anchor.x, anchor.y, anchor.z, false));
  const mesh = (activePatch === patchA) ? patchB : patchA;
  patchFill = { mesh, anchor, anchorPos, row: 0 };
}
function updatePatch(playerUnit, velocityLead) {
  if (!patchFill) {
    _pv.copy(playerUnit).normalize();
    if (velocityLead) _pv.addScaledVector(velocityLead, 3 / R).normalize();
    const d = angDist(_pv.x, _pv.y, _pv.z, patchAnchor.x, patchAnchor.y, patchAnchor.z) * R;
    if (d > 180 || !activePatch) startPatchFill(_pv);
  }
  if (patchFill) {
    const done = fillPatchRows(patchFill, activePatch ? PATCH_ROWS_PER_FRAME : PATCH_N + 1);
    if (done) {
      if (activePatch) activePatch.visible = false;
      activePatch = patchFill.mesh;
      activePatch.visible = true;
      patchAnchor.copy(patchFill.anchor);
      scatterRocks(patchFill.anchor);
      patchFill = null;
    }
  }
}

// ============================================================
// 9. ROCKS — stable world cells, colliders persist across visits
// ============================================================
const ROCK_CELL = 52, ROCK_RANGE = 420;
let rocksMesh;
const rockColliders = [];        // { v: unitVec, r: meters }
function buildRocks() {
  rocksMesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshLambertMaterial({ color: 0x8a4526 }), 420);
  rocksMesh.frustumCulled = false;
  worldRoot.add(rocksMesh);
  buildDustDevil();
}
const _rm = new THREE.Matrix4(), _rq = new THREE.Quaternion(), _re = new THREE.Euler(), _rs = new THREE.Vector3();
function scatterRocks(up) {
  tangentBasis(up, _pe, _pn);
  rockColliders.length = 0;
  const anchorPos = up.clone().multiplyScalar(surfaceH(up.x, up.y, up.z, false));
  rocksMesh.position.copy(anchorPos);
  const cells = Math.floor(ROCK_RANGE / ROCK_CELL);
  const seenCells = new Set();
  let placed = 0;
  for (let cy = -cells; cy <= cells && placed < 420; cy++) {
    for (let cx = -cells; cx <= cells && placed < 420; cx++) {
      // world-stable cell id from the quantized cell-center direction
      _pd.copy(up).addScaledVector(_pe, cx * ROCK_CELL / R).addScaledVector(_pn, cy * ROCK_CELL / R).normalize();
      const qx = Math.round(_pd.x * R / ROCK_CELL), qy = Math.round(_pd.y * R / ROCK_CELL), qz = Math.round(_pd.z * R / ROCK_CELL);
      const cellKey = qx + '|' + qy + '|' + qz;
      if (seenCells.has(cellKey)) continue;
      seenCells.add(cellKey);
      const h1 = hash3(qx, qy, qz), h2 = hash3(qx + 91, qy + 7, qz), h3 = hash3(qx, qy + 313, qz + 17);
      if (h1 < 0.45) continue;                       // not every cell has a rock
      // rebuild from the world-stable lattice center, then apply the deterministic offset
      _pd.set(qx, qy, qz).multiplyScalar(ROCK_CELL / R).normalize();
      _pd.addScaledVector(_pe, (h2 - 0.5) * ROCK_CELL * 0.9 / R).addScaledVector(_pn, (h3 - 0.5) * ROCK_CELL * 0.9 / R).normalize();
      const latDeg = Math.abs(Math.asin(clamp(_pd.y, -1, 1)) / d2r);
      if (latDeg > 76) continue;
      const s = 0.3 + Math.pow(hash3(qx + 5, qy, qz + 5), 2.6) * 3.4;
      const r = surfaceH(_pd.x, _pd.y, _pd.z, true);
      _re.set(h1 * 6, h2 * 6, h3 * 6);
      _rq.setFromEuler(_re);
      _rs.set(s * (0.7 + h2 * 0.6), s * (0.5 + h1 * 0.5), s * (0.7 + h3 * 0.6));
      _pv.copy(_pd).multiplyScalar(r + s * 0.1).sub(anchorPos);
      _rm.compose(_pv, _rq, _rs);
      rocksMesh.setMatrixAt(placed, _rm);
      if (s > 1.7) rockColliders.push({ v: _pd.clone(), r: s });
      placed++;
    }
  }
  for (let i = placed; i < 420; i++) { _rm.makeScale(0, 0, 0); rocksMesh.setMatrixAt(i, _rm); }
  rocksMesh.instanceMatrix.needsUpdate = true;
}

// a wandering dust devil (visual + achievement fodder)
let devil = null;
function buildDustDevil() {
  const g = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 0.6, 26, 8, 3, true),
    new THREE.MeshLambertMaterial({ color: 0xc89060, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  worldRoot.add(g);
  devil = { mesh: g, active: false, u: new THREE.Vector3(1, 0, 0), heading: 0, t: 0 };
  g.visible = false;
}
function updateDevil(dt, playerU) {
  if (!devil) return;
  if (!devil.active) {
    if (Math.random() < dt * 0.02 && S.storm.i < 0.3) {
      devil.active = true;
      devil.t = 20 + Math.random() * 25;
      tangentBasis(playerU, _pe, _pn);
      devil.u.copy(playerU)
        .addScaledVector(_pe, (Math.random() - 0.5) * 500 / R)
        .addScaledVector(_pn, (Math.random() - 0.5) * 500 / R).normalize();
      devil.heading = Math.random() * Math.PI * 2;
      devil.mesh.visible = true;
    }
    return;
  }
  devil.t -= dt;
  tangentBasis(devil.u, _pe, _pn);
  devil.u.addScaledVector(_pe, Math.cos(devil.heading) * 6 * dt / R)
        .addScaledVector(_pn, Math.sin(devil.heading) * 6 * dt / R).normalize();
  devil.heading += (Math.random() - 0.5) * dt * 2;
  const r = surfaceH(devil.u.x, devil.u.y, devil.u.z, true);
  devil.mesh.position.copy(devil.u).multiplyScalar(r + 13);
  frameQuat(devil.u, 0, devil.mesh.quaternion);
  devil.mesh.rotation.y += perf() * 0.001;
  if (devil.t <= 0 || angDist(devil.u.x, devil.u.y, devil.u.z, playerU.x, playerU.y, playerU.z) * R > 900) {
    devil.active = false;
    devil.mesh.visible = false;
  }
}

// ============================================================
// 10. AMBIENT DUST + SKY UPDATE
// ============================================================
const DUST_N = 480, DUST_BOX = 80;
let dustPts;
const dustLocal = [];
function buildDust() {
  const pos = new Float32Array(DUST_N * 3);
  for (let i = 0; i < DUST_N; i++)
    dustLocal.push({ e: (srand() - 0.5) * DUST_BOX, n: (srand() - 0.5) * DUST_BOX, u: srand() * 24 });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustPts = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xd8a070, size: 0.5, transparent: true, opacity: 0.22, depthWrite: false,
    map: radialTex(4, 62, [[0, 'rgba(255,235,215,0.9)'], [0.6, 'rgba(255,225,195,0.35)'], [1, 'rgba(255,220,180,0)']]) }));
  dustPts.frustumCulled = false;
  scene.add(dustPts);   // camera-space points: positions are offsets from the camera
}
const _du = new THREE.Vector3(), _de = new THREE.Vector3(), _dn = new THREE.Vector3();
function updateDust(dt) {
  _du.copy(CAM.pos).normalize();
  tangentBasis(_du, _de, _dn);
  const wind = 3 + S.storm.i * 24;
  const pos = dustPts.geometry.attributes.position;
  const camAlt = CAM.pos.length() - surfaceAt(CAM.pos);
  for (let i = 0; i < DUST_N; i++) {
    const p = dustLocal[i];
    p.e += wind * dt;
    p.u -= dt * (0.4 + S.storm.i * 2);
    if (p.e > DUST_BOX / 2) p.e -= DUST_BOX;
    if (p.u < -2) p.u += 24;
    _pv.set(0, 0, 0).addScaledVector(_de, p.e).addScaledVector(_dn, p.n).addScaledVector(_du, p.u - 8);
    pos.setXYZ(i, _pv.x, _pv.y, _pv.z);
  }
  pos.needsUpdate = true;
  dustPts.material.opacity = Math.max(0, (0.18 + S.storm.i * 0.55) * (1 - camAlt / 900));
  dustPts.material.size = 0.5 + S.storm.i * 0.5;
}

const _cTmp = new THREE.Color();
function localSunEl() { return _du.copy(CAM.pos).normalize().dot(sunDir); }
function updateSky() {
  updateSunDir();
  const sunEl = localSunEl();
  const day = smoothstep(-0.08, 0.25, sunEl);
  const camAlt = CAM.pos.length() - R;
  const groundK = clamp(1 - Math.max(0, camAlt - 250) / 1400, 0, 1);
  const fogC = scene.fog.color;
  fogC.setRGB(lerp(0.03, 0.79, day), lerp(0.02, 0.54, day), lerp(0.04, 0.36, day));
  if (S.storm.i > 0) fogC.lerp(_cTmp.setHex(0x8a4a24), S.storm.i * 0.8);
  scene.fog.density = (0.0011 + S.storm.i * 0.0100) * groundK + 0.000002;
  sunLight.intensity = clamp(sunEl * 3, 0.03, 1.1) * (1 - S.storm.i * 0.75 * groundK);
  sunLight.position.copy(CAM.pos).addScaledVector(sunDir, 4000);
  sunLight.target.position.copy(CAM.pos);
  hemiLight.intensity = lerp(0.06, 0.5, day) * (1 - S.storm.i * 0.5 * groundK);
  stars.material.opacity = clamp(1 - day * 1.15, 0, 1) * (1 - S.storm.i * groundK) * 0.95 + 0.05;
  sun.position.copy(sunDir).multiplyScalar(40000);
  sun.material.opacity = clamp(0.15 + sunEl * 2, 0, 1) * (1 - S.storm.i * 0.9 * groundK);
  atmoMat.uniforms.camPos.value.copy(CAM.pos);
  atmoMat.uniforms.storm.value = S.storm.i * groundK;
}

// ============================================================
// 8. PLACEMENT HELPERS & COLLIDERS
// ============================================================
const World = { plots: [], panels: [], soilPiles: [], landers: [], iceSites: [], builtMeshes: [],
  markers: [], pods: [] };
const colliders = [];                 // { v: unitVec, r: meters, group?: hab }

const _fe = new THREE.Vector3(), _fn = new THREE.Vector3(), _ff = new THREE.Vector3(), _fx = new THREE.Vector3();
const _fm = new THREE.Matrix4();
function frameQuat(up, yaw, outQ) {
  tangentBasis(up, _fe, _fn);
  _ff.copy(_fn).multiplyScalar(Math.cos(yaw)).addScaledVector(_fe, Math.sin(yaw));  // facing
  _fx.crossVectors(up, _ff);
  _fm.makeBasis(_fx, up, _ff);
  return (outQ || new THREE.Quaternion()).setFromRotationMatrix(_fm);
}
function placeAt(latOrVec, lon, yaw) {
  const g = new THREE.Group();
  const u = latOrVec.isVector3 ? _pv.copy(latOrVec).normalize().clone() : llToVec(latOrVec, lon);
  const r = surfaceAt(u);
  g.position.copy(u).multiplyScalar(r);
  frameQuat(u, yaw || 0, g.quaternion);
  g.userData.up = u.clone();
  worldRoot.add(g);
  return g;
}
function addColliderAt(group, lx, lz, r) {
  // math-space transform: never rely on matrixWorld (worldRoot shifts each frame)
  const w = new THREE.Vector3(lx, 0, lz).applyQuaternion(group.quaternion).add(group.position);
  colliders.push({ v: w.normalize().clone(), r });
}
function groundDist(aWorld, bWorld) {
  // great-circle surface distance in meters between two world positions
  _pa.copy(aWorld).normalize(); _pb.copy(bWorld).normalize();
  return angDist(_pa.x, _pa.y, _pa.z, _pb.x, _pb.y, _pb.z) * R;
}

function mkBox(w, h, d, color, x, y, z, parent, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {})));
  m.position.set(x, y, z);
  (parent || scene).add(m);
  return m;
}
function mkCyl(rt, rb, h, color, x, y, z, parent, seg, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14),
    new THREE.MeshLambertMaterial(Object.assign({ color }, opts || {})));
  m.position.set(x, y, z);
  (parent || scene).add(m);
  return m;
}

// ============================================================
// 9. RANDOM CRASH SITE + HAB COLONY
// ============================================================
const HAB_R = 8.4, DOOR_HALF = 0.16;
let SPAWN = null;                    // { lat, lon, v }

function slopeAt(u) {
  tangentBasis(u, _fe, _fn);
  const h0 = surfaceAt(u, false);
  _pv.copy(u).addScaledVector(_fe, 40 / R).normalize();
  const he = surfaceAt(_pv, false);
  _pv.copy(u).addScaledVector(_fn, 40 / R).normalize();
  const hn = surfaceAt(_pv, false);
  return Math.max(Math.abs(he - h0), Math.abs(hn - h0)) / 40;
}
function pickSpawn(rng) {
  for (let tries = 0; tries < 200; tries++) {
    const lat = (rng() * 2 - 1) * 52;
    const lon = rng() * 360;
    const u = llToVec(lat, lon);
    if (slopeAt(u) > 0.28) continue;                                  // too steep for a colony
    const pf = llToVec(19.13, 326.79), mav = llToVec(-2.71, 16.77);
    if (angDist(u.x, u.y, u.z, pf.x, pf.y, pf.z) * R < 2500) continue; // keep the story a road trip
    if (angDist(u.x, u.y, u.z, mav.x, mav.y, mav.z) * R < 2500) continue;
    let stormed = false;
    for (const c of (S.storm.cells || [])) {
      const cv = llToVec(c.lat, c.lon);
      if (angDist(u.x, u.y, u.z, cv.x, cv.y, cv.z) * R < c.r + 2500) { stormed = true; break; }
    }
    if (stormed) continue;                        // don't found a colony inside a dust cell
    return { lat, lon, v: u };
  }
  return { lat: 18, lon: 340, v: llToVec(18, 340) };                  // safe fallback
}

let habGroup;                        // everything local to the colony
function buildHabColony(spawn) {
  const yaw = 0;
  habGroup = placeAt(spawn.lat, spawn.lon, yaw);
  World.hab = habGroup;
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xcfc0a8, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(HAB_R, HAB_R, 3.4, 40, 1, true, DOOR_HALF, Math.PI * 2 - DOOR_HALF * 2), wallMat);
  wall.position.y = 1.7;
  habGroup.add(wall);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(HAB_R, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), wallMat);
  dome.scale.y = 0.55; dome.position.y = 3.4;
  habGroup.add(dome);
  const fx = Math.sin(DOOR_HALF) * HAB_R, fz = Math.cos(DOOR_HALF) * HAB_R;
  mkBox(0.25, 2.6, 0.5, 0x8a8378, fx, 1.3, fz, habGroup);
  mkBox(0.25, 2.6, 0.5, 0x8a8378, -fx, 1.3, fz, habGroup);
  mkBox(2 * fx + 0.25, 0.9, 0.5, 0x8a8378, 0, 2.95, fz, habGroup);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(HAB_R - 0.05, 40),
    new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.06;
  habGroup.add(floor);
  World.beacon = mkBox(0.3, 0.3, 0.3, 0x33ff66, 0, 5.4, 0, habGroup, { emissive: 0x33ff66 });
  const l1 = new THREE.PointLight(0xffe6c8, 0.95, 22); l1.position.set(0, 3.0, 0); habGroup.add(l1);
  const l2 = new THREE.PointLight(0xffd9b0, 0.5, 14); l2.position.set(3, 2.4, -4); habGroup.add(l2);
  World.habLights = [l1, l2];

  // farm plots (6 base; greenhouses add more)
  for (let i = 0; i < 6; i++) {
    const px = -5.2 + (i % 2) * 2.0, pz = -3.2 + Math.floor(i / 2) * 2.4;
    addFarmPlot(habGroup, px, pz, true);
  }

  // equipment
  const oxy = new THREE.Group(); oxy.position.set(5.6, 0.06, -3.6); habGroup.add(oxy);
  mkBox(1.6, 2.0, 1.1, 0x7a8a92, 0, 1.0, 0, oxy);
  World.oxyLight = mkBox(0.16, 0.16, 0.1, 0x33ff66, 0.4, 1.6, 0.58, oxy, { emissive: 0x33ff66 });
  mkCyl(0.1, 0.1, 1.6, 0x5a6a72, -0.5, 2.4, 0, oxy);
  World.oxygenator = oxy;
  addColliderAt(habGroup, 5.6, -3.6, 1.1);

  const rec = new THREE.Group(); rec.position.set(5.9, 0.06, -0.4); habGroup.add(rec);
  mkBox(1.3, 1.2, 1.0, 0x6a7a88, 0, 0.6, 0, rec);
  mkCyl(0.45, 0.45, 1.5, 0x4a7ab0, 0, 1.95, 0, rec, 12);
  World.reclaimer = rec;
  addColliderAt(habGroup, 5.9, -0.4, 0.95);

  const hyd = new THREE.Group(); hyd.position.set(5.5, 0.06, 2.6); habGroup.add(hyd);
  mkCyl(0.5, 0.5, 1.4, 0xb0a24a, 0, 0.7, 0, hyd, 12);
  mkBox(0.9, 0.5, 0.7, 0x4a4a4a, 0, 0.25, 0.85, hyd);
  World.hydFlame = mkCyl(0.12, 0.26, 0.5, 0xffa030, 0, 0.75, 0.85, hyd, 8, { emissive: 0xff7020 });
  World.hydFlame.visible = false;
  World.hydrazineRig = hyd;
  addColliderAt(habGroup, 5.5, 2.6, 0.95);

  const comms = new THREE.Group(); comms.position.set(0, 0.06, -6.6); habGroup.add(comms);
  mkBox(2.4, 0.1, 1.0, 0x8a8378, 0, 0.85, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, -1.0, 0.42, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, 1.0, 0.42, 0, comms);
  World.commsScreen = mkBox(1.5, 0.9, 0.08, 0x101418, 0, 1.55, -0.15, comms, { emissive: 0x000000 });
  World.comms = comms;
  addColliderAt(habGroup, 0, -6.6, 1.2);

  const bunk = new THREE.Group(); bunk.position.set(-5.0, 0.06, -4.9); habGroup.add(bunk);
  mkBox(1.1, 0.4, 2.3, 0x7a7268, 0, 0.2, 0, bunk);
  mkBox(1.0, 0.18, 2.1, 0xa89a80, 0, 0.5, 0, bunk);
  mkBox(0.8, 0.16, 0.5, 0xcfc0a8, 0, 0.6, -0.75, bunk);
  World.bunk = bunk;
  addColliderAt(habGroup, -5.0, -4.9, 1.1);

  const shelf = new THREE.Group(); shelf.position.set(4.2, 0.06, 4.8); habGroup.add(shelf);
  mkBox(1.8, 1.7, 0.6, 0x7a7268, 0, 0.85, 0, shelf);
  for (let i = 0; i < 6; i++)
    mkBox(0.4, 0.3, 0.4, 0xc0842f, -0.6 + (i % 3) * 0.6, 0.5 + Math.floor(i / 3) * 0.75, 0.12, shelf);
  World.shelf = shelf;
  addColliderAt(habGroup, 4.2, 4.8, 1.0);

  // workbench / fabricator
  const bench = new THREE.Group(); bench.position.set(-4.6, 0.06, 3.9); habGroup.add(bench);
  mkBox(2.0, 0.95, 0.9, 0x6a655c, 0, 0.48, 0, bench);
  mkBox(0.5, 0.35, 0.5, 0xb0762f, -0.5, 1.13, 0, bench);
  mkCyl(0.06, 0.06, 0.8, 0x9a9a9a, 0.5, 1.35, 0, bench, 6);
  World.bench = bench;
  addColliderAt(habGroup, -4.6, 3.9, 1.1);

  // breach hole + patch (hidden until the event)
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.75, 20),
    new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide }));
  hole.position.set(0, 1.7, -HAB_R + 0.02);
  hole.visible = false;
  habGroup.add(hole);
  World.breachHole = hole;
  const patch = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xb0b0b8, side: THREE.DoubleSide }));
  patch.position.set(0, 1.7, -HAB_R + 0.04);
  patch.visible = false;
  habGroup.add(patch);
  World.breachPatch = patch;

  // solar array, in its own group beside the hab
  const solar = placeOffset(habGroup, -30, 4, 0);
  for (let i = 0; i < 8; i++) {
    const px = -Math.floor(i / 4) * 5.5, pz = (i % 4) * 4.6;
    const g = new THREE.Group(); g.position.set(px, 0, pz); solar.add(g);
    mkCyl(0.14, 0.18, 1.1, 0x5a5a5a, 0, 0.55, 0, g, 8);
    const panel = mkBox(3.4, 0.1, 2.2, 0x1c2c50, 0, 1.15, 0, g);
    panel.rotation.x = -0.42;
    panel.material = panel.material.clone();
    addColliderAt(solar, px, pz, 1.0);
    World.panels.push({ mesh: panel, dust: 0.22 + i * 0.05, group: g });
  }
  World.solarGroup = solar;

  // rover
  buildRover(placeOffset(habGroup, 15, 15, 2.6));

  // regolith piles
  for (const [x, z] of [[22, -8], [26, 6], [-14, 24], [8, 27], [-24, -16], [16, -22]]) {
    const g = placeOffset(habGroup, x, z, 0);
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0x6e3418 }));
    m.position.y = -0.5; m.scale.y = 0.55;
    g.add(m);
    World.soilPiles.push({ mesh: m, group: g, left: 2 });
  }

  // uplink dish + pathfinder parking ring
  const up = placeOffset(habGroup, 11.5, 7.5, 0);
  mkCyl(0.1, 0.14, 1.3, 0x6a6a6a, 0, 0.65, 0, up, 8);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new THREE.MeshLambertMaterial({ color: 0xd8d0c0, side: THREE.DoubleSide }));
  dish.position.y = 1.5; dish.rotation.x = -0.9;
  up.add(dish);
  World.uplink = up;
  colliders.push({ v: up.position.clone().normalize(), r: 0.8 });
  const ringG = placeOffset(habGroup, 7.0, 9.5, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0xffb45e }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.12;
  ringG.add(ring);
  World.uplinkRing = ringG;

  // crash debris trail (starter scrap) + buried RTG site
  for (let i = 0; i < 3; i++) {
    const ang = 0.7 + i * 0.5, dist = 60 + i * 45;
    const g = placeOffset(habGroup, Math.sin(ang) * dist, Math.cos(ang) * dist, srand() * 6);
    const m = mkBox(1.4 + srand(), 0.5, 1.0 + srand(), 0x8a8a92, 0, 0.25, 0, g);
    m.rotation.z = srand() * 0.5;
    World.pods.push({ group: g, kind: 'debris', taken: false, loot: { scrap: 2 }, label: 'Salvage MDV debris' });
  }
  const rtg = placeOffset(habGroup, -420, 590, 0);
  const rtgModel = buildModel('rtgUnit');
  rtgModel.rotation.z = 0.25;
  rtg.add(rtgModel);
  World.rtgSite = { group: rtg, taken: false };
}

// place a child group at a local tangent offset from a parent site, re-snapped to the terrain
function placeOffset(parentGroup, lx, lz, yaw) {
  const w = new THREE.Vector3(lx, 0, lz).applyQuaternion(parentGroup.quaternion).add(parentGroup.position);
  const u = w.normalize().clone();
  const g = new THREE.Group();
  g.position.copy(u).multiplyScalar(surfaceAt(u));
  frameQuat(u, yaw || 0, g.quaternion);
  g.userData.up = u.clone();
  worldRoot.add(g);
  return g;
}

function addFarmPlot(parent, px, pz, collide) {
  const plot = new THREE.Group();
  plot.position.set(px, 0.06, pz);
  parent.add(plot);
  mkBox(1.6, 0.34, 1.9, 0x6b6459, 0, 0.17, 0, plot);
  const soil = mkBox(1.42, 0.3, 1.72, 0x3a2418, 0, 0.24, 0, plot);
  soil.visible = false;
  const plants = new THREE.Group();
  plants.position.y = 0.4;
  plot.add(plants);
  for (let p = 0; p < 4; p++) {
    const stem = mkCyl(0.02, 0.03, 0.3, 0x3f7a2f, (p % 2) * 0.7 - 0.35, 0.15, Math.floor(p / 2) * 0.8 - 0.4, plants, 6);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0x4e9a3a }));
    leaf.position.y = 0.32; leaf.scale.y = 0.75;
    stem.add(leaf);
  }
  plants.visible = false;
  if (collide) addColliderAt(parent, px, pz, 0.85);
  const worldPos = new THREE.Vector3(px, 0, pz).applyQuaternion(parent.quaternion).add(parent.position);
  World.plots.push({ group: plot, soilMesh: soil, plants, worldPos,
    state: 'empty', crop: 'potato', growth: 0, watered: 0 });
  return World.plots[World.plots.length - 1];
}

// ============================================================
// 10. ROVER, PATHFINDER, MAV, LANDERS, ICE
// ============================================================
function buildRover(group) {
  const model = buildModel('rover');
  group.add(model);
  const wheels = [];
  for (let i = 0; i < 6; i++) wheels.push(model.getObjectByName('wheel' + i));
  const hl = new THREE.SpotLight(0xfff2d8, 0, 60, 0.5, 0.4);
  hl.position.set(0, 1.6, -2.1);
  group.add(hl);
  const hlT = new THREE.Object3D(); hlT.position.set(0, 0.6, -14);
  group.add(hlT); hl.target = hlT;
  World.rover = { group, wheels, headlight: hl, speed: 0 };
  World.roverCollider = { v: group.position.clone().normalize(), r: 2.6 };
  colliders.push(World.roverCollider);
}

function buildStorySites() {
  // Pathfinder at its real landing site (Ares Vallis)
  const pf = placeAt(19.13, 326.79, 0.7);
  pf.add(buildModel('pathfinder'));
  World.pathfinder = pf;
  World.pfCollider = { v: pf.position.clone().normalize(), r: 2.2 };
  colliders.push(World.pfCollider);

  // Ares 4 MAV waits inside Schiaparelli crater
  const mav = placeAt(-1.9, 15.9, 0);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(7, 24),
    new THREE.MeshLambertMaterial({ color: 0x5a5a5a }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.08;
  mav.add(pad);
  const rocket = buildModel('mav');
  rocket.position.y = 0.1;
  mav.add(rocket);
  World.mavNose = rocket.getObjectByName('nose');
  World.mavStrobe = rocket.getObjectByName('strobe');
  const flame = mkCyl(0.9, 0.25, 5, 0xffc060, 0, -1.8, 0, rocket, 10,
    { emissive: 0xff9030, transparent: true, opacity: 0.95 });
  flame.visible = false;
  World.mavFlame = flame;
  World.mav = mav;
  World.mavRocket = rocket;
  colliders.push({ v: mav.position.clone().normalize(), r: 3.4 });

  // every real lander, at its real coordinates
  for (const L of LANDERS) {
    if (L.name === 'Pathfinder') { World.landers.push({ data: L, group: pf }); continue; }
    const g = placeAt(L.lat, L.lon, srand() * 6);
    const isRover = ['Spirit', 'Opportunity', 'Curiosity', 'Perseverance', 'Zhurong', 'Sojourner'].includes(L.name);
    g.add(buildModel(isRover ? 'roverGeneric' : 'landerGeneric', 0.85 + hash3(L.lat | 0, L.lon | 0, 7) * 0.4));
    if (L.name === 'Perseverance') {   // Ingenuity!
      mkBox(0.42, 0.14, 0.42, 0x9ab0c0, 2.4, 0.28, 1.5, g);
      mkBox(1.0, 0.03, 0.12, 0x2a2a2a, 2.4, 0.44, 1.5, g).rotation.y = 0.7;
    }
    colliders.push({ v: g.position.clone().normalize(), r: 1.6 });
    World.landers.push({ data: L, group: g });
  }

  // ice deposits: Korolev + northern-lowland fields
  const iceSpots = [[72.77, 164.58]];
  for (let i = 0; i < 11; i++) iceSpots.push([42 + hash3(i, 7, 1) * 32, hash3(i, 3, 9) * 360]);
  for (const [la, lo] of iceSpots) {
    const g = placeAt(la, lo, 0);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + hash3(i, la, lo) * 0.8, 0),
        new THREE.MeshLambertMaterial({ color: 0xd8ecf4, emissive: 0x223038 }));
      m.position.set((hash3(i, 2, la) - 0.5) * 6, 0.3, (hash3(i, 5, lo) - 0.5) * 6);
      g.add(m);
    }
    World.iceSites.push({ group: g, left: 6, korolev: la > 70 });
  }
}

// deployable buildables
function buildDeployable(kind, atVec) {
  const g = placeAt(atVec);
  if (kind === 'solar') {
    g.add(buildModel('solarDeploy'));
  } else if (kind === 'greenhouse') {
    g.add(buildModel('greenhouse'));
    const fl = new THREE.Mesh(new THREE.CircleGeometry(4.1, 18),
      new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = 0.05;
    g.add(fl);
    for (let i = 0; i < 4; i++)
      addFarmPlot(g, -1.1 + (i % 2) * 2.2, -1.2 + Math.floor(i / 2) * 2.4, false);
  } else if (kind === 'beacon') {
    g.add(buildModel('beacon'));
  } else if (kind === 'cache') {
    g.add(buildModel('o2cache'));
  }
  const b = { kind, group: g, v: g.position.clone().normalize(), charges: kind === 'cache' ? 3 : 0 };
  World.builtMeshes.push(b);
  return b;
}

// supply pod (quest rewards) — lands near the hab
function dropSupplyPod(loot, label) {
  const ang = srand() * Math.PI * 2, dist = 40 + srand() * 30;
  const g = placeOffset(habGroup, Math.sin(ang) * dist, Math.cos(ang) * dist, 0);
  g.add(buildModel('supplyPod'));
  const pod = { group: g, kind: 'pod', taken: false, loot, label: label || 'Open supply pod' };
  World.pods.push(pod);
  Snd.jingle();
  log('Supply pod down, ' + Math.round(dist) + 'm out. NASA delivers. No tip expected.', 'nasa');
  return pod;
}

// ============================================================
// 11. MATH-SPACE FRAME HELPERS (never read THREE matrixWorld —
//     worldRoot shifts every frame for camera-relative rendering)
// ============================================================
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
function siteLocalToWorld(group, lx, ly, lz, out) {
  return (out || new THREE.Vector3()).set(lx, ly, lz).applyQuaternion(group.quaternion).add(group.position);
}
function siteWorldToLocal(group, p, out) {
  out = (out || new THREE.Vector3()).copy(p).sub(group.position);
  return out.applyQuaternion(_q1.copy(group.quaternion).invert());
}

// ============================================================
// 12. INPUT
// ============================================================
const keys = {};
let eHeld = false;
window.addEventListener('keydown', (ev) => {
  if (ev.repeat) return;
  const k = ev.key.toLowerCase();
  keys[k] = true;
  if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) ev.preventDefault();
  if (k === 'e') eHeld = true;
  if (!S.started || S.over || S.mode === 'cutscene') return;
  if (k === 'escape') {
    if (screenOpen()) closeScreens();
    else if (!S.uiOpen) showPause();
  }
  if (k === 'f' && S.mode === 'rover' && !S.uiOpen && !screenOpen()) exitRover();
  if (!S.uiOpen && !S.flags.coldOpen) {
    if (k === 'm') toggleScreen('map');
    if (k === 'c') toggleScreen('colony');
    if (k === 'j') toggleScreen('journal');
  }
});
window.addEventListener('keyup', (ev) => {
  const k = ev.key.toLowerCase();
  keys[k] = false;
  if (k === 'e') { eHeld = false; S.holdT = 0; }
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; eHeld = false; });

// dragMode is a recoverable fallback, not a one-way latch: any successful lock clears it
let pointerLocked = false, dragMode = false, dragging = false, lastMX = 0, lastMY = 0;
function tryLock() {
  if (S.uiOpen || screenOpen()) return;
  try {
    const p = renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock();
    if (p && p.catch) p.catch(() => { dragMode = true; });
    setTimeout(() => { if (!pointerLocked && !S.uiOpen && !screenOpen()) dragMode = true; }, 700);
  } catch (e) { dragMode = true; }
}
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  if (pointerLocked) dragMode = false;
  if (!pointerLocked && S.started && !S.uiOpen && !screenOpen() && !S.over && S.mode !== 'cutscene') showPause();
});
document.addEventListener('pointerlockerror', () => { dragMode = true; });
renderer.domElement.addEventListener('mousedown', (ev) => {
  if (!S.started || S.uiOpen || screenOpen()) return;
  if (!pointerLocked) tryLock();
  if (dragMode) { dragging = true; lastMX = ev.clientX; lastMY = ev.clientY; }
});
window.addEventListener('mouseup', () => { dragging = false; });
let yawInput = 0, pitchInput = 0;
window.addEventListener('mousemove', (ev) => {
  if (!S.started || S.uiOpen || screenOpen() || S.mode === 'cutscene') return;
  let dx = 0, dy = 0;
  if (pointerLocked) { dx = ev.movementX || 0; dy = ev.movementY || 0; }
  else if (dragMode && dragging) {
    dx = ev.clientX - lastMX; dy = ev.clientY - lastMY;
    lastMX = ev.clientX; lastMY = ev.clientY;
  } else return;
  yawInput -= dx * 0.0024;
  pitchInput -= dy * 0.0022;
});

// ============================================================
// 13. PLAYER — body-frame quaternion on the sphere
// ============================================================
const player = {
  q: new THREE.Quaternion(),        // local +Y = up, -Z = facing
  pitch: -0.05, alt: 0, vy: 0, onGround: true, bob: 0,
  pos: new THREE.Vector3(),         // world position (feet), derived each frame
  up: new THREE.Vector3(0, 1, 0),
  eyeH: 1.62,
};
function initPlayerAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, player.q);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
}
function syncPlayerPos() {
  player.up.set(0, 1, 0).applyQuaternion(player.q);
  const ground = surfaceAt(player.up);
  player.pos.copy(player.up).multiplyScalar(ground + player.alt);
}
const _axis = new THREE.Vector3();
function frameMove(q, vx, vz, dist, radius) {
  // move the body frame along the local (vx, 0, vz) direction by dist meters
  _axis.set(vz, 0, -vx);
  if (_axis.lengthSq() < 1e-12) return;
  _axis.normalize();
  q.multiply(_q2.setFromAxisAngle(_axis, dist / radius));
}
function frameYaw(q, dYaw) {
  q.multiply(_q2.setFromAxisAngle(Y_AXIS, dYaw));
}

// collision: push the player's unit direction out of collider discs (tangent-plane approx)
function collideUnit(q, radius) {
  _v1.set(0, 1, 0).applyQuaternion(q);              // current up
  let moved = false;
  const test = (cv, cr) => {
    const sep = angDist(_v1.x, _v1.y, _v1.z, cv.x, cv.y, cv.z) * R;
    const min = cr + radius;
    if (sep < min && sep > 0.01) {
      _v2.copy(_v1).sub(_v3.copy(cv).multiplyScalar(_v1.dot(cv)));   // tangent away-dir at collider
      if (_v2.lengthSq() < 1e-12) return;
      _v2.normalize();
      _v3.copy(cv).multiplyScalar(R).addScaledVector(_v2, min);      // pushed-out point (chord space)
      _v3.normalize();
      _q1.setFromUnitVectors(_v1, _v3);
      q.premultiply(_q1);
      _v1.set(0, 1, 0).applyQuaternion(q);
      moved = true;
    }
  };
  for (const c of colliders) {
    if (S.mode === 'rover' && c === World.roverCollider) continue;
    test(c.v, c.r);
  }
  for (const c of rockColliders) test(c.v, c.r);
  // hab wall ring with a door gap, in hab-local space
  if (habGroup) {
    siteWorldToLocal(habGroup, _v2.copy(_v1).multiplyScalar(surfaceAt(_v1)), _v3);
    const hd = Math.hypot(_v3.x, _v3.z);
    const wallHalf = 0.55 + radius * 0.5;
    if (Math.abs(hd - HAB_R) < wallHalf && hd > 0.001 && Math.abs(_v3.y) < 5) {
      const ang = Math.atan2(_v3.x, _v3.z);
      if (Math.abs(ang) > DOOR_HALF + 0.06) {
        const target = hd < HAB_R ? HAB_R - wallHalf : HAB_R + wallHalf;
        _v3.x = _v3.x / hd * target; _v3.z = _v3.z / hd * target;
        siteLocalToWorld(habGroup, _v3.x, _v3.y, _v3.z, _v2);
        _v2.normalize();
        _q1.setFromUnitVectors(_v1, _v2);
        q.premultiply(_q1);
        moved = true;
      }
    }
  }
  return moved;
}

function updateWalk(dt) {
  frameYaw(player.q, yawInput);
  player.pitch = clamp(player.pitch + pitchInput, -1.45, 1.45);
  yawInput = 0; pitchInput = 0;
  const run = keys['shift'] && S.suit > 1;
  const spd = run ? BAL.runSpeed : BAL.walkSpeed;
  let mx = 0, mz = 0;
  if (keys['w'] || keys['arrowup']) mz -= 1;
  if (keys['s'] || keys['arrowdown']) mz += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  const moving = (mx || mz);
  if (moving) {
    const l = Math.hypot(mx, mz);
    const dist = spd * dt;
    frameMove(player.q, mx / l, mz / l, dist, R + player.alt);
    player.bob += dt * (run ? 11 : 7);
    S.stats.walked += dist;
  }
  collideUnit(player.q, 0.42);
  player.q.normalize();
  // gravity & jump
  if (player.onGround && keys[' ']) { player.vy = BAL.jumpV; player.onGround = false; }
  player.vy -= BAL.gravity * dt;
  player.alt += player.vy * dt;
  if (player.alt <= 0) { player.alt = 0; player.vy = 0; player.onGround = true; }
  syncPlayerPos();
  // camera
  const bobY = (moving && player.onGround) ? Math.sin(player.bob) * 0.055 : 0;
  CAM.pos.copy(player.pos).addScaledVector(player.up, player.eyeH + bobY);
  CAM.quat.copy(player.q).multiply(_q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), player.pitch));
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    CAM.pos.addScaledVector(_v1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.4);
  }
  const targetFov = (moving && run) ? 80 : 72;
  camera.fov = lerp(camera.fov, targetFov, 1 - Math.pow(0.001, dt));
  camera.updateProjectionMatrix();
  // inside-hab detection (hab-local cylinder)
  if (habGroup) {
    siteWorldToLocal(habGroup, player.pos, _v3);
    S.inside = Math.hypot(_v3.x, _v3.z) < HAB_R - 0.3 && _v3.y < 4;
  }
  // greenhouse interiors count as inside too (for farming)
  if (!S.inside) {
    for (const b of World.builtMeshes) {
      if (b.kind === 'greenhouse' && groundDist(player.pos, b.group.position) < 4.0) { S.inside = true; break; }
    }
  }
}

// ============================================================
// 14. ROVER — same frame math, chase camera, its own supplies
// ============================================================
const roverF = { q: new THREE.Quaternion(), speed: 0, camPos: new THREE.Vector3(), camInit: false };
function initRoverAt(unitVec, yaw) {
  frameQuat(_v1.copy(unitVec).normalize(), yaw || 0, roverF.q);
  syncRoverVisual(0);
}
function roverUp(out) { return out.set(0, 1, 0).applyQuaternion(roverF.q); }
function syncRoverVisual(dt) {
  const G = World.rover.group;
  roverUp(_v1);
  const ground = surfaceAt(_v1);
  G.position.copy(_v1).multiplyScalar(ground);
  // sample terrain fore/aft/side for a visual tilt
  _v2.set(0, 0, -1).applyQuaternion(roverF.q);      // forward
  _v3.crossVectors(_v2, _v1).negate();              // right? (up x fwd)
  const s = 2.0;
  const hF = surfaceAt(_pv.copy(G.position).addScaledVector(_v2, s));
  const hB = surfaceAt(_pv.copy(G.position).addScaledVector(_v2, -s));
  const hR = surfaceAt(_pv.copy(G.position).addScaledVector(_v3, 1.4));
  const hL = surfaceAt(_pv.copy(G.position).addScaledVector(_v3, -1.4));
  const pitch = Math.atan2(hF - hB, 2 * s), roll = Math.atan2(hL - hR, 2.8);
  G.quaternion.copy(roverF.q)
    .multiply(_q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch))
    .multiply(_q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll));
  World.roverCollider.v.copy(_v1);
}
function enterRover() {
  S.mode = 'rover';
  roverF.camInit = false;
  Snd.click();
}
function exitRover() {
  S.mode = 'walk';
  player.q.copy(roverF.q);
  frameMove(player.q, 1, 0, 3.2, R);                // step out to the side
  collideUnit(player.q, 0.42);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
  Snd.click();
}
function updateRover(dt) {
  const RV = roverF;
  const top = S.roverPower > 0.5 ? roverTopSpeed() : 6;   // dead battery = emergency crawl
  let acc = 0;
  if (keys['w'] || keys['arrowup']) acc = 14;
  if (keys['s'] || keys['arrowdown']) acc = -9;
  RV.speed += acc * dt;
  RV.speed *= Math.pow(0.4, dt);
  RV.speed = clamp(RV.speed, -8, top);
  const steer = ((keys['a'] || keys['arrowleft']) ? 1 : 0) - ((keys['d'] || keys['arrowright']) ? 1 : 0);
  if (Math.abs(RV.speed) > 0.4)
    frameYaw(RV.q, steer * dt * 1.5 * clamp(Math.abs(RV.speed) / 8, 0.3, 1) * Math.sign(RV.speed));
  if (Math.abs(RV.speed) > 0.01) {
    frameMove(RV.q, 0, -Math.sign(RV.speed), Math.abs(RV.speed) * dt, R);
    S.stats.driven += Math.abs(RV.speed) * dt;
  }
  const hadHit = collideUnit(RV.q, 2.0);
  if (hadHit) RV.speed *= 0.5;
  RV.q.normalize();
  syncRoverVisual(dt);
  // keep the player frame glued to the rover so map/objectives/clock stay live
  player.q.copy(RV.q);
  player.alt = 0; player.vy = 0;
  syncPlayerPos();
  // rover power: drains while driving (worse at night), trickle solar when parked in daylight
  const sunEl = _v1.set(0, 1, 0).applyQuaternion(RV.q).dot(sunDir);
  const night = sunEl < 0.05;
  if (Math.abs(RV.speed) > 0.5) {
    let drain = (BAL.roverDrainPerMin / 60) * (0.5 + Math.abs(RV.speed) / roverTopSpeed());
    if (night) drain *= S.upgrades.roverBattery ? 1.5 : 2;
    S.roverPower = clamp(S.roverPower - drain * dt, 0, roverPowerCap());
  } else if (!night) {
    S.roverPower = clamp(S.roverPower + (2 / 60) * sunEl * dt, 0, roverPowerCap());
  }
  World.rover.headlight.intensity = (night || S.storm.i > 0.5) ? 2.2 : 0;
  for (const w of World.rover.wheels) w.rotation.x -= RV.speed * dt * 1.8;
  // chase camera (smoothed in world space)
  roverUp(_v1);
  _v2.set(0, 0, -1).applyQuaternion(RV.q);
  _pv.copy(World.rover.group.position).addScaledVector(_v2, -9.5).addScaledVector(_v1, 4.6);
  if (!RV.camInit) { RV.camPos.copy(_pv); RV.camInit = true; }
  RV.camPos.lerp(_pv, 1 - Math.pow(0.0005, dt));
  CAM.pos.copy(RV.camPos);
  camLookAt(_v3.copy(World.rover.group.position).addScaledVector(_v1, 1.8), _v1);
  camera.fov = lerp(camera.fov, 74 + Math.abs(RV.speed) * 0.25, 1 - Math.pow(0.001, dt));
  camera.updateProjectionMatrix();
  S.inside = false;
  if (Math.random() < dt * 8 && Math.abs(RV.speed) > 2) Snd.beep(55 + Math.random() * 20, 0.08, 'sawtooth', 0.03);
}

// keep the physical rover collider position in sync even while on foot
function playerUnit() { return _du.copy(player.pos).normalize(); }

// ============================================================
// 15. INVENTORY, RECIPES, UPGRADES
// ============================================================
const ITEM_NAMES = {
  scrap: 'Scrap Metal', circuit: 'Circuit Board', regolith: 'Regolith', ice: 'Ice Chunk',
  candle: 'O2 Candle', kitSolar: 'Solar Panel Kit', kitGreenhouse: 'Greenhouse Kit',
  kitBeacon: 'Nav Beacon Kit', kitCache: 'O2 Cache Kit',
};
const RECIPES = [
  { id: 'candle', name: 'O2 Candle', desc: '+40 suit O2 in the field (press X)', cost: { scrap: 2, regolith: 1 }, gives: { candle: 1 } },
  { id: 'meltIce', name: 'Melt Ice', desc: '+10L water (uses 2 PWR)', cost: { ice: 1 }, run: () => {
      if (S.power < 2) return 'Not enough hab power';
      S.power -= 2; S.water = clamp(S.water + BAL.iceWater, 0, BAL.waterMax);
      return true;
    } },
  { id: 'kitSolar', name: 'Portable Solar Panel', desc: 'Deployable: recharges the rover nearby; boosts hab power if placed at home', cost: { scrap: 4, circuit: 1 }, gives: { kitSolar: 1 } },
  { id: 'kitGreenhouse', name: 'Greenhouse Dome', desc: 'Deployable: 4 farm plots, anywhere on Mars', cost: { scrap: 8, circuit: 2 }, gives: { kitGreenhouse: 1 } },
  { id: 'kitBeacon', name: 'Nav Beacon', desc: 'Deployable: permanent map + compass marker', cost: { scrap: 2, circuit: 1 }, gives: { kitBeacon: 1 } },
  { id: 'kitCache', name: 'O2 Cache', desc: 'Deployable: 3 suit-O2 refills in the field', cost: { scrap: 3, candle: 1 }, gives: { kitCache: 1 } },
];
const UPGRADES = [
  { id: 'drive1', name: 'Rover Drivetrain I', desc: 'Top speed 35 → 45 m/s', cost: { scrap: 6, circuit: 1 } },
  { id: 'drive2', name: 'Rover Drivetrain II', desc: 'Top speed 45 → 55 m/s', cost: { scrap: 10, circuit: 2 }, bp: 'drive2', needs: 'drive1' },
  { id: 'roverBattery', name: 'Rover Battery Bank', desc: 'Rover power 100 → 160, night drain −25%', cost: { scrap: 8, circuit: 1 } },
  { id: 'tank1', name: 'Suit Tank I', desc: 'Suit O2 100 → 150', cost: { scrap: 4 } },
  { id: 'tank2', name: 'Suit Tank II', desc: 'Suit O2 150 → 200', cost: { scrap: 8, circuit: 1 }, bp: 'tank2', needs: 'tank1' },
  { id: 'recycler', name: 'Suit CO2 Recycler', desc: 'EVA O2 drain −25%', cost: { scrap: 6, circuit: 2 }, bp: 'recycler' },
  { id: 'insulation', name: 'Hab Insulation', desc: 'Hab base power draw −30%', cost: { scrap: 6 } },
  { id: 'wiper', name: 'Panel Auto-Wiper', desc: 'Panel dust accrual −70%', cost: { scrap: 5, circuit: 1 } },
  { id: 'drill', name: 'Ice Drill', desc: 'Unlocks mining at ice deposits', cost: { scrap: 4, circuit: 1 }, bp: 'drill' },
  { id: 'rtg', name: 'Socket the RTG', desc: 'Cold stops draining power; +6 PWR/sol at night', cost: {}, needsRtg: true },
];
function hasCost(cost) {
  for (const k in cost) if ((S.inv[k] || 0) < cost[k]) return false;
  return true;
}
function payCost(cost) { for (const k in cost) S.inv[k] -= cost[k]; }
function costStr(cost) {
  const parts = Object.keys(cost).map(k => `${cost[k]} ${ITEM_NAMES[k] || k}`);
  return parts.length ? parts.join(' + ') : 'free';
}
function gainLoot(loot) {
  const got = [];
  for (const k in loot) {
    if (k === 'rations') { S.food += loot[k]; got.push(`${loot[k]} rations`); }
    else if (k === 'water') { S.water = clamp(S.water + loot[k], 0, BAL.waterMax); got.push(`${loot[k]}L water`); }
    else if (k === 'hydrazine') { S.hydrazine += loot[k]; got.push(`${loot[k]} hydrazine`); }
    else { S.inv[k] = (S.inv[k] || 0) + loot[k]; got.push(`${loot[k]} ${ITEM_NAMES[k] || k}`); }
  }
  Snd.pickup();
  return got.join(', ');
}
function nearHab() { return habGroup && groundDist(player.pos, habGroup.position) < 120; }

// O2 candle hotkey
window.addEventListener('keydown', (ev) => {
  if (ev.key.toLowerCase() !== 'x' || !S.started || S.uiOpen || screenOpen() || S.over) return;
  if ((S.inv.candle || 0) > 0 && S.suit < suitCap() - 5) {
    S.inv.candle--;
    S.suit = clamp(S.suit + 40, 0, suitCap());
    Snd.ok();
    log('Cracked an O2 candle. Chemistry: still my favorite roommate.');
  }
});

// ============================================================
// 16. INTERACTION SYSTEM
// ============================================================
const interactables = [];
function addI(def) { interactables.push(def); if (def.priority === undefined) def.priority = 0; }

let activeI = null, lastActiveI = null;
function updateInteract(dt) {
  activeI = null;
  if (S.uiOpen || screenOpen() || S.over || S.mode === 'cutscene') { UI.prompt.style.display = 'none'; return; }
  let best = null, bestD = 1e9, bestP = 1e9;
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  for (const it of interactables) {
    if (it.mode && it.mode !== S.mode) continue;
    if (it.visible && !it.visible()) continue;
    const p = it.pos();
    if (!p) continue;
    const d = groundDist(pp, p);
    if (d > it.r) continue;
    if (it.priority < bestP || (it.priority === bestP && d < bestD)) { bestP = it.priority; bestD = d; best = it; }
  }
  if (!best) { UI.prompt.style.display = 'none'; UI.promptSub.textContent = ''; S.holdT = 0; lastActiveI = null; return; }
  activeI = best;
  if (best !== lastActiveI) { S.holdT = 0; lastActiveI = best; }
  const en = best.enabled ? best.enabled() : true;
  UI.prompt.style.display = 'block';
  UI.promptSub.textContent = best.sub ? best.sub() : '';
  if (en !== true) {
    UI.promptText.innerHTML = `<span style="opacity:.75">${typeof en === 'string' ? en : best.label()}</span>`;
    UI.hold.style.display = 'none';
    S.holdT = 0;
    return;
  }
  UI.promptText.innerHTML = `<span class="key">E</span>${best.hold > 0.7 ? 'HOLD — ' : ''}${best.label()}`;
  if (eHeld) {
    S.holdT += dt;
    UI.hold.style.display = 'block';
    UI.holdFill.style.width = clamp(S.holdT / best.hold * 100, 0, 100) + '%';
    if (S.holdT >= best.hold) {
      S.holdT = 0; eHeld = false;
      UI.hold.style.display = 'none';
      best.use();
    }
  } else {
    S.holdT = 0;
    UI.hold.style.display = 'none';
  }
}

// ============================================================
// 17. FARMING (shared by hab plots and greenhouse plots)
// ============================================================
function syncPlot(pl) {
  pl.soilMesh.visible = pl.state !== 'empty';
  pl.plants.visible = pl.state === 'growing' || pl.state === 'ready' || pl.state === 'dead';
  const s = 0.25 + pl.growth * 1.05;
  pl.plants.scale.set(s, s, s);
  pl.plants.traverse((o) => {
    if (o.material) {
      if (pl.state === 'dead') o.material.color.set(0x5a4a30);
      else if (pl.state === 'ready') o.material.color.set(o.geometry.type === 'SphereGeometry' ? 0x76c04a : 0x4e8a3a);
      else o.material.color.set(o.geometry.type === 'SphereGeometry' ? 0x4e9a3a : 0x3f7a2f);
    }
  });
}
function plantedPlots() { return World.plots.filter(p => p.state === 'growing' || p.state === 'ready').length; }
function nearestPlot() {
  let best = null, bestD = 2.2;
  for (const pl of World.plots) {
    if (!pl.worldPos) continue;
    const d = groundDist(player.pos, pl.worldPos);
    if (d < bestD) { bestD = d; best = pl; }
  }
  return best;
}
addI({
  pos: () => { const pl = nearestPlot(); return pl ? pl.worldPos : null; },
  r: 2.2, hold: 1.3, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    const pl = nearestPlot(); if (!pl) return false;
    switch (pl.state) {
      case 'empty': return S.inv.regolith > 0 ? true : 'Needs soil — dig regolith outside';
      case 'soil': return (S.food + S.potatoes) > 0 ? (S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)') : 'No seed potato left';
      case 'growing':
        if (pl.watered < BAL.waterings && pl.growth >= 0.42) return S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)';
        return `Growing — ${Math.round(pl.growth * 100)}%`;
      case 'ready': case 'dead': return true;
    }
    return false;
  },
  label: () => {
    const pl = nearestPlot(); if (!pl) return '';
    switch (pl.state) {
      case 'empty': return 'Fill bed with regolith';
      case 'soil': return `Plant seed potato (1 ${S.potatoes > 0 ? 'potato' : 'ration'}, 5L water)`;
      case 'growing': return 'Water the plants (5L)';
      case 'ready': return 'Harvest potatoes';
      case 'dead': return 'Clear out the dead crop';
    }
    return '';
  },
  use: () => {
    const pl = nearestPlot(); if (!pl) return;
    switch (pl.state) {
      case 'empty':
        S.inv.regolith--; pl.state = 'soil';
        break;
      case 'soil':
        if (S.potatoes > 0) S.potatoes--; else S.food--;
        S.water -= BAL.waterPerDose;
        pl.state = 'growing'; pl.growth = 0.04; pl.watered = 1;
        if (plantedPlots() === 1) log('Planted. Grow, little guy. No pressure, but you\'re the food supply.');
        break;
      case 'growing':
        S.water -= BAL.waterPerDose; pl.watered++;
        break;
      case 'ready':
        pl.state = 'soil'; pl.growth = 0; pl.watered = 0;
        S.potatoes += BAL.potatoYield;
        S.stats.potatoes += BAL.potatoYield;
        Snd.jingle();
        if (S.stats.potatoes === BAL.potatoYield) log('First harvest. I am the greatest botanist on this planet. Fear me.');
        checkAchievements();
        break;
      case 'dead':
        pl.state = 'soil'; pl.growth = 0; pl.watered = 0;
        break;
    }
    Snd.ok();
    syncPlot(pl);
  },
});

// ============================================================
// 18. WORLD INTERACTABLES
// ============================================================
// cold open: seal the suit at the hab door
addI({
  pos: () => siteLocalToWorld(habGroup, 0, 0, HAB_R + 1.6, _v2),
  r: 3.4, hold: 2.2, mode: 'walk',
  visible: () => S.flags.coldOpen,
  label: () => 'Pull the antenna. Seal the suit.',
  use: () => {
    S.flags.coldOpen = false;
    S.flags.suitSealed = true;
    S.suit = suitCap();
    S.shake = 1.2;
    flashScreen('rgba(255,60,40,0.35)', 350);
    Snd.boom(); setTimeout(() => Snd.ok(), 600);
    setTimeout(() => log('Suit resealed. O2 refilling. Ow. OW. Okay. Inventory time.', 'sys'), 300);
    setTimeout(() => log(SOL_LOGS[1]), 1000);
  },
});
function addInspect(id, lx, lz, name, doneLine) {
  addI({
    pos: () => siteLocalToWorld(habGroup, lx, 0, lz, _v2),
    r: 2.6, hold: 0.7, mode: 'walk',
    visible: () => S.started && !S.flags.coldOpen && !S.checkedSystems[id],
    label: () => `Inspect the ${name}`,
    use: () => { S.checkedSystems[id] = true; Snd.ok(); log(doneLine); },
  });
}
addInspect('oxy', 5.6, -3.6, 'oxygenator',
  'Oxygenator: alive. It eats CO2 and power, makes air. My favorite roommate.');
addInspect('rec', 5.9, -0.4, 'water reclaimer',
  'Water reclaimer: functional. Yes, it recycles what you think it recycles. No, we don\'t discuss it.');
// NOTE: world arrays (panels, piles, landers, ice) fill AFTER world build —
// these interactables resolve their nearest target dynamically at query time.
function nearestOf(list, posOf, maxD, filter) {
  let best = null, bestD = maxD;
  for (const item of list) {
    if (filter && !filter(item)) continue;
    const d = groundDist(player.pos, posOf(item));
    if (d < bestD) { bestD = d; best = item; }
  }
  return best;
}
// solar panels
function panelPos(p) {
  return _v3.copy(p.group.position).applyQuaternion(World.solarGroup.quaternion).add(World.solarGroup.position);
}
addI({
  pos: () => {
    const p = nearestOf(World.panels, panelPos, 3.0);
    return p ? panelPos(World._activePanel = p) : null;
  },
  r: 3.0, hold: 1.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  enabled: () => World._activePanel && World._activePanel.dust > 0.06 ? true : 'Panel is clean',
  label: () => `Wipe solar panel (${Math.round((1 - (World._activePanel ? World._activePanel.dust : 0)) * 100)}% output)`,
  use: () => {
    const p = World._activePanel;
    if (!p) return;
    p.dust = 0;
    S.stats.panels++;
    syncAllVisuals();
    Snd.ok();
    if (S.stats.panels === 1) log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.');
  },
});
// regolith piles (fast) + dig-anywhere (slow, lowest priority)
addI({
  pos: () => {
    const sp = nearestOf(World.soilPiles, s => s.group.position, 2.8, s => s.left > 0);
    return sp ? (World._activePile = sp).group.position : null;
  },
  r: 2.8, hold: 1.4, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => 'Dig regolith (+1)',
  use: () => {
    const sp = World._activePile;
    if (!sp || sp.left <= 0) return;
    sp.left--; S.inv.regolith++;
    syncAllVisuals();
    Snd.pickup();
  },
});
addI({
  pos: () => player.pos, r: 99, hold: 2.6, mode: 'walk', priority: 9,
  visible: () => !S.flags.coldOpen && !S.inside && S.flags.didMath,
  label: () => 'Dig regolith here (+1, slow)',
  use: () => { S.inv.regolith++; Snd.pickup(); },
});
// hydrazine rig
addI({
  pos: () => siteLocalToWorld(habGroup, 5.5, 0, 2.6, _v2),
  r: 2.4, hold: 2.0, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => S.hydrazine > 0 ? true : 'Hydrazine tank is empty',
  label: () => `Burn hydrazine for water (+${BAL.hydrazineWater}L) — ${S.hydrazine} left`,
  use: () => {
    S.hydrazine--;
    S.water = clamp(S.water + BAL.hydrazineWater, 0, BAL.waterMax);
    World.hydFlame.visible = true;
    setTimeout(() => { World.hydFlame.visible = false; }, 2600);
    if (!S.flags.hydrazineBoom) {
      S.flags.hydrazineBoom = true;
      S.stats.booms++;
      setTimeout(() => {
        S.shake = 1.6;
        S.o2 = clamp(S.o2 - 7, 0, 100);
        flashScreen('rgba(255,180,80,0.75)', 500);
        Snd.boom();
        log('So. Small fireball. Eyebrows: gone. Water: acquired. Science!');
      }, 1200);
      log('Burning rocket fuel indoors. What could possibly go wrong?');
    } else {
      S.stats.booms++;
      Snd.ok();
      log(`+${BAL.hydrazineWater}L water. Eyebrow count stable. Progress.`);
      checkAchievements();
    }
  },
});
// bunk
addI({
  pos: () => siteLocalToWorld(habGroup, -5.0, 0, -4.9, _v2),
  r: 2.3, hold: 1.2, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    if (S.breach.active) return 'Not with the Hab screaming, no';
    if (localSunEl() > 0.25) return 'Too much daylight to waste';
    return true;
  },
  label: () => 'Sleep until dawn',
  use: () => sleepToDawn(false),
});
// shelf
addI({
  pos: () => siteLocalToWorld(habGroup, 4.2, 0, 4.8, _v2),
  r: 2.2, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => S.health > 92 ? 'Not hungry right now' : (S.potatoes > 0 || S.food > 0) ? true : 'The shelf is bare',
  label: () => `Eat a ${S.potatoes > 0 ? 'potato. Again.' : 'ration'} (+12 vitals)`,
  use: () => {
    if (S.potatoes > 0) S.potatoes--; else S.food--;
    S.health = clamp(S.health + 12, 0, BAL.healthMax);
    Snd.ok();
  },
});
// comms desk: the math, NASA chatter, disco
addI({
  pos: () => siteLocalToWorld(habGroup, 0, 0, -6.6, _v2),
  r: 2.4, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && !S.flags.didMath,
  label: () => 'Run the numbers',
  use: () => {
    S.flags.didMath = true;
    Snd.ok();
    log(`${S.food} rations. Rescue window: Sol ${S.rescueSol}. The math says: farm or starve. I'm going to have to science the sh*t out of this.`);
  },
});
addI({
  pos: () => siteLocalToWorld(habGroup, -0.9, 0, -6.4, _v2),
  r: 2.2, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => 'Message NASA',
  use: () => {
    const lines = [
      'Please tell Commander Lewis her taste in music is a war crime. — M.W.',
      'Status: alive. Potatoes: thriving. Dignity: pending. — M.W.',
      'NASA says the whole world is watching. Waved at the sky. Felt weird. Did it again.',
      'Asked NASA for pizza. Received an orbital mechanics refresher. Same thing, apparently.',
      'NASA reminds me everything I type is broadcast live to Earth. So. Hi, Mom.',
    ];
    Snd.ok();
    log(lines[(S.flags.nasaMsg = (S.flags.nasaMsg + 1)) % lines.length], 'nasa');
  },
});
addI({
  pos: () => siteLocalToWorld(habGroup, 0.9, 0, -6.4, _v2),
  r: 2.2, hold: 0.6, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => S.disco ? 'Mercifully stop the disco' : "Play Lewis's disco playlist",
  use: () => {
    S.disco = !S.disco;
    Snd.disco(S.disco);
    log(S.disco ? 'Disco: ON. I hate it. ...It\'s growing on me. I hate that more.' : 'Disco: OFF. Blessed silence.');
  },
});
// workbench — opens the colony screen
addI({
  pos: () => siteLocalToWorld(habGroup, -4.6, 0, 3.9, _v2),
  r: 2.4, hold: 0.5, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  label: () => 'Use the fabricator [C]',
  use: () => toggleScreen('colony'),
});
// rover enter + exit + camp
addI({
  pos: () => World.rover.group.position,
  r: 3.8, hold: 0.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => 'Drive the rover',
  sub: () => `PWR ${Math.round(S.roverPower)}/${roverPowerCap()} · O2 tank ${Math.round(S.roverO2)}`,
  use: () => enterRover(),
});
addI({
  pos: () => World.rover.group.position, r: 1e9, hold: 0.4, mode: 'rover',
  visible: () => Math.abs(roverF.speed) < 1.5 && localSunEl() >= 0.05,
  label: () => 'Step out',
  use: () => exitRover(),
});
addI({
  pos: () => World.rover.group.position, r: 1e9, hold: 2.2, mode: 'rover',
  visible: () => Math.abs(roverF.speed) < 1.5 && localSunEl() < 0.05,
  label: () => 'Camp in the rover until dawn',
  sub: () => 'press F to step out instead',
  use: () => sleepToDawn(true),
});
// pathfinder pickup + uplink connect
addI({
  pos: () => World.pathfinder.position,
  r: 5.5, hold: 2.6, mode: 'walk',
  visible: () => S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected,
  enabled: () => groundDist(World.rover.group.position, World.pathfinder.position) < 20 ? true : 'Too heavy to carry — bring the rover closer',
  label: () => 'Dig out Pathfinder and load it up',
  use: () => {
    S.pf.loaded = true;
    S.pf.found = true;
    World.pfCollider.r = 0.001;
    syncAllVisuals();
    Snd.jingle();
    log('Hello, little guy. You\'ve been dead since 1997. Let\'s fix that. Next stop: home.');
  },
});
addI({
  pos: () => World.uplink.position,
  r: 5.0, hold: 2.6, mode: 'walk',
  visible: () => S.pf.loaded && !S.pf.connected,
  enabled: () => groundDist(World.rover.group.position, World.uplinkRing.position) < 9 ? true : 'Park the rover on the marked ring first',
  label: () => 'Connect Pathfinder to the uplink',
  use: () => connectPathfinder(),
});
// landers: salvage + quest hooks (dynamic — landers exist only after world build)
const LANDER_CIRCUITS = { 'Spirit': 3, 'Beagle 2': 1, 'InSight': 2, 'Curiosity': 1, 'Zhurong': 1, 'Opportunity': 2 };
addI({
  pos: () => {
    const rec = nearestOf(World.landers, l => l.group.position, 5.0,
      l => l.data.name !== 'Pathfinder' && !S.salvaged[l.data.name]);
    return rec ? (World._activeLander = rec).group.position : null;
  },
  r: 5.0, hold: 2.4, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => World._activeLander ? `Salvage ${World._activeLander.data.name} (${World._activeLander.data.year})` : '',
  use: () => {
    const rec = World._activeLander;
    if (!rec || S.salvaged[rec.data.name]) return;
    S.salvaged[rec.data.name] = true;
    const loot = { scrap: rec.data.scrap };
    if (LANDER_CIRCUITS[rec.data.name]) loot.circuit = LANDER_CIRCUITS[rec.data.name];
    const got = gainLoot(loot);
    log(`Salvaged ${rec.data.name}: ${got}. ${rec.data.note}`, 'disc');
    discover(rec.data.name, rec.data.note, true);
    onQuestEvent('salvage', rec.data.name);
    checkAchievements();
  },
});
// ice deposits (dynamic)
addI({
  pos: () => {
    const site = nearestOf(World.iceSites, s => s.group.position, 4.5, s => s.left > 0);
    return site ? (World._activeIce = site).group.position : null;
  },
  r: 4.5, hold: 1.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  enabled: () => S.upgrades.drill ? true : 'Needs the Ice Drill upgrade',
  label: () => `Mine water ice (+1, ${World._activeIce ? World._activeIce.left : 0} left)`,
  use: () => {
    const site = World._activeIce;
    if (!site || site.left <= 0) return;
    site.left--; S.inv.ice++; S.stats.mined++;
    if (site.left <= 0) site.group.visible = false;
    Snd.pickup();
    checkAchievements();
  },
});
// debris & supply pods
addI({
  pos: () => {
    let best = null, bestD = 4.5;
    for (const p of World.pods) {
      if (p.taken) continue;
      const d = groundDist(player.pos, p.group.position);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best ? (World._activePod = best).group.position : null;
  },
  r: 4.5, hold: 1.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => World._activePod ? World._activePod.label : '',
  use: () => {
    const p = World._activePod;
    if (!p || p.taken) return;
    p.taken = true;
    p.group.visible = false;
    const got = gainLoot(p.loot);
    log(`Recovered: ${got}.`);
    if (p.blueprint) { S.blueprints[p.blueprint] = true; log(`NASA attached schematics: ${p.blueprint.toUpperCase()} blueprint unlocked.`, 'nasa'); }
  },
});
// the buried RTG
addI({
  pos: () => World.rtgSite.group.position,
  r: 4.0, hold: 3.0, mode: 'walk',
  visible: () => !S.flags.coldOpen && !World.rtgSite.taken && S.flags.didMath,
  label: () => 'Dig up the RTG (radioactive. cozy.)',
  use: () => {
    World.rtgSite.taken = true;
    World.rtgSite.group.visible = false;
    S.flags.hasRtg = true;
    Snd.pickup();
    log('One RTG: a plutonium space-heater NASA buried out of an abundance of caution. I am strapping it to my life. Socket it at the fabricator.');
  },
});
// breach patch
addI({
  pos: () => siteLocalToWorld(habGroup, 0, 0, -HAB_R + 1.2, _v2),
  r: 3.2, hold: 3.0, mode: 'walk',
  visible: () => S.breach.active && S.inside,
  label: () => 'Seal the breach (canvas, tape, prayer)',
  use: () => {
    S.breach.active = false;
    S.breach.done = true;
    Snd.alarm(false);
    Snd.ok();
    S.shake = 0.5;
    syncAllVisuals();
    log(S.breach.cropsKilled ?
      'Sealed. Too late for the crops. The Hab and I are no longer on speaking terms.' :
      'Breach sealed. Crops: alive. Heart rate: unpublishable. Duct tape: undefeated.');
  },
});
// deployed O2 caches
addI({
  pos: () => {
    let best = null, bestD = 3.5;
    for (const b of World.builtMeshes) {
      if (b.kind !== 'cache' || b.charges <= 0) continue;
      const d = groundDist(player.pos, b.group.position);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best ? (World._activeCache = best).group.position : null;
  },
  r: 3.5, hold: 1.0, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  enabled: () => S.suit < suitCap() - 5 ? true : 'Suit is full',
  label: () => `Refill suit O2 (${World._activeCache ? World._activeCache.charges : 0} charges left)`,
  use: () => {
    const c = World._activeCache;
    if (!c || c.charges <= 0) return;
    c.charges--;
    S.suit = clamp(S.suit + 40, 0, suitCap());
    Snd.ok();
  },
});
// kit deployment
let deployKind = null;
function startDeploy(kind) {
  deployKind = kind;
  closeScreens();
  log('Pick a spot outside and place it.', 'sys');
}
addI({
  pos: () => player.pos, r: 99, hold: 1.6, mode: 'walk', priority: 2,
  visible: () => !!deployKind && !S.inside,
  label: () => `Place the ${ITEM_NAMES['kit' + deployKind.charAt(0).toUpperCase() + deployKind.slice(1)] || deployKind} here`,
  use: () => {
    const kitKey = 'kit' + deployKind.charAt(0).toUpperCase() + deployKind.slice(1);
    if ((S.inv[kitKey] || 0) <= 0) { deployKind = null; return; }
    S.inv[kitKey]--;
    _v1.copy(player.pos).normalize();
    _v2.set(0, 0, -1).applyQuaternion(player.q);
    _v1.addScaledVector(_v2, 5 / R).normalize();
    const kind = deployKind;
    buildDeployable(kind, _v1);
    Snd.craft();
    log(`${ITEM_NAMES[kitKey]} deployed. Mars: 0, engineering: 1.`);
    if (deployKind === 'greenhouse') syncAllVisuals();
    onQuestEvent('deploy', deployKind);
    deployKind = null;
    checkAchievements();
  },
});
// MAV: strip + launch
addI({
  pos: () => World.mav.position,
  r: 8.0, hold: 3.0, mode: 'walk',
  visible: () => S.flags.mavRevealed && !S.flags.mavStripped,
  enabled: () => S.sol >= S.rescueSol ? true : `Launch window opens Sol ${S.rescueSol} — NASA was firm about this`,
  label: () => 'Strip excess weight (nose cone, seats, dignity)',
  use: () => {
    S.flags.mavStripped = true;
    World.mavNose.visible = false;
    Snd.ok();
    log('Removed the nose cone. NASA says the tarp will hold. NASA is lying, and we both know it.');
  },
});
addI({
  pos: () => World.mav.position,
  r: 8.0, hold: 1.6, mode: 'walk',
  visible: () => S.flags.mavStripped && !S.won,
  label: () => 'Climb in. Go home.',
  use: () => {
    showOverlay({
      title: 'LAUNCH?',
      body: 'The MAV is a convertible now. The math says Hermes can catch you.\nThe math has been wrong before.\n\nNo coming back. The potatoes forgive you.',
      buttons: [
        { label: 'PUNCH IT', fn: () => startLaunch() },
        { label: 'Not yet', ghost: true, fn: () => {} },
      ],
    });
  },
});

// ============================================================
// 19. VISUAL SYNC (idempotent: safe after any state restore)
// ============================================================
function syncAllVisuals() {
  for (const pl of World.plots) syncPlot(pl);
  for (const p of World.panels)
    p.mesh.material.color.set(new THREE.Color(0x1c2c50).lerp(new THREE.Color(0x8a5a34), clamp(p.dust, 0, 1)));
  for (const sp of World.soilPiles) {
    sp.mesh.visible = sp.left > 0;
    const sc = 0.6 + sp.left * 0.35;
    sp.mesh.scale.set(sc, sc * 0.55, sc);
  }
  World.breachHole.visible = S.breach.active;
  World.breachPatch.visible = S.breach.done && !S.breach.active;
  World.commsScreen.material.emissive.set(S.pf.connected ? 0x2a4a7a : 0x000000);
  World.oxyLight.material.emissive.set(S.power > 0.5 ? 0x33ff66 : 0x331111);
  for (const l of World.habLights) l.intensity = S.power > 0.5 ? (l === World.habLights[0] ? 0.95 : 0.5) : 0.08;
  for (const rec of World.pods) rec.group.visible = !rec.taken;
  if (World.rtgSite) World.rtgSite.group.visible = !World.rtgSite.taken;
  for (const site of World.iceSites) site.group.visible = site.left > 0;
  // pathfinder: exactly one home per state, collider follows (review finding: all 3 states)
  const pfG = World.pathfinder;
  if (S.pf.connected) {
    if (pfG.parent !== worldRoot) worldRoot.add(pfG);
    siteLocalToWorld(habGroup, 13.5, 0, 5.5, pfG.position);
    pfG.position.normalize().multiplyScalar(surfaceAt(pfG.position));
    frameQuat(_v1.copy(pfG.position).normalize(), 0.3, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 0.001;
    World.uplinkRing.visible = false;
  } else if (S.pf.loaded) {
    if (pfG.parent !== World.rover.group) {
      World.rover.group.add(pfG);
      pfG.position.set(0, 2.15, -1.1);
      pfG.quaternion.set(0, 0, 0, 1);
      pfG.scale.set(0.8, 0.8, 0.8);
    }
    World.pfCollider.r = 0.001;
    World.uplinkRing.visible = true;
  } else {
    if (pfG.parent !== worldRoot) worldRoot.add(pfG);
    const u = llToVec(19.13, 326.79);
    pfG.position.copy(u).multiplyScalar(surfaceAt(u));
    frameQuat(u, 0.7, pfG.quaternion);
    pfG.scale.set(1, 1, 1);
    World.pfCollider.r = 2.2;
    World.uplinkRing.visible = false;
  }
}

// ============================================================
// 20. RESOURCE SIMULATION
// ============================================================
const warnedLow = {};
function warnLow(key, val, thresh, msg) {
  if (val <= thresh && !warnedLow[key]) { warnedLow[key] = true; log(msg, 'sys'); Snd.bad(); }
  else if (val > thresh + 8) warnedLow[key] = false;
}
function avgPanelOutput() {
  let s = 0;
  for (const p of World.panels) s += 1 - clamp(p.dust, 0, 1);
  let base = s / World.panels.length;
  // deployed solar panels near the hab boost generation
  for (const b of World.builtMeshes)
    if (b.kind === 'solar' && groundDist(b.group.position, habGroup.position) < 150) base += 0.12;
  return base;
}
function habSunEl() { return _v1.copy(habGroup.position).normalize().dot(sunDir); }

function applyRates(dt, sleeping) {
  const D = S.drainMult;
  const m = (sleeping ? 0.5 : 1) * D;
  const SL = BAL.solLen;
  const habDay = clamp(habSunEl() * 3, 0, 1);
  const playerSunEl = localSunEl();
  // --- hab power ---
  const stormAtHab = stormIntensityAt(habGroup.position);
  const gen = (BAL.solarGen / SL) * habDay * avgPanelOutput() * lerp(1, BAL.stormGenMult, stormAtHab);
  let baseDraw = BAL.powerBase * (S.upgrades.insulation ? 0.7 : 1);
  const tempAtHab = localTempC(_v1.copy(habGroup.position).normalize(), habSunEl());
  if (tempAtHab < -70 && !S.upgrades.rtg) baseDraw += 8;             // heaters fight the cold
  let rtgGen = S.upgrades.rtg ? 6 / SL : 0;
  S.power = clamp(S.power + (gen + rtgGen - (baseDraw / SL) * m) * dt, 0, BAL.powerMax);
  const powered = S.power > 0.5;
  // --- panel dust ---
  const dustMult = S.upgrades.wiper ? 0.3 : 1;
  const dr = lerp(BAL.dustRate, BAL.stormDustRate, stormAtHab) / SL * dustMult * dt;
  for (const p of World.panels) p.dust = clamp(p.dust + dr, 0, 1);
  // --- hab O2 ---
  let o2d = -(BAL.o2Drain / SL) * m;
  if (powered) o2d += BAL.o2Gen / SL;
  if (S.breach.active) o2d -= BAL.o2BreachDrain / SL;
  S.o2 = clamp(S.o2 + o2d * dt, 0, 100);
  // --- suit O2 & rover tank ---
  if (!sleeping) {
    if (S.mode === 'rover') {
      if (S.suit < suitCap() && S.roverO2 > 0) {
        const take = Math.min(25 * dt, suitCap() - S.suit, S.roverO2);
        S.suit += take; S.roverO2 -= take;
      }
      // parked at home: hab tops off the rover
      if (groundDist(World.rover.group.position, habGroup.position) < 60 && S.o2 > 30)
        S.roverO2 = clamp(S.roverO2 + 10 * dt, 0, BAL.roverO2Cap);
    } else if (S.inside && S.o2 > 3) {
      S.suit = clamp(S.suit + 26 * dt, 0, suitCap());
    } else {
      const moving = keys['w'] || keys['a'] || keys['s'] || keys['d'] || keys['arrowup'] || keys['arrowdown'];
      let rate = moving ? (keys['shift'] ? 0.95 : 0.62) : 0.34;
      if (S.inside) rate = 0.3;
      if (S.upgrades.recycler) rate *= 0.75;
      if (S.flags.coldOpen) rate *= 1.9;
      const t = localTempC(playerUnit(), playerSunEl);
      if (t < -85) rate *= 1.25;                                     // suit heater sips O2 reserve
      S.suit = clamp(S.suit - rate * D * dt, 0, suitCap());
    }
    // rover recharges near hab or a deployed solar panel
    if (groundDist(World.rover.group.position, habGroup.position) < 60 && S.power > 10)
      S.roverPower = clamp(S.roverPower + (BAL.roverChargeAtHab / 60) * dt, 0, roverPowerCap());
    for (const b of World.builtMeshes)
      if (b.kind === 'solar' && groundDist(b.group.position, World.rover.group.position) < 25)
        S.roverPower = clamp(S.roverPower + (8 / 60) * Math.max(0, playerSunEl) * dt, 0, roverPowerCap());
  } else {
    S.suit = suitCap();
  }
  // --- water ---
  let wd = -(BAL.waterDrain / SL) * m;
  if (powered) wd += (BAL.waterRecl / SL) * (S.upgrades.recycler ? 1 : 1);
  S.water = clamp(S.water + wd * dt, 0, BAL.waterMax);
  // --- crops (greenhouse plots pause in a local storm? no — they're sealed domes) ---
  const dtSol = dt / SL;
  for (const pl of World.plots) {
    if (pl.state !== 'growing') continue;
    if (pl.growth >= 0.5 && pl.watered < BAL.waterings) continue;
    pl.growth += dtSol / BAL.growSols;
    if (pl.growth >= 1) {
      pl.growth = 1; pl.state = 'ready';
      if (!sleeping) { Snd.ok(); log('A plot is ready. Potato o\'clock.', 'sys'); }
      syncPlot(pl);
    } else if (Math.random() < dt * 0.06) syncPlot(pl);
  }
  // --- vitals ---
  let hd = 0;
  if (S.water <= 0) hd += BAL.starveDrain / SL;
  if (S.food + S.potatoes <= 0) hd += BAL.starveDrain / SL;
  const suffocating = S.suit <= 0 && !(S.inside && S.o2 > 3) && S.mode !== 'rover' && !sleeping;
  if (suffocating) hd += BAL.suffocateDrain;
  if (S.inside && S.o2 <= 0 && S.suit <= 0) hd += BAL.suffocateDrain;
  if (S.mode === 'rover' && S.roverO2 <= 0 && S.suit <= 0) hd += BAL.suffocateDrain;
  if (hd > 0) S.health = clamp(S.health - hd * D * dt, 0, BAL.healthMax);
  else if (S.water > 5 && S.food + S.potatoes > 0) S.health = clamp(S.health + (BAL.healRegen / SL) * m * dt, 0, BAL.healthMax);
  if (!sleeping) {
    warnLow('suit', S.suit, suitCap() * 0.25, 'Suit O2 at 25%. Head for air. Now-ish.');
    warnLow('suit2', S.suit, suitCap() * 0.1, 'SUIT O2 CRITICAL. RUN.');
    warnLow('o2', S.o2, 25, 'Hab O2 low. Oxygenator needs power. Panels need wiping. You see where this is going.');
    warnLow('water', S.water, 10, 'Water reserves critical. Hydrazine, ice, or thirst — pick one.');
    warnLow('power', S.power, 15, 'Hab battery low. Life support idles at zero. Wipe the panels.');
    warnLow('rpow', S.roverPower, 20, 'Rover battery low. It solar-trickles when parked in daylight.');
    warnLow('health', S.health, 40, 'Vitals degrading. Eat. Drink. Sleep. In any order.');
    if (S.suit <= 12 || S.o2 <= 10) { if (!S.flags.closeCall) { S.flags.closeCall = true; S.stats.closeCalls++; } }
    else S.flags.closeCall = false;
  }
  if (S.health <= 0 && !S.over) {
    let cause = 'Mars. The cause is always Mars.';
    if (suffocating) cause = 'Asphyxiation, a long way from a door. Mars counts that as a win.';
    else if (S.inside && S.o2 <= 0) cause = 'The Hab ran out of air. The potatoes watched.';
    else if (S.water <= 0) cause = 'Dehydration. On a planet that used to have oceans. Rude.';
    else if (S.food + S.potatoes <= 0) cause = 'Starvation. The botany project needed more time.';
    die(cause);
  }
}

// ============================================================
// 21. TIME, ROAMING STORMS, EVENTS
// ============================================================
function initStorms() {
  S.storm.cells = [];
  for (let i = 0; i < 3; i++) {
    S.storm.cells.push({
      lat: (hash3(i, 77, 3) * 2 - 1) * 55, lon: hash3(i, 13, 41) * 360,
      r: 1800 + hash3(i, 5, 9) * 2600,                 // meters of world radius
      drift: 20 + hash3(i, 8, 2) * 30,                 // m per sol of drift
      dir: hash3(i, 1, 6) * Math.PI * 2,
      peak: 0.7 + hash3(i, 3, 3) * 0.3,
    });
  }
}
const _sv = new THREE.Vector3();
function stormCellVec(c, out) { return llToVec(c.lat, c.lon, out); }
function stormIntensityAt(posWorld) {
  let best = 0;
  _v3.copy(posWorld).normalize();
  for (const c of S.storm.cells) {
    stormCellVec(c, _sv);
    const d = angDist(_v3.x, _v3.y, _v3.z, _sv.x, _sv.y, _sv.z) * R;
    if (d < c.r) best = Math.max(best, c.peak * smoothstep(1, 0.35, d / c.r));
  }
  // scripted early storms hit the colony on sols 5 and 9 (teaching beats)
  if ((S.sol === 5 || S.sol === 9) && S.tod > 0.15 && S.tod < 0.55) {
    const dHab = groundDist(posWorld, habGroup.position);
    if (dHab < 4000) best = Math.max(best, 0.85 * smoothstep(4000, 1200, dHab));
  }
  return best;
}
function advanceStorms(dtSol) {
  for (const c of S.storm.cells) {
    const dist = c.drift * dtSol;
    const u = stormCellVec(c, _sv);
    tangentBasis(u, _pe, _pn);
    u.addScaledVector(_pe, Math.cos(c.dir) * dist / R).addScaledVector(_pn, Math.sin(c.dir) * dist / R).normalize();
    const ll = vecToLl(u);
    c.lat = ll.lat; c.lon = ll.lon;
    c.dir += (hash3(Math.floor(S.sol * 7), Math.floor(c.lon), 3) - 0.5) * dtSol * 2;
  }
}

function advanceTime(dt) {
  const dtSol = dt / BAL.solLen;
  S.tod += dtSol;
  advanceStorms(dtSol);
  if (S.tod >= 1) { S.tod -= 1; newSol(); }
  // local storm intensity where the player is
  const target = stormIntensityAt(S.mode === 'rover' ? World.rover.group.position : player.pos);
  S.storm.i = clamp(S.storm.i + Math.sign(target - S.storm.i) * dt * 0.12, 0, Math.max(target, S.storm.i - dt * 0.12));
  if (S.storm.i > 0.4 && !S.inside && S.mode === 'walk') S.stats.stormOut += dt;
  // breach event: waits for a sol >= BREACH_SOL when the player is near home
  if (S.sol >= 7 && S.tod > 0.1 && !S.breach.done && !S.breach.active &&
      groundDist(S.mode === 'rover' ? World.rover.group.position : player.pos, habGroup.position) < 800 &&
      !S.flags.coldOpen && S.mode !== 'cutscene') {
    S.breach.active = true;
    S.breach.timer = 0;
    S.shake = 1.4;
    flashScreen('rgba(255,255,255,0.5)', 200);
    Snd.boom(); Snd.alarm(true);
    syncAllVisuals();
    log('BREACH. The Hab canvas just blew. Air\'s screaming out. MOVE, WATNEY.', 'sys');
  }
  if (S.breach.active) {
    S.breach.timer += dt;
    if (S.breach.timer > 90 && !S.breach.cropsKilled) {
      S.breach.cropsKilled = true;
      let killed = 0;
      for (const pl of World.plots) if (pl.state === 'growing') { pl.state = 'dead'; killed++; syncPlot(pl); }
      if (killed) log('The cold got in. The growing crops are dead. Ready trays survived. Small mercies.', 'sys');
    }
  }
}

function newSol() {
  S.sol++;
  if (S.potatoes > 0) S.potatoes--;
  else if (S.food > 0) S.food--;
  else log('No breakfast. The stomach files a formal complaint.', 'sys');
  if (SOL_LOGS[S.sol]) setTimeout(() => log(SOL_LOGS[S.sol]), 1200);
  if (S.sol === 4 && !S.flags.pfRevealed) {
    S.flags.pfRevealed = true;
    const d = groundDist(player.pos, World.pathfinder.position);
    setTimeout(() => log(`Found it in the charts: Pathfinder, dead since '97, ${fmtDist(d)} from here in Ares Vallis. If I fetch it, I can call Earth. Road trip.`), 6000);
    if (!S.flags.routePods) {
      S.flags.routePods = true;
      dropRoutePods();
    }
  }
  if (S.sol >= S.rescueSol && !S.flags.mavRevealed) revealMav();
  // storm forecast (uplink gives you weather service; easy mode always has it)
  if (S.pf.connected || S.diff === 'story') {
    for (const c of S.storm.cells) {
      stormCellVec(c, _sv);
      if (angDist(_sv.x, _sv.y, _sv.z, _v3.copy(habGroup.position).normalize().x, _v3.y, _v3.z) * R < c.r + 2500) {
        setTimeout(() => log('Forecast: a dust cell is drifting near the colony. Panels will hate it.', 'nasa'), 5000);
        break;
      }
    }
  }
  if (S.sol === 5 || S.sol === 9) setTimeout(() => log('Sky\'s going brown at the horizon. Storm day. Wonderful.', 'sys'), 3000);
  checkpoint();
  saveGame();
}

// NASA drops supply pods along long expedition routes — random spawn stays fair
function dropRoutePods() {
  const d = groundDist(habGroup.position, World.pathfinder.position);
  if (d < 6000) return;
  const n = Math.min(3, Math.floor(d / 6000) + 1);
  _v1.copy(habGroup.position).normalize();
  _v2.copy(World.pathfinder.position).normalize();
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    _v3.copy(_v1).lerp(_v2, t).normalize();
    const g = placeAt(_v3);
    g.add(buildModel('supplyPod'));
    World.pods.push({ group: g, kind: 'pod', taken: false,
      loot: { rations: 2, water: 10, candle: 1, scrap: 1 }, label: 'Open NASA route cache' });
  }
  setTimeout(() => log(`NASA pre-dropped ${n} supply caches along the Pathfinder route. They appear on the map. Somebody up there likes me.`, 'nasa'), 9000);
}

function revealMav() {
  S.flags.mavRevealed = true;
  const d = fmtDist(groundDist(player.pos, World.mav.position));
  if (S.pf.connected)
    log(`Launch window is OPEN. The Ares 4 MAV is fueled and waiting in Schiaparelli crater — ${d} out. Time to fly a convertible.`, 'nasa');
  else
    log(`Sol ${S.rescueSol}. NASA's original plan had the Ares 4 MAV launching from Schiaparelli about now — ${d} away. That rocket is my ride, phone call or no phone call.`);
  Snd.jingle();
}
function fmtDist(m) { return m > 999 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m'; }

// ============================================================
// 22. SLEEP (fast-forward to local dawn; review-hardened)
// ============================================================
function sleepToDawn(inRover) {
  if (S.sleeping) return;
  S.sleeping = true;
  const before = { o2: S.o2, water: S.water, power: S.power, potatoes: S.potatoes, food: S.food };
  UI.overlay.style.display = 'flex';
  S.uiOpen = true;
  UI.panel.innerHTML = '<h2 style="margin-bottom:8px">SLEEPING…</h2><div class="bd" id="mg-sleepbd" style="min-height:120px"></div>';
  // advance until the LOCAL sun crosses the horizon rising (max 1.3 sols for polar nights)
  const u = _v1.copy(inRover ? World.rover.group.position : player.pos).normalize().clone();
  let advanced = 0, rolled = false;
  const step = BAL.solLen / 40;
  let prevEl = u.dot(sunDir);
  for (let i = 0; i < 60; i++) {
    S.tod += step / BAL.solLen;
    advanceStorms(step / BAL.solLen);
    if (S.tod >= 1) { S.tod -= 1; newSol(); rolled = true; }
    applyRates(step, true);
    if (S.over) { S.sleeping = false; return; }      // died in the night: keep the death overlay
    advanced += step;
    updateSunDir();
    const el = u.dot(sunDir);
    if (advanced > BAL.solLen * 0.1 && prevEl < 0.03 && el >= 0.03) break;
    prevEl = el;
    if (advanced > BAL.solLen * 1.3) break;
  }
  // a night slept is a sol lived, even when the global sun phase didn't wrap
  if (!rolled && !S.over) newSol();
  if (S.over) { S.sleeping = false; return; }
  const bd = document.getElementById('mg-sleepbd');
  const delta = (a, b, unit) => {
    const d = b - a;
    return `<span style="color:${d >= 0 ? '#7fca7f' : '#ff8f7f'}">${d >= 0 ? '+' : ''}${d.toFixed(1)}${unit}</span>`;
  };
  const growing = World.plots.filter(p => p.state === 'growing').length;
  const ready = World.plots.filter(p => p.state === 'ready').length;
  setTimeout(() => {
    if (bd && !S.over) bd.innerHTML =
      `HAB O2 ${delta(before.o2, S.o2, '%')} · H2O ${delta(before.water, S.water, 'L')} · PWR ${delta(before.power, S.power, '%')}\n` +
      `Breakfast: ${S.potatoes < before.potatoes ? 'potato. again.' : (S.food < before.food ? '1 ration' : 'skipped')}\n` +
      (growing + ready > 0 ? `Farm: ${growing} growing, ${ready} ready\n` : '') +
      (inRover ? 'Slept curled around the driver seat. The chiropractor is 225 million km away.\n' : '') +
      `\n<b style="font-size:22px;letter-spacing:4px">SOL ${S.sol}</b>`;
  }, 500);
  setTimeout(() => {
    if (S.over) { S.sleeping = false; return; }      // review finding: never dismiss a death screen
    hideOverlay();
    S.sleeping = false;
    S.health = clamp(S.health + BAL.sleepHeal, 0, BAL.healthMax);
    syncAllVisuals();
    checkpoint();
    saveGame();
  }, 2900);
}

// ============================================================
// 23. PATHFINDER COMMS
// ============================================================
function connectPathfinder() {
  S.pf.connected = true;
  syncAllVisuals();
  Snd.jingle();
  checkpoint();
  const mavDist = fmtDist(groundDist(habGroup.position, World.mav.position));
  const convo = [
    ['n', 'MARK? MARK, IS THAT YOU? — JPL. We\'re receiving Pathfinder telemetry. The whole world is watching, Mark.'],
    ['w', 'Alive and well. Ish. Growing potatoes on a dead planet. Air holds, food\'s tight, morale is potato-based.'],
    ['n', `Copy. New plan: Ares 4\'s MAV is fueled and standing in Schiaparelli crater, ${mavDist} from your position. Hermes swings back for a Sol ${S.rescueSol} intercept. Survive, drive, launch. We\'ll be there.`],
    ['w', `So the plan is "don\'t die for ${Math.max(0, S.rescueSol - S.sol)} more sols, then drive ${mavDist} and ride a rocket somebody else parked." I\'ve had worse weekends.`],
    ['n', 'We\'re also uploading survey tasks — old landers with parts worth salvaging. Help us close some files, we drop supplies. And Mark: everything you type is broadcast live on Earth. Language.'],
    ['w', 'Acknowledged. [REDACTED BY NASA]. [ALSO REDACTED]. Boy, am I glad you warned me.'],
  ];
  let i = 0;
  const step = () => {
    if (i >= convo.length) {
      hideOverlay();
      log('Uplink holds. Earth is one very slow text message away.', 'nasa');
      offerQuests();
      if (S.sol >= S.rescueSol) revealMav();
      checkpoint();
      saveGame();
      return;
    }
    const rows = convo.slice(0, i + 1).map(([who, t]) =>
      `<div style="margin-bottom:10px"><span class="${who === 'n' ? 'n' : 'w'}">${who === 'n' ? '[HOUSTON]' : '[WATNEY]'}</span> ${t}</div>`).join('');
    showOverlay({
      title: 'PATHFINDER UPLINK',
      subtitle: 'signal delay: 11 minutes, mercifully compressed',
      body: `<div class="comms">${rows}</div>`,
      buttons: [{ label: i < convo.length - 1 ? 'NEXT ▸' : 'CLOSE CHANNEL', keep: i < convo.length - 1, fn: () => { i++; Snd.click(); step(); } }],
    });
    if (i === 0) Snd.ok();
  };
  step();
  log('IT TALKS. Pathfinder lives. Hello, Earth. Did you miss me?');
  onQuestEvent('pf-connected', '');
  checkAchievements();
}

// ============================================================
// 24. QUESTS
// ============================================================
const QUEST_DEFS = [
  { id: 'viking1', name: 'Viking Funeral', target: 'Viking 1',
    desc: 'Salvage Viking 1 (1976) in Chryse Planitia. NASA wants a photo. And the descent-stage hydrazine.',
    ev: ['salvage', 'Viking 1'], loot: { scrap: 4, rations: 2, hydrazine: 1 } },
  { id: 'spirit', name: 'Wake the Dead', target: 'Spirit',
    desc: 'Recover Spirit\'s memory boards at Gusev crater. She earned a proper goodbye.',
    ev: ['salvage', 'Spirit'], loot: { rations: 3, candle: 1 }, bp: 'recycler' },
  { id: 'oppy', name: 'Oppy\'s Last Message', target: 'Opportunity',
    desc: 'Find Opportunity in Meridiani Planum and wipe her panels. Yes, it matters. To everyone.',
    ev: ['salvage', 'Opportunity'], loot: { rations: 4, circuit: 1 }, bp: 'drive2' },
  { id: 'insight', name: 'Marsquake', target: 'InSight',
    desc: 'Retrieve InSight\'s seismometer data from Elysium Planitia. 1300 marsquakes are waiting.',
    ev: ['salvage', 'InSight'], loot: { scrap: 2, candle: 1 }, reveal: true },
  { id: 'phoenix', name: 'Polar Express', target: 'Phoenix',
    desc: 'Reach Phoenix at the edge of the northern ice. Pack warm. Pack O2. Pack more O2.',
    ev: ['salvage', 'Phoenix'], loot: { rations: 4, hydrazine: 2 }, bp: 'tank2' },
  { id: 'mars3', name: 'Sirens of Mars', target: 'Mars 3',
    desc: 'Find Mars 3, silent since 1971, and recover its film canister. The first one deserves a visitor.',
    ev: ['salvage', 'Mars 3'], loot: { scrap: 5, rations: 5, circuit: 1 } },
  { id: 'breadcrumbs', name: 'Breadcrumbs', target: null,
    desc: 'Pre-position the escape: deploy an O2 Cache and a Nav Beacon at least 2 km from the Hab, toward Schiaparelli.',
    ev: ['deploy', null], loot: { rations: 3, candle: 2 } },
];
function questTargetPos(q) {
  if (q.target) {
    const rec = World.landers.find(l => l.data.name === q.target);
    return rec ? rec.group.position : null;
  }
  return null;
}
function offerQuests() {
  for (const q of QUEST_DEFS) if (!S.quests[q.id]) S.quests[q.id] = 'active';
  // retro-complete survey tasks for landers already stripped before the uplink
  for (const name of Object.keys(S.salvaged)) onQuestEvent('salvage', name);
  log('NASA uploaded survey tasks — old landers with parts worth saving. Check the journal [J]. They pay in supply pods.', 'nasa');
  // the care package: ice drill blueprint arrives with the first pod
  dropSupplyPod({ scrap: 3, rations: 3, candle: 1 }, 'Open NASA care package').blueprint = 'drill';
}
function onQuestEvent(type, name) {
  for (const q of QUEST_DEFS) {
    if (S.quests[q.id] !== 'active') continue;
    let hit = false;
    if (q.ev[0] === 'salvage' && type === 'salvage' && q.ev[1] === name) hit = true;
    if (q.id === 'breadcrumbs' && type === 'deploy') {
      let cache = false, beacon = false;
      for (const b of World.builtMeshes) {
        const d = groundDist(b.group.position, habGroup.position);
        if (d > 2000 && b.kind === 'cache') cache = true;
        if (d > 2000 && b.kind === 'beacon') beacon = true;
      }
      hit = cache && beacon;
    }
    if (!hit) continue;
    S.quests[q.id] = 'done';
    Snd.discovery();
    const pod = dropSupplyPod(q.loot, `Open "${q.name}" reward pod`);
    if (q.bp) pod.blueprint = q.bp;
    if (q.reveal) {
      S.flags.mapRevealed = true;
      log('InSight\'s data came with NASA\'s full survey map. Every landmark, revealed. [M]', 'nasa');
    }
    log(`Survey task complete: ${q.name}. NASA is sending a pod.`, 'nasa');
  }
}

// ============================================================
// 25. DISCOVERIES & ACHIEVEMENTS
// ============================================================
function discover(name, note, isLander) {
  if (S.discovered[name]) return;
  S.discovered[name] = true;
  S.stats.discoveries++;
  Snd.discovery();
  toast(isLander ? 'SITE DISCOVERED' : 'REGION DISCOVERED', name.toUpperCase(), note || '');
  checkAchievements();
}
let discTimer = 0;
function updateDiscoveries(dt) {
  discTimer += dt;
  if (discTimer < 1.5) return;
  discTimer = 0;
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  _v1.copy(pp).normalize();
  for (const rec of World.landers) {
    if (S.discovered[rec.data.name]) continue;
    if (groundDist(pp, rec.group.position) < 160) discover(rec.data.name, rec.data.note, true);
  }
  for (const f of FEATURES) {
    if (f.type === 'bulge' || f.type === 'albedo' || S.discovered[f.name]) continue;
    if (angDist(_v1.x, _v1.y, _v1.z, f.v.x, f.v.y, f.v.z) < f.angR) discover(f.name, f.note, false);
  }
}
const ACHIEVEMENTS = [
  { id: 'notdead', name: 'Not Dead Yet', desc: 'Reach the dawn of Sol 2', check: () => S.sol >= 2 },
  { id: 'phone', name: 'Phone Home', desc: 'Restore the Pathfinder uplink', check: () => S.pf.connected },
  { id: 'botanist', name: 'Greatest Botanist on This Planet', desc: 'Harvest 50 potatoes', check: () => S.stats.potatoes >= 50 },
  { id: 'eyebrows', name: 'Both Eyebrows', desc: 'Five hydrazine burns survived', check: () => S.stats.booms >= 5 },
  { id: 'arch', name: 'Archaeologist of the Future', desc: 'Salvage 8 historic landers', check: () => Object.keys(S.salvaged).length >= 8 },
  { id: 'olympus', name: 'Peak Performance', desc: 'Stand on the summit of Olympus Mons',
    check: () => { const f = FEATURES.find(f => f.name === 'Olympus Mons'); _v2.copy(player.pos).normalize(); return angDist(_v2.x, _v2.y, _v2.z, f.v.x, f.v.y, f.v.z) * R < 120; } },
  { id: 'hellas', name: 'The Bottom of Everything', desc: 'Stand on the floor of Hellas Planitia',
    check: () => { const f = FEATURES.find(f => f.name === 'Hellas Planitia'); _v2.copy(player.pos).normalize(); return angDist(_v2.x, _v2.y, _v2.z, f.v.x, f.v.y, f.v.z) * R < 800; } },
  { id: 'circum', name: 'Circumnavigator', desc: 'Drive 75.4 km — one full lap of Mars', check: () => S.stats.driven >= 75400 },
  { id: 'ice', name: 'Ice to Meet You', desc: 'Mine 25 ice chunks', check: () => S.stats.mined >= 25 },
  { id: 'storm', name: 'Storm Rider', desc: 'Spend 60 seconds outside in a dust storm', check: () => S.stats.stormOut >= 60 },
  { id: 'marathon', name: 'Ares Marathon', desc: 'Walk 10 km on foot', check: () => S.stats.walked >= 10000 },
  { id: 'disco', name: 'Disco Inferno', desc: 'Endure 3 minutes of Lewis\'s playlist', check: () => S.stats.discoTime >= 180 },
  { id: 'pirate', name: 'Space Pirate', desc: 'Leave Mars', check: () => S.won },
];
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (S.achieved[a.id]) continue;
    let ok = false;
    try { ok = a.check(); } catch (e) {}
    if (ok) {
      S.achieved[a.id] = true;
      Snd.discovery();
      toast('ACHIEVEMENT', a.name, a.desc);
    }
  }
}

// ============================================================
// 26. OBJECTIVES HUD
// ============================================================
const OBJECTIVES = [
  { id: 'reach', text: () => 'Suit breach — get to the Hab', shown: () => true, done: () => S.flags.suitSealed },
  { id: 'systems', text: () => `Inspect the oxygenator & reclaimer (${Object.keys(S.checkedSystems).length}/2)`, shown: () => S.flags.suitSealed, done: () => Object.keys(S.checkedSystems).length >= 2 },
  { id: 'math', text: () => 'Run the numbers at the comms desk', shown: () => Object.keys(S.checkedSystems).length >= 2, done: () => S.flags.didMath },
  { id: 'panels', text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, shown: () => S.flags.suitSealed, done: () => S.stats.panels >= 3 },
  { id: 'farm', text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'hydra', text: () => 'Make water: burn hydrazine (carefully)', shown: () => S.flags.didMath, done: () => S.stats.booms >= 1 },
  { id: 'pf', text: () => {
      if (S.pf.loaded) return 'Bring Pathfinder to the uplink ring';
      const d = fmtDist(groundDist(player.pos, World.pathfinder.position));
      return `Recover Pathfinder — Ares Vallis, ${d}`;
    }, shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', text: () => `Harvest potatoes (${S.stats.potatoes} banked)`, shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 },
  { id: 'breach', text: () => 'SEAL THE BREACH', shown: () => S.breach.active, done: () => !S.breach.active, urgent: true },
  { id: 'survive', text: () => `Survive to Sol ${S.rescueSol} (Sol ${S.sol})`, shown: () => S.pf.connected, done: () => S.sol >= S.rescueSol },
  { id: 'mav', text: () => `Get to the MAV — Schiaparelli, ${fmtDist(groundDist(player.pos, World.mav.position))}`, shown: () => S.flags.mavRevealed, done: () => S.won },
];
const objDone = new Set();
let objThrottle = 0;
function updateObjectivesHud() {
  if (perf() - objThrottle < 0.3) return;
  objThrottle = perf();
  let html = '<div class="ttl">MISSION</div>';
  let shown = 0;
  for (const o of OBJECTIVES) {
    if (!o.shown()) continue;
    const d = o.done();
    if (d && !objDone.has(o.id)) {
      objDone.add(o.id);
      if (o.id !== 'reach') Snd.jingle();
    }
    if (d && o.id !== 'mav') continue;
    if (shown >= 4) break;
    html += `<div class="mg-obj${d ? ' done' : ''}"${o.urgent ? ' style="color:#ff6f5f"' : ''}>▸ ${o.text()}</div>`;
    shown++;
  }
  // nearest two active survey quests
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(player.pos, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q, d } of act) {
    if (shown >= 6) break;
    html += `<div class="mg-obj quest">▸ ${q.name} — ${fmtDist(d)}</div>`;
    shown++;
  }
  UI.objectives.innerHTML = html;
}

// ============================================================
// 27. COMPASS & REGION TICKER
// ============================================================
const compassMarks = {};
let compassThrottle = 0;
function bearingTo(fromPos, targetPos, frameQ) {
  _v1.copy(fromPos).normalize();
  tangentBasis(_v1, _pe, _pn);
  _v2.copy(targetPos).normalize().sub(_v1.clone().multiplyScalar(_v1.dot(_v2.copy(targetPos).normalize())));
  // (recompute cleanly)
  _v2.copy(targetPos).normalize();
  _v3.copy(_v2).sub(_v1.clone().multiplyScalar(_v1.dot(_v2)));
  if (_v3.lengthSq() < 1e-10) return 0;
  const bE = _v3.dot(_pe), bN = _v3.dot(_pn);
  const bearing = Math.atan2(bE, bN);
  _v2.set(0, 0, -1).applyQuaternion(frameQ);
  _v3.copy(_v2).sub(_v1.clone().multiplyScalar(_v1.dot(_v2)));
  const fE = _v3.dot(_pe), fN = _v3.dot(_pn);
  const facing = Math.atan2(fE, fN);
  let rel = bearing - facing;
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  return rel;
}
function updateCompass() {
  if (perf() - compassThrottle < 0.12) return;
  compassThrottle = perf();
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const fq = S.mode === 'rover' ? roverF.q : player.q;
  const marks = [];
  marks.push(['hab', '⌂ HAB', habGroup.position]);
  if (!S.flags.coldOpen) marks.push(['rover', '▣ ROVER', World.rover.group.position]);
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) marks.push(['pf', '▼ PATHFINDER', World.pathfinder.position]);
  if (S.pf.loaded && !S.pf.connected) marks.push(['up', '▼ UPLINK', World.uplink.position]);
  if (S.flags.mavRevealed && !S.won) marks.push(['mav', '▲ MAV', World.mav.position]);
  if (S.breach.active) marks.push(['br', '⚠ BREACH', siteLocalToWorld(habGroup, 0, 0, -HAB_R + 1, _v2).clone()]);
  let bi = 0;
  for (const b of World.builtMeshes) if (b.kind === 'beacon') marks.push(['bc' + (bi++), '◆ BEACON', b.group.position]);
  const act = QUEST_DEFS.filter(q => S.quests[q.id] === 'active' && questTargetPos(q))
    .map(q => ({ q, d: groundDist(pp, questTargetPos(q)) }))
    .sort((a, b) => a.d - b.d).slice(0, 2);
  for (const { q } of act) marks.push(['q' + q.id, '★ ' + q.target.toUpperCase(), questTargetPos(q)]);
  for (const p of World.pods) {
    if (!p.taken && groundDist(pp, p.group.position) < 8000)
      marks.push(['pod' + World.pods.indexOf(p), '▽ CACHE', p.group.position]);
  }
  const seen = new Set();
  for (const [id, label, mp] of marks) {
    seen.add(id);
    let m = compassMarks[id];
    if (!m) { m = el('div', null, 'mg-cmark', UI.compass); compassMarks[id] = m; }
    const d = groundDist(pp, mp);
    if (d < 6) { m.style.display = 'none'; continue; }
    const rel = bearingTo(pp, mp, fq);
    const half = 1.15;
    const xFrac = clamp(rel / half, -1, 1) * 0.5 + 0.5;
    m.style.display = 'block';
    m.style.left = (xFrac * 100) + '%';
    m.style.opacity = Math.abs(rel) > half ? 0.35 : 0.95;
    m.innerHTML = `<div class="ic">${label.split(' ')[0]}</div>${label.split(' ').slice(1).join(' ')}<br>${fmtDist(d)}`;
  }
  for (const id in compassMarks) if (!seen.has(id)) { compassMarks[id].remove(); delete compassMarks[id]; }
  // region ticker
  UI.region.textContent = regionName(_v1.copy(pp).normalize()).toUpperCase();
}

// ============================================================
// 28. HUD
// ============================================================
function fmtClock() {
  const ll = vecToLl(_v1.copy(player.pos).normalize());
  let h = ((ll.lon + S.tod * 360) / 360 * 24.66 + 12) % 24.66;
  if (h < 0) h += 24.66;
  const mn = Math.floor((h % 1) * 60);
  return `LT ${String(Math.floor(h)).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
}
function updateHud() {
  const bars = [
    ['suit', S.suit, suitCap(), Math.round(S.suit) + '%'],
    ['o2', S.o2, 100, Math.round(S.o2) + '%'],
    ['water', S.water, BAL.waterMax, S.water.toFixed(0) + 'L'],
    ['food', S.food + S.potatoes, 16, `${S.food}R+${S.potatoes}P`],
    ['power', S.power, 100, Math.round(S.power) + '%'],
    ['health', S.health, 100, Math.round(S.health) + '%'],
  ];
  for (const [k, v, max, txt] of bars) {
    const b = UI.bars[k];
    if (!b) continue;
    b.fill.style.width = clamp(v / max * 100, 0, 100) + '%';
    b.val.textContent = txt;
    b.wrap.classList.toggle('warn', v / max < 0.22);
  }
  const t = localTempC(_v1.copy(player.pos).normalize(), localSunEl());
  let clock = `<span class="sol">SOL ${S.sol}</span><br>${fmtClock()} · ${t}°C`;
  if (S.mode === 'rover') clock += `<br><span style="font-size:11px">ROVER PWR ${Math.round(S.roverPower)} · O2 ${Math.round(S.roverO2)}</span>`;
  if (S.storm.i > 0.15) clock += '<br><span style="color:#ff6f5f;font-size:11px">⚠ DUST STORM</span>';
  UI.clock.innerHTML = clock;
  const danger = Math.max(1 - S.suit / (suitCap() * 0.25), 1 - S.health / 45, S.breach.active && S.inside ? 0.5 : 0);
  UI.vign.style.opacity = clamp(danger, 0, 1) * 0.9;
  UI.cold.style.opacity = clamp((-70 - t) / 40, 0, 1) * (S.inside ? 0 : 0.85);
  if (S.disco) S.stats.discoTime += 1 / 60;
}

// ============================================================
// 29. FULLSCREEN SCREENS: MAP / COLONY / JOURNAL
// ============================================================
function screenOpen() {
  return UI.mapScreen.style.display === 'block' || UI.colonyScreen.style.display === 'block' || UI.journalScreen.style.display === 'block';
}
function closeScreens() {
  UI.mapScreen.style.display = 'none';
  UI.colonyScreen.style.display = 'none';
  UI.journalScreen.style.display = 'none';
}
function toggleScreen(which) {
  const elMap = { map: UI.mapScreen, colony: UI.colonyScreen, journal: UI.journalScreen };
  const target = elMap[which];
  const wasOpen = target.style.display === 'block';
  closeScreens();
  if (!wasOpen) {
    target.style.display = 'block';
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    if (which === 'map') renderMap();
    if (which === 'colony') renderColony();
    if (which === 'journal') renderJournal();
    Snd.click();
  }
}

// --- map: progressive equirect base + live markers ---
const MAP_W = 720, MAP_H = 360;
const mapBase = document.createElement('canvas');
mapBase.width = MAP_W; mapBase.height = MAP_H;
let mapRow = 0;
function buildMapRows(budget) {
  const ctx = mapBase.getContext('2d');
  const img = ctx.createImageData(MAP_W, 1);
  const v = new THREE.Vector3();
  for (let n = 0; n < budget && mapRow < MAP_H; n++, mapRow++) {
    const lat = 90 - (mapRow + 0.5) / MAP_H * 180;
    for (let x = 0; x < MAP_W; x++) {
      const lon = (x + 0.5) / MAP_W * 360;
      llToVec(lat, lon, v);
      const hKm = marsHeightKm(v.x, v.y, v.z);
      const c = marsColor(v.x, v.y, v.z, hKm);
      // cheap hillshade from an eastward height sample
      llToVec(lat, lon + 0.7, _v3);
      const hE = marsHeightKm(_v3.x, _v3.y, _v3.z);
      const shade = clamp(1 + (hE - hKm) * 0.35, 0.62, 1.25);
      img.data[x * 4] = clamp(c.r * shade, 0, 1) * 255;
      img.data[x * 4 + 1] = clamp(c.g * shade, 0, 1) * 255;
      img.data[x * 4 + 2] = clamp(c.b * shade, 0, 1) * 255;
      img.data[x * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, mapRow);
  }
}
function llToMap(lat, lon) { return [((lon % 360) + 360) % 360 / 360 * MAP_W, (90 - lat) / 180 * MAP_H]; }
function posToMap(p) { const ll = vecToLl(_v1.copy(p).normalize()); return llToMap(ll.lat, ll.lon); }
let mapTimer = 0;
function renderMap() {
  const cv = UI.mapCanvas;
  cv.width = MAP_W; cv.height = MAP_H;
  cv.style.width = 'min(100%, 1200px)';
  const ctx = cv.getContext('2d');
  ctx.drawImage(mapBase, 0, 0);
  ctx.font = '9px monospace';
  // region labels
  ctx.fillStyle = 'rgba(255,230,200,0.75)';
  for (const r of REGIONS) {
    const [x, y] = llToMap(r.lat, r.lon);
    ctx.fillText(r.name, x - r.name.length * 2.2, y);
  }
  // storms
  for (const c of S.storm.cells) {
    const [x, y] = llToMap(c.lat, c.lon);
    ctx.beginPath();
    ctx.arc(x, y, c.r / (2 * Math.PI * R) * MAP_W, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(160,90,40,0.35)';
    ctx.fill();
  }
  const dot = (p, color, label) => {
    const [x, y] = posToMap(p);
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
    if (label) { ctx.fillStyle = color; ctx.fillText(label, x + 4, y + 3); }
  };
  for (const rec of World.landers) {
    if (S.discovered[rec.data.name]) dot(rec.group.position, '#9ecfff', rec.data.name);
    else if (S.flags.mapRevealed) dot(rec.group.position, 'rgba(158,207,255,0.45)', '?');
  }
  for (const b of World.builtMeshes)
    dot(b.group.position, b.kind === 'beacon' ? '#4fd8ff' : '#c0b090', b.kind === 'beacon' ? 'beacon' : '');
  for (const p of World.pods) if (!p.taken) dot(p.group.position, '#ffd27f', 'cache');
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) dot(World.pathfinder.position, '#ffef9e', 'PATHFINDER');
  dot(World.mav.position, S.flags.mavRevealed ? '#ff7f5f' : 'rgba(255,127,95,0.5)', 'ARES 4 MAV');
  dot(habGroup.position, '#7fff9e', 'HAB');
  dot(World.rover.group.position, '#ffb45e', 'rover');
  // player: white dot + facing tick
  {
    const [x, y] = posToMap(player.pos);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  UI.mapScreen.querySelector('#mg-maplegend').innerHTML =
    `SOL ${S.sol} · lat ${vecToLl(_v1.copy(player.pos).normalize()).lat.toFixed(1)}° lon ${vecToLl(_v1).lon.toFixed(1)}°E · ` +
    `discovered ${S.stats.discoveries} · storms shown as brown cells`;
}

// --- colony: inventory / fabrication / upgrades ---
function renderColony() {
  const inv = UI.colonyScreen.querySelector('#mg-inv');
  const craft = UI.colonyScreen.querySelector('#mg-craft');
  const build = UI.colonyScreen.querySelector('#mg-build');
  let html = '<h3>SUPPLIES</h3>';
  html += `<div class="mg-item"><span>Rations</span><span>${S.food}</span></div>`;
  html += `<div class="mg-item"><span>Potatoes</span><span>${S.potatoes}</span></div>`;
  html += `<div class="mg-item"><span>Water</span><span>${S.water.toFixed(0)}L</span></div>`;
  html += `<div class="mg-item"><span>Hydrazine burns</span><span>${S.hydrazine}</span></div>`;
  html += '<h3>MATERIALS</h3>';
  for (const k of ['scrap', 'circuit', 'regolith', 'ice', 'candle'])
    html += `<div class="mg-item"><span>${ITEM_NAMES[k]}</span><span>${S.inv[k] || 0}</span></div>`;
  html += '<h3>KITS (craft, then place outside)</h3>';
  for (const k of ['kitSolar', 'kitGreenhouse', 'kitBeacon', 'kitCache']) {
    const n = S.inv[k] || 0;
    html += `<div class="mg-item"><span>${ITEM_NAMES[k]}</span><span>${n}${n > 0 ? ` <button class="mg-btn" style="padding:2px 8px;font-size:10px" data-deploy="${k.slice(3).toLowerCase()}">DEPLOY</button>` : ''}</span></div>`;
  }
  if (S.flags.hasRtg && !S.upgrades.rtg) html += '<div class="mg-item"><span>RTG (unsocketed)</span><span>☢</span></div>';
  inv.innerHTML = html;
  inv.querySelectorAll('[data-deploy]').forEach(b => b.onclick = () => startDeploy(b.dataset.deploy));

  const atHome = nearHab();
  let ch = `<h3>FABRICATOR ${atHome ? '' : '— out of range (return to the Hab)'}</h3>`;
  for (const r of RECIPES) {
    const ok = atHome && hasCost(r.cost);
    ch += `<div class="mg-recipe"><div class="rn">${r.name}</div><div class="rc">${r.desc}<br>needs: ${costStr(r.cost)}</div>` +
      `<button data-r="${r.id}" ${ok ? '' : 'disabled'}>FABRICATE</button></div>`;
  }
  craft.innerHTML = ch;
  craft.querySelectorAll('button[data-r]').forEach(b => b.onclick = () => {
    const r = RECIPES.find(x => x.id === b.dataset.r);
    if (!r || !hasCost(r.cost) || !nearHab()) return;
    if (r.run) {
      const res = r.run();
      if (res !== true) { log(res, 'sys'); return; }
      payCost(r.cost);
    } else {
      payCost(r.cost);
      for (const k in r.gives) S.inv[k] = (S.inv[k] || 0) + r.gives[k];
    }
    S.stats.crafted++;
    Snd.craft();
    renderColony();
  });

  let uh = '<h3>UPGRADES</h3>';
  for (const u of UPGRADES) {
    if (S.upgrades[u.id]) { uh += `<div class="mg-recipe"><div class="rn">✓ ${u.name}</div><div class="rc">${u.desc}</div></div>`; continue; }
    let gate = null;
    if (u.bp && !S.blueprints[u.bp]) gate = 'blueprint required (survey tasks)';
    if (u.needs && !S.upgrades[u.needs]) gate = `requires ${UPGRADES.find(x => x.id === u.needs).name}`;
    if (u.needsRtg && !S.flags.hasRtg) gate = 'requires the buried RTG';
    const ok = atHome && !gate && hasCost(u.cost);
    uh += `<div class="mg-recipe"><div class="rn">${u.name}</div><div class="rc">${u.desc}<br>needs: ${costStr(u.cost)}${gate ? '<br>⚠ ' + gate : ''}</div>` +
      `<button data-u="${u.id}" ${ok ? '' : 'disabled'}>INSTALL</button></div>`;
  }
  build.innerHTML = uh;
  build.querySelectorAll('button[data-u]').forEach(b => b.onclick = () => {
    const u = UPGRADES.find(x => x.id === b.dataset.u);
    if (!u || S.upgrades[u.id] || !nearHab() || !hasCost(u.cost)) return;
    if (u.bp && !S.blueprints[u.bp]) return;
    if (u.needs && !S.upgrades[u.needs]) return;
    if (u.needsRtg && !S.flags.hasRtg) return;
    payCost(u.cost);
    S.upgrades[u.id] = true;
    S.stats.crafted++;
    Snd.craft();
    log(`Installed: ${u.name}. ${u.desc}.`);
    renderColony();
  });
}

// --- journal ---
function renderJournal() {
  const qEl = UI.journalScreen.querySelector('#mg-quests');
  const dEl = UI.journalScreen.querySelector('#mg-discoveries');
  const aEl = UI.journalScreen.querySelector('#mg-achievements');
  let qh = '<h3>NASA SURVEY TASKS</h3>';
  if (!S.pf.connected) qh += '<div class="mg-jrow locked"><div class="jn">No uplink</div><div class="jd">Restore Pathfinder to receive survey tasks.</div></div>';
  else for (const q of QUEST_DEFS) {
    const st = S.quests[q.id];
    const d = questTargetPos(q) ? ` — ${fmtDist(groundDist(player.pos, questTargetPos(q)))}` : '';
    qh += `<div class="mg-jrow${st === 'done' ? '' : ''}"><div class="jn">${st === 'done' ? '✓ ' : ''}${q.name}${d}</div><div class="jd">${q.desc}</div></div>`;
  }
  qEl.innerHTML = qh;
  let dh = `<h3>DISCOVERIES (${S.stats.discoveries})</h3>`;
  for (const rec of World.landers) {
    const known = S.discovered[rec.data.name];
    dh += `<div class="mg-jrow${known ? '' : ' locked'}"><div class="jn">${known ? rec.data.name + ' (' + rec.data.year + ')' : '??? — undiscovered lander'}</div>` +
      `<div class="jd">${known ? rec.data.note : 'Find it out there.'}</div></div>`;
  }
  for (const f of FEATURES) {
    if (f.type === 'bulge' || f.type === 'albedo' || !f.note) continue;
    const known = S.discovered[f.name];
    dh += `<div class="mg-jrow${known ? '' : ' locked'}"><div class="jn">${known ? f.name : '??? — uncharted region'}</div>` +
      `<div class="jd">${known ? f.note : ''}</div></div>`;
  }
  dEl.innerHTML = dh;
  let ah = '<h3>ACHIEVEMENTS</h3>';
  for (const a of ACHIEVEMENTS) {
    const got = S.achieved[a.id];
    ah += `<div class="mg-jrow ach${got ? '' : ' locked'}"><div class="jn">${got ? '★ ' : '☆ '}${a.name}</div><div class="jd">${a.desc}</div></div>`;
  }
  aEl.innerHTML = ah;
}

// ============================================================
// 30. CHECKPOINT & SAVE
// ============================================================
function serializeState() {
  return {
    v: 2, diff: S.diff, spawn: { lat: SPAWN.lat, lon: SPAWN.lon },
    sol: S.sol, tod: S.tod,
    o2: S.o2, water: S.water, food: S.food, potatoes: S.potatoes, power: S.power,
    health: Math.max(S.health, 50), suit: suitCap(), roverPower: S.roverPower, roverO2: S.roverO2,
    hydrazine: S.hydrazine,
    inv: { ...S.inv }, upgrades: { ...S.upgrades }, blueprints: { ...S.blueprints },
    quests: { ...S.quests }, salvaged: { ...S.salvaged }, discovered: { ...S.discovered },
    achieved: { ...S.achieved }, checkedSystems: { ...S.checkedSystems },
    flags: { ...S.flags }, stats: { ...S.stats },
    breach: { ...S.breach }, pf: { ...S.pf },
    stormCells: S.storm.cells.map(c => ({ ...c })),
    plots: World.plots.map(p => ({ state: p.state, growth: p.growth, watered: p.watered })),
    panels: World.panels.map(p => p.dust),
    piles: World.soilPiles.map(p => p.left),
    pods: World.pods.map(p => p.taken),
    podLoot: World.pods.map(p => ({ loot: p.loot, label: p.label, blueprint: p.blueprint || null,
      ll: vecToLl(_v1.copy(p.group.position).normalize()) })),
    ice: World.iceSites.map(s => s.left),
    rtgTaken: World.rtgSite ? World.rtgSite.taken : false,
    built: World.builtMeshes.map(b => ({ kind: b.kind, charges: b.charges,
      ll: vecToLl(_v1.copy(b.group.position).normalize()) })),
    playerQ: player.q.toArray(), roverQ: roverF.q.toArray(),
  };
}
function applyState(d) {
  Object.assign(S, {
    sol: d.sol, tod: d.tod, o2: d.o2, water: d.water, food: d.food, potatoes: d.potatoes,
    power: d.power, health: d.health, suit: d.suit, roverPower: d.roverPower, roverO2: d.roverO2,
    hydrazine: d.hydrazine,
  });
  S.inv = { ...d.inv }; S.upgrades = { ...d.upgrades }; S.blueprints = { ...d.blueprints };
  S.quests = { ...d.quests }; S.salvaged = { ...d.salvaged }; S.discovered = { ...d.discovered };
  S.achieved = { ...d.achieved }; S.checkedSystems = { ...d.checkedSystems };
  S.flags = { ...d.flags }; S.stats = { ...d.stats };
  S.breach = { ...d.breach }; S.pf = { ...d.pf };
  S.storm.cells = d.stormCells.map(c => ({ ...c }));
  S.storm.i = 0;
  // rebuild deployed structures FIRST so greenhouse plots exist before plot restore
  for (let i = World.builtMeshes.length; i < (d.built || []).length; i++) {
    const b = d.built[i];
    const bb = buildDeployable(b.kind, llToVec(b.ll.lat, b.ll.lon));
    bb.charges = b.charges;
  }
  d.plots.forEach((cp, i) => { if (World.plots[i]) Object.assign(World.plots[i], cp); });
  d.panels.forEach((v, i) => { if (World.panels[i]) World.panels[i].dust = v; });
  d.piles.forEach((v, i) => { if (World.soilPiles[i]) World.soilPiles[i].left = v; });
  // rebuild dynamically dropped pods missing from the world (load path)
  for (let i = World.pods.length; i < (d.podLoot || []).length; i++) {
    const pd = d.podLoot[i];
    const g = placeAt(pd.ll.lat, pd.ll.lon, 0);
    g.add(buildModel('supplyPod'));
    const pod = { group: g, kind: 'pod', taken: false, loot: pd.loot, label: pd.label };
    if (pd.blueprint) pod.blueprint = pd.blueprint;
    World.pods.push(pod);
  }
  d.pods.forEach((v, i) => { if (World.pods[i]) World.pods[i].taken = v; });
  d.ice.forEach((v, i) => { if (World.iceSites[i]) World.iceSites[i].left = v; });
  if (World.rtgSite) World.rtgSite.taken = d.rtgTaken;
  for (let i = 0; i < Math.min(World.builtMeshes.length, d.built.length); i++)
    World.builtMeshes[i].charges = d.built[i].charges;
  player.q.fromArray(d.playerQ);
  player.alt = 0; player.vy = 0;
  roverF.q.fromArray(d.roverQ);
  roverF.speed = 0;
  S.over = false; S.dead = null; S.sleeping = false; S.mode = 'walk'; S.uiOpen = false;
  Snd.alarm(false); Snd.disco(false); S.disco = false;
  UI.vign.style.opacity = 0;
  syncPlayerPos();
  syncRoverVisual(0);
  syncAllVisuals();
  hideOverlay();
}
let CHECKPOINT = null;
function checkpoint() {
  if (S.over) return;                    // review finding: never checkpoint a corpse
  CHECKPOINT = serializeState();
}
function restoreCheckpoint() {
  if (!CHECKPOINT) { try { location.reload(); } catch (e) {} return; }
  applyState(JSON.parse(JSON.stringify(CHECKPOINT)));
  log(`Woke at dawn, Sol ${S.sol}. Bad dream. Probably prophetic. Let's not test it.`);
}
const SAVE_KEY = 'stranded2-save';
function saveGame() {
  if (S.over || !S.started) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState())); } catch (e) {}
}
function loadSavedData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.v === 2 ? d : null;
  } catch (e) { return null; }
}
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

// ============================================================
// 31. LAUNCH CUTSCENE (ground → sky → orbit → Hermes)
// ============================================================
let hermes = null;
function startLaunch() {
  S.mode = 'cutscene';
  S.uiOpen = false;
  UI.prompt.style.display = 'none';
  closeScreens();
  const mavUp = _v1.copy(World.mav.position).normalize().clone();
  tangentBasis(mavUp, _pe, _pn);
  const camGround = World.mav.position.clone().addScaledVector(_pe, -26).addScaledVector(_pn, 20);
  camGround.normalize().multiplyScalar(surfaceAt(camGround) + 2.2);
  log('Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever.');
  if (S.pf.connected) {
    S.disco = true; Snd.disco(true);
    setTimeout(() => log('The playlist synced to the MAV. I\'m launching to disco. This is my life now.', 'nasa'), 3500);
  }
  [3, 2, 1].forEach((n, i) => setTimeout(() => { Snd.beep(700 + n * 60, 0.18, 'square', 0.15); log(`${n}...`, 'nasa'); }, 2000 + i * 1000));
  if (!hermes) {
    hermes = buildModel('hermes', 1.4);
    worldRoot.add(hermes);
  }
  hermes.position.copy(mavUp).multiplyScalar(R * 1.85).addScaledVector(_pe, R * 0.8);
  const liftT = 5.2;
  let t = 0, alt = 0;
  World.launchAnim = (dt) => {
    t += dt;
    if (t <= liftT) {
      CAM.pos.copy(camGround);
      camLookAt(_v2.copy(World.mav.position).addScaledVector(mavUp, 8), mavUp);
      return;
    }
    const lt = t - liftT;
    World.mavFlame.visible = true;
    Snd.rumble(clamp(lt * 0.5, 0, 0.85));
    alt = lt * lt * 14;
    World.mavRocket.position.y = 0.1 + alt;
    World.mavFlame.scale.y = 1 + Math.random() * 0.4;
    const rocketWorld = _v2.copy(World.mav.position).addScaledVector(mavUp, alt + 8);
    if (alt < 2200) {
      // chase from below-side
      CAM.pos.copy(camGround).addScaledVector(mavUp, alt * 0.55);
      S.shake = clamp(1.0 - lt * 0.06, 0, 1);
      CAM.pos.addScaledVector(_v3.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.5);
      camLookAt(rocketWorld, mavUp);
    } else {
      // pull out to orbit: watch the whole planet you survived
      const k = smoothstep(2200, 14000, alt);
      _v3.copy(mavUp).multiplyScalar(R * (1.15 + k * 1.3)).addScaledVector(_pe, R * 0.55 * k);
      CAM.pos.lerp(_v3, 1 - Math.pow(0.02, dt));
      camLookAt(k > 0.6 ? hermes.position : rocketWorld, mavUp);
      Snd.rumble(clamp(1 - k, 0.1, 0.85));
    }
    if (alt > 8000) hermes.position.lerp(_v2.copy(mavUp).multiplyScalar(R * 1.85), 1 - Math.pow(0.3, dt));
    if (alt > 15500 && !S.won) winGame();
  };
}

function winGame() {
  S.won = true;
  Snd.rumble(0);
  Snd.jingle();
  checkAchievements();
  setTimeout(() => Snd.disco(false), 6000);
  wipeSave();
  const st = S.stats;
  showOverlay({
    title: 'RESCUED',
    subtitle: `HERMES INTERCEPT CONFIRMED · SOL ${S.sol} · ${DIFFICULTIES[S.diff].name}`,
    body:
      `<b>Watney is off the surface.</b>\n\n` +
      `Sols survived: ${S.sol}\n` +
      `Potatoes farmed: ${st.potatoes}\n` +
      `Driven: ${(st.driven / 1000).toFixed(1)} km · Walked: ${(st.walked / 1000).toFixed(1)} km\n` +
      `Landmarks discovered: ${st.discoveries} · Landers salvaged: ${Object.keys(S.salvaged).length}\n` +
      `Achievements: ${Object.keys(S.achieved).length}/${ACHIEVEMENTS.length}\n` +
      `Close calls: ${st.closeCalls} · Indoor explosions: ${st.booms}\n\n` +
      `"Every human being has a basic instinct to help each other out.\n` +
      `If a hiker gets lost, people organize a search party. This is why\n` +
      `they came back for me." — M. Watney, space pirate, greatest botanist\n` +
      `on two planets.`,
    buttons: [{ label: 'PLAY AGAIN (new random site)', keep: true, fn: () => tryReload() }],
  });
}

// ============================================================
// 32. DEATH & PAUSE
// ============================================================
function tryReload() {
  try { location.reload(); } catch (e) {}
  // if the host blocked reload, the overlay stays up (keep:true) — say why
  setTimeout(() => toast('SYSTEM', 'Reload blocked by host page', 'Refresh the page manually to restart.'), 400);
}
function die(cause) {
  if (S.over) return;
  S.over = true;
  S.dead = cause;
  Snd.alarm(false); Snd.disco(false); Snd.bad(); Snd.rumble(0);
  const iron = S.diff === 'iron';
  if (iron) wipeSave();
  const buttons = [];
  if (!iron && CHECKPOINT) buttons.push({ label: `WAKE AT DAWN (SOL ${CHECKPOINT.sol})`, fn: () => restoreCheckpoint() });
  buttons.push({ label: 'RESTART FROM SOL 1', ghost: !iron, keep: true, fn: () => { wipeSave(); tryReload(); } });
  showOverlay({
    title: 'YOU DIED ON MARS',
    subtitle: `Sol ${S.sol} · ${(S.stats.driven / 1000).toFixed(1)} km driven · ${S.stats.potatoes} potatoes grown` + (iron ? ' · SPACE PIRATE: save deleted' : ''),
    body: cause + (iron ? '\n\nYou knew the deal.' : '\n\nNobody plants the flag on the first try.'),
    buttons,
  });
}

function showPause() {
  if (S.uiOpen || S.over || !S.started || S.mode === 'cutscene') return;
  saveGame();
  showOverlay({
    title: 'PAUSED',
    subtitle: 'progress saved. the potatoes are fine. probably.',
    body: 'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · JUMP <span class="kbd">SPACE</span> · INTERACT <span class="kbd">E</span> (hold)\n' +
      'O2 CANDLE <span class="kbd">X</span> · EXIT ROVER <span class="kbd">F</span> · MAP <span class="kbd">M</span> · COLONY <span class="kbd">C</span> · JOURNAL <span class="kbd">J</span>\n\n' +
      `Survive to Sol ${S.rescueSol}. Watch the six bars. The rover refills your suit;\n` +
      'the Hab refills the rover; the sun refills the Hab. Keep the chain alive.',
    buttons: [
      { label: 'RESUME', fn: () => tryLock() },
      { label: 'RESTART RUN', ghost: true, keep: true, fn: () => { wipeSave(); tryReload(); } },
    ],
  });
}

// ============================================================
// 33. BOOT & START
// ============================================================
let bootPhase = 'init';
function newGame(diffKey) {
  S.diff = diffKey;
  S.rescueSol = DIFFICULTIES[diffKey].rescueSol;
  S.drainMult = DIFFICULTIES[diffKey].drain;
  initStorms();                                   // before pickSpawn: it rejects storm cells
  SPAWN = pickSpawn(Math.random);
  // start the global sun so it is ~08:00 LOCAL time at the crash site
  S.tod = ((-(SPAWN.lon + 58.4) / 360) % 1 + 1) % 1;
  updateSunDir();
  buildWorldAtSpawn();
  // cold open: wake ~85m from the hab, suit leaking, facing home
  player.q.copy(habGroup.quaternion);
  frameMove(player.q, 0.3, 0.9, 85, R);
  syncPlayerPos();
  frameYaw(player.q, bearingTo(player.pos, habGroup.position, player.q));
  player.alt = 0; syncPlayerPos();
  S.started = true;
  if (!dragMode) tryLock();
  Snd.wind(0.2);
  log('Suit O2 at 46% and leaking. The Hab is that way. RUN.', 'sys');
  const ll = `lat ${SPAWN.lat.toFixed(1)}°, lon ${SPAWN.lon.toFixed(1)}°E — ${regionName(SPAWN.v)}`;
  setTimeout(() => log(`Crash site logged: ${ll}. Somewhere on Mars. Emphasis on "somewhere."`), 5500);
  checkpoint();
}
function continueGame(saved) {
  S.diff = saved.diff || 'survival';
  S.rescueSol = DIFFICULTIES[S.diff].rescueSol;
  S.drainMult = DIFFICULTIES[S.diff].drain;
  SPAWN = { lat: saved.spawn.lat, lon: saved.spawn.lon, v: llToVec(saved.spawn.lat, saved.spawn.lon) };
  buildWorldAtSpawn();
  initStorms();
  applyState(saved);
  S.started = true;
  CHECKPOINT = saved;
  if (!dragMode) tryLock();
  Snd.wind(0.2);
  log(`Sol ${S.sol}. Still here. Still farming. Still winning, technically.`);
}
let worldBuilt = false;
function buildWorldAtSpawn() {
  if (worldBuilt) return;
  worldBuilt = true;
  buildHabColony(SPAWN);
  initRoverAt(_v1.copy(World.rover.group.position).normalize(), 0.8);
  buildStorySites();
  updatePatch(SPAWN.v, null);
}

function showStart() {
  const saved = loadSavedData();
  const buttons = [];
  if (saved) buttons.push({ label: `▶ CONTINUE — SOL ${saved.sol}`, fn: () => { Snd.init(); Snd.resume(); continueGame(saved); } });
  buttons.push({
    label: saved ? 'NEW GAME (new random site)' : '▶ CLICK TO SUIT UP', ghost: !!saved,
    keep: true,
    fn: () => { Snd.init(); Snd.resume(); showDifficulty(); },
  });
  showOverlay({
    title: 'STRANDED II',
    subtitle: 'the whole planet. all of it. against you.',
    body:
      'The storm hit. The crew evac\'d. Your bio-monitor said you were dead.\n' +
      'It exaggerated. You are stranded <b>somewhere on Mars</b> — a real Mars:\n' +
      'Olympus Mons, Valles Marineris, both ice caps, and every probe humanity\n' +
      'ever threw at this planet, rusting exactly where history left it.\n\n' +
      'Grow food. Make water. Salvage the dead landers. Find Pathfinder in\n' +
      'Ares Vallis. Call home. Then drive to Schiaparelli crater and fly out.\n\n' +
      'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · INTERACT <span class="kbd">E</span> hold · MAP <span class="kbd">M</span> · COLONY <span class="kbd">C</span> · JOURNAL <span class="kbd">J</span>',
    buttons,
  });
}
function showDifficulty() {
  const mk = (k) => ({ label: DIFFICULTIES[k].name, ghost: k !== 'survival', fn: () => newGame(k) });
  showOverlay({
    title: 'CHOOSE YOUR MARS',
    body: Object.keys(DIFFICULTIES).map(k =>
      `<b>${DIFFICULTIES[k].name}</b>\n${DIFFICULTIES[k].desc}`).join('\n\n'),
    buttons: [mk('story'), mk('survival'), mk('iron')],
  });
}

// ============================================================
// 34. MAIN LOOP
// ============================================================
let lastT = perf(), startOrbitA = 0, mapOpenTimer = 0;
function frame() {
  requestAnimationFrame(frame);
  const now = perf();
  const dt = Math.min(now - lastT, 0.05);
  lastT = now;
  if (mapRow < MAP_H) buildMapRows(4);
  if (!S.started) {
    // title screen: slow drift over the DAY side of the real planet
    startOrbitA += dt * 0.012;
    updateSunDir();
    _v1.copy(sunDir).multiplyScalar(R * 2.6);
    _v2.set(-sunDir.z, 0, sunDir.x);              // sideways drift around the subsolar point
    CAM.pos.copy(_v1)
      .addScaledVector(_v2, Math.sin(startOrbitA) * R * 1.1)
      .setY(R * (0.5 + 0.35 * Math.sin(startOrbitA * 0.6)));
    camLookAt(_v3.set(0, 0, 0), _v2.set(0, 1, 0));
    updateSky();
    applyCamera();
    renderer.render(scene, camera);
    return;
  }
  if (S.over && S.mode !== 'cutscene') { applyCamera(); renderer.render(scene, camera); return; }
  if ((S.uiOpen || screenOpen()) && !S.sleeping) { applyCamera(); renderer.render(scene, camera); return; }
  if (S.mode === 'cutscene') {
    if (World.launchAnim) World.launchAnim(dt);
    updateSunDir();
    updateSky();
    updateDust(dt);
    applyCamera();
    renderer.render(scene, camera);
    return;
  }
  if (!S.sleeping) {
    advanceTime(dt);
    applyRates(dt, false);
    if (S.mode === 'walk') updateWalk(dt);
    else if (S.mode === 'rover') updateRover(dt);
    updateInteract(dt);
    updateDiscoveries(dt);
    updateDevil(dt, playerUnit());
    updatePing();
    // terrain patch follows whoever is moving
    const u = S.mode === 'rover' ? _v1.copy(World.rover.group.position).normalize() : playerUnit();
    _v2.set(0, 0, -1).applyQuaternion(S.mode === 'rover' ? roverF.q : player.q)
      .multiplyScalar(S.mode === 'rover' ? Math.abs(roverF.speed) : 0);
    updatePatch(u, _v2);
  }
  Snd.wind((S.inside ? 0.05 : 0.16) + S.storm.i * 0.65 + (S.breach.active && S.inside ? 0.4 : 0));
  blinkT += dt;
  World.beacon.material.emissive.setHex(Math.sin(blinkT * 5) > 0 ? 0x33ff66 : 0x0a3315);
  World.mavStrobe.material.emissive.setHex(Math.sin(blinkT * 7) > 0 ? 0xff4020 : 0x330a05);
  updateSky();
  updateDust(dt);
  updateHud();
  updateCompass();
  updateObjectivesHud();
  if (UI.mapScreen.style.display === 'block') {
    mapOpenTimer += dt;
    if (mapOpenTimer > 0.7) { mapOpenTimer = 0; renderMap(); }
  }
  applyCamera();
  renderer.render(scene, camera);
}
let blinkT = 0;

// pathfinder proximity geiger ping
let lastPing = 0;
function updatePing() {
  if (!S.flags.pfRevealed || S.pf.found || S.pf.loaded || S.pf.connected) return;
  const d = groundDist(player.pos, World.pathfinder.position);
  if (d > 90) return;
  const interval = clamp(d / 60, 0.12, 1.4);
  if (perf() - lastPing > interval) {
    lastPing = perf();
    Snd.beep(1200, 0.04, 'square', 0.05);
  }
  if (d < 10 && !S.pf.found) { S.pf.found = true; log('Signal source dead ahead. There you are.'); }
}

// ============================================================
// 35. GO
// ============================================================
buildGlobe();
patchA = mkPatchMesh();
patchB = mkPatchMesh();
buildRocks();
buildDust();
updateSunDir();

// debug/test handle
window.__MG = {
  S, World, player, roverF, CAM, BAL, DIFFICULTIES, FEATURES, LANDERS, REGIONS,
  llToVec, vecToLl, surfaceAt, marsHeightKm, groundDist, interactables,
  applyRates, advanceTime, newSol, checkpoint, restoreCheckpoint, serializeState, applyState,
  syncAllVisuals, initPlayerAt, initRoverAt, newGame, continueGame, get SPAWN() { return SPAWN; },
  tpTo(lat, lon) {
    initPlayerAt(llToVec(lat, lon), 0);
    updatePatch(llToVec(lat, lon), null);
  },
  tpRover(lat, lon) {
    initRoverAt(llToVec(lat, lon), 0);
  },
};

showStart();
frame();

})();
