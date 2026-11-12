/*
 * Builds one terrain chunk's vertex data. Runs in the terrain worker (and on the main thread
 * as a fallback). A chunk is a (G+1) x (G+1) grid on one cube face of the planet, plus a skirt
 * of extra vertices hanging down around its edge to hide cracks between levels of detail.
 */
import { faceToDir, FINEST } from '../planet/height.js';
import { R } from '../planet/constants.js';

const PI_4 = Math.PI / 4;
/** Detail-texture coordinates wrap every TEX_PERIOD metres; all texture scales divide it. */
export const TEX_PERIOD = 64;
const d = [0, 0, 0];

/** Approximate distance between neighbouring vertices of a chunk at `level` (world metres). */
export function chunkSpacing(level, G) { return (2 / (1 << level)) * R * PI_4 / G; }
/** Arc length of a chunk's side at a face centre (world metres). */
export function chunkSize(level) { return (2 / (1 << level)) * R * PI_4; }

export function buildChunk(planet, face, level, ix, iy, G) {
  const spacing = chunkSpacing(level, G);
  const minW = Math.max(FINEST, spacing * 1.25);
  const W = G + 3;                                   // one extra ring for normals
  const px = new Float64Array(W * W), py = new Float64Array(W * W), pz = new Float64Array(W * W);
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
      px[k] = d[0] * r; py[k] = d[1] * r; pz[k] = d[2] * r;
      if (i > 0 && j > 0 && i < W - 1 && j < W - 1) { if (r < minR) minR = r; if (r > maxR) maxR = r; }
    }
  }
  // chunk origin: the middle of the grid, so vertex coordinates stay small (float32-exact)
  const mid = (G / 2 + 1) * W + (G / 2 + 1);
  const ox = px[mid], oy = py[mid], oz = pz[mid];
  const tx = Math.floor(ox / TEX_PERIOD) * TEX_PERIOD, ty = Math.floor(oy / TEX_PERIOD) * TEX_PERIOD, tz = Math.floor(oz / TEX_PERIOD) * TEX_PERIOD;
  const N = (G + 1) * (G + 1), S = 4 * G;            // grid vertices + skirt vertices
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
      tex[v * 3] = x - tx; tex[v * 3 + 1] = y - ty; tex[v * 3 + 2] = z - tz;
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
    sv++;
  };
  for (let i = 0; i < G; i++) skirt(i, 0);          // top edge, left to right
  for (let j = 0; j < G; j++) skirt(G, j);          // right edge, top to bottom
  for (let i = G; i > 0; i--) skirt(i, G);          // bottom edge, right to left
  for (let j = G; j > 0; j--) skirt(0, j);          // left edge, bottom to top
  return { pos, nor, tex, origin: [ox, oy, oz], radius: Math.sqrt(radius2) + drop, minR, maxR };
}

/** Triangle indices shared by every chunk of grid size G (grid + skirt). */
export function chunkIndices(G) {
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
  return new Uint16Array(idx);
}
