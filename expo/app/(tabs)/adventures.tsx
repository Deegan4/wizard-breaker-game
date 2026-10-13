import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, FlaskConical } from 'lucide-react-native';
import MagicBackground from '@/components/MagicBackground';
import ScreenHeader from '@/components/ScreenHeader';
import QuestTimelineCard from '@/components/QuestTimelineCard';
import QuestSummaryCard from '@/components/QuestSummaryCard';
import AdventureCard from '@/components/AdventureCard';
import { LEVELS } from '@/constants/levels';
import { ADVENTURES } from '@/constants/adventures';
import { useGame } from '@/contexts/GameContext';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { CONTENT_MAX_WIDTH } from '@/hooks/useWideLayout';

const PRACTICE_ADVENTURES = ADVENTURES.filter(a => a.id !== 'classic');

type Filter = 'all' | 'story' | 'practice';

const FILTERS: { id: Filter; label: string; Icon?: typeof BookOpen }[] = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story', Icon: BookOpen },
  { id: 'practice', label: 'Practice', Icon: FlaskConical },
];

export default function AdventuresScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { currentAdventure, setAdventure, getLevelStatus, getAdventureUnlockState, gameState } = useGame();
  const [filter, setFilter] = useState<Filter>('all');

  const storyCompleted = gameState.currentAdventure === 'classic'
    ? gameState.levelsCompleted
    : gameState.adventureProgress['classic']?.levelsCompleted ?? 0;

  const handleStoryPress = () => {
    if (currentAdventure !== 'classic') {
      setAdventure('classic');
    }
    router.push('/game');
  };

  const handlePracticePress = (adventureId: string) => {
    setAdventure(adventureId);
    router.push('/game');
  };

  const showStory = filter === 'all' || filter === 'story';
  const showPractice = filter === 'all' || filter === 'practice';

  return (
    <MagicBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Quests" subtitle="Choose your next mission" />

        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <Pressable
              accessibilityRole="button"
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.chip, filter === f.id && styles.chipActive]}
            >
              {f.Icon && (
                <f.Icon
                  size={14}
                  color={filter === f.id ? colors.text : colors.textSecondary}
                />
              )}
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your journey</Text>
          <Text style={styles.heroSubtitle}>
            Learn, practice, and become a prompt security wizard.
          </Text>
        </View>

        {showStory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Story</Text>
            {LEVELS.map((level, index) => (
              <QuestTimelineCard
                key={level.id}
                level={level}
                status={getLevelStatus(level.id)}
                isLast={index === LEVELS.length - 1}
                onPress={handleStoryPress}
              />
            ))}
          </View>
        )}

        {showPractice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practice</Text>
            <View style={styles.practiceGrid}>
              {PRACTICE_ADVENTURES.map((adventure, index) => {
                const unlockState = getAdventureUnlockState(adventure.id);
                return (
                  <AdventureCard
                    key={adventure.id}
                    adventure={{ ...adventure, isLocked: unlockState === 'locked' }}
                    index={index}
                    onPress={() => handlePracticePress(adventure.id)}
                  />
                );
              })}
            </View>
          </View>
        )}

        <QuestSummaryCard completed={storyCompleted} total={LEVELS.length} />
      </ScrollView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      paddingHorizontal: 16,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
    },
    chip: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.textOnPrimary,
    },
    hero: {
      marginBottom: 24,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '800' as const,
      color: colors.text,
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.textMuted,
      letterSpacing: 1,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    practiceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
  });
