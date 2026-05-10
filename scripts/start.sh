#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# CMP — single-command startup
# Usage:  bash scripts/start.sh
# ─────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── 1. Start Firebase emulators in the background ────────────
echo ""
echo "▶  Starting Firebase emulators..."
npx firebase emulators:start \
  --only firestore,auth,storage \
  --project demo-cmp &
EMULATOR_PID=$!

# Kill emulators when this script exits (Ctrl-C or crash)
trap 'echo ""; echo "Stopping emulators..."; kill $EMULATOR_PID 2>/dev/null; exit' INT TERM EXIT

# ── 2. Wait for Firestore + Auth emulators to be ready ───────
echo "▶  Waiting for emulators to be ready..."
npx wait-on \
  tcp:127.0.0.1:8080 \
  tcp:127.0.0.1:9099 \
  --timeout 120000

echo "▶  Emulators ready."

# ── 3. Seed test users (idempotent — safe to run every time) ─
echo "▶  Seeding test users..."
node scripts/seed-emulator.js

# ── 4. Start all 10 services with coloured output ────────────
echo ""
echo "▶  Starting all services..."
echo ""

npx concurrently \
  --kill-others-on-fail \
  --prefix-colors "bgBlue.bold,bgGreen.bold,bgYellow.bold,bgCyan.bold,bgMagenta.bold,bgRed.bold,bgWhite.bold,blue.bold,green.bold,yellow.bold" \
  --names          "GATEWAY,AUTH   ,USER   ,COURSE ,ENROLL ,PROGRES,STORAGE,NOTIFY ,AUDIT  ,OUTBOX " \
  "npm run dev --workspace=packages/gateway" \
  "npm run dev --workspace=packages/auth-service" \
  "npm run dev --workspace=packages/user-service" \
  "npm run dev --workspace=packages/course-service" \
  "npm run dev --workspace=packages/enrollment-service" \
  "npm run dev --workspace=packages/progress-service" \
  "npm run dev --workspace=packages/storage-service" \
  "npm run dev --workspace=packages/notification-service" \
  "npm run dev --workspace=packages/audit-service" \
  "npm run dev --workspace=packages/outbox-worker"
