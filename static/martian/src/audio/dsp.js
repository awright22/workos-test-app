// Pure signal helpers for the audio engine: random numbers, noise tables, reverb impulses,
// the output soft-clip curve and a little music arithmetic. No Web Audio objects in here, so
// everything can be computed once at start-up (a few tens of milliseconds) and unit-tested.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/** Decibels to linear gain. */
export const dB = (d) => Math.pow(10, d / 20);
/** MIDI note number to frequency in hertz. */
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Small fast seeded generator (mulberry32). Returns a function giving [0, 1). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalise(x, rms) {
  let mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i];
  mean /= x.length;
  let s = 0;
  for (let i = 0; i < x.length; i++) { x[i] -= mean; s += x[i] * x[i]; }
  const k = rms / Math.sqrt(s / x.length || 1);
  for (let i = 0; i < x.length; i++) x[i] = clamp(x[i] * k, -1, 1);
  return x;
}

/** Make a table loop without a seam: the extra `fade` samples at the end are blended into the start. */
function seamless(x, n, fade) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = x[i];
  for (let i = 0; i < fade; i++) {
    const th = (i / fade) * Math.PI * 0.5;
    out[i] = x[i] * Math.sin(th) + x[n + i] * Math.cos(th);
  }
  return out;
}

/**
 * Looping noise tables, all with a known level so mix gains mean the same thing whatever the
 * seed:  white (flat), pink (-3 dB/octave), brown (-6 dB/octave, wind and rumble) at RMS 0.2,
 * and grit (sparse random ticks: sand on a visor, gravel under a wheel) at RMS 0.06, which
 * leaves its tallest ticks just under full scale.
 */
export const NOISE_RMS = 0.2, GRIT_RMS = 0.06;
export function makeNoise(kind, sr, seconds, rand) {
  const n = Math.floor(sr * seconds), fade = Math.floor(sr * 0.08), m = n + fade;
  const x = new Float32Array(m);
  if (kind === 'white') {
    for (let i = 0; i < m; i++) x[i] = rand() * 2 - 1;
  } else if (kind === 'pink') {
    // Paul Kellet's filter bank
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < m; i++) {
      const w = rand() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
      x[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
      b6 = w * 0.115926;
    }
  } else if (kind === 'brown') {
    // leaky integrator, then a gentle 20 Hz high-pass so the table carries no slow drift
    let y = 0, hp = 0, prev = 0;
    const leak = 1 - 12 / sr * Math.PI * 2, k = 1 - 20 / sr * Math.PI * 2;
    for (let i = 0; i < m; i++) {
      y = y * leak + (rand() * 2 - 1) * 0.05;
      hp = k * (hp + y - prev); prev = y;
      x[i] = hp;
    }
  } else if (kind === 'grit') {
    // velvet noise: about 900 ticks a second with uneven strength, each a two-sample blip
    const density = 900 / sr;
    for (let i = 0; i < m - 1; i++) {
      if (rand() < density) {
        const a = Math.pow(rand(), 2.2) * (rand() < 0.5 ? -1 : 1);
        x[i] += a; x[i + 1] -= a * 0.55;
      }
    }
  }
  return normalise(seamless(x, n, fade), kind === 'grit' ? GRIT_RMS : NOISE_RMS);
}

/**
 * A stereo reverb impulse response made from decaying noise whose top end dies first, with a
 * few early reflections. Each channel is scaled to unit energy, so a send of 1.0 returns about
 * the level that went in and the wet gains in the engine read as plain ratios.
 * @returns {Float32Array[]} two channels
 */
export function makeImpulse(sr, o, rand) {
  const n = Math.floor(sr * o.seconds), pre = Math.floor(sr * (o.predelay || 0));
  const out = [new Float32Array(n), new Float32Array(n)];
  for (let c = 0; c < 2; c++) {
    const x = out[c];
    let lp = 0, hp = 0, prev = 0;
    const hk = 1 - (o.lowCut || 120) / sr * Math.PI * 2;
    const onset = Math.max(1, Math.floor(sr * (o.onset || 0.004)));
    for (let i = pre; i < n; i++) {
      const t = (i - pre) / sr;
      const fc = o.bright * Math.pow(o.dark / o.bright, Math.min(1, t / o.seconds));
      const a = 1 - Math.exp(-2 * Math.PI * fc / sr);
      lp += a * ((rand() * 2 - 1) - lp);
      hp = hk * (hp + lp - prev); prev = lp;
      const fadeIn = Math.min(1, (i - pre) / onset);
      x[i] = hp * Math.exp(-6.91 * t / o.rt60) * fadeIn;
    }
    for (const [ms, g] of (o.early || [])) {
      const i = pre + Math.floor(sr * (ms + c * 1.7 + rand() * 1.2) / 1000);
      if (i < n) x[i] += g * (rand() < 0.5 ? -1 : 1) * 0.05;
    }
    // fade the last 5% so the tail never ends on a step
    const tail = Math.floor(n * 0.05);
    for (let i = 0; i < tail; i++) x[n - 1 - i] *= i / tail;
    let e = 0;
    for (let i = 0; i < n; i++) e += x[i] * x[i];
    const k = 1 / Math.sqrt(e || 1);
    for (let i = 0; i < n; i++) x[i] *= k;
  }
  return out;
}

/**
 * Output safety curve for a WaveShaper: exactly linear up to `knee`, then bending smoothly so
 * the output can never exceed `ceil` however hot the input is. The limiter in front of it does
 * the real work; this only guarantees the last fraction of a decibel.
 */
export function softClipCurve(knee = 0.75, ceil = 0.97, n = 4097) {
  const c = new Float32Array(n), span = ceil - knee;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1, ax = Math.abs(x);
    const y = ax <= knee ? ax : knee + span * Math.tanh((ax - knee) / span);
    c[i] = Math.sign(x) * y;
  }
  return c;
}

/** Harmonic amplitudes for the oscillator shapes the engine uses (index 0 is unused DC). */
export const WAVES = {
  // warm string-like pad: steep roll-off, even harmonics held back
  pad: [0, 1, 0.30, 0.34, 0.11, 0.14, 0.05, 0.07, 0.025, 0.035, 0.012, 0.018],
  // electric motor: strong low harmonics with a bump where the gear mesh sits
  motor: [0, 1, 0.55, 0.30, 0.22, 0.10, 0.16, 0.05, 0.09, 0.03, 0.02, 0.05, 0.02],
  // soft reed for alarms and suit tones: a sine with a little 2nd and 3rd
  tone: [0, 1, 0.22, 0.10, 0.03],
  // disco strings / brass: a saw with the top shaved
  saw: [0, 1, 0.5, 0.333, 0.25, 0.2, 0.16, 0.13, 0.1, 0.08, 0.06, 0.045, 0.03, 0.02, 0.012],
  // hollow square-ish for the bass and the leads
  hollow: [0, 1, 0, 0.36, 0, 0.2, 0, 0.11, 0, 0.06, 0, 0.03],
};

// ---- music arithmetic -------------------------------------------------------------------
export const SCALES = {
  major:      [0, 2, 4, 5, 7, 9, 11],
  lydian:     [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  aeolian:    [0, 2, 3, 5, 7, 8, 10],
  phrygian:   [0, 1, 3, 5, 7, 8, 10],
  pentMajor:  [0, 2, 4, 7, 9],
  pentMinor:  [0, 3, 5, 7, 10],
};
/** Scale degree (may be negative or above the octave) to semitones above the root. */
export function degree(scale, d) {
  const n = scale.length, o = Math.floor(d / n);
  return scale[((d % n) + n) % n] + 12 * o;
}

/**
 * The make-up gain a Web Audio DynamicsCompressorNode adds on its own. The node boosts
 * everything by a fixed amount that depends only on threshold, knee and ratio (the algorithm
 * all three browser engines share), so the engine divides it back out to keep quiet signals at
 * unity through the limiter.
 */
export function compressorMakeup(thresholdDb, kneeDb, ratio) {
  const lin = (d) => Math.pow(10, d / 20), db = (x) => 20 * Math.log10(x);
  const thr = lin(thresholdDb), kneeEndDb = thresholdDb + kneeDb, kneeEnd = lin(kneeEndDb), slope = 1 / ratio;
  const kneeCurve = (x, k) => (x < thr ? x : thr + (1 - Math.exp(-k * (x - thr))) / k);
  const slopeAt = (x, k) => {
    if (x < thr) return 1;
    const x2 = x * 1.001;
    return (db(kneeCurve(x2, k)) - db(kneeCurve(x, k))) / (db(x2) - db(x));
  };
  let lo = 0.1, hi = 10000, k = 5;
  for (let i = 0; i < 15; i++) { if (slopeAt(kneeEnd, k) < slope) hi = k; else lo = k; k = Math.sqrt(lo * hi); }
  const yKneeDb = db(kneeCurve(kneeEnd, k));
  const full = 1 < kneeEnd ? kneeCurve(1, k) : lin(yKneeDb + slope * (0 - kneeEndDb));
  return Math.pow(1 / full, 0.6);
}
