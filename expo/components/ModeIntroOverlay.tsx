import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, Platform } from 'react-native';
import { BookOpen, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';
import { Adventure } from '@/constants/adventures';

interface ModeIntroOverlayProps {
  adventure: Adventure;
  totalLevels: number;
  onDismiss: () => void;
}

export default function ModeIntroOverlay({ adventure, totalLevels, onDismiss }: ModeIntroOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardAnim,
            transform: [
              {
                scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconRow}>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              style={styles.iconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <BookOpen size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.levelsBadge}>{totalLevels} LEVELS</Text>
          </View>

          <Text style={styles.title}>{adventure.title}</Text>
          <Text style={styles.description}>{adventure.description}</Text>

          <View style={styles.howToSection}>
            <Text style={styles.howToLabel}>How to Play</Text>
            {adventure.howTo.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
            onPress={handleDismiss}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Let&apos;s Go</Text>
              <ArrowRight size={20} color={colors.text} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(Platform.OS !== 'web'
      ? { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24 }
      : { boxShadow: `0 0 30px ${colors.primary}40` }),
  },
  cardContent: {
    padding: 24,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelsBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.accent,
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  howToSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    gap: 12,
  },
  howToLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
