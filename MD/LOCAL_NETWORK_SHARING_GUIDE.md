# Local Area Network (LAN) Sharing Guide
## Beyond the Fort — Single-Port Architecture Multi-Device Access
**Project:** Beyond the Fort — Gwalior Tourism AI  
**Single Port:** `5173` (All microservice ports 3000 & 8000 deleted)  
**Host Binding:** `0.0.0.0:5173`

---

## 1. Quick Start: Access the App on Your Phone or Tablet

Your development machine is currently bound to **all network interfaces (`0.0.0.0`)** on **Port 5173**. Any device connected to the same Wi-Fi network can immediately access and test the full application.

### Your Network URLs:

| Device Type | URL to Open in Browser | Notes |
| :--- | :--- | :--- |
| **This Laptop / Host PC** | `http://localhost:5173/` | Local access |
| **Your Mobile Phone (Wi-Fi)** | `http://192.168.31.123:5173/` | Open in Safari, Chrome, or Firefox |
| **Tablet / Colleague Laptop** | `http://192.168.31.123:5173/` | Full multi-agent itinerary planning |

> **Note:** If your laptop reconnects to a different Wi-Fi router, run `scripts\start-lan.bat` or `npm run start:lan` to print your new LAN IP address automatically.

---

## 2. Launching the LAN Server

You have three convenient ways to launch the server with LAN sharing enabled:

### Option A: Using NPM (Recommended)
```bash
npm run start:lan
```
*This detects your active Wi-Fi IPv4 address, prints a network access banner, sets `HOST=0.0.0.0`, and launches the unified server on port 5173.*

### Option B: Windows One-Click Batch Script
Double-click:
```
scripts\start-lan.bat
```
*This opens a dedicated terminal window displaying your mobile sharing URL.*

### Option C: Standard Development Command
```bash
npm run dev
```
*The unified `server.js` automatically binds to `0.0.0.0:5173` by default.*

---

## 3. What Works Over the Local Network?

Everything that runs on localhost works identically on your mobile phone or tablet over LAN:

1. **Full React 19 Frontend:**
   - Cinematic Gwalior Fort hero photography
   - Living heritage 4-chapter bento grid
   - 36 curated attractions with filters and search
   - Interactive Planning Studio with time slider (1 to 12 hours)
   - Dynamic Leaflet transit corridor map with turn-by-turn itinerary
   - 31-language selector (including Hindi, Bundeli, Urdu, English, French, etc.)
   - Web Audio Tanpura classical raag drone ambience
2. **LangGraph.js 6-Agent AI Execution:**
   - Manager Agent, Research Agent, Route Agent, Verification Agent, Itinerary Agent, Response Agent
   - In-process mathematical knapsack with +25% transit safety buffer
3. **Tansen AI Concierge:**
   - Conversational AI powered by Gemini API
   - Instant itinerary adjustments and monument history
4. **Touch-Optimized Mobile Experience:**
   - Desktop custom cursor is automatically disabled on touch screens (`pointer: coarse`)
   - Native smooth scrolling and touch gesture response
   - Full responsive layout with zero horizontal overflow

---

## 4. Troubleshooting Windows Firewall & Network Settings

If your phone says **"Site can't be reached"** or **"Connection timed out"**:

### Step 1: Ensure Devices Are on the Same Wi-Fi
- Make sure your mobile phone is connected to the exact same Wi-Fi network (SSID) as your laptop.
- Ensure your phone is not using Cellular Mobile Data (4G/5G) for local addresses.

### Step 2: Allow Port 5173 Through Windows Defender Firewall
If Windows Firewall blocks incoming connections to Port 5173, open PowerShell as Administrator and run:
```powershell
New-NetFirewallRule -DisplayName "Beyond the Fort Port 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Step 3: Check Wi-Fi Profile Type (Private vs. Public)
Windows sometimes blocks inbound connections if your Wi-Fi is marked as "Public network".
1. Open Windows **Settings > Network & Internet > Wi-Fi**.
2. Click your connected Wi-Fi network.
3. Under **Network profile type**, select **Private network** (home or work).

### Step 4: Router AP Isolation (Rare)
Some college or corporate guest Wi-Fi networks enable "Client Isolation" / "AP Isolation", which prevents devices on the Wi-Fi from talking to each other. If this occurs, enable your mobile hotspot on your phone, connect your laptop to the hotspot, and use the hotspot gateway IP.

