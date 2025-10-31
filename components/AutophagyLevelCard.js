import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import { useTheme, useThemedStyles } from '../utils/theme';

export function AutophagyLevelCard({ status }) {
  if (!status) {
    return null;
  }

  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { currentLevel, nextChallenge, completed = {} } = status;

  return (
    <Card variant="outline" style={styles.card}>
      <Text style={styles.overline}>Autophagy Journey</Text>
      <Text style={styles.title}>Level progress</Text>
      {nextChallenge ? (
        <Text style={styles.subtitle}>Next milestone: {nextChallenge}h fast</Text>
      ) : (
        <Text style={styles.subtitle}>You have completed every tier—keep maintaining your streak!</Text>
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
          return (
            <View key={level.name} style={[styles.row, isActive && styles.activeRow]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.levelName, finished && styles.levelNameComplete]}>{level.name}</Text>
                <Text style={styles.levelMeta}>
                  {isActive
                    ? `${earned.length}/${total} fasts completed`
                    : finished
                    ? 'Completed'
                    : `${total} fasts required`}
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
