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
  sunDir.set(Math.cos(a), 0, -Math.sin(a));
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
  let placed = 0;
  for (let cy = -cells; cy <= cells && placed < 420; cy++) {
    for (let cx = -cells; cx <= cells && placed < 420; cx++) {
      // world-stable cell id from the quantized cell-center direction
      _pd.copy(up).addScaledVector(_pe, cx * ROCK_CELL / R).addScaledVector(_pn, cy * ROCK_CELL / R).normalize();
      const qx = Math.round(_pd.x * R / ROCK_CELL), qy = Math.round(_pd.y * R / ROCK_CELL), qz = Math.round(_pd.z * R / ROCK_CELL);
      const h1 = hash3(qx, qy, qz), h2 = hash3(qx + 91, qy + 7, qz), h3 = hash3(qx, qy + 313, qz + 17);
      if (h1 < 0.45) continue;                       // not every cell has a rock
      // deterministic offset within the cell
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
  const rtgM = mkCyl(0.35, 0.35, 0.9, 0x3a3a3a, 0, 0.2, 0, rtg, 8);
  rtgM.rotation.z = 0.3;
  mkBox(0.7, 0.1, 0.7, 0xcc3322, 0, 0.7, 0, rtg, { emissive: 0x441111 });
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
  mkBox(2.4, 1.3, 4.2, 0xd8d0c0, 0, 1.35, 0, group);
  mkBox(2.0, 0.9, 1.6, 0x9ab0c0, 0, 2.35, 0.7, group, { transparent: true, opacity: 0.85 });
  mkBox(2.42, 0.2, 4.22, 0xc06a30, 0, 0.85, 0, group);
  const wheels = [];
  for (let i = 0; i < 6; i++) {
    const wx = (i % 2 === 0 ? -1.25 : 1.25), wz = -1.5 + Math.floor(i / 2) * 1.5;
    const w = mkCyl(0.55, 0.55, 0.45, 0x2a2a2a, wx, 0.55, wz, group, 12);
    w.rotation.z = Math.PI / 2;
    wheels.push(w);
  }
  const hl = new THREE.SpotLight(0xfff2d8, 0, 60, 0.5, 0.4);
  hl.position.set(0, 1.6, 2.1);
  group.add(hl);
  const hlT = new THREE.Object3D(); hlT.position.set(0, 0.6, 14);
  group.add(hlT); hl.target = hlT;
  World.rover = { group, wheels, headlight: hl, speed: 0 };
  World.roverCollider = { v: group.position.clone().normalize(), r: 2.6 };
  colliders.push(World.roverCollider);
}

function buildStorySites() {
  // Pathfinder at its real landing site (Ares Vallis)
  const pf = placeAt(19.13, 326.79, 0.7);
  mkCyl(1.1, 1.3, 0.5, 0xb0a890, 0, 0.3, 0, pf, 8);
  for (let i = 0; i < 3; i++) {
    const petal = mkBox(1.7, 0.06, 1.5, 0x2c3c60, Math.cos(i * 2.1) * 1.55, 0.52, Math.sin(i * 2.1) * 1.55, pf);
    petal.rotation.y = -i * 2.1; petal.rotation.z = 0.12;
  }
  mkCyl(0.05, 0.05, 1.5, 0x8a8a8a, 0, 1.3, 0, pf, 6);
  mkBox(0.35, 0.22, 0.2, 0x9a9a9a, 0, 2.1, 0, pf);
  // Sojourner!
  mkBox(0.45, 0.2, 0.6, 0x4a5a88, 2.6, 0.18, 1.2, pf);
  World.pathfinder = pf;
  World.pfCollider = { v: pf.position.clone().normalize(), r: 2.2 };
  colliders.push(World.pfCollider);

  // Ares 4 MAV waits inside Schiaparelli crater
  const mav = placeAt(-1.9, 15.9, 0);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(7, 24),
    new THREE.MeshLambertMaterial({ color: 0x5a5a5a }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.08;
  mav.add(pad);
  const rocket = new THREE.Group(); rocket.position.y = 0.1; mav.add(rocket);
  mkCyl(1.5, 1.7, 7, 0xd8d0c0, 0, 5.4, 0, rocket, 16);
  World.mavNose = mkCyl(0.02, 1.5, 2.6, 0xc06a30, 0, 10.2, 0, rocket, 16);
  mkCyl(0.9, 1.3, 1.2, 0x4a4a4a, 0, 1.4, 0, rocket, 12);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const leg = mkCyl(0.12, 0.16, 3.2, 0x8a8a8a, Math.cos(a) * 2.1, 1.5, Math.sin(a) * 2.1, rocket, 6);
    leg.rotation.z = Math.cos(a) * 0.5; leg.rotation.x = -Math.sin(a) * 0.5;
  }
  World.mavStrobe = mkBox(0.4, 0.4, 0.4, 0xff4020, 0, 11.8, 0, rocket, { emissive: 0xff4020 });
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
    if (isRover) {
      mkBox(1.6, 0.7, 2.2, 0xb8bcc4, 0, 0.75, 0, g);
      mkBox(1.7, 0.06, 1.5, 0x2c3c60, 0, 1.2, 0, g);
      for (let i = 0; i < 6; i++)
        mkCyl(0.28, 0.28, 0.2, 0x2a2a2a, (i % 2 ? 0.95 : -0.95), 0.3, -0.8 + Math.floor(i / 2) * 0.8, g, 10).rotation.z = Math.PI / 2;
      mkCyl(0.05, 0.05, 1.0, 0x9a9a9a, 0.4, 1.7, 0.7, g, 6);
    } else {
      mkCyl(1.0, 1.2, 0.6, 0xb0a890, 0, 0.5, 0, g, 8);
      for (let i = 0; i < 3; i++) {
        const a = i * 2.1;
        mkCyl(0.06, 0.08, 1.1, 0x8a8a8a, Math.cos(a) * 1.1, 0.25, Math.sin(a) * 1.1, g, 6).rotation.z = Math.cos(a) * 0.7;
      }
      mkBox(1.4, 0.05, 1.0, 0x2c3c60, 0, 0.85, 0, g);
    }
    if (L.name === 'Perseverance') mkBox(0.5, 0.5, 0.5, 0x9ab0c0, 2.4, 0.3, 1.5, g);   // Ingenuity!
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
    mkCyl(0.14, 0.18, 1.1, 0x5a5a5a, 0, 0.55, 0, g, 8);
    const p = mkBox(3.0, 0.1, 2.0, 0x1c2c50, 0, 1.15, 0, g);
    p.rotation.x = -0.42;
  } else if (kind === 'greenhouse') {
    const domeM = new THREE.Mesh(new THREE.SphereGeometry(4.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: 0xaad4cc, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    g.add(domeM);
    const fl = new THREE.Mesh(new THREE.CircleGeometry(4.1, 18),
      new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = 0.05;
    g.add(fl);
    for (let i = 0; i < 4; i++)
      addFarmPlot(g, -1.1 + (i % 2) * 2.2, -1.2 + Math.floor(i / 2) * 2.4, false);
  } else if (kind === 'beacon') {
    mkCyl(0.05, 0.07, 2.6, 0x9a9a9a, 0, 1.3, 0, g, 6);
    mkBox(0.22, 0.22, 0.22, 0x33ccff, 0, 2.7, 0, g, { emissive: 0x1188cc });
  } else if (kind === 'o2cache') {
    mkCyl(0.4, 0.4, 1.3, 0x7fd4ff, 0, 0.65, 0, g, 10);
    mkBox(0.5, 0.2, 0.3, 0x5a6a72, 0, 1.4, 0, g);
  }
  const b = { kind, group: g, v: g.position.clone().normalize(), charges: kind === 'o2cache' ? 3 : 0 };
  World.builtMeshes.push(b);
  return b;
}

// supply pod (quest rewards) — lands near the hab
function dropSupplyPod(loot, label) {
  const ang = srand() * Math.PI * 2, dist = 40 + srand() * 30;
  const g = placeOffset(habGroup, Math.sin(ang) * dist, Math.cos(ang) * dist, 0);
  mkCyl(0.9, 1.2, 1.8, 0xc06a30, 0, 0.9, 0, g, 10);
  mkBox(1.6, 0.06, 1.6, 0xd8d0c0, 0, 2.2, 0, g).rotation.x = 0.4;   // crumpled chute
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
  if (k === 'f' && S.mode === 'rover') exitRover();
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
  for (const w of World.rover.wheels) w.rotation.x += RV.speed * dt * 1.8;
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
  if (ev.key.toLowerCase() !== 'x' || !S.started || S.uiOpen || S.over) return;
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
  visible: () => Math.abs(roverF.speed) < 1.5,
  label: () => 'Step out',
  sub: () => localSunEl() < 0.05 ? 'or hold to camp: sleep here until dawn' : '',
  use: () => exitRover(),
});
addI({
  pos: () => World.rover.group.position, r: 1e9, hold: 2.2, mode: 'rover', priority: 1,
  visible: () => Math.abs(roverF.speed) < 1.5 && localSunEl() < 0.05,
  label: () => 'Camp in the rover until dawn',
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
      if (b.kind !== 'o2cache' || b.charges <= 0) continue;
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
      groundDist(player.pos, habGroup.position) < 800 && !S.flags.coldOpen && S.mode !== 'cutscene') {
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
    mkCyl(0.9, 1.2, 1.8, 0xc06a30, 0, 0.9, 0, g, 10);
    mkBox(1.6, 0.06, 1.6, 0xd8d0c0, 0, 2.2, 0, g).rotation.x = 0.4;
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
        if (d > 2000 && b.kind === 'o2cache') cache = true;
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
  let h = ((ll.lon - S.tod * 360) / 360 * 24.66 + 12) % 24.66;
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
  if (S.flags.pfRevealed && !S.pf.connected) dot(World.pathfinder.position, '#ffef9e', 'PATHFINDER');
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
  d.plots.forEach((cp, i) => { if (World.plots[i]) Object.assign(World.plots[i], cp); });
  d.panels.forEach((v, i) => { if (World.panels[i]) World.panels[i].dust = v; });
  d.piles.forEach((v, i) => { if (World.soilPiles[i]) World.soilPiles[i].left = v; });
  // rebuild dynamically dropped pods missing from the world (load path)
  for (let i = World.pods.length; i < (d.podLoot || []).length; i++) {
    const pd = d.podLoot[i];
    const g = placeAt(pd.ll.lat, pd.ll.lon, 0);
    mkCyl(0.9, 1.2, 1.8, 0xc06a30, 0, 0.9, 0, g, 10);
    mkBox(1.6, 0.06, 1.6, 0xd8d0c0, 0, 2.2, 0, g).rotation.x = 0.4;
    const pod = { group: g, kind: 'pod', taken: false, loot: pd.loot, label: pd.label };
    if (pd.blueprint) pod.blueprint = pd.blueprint;
    World.pods.push(pod);
  }
  d.pods.forEach((v, i) => { if (World.pods[i]) World.pods[i].taken = v; });
  d.ice.forEach((v, i) => { if (World.iceSites[i]) World.iceSites[i].left = v; });
  if (World.rtgSite) World.rtgSite.taken = d.rtgTaken;
  // rebuild deployed structures missing from the world (load path); never remove extras
  for (let i = World.builtMeshes.length; i < d.built.length; i++) {
    const b = d.built[i];
    const bb = buildDeployable(b.kind, llToVec(b.ll.lat, b.ll.lon));
    bb.charges = b.charges;
  }
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
    hermes = new THREE.Group();
    mkBox(30, 8, 8, 0xd8d8e0, 0, 0, 0, hermes);
    mkBox(4, 26, 2, 0x2c3c60, -10, 0, 0, hermes);
    mkBox(4, 26, 2, 0x2c3c60, 10, 0, 0, hermes);
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
    buttons: [{ label: 'PLAY AGAIN (new random site)', fn: () => { try { location.reload(); } catch (e) {} } }],
  });
}

// ============================================================
// 32. DEATH & PAUSE
// ============================================================
function die(cause) {
  if (S.over) return;
  S.over = true;
  S.dead = cause;
  Snd.alarm(false); Snd.disco(false); Snd.bad(); Snd.rumble(0);
  const iron = S.diff === 'iron';
  if (iron) wipeSave();
  const buttons = [];
  if (!iron && CHECKPOINT) buttons.push({ label: `WAKE AT DAWN (SOL ${CHECKPOINT.sol})`, fn: () => restoreCheckpoint() });
  buttons.push({ label: 'RESTART FROM SOL 1', ghost: !iron, fn: () => { wipeSave(); try { location.reload(); } catch (e) {} } });
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
      { label: 'RESTART RUN', ghost: true, fn: () => { wipeSave(); try { location.reload(); } catch (e) {} } },
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
  SPAWN = pickSpawn(Math.random);
  // start the global sun so it is ~08:00 LOCAL time at the crash site
  S.tod = (((SPAWN.lon + 58.4) / 360) % 1 + 1) % 1;
  updateSunDir();
  buildWorldAtSpawn();
  // cold open: wake ~85m from the hab, suit leaking, facing home
  player.q.copy(habGroup.quaternion);
  frameMove(player.q, 0.3, 0.9, 85, R);
  syncPlayerPos();
  frameYaw(player.q, bearingTo(player.pos, habGroup.position, player.q));
  player.alt = 0; syncPlayerPos();
  initStorms();
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
  if (S.uiOpen && !S.sleeping) { applyCamera(); renderer.render(scene, camera); return; }
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
