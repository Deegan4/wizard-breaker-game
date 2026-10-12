import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Flame } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { useAchievements } from '@/contexts/AchievementContext';

export default function DailyStreakCalendar() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { getWeekCalendar, stats, dailyChallenge } = useAchievements();
  const week = getWeekCalendar();
  const todayDone = dailyChallenge?.completed ?? false;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily streak</Text>
        <View style={styles.streakBadge}>
          <Flame size={14} color={colors.accent} />
          <Text style={styles.streakText}>{stats.dailyStreak} day{stats.dailyStreak === 1 ? '' : 's'}</Text>
        </View>
      </View>
      <View style={styles.week}>
        {week.map(day => {
          const isToday = day.state === 'today';
          const done = day.state === 'completed' || (isToday && todayDone);
          return (
            <View key={day.date} style={styles.day}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day.label}</Text>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  isToday && !done && styles.dotToday,
                  day.state === 'missed' && styles.dotMissed,
                ]}
              >
                {done && <Check size={14} color={colors.text} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.text,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.accent + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    streakText: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: colors.accent,
    },
    week: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    day: {
      alignItems: 'center',
      gap: 8,
    },
    dayLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    dayLabelToday: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    dot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dotToday: {
      borderColor: colors.primary,
    },
    dotMissed: {
      opacity: 0.5,
    },
  });
