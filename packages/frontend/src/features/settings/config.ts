import type { FuelType } from "@/types";

export type ColorTheme = "blue" | "green" | "purple" | "high-contrast";

export const APP_STORAGE_PREFIX = "pricepermile_";
export const STORAGE_VERSION = 2;
export const LEGACY_COLOR_THEME_KEY = "colorTheme";
export const LEGACY_STORAGE_KEYS = [
  LEGACY_COLOR_THEME_KEY,
  `${APP_STORAGE_PREFIX}schemaVersion`,
] as const;

export const DEFAULT_FUEL: FuelType = "petrol";
export const DEFAULT_RADIUS = 7;
export const DEFAULT_MPG = 45;
export const DEFAULT_FILL_UP_LITRES = 40;
export const DEFAULT_COLOR_THEME: ColorTheme = "blue";

export const FUEL_OPTIONS: FuelType[] = ["petrol", "diesel"];
export const COLOR_THEMES: ColorTheme[] = ["blue", "green", "purple", "high-contrast"];

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  blue: "Blue",
  green: "Green",
  purple: "Purple",
  "high-contrast": "High Contrast",
};

export const COLOR_THEME_CLASSES: Record<ColorTheme, string> = {
  blue: "theme-blue",
  green: "theme-green",
  purple: "theme-purple",
  "high-contrast": "theme-high-contrast",
};

export const STORAGE_KEYS = {
  schemaVersion: `${APP_STORAGE_PREFIX}storage_version`,
  fuelType: `${APP_STORAGE_PREFIX}fuelType`,
  radiusMiles: `${APP_STORAGE_PREFIX}radiusMiles`,
  milesPerGallon: `${APP_STORAGE_PREFIX}milesPerGallon`,
  fillUpLitres: `${APP_STORAGE_PREFIX}fillUpLitres`,
  selectedStationId: `${APP_STORAGE_PREFIX}selectedStationId`,
  onboardingComplete: `${APP_STORAGE_PREFIX}onboardingComplete`,
  colorTheme: `${APP_STORAGE_PREFIX}colorTheme`,
} as const;
