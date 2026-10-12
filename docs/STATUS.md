# PLAYYS Kiosk: Status Report

Last updated: 2026-10-12 (refactor phases 0 to 6 done). Active app: the **Vite web kiosk** with its command center and API. The Expo app (`expo-app/`) is paused until the mobile work starts. The clean-up plan is in [REFACTOR_PLAN.md](REFACTOR_PLAN.md).

## 1. Summary

The whole visitor journey works end to end: intro, build a character (face, pose, colours), power-up questions, power awarded, background, name, phone and email, preview, trump card, share (print dialog, email, log) and a success screen that returns to the intro. Everything the client edits lives in the command center. What is still open is outside the code: the **SMTP password** (so emails go out) and the **WhatsApp token**, both waiting on the client's system administrator.

## 2. How to run

| What | Command |
|---|---|
| Everything in one command | `npm start` builds the site and serves it with the API at http://localhost:3001 |
| Development (hot reload) | `npm run dev:all` (site on :3000, server on :3001) |
| Server only / site only | `npm run server` / `npm run dev` |
| Command center | `/command-center` (password in `.env`: `COMMAND_CENTER_PASSWORD`) |
| Printer dialog | `Alt+Shift+P` on any screen (needs the local server) |
| Operator dialog | hold the logo on the intro screen for 4.5 seconds |
| Kiosk Chrome | `--kiosk --kiosk-printing --autoplay-policy=no-user-gesture-required` (silent printing, music from the start) |

`.env` needs `DATABASE_URL` (Neon Postgres, shared by local runs and Vercel), `COMMAND_CENTER_PASSWORD`, and, for email, `SMTP_USER` and `SMTP_PASS` (optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`). See `.env.example`. Pushing to `main` deploys to Vercel; its environment variables must match.

## 3. The visitor journey

Every page after the intro shares one layout: logo, progress tabs, title and subtitle, "Pick for Me!" where it applies, and Back / Next in one bottom container. No page scrolls vertically; option lists swipe sideways.

| Step | What happens |
|---|---|
| Intro | Looping video, logo, sign, Tap to Start, four badges. |
| 1 Face | Swipeable cards of heads. The head also sets the outfit and secondary colours. |
| 2 Pose | Swipeable pose cards; the character preview recolours with the chosen head. |
| 3 Colours | Simple (main + secondary colour) or Advanced (each part), 15 glossy hexagon swatches. Gloves stay white. |
| 4 You | Power-up questions: a centred row of pastel cards, no preview. An answer moves straight on. |
| 5 Power | Power awarded: the character holds the symbol, award panel on the right. |
| 6 Background | Portrait preview card; world cards with the artwork edge to edge. |
| 7 Name | Three screens with a colourful touch keyboard: name, phone, email. Nothing can be skipped; each is validated. The preview shows the finished page as it is typed. |
| 8 Preview | Black-and-white page and full-colour page side by side. Back and Continue. |
| Trump card | One large card, tap to flip: front is the finished artwork in a thick outline, back has the power, stats and abilities. Back and Continue, no footer. |
| Share | The two pages and the card in a row. **SHARE** photographs them, logs the visitor, emails two PDFs, opens the print dialog and moves on. |
| Success | Confetti and what happens next; returns to the intro after 20 seconds or on FINISH. |

The finished page (preview, print, PDF) has the logo top-left, the name big under the character, and "Notes: email - phone" along the bottom. Colour choices go through one resolver, `src/lib/playys/colors.ts`. The black-and-white page ignores colour choices.

Printing sends the black-and-white page, the colour page and the card front and back. The browser's print dialog still appears for now; with `--kiosk-printing` it prints silently.

## 4. Command center (`/command-center`)

Password protected. Tabs:

| Tab | Controls |
|---|---|
| Characters | Heads, face, poses, symbols, backgrounds: SVG upload with checks (no scripts or external links), named layers become parts (main, derived, fixed, line), anchors, per-head colours (head, outfit, secondary), A4 scene preview, stand point and size, and the **name shown on the kiosk** for each asset. |
| Scene backgrounds | Page backgrounds (image or video) per screen, plus intro layout options. |
| Intro badges | The badges under the start button: label, icon (built in, upload or emoji), colour, order. |
| Progress tabs | Rename the eight top tabs, change their icons, or hide the labels. |
| Trump card | Outline colour and thickness, corner roundness, back background and highlight colour, with live preview. Power symbols and stat icons are fixed. |
| Users | Everyone who made a Playyy: name, email, phone, date and time, a card thumbnail, the character choices and the email status. Search, CSV download, Resend. |
| Share & email | Two recipient slots (currently qcquantumclimb@gmail.com and aum.janakiram@gmail.com), on/off, a greyed-out WhatsApp slot. |
| Power quiz | The questions, answers and the symbol each answer leans toward. |
| Logo | Replace the logo SVG; in-app drop shadow and an artwork stroke. |
| Sounds | A sound and volume for 14 kiosk actions, uploads, and the **background music playlist** (order, volume, preview, add songs). |

The command center uses a white, Inter theme (`.cc-*` classes); the kiosk keeps its playful look.

## 5. Sharing, email and the users log

- `POST /api/submissions` receives the name, email, phone, a thumbnail, the character choices and four JPEGs (about 1.5 MB). It stores the row, builds two PDFs with `pdf-lib` (coloring pages; trump card) and emails them with `nodemailer` to the recipients in the command center.
- If the email fails, the images are kept in `submission_files` so **Resend** works later. If the kiosk cannot reach the server, the Playyy is kept in the browser and sent on the next start.
- Pictures are taken in the browser with `html-to-image` (the fonts are read once and embedded; this needed `crossorigin` on the Google Fonts link).
- **Waiting on the client:** SMTP login (a Gmail app password or the company mail server's details) and the WhatsApp token. Until then every row shows "Not sent".

## 6. Data and architecture

- **Neon Postgres** through the serverless driver, plain SQL in `server/db/`. Tables: `assets`, `media_files`, `scene_backgrounds`, `power_quiz_questions`, `intro_badges`, `progress_tabs`, `trump_card`, `brand`, `sound_settings`, `share_settings`, `submissions`, `submission_files`, `app_migrations`.
- **One Express app** (`server/app.mjs`) with two launchers: `server/kiosk-server.mjs` (local, also serves the built site) and `api/index.mjs` (Vercel function, routed by `vercel.json`). Printer routes are off on Vercel.
- **Frontend:** React 19, Vite 6, Tailwind 4 for utilities, plain CSS in `src/styles/` (one file per feature) for the page layouts. Layouts use percentages of the screen so they scale from 1366x768 to 1920x1080.
- **SVG engine** (`src/lib/assets/svgParts.ts`): named Illustrator layers become parts; one source SVG gives the colour and black-and-white versions. `scene.ts` lays out the A4 scene (5 mm margin, background stretched, character on the stand point).
- **Sounds** are synthesized in the browser (no audio files, no licensing); background music files are in `public/assets/audio/music`.

## 7. Decisions

- Neon Postgres; Prisma left out (plain SQL is enough; revisit if the schema grows a lot).
- One API app with two launchers (local and Vercel).
- Characters: a head colour, an outfit colour (defaults to the head colour) and an optional fixed secondary colour. The face is a shared asset.
- PDFs and thumbnails are made in the browser, not on the server (the server stays small enough for Vercel).
- Google's cartoon sound library was not used (its terms limit it to Actions on Google); sounds are synthesized instead.
- Email first; WhatsApp behind the same share step when the token arrives. Eventually SHARE sends straight to the printer, the email and WhatsApp with no print dialog.

## 8. Open items

**Needs the client**
1. SMTP details and password, and the WhatsApp token (questions sent to you for the system administrator).
2. The kiosk PC's printer, and silent printing with `--kiosk-printing`.
3. Confirm the Vercel deploy with all environment variables once SMTP is set.

**Known issues**
- The Users tab does not yet show each visitor's card stats (they are saved with every submission in its `config`).
- Page class names still use the old `head-*` / `pick-*` prefixes, and some headers use `display: contents`; renaming them is cosmetic and was left out to keep the screenshots identical.
- `ExpoProjectExporterModal` is not reachable from any screen.
- Local fallback assets can hide a database error in the kiosk; decide whether the kiosk should show an error instead.
- The saved quiz in the database may still hold older wording; re-save it in the Power quiz tab.
- The CI workflow is in `docs/ci.yml.example` because the push token lacks the `workflow` scope.
- Colours page: region names are white on cream and hard to read.
- The pages are laid out for a landscape screen (about 16:9).
- The kiosk needs a connection to load its assets (no offline cache).
- On Vercel the login rate limit is per function instance. Use a long password.
- With `npm run dev` the `/api` routes are reachable from the LAN (printer routes are not password protected).
- Uploads through Vercel are limited to about 4.5 MB per request, so large songs go in `public/assets/audio/music`.
- `docs/PKD_Create_Your_Play_Functional_Document_v7.docx` is a local file, not committed.
- Expo app: wants slightly different `react-native-svg` and `safe-area-context` versions and its `app.json` points at missing icon and splash images.

**Open design questions**
- The cyan trim on the blue character is not a pure lightness shift. Keep it fixed or derive it?
- Should the hoodie be split so the head sits inside the hood?
- Background 01 artwork looks cropped at the left and right edges in the preview. Intended?

## 9. Next

1. Get SMTP and WhatsApp details; test a real email end to end.
2. Check a Vercel deploy of the restructured server.
3. Add a balance table (how often each power and character type comes up) to the Power quiz tab.
4. Show the card stats in the Users tab.
