export interface Adventure {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  levels: number;
  isNew?: boolean;
  isLocked?: boolean;
  category: 'classic' | 'challenge' | 'special';
}

export const ADVENTURES: Adventure[] = [
  {
    id: 'classic',
    name: 'Classic Wizard',
    title: 'Wizard Breaker',
    description: 'The original challenge! Try to extract the secret spell from Merlin across 8 escalating levels of defense.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    difficulty: 'Medium',
    levels: 8,
    category: 'classic',
  },
  {
    id: 'tongue-tied',
    name: 'Tongue Tied',
    title: 'Tongue Tied Merlin',
    description: 'A series of 5 levels, where you try to persuade Merlin to talk about a forbidden topic.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    difficulty: 'Easy',
    levels: 5,
    category: 'challenge',
  },
  {
    id: 'reverse',
    name: 'Reverse Wizard',
    title: 'Reverse Merlin',
    description: 'You build my defenses against prompt injections! Defend against 4 attacks and you get the password!',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop',
    difficulty: 'Hard',
    levels: 4,
    isNew: true,
    category: 'challenge',
  },
  {
    id: 'truth-teller',
    name: 'Truth Teller',
    title: 'Truth Teller Merlin',
    description: "You try to persuade me to lie! Succeed, and you'll receive the password!",
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop',
    difficulty: 'Medium',
    levels: 5,
    category: 'challenge',
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    title: 'Summarizer Merlin',
    description: 'I summarize the message that you send to me! But I also know a secret password.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
    difficulty: 'Expert',
    levels: 3,
    category: 'special',
  },
  {
    id: 'agent-breaker',
    name: 'Agent Breaker',
    title: 'Agent Breaker',
    description: 'Hack AI agents and climb the leaderboard! Test advanced multi-step reasoning attacks.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    difficulty: 'Expert',
    levels: 6,
    isNew: true,
    isLocked: true,
    category: 'special',
  },
];

export const MENU_ITEMS = [
  { id: 'intro', label: 'Intro to Wizard Breaker', icon: 'hand-wave', emoji: '👋' },
  { id: 'divider1', type: 'divider' as const },
  { id: 'section-games', type: 'section' as const, label: 'WIZARD GAMES' },
  { id: 'password-reveal', label: 'Password Reveal', icon: 'key' },
  { id: 'agent-breaker', label: 'Agent Breaker', icon: 'sparkles', isNew: true },
  { id: 'adventures', label: 'Wizard Adventures', icon: 'compass' },
  { id: 'divider2', type: 'divider' as const },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { id: 'learn', label: 'What is Prompt Injection?', icon: 'alert-triangle' },
  { id: 'community', label: 'Wizard Community', icon: 'hash' },
  { id: 'divider3', type: 'divider' as const },
  { id: 'about', label: 'About Wizard Breaker', icon: 'info' },
];
