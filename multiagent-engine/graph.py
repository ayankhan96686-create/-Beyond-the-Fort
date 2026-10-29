import logging
import json
import time
from datetime import datetime, timezone
from langgraph.graph import StateGraph, START, END
from state import TourismAgentState
from agents.manager import manager_node
from agents.research import research_node
from agents.route_agent import route_node
from agents.verification import verification_node
from agents.itinerary_agent import itinerary_node
from agents.response_agent import response_node

log = logging.getLogger(__name__)

def _instrument(name, fn):
    def run(state):
        started = time.perf_counter()
        req_id = state.get("request_id", "unknown")
        before = {"candidate_count": len(state.get("candidates", [])), "route_count": len(state.get("routes", {}))}
        log.info(json.dumps({"event":"agent.start", "request_id":req_id, "agent":name, "input_summary":before}, separators=(",", ":")))
        try:
            result = fn(state)
            elapsed = round((time.perf_counter() - started) * 1000, 2)
            summary = {"candidate_count":len(result.get("candidates", state.get("candidates", []))),
                       "route_count":len(result.get("routes", state.get("routes", {}))),
                       "evidence_count":len(result.get("evidence", state.get("evidence", []))),
                       "stop_count":len(result.get("itinerary", state.get("itinerary", []))),
                       "status":result.get("status", state.get("status"))}
            entry = {"agent":name, "status":"completed", "duration_ms":elapsed, "summary":summary,
                     "provider_calls": (result.get("provider_call_count", 0) if name == "route" else 0),
                     "llm_calls":0, "dataset_reads": (1 if name == "research" else 0),
                     "timestamp":datetime.now(timezone.utc).isoformat()}
            trace = list(state.get("execution_trace", [])); trace.append(entry)
            log.info(json.dumps({"event":"agent.complete", "request_id":req_id, **entry}, separators=(",", ":")))
            return {**result, "execution_trace":trace}
        except Exception as exc:
            elapsed = round((time.perf_counter() - started) * 1000, 2)
            log.error(json.dumps({"event":"agent.error", "request_id":req_id, "agent":name,
                                  "duration_ms":elapsed, "error_type":type(exc).__name__}, separators=(",", ":")))
            raise
    return run

def next_after_manager(s: TourismAgentState) -> str:
    return "response" if s.get("missing_fields") else "route" if s.get("constraints", {}).get("direct_route_only") else "research"
def next_after_research(s: TourismAgentState) -> str:
    return "route" if s.get("candidates") or s.get("constraints", {}).get("direct_route_only") else "response"
def next_after_route(s: TourismAgentState) -> str:
    return "response" if s.get("status") == "provider_error" else "verification"
def next_after_itinerary(s: TourismAgentState) -> str:
    return "infeasible" if s.get("status") == "infeasible" else "response"

def build_tourism_multiagent_graph():
    g = StateGraph(TourismAgentState)
    for name, fn in [("manager", manager_node), ("research", research_node), ("route", route_node),
                     ("verification", verification_node), ("itinerary", itinerary_node), ("response", response_node)]:
        g.add_node(name, _instrument(name, fn))
    g.add_edge(START, "manager")
    g.add_conditional_edges("manager", next_after_manager, {"response":"response", "research":"research", "route":"route"})
    g.add_conditional_edges("research", next_after_research, {"response":"response", "route":"route"})
    g.add_conditional_edges("route", next_after_route, {"response":"response", "verification":"verification"})
    g.add_edge("verification", "itinerary")
    g.add_conditional_edges("itinerary", next_after_itinerary, {"response":"response", "infeasible":"response"})
    g.add_edge("response", END)
    return g.compile()

tourism_graph = build_tourism_multiagent_graph()


