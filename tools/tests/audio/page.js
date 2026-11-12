// Browser side of the audio test (bundled and injected by tools/tests/audio.mjs).
// Renders named scenarios through the real audio modules in an OfflineAudioContext, feeding
// Snd.update() at about 29 Hz the way the game loop would, and measures the result.
import { createAudio, SFX, DEFAULT_PARAMS } from '../../../static/martian/src/audio/sound.js';
import { analyse, bandPower, drawSpectrogram, wavBase64 } from './analysis.js';

const SR = 48000, QUANTUM = 128, STEP = 13 * QUANTUM;       // one update every 1664 frames (34.7 ms)
const PLAY = { scene: 'play', place: 'outside', day: 1, storm: 0, o2: 1, health: 1 };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---- scenarios -----------------------------------------------------------------------------------
// { dur, from (seconds to skip when measuring), base (params), params(t), events [{t, fn(snd)}],
//   solo (mute ambience and music so a one-shot is measured alone), group }
const S = {};
const add = (name, def) => { S[name] = { name, from: 0, ...def }; };
const calm = (snd) => { snd.sys.amb.stormArmed = false; };       // no storm stinger: measure the bed alone
const noScore = (snd) => { snd.setVolume('music', 0); };

// ambience beds (score muted so the bed is measured by itself)
add('amb_calm_day',   { group: 'ambience', dur: 16, from: 4, base: { ...PLAY }, events: [{ t: 0, fn: noScore }] });
add('amb_calm_night', { group: 'ambience', dur: 16, from: 4, base: { ...PLAY, day: 0 }, events: [{ t: 0, fn: noScore }] });
add('amb_storm',      { group: 'ambience', dur: 20, from: 6, base: { ...PLAY, storm: 0.9 }, events: [{ t: 0, fn: (s) => { calm(s); noScore(s); } }] });
add('amb_hab',        { group: 'ambience', dur: 24, from: 4, base: { ...PLAY, place: 'hab' }, events: [{ t: 0, fn: noScore }] });
add('amb_hab_storm',  { group: 'ambience', dur: 20, from: 6, base: { ...PLAY, place: 'hab', storm: 0.9 }, events: [{ t: 0, fn: (s) => { calm(s); noScore(s); } }] });
add('amb_hab_nopower', { group: 'ambience', dur: 14, from: 6, base: { ...PLAY, place: 'hab', habPower: 0 }, events: [{ t: 0, fn: noScore }] });
add('amb_rover_parked', { group: 'ambience', dur: 12, from: 4, base: { ...PLAY, place: 'rover' }, events: [{ t: 0, fn: noScore }] });
add('amb_breach_inside', { group: 'ambience', dur: 14, from: 5, base: { ...PLAY, place: 'hab', breach: true }, events: [{ t: 0, fn: noScore }] });
// wind only (suit silent) for the spectral assertions
const windOnly = (s) => { calm(s); noScore(s); s.sys.suit.update = () => {}; };
add('wind_calm',      { group: 'ambience', dur: 16, from: 4, base: { ...PLAY }, events: [{ t: 0, fn: windOnly }] });
add('wind_storm',     { group: 'ambience', dur: 16, from: 6, base: { ...PLAY, storm: 0.9 }, events: [{ t: 0, fn: windOnly }] });
add('wind_storm_hab', { group: 'ambience', dur: 16, from: 6, base: { ...PLAY, storm: 0.9, place: 'hab', habAmt: 0 }, events: [{ t: 0, fn: windOnly }] });

// the suit
add('suit_rest',      { group: 'suit', dur: 14, from: 2, base: { ...PLAY }, events: [{ t: 0, fn: (s) => { noScore(s); s.sys.amb.update = () => {}; } }] });
add('suit_low_o2',    { group: 'suit', dur: 16, from: 2, base: { ...PLAY, o2: 0.18 }, events: [{ t: 0, fn: (s) => { noScore(s); s.sys.amb.update = () => {}; } }] });
add('suit_critical',  { group: 'suit', dur: 16, from: 2, base: { ...PLAY, o2: 0.04 }, events: [{ t: 0, fn: (s) => { noScore(s); s.sys.amb.update = () => {}; } }] });
add('suit_leak',      { group: 'suit', dur: 10, from: 2, base: { ...PLAY, o2: 0.4, leak: true }, events: [{ t: 0, fn: (s) => { noScore(s); s.sys.amb.update = () => {}; } }] });

// movement
const walk = (rate, run) => (t) => ({ move: 1, run, gait: t * rate, onGround: true });
add('move_walk',      { group: 'movement', dur: 9, from: 1, base: { ...PLAY }, params: walk(7, false), events: [{ t: 0, fn: noScore }] });
add('move_sprint',    { group: 'movement', dur: 9, from: 1, base: { ...PLAY }, params: walk(11, true), events: [{ t: 0, fn: noScore }] });
add('move_walk_hab',  { group: 'movement', dur: 9, from: 1, base: { ...PLAY, place: 'hab' }, params: walk(7, false), events: [{ t: 0, fn: noScore }] });
add('move_jump',      { group: 'movement', dur: 6, from: 0, base: { ...PLAY }, events: [{ t: 0, fn: noScore }],
  params: (t) => { const a = (t - 1) % 2.4, up = t > 1 && a < 1.12; return { onGround: !up, alt: up ? Math.max(0, 4.6 * a - 4.1 * a * a) : 0 }; } });
add('steps_only_regolith', { group: 'movement', dur: 5, solo: true, base: { ...PLAY }, params: walk(7, false) });
add('steps_only_hab',      { group: 'movement', dur: 5, solo: true, base: { ...PLAY, place: 'hab' }, params: walk(7, false) });
add('hold_dig',       { group: 'movement', dur: 4, solo: true, base: { ...PLAY }, params: (t) => ({ hold: t > 0.3 && t < 2.9 ? (t - 0.3) / 2.6 : 0, holdKind: 'dig' }) });

// the rover
const drive = (v, extra) => ({ group: 'rover', dur: 12, from: 3, base: { ...PLAY, place: 'rover', roverSpeed: v, throttle: 0.6, ...extra }, events: [{ t: 0, fn: noScore }] });
add('rover_5', drive(5)); add('rover_15', drive(15)); add('rover_35', drive(35, { throttle: 1 }));
add('rover_rough', drive(15, { rough: 0.8 }));
add('rover_accel', { group: 'rover', dur: 16, from: 0, base: { ...PLAY, place: 'rover' }, events: [{ t: 0, fn: noScore }],
  params: (t) => { const on = t > 1 && t < 9, v = on ? 15.3 * (1 - Math.exp(-(t - 1) * 0.92)) : t >= 9 ? 15.3 * Math.exp(-(t - 9) * 0.92) : 0; return { roverSpeed: v, throttle: on ? 1 : 0, rough: 0.2 }; } });

// events that unfold over time
add('event_breach', { group: 'event', dur: 16, base: { ...PLAY, place: 'hab' }, events: [{ t: 0, fn: noScore }, { t: 2, fn: (s) => { s.play('breach'); s.alarm(true); } }, { t: 12, fn: (s) => { s.play('sealBreach'); s.alarm(false); } }],
  params: (t) => ({ breach: t >= 2 && t < 12 }) });
add('event_breach_outside', { group: 'event', dur: 10, base: { ...PLAY, habDist: 60 }, events: [{ t: 0, fn: noScore }, { t: 2, fn: (s) => { s.play('breach'); s.alarm(true); } }], params: (t) => ({ breach: t >= 2 }) });
add('event_storm_arrives', { group: 'event', dur: 26, base: { ...PLAY }, events: [{ t: 0, fn: noScore }], params: (t) => ({ storm: Math.max(0, Math.min(0.9, (t - 2) * 0.12)) }) });
add('event_airlock', { group: 'event', dur: 9, base: { ...PLAY }, events: [{ t: 0, fn: noScore }], params: (t) => ({ place: t > 2 && t < 6 ? 'hab' : 'outside' }) });
add('event_launch', { group: 'event', dur: 52, base: { ...PLAY, scene: 'cutscene', place: 'outside' },
  events: [{ t: 2, fn: (s) => s.play('countdown') }, { t: 3, fn: (s) => s.play('countdown') }, { t: 4, fn: (s) => s.play('countdown') }, { t: 40.5, fn: (s) => s.play('rescued') }],
  params: (t) => { const lt = t - 5.2; return { scene: t >= 40.5 ? 'won' : 'cutscene', launch: { burning: lt > 0, alt: lt > 0 ? Math.min(15600, lt * lt * 14) : 0 } }; } });
add('event_pause', { group: 'event', dur: 12, base: { ...PLAY, storm: 0.5 }, events: [{ t: 0, fn: (s) => { calm(s); noScore(s); } }], params: (t) => ({ ...walk(7, false)(t), move: t < 4 || t > 8 ? 1 : 0, paused: t >= 4 && t < 8 }) });
add('event_power', { group: 'event', dur: 14, base: { ...PLAY, place: 'hab' }, events: [{ t: 0, fn: noScore }], params: (t) => ({ habPower: t > 3 && t < 9 ? 0 : 1 }) });
add('event_death', { group: 'event', dur: 14, base: { ...PLAY, o2: 0, health: 0.05 }, events: [{ t: 0, fn: noScore }, { t: 4, fn: (s) => s.play('death') }], params: (t) => ({ scene: t >= 4 ? 'dead' : 'play' }) });

// the score, one forced state at a time, plus the playlist
for (const st of ['title', 'day', 'night', 'hab', 'drive', 'danger', 'triumph', 'space']) {
  add('music_' + st, { group: 'music', dur: 70, from: 8, base: { scene: 'none' }, events: [{ t: 0, fn: (s) => s.music(st) }] });
}
add('music_sections', { group: 'music', dur: 420, from: 0, base: { ...PLAY }, events: [{ t: 0, fn: (s) => { s.setVolume('ambience', 0); s.setVolume('sfx', 0); } }] });
add('disco_hab', { group: 'music', dur: 20, from: 2, base: { ...PLAY, place: 'hab' }, events: [{ t: 0, fn: (s) => { s.setVolume('ambience', 0); s.disco(true); } }] });
add('disco_full', { group: 'music', dur: 20, from: 2, base: { scene: 'cutscene' }, events: [{ t: 0, fn: (s) => { s.setVolume('ambience', 0); s.disco(true); } }, { t: 17, fn: (s) => s.disco(false) }] });

// mixes
add('mix_walk_day', { group: 'mix', dur: 40, from: 6, base: { ...PLAY }, params: (t) => ({ ...walk(7, false)(t), move: t % 12 < 8 ? 1 : 0 }), events: [{ t: 0, fn: (s) => s.music('day') }] });
add('mix_farm_hab', { group: 'mix', dur: 30, from: 4, base: { ...PLAY, place: 'hab' }, params: (t) => ({ ...walk(7, false)(t), move: t % 6 < 2 ? 1 : 0 }),
  events: [{ t: 0, fn: (s) => s.music('hab') }, { t: 3, fn: (s) => s.play('fillBed') }, { t: 9, fn: (s) => s.play('plant') }, { t: 15, fn: (s) => s.play('water') }, { t: 21, fn: (s) => { s.play('harvest'); s.play('jingle'); } }, { t: 26, fn: (s) => s.play('eat') }] });
add('mix_storm_walk', { group: 'mix', dur: 24, from: 6, base: { ...PLAY, storm: 0.9 }, params: walk(11, true), events: [{ t: 0, fn: calm }] });
add('mix_worst_case', { group: 'mix', dur: 14, from: 0, base: { ...PLAY, place: 'hab', storm: 1, breach: true, o2: 0.03, health: 0.05 },
  params: (t) => ({ ...walk(11, true)(t), launch: { burning: t > 1, alt: 0 } }),
  events: [{ t: 0, fn: (s) => { s.disco(true); s.alarm(true); } }, { t: 1, fn: (s) => { for (const n of ['breach', 'ignition', 'discovery', 'achievement', 'rescued', 'pfAlive', 'craft']) s.play(n); } },
    { t: 3, fn: (s) => { for (const n of ['boom', 'hydrazine', 'death', 'jingle', 'salvage', 'deploy']) s.play(n); } }, { t: 3.6, fn: (s) => { for (const n of ['hydrazineBoom', 'drill', 'questDone']) s.play(n); } }] });

// ten minutes of everything in rotation: the graph must not grow
const ROTA = [
  (t) => ({ ...walk(7, false)(t) }),
  (t) => ({ ...walk(11, true)(t), storm: 0.8 }),
  (t) => ({ ...walk(7, false)(t), place: 'hab', move: t % 4 < 2 ? 1 : 0, hold: (t % 4) / 4, holdKind: 'dig' }),
  (t) => ({ place: 'rover', roverSpeed: 14, throttle: 1, rough: 0.5 }),
  (t) => ({ ...walk(7, false)(t), place: 'hab', breach: true }),
  (t) => ({ day: 0, o2: 0.07, health: 0.2 }),
];
const LONG_SFX = ['dig', 'plant', 'water', 'harvest', 'wipe', 'salvage', 'craft', 'deploy', 'eat', 'candle', 'jingle', 'discovery', 'ok', 'pickup', 'uiClick', 'uiOpen', 'boom', 'podOpen'];
add('mix_long', { group: 'mix', dur: 600, from: 0, base: { ...PLAY },
  params: (t) => ({ storm: 0, day: 1, o2: 1, health: 1, breach: false, place: 'outside', move: 0, hold: 0, roverSpeed: 0, throttle: 0, ...ROTA[Math.floor(t / 20) % ROTA.length](t) }),
  events: Array.from({ length: 85 }, (_, i) => ({ t: 3 + i * 7, fn: (s) => { s.play(LONG_SFX[i % LONG_SFX.length]); if (i % 12 === 5) s.disco(true); if (i % 12 === 8) s.disco(false); } })) });

// one scenario per one-shot recipe, alone, in the place it is normally heard
const AT_HAB = ['fillBed', 'plant', 'water', 'harvest', 'clearBed', 'hydrazine', 'hydrazineBoom', 'eat', 'breach', 'sealBreach', 'craft', 'terminal', 'nasaSend',
  'habRelay', 'habPump', 'habBeep', 'habBuffet', 'powerDown', 'powerUp', 'klaxon', 'pfAlive'];
const IN_ROVER = ['roverThud', 'roverRattle', 'roverCreak', 'roverEnter', 'roverExit'];
const VARIANTS = { step: [['step', {}], ['step_hard', { hard: true }]], land: [['land', {}], ['land_hard', { hard: true }]], o2Warn: [['o2Warn_caution', { level: 1 }], ['o2Warn_critical', { level: 2 }]] };
for (const name of Object.keys(SFX)) {
  for (const [label, opts] of VARIANTS[name] || [[name, {}]]) {
    const place = opts.hard || AT_HAB.includes(name) ? 'hab' : IN_ROVER.includes(name) ? 'rover' : 'outside';
    add('sfx_' + label, { group: SFX[name].bus === 'ui' ? 'ui' : 'sfx', sfx: name, solo: true, dur: 0, base: { ...PLAY, place, habAmt: 0 },
      events: [{ t: 0, fn: (s) => { s.sys.veh.update = () => {}; } }, { t: 0.1, fn: (s) => s.play(name, opts) }] });
  }
}

// ---- rendering -----------------------------------------------------------------------------------
/** How long a one-shot lasts, from a dry run: the end of its voice plus room for its reverb. */
function oneShotLength(name) {
  const ctx = new OfflineAudioContext(2, QUANTUM, SR), snd = createAudio(ctx, { seed: 7, offline: true });
  const v = snd.play(name, {});
  const def = SFX[name], tail = def.hall > 0.2 ? 2.6 : def.hall || def.room ? 1.2 : 0.5;
  return Math.max(0.6, (v ? v.end : 0.3) + 0.1 + tail);
}

const cache = {};
async function render(name) {
  const sc = S[name];
  if (!sc) throw new Error('no scenario ' + name);
  const dur = sc.dur || oneShotLength(sc.sfx);
  const frames = Math.ceil(dur * SR / QUANTUM) * QUANTUM;
  const ctx = new OfflineAudioContext(2, frames, SR);
  const snd = createAudio(ctx, { seed: 20260 + name.length * 131, offline: true });
  if (sc.solo) { snd.setVolume('ambience', 0); snd.setVolume('music', 0); }
  const events = (sc.events || []).slice().sort((a, b) => a.t - b.t);
  let ei = 0, maxLive = 0, maxVoices = 0;
  const live = [];
  if (window.gc) window.gc();
  const step = (t) => {
    while (ei < events.length && events[ei].t <= t + 1e-6) events[ei++].fn(snd, t);
    snd.update(sc.params ? { ...sc.base, ...sc.params(t) } : sc.base);
    const st = snd.stats();
    if (st.live > maxLive) maxLive = st.live;
    if (st.voices > maxVoices) maxVoices = st.voices;
    live.push(st.live);
  };
  step(0);
  for (let f = STEP; f < frames; f += STEP) {
    const t = f / SR;
    ctx.suspend(t).then(() => { step(t); ctx.resume(); });
  }
  const t0 = performance.now();
  const buf = await ctx.startRendering();
  const chs = [buf.getChannelData(0), buf.getChannelData(1)];
  const st = snd.stats();
  // the graph's size at the same point of the rotation early and late (for the long run)
  const at = (sec) => live[Math.min(live.length - 1, Math.round(sec * SR / STEP))];
  return (cache[name] = { name, sc, chs, dur, ms: performance.now() - t0, stats: { ...st, maxLive, maxVoices, endLive: live[live.length - 1], core: st.core, early: at(115), late: at(dur - 5) } });
}

window.AT = {
  names: () => Object.keys(S).map((n) => ({ name: n, group: S[n].group })),
  /** Render one scenario and return its measurements (the audio stays cached for wav() and sheet()). */
  async run(name) {
    const r = await render(name);
    const m = analyse(r.chs, SR, r.sc.from || 0);
    r.m = m;
    return { name, group: r.sc.group, dur: r.dur, from: r.sc.from || 0, renderMs: Math.round(r.ms), stats: r.stats, m };
  },
  band: (name, lo, hi) => bandPower(cache[name].chs, SR, lo, hi, cache[name].sc.from || 0),
  /** Measure a slice of an already rendered scenario. */
  slice: (name, from, to) => analyse(cache[name].chs, SR, from, to),
  /** The WAV of a rendered scenario as base64, in pieces of at most `size` characters (piece i). */
  wav(name, i, size) {
    const r = cache[name];
    if (!r.wav) r.wav = wavBase64(r.chs, SR);
    return r.wav.slice(i * size, (i + 1) * size);
  },
  /** A contact sheet of spectrograms for the named (already rendered) scenarios, as a PNG data URL. */
  sheet(names, cols = 3, W = 520, H = 230) {
    const rows = Math.ceil(names.length / cols), cv = document.createElement('canvas');
    cv.width = cols * W; cv.height = rows * H;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#111'; g.fillRect(0, 0, cv.width, cv.height);
    names.forEach((n, i) => {
      const r = cache[n], m = r.m;
      drawSpectrogram(g, (i % cols) * W, Math.floor(i / cols) * H, W, H, r.chs, SR, n,
        m ? `pk ${m.peakDb.toFixed(1)} dB  ${m.lufs > -150 ? m.lufs.toFixed(1) : m.momentary.toFixed(1) + 'M'} LUFS` : '');
    });
    return cv.toDataURL('image/png');
  },
  drop: (name) => { delete cache[name]; },
  /** The limiter's small-signal gain: a quiet sine through the whole chain should come out unchanged. */
  async unity() {
    const ctx = new OfflineAudioContext(2, SR, SR), snd = createAudio(ctx, { seed: 1, offline: true });
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 1000; g.gain.value = 0.01; o.connect(g); g.connect(snd.sys.E.bus.sfx); o.start();
    const buf = await ctx.startRendering(), x = buf.getChannelData(0);
    let pk = 0;
    for (let i = SR / 2; i < SR; i++) pk = Math.max(pk, Math.abs(x[i]));
    return 20 * Math.log10(pk / 0.01);
  },
  DEFAULT_PARAMS, smooth,
};
