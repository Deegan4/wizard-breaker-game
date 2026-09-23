import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from './GameContext';
import { LESSONS, getLessonById, getLessonsForModule } from '@/constants/lessons';
import { LESSON_XP_REWARD } from '@/constants/xp';

export interface LessonProgress {
  lessonId: string;
  completedStepIds: string[];
  completed: boolean;
  completedAt?: number;
}

export interface LessonContextType {
  progress: Record<string, LessonProgress>;
  completeStep: (lessonId: string, stepId: string) => void;
  completeLesson: (lessonId: string) => void;
  getModuleProgress: (moduleId: string) => { completed: number; total: number };
  isLessonUnlocked: (lessonId: string) => boolean;
}

const LESSON_PROGRESS_STORAGE = 'wizard_breaker_lesson_progress';

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const { awardXP } = useGame();
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(LESSON_PROGRESS_STORAGE);
        if (saved) {
          setProgress(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.log('Error loading lesson progress:', e);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(LESSON_PROGRESS_STORAGE, JSON.stringify(progress)).catch(console.log);
  }, [progress, isLoaded]);

  const completeStep = useCallback((lessonId: string, stepId: string) => {
    setProgress(prev => {
      const existing = prev[lessonId] ?? { lessonId, completedStepIds: [], completed: false };
      if (existing.completedStepIds.includes(stepId)) return prev;
      return {
        ...prev,
        [lessonId]: { ...existing, completedStepIds: [...existing.completedStepIds, stepId] },
      };
    });
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    const lesson = getLessonById(lessonId);
    setProgress(prev => {
      const existing = prev[lessonId];
      if (existing?.completed) return prev;
      return {
        ...prev,
        [lessonId]: {
          lessonId,
          completedStepIds: lesson?.steps.map(s => s.id) ?? existing?.completedStepIds ?? [],
          completed: true,
          completedAt: Date.now(),
        },
      };
    });
    awardXP(lesson?.xpReward ?? LESSON_XP_REWARD);
  }, [awardXP]);

  const getModuleProgress = useCallback((moduleId: string) => {
    const lessons = getLessonsForModule(moduleId);
    const completed = lessons.filter(l => progress[l.id]?.completed).length;
    return { completed, total: lessons.length };
  }, [progress]);

  const isLessonUnlocked = useCallback((lessonId: string): boolean => {
    const lesson = getLessonById(lessonId);
    if (!lesson) return false;
    const moduleLessons = getLessonsForModule(lesson.moduleId);
    const index = moduleLessons.findIndex(l => l.id === lessonId);
    if (index <= 0) return true;
    const prevLesson = moduleLessons[index - 1];
    return progress[prevLesson.id]?.completed ?? false;
  }, [progress]);

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <LessonContext.Provider value={{ progress, completeStep, completeLesson, getModuleProgress, isLessonUnlocked }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessons() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessons must be used within a LessonProvider');
  }
  return context;
}

// re-export for convenience so screens don't need to import from two files
export { LESSONS };
