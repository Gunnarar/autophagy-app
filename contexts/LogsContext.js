import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTOPHAGY_LEVELS } from '../utils/constants';
import {
  FASTING_PROGRAMS,
  getCurrentMonthKey,
  inferFastsFromFoodLog,
  getUnifiedFastRecommendation,
} from '../utils/logs';
import { useUser } from './UserContext';

const LogsContext = createContext();

export function LogsProvider({ children }) {
  const [foodLog, setFoodLog] = useState([]);
  const [symptomLog, setSymptomLog] = useState([]);
  const [fastLog, setFastLog] = useState([]);
  const [ketoneLog, setKetoneLog] = useState([]);
  const [autophagyProgress, setAutophagyProgress] = useState({ completed: {}, monthly: {} });
  const [loaded, setLoaded] = useState(false);
  const { user, saveUser } = useUser();

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

  useEffect(() => {
    (async () => {
      const storedProgress = await AsyncStorage.getItem('autophagyProgress');
      if (storedProgress) setAutophagyProgress(JSON.parse(storedProgress));
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('foodLog', JSON.stringify(foodLog));
  }, [foodLog, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog));
  }, [symptomLog, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('fastLog', JSON.stringify(fastLog));
  }, [fastLog, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('autophagyProgress', JSON.stringify(autophagyProgress));
  }, [autophagyProgress, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('ketoneLog', JSON.stringify(ketoneLog));
  }, [ketoneLog, loaded]);

  useEffect(() => {
    const completed = {};
    const monthly = {};
    const now = new Date();
    const monthKey = getCurrentMonthKey(now);
    let monthHours = 0;
    const completedFasts = new Set();

    fastLog.forEach(entry => {
      if (!entry?.start || !entry?.end) return;
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      const durationHrs = (end - start) / 3600000;
      if (durationHrs < 24) return;

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
            if (!completed[level.name]) {
              completed[level.name] = [];
            }
            if (!completed[level.name].includes(ch)) {
              completed[level.name].push(ch);
            }
          }
        }
      }
    });

    Object.keys(completed).forEach(key => {
      completed[key].sort((a, b) => a - b);
    });
    monthly[monthKey] = monthHours;
    setAutophagyProgress({ completed, monthly });

    const completedArray = Array.from(completedFasts).sort();
    if (
      user &&
      JSON.stringify(completedArray) !== JSON.stringify((user.completedFasts || []).sort())
    ) {
      saveUser({ ...user, completedFasts: completedArray });
    }
  }, [fastLog, user, saveUser]);

  useEffect(() => {
    if (!loaded) return;

    setFastLog(currentFasts => {
      const manualFasts = currentFasts.filter(f => f.method !== 'inferred');
      const inferredFasts = inferFastsFromFoodLog(foodLog);
      return [...manualFasts, ...inferredFasts];
    });
  }, [foodLog, loaded]);

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

  function useUnifiedFastRecommendation() {
    return getUnifiedFastRecommendation(fastLog, foodLog, symptomLog, useAutophagyStatus());
  }

  return (
    <LogsContext.Provider
      value={{
        foodLog,
        setFoodLog,
        symptomLog,
        setSymptomLog,
        fastLog,
        setFastLog,
        ketoneLog,
        setKetoneLog,
        autophagyProgress,
        useAutophagyStatus,
        useUnifiedFastRecommendation,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
}
