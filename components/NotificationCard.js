import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { useTheme, useThemedStyles } from '../utils/theme';
import { useTranslation } from '../contexts/LocalizationContext';

export default function NotificationCard({ notification, onDismiss }) {
  if (!notification) {return null;}

  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const {
    icon,
    color = currentTheme.colors.brandPrimary,
    title,
    desc,
    action,
    actionLabel,
    secondaryAction,
    secondaryLabel,
    benefits,
    whatToExpect,
    challengeMsg,
    caution,
  } = notification;

  return (
    <Card variant="outline" style={[styles.card, { borderLeftColor: color }]}>
      {icon ? <MaterialCommunityIcons name={icon} size={28} color={color} style={styles.icon} /> : null}
      <View style={styles.content}>
        {title ? <Text style={[styles.title, { color }]}>{title}</Text> : null}
        {desc ? <Text style={styles.desc}>{desc}</Text> : null}

        {benefits ? (
          <Text style={styles.extraLine}>
            <Text style={styles.extraLabel}>{t('info.notifications.benefitsLabel', 'Benefits:')}</Text> {benefits}
          </Text>
        ) : null}
        {whatToExpect ? (
          <Text style={styles.extraLine}>
            <Text style={styles.extraLabel}>{t('info.notifications.expectLabel', 'What to expect:')}</Text> {whatToExpect}
          </Text>
        ) : null}
        {challengeMsg ? (
          <Text style={[styles.extraLine, styles.challenge]}>{challengeMsg}</Text>
        ) : null}
        {caution ? (
          <Text style={[styles.extraLine, styles.caution]}>{t('info.notifications.caution', 'Caution: Consider a shorter fast first.')}</Text>
        ) : null}

        <View style={styles.actions}>
          {action && actionLabel ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: color }]}
              onPress={action}
              accessibilityLabel={actionLabel}
            >
              <Text style={styles.actionLabel}>{actionLabel}</Text>
            </Pressable>
          ) : null}

          {secondaryAction && secondaryLabel ? (
            <Pressable
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={secondaryAction}
              accessibilityLabel={secondaryLabel}
            >
              <Text style={[styles.actionLabel, styles.secondaryLabel]}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {notification.dismissible && onDismiss ? (
        <Pressable
          onPress={onDismiss}
          style={styles.dismiss}
          accessibilityLabel={t('info.notifications.dismiss', 'Dismiss notification')}
        >
          <MaterialCommunityIcons name="close" size={20} color={currentTheme.colors.textMuted} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderLeftWidth: 6,
      paddingRight: currentTheme.spacing.md,
      position: 'relative',
      gap: currentTheme.spacing.sm,
    },
    icon: {
      marginTop: 2,
    },
    content: {
      flex: 1,
      gap: currentTheme.spacing.xs,
    },
    title: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    desc: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    extraLine: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    extraLabel: {
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textPrimary,
    },
    challenge: {
      color: currentTheme.colors.success,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    caution: {
      color: currentTheme.colors.error,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: currentTheme.spacing.xs,
      marginTop: currentTheme.spacing.tiny,
    },
    actionButton: {
      borderRadius: currentTheme.radius.sm,
      paddingVertical: currentTheme.spacing.tiny + 1,
      paddingHorizontal: currentTheme.spacing.sm,
    },
    actionLabel: {
      color: currentTheme.colors.textOnPrimary,
      fontWeight: currentTheme.typography.weights.semibold,
      fontSize: currentTheme.typography.sizes.caption,
    },
    secondaryButton: {
      backgroundColor: currentTheme.colors.surfaceMuted,
    },
    secondaryLabel: {
      color: currentTheme.colors.brandSecondary,
    },
    dismiss: {
      padding: currentTheme.spacing.tiny,
      marginLeft: currentTheme.spacing.xs,
    },
  });
