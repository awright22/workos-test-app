// Handles created once at boot and shared by every system.
export const ctx = {
  /** @type {import('../render/engine.js').Engine} */ engine: null,
  /** @type {import('../planet/height.js').Planet} */ planet: null,
  /** @type {import('../terrain/terrain.js').Terrain} */ terrain: null,
  /** @type {import('three').Group} parent of every game object (world coordinates, origin at the planet centre) */ world: null,
  /** @type {HTMLImageElement} the shaded-relief atlas for the map screen */ mapImage: null,
};
