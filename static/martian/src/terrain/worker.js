// Terrain worker: holds a copy of the planet's height data and builds chunk meshes on request.
import { Planet } from '../planet/height.js';
import { buildChunk } from './chunk.js';

let planet = null;
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === 'init') {
    planet = new Planet(m.data);
    self.postMessage({ type: 'ready' });
  } else if (m.type === 'pads') {
    planet.pads = m.pads;
  } else if (m.type === 'build') {
    const c = buildChunk(planet, m.face, m.level, m.ix, m.iy, m.G, m.rocks);
    c.type = 'chunk';
    c.id = m.id;
    const transfer = [c.pos.buffer, c.nor.buffer, c.tex.buffer];
    if (c.rocks) transfer.push(c.rocks.buffer);
    self.postMessage(c, transfer);
  }
};
