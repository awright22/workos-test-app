// Four volume sliders for whatever menu wants them (today the pause menu): master, music,
// effects, ambience. Each change is applied at once, remembered for next time, and answered
// with a short sample on that bus so the level can be judged by ear. Styled inline so it needs
// nothing from game.css; a redesigned settings screen can drop this file and call
// setAudioVolume() from settings.js itself.
import { Snd } from './sound.js';
import { setAudioVolume, getAudioVolumes } from './settings.js';

const ROWS = [['master', 'VOLUME'], ['music', 'MUSIC'], ['sfx', 'EFFECTS'], ['ambience', 'AMBIENCE']];

/**
 * Add the sliders to a menu. With no arguments they go into the game's overlay panel, above
 * its row of buttons. Safe to call every time the menu is shown.
 */
export function mountAudioControls(container, before) {
  container = container || document.getElementById('mg-panel');
  if (!container || container.querySelector('.mg-audio')) return null;
  if (before === undefined) before = container.querySelector('.btns');
  const box = document.createElement('div');
  box.className = 'mg-audio';
  box.style.cssText = 'margin:14px 0 4px;display:grid;grid-template-columns:auto 1fr auto;gap:6px 12px;align-items:center;font-size:12px;letter-spacing:1px;opacity:.92;text-align:left';
  const vol = getAudioVolumes();
  for (const [bus, label] of ROWS) {
    const name = document.createElement('label'), input = document.createElement('input'), val = document.createElement('span');
    name.textContent = label; name.htmlFor = 'mg-vol-' + bus;
    input.type = 'range'; input.min = '0'; input.max = '100'; input.step = '5'; input.id = 'mg-vol-' + bus;
    input.value = String(Math.round(vol[bus] * 100));
    input.setAttribute('aria-label', label.toLowerCase() + ' volume');
    input.style.cssText = 'width:100%;height:28px;accent-color:#ffb45e;touch-action:pan-y';
    val.textContent = input.value; val.style.cssText = 'min-width:3ch;text-align:right;font-variant-numeric:tabular-nums';
    input.addEventListener('input', () => {
      setAudioVolume(bus, Number(input.value) / 100);
      val.textContent = input.value;
      Snd.audition(bus);
    });
    box.append(name, input, val);
  }
  if (before && before.parentNode === container) container.insertBefore(box, before); else container.appendChild(box);
  return box;
}
