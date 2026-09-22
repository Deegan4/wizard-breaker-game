import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useMemo } from 'react';
import { useTheme, ColorPalette } from '@/contexts/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This spell seems to have vanished!</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Tower</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600' as const,
  },
});
