import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home,
  Compass,
  Calendar,
  BookOpen,
  Terminal,
  Trophy,
  Sparkles,
  Flame,
  Star,
  Play,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { useGame } from '@/contexts/GameContext';
import { useAchievements } from '@/contexts/AchievementContext';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

// Sidebar order differs from the phone tab bar: play-focused screens first, and
// Ranks gets a slot here since the sidebar isn't limited to five items.
const NAV_ITEMS: { route: string; label: string; icon: LucideIcon }[] = [
  { route: 'index', label: 'Home', icon: Home },
  { route: 'adventures', label: 'Quests', icon: Compass },
  { route: 'daily', label: 'Daily', icon: Calendar },
  { route: 'learn', label: 'Learn', icon: BookOpen },
  { route: 'playground', label: 'Lab', icon: Terminal },
  { route: 'leaderboard', label: 'Ranks', icon: Trophy },
];

export const SIDEBAR_WIDTH = 248;

export default function SidebarNav({ state, navigation }: TabBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { gameState, currentLevel } = useGame();
  const { stats } = useAchievements();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.container} accessibilityRole="menu">
      <View style={styles.brand}>
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          style={styles.orb}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={16} color={colors.textOnPrimary} />
        </LinearGradient>
        <Text style={styles.brandText}>Wizard Breaker</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map(({ route, label, icon: Icon }) => {
          const target = state.routes.find((r) => r.name === route);
          if (!target) return null;
          const active = activeRoute === route;
          return (
            <Pressable
              key={route}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: active }}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: target.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) navigation.navigate(target.name);
              }}
              style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
                styles.navItem,
                (hovered || pressed) && !active && styles.navItemHover,
                active && styles.navItemActive,
              ]}
            >
              <Icon size={20} color={active ? colors.primaryLight : colors.textMuted} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Star size={14} color={colors.starYellow} />
            <Text style={styles.statValue}>{gameState.xpTotal}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Flame size={14} color={colors.accent} />
            <Text style={styles.statValue}>{stats.dailyStreak}</Text>
            <Text style={styles.statLabel}>streak</Text>
          </View>
        </View>
        {currentLevel && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/game')}
            style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
          >
            <Play size={16} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
            <View style={styles.playTextWrap}>
              <Text style={styles.playLabel}>Continue</Text>
              <Text style={styles.playLevel} numberOfLines={1}>
                {currentLevel.name}
              </Text>
            </View>
          </Pressable>
        )}
        {!!gameState.username && (
          <Text style={styles.username} numberOfLines={1}>
            Playing as {gameState.username}
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      width: SIDEBAR_WIDTH,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 20,
      backgroundColor: colors.backgroundSecondary,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 8,
      marginBottom: 28,
    },
    orb: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandText: {
      fontSize: 17,
      fontWeight: '800' as const,
      color: colors.text,
    },
    nav: {
      gap: 4,
      flex: 1,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      height: 44,
      borderRadius: 12,
    },
    navItemHover: {
      backgroundColor: colors.surface,
    },
    navItemActive: {
      backgroundColor: colors.primary + '26',
    },
    navLabel: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    navLabelActive: {
      color: colors.text,
    },
    footer: {
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    stat: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '800' as const,
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    playButtonPressed: {
      opacity: 0.9,
    },
    playTextWrap: {
      flex: 1,
    },
    playLabel: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.textOnPrimary,
      opacity: 0.8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    playLevel: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.textOnPrimary,
    },
    username: {
      fontSize: 12,
      color: colors.textMuted,
      paddingHorizontal: 4,
    },
  });
