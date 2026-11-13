import { DIFFICULTIES, S } from './state.js';
import { syncAllVisuals } from './visuals.js';
import { Snd } from '../audio/sound.js';
import { checkpoint, saveGame, wipeSave } from './save.js';
import { angDist, fmtDist, groundDist, tangentBasis } from '../planet/geo.js';
import { World, dropSupplyPod } from '../world/build.js';
import { hideOverlay, log, setPrompt, showOverlay, toast } from '../ui/dom.js';
import { revealMav } from './sim.js';
import { camLookAt, player } from './player.js';
import { _pe, _pn, _v1, _v2, _v3 } from '../core/scratch.js';
import { FEATURES } from '../planet/features.js';
import { R } from '../planet/constants.js';
import { closeScreens } from '../ui/screens.js';
import { surfaceAt } from '../planet/surface.js';
import { model } from '../world/models.js';
import { ctx } from './ctx.js';
import { clamp, smoothstep } from '../core/math.js';
import { tryReload } from './flow.js';
import { showComms } from '../ui/menus.js';
// The story: Pathfinder and NASA, survey quests, discoveries, achievements, the launch.
export function connectPathfinder() {
  S.pf.connected = true;
  syncAllVisuals();
  Snd.play('pfAlive');
  checkpoint();
  const mavDist = fmtDist(groundDist(World.hab.position, World.mav.position));
  const convo = [
    // (it was signed "— JPL" under the name HOUSTON)
    ['n', 'MARK? MARK, IS THAT YOU? This is Houston. We\'re receiving Pathfinder telemetry. The whole world is watching, Mark.'],
    ['w', 'Alive and well. Ish. Growing potatoes on a dead planet. Air holds, food\'s tight, morale is potato-based.'],
    ['n', `Copy. New plan: Ares 4\'s MAV is fuelled and standing in Schiaparelli crater, ${mavDist} from your position. Hermes swings back for a Sol ${S.rescueSol} intercept. Survive, drive, launch. We\'ll be there.`],
    ['w', S.sol >= S.rescueSol
      ? `So the plan is "drive ${mavDist} and ride a rocket somebody else parked." I\'ve had worse weekends.`
      : `So the plan is "don\'t die for ${S.rescueSol - S.sol} more sol${S.rescueSol - S.sol === 1 ? '' : 's'}, then drive ${mavDist} and ride a rocket somebody else parked." I\'ve had worse weekends.`],
    ['n', 'We\'re also uploading survey tasks — old landers with parts worth salvaging. Help us close some files, we drop supplies. And Mark: everything you type is broadcast live on Earth. Language.'],
    ['w', 'Acknowledged. [REDACTED BY NASA]. [ALSO REDACTED]. Boy, am I glad you warned me.'],
  ];
  let i = 0;
  const step = () => {
    if (i >= convo.length) {
      hideOverlay();
      log('Uplink holds. Earth is one very slow text message away.', 'nasa');
      offerQuests();
      if (S.sol >= S.rescueSol) revealMav();
      checkpoint();
      saveGame();
      return;
    }
    showComms({
      title: 'Pathfinder uplink', subtitle: 'Signal delay: 11 minutes, mercifully compressed',
      lines: convo, index: i,
      onNext: () => { i++; Snd.click(); step(); },
    });
    if (i === 0) Snd.ok();
  };
  step();
  log('IT TALKS. Pathfinder lives. Hello, Earth. Did you miss me?');
  onQuestEvent('pf-connected', '');
  checkAchievements();
}

// ============================================================
// 24. QUESTS
// ============================================================
export const QUEST_DEFS = [
  { id: 'viking1', name: 'Viking Funeral', target: 'Viking 1',
    desc: 'Salvage Viking 1 (1976) in Chryse Planitia. NASA wants a photo. And the descent-stage hydrazine.',
    ev: ['salvage', 'Viking 1'], loot: { scrap: 4, rations: 2, hydrazine: 1, seedTomato: 1 } },
  { id: 'spirit', name: 'Wake the Dead', target: 'Spirit',
    desc: 'Recover Spirit\'s memory boards at Gusev crater. She earned a proper goodbye.',
    ev: ['salvage', 'Spirit'], loot: { rations: 3, candle: 1, seedSoy: 1 }, bp: 'recycler' },
  { id: 'oppy', name: 'Oppy\'s Last Message', target: 'Opportunity',
    desc: 'Find Opportunity in Meridiani Planum and wipe her panels. Yes, it matters. To everyone.',
    ev: ['salvage', 'Opportunity'], loot: { rations: 4, circuit: 1 }, bp: 'drive2' },
  { id: 'insight', name: 'Marsquake', target: 'InSight',
    desc: 'Retrieve InSight\'s seismometer data from Elysium Planitia. 1300 marsquakes are waiting.',
    ev: ['salvage', 'InSight'], loot: { scrap: 2, candle: 1 }, reveal: true },
  { id: 'phoenix', name: 'Polar Express', target: 'Phoenix',
    desc: 'Reach Phoenix at the edge of the northern ice. Pack warm. Pack O2. Pack more O2.',
    ev: ['salvage', 'Phoenix'], loot: { rations: 4, hydrazine: 2 }, bp: 'tank2' },
  { id: 'mars3', name: 'Sirens of Mars', target: 'Mars 3',
    desc: 'Find Mars 3, silent since 1971, and recover its film canister. The first one deserves a visitor.',
    ev: ['salvage', 'Mars 3'], loot: { scrap: 5, rations: 5, circuit: 1, seedTomato: 1, seedLettuce: 1 } },
  { id: 'breadcrumbs', name: 'Breadcrumbs', target: null,
    desc: 'Pre-position the escape: deploy an O2 Cache and a Nav Beacon at least 2 km from the Hab, toward Schiaparelli.',
    ev: ['deploy', null], loot: { rations: 3, candle: 2 } },
];
export function questTargetPos(q) {
  if (q.target) {
    const rec = World.landers.find(l => l.data.name === q.target);
    return rec ? rec.group.position : null;
  }
  return null;
}
export function offerQuests() {
  for (const q of QUEST_DEFS) if (!S.quests[q.id]) S.quests[q.id] = 'active';
  // retro-complete survey tasks for landers already stripped before the uplink
  for (const name of Object.keys(S.salvaged)) onQuestEvent('salvage', name);
  log('NASA uploaded survey tasks — old landers with parts worth saving. Check the journal [J]. They pay in supply pods.', 'nasa');
  // the care package: ice drill blueprint arrives with the first pod
  dropSupplyPod({ scrap: 3, rations: 3, candle: 1, seedSoy: 2 }, 'Open NASA care package').blueprint = 'drill';   // Botany sent beans
}
export function onQuestEvent(type, name) {
  for (const q of QUEST_DEFS) {
    if (S.quests[q.id] !== 'active') continue;
    let hit = false;
    if (q.ev[0] === 'salvage' && type === 'salvage' && q.ev[1] === name) hit = true;
    if (q.id === 'breadcrumbs' && type === 'deploy') {
      let cache = false, beacon = false;
      for (const b of World.builtMeshes) {
        const d = groundDist(b.group.position, World.hab.position);
        if (d > 2000 && b.kind === 'cache') cache = true;
        if (d > 2000 && b.kind === 'beacon') beacon = true;
      }
      hit = cache && beacon;
    }
    if (!hit) continue;
    S.quests[q.id] = 'done';
    Snd.play('questDone');
    const pod = dropSupplyPod(q.loot, `Open "${q.name}" reward pod`);
    if (q.bp) pod.blueprint = q.bp;
    if (q.reveal) {
      S.flags.mapRevealed = true;
      log('InSight\'s data came with NASA\'s full survey map. Every landmark, revealed. [M]', 'nasa');
    }
    log(`Survey task complete: ${q.name}. NASA is sending a pod.`, 'nasa');
  }
}

// ============================================================
// 25. DISCOVERIES & ACHIEVEMENTS
// ============================================================
export function discover(name, note, isLander) {
  if (S.discovered[name]) return;
  S.discovered[name] = true;
  S.stats.discoveries++;
  Snd.discovery();
  toast(isLander ? 'SITE DISCOVERED' : 'REGION DISCOVERED', name.toUpperCase(), note || '');
  checkAchievements();
}
export let discTimer = 0;
export function updateDiscoveries(dt) {
  discTimer += dt;
  if (discTimer < 1.5) return;
  discTimer = 0;
  const pp = S.mode === 'rover' ? World.rover.group.position : player.pos;
  _v1.copy(pp).normalize();
  for (const rec of World.landers) {
    if (S.discovered[rec.data.name]) continue;
    if (groundDist(pp, rec.group.position) < 160) discover(rec.data.name, rec.data.note, true);
  }
  for (const f of FEATURES) {
    if (f.type === 'bulge' || f.type === 'albedo' || S.discovered[f.name]) continue;
    if (angDist(_v1.x, _v1.y, _v1.z, f.v.x, f.v.y, f.v.z) < f.angR) discover(f.name, f.note, false);
  }
}
export const ACHIEVEMENTS = [
  { id: 'notdead', name: 'Not Dead Yet', desc: 'Reach the dawn of Sol 2', check: () => S.sol >= 2 },
  { id: 'phone', name: 'Phone Home', desc: 'Restore the Pathfinder uplink', check: () => S.pf.connected },
  { id: 'botanist', name: 'Greatest Botanist on This Planet', desc: 'Harvest 50 potatoes', check: () => S.stats.potatoes >= 50 },
  { id: 'eyebrows', name: 'Both Eyebrows', desc: 'Five hydrazine burns survived', check: () => S.stats.booms >= 5 },
  { id: 'arch', name: 'Archaeologist of the Future', desc: 'Salvage 8 historic landers', check: () => Object.keys(S.salvaged).length >= 8 },
  { id: 'olympus', name: 'Peak Performance', desc: 'Stand on the summit of Olympus Mons',
    check: () => { const f = FEATURES.find(f => f.name === 'Olympus Mons'); _v2.copy(player.pos).normalize(); return angDist(_v2.x, _v2.y, _v2.z, f.v.x, f.v.y, f.v.z) * R < 120; } },
  { id: 'hellas', name: 'The Bottom of Everything', desc: 'Stand on the floor of Hellas Planitia',
    check: () => { const f = FEATURES.find(f => f.name === 'Hellas Planitia'); _v2.copy(player.pos).normalize(); return angDist(_v2.x, _v2.y, _v2.z, f.v.x, f.v.y, f.v.z) * R < 800; } },
  { id: 'circum', name: 'Circumnavigator', desc: 'Drive 75.4 km — one full lap of Mars', check: () => S.stats.driven >= 75400 },
  { id: 'ice', name: 'Ice to Meet You', desc: 'Mine 25 ice chunks', check: () => S.stats.mined >= 25 },
  { id: 'storm', name: 'Storm Rider', desc: 'Spend 60 seconds outside in a dust storm', check: () => S.stats.stormOut >= 60 },
  { id: 'marathon', name: 'Ares Marathon', desc: 'Walk 10 km on foot', check: () => S.stats.walked >= 10000 },
  { id: 'disco', name: 'Disco Inferno', desc: 'Endure 3 minutes of Lewis\'s playlist', check: () => S.stats.discoTime >= 180 },
  { id: 'rockhound', name: 'Rock Hound', desc: 'Catalogue 5 different materials', check: () => S.science && Object.keys(S.science.found).length >= 5 },
  { id: 'curator', name: 'Curator of Mars', desc: 'Catalogue 12 different materials', check: () => S.science && Object.keys(S.science.found).length >= 12 },
  { id: 'oldiron', name: 'Older Than the Planet', desc: 'Find an iron meteorite', check: () => S.science && !!S.science.found.meteorite },
  { id: 'fiveaday', name: 'Five a Day', desc: 'Harvest all five crops', check: () => !!S.stats.grown && Object.keys(S.stats.grown).length >= 5 },
  { id: 'chef', name: 'Chef de Mars', desc: 'Cook 5 dinners', check: () => !!(S.diet && S.diet.meals >= 5) },
  { id: 'home', name: 'No Place Like Hab', desc: 'Make 6 comforts for the Hab', check: () => !!S.comforts && Object.keys(S.comforts).length >= 6 },
  { id: 'pirate', name: 'Space Pirate', desc: 'Leave Mars', check: () => S.won },
];
export function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (S.achieved[a.id]) continue;
    let ok = false;
    try { ok = a.check(); } catch (e) {}
    if (ok) {
      S.achieved[a.id] = true;
      Snd.play('achievement');
      toast('ACHIEVEMENT', a.name, a.desc);
    }
  }
}

export let hermes = null;
export function startLaunch() {
  S.mode = 'cutscene';
  S.uiOpen = false;
  setPrompt(null);
  closeScreens();
  const mavUp = _v1.copy(World.mav.position).normalize().clone(), _lp = mavUp.clone();
  tangentBasis(mavUp, _pe, _pn);
  const camGround = World.mav.position.clone().addScaledVector(_pe, 26).addScaledVector(_pn, -20);
  camGround.normalize().multiplyScalar(surfaceAt(camGround) + 2.2);
  log('Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever.');
  if (S.pf.connected) {
    S.disco = true; Snd.disco(true);
    setTimeout(() => log('The playlist synced to the MAV. I\'m launching to disco. This is my life now.', 'nasa'), 3500);
  }
  [3, 2, 1].forEach((n, i) => setTimeout(() => { Snd.play('countdown'); log(`${n}...`, 'nasa'); }, 2000 + i * 1000));
  if (!hermes) {
    const h = model('hermes');
    hermes = h.root; World.hermesRing = h.part('ring'); hermes.scale.setScalar(30);
    ctx.world.add(hermes);
  }
  hermes.position.copy(mavUp).multiplyScalar(R * 1.85).addScaledVector(_pe, -R * 0.8);
  hermes.visible = false;
  const liftT = 5.2;
  let t = 0, alt = 0;
  World.launchAnim = (dt) => {
    t += dt;
    if (t <= liftT) {
      ctx.engine.camera.position.copy(camGround);
      camLookAt(_v2.copy(World.mav.position).addScaledVector(mavUp, 8), mavUp);
      return;
    }
    const lt = t - liftT;
    World.mavFlame.visible = true;
    Snd.rumble(clamp(lt * 0.5, 0, 0.85));
    alt = lt * lt * 14;
    World.mavRocket.position.y = World.mavRocketY + alt;
    World.mavFlame.scale.y = 1 + Math.random() * 0.4;
    const rocketWorld = _v2.copy(World.mav.position).addScaledVector(mavUp, alt + 8);
    // the exhaust: a column of pale smoke left hanging down the sky behind the climb
    if (ctx.vfx && alt < 5000) {
      ctx.vfx.puff(_lp.copy(rocketWorld).addScaledVector(mavUp, -11), { count: 2, speed: 2.5 + alt * 0.002, up: -4 - Math.min(14, lt * 2.5), spread: 1.2 + Math.min(6, alt * 0.004),
        size: 4.5 + Math.min(18, alt * 0.02), life: 6.5, tone: 0.75 });
    }
    if (alt < 2200) {
      // The first seconds from the ground, the rocket climbing out of its own dust. Then alongside and a little
      // above it, close enough that it stays large, so that the ground falls away under it and the horizon curves.
      // (It was watched from below the whole way: a rocket, then a dot, in an empty sky.)
      const a = smoothstep(30, 220, alt);
      ctx.engine.camera.position.copy(camGround).addScaledVector(mavUp, alt * (0.22 + 0.80 * a) + 26 * a)
        .addScaledVector(_pe, a * (14 + alt * 0.03)).addScaledVector(_pn, -a * alt * 0.012);
      S.shake = clamp(1.0 - lt * 0.06, 0, 1);
      ctx.engine.camera.position.addScaledVector(_v3.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), S.shake * 0.5);
      camLookAt(_v3.copy(World.mav.position).addScaledVector(mavUp, 8 + alt * (0.72 + 0.28 * a) - 5 * a), mavUp);
    } else {
      // pull out to orbit: watch the whole planet you survived
      const k = smoothstep(2200, 14000, alt);
      // (ending half as far from the Hermes as before, above and beside her and looking back down past her, so that
      // she is a ship and not a speck and the planet's limb curves through the frame behind her)
      _v3.copy(mavUp).multiplyScalar(R * (1.15 + k * 1.0)).addScaledVector(_pe, -R * 0.3 * k);
      ctx.engine.camera.position.lerp(_v3, 1 - Math.pow(0.02, dt));
      camLookAt(k > 0.6 ? hermes.position : rocketWorld, mavUp);
      Snd.rumble(clamp(1 - k, 0.1, 0.85));
    }
    hermes.visible = alt > 2200;        // (from the ground she is a speck above the dust, not a shape in the sky)
    if (alt > 8000) hermes.position.lerp(_v2.copy(mavUp).multiplyScalar(R * 1.85), 1 - Math.pow(0.3, dt));
    if (alt > 15500 && !S.won) winGame();
  };
}

export function winGame() {
  S.won = true;
  Snd.rumble(0);
  Snd.play('rescued');
  checkAchievements();
  setTimeout(() => Snd.disco(false), 6000);
  wipeSave();
  const st = S.stats;
  const grown = st.potatoes + (st.produce || 0), meals = (S.diet && S.diet.meals) || 0;
  // the run as he would log it: what was done, and on which sol (only what this save saw happen)
  const marks = st.marks || {};
  const STEPS = [['reach', 'Reached the Hab on a holed suit'], ['farm', 'Planted the first beds'], ['hydra', 'Made water from rocket fuel'],
    ['harvest', 'Brought in the first harvest'], ['dinner', 'Cooked a dinner worth the name'], ['pf', 'Raised Earth on Pathfinder’s radio'],
    ['survive', 'Outlasted the wait for the Hermes']];
  const steps = STEPS.filter(([id]) => marks[id]).map(([id, text]) => `<li><b class="t-num">Sol ${marks[id]}</b><span>${text}</span></li>`).join('') +
    `<li class="last"><b class="t-num">Sol ${S.sol}</b><span>Lifted off from Schiaparelli</span></li>`;
  // The interface says "you"; the log is his own voice. The closing line is the last entry of his log, so it is
  // in the first person. (It was a third-person "mission record", beside a death screen that says "You died".)
  const fed = grown >= 30 ? 'fed myself from Martian soil' : grown > 0 ? 'grew food where nothing grows' : 'lived on what the mission left behind';
  const went = st.driven > 30000 ? 'drove further than any rover has gone' : 'crossed the plains to Schiaparelli';
  const mood = S.morale >= 70 ? ' In better spirits than anyone had a right to expect.' : S.morale < 30 ? ' Worn thin. Going home anyway.' : '';
  showOverlay({
    kind: 'win',
    kicker: `Hermes intercept confirmed · Sol ${S.sol} · ${DIFFICULTIES[S.diff].name}`,
    title: 'Rescued',
    subtitle: 'You are off the surface.',
    // (each statistic has one name, here, in the journal and on the death screen)
    stats: [
      ['Sols survived', S.sol], ['Food grown', grown], ['Dinners cooked', meals],
      ['Km driven', (st.driven / 1000).toFixed(1)], ['Km walked', (st.walked / 1000).toFixed(1)], ['Discoveries', st.discoveries],
      ['Landers salvaged', Object.keys(S.salvaged).length], ['Close calls', st.closeCalls], ['Achievements', `${Object.keys(S.achieved).length}/${ACHIEVEMENTS.length}`],
    ],
    extra: `<ol class="steps" aria-label="The mission, sol by sol">${steps}</ol>`,
    quote: `${S.sol} sols alone on a planet. I ${fed}, ${went}, and I am going home.${mood}<cite>Log, Sol ${S.sol}: the last entry from the surface</cite>`,
    buttons: [{ label: 'Back to the title', keep: true, fn: () => tryReload() }],
  });
}
