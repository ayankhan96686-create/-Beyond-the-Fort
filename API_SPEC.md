# Beyond the Fort — Tourism API Specification

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Complete Reference:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full endpoint catalog and payload schemas.  
**Security Reference:** See [SECURITY.md](SECURITY.md), [AUTHENTICATION.md](AUTHENTICATION.md), and [AUTHORIZATION.md](AUTHORIZATION.md).  

---

## 1. Active Endpoints Overview

### Health & Observability Probes
- `GET /health`: Fast process liveness probe.
- `GET /ready`: Deep readiness probe checking MongoDB Atlas database connectivity, AI provider status, and LangGraph planner readiness.
- Flask `GET /health`: Multi-agent service health reporting the status of all 6 agents.

### Tourism Planning Subsystem
- `POST /api/v1/tourism-plan` (and alias `POST /tourism-plan`): Express authenticated endpoint forwarding validated trip constraints to Flask LangGraph `POST /plan`. Protected by session authentication and CSRF tokens.
- Flask `POST /plan`: Executes the compiled 6-agent LangGraph state graph. Enforces HMAC Bearer token validation (`LANGGRAPH_SERVICE_TOKEN`) in production environments.
- Returns status: `feasible`, `infeasible`, `needs_input`, or `provider_error`.
- Enforces mandatory mathematical inequality with a **25% Safety Buffer**:
  $$\sum D_i + \sum T_{\text{travel}} + \text{Buffer} \le T_{\text{avail}}$$

### Tansen AI Chatbot Subsystem
- `POST /api/chat`: Grounded cultural tourism Q&A powered by Google Gemini 3.5 Flash (`gemini-3.5-flash`). Features multi-model cascading (`gemini-3.5-flash` -> `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-flash-lite-latest`) and an authoritative Curated Knowledge-Base Fallback (100% uptime with zero hallucination).
- `POST /api/chat/reset`: Resets active conversation turn history.

### Curated Tourism Data Endpoints
- `GET /api/v1/pois`: Returns 12 audited Gwalior heritage POIs.
- `GET /api/v1/attractions/:id`: Returns detailed metadata for a single attraction by stable ID.
- `POST /api/v1/intent/parse`: Extracts structured JSON intent from natural language query strings.
- `POST /api/v1/feasibility/search`: Spatial candidate retrieval and deterministic feasibility evaluation.

### Authentication & Account Management
- `GET /api/auth/csrf`: Retrieves session CSRF token.
- `POST /api/auth/register`: User registration with scrypt password hashing.
- `POST /api/auth/login`: User authentication with 5-failure account lockout.
- `POST /api/auth/logout`: Invalidation of current session.
- `GET /api/auth/me`: Summary of authenticated user.
- `PATCH /api/auth/profile`: Update account details.

### Saved Itinerary Management (BOLA / IDOR Protected)
- `GET /api/itineraries`: Retrieves user-owned saved itineraries.
- `GET /api/itineraries/:id`: Single plan retrieval with strict owner authorization.
- `POST /api/itineraries`: Saves verified itinerary plan.
- `PUT /api/itineraries/:id`: Updates existing itinerary.
- `DELETE /api/itineraries/:id`: Deletes existing itinerary.

### Administrative Oversight
- `GET /api/admin/users`: Administrator user list with redacted credentials.
- `PATCH /api/admin/users/:id/role`: Role escalation/demotion (`user` or `administrator`).

---

## 2. Data & Persistence Strategy

- **Primary Cloud Store:** MongoDB Atlas cluster (`v8.0.34`) connected via official `mongodb@7.7.0` driver in `config/db.js`.
- **Zero-Downtime Cache:** Automatic in-memory fallback to `data/gwalior_curated_pois.json` ensuring seamless operation if network drops.
- **Account & Itinerary Store:** Persistent JSON storage with strict file permissions (`AUTH_USERS_FILE`, `SAVED_ITINERARIES_FILE`).
