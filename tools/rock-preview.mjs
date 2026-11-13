#!/usr/bin/env node
/*
 * A contact sheet of the rock atlas (static/martian/src/world/rock-shapes.js), drawn without a
 * browser: every shape from two sides, standing in the ground at its own ground line, lit by a
 * sun and a sky, with dust on what faces up. For designing shapes quickly; the game's own
 * pictures (tests/shots.mjs) are the real check.
 *
 *   node tools/rock-preview.mjs [out.png] [--size 128]
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRockAtlas, shapeUv } from '../static/martian/src/world/rock-shapes.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const sizeArg = args.indexOf('--size');
const N = sizeArg >= 0 ? Number(args[sizeArg + 1]) : 128;
const out = args[0] && !args[0].startsWith('--') ? args[0] : path.join(here, 'tests', '.cache', 'rock-sheet.png');

const t0 = performance.now();
const atlas = buildRockAtlas(N);
console.log(`atlas: ${atlas.shapes.length} shapes, ${N} px, built in ${(performance.now() - t0).toFixed(0)} ms, rmax ${atlas.rmax.toFixed(3)}`);
atlas.shapes.forEach((s, i) => console.log(`  ${i}: class ${s.cls}  ground ${s.ground.toFixed(2)}  top ${s.top.toFixed(2)}  widest ${s.big.toFixed(2)}${s.big > atlas.rmax ? '  TOO BIG FOR SHAPE_RMAX' : ''}  (stands ${(s.top - s.ground).toFixed(2)} above the ground for a foot radius of 1)`));

const uv = [0, 0], smp = [0, 0, 0, 0];
function sample(layer, x, y, z) {
  shapeUv(x, y, z, uv);
  const fx = Math.min(N - 1.001, Math.max(0, uv[0] * N - 0.5)), fy = Math.min(N - 1.001, Math.max(0, uv[1] * N - 0.5));
  const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
  const o = layer * N * N * 4, a = o + (iy * N + ix) * 4, b = a + 4, c = a + N * 4, d = c + 4, D = atlas.data;
  for (let k = 0; k < 4; k++) smp[k] = ((D[a + k] * (1 - u) + D[b + k] * u) * (1 - v) + (D[c + k] * (1 - u) + D[d + k] * u) * v) / 255;
  return smp;
}
const radius = (shape, x, y, z) => sample(shape * 2, x, y, z)[3] * atlas.rmax;

const CW = 236, CH = 190, COLS = Math.ceil(atlas.shapes.length / 2), VIEWS = [[0.5, 0.2], [2.7, 0.42]];
const W = CW * COLS, H = CH * 4;
const img = new Uint8Array(W * H * 3);
const sun = (() => { const v = [-0.55, 0.62, 0.56]; const l = Math.hypot(...v); return v.map((x) => x / l); })();
const soil = [0.62, 0.40, 0.26], stone = [0.34, 0.27, 0.23];
const tone = (c) => Math.round(255 * Math.pow(Math.min(1, Math.max(0, c)), 1 / 2.2));

for (let n = 0; n < atlas.shapes.length; n++) {
  const sh = atlas.shapes[n];
  for (let vw = 0; vw < 2; vw++) {
    const [az, el] = VIEWS[vw];
    // camera axes: looking at the rock from azimuth az, elevation el
    const f = [-Math.cos(el) * Math.cos(az), -Math.sin(el), -Math.cos(el) * Math.sin(az)];
    const rx = [-Math.sin(az), 0, Math.cos(az)];
    const up = [rx[1] * f[2] - rx[2] * f[1], rx[2] * f[0] - rx[0] * f[2], rx[0] * f[1] - rx[1] * f[0]].map((x) => -x);
    const ox = (n % COLS) * CW, oy = (Math.floor(n / COLS) * 2 + vw) * CH;
    const span = 3.3;                                   // world units across the cell
    for (let py = 0; py < CH; py++) for (let px = 0; px < CW; px++) {
      const sx = (px / CW - 0.5) * span, sy = (0.62 - py / CH) * span * CH / CW;
      // ray origin on a plane 4 units out; the rock's centre is at -ground below the ground (ground at y = 0 here)
      const cy = -sh.ground;
      const o = [rx[0] * sx + up[0] * sy - f[0] * 4, rx[1] * sx + up[1] * sy - f[1] * 4 + 0.35, rx[2] * sx + up[2] * sy - f[2] * 4];
      let col = [0.80, 0.66, 0.50];                     // sky
      // the ground plane y = 0
      let tg = f[1] < 0 ? -o[1] / f[1] : Infinity;
      // march the rock
      let hit = -1, tPrev = 2.2, fPrev = 1;
      for (let t = 2.2; t < 6; t += 0.02) {
        const x = o[0] + f[0] * t, y = o[1] + f[1] * t - cy, z = o[2] + f[2] * t;
        const l = Math.hypot(x, y, z);
        const fv = l - radius(n, x / l, y / l, z / l);
        if (fv < 0) {
          let a = tPrev, b = t;
          for (let k = 0; k < 7; k++) { const m = (a + b) / 2; const mx = o[0] + f[0] * m, my = o[1] + f[1] * m - cy, mz = o[2] + f[2] * m; const ml = Math.hypot(mx, my, mz); if (ml - radius(n, mx / ml, my / ml, mz / ml) < 0) b = m; else a = m; }
          hit = (a + b) / 2; break;
        }
        tPrev = t; fPrev = fv;
      }
      if (hit > 0 && hit < tg) {
        const x = o[0] + f[0] * hit, y = o[1] + f[1] * hit - cy, z = o[2] + f[2] * hit, l = Math.hypot(x, y, z);
        const A = sample(n * 2, x / l, y / l, z / l).slice(), B = sample(n * 2 + 1, x / l, y / l, z / l).slice();
        let nx = A[0] * 2 - 1, ny = A[1] * 2 - 1, nz = A[2] * 2 - 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
        const hollow = B[0] - 0.5;
        const dust = Math.min(1, Math.max(0, (ny - 0.3 - hollow * 1.2) / 0.45));
        const ao = Math.min(1, Math.max(0.45, 0.8 + hollow * 1.6));
        const lit = Math.max(0, nx * sun[0] + ny * sun[1] + nz * sun[2]) * 1.5 + (0.32 + 0.22 * ny);
        const skirt = Math.max(0, 1 - (y + cy) / 0.1);
        col = [0, 1, 2].map((k) => (stone[k] * (1 + (B[1] - 0.5) * 0.35) * (1 - B[2] * 0.25) * (1 - dust) + soil[k] * dust) * (1 - skirt * 0.6) + soil[k] * skirt * 0.6).map((c) => c * lit * ao);
      } else if (tg < Infinity) {
        const gx = o[0] + f[0] * tg, gz = o[2] + f[2] * tg;
        // a shadow on the ground: march toward the sun from the ground point
        let shade = 1;
        for (let t = 0.03; t < 3; t += 0.04) {
          const x = gx + sun[0] * t, y = sun[1] * t - cy, z = gz + sun[2] * t, l = Math.hypot(x, y, z);
          if (l - radius(n, x / l, y / l, z / l) < 0) { shade = 0.42; break; }
        }
        const lit = (sun[1] * 1.5 * (shade < 1 ? 0 : 1) + 0.5);
        col = soil.map((c) => c * lit);
      }
      const p = ((oy + py) * W + ox + px) * 3;
      img[p] = tone(col[0]); img[p + 1] = tone(col[1]); img[p + 2] = tone(col[2]);
    }
  }
}

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
