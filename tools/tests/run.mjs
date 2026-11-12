// Run every test in order; stop at the first failure.  node tools/tests/run.mjs
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
for (const t of ['smoke', 'arc', 'save', 'science', 'machines', 'audio-hooks']) {
  console.log(`\n=== ${t} ===`);
  const r = spawnSync(process.execPath, [path.join(here, t + '.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`\n${t} FAILED`); process.exit(1); }
}
console.log('\nAll tests passed.');
