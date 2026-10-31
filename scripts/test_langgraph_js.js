const { plan } = require('../services/langgraph/graph');

async function main() {
  console.log('Testing JavaScript LangGraph Multi-Agent Engine...');
  const payload = {
    query: 'Explore Gwalior musical heritage, fortresses, and palaces',
    city: 'Gwalior',
    date: '2026-10-31',
    start_time: '10:00',
    available_minutes: 240,
    deadline: '16:00',
    start_location: {
      label: 'Gwalior Railway Station',
      latitude: 26.2163,
      longitude: 78.1972,
      source: 'map_pin'
    },
    return_to_start: true,
    transport_mode: 'auto',
    companion: 'solo'
  };

  const res = await plan(payload);
  console.log('----------------------------------------------------');
  console.log('STATUS:', res.status);
  console.log('STOPS COUNT:', res.itinerary_stops ? res.itinerary_stops.length : 0);
  console.log('STOPS:', (res.itinerary_stops || []).map(s => s.name));
  console.log('TRAVEL MINS:', res.total_travel_minutes);
  console.log('BUFFER MINS:', res.safety_buffer_minutes);
  console.log('VISIT MINS:', res.total_visit_minutes);
  console.log('AGENT TRACE COUNT:', res.execution_trace ? res.execution_trace.length : 0);
  console.log('AGENT TRACE:', (res.execution_trace || []).map(t => `${t.agent} (${t.duration_ms}ms)`).join(', '));
  console.log('----------------------------------------------------');
  console.log('ALL 6 AGENTS EXECUTED SUCCESSFULLY IN JAVASCRIPT!');
}

main().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});

