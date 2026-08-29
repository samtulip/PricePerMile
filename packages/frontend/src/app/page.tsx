"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { TableSection } from "@/components/TableSection";
import { MapSection } from "@/components/MapSection";
import { SettingsPanel } from "@/components/SettingsPanel";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getUserLocation, calculateDistance, calculateCostToTravel } from "@/lib/geolocation";
import type { FuelType, PetrolStation, UserLocation, RankedStation } from "@/types";

const DEFAULT_FUEL: FuelType = "petrol";
const DEFAULT_RADIUS = 7;
const DEFAULT_MPG = 45;
const DEFAULT_FILL_UP_LITRES = 40;
const TABLE_PAGE_SIZE = 10;
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const STORAGE_KEYS = {
  fuelType: "pricepermile_fuelType",
  radiusMiles: "pricepermile_radiusMiles",
  milesPerGallon: "pricepermile_milesPerGallon",
  fillUpLitres: "pricepermile_fillUpLitres",
  selectedStationId: "pricepermile_selectedStationId",
  onboardingComplete: "pricepermile_onboardingComplete",
};

type StationWithCosts = PetrolStation & {
  distance: number;
  price: number;
  costToTravel: number | undefined;
  costOfFillUp: number | undefined;
  totalCost: number | undefined;
};

export default function Home() {
  // Persisted settings using custom hook
  const [selectedFuel, setSelectedFuel] = useLocalStorage<FuelType>(
    STORAGE_KEYS.fuelType,
    DEFAULT_FUEL,
    (value) => value === "petrol" || value === "diesel"
  );
  const [radiusMiles, setRadiusMiles] = useLocalStorage<number>(
    STORAGE_KEYS.radiusMiles,
    DEFAULT_RADIUS,
    (value) => typeof value === "number" && value > 0
  );
  const [milesPerGallon, setMilesPerGallon] = useLocalStorage<number>(
    STORAGE_KEYS.milesPerGallon,
    DEFAULT_MPG,
    (value) => typeof value === "number" && value > 0
  );
  const [fillUpLitres, setFillUpLitres] = useLocalStorage<number>(
    STORAGE_KEYS.fillUpLitres,
    DEFAULT_FILL_UP_LITRES,
    (value) => typeof value === "number" && value > 0
  );
  const [selectedStationId, setSelectedStationId] = useLocalStorage<string | null>(
    STORAGE_KEYS.selectedStationId,
    null
  );
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>(
    STORAGE_KEYS.onboardingComplete,
    false,
    (value) => typeof value === "boolean"
  );
  // UI state
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [showSettings, setShowSettings] = useState(false);

  // Data state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<PetrolStation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Get user location
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

  // Load station data
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

  // Calculate nearby stations with costs
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

  // Get top stations for map
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

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(nearbyStations.length / TABLE_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Get best total cost for reference
  const bestTotalCost = nearbyStations.reduce<number | undefined>((best, station) => {
    if (station.totalCost === undefined) return best;
    if (best === undefined || station.totalCost < best) return station.totalCost;
    return best;
  }, undefined);

  // Get selected station
  const selectedStation = selectedStationId
    ? nearbyStations.find((station) => station.id === selectedStationId)
    : undefined;

  const referenceStationCost = selectedStation?.totalCost ?? bestTotalCost;

  return (
    <>
      {!onboardingComplete && (
        <OnboardingWizard
          defaultFuel={selectedFuel}
          defaultMpg={milesPerGallon}
          defaultFillUpLitres={fillUpLitres}
          defaultRadiusMiles={radiusMiles}
          onComplete={({ fuelType, milesPerGallon, fillUpLitres, radiusMiles }) => {
            setSelectedFuel(fuelType);
            setMilesPerGallon(milesPerGallon);
            setFillUpLitres(fillUpLitres);
            setRadiusMiles(radiusMiles);
            setOnboardingComplete(true);
          }}
        />
      )}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((current) => !current)}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div
          id="settings-panel"
          role="region"
          aria-labelledby="settings-toggle"
          aria-hidden={!showSettings}
          inert={!showSettings ? "" : undefined}
          className={showSettings ? "mb-4" : "mb-0 h-0 overflow-hidden"}
        >
          <SettingsPanel
            selectedFuel={selectedFuel}
            onFuelChange={setSelectedFuel}
            milesPerGallon={milesPerGallon}
            onMpgChange={setMilesPerGallon}
            fillUpLitres={fillUpLitres}
            onFillUpChange={setFillUpLitres}
            radiusMiles={radiusMiles}
            onRadiusChange={setRadiusMiles}
            defaultMpg={DEFAULT_MPG}
            defaultFillUp={DEFAULT_FILL_UP_LITRES}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {viewMode === "table" ? (
            <TableSection
              stations={nearbyStations}
              radiusMiles={radiusMiles}
              isLoading={isLoadingLocation || isLoadingStations}
              error={error}
              currentPage={safeCurrentPage}
              pageSize={TABLE_PAGE_SIZE}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id || null)}
              referenceStationCost={referenceStationCost}
            />
          ) : (
            <MapSection
              stations={topStationsForMap}
              userLocation={userLocation}
              isLoading={isLoadingLocation || isLoadingStations}
              error={error}
              radiusMiles={radiusMiles}
            />
          )}
        </div>
      </main>
    </>
  );
}
