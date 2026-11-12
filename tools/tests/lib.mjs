// Shared test harness: serves the game, opens it in headless Chromium (software WebGL),
// collects console errors, and exposes helpers that drive the game's debug hook (window.__MG).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { startServer } from '../serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
export const here = path.dirname(fileURLToPath(import.meta.url));
export const outDir = path.join(here, '.cache');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];

/**
 * @param {object} [o]
 * @param {number} [o.width] @param {number} [o.height] @param {boolean} [o.touch]
 * @param {string} [o.quality]  low | medium | high | ultra (default low: software rendering is slow)
 * @param {number} [o.dsf] device scale factor
 * @param {string} [o.query] extra URL parameters, e.g. 'safe=0,47,21,47' to simulate a phone's safe-area insets
 */
export async function openGame(o = {}) {
  await mkdir(outDir, { recursive: true });
  const { server, port } = await startServer(0);
  const browser = await chromium.launch({ args: GL_ARGS });
  const context = await browser.newContext({
    viewport: { width: o.width || 1280, height: o.height || 720 }, deviceScaleFactor: o.dsf || 1,
    hasTouch: !!o.touch, isMobile: !!o.touch,
  });
  const page = await context.newPage();
  // (software rendering on a busy machine: a click or a screenshot can wait far longer than Playwright's 30 s for a frame)
  page.setDefaultTimeout(180000);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/?fixed=1&q=${o.quality || 'low'}${o.query ? '&' + o.query : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__MG && window.__MG.ready, null, { timeout: 240000 });
  const loadMs = Date.now() - t0;
  const game = {
    page, errors, loadMs, port,
    /** Run a function in the page with access to window.__MG as its first argument. */
    eval: (fn, arg) => page.evaluate(`(${fn.toString()})(window.__MG, ${JSON.stringify(arg === undefined ? null : arg)})`),
    shot: async (name) => { const p = path.join(outDir, name + '.png'); await page.screenshot({ path: p, timeout: 120000 }); return p; },
    /** Let the game run for `seconds` of game time by stepping its clock (independent of frame rate). */
    close: async () => { await browser.close(); server.close(); },
  };
  return game;
}
