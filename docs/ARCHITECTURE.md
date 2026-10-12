# Architecture

## Layout

| Folder | What lives there |
|---|---|
| `src/kiosk/` | The visitor flow. `KioskFlow.tsx` draws the page; `flow/steps.ts` lists the pages in order; `flow/useKioskFlow.ts` holds the state and actions; `steps/` has one component per page; `PageChrome.tsx` is the shared header, progress tabs and Back/Next; `copy.ts` holds all visitor-facing wording |
| `src/command-center/` | The CMS: one panel per tab, built on `useCmsSetting` and `CmsPanel` |
| `src/data/` | `api.ts` (every JSON call), `useServerSetting.ts` (load and save one setting) |
| `src/lib/` | Pure logic: SVG recolouring and scene layout (`assets/`), quiz, stats and card (`playys/`), capture and PDFs (`share/`), sounds |
| `src/components/` | Drawing components: the character scene, trump card, backgrounds, intro |
| `src/styles/` | CSS by feature (`intro`, `chrome`, `carousel`, `pages/*`, `command-center`, `print`). `index.css` only imports them, in cascade order |
| `server/` | One Express app (`app.mjs`). `config`, `auth`, `http` (errors), `db/` (plain SQL, one `singleton(table)` helper), `routes/` (one small file each), `submission.mjs` / `shareService.mjs` / `pdf.mjs` / `mailer.mjs` |
| `shared/` | Validation used by both the browser and the server |
| `api/index.mjs` | The Vercel function wrapper around the same Express app |
| `tests/` | `unit/` (Vitest), `e2e/` (Playwright flow, command center, screenshots) |

## Rules we keep

- A page is added in `steps.ts` plus one component in `steps/`; the flow, tabs and buttons follow from that.
- Visitor text goes in `copy.ts`. Brand spelling: **PLAYY** (in sentences "Playy").
- Server settings that are a single saved object use the generic settings routes (`server/routes/settings.mjs`), not a new route file.
- Every network call goes through `api`. Every check shared by client and server goes in `shared/`.
- `!important` only in print rules.
- No behaviour change in a refactor: unit tests, the end-to-end flow and the screenshot baselines must stay green.

## Trump card stats

`src/lib/playys/stats.ts`. Each answer's power weights are turned into stat points, calibrated against the quiz's own average and spread, topped up by the awarded power, and clamped to 35 to 98. The character type is the highest stat; rarity comes from its value. The same answers always give the same card, and `tests/unit/stats.test.ts` fails if any character type drops under 8% of all possible answers. Full reasoning in section 9 of [REFACTOR_PLAN.md](REFACTOR_PLAN.md).
