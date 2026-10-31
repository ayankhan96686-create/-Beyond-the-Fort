/**
 * Agent 6: Final Luxury Response Generator
 * Recreated natively in JavaScript from Python agents/response_agent.py
 */

function responseNode(state) {
  let status = state.status || (!state.itinerary || !state.itinerary.length ? 'infeasible' : 'feasible');
  if (state.missing_fields && state.missing_fields.length > 0) {
    status = 'needs_input';
  }
  if (state.errors && state.errors.length > 0 && status !== 'needs_input') {
    status = 'provider_error';
  }
  if ((!state.itinerary || !state.itinerary.length) && status === 'feasible' && !state.direct_route_feasible) {
    status = 'infeasible';
  }

  const c = state.constraints || {};
  const travelEstimates = [];
  for (const [leg, est] of Object.entries(state.routes || {})) {
    travelEstimates.push({ leg, ...est });
  }

  const response = {
    status,
    trip_summary: {
      city: c.city,
      date: c.date,
      start_time: c.start_time,
      return_location: c.return_location,
      transport_mode: c.transport_mode,
      companion: c.companion,
      interests: c.interests,
      budget: c.budget,
      estimated_cost: state.total_cost
    },
    start_location: c.start_location,
    end_location: c.end_location,
    return_to_start: c.return_to_start || false,
    itinerary_stops: state.itinerary || [],
    route_legs: state.ordered_route_legs || [],
    travel_estimates: travelEstimates,
    total_distance_km: state.total_distance_km || 0,
    total_travel_minutes: state.total_travel_minutes || 0,
    total_visit_minutes: state.total_visit_minutes || 0,
    safety_buffer_minutes: state.safety_buffer_minutes || 0,
    estimated_arrival_time: state.estimated_arrival_time,
    evidence: state.evidence || [],
    rejected_options: state.rejected_options || [],
    warnings: state.warnings || [],
    errors: state.errors || [],
    missing_fields: state.missing_fields || [],
    estimated_return_time: state.estimated_return_time,
    deadline: c.deadline,
    agent_trace: state.agent_trace || []
  };

  const finalTrace = [...(state.agent_trace || []), '[Response] Formatted validated JSON without changing feasibility status'];
  response.agent_trace = finalTrace;

  return {
    response,
    status,
    agent_trace: finalTrace
  };
}

module.exports = {
  responseNode
};

