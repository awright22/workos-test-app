// Every one-shot sound in the game, as a recipe: a function that builds a small graph on a
// voice from the engine's building blocks (tone, burst, bell, clank, thud).
//
//   def(name, { bus, gain, room, hall, gap, prio, atHab }, (E, v, t, o, K) => { ... })
//
//   bus    'world' = heard through the suit (dull outside, open in the Hab), 'sfx' = inside the
//          helmet or bigger than the world, 'ui' = interface
//   gap    shortest time between two plays of the same name (or `group`), in seconds
//   prio   which voices survive when too many sound at once (3 = story events, 1 = small stuff)
//   atHab  the sound happens at the Hab, so it fades with distance when the astronaut is away
//   K      MIDI note of the score's current tonic, so musical sounds are always in key
import { mtof } from './dsp.js';

export const SFX = Object.create(null);
function def(name, meta, fn) { SFX[name] = { gain: 1, gap: 0.05, prio: 2, bus: 'sfx', ...meta, fn }; }
const n = (K, semis) => mtof(K + semis);

// ---- shared gestures ---------------------------------------------------------------------
/** The interface's basic particle: a glassy tick. */
function tick(E, v, t, f, g, d = 0.03) {
  E.burst(v, t, { hp: 3200, a: 0.0005, d: 0.01, g: g * 0.45 });
  E.tone(v, t, { f, a: 0.001, d, g });
}
function keyTap(E, v, t, g = 0.03) {
  E.burst(v, t, { hp: 1800, bp: E.rr(2600, 3600), q: 1.5, a: 0.0005, d: 0.014, g });
  E.thud(v, t, { f: E.rr(190, 240), d: 0.03, g: g * 0.7 });
}
function bubble(E, v, t, g) {
  const f = E.rr(480, 1500);
  E.tone(v, t, { f, f1: f * E.rr(1.3, 1.9), glide: 0.05, a: 0.004, d: 0.075, g });
}
/** Bell notes one after another: semis[] above K, `gap` seconds apart. */
function bells(E, v, t, K, semis, gap, o = {}) {
  semis.forEach((s, i) => E.bell(v, t + i * gap, { f: n(K, s), g: o.g || 0.08, d: o.d || 2, index: o.index, ratio: o.ratio }));
}
/** A soft sustained chord on the pad wave. */
function swell(E, v, t, K, semis, o = {}) {
  for (const s of semis) {
    E.tone(v, t, { type: 'pad', f: n(K, s), cents: E.rr(-5, 5), a: o.a || 0.5, h: o.h || 0.5, d: o.d || 2, g: o.g || 0.03 });
  }
}
function crunch(E, v, t, g, f = 1000, d = 0.12) {
  E.burst(v, t, { table: 'grit', rate: E.rr(0.8, 1.3), bp: f, q: 0.8, a: 0.004, d: d * 2.2, g: g * 6 });
  E.burst(v, t, { table: 'pink', bp: f, q: 0.9, a: 0.006, d: d * 1.8, g: g * 6 });
}
function hiss(E, v, t, o) {
  return E.burst(v, t, { hp: o.hp || 2500, lp: o.lp, lp1: o.lp1, lglide: o.lglide, a: o.a || 0.01, h: o.h || 0, d: o.d || 0.3, g: o.g || 0.08 });
}
function servo(E, v, t, f0, f1, time, g) {
  const osc = E.tone(v, t, { type: 'motor', f: f0, f1, glide: time, a: 0.04, h: Math.max(0, time - 0.1), d: 0.12, g });
  E.wobble(v, osc.frequency, f0 * 0.012, 0.6, t);
}

// ---- interface: one small family built from the same tick -------------------------------------
def('uiNav',    { bus: 'ui', gap: 0.05, prio: 1, gain: 2.5 }, (E, v, t) => tick(E, v, t, 2100, 0.022, 0.02));
def('uiClick',  { bus: 'ui', gap: 0.06, prio: 1, hall: 0.05, gain: 2.8, group: 'uiPress' }, (E, v, t, o, K) => {
  tick(E, v, t, 1560, 0.045, 0.02);
  E.tone(v, t + 0.004, { f: n(K, 24), a: 0.002, d: 0.07, g: 0.04 });
});
def('uiConfirm', { bus: 'ui', gap: 0.06, prio: 1, hall: 0.08, gain: 2.2, group: 'uiPress' }, (E, v, t, o, K) => {
  tick(E, v, t, 1560, 0.03, 0.02);
  E.tone(v, t, { f: n(K, 24), a: 0.003, d: 0.11, g: 0.045 });
  E.tone(v, t + 0.07, { f: n(K, 31), a: 0.003, d: 0.16, g: 0.05 });
});
def('uiCancel', { bus: 'ui', gap: 0.06, prio: 1, hall: 0.05, gain: 2.8, group: 'uiPress' }, (E, v, t, o, K) => {
  tick(E, v, t, 1300, 0.03, 0.02);
  E.tone(v, t, { f: n(K, 24), f1: n(K, 19), glide: 0.09, a: 0.003, d: 0.14, g: 0.04 });
});
def('uiError',  { bus: 'ui', gap: 0.2, prio: 1, gain: 1.2 }, (E, v, t, o, K) => {
  for (const dt of [0, 0.09]) E.tone(v, t + dt, { type: 'hollow', f: n(K, -5), a: 0.004, h: 0.035, d: 0.05, g: 0.035 });
});
def('uiOpen',   { bus: 'ui', gap: 0.12, prio: 1, hall: 0.08, gain: 2.8 }, (E, v, t, o, K) => {
  E.burst(v, t, { bp: 1100, bp1: 3400, bglide: 0.14, q: 1.2, a: 0.04, d: 0.13, g: 0.05 });
  E.tone(v, t + 0.03, { f: n(K, 19), f1: n(K, 24), glide: 0.1, a: 0.02, d: 0.16, g: 0.022 });
});
def('uiClose',  { bus: 'ui', gap: 0.12, prio: 1, hall: 0.06, gain: 3 }, (E, v, t, o, K) => {
  E.burst(v, t, { bp: 3200, bp1: 1000, bglide: 0.13, q: 1.2, a: 0.02, d: 0.13, g: 0.045 });
  E.tone(v, t + 0.01, { f: n(K, 24), f1: n(K, 17), glide: 0.1, a: 0.01, d: 0.14, g: 0.018 });
});
def('uiType',   { bus: 'ui', gap: 0.055, prio: 0, gain: 4 }, (E, v, t) => {
  E.burst(v, t, { hp: 2200, bp: E.rr(3000, 4200), q: 2, a: 0.0005, d: 0.009, g: 0.016 });
  E.tone(v, t, { f: E.rr(1500, 1900), a: 0.0008, d: 0.012, g: 0.006 });
});
def('uiToast',  { bus: 'ui', gap: 0.5, prio: 1, hall: 0.2 }, (E, v, t, o, K) => bells(E, v, t, K, [19, 26], 0.06, { g: 0.05, d: 0.7 }));
def('click',    { bus: 'ui', gap: 0.06, prio: 1, hall: 0.05, gain: 2.8, group: 'uiPress' }, (E, v, t, o, K) => SFX.uiClick.fn(E, v, t, o, K));

// ---- small confirmations in the world -----------------------------------------------------------
def('ok', { gap: 0.1, hall: 0.12 }, (E, v, t, o, K) => bells(E, v, t, K, [24, 28], 0.075, { g: 0.075, d: 0.5, index: 0.7 }));
def('pickup', { gap: 0.08, hall: 0.1, gain: 1.5 }, (E, v, t, o, K) => {
  E.thud(v, t, { f: 420, f1: 230, glide: 0.04, d: 0.06, g: 0.1 });
  E.burst(v, t, { bp: 2600, q: 0.8, a: 0.004, d: 0.09, g: 0.05 });
  E.bell(v, t + 0.05, { f: n(K, 31), g: 0.055, d: 0.4, index: 0.6 });
});
def('bad', { gap: 0.6, hall: 0.12, prio: 3, gain: 0.8 }, (E, v, t, o, K) => {
  const lp = E.filter(v, 'lowpass', 2400, 0.7); lp.connect(v.out);
  E.tone(v, t, { type: 'tone', f: n(K, 19), a: 0.006, h: 0.12, d: 0.08, g: 0.085, dest: lp });
  E.tone(v, t + 0.19, { type: 'tone', f: n(K, 16), a: 0.006, h: 0.16, d: 0.22, g: 0.085, dest: lp });
  E.thud(v, t, { f: 120, d: 0.12, g: 0.1 });
});
def('jingle', { gap: 1.2, hall: 0.3, gain: 0.75 }, (E, v, t, o, K) => {
  bells(E, v, t, K, [19, 24, 28], 0.11, { g: 0.085, d: 1.1 });
  swell(E, v, t, K, [12, 19], { a: 0.15, h: 0.2, d: 1.2, g: 0.022 });
});
def('discovery', { gap: 2, hall: 0.5, prio: 3, gain: 0.7 }, (E, v, t, o, K) => {
  E.burst(v, t, { table: 'pink', bp: 900, bp1: 2600, bglide: 0.9, q: 1.2, a: 0.7, d: 0.6, g: 0.045 });
  swell(E, v, t, K, [0, 7, 14], { a: 0.5, h: 0.8, d: 2.6, g: 0.03 });
  bells(E, v, t + 0.35, K, [12, 16, 19, 23, 26], 0.16, { g: 0.08, d: 3 });
});
def('achievement', { gap: 2, hall: 0.4, prio: 3, gain: 0.7 }, (E, v, t, o, K) => {
  swell(E, v, t, K, [0, 4, 7], { a: 0.08, h: 0.5, d: 1.6, g: 0.028 });
  bells(E, v, t, K, [19, 24, 28, 31], 0.09, { g: 0.085, d: 1.8, index: 1.4 });
  const pent = [36, 38, 40, 43, 45, 48];
  for (let i = 0; i < 6; i++) E.tone(v, t + 0.42 + E.rr(0, 0.7), { f: n(K, E.pick(pent)), a: 0.002, d: 0.3, g: 0.014 });
});
def('questDone', { gap: 2, hall: 0.45, prio: 3, gain: 0.75 }, (E, v, t, o, K) => {
  swell(E, v, t, K, [5, 12, 16], { a: 0.2, h: 0.3, d: 1.2, g: 0.03 });           // IV
  bells(E, v, t, K, [17, 21], 0.05, { g: 0.07, d: 1.4 });
  swell(E, v, t + 0.6, K, [0, 7, 16], { a: 0.25, h: 0.8, d: 2.6, g: 0.032 });   // I
  bells(E, v, t + 0.6, K, [19, 24, 28], 0.09, { g: 0.085, d: 2.6 });
});
def('solChange', { gap: 4, hall: 0.55, prio: 3, group: 'dawn', gain: 0.8 }, (E, v, t, o, K) => {
  swell(E, v, t, K, [-12, -5, 4], { a: 1.2, h: 0.8, d: 3.2, g: 0.035 });
  bells(E, v, t + 0.5, K, [12, 19, 28], 0.48, { g: 0.07, d: 3.6, index: 0.8 });
});
def('sleep', { gap: 3, hall: 0.5 }, (E, v, t, o, K) => {
  [19, 12, 7].forEach((s, i) => E.tone(v, t + i * 0.55, { f: n(K, s), a: 0.2, h: 0.2, d: 2.2, g: 0.04 }));
  E.burst(v, t, { table: 'pink', lp: 1200, lp1: 180, lglide: 1.6, a: 0.3, d: 1.8, g: 0.04 });
});
def('wake', { gap: 4, hall: 0.4, group: 'dawn' }, (E, v, t, o, K) => bells(E, v, t, K, [12, 19], 0.22, { g: 0.05, d: 1.6, index: 0.7 }));
def('death', { gap: 5, hall: 0.55, prio: 4, gain: 0.8 }, (E, v, t, o, K) => {
  for (const [dt, g] of [[0, 0.5], [0.3, 0.32], [1.15, 0.36], [1.5, 0.2]]) E.thud(v, t + dt, { type: 'triangle', f: 64, f1: 42, d: 0.2, g });
  hiss(E, v, t + 0.2, { hp: 2500, lp: 6000, lp1: 800, lglide: 2.4, a: 0.3, d: 2.6, g: 0.035 });
  const lp = E.filter(v, 'lowpass', 900, 0.7); lp.connect(v.out);
  E.sweep(lp.frequency, t + 1.2, 900, 140, 5);
  for (const s of [-24, -17, -9]) E.tone(v, t + 1.2, { type: 'pad', f: n(K, s), cents: E.rr(-6, 6), a: 1.0, h: 1.6, d: 4.5, g: 0.085, dest: lp });
  [15, 12, 7, 3].forEach((s, i) => E.bell(v, t + 1.9 + i * 0.75, { f: n(K, s), g: 0.075, d: 4.2, index: 0.7 }));
  E.tone(v, t + 1.7, { f: 1000, a: 0.6, h: 2.2, d: 1.8, g: 0.008 });
});
def('rescued', { gap: 8, hall: 0.55, prio: 4, gain: 0.8 }, (E, v, t, o, K) => {
  swell(E, v, t, K, [-7, 5, 9, 12], { a: 0.6, h: 0.9, d: 1.6, g: 0.036 });          // IV
  swell(E, v, t + 1.7, K, [-5, 7, 11, 14], { a: 0.5, h: 0.9, d: 1.6, g: 0.036 });   // V
  swell(E, v, t + 3.4, K, [-12, 0, 7, 14, 16], { a: 0.6, h: 3.2, d: 5, g: 0.04 });  // I add9
  bells(E, v, t + 0.3, K, [17, 21, 24], 0.4, { g: 0.07, d: 2.4 });
  bells(E, v, t + 1.9, K, [19, 23, 26], 0.4, { g: 0.075, d: 2.4 });
  bells(E, v, t + 3.5, K, [24, 28, 31, 36], 0.3, { g: 0.09, d: 5.5, index: 1.3 });
  E.thud(v, t + 3.4, { f: n(K, -24), f1: n(K, -24) * 0.98, d: 3, g: 0.2, a: 0.3 });
  const pent = [36, 38, 40, 43, 45, 48];
  for (let i = 0; i < 9; i++) E.tone(v, t + 3.9 + E.rr(0, 3), { f: n(K, E.pick(pent)), a: 0.003, d: 0.45, g: 0.012 });
});

// ---- Pathfinder, NASA, the comms desk ---------------------------------------------------------------
def('pfAlive', { gap: 5, room: 0.15, hall: 0.4, prio: 4, gain: 0.9, cue: 'triumph' }, (E, v, t, o, K) => {
  E.clank(v, t, { f: 220, d: 0.2, g: 0.08 });
  E.tone(v, t, { type: 'tone', f: 70, f1: 280, glide: 1.2, a: 0.3, h: 0.7, d: 0.5, g: 0.07 });
  // the modem finding its feet: stepped tones and a breath of static
  const bp = E.filter(v, 'bandpass', 1800, 1.2); bp.connect(v.out);
  const osc = E.tone(v, t + 0.9, { type: 'hollow', f: 1200, a: 0.01, h: 0.62, d: 0.08, g: 0.04, dest: bp });
  for (let i = 0; i < 18; i++) osc.frequency.setValueAtTime(E.pick([1200, 2200, 1700, 2400, 1300]), t + 0.9 + i * 0.036);
  E.burst(v, t + 0.9, { bp: 2400, q: 1.2, a: 0.05, h: 0.5, d: 0.25, g: 0.03 });
  swell(E, v, t + 1.7, K, [-12, 0, 7, 16], { a: 0.6, h: 1.4, d: 3.2, g: 0.034 });
  bells(E, v, t + 1.75, K, [12, 19, 24, 28], 0.14, { g: 0.085, d: 3.4 });
});
def('nasaMsg', { bus: 'ui', gap: 3, hall: 0.1 }, (E, v, t, o, K) => {
  E.burst(v, t, { bp: 2600, q: 2, a: 0.01, d: 0.14, g: 0.028 });
  [24, 24, 31].forEach((s, i) => E.tone(v, t + 0.05 + i * 0.075, { type: 'tone', f: n(K, s), a: 0.004, h: 0.03, d: 0.07, g: 0.04 }));
});
def('nasaSend', { gap: 0.5, hall: 0.1, gain: 2.5 }, (E, v, t) => {
  for (let i = 0; i < 5; i++) keyTap(E, v, t + i * 0.07 + E.rr(0, 0.025), 0.03);
  E.tone(v, t + 0.42, { f: 900, f1: 2400, glide: 0.12, a: 0.005, d: 0.16, g: 0.04 });
  E.burst(v, t + 0.45, { bp: 3000, q: 1.5, a: 0.02, d: 0.3, g: 0.02 });
});
def('terminal', { gap: 0.5, hall: 0.12 }, (E, v, t, o, K) => {
  for (let i = 0; i < 9; i++) keyTap(E, v, t + i * 0.066 + E.rr(0, 0.03), 0.032);
  const pent = [24, 26, 28, 31, 33, 36];
  for (let i = 0; i < 6; i++) E.tone(v, t + 0.66 + i * 0.05, { type: 'tone', f: n(K, E.pick(pent)), a: 0.002, h: 0.02, d: 0.04, g: 0.028 });
  bells(E, v, t + 1.05, K, [24, 28], 0.075, { g: 0.06, d: 0.5, index: 0.7 });
});
def('countdown', { gap: 0.3, hall: 0.15, prio: 3 }, (E, v, t, o, K) => {
  E.tone(v, t, { type: 'tone', f: n(K, 19), a: 0.005, h: 0.13, d: 0.1, g: 0.085 });
});
def('pfPing', { gap: 0.1, hall: 0.45 }, (E, v, t) => {
  E.tone(v, t, { f: 1320, a: 0.002, d: 0.45, g: 0.045 });
  E.tone(v, t + 0.17, { f: 1320, a: 0.01, d: 0.3, g: 0.012 });
});

// ---- farming ------------------------------------------------------------------------------------------
def('dig', { bus: 'world', gap: 0.2, gain: 2.2 }, (E, v, t) => {
  E.burst(v, t, { table: 'grit', bp: 950, bp1: 420, bglide: 0.22, q: 0.9, a: 0.012, d: 0.3, g: 1.6 });
  E.burst(v, t, { table: 'pink', bp: 800, bp1: 500, bglide: 0.2, q: 0.8, a: 0.008, d: 0.24, g: 0.7 });
  E.thud(v, t, { f: 95, d: 0.13, g: 0.15 });
  E.burst(v, t + 0.42, { table: 'grit', bp: 1400, bp1: 700, bglide: 0.3, q: 0.8, a: 0.05, h: 0.1, d: 0.32, g: 1.2 });
  E.burst(v, t + 0.42, { table: 'pink', bp: 1000, q: 0.7, a: 0.04, d: 0.3, g: 0.4 });
  E.thud(v, t + 0.52, { f: 72, d: 0.12, g: 0.09 });
});
def('fillBed', { bus: 'world', gap: 0.2, gain: 1.25 }, (E, v, t) => {
  E.burst(v, t, { table: 'grit', bp: 1300, bp1: 800, bglide: 0.6, q: 0.8, a: 0.06, h: 0.35, d: 0.42, g: 1.6 });
  E.burst(v, t, { table: 'pink', bp: 520, q: 0.6, a: 0.08, h: 0.3, d: 0.36, g: 0.2 });
  for (let i = 0; i < 3; i++) E.thud(v, t + E.rr(0.1, 0.6), { f: E.rr(80, 120), d: 0.08, g: 0.1 });
});
def('plant', { bus: 'world', gap: 0.2, gain: 1.4 }, (E, v, t, o, K) => {
  E.thud(v, t, { f: 140, f1: 90, d: 0.09, g: 0.12 }); crunch(E, v, t, 0.24, 1000, 0.1);
  E.thud(v, t + 0.28, { f: 112, d: 0.09, g: 0.13 }); E.burst(v, t + 0.28, { table: 'pink', bp: 600, q: 0.8, a: 0.005, d: 0.09, g: 0.4 });
  E.thud(v, t + 0.5, { f: 104, d: 0.08, g: 0.09 }); E.burst(v, t + 0.5, { table: 'pink', bp: 600, q: 0.8, a: 0.005, d: 0.08, g: 0.28 });
  E.bell(v, t + 0.62, { f: n(K, 24), g: 0.03, d: 0.5, index: 0.5 });
});
def('water', { bus: 'world', gap: 0.2, gain: 1.5 }, (E, v, t) => {
  for (let i = 0; i < 15; i++) bubble(E, v, t + 0.05 + i * 0.055 + E.rr(0, 0.03), E.rr(0.035, 0.075));
  E.burst(v, t, { bp: 3200, q: 0.9, a: 0.08, h: 0.5, d: 0.3, g: 0.045 });
  E.burst(v, t, { table: 'pink', bp: 900, q: 1.5, a: 0.1, h: 0.45, d: 0.3, g: 0.08 });
});
def('harvest', { bus: 'world', gap: 0.2, gain: 1.5 }, (E, v, t) => {
  E.burst(v, t, { table: 'grit', bp: 1100, bp1: 600, bglide: 0.3, q: 0.8, a: 0.02, d: 0.32, g: 1.5 });
  E.burst(v, t, { table: 'pink', bp: 800, q: 0.7, a: 0.02, d: 0.26, g: 0.45 });
  for (let i = 0; i < 4; i++) {
    const tt = t + 0.3 + i * 0.13 + E.rr(0, 0.04), f = E.rr(170, 240);
    E.thud(v, tt, { f, f1: f * 0.7, d: 0.08, g: 0.15 });
    E.burst(v, tt, { table: 'pink', bp: 900, q: 1.2, a: 0.001, d: 0.04, g: 0.25 });
  }
});
def('clearBed', { bus: 'world', gap: 0.2, gain: 3.5 }, (E, v, t) => {
  for (const dt of [0, 0.15, 0.33]) E.burst(v, t + dt, { bp: E.rr(2400, 3200), q: 1, a: 0.01, d: 0.13, g: 0.09 });
  crunch(E, v, t + 0.05, 0.14, 900, 0.2); crunch(E, v, t + 0.4, 0.12, 700, 0.2);
});

// ---- work outside ------------------------------------------------------------------------------------
def('wipe', { bus: 'world', gap: 0.2, gain: 2.2 }, (E, v, t, o, K) => {
  for (let s = 0; s < 2; s++) {
    const ts = t + s * 0.42, up = s === 0;
    E.burst(v, ts, { bp: up ? 1500 : 3000, bp1: up ? 3000 : 1500, bglide: 0.3, q: 2.2, a: 0.05, h: 0.12, d: 0.2, g: 0.14 });
    E.tone(v, ts, { type: 'triangle', f: up ? 950 : 1400, f1: up ? 1500 : 1000, glide: 0.3, a: 0.04, h: 0.12, d: 0.12, g: 0.03 });
    E.burst(v, ts + 0.08, { table: 'grit', hp: 1500, a: 0.1, d: 0.3, g: 0.7 });
  }
  E.bell(v, t + 0.86, { f: n(K, 36), g: 0.03, d: 0.6, index: 0.6 });
});
def('salvage', { bus: 'world', gap: 0.3 }, (E, v, t) => {
  for (let i = 0; i < 6; i++) {
    E.burst(v, t + i * 0.05, { hp: 1500, bp: 2500, q: 3, a: 0.0005, d: 0.02, g: 0.2 });
    E.tone(v, t + i * 0.05, { f: 2400, a: 0.0005, d: 0.014, g: 0.035 });
  }
  E.clank(v, t + 0.42, { f: 520, d: 0.5, g: 0.13 });
  E.tone(v, t + 0.55, { type: 'saw', f: 180, f1: 265, glide: 0.25, a: 0.03, h: 0.16, d: 0.1, g: 0.03 });
  E.thud(v, t + 0.9, { f: 160, d: 0.09, g: 0.24 }); E.clank(v, t + 0.9, { f: 780, d: 0.32, g: 0.09 });
  servo(E, v, t + 1.0, 240, 400, 0.25, 0.035);
});
def('craft', { gap: 0.3, room: 0.2, hall: 0.12 }, (E, v, t, o, K) => {
  servo(E, v, t, 160, 420, 0.45, 0.05);
  const pent = [12, 14, 16, 19, 21, 24];
  for (let i = 0; i < 6; i++) E.tone(v, t + 0.25 + i * 0.06, { type: 'hollow', f: n(K, pent[(i * 2 + (o.seed || 0)) % 6]), a: 0.003, h: 0.02, d: 0.04, g: 0.022 });
  E.thud(v, t + 0.72, { f: 120, d: 0.11, g: 0.26 }); E.clank(v, t + 0.72, { f: 640, d: 0.36, g: 0.08 });
  bells(E, v, t + 0.9, K, [24, 31], 0.08, { g: 0.07, d: 0.9 });
});
def('deploy', { bus: 'world', gap: 0.5 }, (E, v, t, o, K) => {
  hiss(E, v, t, { hp: 2200, lp: 9000, lp1: 2000, lglide: 0.35, a: 0.005, d: 0.38, g: 0.14 });
  servo(E, v, t + 0.05, 120, 330, 0.7, 0.07);
  E.thud(v, t + 0.72, { f: 70, d: 0.2, g: 0.34 }); crunch(E, v, t + 0.72, 0.14, 800, 0.16);
  E.clank(v, t + 0.76, { f: 420, d: 0.3, g: 0.12 }); E.clank(v, t + 0.99, { f: 560, d: 0.36, g: 0.14 });
  bells(E, v, t + 1.15, K, [19, 26], 0.09, { g: 0.06, d: 0.9 });
});
def('drill', { bus: 'world', gap: 0.3, gain: 0.7 }, (E, v, t) => {
  const osc = E.tone(v, t, { type: 'motor', f: 105, f1: 132, glide: 0.2, a: 0.03, h: 0.75, d: 0.1, g: 0.13 });
  E.wobble(v, osc.frequency, 5, 0.9, t);
  E.burst(v, t, { table: 'grit', rate: 1.4, bp: 1500, q: 1, a: 0.05, h: 0.7, d: 0.12, g: 1.6 });
  E.burst(v, t, { table: 'pink', bp: 2400, q: 1.2, a: 0.05, h: 0.7, d: 0.12, g: 0.1 });
  E.burst(v, t + 0.9, { hp: 3000, a: 0.0005, d: 0.05, g: 0.32 });
  E.clank(v, t + 0.9, { f: 2100, ratios: [1, 1.47, 2.09, 2.56], d: 0.28, g: 0.08 });
  E.thud(v, t + 1.0, { f: 110, d: 0.11, g: 0.22 });
});
def('rtg', { bus: 'world', gap: 0.5, gain: 2.2 }, (E, v, t) => {
  SFX.dig.fn(E, v, t);
  for (let i = 0; i < 12; i++) E.burst(v, t + 0.5 + Math.pow(E.rand(), 0.7) * 1.4, { hp: 1200, a: 0.0003, d: 0.008, g: 0.2 });
});
def('podOpen', { bus: 'world', gap: 0.5 }, (E, v, t, o, K) => {
  for (const dt of [0, 0.16]) { E.thud(v, t + dt, { f: 200, f1: 120, d: 0.06, g: 0.22 }); E.clank(v, t + dt, { f: 900, d: 0.2, g: 0.07 }); }
  E.tone(v, t + 0.3, { type: 'saw', f: 240, f1: 330, glide: 0.35, a: 0.05, h: 0.2, d: 0.1, g: 0.022 });
  E.burst(v, t + 0.3, { bp: 1200, q: 6, a: 0.05, h: 0.2, d: 0.1, g: 0.1 });
  hiss(E, v, t + 0.3, { hp: 2000, a: 0.005, d: 0.28, g: 0.1 });
  bells(E, v, t + 0.62, K, [24, 28, 31], 0.07, { g: 0.05, d: 1 });
});
def('step', { bus: 'world', gap: 0.11, prio: 1 }, (E, v, t, o) => {
  // o.hard: the Hab floor; o.g: weight (running lands harder)
  const g = o.g || 1;
  if (o.hard) {
    E.thud(v, t, { f: E.rr(105, 125), f1: 78, glide: 0.04, d: 0.09, g: 0.07 * g });
    E.tone(v, t, { f: E.rr(290, 340), a: 0.001, d: 0.06, g: 0.09 * g });
    E.burst(v, t, { table: 'pink', bp: E.rr(900, 1300), q: 1.4, a: 0.001, d: 0.09, g: 0.8 * g });
    E.burst(v, t, { hp: 1800, bp: E.rr(2600, 3800), q: 1.2, a: 0.0006, d: 0.06, g: 0.9 * g });
    E.burst(v, t + E.rr(0.05, 0.075), { hp: 1500, lp: 5000, a: 0.001, d: 0.05, g: 0.12 * g });
  } else {
    const f = E.rr(650, 1350);
    E.thud(v, t, { f: E.rr(62, 78), f1: 45, glide: 0.05, d: 0.1, g: 0.1 * g });
    crunch(E, v, t, 0.2 * g, f, E.rr(0.09, 0.14));
    crunch(E, v, t + E.rr(0.06, 0.09), 0.1 * g, f * E.rr(1.1, 1.5), E.rr(0.07, 0.11));   // heel, then toe
  }
});
def('rustle', { gap: 0.1, prio: 0, gain: 2 }, (E, v, t, o) => {
  const g = (o.g || 1) * 0.022;
  for (let i = 0; i < 2; i++) E.burst(v, t + i * E.rr(0.04, 0.08), { table: 'pink', hp: 900, bp: E.rr(1800, 3400), q: 0.7, a: 0.03, d: E.rr(0.07, 0.13), g });
});
def('jump', { bus: 'world', gap: 0.2, prio: 1 }, (E, v, t) => {
  crunch(E, v, t, 0.22, 900, 0.14);
  E.thud(v, t, { f: 85, f1: 60, d: 0.08, g: 0.1 });
});
def('land', { bus: 'world', gap: 0.2 }, (E, v, t, o) => {
  const g = 0.5 + (o.g === undefined ? 0.6 : o.g);
  E.thud(v, t, { f: 68, f1: 36, glide: 0.09, d: 0.2, g: 0.2 * g });
  if (o.hard) { E.tone(v, t, { f: 240, a: 0.001, d: 0.09, g: 0.14 * g }); E.burst(v, t, { table: 'pink', bp: 800, q: 1.2, a: 0.001, d: 0.14, g: 1.2 * g }); E.burst(v, t, { hp: 1500, bp: 3000, q: 1, a: 0.0006, d: 0.06, g: 0.45 * g }); }
  else { crunch(E, v, t, 0.26 * g, 800, 0.18); crunch(E, v, t + 0.07, 0.13 * g, 1200, 0.12); }
});

// ---- eating, air, water-making ---------------------------------------------------------------------
def('eat', { gap: 0.3, room: 0.15, gain: 2.2 }, (E, v, t) => {
  for (const dt of [0, 0.1]) E.burst(v, t + dt, { hp: 3500, a: 0.004, d: 0.09, g: 0.06 });
  for (let i = 0; i < 3; i++) {
    const tt = t + 0.3 + i * (0.27 + E.rr(0, 0.05));
    E.burst(v, tt, { table: 'pink', bp: E.rr(700, 1100), q: 1.2, a: 0.008, d: 0.09, g: 0.24 });
    E.burst(v, tt, { table: 'grit', bp: 1800, q: 1, a: 0.003, d: 0.05, g: 1.3 });
  }
  E.thud(v, t + 1.15, { f: 180, f1: 120, glide: 0.08, d: 0.1, g: 0.09 });
});
def('candle', { gap: 0.4, hall: 0.12 }, (E, v, t, o, K) => {
  E.burst(v, t, { hp: 2000, a: 0.0005, d: 0.025, g: 0.3 });
  E.clank(v, t, { f: 1700, ratios: [1, 1.6, 2.7], d: 0.09, g: 0.06 });
  E.burst(v, t + 0.03, { table: 'grit', rate: 2.2, hp: 3000, lp: 9000, a: 0.05, h: 0.7, d: 0.9, g: 0.22 });
  E.burst(v, t + 0.03, { hp: 5000, a: 0.05, h: 0.6, d: 0.9, g: 0.045 });
  E.burst(v, t + 0.1, { table: 'pink', bp: 600, bp1: 1100, bglide: 0.8, q: 1, a: 0.3, h: 0.5, d: 0.7, g: 0.12 });
  bells(E, v, t + 0.9, K, [19, 24], 0.1, { g: 0.05, d: 0.9, index: 0.7 });
});
def('o2Refill', { gap: 0.4, hall: 0.1, gain: 1.5 }, (E, v, t, o, K) => {
  E.burst(v, t, { hp: 2500, a: 0.0005, d: 0.014, g: 0.2 }); E.thud(v, t, { f: 180, d: 0.04, g: 0.12 });
  E.burst(v, t + 0.03, { bp: 900, bp1: 2200, bglide: 0.8, q: 1.2, a: 0.1, h: 0.6, d: 0.16, g: 0.1 });
  E.tone(v, t + 0.03, { f: 300, f1: 620, glide: 0.8, a: 0.1, h: 0.6, d: 0.1, g: 0.02 });
  E.burst(v, t + 0.95, { hp: 2500, a: 0.0005, d: 0.014, g: 0.16 });
  E.bell(v, t + 0.97, { f: n(K, 24), g: 0.05, d: 0.4, index: 0.6 });
});
def('hydrazine', { bus: 'world', gap: 1, gain: 0.7 }, (E, v, t) => {
  E.thud(v, t, { f: 120, f1: 50, glide: 0.12, d: 0.22, g: 0.36 });
  E.burst(v, t, { lp: 1200, a: 0.003, d: 0.16, g: 0.26 });
  E.burst(v, t + 0.02, { bp: 700, q: 0.6, wob: 0.25, wobRate: 0.5, a: 0.12, h: 1.9, d: 0.5, g: 0.36 });
  E.burst(v, t + 0.02, { table: 'brown', hp: 50, lp: 260, wob: 0.25, wobRate: 0.35, a: 0.15, h: 1.9, d: 0.5, g: 0.3 });
  hiss(E, v, t + 0.05, { hp: 4000, a: 0.2, h: 1.7, d: 0.5, g: 0.09 });
  E.tone(v, t + 0.1, { f: 2300, f1: 2600, glide: 2, a: 0.3, h: 1.6, d: 0.4, g: 0.007 });
  for (let i = 0; i < 6; i++) bubble(E, v, t + 2.3 + i * E.rr(0.09, 0.2), 0.05);
});

// ---- things that go bang ------------------------------------------------------------------------------
function blast(E, v, t, k) {
  E.burst(v, t, { hp: 700, a: 0.0005, d: 0.06, g: 0.5 * k });
  E.burst(v, t, { table: 'pink', lp: 2600, lp1: 110, lglide: 0.55 * k + 0.2, a: 0.002, d: 0.9 * k + 0.3, g: 0.5 * k });
  E.thud(v, t, { f: 92, f1: 30, glide: 0.25, d: 0.6 * k + 0.2, g: 0.5 * k });
}
def('hydrazineBoom', { bus: 'world', gap: 0.5, room: 0.35, hall: 0.12, prio: 3, group: 'bang' }, (E, v, t) => {
  blast(E, v, t, 0.8);
  for (let i = 0; i < 6; i++) E.clank(v, t + E.rr(0.15, 1.1), { f: E.rr(900, 2400), d: E.rr(0.1, 0.3), g: E.rr(0.012, 0.035) });
});
def('boom', { bus: 'world', gap: 0.5, hall: 0.25, prio: 3, group: 'bang' }, (E, v, t) => {
  blast(E, v, t, 1.0);
  E.burst(v, t + 0.08, { table: 'grit', bp: 2400, q: 0.8, a: 0.05, d: 1.1, g: 0.9 });
});
def('breach', { bus: 'world', gap: 2, hall: 0.2, prio: 4, group: 'bang', atHab: true, gain: 0.8 }, (E, v, t) => {
  blast(E, v, t, 1.2);
  E.burst(v, t, { table: 'pink', bp: 2500, bp1: 500, bglide: 1.6, q: 0.5, a: 0.01, h: 0.3, d: 2.2, g: 0.4 });
  E.burst(v, t, { table: 'brown', hp: 40, lp: 900, lp1: 160, lglide: 1.5, a: 0.005, d: 2.0, g: 0.8 });
  let tt = t + 0.12, g = 0.3;
  for (let i = 0; i < 8; i++) {                 // the torn canvas flapping itself quiet
    E.thud(v, tt, { f: E.rr(90, 150), d: 0.07, g }); E.burst(v, tt, { lp: 700, a: 0.003, d: 0.05, g: g * 0.6 });
    tt += E.rr(0.06, 0.12) * (1 + i * 0.12); g *= 0.82;
  }
  for (let i = 0; i < 4; i++) E.clank(v, t + E.rr(0.2, 1.3), { f: E.rr(500, 1600), d: E.rr(0.15, 0.4), g: E.rr(0.02, 0.05) });
});
def('sealBreach', { bus: 'world', gap: 1, hall: 0.25, prio: 3 }, (E, v, t, o, K) => {
  for (const dt of [0, 0.5]) E.burst(v, t + dt, { table: 'grit', rate: 2, bp: 2200, bp1: 4200, bglide: 0.3, q: 1.5, a: 0.01, h: 0.2, d: 0.08, g: 1.6 });
  for (const dt of [0, 0.5]) E.burst(v, t + dt, { bp: 2000, bp1: 3800, bglide: 0.3, q: 1.5, a: 0.01, h: 0.2, d: 0.08, g: 0.06 });
  E.thud(v, t + 0.95, { f: 130, d: 0.08, g: 0.22 }); E.thud(v, t + 1.15, { f: 120, d: 0.08, g: 0.18 });
  hiss(E, v, t, { hp: 2500, lp: 9000, lp1: 1200, lglide: 1.4, a: 0.005, d: 1.7, g: 0.09 });
  E.tone(v, t + 1.0, { f: 180, f1: 320, glide: 1.2, a: 0.5, h: 0.5, d: 0.6, g: 0.03 });
  bells(E, v, t + 1.7, K, [12, 19, 24], 0.1, { g: 0.07, d: 1.6 });
});
def('suitSeal', { gap: 1, hall: 0.2, prio: 4 }, (E, v, t, o, K) => {
  E.burst(v, t, { table: 'pink', bp: 500, q: 1, a: 0.005, d: 0.13, g: 0.34 });
  E.thud(v, t, { f: 100, f1: 58, d: 0.16, g: 0.42 });
  E.burst(v, t, { table: 'grit', bp: 2400, q: 3, a: 0.01, d: 0.22, g: 1.6 });
  hiss(E, v, t, { hp: 4000, a: 0.002, h: 0.5, d: 0.06, g: 0.08 });
  E.thud(v, t + 0.6, { f: 150, d: 0.06, g: 0.26 });
  E.burst(v, t + 0.62, { table: 'pink', bp: 500, bp1: 1300, bglide: 1.2, q: 0.9, a: 0.2, h: 0.9, d: 0.6, g: 0.13 });
  E.tone(v, t + 0.62, { f: 220, f1: 440, glide: 1.3, a: 0.3, h: 0.8, d: 0.4, g: 0.03 });
  bells(E, v, t + 1.6, K, [12, 19, 28], 0.1, { g: 0.07, d: 1.7 });
});

// ---- doors, hatches, vehicles ------------------------------------------------------------------------
def('airlockIn', { gap: 1.2, room: 0.2, group: 'airlock' }, (E, v, t, o, K) => {
  E.thud(v, t, { f: 85, d: 0.15, g: 0.3 }); E.clank(v, t, { f: 310, d: 0.26, g: 0.05 });
  E.burst(v, t + 0.02, { bp: 1800, bp1: 5200, bglide: 0.5, q: 0.8, a: 0.25, h: 0.1, d: 0.25, g: 0.14 });
  servo(E, v, t + 0.02, 95, 140, 0.35, 0.035);
  E.tone(v, t + 0.56, { type: 'tone', f: n(K, 24), a: 0.004, h: 0.03, d: 0.08, g: 0.03 });
});
def('airlockOut', { gap: 1.2, room: 0.15, group: 'airlock' }, (E, v, t) => {
  servo(E, v, t, 140, 95, 0.35, 0.035);
  E.thud(v, t + 0.05, { f: 85, d: 0.15, g: 0.28 }); E.clank(v, t + 0.05, { f: 290, d: 0.24, g: 0.045 });
  E.burst(v, t + 0.06, { bp: 5000, bp1: 900, bglide: 0.6, q: 0.8, a: 0.02, h: 0.1, d: 0.5, g: 0.15 });
});
def('roverEnter', { gap: 0.8, room: 0.25 }, (E, v, t, o, K) => {
  E.thud(v, t, { f: 90, d: 0.13, g: 0.3 }); E.clank(v, t, { f: 380, d: 0.22, g: 0.06 });
  hiss(E, v, t + 0.15, { hp: 2500, a: 0.01, d: 0.32, g: 0.06 });
  E.thud(v, t + 0.25, { f: 70, d: 0.11, g: 0.2 });
  servo(E, v, t + 0.3, 60, 190, 0.6, 0.05);
  for (const [dt, s] of [[0.78, 24], [0.9, 31]]) E.tone(v, t + dt, { type: 'tone', f: n(K, s), a: 0.004, h: 0.03, d: 0.07, g: 0.04 });
});
def('roverExit', { gap: 0.8, room: 0.2 }, (E, v, t) => {
  servo(E, v, t, 190, 60, 0.5, 0.045);
  hiss(E, v, t + 0.2, { hp: 2000, a: 0.005, d: 0.32, g: 0.07 });
  E.thud(v, t + 0.3, { f: 90, d: 0.13, g: 0.28 }); E.clank(v, t + 0.3, { f: 360, d: 0.2, g: 0.05 });
  E.thud(v, t + 0.58, { f: 70, f1: 45, d: 0.11, g: 0.22 }); crunch(E, v, t + 0.58, 0.12, 900, 0.13);
});
def('roverThud', { bus: 'world', gap: 0.09, prio: 1, gain: 1.5 }, (E, v, t, o) => {
  const g = o.g || 0.5;
  E.thud(v, t, { f: E.rr(55, 80), f1: 40, d: E.rr(0.09, 0.15), g: 0.3 * g });
  E.tone(v, t, { f: E.rr(150, 210), a: 0.002, d: 0.08, g: 0.12 * g });
  E.burst(v, t, { table: 'pink', bp: 340, q: 0.8, a: 0.004, d: 0.16, g: 1.1 * g });
});
def('roverRattle', { bus: 'world', gap: 0.12, prio: 1, gain: 1.5 }, (E, v, t, o) => {
  const g = (o.g || 0.5) * 1.6, f = E.rr(1500, 2800), k = 2 + Math.floor(E.rand() * 3);
  for (let i = 0; i < k; i++) {
    E.burst(v, t + i * E.rr(0.028, 0.045), { hp: 1200, bp: f, q: 4, a: 0.0006, d: 0.045, g: g * (1 - i * 0.22) });
  }
  if (E.rand() < 0.3) E.clank(v, t, { f: E.rr(700, 1100), d: 0.12, g: g * 0.03 });
});
def('roverCreak', { bus: 'world', gap: 0.8, prio: 1 }, (E, v, t, o) => {
  const f = E.rr(260, 420);
  E.burst(v, t, { table: 'pink', bp: f, bp1: f * E.rr(1.15, 1.4), bglide: 0.22, q: 14, a: 0.04, h: 0.1, d: 0.12, g: (o.g || 0.5) * 2 });
});

// ---- weather and the launch ----------------------------------------------------------------------------
def('stormWarn', { gap: 20, hall: 0.4, prio: 3 }, (E, v, t, o, K) => {
  const a = E.tone(v, t, { f: 52, a: 1.5, h: 1.5, d: 3, g: 0.07 });
  E.wobble(v, a.frequency, 0.6, 0.3, t);
  E.tone(v, t, { type: 'triangle', f: 78, a: 2, h: 1, d: 3, g: 0.04 });
  E.burst(v, t, { table: 'pink', bp: 250, bp1: 800, bglide: 3.5, q: 6, a: 1.5, h: 1.5, d: 2.5, g: 0.5 });
  E.burst(v, t, { table: 'pink', bp: 700, bp1: 1800, bglide: 3.5, q: 1.2, a: 2, h: 1, d: 2.5, g: 0.07 });
  E.burst(v, t, { table: 'brown', hp: 45, lp: 220, a: 1, h: 2, d: 3, g: 0.24 });
  E.bell(v, t + 1.6, { f: n(K, 10), g: 0.03, d: 4, index: 0.6 }); E.bell(v, t + 1.9, { f: n(K, 13), g: 0.025, d: 4, index: 0.6 });
});
def('ignition', { gap: 3, hall: 0.3, prio: 4, gain: 0.8 }, (E, v, t) => {
  E.burst(v, t, { hp: 500, a: 0.0005, d: 0.09, g: 0.45 });
  E.thud(v, t, { f: 64, f1: 30, glide: 0.5, d: 1.6, g: 0.5 });
  E.burst(v, t, { table: 'pink', lp: 3500, lp1: 300, lglide: 1.2, a: 0.004, d: 1.6, g: 0.45 });
  E.clank(v, t + 0.05, { f: 180, d: 0.7, g: 0.14 }); E.clank(v, t + 0.22, { f: 240, d: 0.6, g: 0.1 });
});

// ---- the Hab's small noises, alarms, and work in progress (played by the continuous layers) ----
def('habRelay', { bus: 'world', gap: 0.3, prio: 0 }, (E, v, t) => {
  const k = E.rand() < 0.3 ? 2 : 1;
  for (let i = 0; i < k; i++) {
    E.thud(v, t + i * 0.09, { f: E.rr(280, 360), f1: 200, glide: 0.015, d: 0.025, g: 0.05 });
    E.burst(v, t + i * 0.09, { hp: 2000, a: 0.0004, d: 0.008, g: 0.06 });
  }
});
def('habPump', { bus: 'world', gap: 2, prio: 0, gain: 0.4 }, (E, v, t) => {
  const o = E.tone(v, t, { type: 'motor', f: 41, f1: 47, glide: 0.5, a: 0.5, h: 1.5, d: 0.9, g: 0.06 });
  E.wobble(v, o.frequency, 0.6, 0.8, t);
  E.burst(v, t, { table: 'pink', bp: 330, q: 1.2, wob: 0.3, wobRate: 1.5, a: 0.5, h: 1.4, d: 0.8, g: 0.16 });
  for (let i = 0; i < 4; i++) bubble(E, v, t + E.rr(0.6, 2.2), 0.012);
});
def('habBeep', { bus: 'world', gap: 2, prio: 0 }, (E, v, t, o, K) => {
  const k = E.pick([1, 1, 2, 3]), f = n(K, E.pick([24, 31, 36]));
  for (let i = 0; i < k; i++) E.tone(v, t + i * 0.13, { type: 'tone', f, a: 0.004, h: 0.045, d: 0.06, g: 0.018 });
});
def('habBuffet', { bus: 'world', gap: 0.35, prio: 0 }, (E, v, t) => {
  E.thud(v, t, { f: E.rr(58, 88), d: 0.16, g: 0.12 });
  E.burst(v, t, { table: 'pink', bp: E.rr(200, 380), q: 0.8, a: 0.02, d: 0.3, g: 0.55 });
  if (E.rand() < 0.4) { const f = E.rr(480, 900); E.burst(v, t + E.rr(0.05, 0.3), { table: 'pink', bp: f, bp1: f * E.rr(0.85, 1.2), bglide: 0.2, q: 14, a: 0.05, h: 0.08, d: 0.16, g: 0.5 }); }
});
def('powerDown', { bus: 'world', gap: 3, prio: 3, room: 0.2 }, (E, v, t) => {
  E.thud(v, t, { f: 200, f1: 110, d: 0.05, g: 0.22 }); E.clank(v, t, { f: 340, d: 0.25, g: 0.07 });
  servo(E, v, t + 0.05, 210, 42, 1.7, 0.07);
  E.burst(v, t + 0.05, { table: 'pink', bp: 900, bp1: 220, bglide: 1.7, q: 0.8, a: 0.05, h: 1.2, d: 0.6, g: 0.16 });
  E.thud(v, t + 1.9, { f: 80, d: 0.14, g: 0.2 });
});
def('powerUp', { bus: 'world', gap: 3, prio: 3, room: 0.2 }, (E, v, t, o, K) => {
  E.thud(v, t, { f: 200, f1: 110, d: 0.05, g: 0.22 }); E.clank(v, t, { f: 420, d: 0.25, g: 0.07 });
  servo(E, v, t + 0.08, 45, 190, 1.2, 0.06);
  E.burst(v, t + 0.08, { table: 'pink', bp: 220, bp1: 800, bglide: 1.2, q: 0.8, a: 0.2, h: 0.9, d: 0.5, g: 0.14 });
  for (const [dt, s] of [[1.35, 24], [1.5, 31]]) E.tone(v, t + dt, { type: 'tone', f: n(K, s), a: 0.004, h: 0.04, d: 0.08, g: 0.05 });
});
def('klaxon', { bus: 'world', gap: 0.8, room: 0.3, prio: 3, atHab: true, gain: 0.7 }, (E, v, t) => {
  const lp = E.filter(v, 'lowpass', 2600, 0.7); lp.connect(v.out);
  E.tone(v, t, { type: 'tone', f: 740, a: 0.012, h: 0.25, d: 0.06, g: 0.085, dest: lp });
  E.tone(v, t + 0.32, { type: 'tone', f: 554, a: 0.012, h: 0.27, d: 0.09, g: 0.085, dest: lp });
});
def('o2Warn', { gap: 0.8, prio: 3, hall: 0.05 }, (E, v, t, o) => {
  if (o.level === 2) {
    for (let i = 0; i < 3; i++) E.tone(v, t + i * 0.115, { type: 'tone', f: 1568, a: 0.004, h: 0.045, d: 0.05, g: 0.06 });
    E.tone(v, t, { f: 392, a: 0.01, h: 0.28, d: 0.1, g: 0.02 });
  } else {
    for (let i = 0; i < 2; i++) E.tone(v, t + i * 0.15, { type: 'tone', f: 1319, a: 0.005, h: 0.06, d: 0.07, g: 0.045 });
  }
});
def('work_dig', { bus: 'world', gap: 0.25, prio: 1, gain: 1.7 }, (E, v, t) => {
  E.burst(v, t, { table: 'grit', bp: E.rr(800, 1000), bp1: 480, bglide: 0.2, q: 0.9, a: 0.02, d: 0.24, g: 1.1 });
  E.burst(v, t, { table: 'pink', bp: 650, q: 0.7, a: 0.015, d: 0.18, g: 0.2 });
  E.thud(v, t, { f: E.rr(85, 105), d: 0.1, g: 0.13 });
});
def('work_wipe', { bus: 'world', gap: 0.25, prio: 1, gain: 1.5 }, (E, v, t) => {
  const up = E.rand() < 0.5, a = up ? 1500 : 2900, b = up ? 2900 : 1500;
  E.burst(v, t, { bp: a, bp1: b, bglide: 0.26, q: 2.2, a: 0.05, h: 0.1, d: 0.16, g: 0.1 });
  E.tone(v, t, { type: 'triangle', f: up ? 980 : 1380, f1: up ? 1420 : 1020, glide: 0.26, a: 0.04, h: 0.1, d: 0.1, g: 0.018 });
});
def('work_tool', { bus: 'world', gap: 0.25, prio: 1, gain: 4 }, (E, v, t) => {
  const k = 2 + Math.floor(E.rand() * 3);
  for (let i = 0; i < k; i++) {
    E.burst(v, t + i * 0.05, { hp: 1500, bp: E.rr(2200, 2800), q: 3, a: 0.0005, d: 0.02, g: 0.15 });
    E.tone(v, t + i * 0.05, { f: 2400, a: 0.0005, d: 0.012, g: 0.025 });
  }
  if (E.rand() < 0.4) E.clank(v, t + k * 0.05, { f: E.rr(450, 800), d: 0.25, g: 0.06 });
});
def('work_soft', { bus: 'world', gap: 0.25, prio: 1, gain: 1.5 }, (E, v, t) => {
  E.burst(v, t, { table: 'pink', hp: 900, bp: E.rr(1800, 3000), q: 0.7, a: 0.03, d: 0.2, g: 0.16 });
  E.thud(v, t + 0.08, { f: E.rr(105, 130), d: 0.07, g: 0.06 });
  E.burst(v, t + 0.08, { table: 'pink', bp: 600, q: 0.8, a: 0.005, d: 0.12, g: 0.3 });
});
