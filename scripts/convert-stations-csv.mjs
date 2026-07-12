#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const FUEL_CODES = ["E5", "E10", "B7S", "B7P", "B10", "HVO"];
const PETROL_PREFERENCE = ["E10", "E5"];
const DIESEL_PREFERENCE = ["B7S", "B7P", "B10", "HVO"];

function parseCsv(content) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(current);
      current = "";

      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }

      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, ""));

  return rows.slice(1).map((values) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = (values[index] ?? "").trim();
    });

    return record;
  });
}

function toNumber(value) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function pickTimestamp(row, fuelCode) {
  const fuelUpdated = row[`forecourts.price_change_effective_timestamp.${fuelCode}`]
    || row[`forecourts.price_submission_timestamp.${fuelCode}`];
  const stationUpdated = row.forecourt_update_timestamp;
  const candidate = fuelUpdated || stationUpdated;

  if (!candidate) {
    return new Date().toISOString();
  }

  const asDate = new Date(candidate);
  if (Number.isNaN(asDate.getTime())) {
    return new Date().toISOString();
  }

  return asDate.toISOString();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildAddress(row) {
  const parts = [
    row["forecourts.location.address_line_1"],
    row["forecourts.location.address_line_2"],
    row["forecourts.location.city"],
    row["forecourts.location.county"],
    row["forecourts.location.postcode"],
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

function rowToStation(row, fallbackIndex) {
  const latitude = toNumber(row["forecourts.location.latitude"]);
  const longitude = toNumber(row["forecourts.location.longitude"]);

  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  const rawName = row["forecourts.trading_name"] || row["forecourts.brand_name"] || `Station ${fallbackIndex + 1}`;
  const nodeId = row["forecourts.node_id"] || String(fallbackIndex + 1);
  const id = slugify(`${nodeId}-${rawName}`) || `station-${fallbackIndex + 1}`;

  const prices = [];
  const pricesByCode = new Map();

  for (const code of FUEL_CODES) {
    const price = toNumber(row[`forecourts.fuel_price.${code}`]);
    if (price === undefined) {
      continue;
    }

    const lastUpdated = pickTimestamp(row, code);
    const priceEntry = {
      type: code.toLowerCase(),
      price,
      lastUpdated,
    };

    pricesByCode.set(code, priceEntry);
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

  return {
    id,
    name: rawName,
    address: buildAddress(row),
    latitude,
    longitude,
    prices,
  };
}

function convertCsvToStations(inputPath, outputPath) {
  const csvContent = fs.readFileSync(inputPath, "utf8");
  const records = parseCsv(csvContent);

  const stations = records
    .map((row, index) => rowToStation(row, index))
    .filter((station) => station && station.prices.length > 0);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(stations, null, 2)}\n`, "utf8");

  return stations.length;
}

function printUsage() {
  console.log("Usage: node scripts/convert-stations-csv.mjs <input.csv> [output.json]");
}

function main() {
  const [, , inputArg, outputArg] = process.argv;

  if (!inputArg) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const outputPath = path.resolve(
    process.cwd(),
    outputArg || "public/data/stations.json"
  );

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const count = convertCsvToStations(inputPath, outputPath);
  console.log(`Converted ${count} stations to ${outputPath}`);
}

main();
