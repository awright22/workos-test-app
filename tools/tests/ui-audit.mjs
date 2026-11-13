// Phone legibility audit: walks the interface's states at phone sizes and measures, in the page, what a
// screenshot review otherwise estimates by eye:
//   - text set under 11 px, and touch targets under 44 px;
//   - controls outside the safe area or cut by the edge of a row;
//   - text cut off by its box (an ellipsis, a clamped line);
//   - text printed over other text (rows of a list that run into each other, a badge on top of a name);
//   - content cut by the edge of the card or dialog it is in, or by the screen, and a scrolling region with
//     more below and nothing to say so.
//
// The states are the ones tests/ui-shots.mjs photographs, taken by the same walk: every picture a reviewer is
// shown is a state measured here. (They used to be two lists, and three broken screens were in the pictures
// and not in the audit.)
//
//   node tools/tests/ui-audit.mjs                     both phones
//   node tools/tests/ui-audit.mjs --size=667          one size (matches by substring)
//   node tools/tests/ui-audit.mjs --only=colony,win   only states whose name contains one of these
//   node tools/tests/ui-audit.mjs --verbose           name every state as it is measured
//
// Exits non-zero if anything is found. (The map's own labels are drawn on a canvas and are not measured here.)
import { SIZES, walk } from './ui-shots.mjs';
import { auditInPage, auditLines } from './audit-lib.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const want = arg('size'), only = arg('only') ? arg('only').split(',') : null;
const verbose = process.argv.includes('--verbose');
let bad = 0, states = 0;

for (const size of SIZES) {
  if (!size.touch || size.portrait) continue;                       // the two phones held sideways
  if (want && !size.name.includes(want)) continue;
  const safe = size.safe.split(',').map(Number);
  console.log(size.name);
  let res;
  try {
    res = await walk(size, {
      shoot: false, reducedMotion: true, only,
      onState: async (state, page) => {
        const lines = auditLines(await page.evaluate(auditInPage, safe));
        states++;
        if (verbose) console.log(`    ${state}: ${lines.length} found`);
        if (lines.length) { bad += lines.length; console.log(`  ${size.name} / ${state}:`); for (const l of [...new Set(lines)]) console.log('      ' + l); }
      },
    });
  } catch (e) { bad++; console.log(`  ${size.name} FAILED: ${e.message}`); continue; }
  if (res.errors.length) { bad += res.errors.length; console.log('  console errors: ' + JSON.stringify(res.errors.slice(0, 4))); }
}
console.log(`\n${states} states audited; ${bad} thing${bad === 1 ? '' : 's'} found`);
process.exit(bad ? 1 : 0);
