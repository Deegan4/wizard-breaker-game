export default {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  secondary: '#06B6D4',
  secondaryDark: '#0891B2',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',

  background: '#0A0618',
  backgroundSecondary: '#151030',
  backgroundTertiary: '#1E1844',

  surface: '#2D1F54',
  surfaceLight: '#3D2D6B',
  surfaceElevated: '#382663',

  text: '#FFFFFF',
  textSecondary: '#C4B5FD',
  textMuted: '#8B7FB3',

  border: '#4C3A7C',
  borderLight: '#6B5B8C',

  starYellow: '#FFD700',
  magicPurple: '#9333EA',
  mysticBlue: '#3B82F6',
  enchantedGreen: '#22C55E',

  gradient: {
    primary: ['#4C1D95', '#7C3AED', '#8B5CF6'] as const,
    magic: ['#0A0618', '#1E1040', '#2D1B69'] as const,
    success: ['#065F46', '#10B981'] as const,
    danger: ['#7F1D1D', '#EF4444'] as const,
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
  },

  overlay: 'rgba(10, 6, 24, 0.92)',
};
