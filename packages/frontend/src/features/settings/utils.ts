import type { FuelType } from "@/types";
import {
  COLOR_THEMES,
  DEFAULT_COLOR_THEME,
  LEGACY_COLOR_THEME_KEY,
  STORAGE_KEYS,
  type ColorTheme,
} from "@/features/settings/config";

const colorThemeSet = new Set<string>(COLOR_THEMES);

export function isFuelType(value: unknown): value is FuelType {
  return value === "petrol" || value === "diesel";
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isColorTheme(value: unknown): value is ColorTheme {
  return typeof value === "string" && colorThemeSet.has(value);
}

export function parsePositiveNumber(value: string, fallback: number): number {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

export function getInitialColorTheme(): ColorTheme {
  if (typeof window === "undefined") {
    return DEFAULT_COLOR_THEME;
  }

  try {
    const storedTheme =
      window.localStorage.getItem(STORAGE_KEYS.colorTheme) ??
      window.localStorage.getItem(LEGACY_COLOR_THEME_KEY);

    if (!storedTheme) {
      return DEFAULT_COLOR_THEME;
    }

    try {
      const parsedTheme = JSON.parse(storedTheme);
      return isColorTheme(parsedTheme) ? parsedTheme : DEFAULT_COLOR_THEME;
    } catch {
      return isColorTheme(storedTheme) ? storedTheme : DEFAULT_COLOR_THEME;
    }
  } catch {
    return DEFAULT_COLOR_THEME;
  }
}
