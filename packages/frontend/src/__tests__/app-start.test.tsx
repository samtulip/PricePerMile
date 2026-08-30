/**
 * Integration tests for application start-up journeys.
 *
 * These tests cover the four key scenarios defined in the product spec:
 *
 *   1. New user – no localStorage data
 *      → Onboarding wizard is shown
 *
 *   2. Returning user – same storage format (version match)
 *      → Wizard is hidden, persisted settings are preserved in localStorage
 *
 *   3. New user + storage format changed (version mismatch, no prior complete flag)
 *      → Data cleared, wizard is shown with defaults
 *
 *   4. Returning user + storage format changed (version mismatch, complete flag was set)
 *      → Stale data cleared, wizard is shown (treated as new user)
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { STORAGE_KEYS } from "@/features/settings/config";
import { STORAGE_VERSION, STORAGE_VERSION_KEY } from "@/lib/storageVersion";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Avoid leaflet / next/dynamic issues in jsdom
vi.mock("@/components/MapSection", () => ({
  MapSection: () => null,
}));

// Provide a stable geolocation mock so useEffect calls resolve quickly
vi.mock("@/lib/geolocation", () => ({
  getUserLocation: () =>
    Promise.resolve({ latitude: 51.5, longitude: -0.12 }),
  calculateDistance: () => 1,
  calculateCostToTravel: () => 100,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Populate localStorage to simulate a returning user with the current schema. */
function setValidReturningUserStorage() {
  localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
  localStorage.setItem(STORAGE_KEYS.onboardingComplete, "true");
  localStorage.setItem(STORAGE_KEYS.fuelType, '"diesel"');
  localStorage.setItem(STORAGE_KEYS.radiusMiles, "12");
  localStorage.setItem(STORAGE_KEYS.milesPerGallon, "50");
  localStorage.setItem(STORAGE_KEYS.fillUpLitres, "35");
}

/** Populate localStorage to simulate a returning user whose data uses an old schema. */
function setStaleReturningUserStorage() {
  localStorage.setItem(STORAGE_VERSION_KEY, "0"); // old version
  localStorage.setItem(STORAGE_KEYS.onboardingComplete, "true");
  localStorage.setItem(STORAGE_KEYS.fuelType, '"diesel"');
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Stub fetch to return an empty station list so the component doesn't throw
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  } as unknown as Response);
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Lazy import Home after localStorage is configured so the useState
// initializers run against the correct store contents.
//
// Note: although ES modules are cached after the first import, React's
// `useState` lazy initializer runs on *every* component mount, not once per
// module. Each call to `render(<Home />)` below creates a new React tree and
// therefore re-executes `useStorageVersion`'s initializer with the current
// localStorage state.
// ---------------------------------------------------------------------------

async function renderHome() {
  const { ThemeProvider } = await import("@/app/providers");
  const { default: Home } = await import("@/app/page");
  render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("App start-up journeys", () => {
  describe("New user (no prior localStorage data)", () => {
    it("shows the onboarding wizard", async () => {
      await renderHome();
      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /welcome to pricepermile/i })
        ).toBeInTheDocument();
      });
    });

    it("sets the storage version key after first load", async () => {
      await renderHome();
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(
          String(STORAGE_VERSION)
        );
      });
    });
  });

  describe("Returning user – storage format unchanged (version match)", () => {
    beforeEach(() => {
      setValidReturningUserStorage();
    });

    it("does not show the onboarding wizard", async () => {
      await renderHome();
      await waitFor(() => {
        expect(
          screen.queryByRole("dialog", { name: /welcome to pricepermile/i })
        ).not.toBeInTheDocument();
      });
    });

    it("preserves persisted settings in localStorage without resetting them", async () => {
      await renderHome();
      await waitFor(() => {
        // Settings should not have been overwritten with defaults
        expect(localStorage.getItem(STORAGE_KEYS.fuelType)).toBe('"diesel"');
        expect(localStorage.getItem(STORAGE_KEYS.radiusMiles)).toBe("12");
        expect(localStorage.getItem(STORAGE_KEYS.onboardingComplete)).toBe("true");
      });
    });
  });

  describe("New user – storage format changed (version mismatch, no complete flag)", () => {
    beforeEach(() => {
      // Stale version but onboarding was never completed
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      localStorage.setItem(STORAGE_KEYS.fuelType, '"diesel"');
    });

    it("shows the onboarding wizard after clearing stale data", async () => {
      await renderHome();
      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /welcome to pricepermile/i })
        ).toBeInTheDocument();
      });
    });

    it("writes the new version to localStorage", async () => {
      await renderHome();
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(
          String(STORAGE_VERSION)
        );
      });
    });
  });

  describe("Returning user – storage format changed (version mismatch, complete flag set)", () => {
    beforeEach(() => {
      setStaleReturningUserStorage();
    });

    it("shows the onboarding wizard because stale data is cleared", async () => {
      await renderHome();
      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /welcome to pricepermile/i })
        ).toBeInTheDocument();
      });
    });

    it("clears the stale onboardingComplete flag from localStorage", async () => {
      await renderHome();
      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.onboardingComplete);
        expect(stored).not.toBe("true");
      });
    });

    it("does not retain the stale fuel type preference", async () => {
      await renderHome();
      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEYS.fuelType)).not.toBe('"diesel"');
      });
    });
  });
});
