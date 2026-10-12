import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, User } from 'lucide-react-native';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';
import ProfileSheet from '@/components/ProfileSheet';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          style={styles.orb}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={16} color={colors.textOnPrimary} />
        </LinearGradient>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Pressable
        style={styles.avatar}
        onPress={() => setProfileOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        hitSlop={8}
      >
        <User size={18} color={colors.textMuted} />
      </Pressable>
      <ProfileSheet visible={profileOpen} onClose={() => setProfileOpen(false)} />
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    orb: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '800' as const,
      color: colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textSecondary,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
