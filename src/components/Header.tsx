"use client";

import { ListIcon, MapIcon } from "lucide-react";

interface HeaderProps {
  viewMode: "table" | "map";
  onViewModeChange: (mode: "table" | "map") => void;
}

export function Header({ viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-colors dark:bg-slate-900 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
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
          <div className="flex gap-3 bg-slate-100 p-1 rounded-lg dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-label="Table view"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("map")}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-label="Map view"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
