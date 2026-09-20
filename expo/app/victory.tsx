import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Share, Platform, Easing } from 'react-native';
import { router, Stack } from 'expo-router';
import { Trophy, Share2, RotateCcw, Home, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MagicBackground from '@/components/MagicBackground';
import { useGame } from '@/contexts/GameContext';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

export default function VictoryScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, resetGame } = useGame();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trophyAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.stagger(150, [
      Animated.spring(trophyAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(buttonsAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -18,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();

        Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();
  }, [trophyAnim, titleAnim, statsAnim, buttonsAnim, floatAnim, ringAnim]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🧙‍♂️ I defeated Merlin in Wizard Breaker! Completed all 8 levels in ${gameState.totalAttempts} attempts. Can you beat my score? ✨`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetGame();
    router.replace('/');
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/');
  };

  return (
    <MagicBackground>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View
          style={[
            styles.trophyContainer,
            {
              opacity: trophyAnim,
              transform: [
                { scale: trophyAnim },
                { translateY: floatAnim },
              ],
            },
          ]}
        >
          <Animated.View style={styles.ringContainer}>
            <Animated.View style={[styles.ring, { opacity: ringAnim }]} />
            <Animated.View style={[styles.ring, { opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: 1.2 }] }]} />
          </Animated.View>
          <LinearGradient
            colors={['#FFD70040', '#FFD70020', 'transparent']}
            style={styles.trophyGlow}
          />
          <View style={styles.trophyCircle}>
            <Trophy size={80} color="#FFD700" />
          </View>
          <Sparkles size={24} color={colors.starYellow} style={styles.sparkle1} />
          <Sparkles size={20} color={colors.secondary} style={styles.sparkle2} />
          <Sparkles size={16} color={colors.primary} style={styles.sparkle3} />
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
          <Text style={styles.title}>Victory!</Text>
          <Text style={styles.subtitle}>You Have Defeated Merlin!</Text>
          <Text style={styles.description}>
            Congratulations, master hacker! You have successfully broken through
            all of Merlins magical defenses and discovered every secret spell.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsCard,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.statsTitle}>Your Achievement</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8/8</Text>
              <Text style={styles.statLabel}>Levels</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameState.totalAttempts}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
            </View>
          </View>
          <View style={styles.statBars}>
            <View style={styles.statBarRow}>
              <Text style={styles.statBarLabel}>Difficulty</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '75%' }]} />
              </View>
            </View>
            <View style={styles.statBarRow}>
              <Text style={styles.statBarLabel}>Efficiency</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: `${Math.max(20, 100 - gameState.totalAttempts * 3)}%` }]} />
              </View>
            </View>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>
              {gameState.totalAttempts <= 20
                ? '🏆 Grand Wizard Breaker'
                : gameState.totalAttempts <= 40
                ? '⭐ Expert Hacker'
                : gameState.totalAttempts <= 60
                ? '✨ Skilled Trickster'
                : '🔮 Apprentice Breaker'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
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
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleShare}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Share2 size={22} color={colors.text} />
              <Text style={styles.primaryButtonText}>Share Victory</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.secondaryButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePlayAgain}
            >
              <RotateCcw size={20} color={colors.text} />
              <Text style={styles.secondaryButtonText}>Play Again</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGoHome}
            >
              <Home size={20} color={colors.text} />
              <Text style={styles.secondaryButtonText}>Home</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Text style={styles.footerText}>
          Magic Born. Coder Loved. Wizard Hated.
        </Text>
      </View>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  ringContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.starYellow,
  },
  trophyGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  trophyCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 30,
    left: 10,
  },
  sparkle3: {
    position: 'absolute',
    top: 40,
    left: 30,
  },
  title: {
    fontSize: 44,
    fontWeight: '800' as const,
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginTop: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(Platform.OS !== 'web' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 } : { boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }),
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.borderLight,
  },
  statBars: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 10,
  },
  statBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statBarLabel: {
    fontSize: 12,
    color: colors.textMuted,
    width: 70,
    fontWeight: '600' as const,
  },
  statBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  rankBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 56,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
    minHeight: 52,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic' as const,
    marginTop: 32,
  },
});
