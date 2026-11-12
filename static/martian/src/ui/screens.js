import { UI, log } from './dom.js';
import { Snd } from '../audio/sound.js';
import { fmtDist, groundDist, vecToLl } from '../planet/geo.js';
import { _v1 } from '../core/scratch.js';
import { FEATURES, REGIONS } from '../planet/features.js';
import { S } from '../game/state.js';
import { R } from '../planet/constants.js';
import { World } from '../world/build.js';
import { player } from '../game/player.js';
import { ITEM_NAMES, RECIPES, UPGRADES, costStr, hasCost, nearHab, payCost } from '../game/inventory.js';
import { startDeploy } from '../game/interactables.js';
import { ACHIEVEMENTS, QUEST_DEFS, questTargetPos } from '../game/story.js';
import { ctx as gctx } from '../game/ctx.js';
// Full-screen screens: the map, colony (inventory and fabrication), and the journal.
export function screenOpen() {
  return UI.mapScreen.style.display === 'block' || UI.colonyScreen.style.display === 'block' || UI.journalScreen.style.display === 'block';
}
export function closeScreens() {
  UI.mapScreen.style.display = 'none';
  UI.colonyScreen.style.display = 'none';
  UI.journalScreen.style.display = 'none';
}
for (const s of [UI.mapScreen, UI.colonyScreen, UI.journalScreen]) {
  const c = s.querySelector('.close');
  c.addEventListener('click', (ev) => { ev.stopPropagation(); Snd.click(); closeScreens(); });
  c.addEventListener('touchstart', (ev) => { ev.preventDefault(); ev.stopPropagation(); Snd.click(); closeScreens(); }, { passive: false });
}
export function toggleScreen(which) {
  const elMap = { map: UI.mapScreen, colony: UI.colonyScreen, journal: UI.journalScreen };
  const target = elMap[which];
  const wasOpen = target.style.display === 'block';
  closeScreens();
  if (!wasOpen) {
    target.style.display = 'block';
    try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    if (which === 'map') renderMap();
    if (which === 'colony') renderColony();
    if (which === 'journal') renderJournal();
    Snd.click();
  }
}

export const MAP_W = 1440, MAP_H = 720;
export function llToMap(lat, lon) { return [((lon % 360) + 360) % 360 / 360 * MAP_W, (90 - lat) / 180 * MAP_H]; }
export function posToMap(p) { const ll = vecToLl(_v1.copy(p).normalize()); return llToMap(ll.lat, ll.lon); }
export let mapTimer = 0;
export function renderMap() {
  const cv = UI.mapCanvas;
  cv.width = MAP_W; cv.height = MAP_H;
  cv.style.width = 'min(100%, 1200px)';
  const ctx = cv.getContext('2d');
  if (gctx.mapImage) ctx.drawImage(gctx.mapImage, 0, 0, MAP_W, MAP_H); else { ctx.fillStyle = '#5a2d1a'; ctx.fillRect(0, 0, MAP_W, MAP_H); }
  ctx.font = '9px monospace';
  // region labels
  ctx.fillStyle = 'rgba(255,230,200,0.75)';
  for (const r of REGIONS) {
    const [x, y] = llToMap(r.lat, r.lon);
    ctx.fillText(r.name, x - r.name.length * 2.2, y);
  }
  // storms
  for (const c of S.storm.cells) {
    const [x, y] = llToMap(c.lat, c.lon);
    ctx.beginPath();
    ctx.arc(x, y, c.r / (2 * Math.PI * R) * MAP_W, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(160,90,40,0.35)';
    ctx.fill();
  }
  const dot = (p, color, label) => {
    const [x, y] = posToMap(p);
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
    if (label) { ctx.fillStyle = color; ctx.fillText(label, x + 4, y + 3); }
  };
  for (const rec of World.landers) {
    if (S.discovered[rec.data.name]) dot(rec.group.position, '#9ecfff', rec.data.name);
    else if (S.flags.mapRevealed) dot(rec.group.position, 'rgba(158,207,255,0.45)', '?');
  }
  for (const b of World.builtMeshes)
    dot(b.group.position, b.kind === 'beacon' ? '#4fd8ff' : '#c0b090', b.kind === 'beacon' ? 'beacon' : '');
  for (const p of World.pods) if (!p.taken) dot(p.group.position, '#ffd27f', 'cache');
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) dot(World.pathfinder.position, '#ffef9e', 'PATHFINDER');
  dot(World.mav.position, S.flags.mavRevealed ? '#ff7f5f' : 'rgba(255,127,95,0.5)', 'ARES 4 MAV');
  dot(World.hab.position, '#7fff9e', 'HAB');
  dot(World.rover.group.position, '#ffb45e', 'rover');
  // player: white dot + facing tick
  {
    const [x, y] = posToMap(player.pos);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  UI.mapScreen.querySelector('#mg-maplegend').innerHTML =
    `SOL ${S.sol} · lat ${vecToLl(_v1.copy(player.pos).normalize()).lat.toFixed(1)}° lon ${vecToLl(_v1).lon.toFixed(1)}°E · ` +
    `discovered ${S.stats.discoveries} · storms shown as brown cells`;
}

// --- colony: inventory / fabrication / upgrades ---
export function renderColony() {
  const inv = UI.colonyScreen.querySelector('#mg-inv');
  const craft = UI.colonyScreen.querySelector('#mg-craft');
  const build = UI.colonyScreen.querySelector('#mg-build');
  let html = '<h3>SUPPLIES</h3>';
  html += `<div class="mg-item"><span>Rations</span><span>${S.food}</span></div>`;
  html += `<div class="mg-item"><span>Potatoes</span><span>${S.potatoes}</span></div>`;
  html += `<div class="mg-item"><span>Water</span><span>${S.water.toFixed(0)}L</span></div>`;
  html += `<div class="mg-item"><span>Hydrazine burns</span><span>${S.hydrazine}</span></div>`;
  html += '<h3>MATERIALS</h3>';
  for (const k of ['scrap', 'circuit', 'regolith', 'ice', 'candle'])
    html += `<div class="mg-item"><span>${ITEM_NAMES[k]}</span><span>${S.inv[k] || 0}</span></div>`;
  html += '<h3>KITS (craft, then place outside)</h3>';
  for (const k of ['kitSolar', 'kitGreenhouse', 'kitBeacon', 'kitCache']) {
    const n = S.inv[k] || 0;
    html += `<div class="mg-item"><span>${ITEM_NAMES[k]}</span><span>${n}${n > 0 ? ` <button class="mg-btn" style="padding:2px 8px;font-size:10px" data-deploy="${k.slice(3).toLowerCase()}">DEPLOY</button>` : ''}</span></div>`;
  }
  if (S.flags.hasRtg && !S.upgrades.rtg) html += '<div class="mg-item"><span>RTG (unsocketed)</span><span>☢</span></div>';
  inv.innerHTML = html;
  inv.querySelectorAll('[data-deploy]').forEach(b => b.onclick = () => startDeploy(b.dataset.deploy));

  const atHome = nearHab();
  let ch = `<h3>FABRICATOR ${atHome ? '' : '— out of range (return to the Hab)'}</h3>`;
  for (const r of RECIPES) {
    const ok = atHome && hasCost(r.cost);
    ch += `<div class="mg-recipe"><div class="rn">${r.name}</div><div class="rc">${r.desc}<br>needs: ${costStr(r.cost)}</div>` +
      `<button data-r="${r.id}" ${ok ? '' : 'disabled'}>FABRICATE</button></div>`;
  }
  craft.innerHTML = ch;
  craft.querySelectorAll('button[data-r]').forEach(b => b.onclick = () => {
    const r = RECIPES.find(x => x.id === b.dataset.r);
    if (!r || !hasCost(r.cost) || !nearHab()) return;
    if (r.run) {
      const res = r.run();
      if (res !== true) { log(res, 'sys'); return; }
      payCost(r.cost);
    } else {
      payCost(r.cost);
      for (const k in r.gives) S.inv[k] = (S.inv[k] || 0) + r.gives[k];
    }
    S.stats.crafted++;
    Snd.craft();
    renderColony();
  });

  let uh = '<h3>UPGRADES</h3>';
  for (const u of UPGRADES) {
    if (S.upgrades[u.id]) { uh += `<div class="mg-recipe"><div class="rn">✓ ${u.name}</div><div class="rc">${u.desc}</div></div>`; continue; }
    let gate = null;
    if (u.bp && !S.blueprints[u.bp]) gate = 'blueprint required (survey tasks)';
    if (u.needs && !S.upgrades[u.needs]) gate = `requires ${UPGRADES.find(x => x.id === u.needs).name}`;
    if (u.needsRtg && !S.flags.hasRtg) gate = 'requires the buried RTG';
    const ok = atHome && !gate && hasCost(u.cost);
    uh += `<div class="mg-recipe"><div class="rn">${u.name}</div><div class="rc">${u.desc}<br>needs: ${costStr(u.cost)}${gate ? '<br>⚠ ' + gate : ''}</div>` +
      `<button data-u="${u.id}" ${ok ? '' : 'disabled'}>INSTALL</button></div>`;
  }
  build.innerHTML = uh;
  build.querySelectorAll('button[data-u]').forEach(b => b.onclick = () => {
    const u = UPGRADES.find(x => x.id === b.dataset.u);
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
  });
}

// --- journal ---
export function renderJournal() {
  const qEl = UI.journalScreen.querySelector('#mg-quests');
  const dEl = UI.journalScreen.querySelector('#mg-discoveries');
  const aEl = UI.journalScreen.querySelector('#mg-achievements');
  let qh = '<h3>NASA SURVEY TASKS</h3>';
  if (!S.pf.connected) qh += '<div class="mg-jrow locked"><div class="jn">No uplink</div><div class="jd">Restore Pathfinder to receive survey tasks.</div></div>';
  else for (const q of QUEST_DEFS) {
    const st = S.quests[q.id];
    const d = questTargetPos(q) ? ` — ${fmtDist(groundDist(player.pos, questTargetPos(q)))}` : '';
    qh += `<div class="mg-jrow${st === 'done' ? '' : ''}"><div class="jn">${st === 'done' ? '✓ ' : ''}${q.name}${d}</div><div class="jd">${q.desc}</div></div>`;
  }
  qEl.innerHTML = qh;
  let dh = `<h3>DISCOVERIES (${S.stats.discoveries})</h3>`;
  for (const rec of World.landers) {
    const known = S.discovered[rec.data.name];
    dh += `<div class="mg-jrow${known ? '' : ' locked'}"><div class="jn">${known ? rec.data.name + ' (' + rec.data.year + ')' : '??? — undiscovered lander'}</div>` +
      `<div class="jd">${known ? rec.data.note : 'Find it out there.'}</div></div>`;
  }
  for (const f of FEATURES) {
    if (f.type === 'bulge' || f.type === 'albedo' || !f.note) continue;
    const known = S.discovered[f.name];
    dh += `<div class="mg-jrow${known ? '' : ' locked'}"><div class="jn">${known ? f.name : '??? — uncharted region'}</div>` +
      `<div class="jd">${known ? f.note : ''}</div></div>`;
  }
  dEl.innerHTML = dh;
  let ah = '<h3>ACHIEVEMENTS</h3>';
  for (const a of ACHIEVEMENTS) {
    const got = S.achieved[a.id];
    ah += `<div class="mg-jrow ach${got ? '' : ' locked'}"><div class="jn">${got ? '★ ' : '☆ '}${a.name}</div><div class="jd">${a.desc}</div></div>`;
  }
  aEl.innerHTML = ah;
}
