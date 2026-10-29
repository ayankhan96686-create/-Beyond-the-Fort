# Agent Test Results

> Historical snapshot from 2026-10-29. Use [docs/TESTING_AND_REPAIR_LOG.md](docs/TESTING_AND_REPAIR_LOG.md) for current test and provider results.

Run date: 2026-10-29

- Node acceptance suite: **PASS** — 8 passed, 0 failed (`npm test`).
- Pytest: **PARTIAL** — 26 local tests passed; configured Gemini integration failed (`.venv\\Scripts\\python.exe -m pytest -q multiagent-engine`).
- Failing test: configured Gemini integration. The provider call used the deterministic heuristic fallback; sanitized details are insufficient to identify why. The test intentionally fails so the live provider is not represented as working.
- Full valid LangGraph path: **PASS** — Manager → Research → Route → Verification → Itinerary → Response; six structured events; feasible itinerary respects the deadline and safety buffer.
- Missing-input, no-match, missing routing provider, unknown budget costs, invalid manager fields, provider-error preservation, stable response shape, and production trace omission: **PASS**.
- Google Distance Matrix live call: **NOT RUN**. Its key is configured, but the call is not made as part of the suite to avoid an unrequested billable/quota-consuming provider request. The code path now performs validated outbound/return calls and safely degrades to an unverified estimate.
- Routing provider: **NOT CONFIGURED** (`ROUTING_PROVIDER_URL` absent); live routing cannot be tested. Non-demo mode returns `provider_error` as designed.
- MongoDB: **NOT AVAILABLE** (no client/adapter in dependencies); local curated JSON is the data source.

See [AGENT_TEST_REPORT.md](AGENT_TEST_REPORT.md) for scope, changed behavior, data limitations, and run instructions. No secret values were written to either report.

