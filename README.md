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

When the kiosk opens the hosted website, the browser shows its print preview. To print straight to the default printer instead:

1. On the kiosk PC run `npm run print-helper` (keep it running; it needs no database). Install [SumatraPDF](https://www.sumatrapdf.org/) for fully silent printing; without it the PDF app's own print command is used.
2. Open the printer dialog (Alt + Shift + P) and switch on **Silent printing**. The setting is kept in that browser.
3. SHARE and PRINT AGAIN now send the pages to the helper. If the helper is not running, the normal print dialog opens instead.

The helper only accepts calls from localhost and `*.vercel.app`; add other sites with `PRINT_ALLOWED_ORIGINS` (comma separated). Starting Chrome with `--kiosk-printing` also skips the preview, without the helper.

## Check it

```
npm run check        # types, lint, formatting, dead code, unit tests
npm run test:e2e     # a visitor walks the whole flow; the command center opens every tab
npm run test:visual  # screenshots of every kiosk page against the saved baselines
npm run test:visual:update   # accept new screenshots (they depend on the live command center data)
```

CI: `docs/ci.yml.example` is the workflow. Copy it to `.github/workflows/ci.yml` (a token with the `workflow` scope is needed to push that path).
