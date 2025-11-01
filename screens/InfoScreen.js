import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { loadString, saveString, loadJSON, saveJSON } from '../utils/storage';
import NotificationList from '../components/NotificationList';
import AutophagyLevelCard from '../components/AutophagyLevelCard';
import { createInfoNotifications } from '../utils/notifications';
import { Card } from '../components/ui/Card';
import { useTheme, useThemedStyles } from '../utils/theme';
import { useTranslation } from '../contexts/LocalizationContext';

function resolvePrimaryLabel(action, t) {
  if (!action) return undefined;
  if (action.type === 'modalAction') {
    switch (action.payload) {
      case 'logMeal':
        return t('info.actions.logMeal', 'Log Meal');
      case 'logSymptom':
        return t('info.actions.logSymptom', 'Log Symptom');
      case 'logFast':
        return t('info.actions.startFast', 'Start Fast');
      default:
        return t('info.actions.open', 'Open');
    }
  }
  if (action.type === 'markDone') {
    return t('info.actions.markDone', 'Mark as done');
  }
  return undefined;
}

function resolveSecondaryLabel(action, t) {
  if (!action) return undefined;
  if (action.type === 'snoozeFastingDismiss') {
    return t('info.actions.stillFasting', "I'm still fasting");
  }
  return undefined;
}

export default function InfoScreen() {
  const { foodLog, symptomLog, fastLog, useAutophagyStatus, useUnifiedFastRecommendation } = useLogs();
  const { t } = useTranslation();
  const autophagyStatus = useAutophagyStatus();
  const { nextChallenge, currentLevel } = autophagyStatus;
  const { triggerModalAction } = useModalAction();
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState({});
  const [fastingDismissedUntil, setFastingDismissedUntil] = useState(null);
  const [notificationPrefsHydrated, setNotificationPrefsHydrated] = useState(false);
  const unifiedRec = useUnifiedFastRecommendation(t);
  const [fastRecDismissed, setFastRecDismissed] = useState(false);
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    (async () => {
      const todayKey = new Date().toISOString().slice(0, 10);
      const dismissed = await loadString('fastRecDismissed');
      setFastRecDismissed(dismissed === todayKey);

      const storedDone = await loadJSON('notificationDone', {});
      if (storedDone && typeof storedDone === 'object') {
        setDone(storedDone);
      }

      const storedSnooze = await loadJSON('notificationFastingDismissedUntil', null);
      if (typeof storedSnooze === 'number') {
        setFastingDismissedUntil(storedSnooze);
      }

      setNotificationPrefsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!notificationPrefsHydrated) {return;}
    saveJSON('notificationDone', done);
  }, [done, notificationPrefsHydrated]);

  useEffect(() => {
    if (!notificationPrefsHydrated) {return;}
    saveJSON('notificationFastingDismissedUntil', fastingDismissedUntil);
  }, [fastingDismissedUntil, notificationPrefsHydrated]);

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
    theme: currentTheme,
    translate: t,
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
      notification.actionLabel = resolvePrimaryLabel(item.primaryAction, t);
    }

    if (item.secondaryAction) {
      notification.secondaryAction = () => {
        if (item.secondaryAction.type === 'snoozeFastingDismiss') {
          const { hours } = item.secondaryAction;
          setFastingDismissedUntil(Date.now() + hours * 3600 * 1000);
        }
      };
      notification.secondaryLabel = resolveSecondaryLabel(item.secondaryAction, t);
    }

    return notification;
  });

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Card variant="tinted" style={styles.heroCard}>
          <Text style={styles.overline}>{t('info.hero.overline', 'Insights')}</Text>
          <Text style={styles.title}>{t('info.hero.title', 'Keep building momentum')}</Text>
          <Text style={styles.subtitle}>
            {unifiedRec.reason || t('info.hero.subtitle', 'Track meals, symptoms, and ketones to understand how fasting shapes your day.')}
          </Text>
          <View style={styles.heroMeta}>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t('info.hero.currentLevel', 'Current level:')}</Text> {currentLevel || t('info.hero.gettingStarted', 'Getting started')}
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t('info.hero.nextChallenge', 'Next challenge:')}</Text>{' '}
              {nextChallenge ? t('info.hero.nextChallengeValue', '{hours}h fast', { hours: nextChallenge }) : t('info.hero.nextChallengeFallback', 'Complete your first fast')}
            </Text>
          </View>
        </Card>

        <AutophagyLevelCard status={autophagyStatus} />

        <Card variant="outline" style={styles.notificationsCard}>
          <Text style={styles.sectionTitle}>{t('info.notifications.title', 'Updates & reminders')}</Text>
          <NotificationList
            notifications={notifications}
            onDismiss={handleDismissFastRec}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: currentTheme.spacing.lg,
      paddingBottom: currentTheme.spacing.xl,
      paddingTop: currentTheme.spacing.lg,
    },
    heroCard: {
      marginBottom: currentTheme.spacing.lg,
    },
    overline: {
      fontSize: currentTheme.typography.sizes.caption,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.tiny,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.xs,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.md,
    },
    heroMeta: {
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderRadius: currentTheme.radius.md,
      padding: currentTheme.spacing.md,
      gap: currentTheme.spacing.tiny,
    },
    metaItem: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    metaLabel: {
      color: currentTheme.colors.textPrimary,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    notificationsCard: {
      paddingVertical: currentTheme.spacing.md,
      paddingHorizontal: currentTheme.spacing.md,
      marginBottom: currentTheme.spacing.xl,
    },
    sectionTitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: currentTheme.spacing.xs,
    },
  });
