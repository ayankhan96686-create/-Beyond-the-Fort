# Deployment Guide

Updated: 2026-10-30

## Current state

The repository has no checked-in cloud, container, reverse-proxy, or production deployment configuration. No production deployment was made or verified. The application is Express/EJS on Node plus a separate Flask/LangGraph process. Run Flask on a private interface or network; production `POST /plan` also checks a shared service token.

## Required production configuration

Set secrets through the platform secret manager. Do not commit `.env` files or copy provider credentials into browser source.

- `NODE_ENV=production` enables Secure session cookies and HSTS and turns on production configuration checks.
- `LANGGRAPH_SERVICE_TOKEN` must be a randomly generated value of at least 32 characters. Configure the same value for Node and Flask; never reuse a provider API key.
- `AUTH_USERS_FILE` and `SAVED_ITINERARIES_FILE` must point to durable private writable storage. Restrict OS access to the service account and backups. JSON persistence supports one writer process; do not horizontally scale this version.
- `FRONTEND_ORIGINS` can be empty for same-origin EJS. If a separate client is used, list its exact HTTPS origins, comma-separated. Wildcards and HTTP origins are rejected in production.
- Configure `LANGGRAPH_API_URL` to a private Flask URL, `HOST` and ports according to the platform, and the required Gemini/routing provider credentials if those capabilities are enabled.
- Set `TRUST_PROXY_HOPS` only to the exact number of trusted reverse proxies in front of Express (0–5). Never trust arbitrary forwarded headers.
- Set `INITIAL_ADMIN_EMAIL` before the first matching account is registered. Only the first matching registration becomes administrator; clear the bootstrap setting afterward. If no administrator is bootstrapped, no account can use the admin API.

Terminate public TLS at a correctly configured reverse proxy, forward HTTPS only, protect the Flask port from public access, and use restrictive file and backup permissions. Production cookie `Secure` does not itself configure HTTPS. The app currently lacks shared session storage, a database transaction layer, automated backup jobs, and a deployment health/readiness probe.

## Local startup

From the repository root, create `.env` from `.env.example` only if no local file exists. Install the existing Node and Python requirements, then run one process per terminal:

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

```powershell
node server.js
```

```powershell
.\.venv\Scripts\python.exe .\multiagent-engine\server.py
```

Browse to `http://127.0.0.1:3000`. `/health` checks only Express; Flask `/health` checks only Flask. Public read-only attraction routes do not require an account. Registration is available at `/register`.

## Operational limitations

Chat history and login sessions are in process memory and clear on restart. Account and saved-plan data persist only if their configured storage paths are durable. JSON files have no multi-process locking or recovery automation. Back up both files together with restrictive access; see [BACKUP_AND_RECOVERY.md](../BACKUP_AND_RECOVERY.md). Password reset and email verification are not available without a configured delivery service. Review [SECURITY.md](../SECURITY.md) and [FINAL_SECURITY_AND_AUTH_REPORT.md](../FINAL_SECURITY_AND_AUTH_REPORT.md) before exposing the service publicly.
