import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../../utils/theme';

const createSizePresets = currentTheme => ({
  sm: {
    paddingVertical: currentTheme.spacing.tiny,
    paddingHorizontal: currentTheme.spacing.sm,
    textSize: currentTheme.typography.sizes.caption,
  },
  md: {
    paddingVertical: currentTheme.spacing.tiny + 2,
    paddingHorizontal: currentTheme.spacing.sm + 4,
    textSize: currentTheme.typography.sizes.caption,
  },
  lg: {
    paddingVertical: currentTheme.spacing.sm,
    paddingHorizontal: currentTheme.spacing.md,
    textSize: currentTheme.typography.sizes.body,
  },
});

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
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const sizePresets = useMemo(() => createSizePresets(currentTheme), [currentTheme]);
  const sizePreset = sizePresets[size] || sizePresets.md;
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
      color: active ? currentTheme.colors.textOnPrimary : currentTheme.colors.textSecondary,
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

const createStyles = currentTheme =>
  StyleSheet.create({
    base: {
      borderRadius: currentTheme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.surfacePrimary,
      marginHorizontal: currentTheme.spacing.tiny,
      marginBottom: currentTheme.spacing.tiny,
    },
    active: {
      borderColor: currentTheme.colors.brandPrimary,
      backgroundColor: currentTheme.colors.brandPrimary,
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
      gap: currentTheme.spacing.tiny,
    },
    contentReverse: {
      flexDirection: 'row-reverse',
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: currentTheme.typography.fontFamily.medium,
      fontWeight: currentTheme.typography.weights.semibold,
    },
  });

export default Chip;
