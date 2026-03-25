#!/usr/bin/env bash
# Build and run stormkokua in production mode (standalone)
#
# Usage:
#   ./scripts/prod.sh          # build + sync + start
#   ./scripts/prod.sh build    # build only
#   ./scripts/prod.sh start    # start only (assumes prior build)
#   ./scripts/prod.sh sync     # sync sheets data only
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

PORT="${PORT:-3000}"

build() {
  echo "==> Installing dependencies..."
  npm ci --include=dev

  echo "==> Syncing sheets data..."
  mkdir -p data
  npx tsx scripts/sync-sheets.ts

  echo "==> Building (standalone)..."
  NODE_ENV=production npx next build

  # Copy static assets and data into standalone (Next.js doesn't do this automatically)
  cp -r .next/static .next/standalone/.next/static
  [ -d public ] && cp -r public .next/standalone/public
  cp -r data .next/standalone/data

  echo "==> Build complete. Start with: npm start"
}

sync() {
  echo "==> Syncing sheets data..."
  mkdir -p data
  npx tsx scripts/sync-sheets.ts
  # Also update standalone copy if it exists
  if [ -d .next/standalone ]; then
    cp -r data .next/standalone/data
  fi
}

start() {
  if [ ! -f .next/standalone/server.js ]; then
    echo "Error: No standalone build found. Run './scripts/prod.sh build' first."
    exit 1
  fi

  echo "==> Starting stormkokua on port ${PORT}..."
  exec node .next/standalone/server.js
}

case "${1:-all}" in
  build) build ;;
  start) start ;;
  sync)  sync ;;
  all)   build && start ;;
  *)     echo "Usage: $0 {build|start|sync|all}" && exit 1 ;;
esac
