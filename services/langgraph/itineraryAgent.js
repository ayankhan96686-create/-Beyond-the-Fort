/**
 * Agent 5: Itinerary Optimization & Feasibility Engine
 * Recreated natively in JavaScript from Python agents/itinerary_agent.py
 * Enforces non-negotiable +25% transit safety buffer: Buffer = Math.ceil(0.25 * elapsed)
 */

const BUFFER_RATIO = 0.25;

function parseMinutes(t) {
  if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
  const parts = t.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function formatClock(m) {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const min = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function knownHoursFit(p, arrival, leave) {
  const hours = p.operating_hours;
  if (!hours || typeof hours !== 'object' || Array.isArray(hours)) return true;
  if (!hours.open || !hours.close) return true;
  try {
    return arrival >= parseMinutes(hours.open) && leave <= parseMinutes(hours.close);
  } catch {
    return false;
  }
}

function itineraryNode(state) {
  const c = state.constraints || {};
  const candidates = state.candidates || [];
  const routes = state.routes || {};
  const destinationId = c.end_location ? 'destination' : 'origin';

  const start = parseMinutes(c.start_time || '10:00');
  const deadline = parseMinutes(c.deadline || '18:00');
  const window = Math.min(Number(c.available_minutes || 240), deadline - start);
  const budget = c.budget;
  const rejected = [...(state.rejected_options || [])];

  let best = [];
  let bestCost = null;

  function search(currentId, now, path, cost, visited) {
    const returnLeg = routes[`${currentId}->${destinationId}`];
    if (path.length > 0 && returnLeg) {
      const transitBack = Number(returnLeg.duration_minutes || 0);
      const totalElapsed = (now - start) + transitBack;
      const buffer = Math.ceil(BUFFER_RATIO * totalElapsed);
      const guaranteed = now + transitBack + buffer;

      if (totalElapsed + buffer <= window && guaranteed <= deadline) {
        if (bestCost === null ||
            path.length > best.length ||
            (path.length === best.length && totalElapsed < bestCost)) {
          best = [...path];
          bestCost = totalElapsed;
        }
      }
    }

    if (path.length >= 3) return;

    for (const p of candidates) {
      const pid = p.id;
      if (visited.has(pid)) continue;
      const leg = routes[`${currentId}->${pid}`];
      if (!leg) continue;

      const price = p.cost_estimate;
      if (budget !== null && budget !== undefined) {
        if (price === null || price === undefined || Number(price) > Number(budget) - cost) {
          rejected.push({
            poi_id: pid,
            poi_name: p.name,
            reason: price === null
              ? 'Budget cannot be validated within the requested limit because the dataset cost is missing or exceeds the remaining budget.'
              : 'Known estimated cost exceeds remaining budget.',
            total_time_required_mins: null,
            available_window_mins: window,
            slack_mins: null
          });
          continue;
        }
      }

      const arr = now + Number(leg.duration_minutes || 0);
      const dwell = Number(p.min_dwell_time_mins || 30);
      const dep = arr + dwell;

      if (!knownHoursFit(p, arr, dep)) {
        rejected.push({
          poi_id: pid,
          poi_name: p.name,
          reason: 'Visit would fall outside known opening hours.',
          total_time_required_mins: null,
          available_window_mins: window,
          slack_mins: null
        });
        continue;
      }

      const step = {
        sequence: path.length + 1,
        poi_id: pid,
        name: p.name,
        category: p.category,
        description: p.description,
        coordinates: p.coordinates,
        address: p.address,
        image_url: p.image_url,
        image_caption: p.image_caption,
        image_credit: p.image_credit,
        image_source_url: p.image_source_url,
        image_license: p.image_license,
        source_url: p.source_url,
        arrival_time: formatClock(arr),
        dwell_mins: dwell,
        departure_time: formatClock(dep),
        transit_from_previous_mins: Number(leg.duration_minutes || 0),
        distance_km: leg.distance_km,
        travel_mode: leg.mode,
        travel_provider: leg.provider,
        opening_hours: p.operating_hours,
        estimated_cost: price
      };

      const newVisited = new Set(visited);
      newVisited.add(pid);
      search(pid, dep, [...path, step], cost + (price !== null && price !== undefined ? Number(price) : 0), newVisited);
    }
  }

  if (candidates.length > 0) {
    search('origin', start, [], 0.0, new Set());
  } else if (c.direct_route_only) {
    const direct = routes['origin->destination'];
    if (direct) {
      const travel = Number(direct.duration_minutes || 0);
      const buffer = Math.ceil(BUFFER_RATIO * travel);
      if (travel + buffer <= window && start + travel + buffer <= deadline) {
        best = [];
        bestCost = travel;
      } else {
        rejected.push({
          poi_id: null,
          poi_name: null,
          reason: 'The direct route exceeds the available time or return deadline after the safety buffer.',
          total_time_required_mins: travel + buffer,
          available_window_mins: window,
          slack_mins: window - (travel + buffer)
        });
      }
    }
  }

  let itinerary = best;
  if (!candidates.length && !c.direct_route_only) {
    rejected.push({
      poi_id: null,
      poi_name: null,
      reason: 'No matching non-placeholder attractions were found in the existing dataset.',
      total_time_required_mins: null,
      available_window_mins: window,
      slack_mins: null
    });
  }

  if (candidates.length && !best.length) {
    for (const p of candidates) {
      if (!rejected.some(r => r.poi_id === p.id)) {
        rejected.push({
          poi_id: p.id,
          poi_name: p.name,
          reason: 'No ordering of this stop met the time window, known opening hours, return travel, and safety-buffer deadline constraints.',
          total_time_required_mins: null,
          available_window_mins: window,
          slack_mins: null
        });
      }
    }
  }

  let estimatedReturn = null;
  let estimatedArrival = null;
  let totalCost = null;
  let buffer = 0;
  const directRouteFeasible = Boolean(c.direct_route_only && !candidates.length && routes['origin->destination']);

  if (itinerary.length > 0 || directRouteFeasible) {
    let finalBase;
    if (itinerary.length > 0) {
      const last = itinerary[itinerary.length - 1];
      const back = routes[`${last.poi_id}->${destinationId}`];
      finalBase = parseMinutes(last.departure_time) + Number((back && back.duration_minutes) || 0);
    } else {
      const direct = routes['origin->destination'];
      finalBase = start + Number((direct && direct.duration_minutes) || 0);
    }
    const elapsed = finalBase - start;
    buffer = Math.ceil(BUFFER_RATIO * elapsed);
    estimatedArrival = formatClock(finalBase);
    estimatedReturn = formatClock(finalBase + buffer);

    if (itinerary.every(s => s.estimated_cost !== null && s.estimated_cost !== undefined)) {
      totalCost = itinerary.reduce((acc, s) => acc + Number(s.estimated_cost), 0);
    }

    if (itinerary.length > 0) {
      itinerary[itinerary.length - 1].buffer_mins = buffer;
    }

    if (finalBase + buffer > deadline || finalBase + buffer - start > window) {
      for (const s of itinerary) {
        rejected.push({
          poi_id: s.poi_id,
          poi_name: s.name,
          reason: 'Final deterministic deadline validation rejected this selection.',
          total_time_required_mins: finalBase + buffer - start,
          available_window_mins: window,
          slack_mins: window - (finalBase + buffer - start)
        });
      }
      itinerary = [];
      estimatedReturn = null;
      totalCost = null;
    }
  }

  const selectedIds = new Set(itinerary.map(s => s.poi_id));
  const finalRejected = rejected.filter(r => !r.poi_id || !selectedIds.has(r.poi_id));

  const trace = [...(state.agent_trace || [])];
  trace.push(`[Itinerary & Optimization] Validated ${itinerary.length} stops; deadline=${c.deadline}; buffer=${buffer}m`);

  const warnings = [...(state.warnings || [])];
  const status = (itinerary.length > 0 || directRouteFeasible) ? 'feasible' : 'infeasible';

  const chainIds = (itinerary.length > 0 || directRouteFeasible)
    ? ['origin', ...itinerary.map(s => s.poi_id), destinationId]
    : [];

  const orderedLegs = [];
  for (let i = 0; i < chainIds.length - 1; i++) {
    const legKey = `${chainIds[i]}->${chainIds[i + 1]}`;
    const leg = routes[legKey];
    if (leg) {
      orderedLegs.push({ leg: legKey, ...leg });
    }
  }

  const totalTravel = orderedLegs.reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0);
  const totalDistance = Math.round(orderedLegs.reduce((acc, l) => acc + Number(l.distance_km || 0), 0) * 1000) / 1000;
  const totalVisit = itinerary.reduce((acc, s) => acc + Number(s.dwell_mins || 0), 0);

  return {
    itinerary,
    rejected_options: finalRejected,
    estimated_return_time: estimatedReturn,
    estimated_arrival_time: estimatedArrival,
    total_cost: totalCost,
    status,
    warnings,
    agent_trace: trace,
    ordered_route_legs: orderedLegs,
    total_travel_minutes: totalTravel,
    total_visit_minutes: totalVisit,
    total_distance_km: totalDistance,
    safety_buffer_minutes: buffer,
    direct_route_feasible: directRouteFeasible
  };
}

module.exports = {
  itineraryNode,
  parseMinutes,
  formatClock
};

