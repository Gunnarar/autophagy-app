import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { loadString, saveString } from '../utils/storage';
import NotificationList from '../components/NotificationList';
import AutophagyLevelCard from '../components/AutophagyLevelCard';
import { createInfoNotifications } from '../utils/notifications';
import { Card } from '../components/ui/Card';
import { theme } from '../utils/theme';

function resolvePrimaryLabel(action) {
  if (!action) return undefined;
  if (action.type === 'modalAction') {
    switch (action.payload) {
      case 'logMeal':
        return 'Log Meal';
      case 'logSymptom':
        return 'Log Symptom';
      case 'logFast':
        return 'Start Fast';
      default:
        return 'Open';
    }
  }
  if (action.type === 'markDone') {
    return 'Mark as done';
  }
  return undefined;
}

function resolveSecondaryLabel(action) {
  if (!action) return undefined;
  if (action.type === 'snoozeFastingDismiss') {
    return "I'm still fasting";
  }
  return undefined;
}

export default function InfoScreen() {
  const { foodLog, symptomLog, fastLog, useAutophagyStatus, useUnifiedFastRecommendation } = useLogs();
  const autophagyStatus = useAutophagyStatus();
  const { nextChallenge, currentLevel } = autophagyStatus;
  const { triggerModalAction } = useModalAction();
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState({});
  const [fastingDismissedUntil, setFastingDismissedUntil] = useState(null);
  const unifiedRec = useUnifiedFastRecommendation();
  const [fastRecDismissed, setFastRecDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const todayKey = new Date().toISOString().slice(0, 10);
      const dismissed = await loadString('fastRecDismissed');
      setFastRecDismissed(dismissed === todayKey);
    })();
  }, []);

  const handleDismissFastRec = async () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    await saveString('fastRecDismissed', todayKey);
    setFastRecDismissed(true);
  };

  // Notification logic
  const baseNotifications = createInfoNotifications({
    foodLog,
    symptomLog,
    fastLog,
    nextChallenge,
    currentLevel,
    unifiedRec,
    today,
    fastingDismissedUntil,
    done,
    fastRecDismissed,
  });

  const notifications = baseNotifications.map(item => {
    const notification = { ...item };
    if (item.primaryAction) {
      notification.action = () => {
        switch (item.primaryAction.type) {
          case 'modalAction':
            triggerModalAction(item.primaryAction.payload);
            break;
          case 'markDone':
            setDone(prev => ({ ...prev, [item.primaryAction.doneKey]: true }));
            break;
          default:
            break;
        }
      };
      notification.actionLabel = resolvePrimaryLabel(item.primaryAction);
    }

    if (item.secondaryAction) {
      notification.secondaryAction = () => {
        if (item.secondaryAction.type === 'snoozeFastingDismiss') {
          const { hours } = item.secondaryAction;
          setFastingDismissedUntil(Date.now() + hours * 3600 * 1000);
        }
      };
      notification.secondaryLabel = resolveSecondaryLabel(item.secondaryAction);
    }

    return notification;
  });

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Card variant="tinted" style={styles.heroCard}>
          <Text style={styles.overline}>Insights</Text>
          <Text style={styles.title}>Keep building momentum</Text>
          <Text style={styles.subtitle}>
            {unifiedRec.reason || 'Track meals, symptoms, and ketones to understand how fasting shapes your day.'}
          </Text>
          <View style={styles.heroMeta}>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Current level:</Text> {currentLevel || 'Getting started'}
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Next challenge:</Text>{' '}
              {nextChallenge ? `${nextChallenge}h fast` : 'Complete your first fast'}
            </Text>
          </View>
        </Card>

        <AutophagyLevelCard status={autophagyStatus} />

        <Card variant="outline" style={styles.notificationsCard}>
          <Text style={styles.sectionTitle}>Updates & reminders</Text>
          <NotificationList
            notifications={notifications}
            onDismiss={handleDismissFastRec}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  heroCard: {
    marginBottom: theme.spacing.lg,
  },
  overline: {
    fontSize: theme.typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  heroMeta: {
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.tiny,
  },
  metaItem: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  metaLabel: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  notificationsCard: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.xs,
  },
});
