// Stranded II audio. Everything is synthesised in the browser with the Web Audio API: there
// are no audio files, only a few noise tables and two reverb impulses computed at start-up.
//
//   Snd.init()                 create the context (call from a user gesture; safe to repeat)
//   Snd.update(params)         once a frame: where the astronaut is and what is happening
//   Snd.play(name, opts)       a one-shot from sfx.js ('dig', 'wipe', 'breach', 'uiConfirm' ...)
//   Snd.setVolume(bus, 0..1)   'master' | 'music' | 'sfx' | 'ambience' (the caller stores the values)
//   Snd.alarm(on) / Snd.disco(on) / Snd.rumble(level) and the first version's short names
//   (click, ok, pickup, craft, jingle, discovery, bad, boom, beep, wind) still work.
//
// Layout:  engine.js   signal chain, voices, layers, building blocks
//          ambience.js wind, storm, Hab, breach        suit.js     breath, fan, heartbeat, O2 warning
//          movement.js footsteps, jumps, work          vehicle.js  the rover
//          launch.js   the ascent                      music.js    the score      disco.js  the playlist
//          sfx.js      every one-shot recipe           driver.js   reads the game state each frame
//          settings.js saved volumes                   controls.js volume sliders for a menu
//
// Nothing in this file or the ones it imports touches the game; driver.js is the only bridge.
// That keeps the whole system renderable in an OfflineAudioContext (tools/tests/audio.mjs).
import { clamp, mtof } from './dsp.js';
import { Engine } from './engine.js';
import { SFX } from './sfx.js';
import { Ambience } from './ambience.js';
import { Suit } from './suit.js';
import { Movement } from './movement.js';
import { Vehicle } from './vehicle.js';
import { Launch } from './launch.js';
import { Music } from './music.js';
import { Disco } from './disco.js';

/** What update() knows about the game. Callers pass only the fields that changed. */
export const DEFAULT_PARAMS = {
  scene: 'none',        // none | title | play | cutscene | dead | won
  place: 'outside',     // outside | hab | rover
  sleeping: false,
  paused: false,        // a menu or screen is open over the game
  storm: 0,             // 0..1 dust storm where the astronaut is
  day: 1,               // 0 night .. 1 full daylight
  move: 0,              // 0..1 walking input
  run: false, onGround: true,
  gait: 0,              // walk-cycle phase in radians (player.bob)
  alt: 0,               // metres above the ground (jumps)
  roverSpeed: 0,        // m/s, signed
  throttle: 0,          // -1..1
  rough: 0,             // 0..1 how rough the ground under the rover is
  o2: 1, health: 1,     // suit oxygen and vitals as fractions
  habPower: 1,          // 1 when the Hab has power
  habAmt: 1,            // 1 in the Hab, less in a small greenhouse dome
  habDist: 0,           // metres to the Hab (how loud its alarm is from outside)
  breach: false,        // the Hab is open to Mars
  leak: false,          // the suit is leaking (the cold open)
  hold: 0,              // 0..1 progress of a held action
  holdKind: null,       // dig | wipe | tool | soft | null
  launch: null,         // { burning, alt } during the ascent
  space: 0,             // derived: 0 on the ground .. 1 in vacuum
  disco: false, alarm: false, rumble: 0,
};

class AudioSystem {
  constructor(ctx, o) {
    const E = this.E = new Engine(ctx, o);
    this.p = { ...DEFAULT_PARAMS };
    this.amb = new Ambience(E, this);
    this.suit = new Suit(E, this);
    this.move = new Movement(E, this);
    this.veh = new Vehicle(E, this);
    this.launch = new Launch(E, this);
    this.music = new Music(E, this);
    this.disco = new Disco(E, this);
    this.last = E.now; this.lastSlow = -1;
    this.updates = 0; this.cpu = 0;
  }
  running() { return this.E.offline || this.E.ctx.state === 'running'; }
  /** 0..1: how much of a sound made at the Hab reaches the astronaut. */
  habNear(p) {
    if (p.place === 'hab') return 1;
    const d = Math.max(p.habDist || 0, 14);
    return Math.pow(14 / d, 1.3) * (p.place === 'rover' ? 0.3 : 0.6);
  }

  update(params) {
    if (params) Object.assign(this.p, params);
    if (!this.running()) return;
    const E = this.E, p = this.p, now = E.now;
    E.reap(now);
    E.setPlace(p.scene === 'play' || p.scene === 'dead' ? p.place : 'outside');
    E.setDuck(p.paused && p.scene === 'play' ? 0.35 : 1);
    this.move.update(p, now);                       // edges (footsteps, jumps) are checked every call
    // the continuous layers are steered about 30 times a second of audio time, however often we are called
    if (now - this.lastSlow < 0.03) return;
    const dt = this.lastSlow < 0 ? 0.03 : Math.min(0.25, now - this.lastSlow);
    this.lastSlow = now;
    this.launch.update(p, now);
    p.space = this.launch.space;
    this.amb.update(p, now, dt);
    this.suit.update(p, now, dt);
    this.veh.update(p, now, dt);
    if (E.volume.music > 0.001) { this.music.update(p, now, dt); this.disco.update(p, now); } else { this.music.hush(now); this.disco.hush(now); }
    this.updates++;
  }

  play(name, o = {}) {
    const def = SFX[name], E = this.E;
    if (!def || !this.running()) return null;
    if (!E.allow(def.group || name, def.gap)) return null;
    E.reap();
    if (!E.makeRoom(def.prio)) return null;
    let gain = def.gain * (o.gain === undefined ? 1 : o.gain);
    if (def.atHab) gain *= this.habNear(this.p);
    const v = E.voice(name, { bus: def.bus, gain, pan: o.pan, hall: def.hall, room: def.room, prio: def.prio });
    def.fn(E, v, E.now + 0.005 + (o.delay || 0), o, this.music.key());
    E.seal(v);
    if (def.cue) this.music.cue(def.cue);
    return v;
  }

  /** A short sample on one bus, so a volume slider can be judged by ear. */
  audition(bus) {
    const E = this.E;
    if (!this.running() || !E.allow('audition', 0.12)) return;
    if (bus === 'music') {
      const v = E.voice('audition', { bus: 'music', hall: 0.4, prio: 1 });
      E.bell(v, E.now + 0.005, { f: mtof(this.music.key() + 19), g: 0.09, d: 1.4 });
      E.seal(v);
    } else if (bus === 'ambience') {
      const v = E.voice('audition', { bus: 'ambience', prio: 1 });
      E.burst(v, E.now + 0.005, { table: 'pink', bp: 420, q: 0.8, a: 0.15, h: 0.1, d: 0.7, g: 0.3 });
      E.seal(v);
    } else this.play('uiConfirm');
  }

  /** The first version's beep(freq, seconds, shape, level), kept for old callers. */
  beep(freq, dur, type, vol) {
    const E = this.E;
    if (!this.running() || !E.allow('beep', 0.02) || !E.makeRoom(1)) return;
    const v = E.voice('beep', { bus: 'ui', hall: 0.05, prio: 1 });
    const shape = type === 'square' ? 'hollow' : type === 'sawtooth' ? 'saw' : (type || 'sine');
    E.tone(v, E.now + 0.005, { type: shape, f: freq, a: 0.004, d: Math.max(0.03, dur || 0.15), g: (vol || 0.18) * 0.5 });
    E.seal(v);
  }
}

/** Audio must never take the game down with it: any error inside is counted, reported once and swallowed. */
function guard(snd, fn) {
  try { return fn(); } catch (e) {
    snd.errors++;
    if (!snd._warned && typeof console !== 'undefined') { snd._warned = true; console.warn('Audio error (sound carries on where it can):', e); }
    return null;
  }
}

function makeSnd() {
  return {
    sys: null, ctx: null,
    vol: { master: 1, music: 0.8, sfx: 1, ambience: 1 },     // the score ships a little under full, so the slider has room to go up
    errors: 0, _warned: false, _watching: false, _hidden: false, _driven: false, _disco: false, _alarm: false,

    /**
     * Create the audio system. With no argument it opens a live AudioContext (browsers only
     * allow that from a user gesture); tests pass an OfflineAudioContext and a seed.
     * Does nothing, quietly, where Web Audio is missing.
     */
    init(ctx, opts = {}) {
      if (this.sys) return this;
      try {
        if (!ctx) {
          const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
          if (!AC) return this;
          try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
        }
        const offline = opts.offline !== undefined ? opts.offline
          : (typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext);
        this.ctx = ctx;
        this.sys = new AudioSystem(ctx, { ...opts, offline });
        for (const k in this.vol) this.sys.E.setVolume(k, this.vol[k]);
        if (this._disco) { this.sys.disco.set(true); this.sys.p.disco = true; }
        if (this._alarm) this.sys.p.alarm = true;
        this.sys.E.fadeTo(1, offline ? 0.01 : 0.5);
        if (!offline) this._watchPage();
      } catch (e) {
        this.sys = null; this.ctx = null; this.errors++;
        if (typeof console !== 'undefined') console.warn('Audio is unavailable:', e);
      }
      return this;
    },
    /** Wake a suspended context (iOS suspends it until a touch, and again after an interruption). */
    resume() {
      try {
        if (this.ctx && this.ctx.state !== 'running' && this.ctx.resume && !this._hidden) {
          const r = this.ctx.resume();
          if (r && r.catch) r.catch(() => {});
        }
      } catch (e) { /* not allowed yet */ }
    },
    /** Silence and suspend when the tab is hidden; come back gently when it returns. */
    _watchPage() {
      if (this._watching || typeof document === 'undefined') return;
      this._watching = true;
      const change = () => {
        if (!this.sys) return;
        const hidden = document.visibilityState === 'hidden';
        if (hidden === this._hidden) return;
        this._hidden = hidden;
        if (hidden) {
          this.sys.E.fadeTo(0, 0.12);
          setTimeout(() => { if (this._hidden && this.ctx && this.ctx.suspend) this.ctx.suspend().catch(() => {}); }, 350);
        } else {
          this.resume();
          this.sys.E.fadeTo(1, 0.5);
        }
      };
      document.addEventListener('visibilitychange', change);
      window.addEventListener('pagehide', change);
      window.addEventListener('pageshow', change);
    },

    /** Per-frame state from the game (see DEFAULT_PARAMS). */
    update(params) { this._driven = true; if (this.sys) guard(this, () => this.sys.update(params)); },
    /** Play a named one-shot. opts: gain, pan (-1..1), delay (seconds), plus what the recipe reads. */
    play(name, opts) { return this.sys ? guard(this, () => this.sys.play(name, opts)) : null; },
    /** A short sample on a bus ('master' | 'music' | 'sfx' | 'ambience') for a volume slider. */
    audition(bus) { if (this.sys) guard(this, () => this.sys.audition(bus)); },
    has(name) { return !!SFX[name]; },
    /** bus: 'master' | 'music' | 'sfx' | 'ambience'; v: 0..1. Takes effect at once and is remembered across init(). */
    setVolume(bus, v) {
      if (!(bus in this.vol)) return;
      this.vol[bus] = clamp(+v || 0, 0, 1);
      if (this.sys) guard(this, () => this.sys.E.setVolume(bus, this.vol[bus]));
    },
    getVolume(bus) { return this.vol[bus]; },
    /** Force a score state ('day', 'night', 'hab', 'drive', 'danger', 'triumph', 'title', 'space', 'silence'), or null. */
    music(state) { if (this.sys) guard(this, () => this.sys.music.force(state)); },
    /** Counters for the soak test: live nodes, voices, nodes ever made, updates run. */
    stats() {
      if (!this.sys) return { live: 0, made: 0, voices: 0, core: 0, updates: 0, state: 'off', errors: this.errors };
      return { ...this.sys.E.stats(), updates: this.sys.updates, state: this.ctx.state, music: this.sys.music.state, errors: this.errors };
    },

    // ---- the first version's interface -----------------------------------------------------
    /** Wind is driven from update() now; this only matters to a caller that never calls update(). */
    wind(level) {
      if (this.sys && !this._driven) guard(this, () => this.sys.update({ scene: 'play', storm: clamp((level - 0.16) / 0.65, 0, 1) }));
    },
    rumble(level) { if (this.sys) this.sys.p.rumble = clamp(+level || 0, 0, 1); },
    beep(freq, dur, type, vol) { if (this.sys) guard(this, () => this.sys.beep(freq, dur, type, vol)); },
    click() { this.play('click'); },
    ok() { this.play('ok'); },
    pickup() { this.play('pickup'); },
    craft() { this.play('craft'); },
    jingle() { this.play('jingle'); },
    discovery() { this.play('discovery'); },
    bad() { this.play('bad'); },
    boom() { this.play('boom'); },
    alarm(on) { if (this.sys) this.sys.p.alarm = !!on; this._alarm = !!on; },
    disco(on) { this._disco = !!on; if (this.sys) { this.sys.disco.set(on); this.sys.p.disco = !!on; } },
  };
}

/** The game's audio. */
export const Snd = makeSnd();
/** A separate instance on a given context (tests render scenarios through these). */
export function createAudio(ctx, opts) { return makeSnd().init(ctx, opts); }
export { SFX };
