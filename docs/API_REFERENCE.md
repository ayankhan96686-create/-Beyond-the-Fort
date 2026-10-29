# API Reference

This reference reflects the current Express and Flask routes. The six-node plan response is produced by `multiagent-engine/agents/response_agent.py`.

## Planner API

### `POST /api/v1/tourism-plan` and `POST /tourism-plan` (Express)

Express maps `query`/`user_query`, `duration_hours`/`time_budget_hours`, `deadline`/`return_deadline`, `origin`/`return_location_coordinates`, and `transit_mode`/`transport_mode`, then forwards JSON to Flask `POST /plan`. It also forwards `start_location`, `end_location`, `return_to_start`, and `direct_route_only`. `available_minutes` can be supplied directly.

### `POST /plan` (Flask)

Required values: `city`, `date` (`YYYY-MM-DD` syntax), `start_time` (`HH:MM`), `available_minutes` (positive integer), `deadline` (`HH:MM`, later than start), a selected `start_location`, a destination (or `return_to_start: true`), a non-empty interest/query (unless `direct_route_only: true`), and a supported transport mode. `budget` is optional but must be finite and non-negative. Optional `companion` accepts `solo`, `couple`, `family`, or `group`; it is retained in the trip summary but does not change route selection. Legacy `return_location_coordinates` / `origin` requests remain accepted and default to return-to-start.

Location objects accept `label`, `latitude`, `longitude`, and `source` (`browser_geolocation`, `manual_geocoded`, `map_pin`, `manual_coordinates`, or the legacy server-config source). Coordinates must be finite and in range. Optional `place_id`, `accuracy_m`, and `captured_at` are retained when valid. The server does not trust client verification labels. No geocoding endpoint is implemented; place labels without coordinates remain unresolved.

Example request:

```json
{
  "query": "pakhawaj luthiers",
  "interests": ["pakhawaj"],
  "city": "Gwalior",
  "date": "2026-10-30",
  "start_time": "11:00",
  "available_minutes": 480,
  "deadline": "19:00",
  "start_location": { "label": "User-selected start", "latitude": 26.2, "longitude": 78.1, "source": "map_pin" },
  "end_location": { "label": "User-selected destination", "latitude": 26.21, "longitude": 78.12, "source": "manual_coordinates" },
  "return_to_start": false,
  "transport_mode": "auto"
}
```

Responses include resolved `start_location` / `end_location`, `return_to_start`, ordered `itinerary_stops`, selected-journey `route_legs`, totals for distance/travel/visit time, safety buffer, estimated destination arrival, plus evidence, warnings/errors, deadline, feasibility status and trace. The map draws only provider-returned road geometry; missing geometry leaves markers unconnected. Development Flask responses also include `request_id` and `execution_trace`; production omits `execution_trace`.

Statuses: `needs_input`, `provider_error`, `infeasible`, `feasible`. Flask uses HTTP 400 for a non-object/malformed JSON request and HTTP 503 for a routing-provider failure; other planner outcomes return HTTP 200. Express returns HTTP 400 when its planner query is empty, HTTP 503 for provider/unavailable errors, and otherwise forwards the planner result.

Example response shape:

```json
{
  "status": "feasible",
  "trip_summary": { "city": "Gwalior", "date": "2026-10-30" },
  "start_location": { "label": "User-selected start", "latitude": 26.2, "longitude": 78.1, "source": "map_pin" },
  "end_location": { "label": "User-selected destination", "latitude": 26.21, "longitude": 78.12, "source": "manual_coordinates" },
  "return_to_start": false,
  "itinerary_stops": [],
  "route_legs": [],
  "travel_estimates": [],
  "evidence": [],
  "rejected_options": [],
  "warnings": [],
  "errors": [],
  "missing_fields": [],
  "estimated_return_time": "12:15",
  "deadline": "19:00",
  "agent_trace": []
}
```

### Health and attraction endpoints

| Method/path | Component | Result |
| --- | --- | --- |
| `GET /health` | Express | Process status/timestamp/team/pilot/service; not a downstream readiness check. |
| `GET /health` | Flask | Process status and six role names; does not check dataset or provider readiness. |
| `GET /attractions` | Flask | `{count, data}` from the two local JSON datasets, excluding synthetic/placeholder rows. |
| `GET /api/v1/pois` | Express | `{status:"success", count, data}` from the 12-row curated JSON dataset. |
| `GET /api/v1/attractions/:id` | Express | `{status:"success", data}` or HTTP 404 `{status:"not_found", message}`. |
| `GET /` / `GET /itinerary` / `GET /attractions/:id` | Express | EJS pages. The itinerary reads the current tab's `sessionStorage`. |

## Other Express APIs

- `POST /api/v1/intent/parse`: accepts a string `query`, optional `fallback_minutes`; returns `{status:"success", input, parsed_intent}`. Gemini errors use a deterministic fallback.
- `POST /api/v1/feasibility/search`: the separate legacy feasibility endpoint; request fields are validated by `utils/schemaValidator.js`. It is not the six-node planner.
- `POST /search`: existing HTML results form.

## Errors and limitations

- Express malformed JSON is HTTP 400 with `{status:"error", message:"Invalid request body."}`. Generic Express internal errors return a safe HTTP 500 message. Legacy intent/feasibility controller failures also return generic HTTP 500 messages.
- If Flask is unreachable or the bridge times out, Express returns HTTP 503 and a generic service-unavailable error.
- Place source URLs are not fetched/validated. A URL or auditor label alone never constitutes proof of verification.
- Dates are syntax-checked only; there is no timezone, future-date, or overnight scheduling support. Current data has no prices; budget-constrained plans cannot be proven feasible without known costs.
