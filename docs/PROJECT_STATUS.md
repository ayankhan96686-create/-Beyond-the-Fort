# Project Status

> Historical feature and runtime rows below describe the prior 2026-10-30 application audit. The security/auth implementation was added later the same day; consult [FINAL_SECURITY_AND_AUTH_REPORT.md](../FINAL_SECURITY_AND_AUTH_REPORT.md) for current tests and limits.

Audit date: 2026-10-30. Repository: `Time-Aware-Digital-Discoverability-Beyond-the-Fort`, branch `main`, baseline revision `55eb4ce`.

## Current status

| Area | Status | Evidence / limitation |
| --- | --- | --- |
| Express app | PASS | The active app is running on port 3001; its `/health` endpoint returned `healthy`. Port 3000 was not listening during this chatbot update. |
| Flask/LangGraph app | PASS | Freshly restarted on port 8000; `/health` returned `healthy`. |
| Six-node plan flow | PASS | Live `POST /api/v1/tourism-plan` through Express → Flask returned `feasible`, one stop, six completed node trace entries, and a 12:15 estimated return before the 19:00 deadline. |
| Live route provider | PASS | The live request made two Mapbox Directions calls (`mapbox_driving`) for outbound and return legs. |
| Deterministic suites | PASS | Node: 14/14 via `node --test`; Python: 53 passed, 1 integration test deselected. |
| Gemini integration | INTERMITTENT / FAILING ON RETRY | A key-authenticated model-list call returned 200; `gemini-flash-latest` is available. One live generation succeeded in 38.3 seconds, but the actual chat page later exceeded the 60-second server limit. |
| Local data | PASS | Express reads 12 curated JSON records; Flask Research reads those plus 179 imported listings. Imported listings are unverified, with heuristic dwell times. |
| MongoDB | NOT TESTED | `MONGODB_URI` is present locally, but no MongoDB driver or app adapter is installed. The app reads JSON. |
| Vite prototype | PASS | Build and ESLint pass. Vite reports a 511.99 kB minified JS chunk (160.09 kB gzip). It is separate from the active Express EJS UI. |
| Start/end location selection | PASS | Active EJS planner now supports click-to-request one-time GPS, Leaflet start/end pins, manual coordinates, return-to-start, and separate destination. Browser GPS permission flow not automated. |
| Full start-stop-end planning | PASS | LangGraph routes directed endpoint/stop legs, exposes selected route legs and arrival totals, and deterministically checks the final destination leg against window/deadline. 53 Python tests pass with mocked route fixtures. |
| Tansen AI chatbot | IMPLEMENTED; Gemini response is intermittent | `/chat` and `/api/chat` reuse Express/EJS, Gemini service, planner bridge, and LangGraph. Mocked API/error/isolation checks pass; one direct live answer worked but actual page requests later timed out at 45 and 60 seconds. |
| Address geocoding | BLOCKED | No geocoding adapter or provider configuration exists. Place labels without coordinates remain unresolved; users can select a map point or enter coordinates. |
| `npm test` wrapper | BLOCKED | The last wrapper invocation failed with `ENOSPC`; C: had 0 GiB free. Running the same Node test file directly passed. |

## Implemented

- Express pages and REST endpoints, Flask planning API, compiled LangGraph graph with six deterministic roles, local JSON data, Mapbox Directions adapter, demo-only synthetic routing, structured per-node traces, and a separate Gemini intent parser with deterministic fallback.
- Non-finite budget and route-estimate validation; fail-closed place provenance; safer Express/Flask error responses; preserved companion selection; local secret/cache ignore rules.
- One-time browser geolocation, map pin and manual coordinate selection; distinct start/end contract; full directed route chain; end-of-trip deadline validation; no fabricated straight map lines when route geometry is missing.

## Partial or missing

- Gemini live integration is unavailable in this environment. The six planning nodes do not use Gemini.
- Place sources are not checked by an automated source-review process; no current POI fact is promoted to `VERIFIED` by a URL or status label alone.
- Price data, date-specific hours, timezone/overnight scheduling, and Mongo persistence are absent.
- The current `/health` endpoints are process checks, not full readiness checks for data or provider connectivity.
- Address-to-coordinate search is not configured. Browser GPS permission and geolocation error UX still need manual browser verification.

## Changes and working tree

The pre-audit tree already had 17 tracked modified files and 70 untracked paths. Those user changes were preserved. No commit, push, or pull request was created. No ambiguous project files were archived. The `.env` file remains ignored; its contents were never printed, copied, or saved in project documentation.

See [BACKEND_AUDIT.md](BACKEND_AUDIT.md), [AGENT_EXECUTION_REPORT.md](AGENT_EXECUTION_REPORT.md), [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md), and [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for evidence and next steps.
