import os

os.environ["NODE_ENV"] = "test"
import server


def test_production_plan_route_requires_service_token(monkeypatch):
    token = "test-only-service-token-value-0000000000000000"
    monkeypatch.setattr(server, "SERVICE_TOKEN", token)
    monkeypatch.setenv("NODE_ENV", "production")
    client = server.app.test_client()

    denied = client.post("/plan", json={})
    assert denied.status_code == 401
    assert denied.get_json()["message"] == "Unauthorized"

    allowed = client.post("/plan", json={}, headers={"Authorization": f"Bearer {token}"})
    assert allowed.status_code == 200
    assert allowed.get_json()["status"] == "needs_input"


def test_flask_planner_request_size_is_capped():
    client = server.app.test_client()
    response = client.post("/plan", data=b"x" * (16 * 1024 + 1), content_type="application/json")
    assert response.status_code in (400, 413)


def test_manager_caps_massive_query_and_interests():
    from agents.manager import manager_node
    state = {
        "request": {
            "user_query": "A" * 5000,
            "interests": ["interest_" + str(i) for i in range(50)],
            "city": "Gwalior",
            "date": "2026-11-01",
            "start_time": "10:00",
            "deadline": "18:00",
            "available_minutes": 240,
            "return_location": "Fort Gate",
            "start_location": {"label": "Start", "lat": 26.2298, "lng": 78.1733, "source": "map_pin"},
            "end_location": {"label": "End", "lat": 26.2298, "lng": 78.1733, "source": "map_pin"},
            "return_to_start": True,
            "transport_mode": "auto"
        }
    }
    result = manager_node(state)
    constraints = result.get("constraints", {})
    assert len(constraints["interests"]) <= 10
    assert all(len(item) <= 100 for item in constraints["interests"])
