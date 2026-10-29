import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

ENGINE = Path(__file__).resolve().parents[1]
ROOT = ENGINE.parent
sys.path.insert(0, str(ENGINE))

from agents.manager import manager_node
from agents.research import research_node
from agents.route_agent import route_node
from agents.verification import verification_node
from agents.itinerary_agent import itinerary_node
from agents.response_agent import response_node
from graph import tourism_graph
from server import app

VALID = {
    "user_query": "silk weaving", "interests": ["silk weaving"], "city": "Gwalior",
    "date": "2026-10-30", "start_time": "10:00", "available_minutes": 360, "companion": "couple",
    "deadline": "18:00", "return_location": "Gwalior Fort Main Gate",
    "return_location_coordinates": {"lat": 26.2298, "lng": 78.1733}, "transport_mode": "auto"
}


def test_manager_requires_explicit_constraints_and_coordinates():
    out = manager_node({"request": {"user_query": "silk"}, "agent_trace": []})
    assert out["status"] == "needs_input"
    assert {"city", "date", "return_location_coordinates (valid latitude/longitude)"} <= set(out["missing_fields"])


@pytest.mark.parametrize("override", [
    {"start_time": "18:00", "deadline": "10:00"},
    {"start_time": "25:00"},
    {"date": "not-a-date"},
    {"available_minutes": True},
    {"available_minutes": float("inf")},
    {"available_minutes": float("nan")},
    {"companion": "spaceship"},
    {"transport_mode": "spaceship"},
])
def test_manager_rejects_invalid_or_contradictory_constraints(override):
    out = manager_node({"request": {**VALID, **override}, "agent_trace": []})
    assert out["missing_fields"]


@pytest.mark.parametrize("budget", [float("nan"), float("inf"), float("-inf"), "Infinity", 10**1000])
def test_manager_rejects_non_finite_or_overflowing_budget(budget):
    out = manager_node({"request": {**VALID, "budget": budget}, "agent_trace": []})
    assert any(field.startswith("budget") for field in out["missing_fields"])
    assert out["constraints"]["budget"] is None


def test_manager_accepts_mixed_transport():
    out = manager_node({"request": {**VALID, "transport_mode": "mixed"}, "agent_trace": []})
    assert out["missing_fields"] == []


def test_manager_validates_start_and_independent_destination_contract():
    request = {**VALID, "return_to_start": False,
               "start_location": {"label": "Chosen start", "latitude": 26.2, "longitude": 78.1, "source": "map_pin"},
               "end_location": {"label": "Chosen end", "latitude": 26.3, "longitude": 78.2, "source": "manual_coordinates"}}
    out = manager_node({"request": request, "agent_trace": []})
    assert not out["missing_fields"]
    assert out["constraints"]["start_location"]["label"] == "Chosen start"
    assert out["constraints"]["end_location"]["label"] == "Chosen end"
    invalid = manager_node({"request": {**request, "end_location": {"latitude": float("nan"), "longitude": 78.2, "source": "map_pin"}}, "agent_trace": []})
    assert any(field.startswith("end_location") for field in invalid["missing_fields"])


def test_return_to_start_uses_identical_normalized_coordinates():
    point = {"label": "Start", "latitude": 26.2, "longitude": 78.1, "source": "browser_geolocation"}
    out = manager_node({"request": {**VALID, "start_location": point, "return_to_start": True, "end_location": None}, "agent_trace": []})
    assert out["constraints"]["start_location"]["latitude"] == out["constraints"]["end_location"]["latitude"]
    assert out["constraints"]["start_location"]["longitude"] == out["constraints"]["end_location"]["longitude"]


def test_research_matches_only_existing_city_records_and_no_arbitrary_fallback():
    out = research_node({"constraints": {"city": "Gwalior", "interests": ["silk weaving"]}, "agent_trace": []})
    assert any(p["id"] == "poi_gwl_001" for p in out["candidates"])
    assert research_node({"constraints": {"city": "Jaipur", "interests": ["heritage"]}})["candidates"] == []
    assert research_node({"constraints": {"city": "Gwalior", "interests": ["spaceport rockets"]}})["candidates"] == []


@pytest.mark.parametrize("interest,category", [
    ("Local food", "culinary"), ("Silk weaving", "crafts"), ("Music heritage", "music"),
    ("Jewellery crafts", "crafts"), ("Heritage sites", "heritage")
])
def test_planner_interest_labels_map_to_curated_categories(interest, category):
    result = research_node({"constraints": {"city": "Gwalior", "interests": [interest]}})
    assert result["candidates"]
    assert all(row["category"] == category for row in result["candidates"])


def test_research_dataset_failure_is_not_silently_replaced():
    from agents import research
    with patch.object(research, "load_curated_dataset", side_effect=OSError("fixture")):
        with pytest.raises(OSError):
            research_node({"constraints": {"city": "Gwalior", "interests": ["silk"]}})


def test_route_requires_configured_provider_or_explicit_demo_mode():
    with patch.dict(os.environ, {"DEMO_MODE": "false"}):
        os.environ.pop("ROUTING_PROVIDER_URL", None)
        out = route_node({"constraints": {"return_location_coordinates": {"lat": 26.2, "lng": 78.1}, "transport_mode": "auto"},
                          "candidates": [{"id": "x", "coordinates": {"lat": 26.21, "lng": 78.11}}], "agent_trace": []})
    assert out["status"] == "provider_error"


def test_route_timeout_and_missing_coordinates_are_safe_failures(monkeypatch):
    from agents import route_agent
    monkeypatch.setenv("DEMO_MODE", "false")
    monkeypatch.setenv("ROUTING_PROVIDER_URL", "https://routing.example/estimate")
    monkeypatch.setattr(route_agent, "urlopen", lambda *args, **kwargs: (_ for _ in ()).throw(TimeoutError("private provider detail")))
    state = {"constraints": {"return_location_coordinates": {"lat": 26.2, "lng": 78.1}, "transport_mode": "auto"},
             "candidates": [{"id": "poi", "coordinates": {"lat": 26.3, "lng": 78.2}}], "agent_trace": []}
    timed_out = route_node(state)
    assert timed_out["status"] == "provider_error"
    assert "TimeoutError" in timed_out["errors"][0]
    assert "private provider detail" not in timed_out["errors"][0]

    missing = route_node({**state, "candidates": [{"id": "poi"}]})
    assert missing["status"] == "provider_error"
    assert any("Missing or invalid coordinates" in error for error in missing["errors"])


def test_mapbox_directions_adapter_uses_lon_lat_and_converts_units(monkeypatch):
    from agents import route_agent
    import io
    from urllib.parse import urlsplit, parse_qs

    captured = {}
    class Response(io.BytesIO):
        def __enter__(self): return self
        def __exit__(self, *args): self.close()
    def fake_urlopen(req, timeout):
        captured["request"] = req
        captured["timeout"] = timeout
        return Response(b'{"code":"Ok","routes":[{"distance":1250,"duration":301}]}')
    monkeypatch.setattr(route_agent, "urlopen", fake_urlopen)
    monkeypatch.setenv("ROUTING_PROVIDER_URL", "https://api.mapbox.com")
    monkeypatch.setenv("ROUTING_PROVIDER_API_KEY", "test-token")
    monkeypatch.setenv("ROUTING_PROVIDER_TIMEOUT_SECONDS", "4")
    result = route_agent._provider_estimate({"lat":26.2,"lng":78.1},{"lat":26.3,"lng":78.2},"auto")

    request = captured["request"]
    parsed = urlsplit(request.full_url)
    assert request.get_method() == "GET"
    assert parsed.path.endswith("/directions/v5/mapbox/driving/78.1,26.2;78.2,26.3")
    assert parse_qs(parsed.query)["access_token"] == ["test-token"]
    assert result["distance_km"] == 1.25 and result["duration_minutes"] == 6
    assert result["source_class"] == "VERIFIED" and result["provider"] == "mapbox_driving"


@pytest.mark.parametrize("payload", [
    '{"duration_minutes":NaN,"distance_km":1}',
    '{"duration_minutes":5,"distance_km":Infinity}',
])
def test_routing_provider_rejects_non_finite_estimates(monkeypatch, payload):
    from agents import route_agent
    import io

    class Response(io.BytesIO):
        def __enter__(self): return self
        def __exit__(self, *args): self.close()

    monkeypatch.setenv("ROUTING_PROVIDER_URL", "https://routing.example/estimate")
    monkeypatch.setattr(route_agent, "urlopen", lambda *args, **kwargs: Response(payload.encode()))
    with pytest.raises(RuntimeError, match="invalid distance/duration"):
        route_agent._provider_estimate({"lat": 26.2, "lng": 78.1}, {"lat": 26.3, "lng": 78.2}, "auto")


def test_mapbox_route_node_requests_each_direction(monkeypatch):
    from agents import route_agent
    monkeypatch.setenv("DEMO_MODE", "false")
    monkeypatch.setenv("ROUTING_PROVIDER_URL", "https://api.mapbox.com")
    calls = []
    def fake_estimate(origin, destination, mode):
        calls.append((origin, destination, mode))
        return {"distance_km": 1, "duration_minutes": 5 if origin["lat"] < destination["lat"] else 9,
                "mode": mode, "provider": "mapbox_driving", "retrieved_at": "test", "source_class": "VERIFIED"}
    monkeypatch.setattr(route_agent, "_provider_estimate", fake_estimate)
    out = route_agent.route_node({"constraints":{"return_location_coordinates":{"lat":26.2,"lng":78.1},"transport_mode":"auto"},
                                  "candidates":[{"id":"poi","coordinates":{"lat":26.3,"lng":78.2}}],"agent_trace":[]})

    assert len(calls) == 2 and out["provider_call_count"] == 2
    assert out["routes"]["origin->poi"]["duration_minutes"] == 5
    assert out["routes"]["poi->origin"]["duration_minutes"] == 9


def test_route_node_builds_full_start_stop_end_directed_legs(monkeypatch):
    from agents import route_agent
    monkeypatch.setenv("DEMO_MODE", "true")
    state = {"constraints": {"start_location": {"lat": 26.2, "lng": 78.1}, "end_location": {"lat": 26.4, "lng": 78.3}, "transport_mode": "auto"},
             "candidates": [{"id": "poi", "coordinates": {"lat": 26.3, "lng": 78.2}}], "agent_trace": []}
    routes = route_agent.route_node(state)["routes"]
    assert {"origin->poi", "poi->destination", "origin->destination", "destination->poi", "poi->origin", "destination->origin"} <= routes.keys()
    assert all(route["provider"] == "synthetic_demo_fixture" for route in routes.values())


def test_final_destination_leg_controls_deadline_and_output_chain():
    c = {"start_time": "10:00", "deadline": "13:00", "available_minutes": 240, "budget": None,
         "start_location": {"label": "Start", "lat": 26.2, "lng": 78.1}, "end_location": {"label": "End", "lat": 26.4, "lng": 78.3}, "return_to_start": False}
    candidate = {"id": "poi", "name": "Test stop", "coordinates": {"lat": 26.3, "lng": 78.2}, "min_dwell_time_mins": 30, "cost_estimate": 0}
    routes = {"origin->poi": {"duration_minutes": 10, "distance_km": 2, "mode": "auto", "provider": "fixture"},
              "poi->destination": {"duration_minutes": 200, "distance_km": 4, "mode": "auto", "provider": "fixture"}}
    late = itinerary_node({"constraints": c, "candidates": [candidate], "routes": routes, "agent_trace": []})
    assert late["status"] == "infeasible"
    routes["poi->destination"]["duration_minutes"] = 10
    feasible = itinerary_node({"constraints": c, "candidates": [candidate], "routes": routes, "agent_trace": []})
    assert feasible["status"] == "feasible"
    assert [leg["leg"] for leg in feasible["ordered_route_legs"]] == ["origin->poi", "poi->destination"]
    assert feasible["estimated_arrival_time"] == "10:50"


def test_explicit_direct_route_skips_research_and_returns_single_leg():
    request = {**VALID, "query": "", "user_query": "", "interests": [], "direct_route_only": True,
               "return_to_start": False,
               "start_location": {"label": "Start", "latitude": 26.2, "longitude": 78.1, "source": "map_pin"},
               "end_location": {"label": "End", "latitude": 26.21, "longitude": 78.11, "source": "manual_coordinates"}}
    with patch.dict(os.environ, {"DEMO_MODE": "true", "NODE_ENV": "development"}):
        response = app.test_client().post("/plan", json=request).get_json()
    assert response["status"] == "feasible"
    assert response["itinerary_stops"] == []
    assert [leg["leg"] for leg in response["route_legs"]] == ["origin->destination"]
    assert [entry["agent"] for entry in response["execution_trace"]] == ["manager", "route", "verification", "itinerary", "response"]


def test_same_start_and_destination_uses_derived_zero_leg_without_provider_call(monkeypatch):
    from agents import route_agent
    def unexpected_provider_call(*args, **kwargs):
        raise AssertionError("identical endpoints must not call the routing provider")
    monkeypatch.setattr(route_agent, "_provider_estimate", unexpected_provider_call)
    point = {"lat": 26.2298, "lng": 78.1733}
    result = route_agent.route_node({
        "constraints": {"start_location": point, "end_location": point, "transport_mode": "auto"},
        "candidates": [], "agent_trace": []
    })
    assert "errors" not in result
    assert result["provider_call_count"] == 0
    assert result["routes"]["origin->destination"] == {
        "distance_km": 0.0, "duration_minutes": 0, "mode": "auto", "provider": "same_location",
        "retrieved_at": None, "source_class": "DERIVED", "route_data_status": "same_location",
        "geometry": None, "origin_id": "origin", "destination_id": "destination",
        "origin_label": "Start", "destination_label": "End",
        "origin_coordinates": point, "destination_coordinates": point
    }
    response = itinerary_node({"constraints": {"start_time": "10:00", "deadline": "18:00", "available_minutes": 360, "budget": None, "direct_route_only": True}, "routes": result["routes"], "candidates": [], "agent_trace": []})
    assert response["status"] == "feasible"
    assert response["total_distance_km"] == 0.0


def test_verification_never_upgrades_claim_without_source():
    candidates = [
        {"id": "no-source", "name": "Place", "verification_status": "VERIFIED_AUDITOR", "min_dwell_time_mins": 30},
        {"id": "url-only", "name": "Place", "verification_status": "VERIFIED_AUDITOR", "source_url": "https://example.invalid/place", "min_dwell_time_mins": 30},
        {"id": "reference-only", "name": "Place", "verification_status": "VERIFIED_AUDITOR", "source_reference": "field note", "min_dwell_time_mins": 30},
    ]
    out = verification_node({"candidates": candidates, "routes": {}, "agent_trace": []})
    place_evidence = [e for e in out["evidence"] if e["claim_type"] == "attraction_record"]
    assert len(place_evidence) == 3
    assert all(not e["verified"] and e["classification"] == "STAKEHOLDER_PROVIDED" for e in place_evidence)


def test_itinerary_rejects_deadline_and_unknown_cost_with_budget():
    state = {"constraints": {"start_time": "10:00", "deadline": "10:20", "available_minutes": 60, "budget": 100},
             "candidates": [{"id": "x", "name": "X", "min_dwell_time_mins": 30}],
             "routes": {"origin->x": {"duration_minutes": 5, "distance_km": 1, "mode": "auto", "provider": "test"},
                        "x->origin": {"duration_minutes": 5, "distance_km": 1, "mode": "auto", "provider": "test"}}, "agent_trace": []}
    out = itinerary_node(state)
    assert out["status"] == "infeasible" and out["itinerary"] == []
    assert any("Budget cannot be validated" in x["reason"] for x in out["rejected_options"])


def test_itinerary_enforces_known_cost_and_keeps_chronological_stops():
    candidates = [
        {"id": "within", "name": "Within Budget", "min_dwell_time_mins": 30, "cost_estimate": 40},
        {"id": "over", "name": "Over Budget", "min_dwell_time_mins": 30, "cost_estimate": 60},
    ]
    routes = {}
    for candidate in candidates:
        routes[f"origin->{candidate['id']}"] = {"duration_minutes": 5, "distance_km": 1, "mode": "auto", "provider": "test"}
        routes[f"{candidate['id']}->origin"] = {"duration_minutes": 5, "distance_km": 1, "mode": "auto", "provider": "test"}
    out = itinerary_node({"constraints": {"start_time": "10:00", "deadline": "14:00", "available_minutes": 240, "budget": 50},
                          "candidates": candidates, "routes": routes, "agent_trace": []})
    assert out["status"] == "feasible"
    assert [stop["poi_id"] for stop in out["itinerary"]] == ["within"]
    assert any(rejected["poi_id"] == "over" for rejected in out["rejected_options"])
    assert all(out["itinerary"][i]["departure_time"] <= out["itinerary"][i + 1]["arrival_time"] for i in range(len(out["itinerary"]) - 1))


def test_response_keeps_failure_status_and_schema():
    out = response_node({"status": "provider_error", "errors": ["unavailable"], "itinerary": [], "constraints": {}})["response"]
    required = {"status", "trip_summary", "itinerary_stops", "travel_estimates", "evidence", "rejected_options", "warnings", "errors", "missing_fields", "estimated_return_time", "deadline", "agent_trace"}
    assert required <= out.keys()
    assert out["status"] == "provider_error"
    assert isinstance(out["itinerary_stops"], list) and isinstance(out["evidence"], list)


def test_flask_missing_input_and_invalid_body():
    client = app.test_client()
    assert client.post("/plan", json={"user_query": "silk"}).get_json()["status"] == "needs_input"
    assert client.post("/plan", data="not-json", content_type="application/json").status_code == 400


def test_flask_empty_research_and_provider_failure_branches():
    client = app.test_client()
    with patch.dict(os.environ, {"DEMO_MODE": "true"}):
        empty = client.post("/plan", json={**VALID, "interests": ["spaceport rockets"]}).get_json()
    assert empty["status"] == "infeasible"
    with patch.dict(os.environ, {"DEMO_MODE": "false"}):
        os.environ.pop("ROUTING_PROVIDER_URL", None)
        failed = client.post("/plan", json=VALID)
    assert failed.status_code == 503 and failed.get_json()["status"] == "provider_error"


def test_flask_dataset_unavailable_returns_safe_failure(caplog):
    from agents import research
    client = app.test_client()
    with patch.object(research, "load_curated_dataset", side_effect=OSError("private dataset detail")):
        response = client.post("/plan", json=VALID)
    assert response.status_code == 500
    assert response.get_json()["status"] == "provider_error"
    assert "private dataset detail" not in response.get_data(as_text=True)
    assert "private dataset detail" not in caplog.text


def test_end_to_end_feasible_trip_has_six_structured_node_events():
    client = app.test_client()
    with patch.dict(os.environ, {"DEMO_MODE": "true", "NODE_ENV": "development"}):
        response = client.post("/plan", json=VALID)
    data = response.get_json()
    assert response.status_code == 200 and data["status"] == "feasible"
    assert data["estimated_return_time"] <= data["deadline"]
    assert data["trip_summary"]["companion"] == "couple"
    stops = data["itinerary_stops"]
    assert all(stops[i]["departure_time"] <= stops[i + 1]["arrival_time"] for i in range(len(stops) - 1))
    assert [e["agent"] for e in data["execution_trace"]] == ["manager", "research", "route", "verification", "itinerary", "response"]
    assert all(e["duration_ms"] >= 0 and e["llm_calls"] == 0 for e in data["execution_trace"])
    assert data["request_id"]


def test_no_execution_trace_is_returned_in_production():
    client = app.test_client()
    with patch.dict(os.environ, {"DEMO_MODE": "true", "NODE_ENV": "production"}):
        data = client.post("/plan", json=VALID).get_json()
    assert "execution_trace" not in data


@pytest.mark.integration
def test_real_configured_gemini_provider_when_credentials_exist():
    from dotenv import dotenv_values
    env = dotenv_values(ROOT / ".env")
    key = os.getenv("GEMINI_API_KEY") or env.get("GEMINI_API_KEY")
    if not key:
        pytest.skip("GEMINI_API_KEY is not configured")
    import subprocess
    script = "const s=require('./services/geminiService'); s.extractIntent('Find Gwalior classical music and heritage',180).then(x=>process.stdout.write(JSON.stringify({category:x.category, fallback:x.extracted_via==='deterministic_heuristic_fallback'}))).catch(()=>process.exit(2));"
    result = subprocess.run(["node", "-e", script], cwd=ROOT, capture_output=True, text=True, timeout=90)
    assert result.returncode == 0, "Gemini integration probe failed (details suppressed to protect credentials)."
    import json
    parsed = json.loads(result.stdout)
    assert parsed["category"] in {"music", "heritage", "all", "crafts", "culinary", "textile"}
    assert not parsed["fallback"], "Gemini integration call used the deterministic fallback; inspect the provider account/configuration without exposing its key."
