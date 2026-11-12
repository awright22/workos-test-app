// Inside the helmet: breathing that follows effort and failing air, the suit's fan, a heartbeat
// when things are critical, the low-oxygen caution tone, and the hiss of a leaking suit.
import { lerp, smooth } from './dsp.js';
import { Layer } from './engine.js';

function buildSuit(E, L) {
  const out = E.gain(L, 1), box = E.filter(L, 'peaking', 520, 1.1, 3);     // the helmet's boxy colour
  out.connect(box); box.connect(E.bus.ambience);
  const pink = E.loop(L, 'pink');
  const bp = E.filter(L, 'bandpass', 900, 1.1), lp = E.filter(L, 'lowpass', 3200, 0.7), gB = E.gain(L, 0);
  pink.connect(bp); bp.connect(lp); lp.connect(gB); gB.connect(out);
  const fbp = E.filter(L, 'bandpass', 1650, 2.2), gF = E.gain(L, 0);
  pink.connect(fbp); fbp.connect(gF); gF.connect(out);
  const ft = E.osc(L, 'sine', 311), gFt = E.gain(L, 0);
  ft.connect(gFt); gFt.connect(out);
  return { breath: gB.gain, breathF: bp.frequency, fan: E.ctl(gF.gain, 0), fanTone: E.ctl(gFt.gain, 0), level: E.ctl(out.gain, 1) };
}
function buildHeart(E, L) {
  // (the upper harmonics are let through so the beat survives on a speaker with no bass)
  const o = E.osc(L, 'hollow', 56), g = E.gain(L, 0), lp = E.filter(L, 'lowpass', 520, 0.7), out = E.gain(L, 1);
  o.connect(g); g.connect(lp); lp.connect(out); out.connect(E.bus.ambience);
  return { f: o.frequency, g: g.gain };
}
function buildLeak(E, L) {
  const white = E.loop(L, 'white'), bp = E.filter(L, 'bandpass', 6200, 2.5), tr = E.gain(L, 1), out = E.gain(L, 0);
  white.connect(bp); bp.connect(tr); tr.connect(out); out.connect(E.bus.ambience);
  E.wobble(L, tr.gain, 0.2, 0.5);
  return { level: E.ctl(out.gain, 0) };
}

export class Suit {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.suit = new Layer(E, buildSuit);
    this.heart = new Layer(E, buildHeart);
    this.leak = new Layer(E, buildLeak);
    this.ex = 0;                       // exertion 0..~1.4: rises fast, recovers slowly
    this.nextBreath = -1; this.nextBeat = -1;
    this.warnNext = -1; this.warnSince = -1; this.warnLevel = 0;
  }

  update(p, now, dt) {
    const E = this.E, sys = this.sys;
    const suited = (p.scene === 'play' || p.scene === 'cutscene') && !p.sleeping;
    const k = (tc) => 1 - Math.exp(-dt / tc);

    // ---- exertion ----
    const air = smooth(0.3, 0.05, p.o2), hurt = smooth(0.4, 0.1, p.health);
    let want = 0;
    if (p.place !== 'rover') {
      want = p.move * (p.run ? 0.9 : 0.3);
      if (!p.onGround) want = Math.max(want, 0.5);
      if (p.hold > 0) want = Math.max(want, 0.3);
    }
    if (p.scene === 'cutscene') want = 0.3;                        // strapped to a rocket
    want = want + 0.5 * air + 0.25 * hurt + (p.leak ? 0.25 : 0);
    this.ex += (want - this.ex) * k(want > this.ex ? 4.5 : 11);

    // ---- breath and fan ----
    if (suited) {
      const c = this.suit.use(), ex = this.ex;
      const inside = p.place === 'outside' ? 1 : 0.75;
      c.level.to(1, 0.3);
      c.fan.to(0.06 * inside, 0.5); c.fanTone.to(0.0012 * inside, 0.5);
      if (this.nextBreath < now - 1) this.nextBreath = now + 0.3;
      if (now + 0.15 >= this.nextBreath) {
        const P = 60 / (12.5 + 25 * Math.min(ex, 1.35)), T0 = Math.max(this.nextBreath, now + 0.02);
        const A = (0.05 + 0.45 * Math.pow(ex, 1.25)) * inside * E.rr(0.86, 1.1);
        const tin = P * 0.36, tout = P * 0.46, Te = T0 + tin + P * 0.06;
        const gasp = 1 + air * 0.5;                                 // short of air: sharper, brighter in-breaths
        c.breathF.setTargetAtTime(880, T0 - 0.015, 0.012);
        c.breathF.setTargetAtTime(1450 * gasp, T0, tin * 0.4);
        c.breath.setTargetAtTime(A * 0.8, T0, tin * 0.22 / gasp);
        c.breath.setTargetAtTime(0, T0 + tin * 0.62, tin * 0.14);
        c.breathF.setTargetAtTime(1020, Te - 0.02, 0.015);
        c.breathF.setTargetAtTime(540, Te + 0.04, tout * 0.35);
        c.breath.setTargetAtTime(A, Te, tout * 0.12);
        c.breath.setTargetAtTime(0, Te + tout * 0.42, tout * 0.2);
        this.nextBreath = T0 + P * E.rr(0.95, 1.07);
      }
    } else if (this.suit.on) {
      const c = this.suit.c;
      c.level.to(0, 0.4);
      this.suit.rest(now, 3);
    }

    // ---- heartbeat: fades in as oxygen or health run out ----
    const stress = p.scene === 'play' && !p.sleeping ? Math.max(smooth(0.24, 0.06, p.o2), smooth(0.34, 0.1, p.health)) : 0;
    if (stress > 0.02) {
      const c = this.heart.use();
      if (this.nextBeat < now - 1) this.nextBeat = now + 0.1;
      if (now + 0.12 >= this.nextBeat) {
        const P = 60 / (62 + 76 * stress), T = Math.max(this.nextBeat, now + 0.02), A = 0.13 * Math.pow(stress, 0.8);
        const T2 = T + Math.min(0.3, P * 0.36);
        c.f.setValueAtTime(68, T); c.f.exponentialRampToValueAtTime(45, T + 0.09);
        c.g.setTargetAtTime(A, T, 0.006); c.g.setTargetAtTime(0, T + 0.035, 0.035);
        c.f.setValueAtTime(80, T2); c.f.exponentialRampToValueAtTime(52, T2 + 0.07);
        c.g.setTargetAtTime(A * 0.62, T2, 0.006); c.g.setTargetAtTime(0, T2 + 0.03, 0.03);
        this.nextBeat = T + P;
      }
    } else this.heart.rest(now, 2.5);

    // ---- low-oxygen caution: two soft beeps, three urgent ones when critical ----
    const level = p.scene === 'play' && !p.sleeping ? (p.o2 < 0.1 ? 2 : p.o2 < 0.25 ? 1 : 0) : 0;
    if (level > 0) {
      if (level !== this.warnLevel) { this.warnSince = now; this.warnNext = now + 0.2; }
      if (now >= this.warnNext) {
        const tired = lerp(1, 0.6, smooth(14, 45, now - this.warnSince));   // do not nag at full strength for ever
        sys.play('o2Warn', { level, gain: tired });
        this.warnNext = now + (level === 2 ? 1.7 : 4.6);
      }
    }
    this.warnLevel = level;

    // ---- a leaking suit (the cold open) ----
    if (p.leak && suited) this.leak.use().level.to(0.05, 0.2);
    else if (this.leak.on) { this.leak.c.level.to(0, 0.08); this.leak.rest(now, 1.5); }
  }
}
