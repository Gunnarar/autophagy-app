import { lightTheme } from './theme';

export function createInfoNotifications({
  foodLog = [],
  symptomLog = [],
  fastLog = [],
  nextChallenge,
  currentLevel,
  unifiedRec,
  today = new Date().toISOString().slice(0, 10),
  fastingDismissedUntil = null,
  done = {},
  fastRecDismissed = false,
  theme = lightTheme,
  translate,
}) {
  const t = typeof translate === 'function' ? translate : ((key, fallback) => fallback);
  const notifications = [];
  const ongoingFast = fastLog.find(entry => !entry.end);
  const mealTypes = ['meal', 'animalMeat', 'carbMeal'];

  const lastMeal = foodLog.find(entry => mealTypes.includes(entry.type));
  let noMeal24h = false;
  if (lastMeal?.time) {
    const lastMealTime = new Date(lastMeal.time).getTime();
    noMeal24h = Number.isNaN(lastMealTime) ? true : Date.now() - lastMealTime > 24 * 3600 * 1000;
  } else {
    noMeal24h = true;
  }

  const fastingCardSuppressed = Boolean(fastingDismissedUntil && Date.now() < fastingDismissedUntil);
  if (noMeal24h && !fastingCardSuppressed) {
    notifications.push({
      key: 'no-meal',
      icon: 'alert',
      color: theme.colors.error,
      title: t('info.notifications.noMealTitle', 'No meal logged in 24h'),
      desc: t('info.notifications.noMealDesc', 'You have not logged a meal in over 24 hours. Please log your meal for accurate tracking.'),
      primaryAction: { type: 'modalAction', payload: 'logMeal' },
      secondaryAction: { type: 'snoozeFastingDismiss', hours: 6 },
    });
  }

  const todaysSymptoms = symptomLog.filter(entry => entry.time?.slice(0, 10) === today);
  if (todaysSymptoms.length === 0) {
    notifications.push({
      key: 'no-symptom',
      icon: 'stethoscope',
      color: theme.colors.warning,
      title: t('info.notifications.noSymptomTitle', 'No symptoms logged today'),
      desc: t('info.notifications.noSymptomDesc', 'You have not logged any symptoms today. Logging symptoms helps track your progress.'),
      primaryAction: { type: 'modalAction', payload: 'logSymptom' },
    });
  }

  const includeUnifiedRec = Boolean(unifiedRec && !fastRecDismissed);
  if (nextChallenge) {
    const showAutophagyChallenge = ongoingFast ? true : !includeUnifiedRec;
    if (showAutophagyChallenge && ongoingFast?.start) {
      const start = new Date(ongoingFast.start);
      const elapsedMs = Date.now() - start.getTime();
      const elapsedHours = elapsedMs > 0 ? (elapsedMs / 3600000).toFixed(1) : '0.0';
      notifications.push({
        key: 'autophagy-challenge',
        icon: 'bacteria',
        color: theme.colors.info,
        title: t('info.notifications.autophagyActiveTitle', 'Autophagy Challenge'),
        desc: t('info.notifications.autophagyActiveDesc', 'Current fast: {elapsed}h elapsed. Next milestone {target}h.', {
          elapsed: elapsedHours,
          target: nextChallenge,
        }),
      });
    } else if (showAutophagyChallenge) {
      notifications.push({
        key: 'autophagy-challenge',
        icon: 'bacteria',
        color: theme.colors.info,
        title: t('info.notifications.autophagyNextTitle', 'Next Autophagy Challenge'),
        desc: t('info.notifications.autophagyNextDesc', 'Your next challenge: {hours}h fast ({level} level).', {
          hours: nextChallenge,
          level: currentLevel || t('info.notifications.autophagyCurrentLevel', 'Current'),
        }),
        primaryAction: { type: 'modalAction', payload: 'logFast' },
      });
    }
  }

  const fastsByDay = fastLog.reduce((acc, entry) => {
    if (!entry.end || !entry.start) return acc;
    const start = new Date(entry.start);
    const end = new Date(entry.end);
    const durationSeconds = (end - start) / 1000;
    if (durationSeconds >= 16 * 3600) {
      const day = end.toISOString().slice(0, 10);
      acc[day] = true;
    }
    return acc;
  }, {});

  let streakDay = new Date();
  let fastingStreak = 0;
  for (let i = 0; i < 30; i += 1) {
    const dayStr = streakDay.toISOString().slice(0, 10);
    if (fastsByDay[dayStr]) {
      fastingStreak += 1;
      streakDay.setDate(streakDay.getDate() - 1);
    } else {
      break;
    }
  }

  if (fastingStreak >= 3) {
    notifications.push({
      key: 'fasting-streak',
      icon: 'fire',
      color: theme.colors.success,
      title: t('info.notifications.fastingStreakTitle', 'Fasting Streak'),
      desc: t('info.notifications.fastingStreakDesc', 'You are on a {days}-day fasting streak!', { days: fastingStreak }),
    });
  }

  const longestFastHours = fastLog.reduce((max, entry) => {
    if (!entry.start || !entry.end) return max;
    const start = new Date(entry.start);
    const end = new Date(entry.end);
    const duration = (end - start) / 3600000;
    return Math.max(max, duration);
  }, 0);
  if (longestFastHours >= 24) {
    notifications.push({
      key: 'longest-fast',
      icon: 'timer-sand',
      color: theme.colors.info,
      title: t('info.notifications.longestFastTitle', 'Longest Fast'),
      desc: t('info.notifications.longestFastDesc', 'Your longest fast is {hours} hours.', {
        hours: Math.round(longestFastHours),
      }),
    });
  }

  let mealStreak = 0;
  let mealDay = new Date();
  for (let i = 0; i < 30; i += 1) {
    const dayStr = mealDay.toISOString().slice(0, 10);
    if (foodLog.some(entry => mealTypes.includes(entry.type) && entry.time?.slice(0, 10) === dayStr)) {
      mealStreak += 1;
      mealDay.setDate(mealDay.getDate() - 1);
    } else {
      break;
    }
  }
  if (mealStreak >= 3) {
    notifications.push({
      key: 'meal-streak',
      icon: 'food',
      color: theme.colors.success,
      title: t('info.notifications.mealStreakTitle', 'Meal Logging Streak'),
      desc: t('info.notifications.mealStreakDesc', 'You have logged meals for {days} days in a row!', { days: mealStreak }),
    });
  }

  let symptomStreak = 0;
  let symptomDay = new Date();
  for (let i = 0; i < 30; i += 1) {
    const dayStr = symptomDay.toISOString().slice(0, 10);
    if (symptomLog.some(entry => entry.time?.slice(0, 10) === dayStr)) {
      symptomStreak += 1;
      symptomDay.setDate(symptomDay.getDate() - 1);
    } else {
      break;
    }
  }
  if (symptomStreak >= 3) {
    notifications.push({
      key: 'symptom-streak',
      icon: 'star',
      color: theme.colors.brandHighlight,
      title: t('info.notifications.symptomStreakTitle', 'Symptom Logging Achievement'),
      desc: t('info.notifications.symptomStreakDesc', 'You have logged symptoms for {days} days in a row!', { days: symptomStreak }),
    });
  }

  const recommendations = [
    {
      key: 'rec-meditation',
      doneKey: `meditation-${today}`,
      icon: 'meditation',
      color: theme.colors.info,
      title: t('info.notifications.meditationTitle', 'Try a meditation session'),
      desc: t('info.notifications.meditationDesc', 'Take a few minutes to relax and meditate today.'),
    },
    {
      key: 'rec-exercise',
      doneKey: `exercise-${today}`,
      icon: 'walk',
      color: theme.colors.info,
      title: t('info.notifications.exerciseTitle', 'Do gentle exercise'),
      desc: t('info.notifications.exerciseDesc', 'A short walk or stretching can help.'),
    },
    {
      key: 'rec-hydration',
      doneKey: `hydration-${today}`,
      icon: 'water',
      color: theme.colors.info,
      title: t('info.notifications.hydrationTitle', 'Drink water'),
      desc: t('info.notifications.hydrationDesc', 'Stay hydrated throughout the day.'),
    },
  ];

  recommendations.forEach(rec => {
    if (!done[rec.doneKey]) {
      notifications.push({
        key: rec.key,
        icon: rec.icon,
        color: rec.color,
        title: rec.title,
        desc: rec.desc,
        primaryAction: { type: 'markDone', doneKey: rec.doneKey },
      });
    }
  });

  if (includeUnifiedRec) {
    notifications.unshift({
      key: 'unified-fast-recommendation',
      icon: 'timer-sand',
      color: unifiedRec.caution ? theme.colors.error : theme.colors.success,
      title: t('info.notifications.fastingRecTitle', 'Next Recommended Fast: {hours}h', {
        hours: unifiedRec.recommendedProgram.duration,
      }),
      desc: unifiedRec.reason,
      benefits: unifiedRec.benefits,
      whatToExpect: unifiedRec.whatToExpect,
      challengeMsg: unifiedRec.challengeMsg,
      caution: unifiedRec.caution,
      dismissible: true,
    });
  }

  return notifications;
}
