import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_theme';

export const darkTheme = {
  isDark: true,
  bg: '#0D1117',
  surface: '#161B22',
  card: '#1C2230',
  border: '#2D3548',
  accent: '#3DD68C',
  accentDim: '#1A3D2E',
  accentText: '#0D1117',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  textFaint: '#484F58',
  inputBg: '#161B22',
  inputBorder: '#2D3548',
  inputText: '#E6EDF3',
  placeholder: '#484F58',
  danger: '#F85149',
  dangerDim: '#3D1A1A',
  scrollBg: '#0D1117',
  statusBar: 'light-content' as const,
};

export const lightTheme = {
  isDark: false,
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#DDE3ED',
  accent: '#16A34A',
  accentDim: '#DCFCE7',
  accentText: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#94A3B8',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  danger: '#DC2626',
  dangerDim: '#FEE2E2',
  scrollBg: '#F0F4F8',
  statusBar: 'dark-content' as const,
};

export type AppTheme = typeof darkTheme;

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemDark = Appearance.getColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemDark);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved !== null) setIsDark(saved === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
