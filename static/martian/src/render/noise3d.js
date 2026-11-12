/*
 * Tiling 3D detail textures for the ground and the rocks.
 *
 * A 2D texture projected onto a planet stretches wherever the surface does not face the
 * projection axis. A 3D texture has no projection: the surface simply cuts through it, so the
 * detail is the same size and sharpness on a plain, on a canyon wall and on a boulder, and one
 * lookup replaces the three a tri-planar projection needs.
 *
 * Each texture stores a height field in alpha and that field's gradient in RGB (the direction
 * the surface tilts), ready to bend the shading normal. Both repeat exactly in all three axes.
 *
 *   grain   : rolling fractal relief (sand, lumps, undulation: the scale depends on the lookup)
 *   pebbles : scattered rounded stones of mixed size; alpha is 0 on bare ground between them
 */
import * as THREE from 'three';

const N = 64;                       // texels along each side

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Periodic gradient-noise fBm on an N^3 grid. `cells` = lattice cells along a side at the first octave. */
function fbmField(cells, octaves, seed) {
  const h = new Float32Array(N * N * N);
  const rnd = rng(seed);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const P = cells << o;                                // lattice period of this octave
    const g = new Float32Array(P * P * P * 3);           // a random unit vector on every lattice point
    for (let i = 0; i < P * P * P; i++) {
      const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z);
      g[i * 3] = r * Math.cos(a); g[i * 3 + 1] = r * Math.sin(a); g[i * 3 + 2] = z;
    }
    const step = P / N;
    // the fade curve and lattice cell are the same for every texel along an axis: tabulate them
    const c0 = new Int32Array(N), c1 = new Int32Array(N), f = new Float32Array(N), u = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = i * step, c = Math.floor(x), t = x - c;
      c0[i] = c % P; c1[i] = (c + 1) % P; f[i] = t; u[i] = t * t * t * (t * (t * 6 - 15) + 10);
    }
    for (let k = 0, v = 0; k < N; k++) {
      const z0 = c0[k] * P * P, z1 = c1[k] * P * P, fz = f[k], uz = u[k];
      for (let j = 0; j < N; j++) {
        const y0 = c0[j] * P, y1 = c1[j] * P, fy = f[j], uy = u[j];
        for (let i = 0; i < N; i++, v++) {
          const x0 = c0[i], x1 = c1[i], fx = f[i], ux = u[i];
          const d = (ci, dx, dy, dz) => g[ci * 3] * dx + g[ci * 3 + 1] * dy + g[ci * 3 + 2] * dz;
          const n000 = d(z0 + y0 + x0, fx, fy, fz), n100 = d(z0 + y0 + x1, fx - 1, fy, fz);
          const n010 = d(z0 + y1 + x0, fx, fy - 1, fz), n110 = d(z0 + y1 + x1, fx - 1, fy - 1, fz);
          const n001 = d(z1 + y0 + x0, fx, fy, fz - 1), n101 = d(z1 + y0 + x1, fx - 1, fy, fz - 1);
          const n011 = d(z1 + y1 + x0, fx, fy - 1, fz - 1), n111 = d(z1 + y1 + x1, fx - 1, fy - 1, fz - 1);
          const a0 = n000 + (n100 - n000) * ux, a1 = n010 + (n110 - n010) * ux;
          const b0 = n001 + (n101 - n001) * ux, b1 = n011 + (n111 - n011) * ux;
          const lo = a0 + (a1 - a0) * uy, hi = b0 + (b1 - b0) * uy;
          h[v] += (lo + (hi - lo) * uz) * amp;
        }
      }
    }
    total += amp;
    amp *= 0.55;
  }
  for (let i = 0; i < h.length; i++) h[i] = h[i] / total * 1.6;            // roughly -1..1
  return h;
}

/** Scattered rounded stones: the upper envelope of spheres of mixed size, one per lattice cell at most. */
function pebbleField(cells, seed) {
  const h = new Float32Array(N * N * N);
  const rnd = rng(seed);
  const P = cells, cell = N / P;
  const pts = new Float32Array(P * P * P * 4);            // centre (texels) and radius; radius 0 = no stone
  for (let i = 0; i < P * P * P; i++) {
    const cz = Math.floor(i / (P * P)), cy = Math.floor(i / P) % P, cx = i % P;
    pts[i * 4] = (cx + 0.2 + rnd() * 0.6) * cell; pts[i * 4 + 1] = (cy + 0.2 + rnd() * 0.6) * cell; pts[i * 4 + 2] = (cz + 0.2 + rnd() * 0.6) * cell;
    const pick = rnd();
    pts[i * 4 + 3] = pick < 0.58 ? 0 : cell * (0.14 + 0.36 * Math.pow(rnd(), 2.6));
  }
  for (let k = 0, v = 0; k < N; k++) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++, v++) {
    const cx = Math.floor(i / cell), cy = Math.floor(j / cell), cz = Math.floor(k / cell);
    let best = 0;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const px = (cx + dx + P) % P, py = (cy + dy + P) % P, pz = (cz + dz + P) % P;
      const q = ((pz * P + py) * P + px) * 4, r = pts[q + 3];
      if (r === 0) continue;
      // shortest distance to the stone's centre in the periodic volume
      let ex = i - pts[q], ey = j - pts[q + 1], ez = k - pts[q + 2];
      ex -= Math.round(ex / N) * N; ey -= Math.round(ey / N) * N; ez -= Math.round(ez / N) * N;
      const d2 = (ex * ex + ey * ey + ez * ez) / (r * r);
      if (d2 < 1) { const b = Math.sqrt(1 - d2) * (r / (cell * 0.5)); if (b > best) best = b; }
    }
    h[v] = best;
  }
  return h;
}

/** Pack a height field and its gradient into an RGBA 3D texture. `gain` scales the stored gradient. */
function pack(h, gain, heightScale, heightBias) {
  const data = new Uint8Array(N * N * N * 4);
  const at = (i, j, k) => h[(((k + N) % N) * N + ((j + N) % N)) * N + ((i + N) % N)];
  const q = (x) => Math.max(0, Math.min(255, Math.round(x)));
  for (let k = 0, v = 0; k < N; k++) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++, v++) {
    const gx = (at(i + 1, j, k) - at(i - 1, j, k)) * 0.5, gy = (at(i, j + 1, k) - at(i, j - 1, k)) * 0.5, gz = (at(i, j, k + 1) - at(i, j, k - 1)) * 0.5;
    data[v * 4] = q(127.5 + gx * gain * 127.5);
    data[v * 4 + 1] = q(127.5 + gy * gain * 127.5);
    data[v * 4 + 2] = q(127.5 + gz * gain * 127.5);
    data[v * 4 + 3] = q((h[v] * heightScale + heightBias) * 255);
  }
  const tex = new THREE.Data3DTexture(data, N, N, N);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

let cache = null;
/** The two detail textures, made once and shared by every material that wants them. */
export function detailTextures() {
  if (!cache) {
    cache = {
      grain: pack(fbmField(4, 4, 7), 2.6, 0.5, 0.5),
      pebbles: pack(pebbleField(8, 23), 1.4, 1, 0),
    };
  }
  return cache;
}
