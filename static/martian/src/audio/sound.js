// WebAudio synthesis (first version; the audio rebuild replaces this module).
import { clamp } from '../core/math.js';

export const Snd = {
  ctx: null, master: null, windGain: null, rumbleGain: null,
  discoTimer: null, alarmTimer: null, _lastWind: -1, _lastRumble: -1,
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      const mk = (freq, type) => {
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const f = this.ctx.createBiquadFilter();
        f.type = type; f.frequency.value = freq; f.Q.value = 0.6;
        const g = this.ctx.createGain(); g.gain.value = 0;
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start();
        return g;
      };
      this.windGain = mk(260, 'bandpass');
      this.rumbleGain = mk(110, 'lowpass');
    } catch (e) { this.ctx = null; }
  },
  resume() { try { this.ctx && this.ctx.state === 'suspended' && this.ctx.resume(); } catch (e) {} },
  _ramp(gain, key, v, t) {
    if (!gain || Math.abs(v - this[key]) < 0.01) return;
    this[key] = v;
    try {
      gain.gain.cancelScheduledValues(this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + t);
    } catch (e) {}
  },
  wind(level) { this._ramp(this.windGain, '_lastWind', clamp(level, 0, 1) * 0.5, 0.6); },
  rumble(level) { this._ramp(this.rumbleGain, '_lastRumble', clamp(level, 0, 1), 0.3); },
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
  pickup() { this.beep(500, 0.06, 'triangle', 0.14); setTimeout(() => this.beep(750, 0.08, 'triangle', 0.12), 70); },
  craft() { [392, 494, 587].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, 'triangle', 0.13), i * 90)); },
  jingle() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.22, 'triangle', 0.16), i * 130)); },
  discovery() { [659, 880, 1109, 1319].forEach((f, i) => setTimeout(() => this.beep(f, 0.3, 'sine', 0.13), i * 160)); },
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
