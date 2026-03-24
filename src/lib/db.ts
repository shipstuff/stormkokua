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
}

export function getAllFamilies(): Family[] {
  const db = getDb();
  return db.prepare("SELECT * FROM families ORDER BY name").all() as Family[];
}

export function getFamiliesByIsland(island: string): Family[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM families WHERE island = ? ORDER BY name")
    .all(island) as Family[];
}

export function getStats() {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM families").get() as {
    count: number;
  };
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
    islands,
    areas,
    lastSync: lastSync?.synced_at || null,
  };
}

export function upsertFamily(family: {
  name: string;
  donation_link: string | null;
  donation_platform: string | null;
  description: string | null;
  area: string | null;
  island: string | null;
  neighborhood: string | null;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO families (name, donation_link, donation_platform, description, area, island, neighborhood)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(name, area) DO UPDATE SET
       donation_link = excluded.donation_link,
       donation_platform = excluded.donation_platform,
       description = excluded.description,
       island = excluded.island,
       neighborhood = excluded.neighborhood,
       updated_at = datetime('now')`
  ).run(
    family.name,
    family.donation_link,
    family.donation_platform,
    family.description,
    family.area,
    family.island,
    family.neighborhood
  );
}

export function logSync(rowsSynced: number, status: string) {
  const db = getDb();
  db.prepare(
    "INSERT INTO sync_log (rows_synced, status) VALUES (?, ?)"
  ).run(rowsSynced, status);
}
