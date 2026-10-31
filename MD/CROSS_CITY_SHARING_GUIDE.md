# Secure Cross-City Sharing Guide (Morna to Agra)
## Beyond the Fort — Gwalior Tourism AI
**Architecture:** Unified Single-Port Node.js Full-Stack (`Port 5173 Only`)  
**Tunnel Solution:** Cloudflare Quick Tunnel (`trycloudflare.com`)  
**Active Live Tunnel URL:** `https://surgery-brand-staffing-everyday.trycloudflare.com`  
**Connection Protocol:** HTTP/2 over persistent TCP 443 (Immune to Error 1033 UDP drops)

---

## 1. Live Temporary Sharing URL

Your application is currently being securely routed from your laptop in Morna to your friend in Agra over Cloudflare's global edge network.

| Destination | Protocol | Active Tunnel URL | Status |
| :--- | :---: | :--- | :---: |
| **Friend in Agra (Mobile or PC)** | **HTTPS** | **`https://surgery-brand-staffing-everyday.trycloudflare.com`** | **ONLINE & VERIFIED** |
| **Local Host (Your Laptop in Morna)** | HTTP | `http://localhost:5173/` | **ONLINE (Port 5173)** |

---

## 2. Root Cause Analysis: Cloudflare Error 1033 & Resolution

### The Root Cause:
The previous tunnel URL (`mike-washer-township-trademarks.trycloudflare.com`) failed with **Cloudflare Error 1033** due to:
1. **QUIC (UDP) Datagram Timeouts:** Default Cloudflare quick tunnels operate over UDP (QUIC) on port 7844. Consumer Wi-Fi routers (Airtel, Jio, BSNL) enforce aggressive NAT translation timeouts (often clearing inactive UDP sessions after 30–60 seconds).
2. **Session Desynchronization:** As observed in the tunnel logs (`Serve tunnel error error="datagram manager error: timeout: no recent network activity"`), when the connection timed out and attempted to rebind to a new edge IP (`bom06`), the ephemeral quick tunnel session route on Cloudflare's edge dropped, returning **Error 1033 (Tunnel Error)** to external visitors.

### The Engineered Fix:
1. **Enforced Persistent TCP HTTP/2:** The tunnel was relaunched with `--protocol http2`. This establishes a persistent TCP 443 session with standard TCP keep-alives that cannot be terminated by router UDP NAT tables.
2. **Fresh Edge Registration:** Successfully registered under Cloudflare Edge location `bom04` with protocol `http2`.
3. **Resilient Launcher:** Updated `scripts/start-cross-city-tunnel.js` to automatically verify local health, clear duplicate/stale tunnel processes, and enforce `http2` protocol.

---

## 3. Verified Functionality Over External HTTPS

The complete application was verified via direct API requests and an automated Headless Chrome suite through `https://surgery-brand-staffing-everyday.trycloudflare.com`:

1. **Homepage & Hero (`GET /`):** HTTP 200. Royal Heritage theme, Man Singh Palace panoramic photography, UNESCO badge, WebGL particle/mesh background canvas, and custom cursor.
2. **Readiness API (`GET /ready`):** HTTP 200. Reports MongoDB Atlas / curated cache healthy (12 POIs), Gemini 3.5 Flash available, and in-process LangGraph.js (:5173).
3. **Discover Places (`GET /api/v1/pois`):** HTTP 200. 36 curated Gwalior attractions with filters, search, and detail modals.
4. **Planning Studio (`POST /api/v1/tourism-plan`):** HTTP 200. All 6 LangGraph.js agents (`manager`, `research`, `route`, `verification`, `itinerary_optimizer`, `response`) executed with deterministic +25% transit buffer.
5. **Tansen AI Concierge (`POST /api/chat`):** HTTP 200. Gemini-powered real-time assistant responses.
6. **Interactive Leaflet Route Corridor & Map:** HTTP 200. Custom royal pins and dual-layer polyline.

---

## 4. Security, Privacy & Integrity Safeguards

- **Strict Host & Origin Validation:**
  - `server.js` validates origins matching `/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/`. No wildcard `*` CORS.
  - Vite dev middleware configured with `allowedHosts: ['.trycloudflare.com']`.
- **Zero Exposed Secrets:**
  - `.env`, Gemini API keys, MongoDB credentials, and session tokens remain strictly server-side.
- **CSRF Protection Maintained:**
  - Double-submit CSRF cookie token protection remains active for all write operations.
- **Port 5173 Unification Preserved:**
  - Ports 3000 and 8000 remain completely closed.

---

## 5. Important Operational Notes & Limitations

1. **Keep Your Laptop Awake & Online:**
   - Cloudflare Quick Tunnel is a live reverse proxy pointing to `http://localhost:5173` on your laptop in Morna.
   - If you close your laptop lid, put the PC to sleep, or disconnect from Wi-Fi, the tunnel URL will disconnect.
2. **Temporary URL Lifespan:**
   - Quick Tunnels are account-less, temporary links. If the tunnel process restarts, Cloudflare assigns a new random subdomain name.
3. **Future One-Click Relaunch:**
   - Double click `scripts\start-cross-city-tunnel.bat` or run `node scripts/start-cross-city-tunnel.js`.
