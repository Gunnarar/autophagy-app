import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import { differenceInCalendarMonths, parseISO } from 'date-fns';

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

export function LogsProvider({ children }) {
  const [foodLog, setFoodLog] = useState([]);
  const [symptomLog, setSymptomLog] = useState([]);
  const [fastLog, setFastLog] = useState([]);
  const [autophagyProgress, setAutophagyProgress] = useState({ completed: {}, monthly: {} });

  // Load logs from storage on mount
  useEffect(() => {
    (async () => {
      const storedFood = await AsyncStorage.getItem('foodLog');
      if (storedFood) setFoodLog(JSON.parse(storedFood));
      const storedSymptom = await AsyncStorage.getItem('symptomLog');
      if (storedSymptom) setSymptomLog(JSON.parse(storedSymptom));
      const storedFast = await AsyncStorage.getItem('fastLog');
      if (storedFast) setFastLog(JSON.parse(storedFast));
    })();
  }, []);

  // Load autophagy progress from storage on mount
  useEffect(() => {
    (async () => {
      const storedProgress = await AsyncStorage.getItem('autophagyProgress');
      if (storedProgress) setAutophagyProgress(JSON.parse(storedProgress));
    })();
  }, []);

  // Save logs to storage when they change
  useEffect(() => { AsyncStorage.setItem('foodLog', JSON.stringify(foodLog)); }, [foodLog]);
  useEffect(() => { AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog)); }, [symptomLog]);
  useEffect(() => { AsyncStorage.setItem('fastLog', JSON.stringify(fastLog)); }, [fastLog]);
  useEffect(() => { AsyncStorage.setItem('autophagyProgress', JSON.stringify(autophagyProgress)); }, [autophagyProgress]);

  // Update autophagy progress when fastLog changes
  useEffect(() => {
    let completed = {};
    let monthly = {};
    const now = new Date();
    const monthKey = getCurrentMonthKey();
    let monthHours = 0;
    fastLog.forEach(entry => {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const durationHrs = (end - start) / 3600000;
      // Only count fasts >= 24h
      if (durationHrs >= 24) {
        // Track monthly total
        if (start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth()) {
          monthHours += durationHrs;
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
      }
    });
    // Sort completed challenges
    for (const k in completed) completed[k].sort((a, b) => a - b);
    monthly[monthKey] = monthHours;
    setAutophagyProgress({ completed, monthly });
  }, [fastLog]);

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

  return (
    <LogsContext.Provider value={{ foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, autophagyProgress, useAutophagyStatus }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
} 