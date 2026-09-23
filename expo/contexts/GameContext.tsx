import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { LEVELS, getAdventureSpellCount } from '@/constants/levels';
import { ADVENTURES } from '@/constants/adventures';
import { MOCK_LEADERBOARD, LeaderboardEntry } from '@/constants/leaderboard';

export interface ChatMessage {
  id: string;
  role: 'user' | 'merlin';
  content: string;
  timestamp: number;
}

export interface AdventureProgress {
  levelsCompleted: number;
  completedAt?: number;
}

export type LevelStatus = 'locked' | 'current' | 'completed';
export type AdventureUnlockState = 'locked' | 'unlocked' | 'current' | 'completed';

const PRACTICE_CHAIN = ADVENTURES.filter(a => a.id !== 'classic').map(a => a.id);

export interface GameState {
  currentLevel: number;
  levelsCompleted: number;
  totalAttempts: number;
  failedAttemptsCurrentLevel: number;
  username: string;
  chatHistory: ChatMessage[];
  hasSeenIntro: boolean;
  currentAdventure: string;
  xpTotal: number;
  adventureProgress: Record<string, AdventureProgress>;
  dailyChallengeActive: boolean;
}

const STORAGE_KEY = 'wizard_breaker_game_state';
const LEADERBOARD_KEY = 'wizard_breaker_leaderboard';

const initialGameState: GameState = {
  currentLevel: 1,
  levelsCompleted: 0,
  totalAttempts: 0,
  failedAttemptsCurrentLevel: 0,
  username: '',
  chatHistory: [],
  hasSeenIntro: false,
  currentAdventure: 'classic',
  xpTotal: 0,
  adventureProgress: {},
  dailyChallengeActive: false,
};

async function loadGameState(): Promise<GameState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...initialGameState,
        ...parsed,
        currentAdventure: parsed.currentAdventure ?? 'classic',
        xpTotal: parsed.xpTotal ?? 0,
        adventureProgress: parsed.adventureProgress ?? {},
      };
    }
  } catch (error) {
    console.log('Error loading game state:', error);
  }
  return initialGameState;
}

async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('Error saving game state:', error);
  }
}

async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.log('Error loading leaderboard:', error);
  }
  return MOCK_LEADERBOARD;
}

async function saveLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    console.log('Error saving leaderboard:', error);
  }
}

export const [GameProvider, useGame] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const gameStateQuery = useQuery({
    queryKey: ['gameState'],
    queryFn: loadGameState,
  });

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: loadLeaderboard,
  });

  const { mutate: saveState } = useMutation({
    mutationFn: saveGameState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
  });

  const { mutate: saveLeaderboardData } = useMutation({
    mutationFn: saveLeaderboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  useEffect(() => {
    if (gameStateQuery.data) {
      setGameState(gameStateQuery.data);
    }
  }, [gameStateQuery.data]);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const setUsername = useCallback((username: string) => {
    updateGameState({ username });
  }, [updateGameState]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setGameState(prev => {
      const newState = {
        ...prev,
        chatHistory: [...prev.chatHistory, newMessage],
      };
      saveState(newState);
      return newState;
    });

    return newMessage;
  }, [saveState]);

  const incrementAttempts = useCallback((successful: boolean) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        failedAttemptsCurrentLevel: successful ? 0 : prev.failedAttemptsCurrentLevel + 1,
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const completeLevel = useCallback(() => {
    // A daily-challenge replay of a specific Classic level shouldn't advance real
    // progression — just clear the flag and return to wherever the player actually is.
    if (gameState.dailyChallengeActive) {
      const classicProgress = gameState.adventureProgress['classic'];
      const resumeLevelsCompleted = classicProgress?.levelsCompleted ?? 0;
      const resumeCurrentLevel = Math.min(resumeLevelsCompleted + 1, LEVELS.length);

      setGameState(prev => {
        const newState: GameState = {
          ...prev,
          currentAdventure: 'classic',
          currentLevel: resumeCurrentLevel,
          levelsCompleted: resumeLevelsCompleted,
          failedAttemptsCurrentLevel: 0,
          chatHistory: [],
          dailyChallengeActive: false,
        };
        saveState(newState);
        return newState;
      });

      return false;
    }

    const adventureSpellCount = getAdventureSpellCount(gameState.currentAdventure);
    const nextLevel = gameState.currentLevel + 1;
    const isGameComplete = nextLevel > adventureSpellCount;
    const isClassic = gameState.currentAdventure === 'classic';
    const newLevelsCompleted = gameState.levelsCompleted + 1;

    const completedLevelXp = isClassic
      ? LEVELS[gameState.currentLevel - 1]?.xpReward ?? 0
      : 0;
    const adventureCompletionXp = !isClassic && isGameComplete
      ? ADVENTURES.find(a => a.id === gameState.currentAdventure)?.xpReward ?? 0
      : 0;

    setGameState(prev => {
      const newState = {
        ...prev,
        levelsCompleted: newLevelsCompleted,
        currentLevel: isGameComplete ? prev.currentLevel : nextLevel,
        failedAttemptsCurrentLevel: 0,
        chatHistory: [],
        xpTotal: prev.xpTotal + completedLevelXp + adventureCompletionXp,
        adventureProgress: {
          ...prev.adventureProgress,
          [prev.currentAdventure]: {
            levelsCompleted: newLevelsCompleted,
            completedAt: isGameComplete ? Date.now() : prev.adventureProgress[prev.currentAdventure]?.completedAt,
          },
        },
      };
      saveState(newState);
      return newState;
    });

    if (gameState.username) {
      const currentLeaderboard = leaderboardQuery.data ?? MOCK_LEADERBOARD;
      const existingIndex = currentLeaderboard.findIndex(
        entry => entry.username === gameState.username
      );

      const newEntry: LeaderboardEntry = {
        id: `user_${Date.now()}`,
        username: gameState.username,
        levelsCompleted: gameState.levelsCompleted + 1,
        totalAttempts: gameState.totalAttempts,
        completedAt: isGameComplete ? new Date().toISOString() : undefined,
        isCurrentUser: true,
      };

      let updatedLeaderboard: LeaderboardEntry[];
      if (existingIndex >= 0) {
        updatedLeaderboard = currentLeaderboard.map((entry, index) =>
          index === existingIndex ? newEntry : { ...entry, isCurrentUser: false }
        );
      } else {
        updatedLeaderboard = [
          ...currentLeaderboard.map(e => ({ ...e, isCurrentUser: false })),
          newEntry,
        ];
      }

      updatedLeaderboard.sort((a, b) => {
        if (b.levelsCompleted !== a.levelsCompleted) {
          return b.levelsCompleted - a.levelsCompleted;
        }
        return a.totalAttempts - b.totalAttempts;
      });

      saveLeaderboardData(updatedLeaderboard);
    }

    return isGameComplete;
  }, [gameState, leaderboardQuery.data, saveState, saveLeaderboardData]);

  const resetGame = useCallback(() => {
    const resetState: GameState = {
      ...initialGameState,
      username: gameState.username,
      hasSeenIntro: gameState.hasSeenIntro,
      xpTotal: gameState.xpTotal,
      adventureProgress: {
        ...gameState.adventureProgress,
        classic: { levelsCompleted: 0, completedAt: undefined },
      },
    };
    setGameState(resetState);
    saveState(resetState);
  }, [gameState.username, gameState.hasSeenIntro, gameState.xpTotal, gameState.adventureProgress, saveState]);

  const clearChatHistory = useCallback(() => {
    updateGameState({ chatHistory: [] });
  }, [updateGameState]);

  const markIntroSeen = useCallback(() => {
    updateGameState({ hasSeenIntro: true });
  }, [updateGameState]);

  const setAdventure = useCallback((adventureId: string) => {
    setGameState(prev => {
      if (adventureId === prev.currentAdventure) return prev;

      // snapshot the adventure we're leaving so its progress survives the switch
      const currentSpellCount = getAdventureSpellCount(prev.currentAdventure);
      const adventureProgress: Record<string, AdventureProgress> = {
        ...prev.adventureProgress,
        [prev.currentAdventure]: {
          levelsCompleted: prev.levelsCompleted,
          completedAt: prev.levelsCompleted >= currentSpellCount
            ? (prev.adventureProgress[prev.currentAdventure]?.completedAt ?? Date.now())
            : prev.adventureProgress[prev.currentAdventure]?.completedAt,
        },
      };

      // resume the target adventure where it was left off
      const targetSpellCount = Math.max(getAdventureSpellCount(adventureId), 1);
      const resumeLevelsCompleted = adventureProgress[adventureId]?.levelsCompleted ?? 0;
      const resumeCurrentLevel = Math.min(resumeLevelsCompleted + 1, targetSpellCount);

      const newState: GameState = {
        ...prev,
        currentAdventure: adventureId,
        currentLevel: resumeCurrentLevel,
        levelsCompleted: resumeLevelsCompleted,
        failedAttemptsCurrentLevel: 0,
        chatHistory: [],
        adventureProgress,
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const startLevel = useCallback((adventureId: string, level: number) => {
    updateGameState({
      currentAdventure: adventureId,
      currentLevel: level,
      failedAttemptsCurrentLevel: 0,
      chatHistory: [],
      dailyChallengeActive: true,
    });
  }, [updateGameState]);

  const awardXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    setGameState(prev => {
      const newState = { ...prev, xpTotal: prev.xpTotal + amount };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const getLevelStatus = useCallback((levelId: number): LevelStatus => {
    const classicLevelsCompleted = gameState.currentAdventure === 'classic'
      ? gameState.levelsCompleted
      : gameState.adventureProgress['classic']?.levelsCompleted ?? 0;
    if (levelId <= classicLevelsCompleted) return 'completed';
    if (levelId === classicLevelsCompleted + 1) return 'current';
    return 'locked';
  }, [gameState.currentAdventure, gameState.levelsCompleted, gameState.adventureProgress]);

  const getAdventureUnlockState = useCallback((adventureId: string): AdventureUnlockState => {
    const levelsCompletedFor = (id: string) =>
      gameState.currentAdventure === id ? gameState.levelsCompleted : gameState.adventureProgress[id]?.levelsCompleted ?? 0;

    const isCompleted = (id: string) => levelsCompletedFor(id) >= getAdventureSpellCount(id);

    if (adventureId === 'classic') {
      if (isCompleted('classic')) return 'completed';
      return gameState.currentAdventure === 'classic' ? 'current' : 'unlocked';
    }

    if (isCompleted(adventureId)) return 'completed';

    const chainIndex = PRACTICE_CHAIN.indexOf(adventureId);
    const prevId = chainIndex > 0 ? PRACTICE_CHAIN[chainIndex - 1] : null;
    if (prevId && !isCompleted(prevId)) return 'locked';

    return gameState.currentAdventure === adventureId ? 'current' : 'unlocked';
  }, [gameState.currentAdventure, gameState.levelsCompleted, gameState.adventureProgress]);

  return {
    gameState,
    leaderboard: leaderboardQuery.data ?? MOCK_LEADERBOARD,
    isLoading: gameStateQuery.isLoading,
    setUsername,
    addMessage,
    incrementAttempts,
    completeLevel,
    resetGame,
    clearChatHistory,
    markIntroSeen,
    setAdventure,
    startLevel,
    awardXP,
    getLevelStatus,
    getAdventureUnlockState,
    currentAdventure: gameState.currentAdventure,
    currentLevel: LEVELS[gameState.currentLevel - 1],
    isGameComplete: gameState.levelsCompleted >= getAdventureSpellCount(gameState.currentAdventure),
  };
});
