"use client";

import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  COLOR_THEME_CLASSES,
  LEGACY_COLOR_THEME_KEY,
  STORAGE_KEYS,
  type ColorTheme,
} from "@/features/settings/config";
import { getInitialColorTheme, isColorTheme } from "@/features/settings/utils";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>(
    STORAGE_KEYS.colorTheme,
    getInitialColorTheme(),
    isColorTheme
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...Object.values(COLOR_THEME_CLASSES));
    root.classList.add(COLOR_THEME_CLASSES[colorTheme]);

    try {
      localStorage.setItem(STORAGE_KEYS.colorTheme, JSON.stringify(colorTheme));
      localStorage.removeItem(LEGACY_COLOR_THEME_KEY);
    } catch {}
  }, [colorTheme]);

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
