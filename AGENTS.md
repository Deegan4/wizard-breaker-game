# AGENTS.md — Wizard Breaker Game

## Quick Start

```bash
cd expo && bun i
bun run start        # dev server (Rork tunnel)
bun run start-web    # web preview (Rork tunnel)
npx expo start --web # web preview without the Rork tunnel (works headless/CI)
bun run lint         # ESLint (eslint-config-expo)
bun run test         # Jest (38 tests, utils/injectionDetector.ts)
```

**All commands run from `expo/`** — this is a Rork project with code in `expo/`.

## Architecture

- **React Native + Expo Router** (file-based routing, typed routes enabled)
- **Single-player prompt injection game**: 12 levels (Classic) + themed Adventures, local regex matching only — no LLM/backend
- **State**: `contexts/GameContext.tsx` → `useGame()` (AsyncStorage persistence, React Query wrappers)
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
- **Colors**: `constants/colors.ts` (`Colors.*`) — never hardcode hex
- **Icons**: `lucide-react-native`
- **Styling**: React Native `StyleSheet` + `expo-linear-gradient`
- **TypeScript**: strict mode
- **Static content**: `constants/` (`levels`, `adventures`, `leaderboard`, `colors`)
- **Components**: presentational only in `components/`

## Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root Stack: tabs, `game`, `victory`, not-found |
| `app/(tabs)/_layout.tsx` | Tab bar config (Home, Daily, Lab, Ranks, Learn, Quests) |
| `app/game.tsx` | Chat screen, calls `detectInjection`, success animation |
| `app/victory.tsx` | Win screen with stats, share, replay |
| `contexts/GameContext.tsx` | Global state, `useGame()` hook |
| `utils/injectionDetector.ts` | Core game logic, level checkers |
| `constants/levels.ts` | Level definitions (name, spell, difficulty, hints) |
| `constants/colors.ts` | Theme tokens (primary, surfaces, gradients, shadows) |
| `constants/adventures.ts` | Adventure definitions for tab screen |

## Verification

```bash
bun run lint       # must pass (0 errors)
npx tsc --noEmit   # type check (run from expo/)
bun run test       # 38 tests must pass
```

CI (`.github/workflows/ci.yml`) runs all three of the above on every push/PR to `main`.

## Gotchas

- Dev server uses `bunx rork start` with hardcoded project ID, not plain `expo start`. Plain `npx expo start --web` works too and doesn't need the Rork tunnel — use that for headless/CI verification.
- `bunx` may not be in PATH; use `bun run start` instead
- `server.ts` is a small standalone static file server (`bun server.ts <dir> <port>`) for previewing the `dist/` web export locally; it isn't wired into any `package.json` script or CI job
- GitHub Pages deployment runs via `.github/workflows/deploy.yml` using `actions/deploy-pages` (no `gh-pages` branch involved) — builds `expo export --platform web`, rewrites asset paths for the `/wizard-breaker-game/` subpath, adds SPA 404 redirect + PWA manifest/service worker
- When editing level logic: hints show every 5th failed attempt via `constants/levels.ts`
- `AchievementContext` calls `useGame()`, so in `app/_layout.tsx` its provider must be nested *inside* `GameProvider`, not the other way around — getting this backwards crashes the whole app on load
