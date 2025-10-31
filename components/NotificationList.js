import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NotificationCard from './NotificationCard';
import { useThemedStyles } from '../utils/theme';

export default function NotificationList({ notifications = [], onDismiss }) {
  const styles = useThemedStyles(createStyles);
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

const createStyles = currentTheme =>
  StyleSheet.create({
    list: {
      width: '100%',
      marginTop: currentTheme.spacing.md,
      gap: currentTheme.spacing.md,
    },
    emptyContainer: {
      width: '100%',
      padding: currentTheme.spacing.lg,
      borderRadius: currentTheme.radius.lg,
      backgroundColor: currentTheme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      gap: currentTheme.spacing.xs,
    },
    emptyTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.brandSecondary,
    },
    emptyDesc: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textAlign: 'center',
    },
  });
