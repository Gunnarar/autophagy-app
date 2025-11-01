import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '../utils/theme';
import { formatTimeHM } from '../utils/constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useTranslation } from '../contexts/LocalizationContext';

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
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

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
      durationLabel: durationHours
        ? t('fastingSummary.durationLabel', '{hours}h fast', { hours: durationHours })
        : t('fastingSummary.genericFast', 'Fast'),
    };
  }, [fastingElapsedSeconds, recommendedProgram, t]);

  const progressFillStyle = useMemo(
    () => [styles.progressFill, { width: `${progressPercent}%` }],
    [progressPercent],
  );
  const feedbackStyle = useMemo(
    () => [styles.feedback, { color: goalReached ? currentTheme.colors.success : currentTheme.colors.brandPrimary }],
    [goalReached, currentTheme],
  );
  const hoursElapsed = fastingElapsedSeconds / 3600;
  const autophagyProgress = Math.min(1, Math.max(0, (hoursElapsed - 16) / 12));
  const autophagyPercent = Math.round(autophagyProgress * 100);
  const metabolicStateKey = (() => {
    if (hoursElapsed < 4) return 'fed';
    if (hoursElapsed < 8) return 'early';
    if (hoursElapsed < 12) return 'fatBurning';
    if (hoursElapsed < 24) return 'autophagyActive';
    return 'deepAutophagy';
  })();
  const metabolicState = t(`home.metabolicState.${metabolicStateKey}`, 'Metabolic state');

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{t('fastingSummary.title', 'Fasting')}</Text>
      <View style={styles.centerBlock}>
        <Text style={styles.elapsedText}>{formatTimeHM(fastingElapsedSeconds)}</Text>
        <Text style={styles.caption}>{t('fastingSummary.elapsed', 'Elapsed')}</Text>
        <View style={styles.progressTrack}>
          <View style={progressFillStyle} />
        </View>
        <Text style={styles.caption}>
          {goalReached ? (
            <Text style={styles.goalReached}>
              <Text style={styles.goalIcon}>🎉</Text> {t('fastingSummary.goalReached', 'Goal reached!')}
            </Text>
          ) : (
            t('fastingSummary.remaining', '{remaining} remaining', { remaining: remainingLabel })
          )}
        </Text>
        <Text style={feedbackStyle}>
          {goalReached ? t('fastingSummary.feedbackDone', 'You did it!') : t('fastingSummary.feedbackKeepGoing', 'Keep going!')}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{metabolicState}</Text>
        </View>
        <View style={styles.autophagyBlock}>
          <Text style={styles.autophagyLabel}>{t('fastingSummary.autophagyLabel', 'Autophagy activation')}</Text>
          <View style={styles.autophagyTrack}>
            <View style={[styles.autophagyFill, { width: `${autophagyPercent}%` }]} />
          </View>
          <Text style={styles.autophagyMeta}>
            {autophagyPercent >= 100
              ? t('fastingSummary.autophagyComplete', 'Deep autophagy engaged')
              : autophagyPercent > 0
              ? t('fastingSummary.autophagyTime', '{hours}h to full activation', {
                  hours: Math.max(0, 28 - hoursElapsed).toFixed(1),
                })
              : t('fastingSummary.autophagyStart', 'Starts around the 16h mark')}
          </Text>
        </View>
        {hasOngoingFast && onEditStart ? (
          <Button
            label={t('fastingSummary.editStart', 'Edit start time')}
            size="sm"
            variant="secondary"
            onPress={onEditStart}
            style={styles.editStartButton}
          />
        ) : null}
      </View>
      <View style={styles.centerBlock}>
        <Text style={styles.challengeText}>
          {t('fastingSummary.nextChallengePrefix', 'Next Challenge:')}{' '}
          <Text style={styles.challengeHighlight}>{durationLabel}</Text>
        </Text>
      </View>
      <Pressable
        onPress={() => setShowDetails(prev => !prev)}
        style={styles.learnMore}
        accessibilityLabel={showDetails ? t('fastingSummary.accessibilityHide', 'Hide fasting details') : t('fastingSummary.accessibilityShow', 'Show fasting details')}
      >
        <Text style={styles.learnMoreText}>
          {showDetails ? t('fastingSummary.hideDetails', 'Hide details') : t('fastingSummary.learnMore', 'Learn more')}
        </Text>
      </Pressable>
      {showDetails && (
        <View style={styles.details}>
          {!!reason && (
            <Text style={styles.detailLine}>
              <Text style={styles.detailLabel}>{t('fastingSummary.detailRecommendation', 'Recommendation:')}</Text> {reason}
            </Text>
          )}
          {!!benefits && (
            <Text style={styles.detailLine}>
              <Text style={styles.detailLabel}>{t('fastingSummary.detailBenefits', 'Benefits:')}</Text> {benefits}
            </Text>
          )}
          {!!whatToExpect && (
            <Text style={styles.detailLine}>
              <Text style={styles.detailLabel}>{t('fastingSummary.detailExpect', 'What to expect:')}</Text> {whatToExpect}
            </Text>
          )}
          {!!planNextMsg && <Text style={styles.detailLine}>{planNextMsg}</Text>}
          {!!challengeMsg && <Text style={[styles.detailLine, styles.challengeNote]}>{challengeMsg}</Text>}
          {caution && <Text style={[styles.detailLine, styles.caution]}>{t('fastingSummary.caution', 'Caution: Consider a shorter fast first.')}</Text>}
        </View>
      )}
    </Card>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    card: {
      marginBottom: currentTheme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.sm,
    },
    centerBlock: {
      alignItems: 'center',
      marginBottom: currentTheme.spacing.sm,
    },
    elapsedText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.brandPrimary,
    },
    caption: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.tiny,
    },
    progressTrack: {
      width: '100%',
      height: 18,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 9,
      marginVertical: currentTheme.spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.brandPrimary,
    },
    goalReached: {
      color: currentTheme.colors.success,
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
      marginTop: currentTheme.spacing.sm,
      backgroundColor: currentTheme.colors.surfacePrimary,
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.tiny,
      borderRadius: currentTheme.radius.pill,
    },
    badgeText: {
      fontSize: currentTheme.typography.sizes.caption,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.brandSecondary,
    },
    autophagyBlock: {
      marginTop: currentTheme.spacing.md,
      width: '100%',
      alignItems: 'flex-start',
      gap: currentTheme.spacing.tiny,
    },
    autophagyLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    autophagyTrack: {
      width: '100%',
      height: 10,
      backgroundColor: currentTheme.colors.surfaceMuted,
      borderRadius: currentTheme.radius.pill,
      overflow: 'hidden',
    },
    autophagyFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.brandPrimary,
      borderRadius: currentTheme.radius.pill,
    },
    autophagyMeta: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    editStartButton: {
      alignSelf: 'stretch',
      marginTop: currentTheme.spacing.sm,
    },
    challengeText: {
      fontSize: 16,
      color: currentTheme.colors.textPrimary,
      textAlign: 'center',
    },
    challengeHighlight: {
      fontWeight: 'bold',
      color: currentTheme.colors.brandPrimary,
    },
    reason: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
      textAlign: 'center',
    },
    learnMore: {
      backgroundColor: currentTheme.colors.surfaceMuted,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: currentTheme.radius.sm,
      alignSelf: 'center',
    },
    learnMoreText: {
      color: currentTheme.colors.brandSecondary,
      fontWeight: '600',
    },
    details: {
      marginTop: currentTheme.spacing.sm,
    },
    detailLine: {
      fontSize: 14,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.tiny,
    },
    detailLabel: {
      fontWeight: 'bold',
      color: currentTheme.colors.textPrimary,
    },
    challengeNote: {
      color: currentTheme.colors.brandHighlight,
    },
    caution: {
      color: currentTheme.colors.error,
      fontWeight: 'bold',
    },
  });
