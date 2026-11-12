// Game state and balance. S is the live run; BAL the tuning numbers.
export const DIFFICULTIES = {
  story:    { name: 'BOTANIST',    rescueSol: 15, drain: 0.75, desc: 'Rescue: Sol 15. Forgiving drains,\nstorms always forecast. See Mars, grow spuds.' },
  survival: { name: 'ENGINEER',    rescueSol: 25, drain: 1.0,  desc: 'Rescue: Sol 25. The intended experience.\nProvision your expeditions or die packing.' },
  iron:     { name: 'SPACE PIRATE', rescueSol: 35, drain: 1.15, desc: 'Rescue: Sol 35. Death rewinds nothing —\none life, whole planet, no complaints.' },
};

export const S = {
  started: false, uiOpen: false, over: false, won: false, sleeping: false,
  firstPerson: false,
  mode: 'walk',                    // walk | rover | cutscene
  diff: 'survival', rescueSol: 25, drainMult: 1.0,
  sol: 1, tod: 0.02,
  o2: 100, water: 42, food: 10, potatoes: 0, power: 72, health: 100, suit: 46,
  roverPower: 100, roverO2: 300,
  hydrazine: 3,
  inv: { scrap: 0, circuit: 0, regolith: 0, ice: 0, candle: 0,
         kitSolar: 0, kitGreenhouse: 0, kitBeacon: 0, kitCache: 0 },
  upgrades: {},                    // drive1, drive2, tank1, tank2, recycler, insulation, wiper, drill, roverBattery, rtg
  blueprints: { drill: false, drive2: false, tank2: false, recycler: false },
  inside: false,
  storm: { i: 0, cells: [] },
  breach: { active: false, done: false, cropsKilled: false, timer: 0 },
  pf: { found: false, loaded: false, connected: false },
  disco: false,
  discovered: {}, salvaged: {}, achieved: {},
  quests: {},                      // id -> 'offered' | 'active' | 'done'
  checkedSystems: {},
  flags: { coldOpen: true, suitSealed: false, didMath: false, hydrazineBoom: false,
           pfRevealed: false, mavRevealed: false, mavStripped: false, nasaMsg: 0, routePods: false },
  stats: { potatoes: 0, panels: 0, walked: 0, driven: 0, closeCalls: 0, booms: 0, mined: 0,
           crafted: 0, discoveries: 0, discoTime: 0, stormOut: 0 },
  holdT: 0, shake: 0, dead: null,
};

/** Rescue sols before sols were lengthened (saves made then are converted on load). */
export const OLD_RESCUE_SOL = { story: 20, survival: 45, iron: 60 };

export const BAL = {
  // A sol is eight minutes: long enough for a dawn to be watched and a day's work to be planned.
  // (It was 220 s, with rescue on Sol 45; the mission is about as long as before in real time.)
  solLen: 480,
  o2Drain: 22, o2Gen: 42, o2BreachDrain: 210,
  waterMax: 120, waterDrain: 6, waterRecl: 4.5, waterPerDose: 5,
  hydrazineWater: 28, iceWater: 10,
  powerMax: 100, powerBase: 34, solarGen: 118,
  dustRate: 0.08, stormDustRate: 0.7, stormGenMult: 0.14,
  potatoYield: 4, growSols: 2.4, waterings: 2,
  healthMax: 100, starveDrain: 16, suffocateDrain: 10, healRegen: 4, sleepHeal: 10,
  walkSpeed: 5.1, runSpeed: 9.2, jumpV: 3.4, gravity: 3.72,       // Mars gravity; the gait clips are made for these speeds
  suitCap: 100,
  // suit oxygen per second: a full standard tank is about six minutes on foot, four at a run
  suitWalk: 0.28, suitRun: 0.44, suitRest: 0.155, suitIndoors: 0.14,
  roverO2Cap: 300, roverPowerCap: 100, roverDrainPerMin: 5, roverChargeAtHab: 25,
};
/** How well a machine works at its condition: full above 60%, falling to half at 20%, to nothing at 0. */
export function machineEff(id) {
  const c = S.machines ? S.machines[id] : 100;
  if (c === undefined || c >= 60) return 1;
  return c >= 20 ? 0.55 + 0.45 * (c - 20) / 40 : 0.55 * c / 20;
}
export function suitCap() { return S.upgrades.tank2 ? 200 : S.upgrades.tank1 ? 150 : BAL.suitCap; }
export function roverTopSpeed() { return (S.upgrades.drive2 ? 55 : S.upgrades.drive1 ? 45 : 35) * (0.62 + 0.38 * machineEff('rover')); }
export function roverPowerCap() { return S.upgrades.roverBattery ? 160 : BAL.roverPowerCap; }
