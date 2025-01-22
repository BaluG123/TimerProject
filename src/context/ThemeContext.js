// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getData, storeData, STORAGE_KEYS } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await getData(STORAGE_KEYS.THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(systemColorScheme || 'light');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await storeData(STORAGE_KEYS.THEME, newTheme);
  };

  const colors = {
    light: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      primary: '#007AFF',
      text: '#000000',
      secondaryText: '#666666',
      border: '#DDDDDD',
      error: '#FF3B30',
      success: '#34C759',
    },
    dark: {
      background: '#000000',
      surface: '#1C1C1E',
      primary: '#0A84FF',
      text: '#FFFFFF',
      secondaryText: '#EBEBF5',
      border: '#38383A',
      error: '#FF453A',
      success: '#32D74B',
    },
  };

  return (
    <ThemeContext.Provider 
      value={{
        theme,
        toggleTheme,
        colors: colors[theme],
        isDark: theme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};