/*
 * Rock shapes: a small atlas of rocks, each stored as a picture of itself.
 *
 * A rock here is a star-shaped solid: from a point inside it, every direction meets the surface
 * once. So a rock is a function from direction to distance, and that function fits in a square
 * texture (the sphere of directions laid flat, equal-area, with the top of the rock in the middle
 * and its buried underside round the rim). One texture layer holds the surface's normal and the
 * distance; a second holds what a scan of a real rock would also give: how hollow or how proud
 * the spot is, the tone of the face it lies on, whether that face is a fresh break, and how much
 * the rock is bedded there.
 *
 * The rock shader (rocks.js) pushes the vertices of a plain ball out to the stored distance and
 * shades every pixel with the stored normal. Every level of detail of a rock is therefore the
 * same rock, all the shapes cost one draw call, and a boulder of eighty triangles is lit as
 * crisply as one of thirteen hundred.
 *
 * The shapes are built the way rocks are. A block is bounded by joint and fracture planes (flat,
 * with sharp arrises); corners and edges have fallen away along other joints and left steps; a
 * broken face is hackly (a mosaic of small flats, each tipped a little and stepped from the next);
 * cracks run through it; layered rock stands out in ledges of uneven thickness; lava is pitted
 * with the holes its gas left; the wind scours hollows. Nothing is a ball with lumps on it: a ball
 * half buried is a bun, and a potato above ground. No three.js here.
 */
import { gnoise3, hashU } from '../core/math.js';

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
 * block, 5 a fresh break). A rock is one part, or several fused (every part holds the centre).
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
/** A column of n sides and radius r lying along x, its ends cut at `half`, then turned: a piece of jointed lava. */
function prism(rnd, n, r, half, yaw, tilt, lean, e) {
  const planes = [], off = rnd() * 6.283;
  for (const s of [1, -1]) planes.push(face(rnd, turn(unit(s, (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3), yaw, tilt, lean), half * (0.85 + rnd() * 0.3), rnd() * 2 - 1, s > 0 ? 1 : 0));
  for (let i = 0; i < n; i++) {
    const ang = off + (i + (rnd() - 0.5) * 0.5) * 6.283 / n;
    planes.push(face(rnd, turn(unit((rnd() - 0.5) * 0.12, Math.cos(ang), Math.sin(ang)), yaw, tilt, lean), r * (0.86 + rnd() * 0.28), rnd() * 2 - 1));
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
/** Break a part's top off flat (no rock here comes to a point): a plane across it at that share of its height, leaning by up to `lean`. */
function flat(rnd, part, share, lean = 0.2) {
  const n = unit((rnd() - 0.5) * lean, 1, (rnd() - 0.5) * lean);
  part.planes.push(face(rnd, n, radiusOf(part, n) * share, rnd() * 0.8));
  return part;
}
/** Knock chips off a part's edges and corners: n small fresh breaks, which is what makes a broken rock look broken. */
const chips = (rnd, part, n, yMin = -0.35) => chop(rnd, part, n, 0.03, 0.11, yMin);
/**
 * Take a block out of a corner or an edge, leaving a step. What goes is everything beyond ALL of the given planes
 * (two planes: a length of an edge; three: a corner), each [direction, how far out it stands as a share of the
 * part's own reach that way]. What is left is not convex, but it is the parts "all of it short of plane 1", "all of
 * it short of plane 2" and so on fused, and each of those is. So this takes a list of parts and returns a longer one.
 */
function notch(rnd, parts, cuts) {
  const out = [];
  for (const part of [].concat(parts)) {
    for (const [v, share] of cuts) {
      const n = unit(v[0], v[1], v[2]);
      out.push({ e: part.e, planes: part.planes.map((pl) => pl.slice()).concat([face(rnd, n, radiusOf(part, n) * share, rnd() * 2 - 1, 1)]) });
    }
  }
  return out;
}

/*
 * The rocks. Each: its class; the lowest the ground may stand on it (`ground`, in its own units from its centre:
 * the ground is put there or higher, wherever the rock no longer overhangs its own foot); its parts (fused; `join`
 * says how sharply); and what was done to it since:
 *   uneven [slow, fine]   how far its faces are from flat, over half its width and over a hand's
 *   hackle [cells, depth] a broken surface: so many small flats to its radius, each tipped and stepped by so much
 *   cracks                [direction, offset, width, depth, wander] each: a joint that has opened
 *   beds                  { n, thick, relief, tone }: layers across direction n, standing out in ledges
 *   pits                  [cells, radius, depth, share]: gas holes, so many cells to the radius, that share of them holed
 *   scoops                [direction, radius, depth] each: a flake off, or a hollow the wind has dug
 *   lumps                 [size, wavelength]: what is left of roundness, kept small
 */
const Y = [0, 1, 0];
const DEFS = [
  // ---- broken basalt: blocks bounded by joints, corners and edges fallen away ----
  // a low block out of square, a corner gone and a length of its top edge
  (r) => ({ cls: ANGULAR, ground: -0.30, join: 5,
    parts: notch(r, notch(r, chips(r, chop(r, box(r, [1.0, 0.6, 0.78], 0.4, 0.10, 1.1, 5, 0.5), 2, 0.1, 0.26, -0.5), 2, -0.5), [[[1, 0.15, 0.1], 0.6], [[0.1, 1, 0], 0.64], [[0, 0.1, 1], 0.58]]), [[[-1, 0.2, 0.3], 0.56], [[0, 1, -0.15], 0.74]]),
    uneven: [0.010, 0.006], hackle: [3.4, 0.02], cracks: [[[0.3, 0.1, 1], 0.12, 0.03, 0.2, 0.04]], lumps: [0.004, 0.3] }),
  // a taller block with a stepped top
  (r) => ({ cls: ANGULAR, ground: -0.42, join: 5,
    parts: notch(r, chips(r, chop(r, box(r, [0.8, 0.9, 0.7], 1.3, 0.16, 0.5, 5, 0.45), 2, 0.08, 0.22, 0.2), 2), [[[0.9, 0.2, 0.3], 0.5], [[0.1, 1, 0.1], 0.58]]),
    uneven: [0.010, 0.006], hackle: [3.2, 0.02], cracks: [[[1, 0.1, -0.4], -0.1, 0.028, 0.18, 0.05]], lumps: [0.004, 0.3] }),
  // a many-sided block, its top broken off flat, one great fresh face
  (r) => ({ cls: ANGULAR, ground: -0.28, join: 5,
    parts: notch(r, flat(r, chips(r, chop(r, poly(r, 12, [1.0, 0.74, 0.85], 0.2, 0.55, 5), 2, 0.22, 0.4, 0.15), 2), 0.62, 0.3), [[[0.6, 0.7, -0.4], 0.62], [[-0.3, 0.2, -1], 0.6]]),
    uneven: [0.012, 0.006], hackle: [3.8, 0.024], scoops: [[[0.5, 0.5, 0.7], 0.4, 0.06]], lumps: [0.004, 0.3] }),
  // a length of a lava column, lying over, cracked across
  (r) => ({ cls: ANGULAR, ground: -0.30, join: 5,
    parts: notch(r, chips(r, prism(r, 6, 0.66, 1.05, 0.7, 0.2, 2.0, 5), 2), [[[1, 0.5, 0], 0.72], [[0, 1, 0.3], 0.7]]),
    uneven: [0.008, 0.006], hackle: [3.4, 0.018], cracks: [[[1, 0.05, 0.1], -0.2, 0.03, 0.22, 0.03]], lumps: [0.004, 0.3] }),
  // two blocks, one lying against the other
  (r) => ({ cls: ANGULAR, ground: -0.26, join: 5,
    parts: [shift(chips(r, chop(r, box(r, [1.0, 0.5, 0.78], 0.2, 0.08, 0.5, 5, 0.4), 2, 0.06, 0.2), 2), [0, -0.1, 0]), shift(chips(r, chop(r, box(r, [0.56, 0.6, 0.6], 2.4, 0.38, 2.0, 5, 0.5), 2, 0.08, 0.22), 2), [0.26, 0.22, -0.12])],
    uneven: [0.010, 0.006], hackle: [3.6, 0.02], lumps: [0.004, 0.3] }),
  // a block tipped over, its upper corner sheared flat and a bite out of its high side (so that it has no point)
  (r) => ({ cls: ANGULAR, ground: -0.34, join: 5,
    parts: notch(r, notch(r, chips(r, chop(r, box(r, [0.95, 0.66, 0.62], 1.9, 0.22, 0.3, 5, 0.4), 2, 0.1, 0.24, 0.5), 2), [[[-0.6, 0.8, 0.2], 0.56], [[0.3, 0.3, 1], 0.6]]), [[[0.2, 1, -0.1], 0.72], [[1, 0.1, 0.3], 0.1]]),
    uneven: [0.010, 0.006], hackle: [3.2, 0.022], cracks: [[[0.2, 1, 0.3], 0.1, 0.028, 0.16, 0.04], [[0.3, 0.1, 1], -0.12, 0.03, 0.24, 0.05]], lumps: [0.004, 0.3] }),
  // a wide low block split down the middle, one half dropped, its outline broken
  (r) => ({ cls: ANGULAR, ground: -0.16, join: 5,
    parts: notch(r, chips(r, chop(r, box(r, [1.05, 0.5, 0.86], 2.9, 0.06, 2.2, 5, 0.5), 4, 0.1, 0.34, -0.2), 2), [[[1, 0.1, 0.45], 0.16], [[0, 1, 0.1], 0.66]]),
    uneven: [0.012, 0.008], hackle: [3.6, 0.024], cracks: [[[1, 0.1, 0.45], 0.1, 0.04, 0.34, 0.09]], lumps: [0.004, 0.3] }),
  // a shattered rock: many faces at odds, deep bites out of it, no point to it
  (r) => ({ cls: ANGULAR, ground: -0.30, join: 5,
    parts: notch(r, flat(r, chips(r, chop(r, poly(r, 10, [1.0, 0.8, 0.8], 0.3, 0.8, 5), 4, 0.12, 0.34, 0.0), 2), 0.6, 0.4), [[[0.7, 0.6, -0.4], 0.56], [[-0.2, 0.7, 0.7], 0.6], [[0.6, -0.1, 0.8], 0.6]]),
    uneven: [0.012, 0.008], hackle: [4.0, 0.026], lumps: [0.004, 0.3] }),
  // a great jointed block (what falls from a wall): out of square, two joints opened, a corner gone
  (r) => ({ cls: ANGULAR, ground: -0.36, join: 5,
    parts: notch(r, chips(r, chop(r, box(r, [1.0, 0.76, 0.82], 0.9, 0.14, 2.6, 5, 0.45), 3, 0.08, 0.24, 0.2), 2), [[[1, 0.6, 0.2], 0.58], [[0.2, 1, 0.5], 0.62], [[0.1, 0.2, 1], 0.56]]),
    uneven: [0.008, 0.006], hackle: [4.2, 0.018], cracks: [[[0.1, 1, 0.05], 0.14, 0.022, 0.16, 0.03], [[1, 0.1, -0.5], -0.22, 0.026, 0.18, 0.04]], lumps: [0.004, 0.3] }),
  // ---- weathered rock: the same breaks, their arrises worn, pitted and scoured ----
  // pitted lava: many worn flats, a flake off one shoulder
  (r) => ({ cls: ROUNDED, ground: -0.34,
    parts: [flat(r, chips(r, poly(r, 18, [1.0, 0.7, 0.86], 0.16, 0.6, 5), 2), 0.74, 0.25)],
    uneven: [0.016, 0.012], hackle: [2.8, 0.02], pits: [3.4, 0.42, 0.06, 0.65], scoops: [[[0.6, 0.6, 0.5], 0.4, 0.07], [[-0.7, 0.3, -0.6], 0.3, 0.05]], lumps: [0.008, 0.4] }),
  // a boulder split in two, the halves a little apart
  (r) => ({ cls: ROUNDED, ground: -0.36,
    parts: [flat(r, chips(r, poly(r, 16, [1.0, 0.7, 0.88], 0.16, 0.6, 5), 2), 0.76, 0.3)],
    uneven: [0.016, 0.012], hackle: [2.8, 0.02], cracks: [[[1, 0.1, 0.3], 0.04, 0.045, 0.5, 0.05]], pits: [4.0, 0.38, 0.045, 0.45], lumps: [0.008, 0.4] }),
  // a worn block, flat-topped, with a ledge where a sheet has come away
  (r) => ({ cls: ROUNDED, ground: -0.32, join: 4,
    parts: notch(r, chips(r, chop(r, box(r, [0.94, 0.64, 0.8], 0.7, 0.08, 1.4, 5, 0.45), 2, 0.08, 0.24, 0.1), 2), [[[0.8, 0.5, -0.2], 0.7], [[0, 1, 0.2], 0.72]]),
    uneven: [0.016, 0.012], hackle: [2.8, 0.018], pits: [3.8, 0.4, 0.05, 0.5], scoops: [[[-0.5, 0.4, 0.75], 0.36, 0.06]], lumps: [0.008, 0.4] }),
  // a boulder broken across: its worn back, and the flat face it broke along
  (r) => ({ cls: ROUNDED, ground: -0.34,
    parts: [flat(r, chips(r, (() => { const p = poly(r, 16, [1.0, 0.72, 0.85], 0.16, 0.6, 5); p.planes.push(face(r, unit(0.9, 0.25, 0.3), 0.42, -0.5, 1)); return p; })(), 2), 0.72, 0.35)],
    uneven: [0.016, 0.012], hackle: [3.0, 0.02], pits: [3.8, 0.4, 0.05, 0.5], scoops: [[[-0.6, 0.5, 0.6], 0.34, 0.05]], lumps: [0.008, 0.4] }),
  // three worn blocks fused, deep creases between them
  (r) => ({ cls: ROUNDED, ground: -0.26, join: 4,
    parts: [chips(r, box(r, [0.8, 0.6, 0.66], 0.3, 0.14, 0.2, 5, 0.45), 2), shift(chips(r, poly(r, 8, [0.6, 0.5, 0.56], 0.14, 0.6, 5), 2), [0.46, 0.06, 0.22]), shift(chips(r, box(r, [0.5, 0.44, 0.5], 1.7, 0.3, 1.1, 5, 0.5), 2), [-0.34, 0.02, -0.3])],
    uneven: [0.016, 0.012], hackle: [2.8, 0.018], pits: [4.0, 0.4, 0.045, 0.45], lumps: [0.008, 0.4] }),
  // a rock the wind has hollowed: three scoops in a worn block
  (r) => ({ cls: ROUNDED, ground: -0.30, join: 5,
    parts: notch(r, flat(r, chips(r, chop(r, poly(r, 14, [1.0, 0.7, 0.8], 0.22, 0.7, 5), 1, 0.2, 0.36, 0.3), 2), 0.8, 0.3), [[[0.7, 0.5, 0.5], 0.66], [[0.1, 1, -0.2], 0.7]]),
    uneven: [0.016, 0.012], hackle: [2.8, 0.018], scoops: [[[0.2, 0.9, 0.3], 0.4, 0.08], [[0.9, 0.3, -0.2], 0.36, 0.08], [[-0.5, 0.4, -0.8], 0.4, 0.07]], pits: [4.4, 0.34, 0.03, 0.35], lumps: [0.008, 0.4] }),
  // ---- plates of layered rock ----
  // one thick flag, its edge broken
  (r) => ({ cls: SLAB, ground: -0.12,
    parts: [chips(r, chop(r, plate(r, 7, 0.34, 0.5, 0.85, 1.15, 0.16, 5), 2, 0.08, 0.22, 0.2), 2, 0.1)],
    uneven: [0.008, 0.005], hackle: [3.6, 0.010], beds: { n: Y, thick: 0.12, relief: 0.05, tone: 0.7 }, lumps: [0.003, 0.3] }),
  // a wide plate with a smaller one left standing on it
  (r) => ({ cls: SLAB, ground: -0.14, join: 5,
    parts: [chips(r, plate(r, 8, 0.16, 0.5, 0.9, 1.15, 0.1, 5), 3, 0.1), chips(r, plate(r, 6, 0.44, 0.5, 0.5, 0.74, 0.2, 5), 2, 0.1)],
    uneven: [0.008, 0.005], hackle: [3.6, 0.010], beds: { n: Y, thick: 0.1, relief: 0.045, tone: 0.7 }, lumps: [0.003, 0.3] }),
  // a thin flagstone, a corner off, cracked across
  (r) => ({ cls: SLAB, ground: -0.06, join: 5,
    parts: notch(r, chips(r, plate(r, 6, 0.22, 0.5, 0.88, 1.2, 0.1, 5), 3, 0.1), [[[1, 0, 0.3], 0.62], [[0.2, 1, 0], 0.55]]),
    uneven: [0.008, 0.005], hackle: [3.8, 0.010], cracks: [[[0.5, 0, 1], 0.1, 0.03, 0.3, 0.05]], beds: { n: Y, thick: 0.08, relief: 0.035, tone: 0.6 }, lumps: [0.003, 0.3] }),
  // a block of bedded rock, its layers standing out all round
  (r) => ({ cls: SLAB, ground: -0.24, join: 5,
    parts: notch(r, chips(r, chop(r, box(r, [1.0, 0.56, 0.8], 0.5, 0.05, 0.9, 5, 0.4), 2, 0.06, 0.2, 0.3), 2), [[[0.8, 0.6, 0.3], 0.64], [[0, 1, 0], 0.6]]),
    uneven: [0.008, 0.005], hackle: [3.4, 0.010], beds: { n: unit(0.06, 1, 0.04), thick: 0.13, relief: 0.07, tone: 0.8 }, lumps: [0.003, 0.3] }),
  // a plate broken in two, the pieces lying together
  (r) => ({ cls: SLAB, ground: -0.10, join: 5,
    parts: notch(r, chips(r, chop(r, plate(r, 7, 0.26, 0.5, 0.9, 1.2, 0.14, 5), 3, 0.08, 0.26, -0.1), 2, 0.1), [[[1, 0, 0.8], 0.3], [[0.1, 1, 0], 0.66]]),
    uneven: [0.010, 0.006], hackle: [3.6, 0.014], cracks: [[[1, 0, 0.8], 0.24, 0.045, 0.4, 0.1]], beds: { n: Y, thick: 0.09, relief: 0.04, tone: 0.6 }, lumps: [0.003, 0.3] }),
  // ---- stones: what a hand or a boot would move ----
  // a flat chip
  (r) => ({ cls: COBBLE, ground: -0.10, parts: [chips(r, plate(r, 5, 0.3, 0.4, 0.75, 1.15, 0.5, 5), 2, 0.0)], uneven: [0.012, 0.008], hackle: [2.4, 0.026], lumps: [0.006, 0.4] }),
  // a blocky fragment
  (r) => ({ cls: COBBLE, ground: -0.22, parts: [chips(r, chop(r, box(r, [0.9, 0.6, 0.7], 0.8, 0.3, 0.6, 5, 0.5), 2, 0.1, 0.3, 0.0), 2)], uneven: [0.012, 0.008], hackle: [2.4, 0.026], lumps: [0.006, 0.4] }),
  // a worn, pitted pebble (many flats: not a ball)
  (r) => ({ cls: COBBLE, ground: -0.20, parts: [flat(r, chips(r, poly(r, 11, [1.0, 0.6, 0.8], 0.2, 0.6, 4), 2), 0.75, 0.3)], uneven: [0.014, 0.01], hackle: [2.2, 0.018], pits: [3.2, 0.4, 0.05, 0.5], lumps: [0.008, 0.4] }),
  // a wedge with its edge broken off
  (r) => ({ cls: COBBLE, ground: -0.16, join: 5, parts: notch(r, chips(r, poly(r, 7, [1.0, 0.56, 0.74], 0.3, 0.8, 5), 2), [[[0.2, 1, 0.1], 0.6], [[1, 0.3, 0], 0.66]]), uneven: [0.012, 0.008], hackle: [2.4, 0.026], lumps: [0.006, 0.4] }),
  // a long shard
  (r) => ({ cls: COBBLE, ground: -0.14, parts: [chips(r, chop(r, prism(r, 5, 0.42, 1.0, 1.1, 0.12, 0.4, 5), 2, 0.1, 0.3, 0.0), 2)], uneven: [0.012, 0.008], hackle: [2.4, 0.026], lumps: [0.006, 0.4] }),
  // a broken lump: one fresh face, its top off
  (r) => ({ cls: COBBLE, ground: -0.22, parts: [flat(r, chips(r, chop(r, poly(r, 9, [0.9, 0.66, 0.84], 0.2, 0.6, 5), 2, 0.2, 0.4, 0.1), 2), 0.7, 0.4)], uneven: [0.012, 0.008], hackle: [2.4, 0.024], scoops: [[[-0.6, 0.6, 0.4], 0.4, 0.07]], lumps: [0.006, 0.4] }),
];
const SEEDS = [11, 23, 37, 41, 59, 61, 173, 73, 89, 97, 181, 103, 127, 139, 151, 163, 191, 197, 211, 223, 227, 229, 233, 239, 241, 251];

/** How many shapes the atlas holds. */
export const SHAPE_COUNT = DEFS.length;

/** Scratch for one atlas size: the direction each texel stands for, and working arrays. */
function workspace(N) {
  const NN = N * N;
  const w = { N, NN, dx: new Float32Array(NN), dy: new Float32Array(NN), dz: new Float32Array(NN), inside: new Uint8Array(NN),
    rad: new Float32Array(NN), rad0: new Float32Array(NN), edge: new Float32Array(NN), tone: new Float32Array(NN), fresh: new Float32Array(NN), bed: new Float32Array(NN), nrm: new Float32Array(NN * 3), curv: new Float32Array(NN), tmp: new Float32Array(NN), wide: new Float32Array(NN) };
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

/** The nearest point of a jittered lattice to (x, y, z): its distance, the next nearest's, its own number, and the way to it. */
const _cell = [0, 0, 0, 0, 0, 0];
function cellular(x, y, z, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let d1 = 9, d2 = 9, id = 0, bx = 0, by = 0, bz = 0;
  for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const h = hashU(xi + i, yi + j, zi + k, seed);
    const ox = xi + i + (h & 1023) / 1024 - x, oy = yi + j + ((h >>> 10) & 1023) / 1024 - y, oz = zi + k + ((h >>> 20) & 1023) / 1024 - z;
    const dd = ox * ox + oy * oy + oz * oz;
    if (dd < d1) { d2 = d1; d1 = dd; id = h; bx = ox; by = oy; bz = oz; } else if (dd < d2) d2 = dd;
  }
  _cell[0] = Math.sqrt(d1); _cell[1] = Math.sqrt(d2); _cell[2] = id; _cell[3] = bx; _cell[4] = by; _cell[5] = bz;
  return _cell;
}
const h01 = (a, b) => hashU(a, b, 17, 91) / 4294967296;
/** Beds: a level (-1..1) for each whole step of v, held across the bed and eased into the next at its top. */
function bedLevel(v, s) {
  const i = Math.floor(v), f = v - i, a = h01(i, s) * 2 - 1;
  if (f < 0.84) return a;
  const t = (f - 0.84) / 0.16;
  return a + (h01(i + 1, s) * 2 - 1 - a) * t * t * (3 - 2 * t);
}

/** The fused parts alone, along a unit direction: where the rock's surface was before anything weathered it. */
function partsRadius(def, d) {
  const je = def.join || 4;
  let acc = 0;
  for (const part of def.parts) acc += pow2(radiusOf(part, d), je);
  return Math.pow(acc, 1 / (1 << je));
}

/** What is asked of a shape, set out once for its texels: its definition, its seeds, and where its scoops are. */
function shapeJob(n) {
  const def = DEFS[n](rng(SEEDS[n] * 7919 + 13));
  // (a scoop is a dish cut into the surface about a point of it: where that point is, is worked out once)
  const scoops = (def.scoops || []).map(([v, r, depth]) => { const d = unit(v[0], v[1], v[2]), at = partsRadius(def, d); return [d[0] * at, d[1] * at, d[2] * at, r, depth]; });
  const cracks = def.cracks || [];
  return { def, parts: def.parts, je: def.join || 4, sd: SEEDS[n] * 3.71, isd: SEEDS[n] * 131 + 7, un: def.uneven || [0.012, 0.008], L: def.lumps || [0, 1], hk: def.hackle, pits: def.pits, beds: def.beds,
    cracks, crackN: cracks.map((c) => unit(c[0][0], c[0][1], c[0][2])), scoops };
}

/** The surface along the directions of texels k0 to k1: its distance, and the tone, freshness and bedding of the spot. */
function texels(w, job, k0, k1) {
  const { dx, dy, dz, rad, rad0, tone, fresh, bed } = w;
  const { parts, je, sd, isd, un, L, hk, pits, beds, cracks, crackN, scoops } = job;
  for (let k = k0; k < k1; k++) {
    const x = dx[k], y = dy[k], z = dz[k];
    // slow fields: each face is a little out of flat by its own mix of them, so no edge runs dead straight
    const w0 = gnoise3(x * 1.3 + sd, y * 1.3, z * 1.3 - sd), w1 = gnoise3(x * 1.3 - 7.1, y * 1.3 + sd, z * 1.3), w2 = gnoise3(x * 1.3, y * 1.3 - sd, z * 1.3 + 4.4);
    const f0 = gnoise3(x * 4.7 - sd, y * 4.7 + 3.3, z * 4.7), f1 = gnoise3(x * 4.7 + 1.9, y * 4.7, z * 4.7 + sd);
    let acc = 0, tn = 0, fr = 0;
    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi], e = part.e, pls = part.planes;
      let f = 0, ft = 0, ff = 0;
      for (let q = 0; q < pls.length; q++) {
        const pl = pls[q];
        const t = (pl[0] * x + pl[1] * y + pl[2] * z) / pl[3];
        if (t > 0.55) {                         // (a plane this far from being the surface adds nothing)
          const wt = pow2(t * (1 + un[0] * (w0 * pl[6] + w1 * pl[7] + w2 * pl[8]) + un[1] * (f0 * pl[7] + f1 * pl[6])), e);
          f += wt; ft += wt * pl[4]; ff += wt * pl[5];
        }
      }
      if (f <= 0) continue;
      const rp = Math.pow(f, -1 / (1 << e));
      const wp = pow2(rp, je);                  // fused: the largest wins
      acc += wp; tn += wp * ft / f; fr += wp * ff / f;
    }
    let r = acc > 0 ? Math.pow(acc, 1 / (1 << je)) : 1;
    if (acc > 0) { tn /= acc; fr /= acc; }
    rad0[k] = r;
    // Everything from here is laid out across the surface itself (by position, not by direction: a face near the
    // centre takes up a great deal of direction, and a pattern drawn by direction puckers in the middle of it).
    let px = x * r, py = y * r, pz = z * r;
    let bedded = 0;
    // a broken surface is hackly: small flats, each tipped its own way and standing a little proud of or behind the next
    // (a fresh break most of all; an old joint face is smoother)
    if (hk) {
      const c = cellular(px * hk[0] + sd, py * hk[0] - sd, pz * hk[0] + 2.2, isd), id = c[2];
      const gx = (id & 255) / 127.5 - 1, gy = ((id >>> 8) & 255) / 127.5 - 1, gz = ((id >>> 16) & 255) / 127.5 - 1, step = ((id >>> 24) & 255) / 127.5 - 1;
      r *= 1 + hk[1] * (0.3 + 1.2 * fr) * (0.4 * step - 1.1 * (c[3] * gx + c[4] * gy + c[5] * gz));
      tn += 0.25 * step;
    }
    // layered rock: beds of uneven thickness, the hard ones standing out as ledges on its sides, each its own tone
    if (beds) {
      const bn = beds.n, across = x * bn[0] + y * bn[1] + z * bn[2];
      const side = Math.min(1, (1 - Math.abs(across)) * 2.4);
      const u = (px * bn[0] + py * bn[1] + pz * bn[2]) / beds.thick + w0 * 0.35 + 40;
      const lv = 0.65 * bedLevel(u, isd) + 0.35 * bedLevel(u * 2.37 + 5.3, isd + 1);
      r *= 1 + beds.relief * lv * side;
      tn += beds.tone * 0.6 * bedLevel(u + 0.5, isd + 2) * side;
      bedded = side;
    }
    // joints that have opened: a narrow cleft, wandering a little
    for (let q = 0; q < cracks.length; q++) {
      const c = cracks[q], cn = crackN[q];
      const off = (px * cn[0] + py * cn[1] + pz * cn[2]) - c[1] + c[4] * (gnoise3(px * 2.1 + sd + q * 7.7, py * 2.1 - sd, pz * 2.1 + 3.1) + 0.4 * gnoise3(px * 6.3 - sd, py * 6.3 + q * 3.3, pz * 6.3));
      const g = Math.exp(-(off * off) / (c[2] * c[2]));
      r *= 1 - c[3] * g;
    }
    // flakes off, and hollows the wind has dug: dishes with a sharp rim
    for (let q = 0; q < scoops.length; q++) {
      const s = scoops[q], ox = px - s[0], oy = py - s[1], oz = pz - s[2];
      const t = 1 - (ox * ox + oy * oy + oz * oz) / (s[3] * s[3]);
      if (t > 0) { r *= 1 - s[4] * t * (1 + 0.3 * w1); fr = Math.max(fr, Math.min(1, t * 3) * 0.6); }
    }
    px = x * r; py = y * r; pz = z * r;
    // the holes gas left in lava: some cells of a lattice are holed, each its own size
    if (pits) {
      const c = cellular(px * pits[0] - sd, py * pits[0] + 5.5, pz * pits[0] + sd, isd + 3), id = c[2];
      if ((id >>> 24) / 256 < pits[3]) {
        const size = pits[1] * (0.55 + 0.45 * ((id >>> 16) & 255) / 255), t = 1 - (c[0] * c[0]) / (size * size);
        if (t > 0) r *= 1 - pits[2] * t * t * (0.5 + ((id >>> 8) & 255) / 255);
      }
    }
    // what is left of roundness
    if (L[0]) r *= 1 + L[0] * 2 * gnoise3(px / L[1] + sd, py / L[1] - sd * 0.7, pz / L[1] + 3.3);
    rad[k] = r; tone[k] = tn < -1 ? -1 : tn > 1 ? 1 : tn; fresh[k] = fr; bed[k] = bedded;
  }
}

/**
 * Measure a shape. Where the ground stands on it: as low as the rock allows without overhanging its own foot (a
 * rock that narrows toward the ground is a rock set down on a table). For each bearing and each height, how far out
 * the surface reaches; the ground goes to the lowest height at which what is above it overhangs by little.
 * @returns {{ground:number, top:number, big:number, foot:number}} in the shape's own units
 */
function measure(w, def) {
  const { NN, dx, dy, dz, inside, rad } = w;
  const BEAR = 24, BANDS = 60, lo = -1.2, bandH = 2.4 / BANDS;
  const reach = new Float32Array(BEAR * BANDS);
  let top = 0, big = 0;
  for (let k = 0; k < NN; k++) {
    if (!inside[k]) continue;
    const y = rad[k] * dy[k], rho = rad[k] * Math.hypot(dx[k], dz[k]);
    if (y > top) top = y;
    if (rad[k] > big) big = rad[k];
    const b = Math.min(BEAR - 1, Math.floor((Math.atan2(dz[k], dx[k]) / 6.2831853 + 0.5) * BEAR)), h = Math.floor((y - lo) / bandH);
    if (h >= 0 && h < BANDS && rho > reach[b * BANDS + h]) reach[b * BANDS + h] = rho;
  }
  const footAt = (h) => { let s = 0, c = 0; for (let b = 0; b < BEAR; b++) { const v = Math.max(reach[b * BANDS + h], reach[b * BANDS + h + 1]); if (v > 0) { s += v; c++; } } return c ? s / c : 0; };
  let ground = def.ground;
  for (let h = Math.max(0, Math.floor((def.ground - lo) / bandH)); h < BANDS - 4; h++) {
    const foot = footAt(h);
    let over = 0;
    for (let b = 0; b < BEAR; b++) {
      const here = Math.max(reach[b * BANDS + h], reach[b * BANDS + h + 1]);
      let above = 0;
      for (let q = h + 2; q < BANDS; q++) if (reach[b * BANDS + q] > above) above = reach[b * BANDS + q];
      if (above > here) over += above - here;
    }
    ground = lo + (h + 0.5) * bandH;
    if (foot > 0 && over / BEAR / foot <= (def.overhang === undefined ? 0.035 : def.overhang)) break;
    if (ground > top * 0.3) break;                                                    // (never buried past two thirds)
  }
  return { ground, top, big, foot: footAt(Math.max(0, Math.min(BANDS - 2, Math.floor((ground - lo) / bandH)))) || 1 };
}

/** The normal of a surface (its distance along each texel's direction), from its own neighbours in the map, into w.nrm. */
function normals(w, rad) {
  const { N, dx, dy, dz, inside, nrm } = w;
  const at = (i, j) => (j < 0 ? 0 : j >= N ? N - 1 : j) * N + (i < 0 ? 0 : i >= N ? N - 1 : i);
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
}

/** Which texels lie on an arris of the surface whose normals are in w.nrm: how far the normal turns to a neighbour, into w.edge. */
function arrises(w) {
  const { N, dy, inside, nrm, edge } = w;
  const at = (i, j) => (j < 0 ? 0 : j >= N ? N - 1 : j) * N + (i < 0 ? 0 : i >= N ? N - 1 : i);
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++, k++) {
    let e = 0;
    if (inside[k] && dy[k] > -0.93) {
      for (let q = 0; q < 4; q++) {
        const o = q === 0 ? at(i - 1, j) : q === 1 ? at(i + 1, j) : q === 2 ? at(i, j - 1) : at(i, j + 1);
        const c = 1 - (nrm[o * 3] * nrm[k * 3] + nrm[o * 3 + 1] * nrm[k * 3 + 1] + nrm[o * 3 + 2] * nrm[k * 3 + 2]);
        if (c > e) e = c;
      }
    }
    edge[k] = e > 0.035 ? e : 0;                         // (neighbours a fifteen-degree turn apart or more: an arris)
  }
}

/** For rows j0 to j1 of the map: the way from each texel to the nearest arris within SNAP_REACH texels, into `snap`. */
function snapRows(w, snap, snapAt, j0, j1) {
  const { N, edge } = w, R = SNAP_REACH;
  for (let j = j0; j < j1; j++) for (let i = 0; i < N; i++) {
    let best = (R + 0.5) * (R + 0.5), bi = 0, bj = 0, found = false;
    for (let b = Math.max(0, j - R); b <= Math.min(N - 1, j + R); b++) for (let a = Math.max(0, i - R); a <= Math.min(N - 1, i + R); a++) {
      if (!edge[b * N + a]) continue;
      const d2 = (a - i) * (a - i) + (b - j) * (b - j);
      if (d2 < best) { best = d2; bi = a; bj = b; found = true; }
    }
    let ou = 0, ov = 0;
    if (found) {
      // (the middle of the arris there: an edge is two or three texels wide)
      let su = 0, sv = 0, sw = 0;
      for (let b = Math.max(0, bj - 1); b <= Math.min(N - 1, bj + 1); b++) for (let a = Math.max(0, bi - 1); a <= Math.min(N - 1, bi + 1); a++) { const e = edge[b * N + a], wt = e * e; su += wt * a; sv += wt * b; sw += wt; }
      ou = su / sw - i; ov = sv / sw - j;
    }
    const k = j * N + i;
    snap[snapAt + k * 2] = Math.max(0, Math.min(255, Math.round(127.5 + ou * 127 / R))); snap[snapAt + k * 2 + 1] = Math.max(0, Math.min(255, Math.round(127.5 + ov * 127 / R)));
  }
}

/** How the surface bends: normals that lean apart are an edge (proud), normals that lean together a crease (hollow). Into w.curv. */
function bends(w, foot) {
  const { N, dx, dy, dz, inside, rad, nrm, curv } = w;
  const at = (i, j) => (j < 0 ? 0 : j >= N ? N - 1 : j) * N + (i < 0 ? 0 : i >= N ? N - 1 : i);
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++, k++) {
    let c = 0;
    if (inside[k] && dy[k] > -0.9) {
      for (let n = 0; n < 4; n++) {
        const q = n === 0 ? at(i - 1, j) : n === 1 ? at(i + 1, j) : n === 2 ? at(i, j - 1) : at(i, j + 1);
        const px = rad[q] * dx[q] - rad[k] * dx[k], py = rad[q] * dy[q] - rad[k] * dy[k], pz = rad[q] * dz[q] - rad[k] * dz[k];
        const d2 = px * px + py * py + pz * pz;
        if (d2 > 1e-12) c += ((nrm[q * 3] - nrm[k * 3]) * px + (nrm[q * 3 + 1] - nrm[k * 3 + 1]) * py + (nrm[q * 3 + 2] - nrm[k * 3 + 2]) * pz) / d2;
      }
      c *= 0.25 * foot;
    }
    curv[k] = c < -12 ? -12 : c > 12 ? 12 : c;
  }
}

/**
 * Work out one shape and write its two layers and the way to its arrises, a little at a time: each `next()` does a
 * few milliseconds of it, and the last returns what the shape is.
 * @returns {Generator<void, {cls:number, ground:number, top:number, big:number}>} in units where its radius at the ground is 1
 */
function* shapeSteps(n, w, out, offset, rmaxFixed, snap, snapAt) {
  const { N, NN, rad, tone, fresh, bed, nrm, curv, wide } = w;
  const job = shapeJob(n);
  for (let k = 0; k < NN; k += N * 8) { texels(w, job, k, Math.min(NN, k + N * 8)); yield; }
  const m = measure(w, job.def);
  const sc = 1 / m.foot;                // every rock is brought to the same radius at the ground, so "size" means the same for each
  const info = { cls: job.def.cls, ground: m.ground * sc, top: m.top * sc, big: m.big * sc };
  // Where the block's arrises are. A ball's vertices fall where they fall, and a rock drawn with a few hundred of
  // them has every edge planed off to the width of a triangle: a block comes out a loaf. So each texel is told the
  // way to the nearest arris of the block (of the block as it broke, before it weathered: its joints and breaks, not
  // every pit), and the rock shader moves a vertex that lies near one onto it (see snapDir). The triangles then meet
  // along the rock's edges and corners, and what lies between is flat, as the faces are.
  normals(w, w.rad0);
  arrises(w);
  yield;
  for (let j = 0; j < N; j += 16) { snapRows(w, snap, snapAt, j, Math.min(N, j + 16)); yield; }
  normals(w, rad);
  bends(w, m.foot);
  yield;
  blurInto(w, curv, wide, Math.max(2, Math.round(N / 26)));          // creases shade what lies round them
  const q8 = (v) => (v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255));
  const o1 = offset, o2 = offset + NN * 4;
  for (let k = 0; k < NN; k++) {
    out[o1 + k * 4] = q8(0.5 + 0.5 * nrm[k * 3]); out[o1 + k * 4 + 1] = q8(0.5 + 0.5 * nrm[k * 3 + 1]); out[o1 + k * 4 + 2] = q8(0.5 + 0.5 * nrm[k * 3 + 2]);
    out[o1 + k * 4 + 3] = q8(rad[k] * sc / rmaxFixed);
    out[o2 + k * 4] = q8(0.5 + curv[k] * 0.035 + Math.min(0, wide[k]) * 0.12);
    out[o2 + k * 4 + 1] = q8(0.5 + 0.5 * tone[k]);
    out[o2 + k * 4 + 2] = q8(fresh[k]);
    out[o2 + k * 4 + 3] = q8(bed[k]);
  }
  return info;
}

/** The largest radius any shape reaches, in units of its radius at the ground: radii are stored as a share of this. */
export const SHAPE_RMAX = 2.6;
/** How far off (in texels of the map) a texel knows of an arris. */
export const SNAP_REACH = 9;

/**
 * Build the atlas, all at once (`buildRockAtlas(N)`), a shape at a time (`a.build(k)`), or a few milliseconds at a
 * time so that a frame is never held up: `const it = a.steps(k); while (!it.next().done) ...` (the last step files
 * what the shape is under `a.shapes[k]`).
 * Layer 2k is shape k's normal (rgb) and radius / SHAPE_RMAX (a); layer 2k + 1 how proud or hollow
 * the spot is (r: 0 a deep crease, 0.5 level, 1 a sharp edge), the tone of its face (g), whether
 * that face is a fresh break (b) and how much the rock shows its bedding there (a). `snap` holds, two bytes a
 * texel and a layer a shape, the way to the nearest arris (see snapDir). A shape's `ground` is the height of the
 * ground on it and `top` its highest point, in units where its radius at the ground is 1; until a shape is built
 * only its class is known.
 */
export function rockAtlas(N = 128) {
  const w = workspace(N), K = DEFS.length;
  const atlas = { data: new Uint8Array(N * N * 4 * K * 2), snap: new Uint8Array(N * N * 2 * K), snapReach: SNAP_REACH, size: N, layers: K * 2, count: K, rmax: SHAPE_RMAX, shapes: [], classes: [[], [], [], []],
    * steps(k) { atlas.shapes[k] = yield* shapeSteps(k, w, atlas.data, k * 2 * N * N * 4, SHAPE_RMAX, atlas.snap, k * N * N * 2); },
    build(k) { const it = atlas.steps(k); while (!it.next().done); } };
  for (let k = 0; k < K; k++) { const cls = DEFS[k](rng(SEEDS[k] * 7919 + 13)).cls; atlas.shapes.push({ cls, ground: 0, top: 1, big: 1 }); atlas.classes[cls].push(k); }
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
/** And back: the unit direction a place in a layer stands for. */
export function uvDir(u, v, out) {
  let a = (u - 0.5) * 4, b = (v - 0.5) * 4, q = a * a + b * b;
  if (q > 3.999) { const s = Math.sqrt(3.999 / q); a *= s; b *= s; q = 3.999; }
  const s = Math.sqrt(1 - q / 4);
  out[0] = a * s; out[1] = 1 - q / 2; out[2] = b * s;
  return out;
}
/**
 * Move a ball's vertex onto the rock's nearest arris, if one lies within `reach` texels of it (a ball of few
 * triangles reaches far, one of many hardly at all: half the distance between its vertices). The direction
 * (x, y, z) is replaced in `out`. The rock shader does the same sum for every vertex.
 */
const _uv = [0, 0];
export function snapDir(atlas, shape, x, y, z, reach, out) {
  const N = atlas.size, R = atlas.snapReach;
  shapeUv(x, y, z, _uv);
  const i = Math.min(N - 1, Math.max(0, Math.floor(_uv[0] * N))), j = Math.min(N - 1, Math.max(0, Math.floor(_uv[1] * N))), o = (shape * N * N + j * N + i) * 2;
  const du = (atlas.snap[o] - 127.5) * R / 127, dv = (atlas.snap[o + 1] - 127.5) * R / 127;
  if (du * du + dv * dv > reach * reach || (Math.abs(du) < 0.02 && Math.abs(dv) < 0.02)) { out[0] = x; out[1] = y; out[2] = z; return out; }
  return uvDir(_uv[0] + du / N, _uv[1] + dv / N, out);
}
