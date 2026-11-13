/*
 * The ball every rock is drawn with (see rocks.js and rock-shapes.js): the directions of a ball of
 * 20 n^2 triangles, each edge of an icosahedron cut in n. Its vertices are directions only; the rock
 * shader pushes each one out to the rock's surface. More of them look up than down, because the
 * underside of a rock is in the ground. No three.js here, so the atlas preview (tools/rock-preview.mjs)
 * draws the very same triangles as the game.
 */
const T = (1 + Math.sqrt(5)) / 2;
const ICO_V = [[-1, T, 0], [1, T, 0], [-1, -T, 0], [1, -T, 0], [0, -1, T], [0, 1, T], [0, -1, -T], [0, 1, -T], [T, 0, -1], [T, 0, 1], [-T, 0, -1], [-T, 0, 1]];
const ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

/** How far the ball's vertices are moved toward the top before they are put back on the unit sphere. */
export const BALL_LIFT = 0.2;

/**
 * @param {number} n  cuts along each edge of the icosahedron (1: the icosahedron itself)
 * @returns {{positions: Float32Array, index: Uint16Array|Uint32Array, triangles: number}} unit directions, three a
 *   vertex, shared between the triangles that meet at them
 */
export function ballMesh(n) {
  const pos = [], seen = new Map(), index = [];
  const vertex = (x, y, z) => {
    let l = 1 / Math.hypot(x, y, z);
    x *= l; y *= l; z *= l;
    const key = Math.round(x * 1e5) + ',' + Math.round(y * 1e5) + ',' + Math.round(z * 1e5);
    let i = seen.get(key);
    if (i === undefined) {
      i = pos.length / 3; seen.set(key, i);
      y += BALL_LIFT; l = 1 / Math.hypot(x, y, z);
      pos.push(x * l, y * l, z * l);
    }
    return i;
  };
  for (const f of ICO_F) {
    const a = ICO_V[f[0]], b = ICO_V[f[1]], c = ICO_V[f[2]];
    // the points of the face, row by row: i steps from a toward b, j from a toward c
    const at = (i, j) => vertex(a[0] + (b[0] - a[0]) * i / n + (c[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * i / n + (c[1] - a[1]) * j / n, a[2] + (b[2] - a[2]) * i / n + (c[2] - a[2]) * j / n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n - j; i++) {
      index.push(at(i, j), at(i + 1, j), at(i, j + 1));
      if (i + j < n - 1) index.push(at(i + 1, j), at(i + 1, j + 1), at(i, j + 1));
    }
  }
  const count = pos.length / 3;
  return { positions: new Float32Array(pos), index: count > 65535 ? new Uint32Array(index) : new Uint16Array(index), triangles: index.length / 3 };
}

/**
 * How far a vertex of the ball of n cuts may be moved to bring it onto an arris of the rock, in texels of a shape
 * map N across (see snapDir in rock-shapes.js): a little under half the distance between two of its vertices, so
 * that two neighbours are never both brought to the same place from opposite sides of a face.
 */
export function ballSnap(n, N) {
  const spacing = 1.107 / n;                             // radians between neighbouring vertices: an icosahedron's edge, cut in n
  return 0.45 * spacing * 0.25 * N;                      // (a radian is a quarter of the map's width near its middle)
}
