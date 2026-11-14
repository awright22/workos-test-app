// Photo mode's controls: a bar along the bottom with the lens, the framing, the look, and the shutter.
import { root, el, toast, esc } from './dom.js';
import { icon } from './icons.js';
import { Snd } from '../audio/sound.js';
import { LOOKS, photo, enterPhoto, exitPhoto, onPhotoMode, takePhoto } from '../game/photo.js';

let bar = null, flash = null, drawFrame = null, busy = false;

const SLIDERS = [
  ['dist', 'Distance', 1.2, 40, 0.1, (v) => `${(+v).toFixed(1)} m`],
  ['fov', 'Lens', 16, 95, 1, (v) => `${Math.round(v)}°`],
  ['rise', 'Height', -1, 12, 0.1, (v) => `${(+v) >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)} m`],
  ['slide', 'Sideways', -14, 14, 0.1, (v) => `${(+v) >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)} m`],
  ['exposure', 'Exposure', -1.5, 1.5, 0.05, (v) => `${(+v) >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)} EV`],
];

function build() {
  bar = el('div', 'mg-photo', null, root);
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Photo mode');
  const sliders = SLIDERS.map(([id, label, min, max, step]) =>
    `<label class="ph-s"><span>${label}</span><input class="mg-range" type="range" data-ph="${id}" min="${min}" max="${max}" step="${step}" aria-label="${label}"><output></output></label>`).join('');
  const looks = Object.entries(LOOKS).map(([id, l]) => `<button type="button" role="radio" data-look="${id}">${esc(l.name)}</button>`).join('');
  bar.innerHTML =
    '<div class="ph-top"><span class="ph-title">' + icon('camera') + 'Photo mode</span><span class="ph-hint"></span></div>' +
    `<div class="ph-row"><div class="ph-sliders">${sliders}</div>` +
    `<div class="ph-side"><div class="mg-seg ph-looks" role="radiogroup" aria-label="Look">${looks}</div>` +
    `<div class="ph-btns"><button type="button" class="mg-btn small ph-more" data-act="astro" aria-pressed="true">${icon('check')}Astronaut</button>` +
    `<button type="button" class="mg-btn small ph-more" data-act="bars" aria-pressed="false">${icon('check')}Cinema bars</button>` +
    '<button type="button" class="mg-btn small ph-more" data-act="reset">Reset</button>' +
    '<button type="button" class="mg-btn small" data-act="min" aria-expanded="true">Hide controls</button>' +
    `<button type="button" class="mg-btn primary" data-act="snap">${icon('camera')}Take photo</button>` +
    '<button type="button" class="mg-btn" data-act="done">Done</button></div></div></div>';
  flash = el('div', 'mg-photo-flash', null, root);
  el('div', 'mg-photo-bars', null, root);
  bar.addEventListener('input', (ev) => {
    const id = ev.target.dataset.ph;
    if (!id) return;
    photo[id] = +ev.target.value;
    sync();
  });
  bar.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    ev.stopPropagation();
    if (b.dataset.look) { photo.look = b.dataset.look; Snd.click(); sync(); return; }
    const a = b.dataset.act;
    if (a === 'astro') { photo.showAstronaut = !photo.showAstronaut; sync(); }
    else if (a === 'bars') { root.classList.toggle('ph-bars'); sync(); }
    else if (a === 'reset') { Object.assign(photo, { dist: 6, fov: 50, rise: 0, slide: 0, push: 0, exposure: 0, look: 'natural', showAstronaut: true }); sync(); }
    else if (a === 'min') { root.classList.toggle('ph-min'); sync(); }
    else if (a === 'snap') snap();
    else if (a === 'done') exitPhoto();
  });
  // the bar must not start a look drag or take the keyboard's movement keys
  for (const t of ['mousedown', 'touchstart', 'pointerdown', 'wheel']) bar.addEventListener(t, (ev) => ev.stopPropagation(), { passive: true });
  window.addEventListener('wheel', (ev) => {
    if (!photo.on || bar.contains(ev.target)) return;
    photo.dist = Math.max(1.2, Math.min(40, photo.dist * Math.exp(ev.deltaY * 0.0012)));
    sync();
  }, { passive: true });
}

/** Bring the controls in line with the state (after a key, the wheel, or a reset). */
export function sync() {
  if (!bar) return;
  for (const [id, , min, max, , fmt] of SLIDERS) {
    const inp = bar.querySelector(`[data-ph="${id}"]`);
    const v = Math.max(min, Math.min(max, photo[id]));
    if (document.activeElement !== inp) inp.value = v;
    inp.style.setProperty('--fill', `${((v - min) / (max - min) * 100).toFixed(1)}%`);
    inp.style.setProperty('--f', ((v - min) / (max - min)).toFixed(3));
    inp.nextElementSibling.textContent = fmt(v);
  }
  bar.querySelectorAll('[data-look]').forEach((b) => { b.setAttribute('aria-checked', b.dataset.look === photo.look); });
  bar.querySelector('[data-act="astro"]').setAttribute('aria-pressed', photo.showAstronaut);
  bar.querySelector('[data-act="bars"]').setAttribute('aria-pressed', root.classList.contains('ph-bars'));
  const min = root.classList.contains('ph-min'), mb = bar.querySelector('[data-act="min"]');
  mb.textContent = min ? 'Controls' : 'Hide controls'; mb.setAttribute('aria-expanded', !min);
}

async function snap() {
  if (busy || !drawFrame) return;
  busy = true;
  const shot = await takePhoto(drawFrame);
  busy = false;
  if (!shot) { toast('PHOTO', 'Could not save the picture', 'The browser refused the image.'); return; }
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  Snd.click();
  for (const name of shot.subjects) toast('PHOTOGRAPHED', name, 'One for NASA\u2019s archive · +4 science');
  const file = typeof File === 'function' ? new File([shot.blob], shot.name, { type: 'image/png' }) : null;
  // a phone's share sheet can put it in the photo library; anything else downloads it
  if (file && navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [file], title: 'Stranded II' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(shot.blob);
  const a = document.createElement('a');
  a.href = url; a.download = shot.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** `draw` draws one frame of the scene (the main loop's own draw). */
export function initPhotoUi(draw) {
  drawFrame = draw;
  onPhotoMode(() => {
    if (!bar) build();
    const touch = matchMedia('(pointer: coarse)').matches;
    bar.querySelector('.ph-hint').textContent = touch ? 'Drag to look round' : 'Drag to look round · W A S D move · Q E lower and raise · wheel zooms · Esc leaves';
    root.classList.add('is-photo');
    root.classList.toggle('ph-min', root.classList.contains('mg-compact'));      // on a phone the picture comes first: the controls open on request
    sync();
  }, () => { root.classList.remove('is-photo', 'ph-bars', 'ph-min'); });
}
export function togglePhoto() { if (photo.on) exitPhoto(); else enterPhoto(); }
