/*
 * The sun's shadow: two cascades fitted to the view, after three.js's SunLightShadow.
 *
 * The stock class splits the shadow distance by a fixed rule, which at this game's distances
 * puts the first split about 25 m out and leaves the astronaut's own shadow a blur. Here the
 * split is set directly: a tight first cascade around the camera for crisp shadows of the
 * astronaut, the rover and whatever is at hand, and a second out to the shadow distance for
 * the Hab, boulders and terrain.
 */
import { Vector3, Matrix4 } from 'three';
import { SunLightShadow } from 'three/addons/lights/SunLightShadow.js';

const FADE = 0.12;               // part of each cascade's depth that blends into the next
const _orient = new Matrix4(), _toLight = new Matrix4();
const _dir = new Vector3(), _up = new Vector3(), _c = new Vector3();
const _near = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const _far = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const _corner = [];
for (let i = 0; i < 8; i++) _corner.push(new Vector3());

export class SunShadow extends SunLightShadow {
  constructor() {
    super();
    /** View depth (m) where the first cascade hands over to the second. */
    this.split = 14;
  }

  updateMatrices(light, viewCamera) {
    if (viewCamera === undefined) return;
    const n = this._cameras.length;
    const insetX = Math.min(0.25, (Math.ceil(this.radius) + 1) / this.mapSize.x);
    const insetY = Math.min(0.25, (Math.ceil(this.radius) + 1) / this.mapSize.y);
    for (let i = 0; i < n; i++) this._viewports[i].set(i + insetX, insetY, 1 - 2 * insetX, 1 - 2 * insetY);
    const res = Math.min(this.mapSize.x * (1 - 2 * insetX), this.mapSize.y * (1 - 2 * insetY));
    const camNear = viewCamera.near;
    const camFar = Math.max(camNear + 1e-6, Math.min(this.camera.far, viewCamera.far));
    const splits = [camNear, Math.min(this.split, camFar * 0.6), camFar];

    _dir.setFromMatrixPosition(light.matrixWorld).negate().normalize();
    _up.set(0, 1, 0);
    if (Math.abs(_up.dot(_dir)) > 0.99) _up.set(0, 0, 1);
    _orient.lookAt(_c.set(0, 0, 0), _dir, _up);
    _toLight.copy(_orient).transpose().multiply(viewCamera.matrixWorld);
    // corners of the view frustum in light space (a rotation, so distances are kept)
    let maxZ = -Infinity;
    for (let i = 0; i < 4; i++) {
      const x = i === 0 || i === 1 ? 1 : -1, y = i === 0 || i === 3 ? 1 : -1;
      const a = _near[i].set(x, y, -1).applyMatrix4(viewCamera.projectionMatrixInverse);
      const b = _far[i].copy(a).multiplyScalar(camFar / camNear);
      a.applyMatrix4(_toLight); b.applyMatrix4(_toLight);
      maxZ = Math.max(maxZ, a.z, b.z);
    }
    maxZ += camFar;                                   // casters up to one shadow distance toward the sun still count
    const shadowNear = this.camera.near;
    for (let i = 0; i < n; i++) {
      const from = i === 0 ? splits[0] : this._cascadeData[i - 1].z;        // overlap the previous cascade's fade band
      const to = splits[i + 1];
      const fadeStart = to - FADE * (to - splits[i]);
      this._cascadeData[i].set(i === 0 ? -1e10 : from, to, fadeStart, 0);
      const ta = (from - camNear) / (camFar - camNear), tb = (to - camNear) / (camFar - camNear);
      _c.set(0, 0, 0);
      for (let j = 0; j < 4; j++) {
        _corner[j * 2].lerpVectors(_near[j], _far[j], ta);
        _corner[j * 2 + 1].lerpVectors(_near[j], _far[j], tb);
        _c.add(_corner[j * 2]).add(_corner[j * 2 + 1]);
      }
      _c.multiplyScalar(1 / 8);
      let r2 = 0, minZ = Infinity;
      for (let j = 0; j < 8; j++) { r2 = Math.max(r2, _corner[j].distanceToSquared(_c)); minZ = Math.min(minZ, _corner[j].z); }
      let radius = Math.sqrt(r2);
      if (res > 1) {                                  // snap to whole texels so the shadow does not shimmer as the camera moves
        radius /= 1 - 1 / res;
        const texel = 2 * radius / res;
        _c.x = Math.round(_c.x / texel) * texel;
        _c.y = Math.round(_c.y / texel) * texel;
      }
      _c.z = maxZ + shadowNear;
      _c.applyMatrix4(_orient);
      const cam = this._cameras[i];
      cam.position.copy(_c);
      cam.quaternion.setFromRotationMatrix(_orient);
      cam.left = -radius; cam.right = radius; cam.top = radius; cam.bottom = -radius;
      cam.near = shadowNear;
      cam.far = maxZ - minZ + 2 * shadowNear;
      cam.coordinateSystem = this.camera.coordinateSystem;
      cam._reversedDepth = this.camera.reversedDepth;
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();
      this._updateMatrix(cam, this._matrices[i], this._frustums[i], this._viewports[i]);
    }
  }
}
