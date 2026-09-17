import React, { useState, useEffect, useRef } from 'react';
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
import { Wand2, Play, Trophy, Sparkles, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProgressBar from '@/components/ProgressBar';
import { useGame } from '@/contexts/GameContext';
import Colors from '@/constants/colors';
import { LEVELS } from '@/constants/levels';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, setUsername, markIntroSeen, setAdventure } = useGame();
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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
  }, [avatarAnim, titleAnim, subtitleAnim, buttonAnim, floatAnim]);

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
                placeholderTextColor={Colors.textMuted}
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
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.submitButtonText}>Begin Journey</Text>
                  <Wand2 size={20} color={Colors.text} />
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
                  <Sparkles size={16} color={Colors.starYellow} />
                  <Text style={styles.subtitle}>Test Your AI Hacking Skills</Text>
                  <Sparkles size={16} color={Colors.starYellow} />
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statsCard,
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
                <Pressable
                  style={({ pressed }) => [
                    styles.playButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handlePlayPress}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.playButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Play size={28} color={Colors.text} fill={Colors.text} />
                    <Text style={styles.playButtonText}>
                      {gameState.levelsCompleted === 0 ? 'Start Game' : 'Continue'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push('/leaderboard')}
                >
                  <Trophy size={20} color={Colors.starYellow} />
                  <Text style={styles.secondaryButtonText}>Leaderboard</Text>
                  <ChevronRight size={16} color={Colors.textMuted} />
                </Pressable>
              </Animated.View>

              <View style={styles.infoSection}>
                <Pressable
                  style={styles.infoCard}
                  onPress={() => router.push('/learn')}
                >
                  <View style={styles.infoIcon}>
                    <Text style={styles.infoEmoji}>🔮</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>What is Prompt Injection?</Text>
                    <Text style={styles.infoText}>
                      Learn about AI security vulnerabilities
                    </Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Magic Born. Coder Loved. Wizard Hated.
                </Text>
                <Text style={styles.disclaimer}>
                  For educational purposes only. Learn AI security responsibly.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </MagicBackground>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -1,
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
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  progressSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  currentLevelCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  levelDifficulty: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  levelName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  levelDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  defenseInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  defenseLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  defenseText: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  playButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  playButtonText: {
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  infoText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
  disclaimer: {
    color: Colors.textMuted,
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
    color: Colors.text,
    marginTop: 24,
    textAlign: 'center',
  },
  usernameSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 32,
  },
  usernameInput: {
    width: width - 80,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
