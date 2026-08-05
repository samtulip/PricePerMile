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

  const openWaze = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium break-words sm:truncate">{station.name}</div>
          </div>
          <button
            onClick={openWaze}
            aria-label={`Open ${station.name} in Waze`}
            className="flex-shrink-0 p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Open in Waze"
          >
            <MapPin size={18} />
          </button>
        </div>
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4">
        <div className="flex flex-col gap-1">
          <div>{station.price?.toFixed(1)}p</div>
          <div className="text-xs text-slate-600">
            {station.costOfFillUp !== undefined ? formatPounds(station.costOfFillUp) : "—"}
          </div>
        </div>
      </td>
      <td
        className={`py-2 px-2 sm:py-3 sm:px-4 ${
          isNegligibleDifference ? "text-green-600" : "text-slate-700"
        }`}
      >
        {getSavingsLabel(savings, isSelected, isNegligibleDifference)}
      </td>
      <td className="hidden sm:table-cell py-2 px-2 sm:py-3 sm:px-4">
        {station.costOfFillUp !== undefined ? formatPounds(station.costOfFillUp) : "—"}
      </td>
      <td className="hidden sm:table-cell py-2 px-2 sm:py-3 sm:px-4">
        {station.costToTravel !== undefined ? formatPounds(station.costToTravel) : "—"}
      </td>
      <td className="hidden sm:table-cell py-2 px-2 sm:py-3 sm:px-4">
        {station.distance?.toFixed(1)} mi
      </td>
    </tr>
  );
}
