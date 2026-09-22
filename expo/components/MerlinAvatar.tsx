import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export type MerlinAvatarState = 'idle' | 'thinking' | 'success';

interface MerlinAvatarProps {
  size?: number;
  state?: MerlinAvatarState;
  /** @deprecated use `state="thinking"` instead */
  isThinking?: boolean;
}

export default function MerlinAvatar({ size = 60, state, isThinking = false }: MerlinAvatarProps) {
  const { colors } = useTheme();
  const resolvedState: MerlinAvatarState = state ?? (isThinking ? 'thinking' : 'idle');

  const glow = useSharedValue(0);
  const pulse = useSharedValue(1);
  const bob = useSharedValue(0);
  const sparkleSpin = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, [glow]);

  useEffect(() => {
    if (resolvedState === 'thinking') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 450, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      );
      bob.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 350 }),
          withTiming(0, { duration: 350 })
        ),
        -1
      );
    } else if (resolvedState === 'success') {
      pulse.value = withSequence(
        withSpring(1.25, { damping: 4, stiffness: 200 }),
        withSpring(1, { damping: 8 })
      );
      bob.value = withTiming(0, { duration: 200 });
      sparkleSpin.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    } else {
      pulse.value = withSpring(1);
      bob.value = withTiming(0, { duration: 200 });
      sparkleSpin.value = withTiming(0, { duration: 200 });
    }
  }, [resolvedState, pulse, bob, sparkleSpin]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: bob.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glow.value * (resolvedState === 'success' ? 0.7 : 0.5),
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: resolvedState === 'success' ? 1 : 0.6,
    transform: [{ rotate: `${sparkleSpin.value * 360}deg` }, { scale: 0.8 + sparkleSpin.value * 0.4 }],
  }));

  const ringColor = resolvedState === 'success' ? colors.enchantedGreen : colors.primary;
  const glowColor = resolvedState === 'success' ? colors.enchantedGreen : colors.primary;

  return (
    <View style={[styles.container, { width: size * 1.4, height: size * 1.4 }]}>
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            backgroundColor: glowColor,
          },
        ]}
      />
      <Animated.View style={bodyStyle}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={46} fill={colors.surface} stroke={ringColor} strokeWidth={4} />

          <G>
            <Polygon points="50,8 30,42 70,42" fill={ringColor} />
            <Path d="M 26 44 L 74 44 L 70 50 L 30 50 Z" fill={colors.primaryDark} />
          </G>

          <Circle cx={38} cy={58} r={3.2} fill={colors.text} />
          <Circle cx={62} cy={58} r={3.2} fill={colors.text} />

          {resolvedState === 'success' ? (
            <Path
              d="M 38 70 Q 50 80 62 70"
              stroke={colors.text}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <Path
              d="M 38 72 Q 50 68 62 72"
              stroke={colors.text}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          )}

          <Path
            d="M 30 62 Q 50 92 70 62 Q 65 80 50 82 Q 35 80 30 62 Z"
            fill={colors.textMuted}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.sparkle1, sparkleStyle]}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path
            d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
            fill={resolvedState === 'success' ? colors.enchantedGreen : colors.starYellow}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.sparkle2, sparkleStyle]}>
        <Svg width={11} height={11} viewBox="0 0 24 24">
          <Path
            d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
            fill={colors.secondary}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  sparkle1: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 8,
    left: 2,
  },
});
