import logging
from typing import Any
from state import TourismAgentState
log=logging.getLogger(__name__)

def response_node(state: TourismAgentState) -> dict[str, Any]:
    """Contract: terminal shared state -> stable JSON response; it never upgrades an unsuccessful status."""
    status=state.get("status") or ("infeasible" if not state.get("itinerary") else "feasible")
    if state.get("missing_fields"): status="needs_input"
    if state.get("errors") and status != "needs_input": status="provider_error"
    if not state.get("itinerary") and status == "feasible" and not state.get("direct_route_feasible"): status="infeasible"
    c=state.get("constraints",{})
    response={"status":status,"trip_summary":{"city":c.get("city"),"date":c.get("date"),"start_time":c.get("start_time"),"return_location":c.get("return_location"),"transport_mode":c.get("transport_mode"),"companion":c.get("companion"),"interests":c.get("interests"),"budget":c.get("budget"),"estimated_cost":state.get("total_cost")},"start_location":c.get("start_location"),"end_location":c.get("end_location"),"return_to_start":c.get("return_to_start",False),"itinerary_stops":state.get("itinerary",[]),"route_legs":state.get("ordered_route_legs",[]),"travel_estimates":[{"leg":k,**v} for k,v in state.get("routes",{}).items()],"total_distance_km":state.get("total_distance_km"),"total_travel_minutes":state.get("total_travel_minutes"),"total_visit_minutes":state.get("total_visit_minutes"),"safety_buffer_minutes":state.get("safety_buffer_minutes"),"estimated_arrival_time":state.get("estimated_arrival_time"),"evidence":state.get("evidence",[]),"rejected_options":state.get("rejected_options",[]),"warnings":state.get("warnings",[]),"errors":state.get("errors",[]),"missing_fields":state.get("missing_fields",[]),"estimated_return_time":state.get("estimated_return_time"),"deadline":c.get("deadline"),"agent_trace":state.get("agent_trace",[])}
    log.info("response status=%s stops=%d",status,len(response["itinerary_stops"]))
    final_trace=state.get("agent_trace",[])+["[Response] Formatted validated JSON without changing feasibility status"]
    response["agent_trace"]=final_trace
    return {"response":response,"status":status,"agent_trace":final_trace}


