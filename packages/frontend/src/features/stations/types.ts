import type { FuelType, PetrolStation, RankedStation, UserLocation } from "@/types";

export type StationWithCosts = PetrolStation & {
  distance: number;
  price: number;
  costToTravel: number | undefined;
  costOfFillUp: number | undefined;
  totalCost: number | undefined;
};

export interface StationRankingOptions {
  stations: PetrolStation[];
  userLocation: UserLocation | null;
  selectedFuel: FuelType;
  radiusMiles: number;
  milesPerGallon: number;
  fillUpLitres: number;
}

export interface PaginationWindow {
  currentPage: number;
  totalPages: number;
  startIndex: number;
}

export type { RankedStation };
