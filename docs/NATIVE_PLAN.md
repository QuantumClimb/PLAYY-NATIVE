# PLAYYS Native: Phased Delivery Plan

Last updated: 2026-10-15. Status: plan only, no native code written yet.

## Overview

PLAYYS Native is a separate React Native app that mirrors the existing PLAYYS kiosk: the same screens, the same characters and the same command center, shipped as an Android app, an iOS app and a Windows executable. All three read and write the same API and Neon database as the web kiosk, so anything the client edits in the command center appears everywhere, and every visitor lands in the same Users list.

The current Vite web app is not changed. One codebase serves all three products; each platform is delivered, priced and supported on its own.

The work runs in 13 phases (0 to 12). Phases 0 to 8 build the shared foundation. Phases 9, 10 and 11 release Android, iOS and the Windows exe as separate deliverables. Phase 4 is a go or no-go gate: the riskiest pieces are proven on all three targets before most of the budget is spent.

## Scope: what "mirror" means

Mirror means the native app does everything the web kiosk does, from the same data, and looks the same to a visitor. It does not mean the web CSS is reused: every screen is rebuilt in React Native and tuned against the web version. The checklist below is agreed in Phase 0 and becomes the sign-off list in Phase 8.

| Area | In scope (mirrors the web kiosk) |
| --- | --- |
| Visitor journey | Intro, welcome (FIRST TIME / Already a PlayyPal), face, pose, colours (simple, advanced and freeform painting), power quiz, power awarded, background, name, phone, email, preview, trump card with flip, share, success |
| Character engine | Uploaded SVGs split into named parts (main, derived, fixed, line), colour and black-and-white versions, A4 scene layout, name lettering |
| Outputs | Two coloring pages and the trump card (front and back) as images and PDFs, card serial, email to the team and to the visitor through the existing API |
| Data | Same endpoints for assets, backgrounds, brand, sounds, badges, tabs, trump card, quiz, share settings, visits, leads and submissions |
| Command center | Unchanged. Every setting it controls drives the native apps. One small addition: a platform filter in the Users tab |
| Sound and feel | The 14 action sounds, the music playlist, mute, haptics, confetti |
| Counters | First time, returning PlayyPal and finished counts, with a source tag per platform |

Out of scope unless added later:

- Changes to the web kiosk or the command center beyond the platform tag and filter.
- WhatsApp sending, which is waiting on the client's administrator and would follow the same share step on every platform.
- A native Microsoft Store app. The Windows exe is a signed installer for kiosk and desktop use (Phase 11).

## Architecture

One React Native codebase builds all three apps and talks to the backend that already exists; platform differences are confined to adapters.

```
repo/
  src/ server/ api/          existing web app + API (untouched)
  packages/core/             DOM-free logic: colours, quiz, archetypes, stats, serial, validation
  apps/native/               new Expo app, all screens shared by every target
      platform/              one adapter per platform: capture, pdf, audio, print, storage, share
  apps/windows/              exe shell (Phase 11)

Android app, iOS app, Windows exe  <-- built from apps/native
apps/native  <-- HTTPS, same endpoints -->  Express API (Vercel) -> Neon Postgres
                                            Command center and web kiosk use the same API
```

Every platform difference (screenshot capture, PDF, audio, printing, storage, sharing) sits in one adapter file per platform, so the screens are written once and each platform's cost is its adapter, its testing and its release.

The Windows exe wraps the web export of the same app in Electron or Tauri, which gives kiosk mode and silent printing. A fully native Windows build (react-native-windows) was considered and not chosen, because several libraries the app needs do not support it.

Backend changes are additive only: a source tag per platform, per-platform rate limits and an allowed origin for the exe. The web kiosk and the command center behave as they do today.

## Phases 0 to 8: the shared foundation

These nine phases build everything the three apps share, about 14 to 16 weeks for one developer. Each ends with an exit check that must pass before the next phase starts. Phase 4 is the go or no-go gate: if a technical spike fails, the approach changes there, before most of the budget is spent.

| Phase | Work | Exit check | Weeks |
| --- | --- | --- | --- |
| 0. Decisions and contracts | Agree the "mirror" checklist, repo layout and shared-package approach. Create the accounts: Apple Developer (US$99 a year), Google Play (US$25 once), Windows code-signing certificate. Write the privacy policy and consent line. Line up test devices (a small and a large iPhone, two Android phones, one Windows PC). | Signed-off scope; accounts created | 1 |
| 1. Foundation | Expo app on the current SDK with React 19 and strict TypeScript; lint, tests and CI; EAS build profiles per platform; environment config; navigation mirroring the kiosk flow; design tokens and embedded fonts. | Empty step flow runs on an Android phone, an iPhone and in a browser | 1 |
| 2. Shared core | Copy the DOM-free logic into a shared package with tests: colours, quiz, archetypes, stats, serial, card, validation. Copied, not moved, because the web app is not to be touched; sharing can follow later. | Core tests give the same results as the web app | 1 |
| 3. API and data layer | Typed client for every endpoint the kiosk uses; cache for assets and settings; offline queue and retry for a Playy that could not be sent; media caching; clear error screens instead of a silent fallback. | App loads real assets and settings from the live database | 1 |
| 4. Technical spikes (go or no-go) | Prove on all three targets: SVG parts and recolouring, the A4 scene and name lettering, image capture of the pages and card, on-device PDF within low-end memory, sounds and music. | Same Playy matches the web in side-by-side screenshots on every target; go or no-go agreed with the client | 2 |
| 5. UI kit and first slice | Shared components; intro, welcome (with a numeric keypad using the native keyboard), face and pose; swipeable lists; responsive rules for phone, tablet and the exe window. | First four screens match the design at every target size | 2 |
| 6. Remaining screens | Colours (simple and advanced), power quiz, power awarded, background, name, phone and email with validation, preview, trump card flip, share, success; sounds, haptics, confetti; accessibility pass. | Full visitor journey end to end against a test database | 3 to 4 |
| 7. Submission and outputs | Send submissions exactly as the web does (thumbnail, serial, choices, four JPEGs) so email and the Users tab work unchanged; share sheet, save to photos, print where the platform allows; visits and leads counters; source tag and Users tab platform filter. | A Playy made in the app appears in the command center and in the emails | 1 to 2 |
| 8. Parity QA and hardening | Screenshot parity for a fixed set of Playys on every target; real-device tests (low-end Android, older iPhone, weak network, airplane mode, interrupted submission, rotation, low storage); performance budgets; crash reporting; security and consent review. | Every item on the Phase 0 checklist passes | 2 |

## Phases 9 to 12: the three releases and ongoing care

Once Phase 8 passes, each platform is released as its own deliverable and can be sold, scheduled and supported separately. Android, iOS and the Windows exe can run in any order or in parallel.

| Phase | Work | Exit check | Weeks |
| --- | --- | --- | --- |
| 9. Android release | Play Console listing and data-safety form, signing, AAB build through EAS, internal test, then closed test (Google requires a test period for new personal accounts), then production. | App live on Google Play | 1, plus store review |
| 10. iOS release | Apple account, certificates and provisioning (EAS manages them, no Mac needed), TestFlight, App Store listing, privacy labels, review notes with a demo path. Apple review is the least predictable step in the plan. | App live on the App Store | 1 to 2, plus store review |
| 11. Windows exe | Web export of the app wrapped in Electron or Tauri; kiosk mode, auto-start and lock-down; silent printing to the default printer, replacing the current Chrome shortcut flags; operator dialog with test print; offline asset cache; code-signed installer with auto-update; test on the real kiosk PC. | Signed installer runs on the kiosk PC and prints without a dialog | 2 to 3 |
| 12. Handover and maintenance | Documentation and runbook, a release process per platform, a monthly dependency and OS-update check (iOS and Android force yearly SDK updates), and a bug-fix retainer. | Client team can ship a release from the runbook | Ongoing |

## Effort and pricing structure

The shared foundation is about three quarters of the total effort, and each release after it is small and separately billable.

```
Phases 0-3 (4 wks) -> Phase 4 spikes (2 wks) -> GO / NO-GO -> Phases 5-8 (8-10 wks) -+-> Phase 9  Android      1 wk + review
                                                                                      +-> Phase 10 iOS         1-2 wks + review
                                                                                      +-> Phase 11 Windows exe 2-3 wks
```

The release phases do not depend on one another, so Android, iOS and the Windows exe can be sold, scheduled and supported on their own.

| Block | Phases | Effort, one developer | How it is billed |
| --- | --- | --- | --- |
| Shared platform build | 0 to 8 | 14 to 16 weeks | Once, as the platform build, or recovered across the three platform prices (a decision for the commercial agreement) |
| Android release | 9 | 1 week, plus store review | Android price |
| iOS release | 10 | 1 to 2 weeks, plus store review | iOS price |
| Windows exe | 11 | 2 to 3 weeks | Windows exe price |
| Maintenance | 12 | Ongoing | Retainer per platform |

These figures are rough ranges. They firm up at the Phase 4 gate, once the SVG, capture, PDF and audio spikes have run on all three targets.

## Risks and mitigations

The two technical risks that could change the plan are tested first, in the Phase 4 spikes; the rest are managed through the release phases.

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| SVG fidelity | The character engine recolours named SVG layers. The native SVG renderer differs slightly from browsers, so characters could look different. | Phase 4 spike with side-by-side screenshots against the web on several heads, poses and backgrounds |
| On-device capture and PDF | Photographing the pages and building PDFs uses a lot of memory on low-end phones. | Phase 4 spike on a low-end Android; fall back to lower resolution or server-side assembly if needed |
| Sounds | The web synthesizes its sounds in the browser, which native apps cannot do. | Pre-render the 14 sounds to files from the existing synthesizer and compare by ear |
| Store approval | The app collects names, emails and phone numbers; Apple review is the least predictable step. | Consent line and privacy policy from Phase 0; working demo path in the review notes |
| Yearly platform updates | iOS and Android force SDK updates each year. | Maintenance retainer (Phase 12) with a monthly dependency check |
| WhatsApp | Still waiting on the client's administrator for a valid token; it affects every platform. | Add it behind the existing share step when the token arrives; not on the critical path |

## Client dependencies, assumptions and next steps

The plan assumes the items below are settled in Phase 0. Work starts with Phase 0 and Phase 1, followed by the Phase 4 spikes so the client sees a character render and a PDF build on all three targets before committing to the rest.

Assumptions:

- One developer, with the estimates in weeks of full-time work.
- The web kiosk, its repository layout and the command center are not changed, apart from the small additive API and Users tab changes listed above.
- The native app copies the shared logic at first; moving it into a shared package waits for permission to touch the web app.
- Android and iOS apps use the existing database and email setup, which still needs the SMTP password added to the deployment.

Decisions and items needed:

- [ ] Approve the "mirror" scope checklist (Phase 0).
- [ ] Create or provide the Apple Developer, Google Play and code-signing accounts, and say who owns each.
- [ ] Approve the privacy policy and the consent wording shown where names, emails and phone numbers are collected.
- [ ] Provide test devices, or agree that we buy them.
- [ ] Choose how the shared build is billed: once up front, or recovered across the three platform prices.
- [ ] Confirm whether a Microsoft Store app is wanted, or a signed installer is enough.
