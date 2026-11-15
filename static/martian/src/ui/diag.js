/*
 * Diagnostics: the numbers needed to judge the game on a real device, on the device.
 * Open with ?diag in the address, the F3 key, or four quick taps in the top-left corner of the
 * screen. COPY puts a short report on the clipboard to paste into a message.
 * It stands apart from the game's interface on purpose: it must work when something else does not.
 */
const errors = [];
let panel = null, body = null, open = false, getInfo = () => ({}), build = '?';
const frames = [];                       // the game's recent frames: the time from each drawn frame to the next, ms
const work = [];                         // and the main thread's share of each (the game's step and the picture's orders), ms
const raw = [];                          // the screen's own recent frames (every animation frame, drawn in or not), ms
let hz = 0, hzAt = 0, held = 60, resized = 0;

function note(text) { errors.push(String(text).slice(0, 300)); if (errors.length > 12) errors.shift(); }
function gpu() {
  try {
    const c = document.querySelector('canvas.mg-three') || document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'no WebGL';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + (gl instanceof WebGL2RenderingContext ? ' · WebGL2' : ' · WebGL1');
  } catch (e) { return 'unknown'; }
}
function numbers() {
  const n = frames.length || 1;
  const sorted = [...frames].sort((a, b) => a - b);
  const avg = frames.reduce((a, b) => a + b, 0) / n;
  const w = [...work].sort((a, b) => a - b);
  return {
    fps: 1000 / (avg || 16.7), low: 1000 / (sorted[Math.floor(n * 0.99)] || avg || 16.7), worst: sorted[n - 1] || 0,
    // (frames that took twice the usual one or more: the hitches, as against a rate that is low all the time)
    hitches: frames.filter((f) => f > 2.2 * (sorted[Math.floor(n * 0.5)] || 16.7)).length,
    work: w.length ? work.reduce((a, b) => a + b, 0) / w.length : 0, workWorst: w.length ? w[w.length - 1] : 0,
  };
}
/**
 * How many frames a second the screen gives a page, as near as can be told: from the shortest tenth of its recent
 * animation frames (a slow frame makes a long gap and never a short one). 60 on most phones, 120 on some screens,
 * 30 on an iPhone in Low Power Mode. The highest reading stands: a screen does not get slower because the game did.
 */
export function screenHz() {
  const now = performance.now();
  if (raw.length >= 40 && now - hzAt > 1000) {
    hzAt = now;
    const p10 = [...raw].sort((a, b) => a - b)[Math.floor(raw.length * 0.1)];
    const est = p10 < 7.6 ? 144 : p10 < 9.6 ? 120 : p10 < 12.6 ? 90 : p10 < 21 ? 60 : 30;
    if (est > hz) hz = est;
  }
  return hz || 60;
}
/** One frame of the game, drawn: how long since the one before, and how long the main thread took over it (ms). */
export function noteFrame(ms, workMs, rate) {
  held = rate;
  if (ms < 1000) { frames.push(ms); work.push(workMs); if (frames.length > 600) { frames.shift(); work.shift(); } }
}
/** The picture's resolution was changed (a new set of render targets: on some phones a frame is lost to it). */
export function noteResize() { resized++; }
export function diagReport() {
  const i = getInfo() || {}, f = numbers(), c = document.querySelector('canvas.mg-three');
  return [
    `Stranded II · build ${build} · quality ${i.quality || '?'} · scale ${i.scale === undefined ? '?' : i.scale}`,
    `frame rate ${f.fps.toFixed(0)} fps average, ${f.low.toFixed(0)} fps at the slowest 1%, worst frame ${f.worst.toFixed(0)} ms (over the last ${frames.length} frames)`,
    `held to ${held} · screen gives ${screenHz()} · ${f.hitches} long frames · main thread ${f.work.toFixed(1)} ms a frame, worst ${f.workWorst.toFixed(0)} ms · resolution changed ${resized} times`,
    `canvas ${c ? c.width + 'x' + c.height : '?'} · screen ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}`,
    `draw calls ${i.calls === undefined ? '?' : i.calls} (${i.shadowCalls || 0} shadow) · triangles ${i.triangles === undefined ? '?' : Math.round(i.triangles / 1000) + 'k'}`,
    `GPU ${gpu()}`,
    `${navigator.userAgent}`,
    `errors ${errors.length}${errors.length ? ': ' + errors.slice(-3).join(' | ') : ''}`,
  ].join('\n');
}
function render() {
  if (!open || !body) return;
  body.textContent = diagReport();
}
function toggle(force) {
  open = force === undefined ? !open : force;
  if (open && !panel) {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:calc(env(safe-area-inset-left,0px) + 6px);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:99999;max-width:min(92vw,560px);' +
      'background:rgba(0,0,0,.78);color:#e8e2d8;font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:8px 10px;border:1px solid rgba(255,180,94,.5);border-radius:6px;white-space:pre-wrap;word-break:break-word;';
    body = document.createElement('div');
    const bar = document.createElement('div');
    bar.style.cssText = 'margin-top:6px;display:flex;gap:8px;';
    const button = (label, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = 'font:inherit;color:#1a120a;background:#ffb45e;border:0;border-radius:4px;padding:6px 12px;';
      b.addEventListener('click', (ev) => { ev.stopPropagation(); fn(b); });
      bar.appendChild(b);
    };
    button('COPY', (b) => {
      const text = diagReport();
      const done = () => { b.textContent = 'COPIED'; setTimeout(() => { b.textContent = 'COPY'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => { b.textContent = 'SELECT THE TEXT'; });
      else b.textContent = 'SELECT THE TEXT';
    });
    button('CLOSE', () => toggle(false));
    panel.append(body, bar);
    document.body.appendChild(panel);
  }
  if (panel) panel.style.display = open ? 'block' : 'none';
  render();
}

/** @param {() => object} info  current renderer numbers: { quality, scale, calls, shadowCalls, triangles } */
export function initDiag(info) {
  getInfo = info;
  window.addEventListener('error', (e) => note(e.message || e.error || 'error'));
  window.addEventListener('unhandledrejection', (e) => note('promise: ' + (e.reason && e.reason.message || e.reason)));
  const original = console.error.bind(console);
  console.error = (...a) => { note(a.map((x) => (x && x.message) || String(x)).join(' ')); original(...a); };
  // Which build is this? The page says (index.html is stamped with it). And which build is the offline copy? If
  // the two differ, the report says both: an installed copy that has not taken a new build shows here.
  build = window.__BUILD || '?';
  if (window.caches) caches.keys().then((keys) => { const k = keys.filter((x) => x.startsWith('stranded2-')).map((x) => x.slice(10)); if (k.length && (k.length > 1 || k[0] !== build)) build += ` (offline copy ${k.join(', ')})`; }).catch(() => {});
  // (a page from before the stamp, or a plain file server: ask the worker's script, as it used to)
  if (build === '?') fetch(new URL('sw.js', document.baseURI)).then((r) => r.text()).then((t) => { const m = /stranded2?-([0-9a-f]{6,})/.exec(t); if (m) build = m[1]; }).catch(() => {});
  let last = performance.now();
  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = now - last; last = now;
    if (dt > 2 && dt < 1000) { raw.push(dt); if (raw.length > 240) raw.shift(); }
  };
  requestAnimationFrame(tick);
  setInterval(render, 500);
  window.addEventListener('keydown', (e) => { if (e.key === 'F3') { e.preventDefault(); toggle(); } });
  // four quick taps in the top-left corner
  let taps = 0, tapT = 0;
  window.addEventListener('pointerdown', (e) => {
    if (e.clientX > 70 || e.clientY > 70) { taps = 0; return; }
    const now = performance.now();
    taps = now - tapT < 600 ? taps + 1 : 1; tapT = now;
    if (taps >= 4) { taps = 0; toggle(); }
  }, { passive: true });
  if (/[?&]diag\b/.test(location.search)) toggle(true);
}
