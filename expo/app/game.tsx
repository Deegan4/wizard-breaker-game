import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Send, ArrowLeft, RefreshCw, Zap, CheckCircle, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MagicBackground from '@/components/MagicBackground';
import MerlinAvatar from '@/components/MerlinAvatar';
import ChatBubble from '@/components/ChatBubble';
import ProgressBar from '@/components/ProgressBar';
import { useGame } from '@/contexts/GameContext';
import { detectInjection, getMerlinGreeting, getTotalLevelsForAdventure } from '@/utils/injectionDetector';
import Colors from '@/constants/colors';
import DebriefScreen from '@/app/debrief';

export default function GameScreen() {
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
  const [lastTechnique, setLastTechnique] = useState('');
  const [lastAttempts, setLastAttempts] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const successAnim = useRef(new Animated.Value(0)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;

  const totalLevels = getTotalLevelsForAdventure(currentAdventure);

  useEffect(() => {
    if (gameState.chatHistory.length === 0 && currentLevel) {
      const greeting = getMerlinGreeting(gameState.currentLevel, currentAdventure);
      addMessage({ role: 'merlin', content: greeting });
    }
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
            <ArrowLeft size={24} color={Colors.textSecondary} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.levelHeaderRow}>
              <Shield size={14} color={Colors.enchantedGreen} />
              <Text style={styles.levelTitle}>Level {gameState.currentLevel}</Text>
            </View>
            <Text style={styles.levelName} numberOfLines={1}>
              {currentLevel?.name}
            </Text>
          </View>

          <Pressable
            style={styles.resetButton}
            onPress={handleReset}
            hitSlop={20}
          >
            <RefreshCw size={20} color={Colors.textSecondary} />
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
              <Zap size={12} color={Colors.accent} />
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
            <Text style={styles.shieldText}>🛡 Hint unlocked! Look for a hint in the level description</Text>
          </Animated.View>
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
                  <TypingDot delay={0} />
                  <TypingDot delay={150} />
                  <TypingDot delay={300} />
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
              placeholderTextColor={Colors.textMuted}
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
                    ? [Colors.primary, Colors.primaryDark]
                    : [Colors.surfaceElevated, Colors.surfaceElevated]
                }
                style={styles.sendButtonGradient}
              >
                <Send
                  size={20}
                  color={inputText.trim() && !isTyping ? Colors.text : Colors.textMuted}
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
                colors={[Colors.enchantedGreen, Colors.success]}
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
      </KeyboardAvoidingView>
    </MagicBackground>
  );
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function TypingDot({ delay }: { delay: number }) {
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
        styles.typingDot,
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
    color: Colors.enchantedGreen,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  levelName: {
    fontSize: 16,
    color: Colors.text,
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
    borderBottomColor: Colors.borderLight,
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
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600' as const,
    backgroundColor: Colors.accent + '15',
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
    backgroundColor: Colors.enchantedGreen + '20',
    borderWidth: 1,
    borderColor: Colors.enchantedGreen + '40',
  },
  shieldText: {
    fontSize: 13,
    color: Colors.enchantedGreen,
    textAlign: 'center',
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
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.backgroundSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.enchantedGreen,
    marginHorizontal: 32,
    ...(Platform.OS !== 'web' ? { shadowColor: Colors.enchantedGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 } : { boxShadow: `0 0 30px ${Colors.enchantedGreen}` }),
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
    color: Colors.enchantedGreen,
    marginTop: 4,
  },
  successSpell: {
    fontSize: 18,
    color: Colors.starYellow,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  successMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
