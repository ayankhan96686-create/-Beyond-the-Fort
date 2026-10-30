(() => {
  const readCookie = name => document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=').slice(1).join('=');
  const csrf = () => decodeURIComponent(readCookie('beyond_fort_csrf') || '');
  const translated = (key, fallback, values) => { const text = window.BeyondI18n?.t(key, values); return text && text !== key ? text : fallback; };
  const messageFor = result => {
    const key = `auth.errors.${result.code}`; const text = translated(key, '');
    return text && text !== key ? text : result.message || translated('auth.genericError', 'Unable to complete your request. Please try again.');
  };
  const send = (url, method, body) => fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf() }, body: body ? JSON.stringify(body) : undefined });
  const form = document.querySelector('#authForm');
  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#authMessage'); message.textContent = '';
    const data = new FormData(form); const mode = form.dataset.mode;
    try {
      const response = await send(`/api/auth/${mode}`, 'POST', { email: data.get('email'), password: data.get('password') });
      const result = await response.json();
      if (!response.ok) throw new Error(messageFor(result));
      const requested = new URLSearchParams(location.search).get('returnTo');
      const next = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/account';
      location.assign(next);
    } catch (error) { message.textContent = error.message; }
  });
  const profile = document.querySelector('#profileForm');
  if (profile) fetch('/api/auth/me', { credentials: 'same-origin' }).then(r => r.json()).then(({ user }) => { if (user) profile.elements.email.value = user.email; });
  const savedRoot = document.querySelector('#savedItineraries');
  if (savedRoot) fetch('/api/itineraries', { credentials: 'same-origin' }).then(r => r.json()).then(({ data = [] }) => {
    savedRoot.replaceChildren();
    if (!data.length) { savedRoot.textContent = translated('auth.emptyPlans', 'No saved itineraries yet. Build a feasible plan to save it here.'); return; }
    for (const item of data) {
      const card = document.createElement('article'); card.className = 'saved-plan-card';
      const heading = document.createElement('h3'); heading.textContent = item.request?.query || translated('auth.planTitle', 'Gwalior visit');
      const detail = document.createElement('p'); detail.textContent = translated('auth.planStops', `${item.itinerary?.itinerary_stops?.length || 0} stops · ${new Date(item.createdAt).toLocaleDateString()}`, { count: item.itinerary?.itinerary_stops?.length || 0, date: new Date(item.createdAt).toLocaleDateString() });
      const open = document.createElement('button'); open.type = 'button'; open.textContent = translated('auth.openPlan', 'Open plan'); open.addEventListener('click', () => { sessionStorage.setItem('beyondFortActiveUser', document.body.dataset.userId || 'guest'); sessionStorage.setItem('beyondFortSavedPlanId', item.id); sessionStorage.setItem('beyondFortTrip', JSON.stringify({ request: item.request, itinerary: item.itinerary })); location.assign('/itinerary'); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = translated('auth.deletePlan', 'Delete'); remove.addEventListener('click', async () => { const response = await fetch(`/api/itineraries/${encodeURIComponent(item.id)}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrf() } }); if (response.ok) card.remove(); });
      card.append(heading, detail, open, remove); savedRoot.append(card);
    }
  }).catch(() => { savedRoot.textContent = translated('auth.plansUnavailable', 'Saved itineraries are temporarily unavailable.'); });
  if (profile) profile.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#profileMessage');
    try { const response = await send('/api/auth/profile', 'PATCH', { email: profile.elements.email.value }); const result = await response.json(); if (!response.ok) throw new Error(messageFor(result)); message.textContent = translated('auth.emailUpdated', 'Email updated.'); message.classList.add('success'); }
    catch (error) { message.textContent = error.message; message.classList.remove('success'); }
  });
  document.querySelector('#logoutButton')?.addEventListener('click', async () => { await send('/api/auth/logout', 'POST'); sessionStorage.removeItem('beyondFortActiveUser'); sessionStorage.removeItem('beyondFortTrip'); sessionStorage.removeItem('beyondFortPreferences'); sessionStorage.removeItem('beyondFortSavedPlanId'); location.assign('/'); });
})();
