# Beyond the Fort — Unified Single-Port Architecture Specification
**Project:** Beyond the Fort — Discover the Soul of Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Architecture Status:** Fully Consolidated on Port 5173 Only  
**Decommissioned Ports:** Port 3000 (Express standalone) & Port 8000 (Python LangGraph microservice)

---

## 1. Executive Architecture Summary

The Beyond the Fort application has been permanently consolidated from a fragmented multi-process microservices layout into a single, high-performance Node.js process listening exclusively on **`http://localhost:5173/`**.

```
                           BROWSER CLIENT
                                 │
                     HTTP / WebSocket (:5173)
                                 │
                                 ▼
         ┌──────────────────────────────────────────────────┐
         │       UNIFIED NODE.JS RUNTIME (:5173)            │
         │                                                  │
         │  1. Express Application & Security Gateway       │
         │     - CSRF Protection & Session Management       │
         │     - Rate Limiting & Strict CSP Security        │
         │     - REST API Endpoints (/api/*, /ready, /health)│
         │                                                  │
         │  2. Frontend Delivery Tier                       │
         │     - Dev: In-Process Vite 8 Middleware Mode     │
         │     - Prod: Static Pre-Compiled SPA (new_style)  │
         │                                                  │
         │  3. LangGraph.js 6-Agent AI Engine (In-Process)  │
         │     - Manager Agent                              │
         │     - Research Agent (Curated Gwalior Datasets)  │
         │     - Route & Time Agent (Live Mapbox + Speed)   │
         │     - Verification Agent (Evidence Classification)│
         │     - Itinerary Optimizer (+25% Transit Buffer)  │
         │     - Response Agent (Validated JSON Synthesis)  │
         │                                                  │
         │  4. External Integration Layer                   │
         │     - Google Gemini 2.5 Flash API (Tansen AI)    │
         │     - Mapbox Directions API (Turn-by-turn GIS)   │
         │     - MongoDB Atlas / Local Authoritative POIs   │
         └──────────────────────────────────────────────────┘
```

---

## 2. Port Isolation & Runtime Verification

TCP listening sockets verified via Windows PowerShell:
```powershell
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000,5173,8000 }
```

### Result:
| Local Address | Port | State | Status |
|:---:|:---:|:---:|:---|
| `127.0.0.1` | **5173** | **Listen** | **Active Single Unified Server** |
| `0.0.0.0` | **3000** | *None* | **Permanently Decommissioned** |
| `0.0.0.0` | **8000** | *None* | **Permanently Decommissioned** |

Zero hidden child processes or background wrappers listen on ports 3000 or 8000.

---

## 3. The In-Process 6-Agent LangGraph.js Engine

The multi-agent workflow runs directly inside the Node.js process using `@langchain/langgraph`:

1. **Manager Agent (`services/langgraph/manager.js`)**:
   - Parses visitor query, travel mode, companion, and timeframe.
   - Validates coordinates and enforces boundary constraints (start location, end location, return-to-start).
   - Normalizes available time window, date, and deadline.

2. **Research Agent (`services/langgraph/research.js`)**:
   - Inspects curated Gwalior attraction records (`gwalior_curated_pois.json` & `beyond_the_fort_places.json`).
   - Filters out synthetic/placeholder records and verifies daily operating hours.
   - Injects authentic Wikimedia Commons photographic assets with verifiable licensing.

3. **Route & Time Agent (`services/langgraph/routeAgent.js`)**:
   - Computes distance and duration across all origin/candidate/destination legs.
   - Integrates server-side with Mapbox Directions API (`api.mapbox.com`) using server credentials.
   - Provides deterministic urban speed profile fallback (`calibrated_urban_kinematics`) if upstream rate-limits occur, marking records `[Travel-Time Unverified]`.

4. **Verification Agent (`services/langgraph/verification.js`)**:
   - Classifies every record claim and travel estimate (`VERIFIED`, `STAKEHOLDER_PROVIDED`, `AI_INFERENCE`, or `UNVERIFIED`).
   - Rejects unverified assertions from entering verified schedule guarantees.

5. **Itinerary & Optimization Agent (`services/langgraph/itineraryAgent.js`)**:
   - Enforces the non-negotiable **+25% Transit Safety Buffer** (`Math.ceil(0.25 * totalElapsed)`).
   - Prunes candidates that breach visiting hours, time budgets, or return deadlines.
   - Guarantees mathematical feasibility inequality:
     $$\sum T_{\text{transit}} + \sum T_{\text{dwell}} + \text{Buffer} \le T_{\text{available}}$$

6. **Final Response Agent (`services/langgraph/responseAgent.js`)**:
   - Synthesizes chronological stop sequences, route legs, telemetry, and execution traces.
   - Emits structured JSON consumed directly by the React frontend without simulated delays.

---

## 4. Frontend & Same-Origin API Integration

- **Frontend Client (`new_style/src/services/api.js`)**:
  - `API_BASE_URL` is empty string (`""`), directing all requests to relative paths (`/api/*`, `/health`, `/ready`).
  - Eliminates CORS preflight overhead and cross-port authentication barriers.
  - Automatic CSRF token lifecycle management via `/api/auth/csrf`.
- **Vite Configuration (`new_style/vite.config.js`)**:
  - Obsolete `proxy` dictionary removed.
  - In development, Vite runs in middleware mode within Express (`app.use(vite.middlewares)`).
  - In production, pre-built static assets are served directly from `new_style/dist/`.

---

## 5. Startup Commands

Start the unified application with a single command:

### Development Mode (with Vite HMR on Port 5173):
```bash
npm run dev
```

### Production Mode (Pre-compiled SPA on Port 5173):
```bash
npm run build
npm start
```

### Automated Acceptance & Security Tests:
```bash
npm test
```

---

## 6. Verification & Test Metrics

- **Node.js Automated Test Suite:** `25 / 25` passing tests (`acceptanceTests.test.js`, `agentProgress.test.js`, `i18n.test.js`, `security.test.js`).
- **Browser Automation QA:** 9 interactive routes tested across 8 responsive viewports (1920x1080 down to 360x800).
- **Console Errors:** 0
- **Network Failures:** 0
- **Horizontal Overflows:** 0
- **End-to-End Itinerary Generation:** Verified with real Gwalior coordinates and live 6-agent execution trace.

