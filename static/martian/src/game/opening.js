// The opening: how he came to be alone. A new game begins with it, and it ends where the game has always begun: on
// his face in the sand, eighty-five metres from the Hab, with a hole in his suit.
//
// It is the evacuation, as the book has it, in twenty-five seconds and three shots:
//   1  the Hab in the storm at dusk, its lamps and beacon in the murk, and six people filing out past the lens
//   2  the walk to the ascent vehicle, from behind the last of them; something comes out of the storm and takes him
//   3  from where he lies: lamps that search in the wrong place and go; then, far off, a rocket leaving without him
// and then black, and morning, and the first second of play.
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

const HOUR = 18.6;            // local time of the film: the sun just down, a brown dusk
const STORM = 0.92;           // how thick the dust is
const PACE = 2.0;             // metres a second, walking into it
const GAP = 3.3;              // metres between one of them and the next
const CARRY = 28;             // metres the thing that hits him carries him, downwind, out of their sight
const MAV_FAR = 115;          // metres from where he is hit to the ascent vehicle, further along their line
// seconds from the first frame
const T_WALK = 5.0;           // cut: from the Hab to the walk
const T_HIT = 10.2;           // it reaches him
const T_AWAY = 10.5;          // cut: to where he will come to rest
const FLY = 1.7;              // seconds he is in the air and rolling
const T_DIP = 15.2;           // a dip to black: they have gone to the rocket, and minutes pass
const T_BACK = 15.9;          // ... and back, on him
const T_FIRE = 17.0;          // ignition
const T_LIFT = 17.7;          // lift-off
const T_OUT = 21.3;           // the fade to black begins
const T_END = 23.0;           // morning
const WAKE_FADE = 1.3;        // seconds the first picture of the game takes to come up out of the black
const LINES = [
  [0.7, 4.0, 'LEWIS', 'That’s the abort line. Everyone to the MAV.'],
  [5.5, 3.8, 'MARTINEZ', 'MAV’s leaning, Commander. Wind’s still climbing.'],
  [10.6, 1.9, 'JOHANSSEN', 'Watney’s telemetry just dropped.'],
  [12.6, 1.7, 'LEWIS', 'Mark! Sound off!'],
  [14.0, 2.2, 'MARTINEZ', 'She won’t hold. We go now or we don’t go.'],
  [16.2, 1.6, 'LEWIS', 'Launch.'],
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

let film = null;
let fadeIn = 0;
let ui = null;

/** True while the film is on the screen. */
export function openingOn() { return !!film; }

/** One of the six: a suited figure with a lamp on its helmet and a marker on its pack, and the clips it needs. */
function figure(glowMap) {
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
  const spot = (color, size, x, y, z) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.scale.setScalar(size); s.position.set(x, y, z); s.renderOrder = 22;
    holder.add(s);
    return s;
  };
  const f = { root: holder, mixer, acts, now: '', lamp: spot(new THREE.Color(1.9, 1.7, 1.3), 1.0, 0, 1.74, 0.30), mark: spot(new THREE.Color(1.5, 0.22, 0.08), 0.5, 0, 1.38, -0.33) };
  ctx.world.add(holder);
  return f;
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
  const box = el('div', 'mg-film', null, root, '<p class="sub" role="status"><b></b><span></span></p><button type="button" class="skip">Skip</button>');
  ui = { box, sub: box.querySelector('.sub'), who: box.querySelector('.sub b'), said: box.querySelector('.sub span'), skip: box.querySelector('.skip'), line: -1 };
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
  // (and it is in the journal's log afterwards, as everything said over the radio is)
  log(`${LINES[i][2]}: ${LINES[i][3]}`, 'radio', { quiet: true });
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
  const mavAt = ground(_a.copy(hit).addScaledVector(along, MAV_FAR));
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
  const glowMap = softDisc(64);
  const cast = [];
  for (let i = 0; i < 6; i++) { const f = figure(glowMap); f.mixer.setTime(i * 0.37); act(f, 'Walk', 0); cast.push(f); }
  const mark = cast[5];
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
  addLamp(lightFire, { color: 0xff8a3c, power: 150, range: 420, decay: 1.0, level: () => st.fire });

  // ---- the ascent vehicle that leaves
  const mav = model('mav');
  const mavRoot = new THREE.Group();
  mavRoot.add(mav.root);
  mavRoot.position.copy(mavAt);
  frameQuat(_a.copy(mavAt).normalize(), 0.7, mavRoot.quaternion);
  mavRoot.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  ctx.world.add(mavRoot);
  const ascent = mav.part('ascent'), ascentY = ascent ? ascent.position.y : 0;
  const flame = buildFlame();
  (mav.part('flame') || ascent || mavRoot).add(flame);
  const fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: new THREE.Color(2.6, 1.15, 0.42), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false }));
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

  // ---- where he comes to rest: as the game's own figure will lie when it begins (game/player.js, wakeOnGround)
  const restQ = new THREE.Quaternion().copy(player.q).multiply(_q.setFromAxisAngle(_a.set(0, 1, 0), (player.face || 0) + Math.PI));

  if (astro) astro.visible = false;
  S.mode = 'cutscene';
  World.launch = { burning: false, alt: 0, focus: wake.clone(), ground: true };
  World.opening = { hit: false, hero: null, t: 0 };
  buildUi();
  root.classList.add('is-opening');
  ui.line = -1;
  flame.visible = true; flame.scale.setScalar(0.001);
  e.final.uniforms.uFade.value = 1;
  const still = reducedMotion();
  const shake = (k) => { if (!still && k > 0) cam.position.addScaledVector(_a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), k); };
  const setFov = (f) => { if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); } };
  let t = 0, struck = false, lit = false;

  /** Stand one of them on the line: `s` metres along it, `side` to one side, facing `turn` radians round from the way they walk. */
  const stand = (f, s, side, turn, lean) => {
    onLine(s, side, 0, f.root.position);
    _b.copy(f.root.position).normalize();
    _c.copy(along).applyAxisAngle(_b, turn);
    facing(_b, _c, f.root.quaternion);
    // (into the wind, and into the walk: upright in that weather they were out for a stroll)
    if (lean) f.root.quaternion.premultiply(_q.setFromAxisAngle(_a.crossVectors(_b, wind).normalize(), -0.10 * lean)).premultiply(_q2.setFromAxisAngle(_a.crossVectors(_b, _c).normalize(), 0.09 * lean));
  };
  /** How much of a lamp shows from the camera: all of it close to, a glow at fifty metres, nothing past a hundred and thirty. */
  const lampsSeen = () => {
    for (const f of cast) {
      const d = _a.copy(f.root.position).sub(cam.position).length(), k = Math.exp(-(d / 78) * (d / 78));
      const size = 0.55 + d * 0.035;
      f.lamp.scale.setScalar(size * (f.lampK === undefined ? 1 : f.lampK)); f.lamp.material.opacity = 0.9 * k;
      f.mark.scale.setScalar(0.3 + d * 0.022); f.mark.material.opacity = 0.85 * k * (f.markK === undefined ? 1 : f.markK);
    }
  };

  const step = (dt) => {
    t += dt;
    World.opening.t = t;
    flameTime.value = t;
    for (const f of cast) f.mixer.update(dt);
    // ---- what is said
    { let line = -1; for (let i = 0; i < LINES.length; i++) if (t >= LINES[i][0] && t < LINES[i][0] + LINES[i][1]) line = i; say(line); }

    if (t < T_WALK) {
      // 1. The Hab at dusk in the storm, forty metres off: its porch lamps, its portholes and the beacon on its mast,
      //    and the six of them coming out of the murk and past the lens, heads down.
      setFov(38);
      const s5 = 12 + PACE * t;
      for (let i = 0; i < 6; i++) stand(cast[i], s5 + (5 - i) * GAP, (i % 2 ? 0.5 : -0.3), 0, 1);
      onLine(s5 + 5 * GAP + 2.2, 0, 1.3, lightLead.position);
      onLine(s5 + 2.2, 0, 1.3, lightMark.position);
      onLine(41 + t * 0.25, 4.6, 1.15, cam.position);
      onLine(6, -1.5, 2.6, _c);
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(cam.position);
      World.opening.hero = null;
    } else if (t < T_AWAY) {
      // 2. Behind the last of them, at his shoulder: five lamps ahead of him going into the brown. Then the dish,
      //    out of the storm from upwind, and he is gone out of the side of the picture.
      setFov(50);
      const s5 = lineLen - PACE * (T_HIT - Math.min(t, T_HIT));
      for (let i = 0; i < 5; i++) stand(cast[i], s5 + (5 - i) * GAP + PACE * Math.max(0, t - T_HIT), (i % 2 ? 0.5 : -0.3), 0, 1);
      onLine(s5 + 5 * GAP + 2.2, 0, 1.3, lightLead.position);
      if (t < T_HIT) { stand(mark, s5, -0.3, 0, 1); onLine(s5 + 2.2, 0, 1.3, lightMark.position); }
      onLine(s5 - 3.6, 1.5, 2.0, cam.position);
      onLine(s5 + 7, -0.4, 1.25, _c);
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(cam.position);
      World.opening.hero = t < T_HIT ? mark.root : null;
      if (t > T_HIT) shake(0.5 * (1 - (t - T_HIT) / (T_AWAY - T_HIT)));
    } else {
      // 3. From where he will lie, low, looking upwind: he and the dish come out of the murk; he rolls to rest by the
      //    lens. Far off, lamps turn and search where he was, and go. A dip to black; and then the rocket.
      const after = t - T_HIT;
      // the five: on a little way, stop, turn, look; two come back to where he was; then they go, fast
      for (let i = 0; i < 5; i++) {
        const f = cast[i], base = lineLen + (5 - i) * GAP + PACE * Math.min(after, 0.9) + (0.5 * PACE) * clamp(after - 0.9, 0, 1) * 0.5;
        const back = (i >= 3 ? 1 : 0.25) * smoothstep(2.2, 3.6, after) * (5 - i) * GAP * 0.8;
        const gone = Math.max(0, after - 4.2) * 3.4;
        const turn = Math.PI * smoothstep(1.2, 2.0, after) * (1 - smoothstep(4.0, 4.6, after)) + 0.8 * Math.sin(after * 1.7 + i * 1.9) * smoothstep(1.6, 2.4, after) * (1 - smoothstep(3.9, 4.4, after));
        stand(f, base - back + gone, (i % 2 ? 0.5 : -0.3), turn, after > 4.2 ? 1 : 0.3);
        const moving = after < 1.4 || (after > 2.2 && after < 3.6) || after > 4.2;
        act(f, moving ? 'Walk' : 'Idle', 0.35);
        if (f.acts.Walk) f.acts.Walk.setEffectiveTimeScale(after > 4.2 ? 1.5 : 1);
        f.root.visible = t < T_DIP + 0.4;
      }
      onLine(lineLen + 3 * GAP, 0, 1.3, lightLead.position);
      st.lead = t < T_DIP ? 1 : 0;
      setFov(t < T_BACK ? 44 : 40);
      if (t < T_BACK) {
        ground(_a.copy(wake).addScaledVector(wind, 2.4).addScaledVector(along, -1.3), 0.5, cam.position);
        // (toward where they are, a little above the ground: he comes down the middle of it)
        ground(_a.copy(hit).addScaledVector(along, 5), 1.5, _c);
      } else {
        // (nearer him now, and turned to where the rocket stands: it climbs through the top of the picture)
        const rise = smoothstep(T_LIFT, T_LIFT + 3.4, t);
        ground(_a.copy(wake).addScaledVector(wind, 2.2).addScaledVector(along, -2.4), 0.42, cam.position);
        ground(_a.copy(mavAt), 9 + 46 * rise * rise, _c);
        _c.lerp(_e.copy(wake).addScaledVector(up, 0.6), 0.17 * (1 - rise));
      }
      camLookAt(_c, _b.copy(cam.position).normalize());
      World.launch.focus.copy(wake);
      World.opening.hero = mark.root;
    }

    // ---- the dish, and what it does to him
    {
      const k = t - T_HIT, fromHit = k * 17;
      dish.visible = k > -1.7 && k < FLY + 2.2;
      if (dish.visible) {
        // (it comes along the wind a metre and a half up, turning over; after him it goes on, lower, and is gone)
        const along1 = k < 0 ? fromHit * 1.5 : fromHit, h = 1.5 + 0.5 * Math.sin(k * 5) - (k > 0 ? Math.min(0.9, k * 0.5) : 0);
        ground(_a.copy(hit).addScaledVector(wind, along1), h, dish.position);
        _b.copy(dish.position).normalize();
        facing(_b, wind, dish.quaternion);
        dish.quaternion.multiply(_q.setFromAxisAngle(_a.set(1, 0, 0), k * 7.3)).multiply(_q2.setFromAxisAngle(_a.set(0, 0, 1), 0.6 + k * 2.1));
      }
      if (k >= 0 && !struck) {
        struck = true;
        World.opening.hit = true;                      // (from here his suit is holed: the sound of it begins. See audio/driver.js)
        Snd.play('roverThud'); Snd.play('land', { hard: true, g: 1 });
        act(mark, 'Collapse', 0.12);
        if (mark.acts.Collapse) mark.acts.Collapse.setEffectiveTimeScale(2.2 / (FLY + 0.25));
      }
      if (k >= 0) {
        const u = clamp(k / FLY, 0, 1), go = 1 - (1 - u) * (1 - u);
        _a.copy(hit).lerp(wake, go);
        ground(_a, 1.25 * Math.sin(Math.PI * Math.min(1, u * 1.25)) * (1 - 0.55 * u), mark.root.position);
        _b.copy(mark.root.position).normalize();
        facing(_b, along, _q);
        _q.slerp(restQ, smoothstep(0.1, 1, u));
        // (once over, about the axis square to the wind, and done turning before he is down)
        _q2.setFromAxisAngle(_a.crossVectors(_b, wind).normalize(), -Math.PI * 2 * smoothstep(0, 0.8, u));
        mark.root.quaternion.copy(_q2).multiply(_q);
        if (u >= 1) { mark.root.position.copy(wake); mark.root.quaternion.copy(restQ); }
        // his lamp: it flickers as he goes, and is out before the others have turned
        mark.lampK = (1 - smoothstep(1.1, 2.6, k)) * (0.55 + 0.45 * Math.sin(k * 41) * Math.sin(k * 17));
        mark.markK = 1 - smoothstep(1.4, 3.0, k);
        st.mark = Math.max(0, 1 - smoothstep(0.9, 2.4, k)) * (0.6 + 0.4 * Math.sin(k * 41));
        ground(_a.copy(mark.root.position).addScaledVector(up, 0), 0.9, lightMark.position);
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
      fireGlow.scale.setScalar(26 + 30 * burn + alt * 0.5);
      fireGlow.material.opacity = burn * (0.34 + 0.06 * Math.sin(t * 37)) * (1 - smoothstep(60, 170, alt)) * (t > T_BACK ? 1 : 0);
      lightFire.position.copy(_a);
      st.fire = burn * (1 - smoothstep(50, 170, alt)) * (0.9 + 0.1 * Math.sin(t * 31)) * (t > T_BACK ? 1 : 0);
      for (const mm of strobe) mm.emissiveIntensity = Math.sin(t * 7) > 0.6 ? 1.6 : 0.04;
      mavRoot.visible = t > T_BACK - 0.2;
      World.launch.burning = burn > 0.02 && lt < 3.0;
      World.launch.alt = Math.min(1100, alt * 9);
      if (burn > 0.02 && !lit) lit = true;
      // (the roar goes with it up into the storm, and what is left is the wind)
      Snd.rumble(lt >= 3.0 ? 0.8 * (1 - smoothstep(3.0, 5.6, lt)) : 0);
      if (t > T_FIRE && t < T_OUT) shake(0.06 * burn * (1 - smoothstep(0, 4.5, lt)));
    }

    lampsSeen();
    // ---- up out of black, down to it between the two parts of the last shot, and out
    e.final.uniforms.uFade.value = Math.max(1 - smoothstep(0.15, 1.1, t), 1 - smoothstep(0, 0.32, Math.abs(t - (T_DIP + T_BACK) / 2) - 0.1), smoothstep(T_OUT, T_OUT + 1.0, t));
    if (t >= T_END) finish();
  };

  const finish = () => {
    if (!film) return;
    film = null;
    say(-1);
    root.classList.remove('is-opening');
    // the props go, and with them the three lamps
    for (const o of [lightLead, lightMark, lightFire]) { removeLampsOf(o); ctx.world.remove(o); }
    for (const f of cast) { f.mixer.stopAllAction(); ctx.world.remove(f.root); f.lamp.material.dispose(); f.mark.material.dispose(); }
    for (let i = 0; i < lampMats.length; i++) lampMats[i].emissiveIntensity = keep.lampGlow[i];
    flame.removeFromParent();
    flame.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
    for (const o of [mavRoot, dish, fireGlow]) ctx.world.remove(o);
    for (const mm of strobe) mm.dispose();
    fireGlow.material.dispose(); glowMap.dispose();
    Snd.rumble(0);
    // the morning after, as the game has always begun
    S.tod = keep.tod; S.storm.i = keep.storm; S.storm.hold = keep.hold;
    updateSunDir();
    setFov(keep.fov);
    S.mode = 'walk';
    World.launchAnim = null; World.launch = null; World.opening = null;
    if (astro) astro.visible = true;
    resetWalkCamera();
    wakeOnGround(WAKE_FADE + 0.5);
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
