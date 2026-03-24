import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "stormkokua.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      donation_link TEXT,
      donation_platform TEXT,
      description TEXT,
      area TEXT,
      island TEXT,
      neighborhood TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(name, area)
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at TEXT DEFAULT (datetime('now')),
      rows_synced INTEGER,
      status TEXT
    );
  `);

  ensureFamilyColumn(db, "amount_raised", "REAL");
  ensureFamilyColumn(db, "donation_handle", "TEXT");
  ensureFamilyColumn(db, "related_links", "TEXT");
}

function ensureFamilyColumn(
  db: Database.Database,
  columnName: string,
  definition: string
) {
  const columns = db
    .prepare("PRAGMA table_info(families)")
    .all() as { name: string }[];

  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE families ADD COLUMN ${columnName} ${definition}`);
  }
}

export interface RelatedLink {
  label: string;
  url: string;
  platform: string | null;
}

export interface Family {
  id: number;
  name: string;
  donation_link: string | null;
  donation_platform: string | null;
  description: string | null;
  area: string | null;
  island: string | null;
  neighborhood: string | null;
  amount_raised: number | null;
  donation_handle: string | null;
  related_links: RelatedLink[];
}

export interface FamilyInput {
  name: string;
  donation_link: string | null;
  donation_platform: string | null;
  description: string | null;
  area: string | null;
  island: string | null;
  neighborhood: string | null;
  amount_raised: number | null;
  donation_handle: string | null;
  related_links: RelatedLink[];
}

interface FamilyRow {
  id: number;
  name: string;
  donation_link: string | null;
  donation_platform: string | null;
  description: string | null;
  area: string | null;
  island: string | null;
  neighborhood: string | null;
  amount_raised: number | null;
  donation_handle: string | null;
  related_links: string | null;
}

function parseRelatedLinks(value: string | null): RelatedLink[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as RelatedLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapFamilyRow(row: FamilyRow): Family {
  return {
    id: row.id,
    name: row.name,
    donation_link: row.donation_link,
    donation_platform: row.donation_platform,
    description: row.description,
    area: row.area,
    island: row.island,
    neighborhood: row.neighborhood,
    amount_raised: row.amount_raised ?? null,
    donation_handle: row.donation_handle ?? null,
    related_links: parseRelatedLinks(row.related_links),
  };
}

export function getAllFamilies(): Family[] {
  const db = getDb();
  return (db.prepare("SELECT * FROM families ORDER BY name").all() as FamilyRow[]).map(
    mapFamilyRow
  );
}

export function getFamiliesByIsland(island: string): Family[] {
  const db = getDb();
  return (
    db
      .prepare("SELECT * FROM families WHERE island = ? ORDER BY name")
      .all(island) as FamilyRow[]
  ).map(mapFamilyRow);
}

export function getStats() {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM families").get() as {
    count: number;
  };
  const raised = db
    .prepare(
      "SELECT COALESCE(SUM(amount_raised), 0) as totalRaised, COUNT(amount_raised) as trackedFamilies FROM families"
    )
    .get() as { totalRaised: number; trackedFamilies: number };
  const islands = db
    .prepare(
      "SELECT island, COUNT(*) as count FROM families GROUP BY island ORDER BY count DESC"
    )
    .all() as { island: string; count: number }[];
  const areas = db
    .prepare(
      "SELECT area, COUNT(*) as count FROM families GROUP BY area ORDER BY count DESC"
    )
    .all() as { area: string; count: number }[];
  const lastSync = db
    .prepare(
      "SELECT synced_at FROM sync_log ORDER BY synced_at DESC LIMIT 1"
    )
    .get() as { synced_at: string } | undefined;

  return {
    totalFamilies: total.count,
    totalRaised: raised.totalRaised,
    trackedFamilies: raised.trackedFamilies,
    islands,
    areas,
    lastSync: lastSync?.synced_at || null,
  };
}

export function upsertFamily(family: FamilyInput) {
  const db = getDb();
  db.prepare(
    `INSERT INTO families (name, donation_link, donation_platform, description, area, island, neighborhood, amount_raised, donation_handle, related_links)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(name, area) DO UPDATE SET
       donation_link = excluded.donation_link,
       donation_platform = excluded.donation_platform,
       description = excluded.description,
       island = excluded.island,
       neighborhood = excluded.neighborhood,
       amount_raised = excluded.amount_raised,
       donation_handle = excluded.donation_handle,
       related_links = excluded.related_links,
       updated_at = datetime('now')`
  ).run(
    family.name,
    family.donation_link,
    family.donation_platform,
    family.description,
    family.area,
    family.island,
    family.neighborhood,
    family.amount_raised,
    family.donation_handle,
    JSON.stringify(family.related_links)
  );
}

export function replaceFamilies(families: FamilyInput[]) {
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO families (name, donation_link, donation_platform, description, area, island, neighborhood, amount_raised, donation_handle, related_links)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(name, area) DO UPDATE SET
       donation_link = excluded.donation_link,
       donation_platform = excluded.donation_platform,
       description = excluded.description,
       island = excluded.island,
       neighborhood = excluded.neighborhood,
       amount_raised = excluded.amount_raised,
       donation_handle = excluded.donation_handle,
       related_links = excluded.related_links,
       updated_at = datetime('now')`
  );

  const replace = db.transaction((rows: FamilyInput[]) => {
    db.prepare("DELETE FROM families").run();

    for (const family of rows) {
      upsert.run(
        family.name,
        family.donation_link,
        family.donation_platform,
        family.description,
        family.area,
        family.island,
        family.neighborhood,
        family.amount_raised,
        family.donation_handle,
        JSON.stringify(family.related_links)
      );
    }
  });

  replace(families);
}

export function logSync(rowsSynced: number, status: string) {
  const db = getDb();
  db.prepare(
    "INSERT INTO sync_log (rows_synced, status) VALUES (?, ?)"
  ).run(rowsSynced, status);
}
