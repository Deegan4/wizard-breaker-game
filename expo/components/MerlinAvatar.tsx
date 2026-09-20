import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

interface MerlinAvatarProps {
  size?: number;
  isThinking?: boolean;
}

export default function MerlinAvatar({ size = 60, isThinking = false }: MerlinAvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    if (isThinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isThinking, pulseAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            opacity: glowOpacity,
          },
        ]}
      />
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={styles.hatContainer}>
          <View style={styles.hatTop} />
          <View style={styles.hatBrim} />
        </View>
        <View style={styles.face}>
          <View style={styles.eyesRow}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <View style={styles.beard} />
        </View>
        <Sparkles
          size={16}
          color={colors.starYellow}
          style={styles.sparkle1}
        />
        <Sparkles
          size={12}
          color={colors.secondary}
          style={styles.sparkle2}
        />
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  avatar: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  hatContainer: {
    position: 'absolute',
    top: -5,
    alignItems: 'center',
  },
  hatTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.primary,
  },
  hatBrim: {
    width: 30,
    height: 3,
    backgroundColor: colors.primaryDark,
    borderRadius: 2,
  },
  face: {
    marginTop: 15,
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  eye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  beard: {
    marginTop: 4,
    width: 20,
    height: 12,
    backgroundColor: colors.textMuted,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  sparkle1: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 10,
    left: 5,
  },
});
