/**
 * Time-Aware Digital Discoverability - Beyond the Fort
 * Team Venator (ID: 60358412) | AI Synergy Hackathon 2026
 *
 * Express Application Server
 */

const express = require('express');
const path = require('path');
const config = require('./config/env');
const db = require('./config/db');
const feasibilityController = require('./controllers/feasibilityController');
const intentController = require('./controllers/intentController');
const chatService = require('./services/chatService');
const auth = require('./services/authService');
const rateLimit = require('./middleware/rateLimit');
const itineraryStore = require('./services/itineraryStore');

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') {
  if (config.langgraphServiceToken.length < 32) throw new Error('LANGGRAPH_SERVICE_TOKEN must contain at least 32 characters in production.');
  if (!process.env.AUTH_USERS_FILE) process.env.AUTH_USERS_FILE = path.join(__dirname, 'data', '.auth-users.json');
  if (!process.env.SAVED_ITINERARIES_FILE) process.env.SAVED_ITINERARIES_FILE = path.join(__dirname, 'data', '.saved-itineraries.json');
}
const proxyHops = process.env.TRUST_PROXY_HOPS ? Number(process.env.TRUST_PROXY_HOPS) : 0;
if (!Number.isInteger(proxyHops) || proxyHops < 0 || proxyHops > 5) throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 5.');
app.set('trust proxy', proxyHops || false);
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: process.env.NODE_ENV === 'test' ? 1000 : 10, key: req => `${req.ip}:auth` });
const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });
const aiLimiter = rateLimit({ windowMs: 60_000, max: 10 });

// Middleware
const configuredOrigins = process.env.FRONTEND_ORIGINS;
if (process.env.NODE_ENV === 'production' && configuredOrigins?.split(',').some(x => x.trim() === '*')) throw new Error('Wildcard FRONTEND_ORIGINS is not permitted in production.');
const allowedFrontendOrigins = new Set((configuredOrigins ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173,http://127.0.0.1:5173')).split(',').map(origin => origin.trim()).filter(Boolean));
for (const origin of allowedFrontendOrigins) {
  let parsed;
  try { parsed = new URL(origin); } catch { throw new Error('FRONTEND_ORIGINS must contain valid origins only.'); }
  if (parsed.origin !== origin || (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:')) throw new Error('FRONTEND_ORIGINS must contain exact HTTPS origins in production.');
}
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  const requestOrigin = req.headers.origin;
  if (allowedFrontendOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return requestOrigin && !allowedFrontendOrigins.has(requestOrigin) ? res.sendStatus(403) : res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  const savedPlanWrite = /^\/api\/itineraries(?:\/|$)/.test(req.path) && ['POST', 'PUT'].includes(req.method);
  return express.json({ limit: savedPlanWrite ? '256kb' : '16kb' })(req, res, next);
});
app.use(express.urlencoded({ extended: false, limit: '16kb', parameterLimit: 100 }));
app.use(auth.sessionMiddleware);
app.use(auth.csrfProtection);
app.use((req, res, next) => { res.locals.currentUser = req.auth.user || null; next(); });

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const tourismWorkflowService = require('./services/tourismWorkflowService');

// Web Routes
app.get('/', (req, res) => feasibilityController.renderHome(req, res));
app.post('/search', auth.requireUser, aiLimiter, (req, res) => feasibilityController.renderSearch(req, res));
const requirePageUser = (req, res, next) => req.auth.user ? next() : res.redirect(`/login?returnTo=${encodeURIComponent(req.path)}`);
const requirePageAdmin = (req, res, next) => !req.auth.user ? res.redirect('/login?returnTo=%2Fadmin') : req.auth.role === 'administrator' ? next() : res.status(403).render('unauthorized', { title: 'Access denied | Beyond the Fort' });
app.get('/itinerary', requirePageUser, (req, res) => res.render('itinerary', { title: 'Your Itinerary | Beyond the Fort' }));
app.get('/chat', (req, res) => res.render('chat', { title: 'Tansen AI | Beyond the Fort' }));
app.get('/attractions/:id', (req, res) => res.render('attraction', { title: 'Attraction Details | Beyond the Fort', attractionId: req.params.id }));

app.get('/login', (req, res) => res.render('auth', { title: 'Sign in | Beyond the Fort', mode: 'login' }));
app.get('/register', (req, res) => res.render('auth', { title: 'Create account | Beyond the Fort', mode: 'register' }));
app.get('/forgot-password', (req, res) => res.render('forgot-password', { title: 'Forgot Password | Beyond the Fort' }));
app.get('/reset-password', (req, res) => res.render('reset-password', { title: 'Reset Password | Beyond the Fort', token: req.query.token || '' }));
app.get('/account', requirePageUser, (req, res) => res.render('account', { title: 'Your account | Beyond the Fort' }));
app.get('/admin', requirePageAdmin, (req, res) => res.render('admin', { title: 'Administration | Beyond the Fort' }));
app.get('/api/auth/csrf', (req, res) => res.json({ csrfToken: req.auth.csrf }));
app.post('/api/auth/register', authLimiter, async (req, res) => {
  if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string') return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
  try {
    const result = await auth.register(req.body.email, req.body.password);
    if (result.error) return res.status(400).json({ status: 'error', code: result.code, message: result.error });
    auth.login(req, res, result.user);
    return res.status(201).json({ status: 'success', user: result.user });
  } catch (error) {
    console.error(JSON.stringify({ event: 'auth.register_failed', error_type: error?.name || 'Error' }));
    return res.status(503).json({ status: 'error', message: 'Account service is unavailable.' });
  }
});
app.post('/api/auth/login', authLimiter, async (req, res) => {
  if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string' || req.body.password.length > 128) return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
  try {
    const user = await auth.authenticate(req.body.email, req.body.password);
    if (user?.error === 'AUTH_ACCOUNT_LOCKED') return res.status(429).json({ status: 'error', code: 'AUTH_ACCOUNT_LOCKED', message: user.message });
    if (!user) return res.status(401).json({ status: 'error', code: 'AUTH_INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
    auth.login(req, res, user);
    return res.json({ status: 'success', user });
  } catch (error) {
    console.error(JSON.stringify({ event: 'auth.login_failed', error_type: error?.name || 'Error' }));
    return res.status(503).json({ status: 'error', message: 'Account service is unavailable.' });
  }
});
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  if (!email.trim()) return res.status(400).json({ status: 'error', message: 'Email address is required.' });
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  const result = await auth.requestPasswordReset(email, hostUrl);
  if (result.error) return res.status(result.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 400).json({ status: 'error', code: result.code, message: result.error });
  return res.json({ status: 'success', message: result.message });
});
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || typeof password !== 'string') return res.status(400).json({ status: 'error', message: 'Token and new password are required.' });
  const result = await auth.resetPassword(token, password);
  if (result.error) return res.status(400).json({ status: 'error', code: result.code, message: result.error });
  return res.json({ status: 'success', message: result.message });
});
app.post('/api/auth/logout', (req, res) => { auth.logout(req, res); res.json({ status: 'success' }); });
app.get('/api/auth/me', (req, res) => res.json({ status: 'success', user: req.auth.user || null }));
app.get('/api/itineraries', auth.requireUser, (req, res) => res.json({ status: 'success', data: itineraryStore.list(req.auth.user.id).map(({ id, createdAt, request, itinerary }) => ({ id, createdAt, request, itinerary })) }));
app.get('/api/itineraries/:id', auth.requireUser, apiLimiter, (req, res) => {
  const plan = itineraryStore.get(req.auth.user.id, req.params.id);
  if (!plan) return res.status(404).json({ status: 'error', message: 'Saved plan not found.' });
  const { userId, ...saved } = plan;
  return res.json({ status: 'success', data: saved });
});
app.post('/api/itineraries', auth.requireUser, apiLimiter, (req, res) => {
  const result = itineraryStore.create(req.auth.user.id, req.body?.itinerary, req.body?.request);
  if (result.error) return res.status(400).json({ status: 'error', code: result.code, message: result.error });
  const { userId, ...saved } = result.saved;
  return res.status(201).json({ status: 'success', data: saved });
});
app.put('/api/itineraries/:id', auth.requireUser, apiLimiter, (req, res) => {
  const result = itineraryStore.update(req.auth.user.id, req.params.id, req.body?.itinerary, req.body?.request);
  if (result.error) return res.status(400).json({ status: 'error', code: result.code, message: result.error });
  if (result.notFound) return res.status(404).json({ status: 'error', message: 'Saved plan not found.' });
  const { userId, ...saved } = result.saved;
  return res.json({ status: 'success', data: saved });
});
app.delete('/api/itineraries/:id', auth.requireUser, (req, res) => itineraryStore.remove(req.auth.user.id, req.params.id)
  ? res.json({ status: 'success' }) : res.status(404).json({ status: 'error', message: 'Saved plan not found.' }));
app.patch('/api/auth/profile', auth.requireUser, apiLimiter, (req, res) => {
  if (Object.hasOwn(req.body || {}, 'role') || Object.hasOwn(req.body || {}, 'status')) return res.status(400).json({ status: 'error', message: 'Account roles and status cannot be changed here.' });
  const result = auth.updateProfile(req.auth.user.id, req.body?.email);
  if (result.error) return res.status(400).json({ status: 'error', code: result.code, message: result.error });
  return res.json({ status: 'success', user: result.user });
});
app.get('/api/admin/users', auth.requireAdmin, apiLimiter, (_req, res) => res.json({ status: 'success', data: auth._loadUsers().map(({ id, email, role, status, createdAt }) => ({ id, email, role, status, createdAt })) }));
app.patch('/api/admin/users/:id/role', auth.requireAdmin, apiLimiter, (req, res) => {
  if (req.body?.role === 'user' && req.params.id === req.auth.user.id) return res.status(400).json({ status: 'error', message: 'Administrators cannot remove their own administrator access.' });
  const user = auth.setRole(req.params.id, req.body?.role);
  if (user === false) return res.status(503).json({ status: 'error', message: 'Account service is unavailable.' });
  if (!user) return res.status(400).json({ status: 'error', message: 'Account not found or role is invalid.' });
  return res.json({ status: 'success', user });
});

// Tourism planning REST endpoints
app.post('/tourism-plan', auth.requireUser, aiLimiter, async (req, res) => {
  const result = await tourismWorkflowService.executeWorkflow(req.body);
  const { statusCode, ...body } = result;
  return res.status(statusCode || 200).json(body);
});
app.post('/api/v1/tourism-plan', auth.requireUser, aiLimiter, async (req, res) => {
  const result = await tourismWorkflowService.executeWorkflow(req.body);
  const { statusCode, ...body } = result;
  return res.status(statusCode || 200).json(body);
});

// REST API Endpoints
app.post('/api/v1/feasibility/search', auth.requireUser, apiLimiter, (req, res) => feasibilityController.searchApi(req, res));
app.post('/api/v1/intent/parse', aiLimiter, (req, res) => intentController.parseIntentApi(req, res));
app.post('/api/chat', aiLimiter, async (req, res) => {
  try { return await chatService.send(req, res); }
  catch (error) {
    console.error(JSON.stringify({ event: 'chat.request_failed', error_type: error?.name || 'Error' }));
    return res.status(503).json({ status: 'provider_error', message: 'The tourism service could not complete that request. Please try again.' });
  }
});
app.post('/api/chat/reset', aiLimiter, (req, res) => chatService.reset(req, res));

// Data Inspection Endpoint
app.get('/api/v1/pois', apiLimiter, (req, res) => {
  res.json({
    status: 'success',
    count: db.getAllPOIs().length,
    data: db.getAllPOIs()
  });
});
app.get('/api/v1/attractions/:id', apiLimiter, (req, res) => {
  const attraction = db.getAllPOIs().find(poi => poi.id === req.params.id);
  if (!attraction) return res.status(404).json({ status: 'not_found', message: 'This attraction is not in the curated Gwalior dataset.' });
  return res.json({ status: 'success', data: attraction });
});

// Health check

// Readiness check (distinguishing liveness, database connectivity, and AI configuration)
app.get('/ready', (req, res) => {
  const geminiConfigured = Boolean(config.geminiApiKey);
  const poiCount = db.getAllPOIs().length;
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'healthy', count: poiCount, source: 'MongoDB Atlas / Curated Cache' },
      ai_provider: { status: geminiConfigured ? 'available' : 'fallback_mode', primary_model: process.env.GEMINI_MODEL || 'gemini-3.5-flash' },
      planner: { status: 'configured', target: config.langgraphApiUrl }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    team: 'Team Venator (ID: 60358412)',
    pilot: 'Gwalior Beyond the Fort (Theme 04)',
    service: 'Time-Aware Feasibility Engine'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = Number.isInteger(err?.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  const errorType = typeof err?.name === 'string' ? err.name : 'Error';
  console.error(JSON.stringify({ event: 'http.error', error_type: errorType, status_code: statusCode }));
  res.status(statusCode).json({
    status: 'error',
    message: statusCode < 500 ? 'Invalid request body.' : 'Internal Server Error'
  });
});

// Start Server
if (require.main === module) {
  db.connect().then(() => {
    // Bind locally over IPv4 so the server can coexist with services bound to
    // the IPv6 wildcard address and remains reachable at localhost on Windows.
    const listenHost = process.env.HOST || (process.env.PORT || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
    app.listen(config.port, listenHost, () => {
      console.log(`=======================================================`);
      console.log(`  Team Venator: Time-Aware Digital Discoverability`);
      console.log(`  AI Synergy Hackathon 2026 • Round 1`);
      console.log(`  Server listening on http://localhost:${config.port}`);
      console.log(`=======================================================`);
    });
  });
}

module.exports = app;
