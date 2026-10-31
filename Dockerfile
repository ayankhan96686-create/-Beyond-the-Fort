# Beyond the Fort — Unified Production Dockerfile
# Pure Node.js 20 LTS Single-Port Unified Application (LangGraph.js + React 19 + Express)

FROM node:20-bookworm-slim

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Node.js production dependencies
COPY package*.json ./
RUN npm ci

# 2. Copy application codebase and build React frontend
COPY . .
RUN npm run build

# Set production environment variables
ENV NODE_ENV=production \
    PORT=5173

# Expose primary unified application port
EXPOSE 5173

# Healthcheck targeting unified Express /ready probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5173/ready || exit 1

# Start unified Node.js single-port application
CMD ["npm", "start"]
