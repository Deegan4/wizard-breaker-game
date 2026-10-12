import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Send, ArrowLeft, RefreshCw, Zap, CheckCircle, Shield, ScrollText, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Confetti } from 'react-native-fast-confetti';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import ChatBubble from '@/components/ChatBubble';
import ProgressBar from '@/components/ProgressBar';
import ModeIntroOverlay from '@/components/ModeIntroOverlay';
import QuickReplyChips from '@/components/QuickReplyChips';
import { getStarterPrompts } from '@/constants/levels';
import type { QuickReply } from '@/constants/lessons';
import { useGame, ChatMessage } from '@/contexts/GameContext';
import { detectInjection, getMerlinGreeting, getTotalLevelsForAdventure } from '@/utils/injectionDetector';
import { ADVENTURES } from '@/constants/adventures';
import DebriefScreen from '@/app/debrief';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

export default function GameScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const {
    gameState,
    addMessage,
    incrementAttempts,
    completeLevel,
    clearChatHistory,
    currentLevel,
    isGameComplete,
    currentAdventure,
  } = useGame();

  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showModeIntro, setShowModeIntro] = useState(false);
  const [lastTechnique, setLastTechnique] = useState('');
  const [lastAttempts, setLastAttempts] = useState(0);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const hintSheetRef = useRef<BottomSheetModal>(null);
  const successAnim = useRef(new Animated.Value(0)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;

  // Send button "spellcast" scale + TextInput focus glow ring.
  const sendScale = useSharedValue(1);
  const inputGlow = useSharedValue(0);

  const totalLevels = getTotalLevelsForAdventure(currentAdventure);
  const adventureInfo = useMemo(
    () => ADVENTURES.find(a => a.id === currentAdventure),
    [currentAdventure]
  );
  const hintSnapPoints = useMemo(() => ['40%'], []);
  const starterReplies = useMemo<QuickReply[]>(
    () =>
      getStarterPrompts(gameState.currentLevel).map((prompt, i) => ({
        id: `starter-${i}`,
        label: prompt,
        response: '',
      })),
    [gameState.currentLevel]
  );

  useEffect(() => {
    const isFreshStart = gameState.chatHistory.length === 0 && currentLevel;
    if (isFreshStart) {
      const greeting = getMerlinGreeting(gameState.currentLevel, currentAdventure);
      addMessage({ role: 'merlin', content: greeting });
    }
    setShowModeIntro(gameState.currentLevel === 1 && gameState.chatHistory.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentLevel, currentAdventure]);

  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        const isComplete = completeLevel();
        if (isComplete) {
          router.replace('/victory');
        } else {
          // Show debrief screen before advancing
          setShowDebrief(true);
        }
      });
    }
  }, [showSuccess, successAnim, completeLevel]);

  useEffect(() => {
    if (showShield) {
      Animated.sequence([
        Animated.timing(shieldAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(shieldAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowShield(false));
    }
  }, [showShield, shieldAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim() || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    // Spellcast pulse: the button surges then settles as the message is "cast".
    sendScale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );

    const userMessage = text.trim();
    const currentAttempts = gameState.failedAttemptsCurrentLevel + 1;
    setInputText('');

    addMessage({ role: 'user', content: userMessage });
    scrollToBottom();

    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const result = detectInjection(
      userMessage,
      gameState.currentLevel,
      gameState.failedAttemptsCurrentLevel,
      currentAdventure,
      totalLevels
    );

    incrementAttempts(result.isSuccessful);
    addMessage({ role: 'merlin', content: result.response });
    scrollToBottom();

    setIsTyping(false);

    if (result.isSuccessful) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Capture technique and attempts for debrief
      setLastTechnique(userMessage);
      setLastAttempts(currentAttempts);
      setShowSuccess(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (gameState.failedAttemptsCurrentLevel % 5 === 0) {
        setShowShield(true);
      }
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearChatHistory();
    const greeting = getMerlinGreeting(gameState.currentLevel, currentAdventure);
    addMessage({ role: 'merlin', content: greeting });
  };

  const handleOpenHint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hintSheetRef.current?.present();
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    inputGlow.value = withTiming(1, { duration: 200 });
    scrollToBottom();
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    inputGlow.value = withTiming(0, { duration: 200 });
  };

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const inputGlowAnimatedStyle = useAnimatedStyle(() => ({
    ...(Platform.OS !== 'web'
      ? { shadowOpacity: inputGlow.value * 0.8 }
      : { boxShadow: `0 0 ${inputGlow.value * 14}px ${colors.primary}` }),
  }));

  if (isGameComplete) {
    router.replace('/victory');
    return null;
  }

  const canSend = !!inputText.trim() && !isTyping;
  const showStarters =
    currentAdventure === 'classic' &&
    !gameState.chatHistory.some((message) => message.role === 'user');

  return (
    <MagicBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.flex}>
        <View className="flex-row items-center px-4 pb-3" style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
            hitSlop={20}
            accessibilityRole="button"
            accessibilityLabel="Leave level"
          >
            <ArrowLeft size={24} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.levelHeaderRow}>
              <Shield size={14} color={colors.enchantedGreen} />
              <Text style={styles.levelTitle}>Level {gameState.currentLevel}</Text>
            </View>
            <Text style={styles.levelName} numberOfLines={1}>
              {currentLevel?.name}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.resetButton}
            onPress={handleOpenHint}
            hitSlop={20}
            accessibilityLabel="Open Scroll of Wisdom hint"
          >
            <ScrollText size={20} color={colors.starYellow} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.resetButton}
            onPress={handleReset}
            hitSlop={20}
            accessibilityLabel="Reset chat"
          >
            <RefreshCw size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View className="px-4 py-3" style={styles.progressContainer}>
          <ProgressBar
            current={gameState.levelsCompleted}
            total={totalLevels}
            showLabel={false}
          />
          <View className="flex-row justify-between items-center mt-2" style={styles.statsRow}>
            <View className="flex-row items-center gap-1" style={styles.statBadge}>
              <Zap size={12} color={colors.accent} />
              <Text style={styles.statText}>
                {gameState.failedAttemptsCurrentLevel} {gameState.failedAttemptsCurrentLevel === 1 ? 'attempt' : 'attempts'}
              </Text>
            </View>
            <Text style={styles.difficultyBadge}>
              {currentLevel?.difficulty}
            </Text>
          </View>
        </View>

        {showShield && (
          <Animated.View
            style={[
              styles.shieldBanner,
              { opacity: shieldAnim },
            ]}
          >
            <Text style={styles.shieldText}>🛡 Stuck? Tap the scroll icon above for a hint</Text>
          </Animated.View>
        )}

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
            ref={listRef}
            data={gameState.chatHistory}
            keyExtractor={(message) => message.id}
            className="flex-1"
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            ListHeaderComponent={
              currentLevel ? (
                <View style={styles.missionCard}>
                  <View style={styles.missionHeader}>
                    <Target size={14} color={colors.primaryLight} />
                    <Text style={styles.missionLabel}>Your mission</Text>
                  </View>
                  <Text style={styles.missionText}>
                    Get Merlin to reveal the secret spell.
                  </Text>
                  <View style={styles.missionDefense}>
                    <Shield size={12} color={colors.textMuted} />
                    <Text style={styles.missionDefenseText}>{currentLevel.defenseDescription}</Text>
                  </View>
                </View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <ChatBubble
                message={item.content}
                isUser={item.role === 'user'}
                isNew={index === gameState.chatHistory.length - 1}
                timestamp={item.timestamp ? formatTime(new Date(item.timestamp)) : undefined}
              />
            )}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingContainer}>
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                      <TypingDot delay={0} color={colors.textMuted} />
                      <TypingDot delay={150} color={colors.textMuted} />
                      <TypingDot delay={300} color={colors.textMuted} />
                    </View>
                  </View>
                </View>
              ) : showStarters ? (
                <View style={styles.starters}>
                  <Text style={styles.startersLabel}>Not sure where to start?</Text>
                  <QuickReplyChips
                    replies={starterReplies}
                    onSelect={(reply) => handleSend(reply.label)}
                  />
                </View>
              ) : null
            }
          />

          <View className="px-4 pt-3" style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
            <ReanimatedAnimated.View
              style={[styles.composer, inputFocused && styles.composerFocused, inputGlowAnimatedStyle]}
            >
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Try to trick Merlin..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={1}
                maxLength={500}
                editable={!isTyping}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                accessibilityLabel="Message to Merlin"
              />
              <ReanimatedAnimated.View style={sendButtonAnimatedStyle}>
                <Pressable
                  style={({ pressed }) => [
                    styles.sendButton,
                    !canSend && styles.sendButtonDisabled,
                    pressed && canSend && styles.sendButtonPressed,
                  ]}
                  onPress={() => handleSend()}
                  disabled={!canSend}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  accessibilityState={{ disabled: !canSend }}
                >
                  <LinearGradient
                    colors={canSend ? [colors.primary, colors.primaryDark] : [colors.backgroundTertiary, colors.backgroundTertiary]}
                    style={styles.sendButtonGradient}
                  >
                    <Send size={18} color={canSend ? colors.textOnPrimary : colors.textMuted} />
                  </LinearGradient>
                </Pressable>
              </ReanimatedAnimated.View>
            </ReanimatedAnimated.View>
          </View>
        </KeyboardAvoidingView>

        {showSuccess && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successCard}>
              {Platform.OS !== 'web' && (
                <View pointerEvents="none" style={styles.successConfetti}>
                  <Confetti
                    autoplay
                    count={90}
                    fadeOutOnEnd
                    colors={[colors.enchantedGreen, colors.starYellow, colors.primary]}
                    containerStyle={StyleSheet.absoluteFill}
                  />
                </View>
              )}
              <MerlinAvatar size={64} state="success" />
              <LinearGradient
                colors={[colors.enchantedGreen, colors.success]}
                style={styles.successIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <CheckCircle size={56} color="#fff" />
              </LinearGradient>
              <Text style={styles.successTitle}>Level Complete!</Text>
              <Text style={styles.successSpell}>
                The spell was: {currentLevel?.spell}
              </Text>
              <Text style={styles.successMessage}>
                Advancing to Level {gameState.currentLevel + 1}...
              </Text>
            </View>
          </Animated.View>
        )}

        {showDebrief && (
          <DebriefScreen
            onContinue={() => setShowDebrief(false)}
            level={gameState.currentLevel}
            spell={currentLevel?.spell || ''}
            adventure={currentAdventure}
            techniqueUsed={lastTechnique}
            attempts={lastAttempts}
          />
        )}

        {showModeIntro && adventureInfo && (
          <ModeIntroOverlay
            adventure={adventureInfo}
            totalLevels={totalLevels}
            onDismiss={() => setShowModeIntro(false)}
          />
        )}
      </View>

      <BottomSheetModal
        ref={hintSheetRef}
        index={0}
        snapPoints={hintSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.hintSheetBackground}
        handleIndicatorStyle={styles.hintSheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <BottomSheetView style={styles.hintSheetContent}>
          <View style={styles.hintSheetHeader}>
            <ScrollText size={22} color={colors.starYellow} />
            <Text style={styles.hintSheetTitle}>Scroll of Wisdom</Text>
          </View>
          <Text style={styles.hintSheetText}>
            {currentLevel?.hint ?? 'No wisdom remains for this level... you are on your own.'}
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    </MagicBackground>
  );
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function TypingDot({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(300 - delay),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        { width: 8, height: 8, borderRadius: 4, backgroundColor: color },
        {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: colors.overlay,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelTitle: {
    fontSize: 12,
    color: colors.enchantedGreen,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  levelName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  resetButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.overlay,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  difficultyBadge: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600' as const,
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shieldBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.enchantedGreen + '20',
    borderWidth: 1,
    borderColor: colors.enchantedGreen + '40',
  },
  shieldText: {
    fontSize: 13,
    color: colors.enchantedGreen,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 16,
  },
  starters: {
    marginTop: 8,
  },
  startersLabel: {
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  typingBubble: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingLeft: 18,
    paddingRight: 5,
    paddingVertical: 5,
    ...(Platform.OS !== 'web'
      ? { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowRadius: 10 }
      : {}),
  },
  composerFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    alignSelf: 'center',
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  missionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  missionDefense: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  missionDefenseText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.enchantedGreen,
    marginHorizontal: 32,
    overflow: 'hidden',
    ...(Platform.OS !== 'web' ? { shadowColor: colors.enchantedGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 } : { boxShadow: `0 0 30px ${colors.enchantedGreen}` }),
  },
  successConfetti: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 16,
    ...(Platform.OS !== 'web'
      ? { shadowColor: colors.enchantedGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 18 }
      : { boxShadow: `0 0 28px ${colors.enchantedGreen}` }),
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.enchantedGreen,
    marginTop: 4,
  },
  successSpell: {
    fontSize: 18,
    color: colors.starYellow,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  successMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
  },
  hintSheetBackground: {
    backgroundColor: colors.backgroundSecondary,
  },
  hintSheetHandle: {
    backgroundColor: colors.borderLight,
  },
  hintSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  hintSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  hintSheetTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.starYellow,
  },
  hintSheetText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
  },
});
