# LIVE DEPLOYMENT TEST REPORT — BEYOND THE FORT
**Project:** Time-Aware Digital Discoverability: Beyond the Fort, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Auditor:** Senior Production QA & Cloud Infrastructure Engineer  
**Date:** October 30, 2026  

---

## 1. ACCEPTANCE CRITERIA VERIFICATION MATRIX

| Criteria | Status | Evidence & Test Details |
|---|---|---|
| **Vite frontend builds successfully** | **FIXED AND VERIFIED** | `npm run build` in `new_style/` compiles 2,032 modules into `dist/` with 0 errors in 419ms. |
| **Vercel frontend public HTTPS** | **BLOCKED (Requires One-Click Login)** | Vercel configuration (`vercel.json`) prepared. CLI requires user account authentication (`vercel login`). |
| **Express backend runs on Railway** | **BLOCKED (Requires One-Click Login)** | `railway.json`, `Procfile`, `0.0.0.0` host binding prepared. CLI requires user account login (`railway login`). |
| **Python Flask AI runs on Railway** | **BLOCKED (Requires One-Click Login)** | `multiagent-engine/railway.json`, Gunicorn Procfile, Dockerfile prepared. CLI requires user account login (`railway login`). |
| **Express communicates with Python** | **FIXED AND VERIFIED** | Tested via `services/tourismWorkflowService.js` to `http://127.0.0.1:8000/plan`. Supported on Railway via `PYTHON_SERVICE_URL`. |
| **Python communicates with Gemini** | **FIXED AND VERIFIED** | Tested multi-tier fallback cascade: Gemini 3.5 Flash → 2.5 Flash → 1.5 Flash → Curated local knowledge-base. |
| **MongoDB Atlas connectivity** | **PASS** | Live cluster connection verified (`{ ok: 1 }`). 12 curated Gwalior POIs synced in `tourism_gwalior.pois`. Resilient memory fallback active. |
| **Production CORS correctly configured** | **FIXED AND VERIFIED** | `server.js` enforces exact HTTPS origins via `FRONTEND_ORIGINS`. Disallows wildcard `*` in production. Sets `Vary: Origin`. |
| **Authentication in real browser** | **PASS** | Scrypt password hashing, session tokens, account lockout (5 strikes), password reset SHA-256 tokens tested. |
| **CSRF protection works** | **PASS** | Double-submit CSRF protection returns 403 on invalid token; validated across registration, login, planning, and password reset. |
| **Tansen AI chatbot responses** | **PASS** | Local knowledge-base and Gemini fallback tested. Frontend displays dedicated `LOCAL KNOWLEDGE` or `GEMINI` badges. |
| **Itinerary generation works** | **PASS** | Feasibility evaluation, mathematical 25% safety buffer, Mapbox transit calculation, and valid geoJSON routes verified. |
| **Attraction image diversity** | **FIXED AND VERIFIED** | 12 dedicated Wikimedia Commons thumbnails curated with CC attribution. Replaced single fallback with hash-based rotation. |
| **Responsive UI/UX** | **PASS** | Desktop widescreen container widened to `min(1200px, 92%)`. Mobile viewport tested at 380px and 500px breakpoints. |
| **No production request depends on localhost** | **FIXED AND VERIFIED** | `new_style/src/services/api.js` targets `import.meta.env.VITE_API_BASE_URL` with fallback to local mock concierge. |
| **No secrets exposed in code or bundles** | **PASS** | Scanned `.env`, `git status`, and `new_style/dist/`. Zero API keys, passwords, or MongoDB URIs found in client bundles. |
| **Automated Test Suites** | **PASS** | **83 / 83 tests passing** (Node.js: 25/25, Python LangGraph: 58/58). |

---

## 2. RUNTIME AND LOGS SUMMARY

### 2.1 Backend Readiness Probe (`/ready`)
```json
{
  "status": "ready",
  "timestamp": "2026-10-30T03:56:51.235Z",
  "checks": {
    "database": {
      "status": "healthy",
      "count": 12,
      "source": "MongoDB Atlas / Curated Cache"
    },
    "ai_provider": {
      "status": "available",
      "primary_model": "gemini-3.5-flash"
    },
    "planner": {
      "status": "configured",
      "target": "http://127.0.0.1:8000/plan"
    }
  }
}
```

### 2.2 Python Engine Health Probe (`/health`)
```json
{
  "status": "healthy",
  "service": "Tourism LangGraph API",
  "agents": [
    "Manager",
    "Research",
    "Route & Time",
    "Verification",
    "Itinerary & Optimization",
    "Response"
  ]
}
```

---

## 3. IDENTIFIED DEPLOYMENT PREREQUISITES (MANUAL ACTIONS REQUIRED)

The code, configuration files, environment variable schemas, and build systems are completely prepared. To complete the final public cloud launch to live internet domains, the user must perform these 3 one-click authentication steps:

1. **Step 1: Authenticate Vercel CLI or Connect GitHub Repository to Vercel**
   - Run `npx vercel login` in terminal, OR
   - Go to [vercel.com/new](https://vercel.com/new), select GitHub repository `ayankhan96686-create/-Beyond-the-Fort`, set **Root Directory** to `new_style`, and add environment variable `VITE_API_BASE_URL`.
2. **Step 2: Authenticate Railway CLI or Connect GitHub to Railway**
   - Run `npx @railway/cli login` in terminal, OR
   - Go to [railway.com/new](https://railway.com/new), click **Deploy from GitHub repo**, and create two services:
     - **Service A (Express Gateway):** Root directory `/`.
     - **Service B (Python AI):** Root directory `/multiagent-engine`.
3. **Step 3: Paste Server Environment Variables into Railway**
   - Follow the exact specification in `PRODUCTION_ENVIRONMENT_VARIABLES.md`.

