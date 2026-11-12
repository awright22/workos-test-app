// Fits the interface to the window: one scale for every size (the root font size, since all
// interface sizes are in rem), a compact arrangement for phones, safe-area insets, and the
// player's interface settings (HUD scale, reduced motion, colour-blind-safe colours).
import { settings, onSettingsChange, reducedMotion } from './settings.js';

const html = document.documentElement;
const params = new URLSearchParams(location.search);

export const layout = {
  /** root font size in px */ rem: 16,
  /** phone-sized landscape window: the HUD uses its compact arrangement */ compact: false,
  /** portrait phone: the game asks the player to rotate */ portrait: false,
  touch: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
  /** the interface-size setting in effect, and the most this window has room for */ scale: 1, maxScale: 1.4,
  /** safe-area insets in px: [top, right, bottom, left] */ safe: [0, 0, 0, 0],
};

// ?safe=top,right,bottom,left simulates a phone's safe-area insets (used by tools/tests/ui-shots.mjs)
const sim = (params.get('safe') || '').split(',').map((v) => parseFloat(v)).filter((v) => !isNaN(v));
if (sim.length === 4) {
  ['--sat', '--sar', '--sab', '--sal'].forEach((name, i) => html.style.setProperty(name, sim[i] + 'px'));
}

let probe = null;
function measureSafe() {
  if (sim.length === 4) { layout.safe = sim.slice(); return; }
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  layout.safe = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => parseFloat(v) || 0);
}

const listeners = [];
/** Call `fn(layout)` whenever the window size, orientation or interface settings change. */
export function onLayout(fn) { listeners.push(fn); }

// What the HUD needs to lay out without anything touching, in rem: [across, down].
const NEED = { wide: [64, 36], compact: [37, 23] };

let rootEl = null;
export function applyLayout(root) {
  if (root) rootEl = root;
  const w = window.innerWidth, h = window.innerHeight;
  layout.portrait = h > w * 1.15 && w < 620;
  layout.compact = !layout.portrait && (h < 540 || w < 760);
  let s;
  if (layout.portrait) s = 1;
  else if (layout.compact) s = Math.min(1, Math.max(0.92, h / 390));
  else s = Math.min(2.4, Math.max(layout.touch ? 1 : 0.85, Math.pow(Math.min(w / 1280, h / 720), 0.8)));     // fingers need full-size targets
  measureSafe();
  // the player's interface size, held to what this window has room for (never below the default)
  const [needW, needH] = layout.compact ? NEED.compact : NEED.wide;
  const fit = Math.min((w - layout.safe[1] - layout.safe[3]) / (needW * 16 * s), (h - layout.safe[0] - layout.safe[2]) / (needH * 16 * s));
  layout.maxScale = Math.min(1.4, Math.max(1, Math.floor(fit * 20 + 0.01) / 20));
  layout.scale = layout.portrait ? 1 : Math.min(settings.hudScale, layout.maxScale);
  layout.rem = +(16 * s * layout.scale).toFixed(2);
  html.style.fontSize = layout.rem + 'px';
  if (rootEl) {
    const c = rootEl.classList;
    c.toggle('mg-compact', layout.compact);
    c.toggle('mg-portrait', layout.portrait);
    c.toggle('mg-touch', layout.touch);
    c.toggle('mg-reduced', reducedMotion());
    c.toggle('mg-cb', !!settings.colorBlind);
  }
  for (const fn of listeners) fn(layout);
}

window.addEventListener('resize', () => applyLayout());
window.addEventListener('orientationchange', () => setTimeout(applyLayout, 60));
if (window.visualViewport) window.visualViewport.addEventListener('resize', () => applyLayout());
try { window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => applyLayout()); } catch (e) { /* old browsers */ }
onSettingsChange(() => applyLayout());
