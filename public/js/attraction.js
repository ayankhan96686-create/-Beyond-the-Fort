(() => {
  const root = document.getElementById('attractionDetail');
  if (!root) return;
  const id = root.dataset.attractionId;
  const trip = (() => { try { return JSON.parse(sessionStorage.getItem('beyondFortTrip') || 'null'); } catch { return null; } })();
  const back = document.getElementById('backToItinerary');
  const request = trip?.request;
  if (request) back.href = '/itinerary';
  const make = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const row = (label, value) => { const box = make('div', 'detail-fact'); box.append(make('span', '', label), make('strong', '', value)); return box; };
  fetch(`/api/v1/attractions/${encodeURIComponent(id)}`).then(async response => {
    const payload = await response.json();
    if (!response.ok || payload.status !== 'success') throw new Error(payload.message || 'Attraction not found.');
    const poi = payload.data;
    root.replaceChildren();
    const hero = make('div', 'detail-hero');
    if (poi.image_url || poi.images?.length) {
      const images = poi.images?.length ? poi.images : [poi.image_url];
      const gallery = make('div', 'detail-gallery'); images.forEach((src, index) => { const img = make('img'); img.src = src; img.alt = `${poi.name || 'Attraction'}${images.length > 1 ? ` · image ${index + 1}` : ''}`; hero.append(img); });
    } else hero.append(make('span', 'image-placeholder', 'NO IMAGE IN THE CURATED RECORD'));
    const content = make('div', 'detail-content');
    content.append(make('span', 'section-kicker', poi.category || 'GWALIOR ATTRACTION'), make('h1', 'subpage-title', poi.name || 'Attraction details'));
    if (poi.description) content.append(make('p', 'detail-description', poi.description));
    const why = make('section', 'detail-block'); why.append(make('h2', 'subsection-title', 'Why it matches your interests'));
    const interests = request?.interests || [];
    why.append(make('p', 'muted-copy', interests.length ? `Selected interests: ${interests.join(', ')}. This attraction came from the curated dataset used to build your itinerary.` : 'Interest context is not available in this browser tab.')); content.append(why);
    const facts = make('div', 'detail-facts');
    facts.append(row('City', poi.city || 'Gwalior (pilot dataset)'));
    if (poi.address) facts.append(row('Address', poi.address)); else facts.append(row('Address', 'Not listed in the curated record'));
    if (poi.coordinates && Number.isFinite(Number(poi.coordinates.lat)) && Number.isFinite(Number(poi.coordinates.lng))) facts.append(row('Coordinates', `${poi.coordinates.lat}, ${poi.coordinates.lng}`)); else facts.append(row('Coordinates', 'Not available'));
    facts.append(row('Suggested visit', poi.min_dwell_time_mins != null ? `${poi.min_dwell_time_mins} minutes` : 'Not available'));
    facts.append(row('Opening hours', poi.operating_hours?.open && poi.operating_hours?.close ? `${poi.operating_hours.open}–${poi.operating_hours.close} (recorded; date-specific schedule unavailable)` : 'Not available'));
    facts.append(row('Entry fee', poi.entry_fee != null ? String(poi.entry_fee) : 'Not listed in the curated record'));
    content.append(facts);
    if (poi.highlights?.length) { const ul = make('ul', 'note-list'); poi.highlights.forEach(value => ul.append(make('li', '', value))); const block = make('section', 'detail-block'); block.append(make('h2', 'subsection-title', 'Highlights in the record'), ul); content.append(block); }
    const sourceBlock = make('section', 'detail-block'); sourceBlock.append(make('h2', 'subsection-title', 'Sources & provenance'));
    const sourceLinks = [poi.source_url, ...(poi.source_urls || [])].filter(Boolean);
    if (sourceLinks.length) sourceLinks.forEach(url => { try { const parsed = new URL(url); if (['https:', 'http:'].includes(parsed.protocol)) { const a = make('a', 'text-link', poi.source_reference || parsed.hostname); a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; sourceBlock.append(a); } } catch {} });
    else sourceBlock.append(make('p', 'muted-copy', 'No source URL or reference is attached to this record. The stored verification label alone is not independent source evidence.'));
    if (poi.last_audited) sourceBlock.append(make('p', 'muted-copy', `Last audited (dataset field): ${poi.last_audited}`));
    content.append(sourceBlock);
    const nearby = make('section', 'detail-block'); nearby.append(make('h2', 'subsection-title', 'Nearby attractions'));
    nearby.append(make('p', 'muted-copy', 'Nearby attraction relationships are not stored in the current dataset.')); content.append(nearby);
    const actions = make('div', 'detail-actions'); actions.append(Object.assign(make('a', 'detail-action primary', 'Plan a visit'), { href: '/#trip-planner' }));
    if (trip) actions.append(Object.assign(make('a', 'detail-action', 'Back to itinerary'), { href: '/itinerary' }));
    content.append(actions); root.append(hero, content);
  }).catch(error => {
    root.replaceChildren(make('section', 'empty-state', error.message));
    const action = make('a', 'detail-action primary', 'Browse the Gwalior guide'); action.href = '/#discover'; root.append(action);
  });
})();
