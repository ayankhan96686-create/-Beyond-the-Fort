# DEPLOYMENT PRECHECK REPORT — BEYOND THE FORT
**Project:** Time-Aware Digital Discoverability: Beyond the Fort, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Evaluation Date:** October 30, 2026  
**Auditor:** Senior DevOps & Cloud Deployment Architect  
**Workspace:** `D:\TOURISM AI MULTI-AGENT SYSTEM\Time-Aware-Digital-Discoverability-Beyond-the-Fort`  
**Target Repository:** `Venator/-beyond-the-fort` / `https://github.com/ayankhan96686-create/-Beyond-the-Fort`  

---

## 1. EXECUTIVE SUMMARY

An exhaustive, non-destructive deployment precheck was executed across all components of the Beyond the Fort application: the root Node.js/Express backend gateway, the `multiagent-engine/` Python Flask/LangGraph AI engine, the `new_style/` Vite React frontend, and the MongoDB Atlas cloud database cluster.

| Area | Status | Key Findings |
|---|---|---|
| **Git & Version Control** | **PASS** | Branch `main`, working tree clean, synced with origin (`d425c42`). |
| **Node.js Gateway & Entry Point** | **PASS** | Node 20+, `server.js` entry point, robust `0.0.0.0` host binding on cloud ports, 25/25 tests passing. |
| **Python LangGraph AI Engine** | **PASS** | `server.py` (`server:app` WSGI), Gunicorn added, robust data path fallback, 58/58 tests passing. |
| **Vite Frontend (`new_style/`)** | **PASS** | Vite v8.3.5, builds 2,032 modules to `dist/` in 419ms, SPA rewrites configured in `vercel.json`. |
| **Frontend API Integration** | **PASS** | `new_style/src/services/api.js` connects via `VITE_API_BASE_URL` with resilient local concierge fallback. |
| **Express-to-Flask IPC** | **PASS** | Supports both `PYTHON_SERVICE_URL` and `LANGGRAPH_API_URL` with 45s timeout and Bearer token auth. |
| **MongoDB Atlas Connectivity** | **PASS** | Live cluster ping verified `{ ok: 1 }`, 12 curated POIs upserted and synced in `tourism_gwalior.pois`. |
| **Cross-Origin Auth & Cookies** | **PASS** | Scrypt password hashing, CSRF double-submit, dynamic `SameSite=None; Secure` for Vercel/Railway. |
| **Cloud Deployment Artifacts** | **PASS** | Railway Nixpacks configs, Procfiles, Dockerfiles, and Vercel configs generated and verified. |

---

## 2. DETAILED PRECHECK MATRIX

### 2.1 Git Repository & Source Integrity
- **Status:** **PASS**
- **Branch:** `main`
- **Head Commit:** `d425c42` (`chore: normalize line endings across deployment configs and reports`)
- **Remote Origin:** `https://github.com/ayankhan96686-create/-Beyond-the-Fort.git`
- **Working Tree:** Clean; zero uncommitted modifications; secret files (`.env`, `.auth-users.json`) strictly excluded by `.gitignore`.

### 2.2 Node.js & Dependency Lockfiles
- **Status:** **PASS**
- **Root `package.json`:** Verified dependencies: `@google/generative-ai` (^0.24.0), `dotenv` (^16.4.7), `ejs` (^3.1.10), `express` (^4.21.2), `mongodb` (^7.7.0), `nodemailer` (^10.3.1).
- **Lockfile:** `package-lock.json` present, synchronized, and valid.
- **Node Runtime:** Compatible with Node.js 18 LTS, 20 LTS, and 24 Current.

### 2.3 Python Multi-Agent Dependencies
- **Status:** **PASS**
- **`multiagent-engine/requirements.txt`:** `langgraph>=0.2.20`, `langchain-core>=0.3.0`, `flask>=3.0.0`, `python-dotenv>=1.0.0`, and `gunicorn>=21.2.0`.
- **WSGI Target:** `server:app` tested and confirmed compatible with Gunicorn and Werkzeug.
- **Python Version:** Tested against Python 3.11, 3.12, 3.14 on virtual environment.

### 2.4 Server Entry Points & Host Binding
- **Status:** **PASS**
- **Express Entry Point:** `server.js` binds dynamically to `0.0.0.0` when running under `PORT` (Railway/Docker/Render) and `127.0.0.1` during local dev.
- **Python Entry Point:** `multiagent-engine/server.py` binds to `0.0.0.0` when `PORT` or `RAILWAY_ENVIRONMENT` is set.
- **Healthcheck Endpoints:**
  - Node.js: `/health` (HTTP 200, basic liveness) and `/ready` (HTTP 200, deep database and AI configuration probe).
  - Python: `/health` (HTTP 200, returns active agent roster: Manager, Research, Route & Time, Verification, Itinerary & Optimization, Response).

### 2.5 Frontend Build & Asset Compilation
- **Status:** **PASS**
- **Directory:** `new_style/`
- **Build Tool:** Vite v8.3.5 + `@tailwindcss/vite` v4.3.3 + React 19.
- **Build Verification:** `npm run build` executed successfully. Generated `dist/index.html` (0.92 kB), `dist/assets/*.css` (53.69 kB), `dist/assets/*.js` (513 kB). Zero compilation errors.

### 2.6 Environment Variable Hygiene
- **Status:** **PASS**
- **Server Secrets:** `MONGODB_URI`, `GEMINI_API_KEY`, `SESSION_SECRET`, and `LANGGRAPH_SERVICE_TOKEN` are server-side only. Never referenced in `new_style/` bundles.
- **Frontend Config:** Only `VITE_API_BASE_URL` is exposed to browser bundles.
- **Documentation:** Prepared clean template in `PRODUCTION_ENVIRONMENT_VARIABLES.md`.

### 2.7 REST API Routes
- **Status:** **PASS**
- All required public and authenticated routes validated:
  - `POST /api/chat` & `POST /api/chat/reset`
  - `POST /api/v1/tourism-plan` & `POST /tourism-plan`
  - `GET /api/v1/pois` & `GET /api/v1/attractions/:id`
  - `POST /api/auth/register`, `/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password`
  - `GET/POST/PUT/DELETE /api/itineraries/:id`
  - `GET /health` & `GET /ready`

### 2.8 Express-to-Flask Communication
- **Status:** **PASS**
- `services/tourismWorkflowService.js` verified:
  - Targets `config.langgraphApiUrl` (configured via `PYTHON_SERVICE_URL` or `LANGGRAPH_API_URL`).
  - Supports private Railway DNS networking (e.g. `http://tourism-python.railway.internal:8000/plan`).
  - Includes Bearer token authentication header (`LANGGRAPH_SERVICE_TOKEN`).
  - Implements 45-second execution timeout with graceful fallback handling.

### 2.9 MongoDB Atlas Connectivity
- **Status:** **PASS**
- **Cluster Connection:** Active TLS connection to MongoDB Atlas 3-node replica set.
- **Database / Collection:** `tourism_gwalior.pois`.
- **Integrity:** 12 curated Gwalior cultural POIs seeded and synced via idempotent `bulkWrite`.
- **Zero-Downtime Resilience:** Automatically falls back to local authoritative memory store if Atlas network disruption occurs.

### 2.10 Authentication, Sessions & Cross-Domain Security
- **Status:** **PASS**
- **Password Security:** Scrypt KDF with 64-byte salt and 64-byte derived key.
- **CSRF Defense:** Double-submit cookie with cryptographically strong base64url token; validated on all state-changing HTTP methods.
- **Account Lockout:** 5 consecutive failed attempts trigger a 15-minute freeze.
- **Cross-Domain Cookie Support:** `services/authService.js` configured with `SameSite=None; Secure` for decoupled Vercel (`*.vercel.app`) to Railway (`*.up.railway.app`) requests.

---

## 3. AUTOMATED TEST VERIFICATION

| Test Suite | Tests Total | Passing | Failing | Success Rate |
|---|---|---|---|---|
| **Node.js Integration & Security** | 25 | 25 | 0 | **100%** |
| **Python LangGraph Multi-Agent** | 58 | 58 | 0 | **100%** |
| **Vite Frontend Production Build** | 2,032 modules | 2,032 | 0 | **100%** |
| **Total System Verification** | **83** | **83** | **0** | **100%** |

---

## 4. PRECHECK CONCLUSION & DEPLOYMENT PERMISSION

All automated prechecks have completed with **zero blocking errors**. The application architecture is confirmed healthy and ready for deployment to:
1. **Railway (Service 1):** Python Flask LangGraph AI engine (`multiagent-engine/`)
2. **Railway (Service 2):** Node.js Express backend gateway (Root repository)
3. **Vercel:** Vite React frontend (`new_style/`)
4. **MongoDB Atlas:** Cloud database (`tourism_gwalior.pois` live cluster)
