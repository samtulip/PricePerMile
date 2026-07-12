export type FuelType = "petrol" | "diesel";

export interface FuelPrice {
  type: FuelType;
  price: number; // Price in pence
  lastUpdated: Date;
}

export interface PetrolStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  prices: FuelPrice[];
  distance?: number; // Distance in miles from user location
  costToTravel?: number; // Cost to travel to this station in pence
  savings?: number; // Money saved compared to closer station in pence
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UserSettings {
  fuelType: FuelType;
  vehicleEconomy?: number; // Miles per gallon
  fuelTankCapacity?: number; // Gallons
  theme: "light" | "dark";
}
