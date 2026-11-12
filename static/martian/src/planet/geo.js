// Geometry on the sphere (main thread; uses three.js vectors).
import * as THREE from 'three';
import { R, D2R } from './constants.js';
import { clamp } from '../core/math.js';

/** Unit vector for latitude and east longitude in degrees. +Y is north, lon 0 is +X, east is toward -Z. */
export function llToVec(latDeg, lonDegE, out = new THREE.Vector3()) {
  const p = latDeg * D2R, l = lonDegE * D2R;
  return out.set(Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l));
}
export function vecToLl(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { lat: Math.asin(clamp(v.y / len, -1, 1)) / D2R, lon: ((Math.atan2(-v.z, v.x) / D2R) + 360) % 360 };
}
/** Angle in radians between two unit vectors given as components (stable for small angles). */
export function angDist(ax, ay, az, bx, by, bz) {
  const dx = ax - bx, dy = ay - by, dz = az - bz;
  return 2 * Math.asin(clamp(Math.sqrt(dx * dx + dy * dy + dz * dz) / 2, 0, 1));
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
/** Great-circle distance in world metres between two world positions. */
export function groundDist(aWorld, bWorld) {
  _a.copy(aWorld).normalize(); _b.copy(bWorld).normalize();
  return angDist(_a.x, _a.y, _a.z, _b.x, _b.y, _b.z) * R;
}
/** Local east and north unit vectors at `up` (east is undefined exactly at the poles; a fixed one is used).
 *  They are the real thing: east is the way longitude grows, north the way latitude does. (Until the
 *  compass was found reading S for north, this returned west and south, and every caller but the
 *  compass and the map had quietly negated them.) */
export function tangentBasis(up, east, north) {
  east.set(up.z, 0, -up.x);
  if (east.lengthSq() < 1e-10) east.set(1, 0, 0);
  east.normalize();
  north.crossVectors(up, east);
}
const _e = new THREE.Vector3(), _n = new THREE.Vector3(), _f = new THREE.Vector3(), _x = new THREE.Vector3();
const _m = new THREE.Matrix4();
/** Orientation whose +Y is `up`, for a body that faces `yaw` radians east of north.
 *  (A body faces along its -Z, so its +Z points the opposite way.) */
export function frameQuat(up, yaw, out = new THREE.Quaternion()) {
  tangentBasis(up, _e, _n);
  _f.copy(_n).multiplyScalar(-Math.cos(yaw)).addScaledVector(_e, -Math.sin(yaw));
  _x.crossVectors(up, _f);
  _m.makeBasis(_x, up, _f);
  return out.setFromRotationMatrix(_m);
}
export function fmtDist(m) { return m > 999 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m'; }
