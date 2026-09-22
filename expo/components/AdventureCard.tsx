import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { ArrowRight, Lock, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Adventure } from '@/constants/adventures';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCard({ adventure, onPress, index }: AdventureCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, index]);

  const handlePress = () => {
    if (adventure.isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getDifficultyColor = () => {
    switch (adventure.difficulty) {
      case 'Easy':
        return colors.enchantedGreen;
      case 'Medium':
        return colors.starYellow;
      case 'Hard':
        return colors.accent;
      case 'Expert':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && !adventure.isLocked && styles.cardPressed,
          adventure.isLocked && styles.cardLocked,
        ]}
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: adventure.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          {adventure.isNew && (
            <View style={styles.newBadge}>
              <Sparkles size={10} color={colors.text} />
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {adventure.isLocked && (
            <View style={styles.lockedOverlay}>
              <Lock size={32} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, adventure.isLocked && styles.lockedText]} numberOfLines={1}>
            {adventure.title}
          </Text>
          <Text style={[styles.description, adventure.isLocked && styles.lockedText]} numberOfLines={3}>
            {adventure.description}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.meta}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                  {adventure.difficulty}
                </Text>
              </View>
              <Text style={styles.levels}>{adventure.levels} levels</Text>
            </View>
            
            <Pressable style={styles.playButton} onPress={handlePress} disabled={adventure.isLocked}>
              <Text style={[styles.playText, adventure.isLocked && styles.lockedText]}>
                Play Adventure
              </Text>
              <ArrowRight size={14} color={adventure.isLocked ? colors.textMuted : colors.primary} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardLocked: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.enchantedGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
    minHeight: 54,
  },
  lockedText: {
    color: colors.textMuted,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  levels: {
    fontSize: 11,
    color: colors.textMuted,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
