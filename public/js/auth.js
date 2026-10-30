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

  const forgotForm = document.querySelector('#forgotForm');
  if (forgotForm) forgotForm.addEventListener('submit', async event => {
    event.preventDefault();
    const msg = document.querySelector('#forgotMessage');
    const submitBtn = document.querySelector('#forgotSubmit');
    msg.textContent = '';
    msg.className = 'auth-message';
    const email = forgotForm.elements.email.value.trim();
    if (!email) { msg.textContent = 'Please enter your email address.'; return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    try {
      const res = await send('/api/auth/forgot-password', 'POST', { email });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || messageFor(result));
      msg.textContent = result.message;
      msg.className = 'auth-message success';
      forgotForm.elements.email.disabled = true;
      submitBtn.style.display = 'none';
    } catch (err) {
      msg.textContent = err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  });

  const resetForm = document.querySelector('#resetForm');
  if (resetForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token') || resetForm.dataset.token || '';
    if (!tokenFromUrl) {
      const msg = document.querySelector('#resetMessage');
      if (msg) msg.textContent = 'Missing reset token. Please use the link provided in your email.';
      const btn = document.querySelector('#resetSubmit');
      if (btn) btn.disabled = true;
    }
    resetForm.addEventListener('submit', async event => {
      event.preventDefault();
      const msg = document.querySelector('#resetMessage');
      const submitBtn = document.querySelector('#resetSubmit');
      msg.textContent = '';
      msg.className = 'auth-message';
      const token = resetForm.elements.token.value || tokenFromUrl;
      const password = resetForm.elements.password.value;
      const confirm = resetForm.elements.confirmPassword.value;
      if (!token) { msg.textContent = 'Missing or invalid reset token.'; return; }
      if (password !== confirm) { msg.textContent = 'Passwords do not match.'; return; }
      if (password.length < 12) { msg.textContent = 'Password must be at least 12 characters long.'; return; }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';
      try {
        const res = await send('/api/auth/reset-password', 'POST', { token, password });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || messageFor(result));
        msg.textContent = result.message || 'Password reset successfully! Redirecting to sign in...';
        msg.className = 'auth-message success';
        setTimeout(() => location.assign('/login'), 2500);
      } catch (err) {
        msg.textContent = err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Password';
      }
    });
  }
})();
