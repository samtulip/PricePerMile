import { STATIONS_DATA_PATH } from "@/features/stations/config";
import type { PetrolStation } from "@/types";

export async function fetchStations(): Promise<PetrolStation[]> {
  const response = await fetch(STATIONS_DATA_PATH);
  if (!response.ok) {
    throw new Error("Unable to load station data.");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Station data payload is invalid.");
  }

  return data as PetrolStation[];
}
