import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Trophy, 
  Flame, 
  Sparkles, 
  Target,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import { useGame } from '@/contexts/GameContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { LEVELS } from '@/constants/levels';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

export default function DailyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { gameState, setAdventure } = useGame();
  const { dailyChallenge, checkDailyChallenge, stats, achievements } = useAchievements();
  
  const [isLoading, setIsLoading] = useState(true);
  const [animValues, setAnimValues] = useState({
    header: 0,
    card: 0,
    stats: 0,
    rewards: 0,
    button: 0,
  });

  useEffect(() => {
    checkDailyChallenge();
    setIsLoading(false);
    
    // Staggered animations
    const animations = [
      { key: 'header', delay: 100 },
      { key: 'card', delay: 250 },
      { key: 'stats', delay: 400 },
      { key: 'rewards', delay: 550 },
      { key: 'button', delay: 700 },
    ];
    
    animations.forEach(({ key, delay }) => {
      setTimeout(() => {
        setAnimValues(prev => ({ ...prev, [key]: 1 }));
      }, delay);
    });
  }, [checkDailyChallenge]);

  const handlePlayDaily = () => {
    if (!dailyChallenge) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAdventure('classic');
    // Navigate to game with the daily challenge level
    // The game will use the current level from gameState
  };

  const handleViewAchievements = () => {
    Alert.alert('Achievements', 'Coming soon! Tap the achievements tab to see your progress.');
  };

  if (isLoading) {
    return (
      <MagicBackground>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.loadingContainer}>
            <MerlinAvatar size={60} />
            <Text style={styles.loadingText}>Preparing today&apos;s challenge...</Text>
          </View>
        </View>
      </MagicBackground>
    );
  }

  if (!dailyChallenge) {
    return (
      <MagicBackground>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>Unable to load daily challenge</Text>
        </View>
      </MagicBackground>
    );
  }

  const challengeLevel = LEVELS[dailyChallenge.level - 1];
  const isCompleted = dailyChallenge.completed;
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalAchievements = achievements.length;

  return (
    <MagicBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: animValues.header,
              transform: [{ translateY: (1 - animValues.header) * 30 }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.dateBadge}>
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.dateText}>
                {new Date(dailyChallenge.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={16} color={colors.accent} />
              <Text style={styles.streakText}>{stats.dailyStreak} Day Streak</Text>
            </View>
          </View>
          <Text style={styles.dailyTitle}>Daily Challenge</Text>
          <Text style={styles.dailySubtitle}>
            {isCompleted ? 'Completed! Return tomorrow for a new challenge.' : 'Test your skills against a unique daily level'}
          </Text>
        </Animated.View>

        {/* Main Challenge Card */}
        <Animated.View
          style={[
            styles.challengeCard,
            {
              opacity: animValues.card,
              transform: [{ translateY: (1 - animValues.card) * 30 }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level {dailyChallenge.level}</Text>
            </View>
            <Text style={styles.difficultyBadge}>{challengeLevel?.difficulty}</Text>
          </View>
          <Text style={styles.challengeName}>{challengeLevel?.name}</Text>
          <Text style={styles.challengeDescription}>{challengeLevel?.description}</Text>
          
          <View style={styles.defenseInfo}>
            <Text style={styles.defenseLabel}>Defense: </Text>
            <Text style={styles.defenseText}>{challengeLevel?.defenseDescription}</Text>
          </View>

          {isCompleted && (
            <View style={styles.completedBanner}>
              <Sparkles size={20} color={colors.enchantedGreen} />
              <Text style={styles.completedText}>Challenge Completed!</Text>
              <Text style={styles.completedSubtext}>
                {dailyChallenge.attempts} attempt{dailyChallenge.attempts !== 1 ? 's' : ''} • {dailyChallenge.completedAt ? new Date(dailyChallenge.completedAt).toLocaleTimeString() : ''}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: animValues.stats,
              transform: [{ translateY: (1 - animValues.stats) * 20 }],
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challengeLevel?.spell}</Text>
            <Text style={styles.statLabel}>Today&apos;s Spell</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}/{totalAchievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.dailyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Animated.View>

        {/* Rewards Preview */}
        <Animated.View
          style={[
            styles.rewardsCard,
            {
              opacity: animValues.rewards,
              transform: [{ translateY: (1 - animValues.rewards) * 20 }],
            },
          ]}
        >
          <Text style={styles.rewardsTitle}>Potential Rewards</Text>
          <View style={styles.rewardsList}>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Star size={20} color={colors.starYellow} fill={colors.starYellow} />
              </View>
              <Text style={styles.rewardText}>Discover Spell: <Text style={styles.rewardHighlight}>{challengeLevel?.spell}</Text></Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Flame size={20} color={colors.accent} />
              </View>
              <Text style={styles.rewardText}>Extend Streak to <Text style={styles.rewardHighlight}>{stats.dailyStreak + 1}</Text> Days</Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Trophy size={20} color={colors.primary} />
              </View>
              <Text style={styles.rewardText}>Progress toward <Text style={styles.rewardHighlight}>{totalAchievements - unlockedCount} Remaining</Text> Achievements</Text>
            </View>
          </View>
        </Animated.View>

        {/* Play Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: animValues.button,
              transform: [{ translateY: (1 - animValues.button) * 30 }],
            },
          ]}
        >
          {!isCompleted ? (
            <Pressable
              style={({ pressed }) => [
                styles.playButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePlayDaily}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Target size={24} color={colors.text} />
                <Text style={styles.playButtonText}>Start Daily Challenge</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.playButtonCompleted,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => Alert.alert('Come Back Tomorrow', 'A new daily challenge awaits!')}
            >
              <LinearGradient
                colors={[colors.enchantedGreen, '#16A34A']}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={24} color={colors.text} />
                <Text style={styles.playButtonText}>Completed! Come Back Tomorrow</Text>
              </LinearGradient>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleViewAchievements}
          >
            <Trophy size={20} color={colors.starYellow} />
            <Text style={styles.secondaryButtonText}>View Achievements</Text>
          </Pressable>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.quickStatsTitle}>Your Progress</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{stats.sessionsCount}</Text>
              <Text style={styles.quickStatLabel}>Sessions</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{Math.floor(stats.totalPlayTime / 60000)}m</Text>
              <Text style={styles.quickStatLabel}>Play Time</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{gameState.levelsCompleted}/12</Text>
              <Text style={styles.quickStatLabel}>Levels Done</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{unlockedCount}</Text>
              <Text style={styles.quickStatLabel}>Unlocked</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  streakText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  dailyTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1,
  },
  dailySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  levelBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  difficultyBadge: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700' as const,
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  challengeDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  defenseInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  defenseLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  defenseText: {
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.enchantedGreen + '20',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.enchantedGreen + '40',
  },
  completedText: {
    color: colors.enchantedGreen,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  completedSubtext: {
    color: colors.enchantedGreen,
    fontSize: 12,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  rewardsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  rewardsList: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rewardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  rewardHighlight: {
    color: colors.primary,
    fontWeight: '700' as const,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButtonCompleted: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  quickStats: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  quickStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});