# Tourism API

This file is the short API entry point. The complete request and response details are in [docs/API_REFERENCE.md](docs/API_REFERENCE.md); the route and agent flow is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Active planner

- `POST /api/v1/tourism-plan` and legacy alias `POST /tourism-plan`: Express accepts the planner request and forwards it to Flask `POST /plan`.
- `GET /health`: Express process health only; it does not check Flask, data loading, or external providers.
- Flask endpoints: `GET /health`, `GET /attractions`, and `POST /plan`.

Planner statuses: `needs_input`, `provider_error`, `infeasible`, and `feasible`. A missing routing provider fails closed unless `DEMO_MODE=true`; demo estimates are labeled synthetic. The planner's six LangGraph roles do not call an LLM.

## Existing Express endpoints

- `POST /api/v1/intent/parse`: separate intent parser; returns a deterministic fallback when Gemini is unavailable.
- `POST /api/v1/feasibility/search`: separate legacy feasibility path.
- `GET /api/v1/pois`: 12 records from the Express curated JSON file.
- `GET /api/v1/attractions/:id`: one curated record or HTTP 404.
- `GET /`, `POST /search`, `GET /itinerary`, and `GET /attractions/:id`: web pages.

## Data and persistence

The Express and Flask components read local JSON files. `MONGODB_URI` is not used by an installed MongoDB adapter. `/itinerary` reads the current browser tab's `sessionStorage`; there is no account or server-side itinerary persistence.
