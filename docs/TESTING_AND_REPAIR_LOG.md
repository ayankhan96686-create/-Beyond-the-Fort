# Testing and Repair Log

> The sections below preserve the earlier 2026-10-30 backend/chatbot checkpoint. The current auth/security checkpoint and exact latest run are at the end of this file and in [FINAL_SECURITY_AND_AUTH_REPORT.md](../FINAL_SECURITY_AND_AUTH_REPORT.md).

Audit date: 2026-10-30. No dependency upgrades were performed.

## Baseline before repairs

| Command | Result |
| --- | --- |
| `npm test` | PASS: 9 passed, 0 failed. |
| `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` | PASS: 33 passed, 1 deselected; 13 LangSmith deprecation warnings. |

The initial working tree already had 17 tracked modified files and 70 untracked paths. Existing edits were preserved.

## Repairs and regression coverage

1. **Non-finite input:** `manager_node` now rejects `NaN`, infinities, and overflowing integer conversions for budgets/duration. Tests cover `NaN`, infinities, a huge integer, and invalid HH:MM/date syntax.
2. **Invalid route numbers:** Mapbox/custom estimates must be finite before conversion. Tests cover `NaN`/infinite provider values, provider timeout, missing coordinates, and missing provider.
3. **Provenance:** A URL, reference, or `VERIFIED_AUDITOR` label alone cannot verify a place fact. Tests cover all three evidence shapes. Live route evidence remains provider-backed.
4. **Safe errors:** Express malformed JSON/internal errors, Flask dataset exceptions, and Express-to-Flask transport errors no longer return raw exception messages. Regression tests assert private-looking details do not appear in bodies/logs.
5. **Itinerary checks:** Added known-price budget acceptance/rejection and chronological stop assertions.
6. **Vite lint:** Removed an unused `isChatOpen` destructured prop from the standalone React prototype.
7. **Secret/cache handling:** `.gitignore` now covers dotenv variants except examples, nested Python venvs, and pytest caches.
8. **Legacy API errors:** Intent and feasibility controllers return generic errors and log only safe error types.
9. **Request compatibility:** The Express bridge now preserves the UI's companion selection, which Manager validates and Response returns in `trip_summary`.

## Final local checks

| Command/check | Result |
| --- | --- |
| `node --test tests/acceptanceTests.test.js` | PASS: 14 passed, 0 failed, including chat input validation, session isolation, planner dispatch, and safe Gemini/planner failure responses. |
| `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` | PASS: 53 passed, 1 deselected; 13 upstream LangSmith deprecation warnings. |
| `node --check public\js\main.js; node --check public\js\itinerary.js` | PASS: both changed browser scripts parse. |
| `node .\new_style\node_modules\eslint\bin\eslint.js .\new_style` | PASS after fixing one unused prop. The first run failed on that single rule. |
| Direct Vite CLI build to a fresh isolated D: folder | PASS: 2,031 modules transformed. Vite warned that the minified JS chunk is 511.99 kB (160.09 kB gzip). The generated audit folder was verified and removed. |
| `git diff --check` | PASS after removing trailing spaces and extra EOF blank lines in the flagged working files; Git emitted only line-ending normalization warnings. |

`npm test` passed 10/10 in an earlier post-repair run. A later wrapper invocation failed before tests started with `ENOSPC`; C: had 0 GiB free. Direct `node --test` passed 11/11 at the location-routing checkpoint and 14/14 after chatbot cases were added. `npm --prefix new_style run build` also hit `ENOSPC`; the direct Vite CLI build above passed.

## Live integration and runtime checks

- Express `/health` at ports 3000 and 3001 and Flask `/health` at port 8000 returned `healthy` after the source changes were loaded by restarting only the verified app listeners.
- Live Mapbox adapter probe returned a route with geometry, positive distance, and positive duration.
- Live request through `POST http://127.0.0.1:3001/api/v1/tourism-plan` returned HTTP 200 / `feasible`, preserved `companion=group`, had one stop, six ordered node trace events, two Mapbox calls, provider `mapbox_driving`, and estimated return 12:15 before the 19:00 deadline.
- A separate valid-shape request with a 10:00 start returned `infeasible`; the later 11:00 request fit known hours. Both results preserved deterministic feasibility rules.
- `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m integration` — FAIL: one Gemini live-provider assertion failed because the result used deterministic fallback; 40 tests were deselected. The call used the 15-second timeout and did not produce an HTTP status. The key's validity/model/quota cannot be inferred from its configured status.
- Environment presence checks: Mapbox URL/token and Gemini key are configured; `DEMO_MODE`, `LANGGRAPH_API_URL`, and `LANGGRAPH_PORT` are missing so code defaults apply; Distance Matrix is placeholder; Mongo URI is configured but unused. No values were printed.

## Not tested / blocked

- **BLOCKED:** npm-based final wrapper/build commands on C: because free space was 0 GiB. Direct Node tests and Vite build passed from the existing D: installation.
- **NOT TESTED:** MongoDB connection; there is no app adapter. No data was read from or written to a database.
- **NOT TESTED:** Live Google Distance Matrix integration; its configured entry is a placeholder and this path is separate from the planner.
- **NOT TESTED:** Browser automation of form interactions during this audit; the live REST path was exercised directly through Express.
- **NOT TESTED:** Root lint/build scripts; `package.json` defines only `start`, `dev`, and `test`. The separate `new_style` Vite project has its own lint/build commands.

## Safe cleanup

No ambiguous project files were moved. `new_style/`, the n8n JSON, and user-generated `output/` content were left in place because their ownership/use is unclear or they are user artifacts. Only the fresh generated Vite audit output outside the repository was removed after verifying its exact path.

## Location and destination routing update

- Added location contract validation, independent start/end support and exact return-to-start behavior in the Manager node; Express forwards these fields to Flask.
- Route node now requests directed legs among start, candidates and destination. The optimizer includes the final destination leg before marking a route feasible and returns selected `route_legs`, distance/travel/visit totals and estimated destination arrival. Direct-route-only requests are supported by the backend contract.
- Added regression fixtures for coordinate bounds, endpoint normalization, full directed routes, final-leg deadline rejection, feasible full journey and bridge field forwarding. These are mocked/synthetic tests, not new live Mapbox calls.
- Added planner controls for explicit one-time GPS permission, map pins and coordinate entry; itinerary map now draws only returned provider geometry. No browser GPS automation was run. No geocoder exists, so address search remains BLOCKED and typed labels are not resolved.
- `21st search` could not run because the `21st` CLI is unavailable in this environment. The frontend reuses the project's installed Leaflet and existing visual styles.
- Express is running on port 3001 and Flask on port 8000 after these changes. `/chat` returned 200 with the composer present; both `/health` endpoints returned `healthy`.

## Tansen AI chatbot update

- Added responsive `/chat` EJS page with suggested Gwalior questions, loading/error messages, route-planning fields, explicit user-click geolocation, and itinerary/map/detail links for returned records.
- `POST /api/chat` uses server-side Gemini with curated record context for questions and the existing LangGraph bridge for trip, itinerary, and route requests. Provider failures return 503 without a fabricated result.
- Chat history is isolated by an HttpOnly session cookie and conversation ID, held in process memory, limited to 20 turns, expired after 12 hours, and bounded to 10,000 active sessions. Restarting Express clears it.
- Node acceptance tests pass 14/14 with mocked Gemini and planner failures/isolation; the Python workflow suite passes 53 tests with 1 integration test deselected.
- Responsive CSS is implemented, but browser viewport/mobile keyboard and browser geolocation permission automation remain unverified. A grounded Gemini service call succeeded in 38.3 seconds, but actual chat-page requests later exceeded both 45- and 60-second limits; generation remains intermittent. No public deployment was performed.
- A key-authenticated GET to Gemini's model list returned HTTP 200 and included `gemini-flash-latest`. Direct REST and SDK generation calls timed out at 15 seconds; one SDK call completed in 38.3 seconds with a 45-second timeout. This points to slow/intermittent generation, not a missing key or model name.

## Authentication and security checkpoint — 2026-10-30

- `npm test` with `NODE_ENV=test`: PASS, 24 tests, 0 failures. Includes auth/session/CSRF, role checks, owner-scoped itinerary CRUD/IDOR, and existing Express/chat/i18n coverage.
- `.venv\Scripts\python.exe -m pytest -q -m "not integration"` from `multiagent-engine`: PASS, 54 passed, 1 integration test deselected; 13 upstream deprecation warnings.
- `npm audit --omit=dev` after `npm audit fix`: PASS, zero vulnerabilities reported.
- `node --check` for server/auth/store/browser scripts and Python compile check for `multiagent-engine/server.py`: PASS at the syntax checkpoint.
- Production browser flow, live Flask service-token enforcement, prompt-injection red-team, production file ACLs, and restore were not run.
