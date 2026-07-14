import { useState } from "react";

/**
 * Custom hook for managing state with localStorage persistence
 * Handles SSR safely and validates numeric values
 * 
 * On persistence failures (quota exceeded, permissions denied, etc.):
 * - The state is still updated in memory, so the app continues functioning
 * - localStorage persistence is silently skipped to avoid breaking the app
 * - This is the preferred pattern for client-side storage to ensure resilience
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => boolean
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Avoid localStorage access during SSR
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      const parsed = JSON.parse(item);

      // Handle numeric values with NaN validation
      if (typeof parsed === "number" && Number.isNaN(parsed)) {
        return initialValue;
      }

      // Use custom validator if provided
      if (validator && !validator(parsed)) {
        return initialValue;
      }

      return parsed as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      // Check for NaN values
      if (typeof value === "number" && Number.isNaN(value)) {
        setStoredValue(initialValue);
        return;
      }

      setStoredValue(value);

      // Persist to localStorage safely. If this fails (e.g., quota exceeded,
      // private browsing), the app continues with the in-memory state intact.
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Silently fail on localStorage errors to prevent app breakage.
      // The state is still updated in memory, maintaining app functionality.
      setStoredValue(value);
    }
  };

  return [storedValue, setValue];
}
