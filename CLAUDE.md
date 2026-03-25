# CLAUDE.md

## Project Overview

**stormkokua** is a Next.js disaster relief app for families affected by the Kona Low storms across Hawai'i. It lets people browse and donate to displaced families. Data is synced from a community-maintained Google Sheet into a local SQLite database.

Live at **stormkokua.com**, deployed on the shipstuff.fun VPS (Digital Ocean).

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack dev server)
- **Language**: TypeScript
- **Database**: SQLite via better-sqlite3 (WAL mode)
- **Styling**: Tailwind CSS 4
- **Node**: 24 (pinned in .nvmrc / .node-version)

## Getting Started

```bash
nvm use                           # or fnm use -- picks up .nvmrc
npm install --include=dev
npm run db:sync                   # sync Google Sheets data into data/stormkokua.db
npm run dev                       # http://localhost:3000
```

## Production Build (Standalone)

```bash
./scripts/prod.sh                 # full build + sync + start
./scripts/prod.sh build           # build only (outputs .next/standalone/)
./scripts/prod.sh start           # start standalone server
./scripts/prod.sh sync            # resync sheets data without rebuilding
```

The standalone build bundles only the required node_modules (~73MB vs ~644MB full). The run script on the VPS calls `./scripts/prod.sh build` and `./scripts/prod.sh start`.

## Key Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | SSR page | Home page with family cards, filters, stats |
| `/family/[id]` | SSR page | Shareable link with OG meta, client-side redirect to `/?family=[id]` |
| `/api/families` | API | GET families, supports `?island=` and `?stats=true` |
| `/api/healthz` | API | DB connectivity check |
| `/api/metrics` | API | Prometheus metrics (prom-client) |
| `/og-image` | API | Dynamic PNG for site-wide OG unfurling |
| `/family/[id]/og` | API | Dynamic PNG for per-family OG unfurling |

## Metrics

Prometheus metrics exposed at `/api/metrics`:
- `stormkokua_http_requests_total` (counter: method, route, status_code)
- `stormkokua_http_request_duration_seconds` (histogram)
- `stormkokua_http_in_flight_requests` (gauge)
- Default process metrics (RSS, CPU, event loop, GC)

These feed into the **Shipstuff App Metrics** Grafana dashboard (servertimeai repo).

## Data Pipeline

- Source: public Google Sheet (`1AG8KjiEGxYLxF27oBnbI6I-u6H5crdhI-lf8UonpIl4`)
- Sync script: `scripts/sync-sheets.ts` (run via `npm run db:sync`)
- Syncs family data + GoFundMe amounts into SQLite
- Run at build time and can be triggered manually

## Project Structure

```
src/
  app/
    api/families/       # Families data endpoint
    api/healthz/        # Health check
    api/metrics/        # Prometheus metrics
    family/[id]/        # Shareable family page + OG image
    og-image/           # Site-wide OG image
    page.tsx            # Home page (SSR)
    layout.tsx          # Root layout (GA, fonts, OG meta)
  components/           # React client components
  lib/
    db.ts               # SQLite database layer
    metrics.ts          # prom-client setup + withMetrics wrapper
    logger.ts           # Structured logger (JSON prod, readable dev)
    format.ts           # Shared formatting utilities
  instrumentation.ts    # Process handlers (SIGTERM, SIGINT, uncaught errors)
scripts/
  sync-sheets.ts        # Google Sheets sync
  prod.sh               # Production build/start lifecycle
```

## Code Standards

- No em dashes in code
- Keep it simple -- this app serves people in need, reliability over cleverness
- All API routes use `withMetrics()` wrapper for observability
- Error handling: `withMetrics` catches thrown errors and returns 500 JSON
- Structured logging via `src/lib/logger.ts` (JSON in prod, readable in dev)
- SQLite DB is closed cleanly on SIGTERM/SIGINT via instrumentation.ts

## Deployment

- **Host**: shipstuff.fun VPS (Digital Ocean), user `stormkokua`
- **Domain**: stormkokua.com
- **Config**: `servertimeai/cloud/hosts.yaml` under `stormkokua`
- **Deploy**: Legacy poll mode -- run-server.sh polls git, rebuilds on new commits
- **DB path**: `/home/stormkokua/app/data/stormkokua.db`
- **Backups**: `/backups/stormkokua/`
