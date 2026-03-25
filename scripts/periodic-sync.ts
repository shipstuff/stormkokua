/**
 * Long-running sync server that refreshes Google Sheets data every 30 minutes
 * and triggers a static site rebuild via the force_refresh flag.
 *
 * Also serves a simple health endpoint on $PORT.
 *
 * Run via: npm run sync:watch
 */

import { createServer } from "http";
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const INTERVAL_MS = 30 * 60 * 1000;
const PORT = Number(process.env.PORT) || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || "stormkokua";
const FLAG_PATH = `/tmp/${SERVICE_NAME}_force_refresh`;

let lastSyncAt: Date | null = null;
let nextSyncAt = new Date(Date.now() + INTERVAL_MS);
let syncing = false;

function sync() {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Starting periodic sync`);
  syncing = true;
  try {
    execSync("npm run db:sync", { stdio: "inherit" });
    writeFileSync(FLAG_PATH, "");
    lastSyncAt = new Date();
    console.log(`[${ts}] Sync complete, flagged rebuild`);
  } catch (err) {
    console.error(`[${ts}] Sync failed:`, err);
  }
  syncing = false;
  nextSyncAt = new Date(Date.now() + INTERVAL_MS);
}

const server = createServer((req, res) => {
  if (req.url === "/api/healthz") {
    const now = Date.now();
    const nextInMin = Math.round((nextSyncAt.getTime() - now) / 60000);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      syncing,
      lastSync: lastSyncAt?.toISOString() ?? null,
      nextSyncIn: `${nextInMin}m`,
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Sync server listening on :${PORT} (syncing every ${INTERVAL_MS / 60000}m)`);
});

setInterval(sync, INTERVAL_MS);
