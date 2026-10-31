/**
 * Agent 1: Manager & Intent Decomposition
 * Recreated natively in JavaScript from Python agents/manager.py
 */

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const LOCATION_SOURCES = new Set(['browser_geolocation', 'manual_geocoded', 'map_pin', 'manual_coordinates', 'legacy_config']);

function normalizeLocation(value, field, legacyLabel = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const rawLat = value.latitude ?? value.lat;
  const rawLng = value.longitude ?? value.lng;
  if (typeof rawLat === 'boolean' || typeof rawLng === 'boolean') return null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  const source = value.source || (legacyLabel ? 'legacy_config' : 'map_pin');
  if (typeof source !== 'string' || !LOCATION_SOURCES.has(source)) return null;
  const label = String(value.label || legacyLabel || field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).trim();
  if (!label || label.length > 200) return null;
  const normalized = {
    label,
    latitude: lat,
    longitude: lng,
    lat,
    lng,
    source
  };
  if (typeof value.place_id === 'string' && value.place_id.trim()) {
    normalized.place_id = value.place_id.trim().slice(0, 200);
  }
  if (value.accuracy_m !== undefined && value.accuracy_m !== null) {
    const acc = Number(value.accuracy_m);
    if (!Number.isFinite(acc) || acc < 0) return null;
    normalized.accuracy_m = acc;
  }
  if (typeof value.captured_at === 'string') {
    if (isNaN(Date.parse(value.captured_at))) return null;
    normalized.captured_at = value.captured_at;
  }
  return normalized;
}

function managerNode(state) {
  const req = Object.assign({}, state.request || {});
  const missing = [];
  const query = String(req.user_query || req.query || '').trim().slice(0, 1000);
  let rawInterests = req.interests;
  let interests = typeof rawInterests === 'string' ? [rawInterests] : rawInterests;
  if (!interests || !interests.length) {
    interests = query ? [query] : [];
  }
  if (Array.isArray(interests)) {
    interests = interests
      .filter(x => typeof x === 'string' && x.trim())
      .map(x => x.trim().slice(0, 100))
      .slice(0, 10);
  } else {
    interests = [];
  }

  const legacyStart = req.return_location_coordinates || req.origin;
  const rawStart = req.start_location || legacyStart;
  const start = normalizeLocation(rawStart, 'start_location', req.return_location);
  if (!start) {
    missing.push('start_location (valid selected coordinates)');
    if (!('start_location' in req)) {
      missing.push('return_location_coordinates (valid latitude/longitude)');
    }
  }

  let returnToStart = req.return_to_start;
  if (returnToStart === undefined) {
    returnToStart = !req.end_location;
  }
  if (typeof returnToStart !== 'boolean') {
    missing.push('return_to_start (boolean)');
    returnToStart = false;
  }

  const end = returnToStart ? start : normalizeLocation(req.end_location, 'end_location');
  if (!end && !returnToStart) {
    missing.push('end_location (valid selected coordinates)');
  }

  const fields = {
    city: req.city || 'Gwalior',
    date: req.date,
    start_time: req.start_time || '10:00',
    available_minutes: req.available_minutes,
    deadline: req.deadline || req.return_deadline || '18:00',
    return_location: (end && end.label) || req.return_location || (start && start.label),
    interests,
    transport_mode: req.transport_mode || req.transit_mode || 'auto'
  };

  let directRouteOnly = req.direct_route_only;
  if (directRouteOnly === undefined) directRouteOnly = false;
  if (typeof directRouteOnly !== 'boolean') {
    missing.push('direct_route_only (boolean)');
    directRouteOnly = false;
  }

  if (!interests.length && !directRouteOnly) {
    missing.push('interests (or explicitly request a direct route)');
  }

  for (const [k, v] of Object.entries(fields)) {
    if ((v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) &&
        !(k === 'interests' && directRouteOnly)) {
      missing.push(k);
    }
  }

  for (const name of ['start_time', 'deadline']) {
    if (!missing.includes(name) && !TIME_RE.test(String(fields[name]))) {
      missing.push(`${name} (HH:MM)`);
    }
  }

  if (!missing.some(m => m.startsWith('start_time')) && !missing.some(m => m.startsWith('deadline'))) {
    if (String(fields.deadline) <= String(fields.start_time)) {
      missing.push('deadline (must be later than start_time)');
    }
  }

  if (typeof fields.available_minutes === 'boolean') {
    missing.push('available_minutes (positive integer)');
  } else {
    const dur = Number(fields.available_minutes);
    if (!Number.isInteger(dur) || dur <= 0) {
      if (!missing.includes('available_minutes')) missing.push('available_minutes (positive integer)');
    } else {
      fields.available_minutes = dur;
    }
  }

  if (!missing.includes('date') && fields.date) {
    const d = new Date(String(fields.date));
    if (isNaN(d.getTime())) missing.push('date (YYYY-MM-DD)');
  }

  const allowedModes = new Set(['auto', 'e_rickshaw', 'cab', 'walk', 'public_transit', 'mixed']);
  if (fields.transport_mode && !allowedModes.has(fields.transport_mode)) {
    missing.push('transport_mode (supported mode)');
  }

  const allowedCompanions = new Set(['solo', 'couple', 'family', 'group']);
  const companion = req.companion;
  if (companion && (!allowedCompanions.has(companion))) {
    missing.push('companion (supported option)');
  }

  let budget = req.budget;
  if (budget === '' || budget === undefined || budget === null) {
    budget = null;
  } else {
    const b = Number(budget);
    if (!Number.isFinite(b) || b < 0) {
      missing.push('budget (non-negative number)');
      budget = null;
    } else {
      budget = b;
    }
  }

  const constraints = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== null && v !== undefined) constraints[k] = v;
  }
  if (companion && allowedCompanions.has(companion)) {
    constraints.companion = companion;
  }
  Object.assign(constraints, {
    start_location: start,
    end_location: end,
    return_to_start: returnToStart,
    return_location_coordinates: start,
    budget,
    direct_route_only: directRouteOnly
  });

  const trace = [...(state.agent_trace || [])];
  trace.push('[Manager] Parsed explicit request; missing required fields: ' + (missing.length ? missing.join(', ') : 'none'));

  return {
    constraints,
    missing_fields: Array.from(new Set(missing)).sort(),
    status: missing.length ? 'needs_input' : state.status,
    agent_trace: trace
  };
}

module.exports = {
  managerNode,
  normalizeLocation
};

