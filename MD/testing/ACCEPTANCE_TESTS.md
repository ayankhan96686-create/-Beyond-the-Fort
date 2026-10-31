# Acceptance Tests

## Commands

Run from the repository root:

```powershell
node --test tests/acceptanceTests.test.js
.\.venv\Scripts\python.exe -m pytest -q .\multiagent-engine -m "not integration"
```

Use `npm test` as the Node wrapper when the system npm cache drive has free space. The separate `integration` marker makes a live Gemini call; it is not part of the deterministic local suite.

## Coverage

Node checks the deterministic feasibility math, input schema, local dataset path, LangGraph bridge mapping and failure response, malformed Express JSON, plus itinerary and attraction routes. Python checks manager validation, exact dataset matching, data failure, routing-provider absence/timeout/malformed estimates/missing coordinates, provenance, budget and deadline constraints, response schema, conditional graph branches, six-node trace, and production trace suppression.

## Current results

As of 2026-10-30, `node --test tests/acceptanceTests.test.js` passed 11/11. The final local Python run passed 48 tests with one live-provider test deselected (13 upstream LangSmith deprecation warnings). See [docs/TESTING_AND_REPAIR_LOG.md](docs/TESTING_AND_REPAIR_LOG.md) for exact outcomes, including the Gemini integration failure and npm disk-space block.

The active data has no known prices, so a real budget-constrained attraction plan cannot be proven feasible. Deterministic fixture tests cover both a known price inside budget and a known price over budget.
