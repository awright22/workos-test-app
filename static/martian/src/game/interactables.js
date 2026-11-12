import { HAB_R, World, buildDeployable, plotPlants, setSiteShown, siteLocalToWorld } from '../world/build.js';
import { groundDist, tangentBasis } from '../planet/geo.js';
import { player } from './player.js';
import { addI } from './interact.js';
import { BAL, S, roverPowerCap, suitCap } from './state.js';
import { flashScreen, log, showOverlay, toast } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';
import { checkAchievements, connectPathfinder, discover, onQuestEvent, startLaunch } from './story.js';
import { _fe, _fn, _v1, _v2, _v3 } from '../core/scratch.js';
import { SOL_LOGS } from './text.js';
import { syncAllVisuals, syncIce, syncPod } from './visuals.js';
import { clamp } from '../core/math.js';
import { localSunEl, sleepTime, sleepToDawn } from './sim.js';
import { closeScreens, toggleScreen } from '../ui/screens.js';
import { enterRover, exitRover, roverF } from './rover.js';
import { ITEM_NAMES, gainLoot } from './inventory.js';
import { bagSoilHere } from './fieldwork.js';
import { CROPS, MORALE_WORD, cookDinner, dinnerPlan, foodTotal, harvest, moraleBand, plantable, seedStock, snack, takeSeed } from './farm.js';
import { showChoice } from '../ui/menus.js';
import { R } from '../planet/constants.js';
// Every interaction in the world: farming, Hab stations, vehicles, salvage, building, the MAV.
export function syncPlot(pl) {
  pl.soilMesh.visible = pl.state !== 'empty';
  // a bed shows the plants of the crop it holds: alive and scaled as they grow, or withered
  const shown = plotPlants(pl, pl.crop);
  for (const set of [{ plants: pl.plants, dead: pl.plantsDead }, ...Object.values(pl.crops)]) {
    if (set === shown || (set.plants === shown.plants)) continue;
    set.plants.visible = false;
    if (set.dead) set.dead.visible = false;
  }
  shown.plants.visible = pl.state === 'growing' || pl.state === 'ready';
  if (shown.dead) shown.dead.visible = pl.state === 'dead';
  const k = Math.min(1, 0.25 + pl.growth * 0.75);
  shown.plants.scale.set(k, k, k);
}
export function plantedPlots() { return World.plots.filter(p => p.state === 'growing' || p.state === 'ready').length; }
export function nearestPlot() {
  let best = null, bestD = 2.2;
  for (const pl of World.plots) {
    if (!pl.worldPos) continue;
    const d = groundDist(player.pos, pl.worldPos);
    if (d < bestD) { bestD = d; best = pl; }
  }
  return best;
}
/** Put a crop in a bed of soil. */
function plant(pl, crop) {
  if (pl.state !== 'soil' || seedStock(crop) <= 0 || S.water < BAL.waterPerDose) return;
  takeSeed(crop);
  S.water -= BAL.waterPerDose;
  pl.crop = crop; pl.state = 'growing'; pl.growth = 0.04; pl.watered = 1;
  if (plantedPlots() === 1) log('Planted. Grow, little guy. No pressure, but you\'re the food supply.');
  else if (crop !== 'potato' && !S.flags.plantedOther) { S.flags.plantedOther = true; log(`${CROPS[crop].name} in. The botany kit finally earns its launch mass.`); }
  Snd.play('plant');
  syncPlot(pl);
}
const cropOf = (pl) => CROPS[pl.crop] || CROPS.potato;
addI({
  pos: () => { const pl = nearestPlot(); return pl ? pl.worldPos : null; },
  r: 2.2, hold: 1.3, mode: 'walk',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    const pl = nearestPlot(); if (!pl) return false;
    switch (pl.state) {
      case 'empty': return S.inv.regolith > 0 ? true : 'Needs regolith — dig some outside';
      case 'soil': return plantable().length ? (S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)') : 'Nothing left to plant';
      case 'growing':
        if (pl.watered < cropOf(pl).waterings && pl.growth >= 0.42) return S.water >= BAL.waterPerDose ? true : 'Not enough water (5L)';
        return `${cropOf(pl).name} — ${Math.round(pl.growth * 100)}%`;
      case 'ready': case 'dead': return true;
    }
    return false;
  },
  label: () => {
    const pl = nearestPlot(); if (!pl) return '';
    switch (pl.state) {
      case 'empty': return 'Fill bed with regolith';
      case 'soil': {
        const can = plantable();
        if (can.length > 1) return 'Plant this bed…';
        return `Plant seed potato (1 ${S.potatoes > 0 ? 'potato' : 'ration'}, 5L water)`;
      }
      case 'growing': return `Water the ${cropOf(pl).name.toLowerCase()} (5L)`;
      case 'ready': return `Harvest ${cropOf(pl).name.toLowerCase()}`;
      case 'dead': return 'Clear out the dead crop';
    }
    return '';
  },
  use: () => {
    const pl = nearestPlot(); if (!pl) return;
    switch (pl.state) {
      case 'empty':
        S.inv.regolith--; pl.state = 'soil';
        Snd.play('fillBed');
        break;
      case 'soil': {
        const can = plantable();
        if (can.length > 1) {
          // more than one thing to plant: ask
          showChoice({
            kicker: 'Farm', title: 'What goes in this bed?', note: 'Each bed takes 5 L of water to plant.',
            items: can.map((id) => {
              const c = CROPS[id], n = seedStock(id);
              return { label: c.name, sub: `Ready in ${c.growSols.toFixed(1)} sols · ${c.waterings} watering${c.waterings > 1 ? 's' : ''} · yields ${c.yield}${id === 'potato' ? ' · uses 1 of your food' : ''}`,
                note: c.note, count: `${n} to plant`, fn: () => plant(pl, id) };
            }),
          });
        } else plant(pl, can[0] || 'potato');
        break;
      }
      case 'growing':
        S.water -= BAL.waterPerDose; pl.watered++;
        Snd.play('water');
        break;
      case 'ready': {
        const crop = CROPS[pl.crop] ? pl.crop : 'potato';
        const first = crop === 'potato' ? S.stats.potatoes === 0 : !(S.stats.produce > 0);
        pl.state = 'soil'; pl.growth = 0; pl.watered = 0;
        const n = harvest(crop);
        Snd.play('harvest'); Snd.jingle();
        if (crop === 'potato') { if (first) log('First harvest. I am the greatest botanist on this planet. Fear me.'); }
        else {
          toast('HARVEST', `${n} ${CROPS[crop].name.toLowerCase()}`, 'In the pantry: on the plate at breakfast, or cook a dinner at the food shelf');
          if (first) log('Something that is not a potato. I may cry. I am not going to cry. I am going to eat it.');
        }
        checkAchievements();
        break;
      }
      case 'dead':
        pl.state = 'soil'; pl.growth = 0; pl.watered = 0;
        Snd.play('clearBed');
        break;
    }
    syncPlot(pl);
  },
});

// ============================================================
// 18. WORLD INTERACTABLES
// ============================================================
// cold open: seal the suit at the hab door
addI({
  pos: () => siteLocalToWorld(World.hab, 0, 0, HAB_R + 1.6, _v2),
  r: 3.4, hold: 2.2, mode: 'walk',
  visible: () => S.flags.coldOpen,
  label: () => 'Pull the antenna. Seal the suit.',
  use: () => {
    S.flags.coldOpen = false;
    S.flags.suitSealed = true;
    S.suit = suitCap();
    S.shake = 1.2;
    flashScreen('rgba(255,60,40,0.35)', 350);
    Snd.play('suitSeal');
    setTimeout(() => log('Suit resealed. O2 refilling. Ow. OW. Okay. Inventory time.', 'sys'), 300);
    setTimeout(() => log(SOL_LOGS[1]), 1000);
  },
});
export function addInspect(id, lx, lz, name, doneLine) {
  addI({
    pos: () => siteLocalToWorld(World.hab, lx, 0, lz, _v2),
    r: 2.6, hold: 0.7, mode: 'walk', pose: 'stand',
    visible: () => S.started && !S.flags.coldOpen && !S.checkedSystems[id],
    label: () => `Inspect the ${name}`,
    use: () => { S.checkedSystems[id] = true; Snd.ok(); log(doneLine); },
  });
}
addInspect('oxy', 5.6, -3.6, 'oxygenator',
  'Oxygenator: alive. It eats CO2 and power, makes air. My favorite roommate.');
addInspect('rec', 5.9, -0.4, 'water reclaimer',
  'Water reclaimer: functional. Yes, it recycles what you think it recycles. No, we don\'t discuss it.');
// NOTE: world arrays (panels, piles, landers, ice) fill AFTER world build —
// these interactables resolve their nearest target dynamically at query time.
export function nearestOf(list, posOf, maxD, filter) {
  let best = null, bestD = maxD;
  for (const item of list) {
    if (filter && !filter(item)) continue;
    const d = groundDist(player.pos, posOf(item));
    if (d < bestD) { bestD = d; best = item; }
  }
  return best;
}
// solar panels
export function panelPos(p) {
  return _v3.copy(p.group.position).applyQuaternion(World.solarGroup.quaternion).add(World.solarGroup.position);
}
addI({
  pos: () => {
    const p = nearestOf(World.panels, panelPos, 3.0);
    return p ? panelPos(World._activePanel = p) : null;
  },
  r: 3.0, hold: 1.6, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen,
  enabled: () => World._activePanel && World._activePanel.dust > 0.06 ? true : 'Panel is clean',
  label: () => `Wipe solar panel (${Math.round((1 - (World._activePanel ? World._activePanel.dust : 0)) * 100)}% output)`,
  use: () => {
    const p = World._activePanel;
    if (!p) return;
    p.dust = 0;
    S.stats.panels++;
    syncAllVisuals();
    Snd.play('wipe');
    if (S.stats.panels === 1) log('Wiped a panel. Immediately covered in dust myself. The circle of Mars.');
  },
});
// regolith piles (fast) + dig-anywhere (slow, lowest priority)
addI({
  pos: () => {
    const sp = nearestOf(World.soilPiles, s => s.group.position, 2.8, s => s.left > 0);
    return sp ? (World._activePile = sp).group.position : null;
  },
  r: 2.8, hold: 1.4, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => 'Dig regolith (+1)',
  use: () => {
    const sp = World._activePile;
    if (!sp || sp.left <= 0) return;
    sp.left--; S.inv.regolith++;
    syncAllVisuals();
    Snd.play('dig');
  },
});
addI({
  pos: () => player.pos, r: 99, hold: 2.6, mode: 'walk', priority: 9,
  visible: () => !S.flags.coldOpen && !S.inside && S.flags.didMath,
  label: () => 'Dig regolith (+1, slow going here)',
  use: () => { S.inv.regolith++; Snd.play('dig'); bagSoilHere(); },
});
// hydrazine rig
addI({
  pos: () => siteLocalToWorld(World.hab, 5.5, 0, 2.6, _v2),
  r: 2.4, hold: 2.0, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => S.hydrazine > 0 ? true : 'Hydrazine tank is empty',
  label: () => `Burn hydrazine for water (+${BAL.hydrazineWater}L) — ${S.hydrazine} left`,
  use: () => {
    S.hydrazine--;
    S.water = clamp(S.water + BAL.hydrazineWater, 0, BAL.waterMax);
    World.hydFlame.visible = true;
    Snd.play('hydrazine');
    setTimeout(() => { World.hydFlame.visible = false; }, 2600);
    if (!S.flags.hydrazineBoom) {
      S.flags.hydrazineBoom = true;
      S.stats.booms++;
      setTimeout(() => {
        S.shake = 1.6;
        S.o2 = clamp(S.o2 - 7, 0, 100);
        flashScreen('rgba(255,180,80,0.75)', 500);
        Snd.play('hydrazineBoom');
        log('So. Small fireball. It ate 7% of the Hab\'s air and both my eyebrows. Water: acquired. Science!');
      }, 1200);
      log('Burning rocket fuel indoors. What could possibly go wrong?');
    } else {
      S.stats.booms++;
      Snd.ok();
      log(`+${BAL.hydrazineWater}L water. Eyebrow count stable. Progress.`);
      checkAchievements();
    }
  },
});
// bunk
addI({
  pos: () => siteLocalToWorld(World.hab, -5.0, 0, -4.9, _v2),
  r: 2.3, hold: 1.2, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside,
  enabled: () => {
    if (S.breach.active) return 'Seal the breach first: the far wall, behind the comms desk';
    return sleepTime();
  },
  label: () => 'Sleep until dawn',
  use: () => sleepToDawn(false),
});
// the food shelf: eat something now, or cook a proper dinner when the pantry allows one
const SNACK = { potato: 'potato. Again.', ration: 'ration', soy: 'bowl of soybeans', radish: 'radish', lettuce: 'handful of lettuce', tomato: 'tomato' };
const nextSnack = () => (S.potatoes > 0 ? 'potato' : ['soy', 'radish', 'lettuce', 'tomato'].find((id) => S.pantry && S.pantry[id] > 0) || (S.food > 0 ? 'ration' : null));
addI({
  pos: () => siteLocalToWorld(World.hab, 4.2, 0, 4.8, _v2),
  r: 2.2, hold: 0.8, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside && !dinnerPlan().ok,
  enabled: () => S.health > 92 ? 'Not hungry right now' : foodTotal() > 0 ? true : 'The shelf is bare',
  label: () => `Eat a ${SNACK[nextSnack()] || 'ration'} (+12 vitals)`,
  // once there is produce, say what a cooked dinner still wants
  sub: () => (S.stats.produce > 0 ? `Dinner: ${dinnerPlan().why.toLowerCase()}` : ''),
  use: () => {
    if (!snack()) return;
    S.health = clamp(S.health + 12, 0, BAL.healthMax);
    Snd.play('eat');
  },
});
addI({
  pos: () => siteLocalToWorld(World.hab, 4.2, 0, 4.8, _v2),
  r: 2.2, hold: 2.4, mode: 'walk', pose: 'stand', priority: -1,
  visible: () => !S.flags.coldOpen && S.inside && dinnerPlan().ok,
  label: () => { const p = dinnerPlan(); return `Cook dinner: ${p.staple === 'soy' ? 'soybeans' : 'potato'}, ${p.sides.map((id) => CROPS[id].name.toLowerCase()).join(' and ')}`; },
  sub: () => '+25 vitals, lifts morale',
  use: () => {
    const line = cookDinner();
    if (!line) return;
    Snd.play('eat'); Snd.jingle();
    toast('DINNER', 'A cooked meal', `Morale ${Math.round(S.morale)} · ${MORALE_WORD[moraleBand()]}`);
    log(line);
    checkAchievements();
  },
});
// comms desk: the math, NASA chatter, disco
addI({
  pos: () => siteLocalToWorld(World.hab, 0, 0, -6.6, _v2),
  r: 2.4, hold: 0.8, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside && !S.flags.didMath,
  label: () => 'Run the numbers',
  use: () => {
    S.flags.didMath = true;
    Snd.play('terminal');
    log(`${S.food} rations. Rescue window: Sol ${S.rescueSol}. The numbers say: farm or starve. I'm going to have to science the sh*t out of this.`);
    // the premise of the whole game: a card he reads and puts down, not a line that scrolls away
    showOverlay({
      kicker: 'The numbers', title: 'Farm or starve',
      stats: [['Rations left', S.food], ['Earliest rescue', `Sol ${S.rescueSol}`], ['Sols with nothing to eat', Math.max(0, S.rescueSol - 1 - S.food)]],
      // (short enough to show whole, with its button, on a phone held sideways)
      body: 'One ration a sol. They run out long before anyone can reach Mars.\n\n' +
        'The Hab has six farm beds: fill them with soil from the heaps outside, plant, water, and eat what grows. A potato bed costs one ration to plant.\n\n' +
        'Top left, the six bars that keep you alive (tap or pause to see what each one is). Top right, what to do next and why.',
      buttons: [{ label: 'Get to work' }],
    });
  },
});
addI({
  pos: () => siteLocalToWorld(World.hab, -0.9, 0, -6.4, _v2),
  r: 2.2, hold: 0.8, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => 'Message NASA',
  use: () => {
    const lines = [
      'Please tell Commander Lewis her taste in music is a war crime. — M.W.',
      'Status: alive. Potatoes: thriving. Dignity: pending. — M.W.',
      'NASA says the whole world is watching. Waved at the sky. Felt weird. Did it again.',
      'Asked NASA for pizza. Received an orbital mechanics refresher. Same thing, apparently.',
      'NASA reminds me everything I type is broadcast live to Earth. So. Hi, Mom.',
    ];
    Snd.play('nasaSend');
    log(lines[(S.flags.nasaMsg = (S.flags.nasaMsg + 1)) % lines.length], 'nasa');
  },
});
addI({
  pos: () => siteLocalToWorld(World.hab, 0.9, 0, -6.4, _v2),
  r: 2.2, hold: 0.6, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside && S.pf.connected,
  label: () => S.disco ? 'Mercifully stop the disco' : "Play Lewis's disco playlist",
  use: () => {
    S.disco = !S.disco;
    Snd.disco(S.disco);
    log(S.disco ? 'Disco: ON. I hate it. ...It\'s growing on me. I hate that more.' : 'Disco: OFF. Blessed silence.');
  },
});
// workbench — opens the colony screen
addI({
  pos: () => siteLocalToWorld(World.hab, -4.75, 0, 4.2, _v2),          // at the fabricator bench
  r: 2.4, hold: 0.5, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && S.inside,
  label: () => 'Use the fabricator [C]',
  use: () => toggleScreen('colony'),
});
// rover enter + exit + camp
addI({
  pos: () => World.rover.group.position,
  r: 3.8, hold: 0.6, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen,
  label: () => 'Drive the rover',
  sub: () => `Power ${Math.round(S.roverPower)}/${roverPowerCap()} · O2 tank ${Math.round(S.roverO2)}`,
  use: () => enterRover(),
});
addI({
  pos: () => World.rover.group.position, r: 1e9, hold: 0.4, mode: 'rover',
  visible: () => Math.abs(roverF.speed) < 1.5 && localSunEl() >= 0.05,
  label: () => 'Step out',
  use: () => exitRover(),
});
addI({
  pos: () => World.rover.group.position, r: 1e9, hold: 2.2, mode: 'rover',
  visible: () => Math.abs(roverF.speed) < 1.5 && localSunEl() < 0.05 && sleepTime() === true,
  label: () => 'Camp in the rover until dawn',
  sub: () => 'press F to step out instead',
  use: () => sleepToDawn(true),
});
// pathfinder pickup + uplink connect
addI({
  pos: () => World.pathfinder.position,
  r: 5.5, hold: 2.6, mode: 'walk',
  visible: () => S.flags.pfRevealed && !S.pf.loaded && !S.pf.connected,
  enabled: () => groundDist(World.rover.group.position, World.pathfinder.position) < 20 ? true : 'Too heavy to carry — bring the rover closer',
  label: () => 'Dig out Pathfinder and load it up',
  use: () => {
    S.pf.loaded = true;
    S.pf.found = true;
    World.pfCollider.r = 0.001;
    syncAllVisuals();
    Snd.jingle();
    log('Hello, little guy. You\'ve been dead since 1997. Let\'s fix that. Next stop: home.');
  },
});
addI({
  pos: () => World.uplink.position,
  r: 5.0, hold: 2.6, mode: 'walk', pose: 'stand',
  visible: () => S.pf.loaded && !S.pf.connected,
  enabled: () => groundDist(World.rover.group.position, World.uplinkRing.position) < 9 ? true : 'Park the rover on the marked ring first',
  label: () => 'Connect Pathfinder to the uplink',
  use: () => connectPathfinder(),
});
// landers: salvage + quest hooks (dynamic — landers exist only after world build)
export const LANDER_CIRCUITS = { 'Spirit': 3, 'Beagle 2': 1, 'InSight': 2, 'Curiosity': 1, 'Zhurong': 1, 'Opportunity': 2 };
addI({
  pos: () => {
    const rec = nearestOf(World.landers, l => l.group.position, 5.0,
      l => l.data.name !== 'Pathfinder' && !S.salvaged[l.data.name]);
    return rec ? (World._activeLander = rec).group.position : null;
  },
  r: 5.0, hold: 2.4, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen,
  label: () => World._activeLander ? `Salvage ${World._activeLander.data.name} (${World._activeLander.data.year})` : '',
  use: () => {
    const rec = World._activeLander;
    if (!rec || S.salvaged[rec.data.name]) return;
    S.salvaged[rec.data.name] = true;
    Snd.play('salvage');
    const loot = { scrap: rec.data.scrap };
    if (LANDER_CIRCUITS[rec.data.name]) loot.circuit = LANDER_CIRCUITS[rec.data.name];
    const got = gainLoot(loot);
    log(`Salvaged ${rec.data.name}: ${got}. ${rec.data.note}`, 'disc');
    discover(rec.data.name, rec.data.note, true);
    onQuestEvent('salvage', rec.data.name);
    checkAchievements();
  },
});
// ice deposits (dynamic)
addI({
  pos: () => {
    const site = nearestOf(World.iceSites, s => s.group.position, 4.5, s => s.left > 0);
    return site ? (World._activeIce = site).group.position : null;
  },
  r: 4.5, hold: 1.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  enabled: () => S.upgrades.drill ? true : 'Needs the Ice Drill upgrade',
  label: () => `Mine water ice (+1, ${World._activeIce ? World._activeIce.left : 0} left)`,
  use: () => {
    const site = World._activeIce;
    if (!site || site.left <= 0) return;
    site.left--; S.inv.ice++; S.stats.mined++;
    syncIce(site);
    Snd.play('drill');
    checkAchievements();
  },
});
// debris & supply pods
addI({
  pos: () => {
    let best = null, bestD = 4.5;
    for (const p of World.pods) {
      if (p.taken) continue;
      const d = groundDist(player.pos, p.group.position);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best ? (World._activePod = best).group.position : null;
  },
  r: 4.5, hold: 1.6, mode: 'walk',
  visible: () => !S.flags.coldOpen,
  label: () => World._activePod ? World._activePod.label : '',
  use: () => {
    const p = World._activePod;
    if (!p || p.taken) return;
    p.taken = true;
    syncPod(p);
    Snd.play(p.kind === 'pod' ? 'podOpen' : 'salvage');
    const got = gainLoot(p.loot);
    log(`Recovered: ${got}.`);
    if (p.blueprint) { S.blueprints[p.blueprint] = true; log(`NASA attached schematics: ${p.blueprint.toUpperCase()} blueprint unlocked.`, 'nasa'); }
  },
});
// the buried RTG
addI({
  pos: () => World.rtgSite.group.position,
  r: 4.0, hold: 3.0, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen && !World.rtgSite.taken && S.flags.didMath,
  label: () => 'Dig up the RTG (radioactive. cozy.)',
  use: () => {
    World.rtgSite.taken = true;
    syncAllVisuals();
    S.flags.hasRtg = true;
    Snd.play('rtg');
    log('One RTG: a plutonium space-heater NASA buried out of an abundance of caution. I am strapping it to my life. Socket it at the fabricator.');
  },
});
// breach patch
addI({
  pos: () => siteLocalToWorld(World.hab, 0, 0, -HAB_R + 1.2, _v2),
  // an emergency outranks the desk in front of it (the comms prompts used to win on distance,
  // which left the breach impossible to seal once Pathfinder was connected)
  r: 3.6, hold: 3.0, mode: 'walk', pose: 'stand', priority: -1,
  visible: () => S.breach.active && S.inside,
  label: () => 'Seal the breach (canvas, tape, prayer)',
  use: () => {
    S.breach.active = false;
    S.breach.done = true;
    Snd.alarm(false);
    Snd.play('sealBreach');
    S.shake = 0.5;
    syncAllVisuals();
    log(S.breach.cropsKilled ?
      'Sealed. Too late for the crops. The Hab and I are no longer on speaking terms.' :
      'Breach sealed. Crops: alive. Heart rate: unpublishable. Duct tape: undefeated.');
  },
});
// deployed O2 caches
addI({
  pos: () => {
    let best = null, bestD = 3.5;
    for (const b of World.builtMeshes) {
      if (b.kind !== 'cache' || b.charges <= 0) continue;
      const d = groundDist(player.pos, b.group.position);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best ? (World._activeCache = best).group.position : null;
  },
  r: 3.5, hold: 1.0, mode: 'walk', pose: 'stand',
  visible: () => !S.flags.coldOpen,
  enabled: () => S.suit < suitCap() - 5 ? true : 'Suit is full',
  label: () => `Refill suit O2 (${World._activeCache ? World._activeCache.charges : 0} charges left)`,
  use: () => {
    const c = World._activeCache;
    if (!c || c.charges <= 0) return;
    c.charges--;
    S.suit = clamp(S.suit + 40, 0, suitCap());
    Snd.play('o2Refill');
  },
});
// kit deployment
export let deployKind = null;
export function startDeploy(kind) {
  deployKind = kind;
  closeScreens();
  log('Pick a spot outside and place it.', 'sys');
}
addI({
  pos: () => player.pos, r: 99, hold: 1.6, mode: 'walk', priority: 2,
  visible: () => !!deployKind && !S.inside,
  label: () => `Place the ${ITEM_NAMES['kit' + deployKind.charAt(0).toUpperCase() + deployKind.slice(1)] || deployKind} here`,
  use: () => {
    const kitKey = 'kit' + deployKind.charAt(0).toUpperCase() + deployKind.slice(1);
    if ((S.inv[kitKey] || 0) <= 0) { deployKind = null; return; }
    S.inv[kitKey]--;
    // set it down in front of the astronaut with its front (the greenhouse door) toward him
    const kind = deployKind;
    _v1.copy(player.pos).normalize();
    _v2.set(0, 0, -1).applyQuaternion(player.q);
    _v1.addScaledVector(_v2, (kind === 'greenhouse' ? 6.4 : 2.6) / R).normalize();
    tangentBasis(_v1, _fe, _fn);
    buildDeployable(kind, _v1, Math.atan2(_v2.dot(_fe), _v2.dot(_fn)));
    Snd.play('deploy');
    log(`${ITEM_NAMES[kitKey]} deployed. Mars: 0, engineering: 1.`);
    syncAllVisuals();
    onQuestEvent('deploy', deployKind);
    deployKind = null;
    checkAchievements();
  },
});
// MAV: strip + launch
addI({
  pos: () => World.mav.position,
  r: 8.0, hold: 3.0, mode: 'walk', pose: 'stand',
  visible: () => S.flags.mavRevealed && !S.flags.mavStripped,
  enabled: () => S.sol >= S.rescueSol ? true : `Launch window opens Sol ${S.rescueSol} — NASA was firm about this`,
  label: () => 'Strip excess weight (nose cone, seats, dignity)',
  use: () => {
    S.flags.mavStripped = true;
    if (World.mavNose) World.mavNose.visible = false;
    Snd.play('salvage');
    log('Removed the nose cone. NASA says the tarp will hold. NASA is lying, and we both know it.');
  },
});
addI({
  pos: () => World.mav.position,
  r: 8.0, hold: 1.6, mode: 'walk', pose: 'stand',
  visible: () => S.flags.mavStripped && !S.won,
  label: () => 'Climb in. Go home.',
  use: () => {
    showOverlay({
      title: 'LAUNCH?',
      body: 'The MAV is a convertible now. The numbers say Hermes can catch you.\nThe numbers have been wrong before.\n\nNo coming back. The potatoes forgive you.',
      buttons: [
        { label: 'PUNCH IT', fn: () => startLaunch() },
        { label: 'Not yet', ghost: true, fn: () => {} },
      ],
    });
  },
});
