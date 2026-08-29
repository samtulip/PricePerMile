"use client";

import { ListIcon, MapIcon, Settings2Icon } from "lucide-react";

interface HeaderProps {
  viewMode: "table" | "map";
  onViewModeChange: (mode: "table" | "map") => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export function Header({ viewMode, onViewModeChange, showSettings, onToggleSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, var(--brand-start), var(--brand-end))",
              }}
            >
              PricePerMile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Find the cheapest fuel near you
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="settings-toggle"
              onClick={onToggleSettings}
              className={`flex items-center justify-center rounded-lg border p-1.5 sm:p-2 transition-colors ${
                showSettings
                  ? "border-slate-300 bg-slate-200 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              }`}
              aria-expanded={showSettings}
              aria-controls="settings-panel"
              aria-label="Toggle settings"
            >
              <Settings2Icon className="h-5 w-5" />
            </button>
            <div className="flex gap-1 sm:gap-3 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-label="Table view"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("map")}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded transition-colors ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-label="Map view"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
