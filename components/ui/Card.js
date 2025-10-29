import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

const variants = {
  elevated: createVariant({
    backgroundColor: theme.colors.surfacePrimary,
    shadow: theme.shadow.medium,
  }),
  outline: createVariant({
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    shadow: null,
  }),
  tinted: createVariant({
    backgroundColor: theme.colors.surfaceMuted,
    shadow: theme.shadow.soft,
  }),
  flat: createVariant({
    backgroundColor: 'transparent',
    shadow: null,
  }),
};

function createVariant({ backgroundColor, borderWidth = 0, borderColor = 'transparent', shadow }) {
  const base = {
    backgroundColor,
    borderRadius: theme.radius.lg,
    borderWidth,
    borderColor,
    padding: theme.spacing.md,
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
  const variantStyle = variants[variant] ?? variants.elevated;

  return (
    <View style={[styles.base, variantStyle, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
  },
});

