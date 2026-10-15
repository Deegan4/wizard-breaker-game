# AGENTS.md — Wizard Breaker Game

## Quick Start

```bash
cd expo && bun i
bun run start        # dev server (Rork tunnel)
bun run start-web    # web preview (Rork tunnel)
npx expo start --web # web preview without the Rork tunnel (works headless/CI)
bun run lint         # ESLint (eslint-config-expo)
bun run test         # Jest (41 tests: 38 utils/injectionDetector.ts, 3 contexts/GameContext.tsx)
```

**All commands run from `expo/`** — this is a Rork project with code in `expo/`. If `bun` isn't installed, `npm install -g --allow-scripts=bun bun` (plain `npm install -g bun` blocks its postinstall and leaves no binary on PATH).

## Architecture

- **React Native + Expo Router** (file-based routing, typed routes enabled)
- **Single-player prompt injection game**: 12 levels (Classic) + themed Adventures, local regex matching only — no LLM/backend
- **State**: `contexts/GameContext.tsx` → `useGame()` (AsyncStorage persistence, React Query wrappers) — also holds `xpTotal`, per-adventure resumable progress, and lock-state helpers (`getLevelStatus`, `getAdventureUnlockState`)
- **Also**: `contexts/AchievementContext.tsx` → `useAchievements()` (daily challenge, streaks, achievements) and `contexts/LessonContext.tsx` → `useLessons()` (scripted lesson curriculum, `constants/lessons.ts`) — both nested inside `GameProvider`, both award XP via `useGame().awardXP`
- **Game engine**: `utils/injectionDetector.ts` — `detectInjection(prompt, level, failedAttempts, adventure, totalLevels)`
- **Levels defined in**: `constants/levels.ts` (`LEVELS` array, index = `level - 1`)

### Cumulative Defense Layering (critical when editing levels)

Each level `checkLevelN` first rejects prompts matching **all lower-level attack categories**, then checks its own `successTriggers`. Beating level N requires a technique not viable at any earlier level.

**To add/modify a level, sync 3 things:**
1. Pattern arrays (`directAskPatterns`, `roleplayPatterns`, etc.) + `successTriggers[N]`
2. `checkLevelN` function + entry in `levelCheckers` map in `detectInjection`
3. `LEVELS[level - 1]` entry in `constants/levels.ts`

## Conventions

- **Path alias**: `@/*` → `expo/` root (e.g. `@/constants/levels`)
- **Colors**: `useTheme()` (`contexts/ThemeContext.tsx`, `colors: ColorPalette`) — never hardcode hex
- **Icons**: `lucide-react-native`
- **Styling**: React Native `StyleSheet` + `expo-linear-gradient`
- **TypeScript**: strict mode
- **Static content**: `constants/` (`levels`, `adventures`, `leaderboard`, `lessons`, `xp`)
- **Components**: presentational only in `components/`

## Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root Stack: tabs, `game`, `lesson/[id]`, `victory`, not-found |
| `app/(tabs)/_layout.tsx` | Tab bar config (Home, Daily, Lab, Ranks, Learn, Quests) |
| `app/game.tsx` | Chat screen, calls `detectInjection`, success animation |
| `app/victory.tsx` | Win screen with stats, share, replay |
| `contexts/GameContext.tsx` | Global state, `useGame()` hook (XP, level/adventure lock state) |
| `contexts/AchievementContext.tsx` | Daily challenge, streaks, achievements, `useAchievements()` |
| `contexts/LessonContext.tsx` | Lesson progress/XP, `useLessons()` |
| `utils/injectionDetector.ts` | Core game logic, level checkers |
| `constants/levels.ts` | Level definitions (name, spell, difficulty, hints, xpReward) |
| `constants/lessons.ts` | Scripted lesson curriculum (no LLM) |
| `contexts/ThemeContext.tsx` | Theme tokens (primary, surfaces, gradients, shadows) |
| `constants/adventures.ts` | Adventure definitions for tab screen |

## Verification

```bash
bun run lint       # must pass (0 errors)
npx tsc --noEmit   # type check (run from expo/; on Windows use `bun x tsc --noEmit`)
bun run test       # 41 tests must pass
```

CI (`.github/workflows/ci.yml`) runs all three of the above on every push/PR to `main`.

## Gotchas

- Dev server uses `bunx rork start` with hardcoded project ID, not plain `expo start`. Plain `npx expo start --web` works too and doesn't need the Rork tunnel — use that for headless/CI verification.
- `bunx` may not be in PATH; use `bun run start` instead
- `server.ts` is a small standalone static file server (`bun server.ts <dir> <port>`) for previewing the `dist/` web export locally; it isn't wired into any `package.json` script or CI job
- Web deployment runs via `.github/workflows/deploy.yml` to Cloudflare Pages (project `wizard-breaker-game`, served at the domain root) — builds `expo export --platform web`, patches `index.html` (viewport background, PWA manifest + service worker), writes a `_headers` file so the HTML shell and `sw.js` are never cached, then `wrangler pages deploy`. Requires the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets. No `404.html`, so Cloudflare serves `index.html` for unknown paths (SPA fallback). `public/sw.js` is network-first for page loads, so new deploys appear on the next load.
- When editing level logic: hints show every 5th failed attempt via `constants/levels.ts`
- `AchievementContext` and `LessonContext` both call `useGame()`, so in `app/_layout.tsx` their providers must be nested *inside* `GameProvider`, not the other way around — getting this backwards crashes the whole app on load (this exact class of bug happened once before, see `HANDOFF.md`)
- `jest.setup.tsx`'s `@nkzw/create-context-hook`/`@tanstack/react-query` mocks must match the real packages' export shapes (default vs. named export, which hooks are mocked) or any test that renders `GameContext` fails opaquely — this was broken and unexercised until `contexts/__tests__/GameContext.test.tsx` was added
