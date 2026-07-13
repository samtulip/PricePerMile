"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { useTheme } from "@/app/providers";
import { getUserLocation, calculateDistance, calculateCostToTravel } from "@/lib/geolocation";
import type { FuelType, PetrolStation, UserLocation } from "@/types";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const DEFAULT_FUEL: FuelType = "petrol";
const DEFAULT_RADIUS = 7;
const DEFAULT_MPG = 45;
const DEFAULT_FILL_UP_LITRES = 40;
const TABLE_PAGE_SIZE = 10;
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const StationsMap = dynamic(() => import("@/components/StationsMap"), {
  ssr: false,
});
const STORAGE_KEYS = {
  fuelType: "pricepermile_fuelType",
  radiusMiles: "pricepermile_radiusMiles",
  milesPerGallon: "pricepermile_milesPerGallon",
  fillUpLitres: "pricepermile_fillUpLitres",
  selectedStationId: "pricepermile_selectedStationId",
};

type StationWithCosts = PetrolStation & {
  distance: number;
  price: number;
  costToTravel: number | undefined;
  costOfFillUp: number | undefined;
  totalCost: number | undefined;
};

type RankedStation = PetrolStation & {
  distance: number;
  price: number;
  costToTravel: number;
  costOfFillUp: number;
  totalCost: number;
};

export default function Home() {
  const { colorTheme, setColorTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_FUEL;
    }

    const storedFuel = localStorage.getItem(STORAGE_KEYS.fuelType);
    return storedFuel === "petrol" || storedFuel === "diesel"
      ? storedFuel
      : DEFAULT_FUEL;
  });
  const [radiusMiles, setRadiusMiles] = useState<number>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_RADIUS;
    }

    const storedRadius = localStorage.getItem(STORAGE_KEYS.radiusMiles);
    const parsedRadius = storedRadius ? Number(storedRadius) : NaN;
    return !Number.isNaN(parsedRadius) && parsedRadius > 0
      ? parsedRadius
      : DEFAULT_RADIUS;
  });
  const [milesPerGallon, setMilesPerGallon] = useState<number>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_MPG;
    }

    const storedMpg = localStorage.getItem(STORAGE_KEYS.milesPerGallon);
    const parsedMpg = storedMpg ? Number(storedMpg) : NaN;
    return !Number.isNaN(parsedMpg) && parsedMpg > 0
      ? parsedMpg
      : DEFAULT_MPG;
  });
  const [fillUpLitres, setFillUpLitres] = useState<number>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_FILL_UP_LITRES;
    }

    const storedFillUpLitres = localStorage.getItem(STORAGE_KEYS.fillUpLitres);
    const parsedFillUpLitres = storedFillUpLitres ? Number(storedFillUpLitres) : NaN;
    return !Number.isNaN(parsedFillUpLitres) && parsedFillUpLitres > 0
      ? parsedFillUpLitres
      : DEFAULT_FILL_UP_LITRES;
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<PetrolStation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.selectedStationId);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    getUserLocation()
      .then((location) => {
        setUserLocation(location);
        setError(null);
      })
      .catch(() => {
        setError(
          "Unable to access geolocation. Allow location access or set your browser permissions to use nearby station search."
        );
      })
      .finally(() => {
        setIsLoadingLocation(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/stations.json`)
      .then((response) => response.json())
      .then((data: PetrolStation[]) => {
        setStations(data);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load station data. Please try again later.");
      })
      .finally(() => {
        setIsLoadingStations(false);
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.fuelType, selectedFuel);
    localStorage.setItem(STORAGE_KEYS.radiusMiles, String(radiusMiles));
    localStorage.setItem(STORAGE_KEYS.milesPerGallon, String(milesPerGallon));
    localStorage.setItem(STORAGE_KEYS.fillUpLitres, String(fillUpLitres));
  }, [selectedFuel, radiusMiles, milesPerGallon, fillUpLitres]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedStationId) {
      localStorage.setItem(STORAGE_KEYS.selectedStationId, selectedStationId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedStationId);
    }
  }, [selectedStationId]);

  const nearbyStations = useMemo(() => {
    if (!userLocation || stations.length === 0) return [];

    return stations
      .map((station) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          station.latitude,
          station.longitude
        );

        const fuelPrice = station.prices.find((price) => price.type === selectedFuel);

        return {
          ...station,
          distance,
          price: fuelPrice?.price,
          costToTravel: fuelPrice
            ? calculateCostToTravel(distance, milesPerGallon, fuelPrice.price)
            : undefined,
          costOfFillUp: fuelPrice ? Math.round(fillUpLitres * fuelPrice.price) : undefined,
        };
      })
      .map((station) => ({
        ...station,
        totalCost:
          station.costToTravel !== undefined && station.costOfFillUp !== undefined
            ? station.costToTravel + station.costOfFillUp
            : undefined,
      }))
      .filter(
        (station): station is StationWithCosts =>
          station.price !== undefined && station.distance !== undefined
      )
      .filter((station) => station.distance <= radiusMiles)
      .sort((a, b) => {
        if (a.totalCost !== undefined && b.totalCost !== undefined) {
          if (a.totalCost === b.totalCost) return a.distance - b.distance;
          return a.totalCost - b.totalCost;
        }
        if (a.totalCost !== undefined) return -1;
        if (b.totalCost !== undefined) return 1;
        if (a.price === b.price) return a.distance - b.distance;
        return a.price - b.price;
      });
  }, [stations, selectedFuel, userLocation, radiusMiles, milesPerGallon, fillUpLitres]);

  const topStationsForMap = useMemo(
    () =>
      nearbyStations
        .filter(
          (station): station is RankedStation =>
            station.totalCost !== undefined &&
            station.costOfFillUp !== undefined &&
            station.costToTravel !== undefined
        )
        .slice(0, 5),
    [nearbyStations]
  );

  const totalPages = Math.max(1, Math.ceil(nearbyStations.length / TABLE_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedStations = useMemo(() => {
    const start = (safeCurrentPage - 1) * TABLE_PAGE_SIZE;
    return nearbyStations.slice(start, start + TABLE_PAGE_SIZE);
  }, [nearbyStations, safeCurrentPage]);

  const bestTotalCost = nearbyStations.reduce<number | undefined>((best, station) => {
    if (station.totalCost === undefined) return best;
    if (best === undefined || station.totalCost < best) return station.totalCost;
    return best;
  }, undefined);

  const selectedStation = selectedStationId
    ? nearbyStations.find((station) => station.id === selectedStationId)
    : undefined;

  // When selectedStation becomes undefined (station not in filtered results),
  // the UI will treat it as unselected, and referenceStationCost will fall back to bestTotalCost

  const referenceStationCost = selectedStation?.totalCost ?? bestTotalCost;

  const getSavingsLabel = (savingsPence: number, isSelected: boolean, isNegligibleDifference: boolean): string => {
    if (isNegligibleDifference) {
      return isSelected ? "Reference" : "Cheapest";
    }
    const savingsPounds = (Math.abs(savingsPence) / 100).toFixed(2);
    const direction = savingsPence > 0 ? "more" : "less";
    return `£${savingsPounds} ${direction}`;
  };

  return (
    <>
      <Header viewMode={viewMode} onViewModeChange={setViewMode} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {viewMode === "table" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Fuel Prices by Station</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Showing stations within {radiusMiles} miles of your device location.
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {isLoadingLocation || isLoadingStations ? (
                    <span>Loading station data...</span>
                  ) : error ? (
                    <span>{error}</span>
                  ) : nearbyStations.length === 0 ? (
                    <span>No stations found within your radius.</span>
                  ) : (
                    <span>
                      Showing {(safeCurrentPage - 1) * TABLE_PAGE_SIZE + 1}-
                      {Math.min(safeCurrentPage * TABLE_PAGE_SIZE, nearbyStations.length)} of{" "}
                      {nearbyStations.length} stations
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold">Station</th>
                      <th className="text-left py-3 px-4 font-semibold">Price (p/L)</th>
                      <th className="text-left py-3 px-4 font-semibold">Savings</th>
                      <th className="text-left py-3 px-4 font-semibold">Cost of Fill Up</th>
                      <th className="text-left py-3 px-4 font-semibold">Travel Cost</th>
                      <th className="text-left py-3 px-4 font-semibold">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedStations.map((station) => {
                      const savings =
                        referenceStationCost !== undefined && station.totalCost !== undefined
                          ? station.totalCost - referenceStationCost
                          : 0;
                      const isNegligibleDifference = Math.abs(savings) < 1; // Less than 1 pence difference
                      const isSelected = selectedStationId === station.id;
                      const handleRowClick = () => {
                        if (isSelected) {
                          setSelectedStationId(null);
                        } else {
                          setSelectedStationId(station.id);
                        }
                      };
                      const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick();
                        }
                      };
                      return (
                        <tr
                          key={station.id}
                          onClick={handleRowClick}
                          onKeyDown={handleKeyDown}
                          tabIndex={0}
                          aria-selected={isSelected}
                          className={`border-b border-slate-100 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 hover:bg-blue-100"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{station.name}</div>
                            <div className="text-xs text-slate-500">
                              {station.address}
                            </div>
                          </td>
                          <td className="py-3 px-4">{station.price?.toFixed(1)}p</td>
                          <td
                            className={`py-3 px-4 ${
                              isNegligibleDifference
                                ? "text-green-600"
                                : "text-slate-700"
                            }`}
                          >
                            {getSavingsLabel(savings, isSelected, isNegligibleDifference)}
                          </td>
                          <td className="py-3 px-4">
                            {station.costOfFillUp !== undefined
                              ? `£${(station.costOfFillUp / 100).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {station.costToTravel !== undefined
                              ? `£${(station.costToTravel / 100).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="py-3 px-4">{station.distance?.toFixed(1)} mi</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {nearbyStations.length > TABLE_PAGE_SIZE && (
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-slate-600">
                    Page {safeCurrentPage} of {totalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Fuel Prices Map</h2>
              {isLoadingLocation || isLoadingStations ? (
                <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video">
                  <p className="text-slate-500">Loading map data...</p>
                </div>
              ) : error ? (
                <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video px-6 text-center">
                  <p className="text-slate-500">{error}</p>
                </div>
              ) : topStationsForMap.length === 0 ? (
                <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video px-6 text-center">
                  <p className="text-slate-500">
                    No stations with full cost data were found within {radiusMiles} miles.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <StationsMap stations={topStationsForMap} userLocation={userLocation} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Showing top {topStationsForMap.length} stations ranked by total cost (fill-up + travel).
                  </p>
                </>
              )}
              <p className="text-xs text-slate-500 mt-4">
                Your selected fuel type, radius, MPG, and fill-up amount are saved to local storage.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            id="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left font-medium transition-colors hover:bg-slate-50"
            aria-expanded={showSettings}
            aria-controls="settings-panel"
          >
            <span>Settings</span>
            {showSettings ? (
              <ChevronUpIcon className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-slate-500" />
            )}
          </button>
          
          {showSettings && (
            <div 
              id="settings-panel" 
              role="region" 
              aria-labelledby="settings-toggle"
              className="mt-4 rounded-lg border border-slate-200 bg-white p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Fuel type</label>
                  <div className="flex gap-3">
                    {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
                      <button
                        type="button"
                        key={fuel}
                        onClick={() => setSelectedFuel(fuel)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                          selectedFuel === fuel
                            ? "bg-[var(--accent-600)] text-[var(--accent-on)]"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-2">Miles per gallon</span>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={1}
                    value={milesPerGallon}
                    onChange={(event) => setMilesPerGallon(Number(event.target.value))}
                    className="w-full"
                    aria-label="Miles per gallon slider"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={milesPerGallon}
                    onChange={(event) => {
                      const parsedValue = Number(event.target.value);
                      if (!Number.isNaN(parsedValue) && parsedValue > 0) {
                        setMilesPerGallon(parsedValue);
                      }
                    }}
                    className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    aria-label="Miles per gallon number input"
                  />
                  <div className="mt-2 text-sm text-slate-600">
                    {milesPerGallon} MPG. Default is {DEFAULT_MPG} MPG.
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-2">Fill-up amount (litres)</span>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={fillUpLitres}
                    onChange={(event) => setFillUpLitres(Number(event.target.value))}
                    className="w-full"
                    aria-label="Fill-up amount slider"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={fillUpLitres}
                    onChange={(event) => {
                      const parsedValue = Number(event.target.value);
                      if (!Number.isNaN(parsedValue) && parsedValue > 0) {
                        setFillUpLitres(parsedValue);
                      }
                    }}
                    className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    aria-label="Fill-up amount number input"
                  />
                  <div className="mt-2 text-sm text-slate-600">
                    {fillUpLitres} litres. Default is {DEFAULT_FILL_UP_LITRES} litres.
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-2">Search radius (miles)</span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={radiusMiles}
                    onChange={(event) => setRadiusMiles(Number(event.target.value))}
                    className="w-full"
                    aria-label="Search radius slider"
                  />
                  <div className="mt-2 text-sm text-slate-600">
                    {radiusMiles} miles
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label htmlFor="color-theme" className="block text-sm font-medium mb-2">
                  Color theme
                </label>
                <select
                  id="color-theme"
                  value={colorTheme}
                  onChange={(event) =>
                    setColorTheme(
                      event.target.value as "blue" | "green" | "purple" | "high-contrast"
                    )
                  }
                  className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 appearance-none"
                  aria-label="Select color theme"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
