/*
 * Mail. Once Pathfinder is talking, Earth and the Hermes write back. One exchange arrives
 * at dawn, chosen from those whose moment has come: they answer what the astronaut has actually
 * done (a harvest, a storm sat out, a failed machine, a sample nobody expected), so the planet
 * stops being quite so empty. Messages arrive in the log; nothing needs replying to.
 */
import { S } from './state.js';
import { cheer } from './farm.js';
import { log } from '../ui/dom.js';
import { Snd } from '../audio/sound.js';

const kinds = () => (S.science ? Object.keys(S.science.found).length : 0);
const worst = () => (S.machines ? Math.min(...Object.values(S.machines)) : 100);

/*
 * who: n = Houston, w = the astronaut, or a crew member's name (relayed from the Hermes).
 * `when` decides whether the message can be sent; the first unread one that can, is.
 * Order matters: earlier entries win, so the specific come before the general.
 */
export const MAIL = [
  { id: 'welcome', when: () => true, lines: [
    ['n', 'Morning, Mark. For the record: 3.2 billion people watched you plug in a toaster from 1997 yesterday. Ratings beat the Moon landing.'],
    ['w', 'Tell them the sequel has more potatoes.'] ] },
  { id: 'lewis', when: () => S.sol >= 3, lines: [
    ['Lewis', 'Watney. Commander Lewis. I left you there. I checked your telemetry myself and I left. I will be saying that to you in person, so stay alive long enough to hear it.'],
    ['w', 'Commander: it was the right call, the antenna was a cheap shot, and your music is a war crime. See you soon.'] ] },
  { id: 'breach', when: () => S.breach.done, lines: [
    ['n', 'Engineering has reviewed your Hab canvas repair. They would like it known that duct tape is "not a rated structural material".'],
    ['w', 'Tell Engineering the unrated structural material is holding one atmosphere. I will accept their apology in writing.'] ] },
  { id: 'crops_dead', when: () => S.breach.cropsKilled, lines: [
    ['Beck', 'Mark, Beck. I ran your calories after the breach. You can make it, but you plant again today, not tomorrow. Doctor\'s orders.'],
    ['w', 'Copy, Doc. The potatoes are dead. Long live the potatoes.'] ] },
  { id: 'machine', when: () => worst() < 30, lines: [
    ['n', 'Mark, your telemetry shows equipment running well past its service interval. We built those machines for thirty-one sols. Please stop testing how wrong we were.'],
    ['w', 'It is on the list. The list is long. I am the entire maintenance department.'] ] },
  { id: 'first_harvest', when: () => S.stats.potatoes >= 4, lines: [
    ['Vogel', 'Mark. Vogel. I have told my children a man is growing potatoes on Mars in his own... fertiliser. They are asking very specific questions.'],
    ['w', 'Tell them the truth: science is disgusting and it works.'] ] },
  { id: 'storm', when: () => S.stats.stormOut >= 20, lines: [
    ['Johanssen', 'It\'s Johanssen. I pulled your suit logs. You were OUTSIDE in that storm. On purpose?'],
    ['w', 'Define "purpose". I had panels to wipe. Also I have not felt weather in a while. It was nearly nice.'] ] },
  { id: 'devil', when: () => S.flags.devilSeen, lines: [
    ['n', 'Atmospheric sciences asks whether you could "chase the next dust devil with a pressure sensor".'],
    ['w', 'Tell atmospheric sciences I am not their storm chaser. ...Fine. Next one. If it is on my way.'] ] },
  { id: 'science1', when: () => kinds() >= 3, lines: [
    ['n', 'The geology backroom wants you to know they now refer to you as "the instrument". Affectionately. Keep bagging rocks: every new material is a paper.'],
    ['w', 'I have always wanted to be a line item on a manifest. Tell them the instrument requires coffee.'] ] },
  { id: 'meteorite', when: () => S.science && S.science.found.meteorite, lines: [
    ['n', 'Mark, the iron meteorite. It predates the planet you are standing on. The curator at Johnson cried. Please do not use it as a hammer.'],
    ['w', 'Too late. It is an excellent hammer.'] ] },
  { id: 'hematite', when: () => S.science && S.science.found.hematite, lines: [
    ['n', 'You found the blueberries. The Opportunity team, the ones who are left, gathered in the old control room to watch your analysis come in. Nobody said anything for a while.'],
    ['w', 'Tell them she picked a good spot.'] ] },
  { id: 'lander', when: () => Object.keys(S.salvaged).length >= 1, lines: [
    ['n', 'Legal has asked us to remind you that the hardware you are salvaging is the property of several space agencies.'],
    ['w', 'Maritime law. Mars is international waters and I am, by definition, a pirate. A space pirate.'] ] },
  { id: 'martinez', when: () => S.sol >= 6, lines: [
    ['Martinez', 'Hey buddy. Martinez. I went through your personal locker for the memorial, sorry about that. I found your Chicago Cubs cap. I have been wearing it. It brings the opposite of luck.'],
    ['w', 'That is its entire function. Keep it warm. Fly safe.'] ] },
  { id: 'drive', when: () => S.stats.driven >= 8000, lines: [
    ['n', 'You have now driven further on another world than anyone in history. The record was Opportunity\'s. It took her eleven years.'],
    ['w', 'She did it without a seat heater. She still wins.'] ] },
  { id: 'disco', when: () => S.stats.discoTime >= 60, lines: [
    ['Lewis', 'I am told you have been playing my music. Voluntarily.'],
    ['w', 'It is the only music on the planet, Commander. Stockholm syndrome is a medical condition. I checked with Beck.'] ] },
  { id: 'closecall', when: () => S.stats.closeCalls >= 3, lines: [
    ['Beck', 'Mark, your suit has logged three low-oxygen alarms. I know the candles exist. Carry more of them than you think you need. Then one more.'],
    ['w', 'Understood. I like breathing. It is a hobby of mine.'] ] },
  { id: 'greenhouse', when: () => World_built('greenhouse'), lines: [
    ['n', 'Botany would like the record to show that you have built a second farm. On Mars. From salvage. They are having shirts made.'],
    ['w', 'I want a shirt. Large. I have been on a diet.'] ] },
  { id: 'science2', when: () => kinds() >= 8, lines: [
    ['n', 'Eight materials. Mark, sample return missions were budgeted at nine billion dollars to bring back a tenth of what is in your case.'],
    ['w', 'I accept payment in pizza. One pizza. Delivered. I will wait.'] ] },
  { id: 'halfway', when: () => S.sol >= Math.ceil(S.rescueSol / 2), lines: [
    ['Johanssen', 'Halfway, Mark. I have the intercept burn programmed. I have checked it four hundred times. Martinez says that is too many. Martinez is wrong.'],
    ['w', 'Check it four hundred more. I will be the one in the convertible.'] ] },
  { id: 'hermes', when: () => S.sol >= S.rescueSol - 4, lines: [
    ['Lewis', 'Hermes is inbound. We voted. It was unanimous, it was mutiny, and nobody is sorry. Be at that MAV, Watney.'],
    ['w', 'Commander, I would not miss it for the world. Any world.'] ] },
  { id: 'mav', when: () => S.flags.mavRevealed, lines: [
    ['n', 'The ascent vehicle is fuelled and the window is open. It is a long drive. Service the rover first, take every oxygen candle you own, and Mark: bring the samples.'],
    ['w', 'Rover, candles, rocks. And Greg. Greg is a rock. He is coming.'] ] },
  { id: 'quiet', when: () => S.sol >= 9, lines: [
    ['n', 'Nothing operational today. A school in Ohio asked us to pass this on: "Dear Mr Astronaut, are you lonely?"'],
    ['w', 'Tell Ohio: sometimes. Then the sun comes up over a planet nobody has ever stood on, and I get over it.'] ] },
];
// World is imported lazily: mail must not pull the whole world builder into its own tests
let WorldRef = null;
export function bindWorld(World) { WorldRef = World; }
function World_built(kind) { return !!(WorldRef && WorldRef.builtMeshes.some((b) => b.kind === kind)); }


/** The next exchange whose moment has come, or null. */
export function nextMail() {
  if (!S.pf.connected) return null;
  const read = S.mail || (S.mail = {});
  for (const m of MAIL) {
    if (read[m.id]) continue;
    let ok = false;
    try { ok = !!m.when(); } catch (e) { ok = false; }
    if (ok) return m;
  }
  return null;
}
/** Deliver one exchange into the log (called at dawn). Returns its id, or null if there was none. */
export function deliverMail(delay = 14000) {
  const m = nextMail();
  if (!m) return null;
  S.mail[m.id] = 1;
  cheer(4);                                              // word from home
  let t = delay;
  for (const [who, text] of m.lines) {
    setTimeout(() => {
      if (who === 'w') log(text);
      else { log(who === 'n' ? text : `${who.toUpperCase()}, from the Hermes — ${text}`, 'nasa'); Snd.play('nasaMsg'); }
    }, t);
    t += 5200;
  }
  return m.id;
}
