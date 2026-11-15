// An installed copy takes a new build: the page's own check (the script in index.html) against a service worker
// that has not taken it.
//
//   node tools/tests/update.mjs
//
// A small stand-in site is served with the game's real page script and its real service-worker template, in two
// builds. Build A is installed. Build B is then published with a worker whose install fails (one file of its
// shell is missing), which is how a phone comes to stay on an old build: the old worker goes on answering from
// its own copy. The page must end up running B all the same; without the page's check it stays on A (shown
// first, so that this test is known to see the fault); and with no network it must go on playing A.
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'static', 'martian');
const fails = [];
const check = (name, ok, d) => { console.log((ok ? '  ok   ' : '  FAIL ') + name + (d !== undefined ? '  ' + JSON.stringify(d) : '')); if (!ok) fails.push(name); };

const html = await readFile(path.join(game, 'index.html'), 'utf8');
const boot = /<script>\s*\/\* Which build this page belongs to[\s\S]*?<\/script>/.exec(html);
const template = await readFile(path.join(game, 'src', 'sw.template.js'), 'utf8');
if (!boot) { console.log('  FAIL index.html has no build check to test'); process.exit(1); }
const A = 'aaaaaaaaaaaa', B = 'bbbbbbbbbbbb';
const site = { build: A, broken: false, checked: true };
const page = (b) => '<!doctype html><meta charset="utf-8"><body>' + (site.checked ? boot[0].replace(/\/\*BUILD\*\/'[0-9a-f]*'\/\*END\*\//, `/*BUILD*/'${b}'/*END*/`) : '<script type="module" src="game.js"></script>') + '</body>';
const worker = (b) => template.replace('__CACHE_VERSION__', b).replace('__SHELL__', JSON.stringify(['./', 'game.js'].concat(site.broken ? ['missing.bin'] : []))).replace('__PRECACHE__', JSON.stringify(['data.bin']));
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const send = (type, body) => { res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }); res.end(req.method === 'HEAD' ? undefined : body); };
  if (url === '/') send('text/html', page(site.build));
  else if (url === '/game.js') send('text/javascript', `window.__RAN = '${site.build}'; navigator.serviceWorker.register('sw.js').catch(() => {});`);
  else if (url === '/sw.js') send('text/javascript', worker(site.build));
  else if (url === '/data.bin') send('application/octet-stream', 'data of ' + site.build);
  else { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

const state = (p) => p.evaluate(async () => ({ ran: window.__RAN || '', build: window.__BUILD || '', caches: (await caches.keys()).sort().join(','), controlled: !!navigator.serviceWorker.controller }));
const settle = async (p) => { await p.waitForFunction(() => window.__RAN, null, { timeout: 30000 }); await p.waitForTimeout(700); };
// install build A, and come back to it under its worker
const install = async (checked) => {
  Object.assign(site, { build: A, broken: false, checked });
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(base); await settle(p);
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 });
  await p.reload(); await settle(p);
  return { ctx, p, at: await state(p) };
};

// ---- the fault, seen: a page with no check stays on the old build
let s = await install(false);
check('build A is installed and its worker answers', s.at.ran === A && s.at.controlled && s.at.caches === 'stranded2-' + A, s.at);
Object.assign(site, { build: B, broken: true });
await s.p.reload(); await settle(s.p);
let now = await state(s.p);
check('without the page\'s check, a new build whose worker fails to install is never run (the fault)', now.ran === A && /aaaa/.test(now.caches), now);
await s.ctx.close();

// ---- the page's check: the new build is run all the same
s = await install(true);
check('with the check, build A installs and runs as before', s.at.ran === A && s.at.build === A && s.at.controlled && s.at.caches === 'stranded2-' + A, s.at);
Object.assign(site, { build: B, broken: true });
await s.p.reload();
await s.p.waitForFunction((b) => window.__RAN === b, B, { timeout: 30000 }).catch(() => {});
await s.p.waitForTimeout(700);
now = await state(s.p);
check('a new build whose worker cannot install is run all the same, and the old copy is gone', now.ran === B && now.build === B && !/aaaa/.test(now.caches), now);
// and a worker that does install takes over in the ordinary way, with one copy kept
Object.assign(site, { build: B, broken: false });
await s.p.reload(); await settle(s.p);
await s.p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {});
await s.p.reload(); await settle(s.p);
now = await state(s.p);
check('once its worker installs, build B is kept for offline and nothing of A is left', now.ran === B && now.controlled && now.caches === 'stranded2-' + B, now);
// the rest of a build is fetched one by one: what the shell does not hold is there too
const data = await s.p.evaluate(async () => { const c = await caches.open((await caches.keys())[0]); return (await c.keys()).map((r) => new URL(r.url).pathname).sort().join(','); });
check('the offline copy holds the page, the game and the rest', data === '/,/data.bin,/game.js', data);
// ---- no network: it plays what it has
await s.ctx.setOffline(true);
await s.p.reload().catch(() => {});
await s.p.waitForFunction(() => window.__RAN, null, { timeout: 30000 }).catch(() => {});
now = await state(s.p).catch((e) => ({ error: String(e) }));
check('with no network the installed build still starts', now.ran === B && now.caches === 'stranded2-' + B, now);
await s.ctx.close();

console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'passed'}`);
await browser.close(); server.close();
process.exit(fails.length ? 1 : 0);
