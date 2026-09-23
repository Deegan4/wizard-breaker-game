# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a **Rork** project. `rork.json` at the root declares a single app whose code lives entirely in the `expo/` subdirectory — **all commands must be run from `expo/`**, and all source paths below are relative to `expo/`.

Rork (rork.com) syncs bidirectionally with this GitHub repo: changes made in Rork are committed here automatically, and changes pushed here are reflected in Rork. Commits like "Sync snapshot from Rork" / "Agent update" come from that pipeline.

## Commands

The package manager is **Bun**. Run everything from the `expo/` directory.

```bash
bun i                  # install dependencies
bun run start          # start dev server (Rork tunnel); press "i" for iOS Simulator
bun run start-web      # start web preview
bun run lint           # expo lint (ESLint, eslint-config-expo)
```

There's a Jest test suite (`bun run test`, 38 tests against `utils/injectionDetector.ts`) and a real GitHub Actions CI (`.github/workflows/ci.yml`: lint + typecheck + test) and Pages deploy (`.github/workflows/deploy.yml`), but no app build script beyond EAS (see `BUILD.md`) — `start`, `start-web`, `start-web-dev`, `lint`, `test`, `test:watch`, and `test:coverage` are the only `package.json` scripts. The dev server runs through `bunx rork start` with a hardcoded Rork project id, not the plain `expo start` command (plain `expo start --web` also works and is what CI/local verification without the Rork tunnel should use).

## Architecture

A single-player React Native (Expo Router) game: the player tries to "prompt inject" a wizard NPC (Merlin) into revealing a secret spell across 12 levels of escalating defenses (Classic mode), plus separate themed Adventure level sets. Despite the AI/LLM theme, **there is no LLM or backend** — Merlin's responses are produced entirely by local regex matching.

### The game engine: `utils/injectionDetector.ts`

This is the heart of the app. `detectInjection(prompt, level, failedAttempts, adventure, totalLevels)` decides whether the player's message defeats the current level and returns Merlin's reply.

The defining design idea is **cumulative defense layering**. Each level has a `checkLevelN` function. Each higher level first rejects the prompt if it matches the *attack categories blocked by all lower levels*, and only then checks that level's own `successTriggers`. So beating level N means using a technique that wasn't viable at any earlier level — this is what makes the game progressively harder.

When changing difficulty or adding a level, you must keep three things in sync:
- the pattern arrays (`directAskPatterns`, `roleplayPatterns`, etc.) and `successTriggers[N]`,
- the corresponding `checkLevelN` function and the `levelCheckers` map in `detectInjection`,
- the matching entry in `LEVELS` (`constants/levels.ts`), whose array index (`level - 1`) must line up with the checker keys.

Failure replies, success replies, and a hint (shown every 5th failed attempt) are also pulled from `constants/levels.ts`.

### State: `contexts/GameContext.tsx`

A single global store created with `@nkzw/create-context-hook` and exposed as `useGame()`. It is the only source of game state. Pattern to follow:
- Persistence is **local-only** via `AsyncStorage` (keys `wizard_breaker_game_state`, `wizard_breaker_leaderboard`); there is no server.
- React Query (`useQuery`/`useMutation`) wraps the async load/save. State is held in `useState` and mirrored to storage on every mutation through `saveState`; mutations invalidate the query keys.
- The leaderboard is seeded from `MOCK_LEADERBOARD` and updated locally in `completeLevel`, which also handles game-completion and re-sorting (by levels completed, then fewest attempts).

`GameProvider` is mounted once in `app/_layout.tsx` under `QueryClientProvider` and `GestureHandlerRootView`.

### Routing & screens

File-based via Expo Router with typed routes enabled (`app.config.js` → `experiments.typedRoutes`).
- `app/_layout.tsx` — root `Stack` (tabs, `game`, `victory`, `debrief`, not-found), providers mounted `ThemeProvider` → `GameProvider` → `AchievementProvider` → `OnboardingWrapper` (in that nesting order — `AchievementContext` calls `useGame()`, so it must stay *inside* `GameProvider`).
- `app/(tabs)/` — `index` (Home), `daily` (Daily), `playground` (Lab), `leaderboard` (Ranks), `learn` (Learn), `adventures` (Quests).
- `app/game.tsx` — the chat screen; calls `detectInjection`, drives the success animation, then renders `app/debrief.tsx`'s `DebriefScreen` inline as an overlay (not a route push) before advancing, and on final-level success routes to `victory`.

### Conventions

- **Path alias**: `@/*` maps to the `expo/` root (e.g. `@/constants/levels`, `@/contexts/GameContext`). Use it instead of relative climbs.
- Theme colors come from `useTheme()` (`contexts/ThemeContext.tsx`, `colors: ColorPalette`) — do not hardcode hex values in components.
- Icons are from `lucide-react-native`. Styling is React Native `StyleSheet`. TypeScript is `strict`.
- Static game content lives in `constants/` (`levels`, `adventures`, `leaderboard`, `colors`); presentational pieces in `components/`.
