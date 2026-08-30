"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { MapSection } from "@/components/MapSection";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TableSection } from "@/components/TableSection";
import {
  DEFAULT_FILL_UP_LITRES,
  DEFAULT_FUEL,
  DEFAULT_MPG,
  DEFAULT_RADIUS,
  STORAGE_KEYS,
} from "@/features/settings/config";
import { isBoolean, isFuelType, isPositiveNumber } from "@/features/settings/utils";
import { TABLE_PAGE_SIZE } from "@/features/stations/config";
import { fetchStations } from "@/features/stations/lib/stationData";
import {
  getPaginationWindow,
  getReferenceStationCost,
  getTopRankedStations,
  rankStations,
} from "@/features/stations/lib/stationRanking";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStorageVersion } from "@/hooks/useStorageVersion";
import { getUserLocation } from "@/lib/geolocation";
import type { FuelType, PetrolStation, UserLocation } from "@/types";

export default function Home() {
  // Run version check first so useLocalStorage reads see clean state on migration
  useStorageVersion();

  // Persisted settings using custom hook
  const [selectedFuel, setSelectedFuel] = useLocalStorage<FuelType>(
    STORAGE_KEYS.fuelType,
    DEFAULT_FUEL,
    isFuelType
  );
  const [radiusMiles, setRadiusMiles] = useLocalStorage<number>(
    STORAGE_KEYS.radiusMiles,
    DEFAULT_RADIUS,
    isPositiveNumber
  );
  const [milesPerGallon, setMilesPerGallon] = useLocalStorage<number>(
    STORAGE_KEYS.milesPerGallon,
    DEFAULT_MPG,
    isPositiveNumber
  );
  const [fillUpLitres, setFillUpLitres] = useLocalStorage<number>(
    STORAGE_KEYS.fillUpLitres,
    DEFAULT_FILL_UP_LITRES,
    isPositiveNumber
  );
  const [selectedStationId, setSelectedStationId] = useLocalStorage<string | null>(
    STORAGE_KEYS.selectedStationId,
    null
  );
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>(
    STORAGE_KEYS.onboardingComplete,
    false,
    isBoolean
  );
  // UI state
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [showSettings, setShowSettings] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Data state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<PetrolStation[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Get user location
  useEffect(() => {
    if (typeof window === "undefined") return;

    getUserLocation()
      .then((location) => {
        setUserLocation(location);
        setLocationError(null);
      })
      .catch(() => {
        setLocationError(
          "Unable to access geolocation. Allow location access or set your browser permissions to use nearby station search."
        );
      })
      .finally(() => {
        setIsLoadingLocation(false);
      });
  }, []);

  // Load station data
  useEffect(() => {
    fetchStations()
      .then((data: PetrolStation[]) => {
        setStations(data);
        setStationsError(null);
      })
      .catch(() => {
        setStationsError("Unable to load station data. Please try again later.");
      })
      .finally(() => {
        setIsLoadingStations(false);
      });
  }, []);

  // Calculate nearby stations with costs
  const nearbyStations = useMemo(() => {
    return rankStations({
      stations,
      userLocation,
      selectedFuel,
      radiusMiles,
      milesPerGallon,
      fillUpLitres,
    });
  }, [stations, selectedFuel, userLocation, radiusMiles, milesPerGallon, fillUpLitres]);

  // Get top stations for map
  const topStationsForMap = useMemo(() => getTopRankedStations(nearbyStations), [nearbyStations]);
  const { currentPage: safeCurrentPage, totalPages } = useMemo(
    () => getPaginationWindow(nearbyStations.length, currentPage, TABLE_PAGE_SIZE),
    [nearbyStations.length, currentPage]
  );
  const referenceStationCost = useMemo(
    () => getReferenceStationCost(nearbyStations, selectedStationId),
    [nearbyStations, selectedStationId]
  );
  const error = stationsError ?? locationError;

  return (
    <>
      {(!onboardingComplete || showWizard) && (
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
            setShowWizard(false);
          }}
        />
      )}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((current) => !current)}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-8 py-3 sm:py-8">
        <div
          id="settings-panel"
          role="region"
          aria-labelledby="settings-toggle"
          aria-hidden={!showSettings}
          inert={!showSettings ? true : undefined}
          className={showSettings ? "mb-3 sm:mb-4" : "mb-0 h-0 overflow-hidden"}
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
            onOpenWizard={() => {
              setShowSettings(false);
              setShowWizard(true);
            }}
          />
        </div>

        <div className="bg-white p-0 sm:rounded-lg sm:border sm:border-slate-200 sm:p-6">
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
