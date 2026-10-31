# Environment Setup & Configuration Guide

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Status:** Production Verified  

---

## 1. Quickstart Configuration

Copy `.env.example` to `.env` if not already present:
```bash
cp .env.example .env
```
Supply your credentials for Google Gemini, MongoDB Atlas, and Mapbox routing.

---

## 2. Environment Variables Reference

| Variable | Default Value | Description & Purpose |
| :--- | :---: | :--- |
| `PORT` | `3000` | Port for the Node.js Express application server. |
| `HOST` | `127.0.0.1` | Local IP bind address (use `0.0.0.0` in Docker). |
| `NODE_ENV` | `development` | Set to `production` in staging/production to enable HSTS, CSP, and strict origin checks. |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas cluster connection string. Auto-seeds and syncs the 12 curated POIs. Falls back gracefully to local JSON if unreachable. |
| `GEMINI_API_KEY` | *(Secret)* | Google AI Studio API Key for natural language intent extraction and grounded tourism Q&A. |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Pinned high-capacity production model with automatic fallback cascade to `gemini-3.5-flash-lite` and `gemini-3.1-flash-lite`. |
| `GEMINI_TIMEOUT_MS` | `60000` | Circuit breaker timeout in milliseconds for Gemini API requests. |
| `LANGGRAPH_PORT` | `8000` | Port for the Python Flask LangGraph multi-agent service. |
| `LANGGRAPH_API_URL` | `http://127.0.0.1:8000/plan` | Internal URL used by Node.js to forward planning requests to Python. |
| `LANGGRAPH_SERVICE_TOKEN` | *(Secret)* | HMAC Bearer token for inter-service authentication (must be $\ge 32$ chars in production). |
| `ROUTING_PROVIDER_URL` | `https://api.mapbox.com` | Base URL for Mapbox Driving/Walking Directions API. |
| `ROUTING_PROVIDER_API_KEY` | *(Secret)* | Mapbox public/secret token for real-time traffic-aware routing. |
| `ROUTING_PROVIDER_TIMEOUT_SECONDS` | `5` | Timeout for external transit queries before applying Haversine fallback. |
| `SAFETY_BUFFER_RATIO` | `0.25` | Mandatory safety margin ratio ($25\%$) added to round-trip travel time. |
| `FRONTEND_ORIGINS` | `http://localhost:5173` | Allowed CORS origins for external frontends. In production, exact HTTPS origins required. |
| `AUTH_USERS_FILE` | `.auth-users.json` | Persistent storage path for user accounts and scrypt password hashes. |
| `SAVED_ITINERARIES_FILE` | `.saved-itineraries.json` | Persistent storage path for saved user itineraries. |
| `INITIAL_ADMIN_EMAIL` | *(Optional)* | Email address to automatically grant the `administrator` role on first registration. |
| `TRUST_PROXY_HOPS` | `0` | Number of trusted reverse proxy hops (set `1` to `5` behind Nginx/ALB). |
| `DEMO_MODE` | `false` | Explicit test flag; when `true`, allows synthetic route estimates during demos without API keys. |

---

## 3. Starting Services

```bash
# Unified launch for both Node.js (3000) and Python (8000):
npm run start:all

# Development mode with watch:
npm run dev:all
```
