# AI Agent Security & LLM Governance

**Project:** Beyond the Fort — Time-Aware Digital Discoverability, Gwalior  
**Team:** Team Venator (ID: 60358412) | AI Synergy Hackathon 2026  
**Status:** Production Verified  

---

## 1. System Topology & Threat Boundaries

The AI subsystem consists of two strictly segregated layers:
1. **Deterministic Multi-Agent Planning Engine (Python LangGraph):**
   - The 6 planning agents (`Manager`, `Research`, `Route & Time`, `Verification`, `Itinerary & Optimization`, `Response`) **make zero LLM calls**.
   - All itinerary calculations are governed by strict mathematical inequality equations and spatial geometry.
   - Eliminates AI hallucination of venues, opening hours, coordinates, or travel durations.
2. **Generative Natural Language Subsystem (Google Gemini 3.5 Flash in Node.js):**
   - Interprets natural language queries into structured JSON tokens (`extractIntent`).
   - Answers conversational cultural questions (`answerTourismQuestion`) grounded strictly in verified attraction records.

---

## 2. Implemented Security Controls

- **Prompt Injection Defense & Boundary Isolation:**
  - Chat text is bounded at 2,000 characters; payload size limit is 16 KiB.
  - Generative model system instructions strictly restrict responses to supplied attraction records.
  - User prompts cannot alter the state graph or manipulate agent execution order.
- **Data Minimization in Prompts:**
  - Gemini receives only sanitized projections of attraction records (`id`, `name`, `category`, `description`, `address`, `operating_hours`, `dwell_time`, `verification_status`).
  - Passwords, user IDs, session tokens, and coordinate histories are strictly excluded from prompts.
- **Candidate Model Cascade & Rate-Limit Resilience:**
  - Operates a 4-tier model failover chain (`gemini-3.5-flash` -> `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-flash-lite-latest`).
  - If a model encounters a 429 quota exhaustion or transient 503 error, the system automatically cascades without exposing errors to the user.
- **Authoritative Curated Knowledge Fallback (Zero-Hallucination Fallback):**
  - If external cloud APIs are unavailable, queries are resolved by an in-process knowledge synthesizer grounded directly in the 12 audited Gwalior POIs.
- **Inter-Service Authentication:**
  - In production (`NODE_ENV=production`), communication between Node.js and the Python Flask LangGraph service enforces HMAC SHA-256 Bearer Token validation (`LANGGRAPH_SERVICE_TOKEN` $\ge 32$ characters).
  - Diagnostic execution traces (`execution_trace`) are automatically stripped from API responses in production environments.
- **Credential Protection in Logs:**
  - All logs use structured JSON omitting `GEMINI_API_KEY`, `MONGODB_URI`, passwords, and user coordinates.

---

## 3. Residual Risk & Ongoing Mitigations

- **Generative Text Variability:** While model instructions forbid inventing facts, LLMs are fundamentally non-deterministic. The presence of the local curated fallback provides an immutable factual baseline.
- **Adversarial Jailbreaking:** System instructions mandate grounded answers, but external content moderation filters (e.g. Perspective API / Google Cloud Moderation API) can be added for high-traffic enterprise scaling.
