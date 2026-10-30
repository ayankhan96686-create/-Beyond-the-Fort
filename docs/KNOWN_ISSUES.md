# Known Issues

Evidence-backed issues remaining after the audit. `Status` uses PASS, FAIL, BLOCKED, or NOT TESTED; “open” describes whether product work remains.

| Severity / status | Issue and reproduction | Impact | Workaround / next action |
| --- | --- | --- | --- |
| P2 / INTERMITTENT | Gemini generation is slow: authenticated model-list check returned 200 and `gemini-flash-latest` is listed; one grounded answer took 38.3 seconds, but chat-page requests later exceeded both 45- and 60-second limits. | Chat can still time out; the legacy intent path may fall back deterministically. The error now reports the 60-second limit. | Check Google API latency/quota and try a supported lower-latency model or thinking setting. The Gemini key was pasted in chat; rotate it before continued use. |
| P2 / PASS | Place provenance: supply a source URL/reference with `verification_status=VERIFIED_AUDITOR` and call `verification_node`. | The original rule could falsely mark a place claim verified without checking the URL. | Code now keeps the claim stakeholder-provided; implement auditable source review before promoting place facts. Imported source claims remain unverified. |
| P2 / NOT TESTED | Provider load/latency with maximum candidates and rate limiting. The full start/stop/end graph can request up to 56 directional routes concurrently in a bounded pool (default 8, max 16); each call can wait up to 5 seconds and the proxy timeout is 45 seconds. | Large plans may hit provider rate limits or exceed the bridge timeout. Only fixtures and a small live Mapbox request have been checked. | Verify provider limits, tune `ROUTING_PROVIDER_MAX_WORKERS` and timeout/candidate policy using the account's terms. |
| P2 / PASS | Submit a request with `budget` while local POIs have no cost. | No POI cost is known, so the itinerary refuses to claim budget feasibility. | Add source-backed price estimates. Do not treat unknown prices as zero. |
| P2 / PASS | Request overnight/future-date behavior. Manager checks `YYYY-MM-DD` syntax only; start/deadline are same-day `HH:MM`. | No timezone, future-date validation, overnight scheduling, or date-specific opening calendar. | Use same-day requests and confirm schedules manually; add calendar/timezone rules before supporting overnight visits. |
| P2 / PASS | Select `auto`, `e_rickshaw`, or `cab` with Mapbox. | The adapter uses the standard driving profile; timing is not calibrated to the selected vehicle. Public transit and mixed-mode routing are not provided by Mapbox Directions. | Treat estimate as a driving approximation and heed the returned warning; add a transit-capable provider for those modes. |
| P2 / NOT TESTED | MongoDB connection or persistence. | The app has no MongoDB driver/adapter; configured `MONGODB_URI` is ignored for app data. | Continue using local JSON or implement and test an adapter before claiming database persistence. |
| P3 / BLOCKED | `npm test` and npm-based Vite build on this machine. C: had 0 GiB free and npm returned `ENOSPC`. | npm could not create its cache/log output. | Free local C: space, then rerun. `node --test` passed and direct Vite CLI build passed from D:. No project data was removed to free space. |
| P3 / PASS | `node .\new_style\node_modules\vite\bin\vite.js build .\new_style --outDir <fresh-folder>` | Build succeeds but reports a 511.99 kB minified JS chunk (160.09 kB gzip). The Vite app is a separate prototype, not the active Express UI. | Consider route/component lazy loading if this prototype becomes the deployed UI. |
| P3 / PASS | Read `/health` while Flask, data, or routing provider is unavailable. | Current health routes report process health only, not readiness. | Check all three services and run an actual planner request when confirming readiness. |
| P3 / NOT TESTED | `n8n/tourism_plan_workflow.json` is not imported/referenced by the active app; its ownership/use is unclear. | A stale workflow file may confuse maintainers. | Keep it in place pending owner confirmation. The active path is Express → Flask/LangGraph. |
| P3 / PASS | Python test suite output. | 13 LangSmith deprecation warnings from the installed dependency stack; no test failure. | Track upstream package compatibility separately; no dependency upgrade was made in this audit. |

The active Express, Flask, LangGraph, Mapbox route, local test, and Vite build checks are documented in [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md).

## Security/auth update — 2026-10-30

| Severity / status | Issue | Impact / action |
| --- | --- | --- |
| P1 / BLOCKED | A prior project audit says a Gemini key may have been pasted into a chat; rotation is unverified. | Rotate the credential in the provider console and replace the local secret. No key value is reproduced here. |
| P2 / NOT TESTED | Production file ACLs, shared-session behavior, and restore procedure. | Current account/itinerary stores support one process only; inspect deployment permissions and test restore before production. |
| P2 / NOT IMPLEMENTED | Password reset, email verification, MFA, and account deletion. | No mail service or second-factor provider is configured. |
| P2 / PARTIAL | New-style Vite prototype contains simulated client-side auth handlers. | It is not the active Express/EJS frontend or an authorization boundary; do not deploy those handlers as real authentication. |
| P2 / PARTIAL | Authentication strings fall back to English in non-English locales. | Existing localization loader is connected, but auth translations have not been populated for all 21 catalogs. |
| P2 / NOT TESTED | Adversarial prompt-injection testing and independent penetration review. | Prompt injection remains a model risk; no elimination claim is made. |
| P2 / FIXED | Initial `npm audit` reported vulnerable `body-parser` and `qs` transitive versions. | `npm audit fix` updated compatible lockfile versions; final audit reported zero vulnerabilities. |

The newest run of `npm test` and Python workflow tests is recorded in [FINAL_SECURITY_AND_AUTH_REPORT.md](../FINAL_SECURITY_AND_AUTH_REPORT.md). Historical rows above retain their original audit context.
