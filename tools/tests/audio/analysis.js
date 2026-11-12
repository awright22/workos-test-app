// Measurements on rendered audio, run in the browser page by tools/tests/audio.mjs.
// Everything works on Float32Array channels at a known sample rate.

const dbfs = (x) => (x > 0 ? 20 * Math.log10(x) : -200);

/** In-place radix-2 FFT of a real signal; returns the power spectrum (n/2 bins). */
function powerSpectrum(re) {
  const n = re.length, im = new Float64Array(n);
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  const out = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) out[i] = re[i] * re[i] + im[i] * im[i];
  return out;
}

const HANN = {};
function hann(n) {
  if (!HANN[n]) { const w = new Float64Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); HANN[n] = w; }
  return HANN[n];
}

/** Average power spectrum (Welch) of a mono signal. */
export function welch(x, n = 8192) {
  const w = hann(n), acc = new Float64Array(n / 2), buf = new Float64Array(n);
  let count = 0;
  for (let s = 0; s + n <= x.length; s += n / 2) {
    for (let i = 0; i < n; i++) buf[i] = x[s + i] * w[i];
    const p = powerSpectrum(buf);
    for (let i = 0; i < n / 2; i++) acc[i] += p[i];
    count++;
  }
  if (!count) {                       // shorter than one window: zero-pad
    buf.fill(0);
    for (let i = 0; i < x.length; i++) buf[i] = x[i];
    return powerSpectrum(buf);
  }
  for (let i = 0; i < n / 2; i++) acc[i] /= count;
  return acc;
}

/** K-weighting (ITU-R BS.1770) for 48 kHz, applied to a copy. */
function kWeight(x) {
  const y = new Float32Array(x.length);
  const s1 = [1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585];
  const s2 = [1.0, -2.0, 1.0, -1.99004745483398, 0.99007225036621];
  let a1 = 0, a2 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i] - s1[3] * a1 - s1[4] * a2;
    const o = s1[0] * v + s1[1] * a1 + s1[2] * a2; a2 = a1; a1 = v;
    const u = o - s2[3] * b1 - s2[4] * b2;
    y[i] = s2[0] * u + s2[1] * b1 + s2[2] * b2; b2 = b1; b1 = u;
  }
  return y;
}

/**
 * Loudness after BS.1770: gated integrated loudness and the loudest 400 ms ("momentary max").
 * Short sounds are padded to one block, so their figure is the loudness of the 400 ms holding them.
 */
export function loudness(chs, sr) {
  const k = chs.map(kWeight), block = Math.round(sr * 0.4), hop = Math.round(sr * 0.1);
  const n = Math.max(k[0].length, block), ms = [];
  for (let s = 0; s + block <= n; s += hop) {
    let sum = 0;
    for (const c of k) { let a = 0; const e = Math.min(s + block, c.length); for (let i = s; i < e; i++) a += c[i] * c[i]; sum += a / block; }
    ms.push(sum);
  }
  const lk = (z) => -0.691 + 10 * Math.log10(z || 1e-20);
  const abs = ms.filter((z) => lk(z) > -70);
  let integrated = -200, momentary = -200;
  if (ms.length) momentary = lk(Math.max(...ms));
  if (abs.length) {
    const rel = lk(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
    const g = abs.filter((z) => lk(z) > rel);
    if (g.length) integrated = lk(g.reduce((a, b) => a + b, 0) / g.length);
  }
  return { integrated, momentary };
}

export const BANDS = [[20, 60], [60, 150], [150, 400], [400, 1000], [1000, 2500], [2500, 6000], [6000, 20000]];

/**
 * Everything the assertions and the loudness table need for one render.
 * @param {Float32Array[]} chs  channels
 * @param {number} from  first second to measure (skips fade-ins)
 */
export function analyse(chs, sr, from = 0, to = Infinity) {
  const a = Math.floor(from * sr), b = Math.min(chs[0].length, Math.floor(to * sr));
  const cut = chs.map((c) => c.subarray(a, b)), n = cut[0].length;
  let peak = 0, sq = 0, dc = 0, jump = 0, nan = 0, first = -1, last = -1;
  const mono = new Float32Array(n);
  for (const c of cut) {
    let prev = c[0] || 0, m = 0;
    for (let i = 0; i < n; i++) {
      const v = c[i];
      if (v !== v || v === Infinity || v === -Infinity) { nan++; continue; }
      const av = v < 0 ? -v : v;
      if (av > peak) peak = av;
      if (av > 0.001) { if (first < 0 || i < first) first = i; if (i > last) last = i; }
      const d = v - prev; if (d > jump) jump = d; else if (-d > jump) jump = -d;
      prev = v; sq += v * v; m += v; mono[i] += v / cut.length;
    }
    dc = Math.max(dc, Math.abs(m / n));
  }
  const rms = Math.sqrt(sq / (n * cut.length));
  const spec = welch(mono), bin = sr / (spec.length * 2);
  let tot = 0, cen = 0;
  const bands = BANDS.map(() => 0);
  let below400 = 0;
  for (let i = 1; i < spec.length; i++) {
    const f = i * bin, p = spec[i];
    if (f < 20) continue;
    tot += p; cen += p * f;
    if (f < 400) below400 += p;
    for (let k = 0; k < BANDS.length; k++) if (f >= BANDS[k][0] && f < BANDS[k][1]) bands[k] += p;
  }
  // level of the very start and end: a sound that begins or ends away from silence clicks
  const edge = Math.min(n, Math.floor(sr * 0.003));
  let head = 0, tail = 0;
  for (const c of cut) for (let i = 0; i < edge; i++) { head = Math.max(head, Math.abs(c[i])); tail = Math.max(tail, Math.abs(c[n - 1 - i])); }
  const lu = loudness(cut, sr);
  // correlation between the channels (1 = mono, 0 = unrelated)
  let lr = 0, ll = 0, rr = 0;
  if (cut.length > 1) for (let i = 0; i < n; i++) { lr += cut[0][i] * cut[1][i]; ll += cut[0][i] * cut[0][i]; rr += cut[1][i] * cut[1][i]; }
  return {
    seconds: n / sr, nan,
    peak, peakDb: dbfs(peak), rms, rmsDb: dbfs(rms), dc,
    lufs: lu.integrated, momentary: lu.momentary,
    centroid: tot ? cen / tot : 0, below400: tot ? below400 / tot : 0,
    bands: bands.map((p) => (tot ? p / tot : 0)),
    bandDb: bands.map((p) => 10 * Math.log10(p / (spec.length * spec.length) + 1e-20)),
    jump, head, tail,
    active: first < 0 ? 0 : (last - first) / sr, start: first < 0 ? -1 : first / sr,
    corr: ll && rr ? lr / Math.sqrt(ll * rr) : 1,
  };
}

/** Power in a frequency band of a mono mix, in dB (same reference for every call, so comparable). */
export function bandPower(chs, sr, lo, hi, from = 0) {
  const a = Math.floor(from * sr), n = chs[0].length - a, mono = new Float32Array(n);
  for (const c of chs) for (let i = 0; i < n; i++) mono[i] += c[a + i] / chs.length;
  const spec = welch(mono), bin = sr / (spec.length * 2);
  let p = 0;
  for (let i = 1; i < spec.length; i++) { const f = i * bin; if (f >= lo && f < hi) p += spec[i]; }
  return 10 * Math.log10(p / (spec.length * spec.length) + 1e-20);
}

// ---- pictures -----------------------------------------------------------------------------------
const RAMP = [[0, 0, 4], [40, 11, 84], [101, 21, 110], [159, 42, 99], [212, 72, 66], [245, 125, 21], [250, 193, 39], [252, 255, 164]];
function colour(t) {
  t = Math.max(0, Math.min(0.9999, t)) * (RAMP.length - 1);
  const i = Math.floor(t), f = t - i, a = RAMP[i], b = RAMP[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/**
 * Draw a labelled spectrogram (log frequency 30 Hz .. 20 kHz, -100 .. 0 dB) with the peak
 * envelope above it, into a canvas context at (x0, y0).
 */
export function drawSpectrogram(g, x0, y0, W, H, chs, sr, title, note) {
  const n = chs[0].length, mono = new Float32Array(n);
  for (const c of chs) for (let i = 0; i < n; i++) mono[i] += c[i] / chs.length;
  const N = 2048, w = hann(N), envH = 34, top = 16, specH = H - envH - top, fLo = 30, fHi = 20000;
  g.fillStyle = '#000'; g.fillRect(x0, y0, W, H);
  const img = g.createImageData(W, specH), buf = new Float64Array(N);
  const hop = Math.max(1, (n - N) / W);
  for (let x = 0; x < W; x++) {
    const s = Math.floor(x * hop);
    for (let i = 0; i < N; i++) buf[i] = (s + i < n ? mono[s + i] : 0) * w[i];
    const p = powerSpectrum(buf);
    for (let y = 0; y < specH; y++) {
      const f = fLo * Math.pow(fHi / fLo, 1 - y / specH), f2 = fLo * Math.pow(fHi / fLo, 1 - (y + 1) / specH);
      const b0 = Math.max(1, Math.floor(f2 / sr * N)), b1 = Math.max(b0 + 1, Math.ceil(f / sr * N));
      let m = 0;
      for (let b = b0; b < b1 && b < N / 2; b++) if (p[b] > m) m = p[b];
      const db = 10 * Math.log10(m / (N * N / 16) + 1e-20);
      const c = colour((db + 100) / 100), o = (y * W + x) * 4;
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, x0, y0 + top + envH);
  // envelope: peak per column
  g.fillStyle = '#7fd4ff';
  const step = n / W;
  for (let x = 0; x < W; x++) {
    let m = 0;
    for (let i = Math.floor(x * step); i < Math.floor((x + 1) * step); i++) { const v = Math.abs(mono[i]); if (v > m) m = v; }
    const h = Math.min(envH, Math.sqrt(m) * envH);
    g.fillRect(x0 + x, y0 + top + envH - h, 1, h);
  }
  // frequency guides and labels
  g.font = '10px monospace'; g.textBaseline = 'top';
  for (const f of [100, 400, 1000, 4000, 10000]) {
    const y = y0 + top + envH + (1 - Math.log(f / fLo) / Math.log(fHi / fLo)) * specH;
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x0, y, W, 1);
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), x0 + 2, y - 10);
  }
  g.fillStyle = '#fff'; g.fillText(`${title}  ${(n / sr).toFixed(1)}s  ${note || ''}`, x0 + 2, y0 + 3);
  g.strokeStyle = '#444'; g.strokeRect(x0 + 0.5, y0 + 0.5, W - 1, H - 1);
}

/** 16-bit PCM WAV as a base64 string. */
export function wavBase64(chs, sr) {
  const n = chs[0].length, nc = chs.length, bytes = new Uint8Array(44 + n * nc * 2), v = new DataView(bytes.buffer);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * nc * 2, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, nc, true); v.setUint32(24, sr, true); v.setUint32(28, sr * nc * 2, true);
  v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * nc * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) { const s = Math.max(-1, Math.min(1, chs[c][i])); v.setInt16(o, Math.round(s * 32767), true); o += 2; }
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
