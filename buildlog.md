# Build Log: Squnchies
Genre: Tower Defense & Strategy

## Decisions locked so far
- Core loop: read the incoming wave → spend Squish to place/upgrade squishy toys → the board auto-squishes on its own gentle rhythm → press-and-hold a toy to charge a big squish, release on the wobble peak for a PERFECT → wave resolves, breathe, repeat. Ten waves, then the Tangle boss.
- Genre floor: placeable defenses with distinct roles, escalating waves, a spend-or-upgrade economy that stays scarce. All three present.
- Signature mechanic: towers are fidget toys you physically squeeze. Charged squishes always land in full; Knots and the boss shrug off 50% of automatic damage ("tapArmor"), so squeezing is the strategy, not decoration.
- Controls: everything is tap or press-and-hold, one-handed, portrait. Quick tap = select/upgrade; hold = squeeze.
- Scope: one Room (Bedroom Shelf), 3 toys (Squisher / Splatter / Boinger, 3 tiers each), 3 snarls (Jitter / Knot / Spark) + Tangle boss, 10 authored waves, Calm meter → Hush Pulse ultimate, win/lose/replay. Phase-2 content (more Rooms, Stretcher/Glommer, Prickler, Shelf collection, Fidget Mode) deliberately cut.
- Tech: all game code in one readable, unminified index.html, developed directly in that file (no build step, so no stale-build risk). Three.js r0.180.0 vendored locally in vendor/ (two ES-module files) via an import map. One bundled 30 KB Fredoka variable font (SIL OFL). All sound synthesized at runtime with WebAudio — zero audio files, zero network requests.
- Portrait handling: the game renders in a portrait column that pillarboxes on wide screens; the camera keeps a constant horizontal field of view so the board width fits every phone aspect.
- Difficulty philosophy (from the original GDD): gentle stakes. A tutorial-following newcomer should win while feeling competent; ignoring the squeeze should lose late; full AFK should lose early.
- Art: warm-light-in-a-dark-room palette from the pre-production Visual Concept Package; glossy gel heroes with calm faces vs spiky, jittery, coral snarls. Clear first, pretty second.

## Session 1 (2026-09-04, sitting 1): constraints, scaffold, full vertical slice
Tool(s): Claude Code (Anthropic's agentic coding tool), which also maintained this log.
What I built: gave the AI the full contest constraints (portrait, single-player, offline, single index.html, vendor/ folder, 35 MB) in the very first prompt, before any code. It vendored Three.js (discovering modern Three.js ships as two module files that had to be wired with a relative import map), bundled the font, then generated the entire vertical slice in one pass: squeeze mechanic with charge ring and wobble timing, 3 towers, 3 snarls + boss, 10 waves, economy, Calm meter/Hush Pulse, tutorial cold open, win/lose.
Key decisions: develop directly in index.html rather than source files plus a bundler; synthesize all audio in WebAudio instead of shipping files; encode all tuning (towers, snarls, waves, economy) as data tables at the top of the file for fast retuning.
Biggest problem: before first launch, a code self-review caught four real bugs the generation had introduced — a crash from a variable used before declaration, lane segments mirrored across the path tangent, enemy HP bars billboarding wrongly, and no fat-finger hit targets on placement pads. Fixed all four before running.
What I learned: reviewing generated code before trusting it catches whole classes of bugs cheaply — the "don't trust done" advice applies even to the first run.
Where things stand / next: game boots from a local server with no console errors. Next: look at it properly.

## Session 2 (2026-09-04, sitting 1): legibility pass
Tool(s): Claude Code.
What I built: no new systems — a lighting and readability pass driven by screenshots at phone size (375×812).
What changed after playtesting: the first screenshot failed the "read the board at a glance" bar badly. The shelf was near-black, pads illegible, and the lamp blew out to white. Switched to a hemisphere light, brightened shelf/lane/pad materials, pushed the fog back, tamed the bulb.
Biggest problems: two placement pads sat directly ON the lane (the AI had eyeballed coordinates); fixed by numerically sampling the actual Catmull-Rom curve and re-placing all ten pads at least 1.35 units off the centerline — four pocket pads inside the S-bends, six outer ones, which also made placement a real decision. And the toys' faces were invisible because the eyes were positioned inside the gel spheres; reworked the face builder to sit flattened eye-dots on each body's front surface.
What I learned: verify visually at real device size early — geometry that sounds right in code can be unreadable or simply wrong on screen.
Where things stand / next: board, toys, snarls and HUD all read at a glance. Next: does the game actually play?

## Session 3 (2026-09-04, sitting 1): automated playtests and the balance pivot
Tool(s): Claude Code.
What I built: a headless test harness — refactored the main loop to expose a pure tick(dt) step, then scripted full-session player profiles through the real input paths: an engaged squeezer, a shopper who never squeezes, and an AFK player.
Biggest problem (and the pivot that mattered): the never-squeeze player won flawlessly — the signature mechanic was strategically irrelevant, exactly the failure the original production plan warned about. Pivoted the combat model using the GDD's own language ("a Knot soaks up taps, so it wants a charged squish"): cut auto damage ~35%, added tapArmor (Knots and the boss shrug off half of auto damage, charged always lands full, with a bright blink when a tap is shrugged), meaner waves 7–10, +9%/wave HP scaling.
What changed after playtesting: post-pivot results — AFK loses at wave 3, never-squeeze bleeds 10→2 light by wave 9 and loses to the boss, engaged squeezer wins. A full night runs about six minutes.
What I learned: automated playtests through the real game code find balance truths a designer's eyeball never will; "it feels fine" hid a dead mechanic.
Where things stand / next: the loop is fun-shaped and the squeeze matters. Next: verify every interaction end-to-end and package.

## Session 4 (2026-09-04, sitting 1): interaction verification, first-wave feel, packaging
Tool(s): Claude Code.
What I built: end-to-end verification by dispatching genuine pointer events — tutorial squeeze, tray select → glowing pad placement, tap-to-upgrade panel (costs, disable states), hurry pill, charge ring tracking, Hush Pulse, win and lose screens, full replay reset. Then packaging: zip with index.html at top level, vendor/, assets/ (452 KB total), unzipped into a clean folder, served, and played — the competition's own validation steps. Network log showed exactly four requests, all local.
What changed after playtesting: the clean-room run surfaced a first-wave harshness — a hesitant player with only the free starter toy could leak 2 lights on wave 1. Moved the placement lesson to BEFORE wave 1 (toast + pulsing tray + a visible 9-second countdown), softened Jitters slightly, and lengthened the replay setup window to 8 seconds.
What I learned: the on-ramp needs the same testing rigor as the difficulty curve; "gentle" is a tuning target, not a vibe.
Where things stand / next: submission zip validated. Next: real-device playtest and the official document templates.

## Session 5 (2026-09-04, sitting 2): first human playtest finding, official templates
Tool(s): Claude Code.
What changed after playtesting: the first human test hit a wall before the game even started — index.html was opened by double-click, the title screen (plain HTML) rendered perfectly, and the Play button did nothing, because browsers block ES modules over file://. The game itself was fine; the failure was silent and confusing. Added a plain-script guard: if the engine hasn't booted shortly after load, the title screen swaps in instructions to run a local web server (and says so explicitly when it detects file://). Judges serve the build properly and will never see it.
What I built: the guard above; converted the design-intent draft into the official 7-section template as .docx; restructured this log from a narrative "passes" format into the official buildlog.md format (locked decisions + session entries).
What I learned: the gap between "works when served" and "works when a human opens it the obvious way" is a real playtest finding — fail loudly and helpfully, not silently.
Where things stand / next: build, buildlog.md, and design-intent .docx ready. Next: playtest on a real phone (squeeze feel, charge timing), then submit.
