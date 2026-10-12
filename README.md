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

## Check it

```
npm run check        # types, lint, formatting, dead code, unit tests
npm run test:e2e     # a visitor walks the whole flow; the command center opens every tab
npm run test:visual  # screenshots of every kiosk page against the saved baselines
npm run test:visual:update   # accept new screenshots (they depend on the live command center data)
```

CI: `docs/ci.yml.example` is the workflow. Copy it to `.github/workflows/ci.yml` (a token with the `workflow` scope is needed to push that path).
