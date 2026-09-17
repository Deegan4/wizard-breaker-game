import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';
import MerlinAvatar from './MerlinAvatar';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  isNew?: boolean;
  timestamp?: string;
}

export default function ChatBubble({ message, isUser, isNew = false, timestamp }: ChatBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? 20 : 0)).current;
  const timeFade = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(timeFade, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim, timeFade, isNew]);

  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <Text key={index} style={styles.italicText}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.merlinContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <MerlinAvatar size={36} />
        </View>
      )}
      <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.merlinWrapper]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.merlinBubble]}>
          <Text style={[styles.message, isUser ? styles.userText : styles.merlinText]}>
            {formatMessage(message)}
          </Text>
          {timestamp && (
            <Animated.View style={{ opacity: timeFade }}>
              <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.merlinTimestamp]}>
                {timestamp}
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  merlinContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubbleWrapper: {
    maxWidth: '80%',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  merlinWrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  merlinBubble: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.text,
  },
  merlinText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  merlinTimestamp: {
    color: Colors.textMuted,
  },
  boldText: {
    fontWeight: '700' as const,
    color: Colors.starYellow,
  },
  italicText: {
    fontStyle: 'italic' as const,
    color: Colors.textSecondary,
  },
});
