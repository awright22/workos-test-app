#!/usr/bin/env node
/*
 * Serve static/martian for local play and for the tests:  node tools/serve.mjs [port]
 * No caching, correct MIME types, and Range support is not needed. Prints the URL.
 *
 * It serves as the published site does: every reply states its length, and what compresses (the scripts, the
 * styles, the page, and the planet's elevation file) goes out gzipped to a browser that accepts it, with the
 * compressed length stated. That matters. The game once filled a buffer of the stated length while the browser
 * handed it the uncompressed bytes, and failed to start from GitHub Pages on an iPhone; this server, which then
 * stated no length and compressed nothing, had let every test pass.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
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

const squeezed = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.bin', '.md']);

export function startServer(port = 0, dir = root) {
  const server = createServer(async (req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (url.endsWith('/')) url += 'index.html';
    const file = path.join(dir, path.normalize(url));
    if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    try {
      let data = await readFile(file);
      const ext = path.extname(file);
      const headers = { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-store' };
      if (squeezed.has(ext) && /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''))) {
        data = gzipSync(data, { level: 1 });
        headers['content-encoding'] = 'gzip'; headers.vary = 'accept-encoding';
      }
      headers['content-length'] = data.length;
      res.writeHead(200, headers);
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
