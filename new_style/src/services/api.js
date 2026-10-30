/**
 * Beyond the Fort — Frontend API Gateway Client
 * Handles authenticated cross-origin communication with the Railway Express backend.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let cachedCsrfToken = null;

export async function getCsrfToken(forceRefresh = false) {
  if (cachedCsrfToken && !forceRefresh) return cachedCsrfToken;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn('[API Client] Could not fetch CSRF token:', err);
  }
  return '';
}

export async function sendChatMessage(message, language = 'en', conversationId = null) {
  const convId = conversationId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`);
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ message, language, conversationId: convId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Chat service responded with ${res.status}`);
  }
  return await res.json();
}

export async function loginUser(email, password) {
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Login failed');
  }
  cachedCsrfToken = null;
  await getCsrfToken(true);
  return data;
}

export async function registerUser(email, password) {
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok || data.status !== 'success') {
    throw new Error(data.message || 'Registration failed');
  }
  cachedCsrfToken = null;
  await getCsrfToken(true);
  return data;
}

export async function logoutUser() {
  const csrf = await getCsrfToken();
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include'
  });
  cachedCsrfToken = null;
}

export async function planItinerary(payload) {
  const today = new Date().toISOString().slice(0, 10);
  const fullPayload = {
    city: 'Gwalior',
    date: today,
    start_time: '10:00',
    deadline: '18:00',
    available_minutes: 240,
    transport_mode: 'cab',
    companion: 'solo',
    ...payload
  };
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/tourism-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify(fullPayload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errors?.join('; ') || 'Itinerary generation failed');
  }
  return data;
}

export async function fetchCuratedPOIs() {
  const res = await fetch(`${API_BASE_URL}/api/v1/pois`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Could not fetch POIs');
  return await res.json();
}

export async function fetchAttractionById(id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/attractions/${encodeURIComponent(id)}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Attraction not found');
  return await res.json();
}

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/ready`, {
    method: 'GET',
    credentials: 'include'
  });
  return await res.json();
}
