import logging, math
from datetime import datetime, timedelta
from typing import Any
from state import TourismAgentState

log=logging.getLogger(__name__)
BUFFER_RATIO=0.25

def _minutes(t: str) -> int: return int(t[:2])*60+int(t[3:])
def _clock(m: int) -> str: return f"{(m//60)%24:02d}:{m%60:02d}"
def _known_hours_fit(p: dict, arrival: int, leave: int) -> bool:
    hours=p.get("operating_hours") or {}
    # Imported listings may contain scraped day/hour rows rather than the verified
    # normalized {open, close} shape; keep them as evidence, not as a hard constraint.
    if not isinstance(hours, dict): return True
    if not hours.get("open") or not hours.get("close"): return True
    try: return arrival >= _minutes(hours["open"]) and leave <= _minutes(hours["close"])
    except (ValueError,TypeError): return False

def itinerary_node(state: TourismAgentState) -> dict[str, Any]:
    """Contract: verified candidates/routes/constraints -> deterministic feasible sequence or explicit infeasibility."""
    c=state.get("constraints",{}); candidates=state.get("candidates",[]); routes=state.get("routes",{}); destination_id="destination" if c.get("end_location") else "origin"
    start=_minutes(c["start_time"]); deadline=_minutes(c["deadline"])
    window=min(int(c["available_minutes"]), deadline-start)
    budget=c.get("budget"); rejected=list(state.get("rejected_options",[])); best=[]; best_cost=None
    def search(current_id: str, now: int, path: list[dict], cost: float, visited: set[str]):
        nonlocal best,best_cost
        return_leg=routes.get(f"{current_id}->{destination_id}")
        if path and return_leg:
            transit_back=int(return_leg["duration_minutes"]); total_elapsed=now-start+transit_back
            buffer=math.ceil(BUFFER_RATIO*total_elapsed); guaranteed=now+transit_back+buffer
            if total_elapsed+buffer<=window and guaranteed<=deadline and (best_cost is None or (len(path),-total_elapsed)>(len(best),-best_cost)):
                best=list(path); best_cost=total_elapsed
        if len(path)>=3: return
        for p in candidates:
            pid=p["id"]
            if pid in visited: continue
            leg=routes.get(f"{current_id}->{pid}")
            if not leg: continue
            price=p.get("cost_estimate")
            if budget is not None and (price is None or float(price)>float(budget)-cost):
                rejected.append({"poi_id":pid,"poi_name":p["name"],"reason":"Budget cannot be validated within the requested limit because the dataset cost is missing or exceeds the remaining budget." if price is None else "Known estimated cost exceeds remaining budget.","total_time_required_mins":None,"available_window_mins":window,"slack_mins":None}); continue
            arr=now+int(leg["duration_minutes"]); dwell=int(p["min_dwell_time_mins"]); dep=arr+dwell
            if not _known_hours_fit(p,arr,dep):
                rejected.append({"poi_id":pid,"poi_name":p["name"],"reason":"Visit would fall outside known opening hours.","total_time_required_mins":None,"available_window_mins":window,"slack_mins":None}); continue
            step={"sequence":len(path)+1,"poi_id":pid,"name":p["name"],"category":p.get("category"),"description":p.get("description"),"coordinates":p.get("coordinates"),"address":p.get("address"),"image_url":p.get("image_url"),"image_caption":p.get("image_caption"),"image_credit":p.get("image_credit"),"image_source_url":p.get("image_source_url"),"image_license":p.get("image_license"),"source_url":p.get("source_url"),"arrival_time":_clock(arr),"dwell_mins":dwell,"departure_time":_clock(dep),"transit_from_previous_mins":int(leg["duration_minutes"]),"distance_km":leg["distance_km"],"travel_mode":leg["mode"],"travel_provider":leg["provider"],"opening_hours":p.get("operating_hours"),"estimated_cost":price}
            search(pid,dep,path+[step],cost+(float(price) if price is not None else 0.0),visited|{pid})
    if candidates: search("origin",start,[],0.0,set())
    elif c.get("direct_route_only"):
        direct=routes.get("origin->destination")
        if direct:
            travel=int(direct["duration_minutes"]); elapsed=travel; buffer=math.ceil(BUFFER_RATIO*elapsed)
            if elapsed+buffer<=window and start+elapsed+buffer<=deadline:
                best=[]; best_cost=elapsed
            else:
                rejected.append({"poi_id":None,"poi_name":None,"reason":"The direct route exceeds the available time or return deadline after the safety buffer.","total_time_required_mins":elapsed+buffer,"available_window_mins":window,"slack_mins":window-(elapsed+buffer)})
    itinerary=best
    if not candidates and not c.get("direct_route_only"):
        rejected.append({"poi_id":None,"poi_name":None,"reason":"No matching non-placeholder attractions were found in the existing dataset.","total_time_required_mins":None,"available_window_mins":window,"slack_mins":None})
    if candidates and not best:
        for p in candidates:
            if not any(r.get("poi_id")==p.get("id") for r in rejected):
                rejected.append({"poi_id":p.get("id"),"poi_name":p.get("name"),"reason":"No ordering of this stop met the time window, known opening hours, return travel, and safety-buffer deadline constraints.","total_time_required_mins":None,"available_window_mins":window,"slack_mins":None})
    estimated_return=None; estimated_arrival=None; total_cost=None; buffer=0; direct_route_feasible=bool(c.get("direct_route_only") and not candidates and routes.get("origin->destination"))
    if itinerary or direct_route_feasible:
        if itinerary:
            last=itinerary[-1]; back=routes[f"{last['poi_id']}->{destination_id}"]; final_base=_minutes(last["departure_time"])+int(back["duration_minutes"])
        else:
            direct=routes["origin->destination"]; final_base=start+int(direct["duration_minutes"])
        elapsed=final_base-start; buffer=math.ceil(BUFFER_RATIO*elapsed); estimated_arrival=_clock(final_base); estimated_return=_clock(final_base+buffer)
        total_cost=sum(float(s["estimated_cost"]) for s in itinerary) if all(s["estimated_cost"] is not None for s in itinerary) else None
        if itinerary:
            itinerary[-1]["buffer_mins"]=buffer
        # Return/deadline invariant is checked again immediately before producing a successful status.
        if final_base+buffer>deadline or final_base+buffer-start>window:
            rejected.extend({"poi_id":s["poi_id"],"poi_name":s["name"],"reason":"Final deterministic deadline validation rejected this selection.","total_time_required_mins":final_base+buffer-start,"available_window_mins":window,"slack_mins":window-(final_base+buffer-start)} for s in itinerary)
            itinerary=[]; estimated_return=None; total_cost=None
    selected_ids={s["poi_id"] for s in itinerary}
    rejected=[r for r in rejected if not r.get("poi_id") or r.get("poi_id") not in selected_ids]
    trace=list(state.get("agent_trace",[])); trace.append(f"[Itinerary & Optimization] Validated {len(itinerary)} stops; deadline={c['deadline']}; buffer={buffer}m")
    warnings=list(state.get("warnings",[]))
    if any(r.get("provider")=="synthetic_demo_fixture" for r in routes.values()): warnings.append("Routing uses explicitly synthetic demo fixtures, not live road estimates.")
    status="feasible" if itinerary or direct_route_feasible else "infeasible"
    chain_ids=["origin", *[s["poi_id"] for s in itinerary], destination_id] if itinerary or direct_route_feasible else []
    ordered_legs=[]
    for source,destination in zip(chain_ids,chain_ids[1:]):
        leg=routes.get(f"{source}->{destination}")
        if leg:
            ordered_legs.append({"leg":f"{source}->{destination}",**leg})
    total_travel=sum(int(leg["duration_minutes"]) for leg in ordered_legs) if ordered_legs else 0
    total_distance=round(sum(float(leg["distance_km"]) for leg in ordered_legs),3) if ordered_legs else 0.0
    total_visit=sum(int(s["dwell_mins"]) for s in itinerary)
    log.info("itinerary status=%s stops=%d",status,len(itinerary))
    return {"itinerary":itinerary,"rejected_options":rejected,"estimated_return_time":estimated_return,"estimated_arrival_time":estimated_arrival,"total_cost":total_cost,"status":status,"warnings":warnings,"agent_trace":trace,"ordered_route_legs":ordered_legs,"total_travel_minutes":total_travel,"total_visit_minutes":total_visit,"total_distance_km":total_distance,"safety_buffer_minutes":buffer,"direct_route_feasible":direct_route_feasible}





