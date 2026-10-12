import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

export interface StatRowItem {
  Icon: LucideIcon;
  value: string | number;
  label: string;
  tint?: string;
}

interface StatRowProps {
  items: StatRowItem[];
}

export default function StatRow({ items }: StatRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {items.map((item, index) => {
        const tint = item.tint ?? colors.primary;
        return (
          <View key={index} style={styles.tile}>
            <View style={[styles.iconCircle, { backgroundColor: tint + '20' }]}>
              <item.Icon size={16} color={tint} />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 16,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontSize: 16,
      fontWeight: '800' as const,
      color: colors.text,
    },
    label: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
