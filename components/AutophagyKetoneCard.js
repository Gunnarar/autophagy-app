import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { theme } from '../utils/theme';

function formatTimestamp(value) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {return 'Invalid date';}
    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
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
}) {
  const hasHistory = ketoneHistory.length > 1;

  return (
    <Card variant="outline" style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Autophagy &amp; Ketones</Text>
          <Text style={styles.subtitle}>Cellular cleanup and metabolic fuel</Text>
        </View>
        <View style={styles.autophagyBadge}>
          <Text style={styles.autophagyCount}>{autophagyDays}</Text>
          <Text style={styles.autophagyMeta}>/365 days</Text>
        </View>
      </View>

      {hasOngoingFast && fastingTimerLabel ? (
        <View style={styles.fastRow}>
          <Text style={styles.fastLabel}>Current fast</Text>
          <Text style={styles.fastValue}>{fastingTimerLabel}</Text>
        </View>
      ) : null}

      <View style={styles.ketoneCard}>
        <View style={styles.ketoneHeader}>
          <Text style={styles.ketoneLabel}>Latest ketone</Text>
          <Text style={[styles.ketoneValue, { color: ketoneColor }]}>
            {latestKetone ? `${latestKetone.value} ${latestKetone.unit}` : 'No data'}
          </Text>
        </View>
        {latestKetone ? (
          <Text style={styles.ketoneTimestamp}>{formatTimestamp(latestKetone.time)}</Text>
        ) : (
          <Text style={styles.ketoneEmpty}>Add a reading to see progress</Text>
        )}
        {ketoneInKetosis ? <Text style={styles.ketoneState}>Ketosis likely engaged</Text> : null}
      </View>

      {hasHistory ? (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>Recent readings</Text>
          {ketoneHistory.map(entry => (
            <View key={entry.id} style={styles.historyRow}>
              <Text
                style={[
                  styles.historyValue,
                  { color: entry.value >= 0.5 ? theme.colors.brandPrimary : theme.colors.textSecondary },
                ]}
              >
                {entry.value} {entry.unit}
              </Text>
              <Text style={styles.historyMeta}>{formatTimestamp(entry.time)}</Text>
              {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  autophagyBadge: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  autophagyCount: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brandPrimary,
  },
  autophagyMeta: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  fastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  fastLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fastValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.brandSecondary,
  },
  ketoneCard: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
  },
  ketoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ketoneLabel: {
    fontSize: theme.typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  },
  ketoneValue: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
  },
  ketoneTimestamp: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  ketoneEmpty: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  ketoneState: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.success,
    marginTop: theme.spacing.tiny,
    fontWeight: theme.typography.weights.semibold,
  },
  history: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  historyTitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyRow: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.sm,
  },
  historyValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  historyMeta: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  historyNote: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
});
