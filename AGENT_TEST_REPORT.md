# Agent Test Report

> Historical snapshot from 2026-10-29. Provider configuration and counts below are not current. The latest executed results are in [docs/TESTING_AND_REPAIR_LOG.md](docs/TESTING_AND_REPAIR_LOG.md); current agent status is in [docs/AGENT_EXECUTION_REPORT.md](docs/AGENT_EXECUTION_REPORT.md).

Date: 2026-10-29

## Scope

Reviewed the existing Express application, its API routes and service contracts, the Flask/LangGraph tourism workflow, all six agent implementations, local curated Gwalior attraction data, environment variable names/configuration presence, and existing tests. Secret values were not printed or copied into this report.

## Workflow topology

The workflow registers six LangGraph nodes: Manager, Research, Route & Time, Verification, Itinerary & Optimization, and Response. Conditional routing sends missing inputs, empty research results, and route provider failures to Response; valid candidate sets go through all downstream agents. A successful test request traversed all six nodes. The agents are deterministic and issue no LLM requests. Gemini intent extraction is a separate Express endpoint.

## Findings and changes

- Fixed transit verification: the service previously returned a geometric estimate labeled `[Live Transit Matrix]` whenever an API key existed, without calling Google. It now requests outbound and return Distance Matrix values, validates the provider response, and falls back with an unverified tag and warning.
- Made fallback warnings explicitly say the estimate is unverified and removed provider error messages from logs to avoid leaking request details.
- Added safe structured LangGraph node events with request ID, elapsed time, aggregate counts, provider/LLM call counts, and dataset read count. Development API responses include `execution_trace`; production responses omit it. Raw request data, API keys, and provider error details are not logged.
- Tightened manager validation for contradictory start/deadline times, boolean durations, and added `mixed` as a supported transport mode used in the example request.
- Corrected the MongoDB status message: a Mongo URI may be present, but this project has no MongoDB driver/adapter and reads the curated JSON dataset locally.
- Added pytest workflow/API/data/contract coverage and fixed the setup instructions to match the working Python 3.14 environment.

## Test results

| Suite | Result |
|---|---|
| Node acceptance (`npm test`) | **8 passed, 0 failed** |
| Python pytest (`.venv\\Scripts\\python.exe -m pytest -q multiagent-engine`) | **26 passed; 1 provider integration failed** |
| Full six-node feasible request | Passed; all six structured node events present, buffered return no later than deadline |
| Missing fields / no matches / provider absent / budget with unknown costs / deadline violation | Passed |
| Production trace suppression | Passed |
| Gemini live integration | **Failed**: credentials are configured and the call reached the service, but it returned the deterministic fallback. The sanitized output does not retain enough information to distinguish credential, quota, model, or network failure. No key or raw provider error was exposed. |
| Google Distance Matrix live integration | Not run: key presence is configured, but a live call would consume provider quota. Request/response behavior is covered by deterministic outage handling and local workflow tests. |
| Routing provider integration | Not run: `ROUTING_PROVIDER_URL` is not configured. Without it, non-demo routing correctly returns `provider_error`. |
| MongoDB integration | Not available: no MongoDB client/adapter exists in project dependencies. |

The full pytest command intentionally returns nonzero on the Gemini provider failure instead of counting heuristic fallback as success. The separate local-only run (`.venv\\Scripts\\python.exe -m pytest -q multiagent-engine -m 'not integration'`) passes all 26 tests; the provider check is deselected. Dependency deprecation warnings from LangSmith/Python 3.14 were also observed; they do not fail the suite.

## Dataset and evidence limits

The local JSON dataset has 12 records and contains no `source_url`/`source_reference` or cost estimates. Consequently, auditor labels without source links remain unverified, and a requested budget rejects records whose costs are unknown. The Jaipur example cannot produce Jaipur attractions from the Gwalior-only dataset; it should return no matches/infeasible rather than fabricate places.

## Credentials/configuration check

The `.env` file was checked only for variable names and whether values were present. `GEMINI_API_KEY`, `DISTANCE_MATRIX_API_KEY`, and `MONGODB_URI` are configured; `ROUTING_PROVIDER_URL` and `ROUTING_PROVIDER_API_KEY` are not. No credential values were displayed. MongoDB URI presence does not imply a live database connection.

## Reproduce

From the repository root in PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pip install -r .\multiagent-engine\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q .\multiagent-engine
npm test
```

The Gemini pytest probe runs automatically when `GEMINI_API_KEY` is set and fails if the configured live provider falls back. To run only that integration check:

```powershell
.\.venv\Scripts\python.exe -m pytest -q -m integration .\multiagent-engine
```

To start both services, use separate terminals:

```powershell
npm start
```

```powershell
$env:LANGGRAPH_PORT='8000'
.\.venv\Scripts\python.exe .\multiagent-engine\server.py
```

Set `DEMO_MODE=true` only for local demos/tests; the generated routes remain explicitly marked synthetic and unverified.

