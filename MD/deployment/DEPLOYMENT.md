# Secure Production Deployment Guide

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Status:** Production Ready (Verified October 30, 2026)  
**Detailed Checklist:** See [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)  
**Startup Runbook:** See [SERVICE_STARTUP_GUIDE.md](SERVICE_STARTUP_GUIDE.md)  

---

## 1. Production Architecture Overview

In production, Beyond the Fort executes as two coordinated services behind a TLS-terminating reverse proxy (such as Nginx, Cloudflare, or AWS Application Load Balancer):
1. **Public-Facing Tier:** Node.js Express server on port `3000` (`http://127.0.0.1:3000`).
2. **Private Backend Tier:** Python Flask LangGraph multi-agent service on port `8000` (`http://127.0.0.1:8000`).
3. **Database Tier:** MongoDB Atlas cloud cluster (`v8.0.34`) connected via TLS with zero-downtime local JSON fallback.

Direct internet access to port `8000` is blocked at the firewall / proxy layer; all planning requests are routed through Express after authentication and CSRF validation.

---

## 2. Mandatory Production Environment Configuration

Set `NODE_ENV=production` and ensure the following variables are injected via environment or secret manager:

```env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
TRUST_PROXY_HOPS=1

# Inter-service authentication (minimum 32 characters)
LANGGRAPH_SERVICE_TOKEN=your-random-32-character-secret-token-here
LANGGRAPH_API_URL=http://127.0.0.1:8000/plan

# Production CORS (exact HTTPS origins, no wildcards)
FRONTEND_ORIGINS=https://beyondthefort.org

# Persistent file storage paths
AUTH_USERS_FILE=/var/data/beyond-the-fort/.auth-users.json
SAVED_ITINERARIES_FILE=/var/data/beyond-the-fort/.saved-itineraries.json

# Cloud Database & AI Provider
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tourism_gwalior?retryWrites=true&w=majority
GEMINI_API_KEY=<your-google-ai-studio-api-key>
GEMINI_MODEL=gemini-3.5-flash
GEMINI_TIMEOUT_MS=60000

# Mapbox Routing
ROUTING_PROVIDER_URL=https://api.mapbox.com
ROUTING_PROVIDER_API_KEY=<your-mapbox-secret-token>
```

---

## 3. Production Health Probes & Monitoring

Configure container orchestrators (Kubernetes / Docker Compose) or monitoring agents:
- **Liveness Probe:** `GET http://127.0.0.1:3000/health` (Expects HTTP 200).
- **Readiness Probe:** `GET http://127.0.0.1:3000/ready` (Expects HTTP 200 and `"status": "ready"`).
- **Internal LangGraph Probe:** `GET http://127.0.0.1:8000/health` (Expects HTTP 200).

---

## 4. Unified Production Execution

```bash
# Start both services via production orchestrator:
npm run start:all
```
