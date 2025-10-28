import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { formatTimeHM } from '../utils/constants';

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
  onStartFast,
  onStopFast,
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

  const handlePrimary = hasOngoingFast ? onStopFast : onStartFast;
  const primaryLabel = hasOngoingFast ? 'Stop Fast' : 'Start Fast';
  const progressFillStyle = useMemo(
    () => [styles.progressFill, { width: `${progressPercent}%` }],
    [progressPercent],
  );
  const feedbackStyle = useMemo(
    () => [styles.feedback, { color: goalReached ? theme.colors.accent : theme.colors.primary }],
    [goalReached],
  );
  const primaryButtonStyle = useMemo(
    () => [styles.primaryButton, { backgroundColor: hasOngoingFast ? theme.colors.accent : theme.colors.primary }],
    [hasOngoingFast],
  );

  return (
    <View style={styles.card}>
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
        {handlePrimary && (
          <Pressable
            onPress={handlePrimary}
            style={primaryButtonStyle}
            accessibilityLabel={primaryLabel}
          >
            <Text style={styles.primaryLabel}>{primaryLabel}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.centerBlock}>
        <Text style={styles.challengeText}>Next Challenge: <Text style={styles.challengeHighlight}>{durationLabel}</Text></Text>
        {!!reason && <Text style={styles.reason}>{reason}</Text>}
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
          {!!benefits && <Text style={styles.detailLine}><Text style={styles.detailLabel}>Benefits:</Text> {benefits}</Text>}
          {!!whatToExpect && <Text style={styles.detailLine}><Text style={styles.detailLabel}>What to expect:</Text> {whatToExpect}</Text>}
          {!!planNextMsg && <Text style={styles.detailLine}>{planNextMsg}</Text>}
          {!!challengeMsg && <Text style={[styles.detailLine, styles.challengeNote]}>{challengeMsg}</Text>}
          {caution && <Text style={[styles.detailLine, styles.caution]}>Caution: Consider a shorter fast first.</Text>}
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
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  elapsedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
    marginVertical: theme.spacing.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  goalReached: {
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  goalIcon: {
    fontSize: 18,
  },
  feedback: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  challengeText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  challengeHighlight: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  reason: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
    textAlign: 'center',
  },
  learnMore: {
    backgroundColor: '#e5f1f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.regular,
    alignSelf: 'center',
  },
  learnMoreText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  details: {
    marginTop: theme.spacing.small,
  },
  detailLine: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  challengeNote: {
    color: theme.colors.accent,
  },
  caution: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});
