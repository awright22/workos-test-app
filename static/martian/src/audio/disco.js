// Commander Lewis's playlist. One generated disco track that never quite repeats: four on the
// floor, off-beat open hats, claps on two and four, an octave-jumping bass, scratchy rhythm
// guitar, string pads and the odd lead lick, walking eight bars round the circle of fifths.
// In the Hab it comes out of a laptop speaker; outside it leaks faintly from the suit radio;
// at the launch it plays in full, because of course it does.
import { mtof } from './dsp.js';
import { Layer } from './engine.js';

const BPM = 116, STEP = 60 / BPM / 4;
/** [bass root, chord notes] for each bar: Am7 Dm7 G7 Cmaj7 Fmaj7 Bm7b5 E7sus4 E7 */
const BARS = [
  [33, [57, 60, 64, 67]], [38, [57, 60, 62, 65]], [31, [55, 59, 62, 65]], [36, [55, 59, 60, 64]],
  [29, [53, 57, 60, 64]], [35, [53, 57, 59, 62]], [28, [52, 57, 59, 62]], [28, [52, 56, 59, 62]],
];
const GUITAR = [[2, 6, 7, 10, 14], [2, 3, 6, 10, 13, 14], [1, 2, 6, 9, 10, 14], [2, 6, 10, 11, 14, 15]];
const HAT = [0.9, 0.35, 0.6, 0.4];
const LEAD = [69, 72, 74, 76, 79, 81, 84];
const TONE = {
  hab:   { level: 0.72, hp: 180, lp: 5200, wet: 0.25 },
  out:   { level: 0.2, hp: 300, lp: 1100, wet: 0 },
  rover: { level: 0.45, hp: 200, lp: 2600, wet: 0.1 },
  full:  { level: 0.85, hp: 40, lp: 15000, wet: 0.06 },
};

function buildDisco(E, L) {
  const out = E.gain(L, 0), hp = E.filter(L, 'highpass', 180, 0.7), lp = E.filter(L, 'lowpass', 5200, 0.7), wet = E.gain(L, 0.2);
  const drums = E.gain(L, 1), inst = E.gain(L, 1);
  drums.connect(hp); inst.connect(hp); hp.connect(lp); lp.connect(out);
  out.connect(E.bus.music); out.connect(wet); wet.connect(E.send.music.room);
  return { level: E.ctl(out.gain, 0), hp: E.ctl(hp.frequency, 180), lp: E.ctl(lp.frequency, 5200), wet: E.ctl(wet.gain, 0.2), drums, inst, pump: inst.gain };
}

export class Disco {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.on = false;
    this.layer = new Layer(E, buildDisco);
    this.next = -1; this.step = 0; this.bar = 0; this.gtr = GUITAR[0]; this.lead = 3;
  }
  set(on) { this.on = !!on; }
  hush(now) { if (this.layer.on) { this.layer.c.level.to(0, 0.12); this.layer.rest(now, 1.2); } this.next = -1; }

  update(p, now) {
    if (!this.on || p.scene === 'dead' || p.scene === 'title' || p.scene === 'none') {
      if (this.layer.on) { this.layer.c.level.to(0, 0.12); this.layer.rest(now, 1.2); }
      this.next = -1;
      return;
    }
    const c = this.layer.use();
    const T = p.scene !== 'play' ? TONE.full : p.place === 'hab' ? TONE.hab : p.place === 'rover' ? TONE.rover : TONE.out;
    c.level.to(T.level * (p.sleeping ? 0.3 : 1), 0.3); c.hp.to(T.hp, 0.3); c.lp.to(T.lp, 0.3); c.wet.to(T.wet, 0.3);
    if (this.next < now - 0.5) { this.next = now + 0.08; this.step = 0; this.bar = 0; }
    let guard = 0;
    while (now + 0.22 >= this.next && guard++ < 6) { this.tick(Math.max(this.next, now + 0.01), c); this.next += STEP; }
  }

  tick(t, c) {
    const E = this.E, s = this.step, bar = this.bar, B = BARS[bar % 8], root = B[0], chord = B[1];
    if (s % 2) t += STEP * 0.1;                                    // a little swing
    const fill = bar % 8 === 7 && s >= 12;
    const v = E.voice('disco', { bus: 'music', dest: c.drums, prio: 1 }), inst = c.inst;
    if (s % 4 === 0) {                                             // kick, and the band ducks under it
      E.thud(v, t, { type: 'triangle', f: 150, f1: 46, glide: 0.06, a: 0.001, d: 0.24, g: 0.36 });
      c.pump.setTargetAtTime(0.5, t, 0.006); c.pump.setTargetAtTime(1, t + 0.05, 0.08);
    }
    if (s === 4 || s === 12 || fill) {                             // clap (a roll into the turnaround)
      // three quick slaps and a tail, cut from one strip of noise
      const k = fill && s !== 12 ? 0.6 : 1, src = E.loop(v, 'white', 1, t), bp = E.filter(v, 'bandpass', 1500, 1.0), env = E.gain(v, 0), p = env.gain;
      src.connect(bp); bp.connect(env); env.connect(v.out);
      p.setValueAtTime(0, t);
      for (const dt of [0, 0.011, 0.022]) { p.linearRampToValueAtTime(0.42 * k, t + dt + 0.001); p.exponentialRampToValueAtTime(0.05 * k, t + dt + 0.01); }
      p.linearRampToValueAtTime(0.34 * k, t + 0.034); p.setTargetAtTime(0, t + 0.034, 0.028);
      v.end = Math.max(v.end, t + 0.24);
    }
    if (s % 4 === 2) E.burst(v, t, { hp: 6000, a: 0.001, h: 0.04, d: 0.18, g: 0.2 });           // open hat on the off-beat
    else E.burst(v, t, { hp: 7000, a: 0.0005, d: 0.05, g: 0.2 * HAT[s % 4] * E.rr(0.8, 1) });
    // bass: root on the beat, octave on the off-beat, the odd ghost note and a walk-up
    let note = 0, len = 0.9;
    if (s % 4 === 0) { note = root; len = 1.5; } else if (s % 4 === 2) note = root + 12;
    else if (s % 4 === 3 && E.rand() < 0.22) { note = root + 12; len = 0.5; }
    if (s === 15 && E.rand() < 0.6) { note = BARS[(bar + 1) % 8][0] + E.pick([-1, -2, 2]); len = 0.7; }
    if (note) {
      const f = mtof(note), lp = E.filter(v, 'lowpass', 300, 2.5);
      lp.frequency.setValueAtTime(1800, t); lp.frequency.setTargetAtTime(380, t, 0.06);
      lp.connect(inst);
      E.tone(v, t, { type: 'saw', f, a: 0.004, h: STEP * len, d: 0.07, g: 0.2, dest: lp });
    }
    // rhythm guitar: short scratchy chords through a quick wah
    if (this.gtr.includes(s)) {
      const wah = E.filter(v, 'bandpass', 1300, 2.5);
      E.sweep(wah.frequency, t, E.rr(1100, 1500), E.rr(2200, 2900), 0.06);
      wah.connect(inst);
      for (let i = 1; i < 4; i++) E.tone(v, t + i * 0.004, { type: 'saw', f: mtof(chord[i] + 12), a: 0.002, d: 0.09, g: 0.15, dest: wah });
    }
    // strings: one soft chord a bar
    if (s === 0) {                                                 // (their own voice: they last the whole bar)
      const sv = E.voice('discoStrings', { bus: 'music', dest: inst, prio: 1 }), lp = E.filter(sv, 'lowpass', 3000, 0.7);
      lp.connect(sv.out);
      for (const m of chord) E.tone(sv, t, { type: 'saw', f: mtof(m + 12), cents: E.rr(-8, 8), a: 0.09, h: STEP * 16 - 0.36, d: 0.3, g: 0.03, dest: lp });
      E.tone(sv, t, { type: 'saw', f: mtof(chord[3] + 24), cents: 6, a: 0.12, h: STEP * 16 - 0.4, d: 0.3, g: 0.014, dest: lp });
      E.seal(sv);
    }
    // a lead lick in the second half of every sixteen bars
    if (bar % 16 >= 8 && bar % 16 < 12 && [0, 3, 6, 8, 11, 14].includes(s) && E.rand() < 0.7) {
      this.lead = Math.max(0, Math.min(LEAD.length - 1, this.lead + E.pick([-2, -1, 1, 1, 2])));
      const lp = E.filter(v, 'lowpass', 2800, 1); lp.connect(inst);
      const o = E.tone(v, t, { type: 'hollow', f: mtof(LEAD[this.lead]), a: 0.008, h: 0.1, d: 0.14, g: 0.07, dest: lp });
      E.wobble(v, o.frequency, 3, 1.2, t);
    }
    E.seal(v);
    this.step = (s + 1) % 16;
    if (this.step === 0) { this.bar++; if (this.bar % 2 === 0) this.gtr = E.pick(GUITAR); }
  }
}
