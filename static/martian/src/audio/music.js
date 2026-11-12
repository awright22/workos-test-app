// The score: sparse, warm, lonely, hopeful, and written by the game as it goes.
//
// There is no recording and no loop. A four-voice pad drifts through chords chosen at random
// from a small pool for the present situation, moving one voice at a time so the harmony
// changes like weather; soft bell tones play short phrases over it and then leave long gaps; a
// bass note comes and goes. The situation picks the pool and the colour:
//
//   day      open major chords, the home key          night   the relative minor, lower, sparser
//   hab      warm subdominant side, close and quiet   drive   a mixolydian drift with a soft pulse
//   danger   a dark suspended chord over a drone      triumph a bright rising progression
//   title    the theme        space  two still chords        silence  nothing
//
// All states share one tonic, so moving between them re-centres the harmony instead of jumping
// key, and the stingers in sfx.js are tuned to the same tonic. The music also rests: outside
// the urgent states it plays for a minute or two, then leaves the planet to its wind for about
// as long, and may come back in another key.
import { clamp, lerp, smooth, mtof } from './dsp.js';
import { Layer } from './engine.js';

/** Chords as pitch classes above the tonic: bass root, then the notes the pad may use. */
const CH = {
  I:    { root: 0,  tones: [0, 4, 7, 2] },
  IV:   { root: 5,  tones: [5, 9, 0, 7] },
  IVl:  { root: 5,  tones: [5, 9, 4, 11] },      // lydian colour: wonder
  V:    { root: 7,  tones: [7, 2, 9, 0] },       // suspended, no leading note: never a full stop
  vi:   { root: 9,  tones: [9, 0, 4, 7] },
  ii:   { root: 2,  tones: [2, 5, 9, 0] },
  iii:  { root: 4,  tones: [4, 7, 11, 2] },
  bVII: { root: 10, tones: [10, 2, 5, 0] },
  phr:  { root: 4,  tones: [4, 11, 5, 9] },      // suspended flat nine: the danger colour
  vib6: { root: 9,  tones: [9, 4, 5, 0] },
};
const ST = {
  title:   { pool: ['vi', 'IV', 'I', 'V'], seq: true, chord: [11, 14], bright: 0.5, pad: 1.0, bass: 0.8, bells: 1.0, motif: 0.5, phrase: [3, 5], rest: [4, 8], beat: 1.5 },
  day:     { pool: ['I', 'IV', 'vi', 'iii', 'IVl', 'ii'], chord: [18, 34], bright: 0.55, pad: 0.85, bass: 0.45, bells: 0.9, motif: 0.14, phrase: [2, 5], rest: [7, 18], beat: 1.8, play: [70, 150], quiet: [45, 110] },
  night:   { pool: ['vi', 'IV', 'ii', 'iii'], chord: [24, 44], bright: 0.3, pad: 0.7, bass: 0.3, bells: 0.6, motif: 0.1, phrase: [1, 3], rest: [14, 30], beat: 2.4, low: true, play: [50, 100], quiet: [80, 190] },
  hab:     { pool: ['IV', 'I', 'ii', 'vi'], chord: [20, 36], bright: 0.42, pad: 0.7, bass: 0.35, bells: 0.7, motif: 0.1, phrase: [2, 4], rest: [9, 22], beat: 2.0, play: [60, 120], quiet: [60, 140] },
  drive:   { pool: ['I', 'bVII', 'IV', 'V', 'vi'], chord: [13, 22], bright: 0.6, pad: 0.8, bass: 0.7, bells: 0.6, motif: 0.12, phrase: [2, 4], rest: [8, 16], beat: 1.58, pulse: 1, play: [90, 200], quiet: [35, 80] },
  danger:  { pool: ['phr', 'vib6'], chord: [10, 18], bright: 0.2, pad: 1.0, bass: 1.0, bells: 0.5, motif: 0, phrase: [1, 2], rest: [7, 13], beat: 2.6, dark: true },
  triumph: { pool: ['IV', 'V', 'vi', 'IV', 'I', 'V', 'I'], seq: true, chord: [6.5, 8], bright: 0.8, pad: 1.1, bass: 0.9, bells: 1.2, motif: 0.6, phrase: [3, 5], rest: [2, 4], beat: 1.1 },
  space:   { pool: ['IVl', 'I'], chord: [16, 24], bright: 0.35, pad: 0.8, bass: 0, bells: 0.5, motif: 0.3, phrase: [1, 3], rest: [6, 12], beat: 2.4 },
  silence: { pool: ['I'], chord: [30, 30], bright: 0.3, pad: 0, bass: 0, bells: 0, motif: 0, phrase: [1, 1], rest: [30, 30], beat: 2, mute: true },
};
const KEYS = [57, 58, 60, 62, 63, 65];            // tonics the score may settle on (A, B flat, C, D, E flat, F)
const RANGES = [[45, 57], [52, 64], [57, 69], [62, 76]];
const VOICE_LEVEL = [0.062, 0.055, 0.05, 0.04];
const PENT = [0, 2, 4, 7, 9], DARK = [4, 9, 11, 14, 17];
/** The theme, as steps on the pentatonic ladder: do, sol, la, mi. */
const MOTIF = [[0, 1.5], [3, 1], [4, 0.5], [2, 2]];
const LOOKAHEAD = 0.4;

function buildPad(E, L) {
  const out = E.gain(L, 0), lp = E.filter(L, 'lowpass', 1200, 0.5), wet = E.gain(L, 0.55);
  lp.connect(out); out.connect(E.bus.music); out.connect(wet); wet.connect(E.send.music.hall);
  const voices = [];
  for (let i = 0; i < 4; i++) {
    const a = E.osc(L, 'pad', 220), b = E.osc(L, 'pad', 220);
    a.detune.value = -6 - i; b.detune.value = 6 + i;
    const pa = E.pan(L, -0.5), pb = E.pan(L, 0.5), g = E.gain(L, 0);
    a.connect(pa); pa.connect(g); b.connect(pb); pb.connect(g); g.connect(lp);
    voices.push({ a: a.frequency, b: b.frequency, g: g.gain, midi: 0, level: 0 });
  }
  const bo = E.osc(L, 'sine', 55), bo2 = E.osc(L, 'pad', 110), bg2 = E.gain(L, 0.22), bg = E.gain(L, 0), blp = E.filter(L, 'lowpass', 280, 0.7);
  bo.connect(bg); bo2.connect(bg2); bg2.connect(bg); bg.connect(blp); blp.connect(out);
  const bass = { a: bo.frequency, b: bo2.frequency, g: bg.gain, midi: 0, level: 0 };
  return { out: E.ctl(out.gain, 0), cut: E.ctl(lp.frequency, 1200), voices, bass };
}

export class Music {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.pad = new Layer(E, buildPad);
    this.K = 62;
    this.state = 'silence'; this.cand = 'silence'; this.candSince = 0;
    this.chord = CH.I; this.chordIdx = -1; this.chordUntil = -1;
    this.playing = false; this.sectionUntil = -1; this.presence = 0; this.duck = 1;
    this.noteNext = -1; this.phraseLeft = 0; this.step = 4; this.motifAt = -1; this.beat = 1.8;
    this.pulseNext = -1; this.pulseStep = 0; this.pulseAmt = 0; this.mask = [1, 0, 0.6, 0, 0.9, 0.2, 0.5, 0];
    this.tollNext = -1;
    this.triumphUntil = -1; this.driveTime = 0; this.danger = 0;
    this.override = null; this.phase = E.rr(0, 6.28);
  }
  /** MIDI note of the current tonic (sfx.js tunes its stingers to it). */
  key() { return this.K; }
  /** A story beat asks for a mood for a while: 'triumph'. */
  cue(name, seconds) { if (name === 'triumph') this.triumphUntil = this.E.now + (seconds || 46); }
  /** Force a state and keep it sounding (tests, trailers); null hands control back. */
  force(state) { this.override = state && ST[state] ? state : null; }

  /** The music slider is at zero: stop generating. */
  hush(now) {
    if (this.pad.on) { this.pad.c.out.to(0, 0.3); this.pad.rest(now, 2); }
    this.presence = 0;
  }

  pick(p, dt) {
    if (this.override) return this.override;
    if (p.scene === 'title') return 'title';
    if (p.scene === 'dead') return 'silence';
    if (p.scene === 'won') return 'triumph';
    if (p.scene === 'cutscene') return (p.space || 0) > 0.6 ? 'space' : 'silence';
    if (this.E.now < this.triumphUntil) return 'triumph';
    this.driveTime = p.place === 'rover' && Math.abs(p.roverSpeed) > 3 ? this.driveTime + dt : Math.max(0, this.driveTime - dt * 0.5);
    const d = Math.max(p.breach ? 1 : 0, smooth(0.26, 0.08, p.o2), smooth(0.34, 0.1, p.health),
      p.place === 'hab' ? 0 : smooth(0.4, 0.8, p.storm), p.leak ? 0.7 : 0);
    this.danger = d;
    if (d > 0.3) return 'danger';
    if (p.place === 'hab') return 'hab';
    if (this.driveTime > 6) return 'drive';
    return p.day > 0.35 ? 'day' : 'night';
  }

  enter(state, now) {
    const was = ST[this.state], st = ST[state];
    this.state = state;
    if (!st.play) {                                // urgent or scripted states always sound (or never, for silence)
      this.playing = !st.mute; this.sectionUntil = -1;
    } else if (!was.play && !was.mute) {           // coming down from one: linger, then rest
      this.playing = true; this.sectionUntil = now + this.E.rr(20, 50);
    }
    this.chordIdx = -1;
    this.chordUntil = Math.min(this.chordUntil < 0 ? now : this.chordUntil, now + (st.dark ? 0.4 : 3));
    this.noteNext = Math.min(this.noteNext < 0 ? 1e9 : this.noteNext, now + this.E.rr(1.5, 4));
    this.phraseLeft = 0; this.tollNext = now + 1.2;
  }

  update(p, now, dt) {
    const E = this.E;
    const want = this.pick(p, dt);
    if (want !== this.cand) { this.cand = want; this.candSince = now; }
    const settle = this.cand === 'danger' ? 0.6 : ST[this.cand].play ? 2.5 : 0;
    if (this.cand !== this.state && now - this.candSince >= settle) this.enter(this.cand, now);
    const st = ST[this.state];

    // ---- sections: play, then rest ----
    if (st.play && !this.override) {
      if (this.sectionUntil < 0) { this.playing = false; this.sectionUntil = now + E.rr(10, 22); }
      else if (now >= this.sectionUntil) {
        this.playing = !this.playing;
        if (this.playing) {
          this.sectionUntil = now + E.rr(st.play[0], st.play[1]);
          if (E.rand() < 0.35 && this.presence < 0.05) this.K = E.pick(KEYS);
          this.chordIdx = -1; this.chordUntil = now; this.noteNext = now + E.rr(6, 14); this.phraseLeft = 0;
        } else this.sectionUntil = now + E.rr(st.quiet[0], st.quiet[1]);
      }
    } else if (this.override) this.playing = !st.mute;
    const target = this.playing && !st.mute ? 1 : 0;
    const k = (tc) => 1 - Math.exp(-dt / tc);
    this.presence += (target - this.presence) * k(target > this.presence ? (st.dark ? 1.4 : 4.5) : 6);
    this.duck += ((p.disco ? 0 : p.sleeping ? 0.35 : 1) - this.duck) * k(0.8);
    const level = this.presence * this.duck;

    // ---- pad and bass ----
    if (level > 0.004 && st.pad > 0) {
      const fresh = !this.pad.on, c = this.pad.use();
      const urge = st.dark ? 0.65 + 0.35 * this.danger : 1;
      c.out.to(0.2 * st.pad * level * urge, 0.6);
      const bright = st.bright * (1 + 0.16 * Math.sin(now * 0.047 + this.phase));
      c.cut.to(480 + 1900 * bright, 1.8);
      if (fresh || now >= this.chordUntil) this.nextChord(now, fresh);
    } else if (this.pad.on) {
      this.pad.c.out.to(0, 0.8);
      this.pad.rest(now, 5);
    }
    if (target < 0.5 || level < 0.3) return;

    // ---- bell phrases ----
    if (st.bells > 0) {
      if (this.noteNext < 0) this.noteNext = now + E.rr(2, 6);
      let guard = 0;
      while (now + LOOKAHEAD >= this.noteNext && guard++ < 4) this.bellNote(Math.max(this.noteNext, now + 0.01), st, level);
    }
    // ---- the long-drive pulse ----
    this.pulseAmt += ((st.pulse ? 1 : 0) - this.pulseAmt) * k(5);
    if (this.pulseAmt > 0.06) {
      const len = 60 / 76 / 2;
      if (this.pulseNext < now - 1) this.pulseNext = now + 0.1;
      let guard = 0;
      while (now + LOOKAHEAD >= this.pulseNext && guard++ < 4) {
        const s = this.pulseStep++ % 8;
        if (s === 0 && E.rand() < 0.3) this.mask = this.mask.map((m, i) => (i === 0 ? 1 : clamp(m + E.rr(-0.5, 0.5), 0, 1)));
        if (E.rand() < this.mask[s] * this.pulseAmt) this.pluck(Math.max(this.pulseNext, now + 0.01), s, level);
        this.pulseNext += len;
      }
    }
    // ---- danger: a low toll ----
    if (st.dark && now >= this.tollNext) {
      const v = E.voice('mToll', { bus: 'music', hall: 0.6, prio: 1 });
      E.bell(v, now + 0.02, { f: mtof(this.K + this.chord.root - 12), ratio: 1.41, index: 1.3, bite: 0.5, d: 7, g: 0.055 * level });
      if (E.rand() < 0.5) E.bell(v, now + E.rr(1.5, 3), { f: mtof(this.K + this.chord.root + 24 + E.pick([0, 1, 7])), index: 0.5, d: 5, g: 0.014 * level });
      E.seal(v);
      this.tollNext = now + E.rr(7, 13) / (0.6 + this.danger * 0.6);
    }
  }

  nextChord(now, fresh) {
    const E = this.E, st = ST[this.state], pool = st.pool;
    if (st.seq || this.chordIdx < 0) this.chordIdx = (this.chordIdx + 1) % pool.length;
    else if (pool.length > 1) { let i; do { i = Math.floor(E.rand() * pool.length); } while (i === this.chordIdx); this.chordIdx = i; }
    this.chord = CH[pool[this.chordIdx]];
    this.chordUntil = now + E.rr(st.chord[0], st.chord[1]);
    const c = this.pad.c, tones = this.chord.tones, K = this.K, used = [], fast = fresh || st.dark;
    const order = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) { const j = Math.floor(E.rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let off = 0;
    for (const i of order) {
      const vc = c.voices[i], lo = RANGES[i][0] - (st.low ? 2 : 0), hi = RANGES[i][1] - (st.low ? 3 : 0);
      let best = lo, bestCost = 1e9, bestPc = 0;
      for (let m = lo; m <= hi; m++) {
        const pc = (((m - K) % 12) + 12) % 12, ti = tones.indexOf(pc);
        if (ti < 0) continue;
        let cost = vc.midi ? Math.abs(m - vc.midi) : Math.abs(m - (lo + hi) / 2) * 0.3;
        if (used.includes(pc)) cost += 5;
        if (i === 0 && pc !== this.chord.root) cost += pc === (this.chord.root + 7) % 12 ? 2 : 6;
        if (i > 0 && ti === 0) cost += 1.5;
        cost += E.rand() * 1.5;
        if (cost < bestCost) { bestCost = cost; best = m; bestPc = pc; }
      }
      used.push(bestPc);
      this.retune(vc, best, 0, now + off, VOICE_LEVEL[i] * E.rr(0.8, 1.1), fast);
      off += fast ? E.rr(0.7, 1.5) : E.rr(2.2, 4.2);
    }
    const bm = 33 + ((((K + this.chord.root - 33) % 12) + 12) % 12);
    this.retune(c.bass, bm, 12, now + (fast ? 0.5 : 2), E.rand() < st.bass ? 0.5 : 0, fast);
  }
  /** Move one voice: fade it out, change its note in the silence, fade it in. A held note just carries on. */
  retune(vc, midi, octave, t, level, fast) {
    const tc = fast ? 0.35 : 0.9, gap = fast ? 1.5 : 4;
    vc.g.cancelScheduledValues(t); vc.a.cancelScheduledValues(t); vc.b.cancelScheduledValues(t);
    if (vc.midi === midi && vc.level > 0 && level > 0) { vc.g.setTargetAtTime(level, t, 2); vc.level = level; return; }
    const silent = vc.level <= 0, at = silent ? t : t + gap;
    if (!silent) vc.g.setTargetAtTime(0, t, tc);
    vc.a.setValueAtTime(mtof(midi), at); vc.b.setValueAtTime(mtof(midi + octave), at);
    vc.g.setTargetAtTime(level, at, fast ? 0.9 : 1.7);
    vc.midi = midi; vc.level = level;
  }

  bellNote(t, st, level) {
    const E = this.E;
    let dur;
    if (this.phraseLeft <= 0) {                    // begin a phrase
      const n = st.phrase[0] + Math.floor(E.rand() * (st.phrase[1] - st.phrase[0] + 1));
      this.motifAt = E.rand() < st.motif ? 0 : -1;
      this.phraseLeft = this.motifAt === 0 ? MOTIF.length : n;
      this.beat = st.beat * E.rr(0.85, 1.2);
      // start on a note of the chord
      const ok = [];
      for (let i = 1; i <= 7; i++) if (this.chord.tones.includes(PENT[i % 5])) ok.push(i);
      this.step = ok.length ? E.pick(ok) : 4;
    }
    if (this.motifAt >= 0) { const m = MOTIF[this.motifAt++]; this.step = m[0]; dur = m[1]; }
    else {
      this.step = clamp(this.step + E.pick([-2, -1, -1, 1, 1, 2]), 0, 8);
      dur = E.pick([0.5, 1, 1, 1.5, 2]);
      if (this.phraseLeft === 1) {                 // come to rest on a chord note
        for (const d of [0, -1, 1, -2, 2]) { const s = this.step + d; if (s >= 0 && s <= 8 && this.chord.tones.includes(PENT[s % 5])) { this.step = s; break; } }
      }
    }
    const ladder = st.dark ? DARK : PENT, s = this.step;
    let midi = this.K + 12 + ladder[s % 5] + 12 * Math.floor(s / 5);
    if (st.low && E.rand() < 0.6) midi -= 12;
    const vel = E.rr(0.6, 1) * (this.phraseLeft === 1 ? 0.8 : 1);
    const v = E.voice('mBell', { bus: 'music', hall: 0.6, pan: E.rr(-0.45, 0.45), prio: 1 });
    E.bell(v, t, { f: mtof(midi), ratio: midi < 72 ? 2 : 3, index: 0.5 + 0.6 * vel, d: lerp(7, 4.5, smooth(60, 96, midi)), g: 0.06 * vel * st.bells * level });
    E.seal(v);
    this.phraseLeft--;
    this.noteNext = t + (this.phraseLeft > 0 ? dur * this.beat * E.rr(0.94, 1.06) : E.rr(st.rest[0], st.rest[1]));
  }

  pluck(t, s, level) {
    const E = this.E, tones = this.chord.tones;
    const pc = tones[(s * 2 + (s > 3 ? 1 : 0)) % tones.length];
    let midi = this.K + pc; while (midi < 62) midi += 12; if (s % 4 === 2) midi += 12;
    const v = E.voice('mPluck', { bus: 'music', hall: 0.35, pan: (s % 2 ? 0.3 : -0.3), prio: 1 });
    const lp = E.filter(v, 'lowpass', 1500, 0.8); lp.connect(v.out);
    E.tone(v, t, { type: 'pad', f: mtof(midi), a: 0.005, d: 0.6, g: 0.03 * this.pulseAmt * level * (s === 0 ? 1.2 : 0.85), dest: lp });
    E.seal(v);
  }
}
