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
}) {
  const notifications = [];
  const mealTypes = ['meal', 'animalMeat', 'carbMeal'];

  // 1. No meal in 24h
  const lastMeal = foodLog.find(entry => mealTypes.includes(entry.type));
  let noMeal24h = false;
  if (lastMeal?.time) {
    const lastMealTime = new Date(lastMeal.time).getTime();
    if (!Number.isNaN(lastMealTime)) {
      noMeal24h = Date.now() - lastMealTime > 24 * 3600 * 1000;
    } else {
      noMeal24h = true;
    }
  } else {
    noMeal24h = true;
  }
  const fastingCardSuppressed = Boolean(fastingDismissedUntil && Date.now() < fastingDismissedUntil);
  if (noMeal24h && !fastingCardSuppressed) {
    notifications.push({
      key: 'no-meal',
      icon: 'alert',
      color: '#e74c3c',
      title: 'No meal logged in 24h',
      desc: 'You have not logged a meal in over 24 hours. Please log your meal for accurate tracking.',
      primaryAction: { type: 'modalAction', payload: 'logMeal' },
      secondaryAction: { type: 'snoozeFastingDismiss', hours: 6 },
    });
  }

  // 2. No symptoms logged today
  const todaysSymptoms = symptomLog.filter(entry => entry.time?.slice(0, 10) === today);
  if (todaysSymptoms.length === 0) {
    notifications.push({
      key: 'no-symptom',
      icon: 'stethoscope',
      color: '#f7b731',
      title: 'No symptoms logged today',
      desc: 'You have not logged any symptoms today. Logging symptoms helps track your progress.',
      primaryAction: { type: 'modalAction', payload: 'logSymptom' },
    });
  }

  // 3. Next autophagy challenge
  if (nextChallenge) {
    notifications.push({
      key: 'autophagy-challenge',
      icon: 'bacteria',
      color: '#6bb3b6',
      title: 'Next Autophagy Challenge',
      desc: `Your next challenge: ${nextChallenge}h fast (${currentLevel || 'Current'} level).`,
      primaryAction: { type: 'modalAction', payload: 'logFast' },
    });
  }

  // 4. Fasting streak
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
      color: '#89ce00',
      title: 'Fasting Streak',
      desc: `You are on a ${fastingStreak}-day fasting streak!`,
    });
  }

  // 5. Longest fast
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
      color: '#6bb3b6',
      title: 'Longest Fast',
      desc: `Your longest fast is ${Math.round(longestFastHours)} hours.`,
    });
  }

  // 6. Meal logging streak
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
      color: '#89ce00',
      title: 'Meal Logging Streak',
      desc: `You have logged meals for ${mealStreak} days in a row!`,
    });
  }

  // 7. Symptom logging streak
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
      color: '#ffd700',
      title: 'Symptom Logging Achievement',
      desc: `You have logged symptoms for ${symptomStreak} days in a row!`,
    });
  }

  // 8. Daily recommendations (meditation, exercise, hydration)
  const recommendations = [
    {
      key: 'rec-meditation',
      doneKey: `meditation-${today}`,
      icon: 'meditation',
      color: '#b3c7f7',
      title: 'Try a meditation session',
      desc: 'Take a few minutes to relax and meditate today.',
    },
    {
      key: 'rec-exercise',
      doneKey: `exercise-${today}`,
      icon: 'walk',
      color: '#b3c7f7',
      title: 'Do gentle exercise',
      desc: 'A short walk or stretching can help.',
    },
    {
      key: 'rec-hydration',
      doneKey: `hydration-${today}`,
      icon: 'water',
      color: '#b3c7f7',
      title: 'Drink water',
      desc: 'Stay hydrated throughout the day.',
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

  // 9. Unified fast recommendation (if not dismissed)
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

  return notifications;
}
