"use client";

import { useTheme } from "@/app/providers";

export function Header() {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="sm:flex-1 min-w-0">
            <h1
              className="text-2xl font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, var(--brand-start), var(--brand-end))",
              }}
            >
              PricePerMile
            </h1>
            <p className="text-sm text-slate-500">
              Find the cheapest fuel near you
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
              className="h-10 flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 appearance-none"
              aria-label="Select color theme"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
