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
import { Wand2, Play, Trophy, Sparkles, ChevronRight, Terminal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProgressBar from '@/components/ProgressBar';
import { useGame } from '@/contexts/GameContext';
import { Fonts } from '@/constants/fonts';
import { LEVELS } from '@/constants/levels';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { gameState, setUsername, markIntroSeen, setAdventure } = useGame();
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(avatarAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(subtitleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [avatarAnim, titleAnim, subtitleAnim, buttonAnim, floatAnim, glowAnim, cursorAnim]);

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

  const currentLevel = LEVELS[gameState.currentLevel - 1];

  return (
    <MagicBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
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
                  <Wand2 size={20} color={colors.text} />
                </LinearGradient>
              </Pressable>
              
              <Pressable onPress={handleSkipUsername} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.avatarSection,
                  {
                    opacity: avatarAnim,
                    transform: [
                      { scale: avatarAnim },
                    ],
                  },
                ]}
              >
                <AnimatedLogo size={150} />
              </Animated.View>

              <Animated.View
                style={{
                  opacity: titleAnim,
                  transform: [
                    {
                      translateY: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.title}>Wizard Breaker</Text>
                <View style={styles.subtitleContainer}>
                  <Sparkles size={16} color={colors.starYellow} />
                  <Text style={styles.subtitle}>Test Your AI Hacking Skills</Text>
                  <Sparkles size={16} color={colors.starYellow} />
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statsCardOuter,
                  {
                    opacity: subtitleAnim,
                    transform: [
                      {
                        translateY: subtitleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <BlurView intensity={40} tint="dark" style={styles.statsCard}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gameState.currentLevel}</Text>
                      <Text style={styles.statLabel}>Current Level</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gameState.levelsCompleted}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{gameState.totalAttempts}</Text>
                      <Text style={styles.statLabel}>Attempts</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <ProgressBar
                      current={gameState.levelsCompleted}
                      total={LEVELS.length}
                    />
                  </View>
                </BlurView>
              </Animated.View>

              {currentLevel && (
                <Animated.View
                  style={[
                    styles.currentLevelCard,
                    {
                      opacity: subtitleAnim,
                    },
                  ]}
                >
                  <View style={styles.levelHeader}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>Level {currentLevel.id}</Text>
                    </View>
                    <Text style={styles.levelDifficulty}>{currentLevel.difficulty}</Text>
                  </View>
                  <Text style={styles.levelName}>{currentLevel.name}</Text>
                  <Text style={styles.levelDescription}>{currentLevel.description}</Text>
                  <View style={styles.defenseInfo}>
                    <Text style={styles.defenseLabel}>Defense: </Text>
                    <Text style={styles.defenseText}>{currentLevel.defenseDescription}</Text>
                  </View>
                </Animated.View>
              )}

              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    opacity: buttonAnim,
                    transform: [
                      {
                        translateY: buttonAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.playButtonGlow,
                    {
                      shadowOpacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.35, 0.75],
                      }),
                      shadowRadius: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 22],
                      }),
                    },
                  ]}
                >
                  <Pressable
                    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                      styles.playButton,
                      pressed && styles.buttonPressed,
                      hovered && styles.playButtonHovered,
                    ]}
                    onPress={handlePlayPress}
                  >
                    <LinearGradient
                      colors={[colors.secondary, colors.primary, colors.primaryDark]}
                      style={styles.playButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Play size={28} color={colors.text} fill={colors.text} />
                      <Text style={styles.playButtonText}>
                        {gameState.levelsCompleted === 0 ? 'Start Game' : 'Continue'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push('/leaderboard')}
                >
                  <Trophy size={20} color={colors.starYellow} />
                  <Text style={styles.secondaryButtonText}>Leaderboard</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </Pressable>
              </Animated.View>

              <Pressable
                style={({ pressed }) => [
                  styles.infoCard,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => router.push('/learn')}
              >
                <View style={styles.infoTermHeader}>
                  <View style={styles.infoTermDots}>
                    <View style={[styles.infoTermDot, { backgroundColor: colors.danger }]} />
                    <View style={[styles.infoTermDot, { backgroundColor: colors.accent }]} />
                    <View style={[styles.infoTermDot, { backgroundColor: colors.enchantedGreen }]} />
                  </View>
                  <View style={styles.infoTermLabel}>
                    <Terminal size={12} color={colors.textMuted} />
                    <Text style={styles.infoTermLabelText}>tip_of_the_day.sh</Text>
                  </View>
                </View>
                <View style={styles.infoTermBody}>
                  <Text style={styles.infoTermLine}>
                    <Text style={styles.infoTermPrompt}>$ </Text>
                    <Text style={styles.infoTermCommand}>whatis </Text>
                    prompt-injection
                  </Text>
                  <Text style={styles.infoText}>
                    Learn about AI security vulnerabilities
                  </Text>
                  <View style={styles.infoTermFooter}>
                    <Text style={styles.infoTermPrompt}>$ </Text>
                    <Animated.Text style={[styles.infoTermCursor, { opacity: cursorAnim }]}>
                      █
                    </Animated.Text>
                  </View>
                </View>
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
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsCardOuter: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  statsCard: {
    backgroundColor: 'rgba(45, 31, 84, 0.45)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.25)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  progressSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  currentLevelCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  levelDifficulty: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  levelName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  levelDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  defenseInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  playButtonGlow: {
    borderRadius: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  playButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButtonHovered: {
    transform: [{ scale: 1.02 }],
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  playButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#0D0818',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.enchantedGreen + '30',
    marginTop: 20,
  },
  infoTermHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  infoTermDots: {
    flexDirection: 'row',
    gap: 6,
  },
  infoTermDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoTermLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTermLabelText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  infoTermBody: {
    padding: 14,
  },
  infoTermLine: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
  },
  infoTermPrompt: {
    color: colors.enchantedGreen,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  infoTermCommand: {
    color: colors.secondary,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  infoTermFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoTermCursor: {
    color: colors.enchantedGreen,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
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
    color: colors.text,
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
