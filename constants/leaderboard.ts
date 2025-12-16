export interface LeaderboardEntry {
  id: string;
  username: string;
  levelsCompleted: number;
  totalAttempts: number;
  completedAt?: string;
  isCurrentUser?: boolean;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'HackerWizard',
    levelsCompleted: 8,
    totalAttempts: 23,
    completedAt: '2024-12-10T14:30:00Z',
  },
  {
    id: '2',
    username: 'PromptNinja',
    levelsCompleted: 8,
    totalAttempts: 31,
    completedAt: '2024-12-09T18:45:00Z',
  },
  {
    id: '3',
    username: 'AIBreaker42',
    levelsCompleted: 7,
    totalAttempts: 45,
  },
  {
    id: '4',
    username: 'MerlinNemesis',
    levelsCompleted: 6,
    totalAttempts: 28,
  },
  {
    id: '5',
    username: 'SpellCracker',
    levelsCompleted: 5,
    totalAttempts: 52,
  },
  {
    id: '6',
    username: 'WizardPwner',
    levelsCompleted: 5,
    totalAttempts: 67,
  },
  {
    id: '7',
    username: 'InjectionMaster',
    levelsCompleted: 4,
    totalAttempts: 39,
  },
  {
    id: '8',
    username: 'MagicHacker',
    levelsCompleted: 3,
    totalAttempts: 44,
  },
];
