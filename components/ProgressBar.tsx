import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Colors from '@/constants/colors';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export default function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const progress = (current / total) * 100;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Level Progress</Text>
          <Text style={styles.value}>{current}/{total}</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterpolated }]}>
          <View style={styles.shimmer} />
        </Animated.View>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.marker,
              {
                left: `${((index + 1) / total) * 100}%`,
                backgroundColor: index < current ? Colors.enchantedGreen : Colors.textMuted,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  value: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  marker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    marginLeft: -1,
  },
});
