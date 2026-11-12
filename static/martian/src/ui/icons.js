// The interface's icon set: 24 x 24, one stroke weight, drawn for this game.
// Each icon is a list of SVG path strings; a path that starts with "F" is filled, not stroked.
// The same paths draw the map's markers on its canvas (see map.js).
export const ICONS = {
  // resources
  suit: ['M12 3.5a6.5 6.5 0 0 0-6.5 6.5v3.5A4.5 4.5 0 0 0 10 18h4a4.5 4.5 0 0 0 4.5-4.5V10A6.5 6.5 0 0 0 12 3.5z', 'M8.5 10.2a3.5 3.5 0 0 1 7 0v1.3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z', 'M8 21h8'],
  hab: ['M3.5 18a8.5 8.5 0 0 1 17 0', 'M2 18h20', 'M10.25 18v-3.5h3.5V18'],
  water: ['M12 3.5c3.2 3.9 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.3-6.1 5.5-10z'],
  food: ['M12 21v-7', 'M12 14c0-3.6-2.4-6-6.5-6 0 4 2.4 6 6.5 6z', 'M12 16.5c0-3 2.1-5 6-5 0 3.4-2.1 5-6 5z'],
  power: ['M13 2.75L5.75 13.5H11l-1 7.75 7.25-11.25H12z'],
  vitals: ['M2.5 12.5H7l2-4.5 3.25 9 2.5-6 1.25 1.5h5.5'],
  battery: ['M3 8h15v8H3z', 'M18 10.5h2.5v3H18', 'M6.5 11v2', 'M9.5 11v2'],
  // navigation and screens
  map: ['M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z', 'M9 4.5v13', 'M15 6.5v13'],
  colony: ['M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  journal: ['M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z', 'M5 17a3 3 0 0 1 3-3h11', 'M9 8.5h6'],
  camera: ['M4 8h3l1.5-2.5h7L17 8h3v11H4z', 'M12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  pause: ['M9 5.5v13', 'M15 5.5v13'],
  play: ['M7.5 5v14l11.5-7z'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  back: ['M15 5l-7 7 7 7'],
  next: ['M9 5l7 7-7 7'],
  up: ['M5 15l7-7 7 7'],
  down: ['M5 9l7 7 7-7'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  locate: ['M12 2.5v4', 'M12 17.5v4', 'M2.5 12h4', 'M17.5 12h4', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  layers: ['M12 4l9 5-9 5-9-5z', 'M3 14l9 5 9-5'],
  lock: ['M7.5 11V8a4.5 4.5 0 0 1 9 0v3', 'M5.5 11h13v9h-13z'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v5.5', 'M12 7.5v.25'],
  warning: ['M12 4L2.75 19.5h18.5z', 'M12 10v4.5', 'M12 17v.25'],
  restart: ['M4.5 12a7.5 7.5 0 1 1 2.3 5.4', 'M4.5 18.5V14H9'],
  sliders: ['M4 6.5h8.5', 'M16.5 6.5H20', 'M4 12h2.5', 'M10.5 12H20', 'M4 17.5h10.5', 'M18.5 17.5H20', 'M14.5 4.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M8.5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M16.5 15.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  keyboard: ['M3 7h18v10H3z', 'M7 10.5h.25', 'M10.5 10.5h.25', 'M14 10.5h.25', 'M17.25 10.5h.25', 'M8 13.75h8'],
  monitor: ['M3 5h18v11H3z', 'M9 20h6', 'M12 16v4'],
  mouse: ['M12 3.5a5 5 0 0 0-5 5v7a5 5 0 0 0 10 0v-7a5 5 0 0 0-5-5z', 'M12 7v3'],
  volume: ['M4 9.5h3.5L12 6v12l-4.5-3.5H4z', 'M15.5 9a4.2 4.2 0 0 1 0 6', 'M18 6.5a7.7 7.7 0 0 1 0 11'],
  eye: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  // world
  rover: ['M3 14.5h18V11l-3-3.5H8.5L6 11H3z', 'M7 14.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', 'M17 14.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', 'M10 11h5'],
  beacon: ['M12 21V11', 'M9 21h6', 'M12 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M8 5.5a6 6 0 0 0 0 8', 'M16 5.5a6 6 0 0 1 0 8'],
  cache: ['M4 8l8-4 8 4v8l-8 4-8-4z', 'M4 8l8 4 8-4', 'M12 12v8'],
  lander: ['M7.5 10.5h9l2 4.5h-13z', 'M6.5 15L4 20', 'M17.5 15l2.5 5', 'M12 10.5V7', 'M8.5 5a3.5 3.5 0 0 1 7 0'],
  target: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  rocket: ['M12 2.5c2.8 2.4 4.25 5.8 4.25 9.8V17h-8.5v-4.7c0-4 1.45-7.4 4.25-9.8z', 'M7.75 13.5L4.5 16.5V20l3.25-1.5', 'M16.25 13.5l3.25 3V20l-3.25-1.5', 'M10 20.5h4', 'M12 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z'],
  dish: ['M6.5 6.5a7.8 7.8 0 0 0 11 11z', 'M12 12l4.5-4.5', 'M17.5 5.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z', 'M9 21h8', 'M13 17.5l1 3.5'],
  solar: ['M4 6h16l-2 9H6z', 'M9.3 6l.7 9', 'M14.7 6l-.7 9', 'M5 10.5h14', 'M12 15v5', 'M9 20h6'],
  dome: ['M4 18a8 8 0 0 1 16 0', 'M2.5 18h19', 'M12 10v8', 'M7.5 11.5c1.5 1.8 2 4 2 6.5', 'M16.5 11.5c-1.5 1.8-2 4-2 6.5'],
  storm: ['M3 9h9.5a2.5 2.5 0 1 0-2.5-2.5', 'M3 13h14.5a2.5 2.5 0 1 1-2.5 2.5', 'M3 17h6.5'],
  cold: ['M12 3v18', 'M4.2 7.5l15.6 9', 'M19.8 7.5l-15.6 9', 'M9.5 4.5L12 7l2.5-2.5', 'M9.5 19.5L12 17l2.5 2.5'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2.5V5', 'M12 19v2.5', 'M2.5 12H5', 'M19 12h2.5', 'M5.3 5.3L7 7', 'M17 17l1.7 1.7', 'M5.3 18.7L7 17', 'M17 7l1.7-1.7'],
  moon: ['M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z'],
  signal: ['M5 19v-3', 'M10 19v-7', 'M15 19V8', 'M20 19V4'],
  star: ['M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z'],
  trophy: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M8 6H5a3 3 0 0 0 3 4', 'M16 6h3a3 3 0 0 1-3 4', 'M12 13v4', 'M8.5 20h7', 'M10 17h4'],
  chart: ['M4 4v16h16', 'M8 16v-4.5', 'M12 16V8', 'M16 16v-3'],
  list: ['M8.5 6.5H20', 'M8.5 12H20', 'M8.5 17.5H20', 'M4.25 6.5h.25', 'M4.25 12h.25', 'M4.25 17.5h.25'],
  box: ['M4 7.5l8-4 8 4v9l-8 4-8-4z', 'M4 7.5l8 4 8-4', 'M12 11.5v9', 'M8 5.5l8 4'],
  blueprint: ['M4 4h13l3 3v13H4z', 'M8 9h8', 'M8 12.5h8', 'M8 16h5'],
  // touch controls
  run: ['M5 6l6 6-6 6', 'M12.5 6l6 6-6 6'],
  jump: ['M12 17V5.5', 'M6.5 11L12 5.5 17.5 11', 'M6 20.5h12'],
  exit: ['M13.5 4h6v16h-6', 'M4 12h10.5', 'M10.5 8l4 4-4 4'],
  hand: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'F M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  rotate: ['M8.5 3h7A1.5 1.5 0 0 1 17 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5v-15A1.5 1.5 0 0 1 8.5 3z', 'M11 18h2'],
  // map
  arrow: ['F M12 2.5l6.5 18L12 16.5 5.5 20.5z'],
  pin: ['M12 21s6.5-6.2 6.5-11a6.5 6.5 0 0 0-13 0c0 4.8 6.5 11 6.5 11z', 'M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  question: ['M9 9a3 3 0 1 1 4.5 2.6c-.9.6-1.5 1.2-1.5 2.4', 'M12 17.5v.25'],
};

/** SVG markup for an icon. `cls` adds classes. */
export function icon(name, cls) {
  const paths = ICONS[name] || ICONS.info;
  let body = '';
  for (const p of paths) body += p.startsWith('F ') ? `<path class="f" d="${p.slice(2)}"/>` : `<path d="${p}"/>`;
  return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

const pathCache = {};
/** Draw an icon on a 2D canvas, centred on (x, y), `size` pixels across, in the current stroke/fill styles. */
export function drawIcon(c, name, x, y, size) {
  let ps = pathCache[name];
  if (!ps) ps = pathCache[name] = (ICONS[name] || ICONS.info).map((p) => ({ fill: p.startsWith('F '), path: new Path2D(p.startsWith('F ') ? p.slice(2) : p) }));
  const s = size / 24;
  c.save();
  c.translate(x - size / 2, y - size / 2);
  c.scale(s, s);
  c.lineWidth = 1.7;
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const p of ps) { if (p.fill) c.fill(p.path); else c.stroke(p.path); }
  c.restore();
}
