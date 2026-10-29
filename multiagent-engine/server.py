import logging, os
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from flask import Flask, jsonify, request
from graph import tourism_graph
from agents.research import load_curated_dataset

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status":"healthy", "service":"Tourism LangGraph API", "agents":["Manager", "Research", "Route & Time", "Verification", "Itinerary & Optimization", "Response"]})

@app.post("/plan")
def plan():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"status":"needs_input", "missing_fields":["JSON request body"]}), 400
    try:
        state = {"request":payload, "request_id":uuid.uuid4().hex, "execution_trace":[], "constraints":{}, "missing_fields":[], "candidates":[], "routes":{}, "evidence":[], "itinerary":[], "rejected_options":[], "warnings":[], "errors":[], "agent_trace":[]}
        out = tourism_graph.invoke(state)
        result = out.get("response", {"status":"provider_error", "errors":["Response agent did not produce a result"]})
        result["request_id"] = state["request_id"]
        if os.getenv("NODE_ENV", "development").lower() != "production":
            result["execution_trace"] = out.get("execution_trace", [])
        return jsonify(result), (503 if result.get("status") == "provider_error" else 200)
    except Exception as exc:
        app.logger.error("workflow failed error_type=%s", type(exc).__name__)
        return jsonify({"status":"provider_error", "errors":["Tourism planning workflow failed."]}), 500

@app.get("/attractions")
def attractions():
    rows = load_curated_dataset()
    rows = [r for r in rows if not r.get("synthetic") and not r.get("is_placeholder") and r.get("record_type") != "synthetic"]
    return jsonify({"count":len(rows), "data":rows})

if __name__ == "__main__":
    app.run(host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("LANGGRAPH_PORT", "8000")), debug=False)
