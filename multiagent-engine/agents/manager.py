import logging, math, re
from datetime import datetime
from typing import Any
from state import TourismAgentState

log = logging.getLogger(__name__)
TIME_RE = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
LOCATION_SOURCES = {"browser_geolocation", "manual_geocoded", "map_pin", "manual_coordinates", "legacy_config"}


def _normalize_location(value: Any, field: str, *, legacy_label: str | None = None) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    try:
        raw_lat = value.get("latitude", value.get("lat")); raw_lng = value.get("longitude", value.get("lng"))
        if isinstance(raw_lat, bool) or isinstance(raw_lng, bool): return None
        lat = float(raw_lat)
        lng = float(raw_lng)
        if not math.isfinite(lat) or not math.isfinite(lng) or not -90 <= lat <= 90 or not -180 <= lng <= 180:
            return None
    except (TypeError, ValueError, OverflowError):
        return None
    source = value.get("source", "legacy_config" if legacy_label else "map_pin")
    if not isinstance(source, str) or source not in LOCATION_SOURCES:
        return None
    label = str(value.get("label") or legacy_label or field.replace("_", " ").title()).strip()
    if not label or len(label) > 200:
        return None
    normalized = {"label": label, "latitude": lat, "longitude": lng, "lat": lat, "lng": lng, "source": source}
    if isinstance(value.get("place_id"), str) and value["place_id"].strip():
        normalized["place_id"] = value["place_id"].strip()[:200]
    accuracy = value.get("accuracy_m")
    if accuracy is not None:
        try:
            accuracy = float(accuracy)
            if not math.isfinite(accuracy) or accuracy < 0:
                return None
            normalized["accuracy_m"] = accuracy
        except (TypeError, ValueError, OverflowError):
            return None
    if isinstance(value.get("captured_at"), str):
        try:
            datetime.fromisoformat(value["captured_at"].replace("Z", "+00:00"))
        except ValueError:
            return None
        normalized["captured_at"] = value["captured_at"]
    return normalized


def manager_node(state: TourismAgentState) -> dict[str, Any]:
    """Normalize explicit trip constraints and validate user-selected start/end coordinates."""
    req = dict(state.get("request", {}))
    missing: list[str] = []
    query = str(req.get("user_query", req.get("query", ""))).strip()
    raw_interests = req.get("interests")
    interests = [raw_interests] if isinstance(raw_interests, str) else raw_interests
    if not interests:
        interests = [query] if query else []
    interests = [x.strip() for x in interests if isinstance(x, str) and x.strip()] if isinstance(interests, list) else []

    legacy_start = req.get("return_location_coordinates", req.get("origin"))
    raw_start = req.get("start_location", legacy_start)
    start = _normalize_location(raw_start, "start_location", legacy_label=req.get("return_location"))
    if start is None:
        missing.append("start_location (valid selected coordinates)")
        if "start_location" not in req:
            missing.append("return_location_coordinates (valid latitude/longitude)")
    return_to_start = req.get("return_to_start", req.get("end_location") is None)
    if not isinstance(return_to_start, bool):
        missing.append("return_to_start (boolean)")
        return_to_start = False
    end = start if return_to_start else _normalize_location(req.get("end_location"), "end_location")
    if end is None and not return_to_start:
        missing.append("end_location (valid selected coordinates)")

    fields = {
        "city": req.get("city"), "date": req.get("date"),
        "start_time": req.get("start_time"), "available_minutes": req.get("available_minutes"),
        "deadline": req.get("deadline", req.get("return_deadline")),
        "return_location": (end or {}).get("label", req.get("return_location")), "interests": interests,
        "transport_mode": req.get("transport_mode", req.get("transit_mode")),
    }
    if not interests and not req.get("direct_route_only"):
        missing.append("interests (or explicitly request a direct route)")
    direct_route_only = req.get("direct_route_only", False)
    if not isinstance(direct_route_only, bool):
        missing.append("direct_route_only (boolean)")
        direct_route_only = False
    missing.extend(k for k, v in fields.items() if (v is None or v == "" or v == []) and not (k == "interests" and direct_route_only))
    for name in ("start_time", "deadline"):
        if name not in missing and not TIME_RE.fullmatch(str(fields[name])):
            missing.append(f"{name} (HH:MM)")
    if not any(name.startswith("start_time") for name in missing) and not any(name.startswith("deadline") for name in missing):
        if str(fields["deadline"]) <= str(fields["start_time"]):
            missing.append("deadline (must be later than start_time)")
    try:
        if isinstance(fields["available_minutes"], bool): raise ValueError
        duration = int(fields["available_minutes"])
        if duration <= 0 or (isinstance(fields["available_minutes"], float) and not fields["available_minutes"].is_integer()):
            missing.append("available_minutes (positive integer)")
        else:
            fields["available_minutes"] = duration
    except (OverflowError, ValueError, TypeError):
        if "available_minutes" not in missing: missing.append("available_minutes (positive integer)")
    if "date" not in missing:
        try: datetime.strptime(str(fields["date"]), "%Y-%m-%d")
        except ValueError: missing.append("date (YYYY-MM-DD)")
    allowed = {"auto", "e_rickshaw", "cab", "walk", "public_transit", "mixed"}
    if fields["transport_mode"] and fields["transport_mode"] not in allowed:
        missing.append("transport_mode (supported mode)")
    companion = req.get("companion")
    allowed_companions = {"solo", "couple", "family", "group"}
    if companion not in (None, "") and (not isinstance(companion, str) or companion not in allowed_companions):
        missing.append("companion (supported option)")
    budget = req.get("budget")
    if budget in ("", None): budget = None
    else:
        try:
            budget = float(budget)
            if not math.isfinite(budget) or budget < 0: raise ValueError
        except (OverflowError, TypeError, ValueError):
            missing.append("budget (non-negative number)")
            budget = None
    constraints = {k: v for k, v in fields.items() if v is not None}
    if isinstance(companion, str) and companion in allowed_companions: constraints["companion"] = companion
    constraints.update({"start_location": start, "end_location": end, "return_to_start": return_to_start,
                        "return_location_coordinates": start, "budget": budget,
                        "direct_route_only": direct_route_only})
    trace = list(state.get("agent_trace", []))
    trace.append("[Manager] Parsed explicit request; missing required fields: " + (", ".join(missing) if missing else "none"))
    log.info("manager parsed request missing=%s", missing)
    return {"constraints": constraints, "missing_fields": sorted(set(missing)), "status": "needs_input" if missing else state.get("status"), "agent_trace": trace}
