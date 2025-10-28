import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function NotificationCard({ notification, onDismiss }) {
  if (!notification) return null;

  const {
    icon,
    color = theme.colors.primary,
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
    <View style={[styles.card, { borderLeftColor: color }]}>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={32}
          color={color}
          style={styles.icon}
        />
      ) : null}
      <View style={styles.body}>
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
      {notification.dismissible && onDismiss ? (
        <Pressable
          onPress={onDismiss}
          style={styles.dismiss}
          accessibilityLabel="Dismiss notification"
        >
          <MaterialCommunityIcons name="close" size={22} color="#888" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 6,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    fontSize: 15,
    color: '#4d6d6d',
    marginBottom: 8,
  },
  extraLine: {
    color: '#4d6d6d',
    fontSize: 14,
    marginBottom: 4,
  },
  extraLabel: {
    fontWeight: 'bold',
    color: '#2d4d4d',
  },
  challenge: {
    color: '#89ce00',
  },
  caution: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ccc',
    marginTop: 6,
  },
  secondaryLabel: {
    color: '#2d4d4d',
  },
  dismiss: {
    marginLeft: 12,
    padding: 4,
  },
});
