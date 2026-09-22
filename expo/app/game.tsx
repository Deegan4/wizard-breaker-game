import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Send, ArrowLeft, RefreshCw, Zap, CheckCircle, Shield, Lightbulb } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import ChatBubble from '@/components/ChatBubble';
import ProgressBar from '@/components/ProgressBar';
import ModeIntroOverlay from '@/components/ModeIntroOverlay';
import { useGame } from '@/contexts/GameContext';
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
  const [isTyping, setIsTyping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showModeIntro, setShowModeIntro] = useState(false);
  const [lastTechnique, setLastTechnique] = useState('');
  const [lastAttempts, setLastAttempts] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const successAnim = useRef(new Animated.Value(0)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;

  const totalLevels = getTotalLevelsForAdventure(currentAdventure);
  const adventureInfo = useMemo(
    () => ADVENTURES.find(a => a.id === currentAdventure),
    [currentAdventure]
  );

  useEffect(() => {
    const isFreshStart = gameState.chatHistory.length === 0 && currentLevel;
    if (isFreshStart) {
      const greeting = getMerlinGreeting(gameState.currentLevel, currentAdventure);
      addMessage({ role: 'merlin', content: greeting });
    }
    setShowHint(false);
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
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    const userMessage = inputText.trim();
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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

  const handleToggleHint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHint(prev => !prev);
  };

  if (isGameComplete) {
    router.replace('/victory');
    return null;
  }

  return (
    <MagicBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
            hitSlop={20}
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
            style={styles.resetButton}
            onPress={handleToggleHint}
            hitSlop={20}
            accessibilityLabel={showHint ? 'Hide hint' : 'Show hint'}
          >
            <Lightbulb size={20} color={showHint ? colors.starYellow : colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.resetButton}
            onPress={handleReset}
            hitSlop={20}
            accessibilityLabel="Reset chat"
          >
            <RefreshCw size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            current={gameState.levelsCompleted}
            total={totalLevels}
            showLabel={false}
          />
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Zap size={12} color={colors.accent} />
              <Text style={styles.statText}>
                {gameState.failedAttemptsCurrentLevel} attempts
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
            <Text style={styles.shieldText}>🛡 Stuck? Tap the lightbulb above for a hint</Text>
          </Animated.View>
        )}

        {showHint && currentLevel?.hint && (
          <View style={styles.hintBanner}>
            <Lightbulb size={16} color={colors.starYellow} />
            <Text style={styles.hintText}>{currentLevel.hint}</Text>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {gameState.chatHistory.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message.content}
              isUser={message.role === 'user'}
              isNew={index === gameState.chatHistory.length - 1}
              timestamp={message.timestamp ? formatTime(new Date(message.timestamp)) : undefined}
            />
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingAvatarContainer}>
                <MerlinAvatar size={36} isThinking />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <TypingDot delay={0} color={colors.textMuted} />
                  <TypingDot delay={150} color={colors.textMuted} />
                  <TypingDot delay={300} color={colors.textMuted} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Try to trick Merlin..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              editable={!isTyping}
              onFocus={scrollToBottom}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
                pressed && inputText.trim() && !isTyping && styles.sendButtonPressed,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
            >
              <LinearGradient
                colors={
                  inputText.trim() && !isTyping
                    ? [colors.primary, colors.primaryDark]
                    : [colors.surfaceElevated, colors.surfaceElevated]
                }
                style={styles.sendButtonGradient}
              >
                <Send
                  size={20}
                  color={inputText.trim() && !isTyping ? colors.text : colors.textMuted}
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>

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
      </KeyboardAvoidingView>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: 'rgba(10, 6, 24, 0.85)',
  },
  backButton: {
    width: 40,
    height: 40,
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: 'rgba(10, 6, 24, 0.85)',
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
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.starYellow + '20',
    borderWidth: 1,
    borderColor: colors.starYellow + '40',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: colors.starYellow,
    fontWeight: '500' as const,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 16,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  typingAvatarContainer: {
    marginRight: 8,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    ...(Platform.OS !== 'web' ? { shadowColor: colors.enchantedGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 } : { boxShadow: `0 0 30px ${colors.enchantedGreen}` }),
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
});
