# Testing Strategy & Automated Test Suite Verification

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Status:** **82 / 82 Tests Passing (100% Success)**  

---

## 1. Test Execution Commands

```bash
# Run Node.js Test Suite (24 tests)
npm test

# Run Python Multi-Agent Test Suite (58 tests)
cd multiagent-engine
..\.venv\Scripts\pytest -v
```

---

## 2. Test Suite Breakdown

### A. Node.js Core Suite (`npm test` — 24 Tests Passing)
1. **Mathematical Feasibility Inequality:** Validates that candidates satisfy $\sum D_i + \sum T_t + B \le T_a$.
2. **25% Safety Buffer Enforcement:** Confirms mandatory 25% transit buffer calculation.
3. **Temporal Candidate Pruning:** Ensures candidates exceeding time budget are strictly eliminated.
4. **Transit Outage Fallback:** Validates unverified badge attribution when transit APIs fail.
5. **Request Sanitization:** Rejects malformed JSON and out-of-boundary parameters (HTTP 400).
6. **Multilingual Query Normalization:** Validates intent extraction across Hindi, Hinglish, and English.
7. **Curated Dataset Integrity:** Audits that the pilot dataset contains at least 12 audited Gwalior POIs.
8. **Express-to-LangGraph Contract Bridge:** Validates payload normalization forwarding to Python.
9. **Error Handling & Exception Masking:** Verifies stack traces and provider secrets are never leaked.
10. **Stable ID Attraction Routing:** Verifies `/attractions/:id` and `/itinerary` render correct data.
11. **Session & History Isolation:** Verifies chat history does not leak across sessions.
12. **Chat Fail-Safe & Suggestion Chips:** Validates that chat surfaces grounded data or sanitized guidance without fake success.
13. **Itinerary & Leaflet Map Action Contracts:** Verifies stable POI IDs and interactive map action links.
14. **Agent Progress Animation Timing:** Validates 1-second boundary progress UI and cancellation cleanup.
15. **Localization Catalogs (15 Indian + 6 International):** Validates all 21 language catalogs.
16. **Bi-Directional RTL/LTR Switching:** Validates RTL layout enforcement for Urdu and Arabic.
17. **Shared Navbar & Client Integration:** Ensures all pages include standard navigation and locale selector.
18. **Scrypt Password Hashing & Authentication:** Validates 64-byte salt-hashed password security.
19. **Double-Submit CSRF Protection:** Rejects mutating requests missing valid `x-csrf-token`.
20. **IDOR / BOLA Authorization:** Verifies users cannot read or delete other users' saved itineraries.
21. **Brute-Force Account Lockout:** Locks account for 15 minutes after 5 consecutive failed logins.
22. **RBAC & Role Privilege Escalation Prevention:** Prevents users from promoting their own roles.
23. **Security Headers & CSP:** Enforces `nosniff`, `DENY`, and script-src `'self'` with no external CDN dependencies.
24. **Input Boundary Enforcement:** Caps search queries at 1,000 characters and validates minutes.

### B. Python Multi-Agent Suite (`pytest` — 58 Tests Passing)
- **Agent Roles (11 tests):** Unit tests covering `Manager`, `Research`, `Route & Time`, `Verification`, `Itinerary & Optimization`, and `Final Response` agents.
- **Server Security & Auth (3 tests):** HMAC bearer token enforcement in production, payload size limits, and health checks.
- **Tourism Workflow & Graph Invariants (43 tests):** Validates graph state transitions, Mapbox API routing, Haversine spatial math, opening hour boundary enforcement, and execution trace formatting.
- **Gemini Integration Probe (1 test):** Probes live Google Gemini API intent extraction with active API key, verifying live LLM response without heuristic fallback.

---

## 3. Test Verification Summary

```
======================================================================
  NODE.JS TEST SUITE:    24 passed, 0 failed, 0 skipped (5.8s)
  PYTHON TEST SUITE:     58 passed, 0 failed, 0 skipped (60.8s)
  TOTAL TEST COVERAGE:   82 PASSED / 82 TOTAL (100% PASS RATE)
======================================================================
```
