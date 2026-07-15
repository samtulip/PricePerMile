"use client";

import type { FuelType } from "@/types";
import { useTheme } from "@/app/providers";

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
}

const DEFAULT_MPG = 45;
const DEFAULT_FILL_UP_LITRES = 40;

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
}: SettingsPanelProps) {
  const { colorTheme, setColorTheme } = useTheme();

  const handleMpgNumber = (value: string) => {
    const parsedValue = Number(value);
    if (!Number.isNaN(parsedValue) && parsedValue > 0) {
      onMpgChange(parsedValue);
    }
  };

  const handleFillUpNumber = (value: string) => {
    const parsedValue = Number(value);
    if (!Number.isNaN(parsedValue) && parsedValue > 0) {
      onFillUpChange(parsedValue);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Fuel type</label>
          <div className="flex gap-3">
            {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
              <button
                type="button"
                key={fuel}
                onClick={() => onFuelChange(fuel)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                  selectedFuel === fuel
                    ? "bg-[var(--accent-600)] text-[var(--accent-on)]"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
              </button>
            ))}
          </div>
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
            onChange={(event) => handleMpgNumber(event.target.value)}
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
            onChange={(event) => handleFillUpNumber(event.target.value)}
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
      <div className="mt-6 pt-6 border-t border-slate-200">
        <label htmlFor="color-theme" className="block text-sm font-medium mb-2">
          Color theme
        </label>
        <select
          id="color-theme"
          value={colorTheme}
          onChange={(event) =>
            setColorTheme(event.target.value as "blue" | "green" | "purple" | "high-contrast")
          }
          className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 appearance-none"
          aria-label="Select color theme"
        >
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </div>
    </div>
  );
}
