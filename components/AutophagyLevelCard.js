import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import { useTheme, useThemedStyles } from '../utils/theme';
import { useTranslation } from '../contexts/LocalizationContext';

export function AutophagyLevelCard({ status }) {
  if (!status) {
    return null;
  }

  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { currentLevel, nextChallenge, completed = {} } = status;

  return (
    <Card variant="outline" style={styles.card}>
      <Text style={styles.overline}>{t('info.autophagy.overline', 'Autophagy Journey')}</Text>
      <Text style={styles.title}>{t('info.autophagy.title', 'Level progress')}</Text>
      {nextChallenge ? (
        <Text style={styles.subtitle}>{t('info.autophagy.nextMilestone', 'Next milestone: {hours}h fast', { hours: nextChallenge })}</Text>
      ) : (
        <Text style={styles.subtitle}>{t('info.autophagy.allComplete', 'You have completed every tier—keep maintaining your streak!')}</Text>
      )}
      <View style={styles.list}>
        {AUTOPHAGY_LEVELS.map((level, index) => {
          const earned = completed[level.name] || [];
          const total = level.challenges.length;
          const isActive = currentLevel === level.name;
          const finished = earned.length >= total && !isActive;
          const iconName = finished
            ? 'trophy'
            : isActive
            ? 'progress-check'
            : 'shield-outline';
          const iconColor = finished
            ? currentTheme.colors.brandPrimary
            : isActive
            ? currentTheme.colors.info
            : currentTheme.colors.textMuted;
          const levelLabel = t(`info.autophagy.levelNames.${level.name}`, level.name);
          return (
            <View key={level.name} style={[styles.row, isActive && styles.activeRow]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.levelName, finished && styles.levelNameComplete]}>{levelLabel}</Text>
                <Text style={styles.levelMeta}>
                  {isActive
                    ? t('info.autophagy.levelProgress', '{completed}/{total} fasts completed', { completed: earned.length, total })
                    : finished
                    ? t('info.autophagy.levelCompleted', 'Completed')
                    : t('info.autophagy.levelRequired', '{total} fasts required', { total })}
                </Text>
              </View>
              <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    card: {
      marginBottom: currentTheme.spacing.lg,
    },
    overline: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: currentTheme.spacing.tiny,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.sm,
    },
    list: {
      gap: currentTheme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: currentTheme.spacing.xs,
      paddingHorizontal: currentTheme.spacing.sm,
      borderRadius: currentTheme.radius.md,
      backgroundColor: currentTheme.colors.surfacePrimary,
    },
    activeRow: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.brandPrimary,
      backgroundColor: currentTheme.colors.surfaceMuted,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: currentTheme.spacing.sm,
    },
    rankText: {
      fontSize: currentTheme.typography.sizes.caption,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textSecondary,
    },
    rowContent: {
      flex: 1,
    },
    levelName: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textPrimary,
    },
    levelNameComplete: {
      color: currentTheme.colors.brandPrimary,
    },
    levelMeta: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
  });

export default AutophagyLevelCard;
