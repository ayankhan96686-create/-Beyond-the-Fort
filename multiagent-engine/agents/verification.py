import logging
from typing import Any
from state import TourismAgentState

log=logging.getLogger(__name__)

def verification_node(state: TourismAgentState) -> dict[str, Any]:
    """Contract: source-bearing candidates and provider metadata -> evidence labels; absent sources never become verified."""
    evidence=[]
    for poi in state.get("candidates",[]):
        src=poi.get("source_url") or poi.get("source_reference")
        recorded=poi.get("verification_status")
        status_text = str(recorded or "").upper()
        # A recorded label or non-empty URL is not proof that anyone checked
        # the source. Place claims remain unverified until a source-checking
        # process can attach auditable evidence. Live route calls are classified
        # separately from the actual provider response below.
        cls = ("UNVERIFIED" if "UNVERIFIED" in status_text else
              "STAKEHOLDER_PROVIDED" if recorded or src else "AI_INFERENCE")
        for claim,value in (("attraction_record",poi.get("name")),("visit_duration_minutes",poi.get("min_dwell_time_mins")),("opening_hours",poi.get("operating_hours"))):
            if value is None: continue
            claim_class = "AI_INFERENCE" if claim == "visit_duration_minutes" and poi.get("duration_estimate_type") == "heuristic_default" else cls
            evidence.append({"claim":f"{claim}: {value}","claim_type":claim,"classification":claim_class,"source":src,"record_id":poi.get("id"),"verified":claim_class=="VERIFIED"})
    for leg,route in state.get("routes",{}).items():
        evidence.append({"claim":f"Route {leg}: {route['distance_km']} km, {route['duration_minutes']} min","claim_type":"travel_estimate","classification":route.get("source_class","AI_INFERENCE"),"source":route.get("provider"),"retrieved_at":route.get("retrieved_at"),"verified":route.get("source_class")=="VERIFIED"})
    trace=list(state.get("agent_trace",[])); trace.append(f"[Verification] Classified {len(evidence)} claims; missing source metadata remains unverified")
    log.info("verification evidence=%d",len(evidence))
    return {"evidence":evidence,"agent_trace":trace}
