/*
 * Tiling 2D detail textures for level ground.
 *
 * Level ground is seen at grazing angles, and only 2D textures can be filtered anisotropically:
 * a 3D texture goes soft exactly there, which is most of the picture. So flat ground is laid
 * with two generated 2D textures, addressed in metres across the cube face (see terrain/chunk.js):
 *
 *   sand   2 m across, 4 mm a texel: grains, grit, and scattered pebbles
 *   field  16 m across, 3 cm a texel: lumps and hollows, wind ripples in places, cracked crust
 *          in others, and where the gravel lies
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
  for (let n = 0; n < 230; n++) {
    const cx = rnd() * size, cy = rnd() * size;
    const r = (0.005 + 0.062 * Math.pow(rnd(), 4.0)) * px;  // 5 mm to 6.7 cm radius, most of them small
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
  const broad = fbm(size, 4, 5, 41, 0.55), warp = fbm(size, 6, 3, 53), where = fbm(size, 3, 3, 67), tone = fbm(size, 5, 4, 71, 0.6), gravel = fbm(size, 4, 4, 83, 0.55);
  const h = new Float32Array(size * size), bright = new Float32Array(size * size), mask = new Float32Array(size * size);
  // cracked crust: cells of a periodic Voronoi pattern; the cracks are where two cells meet
  const C = 22, rnd = rng(97), pts = new Float32Array(C * C * 2);
  for (let i = 0; i < C * C; i++) { pts[i * 2] = rnd(); pts[i * 2 + 1] = rnd(); }
  for (let j = 0, k = 0; j < size; j++) for (let i = 0; i < size; i++, k++) {
    // ripples: ridges about 30 cm apart, running roughly across the texture, bent by the warp field
    const phase = ((i / size) * 54 + warp[k] * 5.5 + (j / size) * 6) % 1;
    const ridge = 1 - Math.abs((phase + 1) % 1 - 0.5) * 2;               // 0 in the trough .. 1 on the crest
    const rippled = Math.max(0, Math.min(1, (where[k] - 0.08) * 5));
    // crust
    const gx = (i / size) * C, gy = (j / size) * C, cx = Math.floor(gx), cy = Math.floor(gy);
    let d1 = 9, d2 = 9;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
      const qx = ((cx + a) % C + C) % C, qy = ((cy + b) % C + C) % C, q = (qy * C + qx) * 2;
      const dx = cx + a + pts[q] - gx, dy = cy + b + pts[q + 1] - gy, d = dx * dx + dy * dy;
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    const crack = Math.max(0, 1 - (Math.sqrt(d2) - Math.sqrt(d1)) * 9);    // 1 in a crack
    const crusted = Math.max(0, Math.min(1, (-where[k] - 0.10) * 5));
    h[k] = broad[k] * 0.11 + Math.pow(ridge, 1.6) * 0.022 * rippled - crack * crack * 0.03 * crusted;
    bright[k] = 0.56 + tone[k] * 0.20 + (ridge - 0.5) * 0.07 * rippled - crack * 0.16 * crusted - Math.max(0, -broad[k]) * 0.10;
    mask[k] = Math.max(0, Math.min(1, (gravel[k] - 0.02) * 4)) * (1 - rippled * 0.8);
  }
  return pack(size, h, bright, mask, 1, SPAN, anisotropy);
}

let cache = null;
/** @param {number} anisotropy  the renderer's limit, capped by the quality preset */
export function groundTextures(anisotropy = 8) {
  if (!cache) cache = { sand: sandTexture(512, anisotropy), field: fieldTexture(512, anisotropy) };
  return cache;
}
