import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import { theme } from '../utils/theme';

export function AutophagyLevelCard({ status }) {
  if (!status) {
    return null;
  }

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
            ? theme.colors.brandPrimary
            : isActive
            ? theme.colors.info
            : theme.colors.textMuted;
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

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  overline: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.tiny,
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfacePrimary,
  },
  activeRow: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.brandPrimary,
    backgroundColor: theme.colors.surfaceMuted,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  rankText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  rowContent: {
    flex: 1,
  },
  levelName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  levelNameComplete: {
    color: theme.colors.brandPrimary,
  },
  levelMeta: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
});

export default AutophagyLevelCard;
