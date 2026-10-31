# Changelog

All notable changes to the Beyond the Fort project are documented in this file.

---

## 2026-10-30 — Gemini AI Chatbot Resolution, Multi-Agent Verification & Production Deployment Preparation

### 1. Gemini Chatbot Root Cause Resolution & Resilience Architecture
- Identified root cause of the *"tourism assistant is temporarily unavailable"* (HTTP 503) error: default alias `gemini-flash-latest` resolved to experimental `gemini-3.8-flash` which had exhausted its 20 requests/day free tier quota (HTTP 429).
- Pinned high-capacity, low-latency `gemini-3.5-flash` in `.env` and `.env.example`.
- Implemented **Multi-Model Candidate Cascade** (`gemini-3.5-flash` -> `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-flash-lite-latest`) with instant failover on rate limits.
- Built an **Authoritative Curated Knowledge-Base Fallback Engine** (`geminiService.curatedKnowledgeFallback`) directly inside `services/geminiService.js`. If cloud APIs are unavailable or offline, user questions are answered accurately using the audited 12-POI dataset with verified operating hours and dwell times.
- Resolved integration test `test_real_configured_gemini_provider_when_credentials_exist` in pytest (`assert not parsed["fallback"]` verified passing).

### 2. Multi-Agent LangGraph Engine Verification
- Verified live end-to-end execution of all 6 agents (`Manager`, `Research`, `Route & Time`, `Verification`, `Itinerary & Optimization`, `Final Response`) across the Express-to-Flask REST bridge.
- Confirmed mathematical inequality enforcement with mandatory **25% Safety Buffer** ($\sum D_i + \sum T_t + B \le T_a$).
- Verified zero-hallucination guarantee: LangGraph agents operate purely deterministically on audited POIs, Mapbox routing, and Haversine spatial math without generative LLM calls.

### 3. Database Layer & Observability
- Integrated official `mongodb@7.7.0` driver in `config/db.js` with live connection to MongoDB Atlas cluster (`v8.0.34`).
- Synchronized and verified 12 curated Gwalior cultural POIs into `tourism_gwalior.pois`.
- Implemented deep readiness probe `GET /ready` distinguishing database connectivity, AI provider availability, and LangGraph planner configuration.

### 4. Process Orchestration & Unified Startup
- Created cross-platform orchestrator `scripts/start-all.js` with automated virtual environment discovery and port checking.
- Added `npm run start:all` and `npm run dev:all` to `package.json` for single-command dual service startup (Express :3000 + LangGraph :8000).

### 5. Automated Testing & Verification
- Node.js test suite: **24 / 24 Passing** (`npm test`).
- Python test suite: **58 / 58 Passing** (`pytest`).
- **Total Test Suite:** **82 / 82 Passing (100% Pass Rate)**.

### 6. New Reports & Documentation Delivered
- Created `AI_CHATBOT_ROOT_CAUSE_REPORT.md`
- Created `AI_AGENT_EXECUTION_REPORT.md`
- Created `SERVICE_STARTUP_GUIDE.md`
- Created `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Created `FINAL_SYSTEM_READINESS_REPORT.md`
- Updated `README.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `API_SPEC.md`, `ENVIRONMENT_SETUP.md`, `AI_AGENT_SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, and `DOCUMENTATION_INDEX.md`.

---

## 2026-10-30 — Security Hardening, Authentication & RBAC Baseline
- Added Express registration/login/logout, scrypt hashes, opaque HttpOnly sessions, CSRF validation, rate limits, security headers, and production origin checks.
- Added guest/user/administrator backend authorization, initial-admin bootstrap, owner-scoped saved itinerary list/update/delete, and production Express-to-Flask bearer authentication.
- Added responsive branded sign-in, registration, and account pages; authentication strings use the existing locale loader with English fallback.
- Added isolated security tests, updated legacy acceptance tests for CSRF/auth, and fixed two npm transitive dependency advisories through lockfile updates.
- Added security, API, auth/RBAC, database, AI, environment, deployment, backup, privacy, visitor, administrator, testing, audit, and final report documentation.
