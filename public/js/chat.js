(() => {
  const byId = id => document.getElementById(id);
  const t = (key, fallback) => { const value = window.BeyondI18n?.t(key); return !value || value === key ? fallback : value; };
  const messages = byId('chatMessages'); const form = byId('chatForm'); const input = byId('messageInput');
  let conversationId = crypto.randomUUID(); let busy = false;
  const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; return el; };
  const scroll = () => { messages.scrollTop = messages.scrollHeight; };
  function addMessage(role, text) { const bubble = node('div', `chat-bubble ${role}`, text); messages.append(bubble); scroll(); return bubble; }
  function tripRequest() {
    const label = byId('startLabel').value.trim(); const lat = Number(byId('startLat').value); const lng = Number(byId('startLng').value);
    const start_location = label && byId('startLat').value && byId('startLng').value ? { label, latitude: lat, longitude: lng, source: 'manual_coordinates' } : null;
    const returning = byId('returnToStart').checked;
    const end_location = returning ? start_location : (byId('endLabel').value.trim() && byId('endLat').value && byId('endLng').value ? { label: byId('endLabel').value.trim(), latitude: Number(byId('endLat').value), longitude: Number(byId('endLng').value), source: 'manual_coordinates' } : null);
    const interests = byId('interests').value.split(',').map(s => s.trim()).filter(Boolean);
    return { city: 'Gwalior', date: byId('visitDate').value, start_time: byId('startTime').value, deadline: byId('deadline').value, available_minutes: Number(byId('availableMinutes').value), start_location, end_location, return_to_start: returning, interests, transport_mode: 'auto' };
  }
  function addResult(result, request) {
    const card = node('section', 'chat-result');
    card.append(node('strong', '', result.status === 'feasible' ? 'Itinerary · fits the selected time window' : result.status === 'infeasible' ? 'Itinerary · no feasible route found' : 'Trip details needed'));
    const stops = result.itinerary_stops || [];
    if (stops.length) { const list = node('ol', 'chat-stop-list'); stops.forEach(stop => { const li = node('li'); const title = node('a', '', stop.name || stop.poi_id); if (stop.poi_id) title.href = `/attractions/${encodeURIComponent(stop.poi_id)}`; li.append(title); li.append(document.createTextNode(` · ${stop.planned_arrival || stop.arrival_time || 'time not provided'}${stop.planned_departure || stop.departure_time ? `–${stop.planned_departure || stop.departure_time}` : ''}`)); if (stop.evidence_class || stop.verification_status) li.append(node('small', '', `Evidence: ${stop.evidence_class || stop.verification_status}`)); list.append(li); }); card.append(list); }
    (result.route_legs || result.travel_estimates || []).forEach(leg => card.append(node('p', 'chat-estimate', `${leg.origin || leg.from || leg.leg || 'Route'} → ${leg.destination || leg.to || ''}: ${leg.duration_minutes ?? leg.travel_minutes ?? 'unknown'} min${leg.provider ? ` · ${leg.provider}` : ''}`)));
    (result.evidence || []).forEach(item => card.append(node('p', 'chat-estimate', `${item.name || item.poi_id || 'Source'} · ${item.classification || item.evidence_class || item.verification_status || 'source status not provided'}${item.source_reference ? ` · ${item.source_reference}` : ''}`)));
    [...(result.warnings || []), ...(result.errors || []), ...(result.missing_fields || [])].forEach(w => card.append(node('p', 'chat-warning', w)));
    if (result.status === 'feasible') {
      sessionStorage.setItem('beyondFortTrip', JSON.stringify({ request, itinerary: result }));
      const links = node('div', 'chat-result-actions'); const view = node('a', 'detail-action primary', 'View itinerary'); view.href = '/itinerary'; links.append(view);
      if (result.start_location || result.itinerary_stops?.some(s => s.coordinates)) { const map = node('a', 'detail-action', 'View map'); map.href = '/itinerary#tripMap'; links.append(map); }
      card.append(links);
    }
    messages.append(card); scroll();
  }
  async function send(text, intent) {
    if (busy || !text.trim()) return; busy = true; byId('chatStatus').textContent = '';
    addMessage('user', text); input.value = '';
    const loading = addMessage('assistant loading', t('chat.loading', 'Checking available information…'));
    try {
      const request = tripRequest();
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken() }, body: JSON.stringify({ message: text, conversationId, trip: request, locale: window.BeyondI18n?.getLocale() || 'en', ...(intent === 'plan' ? { intent } : {}) }), signal: AbortSignal.timeout(65000) });
      const data = await response.json(); loading.remove();
      if (!response.ok) { addMessage('error', data.message || t('chat.error', 'The service could not complete your request. Please try again.')); return; }
      addMessage('assistant', data.reply || 'The service returned no reply.');
      if (data.result) addResult(data.result, request);
    } catch (error) { loading.remove(); addMessage('error', error.name === 'TimeoutError' ? t('chat.timeout', 'The request timed out. Please try again.') : t('chat.retry', 'Could not reach the tourism service. Check your connection and try again.')); }
    finally { busy = false; input.focus(); }
  }
  form.addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  document.querySelectorAll('.chat-prompts button').forEach(button => button.addEventListener('click', () => send(button.textContent, button.dataset.chatIntent)));
  byId('returnToStart').addEventListener('change', event => { ['endLocationField','endLatField','endLngField'].forEach(id => { byId(id).hidden = event.target.checked; }); });
  byId('useLocation').addEventListener('click', () => {
    const status = byId('chatStatus');
    if (!navigator.geolocation) { status.textContent = 'This browser does not provide location access. Enter coordinates manually.'; return; }
    status.textContent = 'Waiting for your location permission…';
    navigator.geolocation.getCurrentPosition(position => { byId('startLat').value = position.coords.latitude; byId('startLng').value = position.coords.longitude; byId('startLabel').value = 'My current location'; status.textContent = 'Starting point set for this conversation.'; }, error => { status.textContent = error.code === 1 ? 'Location permission was denied. Enter your starting coordinates manually.' : 'Location is unavailable. Enter your starting coordinates manually.'; }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  });
  byId('newChat').addEventListener('click', async () => { try { await fetch('/api/chat/reset', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken() }, body: JSON.stringify({ conversationId }) }); } catch {} conversationId = crypto.randomUUID(); messages.replaceChildren(addMessage('assistant', t('chat.welcome', 'A new conversation is ready. What would you like to discover?'))); byId('chatStatus').textContent = ''; });
  function csrfToken() { return decodeURIComponent(document.cookie.split('; ').find(x => x.startsWith('beyond_fort_csrf='))?.split('=').slice(1).join('=') || ''); }
  const d = new Date(); byId('visitDate').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();
