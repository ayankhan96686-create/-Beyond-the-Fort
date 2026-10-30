/**
 * Results Map Controller - Beyond the Fort
 * Safely parses serialized GIS corridor data and initializes Leaflet visualization
 */
document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('corridorMap');
  if (!mapEl) return;

  const dataScript = document.getElementById('corridorMapData');
  if (!dataScript) return;

  let payload = {};
  try {
    payload = JSON.parse(dataScript.textContent);
  } catch (err) {
    console.error('Failed to parse corridor map data:', err);
    return;
  }

  const origin = payload.origin || { coordinates: { lat: 26.2298, lng: 78.1733 }, label: 'Gwalior Fort Main Gate' };
  const originLat = origin.coordinates ? origin.coordinates.lat : (origin.lat || 26.2298);
  const originLng = origin.coordinates ? origin.coordinates.lng : (origin.lng || 78.1733);
  const originLabel = origin.label || 'Gwalior Fort Main Gate';

  const allPois = Array.isArray(payload.allPois) ? payload.allPois : [];
  const itineraryStops = Array.isArray(payload.itineraryStops) ? payload.itineraryStops : [];
  const rejected = Array.isArray(payload.rejected) ? payload.rejected : [];

  if (typeof L === 'undefined') {
    console.warn('Leaflet library is unavailable.');
    return;
  }

  const map = L.map('corridorMap').setView([originLat, originLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors | Team Venator'
  }).addTo(map);

  L.circle([originLat, originLng], {
    color: '#10B981',
    dashArray: '6, 6',
    fillColor: '#10B981',
    fillOpacity: 0.04,
    radius: 3000
  }).addTo(map).bindPopup('<strong>3.0 km Micro-Corridor Boundary</strong><br>Authentic cultural artisans start beyond this line.');

  L.circle([originLat, originLng], {
    color: '#059669',
    dashArray: '4, 8',
    fillColor: '#059669',
    fillOpacity: 0.02,
    radius: 8000
  }).addTo(map).bindPopup('<strong>8.0 km Outer Pilot Limit</strong><br>Maximum safe travel radius for 5-8h day visitors.');

  const fortIcon = L.divIcon({
    className: 'custom-pin pin-fort',
    html: '🏰',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  L.marker([originLat, originLng], { icon: fortIcon }).addTo(map)
    .bindPopup(`<strong>📍 Departure / Return Hub</strong><br>${originLabel}`)
    .openPopup();

  const routePoints = [[originLat, originLng]];

  itineraryStops.forEach(stop => {
    const poi = allPois.find(p => p.id === stop.poi_id) || {};
    const lat = (stop.coordinates && stop.coordinates.lat) || (poi.coordinates && poi.coordinates.lat);
    const lng = (stop.coordinates && stop.coordinates.lng) || (poi.coordinates && poi.coordinates.lng);

    if (lat && lng) {
      routePoints.push([lat, lng]);

      const stopIcon = L.divIcon({
        className: 'custom-pin pin-stop',
        html: `<span>${stop.sequence}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const verifiedBadge = stop.source_class === 'VERIFIED' ? '✅ Verified' : (stop.source_class === 'STAKEHOLDER-PROVIDED' ? '📌 Local source' : 'ℹ️ Estimate');

      L.marker([lat, lng], { icon: stopIcon }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 0.85rem;">
            <div style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Stop #${stop.sequence}: ${stop.name}</div>
            <div style="color: #64748B; margin-bottom: 6px;">Schedule: <strong>${stop.arrival_time} &ndash; ${stop.departure_time}</strong> (${stop.dwell_mins}m dwell)</div>
            <div style="color: #64748B; margin-bottom: 6px;">Transit from previous: <strong>${stop.transit_from_previous_mins}m</strong> (${stop.distance_km} km)</div>
            <div>Status: <span style="font-weight: 700; font-size: 0.75rem;">${verifiedBadge}</span></div>
          </div>
        `);
    }
  });

  rejected.forEach(rej => {
    const p = allPois.find(item => item.id === rej.poi_id || item.name === rej.poi_name);
    if (p && p.coordinates && p.coordinates.lat && p.coordinates.lng) {
      const prunedIcon = L.divIcon({
        className: 'custom-pin pin-pruned',
        html: '✕',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([p.coordinates.lat, p.coordinates.lng], { icon: prunedIcon }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 0.82rem; color: #991B1B;">
            <strong>🚫 PRUNED: ${p.name}</strong><br>
            <span>Deficit: ${rej.slack_mins} min</span><br>
            <span style="font-size: 0.75rem; color: #7F1D1D;">${rej.reason}</span>
          </div>
        `);
    }
  });

  if (routePoints.length > 1) {
    routePoints.push([originLat, originLng]);
    const polyline = L.polyline(routePoints, {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 6'
    }).addTo(map);
    map.fitBounds(polyline.getBounds().pad(0.18));
  }
});

