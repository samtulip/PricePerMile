"use client";

import type { PetrolStation } from "@/types";
import { StationTableRow } from "@/components/StationTableRow";

interface TableSectionProps {
  stations: (PetrolStation & {
    distance: number;
    price: number;
    costToTravel: number | undefined;
    costOfFillUp: number | undefined;
    totalCost: number | undefined;
  })[];
  radiusMiles: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  referenceStationCost: number | undefined;
}

export function TableSection({
  stations,
  radiusMiles,
  isLoading,
  error,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  selectedStationId,
  onSelectStation,
  referenceStationCost,
}: TableSectionProps) {
  const startIndex = (currentPage - 1) * pageSize;
  const pagedStations = stations.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (id: string) => {
    if (selectedStationId === id) {
      onSelectStation("");
    } else {
      onSelectStation(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Fuel Prices by Station</h2>
          <p className="text-sm text-slate-500 mt-1">
            Showing stations within {radiusMiles} miles of your device location.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          {isLoading ? (
            <span>Loading station data...</span>
          ) : error ? (
            <span>{error}</span>
          ) : stations.length === 0 ? (
            <span>No stations found within your radius.</span>
          ) : (
            <span>
              Showing {startIndex + 1}-{Math.min(currentPage * pageSize, stations.length)} of{" "}
              {stations.length} stations
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
            {pagedStations.map((station) => (
              <StationTableRow
                key={station.id}
                station={station}
                referenceStationCost={referenceStationCost}
                isSelected={selectedStationId === station.id}
                onSelect={() => handleRowClick(station.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {stations.length > pageSize && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
