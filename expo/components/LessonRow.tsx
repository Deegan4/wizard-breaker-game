import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Lock, Check, ChevronRight, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import type { Lesson } from '@/constants/lessons';

export type LessonStatus = 'locked' | 'current' | 'completed';

interface LessonRowProps {
  lesson: Lesson;
  status: LessonStatus;
  onPress: () => void;
}

export default function LessonRow({ lesson, status, onPress }: LessonRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const handlePress = () => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}, ${isLocked ? 'locked' : isCompleted ? 'completed' : `${lesson.durationMinutes} minutes`}`}
      accessibilityHint={isLocked ? 'Finish the previous lesson to unlock' : undefined}
      accessibilityState={{ disabled: isLocked }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        status === 'current' && styles.rowCurrent,
        isLocked && styles.rowLocked,
        pressed && !isLocked && styles.rowPressed,
      ]}
    >
      <View style={[styles.icon, (isCompleted || status === 'current') && styles.iconActive]}>
        {isCompleted ? (
          <Check size={16} color={colors.textOnPrimary} />
        ) : isLocked ? (
          <Lock size={14} color={colors.textMuted} />
        ) : (
          <Text style={styles.iconNumber}>{lesson.order}</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, isLocked && styles.textLocked]} numberOfLines={1}>
          {lesson.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {isLocked ? 'Finish the previous lesson to unlock' : lesson.description}
        </Text>
        <View style={styles.meta}>
          <Clock size={11} color={colors.textMuted} />
          <Text style={styles.metaText}>{lesson.durationMinutes} min</Text>
        </View>
      </View>
      {!isLocked && <ChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    rowCurrent: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    rowLocked: {
      opacity: 0.85,
    },
    rowPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconNumber: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.text,
    },
    body: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text,
    },
    textLocked: {
      color: colors.textSecondary,
    },
    description: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textSecondary,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },
    metaText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
