import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

const SIZE_PRESETS = {
  sm: {
    paddingVertical: theme.spacing.tiny,
    paddingHorizontal: theme.spacing.sm,
    textSize: theme.typography.sizes.caption,
  },
  md: {
    paddingVertical: theme.spacing.tiny + 2,
    paddingHorizontal: theme.spacing.sm + 4,
    textSize: theme.typography.sizes.caption,
  },
  lg: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    textSize: theme.typography.sizes.body,
  },
};

export function Chip({
  label,
  active = false,
  disabled = false,
  icon,
  size = 'md',
  onPress,
  style,
  textStyle,
  iconAfter = false,
  contentStyle,
  accessibilityLabel,
  ...props
}) {
  const sizePreset = SIZE_PRESETS[size] || SIZE_PRESETS.md;
  const containerStyles = [
    styles.base,
    {
      paddingVertical: sizePreset.paddingVertical,
      paddingHorizontal: sizePreset.paddingHorizontal,
    },
    active ? styles.active : styles.inactive,
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    {
      fontSize: sizePreset.textSize,
      color: active ? theme.colors.textOnPrimary : theme.colors.textSecondary,
    },
    textStyle,
  ];

  const content = (
    <View style={[styles.content, iconAfter && styles.contentReverse, contentStyle]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={labelStyles}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return (
      <View
        accessibilityRole="text"
        accessibilityState={{ selected: active, disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={containerStyles}
        {...props}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [containerStyles, pressed && !disabled && styles.pressed]}
      {...props}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfacePrimary,
    marginHorizontal: theme.spacing.tiny,
    marginBottom: theme.spacing.tiny,
  },
  active: {
    borderColor: theme.colors.brandPrimary,
    backgroundColor: theme.colors.brandPrimary,
  },
  inactive: {},
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.tiny,
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.weights.semibold,
  },
});

export default Chip;
