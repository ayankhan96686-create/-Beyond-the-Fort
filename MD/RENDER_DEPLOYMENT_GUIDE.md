# Beyond the Fort — Render Free Web Service Deployment Guide
**Team Venator (ID: 60358412) | AI Synergy Hackathon 2026**

This comprehensive guide details the exact steps to deploy the unified **Beyond the Fort** application as a single-port production Node.js service on [Render](https://render.com) using their Free Tier.

---

## 1. Architecture Overview on Render

- **Runtime**: Pure Node.js (Version >= 20.0.0 LTS)
- **Architecture**: Unified Single-Process, Single-Port Web Service
  - **Frontend**: React 19 + Tailwind CSS + Leaflet (pre-compiled to `new_style/dist/`)
  - **Backend**: Express API server handling authentication, CSRF, rate-limiting, and POI datasets
  - **AI Engine**: In-process LangGraph.js 6-Agent deterministic planning workflow
  - **Port**: Dynamically bound to `0.0.0.0:$PORT` (Render injects `PORT`)
  - **Healthcheck**: `/ready` endpoint returning HTTP 200 with JSON health status

---

## 2. Quick Deploy: Option A (Render Blueprint via `render.yaml`)

The repository includes a pre-configured `render.yaml` specification.

1. Push your changes to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect the repository: `https://github.com/ayankhan96686-create/-Beyond-the-Fort`.
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `beyond-the-fort`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/ready`
6. Fill in the sensitive environment variables (e.g., `GEMINI_API_KEY`) prompted by Render.
7. Click **Apply**.

---

## 3. Manual Deploy: Option B (Render Dashboard Web Service)

If setting up the Web Service manually from the Render Dashboard:

1. Click **New +** > **Web Service**.
2. Select your repository: `https://github.com/ayankhan96686-create/-Beyond-the-Fort`.
3. Configure the service settings:
   - **Name**: `beyond-the-fort` (or your preferred name)
   - **Region**: `Singapore` or `Oregon`
   - **Branch**: `main`
   - **Root Directory**: *(leave blank — defaults to repository root)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     node server.js
     ```
   - **Instance Type**: `Free` ($0/month)
4. Expand **Advanced**:
   - **Health Check Path**: `/ready`
   - **Auto-Deploy**: `Yes`

---

## 4. Production Environment Variables Reference

Configure these in the Render Dashboard (**Environment** tab):

> [!IMPORTANT]
> Never hardcode `PORT` in Render environment variables. Render automatically assigns a random port dynamically and passes it as `process.env.PORT`.

### Essential Production Variables

| Environment Variable Name | Required | Default / Recommended | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production mode and pre-built static bundle serving |
| `TRUST_PROXY_HOPS` | **Yes** | `1` | Enables Express proxy trust for Render reverse proxy and HTTPS headers |
| `GEMINI_API_KEY` | **Recommended** | *(Your Google AI Key)* | Powers Gemini intent parsing and Tansen AI conversational answers |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Candidate Gemini model (`gemini-2.5-flash`, `gemini-1.5-flash`) |
| `GEMINI_TIMEOUT_MS` | Optional | `60000` | Timeout in milliseconds for Gemini API calls |
| `LANGGRAPH_SERVICE_TOKEN` | Optional | *(Auto-generated)* | 32+ character token for agent isolation (auto-generated if omitted) |
| `APP_PUBLIC_URL` | Optional | `https://<service-name>.onrender.com` | Public HTTPS URL assigned by Render |
| `FRONTEND_ORIGINS` | Optional | *(Render domain)* | Comma-separated list of extra HTTPS origins allowed for CORS |

### Routing & Mapbox Variables

| Environment Variable Name | Required | Default / Recommended | Description |
| :--- | :--- | :--- | :--- |
| `ROUTING_PROVIDER_URL` | Optional | `https://api.mapbox.com` | Mapbox Directions API endpoint |
| `ROUTING_PROVIDER_API_KEY` | Optional | *(Your Mapbox Token)* | Mapbox public/secret access token for live road geometry |
| `ROUTING_PROVIDER_TIMEOUT_SECONDS` | Optional | `5` | Timeout for Mapbox route calculations |
| `SAFETY_BUFFER_RATIO` | Optional | `0.25` | Mathematical transit safety buffer (default: 25%) |

### Database & Persistence Variables

| Environment Variable Name | Required | Default / Recommended | Description |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Optional | *(Atlas Connection String)* | MongoDB Atlas connection string with replica set and database |
| `INITIAL_ADMIN_EMAIL` | Optional | `admin@example.com` | Email granted administrator role upon registration |

### Outgoing Email Variables (Optional)

| Environment Variable Name | Required | Default / Recommended | Description |
| :--- | :--- | :--- | :--- |
| `EMAIL_HOST` | Optional | `smtp.gmail.com` | SMTP Server Host |
| `EMAIL_PORT` | Optional | `587` | SMTP Port (`587` for TLS, `465` for SSL) |
| `EMAIL_SECURE` | Optional | `false` | SSL boolean |
| `EMAIL_USER` | Optional | *(SMTP Username)* | SMTP authentication email/user |
| `EMAIL_PASSWORD` | Optional | *(SMTP Password)* | SMTP app password |
| `EMAIL_FROM` | Optional | *(From Address)* | Sender email address for password resets |

---

## 5. MongoDB Atlas Outbound Networking on Render

If using MongoDB Atlas:

1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under Security.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   > *Why?* Render Free Web Services use shared cloud infrastructure where outbound IP addresses are dynamically assigned and rotate over time.
5. In **Database Access**, verify your database user has read/write privileges on the `tourism_gwalior` database.

> [!NOTE]
> If `MONGODB_URI` is omitted or disconnected, the application automatically falls back to the local curated authoritative dataset in `data/gwalior_curated_pois.json`. The application will NEVER crash from a database outage.

---

## 6. Known Render Free-Tier Limitations & Mitigations

| Limitation | Impact | Mitigation Built into Beyond the Fort |
| :--- | :--- | :--- |
| **Spin-Down on Inactivity** | Containers go to sleep after 15 minutes of zero HTTP traffic. Next visit incurs a ~30–50s cold start. | Lightweight startup: Node.js server and pre-built bundle boot in < 800ms once container awakens. |
| **512 MB RAM Maximum** | Exceeding 512 MB triggers OOM termination. | The unified single-port architecture consumes ~120 MB RAM at idle, leaving ample headroom (> 390 MB free). |
| **Ephemeral Container Disk** | Local files (e.g. SQLite or `.auth-users.json`) reset upon container restart or redeploy. | Configure `MONGODB_URI` for permanent user and saved itinerary storage across deploys. |
| **Monthly Free Hours** | 750 free instance hours per calendar month across all free services on your account. | Sufficient to run one web service 24/7 every month. |

---

## 7. Verification Checklist After Deployment

Once Render displays **"Service is live"**:

1. **Readiness Probe**: Visit `https://<your-app>.onrender.com/ready`  
   - Expected status: `HTTP 200` with JSON `{ "status": "ready", "checks": { ... } }`.
2. **Interactive UI**: Visit `https://<your-app>.onrender.com/`  
   - Expected status: Royal Heritage UI renders with responsive navbar, hero animations, and navigation tabs.
3. **Curated POIs**: Visit `https://<your-app>.onrender.com/api/v1/pois`  
   - Expected status: `HTTP 200` with 12 curated Gwalior attractions.
4. **Planning Studio**: Fill in time budget and click *Generate Itinerary*.  
   - Expected status: Six-Agent LangGraph.js workflow executes and plots feasible stops on the interactive Leaflet map.
5. **Tansen AI Chatbot**: Open the floating assistant and send a question.  
   - Expected status: Returns grounded response backed by the curated Gwalior knowledge base.

