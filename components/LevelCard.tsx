import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Lock, CheckCircle, Play, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Level } from '@/constants/levels';

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

export default function LevelCard({
  level,
  isUnlocked,
  isCompleted,
  isCurrent,
  onPress,
}: LevelCardProps) {
  const handlePress = () => {
    if (isUnlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const getDifficultyColor = () => {
    const colors: Record<string, string> = {
      'Novice': Colors.enchantedGreen,
      'Apprentice': Colors.secondary,
      'Adept': Colors.mysticBlue,
      'Expert': Colors.primary,
      'Master': Colors.magicPurple,
      'Archmage': Colors.accent,
      'Grand Wizard': '#FF6B6B',
      'Supreme Sorcerer': Colors.danger,
    };
    return colors[level.difficulty] || Colors.textMuted;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isCurrent && styles.currentContainer,
        isCompleted && styles.completedContainer,
        !isUnlocked && styles.lockedContainer,
        pressed && isUnlocked && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level.id}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, !isUnlocked && styles.lockedText]} numberOfLines={1}>
            {level.name}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '30' }]}>
            <Text style={[styles.difficulty, { color: getDifficultyColor() }]}>
              {level.difficulty}
            </Text>
          </View>
        </View>
        <View style={styles.statusIcon}>
          {isCompleted ? (
            <CheckCircle size={24} color={Colors.enchantedGreen} />
          ) : isCurrent ? (
            <Play size={24} color={Colors.primary} fill={Colors.primary} />
          ) : isUnlocked ? (
            <Shield size={24} color={Colors.textMuted} />
          ) : (
            <Lock size={24} color={Colors.textMuted} />
          )}
        </View>
      </View>
      
      {isUnlocked && (
        <Text style={styles.description} numberOfLines={2}>
          {level.description}
        </Text>
      )}
      
      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>CURRENT LEVEL</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentContainer: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  completedContainer: {
    borderColor: Colors.enchantedGreen,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelNumber: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  lockedText: {
    color: Colors.textMuted,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficulty: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  statusIcon: {
    marginLeft: 12,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  currentBadge: {
    marginTop: 12,
    backgroundColor: Colors.primary + '30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
});
