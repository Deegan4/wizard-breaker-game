import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

function Segment({ filled, isNext }: { filled: boolean; isNext: boolean }) {
  const anim = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: filled ? 1 : 0,
      friction: 7,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [filled, anim]);

  return (
    <View style={[styles.segmentTrack, isNext && styles.segmentTrackNext]}>
      <Animated.View
        style={[
          styles.segmentFillWrapper,
          {
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.secondary, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.segmentFill}
        />
      </Animated.View>
    </View>
  );
}

export default function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Level Progress</Text>
          <Text style={styles.value}>{current}/{total}</Text>
        </View>
      )}
      <View style={styles.segments}>
        {Array.from({ length: total }).map((_, index) => (
          <Segment key={index} filled={index < current} isNext={index === current} />
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
  segments: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
  },
  segmentTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  segmentTrackNext: {
    borderColor: Colors.primaryLight,
  },
  segmentFillWrapper: {
    height: '100%',
  },
  segmentFill: {
    flex: 1,
    borderRadius: 4,
  },
});
