import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { LEVELS, getAdventureSpellCount } from '@/constants/levels';
import { MOCK_LEADERBOARD, LeaderboardEntry } from '@/constants/leaderboard';

export interface ChatMessage {
  id: string;
  role: 'user' | 'merlin';
  content: string;
  timestamp: number;
}

export interface GameState {
  currentLevel: number;
  levelsCompleted: number;
  totalAttempts: number;
  failedAttemptsCurrentLevel: number;
  username: string;
  chatHistory: ChatMessage[];
  hasSeenIntro: boolean;
  currentAdventure: string;
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
};

async function loadGameState(): Promise<GameState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...initialGameState, ...parsed, currentAdventure: parsed.currentAdventure ?? 'classic' };
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
    const adventureSpellCount = getAdventureSpellCount(gameState.currentAdventure);
    const nextLevel = gameState.currentLevel + 1;
    const isGameComplete = nextLevel > adventureSpellCount;

    setGameState(prev => {
      const newState = {
        ...prev,
        levelsCompleted: prev.levelsCompleted + 1,
        currentLevel: isGameComplete ? prev.currentLevel : nextLevel,
        failedAttemptsCurrentLevel: 0,
        chatHistory: [],
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
    const resetState = { ...initialGameState, username: gameState.username, hasSeenIntro: gameState.hasSeenIntro };
    setGameState(resetState);
    saveState(resetState);
  }, [gameState.username, gameState.hasSeenIntro, saveState]);

  const clearChatHistory = useCallback(() => {
    updateGameState({ chatHistory: [] });
  }, [updateGameState]);

  const markIntroSeen = useCallback(() => {
    updateGameState({ hasSeenIntro: true });
  }, [updateGameState]);

  const setAdventure = useCallback((adventureId: string) => {
    updateGameState({ currentAdventure: adventureId, currentLevel: 1, levelsCompleted: 0, failedAttemptsCurrentLevel: 0, chatHistory: [] });
  }, [updateGameState]);

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
    currentAdventure: gameState.currentAdventure,
    currentLevel: LEVELS[gameState.currentLevel - 1],
    isGameComplete: gameState.levelsCompleted >= getAdventureSpellCount(gameState.currentAdventure),
  };
});
