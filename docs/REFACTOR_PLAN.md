# PLAYYS: Code Analysis and Refactor Plan

Written 2026-10-12, after the kiosk flow, command center, sharing and music were all working. The goal of the refactor is **clean code that is small, obvious and tested, with no junk and no behaviour change**.

**Status: planning only.** Nothing in this plan has been started. The decisions in section 6 were answered on 2026-10-12 and are built into the plan below.

## 1. Principles

1. **No behaviour change.** A refactor step is finished only when the kiosk looks and works exactly as before. New features wait.
2. **Safety net first.** Tests and screenshot checks come before any big move.
3. **Small functions, one job each.** A function that needs "and" in its name is two functions. Components over about 150 lines are split.
4. **One way to do each thing.** Fetching a setting, uploading a file, validating a colour and showing an error each have exactly one implementation.
5. **Delete, do not comment out.** Git remembers. Anything unused is removed.
6. **Names say what a thing is.** No `handle2`, no `Magical...`, no page-specific names on shared parts (`head-title` is used by every page).
7. **Every step is its own commit** that builds, type-checks and passes the tests.

## 2. Snapshot

| Measure | Now |
|---|---|
| TypeScript/TSX in `src` | about 10,300 lines (about 2,030 of them the Expo exporter and cloud printer tooling, kept) |
| Server (`server/*.mjs`) | about 1,350 lines; `app.mjs` has 39 routes in one file |
| `src/index.css` | 931 lines, 310 rules, every page in one file |
| Largest files | `expoProjectFiles.ts` 1,113, `MagicalColoringMachine.tsx` 993, `index.css` 931, `SceneBackgroundsPanel.tsx` 812, `app.mjs` 689, `CloudPrinterModal.tsx` 501, `db.mjs` 495 |
| Tests | none |
| Lint / format | none (the `lint` script is only `tsc --noEmit`) |
| CI | none |

## 3. Findings

Severity: **High** = causes bugs or blocks safe change. **Medium** = slows every change. **Low** = tidiness.

### 3.1 Tooling and type safety
| # | Finding | Severity |
|---|---|---|
| T1 | **`@types/react` and `@types/react-dom` are not installed.** Every JSX element is typed `any`, so props are not checked anywhere in the UI. With them installed the project type-checks cleanly even with `--strict` (0 errors, checked 2026-10-12), so this is a one-line fix and `"strict": true` can be switched on at the same time. | High |
| T2 | No ESLint or Prettier. Style is whatever each file happened to use; there are 9 `any` and 5 `console` calls. | Medium |
| T3 | No tests at all, although the riskiest logic is pure and easy to test: `colors.ts`, `svgParts.ts`, `scene.ts` (layout), power-quiz scoring, detail validation, `settings` cleaners, PDF building. | High |
| T4 | No CI. A broken build is found by hand. | Medium |
| T5 | No `.gitattributes`, so every commit warns "LF will be replaced by CRLF". | Low |
| T6 | The end-to-end checks done by hand during development (walk the whole kiosk, screenshot each page) live in a scratch folder and are not in the repo. | Medium |

### 3.2 Dead and legacy code
| # | Finding | Size |
|---|---|---|
| D1 | **Kept by decision (see section 6).** The **Expo project exporter and cloud printer admin modals** (`components/expo/CloudPrinterModal.tsx`, `ExpoProjectExporterModal.tsx`, `lib/playys/expoProjectFiles.ts`, `expoZipExporter.ts`, `cloudPrintService.ts`) are reachable only from a hidden operator dialog. They generate source for an Expo app that now lives in `expo-app/`. They are not deleted; Phase 1 isolates them (own folder, loaded only when the operator opens them) so they do not weigh on the kiosk bundle or the dead-code check. | about 2,030 lines |
| D2 | `lib/playys/heads.ts`, `poses.ts`, `symbols.ts`, `backgrounds.ts` and the `HeadDefinition`, `PoseDefinition`, `SymbolDefinition`, `BackgroundDefinition`, `RenderMode` types in `types.ts` only feed `generateRandomConfiguration()`, which `App.tsx` imports but never calls. Also unused: `getHead`, `getPose`, `getSymbol`, `getBackground`, `QuizQuestion`, `printToCanonG2430Usb`, `sendToPrintNode`, `PROGRESS_TAB_COUNT`. | about 250 lines |
| D3 | Unused or doubtful dependencies: `@google/genai`, `motion` (never imported); `jszip` is used only by D1. `GEMINI_API_KEY` and `APP_URL` in `.env.example` and `metadata.json`/root `app.json` (AI Studio leftovers) do nothing. | config |
| D4 | One-off scripts: `scripts/trace-body-png.mjs`, `scripts/trace-trousers.ps1`, `scripts/migrate-sqlite-to-neon.mjs` (already run). | 4 files |
| D5 | `server/app.mjs` serves a mascot image path (`Cheerful-Mascot-Castle-Adventure.png`) for a default scene background: a hard-coded asset in server code. | small |

### 3.3 Structure of the kiosk
| # | Finding | Severity |
|---|---|---|
| K1 | **`MagicalColoringMachine.tsx` is a 993-line god component.** It owns the step flow, idle timer, detail-form typing and validation, colour handling, the power quiz and its scoring, sharing, the page chrome (logo, stepper, title, Pick for Me, Back/Next) and the markup of all ten steps. 112 comparisons of the form `currentStep === '…'`, 7 lines over 240 characters. | High |
| K2 | The same step lists are repeated as long `||` chains and nested ternaries (page class, title, subtitle, show/hide of Pick for Me, nav labels). Adding a step means editing about eight places. | High |
| K3 | Page chrome lives inside the flow component, so a screen outside it (the success screen) had to be rebuilt by hand with copies of the chrome. | Medium |
| K4 | Window-size reads (`window.innerHeight`) inside render for card scale; not reactive to resize. | Low |
| K5 | Two parallel concepts for "the character": `PlayyConfiguration` (slugs) and `Selection` (resolved assets), with resolution repeated at call sites (the logged share data needed its own fix). | Medium |
| K6 | Naming: `MagicalColoringMachine`, `kiosk-create-shell`, `head-*` classes on every page, "Playy / Playyy / PlayPal" mixed in copy. | Low |

### 3.4 Repeated code
| # | Finding | Copies |
|---|---|---|
| R1 | Command center panels each re-implement `request()`, `run()` (busy/error/note), load-on-mount, Save and Reset buttons and the alert boxes. | 6 panels |
| R2 | "Fetch a setting, clean it, cache it" is written out each time: progress tabs, trump card, sounds, intro badges (in `KioskIdleMovie`), power quiz, brand. | 6 hooks |
| R3 | Read a file to base64 and upload it to `/api/cc/scene-backgrounds/upload`. | 5 places |
| R4 | `server/db.mjs`: six one-row settings tables (`intro_badges`, `progress_tabs`, `trump_card`, `share_settings`, `sound_settings`, `power_quiz_questions`) each with its own get/save/reset, plus `brand` with a similar shape (about 27 near-identical functions in all). | 6 tables |
| R5 | Hex colour and email validation written separately in the server and the client. | 4 places |
| R6 | Two styling systems in the command center: Tailwind greys (`bg-gray-50 border-gray-300 …`) next to the `cc-*` classes. | all panels |

### 3.5 Server
| # | Finding | Severity |
|---|---|---|
| S1 | `app.mjs` mixes auth, printers, assets, media, ten settings areas and submissions in one 689-line file with inline validators. | Medium |
| S2 | The error wrapper returns `e.message` to the caller with status 500, which can leak internals; there is no structured logging. | Medium |
| S3 | Schema creation is one long inline block run on every cold start; there is no ordered migration list. | Medium |
| S4 | The public `POST /api/submissions` is protected only by an in-memory rate limit (per server instance). On Vercel that is weak. | Medium |
| S5 | The share request carries four JPEGs (about 1.5 MB, 2 MB as base64). Vercel's request limit is 4.5 MB and the function has no `maxDuration` set. A busy background could tip it over. | Medium |
| S6 | The email timestamp is formatted for India time in code rather than from a setting. | Low |

### 3.6 CSS
| # | Finding | Severity |
|---|---|---|
| C1 | One 931-line file holds the intro, every kiosk page, the command center theme and print rules. | Medium |
| C2 | Page geometry is a set of magic percentages per page (`left: 41.6%; top: 28.4%; …`) repeated and overridden later in the file ("refinements" blocks). 9 `!important`, 39 z-index/pointer-events lines. | Medium |
| C3 | The `pick-page` layout flattens parts with `display: contents` and re-places them with absolute positions. It works but is fragile (this is what swallowed the Advanced toggle taps). | Medium |
| C4 | Mixed units (`rem`, `vw`, `vh`, `cq*`) and no design tokens (colours, radii, shadows repeat as literals). | Medium |

### 3.7 Functional gaps found during the analysis (not refactors, but they should be fixed)
| # | Finding |
|---|---|
| F1 | **Every trump card has the same stats.** `handlePowerAnswer` always builds the card from `BASE_STATS` (all 50), so every visitor gets "Flame Champion" with 50 in every stat. The quiz answers never change the stats. The card back and the marketing log therefore carry no real information about the visitor. |
| F2 | The submissions log stores the character choices but not the quiz answers or power outcome. |
| F3 | The retry queue in the browser holds one pending share only. |
| F4 | Colours page region names are hard to read (white on cream, from the earlier review). |
| F5 | No offline mode: the kiosk needs the network to load its assets. |

## 4. Target structure

```
src/
  app/                      App.tsx, main.tsx, providers
  kiosk/
    flow/                   steps.ts (the step registry), useKioskFlow.ts, useIdleReset.ts
    chrome/                 PageChrome.tsx (logo, stepper, title, Pick for Me, Back/Next), StageTabs.tsx
    steps/                  HeadStep, PoseStep, ColorsStep, QuizStep, PowerStep, WorldStep,
                            DetailsStep (+ useDetailsForm), PreviewStep, CardStep, ShareStep, SuccessStep
    components/             PickCarousel, ChoiceCard, DetailsKeyboard, ShareSheets ...
  scene/                    PlayyScene, SceneFinish, AssetArt, TrumpCard (what is drawn)
  domain/                   colors.ts, svgParts.ts, scene.ts, powerQuiz.ts, archetypes.ts, validation.ts (pure, tested)
  data/                     api.ts (typed fetch), useServerSetting.ts, library.tsx, share/, sfx/
  command-center/
    shell/                  CommandCenter.tsx, CmsPanel.tsx, useCmsSetting.ts, UploadButton.tsx
    panels/                 one file per tab
  styles/                   tokens.css, base.css, kiosk-chrome.css, pages/*.css, command-center.css, print.css
server/
  index (kiosk-server.mjs), config.mjs (env), db/ (client, migrations/, singleton.mjs, *.mjs),
  routes/ (auth, assets, media, scene-backgrounds, settings, submissions, printers), share.mjs
tests/
  unit/                     vitest
  e2e/                      playwright: full flow, command center smoke, screenshot baselines
```

## 5. Plan

Each phase ends with: type-check, lint, unit tests, end-to-end walk-through and a before/after screenshot comparison all green, then a commit that can be shipped. Sizes: S under half a day, M about a day, L a few days.

### Phase 0: Safety net (M)
1. Install `@types/react` and `@types/react-dom`; set `"strict": true` (T1). Fix anything it reports (expected: none).
2. Add ESLint (typescript-eslint, react-hooks) and Prettier; add `.gitattributes` (`* text=auto eol=lf`); one formatting commit with no other change (T2, T5).
3. Add Vitest. Write unit tests for the pure logic first: `resolveColors` and region groups, `svgParts` (parse, render, B&W rules), `layoutScene` (anchors, reserve), power-quiz scoring, detail validation, settings cleaners, `buildPdfs` (page counts) (T3).
4. Move the Playwright walkthroughs into `tests/e2e`: whole kiosk flow (with the share request mocked), command center login and each tab loading, plus screenshot baselines for every page at 1664x936 and 1920x1080 (T6). These baselines are what makes Phases 4 and 5 safe.
5. GitHub Actions: type-check, lint, unit tests, build, e2e on pull requests (T4).

**Done when:** `npm run check` runs all of the above locally and in CI, and the baselines are committed.

### Phase 1: Remove dead code (S to M)
1. Delete D2 (legacy libs and types, unused exports), D3 (unused dependencies and AI Studio leftovers), D4 (one-off scripts), D5 (hard-coded asset path).
2. D1 is kept: move the Expo exporter and cloud printer modals and their libraries into `src/tools/` and load them lazily (`React.lazy`) from the operator dialog, so the kiosk bundle no longer includes them. Mark the folder as an allowed entry in the dead-code check.
3. Run the dead-code check (the import-graph script plus `knip`) in CI so dead code cannot return.

**Done when:** `knip` reports nothing and the kiosk bundle is smaller. Expected: about 250 fewer lines, 2 fewer dependencies (`@google/genai`, `motion`) and about 2,000 lines out of the kiosk bundle.

### Phase 2: Shared client infrastructure (M)
1. `data/api.ts`: one typed `api.get/put/post` that throws a readable `ApiError` (R1, R3).
2. `useServerSetting(url, clean, defaults)`: fetch, clean, cache, one implementation; replace the six hand-written hooks (R2).
3. `readAsBase64` and `uploadMedia(file)` helpers (R3).
4. `domain/validation.ts`: hex colour, email, phone, used by client and server (R5).
5. Command center: `useCmsSetting` (load, dirty, save, reset, busy, error, note) and a `CmsPanel` shell (title, alerts, Save/Reset). Move every panel onto them and onto the `cc-*` classes only (R1, R6).

**Done when:** none of the duplicated patterns in section 3.4 remain (a search for `async function request` finds one place) and the panels are each under about 150 lines.

### Phase 3: Server (M to L)
1. `config.mjs` reads and checks the environment once; nothing else reads `process.env`.
2. `db/singleton.mjs`: `singletonTable('progress_tabs')` returns `get/save/reset`; replace the 27 functions (R4).
3. Ordered `migrations/` with a `schema_migrations` table instead of the inline block (S3).
4. Split `app.mjs` into `routes/*.mjs`, each registering its own routes with its own validator (S1).
5. Error handling: typed `HttpError`, one error middleware, no internal messages in responses, request logging (S2).
6. Share endpoint: shared kiosk key header, size check before parsing, `maxDuration` in `vercel.json`, and a smaller capture (pixel ratio and JPEG quality tuned) so the body stays well under 4.5 MB (S4, S5). Timezone from a setting (S6).
7. Route tests with supertest (auth, validation failures, submissions with the mailer stubbed).

**Done when:** no route file is over about 150 lines and every route has a test for its bad-input path.

### Phase 4: Kiosk flow (L)
1. `kiosk/flow/steps.ts`: a registry, one entry per step: id, stage index, page class, title, subtitle, whether Pick for Me shows, Next label, whether Next is shown, validation, component. Page class, title, subtitle, nav labels and stage index all come from it (K2).
2. `PageChrome` renders logo, stepper, title, Pick for Me and Back/Next from the registry entry; the success screen uses it too (K3).
3. Extract each step into `kiosk/steps/*Step.tsx`, one at a time, moving its markup and its handlers together. Extract `useDetailsForm` (typing rules, validation), `usePowerQuiz` (answers, scoring) and `useIdleReset`.
4. Resolve the character once in `useSelection` and pass a `Selection` down, instead of re-deriving it (K5).
5. Make card and page scale reactive (`useElementSize`/`ResizeObserver`) (K4).
6. Rename `MagicalColoringMachine` to `KioskFlow`. Move every visitor-facing string into one `copy.ts` and apply the brand spelling (section 6, decision 6): the brand is **PLAYY**, written "Playy" in sentences and "PLAYY" in capitals; "Playyy" and "PlayPal" are retired (K6).

**Done when:** the flow component is under about 150 lines, no step file is over about 200, and the screenshot baselines from Phase 0 are unchanged.

### Phase 5: CSS (M to L)
1. Split `index.css` into the files in section 4 with no rule changes (C1). Baselines unchanged.
2. Introduce `tokens.css` (colours, radii, shadows, type scale, the 3D button recipe) and replace literals (C4).
3. Replace per-page magic numbers with per-page custom properties on one shared layout (`--preview-x`, `--options-w` …) (C2).
4. Remove the `display: contents` flattening and the `!important`s by giving the chrome real grid areas (C3).
5. Rename `head-*` / `pick-*` classes to neutral `kiosk-*` names as the steps are converted.

**Done when:** no `!important`, no rule that overrides another in the same file, and the baselines still match.

### Phase 6: Functional debt and docs (M)
1. Make the card stats real (F1) with the weighting system in section 9: pure `computeStats(questions, answers)` in `domain/`, unit tests including the simulation of every answer combination, the archetype and rarity from the stats, and the answers and outcome logged with the submission (F2).
2. Retry queue holds a list, not one item (F3). Fix the colours page label contrast (F4).
3. Rewrite the docs: `README.md` (run, deploy), `docs/ARCHITECTURE.md` (the tree above and the data flow), `docs/STATUS.md` kept short and current, short decision records for Neon, the single Express app, client-side capture for PDFs.

## 6. Decisions (answered 2026-10-12)

| # | Question | Answer | Effect on the plan |
|---|---|---|---|
| 1 | Delete the Expo exporter and cloud printer modals? | **Keep** | Not deleted. Phase 1 isolates and lazy-loads them (D1). |
| 2 | `expo-app/` in this repo? | **Keep** | Stays here, excluded from the web build and checks. |
| 3 | Strict TypeScript now? | **Yes** | Phase 0, step 1. |
| 4 | Vitest and Playwright? | **Yes** | Phase 0, steps 3 and 4. |
| 5 | Trump card stats from the quiz? | **Yes: propose a proper weighting system, with an explanation** | Section 9 below; built in Phase 6. |
| 6 | Brand spelling | **PLAYY** | Written "Playy" in sentences, "PLAYY" in capitals; one `copy.ts` (Phase 4, step 6). |

Note on decision 1: it was answered "Keep yes"; I have read that as keep. If delete was meant, Phase 1 step 2 becomes a deletion.

## 7. Order and effort

Phase 0 is the gate; nothing after it should start without it. Phases 1 to 3 do not touch what the visitor sees and can run in any order after Phase 0. Phases 4 and 5 are the large ones and need the screenshot baselines. Phase 6 follows Phase 4.

| Phase | Effort | Risk | Visible to visitors |
|---|---|---|---|
| 0 Safety net | M | Low | No |
| 1 Dead code | S to M | Low | No |
| 2 Client infrastructure | M | Low | No |
| 3 Server | M to L | Medium | No |
| 4 Kiosk flow | L | Medium | No |
| 5 CSS | M to L | Medium | No |
| 6 Functional debt and docs | M | Low | Yes (real stats on the card) |

## 8. Not in this refactor

SMTP and WhatsApp setup (waiting on the client), silent printing, the offline asset cache (F5), a portrait layout, and the Expo mobile app.

## 9. Trump card stats: the weighting system (proposal)

### 9.1 What is wrong today
Every card is built from the same starting numbers (all 50) and the quiz answers never change them, so every visitor gets the same stats and the same character type ("Flame Champion"). The quiz does already pick a **power symbol** from per-answer weights; the stats ignore it.

### 9.2 Goals
1. **Fair and transparent:** the same answers always give the same card. No randomness.
2. **Every answer matters** and every stat can come out on top.
3. **No card looks weak.** This is for children: the lowest stat never goes below 35 and the highest is always a clear peak.
4. **Edit-proof:** the client edits the quiz in the command center. Whatever they write, the stats must stay balanced, so the system calibrates itself from the quiz rather than relying on hand-tuned numbers.
5. **One source of truth:** no second table of per-answer stat values to keep in step. The stats come from the symbol weights the quiz already has.

### 9.3 The model
**Step 1: from answers to symbols (exists today).** Each answer carries symbol weights, for example "Helping my friends" = Warm Heart 3, Puppy Paw 2.

**Step 2: from symbols to stats (new, one small table).** Each symbol is a mix of stats that adds up to 1:

| Symbol | Stat mix |
|---|---|
| Golden Crown | Power 60%, Courage 40% |
| Shining Star | Courage 60%, Energy 40% |
| Thunder Zap | Speed 70%, Power 30% |
| Fire Spark | Energy 70%, Speed 30% |
| Crescent Moon | Intelligence 70%, Energy 30% |
| Puffy Cloud | Intelligence 60%, Courage 40% |
| Warm Heart | Courage 60%, Intelligence 40% |
| Puppy Paw | Courage 50%, Energy 50% |

**Step 3: points per answer.** Each answer is worth 10 points, shared between its symbols in proportion to their weights (3:2 gives 6 and 4), and each symbol's points are spread over its stat mix. "Helping my friends" gives Warm Heart 6 points (3.6 Courage, 2.4 Intelligence) and Puppy Paw 4 points (2 Courage, 2 Energy).

**Step 4: add up and calibrate.** Add the points for each stat over all the answers. Then convert to a 0 to 100 stat with a z-score, using the quiz's own average and spread for that stat (these can be worked out directly from the questions, no simulation needed):

`stat = 58 + 13 x (points - average points for that stat) / spread of that stat`

This is what keeps it fair: a stat that is easy to earn (Courage appears in many symbols) is scaled down and a hard one (Power) is scaled up, so each stat has a similar chance to come out on top, however the quiz is written.

**Step 5: the winning power adds a signature bonus.** The symbol the visitor is awarded adds +6 to its main stat and +3 to its second stat, so the card matches the power shown on the previous screen.

**Step 6: limits.** Round to a whole number and clamp to 35 to 98 (never 0 and never a "perfect" 100).

**Step 7: character type and rarity.**
- The **archetype** is the highest stat (Power: Flame Champion, Speed: Storm Guardian, Intelligence: Mystic Dreamer, Energy: Cosmic Explorer, Courage: Nature Guardian). A tie goes to the awarded symbol's main stat, then to a fixed order, so it is deterministic.
- **Rarity** comes from how strong the peak is, not from the archetype: top stat 88 or more is Legendary, 78 to 87 Epic, below that Rare. There is no Common card for children. With the current quiz this gives about 20% Legendary, 38% Epic and 42% Rare; the thresholds are tuned in Phase 6 with the simulation.
- The two **abilities** and the quote come from the archetype, as now.

### 9.4 Worked example (calculated with the current quiz)
A visitor answers "Helping my friends", "Give them a big hug", "Having a heart full of magic", "Kind and caring" and "Spreading love". Every answer leans to Warm Heart, so the awarded power is **Warm Heart**. The card comes out as Courage 98 (it reaches the cap), Intelligence 60, Energy 52, Power 41, Speed 35. The archetype is **Nature Guardian**, rarity Legendary, and the back shows Warm Heart, Kindness and Empathy.

### 9.5 Checked against the current quiz (all 1,024 answer combinations)
| | Plain points (start at 30, no calibration) | Proposed (calibrated) |
|---|---|---|
| Top stat share | Courage 35%, Intelligence 30%, Energy 27%, Speed 5%, Power 3% | Intelligence 27%, Courage 22%, Energy 22%, Power 15%, Speed 14% |
| Highest stat (min / average / max) | 47 / 55 / 68 | 63 / 80 / 98 |
| Lowest stat | | 35 |

Without calibration, Speed and Power almost never win, because the current quiz gives them few chances. Calibration fixes most of it. What remains (Intelligence a little high) comes from how the quiz is written: Puppy Paw, Shining Star and Thunder Zap are rarely a main answer. Phase 6 therefore also includes **a balance check in the command center's Power quiz tab**: it shows, for the quiz as written, how often each power and each character type would come up, and warns if one is below about 8% or above about 30%.

### 9.6 What stays editable and what is fixed
- Editable in the command center (already): the questions, the answers and each answer's symbol weights.
- Fixed in code, with a test: the symbol-to-stat table, the calibration numbers (58 and 13), the clamp and the rarity thresholds. If the client later wants to change these, they can move into the Power quiz tab as one more small table.

### 9.7 What gets built (Phase 6)
1. `domain/stats.ts`: `computeStats(questions, answers)` as pure functions (points, calibration, bonus, clamp) and `archetypeFor` / `rarityFor`.
2. Unit tests: the worked example, determinism, tie-break, every stat reachable as the top stat, no stat outside 35 to 98, an edited quiz stays balanced (a generated quiz with lopsided weights), and a simulation over all answer combinations that fails if any character type falls under 8%.
3. The share log stores the answers, the stats and the awarded power with each submission, for marketing.
4. The card back and the Users tab show the real numbers.

