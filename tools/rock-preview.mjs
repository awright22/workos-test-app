#!/usr/bin/env node
/*
 * A contact sheet of the rock atlas (static/martian/src/world/rock-shapes.js), drawn without a
 * browser. Every shape is drawn as the game draws it: the same ball of triangles (world/rock-ball.js)
 * pushed out to the shape's surface, each pixel shaded by the shape's stored normal, standing in the
 * ground at its own ground line, lit by a sun and a sky, dark stone with dust on what faces up. Each
 * shape is shown from two sides at the size of a boulder a few metres off (a ball of 320 triangles)
 * and twice more at the size of a rock across the valley (80 triangles, a few dozen pixels), because
 * a shape that reads close to may be a bun or a pyramid far off. For designing shapes quickly; the
 * game's own pictures (tests/shots.mjs, tests/rock-look.mjs) are the real check.
 *
 *   node tools/rock-preview.mjs [out.png] [--size 128] [--shapes 0-7] [--cuts 4] [--nosnap]
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRockAtlas, shapeUv, snapDir } from '../static/martian/src/world/rock-shapes.js';
import { ballMesh, ballSnap } from '../static/martian/src/world/rock-ball.js';
import { gnoise3 } from '../static/martian/src/core/math.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, d) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : d; };
const N = Number(opt('--size', 128)), CUTS = Number(opt('--cuts', 4)), SNAP = !args.includes('--nosnap'), _d = [0, 0, 0];
const out = args[0] && !args[0].startsWith('--') ? args[0] : path.join(here, 'tests', '.cache', 'rock-sheet.png');

const t0 = performance.now();
const atlas = buildRockAtlas(N);
console.log(`atlas: ${atlas.shapes.length} shapes, ${N} px, built in ${(performance.now() - t0).toFixed(0)} ms, rmax ${atlas.rmax.toFixed(3)}`);
atlas.shapes.forEach((s, i) => console.log(`  ${String(i).padStart(2)}: class ${s.cls}  ground ${s.ground.toFixed(2)}  top ${s.top.toFixed(2)}  widest ${s.big.toFixed(2)}${s.big > atlas.rmax ? '  TOO BIG FOR SHAPE_RMAX' : ''}  (stands ${(s.top - s.ground).toFixed(2)} above the ground for a foot radius of 1)`));
const [from, to] = opt('--shapes', `0-${atlas.shapes.length - 1}`).split('-').map(Number);
const which = []; for (let i = from; i <= (to === undefined ? from : to); i++) which.push(i);

const uv = [0, 0];
/** One layer of the atlas along a direction, bilinear, into `o` (four numbers, 0..1). */
function sample(layer, x, y, z, o) {
  shapeUv(x, y, z, uv);
  const fx = Math.min(N - 1.001, Math.max(0, uv[0] * N - 0.5)), fy = Math.min(N - 1.001, Math.max(0, uv[1] * N - 0.5));
  const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
  const a = layer * N * N * 4 + (iy * N + ix) * 4, b = a + 4, c = a + N * 4, d = c + 4, D = atlas.data;
  for (let k = 0; k < 4; k++) o[k] = ((D[a + k] * (1 - u) + D[b + k] * u) * (1 - v) + (D[c + k] * (1 - u) + D[d + k] * u) * v) / 255;
  return o;
}
const _s = [0, 0, 0, 0], A = [0, 0, 0, 0], B = [0, 0, 0, 0];
const radius = (shape, x, y, z) => sample(shape * 2, x, y, z, _s)[3] * atlas.rmax;

const sun = (() => { const v = [-0.55, 0.62, 0.56]; const l = Math.hypot(...v); return v.map((x) => x / l); })();
const SOIL = [0.34, 0.205, 0.125], SUN = [3.0, 2.75, 2.4], SKY = [0.42, 0.36, 0.3], BOUNCE = [0.2, 0.13, 0.085];
const tone = (c) => Math.round(255 * Math.pow(Math.min(1, Math.max(0, c * 0.62)), 1 / 2.2));
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Is the point (in the rock's frame, its centre at the origin) in the rock's shadow? Marched toward the sun. */
function shaded(shape, x, y, z, far) {
  for (let t = 0.04; t < far; t += 0.045) {
    const px = x + sun[0] * t, py = y + sun[1] * t, pz = z + sun[2] * t, l = Math.hypot(px, py, pz);
    if (l < radius(shape, px / l, py / l, pz / l) - 0.03) return true;
  }
  return false;
}

/**
 * Draw one shape into the sheet: a cell cw x ch at (x0, y0), seen from azimuth az and elevation el, `ppu` pixels to
 * the rock's foot radius, with a ball of 20 cuts^2 triangles. `seed` varies the stone's tone as the game does.
 */
function draw(img, W, x0, y0, cw, ch, shape, az, el, ppu, cuts, bare) {
  const sh = atlas.shapes[shape], ball = ballMesh(cuts), P = ball.positions, I = ball.index, nv = P.length / 3;
  const f = [-Math.cos(el) * Math.cos(az), -Math.sin(el), -Math.cos(el) * Math.sin(az)];
  const rx = [-Math.sin(az), 0, Math.cos(az)];
  const up = [f[1] * rx[2] - f[2] * rx[1], f[2] * rx[0] - f[0] * rx[2], f[0] * rx[1] - f[1] * rx[0]];
  if (up[1] < 0) { up[0] = -up[0]; up[1] = -up[1]; up[2] = -up[2]; }
  const cy = -sh.ground;                                // the rock's centre above the ground (the ground is y = 0)
  const cxp = cw / 2, cyp = ch * 0.66;
  // the ball's vertices pushed out to the surface, then to the screen
  const V = new Float32Array(nv * 3), S = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    if (SNAP) snapDir(atlas, shape, P[i * 3], P[i * 3 + 1], P[i * 3 + 2], ballSnap(cuts, N), _d); else { _d[0] = P[i * 3]; _d[1] = P[i * 3 + 1]; _d[2] = P[i * 3 + 2]; }
    const dx = _d[0], dy = _d[1], dz = _d[2], r = radius(shape, dx, dy, dz);
    const x = dx * r, y = dy * r, z = dz * r;
    V[i * 3] = x; V[i * 3 + 1] = y; V[i * 3 + 2] = z;
    const wy = y + cy;
    S[i * 3] = cxp + (x * rx[0] + wy * rx[1] + z * rx[2]) * ppu; S[i * 3 + 1] = cyp - (x * up[0] + (wy - 0.3) * up[1] + z * up[2]) * ppu; S[i * 3 + 2] = x * f[0] + wy * f[1] + z * f[2];
  }
  const depth = new Float32Array(cw * ch).fill(1e9), hit = new Float32Array(cw * ch * 3), got = new Uint8Array(cw * ch);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t], b = I[t + 1], c = I[t + 2];
    const ax = S[a * 3], ay = S[a * 3 + 1], bx = S[b * 3], by = S[b * 3 + 1], qx = S[c * 3], qy = S[c * 3 + 1];
    const area = (bx - ax) * (qy - ay) - (qx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue;
    const minX = Math.max(0, Math.floor(Math.min(ax, bx, qx))), maxX = Math.min(cw - 1, Math.ceil(Math.max(ax, bx, qx)));
    const minY = Math.max(0, Math.floor(Math.min(ay, by, qy))), maxY = Math.min(ch - 1, Math.ceil(Math.max(ay, by, qy)));
    for (let py = minY; py <= maxY; py++) for (let px = minX; px <= maxX; px++) {
      const sx = px + 0.5, sy = py + 0.5;
      const w0 = ((bx - sx) * (qy - sy) - (qx - sx) * (by - sy)) / area, w1 = ((qx - sx) * (ay - sy) - (ax - sx) * (qy - sy)) / area, w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const z = w0 * S[a * 3 + 2] + w1 * S[b * 3 + 2] + w2 * S[c * 3 + 2], k = py * cw + px;
      if (z >= depth[k]) continue;
      depth[k] = z; got[k] = 1;
      hit[k * 3] = w0 * V[a * 3] + w1 * V[b * 3] + w2 * V[c * 3]; hit[k * 3 + 1] = w0 * V[a * 3 + 1] + w1 * V[b * 3 + 1] + w2 * V[c * 3 + 1]; hit[k * 3 + 2] = w0 * V[a * 3 + 2] + w1 * V[b * 3 + 2] + w2 * V[c * 3 + 2];
    }
  }
  const sd = shape * 7.3 + 1.7;
  for (let py = 0; py < ch; py++) for (let px = 0; px < cw; px++) {
    const k = py * cw + px;
    // where this pixel's ray meets the ground
    const sx = (px + 0.5 - cxp) / ppu, sy = (cyp - py - 0.5) / ppu;
    const ox = rx[0] * sx + up[0] * sy, oy = rx[1] * sx + up[1] * sy + 0.3, oz = rx[2] * sx + up[2] * sy;
    const tg = f[1] < 0 ? -oy / f[1] : Infinity, gz = tg < Infinity ? (ox + f[0] * tg) * f[0] + 0 * f[1] + (oz + f[2] * tg) * f[2] : Infinity;
    let col = [0.80, 0.66, 0.50].map((c) => c * 1.5);                     // sky
    if (got[k] && depth[k] < gz) {
      const x = hit[k * 3], y = hit[k * 3 + 1], z = hit[k * 3 + 2], l = Math.hypot(x, y, z);
      sample(shape * 2, x / l, y / l, z / l, A); sample(shape * 2 + 1, x / l, y / l, z / l, B);
      let nx = A[0] * 2 - 1, ny = A[1] * 2 - 1, nz = A[2] * 2 - 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const g1 = gnoise3(x * 5 + sd, y * 5, z * 5) * 0.5 + 0.5, g2 = gnoise3(x * 17 - sd, y * 17 + 3, z * 17) * 0.5 + 0.5, stain = gnoise3(x * 1.4 + sd, y * 1.4 - sd, z * 1.4) * 0.5 + 0.5;
      const hollow = B[0] - 0.5, high = y + cy;
      // (as the rock shader: dark stone, each face its own tone, a fresh break darker; dust on what faces the sky and
      // in the hollows, banked against the foot)
      const film = (bare ? 0.2 : 0.62) * (1 + (B[1] - 0.5) * 0.5) - B[2] * 0.12 + (stain - 0.5) * 0.24;
      const lum = SOIL[0] * 0.3 + SOIL[1] * 0.55 + SOIL[2] * 0.15;
      const k0 = 0.40 + 0.34 * Math.min(1, Math.max(0, film));
      const stone = SOIL.map((c) => (lum * 0.5 + c * 0.5) * k0);
      let dust = sstep(0.30, 0.74, ny * 0.9 + 0.1 - hollow * 1.5 - B[2] * 0.15 + (g1 - 0.5) * 0.3 + (g2 - 0.5) * 0.2 + (bare ? -0.1 : 0.06));
      const skirt = 1 - sstep(0.0, 0.1, high + (g1 - 0.5) * 0.08);
      dust = Math.max(dust, skirt * 0.85);
      const ao = (0.6 + 0.4 * sstep(0.12, 0.46, B[0])) * (0.7 + 0.3 * sstep(-0.02, 0.16, high));
      const lit = shaded(shape, x + nx * 0.03, y + ny * 0.03, z + nz * 0.03, 2.6) ? 0 : Math.max(0, nx * sun[0] + ny * sun[1] + nz * sun[2]);
      const amb = 0.5 + 0.5 * ny;
      col = [0, 1, 2].map((c) => (stone[c] * (1 - dust) + SOIL[c] * dust) * (1 + (g2 - 0.5) * 0.2) * ao * (SUN[c] * lit + SKY[c] * amb + BOUNCE[c] * (1 - amb)));
    } else if (tg < Infinity) {
      const gx = ox + f[0] * tg, gzz = oz + f[2] * tg;
      const sh0 = shaded(shape, gx, -cy, gzz, 3.2);
      // (shade close under the rock, as the game's contact shade)
      const rr = Math.hypot(gx, gzz), near = 1 - 0.35 * (1 - sstep(1.0, 1.35, rr));
      col = [0, 1, 2].map((c) => SOIL[c] * near * (SUN[c] * (sh0 ? 0 : sun[1]) + SKY[c]));
    }
    const p = ((y0 + py) * W + x0 + px) * 3;
    img[p] = tone(col[0]); img[p + 1] = tone(col[1]); img[p + 2] = tone(col[2]);
  }
}

// the sheet: a column a shape; two rows near (one of them swept bare), then a row of two far views
const CW = 236, CH = 176, FH = 64, COLS = Math.min(8, which.length), ROWS = Math.ceil(which.length / COLS);
const W = CW * COLS, H = (CH * 2 + FH) * ROWS;
const img = new Uint8Array(W * H * 3);
which.forEach((n, q) => {
  const x0 = (q % COLS) * CW, y0 = Math.floor(q / COLS) * (CH * 2 + FH);
  draw(img, W, x0, y0, CW, CH, n, 0.5, 0.2, 62, CUTS, false);
  draw(img, W, x0, y0 + CH, CW, CH, n, 2.7, 0.36, 62, CUTS, true);
  draw(img, W, x0, y0 + CH * 2, CW / 2, FH, n, 4.4, 0.12, 15, 2, false);
  draw(img, W, x0 + CW / 2, y0 + CH * 2, CW / 2, FH, n, 1.5, 0.12, 15, 2, true);
});

// a minimal PNG
const crcTable = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, body) => { const len = Buffer.alloc(4); len.writeUInt32BE(body.length); const td = Buffer.concat([Buffer.from(type), body]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(img.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', out, `(${W}x${H})`);
