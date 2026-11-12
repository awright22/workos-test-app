/*
 * Sights: things worth stopping to look at.
 *
 * Mars has a sky and a weather of its own, and a man alone with them would come to know them.
 * Each sight is logged once, the first time he is out under the sky and has watched it for a
 * couple of seconds: Phobos crossing the night, Phobos going out in the planet's shadow, the
 * blue sunset, a dust devil close to, the Earth. A sight earns a little science credit and lifts
 * his spirits, and the journal keeps the list, with a hint for each one not yet seen.
 */
import * as THREE from 'three';
import { S } from './state.js';
import { ctx } from './ctx.js';
import { player } from './player.js';
import { devils } from './devils.js';
import { cheer } from './farm.js';
import { addCredit } from './science.js';
import { localHour } from './sim.js';
import { R } from '../planet/constants.js';
import { elevationKm3 } from '../planet/surface.js';
import { log, toast } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';

const _up = new THREE.Vector3(), _f = new THREE.Vector3(), _d = new THREE.Vector3();

/** What the tests below are given: where he is, where he looks, and what the sky is doing. */
function view() {
  const e = ctx.engine, sky = e.sky, cam = e.camera;
  _up.copy(player.pos).normalize();
  cam.getWorldDirection(_f);
  const sunE = e.sunDir.dot(_up);
  const ph = sky.uniforms.uPhobos.value, de = sky.uniforms.uDeimos.value, ea = sky.uniforms.uEarth.value;
  /** Is he looking within `deg` degrees of a direction that is at least `rise` above the horizon? */
  const at = (v, deg, rise = 0.1) => _d.set(v.x, v.y, v.z).dot(_up) > rise && _d.dot(_f) > Math.cos(deg * Math.PI / 180);
  return { sunE, hour: localHour(), storm: S.storm.i, clear: S.storm.i < 0.2, at, ph, de, ea, sun: e.sunDir, up: _up, toSun: _f.dot(e.sunDir) };
}

export const SIGHTS = [
  { id: 'phobos', name: 'Phobos', value: 6, cheer: 3,
    lead: 'The larger moon crosses the night sky twice a sol, from west to east.',
    note: 'Phobos. A lump of rock twenty-odd kilometres long, so low and so fast that it rises in the west and is gone in four hours. It is the nearest thing I have to company.',
    test: (v) => v.sunE < -0.1 && v.clear && v.ph.w > 0.8 && v.at(v.ph, 9) },
  { id: 'eclipse', name: 'Phobos goes out', value: 10, cheer: 4,
    lead: 'Keep watching Phobos through the middle of the night.',
    note: 'Half-way up the sky Phobos went out like a lamp. It had run into the shadow of the planet I am standing on. No one has watched that from down here with their own eyes.',
    // (he must have been watching it lit a little while before: a dark patch of sky is not a sight)
    test: (v) => v.sunE < -0.1 && v.clear && v.ph.w < 0.5 && clock - litAt < 40 && v.at(v.ph, 14) },
  { id: 'deimos', name: 'Deimos', value: 6, cheer: 2,
    lead: 'The smaller moon is hardly more than a bright star, and it barely moves.',
    note: 'Deimos. Half the size of Phobos and three times as far, so it hangs there for two days at a time, looking like a star that has lost its place.',
    test: (v) => v.sunE < -0.1 && v.clear && v.de.w > 0.8 && v.at(v.de, 7) },
  { id: 'earth', name: 'Earth', value: 8, cheer: 6,
    lead: 'In the west, after the sun has gone down.',
    note: 'That blue-white star in the west is Earth. Everyone I have ever met is on it, along with every potato I did not have to grow myself.',
    test: (v) => v.sunE < -0.06 && v.clear && v.at(v.ea, 7, 0.05) },
  { id: 'sunset', name: 'A blue sunset', value: 6, cheer: 4,
    lead: 'Watch the sun go down on a clear evening.',
    note: 'On Earth the sky is blue and the sunset red. Here it is the other way round: the dust scatters blue light forward, so the sun goes down in a pool of blue.',
    test: (v) => v.clear && v.sunE > -0.03 && v.sunE < 0.09 && v.hour > 13 && v.toSun > 0.9 },
  { id: 'sunrise', name: 'Sunrise', value: 5, cheer: 4,
    lead: 'Be outside, facing east, when the day starts.',
    note: 'Sunrise. The sun here is two thirds the size it should be and gives less than half the heat, and I have never been so glad to see anything.',
    test: (v) => v.clear && v.sunE > -0.03 && v.sunE < 0.09 && v.hour < 11 && v.toSun > 0.9 },
  { id: 'stars', name: 'The Milky Way', value: 5, cheer: 3,
    lead: 'Look straight up on a clear night, away from the lamps.',
    note: 'No moon to speak of, no cities, a hundredth of the air: I can see the whole galaxy edge-on. It does not twinkle. There is not enough atmosphere to make it.',
    test: (v) => v.sunE < -0.3 && v.clear && _f.dot(v.up) > 0.8 },
  { id: 'devil', name: 'A dust devil, close to', value: 8, cheer: 3,
    lead: 'They wander the plains on warm afternoons. Get near one.',
    note: 'A dust devil: a column of spinning air half a kilometre high, with nothing in it but dust and static. It went over me like a slap from a pillow.',
    test: () => devils.some((d) => d.u && Math.acos(Math.min(1, d.u.dot(_up))) * R < 45) },
  { id: 'storm', name: 'The inside of a dust storm', value: 8, cheer: 0,
    lead: 'It will come to you.',
    note: 'In a storm the sun is a white disc you can stare straight at, there are no shadows, and the horizon is twenty metres away in every direction.',
    test: (v) => v.storm > 0.7 },
  { id: 'midnight', name: 'The midnight sun', value: 12, cheer: 4,
    lead: 'In this season the far north has no night.',
    note: 'Midnight by the clock, and the sun is rolling along the horizon. Up here it will not set until the autumn.',
    test: (v) => (v.hour > 23.2 || v.hour < 1.2) && v.sunE > 0.02 && v.clear },
  { id: 'high', name: 'Above the weather', value: 12, cheer: 4,
    lead: 'The summits of the great volcanoes stand above most of the air.',
    note: 'Up here most of the atmosphere is below me. The sky overhead is nearly black at noon and the dust is a floor, a long way down.',
    test: (v) => v.sunE > 0.1 && elevationKm3(v.up.x, v.up.y, v.up.z) > 17 },
];
const BY_ID = Object.fromEntries(SIGHTS.map((s) => [s.id, s]));
const DWELL = 2.4;                     // seconds of looking before a sight is his
const held = {};
let throttle = 0, clock = 0, litAt = -1e9;      // litAt: when he last had Phobos in view and lit

export function sights() { if (!S.sights) S.sights = {}; return S.sights; }
export function initSights() { S.sights = {}; for (const k in held) held[k] = 0; }
export function sightsSeen() { return Object.keys(sights()).length; }
/** The list for the journal: every sight, seen or not. */
export function sightList() {
  const seen = sights();
  return SIGHTS.map((s) => ({ id: s.id, name: s.name, sol: seen[s.id] || 0, text: seen[s.id] ? s.note : s.lead }));
}
function see(s) {
  sights()[s.id] = S.sol;
  S.stats.sights = (S.stats.sights || 0) + 1;
  addCredit(s.value);
  cheer(s.cheer);
  Snd.jingle();
  toast('SIGHT', s.name, `Logged · +${s.value} science`);
  log(s.note);
}
/** Call every frame he is in the world. */
export function updateSights(dt) {
  if (S.inside || S.over || S.sleeping || S.flags.coldOpen) return;
  throttle += dt;
  if (throttle < 0.2) return;
  const step = throttle; throttle = 0;
  const seen = sights(), v = view();
  clock += step;
  if (v.ph.w > 0.8 && v.sunE < -0.1 && v.at(v.ph, 14)) litAt = clock;
  for (const s of SIGHTS) {
    if (seen[s.id]) continue;
    if (s.test(v)) { held[s.id] = (held[s.id] || 0) + step; if (held[s.id] >= DWELL) see(s); }
    else if (held[s.id]) held[s.id] = Math.max(0, held[s.id] - step * 2);
  }
}
export { BY_ID as SIGHT_BY_ID };
