#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { FuelFinderClient } from "fuel-finder-gov-uk";

// Petrol and diesel preference order matches the legacy CSV converter.
const PETROL_PREFERENCE = ["E10", "E5"];
const DIESEL_PREFERENCE = ["B7", "B7S", "B7P", "B10", "HVO", "SDV"];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildAddress(location) {
  if (!location) {
    return "";
  }

  const parts = [
    location.address_line_1,
    location.address_line_2,
    location.city,
    location.county,
    location.postcode,
  ].filter((part) => Boolean(part));

  return parts.join(", ");
}

function pickPreferredPrice(pricesByCode, preferredCodes) {
  for (const code of preferredCodes) {
    if (pricesByCode.has(code)) {
      return pricesByCode.get(code);
    }
  }

  return undefined;
}

function buildStation(priceStation, infoStation, fallbackIndex) {
  const location = infoStation?.location;
  const latitude = location?.latitude ?? null;
  const longitude = location?.longitude ?? null;

  if (latitude === null || longitude === null) {
    return undefined;
  }

  const rawName =
    priceStation.trading_name ||
    priceStation.mft_organisation_name ||
    infoStation?.trading_name ||
    infoStation?.brand_name ||
    `Station ${fallbackIndex + 1}`;

  const nodeId = priceStation.node_id || String(fallbackIndex + 1);
  const id = slugify(`${nodeId}-${rawName}`) || `station-${fallbackIndex + 1}`;

  const prices = [];
  const pricesByCode = new Map();

  for (const entry of priceStation.fuel_prices ?? []) {
    if (entry.price === null || entry.price === undefined) {
      continue;
    }

    const fuelType = (entry.fuel_type ?? "").toUpperCase();
    const lastUpdatedRaw =
      entry.price_change_effective_timestamp || entry.price_last_updated;
    const lastUpdated = lastUpdatedRaw
      ? new Date(lastUpdatedRaw).toISOString()
      : new Date().toISOString();

    const priceEntry = {
      type: fuelType.toLowerCase(),
      price: entry.price,
      lastUpdated,
    };

    pricesByCode.set(fuelType, priceEntry);
    prices.push(priceEntry);
  }

  const petrol = pickPreferredPrice(pricesByCode, PETROL_PREFERENCE);
  if (petrol) {
    prices.unshift({
      type: "petrol",
      price: petrol.price,
      lastUpdated: petrol.lastUpdated,
    });
  }

  const diesel = pickPreferredPrice(pricesByCode, DIESEL_PREFERENCE);
  if (diesel) {
    prices.unshift({
      type: "diesel",
      price: diesel.price,
      lastUpdated: diesel.lastUpdated,
    });
  }

  if (prices.length === 0) {
    return undefined;
  }

  return {
    id,
    name: rawName,
    address: buildAddress(location),
    latitude,
    longitude,
    prices,
  };
}

async function main() {
  const clientId = process.env.FUEL_FINDER_CLIENT_ID?.trim();
  const clientSecret = process.env.FUEL_FINDER_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "FUEL_FINDER_CLIENT_ID and FUEL_FINDER_CLIENT_SECRET environment variables are required.\n" +
      "Register for credentials at https://www.fuel-finder.service.gov.uk/"
    );
  }

  const outputPath = path.resolve(
    process.cwd(),
    process.env.FUEL_FINDER_OUTPUT_PATH || "public/data/stations.json"
  );

  const client = new FuelFinderClient({ clientId, clientSecret });

  console.log("Fetching fuel prices...");
  const [fuelPrices, stationInfo] = await Promise.all([
    client.getAllPFSFuelPrices(),
    client.getPFSInfo(),
  ]);

  const infoByNodeId = new Map(stationInfo.map((s) => [s.node_id, s]));

  const stations = fuelPrices
    .map((priceStation, index) =>
      buildStation(priceStation, infoByNodeId.get(priceStation.node_id), index)
    )
    .filter(Boolean);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(stations, null, 2)}\n`, "utf8");

  console.log(`Synced ${stations.length} stations to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
