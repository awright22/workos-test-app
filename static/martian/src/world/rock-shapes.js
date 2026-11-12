/*
 * Rock shapes: a small atlas of rocks, each stored as a picture of itself.
 *
 * A rock here is a star-shaped solid: from a point inside it, every direction meets the surface
 * once. So a rock is a function from direction to distance, and that function fits in a square
 * texture (the sphere of directions laid flat, equal-area, with the top of the rock in the middle
 * and its buried underside round the rim). One texture layer holds the surface's normal and the
 * distance; a second holds what a scan of a real rock would also give: how hollow or how proud
 * the spot is, the tone of the face it lies on, and whether that face is a fresh break.
 *
 * The rock shader (rocks.js) pushes the vertices of a plain ball out to the stored distance and
 * shades every pixel with the stored normal. Every level of detail of a rock is therefore the
 * same rock, sixteen shapes cost one draw call, and a boulder of eighty triangles is lit as
 * smoothly as one of thirteen hundred.
 *
 * The shapes are built the way rocks are: blocks bounded by fracture planes (their edges
 * rounded by a chosen amount, their faces a little uneven so that no edge runs straight),
 * boulders the wind has worn, plates of layered rock, and solids fused from two or three of
 * those; then lumps and hollows. No three.js here.
 */
import { gnoise3 } from '../core/math.js';

/** What a rock is, for the scatter to choose by region (terrain/chunk.js): indices into the atlas's `classes`. */
export const ANGULAR = 0, ROUNDED = 1, SLAB = 2, COBBLE = 3;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const unit = (x, y, z) => { const l = 1 / Math.hypot(x, y, z); return [x * l, y * l, z * l]; };
/** Rotate v about the y axis by `yaw`, then tip it by `tilt` about an axis in the ground plane at `lean`. */
function turn(v, yaw, tilt, lean) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const x = v[0] * c + v[2] * s, y = v[1], z = -v[0] * s + v[2] * c;
  // Rodrigues about the axis (cos lean, 0, sin lean)
  const ax = Math.cos(lean), az = Math.sin(lean), ct = Math.cos(tilt), st = Math.sin(tilt);
  const d = (ax * x + az * z) * (1 - ct);
  return [x * ct + (-az * y) * st + ax * d, y * ct + (az * x - ax * z) * st, z * ct + (ax * y) * st + az * d];
}
/** x to the power 2^e (e whole): edges are sharpened by powers, and a power of two is e multiplications. */
function pow2(x, e) { for (let i = 0; i < e; i++) x *= x; return x; }

/*
 * A part is a convex solid: the planes that bound it, [nx, ny, nz, h, tone, fresh, qx, qy, qz]
 * (the solid is where n.x <= h, measured from the rock's centre; q says how this face undulates),
 * and how sharp its edges are (e: the edge power is 2^e, so 1 would be an ellipsoid, 3 is a worn
 * block, 5 a fresh break).
 */
const face = (rnd, n, h, tone, fresh = 0) => [n[0], n[1], n[2], h, tone, fresh, ...unit(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5)];
/** A box with half-sizes a, turned, its faces knocked a little out of square. */
function box(rnd, a, yaw, tilt, lean, e, skew = 0.16) {
  const planes = [];
  for (const [v, h] of [[[1, 0, 0], a[0]], [[-1, 0, 0], a[0]], [[0, 1, 0], a[1]], [[0, -1, 0], a[1]], [[0, 0, 1], a[2]], [[0, 0, -1], a[2]]]) {
    const n = turn(unit(v[0] + (rnd() - 0.5) * skew, v[1] + (rnd() - 0.5) * skew, v[2] + (rnd() - 0.5) * skew), yaw, tilt, lean);
    planes.push(face(rnd, n, h * (0.9 + rnd() * 0.2), rnd() * 2 - 1));
  }
  return { planes, e };
}
/** n planes spread evenly round an ellipsoid with half-sizes a and then jittered: an irregular block. */
function poly(rnd, n, a, vary, jitter, e) {
  const planes = [], off = rnd() * 6.283;
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), ang = i * 2.39996 + off;
    const v = unit(r * Math.cos(ang) + (rnd() - 0.5) * jitter, y + (rnd() - 0.5) * jitter, r * Math.sin(ang) + (rnd() - 0.5) * jitter);
    planes.push(face(rnd, v, Math.hypot(v[0] * a[0], v[1] * a[1], v[2] * a[2]) * (1 - vary * rnd()), rnd() * 2 - 1));
  }
  return { planes, e };
}
/** A plate: a top, a bottom and n sides. */
function plate(rnd, n, top, bottom, rLo, rHi, lean, e) {
  const planes = [face(rnd, unit((rnd() - 0.5) * lean, 1, (rnd() - 0.5) * lean), top, rnd() * 0.6), face(rnd, [0, -1, 0], bottom, 0)];
  const off = rnd() * 6.283;
  for (let i = 0; i < n; i++) {
    const ang = off + (i + (rnd() - 0.5) * 0.7) * 6.283 / n;
    planes.push(face(rnd, unit(Math.cos(ang), (rnd() - 0.5) * 0.5, Math.sin(ang)), rLo + rnd() * (rHi - rLo), rnd() * 2 - 1));
  }
  return { planes, e };
}
/** Break pieces off a part: k fresh fracture planes, each taking off `lo`..`hi` of the way in from the surface. */
function chop(rnd, part, k, lo, hi, yMin = -0.3) {
  for (let i = 0; i < k; i++) {
    const y = yMin + rnd() * (1 - yMin), r = Math.sqrt(Math.max(0, 1 - y * y)), ang = rnd() * 6.283;
    const v = [r * Math.cos(ang), y, r * Math.sin(ang)];
    part.planes.push(face(rnd, v, radiusOf(part, v) * (1 - lo - rnd() * (hi - lo)), rnd() * 2 - 1, 1));
  }
  return part;
}
/** Move a part: its planes keep their directions and the solid is shifted by c. */
function shift(part, c) {
  for (const pl of part.planes) pl[3] += pl[0] * c[0] + pl[1] * c[1] + pl[2] * c[2];
  return part;
}
/** Distance from the centre to a part's surface along unit direction d. */
function radiusOf(part, d) {
  let f = 0;
  for (const pl of part.planes) {
    const t = (pl[0] * d[0] + pl[1] * d[1] + pl[2] * d[2]) / pl[3];
    if (t > 0) f += pow2(t, part.e);
  }
  return Math.pow(f, -1 / (1 << part.e));
}

/** Knock chips off a part's edges and corners: n small fresh breaks, which is what makes a broken rock look broken. */
const chips = (rnd, part, n, yMin = -0.35) => chop(rnd, part, n, 0.03, 0.11, yMin);

/*
 * The rocks. Each: its class; the height of the ground on it (in its own units, from its centre:
 * below zero and the rock stands on the surface with its widest part clear, at zero it is sunk to
 * the shoulders); its parts and how they join (`cut`: the solid common to them all; otherwise all of
 * them fused); how uneven its faces are; lumps [size, wavelength] at two scales; hollows where flakes
 * have come off or the wind has dug [depth, how gradually]; layering.
 */
const DEFS = [
  // ---- broken basalt: blocks bounded by fracture planes, their edges chipped ----
  (r) => ({ cls: ANGULAR, ground: -0.20, parts: [chips(r, chop(r, box(r, [1.0, 0.74, 0.82], 0.4, 0.22, 1.1, 5, 0.2), 3, 0.06, 0.2), 12)], uneven: 0.028, lumps: [0.01, 0.6, 0.005, 0.23], scars: [0.013, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.18, parts: [chips(r, chop(r, poly(r, 11, [1.0, 0.82, 0.86], 0.24, 0.6, 5), 2, 0.2, 0.42, 0.1), 10)], uneven: 0.03, lumps: [0.012, 0.55, 0.005, 0.2], scars: [0.012, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.22, parts: [chips(r, chop(r, poly(r, 7, [0.95, 0.78, 0.72], 0.3, 0.8, 5), 2, 0.1, 0.3, 0.2), 10)], uneven: 0.028, lumps: [0.01, 0.6, 0.005, 0.22], scars: [0.012, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.14, parts: [chips(r, poly(r, 13, [1.0, 0.76, 0.9], 0.15, 0.5, 4), 8)], uneven: 0.04, lumps: [0.02, 0.5, 0.01, 0.2], scars: [0.025, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.30, join: 4, parts: [shift(chips(r, chop(r, poly(r, 9, [1.0, 0.52, 0.86], 0.12, 0.5, 5), 2, 0.08, 0.2), 6), [0, -0.16, 0]), shift(chips(r, chop(r, box(r, [0.62, 0.52, 0.56], 2.5, 0.34, 2.0, 5, 0.4), 3, 0.08, 0.24), 7), [0.2, 0.32, -0.08])], uneven: 0.028, lumps: [0.01, 0.6, 0.005, 0.2], scars: [0.012, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.34, parts: [chips(r, chop(r, box(r, [0.72, 1.0, 0.66], 1.2, 0.3, 0.4, 5, 0.36), 4, 0.08, 0.26, 0.0), 12)], uneven: 0.028, lumps: [0.012, 0.6, 0.005, 0.22], scars: [0.013, 0.3] }),
  (r) => ({ cls: ANGULAR, ground: -0.10, parts: [chips(r, chop(r, box(r, [1.0, 0.5, 0.78], 2.9, 0.1, 2.2, 5, 0.22), 3, 0.05, 0.16, 0.3), 10)], uneven: 0.026, lumps: [0.01, 0.6, 0.005, 0.22], scars: [0.011, 0.3] }),
  // ---- boulders the wind has worn: the same breaks, their edges long since rounded ----
  (r) => ({ cls: ROUNDED, ground: -0.36, parts: [chips(r, poly(r, 12, [1.0, 0.86, 0.88], 0.16, 0.6, 4), 5)], uneven: 0.04, lumps: [0.035, 0.75, 0.012, 0.26], scars: [0.024, 0.34] }),
  (r) => ({ cls: ROUNDED, ground: -0.24, join: 3, parts: [chips(r, poly(r, 10, [0.9, 0.74, 0.8], 0.16, 0.6, 4), 4), shift(poly(r, 9, [0.58, 0.46, 0.58], 0.1, 0.5, 3), [0.42, 0.0, 0.2]), shift(poly(r, 8, [0.5, 0.42, 0.5], 0.1, 0.5, 3), [-0.3, -0.02, -0.25])], uneven: 0.03, lumps: [0.035, 0.7, 0.012, 0.25], scars: [0.024, 0.34] }),
  (r) => ({ cls: ROUNDED, ground: -0.28, cut: true, join: 3, parts: [chips(r, poly(r, 12, [1.0, 0.8, 0.78], 0.14, 0.6, 3), 4), { e: 3, planes: [face(r, unit(0.1, 0.6, 0.79), 0.56, 0.4), face(r, unit(-0.1, 0.55, -0.83), 0.52, -0.3), face(r, unit(0.85, 0.45, 0.2), 0.74, 0.1), face(r, [0, -1, 0], 0.7, 0)] }], uneven: 0.03, lumps: [0.025, 0.8, 0.01, 0.25], scars: [0.016, 0.34] }),
  // (a boulder split in two: the round back of it, and the flat face it broke along)
  (r) => ({ cls: ROUNDED, ground: -0.26, cut: true, join: 4, parts: [chips(r, poly(r, 11, [1.0, 0.9, 0.85], 0.14, 0.6, 4), 4), chips(r, { e: 5, planes: [face(r, unit(0.9, 0.22, 0.3), 0.34, -0.5, 1), face(r, unit(-0.3, 0.5, -0.8), 0.86, 0.2), face(r, [0, -1, 0], 0.7, 0)] }, 4)], uneven: 0.035, lumps: [0.03, 0.75, 0.01, 0.25], scars: [0.020, 0.34] }),
  // ---- plates of layered rock ----
  (r) => ({ cls: SLAB, ground: 0.02, parts: [chips(r, chop(r, plate(r, 7, 0.28, 0.5, 0.85, 1.15, 0.2, 5), 1, 0.05, 0.15, 0.5), 8, 0.1)], uneven: 0.022, lumps: [0.008, 0.6, 0.004, 0.2], scars: [0.007, 0.3] }),
  (r) => ({ cls: SLAB, ground: -0.05, join: 4, parts: [chips(r, plate(r, 8, 0.2, 0.5, 0.9, 1.15, 0.12, 5), 5, 0.1), shift(chips(r, plate(r, 6, 0.5, 0.5, 0.55, 0.78, 0.25, 5), 5, 0.1), [0.14, 0, -0.1])], layers: [0.022, 0.17], uneven: 0.03, lumps: [0.01, 0.6, 0.005, 0.2], scars: [0.008, 0.3] }),
  // ---- cobbles and chips ----
  (r) => ({ cls: COBBLE, ground: -0.10, parts: [poly(r, 10, [1.0, 0.62, 0.8], 0.08, 0.5, 3)], uneven: 0.03, lumps: [0.03, 0.8, 0.01, 0.3], scars: [0.016, 0.34] }),
  (r) => ({ cls: COBBLE, ground: -0.12, parts: [chips(r, poly(r, 9, [1.0, 0.6, 0.8], 0.25, 0.7, 4), 5)], uneven: 0.035, lumps: [0.02, 0.7, 0.008, 0.25], scars: [0.014, 0.3] }),
  (r) => ({ cls: COBBLE, ground: -0.16, parts: [chips(r, chop(r, poly(r, 8, [0.9, 0.74, 0.84], 0.2, 0.6, 4), 1, 0.2, 0.4, 0.3), 5)], uneven: 0.035, lumps: [0.02, 0.7, 0.01, 0.25], scars: [0.017, 0.3] }),
];
const SEEDS = [11, 23, 37, 41, 59, 61, 173, 73, 89, 97, 181, 103, 127, 139, 151, 163];

/** How many shapes the atlas holds. */
export const SHAPE_COUNT = DEFS.length;

/** Scratch for one atlas size: the direction each texel stands for, and working arrays. */
function workspace(N) {
  const NN = N * N;
  const w = { N, NN, dx: new Float32Array(NN), dy: new Float32Array(NN), dz: new Float32Array(NN), inside: new Uint8Array(NN),
    rad: new Float32Array(NN), tone: new Float32Array(NN), fresh: new Float32Array(NN), nrm: new Float32Array(NN * 3), curv: new Float32Array(NN), tmp: new Float32Array(NN), wide: new Float32Array(NN) };
  // Lambert's equal-area map of the sphere, the top of the rock at the centre
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++, k++) {
    let u = ((i + 0.5) / N - 0.5) * 4, v = ((j + 0.5) / N - 0.5) * 4;
    let q = u * u + v * v;
    w.inside[k] = q <= 4 ? 1 : 0;
    if (q > 3.999) { const s = Math.sqrt(3.999 / q); u *= s; v *= s; q = 3.999; }
    const s = Math.sqrt(1 - q / 4);
    w.dx[k] = u * s; w.dy[k] = 1 - q / 2; w.dz[k] = v * s;
  }
  return w;
}

/** A box blur of `src` into `dst`, half-width B, within the disc of texels that stand for directions. */
function blurInto(w, src, dst, B) {
  const { N, inside, tmp } = w;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, c = 0;
    for (let o = -B; o <= B; o++) { const ii = i + o; if (ii >= 0 && ii < N && inside[j * N + ii]) { s += src[j * N + ii]; c++; } }
    tmp[j * N + i] = c ? s / c : src[j * N + i];
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, c = 0;
    for (let o = -B; o <= B; o++) { const jj = j + o; if (jj >= 0 && jj < N && inside[jj * N + i]) { s += tmp[jj * N + i]; c++; } }
    dst[j * N + i] = c ? s / c : tmp[j * N + i];
  }
}

/**
 * Work out one shape and write its two layers.
 * @returns {{cls:number, ground:number, top:number, big:number}} in units where its radius at the ground is 1
 */
function buildShape(n, w, out, offset, rmaxFixed) {
  const { N, NN, dx, dy, dz, inside, rad, tone, fresh, nrm, curv, wide } = w;
  const rnd = rng(SEEDS[n] * 7919 + 13);
  const def = DEFS[n](rnd);
  const parts = def.parts, je = def.join || 4, sd = SEEDS[n] * 3.71, L = def.lumps, un = def.uneven * 2.2, scar = def.scars;
  for (let k = 0; k < NN; k++) {
    const x = dx[k], y = dy[k], z = dz[k];
    // three slow fields: each face undulates by its own mix of them, so faces are not flat and edges do not run straight
    const w0 = gnoise3(x * 1.7 + sd, y * 1.7, z * 1.7 - sd), w1 = gnoise3(x * 1.7 - 7.1, y * 1.7 + sd, z * 1.7), w2 = gnoise3(x * 1.7, y * 1.7 - sd, z * 1.7 + 4.4);
    let acc = 0, tn = 0, fr = 0;
    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi], e = part.e, pls = part.planes;
      let f = 0, ft = 0, ff = 0;
      for (let q = 0; q < pls.length; q++) {
        const pl = pls[q];
        const t = (pl[0] * x + pl[1] * y + pl[2] * z) / pl[3] * (1 + un * (w0 * pl[6] + w1 * pl[7] + w2 * pl[8]));
        if (t > 0) { const wt = pow2(t, e); f += wt; ft += wt * pl[4]; ff += wt * pl[5]; }
      }
      const rp = Math.pow(f, -1 / (1 << e));
      // cut: the smallest wins; fused: the largest
      const wp = pow2(def.cut ? 1 / rp : rp, je);
      acc += wp; tn += wp * ft / f; fr += wp * ff / f;
    }
    let r = Math.pow(acc, (def.cut ? -1 : 1) / (1 << je));
    tn /= acc; fr /= acc;
    // lumps at two sizes, and scars where a flake has come off or the wind has dug, in patches of no
    // particular shape (soft-rimmed: the sharp breaks are the chips). Both are laid out across the surface itself (by position, not by direction: a face
    // near the centre takes up a great deal of direction, and noise by direction puckers in the middle of it).
    const px = x * r, py = y * r, pz = z * r;
    const hn = gnoise3(px * 2.3 + 9.7, py * 2.3 + sd, pz * 2.3 - 2.3) + 0.3 * gnoise3(px * 5.3 - sd, py * 5.3, pz * 5.3 + 1.1);
    r *= 1 + L[0] * 2 * gnoise3(px / L[1] + sd, py / L[1] - sd * 0.7, pz / L[1] + 3.3) + L[2] * 2 * gnoise3(px / L[3] - sd, py / L[3] + 5.1, pz / L[3] + sd * 1.3);
    if (hn > 0.2) { const t = Math.min(1, (hn - 0.2) / scar[1]); r -= scar[0] * t * t * (3 - 2 * t); }
    // layered rock: the beds stand out as ledges on its sides
    if (def.layers) {
      const h = r * y / def.layers[1] + w0 * 0.5;
      const f = h - Math.floor(h);
      const step = f < 0.5 ? 1 : f < 0.65 ? 1 - (f - 0.5) / 0.075 : f < 0.85 ? -1 : -1 + (f - 0.85) / 0.075;
      r *= 1 + def.layers[0] * step * Math.min(1, (1 - Math.abs(y)) * 3);
    }
    rad[k] = r; tone[k] = tn; fresh[k] = fr;
  }
  // measure it: its radius where the ground meets it, its top, its widest
  let foot = 0, fc = 0, top = 0, big = 0;
  for (let k = 0; k < NN; k++) {
    if (!inside[k]) continue;
    const y = rad[k] * dy[k];
    if (y > top) top = y;
    if (rad[k] > big) big = rad[k];
    if (y > def.ground && y < def.ground + 0.14) { foot += rad[k] * Math.hypot(dx[k], dz[k]); fc++; }
  }
  foot /= Math.max(1, fc);
  const sc = 1 / foot;                  // every rock is brought to the same radius at the ground, so "size" means the same for each
  const info = { cls: def.cls, ground: def.ground * sc, top: top * sc, big: big * sc };
  if (!out) return info;
  const at = (i, j) => (j < 0 ? 0 : j >= N ? N - 1 : j) * N + (i < 0 ? 0 : i >= N ? N - 1 : i);
  // the normal, from the surface's own neighbours in the map
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++, k++) {
    const a0 = at(i - 1, j), a1 = at(i + 1, j), b0 = at(i, j - 1), b1 = at(i, j + 1);
    const ux = rad[a1] * dx[a1] - rad[a0] * dx[a0], uy = rad[a1] * dy[a1] - rad[a0] * dy[a0], uz = rad[a1] * dz[a1] - rad[a0] * dz[a0];
    const vx = rad[b1] * dx[b1] - rad[b0] * dx[b0], vy = rad[b1] * dy[b1] - rad[b0] * dy[b0], vz = rad[b1] * dz[b1] - rad[b0] * dz[b0];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    let l = Math.hypot(nx, ny, nz);
    if (nx * dx[k] + ny * dy[k] + nz * dz[k] < 0) l = -l;
    // (round the rim of the map the directions close on the underside: there the rock is its own direction)
    if (Math.abs(l) < 1e-9 || dy[k] < -0.96 || !inside[a0] || !inside[a1] || !inside[b0] || !inside[b1]) { nx = dx[k]; ny = dy[k]; nz = dz[k]; l = 1; }
    nrm[k * 3] = nx / l; nrm[k * 3 + 1] = ny / l; nrm[k * 3 + 2] = nz / l;
  }
  // how the surface bends: normals that lean apart are an edge (proud), normals that lean together a crease (hollow)
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++, k++) {
    let c = 0;
    if (inside[k] && dy[k] > -0.9) {
      for (const q of [at(i - 1, j), at(i + 1, j), at(i, j - 1), at(i, j + 1)]) {
        const px = rad[q] * dx[q] - rad[k] * dx[k], py = rad[q] * dy[q] - rad[k] * dy[k], pz = rad[q] * dz[q] - rad[k] * dz[k];
        const d2 = px * px + py * py + pz * pz;
        if (d2 > 1e-12) c += ((nrm[q * 3] - nrm[k * 3]) * px + (nrm[q * 3 + 1] - nrm[k * 3 + 1]) * py + (nrm[q * 3 + 2] - nrm[k * 3 + 2]) * pz) / d2;
      }
      c *= 0.25 * foot;
    }
    curv[k] = c < -12 ? -12 : c > 12 ? 12 : c;
  }
  blurInto(w, curv, wide, Math.max(2, Math.round(N / 26)));          // creases shade what lies round them
  const q8 = (v) => (v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255));
  const o1 = offset, o2 = offset + NN * 4;
  for (let k = 0; k < NN; k++) {
    out[o1 + k * 4] = q8(0.5 + 0.5 * nrm[k * 3]); out[o1 + k * 4 + 1] = q8(0.5 + 0.5 * nrm[k * 3 + 1]); out[o1 + k * 4 + 2] = q8(0.5 + 0.5 * nrm[k * 3 + 2]);
    out[o1 + k * 4 + 3] = q8(rad[k] * sc / rmaxFixed);
    out[o2 + k * 4] = q8(0.5 + curv[k] * 0.035 + Math.min(0, wide[k]) * 0.12);
    out[o2 + k * 4 + 1] = q8(0.5 + 0.5 * tone[k]);
    out[o2 + k * 4 + 2] = q8(fresh[k]);
    out[o2 + k * 4 + 3] = 255;
  }
  return info;
}

/** The largest radius any shape reaches, in units of its radius at the ground: radii are stored as a share of this. */
export const SHAPE_RMAX = 2.6;

/**
 * Build the atlas, all at once (`buildRockAtlas(N)`), or a shape at a time so a frame is never held
 * up: `const a = rockAtlas(N); for (let k = 0; k < a.count; k++) a.build(k);`
 * Layer 2k is shape k's normal (rgb) and radius / SHAPE_RMAX (a); layer 2k + 1 how proud or hollow
 * the spot is (r: 0 a deep crease, 0.5 level, 1 a sharp edge), the tone of its face (g) and whether
 * that face is a fresh break (b). A shape's `ground` is the height of the ground on it and `top` its
 * highest point, in units where its radius at the ground is 1.
 */
export function rockAtlas(N = 128) {
  const w = workspace(N), K = DEFS.length;
  const atlas = { data: new Uint8Array(N * N * 4 * K * 2), size: N, layers: K * 2, count: K, rmax: SHAPE_RMAX, shapes: [], classes: [[], [], [], []],
    build(k) { atlas.shapes[k] = buildShape(k, w, atlas.data, k * 2 * N * N * 4, SHAPE_RMAX); } };
  // what each shape is and how it stands is wanted before its picture is: a coarse pass gives that at once
  const coarse = workspace(24);
  for (let k = 0; k < K; k++) { const s = buildShape(k, coarse, null, 0, SHAPE_RMAX); atlas.shapes.push(s); atlas.classes[s.cls].push(k); }
  return atlas;
}
export function buildRockAtlas(N = 128) {
  const a = rockAtlas(N);
  for (let k = 0; k < a.count; k++) a.build(k);
  return a;
}

/** Where a unit direction lies in a layer of the atlas (0..1 each way). The shader does the same sum. */
export function shapeUv(x, y, z, out) {
  const k = 0.35355339 / Math.sqrt(Math.max(1 + y, 0.02));
  out[0] = 0.5 + x * k; out[1] = 0.5 + z * k;
  return out;
}
