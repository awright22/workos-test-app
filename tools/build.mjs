#!/usr/bin/env node
/*
 * Build Stranded II:  static/martian/src/**  ->  static/martian/{game.js, terrain-worker.js, game.css, sw.js}
 *
 *   node tools/build.mjs            one build (minified)
 *   node tools/build.mjs --watch    rebuild on change (unminified, fast)
 *   node tools/build.mjs --dev      one unminified build
 *
 * The outputs are committed, so the game runs from a plain static server (and from Flask and
 * GitHub Pages) without a build step. sw.js is generated last: its cache name is a hash of
 * every shipped file, so any change to the game gives installed copies a new cache.
 */
import { build, context } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tools = path.dirname(fileURLToPath(import.meta.url));
const game = path.join(path.dirname(tools), 'static', 'martian');
const src = path.join(game, 'src');
const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

const common = {
  bundle: true,
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  target: ['es2020', 'safari15'],
  legalComments: 'none',
  logLevel: 'info',
  nodePaths: [path.join(tools, 'node_modules')],
  define: { __DEV__: JSON.stringify(dev) },
};

const configs = [
  { ...common, entryPoints: [path.join(src, 'main.js')], outfile: path.join(game, 'game.js'), format: 'esm' },
  { ...common, entryPoints: [path.join(src, 'terrain', 'worker.js')], outfile: path.join(game, 'terrain-worker.js'), format: 'iife' },
  {
    ...common,
    entryPoints: [path.join(src, 'ui', 'game.css')],
    outfile: path.join(game, 'game.css'),
    loader: { '.woff2': 'file', '.woff': 'empty' },
    assetNames: 'assets/fonts/[name]',
  },
];

// Files that make up the running game, relative to static/martian. Everything here is
// precached by the service worker and copied to gh-pages by tools/publish.mjs.
export async function shippedFiles() {
  const out = ['index.html', 'game.js', 'terrain-worker.js', 'game.css', 'manifest.webmanifest'];
  async function walk(dir) {
    let entries = [];
    try { entries = await readdir(path.join(game, dir), { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) await walk(rel);
      else if (!e.name.startsWith('.')) out.push(rel);
    }
  }
  await walk('assets');
  await walk('icons');
  const present = [];
  for (const f of out) { try { await stat(path.join(game, f)); present.push(f); } catch { /* not built yet */ } }
  return present.sort();
}

async function writeServiceWorker() {
  const files = await shippedFiles();
  const hash = createHash('sha256');
  for (const f of files) { hash.update(f); hash.update(await readFile(path.join(game, f))); }
  const version = hash.digest('hex').slice(0, 12);
  const template = await readFile(path.join(src, 'sw.template.js'), 'utf8');
  const sw = template
    .replace('__CACHE_VERSION__', version)
    .replace('__PRECACHE__', JSON.stringify(['./', ...files.filter((f) => f !== 'index.html')], null, 0));
  await writeFile(path.join(game, 'sw.js'), sw);
  let bytes = 0;
  for (const f of files) bytes += (await stat(path.join(game, f))).size;
  console.log(`sw.js: cache stranded-${version}, ${files.length} files, ${(bytes / 1e6).toFixed(2)} MB to precache`);
  return version;
}

if (watch) {
  const ctxs = await Promise.all(configs.map((c) => context({
    ...c,
    plugins: [{ name: 'sw', setup(b) { b.onEnd(() => { writeServiceWorker().catch(() => {}); }); } }],
  })));
  await Promise.all(ctxs.map((c) => c.watch()));
  console.log('watching for changes…');
} else if (import.meta.url === `file://${process.argv[1]}`) {
  await Promise.all(configs.map((c) => build(c)));
  await writeServiceWorker();
}
