# Chatbot Test Report

Date: 2026-10-30

## Implementation under test

The chat page is served by Express/EJS at `/chat`. Ordinary questions use the configured Gemini SDK with curated record context. Planning messages use Express → Flask/LangGraph. Session history is in memory, and route/itinerary results reuse the existing planner records and itinerary page.

## Results

| Check | Status | Evidence / scope |
| --- | --- | --- |
| Empty/invalid message and message length limit | PASS | Express acceptance tests; empty request is 400 and 2,001 characters is 413. |
| Conversation history and session isolation | PASS | Mocked Gemini test verifies same cookie retains turns and a new cookie has no history. |
| Itinerary planning dispatch | PASS | Mocked planner bridge receives a planning request; missing start location is surfaced as `needs_input`. |
| Gemini failure response | PASS | Mocked failure returns 503 `provider_error`, without a success reply. |
| Planner/agent failure response | PASS | Mocked planner failure returns 503 with `result: null`. |
| Chat page and navigation target | PASS | Acceptance test fetches `/chat`; navigation links from the active EJS pages point to it. |
| Planner result actions and stable IDs | PASS | Mock planner response retains `poi_gwl_001`; API returns `/itinerary` and `/itinerary#tripMap` actions. |
| Node acceptance suite | PASS | `node --test tests/acceptanceTests.test.js`: 14 passed, 0 failed. |
| Existing planner suite | PASS | `pytest -q multiagent-engine -m "not integration"`: 53 passed, 1 integration test deselected. |
| Responsive layout | PARTIAL PASS | A live preview at the current narrow in-app browser width showed the single-column chat, touch-sized controls, and scrollable suggestion row. CSS includes responsive desktop/mobile rules, safe areas, scrollable history, sticky composer and 16px mobile text input; a controlled desktop viewport and keyboard-overlay test were not run. |
| Geolocation permission denial | IMPLEMENTED, browser permission automation pending | Location is requested only after a button click; denial/unavailable states ask the visitor to enter coordinates. |
| Live Gemini response | INTERMITTENT / FAILING ON RETRY | Key check returned HTTP 200 and the configured model was listed. One direct grounded answer took 38.3 seconds, but a real chat-page retry exceeded the 60-second server limit. The page now states that timeout explicitly. |
| Live multi-stop chat itinerary | NOT RUN | Existing direct live Mapbox and planner checks are recorded in the general repair log; this chat change was verified with a mocked planner bridge. |
| Public deployment / HTTPS | NOT RUN | No deployment configuration or hosting target exists in the repository. |

## Commands

Run `node --test tests/acceptanceTests.test.js` for the Express suite. Run `.venv\Scripts\python.exe -m pytest -q multiagent-engine -m "not integration"` for deterministic planner tests. Run the live Gemini integration only when provider access/quota are available; it may incur provider usage. See [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md) for the separate planner and provider results.
