"use client";

import { useTheme } from "@/app/providers";
import { MoonIcon, SunIcon } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
              PricePerMile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Find the cheapest fuel near you
            </p>
          </div>
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
    </header>
  );
}
