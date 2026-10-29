# Same start and return destination failure — 2026-10-30

## Symptom

Submitting an itinerary with “Return to my starting point” returned “Tourism planning service unavailable.” Both the Express app on port 3001 and LangGraph API on port 8000 were healthy.

## Root cause

The browser sends the same coordinates for `start_location` and `end_location` when returning to the start. The route agent treated those as distinct nodes and requested both directions from Mapbox. Mapbox cannot provide a positive travel duration for identical coordinates; those failed legs marked the entire plan `provider_error`. The Node bridge then returned a generic unavailable message for the workflow’s HTTP 503.

## Fix

`multiagent-engine/agents/route_agent.py` now detects exactly identical endpoint coordinates and creates an explicit derived zero-distance, zero-minute route without an external provider call. Provider call counts exclude that derived leg. A regression test asserts the provider is not called and that the direct itinerary remains feasible.

## Verification

- Reproduced the original error through the running service: route trace failed only on the identical `origin -> destination` and `destination -> origin` legs.
- Restarted the LangGraph API to load the fix and sent a real test request through Express to the live workflow. It returned `feasible`, 2 stops, 3 route legs, and all 6 agent trace entries; no errors.
- Python non-integration suite: 54 passed.
- Node acceptance and animation suite: 18 passed.
- Live Gemini integration is separate from itinerary routing and has previously returned the deterministic fallback; see its integration test result.

No credential values or user location data were recorded.
