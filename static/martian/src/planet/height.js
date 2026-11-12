/*
 * The shape of the planet: real Mars elevation plus procedural small-scale relief.
 *
 * Used unchanged by the main thread (physics, placement, the map) and by the terrain worker
 * (mesh building), so what you stand on is exactly what is drawn. No three.js here.
 *
 * Layers, largest to smallest:
 *   1. MOLA elevation, 1024-texel equi-angular cube faces, bicubic — everything you can name
 *      on a map of Mars (resolves features down to roughly 40 m in world units).
 *   2. Procedural craters, 8–130 m across, on a hashed grid; denser where the real surface
 *      is rough (old highlands) and sparse on the smooth northern plains.
 *   3. Fractal relief, 96 m down to 3 m wavelength, amplitude scaled by the same roughness.
 *   4. Wind ripples and low dunes on the smooth ground.
 *   5. On the shield volcanoes, lava: flow lobes lying on one another and leveed channels.
 * Everything below 3 m is drawn by the terrain shader and is not part of the collision surface.
 */
import { unzlibSync } from 'fflate';
import { R, HM } from './constants.js';
import { gnoise3, hashU, clamp } from '../core/math.js';
import { LAVA_FIELDS } from './volcanoes.js';

const PI_4 = Math.PI / 4;
const INV_PI_4 = 4 / Math.PI;
/** Finest wavelength included in the collision surface and in the finest terrain mesh. */
export const FINEST = 1.5;

// ------------------------------------------------------------------------------------------
// File decoding (see tools/build_mars_data.py for the format)
// ------------------------------------------------------------------------------------------
export function decodeHeightFile(buffer) {
  const bytes = new Uint8Array(buffer);
  const dv = new DataView(buffer);
  if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== 'MH01') throw new Error('Not a Mars height file');
  const hlen = dv.getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + hlen)));
  let off = 8 + hlen;
  const size = header.n + 2 * header.pad;
  const faces = [];
  for (const f of header.faces) {
    const lo = unzlibSync(bytes.subarray(off, off + f.lo)); off += f.lo;
    const hi = unzlibSync(bytes.subarray(off, off + f.hi)); off += f.hi;
    const out = new Int16Array(size * size);
    for (let j = 0, k = 0; j < size; j++) {
      for (let i = 0; i < size; i++, k++) {
        const r = lo[k] | (hi[k] << 8);
        const v = (r >>> 1) ^ -(r & 1);
        let pred;
        if (j === 0) pred = i === 0 ? 0 : out[k - 1];
        else if (i === 0) pred = out[k - size];
        else {
          const a = out[k - 1], b = out[k - size], c = out[k - size - 1];
          const mn = a < b ? a : b, mx = a < b ? b : a;
          pred = c >= mx ? mn : c <= mn ? mx : a + b - c;
        }
        out[k] = pred + v;
      }
    }
    faces.push(out);
  }
  let rough = null;
  if (header.rough) {
    rough = { m: header.rough.m, pad: header.rough.pad, faces: [] };
    for (const len of header.rough.sizes) { rough.faces.push(unzlibSync(bytes.subarray(off, off + len))); off += len; }
  }
  return { n: header.n, pad: header.pad, q: header.q, faces, rough };
}

// ------------------------------------------------------------------------------------------
// Cube-face parametrisation (OpenGL cube-map layout; see tools/build_mars_data.py)
// ------------------------------------------------------------------------------------------
/** Unit direction for face coordinates (s, t) in [-1, 1] (equi-angular). Writes out[0..2]. */
export function faceToDir(face, s, t, out) {
  // tan(pi/4) is not exactly 1 in floating point; face edges must be, so neighbouring faces agree
  const sc = s === 1 ? 1 : s === -1 ? -1 : Math.tan(s * PI_4), tc = t === 1 ? 1 : t === -1 ? -1 : Math.tan(t * PI_4);
  let x, y, z;
  switch (face) {
    case 0: x = 1; y = -tc; z = -sc; break;
    case 1: x = -1; y = -tc; z = sc; break;
    case 2: x = sc; y = 1; z = tc; break;
    case 3: x = sc; y = -1; z = -tc; break;
    case 4: x = sc; y = -tc; z = 1; break;
    default: x = -sc; y = -tc; z = -1;
  }
  const inv = 1 / Math.sqrt(x * x + y * y + z * z);
  out[0] = x * inv; out[1] = y * inv; out[2] = z * inv;
  return out;
}

// scratch for the current sample: face, equi-angular coords, gnomonic coords
let _f = 0, _s = 0, _t = 0, _sc = 0, _tc = 0;
// slope (rise over run, exaggerated like the heights) of the elevation data at the last sample
let _slope = 0;
/** How much of the ground last asked about is a volcano's lava field, 0..1 (set by _flows). */
let _lava = 0;
/** How nearly it lies on the edge of a lava flow, 0..1: where a flow's rubble gathers (set by _flows). */
let _edge = 0;
/**
 * Lava flows come in sizes: broad old sheets, the lobes that ran over them, and the last thin
 * tongues. Each row: metres of flank per unit of noise along the flow, units of noise round the
 * cone, thickness in metres, half-width of the flow's edge in noise units, and how much of the
 * flank the flow leaves bare.
 */
const LOBES = [
  [300, 5, 4.5, 0.06, 0.02],
  [110, 13, 2.2, 0.035, 0.0],
  [48, 30, 0.9, 0.035, 0.08],
];
/** Lava channels down each volcano's flank. */
const CHANNELS = 9;
function locate(x, y, z) {
  const ax = x < 0 ? -x : x, ay = y < 0 ? -y : y, az = z < 0 ? -z : z;
  if (ax >= ay && ax >= az) {
    if (x > 0) { _f = 0; _sc = -z / ax; _tc = -y / ax; } else { _f = 1; _sc = z / ax; _tc = -y / ax; }
  } else if (ay >= az) {
    if (y > 0) { _f = 2; _sc = x / ay; _tc = z / ay; } else { _f = 3; _sc = x / ay; _tc = -z / ay; }
  } else if (z > 0) { _f = 4; _sc = x / az; _tc = -y / az; } else { _f = 5; _sc = -x / az; _tc = -y / az; }
  _s = Math.atan(_sc) * INV_PI_4;
  _t = Math.atan(_tc) * INV_PI_4;
}

// crater size classes: nominal diameter (m). Each class holds craters from 1x to 2x that size.
const CRATER_D = [64, 32, 16, 8];
/** World metres per unit of the face coordinate s at a face centre. */
const S_METRES = R * PI_4;

/** Cube face and equi-angular face coordinates of a unit direction: writes [face, s, t]. */
export function dirToFace(x, y, z, out) {
  locate(x, y, z);
  out[0] = _f; out[1] = _s; out[2] = _t;
  return out;
}

export class Planet {
  constructor(data) {
    this.n = data.n;
    this.pad = data.pad;
    this.size = data.n + 2 * data.pad;
    this.faces = data.faces;
    /** world metres of height per stored unit */
    this.unit = data.q * HM;
    /** The finest wavelength physics and placement include: that of the finest mesh this quality draws,
     *  so feet, wheels and rocks rest on the ground that is shown and not on detail it leaves out. */
    this.finest = FINEST;
    this.rough = data.rough;
    this.rsize = data.rough ? data.rough.m + 2 * data.rough.pad : 0;
    /** Levelled building sites: {x,y,z unit centre, r metres flat, blend metres, h radius, cos} */
    this.pads = [];
  }

  /** Level the ground around a unit direction: flat within r metres, easing back to the
   *  natural surface over `blend` metres. Returns the pad (send planet.pads to the workers). */
  addPad(x, y, z, r, blend) {
    const h = this.radius(x, y, z, 12);          // the site's own broad-scale height
    const pad = { x, y, z, r, blend, h, cos: Math.cos((r + blend) / R) };
    this.pads.push(pad);
    return pad;
  }

  _pad(x, y, z, r0) {
    const pads = this.pads;
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      const dot = x * p.x + y * p.y + z * p.z;
      if (dot <= p.cos) continue;
      const d = Math.sqrt(Math.max(0, 2 - 2 * dot)) * R;
      if (d >= p.r + p.blend) continue;
      let w = d <= p.r ? 1 : 1 - (d - p.r) / p.blend;
      w = w * w * (3 - 2 * w);
      r0 += (p.h - r0) * w;
    }
    return r0;
  }

  /** Real elevation in metres above the areoid (not exaggerated), bicubic. */
  elevationMetres(x, y, z) {
    locate(x, y, z);
    return this._mola() / HM;
  }

  /** Terrain roughness 0..1 at a direction (from the real surface's curvature at ~18 m). */
  roughness(x, y, z) {
    locate(x, y, z);
    return this._rough();
  }

  /** World-space distance from the planet centre to the surface along a unit direction.
   *  minW is the finest wavelength to include (FINEST for collision; larger for far meshes). */
  radius(x, y, z, minW = this.finest) {
    locate(x, y, z);
    const base = this._ledges(this._mola(), x, y, z, minW);
    const rough = this._rough();
    const flows = this._flows(x, y, z, minW);
    const r = R + base + flows + this._detail(x, y, z, rough, minW);
    return this.pads.length ? this._pad(x, y, z, r) : r;
  }

  /** How much of the ground at a unit direction is a volcano's lava field, 0..1. */
  lava(x, y, z) { this._flows(x, y, z, 1e9); return _lava; }
  /** For the place last asked about with radius() or radiusFace(): how nearly it lies on a lava flow's edge, 0..1. */
  flowEdge() { return _edge; }

  /**
   * A shield volcano is flow laid on flow. Each flow is a tongue running down the flank with a
   * steep edge a metre or a few high, and here and there a channel the lava ran in, banked by the
   * levees it built. The shapes are drawn in coordinates round the summit (distance down the
   * flank, angle round the cone), so every tongue points downhill and fans out as it goes.
   * Returns the height to add, and leaves the share of lava in _lava.
   */
  _flows(x, y, z, minW) {
    _lava = 0; _edge = 0;
    let h = 0;
    for (let i = 0; i < LAVA_FIELDS.length; i++) {
      const v = LAVA_FIELDS[i];
      const dot = x * v.x + y * v.y + z * v.z;
      if (dot <= v.cos) continue;
      const a = x * v.ex + z * v.ez, b = x * v.nx + y * v.ny + z * v.nz;
      const s = Math.sqrt(a * a + b * b);
      const d = Math.atan2(s, dot) * R;                    // metres from the summit
      const t = d / v.reach;
      if (t >= 1) continue;
      let m = t > 0.8 ? (1 - t) * 5 : 1;                   // the field thins out over its last fifth
      m = m * m * (3 - 2 * m);
      if (m > _lava) _lava = m;
      if (minW >= 60 || s < 1e-9) continue;
      // the angle round the cone as a point on a circle: nothing breaks where the angle wraps
      const ca = a / s, sa = b / s;
      const k0 = m * (t < 0.1 ? t * 10 : 1);               // at the summit the coordinates pinch: no forms there
      const warp = gnoise3(x * R / 85 + 3.3, y * R / 85 - 1.7, z * R / 85 + 9.1) * 0.55;
      for (let k = 0; k < 3; k++) {
        const L = LOBES[k];
        // a flow's edge is drawn no narrower than two cells of the mesh asking (see _ledges): with
        // distance it widens, and the flow swells and then goes
        const band = Math.max(L[3], 0.95 * minW * L[1] / d);
        if (band >= 0.4) continue;
        const w = band <= 0.2 ? 1 : (0.4 - band) * 5;
        const n = gnoise3(ca * L[1] + k * 13.7 + i * 5.1, sa * L[1] - k * 4.3, d / L[0] + warp + i * 2.9);
        let e = (n - L[4] + band) / (2 * band);            // 0 off the flow .. 1 on it
        e = e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e);
        h += e * L[2] * w * k0;
        const ed = 4 * e * (1 - e) * w * k0 * Math.min(1, L[2] / 2.2);
        if (ed > _edge) _edge = ed;
      }
      // channels: each keeps to its own slice of the cone, wanders in it, and comes and goes down the flank
      if (minW < 8 && t > 0.2 && t < 0.92) {
        const az = Math.atan2(sa, ca) * (CHANNELS / (2 * Math.PI)) + i * 0.37 + CHANNELS;
        const ki = Math.floor(az);
        const run = gnoise3(d / 260 + ki * 3.1, ki * 5.7 + i * 1.3, 0.5);
        if (run > -0.1) {
          const wander = gnoise3(d / 140 + ki * 7.31, i * 3.7 + 0.5, ki * 1.93) * 0.2;
          const off = Math.abs(az - ki - 0.5 - wander) * (2 * Math.PI / CHANNELS) * d;     // metres to the side of its line
          if (off < 20) {
            const here = clamp((run + 0.1) * 4, 0, 1) * clamp((t - 0.2) * 12, 0, 1) * clamp((0.92 - t) * 14, 0, 1);
            const bank = Math.max(3.8, 2.4 * minW);                // (as wide as the mesh can draw)
            let bed = off <= 2.2 ? 1 : off >= 2.2 + bank ? 0 : 1 - (off - 2.2) / bank;
            bed = bed * bed * (3 - 2 * bed);
            const lv = (off - 8.5) / 3.2;
            h += (-1.7 * bed + 0.8 * Math.exp(-lv * lv)) * here * m * (minW <= 4 ? 1 : (8 - minW) / 4);
          }
        }
      }
    }
    return h;
  }

  /**
   * Steep ground is layered rock, and layered rock weathers into benches and risers. Where
   * the real surface is steeper than loose material can lie, the height is re-shaped into wide
   * ledges with short steep faces between them. Gentle ground is left alone.
   */
  _ledges(base, x, y, z, minW) {
    if (_slope < 0.42) return base;
    let w = _slope >= 0.85 ? 1 : (_slope - 0.42) / 0.43;
    w = w * w * (3 - 2 * w);
    // the layers are neither level nor evenly thick: tilt and swell them with broad noise
    const tilt = gnoise3(x * R / 210 + 4.1, y * R / 210, z * R / 210 - 8.3);
    let out = base;
    // Two sizes of ledge: broad terraces that carry at a distance, and benches a man can stand on.
    // A riser is an S-curve drawn no narrower than three cells of the mesh asking: narrower or
    // sharper, and a grid of triangles cannot follow its edge, so the wall breaks into rows of
    // teeth. So with distance each riser widens and its bench shortens, until the ledge has
    // melted into the slope.
    for (let i = 0; i < 2; i++) {
      const H = i ? 7 : 20;
      const riser = Math.max(0.42, 2.4 * _slope * minW / H);        // the riser's share of each step (cells are minW / 1.25)
      if (riser >= 0.96) continue;
      const q = (base + tilt * H) / H + i * 0.37;
      const f = q - Math.floor(q);
      const bench = 1 - riser, top = bench * (0.26 / 0.64);          // a wide bench that rises a little, then the riser
      let u = (f - bench) / riser;
      u = u * u * (3 - 2 * u);
      const step = f < bench ? f * (0.26 / 0.64) : top + u * (1 - top);
      out += (step - f) * H * (i ? 0.9 : 0.5) * w;
    }
    return out;
  }

  /** As radius(), for a direction given as face coordinates; faster for mesh grids. */
  radiusFace(face, s, t, x, y, z, minW) {
    _f = face; _s = s; _t = t; _sc = Math.tan(s * PI_4); _tc = Math.tan(t * PI_4);
    const base = this._ledges(this._mola(), x, y, z, minW);
    const rough = this._rough();
    const flows = this._flows(x, y, z, minW);
    const r = R + base + flows + this._detail(x, y, z, rough, minW);
    return this.pads.length ? this._pad(x, y, z, r) : r;
  }

  _mola() {
    const n = this.n, size = this.size, g = this.faces[_f];
    let fx = (_s + 1) * 0.5 * n - 0.5 + this.pad, fy = (_t + 1) * 0.5 * n - 0.5 + this.pad;
    if (fx < 1) fx = 1; else if (fx > size - 2.0001) fx = size - 2.0001;     // stay inside the border
    if (fy < 1) fy = 1; else if (fy > size - 2.0001) fy = size - 2.0001;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const u = fx - ix, v = fy - iy;
    const u2 = u * u, u3 = u2 * u, v2 = v * v, v3 = v2 * v;
    const wx0 = (-u3 + 2 * u2 - u) * 0.5, wx1 = (3 * u3 - 5 * u2 + 2) * 0.5, wx2 = (-3 * u3 + 4 * u2 + u) * 0.5, wx3 = (u3 - u2) * 0.5;
    const wy0 = (-v3 + 2 * v2 - v) * 0.5, wy1 = (3 * v3 - 5 * v2 + 2) * 0.5, wy2 = (-3 * v3 + 4 * v2 + v) * 0.5, wy3 = (v3 - v2) * 0.5;
    let k = (iy - 1) * size + ix - 1;
    const r0 = g[k] * wx0 + g[k + 1] * wx1 + g[k + 2] * wx2 + g[k + 3] * wx3; k += size;
    const r1 = g[k] * wx0 + g[k + 1] * wx1 + g[k + 2] * wx2 + g[k + 3] * wx3; k += size;
    const r2 = g[k] * wx0 + g[k + 1] * wx1 + g[k + 2] * wx2 + g[k + 3] * wx3; k += size;
    const r3 = g[k] * wx0 + g[k + 1] * wx1 + g[k + 2] * wx2 + g[k + 3] * wx3;
    // the same sixteen samples give the slope: differentiate the weights
    const dx0 = (-3 * u2 + 4 * u - 1) * 0.5, dx1 = (9 * u2 - 10 * u) * 0.5, dx2 = (-9 * u2 + 8 * u + 1) * 0.5, dx3 = (3 * u2 - 2 * u) * 0.5;
    const dy0 = (-3 * v2 + 4 * v - 1) * 0.5, dy1 = (9 * v2 - 10 * v) * 0.5, dy2 = (-9 * v2 + 8 * v + 1) * 0.5, dy3 = (3 * v2 - 2 * v) * 0.5;
    k = (iy - 1) * size + ix - 1;
    let du = (g[k] * dx0 + g[k + 1] * dx1 + g[k + 2] * dx2 + g[k + 3] * dx3) * wy0; k += size;
    du += (g[k] * dx0 + g[k + 1] * dx1 + g[k + 2] * dx2 + g[k + 3] * dx3) * wy1; k += size;
    du += (g[k] * dx0 + g[k + 1] * dx1 + g[k + 2] * dx2 + g[k + 3] * dx3) * wy2; k += size;
    du += (g[k] * dx0 + g[k + 1] * dx1 + g[k + 2] * dx2 + g[k + 3] * dx3) * wy3;
    const dv = r0 * dy0 + r1 * dy1 + r2 * dy2 + r3 * dy3;
    _slope = Math.sqrt(du * du + dv * dv) * this.unit / (S_METRES * 2 / n);
    return (r0 * wy0 + r1 * wy1 + r2 * wy2 + r3 * wy3) * this.unit;
  }

  _rough() {
    const rg = this.rough;
    if (!rg) return 0.35;
    const m = rg.m, size = this.rsize, g = rg.faces[_f];
    const fx = (_s + 1) * 0.5 * m - 0.5 + rg.pad, fy = (_t + 1) * 0.5 * m - 0.5 + rg.pad;
    let ix = Math.floor(fx), iy = Math.floor(fy);
    if (ix < 0) ix = 0; else if (ix > size - 2) ix = size - 2;
    if (iy < 0) iy = 0; else if (iy > size - 2) iy = size - 2;
    const u = clamp(fx - ix, 0, 1), v = clamp(fy - iy, 0, 1);
    const k = iy * size + ix;
    const a = g[k] + (g[k + 1] - g[k]) * u, b = g[k + size] + (g[k + size + 1] - g[k + size]) * u;
    return (a + (b - a) * v) / 255;
  }

  _detail(x, y, z, rough, minW) {
    const px = x * R, py = y * R, pz = z * R;
    // --- fractal relief: amplitude follows the real surface's roughness -------------------
    const amp = 0.8 + 7.0 * rough * rough;                  // metres at the 96 m wavelength
    let h = 0, lam = 96, a = amp;
    for (let o = 0; o < 6; o++) {
      if (lam <= minW) break;
      const w = lam >= 2 * minW ? 1 : (lam - minW) / minW;
      const f = 1 / lam;
      let nz = gnoise3(px * f + o * 19.19, py * f - o * 7.3, pz * f + o * 3.7);
      if (o === 1 || o === 2) nz = (1 - Math.abs(nz) * 1.6) * 0.7 - 0.2;   // ridged mid scales: hummocks
      h += nz * a * w;
      lam *= 0.5; a *= 0.52;
    }
    // --- wind ripples and low dunes on smooth ground --------------------------------------
    if (minW < 14 && rough < 0.42) {
      const mask = gnoise3(px / 700 + 31.7, py / 700, pz / 700 - 12.9);
      if (mask > 0.05) {
        const k = clamp((mask - 0.05) * 4, 0, 1) * clamp((0.42 - rough) * 6, 0, 1) * (1 - _lava);   // (sand does not gather into ripple fields on a lava flow)
        const w14 = minW <= 7 ? 1 : (14 - minW) / 7;
        const lat = Math.asin(clamp(y, -1, 1)) * R;
        const warp = gnoise3(px / 55, py / 55, pz / 55) * 9 + gnoise3(px / 17 + 5, py / 17, pz / 17) * 2.2;
        const ph = (lat + warp) / 15;
        const tri = Math.abs(ph - Math.floor(ph) - 0.5) * 2;        // 0 at crest .. 1 in trough
        h += (1 - Math.pow(tri, 0.75)) * 1.15 * k * w14;
        if (minW < 2.5) {
          const ph2 = (lat * 1.03 + warp * 0.35) / 2.4;
          h += (0.5 - Math.abs(ph2 - Math.floor(ph2) - 0.5)) * 0.12 * k;
        }
      }
    }
    // --- craters -------------------------------------------------------------------------
    // local metric of the face parametrisation, so craters are round everywhere on the cube
    const sc2 = 1 + _sc * _sc, tc2 = 1 + _tc * _tc, d2 = sc2 + tc2 - 1;
    const ms = S_METRES * sc2 * Math.sqrt(tc2) / d2, mt = S_METRES * tc2 * Math.sqrt(sc2) / d2;
    const E = ms * ms, G = mt * mt, F = -ms * mt * _sc * _tc / Math.sqrt(sc2 * tc2);
    const density = 0.10 + 0.5 * rough;
    for (let c = 0; c < 4; c++) {
      const D = CRATER_D[c];
      if (D <= minW) break;
      const wgt = D >= 2 * minW ? 1 : (D - minW) / minW;
      const cell = (4 * D) / S_METRES;                      // cell size in face units
      const gx = _s / cell, gy = _t / cell;
      const cx0 = Math.floor(gx), cy0 = Math.floor(gy);
      for (let jy = -1; jy <= 1; jy++) {
        for (let jx = -1; jx <= 1; jx++) {
          const cx = cx0 + jx, cy = cy0 + jy;
          const hsh = hashU(cx, cy, _f, c + 11);
          if ((hsh & 1023) / 1023 > density) continue;
          const ox = (((hsh >>> 10) & 1023) / 1023) * 0.5 + 0.25;   // centre kept inside the cell
          const oy = (((hsh >>> 20) & 1023) / 1023) * 0.5 + 0.25;
          const cs = (cx + ox) * cell, ct = (cy + oy) * cell;
          const rad = D * (0.5 + 0.5 * ((hsh >>> 5) & 31) / 31);    // radius: D/2 .. D
          const lim = 1 - (rad * 2.1) / S_METRES;
          if (cs > lim || cs < -lim || ct > lim || ct < -lim) continue;   // not across a face edge
          const ds = _s - cs, dt = _t - ct;
          const r2 = (E * ds * ds + 2 * F * ds * dt + G * dt * dt) / (rad * rad);
          if (r2 >= 4) continue;
          const fresh = 0.18 + 0.82 * Math.pow(((hsh >>> 15) & 31) / 31, 2.2);
          const depth = rad * 0.36 * fresh, rim = rad * 0.075 * fresh;
          let ch;
          if (r2 < 1) ch = (rim + depth) * Math.pow(r2, 1.15) - depth;
          else { const r = Math.sqrt(r2); const e = 2 - r; ch = rim * e * e * e / (r * r); }
          h += ch * wgt;
        }
      }
    }
    return h;
  }
}
