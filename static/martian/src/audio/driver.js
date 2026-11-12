// The bridge between the game and the audio system. Once a frame it reads the game state and
// hands Snd.update() a plain description of it; it also catches the moments nobody calls a
// sound for (a new sol, falling asleep, opening a screen), gives every button a click, unlocks
// audio on the first touch, and loads the saved volume settings.
//
// The rest of src/audio knows nothing about the game, so this is the only file to change when
// the game's state moves about.
import { Snd } from './sound.js';
import { setAudioVolume, getAudioVolumes, loadAudioVolumes } from './settings.js';
import { clamp, smooth } from './dsp.js';
import { S, suitCap } from '../game/state.js';
import { player } from '../game/player.js';
import { roverF } from '../game/rover.js';
import { World } from '../world/build.js';
import { ctx } from '../game/ctx.js';
import { input, moveInputMag, sprinting } from '../game/input.js';
import { interaction } from '../game/interact.js';
import { groundDist } from '../planet/geo.js';
import { screenOpen } from '../ui/screens.js';

const P = {};                         // reused every frame
const launch = { burning: false, alt: 0 };
let prevSol = -1, prevSleeping = false, prevUi = null, prevStarted = false;
let rough = 0, prevH = 0, prevVs = 0, habDist = 1e6, habDistAt = -1, frame = 0, warned = false;

/** What kind of work a held action sounds like, from the words of its prompt. */
const HOLD_KINDS = [
  [/wipe/i, 'wipe'],
  [/\bdig\b|regolith|\brtg\b/i, 'dig'],
  [/salvage|strip|connect|place the|\bseal|\bmine\b|\bopen\b|pull the antenna/i, 'tool'],
  [/^plant|^water|harvest|clear out|\beat\b|\bburn\b/i, 'soft'],
];
let kindOf = null, kindFor = null;
function holdKind(it) {
  // one interactable can offer different actions (a farm plot: fill, plant, water, harvest), so go by its words
  let label = '';
  try { label = it.label ? String(it.label()) : ''; } catch (e) { /* a label that needs state we do not have */ }
  if (label === kindFor) return kindOf;
  kindFor = label; kindOf = null;
  for (const [re, kind] of HOLD_KINDS) if (re.test(label)) { kindOf = kind; break; }
  return kindOf;
}

/** Call once a frame from the game loop, whatever state the game is in. */
export function updateAudio(dt) {
  if (!Snd.sys) return;
  try {
    frame++;
    const started = S.started, ui = S.uiOpen || screenOpen();
    const scene = !started ? 'title' : S.won ? 'won' : S.mode === 'cutscene' ? 'cutscene' : S.over ? 'dead' : 'play';
    const playing = scene === 'play';
    const rover = S.mode === 'rover';
    const where = rover && World.rover ? World.rover.group.position : player.pos;
    P.scene = scene;
    P.place = rover ? 'rover' : S.inside ? 'hab' : 'outside';
    P.sleeping = S.sleeping;
    P.paused = ui && playing && !S.sleeping;
    P.storm = started ? S.storm.i : 0;
    const sunEl = started ? player.up.dot(ctx.engine.sunDir) : 1;
    P.day = smooth(-0.08, 0.3, sunEl);
    // the astronaut
    const free = playing && !ui && !S.sleeping;
    P.move = free && !rover ? moveInputMag().mag : 0;
    P.run = sprinting() && S.suit > 1;
    P.onGround = player.onGround; P.gait = player.bob; P.alt = player.alt;
    P.o2 = clamp(S.suit / suitCap(), 0, 1);
    P.health = clamp(S.health / 100, 0, 1);
    P.leak = started && !!S.flags.coldOpen;
    const it = interaction.active;
    P.hold = free && input.eHeld && it && S.holdT > 0 ? clamp(S.holdT / (it.hold || 1), 0, 1) : 0;
    P.holdKind = P.hold > 0 ? holdKind(it) : null;
    // the Hab
    if (started && World.hab && (frame & 7) === 0) { habDist = groundDist(where, World.hab.position); habDistAt = frame; }
    P.habDist = habDistAt < 0 ? 1e6 : habDist;
    P.habAmt = habDist < 40 ? 1 : 0.45;               // a greenhouse dome is "inside" too, but has little machinery
    P.habPower = S.power > 0.5 ? 1 : 0;
    P.breach = started && S.breach.active;
    // the rover
    P.roverSpeed = rover ? roverF.speed : 0;
    let thr = 0;
    if (rover && free) {
      const k = input.keys, t = input.touch;
      if (k.w || k.arrowup) thr = 1; else if (k.s || k.arrowdown) thr = -1;
      if (Math.abs(t.joyY) > 0.2) thr = -t.joyY;
    }
    P.throttle = thr;
    if (rover && World.rover && dt > 1e-4) {
      // roughness: how hard the ground under the wheels is changing slope (vertical acceleration)
      const h = World.rover.group.position.length(), vs = (h - prevH) / dt;
      const acc = prevH ? Math.abs(vs - prevVs) / dt : 0;
      prevH = h; prevVs = vs;
      rough += (clamp(acc / 9, 0, 1) - rough) * (1 - Math.exp(-dt / 0.35));
    } else if (!rover) { prevH = 0; prevVs = 0; rough = 0; }
    P.rough = rough;
    // the launch
    if (S.mode === 'cutscene' && World.mavRocket) {
      launch.burning = !!(World.mavFlame && World.mavFlame.visible);
      launch.alt = Math.max(0, World.mavRocket.position.y);
      P.launch = launch;
    } else P.launch = null;
    P.disco = !!S.disco;

    // moments nobody else announces
    if (started && prevStarted && playing) {
      if (S.sol === prevSol + 1) Snd.play('solChange');
      if (S.sleeping && !prevSleeping) Snd.play('sleep');
      else if (!S.sleeping && prevSleeping) Snd.play('wake');
    }
    if (prevUi !== null && ui !== prevUi && (playing || scene === 'title')) Snd.play(ui ? 'uiOpen' : 'uiClose');
    prevSol = S.sol; prevSleeping = S.sleeping; prevUi = ui; prevStarted = started;

    Snd.update(P);
  } catch (e) {
    Snd.errors++;
    if (!warned) { warned = true; console.warn('audio update failed:', e); }
  }
}

// ---- hooks on the page ----------------------------------------------------------------------------
const PRESSABLE = 'button, .mg-tbtn, .close, [data-t], [data-deploy], [data-r], [data-u], [role="button"]';
const SILENT_IDS = { 'mg-tE': 1, 'mg-tJump': 1 };          // game controls, not interface
function pressable(target) {
  const el = target && target.closest ? target.closest(PRESSABLE) : null;
  return el && !el.disabled && !SILENT_IDS[el.id] ? el : null;
}
function pressSound(el) {
  const back = el.classList.contains('close') || el.classList.contains('ghost');
  Snd.play(back ? 'uiCancel' : 'uiConfirm');
}

function install() {
  loadAudioVolumes();
  // Browsers only start audio from a user gesture, and iOS suspends it again after an
  // interruption, so every gesture makes sure the context exists and is running.
  const unlock = () => { Snd.init(); Snd.resume(); };
  for (const type of ['pointerdown', 'touchend', 'keydown', 'click']) window.addEventListener(type, unlock, { capture: true, passive: true });

  // every button gets the same small family of sounds, wherever the interface code creates it
  let hovered = null;
  document.addEventListener('click', (ev) => { const el = pressable(ev.target); if (el) pressSound(el); }, true);
  document.addEventListener('touchstart', (ev) => {
    const el = pressable(ev.target);
    if (el && el.classList.contains('mg-tbtn')) Snd.play('uiClick');   // these swallow the click event
  }, { capture: true, passive: true });
  document.addEventListener('pointerover', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const el = pressable(ev.target);
    if (el !== hovered) { hovered = el; if (el) Snd.play('uiNav'); }
  }, true);

  // the log types itself out: tick quietly while it does, and chirp when NASA is on the line
  const watchLog = () => {
    const log = document.getElementById('mg-log');
    if (!log || typeof MutationObserver === 'undefined') return false;
    new MutationObserver((list) => {
      if (!Snd.sys) return;
      let typed = false;
      for (const m of list) {
        if (m.target === log) { for (const n of m.addedNodes) if (n.classList && n.classList.contains('nasa')) Snd.play('nasaMsg'); }
        else typed = true;
      }
      if (typed && S.started && !S.sleeping) Snd.play('uiType');
    }).observe(log, { childList: true, subtree: true, characterData: true });
    return true;
  };
  if (!watchLog()) window.addEventListener('load', watchLog, { once: true });

  // for the tests and the console
  const expose = () => { if (window.__MG) { window.__MG.Snd = Snd; window.__MG.audio = { setAudioVolume, getAudioVolumes }; return true; } return false; };
  if (!expose()) { const t = setInterval(() => { if (expose()) clearInterval(t); }, 500); }
}
if (typeof document !== 'undefined') install();
