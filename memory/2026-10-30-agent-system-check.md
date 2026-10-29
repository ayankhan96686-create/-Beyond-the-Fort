# Agent system check — 2026-10-30

> Historical check from before this backend audit. Provider and agent observations are superseded by [docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md) and [docs/TESTING_AND_REPAIR_LOG.md](../docs/TESTING_AND_REPAIR_LOG.md).

## Result

- Node acceptance suite: 9 passed, 0 failed.
- Python workflow suite: 33 passed, 1 failed. The one failure is the live Gemini-provider integration assertion: the request returned the deterministic fallback. The service logs only a generic error type, so the specific provider cause is not established.
- Express health (`:3000`) and LangGraph health (`:8000`): healthy.
- Restarted the stale LangGraph process so it loaded the current supplemental dataset; `/attractions` then returned 191 records (12 curated plus 179 imported).
- Live `POST /api/v1/tourism-plan` through Express to LangGraph: HTTP 200, `feasible`, no errors. Manager, Research, Route, Verification, Itinerary, and Response all completed. It used 21 route pairs / 42 directed route estimates from Mapbox and returned three stops: Jai Vilas Palace (10:12), HH Maharaja Sir Jiwajirao Scindia Museum (10:43), and Government Museum (11:17).
- Imported listing evidence remained `UNVERIFIED`; 30-minute dwell values remained labeled as heuristic defaults. Opening hours were warned as scraped/unverified.

## Note

The six LangGraph workflow agents are working end to end. Gemini intent extraction is separate; its deterministic fallback works, but its live provider integration did not pass in this run. No credential values were recorded here.
