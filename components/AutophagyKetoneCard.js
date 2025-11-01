import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { useTheme, useThemedStyles } from '../utils/theme';
import { useTranslation } from '../contexts/LocalizationContext';

function formatTimestamp(value, fallback = 'Invalid date') {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {return fallback;}
    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return fallback;
  }
}

export default function AutophagyKetoneCard({
  autophagyDays = 0,
  hasOngoingFast = false,
  fastingTimerLabel = null,
  latestKetone = null,
  ketoneInKetosis = false,
  ketoneColor: ketoneColorProp,
  ketoneHistory = [],
}) {
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const ketoneColor = ketoneColorProp ?? currentTheme.colors.textSecondary;
  const hasHistory = ketoneHistory.length > 1;
  const invalidDateLabel = t('common.invalidDate', 'Invalid date');

  return (
    <Card variant="outline" style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('home.autophagyKetone.title', 'Autophagy & Ketones')}</Text>
          <Text style={styles.subtitle}>{t('home.autophagyKetone.subtitle', 'Cellular cleanup and metabolic fuel')}</Text>
        </View>
        <View style={styles.autophagyBadge}>
          <Text style={styles.autophagyCount}>{autophagyDays}</Text>
          <Text style={styles.autophagyMeta}>{t('home.autophagyKetone.autophagyMeta', '/365 days')}</Text>
        </View>
      </View>

      {hasOngoingFast && fastingTimerLabel ? (
        <View style={styles.fastRow}>
          <Text style={styles.fastLabel}>{t('home.autophagyKetone.currentFast', 'Current fast')}</Text>
          <Text style={styles.fastValue}>{fastingTimerLabel}</Text>
        </View>
      ) : null}

      <View style={styles.ketoneCard}>
        <View style={styles.ketoneHeader}>
          <Text style={styles.ketoneLabel}>{t('home.autophagyKetone.latestKetone', 'Latest ketone')}</Text>
          <Text style={[styles.ketoneValue, { color: ketoneColor }]}>
            {latestKetone ? `${latestKetone.value} ${latestKetone.unit}` : t('home.autophagyKetone.noData', 'No data')}
          </Text>
        </View>
        {latestKetone ? (
          <Text style={styles.ketoneTimestamp}>{formatTimestamp(latestKetone.time, invalidDateLabel)}</Text>
        ) : (
          <Text style={styles.ketoneEmpty}>{t('home.autophagyKetone.addReading', 'Add a reading to see progress')}</Text>
        )}
        {ketoneInKetosis ? <Text style={styles.ketoneState}>{t('home.autophagyKetone.ketosisEngaged', 'Ketosis likely engaged')}</Text> : null}
      </View>

      {hasHistory ? (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>{t('home.autophagyKetone.historyTitle', 'Recent readings')}</Text>
          {ketoneHistory.map(entry => (
            <View key={entry.id} style={styles.historyRow}>
              <Text
                style={[
                  styles.historyValue,
                  { color: entry.value >= 0.5 ? currentTheme.colors.brandPrimary : currentTheme.colors.textSecondary },
                ]}
              >
                {entry.value} {entry.unit}
              </Text>
              <Text style={styles.historyMeta}>{formatTimestamp(entry.time, invalidDateLabel)}</Text>
              {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    card: {
      marginBottom: currentTheme.spacing.lg,
      gap: currentTheme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
    },
    autophagyBadge: {
      alignItems: 'flex-end',
      backgroundColor: currentTheme.colors.surfaceMuted,
      borderRadius: currentTheme.radius.md,
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.xs,
    },
    autophagyCount: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.brandPrimary,
    },
    autophagyMeta: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    fastRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.surfaceMuted,
      borderRadius: currentTheme.radius.md,
      paddingHorizontal: currentTheme.spacing.md,
      paddingVertical: currentTheme.spacing.sm,
    },
    fastLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fastValue: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.brandSecondary,
    },
    ketoneCard: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.lg,
      paddingHorizontal: currentTheme.spacing.md,
      paddingVertical: currentTheme.spacing.sm,
      backgroundColor: currentTheme.colors.surfacePrimary,
    },
    ketoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ketoneLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: currentTheme.colors.textSecondary,
    },
    ketoneValue: {
      fontSize: currentTheme.typography.sizes.title,
      fontWeight: currentTheme.typography.weights.bold,
    },
    ketoneTimestamp: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
    },
    ketoneEmpty: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
    },
    ketoneState: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.success,
      marginTop: currentTheme.spacing.tiny,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    history: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: currentTheme.colors.border,
      paddingTop: currentTheme.spacing.sm,
      gap: currentTheme.spacing.sm,
    },
    historyTitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    historyRow: {
      borderRadius: currentTheme.radius.sm,
      backgroundColor: currentTheme.colors.surfaceMuted,
      padding: currentTheme.spacing.sm,
    },
    historyValue: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    historyMeta: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    historyNote: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
    },
  });
