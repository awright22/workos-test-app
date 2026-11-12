// Volume settings: applied to the audio system and kept in the browser between sessions.
import { Snd } from './sound.js';

const KEY = 'stranded2-audio';
/** Set a volume ('master' | 'music' | 'sfx' | 'ambience', 0..1) and remember it for next time. */
export function setAudioVolume(bus, v) {
  Snd.setVolume(bus, v);
  try { localStorage.setItem(KEY, JSON.stringify(Snd.vol)); } catch (e) { /* private mode */ }
}
export function getAudioVolumes() { return { ...Snd.vol }; }
/** Apply whatever was saved last time (called once at start-up). */
export function loadAudioVolumes() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // (the master level belongs to the interface's settings; only the three mixes are kept here)
    if (saved) for (const k in Snd.vol) if (k !== 'master' && typeof saved[k] === 'number') Snd.setVolume(k, saved[k]);
  } catch (e) { /* nothing saved, or not readable */ }
}
