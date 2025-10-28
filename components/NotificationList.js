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
    marginTop: theme.spacing.regular,
  },
  emptyContainer: {
    width: '100%',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    backgroundColor: '#ffffffAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.tiny,
  },
  emptyDesc: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
