import json, logging, math, os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode, urlsplit
from state import TourismAgentState

log = logging.getLogger(__name__)

def _valid_line_geometry(geometry: Any) -> bool:
    if not isinstance(geometry, dict) or geometry.get("type") != "LineString": return False
    coordinates=geometry.get("coordinates")
    if not isinstance(coordinates, list) or len(coordinates) < 2: return False
    for point in coordinates:
        if not isinstance(point, (list,tuple)) or len(point) < 2: return False
        try: lng,lat=float(point[0]),float(point[1])
        except (TypeError,ValueError,OverflowError): return False
        if not math.isfinite(lat) or not math.isfinite(lng) or not -90<=lat<=90 or not -180<=lng<=180: return False
    return True

def _valid_coordinates(point: Any) -> bool:
    if not isinstance(point, dict): return False
    try:
        lat=float(point["lat"]); lng=float(point["lng"])
        return math.isfinite(lat) and math.isfinite(lng) and -90<=lat<=90 and -180<=lng<=180
    except (KeyError,TypeError,ValueError,OverflowError):
        return False

def haversine_distance_km(a: dict, b: dict) -> float:
    lat1, lon1 = float(a["lat"]), float(a["lng"]); lat2, lon2 = float(b["lat"]), float(b["lng"])
    r=6371.0; p1=math.radians(lat1); p2=math.radians(lat2)
    x=math.sin(math.radians(lat2-lat1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(math.radians(b["lng"]-a["lng"])/2)**2
    return round(2*r*math.asin(math.sqrt(x)), 2)

def _same_coordinates(a: dict, b: dict) -> bool:
    try: return float(a["lat"]) == float(b["lat"]) and float(a["lng"]) == float(b["lng"])
    except (KeyError, TypeError, ValueError, OverflowError): return False

def _provider_estimate(origin: dict, destination: dict, mode: str) -> dict:
    """Use the configured Mapbox Directions API or configured JSON POST contract."""
    endpoint=os.getenv("ROUTING_PROVIDER_URL", "").strip()
    if not endpoint: raise RuntimeError("No routing provider is configured (set ROUTING_PROVIDER_URL)")
    token=os.getenv("ROUTING_PROVIDER_API_KEY", "")
    timeout=float(os.getenv("ROUTING_PROVIDER_TIMEOUT_SECONDS", "5"))
    if urlsplit(endpoint).hostname == "api.mapbox.com":
        if not token: raise RuntimeError("Mapbox access token is not configured")
        if mode == "walk": profile = "walking"
        elif mode in {"auto", "e_rickshaw", "cab"}: profile = "driving"
        else: raise RuntimeError("Mapbox Directions does not provide the requested transport mode")
        coordinates=f"{float(origin['lng'])},{float(origin['lat'])};{float(destination['lng'])},{float(destination['lat'])}"
        url=f"{endpoint.rstrip('/')}/directions/v5/mapbox/{profile}/{coordinates}?{urlencode({'access_token': token, 'overview': 'simplified', 'geometries': 'geojson'})}"
        req=Request(url, headers={"Accept":"application/json"}, method="GET")
        with urlopen(req, timeout=timeout) as resp: payload=json.loads(resp.read().decode())
        route=(payload.get("routes") or [None])[0]
        distance=route.get("distance") if route else None; duration=route.get("duration") if route else None
        if payload.get("code") != "Ok" or not isinstance(duration,(int,float)) or not math.isfinite(duration) or duration<=0 or not isinstance(distance,(int,float)) or not math.isfinite(distance) or distance<0:
            raise RuntimeError("Mapbox returned no valid route")
        geometry=route.get("geometry")
        if not _valid_line_geometry(geometry): geometry=None
        return {"distance_km":float(distance)/1000,"duration_minutes":math.ceil(duration/60),"mode":mode,"provider":f"mapbox_{profile}","retrieved_at":datetime.now(timezone.utc).isoformat(),"source_class":"VERIFIED","route_data_status":"live","geometry":geometry}
    headers={"Content-Type":"application/json"}
    if token: headers["Authorization"]="Bearer "+token
    req=Request(endpoint, data=json.dumps({"origin":origin,"destination":destination,"mode":mode}).encode(), headers=headers, method="POST")
    with urlopen(req, timeout=timeout) as resp: payload=json.loads(resp.read().decode())
    duration=payload.get("duration_minutes"); distance=payload.get("distance_km")
    if not isinstance(duration,(int,float)) or not math.isfinite(duration) or duration<=0 or not isinstance(distance,(int,float)) or not math.isfinite(distance) or distance<0: raise RuntimeError("Routing provider returned an invalid distance/duration")
    geometry=payload.get("geometry")
    if not _valid_line_geometry(geometry): geometry=None
    return {"distance_km":float(distance),"duration_minutes":math.ceil(duration),"mode":mode,"provider":payload.get("provider", "configured_routing_provider"),"retrieved_at":payload.get("retrieved_at") or datetime.now(timezone.utc).isoformat(),"source_class":"VERIFIED","route_data_status":"live","geometry":geometry}

def route_node(state: TourismAgentState) -> dict[str, Any]:
    """Request every directed start -> stop -> ... -> destination leg or fail closed."""
    c=state.get("constraints",{}); start=c.get("start_location") or c.get("return_location_coordinates"); end=c.get("end_location")
    legacy_contract = end is None
    if legacy_contract: end = start
    if not start or not end or not all(k in start for k in ("lat","lng")) or not all(k in end for k in ("lat","lng")):
        return {"status":"provider_error", "errors":["Selected start and end locations both require valid coordinates."], "agent_trace":list(state.get("agent_trace",[]))+["[Route & Time] Missing selected endpoint coordinates"]}
    locations=[("origin", start)]
    locations.extend((p["id"], p.get("coordinates")) for p in state.get("candidates",[]) if p.get("id"))
    if not legacy_contract: locations.append(("destination", end))
    mode=c.get("transport_mode"); demo=os.getenv("DEMO_MODE", "false").lower() == "true"
    routes={}; errors=[]; provider_call_count=0; tasks=[]
    for i,(source,src) in enumerate(locations):
        for dest,dst in locations[i+1:]:
            if not _valid_coordinates(src) or not _valid_coordinates(dst):
                errors.append(f"Missing or invalid coordinates for {source if not _valid_coordinates(src) else dest}"); continue
            for leg_source,leg_destination,origin,destination in ((source,dest,src,dst),(dest,source,dst,src)):
                tasks.append((leg_source,leg_destination,origin,destination))
    same_location_tasks = sum(1 for task in tasks if _same_coordinates(task[2], task[3]))
    if not demo: provider_call_count=len(tasks)-same_location_tasks
    def fetch_leg(task):
        leg_source,leg_destination,origin,destination=task
        try:
            if _same_coordinates(origin, destination):
                estimate={"distance_km":0.0,"duration_minutes":0,"mode":mode,"provider":"same_location","retrieved_at":None,"source_class":"DERIVED","route_data_status":"same_location","geometry":None}
            elif demo:
                km=haversine_distance_km(origin,destination); speed={"auto":22,"e_rickshaw":15,"cab":28,"walk":4,"public_transit":18}.get(mode,18)
                estimate={"distance_km":km,"duration_minutes":max(1,math.ceil(km*1.35/speed*60)),"mode":mode,"provider":"synthetic_demo_fixture","retrieved_at":None,"source_class":"AI_INFERENCE","route_data_status":"synthetic","geometry":None}
            else:
                estimate=_provider_estimate(origin,destination,mode)
            candidate_names={p.get("id"):p.get("name",p.get("id")) for p in state.get("candidates",[]) if p.get("id")}
            estimate={**estimate,"route_data_status":estimate.get("route_data_status", "synthetic" if demo else "live"),"origin_id":leg_source,"destination_id":leg_destination,"origin_label":"Start" if leg_source=="origin" else "End" if leg_source=="destination" else candidate_names.get(leg_source,leg_source),"destination_label":"Start" if leg_destination=="origin" else "End" if leg_destination=="destination" else candidate_names.get(leg_destination,leg_destination),"origin_coordinates":{"lat":float(origin["lat"]),"lng":float(origin["lng"])},"destination_coordinates":{"lat":float(destination["lat"]),"lng":float(destination["lng"])}}
            return f"{leg_source}->{leg_destination}",estimate,None
        except (URLError, HTTPError, TimeoutError, ValueError, RuntimeError, OSError) as e:
            return f"{leg_source}->{leg_destination}",None,f"{leg_source}->{leg_destination}: routing provider request failed ({type(e).__name__})."
    try:
        max_workers=max(1,min(16,int(os.getenv("ROUTING_PROVIDER_MAX_WORKERS","8"))))
    except (ValueError,TypeError):
        max_workers=8
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for key,estimate,error in executor.map(fetch_leg,tasks):
            if error: errors.append(error)
            else: routes[key]=estimate
    trace=list(state.get("agent_trace",[])); trace.append(f"[Route & Time] Retrieved {len(routes)} directed journey legs" if not errors else f"[Route & Time] Provider failed for {len(errors)} directed request(s)")
    warnings=list(state.get("warnings",[]))
    if not demo and urlsplit(os.getenv("ROUTING_PROVIDER_URL", "").strip()).hostname == "api.mapbox.com" and mode != "walk":
        warnings.append("Mapbox uses its standard driving profile; durations are not calibrated for auto-rickshaw, e-rickshaw, or cab-specific speeds.")
    if demo: warnings.append("Routing uses explicitly synthetic demo fixtures, not live road estimates.")
    if errors:
        log.warning("routing provider requests failed count=%d", len(errors))
        return {"routes":routes,"status":"provider_error","errors":errors,"agent_trace":trace,"provider_call_count":provider_call_count,"warnings":warnings}
    log.info("routing completed directed_legs=%d live_provider_calls=%d demo=%s",len(routes),provider_call_count,demo)
    return {"routes":routes,"agent_trace":trace,"provider_call_count":provider_call_count,"warnings":warnings}
