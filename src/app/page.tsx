"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { getUserLocation, calculateDistance, calculateCostToTravel } from "@/lib/geolocation";
import type { FuelType, PetrolStation, UserLocation } from "@/types";
import { ListIcon, MapIcon } from "lucide-react";

const DEFAULT_FUEL: FuelType = "petrol";
const DEFAULT_RADIUS = 7;
const STORAGE_KEYS = {
  fuelType: "pricepermile_fuelType",
  radiusMiles: "pricepermile_radiusMiles",
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(DEFAULT_FUEL);
  const [radiusMiles, setRadiusMiles] = useState<number>(DEFAULT_RADIUS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<PetrolStation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedFuel = sessionStorage.getItem(STORAGE_KEYS.fuelType);
    const storedRadius = sessionStorage.getItem(STORAGE_KEYS.radiusMiles);

    if (storedFuel === "petrol" || storedFuel === "diesel") {
      setSelectedFuel(storedFuel);
    }

    const parsedRadius = storedRadius ? Number(storedRadius) : NaN;
    if (!Number.isNaN(parsedRadius) && parsedRadius > 0) {
      setRadiusMiles(parsedRadius);
    }

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
    fetch("/data/stations.json")
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
    sessionStorage.setItem(STORAGE_KEYS.fuelType, selectedFuel);
    sessionStorage.setItem(STORAGE_KEYS.radiusMiles, String(radiusMiles));
  }, [selectedFuel, radiusMiles]);

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
          costToTravel: fuelPrice ? calculateCostToTravel(distance) : undefined,
        };
      })
      .filter((station) => station.price !== undefined && station.distance !== undefined)
      .filter((station) => station.distance! <= radiusMiles)
      .sort((a, b) => {
        if (a.price === b.price) return a.distance! - b.distance!;
        return a.price! - b.price!;
      });
  }, [stations, selectedFuel, userLocation, radiusMiles]);

  const bestPrice = nearbyStations[0]?.price;

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
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
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
                      <th className="text-left py-3 px-4 font-semibold">Distance</th>
                      <th className="text-left py-3 px-4 font-semibold">Travel Cost</th>
                      <th className="text-left py-3 px-4 font-semibold">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearbyStations.map((station) => {
                      const savings = bestPrice ? station.price! - bestPrice : 0;
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
                          <td className="py-3 px-4">{station.distance?.toFixed(1)} mi</td>
                          <td className="py-3 px-4">
                            {station.costToTravel !== undefined
                              ? `£${(station.costToTravel / 100).toFixed(2)}`
                              : "—"}
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              savings <= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {savings <= 0
                              ? `£${Math.abs(savings / 100).toFixed(2)} saved`
                              : `£${(savings / 100).toFixed(2)} more`}
                          </td>
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
                Your selected radius and fuel type are saved in this session.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Search Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        ? "bg-blue-600 dark:bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
