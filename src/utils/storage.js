import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMERS_KEY = '@timers';
const HISTORY_KEY = '@history';

export const storage = {
  // Timer operations
  saveTimer: async (timer) => {
    try {
      const existingTimers = await storage.getTimers();
      const updatedTimers = [...existingTimers, timer];
      await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(updatedTimers));
      return true;
    } catch (error) {
      console.error('Error saving timer:', error);
      return false;
    }
  },

  getTimers: async () => {
    try {
      const timers = await AsyncStorage.getItem(TIMERS_KEY);
      return timers ? JSON.parse(timers) : [];
    } catch (error) {
      console.error('Error getting timers:', error);
      return [];
    }
  },

  updateTimer: async (updatedTimer) => {
    try {
      const timers = await storage.getTimers();
      const updatedTimers = timers.map(timer => 
        timer.id === updatedTimer.id ? updatedTimer : timer
      );
      await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(updatedTimers));
      return true;
    } catch (error) {
      console.error('Error updating timer:', error);
      return false;
    }
  },

  // History operations
  addToHistory: async (completedTimer) => {
    try {
      const history = await storage.getHistory();
      const updatedHistory = [...history, {
        ...completedTimer,
        completedAt: new Date().toISOString()
      }];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error adding to history:', error);
      return false;
    }
  },

  getHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
};