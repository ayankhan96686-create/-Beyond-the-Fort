# DEPENDENCY AND RUNTIME VERIFICATION — BEYOND THE FORT
**Project:** Beyond the Fort — Discover the Soul of Gwalior  
**Execution Environment:** Windows PowerShell / Node.js 20+ / Python 3.14  
**Date:** October 31, 2026

---

## 1. Runtime Process Landscape

All 3 local services run concurrently in persistent sessions managed by `npm run start:all`:

| Service | Technology | Port | Entrypoint | Process Role | Health Status |
|---|---|---|---|---|---|
| **Vite Frontend** | React 19 + Tailwind v4 | `5173` | `new_style/src/main.jsx` | SPA Client with Proxy | **ONLINE (HTTP 200)** |
| **Express Backend** | Node.js Express 4 | `3000` | `server.js` | API Gateway, Static Assets | **ONLINE (HTTP 200)** |
| **AI Multi-Agent Engine**| Python Flask + LangGraph| `8000` | `multiagent-engine/server.py`| 6-Agent LangGraph System | **ONLINE (HTTP 200)** |

---

## 2. Frontend Dependency Audit (`new_style/package.json`)

```json
{
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "gsap": "^3.15.0",
    "leaflet": "^1.9.4",
    "lenis": "^1.3.27",
    "lucide-react": "^1.64.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "three": "^0.187.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tailwindcss/vite": "^4.3.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "eslint": "^10.13.0",
    "tailwindcss": "^4.3.3",
    "vite": "^8.3.5"
  }
}
```

### Dependency Roles:
- **`react` & `react-dom` (v19.3.1):** Modern React concurrent rendering engine.
- **`three` (v0.187.0):** WebGL 3D rendering for the interactive particle constellation and sandstone terrain mesh.
- **`gsap` (v3.15.0):** High-precision timeline sequencing for page wipes and card transitions.
- **`lenis` (v1.3.27):** Locomotive-style smooth inertia momentum scrolling.
- **`leaflet` (v1.9.4):** Interactive GIS route mapping with CartoDB Voyager tiles.
- **`lucide-react` (v1.64.0):** Crisp SVG iconography adhering to zero-emoji design rules.
- **`canvas-confetti` (v1.9.4):** Celebratory physics-based particle burst upon itinerary orchestration.
- **`@tailwindcss/vite` (v4.3.3):** Next-generation lightning-fast CSS utility compiler.

---

## 3. Production Build Benchmark
- Build Command: `npm run build` inside `new_style/`
- Build Output:
  - `dist/index.html`: `1.27 kB` (gzip: `0.69 kB`)
  - `dist/assets/index-B4sPEhDY.css`: `82.54 kB` (gzip: `13.38 kB`)
  - `dist/assets/index--O8cdBPu.js`: `1,306.32 kB` (gzip: `367.85 kB`)
- Compilation Duration: **577 ms** (Vite v8.3.5)
- Static Distribution: Served at `http://localhost:3000/app/`

---

## 4. Backend & Python Runtime Health

1. **Express Server (`server.js`):**
   - Rate limiters active: `aiLimiter` (10 req/min for AI workloads), `apiLimiter` (60 req/min for public API).
   - Security headers enforced: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - Public access: No login walls on `/search`, `/itinerary`, `/app`, `/api/v1/tourism-plan`, or `/api/chat`.
2. **Python AI Engine (`multiagent-engine/server.py`):**
   - Python 3.14 environment active.
   - LangGraph StateGraph compiled with nodes `manager`, `research`, `route`, `verification`, `itinerary`, and `response`.
   - Data catalog loaded from `curated_dataset`: 57 authentic places.

