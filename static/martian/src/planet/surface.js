// Convenience lookups on the live planet (see planet/height.js for the height model itself).
import { ctx } from '../game/ctx.js';
import { R } from './constants.js';
import { tangentBasis } from './geo.js';
import { _fe, _fn, _pv } from '../core/scratch.js';

/** Distance from the planet's centre to the ground below (or above) a world position. */
export function surfaceAt(v) {
  const l = 1 / Math.hypot(v.x, v.y, v.z);
  return ctx.planet.radius(v.x * l, v.y * l, v.z * l);
}
/** Real elevation in kilometres above the Mars datum for a unit direction. */
export function elevationKm3(ux, uy, uz) { return ctx.planet.elevationMetres(ux, uy, uz) / 1000; }
/** Steepest rise over run within `reach` metres of a unit direction (0 = flat, 1 = 45 degrees). */
export function slopeAt(u, reach = 40) {
  tangentBasis(u, _fe, _fn);
  const h0 = surfaceAt(u);
  let worst = 0;
  for (const [e, n] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    _pv.copy(u).addScaledVector(_fe, (e * reach) / R).addScaledVector(_fn, (n * reach) / R).normalize();
    worst = Math.max(worst, Math.abs(surfaceAt(_pv) - h0) / reach);
  }
  return worst;
}
/** Gradient of the ground at a world position: writes the downhill unit tangent into `out`,
 *  returns the slope (rise over run) measured over `span` metres. */
export function groundSlope(pos, span, out) {
  const l = 1 / Math.hypot(pos.x, pos.y, pos.z);
  const ux = pos.x * l, uy = pos.y * l, uz = pos.z * l;
  _pv.set(ux, uy, uz);
  tangentBasis(_pv, _fe, _fn);
  const k = span / R;
  const he = ctx.planet.radius(...norm3(ux + _fe.x * k, uy + _fe.y * k, uz + _fe.z * k)) - ctx.planet.radius(...norm3(ux - _fe.x * k, uy - _fe.y * k, uz - _fe.z * k));
  const hn = ctx.planet.radius(...norm3(ux + _fn.x * k, uy + _fn.y * k, uz + _fn.z * k)) - ctx.planet.radius(...norm3(ux - _fn.x * k, uy - _fn.y * k, uz - _fn.z * k));
  const ge = he / (2 * span), gn = hn / (2 * span);
  const g = Math.hypot(ge, gn);
  if (out) { if (g > 1e-6) out.copy(_fe).multiplyScalar(-ge / g).addScaledVector(_fn, -gn / g); else out.set(0, 0, 0); }
  return g;
}
const _n3 = [0, 0, 0];
function norm3(x, y, z) { const l = 1 / Math.hypot(x, y, z); _n3[0] = x * l; _n3[1] = y * l; _n3[2] = z * l; return _n3; }
