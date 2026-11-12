// Audio test: render every sound, layer and score state offline and measure it.
//
//   node tools/tests/audio.mjs                 everything (about two minutes)
//   node tools/tests/audio.mjs sfx_ ui         only scenarios whose name or group contains a word
//   node tools/tests/audio.mjs --no-wav        skip writing WAV files
//
// The audio modules are bundled on their own (they do not import the game), loaded into
// headless Chromium and rendered with OfflineAudioContext while Snd.update() is fed the way
// the game loop feeds it. For each scenario we measure peak, RMS, loudness (ITU-R BS.1770),
// DC offset, spectrum and the largest sample-to-sample step, assert the ranges below, print a
// loudness table, and save a WAV and a spectrogram under tools/tests/.cache/audio/ so a
// person can listen and look. tools/tests/audio/page.js holds the scenarios.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '.cache', 'audio');
const args = process.argv.slice(2), words = args.filter((a) => !a.startsWith('--'));
const noWav = args.includes('--no-wav');

const bundle = await build({ entryPoints: [path.join(here, 'audio', 'page.js')], bundle: true, write: false, format: 'iife', target: 'es2020', logLevel: 'warning' });
const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') pageErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push('pageerror: ' + e.message));
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: bundle.outputFiles[0].text });

if (!words.length) await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const all = await page.evaluate(() => window.AT.names());
const todo = all.filter((s) => !words.length || words.some((w) => s.name.includes(w) || s.group === w));
const R = {};                                   // name -> result
const fails = [];
const expect = (ok, what, detail) => { if (!ok) fails.push(what + (detail !== undefined ? '  [' + detail + ']' : '')); };
const f1 = (x) => (x <= -150 ? '   -- ' : x.toFixed(1).padStart(6));
const png = async (file, dataUrl) => writeFile(path.join(out, file), Buffer.from(dataUrl.split(',')[1], 'base64'));

const t0 = Date.now();
const groups = [...new Set(todo.map((s) => s.group))];
for (const group of groups) {
  const names = todo.filter((s) => s.group === group).map((s) => s.name);
  for (const name of names) {
    const r = await page.evaluate((n) => window.AT.run(n), name);
    R[name] = r;
    // spectral bands used by the cross-scenario checks
    if (name.startsWith('wind_') || name.startsWith('amb_')) {
      r.windBand = await page.evaluate((n) => window.AT.band(n, 150, 1500), name);
      r.lowBand = await page.evaluate((n) => window.AT.band(n, 20, 150), name);
    }
    if (name === 'event_launch') {
      r.parts = await page.evaluate((n) => ({ count: window.AT.slice(n, 0.5, 5), burn: window.AT.slice(n, 7, 14), high: window.AT.slice(n, 28, 34), orbit: window.AT.slice(n, 37, 40.3), rescue: window.AT.slice(n, 41, 50) }), name);
    }
    if (name === 'music_sections') {
      r.windows = await page.evaluate((n) => { const o = []; for (let t = 0; t < 420; t += 10) o.push(window.AT.slice(n, t, t + 10).rmsDb); return o; }, name);
    }
    if (!noWav && r.dur <= 200) {
      const parts = [], size = 6_000_000;
      for (let i = 0; ; i++) { const s = await page.evaluate(([n, k, z]) => window.AT.wav(n, k, z), [name, i, size]); parts.push(s); if (s.length < size) break; }
      await writeFile(path.join(out, name + '.wav'), Buffer.from(parts.join(''), 'base64'));
    }
    await png(name + '.png', await page.evaluate((n) => window.AT.sheet([n], 1, 1000, 330), name));
  }
  for (let i = 0; i < names.length; i += 9) {
    await png(`sheet-${group}-${String(i / 9 + 1).padStart(2, '0')}.png`, await page.evaluate((ns) => window.AT.sheet(ns), names.slice(i, i + 9)));
  }
  for (const name of names) await page.evaluate((n) => window.AT.drop(n), name);
}
const unity = await page.evaluate(() => window.AT.unity());
await browser.close();

// ---- the loudness table --------------------------------------------------------------------------
console.log('\nscenario                     sec   peak    rms   LUFS  LUFS-M  centroid  <400Hz  maxstep  nodes(max/end)  voices');
for (const group of groups) {
  console.log(`-- ${group}`);
  for (const s of todo.filter((x) => x.group === group)) {
    const r = R[s.name], m = r.m;
    console.log(`${s.name.padEnd(26)} ${r.dur.toFixed(1).padStart(5)} ${f1(m.peakDb)} ${f1(m.rmsDb)} ${f1(m.lufs)} ${f1(m.momentary)}  ${String(Math.round(m.centroid)).padStart(7)}  ${(m.below400 * 100).toFixed(0).padStart(4)}%  ${m.jump.toFixed(3).padStart(7)}   ${String(r.stats.maxLive).padStart(5)}/${String(r.stats.endLive).padEnd(5)}   ${String(r.stats.maxVoices).padStart(3)}`);
  }
}

// ---- assertions ------------------------------------------------------------------------------------
const has = (n) => !!R[n];
for (const s of todo) {
  const r = R[s.name], m = r.m, n = s.name;
  expect(m.nan === 0, `${n}: no NaN or infinite samples`, m.nan);
  expect(m.peak < 0.99, `${n}: peak stays below full scale`, m.peakDb.toFixed(2) + ' dBFS');
  expect(m.dc < 0.004, `${n}: no DC offset`, m.dc.toFixed(5));
  expect(m.rms > 1e-5, `${n}: is not silent`, m.rmsDb.toFixed(1) + ' dB');
  if (!r.from) expect(m.head < 0.02, `${n}: starts from silence (no click)`, m.head.toFixed(4));
  if (s.group === 'sfx' || s.group === 'ui') expect(m.tail < 0.004, `${n}: has died away by the end (no cut-off tail)`, m.tail.toFixed(4));
  if (s.group === 'ui') {
    expect(m.active < 1.5, `${n}: interface sounds are short`, m.active.toFixed(2) + ' s');
    expect(m.peakDb < -15, `${n}: interface sounds are never the loudest thing`, m.peakDb.toFixed(1) + ' dBFS');
  }
}
if (!words.length) {
  const g = (n) => R[n].m;
  // Mars wind: quiet, low and soft when calm; clearly louder and brighter in a storm
  expect(g('wind_calm').below400 > 0.8, 'calm wind is concentrated below 400 Hz', (g('wind_calm').below400 * 100).toFixed(0) + '%');
  expect(g('wind_calm').centroid < 320, 'calm wind has a low spectral centroid', Math.round(g('wind_calm').centroid) + ' Hz');
  expect(g('wind_calm').lufs < -34, 'calm wind is quiet', g('wind_calm').lufs.toFixed(1) + ' LUFS');
  expect(g('wind_calm').jump < 0.02, 'calm wind has no clicks or zipper noise', g('wind_calm').jump.toFixed(4));
  expect(g('wind_storm').lufs > g('wind_calm').lufs + 12, 'the storm is clearly louder than calm', (g('wind_storm').lufs - g('wind_calm').lufs).toFixed(1) + ' LU');
  expect(g('wind_storm').centroid > g('wind_calm').centroid * 2, 'the storm is clearly brighter than calm', Math.round(g('wind_storm').centroid) + ' Hz');
  expect(g('amb_calm_night').lufs < g('amb_calm_day').lufs - 5, 'a calm night is near silence', g('amb_calm_night').lufs.toFixed(1) + ' LUFS');
  expect(R.wind_storm_hab.windBand < R.wind_storm.windBand - 20, 'inside the Hab the wind band is far lower than outside', (R.wind_storm.windBand - R.wind_storm_hab.windBand).toFixed(1) + ' dB lower');
  expect(g('amb_hab_nopower').lufs < g('amb_hab').lufs - 6, 'the Hab falls quiet when the power is out', (g('amb_hab').lufs - g('amb_hab_nopower').lufs).toFixed(1) + ' LU');
  // the suit
  expect(g('suit_low_o2').lufs > g('suit_rest').lufs + 4, 'low oxygen makes the suit sounds clearly louder', (g('suit_low_o2').lufs - g('suit_rest').lufs).toFixed(1) + ' LU');
  expect(g('suit_critical').lufs > g('suit_low_o2').lufs, 'critical oxygen is louder again');
  expect(g('suit_critical').peakDb < -9, 'the oxygen warning is alarming, not unbearable', g('suit_critical').peakDb.toFixed(1) + ' dBFS');
  // movement
  expect(g('move_sprint').lufs > g('move_walk').lufs + 1.5, 'sprinting is louder than walking');
  expect(g('steps_only_hab').centroid > g('steps_only_regolith').centroid * 1.4, 'steps on the Hab floor are brighter than on regolith',
    Math.round(g('steps_only_regolith').centroid) + ' vs ' + Math.round(g('steps_only_hab').centroid) + ' Hz');
  // the rover
  expect(g('rover_15').lufs > g('rover_5').lufs + 2 && g('rover_35').lufs > g('rover_15').lufs, 'the rover gets louder with speed');
  expect(g('rover_35').centroid > g('rover_5').centroid, 'the rover gets brighter with speed');
  expect(g('rover_rough').lufs > g('rover_15').lufs, 'rough ground adds to the rover');
  // the launch: roar, thinning, silence, rescue
  const L = R.event_launch.parts;
  expect(L.burn.lufs > -22, 'the launch roars', L.burn.lufs.toFixed(1) + ' LUFS');
  expect(L.high.lufs < L.burn.lufs - 10 && L.high.centroid < L.burn.centroid, 'the roar thins out with altitude', `${L.high.lufs.toFixed(1)} LUFS, ${Math.round(L.high.centroid)} Hz`);
  expect(L.orbit.lufs < L.burn.lufs - 24 && L.orbit.below400 < 0.5, 'orbit is silent but for the astronaut\'s own breath', `${L.orbit.lufs.toFixed(1)} LUFS, ${(L.orbit.below400 * 100).toFixed(0)}% below 400 Hz`);
  expect(L.rescue.lufs > -32, 'the rescue theme plays', L.rescue.lufs.toFixed(1) + ' LUFS');
  // the mix: ambience well under effects, score under both
  const mean = (ns) => ns.reduce((a, n) => a + (g(n).lufs > -150 ? g(n).lufs : g(n).momentary), 0) / ns.length;
  const fx = todo.filter((s) => s.group === 'sfx').map((s) => g(s.name).momentary).sort((a, b) => a - b);
  const fxMedian = fx[Math.floor(fx.length / 2)];
  const ui = todo.filter((s) => s.group === 'ui').map((s) => g(s.name).momentary);
  const uiMean = ui.reduce((a, b) => a + b, 0) / ui.length;
  const bed = mean(['amb_calm_day', 'amb_hab', 'amb_rover_parked']), score = mean(['music_day', 'music_night', 'music_hab', 'music_drive']);
  console.log(`\nmix balance:  effects (median one-shot, loudest 400 ms) ${fxMedian.toFixed(1)}   interface ${uiMean.toFixed(1)}   ambience beds ${bed.toFixed(1)}   score ${score.toFixed(1)}   storm ${g('amb_storm').lufs.toFixed(1)}  LUFS`);
  expect(bed < fxMedian - 8, 'ambience sits well under the effects', (fxMedian - bed).toFixed(1) + ' LU');
  expect(score < bed, 'the score sits under the ambience', (bed - score).toFixed(1) + ' LU');
  expect(uiMean < fxMedian, 'the interface is quieter than the effects');
  expect(g('mix_worst_case').peak < 0.99, 'everything at once still does not clip', g('mix_worst_case').peakDb.toFixed(2) + ' dBFS');
  // the score rests: over seven minutes it must be silent some of the time and sounding some of the time
  const w = R.music_sections.windows, quiet = w.filter((d) => d < -70).length, sounding = w.filter((d) => d > -55).length;
  console.log(`score over 7 minutes: sounding in ${sounding} of ${w.length} ten-second windows, silent in ${quiet}`);
  expect(quiet >= 4 && sounding >= 8, 'the score both plays and rests', `${sounding} sounding, ${quiet} silent`);
  // steady layers must not leak nodes, and the steady graph must stay small
  for (const n of ['amb_calm_day', 'amb_hab', 'mix_walk_day', 'rover_15', 'music_day', 'mix_storm_walk']) {
    expect(R[n].stats.maxLive < 170, `${n}: the live graph stays small`, R[n].stats.maxLive + ' nodes');
  }
  expect(R.mix_worst_case.stats.maxVoices <= 40, 'voices are limited under load', R.mix_worst_case.stats.maxVoices);
  expect(Math.abs(unity) < 0.5, 'quiet signals pass the limiter at unity gain', unity.toFixed(2) + ' dB');
}
expect(pageErrors.length === 0, 'no console errors or warnings', pageErrors.slice(0, 3).join(' | '));
void has;

console.log(`\n${todo.length} scenarios rendered in ${((Date.now() - t0) / 1000).toFixed(0)} s; WAVs and spectrograms in ${path.relative(process.cwd(), out)}/`);
if (fails.length) { console.log(`\n${fails.length} FAILED:`); for (const f of fails) console.log('  FAIL ' + f); process.exit(1); }
console.log('All audio checks passed.');
