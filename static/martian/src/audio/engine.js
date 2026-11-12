// The audio engine: one signal chain for the whole game, and the building blocks every sound
// is made from.
//
//   voices and layers ─► buses (ambience · sfx · ui · music) ─► sum ─► master volume
//                              (ambience and world pass a "hush" gain that dips while a menu is open)
//        │                   ▲                                           │
//        └─► world ─► helmet ┘ (what the astronaut hears through the suit)  ▼
//        └─► sends ─► room / hall convolution reverb ─► sum      limiter ─► soft clip ─► fade ─► out
//
// A *voice* is a short one-shot graph that frees itself; a *layer* is a small continuous graph
// (wind, the Hab, the rover) that is built when first needed and torn down after it has been
// silent for a while. Both go through the same factories, so the engine always knows how many
// nodes are alive. Nothing here reads the clock except the AudioContext's own, so the whole
// engine renders identically in an OfflineAudioContext (see tools/tests/audio.mjs).
import { clamp, dB, makeNoise, makeImpulse, softClipCurve, compressorMakeup, rng, WAVES } from './dsp.js';

const LIMITER = { threshold: -4, knee: 4, ratio: 20, attack: 0.001, release: 0.09 };
/**
 * Make-up into the limiter, in decibels. The mix is balanced with the quiet of Mars at its
 * centre, which on its own would leave a phone speaker with little to play; this lifts
 * everything and lets the limiter hold the few loud events (explosions, the launch).
 */
export const OUTPUT_TRIM_DB = 3;
const BUSES = ['ambience', 'sfx', 'ui', 'music'];
/** How the world reaches the ears: thin air and a helmet outside, a pressurised room inside. */
const PLACES = {
  outside: { cut: 2600, room: 0.0, gain: 0.85 },
  hab:     { cut: 12000, room: 0.32, gain: 1.0 },
  rover:   { cut: 4200, room: 0.10, gain: 0.9 },
};

/** A smoothed control: remembers its target so a per-frame update only touches the graph on change. */
class Ctl {
  constructor(ctx, param, v) { this.ctx = ctx; this.p = param; this.v = v; param.value = v; }
  /** Glide to `v` with time constant `tc` seconds (about 63% of the way after `tc`). */
  to(v, tc = 0.1, t) {
    // steps under half a percent are inaudible behind the glide; skipping them keeps automation light
    if (v === this.v || (v !== 0 && Math.abs(v - this.v) <= 0.004 * Math.max(Math.abs(v), Math.abs(this.v)))) return;
    this.v = v;
    this.p.setTargetAtTime(v, t === undefined ? this.ctx.currentTime : t, tc);
  }
}

/** A continuous sound that exists only while it is needed. */
export class Layer {
  /** @param {(E: Engine, L: Layer) => object} build  creates nodes with the engine factories (owner = L) and returns its controls */
  constructor(E, build) { this.E = E; this.build = build; this.nodes = []; this.srcs = []; this.c = null; this.quietAt = -1; }
  get on() { return this.c !== null; }
  /** Build if needed and return the controls. */
  use() {
    if (!this.c) this.c = this.build(this.E, this);
    this.quietAt = -1;
    return this.c;
  }
  /** Say the layer is silent now; it is released once it has stayed silent for `hold` seconds. */
  rest(now, hold = 4) {
    if (!this.c) return;
    if (this.quietAt < 0) this.quietAt = now;
    else if (now - this.quietAt > hold) this.release();
  }
  release() {
    if (!this.c) return;
    this.E.release(this);
    this.c = null; this.quietAt = -1;
  }
}

export class Engine {
  /**
   * @param {BaseAudioContext} ctx  a live AudioContext, or an OfflineAudioContext for tests
   * @param {object} [o]
   * @param {number} [o.seed]      seed for every random choice (tests pass one for repeatable renders)
   * @param {boolean} [o.offline]  true when rendering offline (builds everything synchronously)
   * @param {number} [o.maxVoices]
   */
  constructor(ctx, o = {}) {
    this.ctx = ctx;
    this.sr = ctx.sampleRate;
    this.offline = !!o.offline;
    this.rand = rng(o.seed !== undefined ? o.seed : ((Date.now() & 0x7fffffff) ^ 0x2f6e2b1));
    this.live = 0; this.made = 0;
    this.voices = [];
    this.maxVoices = o.maxVoices || 28;
    this.lastPlay = Object.create(null);
    this.place = 'outside';
    this.volume = { master: 1, music: 0.8, sfx: 1, ambience: 1 };
    this.core = { nodes: [], srcs: [] };
    this._buildTables();
    this._buildGraph();
  }
  get now() { return this.ctx.currentTime; }
  /** Random number in [a, b). */
  rr(a, b) { return a + (b - a) * this.rand(); }
  /** Pick one item of a list. */
  pick(list) { return list[Math.floor(this.rand() * list.length) % list.length]; }

  // ---- tables --------------------------------------------------------------------------
  _buildTables() {
    const c = this.ctx, sr = this.sr;
    this.buf = {};
    for (const [kind, seconds] of [['white', 2], ['pink', 4], ['brown', 5], ['grit', 3]]) {
      const b = c.createBuffer(1, Math.floor(sr * seconds), sr);
      b.getChannelData(0).set(makeNoise(kind, sr, seconds, this.rand));
      this.buf[kind] = b;
    }
    this.waves = {};
    for (const k in WAVES) {
      const h = WAVES[k], re = new Float32Array(h.length), im = new Float32Array(h);
      this.waves[k] = c.createPeriodicWave(re, im);
    }
  }
  _impulse(o) {
    const ch = makeImpulse(this.sr, o, this.rand);
    const b = this.ctx.createBuffer(2, ch[0].length, this.sr);
    b.getChannelData(0).set(ch[0]); b.getChannelData(1).set(ch[1]);
    return b;
  }

  // ---- the fixed graph ---------------------------------------------------------------
  _buildGraph() {
    const c = this.ctx, K = this.core;
    this.sum = this.gain(K, 1);
    this.master = this.gain(K, 1);
    this.hush = this.gain(K, 1);                    // the world steps back while the game is paused
    this.hush.connect(this.sum);
    this.hushCtl = new Ctl(c, this.hush.gain, 1);
    this.duck = 1;
    const comp = this.comp = this._reg(K, c.createDynamicsCompressor());
    comp.threshold.value = LIMITER.threshold; comp.knee.value = LIMITER.knee; comp.ratio.value = LIMITER.ratio;
    comp.attack.value = LIMITER.attack; comp.release.value = LIMITER.release;
    const trim = this.gain(K, 1 / compressorMakeup(LIMITER.threshold, LIMITER.knee, LIMITER.ratio));
    const clip = this._reg(K, c.createWaveShaper());
    clip.curve = softClipCurve();
    this.fade = this.gain(K, 0);
    this.sum.connect(this.master); this.master.connect(comp); comp.connect(trim); trim.connect(clip);
    clip.connect(this.fade); this.fade.connect(c.destination);
    this.masterCtl = new Ctl(c, this.master.gain, dB(OUTPUT_TRIM_DB));

    // reverbs: a small dead room (the Hab, the rover cabin) and a long soft hall (score, stingers)
    this.room = this._reg(K, c.createConvolver()); this.room.normalize = false;
    this.hall = this._reg(K, c.createConvolver()); this.hall.normalize = false;
    const roomRet = this.gain(K, 0.9), hallRet = this.gain(K, 0.8);
    this.room.connect(roomRet); roomRet.connect(this.sum);
    this.hall.connect(hallRet); hallRet.connect(this.sum);
    const fillRoom = () => {
      this.room.buffer = this._impulse({ seconds: 0.55, rt60: 0.42, predelay: 0.004, bright: 9000, dark: 1800, lowCut: 180,
        early: [[7, 0.9], [13, 0.7], [19, 0.55], [29, 0.4], [41, 0.3]] });
    };
    const fillHall = () => {
      this.hall.buffer = this._impulse({ seconds: 3.4, rt60: 3.0, predelay: 0.022, bright: 6500, dark: 900, lowCut: 200, onset: 0.03 });
    };
    // live: build the impulses just after the gesture that started audio, in two short pieces
    if (this.offline || typeof setTimeout !== 'function') { fillRoom(); fillHall(); } else { setTimeout(fillRoom, 0); setTimeout(fillHall, 40); }

    // buses, each with its own faders into the two reverbs so a volume slider also moves the wet part
    this.bus = {}; this.send = {}; this.busCtl = {};
    for (const n of BUSES) {
      const g = this.gain(K, 1), r = this.gain(K, 1), h = this.gain(K, 1);
      r.channelCount = 1; r.channelCountMode = 'explicit';
      h.channelCount = 1; h.channelCountMode = 'explicit';
      g.connect(n === 'ambience' ? this.hush : this.sum); r.connect(this.room); h.connect(this.hall);
      this.bus[n] = g; this.send[n] = { room: r, hall: h };
      this.busCtl[n] = [new Ctl(c, g.gain, 1), new Ctl(c, r.gain, 1), new Ctl(c, h.gain, 1)];
    }
    // the world as heard from inside the suit
    this.world = this.gain(K, 1);
    const helmet = this.filter(K, 'lowpass', PLACES.outside.cut, 0.6);
    const worldRoom = this.gain(K, 0);
    this.world.connect(helmet); helmet.connect(this.bus.sfx);
    helmet.connect(worldRoom); worldRoom.connect(this.send.sfx.room);
    this.helmetCut = new Ctl(c, helmet.frequency, PLACES.outside.cut);
    this.worldRoom = new Ctl(c, worldRoom.gain, 0);
    this.worldGain = new Ctl(c, this.world.gain, PLACES.outside.gain);
  }

  /** Bring the output up from silence (start-up, and coming back to a hidden tab). */
  fadeTo(v, seconds = 0.4) {
    const p = this.fade.gain, t = this.now;
    p.cancelScheduledValues(t);
    p.setTargetAtTime(v, t, Math.max(0.005, seconds / 4));
  }
  /** 'master' | 'music' | 'sfx' | 'ambience', 0..1. The interface sounds follow the sfx slider. */
  setVolume(name, v) {
    v = clamp(+v || 0, 0, 1);
    this.volume[name] = v;
    const g = v * v;                                   // a slider reads better with a squared law
    if (name === 'master') { this.masterCtl.to(g * dB(OUTPUT_TRIM_DB), 0.04); return; }
    for (const b of name === 'sfx' ? ['sfx', 'ui'] : [name]) {
      if (this.busCtl[b]) for (const c of this.busCtl[b]) c.to(g, 0.04);
    }
  }
  /** Where the astronaut's ears are: 'outside' | 'hab' | 'rover'. */
  setPlace(place) {
    if (place === this.place || !PLACES[place]) return;
    this.place = place;
    const P = PLACES[place];
    this.helmetCut.to(P.cut, 0.18); this.worldRoom.to(P.room, 0.2); this.worldGain.to(P.gain * this.duck, 0.2);
  }
  /** Pull the ambience and the world down (a menu is open) or let them back up. Interface and score are untouched. */
  setDuck(v) {
    if (v === this.duck) return;
    this.duck = v;
    this.hushCtl.to(v, 0.25); this.worldGain.to(PLACES[this.place].gain * v, 0.25);
  }

  // ---- node factories (every node is registered with an owner: the core, a layer or a voice) ----
  _reg(owner, node, src) {
    owner.nodes.push(node);
    if (src) owner.srcs.push(node);
    this.live++; this.made++;
    return node;
  }
  ctl(param, v) { return new Ctl(this.ctx, param, v); }
  gain(owner, v = 1) { const g = this.ctx.createGain(); g.gain.value = v; return this._reg(owner, g); }
  filter(owner, type, f, q = 0.707, gainDb = 0) {
    const n = this.ctx.createBiquadFilter();
    n.type = type; n.frequency.value = clamp(f, 10, this.sr * 0.45); n.Q.value = q; n.gain.value = gainDb;
    return this._reg(owner, n);
  }
  pan(owner, p = 0) {
    if (!this.ctx.createStereoPanner) return this.gain(owner, 1);
    const n = this.ctx.createStereoPanner(); n.pan.value = clamp(p, -1, 1);
    return this._reg(owner, n);
  }
  /** Oscillator; `type` is a built-in shape or one of the engine's wave tables (dsp.js WAVES). Starts at `t` (default now). */
  osc(owner, type, f, t) {
    const o = this.ctx.createOscillator();
    if (this.waves[type]) o.setPeriodicWave(this.waves[type]); else o.type = type;
    o.frequency.value = f;
    o.start(t === undefined ? 0 : t);
    return this._reg(owner, o, true);
  }
  /** Looping noise from a shared table, started at a random place so no two users line up. */
  loop(owner, table, rate = 1, t) {
    const s = this.ctx.createBufferSource(), b = this.buf[table];
    s.buffer = b; s.loop = true; s.playbackRate.value = rate;
    s.start(t === undefined ? 0 : t, this.rand() * (b.duration - 0.25));
    return this._reg(owner, s, true);
  }
  /**
   * Random wobble on a parameter (turbulence, a labouring motor): the brown table played very
   * slowly, scaled so its RMS swing is `depth` in the parameter's own units.
   */
  wobble(owner, param, depth, rate = 0.08, t) {
    const s = this.loop(owner, 'brown', rate, t), g = this.gain(owner, depth * 5);
    s.connect(g); g.connect(param);
    return g;
  }
  /** Stop and disconnect everything an owner made. */
  release(owner) {
    for (const s of owner.srcs) { try { s.stop(); } catch (e) { /* already stopped */ } }
    for (const n of owner.nodes) { try { n.disconnect(); } catch (e) { /* never connected */ } }
    this.live -= owner.nodes.length;
    owner.nodes.length = 0; owner.srcs.length = 0;
  }

  // ---- voices ----------------------------------------------------------------------------
  /**
   * Start a one-shot voice. Recipes add sources that feed `v.out`; `seal(v)` then schedules
   * every source to stop when the last envelope has died, and `reap()` frees the nodes.
   * @param {object} [o] bus ('sfx' | 'world' | 'ui' | 'music' | 'ambience'), gain, pan, room, hall, prio
   */
  voice(name, o = {}) {
    const v = { name, t: this.now, end: this.now, nodes: [], srcs: [], out: null, prio: o.prio || 1, dead: false };
    v.out = this.gain(v, o.gain === undefined ? 1 : o.gain);
    let tail = v.out;
    if (o.pan) { tail = this.pan(v, o.pan); v.out.connect(tail); }
    const world = o.bus === 'world', busName = world ? 'sfx' : (o.bus || 'sfx');
    tail.connect(o.dest || (world ? this.world : this.bus[busName]));
    if (o.hall) { const s = this.gain(v, o.hall); tail.connect(s); s.connect(this.send[busName].hall); }
    if (o.room) { const s = this.gain(v, o.room); tail.connect(s); s.connect(this.send[busName].room); }
    this.voices.push(v);
    return v;
  }
  seal(v) {
    for (const s of v.srcs) { try { s.stop(v.end + 0.03); } catch (e) { /* not started */ } }
    return v;
  }
  /** Fade a voice out quickly and let reap() collect it. */
  kill(v, fade = 0.03) {
    if (!v || v.dead || v.killed) return;
    v.killed = true;
    const t = this.now;
    v.out.gain.cancelScheduledValues(t);
    v.out.gain.setTargetAtTime(0, t, fade / 4);
    v.end = Math.min(v.end, t + fade * 1.5);
  }
  /** Free every voice that has finished. Called from update() and before each new voice. */
  reap(now = this.now) {
    const vs = this.voices;
    let j = 0;
    for (let i = 0; i < vs.length; i++) {
      const v = vs[i];
      if (now > v.end + 0.08) { this.release(v); v.dead = true; } else vs[j++] = v;
    }
    vs.length = j;
  }
  /** Make room for a new voice of priority `prio`; returns false if everything playing matters more. */
  makeRoom(prio) {
    if (this.voices.length < this.maxVoices) return true;
    if (this.voices.length >= this.maxVoices + 8) return false;
    let pick = null;
    for (const v of this.voices) {
      if (v.killed) continue;
      if (!pick || v.prio < pick.prio || (v.prio === pick.prio && v.t < pick.t)) pick = v;
    }
    if (!pick || pick.prio > prio) return false;
    this.kill(pick, 0.02);
    return true;
  }
  /** Rate limit by name: true if `name` may sound now (and records that it did). */
  allow(name, gap) {
    const t = this.now, last = this.lastPlay[name];
    if (last !== undefined && t - last < gap) return false;
    this.lastPlay[name] = t;
    return true;
  }

  // ---- recipe building blocks (v = voice, t = start time on the audio clock) ----------------
  /**
   * Envelope: silence -> g over `a`, hold `h`, then die away. The decay is exponential and
   * reaches -60 dB after `d` seconds (or a straight line to zero when `lin` is set).
   */
  env(v, t, o = {}) {
    const a = o.a === undefined ? 0.004 : o.a, h = o.h || 0, d = o.d === undefined ? 0.2 : o.d, g = o.g === undefined ? 1 : o.g;
    const n = this.gain(v, 0), p = n.gain;
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(g, t + a);
    const t1 = t + a + h;
    if (o.lin) { p.setValueAtTime(g, t1); p.linearRampToValueAtTime(0, t1 + d); } else p.setTargetAtTime(0, t1, d / 6.9);
    if (t1 + d > v.end) v.end = t1 + d;
    return n;
  }
  /** Sweep a parameter from f0 to f1 over `time` seconds, starting at t. */
  sweep(param, t, f0, f1, time) {
    param.setValueAtTime(Math.max(1e-4, f0), t);
    param.exponentialRampToValueAtTime(Math.max(1e-4, f1), t + time);
  }
  /** A pitched tone: oscillator -> envelope -> dest. Options: f, f1+glide, type, a, h, d, g, lin, dest, cents. */
  tone(v, t, o) {
    const osc = this.osc(v, o.type || 'sine', o.f, t);
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + (o.glide || o.d || 0.1));
    if (o.cents) osc.detune.value = o.cents;
    const e = this.env(v, t, o);
    osc.connect(e); e.connect(o.dest || v.out);
    return osc;
  }
  /**
   * A shaped burst of noise: table -> [highpass] -> [bandpass] -> [lowpass] -> envelope -> dest.
   * Options: table, rate, hp, bp (+ bp1/bglide sweep, q), lp (+ lp1/lglide sweep), wob (+ wobRate), a, h, d, g, lin, dest.
   */
  burst(v, t, o) {
    let n = this.loop(v, o.table || 'white', o.rate || 1, t);
    const link = (f) => { n.connect(f); n = f; };
    if (o.hp) link(this.filter(v, 'highpass', o.hp, 0.7));
    if (o.bp) {
      const f = this.filter(v, 'bandpass', o.bp, o.q || 1);
      if (o.bp1) this.sweep(f.frequency, t, o.bp, o.bp1, o.bglide || o.d || 0.2);
      link(f);
    }
    if (o.lp) {
      const f = this.filter(v, 'lowpass', o.lp, o.lq || 0.7);
      if (o.lp1) this.sweep(f.frequency, t, o.lp, o.lp1, o.lglide || o.d || 0.2);
      link(f);
    }
    if (o.wob) {                                   // turbulence: the level shivers at random
      const tr = this.gain(v, 1);
      this.wobble(v, tr.gain, o.wob, o.wobRate || 0.4, t);
      link(tr);
    }
    const e = this.env(v, t, o);
    n.connect(e); e.connect(o.dest || v.out);
    return e;
  }
  /**
   * A struck tone by frequency modulation: bright at the hammer, pure as it rings.
   * Options: f, g, d (ring time), ratio (modulator/carrier), index (brightness), bite (how fast the brightness dies), dest.
   */
  bell(v, t, o) {
    const f = o.f, ratio = o.ratio || 3, index = o.index === undefined ? 0.8 : o.index;
    const car = this.osc(v, 'sine', f, t), mod = this.osc(v, 'sine', f * ratio, t);
    const depth = this.gain(v, 0);
    depth.gain.setValueAtTime(index * f * ratio, t);
    depth.gain.setTargetAtTime(index * f * ratio * 0.04, t, o.bite || 0.12);
    mod.connect(depth); depth.connect(car.frequency);
    const e = this.env(v, t, { a: o.a === undefined ? 0.004 : o.a, d: o.d || 4, g: o.g === undefined ? 0.2 : o.g });
    car.connect(e); e.connect(o.dest || v.out);
    return e;
  }
  /** Struck metal: a handful of inharmonic partials, the high ones dying first, plus a tick of noise. */
  clank(v, t, o) {
    const ratios = o.ratios || [1, 2.32, 3.86, 5.19, 6.71], g = o.g === undefined ? 0.2 : o.g, d = o.d || 0.5;
    ratios.forEach((r, i) => {
      this.tone(v, t, { f: o.f * r * this.rr(0.992, 1.008), a: 0.001, d: d / (1 + i * 0.55), g: g / (1 + i * 0.7), dest: o.dest });
    });
    this.burst(v, t, { hp: 2500, a: 0.0005, d: 0.02, g: g * 0.9, dest: o.dest });
  }
  /** A dull thump: a sine falling in pitch. */
  thud(v, t, o) {
    return this.tone(v, t, { type: o.type || 'sine', f: o.f || 80, f1: o.f1 || (o.f || 80) * 0.55, glide: o.glide || 0.07,
      a: o.a === undefined ? 0.003 : o.a, d: o.d || 0.15, g: o.g === undefined ? 0.4 : o.g, dest: o.dest });
  }

  stats() { return { live: this.live, made: this.made, voices: this.voices.length, core: this.core.nodes.length }; }
}
