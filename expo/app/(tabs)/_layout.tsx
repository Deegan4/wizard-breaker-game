import { Tabs } from "expo-router";
import { Home, Trophy, BookOpen, Compass, Calendar, Terminal } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 11,
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
