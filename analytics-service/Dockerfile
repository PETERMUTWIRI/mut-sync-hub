# ---- 1. base image ---------------------------------------------------------
FROM python:3.11-slim

# ---- 2. system dependencies for binary wheels ------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        cmake \
        libgomp1 \
        libstdc++6 \
        ca-certificates \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# ---- 2½. DuckDB CLI (optional but handy for debugging) --------------------
RUN wget -q https://github.com/duckdb/duckdb/releases/download/v0.10.2/duckdb_cli-linux-amd64.zip && \
    unzip duckdb_cli-linux-amd64.zip -d /usr/local/bin && rm *.zip

# ---- 3. upgrade pip & enable pre-built wheels ------------------------------
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ---- 4. install Python deps (+ DuckDB driver) ------------------------------
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r /tmp/requirements.txt && \
    pip install --no-cache-dir duckdb==0.10.2

# ---- 5. copy source --------------------------------------------------------
COPY . /app
WORKDIR /app

# ---- 5½. scheduler loop ----------------------------------------------------
COPY scheduler_loop.py /app/scheduler_loop.py

# ---- 6. runtime env vars ---------------------------------------------------
ENV API_KEYS=dev-analytics-key-123

# ---- 7. start both services -----------------------------------------------
CMD sh -c "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 & python /app/scheduler_loop.py"