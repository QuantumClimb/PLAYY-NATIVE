# PLAYYS Native: Status Report

Last updated: 2026-10-10. Active app: the **Vite web kiosk**. The Expo app is paused until later.

## How to run (kiosk PC)
| What | Command |
|---|---|
| **Everything in one command** | `npm start` builds the site and serves it with the API at http://localhost:3001 |
| Development (both servers, hot reload) | `npm run dev:all` (site on :3000, server on :3001) |
| Server only / site only | `npm run server` / `npm run dev` |
| Command center | `/command-center` on either address (password in `.env`: `COMMAND_CENTER_PASSWORD`) |
| Printer dialog | `Alt+Shift+P` on any screen (needs the server running) |
| Silent printing | Launch Chrome with `--kiosk --kiosk-printing` and set the default printer in the dialog |

Copy `.env.example` to `.env` and set `COMMAND_CENTER_PASSWORD` and `DATABASE_URL` (the Neon connection string). The database is **Neon Postgres**, shared by local runs and Vercel, so assets uploaded anywhere are the same everywhere. The old local `data/kiosk.db` was copied into Neon with `scripts/migrate-sqlite-to-neon.mjs` and is no longer used (kept as a backup, not in git).

## Done
**Kiosk look and flow**
- Start page: looping video background, logo, a single 3D START button. Footer on every inner page.
- Fonts: Sniglet ExtraBold for titles, Fredoka Bold for body text and buttons. Fredoka has no 800 weight.
- Faux-3D glossy buttons (reusable `.btn-3d` class).
- Flow: Head, Body, Power, World, Name, then a 3-question quiz, then the trump card (flip front/back), then print.
- Printing sends two pages: the coloring sheet and the trump card front and back.

**Kiosk now runs on the command-center assets.** Heads, poses, symbols and backgrounds are loaded from the server at start (`/api/assets`); the old hardcoded drawings are no longer used by the kiosk. The preview is an A4-shaped scene (background stretched to the printable area, character standing on it) and fills the whole height of the left side (704 px tall at 1280x800, 984 px at 1920x1080; it was 450 px). The coloring page, celebration screen and trump card all use the same scene. Choosing a head also decides the outfit and secondary colors.

**Printer dialog** (Alt+Shift+P): lists installed printers with status, sets the default, test print. Detection runs in the local kiosk server because a browser cannot list printers.

**Trump card and questionnaire** merged from `PLAYY_CARD` into the web app. Fixed the corrupted archetype emoji and added the missing courage stat to the printed card. Also ported to `expo-app` (paused; uses the simpler Expo artwork).

**Command center** (`/command-center`, password protected)
- Asset library in SQLite: heads, faces, bodies (poses), symbols, backgrounds. Uploaded SVGs are checked and rejected if they contain scripts or external links.
- SVG parts engine: named layers from Illustrator become parts with modes: main color, derived (HSL lightness offset), fixed, line art. Black-and-white version generated from the same SVG.
- Anchors (neck, chest) placed by clicking the preview.
- Head on body preview with a per-head size slider, in color and black-and-white.
- Character colors, set per head: **head color**, **outfit color** (hoodie, trousers, shoes; follows the head color unless set) and a **fixed secondary color** (trim, soles, cuffs, tassles; auto-derived from the outfit unless set). Previewed live on the body.

- Scene preview (head, body, symbol and background together) shown as an **A4 sheet**: 5 mm printable margin, background stretched (non-uniform) to fill it, color and black-and-white print preview side by side. The kiosk print page is now A4 portrait with a 5 mm margin.
- Per-background **stand point** and character height; per-symbol **size on the chest**; chest anchor on bodies.

**Assets loaded:** heads Playy, Sparkyy, Dreamyy; shared face; body pose1; 7 symbols (moon, fire, crown, cloud, paw, zap, heart); Backgrounds 01, 02 and 03 (test).

## Decisions
- Neon Postgres via Neon's serverless driver (plain SQL in `server/db.mjs`). Prisma was considered and left out: one table, and it adds a generate step and an adapter on Vercel. Add it later if the schema grows a lot.
- The API is one Express app (`server/app.mjs`) with two launchers: `server/kiosk-server.mjs` (local, also serves the built site) and `api/index.mjs` (Vercel function, routed by `vercel.json`).
- The face is a shared asset; its colors are fixed and editable in the command center.
- Each head has a head color, an outfit color (defaults to the head color) and an optional fixed secondary color (defaults to a lighter shade of the outfit). Decided 2026-10-10 so characters like Dreamyy can have a white head with a colored outfit.

## Next, in order
1. Set the real outfit and secondary colors for Dreamyy (and Playy and Sparkyy if they need them) in the command center.
2. Tune the placement in the scene preview: body neck and chest anchors on pose1, head sizes, symbol sizes, and the background stand point and character height.
3. More backgrounds and poses. Symbols star and gear are missing (the old app had 9, 7 delivered).
5. Remove the old hardcoded drawings and unused legacy screens (`src/components/playys`, `creator`, `expo`, `lib/playys/heads|poses|symbols|backgrounds`).
5b. Deploy to Vercel: set `COMMAND_CENTER_PASSWORD` (and optionally `COMMAND_CENTER_SECRET`) in the Vercel project settings; `DATABASE_URL` comes from the Neon integration. The Vercel function entry has not been tested on Vercel yet.
6. Phone number step after Name, with a consent line.
7. Results screen showing the black-and-white and color versions.
8. Email via SMTP: black-and-white PDF and color image to qcquantumclimb@gmail.com with the child's name and parent's phone. Retry queue so the kiosk never blocks.
9. WhatsApp sending when the client provides the API (sender interface so email is the first implementation).

## Open questions
- Cyan trim on the blue character is not a pure lightness shift (hue 196 vs 218). Keep it fixed, or derive it?
- Should the hoodie be split so the head sits inside the hood?
- Background 01 artwork looks cropped at the left and right edges in the preview; confirm that is intended.
- Where the trump card sits relative to the new black-and-white and color results screen.
- Should submissions (name, phone, artwork) be stored in the database as a log?

## Known issues and notes
- The trump card quiz is unbalanced: every stat starts at 50 and the highest wins, so most answers give "Cosmic Explorer".
- Hosting: the server reads `PORT` and `HOST` (hosted = all interfaces) and turns the printer routes off unless `ENABLE_PRINTERS=1`. SQLite data does not survive redeploys on most hosts, hence Neon.
- The kiosk now needs a connection to Neon to load its assets. For an offline-capable kiosk, cache the asset library on the PC (not built yet).
- On Vercel the login rate limit is per function instance, so it is weaker than on the kiosk PC. Use a long password.
- With `npm run dev` listening on all interfaces, the `/api` routes are reachable from the LAN. The command center is password protected, but the printer routes are not.
- Expo app: Expo expects slightly different `react-native-svg` and `safe-area-context` versions (run `npx expo install --fix`), and `app.json` references icon and splash images that do not exist.
- `docs/PKD_Create_Your_Play_Functional_Document_v7.docx` is a local file, not committed.
