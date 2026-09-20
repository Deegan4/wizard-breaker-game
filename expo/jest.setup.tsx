import '@testing-library/jest-native';
import 'jest-extended';
import type React from 'react';

type WithChildren = { children?: React.ReactNode };

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Stack: { Screen: ({ children }: WithChildren) => children },
  useLocalSearchParams: () => ({}),
  Link: ({ children }: WithChildren) => children,
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-linear-gradient', () => {
  const mockReact: typeof React = require('react');
  const { View: mockView } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: WithChildren) =>
      mockReact.createElement(mockView, props, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const mockReact: typeof React = require('react');
  const { View: mockView } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children }: WithChildren) => mockReact.createElement(mockView, null, children),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const mockReact: typeof React = require('react');
  const { View: mockView } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: WithChildren) => mockReact.createElement(mockView, null, children),
  };
});

jest.mock('@tanstack/react-query', () => {
  const mockReact: typeof React = require('react');
  return {
    QueryClient: jest.fn(() => ({
      getQueryCache: () => ({ clear: jest.fn() }),
      getMutationCache: () => ({ clear: jest.fn() }),
      mount: jest.fn(),
      unmount: jest.fn(),
    })),
    QueryClientProvider: ({ children }: WithChildren) => mockReact.createElement(mockReact.Fragment, null, children),
    useQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn() })),
  };
});

jest.mock('@nkzw/create-context-hook', () => {
  const mockReact: typeof React = require('react');
  return {
    createContextHook: (hook: () => unknown) => {
      const Context = mockReact.createContext<unknown>(null);
      const Provider = ({ children }: WithChildren) => {
        const value = hook();
        return mockReact.createElement(Context.Provider, { value }, children);
      };
      const useHook = () => mockReact.useContext(Context);
      return [Provider, useHook];
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

declare const global: typeof globalThis & { __DEV__: boolean };
global.__DEV__ = true;
