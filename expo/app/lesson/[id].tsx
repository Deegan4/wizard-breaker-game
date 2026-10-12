import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import MagicBackground from '@/components/MagicBackground';
import ChatBubble from '@/components/ChatBubble';
import QuickReplyChips from '@/components/QuickReplyChips';
import ProgressBar from '@/components/ProgressBar';
import { useLessons } from '@/contexts/LessonContext';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import {
  getLessonById,
  GENERIC_NUDGE_RESPONSES,
  type LessonPhase,
  type QuickReply,
} from '@/constants/lessons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  example?: string;
  turnPrompt?: string;
}

const PHASE_LABELS: Record<LessonPhase, string> = {
  learn: 'Learn',
  practice: 'Practice',
  staySafe: 'Stay safe',
};

const HELP_REPLY_IDS = new Set(['hint', 'another-example', 'red-flags']);
const REPLY_DELAY_MS = 450;

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLessonById(id ?? '');
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { progress, completeStep, completeLesson } = useLessons();

  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nudgeCount = useRef(0);
  const wasAlreadyCompleted = useRef(progress[id ?? '']?.completed ?? false);

  const after = useCallback((fn: () => void) => {
    timers.current.push(setTimeout(fn, REPLY_DELAY_MS));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const pushWizardStep = useCallback((index: number) => {
    const step = lesson?.steps[index];
    if (!lesson || !step) return;
    setMessages(prev => [
      ...prev,
      {
        id: `${lesson.id}-${step.id}`,
        text: step.wizardText,
        isUser: false,
        example: step.example?.text,
        turnPrompt: step.turnPrompt,
      },
    ]);
  }, [lesson]);

  useEffect(() => {
    pushWizardStep(0);
  }, [pushWizardStep]);

  const step = lesson?.steps[stepIndex];

  const handleReply = (reply: QuickReply) => {
    if (!lesson || !step || busy || finished) return;
    const key = `${messages.length}`;
    setBusy(true);
    setMessages(prev => [...prev, { id: `u-${key}`, text: reply.label, isUser: true }]);

    after(() => {
      setMessages(prev => [...prev, { id: `w-${key}`, text: reply.response, isUser: false }]);

      if (HELP_REPLY_IDS.has(reply.id)) {
        setBusy(false);
        return;
      }

      completeStep(lesson.id, step.id);
      const nextIndex = stepIndex + 1;
      if (nextIndex >= lesson.steps.length) {
        completeLesson(lesson.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFinished(true);
        setBusy(false);
        return;
      }
      after(() => {
        setStepIndex(nextIndex);
        pushWizardStep(nextIndex);
        setBusy(false);
      });
    });
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || busy || finished) return;
    const key = `${messages.length}`;
    const nudge = GENERIC_NUDGE_RESPONSES[nudgeCount.current % GENERIC_NUDGE_RESPONSES.length];
    nudgeCount.current += 1;
    setDraft('');
    setBusy(true);
    setMessages(prev => [...prev, { id: `u-${key}`, text, isUser: true }]);
    after(() => {
      setMessages(prev => [...prev, { id: `w-${key}`, text: nudge, isUser: false }]);
      setBusy(false);
    });
  };

  if (!lesson) {
    return (
      <MagicBackground>
        <View style={[styles.notFound, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.notFoundText}>Lesson not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Back</Text>
          </Pressable>
        </View>
      </MagicBackground>
    );
  }

  return (
    <MagicBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
              <ArrowLeft size={22} color={colors.text} />
            </Pressable>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerTitleRow}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={styles.headerTitle}>Wizard · AI tutor</Text>
              </View>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {lesson.title}
              </Text>
            </View>
          </View>
          <View style={styles.phaseRow}>
            {lesson.steps.map((s, i) => (
              <Text
                key={s.id}
                style={[
                  styles.phaseLabel,
                  (i === stepIndex || finished) && styles.phaseLabelActive,
                ]}
              >
                {PHASE_LABELS[s.phase]}
              </Text>
            ))}
          </View>
          <ProgressBar
            current={finished ? lesson.steps.length : stepIndex}
            total={lesson.steps.length}
            showLabel={false}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m, i) => (
            <ChatBubble
              key={m.id}
              message={m.text}
              isUser={m.isUser}
              isNew={i === messages.length - 1}
              example={m.example}
              turnPrompt={m.turnPrompt}
            />
          ))}

          {finished && (
            <View style={styles.doneCard}>
              <Text style={styles.doneTitle}>
                {wasAlreadyCompleted.current ? 'Lesson reviewed' : 'Lesson complete!'}
              </Text>
              {!wasAlreadyCompleted.current && lesson.xpReward ? (
                <Text style={styles.doneXp}>+{lesson.xpReward} XP</Text>
              ) : null}
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
              >
                <Text style={styles.doneButtonText}>Back to Learn</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {!finished && step?.quickReplies && !busy && (
          <QuickReplyChips replies={step.quickReplies} onSelect={handleReply} />
        )}

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask Wizard anything…"
            placeholderTextColor={colors.textMuted}
            editable={!finished}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || busy || finished}
            style={[styles.sendButton, (!draft.trim() || busy || finished) && styles.sendDisabled]}
          >
            <Send size={18} color={colors.text} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800' as const,
      color: colors.text,
    },
    headerSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textSecondary,
    },
    phaseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    phaseLabel: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600' as const,
      color: colors.textMuted,
    },
    phaseLabelActive: {
      color: colors.primary,
    },
    messages: {
      paddingVertical: 12,
    },
    doneCard: {
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.enchantedGreen + '60',
    },
    doneTitle: {
      fontSize: 18,
      fontWeight: '800' as const,
      color: colors.text,
    },
    doneXp: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.starYellow,
    },
    doneButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 14,
    },
    doneButtonText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: {
      opacity: 0.4,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    notFoundText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
