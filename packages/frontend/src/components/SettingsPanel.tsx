"use client";

import { useTheme } from "@/app/providers";
import { FuelTypeSelector } from "@/features/settings/components/FuelTypeSelector";
import {
  COLOR_THEMES,
  COLOR_THEME_LABELS,
  DEFAULT_FILL_UP_LITRES,
  DEFAULT_MPG,
  type ColorTheme,
} from "@/features/settings/config";
import { parsePositiveNumber } from "@/features/settings/utils";
import type { FuelType } from "@/types";

interface SettingsPanelProps {
  selectedFuel: FuelType;
  onFuelChange: (fuel: FuelType) => void;
  milesPerGallon: number;
  onMpgChange: (mpg: number) => void;
  fillUpLitres: number;
  onFillUpChange: (litres: number) => void;
  radiusMiles: number;
  onRadiusChange: (radius: number) => void;
  defaultMpg: number;
  defaultFillUp: number;
  onOpenWizard: () => void;
}

export function SettingsPanel({
  selectedFuel,
  onFuelChange,
  milesPerGallon,
  onMpgChange,
  fillUpLitres,
  onFillUpChange,
  radiusMiles,
  onRadiusChange,
  defaultMpg = DEFAULT_MPG,
  defaultFillUp = DEFAULT_FILL_UP_LITRES,
  onOpenWizard,
}: SettingsPanelProps) {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div className="bg-white p-3 sm:rounded-lg sm:border sm:border-slate-200 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Fuel type</label>
          <FuelTypeSelector selectedFuel={selectedFuel} onChange={onFuelChange} />
        </div>
        <div>
          <span className="block text-sm font-medium mb-2">Miles per gallon</span>
          <input
            type="range"
            min={10}
            max={80}
            step={1}
            value={milesPerGallon}
            onChange={(event) => onMpgChange(Number(event.target.value))}
            className="w-full"
            aria-label="Miles per gallon slider"
          />
          <input
            type="number"
            min={1}
            step={1}
            value={milesPerGallon}
            onChange={(event) => onMpgChange(parsePositiveNumber(event.target.value, milesPerGallon))}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            aria-label="Miles per gallon number input"
          />
          <div className="mt-2 text-sm text-slate-600">
            {milesPerGallon} MPG. Default is {defaultMpg} MPG.
          </div>
        </div>
        <div>
          <span className="block text-sm font-medium mb-2">Fill-up amount (litres)</span>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={fillUpLitres}
            onChange={(event) => onFillUpChange(Number(event.target.value))}
            className="w-full"
            aria-label="Fill-up amount slider"
          />
          <input
            type="number"
            min={1}
            step={1}
            value={fillUpLitres}
            onChange={(event) =>
              onFillUpChange(parsePositiveNumber(event.target.value, fillUpLitres))
            }
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            aria-label="Fill-up amount number input"
          />
          <div className="mt-2 text-sm text-slate-600">
            {fillUpLitres} litres. Default is {defaultFillUp} litres.
          </div>
        </div>
        <div>
          <span className="block text-sm font-medium mb-2">Search radius (miles)</span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={radiusMiles}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
            className="w-full"
            aria-label="Search radius slider"
          />
          <div className="mt-2 text-sm text-slate-600">{radiusMiles} miles</div>
        </div>
      </div>
      <div className="mt-4 pt-4 sm:mt-6 sm:pt-6 border-t border-slate-200 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="color-theme" className="block text-sm font-medium mb-2">
            Color theme
          </label>
          <select
            id="color-theme"
            value={colorTheme}
            onChange={(event) =>
              setColorTheme(event.target.value as ColorTheme)
            }
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 appearance-none"
            aria-label="Select color theme"
          >
            {COLOR_THEMES.map((themeOption) => (
              <option key={themeOption} value={themeOption}>
                {COLOR_THEME_LABELS[themeOption]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onOpenWizard}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Reopen setup wizard
        </button>
      </div>
    </div>
  );
}
