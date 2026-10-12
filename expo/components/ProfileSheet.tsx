import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Star, Shield, GraduationCap, Flame, RotateCcw, Check } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { useGame } from '@/contexts/GameContext';
import { useLessons } from '@/contexts/LessonContext';
import { useAchievements } from '@/contexts/AchievementContext';
import { LEVELS } from '@/constants/levels';
import { LESSONS } from '@/constants/lessons';

type ThemeMode = 'system' | 'light' | 'dark';
const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

interface ProfileSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileSheet({ visible, onClose }: ProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { gameState, setUsername, resetGame } = useGame();
  const { progress } = useLessons();
  const { stats } = useAchievements();

  const [name, setName] = useState(gameState.username);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(gameState.username);
      setConfirmReset(false);
    }
  }, [visible, gameState.username]);

  const classicCompleted =
    gameState.currentAdventure === 'classic'
      ? gameState.levelsCompleted
      : gameState.adventureProgress.classic?.levelsCompleted ?? 0;
  const lessonsCompleted = LESSONS.filter(l => progress[l.id]?.completed).length;
  const nameChanged = name.trim() !== gameState.username && name.trim().length > 0;

  const statItems = [
    { Icon: Star, label: 'Total XP', value: String(gameState.xpTotal), color: colors.starYellow },
    { Icon: Shield, label: 'Story levels', value: `${classicCompleted}/${LEVELS.length}`, color: colors.primary },
    { Icon: GraduationCap, label: 'Lessons', value: `${lessonsCompleted}/${LESSONS.length}`, color: colors.primary },
    { Icon: Flame, label: 'Day streak', value: String(stats.dailyStreak), color: colors.accent },
  ];

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetGame();
    setConfirmReset(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close profile"
      />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]} accessibilityViewIsModal>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">Your profile</Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close profile"
          >
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.label} nativeID="profile-name-label">Wizard name</Text>
        <View style={styles.nameRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter a name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            maxLength={20}
            accessibilityLabel="Wizard name"
            accessibilityLabelledBy="profile-name-label"
            returnKeyType="done"
            onSubmitEditing={() => nameChanged && setUsername(name.trim())}
          />
          <Pressable
            onPress={() => setUsername(name.trim())}
            disabled={!nameChanged}
            style={[styles.saveButton, !nameChanged && styles.saveButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Save name"
            accessibilityState={{ disabled: !nameChanged }}
          >
            <Check size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          {statItems.map(({ Icon, label, value, color }) => (
            <View key={label} style={styles.statCard} accessible accessibilityLabel={`${label}: ${value}`}>
              <Icon size={18} color={color} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Appearance</Text>
        <View style={styles.segment} accessibilityRole="radiogroup">
          {THEME_OPTIONS.map(opt => {
            const selected = themeMode === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setThemeMode(opt.id)}
                style={[styles.segmentItem, selected && styles.segmentItemActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleReset}
          style={[styles.resetButton, confirmReset && styles.resetButtonConfirm]}
          accessibilityRole="button"
          accessibilityHint="Resets your Story level progress. XP and lessons are kept."
        >
          <RotateCcw size={16} color={colors.danger} />
          <Text style={styles.resetText}>
            {confirmReset ? 'Tap again to restart Story progress' : 'Restart Story progress'}
          </Text>
        </Pressable>
        <Text style={styles.resetHelp}>Your XP, lessons and other quests are kept.</Text>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    scrim: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backgroundSecondary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
    },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    nameRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      fontSize: 16,
    },
    saveButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    statCard: {
      flexGrow: 1,
      flexBasis: '45%',
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    segment: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    segmentItem: {
      flex: 1,
      minHeight: 44,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentItemActive: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    segmentTextActive: {
      color: colors.textOnPrimary,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.danger + '66',
    },
    resetButtonConfirm: {
      backgroundColor: colors.danger + '1A',
      borderColor: colors.danger,
    },
    resetText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.danger,
    },
    resetHelp: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
