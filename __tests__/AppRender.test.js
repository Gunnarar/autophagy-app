import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...rest }) => {
    // simple passthrough View to avoid native dependency in tests
    const { View } = require('react-native');
    return <View {...rest}>{children}</View>;
  },
}));

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const MockIcon = (props) => <View {...props} />;
  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
  };
});

jest.mock('react-native-modal-datetime-picker', () => {
  const { View } = require('react-native');
  return ({ isVisible, children }) => (isVisible ? <View>{children}</View> : null);
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => <View>{children}</View>,
    SafeAreaView: ({ children, ...rest }) => <View {...rest}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Rect: (props) => <View {...props} />,
    Text: (props) => <View {...props} />,
  };
});

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '',
  writeAsStringAsync: jest.fn(),
}));

try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (err) {
  // Optional dependency; ignore if not present in environment
}

describe('App root', () => {
  it('renders without runtime errors', async () => {
    let screen;
    expect(() => {
      screen = render(<App />);
    }).not.toThrow();

    await waitFor(() => expect(true).toBe(true));

    screen.unmount();
  });
});
