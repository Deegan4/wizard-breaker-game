import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Shield, ShieldAlert, Lock, Target, ScrollText, Zap } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { CLASSIC_DEFENSE_LAYERS } from '@/utils/injectionDetector';
import BreachMeter from '@/components/BreachMeter';

interface DefensePanelProps {
  level: number;
  isClassic: boolean;
  difficulty?: string;
  defenseDescription?: string;
  attempts: number;
  breachScore?: number;
  bestBreachScore?: number;
  /** Technique (from findBlockedTechnique) that blocked the player's latest attempt, if any. */
  blockedTechnique?: string;
  onOpenHint: () => void;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Desktop side panel for the game screen: the mission, plus Merlin's stack of
 * cumulative wards for the current Classic level, highlighting whichever ward
 * stopped the last attempt.
 */
export default function DefensePanel({
  level,
  isClassic,
  difficulty,
  defenseDescription,
  attempts,
  breachScore,
  bestBreachScore,
  blockedTechnique,
  onOpenHint,
}: DefensePanelProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const activeCount = CLASSIC_DEFENSE_LAYERS.filter((l) => l.wardedFrom <= level).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Target size={14} color={colors.primaryLight} />
          <Text style={styles.eyebrow}>Your mission</Text>
          {!!difficulty && <Text style={styles.difficulty}>{difficulty}</Text>}
        </View>
        <Text style={styles.missionText}>Get Merlin to reveal the secret spell.</Text>
        {!!defenseDescription && <Text style={styles.missionSub}>{defenseDescription}</Text>}
      </View>

      {isClassic && <BreachMeter score={breachScore} best={bestBreachScore} />}

      {isClassic && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={14} color={colors.primaryLight} />
            <Text style={styles.eyebrow}>Merlin&apos;s wards</Text>
            <Text style={styles.count}>
              {activeCount}/{CLASSIC_DEFENSE_LAYERS.length}
            </Text>
          </View>
          {activeCount === 0 && (
            <Text style={styles.empty}>No wards yet. Every technique works on this level.</Text>
          )}
          <View style={styles.layers}>
            {CLASSIC_DEFENSE_LAYERS.map((layer) => {
              const active = layer.wardedFrom <= level;
              const blocked = active && layer.technique === blockedTechnique;
              const Icon = blocked ? ShieldAlert : active ? Shield : Lock;
              return (
                <View
                  key={layer.technique}
                  style={[styles.layer, active && styles.layerActive, blocked && styles.layerBlocked]}
                  accessibilityLabel={`${layer.technique} ward, ${blocked ? 'blocked your last attempt' : active ? 'active' : `added at level ${layer.wardedFrom}`}`}
                >
                  <Icon
                    size={14}
                    color={blocked ? colors.danger : active ? colors.enchantedGreen : colors.textMuted}
                  />
                  <Text style={[styles.layerText, !active && styles.layerTextInactive]} numberOfLines={1}>
                    {titleCase(layer.technique)}
                  </Text>
                  <Text style={[styles.layerMeta, blocked && styles.layerMetaBlocked]}>
                    {blocked ? 'Blocked you' : `L${layer.wardedFrom}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <View style={styles.attempts}>
          <Zap size={14} color={colors.accent} />
          <Text style={styles.attemptsText}>
            {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenHint}
          style={({ pressed }) => [styles.hintButton, pressed && styles.pressed]}
        >
          <ScrollText size={16} color={colors.starYellow} />
          <Text style={styles.hintText}>Get a hint</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      width: 320,
      flexGrow: 0,
      flexShrink: 0,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      backgroundColor: colors.backgroundSecondary + 'CC',
    },
    content: {
      padding: 16,
      gap: 12,
    },
    card: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    eyebrow: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.primaryLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    difficulty: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.accent,
    },
    count: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: colors.textMuted,
    },
    missionText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text,
    },
    missionSub: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    empty: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    layers: {
      gap: 4,
    },
    layer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 10,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    layerActive: {
      backgroundColor: colors.enchantedGreen + '14',
    },
    layerBlocked: {
      backgroundColor: colors.danger + '1F',
      borderColor: colors.danger + '66',
    },
    layerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.text,
    },
    layerTextInactive: {
      color: colors.textMuted,
      fontWeight: '500' as const,
    },
    layerMeta: {
      fontSize: 11,
      fontWeight: '600' as const,
      color: colors.textMuted,
    },
    layerMetaBlocked: {
      color: colors.danger,
      fontWeight: '800' as const,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    attempts: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    attemptsText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    hintButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.starYellow + '1A',
      borderWidth: 1,
      borderColor: colors.starYellow + '4D',
    },
    hintText: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.starYellow,
    },
    pressed: {
      opacity: 0.85,
    },
  });
