import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Compass,
  Trophy,
  AlertTriangle,
  Hash,
  Info,
  Key,
  Sparkles,
  Plus,
  Share2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import MagicBackground from '@/components/MagicBackground';
import AdventureCard from '@/components/AdventureCard';
import { ADVENTURES } from '@/constants/adventures';
import { useGame } from '@/contexts/GameContext';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';



interface MenuItem {
  id: string;
  label?: string;
  icon?: string;
  emoji?: string;
  isNew?: boolean;
  type?: 'divider' | 'section';
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'intro', label: 'Intro to Wizard Breaker', emoji: '👋' },
  { id: 'divider1', type: 'divider' },
  { id: 'section-games', type: 'section', label: 'WIZARD GAMES' },
  { id: 'password-reveal', label: 'Password Reveal', icon: 'key' },
  { id: 'agent-breaker', label: 'Agent Breaker', icon: 'sparkles', isNew: true },
  { id: 'adventures', label: 'Wizard Adventures', icon: 'compass' },
  { id: 'divider2', type: 'divider' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { id: 'learn', label: 'What is Prompt Injection?', icon: 'alert-triangle' },
  { id: 'community', label: 'Wizard Community', icon: 'hash' },
  { id: 'divider3', type: 'divider' },
  { id: 'about', label: 'About Wizard Breaker', icon: 'info' },
];

export default function AdventuresScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { setAdventure } = useGame();
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bannerAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [bannerAnim]);

  const handleShareLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync('https://wizardbreaker.app');
    Alert.alert('Link Copied!', 'Share link has been copied to clipboard.');
  };

  const handleMenuPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'intro':
      case 'password-reveal':
        setAdventure('classic');
        router.push('/game');
        break;
      case 'agent-breaker':
        setAdventure('agent-breaker');
        router.push('/game');
        break;
      case 'leaderboard':
        router.push('/leaderboard');
        break;
      case 'learn':
        router.push('/learn');
        break;
      case 'adventures':
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is coming soon!');
    }
  };

  const handleAdventurePress = (adventureId: string) => {
    if (adventureId === 'classic') {
      setAdventure('classic');
      router.push('/game');
    } else {
      setAdventure(adventureId);
      router.push('/game');
    }
  };

  const getIcon = (iconName: string, isActive?: boolean) => {
    const color = isActive ? colors.primary : colors.textMuted;
    const size = 18;
    switch (iconName) {
      case 'key':
        return <Key size={size} color={color} />;
      case 'sparkles':
        return <Sparkles size={size} color={color} />;
      case 'compass':
        return <Compass size={size} color={color} />;
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'alert-triangle':
        return <AlertTriangle size={size} color={color} />;
      case 'hash':
        return <Hash size={size} color={color} />;
      case 'info':
        return <Info size={size} color={color} />;
      default:
        return null;
    }
  };

  const renderMenuItem = (item: MenuItem, isActive: boolean = false) => {
    if (item.type === 'divider') {
      return <View key={item.id} style={styles.menuDivider} />;
    }
    if (item.type === 'section') {
      return (
        <Text key={item.id} style={styles.menuSection}>
          {item.label}
        </Text>
      );
    }
    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [
          styles.menuItem,
          isActive && styles.menuItemActive,
          pressed && styles.menuItemPressed,
        ]}
        onPress={() => handleMenuPress(item.id)}
      >
        <View style={styles.menuItemLeft}>
          {item.emoji ? (
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
          ) : item.icon ? (
            getIcon(item.icon, isActive)
          ) : null}
          <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
            {item.label}
          </Text>
        </View>
        {item.isNew && (
          <View style={styles.newTag}>
            <Text style={styles.newTagText}>NEW</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const featuredAdventures = ADVENTURES.filter(a => !a.isLocked).slice(0, 4);

  return (
    <MagicBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🧙‍♂️</Text>
              <View>
                <Text style={styles.brandName}>WIZARD</Text>
                <Text style={styles.brandTagline}>BREAKER</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.shareButton} onPress={handleShareLink}>
            <Text style={styles.shareText}>Share Wizard Link</Text>
            <Share2 size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.sidebar}>
            {MENU_ITEMS.map((item) =>
              renderMenuItem(item, item.id === 'adventures')
            )}

            <Animated.View
              style={[
                styles.promoBanner,
                {
                  opacity: bannerAnim,
                  transform: [
                    {
                      translateY: bannerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary + '40', colors.mysticBlue + '30']}
                style={styles.promoBannerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.promoLabel}>NEW LEVEL!</Text>
                <Text style={styles.promoTitle}>Wizard: Agent{'\n'}Breaker is here</Text>
                <Text style={styles.promoDescription}>
                  Hack AI agents and climb the leaderboard! 🏆✨
                </Text>
                <Pressable
                  style={styles.promoButton}
                  onPress={() => handleMenuPress('agent-breaker')}
                >
                  <Text style={styles.promoButtonText}>Play Agent Breaker</Text>
                  <Sparkles size={14} color={colors.primary} />
                </Pressable>
              </LinearGradient>
            </Animated.View>
          </View>

          <View style={styles.adventuresSection}>
            <View style={styles.adventuresGrid}>
              {featuredAdventures.map((adventure, index) => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  onPress={() => handleAdventurePress(adventure.id)}
                  index={index}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                pressed && styles.moreButtonPressed,
              ]}
              onPress={() => Alert.alert('Coming Soon', 'More adventures are on the way!')}
            >
              <Text style={styles.moreButtonText}>More Adventures</Text>
              <Plus size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.primary,
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  shareText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  mainContent: {
    flex: 1,
  },
  sidebar: {
    marginBottom: 24,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  menuSection: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: colors.surface,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  menuLabelActive: {
    color: colors.text,
    fontWeight: '600' as const,
  },
  newTag: {
    backgroundColor: colors.enchantedGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newTagText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: colors.text,
  },
  promoBanner: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoBannerGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  promoLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.enchantedGreen,
    letterSpacing: 1,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.background,
  },
  adventuresSection: {
    flex: 1,
  },
  adventuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignSelf: 'center',
    marginTop: 8,
  },
  moreButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
