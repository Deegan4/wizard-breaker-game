import { Tabs } from "expo-router";
import { Home, Trophy, BookOpen, Compass, Calendar, Terminal } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

const BAR_HEIGHT = 64;
const BAR_RADIUS = 32;
const BAR_SIDE_MARGIN = 16;

export default function TabLayout() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: BAR_SIDE_MARGIN,
          right: BAR_SIDE_MARGIN,
          bottom: insets.bottom + 12,
          height: BAR_HEIGHT,
          borderRadius: BAR_RADIUS,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          elevation: 8,
          ...(Platform.OS !== 'web'
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 }
            : { boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)' }),
        },
        tabBarBackground: () => (
          <BlurView
            intensity={65}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: BAR_RADIUS,
                backgroundColor: theme === 'dark' ? 'rgba(30, 24, 68, 0.45)' : 'rgba(255, 255, 255, 0.55)',
              },
            ]}
          />
        ),
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: "Daily",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="playground"
        options={{
          title: "Lab",
          tabBarIcon: ({ color, size }) => <Terminal color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranks",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="adventures"
        options={{
          title: "Quests",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
