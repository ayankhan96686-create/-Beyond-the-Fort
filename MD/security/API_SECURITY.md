# API Security Specification

**Project:** Beyond the Fort — The City of Music & Living Heritage, Gwalior  
**Stack:** Node.js / Express REST API & Python Flask / LangGraph Backend  
**Status:** Implemented & Verified  

---

## 1. API Architecture Overview

The Beyond the Fort backend exposes a hardened REST API architecture partitioned between public tourism discovery and authenticated visitor planning services.

```mermaid
flowchart TD
    Client["Browser / Client"] -->|HTTPS + HttpOnly Cookie| Express["Node.js / Express Server (:3000)"]
    Express -->|Rate Limiting + CSP + CORS| MW["Security Middleware"]
    MW -->|Auth & CSRF Guards| Routes["REST Routes / Controllers"]
    Routes -->|Atomic File Ops (0o600)| Storage["Private JSON Storage (.auth-users, .saved-itineraries)"]
    Routes -->|Bearer Token Auth| LangGraph["Flask / LangGraph Planner (:8000)"]
    Routes -->|Server-Side API Call| Gemini["Google Gemini API"]
    LangGraph -->|Directions Query| Mapbox["Mapbox Directions API"]
```

---

## 2. Endpoint Security Matrix

| Endpoint | Method | Role Required | Rate Limit | Payload Limit | Protections Active |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/csrf` | `GET` | Public | Standard | None | Issues session-bound CSRF token |
| `/api/auth/register` | `POST` | Public | 10 / 15m | 16 KiB | CSRF, scrypt hash, email/password validation |
| `/api/auth/login` | `POST` | Public | 10 / 15m | 16 KiB | CSRF, timing-safe auth, 5-strike brute-force lockout |
| `/api/auth/logout` | `POST` | Authenticated | Standard | 16 KiB | CSRF, session deletion, cookie clearing |
| `/api/auth/me` | `GET` | Public/Auth | Standard | None | Returns sanitized user object (`id`, `email`, `role`) |
| `/api/auth/profile` | `PATCH` | User | 60 / min | 16 KiB | CSRF, mass-assignment blocked (`role`/`status` rejected) |
| `/api/itineraries` | `GET` | User | Standard | None | Owner-scoped (`userId === req.auth.user.id`) |
| `/api/itineraries` | `POST` | User | 60 / min | 256 KiB | CSRF, 100-plan per-user ceiling, owner binding |
| `/api/itineraries/:id` | `GET` | User | 60 / min | None | IDOR protection: strictly matches `{ id, userId }` (404 on mismatch) |
| `/api/itineraries/:id` | `PUT` | User | 60 / min | 256 KiB | CSRF, IDOR check (returns 404 without existence disclosure) |
| `/api/itineraries/:id` | `DELETE`| User | Standard | None | CSRF, IDOR check (returns 404 without existence disclosure) |
| `/api/admin/users` | `GET` | Administrator | 60 / min | None | `auth.requireAdmin`, returns user registry |
| `/api/admin/users/:id/role`| `PATCH`| Administrator | 60 / min | 16 KiB | CSRF, role validation (`user`/`administrator`), self-demotion blocked |
| `/tourism-plan` | `POST` | User | 10 / min | 16 KiB | `auth.requireUser`, `aiLimiter`, LangGraph bridge |
| `/api/v1/tourism-plan` | `POST` | User | 10 / min | 16 KiB | `auth.requireUser`, `aiLimiter`, LangGraph bridge |
| `/api/v1/feasibility/search` | `POST` | User | 60 / min | 16 KiB | `auth.requireUser`, `schemaValidator`, deterministic pruning |
| `/api/v1/intent/parse` | `POST` | Public | 10 / min | 16 KiB | Length bounds (query $\le$ 1000, 30 $\le$ minutes $\le$ 600) |
| `/api/chat` | `POST` | Public / User | 10 / min | 16 KiB | Max 2000 chars, plan intent requires authentication |
| `/api/chat/reset` | `POST` | Public / User | 10 / min | 16 KiB | Scoped by conversation ID and session cookie |
| `/api/v1/pois` | `GET` | Public | 60 / min | None | Serves curated Gwalior POIs |
| `/api/v1/attractions/:id` | `GET` | Public | 60 / min | None | Returns curated record or 404 |
| `/health` | `GET` | Public | None | None | Sanitized service telemetry; no secrets exposed |

---

## 3. Core Protection Mechanisms

### A. HTTP Security Headers
The server sets strict security headers on every response:
- `X-Powered-By`: Explicitly disabled (`app.disable('x-powered-by')`).
- `X-Content-Type-Options: nosniff`: Prevents MIME-confusion attacks.
- `X-Frame-Options: DENY`: Prevents UI redressing and clickjacking.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer leakage.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`: Disables unused hardware APIs.
- `Cross-Origin-Opener-Policy: same-origin`: Isolates the browsing context.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Enforced in production.
- `Content-Security-Policy`:
  ```text
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https:;
  connect-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  form-action 'self'
  ```

### B. Cross-Origin Resource Sharing (CORS)
- Controlled via `FRONTEND_ORIGINS` environment variable.
- Defaults to local development origins (`http://localhost:5173,http://127.0.0.1:5173`).
- In production:
  - Wildcard origins (`*`) are strictly forbidden at startup.
  - All origins must be exact `https://` URLs.
  - Credentials (`Access-Control-Allow-Credentials: true`) are never combined with a wildcard.

### C. Cross-Site Request Forgery (CSRF)
- Double-submit session-bound cookie token (`beyond_fort_csrf`).
- Client must provide token in `X-CSRF-Token` HTTP header on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- Server validates that the header matches both the cookie and the active server-side session.

### D. Rate Limiting & Resource Exhaustion
- **Authentication Limiter:** 10 attempts per 15 minutes per IP on `/api/auth/register` and `/api/auth/login`.
- **API Limiter:** 60 requests per minute per IP on standard endpoints.
- **AI / Computation Limiter:** 10 requests per minute per IP on LLM and route-planning endpoints.
- **Payload Size Caps:** 16 KiB default request limit, 256 KiB for itinerary storage operations.

### E. IDOR & BOLA Prevention
- Itinerary operations (`GET`, `PUT`, `DELETE` on `/api/itineraries/:id`) query strictly by `{ id, userId }`.
- If an ID does not belong to the authenticated user, the API returns `404 Not Found` (identical to non-existent resource), preventing attackers from enumerating valid plan IDs.
- User profile editing (`PATCH /api/auth/profile`) rejects changes to `role` or `status`.

### F. Internal Service Authentication
- Node.js communicates with Flask/LangGraph over local REST (`POST /plan`).
- In production, a shared bearer token (`LANGGRAPH_SERVICE_TOKEN`, minimum 32 characters) is validated via timing-safe HMAC comparison (`hmac.compare_digest`).

---

## 4. Verification & Automated Tests

All API security controls are verified in automated test suites:
- `tests/security.test.js`: Validates authentication, CSRF, IDOR/BOLA, single plan access, account lockout, role boundaries, and headers.
- `tests/acceptanceTests.test.js`: Validates input validation, malformed JSON handling, and planner contract preservation.
- `multiagent-engine/tests/test_server_security.py`: Validates Flask production bearer token enforcement and request size capping.

