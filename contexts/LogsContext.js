import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  inferFastsFromFoodLog,
  getUnifiedFastRecommendation,
  calculateAutophagyProgress,
  getAutophagyStatus,
} from '../utils/logs';
import { loadJSON, saveJSON } from '../utils/storage';
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
      const storedFood = await loadJSON('foodLog', []);
      setFoodLog(storedFood || []);
      const storedSymptom = await loadJSON('symptomLog', []);
      setSymptomLog(storedSymptom || []);
      const storedFast = await loadJSON('fastLog', []);
      setFastLog(storedFast || []);
      const storedKetone = await loadJSON('ketoneLog', []);
      setKetoneLog(storedKetone || []);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const storedProgress = await loadJSON('autophagyProgress', { completed: {}, monthly: {} });
      if (storedProgress) setAutophagyProgress(storedProgress);
    })();
  }, []);

  useEffect(() => {
    if (loaded) saveJSON('foodLog', foodLog);
  }, [foodLog, loaded]);

  useEffect(() => {
    if (loaded) saveJSON('symptomLog', symptomLog);
  }, [symptomLog, loaded]);

  useEffect(() => {
    if (loaded) saveJSON('fastLog', fastLog);
  }, [fastLog, loaded]);

  useEffect(() => {
    if (loaded) saveJSON('autophagyProgress', autophagyProgress);
  }, [autophagyProgress, loaded]);

  useEffect(() => {
    if (loaded) saveJSON('ketoneLog', ketoneLog);
  }, [ketoneLog, loaded]);

  useEffect(() => {
    const now = new Date();
    const progress = calculateAutophagyProgress(fastLog, now);
    setAutophagyProgress({ completed: progress.completed, monthly: progress.monthly });

    if (user) {
      const existing = Array.isArray(user.completedFasts)
        ? [...user.completedFasts].sort()
        : [];
      if (JSON.stringify(progress.completedFasts) !== JSON.stringify(existing)) {
        saveUser({ ...user, completedFasts: progress.completedFasts });
      }
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
    return getAutophagyStatus(autophagyProgress);
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
