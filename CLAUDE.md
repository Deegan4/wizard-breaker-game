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
bun x tsc --noEmit     # typecheck (on Windows `npx tsc` fails: bun's node_modules/.bin has .exe shims; CI uses npx on Linux)
```

There's a Jest test suite (`bun run test`, 41 tests: 38 against `utils/injectionDetector.ts`, 3 against `contexts/GameContext.tsx`) and a real GitHub Actions CI (`.github/workflows/ci.yml`: lint + typecheck + test) and Pages deploy (`.github/workflows/deploy.yml`), but no app build script beyond EAS (see `BUILD.md`) — `start`, `start-web`, `start-web-dev`, `lint`, `test`, `test:watch`, and `test:coverage` are the only `package.json` scripts. The dev server runs through `bunx rork start` with a hardcoded Rork project id, not the plain `expo start` command (plain `expo start --web` also works and is what CI/local verification without the Rork tunnel should use).

`bun` is the required package manager; if it isn't installed, `npm install -g --allow-scripts=bun bun` gets it (the plain `npm install -g bun` blocks bun's own postinstall script by default and leaves no `bun` binary on PATH).

## Architecture

A single-player React Native (Expo Router) game: the player tries to "prompt inject" a wizard NPC (Merlin) into revealing a secret spell across 12 levels of escalating defenses (Classic mode), plus separate themed Adventure level sets. Despite the AI/LLM theme, **there is no LLM or backend** — Merlin's responses are produced entirely by local regex matching.

### The game engine: `utils/injectionDetector.ts`

This is the heart of the app. `detectInjection(prompt, level, failedAttempts, adventure, totalLevels)` decides whether the player's message defeats the current level and returns Merlin's reply.

The defining design idea is **cumulative defense layering**. Each level has a `checkLevelN` function. Each higher level first rejects the prompt if it matches the *attack categories blocked by all lower levels*, and only then checks that level's own `successTriggers`. So beating level N means using a technique that wasn't viable at any earlier level — this is what makes the game progressively harder.

When changing difficulty or adding a level, you must keep three things in sync:
- the pattern arrays (`directAskPatterns`, `roleplayPatterns`, etc.) and `successTriggers[N]`,
- the corresponding `checkLevelN` function and the `levelCheckers` map in `detectInjection`,
- the matching entry in `LEVELS` (`constants/levels.ts`), whose array index (`level - 1`) must line up with the checker keys.
- the level's `STARTER_PROMPTS` chips (`constants/levels.ts`): tests require the first chip to beat the previous level and every chip to fail on its own level.

Failure replies, success replies, and a hint (shown every 5th failed attempt) are also pulled from `constants/levels.ts`.

### State: `contexts/GameContext.tsx`

A single global store created with `@nkzw/create-context-hook` and exposed as `useGame()`. It is the primary source of game state (see also `AchievementContext`/`LessonContext` below). Pattern to follow:
- Persistence is **local-only** via `AsyncStorage` (keys `wizard_breaker_game_state`, `wizard_breaker_leaderboard`); there is no server.
- React Query (`useQuery`/`useMutation`) wraps the async load/save. State is held in `useState` and mirrored to storage on every mutation through `saveState`; mutations invalidate the query keys.
- The leaderboard is seeded from `MOCK_LEADERBOARD` and updated locally in `completeLevel`, which also handles game-completion and re-sorting (by levels completed, then fewest attempts).
- `xpTotal` is the player's lifetime XP; `awardXP(amount)` is the only way to add to it. `completeLevel()` awards a Classic level's `xpReward` (`constants/levels.ts`) on that level's completion, and a Practice adventure's `xpReward` (`constants/adventures.ts`) only on full adventure completion — never per-level for non-Classic modes.
- `adventureProgress: Record<adventureId, {levelsCompleted, completedAt?}>` tracks each of the 5 Practice adventures independently of whichever one is currently active, so switching adventures via `setAdventure(id)` **resumes** where you left off instead of restarting at level 1 (this replaced the old always-reset-to-level-1 behavior). Classic's own progress is read via the live `currentLevel`/`levelsCompleted` fields when active, or `adventureProgress['classic']` when another adventure is active.
- `getLevelStatus(levelId)` → `'locked' | 'current' | 'completed'` for a Classic level; `getAdventureUnlockState(adventureId)` → `'locked' | 'unlocked' | 'current' | 'completed'` for a Practice adventure, sequentially chained in `constants/adventures.ts`'s declaration order (excluding `classic`) — adventure N+1 unlocks only once N is completed.
- `startLevel(adventureId, level)` + the `dailyChallengeActive` flag let something like the Daily tab open an arbitrary Classic level for a one-off replay without it counting as real progression — `completeLevel()` checks the flag first and, if set, just returns to wherever the player actually is instead of advancing `levelsCompleted`.

`GameProvider` is mounted once in `app/_layout.tsx` under `QueryClientProvider` and `GestureHandlerRootView`.

### `contexts/AchievementContext.tsx` (`useAchievements()`)

Nested *inside* `GameProvider` (calls `useGame()` for `awardXP`). Tracks achievements, the daily challenge, and play stats — three separate `AsyncStorage` keys (`wizard_breaker_achievements`, `wizard_breaker_daily_challenge`, `wizard_breaker_stats`), each with its own load-once/save-on-change `useEffect` pair. `checkDailyChallenge()` derives today's Classic level deterministically from the date; `completeDailyChallenge(attempts)` marks it done, bumps `stats.dailyStreak`, appends today to `stats.completedDates`, awards `DAILY_CHALLENGE_XP_REWARD` (`constants/xp.ts`), and checks streak achievements. `getWeekCalendar()` derives a Sun–Sat `{date, label, state}[]` row from `completedDates` for calendar-style streak UI.

### `contexts/LessonContext.tsx` (`useLessons()`)

Also nested inside `GameProvider`. Tracks per-lesson step completion (`AsyncStorage` key `wizard_breaker_lesson_progress`) for the scripted curriculum in `constants/lessons.ts` (`LESSONS`, grouped into `LEARNING_MODULES`). A lesson is a **fixed, authored dialogue script** — `LessonStep[]` with `wizardText`, an optional `example`, and up to a few `quickReplies` that branch to more fixed canned text — never a real model call, consistent with the rest of the app having no LLM anywhere. `completeLesson(id)` awards XP via `useGame().awardXP`; `isLessonUnlocked(id)` chains lessons sequentially within their module, the same pattern as `getAdventureUnlockState`. `completeLesson` is a no-op for an already-completed lesson (replays don't re-award XP). `app/lesson/[id].tsx` is the chat UI over these scripts: quick-reply ids `hint`, `another-example` and `red-flags` are help replies that do NOT advance the step; any other reply calls `completeStep`, and the last step calls `completeLesson`.

### Routing & screens

File-based via Expo Router with typed routes enabled (`app.config.js` → `experiments.typedRoutes`).
- `app/_layout.tsx` — root `Stack` (tabs, `game`, `lesson/[id]`, `victory`, `debrief`, not-found), providers mounted `ThemeProvider` → `GameProvider` → `LessonProvider` → `AchievementProvider` → `OnboardingWrapper` (in that nesting order — both `LessonContext` and `AchievementContext` call `useGame()`, so they must stay *inside* `GameProvider`; the two have no dependency on each other, so their relative order doesn't matter).
- `app/(tabs)/` — `index` (Home), `daily` (Daily), `playground` (Lab), `leaderboard` (Ranks), `learn` (Learn: `LearningPathHero` + `LessonRow` list above the legacy article), `adventures` (Quests: All/Story/Practice chips; Story = the 12 Classic levels via `QuestTimelineCard`). `daily` starts its challenge with `startLevel('classic', level)` + `router.push('/game')`.
- `app/game.tsx` — the chat screen; calls `detectInjection`, drives the success animation, then renders `app/debrief.tsx`'s `DebriefScreen` inline as an overlay (not a route push) before advancing, and on final-level success routes to `victory`.

### Conventions

- **Path alias**: `@/*` maps to the `expo/` root (e.g. `@/constants/levels`, `@/contexts/GameContext`). Use it instead of relative climbs.
- Theme colors come from `useTheme()` (`contexts/ThemeContext.tsx`, `colors: ColorPalette`) — do not hardcode hex values in components.
- Icons are from `lucide-react-native`. Styling is React Native `StyleSheet`. TypeScript is `strict`.
- Static game content lives in `constants/` (`levels`, `adventures`, `leaderboard`, `lessons`, `xp`); presentational pieces in `components/`.
- Typed routes: `expo/.expo/types/router.d.ts` is generated + gitignored; if `tsc` rejects a newly added route it's stale — run `expo start` to regenerate or move it aside (CI has no such file).
- Untracked `expo/_*.mjs` are throwaway Playwright scratch scripts; never commit them. Stage files by name, not `git add -A`.
