import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { theme } from '../utils/theme';

export default function NotificationCard({ notification, onDismiss }) {
  if (!notification) {return null;}

  const {
    icon,
    color = theme.colors.brandPrimary,
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
            <Text style={styles.extraLabel}>Benefits:</Text> {benefits}
          </Text>
        ) : null}
        {whatToExpect ? (
          <Text style={styles.extraLine}>
            <Text style={styles.extraLabel}>What to expect:</Text> {whatToExpect}
          </Text>
        ) : null}
        {challengeMsg ? (
          <Text style={[styles.extraLine, styles.challenge]}>{challengeMsg}</Text>
        ) : null}
        {caution ? (
          <Text style={[styles.extraLine, styles.caution]}>Caution: Consider a shorter fast first.</Text>
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
          accessibilityLabel="Dismiss notification"
        >
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 6,
    paddingRight: theme.spacing.md,
    position: 'relative',
    gap: theme.spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  desc: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  extraLine: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  extraLabel: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  challenge: {
    color: theme.colors.success,
    fontWeight: theme.typography.weights.semibold,
  },
  caution: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.tiny,
  },
  actionButton: {
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.tiny + 1,
    paddingHorizontal: theme.spacing.sm,
  },
  actionLabel: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.caption,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  secondaryLabel: {
    color: theme.colors.brandSecondary,
  },
  dismiss: {
    padding: theme.spacing.tiny,
    marginLeft: theme.spacing.xs,
  },
});
