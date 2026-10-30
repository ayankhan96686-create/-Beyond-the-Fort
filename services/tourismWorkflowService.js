const http = require('http');
const config = require('../config/env');

class TourismWorkflowClient {
  async executeWorkflow(rawInput = {}) {
    const query = rawInput.query || rawInput.user_query || '';
    if (!String(query).trim() && rawInput.direct_route_only !== true) return { statusCode: 400, status: 'needs_input', missing_fields: ['interests'], error: 'Please specify the experiences you are interested in.' };
    const duration = rawInput.available_minutes ?? (rawInput.duration_hours || rawInput.time_budget_hours) * 60;
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      user_query: query,
      interests: rawInput.interests || [query],
      city: rawInput.city || 'Gwalior',
      date: rawInput.date || today,
      start_time: rawInput.start_time || '10:00',
      available_minutes: duration || 240,
      deadline: rawInput.deadline || rawInput.return_deadline || '18:00',
      return_location: rawInput.return_location,
      return_location_coordinates: rawInput.return_location_coordinates || rawInput.origin,
      start_location: rawInput.start_location,
      end_location: rawInput.end_location,
      return_to_start: rawInput.return_to_start,
      direct_route_only: rawInput.direct_route_only === true,
      budget: rawInput.budget === '' ? null : rawInput.budget,
      transport_mode: rawInput.transport_mode || rawInput.transit_mode,
      companion: rawInput.companion
    };
    try {
      const result = await this.postJson(config.langgraphApiUrl, payload, 45000);
      return { statusCode: result.status === 'provider_error' ? 503 : 200, ...result };
    } catch (error) {
      const errorType = typeof error?.name === 'string' ? error.name : 'Error';
      console.error(JSON.stringify({ event: 'tourism_api.unavailable', provider: 'langgraph', error_type: errorType }));
      return { statusCode: 503, status: 'provider_error', errors: ['Tourism planning service unavailable.'], itinerary_stops: [], warnings: [] };
    }
  }

  postJson(targetUrl, payload, timeoutMs) {
    return new Promise((resolve, reject) => {
      let url;
      try { url = new URL(targetUrl); } catch { reject(new Error('Invalid LANGGRAPH_API_URL')); return; }
      if (!['http:', 'https:'].includes(url.protocol)) { reject(new Error('Unsupported API protocol')); return; }
      const transport = url.protocol === 'https:' ? require('https') : http;
      const data = JSON.stringify(payload);
      const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
      if (config.langgraphServiceToken) headers.Authorization = `Bearer ${config.langgraphServiceToken}`;
      const req = transport.request({ hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80), path: `${url.pathname}${url.search}`, method: 'POST', headers, timeout: timeoutMs }, res => {
        let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => {
          try { const parsed = JSON.parse(body); if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed); else reject(new Error(parsed.errors?.join('; ') || `API returned ${res.statusCode}`)); }
          catch (e) { reject(e instanceof SyntaxError ? new Error('Invalid JSON from tourism API') : e); }
        });
      });
      req.on('error', reject); req.on('timeout', () => req.destroy(new Error('Tourism API request timed out'))); req.end(data);
    });
  }
}
module.exports = new TourismWorkflowClient();
