"use client";

import { useState } from "react";
import type { FuelType } from "@/types";

interface OnboardingWizardProps {
  defaultFuel: FuelType;
  defaultMpg: number;
  defaultFillUpLitres: number;
  defaultRadiusMiles: number;
  onComplete: (settings: {
    fuelType: FuelType;
    milesPerGallon: number;
    fillUpLitres: number;
    radiusMiles: number;
  }) => void;
}

export function OnboardingWizard({
  defaultFuel,
  defaultMpg,
  defaultFillUpLitres,
  defaultRadiusMiles,
  onComplete,
}: OnboardingWizardProps) {
  const [fuelType, setFuelType] = useState<FuelType>(defaultFuel);
  const [milesPerGallon, setMilesPerGallon] = useState(defaultMpg);
  const [fillUpLitres, setFillUpLitres] = useState(defaultFillUpLitres);
  const [radiusMiles, setRadiusMiles] = useState(defaultRadiusMiles);

  const submit = () => {
    onComplete({
      fuelType,
      milesPerGallon,
      fillUpLitres,
      radiusMiles,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900">Welcome to PricePerMile</h2>
        <p className="mt-2 text-sm text-slate-600">
          We do not use your data. Any settings you save stay on your device in local storage.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fuel type</label>
            <div className="flex gap-3">
              {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
                <button
                  type="button"
                  key={fuel}
                  onClick={() => setFuelType(fuel)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                    fuelType === fuel
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
            <label htmlFor="onboarding-mpg" className="block text-sm font-medium mb-2">
              Average MPG
            </label>
            <input
              id="onboarding-mpg"
              type="number"
              min={1}
              step={1}
              value={milesPerGallon}
              onChange={(event) => setMilesPerGallon(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="onboarding-fill-up" className="block text-sm font-medium mb-2">
              Average fill-up (litres)
            </label>
            <input
              id="onboarding-fill-up"
              type="number"
              min={1}
              step={1}
              value={fillUpLitres}
              onChange={(event) => setFillUpLitres(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="onboarding-distance" className="block text-sm font-medium mb-2">
              Max distance willing to travel (miles)
            </label>
            <input
              id="onboarding-distance"
              type="number"
              min={1}
              step={1}
              value={radiusMiles}
              onChange={(event) => setRadiusMiles(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-6 w-full rounded-lg px-4 py-2.5 font-medium bg-[var(--accent-600)] text-[var(--accent-on)] hover:opacity-95 transition-opacity"
        >
          Save and continue
        </button>
      </div>
    </div>
  );
}
