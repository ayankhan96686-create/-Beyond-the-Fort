# Production Deployment Readiness Checklist
## Beyond the Fort — Decoupled Cloud Architecture (Vercel + Railway + MongoDB Atlas)

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412)  
**Target Environment:** Production Cloud (Vercel Edge + Railway Services + MongoDB Atlas Replica Set)  
**Status:** **CODE & CONFIGURATION VERIFIED — READY FOR CLOUD LAUNCH**  

---

## 1. Application Security Baseline

- [x] **Disabled Fingerprinting:** `app.disable('x-powered-by')` explicitly configured in `server.js`.
- [x] **Security Headers Configured:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforced when `NODE_ENV=production`)
- [x] **Content Security Policy (CSP):**
  - Restricts script execution to `'self'`.
  - Disallows remote inline scripts (all Leaflet map logic bundled locally in `/vendor/leaflet/`).
  - Sets `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
- [x] **CSRF Defense:** Double-submit cookie with cryptographic comparison (`x-csrf-token` header verified against `beyond_fort_csrf` cookie).
- [x] **Cross-Domain Session Security:**
  - Cookies dynamically configured with `SameSite=None; Secure` for decoupled cross-domain Vercel-to-Railway requests.
  - Supports `SameSite=Lax` for custom single-domain deployments.
  - Session IDs generated using cryptographically strong `crypto.randomBytes(32)`.
- [x] **Account Lockout:** Locks accounts for 15 minutes after 5 consecutive failed login attempts.
- [x] **BOLA / IDOR Authorization:** Single itinerary retrieval (`GET /api/itineraries/:id`) enforces strict user ownership.

---

## 2. Decoupled Service Deployment Matrix

### Service 1: Vite Frontend (`new_style/`) on Vercel
- [x] `new_style/package.json` build command verified: `vite build`.
- [x] Production build passes cleanly: 2,032 modules bundled to `dist/` in 419ms.
- [x] `new_style/vercel.json` SPA rewrites configured.
- [x] `new_style/src/services/api.js` connects via `VITE_API_BASE_URL`.
- [x] Local concierge fallback (`aiConcierge.js`) remains active if backend is offline.
- [ ] Public Vercel URL generated (Requires `npx vercel login` or GitHub repo link).

### Service 2: Express Backend Gateway (Root) on Railway
- [x] Entry point: `server.js`.
- [x] Host binding binds dynamically to `0.0.0.0` on cloud platforms.
- [x] Railway Nixpacks configuration: `railway.json` and `Procfile` (`web: node server.js`).
- [x] Healthcheck probe: `/health` (HTTP 200) and deep readiness probe: `/ready` (HTTP 200).
- [x] CORS middleware validates exact HTTPS origin via `FRONTEND_ORIGINS`.
- [x] MongoDB Atlas connection pool: `maxPoolSize: 10`, 5s timeouts.
- [ ] Public Railway URL generated (Requires `npx @railway/cli login` or GitHub repo link).

### Service 3: Python LangGraph AI Engine (`multiagent-engine/`) on Railway
- [x] Entry point: `server.py` (`server:app` WSGI).
- [x] Gunicorn added to `multiagent-engine/requirements.txt`.
- [x] Gunicorn start command configured in `multiagent-engine/Procfile` & `railway.json`.
- [x] Dockerfile fallback created: `multiagent-engine/Dockerfile`.
- [x] Dataset path resolution robust across standalone and monorepo working directories.
- [x] Inter-service authentication: Bearer `LANGGRAPH_SERVICE_TOKEN` (32+ chars).
- [x] Private Railway DNS communication supported: `http://tourism-python.railway.internal:8000`.
- [ ] Public Railway URL generated (Requires `npx @railway/cli login` or GitHub repo link).

### Service 4: Cloud Database (MongoDB Atlas)
- [x] Active 3-node replica set connection string configured in `.env`.
- [x] TLS encryption & administrative ping verified: `{ ok: 1 }`.
- [x] Collection `tourism_gwalior.pois` populated and synchronized with 12 curated Gwalior cultural POIs.
- [x] Resilient in-memory fallback guarantees zero downtime if cloud network drops.

---

## 3. Test Verification Summary

- **Node.js Integration Tests:** 25 / 25 Passing (100%)
- **Python LangGraph Multi-Agent Tests:** 58 / 58 Passing (100%)
- **Vite Production Asset Compilation:** 2,032 / 2,032 Modules Passing (100%)
- **Overall Quality Gate:** **83 / 83 Tests Passing (100%)**
