import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import { differenceInCalendarMonths, parseISO } from 'date-fns';
import { useUser } from './UserContext';

const LogsContext = createContext();

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

function getChallengeForDuration(duration) {
  for (let i = 0; i < AUTOPHAGY_LEVELS.length; i++) {
    const level = AUTOPHAGY_LEVELS[i];
    for (let j = 0; j < level.challenges.length; j++) {
      if (duration >= level.challenges[j] * 3600 && duration < (level.challenges[j + 1] || Infinity) * 3600) {
        return { level: level.name, challenge: level.challenges[j] };
      }
    }
  }
  return null;
}

function inferFastsFromFoodLog(foodLog) {
  // Sort by time ascending
  const sorted = [...foodLog].filter(e => e.time).sort((a, b) => new Date(a.time) - new Date(b.time));
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

function getNextRecommendedFast(fastLog, foodLog) {
  const now = new Date();
  const RECENT_DAYS = 60; // 2 months
  const CARB_MEAL_WINDOW_DAYS = 7;
  const CARB_MEAL_LIMIT = 2;
  const programs = [
    { key: '24h', duration: 24 },
    { key: '36h', duration: 36 },
    { key: '48h', duration: 48 },
    { key: '72h', duration: 72 },
    { key: '96h', duration: 96 },
    { key: '120h', duration: 120 },
    { key: '144h', duration: 144 },
    { key: '168h', duration: 168 },
  ];
  // Find most recent completion for each program
  const lastCompleted = {};
  for (const prog of programs) {
    const fasts = fastLog.filter(f => {
      const start = new Date(f.start);
      const end = new Date(f.end);
      const duration = (end - start) / 3600000;
      return duration >= prog.duration;
    });
    if (fasts.length > 0) {
      lastCompleted[prog.key] = fasts
        .map(f => new Date(f.end))
        .sort((a, b) => b - a)[0];
    }
  }
  // Find the highest program completed recently
  let recommended = programs[0];
  for (let i = programs.length - 1; i > 0; i--) {
    const prog = programs[i - 1];
    const last = lastCompleted[prog.key];
    if (last && (now - last) / (1000 * 3600 * 24) <= RECENT_DAYS) {
      recommended = programs[i];
      break;
    }
  }
  // Check recent meal pattern (e.g., carb meals in last 7 days)
  const carbMeals = foodLog.filter(e => e.isCarb && (now - new Date(e.time)) / (1000 * 3600 * 24) <= CARB_MEAL_WINDOW_DAYS).length;
  if (carbMeals > CARB_MEAL_LIMIT) {
    return {
      recommendedProgram: programs[0], // 24h
      reason: "You've had several carb meals recently.",
      caution: true,
    };
  }
  return {
    recommendedProgram: recommended,
    reason: `Based on your recent fasting history, we recommend a ${recommended.duration}h fast.`,
    caution: false,
  };
}

function getUnifiedFastRecommendation(fastLog, foodLog, symptomLog, autophagyStatus) {
  const now = new Date();
  const RECENT_DAYS = 60; // 2 months
  const CARB_MEAL_WINDOW_DAYS = 7;
  const CARB_MEAL_LIMIT = 2;
  const ANIMAL_MEAL_MIN = 3; // Require at least 3 animal-based meals in last 7 days for multi-day fast
  const REFEED_DAYS = 5; // Minimum refeed period after prolonged fast
  const PROLONGED_FAST_HOURS = 48;
  const programs = [
    { key: '24h', duration: 24, benefits: 'Initiates autophagy, supports metabolic reset, may improve insulin sensitivity.' },
    { key: '36h', duration: 36, benefits: 'Deeper autophagy, increased fat burning, possible stem cell activation.' },
    { key: '48h', duration: 48, benefits: 'Significant autophagy, immune system renewal, deeper cellular cleanup.' },
    { key: '72h', duration: 72, benefits: 'Deep autophagy, maximum cellular renewal, may support neurological health.' },
    { key: '96h', duration: 96, benefits: 'Extended autophagy, advanced metabolic and neurological benefits.' },
    { key: '120h', duration: 120, benefits: 'Profound autophagy, possible stem cell regeneration, advanced healing.' },
    { key: '144h', duration: 144, benefits: 'Sustained autophagy, deep tissue repair, advanced metabolic adaptation.' },
    { key: '168h', duration: 168, benefits: 'Maximum autophagy, full system reset, consult medical supervision.' },
  ];
  // Find most recent completion for each program
  const lastCompleted = {};
  for (const prog of programs) {
    const fasts = fastLog.filter(f => {
      const start = new Date(f.start);
      const end = new Date(f.end);
      const duration = (end - start) / 3600000;
      return duration >= prog.duration;
    });
    if (fasts.length > 0) {
      lastCompleted[prog.key] = fasts
        .map(f => new Date(f.end))
        .sort((a, b) => b - a)[0];
    }
  }
  // Find the highest program completed recently
  let recommended = programs[0];
  for (let i = programs.length - 1; i > 0; i--) {
    const prog = programs[i - 1];
    const last = lastCompleted[prog.key];
    if (last && (now - last) / (1000 * 3600 * 24) <= RECENT_DAYS) {
      recommended = programs[i];
      break;
    }
  }
  // Check recent meal pattern (e.g., carb meals in last 7 days)
  const carbMeals = foodLog.filter(e => e.isCarb && (now - new Date(e.time)) / (1000 * 3600 * 24) <= CARB_MEAL_WINDOW_DAYS).length;
  const animalMeals = foodLog.filter(e => e.type === 'animalMeat' && (now - new Date(e.time)) / (1000 * 3600 * 24) <= CARB_MEAL_WINDOW_DAYS).length;
  let caution = false;
  let reason = `Based on your recent fasting history, we recommend a ${recommended.duration}h fast.`;
  let overrideTo24h = false;
  if (carbMeals > CARB_MEAL_LIMIT) {
    recommended = programs[0];
    reason = "You've had several carb meals recently. Start with a 24h fast to reset.";
    caution = true;
    overrideTo24h = true;
  }
  if (!overrideTo24h && recommended.duration > 24 && animalMeals < ANIMAL_MEAL_MIN) {
    recommended = programs[0];
    reason = "We recommend a 24h fast. For multi-day fasts, ensure at least 3 animal-based meals in the week prior.";
    caution = true;
  }
  // New: Require refeed after prolonged fast (>=48h)
  const prolongedFasts = fastLog.filter(f => {
    const start = new Date(f.start);
    const end = new Date(f.end);
    const duration = (end - start) / 3600000;
    return duration >= PROLONGED_FAST_HOURS;
  }).sort((a, b) => new Date(b.end) - new Date(a.end));
  if (prolongedFasts.length > 0) {
    const lastProlonged = prolongedFasts[0];
    const lastEnd = new Date(lastProlonged.end);
    const daysSinceLastProlonged = (now - lastEnd) / (1000 * 3600 * 24);
    if (daysSinceLastProlonged < REFEED_DAYS && recommended.duration >= PROLONGED_FAST_HOURS) {
      recommended = programs[0];
      reason = `You recently completed a prolonged fast. Allow at least ${REFEED_DAYS} days of refeed (normal eating) before attempting another prolonged fast.`;
      caution = true;
    }
  }
  // Educational feedback: what to expect
  let whatToExpect = '';
  // Fasting status
  const fastingNow = (() => {
    if (!foodLog.length) return false;
    const lastMeal = new Date(foodLog[0].time);
    return (now - lastMeal) / 3600000 >= 16;
  })();
  if (fastingNow) {
    if (recommended.duration >= 48) {
      whatToExpect = 'You may feel increased mental clarity, mild fatigue, or hunger. Deep autophagy and immune renewal are likely active.';
    } else if (recommended.duration >= 36) {
      whatToExpect = 'You may notice fat burning, improved focus, and mild hunger. Autophagy is ramping up.';
    } else {
      whatToExpect = 'You may feel hungry or energized. Autophagy is likely starting.';
    }
  } else {
    whatToExpect = 'Expect to feel hungry in the first 12-24h, then possibly more energy and mental clarity as your body adapts.';
  }
  // Symptom status
  const recentSymptoms = symptomLog.filter(e => (now - new Date(e.time)) / (1000 * 3600 * 24) < 2);
  if (recentSymptoms.length > 0) {
    whatToExpect += ' Monitor your symptoms closely and break your fast if you feel unwell.';
  }
  // Autophagy challenge info
  const nextChallenge = autophagyStatus?.nextChallenge;
  let challengeMsg = '';
  if (nextChallenge && recommended.duration < nextChallenge) {
    challengeMsg = `Your next autophagy challenge is a ${nextChallenge}h fast. Completing the recommended fast will help you progress!`;
  } else if (nextChallenge && recommended.duration === nextChallenge) {
    challengeMsg = `This fast is your next autophagy challenge! Completing it will unlock a new level.`;
  }
  // Advise to plan next multi-day fast soon after current one, if eligible
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

export function LogsProvider({ children }) {
  const [foodLog, setFoodLog] = useState([]);
  const [symptomLog, setSymptomLog] = useState([]);
  const [fastLog, setFastLog] = useState([]);
  const [ketoneLog, setKetoneLog] = useState([]);
  const [autophagyProgress, setAutophagyProgress] = useState({ completed: {}, monthly: {} });
  const [loaded, setLoaded] = useState(false);
  const { user, saveUser } = useUser();

  // Load logs from storage on mount
  useEffect(() => {
    (async () => {
      const storedFood = await AsyncStorage.getItem('foodLog');
      if (storedFood) setFoodLog(JSON.parse(storedFood));
      const storedSymptom = await AsyncStorage.getItem('symptomLog');
      if (storedSymptom) setSymptomLog(JSON.parse(storedSymptom));
      const storedFast = await AsyncStorage.getItem('fastLog');
      if (storedFast) setFastLog(JSON.parse(storedFast));
      const storedKetone = await AsyncStorage.getItem('ketoneLog');
      if (storedKetone) setKetoneLog(JSON.parse(storedKetone));
      setLoaded(true);
    })();
  }, []);

  // Load autophagy progress from storage on mount
  useEffect(() => {
    (async () => {
      const storedProgress = await AsyncStorage.getItem('autophagyProgress');
      if (storedProgress) setAutophagyProgress(JSON.parse(storedProgress));
    })();
  }, []);

  // Save logs to storage when they change, but only after initial load
  useEffect(() => { if (loaded) AsyncStorage.setItem('foodLog', JSON.stringify(foodLog)); }, [foodLog, loaded]);
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog));
    }
  }, [symptomLog, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fastLog', JSON.stringify(fastLog)); }, [fastLog, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('autophagyProgress', JSON.stringify(autophagyProgress)); }, [autophagyProgress, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('ketoneLog', JSON.stringify(ketoneLog)); }, [ketoneLog, loaded]);

  // Update autophagy progress and completedFasts when fastLog changes
  useEffect(() => {
    let completed = {};
    let monthly = {};
    const now = new Date();
    const monthKey = getCurrentMonthKey();
    let monthHours = 0;
    // Track which fasting programs have been completed
    const FASTING_PROGRAMS = [
      { key: '24h', duration: 24 },
      { key: '36h', duration: 36 },
      { key: '48h', duration: 48 },
      { key: '72h', duration: 72 },
      { key: '96h', duration: 96 },
      { key: '120h', duration: 120 },
      { key: '144h', duration: 144 },
      { key: '168h', duration: 168 },
    ];
    // Recalculate completedFasts from scratch
    let completedFasts = [];
    fastLog.forEach(entry => {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const durationHrs = (end - start) / 3600000;
      // Only count extended fasts >= 24h
      if (durationHrs >= 24) {
        // Track monthly total
        if (start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth()) {
          monthHours += durationHrs;
        }
        // Track completed fasting programs
        FASTING_PROGRAMS.forEach(program => {
          if (durationHrs >= program.duration && !completedFasts.includes(program.key)) {
            completedFasts.push(program.key);
          }
        });
        // Placeholder: store additional markers (autophagy, ketones, etc.) in future
        // e.g., entry.autophagyLevel, entry.ketoneLevel
      }
      // Track completed challenges
      for (const level of AUTOPHAGY_LEVELS) {
        for (const ch of level.challenges) {
          if (durationHrs >= ch && (!completed[level.name] || !completed[level.name].includes(ch))) {
            completed[level.name] = completed[level.name] || [];
            completed[level.name].push(ch);
          }
        }
      }
    });
    // Sort completed challenges
    for (const k in completed) completed[k].sort((a, b) => a - b);
    monthly[monthKey] = monthHours;
    setAutophagyProgress({ completed, monthly });
    // Save completedFasts to user profile if changed
    if (user && JSON.stringify(completedFasts.sort()) !== JSON.stringify((user.completedFasts || []).sort())) {
      saveUser({ ...user, completedFasts });
    }
  }, [fastLog, user]);

  // Infer fasts from foodLog whenever foodLog changes
  useEffect(() => {
    if (!loaded) return;
    // Keep explicit/manual fasts (method !== 'inferred')
    const manualFasts = fastLog.filter(f => f.method !== 'inferred');
    const inferredFasts = inferFastsFromFoodLog(foodLog);
    // Replace all inferred fasts, keep manual fasts
    setFastLog([...manualFasts, ...inferredFasts]);
  }, [foodLog, loaded]);

  // Helper to get current level, next challenge, and monthly total
  function useAutophagyStatus() {
    const { completed, monthly } = autophagyProgress;
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
    const monthKey = getCurrentMonthKey();
    const monthlyDays = Math.floor((monthly[monthKey] || 0) / 24);
    return { currentLevel, nextChallenge, monthlyDays, completed };
  }

  // Unified fast recommendation with educational feedback
  function useUnifiedFastRecommendation() {
    return getUnifiedFastRecommendation(fastLog, foodLog, symptomLog, useAutophagyStatus());
  }

  return (
    <LogsContext.Provider value={{
      foodLog, setFoodLog,
      symptomLog, setSymptomLog,
      fastLog, setFastLog,
      ketoneLog, setKetoneLog,
      autophagyProgress, useAutophagyStatus,
      useUnifiedFastRecommendation
    }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
} 