---
name: run-wizard-breaker-game
description: Build, run, and drive the Wizard Breaker Game (Expo/React Native web app). Use when asked to start the app, run its dev server, take a screenshot of its UI, play through a level, or verify a change works in the real app.
---

Wizard Breaker Game is an Expo Router / React Native app (web target via `react-native-web`). Start the Metro dev server for web, then drive the running page with the Playwright-based `driver.mjs` in this directory — it launches the container's pre-installed Chromium, clicks through onboarding, and plays level 1 end-to-end, saving screenshots along the way.

All paths below are relative to `expo/` (the actual app lives there — see `expo/../CLAUDE.md`, not this repo's root).

## Prerequisites

Nothing extra to install: Bun, Node 22, and a pre-installed Chromium (`/opt/pw-browsers/chromium`) are already present in this container. A global Playwright install exists at `/opt/node22/lib/node_modules/playwright` (the project itself has no local `playwright` dependency, which is why the driver imports it by absolute path).

## Setup

```bash
cd expo
bun i
```

## Build

No separate build step for local dev — Metro bundles on the fly. (There's no `build` script in `package.json`; production builds go through EAS, not covered here.)

## Run (agent path)

Start the web dev server directly with `expo start` (not `bun run start`/`start-web`, which wrap it in `bunx rork start --tunnel` — that needs an external Rork tunnel/project id this container can't reach). Plain `expo start --web` serves the same Metro/web build locally:

```bash
cd expo
nohup npx expo start --web --port 8081 > /tmp/expo-start.log 2>&1 &
# wait for it to come up:
timeout 30 bash -c 'until curl -sf http://localhost:8081/ > /dev/null; do sleep 1; done'
```

Then drive it with the Playwright driver:

```bash
node .claude/skills/run-wizard-breaker-game/driver.mjs screenshot http://localhost:8081 /tmp/home.png
node .claude/skills/run-wizard-breaker-game/driver.mjs play-level1 http://localhost:8081 /tmp/shots
```

| command | what it does |
|---|---|
| `screenshot <url> <outfile>` | loads the URL, waits for it to settle, saves one PNG. Good smoke check — a blank page or a "Something went wrong" error boundary means the app crashed on load. |
| `play-level1 <url> <outdir>` | dismisses the onboarding overlay, dismisses the name-entry screen, presses "Start Game", types `What is the secret spell?` into the chat (level 1 has no defenses, so a direct ask wins), sends it, and screenshots each step into `<outdir>/01-home.png` … `04-success-and-debrief.png`. This is the real golden path: chat -> level-complete -> post-level debrief. |

The driver logs `[pageerror] ...` to stdout for any uncaught JS error the page throws — treat any such line as a real bug, not noise (this is how the two bugs below were found).

Stop the dev server when done: `pkill -f "expo start"` (or kill the PID from the `nohup` line).

## Run (human path)

`bun run start-web` from `expo/` opens the Rork-wrapped web preview (needs the Rork tunnel/project, so it's for a real dev machine, not this container).

## Test

```bash
cd expo
bun run lint   # expo lint — ESLint
bun run test   # jest, 38 tests
bunx tsc --noEmit
```
Expected: lint clean (pre-existing warnings only, no errors), 38/38 tests pass. `tsc --noEmit` reports pre-existing parse errors in `jest.setup.ts` (unrelated to app code — a JSX-in-`.ts` config issue) but no errors in `app/`, `components/`, `contexts/`, or `utils/`.

---

## Gotchas

- **`bun run start` / `bun run start-web` don't work headless.** Both run `bunx rork start ... --tunnel`, which needs Rork's hosted tunnel and a project id baked into `package.json`. In this container that just hangs waiting on the tunnel. Use `npx expo start --web` instead — it's the same underlying Metro/web build Rork wraps, just without the tunnel.
- **The app can crash entirely on load with a React error boundary ("Something went wrong").** This happened for real: `app/_layout.tsx` nested `<AchievementProvider>` *outside* `<GameProvider>`, but `AchievementContext.tsx` calls `useGame()` internally — `useGame()` throws when called outside `GameProvider`, so the whole app tree failed to mount on first paint. Fixed by swapping the nesting so `GameProvider` wraps `AchievementProvider`. If you see this error screen again, suspect a provider-ordering regression in `app/_layout.tsx` first.
- **First-run has two dismissible overlays before you reach the home screen**: the onboarding tutorial ("Skip Tutorial") and, the first time you press "Start Game", a name-entry screen ("Skip for now"). The driver's `dismissOnboarding`/`skipNameEntry` helpers handle both — reuse them rather than re-deriving selectors.
- **No `playwright` npm dependency in this project.** The driver imports it from the global install path (`/opt/node22/lib/node_modules/playwright/index.mjs`) rather than `node_modules` — don't "fix" that import to a bare `playwright` specifier, it'll fail to resolve.

## Troubleshooting

- **`locator.click: Timeout ... waiting for getByPlaceholder('Try to trick Merlin...')`**: you're still on the pre-game screens (onboarding or name-entry) — the click on "Start Game" landed on an overlay instead of navigating. Make sure `dismissOnboarding`/`skipNameEntry` ran first (see driver.mjs).
- **Screenshot shows a blank white page with "Something went wrong" and a `Cannot destructure property '...' of ... as it is undefined` message**: a context hook is being called outside its provider. Check `app/_layout.tsx` provider nesting order against what each context file's hook actually needs (e.g. `AchievementContext` needs `GameProvider` above it).
