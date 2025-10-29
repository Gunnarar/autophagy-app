import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../../utils/theme';

const VARIANT_STYLES = {
  primary: {
    backgroundColor: theme.colors.brandPrimary,
    textColor: theme.colors.textOnPrimary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceMuted,
    textColor: theme.colors.brandSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth * 2,
    textColor: theme.colors.brandSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: theme.colors.textSecondary,
  },
  danger: {
    backgroundColor: theme.colors.error,
    textColor: theme.colors.textOnPrimary,
  },
};

const SIZE_STYLES = {
  sm: {
    height: 40,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.caption,
  },
  md: {
    height: 48,
    paddingHorizontal: theme.spacing.sm + 4,
    fontSize: theme.typography.sizes.body,
  },
  lg: {
    height: 54,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.headline,
  },
};

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
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.md;
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

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.weights.semibold,
  },
  icon: {
    marginRight: theme.spacing.xxs,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: theme.spacing.xxs,
  },
  disabled: {
    backgroundColor: theme.colors.disabledBackground,
  },
  labelDisabled: {
    color: theme.colors.disabledText,
  },
});
