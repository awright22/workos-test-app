# Stranded II — quality bar and open items

This file is the bar the game is held to, what has been measured against it, and what is still
open. A session that changes the game updates it. "Measured" always says how: a number from
headless Chromium with software rendering (SwiftShader) is not a real frame rate.

## Direction from the owner

Said on 12 November, after the fifth review round, in the owner's words:

- "Desktop is a bonus but I think this should be optimized for my iphone (probably landscape?)"
- "you can either play through the books storyline", or "build a base you start basically at the
  beginning of the book but can build a whole mars base (lots more resources things to build etc)":
  "a build-a-base mode where you never get rescued", "sorta like valheim-style game (but no enemies
  I guess)".
- "Finish the storyline mode first though."

What follows from it:

1. **The iPhone in landscape is the target; desktop is a bonus.** Phones start on the "medium"
   preset (they started on "low", so the owner had been seeing a plainer picture than the one being
   reviewed), and step themselves down if they cannot hold the frame rate. Review pictures are taken
   at iPhone size with touch on. A fault on the phone outranks any fault on the desktop.
2. **Story mode is finished first.** It is finished when the picture and interface bars below are
   met on the phone and the owner has played it on the iPhone.
3. **Base mode comes after.** The same opening, no rescue and no end: gather far more kinds of
   resource and build a whole base from them. Not started. Keep story-mode systems (crafting,
   deployables, pads, saves) general enough that a second mode can reuse them.

The owner has since agreed to this being added to the repository's `CLAUDE.md`, and it is there.

## How to check

```
cd tools && npm ci
node build.mjs              # bundle src/ -> game.js, terrain-worker.js, game.css, sw.js
node lint.mjs               # undefined names, bad imports
node tests/run.mjs          # smoke, story arc, saves, science, machines, farm, photo, sights, audio wiring, interface, interface audit
node tests/ui.mjs --size=phone-844x390   # one part of the interface suite alone (keys, play, portrait, or a size)
node tests/ui-audit.mjs     # measures every phone state in the page: text under 11 px, targets under 44 px, clipping
node tests/first-ten.mjs    # the first ten minutes on a phone, as numbered screenshots (--desktop)
node tests/audio.mjs        # 129 offline audio renders measured for loudness and clicks (5 min)
node tests/perf.mjs         # draw calls and triangles per frame against the budgets below
node tests/shots.mjs        # screenshot matrix -> tools/tests/.cache/shots/   (--only a,b for some)
node tests/shots.mjs --phone   # the same at iPhone size, as a phone draws it -> tools/tests/.cache/shots-phone/
node tests/ui-shots.mjs     # every interface state at every size -> tools/tests/.cache/ui/
node serve.mjs              # play at http://127.0.0.1:8765/  (?q=low|medium|high|ultra)
node publish.mjs "what changed"            # build, lint, test, then publish to gh-pages
node publish.mjs --to next "what changed"  # ... into gh-pages/next/, beside the live game
```

The debug hook `window.__MG` (see `src/main.js`) can start a game at any site, teleport, set
the local time and the weather, step the simulation without drawing, and place a free camera
(`photo`) for pictures.

Running these in a cloud session: the browser draws in software, on four cores, inside a
memory limit of 14 GB shared by everything the session starts. One browser at phone size can
hold 4 GB. Three or four at once (a test run, a helper's pictures, another helper's test
run) have filled the limit and had browsers killed. Run one browser at a time, two at most,
and tell helpers the same.

The local server (`tools/serve.mjs`, which every test uses) serves as the published site does:
every reply states its length, and what compresses goes out gzipped with the compressed length
stated. It did neither until the owner's iPhone showed what that hid (see "The owner's iPhone"
under Open items): keep it that way.

One whole run also stood for half an hour on a single step of the interface suite (the first
key press after a new game started from the title), with the browser's four drawing threads
busy throughout and its page not answering. The cause was not found: twenty random starts
and a run of the suite by itself did not repeat it. A call into the page that does not
return in fifteen minutes now fails its test and prints the site and what was being drawn
(`tests/lib.mjs`), so the next time there will be something to go on.

A test that waits a fixed time for the game to react fails on a loaded machine, where one frame
can take a second. Two have been caught so far (the save notice, and the pause when a phone is
turned upright): both now poll for the state they expect. With three browsers running, a whole
run of the suite takes an hour and a half.

## The bar

| Area | Bar | State |
| --- | --- | --- |
| Frame rate | 30 fps or better on the owner's iPhone, in landscape, on the preset a phone starts on ("medium"); 60 fps on a mid-range laptop at "high" is a bonus | **MET on the owner's iPhone, on an older build; to be measured again on the current one.** The owner's report from the diagnostics panel (a 6.7-inch iPhone, 932x430 points at 3x, iOS 18.7, Safari, Apple GPU, WebGL2; preview build `775c4ab5aec2`, "medium"): 60 fps average, 37 fps at the slowest 1%, worst frame 55 ms over 600 frames; 60 draw calls (21 shadow), 322k triangles; no errors. The picture was drawn at a scale of 0.64, a canvas of 1192x550 on a 2796x1290 screen, and that turned out to be a fault, not the price of the frame rate: the governor that trades resolution for frames could step down after one busy second (loading is one) and could step up only if frames came faster than the target, which a 60 Hz screen never shows. It now tries a step up after a few seconds with nothing late and backs off if the step cannot be held (`adaptResolution` in `render/engine.js`; `tests/smoke.mjs` checks the rule). Whether this phone then holds the full "medium" resolution (1491x688) at 60 is for its next report to say. That build is from before the launch, the canyon walls' beds, the larger ripples and the new rocks, which all cost more per pixel: the number that counts is the next one. Open choice, once that is known: a sharper 30 fps mode beside the smooth one. Not measured on a laptop GPU (software rendering here gives 0.4–12 fps, which says nothing) |
| Scene cost | Per frame (`tests/perf.mjs`). "low": 180 draw calls, 340k triangles in the picture, 230k in the shadow passes. "high": 290 / 600k / 400k. These budgets are estimates, not derived from hardware: they exist to catch regressions until a real frame rate is known | Measured (counts, valid on any machine). low: 69–180 calls, 130–251k picture, 47–222k shadow. high: 83–229, 130–389k, 84–266k. "low" outside the Hab sits exactly on its call budget (180): 75 of those calls are shadow passes for the Hab, rover, array and astronaut. "medium", which a phone now starts on, lies between the two and is not measured separately |
| Load | Title screen interactive in under 5 s on a 20 Mbit connection; total download under 14 MB; works offline after first load | 13.54 MB precached (53 files). Headless load to title: 1.2–5.5 s from localhost. Not measured on a phone network. **On the owner's iPhone the published preview did not start at all** until the loader was fixed (it trusted the stated length of a compressed file); whether it now loads there, and how fast, is the owner's to report |
| Console | Zero errors or warnings in a full playthrough | Zero errors in every test and screenshot run |
| Story arc | Every step from the crash to the rescue works | 23/23 scripted checks (`tests/arc.mjs`) |
| Systems | Every system does what it says | Science 16/16, equipment wear 8/8, farm, meals, morale and comforts 8/8, photo mode 9/9, sights, moons and compass 9/9, audio wiring 26/26 |
| Saves | Old saves load or the player is told plainly why not | Format 4. Version-2 and version-3 saves migrate (terrain re-seated, sol count converted to the longer sols) and the player is told (tested). A format-4 save from before the pantry existed loads with a fresh pantry and morale (tested). Unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | Round 7 (iPhone size): **MET** |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | Round 7: **MET** |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | Round 7: NEARLY. Stars, silhouette, lamp pool and headlight cone work; buildings do not light the ground (Q3) |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | Round 7: NEARLY. Visibility collapses and the sun is a dim disc; the dust is smooth ribbons with no grit, and the airlock stays crisp (Q9) |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | Round 7: NEARLY. No artefacts; the cap reads as a snowfield and the outcrop as a toy (Q8) |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | Round 7: **MET**. The launch itself still lacks spectacle (Q1) |
| Models | Every object is a purpose-built model; nothing reads as a primitive | Round 7: NEARLY. Everything built meets the bar (the rocket, the pods, the rover, the landers); rocks, the commonest object, do not (Q4) |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Fourteen clips blended. Idle is a relaxed, asymmetric stand (8 s); he takes his helmet off where there is air; kneeling has clips of its own. The builder's checks find no sliding or sinking foot in any clip. Not yet reviewed in motion |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | Fifth independent review: NEARLY. At every step there is one task with a distance, a compass tag, a world marker and a hold prompt, and most earlier hesitations are answered. Remaining: a pile-up at the moment the suit is sealed (J2), a bare "LOCKED" at the first empty bed (J3), a distance labelled AIRLOCK that looks wrong (J4), and no word on the long-term goal (J16) |
| Interface | Every screen is legible and unclipped at phone sizes under the notch and status bar (the iPhone in landscape is the target); desktop sizes are a bonus; touch has a pause button | Fifth independent review (phone only, incomplete: see the review): 844 wide NEARLY (clean, unclipped, clear of the notch, one product; short on settings controls under 44 px, an 18 px help button, labels under 11 px and a few numbers that read as bugs); 667 wide NEARLY, provisionally (its three broken screens are fixed; its HUD and map were not seen). The suite's audit measures 128 phone states and finds nothing, which the review shows is not the same as nothing to find |
| Sound | Wind, suit, footsteps, rover, Hab, actions, events, and an adaptive score; nothing clips | Synthesised in the browser, no audio files. Measured offline: peaks under -1.4 dBFS with everything at once, calm day about -34 LUFS, storm -18. **Nobody has listened to it**: timbre and musicality are judged only from spectrograms. Calm beds are mostly below 300 Hz and will be faint on a phone speaker |
| Feel | Walking, jumping and driving have weight; the camera never clips through walls or ground | New controllers in. The camera treats the Hab, its airlock and greenhouse domes as rooms from inside and as obstacles from outside. Not yet reviewed in motion |
| Depth | "On par with Stardew Valley or Animal Crossing": many systems that feed each other, and always something worth doing | Survival, five crops with a pantry and cooked dinners, morale, field science with 17 materials and NASA grants, equipment wear, crafting and ten upgrades, four deployables, seven survey tasks, fourteen landers to salvage, dust storms and dust devils, mail from Earth and the Hermes, nine comforts to make for the Hab, photo mode, nineteen achievements. Still thin: things to do with a second greenhouse, anything to do with other people's hardware beyond salvage |

## Independent picture reviews

Each round, a reviewer is given the screenshot matrix and the bar above, not my opinion.

**Round 1** (49 pictures): no picture row met; 17 findings (F1–F17).
**Round 2** (51 pictures, after the work on F1–F17): orbit MET; day, dawn and dusk, night, storm,
models and figure NEARLY; poles and overall NOT MET. "A clear step up ... the best frames
(`hab-dusk`, `storm-sun`, `title`) would pass in a good indie release. As a set it is not at
the bar." Of the round-1 findings it judged F6 (dawn sun) and F10 (title globe) fixed, the
helmet indoors, the soil heap, the uplink dish and the greenhouse door fixed, and the rest
improved but not done, with interior shadows, rover tracks and untouched ground under objects
unchanged.

Round-2 findings, most damaging first, and their state:

| # | Finding (pictures) | Kind | State |
| --- | --- | --- | --- |
| R1 | Terrain artefacts on slopes: a lattice of pale flecks on a canyon wall, sawtooth bands on a far hillside, teeth along strata (`canyon-floor`, `lander-curiosity`, `canyon`) | bug, blocker | fixed in `canyon-floor` (ledges come in two sizes and are laid only where a mesh of that spacing can draw them); strata made uneven and faded with distance. To re-review |
| R2 | Landmarks do not read: Valles Marineris is a striped bank with rounded lobes, Olympus a dune slope (`canyon`, `canyon-floor`, `olympus`) | terrain art | open |
| R3 | Night is lit by raised ambient; a pale haze fills the corners on foot; porch and rover lamps light nothing; the helmet lamp is a flat hard oval (`hab-night`, `night-plain`, `twilight`) | lighting, part bug | corner haze removed (it was the cold-visor tint lifting dark corners); helmet lamp given a gentler falloff. Ambient level and lamp pools still to do |
| R4 | `greenhouse-night`: a blown-out white bloom over the dome; no light spills onto the ground | bug | fixed: glass is no longer mirror-smooth to a lamp a metre away; the dome's lamps now spill onto the ground |
| R5 | Poles are not ice: the cap is white sand with the sand's ripples; the outcrop is two smooth bars (`north-pole`, `ice`) | material | acted on: bluer, glossier ice with frost polygons and no sand ripples. To re-review |
| R6 | Ground detail is two stamps planet-wide: ripples in closed whorls, an even honeycomb of cracks; fades at noon; nearest 2 m soft | art | acted on: ripples laid across the wind without whorls, in patches; frost polygons only from the mid-latitudes to the poles; a finer grain layer in the nearest metres; more light-independent tone. To re-review |
| R7 | Rocks are smooth, rounded, ground-coloured lumps of one size | art | acted on: broken faces, uneven proportions, darker and greyer stone under the dust, a longer tail of large sizes. To re-review |
| R8 | Interiors are flat: no shadows under furniture or the astronaut, untextured colour (`inside-*`) | lighting, part bug | shadows fixed: sealed in, the ceiling's shadow-casting light is now the room's main light. Untextured surfaces remain |
| R9 | Astronaut's shadow: faint and detached at the Hab in the morning, missing at the pole (`hab-morning`, `north-pole`) | bug | not a shadow fault at the pole: the sun was straight behind the camera and his shadow hid behind him (camera turned). A real fault was found and fixed on the way: the cascades were mis-sized whenever the camera's near plane had changed without its projection being rebuilt |
| R10 | Dust is a uniform beige wash on the landers; the Hab, rover, MAV and greenhouse are showroom-clean | art | acted on: dust lies mostly on upward faces and near the ground; less on the old landers, more on the Hab, rover, MAV and deployables; every old lander's cells are dusty. To re-review |
| R11 | Exposure and colour spread: washed-out peach at noon against deep rust elsewhere | grade | acted on: exposure closes down further toward noon. To re-review |
| R12 | At a low sun the ground goes grey and glossy; pale slivers on dark hills (`dawn`, `dusk`) | shader, part bug | acted on: regolith has almost no sheen at grazing angles (ice keeps its glint). Slivers to re-check |
| R13 | Sky featureless; no sun disc on a clear day; sun-side brightening is a vertical curtain | sky | open |
| R14 | Storm dust is thin white hairlines with no body; a straight horizon line crosses the murk (`storm`) | effect, part bug | acted on: the storm sky is now exactly the fog's colour (no horizon line); soft dust-coloured smears instead of hairlines; denser sheets. To re-review |
| R15 | Props: the pod's parachute is faceted and hovers; Pathfinder's airbags read as dirt; a polyhedron lump at the wreck | models | rebuilt: the drogue is one smooth sheet lying on the ground (and pods level their landing spot); Pathfinder's airbags are 21 pale lobes with seams and cords; the wreck's lump is a burst propellant tank; the ice outcrop is fractured blocks. To re-review |
| R16 | Rover tracks are intermittent stamps; no disturbed soil under the Hab, landers, pod or greenhouse | effect | open |
| R17 | Daylight glare blobs at the frame edge (`walk-plain`, `debris-b`) | bug | acted on: metal's roughness floor raised so a facet no longer mirrors the sun into the bloom. To re-check |

**Round 3** (55 pictures, after the work on R1–R17): orbit MET; day, dawn and dusk, night,
storm, models, figure and interiors NEARLY; poles NOT MET; overall NOT MET. "The base in morning
or low light, the title globe and most hardware are within reach of the bar. The world around
them is not." Against round 2 it judged R9 (the astronaut's shadow) fixed at the Hab, most
others improved but not done, and four **unchanged**: R2 (landmarks), R10 (dust: landers one
beige, the player's gear clean), R17 (glare blobs) and the soil half of R16, so the first
attempts at those were too weak to be seen. The night greenhouse was still a white-out.

What round 3 added or sharpened (T-numbers), most damaging first:

| # | Finding (pictures) | State |
| --- | --- | --- |
| T1 | Landmarks do not read: Valles Marineris from above is a striped bank with no rim or drop in frame; Olympus is a rippled dune (`canyon`, `olympus`) | part: bare basalt over more of each flow and ropes nearly twice as deep (after these pictures). No levees, rubble or flow fronts yet; the caldera's dapples and red smear open |
| T2 | Polar ice is matte white cracked plaster with tan shadows; the outcrop is two smooth bars (`north-pole`, `pole-90`, `ice`) | part: the `canyon-rim` picture had been taken at a side gully forty metres wide (kept as `canyon-gully`); from the rim of the main trough at 293 E, six hundred metres across and a hundred and forty deep, it is a great canyon: a hazed far wall in layers, mesas, the floor far below. The air that fills a deep is now the sky's pale, slightly cool haze. The walls close to still have no hard cap rock or talus (`canyon-wall`, `canyon-foot`, `canyon-gully`): open. To be reviewed |
| T3 | Zigzag chevrons in rows on a far hillside (`lander-curiosity`); specks and a scalloped ledge on the canyon wall | acted on: near haze is tinted with the ground's own dust and fades to the sky's colour only far off, so the middle ground no longer jumps to cream (`dawn-light`, `walk-plain`); rock shadows haze by the ground's own rule (they had a fall-off of their own and stayed dark on pale hills); skyline boulders fade (`lander-insight`). To be reviewed |
| T4 | At night the Hab, rover and astronaut look floodlit by ambient; porch and parked-rover lamps make no pool; the greenhouse is a white starburst | mostly acted on: the shell was the soil cap fading toward an open edge under its own lip; the cap now starts underground behind the face and is solid, the stones that stood off it and the frost plates are gone, the blocks have crisp breaks (`ice`, `ice-face`, `ice-plain`); the caps' cracks are thin lines round larger polygons; by night the ice is grey under the stars, not cobalt (`south-pole`). His shadow on ice is left warm (the sky that fills it is butterscotch, not blue). No glint or wind sculpting on the caps: open. To be reviewed |
| T5 | Exposure and colour spread: pale peach at noon and toward the sun, deep rust elsewhere; `day-sun` is beige | acted on: the far camera nearer and tighter (the rocket twice the size, leaving the top of the frame at the cut); the climb shot starts above the rocket looking down its trail over ground that has a broad mottle from the air; the haze along a line of sight is summed exactly (it counted twice the dust from 700 m up); the flame swells and tapers; no disc at the nozzle; the column has no solid foot; round sparks for debris; the cut to Beck at 2.6 s; the tether at his pack; the two face to face with arms about each other; a last shot from behind them with the ship and her open lock ahead. The ship's flat shading close up open. To be reviewed |
| T6 | The nearest metres are a soft blur at high sun | fixed: out of doors the camera now keeps clear of anything that can be walked into (it had backed into a solar kit's frame) |
| T7 | Rocks are one family of flat faceted slabs, near-black in places; few mid-size boulders; one floats (`debris-c`) | acted on: six two-metre cells with nearly straight edges, troughs a hand across and dark, hardly a rim (`lander-phoenix`, `lander-mars-3`). Mars 3's scarp squiggles open. To be reviewed |
| T8 | The storm has no motion or threat; a straight band survives | part: the thrown clods are low and ragged and nearer the ground's colour; lander stains match the ground's hue and are lighter; the dark regions of the survey are graded as grey basalt sand, not deeper red, so Perseverance stands on dark grey-brown ground and not maroon. The wreck's flat-shaded shards open |
| T9 | A row of pale soft discs across the mid-ground (`pod`, `pod-open`) | part: what is turned from the sun keeps more of the sky (0.58 gone, not 0.70), cooler, and more on what faces up, so the shade has form and is not the colour of the dirt (`mav`, `day-sun`); the rim is bounded so it cannot sparkle; the visor shows a glowing horizon and the sun's bloom and spark, not two flat bands. A clean suit and the stance open; his shadow from a high sun is a bulky figure's, left as it is |
| T10 | Nothing touches the ground: no churned soil at the Hab, landers or greenhouse | part: the parked rover's markers put a dim red pool on the ground behind it (`hab-night`). The rest open |
| T11 | The astronaut is pitched forward with bent knees in side views; tilted in one picture | acted on: the idle clip is rewritten from knee angles (knees 5 and 7 degrees, were 13 and 26; elbows 10 and 12, were 22 and 32; hands beside the thighs; trunk 1.6 degrees forward), and the game's own torso correction, which tipped him back, is gone. To re-review |
| T12 | Blown emitters: the nav beacon in daylight, a workbench lamp, glare blobs at the frame edge | part: thin high cloud lies across the day sky; the rover's dust is paler than the ground it rose from; the dark-red patches are the same regrade as T8. Pebbles, the cracked bun, the dot lattice, the mound's facets, the top cap, the tank's furrow open |

Capture mistakes it named: two interior pictures swapped against the manifest, no rim in
`canyon`, a shovel at the edge of `hab-noon`.

Capture gaps the reviewer named: no clear-day picture with the sun in frame, no front view of
the astronaut, nothing at 90° north or at the south cap, and `canyon` no longer stands on a
steep face.

**Round 4** (59 pictures, after the work on T1–T12): **dawn and dusk MET**; day, night, storm,
orbit, models, astronaut and interiors NEARLY; **poles, landmarks, terrain and overall NOT MET.**
"A random frame from the base at dawn or dusk could pass as a polished indie game. A random frame
from Olympus, the canyon floor, the pole or the base at night could not." Of the round-3 list the
reviewer found fixed: the blur at the feet at high sun (T6), the astronaut's stance (T11), the
beacon by day, noon washing to peach, and teeth on the plains and at the base. Improved but not
done: lamp pools at night (the Hab dome, dish and rover are still evenly lit; the greenhouse
still whites out), the storm (streaks read as scratches or rain), the canyon (layered in two of
four views). Unchanged: polar ice as plaster, Olympus not reading as a volcano, one family of
rocks, nothing disturbing the ground. Coverage gaps it named: no rover interior, no launch, no
south pole, no close side or back view of the astronaut.

What round 4 added or sharpened (V-numbers), most damaging first:

| # | Finding (pictures) | State |
| --- | --- | --- |
| V1 | Olympus Mons does not read as a volcano: a bare hillside, a pale hump, a terraced pit that reads as badlands (`olympus`, `olympus-flows`, `olympus-caldera`) | acted on: flows are laid out in metres, so a tongue is the same width at the summit as at the foot (they pinched into ribs); the top of a flow is bare dark basalt and the ground between is dust, so the flank reads as dark tongues on red from any distance; level lava (caldera floors) is dark and cracked into cooling polygons; `olympus-flows` is taken from forty-five metres up. To re-review |
| V2 | Artefacts on steep terrain: a hard vertical seam in the caldera's far wall; stair-step notches down a ridge and a saw-toothed shadow edge; a texture stretched into corduroy on the canyon wall; sand ripples on a near-vertical face; stair-steps where a wall meets a dune (`olympus-caldera`, `canyon-rim`, `canyon-wall`, `canyon-floor`) | acted on: the "seam" was a height step where a mesh that drew the ledges met a coarser one that had melted them (the ledges now keep the slope's mean height, and far off rock is placed by the land's own slope, which every level of detail agrees on); flat-ground textures leave a slope at about forty degrees, and ripples at about thirty (the corduroy and the ripples on cliffs); the ribs were the pinched lava tongues. To re-review |
| V3 | Valles Marineris has no scale or rock character: wavy strata like wood grain on dune-shaped walls, no ledges, spurs or talus, pebbles stuck on vertical faces, the four views do not look like one place, no haze to sell the distance | part done: strata sway less (they read as wood grain), rock shows on gentler slopes, no stones lie on cliffs, and haze with distance is about forty per cent stronger. Ledges, spurs and talus aprons still open |
| V4 | Polar ice is matte chalk-white with tan cracks; the outcrop is polystyrene blocks; pebbles on the cap look like litter (`north-pole`, `pole-90`, `ice`) | acted on: the ice is blue with darker blue in its cracks, dust in broad tan bands and frost only on the highs; stones thin out toward the caps and are almost absent on them; the outcrop's material is bluer and glossier. To re-review |
| V5 | Rocks: one flattened chip, charcoal on orange ground with no dust on top; big boulders show their polygons; a slab stands on end with no contact shadow | acted on: two families at every distance (broken basalt and wind-rounded boulders), a mid-distance shape with four times the triangles for anything big on the screen, no stone near black, dust thick on what faces the sky, none taller than wide, none on cliffs. To re-review |
| V6 | Night at the base: the whole dome evenly pale, the dish and rover readable far from any lamp, the airlock face clipped white, only two portholes glow; the greenhouse starburst (`hab-night`, `greenhouse-night`) | acted on: the flood was the helmet lamp, carried fifty metres at full width: it now reaches twenty-six metres in a narrower beam and is weaker, so white things near it do not burn out; things men built take 40 per cent of the sky's fill at night; porch lamps are less than half as strong; the greenhouse's lamps hardly brighten after dark. To re-review |
| V7 | Almost nothing disturbs the ground: pristine ripples up to the airlock door, no trodden path or ruts, a clean decal for the pad, no blast marks under the MAV or landers, gaps in the rover's tracks, a rectangular boot stamp | acted on: the ground inside every levelled site is darker, packed and without ripples; landers that came down on engines and the MAV sit in a rayed blast pattern; boot prints are boot-shaped; marks and stains darken with the light. Paths and ruts still open. To re-review |
| V8 | Sky flat khaki-olive at midday with a barely paler horizon; toward the sun the frame bleaches and the rocks go sooty (`hab-noon`, `rover-drive`, `yard`, `day-sun`) | acted on: redder, warmer zenith and a clearly paler band at the horizon; the glow round the sun is tighter. To re-review |
| V9 | The storm lacks mass: sparse straight bright lines, no billowing sheets, no sand along the ground, the astronaut as crisp as in fair weather | acted on: a veil of dust is drawn over the whole frame in a storm, the nearest things included, in sheets that thicken and thin with the gusts and blow the way the wind does; the streaks are half as bright. To re-review |
| V10 | Interiors evenly lit with flat materials: no grime or fabric, blob shadows, grow lights that cast no pink, empty grey portholes, a blown workbench lamp, no strut shadows in the greenhouse | acted on: the Hab's interior has painted wear, portholes with a daylight view, lamps as lit tubes; the room is lit less evenly (stronger fittings, less fill), and the grow lights spill pink on the trays. To re-review |
| V11 | The astronaut is spotless and toy-like, with a flat visor; he tilts as a rigid whole on a slope (`debris-a`); arms flared in `canyon-wall` | part done: WorkStand rewritten, kneeling has its own clips, the one-shots start and end in the idle stance. The tilt in `debris-a` was not reproduced: at that spot he measures upright to within a hundredth of a degree, on the ground and idle. Dust on the suit and the visor still open |
| V12 | The globe: a thick cream rim with a hard inner edge, a lumpy limb from the exaggerated relief, a soft surface | acted on: the limb haze is a thin line, tan against the planet and bluer where it thins; the planet's own edge has a soft pale rim that fades inward; from orbit the relief is drawn at a third of its exaggerated height, so the limb is smooth. To re-review |
| V13 | Smaller: a pale hard-edged oval on the ground (`debris-a`); pale smears on the sand (`pod`, `pod-open`, `dawn-light`); Phobos at night an over-exposed blob with a halo; wheel tracks lighter than dark ground at night; a hard arc at the edge of the headlight pool; a glint star on the dome; polygonal shadows from round solar panels; the Schiaparelli wreck as brown as the soil | mostly done: Phobos no longer blooms; marks and stains are never paler than the ground at night; pods' pads ease back to the land; the wreck carries less dust. The headlight pool's edge, the dome's glint and polygonal panel shadows still open |
| V14 | Every plain looks the same: one ripple pattern, one rock set, one sky at eleven landing sites | part done: the land's own colour now says what it is made of. Dark regions (basalt sand) ripple strongly and are strewn with gravel; bright ones (deep dust) lie smooth. Landmarks particular to a site (Gale's mountain, Jezero's delta) still open |

**Round 5** (62 pictures, after the work on V1–V14): **day MET (narrowly), dawn and dusk MET**;
night, storm, orbit, terrain, models, astronaut and interiors NEARLY; poles NEARLY in the north and
NOT MET at the outcrop and in the south; **landmarks and overall NOT MET.** "About a third of these
frames could pass for a polished stylised indie release; none of the landmark, polar or storm
frames could. The man-made models and the dawn, dusk and night lighting carry the game. The two
named landmarks, the ice, the rocks and the character lighting let it down." Found fixed from
round 4: the seam, stair-steps, corduroy and ripples on steep ground (V2), the olive midday sky
(V8), the globe's thick rim (V12), the pale oval, and the dish and rover lit at night far from any
lamp. Best: `rtg`, `canyon-floor`, `dawn`, `hab-morning`, `rover-night`. Worst: `canyon-wall`,
`olympus`, `canyon`, `ice`, `title`.

What round 5 added or sharpened (X-numbers), most damaging first:

| # | Finding (pictures) | State |
| --- | --- | --- |
| X1 | Olympus Mons is still not a volcano: a smooth red slope, a brown hump with one gully, eroded badlands for a caldera. Wants a flat, dark, cracked floor inside a continuous hazed cliff ring, and overlapping tongue flows with raised edges and rough dark rock (`olympus`, `olympus-flows`, `olympus-caldera`) | acted on: three causes found. The flows ran down from a point 150 m from the real summit (they now start at each volcano's caldera, measured from the elevation data). The caldera's floor was hummocky ground (five calderas are now cut level: a dark, cracked floor of frozen lava inside a cliff that stands where the data's bowl had its side, 25 to 47 m high). And "basalt" was the land's own orange made darker, so it came out brown (it is now dark grey-brown whatever the dust round it). Flows are eight times as long as wide, so they read as tongues. To re-review |
| X2 | Valles Marineris has no scale or rock from the rim and at the wall: pinstriped rounded hills, strata smeared to watercolour, a wall that is a blurred agate lump; the camera crops the player to a helmet (`canyon`, `canyon-rim`, `canyon-wall`). Bug: in `canyon` the astronaut is buried to the knees beside a hard crease | acted on: steep ground now wears spurs and gullies down its fall line in three sizes, as deep as the wall is steep, so a canyon wall is buttresses and shadowed chutes and not a smooth bank; the haze thickens toward low ground, so the far wall of a canyon stands back. The "buried" astronaut was not buried (feet, physics and drawn ground agree to a centimetre): the camera sat low behind a dune crest that hid his shins. Out of doors the camera now swings up over the ground on its boom where it used to zoom in, far enough to see his boots when a little will do. To re-review |
| X3 | The astronaut is lit the same whatever the sun does: with the sun ahead of him his back is bright cream while rocks in the frame are dark on the camera side (`day-sun`, `dawn`, `dusk`, `walk-plain`) | acted on: things men built take 56 to 84 per cent of the sky's fill by day (least under a low sun), where they took all of it. To re-review |
| X4 | The title screen's globe is nearly black (`title`; fine in `title-globe`) | fixed: the picture was taken half-way through the title's two-second fade from black (the script now waits). The globe also stood behind the menu: it now stands to the right of it |
| X5 | Ice is still plaster: matte white with an embossed crack net, tan chips littering the cap, an outcrop of foam cuboids; no ice shows in `south-pole` (`ice`, `pole-90`, `north-pole`, `south-pole`) | part done: on ice the polygons are fine blue lines, not embossed plates; the surface carries wind-cut ridges and a fine glitter near the eye; the ice is a deeper blue and glossier. Off the ice, frost polygons are a hand deep, not a mud flat's cracks. The south's residual cap lies off the pole toward 315 E, and the picture is now taken on it. The outcrop is rebuilt: six blocks broken along tilted planes, each face a shallow hollow between crisp edges, five thin dust layers running through dark blue ice, a scarp of four with two slumped at its foot. Nothing lies on the ice now, gravel included. To re-review |
| X6 | Rocks are three repeated shapes: charcoal flat buns with no dust on top, flat tan chips, large faceted wedges. Bug: a rock floats above its shadow and a slab hovers (`walk-plain`, `rover-drive`, `rtg`, `astronaut-side`, `debris-b`, `canyon-rim`, `yard`, `debris-c`) | acted on: sixteen shapes in place of three (broken basalt blocks, worn boulders, layered plates, cobbles), kept as a generated atlas of surface distance and normal that the shader lays over a plain ball, so every level of detail is the same rock, shaded smooth, with no extra draw calls; brown-grey stone under a film of the dust of the place it lies in, thick on what faces the sky; none on cliffs (judged by the drawn mesh) and none on polar ice. The floating rock: rocks stood on the height function, and the mesh only samples it, cutting the corner across a crest (0.43 m in `debris-c`); every rock now rests on the very triangle drawn under it. To re-review |
| X7 | One blast stamp is used under every lander, rovers and airbag landers included, tens of metres wide, and reads as a palm tree's shadow; no scorch under the MAV; the ground is pristine to the airlock; rover tracks are separate rectangles with no tread | part done: a blast mark is a ragged scoured patch five metres across with short streaks at its edge, and only the landers that came down on engines have one (the Vikings, Mars 3, Mars 6, Phoenix, InSight); the ground under the MAV is burnt black. Paths at the airlock and continuous wheel tracks still open |
| X8 | A row of evenly spaced pale smudges across the mid-ground (`pod`, `pod-open`) | fixed: a capture fault. It was the dust a passing dust devil kicks up: the script steps the game without drawing, and the puffs did not age in those steps, so two seconds of them hung in a row. They now age with the steps |
| X9 | The storm has no mass: uniform brown air, a few hairlines, the astronaut the crispest thing in the frame (`storm`, `storm-sun`) | acted on: dust at three depths streams across the frame along the wind (far murk, nearer sheets, ragged streamers low down), drawn out along it, the dense streamers paler than the murk behind them, over the astronaut too. To re-review |
| X10 | Night at the base: the dome evenly pale on both sides with nothing to light it; a white glare ball over a third of the greenhouse; a clipped white disc high in `twilight` that reads as a second sun (`hab-night`, `greenhouse-night`, `twilight`) | acted on: the glare was his own helmet lamp lighting the glass like paper (glass is now dark in itself and takes only a glint); things men built take 22 per cent of the night sky's fill, down from 40. The disc in `twilight` is Phobos, drawn four times its size: still open |
| X11 | Looking toward the sun washes the frame: a white halo and pale beige ground (`day-sun`, `pole-90`) | acted on: the exposure closes by a fifth with the sun in the frame, at any hour. To re-review |
| X12 | The ground at the feet on flat plains is a blur of soft blotches (`hab-noon`, `pile`, `astronaut-front`, `astronaut-side`, `lander-beagle-2`); ripple ground holds up | acted on: the two grit layers nearest the eye are a third stronger in relief and tone. To re-review |
| X13 | Shadow faults: a lit strip between the tank and its shadow (`debris-c`); the astronaut's long shadow starts short of his boots, with coloured fringes (`pole-90`); his noon shadow is a ragged blot (`hab-noon`) | acted on: the shadow maps' depth bias is a quarter of what it was (it pushed a shadow away from its caster along the light, by metres under a sun two degrees up); most of the bias is now along the surface normal. To re-review |
| X14 | Interiors are flat: even light, no pools under the fittings, blank monitors and tablet, empty trays, more toy-like than outdoors (`inside-*`) | part done: monitors show something (four panels drawn in code: levels, a trace, the planet with a fix on it, a log; each screen in a model is laid on one), and the comms monitor idles dim until there is an uplink. Light pools and planted trays in the pictures still open |
| X15 | Smaller: the astronaut leans as a rigid plank in `debris-a`; Mars 3's petals are see-through; the Schiaparelli wreck is cardboard shards in soil browns; ruler-straight horizons at four landers; unexplained dark patches (`lander-perseverance`, `pile`, `hab-noon`); a white dot in the day sky (`olympus-flows`); pale patches in a night track (`rover-night`); `astronaut-back` shows his front | part done: Mars 3's petals are drawn from both sides; a wall's beds are unevenly thick (the layers repeated every 7.7 and 34.5 m of height, which showed as pinstripes); the white dot by day was Phobos; the Schiaparelli wreck is rebuilt as what is left of a disc lander (a third of the drum standing under torn gold blanket, a tank burst at its weld, the rest thrown across burnt ground, every sheet with thickness and a torn edge). The astronaut's lean in `debris-a` is the camera's perspective at the frame's edge, not the figure. Ruler-straight horizons on flat plains still open |

**Round 6** (65 pictures at iPhone size, 844x390 at twice the pixels, on the preset a phone starts
on; after the work on X1–X15): **day, dawn and dusk, and models MET**; night, storm, poles, orbit,
terrain, astronaut and interiors NEARLY; **landmarks NOT MET; overall NEARLY** (it was NOT MET).
"The base, the plains, the props and landers, dawn/dusk and the title now look like a polished
stylised release. The landmarks, the launch sequence, the ice and a handful of bugs do not. Roughly
two frames in three would pass for a good commercial stylised mobile game." Found fixed: the title
globe, the palm-tree blast stamp, the row of smudges, the floating rock, the lit strip under the
tank, Mars 3's petals, most of the storm and of the wash toward the sun. Best: `pod-open`, `dawn`,
`rtg`, `hab-morning`, `night-plain`. Worst: `launch-climb`, `olympus-caldera`, `olympus-flows`,
`pole-90`, `canyon-rim`.

| # | Finding (pictures) | State |
| --- | --- | --- |
| P1 | The new caldera has terrain faults: a row of pyramid teeth on the far rim, a flat-faced pyramid, a thin fin, a vertical seam where pale strata stop dead, pale shards against the dark wall, a saw-toothed edge to a sand patch (`olympus-caldera`) | fixed: the teeth were canyon-sized spurs standing up over the brim (a caldera's wall now takes a seventh of them, and every spur's crest is a little rounded); the seam and the shards were the skirt between a fine mesh and a coarser one whose cliffs stood metres apart (the meshes near enough to matter now draw the same cliff, and the same ledges); the floor's edge is broken up by noise. To re-review The saw-toothed edge of the sand patch was a third thing, found later: the wall's profile had a bench with a sharp lip where its scree ramp ended, and wherever that lip ran across the mesh's grain it was a row of teeth; the ramp now runs into the wall at one slope. A lava flow's far edge is also drawn softer and broken by the twelve-metre grain |
| P2 | The launch has no spectacle: `launch-climb` is an empty brown frame with a dot; `launch` a rocket in a featureless sky with a clean cone for a flame, no smoke, dust or ground; in `launch-orbit` the ship is small over a blurred sliver of planet | acted on: the first seconds are watched from the ground, the rocket climbing off its pad; then from alongside and a little above, so the ground falls away under it and the horizon curves; a column of pale smoke hangs behind the climb; the last shot looks back down past the Hermes from half the distance, the planet's limb behind her. To re-review |
| P3 | Valles Marineris is banded hills, not a great canyon: pinstripes (`canyon`), a far side close enough to count its rocks and a wall smeared to watercolour (`canyon-rim`), a smooth slope with no ledges, talus or fallen blocks (`canyon-wall`), walls like drapery (`canyon-floor`, still the best) | acted on: bare rock carries a crag layer of relief and tone from sixty metres to a kilometre and a half. A wall is now three things, not one banded surface: spurs of bare bedded rock (a shade darker than before); chutes between them floored with pale scree that has no beds in it (the mesh carries how far down in a gully each point lies, so this holds at any distance); and at the wall's foot the blocks that fell from it, some bigger than a man (boulders are placed at a fixed number to the square metre within sixteen metres of steep land, whatever the country's own rock count). Ground between the angle dust slides at and the angle scree lies at is drawn as scree. Two new pictures, `canyon-climb` (on the wall, looking along the canyon) and `canyon-foot` (along the foot, among the blocks). From a hundred metres a wall's triangles are too coarse to carry its spurs, so steep bare rock also takes a relief layer stretched eight times up and down (streaks down the fall line), and its beds are a little closer in tone; the two smaller sizes of spur stand out nearly twice as far. To re-review |
| P4 | Olympus's flanks do not say volcano: one lobe on a smooth brown hump with blurred orange patches and faint bands (`olympus`, `olympus-flows`) | part done: lava is near-charcoal with rust drifts, rough at the middle distance, with no bedding stripes on gentle ground; the flows are half as thick again (the largest seven and a half metres at their fronts) and the shield between them smoother, so a flank is tongues of dark rock with sand pooled between them. Levees and channels still open |
| P5 | The astronaut floats at the pole: his shadow starts 25 px below and 60 px left of his boots (`pole-90`) | fixed: he stood on the height function, 19 cm above the triangles the medium mesh draws there. Feet, wheels, the camera and everything placed in the world now stand on the drawn triangle itself (measured: 0.00 m at the pole and on the plain) |
| P6 | Rover tracks are rectangles by day and, with the dust puffs, glow at night as square orbs (`rover-drive`, `rover-night`) | part done since the pictures were taken: marks are half as long and twice as many, so a track is unbroken, and puffs are no longer cut by the ground; dust is lit by what lights the ground (it had a floor of a quarter and glowed at night). To re-review |
| P7 | The astronaut ignores the sun's direction: with the sun ahead his back measures as bright as lit sand, with no rim light (`day-sun`, `dawn`, `dusk`, `canyon-floor`, `walk-plain`) | acted on: under a low sun things men built take a third of the sky's fill (it was 56 per cent), and seen against the sun they catch its light along their edge. To re-review |
| P8 | Ice reads as plaster: matte white with wide embossed grooves, no glint; the same crack net on red ground at Mars 3 and Phoenix; raked stripes in `pole-90`; the outcrop better but toy-like; a tan shadow in `ice`; the lamp pool a white cloud at his waist in `south-pole` | acted on: on ice the crack net has no relief at all (thin dark-blue lines), the wind-cut ridges are a quarter as strong, and the ice is kept well under white so that it holds its blue in sunlight. The lamp pool and the outcrop's toy look still open. To re-review |
| P9 | Night lights do not light the ground: the airlock face evenly near-white with dark ground at its foot; no glow or strut shadows outside the greenhouse; a white disc with a halo in `twilight` | acted on: the moons are half as bright; the porch lamps' light hangs a pace and a half out from the wall at waist height, so it pools on the ground (at the wall's face it burnt the panel white and left the ground dark); the greenhouse's own light reaches the ground round it after dark. To re-review |
| P10 | Rocks still repeat in places: dark dust-free buns (`walk-plain`, `rover-drive`), one wedge shape (`canyon-floor`, `lander-curiosity`), flat tan chips (`debris-b`, `astronaut-front`) | open (these pictures have the new rocks) |
| P11 | Ruler-straight, haze-free horizons at the flat lander sites, with boulders perched on them like a table's edge | acted on, twice. The clear-day haze is half as thick again (to this planet's scale it was a third of Mars's). And there is a layer of haze at eye level in the distance: whatever is seen within a degree or so of the horizon line, more than a hundred metres out, fades toward the sky, in the one fog shader that the ground, the rocks and everything built all share. The last of a plain melts away, far hills stand in haze to their knees, and a boulder fades with the ground it stands on. (Two earlier rules for the boulders, by where on the planet each lay and by the tilt of the ground under it, left pale ghosts of boulders on clear ground.) To re-review |
| P12 | Interiors evenly lit: no pools under the lamps, weak shadows, blank monitors, empty trays; in the greenhouse no strut shadows and the astronaut cut at the thighs; from behind with the helmet off his head is a white ball with black ear cups | part done: the interior pictures show the farm planted; monitors' panels are lit, every one of them (only the first screen of each model had its picture). In the greenhouse the frame's shadows lie across the floor, the trays and the astronaut: of a model's panes of glass only the first was told to cast no shadow, so the dome shaded its own floor. With the helmet off his head is a head from behind: short hair to a hairline on the nape, ears, a snug cap that stops on the skull. The Hab's even light from above is under half what it was and each ceiling fitting reaches seven metres, not twelve, so the walls fall away a little; but four fittings five metres up still light the floor evenly, and real pools want spotlights (the lamp pool hands out point lights only): open |
| P13 | The storm lacks near dust: a straight band edge, few streaks, nothing blowing past the camera; the sun's disc is out of frame in `storm-sun` | acted on: the streamers nearest the eye are sharp-edged and stronger, the grains' streaks half as bright again, and the picture is taken with the sun low enough to be in a phone's frame. To re-review |
| P14 | Stains and smears: a dark smudge with nothing to cast it (`hab-noon`, `lander-beagle-2`); a pale grey-green smear at the foot of far dunes (`astronaut-back`, `beacon`, `debris-b`); a dark red blotch (`debris-a`); soft foregrounds | part done: the packed patch at the Hab is half as strong under its prints and ruts; the patch under an airbag lander is fainter. The rest open |
| P15 | The astronaut's finish: a symmetrical arms-out pose, mitten hands, no dust on boots or legs, a flat visor | acted on: his boots and shins are dusty and the dust on him lies in patches (the model's vertices are stored packed, as whole numbers, and the dust shader read those numbers as heights in metres: dust that gathers near the ground never reached him); the visor is a curved mirror showing a bright bowed horizon, darker sky above and ground below, pale at its rim; a model helper gave the gloves four fingers and a thumb in a relaxed half-curl, and a standing pose with nothing mirrored (one hip low, the shoulders tipped the other way, the right arm hanging close, the left bent with its hand before the hip, the head turned a little). To re-review. By the helper's own account: from directly behind the change in stance is modest, and the half-curl is fixed (he waves with a half-closed hand) |
| P16 | Weak models: flat shards round the Schiaparelli wreck, Beagle 2 as three mats and a dish, Curiosity's power unit a blank box | acted on: a helper rebuilt all three. Beagle 2 has two ribbed gold shells, four hinged solar discs (one level, one sagged, one jammed, one stowed) and its arm and instruments in the base; Curiosity's power unit is a finned cylinder between two heat-exchanger plates, and its mast head has its cameras; the Schiaparelli debris is thick snapped sandwich panel, ribbed plate and crinkled foil, with no flat cards. Still open by the helper's own account: Curiosity side-on, Perseverance's power unit (the old one), bare aluminium nearly white on the wreck. To re-review |
| P17 | Framing: the astronaut hides the rocket's base (`mav`); no sky (`debris-a`); the rover small under a big sky; `astronaut-back` shows his front | acted on in the picture script: `mav` is taken from beside the rocket, `debris-a` from lower with the sky in it, `rover-park` from nearer, and `astronaut-back` from behind him. To re-review |
| P18 | Small: a faint pale dot in the day sky (a moon); a stretched scarp at Mars 3; the glass greenhouse casts a solid shadow; a moon behind the word GAME on the title | part done: the greenhouse's shadow is its frame's lattice, not a solid (see P12). The pale dot in the day sky, the scarp at Mars 3 and the moon behind the title still open |

### Round 7 (iPhone size, the preset a phone starts on; 68 pictures, all seen)

| Area | Verdict |
| --- | --- |
| Day | **MET** |
| Dawn and dusk | **MET** |
| Orbit (title, launch) | **MET** (was NEARLY) |
| Night | NEARLY: stars, silhouette, lamp pool and headlights work; buildings do not light the ground |
| Dust storm | NEARLY: visibility collapses and the sun is a dim disc; the dust is smooth ribbons with no grit |
| Poles | NEARLY: no artefacts; the cap reads as a snowfield and the outcrop as a toy |
| Valles Marineris | NEARLY (was NOT MET): a great canyon from inside; not from its rim, from across or close to the wall |
| Olympus Mons | NEARLY (was NOT MET): the caldera reads as a caldera; the flanks are not legible lava |
| Terrain | NEARLY: saw-teeth gone; a stretched scarp, a smeared wall, rocks through boots, dark smudges |
| Models | NEARLY (was MET): what men built meets the bar; rocks, the commonest object, do not |
| Astronaut | NEARLY: fingers and a relaxed stance; plastic, clean, leans back, not lit by the scene at midday |
| Interiors | NEARLY: a real sense of place; flat light, a blank monitor, blown whites in the greenhouse |
| Overall | NEARLY: "About a third of frames could pass for a polished stylised release; none would be mistaken for AAA realism." |

Best five: `dawn`, `hab-morning`, `canyon-climb`, `mav`, `pod`. Worst five: `canyon-rim`, `launch`, `greenhouse-above`,
`lander-beagle-2`, `olympus-flows`.

Of round 6's list it found fixed or gone: the caldera's teeth and saw-toothed edge (P1), the floating at the pole (P5), the
rectangles and orbs of the rover's tracks (P6), the three weak models (P16), most of the framing (P17), the greenhouse's solid
shadow, the Hab's empty trays and the ball of a head. Still there, in whole or part, and carried into the list below: the
launch, the canyon, the flanks, the midday astronaut, the ice, the night's lights, the repeating rocks, the ruler horizons,
the interiors' light, the storm's grit, the stains.

| # | Finding | State |
| --- | --- | --- |
| Q1 | The launch still has little spectacle: `launch` is a rocket on a clean cone in an empty sky, with no dust skirt, smoke column or ground; in `launch-climb` the sky is brown with stars showing through it, the surface is a blur and the smoke is five cotton blobs; in `launch-orbit` the ship is small, end-on and flat-lit, the planet has no day-night line and no ascent stage is in sight | done, not yet seen by a reviewer: the launch is five shots now (`game/launch.js`). The pad close and low with the engine lit and a skirt of dust rolling out; the smoke column from 150 m with the skirt along the ground; the climb into a sky that goes black from the top down, stars out, a bright band left on the limb; the rocket leaving on a wide pale plume; the Hermes three-quarters on across half the frame, sunlit, over a planet that darkens to night across its far side, the ascent vehicle hanging off her bow; her airlock blows, Beck crosses on a tether, and the last shot looks down on the two of them over Mars (the book's ending). Looked at as a strip at iPhone size (`tests/film.mjs --phone`). Still weak: seen from above in the climb the newest smoke is flat white |
| Q2 | From the rim Valles Marineris is a pit: a far side close enough to count its boulders, a left wall like a watercolour wash, a floor with concentric swirls like wood grain (`canyon-rim`); a hazy striped escarpment with rounded tops (`canyon`); a banded hillside with no cliff, ledge or talus (`canyon-wall`); a wall of smooth bulging folds (`canyon-foot`). From inside it reads as a great canyon (`canyon-climb`, `canyon-floor`) | improved, not yet seen by a reviewer. The beds of a wall now stand in relief (a hard bed proud, lit along its top and dark under its lip), so a banded hillside reads as a stair of ledges; the round twelve-metre lumps that made a far wall a cloudy wash are lenses lying along the bedding; far off, cliff and scree follow the beds instead of a soft noise; what lies well below the eye is hazier than what is level with it, so the floor recedes; sand seen from a distance carries ripples a pace apart, so the floor's pale patches are worked sand and not blanks. Not done: the rim itself is still a rounded shoulder (the elevation data is smooth there and nothing makes a caprock), and the far side is as near as the planet's scale puts it. Tried and dropped: drawing a steep slope's brow and foot tighter than the data, by a share of the data's own curvature. It moved every viewpoint, and on a far skyline it raised a row of small teeth |
| Q3 | Buildings do not light the night: the greenhouse's own light is a blown starburst and nothing lands outside it; the airlock face is evenly near-white and the whole dome evenly pale; the rover's headlight cone has ruler-straight edges; two pale orange blobs glow on the ground ahead of him outside the lamp pool (`twilight`, `night-plain`); a white disc with a halo in `twilight`; a dust devil glows in the dark (`rover-night`) | acted on: a lit building spills light on the ground, drawn as a patch (a pool at the airlock door and under the tank lamp; a ring round the greenhouse cut by the shadows of its frame), because the fittings are point lights with no shadows that burn out a white wall long before they reach the ground; things men built take a sixth of the sky's fill at night, so the dome away from its lamps is dark; dust devils die away when the sun is down and are lit as the ground is; the helmet lamp reaches seventeen metres, not twenty-six (stones beyond its pool caught it face-on and glowed); the Earth is drawn as a star, not a disc with a halo. Open: the airlock face is still lit evenly (its lamps stand out from the wall); the headlight cone's edges. To re-review |
| Q4 | Rocks are the weakest and the commonest object: dark buns and clean wedges repeat; tan flat-shaded chips; a boulder field of smooth clay potatoes; rocks sit on the sand, not in it, and one big boulder looks undercut (`day-sun`); rocks pass through his boots where he is put down; orange rocks on dark lava (`olympus`) | acted on by a helper, not yet seen by a reviewer: twenty-six shapes built from joint planes (corners and edges broken out, joints opened, faces a net of fractures), kept sharp by moving each vertex of the ball onto its nearest arris; every rock seated at the level where it no longer overhangs its foot, with a drift of the ground's own colour; stone from dark grey-brown to nearly dust-coloured, dust only on near-level faces, the flow's own dark rock on a volcano; stones under his boots are trodden in (none over 22 cm is walkable, boulders from 40 cm block); the pale hairline at a boulder's foot was its shadow cast from its far faces (now cast from the sunlit ones). The helper's own doubts: some blocks look quarried, stones sink as he walks up to them (seen in first person), far rocks on pale dunes are still pale blocks |
| Q5 | Flat sites still end like a table: a crisp straight horizon with boulders in silhouette on it (Beagle 2 worst; Viking 1, InSight, Zhurong, Schiaparelli, Phoenix, Pathfinder, `mav`) | acted on: the horizon's haze starts sixty metres out, not a hundred and ten: on a plain that swells a little the skyline is a crest a hundred metres off, nearer than the true horizon. To re-review |
| Q6 | The astronaut: with the sun ahead his back is still as bright as lit sand at midday (`day-sun`, `walk-plain`, `canyon-floor`, `hab-dusk`) and there is no rim light; in every profile he stands rocked back on his heels, about five degrees off plumb; the suit is smooth plastic, the legs and boots clean white, the visor two bands and a dot | part done: what faces away from the sun takes up to 45 per cent less of the sky's fill (the Martian sky is brightest round the sun), the fill at midday is 0.62 of the sky's, not 0.8, and the rim light is three times as strong and no longer squared. The lean, the plastic look and the clean legs are open (the lean is in the model's standing pose) |
| Q7 | Olympus's flanks are not legible as lava: rounded dark lobes like melted chocolate with a blurred surface (`olympus-flows`), a dark hillside with soft orange blotches (`olympus`) | improved, not yet seen by a reviewer: flows carry pressure ridges across them (close-set ones a few metres apart and broader ones behind), bowed downstream and swept back at a tongue's edges, broken by the flow's own lumps. Not done: the near view (`olympus`) is still a dark hillside with orange drifts |
| Q8 | Ice is a snowfield with a toy on it: matte, no glint; the outcrop is faceted gem blocks with pinstripes; a tan shadow in `ice`; the lamp a pale aura at his waist in `south-pole`; the crack net on red ground at Mars 3 | open |
| Q9 | Storm dust is too smooth: large soft ribbons with clean edges, no grit or fast streaks; the airlock face stays crisp at a range where rocks are veiled | improved, not yet seen by a reviewer: the bands of the storm's veil are made of fast threads of sand that tear their edges, with a flicker of grains across the visor; the airlock is veiled with the rest. Not done: no grit on the ground itself |
| Q10 | Interiors are flat-lit (no pools under the lamps, weak shadows, a blank desk monitor, feet cut in `inside-game-cam`); the greenhouse is over-bright (a blown white funnel, ring lights pure white, bare soil in both trays, panes with no tint so it reads as an open frame; he is cut at the thighs); `greenhouse-above` is a blotchy pink floor under a busy frame | part done, not yet seen by a reviewer: in the Hab each ceiling fitting has a pool drawn on the floor under it and the floor falls away toward the wall. In the greenhouse the strip lights are a glimmer by day and held under full at night, the trays are planted in its pictures, and the panes carry a film of dust that catches light from either side and mirror the sky when looked along. The desk monitor shows its readout (a screen is a thin slab, and its six faces were laid out by one normal that summed to nothing: each face now has its own). Not done: the feet cut by the camera indoors, the white duct |
| Q11 | Stains and seams: dark smudges with nothing to cast them (`hab-noon`, `yard`, `pile`, `lander-viking-1`); a saturated dark-red region (`debris-a`); one crisp line between dark red and tan ground across `dawn-light`; a stretched one-step scarp with a square corner at Mars 3; camouflage mottling on the caldera floor | part done: the packed-soil patches round the Hab and under landers are half as dark (they read as shadows with nothing to cast them). Not done: the line across `dawn-light`, the scarp at Mars 3, the caldera floor's mottling, the dark-red region in `debris-a` |
| Q12 | The driving rover looks parked: no tracks, no wheel dust, no cue of motion (`rover-drive`) | done, not yet seen by a reviewer: both rear wheels throw a tail of dust and the two ruts run back from it (`rover-drive` now drives on the open plain: among the Hab's boulders it was often photographed stopped against one) |
| Q13 | Small: the title's moon sits against the end of the subtitle; two orange ghost dots at the bottom of `walk-plain`; a pale speck over the ground at Pathfinder; a pale cube on the caldera's skyline and a pale blob boulder on a far dune (`debris-b`); a few single-triangle shards at Schiaparelli; Viking 1 one cream colour; `dusk` near black in its lower half; `astronaut-back` still shows his front | part done: the moons are left out of the title screen; `astronaut-back` is taken from behind him; facing a setting sun the camera stops down less, so `dusk` keeps its ground. Not done: the rest |

### Round 8 (iPhone size, "medium"; 69 stills and a 14-frame strip of the launch, all seen)

| Area | Verdict |
| --- | --- |
| Day | MET |
| Dawn and dusk | NEARLY (was MET: `dawn-light`'s two-colour line, `hab-dusk`'s white sky with no glow, no rim light on him) |
| Night | NEARLY |
| Dust storm | NEARLY |
| Poles | NEARLY for the caps, NOT MET for the `ice` outcrop |
| Orbit | NEARLY (was MET: the title globe's outline kinks where its glow ring starts, Olympus a flat grey disc, a thick limb glow in the climb) |
| The launch (new bar) | NEARLY: lift-off has spectacle and the ship looks like a ship; the climb between and the catch at the end are weak |
| Valles Marineris | NEARLY from inside, NOT MET from the rim and at the wall |
| Olympus Mons | NEARLY for the caldera, NOT MET for the flows |
| Terrain | NEARLY |
| Models | NEARLY |
| Astronaut | NEARLY |
| Interiors | NEARLY |
| Overall | NEARLY: "base, lander and deployable frames would pass for a good mobile release. The canyon rim, ice, Olympus flanks, night driving and mid-launch frames would not" |

A different reviewer from round 7's, and a harder one on the two landmarks (round 7 had both NEARLY). Best: `rover-park`,
`lander-curiosity`, the launch strip's `22.6`, `dawn`, `pod-open`. Worst: `ice`, the strip's `12.5` and `20.6`, `canyon-rim`,
`olympus-flows`. Found gone from round 7's list: the lift-off's emptiness (Q1, in part), stars through a brown sky, buildings
that lit nothing at night (Q3, but for the starburst), the parked-looking rover (Q12), the title's moon, the blank monitor,
bare trays, the smudges at `yard`, `pile` and `hab-noon`, orange rocks on lava, `astronaut-back`. The full report is kept at
`scratchpad/rep_pic8.txt` in the session it was written in; the findings are these.

| # | Finding | State |
| --- | --- | --- |
| S1 | The launch sags after lift-off and ends flat: the column on a blotchy field with no horizon (`08.4`, `10.6`, `launch-wide`); a pill over a featureless brown ball (`12.5`); a clean orange triangle with a dark disc behind the nozzle (`19.6`); a dot on a starfield (`20.6`); in the catch (`28.0`, `30.2`) two identical figures in one dangling pose, boots on helmet; the planet fully lit there but with a night side in `22.6`–`26.4`; the crewman and tether 8 px in the wide shot | acted on: the far camera keeps the land and horizon under the column; a new shot from ahead of the rocket looks back down over the limb and the engine cuts off; a shot of Beck on the tether; close on the open hatch with Watney in it, Beck in blue reaching, the two going back side by side. To be reviewed |
| S2 | Smoke and vented air are cotton balls: distinct, uniformly white, unshaded; grey out-of-focus balls at the frame edge in `24.4`; dense smoke still behind the rocket above the air (`15.5`) | acted on: the column is one lit volume (swells, billows, leans, thins to nothing by 950 m), not puffs; the airlock vents a cone of vapour with glinting scraps. To be reviewed |
| S3 | Valles Marineris from the rim is still a pit and the walls painted stripes: countable boulders on the far rim, a washed left wall (`canyon-rim`); banded rounded hills with dune-like tops (`canyon-wall`); soft bulging folds (`canyon-foot`); boulders on the skyline (`canyon`). The wall behind Curiosity and `canyon-floor`'s left wall are named as what to match: a hard cap-rock edge, stepped ledges, talus cones with boulders | open |
| S4 | The astronaut is lit the same from every direction: his back the brightest thing in the frame with the sun ahead (`day-sun`, `canyon-floor`, `hab-dusk`, `walk-plain`, `greenhouse-door`, `olympus`); no rim light at dawn and dusk; flat-lit in orbit | acted on: what is turned from the sun takes seven tenths less of the sky (it took under half), and the rim light grows as the sun sinks; with the sun ahead his back is a mid tone and no longer the brightest thing (`day-sun`). Orbit open. To be reviewed |
| S5 | He rocks back on his heels in every profile, five to six degrees off plumb (`o2-cache` and the lander pictures) | acted on: it was the game, not the pose. A fifth of the camera's tilt went into his chest (and the model pictures kept whatever tilt the scene before had left); now a twentieth does, the head takes half, and the pictures reset it. To be reviewed |
| S6 | Vehicle and helmet lights do not light the way: no pool ahead of the rover on a slope (`rover-night`), nothing landing from the parked rover's bars (`hab-night`), the helmet's pool a smear at his hip (`twilight`, `night-plain`, `south-pole`), a four-point starburst in the dome and its ground pool ending in a clean oval (`greenhouse-night`) | acted on: helmet lamp and headlamps hardly fall off with distance and are aimed out (a long pool ahead; a wide one either side of the rover); the parked rover shows markers only; lamp light on models is capped (the star was his own lamp on a white strut); the dome's pool is laid on the land and fades. To be reviewed |
| S7 | Ice is a snowfield and the outcrop a toy: faceted blocks with pinstripes, a tan shadow on white, a warm-to-blue edge across `ice`; the caps matte with no glint or wind sculpting, cracks as blurred marker lines; a smeared band in `pole-90` | outcrop rebuilt as a low scarp of dirty layered ice under a soil mantle with calved blocks at its foot (pictures `ice`, `ice-face`, `ice-plain`); the caps themselves (no glint, blurred cracks, the `pole-90` band) open |
| S8 | The world breaks from red to cream along one crisp line at the first ridge (`walk-plain`, `debris-b`, `hab-noon`, `hab-morning`, `deployables`, `solar-kit`, `dawn-light`), and dark sharp boulders stand unhazed on ruler horizons at the lander sites | part: the haze gathers from the start (a linear part added to the squared fall-off) and the horizon's band reaches a dozen degrees above the line, so skyline boulders fade (`lander-viking-1`). The break at the first ridge is softer but still there (`walk-plain`): open |
| S9 | Storm dust is flat scalloped ribbons that cross his legs like stripes; the airlock's frame and the shovel are razor-crisp | part: the veil thins over where he stands on the screen, so its streamers pass behind him and no longer stripe his legs. The ribbons' own flat look and the crisp airlock frame open |
| S10 | Olympus's flanks are still smooth brown lobes (`olympus-flows`); camouflage mottling and a red smear on the caldera's slope | part: more bare basalt on the flow tops and the ropes nearly twice as deep in tone and relief, so they show from forty-five metres up (`olympus-flows`). Still lobes more than flows: no levees, channels or broken fronts at that range. The caldera slope's mottling open |
| S11 | The Schiaparelli wreck is flat-shaded panels with loose tetrahedra, a pure black airbrushed scorch, murky maroon ground (there and at Perseverance) | part: the pale pyramids were thrown clods, now rounded lumps; the soot is dark brown and patchy, not black. The flat-shaded panels and the maroon ground open |
| S12 | Interiors: no contact shadow under him, legs cut at the shin (and the thigh in the dome), panes with no tint from inside, a blown funnel, props cleaner and more cartoon-like than outdoors | part: the dome's whites are a worn off-white and lamp light is capped at sunlit white; indoors the view is tipped down so his boots are in the picture (he was cut at the shins, in the dome at the thighs), and a soft drawn shadow lies under him. Pane tint from inside and the duct's modelling open. To be reviewed |
| S13 | Stains, veins and red regions: crack nets as thick blurred welts (Mars 3, Phoenix, the caldera); Mars 3's stretched scarp; saturated dark-red regions (`debris-a`, `astronaut-side`, `pile`); broad dark bands with no caster (`hab-morning`, `beacon`, `deployables`) | open |
| S14 | The title globe's outline kinks where the glow ring begins; Olympus is a flat dark grey disc on it | part: the glow dies away over half the way round to midnight and no longer ends at a corner. Olympus as a flat grey disc open |
| S15 | Rocks, better but not done: pebbles one colour and one size, evenly sprinkled; rocks crowding his boots; a smooth cracked bun in `canyon-foot`; a regular dot grid on a slab's top (`astronaut-front`) | open |
| S16 | Smaller: Viking 1 one cream colour; a flat visor and clean legs; the dirt mound's flat facets (`hab-noon`); far dome struts sparkling; no flame light on the dust at lift-off and the flame a straight-sided bar; a small upright shape left of the pad at `04.9`; the rover's dust a dark smudge | part: Viking has grey covers, gold-wrapped tanks, its flag and less dust; the flame's edge moves and is less blown; the man no longer stands beside his own launch. The rest open |

### Round 9 (iPhone size, "medium"; 71 stills and a 17-frame strip of the launch, all seen)

A different reviewer again, given the bar and round 8's findings but not what had been done. The stills were taken
before the lava ropes, the indoor camera and the drawn indoor shadow went in; the storm, title and launch pictures
are of the later build.

| Area | Verdict | What decided it |
|---|---|---|
| Day | NEARLY | reads as Mars at once (`yard`, `rover-park`, `rtg`, `pod-open`); held back by the red-to-cream break at the first ridge and an empty sky |
| Dawn and dusk | NEARLY | `dawn` and `dusk` right; `dawn-light`, `hab-dusk` read as a hazy afternoon; no rim light on him |
| Night | NEARLY | `hab-night`, `greenhouse-night`, `night-plain`, `twilight`, `rover-night` good, nothing blown; nothing lands from the parked rover's lights; the helmet pool small |
| Dust storm | MET | `storm`, `storm-sun`: visibility collapses, the sun a small disc, streaks and grains, the Hab a ghost; the ribbons are gone |
| Poles | NOT MET | no artefacts at the pole, but the cap a matte lilac snowfield with blurred blue cracks, and the outcrop a toy (`ice`, `ice-face`) |
| Orbit | NEARLY | `title`, `title-globe` a real globe with a thin limb; Olympus a flat grey disc on it; the launch's globe featureless in two stills |
| The launch | NEARLY | a real ship (`22.6`), a horizon and limb in the climb, a catch that reads (`29.0`); sags at 10.4 to 12.5 and ends on two stiff figures from behind |
| Landmarks | NOT MET | `olympus-flows` brown dough; `canyon-rim` a pit with a smeared wall; only `canyon`, `canyon-climb`, `canyon-floor` read as a canyon |
| Terrain | NOT MET | the colour break, crack nets as welts, dark dashes floating on far hills, a blurred canyon wall, a dot lattice on a slab |
| Models | NEARLY | Hab, rover, MAV, pod, Pathfinder, InSight, Beagle, the RTG good; the Schiaparelli wreck, the ice outcrop and the greenhouse's top cap not |
| Astronaut | NEARLY | a good suit, his back properly shaded with the sun ahead; the shaded side one flat brown, the visor a two-tone sticker, the suit spotless, the stance stiff |
| Interiors | NEARLY | a real sense of place; legs cut by the frame, panes with no tint, props cleaner than outdoors |
| Overall | NOT MET | about a third of the frames would pass; a random frame from Olympus, the poles, the canyon rim or the wreck would not |

Round 8's list, re-checked by this reviewer: fixed are the storm ribbons (S9), the astronaut lit alike from every
side (S4, though the shade is now flat), the title globe's kink (S14), the planet's lighting mismatch, the dot on a
starfield, the dome's pool edge, the pool ahead of the rover, flame light on the dust; the backward lean (S5) was
judged the lens (he tilts only at the frame's edge). Still there: the canyon (S3), the ice (S7), the colour break
(S8), Olympus (S10), the wreck (S11), interiors (S12, before the camera change), crack welts and red regions (S13),
pebbles and the cracked bun (S15), the visor, the mound's facets, the rover's dust.

| # | Finding (most damaging first) | State |
|---|---|---|
| T1 | Olympus is brown dough: smooth lobes with no rock texture, levees, rubble or flow fronts (`olympus-flows`); orange dapples on the caldera's terrace and a red smear with bright blobs on its right slope | part: bare lava is grey basalt, carries ropes, and its top is broken into tilted blocks and plates with dust in the gaps, from twenty metres out to a kilometre (`olympus-flows`, `olympus`). To re-review. Tried and dropped: the dust on a caldera's frozen floor drawn as wind drifts with tails (the snow's drift shapes): at that range they were hard-edged patches like camouflage, worse than the soft blots. No levees or rubble banks at the flow fronts in the mesh (a phone's finest cells are 2.3 m); the caldera's dapples and the red smear on its slope open |
| T2 | Valles Marineris from the rim is a pit: a far side at the same height close enough to count boulders, a blurred left wall, even wavy stripes topped by a dune (`canyon-rim`); bands painted on smooth hills (`canyon-wall`); melted folds (`canyon-foot`) | part: `canyon-rim` stands on the main trough's real rim (293 E) and the air in a deep takes the sky's pale haze, so the far wall recedes. Close up, a wall's hard beds are broken by joints into blocks with shade in the gaps and its soft beds lie smooth between them (`canyon-wall`, `canyon-foot`, `canyon-climb`). To re-review. No talus of fallen blocks at a wall's foot yet |
| T3 | The world breaks from red to cream along one line (measured (84,37,25) against (170,120,90) in `dawn-light`); dark dashes float on the cream far hills, rock shadows whose rocks have hazed away; dark boulders unhazed on ruler horizons at four lander sites | part: haze near the camera is the colour of the ground's dust and turns to the sky's with distance, so the change is a gradient and not one line; rock shadows take the same haze as their rocks (no dashes left on far hills). To re-review |
| T4 | The ice outcrop is a toy: a translucent ghost shell with a double outline, pebbles floating on it, a dark hexagon on a boulder, a thin sheet with a speckled edge, marshmallow boulders, a flat white hexagonal plate; his shadow on ice is tan; the caps matte with fat blurred cracks; `south-pole` at night a cobalt tile floor | part: the shell is gone, nothing floats, the hexagon is fixed, his shadow on ice is no longer tan, ice under the stars is grey. The caps are now two surfaces: wind-packed snow cut into drifts (sastrugi: a blunt nose into the wind, a long tail), white and matt, over windows of scoured blue ice that is glassy and carries thin cracks (`pole-90`, `north-pole`, `ice`). To re-review. The outcrop's calved blocks still rounded |
| T5 | The launch: a 20 px rocket in 85% sky (`07.4`); a beige void over a featureless ball (`10.4`, `12.5`); dust like draped cloth and blurred blobs at the frame's edges (`launch`); the flame a straight bar (`05.9`); a hard translucent disc round the nozzle (`18.4`, `20.2`); the vent a uniform cone and the debris crisp white squares; the crewman 20 px at `24.4`; the tether at his ankles; the ship flat-shaded close up; the last two frames two stacked stiff figures from behind with no ship | part: the smoke is one lit column, the flame a teardrop with a soft edge, the vent a spreading plume, the debris soft discs, the tether clips to his pack, the catch is framed close, and the last shot has the two of them sunlit with the ship behind. The ship's flat shading close up open. To re-review |
| T6 | A beam crosses a quarter of `greenhouse-door` (the camera behind a near object) | fixed: the camera refuses a place inside anything that blocks walking (it had backed into a solar kit) |
| T7 | Crack nets are raised sinuous welts (Mars 3, Phoenix, `ice-plain`, the caldera's foreground); pen squiggles on Mars 3's scarp | part: the crust's cracks are narrower and cut in, not raised (`ice-plain`, the lander sites). Mars 3's scarp open. To re-review |
| T8 | The Schiaparelli wreck: flat-shaded shards, clean tan gumdrop lumps, black airbrushed scorch, murky maroon ground (and at Perseverance) | part: the thrown clods are low ragged lumps in the soil's colour, the soot is patchy dark brown, dark ground everywhere is graded as basalt sand, and the wreck's bent plates are shaded smooth across their creases and sharp only at their torn edges (they were shaded flat at every crease over thirty degrees). To re-review |
| T9 | The astronaut: his shaded side one flat brown the colour of the dirt; no rim at dawn and dusk but white pixels sparkling on his outline; a flat two-tone visor; a spotless suit; a stiff stance; his shadow a blob with a gap under the boots | part: what is turned from the sun takes a cool sky fill that is brighter on top; the rim is bounded; the visor mirrors a glowing horizon and the sun; his boots and shins carry about twice the dust of the rest of him and his shoulders less (`astronaut-side`, `astronaut-back`). The stance and the gap under the boots open |
| T10 | Night lights: nothing on the ground from the parked rover; the headlamps as two white dots through the cab; a small star flare still in the dome; the helmet pool small at twilight | part: the parked rover's markers lay a dim red pool on the ground behind it. The headlamps through the cab, the dome's flare and the helmet pool at twilight open |
| T11 | Interiors: legs cut by the frame; panes with no tint or reflection; a blown faceted funnel; props flat and clean; the contact shadow faint | part (the camera tip and the drawn shadow went in after these pictures) |
| T12 | Smaller: an empty gradient sky in every day picture; pebbles one colour and size; the cracked bun; a dot lattice on a slab (`astronaut-front`); the mound's facets (`hab-noon`); the rover's dust a dark smudge with a square edge; the greenhouse's top cap a faceted cylinder; a dark-red patch in `debris-a`; the tank in `debris-c` with no furrow; `day-sun` dim for noon | part: thin high cloud in the day sky (and it no longer fans out of one point like lamp beams); the rover's dust paler than the ground; the dark-red patch regraded with T8; the greenhouse's top vent is round (28 sides, smooth), not a 14-sided drum. the soil heap is shaded smooth, its spade cuts scoops with edges and not flat cards. Pebbles, the cracked bun, the dot lattice, the tank's furrow and `day-sun` open |

### Round 10 (iPhone size, "medium"; 72 stills and a 17-frame strip of the launch, all seen)

A different reviewer again, given the bar and round 9's findings but not what had been done. The stills are of the
build with clinker lava, the caps' drifts, jointed cliffs and the canyon's real rim; the wreck, the soil heap in two
pictures and the launch are of the build after (smooth-shaded wreck and heap).

| Area | Verdict | What decided it |
|---|---|---|
| Day | NEARLY | `hab-morning`, `walk-plain`, `debris-a`, `lander-curiosity` read as Mars at a glance; `hab-noon`, `pile`, two lander sites flat and dim with ruler horizons |
| Dawn and dusk | NEARLY | `dawn` and `dusk` meet the letter of the bar; `dawn-light` split by a hard line; no rim light on him |
| Night | NEARLY | `hab-night`, `greenhouse-night` good; the helmet pool a puddle; headlamp dots through the cab; `south-pole` as bright as blue hour |
| Dust storm | NEARLY | visibility collapses and the sun is a disc, but the dust is static streaks and he stays crisp: gloomy, not dangerous (round 9's reviewer had this MET) |
| Poles | NOT MET | no artefacts, and `pole-90` close; but `north-pole` sandy matte snow with tan shadows, `south-pole` an indigo carpet, the outcrop a toy |
| Orbit | NEARLY | a real globe; the limb's halo fat; Olympus a near-black thumbprint |
| The launch | NEARLY | `05.9`, `20.2`, `22.6` work and the ship reads as a ship at distance; thin spectacle at lift-off, a beige ball at `09.4` to `10.4`, the ship flat-shaded close up, weak framing in orbit |
| Landmarks | NEARLY | Valles Marineris MET (`canyon-rim`, `canyon-floor`, `canyon-gully`); Olympus not: a cracked hillside, crusted dough, a dappled quarry |
| Terrain | NEARLY | no saw-teeth, zigzags or seams anywhere; stretched textures on steep faces, a dot lattice on a slab, one crack net everywhere |
| Models | NEARLY | rover, MAV, landers, pod, beacon, RTG good; the wreck, the ice outcrop, the soil heap and the ship close up not; everything spotless and on the ground, not in it |
| Astronaut | NEARLY | a well-detailed suit; a stiff idle, a blob of a shadow, no rim or fill on the shaded side |
| Interiors | NEARLY | the greenhouse has a sense of place; the Hab richly dressed but evenly lit, disc shadows, floating furniture |
| Overall | NOT MET | "about a third would pass for a good stylised indie or mobile release, none for AAA, about one in six plainly unfinished" (29 pass, 45 competent, 15 unfinished, of 89) |

Landmarks and Terrain moved up from NOT MET (the canyon from its real rim, the seam fix, the crack lines). Round 9's
list, re-checked by this reviewer: gone are the canyon as a pit (T2, from the rim), the ice's ghost shell, floating
pebbles and white plate (T4), the beam (T6), the raised welts (T7), nothing from the parked rover (T10), legs cut
by the frame and the blown funnel (T11), a dim `day-sun` (T12), the crewman's size and the missing ship in the last
frames (T5), and no seam was seen in any picture. Still there: Olympus's forms (T1), bands on smooth hills
(T2), the colour break (T3, strong in `dawn-light`), the outcrop and tan shadows on ice (T4), most of the launch
(T5), the wreck (T8: "unchanged"), his shade, rim and stance (T9), the headlamp dots (T10), pebbles, the lattice,
the heap's facets (T12).

| # | Finding (most damaging first) | State |
|---|---|---|
| U1 | His shadow is a lumpy blob with a dithered edge and no head, pack or legs, in every frame; no rim or fill on his shaded side (one dull brown in `dawn`, `dusk`; a stipple of pixels on his outline); a disc under him indoors | open |
| U2 | Near and far ground do not join: a near-straight line between maroon and orange sand (`dawn-light`, and at `hab-noon`, `hab-morning`, `hab-dusk`, `walk-plain`, `lander-perseverance`); ruler horizons with dark unhazed boulders on the line at ten sites | open |
| U3 | The ending is uneven: the flame a white tube; the exhaust a cloth bell; the rocket 25 x 45 px two seconds after lift-off; `launch-wide` a white stalagmite with no rocket; a beige ball at `09.4` to `10.4`; a ribbon trail; the ship faceted cream cylinders close up; the tether a hairline across his boots; `27.6` and `launch-orbit` cropped to a sliver; both figures from behind at the catch | open |
| U4 | Ice: the outcrop a clam-shell with a smeared face and soap blocks, a dark hexagon on one block (`ice-face`); his shadow on ice a thin tan line (blue in `pole-90`); lilac blotches with crisp edges and no caster (`ice`, `ice-face`); `south-pole` a uniform lily-pad carpet, blurred near the camera and too bright for night; `north-pole` matte with wedges | open |
| U5 | Olympus: a platy crust now, but smooth lobes with no blocky fronts, levees or rubble; the left third of `olympus-flows` untextured dough, an olive patch; the caldera's dapples, a maroon mass, tile lines underfoot | open |
| U6 | The Schiaparelli wreck: paper shards, tan gumdrops, a black airbrushed scorch, murky ground, a smooth blob of land beside it | open |
| U7 | One polygon crack net everywhere: on cliffs at one cell size (`canyon-wall`, `canyon`, `canyon-gully`), on loose dunes where it cannot be (`rover-drive`, `debris-c`, `rtg`); pen lines across Mars 3's mesa; white twig scribbles in `dawn-light` | open |
| U8 | The storm is painted, not moving: flat streaks with hard edges, no dust near the camera, him at full contrast, a pure white disc | open |
| U9 | Night lights: the helmet pool small with a hard far edge; two haloed headlamp dots seen from behind the rover (a bug); him a black cut-out | open |
| U10 | Rocks: pebbles one colour, evenly sprinkled; a dot lattice on a slab's top (`astronaut-front`) and dot rows in ripples (`canyon-wall`); stretched stripes on blocks (`pod`); a bun with drawn cracks; white streaks (`day-sun`); cubes (`dawn`) | open |
| U11 | The Hab inside: even light, furniture with almost no shadow, clean flat props, paper plants, a small head on a bulky suit, half the screen bare floor | open |
| U12 | Props spotless and on the ground, not in it; no furrow under the tank (`debris-c`); no footprints or tracks round the Hab | open |
| U13 | Sky and globe: round blurred smudges like dirt on the lens (`launch`, `deployables`, `rover-drive`); an empty gradient in most frames; a fat limb halo; Olympus a black oval | open |
| U14 | The rover: its dust a soot blob with a thin rectangle on the ground beside it (a bug); no glass feel to its windows | open |
| U15 | The canyon's finish: the rim 90% one beige with no cast shadow; the wall thirty-degree lobes; a flat sheet of fog in `canyon-climb` | open |
| U16 | The greenhouse: a dark diagonal band on the ground outside its door; a plain cap, chunky struts, no glass seen from above; an octagon fan and paper plants | open |
| U17 | Smaller: the heap faceted (`hab-noon`, `hab-dusk`); noon flat; Beagle 2 dim; one idle pose in every prop picture | open |

## Independent interface and onboarding review

A reviewer was given every interface state at 1280x720 and at iPhone landscape (844x390), and a
numbered walk-through of a new player's first ten minutes on the phone (`tests/first-ten.mjs`).
Verdict: **desktop NEARLY, phone NOT MET, first ten minutes NEARLY.** Nothing sits under the
notch or the home indicator, and a "what to do" is on screen at every step; what is missing is
the why and the where, an explanation of the six bars, and type and targets big enough for a
phone.

| # | Finding | State |
| --- | --- | --- |
| U1 | Pause screen overlaps itself: four audio sliders are strewn under the run card (both sizes) | fixed: the music, effects and ambience sliders moved into Settings > Sound. (The Master volume slider there had never worked: it now does) |
| U2 | Phone HUD: six unlabelled bars with about 9 px numbers; no suit countdown | fixed: on phones each bar has its name and a 13 px number, and the suit's time left shows under the dial (the narrowest phones keep icons only) |
| U3 | Desktop colony Inventory: two-line rows collide in a one-line pitch | fixed: taller rows; Morale has its own heading; a machine at 12% is "failing", not "failed" |
| U4 | Emergencies do not lead the mission list ("Seal the breach" sat second, under "Cook a dinner") | fixed: an emergency always leads the list, largest, with its distance ("Hab breach: seal it") |
| U5 | Phone touch targets under 44 px: top-right buttons, tabs, Fabricate/Make/Install, photo-mode controls, map close | fixed in CSS: 44 px minimum for the top-right buttons, tabs, small buttons, option groups, sliders and photo-mode controls on touch. To re-review |
| U6 | Keyboard wording on touch ("press X"), "PWR" against "POWER" | fixed: no keyboard-only wording; "power" spelled out |
| U7 | Numbers that read as bugs: "next NASA grant at 25" when science is 52; a blueprint shown locked after its task is complete; trend arrows that contradict the alert beside them; "13 LEFT" against "N TO PLANT" in the seed chooser | part fixed: a locked upgrade whose task is done now says its blueprint is in the reward pod. The others were states the test fixture forced (science credit without analysis, trends without time passing) |
| U8 | Phone drops what the player needs: third mission line, crop descriptions, storm explanation, photo-mode hint | part fixed: the reason for each new objective is toasted on phones; the seed chooser's sub-line carries what planting costs. The phone still shows two mission lines (three collide with the touch buttons) |
| U9 | Focus ring contradicts the selection (new game, colony tabs); a ring shown on touch | fixed for touch: no focus ring there |
| U10 | Photo-mode bar takes 150 of 390 px on a phone, cannot be hidden; "Slide" and "Astronaut" unclear | fixed: starts minimised on phones (Controls / Take photo / Done); check marks on toggles; "Sideways" |
| U11 | Map: unlabelled icon buttons over content on the phone, labels piling on the player marker, legend covering the corner | fixed: on a phone the tools are three buttons with a word under each (You, Hab, Key; two fingers zoom, so no zoom buttons); markers that fall on one another show as one with a count ("Hab +6") and each tap steps through them; labels keep inside the map; the key lies along the bottom in two columns and goes when the map is touched. To re-review |
| U12 | Suit number goes dark red on dark when critical | fixed: the ring pulses, the number stays lit |
| U13 | Hold/tap labels disagree; the action button can read "RUN" beside the sprint button "RUN" | part fixed: the action button no longer reads RUN beside the sprint button |
| U14–17 | Sliced section headers with no scroll cue; nine different status words; chips that read "1 tomato seeds"; thin win and sleep screens; nine identical "unknown lander" cards | mostly fixed: every scrolling region fades toward an edge that hides more of it; the rescue screen is two columns with the run sol by sol (each objective's completion is dated from now on), new statistics and a closing line written from the run, in place of a quotation from the film; what is not yet found in the journal is one card with a count ("9 more landers"). Left as they are: the status words, each of which names a different thing (a task complete, an upgrade owned, a lander salvaged). To re-review |
| O1 | The six bars are never named or explained; Morale appears and moves without a word | part fixed: named bars on phones; the premise card names the six bars; Morale is explained at the first dawn |
| O2 | The premise and the goal ("10 rations, rescue Sol 25: farm or starve") are toasts that vanish | fixed: "the numbers" is a card he reads and dismisses (rations, earliest rescue, sols with nothing to eat, what to do) |
| O3 | Objectives say what, never why or where; no marker for the current target | fixed: the current objective carries its reason, and a waypoint marks its place in the world (a machine, a bed, the airlock door), with an arrow at the screen edge when it is out of view |
| O4 | Cold open: the Hab can be off-screen, no arrow, no countdown on the phone | fixed: the suit's time left shows on phones, and the waypoint's edge arrow points at the airlock when the Hab is off-screen |
| O5 | Everything unlocks at once at the airlock | fixed: the three screens arrive one at a time, each with a line saying what it is for. Colony after the first system is inspected, Journal after the numbers, Map on first stepping outside after that. To re-review |
| O6 | Farming's costs and care are silent (planting takes food; beds need a second watering) | part fixed: the seed chooser says potatoes use one of your food and what each crop yields; a "Water the farm beds" objective appears when beds stall |
| O7 | Sleep: no cue that it is time, the bunk re-offered sleep at dawn (fixed: not offered in the morning), a Sol 2 line repeats | fixed: sleep is not offered in the morning; the Sol 2 line no longer repeats the premise |

**Second interface review** (after the work on U1–U17 and O1–O7; 51 states at three sizes and a
28-step phone walk-through): **desktop NEARLY, phone NOT MET, first ten minutes NEARLY.** Found
fixed: the pause screen, the photo bar, the rescue screen, the three buttons arriving at once,
the premise as a card, most of the phone map, the wall of unknown landers. "Desktop menus and
overlays come close. The phone HUD does not: it reads as a careful hobby build because of the
overlaps and the 9 px text."

| # | Finding | State |
| --- | --- | --- |
| W1 | Running out of suit air never becomes the mission: with 50 s of air the list leads with "Wipe down solar panels"; on phones the banner drops its instruction; the wrong toast wins; the journal lists a dinner above a breach | fixed: "Suit air low — get to air" leads the mission list, the marker and the journal whenever he is outside on a quarter of a tank, with the distance to the nearer of the airlock and a rover with air; the banner keeps its instruction on phones; while a life-threatening banner is up only what bears on it is toasted and the phone's log is quiet. To re-review |
| W2 | Phone HUD elements overlap: the off-screen waypoint arrow sits under the left-hand cards and inside the joystick; the world marker covers the opening toast; the prompt is sometimes mid-screen, sometimes at the bottom | fixed: on a phone the marker keeps to the middle of the screen (the sides are the bars, cards, stick and buttons) and is drawn under the cards; the prompt has one place, low in the middle. To re-review |
| W3 | The suit countdown climbs while standing still (6:55, 7:15, 8:45, 10:45 at a full tank) and is about 9 px on phones | fixed: the time left only counts down (it follows the estimate down at once, never up) and is 13 px on phones |
| W4 | Phone Settings hides its second half (text size, colour-blind colours) with no cue; on desktop the footer slices a row | fixed: scrolling regions are looked at every other frame, so the fade toward hidden content is there as a sheet opens. To re-review |
| W5 | Phone labels are about 9 px (vitals, statistics, win, sleep strip, new-game rows); at 667 wide the six bars and the rover's two have no words | fixed: labels are 11 px on phones; at 667 wide each bar keeps its name, with the bar as a rule under the word; the rover's two bars are named. Statistics, win and sleep-strip labels still to check |
| W6 | Touch targets under 44 px: top-right buttons and camera 42, candle 38, pause rows 34–36, colony and journal tabs 36, quality selector 36, modal buttons 38–40, the map card's close glyph | fixed: 44 real pixels for the top-right buttons, camera and candle buttons, menu rows, tabs, option groups, switch rows, modal buttons and close buttons (they were sized in rem, which the interface scale had shrunk). To re-review |
| W7 | The first objectives contradict the premise: "farm or starve", then the first job is the solar panels, and the Sol 2 line says the farm comes first while the list says panels | fixed: after the numbers the first job is the farm; the solar panels come once a bed is planted (or power is short) |
| W8 | The new-game screen on a phone has no start control; the selected card is marked only by sitting 4 px higher; "Drain x 0.75" is unexplained | fixed: each card has a Begin button on a phone; the premise is one line above them; "Supplies: last 33% longer" |
| W9 | The six bars are pointed at, not explained; food and morale have no unit or maximum; the ring is 100 then 150 while toasts speak in per cent | fixed: "What keeps you alive", a guide to the ring and the six bars and what moves each, opens from the pause menu and, on a phone, by tapping the bars. A line the first time each bar matters is still open |
| W10 | Distances disagree between compass, mission line and world marker (85 against 74 m, 30 against 18); the cold-open marker floats over empty sand; inside the Hab the compass says the Hab is 7 m away | fixed: the mission line measures to the very point the marker stands on, and the compass's Hab mark is the airlock door (hidden from inside), so the three agree |
| W11 | Keyboard wording on touch ("press X" on the candle card); unlabelled top-right buttons; the camera icon reads as "take photo"; the action button says "USE" with nothing to use | mostly fixed: the candle card speaks of the O2 button on touch; the top-right buttons and the camera button carry a word (Journal, Colony, Map, Menu, View). The action button's idle state still open |
| W12 | Numbers that read as bugs: "1 structures deployed", "0 s disco endured", "next grant at 25" at 52 science, tab badges that disagree with their headers, rover speeds in m/s (and 16 m/s parked), a 10 km scale under a whole planet, "24 more sols" on Sol 12, region names that differ between title and map, "Hab O 2", a Houston line signed JPL, the log holding Sol 1 on a Sol 12 save | part fixed: rover speed in km/h; "1 structure deployed"; no disco tile at zero; tab badges read "4 ready"; the grant line says when one is waiting. The rest are states the screenshot script forces, or still open |
| W13 | The farm chooser on phones drops the line that explains "13 to plant"; litres per watering and regolith per bed are never stated | part fixed: the chooser keeps its explaining line on phones. Litres per watering and regolith per bed still open |
| W14 | Making water costs Hab oxygen silently, and is never an objective in the first ten minutes | part fixed: the first burn's fireball now says it ate 7% of the Hab's air |
| W15 | The night summary is still thin: five deltas on a half-black screen; no days of food left, no reason for the morale change, no forecast | acted on: each number shows what it stands at now, the food is set against the rescue date ("food for 9 sols; the rescue is in 13: 4 short"), comforts are credited, and the first job of the day is named. To re-review |
| W16 | Map: storm discs cover labels; "Hab +6" never says what the six are; no pinch hint; a label cut by the header; on desktop five icon-only buttons and the legend open over a corner | mostly fixed: the tools carry a word at every size, the legend starts closed, a marker standing for several lists the others, and the touch hint shows on phones. Storm discs over labels still open |
| W17 | A discovery toast is truncated on phones | fixed: on phones a toast's note is cut at the end of a sentence, never mid-word |
| W18 | Journal: the sixth tab is off the edge at 667 wide; thirteen "not yet found" sample cards; reward chips look like cost chips; a sentence sliced by the screen bottom | part fixed: the materials still to find are one list of leads, not thirteen cards; journal objectives say why and how far. The tab row at 667 and chip styles still open |
| W19 | Wording: "him", "I" and "you"; "math" beside "colour"; "soil" and "regolith" in one prompt; "locked" against "not yet"; HOLD on some prompts only | mostly fixed: the premise card says "you"; "the numbers", not "the math"; regolith is regolith; "Locked" throughout |
| W20 | Desktop dead space (colony, comms, statistics), a focus ring on the wrong tab, no route from the rescue screen to the title, three stacked toasts | part fixed: the selected tab has the focus ring; the rescue screen's button says where it goes. Dead space on desktop screens still open |

**Third interface review** (after the work on W1–W20; 51 states at 844 wide, 26 at 667, a 28-step
phone walk-through; only four desktop pictures could be read): **desktop not judged, phone NOT
MET, first ten minutes NEARLY.** Found fixed: suit air leading the mission list, the prompt's
place, keyboard wording, labelled buttons, km/h, the sample leads, toast truncation and the phone
map. "The safe areas are respected on every picture, and the menus look like one product." A
desktop-only review is owed.

| # | Finding | State |
| --- | --- | --- |
| Y1 | No start control on the small phone: at 667 wide the difficulty cards are cut by the footer and no Begin shows; at 844 Begin is 30 px tall | fixed: three whole cards, each ending in a 44 px Begin, at both phone sizes; the description is dropped on the smallest. To re-review |
| Y2 | The suit's time left does not follow the gauge: "2:25 left" at a full sealed suit; the same figure ten seconds apart; a 150 tank reading less than a 100 | fixed: the time left is the tank divided by what a walk uses in his conditions (the simulation's own figure), so it follows the gauge and cannot go stale. It rises only when the conditions ease (dawn, a serviced scrubber). To re-review |
| Y3 | The waypoint's distance tag lands on the rover's speed digits, on the prompt's HOLD tag and on the astronaut | fixed: the marker measures every visible HUD element, the prompt, the rover panel and a zone round the figure, and takes the outermost free place toward its target (tested for overlap). To re-review |
| Y4 | Distances disagree on one screen (arrow 56 m, mission 29 m, compass 16 and 139; the mission line lags; 74 against 75) | fixed: one function gives the distance to a target for the marker, the mission line, the compass, the journal and the map, in the same frame; every compass tag is named |
| Y5 | Text of 7–9 px: bar labels, top-right button captions, new-game rows, statistics labels, sleep labels, crop stat lines, the map hint, title footers | part fixed: nothing on a phone is set under 11 px and labels that are read are 12–13 px (measured in the page by `tests/ui-audit.mjs`). Condensed capitals at 11 px still measure about 8 px of cap height |
| Y6 | The small-phone HUD is crowded: bars drawn as underlines under their names; the NEXT card repeats the first mission line | fixed: on the smallest phone each bar is the band its name and number stand on; the NEXT card is gone and the reason sits under the first mission line. To re-review |
| Y7 | Targets under 44 px: modal buttons 40, journal and colony tabs 37, quality segments 36, the touch/keyboard toggle 37 | fixed: 44 px for every touch target (measured); a switch is worked by its whole row |
| Y8 | Settings hides Sound at 667 wide with no cue; no switch for the colour-blind set is visible on a phone | fixed: Settings on a phone is four tabs that each fit the screen |
| Y9 | Journal task titles run into their reasons ("seal itThe Hab is losing its air") | fixed: the reason is on its own line |
| Y10 | Truncation at 667: the map hint, the Statistics tab clipped and Log off-screen, a lander's label dropped; the cold-open log shows "Suit O2 at 4" mid-typing | part fixed: the map hint is whole, all six journal tabs fit at 667, banners keep their instruction, the log types by whole words. Long log entries still lose sentences on a phone (the journal has them whole) |
| Y11 | Banners sit 2 px from the bars panel | fixed: phone banners are two lines and narrower |
| Y12 | The idle action button reads "— HOLD"; a status readout carries a padlock; HOLD is missing on some prompts | fixed: the action button idles as a hand, shows a padlock when something is in the way, a verb with HOLD otherwise; a reading has no padlock |
| Y13 | Night: nothing says to sleep; the summary is headed "Sol 1" after sleeping; morale and food drop on waking with no word | fixed: "Sleep until dawn in the bunk" leads the list after dark with a marker and a notice; at home the night runs on to the turn of the sol, so the account is headed "Dawn · Sol 2" and itemises breakfast and morale; nothing is taken after waking (tested) |
| Y14 | Toast captures: no achievement shown in two; "Not dead yet: reach the dawn of Sol 2" on Sol 1 (may be the script) | fixed in the script: toasts were photographed a picture late behind queued ones |
| Y15 | Numbers that read as bugs: "24 more sols" on Sol 12 of 25; a Houston line signed JPL; region names that differ between Continue and the map; soybeans "6 to plant" against 4; "Scrap Metal 9/2"; a storm banner with power rising; "Go 13% sooner"; "O2 tank 300" with no unit; the log is this session only | fixed: the real ones (the JPL signature, "9/2" cost chips, "Go 13% sooner", the unitless rover tank, the session-only log, which is now saved with the game); the rest were states the script forced |
| Y16 | Map: "Here too" lists Debris three times; PHOENIX clipped under the header; on desktop icon-only buttons, a legend over the corner, "+6" unexplained, and a bearing that reads S 180 where the phone reads N 0 | part fixed: "Also here (+6) Rover, Beacon, 3 × Debris, Cache"; place names are never clipped; desktop tools carry words; the bearing agrees between sizes. Storm discs over labels still open |
| Y17 | Rescue screen: one size offers only "Back to the title", the other only "Play again"; one statistic has three names (food grown, potatoes harvested, potatoes grown) | fixed: one name per statistic everywhere; the two different buttons came from stale pictures |
| Y18 | Smaller: the Hab icon over the compass N; blank lower halves on installed cards; the same photograph sentence on every lander card; VIEW against CAMERA; the candle button says only "O2"; "my", "He", "fueled" beside "colour" | part fixed: VIEW throughout, "+O2 candle", the photograph sentence said once, installed upgrades under their own heading. "my panels" in sample notes and American spellings in place notes still open |
| Y19 | First ten minutes, where a new player hesitates: hint chips that never leave and cover the airlock prompt; six bars, a card and a button arriving at once; "soil" against "regolith" with no marker for the heaps; the Journal introduced as NASA's tasks before any contact; the lead task flips to solar panels after one bed with power at 75% and rising; "Missing 2 Scrap Metal" with no hint where scrap comes from; why burn hydrazine now and what "carefully" risks | part fixed: hint chips go after eight metres walked and yield to the prompt; the six bars arrive on stepping into the Hab; the farm leads until three beds are in and its marker stands on the heap or the bed; missing materials say where they come from; a finished objective shows ticked. The bars guide is still something the player has to open |

**Fourth interface review** (phone only, after the work on Y1–Y19; 55 states at 844 wide, 51 at
667, a 28-step walk-through): **phone at 844 wide NEARLY, small phone at 667 NOT MET, first ten
minutes NEARLY.** "At 844, mostly yes at a glance, until the emergencies and the numbers are read
closely. At 667, no, because of three broken screens." Found gone from the third review's list:
the missing Begin, the suit timer against the gauge, the marker landing on things, distances
disagreeing, text under 11 px, Sound hidden in Settings, titles running into reasons, the map's
duplicate names, statistics under three names, and most of the first-ten hesitations.

| # | Finding | State |
| --- | --- | --- |
| Z1 | Small phone, colony inventory: rows have a fixed height and their descriptions wrap, so rows print over each other | fixed: inventory rows grow with their text (the pane's grid gave a row only its least height once the pane was full) |
| Z2 | Small phone, journal discoveries: a lander card's badge and year are drawn over its name; "MARS 6" breaks inside the name | fixed: a card's header wraps: the name whole, the year after it, badges beside it or on the line under |
| Z3 | Small phone, rescue screen: the card cuts off its last line and its button | fixed: dialogs have a scrolling body and pinned buttons; the rescue card fits at 667 with its last entry across the foot |
| Z4 | Oxygen emergency: the ring says 21 with "1:14 left" and the message under it says "Suit O2 at 25%", tagged HAB; the banner and the task say the same thing again | part fixed: the stale "25%" line no longer shows on the HUD (the journal keeps it, tagged SUIT, without a percentage). The banner and the task both remain: two places, where there were four |
| Z5 | In the Hab during a breach the compass tag names a survey site 4.6 km off | fixed: the compass names the mission's lead place first, and only that in an emergency; indoors in a breach it reads "BREACH 4 m" |
| Z6 | At 844 the six gauges are lines 34 px long and 3 px tall with 6 px arrows; the colour-blind hatching cannot be seen; the small phone uses another design whose fill ends inside the word | fixed: one design at both phone sizes: name and number over a bar 6 px tall and 121 px long (89 px at 667), arrows 8 px. Low tints the whole row amber; critical is red and ringed; colour-blind mode stripes or cross-hatches the whole bar. (The desktop keeps the thin line.) |
| Z7 | One frame after waking has no HUD at all | fixed: the HUD shows and hides with menus at once instead of fading (a fade is what a slow frame caught half-way) |
| Z8 | A red wash over the screen at the moment the suit is sealed; the old prompt still up | fixed: the seal flash is green and brief, the old prompt clears, and the prompt reads "Seal the suit" |
| Z9 | The six bars are explained only in the third paragraph of a card and behind the menu; nothing on the panel says it can be tapped | fixed: the first time in the Hab a one-line card with a pointer stands under the panel ("Tap the bars for what each means") and the panel carries a "?"; the numbers card lost its third paragraph; the guide is shorter and fits 844 whole |
| Z10 | Numbers that read as bugs: "the last 17 entries" over two; "13 to plant" against 6 potatoes; "14 sols with nothing to eat" then "15 short"; a storm banner with power rising; Hab oxygen just dropped with an up arrow; food −2 beside one breakfast; the ring "150" with no unit; "Harvest potatoes (0 so far)" with no target | part fixed. Game faults found and fixed: a style rule meant for the HUD's log hid the journal's lines ("17 entries" over two), and a jump in Hab oxygen showed the wrong arrow. Reworded: "Seed for 13 beds" with what a bed takes; the night's account says why the shortfall grew; the breakfast line; "Bring in the first harvest". The storm with power rising was the screenshot script (its pinned storm did not reach the Hab's panels). Open: the suit ring's "150" has no unit |
| Z11 | Numbers that matter are 11 px, not 13: waypoint tags, the task's distance, the compass tag, the rover's percentages, the map scale | fixed, measured in the page at both phones: waypoint tag, task distance, compass distance, suit time and map scale 13 px; gauge and rover numbers 14 px |
| Z12 | Night is said twice in the same words (a card and the task) | fixed: night is a two-word card ("Night / Time to sleep"); the task carries the reason |
| Z13 | Leaving the rover: two controls and three names (Exit, Step out, Leave the rover) | fixed: on touch EXIT is the one control and every text says "Exit the rover"; the keyboard keeps F |
| Z14 | Unlabelled controls: the idle action button is a bare circle, the refused state a bare padlock; compass icons without names; the comms desk says USE | fixed: the idle action button is dimmed; a refused one shows a padlock and "LOCKED"; compass marks without a name are dots; the comms desk says CHECK. (The idle button is still an empty circle.) |
| Z15 | The fade at the end of a list reads as "disabled" (the last rows of Controls and the bars guide) | fixed: the bottom fade is gone; a "More" pill on a short shelf marks a list that continues |
| Z16 | Settings: slider thumbs 24 x 28 px, switches 52 x 28, a 43 px segment; one thumb orange and three cream with no meaning | part fixed: slider thumbs 44 px wide on a 208 px track, switches 60 x 32 in rows worked as a whole, segments at least 48 x 44, all thumbs one colour. Thumbs are 32 px tall, not 44 |
| Z17 | Small phone: a map hint cut short on the marker view; headers and a banner title that wrap | fixed: the map hint is a whole chip over the map; the samples header, the out-of-range title and the "Candle" row are one line each |
| Z18 | Map: "+6" unexplained until tapped; at 667 a label sits over another marker; markers under the tool buttons | fixed: "HAB & 6 MORE"; a label is never nearer another marker than its own; on a phone You, Hab and Key sit in the status bar, so nothing is under them |
| Z19 | Tight gaps: 4–6 px in the top-centre stack; cards 4–8 px under the bars panel | fixed: cards stand 8 px under the bars panel at both sizes (measured); the top-centre stack has 8 to 12 px between its parts |
| Z20 | Alignment: the selected menu item indented 6 px; the recommended card raised 3 px; an orphan statistics tile; "3.4 km / walked" against "3.4 / km walked"; no title on the small phone's Settings; three "ready" badges at once | fixed: no indent on the selected menu item and no raised card on touch; statistics are 4 x 4; distances read "3.4 km / Walked" everywhere; Settings has its title at 667; tab counts are pills; a locked upgrade shows one reason and no dead button |
| Z21 | Wording: "Pull the antenna" when no antenna has been mentioned; "slow going here" without saying where it is fast; photo mode against the camera-shaped VIEW button | fixed: no antenna; "Dig regolith here (slow) / The heaps by the airlock are quicker"; the lander hint says "choose Photo mode from MENU", and VIEW has an eye, not a camera |
| Z22 | First ten minutes, where a new player still hesitates: the first log message competes with the task; nothing says what inspecting a machine told him; how many loads a bed needs; "10 to plant" for a bed that takes one; a panel prompt no task has asked for; the water burn never asked for and its cost in air not warned; the colony screen a dead end on day one | part fixed: the log is hidden during the first minute on a phone; inspecting a machine says what it does and which bar is its own; the heap says "you carry 0 / One load fills one bed"; the panel prompt says "77% output → 100%"; the burn warns that it may cost some of the Hab's air; the day-one fabricator says where materials come from. Also found: after the numbers the phone's mission list had dropped the farm and kept only the struck-through line. Open: VIEW still arrives unintroduced; the "NEW" cards do not point at their buttons; "NEW · MAP" still arrives during the first dig; "Make water" is not on the phone HUD before the burn (only the lead task fits) |

### Fifth review (phone only, after the fourth review's fixes)

All three areas **NEARLY**: the phone at 844 wide; the small phone at 667 (up from NOT MET: its three broken screens are
fixed, by measurement), provisionally; the first ten minutes. "Would a player take it for a commercial release? The colony,
journal, comms and dialog screens, yes. The HUD in its first minutes and the settings screen, not quite."

The review is incomplete. The reviewer's picture reader stopped returning pictures part-way: it saw all 28 of the first ten
minutes and about thirty interface states, measured others from their pixels, and did not see the small phone's HUD, map,
new-game screen or most of its journal at all. Those go to the helper to walk through, and to the next reviewer first.

Of the fourth review's list it found still there: the banner and task repeating each other (Z4), the old prompt fading at the
suit seal (Z8), the ring's "150" and the shortfall that grows by one (Z10), the idle circle and a refusal with no reason
(Z14), the settings controls' height (Z16), three styles of tab count (Z20), and the unintroduced buttons (Z22).

| # | Finding | State |
| --- | --- | --- |
| J1 | Settings controls under 44 px (thumbs 44 x 32, a switch 56 x 32 with a 24 px knob), and the panel is centred on its content, so the tab strip and DONE move between tabs; at 667 the title ends 4 px from the first tab | fixed: handles and switches 44 px each way; one sheet height, so the tabs and DONE stay put; 16 px under the title at 667. Tested |
| J2 | The moment the suit is sealed piles five things on the screen: the struck-through old task, the new task, a four-line log card (half-transparent grey over lockers), the old prompt still fading, a new VIEW button | fixed: at the seal there is the dial and the next task; the Hab's line comes 2.8 s of play later and his log entry at 9 s |
| J3 | The first refusal gives no reason: at the empty bed the action button shows a padlock and "LOCKED" with no prompt line. A bed is not locked; it needs soil | fixed, and made a rule: a refusal says what is wanting and what to do, or is not shown ("Needs regolith: dig it at the heap outside the airlock"). Still in the old form: refusals in `machines.js`, `fieldwork.js`, `science.js` |
| J4 | "AIRLOCK 40 m" and "46 m" inside the Hab, where the door is about 15 m off: it looks like the distance to the heap under the airlock's name | fixed: the compass and the task name the thing itself ("HEAP 46 m"), in the same frame as its distance |
| J5 | Counts that do not match what is listed: the tab "TASKS 6" over three tasks (it counts survey tasks only); HUD FOOD 13 is rations and potatoes while radishes, soybeans and tomatoes sit uncounted in the same list; "POWER 73%" in the bars and "POWER 100%" in the rover strip; the ring "150" with no unit; "breakfast −1" in the morale breakdown; "+6.8%" beside whole-number gauges | fixed: the tab counts what its page lists; the inventory's Food rows add up to the HUD's figure; the rover's is BATTERY; the ring is a percentage of the tank; one discoveries count |
| J6 | The idle action button is still an empty circle, 84 px across, under the right thumb for the first minute | fixed: with nothing in reach the action button is not shown |
| J7 | The help button is 18 px: the "?" under the ring. Nothing shows that the panel can be pressed once the "Tap the bars" card has gone | fixed: the gauges panel is framed as a button and carries a labelled "? GUIDE" chip |
| J8 | Labels under 11 px: "SUIT O2" in the ring (9 px); the title footer and menu subtitles; difficulty stat labels; statistics and dawn tile labels; "MSG 01 / 06"; trend arrows 8 x 7 px | fixed: capitals on a phone are 13 px (12 under a touch button's icon), the map's lettering 13 and 12; the audit holds it |
| J9 | An emergency is said twice: the banner and the task in the same words (breach, suit oxygen) | fixed: the banner is the alarm and what is at stake, the task is the instruction with place and distance |
| J10 | Map: the hint pill covers "NOACHIS TERRA" and "300°E"; a lander icon with no label; the INSIGHT label touching a "?" marker; the marker card wraps "3 ×" away from "Debris" and its close cross is 12 px; "10 KM" under a map of the whole planet | part fixed: the hint stands clear of markers where it can, a marker with no room is a dot, touching markers are one, the card's close is 44 px. Remains: "10 KM" under the whole planet (now with "SCALE 1:282" beside it); at 844 with every lander found the hint is 3 px from a marker |
| J11 | Three styles of tab count: a filled pill, round badges, plain numerals; SAMPLES has none | fixed: one style, a figure in a pill, on every tab; SAMPLES has a count |
| J12 | Task titles always wrap (the title shares its row with the distance in a 215 px card); prompt pills leave one-word last lines | fixed: shorter titles, place and distance on their own line, and a test holds every title to one line at both phones |
| J13 | Small phone: the first card's MAKE button sits under the fade beside the MORE pill and looks disabled; a card's last word is clipped at 844; the MORE pill is 20 px tall | part fixed: the "More" mark is a caption on a shelf, and the first card's button stands clear. Remains: a line under the shelf is part covered |
| J14 | Unit spacing varies: "+10L", "+28 L", "5 L", "66L" | fixed: one function spaces every figure from its unit; the audit checks it |
| J15 | Smaller: dismissal lives in four places; the small phone's colony sub-tabs lose their icons; "a version this build cannot read" is developer wording and nothing says what New Game does to the old save; lettuce alone has no seed breakdown; the planting chooser was photographed mid-fade (is the fade that slow?); gaps of 3 to 7 px between stacked cards on the left | part fixed: dismissal in two places, not four; plain words for an old save; crops say what they are planted from. Remains: the cross and the bottom-left button are still two conventions |
| J16 | Nothing in the first ten minutes says what the long-term goal is: Pathfinder, the drive to the rocket, how long he has. ARES 4 MAV is on the map with nothing saying it is the way home; "NO UPLINK" stands over an empty box with no word on what an uplink is | fixed: the goal is said in five places (the journal's "The way home" strip, the first night's account, the MAV's marker and card, "NO UPLINK YET", a log line) |
| J17 | Where a new player still hesitates: a "REGION DISCOVERED" card lands on the Hab in the middle of the air emergency; "5:56 LEFT" beside a full suit in the airlock; six bars arrive at once with arrows and totals unexplained; COLONY and VIEW arrive with no word; the task still says "Fill an empty bed" while he wipes panels and burns hydrazine; the second burn is offered with its cost line gone; "HAB & 4 MORE": four more what; why breakfast costs morale and why the shortfall grew from 14 to 15 | part fixed: no region card during the air emergency, "5:56 OF AIR", units on every bar, the cost of a bed in bold. Remains: the six bars still arrive together, and the lead task does not change while he wipes panels or burns hydrazine |

### Sixth review (phone only; two reviewers, one a size, every picture opened: 92 each)

**Verdicts: iPhone 844 NEARLY; small phone 667 NEARLY; first ten minutes NEARLY at both ("close to MET" at 667).** Both say the
sheets (new game, settings, colony, journal, dawn, death, win) would pass for a commercial release and that nothing is clipped or
in the notch; the HUD is what holds it back. Of the fifth review's seventeen, they found gone: the settings sizes and moving
sheet (J1), the pile-up at the seal (J2), the bare padlock (J3), the airlock's distance (J4), the empty action button indoors
(J6), the emergency said twice outdoors (J9), three styles of tab count (J11), wrapped task titles (J12), the button under the
fade (J13), unit spacing (J14), the missing long-term goal (J16). Partly: counts (J5), small labels (J8), the map (J10), the help
button (J7), new-player hesitations (J17).

| # | Finding | State |
| --- | --- | --- |
| K1 | A dig prompt and an 84 px DIG button are on screen every second outdoors, even at 0:27 of air, in a breach and at night: the prompt slot no longer means "something is here" (both sizes: 09, 14–20, 26) | acted on; re-checked in the seventh review (see there for what is left) |
| K2 | The HUD covers about 45% of the small screen, and one distance is printed three times (compass tag, task card, world marker or edge arrow) | acted on; re-checked in the seventh review (see there for what is left) |
| K3 | Text under 11 px: the task card's detail (10 px grey, on a translucent card), banner sub-lines, gauge units "%", "L", "meals" (8–9 px), the HUD buttons' labels, CANDLE / NEEDS REGOLITH / BREACH FIRST, tile labels on the numbers, statistics, dawn, death and win sheets, the marker card's labels, the map's latitude and longitude | acted on; re-checked in the seventh review (see there for what is left) |
| K4 | The help chip "? GUIDE" is 54 x 18 px, and once its first card has gone nothing else shows that the gauges can be pressed | acted on; re-checked in the seventh review (see there for what is left) |
| K5 | Six bars still arrive at once, explained by an optional sheet of 150 to 250 words under three names (GUIDE, WHAT THE BARS MEAN, WHAT KEEPS YOU ALIVE); VITALS and the trend arrows are never explained in play | acted on; re-checked in the seventh review (see there for what is left) |
| K6 | The map's "SCALE 1:282" beside "10 KM" under the whole planet reads as a bug | acted on; re-checked in the seventh review (see there for what is left) |
| K7 | Cards for new buttons and the buttons' lights are out of step (COLONY lit with no card, JOURNAL's card with no light), COLONY is never explained in the first ten minutes, and the buttons shift left as each new one arrives | acted on; re-checked in the seventh review (see there for what is left) |
| K8 | "HAB" in red labels neutral lines (a dust devil, a placing hint); "LOG Log, Sol 1"; control hints are kept in the log | acted on; re-checked in the seventh review (see there for what is left) |
| K9 | Tab badges do not match the headers under them (UPGRADES 4 over "2 OF 10 INSTALLED", HOME 6 over "2 OF 9 MADE", DISCOVERIES 9 over "5 OF 14 FOUND") | acted on; re-checked in the seventh review (see there for what is left) |
| K10 | Prompt pills: three-line prompts at 667; a pill wider than its text; "untried" is cryptic | acted on; re-checked in the seventh review (see there for what is left) |
| K11 | Names and numbers that disagree: suit oxygen as "100%", "5:56 OF AIR", "+40 suit O2" and "150 → 200"; BATTERY against "Rover power"; "EVA O2 drain"; food as meals, rations and food; morale as a percentage and as points; KEY against LEGEND; fractions written four ways; "He plays both sides"; MAV against "Ares 4 rocket"; "(−2 food, 20 left)" then "Food for 20 sols"; the FOOD bar full at 22 with no stated maximum; "+0.5 A SOL" | acted on; re-checked in the seventh review (see there for what is left) |
| K12 | The dawn sheet is dense: five tiles and five to seven centred lines with a long bracketed morale sum | acted on; re-checked in the seventh review (see there for what is left) |
| K13 | Compass: an unlabelled 12 px door glyph and dots; its tag sometimes names something other than the task (HAB 29 m with the task at HEAP 1 m); "SOL 1 / 25" never says 25 is the rescue, which is worded three ways ("earliest rescue", "by Sol 25", "on Sol 25") | acted on; re-checked in the seventh review (see there for what is left) |
| K14 | Nothing says how to leave the Hab: the heap's distance is a straight line through the wall | acted on; re-checked in the seventh review (see there for what is left) |
| K15 | The right-thumb cluster is crowded: the candle 6 px from RUN, JUMP 9 px from the action button | acted on; re-checked in the seventh review (see there for what is left) |
| K16 | Indoors a breach is said six times; the prompt repeats the task; the refused button "BREACH FIRST" does not say what is refused | acted on; re-checked in the seventh review (see there for what is left) |
| K17 | The plan arrives as a passing log card while PLANT is up, in the slot that carries jokes | acted on; re-checked in the seventh review (see there for what is left) |
| K18 | Map details: a name over a storm's hatching; labels 5 to 11 px apart; an unlabelled grey dot and the MAV's icon missing from the key; the key's panel translucent and cutting the longitude labels; the hint touching PHOENIX; a ring cut by the top edge; Mars 3 and Mars 6 drawn as different kinds | acted on; re-checked in the seventh review (see there for what is left) |
| K19 | Colony: four rows of headers leave about 210 px for cards; second-row titles sliced by the fade; the out-of-range banner pushes the tabs down and drops their badges; a first visit is a screen of red "Missing"; MAKE buttons at different heights; ragged inventory columns | acted on; re-checked in the seventh review (see there for what is left) |
| K20 | Smaller: no count of carried loads on the HUD; the crop chooser's rows do not look pressable; a red WATER row with no task; the win sheet's wrapped tile and run-on attribution; nothing says what WAKE AT DAWN costs; comms has no way out but NEXT six times; a KEYBOARD tab on a phone; pills that linger (the bunk after 20 s); the outside temperature shown indoors; "100%" a third of the way along two sliders; sub-tab strips 42 px tall; dismissal at the bottom right on four sheets; the lead task unchanged through other chores | acted on; re-checked in the seventh review (see there for what is left) |

### Seventh review (phone only; two reviewers, one a size, every picture opened: 94 each)

After the sixth review's list (K1 to K20). Pictures: 66 interface states and a 28-step first ten minutes at each
size. Verdicts: interface NEARLY at 844 x 390 and at 667 x 375; first ten minutes NEARLY at 844, NEARLY and "close
to MET" at 667. Both said the type, colour and layout hold together as one product, nothing sits under the notch
or home indicator, and no text is under about 12 px.

Of the sixth review's twenty: gone are the ever-present dig prompt (K1), text under 11 px (K3), the map's scale
that read as a bug (K6), cards and lights out of step (K7), "HAB" in red (K8), three-line prompts (K10), the way out
of the Hab (K14), the plan as a passing card (K17); mostly gone are six bars at once (K5), badges against headers
(K9, one left), names and numbers (K11), the compass (K13), the breach said six times (K16), the small items (K20).
Partly: HUD weight (K2: about 30% settled, 40% at worst), the GUIDE chip (K4: 59 x 27 px), the dawn sheet (K12),
the thumb cluster (K15), map details (K18), the colony (K19).

| # | Finding | State |
|---|---|---|
| L1 | Numbers that contradict each other on one screen: the TASKS badge 9 over "3 TO DO"; "Inspect both machines (0 of 2)" with one inspected; a dinner in the win timeline and "0 DINNERS COOKED"; "20 left" then "enough for 15 sols, eating as today"; a rising arrow on a full bar; "100 %" beside "100%" | fixed: the food line says what it counts ("20 meals make 15 breakfasts"); the task card is rebuilt the moment its own words change; no arrow up on a full bar or down on an empty one; the percent sign stands against its number; the dinner count was the picture script's own state; and the Tasks tab's figure is the mission's tasks still to do, the same figure as the heading under it (it had added NASA's, which are counted under their own heading a screen further down). A test holds the tab, the heading and the list to one count |
| L2 | The lead task follows the player's feet: planting, then panels at the panels, then water at the rig, then planting again; "Make water" listed before hydrazine has been explained | settled by the eighth review (two reviews of three asked for a fixed lead): see M2 |
| L3 | Touch targets: the GUIDE chip 59 x 27 px; gauge rows on a 20 px pitch if they are pressed singly; top-right buttons 6 px apart; map markers 24 px with "tap again for the next" | part: on the wider phone the top-right buttons stand 8 px apart (they were 4); on the small phone they keep 2 px, because the row ends 5 px short of the compass. The GUIDE chip and the gauge rows are not targets of their own: the whole gauge panel is one control, well over 44 px, and the chip is its label. Map markers open |
| L4 | List screens show one and a half cards: three to five header rows leave 150 to 210 px, and the fade slices the next row (colony, journal, guide, statistics); the win and Sol 2 dawn sheets scroll at 667 | part: on the wider phone (over 760 px) the tabs of the colony and the journal stand down the left edge as a rail (as on a desk), each 44 px high, so the page under the title bar is all list: about 300 px of it at 844 x 390 where there were 250. The statistics show whole; a card list shows a row and a half to two rows. Not on the small phone: at 667 px less the notch a rail leaves one column of cards where the tab row leaves two (tried, and the audit's own self-test caught the change). There, and for the win and Sol 2 dawn sheets, open |
| L5 | Map: graticule labels under region names and storm hatching, a name over the longitude row, the key cutting an icon; at 667 the player's own coordinates truncated ("303...."), markers cut by the left and right edges, grey dots against the key's white | part: on the small phone the scale's words leave the bar, so the player's coordinates are whole; names (of markers, storms and regions) keep off the latitude and longitude figures; a marker that the left or right edge would cut is drawn whole against it, as at the top and bottom. Dot colours against the key open |
| L6 | Introduced out of order: morale scored on the first dawn sheet before it has a bar; JOURNAL unlit a step before its card; COLONY opened on a fabricator where nothing can be built; four NEW cards in 31 game minutes; the trend arrows shown ten steps before they are explained | part: the first dawn sheet now says what morale is. The rest open |
| L7 | The cold open: 1:26 of air and 74 m to go, and nothing says run; the off-screen arrow floats inside the picture with no distance | see M3 and M9 in the eighth review: "Tap RUN" from his first steps with the button lit, and the arrow kept to the screen's edge or not drawn |
| L8 | HUD rough edges: the gauge panel at full size from the first bar (an empty dark box through Sol 1); a card touching the joystick ring; the region's name as a second chip that reads as a destination; two banners of different widths; one distance printed two or three times; bottom pills with almost no backing and twice as wide as their text (667) | part: on a phone the region's name is a plain caption with no plate. The rest open |
| L9 | The dawn sheet on Sol 2: five tiles and six lines, a 25-word FOOD sentence, a red "-10% POWER" with nothing saying a night's drain is normal | part: a night's ordinary cost (power, water, a breakfast) is printed in plain ink; red is kept for a fall that leaves little (power under 25%, water under 20 L, fewer than four breakfasts, morale under 40) and for any fall in the Hab's air. The five tiles, six lines and the long FOOD sentence open (the sentence's words are shared with the comms desk's card on purpose) |
| L10 | Wording: "the colony" for the Hab; the breach "behind the comms desk" outdoors and "FAR WALL" indoors; "3 left", "yields 4", "25 FOOD GROWN" with no noun or unit; the candle under three names; O2 TANK and ROVER AIR in one picture; an earned achievement worded as an order; "warm afternoons" at 09:19; "160 to 200 km/h" on a planet 75 km round | part: "the Hab" for "the colony"; dust devils rise "where the sun has warmed the ground"; "yields 4 meals"; "Meals grown". The rest open |
| L11 | Settings: text size under GRAPHICS; slider tracks starting at different places on two tabs; a 44 px white block for a thumb; half-empty sheets | open |
| L12 | New game: "Wake at dawn" not explained; nothing says a later rescue is harder | fixed: the cards say "To last: 15 / 25 / 35 sols" and "If you die: Start that sol again" |
| L13 | Emergencies said too many ways: seven signals for a breach; the NIGHT card and the sleep task 60 px apart | part: on a phone the nightfall card is not shown (the task card beside it has just turned to "Sleep until dawn"). The breach's seven signals open |
| L14 | Colony: a first visit still mostly red chips with no pointer to debris; a LOCKED card ahead of READY ones; "6 READY" over cards none of which shows READY out of range | part: on each of the colony's three lists what can be made now stands first, then what wants materials, then what is locked (a locked card stood ahead of the ready ones). The first visit's red chips and "6 READY" out of range open |
| L15 | Smaller: the status strip's left edge moving as the temperature comes and goes; ragged inventory columns with one icon for every crop; "LOG" stacked three times; win tiles wrapping; amber POWER at 18% with no task; nothing in the first ten minutes mentions VIEW, JUMP or the rover | part: each crop has its own icon in the larder and on the planting cards (potato, radish, lettuce, soybean, tomato); a Hab battery under 20% is a task once the first panels task is done ("Wipe the solar panels" if they are dusty, else "Spare the Hab's power"). Not acted on: VIEW and JUMP are named on their own buttons and the rover by its prompt. The status strip's moving edge, "LOG" three times, win tiles wrapping open |

### Eighth review (phone only; two reviewers, one a size; 94 pictures each)

After the seventh review's list (L1 to L15). Pictures: 66 interface states and a 28-step first ten minutes at each
size, from a build with the tab rail, the dawn sheet's plain-ink costs, the crop icons and the low-battery task, and
before the map's edge markers, the colony's ready-first order and everything in the list below. Verdicts: interface
**NEARLY at 844 x 390** (provisional: that reviewer's reader dropped eleven early pictures, the title, settings tabs
and comms among them, before notes were written, and nine more were judged from their same-size twins in the
first-ten set) and **NOT MET at 667 x 375**, "close, and the misses are finish rather than structure"; first ten
minutes **NEARLY at both**. Both found one type and colour system throughout, nothing under the notch or the home
indicator, no keyboard wording, and no text under about 11 px; the small phone's reviewer named the title, the
difficulty sheet, pause, controls, restart, comms, death, launch and photo mode as release-grade as they stand.

Of the seventh review's fifteen: gone are the Tasks badge over "3 TO DO" and the other contradicting figures but one
(L1), the nightfall card beside the sleep task (L13), the region as a chip (L8), "yields 4" and "25 FOOD GROWN"
(L10), the bottom pills' backing (L8), truncated coordinates on the map (L5). Still there at both sizes: the lead
task following his feet (L2), the GUIDE chip and gauge pitch (L3), one and a half cards on list screens (L4), map
collisions and cut markers (L5), things introduced out of order (L6), the late run hint and the floating arrow (L7),
the empty gauge box and banner widths (L8), the Sol 2 dawn sheet (L9), the breach's many signals (L13), a locked
card ahead of ready ones (L14: fixed after these pictures).

| # | Finding (both sizes unless said) | State |
|---|---|---|
| M1 | The FOOD card is cut mid-sentence at a three-line clamp ("...enough to..."); POWER and MORALE cards keep only their first sentence | fixed: each gauge's card has a short text for a phone that fits whole and says what the bar is for |
| M2 | The lead task follows the player's feet (planting, panels, water, planting again) | fixed: the first line stays until it is done; the task in hand is brought up to the card's second line, marked "here" |
| M3 | The cold open does not say run until 18 m from the Hab, then says "Hold RUN" for a toggle; the Hab is an 11 px triangle with no distance | part: "Tap RUN, the air is running out" as soon as he has moved, and the RUN button is ringed in amber until he has run. The far-off Hab's marker open |
| M4 | The dawn sheet: "20 meals make 15 breakfasts" unexplained; "in 12" with no unit; "TODAY Survive to Sol 25"; morale scored before its bar; the Sol 2 sheet scrolls | part: "20 meals: breakfast for 15 sols, some with a side"; "the rescue is in 12 sols"; no Today row for the whole game's goal; the morale tile comes with the bar. The Sol 2 sheet still scrolls at 667 |
| M5 | List screens show one row and slice the next through its text (colony, journal, guide, farm chooser, statistics) | open: structural at 375 px high (the tab rail was tried at this size and made it worse) |
| M6 | The left column: GUIDE chip 59 x 28; gauge rows on a 20 px pitch; the red alarm outline abuts the bar above; the panel full size with one bar; cards appear over the left thumb and touch the stick's ring | part: the guide's mark is a plain caption ("? GUIDE"), not a framed chip, since the whole panel is the control; while fewer than four bars have arrived it stands under them and the panel is as tall as its dial, so there is no empty box; cards have that much more room above the stick. The gauge pitch, the alarm outline and cards over the left thumb open |
| M7 | Emergencies: two banners of different widths; seven signals for one breach; 45% of the picture covered | part: stacked banners are one width, and on the small phone every banner is the same width. The seven signals open |
| M8 | Map: the MAV becomes an unnamed dot when zoomed in with a card open; dot colours differ from the key; labels under storm hatching; the key slices a label; markers cut at the edges; rings 19-20 px | part: the Hab, the way home and the objective are named at every zoom; names keep off the graticule's figures; edge markers are drawn whole. Dot colours, the key over a label, ring size open |
| M9 | The direction arrow floats mid-picture with no distance | fixed: for a place off the screen the arrow keeps to the screen's edge, within fifty degrees of the true way, or is not drawn |
| M10 | Onboarding order: JOURNAL's button a step before its card; five NEW cards in 38 game minutes; arrows seen ten pictures before they are explained; COLONY opens on an empty fabricator; POWER and MORALE introduced with no consequence; VIEW, JUMP, the rover never mentioned | part: a screen's button arrives with its card; the colony opens on what he carries until something can be built; the POWER and MORALE cards say what moves them. The rest open |
| M11 | Vocabulary: six names for air; "the colony" in a forecast; the breach "behind the comms desk" and at the "FAR WALL"; "3 left"; an earned achievement as an order; speeds that disagree; three verbs for making | part: the breach is at the "desk wall" in both places; "3 burns left". The forecast and the achievement were stale sample text in the picture script (the game already had them right). The rest open |
| M12 | Settings: text size under GRAPHICS; three slider origins; a 44 px white knob; half-empty sheets | part: the first tab is "Display" (picture quality and the interface's size); a slider's handle is drawn as a round knob inside its 44 px hit area and its track runs between the knob's end positions. Three slider origins and half-empty sheets open |
| M13 | The destination named three times and its distance twice; the status strip's left edge moves; the region's name reads as the chip's subtitle | open |
| M14 | The difficulty sheet: "TO LAST 25 sols" could be the supplies; nothing says longer is harder; unlabelled pips | part: "Hold out: 25 sols to rescue". The pips open |
| M15 | Planting cards: "meals" orphaned; the footer hint wrapped in a narrow column; the radish says the same thing twice; no RECOMMENDED on potatoes | part: the radish's own line. The rest open |
| M16 | The win sheet scrolls and three tile labels wrap | open |
| M17 | Smaller: "LOG" three times; ragged inventory rows; "RESTART FROM SOL 1" unexplained; sheets at two heights; MORALE with no unit; weaker toasts at the bottom | open |
| M18 | Numbers that read as slips (844): the FOOD card's "you eat one a sol" against the guide's "one each dawn, two with a side"; "13 SOLS SURVIVED" for a death on Sol 13; "Potatoes: 4% grown" on a bed just sown; a falling arrow on the Hab's air after a single burn | fixed, but for the arrow: the card says what the guide says; the death sheet gives the sol reached; a new bed is "just planted". The arrow after a one-off loss is kept (it is news, and goes in seconds). Not slips: "Suit air: 9 to 12 minutes" is Tank II over Tank I (the reviewer set it against a first tank's 5:56 elsewhere), and the Tasks badge read 3 with a breach on the list and 2 without |
| M19 | The colony out of range: "Only at the Hab" four times on one screen (844) | fixed: the line under the tabs and the page's heading say it; the cards do not |
| M20 | "Survive to Sol 25" under-directs the middle of the game: nothing on the card says a drive stands between him and the rescue (844) | part: its reason is "The MAV can launch then: 15.1 km from the Hab, in Schiaparelli" |

## Open items

| # | Item | State |
| --- | --- | --- |
| 31 | **The owner's iPhone.** First report from the real phone: the preview failed at startup with "Something broke / Input body is disturbed". Cause: the elevation file's loader filled a buffer of the length the server stated; GitHub Pages sends the file compressed and states the compressed length, so more bytes arrived than the buffer held, and the loader's fallback then re-read a download it was already reading, which Safari refuses. No test saw it because the test server stated no length and compressed nothing. | **confirmed on the phone:** the preview starts, with no errors, and runs at 60 fps (see the frame-rate row in the bar). The loader fix was the cause. The test server serves as the published site does (the old loader fails the smoke test against it); the failure screen's Reload clears the game's offline cache first. Still unproven on WebKit beyond "it starts and plays": nobody has yet looked at the phone's picture or its layout with the bar in hand, and the phone was on a build four publishes old when it reported (an installed copy picks up a new build on its next open or the one after) |
| 21 | Act on the fifth picture review (X1–X15 above) | acted on and reviewed again: see round 6 |
| 29 | Act on the sixth picture review (P1–P18 above) | acted on and reviewed again: see round 7 |
| 32 | Act on the seventh picture review (Q1–Q13 above): the launch, the canyon from its rim, the night's lights and the rocks first | acted on and reviewed again: see round 8 |
| 22 | Act on the third interface review (Y1–Y19 above) | acted on (fourteen fixed, five part fixed) and reviewed again: see the fourth review. Known to be weak still: the phone mission block when its first line and reason run to four lines; the marker hopping on a small phone while driving; long log entries on a phone |
| 28 | Act on the fourth interface review (Z1–Z22 above) | acted on (seventeen fixed, five part fixed) and reviewed again: see the fifth review |
| 30 | Act on the fifth interface review (J1–J17 above); walk the small phone's HUD, map, new-game screen and journal, which the reviewer could not open | acted on (thirteen fixed, four part fixed; the audit now holds 128 phone states under stricter rules, and `ui.mjs` 176 checks). The small phone's unseen screens were walked and fixed (prompt over JUMP, cards cut mid-sentence, a card on the stick, map lettering, the new-game sheet, the night's account and rescue screen overflowing). Next: a sixth review on these pictures. Known weak: the 44 px slider handles are heavy blocks; morale is a percentage on the HUD and points in the account; the small phone is tight with capitals at 13 px |
| 34 | Act on the eighth picture review (S1–S16 above) | in progress |
| 33 | Act on the sixth interface review (K1–K20 above) | open: a helper next |
| 23 | A desktop-only interface review (the third review could read only four desktop pictures) | low priority: the desktop is a bonus (see the owner's direction) |
| 25 | Picture reviews at iPhone size (844x390, touch, the preset a phone starts on); a WebKit check of layout and scripts | next review round; WebKit needs the owner's phone |
| 26 | Base mode: no rescue, many more resources and buildings (the owner's second mode) | after story mode is finished |
| 12 | Publish to `gh-pages` | The preview is at `gh-pages/next/` (the first game is still at the root). It is refreshed only from a commit whose whole suite passes. Replace the root once the preview has been seen running on the owner's phone |
| 10 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | measured on the owner's iPhone on an older build (60 fps average at a dynamic scale of 0.64; see the bar); to be measured again on the current build. Laptop: not measured |
| 11 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 15 | Listen to the audio on real speakers and a phone; retune by ear | blocked on a listener |
| 17 | More depth: uses for a second greenhouse; visiting landers could do more than salvage | part done: sights (eleven things to stop and watch) and photographs of the landers for NASA's archive. The second greenhouse still open |
| 13 | Shadow cost at the base: the rover (45k triangles) and Hab are drawn into both cascades; "low" is on its call budget there (180 of 180) | open (simplified shadow models would halve it) |
| 6 | More variety between regions: landmarks particular to a site (Gale's mountain, Jezero's delta); something beyond a flat plain's ruler-straight horizon | open |
| 27 | Rocks: beyond about 170 m a coarser terrain mesh is drawn than the one distant boulders were seated on, so they can float or sink by a few decimetres; the shade under distant rocks is a soft pool that does not lengthen at low sun; close up a rock's surface is soft (128 px a shape) | open |
| 19 | Astronaut: the face is plain under a metre; the head and hands are simple in a close photograph (six-sided fingers, a flat band of hair); the fingers' half-curl is fixed, so he waves with a half-closed hand | part done: fingered gloves, a standing pose with nothing mirrored, a bare head that reads as one, a curved-mirror visor, dust on boots and legs; in the rover his hands hold the yoke |
| 20 | Elysium Mons and Hecates Tholus have no caldera (theirs are a texel or two across in the elevation data) | open |
| 14 | Asset tooling: fold the helpers the model scripts each copied into `tools/assets/lib.py` | open |
| 24 | The interface tests are sensitive to how busy the machine is: a long test lets the suit drain and the log fill, and two layout checks then fail on overlaps that a short test does not reach. The overlaps are real (fix in hand); the tests should also set their own state instead of inheriting elapsed time | open |

35. **Round 9's picture list (T1 to T12)**, above: bugs first (T4's shell, T3's shadows, T6), then the launch (T5), the astronaut's shade (T9), then the landmarks (T1, T2), which need content the height model does not yet make.

36. **The seventh interface review's list (L1 to L15)**, above: the number bugs first (L1), then the cold open (L7), wording (L10), then the layout of list screens at small heights (L4) and the task card's lead (L2).

## Decisions worth knowing

- **Lava has ropes.** On the tops of flows the terrain shader draws pressure ridges about the summit the lava came from (`lavaSummit`, so they always lie across the fall line), at two spacings, bent back where a tongue's top gives way to its edge and broken by the crag noise. From 8 m out to a kilometre; nearer, the lumps carry the surface.
- **Bare lava is clinker.** A generated texture of jumbled, tilted blocks with rubble on them and dust in the gaps (`clinkerTexture` in `render/detail2d.js`) is laid on bare lava at 8, 32 and 64 m a tile, each over its own range of distance, so a flow is broken rock from a stone's throw and plates from the air. It is read only where there is lava (inside a branch, with the texture coordinates' derivatives handed in), so other ground does not pay for it, and it is left out under his feet, where painted blocks would be flat discs. Before it a flow's top had only soft noise to shade it and every reviewer called Olympus dough.
- **A polar cap is drifts on ice.** A second generated texture (`sastrugiTexture`: about 150 wind-packed drifts, most small, each with a blunt nose into the wind, a rounded back and a long tail, feathered at the edge) is laid on ice at 8 m a tile near and 64 m far, read only where there is ice. The shader makes two surfaces of it: packed snow (white, matt) wherever a drift lies and everywhere outside broad windows, and in the windows the old ice (blue, roughness about 0.15, thin dark cracks that the snow covers). Before it the cap was one pale blue surface with soft dark polygon lines, which three reviews called a lilac snowfield drawn on with a marker. First tries had 230 straight-flanked drifts with cut edges: a field of folded paper.
- **A cliff's hard beds are jointed.** The clinker texture's blocks are laid on bare rock from three sides (triplanar, in the detail textures' own frame, so the tiles' 64 m wrap never shows), a pace across near and a few metres across further off, strongest in the dark hard beds and nearly absent in the soft ones. Read only on rock. Laid evenly over a whole wall it was dried mud; with only the colour bands the wall was bands painted on smooth hills.
- **Every detail period divides 64 m.** Texture coordinates wrap every 64 m, a terrain tile at a time. The crag layer ran at 12 m, which does not divide 64, so it jumped at the border between two tiles: a seam down a cliff or across a flow (the seventh review's Q11). It runs at 12.8 m.
- **A pane of glass is seen by what it does to light** (`glass_clear` in `world/models.js`): nearly clear looked through squarely, opaque and sky-mirroring looked along, with a film of dust lit from whichever side the light is on (from inside a dome the sun is behind the pane).
- **A wall's beds are relief, not paint.** The strata were tone only, and a hillside of them was painted stripes. The grain texture carries its own slope, so the same lookup that gives a bed's tone gives where it begins and ends going up the wall: that tilts the normal along "up" (`bedRise`, `bedCut` in `render/terrain-material.js`) and darkens the underside of each hard bed. With it goes a layer of lenses along the bedding (`nBed`: the grain squeezed three and a half times vertically) in place of round lumps on bare rock; lava keeps the round crags. Far off the cliff/scree rule follows the beds too.
- **The air lies thicker in a deep** (`fogDeep` in `airHaze`): ground well below the eye is hazed up to 2.3 times as much as ground level with it, from the surface only. A canyon seen from its rim has a far floor.
- **A rock keeps its edges by its vertices, and its foot by measurement** (`world/rock-shapes.js`, `rock-ball.js`, `rocks.js`). Each of the twenty-six shapes stores the way to its nearest arris and the vertex shader moves a vertex onto it, so an 80-triangle ball has corners; each shape's ground line is the lowest level at which it no longer overhangs its own foot. To a man on foot a rock is one of three things: a boulder (40 cm and up, a collider), a stone (never over 22 cm, sunk under his boots), or a plate (wide and low, flush). Rocks cast their shadows from their sunlit faces: cast from the far ones, as three.js does by default, the first centimetres of sand beyond the foot stayed lit.
- **Tried and dropped: finer mesh on steep land from further off.** Tiles holding a wall (relief over a fifth of their width) were split up to 1.6 times further away, to carry the ledges of a canyon wall to a greater distance. The canyon pictures before and after were the same to the eye (`canyon-rim`, `canyon-wall`, `canyon`, `canyon-foot`, `olympus-flows`), for half as many terrain triangles again in memory, so it was taken out. What the far walls lack is not triangles: it is a hard cap-rock edge at the rim and talus under it, which the height model does not make.
- **Near haze is the ground's dust; far haze is the sky.** One sky-pale fog colour at every distance lifted the middle ground to cream and broke the land in two at the first ridge. Haze is tinted toward the ground's dust up to a few hundred metres and reaches the horizon's colour only far off; the density along a line of sight is the exact sum through air that thins with height, so looking down from altitude counts the dust once.
- **Dark ground is grey, not deep red.** The survey's dark regions are basalt sand. They are graded with less saturation and less of the warm tint than the bright dust (`groundGrade`), or they come out maroon and go purple in shade.
- **The launch's column, vent and flame are shapes, not particles** (see above), and the last scene is cut on three stands that share one backdrop; the final shot looks from behind the pair toward the Hermes with the sun on them.
- **Lamps are not true lamps.** A lamp at head height lights the ground at a man's feet a dozen times harder than the ground ten paces on, so a physical fall-off gives a blot at the hip and a dark road. The helmet lamp and the rover's headlamps hardly fall off with distance, are soft from middle to edge, and end at a set reach. The headlamps are wide because the chase camera's own rover hides the ground straight ahead. Lamp light on a model is capped at about sunlit white before the sun is added: the "star" in the dome at night was his own lamp on a white strut a pace away.
- **Stains and pools of light are draped.** A flat patch is cut by rising land along a hard line. Outdoor patches are cut into a grid and each corner set on the ground as drawn (`drape` in `world/build.js`), laid when first needed and again when a site is levelled.
- **The launch's smoke column is one volume, not puffs.** Any number of lit balls is a string of beads from far off. The column is a tube about the rocket's path whose shape is worked out on the graphics card from how long ago the rocket passed each height: it swells, billows, leans, thins as the air does (none above 950 m) and is shaded as one cloud. Puffs remain only for the dust skirt on the ground. The airlock's breath is a cone of vapour of the same kind as the engine's plume.
- **The launch is eight shots.** Pad; far off with the horizon held in the lower fifth (the far camera stands 320 m back); beside the rocket, climbing; ahead of it looking back down over the limb, the engine cutting off at 15.2 s; the Hermes; Beck on the tether; the capsule's open top as he takes hold; the two going back. All three orbit shots look down across the subject from the sunlit side at the same patch of planet, so the line of night stays where it was.
- **Ice is a scarp, not blocks.** The outcrop is a crescent face of dirty layered ice under a mantle of the ground's own soil, with six calved blocks at its foot that the player takes away. The game's ice is frosted (roughness 0.42), a pale blue, with the layers and hollows in vertex colour; polished and dark it was cut glass.
- **The head looks, the chest does not.** A fifth of the camera's tilt used to go into his chest, which stood him rocked back on his heels whenever the camera looked up. Now a twentieth does and the head takes half.
- **What is turned from the sun is in shade.** A model's faces turned from the sun take seven tenths less of the sky's light, and the rim light grows as the sun sinks. A white suit lit alike from every side was the brightest thing in any picture taken into the sun.
- **Haze gathers from the start.** With a squared fall-off alone the ground was clear red to the first ridge and cream beyond it. A linear part is added. The horizon's haze band also reaches a dozen degrees above the line, so boulders standing on a far skyline fade with it.
- **The resolution governor climbs as well as falls.** Late frames can be seen; spare capacity cannot, on a screen locked to its refresh. So after a run of on-time seconds the governor tries one step up, and doubles its wait (to about a minute) each time a step up brings late frames back. Before, the first slow second after loading set the resolution for the whole session.
- **The launch is film: six shots and three effects, and it ends as the book does** (`src/game/launch.js`). The pad close and low as the engine lights and the dust rolls at the lens; the column from 150 m; the climb beside the rocket into a black sky; the rocket leaving; the Hermes over the day-night line, the ascent vehicle hanging short of her, her forward airlock blown to brake and a man coming out of it on a tether; then from above the vehicle's open nose as he reaches it, the two of them over the planet. Nobody flies anything (in the book Martinez flies the vehicle from the Hermes and Watney is cargo; the owner asked). The first version had the ascent stage closing on the docking port, which is neither the book nor the film. The two extra astronauts are the player's model with the helmet on, in the `Air` clip's pose, each hung in a holder so that it turns about its middle. The cameras stand on the sun's side of the pad and are raised over any dune in the way. The flame is three nested shells drawn as volumes (core, flame, a wide plume that spreads as the air thins); the smoke is one set of 1,000 lit sprites (a dust skirt along the ground, and a column laid a puff every few metres of climb, so a slow frame leaves no gaps). For the last shot the clock is moved to put the sun low over the place: nothing reads the clock after it. `node tools/tests/film.mjs [--phone]` photographs the whole strip.
- **Ground seen from height keeps its own sky's light.** Half the daylight on the ground is the sky's, and the renderer takes sky light from the sky where the camera is: above the dust that is black, and the day side of the planet went dim seen from the climb and from orbit. The terrain shader adds the sky light of the place each piece of ground is in (`uSkyLit`, by that place's own sun), scaled by how far the camera is out of the air.
- **The day sky thins by line of sight.** Above the level it thins with the camera's height; below, with the height at which the line passes the planet. So on the climb the sky goes dark from the top down and ends as a bright band on the limb, and stars are hidden wherever the sky behind them is still bright.
- **The horizon's haze is one rule, in the fog.** `airHaze` in `render/engine.js` replaces three.js's fog chunks for every material: density thins with height, and anything seen within a degree or so of the horizon line, more than a hundred metres out, takes extra haze. The rule knows only where a point is seen, so ground, rocks and buildings always agree. The fog object says it is both of three.js's kinds so that the renderer hands every material two numbers: `fogNear` carries the density and `fogFar` the horizon's dip, which `main.js` sets each frame from the camera's height over the ground.

- **A wall is spur, chute and foot.** Steep ground is cut into spurs and gullies by the height model (`_gully` in `planet/height.js`), and the mesh builder gives every vertex how far down in a gully it lies (the attribute `aChute`, one byte). The terrain shader draws a spur as bare bedded rock and a chute as scree with no beds, so a wall is not banded from end to end. Ground between about 22 and 34 degrees that is not in a gully is scree too. Boulders (`scatterRocks` in `terrain/chunk.js`) are placed at a fixed number to the square metre within sixteen metres of land steeper than about 17 degrees, whatever the region's own rock count, and are bigger there: a wall has fallen blocks at its foot.
- **A packed model is unpacked before the dust shader sees it.** Models are stored with whole-number vertices and a node that scales them to metres. Skinning ignores that node, so the astronaut's shader saw positions thousands of units tall and laid no dust near the ground. `mergeSkinned` in `world/models.js` puts the vertices into metres and takes the packing out in the bind matrix.

- **Terrain is real.** Elevation is NASA MOLA (MEGDR, 32 px/deg source) resampled to six
  1024-texel cube faces; colour is the Viking MDIM 2.1 mosaic. Relief is exaggerated 4x (it was
  6x on the old analytic terrain) so volcanoes and canyons read at walking scale without turning
  every crater into a pit. Below about 40 m the surface is procedural (craters, fractal relief,
  dunes), scaled by how rough the real surface is there.
- **What you stand on is what is drawn.** Physics and the terrain workers call the same height
  function; building sites are levelled in that function, not by moving meshes.
- **Level ground uses 2D textures, slopes use 3D ones.** Flat ground is seen at grazing angles
  and only a 2D texture can be filtered anisotropically, so it is laid with two generated
  textures addressed in metres across the cube face. Slopes, face seams and far relief use two
  tiling 64-texel volumes cut by the surface, which cannot smear on a cliff.
- **Only grit is painted on the ground.** Anything bigger than a thumbnail is real geometry:
  painted stones read as flat discs when the sun is low.
- **Rocks, dust and soil take their colour from the ground.** Bare stone is a darker, greyer
  version of the local orbital colour; the dust on hardware and any heap or apron of soil
  (`ground_dust` in a model) is the local ground colour itself, ice included.
- **East is east.** `tangentBasis` in `planet/geo.js` returns true east and north. It used to return
  west and south, and every caller but two had quietly negated them; the two that had not were the
  compass and the map, which read S facing north and showed the sun setting in the "east".
  `tests/sights.mjs` now checks the compass against the pole and the sunset. `frameQuat` and saved
  games are unchanged by the fix.
- **Each terrain square is cut along its own grain.** A grid cut into triangles all one way draws
  any crest that crosses the cut as a row of teeth. Each chunk carries its own triangle list
  (about 14 kB at grid 32), with every square cut along the diagonal whose ends are nearer in
  height. Ledges and lava-flow edges are also never drawn narrower than two to three cells of the
  mesh asking for them: with distance they widen and then melt into the slope.
- **Volcanoes are flow on flow.** On the seven shields (`planet/volcanoes.js`) the height model
  adds lava lobes and leveed channels in coordinates round the summit, so every tongue points
  downhill; the worker hands the shader how near each vertex is to a flow's edge, which is where
  the rubble and most of the boulders lie.
- **Calderas are cut level.** `tools/tests/.cache/calderas.mjs` finds each shield volcano's summit caldera as the
  largest closed hollow in the elevation data (Olympus, Ascraeus, Pavonis and Alba; Arsia's is open to
  the north-east and was placed by eye; Elysium's and Hecates' are a texel or two across and are left).
  Inside a caldera's reach the height model redraws everything below the brim: the low part of the bowl
  is the level floor, and the rest of the fall is gathered into a cliff with a scree foot, standing
  where the bowl's side was, so each pit keeps its true outline. The floor is level enough that the
  shader's "lava that froze level" (dark, cracked into cooling polygons, drifted with dust) covers it.
- **Steep ground is spur and gully.** Where the real surface is steeper than about one in four, the
  height model adds ridged waves whose crests run down the fall line, in patches on a jittered grid,
  each patch with the heading of the fall line at its own middle (taking the heading at every point
  bunched the waves into spikes wherever the fall line turned), in three sizes (150, 56 and 21 m between
  crests). Their height is their horizontal reach times the slope, so a cliff gets buttresses and a
  hillside gets rills. The rock's ledges are laid afterwards, so strata wrap in and out of the gullies.
- **Haze is to scale.** On Mars a clear day's dust dims things by a third over thirty kilometres; at 1:282 that is about a
  hundred metres. The clear-day fog density is 0.0019 (it was 0.0012): a wall four hundred metres off is half lost in
  the air, which is what makes it look far.
- **Haze knows height.** three.js's fog knows only distance. Its shader chunks are replaced, for every
  material at once, with ones that weight the density by the mean of the camera's and the fragment's
  height (scale height 180 world metres): thick looking down into Valles Marineris, thin on Olympus.
- **Out of doors the camera rides over the ground.** Walls shorten its boom; a slope behind the astronaut
  swings it up on the same boom to look down at him, up to twenty degrees to see his boots past a rise,
  further only as the boom also shortens. (It used to zoom in until only his helmet showed.)
- **A rock is a ball with a surface laid over it.** `world/rock-shapes.js` builds, at load, a texture array of
  twenty-six rocks (sixteen until the eighth round's rocks pass: see "A rock keeps its edges" above), each stored as direction → distance and normal (with hollows, face tone and fresh breaks). The
  rock shader pushes a ball's vertices out to that surface and lights each pixel by the stored normal, so a
  boulder of 80 triangles is shaded like one of 1,280, and more shapes cost no more draw calls. Rocks, stones
  and gravel rest on the triangle the terrain mesh draws under them (`meshPoint` in `terrain/chunk.js`), not on
  the height function the mesh only samples. `rocks.js` copies the ground shader's tests for ice and lava: if
  `groundIce` or the lava fields change, its thresholds must follow.
- **The ground is what is drawn.** `surfaceAt` (planet/surface.js) returns the height of the very triangle the finest
  terrain mesh draws under a place (the same `meshPoint` the rocks use), not the height function the mesh
  samples. Physics, the camera, wheels and every placed object use it, so nothing hovers over or sinks into
  the picture, whatever the quality preset's mesh spacing.
- **Two shadow cascades.** three.js's `SunLight` with a split set by hand (10–18 m): a tight map
  around the camera so the astronaut's shadow is a figure, a wide one for the base. Sealed in
  the Hab, the same maps are used for the ceiling lights.
- **Lamps are pooled.** Every lamp in the world is a source; a small pool of real lights is
  handed each frame to the sources nearest the camera.
- **Exposure is metered.** It opens up as the sun sinks, closes when the camera looks into a low
  sun, and eases over about a second like an eye.
- **A sol is eight minutes.** It was 220 seconds, which flipped day and night every two
  minutes and gave a suit tank under three minutes on foot. Rescue moved from Sol 20/45/60 to
  15/25/35, so a mission is about as long in real time; a tank is about six minutes walking.
- **Samples are identified by place, not by chance.** What a bag holds is fixed by its
  coordinates on the real planet, so the catalogue is a reason to travel and a lead in the
  journal means something.
- **Morale never kills.** It changes how fast he works and mends (about a fifth either way),
  so a bad week is felt but cannot end a run by itself. Variety on the plate holds it level;
  a cooked dinner, mail, music, a harvest or a discovery lift it.
- **A bed asks what to plant.** The first planting already offers potatoes, radishes and
  lettuce, with each crop's pace and thirst on the card, so the system explains itself there.
- **Photo mode's looks are in the renderer's final pass**, not CSS filters, so the saved file is
  exactly what is on screen. The shutter redraws one frame at the screen's full resolution
  whatever the quality preset.
- **Comforts are one model.** `hab_comforts.glb` is built in the Hab's own frame with a part for
  each comfort; the game only shows or hides them.
- **The helmet is on the instant the air is in doubt** and comes off about a second after he
  is somewhere he can breathe: the Hab, a greenhouse dome, the rover's cabin.
- **The sol turns at dawn at the colony.** Local clocks elsewhere on the planet differ, as they
  should.
- **Mars gravity is real** (3.72 m/s2). Walk and run are loping gaits made for 5.1 and 9.2 m/s.
- **The rover reaches its listed top speed.** In the first version it could not, so the
  drivetrain upgrades did nothing.
- **A greenhouse is a place.** It levels its site, has walls, a doorway and a door, and is set
  down facing the astronaut; saves keep its bearing.
- **Outputs are committed.** `game.js`, `terrain-worker.js`, `game.css` and `sw.js` are build
  products of `tools/build.mjs`, committed so the game runs from any static host.
