// Input: keyboard, mouse look (pointer lock with a drag fallback) and touch controls.
import { ctx } from './ctx.js';
import { S } from './state.js';
import { UI } from '../ui/dom.js';
import { log } from '../ui/dom.js';
import { perf } from '../core/math.js';
import { screenOpen, closeScreens, toggleScreen } from '../ui/screens.js';
import { showPause } from './flow.js';
import { exitRover } from './rover.js';
import { useCandle } from './inventory.js';
import { settings, onSettingsChange } from '../ui/settings.js';
import { layout } from '../ui/layout.js';

export const input = {
  keys: {},
  eHeld: false,
  /** look deltas accumulated since the last frame (radians) */
  yaw: 0, pitch: 0,
  isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
  touch: { joyX: 0, joyY: 0, joyId: null, lookId: null, lookX: 0, lookY: 0, sprint: false, jumpT: 0 },
  /** multiplier on look speed (settings) */
  sensitivity: 1,
  /** look up by moving down (settings) */
  invertY: false,
};
// the player's control settings (ui/settings.js), now and whenever they change
function applyControlSettings() { input.sensitivity = settings.sensitivity; input.invertY = !!settings.invertY; }
applyControlSettings();
onSettingsChange(applyControlSettings);
const lookY = () => (input.invertY ? -1 : 1);

// dragMode is a recoverable fallback, not a one-way latch: any successful lock clears it
let pointerLocked = false, dragMode = false, dragging = false, lastMX = 0, lastMY = 0, lockChangedAt = 0;

export function tryLock() {
  if (dragMode && input.isTouch) return;
  if (S.uiOpen || screenOpen()) return;
  const canvas = ctx.engine.renderer.domElement;
  try {
    const p = canvas.requestPointerLock && canvas.requestPointerLock();
    if (p && p.catch) p.catch(() => { dragMode = true; });
    setTimeout(() => { if (!pointerLocked && !S.uiOpen && !screenOpen()) dragMode = true; }, 700);
  } catch (e) { dragMode = true; }
}

export function touchJumpFresh() { return input.isTouch && perf() - input.touch.jumpT < 0.18; }
export function moveInputMag() {
  const k = input.keys;
  let mx = 0, mz = 0;
  if (k['w'] || k['arrowup']) mz -= 1;
  if (k['s'] || k['arrowdown']) mz += 1;
  if (k['a'] || k['arrowleft']) mx -= 1;
  if (k['d'] || k['arrowright']) mx += 1;
  mx += input.touch.joyX; mz += input.touch.joyY;
  const l = Math.hypot(mx, mz);
  return { mx, mz, mag: Math.min(1, l) };
}
export function sprinting() { return !!input.keys['shift'] || input.touch.sprint; }

export function initInput() {
  const canvas = ctx.engine.renderer.domElement;
  const keys = input.keys;
  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const k = ev.key.toLowerCase();
    keys[k] = true;
    // menus and screens use these keys themselves (buttons, sliders, focus)
    if (!S.uiOpen && !screenOpen() && ['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) ev.preventDefault();
    if (k === 'e') input.eHeld = true;
    if (!S.started || S.over || S.mode === 'cutscene') return;
    if (k === 'escape') {
      if (screenOpen()) { closeScreens(); tryLock(); }
      else if (!S.uiOpen) showPause();
    }
    if (k === 'f' && S.mode === 'rover' && !S.uiOpen && !screenOpen()) exitRover();
    if (k === 'v' && !S.uiOpen && !screenOpen()) {
      S.firstPerson = !S.firstPerson;
      log(S.firstPerson ? 'Helmet cam. Just you and the visor.' : 'Suit cam deployed. Looking good, Watney. Ish.', 'sys');
    }
    if (!S.uiOpen && !S.flags.coldOpen) {
      if (k === 'm') toggleScreen('map');
      if (k === 'c') toggleScreen('colony');
      if (k === 'j') toggleScreen('journal');
      if ((k === 'm' || k === 'c' || k === 'j') && !screenOpen()) tryLock();     // closed a screen: take the mouse back
    }
  });
  window.addEventListener('keyup', (ev) => {
    const k = ev.key.toLowerCase();
    keys[k] = false;
    if (k === 'e') { input.eHeld = false; S.holdT = 0; }
  });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; input.eHeld = false; });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
    lockChangedAt = perf();
    if (pointerLocked) dragMode = false;
    if (!pointerLocked && S.started && !S.uiOpen && !screenOpen() && !S.over && S.mode !== 'cutscene') showPause();
  });
  document.addEventListener('pointerlockerror', () => { dragMode = true; });
  canvas.addEventListener('mousedown', (ev) => {
    if (!S.started || S.uiOpen || screenOpen()) return;
    if (!pointerLocked) tryLock();
    if (dragMode) { dragging = true; lastMX = ev.clientX; lastMY = ev.clientY; }
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', (ev) => {
    if (!S.started || S.uiOpen || screenOpen() || S.mode === 'cutscene') return;
    let dx = 0, dy = 0;
    if (pointerLocked) {
      // browsers can report one huge bogus delta just after the pointer is captured
      if (perf() - lockChangedAt < 0.15) return;
      dx = ev.movementX || 0; dy = ev.movementY || 0;
      if (Math.abs(dx) > 400 || Math.abs(dy) > 400) return;
    } else if (dragMode && dragging) {
      dx = ev.clientX - lastMX; dy = ev.clientY - lastMY;
      lastMX = ev.clientX; lastMY = ev.clientY;
    } else return;
    input.yaw -= dx * 0.0024 * input.sensitivity;
    input.pitch -= dy * 0.0022 * input.sensitivity * lookY();
  });

  if (input.isTouch) initTouch(canvas);
}

function initTouch(canvas) {
  const touchIn = input.touch;
  dragMode = true;                                 // never attempt pointer lock on touch
  // movement stick: it appears under the thumb, wherever the lower-left of the screen is touched
  const base = UI.joy, knob = UI.joyKnob;
  let ox = 0, oy = 0, travel = 44;
  const setKnob = (dx, dy) => { knob.style.transform = `translate(${(dx * travel).toFixed(1)}px, ${(dy * travel).toFixed(1)}px)`; };
  const rest = () => { base.style.left = ''; base.style.top = ''; base.style.bottom = ''; base.classList.remove('live'); setKnob(0, 0); };
  UI.joyZone.addEventListener('touchstart', (ev) => {
    ev.preventDefault(); ev.stopPropagation();
    if (touchIn.joyId !== null) return;
    const t = ev.changedTouches[0];
    touchIn.joyId = t.identifier;
    const half = base.offsetWidth / 2;
    travel = half * 0.62;
    ox = Math.max(layout.safe[3] + half + 4, t.clientX);
    oy = Math.min(window.innerHeight - layout.safe[2] - half - 4, t.clientY);
    base.style.left = (ox - half) + 'px'; base.style.top = (oy - half) + 'px'; base.style.bottom = 'auto';
    base.classList.add('live');
  }, { passive: false });
  window.addEventListener('touchmove', (ev) => {
    for (const t of ev.changedTouches) {
      if (t.identifier !== touchIn.joyId) continue;
      let dx = (t.clientX - ox) / travel, dy = (t.clientY - oy) / travel;
      const l = Math.hypot(dx, dy);
      if (l > 1) { dx /= l; dy /= l; }
      const dead = l < 0.1;
      touchIn.joyX = dead ? 0 : dx; touchIn.joyY = dead ? 0 : dy;
      setKnob(dx, dy);
      ev.preventDefault();
    }
  }, { passive: false });
  const end = (ev) => {
    for (const t of ev.changedTouches) {
      if (t.identifier === touchIn.joyId) {
        touchIn.joyId = null; touchIn.joyX = 0; touchIn.joyY = 0;
        rest();
      }
      if (t.identifier === touchIn.lookId) touchIn.lookId = null;
    }
  };
  window.addEventListener('touchend', end);
  window.addEventListener('touchcancel', end);
  // look: any touch on the canvas that isn't the joystick finger
  canvas.addEventListener('touchstart', (ev) => {
    if (!S.started || S.uiOpen || screenOpen()) return;
    for (const t of ev.changedTouches) {
      if (t.identifier === touchIn.joyId || touchIn.lookId !== null) continue;
      touchIn.lookId = t.identifier;
      touchIn.lookX = t.clientX; touchIn.lookY = t.clientY;
    }
  }, { passive: true });
  window.addEventListener('touchmove', (ev) => {
    for (const t of ev.changedTouches) {
      if (t.identifier !== touchIn.lookId) continue;
      input.yaw -= (t.clientX - touchIn.lookX) * 0.005 * input.sensitivity;
      input.pitch -= (t.clientY - touchIn.lookY) * 0.0045 * input.sensitivity * lookY();
      touchIn.lookX = t.clientX; touchIn.lookY = t.clientY;
    }
  }, { passive: true });
  // buttons: `down` on touch; `up` on release (for the hold-to-interact button)
  const press = (elm, down, up) => {
    elm.addEventListener('touchstart', (ev) => { ev.preventDefault(); ev.stopPropagation(); elm.classList.add('down'); down(); }, { passive: false });
    const release = (ev) => { ev.preventDefault(); elm.classList.remove('down'); if (up) up(); };
    elm.addEventListener('touchend', release, { passive: false });
    elm.addEventListener('touchcancel', release, { passive: false });
    // a mouse, pen or keyboard on a touch device still works the simple buttons
    if (!up) elm.addEventListener('click', (ev) => { ev.stopPropagation(); down(); });
  };
  const playing = () => S.started && !S.uiOpen && !S.over && S.mode !== 'cutscene';
  press(UI.tE, () => { input.eHeld = true; }, () => { input.eHeld = false; S.holdT = 0; });
  press(UI.tJump, () => { touchIn.jumpT = perf(); });
  press(UI.tSprint, () => {
    touchIn.sprint = !touchIn.sprint;
    UI.tSprint.classList.toggle('on', touchIn.sprint);
    UI.tSprint.setAttribute('aria-pressed', touchIn.sprint);
  });
  press(UI.tExit, () => { if (S.mode === 'rover') exitRover(); });
  press(UI.tCam, () => { if (playing()) S.firstPerson = !S.firstPerson; });
  press(UI.tCandle, () => { if (playing()) useCandle(); });
  press(UI.tPause, () => { if (screenOpen()) closeScreens(); showPause(); });
  UI.tRow.querySelectorAll('[data-t]').forEach((btn) => {
    press(btn, () => { if (playing() && !S.flags.coldOpen) toggleScreen(btn.dataset.t); });
  });
}
