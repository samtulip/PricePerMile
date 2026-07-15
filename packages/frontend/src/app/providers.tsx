"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ColorTheme = "blue" | "green" | "purple" | "high-contrast";

const COLOR_THEME_CLASSES: Record<ColorTheme, string> = {
  blue: "theme-blue",
  green: "theme-green",
  purple: "theme-purple",
  "high-contrast": "theme-high-contrast",
};

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window === "undefined") {
      return "blue";
    }

    const stored = window.localStorage.getItem("colorTheme");
    if (
      stored === "blue" ||
      stored === "green" ||
      stored === "purple" ||
      stored === "high-contrast"
    ) {
      return stored;
    }

    return "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...Object.values(COLOR_THEME_CLASSES));
    root.classList.add(COLOR_THEME_CLASSES[colorTheme]);
    localStorage.setItem("colorTheme", colorTheme);
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
