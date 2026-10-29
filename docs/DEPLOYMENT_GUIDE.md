# Deployment Guide

Updated: 2026-10-30

## Current hosting state

The repository has no checked-in Docker, cloud-hosting, or reverse-proxy deployment configuration. The validated application stack is Express/EJS on Node and the existing Flask/LangGraph process. The browser calls Express; Express calls Flask over `LANGGRAPH_API_URL`. Keep both APIs on the same private network or host. Do not expose Flask publicly unless a deployment explicitly needs it and adds suitable access controls.

## Environment

Set secrets in the hosting provider's secret manager, not in frontend files or source control:

- `NODE_ENV=production` enables the secure session cookie flag.
- `PORT` is the Express listener port; default `3000`.
- `HOST` controls both listeners; default `127.0.0.1`. Set `HOST=0.0.0.0` only when a container/platform requires binding its assigned network interface.
- `LANGGRAPH_PORT` is the Flask port; default `8000`.
- `LANGGRAPH_API_URL` points Express to Flask, normally `http://127.0.0.1:8000/plan` on one host.
- `GEMINI_API_KEY` is read by the Express service only; optionally set `GEMINI_MODEL` and `GEMINI_TIMEOUT_MS`.
- `ROUTING_PROVIDER_URL`, `ROUTING_PROVIDER_API_KEY`, and optional `ROUTING_PROVIDER_TIMEOUT_SECONDS` configure the Python route provider. Without a live provider, normal planning must return an unavailable/error status; `DEMO_MODE=true` is for explicitly synthetic demos only.
- `FRONTEND_ORIGINS` is an optional comma-separated allowlist for a separately hosted frontend. Same-origin EJS does not need it.

See [`.env.example`](../.env.example) and [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for all current variables. Never copy real keys into browser code. Public deployments must use HTTPS, protect provider credentials, and restrict access to the Flask endpoint.

## Local startup

From the repository root, use two terminals:

```powershell
$env:LANGGRAPH_PORT = '8000'
..venvScriptspython.exe .multiagent-engineserver.py
```

```powershell
$env:PORT = '3000'
$env:LANGGRAPH_API_URL = 'http://127.0.0.1:8000/plan'
node .server.js
```

Open `http://127.0.0.1:3000/chat`. The Express `/health` endpoint checks only Express. Check Flask separately at `http://127.0.0.1:8000/health`.

For a separate frontend origin, set `FRONTEND_ORIGINS` to its exact HTTPS origin(s) and configure the browser's API base URL in an explicit deployment change; the current chat client uses same-origin relative paths. Cross-site cookie deployments also require an explicit secure cookie/CORS policy and are not claimed as supported by this implementation.

## Deployment readiness

No cloud deployment was made or verified. Before deployment, choose a platform that can run both services (or provide private service-to-service networking), supply secure secrets, configure health checks for both processes, and verify the host's binding/port contract. The app uses in-memory chat history, so each process restart clears conversations and horizontal replicas do not share them.
