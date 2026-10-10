# PLAYYS Native: Status Report

Last updated: 2026-10-10. Active app: the **Vite web kiosk**. The Expo app is paused until later.

## How to run (kiosk PC)
| What | Command |
|---|---|
| Kiosk server (printers, asset library, login) | `npm run server` (127.0.0.1:3001) |
| Web app | `npm run dev` (http://localhost:3000) |
| Command center | http://localhost:3000/command-center (password in `.env`: `COMMAND_CENTER_PASSWORD`) |
| Printer dialog | `Alt+Shift+P` on any screen (needs the server running) |
| Silent printing | Launch Chrome with `--kiosk --kiosk-printing` and set the default printer in the dialog |

Copy `.env.example` to `.env` and set `COMMAND_CENTER_PASSWORD`. The database is `data/kiosk.db` (local SQLite, not in git).

## Done
**Kiosk look and flow**
- Start page: looping video background, logo, a single 3D START button. Footer on every inner page.
- Fonts: Sniglet ExtraBold for titles, Fredoka Bold for body text and buttons. Fredoka has no 800 weight.
- Faux-3D glossy buttons (reusable `.btn-3d` class).
- Flow: Head, Body, Power, World, Name, then a 3-question quiz, then the trump card (flip front/back), then print.
- Printing sends two pages: the coloring sheet and the trump card front and back.

**Printer dialog** (Alt+Shift+P): lists installed printers with status, sets the default, test print. Detection runs in the local kiosk server because a browser cannot list printers.

**Trump card and questionnaire** merged from `PLAYY_CARD` into the web app. Fixed the corrupted archetype emoji and added the missing courage stat to the printed card. Also ported to `expo-app` (paused; uses the simpler Expo artwork).

**Command center** (`/command-center`, password protected)
- Asset library in SQLite: heads, faces, bodies (poses), symbols, backgrounds. Uploaded SVGs are checked and rejected if they contain scripts or external links.
- SVG parts engine: named layers from Illustrator become parts with modes: main color, derived (HSL lightness offset), fixed, line art. Black-and-white version generated from the same SVG.
- Anchors (neck, chest) placed by clicking the preview.
- Head on body preview with a per-head size slider, in color and black-and-white.
- One character color: the head color drives the head, hoodie, trousers and shoes; lighter parts derive from it.

**Assets loaded:** heads Playy, Sparkyy, Dreamyy; shared face; body pose1.

## Decisions
- Local SQLite behind one small module (`server/db.mjs`) so it can move to Neon or Supabase later.
- The face is a shared asset; its colors are fixed and editable in the command center.
- Character color is set once (on the head) and applies to the whole character.

## Next, in order
1. **Secondary clothing color per character (new requirement).** Example: Dreamyy's secondary color differs from the shared rule. Add a per-character override for the "derived" parts (trim, soles, cuffs, tassles) and probably an outfit color separate from the head color. To decide: is the override a fixed color, or a lightness/hue offset from the character color?
2. Place the body neck anchor on pose1, then tune head sizes.
3. Backgrounds (full 850x1100 scenes, with color and black-and-white versions).
4. More poses and the symbols (chest anchor).
5. Connect the kiosk to the database and retire the hardcoded drawings.
6. Phone number step after Name, with a consent line.
7. Results screen showing the black-and-white and color versions.
8. Email via SMTP: black-and-white PDF and color image to qcquantumclimb@gmail.com with the child's name and parent's phone. Retry queue so the kiosk never blocks.
9. WhatsApp sending when the client provides the API (sender interface so email is the first implementation).

## Open questions
- Dreamyy: white cloud head with a colored outfit? (The override in item 1 solves this.)
- Cyan trim on the blue character is not a pure lightness shift (hue 196 vs 218). Keep it fixed, or derive it?
- Should the hoodie be split so the head sits inside the hood?
- Where the trump card sits relative to the new black-and-white and color results screen.
- Should submissions (name, phone, artwork) be stored in the database as a log?

## Known issues and notes
- The trump card quiz is unbalanced: every stat starts at 50 and the highest wins, so most answers give "Cosmic Explorer".
- `node:sqlite` prints an experimental warning on Node 22. It works, but pin the Node version on the kiosk PC.
- With `npm run dev` listening on all interfaces, the `/api` routes are reachable from the LAN. The command center is password protected, but the printer routes are not.
- Expo app: Expo expects slightly different `react-native-svg` and `safe-area-context` versions (run `npx expo install --fix`), and `app.json` references icon and splash images that do not exist.
- `docs/PKD_Create_Your_Play_Functional_Document_v7.docx` is a local file, not committed.
