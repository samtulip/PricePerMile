import { useState } from "react";
import { initializeStorage } from "@/lib/storageVersion";

/**
 * Runs the storage version check synchronously during the first render.
 * Because this uses a `useState` initializer, it executes before any
 * subsequent `useLocalStorage` calls in the same component, ensuring
 * those hooks see clean state when a migration occurs.
 *
 * @returns `true` if storage was cleared (version mismatch), `false` otherwise.
 */
export function useStorageVersion(): boolean {
  const [wasReinitialized] = useState<boolean>(() => initializeStorage());
  return wasReinitialized;
}
