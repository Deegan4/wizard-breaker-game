import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

interface ExampleCardProps {
  text: string;
}

export default function ExampleCard({ text }: ExampleCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Lightbulb size={14} color={colors.starYellow} />
        <Text style={styles.label}>Example</Text>
      </View>
      <Text style={styles.text}>&ldquo;{text}&rdquo;</Text>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      marginTop: 10,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.starYellow,
      padding: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    label: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.starYellow,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
      fontStyle: 'italic' as const,
      color: colors.text,
    },
  });
