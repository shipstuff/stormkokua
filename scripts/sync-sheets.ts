/**
 * Syncs data from the Google Sheet CSV export into SQLite.
 * Run via: npm run db:sync
 * Can be scheduled via cron for periodic updates.
 */

import { upsertFamily, logSync, getDb } from "../src/lib/db";

const SHEET_ID = "1AG8KjiEGxYLxF27oBnbI6I-u6H5crdhI-lf8UonpIl4";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function detectPlatform(link: string): string {
  if (!link) return "unknown";
  const lower = link.toLowerCase();
  if (lower.includes("gofundme") || lower.includes("gofund.me"))
    return "GoFundMe";
  if (lower.includes("venmo")) return "Venmo";
  if (lower.includes("cashapp") || lower.includes("cash.app"))
    return "CashApp";
  if (lower.includes("spot.fund")) return "SpotFund";
  return "Other";
}

function parseArea(area: string): { island: string; neighborhood: string } {
  if (!area) return { island: "Unknown", neighborhood: "" };
  const parts = area.split(",").map((s) => s.trim());
  // Normalize island names
  let island = parts[0] || "Unknown";
  if (island.match(/o.ahu/i)) island = "Oʻahu";
  if (island.match(/maui/i)) island = "Maui";
  if (island.match(/hawaii island/i) || island.match(/big island/i))
    island = "Hawaiʻi Island";
  const neighborhood = parts.slice(1).join(", ").trim();
  return { island, neighborhood };
}

async function syncSheet() {
  console.log("Fetching Google Sheet data...");

  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const csv = await response.text();
  const lines = csv.split("\n").filter((line) => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);
  console.log(`Found ${dataLines.length} entries`);

  let synced = 0;
  for (const line of dataLines) {
    const fields = parseCSVLine(line);
    if (fields.length < 4) continue;

    const [name, donationLink, description, area] = fields;
    if (!name) continue;

    const platform = detectPlatform(donationLink);
    const { island, neighborhood } = parseArea(area);

    upsertFamily({
      name: name.replace(/^"|"$/g, ""),
      donation_link: donationLink.replace(/^"|"$/g, "") || null,
      donation_platform: platform,
      description: description.replace(/^"|"$/g, "") || null,
      area: area.replace(/^"|"$/g, "") || null,
      island,
      neighborhood,
    });
    synced++;
  }

  logSync(synced, "success");
  console.log(`Synced ${synced} families successfully`);
}

// Ensure data directory exists
import { mkdirSync } from "fs";
import { join } from "path";
mkdirSync(join(process.cwd(), "data"), { recursive: true });

// Force DB init
getDb();

syncSheet().catch((err) => {
  console.error("Sync failed:", err);
  logSync(0, `error: ${err.message}`);
  process.exit(1);
});
