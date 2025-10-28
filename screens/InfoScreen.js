import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { loadString, saveString } from '../utils/storage';
import NotificationList from '../components/NotificationList';

export default function InfoScreen({ navigation }) {
  const { foodLog, symptomLog, fastLog, useAutophagyStatus, useUnifiedFastRecommendation } = useLogs();
  const { nextChallenge, currentLevel } = useAutophagyStatus();
  const { triggerModalAction } = useModalAction();
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState({});
  const mealTypes = ['meal', 'animalMeat', 'carbMeal'];
  const todaysMeals = foodLog.filter(e => mealTypes.includes(e.type) && e.time && e.time.slice(0, 10) === today);
  const todaysSymptoms = symptomLog.filter(e => e.time && e.time.slice(0, 10) === today);
  const [fastingDismissedUntil, setFastingDismissedUntil] = useState(null);
  const unifiedRec = useUnifiedFastRecommendation();
  const [fastRecDismissed, setFastRecDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const dismissed = await loadString('fastRecDismissed');
      setFastRecDismissed(dismissed === today);
    })();
  }, []);

  const handleDismissFastRec = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await saveString('fastRecDismissed', today);
    setFastRecDismissed(true);
  };

  // Notification logic
  const notifications = [];

  // 1. No meal in 24h
  const lastMeal = foodLog.find(e => mealTypes.includes(e.type));
  let noMeal24h = false;
  if (lastMeal) {
    const lastMealTime = new Date(lastMeal.time);
    noMeal24h = (Date.now() - lastMealTime.getTime()) > 24 * 3600 * 1000;
  } else {
    noMeal24h = true;
  }
  const now = Date.now();
  const fastingCardSuppressed = fastingDismissedUntil && now < fastingDismissedUntil;
  if (noMeal24h && !fastingCardSuppressed) {
    notifications.push({
      key: 'no-meal',
      icon: 'alert',
      color: '#e74c3c',
      title: 'No meal logged in 24h',
      desc: 'You have not logged a meal in over 24 hours. Please log your meal for accurate tracking.',
      action: () => triggerModalAction('logMeal'),
      actionLabel: 'Log Meal',
      secondaryAction: () => setFastingDismissedUntil(Date.now() + 6 * 3600 * 1000),
      secondaryLabel: "I'm still fasting",
    });
  }

  // 2. No symptoms logged today
  if (todaysSymptoms.length === 0) {
    notifications.push({
      key: 'no-symptom',
      icon: 'stethoscope',
      color: '#f7b731',
      title: 'No symptoms logged today',
      desc: 'You have not logged any symptoms today. Logging symptoms helps track your progress.',
      action: () => triggerModalAction('logSymptom'),
      actionLabel: 'Log Symptom',
    });
  }

  // 3. Next autophagy challenge
  if (nextChallenge) {
    notifications.push({
      key: 'autophagy-challenge',
      icon: 'bacteria',
      color: '#6bb3b6',
      title: 'Next Autophagy Challenge',
      desc: `Your next challenge: ${nextChallenge}h fast (${currentLevel} level).`,
      action: () => triggerModalAction('logFast'),
      actionLabel: 'Start Fast',
    });
  }

  // 4. Streaks/achievements
  // Fasting streak
  let fastingStreak = 0;
  const fastsByDay = fastLog.reduce((acc, entry) => {
    const start = new Date(entry.start);
    const end = new Date(entry.end);
    const duration = (end - start) / 1000;
    if (duration >= 16 * 3600) {
      const day = end.toISOString().slice(0, 10);
      acc[day] = true;
    }
    return acc;
  }, {});
  let d = new Date();
  for (let i = 0; i < 30; i++) {
    const dayStr = d.toISOString().slice(0, 10);
    if (fastsByDay[dayStr]) {
      fastingStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  if (fastingStreak >= 3) {
    notifications.push({
      key: 'fasting-streak',
      icon: 'fire',
      color: '#89ce00',
      title: 'Fasting Streak',
      desc: `You are on a ${fastingStreak}-day fasting streak!`,
      action: null,
      actionLabel: null,
    });
  }
  // Longest fast
  const longest = fastLog.reduce((max, entry) => {
    const start = new Date(entry.start);
    const end = new Date(entry.end);
    const duration = (end - start) / 3600000;
    return Math.max(max, duration);
  }, 0);
  if (longest >= 24) {
    notifications.push({
      key: 'longest-fast',
      icon: 'timer-sand',
      color: '#6bb3b6',
      title: 'Longest Fast',
      desc: `Your longest fast is ${Math.round(longest)} hours.`,
      action: null,
      actionLabel: null,
    });
  }
  // Meals streak
  let mealStreak = 0;
  d = new Date();
  for (let i = 0; i < 30; i++) {
    const dayStr = d.toISOString().slice(0, 10);
    if (foodLog.some(e => mealTypes.includes(e.type) && e.time && e.time.slice(0, 10) === dayStr)) {
      mealStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  if (mealStreak >= 3) {
    notifications.push({
      key: 'meal-streak',
      icon: 'food',
      color: '#89ce00',
      title: 'Meal Logging Streak',
      desc: `You have logged meals for ${mealStreak} days in a row!`,
      action: null,
      actionLabel: null,
    });
  }
  // Symptom logging achievement
  let symptomStreak = 0;
  d = new Date();
  for (let i = 0; i < 30; i++) {
    const dayStr = d.toISOString().slice(0, 10);
    if (symptomLog.some(e => e.time && e.time.slice(0, 10) === dayStr)) {
      symptomStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  if (symptomStreak >= 3) {
    notifications.push({
      key: 'symptom-streak',
      icon: 'star',
      color: '#ffd700',
      title: 'Symptom Logging Achievement',
      desc: `You have logged symptoms for ${symptomStreak} days in a row!`,
      action: null,
      actionLabel: null,
    });
  }

  // 5. Recommendations (only if not done today)
  if (!done[`meditation-${today}`]) {
    notifications.push({
      key: 'rec-meditation',
      icon: 'meditation',
      color: '#b3c7f7',
      title: 'Try a meditation session',
      desc: 'Take a few minutes to relax and meditate today.',
      action: () => setDone({ ...done, [`meditation-${today}`]: true }),
      actionLabel: 'Mark as done',
    });
  }
  if (!done[`exercise-${today}`]) {
    notifications.push({
      key: 'rec-exercise',
      icon: 'walk',
      color: '#b3c7f7',
      title: 'Do gentle exercise',
      desc: 'A short walk or stretching can help.',
      action: () => setDone({ ...done, [`exercise-${today}`]: true }),
      actionLabel: 'Mark as done',
    });
  }
  if (!done[`hydration-${today}`]) {
    notifications.push({
      key: 'rec-hydration',
      icon: 'water',
      color: '#b3c7f7',
      title: 'Drink water',
      desc: 'Stay hydrated throughout the day.',
      action: () => setDone({ ...done, [`hydration-${today}`]: true }),
      actionLabel: 'Mark as done',
    });
  }

  // 6. Unified Fast Recommendation (show only if not dismissed)
  if (unifiedRec && !fastRecDismissed) {
    notifications.unshift({
      key: 'unified-fast-recommendation',
      icon: 'timer-sand',
      color: unifiedRec.caution ? '#e74c3c' : '#89ce00',
      title: `Next Recommended Fast: ${unifiedRec.recommendedProgram.duration}h`,
      desc: unifiedRec.reason,
      benefits: unifiedRec.benefits,
      whatToExpect: unifiedRec.whatToExpect,
      challengeMsg: unifiedRec.challengeMsg,
      caution: unifiedRec.caution,
      dismissible: true,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
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
  headerBox: { alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#2d4d4d', marginBottom: 4 },
  desc: { fontSize: 16, color: '#4d6d6d', textAlign: 'center' },
});
