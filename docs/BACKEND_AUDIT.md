# Backend Audit

Audit date: 2026-10-30. Baseline repository: `main` at `55eb4ce`.

## Baseline and safeguards

- Before audit edits, Git reported 17 tracked modifications and 70 untracked paths. These were existing UI, data, asset, workflow, memory, and report work. They were preserved.
- Baseline before repairs: `npm test` passed 9 tests; `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` passed 33 tests with one integration case deselected and 13 LangSmith deprecation warnings.
- The `.env` file is ignored and not tracked. Its contents were never printed, copied, or saved into documentation; only configured/missing status was checked programmatically.
- No commit, push, or pull request was created. No ambiguous files were deleted or archived.

## Real request path

1. `public/js/main.js` submits the planner form to Express `POST /api/v1/tourism-plan`.
2. `server.js` calls `services/tourismWorkflowService.js`, which normalizes legacy aliases, forwards selected endpoints and POSTs JSON to `LANGGRAPH_API_URL` (default `http://127.0.0.1:8000/plan`, 45-second client timeout).
3. `multiagent-engine/server.py` validates that the body is a JSON object and invokes the compiled `tourism_graph` in `multiagent-engine/graph.py`.
4. LangGraph executes the manager, research, route, verification, itinerary, and response Python functions. Its conditional edges skip downstream work when required input/data/provider state is missing.
5. `response_node` builds the response contract; Flask returns the JSON and Express forwards it.

The Gemini client in `services/geminiService.js` is separate. The six planning nodes recorded `llm_calls: 0` in the live trace.

## Findings and repairs

| Severity | Finding | Evidence / repair |
| --- | --- | --- |
| P1 trust | Place evidence could be labeled `VERIFIED` solely from an auditor-like string and a non-empty URL/reference. | Fixed in `agents/verification.py`: place claims remain `STAKEHOLDER_PROVIDED` or `UNVERIFIED` until an auditable source-check process exists. Added tests for absent, URL-only, and reference-only evidence. Live provider route evidence remains `VERIFIED` only after an actual route call. |
| P2 input | `budget=NaN` and positive infinity passed validation; `available_minutes=Infinity` could raise uncaught `OverflowError`. | Fixed in `agents/manager.py` with `math.isfinite` for budgets and overflow handling for duration conversion. Added non-finite and huge-number regression cases. |
| P2 routing | A JSON provider could return non-finite distance/duration values; those could escape validation or fail during conversion. | Fixed in `agents/route_agent.py`; both Mapbox and generic-provider values must be finite before unit conversion. Added malformed-response tests. |
| P2 contract | Planner UI sent its companion selection, but the Express-to-Flask adapter discarded it. | Fixed: proxy forwards the optional value, Manager validates the supported choices, and `trip_summary` preserves it. Tests cover the bridge and response. It is informational; no group-specific route logic exists. |
| P2 error handling | Express and legacy controllers exposed caught `err.message`; the Flask bridge copied remote exception text to logs/client errors; Flask logged a traceback with raw exception text. | Fixed: malformed JSON gets a safe HTTP 400; generic internal errors return generic messages; legacy controllers and bridge log only safe event/error types; Flask logs only the exception type. Regression tests assert secret-like details are absent. |
| P2 local config | `.gitignore` ignored only `.env`, not dotenv variants, virtual environments, or pytest caches. | Added ignore rules for `.env.*` (while keeping `.env.example` and `.env.template` trackable), nested `.venv`, and `.pytest_cache`. `.env` remains untracked/ignored. |
| P3 Vite lint | `Navbar.jsx` destructured an unused `isChatOpen` prop. | Removed the unused destructuring; the configured ESLint check now passes. |

## Services, data, and providers

- Fresh local services were started on 3000 and 3001 (Express) and 8000 (Flask); all three `/health` endpoints returned `healthy` after restart.
- The live Express-to-Flask plan returned HTTP 200 and `feasible`, one stop, six completed node events, two live Mapbox directional calls, and a 12:15 estimated return before the 19:00 deadline.
- A separate live Mapbox adapter probe returned a route geometry and positive distance/duration. Mapbox uses longitude/latitude request order and returns meters/seconds, converted to km/minutes.
- The configured Gemini integration did not pass. The live pytest integration used deterministic fallback after its 15-second timeout; a bounded SDK probe likewise ended after 15 seconds without an HTTP status. The provider response, model availability, account quota, and key validity remain unknown.
- `config/db.js` and Python `agents/research.py` read JSON; no MongoDB driver/adapter or persistence path exists. The configured `MONGODB_URI` does not make the app use MongoDB.
- Express data contains 12 curated rows. Flask adds 179 Apify Google Maps listings. Imported data remains unverified; its 30-minute dwell time is a planning default. Curated records currently have no source URL/reference or price. A requested budget therefore cannot be proven against current place data.

## Remaining operational constraints

- Manager validates date format only; it does not validate future dates or a timezone. Start/deadline are same-day `HH:MM` values; overnight trips are not supported.
- Date-specific calendars are absent. Only normalized `{open, close}` hours are enforced; imported weekly-hour arrays are evidence, not a hard constraint.
- Mapbox maps auto/e-rickshaw/cab to standard driving; it is not calibrated to vehicle-specific speed. Mapbox does not provide the planner's public-transit mode.
- Six attraction candidates plus start/end can require up to 56 directed Mapbox calls. They now run in a bounded pool of 8 by default (configurable from 1 to 16), with a 45-second Express bridge timeout and a 50-second browser timeout. Provider rate limiting and worst-case latency for large candidate sets remain unverified.
- Health endpoints report process health, not data/provider readiness.

## Final checks

- PASS: `node --test tests/acceptanceTests.test.js` — 14 passed, 0 failed.
- PASS: `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` — 53 passed, 1 deselected; 13 LangSmith deprecation warnings.
- FAIL: `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m integration` — Gemini fallback assertion failed; one test, 40 deselected.
- BLOCKED on last invocation: `npm test` — Windows reported `ENOSPC`, C: had 0 GiB free. The same Node test file passed when run directly with `node --test`.
- PASS: direct Vite production build (2,031 modules) and ESLint; Vite warned about a 511.99 kB minified JavaScript chunk.
- PASS: `git diff --check`, health checks, and actual Express-to-Flask live plan are recorded in [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md).
