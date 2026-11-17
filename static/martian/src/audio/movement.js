// The astronaut's body: footsteps timed from the walk cycle, jumps and landings, the rustle
// of the suit, and the sound of work while an action is being held.
import { clamp, smooth } from './dsp.js';
import { Layer } from './engine.js';

// A step sounds when a boot comes down: the game counts his footfalls from his feet as they are drawn (see
// updateAstronaut in game/player.js), and this plays one sound for each. It keeps no time of its own.
/** Seconds between two "work" sounds for each kind of held action. */
const WORK_EVERY = { dig: 0.5, wipe: 0.42, tool: 0.46, soft: 0.55 };

function buildHold(E, L) {
  // a faint tone that climbs while an action charges, so the hand knows how long is left
  const o = E.osc(L, 'sine', 220), g = E.gain(L, 0);
  o.connect(g); g.connect(E.bus.ui);
  return { f: E.ctl(o.frequency, 220), g: E.ctl(g.gain, 0) };
}

export class Movement {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.lastSteps = null; this.side = 1;
    this.wasGround = true; this.peak = 0;
    this.hold = new Layer(E, buildHold);
    this.workNext = -1;
  }

  update(p, now) {
    const E = this.E, sys = this.sys;
    const afoot = p.scene === 'play' && p.place !== 'rover' && !p.sleeping;
    const hard = p.place === 'hab';

    // ---- footsteps ----
    if (afoot && p.onGround && this.lastSteps !== null && p.steps !== this.lastSteps) {
      this.side = p.stepSide || -this.side;
      const weight = (p.run ? 1.25 : 0.85) * (0.7 + 0.3 * p.move) * E.rr(0.88, 1.12);
      sys.play('step', { hard, g: weight, pan: this.side * 0.14 });
      if (E.rand() < (p.run ? 0.85 : 0.5)) sys.play('rustle', { g: p.run ? 1.6 : 1, delay: p.run ? 0.14 : 0.22, pan: -this.side * 0.25 });
    }
    this.lastSteps = p.steps;

    // ---- leaving the ground and coming back ----
    if (afoot) {
      if (this.wasGround && !p.onGround) { sys.play('jump'); sys.play('rustle', { g: 1.8 }); this.peak = 0; }
      if (!p.onGround) this.peak = Math.max(this.peak, p.alt || 0);
      if (!this.wasGround && p.onGround) sys.play('land', { hard, g: clamp(this.peak / 1.3, 0.15, 1.2) });
    }
    this.wasGround = p.onGround;

    // ---- work in progress ----
    const holding = afoot && p.hold > 0.001;
    if (holding) {
      const c = this.hold.use(), h = clamp(p.hold, 0, 1);
      c.f.to(220 * Math.pow(2, h), 0.05);
      c.g.to(0.007 * smooth(0, 0.12, h) * (1 - smooth(0.9, 1, h)), 0.05);
      const every = WORK_EVERY[p.holdKind];
      if (every) {
        if (this.workNext < 0) this.workNext = now + 0.06;
        if (now >= this.workNext) {
          sys.play('work_' + p.holdKind, { pan: E.rr(-0.15, 0.15) });
          this.workNext = now + every * E.rr(0.9, 1.15);
        }
      }
    } else {
      this.workNext = -1;
      if (this.hold.on) { this.hold.c.g.to(0, 0.03); this.hold.rest(now, 1); }
    }
  }
}
