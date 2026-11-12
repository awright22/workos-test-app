/*
 * Diagnostics: the numbers needed to judge the game on a real device, on the device.
 * Open with ?diag in the address, the F3 key, or four quick taps in the top-left corner of the
 * screen. COPY puts a short report on the clipboard to paste into a message.
 * It stands apart from the game's interface on purpose: it must work when something else does not.
 */
const errors = [];
let panel = null, body = null, open = false, getInfo = () => ({}), build = '?';
const frames = [];                       // recent frame times, ms

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
  return { fps: 1000 / (avg || 16.7), low: 1000 / (sorted[Math.floor(n * 0.99)] || avg || 16.7), worst: sorted[n - 1] || 0 };
}
export function diagReport() {
  const i = getInfo() || {}, f = numbers(), c = document.querySelector('canvas.mg-three');
  return [
    `Stranded II · build ${build} · quality ${i.quality || '?'} · scale ${i.scale === undefined ? '?' : i.scale}`,
    `frame rate ${f.fps.toFixed(0)} fps average, ${f.low.toFixed(0)} fps at the slowest 1%, worst frame ${f.worst.toFixed(0)} ms (over the last ${frames.length} frames)`,
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
  // which build is this? the service worker's cache name is a hash of every shipped file
  fetch(new URL('sw.js', document.baseURI)).then((r) => r.text()).then((t) => { const m = /stranded2?-([0-9a-f]{6,})/.exec(t); if (m) build = m[1]; }).catch(() => {});
  let last = performance.now();
  const tick = (now) => {
    requestAnimationFrame(tick);
    const dt = now - last; last = now;
    if (dt < 1000) { frames.push(dt); if (frames.length > 600) frames.shift(); }
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
