import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ProgressBar from './ProgressBar';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

interface LearningPathHeroProps {
  title: string;
  completed: number;
  total: number;
  nextLessonTitle?: string;
  onContinue: () => void;
}

export default function LearningPathHero({
  title,
  completed,
  total,
  nextLessonTitle,
  onContinue,
}: LearningPathHeroProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDone = completed >= total;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <GraduationCap size={20} color={colors.text} />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Learning Path</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <Text style={styles.count}>
        {completed} of {total} lessons complete
      </Text>
      <ProgressBar current={completed} total={total} showLabel={false} />

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onContinue();
        }}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>
          {isDone ? 'Review lessons' : nextLessonTitle ? `Continue: ${nextLessonTitle}` : 'Continue'}
        </Text>
        <ArrowRight size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginBottom: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    title: {
      marginTop: 2,
      fontSize: 18,
      fontWeight: '800' as const,
      color: colors.text,
    },
    count: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    button: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    buttonText: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text,
    },
  });
