/*
 * Builds one terrain chunk's vertex data. Runs in the terrain worker (and on the main thread
 * as a fallback). A chunk is a (G+1) x (G+1) grid on one cube face of the planet, plus a skirt
 * of extra vertices hanging down around its edge to hide cracks between levels of detail.
 */
import { faceToDir, FINEST } from '../planet/height.js';
import { DETAIL_FRAME as DF, R } from '../planet/constants.js';
import { gnoise3, hashU, smoothstep } from '../core/math.js';

const PI_4 = Math.PI / 4;
/** Metres across half a cube face, measured along its middle (face coordinate 1). */
const FACE_M = R * PI_4;
/** Detail-texture coordinates wrap every TEX_PERIOD metres; all texture scales divide it. */
export const TEX_PERIOD = 64;
const d = [0, 0, 0], d2 = [0, 0, 0];
// rock gardens: [x, y, z of the site, reach in metres, how many times denser at the centre]
const ROCK_GARDENS = [[19.13, 326.79, 420, 4], [22.48, 312.05, 420, 3.5], [47.97, 134.26, 420, 4.5], [-14.57, 175.47, 260, 1.5]].map(([lat, lon, reach, boost]) => {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  return [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo), reach, boost];
});

/** Approximate distance between neighbouring vertices of a chunk at `level` (world metres). */
export function chunkSpacing(level, G) { return (2 / (1 << level)) * R * PI_4 / G; }
/** Arc length of a chunk's side at a face centre (world metres). */
export function chunkSize(level) { return (2 / (1 << level)) * R * PI_4; }

/**
 * @param {'big'|'small'|null} rocks  which rocks this chunk carries, if any
 * @param {number} [fineLevel]  the deepest level this quality draws: rocks rest on the mesh of that level
 */
export function buildChunk(planet, face, level, ix, iy, G, rocks, fineLevel = level) {
  const spacing = chunkSpacing(level, G);
  const minW = Math.max(planet.finest, spacing * 1.25);
  const W = G + 3;                                   // one extra ring for normals
  const px = new Float64Array(W * W), py = new Float64Array(W * W), pz = new Float64Array(W * W), rad = new Float64Array(W * W);
  const geoIn = new Uint8Array(W * W * 4), chuteIn = new Uint8Array(W * W);
  let minR = Infinity, maxR = -Infinity;
  // global vertex indices across the whole face, so shared edges get bit-identical coordinates
  const T = G << level, unit = 2 / T, gx0 = ix * G - 1, gy0 = iy * G - 1;
  for (let j = 0, k = 0; j < W; j++) {
    const gj = gy0 + j;
    const t = gj === 0 ? -1 : gj === T ? 1 : -1 + gj * unit;
    for (let i = 0; i < W; i++, k++) {
      const gi = gx0 + i;
      const s = gi === 0 ? -1 : gi === T ? 1 : -1 + gi * unit;
      faceToDir(face, s, t, d);
      // on a face edge, ask by direction: both faces then resolve to the same face's data
      // (the same goes for the extra ring that reaches past the face, used only for normals)
      const edge = gi <= 0 || gi >= T || gj <= 0 || gj >= T;
      const r = edge ? planet.radius(d[0], d[1], d[2], minW) : planet.radiusFace(face, s, t, d[0], d[1], d[2], minW);
      px[k] = d[0] * r; py[k] = d[1] * r; pz[k] = d[2] * r; rad[k] = r;
      // (asked for now: they describe the place radius() was last called for)
      geoIn[k * 4] = Math.min(255, planet.baseSlope() * 127.5); geoIn[k * 4 + 1] = planet.flowCover() * 255;
      geoIn[k * 4 + 2] = Math.min(255, planet.flowEdge() * 255); geoIn[k * 4 + 3] = planet.padWeight() * 255;
      chuteIn[k] = Math.min(255, planet.gullyFloor() * 255);
      if (i > 0 && j > 0 && i < W - 1 && j < W - 1) { if (r < minR) minR = r; if (r > maxR) maxR = r; }
    }
  }
  // chunk origin: the middle of the grid, so vertex coordinates stay small (float32-exact)
  const mid = (G / 2 + 1) * W + (G / 2 + 1);
  const ox = px[mid], oy = py[mid], oz = pz[mid];
  // detail-texture coordinates: the position in the detail frame, less a whole number of periods
  const tx = Math.floor((DF[0] * ox + DF[1] * oy + DF[2] * oz) / TEX_PERIOD) * TEX_PERIOD;
  const ty = Math.floor((DF[3] * ox + DF[4] * oy + DF[5] * oz) / TEX_PERIOD) * TEX_PERIOD;
  const tz = Math.floor((DF[6] * ox + DF[7] * oy + DF[8] * oz) / TEX_PERIOD) * TEX_PERIOD;
  const N = (G + 1) * (G + 1), S = 4 * G;            // grid vertices + skirt vertices
  // flat-ground texture coordinates: metres across this cube face, less a whole number of
  // periods (for precision), and how close the vertex is to the face's edge (where the next
  // face's coordinates run another way, so the shader falls back to the 3D detail there).
  const us0 = Math.floor(((-1 + (gx0 + G / 2 + 1) * unit) * FACE_M) / TEX_PERIOD) * TEX_PERIOD;
  const vs0 = Math.floor(((-1 + (gy0 + G / 2 + 1) * unit) * FACE_M) / TEX_PERIOD) * TEX_PERIOD;
  const uv = new Float32Array((N + S) * 3);
  // what the place is, a byte each: the land's own slope (rise over run, halved), how much of it is the top of a
  // lava flow, how near a flow's edge, how far inside a levelled site
  const geo = new Uint8Array((N + S) * 4);
  // and how far down in a gully it lies (a spur is bare rock, a chute is floored with scree)
  const chute = new Uint8Array(N + S);
  const pos = new Float32Array((N + S) * 3);
  const nor = new Int8Array((N + S) * 3);
  const tex = new Float32Array((N + S) * 3);
  let radius2 = 0;
  for (let j = 0, v = 0; j <= G; j++) {
    for (let i = 0; i <= G; i++, v++) {
      const k = (j + 1) * W + (i + 1);
      const x = px[k], y = py[k], z = pz[k];
      const lx = x - ox, ly = y - oy, lz = z - oz;
      pos[v * 3] = lx; pos[v * 3 + 1] = ly; pos[v * 3 + 2] = lz;
      const fs = -1 + (gx0 + i + 1) * unit, ft = -1 + (gy0 + j + 1) * unit;
      const toEdge = (1 - Math.max(Math.abs(fs), Math.abs(ft))) * FACE_M * 0.7;
      uv[v * 3] = fs * FACE_M - us0; uv[v * 3 + 1] = ft * FACE_M - vs0;
      uv[v * 3 + 2] = toEdge >= 16 ? 0 : toEdge <= 5 ? 1 : 1 - (toEdge - 5) / 11;
      geo[v * 4] = geoIn[k * 4]; geo[v * 4 + 1] = geoIn[k * 4 + 1]; geo[v * 4 + 2] = geoIn[k * 4 + 2]; geo[v * 4 + 3] = geoIn[k * 4 + 3];
      chute[v] = chuteIn[k];
      tex[v * 3] = DF[0] * x + DF[1] * y + DF[2] * z - tx; tex[v * 3 + 1] = DF[3] * x + DF[4] * y + DF[5] * z - ty; tex[v * 3 + 2] = DF[6] * x + DF[7] * y + DF[8] * z - tz;
      const r2 = lx * lx + ly * ly + lz * lz;
      if (r2 > radius2) radius2 = r2;
      // normal from the neighbours (the face parametrisation is left-handed: cross(dt, ds) is outward)
      const ax = px[k + 1] - px[k - 1], ay = py[k + 1] - py[k - 1], az = pz[k + 1] - pz[k - 1];
      const bx = px[k + W] - px[k - W], by = py[k + W] - py[k - W], bz = pz[k + W] - pz[k - W];
      let nx = by * az - bz * ay, ny = bz * ax - bx * az, nz = bx * ay - by * ax;
      const inv = 127 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nor[v * 3] = Math.round(nx * inv); nor[v * 3 + 1] = Math.round(ny * inv); nor[v * 3 + 2] = Math.round(nz * inv);
    }
  }
  // skirt: copies of the edge vertices pushed toward the planet centre
  const drop = spacing * 2 + 0.5;
  let sv = N;
  const skirt = (gi, gj) => {
    const v = gj * (G + 1) + gi;
    const k = (gj + 1) * W + (gi + 1);
    const r = Math.sqrt(px[k] * px[k] + py[k] * py[k] + pz[k] * pz[k]);
    const f = drop / r;
    pos[sv * 3] = pos[v * 3] - px[k] * f; pos[sv * 3 + 1] = pos[v * 3 + 1] - py[k] * f; pos[sv * 3 + 2] = pos[v * 3 + 2] - pz[k] * f;
    nor[sv * 3] = nor[v * 3]; nor[sv * 3 + 1] = nor[v * 3 + 1]; nor[sv * 3 + 2] = nor[v * 3 + 2];
    tex[sv * 3] = tex[v * 3]; tex[sv * 3 + 1] = tex[v * 3 + 1]; tex[sv * 3 + 2] = tex[v * 3 + 2];
    uv[sv * 3] = uv[v * 3]; uv[sv * 3 + 1] = uv[v * 3 + 1]; uv[sv * 3 + 2] = uv[v * 3 + 2];
    geo[sv * 4] = geo[v * 4]; geo[sv * 4 + 1] = geo[v * 4 + 1]; geo[sv * 4 + 2] = geo[v * 4 + 2]; geo[sv * 4 + 3] = geo[v * 4 + 3];
    chute[sv] = chute[v];
    sv++;
  };
  for (let i = 0; i < G; i++) skirt(i, 0);          // top edge, left to right
  for (let j = 0; j < G; j++) skirt(G, j);          // right edge, top to bottom
  for (let i = G; i > 0; i--) skirt(i, G);          // bottom edge, right to left
  for (let j = G; j > 0; j--) skirt(0, j);          // left edge, bottom to top
  // Triangles. Each square of the grid is cut along the diagonal whose two ends are nearer in
  // height, so a crest, a ledge or the foot of a cliff runs along triangle edges. Cut all one
  // way, every edge that crosses the cut comes out as a row of teeth.
  const idx = new Uint16Array(chunkIndices(G));
  for (let j = 0, q = 0; j < G; j++) {
    for (let i = 0; i < G; i++, q += 6) {
      const k = (j + 1) * W + (i + 1);
      if (Math.abs(rad[k] - rad[k + W + 1]) < Math.abs(rad[k + 1] - rad[k + W])) {
        const a = j * (G + 1) + i, b = a + 1, c = a + G + 1, e = c + 1;
        idx[q] = a; idx[q + 1] = c; idx[q + 2] = e; idx[q + 3] = a; idx[q + 4] = e; idx[q + 5] = b;
      }
    }
  }
  const out = { pos, nor, tex, uv, geo, chute, idx, origin: [ox, oy, oz], radius: Math.sqrt(radius2) + drop, minR, maxR };
  if (rocks) {
    // stones lie on this very mesh; boulders (carried by a coarser chunk, to be seen from afar) on the finest one, which
    // is what is drawn wherever anyone is near enough to see how a boulder sits
    const grid = level === fineLevel
      ? { T, unit, at(gi, gj, C, o) { const k = (gj - gy0) * W + (gi - gx0); C[o] = px[k]; C[o + 1] = py[k]; C[o + 2] = pz[k]; C[o + 3] = rad[k]; C[o + 4] = geoIn[k * 4] / 127.5; C[o + 5] = geoIn[k * 4 + 2] / 255; C[o + 6] = geoIn[k * 4 + 1] / 255; } }
      : planetGrid(planet, face, G, fineLevel);
    out.rocks = scatterRocks(planet, face, level, ix, iy, rocks, ox, oy, oz, grid);
  }
  return out;
}

/** Triangle indices for a chunk of grid size G (grid, then skirt) with every square cut the same way:
 *  the pattern each chunk starts from. Do not write to the result. */
const _indices = new Map();
export function chunkIndices(G) {
  if (_indices.has(G)) return _indices.get(G);
  const idx = [];
  const at = (i, j) => j * (G + 1) + i;
  for (let j = 0; j < G; j++) {
    for (let i = 0; i < G; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), e = at(i + 1, j + 1);
      idx.push(a, c, b, b, c, e);
    }
  }
  // the skirt ring follows the edge clockwise as seen from outside: top, right, bottom, left
  const N = (G + 1) * (G + 1);
  const ring = [];
  for (let i = 0; i < G; i++) ring.push(at(i, 0));
  for (let j = 0; j < G; j++) ring.push(at(G, j));
  for (let i = G; i > 0; i--) ring.push(at(i, G));
  for (let j = G; j > 0; j--) ring.push(at(0, j));
  const S = ring.length;
  for (let k = 0; k < S; k++) {
    const a = ring[k], b = ring[(k + 1) % S], sa = N + k, sb = N + ((k + 1) % S);
    idx.push(a, b, sa, b, sb, sa);
  }
  const out = new Uint16Array(idx);
  _indices.set(G, out);
  return out;
}

/** Numbers per rock in a chunk's list (see scatterRocks). */
export const ROCK_STRIDE = 10;
/** What a rock is: the scatter chooses by region, the rock field (world/rocks.js) picks a shape of that kind. */
export const ROCK_ANGULAR = 0, ROCK_ROUNDED = 1, ROCK_SLAB = 2, ROCK_COBBLE = 3;

/**
 * The vertices of the terrain mesh at `level`, worked out on demand: what a rock stands on when the
 * chunk that carries it is not the one that is drawn under it. `at(gi, gj, C, o)` writes a vertex's
 * position, its radius, the land's own slope there, how near a lava flow's edge it lies and how much of it is
 * the top of a flow.
 */
export function planetGrid(planet, face, G, level) {
  const T = G << level, unit = 2 / T, minW = Math.max(planet.finest, chunkSpacing(level, G) * 1.25);
  const cache = new Map();
  return { T, unit, cache, at(gi, gj, C, o) {
    const key = gj * (T + 1) + gi;
    let c = cache.get(key);
    if (!c) {
      const s = gi <= 0 ? -1 : gi >= T ? 1 : -1 + gi * unit, t = gj <= 0 ? -1 : gj >= T ? 1 : -1 + gj * unit;
      faceToDir(face, s, t, d2);
      const edge = gi <= 0 || gi >= T || gj <= 0 || gj >= T;
      const r = edge ? planet.radius(d2[0], d2[1], d2[2], minW) : planet.radiusFace(face, s, t, d2[0], d2[1], d2[2], minW);
      c = [d2[0] * r, d2[1] * r, d2[2] * r, r, planet.baseSlope(), planet.flowEdge(), planet.flowCover()];
      cache.set(key, c);
    }
    C[o] = c[0]; C[o + 1] = c[1]; C[o + 2] = c[2]; C[o + 3] = c[3]; C[o + 4] = c[4]; C[o + 5] = c[5]; C[o + 6] = c[6];
  } };
}

const _C = new Float64Array(32);
/**
 * The point of a terrain mesh above face coordinates (s, t): on the very triangle that is drawn
 * there (each square is cut along the diagonal buildChunk chooses). Writes the point (3) and the
 * triangle's outward normal (3) into `out`, then the land's own slope, the nearness of a lava
 * flow's edge and (ninth, where `out` has room for it) how much of the place is the top of a flow.
 *
 * A rock placed by the height function itself stands on ground the mesh may not show. The mesh
 * joins its samples with flat triangles, and across a dune's crest or a crater's rim that cuts the
 * corner by up to half a metre: the rock was left in the air above its own shadow.
 */
export function meshPoint(grid, s, t, out) {
  const T = grid.T;
  let gi = Math.floor((s + 1) / grid.unit), gj = Math.floor((t + 1) / grid.unit);
  if (gi < 0) gi = 0; else if (gi > T - 1) gi = T - 1;
  if (gj < 0) gj = 0; else if (gj > T - 1) gj = T - 1;
  let fu = (s + 1) / grid.unit - gi, fv = (t + 1) / grid.unit - gj;
  fu = fu < 0 ? 0 : fu > 1 ? 1 : fu; fv = fv < 0 ? 0 : fv > 1 ? 1 : fv;
  const C = _C;
  grid.at(gi, gj, C, 0); grid.at(gi + 1, gj, C, 8); grid.at(gi, gj + 1, C, 16); grid.at(gi + 1, gj + 1, C, 24);      // a, b, c, e
  // the triangle the point is in: P = P0 + w1 (P1 - P0) + w2 (P2 - P1), as offsets into C
  let p0, p1, p2, w1, w2;
  if (Math.abs(C[3] - C[27]) < Math.abs(C[11] - C[19])) {                // this square is cut a-e
    if (fv >= fu) { p0 = 0; p1 = 16; p2 = 24; w1 = fv; w2 = fu; } else { p0 = 0; p1 = 8; p2 = 24; w1 = fu; w2 = fv; }
  } else if (fu + fv <= 1) { p0 = 8; p1 = 0; p2 = 16; w1 = 1 - fu; w2 = fv; } else { p0 = 16; p1 = 24; p2 = 8; w1 = fu; w2 = 1 - fv; }
  const ax = C[p1] - C[p0], ay = C[p1 + 1] - C[p0 + 1], az = C[p1 + 2] - C[p0 + 2];
  const bx = C[p2] - C[p1], by = C[p2 + 1] - C[p1 + 1], bz = C[p2 + 2] - C[p1 + 2];
  const x = C[p0] + ax * w1 + bx * w2, y = C[p0 + 1] + ay * w1 + by * w2, z = C[p0 + 2] + az * w1 + bz * w2;
  const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
  let l = Math.hypot(nx, ny, nz) || 1;
  if (nx * x + ny * y + nz * z < 0) l = -l;
  out[0] = x; out[1] = y; out[2] = z; out[3] = nx / l; out[4] = ny / l; out[5] = nz / l;
  out[6] = C[4]; out[7] = C[5]; out[8] = C[6];
  return out;
}

/**
 * How much of the ground at a place in a lava field is bare basalt, 0..1, as the ground's shader draws it
 * (render/terrain-material.js: `basalt`): the back of a flow, or lava that ponded and froze level. A rock there
 * is the flow's own dark rock, and no dust has drifted against it.
 * @param {number} rise  the land's own slope there, rise over run
 * @param {number} flowTop  how much of it is the top of a lava flow
 */
export function bareLava(rise, flowTop) {
  const slope = 1 - 1 / Math.sqrt(1 + rise * rise);
  return Math.max(smoothstep(0.30, 0.62, flowTop), 1 - smoothstep(0.004, 0.05, slope));
}

const _m = new Float64Array(10), _q = new Float64Array(10), _rim = new Float64Array(12), _near = [0, 0, 0];
/**
 * Rocks for one chunk, placed by a hash of the chunk's address so the same rock is always in
 * the same place. Boulder fields are patchy and denser on rough, old terrain; small stones are
 * everywhere; none lies on a cliff, a ledge's riser or a crater's wall. Returns ROCK_STRIDE
 * numbers per rock: where it meets the ground, relative to the chunk origin (3); the ground's
 * normal there (3); its radius at the ground in metres; what kind it is (the whole part: angular,
 * rounded, slab, cobble) plus a random 0..1 for shape and colour; how far to sink it so that
 * uneven ground leaves no gap under it; and whether it lies on a volcano's lava field (twice the thirds of the
 * way in, as a whole number) and how much of the ground under it is bare lava (the fraction).
 * @param {'big'|'small'} kind
 * @param {{T:number, unit:number, at:Function}} grid  the mesh it rests on (see meshPoint)
 */
export function scatterRocks(planet, face, level, ix, iy, kind, ox, oy, oz, grid) {
  const span = 2 / (1 << level);
  const s0 = -1 + ix * span, t0 = -1 + iy * span;
  const side = chunkSize(level);
  faceToDir(face, s0 + span / 2, t0 + span / 2, d);
  const rough = planet.roughness(d[0], d[1], d[2]);
  const field = gnoise3(d[0] * R / 260 + 7.7, d[1] * R / 260, d[2] * R / 260 - 3.1);       // patchy boulder fields
  const patch = Math.min(1, Math.max(0, (field + 0.15) * 1.8));
  const lat = Math.abs(d[1]);
  const big = kind === 'big';
  let density = big ? (0.0010 + 0.0085 * rough * rough) * (0.15 + 0.85 * patch) : (0.05 + 0.16 * rough) * (0.35 + 0.65 * patch);
  // stones thin out toward the poles (and nothing lies on the ice itself: the rock field sees to that, having the colour map)
  if (lat > 0.93) density *= lat > 0.985 ? 0.03 : lat > 0.97 ? 0.12 : 1 - 0.88 * (lat - 0.93) / 0.04;
  const lava = planet.lava(d[0], d[1], d[2]), lavaField = smoothstep(0, 0.36, lava);         // (the second as the ground's shader weighs it)
  density *= 1 + (big ? 3.4 : 1.6) * lava;                                                   // a lava field is strewn with its own rubble
  // the first landing sites were rock gardens, and look it in every picture sent home
  for (const g of ROCK_GARDENS) {
    const away = Math.acos(Math.min(1, d[0] * g[0] + d[1] * g[1] + d[2] * g[2])) * R;
    if (away < g[3]) density *= 1 + g[4] * (1 - away / g[3]);
  }
  // Under a wall lies what has fallen from it. Where this chunk takes in steep land (its middle or a corner), there
  // are more stones to place, and below they are kept only on the wall's lower slopes and at its foot: its benches,
  // its scree and the first of the level ground. (A canyon wall rose from clean sand with not a block at its foot.)
  let wall = 0;
  for (let q = 0; q < 5; q++) {
    faceToDir(face, s0 + span * (q === 4 ? 0.5 : q & 1 ? 0.85 : 0.15), t0 + span * (q === 4 ? 0.5 : q & 2 ? 0.85 : 0.15), d);
    planet.radius(d[0], d[1], d[2], side / 4);
    wall = Math.max(wall, Math.min(1, Math.max(0, (planet.baseSlope() - 0.14) / 0.3)));
  }
  faceToDir(face, s0 + span / 2, t0 + span / 2, d);
  // (so many to the square metre whatever the country: the plain a canyon is cut in may have almost none of its own)
  const more = 1 + wall * (1 - lava) * (big ? 0.013 : 0.09) / density;
  density *= more;
  // (most of a wall's extra stones are thrown away again below, being asked for all over the chunk and kept only at
  // the wall's foot: so many more may be asked for)
  const n = Math.min((big ? 160 : 300) * (more > 1 ? 2.5 : 1), Math.floor(side * side * density));
  const out = new Float32Array(n * ROCK_STRIDE);
  let seed = hashU(ix, iy, face, level * 7 + (big ? 1 : 2));
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  let k = 0;
  const pads = planet.pads;
  // What the rocks of a region are: a lava field breaks into angular blocks, old rough ground is mostly
  // broken rock, and on the smooth plains more of what lies about has been rounded by the wind.
  const pAng = lava > 0.3 ? 0.92 : rough > 0.5 ? 0.78 : 0.66;
  // (how steep the ground a rock will lie on: loose stones roll off at about thirty degrees; a flow's broken edge holds its
  // interlocked blocks steeper than that, and that edge is where a lava field's rubble belongs)
  const tiltMost = lava > 0.3 ? 0.84 : 0.62, tiltEasy = lava > 0.3 ? 0.5 : 0.36;
  for (let i = 0; i < n; i++) {
    const s = s0 + rnd() * span, t = t0 + rnd() * span, u = rnd(), v = rnd(), pick = rnd(), keep = rnd(), keep2 = rnd();
    faceToDir(face, s, t, d);
    let clear = true;
    for (let p = 0; p < pads.length; p++) {
      const pd = pads[p];
      const keepOut = big ? pd.r + pd.blend * 0.35 : Math.min(pd.r, 15);      // boulders stay off a whole site; stones only off its middle
      if (d[0] * pd.x + d[1] * pd.y + d[2] * pd.z > Math.cos(keepOut / R)) { clear = false; break; }
    }
    if (!clear) continue;
    // (its radius where it meets the ground: most boulders are knee-high, a few stand taller than a man; a stone is
    // nothing he cannot step over, since only boulders are in his way)
    let size = big ? Math.min(3.4, 0.38 * Math.pow(1 - u * 0.985, -0.6)) : 0.07 + 0.25 * u * u;
    meshPoint(grid, s, t, _m);
    const px = _m[0], py = _m[1], pz = _m[2];
    let nx = _m[3], ny = _m[4], nz = _m[5], drop;
    // Nothing lies on a cliff: a stone there has rolled to the foot of it. The land's own slope says where the
    // cliffs are; the mesh's says where a ledge's riser or a crater's wall is, which the land's slope cannot.
    const steep = _m[6];
    if (steep > 0.8 || (steep > 0.5 && keep < (steep - 0.5) / 0.3)) continue;
    // (on a lava field: is this the back of a flow, or a lava lake's floor, or the dust between? The whole part
    // says how far into the field the chunk lies, in thirds; the fraction how much of the ground here is bare lava.)
    const bare = lavaField > 0 ? Math.round(lavaField * 3) * 2 + Math.min(0.999, lavaField * bareLava(steep, _m[8])) : 0;
    // (the extra stones of a wall lie on the wall's own ground and within a stone's roll of its foot, not out on the
    // level beyond: the land is looked at sixteen metres off each way for something steep)
    if (more > 1) {
      let on = Math.min(1, Math.max(0, (steep - 0.13) / 0.2));
      const e = 16 / FACE_M;
      for (let q = 0; q < 4 && on < 1; q++) {
        faceToDir(face, s + (q === 0 ? e : q === 1 ? -e : 0), t + (q === 2 ? e : q === 3 ? -e : 0), _near);
        planet.radius(_near[0], _near[1], _near[2], 8);
        on = Math.max(on, Math.min(1, Math.max(0, (planet.baseSlope() - 0.3) / 0.4)));
      }
      if ((pick * 7.31) % 1 > (1 + (more - 1) * on) / more) continue;
      // (what comes down a wall is blocks, not gravel: bigger than the stones of the plain)
      if (big) size = Math.min(3.4, size * (1 + 0.6 * on * wall));
    }
    let c = nx * d[0] + ny * d[1] + nz * d[2];
    let tilt = Math.sqrt(Math.max(0, 1 - c * c)) / Math.max(c, 0.05);
    if (tilt > tiltMost || (tilt > tiltEasy && keep2 < (tilt - tiltEasy) / (tiltMost - tiltEasy))) continue;
    // (most of it along the edges of the flows, where the crust broke up as the flow crept)
    if (lava > 0 && keep > 1 - lava * 0.68 * (1 - Math.min(1, _m[7] * 1.6))) continue;
    if (size > 0.8) {
      // a boulder covers several triangles: it lies on their average, sunk until the lowest ground under its edge is covered
      const e = size * 0.8 / FACE_M;
      let ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0, hangs = false;
      for (let q = 0; q < 4; q++) {
        const sg = q & 1 ? 1 : -1;
        meshPoint(grid, q < 2 ? s + sg * e : s, q < 2 ? t : t + sg * e, _q);
        if (q < 2) { ax += sg * _q[0]; ay += sg * _q[1]; az += sg * _q[2]; } else { bx += sg * _q[0]; by += sg * _q[1]; bz += sg * _q[2]; }
        if (_q[3] * d[0] + _q[4] * d[1] + _q[5] * d[2] < 0.8) hangs = true;         // one side of it would overhang a riser
        _rim[q * 3] = _q[0]; _rim[q * 3 + 1] = _q[1]; _rim[q * 3 + 2] = _q[2];
      }
      if (hangs) continue;
      nx = by * az - bz * ay; ny = bz * ax - bx * az; nz = bx * ay - by * ax;
      let l = Math.hypot(nx, ny, nz) || 1;
      if (nx * d[0] + ny * d[1] + nz * d[2] < 0) l = -l;
      nx /= l; ny /= l; nz /= l;
      c = nx * d[0] + ny * d[1] + nz * d[2];
      tilt = Math.sqrt(Math.max(0, 1 - c * c)) / Math.max(c, 0.05);
      if (tilt > tiltMost) continue;
      let worst = 0;
      for (let q = 0; q < 4; q++) {
        const below = (px - _rim[q * 3]) * nx + (py - _rim[q * 3 + 1]) * ny + (pz - _rim[q * 3 + 2]) * nz;
        if (below > worst) worst = below;
      }
      drop = Math.min(size * 0.5, worst);
    } else {
      // (a stone has settled a little toward level: less tilted than the one triangle it lies on)
      nx = nx * 0.8 + d[0] * 0.2; ny = ny * 0.8 + d[1] * 0.2; nz = nz * 0.8 + d[2] * 0.2;
      const l = 1 / Math.hypot(nx, ny, nz);
      nx *= l; ny *= l; nz *= l;
      drop = size * 0.12 * Math.min(1, tilt);
    }
    // What kind it is. Kinds come in patches: an outcrop of layered rock sheds plates, a broken flow sheds blocks.
    const vein = gnoise3(d[0] * R / 85 + 1.3, d[1] * R / 85 - 6.1, d[2] * R / 85 + 2.9);
    const pSlab = Math.max(0.03, 0.1 + vein * 0.36);
    let cls;
    if (pick < pSlab) cls = ROCK_SLAB;
    else {
      const p = (pick - pSlab) / (1 - pSlab);
      if (big) cls = p < pAng ? ROCK_ANGULAR : ROCK_ROUNDED;
      else cls = p < 0.5 ? ROCK_COBBLE : (p - 0.5) * 2 < pAng ? ROCK_ANGULAR : ROCK_ROUNDED;
    }
    out[k++] = px - ox; out[k++] = py - oy; out[k++] = pz - oz;
    out[k++] = nx; out[k++] = ny; out[k++] = nz;
    out[k++] = size; out[k++] = cls + Math.min(0.999, v); out[k++] = drop; out[k++] = bare;
  }
  return k === out.length ? out : out.slice(0, k);
}
