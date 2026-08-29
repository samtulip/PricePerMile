#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { convertCsvToStations } from "./convert-stations-csv.mjs";

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildHeaders() {
  const headers = {};
  const apiKey = process.env.FUEL_FINDER_API_KEY?.trim();
  const apiKeyHeader = process.env.FUEL_FINDER_API_KEY_HEADER?.trim() || "x-api-key";
  const authToken = process.env.FUEL_FINDER_AUTH_TOKEN?.trim();
  const authScheme = process.env.FUEL_FINDER_AUTH_SCHEME?.trim() || "Bearer";

  if (apiKey) {
    headers[apiKeyHeader] = apiKey;
  }

  if (authToken) {
    headers.Authorization = `${authScheme} ${authToken}`;
  }

  return headers;
}

async function downloadCsv(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function main() {
  const sourceUrl = getRequiredEnv("FUEL_FINDER_SOURCE_URL");
  const outputPath = path.resolve(
    process.cwd(),
    process.env.FUEL_FINDER_OUTPUT_PATH || "public/data/stations.json"
  );
  const headers = buildHeaders();

  const csvContent = await downloadCsv(sourceUrl, headers);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pricepermile-fuel-sync-"));
  const tempCsvPath = path.join(tempDir, "fuel-prices.csv");

  try {
    fs.writeFileSync(tempCsvPath, csvContent, "utf8");
    const count = convertCsvToStations(tempCsvPath, outputPath);
    console.log(`Synced ${count} stations to ${outputPath}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
