# BEYOND THE FORT — PRODUCTION CLOUD DEPLOYMENT GUIDE
## Decoupled Architecture: Vercel Frontend + Dual Railway Backends + MongoDB Atlas

**Project:** Time-Aware Digital Discoverability — Beyond the Fort, Gwalior  
**Team:** Team Venator (ID: 60358412) — AI Synergy Hackathon 2026  
**Last Updated:** October 30, 2026  

---

## 1. PRODUCTION DEPLOYMENT ARCHITECTURE

The application runs across four dedicated production cloud services:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                              │
│  Service 1: Vite + React 19 Frontend (`new_style/`)                     │
│  URL: https://beyond-the-fort.vercel.app                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST (CORS + Credentials)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        RAILWAY CLOUD PLATFORM                           │
│  Service 2: Node.js 20 Express API Gateway (Root Directory)             │
│  URL: https://beyond-the-fort-backend.up.railway.app                    │
│  • Session & CSRF Auth   • Rate Limiting   • Leaflet Maps & Curated POIs│
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
               │ Private Railway Network                   │ TLS Encrypted
               │ http://tourism-python.railway.internal:8000│ Replica Set
               ▼                                           ▼
┌──────────────────────────────┐            ┌─────────────────────────────┐
│  Service 3: Railway Python   │            │  Service 4: MongoDB Atlas   │
│  Flask AI Engine             │            │  Cloud Database             │
│  (`multiagent-engine/`)      │            │  Cluster `tourism_gwalior`  │
│  • 6-Agent LangGraph System  │            │  • 12 Curated Cultural POIs │
│  • Google Gemini 3.5 Flash   │            │  • Zero-Downtime Fallback   │
└──────────────────────────────┘            └─────────────────────────────┘
```

---

## 2. STEP-BY-STEP DEPLOYMENT PLAYBOOK

### STEP 1: Deploy Python LangGraph AI Engine to Railway
1. Log in to [Railway Dashboard](https://railway.com).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select repository `Venator/-beyond-the-fort` (or `ayankhan96686-create/-Beyond-the-Fort`).
4. Click on the created service, open **Settings**:
   - **Service Name:** `tourism-python-ai`
   - **Root Directory:** `/multiagent-engine`
   - **Build Command:** (uses `multiagent-engine/railway.json` / Nixpacks automatically)
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 server:app`
   - **Healthcheck Path:** `/health`
5. Open **Variables** tab and add:
   ```env
   NODE_ENV=production
   HOST=0.0.0.0
   GEMINI_API_KEY=<Your_Google_Gemini_API_Key>
   GEMINI_MODEL=gemini-3.5-flash
   LANGGRAPH_SERVICE_TOKEN=<Generate_32_Char_Secret_Token>
   ```
6. Open **Networking** tab:
   - Click **Generate Domain** (gives public HTTPS URL, e.g. `https://tourism-python.up.railway.app`).
   - Note the private network address: `http://tourism-python.railway.internal:8000`.

---

### STEP 2: Deploy Express Backend Gateway to Railway
1. In the same Railway project, click **+ Create** → **GitHub Repo**.
2. Select the same repository `Venator/-beyond-the-fort`.
3. Open **Settings**:
   - **Service Name:** `beyond-fort-backend`
   - **Root Directory:** `/` (Root of repository)
   - **Start Command:** `node server.js`
   - **Healthcheck Path:** `/health`
4. Open **Variables** tab and add:
   ```env
   NODE_ENV=production
   HOST=0.0.0.0
   MONGODB_URI=<Your_MongoDB_Atlas_Connection_URI>
   SESSION_SECRET=<Generate_64_Char_Secret_Token>
   LANGGRAPH_SERVICE_TOKEN=<Identical_Token_From_Step_1>
   PYTHON_SERVICE_URL=http://tourism-python.railway.internal:8000
   FRONTEND_ORIGINS=https://beyond-the-fort.vercel.app
   COOKIE_SAMESITE=None
   TRUST_PROXY_HOPS=1
   ```
5. Open **Networking** tab:
   - Click **Generate Domain**.
   - Copy your public backend URL (e.g. `https://beyond-fort-backend.up.railway.app`).

---

### STEP 3: Deploy Vite React Frontend to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import** on the `Venator/-beyond-the-fort` repository.
3. Configure project settings:
   - **Project Name:** `beyond-the-fort`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and choose `new_style`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables**:
   - Add Name: `VITE_API_BASE_URL`
   - Value: `https://beyond-fort-backend.up.railway.app` (Your Railway Express URL from Step 2)
5. Click **Deploy**.
6. When deployment finishes, copy your live Vercel URL (e.g. `https://beyond-the-fort.vercel.app`).
7. **Important Cross-Origin Sync:** Return to Railway Express Service → Variables, and ensure `FRONTEND_ORIGINS` exactly matches your live Vercel URL (`https://beyond-the-fort.vercel.app`).

---

## 3. ALTERNATIVE: ONE-COMMAND CLI DEPLOYMENT

If you have CLI tools installed and authenticated:

```bash
# 1. Login to services
npx vercel login
npx @railway/cli login

# 2. Deploy Python AI engine
cd multiagent-engine
npx @railway/cli up

# 3. Deploy Express backend
cd ..
npx @railway/cli up

# 4. Deploy Frontend
cd new_style
npx vercel --prod
```

---

## 4. POST-DEPLOYMENT VERIFICATION

Once all three services are live, verify the complete cloud pipeline:

1. **Verify Backend Readiness Probe:**
   ```bash
   curl -s https://beyond-fort-backend.up.railway.app/ready
   ```
   Expected response:
   ```json
   {
     "status": "ready",
     "checks": {
       "database": { "status": "healthy", "count": 12 },
       "ai_provider": { "status": "available" },
       "planner": { "status": "configured" }
     }
   }
   ```

2. **Verify Python AI Engine Health:**
   ```bash
   curl -s https://tourism-python.up.railway.app/health
   ```

3. **Verify Frontend in Browser:**
   - Open your Vercel URL in Chrome or mobile browser.
   - Test Tansen AI chatbot drawer.
   - Test trip planner with 3+ hour time constraints.
   - Verify that all attraction cards display authentic, varied Wikimedia Commons images with attribution links.
