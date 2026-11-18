import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { LessonProvider, useLessons } from '@/contexts/LessonContext';
import {
  AchievementProvider,
  dailyLevelForDate,
  pastDailyChallenges,
  useAchievements,
} from '@/contexts/AchievementContext';
import { LESSONS, getLessonsForModule } from '@/constants/lessons';
import { LEVELS } from '@/constants/levels';
import { DAILY_CHALLENGE_XP_REWARD } from '@/constants/xp';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider>
    <LessonProvider>
      <AchievementProvider>{children}</AchievementProvider>
    </LessonProvider>
  </GameProvider>
);

const useAll = () => ({ game: useGame(), lessons: useLessons(), achievements: useAchievements() });

describe('useLessons()', () => {
  const [first, second] = getLessonsForModule(LESSONS[0].moduleId);

  it('chains lessons: the second unlocks only after the first is completed', async () => {
    const { result } = await renderHook(useAll, { wrapper });

    expect(result.current.lessons.isLessonUnlocked(first.id)).toBe(true);
    expect(result.current.lessons.isLessonUnlocked(second.id)).toBe(false);

    await act(() => {
      result.current.lessons.completeLesson(first.id);
    });

    await waitFor(() => expect(result.current.lessons.isLessonUnlocked(second.id)).toBe(true));
    expect(result.current.lessons.getModuleProgress(first.moduleId).completed).toBe(1);
  });

  it('awards XP once and does not re-award on replay', async () => {
    const { result } = await renderHook(useAll, { wrapper });
    const startXP = result.current.game.gameState.xpTotal;

    await act(() => {
      result.current.lessons.completeLesson(first.id);
    });
    await waitFor(() => expect(result.current.game.gameState.xpTotal).toBeGreaterThan(startXP));
    const afterFirst = result.current.game.gameState.xpTotal;

    await act(() => {
      result.current.lessons.completeLesson(first.id);
    });
    expect(result.current.game.gameState.xpTotal).toBe(afterFirst);
  });
});

describe('useAchievements() daily challenge', () => {
  it('picks a valid Classic level and awards XP + streak on completion', async () => {
    const { result } = await renderHook(useAll, { wrapper });

    let level = 0;
    await act(() => {
      level = result.current.achievements.checkDailyChallenge().level;
    });
    expect(level).toBeGreaterThanOrEqual(1);
    expect(level).toBeLessThanOrEqual(LEVELS.length);

    const startXP = result.current.game.gameState.xpTotal;
    await act(() => {
      result.current.achievements.completeDailyChallenge(3);
    });

    await waitFor(() => expect(result.current.achievements.dailyChallenge?.completed).toBe(true));
    expect(result.current.achievements.stats.dailyStreak).toBe(1);
    expect(result.current.game.gameState.xpTotal).toBe(startXP + DAILY_CHALLENGE_XP_REWARD);
    expect(result.current.achievements.getWeekCalendar()).toHaveLength(7);
  });

  it('maps completed dates to Classic levels, newest first', () => {
    expect(pastDailyChallenges([])).toEqual([]);
    expect(pastDailyChallenges(undefined)).toEqual([]);

    const iso = '2026-06-15';
    const level = dailyLevelForDate(iso);
    expect(dailyLevelForDate(iso, new Date(`${iso}T08:00:00`).getTime())).toBe(level);
    expect(dailyLevelForDate(iso, new Date(`${iso}T20:00:00`).getTime())).toBe(level);
    expect(level).toBeGreaterThanOrEqual(1);
    expect(level).toBeLessThanOrEqual(LEVELS.length);

    const rows = pastDailyChallenges(
      ['2026-01-02', 'not-a-date', '2026-03-01', '2026-01-02'],
      { date: '2026-03-01', level: 4 },
    );
    expect(rows.map((row) => row.date)).toEqual(['2026-03-01', '2026-01-02']);
    expect(rows[0].level).toBe(4);
    expect(rows[1].level).toBe(dailyLevelForDate('2026-01-02'));
  });

  it('uses the same level for today that the daily generator assigns', async () => {
    const { result } = await renderHook(useAll, { wrapper });
    const today = new Date().toISOString().split('T')[0];

    let level = 0;
    await act(() => {
      level = result.current.achievements.checkDailyChallenge().level;
    });

    expect(level).toBe(dailyLevelForDate(today, Date.now()));
    await waitFor(() => expect(result.current.achievements.dailyChallenge?.level).toBe(level));
    expect(pastDailyChallenges([today], result.current.achievements.dailyChallenge)[0].level).toBe(level);
  });

  it('does not advance Classic progress or re-award daily XP when a replay is completed', async () => {
    const { result } = await renderHook(useAll, { wrapper });

    await act(() => {
      result.current.game.completeLevel();
    });
    expect(result.current.game.gameState.levelsCompleted).toBe(1);

    await act(() => {
      result.current.achievements.checkDailyChallenge();
    });
    await act(() => {
      result.current.achievements.completeDailyChallenge(2);
    });

    const levelOneXp = LEVELS[0]?.xpReward ?? 0;
    expect(levelOneXp).toBeGreaterThan(0);
    await waitFor(() =>
      expect(result.current.game.gameState.xpTotal).toBe(levelOneXp + DAILY_CHALLENGE_XP_REWARD),
    );
    const levelsCompleted = result.current.game.gameState.levelsCompleted;
    const xpTotal = result.current.game.gameState.xpTotal;
    expect(result.current.achievements.stats.completedDates).toContain(
      new Date().toISOString().split('T')[0],
    );

    const replayLevel = result.current.achievements.dailyChallenge?.level ?? 1;
    await act(() => {
      result.current.game.startLevel('classic', replayLevel);
    });
    expect(result.current.game.gameState.dailyChallengeActive).toBe(true);

    await act(() => {
      result.current.game.completeLevel();
    });

    expect(result.current.game.gameState.levelsCompleted).toBe(levelsCompleted);
    expect(result.current.game.gameState.xpTotal).toBe(xpTotal);
    expect(result.current.game.gameState.dailyChallengeActive).toBe(false);

    await act(() => {
      result.current.achievements.completeDailyChallenge(1);
    });
    expect(result.current.game.gameState.xpTotal).toBe(xpTotal);
    expect(result.current.game.gameState.levelsCompleted).toBe(levelsCompleted);
  });
});
