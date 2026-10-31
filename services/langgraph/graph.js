/**
 * Multi-Agent StateGraph Engine in JavaScript (LangGraph.js)
 * Recreated natively from Python graph.py
 * Team Venator | Beyond the Fort — Gwalior
 */

const { StateGraph, START, END } = require('@langchain/langgraph');
const { TourismAgentStateAnnotation } = require('./state');
const { managerNode } = require('./manager');
const { researchNode } = require('./research');
const { routeNode } = require('./routeAgent');
const { verificationNode } = require('./verification');
const { itineraryNode } = require('./itineraryAgent');
const { responseNode } = require('./responseAgent');

function instrument(name, fn) {
  return async function(state) {
    const started = performance.now();
    try {
      const result = await fn(state);
      const elapsed = Math.round((performance.now() - started) * 100) / 100;
      const candidates = result.candidates || state.candidates || [];
      const routes = result.routes || state.routes || {};
      const evidence = result.evidence || state.evidence || [];
      const itinerary = result.itinerary || state.itinerary || [];
      const status = result.status || state.status;

      const summary = {
        candidate_count: candidates.length,
        route_count: Object.keys(routes).length,
        evidence_count: evidence.length,
        stop_count: itinerary.length,
        status
      };

      const entry = {
        agent: name,
        status: 'completed',
        duration_ms: elapsed,
        summary,
        provider_calls: name === 'route' ? (result.provider_call_count || 0) : 0,
        llm_calls: 0,
        dataset_reads: name === 'research' ? 1 : 0,
        timestamp: new Date().toISOString()
      };

      const trace = [...(state.execution_trace || []), entry];
      return { ...result, execution_trace: trace };
    } catch (err) {
      const elapsed = Math.round((performance.now() - started) * 100) / 100;
      console.error(JSON.stringify({
        event: 'agent.error',
        agent: name,
        duration_ms: elapsed,
        error_type: err.name || 'Error',
        message: err.message
      }));
      throw err;
    }
  };
}

function nextAfterManager(state) {
  if (state.missing_fields && state.missing_fields.length > 0) return 'response_agent';
  if (state.constraints && state.constraints.direct_route_only) return 'route';
  return 'research';
}

function nextAfterResearch(state) {
  if ((state.candidates && state.candidates.length > 0) ||
      (state.constraints && state.constraints.direct_route_only)) {
    return 'route';
  }
  return 'response_agent';
}

function nextAfterRoute(state) {
  if (state.status === 'provider_error') return 'response_agent';
  return 'verification';
}

function nextAfterItinerary(state) {
  return 'response_agent';
}

function buildTourismMultiAgentGraph() {
  const g = new StateGraph(TourismAgentStateAnnotation);

  g.addNode('manager', instrument('manager', managerNode));
  g.addNode('research', instrument('research', researchNode));
  g.addNode('route', instrument('route', routeNode));
  g.addNode('verification', instrument('verification', verificationNode));
  g.addNode('itinerary_optimizer', instrument('itinerary_optimizer', itineraryNode));
  g.addNode('response_agent', instrument('response', responseNode));

  g.addEdge(START, 'manager');
  g.addConditionalEdges('manager', nextAfterManager, {
    response_agent: 'response_agent',
    research: 'research',
    route: 'route'
  });
  g.addConditionalEdges('research', nextAfterResearch, {
    response_agent: 'response_agent',
    route: 'route'
  });
  g.addConditionalEdges('route', nextAfterRoute, {
    response_agent: 'response_agent',
    verification: 'verification'
  });
  g.addEdge('verification', 'itinerary_optimizer');
  g.addConditionalEdges('itinerary_optimizer', nextAfterItinerary, {
    response_agent: 'response_agent'
  });
  g.addEdge('response_agent', END);

  return g.compile();
}

const tourismGraph = buildTourismMultiAgentGraph();

async function plan(requestPayload) {
  const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const initialState = {
    request: requestPayload,
    request_id: requestId,
    agent_trace: [],
    execution_trace: []
  };

  const finalState = await tourismGraph.invoke(initialState);
  return {
    ...finalState.response,
    request_id: requestId,
    execution_trace: finalState.execution_trace || []
  };
}

module.exports = {
  buildTourismMultiAgentGraph,
  tourismGraph,
  plan
};
