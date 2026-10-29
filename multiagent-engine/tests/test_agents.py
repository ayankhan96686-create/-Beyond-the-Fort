import os, sys, unittest
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from agents.manager import manager_node
from agents.research import research_node, load_curated_dataset
from agents import route_agent
from agents.route_agent import route_node, haversine_distance_km
from agents.verification import verification_node
from agents.itinerary_agent import itinerary_node
from agents.response_agent import response_node
from graph import tourism_graph
from server import app

VALID={"user_query":"silk weaving", "interests":["silk weaving"], "city":"Gwalior", "date":"2026-10-30", "start_time":"10:00", "available_minutes":360, "deadline":"18:00", "return_location":"Gwalior Fort Main Gate", "return_location_coordinates":{"lat":26.2298,"lng":78.1733}, "transport_mode":"auto"}

class AgentUnitTests(unittest.TestCase):
    def test_manager_contract_missing_data(self):
        out=manager_node({"request":{"user_query":"silk"},"agent_trace":[]})
        self.assertIn("date",out["missing_fields"]); self.assertEqual(out["status"],"needs_input")
        self.assertNotIn("city",out["constraints"])
    def test_research_uses_dataset_and_no_fallback_expansion(self):
        out=research_node({"constraints":{"city":"Gwalior","interests":["silk weaving"]},"agent_trace":[]})
        self.assertTrue(any(p["id"]=="poi_gwl_001" for p in out["candidates"]))
        empty=research_node({"constraints":{"city":"Gwalior","interests":["spaceport rockets"]},"agent_trace":[]})
        self.assertEqual(empty["candidates"],[])
    def test_route_requires_provider_or_explicit_demo(self):
        with patch.dict(os.environ,{"DEMO_MODE":"false"},clear=False):
            os.environ.pop("ROUTING_PROVIDER_URL",None)
            out=route_node({"constraints":{"return_location_coordinates":{"lat":26.2,"lng":78.1},"transport_mode":"auto"},"candidates":[{"id":"x","coordinates":{"lat":26.21,"lng":78.11}}],"agent_trace":[]})
        self.assertEqual(out["status"],"provider_error")
    def test_verification_does_not_promote_missing_source(self):
        out=verification_node({"candidates":[{"id":"x","name":"Place","verification_status":"VERIFIED_AUDITOR","min_dwell_time_mins":30}],"routes":{},"agent_trace":[]})
        self.assertTrue(out["evidence"])
        self.assertTrue(all(not e["verified"] for e in out["evidence"]))
        self.assertEqual(out["evidence"][0]["classification"],"STAKEHOLDER_PROVIDED")
    def test_itinerary_rejects_deadline_and_budget_without_cost(self):
        state={"constraints":{"start_time":"10:00","deadline":"10:20","available_minutes":60,"budget":100},"candidates":[{"id":"x","name":"X","min_dwell_time_mins":30}],"routes":{"origin->x":{"duration_minutes":5,"distance_km":1,"mode":"auto","provider":"test"},"x->origin":{"duration_minutes":5,"distance_km":1,"mode":"auto","provider":"test"}},"agent_trace":[]}
        out=itinerary_node(state); self.assertEqual(out["status"],"infeasible"); self.assertEqual(out["itinerary"],[])
    def test_response_preserves_infeasible_status(self):
        out=response_node({"status":"infeasible","itinerary":[],"constraints":{"deadline":"10:00"}})
        self.assertEqual(out["response"]["status"],"infeasible")

class WorkflowAcceptanceTests(unittest.TestCase):
    def setUp(self): self.client=app.test_client()
    def test_valid_trip(self):
        with patch.dict(os.environ,{"DEMO_MODE":"true"}):
            r=self.client.post("/plan",json=VALID)
        data=r.get_json(); self.assertEqual(data["status"],"feasible"); self.assertGreaterEqual(len(data["itinerary_stops"]),1); self.assertLessEqual(data["estimated_return_time"],data["deadline"])
        self.assertTrue(any("Response" in x for x in data["agent_trace"]))
    def test_missing_required_data(self):
        r=self.client.post("/plan",json={"user_query":"silk"}); d=r.get_json(); self.assertEqual(d["status"],"needs_input"); self.assertIn("date",d["missing_fields"])
    def test_no_matching_attractions(self):
        with patch.dict(os.environ,{"DEMO_MODE":"true"}): r=self.client.post("/plan",json={**VALID,"interests":["spaceport rockets"],"user_query":"spaceport rockets"})
        self.assertEqual(r.get_json()["status"],"infeasible"); self.assertEqual(r.get_json()["itinerary_stops"],[])
    def test_routing_api_failure(self):
        env={"DEMO_MODE":"false"};
        with patch.dict(os.environ,env):
            os.environ.pop("ROUTING_PROVIDER_URL",None); r=self.client.post("/plan",json=VALID)
        self.assertEqual(r.status_code,503); self.assertEqual(r.get_json()["status"],"provider_error")
    def test_deadline_violation(self):
        with patch.dict(os.environ,{"DEMO_MODE":"true"}): r=self.client.post("/plan",json={**VALID,"deadline":"10:15","available_minutes":360})
        d=r.get_json(); self.assertEqual(d["status"],"infeasible"); self.assertEqual(d["itinerary_stops"],[])

if __name__=="__main__": unittest.main(verbosity=2)


