/**
 * State definitions and channels for the LangGraph.js Tourism Multi-Agent System
 * Team Venator | Beyond the Fort — Gwalior
 */

const { Annotation } = require('@langchain/langgraph');

const TourismAgentStateAnnotation = Annotation.Root({
  request: Annotation({ reducer: (x, y) => y ?? x, default: () => ({}) }),
  constraints: Annotation({ reducer: (x, y) => y ?? x, default: () => ({}) }),
  missing_fields: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  candidates: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  routes: Annotation({ reducer: (x, y) => y ?? x, default: () => ({}) }),
  evidence: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  itinerary: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  rejected_options: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  warnings: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  errors: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  status: Annotation({ reducer: (x, y) => y ?? x, default: () => 'needs_input' }),
  response: Annotation({ reducer: (x, y) => y ?? x, default: () => ({}) }),
  agent_trace: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  request_id: Annotation({ reducer: (x, y) => y ?? x, default: () => 'req_' + Date.now() }),
  execution_trace: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  estimated_return_time: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  total_cost: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  ordered_route_legs: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  estimated_arrival_time: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  total_travel_minutes: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
  total_visit_minutes: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
  total_distance_km: Annotation({ reducer: (x, y) => y ?? x, default: () => 0.0 }),
  safety_buffer_minutes: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
  direct_route_feasible: Annotation({ reducer: (x, y) => y ?? x, default: () => false })
});

module.exports = {
  TourismAgentStateAnnotation
};

