import { AUTOPHAGY_LEVELS } from './constants';

export const FASTING_PROGRAMS = [
  { key: '24h', duration: 24, benefits: 'Initiates autophagy, supports metabolic reset, may improve insulin sensitivity.' },
  { key: '36h', duration: 36, benefits: 'Deeper autophagy, increased fat burning, possible stem cell activation.' },
  { key: '48h', duration: 48, benefits: 'Significant autophagy, immune system renewal, deeper cellular cleanup.' },
  { key: '72h', duration: 72, benefits: 'Deep autophagy, maximum cellular renewal, may support neurological health.' },
  { key: '96h', duration: 96, benefits: 'Extended autophagy, advanced metabolic and neurological benefits.' },
  { key: '120h', duration: 120, benefits: 'Profound autophagy, possible stem cell regeneration, advanced healing.' },
  { key: '144h', duration: 144, benefits: 'Sustained autophagy, deep tissue repair, advanced metabolic adaptation.' },
  { key: '168h', duration: 168, benefits: 'Maximum autophagy, full system reset, consult medical supervision.' },
];

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

export function inferFastsFromFoodLog(foodLog = []) {
  if (!Array.isArray(foodLog)) {return [];}
  const sorted = [...foodLog]
    .filter(entry => entry?.time)
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  const fasts = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const start = new Date(prev.time);
    const end = new Date(curr.time);
    const durationHrs = (end - start) / 3600000;
    if (durationHrs >= 24) {
      fasts.push({
        id: `inferred-${prev.id || i - 1}-${curr.id || i}`,
        start: start.toISOString(),
        end: end.toISOString(),
        method: 'inferred',
        breakType: curr.type,
        note: '',
      });
    }
  }
  return fasts;
}

export function getUnifiedFastRecommendation(fastLog = [], foodLog = [], symptomLog = [], autophagyStatus = null) {
  const now = new Date();
  const RECENT_DAYS = 60;
  const CARB_MEAL_WINDOW_DAYS = 7;
  const CARB_MEAL_LIMIT = 2;
  const ANIMAL_MEAL_MIN = 3;
  const REFEED_DAYS = 5;
  const PROLONGED_FAST_HOURS = 48;

  const lastCompleted = {};
  for (const prog of FASTING_PROGRAMS) {
    const fasts = fastLog.filter(f => {
      if (!f?.start || !f?.end) {return false;}
      const start = new Date(f.start);
      const end = new Date(f.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {return false;}
      const duration = (end - start) / 3600000;
      return duration >= prog.duration;
    });
    if (fasts.length > 0) {
      lastCompleted[prog.key] = fasts
        .map(f => new Date(f.end))
        .filter(date => !Number.isNaN(date.getTime()))
        .sort((a, b) => b - a)[0];
    }
  }

  let recommended = FASTING_PROGRAMS[0];
  for (let i = FASTING_PROGRAMS.length - 1; i > 0; i--) {
    const previousProgram = FASTING_PROGRAMS[i - 1];
    const last = lastCompleted[previousProgram.key];
    if (last && (now - last) / (1000 * 3600 * 24) <= RECENT_DAYS) {
      recommended = FASTING_PROGRAMS[i];
      break;
    }
  }

  const recentFoodEntries = Array.isArray(foodLog) ? foodLog.filter(e => e?.time) : [];
  const carbMeals = recentFoodEntries.filter(
    entry =>
      entry.isCarb &&
      (now - new Date(entry.time)) / (1000 * 3600 * 24) <= CARB_MEAL_WINDOW_DAYS
  ).length;
  const animalMeals = recentFoodEntries.filter(
    entry =>
      entry.type === 'animalMeat' &&
      (now - new Date(entry.time)) / (1000 * 3600 * 24) <= CARB_MEAL_WINDOW_DAYS
  ).length;

  let caution = false;
  let reason = `Based on your recent fasting history, we recommend a ${recommended.duration}h fast.`;
  let overrideTo24h = false;

  if (carbMeals > CARB_MEAL_LIMIT) {
    recommended = FASTING_PROGRAMS[0];
    reason = "You've had several carb meals recently. Start with a 24h fast to reset.";
    caution = true;
    overrideTo24h = true;
  }

  if (!overrideTo24h && recommended.duration > 24 && animalMeals < ANIMAL_MEAL_MIN) {
    recommended = FASTING_PROGRAMS[0];
    reason = 'We recommend a 24h fast. For multi-day fasts, ensure at least 3 animal-based meals in the week prior.';
    caution = true;
  }

  const prolongedFasts = fastLog
    .filter(f => {
      if (!f?.start || !f?.end) {return false;}
      const start = new Date(f.start);
      const end = new Date(f.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {return false;}
      const duration = (end - start) / 3600000;
      return duration >= PROLONGED_FAST_HOURS;
    })
    .sort((a, b) => new Date(b.end) - new Date(a.end));

  if (!overrideTo24h && prolongedFasts.length > 0) {
    const lastProlongedEnd = new Date(prolongedFasts[0].end);
    if (!Number.isNaN(lastProlongedEnd.getTime())) {
      const daysSinceLastProlonged = (now - lastProlongedEnd) / (1000 * 3600 * 24);
      if (daysSinceLastProlonged < REFEED_DAYS && recommended.duration >= PROLONGED_FAST_HOURS) {
        recommended = FASTING_PROGRAMS[0];
        reason = `You recently completed a prolonged fast. Allow at least ${REFEED_DAYS} days of refeed (normal eating) before attempting another prolonged fast.`;
        caution = true;
      }
    }
  }

  const fastingNow = (() => {
    if (!recentFoodEntries.length) {return false;}
    const lastMeal = new Date(recentFoodEntries[0].time);
    return (now - lastMeal) / (1000 * 3600) >= 16;
  })();

  let whatToExpect = 'Expect to feel hungry in the first 12-24h, then possibly more energy and mental clarity as your body adapts.';
  if (fastingNow) {
    if (recommended.duration >= 48) {
      whatToExpect = 'You may feel increased mental clarity, mild fatigue, or hunger. Deep autophagy and immune renewal are likely active.';
    } else if (recommended.duration >= 36) {
      whatToExpect = 'You may notice fat burning, improved focus, and mild hunger. Autophagy is ramping up.';
    } else {
      whatToExpect = 'You may feel hungry or energized. Autophagy is likely starting.';
    }
  }

  const recentSymptoms = Array.isArray(symptomLog)
    ? symptomLog.filter(entry => entry?.time && (now - new Date(entry.time)) / (1000 * 3600 * 24) < 2)
    : [];
  if (recentSymptoms.length > 0) {
    whatToExpect += ' Monitor your symptoms closely and break your fast if you feel unwell.';
  }

  const nextChallenge = autophagyStatus?.nextChallenge;
  let challengeMsg = '';
  if (nextChallenge && recommended.duration < nextChallenge) {
    challengeMsg = `Your next autophagy challenge is a ${nextChallenge}h fast. Completing the recommended fast will help you progress!`;
  } else if (nextChallenge && recommended.duration === nextChallenge) {
    challengeMsg = 'This fast is your next autophagy challenge! Completing it will unlock a new level.';
  }

  let planNextMsg = '';
  if (!caution && recommended.duration > 24) {
    planNextMsg = 'Tip: For best results, plan your next multi-day fast soon after completing this one, while your diet is still supportive.';
  }

  return {
    recommendedProgram: recommended,
    reason,
    caution,
    benefits: recommended.benefits,
    whatToExpect,
    challengeMsg,
    planNextMsg,
  };
}

export function calculateAutophagyProgress(fastLog = [], now = new Date()) {
  const completed = {};
  const monthKey = getCurrentMonthKey(now);
  let monthHours = 0;
  const completedFasts = new Set();

  (Array.isArray(fastLog) ? fastLog : []).forEach(entry => {
    if (!entry?.start || !entry?.end) {return;}
    const start = new Date(entry.start);
    const end = new Date(entry.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {return;}

    const durationHrs = (end - start) / 3600000;
    if (durationHrs < 24) {return;}

    if (start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth()) {
      monthHours += durationHrs;
    }

    FASTING_PROGRAMS.forEach(program => {
      if (durationHrs >= program.duration) {
        completedFasts.add(program.key);
      }
    });

    for (const level of AUTOPHAGY_LEVELS) {
      for (const ch of level.challenges) {
        if (durationHrs >= ch) {
          if (!completed[level.name]) {completed[level.name] = [];}
          if (!completed[level.name].includes(ch)) {
            completed[level.name].push(ch);
          }
        }
      }
    }
  });

  Object.keys(completed).forEach(level => {
    completed[level].sort((a, b) => a - b);
  });

  return {
    completed,
    monthly: { [monthKey]: monthHours },
    completedFasts: Array.from(completedFasts).sort(),
  };
}

export function getAutophagyStatus(progress = { completed: {}, monthly: {} }, now = new Date()) {
  const { completed = {}, monthly = {} } = progress || {};
  let currentLevel = null;
  let nextChallenge = null;

  for (const level of AUTOPHAGY_LEVELS) {
    const done = completed[level.name] || [];
    if (done.length < level.challenges.length) {
      currentLevel = level.name;
      nextChallenge = level.challenges[done.length];
      break;
    }
  }

  if (!currentLevel) {
    currentLevel = 'Master';
    nextChallenge = null;
  }

  const monthKey = getCurrentMonthKey(now);
  const monthlyDays = Math.floor((monthly[monthKey] || 0) / 24);

  return { currentLevel, nextChallenge, monthlyDays, completed };
}
