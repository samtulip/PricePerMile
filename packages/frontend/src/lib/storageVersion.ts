/**
 * Storage version management for localStorage schema migrations.
 *
 * When the shape or meaning of any persisted key changes, increment
 * STORAGE_VERSION so that returning users with stale data are
 * automatically reinitialized to defaults instead of experiencing
 * broken behaviour.
 *
 * Version history:
 *   1 – initial versioned schema
 */

export const STORAGE_VERSION = 1;
export const STORAGE_VERSION_KEY = "pricepermile_storage_version";

/** Prefix shared by all persisted app keys (excluding the version key itself). */
const APP_KEY_PREFIX = "pricepermile_";

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

  const stored = localStorage.getItem(STORAGE_VERSION_KEY);

  // Version already matches – nothing to do.
  if (stored === String(STORAGE_VERSION)) {
    return false;
  }

  // Collect all app data keys (excluding the version key itself, which is
  // managed separately below).
  const dataKeysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key !== null &&
      key.startsWith(APP_KEY_PREFIX) &&
      key !== STORAGE_VERSION_KEY
    ) {
      dataKeysToRemove.push(key);
    }
  }

  // New user with no prior app data at all – just stamp the version and
  // return false (no stale data was cleared).
  if (dataKeysToRemove.length === 0) {
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    return false;
  }

  // Stale data exists (wrong version or legacy data without a version key):
  // clear it, write the new version, and signal that reinitialisation occurred.
  dataKeysToRemove.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
  return true;
}
