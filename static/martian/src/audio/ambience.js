// The air around the astronaut: Mars wind and dust storms, the Hab's machinery, the scream of
// a breach and its klaxon. Each is a small continuous layer steered every frame from the game
// state; the layers that are not needed are not running.
//
// Mars wind is modelled on the Perseverance microphone recordings: because the air is so thin
// almost everything sits below a few hundred hertz, a soft low rumble that swells in gusts. A
// storm lifts and brightens it, adds a howl (a narrow moving resonance) and the hiss of grit
// on the visor. Inside the Hab only the lowest part gets through the canvas.
import { clamp, lerp, smooth } from './dsp.js';
import { Layer } from './engine.js';

/** How much of each wind component reaches the ears in each place. */
const HEAR = {
  outside: { low: 1.0, mid: 1.0, howl: 1.0, grit: 1.0, cut: 4000, gritCut: 9000 },
  hab:     { low: 0.22, mid: 0.012, howl: 0.04, grit: 0.0, cut: 125, gritCut: 2000 },
  breach:  { low: 0.7, mid: 0.4, howl: 0.5, grit: 0.0, cut: 600, gritCut: 2000 },
  rover:   { low: 0.45, mid: 0.12, howl: 0.2, grit: 0.3, cut: 330, gritCut: 3000 },
};

function buildWind(E, L) {
  const out = E.gain(L, 1); out.connect(E.bus.ambience);
  // low body: mono, band-limited so no energy is wasted below what a speaker can move
  const brown = E.loop(L, 'brown'), hp = E.filter(L, 'highpass', 42, 0.6), lp = E.filter(L, 'lowpass', 220, 0.5), gLow = E.gain(L, 0);
  brown.connect(hp); hp.connect(lp); lp.connect(gLow); gLow.connect(out);
  // the whisper that rides the gusts, one side each for width (and what a phone speaker can play)
  const p1 = E.loop(L, 'pink', 1.0), p2 = E.loop(L, 'pink', 0.91);
  const b1 = E.filter(L, 'bandpass', 480, 0.8), b2 = E.filter(L, 'bandpass', 610, 0.8);
  const g1 = E.gain(L, 0), g2 = E.gain(L, 0), pn1 = E.pan(L, -0.6), pn2 = E.pan(L, 0.6);
  p1.connect(b1); b1.connect(g1); g1.connect(pn1); pn1.connect(out);
  p2.connect(b2); b2.connect(g2); g2.connect(pn2); pn2.connect(out);
  // storm howl: two narrow resonances that wander
  const h1 = E.filter(L, 'bandpass', 420, 9), h2 = E.filter(L, 'bandpass', 560, 11), gh1 = E.gain(L, 0), gh2 = E.gain(L, 0);
  p1.connect(h1); h1.connect(gh1); gh1.connect(pn1);
  p2.connect(h2); h2.connect(gh2); gh2.connect(pn2);
  // grit on the visor: a fine hiss of dust with single grains ticking through it
  const grit = E.loop(L, 'grit', 1.6), ghp = E.filter(L, 'highpass', 2600, 0.7), glp = E.filter(L, 'lowpass', 9000, 0.7), gg = E.gain(L, 0);
  const gt = E.gain(L, 0.3), gs = E.gain(L, 0.5);
  grit.connect(gt); gt.connect(ghp); p2.connect(gs); gs.connect(ghp); ghp.connect(glp); glp.connect(gg); gg.connect(out);
  return {
    low: E.ctl(gLow.gain, 0), lowCut: E.ctl(lp.frequency, 220),
    mid1: E.ctl(g1.gain, 0), mid2: E.ctl(g2.gain, 0), midF1: E.ctl(b1.frequency, 480), midF2: E.ctl(b2.frequency, 610),
    howl1: E.ctl(gh1.gain, 0), howl2: E.ctl(gh2.gain, 0), howlF1: E.ctl(h1.frequency, 420), howlF2: E.ctl(h2.frequency, 560),
    grit: E.ctl(gg.gain, 0), gritCut: E.ctl(glp.frequency, 9000),
  };
}

function buildHab(E, L) {
  const out = E.gain(L, 1), wet = E.gain(L, 0.22);
  out.connect(E.bus.ambience); out.connect(wet); wet.connect(E.send.ambience.room);
  // life support: mains hum with a slow beat between its harmonics
  const gHum = E.gain(L, 0);
  for (const [type, f, g] of [['sine', 59, 1], ['sine', 118.6, 0.5], ['triangle', 177.4, 0.2], ['sine', 236.9, 0.08]]) {
    const o = E.osc(L, type, f), k = E.gain(L, g);
    o.connect(k); k.connect(gHum);
  }
  gHum.connect(out);
  // air handler: a broad hush with the blades' note inside it, and the hiss of the vents
  const pink = E.loop(L, 'pink'), fan = E.filter(L, 'bandpass', 430, 0.7), gFan = E.gain(L, 0);
  pink.connect(fan); fan.connect(gFan); gFan.connect(out);
  const blade = E.osc(L, 'tone', 147), gBlade = E.gain(L, 0);
  blade.connect(gBlade); gBlade.connect(out);
  const white = E.loop(L, 'white'), vent = E.filter(L, 'bandpass', 3000, 0.6), gVent = E.gain(L, 0);
  white.connect(vent); vent.connect(gVent); gVent.connect(out);
  return {
    hum: E.ctl(gHum.gain, 0), fan: E.ctl(gFan.gain, 0), fanF: E.ctl(fan.frequency, 430),
    blade: E.ctl(gBlade.gain, 0), bladeF: E.ctl(blade.frequency, 147), vent: E.ctl(gVent.gain, 0),
  };
}

function buildHiss(E, L) {
  // air leaving through a tear: a whistle inside a rush, shivering
  const out = E.gain(L, 0), tr = E.gain(L, 1);
  const white = E.loop(L, 'white');
  const bp = E.filter(L, 'bandpass', 3400, 5), g1 = E.gain(L, 1.3), hp = E.filter(L, 'highpass', 5200, 0.7), g2 = E.gain(L, 0.13);
  const body = E.filter(L, 'bandpass', 900, 0.8), g3 = E.gain(L, 0.25);
  white.connect(bp); bp.connect(g1); g1.connect(tr);
  white.connect(hp); hp.connect(g2); g2.connect(tr);
  white.connect(body); body.connect(g3); g3.connect(tr);
  E.wobble(L, tr.gain, 0.22, 0.7);
  E.wobble(L, bp.frequency, 260, 0.25);
  tr.connect(out); out.connect(E.world);
  return { level: E.ctl(out.gain, 0) };
}

export class Ambience {
  constructor(E, sys) {
    this.E = E; this.sys = sys;
    this.wind = new Layer(E, buildWind);
    this.hab = new Layer(E, buildHab);
    this.hiss = new Layer(E, buildHiss);
    this.gust = 1; this.gustTarget = 1; this.gustTc = 1; this.gustNext = 0;
    this.howlGust = 0.6; this.howlNext = 0; this.hf1 = 420; this.hf2 = 560;
    this.hear = { ...HEAR.outside };
    this.power = 1;                       // smoothed "the Hab has power" (fans spin down when it dies)
    this.nextRelay = -1; this.nextPump = -1; this.nextBeep = -1;
    this.alarmNext = -1; this.alarmSince = -1;
    this.stormArmed = true;
    this.lastPlace = null; this.powered = null;
  }

  update(p, now, dt) {
    const E = this.E, sys = this.sys;
    const playing = p.scene === 'play';
    const alive = playing || p.scene === 'dead';
    const k = (tc) => 1 - Math.exp(-dt / tc);

    // ---- the airlock: crossing between the Hab and the outside ----
    if (this.lastPlace !== null && playing && !p.sleeping && p.place !== this.lastPlace) {
      if (p.place === 'hab' && this.lastPlace === 'outside') sys.play('airlockIn');
      else if (p.place === 'outside' && this.lastPlace === 'hab') sys.play('airlockOut');
    }
    this.lastPlace = playing ? p.place : null;

    // ---- wind ----
    const breachIn = p.breach && p.place === 'hab';
    const H = breachIn ? HEAR.breach : (HEAR[p.place] || HEAR.outside);
    const kh = k(0.3);
    for (const key in H) this.hear[key] += (H[key] - this.hear[key]) * kh;
    if (now >= this.gustNext) {
      const wild = 0.35 + p.storm * 0.25;
      this.gustTarget = clamp(1 + (E.rand() * 2 - 1) * wild * 1.6, 0.4, 1.7);
      this.gustTc = E.rr(0.5, 1.8); this.gustNext = now + E.rr(1.2, 4.6) * (1 - p.storm * 0.4);
    }
    this.gust += (this.gustTarget - this.gust) * k(this.gustTc);
    if (now >= this.howlNext) {
      this.hf1 = E.rr(300, 620); this.hf2 = E.rr(430, 780); this.howlGust = E.rr(0.15, 1.3);
      this.howlNext = now + E.rr(1.4, 4);
    }
    let scene = 0;
    if (alive) scene = p.sleeping ? 0.3 : 1;
    else if (p.scene === 'title') scene = 0.55;
    else if (p.scene === 'cutscene' || p.scene === 'won') scene = 1 - clamp(p.space || 0, 0, 1);
    const calm = lerp(0.04, 0.17, p.day);
    const w = clamp(calm + Math.pow(p.storm, 0.85) * 0.6, 0, 0.8) * this.gust;
    if (scene * w > 0.002) {
      const c = this.wind.use(), h = this.hear;
      const st = smooth(0.3, 0.9, p.storm), g = this.gust;
      c.low.to(0.42 * w * h.low * scene, 0.25);
      c.lowCut.to(Math.min(h.cut, 170 + 820 * Math.pow(w, 1.4)), 0.3);
      const mid = 0.52 * Math.pow(w, 1.3) * g * h.mid * scene;
      c.mid1.to(mid, 0.3); c.mid2.to(mid * 0.9, 0.34);
      c.midF1.to(420 + 520 * w, 0.5); c.midF2.to(540 + 600 * w, 0.6);
      c.howl1.to(1.2 * st * this.howlGust * h.howl * scene, 0.7); c.howl2.to(1.0 * st * (1.4 - this.howlGust) * h.howl * scene, 0.8);
      c.howlF1.to(this.hf1, 1.1); c.howlF2.to(this.hf2, 1.3);
      c.grit.to(0.3 * smooth(0.22, 0.85, p.storm) * (0.45 + 0.6 * g) * h.grit * scene, 0.2);
      c.gritCut.to(h.gritCut, 0.3);
    } else if (this.wind.on) {
      const c = this.wind.c;
      c.low.to(0, 0.3); c.mid1.to(0, 0.3); c.mid2.to(0, 0.3); c.howl1.to(0, 0.3); c.howl2.to(0, 0.3); c.grit.to(0, 0.2);
      this.wind.rest(now);
    }
    if (playing && !p.sleeping && p.place !== 'hab') {
      if (this.stormArmed && p.storm > 0.24) { this.stormArmed = false; sys.play('stormWarn'); }
    }
    if (p.storm < 0.08) this.stormArmed = true;

    // ---- the Hab ----
    const inHab = alive && p.place === 'hab' ? clamp(p.habAmt === undefined ? 1 : p.habAmt, 0, 1) * (p.sleeping ? 0.4 : 1) : 0;
    this.power += ((p.habPower > 0.5 ? 1 : 0) - this.power) * k(1.4);
    if (inHab > 0.01) {
      const c = this.hab.use(), pw = this.power;
      c.hum.to(0.014 * inHab * pw, 0.4);
      c.fan.to(0.16 * inHab * pw, 0.4); c.fanF.to(200 + 230 * pw, 0.5);
      c.blade.to(0.006 * inHab * pw, 0.4); c.bladeF.to(60 + 87 * pw, 0.5);
      c.vent.to(0.045 * inHab * pw, 0.4);
      if (playing && !p.sleeping && pw > 0.6) {
        if (this.nextRelay < 0) { this.nextRelay = now + E.rr(3, 12); this.nextPump = now + E.rr(4, 14); this.nextBeep = now + E.rr(8, 30); }
        if (now >= this.nextRelay) { sys.play('habRelay', { pan: E.rr(-0.7, 0.7), gain: inHab }); this.nextRelay = now + E.rr(5, 26); }
        if (now >= this.nextPump) { sys.play('habPump', { pan: E.rr(-0.5, 0.5), gain: inHab }); this.nextPump = now + E.rr(11, 26); }
        if (now >= this.nextBeep) { sys.play('habBeep', { pan: E.rr(-0.6, 0.6), gain: inHab }); this.nextBeep = now + E.rr(14, 55); }
      }
      // a storm leans on the canvas: thumps and creaks in the gusts
      if (playing && !p.sleeping && p.storm > 0.3 && E.rand() < 0.45 * p.storm * this.gust * this.gust * dt) {
        sys.play('habBuffet', { pan: E.rr(-0.8, 0.8), gain: inHab * clamp(p.storm * this.gust, 0.3, 1.3) });
      }
    } else if (this.hab.on) {
      const c = this.hab.c;
      c.hum.to(0, 0.25); c.fan.to(0, 0.25); c.blade.to(0, 0.25); c.vent.to(0, 0.25);
      this.hab.rest(now);
      this.nextRelay = -1;
    }

    // ---- breach: the rush of air, and the klaxon ----
    const near = sys.habNear(p);
    const powered = p.habPower > 0.5;
    if (this.powered !== null && powered !== this.powered && playing && near > 0.25) sys.play(powered ? 'powerUp' : 'powerDown', { gain: near });
    this.powered = playing ? powered : null;
    const breach = alive && p.breach ? near : 0;
    if (breach > 0.003) this.hiss.use().level.to(0.4 * breach, 0.25);
    else if (this.hiss.on) { this.hiss.c.level.to(0, 0.3); this.hiss.rest(now); }
    const alarm = playing && (p.breach || p.alarm) && !p.sleeping;
    if (alarm) {
      if (this.alarmSince < 0) { this.alarmSince = now; this.alarmNext = now + 0.25; }
      if (now + 0.05 >= this.alarmNext) {
        // a klaxon that never lets up stops being heard: ease it back after the first shock
        const tired = lerp(1, 0.5, smooth(12, 40, now - this.alarmSince));
        sys.play('klaxon', { gain: tired * (p.place === 'hab' ? 1 : 0.55) });
        this.alarmNext += 1.3;
        if (this.alarmNext < now) this.alarmNext = now + 1.3;
      }
    } else this.alarmSince = -1;
  }
}
