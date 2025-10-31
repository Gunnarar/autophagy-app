import React from 'react';
import { Pressable, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { ThemeProvider, useThemeMode } from '../utils/theme';

function ThemeToggleProbe() {
  const { mode, toggleMode, setMode } = useThemeMode();

  return (
    <>
      <Text testID="mode-label">{mode}</Text>
      <Pressable accessibilityRole="button" onPress={toggleMode} testID="toggle-button">
        <Text>Toggle</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setMode('dark')}
        testID="set-dark-button"
      >
        <Text>Set dark</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setMode('blue')}
        testID="set-blue-button"
      >
        <Text>Set blue</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => setMode('red')}
        testID="set-red-button"
      >
        <Text>Set red</Text>
      </Pressable>
    </>
  );
}

describe('ThemeProvider', () => {
  it('toggles between light and dark modes', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <ThemeToggleProbe />
      </ThemeProvider>,
    );

    expect(getByTestId('mode-label').props.children).toBe('light');

    fireEvent.press(getByTestId('toggle-button'));
    expect(getByTestId('mode-label').props.children).toBe('dark');

    fireEvent.press(getByTestId('toggle-button'));
    expect(getByTestId('mode-label').props.children).toBe('blue');

    fireEvent.press(getByTestId('toggle-button'));
    expect(getByTestId('mode-label').props.children).toBe('red');

    fireEvent.press(getByTestId('toggle-button'));
    expect(getByTestId('mode-label').props.children).toBe('light');

    fireEvent.press(getByTestId('set-dark-button'));
    expect(getByTestId('mode-label').props.children).toBe('dark');

    fireEvent.press(getByTestId('set-blue-button'));
    expect(getByTestId('mode-label').props.children).toBe('blue');

    fireEvent.press(getByTestId('set-red-button'));
    expect(getByTestId('mode-label').props.children).toBe('red');
  });
});
