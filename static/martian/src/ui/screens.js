import { COMFORTS, comfortBlock, comfortCheer, comfortCount, comforts, makeComfort } from '../game/comforts.js';
import { syncAllVisuals } from '../game/visuals.js';
import { catalogue, scienceSummary } from '../game/science.js';
import { MACHINES, serviceCost } from '../game/machines.js';
import { CROPS, MORALE_WORD, PRODUCE, farm, foodTotal, moraleBand } from '../game/farm.js';
import { UI, VOICES, log, logHistory, logText, anyScreenOpen, moveFocus, esc, chem } from './dom.js';
import { Snd } from '../audio/sound.js';
import { fmtDist, groundDist } from '../planet/geo.js';
import { FEATURES } from '../planet/features.js';
import { DIFFICULTIES, S } from '../game/state.js';
import { World } from '../world/build.js';
import { ITEM_NAMES, RECIPES, UPGRADES, hasCost, nearHab, payCost } from '../game/inventory.js';
import { startDeploy } from '../game/interactables.js';
import { ACHIEVEMENTS, QUEST_DEFS, achievementDone, checkAchievements, questTargetPos } from '../game/story.js';
import { icon } from './icons.js';
import { sightList } from '../game/sights.js';
import { layout } from './layout.js';
import { distTo, missionList, objectiveDist, objectiveWhy } from './hud.js';
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
const LOOT_NAMES = { rations: 'Rations', hydrazine: 'Hydrazine', water: 'L water', seedRadish: 'radish seed packet', seedLettuce: 'lettuce seed packet', seedSoy: 'soybean seed packet', seedTomato: 'tomato seed packet' };
const itemName = (k, n) => (ITEM_NAMES[k] || LOOT_NAMES[k] || k) + (/^seed/.test(k) && n > 1 ? 's' : '');
const KIT_ICON = { kitSolar: 'solar', kitGreenhouse: 'dome', kitBeacon: 'beacon', kitCache: 'cache' };
/** Morale a thing gives each dawn, as it is written: whole numbers and halves ("+½", "+1½": "+0.5" sat beside a gauge in whole numbers). */
const halves = (n) => { const w = Math.floor(n + 1e-6), h = n - w > 0.25; return `${w || !h ? w : ''}${h ? '½' : ''}`; };
let colonyTab = 'craft';

/**
 * Cost as chips: how many of a thing it takes, then how many you have; the missing ones stand out.
 * (It was "Scrap Metal 9/2", have over need, which read as nine of two.)
 */
/** The badges of a card, as one group: beside the name where there is room, under it where there is not. */
const tags = (h) => (h ? `<span class="tags">${h}</span>` : '');
function costChips(cost, plain) {
  const keys = Object.keys(cost);
  if (!keys.length) return '<span class="chip ok">No materials needed</span>';
  return keys.map((k) => {
    const have = S.inv[k] || 0, ok = have >= cost[k];
    // (a card locked for another reason says what it will take and no more: "Locked", a red "have 9" and a blueprint
    //  note together were three reasons where there is one)
    if (plain) return `<span class="chip"><b class="t-num">${cost[k]}</b> ${chem(esc(itemName(k)))}</span>`;
    return `<span class="chip ${ok ? 'ok' : 'miss'}"><b class="t-num">${cost[k]}</b> ${chem(esc(itemName(k)))} <i class="t-num">have ${have}</i></span>`;
  }).join('');
}
/** Where each material comes from, for the line that says one is missing. */
const SOURCE = {
  scrap: 'salvage debris and old landers', circuit: 'salvage old landers', regolith: 'dig it outside',
  ice: 'mine ice deposits', candle: 'fabricate one, or open supply pods',
};
/** (ice names how the drill is come by, until he has it: "with the ice drill" named a thing he had never seen) */
const sourceOf = (k) => (k === 'ice' && !S.upgrades.drill ? 'mine ice deposits, once the Ice Drill is installed (Upgrades)' : SOURCE[k]);
function missingText(cost) {
  const parts = [], from = [];
  for (const k in cost) {
    const need = cost[k] - (S.inv[k] || 0);
    if (need <= 0) continue;
    parts.push(`${need} ${itemName(k)}`);
    if (sourceOf(k) && !from.includes(sourceOf(k))) from.push(sourceOf(k));
  }
  return parts.length ? `Missing ${parts.join(', ')}${from.length ? ': ' + from.join('; ') : ''}` : '';
}
/** Why an upgrade cannot be installed apart from materials, or null. */
function upgradeGate(u) {
  if (u.needs && !S.upgrades[u.needs]) return `Requires ${UPGRADES.find((x) => x.id === u.needs).name}`;
  if (u.bp && !S.blueprints[u.bp]) {
    const q = QUEST_DEFS.find((x) => x.bp === u.bp);
    // once the task is done the blueprint is in its reward pod, which still has to be opened
    if (q && S.quests[q.id] === 'done') return `Its blueprint is in the reward pod for “${q.name}”: open the pod`;
    return q ? `Needs a blueprint — NASA survey task “${q.name}”` : 'Needs a blueprint — it comes with NASA\'s first care package';
  }
  if (u.needsRtg && !S.flags.hasRtg) return 'Requires the buried RTG';
  return null;
}

const MACH_ICON = { oxygenator: 'hab', reclaimer: 'water', rover: 'rover', suit: 'suit' };
export function renderColony() {
  wire();
  const body = UI.colonyScreen.querySelector('.scr-body');
  const keep = {};
  body.querySelectorAll('.pane').forEach((p) => { keep[p.id] = p.scrollTop; });
  const focusKey = document.activeElement && body.contains(document.activeElement)
    ? ['r', 'u', 'comfort', 'deploy', 'tab'].map((a) => document.activeElement.dataset[a] && `[data-${a}="${document.activeElement.dataset[a]}"]`).find(Boolean) : null;
  const atHome = nearHab();

  // --- inventory ---
  const row = (ic, name, count, unit, note, extra) =>
    `<div class="inv-row ${count > 0 ? 'has' : 'zero'}">${icon(ic)}<span class="nm">${chem(esc(name))}${note ? `<small>${chem(esc(note))}</small>` : ''}</span>` +
    `<span class="ct t-num">${count}${unit ? `<small>\u00a0${unit}</small>` : ''}</span>${extra || ''}</div>`;
  // Food is what the HUD's FOOD counts, row by row: the rows under this heading add up to the figure in it. Seed
  // packets are not food and have a row of their own under Supplies. (A crop's row used to carry its packets in its
  // note, a count of one thing beside a count of another, and the HUD's 13 was set against a list that came to 22.)
  farm();
  const meals = foodTotal();
  let inv = `<div class="pane-hd">Food <span>${meals} ${meals === 1 ? 'meal' : 'meals'} in all</span></div>`;
  inv += row('box', 'Rations', S.food, '', 'One a sol, when the potatoes run out');
  inv += row('food', 'Potatoes', S.potatoes, '', 'Eaten first; also seed for the farm');
  for (const id of PRODUCE) {
    if (S.pantry[id] <= 0 && !(S.stats.grown && S.stats.grown[id])) continue;      // never grown and none in the pantry: not food yet
    inv += row('food', CROPS[id].name, S.pantry[id], '', CROPS[id].note);
  }
  inv += '<div class="pane-hd">Supplies</div>';
  { const packs = PRODUCE.filter((id) => S.seeds[id] > 0), n = packs.reduce((k, id) => k + S.seeds[id], 0);
    inv += row('seed', 'Seed packets', n, '', n ? packs.map((id) => `${CROPS[id].name} ${S.seeds[id]}`).join(' · ') : 'NASA sends seeds with pods and science grants'); }
  inv += row('water', 'Water', Math.round(S.water), 'L');
  inv += row('power', 'Hydrazine burns', S.hydrazine, '', 'Each makes water at the rig');
  inv += '<div class="pane-hd">Morale <span>Out of 100</span></div>';
  inv += `<div class="inv-row has morale ${moraleBand()}">${icon('mood')}<span class="nm">Morale<small>${MORALE_WORD[moraleBand()]}. ${moraleBand() === 'high' ? 'Working and mending faster.' : moraleBand() === 'low' ? 'Everything takes longer. Cook, play music, hear from home.' : 'Variety on the plate and a cooked dinner lift it.'}</small></span><span class="ct t-num">${Math.round(S.morale)}</span></div>`;
  inv += '<div class="pane-hd">Equipment <span>Service each at the machine</span></div>';
  for (const id of Object.keys(MACHINES)) {
    const c = Math.round(S.machines ? S.machines[id] : 100), cost = serviceCost(id);
    const state = c >= 85 ? 'In good order' : c >= 60 ? 'Worn: a service now is free' : c >= 50 ? 'Losing output: a service now is free' : c >= 20 ? 'Losing output: a service needs 1 scrap' : 'Failing: a service needs 1 scrap and 1 circuit board';
    inv += `<div class="inv-row has mach ${c < 20 ? 'crit' : c < 60 ? 'warn' : ''}">${icon(MACH_ICON[id])}<span class="nm">${esc(MACHINES[id].name[0].toUpperCase() + MACHINES[id].name.slice(1))}<small>${state}${cost ? '' : ''}</small></span><span class="ct t-num">${c}<small>%</small></span></div>`;
  }
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
      tags((ok ? '<span class="badge ready">Ready</span>' : '') + (have !== null && have > 0 ? `<span class="badge">Have ${have}</span>` : '')) + '</div>' +
      `<p class="ds">${chem(esc(r.desc + (r.how ? ': ' + r.how[layout.touch ? 1 : 0] : '')))}</p><div class="cost">${costChips(r.cost)}</div>` +
      `<div class="rcp-ft"><button type="button" class="mg-btn small${ok ? ' primary' : ''}" data-r="${r.id}"${ok ? '' : ' disabled'}>Fabricate</button>` +
      // a kit he is carrying can be set down from here too, without a trip to the Inventory tab
      (/^kit/.test(r.id) && have > 0 ? `<button type="button" class="mg-btn small" data-deploy="${r.id.slice(3).toLowerCase()}">Deploy</button>` : '') +
      `<span class="why${can ? '' : ' bad'}">${!can ? chem(esc(missingText(r.cost))) : !atHome ? 'Only at the Hab' : ''}</span></div></article>`;
  }
  // (with nothing to build, the first sol's fabricator was a page of greyed buttons under "0 ready to build": it says
  //  where its materials come from instead)
  craft = `<div class="pane-hd">Fabricator <span>${!atHome ? 'Out of range' : ready ? `${ready} ready to build` : 'Needs materials'}</span></div>` +
    (atHome && !ready ? '<p class="pane-note">Nothing to build yet. The fabricator works in scrap metal and circuit boards: salvage the debris lying around the Hab, and the old landers further out.</p>' : '') + craft;

  // --- upgrades: what can still be installed first; what is in, under its own heading (among the others an installed
  //     card was as tall as its neighbours and half empty) ---
  let up = '', upDone = '', upReady = 0, installed = 0;
  for (const u of UPGRADES) {
    if (S.upgrades[u.id]) {
      installed++;
      upDone += `<article class="rcp done"><div class="rcp-hd"><h4>${chem(esc(u.name))}</h4><span class="badge done">${icon('check')}Installed</span></div><p class="ds">${chem(esc(u.desc))}</p></article>`;
      continue;
    }
    const gate = upgradeGate(u), can = hasCost(u.cost), ok = atHome && !gate && can;
    if (ok) upReady++;
    // (a locked card: the one reason it is locked, what it will take, and no button to press in vain)
    up += `<article class="rcp ${ok ? 'ready' : gate ? 'locked' : ''}" data-card="${u.id}"><div class="rcp-hd"><h4>${chem(esc(u.name))}</h4>` +
      tags(ok ? '<span class="badge ready">Ready</span>' : gate ? `<span class="badge locked">${icon('lock')}Locked</span>` : '') + '</div>' +
      `<p class="ds">${chem(esc(u.desc))}</p><div class="cost">${costChips(u.cost, !!gate)}</div>` +
      (gate ? `<div class="rcp-ft"><span class="why gate">${esc(gate)}</span></div></article>`
        : `<div class="rcp-ft"><button type="button" class="mg-btn small${ok ? ' primary' : ''}" data-u="${u.id}"${ok ? '' : ' disabled'}>Install</button>` +
          `<span class="why${!can ? ' bad' : ''}">${!can ? chem(esc(missingText(u.cost))) : !atHome ? 'Only at the Hab' : ''}</span></div></article>`);
  }
  // (a tab's figure is how many things on its page can be made now, and its page's heading says that figure first:
  //  "UPGRADES 4" stood over "2 OF 10 INSTALLED" and "HOME 6" over "2 OF 9 MADE")
  up = `<div class="pane-hd">Upgrades <span>${upReady ? `${upReady} ready · ` : ''}${installed} of ${UPGRADES.length} installed</span></div>` + up +
    (upDone ? `<div class="pane-hd">Installed <span>${installed}</span></div>${upDone}` : '');

  // --- home: comforts for the Hab (those made, under their own heading, as with the upgrades) ---
  let home = '', homeDone = '', homeReady = 0;
  const madeN = comfortCount();
  for (const c of COMFORTS) {
    const made = !!comforts()[c.id], block = made ? null : comfortBlock(c.id, World), locked = !made && !!(c.needs && !c.needs(World));
    const ok = !made && !block && atHome;
    if (ok) homeReady++;
    const costHtml = Object.keys(c.cost).length ? costChips(c.cost, locked) : '<span class="chip ok">Nothing but time</span>';
    const card = `<article class="rcp ${made ? 'done' : ok ? 'ready' : locked ? 'locked' : ''}" data-card="${c.id}"><div class="rcp-hd"><h4>${esc(c.name)}</h4>` +
      tags((made ? `<span class="badge done">${icon('check')}Made</span>` : ok ? '<span class="badge ready">Ready</span>' : locked ? `<span class="badge locked">${icon('lock')}Locked</span>` : '') +
        `<span class="badge mood">${icon('mood')}+${halves(c.cheer)} a sol</span>`) + `</div><p class="ds">${esc(c.desc)}</p>` +
      (made ? '' : `<div class="cost">${costHtml}</div>` + (locked ? `<div class="rcp-ft"><span class="why gate">${esc(c.why)}</span></div>`
        : `<div class="rcp-ft"><button type="button" class="mg-btn small${ok ? ' primary' : ''}" data-comfort="${c.id}"${ok ? '' : ' disabled'}>Make</button>` +
          `<span class="why${block && block !== 'Made' ? ' bad' : ''}">${block === 'Not enough materials' ? chem(esc(missingText(c.cost))) : !atHome ? 'Only at the Hab' : ''}</span></div>`)) +
      '</article>';
    if (made) homeDone += card; else home += card;
  }
  home = `<div class="pane-hd">Home <span>${homeReady ? `${homeReady} ready · ` : ''}${madeN} of ${COMFORTS.length} made · morale +${halves(comfortCheer())} a sol</span></div>` +
    '<p class="pane-note intro">Things to make the Hab a place to live in. Each one lifts morale a little every dawn.</p>' + home +
    (homeDone ? `<div class="pane-hd">Made <span>${madeN}</span></div>${homeDone}` : '');

  // (the number is how many things on that tab can be made now; the tab's own heading says so in words. Every tab of
  //  this screen and of the journal carries its count the same way, a figure in a pill: there were three styles, a
  //  filled "6 READY", round badges and bare numerals.)
  const tab = (id, ic, label, n) => `<button type="button" role="tab" aria-selected="${colonyTab === id}" data-tab="${id}"${colonyTab === id ? ' data-autofocus' : ''}` +
    `${n ? ` aria-label="${label}: ${n} ready"` : ''}>${icon(ic)}${label}${n ? `<em class="t-num">${n}</em>` : ''}</button>`;
  // (The tabs come first and stay where they are. Away from the Hab a line under them says the fabricator is out of
  //  reach; at the Hab there is nothing to say, and the room is the cards'. The line used to be a banner over the tabs,
  //  which pushed them down a row whenever he walked out of range.)
  body.innerHTML = '<div class="colony">' +
    `<div class="tabs" role="tablist">${tab('inv', 'box', 'Inventory')}${tab('craft', 'colony', 'Fabricate', ready)}${tab('build', 'up', 'Upgrades', upReady)}${tab('home', 'hab', 'Home', homeReady)}</div>` +
    (atHome ? '' : `<div class="col-bar off">${icon('warning')}<b>Fabricator out of range</b><span>Return to the Hab to fabricate or install. You can still deploy kits you carry.</span></div>`) +
    '<div class="cols">' +
    `<section class="pane mg-scroll${colonyTab === 'inv' ? ' on' : ''}" id="mg-inv" aria-label="Inventory">${inv}</section>` +
    `<section class="pane mg-scroll${colonyTab === 'craft' ? ' on' : ''}" id="mg-craft" aria-label="Fabrication">${craft}</section>` +
    `<section class="pane mg-scroll${colonyTab === 'build' ? ' on' : ''}" id="mg-build" aria-label="Upgrades">${up}</section>` +
    `<section class="pane mg-scroll${colonyTab === 'home' ? ' on' : ''}" id="mg-home" aria-label="Home">${home}</section>` +
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
  body.querySelectorAll('button[data-comfort]').forEach((b) => b.addEventListener('click', () => {
    if (!nearHab()) return;
    const line = makeComfort(b.dataset.comfort, World);
    if (!line) return;
    Snd.craft();
    log(line);
    syncAllVisuals();
    checkAchievements();
    renderColony();
    bump(b.dataset.comfort);
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
  fiveaday: () => [S.stats.grown ? Object.keys(S.stats.grown).length : 0, 5, ''], chef: () => [S.diet ? S.diet.meals : 0, 5, ''], home: () => [S.comforts ? Object.keys(S.comforts).length : 0, 6, ''],
};
const FEATURE_KIND = { volcano: 'Volcano', basin: 'Impact basin', crater: 'Crater', canyon: 'Canyon', cap: 'Polar cap' };
const num = (v) => (v >= 100 || Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(1));

/**
 * The whole of the way home, in three steps, at the head of the journal's task page from the first sol: what the
 * mission list's lines are for. (After ten minutes of play nothing had said that the rescue is a rocket a long drive
 * away, or that Earth has to be told first.) A strip, not a page: each step is a few words and one line.
 */
function wayHomeHtml() {
  const mav = fmtDist(groundDist(World.hab.position, World.mav.position));
  const radio = S.pf.connected ? 'Houston knows. NASA’s tasks are below.'
    : S.pf.loaded ? 'Pathfinder is aboard the rover: bring it to the uplink ring.'
      : S.flags.pfRevealed ? `Pathfinder’s radio can: Ares Vallis, ${fmtDist(distTo(World.pathfinder.position))} away. Take the rover.`
        : 'An old lander’s radio can. The charts will show where it lies in a few sols.';
  const steps = [
    ['Every sol', 'Stay alive', 'Food, water, air and power.', 'now'],
    [S.pf.connected ? 'Done' : 'Then', 'Tell Earth', radio, S.pf.connected ? 'done' : 'next'],
    [`Sol ${S.rescueSol}`, 'Fly home', `The MAV, the only rocket on Mars: in Schiaparelli, ${mav} from the Hab.${S.flags.mavRevealed ? ' The window is open.' : ` It can launch on Sol ${S.rescueSol}.`}`, S.pf.connected ? 'next' : ''],
  ];
  return '<div class="pane-hd">The way home</div><ol class="way">' +
    steps.map(([k, t, d, cls]) => `<li class="${cls}"><b>${esc(k)}</b><strong>${esc(t)}</strong><span>${chem(esc(d))}</span></li>`).join('') + '</ol>';
}
/** The places with a note in the journal: what the Discoveries page lists as places. */
const journalPlaces = () => FEATURES.filter((f) => f.type !== 'bulge' && f.type !== 'albedo' && f.note);
/**
 * How many discoveries he has made: the landers found, the places visited and the sights seen, which is what the
 * journal's Discoveries page lists. The tab, the statistics and the rescue screen all give this one number. (The tab
 * gave one count and the statistics tile under the same word another.)
 */
export function discoveriesFound() {
  return World.landers.filter((r) => S.discovered[r.data.name]).length + journalPlaces().filter((f) => S.discovered[f.name]).length + sightList().filter((x) => x.sol).length;
}
function tasksHtml() {
  // (the tab's figure is the tasks still to do, the mission's and NASA's: the two headings under it say how many each)
  const toDo = missionList().filter((e) => !e.done).length;
  let h = wayHomeHtml() + `<div class="pane-hd">Mission <span>${toDo} to do</span></div><div class="obj-list">`;
  let primary = false, open = '', closed = '', nDone = 0;
  // as on the HUD (the same list, the same distances): the most pressing first, each with its reason and how far
  for (const { o, done: d } of missionList()) {
    let cls = d ? 'done' : o.urgent ? 'urgent' : '';
    if (!d && !primary) { primary = true; if (!o.urgent) cls = 'primary'; }
    const why = d ? '' : objectiveWhy(o);
    // (the reason is its own line under the title: run on, it read "seal itThe Hab is losing its air")
    const row = `<div class="obj ${cls}"><i class="mk"></i><span class="tx">${chem(esc(o.text()))}</span><span class="ds t-num">${d ? '' : objectiveDist(o)}</span>${why ? `<span class="why">${chem(esc(why))}</span>` : ''}</div>`;
    if (d) { closed += row; nDone++; } else open += row;
  }
  h += (open || '<div class="obj"><i class="mk"></i><span class="tx">Stay alive.</span></div>') + '</div>';
  const doneHtml = closed ? `<div class="pane-hd">Done <span>${nDone}</span></div><div class="obj-list done-list">${closed}</div>` : '';
  const active = QUEST_DEFS.filter((q) => S.quests[q.id] === 'active').length;
  const done = QUEST_DEFS.filter((q) => S.quests[q.id] === 'done').length;
  h += `<div class="pane-hd">NASA survey tasks <span>${S.pf.connected ? `${active} active · ${done} complete` : 'No uplink'}</span></div>`;
  if (!S.pf.connected) {
    // (what an uplink is and how to come by one: "No uplink" stood over an empty box)
    return h + `<div class="empty">${icon('dish')}<b>No uplink yet</b>Earth does not know you are alive. Once a radio is working (the second step of the way home), NASA sends survey tasks here, and pays for them in supply pods and blueprints.</div>` + doneHtml;
  }
  const list = QUEST_DEFS.map((q) => ({ q, st: S.quests[q.id], pos: questTargetPos(q) }))
    .map((x) => ({ ...x, d: x.pos ? distTo(x.pos) : -1 }))
    .sort((a, b) => (a.st === 'done') - (b.st === 'done') || a.d - b.d);
  h += '<div class="jr-grid">';
  for (const { q, st, d } of list) {
    const isDone = st === 'done';
    const loot = Object.keys(q.loot || {}).map((k) => `<span class="chip"><b class="t-num">${q.loot[k]}</b> ${chem(esc(itemName(k, q.loot[k])))}</span>`).join('');
    const bp = q.bp ? `<span class="chip bp">${icon('blueprint')}${chem(esc((UPGRADES.find((u) => u.bp === q.bp) || { name: q.bp }).name))} blueprint</span>` : '';
    const reveal = q.reveal ? `<span class="chip bp">${icon('map')}Full survey map</span>` : '';
    h += `<article class="card quest${isDone ? ' done' : ''}"><div class="card-hd">${icon(isDone ? 'check' : 'target')}<h4><span class="nm">${esc(q.name)}</span>${q.target ? ` <small>${esc(q.target)}</small>` : ''}</h4>` +
      (isDone ? '<span class="badge done">Complete</span>' : d >= 0 ? `<span class="dist t-num">${fmtDist(d)}</span>` : '<span class="badge active">Active</span>') + '</div>' +
      `<p>${chem(esc(q.desc))}</p><div class="meta">${loot}${bp}${reveal}</div></article>`;
  }
  return h + '</div>' + doneHtml;
}
function discoveriesHtml() {
  // (what is still to find is one card with a count: a card apiece was a wall of identical padlocks)
  const more = (n, one, many, line) => (n ? `<article class="card locked"><div class="card-hd">${icon('lock')}<h4>${n} more ${n === 1 ? one : many}</h4></div><p>${line}</p></article>` : '');
  const landers = World.landers, found = landers.filter((r) => S.discovered[r.data.name]);
  const album = S.album || {}, shot = found.filter((r) => album[r.data.name]).length;
  // (The tab's figure is everything found: landers, places and sights. The page says so at its head, and then each
  //  of the three under its own heading: "DISCOVERIES 9" stood over "5 OF 14 FOUND", which counted the landers alone.)
  const placesSeen = journalPlaces().filter((f) => S.discovered[f.name]).length, sightsSeen = sightList().filter((x) => x.sol).length;
  const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
  // (what NASA wants of them is said once, under the heading; each card then carries a mark. The same sentence was on every card.)
  let h = `<p class="pane-note first">${n(discoveriesFound(), 'discovery', 'discoveries')} so far: ${n(found.length, 'lander', 'landers')}, ${n(placesSeen, 'place', 'places')}, ${n(sightsSeen, 'sight', 'sights')}.</p>` +
    `<div class="pane-hd">Landers <span>${found.length} of ${landers.length} found · ${shot} photographed</span></div>` +
    (found.length > shot ? `<p class="pane-note">NASA would like a photograph of each: stand near one and choose ${layout.touch ? 'Photo mode from MENU' : 'Photo mode (P)'}.</p>` : '') + '<div class="jr-grid">';
  for (const rec of found.sort((x, y) => x.data.year - y.data.year)) {
    // (the name is one piece and the year follows it or goes under it; the badges take the line below where the card
    //  is narrow. On the small phone the badge and the year were printed over the name.)
    h += `<article class="card got"><div class="card-hd">${icon('lander')}<h4><span class="nm">${esc(rec.data.name)}</span> <small>${rec.data.year}</small></h4>` +
      tags(`${album[rec.data.name] ? `<span class="badge done">${icon('camera')}Photographed</span>` : `<span class="badge">${icon('camera')}No photo yet</span>`}${S.salvaged[rec.data.name] ? '<span class="badge done">Salvaged</span>' : ''}`) + '</div>' +
      `<p>${esc(rec.data.note)}</p></article>`;
  }
  h += more(landers.length - found.length, 'lander', 'landers', S.flags.mapRevealed ? 'Their signals are on the map. Go and find them.' : 'Every machine sent to Mars is still where it stopped. Find them out there.');
  const places = journalPlaces();
  const seen = places.filter((f) => S.discovered[f.name]);
  h += `</div><div class="pane-hd">Places <span>${seen.length} of ${places.length} visited</span></div><div class="jr-grid">`;
  for (const f of seen) {
    h += `<article class="card got"><div class="card-hd">${icon('pin')}<h4><span class="nm">${esc(f.name)}</span> <small>${FEATURE_KIND[f.type] || ''}</small></h4></div><p>${esc(f.note)}</p></article>`;
  }
  h += more(places.length - seen.length, 'place', 'places', 'Volcanoes, canyons, basins and craters you have not stood in yet. Their names are on the map.');
  // sights: each one not yet seen keeps its own card, because each has its own hint
  const sl = sightList();
  h += `</div><div class="pane-hd">Sights <span>${sl.filter((x) => x.sol).length} of ${sl.length} seen</span></div><div class="jr-grid">`;
  for (const x of sl.slice().sort((p, q) => !!q.sol - !!p.sol)) {
    h += x.sol
      ? `<article class="card got"><div class="card-hd">${icon('eye')}<h4><span class="nm">${esc(x.name)}</span> <small>Sol ${x.sol}</small></h4></div><p>${esc(x.text)}</p></article>`
      : `<article class="card locked"><div class="card-hd">${icon('lock')}<h4>${esc(x.name)}</h4></div><p>${esc(x.text)}</p></article>`;
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
      prog = `<div class="prog"><i style="--p:${Math.min(100, v / max * 100).toFixed(0)}%"></i><span class="t-num">${num(Math.min(v, max))} of ${num(max)}${unit}</span></div>`;
    }
    h += `<article class="card ${g ? 'got' : 'locked'}"><div class="card-hd">${icon(g ? 'trophy' : 'lock')}<h4>${esc(a.name)}</h4>${tags(g ? '<span class="badge done">Earned</span>' : '')}</div><p>${esc(g ? achievementDone(a) : a.desc)}</p>${prog}</article>`;
  }
  return h + '</div>';
}
function statsHtml() {
  const st = S.stats;
  const tile = (v, unit, label) => `<div class="stat"><b class="t-num">${v}${unit ? `<small>${unit}</small>` : ''}</b><span>${label}</span></div>`;
  return `<div class="pane-hd">This run <span>${esc(DIFFICULTIES[S.diff].name)} · rescue on Sol ${S.rescueSol}</span></div><div class="stat-grid">` +
    tile(S.sol, '', 'Sols survived') + tile(Math.max(0, S.rescueSol - S.sol), '', 'Sols to rescue') +
    tile((st.walked / 1000).toFixed(1), 'km', 'Walked') + tile((st.driven / 1000).toFixed(1), 'km', 'Driven') +
    tile(st.potatoes + (st.produce || 0), '', 'Food grown') + tile(st.panels, '', 'Panels wiped') + tile(st.crafted, '', 'Things fabricated') +
    tile(st.mined, '', 'Ice chunks mined') + tile(discoveriesFound(), '', 'Discoveries') + tile(st.sights || 0, '', 'Sights logged') + tile(st.photographed || 0, '', 'Landers photographed') + tile(Object.keys(S.salvaged).length, '', 'Landers salvaged') +
    tile(World.builtMeshes.length, '', World.builtMeshes.length === 1 ? 'Structure deployed' : 'Structures deployed') + tile(st.booms, '', 'Hydrazine burns') + tile(st.closeCalls, '', 'Close calls') +
    tile(Math.round(st.stormOut), 's', 'Out in storms') + (st.discoTime >= 1 ? tile(Math.round(st.discoTime), 's', 'Disco endured') : '') +
    '</div>';
}
function logHtml() {
  if (!logHistory.length) return `<div class="empty">${icon('journal')}<b>Nothing logged yet</b>What you, the Hab and NASA say is kept here.</div>`;
  let h = `<div class="pane-hd">Log <span>The last ${logHistory.length === 1 ? 'entry' : logHistory.length + ' entries'}, newest first</span></div><div class="jlog">`;
  for (let i = logHistory.length - 1; i >= 0; i--) {
    const l = logHistory[i];
    h += `<div class="mg-line ${l.voice}"><span class="who">${VOICES[l.voice] || VOICES.sys}<small>SOL ${l.sol}</small></span><span class="tx">${chem(esc(logText(l)))}</span></div>`;
  }
  return h + '</div>';
}
function samplesHtml() {
  const s = scienceSummary(), list = catalogue();
  // (what the figures are for, and what to do about them: "52 SCIENCE" and "A NASA grant is waiting on the next
  //  analysis" told him nothing he could act on)
  let h = `<div class="pane-hd">Field samples <span>${s.kinds} of ${s.of} materials catalogued</span></div>` +
    (s.nextGrant ? `<p class="pane-note">${s.points >= s.nextGrant ? `${s.points} science points: NASA has a supply grant for you. Analyse any sample at the Hab’s work table to receive it.`
      : `${s.points} science points. NASA sends a supply grant at ${s.nextGrant}; a material you have not catalogued is worth the most.`}</p>` : '');
  if (!s.kinds && !s.bagged) h += `<div class="empty">${icon('layers')}<b>Nothing catalogued yet</b>Chip a sample off any boulder; on new ground, bag a scoop of soil too. The analyser on the Hab work table says what each is. What you find depends on where on Mars you are standing.</div>`;
  else if (s.bagged) h += `<p class="jr-note">${s.bagged} of ${s.limit} sample bags are full and waiting for the analyser in the Hab.</p>`;
  h += '<div class="jr-grid">';
  for (const m of list.filter((x) => x.count).sort((a, b) => b.value - a.value)) {
    h += `<article class="card got"><div class="card-hd">${icon('layers')}<h4><span class="nm">${esc(m.name)}</span> <small>${m.kind === 'soil' ? 'Soil' : 'Rock'}</small></h4>${tags(`<span class="badge done">${m.count} sample${m.count > 1 ? 's' : ''}</span>`)}</div><p>${chem(esc(m.text))}</p></article>`;
  }
  h += '</div>';
  // what is still to find: one list of leads (a card apiece was a wall of identical question marks)
  const leads = list.filter((x) => !x.count);
  if (leads.length) {
    h += `<div class="pane-hd">Still to find <span>${leads.length} material${leads.length > 1 ? 's' : ''}: where to look</span></div><ul class="leads">` +
      leads.map((m) => `<li><b>${m.kind === 'soil' ? 'Soil' : 'Rock'}</b><span>${chem(esc(m.text))}</span></li>`).join('') + '</ul>';
  }
  return h;
}
const JOURNAL_TABS = [['tasks', 'target', 'Tasks', tasksHtml], ['disc', 'pin', 'Discoveries', discoveriesHtml], ['samples', 'layers', 'Samples', samplesHtml], ['ach', 'trophy', 'Achievements', achievementsHtml],
  ['stats', 'chart', 'Statistics', statsHtml], ['log', 'list', 'Log', logHtml]];
export function renderJournal() {
  wire();
  const body = UI.journalScreen.querySelector('.scr-body');
  // A tab's count is the number of things its page lists as open or found, so the two always agree: the tasks still to
  // do (the mission's and NASA's), the landers, places and sights found, the materials catalogued, the achievements
  // earned. ("Tasks 6" stood over three mission tasks: it counted NASA's alone. And Samples had no count.)
  const counts = {
    tasks: missionList().filter((e) => !e.done).length + QUEST_DEFS.filter((q) => S.quests[q.id] === 'active').length || '',
    disc: discoveriesFound() || '',
    ach: ACHIEVEMENTS.filter((a) => S.achieved[a.id]).length || '', samples: scienceSummary().kinds || '',
  };
  const cur = JOURNAL_TABS.find((t) => t[0] === journalTab) || JOURNAL_TABS[0];
  body.innerHTML = '<div class="journal"><div class="tabs" role="tablist">' +
    JOURNAL_TABS.map(([id, ic, label]) => `<button type="button" role="tab" aria-selected="${id === cur[0]}" data-tab="${id}"${id === cur[0] ? ' data-autofocus' : ''}>${icon(ic)}${label}${counts[id] ? `<em class="t-num">${counts[id]}</em>` : ''}</button>`).join('') +
    `</div><div class="jr-body mg-scroll" role="tabpanel" aria-label="${cur[2]}">${cur[3]()}</div></div>`;
  body.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    journalTab = b.dataset.tab;
    Snd.click();
    renderJournal();
    const again = body.querySelector(`[data-tab="${journalTab}"]`);
    if (again) again.focus({ preventScroll: true });
  }));
}
