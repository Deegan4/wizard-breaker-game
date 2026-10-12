import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Lock, Check, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { Level } from '@/constants/levels';
import { LevelStatus } from '@/contexts/GameContext';

interface QuestTimelineCardProps {
  level: Level;
  status: LevelStatus;
  onPress: () => void;
  isLast?: boolean;
}

const TIMELINE_COLUMN_WIDTH = 32;
const TIMELINE_GAP = 12;

export default function QuestTimelineCard({
  level,
  status,
  onPress,
  isLast = false,
}: QuestTimelineCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  const handlePress = () => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.timelineColumn}>
          <View
            style={[
              styles.iconCircle,
              isCompleted && styles.iconCircleCompleted,
              isCurrent && styles.iconCircleCurrent,
            ]}
          >
            {isCompleted ? (
              <Check size={16} color={colors.textOnPrimary} />
            ) : isLocked ? (
              <Lock size={14} color={colors.textMuted} />
            ) : (
              <Text style={styles.iconCircleNumber}>{level.id}</Text>
            )}
          </View>
          {!isLast && <View style={styles.line} />}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handlePress}
          style={({ pressed }) => [
            styles.card,
            isCurrent && styles.cardCurrent,
            isLocked && styles.cardLocked,
            pressed && !isLocked && styles.cardPressed,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text
              style={[styles.title, isLocked && styles.textLocked]}
              numberOfLines={1}
            >
              {level.name}
            </Text>
            {!!level.xpReward && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{level.xpReward} XP</Text>
              </View>
            )}
          </View>

          {!isLocked && (
            <Text style={styles.description} numberOfLines={2}>
              {level.description}
            </Text>
          )}

          {isCompleted && (
            <View style={[styles.statusPill, styles.statusPillCompleted]}>
              <Check size={12} color={colors.enchantedGreen} />
              <Text style={[styles.statusPillText, { color: colors.enchantedGreen }]}>
                Completed
              </Text>
            </View>
          )}
          {isCurrent && (
            <View style={[styles.statusPill, styles.statusPillCurrent]}>
              <Text style={[styles.statusPillText, { color: colors.primary }]}>
                Ready to continue
              </Text>
            </View>
          )}
          {isLocked && (
            <View style={styles.statusPill}>
              <Lock size={12} color={colors.textMuted} />
              <Text style={styles.statusPillText}>Locked</Text>
            </View>
          )}
        </Pressable>
      </View>

      {isCurrent && (
        <Pressable
          accessibilityRole="button"
          onPress={handlePress}
          style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <ArrowRight size={16} color={colors.textOnPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
    },
    timelineColumn: {
      alignItems: 'center',
      width: TIMELINE_COLUMN_WIDTH,
      marginRight: TIMELINE_GAP,
    },
    iconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconCircleCurrent: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconCircleNumber: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: colors.textOnPrimary,
    },
    line: {
      width: 2,
      flex: 1,
      minHeight: 20,
      marginTop: 4,
      borderStyle: 'dashed' as const,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardCurrent: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    cardLocked: {
      opacity: 0.55,
    },
    cardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: '700' as const,
    },
    textLocked: {
      color: colors.textMuted,
    },
    xpBadge: {
      backgroundColor: colors.starYellow + '25',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    xpText: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.starYellow,
    },
    description: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.backgroundSecondary,
    },
    statusPillCompleted: {
      backgroundColor: colors.enchantedGreen + '20',
    },
    statusPillCurrent: {
      backgroundColor: colors.primary + '20',
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.textMuted,
    },
    continueButton: {
      marginLeft: TIMELINE_COLUMN_WIDTH + TIMELINE_GAP,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 16,
    },
    continueButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    continueButtonText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.textOnPrimary,
    },
  });
