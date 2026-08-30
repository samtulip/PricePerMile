import {
  APP_STORAGE_PREFIX,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEYS,
  STORAGE_VERSION,
} from "@/features/settings/config";

export { STORAGE_VERSION };
export const STORAGE_VERSION_KEY = STORAGE_KEYS.schemaVersion;

/**
 * Checks the stored schema version against the current one.
 * If they differ (or no version has been stored yet), all
 * `pricepermile_*` keys are cleared and the current version is written.
 *
 * Must be called synchronously before any other localStorage reads so
 * that `useLocalStorage` hooks see clean state when a migration occurs.
 *
 * @returns `true` when storage was cleared due to a version mismatch,
 *          `false` when the version already matched (no action taken).
 */
export function initializeStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_VERSION_KEY);
    const legacyKeysToRemove = LEGACY_STORAGE_KEYS.filter((key) => localStorage.getItem(key) !== null);

    if (stored === String(STORAGE_VERSION)) {
      legacyKeysToRemove.forEach((key) => localStorage.removeItem(key));
      return false;
    }

    const keysToRemove = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null && key.startsWith(APP_STORAGE_PREFIX) && key !== STORAGE_VERSION_KEY) {
        keysToRemove.add(key);
      }
    }

    legacyKeysToRemove.forEach((key) => keysToRemove.add(key));

    if (keysToRemove.size === 0) {
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return false;
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    return true;
  } catch {
    return false;
  }
}
