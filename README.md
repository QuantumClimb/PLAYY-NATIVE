# PLAYYS Kiosk

A touch-screen kiosk where a child builds a character, answers power-up questions, gets a trump card, and shares it (print, email, log). Everything the client edits lives in the command center at `/command-center`.

- **Status and open items:** [docs/STATUS.md](docs/STATUS.md)
- **How the code is organised:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **The refactor plan and the stats system:** [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md)

## Run it

```
npm install
npm start          # builds the site and serves it with the API at http://localhost:3001
npm run dev:all    # development with hot reload (site :3000, server :3001)
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `COMMAND_CENTER_PASSWORD` and (for email) `SMTP_USER` / `SMTP_PASS`.

## Silent printing (kiosk PC)

Run `scripts/install-kiosk-shortcut.bat` on the kiosk PC. It makes a "PLAYY Kiosk" shortcut (desktop and Startup) that opens the site full-screen in Chrome with `--kiosk-printing`, so prints go straight to the Windows default printer with no preview. Alt + Shift + P opens TEST PRINT to check it.

Optional print helper (not needed with the shortcut): `npm run print-helper` prints the finished pages through SumatraPDF or the PDF app. Switch it on in the browser console with `localStorage.setItem('playys-silent-print-helper', '1')`. It only accepts calls from localhost and `*.vercel.app`; add other sites with `PRINT_ALLOWED_ORIGINS`.

## Check it

```
npm run check        # types, lint, formatting, dead code, unit tests
npm run test:e2e     # a visitor walks the whole flow; the command center opens every tab
npm run test:visual  # screenshots of every kiosk page against the saved baselines
npm run test:visual:update   # accept new screenshots (they depend on the live command center data)
```

CI: `docs/ci.yml.example` is the workflow. Copy it to `.github/workflows/ci.yml` (a token with the `workflow` scope is needed to push that path).
