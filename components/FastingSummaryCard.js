import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatTimeHM } from '../utils/constants';
import { Card } from './ui/Card';

export default function FastingSummaryCard({
  fastingElapsedSeconds = 0,
  recommendedProgram,
  reason,
  benefits,
  whatToExpect,
  challengeMsg,
  caution,
  planNextMsg,
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
