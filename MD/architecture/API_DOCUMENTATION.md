# REST API Documentation & Specification

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Status:** Production Ready (Verified October 30, 2026)  

---

## 1. General API Conventions

All API routes are served by the Node.js Express server on port `3000` (or reverse proxy) unless designated as Flask (port `8000`).
- **CSRF Token:** All mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require the `X-CSRF-Token` header matching the `beyond_fort_csrf` cookie. Token is retrievable via `GET /api/auth/csrf`.
- **Request Size Limits:** Standard JSON body limit is `16 KiB`. Saved itinerary persistence (`POST /api/itineraries`, `PUT /api/itineraries/:id`) allows up to `256 KiB`.
- **Rate Limiting:**
  - Standard API Limiter: `60 requests / minute` per IP.
  - AI & Planning Limiter: `10 requests / minute` per IP.
  - Authentication Limiter: `10 requests / 15 minutes` per IP (with 5-failure account lockout).

---

## 2. API Endpoint Catalog

| Method & Path | Access Level | Rate Limit | Purpose & Description |
| :--- | :---: | :---: | :--- |
| **`GET /health`** | Public | None | Basic process liveness probe. |
| **`GET /ready`** | Public | None | Deep readiness check: verifies Atlas database connectivity, AI provider availability, and planner target. |
| **`GET /api/v1/pois`** | Public | 60/min | Retrieves list of 12 audited Gwalior heritage POIs. |
| **`GET /api/v1/attractions/:id`** | Public | 60/min | Retrieves full metadata and audit status for a specific POI by stable ID. |
| **`POST /api/v1/intent/parse`** | Public + CSRF | 10/min | Extracts structured JSON intent (category, time budget, language) via Gemini 3.5 Flash or deterministic heuristic fallback. |
| **`POST /api/chat`** | Public (User for Plan) + CSRF | 10/min | Conversational Q&A via Gemini 3.5 Flash (with multi-model cascade and local curated knowledge-base fallback) or LangGraph planning bridge. |
| **`POST /api/chat/reset`** | Public + CSRF | 10/min | Clears session conversation history. |
| **`POST /tourism-plan`** | User + CSRF | 10/min | Executes 6-agent LangGraph workflow via Node-to-Python bridge. |
| **`POST /api/v1/tourism-plan`** | User + CSRF | 10/min | Alias for `/tourism-plan`. |
| **`POST /api/v1/feasibility/search`** | User + CSRF | 60/min | Spatial candidate retrieval with deterministic mathematical inequality evaluation and 25% safety buffer. |
| **`GET /api/auth/csrf`** | Public | None | Returns the current session's CSRF token (`{ csrfToken: "..." }`). |
| **`POST /api/auth/register`** | Public + CSRF | 10/15 min | Registers new user account with scrypt password hashing; logs user in. |
| **`POST /api/auth/login`** | Public + CSRF | 10/15 min | Authenticates user; locks account for 15 minutes after 5 consecutive failures. |
| **`POST /api/auth/logout`** | Authenticated + CSRF | None | Clears active session and rotates session cookie. |
| **`GET /api/auth/me`** | Public / User | None | Returns active user summary (`id`, `email`, `role`) or null. |
| **`PATCH /api/auth/profile`** | User + CSRF | 10/min | Updates user profile email (rejects role tampering). |
| **`GET /api/itineraries`** | User | 60/min | Returns all saved itineraries owned by the authenticated user. |
| **`GET /api/itineraries/:id`** | User | 60/min | Retrieves single itinerary with BOLA/IDOR authorization check. |
| **`POST /api/itineraries`** | User + CSRF | 60/min | Saves an itinerary plan (maximum 100 plans per user). |
| **`PUT /api/itineraries/:id`** | User + CSRF | 60/min | Updates an existing itinerary owned by the authenticated user. |
| **`DELETE /api/itineraries/:id`** | User + CSRF | 60/min | Deletes an itinerary owned by the authenticated user. |
| **`GET /api/admin/users`** | Administrator | 60/min | Returns system user list with redacted passwords. |
| **`PATCH /api/admin/users/:id/role`** | Administrator + CSRF | 60/min | Updates user role (`user` or `administrator`). |
| **Flask `GET /health`** | Internal / Network | None | LangGraph multi-agent service health and active agent list. |
| **Flask `GET /attractions`** | Internal / Network | None | Loads filtered curated POIs from the Python service. |
| **Flask `POST /plan`** | Bearer Token (Production) | 16 KiB limit | Executes the compiled LangGraph state graph. |

---

## 3. Core Endpoint Payloads & Schemas

### `POST /api/chat`
#### Request Payload
```json
{
  "message": "What are the timings for Tansen Sangeet Kala Kendra?",
  "conversationId": "conv-user-12345",
  "locale": "en"
}
```
#### Response Payload (200 OK)
```json
{
  "status": "success",
  "conversationId": "conv-user-12345",
  "reply": "**Tansen Sangeet Kala Kendra & Gwalior Gharana Archives** is a living heritage academy of Indian classical Dhrupad music honoring Mian Tansen's lineage.\n\n* **Operating Hours:** 10:30 to 17:30\n* **Minimum Dwell Time:** 50 minutes\n* **Source Status:** VERIFIED_AUDITOR",
  "suggestions": [
    "What heritage places are in the dataset?",
    "Plan a visit to Gwalior Fort",
    "What are the entry fees?"
  ]
}
```

### `POST /tourism-plan`
#### Request Payload
```json
{
  "user_query": "Crafts and Chanderi weavers",
  "interests": ["crafts"],
  "city": "Gwalior",
  "date": "2026-10-30",
  "start_time": "10:00",
  "deadline": "17:00",
  "available_minutes": 180,
  "start_location": {
    "label": "Gwalior Fort Main Gate",
    "lat": 26.2298,
    "lng": 78.1733,
    "source": "map_pin"
  },
  "return_to_start": true,
  "transport_mode": "auto"
}
```
#### Response Payload (200 OK)
```json
{
  "status": "feasible",
  "request_id": "ae7a8bdab33b4567b015291c7ac2b1af",
  "itinerary_stops": [
    {
      "poi_id": "poi_gwl_008",
      "name": "Daulat Ganj Traditional Clay Pottery & Terracotta Guild",
      "arrival_time": "10:15",
      "departure_time": "10:45",
      "dwell_minutes": 30,
      "verification_status": "VERIFIED_AUDITOR"
    },
    {
      "poi_id": "poi_gwl_001",
      "name": "Chanderi Weavers Cluster - Kripalpur",
      "arrival_time": "10:53",
      "departure_time": "11:38",
      "dwell_minutes": 45,
      "verification_status": "VERIFIED_OWNER"
    }
  ],
  "estimated_return_time": "12:02",
  "total_travel_minutes": 48,
  "total_visit_minutes": 75,
  "safety_buffer_minutes": 35,
  "warnings": []
}
```

---

## 4. Error Code Reference

| Status Code | Code / Condition | Meaning & Remediation |
| :---: | :--- | :--- |
| **`400`** | `INVALID_PARAMETERS` / `SyntaxError` | Malformed JSON or input validation failure. Check field types and boundaries. |
| **`401`** | `AUTH_REQUIRED` / `INVALID_CREDENTIALS` | Unauthenticated access on protected endpoints. Log in to continue. |
| **`403`** | `CSRF_INVALID` / `FORBIDDEN` | Missing/mismatched CSRF token or unauthorized cross-account access (IDOR). |
| **`404`** | `NOT_FOUND` | Requested POI or itinerary ID does not exist. |
| **`413`** | `PAYLOAD_TOO_LARGE` | Request body exceeds configured limit (16 KiB standard, 256 KiB for itineraries). |
| **`429`** | `TOO_MANY_REQUESTS` | Rate limit or account lockout triggered. Retry after specified cooldown. |
| **`503`** | `PROVIDER_ERROR` | Upstream service outage. Fallback mechanisms automatically mitigate impact. |
