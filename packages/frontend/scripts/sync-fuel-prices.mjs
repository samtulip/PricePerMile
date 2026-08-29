#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { convertCsvToStations } from "./convert-stations-csv.mjs";

const DEFAULT_SOURCE_URL =
  "https://www.fuel-finder.service.gov.uk/internal/v1.0.2/csv/get-latest-fuel-prices-csv";

function sanitizeFilename(value) {
  const base = path.basename(value).trim();
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!safe) {
    return "fuel-prices.csv";
  }

  return safe.endsWith(".csv") ? safe : `${safe}.csv`;
}

function getFilenameFromContentDisposition(value) {
  if (!value) {
    return undefined;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return sanitizeFilename(decodeURIComponent(utf8Match[1]));
  }

  const quotedMatch = value.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return sanitizeFilename(quotedMatch[1]);
  }

  const plainMatch = value.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return sanitizeFilename(plainMatch[1].trim());
  }

  return undefined;
}

function getFilenameFromUrl(url) {
  const pathname = new URL(url).pathname;
  const lastPart = pathname.split("/").filter(Boolean).pop();
  if (!lastPart) {
    return "fuel-prices.csv";
  }

  return sanitizeFilename(lastPart);
}

async function downloadCsv(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  const contentDisposition = response.headers.get("content-disposition");
  const filename =
    getFilenameFromContentDisposition(contentDisposition) || getFilenameFromUrl(url);
  const content = await response.text();

  return { filename, content };
}

async function main() {
  const sourceUrl = process.env.FUEL_FINDER_SOURCE_URL?.trim() || DEFAULT_SOURCE_URL;
  const outputPath = path.resolve(
    process.cwd(),
    process.env.FUEL_FINDER_OUTPUT_PATH || "public/data/stations.json"
  );

  const { filename, content } = await downloadCsv(sourceUrl);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pricepermile-fuel-sync-"));
  const tempCsvPath = path.join(tempDir, filename);

  try {
    fs.writeFileSync(tempCsvPath, content, "utf8");
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
