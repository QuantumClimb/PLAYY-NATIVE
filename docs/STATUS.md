# PLAYYS Kiosk: Status Report

Last updated: 2026-11-16 (WhatsApp live through Qikberry; print dialog off until the printer arrives; Freeform veil; mobile plan agreed). Active app: the **Vite web kiosk** with its command center and API. The Expo app (`expo-app/`) is paused until the mobile work starts. The clean-up plan is in [REFACTOR_PLAN.md](REFACTOR_PLAN.md).

## 1. Summary

The whole visitor journey works end to end: intro, a welcome choice (FIRST TIME? or Already a PlayyPal?), build a character (face, pose, colours: simple, advanced or freehand painting), power-up questions, power awarded, background, name, phone and email, preview, trump card, share (print, email to the team and to the visitor, WhatsApp, log) and a success screen that returns to the intro. The kiosk goes back to the intro after 4 minutes without a touch, and every page has a Home button. Everything the client edits lives in the command center. WhatsApp is live: after SHARE the visitor gets the PDF (coloring pages and the trump card in one file) with their name on WhatsApp, through Qikberry, from `https://playypals.vgpplayykingdom.com`. Until the client has a printer the print dialog is off and SHARE goes straight to the success screen. What is still open is listed in section 8.

## 2. How to run

| What | Command |
|---|---|
| Everything in one command | `npm start` builds the site and serves it with the API at http://localhost:3001 |
| Development (hot reload) | `npm run dev:all` (site on :3000, server on :3001) |
| Server only / site only | `npm run server` / `npm run dev` |
| Command center | `/command-center` (password in `.env`: `COMMAND_CENTER_PASSWORD`) |
| Operator dialog | `Alt+Shift+P` on any screen: **TEST PRINT** (one test page, printed the way the kiosk prints) and a **sound mute** switch (saved per PC) |
| Operator tools | hold the logo on the intro screen for 4.5 seconds |
| Kiosk PC setup | run `scripts/install-kiosk-shortcut.bat` once on the PC: it makes a "PLAYY Kiosk" shortcut (on the desktop, with the PLAYY head icon; it asks whether to also start with Windows, so answer N on your own PC) that opens the Vercel site in Chrome with `--kiosk --kiosk-printing --autoplay-policy=no-user-gesture-required` (full screen, no print preview, music from the start). Set the right printer as the Windows default. Alt+F4 leaves the kiosk. |
| Print helper (optional) | `npm run print-helper` prints the finished pages through SumatraPDF or the PDF app; switch it on in the browser console (see README). Not needed with the shortcut. |

`.env` needs `DATABASE_URL` (Neon Postgres, shared by local runs and Vercel), `COMMAND_CENTER_PASSWORD`, and, for email, `SMTP_USER` and `SMTP_PASS` (optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`). See `.env.example`. Pushing to `main` deploys to Vercel; its environment variables must match.

## 3. The visitor journey

Every page after the welcome screen shares one layout: logo, progress tabs, title and subtitle, "Pick for Me!" where it applies, a round **Home** button (back to the intro) to its right, and Back / Next in one bottom container. Visitor-facing instructions say **PlayyPal** ("Pick a face for your PlayyPal!"); the character's own name is unchanged. No page scrolls vertically; option lists swipe sideways.

| Step | What happens |
|---|---|
| Intro | Looping video, logo, sign, Tap to Start, four badges. |
| Welcome | **FIRST TIME?** goes on to the normal flow. **Already a PlayyPal?** opens a phone keypad: the number is kept on the server (so it can be followed up if the visitor never finishes) and pre-filled on the phone screen, then the normal flow follows. No footer on this screen. |
| 1 Face | Swipeable cards of heads. The head also sets the outfit and secondary colours. |
| 2 Pose | Swipeable pose cards; the character preview recolours with the chosen head. |
| 3 Colours | Simple (main + secondary colour), Advanced (each part) or Freeform (finger painting over the white line art, outlines are not barriers, multiplied so the black lines stay on top; clear/undo/eraser, 3 brush sizes; the painting is kept out of the data sent to the server), 15 glossy hexagon swatches. Gloves stay white outside Freeform. |
| 4 You | Power-up questions: a centred row of pastel cards, no preview. An answer moves straight on. |
| 5 Power | Power awarded: the character holds the symbol, award panel on the right. |
| 6 Background | Portrait preview card; world cards with the artwork edge to edge. |
| 7 Name | Three screens with a colourful touch keyboard: name, phone, email. Nothing can be skipped; each is validated. The preview shows the finished page as it is typed. |
| 8 Preview | Black-and-white page and full-colour page side by side. Back and Continue. |
| Trump card | One large card, tap to flip: front is the finished artwork in a thick outline, back has the power, stats and abilities. Back and Continue, no footer. |
| Share | The two pages and the card in a row. **SHARE** photographs them, logs the visitor, emails two PDFs, sends the WhatsApp message, and moves on. The print dialog opens only when `PRINT_DIALOG` is switched on (it is off until the client has a printer). |
| Success | Confetti and a "Sharing now" step (the pages are on their way by email and WhatsApp), then "Sent to our team"; returns to the intro after 20 seconds or on FINISH. The old print-again button is gone. |

The finished page (preview, print, PDF) has the logo top-left and the name big under the character. The email and phone are no longer printed. The trump card front has the logo and name too. The name lettering is built from plain stacked letter copies (no filters), because filters printed as a grey wash on some printers. Colour choices go through one resolver, `src/lib/playys/colors.ts`. The black-and-white page ignores colour choices. In the black-and-white logo every shape gets a black stroke, except the seven VGP block shapes, which are marked `data-line-stroke="none"` in `public/assets/SVG/logo/logo.svg` so the stroke does not swallow their letters (`src/lib/brand/logoArt.tsx` skips marked shapes; the colour logo is unaffected, and an uploaded logo has no marks).

**Freeform colouring** (the third option on the colours page): the left card becomes a painting canvas over the white line art of the body and head, and the right side shows the palette (the same colours as the other modes), three brush sizes, Eraser, Undo (10 steps) and Clear. The outlines are not barriers; the paint layer is multiplied over the art, so black lines stay black. The painting is one transparent PNG (`config.paint`) that covers the body and head bounds, so it lines up on the pose preview, the A4 page, the trump card, the celebration screen and the printed colour page (`SceneLayers.tsx`). It is cleared when the head or pose changes (it is fitted to one drawing) and when the kiosk returns to the intro. It is not part of what `sendShare` sends, so it is not stored in the database or the Users tab; only the colour mode (`freeform`) is. "Pick for Me!" is hidden in this mode. While Freeform is showing, a white veil at 80% opacity covers the page background (`.paint-veil`) so it feels like a canvas and the swatches stand out, and a paintbrush icon sits beside the three brush sizes. Covered by a unit test and a browser test (a stroke is painted and the submission has no `paint`); the printed capture was checked by eye.

The browser print dialog is switched off by one flag, `PRINT_DIALOG = false` in `src/lib/print/printDialog.ts`, because the client has no printer yet; set it to `true` when one is installed. When it is on, printing sends the black-and-white page, the colour page and the card front and back. With the kiosk shortcut (`--kiosk-printing`) it prints straight to the Windows default printer; in an ordinary browser tab the print preview appears. The website cannot list the PC's printers (the server runs on Vercel), so the old printer-detect list was removed.

## 4. Command center (`/command-center`)

Password protected. Tabs:

| Tab | Controls |
|---|---|
| Characters | Heads, face, poses, symbols, backgrounds: SVG upload with checks (no scripts or external links), named layers become parts (main, derived, fixed, line), anchors, per-head colours (head, outfit, secondary), A4 scene preview, stand point and size, and the **name shown on the kiosk** for each asset. |
| Scene backgrounds | Page backgrounds (image or video) per screen, plus intro layout options. |
| Intro badges | The badges under the start button: label, icon (built in, upload or emoji), colour, order. |
| Progress tabs | Rename the eight top tabs, change their icons, or hide the labels. |
| Trump card | Outline colour and thickness, corner roundness, back background and highlight colour, with live preview. Power symbols and stat icons are fixed. |
| Users | **Counters** (people who used it = everyone who chose FIRST TIME or Already a PlayyPal; first time; already a PlayyPal; finished a Playy), then everyone who finished: name, email, phone, **card serial**, date and time, a card thumbnail, the character choices, the email status and the **WhatsApp status** (Sent, Not sent with the reason on hover, Off). Search (name, email, phone, serial), CSV download, **Clear all users** (asks first; empties the list, the unfinished numbers and the counters). Below: **Started but did not finish**, the phone numbers typed on "Already a PlayyPal?" with no finished Playy under the same number, one per number. |
| Share & email | Two recipient slots (currently qcquantumclimb@gmail.com and aum.janakiram@gmail.com), on/off, and a WhatsApp box that says whether WhatsApp is on (it is set up in the environment, not here). |
| Power quiz | The questions, answers and the symbol each answer leans toward. Each answer's icon has an **Emoji / SVG-PNG toggle**: type an emoji, or upload an SVG or PNG (SVGs get the same safety check as character SVGs; both choices are kept, so switching back loses nothing). |
| Logo | Replace the logo SVG; in-app drop shadow and an artwork stroke. The built-in logo is now the Playy Kingdom (PK) logo; an uploaded logo overrides it. |
| Sounds | A sound and volume for 14 kiosk actions, uploads, and the **background music playlist** (order, volume, preview, add songs). |

The command center uses a white, Inter theme (`.cc-*` classes); the kiosk keeps its playful look.

## 5. Sharing, email and the users log

- `POST /api/submissions` receives the name, email, phone, the card serial, a thumbnail, the character choices and four JPEGs (about 1.5 MB). It stores the row, builds two PDFs with `pdf-lib` (coloring pages; trump card) and sends two emails with `nodemailer`: one to the recipients in the command center (the team copy) and one **to the address the visitor typed**, each tried twice. The PDFs exist only while the emails are sent; nothing large is stored, so there is no Resend. The email switch in Share & email turns all emailing off.
- **Card serial:** `XXXXX-XXXXX` (10 characters, no look-alike letters, from the browser's secure random source), stored with the submission under a unique database rule. A resend of the same Playy (kiosk retrying after a lost answer) returns the existing row and is not emailed twice. Older rows have no serial. If the kiosk cannot reach the server, the Playy is kept in the browser and sent on the next start.
- **Counting people:** `POST /api/visits` (FIRST TIME) and `POST /api/leads` (Already a PlayyPal, which also stores the phone number) each add one row to `visits`. These are open routes, rate limited per address.
- Pictures are taken in the browser with `html-to-image` (the fonts are read once and embedded; this needed `crossorigin` on the Google Fonts link).
- **WhatsApp (Qikberry):** WhatsApp goes through Qikberry's REST API (`POST https://rest.qikberry.ai/v1/whatsapp/messages`, bearer token, the business number in the `x-phone-number` header), not Meta's Graph API; the 32-character token is a Qikberry key. After the emails, `server/shareService.mjs` sends the visitor an approved template message (`server/whatsapp.mjs`), tried twice, independent of the email result. A 10-digit visitor number is taken as Indian (+91); so is a 10-digit sender number. `WHATSAPP_TEMPLATE_HEADER` is `document` (the template's header holds a PDF), `text` (the visitor's name is the header) or `none`. A template header holds one file, so in `document` mode the coloring pages and the card are merged into one 3-page PDF (`combinePdfs` in `server/pdf.mjs`; the emails still carry two). Qikberry downloads the PDF from a public link, so it is kept for 24 hours in the `share_files` table behind a long random token (`GET /api/share-files/:token/:name`; expired files are deleted on the next save). The body variable is the visitor's name; the template uses a named variable, so `WHATSAPP_TEMPLATE_PARAM_NAME=name` adds `parameter_name` to the request (empty for a positional `{{1}}`). The result is stored on the submission (`whatsapp_status`, `whatsapp_error`).
- **Live setup (Vercel environment):** `WHATSAPP_TOKEN`, `WHATSAPP_SENDER_NUMBER=917200637887`, `WHATSAPP_TEMPLATE_NAME=playypals_attachment`, `WHATSAPP_TEMPLATE_LANGUAGE=en`, `WHATSAPP_TEMPLATE_HEADER=document`, `WHATSAPP_TEMPLATE_BODY=name`, `WHATSAPP_TEMPLATE_PARAM_NAME=name`, `SITE_URL=https://playypals.vgpplayykingdom.com` (CNAME `playypals` to the project's `vercel-dns-017.com` address at GoDaddy; a forwarding rule had to be removed first). WhatsApp is off until the token, number and template name are set. The template (Utility, English, Document header, `Hi {{name}}, your PlayyPal is ready! ... Your coloring pages and Trump Cards are attached ...`) is made in the client's Qikberry dashboard under the VGP Playy Kingdom number; Qikberry has no API to create templates.
- **Checking a send:** the app only records "Sent" when Qikberry accepts a message, which is not delivery. The real result is `GET https://rest.qikberry.ai/v1/whatsapp/status?message_ids=<messageId>` (same headers; SENT, DELIVERED, READ or FAILED, with Meta's error text). Example found this way: error 132000 (parameter count does not match) came from a template that had no variable at Meta. The `/v1/sms/status` endpoint in Qikberry's docs is SMS only. The app does not store the message ID yet.
- **Cost:** about 0.15 per send for a Utility template (0.9 for the Marketing templates used in early tests; Qikberry's `charges` field).
- **Tested:** the live kiosk flow works: a real Playy arrives on WhatsApp with the 3-page PDF and the name.

## 6. Data and architecture

- **Neon Postgres** through the serverless driver, plain SQL in `server/db/`. Tables: `assets`, `media_files`, `scene_backgrounds`, `power_quiz_questions`, `intro_badges`, `progress_tabs`, `trump_card`, `brand`, `sound_settings`, `share_settings`, `submissions` (one small thumbnail and the card serial per visitor, no pages or PDFs; plus the email and WhatsApp results), `share_files` (WhatsApp PDFs, kept 24 hours), `leads` (phone numbers from Already a PlayyPal), `visits` (one row per start, for the counters), `app_migrations`; an old `submission_files` table (about 7 MB of earlier visitors' pictures) still exists and can be dropped.
- **Database plan and cost:** the Neon project is on the **Launch** plan (billed through Vercel): storage $0.35 per GB-month, compute $0.106 per compute-hour. The database is about 48 MB. At 100 users a day expect roughly $5 to $10 a month for the database (compute dominates). The free plan's quota was exceeded once during testing, which made every `/api` call fail and the kiosk fall back to its few built-in characters (wrong poses and alignment). To keep transfer low, the read-only kiosk content (`/api/assets`, scene backgrounds, brand, sounds and the other settings) is cached at Vercel's edge for 5 minutes (`server/cache.mjs`); someone signed in to the command center always gets fresh data, so a command center edit reaches kiosks within about 5 minutes.
- **One Express app** (`server/app.mjs`) with two launchers: `server/kiosk-server.mjs` (local, also serves the built site) and `api/index.mjs` (Vercel function, routed by `vercel.json`). Printer and print routes are off on Vercel; `server/print-helper.mjs` is a small separate server for the kiosk PC.
- **Frontend:** React 19, Vite 6, Tailwind 4 for utilities, plain CSS in `src/styles/` (one file per feature) for the page layouts. Layouts use percentages of the screen so they scale from 1366x768 to 1920x1080.
- **SVG engine** (`src/lib/assets/svgParts.ts`): named Illustrator layers become parts; one source SVG gives the colour and black-and-white versions. `scene.ts` lays out the A4 scene (5 mm margin, background stretched, character on the stand point).
- **Sounds** are synthesized in the browser (no audio files, no licensing); background music files are in `public/assets/audio/music`.

## 7. Decisions

- Neon Postgres; Prisma left out (plain SQL is enough; revisit if the schema grows a lot).
- One API app with two launchers (local and Vercel).
- Characters: a head colour, an outfit colour (defaults to the head colour) and an optional fixed secondary colour. The face is a shared asset.
- PDFs and thumbnails are made in the browser, not on the server (the server stays small enough for Vercel).
- Google's cartoon sound library was not used (its terms limit it to Actions on Google); sounds are synthesized instead.
- Email first, WhatsApp behind the same share step through Qikberry (Meta's Graph API is not used). One PDF with the coloring pages and the card goes on WhatsApp because a template header holds one file. SHARE sends straight to the email and WhatsApp with no print dialog until the client has a printer.
- Phones: landscape only. In portrait a "Please rotate your phone" screen is shown (decided 2026-11-16; real portrait layouts were dropped).

## 8. Open items

**Needs the client**
1. WhatsApp (see the list below). Email is set up and tested (Google Workspace, noreply@vgpplayykingdom.in); add the same SMTP variables to Vercel.
2. Test the kiosk shortcut on the real kiosk PC: no print preview, the right printer, no grey over the name on the printout, music from the start.
3. Confirm the Vercel deploy with all environment variables once SMTP is set.
4. When the client approves the final: move the Vercel project to a **Pro** (commercial) plan; the free Hobby plan is for non-commercial use. A paid Vercel plan covers every project in the team.

**WhatsApp: what is left**
1. Consent line on the details screen (messaging rules and DPDP), and which countries to send to (cost differs). The phone keypad accepts international numbers; a number typed without "+" is taken as Indian.
2. Store Qikberry's message ID on each submission and show Delivered or Failed (with the reason) in Users, using the status endpoint above. Small change; not done.
3. Keep some balance in the Qikberry wallet; each send costs about 0.15.
4. The `playypals` (text only) and `playypals_` (name in the header) templates are still approved and work with `WHATSAPP_TEMPLATE_HEADER=none` or `text`; `playypals_pdf` was created with no variable at Meta and never worked (do not use).

**Phone support (plan agreed, not started)**
The layouts use `vw`/`vh` percentages designed for a landscape screen close to 16:9, with no portrait design and one media query. Steps: (1) a "Please rotate your phone" cover in portrait on phone-sized screens (under about 900 px wide), keeping the kiosk state underneath; (2) a fixed 16:9 stage fitted to the screen with the CSS moved from `vw`/`vh` to container units, so wide phones stop stretching the pages (the risky step; the screenshot tests protect it); (3) a polish pass on small landscape phones (touch size, keyboard, painting area); (4) a landscape lock where supported, an add-to-home-screen setup, and a real iPhone and Android test of the card and PDF capture; (5) phone sizes and both orientations in the Playwright tests. iPhones cannot be locked to landscape by a website.

**Known issues**
- The Users tab does not yet show each visitor's card stats (they are saved with every submission in its `config`).
- Page class names still use the old `head-*` / `pick-*` prefixes, and some headers use `display: contents`; renaming them is cosmetic and was left out to keep the screenshots identical.
- `ExpoProjectExporterModal` is not reachable from any screen.
- Local fallback assets can hide a database error in the kiosk (this is what happened when the database quota ran out); decide whether the kiosk should show an error instead.
- The counters count people who chose a start option on the welcome screen; someone who walks away from the welcome screen without choosing is not counted. A returning PlayyPal who makes several Playys is counted once per visit.
- `scripts/PlayyPal.zip` is an untracked local file.
- The saved quiz in the database may still hold older wording; re-save it in the Power quiz tab.
- The CI workflow is in `docs/ci.yml.example` because the push token lacks the `workflow` scope.
- Colours page: region names are white on cream and hard to read.
- Freeform painting was tested with a mouse in desktop Chrome only; try it with a finger on the kiosk touchscreen (stroke smoothness, the three-button mode switch width). The unfinished painting is not kept if the visitor goes back to change the head or pose.
- The pages are laid out for a landscape screen (about 16:9).
- The kiosk needs a connection to load its assets (no offline cache).
- On Vercel the login rate limit is per function instance. Use a long password.
- With `npm run dev` the `/api` routes are reachable from the LAN (printer routes are not password protected).
- Quiz answer icons (SVG or PNG uploads) have only been checked on the kiosk with mocked data; do one real upload in the command center. The media store now accepts SVG for every image upload (served with a no-script security header), but the intro badge and progress tab pickers still only offer PNG, JPG and WebP.
- Uploads through Vercel are limited to about 4.5 MB per request, so large songs go in `public/assets/audio/music`.
- `docs/PKD_Create_Your_Play_Functional_Document_v7.docx` is a local file, not committed.
- Expo app: wants slightly different `react-native-svg` and `safe-area-context` versions and its `app.json` points at missing icon and splash images.

**Open design questions**
- The cyan trim on the blue character is not a pure lightness shift. Keep it fixed or derive it?
- Should the hoodie be split so the head sits inside the hood?
- Background 01 artwork looks cropped at the left and right edges in the preview. Intended?

## 9. Next

1. Phone support, step 1 (the rotate screen) then step 2 (the fitted stage); see section 8.
2. Store the WhatsApp message ID and show delivery in Users.
3. Check a Vercel deploy of the restructured server.
4. Add a balance table (how often each power and character type comes up) to the Power quiz tab.
5. Show the card stats in the Users tab.
