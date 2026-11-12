#!/usr/bin/env node
// Static check of the game source: undefined names, bad imports, reassigned imports.
import { ESLint } from 'eslint';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'static', 'martian', 'src');
const eslint = new ESLint({
  cwd: src, overrideConfigFile: true,
  overrideConfig: [{
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, ...globals.worker, __DEV__: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-import-assign': 'error', 'no-const-assign': 'error', 'no-dupe-keys': 'error', 'no-redeclare': 'error', 'no-unreachable': 'warn', 'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }] },
  }],
});
const results = (await eslint.lintFiles(['**/*.js'])).filter((r) => !r.filePath.endsWith('sw.template.js'));
let errors = 0, warnings = 0;
for (const r of results) {
  for (const m of r.messages) {
    if (m.severity === 2) errors++; else warnings++;
    if (m.severity === 2 || process.argv.includes('--all')) console.log(`${path.relative(src, r.filePath)}:${m.line}  ${m.severity === 2 ? 'error' : 'warn '}  ${m.message}`);
  }
}
console.log(`${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
