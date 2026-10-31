# Service Startup & Runtime Operations Guide

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412)  
**Version:** 1.0.0 (Production Ready)  

---

## 1. Runtime Architecture & Port Allocation

Beyond the Fort operates with two coordinated, decoupled services:

| Service | Runtime | Port | Working Directory | Primary Role |
| :--- | :--- | :---: | :--- | :--- |
| **Node.js Express** | Node.js v24+ | **`3000`** | `.` (Repo Root) | Web UI, EJS views, REST APIs, Session auth, Gemini Chatbot, Map assets |
| **Python LangGraph** | Python 3.14 (`.venv`) | **`8000`** | `./multiagent-engine` | 6-Agent state-graph planner, Mapbox transit math, verification engine |

---

## 2. Quick Start: Single Unified Startup Command

A unified orchestrator script (`scripts/start-all.js`) automatically detects virtual environments, checks port availability, and launches both services in coordinated parallel:

```bash
# Production / Foreground Mode
npm run start:all

# Development Mode
npm run dev:all
```

The script monitors both services, logs interleaved colorized output, and handles graceful simultaneous termination on `Ctrl+C`.

---

## 3. Manual Dual-Terminal Startup (Step-by-Step)

If you prefer running services in separate terminal tabs for independent log tailing:

### Terminal 1: Python LangGraph Multi-Agent Service (Port 8000)

```powershell
# Windows (PowerShell)
cd "D:\TOURISM AI MULTI-AGENT SYSTEM\Time-Aware-Digital-Discoverability-Beyond-the-Fort"
.\.venv\Scripts\Activate.ps1
cd multiagent-engine
python server.py
```

```bash
# Linux / macOS
cd Time-Aware-Digital-Discoverability-Beyond-the-Fort
source .venv/bin/activate
cd multiagent-engine
python server.py
```

*Expected output:*
```
 * Running on http://127.0.0.1:8000
```

### Terminal 2: Node.js Express Application Server (Port 3000)

```powershell
# Windows / Linux / macOS
cd "D:\TOURISM AI MULTI-AGENT SYSTEM\Time-Aware-Digital-Discoverability-Beyond-the-Fort"
npm start
```

*Expected output:*
```
[DB Layer] Loaded 12 curated Gwalior POIs from local authoritative dataset.
[DB Layer] Connected to MongoDB Atlas. Synced 12 POIs from cloud cluster.
=======================================================
  Team Venator: Time-Aware Digital Discoverability
  AI Synergy Hackathon 2026 • Round 1
  Server listening on http://localhost:3000
=======================================================
```

---

## 4. Health & Readiness Verification

Confirm both services are online using HTTP health probes:

### 1. Node.js Express Liveness Check
```bash
curl http://localhost:3000/health
```
```json
{
  "status": "healthy",
  "timestamp": "2026-10-30T02:30:13.961Z",
  "team": "Team Venator (ID: 60358412)",
  "pilot": "Gwalior Beyond the Fort (Theme 04)",
  "service": "Time-Aware Feasibility Engine"
}
```

### 2. Node.js Express Deep Readiness Check
```bash
curl http://localhost:3000/ready
```
```json
{
  "status": "ready",
  "timestamp": "2026-10-30T02:30:13.965Z",
  "checks": {
    "database": {
      "status": "healthy",
      "count": 12,
      "source": "MongoDB Atlas / Curated Cache"
    },
    "ai_provider": {
      "status": "available",
      "primary_model": "gemini-3.5-flash"
    },
    "planner": {
      "status": "configured",
      "target": "http://127.0.0.1:8000/plan"
    }
  }
}
```

### 3. Python LangGraph Service Check
```bash
curl http://127.0.0.1:8000/health
```
```json
{
  "status": "healthy",
  "service": "Tourism LangGraph API",
  "agents": [
    "Manager",
    "Research",
    "Route & Time",
    "Verification",
    "Itinerary & Optimization",
    "Response"
  ]
}
```

---

## 5. Web Interface Access Points

Once started, access all features in your web browser:

- **Homepage & Search:** [http://localhost:3000/](http://localhost:3000/)
- **Itinerary Generator & Map:** [http://localhost:3000/itinerary](http://localhost:3000/itinerary)
- **Tansen AI Chatbot:** [http://localhost:3000/chat](http://localhost:3000/chat)
- **Attraction Details:** [http://localhost:3000/attractions/poi_gwl_001](http://localhost:3000/attractions/poi_gwl_001)
- **User Authentication:** [http://localhost:3000/login](http://localhost:3000/login)
- **User Account Dashboard:** [http://localhost:3000/account](http://localhost:3000/account)
- **Admin Audit Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6. Troubleshooting Common Issues

### Issue: Port 3000 or 8000 already in use
Check what process is holding the port and terminate it:
```powershell
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```

### Issue: Gemini API rate limit / 429
The system automatically cascades to `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, and the local curated knowledge-base fallback. Chat will continue operating with verified data without throwing errors.

### Issue: Missing Python dependencies
Ensure you are using the repository's `.venv`:
```powershell
.\.venv\Scripts\pip install -r multiagent-engine/requirements.txt
```

