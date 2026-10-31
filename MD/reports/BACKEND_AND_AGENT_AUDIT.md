# Backend and Agent Execution Audit

> Historical audit snapshot (2026-10-29/30). Some integration state below changed afterward. The current audit and actual checks are in [docs/BACKEND_AUDIT.md](docs/BACKEND_AUDIT.md), [docs/AGENT_EXECUTION_REPORT.md](docs/AGENT_EXECUTION_REPORT.md), and [docs/TESTING_AND_REPAIR_LOG.md](docs/TESTING_AND_REPAIR_LOG.md).

**Audit started:** 2026-10-29; **updated:** 2026-10-30  
**Scope:** Express frontend/API, Flask/LangGraph planner, dataset and database wiring, provider configuration, agent execution, and the current browser/API flow.

## Executive findings

- **PASS — Services are reachable.** The Express and Flask health endpoints returned HTTP 200. The UI loaded in the browser at `http://127.0.0.1:3001/`.
- **PASS — LangGraph executes real workflow nodes.** The graph invokes Manager, Research, Route & Time, Verification, Itinerary & Optimization, and Response. The end-to-end graph test exercises this graph and observes six node trace entries.
- **BLOCKED — Live LLM integration.** The supplied Gemini key is stored in local `.env` without printing it. REST probes for both `gemini-3.8-flash` and the supplied `gemini-flash-latest` alias timed out from this environment, so the key/provider cannot yet be verified; intent parsing falls back deterministically. The app now defaults to the supplied alias and allows overriding it with `GEMINI_MODEL`.
- **PASS WITH LIMITATION — Live route integration.** Mapbox is configured in local `.env`. A real Directions API call succeeded, and a fresh end-to-end LangGraph test returned a feasible two-stop itinerary with `mapbox_driving` route sources classified `VERIFIED`. The already-running Flask process still returned demo estimates because it has not been restarted with the new configuration.
- **CREDENTIALS VERIFIED, APP NOT CONNECTED — MongoDB Atlas.** The separate Atlas credentials file passed a read-only authenticated ping. The app itself still has no MongoDB adapter and loads the local JSON file into memory; the successful ping does not mean the app uses Atlas.
- **PASS WITH LIMITATION — Dataset.** The local curated file contains 12 Gwalior POIs. The planner returns no Jaipur records instead of inventing them. No date-specific opening calendar is available.
- **PASS — Failure cases.** Unit/integration tests cover missing fields, no matching POIs, dataset read failure, absent routing provider, impossible deadline/budget conditions, and a feasible route under explicit demo mode.

## Running services and endpoints

At audit time, these endpoints returned HTTP 200:

| Service | Endpoint | Result |
| --- | --- | --- |
| Express | `http://127.0.0.1:3001/health` | `healthy` |
| Express | `http://127.0.0.1:3000/health` | `healthy` |
| Flask/LangGraph | `http://127.0.0.1:8000/health` | `healthy`; lists all six agents |
| Browser | `http://127.0.0.1:3001/#trip-planner` | Planner form loaded and was accessible |

Existing services were already listening, so I verified them rather than starting duplicate processes. To start them when those ports are free:

```powershell
npm start
.venv\Scripts\python.exe multiagent-engine\server.py
```

To verify health manually:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/health
Invoke-RestMethod http://127.0.0.1:8000/health
```

The planner page rendered in the browser. The live planning contract was exercised directly through the Express API and Flask API; a real browser form submit was not performed during this audit.

The Express plan endpoint `POST /api/v1/tourism-plan` forwarded a valid Gwalior request to the already-running Flask service and returned HTTP 200 with a two-stop feasible itinerary using synthetic demo fixtures. A fresh Flask test client loaded the new `.env`, disabled demo mode, called Mapbox in both directions, and returned HTTP 200 with two stops and six `mapbox_driving` travel estimates classified `VERIFIED`. Its trace contained all six nodes. The already-running Flask process still needs a restart before the browser-to-Express flow uses Mapbox. The live production response omits `execution_trace`; production logs are instrumented, but that process's stdout was not available for inspection.

The API-level live probes returned:

- **Missing constraints:** `needs_input`, listing required city, date, times, duration, return location, transport, and coordinates.
- **Jaipur heritage:** `infeasible`, zero itinerary stops, and no evidence or route estimates. The current curated dataset is Gwalior-only.
- **Gwalior silk weaving:** `feasible`, two stops, estimated return `12:34`, with synthetic-route and date-specific-hours warnings.

## Agent and graph audit

`multiagent-engine/graph.py` builds and compiles a LangGraph with these nodes and conditional transitions:

1. **Manager** validates and normalizes explicit request fields. Missing or invalid fields go directly to Response.
2. **Research** searches `data/gwalior_curated_pois.json`. No match goes to Response; matches continue to Route & Time.
3. **Route & Time** calls the configured `ROUTING_PROVIDER_URL`, or uses an explicitly enabled synthetic demo fixture. Missing/failed provider requests return `provider_error`.
4. **Verification** labels source-backed claims and travel estimates; absent source evidence is not upgraded to verified.
5. **Itinerary & Optimization** searches up to three stops, checks travel legs, dwell times, known hours, budget, deadline, and a 25% safety buffer.
6. **Response** returns the stable response schema without changing an unsuccessful status.

The node functions are real Python functions invoked by the compiled LangGraph, but they are deterministic workflow agents. The Python graph has no LLM client: `llm_calls` is explicitly recorded as zero. The separate Node Gemini intent parser is the only LLM integration found in the audited path; it is not called by the Express-to-LangGraph planning endpoint.

`graph.py` records structured `agent.start`, `agent.complete`, and `agent.error` logs keyed by `request_id`. Development responses include per-node `execution_trace`; production responses intentionally omit it. A failure trace is logged as an error event but is not appended to the response trace.

## Provider and data integrations

### Gemini intent parser

`services/geminiService.js` previously used the shut-down `gemini-1.5-flash` model. Google’s [official Gemini release notes](https://ai.google.dev/gemini-api/docs/changelog) list its shutdown on September 29, 2025. The service now defaults to the `gemini-flash-latest` alias from the user's supplied request, can be overridden with `GEMINI_MODEL`, and applies a configurable 15-second request timeout. Both the earlier key (before replacement) and the new key probes timed out from this environment; the new key's status remains unknown. The key value was not printed or included here. Intent parsing falls back deterministically when the provider cannot answer. Restart the Express process to reload changed model/configuration values.

### Route estimates

The LangGraph route node is now configured with `ROUTING_PROVIDER_URL=https://api.mapbox.com` and the user-supplied token stored as `ROUTING_PROVIDER_API_KEY` in local `.env`. A real request returned distance and duration from Mapbox. The adapter calls Mapbox's [Directions API](https://docs.mapbox.com/api/navigation/directions/), which takes longitude/latitude coordinates and returns meters/seconds; the adapter converts those units into kilometers/minutes. For Mapbox it requests outbound and return legs separately because road routes can be asymmetric. Google Maps and Mapbox keys are never written to logs.

Mapbox supports driving and walking profiles. The adapter maps `walk` to walking, and `auto`, `e_rickshaw`, and `cab` to driving; it rejects unsupported modes such as public transit rather than fabricating transit routes. Responses warn that the driving profile is not calibrated for rickshaw- or cab-specific speeds. The existing Flask process returned `synthetic_demo_fixture` before restart, despite the updated project `.env` setting `DEMO_MODE=false`.

The separate legacy Node `DistanceMatrixService` has a `DISTANCE_MATRIX_API_KEY` entry, but a sanitized live probe returned provider status `REQUEST_DENIED` and “API key is invalid.” Its code falls back to geometric estimates and marks them unverified. A successful key does not replace the missing `ROUTING_PROVIDER_URL` used by the LangGraph planner.

### Database and dataset

The Express data layer loads the JSON dataset into memory. `connect()` logs that MongoDB configuration may exist but no adapter is installed. The Python Research node independently reads the same local JSON dataset. The separately provided `D:\atlas-credentials.env` file has a correctly shaped `mongodb+srv` Atlas URI, resolvable SRV records, and passed an authenticated read-only `ping` using a temporary PyMongo client; no data was written and the temporary package was removed. The project still has no MongoDB driver or application connection. The dataset is currently Gwalior-specific; Jaipur lookup correctly yields no candidates.

## Test results

Commands run from the repository root:

```powershell
.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"
npm test
.venv\Scripts\python.exe -m pytest -q multiagent-engine -m integration
```

- **Python workflow suite:** `33 passed, 1 deselected` (13 upstream LangSmith deprecation warnings), including Mapbox coordinate/unit conversion and directional-leg tests.
- **Node acceptance suite:** `9 passed, 0 failed`.
- **MongoDB Atlas credential check:** Authenticated read-only `ping` succeeded using the separate credentials file. No project data was read or modified.
- **Gemini integration probe:** The earlier key failed with `API_KEY_INVALID`. After the replacement key was installed, bounded REST probes using both `gemini-3.8-flash` and `gemini-flash-latest` timed out; provider integration remains unverified from this network. The SDK call now has a 15-second timeout instead of hanging for the test’s full 90-second limit.
- The Node dataset integrity test previously made a network request for each POI. It now stubs the distance service for that local dataset-only check, so `npm test` no longer depends on the live provider.

Coverage includes manager validation, exact city/category matching, dataset read failure, missing route-provider behavior, evidence labeling, infeasible budget/deadline behavior, feasible demo planning, production trace suppression, response schema, Express-to-Flask forwarding, and itinerary/attraction routes plus stable-ID lookup and 404 behavior.

## Fixes made during this audit

- Updated the Gemini model selection from the shut-down `gemini-1.5-flash` to `gemini-3.8-flash`.
- Isolated the Node dataset integrity test from the live Distance Matrix provider so local tests remain deterministic and do not make one external call per POI.

## Remaining actions to get live integrations

1. Retry `python -m pytest -q multiagent-engine -m integration` from a network that can reach Google’s Gemini API. Rotate the key because it was pasted into chat.
2. Restart the existing Flask process so the Express API uses Mapbox instead of its old demo-mode environment. Verify the live route sources remain `mapbox_driving` and `VERIFIED`.
3. Retry Gemini from a network that can reach Google's API; rotate the key because it was pasted into chat.
4. If MongoDB is intended, install and wire a Mongo adapter; otherwise retain the JSON store and describe it as local-file-backed.

The audit did not print secret values. The legacy Distance Matrix provider still rejects its configured key. Gemini timed out after the replacement key was supplied, so its status is unknown.

