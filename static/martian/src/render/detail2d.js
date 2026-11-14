/*
 * Tiling 2D detail textures for level ground.
 *
 * Level ground is seen at grazing angles, and only 2D textures can be filtered anisotropically:
 * a 3D texture goes soft exactly there, which is most of the picture. So flat ground is laid
 * with two generated 2D textures, addressed in metres across the cube face (see terrain/chunk.js):
 *
 *   sand   2 m across, 4 mm a texel: grains and grit
 *   field  16 m across, 3 cm a texel: lumps and hollows, wind ripples in places, and where the
 *          gravel lies
 *   crust  12.8 m across: the polygons of patterned ground, laid only at high latitudes and on ice
 *   clinker  8 m across: the broken top of a lava flow, laid only on the volcanoes' bare lava
 *
 * Each stores the surface's slope in RG (for the shading normal), a brightness in B, and a mask
 * in A (sand: stone, as opposed to dust; field: gravel patches).
 */
import * as THREE from 'three';

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Periodic value-noise fBm, about -1..1. `cells`: lattice cells across at the first octave. */
function fbm(size, cells, octaves, seed, gain = 0.5) {
  const out = new Float32Array(size * size);
  const rnd = rng(seed);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const P = cells << o;
    if (P > size / 2) break;
    const lat = new Float32Array(P * P);
    for (let i = 0; i < lat.length; i++) lat[i] = rnd() * 2 - 1;
    const step = P / size;
    for (let j = 0; j < size; j++) {
      const y = j * step, y0 = Math.floor(y), ty = y - y0, vy = ty * ty * (3 - 2 * ty);
      const r0 = (y0 % P) * P, r1 = ((y0 + 1) % P) * P;
      for (let i = 0; i < size; i++) {
        const x = i * step, x0 = Math.floor(x), tx = x - x0, vx = tx * tx * (3 - 2 * tx);
        const c0 = x0 % P, c1 = (x0 + 1) % P;
        const a = lat[r0 + c0] + (lat[r0 + c1] - lat[r0 + c0]) * vx, b = lat[r1 + c0] + (lat[r1 + c1] - lat[r1 + c0]) * vx;
        out[j * size + i] += (a + (b - a) * vy) * amp;
      }
    }
    total += amp; amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/** Pack height (for the slope), brightness and mask into an RGBA texture. `relief`: metres of height per unit; `span`: metres across. */
function pack(size, height, bright, mask, relief, span, anisotropy) {
  const data = new Uint8Array(size * size * 4);
  const at = (i, j) => height[((j + size) % size) * size + ((i + size) % size)];
  const perTexel = (relief * size) / span;              // slope = dh/dx: height difference per texel times this
  const q = (x) => Math.max(0, Math.min(255, Math.round(x)));
  for (let j = 0, k = 0; j < size; j++) for (let i = 0; i < size; i++, k++) {
    const sx = (at(i + 1, j) - at(i - 1, j)) * 0.5 * perTexel, sy = (at(i, j + 1) - at(i, j - 1)) * 0.5 * perTexel;
    data[k * 4] = q(127.5 + sx * 63.75);                // slopes of -2..2 fit the byte
    data[k * 4 + 1] = q(127.5 + sy * 63.75);
    data[k * 4 + 2] = q(bright[k] * 255);
    data[k * 4 + 3] = q(mask[k] * 255);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

function sandTexture(size, anisotropy) {
  const SPAN = 2;                                        // metres across
  const rnd = rng(911);
  const grain = fbm(size, 24, 4, 3, 0.62), lumps = fbm(size, 5, 3, 17), tone = fbm(size, 7, 4, 29, 0.6);
  const h = new Float32Array(size * size), bright = new Float32Array(size * size), mask = new Float32Array(size * size);
  for (let k = 0; k < h.length; k++) {
    const speck = rnd() - 0.5;
    h[k] = lumps[k] * 0.012 + grain[k] * 0.0035 + speck * 0.0012;          // metres
    bright[k] = 0.56 + tone[k] * 0.16 + grain[k] * 0.10 + speck * 0.10;
  }
  // pebbles: mostly small, a few as big as a fist; each a low dome pressed a little into the sand
  const px = size / SPAN;                                 // texels per metre
  // Only grit is painted: anything bigger than a thumbnail reads as a flat disc at a low sun, and stones
  // of that size are real geometry (world/rocks.js, the gravel field).
  for (let n = 0; n < 420; n++) {
    const cx = rnd() * size, cy = rnd() * size;
    const r = (0.004 + 0.013 * Math.pow(rnd(), 3.0)) * px;  // 4 mm to 1.7 cm radius, most of them small
    const tall = (r / px) * (0.45 + rnd() * 0.5), shade = 0.14 + rnd() * 0.22, sq = 0.7 + rnd() * 0.6, rot = rnd() * Math.PI;
    const ca = Math.cos(rot), sa = Math.sin(rot);
    const R2 = Math.ceil(r * 1.5);
    for (let dj = -R2; dj <= R2; dj++) for (let di = -R2; di <= R2; di++) {
      const ex = (di * ca + dj * sa) / (r * sq), ey = (-di * sa + dj * ca) / (r / sq);
      const d2 = ex * ex + ey * ey;
      if (d2 >= 1) continue;
      const i = ((Math.round(cx) + di) % size + size) % size, j = ((Math.round(cy) + dj) % size + size) % size, k = j * size + i;
      const dome = Math.sqrt(1 - d2);
      const edge = Math.min(1, (1 - d2) * 4);              // a soft rim so the stone sits in the sand
      if (tall * dome > h[k] - lumps[k] * 0.012) h[k] = lumps[k] * 0.012 + tall * dome;
      bright[k] += (shade * (0.8 + 0.4 * dome) - bright[k]) * edge;
      mask[k] = Math.max(mask[k], edge);
    }
  }
  return pack(size, h, bright, mask, 1, SPAN, anisotropy);
}

function fieldTexture(size, anisotropy) {
  const SPAN = 16;
  const broad = fbm(size, 4, 5, 41, 0.55), warp = fbm(size, 3, 2, 53), where = fbm(size, 3, 3, 67), tone = fbm(size, 5, 4, 71, 0.6), gravel = fbm(size, 4, 4, 83, 0.55);
  const swell = fbm(size, 6, 2, 59);
  const h = new Float32Array(size * size), bright = new Float32Array(size * size), mask = new Float32Array(size * size);
  for (let j = 0, k = 0; j < size; j++) for (let i = 0; i < size; i++, k++) {
    // ripples: ridges about 30 cm apart, laid across the wind, only gently bent (a strong bend closes them
    // into whorls like a fingerprint), taller in some places than others, in patches with bare sand between
    const phase = ((i / size) * 54 + warp[k] * 1.5 + (j / size) * 5) % 1;
    const ridge = 1 - Math.abs((phase + 1) % 1 - 0.5) * 2;               // 0 in the trough .. 1 on the crest
    const rippled = Math.max(0, Math.min(1, (where[k] - 0.02) * 4)) * (0.55 + 0.45 * Math.max(0, Math.min(1, swell[k] * 2 + 0.5)));
    h[k] = broad[k] * 0.11 + Math.pow(ridge, 1.6) * 0.022 * rippled;
    bright[k] = 0.56 + tone[k] * 0.22 + (ridge - 0.5) * 0.08 * rippled - Math.max(0, -broad[k]) * 0.10;
    mask[k] = Math.max(0, Math.min(1, (gravel[k] - 0.02) * 4)) * (1 - rippled * 0.8);
  }
  return pack(size, h, bright, mask, 1, SPAN, anisotropy);
}

/** Patterned ground: the polygons that freezing and thawing crack into high-latitude soil and ice.
 *  Troughs of uneven width between cells of uneven size, missing altogether in places. */
function crustTexture(size, anisotropy) {
  const SPAN = 12.8;
  const where = fbm(size, 3, 3, 167), wide = fbm(size, 7, 3, 173), tone = fbm(size, 5, 3, 179, 0.6), dome = fbm(size, 9, 3, 181);
  const h = new Float32Array(size * size), bright = new Float32Array(size * size), mask = new Float32Array(size * size);
  // (Six cells across, each some two metres; their edges nearly straight, meeting at angles; the troughs a hand
  // across and dark, with hardly a rim. Nine small cells with wandering edges and raised rims were a net of welts.)
  const C = 6, rnd = rng(97), pts = new Float32Array(C * C * 2);
  for (let i = 0; i < C * C; i++) { pts[i * 2] = 0.15 + rnd() * 0.7; pts[i * 2 + 1] = 0.15 + rnd() * 0.7; }
  for (let j = 0, k = 0; j < size; j++) for (let i = 0; i < size; i++, k++) {
    const gx = (i / size) * C + wide[k] * 0.09, gy = (j / size) * C + dome[k] * 0.09, cx = Math.floor(gx), cy = Math.floor(gy);
    let d1 = 9, d2 = 9;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
      const qx = ((cx + a) % C + C) % C, qy = ((cy + b) % C + C) % C, q = (qy * C + qx) * 2;
      const dx = cx + a + pts[q] - gx, dy = cy + b + pts[q + 1] - gy, d = dx * dx + dy * dy;
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    const edge = Math.sqrt(d2) - Math.sqrt(d1);                          // 0 on a cell boundary
    const width = 0.028 + 0.034 * Math.max(0, wide[k] + 0.5);             // troughs 6 to 13 cm across
    const trough = Math.max(0, 1 - edge / width);
    const here = Math.max(0, Math.min(1, (where[k] + 0.25) * 3));         // most of the ground, not all of it
    const t2 = trough * trough * (3 - 2 * trough) * here;
    // each polygon is slightly domed, its rim a little raised beside the trough
    const rim = Math.max(0, 1 - Math.abs(edge - width * 1.6) / (width * 1.2)) * here;
    h[k] = -t2 * 0.034 + rim * 0.003 + dome[k] * 0.01;
    bright[k] = 0.56 + tone[k] * 0.12 - t2 * 0.30 + rim * 0.015;
    mask[k] = t2;
  }
  return pack(size, h, bright, mask, 1, SPAN, anisotropy);
}

/** Clinker: the broken top of a lava flow. Blocks a pace across, jumbled and tilted, with fist-sized rubble
 *  on and between them, and dust lying in the gaps and over the lowest blocks. A is where the dust lies.
 *  (Laid at 8, 32 and 64 m a tile, each with its relief scaled alike: rubble near, plates from the air.) */
function clinkerTexture(size, anisotropy) {
  const SPAN = 8;
  const N = size * size;
  const grain = fbm(size, 40, 3, 211, 0.6), swell = fbm(size, 3, 3, 223), drift = fbm(size, 5, 3, 227, 0.55), wa = fbm(size, 9, 2, 229), wb = fbm(size, 9, 2, 233);
  const la = fbm(size, 2, 2, 239), lb = fbm(size, 2, 2, 241);      // (a broad push, so the blocks are not all of a size)
  const h = new Float32Array(N), bright = new Float32Array(N), mask = new Float32Array(N);
  // each cell: its point, how tall the block stands, which way its top tilts, its tone
  const cells = (C, seed) => {
    const rnd = rng(seed), p = new Float32Array(C * C * 6);
    for (let i = 0; i < C * C; i++) { p[i * 6] = 0.12 + rnd() * 0.76; p[i * 6 + 1] = 0.12 + rnd() * 0.76; p[i * 6 + 2] = rnd(); p[i * 6 + 3] = rnd() * 2 - 1; p[i * 6 + 4] = rnd() * 2 - 1; p[i * 6 + 5] = rnd(); }
    return p;
  };
  const CA = 13, CB = 41, A = cells(CA, 311), B = cells(CB, 313);
  let q0 = 0, e0 = 0, tx = 0, ty = 0;
  const look = (P, C, gx, gy) => {
    const cx = Math.floor(gx), cy = Math.floor(gy);
    let d1 = 9, d2 = 9;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
      const qx = ((cx + a) % C + C) % C, qy = ((cy + b) % C + C) % C, q = (qy * C + qx) * 6;
      const dx = cx + a + P[q] - gx, dy = cy + b + P[q + 1] - gy, d = dx * dx + dy * dy;
      if (d < d1) { d2 = d1; d1 = d; q0 = q; tx = -dx; ty = -dy; } else if (d < d2) d2 = d;
    }
    e0 = Math.sqrt(d2) - Math.sqrt(d1);                                    // 0 on a block's edge
  };
  const ease = (x) => { x = x <= 0 ? 0 : x >= 1 ? 1 : x; return x * x * (3 - 2 * x); };
  for (let j = 0, k = 0; j < size; j++) for (let i = 0; i < size; i++, k++) {
    const u = i / size, v = j / size;
    look(A, CA, u * CA + wa[k] * 0.3 + la[k] * 1.5, v * CA + wb[k] * 0.3 + lb[k] * 1.5);
    const inA = ease(e0 / 0.2), tallA = A[q0 + 2] * A[q0 + 2], toneA = A[q0 + 5];
    const hA = inA * (0.04 + 0.24 * tallA + 0.17 * (tx * A[q0 + 3] + ty * A[q0 + 4]));      // metres: a block 60 cm across stands a hand to a foot high
    look(B, CB, u * CB + wb[k] * 0.5 + lb[k] * 2.5, v * CB - wa[k] * 0.5 - la[k] * 2.5);
    const inB = ease(e0 / 0.24), toneB = B[q0 + 5];
    const hB = inB * (0.012 + 0.06 * B[q0 + 2] + 0.05 * (tx * B[q0 + 3] + ty * B[q0 + 4]));
    const rock = hA + hB * (1 - 0.55 * inA * tallA) + grain[k] * 0.006;
    // dust: level, deeper in some places than others; whatever stands lower than it is buried
    const top = 0.035 + drift[k] * 0.17;
    const d = ease((top - rock) / 0.035 + 0.5);
    h[k] = swell[k] * 0.07 + rock + (top + grain[k] * 0.002 - rock) * d;
    const stone = 0.5 + (toneA - 0.5) * 0.5 * inA + (toneB - 0.5) * 0.22 + grain[k] * 0.07 - (1 - inA) * 0.15 - (1 - inB) * 0.10 * inA;
    bright[k] = stone + (0.56 + grain[k] * 0.03 - stone) * d;
    mask[k] = d;
  }
  return pack(size, h, bright, mask, 1, SPAN, anisotropy);
}

let cache = null;
/** @param {number} anisotropy  the renderer's limit, capped by the quality preset */
export function groundTextures(anisotropy = 8) {
  if (!cache) cache = { sand: sandTexture(512, anisotropy), field: fieldTexture(512, anisotropy), crust: crustTexture(512, anisotropy), clinker: clinkerTexture(512, anisotropy) };
  return cache;
}
