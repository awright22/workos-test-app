// The rover: an electric drivetrain whose pitch follows speed and whose strain follows the
// throttle, wheels crunching over regolith, the cabin's own hush, and the knocks and rattles
// of the suspension on rough ground.
import { clamp, smooth } from './dsp.js';
import { Layer } from './engine.js';

function buildRover(E, L) {
  const out = E.gain(L, 0);
  out.connect(E.world);                          // the cabin's tone and reverb come from the engine's "rover" place
  // drivetrain: a harmonic-rich motor note through a filter that opens under load
  const m = E.osc(L, 'motor', 58), mlp = E.filter(L, 'lowpass', 400, 1.3), gm = E.gain(L, 0);
  m.connect(mlp); mlp.connect(gm); gm.connect(out);
  E.wobble(L, m.frequency, 0.5, 0.7);
  // inverter whine a little over two octaves up
  const wh = E.osc(L, 'sine', 236), gw = E.gain(L, 0);
  wh.connect(gw); gw.connect(out);
  // wheels: grit that gets denser and brighter with speed
  const grit = E.loop(L, 'grit', 0.5), cbp = E.filter(L, 'bandpass', 700, 0.7), gc = E.gain(L, 0);
  grit.connect(cbp); cbp.connect(gc); gc.connect(out);
  // road rumble and the still-air hush of the cabin
  const pink = E.loop(L, 'pink'), rlp = E.filter(L, 'lowpass', 300, 0.6), gr = E.gain(L, 0);
  pink.connect(rlp); rlp.connect(gr); gr.connect(out);
  const hum = E.osc(L, 'tone', 47), gh = E.gain(L, 0);
  hum.connect(gh); gh.connect(out);
  return {
    level: E.ctl(out.gain, 0),
    motorF: E.ctl(m.frequency, 58), motorCut: E.ctl(mlp.frequency, 400), motor: E.ctl(gm.gain, 0),
    whineF: E.ctl(wh.frequency, 236), whine: E.ctl(gw.gain, 0),
    crunch: E.ctl(gc.gain, 0), crunchF: E.ctl(cbp.frequency, 700), crunchRate: E.ctl(grit.playbackRate, 0.5),
    rumble: E.ctl(gr.gain, 0), rumbleCut: E.ctl(rlp.frequency, 300), hum: E.ctl(gh.gain, 0),
  };
}

export class Vehicle {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.rover = new Layer(E, buildRover);
    this.load = 0;
  }

  update(p, now, dt) {
    const E = this.E, sys = this.sys;
    const driving = p.scene === 'play' && p.place === 'rover' && !p.sleeping;
    if (!driving) {
      if (this.rover.on) { this.rover.c.level.to(0, 0.15); this.rover.rest(now, 2); }
      return;
    }
    const c = this.rover.use();
    const v = Math.abs(p.roverSpeed), sp = 1 - Math.exp(-v / 18);         // 0..1, flattening at high speed
    const want = clamp(Math.abs(p.throttle), 0, 1);
    this.load += (want - this.load) * (1 - Math.exp(-dt / 0.18));
    const load = this.load, f = 58 + 300 * sp + 9 * load;
    const awake = smooth(0, 0.8, v + load * 2);
    c.level.to(0.32, 0.2);
    c.motorF.to(f, 0.09); c.motorCut.to(f * (2.4 + 3 * load + 2 * sp), 0.12);
    c.motor.to((0.035 + 0.1 * sp + 0.09 * load * (0.45 + sp)) * awake, 0.1);
    c.whineF.to(f * 4.07, 0.09); c.whine.to((0.004 + 0.014 * sp) * (0.5 + load) * awake, 0.12);
    c.crunch.to(2.4 * smooth(0.3, 10, v), 0.12); c.crunchF.to(520 + 900 * sp, 0.2); c.crunchRate.to(0.35 + 1.4 * sp, 0.2);
    c.rumble.to(0.3 + 0.75 * sp, 0.2); c.rumbleCut.to(240 + 260 * sp, 0.3);
    c.hum.to(0.04, 0.3);
    // suspension: the rougher the ground and the faster the rover, the more it knocks
    const rough = clamp(p.rough || 0, 0, 1);
    const rate = (0.25 + 4.5 * rough) * smooth(1.5, 14, v);
    if (E.rand() < rate * dt) {
      const g = 0.35 + 0.65 * rough * E.rr(0.6, 1), r = E.rand(), pan = E.rr(-0.5, 0.5);
      if (r < 0.58) sys.play('roverThud', { g, pan });
      else if (r < 0.94) sys.play('roverRattle', { g, pan });
      else sys.play('roverCreak', { g, pan });
    }
  }
}
