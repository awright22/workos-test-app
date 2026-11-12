// Game state and balance. S is the live run; BAL the tuning numbers.
export const DIFFICULTIES = {
  story:    { name: 'BOTANIST',    rescueSol: 20, drain: 0.75, desc: 'Rescue: Sol 20. Forgiving drains,\nstorms always forecast. See Mars, grow spuds.' },
  survival: { name: 'ENGINEER',    rescueSol: 45, drain: 1.0,  desc: 'Rescue: Sol 45. The intended experience.\nProvision your expeditions or die packing.' },
  iron:     { name: 'SPACE PIRATE', rescueSol: 60, drain: 1.15, desc: 'Rescue: Sol 60. Death rewinds nothing —\none life, whole planet, no complaints.' },
};

export const S = {
  started: false, uiOpen: false, over: false, won: false, sleeping: false,
  firstPerson: false,
  mode: 'walk',                    // walk | rover | cutscene
  diff: 'survival', rescueSol: 45, drainMult: 1.0,
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

export const BAL = {
  solLen: 220,
  o2Drain: 22, o2Gen: 42, o2BreachDrain: 210,
  waterMax: 120, waterDrain: 6, waterRecl: 4.5, waterPerDose: 5,
  hydrazineWater: 28, iceWater: 10,
  powerMax: 100, powerBase: 34, solarGen: 118,
  dustRate: 0.05, stormDustRate: 0.7, stormGenMult: 0.14,
  potatoYield: 4, growSols: 2.4, waterings: 2,
  healthMax: 100, starveDrain: 16, suffocateDrain: 10, healRegen: 4, sleepHeal: 10,
  walkSpeed: 5.1, runSpeed: 9.2, jumpV: 3.4, gravity: 3.72,       // Mars gravity; the gait clips are made for these speeds
  suitCap: 100,
  roverO2Cap: 300, roverPowerCap: 100, roverDrainPerMin: 5, roverChargeAtHab: 25,
};
export function suitCap() { return S.upgrades.tank2 ? 200 : S.upgrades.tank1 ? 150 : BAL.suitCap; }
export function roverTopSpeed() { return S.upgrades.drive2 ? 55 : S.upgrades.drive1 ? 45 : 35; }
export function roverPowerCap() { return S.upgrades.roverBattery ? 160 : BAL.roverPowerCap; }
