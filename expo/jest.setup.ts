import '@testing-library/jest-native';
import 'jest-extended';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Stack: { Screen: ({ children }) => children },
  useLocalSearchParams: () => ({}),
  Link: ({ children }) => children,
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => <View {...props}>{children}</View>,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }) => <View>{children}</View>,
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => <View>{children}</View>,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    getQueryCache: () => ({ clear: jest.fn() }),
    getMutationCache: () => ({ clear: jest.fn() }),
    mount: jest.fn(),
    unmount: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => <>{children}</>,
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn() })),
}));

jest.mock('@nkzw/create-context-hook', () => ({
  createContextHook: (hook) => {
    const Context = React.createContext(null);
    const Provider = ({ children }) => {
      const value = hook();
      return <Context.Provider value={value}>{children}</Context.Provider>;
    };
    const useHook = () => React.useContext(Context);
    return [Provider, useHook];
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import React from 'react';
import { View } from 'react-native';

global.__DEV__ = true;