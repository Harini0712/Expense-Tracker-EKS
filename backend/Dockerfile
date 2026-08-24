# --- Backend: Flask API ---
FROM python:3.11-slim

WORKDIR /app

# System deps needed to build psycopg2 / run healthchecks
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better layer caching — only reinstalls if
# requirements.txt changes, not on every code change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Runs as non-root for basic container hygiene
RUN useradd --create-home appuser
USER appuser

EXPOSE 5000

COPY --chown=appuser:appuser entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
