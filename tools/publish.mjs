#!/usr/bin/env node
/*
 * Publish the game to GitHub Pages (the gh-pages branch, which the owner plays from).
 *
 *   node tools/publish.mjs "what changed, in a line"      build, check, publish
 *   node tools/publish.mjs --dry-run "..."                 everything except the push
 *   node tools/publish.mjs --skip-tests "..."              when the tests were just run
 *
 * It makes a production build, runs lint and the tests, then replaces the contents of
 * gh-pages with exactly the files the game ships (the same list the service worker precaches)
 * and pushes. Earlier builds stay in that branch's history.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdir, rm, readdir, writeFile, stat } from 'node:fs/promises';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shippedFiles } from './build.mjs';

const tools = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(tools);
const game = path.join(repo, 'static', 'martian');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run'), skipTests = args.includes('--skip-tests');
const message = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!message) { console.error('usage: publish.mjs [--dry-run] [--skip-tests] "what changed"'); process.exit(2); }
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();
const run = (cmd, a) => { const r = spawnSync(cmd, a, { cwd: tools, stdio: 'inherit' }); if (r.status !== 0) { console.error(`\n${a.join(' ')} failed; not publishing.`); process.exit(1); } };

run(process.execPath, ['build.mjs']);
run(process.execPath, ['lint.mjs']);
if (!skipTests) run(process.execPath, ['tests/run.mjs']);

const files = [...await shippedFiles(), 'sw.js'];
const sha = git(repo, 'rev-parse', '--short', 'HEAD');
const dirty = git(repo, 'status', '--porcelain', '--', 'static/martian/src', 'tools/build.mjs') !== '';
const work = mkdtempSync(path.join(os.tmpdir(), 'stranded-pages-'));
try {
  git(repo, 'fetch', '--quiet', 'origin', 'gh-pages');
  git(repo, 'worktree', 'add', '--quiet', '--detach', work, 'origin/gh-pages');
  for (const e of await readdir(work)) if (e !== '.git' && e !== '.nojekyll') await rm(path.join(work, e), { recursive: true, force: true });
  let bytes = 0;
  for (const f of files) {
    await mkdir(path.dirname(path.join(work, f)), { recursive: true });
    await cp(path.join(game, f), path.join(work, f));
    bytes += (await stat(path.join(game, f))).size;
  }
  await writeFile(path.join(work, '.nojekyll'), '');
  git(work, 'add', '-A');
  if (git(work, 'status', '--porcelain') === '') { console.log('gh-pages already matches this build; nothing to publish.'); }
  else {
    git(work, 'commit', '--quiet', '-m', `${message}\n\nBuilt from ${sha}${dirty ? ' (plus uncommitted changes)' : ''}; ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB.`);
    console.log(`\n${files.length} files, ${(bytes / 1e6).toFixed(1)} MB, from ${sha}${dirty ? ' + uncommitted changes' : ''}`);
    if (dry) console.log('dry run: not pushed. Commit is', git(work, 'rev-parse', '--short', 'HEAD'));
    else { git(work, 'push', '--quiet', 'origin', 'HEAD:gh-pages'); console.log('published to gh-pages:', git(work, 'rev-parse', '--short', 'HEAD')); }
  }
} finally {
  try { git(repo, 'worktree', 'remove', '--force', work); } catch { /* leave it for inspection */ }
}
