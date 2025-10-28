import AsyncStorage from '@react-native-async-storage/async-storage';

async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] removeItem("${key}") failed`, error);
  }
}

export async function loadString(key, defaultValue = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ?? defaultValue;
  } catch (error) {
    console.warn(`[storage] loadString("${key}") failed`, error);
    return defaultValue;
  }
}

export async function saveString(key, value) {
  if (value === undefined || value === null) {
    await removeItem(key);
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[storage] saveString("${key}") failed`, error);
  }
}

export async function loadJSON(key, defaultValue = null) {
  const raw = await loadString(key);
  if (raw === null || raw === undefined) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] loadJSON("${key}") JSON.parse failed`, error);
    return defaultValue;
  }
}

export async function saveJSON(key, value) {
  if (value === undefined || value === null) {
    await removeItem(key);
    return;
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] saveJSON("${key}") failed`, error);
  }
}

export async function deleteItem(key) {
  await removeItem(key);
}
