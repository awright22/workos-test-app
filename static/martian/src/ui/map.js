// The map screen: the shaded-relief atlas of Mars with zoom and pan (wheel, drag, pinch, keys),
// decluttered labels, the day/night line, storm cells, and a marker for everything worth
// driving to. Tapping a marker, or any point, says what it is and how far.
import { UI, el, esc } from './dom.js';
import { icon, drawIcon } from './icons.js';
import { layout, onLayout } from './layout.js';
import { reducedMotion } from './settings.js';
import { fmtDist, groundDist, llToVec, vecToLl } from '../planet/geo.js';
import { _v1 } from '../core/scratch.js';
import { FEATURES, REGIONS, regionName } from '../planet/features.js';
import { BAL, S, roverPowerCap } from '../game/state.js';
import { R } from '../planet/constants.js';
import { World } from '../world/build.js';
import { player } from '../game/player.js';
import { QUEST_DEFS } from '../game/story.js';
import { ctx as gctx } from '../game/ctx.js';
import { absBearing, distTo, headingOf } from './hud.js';
import { roverF } from '../game/rover.js';

const IMG_PPD = 8;                      // the atlas is 2880 x 1440: 8 pixels per degree
const MAX_PPD = 72;
const KM_PER_DEG = (2 * Math.PI * R) / 360 / 1000;
const R2D = 180 / Math.PI;
const view = { lon: 180, lat: 0, ppd: 0 };      // centre and scale (CSS pixels per degree)
let goal = null;                                 // the view being eased to, or null
let cv = null, c = null, wrap = null, legend = null, info = null, statusPos = null, statusHint = null, scaleEl = null, scaleLbl = null;
let W = 0, H = 0, dpr = 1, raf = 0, opened = false;
let U = 1;                                       // the interface scale: 1 at a 16 px root; everything drawn on the canvas follows it
let markers = [], selected = null, hover = null;
const col = {};

const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
const minPpd = () => Math.max(W / 360, H / 180);
function clampView(v) {
  v.ppd = clampN(v.ppd, minPpd(), MAX_PPD);
  const halfLat = H / 2 / v.ppd;
  v.lat = halfLat >= 90 ? 0 : clampN(v.lat, -90 + halfLat, 90 - halfLat);
  v.lon = ((v.lon % 360) + 360) % 360;
  return v;
}
/** Screen x of a longitude, choosing the copy of the world nearest the view centre. */
function sx(lon) { let d = lon - view.lon; d = ((d + 540) % 360) - 180; return W / 2 + d * view.ppd; }
function sy(lat) { return H / 2 - (lat - view.lat) * view.ppd; }
function unproject(x, y) { return { lon: ((view.lon + (x - W / 2) / view.ppd) % 360 + 360) % 360, lat: clampN(view.lat - (y - H / 2) / view.ppd, -90, 90) }; }
const fmtLat = (v) => `${Math.abs(v).toFixed(1)}°${v >= 0 ? 'N' : 'S'}`;
const fmtLL = (ll) => `${fmtLat(ll.lat)} ${ll.lon.toFixed(1)}°E`;
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function bearingText(rad) { const d = Math.round(((rad * R2D) % 360 + 360) % 360) % 360; return `${COMPASS[Math.round(d / 45) % 8]} ${d}°`; }

function resize() {
  if (!cv) return;
  const r = wrap.getBoundingClientRect();
  if (!r.width || !r.height) return;
  W = r.width; H = r.height - layout.rem * (layout.compact ? 2 : 2.5);          // the status bar covers the bottom strip
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  U = layout.rem / 16;
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  if (!view.ppd) view.ppd = minPpd();
  clampView(view);
}
function request() { if (!raf) raf = requestAnimationFrame(frame); }
function frame() {
  raf = 0;
  if (goal) {
    const k = reducedMotion() ? 1 : 0.24;
    let dl = goal.lon - view.lon; dl = ((dl + 540) % 360) - 180;
    view.lon += dl * k; view.lat += (goal.lat - view.lat) * k; view.ppd *= Math.pow(goal.ppd / view.ppd, k);
    clampView(view);
    if (Math.abs(dl) * view.ppd < 0.5 && Math.abs(goal.lat - view.lat) * view.ppd < 0.5 && Math.abs(goal.ppd / view.ppd - 1) < 0.004) { Object.assign(view, goal); clampView(view); goal = null; }
    else request();
  }
  draw();
}
function easeTo(v) { goal = clampView({ lon: v.lon !== undefined ? v.lon : view.lon, lat: v.lat !== undefined ? v.lat : view.lat, ppd: v.ppd || view.ppd }); request(); }
/** Zoom by `factor` keeping the point under (x, y) where it is. */
function zoomAt(x, y, factor, smooth) {
  const base = goal || view;
  const ppd = clampN(base.ppd * factor, minPpd(), MAX_PPD);
  const before = { lon: base.lon + (x - W / 2) / base.ppd, lat: base.lat - (y - H / 2) / base.ppd };
  const v = { lon: before.lon - (x - W / 2) / ppd, lat: before.lat + (y - H / 2) / ppd, ppd };
  if (smooth) easeTo(v); else { goal = null; Object.assign(view, clampView(v)); request(); }
}

// ------------------------------------------------------------------------------------------
// What is on the map
// ------------------------------------------------------------------------------------------
function buildMarkers() {
  const out = [];
  const add = (o) => {
    const ll = vecToLl(_v1.copy(o.pos).normalize());
    out.push({ lon: ll.lon, lat: ll.lat, dist: distTo(o.pos), ...o, pos: o.pos.clone ? o.pos.clone() : o.pos });
  };
  const questTargets = {};
  for (const q of QUEST_DEFS) if (S.quests[q.id] === 'active' && q.target) questTargets[q.target] = q;
  for (const rec of World.landers) {
    const name = rec.data.name;
    if (name === 'Pathfinder') continue;                               // drawn as a story marker below
    const q = questTargets[name];
    if (S.discovered[name]) {
      add({ id: 'l:' + name, icon: q ? 'target' : 'lander', color: q ? col.cold : col.ink, pos: rec.group.position, label: name, pri: q ? 3 : 6,
        title: name, type: `Lander · ${rec.data.year}` + (S.salvaged[name] ? ' · salvaged' : ''), note: (q ? `Survey task “${q.name}”: ${q.desc} ` : '') + rec.data.note, dim: !!S.salvaged[name] && !q });
    } else if (q) {
      add({ id: 'l:' + name, icon: 'target', color: col.cold, pos: rec.group.position, label: name, pri: 3,
        title: name, type: `Survey target · ${rec.data.year}`, note: `Survey task “${q.name}”: ${q.desc}` });
    } else if (S.flags.mapRevealed) {
      add({ id: 'l:' + name, icon: 'question', color: col.ink3, pos: rec.group.position, label: '', pri: 9, small: true, unknown: true,
        title: 'Unknown signal', type: 'Undiscovered lander', note: 'NASA\'s survey shows hardware here. Go within sight of it to identify it.' });
    }
  }
  World.builtMeshes.forEach((b, i) => {
    const names = { beacon: 'Nav beacon', solar: 'Solar panel', greenhouse: 'Greenhouse dome', cache: 'O2 cache' };
    const icons = { beacon: 'beacon', solar: 'solar', greenhouse: 'dome', cache: 'cache' };
    add({ id: 'b:' + i, icon: icons[b.kind] || 'box', color: col.ok, pos: b.group.position, label: b.kind === 'beacon' ? 'Beacon' : '', pri: b.kind === 'beacon' ? 5 : 7,
      title: names[b.kind] || 'Structure', type: 'You built this', note: b.kind === 'cache' ? `${b.charges} suit refills left.` : '' });
  });
  World.pods.forEach((p, i) => {
    if (p.taken) return;
    add({ id: 'p:' + i, icon: 'cache', color: col.cold, pos: p.group.position, label: p.kind === 'pod' && !/debris/i.test(p.label) ? 'Cache' : '', pri: 7, small: /debris/i.test(p.label),
      title: /debris/i.test(p.label) ? 'Debris' : 'Supply cache', type: 'Unopened', note: p.label + '.' });
  });
  if (S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected) {
    add({ id: 'pf', icon: 'dish', color: col.accent, pos: World.pathfinder.position, label: 'Pathfinder', pri: 1, main: true,
      title: 'Pathfinder', type: 'Objective · Ares Vallis', note: 'Dead since 1997. Bring the rover: it is too heavy to carry. With it, you can call Earth.' });
  }
  add({ id: 'mav', icon: 'rocket', color: S.flags.mavRevealed ? col.accent : col.ink3, pos: World.mav.position, label: 'Ares 4 MAV', pri: S.flags.mavRevealed ? 1 : 5, main: !!S.flags.mavRevealed,
    title: 'Ares 4 MAV', type: S.flags.mavRevealed ? 'Objective · Schiaparelli crater' : 'Schiaparelli crater', note: S.flags.mavRevealed ? 'Fuelled and waiting. This is the way off the planet.' : 'The next mission\'s ascent vehicle, pre-landed in Schiaparelli.' });
  if (S.mode !== 'rover') add({ id: 'rover', icon: 'rover', color: col.ink, pos: World.rover.group.position, label: groundDist(World.rover.group.position, World.hab.position) > 400 ? 'Rover' : '', pri: 4,
    title: 'Rover', type: 'Vehicle', note: `Battery ${Math.round(S.roverPower / roverPowerCap() * 100)}%, O2 tank ${Math.round(S.roverO2 / BAL.roverO2Cap * 100)}%.` });
  add({ id: 'hab', icon: 'hab', color: col.accent, pos: World.hab.position, label: 'Hab', pri: 2, home: true,
    title: 'The Hab', type: 'Home', note: 'Air, water, the farm, the fabricator and a bunk.' });
  out.sort((a, b) => b.pri - a.pri);              // drawn back to front: the important ones on top
  return out;
}

/** Marker and place-name labels, placed greedily so nothing overlaps. */
function placeLabels(you, storms) {
  const boxes = [];
  const free = (x, y, w, h) => { for (const b of boxes) if (x < b[0] + b[2] && x + w > b[0] && y < b[1] + b[3] && y + h > b[1]) return false; return true; };
  const out = [];
  const r = 11 * U;
  // keep labels out from under the interface's own panels
  const wr = wrap.getBoundingClientRect();
  for (const panel of wrap.querySelectorAll('.map-tools, .map-legend, .map-info')) {
    if (panel.hidden) continue;
    const b = panel.getBoundingClientRect();
    if (b.width) boxes.push([b.left - wr.left - 6, b.top - wr.top - 6, b.width + 12, b.height + 12]);
  }
  boxes.push([you.x - 13 * U, you.y - 13 * U, 26 * U, 26 * U]);
  for (const m of markers) { if (m.under) continue; const q = m.small ? 7 * U : r; boxes.push([m.x - q, m.y - q, q * 2, q * 2]); }
  c.font = `600 ${12 * U}px "Barlow Condensed", sans-serif`;
  const byPri = markers.slice().sort((a, b) => a.pri - b.pri);
  for (const m of byPri) {
    if (m.under || (!m.label && m !== selected && !m.group)) continue;
    if (m.x < -40 || m.x > W + 40 || m.y < -20 || m.y > H + 20) continue;
    const text = ((m.label || (m === selected ? m.title : '')) + (m.group ? ' +' + (m.group.length - 1) : '')).trim().toUpperCase();
    const w = c.measureText(text).width + (text.length * 0.9 + 6) * U, h = 15 * U;
    // (beside it, under it, over it, and then off each corner: on a small map a lander between two others went unnamed)
    const spots = [[m.x + r + 3 * U, m.y - h / 2], [m.x - r - 3 * U - w, m.y - h / 2], [m.x - w / 2, m.y + r + 2 * U], [m.x - w / 2, m.y - r - 2 * U - h],
      [m.x + r * 0.6, m.y - r - h - U], [m.x + r * 0.6, m.y + r + U], [m.x - r * 0.6 - w, m.y - r - h - U], [m.x - r * 0.6 - w, m.y + r + U]];
    for (const [x, y] of spots) {
      // (a label keeps inside the map: at an edge it goes to the marker's other side)
      if ((x >= 2 && x + w <= W - 2 && free(x, y, w, h)) || (m.pri <= 2 && spots[0][0] === x)) { boxes.push([x, y, w, h]); out.push({ text, x: x + 3 * U, y: y + h / 2, color: m.color, size: 12 * U, bold: true }); break; }
    }
  }
  // storm cells are named where there is room
  c.font = `600 ${Math.max(11, 11 * U)}px "Barlow Condensed", sans-serif`;
  for (const st of storms) {
    const text = 'DUST STORM';
    const w = c.measureText(text).width + (text.length * 1.4 + 8) * U, h = 15 * U;
    const x = st.x - w / 2, y = st.y - h / 2;
    if (x < 4 || x + w > W - 4 || y < 4 || y + h > H - 4 || !free(x, y, w, h)) continue;
    boxes.push([x, y, w, h]);
    out.push({ text, x: x + 4 * U, y: st.y, color: 'rgba(250,228,196,.95)', size: Math.max(11, 11 * U), bold: true, spacing: 1.4 * U });
  }
  // place names: the largest first; small ones appear as you zoom in
  const places = [];
  for (const f of FEATURES) places.push({ name: f.name, lat: f.lat, lon: f.lon, deg: f.angR * R2D, big: f.type === 'bulge' || f.type === 'basin' || f.type === 'cap' });
  for (const g of REGIONS) places.push({ name: g.name, lat: g.lat, lon: g.lon, deg: g.r, big: true });
  places.sort((a, b) => b.deg - a.deg);
  for (const p of places) {
    const px = p.deg * view.ppd / U;
    if (px < 26) continue;
    const lat = Math.abs(p.lat) > 86 ? Math.sign(p.lat) * 84 : p.lat;
    const x = sx(p.lon), y = sy(lat);
    const size = Math.max(11, clampN(9 + px / 28, 10, 15) * U);
    const spacing = size * 0.22;
    c.font = `500 ${size}px "Barlow Condensed", sans-serif`;
    const text = p.name.toUpperCase();
    const w = c.measureText(text).width + text.length * spacing + 8 * U, h = size + 4 * U;
    // (the whole name inside the map, or not at all: PHOENIX was cut by the header)
    if (x < 0 || x > W || y - h / 2 < 3 || y + h / 2 > H - 3) continue;
    if (x - w / 2 < 4 || x + w / 2 > W - 4 || !free(x - w / 2, y - h / 2, w, h)) continue;
    boxes.push([x - w / 2, y - h / 2, w, h]);
    out.push({ text, x: x - w / 2 + 4 * U, y, color: col.place, size, spacing });
  }
  return out;
}

// ------------------------------------------------------------------------------------------
// Drawing
// ------------------------------------------------------------------------------------------
function readColours() {
  const cs = getComputedStyle(UI.mapScreen);
  const v = (n, d) => (cs.getPropertyValue(n) || d).trim() || d;
  col.ink = v('--ink', '#f5f0e8'); col.ink3 = 'rgba(245,240,232,.62)'; col.accent = v('--accent', '#ffb454'); col.cold = v('--cold', '#8fd3ff');
  col.ok = v('--ok', '#8be0a4'); col.danger = v('--danger', '#ff6a5c'); col.place = 'rgba(245,240,232,.8)';
}
function text(t, x, y, o) {
  c.font = `${o.bold ? 600 : 500} ${o.size}px "Barlow Condensed", sans-serif`;
  c.textBaseline = 'middle'; c.textAlign = 'left';
  try { c.letterSpacing = (o.spacing !== undefined ? o.spacing : 0.9 * U) + 'px'; } catch (e) { /* older browsers */ }
  c.lineJoin = 'round'; c.lineWidth = 3 * U; c.strokeStyle = 'rgba(12,9,7,.82)';
  c.strokeText(t, x, y);
  c.fillStyle = o.color; c.fillText(t, x, y);
  try { c.letterSpacing = '0px'; } catch (e) { /* older browsers */ }
}

function draw() {
  if (!cv || !W) return;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#0a0807';
  c.fillRect(0, 0, W, cv.height / dpr);
  const ppd = view.ppd, img = gctx.mapImage;
  const lonL = view.lon - W / 2 / ppd, lonR = view.lon + W / 2 / ppd;
  const top = sy(90), mapH = 180 * ppd;
  // the atlas, repeated across the date line
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  for (let k = Math.floor(lonL / 360); k <= Math.floor(lonR / 360); k++) {
    const x = W / 2 + (360 * k - view.lon) * ppd;
    if (img) {
      // draw only the visible slice, so a deep zoom never asks for an enormous destination
      const a = Math.max(0, lonL - 360 * k), b = Math.min(360, lonR - 360 * k);
      const latT = clampN(view.lat + H / 2 / ppd, -90, 90) + 0, latB = clampN(view.lat - (cv.height / dpr - H / 2) / ppd, -90, 90);
      c.drawImage(img, a * IMG_PPD, (90 - latT) * IMG_PPD, (b - a) * IMG_PPD, (latT - latB) * IMG_PPD, x + a * ppd, sy(latT), (b - a) * ppd, (latT - latB) * ppd);
    } else { c.fillStyle = '#5a2d1a'; c.fillRect(x, top, 360 * ppd, mapH); }
  }
  c.fillStyle = 'rgba(10,7,5,.2)';                 // sit the atlas back a little so markers and type lead
  c.fillRect(0, 0, W, H + 60);
  // night side: the half of the planet facing away from the sun
  const subsolar = (360 - S.tod * 360) % 360;
  for (const off of [-360, 0, 360]) {
    const mid = sx((subsolar + 180) % 360) + off * ppd;
    const half = 96 * ppd, soft = 26 * ppd;
    if (mid + half < 0 || mid - half > W) continue;
    const g = c.createLinearGradient(mid - half, 0, mid + half, 0);
    const s = soft / (2 * half);
    g.addColorStop(0, 'rgba(4,6,14,0)'); g.addColorStop(s, 'rgba(4,6,14,.5)'); g.addColorStop(1 - s, 'rgba(4,6,14,.5)'); g.addColorStop(1, 'rgba(4,6,14,0)');
    c.fillStyle = g;
    c.fillRect(mid - half, Math.max(0, top), half * 2, Math.min(H, mapH));
  }
  // graticule
  const step = ppd > 44 ? 1 : ppd > 16 ? 5 : ppd > 6.5 ? 10 : 30;
  c.lineWidth = 1; c.strokeStyle = 'rgba(245,240,232,.1)';
  c.beginPath();
  for (let lon = Math.ceil(lonL / step) * step; lon <= lonR; lon += step) { const x = Math.round(W / 2 + (lon - view.lon) * ppd) + 0.5; c.moveTo(x, 0); c.lineTo(x, H); }
  const latTop = view.lat + H / 2 / ppd, latBot = view.lat - H / 2 / ppd;
  for (let lat = Math.ceil(Math.max(-90, latBot) / step) * step; lat <= Math.min(90, latTop); lat += step) { const y = Math.round(sy(lat)) + 0.5; c.moveTo(0, y); c.lineTo(W, y); }
  c.stroke();
  c.font = `500 ${Math.max(11, 10 * U)}px "JetBrains Mono", monospace`; c.fillStyle = 'rgba(245,240,232,.55)'; c.textBaseline = 'alphabetic';
  c.textAlign = 'left';
  for (let lat = Math.ceil(Math.max(-90, latBot) / step) * step; lat <= Math.min(90, latTop); lat += step) { const y = sy(lat); if (y > 14 * U && y < H - 6 && lat % (step * (step === 30 ? 1 : 2)) === 0) c.fillText(lat === 0 ? '0°' : fmtLat(lat).replace('.0', ''), 6 * U, y - 3 * U); }
  c.textAlign = 'center';
  for (let lon = Math.ceil(lonL / step) * step; lon <= lonR; lon += step) { const x = W / 2 + (lon - view.lon) * ppd; if (x > 40 * U && x < W - 30 * U && lon % (step * 2) === 0) c.fillText(`${((lon % 360) + 360) % 360}°E`, x, H - 6 * U); }

  // storm cells
  const stormLabels = [];
  for (const cell of S.storm.cells) {
    const rLat = (cell.r / R) * R2D, rLon = rLat / Math.max(0.2, Math.cos(cell.lat * Math.PI / 180));
    const x = sx(cell.lon), y = sy(cell.lat);
    for (const off of [-360, 0, 360]) {
      const cx = x + off * ppd;
      if (cx + rLon * ppd < 0 || cx - rLon * ppd > W) continue;
      c.save();
      c.beginPath(); c.ellipse(cx, y, rLon * ppd, rLat * ppd, 0, 0, Math.PI * 2);
      c.fillStyle = 'rgba(214,168,120,.22)'; c.fill();
      c.clip();
      c.strokeStyle = 'rgba(232,196,150,.5)'; c.lineWidth = 1;
      c.beginPath();
      for (let d = -rLat * ppd * 2 - rLon * ppd; d < rLon * ppd * 2; d += 7 * U) { c.moveTo(cx + d, y + rLat * ppd); c.lineTo(cx + d + rLat * ppd * 2, y - rLat * ppd); }
      c.stroke();
      c.restore();
      c.beginPath(); c.ellipse(cx, y, rLon * ppd, rLat * ppd, 0, 0, Math.PI * 2);
      c.setLineDash([5, 4]); c.strokeStyle = 'rgba(240,210,170,.85)'; c.lineWidth = 1.25; c.stroke(); c.setLineDash([]);
      if (rLat * ppd > 16 * U) stormLabels.push({ x: cx, y });
    }
  }

  markers = buildMarkers();
  for (const m of markers) { m.x = sx(m.lon); m.y = sy(m.lat); }
  // Markers that fall on one another at this zoom are shown as one: the most important (or the one
  // selected), with a count of the rest. Tapping it again steps through them.
  const leads = [];
  for (const m of markers.slice().sort((a, b) => (b === selected) - (a === selected) || a.pri - b.pri)) {
    m.under = null; m.group = null;
    for (const l of leads) if (Math.hypot(l.x - m.x, l.y - m.y) < 15 * U) { m.under = l; (l.group || (l.group = [l])).push(m); break; }
    if (!m.under) leads.push(m);
  }
  const pll = vecToLl(_v1.copy(player.pos).normalize());
  const you = { x: sx(pll.lon), y: sy(pll.lat) };

  // the way to the main objective, and to whatever is selected
  const route = (to, colour, dash) => {
    const a = _v1.copy(player.pos).normalize().clone(), b = to.clone().normalize();
    c.beginPath();
    let px = null;
    for (let i = 0; i <= 48; i++) {
      const ll = vecToLl(a.clone().lerp(b, i / 48).normalize());
      const x = sx(ll.lon), y = sy(ll.lat);
      if (px !== null && Math.abs(x - px) > W * 0.6) c.moveTo(x, y); else if (px === null) c.moveTo(x, y); else c.lineTo(x, y);
      px = x;
    }
    c.setLineDash(dash.map((d) => d * U)); c.strokeStyle = colour; c.lineWidth = 1.5 * U; c.stroke(); c.setLineDash([]);
  };
  const main = markers.find((m) => m.main) || (S.flags.coldOpen ? markers.find((m) => m.home) : null);
  if (main && main.dist > 60) route(main.pos, 'rgba(255,180,84,.75)', [6, 5]);
  if (selected && selected.pos && selected !== main && selected.dist > 60) route(selected.pos, 'rgba(245,240,232,.6)', [2, 4]);

  // markers
  for (const m of markers) {
    if (m.under || m.x < -20 || m.x > W + 20 || m.y < -20 || m.y > H + 20) continue;
    const r = (m.unknown ? 8 : m.small ? 6 : 10) * U;
    c.globalAlpha = m.dim ? 0.6 : 1;
    c.beginPath(); c.arc(m.x, m.y, r, 0, Math.PI * 2);
    c.fillStyle = 'rgba(12,10,8,.88)'; c.fill();
    c.lineWidth = (m === selected ? 2 : 1.25) * U; c.strokeStyle = m.color; c.stroke();
    if (m.main) { c.beginPath(); c.arc(m.x, m.y, r + 4 * U, 0, Math.PI * 2); c.lineWidth = U; c.strokeStyle = m.color; c.globalAlpha = 0.55; c.stroke(); c.globalAlpha = 1; }
    c.strokeStyle = m.color; c.fillStyle = m.color;
    drawIcon(c, m.icon, m.x, m.y, (m.unknown ? 11 : m.small ? 9 : 13) * U);
    c.globalAlpha = 1;
  }
  if (selected) {
    const s = selected;
    if (s.point) { s.x = sx(s.lon); s.y = sy(s.lat); }
    c.strokeStyle = col.ink; c.lineWidth = 1.5 * U;
    const q = (s.point ? 7 : 16) * U, tick = 5 * U;
    c.beginPath();
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { c.moveTo(s.x + dx * q, s.y + dy * (q - tick)); c.lineTo(s.x + dx * q, s.y + dy * q); c.lineTo(s.x + dx * (q - tick), s.y + dy * q); }
    c.stroke();
    if (s.point) { c.beginPath(); c.arc(s.x, s.y, 2 * U, 0, Math.PI * 2); c.fillStyle = col.ink; c.fill(); }
  }
  // you: an arrow pointing where you face
  const hdg = headingOf(S.mode === 'rover' ? World.rover.group.position : player.pos, S.mode === 'rover' ? roverF.q : player.q);
  c.save();
  c.translate(you.x, you.y);
  c.scale(U, U);
  c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.stroke();
  c.rotate(hdg);
  c.beginPath(); c.moveTo(0, -11); c.lineTo(7.5, 8.5); c.lineTo(0, 4.5); c.lineTo(-7.5, 8.5); c.closePath();
  c.fillStyle = '#fff'; c.strokeStyle = 'rgba(12,10,8,.95)'; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke(); c.fill();
  c.restore();

  for (const l of placeLabels(you, stormLabels)) text(l.text, l.x, l.y, l);

  // status bar
  const posText = `<b>You</b> <span class="t-mono">${fmtLL(pll)}</span> · ${esc(regionName(_v1.copy(player.pos).normalize()))}`;
  if (statusPos.dataset.t !== posText) { statusPos.dataset.t = posText; statusPos.innerHTML = posText; }
  let km = 0.1;
  for (const k of [0.1, 0.2, 0.5, 1, 2, 5, 10, 20]) { km = k; if (k / KM_PER_DEG * ppd >= layout.rem * 4) break; }
  scaleEl.style.width = (km / KM_PER_DEG * ppd).toFixed(0) + 'px';
  scaleLbl.textContent = km < 1 ? `${km * 1000} m` : `${km} km`;
}

// ------------------------------------------------------------------------------------------
// Selection: what is this, and how far
// ------------------------------------------------------------------------------------------
function showInfo(s) {
  selected = s;
  if (!s) { info.hidden = true; request(); return; }
  const from = S.mode === 'rover' ? World.rover.group.position : player.pos;
  const pos = s.pos || llToVec(s.lat, s.lon).multiplyScalar(R);
  const dist = distTo(pos);
  const ll = { lat: s.lat, lon: s.lon };
  const grp = s.group || (s.under && s.under.group);
  // what else stands at this spot, like things counted together ("Rover, Beacon, 3 Debris", not Debris three times)
  const others = [];
  if (grp) for (const m of grp) {
    if (m === s) continue;
    const name = m.label || m.title, e = others.find((o) => o.name === name);
    if (e) e.n++; else others.push({ name, n: 1 });
  }
  info.innerHTML = `<div class="mi-hd">${icon(s.icon || 'pin')}<div><h2>${esc(s.title)}</h2><div class="ty">${esc(s.type || '')}</div></div>` +
    `<button type="button" class="x" aria-label="Close details">${icon('close')}</button></div>` +
    `<dl><dt>Distance</dt><dd class="t-num">${fmtDist(dist)}</dd><dt>Bearing</dt><dd>${dist > 5 ? bearingText(absBearing(from, pos)) : '—'}</dd>` +
    `<dt>Position</dt><dd class="t-mono">${fmtLL(ll)}</dd></dl>${s.note ? `<p>${esc(s.note)}</p>` : ''}` +
    // a marker standing for several says what the others are
    (others.length ? `<p class="grp"><b>Also here (+${grp.length - 1})</b> ${others.map((o) => esc(o.n > 1 ? `${o.n} × ${o.name}` : o.name)).join(', ')}. ${layout.touch ? 'Tap' : 'Click'} the marker again for the next.</p>` : '');
  info.hidden = false;
  info.querySelector('.x').addEventListener('click', () => showInfo(null));
  request();
}
function pick(x, y) {
  let best = null, bestD = 22 * U;
  for (const m of markers) { if (m.under) continue; const d = Math.hypot(m.x - x, m.y - y); if (d < bestD) { bestD = d; best = m; } }
  // (a marker standing for several: each tap on it shows the next of them)
  if (best && best.group && best === selected) {
    const all = best.group.slice().sort((a, b) => a.pri - b.pri || (a.id < b.id ? -1 : 1));
    return showInfo(all[(all.indexOf(best) + 1) % all.length]);
  }
  if (best) return showInfo(best);
  if (y > H) return showInfo(null);
  const ll = unproject(x, y);
  const v = llToVec(ll.lat, ll.lon);
  showInfo({ point: true, lat: ll.lat, lon: ll.lon, x, y, icon: 'pin', title: regionName(v), type: 'Map position', note: '' });
}

// ------------------------------------------------------------------------------------------
// Set-up and input
// ------------------------------------------------------------------------------------------
const LEGEND = [
  ['arrow', 'ink', 'You, and where you face'], ['hab', 'accent', 'The Hab'], ['rocket', 'accent', 'Objective'], ['target', 'cold', 'NASA survey target'],
  ['cache', 'cold', 'Supply cache'], ['lander', 'ink', 'Lander'], ['question', 'ink-3', 'Unknown signal'], ['beacon', 'ok', 'Built by you'],
];
export function initMap(body) {
  if (cv) return;
  wrap = el('div', null, 'map-wrap', body);
  cv = UI.mapCanvas = el('canvas', 'mg-mapcanvas', null, wrap);
  cv.tabIndex = 0;
  cv.setAttribute('role', 'application');
  cv.setAttribute('aria-label', 'Map of Mars. Arrow keys pan, plus and minus zoom, zero shows the whole planet.');
  cv.setAttribute('data-autofocus', '');
  c = cv.getContext('2d');
  const tools = el('div', null, 'map-tools', wrap,
    // (each has a word under it on a phone, where nothing can be hovered to learn what an icon does)
    `<button type="button" class="mg-iconbtn" data-a="in" aria-label="Zoom in" title="Zoom in">${icon('plus')}<span class="cap">In</span></button>` +
    `<button type="button" class="mg-iconbtn" data-a="out" aria-label="Zoom out" title="Zoom out">${icon('minus')}<span class="cap">Out</span></button><span class="gap"></span>` +
    `<button type="button" class="mg-iconbtn" data-a="me" aria-label="Centre on your position" title="Centre on your position">${icon('locate')}<span class="cap">You</span></button>` +
    `<button type="button" class="mg-iconbtn" data-a="hab" aria-label="Centre on the Hab" title="Centre on the Hab">${icon('hab')}<span class="cap">Hab</span></button><span class="gap"></span>` +
    `<button type="button" class="mg-iconbtn" data-a="legend" aria-label="Legend" title="Legend" aria-pressed="false">${icon('layers')}<span class="cap">Key</span></button>`);
  legend = el('div', null, 'map-legend', wrap,
    '<h3>Legend</h3><ul>' + LEGEND.map(([ic, colour, label]) => `<li style="color:var(--${colour})"><i>${icon(ic)}</i><span>${label}</span></li>`).join('') +
    '<li style="color:rgba(240,210,170,.9)"><i class="sw"></i><span>Dust storm</span></li><li><i class="night"></i><span>Night side</span></li></ul>');
  info = el('div', null, 'map-info', wrap);
  info.hidden = true;
  info.setAttribute('role', 'status');
  const status = el('div', null, 'map-status', wrap,
    '<span class="pos"></span><span class="sp"></span><span class="hint"></span><span class="map-scale"><i></i><span></span></span>');
  statusPos = status.querySelector('.pos'); statusHint = status.querySelector('.hint');
  scaleEl = status.querySelector('.map-scale i'); scaleLbl = status.querySelector('.map-scale span');
  // (short enough to show whole beside the position on the narrowest phone, where it ended "tap for…")
  statusHint.textContent = layout.touch ? 'Pinch to zoom · tap for details' : 'Drag to pan · wheel to zoom · click for details';
  const setLegend = (on) => { legend.hidden = !on; tools.querySelector('[data-a="legend"]').setAttribute('aria-pressed', on); };
  setLegend(false);                     // (closed until asked for: open, it covered a corner of the map)

  tools.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'in') zoomAt(W / 2, H / 2, 1.8, true);
    else if (a === 'out') zoomAt(W / 2, H / 2, 1 / 1.8, true);
    else if (a === 'me') { const ll = vecToLl(_v1.copy(player.pos).normalize()); easeTo({ lon: ll.lon, lat: ll.lat, ppd: Math.max(view.ppd, Math.min(MAX_PPD, minPpd() * 5)) }); }
    else if (a === 'hab') { const ll = vecToLl(_v1.copy(World.hab.position).normalize()); easeTo({ lon: ll.lon, lat: ll.lat, ppd: Math.max(view.ppd, Math.min(MAX_PPD, minPpd() * 5)) }); }
    else if (a === 'legend') setLegend(legend.hidden);
  });

  // pointers: one drags, two pinch, a short press selects
  const pts = new Map();
  let moved = 0, downAt = 0, pinch = 0;
  const local = (ev) => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  cv.addEventListener('pointerdown', (ev) => {
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic events */ }
    pts.set(ev.pointerId, local(ev));
    if (pts.size === 1) { moved = 0; downAt = performance.now(); }
    if (layout.compact && !legend.hidden) setLegend(false);       // (on a phone the key covers a third of the map)
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); moved = 99; }
    goal = null;
  });
  cv.addEventListener('pointermove', (ev) => {
    const p = local(ev);
    const prev = pts.get(ev.pointerId);
    if (!prev) return;
    pts.set(ev.pointerId, p);
    if (pts.size === 1) {
      const dx = p[0] - prev[0], dy = p[1] - prev[1];
      moved += Math.abs(dx) + Math.abs(dy);
      view.lon -= dx / view.ppd; view.lat += dy / view.ppd;
      clampView(view); request();
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch > 0 && d > 0) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinch, false);
      pinch = d;
    }
  });
  const up = (ev) => {
    const p = pts.get(ev.pointerId);
    pts.delete(ev.pointerId);
    if (p && pts.size === 0 && moved < 8 && performance.now() - downAt < 500 && ev.type === 'pointerup') pick(p[0], p[1]);
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const [x, y] = local(ev);
    zoomAt(x, y, Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0016)), false);
  }, { passive: false });
  cv.addEventListener('dblclick', (ev) => { const [x, y] = local(ev); zoomAt(x, y, 2, true); });
  cv.addEventListener('keydown', (ev) => {
    const step = 80 / view.ppd;
    const k = ev.key;
    if (k === 'ArrowLeft') easeTo({ lon: (goal || view).lon - step });
    else if (k === 'ArrowRight') easeTo({ lon: (goal || view).lon + step });
    else if (k === 'ArrowUp') easeTo({ lat: (goal || view).lat + step });
    else if (k === 'ArrowDown') easeTo({ lat: (goal || view).lat - step });
    else if (k === '+' || k === '=') zoomAt(W / 2, H / 2, 1.6, true);
    else if (k === '-' || k === '_') zoomAt(W / 2, H / 2, 1 / 1.6, true);
    else if (k === '0') easeTo({ ppd: minPpd() });
    else return;
    ev.preventDefault(); ev.stopPropagation();
  });
  onLayout(() => { if (UI.mapScreen.style.display === 'block') { resize(); request(); } });
}

/** Called when the map screen opens: the whole planet, centred on you (your zoom is kept after that). */
export function openMap() {
  readColours();
  resize();
  if (!opened && W) {
    opened = true;
    const ll = vecToLl(_v1.copy(player.pos).normalize());
    view.lon = ll.lon; view.lat = 0; view.ppd = minPpd();
    clampView(view);
  }
  selected = null;
  if (info) info.hidden = true;
  draw();
}
/** Redraw the map now (the game calls this while the screen is open). */
export function renderMap() { if (!cv) return; if (!W) resize(); draw(); }
