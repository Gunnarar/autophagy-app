import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatTimeHM } from '../utils/constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export default function FastingSummaryCard({
  fastingElapsedSeconds = 0,
  recommendedProgram,
  reason,
  benefits,
  whatToExpect,
  challengeMsg,
  caution,
  planNextMsg,
  hasOngoingFast = false,
  onEditStart,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const { progressPercent, remainingLabel, goalReached, durationLabel } = useMemo(() => {
    const durationHours = recommendedProgram?.duration ?? 0;
    const durationSeconds = durationHours * 3600;
    const progress = durationSeconds > 0 ? Math.min(1, fastingElapsedSeconds / durationSeconds) : 0;
    const remainingSeconds = Math.max(0, durationSeconds - fastingElapsedSeconds);
    const goalReachedFlag = progress >= 1;
    return {
      progressPercent: Math.round(progress * 100),
      remainingLabel: durationSeconds <= 0 || goalReachedFlag ? '0h 0m' : formatTimeHM(remainingSeconds),
      goalReached: goalReachedFlag,
      durationLabel: durationHours ? `${durationHours}h Fast` : 'Fast',
    };
  }, [fastingElapsedSeconds, recommendedProgram]);

  const progressFillStyle = useMemo(
    () => [styles.progressFill, { width: `${progressPercent}%` }],
    [progressPercent],
  );
  const feedbackStyle = useMemo(
    () => [styles.feedback, { color: goalReached ? theme.colors.success : theme.colors.brandPrimary }],
    [goalReached],
  );
  const hoursElapsed = fastingElapsedSeconds / 3600;
  const autophagyProgress = Math.min(1, Math.max(0, (hoursElapsed - 16) / 12));
  const autophagyPercent = Math.round(autophagyProgress * 100);
  const metabolicState = (() => {
    if (hoursElapsed < 4) return 'Fed state';
    if (hoursElapsed < 8) return 'Early fasting';
    if (hoursElapsed < 12) return 'Fat burning';
    if (hoursElapsed < 24) return 'Autophagy active';
    return 'Deep autophagy';
  })();

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Fasting</Text>
      <View style={styles.centerBlock}>
        <Text style={styles.elapsedText}>{formatTimeHM(fastingElapsedSeconds)}</Text>
        <Text style={styles.caption}>Elapsed</Text>
        <View style={styles.progressTrack}>
          <View style={progressFillStyle} />
        </View>
        <Text style={styles.caption}>
          {goalReached ? <Text style={styles.goalReached}><Text style={styles.goalIcon}>🎉</Text> Goal reached!</Text> : `${remainingLabel} remaining`}
        </Text>
        <Text style={feedbackStyle}>
          {goalReached ? 'You did it!' : 'Keep going!'}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{metabolicState}</Text>
        </View>
        <View style={styles.autophagyBlock}>
          <Text style={styles.autophagyLabel}>Autophagy activation</Text>
          <View style={styles.autophagyTrack}>
            <View style={[styles.autophagyFill, { width: `${autophagyPercent}%` }]} />
          </View>
          <Text style={styles.autophagyMeta}>
            {autophagyPercent >= 100
              ? 'Deep autophagy engaged'
              : autophagyPercent > 0
              ? `${Math.max(0, 28 - hoursElapsed).toFixed(1)}h to full activation`
              : 'Starts around the 16h mark'}
          </Text>
        </View>
        {hasOngoingFast && onEditStart ? (
          <Button
            label="Edit start time"
            size="sm"
            variant="secondary"
            onPress={onEditStart}
            style={styles.editStartButton}
          />
        ) : null}
      </View>
      <View style={styles.centerBlock}>
        <Text style={styles.challengeText}>Next Challenge: <Text style={styles.challengeHighlight}>{durationLabel}</Text></Text>
      </View>
      <Pressable
        onPress={() => setShowDetails(prev => !prev)}
        style={styles.learnMore}
        accessibilityLabel={showDetails ? 'Hide fasting details' : 'Show fasting details'}
      >
        <Text style={styles.learnMoreText}>{showDetails ? 'Hide details' : 'Learn more'}</Text>
      </Pressable>
      {showDetails && (
        <View style={styles.details}>
          {!!reason && <Text style={styles.detailLine}><Text style={styles.detailLabel}>Recommendation:</Text> {reason}</Text>}
          {!!benefits && <Text style={styles.detailLine}><Text style={styles.detailLabel}>Benefits:</Text> {benefits}</Text>}
          {!!whatToExpect && <Text style={styles.detailLine}><Text style={styles.detailLabel}>What to expect:</Text> {whatToExpect}</Text>}
          {!!planNextMsg && <Text style={styles.detailLine}>{planNextMsg}</Text>}
          {!!challengeMsg && <Text style={[styles.detailLine, styles.challengeNote]}>{challengeMsg}</Text>}
          {caution && <Text style={[styles.detailLine, styles.caution]}>Caution: Consider a shorter fast first.</Text>}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  elapsedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.brandPrimary,
  },
  caption: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  progressTrack: {
    width: '100%',
    height: 18,
    backgroundColor: theme.colors.border,
    borderRadius: 9,
    marginVertical: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.brandPrimary,
  },
  goalReached: {
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  goalIcon: {
    fontSize: 18,
  },
  feedback: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.tiny,
    borderRadius: theme.radius.pill,
  },
  badgeText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.brandSecondary,
  },
  autophagyBlock: {
    marginTop: theme.spacing.md,
    width: '100%',
    alignItems: 'flex-start',
    gap: theme.spacing.tiny,
  },
  autophagyLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  autophagyTrack: {
    width: '100%',
    height: 10,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  autophagyFill: {
    height: '100%',
    backgroundColor: theme.colors.brandPrimary,
    borderRadius: theme.radius.pill,
  },
  autophagyMeta: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  editStartButton: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.sm,
  },
  challengeText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  challengeHighlight: {
    fontWeight: 'bold',
    color: theme.colors.brandPrimary,
  },
  reason: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
    textAlign: 'center',
  },
  learnMore: {
    backgroundColor: theme.colors.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    alignSelf: 'center',
  },
  learnMoreText: {
    color: theme.colors.brandSecondary,
    fontWeight: '600',
  },
  details: {
    marginTop: theme.spacing.sm,
  },
  detailLine: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  challengeNote: {
    color: theme.colors.brandHighlight,
  },
  caution: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});
