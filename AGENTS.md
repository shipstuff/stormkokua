# CLAUDE.md

## Project Overview

**stormkokua** is a Next.js static site for families affected by the Kona Low storms across Hawai'i. It lets people browse and donate to displaced families. Data is synced from a community-maintained Google Sheet into a local SQLite database, then the entire site is exported as static HTML/CSS/JS.

Live at **stormkokua.com**, deployed on the shipstuff.fun VPS (Digital Ocean).

## Tech Stack

- **Framework**: Next.js 15 (App Router, static export via `output: "export"`)
- **Language**: TypeScript
- **Database**: SQLite via better-sqlite3 (WAL mode, build-time only)
- **Styling**: Tailwind CSS 4
- **OG Images**: `@vercel/og` (build-time PNG generation)
- **Node**: 24 (pinned in .nvmrc / .node-version)

## Getting Started

```bash
nvm use                           # or fnm use -- picks up .nvmrc
npm install --include=dev
npm run db:sync                   # sync Google Sheets data into data/stormkokua.db
npm run dev                       # http://localhost:3000
```

## Production Build (Static Export)

```bash
npm run build:prod                # sync sheets + build static HTML + generate OG images
npx serve out                     # preview locally
```

`build:prod` runs three steps:
1. `db:sync` -- pull latest data from Google Sheets into SQLite
2. `build` -- Next.js static export into `out/`
3. `generate:og` -- render OG PNG images into `out/`

No server process needed in production. nginx serves the `out/` directory directly.

## Key Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static page | Home page with family cards, filters, stats |
| `/family/[id]` | Static page (SSG) | Shareable link with OG meta, client-side redirect to `/?family=[id]` |
| `/og-image.png` | Static file | Site-wide OG image |
| `/family/[id]/og.png` | Static file | Per-family OG image |

## Data Pipeline

- Source: public Google Sheet (`1AG8KjiEGxYLxF27oBnbI6I-u6H5crdhI-lf8UonpIl4`)
- Sync script: `scripts/sync-sheets.ts` (run via `npm run db:sync`)
- Syncs family data + GoFundMe amounts into SQLite
- Run at build time and can be triggered manually

## Project Structure

```
src/
  app/
    family/[id]/        # Shareable family page (SSG) + client redirect
    page.tsx            # Home page (static)
    layout.tsx          # Root layout (GA, fonts, OG meta)
  components/           # React client components
  lib/
    db.ts               # SQLite database layer (build-time only)
    logger.ts           # Structured logger (JSON prod, readable dev)
    format.ts           # Shared formatting utilities
scripts/
  sync-sheets.ts        # Google Sheets sync
  generate-og-images.tsx # Build-time OG image generation (@vercel/og)
```

## Code Standards

- No em dashes in code
- Keep it simple -- this app serves people in need, reliability over cleverness
- Structured logging via `src/lib/logger.ts` (JSON in prod, readable in dev)

## Deployment

- **Host**: shipstuff.fun VPS (Digital Ocean), user `stormkokua`
- **Domain**: stormkokua.com
- **Config**: `servertimeai/cloud/hosts.yaml` under `stormkokua`
- **Deploy**: Poll mode -- run-server.sh polls git every 60s, runs `npm run build:prod` on new commits, rsyncs `out/` to nginx
- **Static assets**: nginx serves the entire site from `/var/www/html/stormkokua/`
- **DB path**: `/home/stormkokua/app/data/stormkokua.db` (build-time only)
- **Backups**: `/backups/stormkokua/`
- **Force refresh**: `sudo -u stormkokua touch /tmp/stormkokua_force_refresh`

### Ansible provisioning

```bash
cd servertimeai/cloud
ansible-run ansible-playbook playbook.yaml -e @secrets.enc --limit stormkokua --skip-tags dns
```

After Ansible updates `run-server.sh`, the running script must be restarted (Ansible doesn't restart the tmux session with `--limit`). If Node version changes, run `npm install --include=dev` before the next build to recompile native modules (better-sqlite3).
