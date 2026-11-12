# Stranded II — quality bar and open items

This file is the bar the game is held to, what has been measured against it, and what is still
open. A session that changes the game updates it. "Measured" always says how: a number from
headless Chromium with software rendering (SwiftShader) is not a real frame rate.

## How to check

```
cd tools && npm ci
node build.mjs              # bundle src/ -> game.js, terrain-worker.js, game.css, sw.js
node lint.mjs               # undefined names, bad imports
node tests/run.mjs          # smoke, interface, story arc, saves, science, machines, farm, photo, sights, audio wiring
node tests/first-ten.mjs    # the first ten minutes on a phone, as numbered screenshots (--desktop)
node tests/audio.mjs        # 129 offline audio renders measured for loudness and clicks (5 min)
node tests/perf.mjs         # draw calls and triangles per frame against the budgets below
node tests/shots.mjs        # screenshot matrix -> tools/tests/.cache/shots/   (--only a,b for some)
node tests/ui-shots.mjs     # every interface state at every size -> tools/tests/.cache/ui/
node serve.mjs              # play at http://127.0.0.1:8765/  (?q=low|medium|high|ultra)
node publish.mjs "what changed"            # build, lint, test, then publish to gh-pages
node publish.mjs --to next "what changed"  # ... into gh-pages/next/, beside the live game
```

The debug hook `window.__MG` (see `src/main.js`) can start a game at any site, teleport, set
the local time and the weather, step the simulation without drawing, and place a free camera
(`photo`) for pictures.

## The bar

| Area | Bar | State |
| --- | --- | --- |
| Frame rate | 60 fps on a mid-range laptop at "high"; 30 fps on a recent iPhone at "low" | **Not measured on a real GPU.** Software rendering gives 0.4–12 fps, which says nothing. Dynamic resolution (55 fps target) and four quality presets are in place. Needs a number from the owner's phone and a laptop: the diagnostics panel (four taps top-left, or F3) reports it with a COPY button |
| Scene cost | Per frame (`tests/perf.mjs`). "low": 180 draw calls, 340k triangles in the picture, 230k in the shadow passes. "high": 290 / 600k / 400k. These budgets are estimates, not derived from hardware: they exist to catch regressions until a real frame rate is known | Measured (counts, valid on any machine). low: 62–180 calls, 123–306k picture, 47–221k shadow. high: 75–226, 123–461k, 134–309k. "low" outside the Hab sits exactly on its call budget (180): 75 of those calls are shadow passes for the Hab, rover, array and astronaut |
| Load | Title screen interactive in under 5 s on a 20 Mbit connection; total download under 14 MB; works offline after first load | 13.0 MB precached (52 files); `game.js` is 1.09 MB. Headless load to title: 1.2–5.5 s from localhost. Not measured on a phone network |
| Console | Zero errors or warnings in a full playthrough | Zero errors in every test and screenshot run |
| Story arc | Every step from the crash to the rescue works | 23/23 scripted checks (`tests/arc.mjs`) |
| Systems | Every system does what it says | Science 16/16, equipment wear 8/8, farm, meals, morale and comforts 8/8, photo mode 9/9, sights, moons and compass 9/9, audio wiring 26/26 |
| Saves | Old saves load or the player is told plainly why not | Format 4. Version-2 and version-3 saves migrate (terrain re-seated, sol count converted to the longer sols) and the player is told (tested). A format-4 save from before the pantry existed loads with a fresh pantry and morale (tested). Unreadable saves are reported on the title screen (tested) |
| Picture: day | Reads as Mars at a glance: butterscotch sky paler at the horizon, sunlit regolith with rocks, hard shadows, haze with distance | Round 4: NEARLY. Reads as Mars with hard shadows; the midday sky is flat khaki and the frame bleaches toward the sun (V8) |
| Picture: dawn and dusk | Low sun, long shadows, the blue glow around the sun, readable ground | Round 4: **MET** |
| Picture: night | Stars, readable silhouette of the ground, helmet lamps and rover headlights light the way, Hab windows glow | Round 4: NEARLY. Open-plain night is right; the base is still over-lit and the greenhouse whites out (V6) |
| Picture: dust storm | Visibility collapses, the sun dims to a disc, dust streams past, it is audibly and visibly dangerous | Round 4: NEARLY. Visibility collapses and the sun is a disc; the dust has no mass (V9) |
| Picture: poles | Ice caps look like ice, no artefacts at the poles | Round 4: NOT MET. No artefact at the pole; the ice reads as cracked plaster (V4) |
| Picture: orbit | The title screen and the launch show a real globe with a thin atmosphere | Round 4: NEARLY. A recognisable Mars; the atmosphere is a thick cream outline (V12) |
| Models | Every object is a purpose-built model; nothing reads as a primitive | 37 models. Lander and prop pass after the review: Perseverance has its own model, solar cells are consistent, the wreck, airbags, parachute, soil heap, ice and uplink dish are rebuilt, the greenhouse has a door. Second review owed |
| Animation | The astronaut never slides, pops or T-poses; every action has a pose | Twelve clips blended. Idle rebuilt as a relaxed stand (8 s); he takes his helmet off where there is air. Not yet reviewed in motion; feet dip up to 4 cm in cross-fades |
| First ten minutes | A new player always knows what to do next and why, without reading a wall of text | Second independent review: NEARLY. The cold open, the staged buttons and the premise card work; the objective order contradicts the premise, the bars are not explained, and several numbers disagree (W7–W10) |
| Interface | Every screen is legible and unclipped at 1280x720 through 2560x1440 and at phone sizes under the notch and status bar; touch has a pause button | Second independent review: desktop NEARLY, phone NOT MET (overlaps on the phone HUD, 9 px labels, targets of 34–42 px, half of Settings hidden; W1–W20 below). 96/96 automated checks pass: they test overlap between the things they know about and safe areas, not legibility |
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
| T1 | Landmarks do not read: Valles Marineris from above is a striped bank with no rim or drop in frame; Olympus is a rippled dune (`canyon`, `olympus`) | acted on: the matrix has a rim view and a wall view of the north wall of Valles Marineris at 296 E (a hundred metres of layered cliff). The seven shield volcanoes now carry lava: three sizes of flow lobe lying on one another, leveed channels, dark rubble and boulders along each flow's edge, no ripple fields. New scenes `olympus-caldera` (the summit caldera from its south rim) and `olympus-flows`. To re-review |
| T2 | Polar ice is matte white cracked plaster with tan shadows; the outcrop is two smooth bars (`north-pole`, `pole-90`, `ice`) | acted on: bluer ice that is blue in its shadows; the outcrop rebuilt as six fractured, tilted blocks with rubble. To re-review |
| T3 | Zigzag chevrons in rows on a far hillside (`lander-curiosity`); specks and a scalloped ledge on the canyon wall | acted on: band edges wobble at a scale finer than a far mesh's triangles and merge sooner with distance. The rows of teeth along cliff edges had a second cause, now fixed: every square of the terrain grid was cut into triangles the same way, so any crest crossing that cut came out jagged. Each square is now cut along the diagonal whose ends are nearer in height, and a ledge's riser is an S-curve at least three cells wide. To re-review |
| T4 | At night the Hab, rover and astronaut look floodlit by ambient; porch and parked-rover lamps make no pool; the greenhouse is a white starburst | acted on: a ceiling on what reaches the bloom, less night fill, porch lamps that pool on the ground, gentler dome lamps, lower night exposure. To re-review |
| T5 | Exposure and colour spread: pale peach at noon and toward the sun, deep rust elsewhere; `day-sun` is beige | acted on: the glow round the sun is about a third as strong, the bloom is weaker and starts higher, and the meter closes further at high sun. To re-review |
| T6 | The nearest metres are a soft blur at high sun | acted on: the sand and near-grain textures carry more tone contrast, so ripples and grit hold when the sun is overhead. To re-review |
| T7 | Rocks are one family of flat faceted slabs, near-black in places; few mid-size boulders; one floats (`debris-c`) | acted on: blockier rocks, less dark, more mid-size boulders; rocks and physics now rest on the ground the current quality draws (they used finer detail than low and medium meshes show, which floated some). To re-review |
| T8 | The storm has no motion or threat; a straight band survives | acted on: 2,800 wind streaks (1,100 on low quality) that lengthen with the storm, fine and short near the eye so a still does not show bars; more dust sheets. Motion can only be judged on a real device. To re-review |
| T9 | A row of pale soft discs across the mid-ground (`pod`, `pod-open`) | fixed: the storm's sheets are drawn only in a storm |
| T10 | Nothing touches the ground: no churned soil at the Hab, landers or greenhouse | acted on: the patches of packed soil are twice as strong and wider; soil aprons (the heap, the wreck's scorch, the ice berm) fade out where they meet the ground and have no sheen, so no edge shows. To re-review |
| T11 | The astronaut is pitched forward with bent knees in side views; tilted in one picture | acted on: the idle clip is rewritten from knee angles (knees 5 and 7 degrees, were 13 and 26; elbows 10 and 12, were 22 and 32; hands beside the thighs; trunk 1.6 degrees forward), and the game's own torso correction, which tipped him back, is gone. To re-review |
| T12 | Blown emitters: the nav beacon in daylight, a workbench lamp, glare blobs at the frame edge | acted on: the same ceiling before the bloom. To re-review |

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

## Open items

| # | Item | State |
| --- | --- | --- |
| 3 | Act on the round-2 picture findings (R1–R17 above), bugs first; then a third review | in progress |
| 18 | Act on the interface and onboarding review (U1–U17, O1–O7 above), the pause screen and the phone HUD first | next |
| 12 | Publish to `gh-pages` | **Preview refreshed** at `gh-pages/next/` after the second review round (the first game is still at the root). Replace the root once the preview has been seen running on the owner's phone |
| 10 | Frame rate on a real phone and laptop (needs the owner's devices or a GPU runner) | blocked on hardware |
| 11 | WebKit/iOS check: cannot be run here (only Chromium is installed) | blocked on hardware |
| 15 | Listen to the audio on real speakers and a phone; retune by ear | blocked on a listener |
| 8 | Play the first ten minutes as a new player at phone size; fix what confuses | open |
| 17 | More depth: uses for a second greenhouse; visiting landers could do more than salvage | part done: **sights**, eleven things to stop and watch (Phobos, Phobos going out in the planet's shadow, Deimos, the Earth in the evening, a blue sunset, sunrise, the Milky Way, a dust devil close to, the inside of a storm, the midnight sun, the sky above the weather on a volcano's summit). Each is logged once after a couple of seconds' looking, earns science credit and morale, and is listed in the journal with a hint until seen. Landers and the second greenhouse still open |
| 13 | Shadow cost at the base: the rover (45k triangles) and Hab are drawn into both cascades; "low" is on its call budget there | open (simplified shadow models would halve it) |
| 5 | Sky from orbit: thinner limb haze; Phobos and Deimos | part done: both moons are in the sky on their real periods (Phobos rises in the west and crosses twice a sol; Deimos drifts the other way over days), lit by the sun so they show a phase, put out by Mars's shadow, and seen from where you stand. Drawn four times their true size, or they are a star and less than a star on a screen. Limb haze still open |
| 6 | More variety between regions (dark basalt plains, bright dust, dune fields) | open |
| 19 | Astronaut: feet dip up to 4 cm when clips cross-fade; JumpStart, Land, Wave and Collapse still start from the old bent-knee stance, and WorkStand has the same bent knees and an 11 degree forward lean; going from standing to kneeling the left hand passes through the knee pad for under a tenth of a second (the fade is shortened to 0.18 s; a short kneel-down clip is the proper fix); the face is plain under a metre | open |
| 20 | Wreck blast patch still reads as a smooth mound at its rim; Pathfinder's airbags are faceted up close | open |
| 14 | Asset tooling: fold the helpers the model scripts each copied into `tools/assets/lib.py` | open |

## Decisions worth knowing

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
