# Tansen AI Chatbot API

Updated: 2026-10-30

## `POST /api/chat`

Same-origin Express endpoint. JSON request:

```json
{
  "message": "Plan a four-hour heritage visit",
  "conversationId": "browser-generated-id",
  "trip": {
    "city": "Gwalior",
    "date": "2026-10-30",
    "start_time": "09:00",
    "deadline": "17:00",
    "available_minutes": 240,
    "start_location": { "label": "Gwalior Fort", "latitude": 26.23, "longitude": 78.17, "source": "manual_coordinates" },
    "return_to_start": true,
    "interests": ["heritage", "music"]
  }
}
```

`message` is required, trimmed, and limited to 2,000 characters. The JSON body parser is limited to 16 KiB. `conversationId` must match `^[\\w-]{1,80}$`. The server issues an `HttpOnly; SameSite=Lax` session cookie; the ID alone does not grant access to another browser's conversation. `trip` is used only when routing a planning request. Coordinates are validated by the existing Manager agent. Omitting a required start/end location produces `needs_input`; the server does not infer a route origin.

Question response:

```json
{ "status": "success", "conversationId": "browser-generated-id", "reply": "...", "suggestions": ["..."] }
```

Planning response includes `reply`, `status`, and `result` when the planner returns a meaningful result (`feasible`, `infeasible`, or `needs_input`). `result` retains the planner's stops, selected route legs, evidence, warnings, errors, deadline, and totals. A feasible result can include `actions.itinerary` and `actions.map` paths. A provider failure returns HTTP 503 with `status: "provider_error"` and no successful result. Invalid or missing input returns HTTP 400; overlong chat text returns HTTP 413.

## `POST /api/chat/reset`

JSON body `{ "conversationId": "browser-generated-id" }`. Deletes that conversation from the current session and returns `{ "status": "success" }`. A new conversation also receives a fresh browser-generated ID.

## CORS

The deployed EJS frontend is same-origin and does not require CORS. If a separately hosted development/client frontend is used, set `FRONTEND_ORIGINS` to a comma-separated allowlist of complete origins (scheme, host, optional port). The default allows only localhost Vite origins on port 5173. The session cookie uses `Secure` when `NODE_ENV=production`; production should use HTTPS and same-site frontend/API deployment. No wildcard CORS is enabled.
