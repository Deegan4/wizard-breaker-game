import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import ProgressBar from './ProgressBar';

interface QuestSummaryCardProps {
  completed: number;
  total: number;
}

export default function QuestSummaryCard({ completed, total }: QuestSummaryCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <TrendingUp size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {completed} of {total} quests complete
          </Text>
          <Text style={styles.subtitle}>
            Keep going to strengthen your prompt security skills!
          </Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressBarWrapper}>
          <ProgressBar current={completed} total={total} showLabel={false} />
        </View>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700' as const,
    },
    subtitle: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 12,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressBarWrapper: {
      flex: 1,
    },
    percent: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: colors.textMuted,
      width: 36,
      textAlign: 'right',
    },
  });
