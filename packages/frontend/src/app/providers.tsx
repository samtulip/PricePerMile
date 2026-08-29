"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ColorTheme = "blue" | "green" | "purple" | "high-contrast";

const COLOR_THEME_CLASSES: Record<ColorTheme, string> = {
  blue: "theme-blue",
  green: "theme-green",
  purple: "theme-purple",
  "high-contrast": "theme-high-contrast",
};

function isColorTheme(value: unknown): value is ColorTheme {
  return (
    value === "blue" ||
    value === "green" ||
    value === "purple" ||
    value === "high-contrast"
  );
}

function getPersistedColorTheme(): ColorTheme | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem("colorTheme");
    if (stored === null) return null;

    if (isColorTheme(stored)) {
      return stored;
    }

    try {
      const parsed = JSON.parse(stored);
      if (isColorTheme(parsed)) {
        return parsed;
      }
    } catch {
      // Fall back to cleanup below.
    }

    window.localStorage.removeItem("colorTheme");
    return null;
  } catch {
    return null;
  }
}

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return getPersistedColorTheme() ?? "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...Object.values(COLOR_THEME_CLASSES));
    root.classList.add(COLOR_THEME_CLASSES[colorTheme]);
    try {
      localStorage.setItem("colorTheme", colorTheme);
    } catch {
      // Ignore persistence failures to keep the UI responsive.
    }
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
