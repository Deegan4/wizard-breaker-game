# Handoff — Wizard Breaker Game session (2026-09-22)

Branch: `main` (direct commits, no PR — different from the prior session's `claude/next-steps-byvc1c`, which is unrelated pre-existing work still sitting on that remote branch, untouched this session).

Commits this session, in order: `9555352` → `cb13d28` → `0c2c580`. All pushed to `origin/main`.

## What this session is

The user shared 5 mockup screenshots and asked for a full redesign of the app's UI toward a "Quests / Learning Path / Daily Streak" structure (locked/current/completed quest cards with XP, a trackable lesson curriculum, a Sun–Sat streak calendar, a redesigned Home tab, and a chat-style "Wizard · AI tutor" lesson screen). This is a large, multi-phase effort — a plan was written and approved before any code changed.

**Read the plan first**: `C:\Users\deega\.claude\plans\jaunty-bouncing-creek.md`. It has the full phase breakdown, exact files/types to touch per phase, and an "open items" section documenting decisions already made (so they don't need re-litigating) — most importantly:
- The mockups aren't generic placeholders. "The Unguarded Tower" and "The Persona Anchor" in the mockups are verbatim `LEVELS[0].name`/`LEVELS[9].name` from `constants/levels.ts`, and the Daily mockup's date matched the real date. **Quests = the 12 individual Classic levels**, not the 6 Adventures — confirmed with the user after finding this.
- The 6 existing Adventures (`classic` + 5 others) become a "Practice" filter within the same Quests screen.
- Lesson-chat content must stay scripted/deterministic — **this app has no real LLM anywhere by design** (see `CLAUDE.md`); the "AI tutor" is authored dialogue with quick-reply branches, same pattern as Merlin's existing canned battle responses.
- Delivery is phased with a review checkpoint after each phase (the user's explicit choice over one-shot).

## What's done

**Phase 0** (`9555352`) — landed pre-existing *uncommitted* work that predated this session and wasn't mine: an Expo SDK 54→57 upgrade (React 19.2, RN 0.86) plus confetti/glow polish already wired into `game.tsx`/`victory.tsx`/`index.tsx`. Fixed the upgrade's fallout (`StyleSheet.absoluteFillObject` → `absoluteFill` across 4 components, a real type error the SDK bump introduced) and did repo hygiene (`.gitignore` for backup/npm lockfiles, `.npmrc`, fixed stale `constants/colors.ts` doc references — that file no longer exists, superseded by `useTheme()`).

**Phase 1** (`cb13d28`) — shared data layer only, **no UI changed yet**:
- `GameContext`: `xpTotal`, `awardXP`, per-adventure `adventureProgress` that survives switching adventures (`setAdventure` now *resumes* instead of restarting at level 1 — was silently always resetting before), `getLevelStatus`/`getAdventureUnlockState` for lock-state UI, `startLevel`/`dailyChallengeActive` so a daily-challenge replay of an arbitrary level can't corrupt real progression.
- `AchievementContext`: `completedDates` history (feeds a Sun–Sat calendar), a real load-bug fix (saved stats used to fully replace state instead of merging — would've broken on any schema addition), daily-challenge completion now awards XP.
- Fixed a live bug: `constants/adventures.ts` had `id: 'reverse'` but `constants/levels.ts` keyed the same content `'reverse-wizard'` — `getAdventureSpellCount('reverse')` silently fell back to Classic's 12-level count instead of the real 4. Renamed to `'reverse-wizard'` everywhere. Also deleted a second, differently-shaped `ADVENTURES` export that collided with the real one.
- New `constants/lessons.ts` + `contexts/LessonContext.tsx`: scripted lesson curriculum (6 lessons seeded from `learn.tsx`'s existing `INJECTION_TECHNIQUES`), per-step/per-lesson completion tracking, XP on completion.
- Found and fixed two **pre-existing, unrelated** bugs in `jest.setup.tsx`'s mocks — `@nkzw/create-context-hook` was mocked as a named export but the real package is default-export-only, and the `@tanstack/react-query` mock was missing `useQueryClient`. Neither was ever caught because no test had rendered `GameContext` before. Added `contexts/__tests__/GameContext.test.tsx` (3 tests) covering the `reverse-wizard` fix and `getLevelStatus`.

**Docs** (`0c2c580`) — updated `CLAUDE.md`/`AGENTS.md` to describe all of the above (new context fields/actions, provider order, test count 38→41, two environment gotchas below).

Verified after every phase: `bun run lint`, `npx tsc --noEmit`, `bun run test` (41/41) all clean.

## Environment notes for whoever picks this up

This session ran on the user's own Windows desktop (via `/remote-control`), not the cloud container the `run-wizard-breaker-game` skill's `SKILL.md` assumes ("Bun, Node 22, and a pre-installed Chromium... already present"). None of that was true here:
- **`bun` wasn't installed.** `npm install -g bun` alone doesn't work — it blocks bun's own postinstall script by default and leaves no binary. Use `npm install -g --allow-scripts=bun bun`.
- **Low RAM** (~8GB total, often <2GB free) killed `bun install`/`lint`/`tsc` mid-run repeatedly. Not a real failure — retry; `bun install` resumes from partial `node_modules` rather than starting over.
- **No Playwright/Chromium preinstalled**, so the run-skill's headless visual verification hasn't been exercised this session (Phase 0/1 had no UI changes, so it wasn't needed yet). **Phase 3 will need it** — either install Playwright + a browser locally first, or find another way to visually compare the rebuilt screens against the 5 reference mockups.
- **`git push` needs interactive GitHub auth** (Credential Manager device-code/browser flow) — fails outright from a backgrounded/non-interactive shell. Has to be run where the user can complete the browser prompt themselves.

## Suggested next steps

Continue with **Phase 2/3** from the plan: build the new shared components (quest timeline card, lesson row, streak calendar, example card, quick-reply chips) and rebuild the screens one at a time — Quests tab first, per the plan's stated order, each as its own reviewable checkpoint. Before starting Phase 3's UI work, sort out local visual verification (Playwright install) since that's the only way to actually confirm a rebuilt screen matches its reference mockup.
