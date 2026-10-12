import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import type { QuickReply } from '@/constants/lessons';

interface QuickReplyChipsProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  disabled?: boolean;
}

export default function QuickReplyChips({ replies, onSelect, disabled = false }: QuickReplyChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {replies.map(reply => (
        <Pressable
          accessibilityRole="button"
          key={reply.id}
          disabled={disabled}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(reply);
          }}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            disabled && styles.chipDisabled,
          ]}
        >
          <Text style={styles.chipText}>{reply.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    chipPressed: {
      backgroundColor: colors.primary + '20',
      transform: [{ scale: 0.97 }],
    },
    chipDisabled: {
      opacity: 0.5,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primary,
    },
  });
