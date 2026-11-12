// The ascent vehicle: ignition, then a roar that loses its top and its weight as the air (what
// there is of it) falls away, until there is nothing left to carry sound and orbit is silent.
import { clamp, lerp, smooth } from './dsp.js';
import { Layer } from './engine.js';

function buildRoar(E, L) {
  const out = E.gain(L, 0), wet = E.gain(L, 0.12);
  out.connect(E.bus.sfx); out.connect(wet); wet.connect(E.send.sfx.hall);
  // the body of the roar
  const brown = E.loop(L, 'brown'), hp = E.filter(L, 'highpass', 32, 0.7), lp = E.filter(L, 'lowpass', 2800, 0.6), gb = E.gain(L, 2.2);
  brown.connect(hp); hp.connect(lp); lp.connect(gb); gb.connect(out);
  // crackle: the tearing sound of a rocket plume
  const top = E.filter(L, 'lowpass', 6000, 0.6), gc = E.gain(L, 1);
  const pink = E.loop(L, 'pink'), bp = E.filter(L, 'bandpass', 900, 0.5), tr = E.gain(L, 0.7);
  pink.connect(bp); bp.connect(tr); tr.connect(top);
  E.wobble(L, tr.gain, 0.3, 1.6);
  const grit = E.loop(L, 'grit', 0.8), gbp = E.filter(L, 'bandpass', 1800, 0.7), gg = E.gain(L, 3.5);
  grit.connect(gbp); gbp.connect(gg); gg.connect(top);
  top.connect(gc); gc.connect(out);
  // what the seat feels
  const sub = E.osc(L, 'sine', 36), gs = E.gain(L, 0.3);
  sub.connect(gs); gs.connect(out);
  E.wobble(L, sub.frequency, 2.5, 0.5);
  return { level: E.ctl(out.gain, 0), cut: E.ctl(lp.frequency, 2800), top: E.ctl(top.frequency, 6000), crackle: E.ctl(gc.gain, 1) };
}

export class Launch {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.roar = new Layer(E, buildRoar);
    this.burning = false; this.lit = -1;
    this.space = 0;                    // 0 on the ground .. 1 in vacuum; the rest of the mix follows it
  }

  update(p, now) {
    const L = p.launch;
    let level = 0, thin = 0;
    if (L && L.burning) {
      if (!this.burning) { this.burning = true; this.lit = now; this.sys.play('ignition'); }
      thin = smooth(1200, 13500, L.alt || 0);
      level = 0.6 * Math.pow(1 - thin, 1.6) * lerp(0.55, 1, smooth(0, 1.6, now - this.lit));
    } else {
      this.burning = false;
      level = clamp(p.rumble || 0, 0, 1) * 0.75;                 // the old Snd.rumble() call still works
    }
    this.space = L ? smooth(2500, 14000, L.alt || 0) : 0;
    if (level > 0.002) {
      const c = this.roar.use();
      c.level.to(level, 0.25);
      c.cut.to(lerp(2800, 110, Math.pow(thin, 0.6)), 0.3);
      c.top.to(lerp(6000, 300, Math.pow(thin, 0.5)), 0.3);
      c.crackle.to(1 - smooth(0, 0.45, thin), 0.3);
    } else if (this.roar.on) { this.roar.c.level.to(0, 0.3); this.roar.rest(now, 3); }
  }
}
