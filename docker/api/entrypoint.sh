#!/bin/sh
set -e
# Apply pending migrations on start-up (non-destructive). Disable with RUN_MIGRATIONS=false when
# migrations are executed by a separate deploy step (recommended for multi-task ECS services).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Applying database migrations…"
  (cd /app/database && npx prisma migrate deploy)
fi
# Optional idempotent seed (safe to repeat; never overwrites existing content).
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Running seed…"
  (cd /app/database && npx tsx seed/seed.ts)
fi
exec "$@"
