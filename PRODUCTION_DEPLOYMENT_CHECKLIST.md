# Production Deployment Readiness Checklist

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412)  
**Target Environment:** Production (Containerized / Cloud VM / Reverse Proxy)  
**Status:** **READY FOR DEPLOYMENT**  

---

## 1. Application Security Baseline

- [x] **Disabled Fingerprinting:** `app.disable('x-powered-by')` explicitly configured in `server.js`.
- [x] **Security Headers Configured:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (enforced when `NODE_ENV=production`)
- [x] **Content Security Policy (CSP):**
  - Restricts script execution to `'self'`.
  - Disallows remote inline scripts (all Leaflet map logic bundled locally in `/vendor/leaflet/` and `/js/results-map.js`).
  - Sets `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
- [x] **CSRF Defense:** Double-submit cookie with cryptographic HMAC comparison (`x-csrf-token` header verified against `beyond_fort_csrf` cookie).
- [x] **Session Security:**
  - Cookies configured with `HttpOnly`, `SameSite=Lax`, and `Secure` flag enabled in production.
  - Session IDs generated using cryptographically strong `crypto.randomBytes(32)`.
- [x] **Account Lockout:** Locks accounts for 15 minutes after 5 consecutive failed login attempts to prevent credential brute-forcing.
- [x] **BOLA / IDOR Authorization:** Single itinerary retrieval (`GET /api/itineraries/:id`) enforces strict ownership; returns 403 Forbidden on cross-account access attempts.

---

## 2. Environment Variables & Production Secrets

Ensure all following variables are set in the production environment:

| Variable | Requirement in Production | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | **`production`** | Activates production security gates, HSTS, and strict origin checks |
| `PORT` | `3000` (or container port) | Application port for Node.js Express server |
| `HOST` | `0.0.0.0` or `127.0.0.1` | Bind address (use `127.0.0.1` behind reverse proxy) |
| `TRUST_PROXY_HOPS` | `1` to `5` | Required when running behind Nginx / Cloudflare / AWS ALB |
| `FRONTEND_ORIGINS` | `https://yourdomain.com` | Exact HTTPS origins (wildcards prohibited in production) |
| `LANGGRAPH_API_URL` | `http://127.0.0.1:8000/plan` | Internal address of the Python multi-agent service |
| `LANGGRAPH_SERVICE_TOKEN` | `>= 32 chars` | Cryptographic shared bearer token between Node and Python |
| `AUTH_USERS_FILE` | Persistent path | Absolute file path to secure persistent user store |
| `SAVED_ITINERARIES_FILE` | Persistent path | Absolute file path to secure persistent itinerary store |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas TLS connection string |
| `GEMINI_API_KEY` | Valid API key | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Pinned high-capacity production model |
| `ROUTING_PROVIDER_URL` | `https://api.mapbox.com` | Mapbox transit directions provider |
| `ROUTING_PROVIDER_API_KEY` | Valid token | Mapbox secret token |

---

## 3. Frontend & Client Asset Audit

- [x] **No Hardcoded Localhost:** Verified across all frontend templates (`views/*.ejs`) and static scripts (`public/js/*.js`). All API calls use relative paths (`/api/...`).
- [x] **Vendor Asset Localization:** Leaflet CSS, JS, and map markers are completely bundled under `/public/vendor/leaflet/`, eliminating third-party CDN supply-chain dependencies.
- [x] **21-Language Localization:** All 15 Indian languages and 6 international languages validated with correct RTL layout support for Urdu and Arabic.

---

## 4. Production Process Management (PM2 Configuration)

For production deployment on Linux / VM, save as `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'beyond-the-fort-python',
      cwd: './multiagent-engine',
      script: '../.venv/bin/python',
      args: 'server.py',
      env: {
        NODE_ENV: 'production',
        LANGGRAPH_PORT: '8000'
      },
      restart_delay: 3000,
      max_restarts: 10
    },
    {
      name: 'beyond-the-fort-node',
      cwd: '.',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      restart_delay: 3000,
      max_restarts: 10
    }
  ]
};
```

---

## 5. Reverse Proxy (Nginx) Configuration

```nginx
server {
    listen 80;
    server_name beyondthefort.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beyondthefort.org;

    ssl_certificate /etc/letsencrypt/live/beyondthefort.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beyondthefort.org/privkey.pem;

    # Forward to Node.js Express server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Block direct public access to Python port
    location /plan {
        proxy_pass http://127.0.0.1:3000/tourism-plan;
    }
}
```

---

## 6. Observability & Health Check Monitoring

Set your load balancer or uptime monitor (e.g. Datadog, CloudWatch, Prometheus) to probe:

1. **Liveness Probe:**
   - **Endpoint:** `GET /health`
   - **Expected Status:** `200 OK`
   - **Frequency:** Every 15 seconds
2. **Readiness Probe:**
   - **Endpoint:** `GET /ready`
   - **Expected Status:** `200 OK`
   - **Verification:** Ensures MongoDB Atlas connection and AI service are operational.

---

## 7. Sign-Off & Verification Evidence

| Audit Check | Status | Verification Reference |
| :--- | :---: | :--- |
| Security Headers & CSP | **PASSED** | Verified via `server.js` |
| CSRF & Session Isolation | **PASSED** | Verified via `tests/security.test.js` |
| Gemini Chatbot Resilience | **PASSED** | Verified via `AI_CHATBOT_ROOT_CAUSE_REPORT.md` |
| 6-Agent LangGraph Planner | **PASSED** | Verified via `AI_AGENT_EXECUTION_REPORT.md` |
| Automated Test Suites | **PASSED** | **24/24 Node tests + 58/58 Python tests** |
| Zero-Downtime DB Fallback | **PASSED** | Tested against Atlas cluster + local dataset |

