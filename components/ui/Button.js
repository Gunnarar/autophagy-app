import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme, useThemedStyles } from '../../utils/theme';

const buildVariantStyles = currentTheme => ({
  primary: {
    backgroundColor: currentTheme.colors.brandPrimary,
    textColor: currentTheme.colors.textOnPrimary,
  },
  secondary: {
    backgroundColor: currentTheme.colors.surfaceMuted,
    textColor: currentTheme.colors.brandSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: currentTheme.colors.border,
    borderWidth: StyleSheet.hairlineWidth * 2,
    textColor: currentTheme.colors.brandSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: currentTheme.colors.textSecondary,
  },
  danger: {
    backgroundColor: currentTheme.colors.error,
    textColor: currentTheme.colors.textOnPrimary,
  },
});

const buildSizeStyles = currentTheme => ({
  sm: {
    height: 40,
    paddingHorizontal: currentTheme.spacing.sm,
    fontSize: currentTheme.typography.sizes.caption,
  },
  md: {
    height: 48,
    paddingHorizontal: currentTheme.spacing.sm + 4,
    fontSize: currentTheme.typography.sizes.body,
  },
  lg: {
    height: 54,
    paddingHorizontal: currentTheme.spacing.md,
    fontSize: currentTheme.typography.sizes.headline,
  },
});

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  leftIcon,
  rightIcon,
  disabled = false,
  children,
  ...props
}) {
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const variantStyles = useMemo(() => buildVariantStyles(currentTheme), [currentTheme]);
  const sizeStyles = useMemo(() => buildSizeStyles(currentTheme), [currentTheme]);

  const variantStyle = variantStyles[variant] ?? variantStyles.primary;
  const sizeStyle = sizeStyles[size] ?? sizeStyles.md;
  const labelContent = label ?? (typeof children === 'string' ? children : undefined);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth ?? 0,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.label,
            {
              color: variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
            },
            disabled && styles.labelDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : labelContent ? (
        <Text
          style={[
            styles.label,
            {
              color: variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
            },
            disabled && styles.labelDisabled,
            textStyle,
          ]}
        >
          {labelContent}
        </Text>
      ) : (
        children
      )}
      {rightIcon ? <View style={[styles.icon, styles.iconRight]}>{rightIcon}</View> : null}
    </TouchableOpacity>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    base: {
      borderRadius: currentTheme.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
    },
    label: {
      fontFamily: currentTheme.typography.fontFamily.medium,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    icon: {
      marginRight: currentTheme.spacing.xxs,
    },
    iconRight: {
      marginRight: 0,
      marginLeft: currentTheme.spacing.xxs,
    },
    disabled: {
      backgroundColor: currentTheme.colors.disabledBackground,
    },
    labelDisabled: {
      color: currentTheme.colors.disabledText,
    },
  });
