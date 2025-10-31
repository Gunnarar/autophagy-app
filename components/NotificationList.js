import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NotificationCard from './NotificationCard';
import { theme } from '../utils/theme';

export default function NotificationList({ notifications = [], onDismiss }) {
  if (!notifications.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No updates right now</Text>
        <Text style={styles.emptyDesc}>Check back later for recommendations and reminders.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {notifications.map(notification => (
        <NotificationCard
          key={notification.key}
          notification={notification}
          onDismiss={notification.dismissible ? onDismiss : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.brandSecondary,
  },
  emptyDesc: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
