# Project Dependency & File Inventory
**Project:** Beyond the Fort — Gwalior Tourism AI  
**Date:** October 31, 2026  
**Auditor:** Software Architect & Project Cleanup Engineer  
**Scope:** Complete classification of all files, routes, dependencies, databases, and authentication mechanisms.

---

## 1. Classification Scheme

Every item in the repository is evaluated and assigned one of six categories:
1. **REQUIRED:** Essential for application execution, build, testing, or core functionality.
2. **USED:** Active component or service currently providing functional value.
3. **OPTIONAL:** Helpful feature or configuration, but not strictly mandatory.
4. **LEGACY:** Outdated implementation superseded by newer systems or flagged for architectural replacement.
5. **UNUSED AND SAFE TO REMOVE:** Redundant, dead, or orphaned artifact that can be safely archived/quarantined.
6. **UNKNOWN — NEEDS INVESTIGATION:** Requires further inspection before any action.

---

## 2. Inventory by Architectural Subsystem

### 2.1 Backend Core & Node.js Application

| Path / File | Status | Description & Role | Action Plan |
| :--- | :--- | :--- | :--- |
| `server.js` | **REQUIRED** | Main Express application entry point. Configures security headers, rate limiters, routes, and middleware. | Retain; remove user auth routes and simplify itinerary endpoints. |
| `package.json` | **REQUIRED** | Node.js project manifest defining dependencies (`express`, `ejs`, `@google/generative-ai`, `mongodb`, `nodemailer`). | Retain; phase out `nodemailer` and `mongodb` after migration. |
| `package-lock.json` | **REQUIRED** | Exact lockfile for reproducible npm installs. | Keep in sync with `package.json`. |
| `config/env.js` | **REQUIRED** | Centralized environment variable loader and validation. | Retain; clean up decommissioned auth/mail variables. |
| `config/db.js` | **USED** | Database abstraction layer for MongoDB and authoritative local JSON cache. | Refactor to serve authoritative local JSON dataset with zero remote network calls. |
| `controllers/feasibilityController.js`| **REQUIRED** | Handles tourist search requests and renders home/search pages. | Retain; remove `auth.requireUser` check. |
| `controllers/intentController.js` | **REQUIRED** | Natural language intent extraction endpoint (`/api/v1/intent/parse`). | Retain. |
| `services/chatService.js` | **REQUIRED** | Manages conversational state and dispatches requests to Gemini/LangGraph. | Retain. |
| `services/geminiService.js` | **REQUIRED** | Direct Google Gemini 2.5 Flash SDK integration. | Retain. |
| `services/tourismWorkflowService.js` | **REQUIRED** | Multi-agent workflow bridge to Python LangGraph (:8000). | Retain. |
| `services/distanceMatrixService.js` | **REQUIRED** | Mathematical distance calculation and transit time estimation. | Retain. |
| `services/authService.js` | **LEGACY** | Scrypt password hashing, session tokens, CSRF protection, and user lockouts. | **Decommission:** Public tourists do not need accounts. |
| `services/emailService.js` | **LEGACY** | Nodemailer password reset email transport. | **Decommission:** Password reset is redundant without user accounts. |
| `services/itineraryStore.js` | **LEGACY** | Server-side JSON/Mongo store for user-linked saved plans. | **Migrate:** Replace with client-side `localStorage` & PDF export. |
| `services/mongoService.js` | **LEGACY** | Raw MongoDB connection helper. | **Decommission:** Content will be static authoritative JSON. |
| `middleware/rateLimit.js` | **REQUIRED** | In-memory token bucket rate limiting preventing DoS abuse. | Retain for public endpoint protection. |
| `utils/feasibilityMath.js` | **REQUIRED** | Strict mathematical inequalities and 25% safety transit buffer calculation. | Retain (Core hackathon innovation). |
| `utils/schemaValidator.js` | **REQUIRED** | Strict JSON schema sanitization and parameter validation. | Retain. |
| `scripts/start-all.js` | **REQUIRED** | Local orchestrator running Python (:8000), Express (:3000), and Vite (:5173). | Retain as 1-click startup script. |

---

### 2.2 Frontend Application (`new_style/`)

| Path / File | Status | Description & Role | Action Plan |
| :--- | :--- | :--- | :--- |
| `new_style/package.json` | **REQUIRED** | React 19, Tailwind CSS 4, Vite 8, Lucide React dependencies. | Retain. |
| `new_style/vite.config.js` | **REQUIRED** | Vite bundler configuration with backend API proxy. | Retain. |
| `new_style/src/main.jsx` | **REQUIRED** | React root mounting entry point. | Retain. |
| `new_style/src/App.jsx` | **REQUIRED** | Monolithic 3,374-line application component containing all state and views. | **Refactor:** Break into modular page and section components. |
| `new_style/src/index.css` | **REQUIRED** | Global stylesheet with Tailwind CSS 4 imports and design tokens. | Update with Royal Heritage design tokens. |
| `new_style/src/translations.js` | **REQUIRED** | Multilingual dictionaries across 21 Indian & international languages. | Retain. |
| `new_style/src/data/places.js` | **REQUIRED** | 36 curated Gwalior cultural attractions and monuments. | Retain as primary frontend static data source. |
| `new_style/src/services/api.js` | **REQUIRED** | HTTP client handling chat, search, and itinerary requests. | Retain; remove user auth/login methods. |
| `new_style/src/aiConcierge.js` | **REQUIRED** | Tansen AI prompt framing and local response generation. | Retain. |
| `new_style/src/components/Navbar.jsx` | **REQUIRED** | Main top navigation bar. | Redesign to floating heritage glass without login buttons. |
| `new_style/src/components/PlaceDetailModal.jsx` | **REQUIRED** | Modal displaying rich attraction imagery and ASI hours. | Redesign with verified audio player and booking tips. |
| `new_style/src/components/ChatBotModal.jsx` | **REQUIRED** | Interactive Tansen AI dialogue box. | Retain & style with burgundy/gold chat bubbles. |
| `new_style/src/components/LanguageModal.jsx` | **REQUIRED** | Language selection modal supporting 21 locales. | Retain. |
| `new_style/src/components/Toast.jsx` | **REQUIRED** | User feedback alert container. | Retain. |
| `new_style/src/components/AuthModal.jsx` | **LEGACY** | Login, Registration, and Password Reset modal. | **Safe to Remove:** Account barriers are being eliminated. |
| `new_style/src/components/DashboardView.jsx` | **LEGACY** | User account profile and saved itineraries view. | **Refactor:** Transform into a client-side "Saved Trips" drawer. |

---

### 2.3 Python Multi-Agent AI Engine (`multiagent-engine/`)

| Path / File | Status | Description & Role | Action Plan |
| :--- | :--- | :--- | :--- |
| `multiagent-engine/server.py` | **REQUIRED** | Flask WSGI service listening on port 8000 for LangGraph dispatch. | Retain. |
| `multiagent-engine/graph.py` | **REQUIRED** | LangGraph StateGraph connecting 6 autonomous tourist agents. | Retain. |
| `multiagent-engine/state.py` | **REQUIRED** | Agent state TypedDict and validation schema. | Retain. |
| `multiagent-engine/agents/*.py`| **REQUIRED** | 6 Specialized Agents (Manager, Research, Route & Time, Verification, Itinerary & Optimization, Response). | Retain; core AI value. |
| `multiagent-engine/requirements.txt`| **REQUIRED**| Python dependencies (`langgraph`, `google-generativeai`, `flask`). | Retain. |
| `multiagent-engine/data/*.json`| **REQUIRED** | Authoritative Gwalior POIs and places for local agent knowledge. | Retain. |

---

### 2.4 Data & Static Assets

| Path / File | Status | Description & Role | Action Plan |
| :--- | :--- | :--- | :--- |
| `data/gwalior_curated_pois.json` | **REQUIRED** | 12 audited Gwalior cultural POIs with verified hours & coordinates. | Authoritative single source of truth for backend. |
| `data/beyond_the_fort_places.json` | **REQUIRED** | 179 supplemental places in Gwalior. | Authoritative supplemental places dataset. |
| `data/IMAGE_ATTRIBUTION.md` | **REQUIRED** | Wikimedia Commons CC-BY-SA license and author attributions. | Retain for legal and copyright compliance. |
| `data/BEYOND_THE_FORT_DATASET_NOTES.md`| **REQUIRED**| Provenance and audit log of all attraction data. | Retain. |
| `data/.auth-users.json` | **LEGACY** | Scrypt encrypted local user database. | **Quarantine/Decommission:** User accounts removed. |
| `data/.saved-itineraries.json` | **LEGACY** | Server-side user saved plans. | **Quarantine/Decommission:** Client storage replaces this. |

---

### 2.5 Obsolete, Redundant & Unused Files (Cleanup Candidates)

| Path / File | Current Classification | Reason for Cleanup | Proposed Action |
| :--- | :--- | :--- | :--- |
| `n8n/tourism_plan_workflow.json` | **UNUSED AND SAFE TO REMOVE** | Legacy prototype workflow file from earlier hackathon phase; replaced by native Python LangGraph engine. | Quarantine in `archive/quarantine/n8n/`. |
| `archive/removed-items/*` | **LEGACY** | Historical remnants of previous refactorings. | Maintain in archive. |
| `views/auth.ejs` | **UNUSED AND SAFE TO REMOVE** | Server-side login/register page. Replaced by public no-auth architecture. | Quarantine in `archive/quarantine/views/`. |
| `views/account.ejs` | **UNUSED AND SAFE TO REMOVE** | Server-side account profile view. | Quarantine in `archive/quarantine/views/`. |
| `views/admin.ejs` | **UNUSED AND SAFE TO REMOVE** | Admin user management page. | Quarantine in `archive/quarantine/views/`. |
| `views/forgot-password.ejs` | **UNUSED AND SAFE TO REMOVE** | Server-side password reset request. | Quarantine in `archive/quarantine/views/`. |
| `views/reset-password.ejs` | **UNUSED AND SAFE TO REMOVE** | Server-side password reset execution. | Quarantine in `archive/quarantine/views/`. |
| `public/css/auth.css` | **UNUSED AND SAFE TO REMOVE** | Stylesheet dedicated to decommissioned auth pages. | Quarantine in `archive/quarantine/css/`. |
| `public/js/auth.js` | **UNUSED AND SAFE TO REMOVE** | Client script dedicated to decommissioned auth pages. | Quarantine in `archive/quarantine/js/`. |
| `public/js/admin.js` | **UNUSED AND SAFE TO REMOVE** | Client script for admin user role updates. | Quarantine in `archive/quarantine/js/`. |
| `public/js/nav-auth.js` | **UNUSED AND SAFE TO REMOVE** | Navbar script managing login state toggles. | Quarantine in `archive/quarantine/js/`. |
| 44 Root Markdown Files | **ORGANIZATIONAL DEBT** | Cluttering the root project directory; should be centralized into `MD/`. | Move into structured subdirectories under `MD/`. |

---

## 3. Database & Authentication Dependency Summary

1. **MongoDB Atlas Usage:**
   * Collections identified: `pois`, `users`, `itineraries`.
   * Current purpose: Remote sync of POIs, remote user credentials, remote saved plans.
   * Target State: Public tourism content served directly from authoritative local JSON datasets (`gwalior_curated_pois.json`, `places.js`), achieving sub-10ms response times and zero remote database network dependencies.
2. **Authentication & Authorization Usage:**
   * Identified routes: 6 auth endpoints, 5 page routes, 14 protected endpoints with `auth.requireUser`.
   * Target State: All tourism discovery, search, planning, and Tansen AI features become 100% public. Rate limiting and input validation protect the backend from abuse without requiring tourists to sign in.

