import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { LessonProvider, useLessons } from '@/contexts/LessonContext';
import { AchievementProvider, useAchievements } from '@/contexts/AchievementContext';
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
});
