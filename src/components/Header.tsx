"use client";

import { useTheme } from "@/app/providers";
import { MoonIcon, SunIcon } from "lucide-react";

export function Header() {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1">
            <h1
              className="text-2xl font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, var(--brand-start), var(--brand-end))",
              }}
            >
              PricePerMile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Find the cheapest fuel near you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="color-theme" className="sr-only">
              Color theme
            </label>
            <select
              id="color-theme"
              value={colorTheme}
              onChange={(event) =>
                setColorTheme(
                  event.target.value as "blue" | "green" | "purple" | "high-contrast"
                )
              }
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200"
              aria-label="Select color theme"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="high-contrast">High Contrast</option>
            </select>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
