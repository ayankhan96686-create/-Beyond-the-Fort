# Agent Execution Report

Audit date: 2026-10-30. Source: `multiagent-engine/graph.py` and `multiagent-engine/agents/*.py`.

## Graph registration and transitions

`build_tourism_multiagent_graph()` registers six Python functions and compiles a LangGraph state machine. These are distinct deterministic workflow roles, not six independent LLM agents.

```mermaid
flowchart TD
    S([START]) --> M[manager_node]
    M -->|missing or invalid fields| RSP[response_node]
    M -->|valid constraints| R[research_node]
    M -->|direct_route_only| RT[route_node]
    R -->|no candidates and no direct route| RSP
    R -->|candidate(s) or explicit direct route| RT[route_node]
    RT -->|provider_error| RSP
    RT -->|routes available| V[verification_node]
    V --> I[itinerary_node]
    I -->|feasible or infeasible| RSP
    RSP --> E([END])
```

## Roles and evidence

| Role | Source / function | Input and actual operation | Output/state update and dependencies | Graph registration / entry; tests run | Status |
| --- | --- | --- | --- | --- | --- |
| Manager / Planner | `agents/manager.py:manager_node`, `_normalize_location` | Raw request; validates start/end coordinate ranges and source, return-to-start behavior, date/time/duration/budget/companion and interests. | Normalized endpoints, legacy alias, `return_to_start`, constraints and missing fields. No DB/provider/LLM. | Registered as `manager`; entry from START. Covered by missing-field, invalid-constraint, coordinate and return-to-start tests. | PASS |
| Research | `agents/research.py:research_node`, `load_curated_dataset` | Normalized city/interests; reads the 12-row curated JSON plus 179-row supplemental Apify export; matches terms/categories, excludes placeholders, caps at six. | `candidates`, warnings, trace text; preserves IDs, source labels and image credits. No DB or LLM. | Registered as `research`; entered only for valid manager constraints. Covered by exact-match/category, no-match, and dataset-read-failure tests. | PASS |
| Route & Time | `agents/route_agent.py:route_node`, `_provider_estimate` | Selected start, candidate points, destination and mode; requests each direction between route nodes using Mapbox or configured JSON POST adapter; synthetic Haversine estimates only under explicit demo mode. | Directed legs with endpoint IDs/labels, provider geometry and retrieval metadata, calls/warnings/errors. Missing coordinates/provider failures fail closed. | Registered as `route`; entered with candidates or explicit direct route. Covered by full-leg fixture, missing-provider, timeout/missing-coordinate, malformed-value and Mapbox adapter tests. | PASS |
| Verification / Provenance | `agents/verification.py:verification_node` | Candidate source/status metadata and route results; place records are not promoted on a label or URL alone; provider-returned route estimates retain their source classification. | `evidence` entries with claim type, classification, source and verification boolean. No external source fetch. | Registered as `verification`; entered after successful routing. Covered by absent-source, URL-only, and reference-only regression cases. | PASS |
| Itinerary & Optimization | `agents/itinerary_agent.py:itinerary_node` | Candidates, selected endpoints, directed legs, start/deadline/window/budget; searches up to three stops and checks initial/inter-stop/final travel, known hours/cost, dwell, 25% buffer and destination deadline. | Ordered stops and `route_legs`, arrival/return estimate, totals, rejections/status; supports explicitly requested direct route. No LLM. | Registered as `itinerary`; entered after verification. Covered by full route-chain, late-final-leg, deadline, cost and feasible fixture tests. | PASS |
| Final Response | `agents/response_agent.py:response_node` | Final shared graph state. | Stable response with status, summary, stops, route estimates, evidence, rejections, warnings/errors, deadline, return time, and trace. Does not convert failure into success. | Registered as `response`; reached from missing-input, no-match, route-error, and itinerary outcomes. Covered by response-schema/status tests and the six-node live plan. | PASS |

## Executed trace

After restarting the services from the final source, a live request was sent through `POST http://127.0.0.1:3001/api/v1/tourism-plan` to Flask/LangGraph with Mapbox configured and `companion=group`. The response was HTTP 200 / `feasible`, preserved `companion=group`, had one stop, and estimated return 12:15 before 19:00. Trace order was `manager → research → route → verification → itinerary → response`; route recorded 2 external calls; research recorded 1 dataset read; every node recorded `llm_calls: 0`. The two Mapbox directions used `mapbox_driving`.

Separate tests exercised the missing-input, no-match, provider-error, data-load failure, and infeasible branches. Development responses include `execution_trace`; production responses omit that field. See [TESTING_AND_REPAIR_LOG.md](TESTING_AND_REPAIR_LOG.md) for exact commands.

## Scope limitations

- Research is local JSON search, not database retrieval or live web search.
- The planner graph does not call Gemini. Gemini is used only by the separate Express intent/legacy feasibility paths and fell back during the live integration test.
- Place source URLs and `verification_status` values are metadata; no process validates the source contents or audit history.
- Budget filtering is deterministic, but the current files have no prices, so a budget request rejects records with unknown costs.
- The active planner supports one-time geolocation, map pins and manual coordinates. No address geocoder is configured; typed labels remain unresolved until coordinates are selected or entered.
