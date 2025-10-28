import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { loadString, saveString } from '../utils/storage';
import NotificationList from '../components/NotificationList';
import { createInfoNotifications } from '../utils/notifications';

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
  const { nextChallenge, currentLevel } = useAutophagyStatus();
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
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <Text style={styles.welcome}>Welcome to Genesis4PD!</Text>
          <Text style={styles.desc}>Track your progress, learn about fasting, and get the most out of your program.</Text>
        </View>
        <NotificationList
          notifications={notifications}
          onDismiss={handleDismissFastRec}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerBox: { alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#2d4d4d', marginBottom: 4 },
  desc: { fontSize: 16, color: '#4d6d6d', textAlign: 'center' },
});
