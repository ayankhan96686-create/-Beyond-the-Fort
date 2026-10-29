(() => {
  const root = document.getElementById('itineraryContent');
  if (!root) return;
  const trip = (() => { try { return JSON.parse(sessionStorage.getItem('beyondFortTrip') || 'null'); } catch { return null; } })();
  const element = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const link = (href, text, className = '') => { const a = element('a', className, text); a.href = href; return a; };
  if (!trip?.itinerary) {
    root.replaceChildren(element('section', 'empty-state', 'No itinerary is saved in this tab. Build a plan first; your choices and results stay available while this tab is open.'));
    const a = link('/#trip-planner', 'Plan a visit', 'detail-action primary'); root.append(a); return;
  }
  const { request, itinerary } = trip;
  const summary = itinerary.trip_summary || {};
  const status = itinerary.status || 'infeasible';
  const heading = element('span', 'section-kicker', 'A DAY MADE AROUND YOU');
  const title = element('h1', 'subpage-title', status === 'feasible' ? 'Your Gwalior itinerary' : 'A plan for another time');
  const statusPill = element('span', `status-pill status-${status}`, status === 'feasible' ? 'Fits your day' : status.replace('_', ' '));
  const header = element('div', 'itinerary-title-row'); header.append(title, statusPill);
  const intro = element('p', 'subpage-lede', status === 'feasible' ? 'Your stops are ordered around the time you have and your return deadline.' : 'The planner could not fit any stops within these constraints. See the notes below or adjust your preferences.');
  const meta = element('div', 'trip-summary-grid');
  const startLocation = itinerary.start_location || request.start_location || request.return_location_coordinates || request.origin;
  const endLocation = itinerary.end_location || request.end_location || (request.return_to_start ? startLocation : null);
  const locationLabel = item => item?.label || 'Location not specified';
  const values = [
    ['Starting point', locationLabel(startLocation)], ['Destination', locationLabel(endLocation)], ['Visit date', summary.date || request.date], ['Start', summary.start_time || request.start_time], ['Return by', itinerary.deadline || request.deadline],
    ['Available time', `${request.available_minutes} minutes`], ['Budget', request.budget == null ? 'No limit set' : `₹${request.budget}`],
    ['Interests', (request.interests || []).join(', ') || '—'],
    ['Group', ({ solo: 'Just me', couple: 'Two people', family: 'Family with children', group: 'Group' })[request.companion] || '—'],
    ['Transport', ({ auto: 'Auto-rickshaw', e_rickshaw: 'E-rickshaw', cab: 'Cab' })[summary.transport_mode || request.transport_mode] || summary.transport_mode || request.transport_mode || '—']
  ];
  values.forEach(([label, value]) => { const box = element('div', 'trip-meta'); box.append(element('span', '', label), element('strong', '', String(value ?? '—'))); meta.append(box); });
  root.replaceChildren(heading, header, intro, meta);
  const actions = element('div', 'detail-actions');
  actions.append(link('/#trip-planner', '← Edit preferences', 'detail-action'));
  const regenerate = element('button', 'detail-action', '↻ Regenerate itinerary'); regenerate.type = 'button'; regenerate.addEventListener('click', async () => {
    regenerate.disabled = true; regenerate.textContent = 'Rebuilding…';
    try {
      const response = await fetch('/api/v1/tourism-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.timeout(50000) });
      const next = await response.json();
      if (!response.ok || !['feasible', 'infeasible'].includes(next.status)) throw new Error(next.errors?.join(' ') || 'Planning service unavailable.');
      sessionStorage.setItem('beyondFortTrip', JSON.stringify({ request, itinerary: next })); location.reload();
    } catch (error) { const message = element('p', 'form-error', `Could not regenerate: ${error.message}`); actions.after(message); }
    finally { regenerate.disabled = false; regenerate.textContent = '↻ Regenerate itinerary'; }
  });
  actions.append(regenerate); root.append(actions);
  const stopList = itinerary.itinerary_stops || [];
  const mapMarkers = new Map();
  if (status === 'feasible' && (stopList.length || itinerary.route_legs?.length)) {
    const mapSection = element('section', 'itinerary-section trip-map-section');
    mapSection.setAttribute('aria-labelledby', 'tripMapTitle');
    const mapHeading = element('div', 'trip-map-heading');
    const mapHeadingCopy = element('div');
    mapHeadingCopy.append(element('span', 'section-kicker', 'YOUR ROUTE'), element('h2', 'subsection-title', 'Where you’re going'));
    mapHeadingCopy.querySelector('h2').id = 'tripMapTitle';
    const originLabel = locationLabel(startLocation);
    const destinationLabel = locationLabel(endLocation);
    const routeNames = [originLabel, ...stopList.map((stop, index) => `${index + 1}. ${stop.name}`), destinationLabel];
    mapHeading.append(mapHeadingCopy, element('p', 'trip-route-summary', routeNames.join('  →  ')));
    const mapNode = element('div', 'trip-map-canvas');
    mapNode.id = 'tripMap'; mapNode.setAttribute('role', 'region'); mapNode.setAttribute('aria-label', 'Map showing your start point, ordered itinerary stops, route, and return point');
    const mapNote = element('p', 'trip-map-note', 'Map route follows the selected stop order. Driving times come from the routing provider; place details and hours may need confirmation.');
    mapSection.append(mapHeading, mapNode, mapNote); root.append(mapSection);

    const origin = startLocation;
    const destination = endLocation;
    const validPoint = point => { const lat = Number(point?.latitude ?? point?.lat), lng = Number(point?.longitude ?? point?.lng); return point && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180; };
    const pointArray = point => [Number(point.latitude ?? point.lat), Number(point.longitude ?? point.lng)];
    const leaflet = window.L;
    if (leaflet && validPoint(origin)) {
      const map = leaflet.map(mapNode, { scrollWheelZoom: false, zoomControl: true });
      leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
      }).addTo(map);
      const bounds = leaflet.latLngBounds([]);
      const originPoint = pointArray(origin);
      bounds.extend(originPoint);
      const makeIcon = (label, kind) => leaflet.divIcon({
        className: 'trip-map-icon-shell', iconSize: [38, 44], iconAnchor: [19, 42],
        html: `<span class="trip-map-marker trip-map-marker-${kind}">${label}</span>`
      });
      const markerPopup = (titleText, detailText) => {
        const popup = document.createElement('div'); popup.className = 'trip-map-popup';
        popup.append(element('strong', '', titleText), element('span', '', detailText)); return popup;
      };
      const startMarker = leaflet.marker(originPoint, { icon: makeIcon('S', 'start'), title: `Start: ${originLabel}` })
        .addTo(map).bindPopup(markerPopup('Start', originLabel));
      mapMarkers.set('__origin', startMarker);

      const travelByLeg = new Map((itinerary.travel_estimates || []).map(leg => [leg.leg, leg]));
      const orderedPoints = [{ id: 'origin', point: origin }];
      stopList.forEach((stop, index) => {
        if (!validPoint(stop.coordinates)) return;
        const point = pointArray(stop.coordinates);
        bounds.extend(point); orderedPoints.push({ id: stop.poi_id, point: stop.coordinates });
        const detail = `${stop.arrival_time || '—'} arrival · ${stop.dwell_mins ?? '—'} minute visit`;
        const marker = leaflet.marker(point, { icon: makeIcon(String(index + 1), 'stop'), title: `Stop ${index + 1}: ${stop.name}` })
          .addTo(map).bindPopup(markerPopup(`Stop ${index + 1} · ${stop.name}`, detail));
        mapMarkers.set(stop.poi_id, marker);
      });
      if (validPoint(destination)) {
        const point = pointArray(destination); bounds.extend(point);
        const samePoint = Math.abs(point[0] - originPoint[0]) < 1e-7 && Math.abs(point[1] - originPoint[1]) < 1e-7;
        const marker = leaflet.marker(point, { icon: samePoint ? makeIcon('S/E', 'start') : makeIcon('E', 'end'), title: samePoint ? `Start and End: ${originLabel}` : `End: ${destinationLabel}` }).addTo(map).bindPopup(markerPopup(samePoint ? 'Start & End · return destination' : 'End', destinationLabel));
        mapMarkers.set('__destination', marker);
        orderedPoints.push({ id: 'destination', point: destination });
      }
      const orderedLegs = itinerary.route_legs || [];
      let geometryCount = 0;
      orderedLegs.forEach(leg => {
        if (leg.geometry?.type === 'LineString' && Array.isArray(leg.geometry.coordinates) && leg.geometry.coordinates.length > 1) {
          leaflet.geoJSON(leg.geometry, { style: { color: '#8d3931', weight: 5, opacity: 0.86 } }).addTo(map);
          geometryCount += 1;
        }
      });
      if (!geometryCount) mapNote.textContent = 'The routing provider did not return road geometry. Start, stop, and end markers are shown; no connecting road line is drawn.';
      else if (geometryCount < orderedLegs.length) mapNote.textContent = 'Solid lines show provider road geometry for legs where available. Other legs have no road geometry and are left unconnected.';
      else mapNote.textContent = 'Solid lines show route geometry returned by the routing provider. OpenStreetMap tiles © OpenStreetMap contributors.';
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      window.setTimeout(() => map.invalidateSize(), 0);
    } else {
      mapNode.replaceWith(element('p', 'empty-note', 'The map could not load. Your stop list and travel estimates are still available below.'));
    }
  }
  const section = element('section', 'itinerary-section'); section.append(element('h2', 'subsection-title', 'Your stops'));
  if (stopList.length) {
    const list = element('div', 'itinerary-cards');
    stopList.forEach((stop, index) => {
      const card = element('article', 'itinerary-card');
      const imageFrame = element('div', 'attraction-image-frame');
      if (stop.image_url) {
        const img = element('img'); img.src = stop.image_url; img.alt = stop.image_caption || `${stop.name || 'Attraction'} photo`; img.loading = 'lazy';
        img.addEventListener('error', () => { img.replaceWith(element('span', 'image-placeholder', 'PHOTO UNAVAILABLE')); }, { once: true });
        imageFrame.append(img);
        if (stop.image_credit && stop.image_source_url) {
          const credit = link(stop.image_source_url, `Photo: ${stop.image_credit} · ${stop.image_license || 'license'}`, 'photo-credit');
          credit.target = '_blank'; credit.rel = 'noopener noreferrer'; imageFrame.append(credit);
        }
      }
      else { imageFrame.append(element('span', 'image-placeholder', 'GWALIOR · LIVING HERITAGE')); }
      const body = element('div', 'itinerary-card-body');
      body.append(element('span', 'stop-index', `STOP ${String(index + 1).padStart(2, '0')}`), element('h3', '', stop.name || 'Curated attraction'));
      if (stop.image_caption) body.append(element('p', 'image-caption', stop.image_caption));
      const description = element('p', 'attraction-description', stop.description || 'Loading the curated attraction description…');
      body.append(description);
      const timing = element('div', 'stop-timings');
      timing.append(element('span', '', `${stop.arrival_time || '—'} → ${stop.departure_time || '—'}`), element('span', '', `${stop.dwell_mins ?? stop.visit_duration_minutes ?? '—'} min visit`));
      if (stop.transit_from_previous_mins != null) timing.append(element('span', '', `${stop.transit_from_previous_mins} min travel${stop.distance_km != null ? ` · ${stop.distance_km} km` : ''}`));
      body.append(timing);
      if (stop.address) body.append(element('span', 'stop-address', stop.address));
      const evidence = (itinerary.evidence || []).filter(item => item.record_id === stop.poi_id);
      const hasVerifiedSource = evidence.some(item => item.classification === 'VERIFIED' && item.source);
      const label = hasVerifiedSource ? (evidence.some(item => /^https?:\/\//i.test(item.source || '')) ? 'Verified · linked source' : 'Verified · reference recorded') : evidence.some(item => item.classification === 'STAKEHOLDER_PROVIDED') ? 'Community provided' : 'AI inference / unverified';
      body.append(element('span', 'evidence-label', label));
      evidence.filter(item => item.source && /^https?:\/\//i.test(item.source)).forEach(item => {
        try { const source = new URL(item.source); if (['https:', 'http:'].includes(source.protocol)) { const a = link(source.href, 'Evidence source ↗', 'text-link'); a.target = '_blank'; a.rel = 'noopener noreferrer'; body.append(a); } } catch {}
      });
      if (stop.source_url && /^https?:\/\//i.test(stop.source_url) && !String(stop.poi_id).startsWith('poi_gwl_')) {
        const source = link(stop.source_url, 'Open place listing ↗', 'text-link'); source.target = '_blank'; source.rel = 'noopener noreferrer'; body.append(source);
      } else {
        const view = link(`/attractions/${encodeURIComponent(stop.poi_id)}`, 'View details →', 'text-link'); body.append(view);
      }
      const focus = element('button', 'stop-map-focus', 'Show on map'); focus.type = 'button';
      focus.addEventListener('click', () => { const marker = mapMarkers.get(stop.poi_id); if (marker) { marker.openPopup(); marker.getElement()?.focus(); } });
      body.append(focus);
      card.append(imageFrame, body); list.append(card);
      fetch(`/api/v1/attractions/${encodeURIComponent(stop.poi_id)}`).then(r => r.ok ? r.json() : null).then(payload => {
        const poi = payload?.data;
        if (!poi) { description.textContent = 'Description is not available in the curated record.'; return; }
        description.textContent = poi.description || 'Description is not available in the curated record.';
        const imageUrl = poi.image_url || poi.images?.[0];
        if (imageUrl && !stop.image_url) { const img = element('img'); img.src = imageUrl; img.alt = poi.name || 'Attraction'; img.loading = 'lazy'; imageFrame.replaceChildren(img); }
      }).catch(() => { description.textContent = 'Curated attraction details could not be loaded.'; });
    });
    section.append(list);
  } else section.append(element('p', 'empty-note', 'No attractions fit this plan. Try more time, a later return deadline, or different interests.'));
  if (itinerary.estimated_arrival_time || itinerary.estimated_return_time) section.append(element('p', 'return-time', `Estimated arrival at destination: ${itinerary.estimated_arrival_time || itinerary.estimated_return_time}${itinerary.deadline ? ` · deadline ${itinerary.deadline}` : ''}${itinerary.safety_buffer_minutes != null ? ` · ${itinerary.safety_buffer_minutes} min safety buffer` : ''}`));
  root.append(section);
  for (const [headingText, entries, field, className] of [['Warnings', itinerary.warnings, null, ''], ['Places not selected', itinerary.rejected_options, 'reason', '']]) {
    if (!entries?.length) continue;
    const section = element('section', 'itinerary-section notes-section'); section.append(element('h2', 'subsection-title', headingText));
    const ul = element('ul', 'note-list'); entries.forEach(item => ul.append(element('li', '', typeof item === 'string' ? item : `${item.poi_name ? `${item.poi_name}: ` : ''}${item[field] || 'Details unavailable'}`)));
    section.append(ul); root.append(section);
  }
})();
