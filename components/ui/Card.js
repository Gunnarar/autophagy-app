import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../../utils/theme';

function createVariant(currentTheme, { backgroundColor, borderWidth = 0, borderColor = 'transparent', shadow }) {
  const base = {
    backgroundColor,
    borderRadius: currentTheme.radius.lg,
    borderWidth,
    borderColor,
    padding: currentTheme.spacing.md,
  };

  if (!shadow) {
    return base;
  }

  return {
    ...base,
    shadowColor: shadow.color,
    shadowOffset: shadow.offset,
    shadowOpacity: shadow.opacity,
    shadowRadius: shadow.radius,
    elevation: shadow.elevation,
  };
}

export function Card({ children, variant = 'elevated', style, ...props }) {
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const variants = useMemo(
    () => ({
      elevated: createVariant(currentTheme, {
        backgroundColor: currentTheme.colors.surfacePrimary,
        shadow: currentTheme.shadow.medium,
      }),
      outline: createVariant(currentTheme, {
        backgroundColor: currentTheme.colors.surfacePrimary,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: currentTheme.colors.border,
        shadow: null,
      }),
      tinted: createVariant(currentTheme, {
        backgroundColor: currentTheme.colors.surfaceMuted,
        shadow: currentTheme.shadow.soft,
      }),
      flat: createVariant(currentTheme, {
        backgroundColor: 'transparent',
        shadow: null,
      }),
    }),
    [currentTheme],
  );

  const variantStyle = variants[variant] ?? variants.elevated;

  return (
    <View style={[styles.base, variantStyle, style]} {...props}>
      {children}
    </View>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    base: {
      borderRadius: currentTheme.radius.lg,
    },
  });
