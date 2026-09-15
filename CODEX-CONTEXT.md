# Squnchies — Hush Isles · context for a new agent

Paste this whole file as your opening prompt, or just point the agent at it.
Everything below describes the repo as it stands at the last verified build.

---

## 1. What this is

A **Meta Horizon Creator Competition (Part 2)** entry in the **Tower Defense &
Strategy** category. It is a mobile-web game — a cozy night-time isle defense
where you keep a lighthouse lit against corrupted creatures walking in over a
snowfield.

**The submission is `index.html`.** One self-contained file. Ship-critical
constraints, all currently satisfied — do not break them:

- **No network at all.** No `fetch`, `XMLHttpRequest`, `WebSocket`,
  `importScripts`, `sendBeacon`, no CDN, no analytics. Verified by grep: the
  file contains **zero** matches for any of those. The only absolute URL in the
  file is `http://localhost:8000` inside the "run a local server" help text.
- **No asset files** beyond the vendored Three.js and one font. All art is
  procedural: canvas gradients, Three.js geometry, inline SVG. No PNGs.
- **Relative paths only** — `./vendor/three.module.js`,
  `assets/fonts/Fredoka-Variable.woff2`.
- **Portrait, one thumb.** Pillarboxed column: `width: min(100vw, calc(100dvh * 0.58))`.
- **Readable source.** ~5,100 lines, ~500 of them comments, no line over 400
  characters. The judges read the file; keep the commentary voice.
- **A full playthrough runs ~4 minutes** (measured 242s), inside the 5-minute
  guidance.

## 2. Files

| path | what it is |
|---|---|
| `index.html` | **THE SUBMISSION.** ~5,100 lines. Everything. |
| `vendor/three.module.js` + `three.core.js` | Three.js r0.180.0, vendored. Two files — the module imports the core. |
| `assets/fonts/Fredoka-Variable.woff2` + `OFL.txt` | the only asset files |
| `Squnchies-submission.zip` | 486 KB, 8 entries: `index.html` + `vendor/` + `assets/`. **Rebuild only when asked.** |
| `lane.html` | an earlier lane-defense prototype. Kept and playable, **excluded from the zip**. |
| `serve.js` | dev server on **port 8642**. Not in the zip. |
| `buildlog.md` | 77 KB running log, one entry per change. **Append to it.** |
| `Squnchies-Design-Intent.docx` | competition doc, 488/500 words |
| `docs/` | design docs from before the build |

Run it: `node serve.js` then open `http://localhost:8642`.
It **must** be served — ES modules will not load over `file://`. The page
detects that and swaps the blurb for instructions instead of showing a dead
button.

## 3. The game in one paragraph

Three squishy defenders hold a lighthouse. Corrupted Squnchies ("Murks") walk in
out of the winter wood across the snow, leaving footprints that fade, and try to
drown the lamp in glowing ink. You fight with light. **Squishing is the attack** —
swipe across a Squnchie and it throws its light immediately; press, hold to charge
a ring (blue → gold → pulsing gold), release to fire much harder. Glow buys
**size, not numbers**: each squad is one Squnchie growing **Base → Pro → Max**,
bigger and tougher with more reach and more bolts. Each isle ends with a boss;
beating it **converts the boss into a playable ally** who joins your line for the
rest of the voyage.

Three isles, **three waves each — easy, medium, boss**:

| isle | name | boss | ally won | ordinary enemies wear |
|---|---|---|---|---|
| 1 | Hush Isle | **The Swirl** (soft-serve) | Swirl | cones |
| 2 | Frostpin Shoal | **Teddy** (gummy bear, red) | Teddy | bears |
| 3 | The Three Lanterns | **The Mewl** (cat) | Mewl | cats |

Two more isles are **shelved** in `SHELVED_LEVELS`, reachable only as dev isles
4 and 5. They are kept deliberately — do not delete them.

The six characters: **Blox** (blue cube), **Halo** (mint sphere + ring),
**Sparky** (yellow drop) are the starters; **Swirl**, **Teddy**, **Mewl** are won.

## 4. Architecture

Sections are numbered in a banner comment at the top of the file and again at
each section:

```
1. CONFIG    (l.787)   palette, squads, enemies, nodes, waves, tuning
2. AUDIO     (l.1245)  procedural WebAudio, zero sound files
3. HAPTICS   (l.1341)
4. SCENE     (l.1352)  renderer, portrait camera, night sky, snowfield, wood
5. ISLAND    (l.1540)  terrain built from the tactical nodes, lighthouse, props
6. FACTORIES (l.1915)  friends, Murks, the sled
7. EFFECTS   (l.2327)  lobbed light, ink, bursts, beams, ripples, floaters
8. GAME STATE(l.2820)
9. ENTITIES  (l.2859)  Squad / Unit / Enemy / Band
10. WAVES    (l.3819)  bands, escalation, victory / defeat
11. INPUT    (l.4068)  the gesture state machine
12. HUD      (l.4280)
13. MAIN LOOP(l.4941)
```

Things worth knowing before you touch anything:

- **Tactics run on a node graph, not a grid.** Zones are graph nodes with
  explicit links; `findPath` is a BFS over them. Terrain, stairs and props are
  *built around* the nodes and are decorative — moving a rock changes nothing.
- **`Level.load` re-centres a copy** of the level data. Live nodes and raw
  plateau data are in different coordinate frames. When you compare them, take
  both from `I.LEVEL`, not one from each.
- **Specials are data-driven**, dispatched on an explicit `kind` field via
  `castSpecial(pot, size, dur, mini)`. Each carries its own `hue`/`hue2`, so
  colour lives with the character rather than in the effect code. This matters:
  the ring blast is shared by Blox and the converted Mewl, so hard-coding a
  colour in the effect would tint the cat too.
- **Difficulty belongs to a slot, not a character.** Boss ink is set by whether
  it comes first / middle / last, and is never multiplied by `enemyScale`.
  Reordering the bosses means re-pointing those numbers.
- `buildShape(shape, s, mat, dark)` is the single body builder — cube, loaf,
  drop, cat, cone, bear.
- The 780-tree forest is one `InstancedMesh` — 2 draw calls.
- Meters above heads are billboarded via an inverse world quaternion (`_barQ`).
  Colour language, kept consistent: **purple = visitor's ink**, **coral =
  friend being worn down**, **mint→gold = friend recovering**.

## 5. Dev mode

`http://localhost:8642/index.html?dev` — panel with 3x speed, hurt-lighthouse,
instant-win, and isle jumps 1–3 plus shelved 4–5. `serve.js` also redirects
`/index.html/dev` and `/index.html/dev/3` to the query form.

**The dev panel currently ships in the submission.** That was a deliberate
"keep it for now" call and is a one-line removal if you decide against it.

## 6. How to verify changes — read this before "it looks fine"

There is a hard-won methodology here. Please keep using it.

**A debug handle drives headless playtests.** `window.__isle` exposes `S`,
`squads`, `enemies`, `Game`, `Level`, `Voyage`, `tick`, `findPath`, `nodePos`,
`TUNE`, `LEVELS`, `SHELVED_LEVELS`, `ALL_LEVELS`, `SQUAD_TYPES`, `ENEMY_TYPES`,
`ERA_SHAPE`, the `TIER_*` tables, and `jumpToIsle`. `tick(dt)` is extracted from
the raf loop so a script can run a whole campaign in seconds.

Three traps that have each cost a session:

1. **The dev block runs before the handle is built.** Always `typeof window.__isle`
   first. A bare `window.__isle.x = ...` throws at module-evaluation time and
   silently kills everything after it — the page still *looks* fine.
2. **Put early-break checks ABOVE any `continue`.** A break that sits after
   `if (S.phase !== 'play') continue;` is unreachable the moment the phase
   leaves `play`, so every run burns the full budget and a finished game looks
   like a stall.
3. **Isle-to-isle transitions use a real `setTimeout(1900)`**, not the sim
   clock. A purely synchronous loop can never leave isle 1. Yield
   (`await new Promise(r => setTimeout(r, 0))`) every simulated second.

**Encode geometric rules as invariants and run them in the live page.** There is
a set that checks coast clearance, node spacing, lamp spacing, link mutuality,
reachability, terrace containment, lip clearance and stair direction across all
five isles. When a player reports one instance of a geometric bug, write the
rule — the one reported wrong-way staircase turned out to be five.

**Sample, don't single-run.** The finale genuinely loses about 1 run in 10 even
for an optimal bot; that is the tension it is meant to have. Two losses in a row
after a visual-only change is variance, not a regression. Before re-tuning, ask
whether the change could even *reach* the simulation — colours, SVG and names
cannot.

**Balance floor:** a campaign must be winnable when squishing, and must *not* be
winnable without ever squishing. That property is what the whole design rests on.
Check both directions after any balance change.

### A trap that has cost two sessions

**Never splice the stylesheet by comment banner.** Editing CSS by slicing from
one `/* ── section ── */` to the next has twice removed far more than intended
— once taking the whole chip stylesheet, once the `#ring`, `#floaters`,
`#banner` and `.edgedot` families with it. Nothing catches it: the JS still
parses, the page still boots, and the damage is invisible except where the
missing rule was doing visible work.

After ANY structural stylesheet edit, run the cheap guard: parse the top-level
rule blocks out of the file and diff the selector sets against the version
before the edit. It takes seconds and catches the whole class of error at once.

**Diff against the pre-edit file, not against the zip.** Diffing against the
`index.html` inside `Squnchies-submission.zip` has a blind spot: the archive
predates anything added since it was packaged, so recently added rules look
like they were never there. A missing `.chip.ready` glow survived exactly that
way — the class was still being toggled in JS and still named in the
reduced-motion block, with no rule left to draw it.

## 7. Last verified state

Clean-room run against the **unzipped** archive (unzip to an empty folder, serve
*that*, start from the real "Light the beacon" button):

- Full campaign **won at 242s of play**; bosses at 56s / 139s / 222s
- Final roster all six: `Blox:Max, Halo:Max, Sparky:Max, Swirl:Pro, Teddy:Pro, Mewl:Pro`
- End screen: "The voyage is done" — 59 rescued, 33% light, 3 waves
- Zero thrown errors; four network requests, all localhost
- Packaged `index.html` is byte-identical to the working copy (same SHA-256)

One benign console note: Chrome logs "Blocked call to navigator.vibrate" during
*scripted* runs, because vibration needs a trusted user gesture. `buzz()` is
guarded and try/caught, so nothing throws; a real player's first tap clears it,
and iOS Safari has no vibration API at all.

## 8. Open items

- **Playtest with a real person on a real phone.** The only thing never done.
  The competition guidance explicitly asks for it. Everything verified so far is
  instrumented rather than felt.
- **Portrait-layout deviation** — the guidance suggests a vertical lane; this
  uses a rotatable island. Deliberate, unresolved.
- **Ship the `?dev` panel or not** — currently yes, "for now".
- **Teddy is red but its Roar still rings in mint** — the last colour mismatch
  in the build.

## 9. House style

- Match the existing comment density and voice. Comments explain *why*, in plain
  language, often with the reasoning that led to the number.
- Keep the palette in `PAL` / CSS variables; do not hard-code hexes in logic.
- Append a `buildlog.md` entry for every change: what changed, why, what was
  verified with actual numbers, and what you learned. Entries are numbered
  ("Twentieth follow-up: …").
- **Do not rebuild the zip unless asked.** The owner rebuilds at the end.
