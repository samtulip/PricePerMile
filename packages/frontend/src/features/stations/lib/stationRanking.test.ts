import { describe, expect, it, vi } from "vitest";
import {
  getBestTotalCost,
  getPaginationWindow,
  getReferenceStationCost,
  getTopRankedStations,
  rankStations,
} from "@/features/stations/lib/stationRanking";
import type { PetrolStation, UserLocation } from "@/types";

vi.mock("@/lib/geolocation", () => ({
  calculateDistance: vi.fn((_lat1, _lon1, lat2: number) => lat2),
  calculateCostToTravel: vi.fn((distance: number) => Math.round(distance * 10)),
}));

const userLocation: UserLocation = {
  latitude: 51.5,
  longitude: -0.12,
};

const stations: PetrolStation[] = [
  {
    id: "closest-cheapest",
    name: "Closest Cheapest",
    address: "A",
    latitude: 1,
    longitude: 0,
    prices: [
      { type: "petrol", price: 150, lastUpdated: "2026-08-30T00:00:00Z" },
      { type: "diesel", price: 160, lastUpdated: "2026-08-30T00:00:00Z" },
    ],
  },
  {
    id: "same-total-further",
    name: "Same Total Further",
    address: "B",
    latitude: 2,
    longitude: 0,
    prices: [{ type: "petrol", price: 140, lastUpdated: "2026-08-30T00:00:00Z" }],
  },
  {
    id: "missing-fuel",
    name: "Missing Fuel",
    address: "C",
    latitude: 3,
    longitude: 0,
    prices: [{ type: "diesel", price: 145, lastUpdated: "2026-08-30T00:00:00Z" }],
  },
  {
    id: "outside-radius",
    name: "Outside Radius",
    address: "D",
    latitude: 9,
    longitude: 0,
    prices: [{ type: "petrol", price: 130, lastUpdated: "2026-08-30T00:00:00Z" }],
  },
];

describe("stationRanking", () => {
  it("filters to the selected fuel, removes stations outside the radius, and sorts by total cost", () => {
    const rankedStations = rankStations({
      stations,
      userLocation,
      selectedFuel: "petrol",
      radiusMiles: 5,
      milesPerGallon: 45,
      fillUpLitres: 1,
    });

    expect(rankedStations.map((station) => station.id)).toEqual([
      "closest-cheapest",
      "same-total-further",
    ]);
    expect(rankedStations[0]).toMatchObject({
      price: 150,
      distance: 1,
      costToTravel: 10,
      costOfFillUp: 150,
      totalCost: 160,
    });
  });

  it("uses distance as the tie-breaker when total cost matches", () => {
    const rankedStations = rankStations({
      stations,
      userLocation,
      selectedFuel: "petrol",
      radiusMiles: 5,
      milesPerGallon: 44,
      fillUpLitres: 1,
    });

    expect(rankedStations.map((station) => station.id)).toEqual([
      "closest-cheapest",
      "same-total-further",
    ]);
  });

  it("returns reference cost from the selected station when available", () => {
    const rankedStations = rankStations({
      stations,
      userLocation,
      selectedFuel: "petrol",
      radiusMiles: 5,
      milesPerGallon: 45,
      fillUpLitres: 1,
    });

    expect(getBestTotalCost(rankedStations)).toBe(160);
    expect(getReferenceStationCost(rankedStations, "same-total-further")).toBe(160);
    expect(getReferenceStationCost(rankedStations, null)).toBe(160);
  });

  it("returns only fully ranked stations for the map and clamps pagination bounds", () => {
    const rankedStations = rankStations({
      stations,
      userLocation,
      selectedFuel: "petrol",
      radiusMiles: 10,
      milesPerGallon: 45,
      fillUpLitres: 1,
    });

    expect(getTopRankedStations(rankedStations, 1).map((station) => station.id)).toEqual([
      "closest-cheapest",
    ]);
    expect(getPaginationWindow(rankedStations.length, 99, 2)).toEqual({
      currentPage: 2,
      totalPages: 2,
      startIndex: 2,
    });
  });
});
