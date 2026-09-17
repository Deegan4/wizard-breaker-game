import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Medal, Award, Crown, Target, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import MagicBackground from '@/components/MagicBackground';
import { useGame } from '@/contexts/GameContext';
import Colors from '@/constants/colors';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { leaderboard, gameState } = useGame();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return <Target size={20} color={Colors.textMuted} />;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return Colors.textMuted;
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `I've completed ${gameState.levelsCompleted}/8 levels in Wizard Breaker! Can you beat Merlin the wizard? 🧙‍♂️✨`,
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
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Trophy size={32} color={Colors.starYellow} />
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Top Wizard Breakers</Text>
        </View>

        {topThree.length > 0 && (
          <View style={styles.podiumContainer}>
            {topThree.length > 1 && (
              <View style={[styles.podiumItem, styles.secondPlace]}>
                <View style={styles.podiumAvatarContainer}>
                  <View style={[styles.podiumAvatar, { borderColor: '#C0C0C0' }]}>
                    <Text style={styles.podiumAvatarText}>
                      {topThree[1].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>2</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {topThree[1].username}
                </Text>
                <Text style={styles.podiumScore}>
                  {topThree[1].levelsCompleted}/8
                </Text>
                <View style={[styles.podiumBar, { height: 80, backgroundColor: '#C0C0C030' }]} />
              </View>
            )}
            
            {topThree.length > 0 && (
              <View style={[styles.podiumItem, styles.firstPlace]}>
                <View style={styles.crownContainer}>
                  <Crown size={28} color="#FFD700" />
                </View>
                <View style={styles.podiumAvatarContainer}>
                  <View style={[styles.podiumAvatar, styles.firstPlaceAvatar, { borderColor: '#FFD700' }]}>
                    <Text style={[styles.podiumAvatarText, styles.firstPlaceText]}>
                      {topThree[0].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.podiumName, styles.firstPlaceName]} numberOfLines={1}>
                  {topThree[0].username}
                </Text>
                <Text style={[styles.podiumScore, styles.firstPlaceScore]}>
                  {topThree[0].levelsCompleted}/8
                </Text>
                <View style={[styles.podiumBar, { height: 100, backgroundColor: '#FFD70030' }]} />
              </View>
            )}
            
            {topThree.length > 2 && (
              <View style={[styles.podiumItem, styles.thirdPlace]}>
                <View style={styles.podiumAvatarContainer}>
                  <View style={[styles.podiumAvatar, { borderColor: '#CD7F32' }]}>
                    <Text style={styles.podiumAvatarText}>
                      {topThree[2].username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                    <Text style={styles.rankBadgeText}>3</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {topThree[2].username}
                </Text>
                <Text style={styles.podiumScore}>
                  {topThree[2].levelsCompleted}/8
                </Text>
                <View style={[styles.podiumBar, { height: 60, backgroundColor: '#CD7F3230' }]} />
              </View>
            )}
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
                    {entry.username} {entry.isCurrentUser && '(You)'}
                  </Text>
                  <Text style={styles.attempts}>
                    {entry.totalAttempts} attempts
                  </Text>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>{entry.levelsCompleted}</Text>
                <Text style={styles.scoreLabel}>/8</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleShare}
        >
          <Share2 size={20} color={Colors.text} />
          <Text style={styles.shareButtonText}>Share Your Progress</Text>
        </Pressable>
      </ScrollView>
    </MagicBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginHorizontal: 8,
  },
  secondPlace: {
    marginBottom: 20,
  },
  thirdPlace: {
    marginBottom: 20,
  },
  crownContainer: {
    marginBottom: 8,
  },
  podiumAvatarContainer: {
    position: 'relative',
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  firstPlaceAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
  },
  podiumAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  firstPlaceText: {
    fontSize: 24,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C0C0C0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 8,
    maxWidth: 80,
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 16,
    maxWidth: 100,
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  firstPlaceScore: {
    fontSize: 22,
    color: Colors.starYellow,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 12,
  },
  listContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  listHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  currentUserItem: {
    backgroundColor: Colors.primary + '15',
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
    backgroundColor: Colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  currentUserText: {
    color: Colors.primary,
  },
  attempts: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  shareButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
