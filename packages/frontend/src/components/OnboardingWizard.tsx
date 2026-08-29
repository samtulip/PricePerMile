"use client";

import { useEffect, useRef, useState } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const [fuelType, setFuelType] = useState<FuelType>(defaultFuel);
  const [milesPerGallon, setMilesPerGallon] = useState(defaultMpg);
  const [fillUpLitres, setFillUpLitres] = useState(defaultFillUpLitres);
  const [radiusMiles, setRadiusMiles] = useState(defaultRadiusMiles);
  const completeOnboarding = () => {
    onComplete({
      fuelType,
      milesPerGallon,
      fillUpLitres,
      radiusMiles,
    });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
    );
    focusableElements[0]?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onComplete({
          fuelType,
          milesPerGallon,
          fillUpLitres,
          radiusMiles,
        });
        return;
      }
      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [fillUpLitres, fuelType, milesPerGallon, onComplete, radiusMiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
        ref={dialogRef}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 id="onboarding-title" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Welcome to PricePerMile
        </h2>
        <p id="onboarding-desc" className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We do not use your data. Any settings you save stay on your device in local storage.
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Press Escape any time to continue with your current values.
        </p>

        <div className="mt-5 space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium mb-2">Fuel type</legend>
            <div className="flex gap-3">
              {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
                <button
                  type="button"
                  key={fuel}
                  onClick={() => setFuelType(fuel)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                    fuelType === fuel
                      ? "bg-[var(--accent-600)] text-[var(--accent-on)]"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={completeOnboarding}
          className="mt-6 w-full rounded-lg px-4 py-2.5 font-medium bg-[var(--accent-600)] text-[var(--accent-on)] hover:opacity-95 transition-opacity"
        >
          Save and continue
        </button>
      </div>
    </div>
  );
}
