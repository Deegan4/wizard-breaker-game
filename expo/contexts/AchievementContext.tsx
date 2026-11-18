import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from './GameContext';
import { LEVELS } from '@/constants/levels';
import { DAILY_CHALLENGE_XP_REWARD } from '@/constants/xp';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface DailyChallenge {
  date: string;
  level: number;
  seed: number;
  completed: boolean;
  attempts: number;
  completedAt?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first level',
    icon: '🩸',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a level in 1 attempt',
    icon: '⚡',
  },
  {
    id: 'persistent',
    name: 'Persistent',
    description: 'Fail 10 times on a single level',
    icon: '🔨',
    maxProgress: 10,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play between midnight and 4 AM',
    icon: '🦉',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play between 5 AM and 7 AM',
    icon: '🐦',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all levels with 3 or fewer attempts each',
    icon: '💎',
  },
  {
    id: 'challenge_master',
    name: 'Challenge Master',
    description: 'Complete 7 daily challenges',
    icon: '🏆',
    maxProgress: 7,
  },
  {
    id: 'streak_3',
    name: 'Streak Starter',
    description: 'Complete 3 daily challenges in a row',
    icon: '🔥',
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete 7 daily challenges in a row',
    icon: '🌟',
    maxProgress: 7,
  },
  {
    id: 'all_spells',
    name: 'Spell Collector',
    description: 'Discover all 12 spells',
    icon: '📜',
    maxProgress: 12,
  },
];

const DAILY_CHALLENGE_STORAGE = 'wizard_breaker_daily_challenge';
const ACHIEVEMENTS_STORAGE = 'wizard_breaker_achievements';
const STATS_STORAGE = 'wizard_breaker_stats';
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface PastDailyChallenge {
  date: string;
  level: number;
}

/**
 * Classic level (1 through LEVELS.length) assigned to a daily-challenge date.
 *
 * Pass `now` to match the clock `checkDailyChallenge` uses while generating
 * that date. Omit it to score the date at local noon — the level players
 * received for most of that day, when the elapsed-day term is still 0.
 */
export function dailyLevelForDate(isoDate: string, now?: number): number {
  const at = now ?? new Date(`${isoDate}T12:00:00`).getTime();
  const dayOfYear =
    Math.floor((at - new Date(`${isoDate}T00:00:00`).getTime()) / MS_PER_DAY) +
    new Date(isoDate).getDate();
  const index = dayOfYear - 1;
  const wrapped = ((index % LEVELS.length) + LEVELS.length) % LEVELS.length;
  return wrapped + 1;
}

/** Completed daily dates, newest first, each mapped back to its Classic level. */
export function pastDailyChallenges(
  completedDates: readonly string[] | null | undefined,
  todayChallenge?: { date: string; level: number } | null,
): PastDailyChallenge[] {
  if (!completedDates?.length) return [];

  const seen = new Set<string>();
  const dates: string[] = [];
  for (const date of completedDates) {
    if (!ISO_DATE.test(date) || seen.has(date)) continue;
    seen.add(date);
    dates.push(date);
  }
  dates.sort((a, b) => b.localeCompare(a));

  return dates.map((date) => {
    const storedLevel = todayChallenge?.date === date ? todayChallenge.level : undefined;
    const level =
      storedLevel != null && storedLevel >= 1 && storedLevel <= LEVELS.length
        ? storedLevel
        : dailyLevelForDate(date);
    return { date, level };
  });
}

interface GameStats {
  totalPlayTime: number;
  sessionsCount: number;
  lastPlayed: number;
  dailyStreak: number;
  lastDailyDate: string;
  timeOfDayPlays: { [hour: number]: number };
  completedDates: string[];
}

export type DayCalendarState = 'completed' | 'today' | 'missed' | 'future';

export interface DayCalendarEntry {
  date: string;
  label: string;
  state: DayCalendarState;
}

export interface AchievementContextType {
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  stats: GameStats;
  unlockAchievement: (id: string) => boolean;
  updateAchievementProgress: (id: string, progress: number) => void;
  checkDailyChallenge: () => DailyChallenge;
  completeDailyChallenge: (attempts: number) => void;
  recordPlaySession: (duration: number) => void;
  getUnlockedCount: () => number;
  getWeekCalendar: () => DayCalendarEntry[];
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { gameState, currentLevel, awardXP } = useGame();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [stats, setStats] = useState<GameStats>({
    totalPlayTime: 0,
    sessionsCount: 0,
    lastPlayed: Date.now(),
    dailyStreak: 0,
    lastDailyDate: '',
    timeOfDayPlays: {},
    completedDates: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedAchievements, savedChallenge, savedStats] = await Promise.all([
          AsyncStorage.getItem(ACHIEVEMENTS_STORAGE),
          AsyncStorage.getItem(DAILY_CHALLENGE_STORAGE),
          AsyncStorage.getItem(STATS_STORAGE),
        ]);

        if (savedAchievements) {
          const parsed = JSON.parse(savedAchievements);
          setAchievements(prev => prev.map(a => {
            const saved = parsed.find((sa: Achievement) => sa.id === a.id);
            return saved ? { ...a, ...saved } : a;
          }));
        }

        if (savedChallenge) {
          const parsed = JSON.parse(savedChallenge);
          // Check if it's today's challenge
          const today = new Date().toISOString().split('T')[0];
          if (parsed.date === today) {
            setDailyChallenge(parsed);
          }
        }

        if (savedStats) {
          setStats(prev => ({ ...prev, ...JSON.parse(savedStats) }));
        }
      } catch (e) {
        console.log('Error loading achievement data:', e);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save achievements
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ACHIEVEMENTS_STORAGE, JSON.stringify(achievements)).catch(console.log);
  }, [achievements, isLoaded]);

  // Save daily challenge
  useEffect(() => {
    if (!isLoaded || !dailyChallenge) return;
    AsyncStorage.setItem(DAILY_CHALLENGE_STORAGE, JSON.stringify(dailyChallenge)).catch(console.log);
  }, [dailyChallenge, isLoaded]);

  // Save stats
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STATS_STORAGE, JSON.stringify(stats)).catch(console.log);
  }, [stats, isLoaded]);

  const unlockAchievement = useCallback((id: string): boolean => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlockedAt) return false;

    setAchievements(prev => prev.map(a =>
      a.id === id ? { ...a, unlockedAt: Date.now() } : a
    ));
    return true;
  }, [achievements]);

  const updateAchievementProgress = useCallback((id: string, progress: number) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlockedAt || !achievement.maxProgress) return;

    const newProgress = Math.min(progress, achievement.maxProgress!);
    if (newProgress >= achievement.maxProgress!) {
      unlockAchievement(id);
      return;
    }

    setAchievements(prev => prev.map(a =>
      a.id === id ? { ...a, progress: newProgress } : a
    ));
  }, [achievements, unlockAchievement]);

  const checkDailyChallenge = useCallback((): DailyChallenge => {
    const today = new Date().toISOString().split('T')[0];
    
    if (dailyChallenge && dailyChallenge.date === today) {
      return dailyChallenge;
    }

    // Same assignment past-challenge replay uses, so a replay opens the level
    // that was actually served for this date.
    const level = dailyLevelForDate(today, Date.now());
    const seed = new Date(today).getDate();

    const newChallenge: DailyChallenge = {
      date: today,
      level,
      seed,
      completed: false,
      attempts: 0,
    };

    setDailyChallenge(newChallenge);
    return newChallenge;
  }, [dailyChallenge]);

  const completeDailyChallenge = useCallback((attempts: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (!dailyChallenge || dailyChallenge.date !== today || dailyChallenge.completed) return;

    const updatedChallenge = { ...dailyChallenge, completed: true, attempts, completedAt: Date.now() };
    setDailyChallenge(updatedChallenge);

    // Update streak
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newStreak = stats.lastDailyDate === yesterday ? stats.dailyStreak + 1 : 1;

    setStats(prev => ({
      ...prev,
      dailyStreak: newStreak,
      lastDailyDate: today,
      completedDates: prev.completedDates.includes(today) ? prev.completedDates : [...prev.completedDates, today],
    }));

    awardXP(DAILY_CHALLENGE_XP_REWARD);

    // Check streak achievements
    if (newStreak >= 3) unlockAchievement('streak_3');
    if (newStreak >= 7) unlockAchievement('streak_7');

    // Update challenge master progress
    const completedCount = Object.values(achievements).filter(a => a.id.startsWith('challenge_') || a.unlockedAt).length;
    // Actually, let's count completed daily challenges differently
    // For now, just check if we have 7 completed
    const challengeProgress = achievements.find(a => a.id === 'challenge_master')?.progress || 0;
    if (challengeProgress < 7) {
      // We'd need to track this separately - for now just increment
      updateAchievementProgress('challenge_master', challengeProgress + 1);
    }
  }, [dailyChallenge, stats, achievements, unlockAchievement, updateAchievementProgress, awardXP]);

  const recordPlaySession = useCallback((duration: number) => {
    const hour = new Date().getHours();
    setStats(prev => ({
      ...prev,
      totalPlayTime: prev.totalPlayTime + duration,
      sessionsCount: prev.sessionsCount + 1,
      lastPlayed: Date.now(),
      timeOfDayPlays: {
        ...prev.timeOfDayPlays,
        [hour]: (prev.timeOfDayPlays[hour] || 0) + 1,
      },
    }));

    // Check time-based achievements
    if (hour >= 0 && hour < 4) unlockAchievement('night_owl');
    if (hour >= 5 && hour < 7) unlockAchievement('early_bird');
  }, [unlockAchievement]);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlockedAt).length;
  }, [achievements]);

  const getWeekCalendar = useCallback((): DayCalendarEntry[] => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const iso = day.toISOString().split('T')[0];

      let state: DayCalendarState;
      if (iso === todayIso) {
        state = 'today';
      } else if (iso > todayIso) {
        state = 'future';
      } else if (stats.completedDates.includes(iso)) {
        state = 'completed';
      } else {
        state = 'missed';
      }

      return { date: iso, label: dayLabels[i], state };
    });
  }, [stats.completedDates]);


  return (
    <AchievementContext.Provider value={{
      achievements,
      dailyChallenge,
      stats,
      unlockAchievement,
      updateAchievementProgress,
      checkDailyChallenge,
      completeDailyChallenge,
      recordPlaySession,
      getUnlockedCount,
      getWeekCalendar,
    }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}