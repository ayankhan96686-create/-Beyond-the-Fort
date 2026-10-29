# AI-Powered-Hidden-Cultural-Discovery
**AI Synergy Hackathon 2026 • Round 1 Submission**
**Team Identity:** Team Venator (ID: `60358412`) | ITM University Gwalior
**Selected Theme:** Theme 04 — Tourism: Beyond the Fort (Gwalior Micro-Corridor Pilot)
**Live Repository:** `https://github.com/ayankhan96686-create/Time-Aware-Digital-Discoverability-Beyond-the-Fort`

---

## 📌 Executive Summary

**Backend audit status (2026-10-30):** the active stack is Express + Flask/LangGraph with local JSON data. All six deterministic workflow nodes ran in a live Mapbox-backed planning probe. See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) and [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md) for current evidence. The percentage and distance figures below are from the original hackathon brief and have not been independently validated by this repository.

Heritage cities across India suffer from severe tourism hyper-concentration. In Gwalior, **67% of day-visitor footfall remains trapped in a 1.2 km bubble** around Gwalior Fort and Jai Vilas Palace. Meanwhile, authentic master artisans—Chanderi silk weavers in Kripalpur, brass founders in Maharaj Bada, and classical Dhrupad musicians in Hazira—sit just **3 to 8 km away**, invisible to visitors.

Visitors do not avoid these cultural gems due to lack of interest; they avoid them due to **travel-time anxiety**. Day-visitors operate within rigid **5 to 8 hour schedules**. Without guaranteed return times, visiting a peripheral artisan risks missing an evening train or flight.

### The current prototype
A decoupled web platform where:
1. **Gemini intent parsing** is a separate Express capability with a deterministic fallback; it is not called by the planner. Its live integration timed out during this audit.
2. **Flask and LangGraph** route plan requests through six deterministic Python workflow roles; those roles make no LLM calls.
3. **Node.js and Express** serve the EJS site, expose REST endpoints, and proxy planner requests to Flask. A separate legacy feasibility path remains available.
4. **Local JSON files** provide 12 curated records and 179 imported listings. Their provenance and verification limits are documented; no application MongoDB adapter is installed.

> **Core Axiom:** *"A place is useful only if visitors trust it fits their schedule."*

---

## 📐 The Feasibility Inequality

A candidate is selected only when its estimated travel and visit time fit the schedule and the safety buffer. This is a planner constraint, not a guarantee of real-world arrival time:

$$T_{\text{outbound}} + T_{\text{return}} + T_{\text{visit}} + T_{\text{buffer}} \le T_{\text{available}}$$

Where:
- $T_{\text{outbound}}$ = Transit duration from origin to the artisan site.
- $T_{\text{return}}$ = Transit duration from artisan site back to origin/hub.
- $T_{\text{visit}}$ = Curated minimum dwell time for authentic engagement.
- $T_{\text{buffer}} = \lceil 0.25 \times (T_{\text{round\_trip}} + T_{\text{visit}}) \rceil$ = Mandatory 25% safety margin protecting against urban transit variances.
- $T_{\text{available}}$ = Visitor's stated available visiting window.

---

## 🏗 System Architecture (Decoupled 3 Tiers)

```
+-------------------------------------------------------------------------+
|                       TIER 1: CLIENT PRESENTATION                       |
|   • Mobile-First Responsive EJS & Vanilla CSS (Bento Box Design)        |
|   • Multilingual Conversational Query Bar ("Mujhe local khana...")      |
|   • Dynamic Time-Budget Slider (1.0h to 8.0h)                           |
+-------------------------------------------------------------------------+
                                    │
                         POST /api/v1/tourism-plan
                                    ▼
+-------------------------------------------------------------------------+
|                    TIER 2: TOURISM REST PLANNER                         |
|   • Node.js & Express API / Flask proxy                                 |
|   • Flask invokes the compiled LangGraph workflow                       |
|   • The legacy feasibility endpoint remains separate                   |
|   • Deterministic itinerary and deadline checks                         |
+-------------------------------------------------------------------------+
        │                                                  │
        ▼                                                  ▼
+───────────────────────────+             +───────────────────────────────+
|     TIER 3A: AI INTENT    |             |     TIER 3B: DATA & ROUTING   |
| • Separate Gemini parser  |             | • Curated + imported JSON    |
| • Deterministic fallback  |             | • Mapbox Directions adapter  |
| • Not called by planner   |             | • Explicit synthetic demo    |
|                           |             |   only when DEMO_MODE=true   |
+───────────────────────────+             +───────────────────────────────+
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18+` (Tested on `v24.14.0`)
- npm `v9+`
- Python `3.11+` (audit environment: `3.14.4`)

### Installation
```powershell
# Clone the repository
git clone https://github.com/ayankhan96686-create/Time-Aware-Digital-Discoverability-Beyond-the-Fort.git
cd Time-Aware-Digital-Discoverability-Beyond-the-Fort

# Install dependencies
npm install
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r .\multiagent-engine\requirements-dev.txt

# Create local configuration only when it does not already exist
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

### Running the Test Suites

The Node suite covers feasibility math, validation, fallback behavior, the Express bridge, and itinerary/attraction routes. The Python suite covers the LangGraph workflow, agent logic, response contract, and mocked provider cases:
```bash
npm test
.venv/Scripts/python.exe -m pytest -q multiagent-engine -m "not integration"
```

The optional integration test makes a live Gemini call and may consume provider quota:
```powershell
.\.venv\Scripts\python.exe -m pytest -q .\multiagent-engine -m integration
```

### Starting the Application

Run each service in a separate terminal from the repository root:
```bash
npm start
```

```powershell
.\.venv\Scripts\python.exe .\multiagent-engine\server.py
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the six-role tourism workflow

The project uses the existing Express REST app and a separate Flask + LangGraph API. Use [docs/AGENT_EXECUTION_REPORT.md](docs/AGENT_EXECUTION_REPORT.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for current contracts and execution evidence; [TOURISM_WORKFLOW.md](TOURISM_WORKFLOW.md) is an earlier implementation snapshot.

Tansen AI is available at `/chat` and from the main navigation. It sends grounded tourism questions to the server-side Gemini integration and planning requests to the existing LangGraph REST workflow. Chat history is session-scoped in Express memory and clears on restart. See [chatbot architecture](docs/CHATBOT_ARCHITECTURE.md), [chat API](docs/CHATBOT_API.md), [deployment guide](docs/DEPLOYMENT_GUIDE.md), and [chat test report](docs/CHATBOT_TEST_REPORT.md). Gemini accepted the configured key and model, but response latency is intermittent; the chat now allows up to 60 seconds before returning a timeout message.

Open `http://localhost:3000`, select interests, companion type, transport, date and schedule, then choose a start and destination using one-time browser location, map pins, or manually entered coordinates. The browser requests location permission only after the location button is clicked. “Return to my starting point” is enabled by default. Address geocoding is not configured, so a typed place label alone is not resolved. Companion type is included in the response summary but does not change route selection. Successful API responses are held in the current browser tab and shown at `/itinerary`; attraction records load by stable dataset ID at `/attractions/:id`. Clear tab storage to remove saved trip and coordinates. See [docs/LOCATION_AND_ROUTE_PLANNING.md](docs/LOCATION_AND_ROUTE_PLANNING.md) for the location schema, privacy behavior and full-route validation.

Configure `ROUTING_PROVIDER_URL` and `ROUTING_PROVIDER_API_KEY` in the ignored root `.env` for live routes. The Mapbox adapter uses walking for `walk` and the standard driving profile for `auto`, `e_rickshaw`, and `cab`; those driving estimates are not mode-specific and carry a warning. Without a provider, the planner returns `provider_error`. Synthetic routes are enabled only by `DEMO_MODE=true` and are labeled as inference.

The active Express data layer and Flask Research agent read local JSON. `MONGODB_URI` is not used by an application adapter. The curated records have no source links or prices; imported listings are unverified and use a heuristic 30-minute dwell time. A requested budget cannot be evaluated against the current data. See [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) and [docs/DATA_AND_PROVENANCE.md](docs/DATA_AND_PROVENANCE.md).
## 📂 Repository Layout

```
├── README.md                      # Project overview, quickstart & team roster
├── ARCHITECTURE.md                # Active Express, Flask, and LangGraph architecture
├── FEASIBILITY_MATH.md            # Intended time-budget model; not an arrival guarantee
├── API_SPEC.md                    # RESTful API documentation & error handling
├── DATASET_EXPLORATION.md         # Original Gwalior pilot design brief
├── ACCEPTANCE_TESTS.md            # Test harness architecture & validation criteria
├── server.js                      # Application entry point
├── package.json                   # Dependency and script manifests
├── .env.example                   # Environment variable template
├── config/
│   ├── env.js                     # Loads Node settings from the root .env
│   └── db.js                      # Loads the local curated JSON file; no Mongo adapter
├── controllers/
│   ├── feasibilityController.js   # Orchestrates search, intent, math & pruning
│   └── intentController.js        # Dedicated NLP intent parser endpoint
├── services/
│   ├── geminiService.js           # Separate Gemini intent parser with deterministic fallback
│   ├── tourismWorkflowService.js   # Express-to-Flask LangGraph REST client
│   ├── distanceMatrixService.js   # Legacy Node transit component
│   └── mongoService.js            # Legacy-named local JSON retrieval service
├── utils/
│   ├── feasibilityMath.js         # Deterministic inequality evaluation & pruning
│   └── schemaValidator.js         # Input sanitization & JSON schema validation
├── data/
│   ├── gwalior_curated_pois.json  # 12 locally curated Gwalior POIs; see provenance limits
│   └── beyond_the_fort_places.json # 179 imported, unverified listings for Flask Research
├── multiagent-engine/             # Python Flask + six-role LangGraph workflow
├── TOURISM_WORKFLOW.md            # Workflow diagram, contracts, setup and feature report
├── docs/                           # Current audit, API, agent, config and testing reports
├── archive/                        # Reversible archival policy and manifest
├── tests/
│   └── acceptanceTests.test.js    # Comprehensive automated test suite
├── views/
│   ├── index.ejs                  # Bento Box UI landing & search interface
│   ├── itinerary.ejs              # Separate backend-driven itinerary page
│   └── attraction.ejs             # Separate stable-ID attraction details page
└── public/
    ├── css/style.css              # Ultra-sleek Bento / Swiss Minimalist CSS
    ├── js/main.js                  # Dynamic preferences, validation and REST submission
    ├── js/itinerary.js             # Itinerary presentation and regeneration
    └── js/attraction.js            # Dataset-backed detail page
```

---

## Supplemental Beyond the Fort listings

`data/beyond_the_fort_places.json` preserves the 179-record Google Maps export from the separate Beyond the Fort project. The research agent uses tourism-relevant records with valid coordinates as an additional source alongside the curated POIs. Imported business listings remain marked unverified; because the export has no visit durations, the agent assigns a clearly disclosed 30-minute planning default. Each run is capped at six candidates to bound routing requests. Confirm scraped details and hours before travel.

## 👥 Team Venator Roster

| Member Name | Institutional Affiliation | Project Role |
| :--- | :--- | :--- |
| **Mohammad Jubaid** | ITM University Gwalior | Team Lead & AI Architecture Specialist |
| **Ayan Khan** | ITM University Gwalior | Backend Systems & Deterministic Math Engine |
| **Arjun Singh Bhadoriya** | ITM University Gwalior | Geospatial Engineering & Data Stewardship |
| **Mohith Ch** | ITM University Gwalior | Frontend Architecture & Bento UI/UX Design |

---

## 📄 License & Attribution
This project is licensed under the MIT License for the AI Synergy Hackathon 2026.
