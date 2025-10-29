import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Chip } from '../Chip';
import { theme } from '../../../utils/theme';

function flattenStyleProp(element) {
  const { style } = element.props;
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
  return StyleSheet.flatten(resolved);
}

describe('Chip', () => {
  it('invokes onPress when pressed', () => {
    const handlePress = jest.fn();
    const { getByTestId } = render(
      <Chip label="Tap me" onPress={handlePress} testID="chip-press" />
    );

    fireEvent.press(getByTestId('chip-press'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('applies active styles when active', () => {
    const { getByTestId } = render(
      <Chip label="Active" active onPress={() => {}} testID="chip-active" />
    );

    const pressable = getByTestId('chip-active');
    const flattened = flattenStyleProp(pressable);

    expect(flattened.backgroundColor).toBe(theme.colors.brandPrimary);
    expect(flattened.borderColor).toBe(theme.colors.brandPrimary);
  });

  it('marks the chip disabled when requested', () => {
    const handlePress = jest.fn();
    const { getByTestId } = render(
      <Chip label="Disabled" disabled onPress={handlePress} testID="chip-disabled" />
    );

    const pressable = getByTestId('chip-disabled');
    const flattened = flattenStyleProp(pressable);
    fireEvent.press(pressable);

    expect(handlePress).not.toHaveBeenCalled();
    expect(flattened.opacity).toBe(0.5);
  });

  it('respects the large size preset spacing and typography', () => {
    const { getByTestId, getByText } = render(
      <Chip label="Large" size="lg" onPress={() => {}} testID="chip-large" />
    );

    const pressable = getByTestId('chip-large');
    const flattened = flattenStyleProp(pressable);
    const label = getByText('Large');
    const labelStyle = StyleSheet.flatten(label.props.style);

    expect(flattened.paddingVertical).toBe(theme.spacing.sm);
    expect(flattened.paddingHorizontal).toBe(theme.spacing.md);
    expect(labelStyle.fontSize).toBe(theme.typography.sizes.body);
  });

  it('exposes accessibility metadata on interactive chips', () => {
    const { getByLabelText } = render(
      <Chip label="Filter" active onPress={() => {}} accessibilityLabel="Filter chip" />
    );

    const interactiveChip = getByLabelText('Filter chip');
    expect(interactiveChip.props.accessibilityRole).toBe('button');
    expect(interactiveChip.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true, disabled: false })
    );
  });

  it('exposes accessibility metadata on static chips', () => {
    const { getByLabelText } = render(
      <Chip label="Static" active accessibilityLabel="Static chip" />
    );

    const staticChip = getByLabelText('Static chip');
    expect(staticChip.props.accessibilityRole).toBe('text');
    expect(staticChip.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true, disabled: false })
    );
  });
});
