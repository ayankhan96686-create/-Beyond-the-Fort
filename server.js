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

const app = express();

// Middleware
const allowedFrontendOrigins = new Set((process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(origin => origin.trim()).filter(Boolean));
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (allowedFrontendOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const tourismWorkflowService = require('./services/tourismWorkflowService');

// Web Routes
app.get('/', (req, res) => feasibilityController.renderHome(req, res));
app.post('/search', (req, res) => feasibilityController.renderSearch(req, res));
app.get('/itinerary', (req, res) => res.render('itinerary', { title: 'Your Itinerary | Beyond the Fort' }));
app.get('/chat', (req, res) => res.render('chat', { title: 'Tansen AI | Beyond the Fort' }));
app.get('/attractions/:id', (req, res) => res.render('attraction', { title: 'Attraction Details | Beyond the Fort', attractionId: req.params.id }));

// Tourism planning REST endpoints
app.post('/tourism-plan', async (req, res) => {
  const result = await tourismWorkflowService.executeWorkflow(req.body);
  const { statusCode, ...body } = result;
  return res.status(statusCode || 200).json(body);
});
app.post('/api/v1/tourism-plan', async (req, res) => {
  const result = await tourismWorkflowService.executeWorkflow(req.body);
  const { statusCode, ...body } = result;
  return res.status(statusCode || 200).json(body);
});

// REST API Endpoints
app.post('/api/v1/feasibility/search', (req, res) => feasibilityController.searchApi(req, res));
app.post('/api/v1/intent/parse', (req, res) => intentController.parseIntentApi(req, res));
app.post('/api/chat', async (req, res) => {
  try { return await chatService.send(req, res); }
  catch (error) {
    console.error(JSON.stringify({ event: 'chat.request_failed', error_type: error?.name || 'Error' }));
    return res.status(503).json({ status: 'provider_error', message: 'The tourism service could not complete that request. Please try again.' });
  }
});
app.post('/api/chat/reset', (req, res) => chatService.reset(req, res));

// Data Inspection Endpoint
app.get('/api/v1/pois', (req, res) => {
  res.json({
    status: 'success',
    count: db.getAllPOIs().length,
    data: db.getAllPOIs()
  });
});
app.get('/api/v1/attractions/:id', (req, res) => {
  const attraction = db.getAllPOIs().find(poi => poi.id === req.params.id);
  if (!attraction) return res.status(404).json({ status: 'not_found', message: 'This attraction is not in the curated Gwalior dataset.' });
  return res.json({ status: 'success', data: attraction });
});

// Health check
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
    app.listen(config.port, process.env.HOST || '127.0.0.1', () => {
      console.log(`=======================================================`);
      console.log(`  Team Venator: Time-Aware Digital Discoverability`);
      console.log(`  AI Synergy Hackathon 2026 • Round 1`);
      console.log(`  Server listening on http://localhost:${config.port}`);
      console.log(`=======================================================`);
    });
  });
}

module.exports = app;
