#!/usr/bin/env node
/*
 * Serve static/martian for local play and for the tests:  node tools/serve.mjs [port]
 * No caching, correct MIME types, and Range support is not needed. Prints the URL.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(path.dirname(tools), 'static', 'martian');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
};

export function startServer(port = 0, dir = root) {
  const server = createServer(async (req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (url.endsWith('/')) url += 'index.html';
    const file = path.join(dir, path.normalize(url));
    if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { port } = await startServer(Number(process.argv[2]) || 8765);
  console.log(`Stranded II at http://127.0.0.1:${port}/`);
}
