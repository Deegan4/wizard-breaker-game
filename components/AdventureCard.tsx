import React, { useRef, useEffect } from 'react';
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
import Colors from '@/constants/colors';
import { Adventure } from '@/constants/adventures';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCard({ adventure, onPress, index }: AdventureCardProps) {
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
        return Colors.enchantedGreen;
      case 'Medium':
        return Colors.starYellow;
      case 'Hard':
        return Colors.accent;
      case 'Expert':
        return Colors.danger;
      default:
        return Colors.textMuted;
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
              <Sparkles size={10} color={Colors.text} />
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {adventure.isLocked && (
            <View style={styles.lockedOverlay}>
              <Lock size={32} color={Colors.textMuted} />
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
              <ArrowRight size={14} color={adventure.isLocked ? Colors.textMuted : Colors.primary} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.enchantedGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBadgeText: {
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
    minHeight: 54,
  },
  lockedText: {
    color: Colors.textMuted,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.textMuted,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
