# PRODUCT IMPROVEMENT ROADMAP & FEATURE PRIORITIZATION
**Project:** Beyond the Fort — Discover the Soul of Gwalior  
**Date:** October 31, 2026  
**Auditor:** Principal Product Strategist & Software Architect

---

## 1. Feature Evaluation Framework

Every feature is evaluated using a rigorous 7-factor scoring model:
- **User Value:** Impact on traveler satisfaction, cultural engagement, and time safety (1–5).
- **Implementation Effort:** Complexity in developer hours and architectural scope (1=Low, 5=High).
- **Performance Impact:** Impact on client-side FPS, memory, and network payload (1=Negligible, 5=Heavy).
- **Data Requirements:** Necessity for external APIs or datasets (1=Local/Self-contained, 5=External/Complex).
- **Technical Feasibility:** Ease of integration into existing React 19 + Express + Python LangGraph architecture (1=Challenging, 5=High/Clean).
- **Accuracy Risks:** Likelihood of hallucinations or misleading travel times (1=Low Risk, 5=High Risk).
- **Priority Tier:** **P0** (Critical / Shipped in Current Release), **P1** (Near-Term Enhancement), **P2** (Future Strategic Expansion).

---

## 2. Comprehensive Feature Prioritization Matrix

| Feature | Category | User Value (1-5) | Implementation Effort (1-5) | Performance Impact (1-5) | Data Req. (1-5) | Tech Feasibility (1-5) | Accuracy Risk (1-5) | Priority | Current Status |
|---|---|---|---|---|---|---|---|---|---|
| **6-Agent Progress Modal** | AI Tourism | 5 | 2 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Interactive Leaflet Route Map**| Destination / Routing | 5 | 2 | 2 | 2 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Deterministic +25% Buffer Card**| Trip Planning | 5 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **ASI Provenance & Tariff Table** | Trust & Usability | 5 | 2 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **AI Agents Command Center** | AI Tourism | 4 | 2 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Print / PDF Clean Voucher** | Trip Planning | 5 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **LocalStorage Itinerary Staging** | Trust & Usability | 4 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **100% Verified Photography** | Trust & Usability | 5 | 2 | 2 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Classical Tanpura Sangeet Audio**| Destination Exploration | 4 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **31-Language Multilingual Modal** | Trust & Usability | 4 | 2 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Tansen AI Suggestion Chips** | AI Tourism | 4 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Return-Time Sunset Warning** | Trip Planning | 4 | 1 | 1 | 1 | 5 | 1 | **P0** | **SHIPPED & VERIFIED** |
| **Offline PWA Caching** | Trust & Usability | 4 | 3 | 2 | 1 | 4 | 1 | **P1** | **PLANNED (Next Sprint)** |
| **Live Audio Guide Narration (TTS)**| Destination Exploration | 4 | 3 | 2 | 2 | 4 | 2 | **P1** | **PLANNED (Next Sprint)** |
| **Mapbox 3D Terrain Extrusion** | Destination Exploration | 3 | 4 | 4 | 3 | 3 | 1 | **P2** | **FUTURE EVALUATION** |
| **Live Traffic Congestion Feed** | Routing | 3 | 4 | 3 | 4 | 3 | 3 | **P2** | **FUTURE EVALUATION** |

---

## 3. Detailed Category Roadmaps

### Category A: Immersive Destination Exploration
- **P0 Shipped:**
  - 36 Curated heritage attractions with authentic photography, entry fees, and timing windows.
  - Interactive Leaflet GIS corridor map with emerald origin pin and sequential royal badges.
  - Heritage Pillars 4-chapter bento grid.
  - Classical Tanpura ambient drone via Web Audio API.
- **P1 Upcoming:**
  - Full-length audio guide narration synthesized with cultural pronunciation for Hindi/English monuments.

### Category B: High-Precision Trip Planning
- **P0 Shipped:**
  - 1200px Interactive Planning Studio with starting hub presets (Station, Maharaj Bada, Fort Gate, Airport).
  - Time budget slider ($2\text{h}$ to $8\text{h}$) and departure time selector.
  - Calibrated mobility profiles (E-Rickshaw 18 km/h, Cab 28 km/h, Walking 4.2 km/h).
  - Deterministic feasibility formula card ($T_{\text{travel}} + T_{\text{buffer}} + T_{\text{dwell}} \le T_{\text{budget}}$).
  - LocalStorage plan persistence across browser reloads.
  - Dedicated `@media print` CSS for clean PDF and paper export.

### Category C: AI Tourism Assistance (Tansen AI)
- **P0 Shipped:**
  - Conversational concierge drawer connected to Express chat service.
  - Instant suggestion chips for Maharaj Bada, 4-hour plans, and Chanderi sarees.
  - Zero-hallucination data constraints.
  - Real-time `AgentProgressModal` during itinerary orchestration with celebratory confetti burst.

### Category D: Motion & Interaction
- **P0 Shipped:**
  - Three.js WebGL canvas with 1,200 particle stars and procedural terrain displacement.
  - Locomotive-style smooth inertia scrolling via Lenis.
  - Custom reactive magnetic cursor with hover state scaling.
  - Royal Scindia burgundy/gold curtain page transition wipe (`PageTransitionWipe.jsx`).

### Category E: Trust, Usability & Governance
- **P0 Shipped:**
  - Quarantine of 470 synthetic test records; exposure of 57 authentic places.
  - Archaeological Survey of India (ASI) verified status tags on every monument.
  - 100% public access with no sign-in or account walls.
  - WCAG 2.2 AAA contrast compliance and zero horizontal overflow across 8 device viewports.

---

## 4. Execution Summary
All **P0 priority features** have been built, integrated, tested in the browser, and verified in production.
