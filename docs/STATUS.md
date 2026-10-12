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

**Intro screen** (2026-10-12): one centered column (logo, "Let's Make Something Awesome!" sign, pill Tap to Start button, badges) sitting 5% in from the right edge, styled from the design reference. The four badges under the button are static labels, editable in the command center under **Intro Badges**: label, icon (built-in set, uploaded PNG/JPG/WebP, or emoji), color, order, up to 5. Stored in the `intro_badges` table; the original four are used until saved. Placement, size and float animation still come from Scene Backgrounds, and holding the logo for 4.5 s still opens the operator dialog.

**Logo** (command center, **Logo** tab). The built-in logo is now `public/assets/SVG/logo/logo.svg` (nine named layers: faceeyebrows, white_sockets, black_boxes, VGP, kingdom, y1, y2, noesemouth, black_dots). Uploading an SVG replaces it everywhere; one click goes back. Uploads get the same safety checks as the character SVGs. Two looks, both set in the tab and stored in the `brand` table:
- **In the app** (intro screen, creation-screen header): a tight CSS drop shadow (blur, distance, strength).
- **On the finished artwork** (for the later composite onto the final page): a real SVG stroke, width as a % of the logo's height. Color artwork gets a rounded edge around the whole silhouette in a chosen color; the black-and-white coloring page gets white fills (dark layers stay black) with a black line around every shape. Built in `src/lib/brand/logoArt.tsx` (`LogoArt` / `renderLogoArt`); not yet placed on the printed page.

**Kiosk sounds** (command center, **Sounds** tab): every kiosk button plays a sound. 14 actions (any button, Start, Next, Back, choosing a card, Surprise Me, keyboard key, backspace, flip card, quiz answer, Print, Change, All Done, trump card revealed), each with a chosen sound and volume, plus a master volume and an on/off switch. Sounds can be uploaded (MP3/WAV/OGG/M4A, up to 2 MB) and assigned. The engine (`src/lib/sfx/`) listens for button taps and picks the sound from `data-sfx` tags where set and otherwise from the button's wording. The built-in sounds are **synthesized in the browser** (Web Audio), so there are no audio files. Stored in the `sound_settings` table. **The Google Assistant cartoon sound library was not used:** its terms limit the sounds to Actions on Google, forbid use on non-Google platforms and forbid distributing the files separately. The operator dialogs stay silent (`data-sfx="none"`).

**Command center theme**: white, neutral and Inter (indigo accent), scoped to `.cc-root`; shared classes `cc-card`, `cc-btn`, `cc-input` etc. in `src/index.css`. The kiosk keeps its playful look.

**Head, pose and background pages** (2026-10-12): rebuilt as one shared layout from the design reference. Every piece is positioned as a percentage of the screen (logo, centered stepper with a connecting line, "Pick for Me!" pill, title and subtitle, cream preview card with gold border, Back bottom-left and Next bottom-right at 17.4% x 9.6%), so it scales from 1366x768 to 1920x1080. The options are a **swipeable carousel** of 3 x 2 pages with pastel cards (touch scroll-snap, mouse drag, arrows and page dots appear only with more than 6 items, and the selected item's page opens automatically). No vertical scrolling. The pose page crops the character to fill the preview and the cards; the background page centers the A4 scene. Components: `PickCarousel.tsx`, `.pick-page` styles in `src/index.css` (the old page-specific head/pose/world CSS was removed). Uploaded media is now cached by the browser (`Cache-Control: immutable`) because the scene images are about 2 MB each and were re-downloaded on every view. The stepper, "Pick for Me!" wording and Back/Next arrows are shared with the other steps; the colors, quiz, power and details pages keep their own layouts.

**Colours page** (2026-10-12): rebuilt from the design reference on the shared pick-page layout, with a **Simple / Advanced** switch centered between Back and Next.
- **Simple:** two panels of 15 glossy hexagon swatches. MAIN COLOUR sets the head, hoodie, trousers and shoes; SECONDARY COLOUR sets only the cuffs, trim, soles and hoodie strings. Gloves are always white.
- **Advanced:** one panel per part (head, hoodie, trousers, shoes, sleeve cuffs, clothing trim, shoe soles, hoodie strings), two per page, swiped left and right with page dots (no vertical scrolling). Parts left alone follow the simple choices.
- **Final artwork:** all colors go through one resolver (`src/lib/playys/colors.ts`), used by the preview, the pose cards, the final scene and the trump card. The black-and-white coloring page ignores the choices. The saved model is `config.colors = { mode, main, highlight, parts }`.
- Untouched, a character keeps its default colors from the command center (no swatch is marked until a color is chosen).

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

## Details screens and finished page
- Name, phone number and email are three separate screens (in that order) with a colourful on-screen keyboard (QWERTY with a 123 layer, big keypad for phone). Nothing can be skipped: each screen is validated (name not empty, phone at least 7 digits, email format).
- Pick for Me on the name screen gives a fun name. The preview card on the left shows the finished page as it is typed.
- The finished page (colour and black-and-white, preview and print) has the logo top left, the name big under the character, and "Notes: email - phone" as a small line at the bottom.

## Progress tabs, names and background page
- Command center has a Progress tabs tab (table `progress_tabs`): rename the eight top tabs, change their icons (original, built-in icon, uploaded image or emoji) and switch the labels off. The numbers ("1.") are gone from the labels.
- Pose, background (and every asset) names are edited in Characters, using the "Name shown on the kiosk" field at the top of the asset, then Save.
- Background page: portrait (A4) preview on the left; the world cards are portrait with the artwork edge to edge and the name laid over the bottom.
- Poses whose layers have no roles in the CMS follow the head's colour (see AssetArt).

## Power-up questions and power awarded
- Both screens use the shared pick-page chrome (progress tabs, Pick for Me, Back and Next in the shared bottom container).
- Questions: no character preview; the answers are a centred row of pastel cards (icon panel on top, label below) with a "Question x of y" badge. Tapping an answer moves on at once, so there is no Next button on the questions.
- Power awarded: the character stands on the left (no card) holding the symbol; the award panel is on the right.
- The old quiz-selection-page and power-selection-page styles were removed.

## Preview and trump card
- Preview page: the black-and-white and full-colour A4 pages side by side, with Back and Continue only.
- Trump card page: one large card, tap to flip. Front = only the finished coloured artwork inside a thick outline; back = the power (symbol and name from the power-up page), the stats and abilities. Back and Continue only, no footer.
- Command center has a Trump card tab (table `trump_card`): outline colour and thickness, corner roundness, back background and highlight colour, with a live preview. The power icons and stat icons are fixed (not editable there).
- Continue on the card goes on to the print and complete screen (still the old layout).

## Share, users log and email
- Final screen: the black-and-white page, the colour page and the trump card in a row, with Back and SHARE.
- SHARE: photographs the pages (html-to-image), POSTs them to `/api/submissions`, then opens the print dialog and goes on to the celebration screen. The print is the black-and-white page, the colour page and the card (front and back).
- Server: logs every Playyy in `submissions` (name, email, phone, date and time, a small card thumbnail, the character choices), builds two PDFs with pdf-lib (coloring pages; trump card) and emails them with nodemailer to the recipients in `share_settings`. If the email fails the four JPEGs are kept in `submission_files` so Resend works from the command center; if the kiosk cannot reach the server the Playyy is kept in the browser and sent on the next start.
- Command center: Users tab (table, search, Download CSV, Resend) and Share & email tab (two recipient slots, on/off switch, WhatsApp placeholder).
- Needs `SMTP_USER` and `SMTP_PASS` (Gmail app password) in `.env` and in Vercel. Until then emails show as "Not sent".
- WhatsApp is not built yet (waiting for the client's token).

## Open questions
- Cyan trim on the blue character is not a pure lightness shift (hue 196 vs 218). Keep it fixed, or derive it?
- Should the hoodie be split so the head sits inside the hood?
- Background 01 artwork looks cropped at the left and right edges in the preview; confirm that is intended.
- Where the trump card sits relative to the new black-and-white and color results screen.
- Should submissions (name, phone, artwork) be stored in the database as a log?

## Known issues and notes
- Colors page: the region names (Body, Clothing Trim...) are white on cream cards and hard to read (predates the pick-page work).
- The head, pose and background pages are laid out for a landscape screen (about 16:9); a portrait screen would need its own layout.
- The trump card quiz is unbalanced: every stat starts at 50 and the highest wins, so most answers give "Cosmic Explorer".
- Hosting: the server reads `PORT` and `HOST` (hosted = all interfaces) and turns the printer routes off unless `ENABLE_PRINTERS=1`. SQLite data does not survive redeploys on most hosts, hence Neon.
- The kiosk now needs a connection to Neon to load its assets. For an offline-capable kiosk, cache the asset library on the PC (not built yet).
- On Vercel the login rate limit is per function instance, so it is weaker than on the kiosk PC. Use a long password.
- With `npm run dev` listening on all interfaces, the `/api` routes are reachable from the LAN. The command center is password protected, but the printer routes are not.
- Expo app: Expo expects slightly different `react-native-svg` and `safe-area-context` versions (run `npx expo install --fix`), and `app.json` references icon and splash images that do not exist.
- `docs/PKD_Create_Your_Play_Functional_Document_v7.docx` is a local file, not committed.
