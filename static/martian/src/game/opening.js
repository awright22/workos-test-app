// The opening: how he came to be alone. A new game begins with it, and it ends where the game has always begun: on
// his face in the sand, eighty-five metres from the Hab, with a hole in his suit.
//
// It is the evacuation, as the book has it, in twenty-four seconds and three shots:
//   1  the Hab in the storm at dusk, its lamps and beacon in the murk, and six people filing out past the lens
//   2  the walk to the ascent vehicle, from behind the last of them; something comes out of the storm and takes him
//   3  from where he lies: lamps that search in the wrong place and go; then, far off, a rocket leaving without him
// and then black, a card on it (a night has passed), and morning: the game comes up on him lying where he fell, and
// he gets to his feet (game/player.js, wakeOnGround).
//
// A storm is the weakest thing this game draws (it is laid over the finished picture and knows no depth), so the
// film is made of what does work in one: silhouettes and lamps in a brown dusk. Nothing in it is seen clearly but
// the lights. It borrows the launch's flame (game/launch.js) and the game's own lamp pool (world/lamps.js): no light
// is added to the scene, which on a phone would stop the picture for a second while every shader was built again.
//
// It can be skipped from its first frame, and it is not shown when a game is continued.
import * as THREE from 'three';
import { S } from './state.js';
import { Snd } from '../audio/sound.js';
import { World, siteLocalToWorld } from '../world/build.js';
import { addLamp, removeLampsOf } from '../world/lamps.js';
import { el, log, root } from '../ui/dom.js';
import { astro, camLookAt, player, resetWalkCamera, wakeOnGround } from './player.js';
import { surfaceAt } from '../planet/surface.js';
import { frameQuat } from '../planet/geo.js';
import { model, ownMaterials } from '../world/models.js';
import { ctx } from './ctx.js';
import { clamp, smoothstep } from '../core/math.js';
import { updateSunDir } from './sim.js';
import { buildFlame, flameTime, softDisc } from './launch.js';
import { reducedMotion } from '../ui/settings.js';

const HOUR = 18.68;           // local time of the film: the sun just down, a brown dusk (a few minutes later it is night, and no dust shows)
const STORM = 0.92;           // how thick the dust is
const PACE = 3.0;             // metres a second, into it: people leaving in a hurry
const WALK_PACE = 5.1;        // the pace the Walk clip's planted boot goes back at (game/player.js): a figure's clip is played at its own pace over this
const GAP = 3.3;              // metres between one of them and the next
const CARRY = 28;             // metres the thing that hits him carries him, downwind, out of their sight
const MAV_FAR = 115;          // metres from where he is hit to the ascent vehicle, further along their line
// seconds from the first frame
const T_WALK = 5.0;           // cut: from the Hab to the walk
const T_HIT = 9.3;            // it reaches him
const T_AWAY = 9.9;           // cut: to where he will come to rest (the blow is held for half a second first: he goes out of the side of the picture)
const FLY = 1.7;              // seconds he is in the air and rolling
const T_GO = 4.7;             // seconds after the blow that the others give him up and go
const T_DIP = 14.8;           // a dip to black: they have gone to the rocket, and minutes pass
const T_BACK = 15.5;          // ... and back, on him
const T_FIRE = 17.0;          // ignition
const T_LIFT = 17.7;          // lift-off
const T_OUT = 21.3;           // the fade to black begins
const T_CARD = 22.2;          // on the black, a card: the night has passed
const T_END = 24.3;           // morning
const WAKE_FADE = 0.9;        // seconds the first picture of the game takes to come up out of the black
const WAKE_RISE = 3.2;        // ... and that he takes to get from the ground to his feet (game/player.js, wakeOnGround)
const CARD = 'The next morning';
// What is said. A player who has not read the book must follow it: nobody says "MAV" (the game teaches that word
// later), what Johanssen sees is said plainly (it is why they leave him: his suit tells them he is dead), and each
// line is said over the picture it is about: the rocket is leaning on the skyline when Martinez says it is going
// over. A line of two sentences is set as two rows.
const LINES = [
  [0.7, 4.0, 'LEWIS', 'Wind’s past the abort line.\nEveryone to the ascent vehicle.'],
  [5.2, 3.8, 'MARTINEZ', 'Ascent vehicle’s tipping, Commander.\nShe won’t stand much more of this.'],
  [11.0, 1.9, 'JOHANSSEN', 'Commander!\nWatney’s suit just went dead.'],
  [12.9, 1.4, 'LEWIS', 'Mark! Sound off!'],
  [14.3, 2.3, 'MARTINEZ', 'She’s going over.\nWe launch now or not at all.'],
  [16.7, 1.5, 'LEWIS', 'Launch.'],
];

const V = () => new THREE.Vector3();
const _a = V(), _b = V(), _c = V(), _d = V(), _e = V();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();

/** The point of the ground under (or over) `p`, `h` metres above it. */
function ground(p, h = 0, out = V()) {
  const r = surfaceAt(p) + h;
  return out.copy(p).normalize().multiplyScalar(r);
}
/** Which way a body faces: its head along `up`, its front along `front` (which need not be level). */
function facing(up, front, out) {
  _e.crossVectors(up, front).normalize();
  _d.crossVectors(_e, up).normalize();
  return out.setFromRotationMatrix(_m.makeBasis(_e, up, _d));
}

/** Is the ground clear of the straight line between two places? (looked at every two metres, with `margin` to spare) */
function clearLine(a, b, margin = 0.5) {
  const n = Math.max(2, Math.ceil(a.distanceTo(b) / 2));
  for (let i = 1; i < n; i++) { _e.copy(a).lerp(b, i / n); if (surfaceAt(_e) + margin > _e.length()) return false; }
  return true;
}
/** How a body lies at `p` with its head toward `front`: along the ground there, whatever its slope. */
function lying(p, front, out) {
  const up = _a.copy(p).normalize(), f = _b.copy(front).addScaledVector(up, -front.dot(up)).normalize(), r = _c.crossVectors(up, f).normalize();
  const o = ground(p, 0, V()), a = ground(_d.copy(p).addScaledVector(f, 1.6), 0, V()).sub(o), b = ground(_d.copy(p).addScaledVector(r, 0.7), 0, V()).sub(o);
  const n = V().crossVectors(a, b).normalize();
  if (n.dot(up) < 0) n.negate();
  return facing(n, a.normalize(), out);
}
/**
 * A glow with no edge and no core: for a fire seen through a hundred metres of dust. It falls away from its middle
 * all the way out, steeply and then for a long way gently. (Flat across its middle and falling only near its rim, it
 * was a disc of light with the rocket in front of it.)
 */
function hazeTexture() {
  const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), rim = 0.72 * Math.exp(-9) + 0.28 * Math.exp(-2.6);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const d = Math.min(1, Math.hypot(i - (N - 1) / 2, j - (N - 1) / 2) / (N / 2)), v = Math.max(0, 0.72 * Math.exp(-d * d * 9) + 0.28 * Math.exp(-d * d * 2.6) - rim) / (1 - rim) * (1 - d * d * d);
    const k = (j * N + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * v);
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

/**
 * The shade under a figure: even across its middle and soft at its edge. (With the glow's own falling-away it was
 * dark only under the body, where a low lens cannot see: beside him, where it can, the ground was lit, and he lay
 * a hand's depth over it.)
 */
function shadeTexture() {
  const N = 64, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const d = Math.min(1, Math.hypot(i - (N - 1) / 2, j - (N - 1) / 2) / (N / 2)), k = (j * N + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * (1 - smoothstep(0.42, 1, d)));
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

let film = null;
let fadeIn = 0;
let ui = null;

/** True while the film is on the screen. */
export function openingOn() { return !!film; }

/** One of the six: a suited figure with a lamp on its helmet and a marker on its pack, and the clips it needs. */
function figure(glowMap, shade) {
  const a = model('astronaut');
  a.root.traverse((o) => {
    if (!o.isMesh) return;
    const n = (Array.isArray(o.material) ? o.material[0] : o.material).name || '';
    if (o.name === 'head' || /^head_/.test(n)) o.visible = false;      // helmets on
    o.castShadow = false;                                              // (there is no sun to cast one by)
  });
  const mixer = new THREE.AnimationMixer(a.inner), acts = {};
  for (const c of a.clips) if (c.name === 'Walk' || c.name === 'Idle' || c.name === 'Collapse') acts[c.name] = mixer.clipAction(c);
  if (acts.Collapse) { acts.Collapse.setLoop(THREE.LoopOnce, 1); acts.Collapse.clampWhenFinished = true; }
  const holder = new THREE.Group();
  holder.add(a.root);
  ctx.world.add(holder);
  const spot = (color, on, x, y, z) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.renderOrder = 22;
    // (a sprite takes its size from what it hangs on: `per` undoes that, so its size is in metres whatever it hangs on)
    on.add(s); s.position.set(x, y, z);
    on.updateWorldMatrix(true, false);
    s.userData.per = 1 / (on.getWorldScale(_a).x || 1);
    return s;
  };
  // (the two lamps at the sides of the helmet, where the suit has them: a glow hung in front of the visor was a
  //  lantern carried where the face is)
  const white = new THREE.Color(1.35, 1.2, 0.95), anchors = [a.part('lamp_L'), a.part('lamp_R')].filter(Boolean);
  const lamps = anchors.length ? anchors.map((o) => spot(white, o, 0, 0, 0)) : [spot(white, holder, 0.13, 1.8, 0.16), spot(white, holder, -0.13, 1.8, 0.16)];
  // (the marker is on his pack, and goes where his back goes: hung over his feet, it stood in the air a metre and a
  //  half over a man lying on his face)
  let chest = null;
  a.inner.traverse((o) => { if (!chest && o.isBone && o.name === 'chest') chest = o; });
  const at = _b.set(0, 1.40, -0.34);
  if (chest) { holder.updateWorldMatrix(true, true); chest.worldToLocal(holder.localToWorld(at)); }
  // (and a patch of his own shade on the ground under him. There is no sun to cast one, but a figure with nothing
  //  under it stands on the picture and not on the sand; lying, it hovers.)
  const under = new THREE.Mesh(shade.geo, shade.mat.clone());
  under.position.y = 0.03; under.renderOrder = 2;
  holder.add(under);
  return { root: holder, mixer, acts, now: '', lamps, under, mark: spot(new THREE.Color(1.9, 0.26, 0.08), chest || holder, at.x, at.y, at.z) };
}
function act(f, name, fade = 0.3) {
  if (f.now === name || !f.acts[name]) return;
  const next = f.acts[name], was = f.acts[f.now];
  next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.setEffectiveTimeScale(1);
  if (was) next.crossFadeFrom(was, fade, false);
  next.play();
  f.now = name;
}

function buildUi() {
  if (ui) return ui;
  const box = el('div', 'mg-film', null, root, `<p class="sub" role="status"><b></b><span></span></p><p class="later">${CARD}</p><button type="button" class="skip">Skip</button>`);
  ui = { box, sub: box.querySelector('.sub'), who: box.querySelector('.sub b'), said: box.querySelector('.sub span'), card: box.querySelector('.later'), skip: box.querySelector('.skip'), line: -1 };
  ui.skip.addEventListener('click', () => skipOpening());
  window.addEventListener('keydown', (ev) => {
    if (!film) return;
    if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); skipOpening(); }
  }, true);
  return ui;
}
function say(i) {
  if (!ui || ui.line === i) return;
  ui.line = i;
  if (i < 0) { ui.sub.classList.remove('on'); return; }
  ui.who.textContent = LINES[i][2]; ui.said.textContent = LINES[i][3];
  ui.sub.classList.add('on');
  Snd.play('radioKey');
  // (and it is in the journal's log afterwards, as everything said over the radio is)
  log(`${LINES[i][2]}: ${LINES[i][3].replace(/\n/g, ' ')}`, 'radio', { quiet: true });
}

/**
 * Play the opening. `done` is called once, when it is over or skipped, with the world put back as the game begins
 * in it: that is where the first lines of the game are said.
 */
export function startOpening(done) {
  if (film) return;
  const e = ctx.engine, cam = e.camera;
  const keep = { tod: S.tod, storm: S.storm.i, hold: S.storm.hold, fov: cam.fov, lampGlow: null };
  const wake = ground(player.pos), up = wake.clone().normalize();
  // (the wind is the game's own: the dust on the screen streams along it. See render/vfx.js)
  const wind = V().set(-up.z, 0, up.x).normalize();
  const hit = ground(_a.copy(wake).addScaledVector(wind, -CARRY));
  const door = ground(siteLocalToWorld(World.hab, 4, 0, 13, _a));
  const along = V().copy(hit).sub(door); along.addScaledVector(up, -along.dot(up)).normalize();       // the way they walk
  const lineLen = _a.copy(hit).sub(door).length();
  // The rocket stands on along their line, or off to one side of it if a hill stands between that place and where he
  // will lie: the first of these that its upper half can be seen from. (On rising ground the last shot was of a
  // hillside with a glow behind it.)
  const eye = ground(wake, 2.2);
  let mavAt = null;
  for (const deg of [0, 18, -18, 36, -36, 54, -54, 75, -75]) {
    const at = ground(_a.copy(hit).addScaledVector(_b.copy(along).applyAxisAngle(up, deg * Math.PI / 180), MAV_FAR));
    if (!mavAt) mavAt = at;
    if (clearLine(eye, ground(at, 13, _c), 1.0)) { mavAt = at; break; }
  }
  /** A place on their line, `s` metres from the door, `side` metres downwind of it, `h` over the ground. */
  const onLine = (s, side, h, out) => ground(out.copy(door).addScaledVector(along, s).addScaledVector(wind, side), h, out);

  // ---- the hour and the weather
  {
    const lon = ((Math.atan2(-up.z, up.x) * 180 / Math.PI) + 360) % 360;
    S.tod = (((HOUR / 24.66 - 0.5) - lon / 360) % 1 + 1) % 1;
    S.storm.hold = undefined; S.storm.i = STORM;
    updateSunDir();
    e.sky.update(e.sunDir, cam.position, STORM, e.time);
    e.snapLight = 3;
  }

  // ---- the cast: five who leave and one who does not (he is the last in the line)
  const glowMap = softDisc(64), hazeMap = hazeTexture();
  const shadeGeo = new THREE.PlaneGeometry(1.5, 1.3); shadeGeo.rotateX(-Math.PI / 2);
  const bedGeo = new THREE.PlaneGeometry(1.7, 3.3); bedGeo.rotateX(-Math.PI / 2);
  const shadeMap = shadeTexture();
  const shadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: shadeMap, transparent: true, opacity: 0.5, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const cast = [];
  for (let i = 0; i < 6; i++) { const f = figure(glowMap, { geo: shadeGeo, mat: shadeMat }); f.mixer.setTime(i * 0.37); act(f, 'Walk', 0); cast.push(f); }
  const mark = cast[5];
  // (the long patch he lies on: under the length of him, a pace ahead of where his feet are)
  const bed = new THREE.Mesh(bedGeo, shadeMat.clone());
  bed.position.set(0, 0.03, 0.95); bed.renderOrder = 2; bed.material.opacity = 0;
  mark.root.add(bed);
  // (their helmet lamps are lit: every suit in the game shares the one material)
  const lampMats = [];
  cast[0].root.traverse((o) => { const mm = o.isMesh && !Array.isArray(o.material) ? o.material : null; if (mm && mm.name === 'helmet_light' && !lampMats.includes(mm)) lampMats.push(mm); });
  keep.lampGlow = lampMats.map((mm) => mm.emissiveIntensity);
  for (const mm of lampMats) mm.emissiveIntensity = 5;
  // Light to see them by: two of the pool's lamps travel with the line, one with whoever leads it and one with him.
  const lightLead = new THREE.Object3D(), lightMark = new THREE.Object3D(), lightFire = new THREE.Object3D();
  ctx.world.add(lightLead, lightMark, lightFire);
  const st = { lead: 1, mark: 1, fire: 0 };
  addLamp(lightLead, { color: 0xffedd2, power: 4.2, range: 11, decay: 1.5, level: () => st.lead });
  addLamp(lightMark, { color: 0xffedd2, power: 4.2, range: 11, decay: 1.5, level: () => st.mark });
  // ... and the engine's, when it lights: one lamp a hundred metres off that reaches all the way to him
  // (It hangs over the pad, where the plume and the dust it lights are, and not at the nozzle: from ten metres up at
  //  a hundred and twenty the ground is lit edge-on and takes nothing, and the launch changed nothing where he lay.)
  addLamp(lightFire, { color: 0xff8a3c, power: 430, range: 480, decay: 1.0, level: () => st.fire });

  // ---- the ascent vehicle that leaves
  const mav = model('mav');
  const mavRoot = new THREE.Group();
  mavRoot.add(mav.root);
  mavRoot.position.copy(mavAt);
  frameQuat(_a.copy(mavAt).normalize(), 0.7, mavRoot.quaternion);
  // (it leans downwind, thirteen degrees: it is why they go. Upright, "she's going over" was said of a rocket standing straight.)
  mavRoot.quaternion.premultiply(_q.setFromAxisAngle(_b.crossVectors(_a.copy(mavAt).normalize(), wind).normalize(), 0.23));
  mavRoot.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  ctx.world.add(mavRoot);
  // Its beacon: a flash at its head that shows through the dust from where the Hab is, so that what they walk toward
  // in the second shot, and what stands on the skyline in the third, is seen to be the same thing.
  const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: new THREE.Color(1.5, 1.7, 2.1), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  beacon.renderOrder = 22;
  ctx.world.add(beacon);
  const beaconOn = mav.part('strobe');
  const ascent = mav.part('ascent'), ascentY = ascent ? ascent.position.y : 0;
  const flame = buildFlame();
  (mav.part('flame') || ascent || mavRoot).add(flame);
  const fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeMap, color: new THREE.Color(2.4, 1.02, 0.36), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  fireGlow.renderOrder = 23;
  ctx.world.add(fireGlow);
  const strobe = ownMaterials(mav.part('strobe'));

  // ---- what hits him: the Hab's long-range dish, torn off its mast
  const dishM = model('uplink_dish');
  const dish = new THREE.Group();
  dishM.root.position.y = -1.3;
  dish.add(dishM.root);
  dish.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  dish.visible = false;
  ctx.world.add(dish);

  // ---- where he comes to rest: where the game's own figure will lie when it begins (game/player.js, wakeOnGround),
  //      his head the way that one's is, and along the ground whatever its slope (level on a slope, he floated)
  const restQ = lying(wake, _e.set(0, 0, 1).applyQuaternion(_q.copy(player.q).multiply(_q2.setFromAxisAngle(_a.set(0, 1, 0), (player.face || 0) + Math.PI))).clone(), new THREE.Quaternion());
  // The last shot's camera: beyond him from what it looks toward, low, and no lower than it must be to see over
  // the ground between (on a flat plain it is at his shoulder; under a rise it climbs until it sees over the crest).
  const seat = (aim, aimH, back0, side) => {
    const away = V().copy(wake).sub(aim); away.addScaledVector(up, -away.dot(up)).normalize();
    const out = V(), target = ground(aim, aimH);
    for (let h = 0.55; h <= 9; h += 0.45) {
      out.copy(wake).addScaledVector(away, back0 + h * 1.25).addScaledVector(_a.crossVectors(up, away), side);
      const r = Math.max(surfaceAt(out) + 0.45, wake.length() + h);
      out.normalize().multiplyScalar(r);
      if (clearLine(out, target, 0.35)) break;
    }
    return { at: out, target };
  };
  const crewAim = ground(_a.copy(hit).addScaledVector(along, 7));
  const seatA = seat(crewAim, 1.5, 3.0, 1.3), seatB = seat(mavAt, 12, 3.6, 1.1);

  // (the ground under the middle of him as he will lie, a pace ahead of where his feet are)
  const restMid = ground(V().set(0, 0, 0.9).applyQuaternion(restQ).add(wake)), mid = V(), off = V();
  // (the dish, having hit him, goes off to the side the lens is not on: straight on, it went through the lens)
  const veer = V().crossVectors(up, wind).normalize();
  if (_a.copy(seatA.at).sub(wake).dot(veer) > 0) veer.negate();
  const CLIP_PACE = 2.2 / (FLY + 0.25);      // his fall is the game's Collapse clip (2.2 s: to his knees, then onto his face), a little hurried

  if (astro) astro.visible = false;
  S.mode = 'cutscene';
  World.launch = { burning: false, alt: 0, focus: wake.clone(), ground: true };
  World.opening = { hit: false, hero: null, t: 0 };
  const heroAt = V();          // the middle of whoever the shot is about: the storm's veil thins there (main.js)
  buildUi();
  root.classList.add('is-opening');
  ui.line = -1;
  flame.visible = true; flame.scale.setScalar(0.001);
  e.final.uniforms.uFade.value = 1;
  // (none of the storm's nearest streamers: over a still, dark picture the gap between two is a dark shape with a clean
  //  edge. At three tenths of them there was still one, in a corner.)
  e.final.uniforms.uStreamers.value = 0;
  const still = reducedMotion();
  const shake = (k) => { if (!still && k > 0) cam.position.addScaledVector(_a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), k); };
  const setFov = (f) => { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } };
  let t = 0, struck = false, lit = false, calls = 0, waited = 0;
  // (the ground is built a tile at a time, in the background, and a game that has just begun has not got the tiles the
  //  first shot stands on: the film stays on its black until they are there, two seconds at the most)
  const groundBusy = () => { const g = ctx.terrain; return !!g && ((g.queue && g.queue.length > 0) || (g.pending && g.pending.size > 0)); };

  /** Stand one of them on the line: `s` metres along it, `side` to one side, facing `turn` radians round from the way they walk. */
  const stand = (f, s, side, turn, lean) => {
    // (how fast it is going along the line, from where it stood a frame ago: its walk is played at that pace, so that
    //  a boot that is down stays where it was put. At the clip's own pace whatever they did, they skated: three
    //  metres of ground a second went by under boots that were going back at five.)
    if (f.sWas !== undefined && frameDt > 0 && Math.abs(s - f.sWas) < 1.5) f.v = Math.abs(s - f.sWas) / frameDt;
    f.sWas = s;
    onLine(s, side, 0, f.root.position);
    _b.copy(f.root.position).normalize();
    _c.copy(along).applyAxisAngle(_b, turn);
    facing(_b, _c, f.root.quaternion);
    // (into the wind, and into the walk: upright in that weather they were out for a stroll)
    if (lean) f.root.quaternion.premultiply(_q.setFromAxisAngle(_a.crossVectors(_b, wind).normalize(), -0.10 * lean)).premultiply(_q2.setFromAxisAngle(_a.crossVectors(_b, _c).normalize(), 0.09 * lean));
  };
  /**
   * How much of a lamp shows from the camera: all of it close to, a glow at fifty metres, nothing past a hundred and
   * thirty. The lamp on a helmet is seen from in front of it and the marker on a pack from behind: each a point with
   * a little light round it. (As balls of light as big as the head, seen from every side, they were six people
   * carrying lanterns on their shoulders.)
   */
  const lampsSeen = () => {
    for (const f of cast) {
      const to = _a.copy(cam.position).sub(f.root.position), d = to.length(), k = Math.exp(-(d / 78) * (d / 78));
      const front = _b.set(0, 0, 1).applyQuaternion(f.root.quaternion), toward = to.dot(front) / Math.max(d, 0.01);
      const lampK = f.lampK === undefined ? 1 : f.lampK, markK = f.markK === undefined ? 1 : f.markK;
      for (const l of f.lamps) { l.scale.setScalar((0.13 + d * 0.008) * (0.6 + 0.4 * lampK) * l.userData.per); l.material.opacity = 0.95 * k * smoothstep(-0.15, 0.45, toward) * lampK; }
      f.mark.scale.setScalar((0.15 + d * 0.007) * f.mark.userData.per); f.mark.material.opacity = 0.9 * k * smoothstep(-0.15, 0.45, -toward) * markK;
    }
  };

  let frameDt = 0;
  const step = (dt) => {
    if (t === 0 && dt > 0 && waited < 2 && (calls++ < 3 || groundBusy())) { waited += dt; dt = 0; }
    t += dt; frameDt = dt;
    World.opening.t = t;
    flameTime.value = t;
    for (const f of cast) f.mixer.update(dt);
    // ---- what is said
    { let line = -1; for (let i = 0; i < LINES.length; i++) if (t >= LINES[i][0] && t < LINES[i][0] + LINES[i][1]) line = i; say(line); }

    if (t < T_WALK) {
      // 1. The Hab at dusk in the storm, thirty-five metres off: its porch lamps, its portholes and the beacon on
      //    its mast, the rover left where it stands; and the six of them coming away from it, past the lens, heads
      //    down. (From forty-five metres, with them between the lens and it, the Hab was a smudge behind six lamps.)
      setFov(40);
      const s5 = 0.8 + PACE * t;
      for (let i = 0; i < 6; i++) stand(cast[i], s5 + (5 - i) * GAP, (i % 2 ? 0.5 : -0.3), 0, 1);
      onLine(s5 + 5 * GAP + 2.2, 0, 1.3, lightLead.position);
      onLine(s5 + 2.2, 0, 1.3, lightMark.position);
      onLine(27.5 + t * 0.2, 5.6, 1.1, cam.position);
      // (the lens begins on the Hab and goes a little way with them, so the first of them is not cut by the edge of
      //  the picture before the shot is over)
      ground(siteLocalToWorld(World.hab, 3.5, 0, 5, _a), 2.9, _c);
      _c.lerp(onLine(s5 + 3.5 * GAP, 0, 1.4, _e), 0.34 * smoothstep(0.8, 5, t));
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(cam.position);
      World.opening.hero = null;
    } else if (t < T_AWAY) {
      // 2. Behind the last of them, at his shoulder: five lamps ahead of him going into the brown. Then the dish,
      //    out of the storm from upwind, and he is gone out of the side of the picture.
      setFov(50);
      const s5 = lineLen - PACE * (T_HIT - Math.min(t, T_HIT));
      for (let i = 0; i < 5; i++) stand(cast[i], s5 + (5 - i) * GAP + PACE * Math.max(0, t - T_HIT), (i % 2 ? 0.5 : -0.3), 0, 1);
      // (the two lamps: one over the two ahead of him and one over him, each a little behind its man, so that what
      //  the lens sees of them, their backs, is lit. Lit from in front, he was a black shape beside a white one.)
      onLine(s5 + 1.5 * GAP - 0.8, 0.5, 2.3, lightLead.position);
      if (t < T_HIT) { stand(mark, s5, -0.3, 0, 1); onLine(s5 - 1.0, 0.7, 2.2, lightMark.position); }
      // (the lens closes on him as they go: four seconds of one unchanging picture is a long time in a film of twenty-four)
      onLine(s5 - 4.6 + 1.3 * smoothstep(T_WALK, T_HIT, t), 1.5, 2.0, cam.position);
      // (the lens looks to the downwind side of them: they are in the left of the picture, clear of what is said at
      //  its foot, and he is thrown across the middle of it and not out of its edge)
      onLine(s5 + 7, 2.3, 1.25, _c);
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(cam.position);
      World.opening.hero = heroAt.copy(mark.root.position).addScaledVector(_b.copy(mark.root.position).normalize(), 1.0);
      World.opening.wide = 1; World.opening.clear = 1;
      if (t > T_HIT) shake(0.5 * (1 - (t - T_HIT) / (T_AWAY - T_HIT)));
    } else {
      // 3. From where he will lie, low, looking upwind: he and the dish come out of the murk; he rolls to rest by the
      //    lens. Far off, lamps turn and search where he was, and go. A dip to black; and then the rocket.
      const after = t - T_HIT;
      // the five: on a little way, stop, turn, look; two come back to where he was; then they go, fast
      for (let i = 0; i < 5; i++) {
        const f = cast[i], base = lineLen + (5 - i) * GAP + PACE * Math.min(after, 0.9) + (0.5 * PACE) * clamp(after - 0.9, 0, 1) * 0.5;
        const back = (i >= 3 ? 1 : 0.25) * smoothstep(2.2, 3.6, after) * (5 - i) * GAP * 0.8;
        const gone = Math.max(0, after - T_GO) * 5.1;
        const turn = Math.PI * smoothstep(1.2, 2.0, after) * (1 - smoothstep(T_GO - 0.2, T_GO + 0.4, after)) + 0.8 * Math.sin(after * 1.7 + i * 1.9) * smoothstep(1.6, 2.4, after) * (1 - smoothstep(T_GO - 0.3, T_GO + 0.2, after));
        stand(f, base - back + gone, (i % 2 ? 0.5 : -0.3), turn, after > T_GO ? 1 : 0.3);
        const moving = after < 1.4 || (after > 2.2 && after < 3.6) || after > T_GO;
        act(f, moving ? 'Walk' : 'Idle', 0.35);

        f.root.visible = t < T_DIP + 0.4;
      }
      onLine(lineLen + 3 * GAP, 0, 1.3, lightLead.position);
      st.lead = t < T_DIP ? 1 : 0;
      setFov(t < T_BACK ? 46 : 42);
      if (t < T_BACK) {
        // (he lies in the lower part of it, and beyond him is where they are: the lens looks between the two)
        cam.position.copy(seatA.at);
        _c.copy(seatA.target).lerp(_e.copy(wake).addScaledVector(up, 0.3), 0.42);
      } else {
        // (turned now to where the rocket stands, and it goes up with it: the fire climbs out of the top of the picture)
        const rise = smoothstep(T_LIFT, T_LIFT + 3.6, t);
        cam.position.copy(seatB.at).addScaledVector(up, 0.25 * rise);
        ground(_a.copy(mavAt), 12 + 50 * rise * rise, _c);
        _c.lerp(_e.copy(wake).addScaledVector(up, 0.3), 0.40 * (1 - rise));
      }
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(wake);
      World.opening.hero = heroAt;       // (set below, where he is put)
      // (lying, he is wider than the clearing made for a man on his feet, and close to: see main.js)
      World.opening.wide = 1.7; World.opening.clear = 1.3;
    }

    // ---- the dish, and what it does to him
    {
      const k = t - T_HIT, fromHit = k * 17;
      dish.visible = k > -2.3 && k < FLY + 2.2;
      if (dish.visible) {
        // (it comes along the wind two metres up, turning over; after him it goes on, lower and off to one side, and is gone)
        const along1 = k < 0 ? fromHit * 1.25 : fromHit, h = 1.9 + 0.4 * Math.sin(k * 5) - (k > 0 ? Math.min(0.8, k * 0.5) : 0);
        ground(_a.copy(hit).addScaledVector(wind, along1).addScaledVector(veer, Math.max(0, k) * 5), h, dish.position);
        _b.copy(dish.position).normalize();
        facing(_b, wind, dish.quaternion);
        // (end over end along the wind, its mast leaning well out of the plane it turns in: so it is never upright,
        //  and no moment of it is a dish standing on its foot in the sand)
        dish.quaternion.multiply(_q.setFromAxisAngle(_a.set(1, 0, 0), k * 7.3)).multiply(_q2.setFromAxisAngle(_a.set(0, 0, 1), 0.95 + 0.25 * Math.sin(k * 3.1)));
      }
      if (k >= 0 && !struck) {
        struck = true;
        World.opening.hit = true;                      // (from here his suit is holed: the sound of it begins. See audio/driver.js)
        Snd.play('roverThud'); Snd.play('land', { hard: true, g: 1 });
        act(mark, 'Collapse', 0.12);
        if (mark.acts.Collapse) mark.acts.Collapse.setEffectiveTimeScale(CLIP_PACE);
      }
      if (k >= 0) {
        const u = clamp(k / FLY, 0, 1), go = 1 - (1 - u) * (1 - u);
        // Thrown, once over in the air, down on his knees, and onto his face: it is the middle of him that is flung
        // and that he turns about. (Turned about his feet, which is where a figure's origin is, he went over with
        // his head a metre under the sand.) Where his middle is in his own frame follows the clip: over his feet
        // standing, lower and ahead of them on his knees, a pace ahead and on the ground lying.
        const tc = k * CLIP_PACE, kn = smoothstep(0, 0.8, tc), dn = smoothstep(1.02, 1.74, tc);
        off.set(0, 1.0 - 0.35 * kn - 0.45 * dn, 0.4 * kn + 0.5 * dn);
        // (one long bound that he turns over in, his knees down at the end of it, and a short one that he pitches forward in)
        const lift = 1.3 * Math.abs(Math.sin(Math.PI * 1.5 * Math.min(1, u / 0.83))) * Math.pow(1 - u, 1.5) + 0.16 * Math.sin(Math.PI * clamp((u - 0.42) / 0.36, 0, 1));
        ground(_a.copy(hit).lerp(restMid, go), off.y + lift, mid);
        _b.copy(mid).normalize();
        facing(_b, along, _q);
        _q.slerp(restQ, smoothstep(0.1, 1, u));
        // (over the way the blow sends him, his head downwind first, and still coming round as his knees touch and he
        //  goes on down: done turning sooner, he was for a third of a second a man standing upright beside the dish)
        _q2.setFromAxisAngle(_a.crossVectors(_b, wind).normalize(), Math.PI * 2 * smoothstep(0, 0.78, u));
        mark.root.quaternion.copy(_q2).multiply(_q);
        mark.root.position.copy(mid).sub(off.applyQuaternion(mark.root.quaternion));
        // (and the last of the slide brings him exactly to where the game's own figure lies)
        { const settle = smoothstep(0.8, 1, u); mark.root.position.lerp(wake, settle); mark.root.quaternion.slerp(restQ, settle); }
        if (t >= T_AWAY) heroAt.copy(mid);
        // his lamp: it flickers as he goes, and is out before the others have turned
        mark.lampK = (1 - smoothstep(1.1, 2.6, k)) * (0.55 + 0.45 * Math.sin(k * 41) * Math.sin(k * 17));
        mark.markK = 1 - smoothstep(1.4, 3.0, k);
        // (it does not go quite out: a quarter of it is left on him until the engine lights him. With none, a grey
        //  suit on brown sand at dusk was a shape you could see the ground through.)
        st.mark = Math.max(0.26 * (1 - smoothstep(T_FIRE, T_FIRE + 0.6, t)), (1 - smoothstep(0.9, 2.4, k)) * (0.6 + 0.4 * Math.sin(k * 41)));
        lightMark.position.copy(mid).addScaledVector(up, 0.8);
        // (his shade: none in the air, the long patch as he comes down onto his face)
        mark.under.material.opacity = 0.5 * Math.max(1 - smoothstep(0, 0.12, u), smoothstep(0.46, 0.56, u) * (1 - smoothstep(0.72, 0.9, u)));    // (and under his knees, where he comes down on them)
        bed.material.opacity = 0.62 * smoothstep(0.75, 1, u);
        for (const mm of lampMats) mm.emissiveIntensity = 5;      // (the others' stay lit: his is the sprite's to put out)
      }
    }

    // ---- the rocket
    {
      const burn = smoothstep(T_FIRE, T_FIRE + 0.5, t), lt = Math.max(0, t - T_LIFT), alt = 3.6 * lt * lt;
      if (ascent) ascent.position.y = ascentY + alt;
      // (seen through a hundred metres of dust, and through more as it climbs: a glow with a flame in it, never a clean jet)
      const through = 0.42 * (1 - smoothstep(34, 120, alt));
      flame.scale.setScalar(Math.max(0.001, burn));
      const P = flame.userData;
      if (P.flame) P.flame.material.uniforms.uGain.value = 2.0 * through;
      if (P.core) P.core.material.uniforms.uGain.value = 3.4 * through;
      if (P.wide) P.wide.material.uniforms.uGain.value = 1.5 * through;
      if (P.glow) P.glow.material.opacity = through * 2;
      flame.getWorldPosition(_a);
      fireGlow.position.copy(_a);
      // (the dust between is lit by it: a haze of light many times the size of the flame, that goes up with it and thins)
      fireGlow.scale.setScalar(100 + 70 * burn + alt * 0.9);
      fireGlow.material.opacity = burn * (0.46 + 0.06 * Math.sin(t * 37)) * (1 - smoothstep(60, 190, alt)) * (t > T_BACK ? 1 : 0);
      lightFire.position.copy(_a).addScaledVector(up, 32);
      st.fire = burn * (1 - smoothstep(70, 190, alt)) * (0.9 + 0.1 * Math.sin(t * 31)) * (t > T_BACK ? 1 : 0);
      for (const mm of strobe) mm.emissiveIntensity = Math.sin(t * 7) > 0.6 ? 1.6 : 0.04;
      // (the beacon: two quick flashes and a second of dark, seen from as far as the Hab; it goes up with the rocket)
      if (beaconOn) { beaconOn.getWorldPosition(_a); ctx.world.worldToLocal(_a); } else ground(mavAt, 24 + alt, _a);
      beacon.position.copy(_a);
      { const d = _a.distanceTo(cam.position), ph = (t * 0.8) % 1, on = ph < 0.07 || (ph > 0.16 && ph < 0.23) ? 1 : 0.05;
        beacon.scale.setScalar(0.5 + d * 0.016); beacon.material.opacity = on * Math.exp(-(d / 210) * (d / 210)) * (1 - smoothstep(40, 160, alt)); }
      World.launch.burning = burn > 0.02 && lt < 3.0;
      World.launch.alt = Math.min(1100, alt * 9);
      if (burn > 0.02 && !lit) lit = true;
      // (the roar goes with it up into the storm, and what is left is the wind)
      Snd.rumble(lt >= 3.0 ? 0.8 * (1 - smoothstep(3.0, 5.6, lt)) : 0);
      if (t > T_FIRE && t < T_OUT) shake(0.06 * burn * (1 - smoothstep(0, 4.5, lt)));
    }

    // (each of them walks at the pace it is going at)
    for (const f of cast) if (f.now === 'Walk' && f.acts.Walk && f.v !== undefined && f !== mark || (f === mark && !struck && f.acts.Walk && f.v !== undefined)) f.acts.Walk.setEffectiveTimeScale(clamp(f.v / WALK_PACE, 0.3, 1.4));
    lampsSeen();
    ui.card.classList.toggle('on', t >= T_CARD && t < T_END - 0.5);
    // ---- up out of black, down to it between the two parts of the last shot, and out
    e.final.uniforms.uFade.value = Math.max(1 - smoothstep(0.15, 1.1, t), 1 - smoothstep(0, 0.32, Math.abs(t - (T_DIP + T_BACK) / 2) - 0.1), smoothstep(T_OUT, T_OUT + 1.0, t));
    if (t >= T_END) finish();
  };

  const finish = () => {
    if (!film) return;
    film = null;
    say(-1);
    ui.card.classList.remove('on');
    root.classList.remove('is-opening');
    // the props go, and with them the three lamps
    for (const o of [lightLead, lightMark, lightFire]) { removeLampsOf(o); ctx.world.remove(o); }
    for (const f of cast) { f.mixer.stopAllAction(); ctx.world.remove(f.root); for (const l of f.lamps) l.material.dispose(); f.mark.material.dispose(); f.under.material.dispose(); }
    for (let i = 0; i < lampMats.length; i++) lampMats[i].emissiveIntensity = keep.lampGlow[i];
    flame.removeFromParent();
    flame.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
    for (const o of [mavRoot, dish, fireGlow, beacon]) ctx.world.remove(o);
    for (const mm of strobe) mm.dispose();
    fireGlow.material.dispose(); beacon.material.dispose(); glowMap.dispose(); hazeMap.dispose();
    shadeGeo.dispose(); bedGeo.dispose(); shadeMat.dispose(); shadeMap.dispose(); bed.material.dispose();
    Snd.rumble(0);
    e.final.uniforms.uStreamers.value = 1;
    // the morning after, as the game has always begun
    S.tod = keep.tod; S.storm.i = keep.storm; S.storm.hold = keep.hold;
    updateSunDir();
    setFov(keep.fov);
    S.mode = 'walk';
    World.launchAnim = null; World.launch = null; World.opening = null;
    if (astro) astro.visible = true;
    resetWalkCamera();
    wakeOnGround(WAKE_RISE);
    // (the sky, the light and the lamps go to the morning at once: the evening's stars were in the first frames of it)
    e.sky.update(e.sunDir, cam.position, S.storm.i, e.time);
    e.snapLight = 3;
    e.final.uniforms.uFade.value = 1;
    fadeIn = WAKE_FADE;
    if (done) done();
  };

  film = { step, finish };
  World.launchAnim = step;
  step(0);
}

/** Leave the film now: to the morning. */
export function skipOpening() { if (film) film.finish(); }

/** The first picture of the game comes up out of the black the film ended in (called every step of play). */
export function updateOpeningFade(dt) {
  if (fadeIn <= 0) return;
  fadeIn = Math.max(0, fadeIn - dt);
  ctx.engine.final.uniforms.uFade.value = smoothstep(0, WAKE_FADE, fadeIn);
}

/** How long the film runs, in seconds (for the tests). */
export const OPENING_LENGTH = T_END;
