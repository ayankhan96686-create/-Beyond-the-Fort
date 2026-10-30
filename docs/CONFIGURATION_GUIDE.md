# Configuration Guide

## Safe setup

The Node config loads the root `.env` through `config/env.js`; Flask loads the same file in `multiagent-engine/server.py`. Keep real values in the ignored local `.env` or a deployment secret store. `.env.example` contains names/placeholders. `.gitignore` now ignores `.env.*` while explicitly allowing `.env.example` and `.env.template`.

Do not put provider keys in `public/`, `new_style/src/`, browser requests, screenshots, or Markdown. Rotate a key if it has been pasted into a chat or committed. No secret values are recorded in this guide.

## Variables and readers

| Variable | Reader | Purpose / default | Audit status |
| --- | --- | --- | --- |
| `PORT` | Node `config/env.js` | Express port; default `3000`. | Configured in `.env`; live processes were started on 3000 and 3001. |
| `HOST` | Express `server.js` and Flask `server.py` | Bind address; default `127.0.0.1`. Use `0.0.0.0` only where a deployment container requires it. | Optional. |
| `FRONTEND_ORIGINS` | Express `server.js` | Exact comma-separated origins for separately hosted frontend clients. EJS same-origin requests need no CORS. | Localhost Vite defaults apply only outside production. Production accepts HTTPS exact origins and rejects wildcard. |
| `LANGGRAPH_API_URL` | Node `config/env.js` / workflow proxy | Flask plan URL; default `http://127.0.0.1:8000/plan`. | Missing locally; default is used. |
| `LANGGRAPH_SERVICE_TOKEN` | Node proxy and Flask server | Shared private bearer token protecting production planner calls; minimum 32 characters. | Must be configured for production. |
| `AUTH_USERS_FILE` | Express auth | Account records, password hashes, roles. Use durable private writable storage. | Production requires an explicit path. |
| `SAVED_ITINERARIES_FILE` | Express itinerary store | Owner-scoped saved-plan records. Use durable private writable storage. | Production requires an explicit path. |
| `INITIAL_ADMIN_EMAIL` | Express auth | Optional first-admin bootstrap email; remove after registering the first matching account. | Optional; otherwise admin APIs remain inaccessible. |
| `TRUST_PROXY_HOPS` | Express | Exact number of trusted reverse proxies, integer 0–5; default 0. | Set only behind known proxy chain. |
| `LANGGRAPH_PORT` | Flask `server.py` | Flask port; default `8000`. | Missing locally; default is used. |
| `GEMINI_API_KEY` | Node `config/env.js`, `services/geminiService.js` | Server-side Gemini tourism answers and legacy intent parser. | Configured; prior live request timed out and fell back. |
| `GEMINI_MODEL` | Node `services/geminiService.js` | Model override; default `gemini-flash-latest`. | Missing from `.env`; default applies unless process environment overrides it. |
| `GEMINI_TIMEOUT_MS` | Node `services/geminiService.js` | Request timeout; default `60000` ms. | Missing from `.env`; the new default applies. |
| `ROUTING_PROVIDER_URL` | Python `agents/route_agent.py` | Mapbox Directions host or configured JSON POST route adapter. | Configured for `api.mapbox.com`; live route succeeded. |
| `ROUTING_PROVIDER_API_KEY` | Python `agents/route_agent.py` | Mapbox token or optional bearer token for a custom JSON provider. | Configured; value withheld. |
| `ROUTING_PROVIDER_TIMEOUT_SECONDS` | Python `agents/route_agent.py` | Per-request network timeout; default `5` seconds. | Missing from `.env`; default applies unless process environment overrides it. |
| `ROUTING_PROVIDER_MAX_WORKERS` | Python `agents/route_agent.py` | Concurrent directed route requests; default `8`, clamped to 1–16. | Optional; default applies. |
| Geocoding provider | None | No address lookup adapter, key, or URL setting is implemented. | NOT CONFIGURED; use map pins or manual coordinates. |
| `DEMO_MODE` | Python `agents/route_agent.py` | Enables explicitly synthetic routes only when set to `true`; default false. | Missing locally; false default applies. |
| `DISTANCE_MATRIX_API_KEY` | Node `config/env.js` and legacy `services/distanceMatrixService.js` | Separate legacy transit path; not the LangGraph/Mapbox key. | Placeholder locally; not a planner dependency. |
| `TRANSIT_API_TIMEOUT_MS` | Node `config/env.js` / legacy transit path | Legacy provider timeout; default `3000` ms. | Configured in `.env`; exact value withheld. |
| `SAFETY_BUFFER_RATIO` | Node `config/env.js` / legacy feasibility path | Legacy math setting; default `0.25`. The LangGraph itinerary node currently uses its own fixed `0.25`. | Configured in `.env`; exact value withheld. |
| `MONGODB_URI` | Node `config/env.js` / `config/db.js` | Reserved/configured string only; no Mongo driver or application adapter exists. | Configured but unused for persistence. |
| `NODE_ENV` | Express and Flask | `production` enables Secure cookies, HSTS, explicit CORS policy, Flask bearer auth, and hides Flask execution traces. | Set only in a properly configured deployment. |
| `LOG_LEVEL` | Python `server.py` | Python logging level; default `INFO`. | Missing from `.env`; default applies unless process environment overrides it. |

## Provider setup and troubleshooting

- **Mapbox:** set `ROUTING_PROVIDER_URL=https://api.mapbox.com` and `ROUTING_PROVIDER_API_KEY=<your token>` in local `.env`. The adapter calls Directions with longitude/latitude coordinates and asks for GeoJSON geometry. The audited live route call succeeded. Do not use a public browser token for this server-side adapter unless its scopes are restricted appropriately.
- **Custom routing provider:** the Python adapter sends JSON `{origin,destination,mode}` by POST and expects numeric `distance_km` and `duration_minutes`; provider name, retrieval timestamp, and valid LineString geometry are optional. Non-finite/negative values are rejected.
- **Geocoding:** no provider is configured or called by this project. Do not assume a typed address has coordinates; the active planner currently needs browser location, a map pin, or manually supplied coordinates.
- **Gemini:** configure `GEMINI_API_KEY` and optionally `GEMINI_MODEL` / `GEMINI_TIMEOUT_MS`. A key-authenticated model-list request succeeded, and one live generation completed in about 38 seconds; later chat requests exceeded the 60-second server limit without an HTTP response. Generation remains intermittent despite the 60-second server / 65-second browser limits.
- **Demo:** only set `DEMO_MODE=true` for tests or presentations. Responses label these routes as synthetic/inference. Missing provider in normal mode yields `provider_error`.
- **MongoDB:** setting `MONGODB_URI` does not connect the app to a database. The current app loads local JSON. Do not make Mongo required unless an adapter is implemented.
- **Account persistence:** account and itinerary JSON files are ignored by Git. Restrict access to the app identity and backups. This implementation supports one writer process and has no transactional database or multi-host coordination.
- **Email:** no delivery provider is configured. Password reset and verification are not implemented.
- **Express-to-Flask:** if Express reports the planner unavailable, check `LANGGRAPH_API_URL`, Flask port, and `GET /health` on both services. The planner bridge timeout is 45 seconds; the browser allows 50 seconds. Directed route requests run in a bounded pool (default 8 workers); provider rate limits can still constrain larger plans.

Current configuration presence was checked without displaying values. See [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md) for exact provider results.
