"use client";

import { FUEL_OPTIONS } from "@/features/settings/config";
import type { FuelType } from "@/types";

interface FuelTypeSelectorProps {
  selectedFuel: FuelType;
  onChange: (fuel: FuelType) => void;
}

export function FuelTypeSelector({
  selectedFuel,
  onChange,
}: FuelTypeSelectorProps) {
  return (
    <div className="flex gap-3">
      {FUEL_OPTIONS.map((fuel) => (
        <button
          type="button"
          key={fuel}
          onClick={() => onChange(fuel)}
          aria-pressed={selectedFuel === fuel}
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
  );
}
