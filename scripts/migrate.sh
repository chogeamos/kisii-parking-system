
#!/usr/bin/env bash
set -e
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set. Export it and re-run."
  exit 1
fi
psql "$DATABASE_URL" -f sql/parking.sql
echo "Migration applied."
