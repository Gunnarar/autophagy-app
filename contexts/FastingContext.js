import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAST_GOAL_SECONDS = 16 * 3600; // 16 hours

const FastingContext = createContext();

export function FastingProvider({ children }) {
  const [isFasting, setIsFasting] = useState(false);
  const [fastStart, setFastStart] = useState(null);
  const [fastElapsed, setFastElapsed] = useState(0);

  // Load fasting state from storage on mount
  useEffect(() => {
    (async () => {
      const storedFast = await AsyncStorage.getItem('fastingStart');
      if (storedFast) {
        setFastStart(Number(storedFast));
        setIsFasting(true);
      }
    })();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval;
    if (isFasting && fastStart) {
      interval = setInterval(() => {
        setFastElapsed(Math.floor((Date.now() - fastStart) / 1000));
      }, 1000);
      setFastElapsed(Math.floor((Date.now() - fastStart) / 1000));
    } else {
      setFastElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, fastStart]);

  // Start/stop fasting
  const startFast = useCallback(async (customStartTime) => {
    const start = customStartTime ? customStartTime.getTime() : Date.now();
    await AsyncStorage.setItem('fastingStart', String(start));
    setFastStart(start);
    setIsFasting(true);
  }, []);

  const stopFast = useCallback(async (customStopTime) => {
    // Optionally, you could log the fast duration here using customStopTime and fastStart
    await AsyncStorage.removeItem('fastingStart');
    setFastStart(null);
    setIsFasting(false);
    setFastElapsed(0);
  }, []);

  return (
    <FastingContext.Provider value={{ isFasting, fastStart, fastElapsed, startFast, stopFast, FAST_GOAL_SECONDS }}>
      {children}
    </FastingContext.Provider>
  );
}

export function useFasting() {
  return useContext(FastingContext);
} 