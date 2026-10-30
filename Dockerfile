# Beyond the Fort — Unified Production Dockerfile
# Multi-runtime container: Node.js 20 LTS + Python 3.11 LangGraph Engine

FROM node:20-bookworm-slim

# Install system utilities and Python 3 runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Python dependencies in an isolated virtual environment
COPY multiagent-engine/requirements.txt ./multiagent-engine/requirements.txt
RUN python3 -m venv .venv && \
    .venv/bin/pip install --no-cache-dir --upgrade pip && \
    .venv/bin/pip install --no-cache-dir -r ./multiagent-engine/requirements.txt

# 2. Install Node.js production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 3. Copy application codebase
COPY . .

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Expose primary application port
EXPOSE 3000

# Healthcheck targeting Express /ready probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ready || exit 1

# Start dual service orchestrator (Python LangGraph on :8000 + Node.js Express on :3000)
CMD ["npm", "run", "start:all"]
