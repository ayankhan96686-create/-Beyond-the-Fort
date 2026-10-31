async function test() {
  const cookies = new Map();
  const updateCookies = response => {
    for (const entry of response.headers.getSetCookie()) {
      const pair = entry.split(';', 1)[0];
      const at = pair.indexOf('=');
      cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
  };

  const csrfRes = await fetch('http://localhost:5173/api/auth/csrf');
  updateCookies(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const cookieHeader = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');

  const planRes = await fetch('http://localhost:5173/api/v1/tourism-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      query: 'Visit Gwalior fort, musical places, and street food',
      city: 'Gwalior',
      start_location: {
        label: 'Gwalior Railway Station',
        latitude: 26.2163,
        longitude: 78.1972,
        source: 'map_pin'
      },
      return_to_start: true,
      available_minutes: 240,
      transport_mode: 'e_rickshaw'
    })
  });

  const d = await planRes.json();
  console.log('HTTP STATUS:', planRes.status);
  console.log('FULL RESPONSE:', d);
  console.log('STATUS:', d.status);
  console.log('STOPS COUNT:', d.itinerary_stops ? d.itinerary_stops.length : 0);
  console.log('STOPS:', (d.itinerary_stops || []).map(s => s.name));
  console.log('TRAVEL MINUTES:', d.total_travel_minutes);
  console.log('SAFETY BUFFER (+25%):', d.safety_buffer_minutes);
  console.log('VISIT MINUTES:', d.total_visit_minutes);
  console.log('TRACES COUNT:', (d.execution_trace || []).length);
  console.log('EXECUTION TRACES:', (d.execution_trace || []).map(t => `${t.agent} (${t.duration_ms}ms)`).join(', '));
}

test().catch(console.error);
