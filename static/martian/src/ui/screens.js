import { UI, log, logHistory, anyScreenOpen, moveFocus, esc, chem } from './dom.js';
import { Snd } from '../audio/sound.js';
import { fmtDist, groundDist } from '../planet/geo.js';
import { FEATURES } from '../planet/features.js';
import { DIFFICULTIES, S } from '../game/state.js';
import { World } from '../world/build.js';
import { player } from '../game/player.js';
import { ITEM_NAMES, RECIPES, UPGRADES, hasCost, nearHab, payCost } from '../game/inventory.js';
import { startDeploy } from '../game/interactables.js';
import { ACHIEVEMENTS, QUEST_DEFS, questTargetPos } from '../game/story.js';
import { icon } from './icons.js';
import { OBJECTIVES } from './hud.js';
import { initMap, openMap, renderMap as drawMap } from './map.js';
// The three full screens: the map (ui/map.js), the colony (inventory, fabrication, upgrades)
// and the journal (tasks, discoveries, achievements, statistics, log).

const SCREEN_EL = { map: UI.mapScreen, colony: UI.colonyScreen, journal: UI.journalScreen };
export function screenOpen() { return anyScreenOpen(); }
function openEl() { for (const k in SCREEN_EL) if (SCREEN_EL[k].style.display === 'block') return SCREEN_EL[k]; return null; }
export function closeScreens() {
  for (const k in SCREEN_EL) SCREEN_EL[k].style.display = 'none';
  if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
}
export function toggleScreen(which) {
  wire();
  const target = SCREEN_EL[which];
  const wasOpen = target.style.display === 'block';
  closeScreens();
  if (wasOpen) return;
  target.style.display = 'block';
  try { if (document.exitPointerLock) document.exitPointerLock(); } catch (e) { /* not locked */ }
  if (which === 'map') openMap();
  if (which === 'colony') renderColony();
  if (which === 'journal') renderJournal();
  const first = target.querySelector('[data-autofocus]') || target.querySelector('.scr-body button:not([disabled]), .scr-body [tabindex="0"]') || target.querySelector('.close');
  if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  Snd.click();
}
export function renderMap() { wire(); drawMap(); }

// frames: close button, the switcher between the three screens, keyboard operation
let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  for (const key in SCREEN_EL) {
    const s = SCREEN_EL[key];
    const close = s.querySelector('.close');
    close.addEventListener('click', (ev) => { ev.stopPropagation(); Snd.click(); closeScreens(); });
    s.querySelectorAll('[data-screen]').forEach((b) => b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (b.dataset.screen !== key) toggleScreen(b.dataset.screen);
    }));
  }
  initMap(UI.mapScreen.querySelector('.scr-body'));
  document.addEventListener('keydown', (ev) => {
    const scr = openEl();
    if (!scr || S.uiOpen) return;
    const k = ev.key;
    if (k === 'Tab') {
      const list = Array.from(scr.querySelectorAll('button:not([disabled]), [tabindex="0"]')).filter((n) => n.offsetParent !== null);
      if (!list.length) return;
      const i = list.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); list[list.length - 1].focus(); }
      else if (!ev.shiftKey && (i < 0 || i === list.length - 1)) { ev.preventDefault(); list[0].focus(); }
      return;
    }
    if (scr === UI.mapScreen && document.activeElement === UI.mapCanvas) return;        // the map pans with the arrows
    if (k === 'ArrowDown' || k === 'ArrowRight') { ev.preventDefault(); moveFocus(scr, 1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft') { ev.preventDefault(); moveFocus(scr, -1); }
    else if (k === 'PageDown' || k === 'PageUp') {
      const sc = Array.from(scr.querySelectorAll('.mg-scroll')).find((n) => n.offsetParent !== null);
      if (sc) { ev.preventDefault(); sc.scrollBy({ top: (k === 'PageDown' ? 0.8 : -0.8) * sc.clientHeight }); }
    }
  }, true);
}

// ============================================================
// COLONY: inventory / fabrication / upgrades
// ============================================================
const LOOT_NAMES = { rations: 'Rations', hydrazine: 'Hydrazine', water: 'L water' };
const itemName = (k) => ITEM_NAMES[k] || LOOT_NAMES[k] || k;
const KIT_ICON = { kitSolar: 'solar', kitGreenhouse: 'dome', kitBeacon: 'beacon', kitCache: 'cache' };
let colonyTab = 'craft';

/** Cost as chips showing what you have against what is needed; the missing ones stand out. */
function costChips(cost) {
  const keys = Object.keys(cost);
  if (!keys.length) return '<span class="chip ok">No materials needed</span>';
  return keys.map((k) => {
    const have = S.inv[k] || 0, ok = have >= cost[k];
    return `<span class="chip ${ok ? 'ok' : 'miss'}">${chem(esc(itemName(k)))} <b class="t-num">${have}/${cost[k]}</b></span>`;
  }).join('');
}
function missingText(cost) {
  const parts = [];
  for (const k in cost) { const need = cost[k] - (S.inv[k] || 0); if (need > 0) parts.push(`${need} ${itemName(k)}`); }
  return parts.length ? 'Missing ' + parts.join(', ') : '';
}
/** Why an upgrade cannot be installed apart from materials, or null. */
function upgradeGate(u) {
  if (u.needs && !S.upgrades[u.needs]) return `Requires ${UPGRADES.find((x) => x.id === u.needs).name}`;
  if (u.bp && !S.blueprints[u.bp]) {
    const q = QUEST_DEFS.find((x) => x.bp === u.bp);
    return q ? `Needs a blueprint — NASA survey task “${q.name}”` : 'Needs a blueprint — it comes with NASA\'s first care package';
  }
  if (u.needsRtg && !S.flags.hasRtg) return 'Requires the buried RTG';
  return null;
}

export function renderColony() {
  wire();
  const body = UI.colonyScreen.querySelector('.scr-body');
  const keep = {};
  body.querySelectorAll('.pane').forEach((p) => { keep[p.id] = p.scrollTop; });
  const focusKey = document.activeElement && body.contains(document.activeElement)
    ? ['r', 'u', 'deploy', 'tab'].map((a) => document.activeElement.dataset[a] && `[data-${a}="${document.activeElement.dataset[a]}"]`).find(Boolean) : null;
  const atHome = nearHab();

  // --- inventory ---
  const row = (ic, name, count, unit, note, extra) =>
    `<div class="inv-row ${count > 0 ? 'has' : 'zero'}">${icon(ic)}<span class="nm">${chem(esc(name))}${note ? `<small>${chem(esc(note))}</small>` : ''}</span>` +
    `<span class="ct t-num">${count}${unit ? `<small>${unit}</small>` : ''}</span>${extra || ''}</div>`;
  let inv = '<div class="pane-hd">Supplies</div>';
  inv += row('box', 'Rations', S.food, '', 'One a sol, when the potatoes run out');
  inv += row('food', 'Potatoes', S.potatoes, '', 'Eaten first; also seed for the farm');
  inv += row('water', 'Water', Math.round(S.water), 'L');
  inv += row('power', 'Hydrazine burns', S.hydrazine, '', 'Each makes water at the rig');
  inv += '<div class="pane-hd">Materials</div>';
  const MAT_ICON = { scrap: 'colony', circuit: 'sliders', regolith: 'layers', ice: 'cold', candle: 'suit' };
  for (const k of ['scrap', 'circuit', 'regolith', 'ice', 'candle']) inv += row(MAT_ICON[k], ITEM_NAMES[k], S.inv[k] || 0, '');
  inv += '<div class="pane-hd">Kits <span>Build, then place outside</span></div>';
  for (const k of ['kitSolar', 'kitGreenhouse', 'kitBeacon', 'kitCache']) {
    const n = S.inv[k] || 0;
    inv += row(KIT_ICON[k], ITEM_NAMES[k], n, '', '', n > 0 ? `<button type="button" class="mg-btn small primary" data-deploy="${k.slice(3).toLowerCase()}">Deploy</button>` : '');
  }
  const bps = UPGRADES.filter((u) => u.bp);
  inv += `<div class="pane-hd">Blueprints <span>${bps.filter((u) => S.blueprints[u.bp]).length} of ${bps.length}</span></div>`;
  for (const u of bps) {
    const got = !!S.blueprints[u.bp];
    inv += `<div class="inv-row ${got ? 'has' : 'zero'}">${icon(got ? 'blueprint' : 'lock')}<span class="nm">${chem(esc(u.name))}</span>` +
      `<span class="badge ${got ? 'done' : 'locked'}">${got ? 'Owned' : 'Not found'}</span></div>`;
  }
  if (S.flags.hasRtg && !S.upgrades.rtg) inv += '<div class="pane-hd">Special</div>' + row('power', 'RTG, unsocketed', 1, '', 'Socket it under Upgrades');

  // --- fabrication ---
  let ready = 0;
  let craft = '';
  for (const r of RECIPES) {
    const can = hasCost(r.cost), ok = atHome && can;
    if (ok) ready++;
    const have = r.gives ? (S.inv[Object.keys(r.gives)[0]] || 0) : null;
    craft += `<article class="rcp ${ok ? 'ready' : ''}" data-card="${r.id}"><div class="rcp-hd"><h4>${chem(esc(r.name))}</h4>` +
      (ok ? '<span class="badge ready">Ready</span>' : '') + (have !== null && have > 0 ? `<span class="badge">Have ${have}</span>` : '') + '</div>' +
      `<p class="ds">${chem(esc(r.desc))}</p><div class="cost">${costChips(r.cost)}</div>` +
      `<div class="rcp-ft"><button type="button" class="mg-btn small${ok ? ' primary' : ''}" data-r="${r.id}"${ok ? '' : ' disabled'}>Fabricate</button>` +
      `<span class="why${can ? '' : ' bad'}">${!can ? chem(esc(missingText(r.cost))) : !atHome ? 'Only at the Hab' : ''}</span></div></article>`;
  }
  craft = `<div class="pane-hd">Fabricator <span>${atHome ? `${ready} ready to build` : 'Out of range'}</span></div>` + craft;

  // --- upgrades ---
  let up = '', upReady = 0, installed = 0;
  for (const u of UPGRADES) {
    if (S.upgrades[u.id]) {
      installed++;
      up += `<article class="rcp done"><div class="rcp-hd"><h4>${chem(esc(u.name))}</h4><span class="badge done">${icon('check')}Installed</span></div><p class="ds">${chem(esc(u.desc))}</p></article>`;
      continue;
    }
    const gate = upgradeGate(u), can = hasCost(u.cost), ok = atHome && !gate && can;
    if (ok) upReady++;
    up += `<article class="rcp ${ok ? 'ready' : gate ? 'locked' : ''}" data-card="${u.id}"><div class="rcp-hd"><h4>${chem(esc(u.name))}</h4>` +
      (ok ? '<span class="badge ready">Ready</span>' : gate ? `<span class="badge locked">${icon('lock')}Locked</span>` : '') + '</div>' +
      `<p class="ds">${chem(esc(u.desc))}</p><div class="cost">${costChips(u.cost)}</div>` +
      `<div class="rcp-ft"><button type="button" class="mg-btn small${ok ? ' primary' : ''}" data-u="${u.id}"${ok ? '' : ' disabled'}>Install</button>` +
      `<span class="why${gate || !can ? ' bad' : ''}">${gate ? esc(gate) : !can ? chem(esc(missingText(u.cost))) : !atHome ? 'Only at the Hab' : ''}</span></div></article>`;
  }
  up = `<div class="pane-hd">Upgrades <span>${installed} of ${UPGRADES.length} installed</span></div>` + up;

  const tab = (id, ic, label, n) => `<button type="button" role="tab" aria-selected="${colonyTab === id}" data-tab="${id}">${icon(ic)}${label}${n ? `<em>${n}</em>` : ''}</button>`;
  body.innerHTML = '<div class="colony">' +
    `<div class="col-bar${atHome ? '' : ' off'}">${icon(atHome ? 'check' : 'warning')}<b>${atHome ? 'Fabricator online' : 'Fabricator out of range'}</b>` +
    `<span>${atHome ? 'You are at the Hab. Anything marked Ready can be built now.' : 'Return to the Hab to fabricate or install. You can still deploy kits you carry.'}</span></div>` +
    `<div class="tabs" role="tablist">${tab('inv', 'box', 'Inventory')}${tab('craft', 'colony', 'Fabricate', ready)}${tab('build', 'up', 'Upgrades', upReady)}</div>` +
    '<div class="cols">' +
    `<section class="pane mg-scroll${colonyTab === 'inv' ? ' on' : ''}" id="mg-inv" aria-label="Inventory">${inv}</section>` +
    `<section class="pane mg-scroll${colonyTab === 'craft' ? ' on' : ''}" id="mg-craft" aria-label="Fabrication">${craft}</section>` +
    `<section class="pane mg-scroll${colonyTab === 'build' ? ' on' : ''}" id="mg-build" aria-label="Upgrades">${up}</section>` +
    '</div></div>';
  body.querySelectorAll('.pane').forEach((p) => { if (keep[p.id]) p.scrollTop = keep[p.id]; });

  body.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { colonyTab = b.dataset.tab; Snd.click(); renderColony(); }));
  body.querySelectorAll('[data-deploy]').forEach((b) => b.addEventListener('click', () => startDeploy(b.dataset.deploy)));
  const bump = (id) => { const c = UI.colonyScreen.querySelector(`[data-card="${id}"]`); if (c) c.classList.add('bump'); };
  body.querySelectorAll('button[data-r]').forEach((b) => b.addEventListener('click', () => {
    const r = RECIPES.find((x) => x.id === b.dataset.r);
    if (!r || !hasCost(r.cost) || !nearHab()) return;
    if (r.run) {
      const res = r.run();
      if (res !== true) { log(res, 'sys'); b.parentNode.querySelector('.why').textContent = res; b.parentNode.querySelector('.why').className = 'why bad'; return; }
      payCost(r.cost);
    } else {
      payCost(r.cost);
      for (const k in r.gives) S.inv[k] = (S.inv[k] || 0) + r.gives[k];
    }
    S.stats.crafted++;
    Snd.craft();
    renderColony();
    bump(r.id);
  }));
  body.querySelectorAll('button[data-u]').forEach((b) => b.addEventListener('click', () => {
    const u = UPGRADES.find((x) => x.id === b.dataset.u);
    if (!u || S.upgrades[u.id] || !nearHab() || !hasCost(u.cost)) return;
    if (u.bp && !S.blueprints[u.bp]) return;
    if (u.needs && !S.upgrades[u.needs]) return;
    if (u.needsRtg && !S.flags.hasRtg) return;
    payCost(u.cost);
    S.upgrades[u.id] = true;
    S.stats.crafted++;
    Snd.craft();
    log(`Installed: ${u.name}. ${u.desc}.`);
    renderColony();
  }));
  if (focusKey) { const f = body.querySelector(focusKey); if (f && !f.disabled) f.focus({ preventScroll: true }); }
}

// ============================================================
// JOURNAL
// ============================================================
let journalTab = 'tasks';
const ACH_PROGRESS = {
  botanist: () => [S.stats.potatoes, 50, ''], eyebrows: () => [S.stats.booms, 5, ''], arch: () => [Object.keys(S.salvaged).length, 8, ''],
  circum: () => [S.stats.driven / 1000, 75.4, ' km'], ice: () => [S.stats.mined, 25, ''], storm: () => [S.stats.stormOut, 60, ' s'],
  marathon: () => [S.stats.walked / 1000, 10, ' km'], disco: () => [S.stats.discoTime, 180, ' s'],
};
const FEATURE_KIND = { volcano: 'Volcano', basin: 'Impact basin', crater: 'Crater', canyon: 'Canyon', cap: 'Polar cap' };
const num = (v) => (v >= 100 || Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(1));

function tasksHtml() {
  let h = '<div class="pane-hd">Mission</div><div class="obj-list">';
  let primary = false, open = '', closed = '', nDone = 0;
  for (const o of OBJECTIVES) {
    if (!o.shown()) continue;
    const d = o.done();
    let cls = d ? 'done' : o.urgent ? 'urgent' : '';
    if (!d && !primary) { primary = true; if (!o.urgent) cls = 'primary'; }
    const row = `<div class="obj ${cls}"><i class="mk"></i><span class="tx">${esc(o.text())}</span><span class="ds t-num">${!d && o.dist ? fmtDist(o.dist()) : ''}</span></div>`;
    if (d) { closed += row; nDone++; } else open += row;
  }
  h += (open || '<div class="obj"><i class="mk"></i><span class="tx">Stay alive.</span></div>') + '</div>';
  const doneHtml = closed ? `<div class="pane-hd">Done <span>${nDone}</span></div><div class="obj-list done-list">${closed}</div>` : '';
  const active = QUEST_DEFS.filter((q) => S.quests[q.id] === 'active').length;
  const done = QUEST_DEFS.filter((q) => S.quests[q.id] === 'done').length;
  h += `<div class="pane-hd">NASA survey tasks <span>${S.pf.connected ? `${active} active · ${done} complete` : 'No uplink'}</span></div>`;
  if (!S.pf.connected) {
    return h + `<div class="empty">${icon('dish')}<b>No uplink</b>Restore Pathfinder to receive survey tasks from NASA. They pay in supply pods and blueprints.</div>` + doneHtml;
  }
  const list = QUEST_DEFS.map((q) => ({ q, st: S.quests[q.id], pos: questTargetPos(q) }))
    .map((x) => ({ ...x, d: x.pos ? groundDist(player.pos, x.pos) : -1 }))
    .sort((a, b) => (a.st === 'done') - (b.st === 'done') || a.d - b.d);
  h += '<div class="jr-grid">';
  for (const { q, st, d } of list) {
    const isDone = st === 'done';
    const loot = Object.keys(q.loot || {}).map((k) => `<span class="chip"><b class="t-num">${q.loot[k]}</b> ${chem(esc(itemName(k)))}</span>`).join('');
    const bp = q.bp ? `<span class="chip bp">${icon('blueprint')}${esc((UPGRADES.find((u) => u.bp === q.bp) || { name: q.bp }).name)} blueprint</span>` : '';
    const reveal = q.reveal ? `<span class="chip bp">${icon('map')}Full survey map</span>` : '';
    h += `<article class="card quest${isDone ? ' done' : ''}"><div class="card-hd">${icon(isDone ? 'check' : 'target')}<h4>${esc(q.name)}${q.target ? `<small>${esc(q.target)}</small>` : ''}</h4>` +
      (isDone ? '<span class="badge done">Complete</span>' : d >= 0 ? `<span class="dist t-num">${fmtDist(d)}</span>` : '<span class="badge active">Active</span>') + '</div>' +
      `<p>${chem(esc(q.desc))}</p><div class="meta">${loot}${bp}${reveal}</div></article>`;
  }
  return h + '</div>' + doneHtml;
}
function discoveriesHtml() {
  const landers = World.landers, known = landers.filter((r) => S.discovered[r.data.name]).length;
  let h = `<div class="pane-hd">Landers <span>${known} of ${landers.length} found</span></div><div class="jr-grid">`;
  for (const rec of landers.slice().sort((x, y) => !!S.discovered[y.data.name] - !!S.discovered[x.data.name] || x.data.year - y.data.year)) {
    const k = S.discovered[rec.data.name];
    h += k
      ? `<article class="card got"><div class="card-hd">${icon('lander')}<h4>${esc(rec.data.name)}<small>${rec.data.year}</small></h4>` +
        `${S.salvaged[rec.data.name] ? '<span class="badge done">Salvaged</span>' : ''}</div><p>${esc(rec.data.note)}</p></article>`
      : `<article class="card locked"><div class="card-hd">${icon('lock')}<h4>Unknown lander</h4></div><p>${S.flags.mapRevealed ? 'Its signal is on the map. Go and find it.' : 'Find it out there.'}</p></article>`;
  }
  const places = FEATURES.filter((f) => f.type !== 'bulge' && f.type !== 'albedo' && f.note);
  const pk = places.filter((f) => S.discovered[f.name]).length;
  h += `</div><div class="pane-hd">Places <span>${pk} of ${places.length} visited</span></div><div class="jr-grid">`;
  for (const f of places.slice().sort((x, y) => !!S.discovered[y.name] - !!S.discovered[x.name])) {
    const k = S.discovered[f.name];
    h += k
      ? `<article class="card got"><div class="card-hd">${icon('pin')}<h4>${esc(f.name)}<small>${FEATURE_KIND[f.type] || ''}</small></h4></div><p>${esc(f.note)}</p></article>`
      : `<article class="card locked"><div class="card-hd">${icon('lock')}<h4>Uncharted</h4></div><p>${FEATURE_KIND[f.type] || 'A place'} you have not stood in yet.</p></article>`;
  }
  return h + '</div>';
}
function achievementsHtml() {
  const got = ACHIEVEMENTS.filter((a) => S.achieved[a.id]).length;
  let h = `<div class="pane-hd">Achievements <span>${got} of ${ACHIEVEMENTS.length}</span></div><div class="jr-grid">`;
  for (const a of ACHIEVEMENTS) {
    const g = !!S.achieved[a.id];
    let prog = '';
    if (!g && ACH_PROGRESS[a.id]) {
      const [v, max, unit] = ACH_PROGRESS[a.id]();
      prog = `<div class="prog"><i style="--p:${Math.min(100, v / max * 100).toFixed(0)}%"></i><span class="t-num">${num(Math.min(v, max))} / ${num(max)}${unit}</span></div>`;
    }
    h += `<article class="card ${g ? 'got' : 'locked'}"><div class="card-hd">${icon(g ? 'trophy' : 'lock')}<h4>${esc(a.name)}</h4>${g ? '<span class="badge done">Earned</span>' : ''}</div><p>${esc(a.desc)}</p>${prog}</article>`;
  }
  return h + '</div>';
}
function statsHtml() {
  const st = S.stats;
  const tile = (v, unit, label) => `<div class="stat"><b class="t-num">${v}${unit ? `<small>${unit}</small>` : ''}</b><span>${label}</span></div>`;
  return `<div class="pane-hd">This run <span>${esc(DIFFICULTIES[S.diff].name)} · rescue on Sol ${S.rescueSol}</span></div><div class="stat-grid">` +
    tile(S.sol, '', 'Sols survived') + tile(Math.max(0, S.rescueSol - S.sol), '', 'Sols to rescue') +
    tile((st.walked / 1000).toFixed(1), 'km', 'Walked') + tile((st.driven / 1000).toFixed(1), 'km', 'Driven') +
    tile(st.potatoes, '', 'Potatoes harvested') + tile(st.panels, '', 'Panels wiped') + tile(st.crafted, '', 'Things fabricated') +
    tile(st.mined, '', 'Ice chunks mined') + tile(st.discoveries, '', 'Discoveries') + tile(Object.keys(S.salvaged).length, '', 'Landers salvaged') +
    tile(World.builtMeshes.length, '', 'Structures deployed') + tile(st.booms, '', 'Hydrazine burns') + tile(st.closeCalls, '', 'Close calls') +
    tile(Math.round(st.stormOut), 's', 'Out in storms') + tile(Math.round(st.discoTime), 's', 'Disco endured') +
    '</div>';
}
function logHtml() {
  if (!logHistory.length) return `<div class="empty">${icon('journal')}<b>Nothing logged yet</b>What you, the Hab and NASA say this session is kept here.</div>`;
  const NAMES = { nasa: 'NASA', sys: 'HAB', disc: 'SURVEY', log: 'LOG' };
  let h = `<div class="pane-hd">Log <span>This session, newest first</span></div><div class="jlog">`;
  for (let i = logHistory.length - 1; i >= 0; i--) {
    const l = logHistory[i];
    h += `<div class="mg-line ${l.voice}"><span class="who">${NAMES[l.voice]}<small>SOL ${l.sol}</small></span><span class="tx">${chem(esc(l.text))}</span></div>`;
  }
  return h + '</div>';
}
const JOURNAL_TABS = [['tasks', 'target', 'Tasks', tasksHtml], ['disc', 'pin', 'Discoveries', discoveriesHtml], ['ach', 'trophy', 'Achievements', achievementsHtml],
  ['stats', 'chart', 'Statistics', statsHtml], ['log', 'list', 'Log', logHtml]];
export function renderJournal() {
  wire();
  const body = UI.journalScreen.querySelector('.scr-body');
  const counts = {
    tasks: QUEST_DEFS.filter((q) => S.quests[q.id] === 'active').length || '',
    disc: S.stats.discoveries || '', ach: Object.keys(S.achieved).length || '',
  };
  const cur = JOURNAL_TABS.find((t) => t[0] === journalTab) || JOURNAL_TABS[0];
  body.innerHTML = '<div class="journal"><div class="tabs" role="tablist">' +
    JOURNAL_TABS.map(([id, ic, label]) => `<button type="button" role="tab" aria-selected="${id === cur[0]}" data-tab="${id}"${id === cur[0] ? ' data-autofocus' : ''}>${icon(ic)}${label}${counts[id] ? `<em>${counts[id]}</em>` : ''}</button>`).join('') +
    `</div><div class="jr-body mg-scroll" role="tabpanel" aria-label="${cur[2]}">${cur[3]()}</div></div>`;
  body.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    journalTab = b.dataset.tab;
    Snd.click();
    renderJournal();
    const again = body.querySelector(`[data-tab="${journalTab}"]`);
    if (again) again.focus({ preventScroll: true });
  }));
}
