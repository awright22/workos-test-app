// Convenience lookups on the live planet (see planet/height.js for the height model itself).
import { ctx } from '../game/ctx.js';
import { R } from './constants.js';
import { tangentBasis } from './geo.js';
import { dirToFace } from './height.js';
import { planetGrid, meshPoint } from '../terrain/chunk.js';
import { _fe, _fn, _pv } from '../core/scratch.js';

let _grids = null, _gridPads = -1, _gridOf = null;
const _ft = [0, 0, 0], _mp = new Float64Array(8);
/**
 * Distance from the planet's centre to the ground below (or above) a world position: the ground as it
 * is DRAWN. The finest terrain mesh samples the height function every metre or three and joins the
 * samples with flat triangles; across a crest or a hollow the two differ by up to a few decimetres, and
 * a man standing on the function hovered over the picture (19 cm at the pole on the medium preset).
 * So feet, wheels, the camera and everything placed in the world stand on the very triangle the mesh
 * draws there (the same one rocks rest on: terrain/chunk.js, meshPoint).
 */
export function surfaceAt(v) {
  const P = ctx.planet;
  const l = 1 / Math.hypot(v.x, v.y, v.z), x = v.x * l, y = v.y * l, z = v.z * l;
  const mg = P.meshGrid;
  if (!mg) return P.radius(x, y, z);
  // (one table of mesh vertices per cube face, emptied when a site is levelled or it grows large)
  if (!_grids || _gridOf !== P || _gridPads !== P.pads.length) { _grids = [null, null, null, null, null, null]; _gridOf = P; _gridPads = P.pads.length; }
  dirToFace(x, y, z, _ft);
  const g = _grids[_ft[0]] || (_grids[_ft[0]] = planetGrid(P, _ft[0], mg.G, mg.level));
  if (g.cache.size > 20000) g.cache.clear();
  meshPoint(g, _ft[1], _ft[2], _mp);
  // where the ray from the centre through the place meets that triangle's plane
  const dn = x * _mp[3] + y * _mp[4] + z * _mp[5];
  return dn > 1e-6 ? (_mp[0] * _mp[3] + _mp[1] * _mp[4] + _mp[2] * _mp[5]) / dn : P.radius(x, y, z);
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
