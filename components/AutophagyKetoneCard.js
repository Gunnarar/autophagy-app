import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

function formatTimestamp(value) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {return 'Invalid date';}
    return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  } catch (error) {
    return 'Invalid date';
  }
}

export default function AutophagyKetoneCard({
  autophagyDays = 0,
  hasOngoingFast = false,
  fastingTimerLabel = null,
  latestKetone = null,
  ketoneInKetosis = false,
  ketoneColor = theme.colors.textSecondary,
  ketoneHistory = [],
  onLogKetone,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Autophagy & Ketones</Text>
      <Text style={styles.autophagyText}>Autophagy: {autophagyDays} / 365 days</Text>
      {hasOngoingFast && fastingTimerLabel ? (
        <Text style={styles.fastTimer}>Fasting: {fastingTimerLabel}</Text>
      ) : null}
      <View style={styles.ketoneRow}>
        <Text style={[styles.ketoneLabel, { color: ketoneColor }]}>Ketones: </Text>
        {latestKetone ? (
          <Text style={[styles.ketoneValue, { color: ketoneColor }]}>
            {latestKetone.value} {latestKetone.unit}{' '}
            <Text style={styles.ketoneTimestamp}>({formatTimestamp(latestKetone.time)})</Text>
          </Text>
        ) : (
          <Text style={styles.noData}>No data</Text>
        )}
        {ketoneInKetosis ? <Text style={styles.ketoneIndicator}>🟢</Text> : null}
      </View>
      {onLogKetone ? (
        <Pressable style={styles.logButton} onPress={onLogKetone} accessibilityLabel="Log Ketone">
          <Text style={styles.logButtonLabel}>Log Ketone</Text>
        </Pressable>
      ) : null}
      {ketoneHistory.length > 1 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Ketone Values:</Text>
          {ketoneHistory.map(entry => (
            <Text
              key={entry.id}
              style={[
                styles.historyRow,
                { color: entry.value >= 0.5 ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {entry.value} {entry.unit}{' '}
              <Text style={styles.ketoneTimestamp}>({formatTimestamp(entry.time)})</Text>
              {entry.note ? ` - ${entry.note}` : ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.regular,
    marginBottom: theme.spacing.regular,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  autophagyText: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  fastTimer: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  ketoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ketoneLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ketoneValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ketoneTimestamp: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'normal',
  },
  noData: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  ketoneIndicator: {
    fontSize: 18,
    marginLeft: 6,
  },
  logButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  logButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyContainer: {
    width: '100%',
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  historyRow: {
    fontSize: 15,
  },
});
