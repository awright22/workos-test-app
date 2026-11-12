// The planet's scale. One place, shared by the main thread and the terrain worker.

/** Planet radius in world metres. Mars' mean radius is 3389.5 km, so the world is about 1:282. */
export const R = 12000;
export const MARS_KM = 3389.5;
/** World metres per real kilometre along the surface (about 3.54). */
export const KM = R / MARS_KM;
/** Vertical exaggeration of the real relief, so that volcanoes and canyons read at walking scale. */
export const VSCALE = 4;
/** World metres of height per real kilometre of relief. */
export const HKM = KM * VSCALE;
/** World metres of height per real metre of relief. */
export const HM = HKM / 1000;
export const D2R = Math.PI / 180;
/** Length of a Martian sol in hours, used for the local clock. */
export const SOL_HOURS = 24.66;

/**
 * Detail textures are looked up in a frame turned away from the planet's axes, so that nowhere
 * does level ground lie along a texture axis (where a 3D texture's pattern would visibly
 * repeat). Rows of that rotation: the terrain workers bake coordinates with it, and the ground
 * shader uses it to turn texture-space gradients back into world space.
 */
export const DETAIL_FRAME = (() => {
  const [ax, ay, az] = [0.6155, 0.7854, 0.31];
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
  // Rx * Ry * Rz
  return [
    cy * cz, -cy * sz, sy,
    sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy,
    -cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy,
  ];
})();
