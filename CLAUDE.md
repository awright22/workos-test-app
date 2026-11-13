# Stranded II: project instructions

This repository holds two things. Most of it is a small WorkOS SSO example app (`app.py`,
`templates/login*.html`, `static/login.css`). The part you work on is **Stranded II**, a browser
3D survival game. It lives in `static/martian/` (`game.js`, the vendored `three.min.js`, the PWA
files), `templates/martian.html`, the `/martian*` routes in `app.py`, and `tools/build_assets.py`
(the headless-Blender asset build). `static/martian/README.md` describes the game as it stands.

## What the game is
The owner asked for "a browser based version of the Martian movie. It should be three d. ...
you're stranded on Mars and have to do what they did in the Martian until you get rescued."
These points are the game, and they stay:
1. The Martian's story as a 3D browser game. You are stranded on Mars and survive the way the
   film's astronaut does (the Hab, growing potatoes, making water, reaching Pathfinder to talk
   to Earth, the long drive to the ascent vehicle at Schiaparelli) until you are rescued.
2. "Feature rich on par with Stardew Valley or Animal Crossing ... a super complete survival
   game": real depth and breadth of systems and things to do, not a short demo.
3. Real Mars. It is geographically correct from real maps of Mars, the planet is a sphere you
   can explore entirely, and you start at a random place on it.
4. Real 3D assets (built in Blender, or of that quality), a third-person astronaut you can see
   whole, and animations for the things he does.
5. It plays on a phone as an installable PWA, as well as on a desktop.

The owner's latest ask: "Get this to AAA quality." That means a game that looks, sounds, plays
and holds together like a polished commercial release, on a desktop and on a phone. There is no
deadline. Take the time to do it properly.

Direction the owner has given since, in the owner's words:
- The phone comes first. "Desktop is a bonus but I think this should be optimized for my iphone
  (probably landscape?)". The iPhone held sideways is the machine the game is made for and judged
  on. The desktop must keep working, and comes second.
- Two modes. "you can either play through the books storyline" (Story mode: the game as it
  stands, ending in rescue) or "build a base you start basically at the beginning of the book but
  can build a whole mars base (lots more resources things to build etc)": "a build-a-base mode
  where you never get rescued", "sorta like valheim-style game (but no enemies I guess)".
- The order. "Finish the storyline mode first though." Base mode is not started until Story mode
  meets its bar.

## What is yours
This codebase is yours: what it's for and how it's built are your call, and you'll keep building
on it. Within the five points above you have full authority over design, art direction, systems,
balance, UI, audio, controls, code structure and tooling. You may rewrite, restructure or
redesign anything: change the three.js version, split `game.js` into modules, add a build step
or a test harness, or replace the analytic terrain with real elevation data (NASA's MOLA and
similar public-domain Mars data may be used, sized to load on a phone). Merge duplicated code
when you meet it, and fix what you find on the way. The owner would rather see a bold, finished
redesign than a cautious patch.

## Where it runs
- The live game is the `gh-pages` branch (GitHub Pages). It holds a copy of `static/martian/`,
  and the owner plays it from there on a phone. Publishing to it is part of the work. Publish a
  build once it passes its checks (below), and bump the service-worker cache version each time,
  so that installed copies pick up the new build. Earlier builds stay recoverable in the
  branch's history.
- It also runs from the Flask route `/martian` and as plain static files, and it works offline
  once loaded.
- `game.js` in the repository is now the source. The part files an earlier session built it from
  are gone. Keep any build step you add in the repository, under `tools/`.

## Constraints that stay
- Assets may be procedural, authored in Blender through `tools/build_assets.py`, or third-party
  where the licence allows redistribution. Credit third-party assets and data in
  `static/martian/CREDITS.md`.
- Players keep saves in their browsers. When a change breaks the save format, migrate old saves.
  Where that is not possible, tell the player plainly on load that the save is from an older
  version.
- Leave the WorkOS app alone apart from the `/martian*` routes. Never open, print or commit
  `.env`, or any key or secret.

## Approvals
Work without asking. None of these need approval: edits, rewrites, deleting or replacing files in
the game's own paths, commits, pushes, pull requests, merging your work into `main`, publishing a
build that passes its checks to `gh-pages`, installing development tools, and retrying after
errors, timeouts or flaky tools. Ask the owner first only for two things: a change to one of the
five points above, and changes outside the game's own paths. Keep the platform's own confirmation
step for destructive or irreversible operations.

## Finishing work
Please avoid stopping while you still owe work toward the goal. Status notes are welcome, and so
is a question to the owner on an open decision, but carry on with the work that does not depend
on the answer. If you notice yourself offering to wait or inviting the owner to redirect you, go
on to the next part of the work instead. Ordinary obstacles (errors, timeouts, locked files,
empty results, failing tools) are diagnosed and worked through: wait and retry, fix the request,
or use another tool. A deliberate blocker (access that was withheld on purpose, a safety
guardrail) is left alone: say plainly what you found and look for another safe way forward.

## How to know it is good
AAA is judged from the running game, not from the code.
- Play it. Chromium and Playwright are installed in cloud sessions. Drive the real game in a
  browser, desktop size and phone size with touch, capture screenshots and short sequences, and
  look at them before you call anything better. Build a debug hook or a scripted playthrough so
  you can reach any place, time of day and game state on demand.
- Write down a bar for each area in `static/martian/QUALITY.md`, and measure against it. The bar
  covers at least: frame rate (60 fps on a mid-range laptop, 30 fps on a recent iPhone; a number
  measured with headless software rendering is far slower than a real GPU, so say which you
  measured), load time, zero console errors, the picture at dawn, noon, dusk and night, in a
  dust storm and at the poles, the first ten minutes of a new player, every screen at phone width
  under the iPhone's status bar and notch, and save and load.
- Your own look at your own picture is a weak check. For a visual or feel change, give a reviewer
  subagent the screenshots and the bar, not your conclusion, and act on what it finds.
- Keep the open items in `QUALITY.md`, each with its state, so the next session starts where you
  stopped.

## Subagents
Delegate when the work splits into independent parts, such as an art pass beside a systems pass,
or a review of screenshots. Each subagent costs a full context of its own, so do small things
yourself. Brief each one with the goal, the files and the bar, because it sees nothing of this
session.

## Communicating clearly
The owner usually follows from a phone and reads your messages between other things. Before a
long piece of work, say in a line what you are about to do. Give a one-line update every so
often. Close each piece of work with a short recap that stands on its own: what changed, what
you saw when you played it, what the owner can try on the phone now, and what comes next. Write
for an intelligent reader who has not seen your tool calls or files. Put the key point first, use
plain words and full sentences, and never use a name you invented during the work without saying
what it is. Attach screenshots when a change is visual.
