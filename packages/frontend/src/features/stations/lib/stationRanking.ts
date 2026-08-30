import { MAX_MAP_STATIONS } from "@/features/stations/config";
import type {
  PaginationWindow,
  RankedStation,
  StationRankingOptions,
  StationWithCosts,
} from "@/features/stations/types";
import { calculateCostToTravel, calculateDistance } from "@/lib/geolocation";

function compareStations(a: StationWithCosts, b: StationWithCosts): number {
  if (a.totalCost !== undefined && b.totalCost !== undefined) {
    if (a.totalCost === b.totalCost) {
      return a.distance - b.distance;
    }

    return a.totalCost - b.totalCost;
  }

  if (a.totalCost !== undefined) {
    return -1;
  }

  if (b.totalCost !== undefined) {
    return 1;
  }

  if (a.price === b.price) {
    return a.distance - b.distance;
  }

  return a.price - b.price;
}

function isRankedStation(station: StationWithCosts): station is RankedStation {
  return (
    station.totalCost !== undefined &&
    station.costOfFillUp !== undefined &&
    station.costToTravel !== undefined
  );
}

export function rankStations({
  stations,
  userLocation,
  selectedFuel,
  radiusMiles,
  milesPerGallon,
  fillUpLitres,
}: StationRankingOptions): StationWithCosts[] {
  if (!userLocation || stations.length === 0) {
    return [];
  }

  return stations
    .map((station) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      );
      const fuelPrice = station.prices.find((price) => price.type === selectedFuel);

      const costToTravel = fuelPrice
        ? calculateCostToTravel(distance, milesPerGallon, fuelPrice.price)
        : undefined;
      const costOfFillUp = fuelPrice ? Math.round(fillUpLitres * fuelPrice.price) : undefined;

      return {
        ...station,
        distance,
        price: fuelPrice?.price,
        costToTravel,
        costOfFillUp,
        totalCost:
          costToTravel !== undefined && costOfFillUp !== undefined
            ? costToTravel + costOfFillUp
            : undefined,
      };
    })
    .filter((station): station is StationWithCosts => station.price !== undefined)
    .filter((station) => station.distance <= radiusMiles)
    .sort(compareStations);
}

export function getTopRankedStations(
  stations: StationWithCosts[],
  limit: number = MAX_MAP_STATIONS
): RankedStation[] {
  return stations.filter(isRankedStation).slice(0, limit);
}

export function getBestTotalCost(stations: StationWithCosts[]): number | undefined {
  return stations.reduce<number | undefined>((best, station) => {
    if (station.totalCost === undefined) {
      return best;
    }

    if (best === undefined || station.totalCost < best) {
      return station.totalCost;
    }

    return best;
  }, undefined);
}

export function getReferenceStationCost(
  stations: StationWithCosts[],
  selectedStationId: string | null
): number | undefined {
  const selectedStation = selectedStationId
    ? stations.find((station) => station.id === selectedStationId)
    : undefined;

  return selectedStation?.totalCost ?? getBestTotalCost(stations);
}

export function getPaginationWindow(
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationWindow {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  return {
    currentPage: safeCurrentPage,
    totalPages,
    startIndex: (safeCurrentPage - 1) * pageSize,
  };
}
