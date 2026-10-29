# System Architecture

The active planning path is **browser → Express REST API → Flask → compiled LangGraph → JSON response**. The six Python nodes are deterministic functions; they are not separate LLM calls. Route [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the current Mermaid graph and [docs/AGENT_EXECUTION_REPORT.md](docs/AGENT_EXECUTION_REPORT.md) for node-by-node evidence.

Express also retains a separate legacy feasibility path and a separate Gemini intent parser. The planner reads local curated and supplemental JSON data, and calls Mapbox Directions when configured. The app has no MongoDB adapter; n8n is not part of the active request path. Synthetic routes require explicit `DEMO_MODE=true` and are not labeled as live results.
