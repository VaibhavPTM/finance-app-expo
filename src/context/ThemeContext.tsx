import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { getColors, ThemeMode, lightColors } from '../theme';
import * as storage from '../storage';

type ThemeContextType = {
  theme: ThemeMode;
  colors: ReturnType<typeof getColors>;
  setTheme: (mode: ThemeMode) => void;
};

const defaultValue: ThemeContextType = {
  theme: 'light',
  colors: lightColors,
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    storage.loadTheme().then((saved) => setThemeState(saved));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    storage.saveTheme(mode);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      colors: getColors(theme),
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  return ctx ?? defaultValue;
}
