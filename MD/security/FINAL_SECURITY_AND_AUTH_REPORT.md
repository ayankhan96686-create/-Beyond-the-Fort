# Final Security and Authentication Report

Date: 2026-10-30. Project: Beyond the Fort — Gwalior Tourism AI Multi-Agent System.

## Overall result

Security controls and account features were added to the active Express/EJS and Flask/LangGraph stack. Local tests passed. This repository has not been deployed, independently penetration-tested, or verified for production readiness. The JSON account store is single-process, email recovery is unavailable, and an older project note says a Gemini key may have been pasted in chat; rotation is unverified and remains an operator action.

## Existing architecture and changes

Active request path remains EJS/vanilla browser → Express REST → Flask → six deterministic LangGraph workflow functions → JSON response. Gemini is a separate Express-side service for public tourism Q&A and legacy intent parsing. Tourism content remains local JSON; there is no MongoDB adapter, SQL database, n8n flow, or FastAPI service.

Implemented authentication: registration, login, logout, email profile update, scrypt hashing, random server-side session IDs, 12-hour session expiry, HttpOnly/SameSite cookies, Secure cookies in production, CSRF validation, and rate limiting. Password reset/email verification were not invented because no mail delivery service is configured.

Implemented roles: `guest`, `user`, `administrator`. Guest may read public tourism data and ask public questions. Registered users may generate plans and list/update/delete their own saved itineraries. Administrators may list accounts and change roles through a protected admin page and server-checked APIs. Profile role changes and foreign itinerary IDs are denied. The role matrix is in [AUTHORIZATION.md](AUTHORIZATION.md).

The active planner and legacy feasibility endpoint require registered sessions. Public chat planning intent is denied to guests. Production Flask `/plan` requires a shared service bearer token. Flask health and attraction reads remain public; keep the Flask service private. Express has explicit CORS, CSP and related headers, request-size limits, and in-memory rate limits. Account and itinerary files are separate from public content data and excluded from Git.

## Database, AI, and environment

No database engine is configured. Account/plan persistence is local JSON with best-effort restrictive file mode and owner checks; it lacks transactions, multi-process locking, encryption at rest, and shared sessions. Production startup requires explicit persistent paths. Do not horizontally scale this build.

LangGraph stages are deterministic; Gemini prompt injection cannot be eliminated. User text/retrieved content remains untrusted; system constraints, input limits, structured validation, and limited state exposure are mitigations. Exact route coordinates are persisted in a user's plan and sent to the route provider when a plan is requested.

`.env` and `multiagent-engine/.env` are ignored and absent from tracked Git history according to the checks run; their values were not printed. The targeted source scan found no high-confidence hardcoded key patterns. `npm audit` initially found two transitive advisories; compatible lockfile updates were applied and the final npm audit reported zero vulnerabilities. Python package audit was not run because `pip-audit` was not confirmed installed.

## Tests and checks actually executed

| Check | Status | Evidence |
| --- | --- | --- |
| `npm test` with `NODE_ENV=test` | **PASS** | 24 tests passed, 0 failed. Includes registration/password hash, unauthenticated planner denial, CSRF denial, user/admin boundaries, profile role protection, single-plan retrieval (`GET /api/itineraries/:id`), owner-scoped IDOR/BOLA rejection (404), 5-strike account lockout (429), security headers (`X-Powered-By: off`, `nosniff`, `DENY`, CSP), and intent input validation. |
| `.venv\Scripts\python.exe -m pytest -q -m "not integration"` in `multiagent-engine` | **PASS** | 57 passed, 1 integration test deselected. Includes new test verifying Manager Agent input bounds capping. 13 upstream deprecation warnings. |
| Node/Python syntax checks | **PASS** | `node --check` on server/auth/store/browser scripts and Python `py_compile` for Flask server. |
| `npm audit --omit=dev` after `npm audit fix` | **PASS** | 0 vulnerabilities reported. |
| Targeted hardcoded-secret pattern scan | **PASS (limited scan)** | No matches in scanned non-env, non-data source files. Not proof that no secret exists anywhere. |
| Git tracking/history check for `.env` files | **PASS (scope-limited)** | Neither env path is currently tracked; Git history path query returned no commits. |
| Flask production bearer authentication | **NOT TESTED** | No production runtime/configuration was launched. |
| CORS, CSRF, cookie Secure/HSTS, and responsive auth flow in real browser | **NOT TESTED** | Exercised in code/local API tests only; no browser automation. |
| Password reset/email verification, account deletion, MFA | **BLOCKED / NOT IMPLEMENTED** | No email service, account deletion route, or second factor exists. |
| Prompt injection resistance | **NOT TESTED as a red-team claim** | No dedicated adversarial model test was run; mitigation is documented, not a guarantee. |
| SQL/NoSQL injection | **NOT APPLICABLE to active adapter** | No SQL/NoSQL query engine exists. Reassess if one is added. |
| Backup/restore and production file ACLs | **NOT TESTED** | Procedure documented; no production files or restore drill. |
| Gemini credential rotation | **BLOCKED** | Older documentation reports possible chat exposure; provider rotation state cannot be verified here. |
| Mobile/desktop visual route QA, upload, and production deployment | **NOT TESTED / NOT APPLICABLE** | No live browser or deployment run; no upload route found. |

## Open findings

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md). Primary actions: verify/rotate the Gemini key, translate auth strings beyond English fallback, add shared durable session/database storage before multi-instance deployment, configure operational backups, and conduct an independent security review. Do not describe this build as production-ready until these deployment-specific checks are complete.

## Markdown files reviewed

Reviewed all 50 repository Markdown files returned by a hidden-file-inclusive inventory: root project docs, `.21st/DESIGN.md`, all `docs/*.md`, `archive/*.md`, `data/*.md`, `memory/*.md`, and `new_style/README.md`, plus the new guides below. Historical audit/test reports remain historical. Current auth, API and deployment facts are in the new root guides and updated API/architecture/configuration/chatbot documents. No existing Markdown file was archived or deleted.

New guides: `PROJECT_SECURITY_BASELINE.md`, `API_SECURITY.md`, `DOCUMENTATION_INDEX.md`, `SECURITY.md`, `AUTHENTICATION.md`, `AUTHORIZATION.md`, `API_DOCUMENTATION.md`, `SECURITY_AUDIT.md`, this report, `DATABASE_SECURITY.md`, `AI_AGENT_SECURITY.md`, `ENVIRONMENT_SETUP.md`, `DEPLOYMENT.md`, `BACKUP_AND_RECOVERY.md`, `PRIVACY_POLICY.md`, `USER_GUIDE.md`, `ADMIN_GUIDE.md`, `TESTING.md`, and `CHANGELOG.md`.

## Files created or modified

**New documentation guides:** the 19 files listed above.

**New implementation files:** `middleware/rateLimit.js`, `services/authService.js`, `services/itineraryStore.js`, `public/css/auth.css`, `public/js/auth.js`, `public/js/nav-auth.js`, `public/js/admin.js`, `public/js/results-map.js`, `views/auth.ejs`, `views/account.ejs`, `views/admin.ejs`, `views/unauthorized.ejs`, `tests/security.test.js`, and `multiagent-engine/tests/test_server_security.py`.

**Modified implementation/config/tests:** `.env.example`, `.gitignore`, `config/env.js`, `controllers/feasibilityController.js`, `controllers/intentController.js`, `multiagent-engine/.env.example`, `multiagent-engine/agents/manager.py`, `multiagent-engine/server.py`, `package.json`, `package-lock.json`, `server.js`, `services/chatService.js`, `services/tourismWorkflowService.js`, `public/js/chat.js`, `public/js/itinerary.js`, `public/js/main.js`, `public/locales/en.json`, `tests/acceptanceTests.test.js`, `views/index.ejs`, `views/itinerary.ejs`, `views/partials/navbar.ejs`, and `views/results.ejs`.

**Updated existing documentation:** `API_SPEC.md`, `ARCHITECTURE.md`, `README.md`, `docs/API_REFERENCE.md`, `docs/ARCHITECTURE.md`, `docs/BACKEND_AUDIT.md`, `docs/CHATBOT_API.md`, `docs/CHATBOT_ARCHITECTURE.md`, `docs/CHATBOT_TEST_REPORT.md`, `docs/CONFIGURATION_GUIDE.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/DOCUMENTATION_INDEX.md`, `docs/KNOWN_ISSUES.md`, `docs/LOCATION_AND_ROUTE_PLANNING.md`, `docs/PROJECT_STATUS.md`, `docs/TESTING_AND_REPAIR_LOG.md`, and `new_style/README.md`.
