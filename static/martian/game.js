/*
 * STRANDED — A Martian Survival Game
 * Browser-based 3D survival inspired by "The Martian".
 * Requires three.js r147 (UMD, global THREE). No other dependencies.
 * All assets are procedural: geometry, canvas textures, WebAudio synthesis.
 */
(() => {
'use strict';

if (typeof THREE === 'undefined') {
  document.body.innerHTML = '<div style="color:#fff;font-family:monospace;padding:40px">Failed to load three.js — the game cannot start.</div>';
  return;
}

// ============================================================
// 1. CONFIG & BALANCE
// ============================================================
const SOL_LEN = 200;          // real seconds per sol (day + night)
const DAY_FRAC = 0.68;        // fraction of sol that is daylight
const RESCUE_SOL = 12;        // MAV launch window opens
const BREACH_SOL = 7;         // scripted hab breach
const STORM_SOLS = [5, 9];    // scripted dust storms
const WORLD_R = 640;          // soft world boundary

const BAL = {
  o2Max: 100,
  o2DrainInside: 22 / SOL_LEN,       // per second, hab life support share
  o2DrainOutside: 46 / SOL_LEN,      // EVA suits are thirsty
  o2Gen: 42 / SOL_LEN,               // oxygenator output while powered
  o2BreachDrain: 210 / SOL_LEN,      // extra drain while hab is breached
  waterMax: 120,
  waterDrain: 6 / SOL_LEN,           // drinking / humidity loss
  waterRecl: 4.5 / SOL_LEN,          // reclaimer recycling while powered
  waterPerDose: 5,                   // one watering-can dose for a plot
  hydrazineWater: 28,                // liters per hydrazine burn
  hydrazineUses: 3,
  powerMax: 100,
  powerBase: 34 / SOL_LEN,           // life support draw
  solarGen: 118 / SOL_LEN,           // full clean array at high noon
  dustRate: 0.055 / SOL_LEN,         // panel dust accumulation, calm weather
  stormDustRate: 0.75 / SOL_LEN,     // panel dust accumulation in a storm
  stormGenMult: 0.14,
  foodStart: 10,                     // ration packs
  potatoYield: 4,                    // meals per harvested plot
  growSols: 2.4,                     // sols from planted to harvestable
  waterings: 2,                      // doses needed across growth
  healthMax: 100,
  starveDrain: 16 / SOL_LEN,         // health loss per empty resource (food/water)
  suffocateDrain: 10,                // health per second at 0% O2
  healRegen: 4 / SOL_LEN,
  sleepHeal: 10,
  walkSpeed: 5.2,
  runSpeed: 9.0,
  roverSpeed: 15.5,
  gravity: 3.71 * 2.2,               // Mars gravity, cheated up for game feel
};

const SITES = {
  hab:        { x: 0,    z: 0,    r: 55 },
  pathfinder: { x: -238, z: 212,  r: 24 },
  mav:        { x: 378,  z: -298, r: 34 },
};
const DOOR_ANGLE = 0;               // hab door faces +Z
const HAB_R = 8.4;                  // interior radius
const UPLINK_POS = { x: 11.5, z: 7.5 };
const ROVER_START = { x: 15, z: 15 };

// Watney's log — sol-start lines and event lines.
const SOL_LOGS = {
  1: "Log, Sol 1. Storm hit. Crew evac'd. An antenna went through my bio-monitor, so the suit told everyone I was dead. Surprise: I'm not. I'm just... alone. On Mars.",
  2: "Sol 2. Did the math. Rations won't last to rescue. I'm going to have to science the sh*t out of this.",
  3: "Sol 3. Today's agenda: farming. On a planet where nothing grows. I am the greatest botanist on this planet.",
  4: "Sol 4. Fun fact: Pathfinder landed out there in '97 and just... stopped calling home. If I find it, I can call home.",
  5: "Sol 5. Mars weather report: dust, followed by dust, with a chance of dust.",
  6: "Sol 6. The potatoes sprouted. I cried a little. Don't tell the potatoes.",
  7: "Sol 7. Something feels off today. Probably nothing. On Mars, 'probably nothing' has a body count.",
  8: "Sol 8. Every day this planet tries to kill me, and every day I make it breakfast instead. Take that.",
  9: "Sol 9. More weather incoming. My solar panels and I would like a word with this planet's management.",
  10: "Sol 10. Two sols to the launch window. Started saying goodbye to the Hab. It's been a terrible roommate.",
  11: "Sol 11. Tomorrow I climb into a rocket another crew left behind, and I trust math with my life. Again.",
  12: "Sol 12. Launch day. Time to fly a convertible to space. This is fine.",
};

// ============================================================
// 2. DOM, CSS, HUD
// ============================================================
const CSS = `
#mg-root, #mg-root * { box-sizing: border-box; margin: 0; padding: 0; }
#mg-root { position: fixed; inset: 0; background: #000; overflow: hidden;
  font-family: "Lucida Console", Monaco, "Courier New", monospace; color: #f2d8b8;
  -webkit-user-select: none; user-select: none; }
#mg-root canvas { position: absolute; inset: 0; display: block; }
.mg-hud { position: absolute; pointer-events: none; }
#mg-vitals { left: 16px; top: 16px; width: 210px; }
.mg-bar { margin-bottom: 7px; font-size: 11px; letter-spacing: 1px; }
.mg-bar .lb { display: flex; justify-content: space-between; margin-bottom: 2px;
  text-shadow: 0 1px 2px #000; }
.mg-bar .tk { height: 8px; background: rgba(0,0,0,.55); border: 1px solid rgba(242,216,184,.35); }
.mg-bar .fl { height: 100%; transition: width .3s; }
.mg-bar.warn .fl { animation: mg-blink 1s infinite; }
@keyframes mg-blink { 50% { opacity: .35; } }
#mg-clock { right: 16px; top: 16px; text-align: right; font-size: 13px;
  letter-spacing: 1px; text-shadow: 0 1px 3px #000; line-height: 1.6; }
#mg-clock .sol { font-size: 22px; color: #ffb45e; }
#mg-compass { left: 50%; top: 12px; transform: translateX(-50%); width: 460px; height: 34px;
  overflow: hidden; border-bottom: 1px solid rgba(242,216,184,.25); }
.mg-cmark { position: absolute; top: 2px; transform: translateX(-50%); text-align: center;
  font-size: 10px; letter-spacing: 1px; text-shadow: 0 1px 2px #000; white-space: nowrap; }
.mg-cmark .ic { font-size: 13px; }
#mg-objectives { right: 16px; top: 86px; width: 250px; font-size: 11.5px; text-align: right; }
#mg-objectives .ttl { color: #ffb45e; letter-spacing: 2px; margin-bottom: 6px;
  text-shadow: 0 1px 2px #000; }
.mg-obj { margin-bottom: 5px; text-shadow: 0 1px 2px #000; line-height: 1.35; }
.mg-obj.done { color: #7fca7f; text-decoration: line-through; opacity: .7; }
#mg-log { left: 16px; bottom: 16px; width: 460px; font-size: 12px; line-height: 1.45; }
.mg-line { margin-top: 6px; background: rgba(10,5,2,.55); padding: 6px 9px;
  border-left: 2px solid #ffb45e; opacity: 1; transition: opacity 1.2s; }
.mg-line.nasa { border-left-color: #6fb7ff; color: #cfe6ff; }
.mg-line.sys { border-left-color: #ff5f4f; color: #ffc9c2; }
.mg-line.fade { opacity: 0; }
#mg-prompt { left: 50%; bottom: 21%; transform: translateX(-50%); text-align: center;
  font-size: 14px; letter-spacing: 1px; text-shadow: 0 1px 3px #000; }
#mg-prompt .key { display: inline-block; border: 1px solid #f2d8b8; padding: 1px 7px;
  margin-right: 6px; border-radius: 3px; background: rgba(0,0,0,.5); }
#mg-hold { width: 130px; height: 5px; margin: 7px auto 0; background: rgba(0,0,0,.6);
  border: 1px solid rgba(242,216,184,.4); display: none; }
#mg-hold .fl { height: 100%; width: 0%; background: #ffb45e; }
#mg-crosshair { left: 50%; top: 50%; transform: translate(-50%,-50%); font-size: 15px;
  opacity: .55; text-shadow: 0 1px 2px #000; }
#mg-vign { inset: 0; background: radial-gradient(ellipse at center, transparent 55%, rgba(120,0,0,.65) 100%);
  opacity: 0; transition: opacity .8s; }
#mg-flash { inset: 0; background: #fff; opacity: 0; }
#mg-overlay { position: absolute; inset: 0; display: none; align-items: center;
  justify-content: center; background: rgba(8,3,1,.82); pointer-events: auto; z-index: 20; }
#mg-panel { max-width: 620px; width: 92%; max-height: 86vh; overflow-y: auto;
  border: 1px solid rgba(242,216,184,.4); background: rgba(16,8,4,.96); padding: 28px 32px; }
#mg-panel h1 { font-size: 26px; letter-spacing: 4px; color: #ffb45e; margin-bottom: 4px; }
#mg-panel h2 { font-size: 13px; letter-spacing: 2px; color: #c9a27c; margin-bottom: 18px; }
#mg-panel .bd { font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
#mg-panel .bd b { color: #ffb45e; }
#mg-panel .comms { font-size: 13px; line-height: 1.7; min-height: 180px; }
#mg-panel .comms .n { color: #6fb7ff; }
#mg-panel .comms .w { color: #f2d8b8; }
#mg-panel .btns { margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
#mg-panel button { font-family: inherit; font-size: 13px; letter-spacing: 2px; cursor: pointer;
  background: #ffb45e; color: #241105; border: 0; padding: 10px 22px; }
#mg-panel button.ghost { background: transparent; color: #f2d8b8;
  border: 1px solid rgba(242,216,184,.5); }
#mg-panel button:hover { filter: brightness(1.15); }
#mg-panel .kbd { display: inline-block; border: 1px solid rgba(242,216,184,.5);
  padding: 0 6px; border-radius: 3px; margin: 0 2px; font-size: 12px; }
#mg-hint { left: 50%; top: 56px; transform: translateX(-50%); font-size: 11px;
  letter-spacing: 1px; opacity: .75; text-shadow: 0 1px 2px #000; }
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
  ['water', 'H2O',   '#6fb7ff'],
  ['food',  'FOOD',  '#d8c26f'],
  ['power', 'PWR',   '#7fca7f'],
  ['health','VITALS','#ff8f7f'],
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
UI.hint = el('div', 'mg-hint', 'mg-hud', null, '');
UI.objectives = el('div', 'mg-objectives', 'mg-hud');
UI.log = el('div', 'mg-log', 'mg-hud');
UI.prompt = el('div', 'mg-prompt', 'mg-hud');
UI.promptText = el('div', null, null, UI.prompt);
UI.hold = el('div', 'mg-hold', null, UI.prompt, '<div class="fl"></div>');
UI.holdFill = UI.hold.querySelector('.fl');
UI.crosshair = el('div', 'mg-crosshair', 'mg-hud', null, '+');
UI.vign = el('div', 'mg-vign', 'mg-hud');
UI.flash = el('div', 'mg-flash', 'mg-hud');
UI.overlay = el('div', 'mg-overlay', null);
UI.panel = el('div', 'mg-panel', null, UI.overlay);

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

// Watney log feed (typewriter)
const logTimers = new Set();
function log(text, cls) {
  const line = el('div', null, 'mg-line' + (cls ? ' ' + cls : ''), UI.log);
  let i = 0;
  const prefix = cls === 'nasa' ? '[NASA] ' : cls === 'sys' ? '[HAB] ' : '[LOG] ';
  const full = prefix + text;
  const t = setInterval(() => {
    i += 2;
    line.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(t); logTimers.delete(t);
      setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 1400); }, 9000);
    }
  }, 16);
  logTimers.add(t);
  while (UI.log.children.length > 5) UI.log.firstChild.remove();
}

// ============================================================
// 3. UTILS & NOISE
// ============================================================
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const dist2d = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// Deterministic seeded RNG for world generation
let _seed = 1337;
function srand() { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; }

function hashN(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hashN(xi, yi), b = hashN(xi + 1, yi), c = hashN(xi, yi + 1), d = hashN(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function terrainRaw(x, z) {
  let h = 0;
  h += (vnoise(x * 0.006, z * 0.006) - 0.5) * 17;
  h += (vnoise(x * 0.021 + 40, z * 0.021 - 17) - 0.5) * 5.5;
  h += (vnoise(x * 0.07 - 9, z * 0.07 + 31) - 0.5) * 1.15;
  return h;
}
const SITE_FLATS = {};
for (const k in SITES) SITE_FLATS[k] = terrainRaw(SITES[k].x, SITES[k].z);

function terrainH(x, z) {
  let h = terrainRaw(x, z);
  for (const k in SITES) {
    const s = SITES[k];
    const d = dist2d(x, z, s.x, s.z);
    if (d < s.r + 46) {
      const t = smoothstep(s.r, s.r + 46, d);
      h = lerp(SITE_FLATS[k], h, t);
    }
  }
  return h;
}

// ============================================================
// 4. AUDIO (WebAudio synthesis, all optional)
// ============================================================
const Snd = {
  ctx: null, master: null, windGain: null, rumbleGain: null,
  discoOn: false, discoTimer: null, alarmTimer: null,
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      // wind: looped noise -> bandpass -> gain
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 260; bp.Q.value = 0.6;
      this.windGain = this.ctx.createGain(); this.windGain.gain.value = 0;
      src.connect(bp); bp.connect(this.windGain); this.windGain.connect(this.master);
      src.start();
      // rocket rumble: noise -> lowpass -> gain
      const src2 = this.ctx.createBufferSource();
      src2.buffer = buf; src2.loop = true;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 110;
      this.rumbleGain = this.ctx.createGain(); this.rumbleGain.gain.value = 0;
      src2.connect(lp); lp.connect(this.rumbleGain); this.rumbleGain.connect(this.master);
      src2.start();
    } catch (e) { this.ctx = null; }
  },
  resume() { try { this.ctx && this.ctx.state === 'suspended' && this.ctx.resume(); } catch (e) {} },
  _lastWind: -1, _lastRumble: -1,
  wind(level) {
    if (!this.windGain) return;
    const v = clamp(level, 0, 1) * 0.5;
    if (Math.abs(v - this._lastWind) < 0.01) return;
    this._lastWind = v;
    try {
      this.windGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.windGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.6);
    } catch (e) {}
  },
  rumble(level) {
    if (!this.rumbleGain) return;
    const v = clamp(level, 0, 1);
    if (Math.abs(v - this._lastRumble) < 0.01) return;
    this._lastRumble = v;
    try {
      this.rumbleGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.rumbleGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.3);
    } catch (e) {}
  },
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
  jingle() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.22, 'triangle', 0.16), i * 130));
  },
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
    this.discoOn = on;
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
// 5. GAME STATE
// ============================================================
const S = {
  started: false, paused: false, uiOpen: false, over: false, won: false, mode: 'walk', // walk|rover|cutscene
  sol: 1, tod: 0.02,               // time of day 0..1 (0 = dawn)
  o2: 100, water: 42, food: BAL.foodStart, potatoes: 0, power: 72, health: 100,
  soil: 0, hydrazine: BAL.hydrazineUses,
  inside: false,
  storm: { active: false, i: 0, doneSol: 0 },
  breach: { active: false, done: false, cropsKilled: false, timer: 0 },
  pf: { found: false, loaded: false, connected: false },
  disco: false,
  checkedSystems: new Set(),
  stats: { potatoes: 0, panels: 0, evaTime: 0, driven: 0, closeCalls: 0, booms: 0 },
  holdT: 0, holdTarget: null,
  shake: 0,
  dead: null,
};

// ============================================================
// 6. RENDERER, SKY, LIGHTS, TERRAIN
// ============================================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
root.insertBefore(renderer.domElement, root.firstChild);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc98a5b, 0.0016);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 3000);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Sky dome with vertical gradient shader
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    top: { value: new THREE.Color(0xc4703f) },
    bottom: { value: new THREE.Color(0xe8a06a) },
  },
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP;' +
    'void main(){ float h = normalize(vP).y; float t = pow(max(h, 0.0), 0.55);' +
    'gl_FragColor = vec4(mix(bottom, top, t), 1.0); }',
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 24, 12), skyMat);
scene.add(sky);

// Sun sprite
function radialTex(inner, outer, stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, inner, 64, 64, outer);
  for (const [t, col] of stops) grad.addColorStop(t, col);
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const sunTex = radialTex(2, 60, [[0, 'rgba(255,245,225,1)'], [0.25, 'rgba(255,230,190,0.9)'], [1, 'rgba(255,220,170,0)']]);
const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true }));
sun.scale.set(260, 260, 1);
scene.add(sun);

// Stars
{
  const n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = srand() * Math.PI * 2, ph = Math.acos(srand() * 0.95);
    const r = 1300;
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var stars = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  scene.add(stars);
}
// Phobos — the faster moon
const phobos = new THREE.Mesh(new THREE.DodecahedronGeometry(9, 0),
  new THREE.MeshBasicMaterial({ color: 0xb9a695, fog: false }));
scene.add(phobos);

const sunLight = new THREE.DirectionalLight(0xffe0c0, 1.0);
scene.add(sunLight);
scene.add(sunLight.target);
const hemiLight = new THREE.HemisphereLight(0xd9b090, 0x5c3020, 0.55);
scene.add(hemiLight);

// Terrain
const TERRAIN_SIZE = 1400, TERRAIN_SEG = 160;
{
  const g = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEG, TERRAIN_SEG);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c1 = new THREE.Color(0x9a4a28), c2 = new THREE.Color(0xb86038), c3 = new THREE.Color(0x7a3a20);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrainH(x, z);
    pos.setY(i, h);
    const m = vnoise(x * 0.04 + 7, z * 0.04 - 3);
    tmp.copy(c1).lerp(c2, m).lerp(c3, smoothstep(-2, -8, h) * 0.55);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  var terrain = new THREE.Mesh(g, m);
  scene.add(terrain);
}

// Scattered rocks (instanced) + colliders for the big ones
const colliders = [];   // { x, z, r }
{
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0x8a4526 });
  const count = 420;
  const rocks = new THREE.InstancedMesh(geo, mat, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3();
  let placed = 0, guard = 0;
  while (placed < count && guard++ < 5000) {
    const x = (srand() - 0.5) * 1200, z = (srand() - 0.5) * 1200;
    let nearSite = false;
    for (const k in SITES) if (dist2d(x, z, SITES[k].x, SITES[k].z) < SITES[k].r * 0.85) nearSite = true;
    if (nearSite) continue;
    const s = 0.35 + Math.pow(srand(), 2.4) * 3.4;
    e.set(srand() * 3, srand() * 3, srand() * 3);
    q.setFromEuler(e);
    sc.set(s * (0.7 + srand() * 0.7), s * (0.5 + srand() * 0.6), s * (0.7 + srand() * 0.7));
    m4.compose(new THREE.Vector3(x, terrainH(x, z) + s * 0.15, z), q, sc);
    rocks.setMatrixAt(placed, m4);
    if (s > 1.9) colliders.push({ x, z, r: s * 0.95 });
    placed++;
  }
  rocks.instanceMatrix.needsUpdate = true;
  scene.add(rocks);
}

// Ambient dust field, recycled around the camera
const DUST_N = 550, DUST_BOX = 90;
let dustPts;
{
  const pos = new Float32Array(DUST_N * 3);
  for (let i = 0; i < DUST_N; i++) {
    pos[i * 3] = (srand() - 0.5) * DUST_BOX;
    pos[i * 3 + 1] = srand() * 26;
    pos[i * 3 + 2] = (srand() - 0.5) * DUST_BOX;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dustTex = radialTex(4, 62, [[0, 'rgba(255,235,215,0.9)'], [0.6, 'rgba(255,225,195,0.35)'], [1, 'rgba(255,220,180,0)']]);
  dustPts = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xd8a070, size: 0.55, transparent: true, opacity: 0.25, depthWrite: false, map: dustTex }));
  scene.add(dustPts);
}

// Day palette control
const PAL = {
  day:  { top: 0xb96a3c, bot: 0xe8a06a, fog: 0xc98a5b, sun: 1.05, hemi: 0.6, amb: 0xd9b090 },
  dusk: { top: 0x4a2a4a, bot: 0xd06a3a, fog: 0x8a5038, sun: 0.35, hemi: 0.3, amb: 0xb08060 },
  night:{ top: 0x050308, bot: 0x1a0f12, fog: 0x120a08, sun: 0.0, hemi: 0.07, amb: 0x404060 },
};
const _cA = new THREE.Color(), _cB = new THREE.Color();
function mixCol(target, hexA, hexB, t) { _cA.set(hexA); _cB.set(hexB); target.copy(_cA).lerp(_cB, t); }

function daylight() {
  // 1 at midday, 0 at night
  if (S.tod < DAY_FRAC) return Math.sin(Math.PI * S.tod / DAY_FRAC);
  return 0;
}

function updateSky() {
  const d = daylight();
  const duskiness = smoothstep(0.25, 0.02, d);   // near sunrise/sunset
  const night = S.tod >= DAY_FRAC;
  const stormDim = 1 - S.storm.i * 0.72;
  let a, b, t;
  if (night) { a = 'night'; b = 'night'; t = 0; }
  else if (duskiness > 0) { a = 'day'; b = 'dusk'; t = duskiness; }
  else { a = 'day'; b = 'day'; t = 0; }
  mixCol(skyMat.uniforms.top.value, PAL[a].top, PAL[b].top, t);
  mixCol(skyMat.uniforms.bottom.value, PAL[a].bot, PAL[b].bot, t);
  const fogC = scene.fog.color;
  mixCol(fogC, PAL[a].fog, PAL[b].fog, t);
  // storm tints everything butterscotch-brown and thickens fog
  if (S.storm.i > 0) {
    fogC.lerp(_cA.set(0x8a4a24), S.storm.i * 0.8);
    skyMat.uniforms.top.value.lerp(_cA.set(0x6a3418), S.storm.i * 0.85);
    skyMat.uniforms.bottom.value.lerp(_cA.set(0x9a5228), S.storm.i * 0.85);
  }
  scene.fog.density = 0.0016 + S.storm.i * 0.0105 + (night ? 0.0006 : 0);
  sunLight.intensity = lerp(PAL[a].sun, PAL[b].sun, t) * stormDim;
  hemiLight.intensity = (night ? PAL.night.hemi : lerp(PAL[a].hemi, PAL[b].hemi, t)) * lerp(1, 0.5, S.storm.i);
  stars.material.opacity = night ? clamp((S.tod - DAY_FRAC) * 14, 0, 1) * (1 - S.storm.i) : 0;
  // sun position arcs east -> west
  const ang = Math.PI * (S.tod / DAY_FRAC);
  const sunDir = new THREE.Vector3(Math.cos(ang), Math.sin(ang) * 0.85, -0.35).normalize();
  sun.position.copy(camera.position).addScaledVector(sunDir, 1250);
  sun.material.opacity = night ? 0 : (1 - S.storm.i * 0.92);
  sunLight.position.copy(camera.position).addScaledVector(sunDir, 300);
  sunLight.target.position.copy(camera.position);
  // Phobos zips across the sky twice a sol
  const pAng = (S.tod * 4.4) % 2 * Math.PI;
  phobos.position.copy(camera.position).add(new THREE.Vector3(Math.cos(pAng) * 1100, Math.sin(pAng) * 700 + 150, 500));
  phobos.visible = night || d < 0.35;
}

// ============================================================
// 7. STRUCTURES
// ============================================================
const World = { plots: [], panels: [], soilPiles: [] };

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

const habY = terrainH(0, 0);
const DOOR_HALF = 0.16;             // half-angle of the door gap in the hab wall

// --- Hab exterior ---
{
  const hab = new THREE.Group();
  hab.position.set(0, habY, 0);
  scene.add(hab);
  World.hab = hab;
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xcfc0a8, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(HAB_R, HAB_R, 3.4, 40, 1, true, DOOR_HALF, Math.PI * 2 - DOOR_HALF * 2),
    wallMat);
  wall.position.y = 1.7;
  hab.add(wall);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(HAB_R, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), wallMat);
  dome.scale.y = 0.55;
  dome.position.y = 3.4;
  hab.add(dome);
  // door frame + lintel
  const fx = Math.sin(DOOR_HALF) * HAB_R, fz = Math.cos(DOOR_HALF) * HAB_R;
  mkBox(0.25, 2.6, 0.5, 0x8a8378, fx, 1.3, fz, hab);
  mkBox(0.25, 2.6, 0.5, 0x8a8378, -fx, 1.3, fz, hab);
  mkBox(2 * fx + 0.25, 0.9, 0.5, 0x8a8378, 0, 2.95, fz, hab);
  // floor
  const floor = new THREE.Mesh(new THREE.CircleGeometry(HAB_R - 0.05, 40),
    new THREE.MeshLambertMaterial({ color: 0x9a9284 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.06;
  hab.add(floor);
  // beacon on top
  const beacon = mkBox(0.3, 0.3, 0.3, 0x33ff66, 0, 5.4, 0, hab, { emissive: 0x33ff66 });
  World.beacon = beacon;
  // interior lights
  const l1 = new THREE.PointLight(0xffe6c8, 0.95, 22);
  l1.position.set(0, 3.0, 0);
  hab.add(l1);
  const l2 = new THREE.PointLight(0xffd9b0, 0.5, 14);
  l2.position.set(3, 2.4, -4);
  hab.add(l2);
  World.habLights = [l1, l2];

  // --- farm plots ---
  for (let i = 0; i < 6; i++) {
    const px = -5.2 + (i % 2) * 2.0;
    const pz = -3.2 + Math.floor(i / 2) * 2.4;
    const plot = new THREE.Group();
    plot.position.set(px, 0.06, pz);
    hab.add(plot);
    const tray = mkBox(1.6, 0.34, 1.9, 0x6b6459, 0, 0.17, 0, plot);
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
    colliders.push({ x: px, z: pz, r: 0.85 });
    World.plots.push({
      group: plot, soilMesh: soil, plants, tray,
      state: 'empty',        // empty -> soil -> growing -> ready (-> dead)
      growth: 0, watered: 0, pos: { x: px, z: pz },
    });
  }

  // --- equipment (interior, hab-local coords) ---
  const oxy = new THREE.Group(); oxy.position.set(5.6, 0.06, -3.6); hab.add(oxy);
  mkBox(1.6, 2.0, 1.1, 0x7a8a92, 0, 1.0, 0, oxy);
  World.oxyLight = mkBox(0.16, 0.16, 0.1, 0x33ff66, 0.4, 1.6, 0.58, oxy, { emissive: 0x33ff66 });
  mkCyl(0.1, 0.1, 1.6, 0x5a6a72, -0.5, 2.4, 0, oxy);
  World.oxygenator = oxy;
  colliders.push({ x: 5.6, z: -3.6, r: 1.1 });

  const rec = new THREE.Group(); rec.position.set(5.9, 0.06, -0.4); hab.add(rec);
  mkBox(1.3, 1.2, 1.0, 0x6a7a88, 0, 0.6, 0, rec);
  mkCyl(0.45, 0.45, 1.5, 0x4a7ab0, 0, 1.95, 0, rec, 12);
  World.reclaimer = rec;
  colliders.push({ x: 5.9, z: -0.4, r: 0.95 });

  const hyd = new THREE.Group(); hyd.position.set(5.5, 0.06, 2.6); hab.add(hyd);
  mkCyl(0.5, 0.5, 1.4, 0xb0a24a, 0, 0.7, 0, hyd, 12);
  mkBox(0.9, 0.5, 0.7, 0x4a4a4a, 0, 0.25, 0.85, hyd);
  World.hydFlame = mkCyl(0.12, 0.26, 0.5, 0xffa030, 0, 0.75, 0.85, hyd, 8, { emissive: 0xff7020 });
  World.hydFlame.visible = false;
  World.hydrazineRig = hyd;
  colliders.push({ x: 5.5, z: 2.6, r: 0.95 });

  const comms = new THREE.Group(); comms.position.set(0, 0.06, -6.6); hab.add(comms);
  mkBox(2.4, 0.1, 1.0, 0x8a8378, 0, 0.85, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, -1.0, 0.42, 0, comms);
  mkBox(0.12, 0.85, 0.8, 0x6a655c, 1.0, 0.42, 0, comms);
  World.commsScreen = mkBox(1.5, 0.9, 0.08, 0x101418, 0, 1.55, -0.15, comms, { emissive: 0x000000 });
  World.comms = comms;
  colliders.push({ x: 0, z: -6.6, r: 1.2 });

  const bunk = new THREE.Group(); bunk.position.set(-5.0, 0.06, -4.9); hab.add(bunk);
  mkBox(1.1, 0.4, 2.3, 0x7a7268, 0, 0.2, 0, bunk);
  mkBox(1.0, 0.18, 2.1, 0xa89a80, 0, 0.5, 0, bunk);
  mkBox(0.8, 0.16, 0.5, 0xcfc0a8, 0, 0.6, -0.75, bunk);
  World.bunk = bunk;
  colliders.push({ x: -5.0, z: -4.9, r: 1.1 });

  const shelf = new THREE.Group(); shelf.position.set(4.2, 0.06, 4.8); hab.add(shelf);
  mkBox(1.8, 1.7, 0.6, 0x7a7268, 0, 0.85, 0, shelf);
  for (let i = 0; i < 6; i++)
    mkBox(0.4, 0.3, 0.4, 0xc0842f, -0.6 + (i % 3) * 0.6, 0.5 + Math.floor(i / 3) * 0.75, 0.12, shelf);
  World.shelf = shelf;
  colliders.push({ x: 4.2, z: 4.8, r: 1.0 });

  // breach hole (hidden until the event) — on the back wall, interior side
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.75, 20),
    new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide }));
  hole.position.set(0, 1.7, -HAB_R + 0.02);
  hole.visible = false;
  hab.add(hole);
  World.breachHole = hole;
  const patch = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xb0b0b8, side: THREE.DoubleSide }));
  patch.position.set(0, 1.7, -HAB_R + 0.04);
  patch.visible = false;
  hab.add(patch);
  World.breachPatch = patch;
}

// --- Solar array ---
{
  const baseX = -30, baseZ = 4;
  for (let i = 0; i < 8; i++) {
    const px = baseX - Math.floor(i / 4) * 5.5;
    const pz = baseZ + (i % 4) * 4.6;
    const py = terrainH(px, pz);
    const g = new THREE.Group();
    g.position.set(px, py, pz);
    scene.add(g);
    mkCyl(0.14, 0.18, 1.1, 0x5a5a5a, 0, 0.55, 0, g, 8);
    const panel = mkBox(3.4, 0.1, 2.2, 0x1c2c50, 0, 1.15, 0, g);
    panel.rotation.x = -0.42;
    panel.material = panel.material.clone();
    colliders.push({ x: px, z: pz, r: 1.0 });
    World.panels.push({ group: g, mesh: panel, dust: 0.25 + i * 0.06, pos: { x: px, z: pz } });
  }
}

// --- Rover ---
{
  const rover = new THREE.Group();
  rover.position.set(ROVER_START.x, terrainH(ROVER_START.x, ROVER_START.z), ROVER_START.z);
  rover.rotation.y = Math.PI + Math.PI / 2;   // matches heading = PI in updateRover
  scene.add(rover);
  const body = mkBox(2.4, 1.3, 4.2, 0xd8d0c0, 0, 1.35, 0, rover);
  mkBox(2.0, 0.9, 1.6, 0x9ab0c0, 0, 2.35, 0.7, rover, { transparent: true, opacity: 0.85 });
  mkBox(2.42, 0.2, 4.22, 0xc06a30, 0, 0.85, 0, rover);
  const wheels = [];
  for (let i = 0; i < 6; i++) {
    const wx = (i % 2 === 0 ? -1.25 : 1.25);
    const wz = -1.5 + Math.floor(i / 2) * 1.5;
    const w = mkCyl(0.55, 0.55, 0.45, 0x2a2a2a, wx, 0.55, wz, rover, 12);
    w.rotation.z = Math.PI / 2;
    wheels.push(w);
  }
  const hl = new THREE.SpotLight(0xfff2d8, 0, 60, 0.5, 0.4);
  hl.position.set(0, 1.6, 2.1);
  rover.add(hl);
  const hlTarget = new THREE.Object3D();
  hlTarget.position.set(0, 0.6, 14);
  rover.add(hlTarget);
  hl.target = hlTarget;
  World.rover = { group: rover, wheels, headlight: hl, heading: Math.PI, speed: 0 };
  colliders.push(World.roverCollider = { x: rover.position.x, z: rover.position.z, r: 2.6 });
}

// --- Soil piles (regolith) ---
{
  const spots = [[22, -8], [26, 6], [-14, 24], [8, 27], [-24, -16], [16, -22]];
  for (const [x, z] of spots) {
    const y = terrainH(x, z);
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0x6e3418 }));
    m.position.set(x, y - 0.55, z);
    m.scale.y = 0.55;
    scene.add(m);
    World.soilPiles.push({ mesh: m, left: 2, pos: { x, z } });
  }
}

// --- Uplink pad (dish next to the hab) ---
{
  const g = new THREE.Group();
  g.position.set(UPLINK_POS.x, terrainH(UPLINK_POS.x, UPLINK_POS.z), UPLINK_POS.z);
  scene.add(g);
  mkCyl(0.1, 0.14, 1.3, 0x6a6a6a, 0, 0.65, 0, g, 8);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new THREE.MeshLambertMaterial({ color: 0xd8d0c0, side: THREE.DoubleSide }));
  dish.position.y = 1.5;
  dish.rotation.x = -0.9;
  g.add(dish);
  World.uplink = g;
  colliders.push({ x: UPLINK_POS.x, z: UPLINK_POS.z, r: 0.8 });
  // pathfinder parking spot marker (painted ring)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0xffb45e }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(UPLINK_POS.x - 4.5, terrainH(UPLINK_POS.x - 4.5, UPLINK_POS.z + 2) + 0.1, UPLINK_POS.z + 2);
  scene.add(ring);
  World.uplinkRing = ring;
}

// --- Pathfinder (out in the wastes) ---
{
  const s = SITES.pathfinder;
  const g = new THREE.Group();
  g.position.set(s.x, terrainH(s.x, s.z) - 0.12, s.z);
  g.rotation.y = 0.7; g.rotation.z = 0.06;
  scene.add(g);
  const bodyMat = { color: 0xb0a890 };
  mkCyl(1.1, 1.3, 0.5, 0xb0a890, 0, 0.3, 0, g, 8);
  for (let i = 0; i < 3; i++) {
    const petal = mkBox(1.7, 0.06, 1.5, 0x2c3c60, 0, 0.52, 0, g);
    petal.position.x = Math.cos(i * 2.1) * 1.55;
    petal.position.z = Math.sin(i * 2.1) * 1.55;
    petal.rotation.y = -i * 2.1;
    petal.rotation.z = 0.12;
  }
  const mast = mkCyl(0.05, 0.05, 1.5, 0x8a8a8a, 0, 1.3, 0, g, 6);
  mkBox(0.35, 0.22, 0.2, 0x9a9a9a, 0, 2.1, 0, g);
  World.pathfinder = g;
  colliders.push(World.pfCollider = { x: s.x, z: s.z, r: 2.2 });
  // small crater rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6, 1.1, 8, 24),
    new THREE.MeshLambertMaterial({ color: 0x7a3a20 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.set(s.x, terrainH(s.x, s.z) - 0.75, s.z);
  scene.add(rim);
}

// --- MAV (the ride home) ---
{
  const s = SITES.mav;
  const y = terrainH(s.x, s.z);
  const g = new THREE.Group();
  g.position.set(s.x, y, s.z);
  scene.add(g);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(7, 24),
    new THREE.MeshLambertMaterial({ color: 0x5a5a5a }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.08;
  g.add(pad);
  const rocket = new THREE.Group();
  rocket.position.y = 0.1;
  g.add(rocket);
  mkCyl(1.5, 1.7, 7, 0xd8d0c0, 0, 5.4, 0, rocket, 16);
  World.mavNose = mkCyl(0.02, 1.5, 2.6, 0xc06a30, 0, 10.2, 0, rocket, 16);
  mkCyl(0.9, 1.3, 1.2, 0x4a4a4a, 0, 1.4, 0, rocket, 12);
  for (let i = 0; i < 4; i++) {
    const leg = mkCyl(0.12, 0.16, 3.2, 0x8a8a8a, 0, 1.4, 0, rocket, 6);
    const a = i * Math.PI / 2 + Math.PI / 4;
    leg.position.set(Math.cos(a) * 2.1, 1.5, Math.sin(a) * 2.1);
    leg.rotation.z = Math.cos(a) * 0.5;
    leg.rotation.x = -Math.sin(a) * 0.5;
  }
  const strobe = mkBox(0.4, 0.4, 0.4, 0xff4020, 0, 11.8, 0, rocket, { emissive: 0xff4020 });
  World.mavStrobe = strobe;
  // engine flame (hidden until launch)
  const flame = mkCyl(0.9, 0.25, 5, 0xffc060, 0, -1.8, 0, rocket, 10, { emissive: 0xff9030, transparent: true, opacity: 0.95 });
  flame.visible = false;
  World.mavFlame = flame;
  World.mav = g;
  World.mavRocket = rocket;
  colliders.push({ x: s.x, z: s.z, r: 3.4 });
}

// ============================================================
// 8. PLAYER, CONTROLS, ROVER
// ============================================================
const player = {
  x: 34, z: 96, y: 0, vy: 0, yaw: 0.34, pitch: -0.05,
  eyeH: 1.62, onGround: true, bob: 0,
};
camera.rotation.order = 'YXZ';

const keys = {};
let eHeld = false;
window.addEventListener('keydown', (ev) => {
  if (ev.repeat) return;
  const k = ev.key.toLowerCase();
  keys[k] = true;
  if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) ev.preventDefault();
  if (k === 'e') eHeld = true;
  if (k === 'escape' && S.started && !S.over && S.mode !== 'cutscene') {
    if (S.uiOpen) { /* overlay button flows handle themselves */ }
    else showPause();
  }
  if (k === 'f' && S.mode === 'rover') exitRover();
});
window.addEventListener('keyup', (ev) => {
  const k = ev.key.toLowerCase();
  keys[k] = false;
  if (k === 'e') { eHeld = false; S.holdT = 0; }
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; eHeld = false; });

// Mouse look: pointer lock with drag fallback
let pointerLocked = false, dragMode = false, dragging = false, lastMX = 0, lastMY = 0;
function tryLock() {
  if (dragMode || S.uiOpen) return;
  try {
    const p = renderer.domElement.requestPointerLock && renderer.domElement.requestPointerLock();
    if (p && p.catch) p.catch(() => { dragMode = true; });
    // some sandboxes silently ignore the request — fall back to drag-look
    setTimeout(() => { if (!pointerLocked && !S.uiOpen) dragMode = true; }, 700);
  } catch (e) { dragMode = true; }
}
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  if (!pointerLocked && S.started && !S.uiOpen && !S.over && S.mode !== 'cutscene') showPause();
});
document.addEventListener('pointerlockerror', () => { dragMode = true; });
renderer.domElement.addEventListener('mousedown', (ev) => {
  if (!S.started || S.uiOpen) return;
  if (!pointerLocked && !dragMode) tryLock();
  if (dragMode) { dragging = true; lastMX = ev.clientX; lastMY = ev.clientY; }
});
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', (ev) => {
  if (!S.started || S.uiOpen || S.mode === 'cutscene') return;
  let dx = 0, dy = 0;
  if (pointerLocked) { dx = ev.movementX || 0; dy = ev.movementY || 0; }
  else if (dragMode && dragging) {
    dx = ev.clientX - lastMX; dy = ev.clientY - lastMY;
    lastMX = ev.clientX; lastMY = ev.clientY;
  } else return;
  player.yaw -= dx * 0.0024;
  player.pitch = clamp(player.pitch - dy * 0.0022, -1.45, 1.45);
});

function groundY(x, z) { return terrainH(x, z); }

function collide(px, pz, rad) {
  // circular colliders
  for (const c of colliders) {
    if (S.mode === 'rover' && c === World.roverCollider) continue;
    const d = dist2d(px, pz, c.x, c.z);
    const min = c.r + rad;
    if (d < min && d > 0.0001) {
      px = c.x + (px - c.x) / d * min;
      pz = c.z + (pz - c.z) / d * min;
    }
  }
  // hab wall ring (with door gap)
  const hd = dist2d(px, pz, 0, 0);
  const wallHalf = 0.55 + rad * 0.5;
  if (Math.abs(hd - HAB_R) < wallHalf && hd > 0.001) {
    const ang = Math.atan2(px, pz);      // 0 at +Z (door)
    if (Math.abs(ang) > DOOR_HALF + 0.06) {
      const target = hd < HAB_R ? HAB_R - wallHalf : HAB_R + wallHalf;
      px = px / hd * target; pz = pz / hd * target;
    }
  }
  // world edge
  const wd = Math.hypot(px, pz);
  if (wd > WORLD_R) {
    px = px / wd * WORLD_R; pz = pz / wd * WORLD_R;
    edgeWarn();
  }
  return [px, pz];
}
let lastEdgeWarn = -99;
function edgeWarn() {
  if (perf() - lastEdgeWarn > 25) {
    lastEdgeWarn = perf();
    log('Suit nav: nothing that way but regret and more Mars. Turning around.', 'sys');
  }
}
function perf() { return performance.now() / 1000; }

function updateWalk(dt) {
  const run = (keys['shift'] && S.suit > 1);
  const spd = run ? BAL.runSpeed : BAL.walkSpeed;
  let mx = 0, mz = 0;
  if (keys['w'] || keys['arrowup']) mz -= 1;
  if (keys['s'] || keys['arrowdown']) mz += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  const moving = (mx || mz);
  if (moving) {
    const l = Math.hypot(mx, mz); mx /= l; mz /= l;
    const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
    // forward = (-sin yaw, -cos yaw), right = (cos yaw, -sin yaw)
    const wx = mx * cos + mz * sin;
    const wz = mz * cos - mx * sin;
    let nx = player.x + wx * spd * dt;
    let nz = player.z + wz * spd * dt;
    [nx, nz] = collide(nx, nz, 0.42);
    player.x = nx; player.z = nz;
    player.bob += dt * (run ? 11 : 7);
  }
  // gravity / jump
  const gy = groundY(player.x, player.z);
  if (player.onGround && (keys[' '])) { player.vy = 4.6; player.onGround = false; }
  player.vy -= BAL.gravity * dt;
  player.y += player.vy * dt;
  if (player.y <= gy) { player.y = gy; player.vy = 0; player.onGround = true; }
  const bobY = (moving && player.onGround) ? Math.sin(player.bob) * 0.055 : 0;
  camera.position.set(player.x, player.y + player.eyeH + bobY, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
  // sprint FOV ease
  const targetFov = (moving && run) ? 80 : 72;
  camera.fov = lerp(camera.fov, targetFov, 1 - Math.pow(0.001, dt));
  camera.updateProjectionMatrix();
  // camera shake
  if (S.shake > 0) {
    S.shake = Math.max(0, S.shake - dt * 1.6);
    camera.position.x += (Math.random() - 0.5) * S.shake * 0.4;
    camera.position.y += (Math.random() - 0.5) * S.shake * 0.4;
  }
  S.inside = dist2d(player.x, player.z, 0, 0) < HAB_R - 0.3;
}

// --- Rover driving ---
function enterRover() {
  S.mode = 'rover';
  Snd.click();
  log('Rover systems: nominal. Radio: still disco. Unfortunately.', 'sys');
}
function exitRover() {
  const R = World.rover;
  S.mode = 'walk';
  const sx = R.group.position.x + Math.cos(R.heading) * 3.2;
  const sz = R.group.position.z - Math.sin(R.heading) * 3.2;
  const [px, pz] = collide(sx, sz, 0.42);
  player.x = px; player.z = pz;
  player.y = groundY(px, pz);
  player.vy = 0;
  Snd.click();
}
function updateRover(dt) {
  const R = World.rover;
  let acc = 0;
  if (keys['w'] || keys['arrowup']) acc = 10;
  if (keys['s'] || keys['arrowdown']) acc = -7;
  R.speed += acc * dt;
  R.speed *= Math.pow(0.35, dt);           // drag
  R.speed = clamp(R.speed, -6, BAL.roverSpeed);
  const steer = ((keys['a'] || keys['arrowleft']) ? 1 : 0) - ((keys['d'] || keys['arrowright']) ? 1 : 0);
  if (Math.abs(R.speed) > 0.4)
    R.heading += steer * dt * 1.6 * clamp(Math.abs(R.speed) / 6, 0.3, 1) * Math.sign(R.speed);
  let nx = R.group.position.x + Math.cos(R.heading) * R.speed * dt;
  let nz = R.group.position.z - Math.sin(R.heading) * R.speed * dt;
  const before = [nx, nz];
  [nx, nz] = collide(nx, nz, 2.0);
  if (before[0] !== nx || before[1] !== nz) R.speed *= 0.5;
  S.stats.driven += Math.abs(R.speed) * dt;
  R.group.position.x = nx; R.group.position.z = nz;
  // terrain follow + tilt
  const h = groundY(nx, nz);
  const ahead = groundY(nx + Math.cos(R.heading) * 2, nz - Math.sin(R.heading) * 2);
  const behind = groundY(nx - Math.cos(R.heading) * 2, nz + Math.sin(R.heading) * 2);
  const left = groundY(nx - Math.sin(R.heading) * 1.4, nz - Math.cos(R.heading) * 1.4);
  const right = groundY(nx + Math.sin(R.heading) * 1.4, nz + Math.cos(R.heading) * 1.4);
  R.group.position.y = lerp(R.group.position.y, h, 1 - Math.pow(0.002, dt));
  R.group.rotation.y = R.heading + Math.PI / 2;
  const pitch = Math.atan2(ahead - behind, 4), roll = Math.atan2(left - right, 2.8);
  R.group.rotation.x = lerp(R.group.rotation.x, -pitch, 1 - Math.pow(0.01, dt));
  R.group.rotation.z = lerp(R.group.rotation.z, roll, 1 - Math.pow(0.01, dt));
  for (const w of World.rover.wheels) w.rotation.x += R.speed * dt * 1.8;
  World.roverCollider.x = nx; World.roverCollider.z = nz;
  // headlights at night / storm
  World.rover.headlight.intensity = (daylight() < 0.25 || S.storm.i > 0.5) ? 2.2 : 0;
  // chase camera
  const camT = new THREE.Vector3(
    nx - Math.cos(R.heading) * 9.5,
    R.group.position.y + 4.6,
    nz + Math.sin(R.heading) * 9.5);
  camera.position.lerp(camT, 1 - Math.pow(0.0005, dt));
  camera.lookAt(nx, R.group.position.y + 1.8, nz);
  camera.fov = lerp(camera.fov, 74 + Math.abs(R.speed), 1 - Math.pow(0.001, dt));
  camera.updateProjectionMatrix();
  S.inside = false;
  // driving audio
  if (Math.random() < dt * 8 && Math.abs(R.speed) > 2) Snd.beep(55 + Math.random() * 20, 0.08, 'sawtooth', 0.03);
}

// ============================================================
// 9. INTERACTION SYSTEM
// ============================================================
const interactables = [];
function addI(def) { interactables.push(def); }

function playerNear(x, z, r) {
  const px = S.mode === 'rover' ? World.rover.group.position.x : player.x;
  const pz = S.mode === 'rover' ? World.rover.group.position.z : player.z;
  return dist2d(px, pz, x, z) < r;
}
function roverNear(x, z, r) {
  return dist2d(World.rover.group.position.x, World.rover.group.position.z, x, z) < r;
}

let activeI = null, lastActiveI = null;
function updateInteract(dt) {
  activeI = null;
  if (S.uiOpen || S.over || S.mode === 'cutscene') { UI.prompt.style.display = 'none'; return; }
  let best = null, bestD = 1e9;
  for (const it of interactables) {
    if (it.mode && it.mode !== S.mode) continue;
    const p = it.pos();
    const px = S.mode === 'rover' ? World.rover.group.position.x : player.x;
    const pz = S.mode === 'rover' ? World.rover.group.position.z : player.z;
    const d = dist2d(px, pz, p.x, p.z);
    if (d > it.r) continue;
    if (it.visible && !it.visible()) continue;
    if (d < bestD) { bestD = d; best = it; }
  }
  if (!best) { UI.prompt.style.display = 'none'; S.holdT = 0; lastActiveI = null; return; }
  activeI = best;
  if (best !== lastActiveI) { S.holdT = 0; lastActiveI = best; }
  const en = best.enabled ? best.enabled() : true;
  UI.prompt.style.display = 'block';
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
// 10. FARMING & ALL INTERACTABLES
// ============================================================
function plotWorldPos(pl) { return { x: pl.pos.x, z: pl.pos.z }; }

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
function syncAllVisuals() {
  for (const pl of World.plots) syncPlot(pl);
  for (const p of World.panels) p.mesh.material.color.set(new THREE.Color(0x1c2c50).lerp(new THREE.Color(0x8a5a34), clamp(p.dust, 0, 1)));
  for (const sp of World.soilPiles) {
    sp.mesh.visible = sp.left > 0;
    const sc = 0.6 + sp.left * 0.35;
    sp.mesh.scale.set(sc, sc * 0.55, sc);
  }
  World.breachHole.visible = S.breach.active;
  World.breachPatch.visible = S.breach.done && !S.breach.active;
  World.commsScreen.material.emissive.set(S.pf.connected ? 0x2a4a7a : 0x000000);
  World.oxyLight.material.emissive.set(S.power > 0.5 ? 0x33ff66 : 0x331111);
  World.oxyLight.material.color.set(S.power > 0.5 ? 0x33ff66 : 0x662222);
  for (const l of World.habLights) l.intensity = S.power > 0.5 ? (l === World.habLights[0] ? 0.95 : 0.5) : 0.08;
  // pathfinder attach states
  const pfG = World.pathfinder;
  if (S.pf.connected) {
    if (pfG.parent !== scene) scene.attach(pfG);
    pfG.position.set(UPLINK_POS.x - 2.2, terrainH(UPLINK_POS.x - 2.2, UPLINK_POS.z + 1) + 0.1, UPLINK_POS.z + 1);
    pfG.rotation.set(0, 0.3, 0);
    World.uplinkRing.visible = false;
  } else if (S.pf.loaded) {
    if (pfG.parent !== World.rover.group) {
      World.rover.group.add(pfG);
      pfG.position.set(0, 2.15, -1.1);
      pfG.rotation.set(0, 0, 0);
      pfG.scale.set(0.8, 0.8, 0.8);
    }
    World.uplinkRing.visible = true;
  }
}

function countPlots(state) { return World.plots.filter(p => p.state === state).length; }
function plantedPlots() { return World.plots.filter(p => p.state === 'growing' || p.state === 'ready').length; }

// --- interactable definitions ---

// Cold open: seal the suit at the airlock
addI({
  pos: () => ({ x: 0, z: HAB_R + 1.6 }), r: 3.4, hold: 2.2, mode: 'walk',
  visible: () => S.flags.coldOpen,
  label: () => 'Pull the antenna. Seal the suit.',
  use: () => {
    S.flags.coldOpen = false;
    S.flags.suitSealed = true;
    S.suit = 100;
    S.shake = 1.2;
    flashScreen('rgba(255,60,40,0.35)', 350);
    Snd.boom(); setTimeout(() => Snd.ok(), 600);
    setTimeout(() => log(SOL_LOGS[1]), 900);
    setTimeout(() => log('Suit resealed. O2 refilling. Ow. OW. Okay. Inventory time.', 'sys'), 300);
  },
});

// System inspections (tutorial beats)
function addInspect(id, obj, name, doneLine) {
  addI({
    pos: () => ({ x: obj.position.x, z: obj.position.z }), r: 2.6, hold: 0.7, mode: 'walk',
    visible: () => S.started && !S.flags.coldOpen && !S.checkedSystems.has(id),
    label: () => `Inspect the ${name}`,
    use: () => {
      S.checkedSystems.add(id);
      Snd.ok();
      log(doneLine);
    },
  });
}

// Solar panels
for (const p of World.panels) {
  addI({
    pos: () => p.pos, r: 3.0, hold: 1.6, mode: 'walk',
    visible: () => !S.flags.coldOpen,
    enabled: () => p.dust > 0.06 ? true : 'Panel is clean',
    label: () => `Wipe solar panel (${Math.round((1 - p.dust) * 100)}% output)`,
    use: () => {
      p.dust = 0;
      S.stats.panels++;
      syncAllVisuals();
      Snd.ok();
      if (S.stats.panels === 1) log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.');
    },
  });
}

// Soil piles
for (const sp of World.soilPiles) {
  addI({
    pos: () => sp.pos, r: 2.8, hold: 1.4, mode: 'walk',
    visible: () => !S.flags.coldOpen && sp.left > 0,
    label: () => 'Dig regolith (+1 soil)',
    use: () => {
      sp.left--; S.soil++;
      syncAllVisuals();
      Snd.ok();
      if (S.soil === 1) log('One bag of the deadest dirt in the solar system. My crops will love it.');
    },
  });
}

// Farm plots
for (const pl of World.plots) {
  addI({
    pos: () => plotWorldPos(pl), r: 2.1, hold: 1.3, mode: 'walk',
    visible: () => !S.flags.coldOpen && S.inside,
    enabled: () => {
      switch (pl.state) {
        case 'empty': return S.soil > 0 ? true : 'Needs soil — dig regolith outside';
        case 'soil': return (S.food + S.potatoes) > 0 ? (S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)') : 'No seed left';
        case 'growing':
          if (pl.watered < BAL.waterings && pl.growth >= 0.42) return S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)';
          return `Growing — ${Math.round(pl.growth * 100)}%`;
        case 'ready': return true;
        case 'dead': return true;
      }
      return false;
    },
    label: () => {
      switch (pl.state) {
        case 'empty': return 'Fill bed with soil';
        case 'soil': return `Plant seed potato (1 ${S.potatoes > 0 ? 'potato' : 'ration'}, 5L water)`;
        case 'growing': return 'Water the plants (5L)';
        case 'ready': return 'Harvest potatoes';
        case 'dead': return 'Clear out the dead crop';
      }
      return '';
    },
    use: () => {
      switch (pl.state) {
        case 'empty':
          S.soil--; pl.state = 'soil';
          if (countPlots('soil') + plantedPlots() === 1) log('Bed one, filled. Step two involves fertilizer. We don\'t talk about step two.');
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
          log(`Harvest: +${BAL.potatoYield} potatoes. I am the greatest botanist on this planet. Fear me.`);
          break;
        case 'dead':
          pl.state = 'soil'; pl.growth = 0; pl.watered = 0;
          break;
      }
      Snd.ok();
      syncAllVisuals();
    },
  });
}

// Hydrazine rig
addI({
  pos: () => ({ x: 5.5, z: 2.6 }), r: 2.4, hold: 2.0, mode: 'walk',
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
        log('So. Small fireball. Eyebrows: gone. Water: acquired. Science!', );
      }, 1200);
      log('Burning rocket fuel indoors. What could possibly go wrong?');
    } else {
      Snd.ok();
      log(`+${BAL.hydrazineWater}L water. Still have both remaining eyebrows. Progress.`);
    }
  },
});

// Bunk: sleep
addI({
  pos: () => ({ x: -5.0, z: -4.9 }), r: 2.3, hold: 1.2, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    if (S.breach.active) return 'Not with the Hab screaming, no';
    if (S.tod < 0.5) return 'Too much to do — it\'s the middle of the sol';
    return true;
  },
  label: () => 'Sleep until dawn',
  use: () => sleepToDawn(),
});

// Ration shelf: emergency snack
addI({
  pos: () => ({ x: 4.2, z: 4.8 }), r: 2.2, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    if (S.health > 92) return 'Not hungry right now';
    return (S.potatoes > 0 || S.food > 0) ? true : 'The shelf is bare';
  },
  label: () => `Eat a ${S.potatoes > 0 ? 'potato. Again.' : 'ration'} (+12 vitals)`,
  use: () => {
    if (S.potatoes > 0) S.potatoes--; else S.food--;
    S.health = clamp(S.health + 12, 0, BAL.healthMax);
    Snd.ok();
  },
});

// Comms desk: math, NASA chat, disco
addI({
  pos: () => ({ x: 0, z: -6.6 }), r: 2.4, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && !S.flags.didMath,
  label: () => 'Run the numbers',
  use: () => {
    S.flags.didMath = true;
    Snd.ok();
    log(`${S.food} rations. Rescue needs me alive to Sol ${RESCUE_SOL}. The math says: farm or starve. I'm going to have to science the sh*t out of this.`);
  },
});
addI({
  pos: () => ({ x: -0.9, z: -6.4 }), r: 2.2, hold: 0.8, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => 'Message NASA',
  use: () => {
    const lines = [
      'Please tell Commander Lewis her taste in music is a war crime. — M.W.',
      'Status: alive. Potatoes: thriving. Dignity: pending. — M.W.',
      'NASA says the whole world is watching. Waved at the sky. Felt weird. Did it again.',
      'Asked NASA for pizza. They sent a orbital mechanics refresher. Same thing, apparently.',
      'NASA reminds you that everything you type is broadcast live to Earth. So. Hi, Mom.',
    ];
    Snd.ok();
    log(lines[(S.flags.nasaMsg = ((S.flags.nasaMsg || 0) + 1)) % lines.length], 'nasa');
  },
});
addI({
  pos: () => ({ x: 0.9, z: -6.4 }), r: 2.2, hold: 0.6, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => S.disco ? 'Mercifully stop the disco' : "Play Lewis's disco playlist",
  use: () => {
    S.disco = !S.disco;
    Snd.disco(S.disco);
    log(S.disco ? 'Disco: ON. I hate it. ...It\'s growing on me. I hate that more.' : 'Disco: OFF. Silence never sounded so good.');
  },
});

// Rover enter
addI({
  pos: () => ({ x: World.rover.group.position.x, z: World.rover.group.position.z }), r: 3.6, hold: 0.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => 'Drive the rover',
  use: () => enterRover(),
});
// Rover exit (interact while driving)
addI({
  pos: () => ({ x: World.rover.group.position.x, z: World.rover.group.position.z }), r: 99, hold: 0.4, mode: 'rover',
  visible: () => Math.abs(World.rover.speed) < 1.5,
  label: () => 'Step out',
  use: () => exitRover(),
});

// Pathfinder pickup
addI({
  pos: () => SITES.pathfinder, r: 5.5, hold: 2.6, mode: 'walk',
  visible: () => S.flags.pfRevealed && !S.pf.loaded,
  enabled: () => roverNear(SITES.pathfinder.x, SITES.pathfinder.z, 20) ? true : 'Too heavy to carry — bring the rover closer',
  label: () => 'Dig out Pathfinder and load it up',
  use: () => {
    S.pf.loaded = true;
    S.pf.found = true;
    World.pfCollider.r = 0.001;   // the probe now rides the rover
    syncAllVisuals();
    Snd.jingle();
    log('Hello, little guy. You\'ve been dead since 1997. Let\'s fix that. Next stop: the Hab.');
  },
});

// Connect pathfinder at uplink
addI({
  pos: () => UPLINK_POS, r: 5.0, hold: 2.6, mode: 'walk',
  visible: () => S.pf.loaded && !S.pf.connected,
  enabled: () => roverNear(UPLINK_POS.x - 4.5, UPLINK_POS.z + 2, 9) ? true : 'Park the rover on the marked ring first',
  label: () => 'Connect Pathfinder to the uplink',
  use: () => connectPathfinder(),
});

// Breach patch
addI({
  pos: () => ({ x: 0, z: -HAB_R + 1.2 }), r: 3.2, hold: 3.0, mode: 'walk',
  visible: () => S.breach.active && S.inside,
  label: () => 'Seal the breach (canvas, tape, prayer)',
  use: () => {
    S.breach.active = false;
    S.breach.done = true;
    Snd.alarm(false);
    Snd.ok();
    S.shake = 0.5;
    syncAllVisuals();
    if (!S.breach.cropsKilled) log('Breach sealed. Crops: alive. Heart rate: unpublishable. Duct tape: undefeated.');
    else log('Sealed. Too late for the crops. The Hab and I are no longer on speaking terms.');
  },
});

// MAV: strip + launch
addI({
  pos: () => SITES.mav, r: 7.0, hold: 3.0, mode: 'walk',
  visible: () => S.flags.mavRevealed && !S.flags.mavStripped,
  enabled: () => S.sol >= RESCUE_SOL ? true : `Launch window opens Sol ${RESCUE_SOL} — NASA was firm about this`,
  label: () => 'Strip excess weight (nose cone, seats, dignity)',
  use: () => {
    S.flags.mavStripped = true;
    World.mavNose.visible = false;
    Snd.ok();
    log('Removed the nose cone. NASA says the tarp will hold. NASA is lying, and we both know it.');
  },
});
addI({
  pos: () => SITES.mav, r: 7.0, hold: 1.6, mode: 'walk',
  visible: () => S.flags.mavStripped && !S.won,
  label: () => 'Climb in. Go home.',
  use: () => {
    showOverlay({
      title: 'LAUNCH?',
      body: 'The MAV is a convertible now. The math says Hermes can catch you.\nThe math has been wrong before.\n\nNo coming back to the Hab. The potatoes forgive you.',
      buttons: [
        { label: 'PUNCH IT', fn: () => startLaunch() },
        { label: 'Not yet', ghost: true, fn: () => {} },
      ],
    });
  },
});

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
// 11. SYSTEMS, EVENTS, TIME
// ============================================================
S.flags = { coldOpen: true, suitSealed: false, didMath: false, hydrazineBoom: false,
  pfRevealed: false, mavRevealed: false, mavStripped: false, nasaMsg: 0 };
S.suit = 46;                        // cold open: the suit is leaking
addInspect('oxy', World.oxygenator, 'oxygenator',
  'Oxygenator: alive. It eats CO2 and power, makes air. My favorite roommate.');
addInspect('rec', World.reclaimer, 'water reclaimer',
  'Water reclaimer: functional. Yes, it recycles what you think it recycles. No, we don\'t discuss it.');

const warnedLow = {};
function warnLow(key, val, thresh, msg) {
  if (val <= thresh && !warnedLow[key]) { warnedLow[key] = true; log(msg, 'sys'); Snd.bad(); }
  else if (val > thresh + 8) warnedLow[key] = false;
}

function avgPanelOutput() {
  let s = 0;
  for (const p of World.panels) s += 1 - clamp(p.dust, 0, 1);
  return s / World.panels.length;
}

function applyRates(dt, sleeping) {
  const m = sleeping ? 0.5 : 1;
  const day = daylight();
  // --- power ---
  const gen = BAL.solarGen * day * avgPanelOutput() * (S.storm.active ? BAL.stormGenMult : 1) * (sleeping ? 0 : 1);
  S.power = clamp(S.power + (gen - BAL.powerBase * m) * dt, 0, BAL.powerMax);
  const powered = S.power > 0.5;
  // --- panel dust ---
  const dr = (S.storm.active ? BAL.stormDustRate : BAL.dustRate) * dt;
  for (const p of World.panels) p.dust = clamp(p.dust + dr, 0, 1);
  // --- hab O2 ---
  let o2d = -BAL.o2DrainInside * m;
  if (powered) o2d += BAL.o2Gen;
  if (S.breach.active) o2d -= BAL.o2BreachDrain;
  S.o2 = clamp(S.o2 + o2d * dt, 0, BAL.o2Max);
  // --- suit O2 ---
  if (!sleeping) {
    if (S.mode === 'rover' || (S.inside && S.o2 > 3)) {
      S.suit = clamp(S.suit + 26 * dt, 0, 100);
    } else {
      const moving = keys['w'] || keys['a'] || keys['s'] || keys['d'] || keys['arrowup'] || keys['arrowdown'];
      let rate = moving ? (keys['shift'] ? 0.95 : 0.62) : 0.34;
      if (S.inside) rate = 0.3;              // hab air is gone; living off the suit
      if (S.flags.coldOpen) rate *= 1.9;     // the leak
      S.suit = clamp(S.suit - rate * dt, 0, 100);
    }
  } else {
    S.suit = 100;
  }
  // --- water ---
  let wd = -BAL.waterDrain * m;
  if (powered) wd += BAL.waterRecl;
  S.water = clamp(S.water + wd * dt, 0, BAL.waterMax);
  // --- crops ---
  const dtSol = dt / SOL_LEN;
  for (const pl of World.plots) {
    if (pl.state !== 'growing') continue;
    if (pl.growth >= 0.5 && pl.watered < BAL.waterings) continue;   // stalls until watered again
    pl.growth += dtSol / BAL.growSols;
    if (pl.growth >= 1) { pl.growth = 1; pl.state = 'ready'; if (!sleeping) { Snd.ok(); log('A plot is ready. Potato o\'clock.', 'sys'); } }
    if (Math.random() < dt * 0.06) syncPlot(pl);
  }
  // --- vitals ---
  let hd = 0;
  if (S.water <= 0) hd += BAL.starveDrain;
  if (S.food + S.potatoes <= 0) hd += BAL.starveDrain;
  if (S.suit <= 0 && !(S.inside && S.o2 > 3) && S.mode !== 'rover' && !sleeping) hd += BAL.suffocateDrain;
  if (S.inside && S.o2 <= 0 && S.suit <= 0) hd += BAL.suffocateDrain;
  if (hd > 0) S.health = clamp(S.health - hd * dt, 0, BAL.healthMax);
  else if (S.water > 5 && S.food + S.potatoes > 0) S.health = clamp(S.health + BAL.healRegen * m * dt, 0, BAL.healthMax);
  // warnings
  if (!sleeping) {
    warnLow('suit', S.suit, 25, 'Suit O2 at 25%. Head back. Now-ish.');
    warnLow('suit2', S.suit, 10, 'SUIT O2 CRITICAL. RUN.');
    warnLow('o2', S.o2, 25, 'Hab O2 low. The oxygenator needs power. The panels need wiping. You see where this is going.');
    warnLow('water', S.water, 10, 'Water reserves critical. Hydrazine rig or bust.');
    warnLow('power', S.power, 15, 'Battery low. Life support will idle at zero. Wipe the panels.');
    warnLow('health', S.health, 40, 'Vitals degrading. Eat. Drink. Sleep. In any order.');
    if (S.suit <= 12 || S.o2 <= 10) { if (!S.flags.closeCall) { S.flags.closeCall = true; S.stats.closeCalls++; } }
    else S.flags.closeCall = false;
  }
  // death checks
  if (S.health <= 0 && !S.over) {
    let cause = 'Mars. The cause is always Mars.';
    if (S.suit <= 0 && !S.inside) cause = 'Asphyxiation, 40 meters from a door. Mars counts that as a win.';
    else if (S.inside && S.o2 <= 0) cause = 'The Hab ran out of air. The potatoes watched.';
    else if (S.water <= 0) cause = 'Dehydration. On a planet that used to have oceans. Rude.';
    else if (S.food + S.potatoes <= 0) cause = 'Starvation. The botany project needed more time.';
    die(cause);
  }
}

function newSol() {
  S.sol++;
  S.tod = 0;
  // meal at sol-rise
  if (S.potatoes > 0) S.potatoes--;
  else if (S.food > 0) S.food--;
  else log('No breakfast. The stomach files a formal complaint.', 'sys');
  if (SOL_LOGS[S.sol]) setTimeout(() => log(SOL_LOGS[S.sol]), 1200);
  if (STORM_SOLS.includes(S.sol + 1)) setTimeout(() => log('Forecast: dust storm inbound tomorrow. Batten everything.', 'nasa'), 5000);
  if (S.sol === 4 && !S.flags.pfRevealed) {
    S.flags.pfRevealed = true;
    setTimeout(() => log('Found it in the charts: Pathfinder. 1997 vintage. ~320m northwest. If I dig it out, I can call Earth.', ''), 8000);
  }
  if (S.sol >= RESCUE_SOL && !S.flags.mavRevealed) revealMav();
  checkpoint();
}

function revealMav() {
  S.flags.mavRevealed = true;
  if (S.pf.connected)
    log('Launch window is OPEN. The MAV is ~480m southeast. Time to fly a convertible.', 'nasa');
  else
    log(`Sol ${RESCUE_SOL}. NASA's original plan had the Ares 4 MAV launching today — with or without a phone call, that rocket is my ride. ~480m southeast. One way to find out if anyone's up there.`);
  Snd.jingle();
}

function advanceTime(dt) {
  S.tod += dt / SOL_LEN;
  if (S.tod >= 1) { S.tod -= 1; newSol(); }
  // storm scheduling
  if (!S.storm.active && STORM_SOLS.includes(S.sol) && S.tod > 0.15 && S.tod < 0.55 && S.storm.doneSol !== S.sol) {
    S.storm.active = true;
    S.storm.doneSol = S.sol;
    log('Here it comes. Sky\'s going brown. Staying close to home today.', 'sys');
  }
  if (S.storm.active && (S.tod > 0.6 || S.tod < 0.14)) {
    S.storm.active = false;
    setTimeout(() => log('Storm passed. Mars remains undefeated at making everything dusty.'), 2000);
  }
  S.storm.i = clamp(S.storm.i + (S.storm.active ? dt * 0.12 : -dt * 0.12), 0, 1);
  // breach event (>= so sleeping through the scheduled sol can't skip it)
  if (S.sol >= BREACH_SOL && S.tod > 0.1 && !S.breach.done && !S.breach.active) {
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
      for (const pl of World.plots) if (pl.state === 'growing') { pl.state = 'dead'; killed++; }
      syncAllVisuals();
      if (killed) log('The cold got in. The growing crops are dead. Every ready plot survived in its tray. Small mercies.', 'sys');
    }
  }
}

// --- sleep ---
function sleepToDawn() {
  if (S.sleeping) return;
  S.sleeping = true;
  const before = { o2: S.o2, water: S.water, power: S.power, sol: S.sol, potatoes: S.potatoes, food: S.food };
  UI.overlay.style.display = 'flex';
  S.uiOpen = true;
  UI.panel.innerHTML = '<h2 style="margin-bottom:8px">SLEEPING…</h2><div class="bd" id="mg-sleepbd" style="min-height:120px"></div>';
  const nightSecs = (1 - S.tod) * SOL_LEN;
  // simulate the night in chunks so crops/power evolve consistently
  const steps = 30;
  for (let i = 0; i < steps; i++) applyRates(nightSecs / steps, true);
  newSol();
  const bd = document.getElementById('mg-sleepbd');
  const delta = (a, b, unit) => {
    const d = b - a;
    return `<span style="color:${d >= 0 ? '#7fca7f' : '#ff8f7f'}">${d >= 0 ? '+' : ''}${d.toFixed(1)}${unit}</span>`;
  };
  const growing = World.plots.filter(p => p.state === 'growing').length;
  const ready = World.plots.filter(p => p.state === 'ready').length;
  setTimeout(() => {
    if (bd) bd.innerHTML =
      `HAB O2 ${delta(before.o2, S.o2, '%')} · H2O ${delta(before.water, S.water, 'L')} · PWR ${delta(before.power, S.power, '%')}\n` +
      `Breakfast: ${S.potatoes < before.potatoes ? 'potato. again.' : (S.food < before.food ? '1 ration' : 'skipped')}\n` +
      (growing + ready > 0 ? `Farm: ${growing} growing, ${ready} ready to harvest\n` : '') +
      `\n<b style="font-size:22px;letter-spacing:4px">SOL ${S.sol}</b>`;
  }, 500);
  setTimeout(() => {
    hideOverlay();
    S.sleeping = false;
    S.health = clamp(S.health + BAL.sleepHeal, 0, BAL.healthMax);
    syncAllVisuals();
    checkpoint();
  }, 2900);
}

// ============================================================
// 12. OBJECTIVES
// ============================================================
const OBJECTIVES = [
  { id: 'reach', text: () => 'Suit breach — get to the Hab', shown: () => true, done: () => S.flags.suitSealed },
  { id: 'systems', text: () => `Inspect the oxygenator & water reclaimer (${S.checkedSystems.size}/2)`, shown: () => S.flags.suitSealed, done: () => S.checkedSystems.size >= 2 },
  { id: 'math', text: () => 'Run the numbers at the comms desk', shown: () => S.checkedSystems.size >= 2, done: () => S.flags.didMath },
  { id: 'panels', text: () => `Wipe down solar panels (${Math.min(S.stats.panels, 3)}/3)`, shown: () => S.flags.suitSealed, done: () => S.stats.panels >= 3 },
  { id: 'farm', text: () => `Start the farm — plant 3 beds (${Math.min(plantedPlots(), 3)}/3)`, shown: () => S.flags.didMath, done: () => plantedPlots() >= 3 || S.stats.potatoes > 0 },
  { id: 'hydra', text: () => 'Make water: burn hydrazine (carefully)', shown: () => S.flags.didMath, done: () => S.hydrazine < BAL.hydrazineUses },
  { id: 'pf', text: () => S.pf.loaded ? 'Bring Pathfinder to the uplink ring' : 'Recover Pathfinder (northwest — take the rover)', shown: () => S.flags.pfRevealed, done: () => S.pf.connected },
  { id: 'harvest', text: () => `Harvest potatoes (${S.stats.potatoes} banked)`, shown: () => plantedPlots() > 0, done: () => S.stats.potatoes >= 4 },
  { id: 'breach', text: () => 'SEAL THE BREACH', shown: () => S.breach.active, done: () => !S.breach.active, urgent: true },
  { id: 'survive', text: () => `Survive to Sol ${RESCUE_SOL} (Sol ${S.sol})`, shown: () => S.pf.connected, done: () => S.sol >= RESCUE_SOL },
  { id: 'mav', text: () => 'Get to the MAV. Strip it. Launch.', shown: () => S.flags.mavRevealed, done: () => S.won },
];
const objDone = new Set();
let objThrottle = 0;
function updateObjectivesHud() {
  if (perf() - objThrottle < 0.25) return;
  objThrottle = perf();
  let html = '<div class="ttl">MISSION</div>';
  let shown = 0;
  for (const o of OBJECTIVES) {
    if (!o.shown()) continue;
    const d = o.done();
    if (d && !objDone.has(o.id)) {
      objDone.add(o.id);
      if (o.id !== 'reach') { Snd.jingle(); }
    }
    if (d && o.id !== OBJECTIVES[OBJECTIVES.length - 1].id) continue;   // hide completed (except final win line)
    if (shown >= 4) break;
    html += `<div class="mg-obj${d ? ' done' : ''}"${o.urgent ? ' style="color:#ff6f5f"' : ''}>▸ ${o.text()}</div>`;
    shown++;
  }
  UI.objectives.innerHTML = html;
}

// ============================================================
// 13. COMMS / PATHFINDER CONVERSATION
// ============================================================
function connectPathfinder() {
  S.pf.connected = true;
  syncAllVisuals();
  Snd.jingle();
  const convo = [
    ['n', 'MARK? MARK, IS THAT YOU? — JPL. We\'re receiving Pathfinder telemetry. The whole world is watching, Mark.'],
    ['w', 'Alive and well. Ish. Growing potatoes. Long story. Air holds, food\'s tight, morale is potato-based.'],
    ['n', 'Copy. New plan: Ares 4\'s MAV is fueled on-site, ~480m SE of you. Hermes swings back for a Sol ' + RESCUE_SOL + ' intercept. Survive to Sol ' + RESCUE_SOL + ', then launch. We\'ll be there.'],
    ['w', 'So the plan is "don\'t die for ' + Math.max(0, RESCUE_SOL - S.sol) + ' more sols, then ride a rocket somebody else parked." I\'ve had worse weekends.'],
    ['n', 'One more thing: everything you transmit is broadcast live on Earth. Please watch your language.'],
    ['w', 'Acknowledged. [REDACTED BY NASA]. [ALSO REDACTED]. Boy, am I glad you warned me.'],
  ];
  let i = 0;
  const step = () => {
    if (i >= convo.length) {
      hideOverlay();
      log('Uplink holds. Earth is one very slow text message away.', 'nasa');
      if (S.sol >= RESCUE_SOL) revealMav();
      checkpoint();
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
}

// ============================================================
// 14. CHECKPOINT, DEATH, LAUNCH, WIN
// ============================================================
let CHECKPOINT = null;
function checkpoint() {
  CHECKPOINT = {
    S: JSON.parse(JSON.stringify({
      sol: S.sol, tod: S.tod, o2: S.o2, water: S.water, food: S.food, potatoes: S.potatoes,
      power: S.power, health: Math.max(S.health, 50), soil: S.soil, hydrazine: S.hydrazine,
      suit: 100, flags: S.flags, stats: S.stats,
      breach: S.breach, pf: S.pf, disco: S.disco,
    })),
    checked: [...S.checkedSystems],
    plots: World.plots.map(p => ({ state: p.state, growth: p.growth, watered: p.watered })),
    panels: World.panels.map(p => p.dust),
    piles: World.soilPiles.map(p => p.left),
    player: { x: player.x, z: player.z, yaw: player.yaw },
    rover: { x: World.rover.group.position.x, z: World.rover.group.position.z, heading: World.rover.heading },
  };
}
function restoreCheckpoint() {
  const C = CHECKPOINT;
  if (!C) { try { location.reload(); } catch (e) {} return; }
  Object.assign(S, JSON.parse(JSON.stringify(C.S)));
  S.checkedSystems = new Set(C.checked);
  S.storm = { active: false, i: 0, doneSol: S.storm && S.storm.doneSol };
  S.over = false; S.dead = null; S.sleeping = false; S.mode = 'walk'; S.uiOpen = false;
  C.plots.forEach((cp, i) => Object.assign(World.plots[i], cp));
  C.panels.forEach((d, i) => { World.panels[i].dust = d; });
  C.piles.forEach((l, i) => { World.soilPiles[i].left = l; });
  player.x = C.player.x; player.z = C.player.z; player.yaw = C.player.yaw;
  player.y = groundY(player.x, player.z); player.vy = 0;
  World.rover.group.position.set(C.rover.x, groundY(C.rover.x, C.rover.z), C.rover.z);
  World.rover.heading = C.rover.heading; World.rover.speed = 0;
  World.roverCollider.x = C.rover.x; World.roverCollider.z = C.rover.z;
  Snd.alarm(false); Snd.disco(false); S.disco = false;
  UI.vign.style.opacity = 0;
  syncAllVisuals();
  hideOverlay();
  log(`Woke up at dawn, Sol ${S.sol}. Bad dream. Probably prophetic. Let\'s not test it.`);
}

function die(cause) {
  if (S.over) return;
  S.over = true;
  S.dead = cause;
  Snd.alarm(false); Snd.disco(false); Snd.bad();
  showOverlay({
    title: 'YOU DIED ON MARS',
    subtitle: `Sol ${S.sol} · ${Math.round(S.stats.driven)}m driven · ${S.stats.potatoes} potatoes grown`,
    body: cause + '\n\nNobody plants the flag on the first try.',
    buttons: [
      { label: `WAKE AT DAWN (SOL ${CHECKPOINT ? CHECKPOINT.S.sol : 1})`, fn: () => restoreCheckpoint() },
      { label: 'RESTART FROM SOL 1', ghost: true, fn: () => { try { location.reload(); } catch (e) {} } },
    ],
  });
}

function startLaunch() {
  S.mode = 'cutscene';
  S.uiOpen = false;
  UI.prompt.style.display = 'none';
  const mav = World.mav;
  // place camera at the pad edge
  const cx = SITES.mav.x - 26, cz = SITES.mav.z + 20;
  camera.position.set(cx, terrainH(cx, cz) + 2.2, cz);
  camera.lookAt(SITES.mav.x, terrainH(SITES.mav.x, SITES.mav.z) + 8, SITES.mav.z);
  let t = 0;
  log('Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever.');
  if (S.pf.connected) { S.disco = true; Snd.disco(true); setTimeout(() => log('The playlist synced to the MAV. I\'m launching to disco. This is my life now.', 'nasa'), 3500); }
  const cd = [3, 2, 1];
  cd.forEach((n, i) => setTimeout(() => { Snd.beep(700 + n * 60, 0.18, 'square', 0.15); log(`${n}...`, 'nasa'); }, 2000 + i * 1000));
  const liftT = 5.2;
  World.launchAnim = (dt) => {
    t += dt;
    if (t > liftT) {
      const lt = t - liftT;
      World.mavFlame.visible = true;
      Snd.rumble(clamp(lt * 0.5, 0, 0.8));
      S.shake = clamp(1.2 - lt * 0.1, 0, 1.2);
      World.mavRocket.position.y = 0.1 + lt * lt * 2.1;
      World.mavFlame.scale.y = 1 + Math.random() * 0.4;
      camera.lookAt(SITES.mav.x, terrainH(SITES.mav.x, SITES.mav.z) + 8 + lt * lt * 2.1, SITES.mav.z);
      camera.position.x = cx + (Math.random() - 0.5) * S.shake * 0.5;
      camera.position.y = terrainH(cx, cz) + 2.2 + (Math.random() - 0.5) * S.shake * 0.5;
      if (lt > 7.5 && !S.won) winGame();
    }
  };
}

function winGame() {
  S.won = true;
  Snd.rumble(0);
  Snd.jingle();
  setTimeout(() => Snd.disco(false), 6000);
  const st = S.stats;
  showOverlay({
    title: 'RESCUED',
    subtitle: `HERMES INTERCEPT CONFIRMED · SOL ${S.sol}`,
    body:
      `<b>Watney is off the surface.</b>\n\n` +
      `Sols survived: ${S.sol}\n` +
      `Potatoes farmed: ${st.potatoes}\n` +
      `Panels wiped: ${st.panels}\n` +
      `Distance driven: ${Math.round(st.driven)} m\n` +
      `Close calls: ${st.closeCalls}\n` +
      `Explosions (indoor): ${st.booms}\n\n` +
      `"Every human being has a basic instinct to help each other out.\n` +
      `If a hiker gets lost, people organize a search party. This is why\n` +
      `they came back for me." — M. Watney, space pirate, greatest botanist\n` +
      `on two planets.`,
    buttons: [{ label: 'PLAY AGAIN', fn: () => { try { location.reload(); } catch (e) {} } }],
  });
}

// ============================================================
// 15. HUD UPDATES, COMPASS, PAUSE, START, MAIN LOOP
// ============================================================
function showPause() {
  if (S.uiOpen || S.over || !S.started) return;
  showOverlay({
    title: 'PAUSED',
    subtitle: 'the potatoes are fine. probably.',
    body: 'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · JUMP <span class="kbd">SPACE</span>\nINTERACT <span class="kbd">E</span> (hold) · ROVER EXIT <span class="kbd">F</span> · PAUSE <span class="kbd">ESC</span>\n\nSurvive to Sol ' + RESCUE_SOL + '. Watch the six bars. Keep the panels clean,\nthe crops watered, and the sky where it belongs: outside.',
    buttons: [{ label: 'RESUME', fn: () => { if (!dragMode) tryLock(); } }],
  });
}

function fmtClock() {
  const mins = S.tod * 24.65 * 60;
  const h = Math.floor(mins / 60), mn = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
}
function updateHud() {
  const bars = [
    ['suit', S.suit, 100, Math.round(S.suit) + '%'],
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
  let clock = `<span class="sol">SOL ${S.sol}</span><br>${fmtClock()} ${S.tod >= DAY_FRAC ? '· NIGHT' : ''}`;
  if (STORM_SOLS.includes(S.sol + 1)) clock += '<br><span style="color:#ff9f6f;font-size:11px">⚠ storm forecast: Sol ' + (S.sol + 1) + '</span>';
  if (S.storm.active) clock += '<br><span style="color:#ff6f5f;font-size:11px">⚠ DUST STORM</span>';
  UI.clock.innerHTML = clock;
  // vignette: worst danger
  const danger = Math.max(
    1 - S.suit / 25, 1 - S.health / 45,
    S.breach.active && S.inside ? 0.5 : 0);
  UI.vign.style.opacity = clamp(danger, 0, 1) * 0.9;
}

const compassMarks = {};
function updateCompass() {
  const marks = [];
  if (S.flags.suitSealed || S.flags.coldOpen) marks.push(['hab', '⌂ HAB', 0, 0]);
  if (!S.flags.coldOpen) marks.push(['rover', '▣ ROVER', World.rover.group.position.x, World.rover.group.position.z]);
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) marks.push(['pf', '▼ PATHFINDER', SITES.pathfinder.x, SITES.pathfinder.z]);
  if (S.pf.loaded && !S.pf.connected) marks.push(['up', '▼ UPLINK', UPLINK_POS.x, UPLINK_POS.z]);
  if (S.flags.mavRevealed && !S.won) marks.push(['mav', '▲ MAV', SITES.mav.x, SITES.mav.z]);
  if (S.breach.active) marks.push(['br', '⚠ BREACH', 0, -HAB_R + 1]);
  const seen = new Set();
  const px = S.mode === 'rover' ? World.rover.group.position.x : player.x;
  const pz = S.mode === 'rover' ? World.rover.group.position.z : player.z;
  // camera forward yaw
  const fwd = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  const camYaw = Math.atan2(-fwd.x, -fwd.z);
  for (const [id, label, mx, mz] of marks) {
    seen.add(id);
    let m = compassMarks[id];
    if (!m) {
      m = el('div', null, 'mg-cmark', UI.compass);
      compassMarks[id] = m;
    }
    const d = dist2d(px, pz, mx, mz);
    if (d < 6) { m.style.display = 'none'; continue; }
    const bearing = Math.atan2(-(mx - px), -(mz - pz));
    let rel = bearing - camYaw;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const half = 1.15;  // radians visible on the strip each side
    const xFrac = clamp(rel / half, -1, 1) * 0.5 + 0.5;
    m.style.display = 'block';
    m.style.left = (xFrac * 100) + '%';
    m.style.opacity = Math.abs(rel) > half ? 0.35 : 0.95;
    m.innerHTML = `<div class="ic">${label.split(' ')[0]}</div>${label.split(' ').slice(1).join(' ')}<br>${d > 999 ? (d / 1000).toFixed(1) + 'km' : Math.round(d) + 'm'}`;
  }
  for (const id in compassMarks) if (!seen.has(id)) { compassMarks[id].remove(); delete compassMarks[id]; }
}

// dust particles drift & recycle around camera
function updateDust(dt) {
  const pos = dustPts.geometry.attributes.position;
  const c = camera.position;
  const windX = 3 + S.storm.i * 26, windZ = 1.2 + S.storm.i * 9;
  for (let i = 0; i < DUST_N; i++) {
    let x = pos.getX(i) + windX * dt, y = pos.getY(i) - dt * (0.5 + S.storm.i * 2), z = pos.getZ(i) + windZ * dt;
    if (x - c.x > DUST_BOX / 2) x -= DUST_BOX;
    if (x - c.x < -DUST_BOX / 2) x += DUST_BOX;
    if (z - c.z > DUST_BOX / 2) z -= DUST_BOX;
    if (z - c.z < -DUST_BOX / 2) z += DUST_BOX;
    if (y < c.y - 4) y += 26;
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  dustPts.material.opacity = 0.18 + S.storm.i * 0.55;
  dustPts.material.size = 0.55 + S.storm.i * 0.5;
}

// pathfinder proximity geiger ping
let lastPing = 0;
function updatePing() {
  if (!S.flags.pfRevealed || S.pf.found || S.pf.loaded) return;
  const d = dist2d(player.x, player.z, SITES.pathfinder.x, SITES.pathfinder.z);
  if (d > 90) return;
  const interval = clamp(d / 60, 0.12, 1.4);
  if (perf() - lastPing > interval) {
    lastPing = perf();
    Snd.beep(1200, 0.04, 'square', 0.05);
  }
  if (d < 10 && !S.pf.found) { S.pf.found = true; log('Signal source dead ahead. There you are.'); }
}

// beacon blink
let blinkT = 0;

// ============================================================
// 16. START SCREEN & MAIN LOOP
// ============================================================
function showStart() {
  showOverlay({
    title: 'STRANDED',
    subtitle: 'a martian survival story · sol 1',
    body:
      'The storm hit. The crew evac\'d. Your bio-monitor said you were dead.\n' +
      'It exaggerated. You are stranded on Mars with a leaking suit, a Hab,\n' +
      'ten ration packs, and a botany degree everyone laughed at.\n\n' +
      `Rescue is possible on <b>Sol ${RESCUE_SOL}</b> — if you're alive to fly out.\n\n` +
      'MOVE <span class="kbd">W A S D</span> · SPRINT <span class="kbd">SHIFT</span> · JUMP <span class="kbd">SPACE</span> · INTERACT <span class="kbd">E</span> (hold)\n' +
      'Grow food. Make water. Keep the power on. Call home. Don\'t die.',
    buttons: [{
      label: '▶ CLICK TO SUIT UP',
      fn: () => {
        Snd.init(); Snd.resume();
        S.started = true;
        if (!dragMode) tryLock();
        Snd.wind(0.2);
        log('Suit O2 at 46% and leaking. The Hab is that way. RUN.', 'sys');
        checkpoint();
      },
    }],
  });
}

let lastT = perf();
function frame() {
  requestAnimationFrame(frame);
  const now = perf();
  let dt = Math.min(now - lastT, 0.05);
  lastT = now;
  if (!S.started || S.over && S.mode !== 'cutscene') { renderer.render(scene, camera); return; }
  if (S.uiOpen && !S.sleeping) { renderer.render(scene, camera); return; }
  if (S.mode === 'cutscene') {
    if (World.launchAnim) World.launchAnim(dt);
    updateSky(); updateDust(dt);
    renderer.render(scene, camera);
    return;
  }
  if (!S.sleeping) {
    advanceTime(dt);
    applyRates(dt, false);
    if (S.mode === 'walk') updateWalk(dt);
    else if (S.mode === 'rover') updateRover(dt);
    updateInteract(dt);
    updatePing();
  }
  // ambience: wind louder outside/storm; breach hiss
  const outside = !S.inside;
  Snd.wind((outside ? 0.16 : 0.05) + S.storm.i * 0.65 + (S.breach.active && S.inside ? 0.4 : 0));
  blinkT += dt;
  World.beacon.material.emissive.setHex(Math.sin(blinkT * 5) > 0 ? 0x33ff66 : 0x0a3315);
  World.mavStrobe.material.emissive.setHex(Math.sin(blinkT * 7) > 0 ? 0xff4020 : 0x330a05);
  updateSky();
  updateDust(dt);
  updateHud();
  updateCompass();
  updateObjectivesHud();
  renderer.render(scene, camera);
}

// debug/test handle (harmless in production; lets automated tests drive states)
window.__MG = { S, player, World, BAL, SITES, checkpoint, restoreCheckpoint, syncAllVisuals, advanceTime, applyRates, newSol, interactables };

syncAllVisuals();
updateSky();
camera.position.set(player.x, groundY(player.x, player.z) + player.eyeH, player.z);
camera.rotation.set(player.pitch, player.yaw, 0);
showStart();
frame();

})();
