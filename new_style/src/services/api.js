/**
 * Beyond the Fort — Frontend API Gateway Client
 * Handles authenticated cross-origin communication with the Railway Express backend.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let cachedCsrfToken = null;

export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
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

export async function sendChatMessage(message, language = 'en') {
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ message, language })
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
  const csrf = await getCsrfToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/tourism-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {})
    },
    credentials: 'include',
    body: JSON.stringify(payload)
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

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/ready`, {
    method: 'GET',
    credentials: 'include'
  });
  return await res.json();
}
