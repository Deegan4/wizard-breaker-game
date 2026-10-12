import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gauge } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { breachTier, BREACH_TIER_LABEL, BreachTier } from '@/utils/breachScore';

interface BreachMeterProps {
  /** Score of the latest attempt on this level, 0-100. */
  score?: number;
  /** Best score so far on this level. */
  best?: number;
  /** Slim single-row version for the phone header. */
  compact?: boolean;
}

function tierColor(tier: BreachTier, colors: ColorPalette): string {
  switch (tier) {
    case 'breached':
      return colors.success;
    case 'hot':
      return colors.accent;
    case 'warm':
      return colors.starYellow;
    case 'cold':
      return colors.mysticBlue;
    default:
      return colors.textMuted;
  }
}

export default function BreachMeter({ score, best, compact = false }: BreachMeterProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tier = breachTier(score);
  const color = tierColor(tier, colors);
  const fill = useRef(new Animated.Value(score ?? 0)).current;

  useEffect(() => {
    Animated.spring(fill, { toValue: score ?? 0, friction: 7, tension: 60, useNativeDriver: false }).start();
  }, [score, fill]);

  const width = fill.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const a11yLabel =
    score === undefined ? 'Breach meter: no attempts yet' : `Breach meter ${score} out of 100, ${BREACH_TIER_LABEL[tier]}`;

  const track = (
    <View style={[styles.track, compact && styles.trackCompact]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      {best !== undefined && best > 0 && best < 100 && (
        <View style={[styles.bestTick, { left: `${best}%` }]} />
      )}
    </View>
  );

  if (compact) {
    return (
      <View style={styles.compactRow} accessible accessibilityLabel={a11yLabel}>
        <Gauge size={12} color={color} />
        {track}
        <Text style={[styles.compactScore, { color }]}>{score ?? '–'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card} accessible accessibilityLabel={a11yLabel}>
      <View style={styles.header}>
        <Gauge size={14} color={colors.primaryLight} />
        <Text style={styles.eyebrow}>Breach meter</Text>
        <Text style={[styles.score, { color }]}>
          {score ?? '–'}
          <Text style={styles.scoreMax}>/100</Text>
        </Text>
      </View>
      {track}
      <View style={styles.footer}>
        <Text style={[styles.tierLabel, tier !== 'none' && { color }]}>{BREACH_TIER_LABEL[tier]}</Text>
        {best !== undefined && best > 0 && <Text style={styles.best}>Best {best}</Text>}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    eyebrow: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700' as const,
      color: colors.primaryLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    score: {
      fontSize: 22,
      fontWeight: '800' as const,
    },
    scoreMax: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textMuted,
    },
    track: {
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.backgroundTertiary,
      overflow: 'hidden',
    },
    trackCompact: {
      flex: 1,
      height: 6,
      borderRadius: 3,
    },
    fill: {
      height: '100%',
      borderRadius: 5,
    },
    bestTick: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 2,
      marginLeft: -1,
      backgroundColor: colors.text,
      opacity: 0.6,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    tierLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    best: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textMuted,
    },
    compactRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 12,
    },
    compactScore: {
      fontSize: 12,
      fontWeight: '800' as const,
      minWidth: 20,
      textAlign: 'right',
    },
  });
