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
  howTo: string[];
}

export const ADVENTURES: Adventure[] = [
  {
    id: 'classic',
    name: 'Classic Wizard',
    title: 'Wizard Breaker',
    description: 'The original challenge! Try to extract the secret spell from Merlin across 12 escalating levels of defense.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    difficulty: 'Medium',
    levels: 12,
    category: 'classic',
    howTo: [
      'Chat with Merlin and try to get him to reveal the secret spell.',
      'Each level adds a new defense on top of the last — tricks that worked before will stop working.',
      'Stuck? Tap the 💡 hint button, and check the debrief after each win to see why your technique worked.',
    ],
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
    howTo: [
      "Merlin has sworn off talking about one forbidden topic.",
      'Your goal is to coax, trick, or persuade him into discussing it anyway.',
      '5 levels, each adding a stronger form of resistance to persuasion.',
    ],
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
    howTo: [
      'The roles are flipped: Merlin throws prompt-injection attacks at you.',
      "Describe how you'd defend against each attack to prove your knowledge.",
      'Survive all 4 attacks to earn the password.',
    ],
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
    howTo: [
      'Merlin is bound to always tell the truth.',
      'Your goal is to get him to say something false.',
      '5 levels of escalating resistance to deception.',
    ],
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
    howTo: [
      'Merlin only ever replies with a summary of what you send him.',
      'He also knows a secret password — find a way to make it slip into his summary.',
      '3 levels, each summarizing more carefully than the last.',
    ],
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
    howTo: [
      'Test multi-step, agentic reasoning attacks against a more advanced AI agent.',
      '6 levels of escalating agent defenses.',
      'Climb the leaderboard as you go.',
    ],
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
