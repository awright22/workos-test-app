// Small numeric helpers shared by the main thread and the terrain worker. No three.js here.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const saturate = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Frame-rate independent approach factor: fraction of the gap closed after dt at the given half-life. */
export const damp = (halfLife, dt) => 1 - Math.pow(0.5, dt / halfLife);

/** Integer hash of a 3D lattice point to [0, 1). Deterministic across threads and devices. */
export function hash3(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}
/** Integer hash to a 32-bit unsigned integer (for seeding several values from one cell). */
export function hashU(x, y, z, w) {
  let h = (Math.imul(x, 0x85ebca6b) ^ Math.imul(y, 0xc2b2ae35) ^ Math.imul(z, 0x27d4eb2f) ^ Math.imul(w, 0x165667b1)) | 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Legacy value noise used by the first version of the game; kept for save migration helpers. */
export function vnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const n000 = hash3(xi, yi, zi), n100 = hash3(xi + 1, yi, zi);
  const n010 = hash3(xi, yi + 1, zi), n110 = hash3(xi + 1, yi + 1, zi);
  const n001 = hash3(xi, yi, zi + 1), n101 = hash3(xi + 1, yi, zi + 1);
  const n011 = hash3(xi, yi + 1, zi + 1), n111 = hash3(xi + 1, yi + 1, zi + 1);
  return lerp(lerp(lerp(n000, n100, u), lerp(n010, n110, u), v), lerp(lerp(n001, n101, u), lerp(n011, n111, u), v), w);
}

// Gradient noise (Perlin, improved) with an integer-hash lattice. Returns roughly [-1, 1].
function grad(h, x, y, z) {
  switch (h & 15) {
    case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
    case 4: return x + z; case 5: return -x + z; case 6: return x - z; case 7: return -x - z;
    case 8: return y + z; case 9: return -y + z; case 10: return y - z; case 11: return -y - z;
    case 12: return x + y; case 13: return -y + z; case 14: return -x + y; default: return -y - z;
  }
}
function lat(x, y, z) {
  let h = (Math.imul(x, 0x8da6b343) ^ Math.imul(y, 0xd8163841) ^ Math.imul(z, 0xcb1ab31f)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  return (h ^ (h >>> 13)) >>> 0;
}
export function gnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
  const w = zf * zf * zf * (zf * (zf * 6 - 15) + 10);
  const a = grad(lat(xi, yi, zi), xf, yf, zf), b = grad(lat(xi + 1, yi, zi), xf - 1, yf, zf);
  const c = grad(lat(xi, yi + 1, zi), xf, yf - 1, zf), d = grad(lat(xi + 1, yi + 1, zi), xf - 1, yf - 1, zf);
  const e = grad(lat(xi, yi, zi + 1), xf, yf, zf - 1), f = grad(lat(xi + 1, yi, zi + 1), xf - 1, yf, zf - 1);
  const g = grad(lat(xi, yi + 1, zi + 1), xf, yf - 1, zf - 1), h = grad(lat(xi + 1, yi + 1, zi + 1), xf - 1, yf - 1, zf - 1);
  return lerp(lerp(lerp(a, b, u), lerp(c, d, u), v), lerp(lerp(e, f, u), lerp(g, h, u), v), w);
}

/** Small seedable generator (mulberry32) for anything that must repeat from a seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
