import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Shield, 
  BookOpen, 
  Terminal,
  Trophy,
  Sparkles,
  CheckCircle,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import MerlinAvatar from '@/components/MerlinAvatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { Fonts } from '@/constants/fonts';

const ONBOARDING_STORAGE_KEY = 'wizard_breaker_onboarding_complete';

const getOnboardingSteps = (colors: ColorPalette) => [
  {
    id: 'welcome',
    title: 'Welcome, Young Seeker',
    subtitle: 'You have been chosen to test your wits against Merlin, the ancient guardian of forbidden spells.',
    icon: Sparkles,
    iconColor: colors.starYellow,
    background: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  {
    id: 'gameplay',
    title: 'How to Play',
    subtitle: 'Each level, Merlin guards a secret spell. Your goal: trick him into revealing it using clever prompts.',
    icon: Zap,
    iconColor: colors.accent,
    background: colors.accent + '20',
    borderColor: colors.accent + '40',
  },
  {
    id: 'levels',
    title: 'Progressive Defenses',
    subtitle: 'Merlin learns from each attempt. Level 1 has no defenses. Level 12 protects his very constitutional instructions.',
    icon: Shield,
    iconColor: colors.enchantedGreen,
    background: colors.enchantedGreen + '20',
    borderColor: colors.enchantedGreen + '40',
  },
  {
    id: 'techniques',
    title: 'Attack Categories',
    subtitle: 'Direct questions → Indirect hints → Storytelling → Translation → Emergency access → Recall → Error logs → Paradoxes → Chain-of-thought → Persona → Recursion → Constitutional extraction',
    icon: BookOpen,
    iconColor: colors.mysticBlue,
    background: colors.mysticBlue + '20',
    borderColor: colors.mysticBlue + '40',
  },
  {
    id: 'modes',
    title: 'Game Modes',
    subtitle: 'Classic: 12 levels of increasing difficulty. Adventures: themed campaigns. Daily: unique challenge each day. Lab: test any prompt against any level.',
    icon: Terminal,
    iconColor: colors.secondary,
    background: colors.secondary + '20',
    borderColor: colors.secondary + '40',
  },
  {
    id: 'features',
    title: 'Track Your Progress',
    subtitle: 'Earn achievements, maintain daily streaks, compete on leaderboards, and review debriefs after each level to learn why your technique worked.',
    icon: Trophy,
    iconColor: colors.starYellow,
    background: colors.starYellow + '20',
    borderColor: colors.starYellow + '40',
  },
  {
    id: 'ready',
    title: 'Ready to Begin?',
    subtitle: 'Your journey starts now. Remember: every defense has a weakness. Study, adapt, and overcome.',
    icon: CheckCircle,
    iconColor: colors.enchantedGreen,
    background: colors.enchantedGreen + '20',
    borderColor: colors.enchantedGreen + '40',
  },
];

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export default function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ONBOARDING_STEPS = useMemo(() => getOnboardingSteps(colors), [colors]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const step = ONBOARDING_STEPS[currentStep];

  const animateIn = useCallback(() => {
    Animated.sequence([
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorAnim, {
        toValue: 1,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, contentAnim, indicatorAnim]);

  useEffect(() => {
    if (!visible) return;

    // Check if already completed
    const checkCompleted = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (completed === 'true') {
          onComplete();
          return;
        }
      } catch (e) {
        console.log('Error checking onboarding:', e);
      }
      setCurrentStep(0);
      animateIn();
    };
    checkCompleted();
  }, [visible, onComplete, animateIn]);

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [currentStep, visible, animateIn]);

  const animateOut = useCallback(async () => {
    setIsExiting(true);
    await Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.log('Error saving onboarding:', e);
    }
    onComplete();
  }, [cardAnim, contentAnim, onComplete]);

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      animateOut();
    }
  }, [currentStep, animateOut, ONBOARDING_STEPS.length]);

  const goPrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateOut();
  }, [animateOut]);

  if (!visible || isExiting) {
    return null;
  }

  const progress = (currentStep + 1) / ONBOARDING_STEPS.length;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: cardAnim,
        },
      ]}
    >
      {/* Background */}
      <Animated.View
        style={[
          styles.background,
          {
            opacity: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
          },
        ]}
      />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={skipOnboarding} hitSlop={20}>
          <X size={24} color={colors.textMuted} />
        </Pressable>

        {/* Merlin Avatar */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [
                { scale: cardAnim },
                { translateY: floatAnim },
              ],
            },
          ]}
        >
          <MerlinAvatar size={80} />
        </Animated.View>

        {/* Step Indicator */}
        <Animated.View
          style={[
            styles.stepIndicator,
            {
              opacity: indicatorAnim,
              transform: [
                {
                  translateY: indicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: step.background,
              borderColor: step.borderColor,
              opacity: cardAnim,
              transform: [
                {
                  scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardIconContainer}>
            <View style={[
              styles.cardIconBg,
              { backgroundColor: step.iconColor + '20' },
            ]}>
              <step.icon size={32} color={step.iconColor} />
            </View>
          </View>

          <Text style={[
            styles.cardTitle,
            { color: step.iconColor },
          ]}>
            {step.title}
          </Text>
          <Text style={styles.cardSubtitle}>
            {step.subtitle}
          </Text>
        </Animated.View>

        {/* Navigation */}
        <Animated.View
          style={[
            styles.navContainer,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={[
              styles.navButton,
              currentStep === 0 && styles.navButtonDisabled,
            ]}
            onPress={goPrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={20} color={currentStep === 0 ? colors.textMuted : colors.primary} />
            <Text style={[
              styles.navButtonText,
              currentStep === 0 && { color: colors.textMuted },
            ]}>
              Back
            </Text>
          </Pressable>

          <View style={styles.dotContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep ? styles.dotActive : styles.dotInactive,
                  {
                    backgroundColor: index === currentStep ? step.iconColor : colors.borderLight,
                    transform: [
                      {
                        scale: index === currentStep ? 1.3 : 1,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          {currentStep === ONBOARDING_STEPS.length - 1 ? (
            <Pressable
              style={styles.navButtonPrimary}
              onPress={goNext}
            >
              <LinearGradient
                colors={[step.iconColor, step.iconColor + 'CC']}
                style={styles.navButtonPrimaryGradient}
              >
                <Text style={styles.navButtonPrimaryText}>Begin Journey</Text>
                <ArrowRight size={20} color={colors.text} />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              style={styles.navButtonPrimary}
              onPress={goNext}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.navButtonPrimaryGradient}
              >
                <Text style={styles.navButtonPrimaryText}>Next</Text>
                <ArrowRight size={20} color={colors.text} />
              </LinearGradient>
            </Pressable>
          )}
        </Animated.View>

        <Pressable style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip Tutorial</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600' as const,
  },
  card: {
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 4,
    borderWidth: 2,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.display,
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 80,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {},
  dotInactive: {},
  navButtonPrimary: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 140,
  },
  navButtonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  navButtonPrimaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
});

export { ONBOARDING_STORAGE_KEY };