import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Medal, Award, Crown, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import MagicBackground from '@/components/MagicBackground';
import ScreenHeader from '@/components/ScreenHeader';
import { useGame } from '@/contexts/GameContext';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import { CONTENT_MAX_WIDTH } from '@/hooks/useWideLayout';
import { LEVELS } from '@/constants/levels';

// Podium renders 2nd, 1st, 3rd left-to-right so the winner sits in the middle.
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_HEIGHTS = [104, 76, 56];

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { leaderboard, gameState } = useGame();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={22} color={colors.medal.gold} />;
      case 2:
        return <Medal size={22} color={colors.medal.silver} />;
      case 3:
        return <Award size={22} color={colors.medal.bronze} />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return colors.medal.gold;
      case 2:
        return colors.medal.silver;
      case 3:
        return colors.medal.bronze;
      default:
        return colors.border;
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `I've completed ${gameState.levelsCompleted}/${LEVELS.length} levels in Wizard Breaker! Can you beat Merlin the wizard? 🧙‍♂️✨`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <MagicBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 110 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Ranks" subtitle="Practice rankings, saved on this device" />

        {topThree.length > 0 && (
          <View style={styles.podiumContainer}>
            {PODIUM_ORDER.filter((i) => i < topThree.length).map((i) => {
              const entry = topThree[i];
              const rank = i + 1;
              const medal = getRankColor(rank);
              const isFirst = rank === 1;
              return (
                <View key={entry.id} style={styles.podiumItem}>
                  {isFirst && <Crown size={26} color={medal} style={styles.crown} />}
                  <View
                    style={[
                      styles.podiumAvatar,
                      isFirst && styles.firstPlaceAvatar,
                      { borderColor: medal },
                    ]}
                  >
                    <Text style={[styles.podiumAvatarText, isFirst && styles.firstPlaceText]}>
                      {entry.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.podiumName, entry.isCurrentUser && styles.currentUserText]}
                    numberOfLines={1}
                  >
                    {entry.isCurrentUser ? 'You' : entry.username}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {entry.levelsCompleted}
                    <Text style={styles.podiumScoreTotal}>/{LEVELS.length}</Text>
                  </Text>
                  <LinearGradient
                    colors={[medal + '55', medal + '10']}
                    style={[styles.podiumBar, { height: PODIUM_HEIGHTS[i], borderColor: medal + '66' }]}
                  >
                    <Text style={[styles.podiumRank, { color: medal }]}>{rank}</Text>
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>All Rankings</Text>
          </View>
          
          {leaderboard.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.listItem,
                entry.isCurrentUser && styles.currentUserItem,
              ]}
            >
              <View style={styles.rankContainer}>
                {getRankIcon(index + 1)}
              </View>
              
              <View style={styles.userInfo}>
                <View style={[styles.listAvatar, { borderColor: getRankColor(index + 1) }]}>
                  <Text style={styles.listAvatarText}>
                    {entry.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[
                    styles.username,
                    entry.isCurrentUser && styles.currentUserText
                  ]}>
                    {entry.username}{entry.isCurrentUser ? ' (You)' : ''}
                  </Text>
                  <Text style={styles.attempts}>
                    {entry.totalAttempts} attempts
                  </Text>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>{entry.levelsCompleted}</Text>
                <Text style={styles.scoreLabel}>/{LEVELS.length}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleShare}
        >
          <Share2 size={20} color={colors.textOnPrimary} />
          <Text style={styles.shareButtonText}>Share Your Progress</Text>
        </Pressable>
      </ScrollView>
    </MagicBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 8,
    marginBottom: 28,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  crown: {
    marginBottom: 6,
  },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  firstPlaceAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  podiumAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  firstPlaceText: {
    fontSize: 26,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 8,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.text,
    marginTop: 2,
  },
  podiumScoreTotal: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderBottomWidth: 0,
    marginTop: 10,
    alignItems: 'center',
    paddingTop: 10,
  },
  podiumRank: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textMuted,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  currentUserItem: {
    backgroundColor: colors.primary + '15',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  currentUserText: {
    color: colors.primary,
  },
  attempts: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  shareButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
