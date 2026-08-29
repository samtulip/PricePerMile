import { afterEach, describe, expect, it } from "vitest";
import {
  initializeStorage,
  STORAGE_VERSION,
  STORAGE_VERSION_KEY,
} from "@/lib/storageVersion";

afterEach(() => {
  localStorage.clear();
});

describe("initializeStorage", () => {
  describe("new user (no prior localStorage data)", () => {
    it("sets the current storage version", () => {
      initializeStorage();
      expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(
        String(STORAGE_VERSION)
      );
    });

    it("returns false (no reinitialization needed for a blank store)", () => {
      const result = initializeStorage();
      expect(result).toBe(false);
    });
  });

  describe("returning user – storage format unchanged (same version)", () => {
    it("returns false and leaves existing data intact", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      localStorage.setItem("pricepermile_fuelType", '"diesel"');
      localStorage.setItem("pricepermile_radiusMiles", "10");

      const result = initializeStorage();

      expect(result).toBe(false);
      expect(localStorage.getItem("pricepermile_fuelType")).toBe('"diesel"');
      expect(localStorage.getItem("pricepermile_radiusMiles")).toBe("10");
    });

    it("does not alter the stored version key", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));

      initializeStorage();

      expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(
        String(STORAGE_VERSION)
      );
    });
  });

  describe("returning user – storage format changed (version mismatch)", () => {
    it("returns true to signal reinitialization when stale data exists", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      localStorage.setItem("pricepermile_fuelType", '"petrol"');
      const result = initializeStorage();
      expect(result).toBe(true);
    });

    it("returns false when only the version key is stale (no real data to clear)", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      const result = initializeStorage();
      expect(result).toBe(false);
    });

    it("clears all pricepermile_* data keys but not the version key itself during scan", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      localStorage.setItem("pricepermile_fuelType", '"petrol"');
      localStorage.setItem("pricepermile_onboardingComplete", "true");
      localStorage.setItem("pricepermile_radiusMiles", "5");

      initializeStorage();

      expect(localStorage.getItem("pricepermile_fuelType")).toBeNull();
      expect(localStorage.getItem("pricepermile_onboardingComplete")).toBeNull();
      expect(localStorage.getItem("pricepermile_radiusMiles")).toBeNull();
    });

    it("writes the new version number after clearing", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      localStorage.setItem("pricepermile_fuelType", '"petrol"');

      initializeStorage();

      expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(
        String(STORAGE_VERSION)
      );
    });

    it("preserves non-app keys that do not share the prefix", () => {
      localStorage.setItem(STORAGE_VERSION_KEY, "0");
      localStorage.setItem("pricepermile_fuelType", '"petrol"');
      localStorage.setItem("unrelated_setting", "keep-me");

      initializeStorage();

      expect(localStorage.getItem("unrelated_setting")).toBe("keep-me");
    });
  });
});
