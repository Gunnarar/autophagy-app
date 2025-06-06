import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogsContext = createContext();

export function LogsProvider({ children }) {
  const [foodLog, setFoodLog] = useState([]);
  const [symptomLog, setSymptomLog] = useState([]);
  const [fastLog, setFastLog] = useState([]);

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

  // Save logs to storage when they change
  useEffect(() => { AsyncStorage.setItem('foodLog', JSON.stringify(foodLog)); }, [foodLog]);
  useEffect(() => { AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog)); }, [symptomLog]);
  useEffect(() => { AsyncStorage.setItem('fastLog', JSON.stringify(fastLog)); }, [fastLog]);

  return (
    <LogsContext.Provider value={{ foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
} 