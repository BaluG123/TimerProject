import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  TIMERS: 'timers',
  TIMER_HISTORY: 'timerHistory',
  THEME: 'theme',
};

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Timer specific functions
export const saveTimer = async (timer) => {
  const existingTimers = await getData(STORAGE_KEYS.TIMERS) || [];
  const updatedTimers = [...existingTimers, timer];
  return storeData(STORAGE_KEYS.TIMERS, updatedTimers);
};

export const updateTimer = async (timerId, updates) => {
  const timers = await getData(STORAGE_KEYS.TIMERS) || [];
  const updatedTimers = timers.map(timer => 
    timer.id === timerId ? { ...timer, ...updates } : timer
  );
  return storeData(STORAGE_KEYS.TIMERS, updatedTimers);
};

export const deleteTimer = async (timerId) => {
  const timers = await getData(STORAGE_KEYS.TIMERS) || [];
  const updatedTimers = timers.filter(timer => timer.id !== timerId);
  return storeData(STORAGE_KEYS.TIMERS, updatedTimers);
};