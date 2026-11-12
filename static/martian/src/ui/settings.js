// The player's settings: kept in localStorage, applied by ui/layout.js (interface) and
// ui/menus.js (input and sound). This module depends on nothing else in the game.
const KEY = 'stranded2-settings';
/** main.js reads this key at boot to choose the renderer's quality. */
export const QUALITY_KEY = 'stranded2-quality';

export const DEFAULTS = {
  sensitivity: 1,        // multiplier on look speed, 0.3 .. 2.5
  invertY: false,
  volume: 1,             // master volume, 0 .. 1
  hudScale: 1,           // multiplier on the interface size, 0.8 .. 1.4
  reducedMotion: null,   // null = follow the system setting
  colorBlind: false,
};

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out = { ...DEFAULTS };
    for (const k in DEFAULTS) if (raw && raw[k] !== undefined && (raw[k] === null || typeof raw[k] === typeof DEFAULTS[k] || DEFAULTS[k] === null)) out[k] = raw[k];
    out.sensitivity = Math.min(2.5, Math.max(0.3, +out.sensitivity || 1));
    out.volume = Math.min(1, Math.max(0, +out.volume));
    out.hudScale = Math.min(1.4, Math.max(0.8, +out.hudScale || 1));
    return out;
  } catch (e) { return { ...DEFAULTS }; }
}

export const settings = read();
const listeners = [];
/** Call `fn(settings)` after every change. */
export function onSettingsChange(fn) { listeners.push(fn); }
export function setSetting(key, value) {
  settings[key] = value;
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* private mode: lasts for this visit */ }
  for (const fn of listeners) fn(settings, key);
}
export function resetSettings() {
  Object.assign(settings, DEFAULTS);
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  for (const fn of listeners) fn(settings, null);
}

/** True when motion should be kept to a minimum. */
export function reducedMotion() {
  if (settings.reducedMotion !== null) return !!settings.reducedMotion;
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

/** The saved graphics quality, or null when the game is choosing for the device. */
export function savedQuality() {
  try { return localStorage.getItem(QUALITY_KEY); } catch (e) { return null; }
}
export function saveQuality(q) {
  try { if (q) localStorage.setItem(QUALITY_KEY, q); else localStorage.removeItem(QUALITY_KEY); } catch (e) { /* ignore */ }
}
