# Handoff — Wizard Breaker Game session (2026-09-20)

Branch: `claude/next-steps-byvc1c` → PR [#2](https://github.com/Deegan4/wizard-breaker-game/pull/2) (draft, open)

## What was found and fixed

1. **Crash: debrief screen not wired up** (`1450044`) — `app/game.tsx` referenced `DebriefScreen`, `showDebrief`, `lastTechnique`, `lastAttempts` without importing/declaring any of them. Completing a non-final level threw a `ReferenceError` at runtime.
2. **Crash: app failed to load at all** (`e7892c8`) — `app/_layout.tsx` nested `<AchievementProvider>` *outside* `<GameProvider>`, but `AchievementContext` calls `useGame()` internally. Every page load hit the root error boundary. Found by actually driving the app in a headless browser while building the run skill, not by lint/tests.
3. **Run skill added** (`4fed319`) — `expo/.claude/skills/run-wizard-breaker-game/` with a Playwright driver (`screenshot`, `play-level1` commands) for launching the Expo web build headless and driving a real playthrough. Documents that `bun run start`/`start-web` need the Rork tunnel and won't work headless — use `npx expo start --web` instead.
4. **CI replaced** (`0eb4245`, `fba9dc3`, `2d16d2e`) — the only workflow (`webpack.yml`) ran `npm install && npx webpack` at the repo root with no root `package.json`/webpack config; it had failed on every push to `main` for its entire history. Also found a *complete, correct* CI + GitHub Pages deploy setup already written but stranded at `expo/.github/workflows/` (GitHub only reads repo-root `.github/`), so it had never run either. Moved both to `.github/workflows/` (`ci.yml`, `deploy.yml`), verified every step of the deploy pipeline by hand (`expo export --platform web` → path rewrites for the `/wizard-breaker-game/` subpath → SPA 404 redirect → PWA manifest/service-worker injection → served correctly via `server.ts`).
5. **Lint cleaned** (`32e3b9d`) — 20 warnings → 0 (unused imports/vars, `Array<T>` → `T[]`, missing hook deps).
6. **Jest infra fixed** (`fba9dc3`) — `jest.config.js` had a typo (`setupFilesAfterSetup` instead of the real Jest key `setupFilesAfterEnv`), so `jest.setup.ts`'s mocks (expo-router, expo-haptics, AsyncStorage, etc.) had *never actually loaded* since the file was added — the one existing test suite just doesn't need them, so nothing caught it. Turning it on for the first time surfaced JSX-in-`.ts`, strict-mode implicit-anys, and that `ts-jest` can't handle React Native's untranspiled ESM/Flow source at all. Switched to Expo's own `jest-expo` preset (the officially supported way to run Jest against an Expo app). Also fixed a real `styles.buttonDisabled` typo in the Lab screen and gave the previously-unwired `server.ts` proper Bun types.
7. **Docs fixed** (`0e31160`) — `CLAUDE.md`/`AGENTS.md` said "8 levels" (it's 12 + Adventures) and "no test suite" (there's a 38-test Jest suite now), were missing the Daily/Lab tabs, and had a stale/wrong GitHub Pages deploy description.

Every fix was verified against the **actual running app** (headless Chromium via the new run skill — home screen loads, onboarding dismisses, level 1 beats, debrief renders), not just lint/tsc/jest output.

## Current blocker — not a code issue

**GitHub Actions on this account is billing-locked.** Every workflow run — old and new — fails in ~2-3 seconds with zero step logs; the run page shows *"The job was not started because your account is locked due to a billing issue."* This is why the old `webpack.yml` also failed near-instantly across its entire history (previously misattributed solely to the missing root `package.json` — that was also true, but the billing lock means nothing has run in CI on this repo regardless of workflow content).

**What's needed:** the repo owner resolves the billing issue on their GitHub account (billing settings → payment method / outstanding balance). Nothing else is blocking — the CI workflow itself is verified correct by running its exact steps locally (`bun i`, `bun run lint`, `npx tsc --noEmit`, `bun run test:coverage --ci`, all clean; `deploy.yml`'s full pipeline run and verified by hand).

## State of PR #2

- Draft, open, subscribed (this session gets CI/review events on it).
- 8 commits, all pushed, working tree clean.
- Will go green automatically once Actions is unlocked — no further push needed for that.
- Two harmless byte-identical duplicate commit pairs found in git history during an audit (not touched — no risk, not worth a history rewrite).

## Suggested next steps

- Unblock GitHub Actions billing, confirm CI goes green on PR #2, merge.
- Consider wiring the `run-wizard-breaker-game` skill's `play-level1` driver into CI as a smoke test — it's what caught both crashes this session, and neither would have been caught by lint/tsc/jest alone.
- `bun run test:coverage` shows most of `contexts/` and `constants/` at 0% coverage — `utils/injectionDetector.ts` is the only real test target today. Worth deciding whether context/component tests are worth the investment given `jest-expo` is now correctly wired for them.
