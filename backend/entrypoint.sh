#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PYEOF'
import os
import time
import sys

import psycopg2

url = os.environ.get("DATABASE_URL")
if not url:
    print("DATABASE_URL not set, skipping DB wait")
    sys.exit(0)

for attempt in range(30):
    try:
        conn = psycopg2.connect(url)
        conn.close()
        print("Database is up.")
        sys.exit(0)
    except Exception as e:
        print(f"DB not ready yet (attempt {attempt + 1}/30): {e}")
        time.sleep(2)

print("Database never became ready, exiting.")
sys.exit(1)
PYEOF

echo "Applying migrations..."
flask db upgrade

echo "Seeding default categories..."
python seed.py

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 --workers 3 --timeout 60 "run:app"
