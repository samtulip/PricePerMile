"use client";

import type { PetrolStation } from "@/types";
import { formatPounds } from "@/utils/formatters";
import { MapPin } from "lucide-react";

interface StationTableRowProps {
  station: PetrolStation & {
    distance: number;
    price: number;
    costToTravel: number | undefined;
    costOfFillUp: number | undefined;
    totalCost: number | undefined;
  };
  referenceStationCost: number | undefined;
  isSelected: boolean;
  onSelect: () => void;
}

export function StationTableRow({
  station,
  referenceStationCost,
  isSelected,
  onSelect,
}: StationTableRowProps) {
  const savings =
    referenceStationCost !== undefined && station.totalCost !== undefined
      ? station.totalCost - referenceStationCost
      : 0;
  const isNegligibleDifference = Math.abs(savings) < 1; // Less than 1 pence difference

  const getSavingsLabel = (
    savingsPence: number,
    isSelected: boolean,
    isNegligibleDifference: boolean
  ): string => {
    if (isNegligibleDifference) {
      return isSelected ? "Reference" : "Cheapest";
    }
    const savingsPounds = (Math.abs(savingsPence) / 100).toFixed(2);
    const direction = savingsPence > 0 ? "more" : "less";
    return `£${savingsPounds} ${direction}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const openInMaps = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Open Waze with the station coordinates
    const wazeUrl = `https://waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes`;
    
    window.open(wazeUrl, "_blank");
  };

  return (
    <tr
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-selected={isSelected}
      className={`border-b border-slate-100 transition-colors cursor-pointer ${
        isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"
      }`}
    >
      <td className="py-2 px-2 sm:py-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium text-sm sm:text-base">{station.name}</div>
          <button
            type="button"
            onClick={openInMaps}
            className="flex-shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label={`Open ${station.name} in maps`}
            title="Open in maps"
          >
            <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base">{station.price?.toFixed(1)}p</td>
      <td
        className={`py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base ${
          isNegligibleDifference ? "text-green-600" : "text-slate-700"
        }`}
      >
        {getSavingsLabel(savings, isSelected, isNegligibleDifference)}
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base">
        {station.costOfFillUp !== undefined ? formatPounds(station.costOfFillUp) : "—"}
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base">
        {station.costToTravel !== undefined ? formatPounds(station.costToTravel) : "—"}
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base">{station.distance?.toFixed(1)} mi</td>
    </tr>
  );
}
