"use client";

import type { PetrolStation } from "@/types";
import { formatPounds } from "@/utils/formatters";

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
      <td className="py-3 px-4">
        <div className="font-medium">{station.name}</div>
        <div className="text-xs text-slate-500">{station.address}</div>
      </td>
      <td className="py-3 px-4">{station.price?.toFixed(1)}p</td>
      <td
        className={`py-3 px-4 ${
          isNegligibleDifference ? "text-green-600" : "text-slate-700"
        }`}
      >
        {getSavingsLabel(savings, isSelected, isNegligibleDifference)}
      </td>
      <td className="py-3 px-4">
        {station.costOfFillUp !== undefined ? formatPounds(station.costOfFillUp) : "—"}
      </td>
      <td className="py-3 px-4">
        {station.costToTravel !== undefined ? formatPounds(station.costToTravel) : "—"}
      </td>
      <td className="py-3 px-4">{station.distance?.toFixed(1)} mi</td>
    </tr>
  );
}
