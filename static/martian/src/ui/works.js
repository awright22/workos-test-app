// The sheet of a works (a kiln, a smelter, a glassworks): what it makes, what a batch of each takes, and the job
// it is doing. Pure presentation: the jobs themselves are game/works.js.
import { UI, openOverlay, hideOverlay, esc, chem } from './dom.js';
import { icon } from './icons.js';
import { Snd } from '../audio/sound.js';
import { S } from '../game/state.js';
import { HOUR } from '../game/base.js';
import { ITEM_NAMES } from '../game/inventory.js';
import { WORKS_POWER_FLOOR, batchesInHand, hoursText, jobLine, jobOf, startJob, stopJob } from '../game/works.js';
import { costChips, missingText } from './screens.js';

const on = (scope, sel, fn) => scope.querySelectorAll(sel).forEach((n) => n.addEventListener('click', (ev) => { ev.stopPropagation(); fn(n, ev); Snd.click(); }));
const made = (o) => Object.keys(o).map((k) => `<b class="t-num">${o[k]}</b> ${esc((ITEM_NAMES[k] || k).toLowerCase())}`).join(' and ');

/**
 * Open the sheet of a works. `b`: its record in World.builtMeshes. `after()`: called when a job is given or
 * stopped, for the world to catch up (its fire, the stores on the HUD).
 */
export function showWork(b, after) {
  let timer = 0;
  const close = () => { clearInterval(timer); hideOverlay(); };
  const draw = () => {
    const cur = jobOf(b);
    const cards = b.def.jobs.map((j) => {
      const have = batchesInHand(j), mine = cur === j;
      // one batch, a handful, or all the stores will cover
      const runs = [1];
      if (have >= 2) runs.push(Math.min(5, have));
      if (have > 5) runs.push(have);
      const pct = mine ? Math.round((b.job.t / (j.hours * HOUR)) * 100) : 0;
      return `<article class="rcp ${mine ? 'ready' : ''}" data-job="${j.id}"><div class="rcp-hd"><h4>${chem(esc(j.name))}</h4>` +
        (mine ? `<span class="badge ready">Batch ${b.job.of - b.job.left + 1} of ${b.job.of}</span>` : '') + '</div>' +
        `<p class="ds">A batch makes ${made(j.out)}, in ${hoursText(j.hours)}, for ${j.power}% of the Hab’s power.</p>` +
        (mine ? `<div class="work-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>`
          : `<div class="cost">${costChips(j.in)}</div>`) +
        '<div class="rcp-ft">' +
        (mine ? '<button type="button" class="mg-btn small" data-stop="1">Stop</button><span class="why">What is in the fire is lost. The rest comes back.</span>'
          : cur ? '<span class="why">One job at a time.</span>'
            : runs.map((n, i) => `<button type="button" class="mg-btn small${i === 0 && have >= 1 ? ' primary' : ''}" data-run="${j.id}" data-n="${n}"${have >= 1 ? '' : ' disabled'}>${n === 1 ? 'Run 1' : `Run ${n}`}</button>`).join('') +
              `<span class="why${have >= 1 ? '' : ' bad'}">${have >= 1 ? '' : chem(esc(missingText(j.in)))}</span>`) +
        '</div></article>';
    }).join('');
    const low = S.power < WORKS_POWER_FLOOR;
    const p = openOverlay('sheet',
      `<div class="sheet wide work"><header class="sheet-hd"><div><span class="t-kicker">${esc(b.def.desc)}</span><h1>${esc(b.def.name)}</h1></div>` +
      `<span class="work-state${cur ? ' on' : ''}">${esc(jobLine(b))}</span></header>` +
      `<div class="sheet-bd mg-scroll"><div class="work-jobs">${cards}</div></div>` +
      `<footer class="sheet-ft"><button type="button" class="mg-btn" data-act="done" data-autofocus>${icon('check')}Done</button>` +
      `<span class="note${low ? ' warn' : ''}">${low ? `Hab power is at ${Math.round(S.power)}%: the works wait until it is back above ${WORKS_POWER_FLOOR}%.`
        : `It works by itself, through the night too. Hab power: ${Math.round(S.power)}%.`}</span></footer></div>`,
      { label: `${b.def.name}: give it a job`, onEscape: close });
    on(p, '[data-act="done"]', close);
    on(p, '[data-run]', (n) => { if (startJob(b, n.dataset.run, +n.dataset.n)) { if (after) after(); draw(); } });
    on(p, '[data-stop]', () => { stopJob(b); if (after) after(); draw(); });
  };
  draw();
  // (the job goes on while the sheet is open: its bar and its line keep up)
  timer = setInterval(() => {
    if (!UI.overlay || !UI.overlay.querySelector('.sheet.work')) { clearInterval(timer); return; }
    const cur = jobOf(b), bar = UI.overlay.querySelector('.work-bar i'), line = UI.overlay.querySelector('.work-state');
    if (line) line.textContent = jobLine(b);
    if (cur && bar) bar.style.width = `${Math.round((b.job.t / (cur.hours * HOUR)) * 100)}%`;
    else if (!cur && bar) draw();                                // the job finished while he watched
  }, 500);
}
