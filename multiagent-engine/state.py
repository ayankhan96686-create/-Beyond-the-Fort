from typing import Any, Literal, NotRequired, TypedDict

VerificationClass = Literal["VERIFIED", "STAKEHOLDER_PROVIDED", "AI_INFERENCE"]

class ConstraintState(TypedDict, total=False):
    city: str
    date: str
    start_time: str
    available_minutes: int
    deadline: str
    return_location: str
    interests: list[str]
    budget: float | None
    transport_mode: str
    companion: str
    start_location: dict[str, Any]
    end_location: dict[str, Any]
    return_to_start: bool
    direct_route_only: bool

class TourismAgentState(TypedDict, total=False):
    request: dict[str, Any]
    constraints: ConstraintState
    missing_fields: list[str]
    candidates: list[dict[str, Any]]
    routes: dict[str, dict[str, Any]]
    evidence: list[dict[str, Any]]
    itinerary: list[dict[str, Any]]
    rejected_options: list[dict[str, Any]]
    warnings: list[str]
    errors: list[str]
    status: Literal["needs_input", "provider_error", "infeasible", "feasible"]
    response: dict[str, Any]
    agent_trace: list[str]
    request_id: str
    execution_trace: list[dict[str, Any]]
    estimated_return_time: str | None
    total_cost: float | None
    ordered_route_legs: list[dict[str, Any]]
    estimated_arrival_time: str | None
    total_travel_minutes: int
    total_visit_minutes: int
    total_distance_km: float
    safety_buffer_minutes: int
    direct_route_feasible: bool

