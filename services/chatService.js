const crypto = require('crypto');
const db = require('../config/db');
const gemini = require('./geminiService');
const planner = require('./tourismWorkflowService');

const sessions = new Map();
const MAX_MESSAGE = 2000;
const SESSION_TTL = 12 * 60 * 60 * 1000;
const MAX_SESSIONS = 10000;
const CHAT_COOKIE = 'beyond_fort_chat';
const PLAN_INTENT = /\b(plan|itinerary|route|routing|visit order|return to|return by|back by|trip|tour|schedule|deadline)\b|\b(ghante|ghanta|waapas|wapas|yatra)\b/i;

function getSession(req, res) {
  const now = Date.now();
  for (const [key, value] of sessions) if (now - value.touchedAt > SESSION_TTL) sessions.delete(key);
  const cookie = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${CHAT_COOKIE}=`));
  let id = cookie?.slice(`${CHAT_COOKIE}=`.length);
  if (!id || !sessions.has(id)) id = crypto.randomBytes(24).toString('hex');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const existingCookies = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(Array.isArray(existingCookies) ? existingCookies : existingCookies ? [existingCookies] : []), `${CHAT_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secure}`]);
  let session = sessions.get(id);
  if (!session || now - session.touchedAt > SESSION_TTL) session = { conversations: new Map() };
  session.touchedAt = now; sessions.set(id, session);
  while (sessions.size > MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
  return session;
}

function isPlanningRequest(message, explicitPlan = false) { return explicitPlan === true || PLAN_INTENT.test(message); }

async function send(req, res) {
  const body = req.body || {};
  const message = body.message;
  if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ status: 'error', message: 'Enter a message to continue.' });
  if (message.length > MAX_MESSAGE) return res.status(413).json({ status: 'error', message: `Messages must be ${MAX_MESSAGE} characters or fewer.` });
  const conversationId = typeof body.conversationId === 'string' && /^[\w-]{1,80}$/.test(body.conversationId) ? body.conversationId : null;
  if (!conversationId) return res.status(400).json({ status: 'error', message: 'Start a new conversation and try again.' });
  if (isPlanningRequest(message, body.intent === 'plan') && !req.auth?.user) return res.status(401).json({ status: 'error', code: 'AUTH_REQUIRED', message: 'Sign in to generate a personalized itinerary.' });
  const session = getSession(req, res);
  const history = session.conversations.get(conversationId) || [];
  const userMessage = message.trim();
  const locale = typeof body.locale === 'string' && /^[a-z]{2,3}$/i.test(body.locale) ? body.locale.toLowerCase() : 'en';
  if (isPlanningRequest(userMessage, body.intent === 'plan')) {
    const rawTrip = body.trip && typeof body.trip === 'object' && !Array.isArray(body.trip) ? body.trip : {};
    const result = await planner.executeWorkflow({ ...rawTrip, query: userMessage, user_query: userMessage, interests: rawTrip.interests || [userMessage] });
    const reply = result.status === 'feasible'
      ? 'I prepared this itinerary using the tourism planner. Review the stops, evidence, and route estimates below.'
      : result.status === 'infeasible' ? 'The planner could not fit a verified route within those constraints.'
        : result.status === 'needs_input' ? `I need a few more trip details before I can check feasibility: ${(result.missing_fields || []).join(', ')}.`
          : 'The tourism planning service is unavailable. Please try again later.';
    history.push({ role: 'user', text: userMessage }, { role: 'assistant', text: reply });
    session.conversations.set(conversationId, history.slice(-20));
    return res.status(result.status === 'provider_error' ? 503 : 200).json({ status: result.status || 'success', conversationId, reply, result: ['feasible', 'infeasible', 'needs_input'].includes(result.status) ? result : null, actions: result.status === 'feasible' ? { itinerary: '/itinerary', map: '/itinerary#tripMap' } : {} });
  }
  try {
    const reply = await gemini.answerTourismQuestion(userMessage, db.getAllPOIs(), history, locale);
    history.push({ role: 'user', text: userMessage }, { role: 'assistant', text: reply });
    session.conversations.set(conversationId, history.slice(-20));
    return res.json({ status: 'success', conversationId, reply, suggestions: ['What heritage places are in the dataset?', 'Plan a visit to Gwalior Fort', 'What are the entry fees?'] });
  } catch (error) {
    const timeoutMs = Number.parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 60000;
    const timedOut = /timeout|timed out|abort/i.test(String(error?.message || ''));
    console.warn(JSON.stringify({ event: 'chat.provider_error', provider: 'gemini', error_type: error?.name || 'ProviderError', reason: timedOut ? 'timeout' : 'provider_error' }));
    const message = timedOut
      ? `Gemini did not respond within ${Math.ceil(timeoutMs / 1000)} seconds. Try again in a moment.`
      : 'The tourism assistant is temporarily unavailable because Gemini could not respond. Please try again later.';
    return res.status(503).json({ status: 'provider_error', conversationId, message });
  }
}

function reset(req, res) {
  const session = getSession(req, res);
  const id = req.body?.conversationId;
  if (typeof id === 'string') session.conversations.delete(id);
  return res.json({ status: 'success' });
}

module.exports = { send, reset, isPlanningRequest, _sessions: sessions };
