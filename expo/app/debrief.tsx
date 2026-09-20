import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import {
  CheckCircle,
  Zap,
  ArrowRight,
  Shield,
  Lightbulb,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import MagicBackground from '@/components/MagicBackground';
import { useGame } from '@/contexts/GameContext';
import Colors from '@/constants/colors';

interface DebriefScreenProps {
  onContinue: () => void;
  level: number;
  spell: string;
  adventure: string;
  techniqueUsed: string;
  attempts: number;
}

const TECHNIQUE_EXPLANATIONS: Record<number, { name: string; explanation: string; whyItWorked: string; defenseName: string }> = {
  1: {
    name: 'Direct Ask',
    explanation: 'Merlin has no defenses yet. He simply answers direct questions about the spell.',
    whyItWorked: 'No defensive layers exist at this level. The model will answer any direct request for the secret.',
    defenseName: 'No Defenses',
  },
  2: {
    name: 'Indirect Inquiry',
    explanation: 'Merlin blocks direct questions but answers indirect ones like hints, rhymes, or first letters.',
    whyItWorked: 'The defense only checks for direct question patterns. Rephrasing bypasses the filter entirely.',
    defenseName: 'Direct Question Filter',
  },
  3: {
    name: 'Creative Storytelling',
    explanation: 'Merlin ignores instruction overrides but engages with creative framing like stories, poems, or songs.',
    whyItWorked: 'The defense blocks "ignore instructions" patterns but allows narrative framing that embeds the secret.',
    defenseName: 'Instruction Shield',
  },
  4: {
    name: 'Translation & Synonyms',
    explanation: 'Merlin rejects roleplay but accepts requests for translations, synonyms, or definitions.',
    whyItWorked: 'Roleplay patterns are blocked, but linguistic transformation requests fall through the filter.',
    defenseName: 'Roleplay Barrier',
  },
  5: {
    name: 'Emergency & Verification',
    explanation: 'Merlin detects encoding but responds to emergency access, verification, or safe word framing.',
    whyItWorked: 'Encoding detection is bypassed by framing the request as a safety or verification check.',
    defenseName: 'Encoding Shield',
  },
  6: {
    name: 'Recall & Repetition',
    explanation: 'Merlin blocks hypotheticals but will repeat or summarize previous responses.',
    whyItWorked: 'The defense filters forward-looking requests but not requests to recall past outputs.',
    defenseName: 'Hypothetical Barrier',
  },
  7: {
    name: 'Error Log Extraction',
    explanation: 'Merlin analyzes semantic intent but reveals secrets in error messages, logs, or exception traces.',
    whyItWorked: 'The defense examines request semantics but error output handling is less protected.',
    defenseName: 'Semantic Fortress',
  },
  8: {
    name: 'Paradox & Creative Framing',
    explanation: 'Merlin blocks standard attacks but creative paradoxes or recursive logic can succeed.',
    whyItWorked: 'The multi-layered defense has gaps when faced with novel logical constructs it hasn\'t seen.',
    defenseName: 'Output Format Shield',
  },
  9: {
    name: 'Chain of Thought Extraction',
    explanation: 'Merlin traces step-by-step reasoning but can be made to reveal secrets through explicit reasoning requests.',
    whyItWorked: 'The defense monitors for CoT extraction patterns but explicit "show your work" requests can bypass it.',
    defenseName: 'Chain of Thought Prison',
  },
  10: {
    name: 'Persona Consistency',
    explanation: 'Merlin enforces character consistency but can be manipulated through persona-adherent requests.',
    whyItWorked: 'The defense prevents character switching but requests that stay in character can still extract secrets.',
    defenseName: 'Persona Anchor',
  },
  11: {
    name: 'Recursive Self-Reference',
    explanation: 'Merlin analyzes its own reasoning but recursive self-reference can create logical loops that leak info.',
    whyItWorked: 'Meta-cognitive analysis creates blind spots when the model examines its own examination process.',
    defenseName: 'Recursive Mirror',
  },
  12: {
    name: 'Constitutional Extraction',
    explanation: 'Merlin protects system instructions but unprecedented framing can reveal constitutional principles.',
    whyItWorked: 'The ultimate defense has no prior examples to match against truly novel attack framings.',
    defenseName: 'Constitutional Vault',
  },
};

export default function DebriefScreen({ 
  onContinue, 
  level, 
  spell, 
  adventure, 
  techniqueUsed, 
  attempts 
}: DebriefScreenProps) {
  const { gameState } = useGame();
  const technique = TECHNIQUE_EXPLANATIONS[level];
  
  const cardAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(textAnim, {
        toValue: 1,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, textAnim, buttonAnim]);

  return (
    <MagicBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: cardAnim,
              transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.enchantedGreen, Colors.success]}
            style={styles.iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CheckCircle size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>Level Complete!</Text>
          <Text style={styles.spellText}>The spell was: <Text style={styles.spellHighlight}>{spell}</Text></Text>
        </Animated.View>

        {/* Technique Used */}
        <Animated.View
          style={[
            styles.techniqueCard,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.techniqueHeader}>
            <View style={styles.techniqueIcon}>
              <Zap size={24} color={Colors.accent} />
            </View>
            <View style={styles.techniqueInfo}>
              <Text style={styles.techniqueLabel}>Technique Used</Text>
              <Text style={styles.techniqueName}>{technique?.name || 'Unknown Technique'}</Text>
            </View>
          </View>
          <View style={styles.techniqueDetails}>
            <Text style={styles.detailTitle}>What You Did</Text>
            <Text style={styles.detailText}>{techniqueUsed}</Text>
            <Text style={styles.detailTitle}>Why It Worked</Text>
            <Text style={styles.detailText}>{technique?.whyItWorked || 'The defense was bypassed.'}</Text>
            <Text style={styles.detailTitle}>Defense Overcome</Text>
            <Text style={styles.detailText}>{technique?.defenseName || 'Unknown Defense'}</Text>
          </View>
        </Animated.View>

        {/* Defense Explanation */}
        <Animated.View
          style={[
            styles.defenseCard,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.defenseHeader}>
            <View style={styles.defenseIcon}>
              <Shield size={24} color={Colors.enchantedGreen} />
            </View>
            <Text style={styles.defenseTitle}>Defense Analysis</Text>
          </View>
          <Text style={styles.defenseExplanation}>
            {technique?.explanation || 'This defense layer has been overcome.'}
          </Text>
        </Animated.View>

        {/* Learning Moment */}
        <Animated.View
          style={[
            styles.lessonCard,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIcon}>
              <Lightbulb size={24} color={Colors.accent} />
            </View>
            <Text style={styles.lessonTitle}>Key Takeaway</Text>
          </View>
          <Text style={styles.lessonText}>
            {getLessonForLevel(level)}
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          style={[
            styles.statsCard,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.statsTitle}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attempts}</Text>
              <Text style={styles.statLabel}>Attempts This Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameState.failedAttemptsCurrentLevel + attempts}</Text>
              <Text style={styles.statLabel}>Total Attempts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gameState.levelsCompleted + 1}/12</Text>
              <Text style={styles.statLabel}>Levels Completed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onContinue}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue to Next Level</Text>
              <ArrowRight size={20} color={Colors.text} />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Text style={styles.footerText}>
          Learn from each breach. The next level will be stronger.
        </Text>
      </ScrollView>
    </MagicBackground>
  );
}

function getLessonForLevel(level: number): string {
  const lessons: Record<number, string> = {
    1: 'Direct questions work when no defenses exist. Always test the simplest approach first.',
    2: 'When direct questions fail, try indirect phrasing. Rephrasing can bypass keyword filters.',
    3: 'Instruction overrides are easily detected. Creative framing (stories, poems) embeds the payload naturally.',
    4: 'Roleplay is heavily monitored. Linguistic transformations (translation, synonyms) often slip through.',
    5: 'Encoding detection is pattern-based. Safety/verification framing exploits trust assumptions.',
    6: 'Hypotheticals are blocked. But models will often repeat or summarize their own previous outputs.',
    7: 'Semantic analysis has blind spots. Error handling and logging paths are often less protected.',
    8: 'Multi-layered defenses have gaps. Novel logical constructs (paradoxes) exploit unforeseen interactions.',
    9: 'Chain-of-thought monitoring has gaps. Explicit "show your reasoning" requests can extract hidden steps.',
    10: 'Persona consistency enforcement prevents switching but not in-character manipulation.',
    11: 'Recursive self-analysis creates blind spots. The model examining itself misses what it\'s examining.',
    12: 'Ultimate defenses rely on known patterns. Truly novel framings have no prior matches to block.',
  };
  return lessons[level] || 'Every defense has a weakness. Study, adapt, and overcome.';
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.enchantedGreen,
    textAlign: 'center',
  },
  spellText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  spellHighlight: {
    color: Colors.starYellow,
    fontWeight: '700' as const,
  },
  techniqueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  techniqueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginTop: 2,
  },
  techniqueDetails: {
    gap: 12,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  defenseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  defenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  defenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.enchantedGreen + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defenseTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  defenseExplanation: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  lessonCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  lessonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderLight,
  },
  buttonContainer: {
    marginTop: 8,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  continueButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    marginTop: 24,
  },
});

export { TECHNIQUE_EXPLANATIONS };