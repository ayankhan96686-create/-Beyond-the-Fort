# PRODUCTION ENVIRONMENT VARIABLES SPECIFICATION
**Project:** Time-Aware Digital Discoverability: Beyond the Fort, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Security Classification:** Strict Confidential (No Secrets in Prose or Version Control)  

---

## 1. ARCHITECTURAL OVERVIEW

The production deployment consists of three isolated runtime environments, each receiving only the configuration parameters it strictly requires:

1. **Vercel Frontend (`new_style/`):** Public browser runtime. Contains **zero secrets**. All `VITE_` variables are statically bundled into client-side JavaScript.
2. **Railway Express Gateway (Root):** Private server-side Node.js runtime. Manages sessions, MongoDB connection, rate limiting, and routes requests to the Python AI service.
3. **Railway Python Multi-Agent Engine (`multiagent-engine/`):** Private server-side Python runtime. Executes the 6-agent LangGraph workflow, holds Gemini credentials, and runs on an internal port.

---

## 2. VERCEL FRONTEND CONFIGURATION (`new_style`)

Configure these variables in the **Vercel Project Dashboard** under **Settings → Environment Variables** (target: `Production`, `Preview`, `Development`).

| Variable Name | Required | Consumer | Description | Example / Recommendation |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | **YES** | Browser Client (`api.js`) | Full HTTPS URL of the deployed Railway Express backend gateway. | `https://beyond-the-fort-backend.up.railway.app` |

> [!CAUTION]
> **NEVER** add `GEMINI_API_KEY`, `MONGODB_URI`, `SESSION_SECRET`, or `LANGGRAPH_SERVICE_TOKEN` to Vercel environment variables. Any variable prefixed with `VITE_` is readable by any visitor inspect-element in the browser.

---

## 3. RAILWAY EXPRESS BACKEND CONFIGURATION (Root Service)

Configure these variables in the **Railway Project Dashboard** for the **Express Backend Service** under **Variables**.

| Variable Name | Required | Consumer | Description | Security Guidance |
|---|---|---|---|---|
| `NODE_ENV` | **YES** | `server.js` | Sets runtime environment to production. | Set to `production`. |
| `PORT` | Auto | Node HTTP listener | Automatically assigned by Railway. | Do not override; Railway binds dynamically. |
| `HOST` | **YES** | `server.js` | Network interface to listen on. | Set to `0.0.0.0` for container reachability. |
| `MONGODB_URI` | **YES** | `config/db.js` | MongoDB Atlas replica-set connection string. | Use secure Atlas connection URI with URL-encoded credentials. |
| `SESSION_SECRET` | **YES** | `services/authService.js` | Secret key used for signing session cookies. | Generate high-entropy 64-character random string. |
| `LANGGRAPH_SERVICE_TOKEN` | **YES** | `services/tourismWorkflowService.js` | Shared secret token for authenticating Express-to-Flask calls. | Must be at least 32 characters in production. Matches Python service token. |
| `PYTHON_SERVICE_URL` | **YES** | `config/env.js` | URL of the deployed Python AI service. | Use Railway private DNS (`http://tourism-python.railway.internal:8000`) or public HTTPS. |
| `FRONTEND_ORIGINS` | **YES** | `server.js` (CORS) | Comma-separated allowed HTTPS frontend origins. | e.g. `https://beyond-the-fort.vercel.app` (Exact HTTPS origins only). |
| `COOKIE_SAMESITE` | **YES** | `services/authService.js` | Cross-domain cookie policy for decoupled Vercel/Railway hosting. | Set to `None` for cross-domain; browsers enforce `Secure`. |
| `TRUST_PROXY_HOPS` | Optional | `server.js` | Reverse-proxy hops for accurate client IP rate-limiting. | Set to `1` behind Railway reverse proxy. |
| `SMTP_HOST` | Optional | `services/emailService.js` | SMTP server host for password reset emails. | e.g. `smtp.gmail.com` or `smtp.sendgrid.net`. |
| `SMTP_PORT` | Optional | `services/emailService.js` | SMTP server port. | Set to `587` (STARTTLS) or `465` (SSL). |
| `SMTP_USER` | Optional | `services/emailService.js` | SMTP authentication username. | Your authenticated email address. |
| `SMTP_PASS` | Optional | `services/emailService.js` | SMTP authentication password or App Password. | App-specific password (never personal account password). |
| `EMAIL_FROM` | Optional | `services/emailService.js` | Friendly Sender header. | e.g. `"Beyond the Fort" <noreply@beyondthefort.in>`. |

---

## 4. RAILWAY PYTHON AI ENGINE CONFIGURATION (`multiagent-engine`)

Configure these variables in the **Railway Project Dashboard** for the **Python LangGraph Service** under **Variables**.

| Variable Name | Required | Consumer | Description | Security Guidance |
|---|---|---|---|---|
| `NODE_ENV` | **YES** | `server.py` | Sets runtime environment to production. | Set to `production`. |
| `PORT` | Auto | `server.py` / Gunicorn | Port assigned by Railway. | Railway injects this automatically. |
| `HOST` | **YES** | `server.py` / Gunicorn | Bind host for Gunicorn WSGI. | Set to `0.0.0.0`. |
| `GEMINI_API_KEY` | **YES** | `agents/response.py` | Google Gemini API key for AI generation. | Private API key from Google AI Studio. Server-side only. |
| `GEMINI_MODEL` | Optional | `services/geminiService.js` | Primary Gemini model identifier. | Defaults to `gemini-3.5-flash` with cascade fallback. |
| `LANGGRAPH_SERVICE_TOKEN` | **YES** | `server.py` | Shared secret token for protecting `/plan` endpoint. | Must be identical to the Express service token (32+ chars). |
| `LOG_LEVEL` | Optional | `server.py` | Python logging verbosity. | Set to `INFO` (avoids credential leakage in logs). |

---

## 5. GENERATING PRODUCTION SECRETS (TERMINAL HELPER)

To generate cryptographically secure 64-character tokens for `SESSION_SECRET` and `LANGGRAPH_SERVICE_TOKEN`, run this in your terminal:

```bash
# Generate 64-character hex secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6. ZERO-SECRET VERIFICATION CHECKLIST

- [x] `.env` is listed in `.gitignore` and NEVER committed to GitHub.
- [x] No API keys, passwords, or database URIs are present in frontend source code (`new_style/src`).
- [x] Vercel environment variables contain strictly `VITE_API_BASE_URL`.
- [x] Express backend CORS explicitly lists the Vercel production origin (`FRONTEND_ORIGINS`).
- [x] Python AI service `/plan` endpoint requires `Bearer <LANGGRAPH_SERVICE_TOKEN>`.

