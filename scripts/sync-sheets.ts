/**
 * Syncs data from the public Google Sheets views into SQLite.
 * Run via: npm run db:sync
 * Can be scheduled via cron for periodic updates.
 */

import {
  getDb,
  logSync,
  replaceFamilies,
  type FamilyInput,
  type RelatedLink,
} from "../src/lib/db";
import { mkdirSync } from "fs";
import { join } from "path";

const SHEET_ID = "1AG8KjiEGxYLxF27oBnbI6I-u6H5crdhI-lf8UonpIl4";
const SHEET_GIDS = {
  verified: "194434303",
  sortedGoFundMes: "890685181",
} as const;

const VERIFIED_JSON_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GIDS.verified}`;
const VERIFIED_HTML_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${SHEET_GIDS.verified}`;
const GOFUNDME_JSON_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GIDS.sortedGoFundMes}`;

const MAIN_HEADER_ROW = ["ʻOhana", "Donation Link", "Description", "Area"];

type GvizCell = {
  v?: string | number | null;
};

type GvizResponse = {
  table: {
    rows: Array<{
      c: Array<GvizCell | null>;
    }>;
  };
};

type VerifiedSheetRow = {
  name: string;
  donationLabel: string;
  description: string;
  area: string;
};

type HtmlSheetRow = {
  name: string;
  donationLabel: string;
  area: string;
  primaryLink: string | null;
  rowLinks: RelatedLink[];
};

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function unwrapGvizResponse(raw: string): GvizResponse {
  const match = raw.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]+)\);?$/
  );

  if (!match) {
    throw new Error("Failed to parse Google Sheets GViz response");
  }

  return JSON.parse(match[1]) as GvizResponse;
}

function getStringCell(cell: GvizCell | null | undefined): string {
  return cell?.v == null ? "" : String(cell.v).trim();
}

function getNumberCell(cell: GvizCell | null | undefined): number | null {
  return typeof cell?.v === "number" ? cell.v : null;
}

function normalizeLookup(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ʻ’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function familyKey(name: string, area: string): string {
  return `${normalizeLookup(name)}|${normalizeLookup(area)}`;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal) =>
      String.fromCodePoint(parseInt(decimal, 10))
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const replacement = HTML_ENTITY_MAP[name.toLowerCase()];
      return replacement ?? match;
    });
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectPlatformFromUrl(link: string): string | null {
  try {
    const url = new URL(link);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "gofund.me" || hostname.endsWith("gofundme.com")) {
      return "GoFundMe";
    }

    if (hostname.endsWith("venmo.com")) {
      return "Venmo";
    }

    if (hostname === "cash.app") {
      return "CashApp";
    }

    if (hostname === "spot.fund") {
      return "SpotFund";
    }

    return "Website";
  } catch {
    return null;
  }
}

function detectPlatform(linkLabel: string, actualLink?: string | null): string {
  const fromUrl = actualLink ? detectPlatformFromUrl(actualLink) : null;
  if (fromUrl) return fromUrl;

  const lower = linkLabel.toLowerCase();
  if (lower.includes("gofundme") || lower.includes("gofund.me")) {
    return "GoFundMe";
  }
  if (lower.includes("venmo")) return "Venmo";
  if (lower.includes("cashapp") || lower.includes("cash.app")) {
    return "CashApp";
  }
  if (lower.includes("spot.fund")) return "SpotFund";
  return "Other";
}

function normalizePublicUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;

  const decoded = decodeHtmlEntities(rawUrl).trim();

  try {
    const url = new URL(decoded);

    if (
      (url.hostname === "google.com" || url.hostname === "www.google.com") &&
      url.pathname === "/url"
    ) {
      const target = url.searchParams.get("q");
      return target ? normalizePublicUrl(target) : null;
    }

    url.hash = "";

    if (
      url.hostname === "gofund.me" ||
      url.hostname.endsWith("gofundme.com") ||
      url.hostname.endsWith("venmo.com") ||
      url.hostname === "cash.app" ||
      url.hostname === "spot.fund"
    ) {
      url.search = "";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return decoded.startsWith("http") ? decoded : null;
  }
}

function inferDonationHandle(link: string | null): string | null {
  if (!link) return null;

  try {
    const url = new URL(link);
    const platform = detectPlatformFromUrl(link);
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments.at(-1) ?? null;

    if (platform === "Website") {
      return url.hostname.replace(/^www\./, "");
    }

    if (!lastSegment) {
      return url.hostname.replace(/^www\./, "");
    }

    if (url.hostname === "cash.app") {
      return lastSegment.replace(/^\$/, "") || null;
    }

    return lastSegment;
  } catch {
    return null;
  }
}

function dedupeLinks(links: RelatedLink[]): RelatedLink[] {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (!link.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function extractHtmlLinks(html: string): RelatedLink[] {
  const links: RelatedLink[] = [];

  for (const match of html.matchAll(
    /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  )) {
    const url = normalizePublicUrl(match[1]);
    if (!url) continue;

    links.push({
      label: htmlToText(match[2]) || new URL(url).hostname.replace(/^www\./, ""),
      url,
      platform: detectPlatformFromUrl(url),
    });
  }

  return dedupeLinks(links);
}

function sanitizeTextUrl(url: string): string {
  return url.replace(/[),.;!?]+$/, "");
}

function extractLinksFromDescription(description: string): RelatedLink[] {
  const links: RelatedLink[] = [];

  for (const match of description.matchAll(/https?:\/\/[^\s<>"']+/g)) {
    const url = normalizePublicUrl(sanitizeTextUrl(match[0]));
    if (!url) continue;

    links.push({
      label: new URL(url).hostname.replace(/^www\./, ""),
      url,
      platform: detectPlatformFromUrl(url),
    });
  }

  for (const match of description.matchAll(
    /\$([A-Za-z0-9._-]{3,})\s*\((?:cash ?app|cashapp)\)/gi
  )) {
    const url = `https://cash.app/$${match[1]}`;
    links.push({
      label: "CashApp",
      url,
      platform: "CashApp",
    });
  }

  for (const match of description.matchAll(/instagram\s*@([A-Za-z0-9._]+)/gi)) {
    const url = `https://www.instagram.com/${match[1]}`;
    links.push({
      label: `Instagram @${match[1]}`,
      url,
      platform: "Website",
    });
  }

  return dedupeLinks(links);
}

function pickPrimaryLink(
  donationLabel: string,
  cellLinks: RelatedLink[],
  rowLinks: RelatedLink[]
): RelatedLink | null {
  if (cellLinks.length > 0) {
    return cellLinks[0];
  }

  const desiredPlatform = detectPlatform(donationLabel);
  const platformMatch = rowLinks.find(
    (link) => link.platform === desiredPlatform
  );
  if (platformMatch) {
    return platformMatch;
  }

  return rowLinks[0] ?? null;
}

function parseVerifiedRows(rawJson: string): VerifiedSheetRow[] {
  const rows = unwrapGvizResponse(rawJson).table.rows;
  const headerIndex = rows.findIndex((row) => {
    const values = row.c.map(getStringCell);
    return MAIN_HEADER_ROW.every((value, index) => values[index] === value);
  });

  if (headerIndex === -1) {
    throw new Error("Failed to locate the verified sheet header row");
  }

  return rows
    .slice(headerIndex + 1)
    .map((row) => row.c.map(getStringCell))
    .filter((row) => row.length >= 4 && row[0] && row[3])
    .map(([name, donationLabel, description, area]) => ({
      name,
      donationLabel,
      description,
      area,
    }));
}

function parseHtmlSheetRows(html: string): Map<string, HtmlSheetRow> {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const parsedRows: HtmlSheetRow[] = [];
  let sawHeader = false;

  for (const rowMatch of rows) {
    const rowHtml = rowMatch[1];
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (match) => match[1]
    );

    if (cells.length < 4) continue;

    const [name, donationLabel, description, area] = cells.map(htmlToText);

    if (!sawHeader) {
      if (name === MAIN_HEADER_ROW[0] && donationLabel === MAIN_HEADER_ROW[1]) {
        sawHeader = true;
      }
      continue;
    }

    if (!name || !area) continue;

    const cellLinks = extractHtmlLinks(cells[1]);
    const rowLinks = dedupeLinks([
      ...extractHtmlLinks(rowHtml),
      ...extractLinksFromDescription(description),
    ]);
    const primaryLink = pickPrimaryLink(donationLabel, cellLinks, rowLinks)?.url ?? null;

    parsedRows.push({
      name,
      donationLabel,
      area,
      primaryLink,
      rowLinks,
    });
  }

  return new Map(
    parsedRows.map((row) => [familyKey(row.name, row.area), row] as const)
  );
}

function parseGoFundMeAmounts(rawJson: string): Map<string, number> {
  const rows = unwrapGvizResponse(rawJson).table.rows;
  const amounts = new Map<string, number>();

  for (const row of rows) {
    const name = getStringCell(row.c[0]);
    const amount = getNumberCell(row.c[2]);

    if (name && amount !== null) {
      amounts.set(normalizeLookup(name), amount);
    }
  }

  return amounts;
}

function normalizeIsland(rawIsland: string): string {
  const island = rawIsland.trim();

  if (/^o(?:['ʻ’])?\s*ahu$/i.test(island) || /^oahu$/i.test(island)) {
    return "Oʻahu";
  }

  if (/^maui$/i.test(island)) {
    return "Maui";
  }

  if (/^(hawai(?:['ʻ’])?i island|big island)$/i.test(island)) {
    return "Hawaiʻi Island";
  }

  return island || "Unknown";
}

function parseArea(area: string): { island: string; neighborhood: string } {
  if (!area) return { island: "Unknown", neighborhood: "" };

  const parts = area
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return {
    island: normalizeIsland(parts[0] || "Unknown"),
    neighborhood: parts.slice(1).join(", "),
  };
}

function buildFamilies(
  verifiedRows: VerifiedSheetRow[],
  htmlRowsByKey: Map<string, HtmlSheetRow>,
  goFundMeAmounts: Map<string, number>
): FamilyInput[] {
  return verifiedRows.map((row) => {
    const key = familyKey(row.name, row.area);
    const htmlRow = htmlRowsByKey.get(key);
    const descriptionLinks = extractLinksFromDescription(row.description);
    const rowLinks = dedupeLinks([
      ...(htmlRow?.rowLinks ?? []),
      ...descriptionLinks,
    ]);
    const primaryLink =
      htmlRow?.primaryLink ??
      normalizePublicUrl(row.donationLabel) ??
      null;
    const donationPlatform = detectPlatform(
      htmlRow?.donationLabel ?? row.donationLabel,
      primaryLink
    );
    const { island, neighborhood } = parseArea(row.area);

    return {
      name: row.name,
      donation_link: primaryLink,
      donation_platform: donationPlatform,
      description: row.description || null,
      area: row.area || null,
      island,
      neighborhood,
      amount_raised:
        donationPlatform === "GoFundMe"
          ? goFundMeAmounts.get(normalizeLookup(row.name)) ?? null
          : null,
      donation_handle: inferDonationHandle(primaryLink),
      related_links: dedupeLinks(
        rowLinks.filter((link) => link.url !== primaryLink)
      ),
    };
  });
}

async function syncSheet() {
  console.log("Fetching Google Sheet data...");

  const [verifiedJsonResponse, verifiedHtmlResponse, goFundMeJsonResponse] =
    await Promise.all([
      fetch(VERIFIED_JSON_URL),
      fetch(VERIFIED_HTML_URL),
      fetch(GOFUNDME_JSON_URL),
    ]);

  if (!verifiedJsonResponse.ok || !verifiedHtmlResponse.ok || !goFundMeJsonResponse.ok) {
    throw new Error("Failed to fetch one or more Google Sheet views");
  }

  const [verifiedJson, verifiedHtml, goFundMeJson] = await Promise.all([
    verifiedJsonResponse.text(),
    verifiedHtmlResponse.text(),
    goFundMeJsonResponse.text(),
  ]);

  const verifiedRows = parseVerifiedRows(verifiedJson);
  const htmlRowsByKey = parseHtmlSheetRows(verifiedHtml);
  const goFundMeAmounts = parseGoFundMeAmounts(goFundMeJson);
  const families = buildFamilies(verifiedRows, htmlRowsByKey, goFundMeAmounts);

  if (families.length === 0) {
    throw new Error("No family rows were parsed from the source sheet");
  }

  replaceFamilies(families);
  logSync(families.length, "success");

  const linkedFamilies = families.filter((family) => family.donation_link).length;
  const trackedAmounts = families.filter(
    (family) => family.amount_raised !== null
  ).length;

  console.log(
    `Synced ${families.length} families successfully (${linkedFamilies} direct links, ${trackedAmounts} tracked amounts)`
  );
}

mkdirSync(join(process.cwd(), "data"), { recursive: true });
getDb();

syncSheet().catch((error) => {
  console.error("Sync failed:", error);
  logSync(0, `error: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
});
