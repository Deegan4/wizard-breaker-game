import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Wand2,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Star,
  Flame,
  Trophy,
  GraduationCap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import ProgressBar from '@/components/ProgressBar';
import StatRow from '@/components/StatRow';
import { useGame } from '@/contexts/GameContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { useLessons } from '@/contexts/LessonContext';
import { LEARNING_MODULES } from '@/constants/lessons';
import { DAILY_CHALLENGE_XP_REWARD } from '@/constants/xp';
import { LEVELS } from '@/constants/levels';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { gameState, setUsername, markIntroSeen, setAdventure, startLevel } = useGame();
  const { dailyChallenge, checkDailyChallenge, stats } = useAchievements();
  const { getModuleProgress } = useLessons();
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkDailyChallenge();
  }, [checkDailyChallenge]);

  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, reduceMotion]);

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAdventure('classic');
    if (!gameState.username) {
      setShowUsernameInput(true);
    } else {
      router.push('/game');
    }
  };

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      markIntroSeen();
      setAdventure('classic');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/game');
    }
  };

  const handleSkipUsername = () => {
    setUsername(`Wizard${Math.floor(Math.random() * 9999)}`);
    markIntroSeen();
    setAdventure('classic');
    router.push('/game');
  };

  const handleStartDaily = () => {
    if (!dailyChallenge || dailyChallenge.completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startLevel('classic', dailyChallenge.level);
    router.push('/game');
  };

  const currentLevel = LEVELS[gameState.currentLevel - 1];
  const challengeLevel = dailyChallenge ? LEVELS[dailyChallenge.level - 1] : undefined;
  const moduleProgress = getModuleProgress(LEARNING_MODULES[0]?.id ?? '');

  return (
    <MagicBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 110 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {showUsernameInput ? (
            <View style={styles.usernameContainer}>
              <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                <MerlinAvatar size={100} />
              </Animated.View>

              <Text style={styles.usernameTitle}>Enter Your Name</Text>
              <Text style={styles.usernameSubtitle}>
                How shall Merlin address you, young seeker?
              </Text>

              <TextInput
                style={styles.usernameInput}
                value={tempUsername}
                onChangeText={setTempUsername}
                placeholder="Your wizard name..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                autoCapitalize="words"
                maxLength={20}
              />

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                  !tempUsername.trim() && styles.buttonDisabled,
                ]}
                onPress={handleUsernameSubmit}
                disabled={!tempUsername.trim()}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.submitButtonText}>Begin Journey</Text>
                  <Wand2 size={20} color={colors.textOnPrimary} />
                </LinearGradient>
              </Pressable>

              <Pressable accessibilityRole="button" onPress={handleSkipUsername} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScreenHeader
                title="Wizard Breaker"
                subtitle={gameState.username ? `Welcome back, ${gameState.username}` : 'Ready for a challenge?'}
              />

              {currentLevel && (
                <View style={styles.nextQuestCard}>
                  <View style={styles.pillLabel}>
                    <BookOpen size={12} color={colors.primary} />
                    <Text style={styles.pillLabelText}>Your next quest</Text>
                  </View>
                  <Text style={styles.nextQuestTitle}>{currentLevel.name}</Text>
                  <Text style={styles.nextQuestDescription} numberOfLines={2}>
                    {currentLevel.description}
                  </Text>
                  <Text style={styles.nextQuestMeta}>
                    Level {gameState.currentLevel} · {gameState.levelsCompleted} of {LEVELS.length}
                  </Text>
                  <View style={styles.nextQuestProgress}>
                    <ProgressBar
                      current={gameState.levelsCompleted}
                      total={LEVELS.length}
                      showLabel={false}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
                    onPress={handlePlayPress}
                  >
                    <Text style={styles.continueButtonText}>
                      {gameState.levelsCompleted === 0 ? 'Start quest' : 'Continue quest'}
                    </Text>
                    <ArrowRight size={18} color={colors.textOnPrimary} />
                  </Pressable>
                </View>
              )}

              {dailyChallenge && challengeLevel && (
                <View style={styles.dailyCard}>
                  <View style={styles.dailyCardHeader}>
                    <View style={styles.pillLabelSecondary}>
                      <Star size={12} color={colors.starYellow} />
                      <Text style={styles.pillLabelSecondaryText}>Daily challenge</Text>
                    </View>
                    {!dailyChallenge.completed && (
                      <View style={styles.xpBadge}>
                        <Text style={styles.xpBadgeText}>+{DAILY_CHALLENGE_XP_REWARD} XP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dailyCardTitle}>{challengeLevel.name}</Text>
                  <View style={styles.dailyCardFooter}>
                    <Text style={styles.dailyCardDescription} numberOfLines={3}>
                      {challengeLevel.description}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.dailyButton,
                        dailyChallenge.completed && styles.dailyButtonDisabled,
                        pressed && !dailyChallenge.completed && styles.buttonPressed,
                      ]}
                      onPress={handleStartDaily}
                      disabled={dailyChallenge.completed}
                    >
                      <Text style={styles.dailyButtonText}>
                        {dailyChallenge.completed ? 'Completed' : 'Start challenge'}
                      </Text>
                      {!dailyChallenge.completed && <ArrowRight size={14} color={colors.primary} />}
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={styles.progressSectionHeader}>
                <Text style={styles.progressSectionLabel}>Your progress</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.viewDetailsButton} hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
                  onPress={() => router.push('/leaderboard')}
                >
                  <Text style={styles.viewDetailsText}>View details</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              </View>

              <StatRow
                items={[
                  {
                    Icon: BookOpen,
                    value: `${moduleProgress.completed}/${moduleProgress.total}`,
                    label: 'Lessons',
                    tint: colors.primary,
                  },
                  { Icon: Star, value: gameState.xpTotal, label: 'XP', tint: colors.starYellow },
                  { Icon: Flame, value: stats.dailyStreak, label: 'day streak', tint: colors.accent },
                ]}
              />

              <Text style={styles.exploreLabel}>Explore</Text>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.exploreRow, pressed && { opacity: 0.85 }]}
                onPress={() => router.push('/learn')}
              >
                <View style={styles.exploreIconCircle}>
                  <GraduationCap size={18} color={colors.primary} />
                </View>
                <View style={styles.exploreText}>
                  <Text style={styles.exploreTitle}>Learn the basics</Text>
                  <Text style={styles.exploreSubtitle}>Build your skills in prompt security.</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.exploreRow, pressed && { opacity: 0.85 }]}
                onPress={() => router.push('/leaderboard')}
              >
                <View style={styles.exploreIconCircle}>
                  <Trophy size={18} color={colors.starYellow} />
                </View>
                <View style={styles.exploreText}>
                  <Text style={styles.exploreTitle}>Leaderboard</Text>
                  <Text style={styles.exploreSubtitle}>See how you rank against other learners.</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  pillLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  pillLabelText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  nextQuestCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  nextQuestTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 6,
  },
  nextQuestDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  nextQuestMeta: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginBottom: 8,
  },
  nextQuestProgress: {
    marginBottom: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textOnPrimary,
  },
  dailyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  dailyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pillLabelSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.starYellow + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pillLabelSecondaryText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.starYellow,
  },
  xpBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  dailyCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 10,
  },
  dailyCardFooter: {
    gap: 14,
  },
  dailyCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  dailyButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dailyButtonDisabled: {
    opacity: 0.5,
  },
  dailyButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  progressSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressSectionLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  exploreLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  exploreIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreText: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  exploreSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  usernameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  usernameTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 24,
    textAlign: 'center',
  },
  usernameSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
  },
  usernameInput: {
    width: width - 80,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    textAlign: 'center',
  },
  submitButton: {
    width: width - 80,
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
