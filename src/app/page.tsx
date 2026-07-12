"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { getUserLocation, calculateDistance, calculateCostToTravel } from "@/lib/geolocation";
import type { FuelType, PetrolStation, UserLocation } from "@/types";
import { ListIcon, MapIcon } from "lucide-react";

const DEFAULT_FUEL: FuelType = "petrol";
const DEFAULT_RADIUS = 7;
const DEFAULT_MPG = 45;
const DEFAULT_FILL_UP_LITRES = 40;
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const STORAGE_KEYS = {
  fuelType: "pricepermile_fuelType",
  radiusMiles: "pricepermile_radiusMiles",
  milesPerGallon: "pricepermile_milesPerGallon",
  fillUpLitres: "pricepermile_fillUpLitres",
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
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
      .filter((station) => station.price !== undefined && station.distance !== undefined)
      .filter((station) => station.distance! <= radiusMiles)
      .sort((a, b) => {
        if (a.totalCost !== undefined && b.totalCost !== undefined) {
          if (a.totalCost === b.totalCost) return a.distance! - b.distance!;
          return a.totalCost - b.totalCost;
        }
        if (a.totalCost !== undefined) return -1;
        if (b.totalCost !== undefined) return 1;
        if (a.price === b.price) return a.distance! - b.distance!;
        return a.price! - b.price!;
      });
  }, [stations, selectedFuel, userLocation, radiusMiles, milesPerGallon, fillUpLitres]);

  const bestTotalCost = nearbyStations.reduce<number | undefined>((best, station) => {
    if (station.totalCost === undefined) return best;
    if (best === undefined || station.totalCost < best) return station.totalCost;
    return best;
  }, undefined);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-3">
              {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFuel === fuel
                      ? "bg-[var(--accent-600)] text-[var(--accent-on)]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  viewMode === "map"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {viewMode === "table" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Fuel Prices by Station</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Showing stations within {radiusMiles} miles of your device location.
                  </p>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  {isLoadingLocation || isLoadingStations ? (
                    <span>Loading station data...</span>
                  ) : error ? (
                    <span>{error}</span>
                  ) : nearbyStations.length === 0 ? (
                    <span>No stations found within your radius.</span>
                  ) : (
                    <span>{nearbyStations.length} stations found</span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold">Station</th>
                      <th className="text-left py-3 px-4 font-semibold">Price (p/L)</th>
                      <th className="text-left py-3 px-4 font-semibold">Savings</th>
                      <th className="text-left py-3 px-4 font-semibold">Cost of Fill Up</th>
                      <th className="text-left py-3 px-4 font-semibold">Travel Cost</th>
                      <th className="text-left py-3 px-4 font-semibold">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearbyStations.map((station) => {
                      const savings =
                        bestTotalCost !== undefined && station.totalCost !== undefined
                          ? station.totalCost - bestTotalCost
                          : 0;
                      return (
                        <tr
                          key={station.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{station.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {station.address}
                            </div>
                          </td>
                          <td className="py-3 px-4">{station.price?.toFixed(1)}p</td>
                          <td
                            className={`py-3 px-4 ${
                              savings === 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {savings === 0
                              ? "Cheapest"
                              : `£${(savings / 100).toFixed(2)} more`}
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
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Fuel Prices Map</h2>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center aspect-video">
                <div className="text-center">
                  <MapIcon className="w-12 h-12 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Map integration coming soon. Station coordinates are loaded from JSON and ready for mapping.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Your selected fuel type, radius, MPG, and fill-up amount are saved to local storage.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Search Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Search radius (miles)</label>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={radiusMiles}
                onChange={(event) => setRadiusMiles(Number(event.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {radiusMiles} miles
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel type</label>
              <div className="flex gap-3">
                {(["petrol", "diesel"] as FuelType[]).map((fuel) => (
                  <button
                    key={fuel}
                    onClick={() => setSelectedFuel(fuel)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                      selectedFuel === fuel
                        ? "bg-[var(--accent-600)] text-[var(--accent-on)]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Miles per gallon</label>
              <input
                type="range"
                min={10}
                max={80}
                step={1}
                value={milesPerGallon}
                onChange={(event) => setMilesPerGallon(Number(event.target.value))}
                className="w-full"
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
                className="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {milesPerGallon} MPG. Default is {DEFAULT_MPG} MPG.
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fill-up amount (litres)</label>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={fillUpLitres}
                onChange={(event) => setFillUpLitres(Number(event.target.value))}
                className="w-full"
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
                className="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {fillUpLitres} litres. Default is {DEFAULT_FILL_UP_LITRES} litres.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
