"use client";

import dynamic from "next/dynamic";
import type { RankedStation, UserLocation } from "@/types";

const StationsMap = dynamic(() => import("@/components/StationsMap"), {
  ssr: false,
});

interface MapSectionProps {
  stations: RankedStation[];
  userLocation: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  radiusMiles: number;
}

export function MapSection({
  stations,
  userLocation,
  isLoading,
  error,
  radiusMiles,
}: MapSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Fuel Prices Map</h2>
      {isLoading ? (
        <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video">
          <p className="text-slate-500">Loading map data...</p>
        </div>
      ) : error ? (
        <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video px-6 text-center">
          <p className="text-slate-500">{error}</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="w-full bg-slate-100 rounded-lg flex items-center justify-center aspect-video px-6 text-center">
          <p className="text-slate-500">
            No stations with full cost data were found within {radiusMiles} miles.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <StationsMap stations={stations} userLocation={userLocation} />
          </div>
          <p className="text-sm text-slate-600">
            Showing top {stations.length} stations ranked by total cost (fill-up + travel).
          </p>
        </>
      )}
      <p className="text-xs text-slate-500 mt-4">
        Your selected fuel type, radius, MPG, and fill-up amount are saved to local storage.
      </p>
    </div>
  );
}
