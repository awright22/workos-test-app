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
